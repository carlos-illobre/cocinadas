# ADR-002: Tres microservicios: catalogo, usuarios, cocinadas

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

El dominio tiene tres cosas con ritmos de cambio y necesidades distintas:

- **El catálogo** (recetas, ingredientes, utensilios) es contenido versionado en el
  repositorio, de solo lectura, que cambia cuando alguien escribe una receta nueva. No
  tiene estado por usuario.
- **Los usuarios** (registro, sesión, perfil) son datos personales con requisitos de
  seguridad propios y cambian poco.
- **Las cocinadas** (los tiempos reales de cada paso, cada vez que alguien cocina) son
  el estado que crece con el uso y lo que alimenta el gráfico de progreso.

El usuario quiere una arquitectura de microservicios desde el inicio y pidió esa división
como recomendada, con la alternativa de empezar con uno o dos.

## Opciones consideradas

### 1. Un solo servicio backend

Lo más barato hoy. Se descartó porque el usuario pidió microservicios explícitamente y
porque las tres responsabilidades tienen dependencias distintas: el catálogo no necesita
base de datos ni autenticación; usuarios y cocinadas sí. Meterlas en un proceso obliga a
que el catálogo arranque solo si PostgreSQL está arriba.

### 2. Dos servicios: catalogo, y usuarios+cocinadas juntos

Razonable: los dos comparten la base y la verificación de JWT. Se descartó porque
separar después lo que nació junto es el trabajo caro (partir tablas, partir código), y
lo que se gana hoy (un contenedor menos, unos 273 MB de imagen y 256 MB de memoria
menos, medidos en este esqueleto) no compensa. Además, cocinadas va a ser el servicio
que más cambie y más crezca; conviene que sus despliegues no toquen el de sesión.

### 3. Tres servicios: catalogo, usuarios, cocinadas

Cada uno con su imagen, su suite y su ciclo de despliegue. Es la opción elegida.

### 4. Más de tres (por ejemplo, separar «progreso» de «cocinadas»)

Parecía buena porque el progreso es una consulta de agregación distinta del registro.
No lo es: el progreso se calcula sobre los mismos datos que registra cocinadas, y
separarlo obliga a replicar esos datos por eventos para una sola consulta SQL. Se
revisa si el cálculo de progreso llega a necesitar recursos propios.

## Decisión

Tres microservicios en `microservices/`: `catalogo` (solo lectura, sin base),
`usuarios` (PostgreSQL, emite JWT) y `cocinadas` (PostgreSQL, verifica JWT). Más el
`frontend` como pieza propia (ADR-013) y el reverse proxy en `infrastructure/`.

## Consecuencias

### Positivas

- Cada servicio arranca solo con lo que necesita; el catálogo no depende de la base.
- Cocinadas puede desplegarse muchas veces sin tocar sesión ni catálogo.
- Las suites son chicas y rápidas.

### Negativas

- Tres imágenes, tres `package.json`, tres lockfiles: agregar una dependencia común se
  hace tres veces (invariante 7: la duplicación es deliberada).
- La verificación de JWT vive en dos servicios (ADR-012).
- Memoria: tres procesos Node en vez de uno, 256 MB de techo cada uno.

### Lo que no cambia

El frontend ve una sola API bajo `/api/<servicio>/`; que detrás haya uno o tres procesos
le es indiferente.

## Cuándo revisar esta decisión

- Si dos servicios terminan compartiendo la mayoría de sus tablas o necesitan
  transacciones entre sí: es la señal de que la frontera está mal puesta.
- Si un servicio no cambia en seis meses y su costo de operación pesa: se lo puede
  fusionar con su vecino.

## Referencias

- [ADR-003](ADR-003-eventos-con-nats-jetstream.md), [ADR-012](ADR-012-autorizacion-con-jwt.md).
