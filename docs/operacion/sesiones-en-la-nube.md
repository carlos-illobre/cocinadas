# Sesiones de Claude Code en la nube

Las sesiones que trabajan en Cocinadas corren en la nube de Anthropic (claude.ai/code, o
**Cloud** en la app de escritorio). Clonan el repositorio, trabajan, suben a `main`, y el
CI publica el sitio en GitHub Pages como siempre.

No trabajen a la vez dos sesiones que suban a `main`.

## El entorno `cocinadas`

Se crea una vez, con **Add cloud environment**.

- **Acceso a internet:** personalizado, con la lista por defecto de gestores de paquetes
  incluida, más `cdn.playwright.dev`, `playwright.download.prss.microsoft.com` y
  `playwright.azureedge.net`, de donde Playwright baja el navegador de las pruebas.
- **Variables de entorno:** ninguna.
- **Script de preparación:** prepara la máquina, no el proyecto. Corre antes de que exista
  el clon, así que fija las versiones a mano.

```bash
#!/bin/bash
set -e
npm install -g pnpm@10.34.5
npx -y playwright@1.63.0 install --with-deps chromium
```

Las dos versiones tienen que coincidir con el repositorio: pnpm con `packageManager` de
`web/package.json`, Playwright con el de `web/pnpm-lock.yaml`. Si se actualiza alguna, se
cambia acá y en el entorno.

## Las dependencias y las skills

- `.claude/scripts/preparar-nube.sh` instala las dependencias de `web/` al empezar cada
  sesión (un hook `SessionStart` de `.claude/settings.json`). Fuera de la nube no hace nada.
- Las skills de animación (`animate`, `animation-performance`, `review-animations`,
  `find-animation-opportunities`, `improve-animations`) están copiadas en `.claude/skills/`
  porque la nube no tiene las globales del servidor. Son una versión adaptada: ninguna
  animación corre en el hilo principal. El detalle está en el `ADAPTATION.md` de cada una;
  no se actualizan reinstalando el paquete original.
