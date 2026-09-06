# Seguridad

Qué puede salir mal, qué lo mitiga y qué queda abierto. Lo que queda abierto se dice con
todas las letras: una lista de mitigaciones sin huecos es propaganda.

La superficie es chica: el sitio son archivos estáticos en GitHub Pages (ADR-017). Lo que
queda expuesto es el navegador de quien cocina, y ahí hay dos cosas que saber: las
cocinadas viven **sin cifrar** en el `localStorage` —quien tenga el teléfono desbloqueado
las ve— y las cabeceras de seguridad se perdieron al salir de Caddy.

> ### Pendiente: recuperar la CSP
>
> La política de contenido, `Permissions-Policy`, `Referrer-Policy`,
> `X-Content-Type-Options` y HSTS vivían en el Caddyfile y se fueron con él, porque Pages
> no permite definir cabeceras. La CSP se puede recuperar con
> `<meta http-equiv="Content-Security-Policy">` en `web/index.html` —todo salvo
> `frame-ancestors`, que en `<meta>` se ignora—; `Referrer-Policy` también tiene su
> `<meta>`. `Permissions-Policy` y HSTS quedan en manos de GitHub.
>
> **Es la única regresión de seguridad del paso a Pages, y está sin hacer.**

## Amenazas y mitigaciones

| Amenaza | Qué la mitiga | Estado |
|---|---|---|
| Secretos filtrados en el repositorio | El proyecto no necesita ninguno para publicar: el workflow se autentica con el token OIDC de su propio run. Trivy escanea el repositorio buscando secretos pegados. | Mitigado. |
| El sitio se publica roto o incompleto | El job `publicar` solo corre si `pruebas` pasó, y comprueba que el `index.html` no tenga rutas absolutas, que darían 404 solo en producción. | Mitigado. |
| Tráfico en claro | GitHub Pages sirve por HTTPS con su propio certificado. | Mitigado. Queda de su lado, no del nuestro. |
| XSS con contenido del catálogo | El catálogo lo escribimos nosotros y se genera en el build; React escapa el texto y el código no usa `dangerouslySetInnerHTML`. | Mitigado por el código, **no por la CSP**, que está pendiente (ver arriba). |
| Dependencia con una vulnerabilidad conocida | Dependabot vigila `web/` y las acciones del CI, y abre un pull request cuando aparece un aviso. Trivy escanea en cada push. | Mitigado para lo conocido. **Abierto**: nadie mira una dependencia recién publicada hasta que alguien la reporta. |
| Una versión maliciosa entrando por una actualización | Dependabot propone, no mergea. Y pnpm 10 no ejecuta los scripts de instalación de las dependencias, así que un paquete no puede correr nada por el solo hecho de instalarse. | Mitigado. Depende de no activar el auto-merge y de no mergear a ciegas el mismo día. |
| Cadena de suministro de las acciones del CI | Una acción corre con el token del workflow. Se referencian por etiqueta mayor. | **Abierto**: anclarlas por SHA de commit si se quiere reproducibilidad exacta. |
| Que alguien publique en tu nombre | Publicar solo puede hacerlo el workflow corriendo en `main`, con el token OIDC de su propio run. | Mitigado. Depende de quién pueda mergear a `main`. |
| Datos personales | El sitio recoge cero: sin cuentas, sin analítica de terceros, y todo lo que se guarda queda en el teléfono. | Mitigado por diseño. |
| Pérdida del historial | En el teléfono, borrar los datos del sitio lo borra. | **Abierto del lado del usuario**: sin exportar ni sincronizar, el historial se pierde con el teléfono. Es lo que ADR-015 deja preparado para revertir. |

Las amenazas del lado del servidor —sesiones falsificadas, inyección SQL, entrada maliciosa
por la API, contenedores con privilegios— vuelven a aplicar el día que las cocinadas salgan
del celular. Están analizadas en el «camino de vuelta» de
[ADR-015](adr/ADR-015-de-cuatro-servicios-a-una-spa-estatica.md) y en
[ADR-017](adr/ADR-017-sitio-estatico-en-github-pages.md), con el detalle de por qué la
elección de dónde vive la sesión depende de si el front y la API comparten origen.

## Reglas que se sostienen en el código

- El workflow se autentica con el token OIDC de su propio run: publicar no requiere
  ninguna credencial guardada.
- Nada de `dangerouslySetInnerHTML`, y el catálogo lo escribimos nosotros.
- Distinguir «no hay» de «no pude preguntar»: un fallo al leer el catálogo o el
  `localStorage` se muestra como error, no como «no hay recetas» ni como «no cocinaste
  nunca».

## Qué hacer ante un incidente

1. **Volver atrás**: `git revert <sha>` y mergear. El siguiente merge republica.
2. **Bajar el sitio**: Settings → Pages → cambiar el *Source* a «None».
3. **Ver qué se publicó y cuándo**: Actions → los runs de `publicar`, o Settings → Pages.
4. **Los logs de acceso no existen**: Pages no los expone. Si alguna vez hacen falta para
   investigar algo, es una razón para volver a tener servidor propio.
