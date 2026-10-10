# Feature Specification: Progreso y juego

**Feature Branch**: `004-progreso-y-juego`

**Created**: 2026-10-10

**Status**: Baseline

**Input**: Especificación completa de la capacidad

Sobre cada cocinada hay un juego, y el juego existe para una sola cosa: que el plato salga
siempre igual. Por eso **premia la precisión y no la velocidad**: da experiencia acercarse
al tiempo previsto, tanto por arriba como por abajo, y terminar antes no vale más que
terminar justo. Al cerrar una receta, quien cocina ve cómo le fue y cuántos puntos sumó; la
cocinada se guarda sola en su teléfono, y con todas sus cocinadas la app arma su nivel, sus
logros y su historial por receta.

Vocabulario que usa esta especificación:

- **Cocinada**: una receta cocinada de punta a punta (la capacidad de cocinar, RF-11 a
  RF-20, define cómo se llega hasta ahí).
- **Tiempo previsto** o **tiempo objetivo**: el que declara la receta, para el total, para
  cada etapa y para cada paso.
- **Tiempo real**: el que llevó de verdad. El total real es la suma de lo que duró cada
  etapa.
- **Desvío**: real menos previsto. Positivo es que se tardó de más; negativo, de menos.
- **En tiempo**: una cocinada cuyo total real quedó a menos del 10 % del total previsto,
  por arriba o por abajo.
- **Paso a tiempo**: un paso cuyo tiempo real no superó su tiempo previsto.
- **Experiencia (XP)**: la suma de los puntos de todas las cocinadas guardadas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver cómo me fue y cuántos puntos sumé (Priority: P1)

Al terminar la receta, quien cocina toca el botón de resultados y ve el festejo, su tiempo
real contra el previsto, cuántos puntos ganó y por qué, los logros que consiguió con esa
cocinada y cada paso con su desvío. No tiene que hacer nada para guardarla.

**Why this priority**: es el cierre del flujo central y lo que convierte una receta
cocinada en un entrenamiento medible.

**Independent Test**: con un reloj controlado se cocina una receta con tiempos conocidos y
se comprueba cada número de los resultados y que la cocinada quedó guardada.

**Acceptance Scenarios**:

1. **Given** una receta de 20:00 previstos y 8 pasos, cocinada en 20:30 con 6 pasos sin
   pasarse de su tiempo, **When** se ven los resultados, **Then** el desglose dice 200 por
   completar la receta, 100 de bonus por tiempo y 60 por pasos a tiempo, total 360.
2. **Given** una receta de 20:00 previstos y 8 pasos, cocinada en 23:00 con 3 pasos a
   tiempo, **When** se ven los resultados, **Then** el desglose dice 200, bonus 0 y 30,
   total 230: el desvío es del 15 %, fuera del margen.
3. **Given** una receta de 20:00 previstos y 8 pasos, cocinada en 15:00 con los 8 pasos a
   tiempo, **When** se ven los resultados, **Then** el desglose dice 200, bonus 0 y 80,
   total 280: terminar un 25 % antes tampoco da el bonus.
4. **Given** una receta de 20:00 previstos, **When** se la cocina en 18:01 o en 21:59,
   **Then** hay bonus (el desvío es menor al 10 %, que son 2:00); **When** se la cocina en
   17:59 o en 22:01, **Then** no lo hay.
5. **Given** una receta de 20:00 previstos cocinada en exactamente 22:00 o en exactamente
   18:00, **When** se ven los resultados, **Then** [NEEDS CLARIFICATION: un desvío de
   exactamente el 10 %, ¿da el bonus de 100 puntos o no?].
6. **Given** un paso previsto en 2:00, **When** se lo termina en 2:00 justo, **Then**
   cuenta como paso a tiempo y suma 10; **When** se lo termina en 2:01, **Then** no suma;
   **When** se lo termina en 0:40, **Then** suma 10: en un paso, ir más rápido no es un
   error.
7. **Given** una cocinada en la que todos los pasos se pasaron de su tiempo, **When** se
   ven los resultados, **Then** el total es 200 si no estuvo en tiempo: completar la receta
   siempre vale.
8. **Given** la tarjeta «¡Receta completada!» de la cocina, **When** se toca su botón,
   **Then** arrancan el confeti y el sonido de festejo, y se ven: el tiempo real contra el
   previsto, el desglose de puntos, los logros nuevos y el paso a paso con el desvío de
   cada paso.
9. **Given** los resultados recién abiertos, **When** no se toca nada más, **Then** la
   cocinada ya quedó guardada en el teléfono, una sola vez, y la pantalla lo dice; no hay
   ninguna acción para guardar ni para descartar.
10. **Given** los resultados de una cocinada, **When** se toca la acción para seguir,
    **Then** se va al historial, donde esa cocinada ya figura.
11. **Given** una receta con dos etapas y una pausa de 5:00 entre ellas, **When** se ven
    los resultados, **Then** el tiempo real total es la suma de lo que duró cada etapa.
    [NEEDS CLARIFICATION: el tiempo que se pasa en la pausa entre etapas, ¿queda afuera
    del tiempo real total con el que se calculan el bonus y el historial?]
12. **Given** el teléfono con «reducir movimiento» activado, **When** se ven los
    resultados, **Then** no hay confeti ni rebotes y todos los números se ven igual.

---

### User Story 2 - Subir de nivel cocinando (Priority: P2)

Cada cocinada suma experiencia, y la experiencia acumulada define un nivel, de Aprendiz a
Chef Maestro. Quien cocina ve su nivel y cuánto le resta para el siguiente.

**Why this priority**: es lo que hace volver a cocinar la misma receta; el flujo central
funciona sin esto.

**Independent Test**: se cargan cocinadas con puntajes conocidos y se comprueba el nivel
que corresponde a cada total de experiencia.

**Acceptance Scenarios**:

1. **Given** una persona sin cocinadas guardadas, **When** mira su nivel, **Then** es
   Aprendiz, nivel 1, con 0 de experiencia.
2. **Given** una persona con 499 de experiencia, **When** mira su nivel, **Then** es
   Aprendiz; **Given** 500, **Then** es Cocinero, nivel 2.
3. **Given** una persona con 1.499 de experiencia, **Then** es Cocinero; **Given** 1.500,
   **Then** es Sous Chef, nivel 3.
4. **Given** una persona con 2.999 de experiencia, **Then** es Sous Chef; **Given** 3.000,
   **Then** es Chef, nivel 4.
5. **Given** una persona con 4.999 de experiencia, **Then** es Chef; **Given** 5.000 o
   más, **Then** es Chef Maestro, nivel 5.
6. **Given** tres cocinadas guardadas de 360, 230 y 280 puntos, **When** se mira la
   experiencia, **Then** es 870, la suma, y el nivel es Cocinero con 370 recorridos de los
   1.000 que separan Cocinero de Sous Chef (37 %).
7. **Given** una persona en Chef Maestro, **When** mira la barra de experiencia, **Then**
   [NEEDS CLARIFICATION: en el último nivel, ¿qué muestran la barra y la leyenda de cuánto
   resta para el nivel siguiente? ¿La barra queda llena, o hay una meta más allá de los
   5.000?].
8. **Given** la lista de recetas, **When** se la abre, **Then** se ve la barra de
   experiencia con el nivel y los puntos.

---

### User Story 3 - Conseguir logros (Priority: P2)

Hay cuatro logros, y ninguno premia la velocidad: premian cocinar, llegar cerca de los
tiempos de la receta y volver a cocinar. Quien cocina ve cuáles tiene y cuáles no, y se
entera en los resultados cuando consigue uno.

**Why this priority**: refuerza el juego; no bloquea cocinar.

**Independent Test**: se cargan historiales armados para cada logro y se comprueba cuáles
figuran conseguidos.

**Acceptance Scenarios**:

1. **Given** una persona sin cocinadas, **When** mira sus logros, **Then** ve los cuatro
   («Primera receta», «En tiempo», «Sin pasarse», «Racha de 3»), ninguno conseguido.
2. **Given** una persona sin cocinadas, **When** termina su primera cocinada, **Then**
   consigue «Primera receta», y los resultados de esa cocinada lo muestran como logro
   nuevo.
3. **Given** una cocinada en tiempo (misma regla del 10 % que el bonus), **When** se
   guarda, **Then** se consigue «En tiempo»; una cocinada que da el bonus siempre da el
   logro, y una que no lo da nunca lo da.
4. **Given** una cocinada con 3 pasos críticos, los 3 terminados sin pasarse de su tiempo,
   **When** se guarda, **Then** se consigue «Sin pasarse»; con 2 de 3, no.
5. **Given** una cocinada de una receta que no tiene ningún paso crítico, **When** se
   guarda, **Then** [NEEDS CLARIFICATION: una cocinada sin ningún paso crítico, ¿cuenta
   para «Sin pasarse»?].
6. **Given** cocinadas guardadas un lunes, un martes y un miércoles seguidos, **When** se
   miran los logros, **Then** «Racha de 3» está conseguido.
7. **Given** cocinadas guardadas un lunes, un martes y un jueves, **When** se miran los
   logros, **Then** «Racha de 3» no está conseguido; dos cocinadas en el mismo día cuentan
   como un solo día.
8. **Given** una persona que ya tiene «Primera receta», **When** termina otra cocinada,
   **Then** los resultados no lo muestran de nuevo como logro nuevo.
9. **Given** una persona que consiguió «Racha de 3» y después dejó de cocinar una semana,
   **When** mira sus logros, **Then** [NEEDS CLARIFICATION: «Racha de 3», una vez
   conseguido, ¿queda para siempre, o se pierde cuando la racha se corta?].

---

### User Story 4 - Ver mi historial de cada receta (Priority: P2)

Por cada receta que cocinó, quien cocina ve todas sus cocinadas como puntos contra la línea
del tiempo objetivo. Acercarse a la línea es mejorar; quedar lejos, por arriba o por abajo,
es lo mismo.

**Why this priority**: es la herramienta de autoevaluación (la que más adelante usan
alumnos y cocineros); necesita cocinadas guardadas.

**Independent Test**: se cargan cuatro cocinadas de una receta con tiempos conocidos y se
comprueba la posición de cada punto respecto de la línea.

**Acceptance Scenarios**:

1. **Given** una persona sin cocinadas, **When** abre el historial, **Then** ve un mensaje
   que explica que al terminar una receta se guarda sola y que ahí va a ver cómo mejora.
2. **Given** cuatro cocinadas de una receta de 20:00 previstos, **When** se abre el
   historial, **Then** hay un gráfico con cuatro puntos, en orden de la más antigua a la
   más reciente, y una línea horizontal en 20:00, el objetivo.
3. **Given** una cocinada de 22:00 y otra de 18:00 contra un objetivo de 20:00, **When**
   se mira el gráfico, **Then** los dos puntos están a la misma distancia de la línea, uno
   arriba y otro abajo: la escala es simétrica y la línea del objetivo queda en el centro.
4. **Given** una sola cocinada, clavada en el objetivo, **When** se mira el gráfico,
   **Then** la línea del objetivo sigue en el centro, con espacio arriba y abajo.
5. **Given** cocinadas de dos recetas distintas, **When** se abre el historial, **Then**
   se puede elegir de qué receta ver el historial, y cada receta tiene su gráfico.
6. **Given** el historial de una receta, **When** se mira la lista de cocinadas, **Then**
   cada una dice su fecha y hora, el modo de preparación, su tiempo real y su desvío
   contra lo previsto.
7. **Given** una receta cocinada dos veces en modo fácil (25:00 previstos) y una en modo
   difícil (20:00 previstos), **When** se mira su gráfico, **Then** [NEEDS CLARIFICATION:
   cuando una receta se cocinó en modos distintos, que tienen tiempos objetivo distintos,
   ¿contra qué objetivo se dibujan los puntos: un gráfico por modo, o todos juntos contra
   un solo objetivo, y cuál?].
8. **Given** el historial con cocinadas guardadas, **When** se cierra y se vuelve a abrir
   la app, **Then** las cocinadas siguen ahí.

---

### User Story 5 - Ver mi perfil (Priority: P3)

En una pantalla, quien cocina ve quién es en el juego: su nivel, su experiencia, cuántas
recetas cocinó, cuántos minutos pasó en la cocina y sus logros.

**Why this priority**: reúne lo que ya se ve en otras pantallas.

**Independent Test**: con un historial conocido se comprueban los cinco datos.

**Acceptance Scenarios**:

1. **Given** una persona sin cocinadas, **When** abre el perfil, **Then** ve Aprendiz,
   nivel 1, 0 de experiencia, 0 recetas cocinadas, 0 minutos en la cocina y 0 de 4 logros.
2. **Given** tres cocinadas guardadas que suman 870 puntos y 61:30 de tiempo real,
   **When** se abre el perfil, **Then** dice Cocinero, nivel 2, 870 de experiencia, 3
   recetas cocinadas y 62 minutos en la cocina (el total, redondeado al minuto).
3. **Given** una persona con dos logros conseguidos, **When** abre el perfil, **Then** ve
   los cuatro logros, cada uno con su nombre y qué pide, los dos conseguidos marcados como
   tales, y la cuenta «2/4».
4. **Given** tres cocinadas de la misma receta, **When** se abre el perfil, **Then**
   «recetas cocinadas» dice 3. [NEEDS CLARIFICATION: «recetas cocinadas», ¿cuenta
   cocinadas (tres veces la misma receta son 3) o recetas distintas (son 1)?]

---

### User Story 6 - Compararme con otros en una tabla de posiciones (Priority: P4)

Quien cocina ve en qué lugar está entre los demás, según su experiencia, que ya premia la
precisión y no la velocidad. Es de un lanzamiento posterior al primero y necesita cuentas
(RF-30): figurar en una tabla que ven otros es compartir, y nada que se comparte se hace
sin cuenta.

**Why this priority**: es social; no existe sin cuentas ni servidor.

**Independent Test**: con dos cuentas con experiencia distinta, cada una ve a las dos en
la tabla, ordenadas.

**Acceptance Scenarios**:

1. **Given** dos personas con cuenta, una con 1.200 de experiencia y otra con 800,
   **When** cualquiera abre la tabla de posiciones, **Then** la de 1.200 figura por encima
   de la de 800.
2. **Given** una persona sin cuenta, **When** cocina, **Then** su progreso sigue
   guardándose solo en su teléfono y no figura en la tabla.

---

### User Story 7 - Compartir mi progreso en Instagram (Priority: P4)

Al terminar una cocinada, quien cocina obtiene una imagen con su resultado, lista para
publicar como historia de Instagram. Es de un lanzamiento posterior al primero.

**Why this priority**: es difusión; el juego funciona sin esto.

**Independent Test**: se termina una cocinada, se pide la imagen y se comprueba que trae
el resultado de esa cocinada.

**Acceptance Scenarios**:

1. **Given** los resultados de una cocinada, **When** se elige compartir, **Then** se
   obtiene una imagen con el tiempo, la precisión y el logro de esa cocinada, en el formato
   de una historia de Instagram.

---

### Edge Cases

- **Una receta sin tiempo previsto** (total previsto cero): no puede estar en tiempo; no
  hay bonus ni logro «En tiempo».
- **Una cocinada sin pasos registrados**: suma 200 por completar y nada por pasos; la
  precisión se informa como 0 %, sin error.
- **Lo guardado está dañado o tiene elementos que no son cocinadas**: lo que no se puede
  leer se ignora y el resto se usa; la app no se rompe ni borra lo demás.
- **El teléfono no deja guardar**: los resultados se ven igual y la cocinada cuenta
  mientras la app esté abierta.
- **La receta cambia sus tiempos después de una cocinada**: los puntos de esa cocinada no
  cambian, porque cada cocinada guarda los tiempos previstos con los que se cocinó.
- **Cambian las reglas del juego**: como la experiencia y los logros se calculan a partir
  de las cocinadas guardadas, una regla nueva se aplica a todo el historial y no deja nada
  guardado inválido.
- **Dos cocinadas el mismo día**: para la racha cuentan como un día. El día es el del
  calendario del teléfono, en su zona horaria.
- **Pasos reiniciados**: el tiempo real de un paso que se reinició es una pregunta abierta
  en la capacidad de cocinar (RF-12).
- **Borrar o llevarse el historial**: [NEEDS CLARIFICATION: ¿quien cocina tiene que poder
  borrar una cocinada o todo su historial, y exportarlo e importarlo a mano para no
  perderlo al cambiar de teléfono?]
- **Cambio de teléfono o datos del navegador borrados**: el historial se pierde (riesgo
  R-07). Lo resuelve RF-34 cuando existan las cuentas.

## Requirements *(mandatory)*

### Functional Requirements

- **RF-21**: Resultados al terminar. Al tocar el botón de la tarjeta «¡Receta completada!»,
  la app DEBE mostrar el festejo (confeti y sonido), el tiempo real total contra el
  previsto, el desglose de puntos, los logros nuevos de esa cocinada y el paso a paso con
  el desvío de cada paso. La cocinada se guarda sola en ese momento, una sola vez; no
  existe «salir sin guardar». Los puntos de una cocinada son la suma de:
  - **200** por completar la receta, siempre;
  - **100** más si el total real quedó a menos del 10 % del total previsto. El margen es
    simétrico a propósito: vale por arriba y por abajo, así que terminar mucho antes
    tampoco da el bonus;
  - **10** por cada paso que no se pasó de su tiempo previsto (tiempo real menor o igual al
    previsto). Cuentan todos los pasos de la receta, sean críticos o no.

  Se premia la precisión, no la velocidad: ninguna regla de puntos DEBE dar más por
  terminar antes.
- **RF-22**: Niveles y logros.
  - La experiencia es la suma de los puntos de todas las cocinadas guardadas.
  - Niveles, con la experiencia desde la que empieza cada uno: **Aprendiz** (0),
    **Cocinero** (500), **Sous Chef** (1.500), **Chef** (3.000) y **Chef Maestro**
    (5.000). Chef Maestro es el último.
  - Logros, cuatro: **«Primera receta»** (tener al menos una cocinada guardada); **«En
    tiempo»** (alguna cocinada en tiempo, con la misma regla del 10 % que el bonus: nunca
    pueden discrepar); **«Sin pasarse»** (todos los pasos críticos a tiempo en una misma
    cocinada); **«Racha de 3»** (cocinadas en tres días seguidos).
  - La experiencia, el nivel y los logros se calculan a partir de las cocinadas guardadas;
    NO DEBEN guardarse aparte.
  - Los logros que una cocinada consigue por primera vez se muestran en sus resultados.
  - El perfil muestra nivel, experiencia, recetas cocinadas, minutos en la cocina y
    logros. La lista de recetas muestra la barra de experiencia.
- **RF-23**: Historial por receta. La app DEBE mostrar, por cada receta cocinada, cada
  cocinada como un punto contra la línea del tiempo objetivo, en orden cronológico y con
  escala simétrica alrededor del objetivo: la distancia a la línea es el desempeño, igual
  por arriba que por abajo. El historial vive en el teléfono y se conserva al cerrar la
  app.
- **RF-24**: Tabla de posiciones entre usuarios, a partir de la experiencia. Es de un
  lanzamiento posterior al primero y exige cuenta (RF-30, RF-31). [NEEDS CLARIFICATION:
  ¿entre quiénes se compara (todos, los que uno sigue, los de un curso o un restaurante),
  en qué período (histórico, semanal, mensual), general o por receta, y de qué lanzamiento
  es?]
- **RF-25**: Compartir el progreso en Instagram: al terminar una cocinada, una imagen con
  el resultado (tiempo, precisión, logro) lista para publicar como historia. Es de un
  lanzamiento posterior al primero. [NEEDS CLARIFICATION: ¿compartir exige cuenta, o
  alcanza con generar la imagen en el teléfono para que la persona la publique? ¿La imagen
  lleva la marca y un enlace a la receta?]

### Key Entities *(include if feature involves data)*

- **Cocinada**: una receta terminada. Tiene qué receta y qué modo de preparación fue, la
  fecha y hora en que terminó, el total previsto y el total real, cada etapa con su
  previsto y su real, cada paso con su previsto, su real y si era crítico, y cuántos pasos
  críticos tenía y cuántos se hicieron a tiempo. Es el único dato del juego que se guarda.
- **Historial**: todas las cocinadas guardadas en el teléfono.
- **Puntos de una cocinada**, **experiencia**, **nivel**, **logros** y **progreso por
  receta**: se calculan a partir del historial cada vez que se necesitan. No se guardan.

El detalle de qué se guarda y dónde está en `data-model.md`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: para cualquier cocinada, los puntos que muestra la app coinciden con la
  cuenta a mano de las tres reglas de RF-21.
- **SC-002**: dos cocinadas de la misma receta con el mismo desvío absoluto, una por
  arriba y otra por abajo, reciben el mismo bonus y quedan a la misma distancia de la
  línea en el historial.
- **SC-003**: ninguna cocinada terminada se pierde: el 100 % queda guardado sin que la
  persona haga nada.
- **SC-004**: borrando todo lo calculado y dejando solo las cocinadas guardadas, la app
  muestra la misma experiencia, el mismo nivel y los mismos logros.
- **SC-005**: quien cocina la misma receta varias veces ve en el historial, de un vistazo,
  si se está acercando al tiempo objetivo.
- **SC-006**: todo lo anterior funciona sin cuenta y sin internet.

## Assumptions

- La cocinada llega completa desde la capacidad de cocinar: tiempos reales por paso y por
  etapa medidos en segundos enteros.
- El criterio de puntos es el que Carlos confirmó el 2026-09-07 y no se cambia sin
  preguntarle.
- La gamificación es del primer lanzamiento y no lo bloquea (decisión 24 del 2026-10-09).
- Del diseño original se dejaron afuera a propósito: el ingreso por nombre, la dificultad
  y el cartel modal de «Logro desbloqueado».
- Mientras no existan las cuentas, el historial es de un solo teléfono (RNF-05). Cuando
  existan, RF-34 lo lleva a la cuenta conservando lo que ya estaba en el teléfono.
- El seguimiento de alumnos y cocineros por parte de docentes y supervisores (RF-41,
  RF-42) se apoya en estos mismos datos, pero es de otra capacidad.

## Clarifications

### Session 2026-09-07

- Q: ¿Con qué criterio se dan los puntos de una cocinada? → A: 200 por completar la
  receta, 100 más si el total quedó a menos del 10 % del previsto y 10 por cada paso que
  no se pasó de su tiempo (decisión 14).
- Q: ¿El margen del 10 % vale solo si se tarda de más? → A: No: es simétrico a propósito,
  vale por arriba y por abajo. Terminar mucho antes tampoco da el bonus. Se premia la
  precisión, no la velocidad.
- Q: ¿El logro «En tiempo» usa otra regla? → A: No, la misma del 10 %.

### Session 2026-09 (sesiones de septiembre, sin día registrado)

- Q: ¿Se puede terminar una receta sin guardarla? → A: No. La cocinada se guarda siempre
  al terminar; no existe «salir sin guardar» (decisión 15).
- Q: ¿Hay un prototipo de diseño aparte? → A: No. La interfaz que Carlos aprobó al verla
  es la fuente de verdad del diseño (decisión 13).

### Session 2026-09-15

- Q: ¿Qué lugar tiene el juego en la app? → A: El flujo central es elegir una receta y que
  la app la lleve paso a paso, ganando experiencia y logros. Todo lo demás se suma
  alrededor de eso y no lo reemplaza (decisión 18).

### Session 2026-10-09

- Q: ¿La gamificación es del primer lanzamiento? → A: Sí, es de ahora; no es bloqueante,
  como sí lo son los cronómetros y las alarmas (decisión 24).
- Q: ¿Se exige cuenta para ver el progreso o guardar el puntaje? → A: No. Sin cuenta se
  puede leer todo y guardar en el propio teléfono: cocinar, ver el progreso y guardar el
  puntaje, sin compartirlo con otro dispositivo. Nada que se escriba en el servidor se
  hace sin cuenta (decisión 27).
- Q: ¿Qué pasa con el historial cuando existan las cuentas? → A: Con cuenta, el historial
  y el progreso se guardan en la cuenta, y se conserva lo que ya estaba en el teléfono
  (RF-34).
