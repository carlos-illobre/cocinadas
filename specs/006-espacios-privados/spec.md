# Feature Specification: Espacios privados

**Feature Branch**: `006-espacios-privados`

**Created**: 2026-10-10

**Status**: Baseline

**Input**: Especificación completa de la capacidad

Esta capacidad es la parte paga de Cocinadas. Hay POE que valen mucho: un restaurante no
quiere compartir sus recetas, y un instituto no quiere divulgar su metodología, que puede
incluir videos con derechos de autor. Para ellos, y para cualquier particular que quiera lo
mismo, hay un espacio privado: sus POE y sus videos los ve solo quien el dueño elige. Ese
espacio se vende como una membresía vinculada a la cuenta, y es la primera fuente de
ingresos. Abarca RF-40 a RF-45.

La regla que ordena la capacidad: **si todo lo que hacés es público, es gratis; si querés
que algo sea privado, pagás la membresía.** En lo privado la cuenta es obligatoria, porque
hay que saber de quién es lo que no se divulga.

## Roles

| Rol | Quién es | Qué puede |
|---|---|---|
| Dueño del espacio | La institución o el particular que compra la membresía, con su cuenta | Tener un espacio privado, guardar ahí sus POE y sus videos y elegir quién los ve |
| Miembro del espacio | Cualquier persona que el dueño eligió, con su cuenta y la sesión iniciada | Ver y cocinar los POE del espacio y ver sus videos |
| Alumno | Miembro del espacio de una escuela o universidad | Cocinar los POE de la cátedra con la app como guía y autoevaluarse: ver su desvío en cada paso, su historial de intentos y su progreso |
| Docente | Quien enseña en una escuela o universidad | Seguir el progreso de cada alumno y del curso: quién mejora, en qué paso se traba cada uno y cuánto tardan en llegar al tiempo |
| Cocinero | Miembro del espacio de un restaurante | Entrenar con los POE del restaurante |
| Supervisor | Quien responde por la cocina de un restaurante | Medir la performance de cada cocinero: tiempos, desvíos, pasos críticos a tiempo y repeticiones hasta dominar el plato |
| Quien cocina, sin membresía | Cualquier persona, con o sin cuenta | Todo lo público, gratis. No ve nada de un espacio privado al que no fue invitada |
| Administrador | Quien opera Cocinadas | Lo que puede ver y hacer sobre un espacio privado está en las preguntas de RF-44 |

Quién nombra a un docente o a un supervisor, y quién puede cargar POE en el espacio además
del dueño, está en las preguntas de RF-40.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tener un espacio privado y elegir quién lo ve (Priority: P1)

Una institución o un particular guarda sus POE y sus videos en un espacio privado y decide
quién los ve. Nadie más los ve. Para entrar al espacio hay que iniciar sesión.

Es del tercer lanzamiento (Espacios privados).

**Why this priority**: es el producto que se vende. Sin el espacio privado no hay membresía
ni ingreso, y las escuelas y los restaurantes no tienen dónde cargar lo suyo.

**Independent Test**: con una cuenta con membresía se guarda un POE en el espacio y se elige
a una persona; se comprueba que esa persona lo ve con su sesión, y que una persona no
elegida y una sin sesión no lo ven.

**Acceptance Scenarios**:

1. **Given** una cuenta con membresía, **When** su dueño guarda un POE o un video en su
   espacio privado, **Then** ese contenido lo ven solo las personas que el dueño eligió.
2. **Given** una persona elegida por el dueño y con la sesión iniciada, **When** entra al
   espacio, **Then** ve sus POE y sus videos y puede cocinar esos POE paso a paso.
3. **Given** una persona sin sesión, **When** quiere entrar a un espacio privado, **Then**
   la app le pide iniciar sesión y no le muestra nada del espacio.
4. **Given** una persona con la sesión iniciada a la que el dueño no eligió, **When** quiere
   ver un POE o un video del espacio, **Then** no lo ve.
5. **Given** un POE guardado en un espacio privado, **When** cualquier persona recorre lo
   público, **Then** ese POE no aparece.
6. **Given** una persona con cuenta y sin membresía, **When** quiere que un POE suyo sea
   privado y verlo compartido solo con quienes elige, **Then** la app le dice que para eso
   se necesita la membresía: gratis es únicamente lo público.

---

### User Story 2 - Comprar la membresía (Priority: P1)

Quien quiere un espacio privado compra la membresía, que queda vinculada a su cuenta.

Es del tercer lanzamiento (Espacios privados).

**Why this priority**: es la primera fuente de ingresos del producto.

**Independent Test**: con una cuenta sin membresía se completa la compra y se comprueba que
esa cuenta pasa a tener su espacio privado.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión, **When** quiere comprar la membresía, **Then** la app
   le pide iniciar sesión: en lo privado la cuenta es obligatoria.
2. **Given** una persona con la sesión iniciada y sin membresía, **When** completa el pago,
   **Then** la membresía queda vinculada a su cuenta y tiene su espacio privado.
3. **Given** una persona con la sesión iniciada, **When** el pago no se completa, **Then**
   no tiene membresía ni espacio privado, y sigue usando todo lo público gratis.
4. **Given** una membresía que se dejó de pagar, **When** su dueño o un miembro quiere
   entrar al espacio, **Then** pasa lo que se defina en RF-43.

---

### User Story 3 - El espacio privado tiene un marco de seguridad (Priority: P1)

Quien paga por mantener privados sus POE y sus videos recibe un marco de seguridad: cifrado
y la garantía de que sus datos no se comparten con nadie que no haya elegido.

Es del tercer lanzamiento (Espacios privados).

**Why this priority**: es parte de lo que se compra. Una institución no carga su
metodología ni sus videos con derechos de autor sin esa garantía.

**Independent Test**: se guarda contenido en un espacio privado y se comprueba que está
cifrado y que ninguna persona que el dueño no eligió puede obtenerlo por ningún camino de
la app.

**Acceptance Scenarios**:

1. **Given** un POE o un video guardado en un espacio privado, **When** se lo guarda y se lo
   transmite, **Then** está cifrado, con el alcance que se defina en RF-44.
2. **Given** un espacio privado, **When** cualquier persona que el dueño no eligió intenta
   obtener su contenido por cualquier camino, **Then** no lo obtiene.
3. **Given** una institución que evalúa comprar la membresía, **When** pide la garantía de
   que sus datos no se comparten, **Then** la recibe de la forma que se defina en RF-44.

---

### User Story 4 - Escuela: el alumno se autoevalúa y el docente sigue el progreso (Priority: P2)

En una escuela de cocina o una universidad, cada alumno cocina los POE de la cátedra con la
app como guía y se autoevalúa con su historial. El docente sigue el progreso de cada alumno
y del curso. La app se vuelve el cuaderno de práctica de la carrera.

Es del tercer lanzamiento (Espacios privados).

**Why this priority**: es uno de los dos públicos a los que se les vende la membresía.
Depende del espacio privado.

**Independent Test**: un alumno de prueba cocina varias veces un POE de la cátedra; se
comprueba que el alumno ve su evolución y que el docente la ve entre las de todo el curso.

**Acceptance Scenarios**:

1. **Given** un alumno miembro del espacio de su escuela, **When** cocina un POE de la
   cátedra, **Then** la app lo guía paso a paso como con cualquier POE.
2. **Given** un alumno que cocinó un POE de la cátedra, **When** mira sus resultados,
   **Then** ve su desvío en cada paso.
3. **Given** un alumno que cocinó varias veces un POE de la cátedra, **When** mira su
   historial, **Then** ve cada intento contra el tiempo objetivo y su progreso.
4. **Given** un docente del espacio, **When** mira el seguimiento de un alumno, **Then** ve
   su progreso: si mejora, en qué paso se traba y cuánto tarda en llegar al tiempo.
5. **Given** un docente del espacio, **When** mira el seguimiento del curso, **Then** ve el
   progreso del curso entero y quién mejora.
6. **Given** una persona que no es docente de ese espacio, **When** quiere ver el
   seguimiento de un alumno, **Then** no lo ve.

---

### User Story 5 - Restaurante: el supervisor mide a cada cocinero (Priority: P2)

En la cocina de un hotel el plato tiene que salir igual a como lo definió el chef ejecutivo,
sin importar quién lo prepare ese día. Los POE del restaurante se cargan en la app y cada
cocinero nuevo entrena con ellos. El supervisor mide la performance de cada uno con datos:
el entrenamiento deja de depender de que alguien esté mirando.

Es del tercer lanzamiento (Espacios privados).

**Why this priority**: es el otro público al que se le vende la membresía. Depende del
espacio privado.

**Independent Test**: un cocinero de prueba repite varias veces un POE del restaurante; se
comprueba que el supervisor ve sus tiempos, sus desvíos y sus repeticiones.

**Acceptance Scenarios**:

1. **Given** un cocinero miembro del espacio de su restaurante, **When** cocina un POE del
   restaurante, **Then** la app lo guía paso a paso como con cualquier POE.
2. **Given** un supervisor del espacio, **When** mira el seguimiento de un cocinero,
   **Then** ve sus tiempos, sus desvíos y si llegó a tiempo en los pasos críticos.
3. **Given** un cocinero que repitió varias veces un mismo POE, **When** el supervisor mira
   su seguimiento, **Then** ve cuántas repeticiones le llevó dominar el plato.
4. **Given** una persona que no es supervisor de ese espacio, **When** quiere ver el
   seguimiento de un cocinero, **Then** no lo ve.

---

### User Story 6 - Mirar el seguimiento en una vista de escritorio (Priority: P3)

El seguimiento de un curso o de una brigada se mira mejor en una pantalla grande. El docente
y el supervisor lo miran en una vista de escritorio, en una dirección aparte de la app de
cocinar. Es secundaria: no cambia nada del diseño de celular.

Es del tercer lanzamiento (Espacios privados).

**Why this priority**: es una comodidad sobre el seguimiento, que ya tiene que existir.
Lo que importa de este requerimiento es lo que no puede romper: el diseño de celular.

**Independent Test**: desde una computadora se entra a la dirección del seguimiento con una
cuenta de docente y se ve el seguimiento del curso; desde un celular se recorre la app de
cocinar y se comprueba que es idéntica a como era sin la vista de escritorio.

**Acceptance Scenarios**:

1. **Given** un docente o un supervisor con la sesión iniciada, **When** entra desde una
   computadora a la dirección del seguimiento, **Then** ve el seguimiento de su curso o de
   su brigada en pantallas pensadas para una pantalla grande.
2. **Given** una persona sin sesión, **When** entra a la dirección del seguimiento,
   **Then** se le pide iniciar sesión y no ve ningún dato.
3. **Given** una persona con sesión que no es docente ni supervisor de ningún espacio,
   **When** entra a la dirección del seguimiento, **Then** no ve el seguimiento de nadie.
4. **Given** una persona que cocina desde su celular, **When** usa la app de cocinar,
   **Then** ninguna pantalla cambió por la vista de escritorio y su teléfono no descarga
   nada de ella.
5. **Given** la app de cocinar abierta en una pantalla ancha, **When** se la mira, **Then**
   sus pantallas de teléfono no se convierten en la vista de escritorio: la vista de
   escritorio son pantallas propias, con sus propios estilos, en su propia dirección.

---

### Edge Cases

- La membresía vence o se deja de pagar con POE, videos y seguimiento cargados: se define
  en RF-43.
- El dueño le quita el acceso a una persona que ya cocinó POE del espacio: qué pasa con las
  cocinadas de esa persona se define en RF-40.
- Un miembro quiere cocinar un POE privado sin internet: la app tiene que funcionar sin
  internet (RNF-03), pero eso deja una copia del POE privado en el teléfono; se define en
  RF-40.
- Un alumno cocina, además de los POE de la cátedra, recetas públicas por su cuenta: si el
  docente las ve se define en RF-41.
- La misma persona es alumna de una escuela y cocinera de un restaurante: si puede ser
  miembro de varios espacios se define en RF-40.
- El docente que compró la membresía con su cuenta personal deja la institución: si la
  membresía se pasa a otra cuenta se define en RF-43.
- Un miembro publica algo ofensivo dentro del espacio privado: si el baneo de RF-35 alcanza
  a lo privado, y quién puede verlo para decidirlo, se define en RF-44.
- Un particular compra la membresía solo para sí, sin invitar a nadie: tiene su espacio
  privado igual que una institución (RF-40).
- Un video del espacio tiene derechos de autor de un tercero: la garantía de que no se
  divulga es la de RF-44.

## Requirements *(mandatory)*

### Functional Requirements

- **RF-40**: Una institución o un particular tiene un espacio privado con sus POE y sus
  videos, visibles solo para quienes elige. Para entrar hay que iniciar sesión.
  - El espacio privado lo tiene quien paga la membresía (RF-43). Un particular lo tiene en
    las mismas condiciones que una institución: solo si compra la membresía.
  - En el espacio privado la cuenta es obligatoria, para el dueño y para cada persona que
    entra. Para cocinar un POE público nunca se necesita cuenta; para uno privado, sí.
  - Lo que está en un espacio privado no aparece en lo público.
  - Un POE privado se cocina igual que cualquier POE: mise en place, paso a paso,
    cronómetros, alarmas, resultados, experiencia y logros.
  - Guardar un POE propio en el teléfono, sin compartirlo, no es un espacio privado y no
    exige membresía ni cuenta (RF-32).
  - Quien carga POE en un espacio privado es quien paga la membresía: instituciones o
    particulares.
  - [NEEDS CLARIFICATION: ¿cómo elige el dueño quién ve su espacio: invitando por correo,
    con un enlace, con un código? ¿La persona invitada necesita solo una cuenta gratuita, o
    también tiene que pagar? Cuando el dueño le quita el acceso a alguien, ¿qué pasa con
    las cocinadas que esa persona hizo en el espacio?]
  - [NEEDS CLARIFICATION: ¿cómo se organiza un espacio por dentro? ¿Una membresía es un solo
    espacio, o una escuela puede tener varios cursos y un restaurante varias brigadas, cada
    uno con sus POE y su gente? ¿El acceso se da al espacio entero o POE por POE? ¿Una
    persona puede ser miembro de varios espacios a la vez?]
  - [NEEDS CLARIFICATION: ¿quién puede qué dentro del espacio? ¿Quién nombra a un docente o
    a un supervisor? ¿Solo el dueño carga POE y videos, o también los docentes, los
    supervisores o cualquier miembro? ¿El espacio de un particular tiene estos roles?]
  - [NEEDS CLARIFICATION: ¿un POE puede pasar de privado a público y de público a privado?
    ¿Los POE privados tienen comentarios y me gusta entre los miembros? ¿Un miembro puede
    cocinar un POE privado sin internet, aunque eso deje una copia en su teléfono? ¿Los
    videos tienen un límite de duración o de tamaño?]

- **RF-41**: Escuelas y universidades: el alumno se autoevalúa con su historial y el docente
  sigue el progreso de cada alumno y del curso.
  - Una escuela o universidad carga sus POE en su espacio privado y sus alumnos los cocinan
    con la app como guía.
  - El alumno ve, de lo que cocinó, su desvío en cada paso, su historial de intentos y su
    progreso.
  - El docente ve, de cada alumno y del curso: quién mejora, en qué paso se traba cada uno
    y cuánto tardan en llegar al tiempo.
  - El seguimiento lo ve solo el docente del espacio; no es público.
  - Para que el docente vea el progreso de un alumno, las cocinadas del alumno en los POE
    del espacio quedan guardadas en el servidor: el alumno tiene cuenta y la sesión
    iniciada.
  - [NEEDS CLARIFICATION: ¿qué ve exactamente el docente y con qué alcance? ¿Solo las
    cocinadas de los POE del espacio, o también lo que el alumno cocina por su cuenta de lo
    público? ¿El alumno tiene que aceptar que el docente lo vea? ¿Un alumno ve el progreso
    de sus compañeros? ¿Las cocinadas de los POE del espacio suman a la experiencia y a los
    logros personales del alumno, y las conserva si deja el curso?]
  - [NEEDS CLARIFICATION: ¿el docente solo mira, o además hace algo: asignar un POE como
    práctica con una fecha, poner una nota, dejarle una devolución al alumno? ¿Qué significa
    «llegar al tiempo»: terminar a menos del 10 % del tiempo previsto, como el bonus de
    puntos?]

- **RF-42**: Restaurantes: el supervisor mide tiempos, desvíos y repeticiones de cada
  cocinero.
  - Un restaurante carga sus POE en su espacio privado y cada cocinero entrena con ellos.
  - El supervisor ve, de cada cocinero: sus tiempos, sus desvíos, sus pasos críticos a
    tiempo y cuántas repeticiones le llevó dominar el plato.
  - El desvío es la diferencia entre el tiempo real y el previsto, del total y de cada paso,
    como en los resultados de cualquier cocinada.
  - El seguimiento lo ve solo el supervisor del espacio; no es público.
  - El restaurante al que apunta el producto es el de un hotel de 4 y 5 estrellas, donde el
    plato lo define el chef ejecutivo.
  - [NEEDS CLARIFICATION: ¿cuándo se considera que un cocinero «domina» un plato: tras
    cuántas cocinadas seguidas a tiempo, con qué margen? ¿El seguimiento del supervisor es
    el mismo que el del docente con otros nombres (brigada por curso, cocinero por alumno),
    o son dos seguimientos distintos? ¿El cocinero ve sus propios números y los de sus
    compañeros?]

- **RF-43**: Cobro de la membresía, vinculada a la cuenta de quien la compra.
  - La membresía es lo que da derecho al espacio privado. Es la primera fuente de ingresos.
  - Comprar la membresía exige cuenta.
  - Lo público no se cobra nunca, tenga o no membresía quien lo usa.
  - La compran instituciones (escuelas, universidades, restaurantes) y particulares.
  - [NEEDS CLARIFICATION: ¿cuánto cuesta la membresía y cómo se cobra? ¿Es mensual o anual?
    ¿Hay un precio único o planes distintos para un particular, una escuela y un
    restaurante, o según la cantidad de miembros? ¿Con qué medio de pago y en qué moneda?
    ¿Se emite factura? ¿Hay un período de prueba gratis?]
  - [NEEDS CLARIFICATION: ¿qué pasa cuando la membresía vence o se deja de pagar? ¿Los POE,
    los videos y el seguimiento se bloquean, se borran después de un plazo, o quedan a la
    vista solo del dueño? ¿El dueño puede llevarse una copia de lo suyo? ¿La membresía se
    puede pasar a otra cuenta, por ejemplo cuando quien la compró deja la institución?]

- **RF-44**: El espacio privado tiene un marco de seguridad: cifrado y la garantía de que
  los datos no se comparten.
  - El contenido de un espacio privado está cifrado.
  - Los datos de un espacio privado no se comparten con nadie que su dueño no haya elegido.
  - La garantía alcanza a los POE, a los videos, incluidos los que tienen derechos de autor,
    y al seguimiento de alumnos y cocineros.
  - La garantía se le da por escrito a la institución.
  - [NEEDS CLARIFICATION: ¿qué se cifra y hasta dónde? ¿Alcanza con cifrar lo que viaja y lo
    que se guarda, o el cifrado tiene que impedir que el propio operador de Cocinadas lea
    el contenido? ¿Carlos o un administrador pueden ver un espacio privado para dar soporte
    o para moderar, y el baneo de RF-35 vale para lo que se escribe adentro?]
  - [NEEDS CLARIFICATION: ¿cómo se le garantiza por escrito a una institución que sus datos
    no se comparten: con los términos del servicio, con un contrato firmado? ¿Qué promete
    esa garantía sobre el borrado definitivo cuando el dueño se va, y sobre los datos
    personales de los alumnos, que pueden ser menores?]

- **RF-45**: El docente y el supervisor miran el seguimiento en una vista de escritorio, en
  una dirección aparte. Es secundaria: no cambia nada del diseño de celular.
  - Es la única vista de escritorio de toda la app. No hay versión de escritorio para
    cocinar (RNF-01).
  - Va en una dirección aparte de la app de cocinar.
  - Son pantallas propias, con sus propios estilos: no se adaptan las pantallas del teléfono
    a un ancho mayor.
  - Quien cocina no descarga nada de la vista de escritorio.
  - Muestra el seguimiento de RF-41 y de RF-42 y exige la sesión iniciada de un docente o un
    supervisor.
  - [NEEDS CLARIFICATION: ¿el seguimiento se puede mirar también desde el celular, o solo
    desde la vista de escritorio? La decisión del 2026-10-09 primero dijo «solo celular,
    también para el docente y el supervisor» y después sumó la vista de escritorio. ¿La
    vista de escritorio muestra solo el seguimiento, o también sirve para administrar el
    espacio (invitar gente, cargar POE y videos)? ¿Se puede descargar o imprimir el
    seguimiento?]

### Key Entities *(include if feature involves data)*

- **Membresía**: lo que se paga para tener un espacio privado. Está vinculada a la cuenta de
  quien la compra.
- **Espacio privado**: el lugar donde un dueño guarda POE y videos que solo ven quienes
  elige.
- **Dueño**: la cuenta que compró la membresía. Puede ser de una institución o de un
  particular.
- **Miembro**: una cuenta a la que el dueño le dio acceso al espacio.
- **POE privado**: un POE guardado en un espacio privado. Tiene lo mismo que cualquier POE y
  se cocina igual.
- **Video privado**: un video de un espacio privado, que puede tener derechos de autor.
- **Curso**: el conjunto de alumnos que un docente sigue.
- **Brigada**: el conjunto de cocineros que un supervisor sigue.
- **Cocinada en un espacio**: cada vez que un miembro cocinó un POE del espacio, con sus
  tiempos y sus desvíos por paso. Es el dato del que sale todo el seguimiento.
- **Seguimiento**: lo que el docente o el supervisor ve de las cocinadas de su curso o de su
  brigada: tiempos, desvíos, pasos críticos a tiempo, repeticiones y evolución.
- **Garantía de seguridad**: el compromiso escrito de que los datos del espacio están
  cifrados y no se comparten.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ningún POE ni video de un espacio privado es visible para una persona que su
  dueño no eligió, ni para una persona sin sesión.
- **SC-002**: Ningún contenido de un espacio privado aparece en lo público.
- **SC-003**: Toda membresía activa está vinculada a exactamente una cuenta.
- **SC-004**: Un alumno ve, de cada intento sobre un POE de la cátedra, su desvío en cada
  paso, y el docente ve ese mismo intento en el seguimiento.
- **SC-005**: Un supervisor obtiene, de cada cocinero y sin haber estado mirando, sus
  tiempos, sus desvíos, sus pasos críticos a tiempo y sus repeticiones por plato.
- **SC-006**: La app de cocinar en el celular es idéntica, pantalla por pantalla, con la
  vista de escritorio o sin ella, y el teléfono de quien cocina no descarga nada de la
  vista de escritorio.
- **SC-007**: Usar todo lo público sigue siendo gratis, sin límites y sin registro para
  cualquier persona, tenga o no una membresía.
- **SC-008**: Una institución recibe por escrito la garantía de que sus datos están cifrados
  y no se comparten antes de cargar su contenido.

## Assumptions

- La cuenta y el inicio de sesión con Google o Instagram son de la capacidad 005 (RF-30,
  RF-31). Esta capacidad los exige.
- Crear un POE (RF-32), el formato en que se declara (RF-05) y los videos cortos por paso
  (RF-20) son de otras capacidades; el espacio privado guarda POE y videos de ese mismo
  tipo.
- El desvío por paso, el historial de intentos contra el tiempo objetivo, la experiencia y
  los logros son los de la capacidad de progreso; el seguimiento del docente y del
  supervisor se arma con esos mismos datos.
- El flujo central (elegir una receta y que la app la lleve paso a paso) no cambia: un POE
  privado se cocina como cualquier otro.
- La app de cocinar es de celular, en castellano y para Argentina (RNF-01, RNF-08). La única
  vista de escritorio es la del seguimiento (RF-45).
- Esta capacidad necesita un servidor con cuentas, datos y cobro. La arquitectura de sitio
  estático sin servidor (ADR-015, ADR-017) se decidió para el primer lanzamiento, que no
  tiene costo de operación (RNF-07); el servidor y el cifrado de esta capacidad requieren
  sus propios ADR.
- Antes de este lanzamiento se busca una escuela o un restaurante piloto (riesgo R-05): las
  respuestas a varias preguntas de esta especificación pueden salir de ese piloto.

## Clarifications

### Session 2026-09-15

- Q: ¿A quién se dirige la app? → A: A quien cocina en su casa, a escuelas de cocina y
  universidades, y a restaurantes de hoteles de 4 y 5 estrellas.
- Q: ¿Qué lugar ocupa todo lo que se suma frente a cocinar? → A: El flujo central es elegir
  una receta y que la app la lleve paso a paso, ganando experiencia y logros. Todo lo demás
  se suma alrededor de eso y no lo reemplaza.

### Session 2026-10-09

- Q: ¿Quién carga POE en el tercer lanzamiento? → A: Quien paga la membresía: instituciones
  o particulares.
- Q: ¿Cuál es el modelo de negocio? → A: Lo público es gratis, sin límites, anónimo y con
  la cuenta opcional. Lo privado es pago, con una membresía vinculada a la cuenta, y ahí la
  cuenta es obligatoria. Lo privado incluye un marco de seguridad: cifrado y garantía de que
  los datos no se comparten. Para cocinar un POE público nunca se necesita cuenta; para uno
  privado, sí.
- Q: ¿Un particular puede tener un POE privado? → A: Solo si compra la membresía. Gratis es
  únicamente lo público.
- Q: ¿Qué recibe quien paga por mantener privados sus POE y sus videos? → A: Un marco de
  seguridad: cifrado y la garantía de que sus datos no se comparten con nadie que no haya
  elegido.
- Q: ¿El docente, el supervisor y quien carga un POE usan la app en una computadora? → A:
  Por el momento, solo celular, también para ellos. Una vista de escritorio se puede
  discutir si se necesita.
- Q: ¿Entonces el seguimiento tiene vista de escritorio? → A: Sí. El seguimiento de docentes
  y supervisores tiene una vista de escritorio, en una dirección aparte. Es secundaria: lo
  que importa es que no afecte el diseño de celular. Completa la respuesta anterior.
- Q: ¿Cómo convive la vista de escritorio con la app de celular? → A: Son pantallas propias,
  con sus propios estilos: no se adaptan las pantallas del teléfono a un ancho mayor, y
  quien cocina no descarga nada de esto.
