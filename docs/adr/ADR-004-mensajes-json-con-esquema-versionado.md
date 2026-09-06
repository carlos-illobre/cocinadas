# ADR-004: Mensajes JSON con esquema versionado en el repositorio

**Estado:** Superado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)
**Fecha:** 2026-09-05

---

## Contexto

Los eventos por NATS (ADR-003) necesitan un formato y una forma de evolucionar sin
romper a los consumidores. Hay tres servicios, todos en TypeScript, en un solo
repositorio, y el volumen es bajo (decenas de eventos por día por usuario). El usuario
eligió JSON con esquema versionado en el repositorio.

## Opciones consideradas

### 1. Avro con registro de esquemas

La opción «seria» del mundo Kafka: compatibilidad verificada por un servidor al
registrar cada versión. Se descartó porque suma un contenedor más (el Schema Registry,
que además está pensado para Kafka, no para NATS), y porque en un monorepo con tres
servicios del mismo equipo la compatibilidad se puede verificar con una prueba en el CI
sin un servidor de por medio.

### 2. Protobuf

Compacto y tipado, con generación de código TypeScript en el build. Se descartó porque el
ahorro de bytes es irrelevante a este volumen y porque agrega una etapa de generación de
código a cada servicio (invariante 7: cada servicio se construye solo con su carpeta; el
`.proto` habría que copiarlo igual que el JSON Schema, pero además compilarlo).

### 3. JSON con esquema JSON Schema versionado en el repositorio

Legible en los logs y en la consola de NATS, validable en tiempo de ejecución con la
misma biblioteca que Fastify ya usa para validar peticiones (Ajv), y versionable con un
número en el nombre del archivo y en el subject.

## Decisión

- Todo evento viaja envuelto en el **sobre** `contratos/eventos/sobre.v1.schema.json`:
  `tipo`, `version`, `id` (UUID, para deduplicar), `fecha` (UTC) y `datos`.
- Cada tipo de evento tiene su esquema `contratos/eventos/<tipo>.v<N>.schema.json`,
  draft 2020-12, que describe solo `datos`.
- Un cambio **compatible** (agregar un campo opcional) no cambia la versión. Un cambio
  **incompatible** (quitar o renombrar un campo, cambiar un tipo) es una versión nueva y
  un subject nuevo; la vieja sigue publicándose hasta que el último consumidor migra, y
  ese retiro es un ADR.
- Cada servicio **copia** los esquemas que usa a `src/contratos/` (invariante 7).
  `tests/integration/contratos.sh` comprueba que las copias sean idénticas al original.
- Emisor y consumidor validan contra el esquema. Un mensaje inválido se registra y se
  descarta; no se procesa a medias.

## Consecuencias

### Positivas

- Sin infraestructura extra; el esquema vive al lado del código y se revisa en el PR.
- Los eventos se leen a ojo en los logs y con `nats sub`.
- La misma biblioteca de validación para HTTP y para eventos.

### Negativas

- La compatibilidad la verifica una convención y una prueba, no un servidor: alguien
  puede romperla si ignora la regla del número de versión. La revisión del PR es la
  última barrera.
- Copiar esquemas a cada servicio es trabajo manual, aunque la prueba lo vigile.
- JSON ocupa más que Avro o Protobuf. A este volumen no importa.

### Lo que no cambia

El sobre es estable: los consumidores pueden enrutar por `tipo` y `version` sin conocer
el esquema de `datos`.

## Cuándo revisar esta decisión

- Si aparece un consumidor fuera del repositorio (otro equipo, otro lenguaje): ahí un
  registro de esquemas empieza a pagar su costo.
- Si el volumen hace que el tamaño de los mensajes pese en la red o en el disco de
  JetStream.

## Referencias

- [ADR-003](ADR-003-eventos-con-nats-jetstream.md).
- `contratos/eventos/README.md`.

---

## Enmienda (2026-09-06): superado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)

Sin eventos no hay mensajes que versionar. `contratos/eventos/` se borró junto con el
broker, y con él la prueba de integración que comparaba las copias.
