# ADR-007: Fastify como framework HTTP de los servicios

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

Los tres servicios son Node 22 + TypeScript (elección del usuario). Necesitan un servidor
HTTP con validación de entrada (los tiempos por paso llegan del navegador y hay que
validarlos), tipado, logs estructurados y facilidad para probar sin abrir puertos. El
usuario eligió Fastify entre las tres opciones planteadas.

## Opciones consideradas

### 1. Express

El más difundido, con más ejemplos. Se descartó porque no trae validación ni tipado: hay
que sumar y mantener a mano un validador, un logger y las definiciones de tipos, y cada
servicio lo haría a su manera.

### 2. NestJS

Framework completo con inyección de dependencias, módulos y decoradores. Parecía bueno
para «hacerlo bien desde el inicio». No lo es para tres servicios de una o dos rutas
cada uno: la ceremonia (módulos, proveedores, decoradores) supera al código de dominio,
y la inyección de dependencias por decoradores complica el mutation testing y las
pruebas unitarias sin el contenedor de Nest.

### 3. Fastify 5

Validación de esquemas JSON integrada con Ajv (la misma biblioteca sirve para validar
eventos, ADR-004), tipado TypeScript de primera clase, logger Pino incorporado, `inject()`
para probar rutas sin abrir puerto, y plugin oficial de OpenAPI para documentar la API
cuando haga falta.

## Decisión

Fastify 5 en los tres servicios. `crearApp()` arma la aplicación sin escucharla y es lo
que prueban las unitarias con `inject()`; `server.ts` es la única raíz de composición que
llama a `listen`. El nivel de logs sale de `LOG_LEVEL` del `.env`.

## Consecuencias

### Positivas

- Validación y tipos de entrada sin bibliotecas extra.
- Las pruebas de rutas corren en milisegundos sin red.
- Logs JSON estructurados listos para `docker compose logs`.

### Negativas

- Menos ejemplos en internet que Express; el ecosistema de plugins es más chico.
- La API de plugins de Fastify (encapsulación, `register`) tiene una curva propia.

### Lo que no cambia

El reverse proxy y el frontend no saben qué framework hay detrás.

## Cuándo revisar esta decisión

- Si los servicios crecen a decenas de módulos con dependencias cruzadas: NestJS vuelve
  a valer la pena.

## Referencias

- [ADR-004](ADR-004-mensajes-json-con-esquema-versionado.md).
