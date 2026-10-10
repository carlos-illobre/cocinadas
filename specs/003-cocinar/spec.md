# Feature Specification: Cocinar

**Feature Branch**: `003-cocinar`

**Created**: 2026-10-10

**Status**: Baseline

**Input**: Especificación completa de la capacidad

Cocinar es el centro de la app: quien eligió una receta junta lo que necesita, y la app lo
lleva paso a paso con el reloj en la mano. Muestra la tarea de ahora, lo que corre solo en
paralelo y la línea de tiempo de la etapa; avisa con sonido y vibración cuando algo vence, y
no pierde la cocinada si la app se cierra. Todo se hace sin cuenta y sin escribir nada fuera
del teléfono.

Vocabulario que usa esta especificación:

- **Receta (POE)**: la define la capacidad de catálogo (RF-02, RF-03, RF-05). Tiene una o
  más **etapas**; cada etapa tiene su propio reloj, **pasos** y **procesos**.
- **Paso**: trabajo de manos. Los pasos de una etapa van en orden y no se solapan. Cada uno
  tiene minuto previsto de inicio, duración prevista, sub-pasos, etiquetas de qué cuida, un
  porqué, y dice si es **crítico** (pasarse arruina el plato) y si es una **espera** (no hay
  tarea de manos: se espera a que venza algo).
- **Proceso**: algo que corre solo mientras las manos hacen otra cosa (un descongelado, una
  olla al fuego). Tiene duración prevista y dice si es **crítico**: si al vencer hay que
  actuar de inmediato.
- **Etapa crítica**: la receta declara, por etapa, si pasarse de tiempo altera el plato. Una
  etapa que no es crítica es **tranquila**.
- **Cocinada**: una vez que se cocina una receta, de punta a punta. Mientras no terminó es la
  **cocinada en curso**.
- **Cronómetro**: todo reloj que la pantalla de cocina muestra corriendo: el de la etapa, el
  del paso y la cuenta regresiva de cada proceso.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Juntar todo antes de empezar (Priority: P1)

Antes de que arranque el reloj, quien cocina repasa la lista de todo lo que la receta pide,
utensilios e ingredientes, cada uno con su foto, y tilda lo que ya tiene en la mesada. No
puede empezar a cocinar hasta tener todo tildado.

**Why this priority**: una receta es un POE con tiempos críticos; empezar sin el rallador en
la mano es como se pierde ese tiempo. Sin esta compuerta, los tiempos del resto de la
cocinada no significan nada.

**Independent Test**: se abre la mise en place de una receta, se comprueba que no deja
cocinar, se tilda todo y se comprueba que recién entonces deja pasar a la cocina.

**Acceptance Scenarios**:

1. **Given** una receta con 3 utensilios y 4 ingredientes, **When** se abre su mise en
   place, **Then** se ven los 7 items, los utensilios y los ingredientes en listas
   separadas, cada uno con su nombre y su foto, los ingredientes además con su cantidad,
   ninguno tildado, y un contador que dice «0 de 7».
2. **Given** la mise en place con 0 de 7 tildados, **When** se toca un item, **Then** queda
   tildado y el contador dice «1 de 7»; **When** se lo toca de nuevo, **Then** se destilda y
   el contador vuelve a «0 de 7».
3. **Given** la mise en place con 6 de 7 tildados, **When** se intenta empezar a cocinar,
   **Then** no se puede: la acción de cocinar está deshabilitada y dice cuántos items
   restan.
4. **Given** la mise en place con 7 de 7 tildados, **When** se toca la acción de cocinar,
   **Then** se pasa a la cocina y recién ahí arranca el reloj de la primera etapa.
5. **Given** la mise en place con algunos items sin tildar, **When** se toca «Marcá todos
   los items para continuar», **Then** quedan todos tildados; **When** se toca otra vez esa
   misma acción, **Then** quedan todos sin tildar.
6. **Given** un item de la receta que no tiene foto (por ejemplo, agua), **When** se abre la
   mise en place, **Then** el item aparece igual, por su nombre, y se puede tildar.
7. **Given** un item con foto, **When** se toca la foto, **Then** la foto se amplía y no
   cambia si el item está tildado o no; **When** se toca en cualquier lado, **Then** se
   cierra.

---

### User Story 2 - Seguir la receta paso a paso contra el reloj (Priority: P1)

Quien cocina ve una sola cosa por vez: la tarea de ahora, con su foto, sus sub-pasos para
tildar, las etiquetas de qué cuida el paso, el porqué a un toque, y un cronómetro que
compara lo que lleva con lo previsto. Cuando termina, toca «Listo» y la app le muestra el
paso siguiente.

**Why this priority**: es el flujo central del producto (decisión del 2026-09-15): elegir
una receta y que la app la lleve paso a paso. Todo lo demás se suma alrededor.

**Independent Test**: se cocina una receta de una etapa y tres pasos con un reloj
controlado, y se comprueba que cada «Listo» registra el tiempo real del paso y muestra el
siguiente.

**Acceptance Scenarios**:

1. **Given** una receta recién empezada, **When** se abre la cocina, **Then** se ve el
   nombre de la etapa, «Paso 1 de M» (M es la cantidad de pasos de la etapa), el reloj de la
   etapa en 0:00 con su duración prevista, y la tarjeta del primer paso con el cronómetro en
   0:00 contra su duración prevista.
2. **Given** un paso con duración prevista de 2:00 que empezó hace 45 segundos, **When** se
   mira la tarjeta, **Then** el cronómetro dice 0:45 de 2:00 previstos.
3. **Given** un paso con tres sub-pasos, **When** se toca uno, **Then** queda tildado;
   **When** se lo toca de nuevo, **Then** se destilda.
4. **Given** un paso en curso, **When** se toca el «?», **Then** aparece el porqué del paso;
   **When** se pasa al paso siguiente, **Then** el porqué vuelve a estar cerrado.
5. **Given** un paso con duración prevista de 2:00 que lleva 1:50, **When** se toca
   «Listo», **Then** el paso queda registrado con 1:50 reales contra 2:00 previstos, la
   pantalla muestra el paso siguiente desde arriba, con su cronómetro en 0:00 y sus
   sub-pasos sin tildar, y suena un toque de confirmación.
6. **Given** un paso con duración prevista de 2:00 en una etapa crítica, **When** pasan
   2:12, **Then** la tarjeta late en rojo, el cronómetro muestra el exceso (+0:12) y nada
   de la tarjeta queda en verde salvo los tildes de los sub-pasos.
7. **Given** un paso con duración prevista de 2:00 en una etapa tranquila, **When** pasan
   2:12, **Then** la tarjeta late en ámbar, no en rojo, y dice que en esa etapa pasarse no
   cambia el plato.
8. **Given** un paso que lleva 1:30 con dos sub-pasos tildados, **When** se toca el botón
   de reiniciar el paso, **Then** el cronómetro del paso vuelve a 0:00 y los sub-pasos
   quedan sin tildar, y ni el reloj de la etapa ni los procesos que corren se alteran.
9. **Given** una receta que deja 30 segundos libres entre el final previsto de un paso y el
   inicio previsto del siguiente, **When** se toca «Listo» en el primero, **Then** la
   tarjeta del siguiente muestra una cuenta regresiva de 0:30 para empezar, y el tiempo real
   de ese paso se cuenta desde que la cuenta llega a cero.
10. **Given** un paso con foto, **When** se toca la foto, **Then** se amplía; **When** se
    toca en cualquier lado o se pasa de paso, **Then** se cierra.

---

### User Story 3 - Vigilar lo que corre solo y enterarse cuando vence (Priority: P1)

Mientras las manos hacen un paso, hay cosas que corren solas: el agua que calienta, los
camarones que se descongelan. Quien cocina las ve siempre arriba, cada una con su cuenta
regresiva y su barra, sabe de antemano cuál lo va a interrumpir con una alarma y cuál no, y
se entera de todo vencimiento aunque no esté mirando el teléfono.

**Why this priority**: es lo que distingue a la app de un recetario y de un temporizador, y
Carlos lo declaró bloqueante para el primer lanzamiento (decisión 21 del 2026-10-09).

**Independent Test**: con un reloj controlado se cocina una etapa con un proceso crítico y
uno que no lo es; se comprueba que las barras y los relojes coinciden en cada instante y
que cada vencimiento produce su aviso.

**Acceptance Scenarios**:

1. **Given** un paso que pone en marcha un proceso de 8:00, **When** se toca «Listo» en ese
   paso, **Then** el proceso aparece arriba, en la zona de lo que corre solo, con su nombre,
   su nota y una cuenta regresiva que arranca en 8:00.
2. **Given** dos procesos corriendo y un paso en curso, **When** se hace scroll para leer
   los sub-pasos, **Then** la etapa, «Paso N de M», el reloj de la etapa con su barra y los
   dos procesos siguen fijos arriba, a la vista.
3. **Given** el reloj de la etapa, el cronómetro del paso y dos procesos corriendo, **When**
   se mira la pantalla en cualquier instante, **Then** todos los números cambian en el mismo
   momento, una vez por segundo, y cada barra muestra exactamente la proporción que dice su
   número (transcurrido sobre previsto), sin que ninguna se adelante ni se atrase respecto
   de las demás ni del reloj (RF-19a).
4. **Given** un proceso crítico de 8:00 que empezó hace 8:00, **When** llega ese instante,
   **Then** una alarma tapa toda la pantalla con el nombre del proceso, suena fuerte y
   vibra, y el sonido se repite cada 2 segundos hasta que se toca «Atendido».
5. **Given** la alarma de un proceso crítico en pantalla, **When** se toca «Atendido»,
   **Then** la alarma se cierra, el sonido se corta, el proceso sale de la zona de lo que
   corre solo y la pantalla vuelve a la cocina.
6. **Given** la alarma de un proceso crítico que vence mientras el paso actual es una
   espera, **When** se toca «Atendido», **Then** la espera queda registrada como terminada
   en ese instante y la pantalla muestra el paso que sigue.
7. **Given** un proceso que no es crítico, **When** vence, **Then** suena un aviso suave con
   una vibración corta, no se tapa la pantalla y el proceso sale de la zona de lo que corre
   solo. [NEEDS CLARIFICATION: además del sonido, ¿el vencimiento de un proceso no crítico
   tiene que dejar una señal visible (un cartel, la fila marcada) hasta que se la descarte?]
8. **Given** un proceso crítico al que le restan 30 segundos o menos, **When** se mira la
   zona de lo que corre solo, **Then** ese proceso está marcado en ámbar como próximo a
   vencer. [NEEDS CLARIFICATION: ¿el aviso previo de 30 segundos se conserva en el
   rediseño, vale para todos los cronómetros o solo para los críticos, y lleva sonido?]
9. **Given** dos procesos críticos que vencen en el mismo instante, **When** se atiende la
   alarma del primero, **Then** aparece la alarma del segundo: ningún vencimiento se pierde
   por coincidir con otro (RF-19b).
10. **Given** un paso que es una espera, con un proceso corriendo al que le restan 2:10,
    **When** se mira la tarjeta del paso, **Then** su cronómetro cuenta para atrás cuánto
    resta para que venza lo que corre (2:10).
11. **Given** la pantalla de cocina con varios cronómetros, **When** se la mira antes de
    que venza ninguno, **Then** se distingue a simple vista cuál lleva alarma y cuál no
    (RF-19b). [NEEDS CLARIFICATION: ¿con qué señal se distingue el cronómetro que lleva
    alarma del que no: un ícono de campana, un color, una leyenda?]
12. **Given** un paso de manos que llega a su tiempo previsto, **When** se pasa, **Then**
    avisa (RF-19b). [NEEDS CLARIFICATION: ¿qué aviso da un paso que se pasa de su tiempo:
    el suave, el fuerte si el paso es crítico, uno solo o repetido?]

---

### User Story 4 - Ver la etapa entera en una línea de tiempo (Priority: P2)

Debajo de la tarea de ahora, quien cocina ve la etapa completa: los pasos terminados con su
desvío, el actual llenándose, los que vienen, y un diagrama con un carril por cada proceso
que corre en paralelo.

**Why this priority**: da el contexto (qué viene, cuánto resta, qué corre al mismo tiempo),
pero se puede cocinar solo con la tarjeta del paso.

**Independent Test**: con una etapa de cuatro pasos y dos procesos, se comprueba que la
línea de tiempo tiene cuatro filas y dos carriles ubicados en el minuto que corresponde.

**Acceptance Scenarios**:

1. **Given** una etapa de cuatro pasos y dos procesos, **When** se mira la línea de tiempo,
   **Then** hay una fila por paso, en orden, cada una con su minuto previsto de inicio, su
   título y su duración prevista, y a la derecha un diagrama con una barra para las manos y
   un carril por cada proceso.
2. **Given** un paso previsto en 2:00 que se terminó en 2:12, **When** se mira su fila,
   **Then** en lugar de la duración prevista dice el desvío, «+0:12»; uno terminado en 1:54
   dice «−0:06», y uno terminado justo dice «0:00».
3. **Given** el paso 2 en curso, **When** se mira la línea de tiempo, **Then** la fila del
   paso 2 está destacada como la actual, las anteriores figuran como terminadas, y el
   diagrama está lleno hasta el punto por donde va el paso actual.
4. **Given** un proceso previsto del minuto 1:00 al 9:00 de la etapa, **When** se mira el
   diagrama, **Then** su carril empieza a la altura del minuto 1:00 y termina a la altura
   del 9:00, en la misma escala que las filas de los pasos.
5. **Given** un paso de 10 segundos entre pasos de varios minutos, **When** se mira la
   línea de tiempo, **Then** su fila conserva un alto mínimo que deja leer el título
   entero.

---

### User Story 5 - Cambiar de etapa y cerrar la receta (Priority: P1)

Una receta puede tener más de una etapa, cada una con su reloj. Entre una y otra hay una
pausa con el resumen de lo que se hizo; la siguiente arranca cuando quien cocina lo decide.
Al terminar el último paso, la app no salta sola a los resultados: espera un toque.

**Why this priority**: sin el cierre de la etapa y de la receta no hay cocinada completa
ni nada que guardar.

**Independent Test**: se cocina una receta de dos etapas y se comprueba la pausa entre
ambas y el cierre con el botón de resultados.

**Acceptance Scenarios**:

1. **Given** el último paso de una etapa que no es la última, **When** se toca «Listo»,
   **Then** aparece la pausa con el nombre de la etapa terminada, su tiempo real contra el
   previsto, el desvío, cada paso con su desvío, y un botón para empezar la etapa siguiente.
2. **Given** la pausa entre etapas, **When** pasan cinco minutos sin tocar nada, **Then**
   ningún reloj de la receta avanza: el reloj de la etapa siguiente no corre hasta que se
   toca el botón para empezarla.
3. **Given** la pausa entre etapas, **When** se toca el botón para empezar la siguiente,
   **Then** se ve «Paso 1 de M» de esa etapa, con el reloj de la etapa y el cronómetro del
   paso en 0:00.
4. **Given** un proceso que seguía corriendo cuando se terminó el último paso de su etapa,
   **When** aparece la pausa, **Then** ese proceso deja de contar y no dispara ningún aviso
   más.
5. **Given** el último paso de la última etapa, **When** se toca «Listo», **Then** no se
   salta a los resultados: la tarjeta del paso pasa a decir «¡Receta completada!» con un
   botón, y no hay confeti ni sonido de festejo.
6. **Given** la tarjeta «¡Receta completada!», **When** se toca su botón, **Then** se ven
   los resultados de la cocinada (RF-21) y recién ahí empieza el festejo.
7. **Given** una cocinada en cualquier paso, **When** se toca la acción de salir de la
   cocina o el botón de atrás del teléfono, **Then** se vuelve a la pantalla anterior y la
   cocinada en curso se descarta: no se guarda en el historial ni se ofrece retomarla.

---

### User Story 6 - Retomar la cocinada si la app se cierra (Priority: P1)

En una cocina el teléfono se bloquea, entra una llamada, alguien recarga sin querer. Cuando
quien cocina vuelve a abrir la app, está otra vez en el paso en el que estaba, con los
relojes diciendo el tiempo que de verdad pasó.

**Why this priority**: perder el paso a mitad de una receta con algo en el fuego arruina el
plato y la confianza en la app.

**Independent Test**: se empieza una cocinada, se cierra la app sin salir de la cocina, se
la abre de nuevo y se comprueba que vuelve directo al mismo paso con los tiempos corridos.

**Acceptance Scenarios**:

1. **Given** una cocinada en el paso 3 de la etapa 1, con dos sub-pasos tildados y un
   proceso corriendo, **When** la app se cierra sola y se vuelve a abrir, **Then** se entra
   directo a la cocina, en el paso 3, con los mismos sub-pasos tildados y el mismo proceso,
   sin pasar por la entrada, la lista ni la mise en place.
2. **Given** una cocinada cuyo paso llevaba 1:00 cuando la app se cerró, **When** se la
   abre 4 minutos después, **Then** el cronómetro del paso dice 5:00, y el reloj de la etapa
   y las cuentas regresivas de los procesos también cuentan esos 4 minutos: el agua siguió
   hirviendo.
3. **Given** una cocinada cuya app se cerró y un proceso crítico que venció mientras
   estaba cerrada, **When** se abre la app, **Then** la alarma de ese proceso aparece
   enseguida.
4. **Given** una cocinada que quedó abierta, **When** se abre la app más de seis horas
   después, **Then** la cocinada se descartó y la app arranca por la entrada.
5. **Given** una cocinada de una receta en modo fácil que quedó abierta, **When** se
   empieza a cocinar otra receta, o la misma en otro modo, **Then** no se retoma la
   anterior: la nueva arranca de cero.
6. **Given** una cocinada retomada, **When** se toca la pantalla por primera vez, **Then**
   los sonidos y la vibración quedan habilitados para el resto de la cocinada, aunque no se
   haya pasado por la entrada.
7. **Given** una cocinada que llegó a «¡Receta completada!», **When** se cierra y se abre
   la app, **Then** no hay cocinada para retomar.

---

### User Story 7 - Silenciar los sonidos (Priority: P2)

Quien cocina con alguien durmiendo, o en una clase, apaga los sonidos con un botón que está
siempre a mano, y la app se acuerda de esa elección.

**Why this priority**: es una comodidad; la cocina funciona igual con sonido.

**Independent Test**: se silencia, se provoca un vencimiento y se comprueba que no suena;
se cierra y se abre la app y sigue silenciada.

**Acceptance Scenarios**:

1. **Given** los sonidos activados, **When** se toca el botón de sonido, **Then** el botón
   muestra que está en silencio y desde ese momento no suena el toque de confirmación, el
   aviso suave, la alarma ni el festejo.
2. **Given** los sonidos silenciados, **When** se cierra y se vuelve a abrir la app,
   **Then** siguen silenciados.
3. **Given** los sonidos silenciados, **When** vence un proceso crítico, **Then** la alarma
   tapa la pantalla igual, hasta que se toca «Atendido».
4. **Given** los sonidos silenciados, **When** se toca el botón de sonido, **Then** los
   avisos vuelven a sonar.
5. **Given** una persona que nunca tocó el botón de sonido, **When** abre la app, **Then**
   los sonidos están activados.

---

### User Story 8 - Usar la pantalla con las manos ocupadas (Priority: P1)

Quien cocina tiene las manos mojadas o sucias, está parado y mira el teléfono apoyado a un
brazo de distancia. Tiene que poder leer lo que importa sin acercarse y accionar lo que
necesita con un toque grueso, sin precisión.

**Why this priority**: Carlos contó (2026-10-09) que la pantalla le resulta incómoda
mientras cocina, y lo pidió para el primer lanzamiento.

**Independent Test**: una cocinada real, con el teléfono apoyado en la mesada, de punta a
punta sin levantarlo ni limpiarse las manos para tocarlo.

**Acceptance Scenarios**:

1. **Given** la pantalla de cocina en un celular, **When** se mide cualquier texto
   informativo, **Then** ninguno está por debajo de 13,5 px.
2. **Given** un paso en curso, **When** se necesita avanzar, **Then** «Listo» es el botón
   más grande de la tarjeta y se acierta con un toque sin mirar de cerca.
3. **Given** una cocinada en curso, **When** se avanza de paso, de etapa, o aparece o se
   cierra una alarma, **Then** la pantalla nueva empieza desde arriba, sin quedar
   desplazada por el scroll anterior.
4. **Given** el teléfono en tema claro o en tema oscuro, **When** se cocina, **Then** todo
   lo anterior se cumple en los dos.
5. **Given** el teléfono con «reducir movimiento» activado, **When** un paso se pasa de
   tiempo o suena una alarma, **Then** los latidos y parpadeos se apagan y la información
   (el exceso, el color, el nombre de lo que venció) se sigue viendo.
6. **Given** una cocinada real con las manos ocupadas, **When** se la hace de punta a
   punta, **Then** [NEEDS CLARIFICATION: ¿qué molestias concretas encontró Carlos al
   cocinar (qué botón no alcanzó, qué no pudo leer, qué lo obligó a hacer scroll o a
   limpiarse las manos)? Cada una se convierte en un escenario acá].

---

### User Story 9 - Manejar la cocina con la voz (Priority: P4)

Con las manos sucias, quien cocina le dice a la app que terminó el paso o que atendió la
alarma, sin tocar el teléfono. Es de un lanzamiento posterior al primero: en el primero
alcanza con tocar botones y escuchar alarmas (decisión 5 del 2026-10-09).

**Why this priority**: mejora la comodidad, pero la cocina se maneja entera sin voz.

**Independent Test**: se cocina una receta de punta a punta sin tocar la pantalla desde que
arranca el reloj.

**Acceptance Scenarios**:

1. **Given** un paso en curso y el manejo por voz activado, **When** se dice la orden de
   avanzar, **Then** pasa lo mismo que al tocar «Listo». [NEEDS CLARIFICATION: ¿qué
   acciones se manejan con la voz (avanzar, atender la alarma, reiniciar el paso, leer el
   paso en voz alta) y con qué palabras?]
2. **Given** una alarma en pantalla y el manejo por voz activado, **When** se dice la orden
   de atender, **Then** pasa lo mismo que al tocar «Atendido».

---

### User Story 10 - Ver en video cómo se hace el paso (Priority: P4)

En el paso que tiene una técnica difícil de explicar con palabras (el corte, el punto del
salteado), quien cocina ve un video corto ahí mismo. Los videos los sube quien crea el POE.
Es de un lanzamiento posterior al primero.

**Why this priority**: enriquece el paso, pero la receta se cocina sin videos.

**Independent Test**: una receta con un video en un paso; se llega a ese paso y se ve el
video sin salir de la cocina y sin que se detenga ningún cronómetro.

**Acceptance Scenarios**:

1. **Given** un paso que tiene un video, **When** se llega a ese paso, **Then** el video se
   puede ver desde la tarjeta del paso, y los cronómetros siguen corriendo mientras se lo
   mira.
2. **Given** un paso que no tiene video, **When** se llega a ese paso, **Then** la tarjeta
   se ve como la de cualquier paso, sin un hueco para el video.

---

### Edge Cases

- **Receta sin nada para juntar**: si la receta no lista ningún utensilio ni ingrediente,
  la mise en place no habilita cocinar. [NEEDS CLARIFICATION: una receta sin ningún item,
  ¿puede existir? Si existe, ¿se cocina sin pasar por la mise en place?]
- **«Listo» con sub-pasos sin tildar**: [NEEDS CLARIFICATION: ¿se puede tocar «Listo» con
  sub-pasos sin tildar, o hay que tildarlos todos como en la mise en place?]
- **Reiniciar un paso que ya se pasó**: el cronómetro del paso vuelve a cero. [NEEDS
  CLARIFICATION: al reiniciar un paso, ¿el tiempo anterior al reinicio se descarta para el
  juego (el paso puede sumar sus 10 puntos de RF-21) o se sigue contando?]
- **Salir por error**: un toque en salir descarta la cocinada entera. [NEEDS
  CLARIFICATION: ¿salir de la cocina con una cocinada en curso pide confirmación antes de
  descartarla?]
- **Un proceso crítico y uno no crítico vencen juntos**: primero la alarma del crítico; el
  aviso del otro se da al cerrarla.
- **Vence un proceso durante una alarma**: se avisa al cerrar la alarma en curso; no se
  pierde.
- **El teléfono no puede sonar o no puede vibrar**: la cocinada sigue igual, con lo que el
  teléfono sí pueda hacer; la señal en pantalla nunca depende del sonido.
- **El teléfono no deja guardar** (modo privado, almacenamiento bloqueado): se cocina
  igual; lo único que se pierde es poder retomar si la app se cierra.
- **Lo guardado de la cocinada en curso está dañado o es de otra receta**: se ignora y se
  arranca por la entrada; nunca se manda a cocinar un paso que no corresponde.
- **El reloj del teléfono retrocede**: ningún tiempo real es negativo; el mínimo es cero.
- **Mise en place a medias y se cierra la app**: [NEEDS CLARIFICATION: si la app se cierra
  durante la mise en place, ¿al volver se conservan los items tildados?]
- **Alarmas con el celular bloqueado**: en principio el celular está desbloqueado mientras
  se cocina (decisión 6 del 2026-10-09). Que las alarmas suenen con el celular bloqueado es
  RNF-10, de un lanzamiento posterior.

## Requirements *(mandatory)*

### Functional Requirements

- **RF-11**: Mise en place. Antes de cocinar, la app DEBE mostrar la lista de todos los
  ingredientes y utensilios de la receta, cada uno con su foto, para tildar de a uno, y un
  contador de cuántos van de cuántos. La app NO DEBE dejar empezar a cocinar hasta que
  estén todos tildados. DEBE haber una acción que tilde todos de un toque y los destilde
  con otro. El reloj de la receta no corre durante la mise en place.
- **RF-12**: Paso a paso. La app DEBE mostrar una sola tarea por vez, la de ahora, con: la
  foto, el título, los sub-pasos para tildar, las etiquetas de qué cuida el paso, el porqué
  a un toque, el cronómetro del paso contra su tiempo previsto, un botón para reiniciar el
  paso y el botón «Listo». Además DEBE mostrar la etapa, «Paso N de M» y el reloj de la
  etapa contra su duración prevista.
  - Al tocar «Listo» la app registra el tiempo real del paso (desde que empezó hasta ese
    toque, en segundos enteros) junto con su tiempo previsto y si era crítico, y muestra el
    paso siguiente.
  - Un paso se pasó de tiempo cuando su tiempo transcurrido supera el previsto. Pasado de
    tiempo, la tarjeta late: en rojo si la etapa es crítica y en ámbar si es tranquila; en
    ese estado nada queda en verde salvo los tildes de los sub-pasos.
  - Si la receta deja un intervalo libre entre el final previsto de un paso y el inicio
    previsto del siguiente, el siguiente empieza a contar recién cuando transcurre ese
    intervalo, y mientras tanto la tarjeta muestra la cuenta regresiva para empezar.
  - Entre etapas hay una pausa con el resumen de la etapa terminada; la etapa siguiente
    arranca cuando quien cocina lo indica.
  - Al terminar el último paso de la última etapa, la tarjeta pasa a decir «¡Receta
    completada!» con un botón; los resultados y el festejo empiezan al tocarlo.
  - Salir de la cocina descarta la cocinada en curso. No existe «salir sin guardar» ni
    «guardar a medias»: una cocinada se guarda solo si se terminó, y entonces siempre
    (RF-21).
- **RF-13**: Varios cronómetros a la vez. La app DEBE mostrar al mismo tiempo, y siempre a
  la vista aunque se haga scroll, todo lo que corre solo: cada proceso con su nombre, su
  cuenta regresiva y su barra. Un proceso empieza a contar en el instante en que se termina
  el paso que lo pone en marcha, y vence cuando transcurre su duración prevista desde ese
  instante. Un proceso que ya corre no se reinicia. Al cerrarse la etapa, sus procesos
  dejan de contar. [NEEDS CLARIFICATION: Carlos pidió rediseñar las barras de los
  cronómetros (decisión 21): ¿qué tiene que cambiar concretamente en cómo se ven (forma,
  tamaño, color, sentido en que se llenan, qué pasa con la barra del paso cuando se pasa de
  tiempo)?]
- **RF-14**: Alarmas con sonido y vibración. Todo aviso de vencimiento DEBE darse con
  sonido y con vibración, además de en pantalla. Cuando vence un proceso crítico, una
  alarma tapa toda la pantalla, suena fuerte y vibra, repetida cada 2 segundos, hasta que
  se toca «Atendido». Cuando vence un proceso no crítico, suena un aviso suave con una
  vibración corta, una sola vez, sin tapar la pantalla. Las alarmas se muestran de a una,
  la del vencimiento más antiguo primero. [NEEDS CLARIFICATION: Carlos pidió rediseñar la
  lógica de qué cronómetro lleva alarma (decisión 21): ¿la alarma que tapa la pantalla es
  solo para los procesos críticos, o también para un paso de manos crítico que se pasa de
  su tiempo y para el reloj de la etapa?]
- **RF-15**: Línea de tiempo de la etapa. La app DEBE mostrar, debajo de la tarea de ahora,
  todos los pasos de la etapa en orden (los terminados con su desvío contra lo previsto, el
  actual destacado y llenándose, los que vienen con su duración prevista) y un diagrama con
  un carril por cada proceso paralelo, en la misma escala de tiempo que los pasos.
- **RF-16**: Manejo con la voz, para cuando las manos están sucias. Es de un lanzamiento
  posterior al primero; en el primero alcanza con tocar botones y escuchar alarmas. [NEEDS
  CLARIFICATION: ¿de qué lanzamiento es el manejo por voz, y qué acciones cubre?]
- **RF-17**: Retomar. Si la app se cierra sola o se recarga con una cocinada en curso, al
  abrirla de nuevo la app DEBE volver directo a la cocina, en el mismo paso, con los mismos
  sub-pasos tildados y los mismos procesos, y con todos los relojes contando el tiempo que
  realmente pasó mientras estuvo cerrada. Se retoma hasta seis horas después; pasado ese
  plazo la cocinada en curso se descarta. La cocinada en curso se guarda en el teléfono a
  cada cambio, no cada tanto. [NEEDS CLARIFICATION: las seis horas, ¿se cuentan desde la
  última acción de la cocinada (el último «Listo», tilde o aviso) o desde que empezó?]
- **RF-18**: Silenciar los sonidos. DEBE haber un botón, a la vista en la cocina, que apaga
  y prende todos los sonidos de la app; la elección se recuerda en el teléfono. En
  silencio, las señales en pantalla (incluida la alarma que tapa la pantalla) se dan
  igual. [NEEDS CLARIFICATION: al silenciar, ¿se apaga también la vibración, o el teléfono
  sigue vibrando en cada aviso? ¿Y la alarma de un proceso crítico suena igual aunque esté
  en silencio?]
- **RF-19**: La pantalla de cocina DEBE ser cómoda de usar mientras se cocina, con las
  manos ocupadas: se lee de parado a un brazo de distancia, se maneja con toques gruesos y
  no obliga a levantar el teléfono. Se apoya en RNF-02 (letra y botones grandes), RNF-03
  (sin internet) y RNF-04 (la pantalla no se apaga mientras se cocina).
- **RF-19a**: Las barras de todos los cronómetros (etapa, paso, procesos y línea de tiempo)
  DEBEN avanzar sincronizadas entre sí y con el reloj: en un mismo instante, cada barra
  muestra la proporción exacta entre su tiempo transcurrido y su tiempo previsto, y todas
  se actualizan a la vez que los números.
- **RF-19b**: DEBE quedar claro, antes de que venza, qué cronómetro lleva alarma y cuál no;
  y todo cronómetro que vence DEBE avisar, sin excepción: ningún vencimiento pasa en
  silencio ni se pierde por coincidir con otro.
- **RF-20**: Videos cortos (reels) que muestran cómo se hace cada paso; los sube quien crea
  el POE y se ven en el paso correspondiente mientras se cocina. Es de un lanzamiento
  posterior al primero. [NEEDS CLARIFICATION: ¿dónde se alojan los videos, cuánto pueden
  durar, se reproducen solos o al tocarlos, con o sin sonido, y se ven también sin
  internet?]

### Key Entities *(include if feature involves data)*

- **Cocinada en curso**: la cocinada que todavía no terminó. Sabe de qué receta y de qué
  modo de preparación es, en qué etapa y paso va, cuándo empezaron la etapa y el paso, qué
  sub-pasos del paso actual están tildados, qué pasos se terminaron y con qué tiempo real,
  cuánto duró cada etapa terminada, qué procesos corren y cuándo empezó cada uno, y si hay
  una alarma sin atender. Hay como mucho una.
- **Paso terminado**: de qué paso se trata, su tiempo previsto, su tiempo real y si era
  crítico. Es lo que alimenta la línea de tiempo, el resumen de la etapa y los resultados.
- **Proceso en marcha**: qué proceso es, cuándo empezó, cuánto dura y si ya avisó.
- **Preferencia de sonido**: si los sonidos están apagados.
- **Mise en place**: qué items están tildados; vale solo mientras se la está haciendo.

El detalle de qué se guarda y dónde está en `data-model.md`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: una persona cocina una receta de punta a punta sin registrarse y sin que
  nada salga del teléfono.
- **SC-002**: en cualquier instante de la cocinada, la diferencia entre lo que muestra una
  barra y lo que dice su número es menor a un segundo, para todos los cronómetros a la vez.
- **SC-003**: el 100 % de los vencimientos de una cocinada produce un aviso con sonido y
  vibración, además de la señal en pantalla.
- **SC-004**: una alarma de proceso crítico aparece a lo sumo un segundo después del
  instante en que el proceso vence.
- **SC-005**: tras cerrar y reabrir la app en medio de una cocinada, se está de nuevo en el
  mismo paso en un solo gesto (abrir la app), con los relojes corridos el tiempo real.
- **SC-006**: Carlos cocina una receta completa con el teléfono apoyado, sin levantarlo, y
  dice que la pantalla es cómoda.
- **SC-007**: dos personas distintas cocinan el mismo POE con la app y el plato sale igual.

## Assumptions

- La receta llega completa desde el catálogo, con el formato que define RF-05: por etapa,
  si es crítica y cuánto dura; por paso, inicio y duración previstos, sub-pasos, etiquetas,
  porqué, si es crítico, si es una espera y qué procesos pone en marcha; por proceso,
  duración, si es crítico, su nota y qué paso hay que hacer cuando vence.
- El modo de preparación (fácil o difícil, RF-03) se elige antes de la mise en place; cada
  modo es una receta con sus propios pasos y tiempos.
- Mientras se cocina, el celular está desbloqueado y con la app a la vista (decisión 6 del
  2026-10-09). Lo que pasa con el celular bloqueado es RNF-10.
- Los navegadores de celular solo dejan sonar después de un primer toque de la persona;
  por eso los sonidos se habilitan con el primer toque dentro de la app.
- El tiempo de la pausa entre etapas no forma parte de ninguna etapa: cada etapa tiene su
  propio reloj, que arranca cuando quien cocina lo indica.
- Lo que pasa al terminar (resultados, puntos, guardado en el historial) está en la
  capacidad de progreso y juego (RF-21 a RF-23).
- La decisión técnica de que la app sea un sitio estático que se baja entero al teléfono
  está en ADR-017.

## Clarifications

### Session 2026-09 (sesiones de septiembre, sin día registrado)

- Q: ¿Hay un prototipo de diseño aparte al que haya que ajustarse? → A: No. La interfaz
  que Carlos aprobó al verla es la fuente de verdad del diseño (decisión 13).
- Q: ¿Se puede salir de la cocina guardando lo que se lleva, o terminar sin guardar? → A:
  No. La cocinada se guarda siempre al terminar; no existe «salir sin guardar»
  (decisión 15).

### Session 2026-09-15

- Q: ¿Cuál es el flujo central de la app? → A: Elegir una receta y que la app la lleve
  paso a paso, ganando experiencia y logros. Todo lo demás se suma alrededor de eso y no
  lo reemplaza (decisión 18).

### Session 2026-10-09

- Q: ¿Cómo se maneja la app mientras se cocina? → A: Con las manos sucias: botones
  grandes, pantalla siempre encendida y sin internet. La voz queda para una versión más
  avanzada (decisión 5).
- Q: ¿Se necesita más de un cronómetro a la vez, y con el celular bloqueado? → A: Varios
  cronómetros a la vez; en principio el celular está desbloqueado (decisión 6).
- Q: ¿Hay que registrarse para cocinar? → A: No. Para cocinar un POE público nunca se exige
  cuenta; el registro aparece solo para lo que se escribe en el servidor (decisiones
  8, 19 y 27).
- Q: ¿Qué tiene que cumplir la pantalla de cocina para que Carlos la dé por buena? → A:
  Que las barras de los cronómetros estén sincronizadas, que las alertas aparezcan en
  todos los cronómetros que vencen y que sea cómoda de usar mientras se cocina (decisión
  10; RF-19, RF-19a, RF-19b).
- Q: ¿Los cronómetros, sus barras y las alarmas quedan como se aprobaron antes? → A: No:
  se rediseñan. A Carlos no le gusta cómo quedaron las barras y no queda claro con qué
  lógica un cronómetro lleva alarma. Es bloqueante para el primer lanzamiento, y los
  cambios específicos se le preguntan antes de diseñar nada (decisión 21).
- Q: ¿Qué se puede hacer sin cuenta? → A: Todo lo que es leer y todo lo que se guarda
  únicamente en el teléfono, cocinar incluido. Nada que se escriba en el servidor se hace
  sin cuenta (decisión 27).
