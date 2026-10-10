# Feature Specification: Cuentas y comunidad

**Feature Branch**: `005-cuentas-y-comunidad`

**Created**: 2026-10-10

**Status**: Baseline

**Input**: Especificación completa de la capacidad

Esta capacidad reúne todo lo que en Cocinadas se comparte entre personas en el ámbito
público: la cuenta, el inicio de sesión, los POE que cualquiera crea y publica, los
comentarios, los me gusta, el baneo de quien publica algo ofensivo, la red social y la
publicidad. Abarca RF-30 a RF-35, RF-50 y RF-51.

La regla que ordena toda la capacidad es una sola: **nada que se escriba en el servidor se
hace sin cuenta; todo lo que es leer, o guardar en el propio teléfono, se hace sin ella.**
Lo público es gratis, sin límites y sin obligación de registrarse; la cuenta es opcional.

## Roles

| Rol | Quién es | Qué puede |
|---|---|---|
| Quien cocina | Cualquier persona que usa la app, con o sin cuenta | Leer todo lo público: elegir recetas y POE públicos, cocinarlos con sus cronómetros y alarmas, ver la experiencia y los logros, leer comentarios y ver los me gusta. Guardar en su teléfono su puntaje, su historial y sus POE propios. Nada de eso exige cuenta ni se comparte con otro dispositivo |
| Quien tiene cuenta | Quien cocina y además inició sesión con Google o Instagram | Todo lo anterior, y además lo que se comparte: publicar un POE, comentar, dar me gusta, y tener su historial y su progreso guardados en la cuenta. En la etapa de red social (RF-50), seguir a otros cocineros y mandarse mensajes |
| Quien publica | Quien tiene cuenta y publicó al menos un POE | Es el autor identificado de sus POE públicos. Lo que puede hacer con un POE después de publicarlo está en las preguntas de RF-32 |
| Administrador | Quien modera | Banear la cuenta que publica contenido ofensivo (RF-35). Quién ocupa este rol está en las preguntas de RF-35 |

El docente, el alumno, el supervisor y el cocinero de un restaurante son roles de los
espacios privados y se especifican en la capacidad 006.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usar todo lo público sin cuenta e iniciar sesión solo para compartir (Priority: P1)

Quien cocina entra a la app y la usa completa sin registrarse. La app le pide una cuenta
únicamente en el momento en que quiere hacer algo que se escribe en el servidor: publicar un
POE, comentar o dar me gusta. Para eso inicia sesión con Google o con Instagram.

Es del segundo lanzamiento (Cuentas y POE públicos).

**Why this priority**: es la regla del modelo de negocio. Lo primero es la difusión: si la
app pidiera registro para cocinar, se pierde el boca a boca. Y sin cuenta no existe nada de
lo demás de esta capacidad.

**Independent Test**: se recorre la app sin sesión de punta a punta (elegir, cocinar, ver
resultados, historial y perfil) y se comprueba que nunca aparece un pedido de cuenta; después
se intenta comentar y se comprueba que recién ahí se pide iniciar sesión.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión, **When** elige una receta o un POE público, lo cocina
   de punta a punta y mira sus resultados, su historial y su perfil, **Then** la app nunca
   le pide una cuenta y todo queda guardado en su teléfono.
2. **Given** una persona sin sesión, **When** quiere publicar un POE, comentar o dar me
   gusta, **Then** la app le pide iniciar sesión con Google o con Instagram y no escribe
   nada en el servidor hasta que lo haga.
3. **Given** una persona sin sesión a la que se le pidió iniciar sesión, **When** elige
   Google y completa el ingreso, **Then** queda con la sesión iniciada en su cuenta.
4. **Given** una persona sin sesión a la que se le pidió iniciar sesión, **When** elige
   Instagram y completa el ingreso, **Then** queda con la sesión iniciada en su cuenta.
5. **Given** una persona a la que se le pidió iniciar sesión, **When** cancela o el ingreso
   no se completa, **Then** sigue usando la app sin cuenta igual que antes y no se escribió
   nada en el servidor.
6. **Given** una persona con la sesión iniciada, **When** lee, cocina y mira su progreso,
   **Then** todo funciona igual que sin cuenta: la cuenta no le quita ni le limita nada de
   lo público.

---

### User Story 2 - Crear un POE propio y guardarlo en el teléfono (Priority: P1)

Cualquiera arma su propia receta como POE (sus pasos, sus tiempos, lo que corre en
paralelo, sus ingredientes, sus utensilios y sus fotos) y la guarda en su teléfono, sin
cuenta.

Es del segundo lanzamiento (Cuentas y POE públicos).

**Why this priority**: es lo que abre la carga de POE a cualquiera y hace crecer el
catálogo, que es uno de los dos activos del producto. Sirve aunque no exista nada más de
esta capacidad, porque no necesita servidor.

**Independent Test**: sin sesión y sin conexión con ningún servidor de cuentas, se crea un
POE, se lo guarda y se comprueba que sigue en el teléfono al volver a abrir la app.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión, **When** crea un POE con sus pasos, tiempos, procesos
   en paralelo, ingredientes, utensilios y fotos y lo guarda, **Then** el POE queda guardado
   en su teléfono y la app no le pide una cuenta.
2. **Given** un POE propio guardado en el teléfono, **When** la persona vuelve a abrir la
   app, **Then** su POE sigue ahí.
3. **Given** un POE propio guardado en el teléfono sin publicar, **When** otra persona usa
   la app en otro dispositivo, **Then** no lo ve: lo guardado en el teléfono no se comparte
   con ningún otro dispositivo.
4. **Given** un POE propio guardado en el teléfono, **When** su autor lo elige, **Then** lo
   puede cocinar paso a paso como cualquier otro POE.

---

### User Story 3 - Publicar un POE (Priority: P1)

Quien creó un POE lo publica para que otros lo cocinen. Publicar se escribe en el servidor,
así que exige cuenta: el POE público tiene un autor identificado.

Es del segundo lanzamiento (Cuentas y POE públicos).

**Why this priority**: es lo que da nombre al lanzamiento. Con las cuentas y los POE
públicos, quien carga POE deja de ser solo Carlos y pasa a ser cualquier usuario registrado.

**Independent Test**: con una cuenta se publica un POE y, desde otro dispositivo sin sesión,
se comprueba que se lo ve y se lo puede cocinar entero.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión con un POE propio en su teléfono, **When** quiere
   publicarlo, **Then** la app le pide iniciar sesión y el POE no se publica hasta que lo
   haga.
2. **Given** una persona con la sesión iniciada y un POE propio, **When** lo publica,
   **Then** el POE queda público con esa cuenta como autora.
3. **Given** un POE público, **When** cualquier persona sin sesión lo elige, **Then** lo ve
   completo y lo cocina de punta a punta, gratis, sin límites y sin registrarse.
4. **Given** una cuenta baneada, **When** quiere publicar un POE, **Then** no puede.

---

### User Story 4 - Comentar y dar me gusta a un POE (Priority: P2)

Sobre un POE público, quien tiene cuenta comenta y da me gusta. Leer los comentarios y ver
los me gusta no exige cuenta.

Es del segundo lanzamiento (Cuentas y POE públicos).

**Why this priority**: es la comunidad alrededor de los POE públicos. Depende de que existan
las cuentas y los POE públicos.

**Independent Test**: con una cuenta se comenta y se da me gusta a un POE público; desde
otro dispositivo sin sesión se comprueba que el comentario y el me gusta se ven.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión, **When** abre un POE público, **Then** lee sus
   comentarios y ve sus me gusta sin que se le pida una cuenta.
2. **Given** una persona sin sesión, **When** quiere comentar o dar me gusta, **Then** la
   app le pide iniciar sesión y no escribe nada en el servidor hasta que lo haga.
3. **Given** una persona con la sesión iniciada, **When** comenta un POE público, **Then**
   el comentario queda a la vista de todos con su autor identificado.
4. **Given** una persona con la sesión iniciada, **When** da me gusta a un POE público,
   **Then** el me gusta queda registrado a nombre de su cuenta y a la vista de todos.
5. **Given** una cuenta baneada, **When** quiere comentar o dar me gusta, **Then** no puede.

---

### User Story 5 - Conservar el historial y el progreso al tener cuenta (Priority: P2)

Quien venía cocinando sin cuenta y un día inicia sesión no pierde nada: su historial y su
progreso pasan a guardarse en la cuenta, junto con lo que ya estaba en el teléfono. Desde
ahí, cambiar de teléfono o borrar los datos del navegador deja de significar perder el
historial (riesgo R-07).

Es del segundo lanzamiento (Cuentas y POE públicos).

**Why this priority**: el historial de cada persona es el otro activo del producto, lo que
hace que vuelva. La cuenta es lo que lo protege.

**Independent Test**: se cocinan recetas sin sesión, se inicia sesión, se borran los datos
del teléfono, se vuelve a iniciar sesión y se comprueba que el historial, la experiencia y
los logros son los mismos.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión con cocinadas guardadas en su teléfono, **When** inicia
   sesión, **Then** esas cocinadas quedan guardadas en su cuenta y sigue viendo el mismo
   historial, la misma experiencia y los mismos logros que antes.
2. **Given** una persona con la sesión iniciada, **When** termina una cocinada, **Then** la
   cocinada queda guardada en su cuenta.
3. **Given** una persona con cocinadas guardadas en su cuenta, **When** inicia sesión en
   otro teléfono, **Then** ve su historial y su progreso.
4. **Given** una persona con cocinadas guardadas en su cuenta que borró los datos de su
   navegador, **When** vuelve a iniciar sesión, **Then** recupera su historial y su
   progreso.

---

### User Story 6 - Banear la cuenta que publica contenido ofensivo (Priority: P2)

Todo lo que se escribe en el servidor tiene una cuenta detrás justamente para esto: si
alguien publica algo ofensivo, esa cuenta se puede banear.

Es del segundo lanzamiento (Cuentas y POE públicos).

**Why this priority**: es la razón por la que publicar, comentar y dar me gusta exigen
cuenta. Abrir la publicación a cualquiera sin poder banear es un riesgo del lanzamiento
(R-06).

**Independent Test**: se banea una cuenta de prueba y se comprueba que ya no puede publicar,
comentar ni dar me gusta, y que la persona sigue pudiendo cocinar lo público.

**Acceptance Scenarios**:

1. **Given** una cuenta que publicó contenido ofensivo, **When** el administrador la banea,
   **Then** esa cuenta no puede publicar un POE, comentar ni dar me gusta.
2. **Given** una persona cuya cuenta fue baneada, **When** usa la app, **Then** sigue
   pudiendo leer y cocinar todo lo público y guardar en su teléfono, como cualquier persona
   sin cuenta.
3. **Given** una cuenta baneada, **When** se mira lo que esa cuenta había subido,
   **Then** pasa lo que se defina en RF-35.

---

### User Story 7 - Seguir cocineros y mandarse mensajes (Priority: P3)

Los POE públicos están a la vista de todos y a cada creador se lo puede seguir para ver lo
nuevo que publica. Quienes tienen cuenta se mandan mensajes. Es una red social alrededor de
cocinar bien, donde lo que se comparte no es una foto del plato sino el procedimiento para
que salga.

Es de la etapa «Más adelante», posterior al tercer lanzamiento.

**Why this priority**: se apoya en todo lo anterior y no es de ninguno de los tres primeros
lanzamientos.

**Independent Test**: con una cuenta se sigue a un creador, ese creador publica un POE y se
comprueba que quien lo sigue se entera.

**Acceptance Scenarios**:

1. **Given** una persona con la sesión iniciada, **When** sigue a un creador, **Then** ve lo
   nuevo que ese creador publica.
2. **Given** una persona sin sesión, **When** quiere seguir a un creador o mandar un
   mensaje, **Then** la app le pide iniciar sesión, porque seguir y mandar mensajes se
   escriben en el servidor.
3. **Given** dos personas con cuenta, **When** una le manda un mensaje a la otra, **Then**
   la otra lo recibe.
4. **Given** una cuenta baneada, **When** quiere seguir a alguien o mandar un mensaje,
   **Then** pasa lo que se defina en RF-50.

---

### User Story 8 - Publicidad de cocina (Priority: P3)

La app muestra publicidad, al estilo de Instagram pero de cocina.

Es de la etapa «Más adelante», posterior al tercer lanzamiento.

**Why this priority**: es una fuente de ingresos posterior a la membresía, que es la
primera. No es de ninguno de los tres primeros lanzamientos.

**Independent Test**: con la publicidad activa se recorre la app sin sesión y se comprueba
que todo lo público sigue siendo gratis, sin límites y sin registro.

**Acceptance Scenarios**:

1. **Given** la publicidad activa, **When** una persona sin sesión usa la app, **Then**
   sigue pudiendo leer y cocinar todo lo público gratis, sin límites y sin registrarse.
2. **Given** la publicidad activa, **When** una persona cocina, **Then** la publicidad se
   muestra donde y como se defina en RF-51.

---

### Edge Cases

- La misma persona entra una vez con Google y otra con Instagram: si es una cuenta o son
  dos se define en RF-31.
- Una persona inicia sesión en un teléfono que tiene cocinadas y su cuenta ya tenía otras,
  de otro teléfono: cómo se juntan se define en RF-34.
- Una persona con cuenta cocina sin internet: la app tiene que abrir y funcionar sin
  internet (RNF-03), así que la cocinada no se puede perder; cuándo llega a la cuenta se
  define en RF-34.
- Una persona cierra la sesión: qué queda en el teléfono se define en RF-34.
- Un POE público se modifica o se retira después de que otros lo cocinaron, lo comentaron o
  le dieron me gusta: se define en RF-32.
- Un POE propio usa un ingrediente o un utensilio que no está en el catálogo: se define en
  RF-32.
- El contenido ofensivo está en una foto o en el texto de un POE y no en un comentario: el
  baneo alcanza a cualquier contenido que la cuenta publique (RF-35).
- La cuenta baneada pertenece a alguien que además tiene una membresía paga: se define en
  RF-35.
- Sin conexión, alguien quiere publicar, comentar o dar me gusta: no se puede escribir en el
  servidor; qué le dice la app se define en la interfaz de la capacidad.

## Requirements *(mandatory)*

### Functional Requirements

- **RF-30**: La app tiene cuentas de usuario, guardadas en un servidor con su base de
  datos. La cuenta es opcional para todo lo público y es lo que identifica a quien escribe
  en el servidor.
  - La cuenta guarda, como mínimo, la identidad con la que la persona inició sesión, su
    historial y su progreso (RF-34), y lo que publicó: sus POE, sus comentarios y sus me
    gusta.
  - Una cuenta tiene un estado de baneo (RF-35).
  - Lo que se comparte tiene que tener un autor identificado.
  - [NEEDS CLARIFICATION: ¿con qué nombre y qué foto aparece una persona como autora de un
    POE o de un comentario: los de su cuenta de Google o Instagram, o un apodo que elige?
    Lo público se define como «anónimo» para quien lee y con «autor identificado» para
    quien escribe; hay que decidir cuánto de la identidad real queda a la vista de todos.]
  - [NEEDS CLARIFICATION: ¿la persona puede eliminar su cuenta? Si la elimina, ¿qué pasa
    con sus POE públicos, sus comentarios y sus me gusta? ¿Hay edad mínima para tener
    cuenta y hay que aceptar términos de uso y una política de privacidad al crearla?]

- **RF-31**: Se inicia sesión con Google o con Instagram. La sesión se pide para todo lo
  que se escribe en el servidor: publicar un POE, comentar o dar me gusta. Para leer,
  cocinar y guardar en el propio teléfono no se pide nunca.
  - Los modos de ingreso son esos dos. No hay ingreso por nombre.
  - Si el ingreso se cancela o no se completa, la persona sigue sin cuenta y no se escribe
    nada en el servidor.
  - Para cocinar un POE público nunca se necesita cuenta; para uno privado, sí (capacidad
    006).
  - [NEEDS CLARIFICATION: ¿la cuenta se crea sola la primera vez que alguien inicia sesión,
    sin formulario de registro? Si la misma persona entra una vez con Google y otra con
    Instagram, ¿son dos cuentas distintas o una sola, y se pueden unir?]
  - [NEEDS CLARIFICATION: cuando alguien sin sesión toca comentar, dar me gusta o publicar
    y entonces inicia sesión, ¿la app completa sola la acción que había empezado o la
    persona tiene que repetirla? ¿Y la persona puede cerrar la sesión cuando quiera?]

- **RF-32**: Cualquiera crea su POE y lo guarda en su teléfono, sin cuenta. Para publicarlo
  se necesita cuenta.
  - Un POE propio tiene lo mismo que cualquier POE: pasos, tiempos, procesos que corren en
    paralelo, ingredientes, utensilios y fotos. Su formato es el de RF-05.
  - El POE guardado en el teléfono no se comparte con ningún otro dispositivo.
  - Un POE público lo ve y lo cocina cualquiera, gratis, sin límites y sin registrarse, y
    tiene como autora a la cuenta que lo publicó.
  - Una cuenta baneada no puede publicar.
  - Quien publica puede sumar videos cortos a los pasos de su POE (RF-20, capacidad de
    cocina).
  - [NEEDS CLARIFICATION: al crear un POE, ¿los ingredientes y los utensilios se eligen del
    catálogo común, o cada persona carga los suyos con su marca y su foto? ¿Qué es lo
    mínimo que tiene que tener un POE para poder guardarse y para poder publicarse?]
  - [NEEDS CLARIFICATION: después de publicar un POE, ¿su autor puede modificarlo, retirarlo
    de lo público o borrarlo? Si lo hace, ¿qué pasa con los comentarios, los me gusta y el
    historial de quienes ya lo cocinaron?]
  - [NEEDS CLARIFICATION: ¿un POE se publica al instante o pasa antes por una aprobación?
    El plan de contingencia del riesgo R-06 prevé la publicación con aprobación previa.]
  - [NEEDS CLARIFICATION: ¿dónde aparecen los POE públicos de los usuarios: mezclados con
    las recetas del catálogo de Carlos o en un lugar aparte? ¿Con qué orden y con qué
    búsqueda? ¿Existe la lista de «los más votados»?]
  - [NEEDS CLARIFICATION: cocinar un POE propio o un POE público de otro usuario, ¿da
    experiencia y logros igual que una receta del catálogo de Carlos? Si da lo mismo,
    alguien puede armarse un POE trivial para sumar puntos.]
  - [NEEDS CLARIFICATION: con cuenta, ¿los POE propios sin publicar se guardan también en
    la cuenta, para no perderlos al cambiar de teléfono, o quedan solo en el teléfono? Si
    se guardan en la cuenta sin ser públicos, son contenido privado en el servidor, que
    según el modelo de negocio es lo que se paga con la membresía.]

- **RF-33**: Los POE públicos tienen comentarios y me gusta.
  - Comentar y dar me gusta exigen cuenta. Leer los comentarios y ver los me gusta, no.
  - Cada comentario y cada me gusta queda a nombre de la cuenta que lo escribió.
  - Una cuenta baneada no puede comentar ni dar me gusta.
  - [NEEDS CLARIFICATION: reglas de los comentarios y de los me gusta. ¿El comentario es
    solo texto, con qué largo máximo? ¿Se puede responder a un comentario? ¿Quién puede
    borrar un comentario: su autor, el autor del POE, el administrador? ¿El me gusta es uno
    por cuenta y por POE y se puede quitar? ¿Se puede dar me gusta a un comentario?]

- **RF-34**: Con cuenta, el historial y el progreso se guardan en la cuenta, y se conserva
  lo que ya estaba en el teléfono. Es lo que resuelve el riesgo R-07 (perder el historial al
  cambiar de teléfono o al borrar los datos del navegador).
  - Al iniciar sesión, ninguna cocinada guardada en el teléfono se pierde.
  - La experiencia y los logros se calculan a partir de las cocinadas guardadas, como se
    define en la capacidad de progreso; al guardar las cocinadas en la cuenta, la
    experiencia y los logros se conservan.
  - Sin cuenta, todo sigue guardándose en el teléfono y nada sale de él.
  - [NEEDS CLARIFICATION: cuando alguien inicia sesión en un teléfono que tiene cocinadas y
    su cuenta ya tenía otras de otro teléfono, ¿se suman las dos? Al cerrar la sesión, ¿el
    historial queda en el teléfono o se va con la cuenta? ¿Qué más se guarda en la cuenta
    además de las cocinadas: la preferencia de tema y de sonido, la cocinada en curso?]

- **RF-35**: La cuenta que publica contenido ofensivo se puede banear.
  - Una cuenta baneada no puede publicar un POE, comentar ni dar me gusta.
  - El baneo no le quita a la persona lo que cualquiera hace sin cuenta: leer y cocinar todo
    lo público y guardar en su teléfono.
  - El baneo alcanza a cualquier contenido que una cuenta escribe en el servidor: POE, fotos,
    videos y comentarios.
  - [NEEDS CLARIFICATION: ¿quién banea: solo Carlos, o hay más administradores? ¿Cómo se
    entera de un contenido ofensivo: hay un botón para denunciar, y lo puede usar alguien
    sin cuenta? ¿Qué se considera ofensivo?]
  - [NEEDS CLARIFICATION: ¿qué pasa con lo que la cuenta baneada ya había subido: sus
    POE, sus comentarios y sus me gusta se ocultan, se borran o quedan? ¿El baneo es
    definitivo o puede ser por un tiempo? ¿Se le avisa a la persona y puede reclamar?
    ¿Conserva el historial guardado en su cuenta? ¿Qué pasa si además tiene una membresía
    paga?]

- **RF-50**: Red social: seguir cocineros y mandarse mensajes.
  - A cada creador se lo puede seguir para ver lo nuevo que publica.
  - Seguir y mandar mensajes se escriben en el servidor: exigen cuenta.
  - Lo que se comparte en esta red es el procedimiento para que el plato salga, no la foto
    del plato.
  - Los seguidores de una persona son parte de su historial en la app.
  - [NEEDS CLARIFICATION: ¿dónde ve una persona lo nuevo de quienes sigue? ¿Los mensajes
    son privados entre dos cuentas, y se le puede escribir a cualquiera o solo a quien uno
    sigue? ¿Se puede bloquear a alguien y denunciar un mensaje, y el baneo de RF-35 alcanza
    a los mensajes? La descripción de negocio pone el seguir a un creador junto con los
    comentarios y los me gusta: ¿seguir se adelanta al segundo lanzamiento o queda para más
    adelante junto con los mensajes?]

- **RF-51**: Publicidad, al estilo de Instagram pero de cocina.
  - La publicidad no cambia la regla de lo público: sigue siendo gratis, sin límites y sin
    obligación de registrarse.
  - [NEEDS CLARIFICATION: ¿dónde se muestra la publicidad y dónde nunca (por ejemplo,
    mientras se cocina con las manos ocupadas)? ¿Quién anuncia y cómo carga su aviso? ¿La
    ve también quien paga una membresía? ¿Qué se anuncia: productos de cocina, POE
    promocionados, cuentas?]

### Key Entities *(include if feature involves data)*

- **Cuenta**: la identidad de una persona en el servidor, a la que entra iniciando sesión
  con Google o Instagram. Tiene lo que la persona publicó, su historial y su
  progreso, y su estado de baneo.
- **Sesión**: el vínculo entre un teléfono y una cuenta. Sin sesión, la app funciona
  completa para leer y para guardar en el teléfono.
- **POE propio**: un POE creado por una persona y guardado en su teléfono. No tiene autor en
  el servidor ni se comparte.
- **POE público**: un POE a la vista de todos, con una cuenta como autora. Tiene comentarios
  y me gusta.
- **Comentario**: un texto de una cuenta sobre un POE público.
- **Me gusta**: la marca de una cuenta sobre un POE público.
- **Cocinada**: cada vez que una persona cocinó una receta, con sus tiempos. Sin cuenta vive
  en el teléfono; con cuenta, además en la cuenta. De las cocinadas salen la experiencia y
  los logros.
- **Baneo**: la marca sobre una cuenta que le impide escribir en el servidor.
- **Seguimiento entre cuentas**: una cuenta sigue a otra para ver lo nuevo que publica
  (RF-50). No es el seguimiento de alumnos y cocineros de la capacidad 006.
- **Mensaje**: lo que una cuenta le manda a otra (RF-50).
- **Aviso publicitario**: lo que se muestra como publicidad (RF-51).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona sin cuenta completa el recorrido entero de elegir, cocinar y ver
  sus resultados, su historial y su perfil sin encontrar un solo pedido de registro.
- **SC-002**: Ninguna escritura en el servidor ocurre sin una cuenta detrás: todo POE
  público, comentario y me gusta se puede atribuir a una cuenta.
- **SC-003**: Al iniciar sesión por primera vez, la persona conserva el 100 % de las
  cocinadas que tenía en el teléfono, con la misma experiencia y los mismos logros.
- **SC-004**: Una persona que cambia de teléfono o borra los datos del navegador recupera
  todo su historial con solo iniciar sesión.
- **SC-005**: Un POE público se puede ver y cocinar completo desde un dispositivo sin
  sesión.
- **SC-006**: Desde que una cuenta es baneada, ningún POE, comentario ni me gusta nuevo de
  esa cuenta llega a verse.
- **SC-007**: El modelo «quién carga POE» se cumple por lanzamiento: en el segundo, cualquier
  usuario registrado publica; cocinar sigue sin cuenta.

## Assumptions

- El flujo central (elegir una receta y que la app la lleve paso a paso, ganando experiencia
  y logros) no cambia: todo lo de esta capacidad se suma alrededor y no lo reemplaza.
- La capacidad necesita un servidor con cuentas y datos. La arquitectura de sitio estático
  sin servidor (ADR-015, ADR-017) se decidió para el primer lanzamiento, que no tiene costo
  de operación (RNF-07); el servidor de esta capacidad requiere un ADR propio.
- El formato en que se declara un POE (RF-05) y el mecanismo para cargarlo sin editar
  archivos a mano (RF-06a) son de la capacidad de catálogo; esta capacidad los usa para el
  POE propio.
- Los videos cortos de cada paso (RF-20), la tabla de posiciones (RF-24) y compartir el
  progreso en Instagram (RF-25) son de otras capacidades.
- Los espacios privados, la membresía y su cobro son de la capacidad 006. Esta capacidad
  provee la cuenta y el inicio de sesión que aquella exige.
- La app es de celular, en castellano y para Argentina (RNF-01, RNF-08). Nada de esta
  capacidad tiene vista de escritorio.
- Quién carga POE cambia con cada lanzamiento: en el primero, solo Carlos; en el segundo,
  cualquier usuario registrado; en el tercero se suma quien paga la membresía.

## Clarifications

### Session 2026-09-15

- Q: ¿A quién se dirige la app? → A: A quien cocina en su casa, a escuelas de cocina y
  universidades, y a restaurantes de hoteles de 4 y 5 estrellas.
- Q: ¿Qué lugar ocupa todo lo que se suma (cuentas, comunidad) frente a cocinar? → A: El
  flujo central es elegir una receta y que la app la lleve paso a paso, ganando experiencia
  y logros. Todo lo demás se suma alrededor de eso y no lo reemplaza.

### Session 2026-10-09

- Q: ¿Quién carga POE? → A: Cambia con cada lanzamiento. En el primero, solo Carlos. En el
  segundo, cualquier usuario registrado. En el tercero, además, quien paga la membresía.
- Q: ¿Hay que registrarse para cocinar? → A: No. Sin registro para cocinar; el registro
  aparece solo para subir o comentar un POE.
- Q: ¿Cuál es el modelo de negocio? → A: Lo público es gratis, sin límites, anónimo y con
  la cuenta opcional. Lo privado es pago, con una membresía vinculada a la cuenta, y ahí la
  cuenta es obligatoria. Para cocinar un POE público nunca se necesita cuenta; para uno
  privado, sí.
- Q: ¿Un particular puede tener un POE privado gratis? → A: No. Solo si compra la
  membresía. Gratis es únicamente lo público.
- Q: ¿Qué se puede hacer sin cuenta y qué no? → A: Nada que se escriba en el servidor se
  hace sin cuenta. Sin cuenta se puede leer todo y guardar en el propio teléfono: cocinar,
  ver el progreso, guardar el puntaje y guardar POE propios, sin compartirlo con otro
  dispositivo. Publicar, comentar y dar me gusta exigen cuenta, para poder banear a quien
  publique algo ofensivo.
- Q: ¿Por qué exige cuenta todo lo que se comparte? → A: Para identificar a quien escribe:
  si publica algo ofensivo, hay que poder banear su cuenta.
- Q: ¿En qué pantalla se usa esta capacidad? → A: Solo en el celular. La única vista de
  escritorio prevista es la del seguimiento de docentes y supervisores (RF-45, capacidad
  006).
