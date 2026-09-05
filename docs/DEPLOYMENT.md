# Despliegue

Una VM de Oracle Cloud (Always Free) con Docker, el mismo `docker-compose.yml` que en
desarrollo, y las imágenes construidas por el CI y publicadas en GHCR etiquetadas por
SHA de commit (ADR-011). Todo lo específico vive en `deployment/oracle-single/`.

> La guía paso a paso de la instancia (crearla, conectarse, Security List, DNS,
> certificado) se genera con la skill `desplegar-en-oracle-cloud` como `ORACLE.md` en
> esa carpeta. Esta página describe la arquitectura del despliegue y la operación.

## Dominio y TLS

- Dominio: `templa.duckdns.org`, apuntado a la IP pública de la instancia.
- TLS: Caddy pide el certificado a Let's Encrypt por HTTP-01 la primera vez que arranca
  con `SITE_ADDRESS=templa.duckdns.org`, y lo renueva solo (ADR-009). Para que la
  emisión funcione: **abrir 80 y 443 en la Security List → apuntar el DNS → esperar a que
  `dig +short templa.duckdns.org` devuelva la IP → recién entonces levantar el proxy.**
  Emitir antes quema uno de los pocos intentos por hora que Let's Encrypt permite.
- Los certificados viven en el volumen `caddy-datos`.

## Puertos

| Puerto | Quién | Desde dónde |
|---|---|---|
| 80, 443 (TCP y UDP) | `reverse-proxy` | Internet. **Los únicos que se abren en la Security List.** |
| 3001, 3002, 3003, 8080 | catalogo, usuarios, cocinadas, frontend | Solo `127.0.0.1` de la VM (`PUBLISH_ADDR`). Los usa `deploy.sh` para comprobar los `/health`. |
| 5432, 4222, 8222 | postgres, nats | Solo la red interna del compose. Para mirarlos: `docker compose exec` o túnel SSH. |

Los puertos que publica Docker no pasan por la cadena `INPUT` de iptables: `ufw` no
los protege. Lo que decide qué está abierto es la Security List de la VCN.

## Los dos `.env` de un despliegue

| Archivo | Dónde | Qué tiene | Plantilla |
|---|---|---|---|
| `.env` de la **aplicación** | `RUTA_REMOTA/.env` en la VM | Las 13 variables del compose con valores de producción; `deploy.sh` solo le cambia `TAG`. | `deployment/oracle-single/.env.oracle` |
| `.env` del **despliegue** | `deployment/oracle-single/.env` en tu máquina | `SSH` y `RUTA_REMOTA`: cómo llegar a la VM. | `deployment/oracle-single/.env.deploy.example` |

Los dos están en el `.gitignore`. `tests/integration/paridad-env.sh` comprueba que cada
uno declare exactamente lo que su plantilla.

## Primer despliegue

1. `ssh <destino> 'bash -s' < deployment/oracle-single/preflight.sh` desde tu máquina:
   verifica memoria, disco, Docker, puertos y firewall sin tocar nada.
2. En la VM: `mkdir -p ~/templa && cd ~/templa`, copiar `.env.oracle` como `.env`
   y completar los marcadores (`REGISTRO`, contraseña, `JWT_SECRET` con
   `openssl rand -base64 48`).
3. En tu máquina: copiar `.env.deploy.example` a `deployment/oracle-single/.env` y
   completar `SSH` y `RUTA_REMOTA`.
4. Mergear a `main` y esperar a que el CI publique las imágenes (job `imagenes`).
5. `bash deployment/oracle-single/deploy.sh`.

## Despliegues siguientes y reversión

```bash
bash deployment/oracle-single/deploy.sh            # el último commit verificado de main
bash deployment/oracle-single/deploy.sh <sha>      # un commit concreto
bash deployment/oracle-single/deploy.sh <sha-anterior>   # volver atrás: es el mismo comando
bash deployment/oracle-single/deploy.sh --dry-run  # ver qué haría, sin tocar la VM
```

El script anota qué SHA había antes y lo imprime, así la reversión es copiar ese comando.
Da el despliegue por bueno solo cuando los cuatro `/health` contestan; si uno no
contesta en dos minutos, muestra sus logs y dice cómo volver.

**Lo que la reversión no revierte:** los volúmenes. Si una versión migró datos, volver la
imagen no vuelve los datos. Un cambio que toque el formato de lo persistido lo dice en el
mensaje del commit y acá.

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
docker run --rm -v templa_postgres-datos:/d -v "$PWD:/b" alpine tar czf /b/postgres-datos.tgz -C /d .
docker run --rm -v templa_caddy-datos:/d -v "$PWD:/b" alpine tar czf /b/caddy-datos.tgz -C /d .
```

Para PostgreSQL, además, un volcado lógico es más portable:
`docker compose exec postgres pg_dump -U templa templa > templa.sql`.

## Disco

Cada despliegue deja imágenes. `deploy.sh` corre `docker image prune -af --filter
until=24h` al final e informa cuánto liberó: sin `-a` no libera nada, porque las
imágenes etiquetadas por SHA nunca están «colgadas».

## Operación diaria

```bash
ssh <destino> 'cd ~/templa && docker compose ps'                        # qué corre y con qué TAG
ssh <destino> 'cd ~/templa && docker compose logs -f --tail 100 cocinadas'
ssh <destino> 'docker stats --no-stream'                                    # memoria por contenedor
ssh <destino> 'df -h / && docker system df'                                 # disco
ssh <destino> 'cd ~/templa && docker compose restart usuarios'
```

## Límites del plan gratuito a tener presentes

Transferencia de salida con tope mensual; balanceador de capa 7 limitado a 10 Mbps (el
de capa 4, sin ese tope); el API Gateway no está en el plan gratuito; una instancia sin
actividad puede ser reclamada. Verificar los valores vigentes en la documentación de
Oracle antes de contar con ellos: cambian.
