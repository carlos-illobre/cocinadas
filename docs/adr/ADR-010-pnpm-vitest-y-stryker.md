# ADR-010: pnpm, Vitest y Stryker

**Estado:** Aceptado, enmendado por [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)
**Fecha:** 2026-09-05

---

## Contexto

Cuatro proyectos Node (tres servicios y el frontend), cada uno autocontenido con su
lockfile (invariante 7). Hacen falta un gestor de paquetes, un corredor de pruebas con
cobertura y umbral, y una herramienta de mutation testing. El usuario eligió pnpm y
Vitest; Stryker es la única herramienta madura de mutation testing para TypeScript.

## Opciones consideradas

### 1. npm + Jest

Lo más difundido. Se descartó porque Jest necesita `ts-jest` o Babel para TypeScript, y
para el frontend una configuración aparte de la de Vite; el mismo código se
transformaría de dos maneras distintas en pruebas y en build.

### 2. npm + Vitest

Era la recomendación: npm ya está instalado y no suma nada. El usuario prefirió pnpm por
velocidad de instalación y por el almacén de paquetes compartido en disco, que con cuatro
proyectos que repiten las mismas dependencias (Fastify, Vitest, Stryker, TypeScript)
evita cuatro copias.

### 3. pnpm + Vitest + Stryker

pnpm 10 con `packageManager` fijado en cada `package.json` y activado con corepack en los
Dockerfiles. Vitest 3 corre TypeScript sin transformación extra, mide cobertura con V8 y
falla si baja del umbral. Stryker 9 con `@stryker-mutator/vitest-runner`.

## Decisión

pnpm 10.34.5 fijado en `packageManager`; `pnpm install --frozen-lockfile` en Docker y en
el CI. Vitest 3 con `coverage.provider: 'v8'`, `all: true` y umbral 100 % en las cuatro
métricas, en cada proyecto. Stryker 9 con el plugin de Vitest **declarado explícitamente**
en `plugins` (con el `node_modules` estricto de pnpm, el descubrimiento automático de
`@stryker-mutator/*` no encuentra el corredor; se midió: sin `plugins`, «Cannot find
TestRunner plugin "vitest"» en los cuatro proyectos).

## Consecuencias

### Positivas

- Un solo corredor para backend y frontend, con la misma configuración de cobertura.
- Mutation testing desde el primer commit; en este esqueleto: 100 % en los tres servicios
  y 96,8 % en el frontend, con los dos sobrevivientes explicados en `docs/TESTING.md`.
- Instalaciones que reutilizan el almacén de pnpm.

### Negativas

- pnpm hay que instalarlo en cada máquina de desarrollo (`npm install -g pnpm@10`); en
  Docker y en el CI lo activa corepack.
- El `node_modules` estricto de pnpm rompe herramientas que dan por sentado el hoisting
  de npm (Stryker fue el primer caso; puede haber otros).
- En Windows, pnpm guarda en los enlaces de `node_modules` la ruta con la capitalización
  que se usó al instalar; si difiere de la real, Vite carga React dos veces
  (`docs/TESTING.md`, «Windows»).

### Lo que no cambia

Los scripts de cada `package.json` (`test`, `test:cov`, `mutation`, `build`) son la
interfaz; los corredores de `tests/` los invocan y no saben qué herramienta hay detrás.

## Cuándo revisar esta decisión

- Si el proyecto se abre a colaboradores externos que usan npm: fijar pnpm es una
  fricción y `packageManager` la hace explícita, pero conviene reevaluar.

## Referencias

- `docs/TESTING.md`.

---

## Enmienda (2026-09-06): [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)

pnpm y Vitest siguen igual, con la compuerta del 100 %. **Stryker se da de baja**: el
mutation testing corría en el CI sobre cuatro proyectos y, con uno solo y sin servidor, el
tiempo de CI que costaba dejó de pagarse. Los sobrevivientes que se habían analizado están
en docs/TESTING.md y siguen siendo válidos como registro.
