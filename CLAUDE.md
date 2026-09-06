# Cocinadas

Contexto que no se deduce leyendo el código. Lo demás está en el
[README](README.md), en [docs/](docs/) y en los [ADR](docs/adr/), que son la explicación
larga de cada decisión: antes de cambiar algo que tenga un ADR, leelo.

## Cómo se escribe acá

- **Todo en español**: nombres de variables y funciones, comentarios, mensajes de commit,
  documentación y textos de la app. Con voseo («tocá», «entrá», «verificá»).
- Los comentarios explican **por qué**, no qué hace la línea de al lado. Si un comentario
  se puede deducir del código, sobra.
- Mensajes de commit: qué cambió y por qué, en imperativo y en español.

## Invariantes que no se negocian

1. **Un solo `docker-compose.yml`.** Lo que cambia entre ambientes sale del `.env` y de
   ningún otro lado (ADR-001).
2. **Sin valores por omisión en la configuración.** El compose usa `${VAR:?}` y los
   servicios cortan el arranque si falta una variable. Fallar al arrancar es el único
   momento en que un error de configuración todavía es barato.
3. **Cobertura del 100 %** en los cuatro proyectos, con compuerta. Lo que no se puede
   probar se extrae a un módulo medible y afuera queda solo la llamada al sistema externo
   (ver `docs/TESTING.md` para las exclusiones, que son tres y están justificadas).
4. **El mutation testing no se corre en local**: tarda minutos. Corre en el job `mutacion`
   del CI, que informa y no reprueba. Solo se corre a mano si Carlos lo pide.
5. **El script de despliegue no se prueba ejecutándolo.** Se verifica leyéndolo y con
   `--dry-run`, que imprime cada comando remoto sin correrlo.

## El producto

- Es una app **solo para celular**. Guía una receta como una línea de tiempo viva.
- Las recetas son POE: las cuatro restricciones fijas son **cero desperdicio, sin sal
  agregada, una porción y el reloj arranca al abrir el freezer**. El tiempo declarado
  incluye descongelar, lavar y cortar; nunca se esconde tiempo.
- **Está gamificada, pero premia la precisión, no la velocidad**: los puntos salen de lo
  cerca que estuvo la cocinada de los tiempos de la receta (`src/xp.ts`, `puntosDe`). El
  criterio exacto todavía está por acordar con Carlos.
- El diseño de las pantallas sale del prototipo de Figma Make, que es la fuente:
  <https://www.figma.com/make/ktWkl4C92atKONL5GR4Gn5/Cocinadas>. Cambia seguido; el código
  fuente se lee desde el bundle de su preview, no desde el conector de Figma.
- Del prototipo se dejaron afuera a propósito: login por nombre, dificultad, y los
  cronómetros por paso independientes.

## Los datos son contenido, no código

`data/recetas/`, `data/ingredientes/` y `data/utencillos/` son el catálogo. Cada versión de
una receta es un HTML imprimible, un PDF y un **JSON que es lo que la app usa**
(`data/recetas/esquema-receta.md`). Los tres tienen que decir lo mismo; si se corrige uno,
se corrigen los otros. `python data/recetas/validar-receta.py` lo comprueba.

Las recetas las genera la skill `receta-poe-fitness`, que vive fuera del repositorio.

## Comandos

```bash
bash tests/utest.sh            # unitarias de todo, con la compuerta del 100 %
bash tests/itest.sh --rapido   # paridad de .env y contratos, sin levantar nada
bash tests/itest.sh            # lo anterior más el camino de punta a punta (stack arriba)
docker compose up -d --build   # levantar todo en local
python deployment/oracle-single/deploy.py --dry-run   # ver qué haría un despliegue
```

## Trampas conocidas

- **En Windows**, la carpeta del proyecto se llama `recetas` en minúscula aunque el
  explorador la muestre capitalizada. Instalar dependencias desde la ruta con otra
  capitalización deja los enlaces de pnpm apuntando a otro lado y React se carga dos
  veces, con un error que no dice la causa.
- **En la VM de Oracle corre otra aplicación** que usa el 80, el 443 y el 8080. Los
  puertos del host salen del `.env` (`PROXY_ADDR`, `PUERTO_*`) y el 80 y el 443 son de una
  sola aplicación: ver «Convivir con otra aplicación» en `docs/DEPLOYMENT.md`.
- Stryker necesita `"plugins": ["@stryker-mutator/vitest-runner"]` explícito con pnpm.
