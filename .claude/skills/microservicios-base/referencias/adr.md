# Registros de decisiones de arquitectura (ADR)

## Cuándo hay que escribir uno

**Si hubo una alternativa razonable, hay un ADR.** No importa si la decisión parece
obvia hoy: el ADR existe para el que llegue en seis meses y no tenga el contexto.

Ejemplos reales que lo ameritaron: qué broker, cómo se serializan los mensajes, un solo
compose con el `.env`, dónde se despliega, si un componente va en su propio servicio, qué
lenguaje para un servicio en particular, cómo se maneja la autorización.

**No amerita ADR** una decisión sin alternativa —usar el cliente oficial de una
biblioteca que ya se eligió— ni una convención de estilo.

---

## Nombre y numeración

`docs/adr/ADR-NNN-titulo-en-kebab-case.md`, numerados de forma correlativa desde 001.

**El número se reserva al empezar a escribirlo, no al mergear.** Dos ramas largas en
paralelo terminan reclamando el mismo número; cuando pase, el que se mergea segundo
renumera. `docs/adr/README.md` mantiene el índice y sirve para ver qué números están
tomados.

---

## Estructura

```markdown
# ADR-NNN: Título en una línea

**Estado:** Aceptado
**Fecha:** AAAA-MM-DD

---

## Contexto

Qué problema hay y por qué hay que decidir algo. Los hechos que restringen la decisión,
con números cuando se puedan medir.

## Opciones consideradas

### 1. La que se descartó
Qué es y por qué se descartó.

### 2. La que se eligió
Qué es.

### 3. La que parecía buena y no lo era
**Esta sección es la que más se usa después.** Un ADR que sólo defiende lo que se eligió
no sirve para revisar la decisión: sirve para justificarla. Poné la mejor versión de las
alternativas, no un espantapájaros.

## Decisión

Qué se hace, en imperativo y sin ambigüedad.

## Consecuencias

### Positivas
### Negativas
Las de verdad, incluidas las que duelen. Un ADR sin consecuencias negativas es
propaganda.

### Lo que no cambia
Qué sigue funcionando igual. Evita que alguien suponga un impacto que no existe.

## Cuándo revisar esta decisión

Las condiciones concretas que la darían vuelta. Es lo que convierte al ADR en un
instrumento vivo en vez de un acta.

## Referencias

Enlaces a otros ADR y a la documentación relacionada.
```

---

## Enmiendas: nunca se reescribe un ADR viejo

Cuando una decisión posterior modifica una anterior, **el ADR viejo no se edita**: se le
agrega una sección al final.

```markdown
---

## Enmienda (ADR-0NN)

Qué cambió y por qué. Qué partes del ADR original siguen valiendo y cuáles quedaron
obsoletas — nombrándolas, para que el lector sepa qué creerle al texto de arriba.

→ [ADR-0NN](ADR-0NN-slug.md)
```

**Por qué:** un ADR registra qué se decidió *y con qué información*. Reescribirlo borra la
única prueba de que la decisión era razonable cuando se tomó, y hace imposible entender
por qué después cambió.

---

## Un ADR bien escrito, en dos señales

**Tiene números.** «Es más liviano» no ayuda a nadie; «267 MiB contra 13 MiB en la misma
instancia» sí. Si la afirmación se puede medir, medila antes de escribirla.

**Dice cómo se supo.** Un ADR que registra el experimento —qué se probó, qué salió, qué
se descartó por eso— es el que evita que alguien vuelva a proponer lo mismo dentro de tres
meses y haya que rehacer la medición.
