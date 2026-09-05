# ADR-005: PostgreSQL para usuarios y cocinadas

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

Hay que persistir dos cosas: los usuarios (identidad, credenciales, perfil) y las
cocinadas (por cada vez que un usuario cocina una receta en una versión: la fecha, el
tiempo total y, por cada paso, el tiempo previsto y el real). Sobre las cocinadas hay una
consulta que define el producto: **el progreso por receta**, es decir, cómo evolucionó el
tiempo total y el desvío por paso a lo largo de las cocinadas de un usuario. Es una
agregación relacional pura: agrupar por usuario, receta y versión, ordenar por fecha,
comparar contra lo previsto.

El catálogo (recetas, ingredientes, utensilios) **no** va a la base: se lee de los JSON
del repositorio (ADR-006). Así que no hay documentos anidados de forma libre que guardar:
el único dato con estructura variable, el detalle por paso, tiene una forma fija
(`paso_id`, `previsto_s`, `real_s`).

Todo corre en una VM Always Free compartida con el broker y cuatro procesos más. El
usuario delegó la elección con la condición de justificarla acá.

Tamaño de imagen medido (`docker images`): `postgres:17-alpine` **424 MB**.

## Opciones consideradas

### 1. Una base de documentos (MongoDB)

Parecía natural porque una cocinada «es un documento» con su lista de pasos. No lo es
para este caso: la consulta principal cruza documentos (todas las cocinadas de una receta
para un usuario, ordenadas y comparadas), que es exactamente lo que una base relacional
hace con un `GROUP BY` y una base de documentos hace con un pipeline de agregación más
difícil de escribir y de indexar. Además el catálogo, que sí sería «documental», no va a
la base. Y la imagen oficial de MongoDB pesa varias veces más que la de PostgreSQL alpine
(no se midió acá; según Docker Hub, `mongo:8` supera los 800 MB).

### 2. SQLite en un volumen

La más liviana: sin proceso aparte, un archivo. Se descartó porque dos servicios
(usuarios y cocinadas) escriben en la base, y SQLite serializa las escrituras por
archivo con bloqueo; con dos procesos en contenedores distintos compartiendo un volumen
hay que coordinar el acceso a mano y los errores de bloqueo son difíciles de reproducir.
Sería la elección si hubiera un solo servicio con estado.

### 3. Una base de series temporales (TimescaleDB, InfluxDB)

El progreso «es una serie temporal», así que parecía buena. No lo es: son decenas de
puntos por usuario y receta, no millones por segundo; las funciones de ventana de
PostgreSQL alcanzan de sobra, y TimescaleDB es PostgreSQL con una extensión que se puede
agregar después sin migrar nada si alguna vez hiciera falta.

### 4. PostgreSQL 17

Relacional, con JSONB para lo que sea de forma variable, funciones de ventana para el
progreso, transacciones para registrar una cocinada con sus pasos de forma atómica,
imagen alpine de 424 MB, y un solo proceso que sirve a los dos servicios con un esquema
cada uno.

## Decisión

Una instancia de PostgreSQL 17 (`postgres:17-alpine`) en el compose, con el volumen
`postgres-datos`. **Un esquema por servicio** (`usuarios`, `cocinadas`) en la misma base,
y cada servicio accede solo al suyo: compartir el proceso ahorra memoria; compartir
tablas rompería la frontera del ADR-002. Lo que un servicio necesita del otro le llega
por eventos (ADR-003), no por consultas cruzadas.

Modelo previsto para cocinadas (se concreta en el cambio que lo implemente):
`cocinada(id, usuario_id, plato, version, fecha, total_previsto_s, total_real_s)` y
`cocinada_paso(cocinada_id, paso_id, previsto_s, real_s)`. El progreso es una consulta
sobre esas dos tablas con funciones de ventana.

Acceso desde Node con Drizzle (ADR-008).

## Consecuencias

### Positivas

- La consulta de progreso es SQL directo y se puede indexar por `(usuario_id, plato,
  version, fecha)`.
- Registrar una cocinada con sus pasos es una transacción; no queda nunca a medias.
- Una sola base que respaldar: el volumen `postgres-datos` es «el que importa».
- Puerta abierta a TimescaleDB o a JSONB si el modelo cambia, sin migrar de motor.

### Negativas

- Un proceso de 512 MB de techo en una VM chica; con la Micro AMD de 1 GB no entra con
  todo lo demás.
- Dos servicios en la misma instancia: una consulta pesada de uno afecta al otro.
  Mitigación: esquemas separados y, si hace falta, dos instancias sin cambiar el código
  (cada servicio tiene su propia `DATABASE_URL`).
- Hay que gestionar migraciones (ADR-008).

### Lo que no cambia

El catálogo sigue sin base de datos. Los servicios no comparten tablas.

## Cuándo revisar esta decisión

- Si alguna vez hay que guardar en la base documentos de forma libre y consultarlos por
  su interior: primero JSONB, y si no alcanza, este ADR se enmienda.
- Si la VM se queda sin memoria y PostgreSQL es el mayor consumidor: se separa a otra
  instancia o se baja `shared_buffers`, antes que cambiar de motor.
- Si un solo servicio termina teniendo estado: SQLite volvería a ser la opción liviana.

## Referencias

- [ADR-002](ADR-002-tres-microservicios.md), [ADR-006](ADR-006-catalogo-desde-el-repositorio-en-la-imagen.md), [ADR-008](ADR-008-drizzle-orm.md).
- `data/recetas/esquema-receta.md`: los `paso_id` estables contra los que se guardan los tiempos.
