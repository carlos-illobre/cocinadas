# Despliegue

Una VM de Oracle Cloud (Always Free) con Docker, el mismo `docker-compose.yml` que en
desarrollo, y **una** imagen construida por el CI y publicada en GHCR etiquetada por SHA
de commit (ADR-011). Todo lo específico vive en `deployment/oracle-single/`.

Lo que corre en la instancia son **dos contenedores, y uno es optativo**:

| Servicio | Qué es | ¿Siempre? |
|---|---|---|
| `web` | La aplicación: Caddy sirviendo el bundle con el catálogo adentro (ADR-015). Habla HTTP y no sabe por qué dominio la llamaron. | Sí |
| `proxy` | El reverse proxy **de la máquina**, no de esta aplicación (ADR-016): ata el 80 y el 443, emite el TLS y reparte por dominio entre esta app y las demás que haya en la VM. | Solo con `COMPOSE_PROFILES=proxy` |

No hay base de datos ni broker, así que **en el servidor no hay nada que respaldar**: las
cocinadas viven en el teléfono de cada persona.

> La guía paso a paso de la instancia (crearla, conectarse, Security List, DNS,
> certificado) se genera con la skill `desplegar-en-oracle-cloud` como `ORACLE.md` en
> esa carpeta. Esta página describe la arquitectura del despliegue y la operación.

## Dominio y TLS

- Dominio: `cocinadas.duckdns.org`, apuntado a la IP pública de la instancia.
- TLS: Caddy pide el certificado a Let's Encrypt por HTTP-01 la primera vez que arranca
  con `SITE_ADDRESS=cocinadas.duckdns.org`, y lo renueva solo (ADR-009). Para que la
  emisión funcione: **abrir 80 y 443 en la Security List → apuntar el DNS → esperar a que
  `dig +short cocinadas.duckdns.org` devuelva la IP → recién entonces levantar el proxy.**
  Emitir antes quema uno de los pocos intentos por hora que Let's Encrypt permite.
- Los certificados viven en el volumen `caddy-datos`.

## Puertos

Adentro del contenedor los puertos no cambian nunca. Del lado del host los decide el
`.env`, para poder convivir con otra aplicación en la misma máquina.

| Variable | Valor por omisión | Quién | Desde dónde |
|---|---|---|---|
| `PUERTO_HTTP`, `PUERTO_HTTPS` | 80, 443 (TCP y UDP) | `proxy` | La interfaz que diga `PROXY_ADDR`. **Los únicos que se abren en la Security List.** |
| `PUERTO_APP` | 8180 | `web` | La interfaz que diga `APP_ADDR`, que es `0.0.0.0` para que el proxy lo alcance desde su contenedor. **No se abre en la Security List**, que es lo que lo mantiene fuera de internet. |
| — | 8081 | los dos | Solo desde adentro de cada contenedor: es el sitio de salud contra el que pegan el healthcheck del compose y `deploy.py`. No se publica. |

Los puertos que publica Docker no pasan por la cadena `INPUT` de iptables: `ufw` no
los protege. Lo que decide qué está abierto es la Security List de la VCN.

## Varias aplicaciones en la misma VM

**El 80 y el 443 son de una sola aplicación**: el navegador no elige puerto. Por eso quien
los ata no es ninguna de las aplicaciones sino el `proxy`, que es una pieza de la máquina
(ADR-016). Cada aplicación es un inquilino que escucha en un puerto alto y se olvida del
TLS.

```
cocinadas.duckdns.org  ─┐
citypass.duckdns.org   ─┼─→  proxy (80/443)  ─→  web (red interna)      cocinadas
loquevenga.duckdns.org ─┘                     ─→  host:8181             citypass
                                              ─→  host:8182             la próxima
```

### Agregar una aplicación

Su bloque va en `infrastructure/proxy/vecinos/<nombre>.caddy` **en la VM**:

```caddy
citypass.duckdns.org {
	reverse_proxy host.docker.internal:8181
}
```

y `docker compose restart proxy`. Eso es todo: no se toca el compose ni el Caddyfile.

**`host.docker.internal` y no `127.0.0.1`**: el proxy corre adentro de un contenedor, así
que `127.0.0.1` sería su propio loopback. El compose le da ese nombre con
`extra_hosts: host-gateway`. Por eso el vecino tiene que publicar su puerto en `0.0.0.0` y
no en `127.0.0.1`, y por eso ese puerto **no** se abre en la Security List.

Del lado del vecino: mover sus `80:80` y `443:443` a un puerto alto, y apagar su certbot
—el TLS lo hace Caddy para todos los dominios—. Si publica algo que no es HTTP (por
ejemplo Kafka en el 9092), eso sigue publicándolo él directo: el proxy no lo toca.

Ese archivo **no se versiona acá**: la configuración de una aplicación es de esa
aplicación. Ver `infrastructure/proxy/vecinos/README.md`. `deploy.py` crea el directorio y
nunca pisa su contenido.

### Si el 80 y el 443 los tiene otra cosa

Un balanceador de la nube, o el proxy de otra aplicación que no se puede mover. Entonces
Cocinadas no levanta proxy: en su `.env`,

```
COMPOSE_PROFILES=
```

y la aplicación sigue atendiendo en `APP_ADDR:PUERTO_APP`, que es a donde esa otra cosa le
manda el tráfico. No hay que tocar nada más.

**Ojo**: apagar el perfil no baja un proxy que ya estaba corriendo —`--remove-orphans` no
alcanza, ver más abajo—. `deploy.py` lo resuelve; a mano es
`docker compose rm -sf proxy`.

Para ver qué puertos están tomados en la máquina:

```bash
sudo ss -lntp
```

## Los dos `.env` de un despliegue

| Archivo | Dónde | Qué tiene | Plantilla |
|---|---|---|---|
| `.env` de la **aplicación** | `RUTA_REMOTA/.env` en la VM | Las 15 variables del compose con valores de producción, más `COMPOSE_PROFILES`; `deploy.py` solo le cambia `TAG`. Ninguna es un secreto: no hay base ni tokens que firmar. | `deployment/oracle-single/.env.oracle` |
| `.env` del **despliegue** | `deployment/oracle-single/.env` en tu máquina | `SSH` y `RUTA_REMOTA`: cómo llegar a la VM. | `deployment/oracle-single/.env.deploy.example` |

Los dos están en el `.gitignore`. `tests/integration/paridad-env.sh` comprueba que cada
uno declare exactamente lo que su plantilla.

## Primer despliegue

1. `python deployment/oracle-single/deploy.py --preflight` desde tu máquina: verifica
   memoria, disco, Docker, puertos y firewall en la instancia, sin tocar nada.
2. En la VM: `mkdir -p ~/cocinadas && cd ~/cocinadas`, copiar `.env.oracle` como `.env` y
   completar los marcadores (`REGISTRO` y `TAG`). Si en la máquina ya hay otra aplicación
   con el 80 y el 443, decidir acá si se los queda ella (`COMPOSE_PROFILES=`) o si pasan a
   este proxy (ver «Varias aplicaciones en la misma VM»).
3. En tu máquina: copiar `.env.deploy.example` a `deployment/oracle-single/.env` y
   completar `SSH` y `RUTA_REMOTA`.
4. Mergear a `main`: el CI publica la imagen y despliega solo. Si hace falta a mano:
   `python deployment/oracle-single/deploy.py`.

## Despliegue automático al mergear a main

El job `desplegar` del CI corre `deploy.py` con el SHA del commit, después de que el job
`imagen` publicó la imagen. Un despliegue por vez y solo desde `main`.

Todo merge a `main` —con commit de merge o con squash— es un push a `main`, así que **cada
merge se despliega solo, sin apretar nada**. La cadena es `pruebas → imagen → desplegar`:
si la compuerta del 100 % o la paridad de `.env` fallan, no se publica la imagen y no se
despliega.

Hace falta cargar cuatro secretos en **Settings → Secrets and variables → Actions** del
repositorio:

| Secreto | Qué es | Cómo se obtiene |
|---|---|---|
| `SSH_DESTINO` | `usuario@ip-publica` de la instancia | Es el mismo valor que `SSH` en el `.env` local del despliegue. |
| `RUTA_REMOTA` | Dónde vive el proyecto en la instancia | `/home/ubuntu/cocinadas`. |
| `SSH_CLAVE_PRIVADA` | Clave privada, entera, de una clave dedicada al CI | `ssh-keygen -t ed25519 -C cocinadas-ci -f cocinadas-ci` y pegar el contenido de `cocinadas-ci`. |
| `SSH_HOST_KEY` | La huella de la instancia | `ssh-keyscan -t ed25519 <IP_PUBLICA>` y pegar la línea que devuelve. |

Y una variable (no secreta) `DOMINIO` con `cocinadas.duckdns.org`, que es lo que el entorno
muestra como enlace del despliegue.

En la instancia, una sola vez:

```bash
cat cocinadas-ci.pub >> ~/.ssh/authorized_keys   # la PÚBLICA, no la privada
```

La clave del CI conviene que sea **dedicada**: si se filtra, se borra esa línea de
`authorized_keys` y no hay que rotar la clave personal.

**La huella se fija a mano** en vez de aceptar la que venga (`StrictHostKeyChecking=no`):
aceptar cualquiera es aceptar a quien se ponga en el medio.

**Ojo con el entorno `produccion`**: si en Settings → Environments → `produccion` hay
«Required reviewers», el despliegue deja de ser automático y queda esperando aprobación.
Para que corra solo en cada merge, ese entorno no tiene que tener revisores. (Si en algún
momento se quiere lo contrario, agregarlos ahí es todo lo que hace falta.)

**Qué tiene que estar abierto**: el CI entra por SSH desde los runners de GitHub, que no
tienen IP fija, así que el 22 de la instancia tiene que aceptar conexiones de internet.
Si eso no se quiere, las alternativas son un runner propio dentro de la VM o una red
privada tipo Tailscale; en los dos casos cambia solo este job, no el script.

## Despliegues siguientes y reversión

```bash
python deployment/oracle-single/deploy.py            # el último commit verificado de main
python deployment/oracle-single/deploy.py <sha>      # un commit concreto
python deployment/oracle-single/deploy.py <sha-anterior>   # volver atrás: es el mismo comando
python deployment/oracle-single/deploy.py --dry-run  # ver qué haría, sin tocar la VM
```

El script anota qué SHA había antes y lo imprime, así la reversión es copiar ese comando.
Da el despliegue por bueno con dos comprobaciones: que el sitio interno de salud conteste
—desde adentro del contenedor, porque en producción `SITE_ADDRESS` es el dominio y una
petición a `localhost` no coincidiría con ningún sitio de Caddy— y que la imagen traiga
`/srv/api/catalogo/recetas.json`, porque una imagen construida sin `data/` arrancaría
igual y serviría una app sin recetas. Si no contesta en dos minutos, muestra los logs y
dice cómo volver.

**Revertir revierte también las recetas**, porque el catálogo viaja dentro de la imagen
(ADR-006). Y no hay datos que puedan quedar desfasados: los dos volúmenes son del proxy y
guardan certificados.

**Lo que la reversión NO revierte** es el Caddyfile del proxy ni los vecinos: son archivos
que viven en la VM. Si un despliegue cambió el Caddyfile del proxy, volver a un SHA
anterior lo vuelve a copiar desde ese commit, pero los vecinos quedan como estaban —que es
lo correcto: son de otras aplicaciones.

### La trampa de los perfiles

`docker compose up -d --remove-orphans` **no baja** un servicio apagado por perfil:
`--remove-orphans` borra contenedores de servicios que ya no están en el compose, y un
servicio apagado por perfil sigue estando. O sea que sacar `proxy` de `COMPOSE_PROFILES`
no lo baja, y el proxy viejo se queda con el 80 y el 443 justo cuando querías dárselos a
otra aplicación.

`deploy.py` compara `docker compose config --services` (que respeta los perfiles y dice
qué debería correr) con `docker compose ps --services` (que dice qué corre) y baja la
diferencia. A mano es lo mismo:

```bash
docker compose ps --services | grep -vxF "$(docker compose config --services)" | xargs -r docker compose rm -sf
```

## Seguridad

El detalle y el porqué están en [ADR-014](adr/ADR-014-endurecimiento-antes-de-publicar.md).
Lo que hay puesto:

| Qué | Dónde se cambia |
|---|---|
| Techo del log por contenedor (hoy 1 MB) | `LOG_MAX_SIZE`, `LOG_MAX_FILES` |
| Techo de CPU por contenedor | `CPU_LIMIT_*` |
| Nivel de detalle del log de Caddy | `LOG_LEVEL` (`DEBUG`, `INFO`, `WARN`, `ERROR`) |
| Cabeceras de seguridad y política de contenido | `microservices/frontend/Caddyfile`, que viaja dentro de la imagen de la aplicación |
| TLS y reparto por dominio | `infrastructure/proxy/Caddyfile`, que se copia a la VM en el despliegue |
| Sin privilegios nuevos, sin capacidades, disco de solo lectura | `docker-compose.yml` |

Antes de publicar, en la VM:

- En la Security List de la VCN, abrir **solo el 80 y el 443**. `PUERTO_APP` no se abre
  nunca: es lo único que lo mantiene fuera de internet, porque los puertos que publica
  Docker no pasan por la cadena `INPUT` de iptables y `ufw` no los protege.

El `.env` de la instancia no tiene ningún secreto (no hay base ni tokens que firmar), así
que no hay nada que rotar ante un incidente. Lo que todavía no está cubierto es lo que
llega con las cuentas: hash de contraseñas, límite de intentos de login y vida del token.
El camino para agregarlo está en
[ADR-015](adr/ADR-015-de-cuatro-servicios-a-una-spa-estatica.md).

## Respaldo

**No hay nada que respaldar en el servidor.** Las cocinadas viven en el `localStorage` del
teléfono de cada persona y el catálogo viaja dentro de la imagen, reconstruible desde el
commit. Quedan dos volúmenes, y ninguno guarda datos de la aplicación:

| Volumen | Qué se pierde si se pierde | Urgencia |
|---|---|---|
| `caddy-datos` | Los certificados TLS del proxy. Se reemiten solos, con los límites de intentos de Let's Encrypt. | Opcional. |
| `caddy-config` | Configuración derivada de Caddy. Se regenera al arrancar. | No hace falta. |

Los dos son del `proxy`: con el perfil apagado, el proyecto no usa ninguno.

Si igual se quiere guardar los certificados para no reemitirlos, desde la VM:

```bash
docker run --rm -v cocinadas_caddy-datos:/d -v "$PWD:/b" alpine tar czf /b/caddy-datos.tgz -C /d .
```

`respaldo.sh` se borró junto con la base: no tenía qué copiar.

**Lo que sí está sin resolver es del lado del usuario**: sin exportar ni sincronizar, el
historial se pierde con el teléfono. Es exactamente lo que ADR-015 deja preparado para
revertir el día que haga falta.

## Disco

Cada despliegue deja una imagen. `deploy.py` corre `docker image prune -af --filter
until=24h` al final e informa cuánto liberó: sin `-a` no libera nada, porque las
imágenes etiquetadas por SHA nunca están «colgadas».

## Operación diaria

```bash
ssh <destino> 'cd ~/cocinadas && docker compose ps'                    # qué corre y con qué TAG
ssh <destino> 'cd ~/cocinadas && docker compose logs -f --tail 100 web proxy'
ssh <destino> 'docker stats --no-stream'                               # memoria
ssh <destino> 'df -h / && docker system df'                            # disco
ssh <destino> 'cd ~/cocinadas && docker compose restart proxy'   # tras tocar un vecino
```

## Límites del plan gratuito a tener presentes

Transferencia de salida con tope mensual; balanceador de capa 7 limitado a 10 Mbps (el
de capa 4, sin ese tope); el API Gateway no está en el plan gratuito; una instancia sin
actividad puede ser reclamada. Verificar los valores vigentes en la documentación de
Oracle antes de contar con ellos: cambian.
