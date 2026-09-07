# Despliegue

**Cada merge a `main` publica el sitio solo.** El CI corre las pruebas, compila y sube el
resultado a GitHub Pages.

**La app: <https://carlos-illobre.github.io/cocinadas/>**

El porqué está en [ADR-017](adr/ADR-017-sitio-estatico-en-github-pages.md).

## El pipeline

`.github/workflows/ci.yml`, tres jobs:

| Job | Cuándo | Qué hace |
|---|---|---|
| `pruebas` | cada push y cada PR | `pnpm test:cov` con la compuerta del 100 %, y `validar-receta.py` sobre el catálogo. |
| `vulnerabilidades` | cada push y cada PR | Trivy busca CVE y secretos filtrados. **Informa, no reprueba.** |
| `publicar` | solo en `main`, después de `pruebas` | Compila `web/` y publica en Pages. |

Todo merge a `main` —con commit de merge o con squash— es un push a `main`, así que
`publicar` corre en cada merge. Si las pruebas fallan, no se publica nada.

## Qué hay que tener configurado en GitHub

Una sola cosa, y una sola vez: **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

El job se autentica con el token OIDC del propio workflow, que es para lo que están los
permisos `pages: write` e `id-token: write`.

El repositorio tiene que ser **público** para que Pages sea gratis. Lo es.

## Las dos trampas de Pages

**1. El sitio se sirve en `/<repo>/`, no en la raíz.** O sea
`carlos-illobre.github.io/cocinadas/`. Cualquier ruta que empiece con `/` apunta al dominio
y da 404 **solo en producción**, que es el peor momento para enterarse.

Por eso `vite.config.ts` tiene `base: './'` y el código usa rutas relativas
(`logo.png`, `api/catalogo`, `inicio/1.jpg`). Con eso el mismo bundle sirve igual en una
subcarpeta, en la raíz de un dominio propio o abierto desde el disco, y el nombre del
repositorio no aparece en ninguna parte.

El job `publicar` lo comprueba: si el `index.html` sale con una ruta absoluta, falla.

Esto funciona porque **la app nunca cambia la URL**: `avanzar` en `App.tsx` hace
`pushState(null, '')` sin tercer argumento, así que la barra de direcciones se queda en la
base. El día que haya enlaces profundos de verdad (`/receta/...`) hay que revisarlo, y
además Pages devuelve `404.html` con estado 404 para rutas que no existen como archivo.

**2. Pages no deja poner cabeceras HTTP.** Se perdieron la CSP, `Permissions-Policy`,
`Referrer-Policy`, `X-Content-Type-Options` y HSTS, que vivían en el Caddyfile. Está
anotado como pendiente en [SECURITY.md](SECURITY.md): la CSP se puede recuperar con
`<meta http-equiv>` en el `index.html`.

## Revertir

Se revierte el commit y se mergea.

```bash
git revert <sha>
```

El siguiente merge republica. Como el catálogo se genera en el build leyendo `data/`
(ADR-006), **revertir el código revierte también las recetas**: el sitio publicado siempre
corresponde a un commit entero.

Si hace falta ver qué se publicó y cuándo: **Actions → el run de `publicar`**, o
**Settings → Pages**, que muestra el último despliegue.

## Publicar a mano, sin esperar un merge

Para ver exactamente lo que se publicaría, sin publicarlo:

```bash
cd web && pnpm build && pnpm preview
```

`pnpm preview` sirve `dist/` tal cual. Si querés reproducir la subcarpeta de Pages, copiá
`dist/` dentro de una carpeta con el nombre del repositorio y servila desde el nivel de
arriba:

```bash
mkdir -p tmp/pages/cocinadas && cp -r web/dist/* tmp/pages/cocinadas/
cd tmp/pages && python3 -m http.server 8099
```

y abrí <http://localhost:8099/cocinadas/>. Es la forma de detectar una ruta absoluta antes
de que llegue a producción.

## El día que haya backend

Pages sirve archivos. Cuando las cocinadas tengan que salir del celular hay que traer un
servidor, y ahí hay dos caminos, analizados en
[ADR-017](adr/ADR-017-sitio-estatico-en-github-pages.md):

- **Orígenes separados** (front en Pages, API en un servidor): trae CORS y empuja el token
  de sesión a `localStorage`, porque una cookie entre sitios necesita `SameSite=None` y
  Safari la bloquea por omisión — y esto es una app de celular.
- **Un CDN delante de un dominio propio** (Cloudflare, `/api/*` al servidor): un solo
  origen, sin CORS y con cookie normal. Cuesta un dominio y es la mejor de las dos.

Lo que ya está preparado para ese día: el prefijo `api/` en las URL y el `Almacen`
inyectable de `historial/almacen.ts`, que hoy es `localStorage` y mañana puede ser un
cliente HTTP sin tocar las pantallas.
