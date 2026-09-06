# Seguridad

Qué puede salir mal, qué lo mitiga y qué queda abierto. Lo que queda abierto se dice con
todas las letras: una lista de mitigaciones sin huecos es propaganda.

**No hay servidor** (ADR-017): el sitio son archivos estáticos en GitHub Pages. No hay
base de datos con credenciales, ni broker, ni proceso que interprete el cuerpo de una
petición, ni máquina que parchear. La contracara es doble: las cocinadas viven sin cifrar
en el `localStorage` de cada teléfono —quien tenga el teléfono desbloqueado las ve— y
**se perdieron las cabeceras de seguridad**, porque Pages no deja definirlas.

> ### Pendiente: recuperar la CSP
>
> La política de contenido, `Permissions-Policy`, `Referrer-Policy`,
> `X-Content-Type-Options` y HSTS vivían en el Caddyfile y se fueron con él. La CSP se
> puede recuperar con `<meta http-equiv="Content-Security-Policy">` en `web/index.html`
> —todo salvo `frame-ancestors`, que en `<meta>` se ignora—; `Referrer-Policy` también
> tiene su `<meta>`. `Permissions-Policy` y HSTS quedan en manos de GitHub.
>
> **Es la única regresión de seguridad del paso a Pages, y está sin hacer.**

## Amenazas y mitigaciones

| Amenaza | Qué la mitiga | Estado |
|---|---|---|
| Secretos en el repositorio | `.env` y `deployment/*/.env` en el `.gitignore`; `.env.example` y `.env.oracle` solo con marcadores. `tests/integration/paridad-env.sh` no lee valores, solo nombres. | Mitigado. Falta un hook o un escaneo en el CI que rechace un commit con un secreto pegado en otro archivo. |
| El sitio se publica roto o incompleto | El job `publicar` solo corre si `pruebas` pasó, y comprueba que el `index.html` no tenga rutas absolutas (que darían 404 solo en producción). | Mitigado. |
| Sesiones falsificadas | — | **No aplica hoy**: no hay sesiones ni cuentas. Vuelve a aplicar el día que el historial salga del celular (ADR-015, «el camino de vuelta»). |
| Servicios internos alcanzables desde internet | No hay servicios ni máquina. | No aplica. |
| Tráfico en claro | GitHub Pages sirve por HTTPS con su propio certificado. | Mitigado. Queda de su lado, no del nuestro. |
| Contenedores corriendo como root | No hay contenedores. | No aplica. |
| Entrada maliciosa por la API | No hay API: el servidor solo devuelve archivos, no interpreta cuerpos ni parámetros. | **No aplica hoy**. El día que haya un endpoint que escriba, vuelve a hacer falta validación de esquemas y límite de peticiones. |
| Inyección SQL | No hay base de datos. | **No aplica hoy**. |
| XSS con contenido del catálogo | El catálogo lo escribimos nosotros y se genera en el build; React escapa el texto y no se usa `dangerouslySetInnerHTML`. | Mitigado por el código, **no por la CSP**, que se perdió con el Caddyfile (ver arriba). |
| Dependencias con vulnerabilidades | Lockfiles fijados; `pnpm audit` no está en el CI. | **Abierto**: agregar `pnpm audit --prod` al pipeline, o Dependabot. |
| Cadena de suministro | El lockfile de pnpm está fijado y el CI instala con `--frozen-lockfile`. Las acciones de GitHub se referencian por etiqueta mayor, no por SHA. | **Abierto**: fijar las acciones por SHA si se quiere reproducibilidad exacta. |
| Que alguien publique en tu nombre | Solo el workflow de `main` puede publicar, autenticado con el token OIDC del propio run. No hay claves de despliegue guardadas. | Mitigado. Depende de quién pueda mergear a `main`. |
| Datos personales | No se recoge ninguno: no hay cuentas, no hay servidor que guarde nada, no hay analítica de terceros. | Mitigado por diseño. |
| Pérdida de datos | No hay servidor donde perder nada. En el teléfono, borrar los datos del sitio borra el historial. | **Abierto del lado del usuario**: sin exportar ni sincronizar, el historial se pierde con el teléfono. Es lo que ADR-015 deja preparado para revertir. |

## Reglas que se sostienen en el código

- **No hay secretos en el repositorio y no hace falta ninguno para publicar**: el
  workflow se autentica con el token OIDC de su propio run.
- Nada de `dangerouslySetInnerHTML`, y el catálogo lo escribimos nosotros.
- Distinguir «no hay» de «no pude preguntar»: un fallo al leer el catálogo o el
  `localStorage` no se muestra como «no hay recetas» ni como «no cocinaste nunca».

## Qué hacer ante un incidente

No hay secretos que rotar ni servidor al que entrar.

1. **Volver atrás**: `git revert <sha>` y mergear. El siguiente merge republica.
2. **Bajar el sitio**, si hiciera falta: Settings → Pages → cambiar el *Source* a «None».
3. **Ver qué se publicó y cuándo**: Actions → los runs de `publicar`, o Settings → Pages.
4. No hay logs de acceso: Pages no los expone. Si alguna vez hacen falta, es una razón
   para volver a tener servidor propio.
