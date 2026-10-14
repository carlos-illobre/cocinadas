#!/bin/bash
# Prepara el proyecto al empezar una sesión de Claude Code en la nube: instala las
# dependencias de web/, que el script de preparación del entorno no puede instalar porque
# corre antes de que exista el clon. Fuera de la nube no hace nada.
# El entorno y su script están en docs/operacion/sesiones-en-la-nube.md.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
set -e
cd "$CLAUDE_PROJECT_DIR/web"
pnpm install --frozen-lockfile --reporter=silent
echo "Dependencias de web/ instaladas."
