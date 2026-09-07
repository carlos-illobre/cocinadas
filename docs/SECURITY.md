# Seguridad

Qué puede salir mal, qué lo mitiga y qué queda abierto. Lo que queda abierto se dice con
todas las letras: una lista de mitigaciones sin huecos es propaganda.

La superficie es chica: el sitio son archivos estáticos en GitHub Pages (ADR-017). Lo que
queda expuesto es el navegador de quien cocina, y ahí hay dos cosas que saber: las
cocinadas viven **sin cifrar** en el `localStorage` —quien tenga el teléfono desbloqueado
las ve— y de las cabeceras de seguridad que se perdieron al salir de Caddy se recuperó la
que dependía de nosotros.

## La política de contenido

Pages no permite definir cabeceras, así que la CSP va como `<meta http-equiv>`, y la
inyecta `vite.config.ts` **solo en el build**: en desarrollo, el refresco en caliente de
React necesita un script en línea que `script-src 'self'` bloquearía. La política:

```
default-src 'none'; script-src 'self';
style-src-elem 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline';
font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self';
manifest-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none';
upgrade-insecure-requests
```

Lo que abre, con motivo: `style-src-attr 'unsafe-inline'` porque React escribe los anchos
de las barras y los papelitos del confeti como `style=` en el elemento (los `<style>` en
línea siguen prohibidos); y Google Fonts, hasta que la app sea instalable sin conexión.
`frame-ancestors` no se puede: en `<meta>` se ignora.

El E2E (`primera-cocinada.spec.ts`) comprueba que el `<meta>` esté en lo compilado y que el
navegador no haya reportado ningún bloqueo durante el recorrido entero: una CSP que rompa
la app se nota antes de publicar.

`Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` y HSTS siguen en manos de
GitHub: no hay forma de ponerlas desde acá.

## Amenazas y mitigaciones

| Amenaza | Qué la mitiga | Estado |
|---|---|---|
| Secretos filtrados en el repositorio | El proyecto no necesita ninguno para publicar: el workflow se autentica con el token OIDC de su propio run. Trivy escanea el repositorio buscando secretos pegados. | Mitigado. |
| El sitio se publica roto o incompleto | El job `publicar` solo corre si `pruebas` pasó, y comprueba que el `index.html` no tenga rutas absolutas, que darían 404 solo en producción. | Mitigado. |
| Tráfico en claro | GitHub Pages sirve por HTTPS con su propio certificado. | Mitigado. Queda de su lado, no del nuestro. |
| XSS con contenido del catálogo | El catálogo lo escribimos nosotros y se genera en el build; React escapa el texto, el código no usa `dangerouslySetInnerHTML` (ESLint lo vigila junto con `eval` y compañía) y la CSP no deja correr ningún script que no venga del propio sitio. | Mitigado, por el código y por la CSP. |
| Un `localStorage` manipulado o corrupto | Lo guardado se lee como `unknown` y se comprueba antes de usarse: el historial descarta las cocinadas sin la forma esperada; la cocinada en curso exige marca de tiempo, plato y modo. Lo que no se comprueba —el resto del estado de la cocina— lo cubre un límite de error (`Recuperacion`): si dibujar revienta, se descarta la cocinada en curso y se ofrece volver a empezar. Sin eso, un guardado roto dejaba la app en blanco en cada arranque hasta que venciera, seis horas después. | Mitigado. Es el propio teléfono: el daño posible era bloquearse a uno mismo, no a otros. |
| Terceros que ven quién usa la app | Las fuentes se cargan de Google Fonts en cada visita, así que Google ve la IP de quien abre la app. Es el único tercero. | **Abierto**: servirlas desde el sitio lo cierra, y hace falta igual el día que la app funcione sin conexión. |
| Dependencia con una vulnerabilidad conocida | Dependabot vigila `web/` y las acciones del CI, y abre un pull request cuando aparece un aviso. Trivy escanea en cada push. | Mitigado para lo conocido. **Abierto**: nadie mira una dependencia recién publicada hasta que alguien la reporta. |
| Una versión maliciosa entrando por una actualización | Dependabot propone, no mergea. Y pnpm 10 no ejecuta los scripts de instalación de las dependencias, así que un paquete no puede correr nada por el solo hecho de instalarse. | Mitigado. Depende de no activar el auto-merge y de no mergear a ciegas el mismo día. |
| Cadena de suministro de las acciones del CI | Una acción corre con el token del workflow. Se referencian por etiqueta mayor (`actions/checkout@v7`), que el autor puede mover. El token es de solo lectura salvo en `publicar`, que puede escribir en Pages. | **Abierto**: anclarlas por SHA de commit. Dependabot sigue actualizándolas igual. Es la única forma de que un commit malicioso en una acción no llegue solo. |
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
- Nada de `dangerouslySetInnerHTML`, y el catálogo lo escribimos nosotros. La CSP lo
  respalda: solo corre código que viene del propio sitio.
- Lo que entra por `JSON.parse` —el `localStorage`— se lee como `unknown` y se comprueba;
  no se castea. ESLint con reglas de tipos (`no-unsafe-*`, `no-unnecessary-condition`) es
  lo que hizo visible el cast que había.
- Distinguir «no hay» de «no pude preguntar»: un fallo al leer el catálogo o el
  `localStorage` se muestra como error, no como «no hay recetas» ni como «no cocinaste
  nunca».

## Qué hacer ante un incidente

1. **Volver atrás**: `git revert <sha>` y mergear. El siguiente merge republica.
2. **Bajar el sitio**: Settings → Pages → cambiar el *Source* a «None».
3. **Ver qué se publicó y cuándo**: Actions → los runs de `publicar`, o Settings → Pages.
4. **Los logs de acceso no existen**: Pages no los expone. Si alguna vez hacen falta para
   investigar algo, es una razón para volver a tener servidor propio.
