---
name: desplegar-en-oracle-cloud
description: "Agrega a un proyecto con docker-compose todo lo necesario para desplegarlo en una VM de Oracle Cloud (Always Free): el script de despliegue por SHA con reversión, un preflight que verifica la instancia sin tocarla, la plantilla de configuración del ambiente, y una guía paso a paso desde crear la máquina hasta el certificado TLS. Incluye lo que no es obvio de Oracle: por qué el firewall efectivo es la Security List de la VCN y no iptables. Usar al pedir 'desplegar en Oracle', 'subir esto a la nube', 'armá el deploy', 'ponelo online en un VPS', o al agregar un destino de despliegue a un proyecto existente."
---

# Despliegue en una VM de Oracle Cloud

Agrega a un proyecto **que ya existe y ya tiene `docker-compose.yml`** lo necesario para
ponerlo online en una instancia de Oracle Cloud, más la guía para operarlo.

No inventa la aplicación: **lee el proyecto** para saber qué servicios hay, qué puertos
publican y qué variables usan, y arma el despliegue alrededor de eso.

---

## Paso 1 — Leer el proyecto antes de preguntar

Averiguá por tu cuenta lo que ya está escrito, para no preguntar lo que se puede leer:

- `docker-compose.yml`: qué servicios hay, cuáles publican puertos, qué volúmenes usan,
  qué variables interpola.
- `.env` / `.env.example`: qué configuración existe.
- El CI, si hay: si ya construye y publica imágenes, y con qué etiqueta.
- Si ya existe un `deployment/`: **no lo pises**. Preguntá si se agrega otro destino.

Si el proyecto **no** tiene `docker-compose.yml`, decilo y frená: esta skill agrega un
despliegue a un proyecto containerizado, no lo containeriza.

---

## Paso 2 — Preguntar lo que no se puede deducir

Con `AskUserQuestion`. Sólo lo que el repositorio no contesta:

### La instancia

- **¿Ya existe la VM o hay que crearla?** Si existe: su IP pública, el usuario de SSH
  (`ubuntu` en las imágenes Ubuntu, `opc` en Oracle Linux) y la ruta de la clave privada.
- **¿Qué shape?** Determina la arquitectura de las imágenes, que es un error caro de
  descubrir tarde: **Ampere A1 es `arm64`**, las AMD son `amd64`. Ver
  `referencias/instancia.md`.

### El dominio y el TLS

- **¿Hay dominio propio, un dominio dinámico gratuito, o se accede por IP?**
  Sin dominio no hay certificado de Let's Encrypt, y sin certificado no hay HTTPS. Es la
  respuesta que más cambia lo que se genera.

### Las imágenes

- **¿Se construyen en el CI y se publican en un registro, o se construyen en la VM?**
  En una instancia chica, construir en la VM puede agotar la memoria; en una Ampere con
  24 GB no es problema. Si hay registro: cuál, y si es privado.

### El despliegue

- **¿Lo dispara una persona desde su máquina, o el CI al mergear?**
  Por defecto, **desde la máquina de quien despliega**: un despliegue automático a
  producción desde el CI necesita una clave SSH guardada como secreto, y esa decisión
  merece un ADR propio.

---

## Paso 3 — Leer las referencias

| Archivo | Cuándo |
|---|---|
| `referencias/instancia.md` | Siempre. Shapes, red, y **el firewall**, que es lo que más se hace mal. |
| `referencias/despliegue.md` | Siempre. Qué hace el script y por qué cada decisión. |
| `referencias/operacion.md` | Siempre. TLS, respaldo, disco y los límites del plan gratuito. |
| `plantillas/deploy.sh` | Al generar el script: es la base, adaptala al proyecto. |
| `plantillas/preflight.sh` | Al generar la verificación previa. |

---

## Paso 4 — Generar

Todo cuelga de `deployment/oracle-single/` (el sufijo `-single` deja lugar a otra
topología más adelante sin renombrar nada):

```
deployment/oracle-single/
├── .env               Datos reales del despliegue. AL .gitignore
├── .env.oracle        Plantilla versionada, con marcadores de posición
├── deploy.sh          El despliegue, idempotente y reversible
├── preflight.sh       Verifica la instancia. NO modifica nada
└── ORACLE.md          La guía paso a paso
```

**El `.env` de despliegue es distinto del `.env` de la aplicación.** Éste tiene sólo lo
que hace falta para *llegar* a la máquina —destino SSH, ruta remota, dominio— y ningún
dato de la aplicación. Agregalo al `.gitignore` en el mismo momento en que lo creás, no
después.

### Qué tiene que hacer `deploy.sh`

1. Resolver **qué versión** desplegar: por defecto el último commit verificado de la rama
   principal; opcionalmente un SHA que se le pasa, que es también la forma de revertir.
2. **Anotar qué había antes**, para poder volver.
3. Copiar la configuración a la instancia.
4. Traer las imágenes de ese SHA.
5. Reemplazar sólo los contenedores cuya imagen cambió.
6. **Comprobar que quedó arriba**: los `/health` respondiendo, no un `docker ps` que
   muestra un contenedor reiniciándose en bucle.
7. Limpiar imágenes viejas (ver `referencias/operacion.md`; el detalle del `-a` importa).

### Qué tiene que hacer `ORACLE.md`

La guía completa, en orden, con los comandos exactos: crear la instancia, conectarse,
verificar que la máquina está lista, el dominio, clonar y configurar, **abrir los puertos
en la Security List**, emitir el certificado, levantar, comprobar, y la operación diaria.

Escribila para alguien que nunca usó Oracle Cloud. Cada paso con lo que tiene que ver si
salió bien, y qué hacer si salió mal.

---

## Paso 5 — Verificar

- [ ] `bash -n deployment/oracle-single/deploy.sh` y lo mismo para `preflight.sh`.
- [ ] `.env` de despliegue en el `.gitignore`, y `.env.oracle` sin ningún dato real.
- [ ] `ORACLE.md` sin enlaces rotos y sin secretos.
- [ ] Los puertos que la guía manda a abrir son **exactamente** los que publica el compose.

**No ejecutes `deploy.sh` para probarlo.** Un script que despliega, si lo corrés, despliega
— aunque lo cortes a la mitad. Se verifica leyéndolo y con `bash -n`; el primer despliegue
de verdad lo hace la persona, siguiendo la guía.

---

## Lo que esta skill no hace

- **No crea la instancia por vos.** La consola de Oracle no tiene una API que valga la
  pena scriptear para una sola máquina; la guía explica cómo hacerlo a mano.
- **No guarda credenciales** en ningún archivo versionado.
- **No despliega.** Genera el script; ejecutarlo es una decisión de la persona.
