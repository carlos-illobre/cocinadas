# El script de despliegue

## Se despliega por SHA, nunca por `latest`

`latest` es una etiqueta móvil: sirve para «dame lo último», **no para saber qué está
corriendo**. Fijando el SHA del commit en la configuración de la instancia:

- `docker compose ps` dice exactamente qué versión hay.
- La reversión es determinística: se apunta la etiqueta al SHA anterior y listo.
- Dos despliegues seguidos del mismo commit no pueden traer cosas distintas.

Con `latest`, un redeploy después de que alguien mergeó algo trae ese algo sin que nadie
lo haya pedido, y `docker ps` sigue diciendo `latest` en los dos casos.

**El SHA por defecto no es el de tu copia local**: es el último commit **verificado** de la
rama principal. Desplegar lo que tenés en el disco es cómo termina corriendo en producción
un commit que nunca pasó por el CI.

---

## Estructura del script

```sh
#!/usr/bin/env bash
set -euo pipefail
```

`set -e` es lo que impide que un despliegue siga adelante después de que algo falló, que
es la peor forma de romper producción: a medias.

### La ruta se resuelve con git, no contando `..`

```sh
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
```

**No** `cd "$(dirname "$0")/../.."`. Contar directorios es correcto exactamente a la
profundidad de hoy: el día que el script cambia de carpeta, `..` sigue resolviendo a
*algo*, el script corre desde el lugar equivocado, y falla con un error que no menciona
rutas. Pasó de verdad.

### Todo sale del `.env` de despliegue

```sh
[ -f deployment/oracle-single/.env ] || morir "falta el .env de despliegue"
set -a; . deployment/oracle-single/.env; set +a
: "${SSH:?falta SSH}"
: "${RUTA_REMOTA:?falta RUTA_REMOTA}"
```

El script **no contiene ningún dato del despliegue**: ni la IP, ni el usuario, ni la ruta.
Así se puede versionar sin filtrar nada y sirve para más de una instancia.

---

## Los pasos, y qué hace bien cada uno

**1. Resolver la versión.** `git fetch` del remoto y tomar el SHA de la rama principal, o
el que se pasó por argumento. Si se pasó uno, verificá que exista antes de seguir.

**2. Anotar qué había.** Leer el SHA actualmente desplegado y mostrarlo. Es lo que
convierte «volver atrás» en un comando y no en una arqueología.

**3. Copiar la configuración.** El `docker-compose.yml` y lo que monte como volumen de
configuración. **El `.env` de la aplicación en la instancia no se pisa**: tiene los valores
de producción y no está en el repositorio.

**4. Traer las imágenes.** `docker compose pull` con la etiqueta fijada al SHA. Si el
registro es privado, el login va antes.

**5. Reemplazar.** `docker compose up -d` reemplaza **sólo** los contenedores cuya imagen
cambió. No hace falta bajar todo.

**6. Comprobar que quedó arriba.** Éste es el paso que se hace mal más seguido: `docker
compose ps` muestra «Up» un contenedor que está reiniciándose en bucle. **Consultá los
`/health` y esperá a que respondan**, con un tope de tiempo y un mensaje claro si no lo
logran.

**7. Limpiar.** Ver `operacion.md`: hay un detalle que hace que la limpieza no limpie nada.

---

## La reversión

No es un mecanismo aparte: es el mismo script con el SHA anterior.

```sh
bash deployment/oracle-single/deploy.sh <sha-anterior>
```

Funciona porque las imágenes se etiquetan por SHA y siguen en el registro. Es la razón
principal por la que se etiqueta así.

**Lo que la reversión NO revierte:** los volúmenes. Si una versión migró datos o cambió el
formato de lo que persiste, volver la imagen no vuelve los datos. Cuando un cambio toque
el formato de algo persistido, decilo en el mensaje del commit y en la guía.

---

## La regla que se aprende cara

**No pruebes un script que ejecuta acciones, ejecutándolo.**

Pasó: verificando que la resolución de rutas funcionaba, se corrió el `deploy.sh` real
—cortándolo con un `grep -m1`, suponiendo que el SIGPIPE lo mataría—. No lo mató. Se
ejecutó un despliegue completo a producción que nadie había pedido.

Un script de despliegue se verifica:

- Leyéndolo.
- Con `bash -n`, que comprueba la sintaxis sin ejecutar.
- Si hace falta probar la lógica, con un modo `--dry-run` que imprima los comandos en vez
  de correrlos, **escrito desde el principio**, no improvisado con un pipe.
