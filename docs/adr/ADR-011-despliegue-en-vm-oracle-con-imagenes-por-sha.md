# ADR-011: Despliegue en una VM de Oracle Cloud con imágenes multi-arquitectura por SHA

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

El usuario ya tiene una VM en Oracle Cloud (plan Always Free) y el dominio
`templa.duckdns.org`. No dijo qué shape es: **Ampere A1 es `arm64`, las AMD son
`amd64`**, y una imagen construida para la arquitectura equivocada falla al arrancar con
`exec format error`, sin mencionar arquitecturas. El código está en GitHub, así que
GitHub Actions y GHCR están disponibles sin costo para un repositorio público.

## Opciones consideradas

### 1. Construir las imágenes en la VM

`docker compose up --build` en la instancia. Sin registro ni CI de imágenes. Se descartó
porque una Micro AMD de 1 GB se queda sin memoria compilando cuatro proyectos Node, y
porque lo que corre en producción no habría pasado por el CI: se despliega lo que hay en
el disco de la VM.

### 2. Construir en el CI solo para la arquitectura de la VM

Más rápido que multi-arquitectura. Se descartó porque el shape no está confirmado, y
porque las mismas imágenes sirven para desarrollo local en amd64: publicar una sola
arquitectura obliga a construir dos veces por otro camino.

### 3. Kubernetes (OKE) o el API Gateway de Oracle

Parecían el camino «cloud». No lo son para una VM gratuita: OKE necesita nodos de pago
o toda la cuota Always Free, y el API Gateway **no** está en el plan gratuito (según la
referencia `instancia.md` de la skill de despliegue; verificar en la documentación de
Oracle antes de darlo por definitivo).

### 4. Una VM con docker compose, imágenes construidas en GitHub Actions para amd64 y arm64, publicadas en GHCR por SHA, y un script de despliegue con reversión

Es la opción elegida.

## Decisión

- El CI (`.github/workflows/ci.yml`) construye las cuatro imágenes con `buildx` para
  `linux/amd64` y `linux/arm64` solo en `main` y solo si pasaron las pruebas, y las
  publica en `ghcr.io/<usuario>/templa-<servicio>:<sha>`. **Nunca `latest`.**
- `deployment/oracle-single/deploy.py` corre desde la máquina de quien despliega: fija
  `TAG=<sha>` en el `.env` de la instancia, hace `docker compose pull` y `up -d`, y da el
  despliegue por bueno solo cuando los `/health` contestan. Revertir es el mismo script
  con el SHA anterior.
- Los servicios internos se publican en `127.0.0.1` (`PUBLISH_ADDR`); solo el proxy
  escucha en la interfaz pública. El firewall efectivo es la Security List de la VCN.
- `deployment/oracle-single/preflight.sh` verifica la instancia sin modificarla.
- El despliegue lo dispara una persona, no el CI: un despliegue automático necesitaría
  una clave SSH como secreto del repositorio, y eso es un ADR propio si algún día se
  quiere.

La guía paso a paso de la instancia (crear, conectarse, Security List, DNS, certificado)
se genera con la skill `desplegar-en-oracle-cloud` en el cambio siguiente; este ADR fija
la arquitectura del despliegue, no la guía.

## Consecuencias

### Positivas

- `docker compose ps` en la VM dice exactamente qué commit corre.
- Reversión en un comando, determinística, sin volver a construir.
- Lo que corre en producción pasó por el CI.
- Las mismas imágenes en desarrollo (amd64) y en la VM (arm64 o amd64).

### Negativas

- Construir `arm64` sobre x86 con QEMU tarda varias veces más que nativo; el CI de
  imágenes va a ser lento (minutos por servicio). Mitigación: caché de capas de GitHub
  Actions y matriz en paralelo.
- El primer despliegue exige trabajo a mano en la consola de Oracle (Security List,
  DNS), documentado en la guía.
- Una VM sola: sin alta disponibilidad. Si se cae, se cae todo hasta que alguien la
  levante.
- Las imágenes por SHA se acumulan en GHCR; hay que limpiar de vez en cuando.

### Lo que no cambia

El compose es el mismo en desarrollo y en la VM (ADR-001).

## Cuándo revisar esta decisión

- Cuando se confirme el shape: si es Ampere y el CI tarda demasiado, pasar a un runner
  ARM y construir solo `arm64` para producción.
- Si hace falta que el sitio siga arriba mientras la VM se reinicia: segunda VM y el
  balanceador de red de Oracle (`deployment/oracle-ha/`).

## Referencias

- `.claude/skills/desplegar-en-oracle-cloud/referencias/instancia.md`, `despliegue.md`, `operacion.md`.
- `docs/DEPLOYMENT.md`.
