# Feature Specification: Catálogo y POE

**Feature Branch**: `002-catalogo-y-poe`

**Created**: 2026-10-10

**Status**: Baseline

**Input**: Especificación completa de la capacidad

Esta capacidad cubre el catálogo de recetas y la receta como POE (procedimiento operativo
estándar): qué recetas hay, qué se ve de cada una antes de cocinarla, de qué maneras se
puede preparar, qué declara el formato de una receta y cómo se carga. Abarca RF-01 a RF-10
(con RF-06a a RF-06e y RF-08a) y RF-52 a RF-56. Lo que pasa desde la mise en place en
adelante es de la capacidad de cocinar.

El formato de los datos está en [contracts/receta.md](contracts/receta.md), las entidades en
[data-model.md](data-model.md) y los requerimientos de interfaz con el diseño aprobado en
[ux.md](ux.md).

## Clarifications

### Session 2026-09-15

- Q: ¿Cuál es el flujo central de la app? → A: Elegir una receta y que la app la lleve paso
  a paso, ganando experiencia y logros. Todo lo demás se suma alrededor de eso y no lo
  reemplaza.
- Q: ¿De dónde sale el diseño de las pantallas? → A: De la interfaz que Carlos aprobó al
  verla; no hay prototipo aparte. Lo aprobado está en [ux.md](ux.md).
- Q: ¿A quién se dirige la app? → A: A quien cocina en su casa, a escuelas de cocina y
  universidades, y a restaurantes de hoteles de 4 y 5 estrellas.

### Session 2026-10-09

- Q: ¿Qué relación hay entre el POE de papel y la app? → A: El POE de papel es una
  planilla; la app tiene que tener toda esa información, pero adaptada a la pantalla
  interactiva del celular (RF-06).
- Q: ¿Quién escribe las recetas? → A: Carlos, a medida que las aprende.
- Q: ¿Quién carga POE? → A: Cambia con cada lanzamiento: en el primero, solo Carlos; en el
  segundo, cualquier usuario registrado; en el tercero, además, quien paga la membresía en
  su espacio privado.
- Q: ¿Para cuántas porciones son las recetas? → A: Una porción por ahora; más adelante la
  receta se adapta a los comensales (RF-07, RF-08).
- Q: ¿Qué información del POE de papel tiene que sumar la app? → A: Cómo cargarlo, el
  costo, los valores nutricionales, si tiene TACC y los octógonos (RF-06a a RF-06e).
- Q: ¿Se muestran costos en el primer lanzamiento? → A: No. Se muestran cuando exista la
  integración con los supermercados, y antes de hacerla se discute con Carlos cómo un
  administrador agrega supermercados (RF-06b, RF-54, RF-56). Reemplaza lo que la respuesta
  anterior decía del costo.
- Q: ¿Una porción, cero desperdicio y sin sal agregada son obligatorios? → A: No. Son
  variantes que se eligen desde la receta y se combinan. En el primer lanzamiento no están
  esos selectores (RF-08a).
- Q: ¿En qué dispositivo trabaja quien carga un POE? → A: Por el momento, solo en el
  celular, igual que quien cocina. Una vista de escritorio se puede discutir si es
  necesaria.
- Q: ¿Qué se puede hacer sin cuenta? → A: Leer todo y guardar en el propio teléfono, que
  incluye elegir recetas y guardar POE propios sin compartirlos con otro dispositivo. Nada
  que se escriba en el servidor se hace sin cuenta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir qué cocinar de la lista de recetas (Priority: P1)

Quien cocina abre la lista y ve, de un vistazo y de parado, qué platos hay: de cada uno la
foto del plato terminado, cuánto tiempo lleva, para cuántas porciones es y cuántas calorías
tiene. Toca una receta y entra a su ficha. No necesita cuenta.

**Why this priority**: Es el primer paso del flujo central (elegir una receta y cocinarla).
Sin lista no hay nada que cocinar.

**Independent Test**: Con un catálogo de al menos una receta, se abre la lista sin cuenta,
se comprueba que cada tarjeta trae foto, tiempo, porciones y calorías, y que al tocarla se
llega a la ficha de esa receta.

**Acceptance Scenarios**:

1. **Given** un catálogo con una o más recetas, **When** quien cocina abre la lista,
   **Then** ve una tarjeta por receta (no una por modo de preparación), cada una con la
   foto del plato terminado, el nombre, el tiempo total, las porciones y las calorías.
2. **Given** una receta con más de un modo de preparación, **When** se muestra su tarjeta,
   **Then** el tiempo es el del modo propuesto, que es el más lento.
3. **Given** la lista a la vista, **When** quien cocina toca una tarjeta, **Then** se abre
   la ficha de esa receta con el modo propuesto elegido.
4. **Given** alguien que no tiene cuenta, **When** entra sin registrarse, **Then** ve la
   lista completa de recetas públicas y puede abrir cualquiera.
5. **Given** que el catálogo todavía se está leyendo, **When** se abre la lista, **Then**
   se avisa que se están buscando las recetas, y si no se puede leer se dice con un mensaje
   de error en lugar de mostrar una lista vacía.

---

### User Story 2 - Ver la ficha de la receta antes de empezar (Priority: P1)

Quien eligió una receta ve su ficha: el plato, sus valores, y todo lo que va a necesitar,
ingrediente por ingrediente y utensilio por utensilio, cada uno con la foto del producto
concreto, para reconocerlo en la alacena. Desde ahí pasa a la mise en place.

**Why this priority**: Es donde se decide cocinar y con qué. Sin la ficha, la mise en place
y la cocina no tienen de dónde partir.

**Independent Test**: Se abre la ficha de una receta y se comprueba que muestra el plato,
el tiempo, las porciones, las calorías y la proteína, la lista de ingredientes con foto y
cantidad, la lista de utensilios con foto, y el paso a la mise en place.

**Acceptance Scenarios**:

1. **Given** una receta del catálogo, **When** se abre su ficha, **Then** se ven la foto y
   el nombre del plato y, juntos, el tiempo total del modo elegido, las porciones, las
   calorías y la proteína por porción.
2. **Given** la ficha abierta, **When** quien cocina mira lo que necesita, **Then**
   encuentra todos los ingredientes de la receta, cada uno con su foto, su nombre (con la
   marca) y su cantidad, y todos los utensilios, cada uno con su foto y su nombre.
3. **Given** un ingrediente con cantidad «½ cdta», **When** se muestra en la ficha,
   **Then** se lee «1/2 cucharadita (2,5 ml)»: la fracción en tres caracteres, la unidad
   con su palabra entera y la equivalencia entre paréntesis.
4. **Given** un ingrediente o un utensilio con foto, **When** se toca la foto, **Then** se
   amplía, y se cierra tocando en cualquier lado.
5. **Given** un elemento que la receta declara sin ficha de catálogo (agua, un bol, un
   plato), **When** se muestra en la ficha, **Then** aparece por su nombre, sin foto y sin
   que eso rompa la lista.
6. **Given** la ficha abierta, **When** quien cocina decide empezar, **Then** tiene siempre
   a mano una acción que lo lleva a la mise en place y que dice el tiempo total del modo
   elegido.
7. **Given** la ficha abierta, **When** quien cocina vuelve atrás, **Then** regresa a la
   lista de recetas.

---

### User Story 3 - Elegir el modo de preparación (Priority: P1)

La misma receta se puede cocinar de más de una manera. Quien recién aprende elige la fácil:
la mise en place primero y una cosa por vez. Quien ya la domina elige la difícil: flujo
continuo, con todo en paralelo. Cambia el orden de los pasos y el tiempo total; el plato y
las cantidades son los mismos.

**Why this priority**: Es lo que permite que la misma receta sirva para aprender y para
entrenar, y define qué línea de tiempo se va a cocinar.

**Independent Test**: En la ficha de una receta con dos modos se comprueba cuál se propone,
cómo se distingue cada uno, que al cambiar de modo cambia el tiempo que se anuncia y que la
cocinada arranca con el modo elegido.

**Acceptance Scenarios**:

1. **Given** una receta con más de un modo, **When** se abre su ficha, **Then** se ven
   todos los modos, ordenados del más lento al más rápido, cada uno con su nombre, su
   tiempo total y una explicación corta de qué cambia.
2. **Given** una receta con más de un modo, **When** se abre su ficha por primera vez,
   **Then** el modo elegido es el más lento.
3. **Given** los modos a la vista, **When** quien cocina los compara, **Then** el más lento
   se distingue como fácil y todos los demás como difíciles.
4. **Given** un modo elegido, **When** quien cocina toca otro, **Then** el tiempo total de
   la ficha y el de la acción de empezar pasan a ser los del modo nuevo, y la foto, el
   nombre, las porciones, las calorías, la proteína, los ingredientes y sus cantidades no
   cambian.
5. **Given** un modo elegido, **When** quien cocina pasa a la mise en place, **Then** la
   cocinada usa las etapas, los pasos y los procesos de ese modo.
6. **Given** quien no sabe qué es un modo, **When** pide la explicación, **Then** lee que
   la receta se puede cocinar de más de una manera, que cambia el orden de los pasos y el
   tiempo total pero no el plato ni las cantidades, y que puede cambiarlo hasta que empiece
   a cocinar.

---

### User Story 4 - Un catálogo de lanzamiento de cuatro recetas probadas (Priority: P1)

Quien abre la app por primera vez encuentra cuatro platos para cocinar, escritos por Carlos
como POE: fideos con brócoli, filet de merluza al papillot, pizza al molde y bife de
chorizo con arroz. Cada uno declara un tiempo real y usa ingredientes y utensilios
concretos.

**Why this priority**: Es el contenido del primer lanzamiento. Un criterio de éxito del
proyecto es que las cuatro se cocinen de punta a punta con la app.

**Independent Test**: Se recorre el catálogo y se comprueba que están las cuatro recetas,
que cada una cumple el contrato de datos, y que cada una se puede cocinar entera en la app
respetando sus tiempos.

**Acceptance Scenarios**:

1. **Given** el catálogo del primer lanzamiento, **When** se abre la lista, **Then** están
   las cuatro recetas: fideos con brócoli, filet de merluza al papillot, pizza al molde y
   bife de chorizo con arroz.
2. **Given** cualquiera de las cuatro, **When** se revisa su tiempo declarado, **Then** es
   el real de punta a punta: el reloj arranca al abrir el freezer e incluye descongelar,
   lavar y cortar.
3. **Given** cualquiera de las cuatro, **When** se revisan sus ingredientes y utensilios,
   **Then** cada uno es un producto concreto, con su marca y su foto.
4. **Given** cualquiera de las cuatro, **When** se compara su planilla para imprimir con lo
   que muestra la app, **Then** las dos dicen lo mismo.
5. **Given** cualquiera de las cuatro, **When** se la cocina en la app siguiendo cada paso
   en su tiempo previsto, **Then** se llega al final sin que la app pida nada que la
   receta no declare.

---

### User Story 5 - Una receta que dice qué se cronometra y qué puede pasarse (Priority: P1)

Quien escribe un POE declara, tarea por tarea, lo que la app necesita para llevar el reloj
con criterio: si la tarea se cronometra, si pasarse de tiempo arruina el plato o solo
demora, si tiene un tiempo mínimo (marinar, reposar) y con qué otras tareas corre en
paralelo. Con eso la app sabe a qué ponerle cronómetro, cuándo alarmar y qué mostrar en
paralelo.

**Why this priority**: Es la base de los cronómetros y las alarmas, que son bloqueantes del
primer lanzamiento, y de la carga de POE (RF-06a): las recetas tienen que nacer con el
formato definitivo.

**Independent Test**: Se escribe una receta con una tarea de cada tipo (cronometrada y sin
cronometrar, crítica y no crítica, con mínimo y sin mínimo, en paralelo y sola) y se
comprueba que el formato permite declarar cada cosa, que la validación rechaza una receta
incoherente y que la app lee lo declarado.

**Acceptance Scenarios**:

1. **Given** una receta en el formato de RF-05, **When** se lee cualquiera de sus tareas,
   **Then** la tarea dice explícitamente si se cronometra o no.
2. **Given** una tarea, **When** se lee su declaración, **Then** dice si pasarse de tiempo
   arruina el plato (crítica) o solo demora.
3. **Given** una tarea con tiempo mínimo, como un marinado o un reposo, **When** se lee su
   declaración, **Then** dice cuál es ese mínimo.
4. **Given** una tarea que corre en paralelo con otras, **When** se lee su declaración,
   **Then** dice con cuáles.
5. **Given** una receta cuyas declaraciones se contradicen (una tarea que apunta a otra
   que no existe, tiempos que no cierran con la etapa), **When** se valida, **Then** la
   receta se rechaza diciendo qué está mal y no entra al catálogo.

---

### User Story 6 - Toda la información del POE de papel, en el celular (Priority: P2)

El POE de papel es una planilla completa. Quien cocina con la app tiene que encontrar en
ella todo lo que la planilla dice, adaptado a la pantalla interactiva del celular: además
de lo que ya cubren las historias anteriores, los valores nutricionales completos, si el
plato tiene TACC y los octógonos de advertencia.

**Why this priority**: Es del primer lanzamiento. Sin esto la app sabe menos que el papel
que viene a reemplazar, pero el flujo de elegir y cocinar funciona igual.

**Independent Test**: Se toma la planilla de una receta y se recorre dato por dato
comprobando que cada uno se puede encontrar en la app; se comprueba además que la ficha
muestra los valores nutricionales completos, si tiene TACC y sus octógonos.

**Acceptance Scenarios**:

1. **Given** la planilla de una receta, **When** se busca en la app cada dato que la
   planilla trae, **Then** todos están, en alguna pantalla del recorrido de esa receta.
2. **Given** la ficha de una receta, **When** quien cocina mira su información
   nutricional, **Then** encuentra los valores nutricionales completos del plato, no solo
   las calorías y la proteína.
3. **Given** la ficha de una receta, **When** quien cocina necesita saber si es apta para
   celíacos, **Then** la ficha dice si la receta tiene TACC o no.
4. **Given** una receta cuyo plato excede algún límite del etiquetado frontal, **When** se
   abre su ficha, **Then** se ven los octógonos de advertencia que le corresponden: exceso
   de azúcares, de grasas, de sodio y los demás.
5. **Given** una receta cuyo plato no excede ningún límite, **When** se abre su ficha,
   **Then** no aparece ningún octógono.
6. **Given** el primer lanzamiento, **When** se abre cualquier ficha, **Then** no se
   muestra ningún costo (RF-06b).

---

### User Story 7 - Cargar un POE sin editar archivos a mano (Priority: P2)

Quien escribe un POE lo carga con un mecanismo pensado para eso, sin tocar archivos. En el
primer lanzamiento lo usa solo Carlos, que escribe las recetas a medida que las aprende; es
la base de la carga por usuarios del segundo lanzamiento (RF-32).

**Why this priority**: Es del primer lanzamiento, pero quien cocina puede usar la app con
recetas cargadas de otra manera; lo que destraba es sumar recetas con menos esfuerzo y sin
errores.

**Independent Test**: Carlos carga una receta completa con el mecanismo, sin editar ningún
archivo, y la receta aparece en la lista y se cocina de punta a punta.

**Acceptance Scenarios**:

1. **Given** un POE nuevo, **When** Carlos lo carga con el mecanismo, **Then** no necesita
   editar ningún archivo a mano y el resultado cumple el contrato de datos de la receta.
2. **Given** un POE cargado con el mecanismo, **When** se abre la lista de recetas,
   **Then** la receta está, con su ficha, y se puede cocinar.
3. **Given** un POE con datos incoherentes o incompletos, **When** se lo intenta cargar,
   **Then** el mecanismo lo dice, señalando qué corregir, y no lo incorpora al catálogo.
4. **Given** el primer lanzamiento, **When** alguien que no es Carlos usa la app, **Then**
   no puede cargar POE al catálogo.

---

### User Story 8 - Adaptar la receta: variantes y comensales (Priority: P3)

Es de un lanzamiento posterior al primero («Más adelante»). Desde la ficha, quien cocina
elige cómo quiere la receta combinando variantes: sin sal, cero desperdicio y cantidad de
porciones. Por ejemplo, sin sal y cero desperdicio para dos personas. La receta se adapta a
la cantidad de comensales.

**Why this priority**: No es del primer lanzamiento, donde cada receta existe en una sola
combinación (RF-07) y no hay selectores de variantes.

**Independent Test**: En la ficha de una receta con variantes se elige una combinación y se
comprueba que lo que se muestra y lo que se cocina corresponde a esa combinación.

**Acceptance Scenarios**:

1. **Given** una receta con variantes, **When** se abre su ficha, **Then** quien cocina
   puede elegir entre sin sal, cero desperdicio y cantidad de porciones.
2. **Given** las variantes a la vista, **When** quien cocina elige más de una, **Then** se
   combinan entre sí: por ejemplo, sin sal y cero desperdicio para dos personas.
3. **Given** una cantidad de comensales elegida, **When** se muestra la receta, **Then**
   está adaptada a esa cantidad.
4. **Given** el primer lanzamiento, **When** se abre cualquier ficha, **Then** no hay
   selectores de variantes y la receta se muestra en su única combinación, con su cantidad
   de porciones a la vista.

---

### User Story 9 - Filtrar el catálogo por sal y por aptitud para celíacos (Priority: P3)

Es de un lanzamiento posterior al primero («Más adelante»). Cuando el catálogo crece con
recetas de otros autores, quien cocina filtra la lista: con o sin sal, y aptas para
celíacos.

**Why this priority**: Con un catálogo chico y propio no es necesario; se vuelve útil
cuando entran recetas de los usuarios.

**Independent Test**: Con un catálogo que mezcla recetas con y sin sal, y con y sin TACC,
se aplica cada filtro y se comprueba que la lista muestra solo las que corresponden.

**Acceptance Scenarios**:

1. **Given** un catálogo con recetas con sal y sin sal, **When** quien cocina filtra por
   sin sal, **Then** la lista muestra solo las recetas sin sal.
2. **Given** un catálogo con recetas con y sin TACC, **When** quien cocina filtra por apto
   celíacos, **Then** la lista muestra solo las recetas sin TACC.
3. **Given** un filtro aplicado, **When** quien cocina lo quita, **Then** la lista vuelve a
   mostrar todas las recetas.

---

### User Story 10 - Imprimir la receta (Priority: P3)

Es de un lanzamiento posterior al primero («Más adelante»). Quien quiere el POE en papel lo
imprime desde la app: cada receta tiene su planilla para imprimir, que dice lo mismo que la
app.

**Why this priority**: El papel es el complemento; el flujo central es cocinar con la app.

**Independent Test**: Desde una receta se pide imprimir y se obtiene su planilla, con el
mismo contenido que muestra la app.

**Acceptance Scenarios**:

1. **Given** una receta del catálogo, **When** quien cocina pide imprimirla, **Then**
   obtiene la planilla imprimible de esa receta.
2. **Given** la planilla obtenida, **When** se la compara con lo que muestra la app,
   **Then** las dos dicen lo mismo.

---

### User Story 11 - Mis ingredientes y utensilios, y qué puedo cocinar con ellos (Priority: P3)

Es de un lanzamiento posterior al primero («Más adelante»). Quien usa la app carga lo que
tiene en su casa: qué ingredientes hay en la heladera y la alacena, qué utensilios en la
cocina, y agrega al catálogo los que no están. Con eso, el buscador le muestra qué recetas
puede preparar con lo que ya tiene y qué necesita conseguir para las demás.

**Why this priority**: Se apoya en un catálogo amplio y en los POE de los usuarios; no es
parte del flujo central.

**Independent Test**: Se marcan los ingredientes y utensilios de una receta como
disponibles y se comprueba que la búsqueda la ofrece como preparable; se quita uno y se
comprueba que pasa a figurar con lo que necesita conseguir.

**Acceptance Scenarios**:

1. **Given** un ingrediente o un utensilio que no está en el catálogo, **When** quien usa
   la app lo agrega, **Then** queda disponible como propio para usarlo en sus recetas y en
   su lista de lo que tiene en casa.
2. **Given** una lista de lo que hay en casa, **When** quien cocina busca recetas por lo
   que tiene, **Then** ve cuáles puede preparar con eso.
3. **Given** la misma búsqueda, **When** una receta necesita algo que no está en casa,
   **Then** la receta aparece aparte, indicando qué se necesita para poder prepararla.

---

### User Story 12 - Cuánto cuesta el plato y dónde comprar lo necesario (Priority: P3)

Es de un lanzamiento posterior al primero («Más adelante»). La app calcula cuánto cuesta
cada plato con precios actuales, lo muestra en la ficha y permite comprar desde la receta:
los ingredientes en el supermercado online más cercano y los utensilios en Mercado Libre.
Cuando lo mismo está en más de un lugar, compara precios y deja elegir. Un administrador
suma supermercados nuevos a la integración.

**Why this priority**: Depende de una integración externa que no es del primer
lanzamiento; en el primer lanzamiento no se muestra ningún costo.

**Independent Test**: Con la integración de precios disponible, se abre una ficha y se
comprueba que muestra el costo del plato calculado con precios actuales; se inicia la
compra de sus ingredientes y de un utensilio, y se comprueba que se puede elegir entre
lugares con precio distinto.

**Acceptance Scenarios**:

1. **Given** la integración con supermercados disponible, **When** se abre la ficha de una
   receta, **Then** se ve el costo del plato, junto a las calorías, calculado con los
   precios actuales de sus ingredientes en los supermercados de la zona y de sus utensilios
   en Mercado Libre.
2. **Given** que la integración con supermercados no existe, **When** se abre cualquier
   ficha, **Then** no se muestra ningún costo.
3. **Given** una receta, **When** quien cocina decide comprar sus ingredientes, **Then**
   la app lo lleva al supermercado online más cercano con lo que pide el POE ya cargado en
   el carrito.
4. **Given** un utensilio de una receta, **When** quien cocina decide comprarlo, **Then**
   la app lo lleva a ese utensilio en Mercado Libre.
5. **Given** un ingrediente o un utensilio que está en más de un lugar, **When** se
   muestra para comprar, **Then** la app compara los precios y deja elegir dónde.
6. **Given** un supermercado que todavía no está en la integración, **When** un
   administrador lo agrega, **Then** sus precios pasan a usarse para el costo y la compra,
   sin rehacer la app.

---

### Edge Cases

- **Receta con un solo modo de preparación.** [NEEDS CLARIFICATION: si una receta tiene un
  solo modo, ¿la ficha lo muestra igual como tarjeta «¡Fácil!» o no muestra selector de
  modo?]
- **Dos modos con el mismo tiempo total.** [NEEDS CLARIFICATION: si dos modos de una receta
  duran lo mismo, ¿cuál es el fácil y cuál se propone?]
- **Catálogo sin recetas.** [NEEDS CLARIFICATION: ¿qué muestra la lista si el catálogo no
  tiene ninguna receta? En el primer lanzamiento no debería pasar, pero con filtros (RF-09)
  o búsqueda por lo que hay en casa (RF-52) sí puede quedar vacía.]
- **Ingrediente o utensilio con ficha y sin foto.** La regla es que cada uno tenga su foto;
  si una ficha llega sin ella, el elemento se muestra por su nombre con un marcador en el
  lugar de la foto, y la receta no deja de poder abrirse.
- **Receta que no cumple el contrato.** No entra al catálogo: una receta con otro número de
  esquema, con identificadores que no existen o con tiempos que no cierran no se ofrece
  para cocinar.
- **Renombrar un ingrediente o un utensilio que alguna receta usa.** Los identificadores
  son estables; cambiar uno obliga a actualizar todas las recetas que lo nombran, y la
  validación detecta la que quedó apuntando a algo que no existe.
- **Cambio de modo mientras la ficha todavía se actualiza.** Lo que se muestra al final es
  siempre lo del último modo elegido; la respuesta atrasada de un modo anterior no pisa al
  nuevo.
- **Sin conexión.** El catálogo viaja con la app, así que la lista, las fichas y las fotos
  se ven sin internet (RNF-03, ADR-017).

## Requirements *(mandatory)*

### Functional Requirements

**Lista y ficha (primer lanzamiento)**

- **RF-01**: La app DEBE mostrar una lista con todas las recetas del catálogo, una entrada
  por receta, cada una con la foto del plato terminado, el nombre, el tiempo total, las
  porciones y las calorías por porción. El tiempo total que se muestra es el del modo
  propuesto, que es el más lento. La lista se ve sin cuenta. Al elegir una receta se abre
  su ficha. [NEEDS CLARIFICATION: ¿en qué orden se listan las recetas?]
- **RF-02**: La ficha de la receta DEBE mostrar el plato (foto y nombre), el tiempo total
  del modo elegido, las porciones, las calorías y la proteína por porción, y la lista
  completa de ingredientes y de utensilios, cada uno con su foto. De cada ingrediente se ve
  el nombre y la cantidad; de cada utensilio, el nombre. Las cantidades se leen sin
  ambigüedad: la fracción en tres caracteres («1/2»), la unidad con su palabra entera
  («cucharadita») y la equivalencia entre paréntesis («(2,5 ml)»). Toda foto se amplía al
  tocarla. Desde la ficha se pasa a la mise en place (RF-11) con una acción que dice el
  tiempo total. Un elemento que la receta declara sin ficha de catálogo se muestra por su
  nombre, sin foto.
- **RF-03**: Una receta PUEDE tener más de un modo de preparación: fácil (la mise en place
  primero y una cosa por vez) o difícil (flujo continuo, todo en paralelo). Cambia el orden
  de los pasos y el tiempo total; no cambian el plato ni las cantidades. La ficha DEBE
  mostrar los modos del más lento al más rápido, cada uno con su nombre, su ícono, su
  tiempo total y un resumen de qué cambia; el más lento es el fácil y es el que se propone,
  y los demás son difíciles. Quien cocina puede cambiar de modo hasta que empieza a
  cocinar, y la cocinada usa el modo elegido. La ficha explica qué es un modo a quien lo
  pide.
- **RF-04**: El catálogo del primer lanzamiento DEBE tener cuatro recetas, escritas por
  Carlos como POE: fideos con brócoli, filet de merluza al papillot, pizza al molde y bife
  de chorizo con arroz. Cada receta del catálogo propio cumple estas reglas: existe como
  planilla para imprimir y como datos que usa la app, y las dos dicen lo mismo; su tiempo
  declarado es el real de punta a punta (el reloj arranca al abrir el freezer e incluye
  descongelar, lavar y cortar); y cada ingrediente y cada utensilio es uno concreto, con su
  marca y su foto. [NEEDS CLARIFICATION: ¿cada receta de lanzamiento tiene que traer los dos
  modos de preparación (fácil y difícil), o alcanza con uno?] [NEEDS CLARIFICATION: el bife
  de chorizo lleva sal agregada según el formato de datos («0 salvo carnes rojas»); ¿la
  receta de lanzamiento del bife se escribe con sal o sin sal agregada?]
- **RF-07**: Las recetas del catálogo propio se escriben para una porción, con cero
  desperdicio y sin sal agregada. No es una regla del catálogo: la receta declara para
  cuántas porciones rinde y cuánta sal agregada lleva, la app muestra las porciones que la
  receta declara y no supone que sea una, y esas tres características pasan a ser variantes
  elegibles con RF-08a.

**Formato y carga del POE (primer lanzamiento)**

- **RF-05**: El formato de receta DEBE declarar, por cada tarea: si se cronometra o no; si
  pasarse de tiempo arruina el plato (crítica) o solo demora; si tiene un tiempo mínimo
  (por ejemplo marinar o reposar) y cuál es; y si puede correr en paralelo con otras
  tareas, y con cuáles. El formato vigente, del que parte, está en
  [contracts/receta.md](contracts/receta.md). [NEEDS CLARIFICATION: ¿«tarea» unifica en un
  solo concepto el trabajo de manos y lo que corre solo, o se conservan las dos clases y
  cada una suma estas declaraciones?] [NEEDS CLARIFICATION: ¿la criticidad por tarea
  reemplaza a la marca de «vigilancia» de la etapa entera, o conviven?] [NEEDS
  CLARIFICATION: ¿una tarea que no se cronometra tiene igual una duración prevista que
  cuenta para el tiempo total de la receta?] [NEEDS CLARIFICATION: el paralelismo, ¿se
  declara nombrando las otras tareas o se deduce de los minutos de inicio y fin?]
- **RF-06**: La app DEBE mostrar toda la información del POE de papel, adaptada a la
  pantalla interactiva del celular. Además de lo que cubren RF-01 a RF-03 y la capacidad de
  cocinar, eso incluye la carga del POE (RF-06a), los valores nutricionales completos
  (RF-06c), si tiene TACC (RF-06d) y los octógonos (RF-06e). El costo (RF-06b) no es del
  primer lanzamiento. La planilla trae, y por lo tanto la app tiene que ofrecer: el tiempo
  total y cómo se declara, las porciones, la sal agregada y la equivalencia de las medidas;
  de cada utensilio, para qué se usa y cómo; de cada ingrediente, la cantidad y el estado o
  preparación en que entra al plato; los valores nutricionales por porción; qué sobra y
  cómo se guarda; de cada etapa, si exige vigilancia, cuánto dura, cuándo arranca y cuándo
  termina su reloj y si admite pausa; de cada paso, el minuto, qué hacer y cómo, y el
  porqué con sus etiquetas; el diagrama de tiempos con lo que corre en paralelo; los
  criterios de diseño de la versión; y las reglas de seguridad y conservación.
  [NEEDS CLARIFICATION: los criterios de diseño y las reglas de seguridad y conservación se
  probaron en la ficha y la volvían larguísima; ¿en qué pantalla y de qué forma se
  muestran?] [NEEDS CLARIFICATION: ¿dónde se muestran la preparación de cada ingrediente,
  el uso de cada utensilio, la sal agregada y qué sobra y cómo se guarda: en la ficha, en
  la mise en place o en el paso donde se usan?]
- **RF-06a**: DEBE existir un mecanismo para cargar un POE sin editar archivos a mano. En
  el primer lanzamiento lo usa solo Carlos. El POE que produce cumple el contrato de datos
  y pasa la misma validación que cualquier receta del catálogo; uno que no la pasa no entra
  y se dice por qué. Es la base de la carga de POE por los usuarios (RF-32). Quien carga un
  POE trabaja en el celular. [NEEDS CLARIFICATION: ¿qué forma tiene el mecanismo: un
  formulario dentro de la app, un asistente que conversa, la importación de un documento u
  otra cosa?] [NEEDS CLARIFICATION: en el primer lanzamiento no hay servidor ni costo de
  operación; ¿cómo llega al catálogo de todos un POE que Carlos carga desde su teléfono?]
  [NEEDS CLARIFICATION: ¿el mecanismo también tiene que producir la planilla para imprimir
  y cargar las fotos del plato, de los ingredientes y de los utensilios?]
- **RF-06c**: La ficha DEBE mostrar los valores nutricionales completos del plato, por
  porción. [NEEDS CLARIFICATION: ¿qué nutrientes forman la tabla «completa»? El formato de
  receta declara calorías, proteína, fibra y sodio; las fichas de los ingredientes traen
  además carbohidratos, grasas totales y grasas saturadas; los octógonos necesitan además
  azúcares.] [NEEDS CLARIFICATION: ¿la tabla completa reemplaza a la fila de tiempo,
  porciones, calorías y proteína de la ficha, o se suma aparte y la fila queda como está?]
- **RF-06d**: La ficha DEBE decir si la receta tiene TACC o no. [NEEDS CLARIFICATION: ¿lo
  declara quien escribe la receta, o se deduce de sus ingredientes, marcando cada
  ingrediente como con o sin TACC?] [NEEDS CLARIFICATION: ¿con qué texto o símbolo se
  muestra, y qué se muestra si de algún ingrediente no se sabe?]
- **RF-06e**: La ficha DEBE mostrar los octógonos de advertencia del etiquetado frontal
  argentino que le corresponden al plato: exceso de azúcares, de grasas, de sodio y los
  demás. Se calculan para el plato. [NEEDS CLARIFICATION: ¿los calcula la app a partir de
  los valores nutricionales del plato, con los límites del etiquetado frontal, o los
  declara quien escribe la receta?] [NEEDS CLARIFICATION: ¿«los demás» son exceso de grasas
  totales, de grasas saturadas y de calorías, y también las leyendas de edulcorantes y de
  cafeína?]

**Lanzamientos posteriores**

- **RF-06b**: La ficha DEBE mostrar el costo del plato, junto a las calorías. Es de «Más
  adelante»: se muestra recién cuando existe la integración con supermercados (RF-54); sin
  ella no se muestra ningún costo. [NEEDS CLARIFICATION: ¿el costo es por porción o de la
  receta entera, y se muestra también el precio de cada ingrediente?] [NEEDS CLARIFICATION:
  ¿el costo del plato incluye el de los utensilios, o los utensilios se informan aparte?]
- **RF-08**: La receta DEBE adaptarse a la cantidad de comensales. Es de «Más adelante».
  [NEEDS CLARIFICATION: al cambiar los comensales, ¿cambian solo las cantidades, o también
  los tiempos, los pasos y los utensilios? ¿Entre qué cantidades se puede elegir?]
- **RF-08a**: La receta DEBE ofrecer variantes que se eligen desde su ficha y se combinan
  entre sí: sin sal, cero desperdicio y cantidad de porciones (por ejemplo, sin sal y cero
  desperdicio para dos personas). Es de «Más adelante»; en el primer lanzamiento no están
  esos selectores. [NEEDS CLARIFICATION: ¿cómo declara una receta sus variantes y qué
  cambia con cada combinación: cantidades, pasos, tiempos?] [NEEDS CLARIFICATION: ¿cómo
  conviven las variantes con el modo de preparación, que ya es un selector de la ficha, y
  qué combinación se propone al abrirla?]
- **RF-09**: La lista de recetas DEBE poder filtrarse: con o sin sal, y apto celíacos. Es
  de «Más adelante». La receta lleva la marca de con o sin sal y la de sin TACC (RF-06d).
  [NEEDS CLARIFICATION: si «sin sal» también es una variante elegible de cada receta
  (RF-08a), ¿el filtro muestra las recetas que se escribieron sin sal o las que ofrecen
  esa variante?] [NEEDS CLARIFICATION: ¿los dos filtros se combinan entre sí?]
- **RF-10**: Quien cocina DEBE poder imprimir la receta desde la app: obtiene la planilla
  imprimible de la receta, que dice lo mismo que la app. Es de «Más adelante». Las recetas
  que cargan los usuarios (RF-32) generan también su planilla. [NEEDS CLARIFICATION: ¿se
  imprime la planilla del modo de preparación elegido, o se ofrecen las de todos los
  modos?]
- **RF-52**: Quien usa la app DEBE poder agregar ingredientes y utensilios propios al
  catálogo (los que no están) y registrar lo que tiene en su casa, y DEBE poder buscar
  recetas por lo que hay en casa: cuáles puede preparar con lo que tiene y qué necesita
  para las demás. Es de «Más adelante». [NEEDS CLARIFICATION: ¿qué datos se piden de un
  ingrediente o utensilio propio: nombre, foto y unidad, o también marca y valores
  nutricionales?] [NEEDS CLARIFICATION: lo que hay en casa, ¿se registra solo como «tengo»
  o «no tengo», o con cantidades?] [NEEDS CLARIFICATION: ¿los ingredientes y utensilios
  propios quedan solo en el teléfono de quien los cargó, o los ven todos?]
- **RF-53**: Desde la receta se DEBE poder comprar: los ingredientes en el supermercado
  online más cercano, con lo que pide el POE ya cargado en el carrito, y los utensilios en
  Mercado Libre, eligiendo entre marcas. Es de «Más adelante». [NEEDS CLARIFICATION:
  «eligiendo entre marcas», ¿vale para los ingredientes, para los utensilios o para los
  dos? Si un ingrediente admite varias marcas, ¿la receta sigue nombrando un producto
  concreto como recomendado?] [NEEDS CLARIFICATION: ¿cómo se determina el supermercado más
  cercano: por la ubicación del teléfono o por una dirección que carga quien compra?]
- **RF-54**: El costo del plato se DEBE calcular con precios actuales: los ingredientes en
  las páginas de los supermercados de la zona y los utensilios en Mercado Libre. Es de «Más
  adelante» y es la base de RF-06b, RF-53 y RF-55. [NEEDS CLARIFICATION: ¿cómo se define
  «la zona» de quien usa la app, y qué se muestra cuando un ingrediente no tiene precio en
  ningún supermercado?] [NEEDS CLARIFICATION: cuando un ingrediente tiene precio en varios
  supermercados, ¿qué precio entra en el costo del plato: el más bajo, el del más cercano o
  un promedio?]
- **RF-55**: Cuando el mismo ingrediente o utensilio está en más de un lugar, la app DEBE
  comparar los precios y dejar elegir. Es de «Más adelante».
- **RF-56**: Un administrador DEBE poder agregar supermercados nuevos a la integración sin
  rehacer la app. Es de «Más adelante». [NEEDS CLARIFICATION: ¿cómo agrega un administrador
  un supermercado y quién es administrador? Carlos pidió discutirlo antes de empezar la
  integración.]

### Key Entities *(include if feature involves data)*

- **Receta**: Un plato del catálogo, escrito como POE. Tiene nombre, foto del plato
  terminado, momento del día, porciones, valores nutricionales por porción, sal agregada, y
  uno o más modos de preparación.
- **Modo de preparación (versión)**: Una manera de cocinar la receta: mismo plato y mismas
  cantidades, otro orden y otro tiempo total. Tiene título, resumen, ícono, tiempo total y
  sus etapas.
- **Etapa**: Un tramo de la receta con su propio reloj. Dice si exige vigilancia, cuánto
  dura, cuándo arranca y si admite una pausa al terminar.
- **Paso**: Trabajo de manos dentro de una etapa, con minuto de inicio, duración, acciones,
  criticidad y porqué.
- **Proceso paralelo**: Algo que corre solo mientras las manos hacen otra cosa (un
  descongelado, una olla al fuego), con inicio, fin y criticidad.
- **Ingrediente**: Un producto concreto del catálogo, con marca y foto; la receta lo usa
  con una cantidad y una preparación.
- **Utensilio**: Un utensilio o equipo concreto del catálogo, con marca, especificaciones y
  foto; la receta dice para qué lo usa.

El detalle está en [data-model.md](data-model.md) y en
[contracts/receta.md](contracts/receta.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Alguien que abre la app por primera vez, sin cuenta, llega de la lista a la
  ficha de una receta con un solo toque y sin leer instrucciones.
- **SC-002**: El catálogo del primer lanzamiento ofrece las cuatro recetas de RF-04, y cada
  una se cocina de punta a punta con la app.
- **SC-003**: El 100 % de las recetas del catálogo pasa la validación del contrato de
  datos; ninguna receta que no la pasa se ofrece para cocinar.
- **SC-004**: El 100 % de los ingredientes y utensilios con ficha que usa una receta del
  catálogo propio se muestra con su foto.
- **SC-005**: Para cada receta, todo dato de su planilla para imprimir se encuentra en la
  app, y ningún dato difiere entre las dos.
- **SC-006**: Dos personas distintas que cocinan el mismo POE obtienen el mismo plato.
- **SC-007**: Toda la información de la lista y de la ficha se lee de parado, a un brazo de
  distancia: ningún texto informativo por debajo de 13,5 px (RNF-02).
- **SC-008**: Carlos carga una receta nueva completa sin editar ningún archivo a mano
  (RF-06a).

## Assumptions

- El catálogo del primer lanzamiento es público y único: lo escribe solo Carlos, viaja
  entero con la app (ADR-017) y es el mismo para todos. No hay recetas privadas ni de otros
  autores hasta los lanzamientos 2 y 3.
- La lista y la ficha no requieren cuenta ni conexión: son lectura (principio V de la
  constitución, RNF-03, RNF-05).
- La app es solo para celular y en castellano de Argentina (RNF-01, RNF-08); también para
  quien carga un POE.
- La pantalla de entrada, la barra inferior, los botones de tema y de sonido y la barra de
  experiencia que acompañan a la lista pertenecen a otras capacidades; acá se nombran solo
  donde conviven con la lista y la ficha (ver [ux.md](ux.md)).
- La mise en place y todo lo que pasa al cocinar (cronómetros, alarmas, línea de tiempo)
  son de la capacidad de cocinar; esta capacidad les entrega la receta y el modo elegidos y
  define el formato que leen.
- RF-05 cambia el formato de receta. Hasta que sus preguntas estén respondidas, el contrato
  describe el formato vigente (esquema 1) y señala dónde entra cada declaración nueva.
- Los requerimientos marcados «Más adelante» se especifican hasta donde las fuentes los
  definen; sus preguntas abiertas se resuelven con Carlos antes de planificarlos.
