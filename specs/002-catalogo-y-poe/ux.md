# Requerimientos de interfaz y diseño aprobado: Catálogo y POE

Acompaña a [spec.md](spec.md). Por cada historia dice qué tiene que poder hacer quien
cocina, qué información necesita a la vista y en qué orden, los estados de la pantalla y
los textos. Al final, el diseño que Carlos aprobó: son reglas, y cambiarlas es cambiar un
requerimiento.

Vale para todo lo que sigue: es una app de celular que se lee de parado, a un brazo de
distancia y con las manos ocupadas. Ningún texto informativo por debajo de 13,5 px, botones
grandes, tema claro y oscuro. Los textos van en castellano de Argentina, con voseo.

## Historia 1 · Elegir qué cocinar de la lista (RF-01, RF-04, RF-07)

**Qué tiene que poder hacer:** ver qué recetas hay, compararlas de un vistazo y abrir una
con un solo toque. Toda la tarjeta es el botón.

**Información a la vista, en este orden:**

1. El saludo y la pregunta que invita a elegir.
2. La barra de experiencia (su contenido es de la capacidad de progreso).
3. El título de la sección y cuántas recetas hay.
4. Una tarjeta por receta. En cada tarjeta: la foto del plato terminado, ocupando la
   tarjeta; encima, el nombre del plato; y tres datos, en este orden: tiempo del modo
   propuesto (el más lento), porciones y calorías.
5. La barra inferior con Recetas, Historial y Perfil.

**Estados:**

| Estado | Qué se ve |
|---|---|
| Cargando | El saludo y la barra de experiencia ya están; en el lugar de las tarjetas, el aviso de que se están buscando las recetas |
| Éxito | Las tarjetas y la cantidad de recetas |
| Error | Un mensaje de error en el lugar de las tarjetas, que dice que no se pudo leer el catálogo. Nunca una lista vacía sin explicación |
| Vacío | [NEEDS CLARIFICATION: ¿qué texto se muestra si no hay ninguna receta para listar?] |
| Sin conexión | Igual que con conexión: el catálogo y sus fotos viajan con la app (RNF-03) |

**Textos:**

| Dónde | Texto |
|---|---|
| Saludo | «¡Hola!» |
| Pregunta | «¿Qué cocinamos hoy?» |
| Título de la sección | «Recetas» |
| Cantidad | «1 disponible» / «N disponibles» |
| Datos de la tarjeta | «21 min» · «1 porc» · «720 kcal» |
| Cargando | «Buscando recetas…» |
| Error | «No se pudo leer el catálogo» seguido del motivo |

El tiempo se dice en minutos enteros, redondeado («21 min»): en la lista y en la ficha
importa el orden de magnitud, no el segundo.

## Historia 2 · Ver la ficha de la receta (RF-02, RF-07)

**Qué tiene que poder hacer:** reconocer el plato, saber cuánto lleva y qué aporta, repasar
todo lo que necesita con la foto de cada cosa, ampliar una foto para ver bien el envase,
volver a la lista y pasar a la mise en place.

**Información a la vista, en este orden:**

1. La foto del plato terminado, a todo el ancho, con el nombre del plato encima y el botón
   para volver a la lista.
2. Una fila de cuatro valores: tiempo, porciones, calorías y proteína. Cada uno con su
   ícono, el valor en grande y su nombre debajo.
3. El modo de preparación (historia 3).
4. Lo que se necesita, en dos solapas: Ingredientes (la que se abre primero) y Utensilios.
   Cada fila de ingrediente: foto, nombre con marca y cantidad. Cada fila de utensilio:
   foto y nombre.
5. Fijo al pie, siempre a la vista aunque se haga scroll: el botón que lleva a la mise en
   place y dice el tiempo total del modo elegido.

**Cómo se leen las cantidades:** la fracción en tres caracteres («1/2», no «½», que en
pantalla se ve diminuta); un entero con fracción se separa con un espacio («1 1/2»); la
unidad con su palabra entera y en el número que corresponde («cucharadita»,
«cucharadas»); y la equivalencia entre paréntesis («(2,5 ml)»). Una cucharadita son 5 ml y
una cucharada, 15 ml. Si la cantidad ya trae su equivalencia entre paréntesis, se respeta
la que trae. Las cantidades que no son de cucharas se muestran como están, con las
fracciones legibles («125 g (1/2 bolsa)»).

**Fotos:** cualquier foto de un ingrediente o de un utensilio se amplía al tocarla y se
cierra tocando en cualquier lado. Un elemento sin foto se muestra con un ícono en su lugar
y no se puede ampliar.

**Estados:**

| Estado | Qué se ve |
|---|---|
| Cargando | La foto, el nombre y los cuatro valores ya están, porque vienen de la lista; en el lugar de las solapas, el aviso de que se está abriendo la receta. El botón de empezar no aparece hasta que la receta está completa |
| Éxito | Todo lo anterior, las solapas y el botón fijo al pie |
| Error | Un mensaje de error que dice que no se pudo abrir la receta. Se puede volver a la lista. No aparece el botón de empezar |
| Vacío | No aplica: una receta sin ingredientes o sin pasos no cumple el contrato y no entra al catálogo |
| Sin conexión | Igual que con conexión |

**Textos:**

| Dónde | Texto |
|---|---|
| Nombres de los valores | «Tiempo» · «Porciones» · «Calorías» · «Proteína» |
| Valores | «21 min» · «1» · «720 kcal» · «38 g» |
| Solapas | «Ingredientes» · «Utensilios» |
| Botón al pie | «Comenzar · 21 min →» |
| Volver | Un botón «‹», que se anuncia como «Volver a las recetas» |
| Cargando | «Abriendo la receta…» |
| Error | «No se pudo abrir la receta» seguido del motivo |
| Foto ampliable | Se anuncia como «Ver la foto de» y el nombre; ampliada, «Cerrar la foto de» y el nombre |

## Historia 3 · Elegir el modo de preparación (RF-03)

**Qué tiene que poder hacer:** ver de cuántas maneras se cocina la receta, entender la
diferencia sin salir de la ficha, elegir una con un toque y cambiarla cuantas veces quiera
antes de empezar.

**Información a la vista, en este orden:**

1. El título que pide elegir, con un «?» al lado.
2. Si se tocó el «?», la explicación de qué es un modo; otro toque la cierra.
3. Una tarjeta por modo, del más lento al más rápido. En cada tarjeta: el ícono del modo
   y, debajo, el cartel de dificultad; el nombre del modo y su tiempo total; el resumen de
   qué cambia; y la marca de cuál está elegido.

El más lento va en verde con el cartel «¡Fácil!»; los demás, en rojo con «¡Difícil!». Al
abrir la ficha está elegido el más lento.

**Estados:**

| Estado | Qué se ve |
|---|---|
| Éxito | Las tarjetas, con una elegida |
| Cambio de modo | La ficha no parpadea: lo anterior sigue a la vista hasta que llega lo nuevo, y recién ahí se reemplaza. Cambian el valor de tiempo de la fila y el del botón al pie. Si se tocan varios modos seguidos, queda el último |
| Error al cambiar | El mensaje de error de la ficha |
| Un solo modo | [NEEDS CLARIFICATION: si la receta tiene un solo modo, ¿se muestra igual como tarjeta «¡Fácil!» o no se muestra el selector?] |

**Textos:**

| Dónde | Texto |
|---|---|
| Título | «Seleccioná el modo de preparación» |
| Ayuda | Un botón «?», que se anuncia como «Qué es el modo de preparación» |
| Explicación | «La receta se puede cocinar de más de una manera. Tocá la que quieras usar: cambia el orden de los pasos y el tiempo total, no el plato ni las cantidades. Podés cambiarla hasta que empieces a cocinar.» |
| Carteles | «¡Fácil!» · «¡Difícil!» |
| Nombre, resumen e ícono de cada modo | Los que declara la receta. En el catálogo propio: «Mise en place primero» (🎯) y «Flujo continuo» (⚡) |

## Historia 4 · El catálogo de lanzamiento (RF-04)

No tiene pantalla propia: se ve en la lista y en las fichas. Lo que la interfaz tiene que
respetar de las recetas del catálogo propio está en «Diseño aprobado por Carlos», punto
6.5.

## Historia 5 · El formato declara qué se cronometra (RF-05)

No tiene pantalla en esta capacidad: lo que declara cada tarea se ve al cocinar. Cómo se
muestran los cronómetros y las alarmas es de la capacidad de cocinar.

## Historia 6 · Toda la información del POE de papel (RF-06, RF-06c, RF-06d, RF-06e)

**Qué tiene que poder hacer:** encontrar en el celular cada dato de la planilla, y en la
ficha saber qué aporta el plato, si es apto para celíacos y qué advertencias lleva, antes
de decidir cocinarlo.

**Información que se suma a la ficha:**

- Los valores nutricionales completos, por porción. [NEEDS CLARIFICATION: ¿qué nutrientes y
  en qué lugar de la ficha: reemplazan a la fila de cuatro valores o van aparte?]
- Si la receta tiene TACC o no. [NEEDS CLARIFICATION: ¿con qué texto o símbolo, y en qué
  lugar de la ficha?]
- Los octógonos de advertencia que le corresponden al plato. Un plato sin excesos no
  muestra ninguno. [NEEDS CLARIFICATION: ¿en qué lugar de la ficha van los octógonos, y se
  ven también en la tarjeta de la lista?]
- Lo demás que trae la planilla y la ficha no muestra: la preparación de cada ingrediente,
  el uso de cada utensilio, la sal agregada, qué sobra y cómo se guarda, los criterios de
  diseño y las reglas de seguridad y conservación. [NEEDS CLARIFICATION: ¿en qué pantalla
  va cada uno? Los criterios y la seguridad se probaron en la ficha y la volvían
  larguísima.]

En el primer lanzamiento la ficha no muestra ningún costo.

**Estados y textos:** se definen con las respuestas de arriba y con el diseño que Carlos
elija; no hay diseño aprobado para esta historia.

## Historia 7 · Cargar un POE sin editar archivos (RF-06a)

**Qué tiene que poder hacer:** quien escribe un POE lo carga entero desde el celular, ve
qué está mal antes de que entre al catálogo y lo corrige.

**Información, estados y textos:** [NEEDS CLARIFICATION: ¿qué forma tiene el mecanismo de
carga? Sin esa respuesta no hay pantallas que describir.] Lo que ya es regla: se usa en el
celular; un POE incoherente o incompleto no entra y el mecanismo dice qué corregir; en el
primer lanzamiento lo usa solo Carlos. No hay diseño aprobado para esta historia.

## Historia 8 · Variantes y comensales (RF-08, RF-08a) — «Más adelante»

**Qué tiene que poder hacer:** desde la ficha, elegir sin sal, cero desperdicio y cantidad
de porciones, combinándolas, y ver la receta adaptada.

**Información:** los selectores de variantes en la ficha, junto al modo de preparación, que
ya es un selector. [NEEDS CLARIFICATION: ¿cómo conviven los selectores de variantes con las
tarjetas de modo, y qué combinación se propone al abrir la ficha?] En el primer lanzamiento
no hay selectores de variantes. No hay diseño aprobado para esta historia.

## Historia 9 · Filtros (RF-09) — «Más adelante»

**Qué tiene que poder hacer:** en la lista, quedarse con las recetas con o sin sal y con
las aptas para celíacos, y quitar el filtro.

**Estados:** con un filtro aplicado la lista puede quedar vacía; ese estado tiene que decir
que ninguna receta coincide y ofrecer quitar el filtro. [NEEDS CLARIFICATION: ¿los filtros
se combinan, y dónde van en la lista?] No hay diseño aprobado para esta historia.

## Historia 10 · Imprimir (RF-10) — «Más adelante»

**Qué tiene que poder hacer:** desde la receta, obtener su planilla para imprimir.

**Información:** una acción de imprimir en la ficha. [NEEDS CLARIFICATION: ¿imprime la
planilla del modo elegido o deja elegir entre las de todos los modos?] No hay diseño
aprobado para esta historia.

## Historia 11 · Lo que tengo en casa (RF-52) — «Más adelante»

**Qué tiene que poder hacer:** agregar un ingrediente o un utensilio que no está en el
catálogo, marcar lo que tiene en su casa y buscar recetas por eso.

**Información:** en el resultado de la búsqueda, primero las recetas que se pueden preparar
con lo que hay; después las demás, cada una con lo que se necesita para prepararla.
[NEEDS CLARIFICATION: ¿qué datos se piden de un ingrediente o utensilio propio, y lo que
hay en casa se registra con cantidades?] No hay diseño aprobado para esta historia.

## Historia 12 · Costo y compra (RF-06b, RF-53 a RF-56) — «Más adelante»

**Qué tiene que poder hacer:** ver en la ficha cuánto cuesta el plato, comprar los
ingredientes en el supermercado online más cercano y los utensilios en Mercado Libre, y
elegir dónde cuando hay más de un lugar. Un administrador agrega supermercados.

**Información:** el costo en la ficha, junto a las calorías. Al comprar, los lugares
disponibles con sus precios comparados.

**Estados:** sin integración con supermercados no se muestra ningún costo ni ninguna acción
de compra. [NEEDS CLARIFICATION: ¿qué se muestra cuando un ingrediente no tiene precio, y
cómo agrega un supermercado el administrador?] No hay diseño aprobado para esta historia.

## Diseño aprobado por Carlos

Cada punto lo pidió Carlos o lo aprobó al verlo. Cambiar cualquiera es cambiar un
requerimiento: se le pregunta antes.

### 6.1 En toda la app

- Es de celular y se lee de parado: ningún texto informativo por debajo de 13,5 px.
- Dos botones redondos flotan arriba a la derecha en todas las pantallas menos la de
  entrada: el de tema (claro u oscuro) y, debajo, el de sonido. Los dos se recuerdan.
- Una barra inferior con Recetas, Historial y Perfil, en esas tres pantallas.
- El botón de atrás del teléfono vuelve una pantalla. Solo en la de entrada sale de la app.
- Todo se guarda en el teléfono y nada sale de él. Sin cuenta se usa la app completa.
- Los cambios de pantalla y lo que aparece o desaparece van animados. Con «reducir
  movimiento» activado en el teléfono las animaciones se apagan y nada deja de verse.
- Cualquier foto de un ingrediente, de un utensilio o de un paso se amplía al tocarla y se
  cierra tocando en cualquier lado.
- Se instala desde el navegador y se actualiza sola.

### 6.2 Entrada, lista y ficha de la receta

- Entrada: el logotipo, el lema «Tu receta, al punto justo», el botón «Continuar con
  Google» y «Entrar sin cuenta». En el primer lanzamiento «Continuar con Google» no inicia
  sesión: las cuentas son del segundo lanzamiento (RF-30, RF-31) y se entra sin cuenta.
- Lista: saludo, barra de experiencia y una tarjeta por receta con foto, tiempo del modo
  propuesto (el más lento), porciones y calorías.
- Ficha: tiempo, porciones, calorías y proteína. Los modos de preparación son tarjetas: el
  más lento va en verde con el cartel «¡Fácil!» y los demás en rojo con «¡Difícil!». Un «?»
  explica qué es el modo. Cambiar de modo no hace parpadear la pantalla.
- Ingredientes y utensilios en dos solapas, con foto. Las cantidades se leen sin ambigüedad:
  la fracción en tres caracteres («1/2»), la unidad con su palabra entera («cucharadita»)
  y la equivalencia entre paréntesis («(2,5 ml)»).
- Un botón fijo al pie lleva a la mise en place y dice el tiempo total.

### 6.5 Las recetas del catálogo propio

- Cada receta existe como planilla para imprimir y como ficha que usa la app, y las dos
  dicen lo mismo.
- La receta del catálogo propio es de una porción, con cero desperdicio y sin sal
  agregada. No es una regla del catálogo: son variantes que más adelante se eligen
  (RF-08a).
- El tiempo declarado es el real de punta a punta: el reloj arranca al abrir el freezer e
  incluye descongelar, lavar y cortar.
- Cada ingrediente y cada utensilio es uno concreto, con su marca y su foto.
