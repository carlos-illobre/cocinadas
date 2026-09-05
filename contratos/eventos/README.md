# Contratos de eventos

Los mensajes que viajan por NATS JetStream (ADR-003) van en JSON con esquema versionado
en el repositorio (ADR-004). Acá vive la fuente de la verdad de cada esquema.

## Convención

- Un archivo por tipo de evento y versión: `<tipo-del-evento>.v<N>.schema.json`, en
  JSON Schema draft 2020-12.
- Todo evento va envuelto en el **sobre** (`sobre.v1.schema.json`): `tipo`, `version`,
  `id`, `fecha` y `datos`. El esquema del tipo describe solo `datos`.
- El `subject` de NATS es `templa.<servicio-emisor>.<tipo-del-evento>.v<N>`. Un cambio
  incompatible es una versión nueva y un subject nuevo; la vieja sigue viva hasta que el
  último consumidor migra, y ese retiro es un ADR.
- Cada servicio que emite o consume un evento **copia** el esquema a su carpeta
  (`src/contratos/`), porque cada servicio se construye solo con su carpeta (invariante 7).
  `tests/integration/contratos.sh` comprueba que las copias sean idénticas al original de
  acá; si divergen, el error nombra el archivo.

## Eventos

Todavía no hay eventos de dominio: el esqueleto define solo el sobre. Cuando aparezca el
primero, se agrega acá y se lo lista en esta tabla.

| Subject | Emisor | Consumidores | Esquema |
|---|---|---|---|
| — | — | — | — |
