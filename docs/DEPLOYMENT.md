# Despliegue

Una VM de Oracle Cloud (Always Free) con Docker, el mismo `docker-compose.yml` que en
desarrollo, y las imágenes construidas por el CI y publicadas en GHCR etiquetadas por
SHA de commit (ADR-011). Todo lo específico vive en `deployment/oracle-single/`.

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

Adentro de los contenedores los puertos no cambian nunca. Del lado del host los decide
el `.env`, para poder convivir con otra aplicación en la misma máquina.

| Variable | Valor por omisión | Quién | Desde dónde |
|---|---|---|---|
| `PUERTO_HTTP`, `PUERTO_HTTPS` | 80, 443 (TCP y UDP) | `reverse-proxy` | La interfaz que diga `PROXY_ADDR`. **Los únicos que se abren en la Security List.** |
| `PUERTO_CATALOGO`, `PUERTO_USUARIOS`, `PUERTO_COCINADAS`, `PUERTO_FRONTEND` | 3101, 3102, 3103, 8180 | catalogo, usuarios, cocinadas, frontend | Solo `127.0.0.1` de la VM (`PUBLISH_ADDR`). Los usa `deploy.py` para comprobar los `/health`. |
| — | 5432, 4222, 8222 | postgres, nats | Solo la red interna del compose. Para mirarlos: `docker compose exec` o túnel SSH. |

Los puertos que publica Docker no pasan por la cadena `INPUT` de iptables: `ufw` no
los protege. Lo que decide qué está abierto es la Security List de la VCN.

## Convivir con otra aplicación en la misma VM

Dos aplicaciones pueden compartir la máquina, pero **el 80 y el 443 son de una sola**: el
navegador no elige puerto. La que los tiene le pasa a la otra el tráfico de su dominio.

Si Cocinadas es la que los tiene, no hay nada que hacer: los valores de `.env.oracle`
funcionan tal cual y Caddy emite el certificado de `cocinadas.duckdns.org` solo.

Si los tiene la otra aplicación, en el `.env` de Cocinadas:

```
PROXY_ADDR=127.0.0.1
PUERTO_HTTP=8280
PUERTO_HTTPS=8243
SITE_ADDRESS=http://cocinadas.duckdns.org
```

`SITE_ADDRESS` con `http://` es lo que apaga el TLS de Caddy: el certificado lo maneja el
otro proxy, que es el que ve Internet. `PROXY_ADDR=127.0.0.1` deja a Cocinadas fuera del
alcance de la red, solo accesible desde la propia VM.

Del lado del otro proxy hay que agregar el dominio. Con nginx:

```nginx
server {
    listen 443 ssl;
    server_name cocinadas.duckdns.org;
    # El mismo certificado que ya maneje ese proxy, emitido también para este dominio.
    location / {
        proxy_pass http://127.0.0.1:8280;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Y en la Security List de la VCN no se abre nada nuevo: el 8280 no sale de la máquina.

Los demás puertos no chocan si cada aplicación usa los suyos. Para ver qué está tomado:

```bash
sudo ss -lntp
```

## Los dos `.env` de un despliegue

| Archivo | Dónde | Qué tiene | Plantilla |
|---|---|---|---|
| `.env` de la **aplicación** | `RUTA_REMOTA/.env` en la VM | Las 13 variables del compose con valores de producción; `deploy.py` solo le cambia `TAG`. | `deployment/oracle-single/.env.oracle` |
| `.env` del **despliegue** | `deployment/oracle-single/.env` en tu máquina | `SSH` y `RUTA_REMOTA`: cómo llegar a la VM. | `deployment/oracle-single/.env.deploy.example` |

Los dos están en el `.gitignore`. `tests/integration/paridad-env.sh` comprueba que cada
uno declare exactamente lo que su plantilla.

## Primer despliegue

1. `python deployment/oracle-single/deploy.py --preflight` desde tu máquina: verifica
   memoria, disco, Docker, puertos y firewall en la instancia, sin tocar nada.
2. En la VM: `mkdir -p ~/cocinadas && cd ~/cocinadas`, copiar `.env.oracle` como `.env`
   y completar los marcadores (`REGISTRO`, contraseña, `JWT_SECRET` con
   `openssl rand -base64 48`).
3. En tu máquina: copiar `.env.deploy.example` a `deployment/oracle-single/.env` y
   completar `SSH` y `RUTA_REMOTA`.
4. Mergear a `main` y esperar a que el CI publique las imágenes (job `imagenes`).
5. `python deployment/oracle-single/deploy.py`.

## Despliegue automático al mergear a main

El job `desplegar` del CI corre `deploy.py` con el SHA del commit, después de que el job
`imagenes` publicó las cuatro imágenes. Un despliegue por vez y solo desde `main`.

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

**Para pedir aprobación antes de cada despliegue**: en Settings → Environments → `produccion`,
agregar «Required reviewers». Sin revisores configurados, el despliegue corre solo.

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
Da el despliegue por bueno solo cuando los cuatro `/health` contestan; si uno no
contesta en dos minutos, muestra sus logs y dice cómo volver.

**Lo que la reversión no revierte:** los volúmenes. Si una versión migró datos, volver la
imagen no vuelve los datos. Un cambio que toque el formato de lo persistido lo dice en el
mensaje del commit y acá.

## Seguridad

El detalle y el porqué están en [ADR-014](adr/ADR-014-endurecimiento-antes-de-publicar.md).
Lo que hay puesto:

| Qué | Dónde se cambia |
|---|---|
| Techo del log por contenedor (hoy 1 MB) | `LOG_MAX_SIZE`, `LOG_MAX_FILES` |
| Techo de CPU por contenedor | `CPU_LIMIT_*` |
| Peticiones por minuto y por IP antes del 429 | `RATE_LIMIT_POR_MINUTO` |
| Cabeceras de seguridad y política de contenido | `infrastructure/reverse-proxy/Caddyfile` |
| Sin privilegios nuevos, sin capacidades, disco de solo lectura | `docker-compose.yml` |

Antes de publicar, en la VM:

- `chmod 600 ~/cocinadas/.env`: ahí están la contraseña de la base y el secreto de los JWT.
- En la Security List de la VCN, abrir solo los puertos del reverse proxy. Si Cocinadas va
  detrás de otro proxy, su `PUERTO_HTTP` **no** se abre: se llega por `127.0.0.1`.
- Poner el respaldo en el cron (abajo).

Lo que todavía no está cubierto es lo que llega con las cuentas: hash de contraseñas,
límite de intentos de login, vida corta del token y que cada servicio verifique que el
dueño del recurso es el del token.

## Respaldo

El estado vive en cuatro volúmenes. Qué se pierde con cada uno:

| Volumen | Qué se pierde si se pierde | Urgencia |
|---|---|---|
| `postgres-datos` | **Todos los usuarios y todas las cocinadas.** No están en ningún otro lado. | Respaldar. |
| `caddy-datos` | Los certificados TLS. Se reemiten, con los límites de intentos de Let's Encrypt. | Respaldar. |
| `nats-datos` | Eventos publicados y no consumidos todavía. Se regenera con el uso. | No hace falta. |
| `caddy-config` | Configuración derivada de Caddy. Se regenera al arrancar. | No hace falta. |

Respaldo con un contenedor descartable, desde la VM:

```bash
docker run --rm -v cocinadas_postgres-datos:/d -v "$PWD:/b" alpine tar czf /b/postgres-datos.tgz -C /d .
docker run --rm -v cocinadas_caddy-datos:/d -v "$PWD:/b" alpine tar czf /b/caddy-datos.tgz -C /d .
```

Para PostgreSQL, además, un volcado lógico es más portable:
`docker compose exec postgres pg_dump -U cocinadas cocinadas > cocinadas.sql`.

Eso mismo, automático, lo hace `deployment/oracle-single/respaldo.sh`: vuelca la base
comprimida, copia los certificados, guarda los últimos siete días y borra los más viejos.
Se corre **en la VM** y acepta `--dry-run` para ver qué haría. En el cron:

```
17 3 * * * cd ~/cocinadas && bash deployment/oracle-single/respaldo.sh >> ~/respaldos/registro.txt 2>&1
```

## Disco

Cada despliegue deja imágenes. `deploy.py` corre `docker image prune -af --filter
until=24h` al final e informa cuánto liberó: sin `-a` no libera nada, porque las
imágenes etiquetadas por SHA nunca están «colgadas».

## Operación diaria

```bash
ssh <destino> 'cd ~/cocinadas && docker compose ps'                        # qué corre y con qué TAG
ssh <destino> 'cd ~/cocinadas && docker compose logs -f --tail 100 cocinadas'
ssh <destino> 'docker stats --no-stream'                                    # memoria por contenedor
ssh <destino> 'df -h / && docker system df'                                 # disco
ssh <destino> 'cd ~/cocinadas && docker compose restart usuarios'
```

## Límites del plan gratuito a tener presentes

Transferencia de salida con tope mensual; balanceador de capa 7 limitado a 10 Mbps (el
de capa 4, sin ese tope); el API Gateway no está en el plan gratuito; una instancia sin
actividad puede ser reclamada. Verificar los valores vigentes en la documentación de
Oracle antes de contar con ellos: cambian.
