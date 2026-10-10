# Feature Specification: Base del sistema

**Feature Branch**: `001-base-del-sistema`

**Created**: 2026-10-10

**Status**: Baseline

**Input**: Especificación completa de lo no funcional

## Objetivo de la app

Cocinadas es una app para aprender a cocinar donde cada receta es un POE (procedimiento
operativo estándar): que el plato salga siempre igual, con la misma calidad, sin importar
quién lo haga. El flujo central es elegir una receta y que la app la lleve paso a paso,
ganando experiencia y logros; todo lo demás se suma alrededor de eso y no lo reemplaza. Se
dirige a quien cocina en su casa, a escuelas de cocina y universidades, y a restaurantes
de hoteles de 4 y 5 estrellas.

| Lanzamiento | Qué habilita | Quién carga POE |
|---|---|---|
| 1 · Cocinar sin cuenta | Elegir una receta y cocinarla paso a paso, sin registrarse | Solo Carlos |
| 2 · Cuentas y POE públicos | Registrarse para subir POE públicos y comentar; cocinar sigue sin cuenta | Cualquier usuario registrado |
| 3 · Espacios privados | Quien no quiere publicar sus POE ni sus videos los guarda en un espacio privado y los comparte solo con quienes elige, pagando una membresía | Quien paga la membresía: instituciones o particulares |
| Más adelante | Red social de cocina, publicidad, compras, apps nativas | |

El modelo de negocio es el de GitHub: si todo lo que hacés es público, es gratis; si
querés que algo sea privado, pagás la membresía. La regla de la cuenta es una sola: nada
que se escriba en el servidor se hace sin cuenta; todo lo que es leer, o guardar en el
propio teléfono, se hace sin ella (constitución, principio V).

Esta carpeta especifica lo que vale para toda la app y no es de ninguna capacidad en
particular: los requerimientos no funcionales RNF-01 a RNF-11 y el nombre y la marca
(RF-60). Lo que vale para todas las pantallas está en el `ux.md` de esta misma carpeta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usar la app completa sin cuenta, con todo guardado en el teléfono (Priority: P1)

Abro la app por primera vez, entro sin registrarme y puedo hacer todo: elegir una receta,
cocinarla con sus cronómetros y alarmas, ver los resultados, el historial, la experiencia
y los logros. Lo que hice queda guardado en mi teléfono y sigue ahí la próxima vez que la
abro. Nada de lo mío sale del teléfono.

**Why this priority**: Lo primero es la difusión: que la use la mayor cantidad de gente
posible, sin ninguna barrera de entrada (constitución, principio V). Sin esto no hay
primer lanzamiento.

**Independent Test**: En un teléfono sin datos previos de la app, entrar sin cuenta,
cocinar una receta hasta el final, cerrar la app, volver a abrirla y comprobar que la
cocinada está en el historial; durante todo el recorrido, registrar el tráfico de red y
comprobar que no se envió ningún dato de la persona.

**Acceptance Scenarios**:

1. **Given** un teléfono que nunca abrió la app, **When** la persona elige entrar sin
   cuenta, **Then** llega a la lista de recetas sin que se le pida nombre, correo,
   contraseña ni ningún otro dato.
2. **Given** una persona sin cuenta, **When** recorre la app, **Then** puede elegir una
   receta, cocinarla con cronómetros y alarmas, ver los resultados, el historial, el
   perfil, la experiencia y los logros, sin que ninguna de esas pantallas le pida
   registrarse.
3. **Given** una persona que terminó una cocinada, **When** cierra la app y la vuelve a
   abrir, **Then** la cocinada sigue en su historial y su experiencia y sus logros la
   cuentan.
4. **Given** una persona que eligió un tema y silenció los sonidos, **When** cierra la app
   y la vuelve a abrir, **Then** la app arranca con ese tema y con los sonidos silenciados.
5. **Given** una persona sin cuenta que usa la app de punta a punta, **When** se registra
   todo el tráfico de red del recorrido, **Then** no hay ningún pedido que envíe datos de
   la persona (cocinadas, tiempos, preferencias ni identificadores), y los únicos pedidos
   son lecturas de archivos del propio sitio.
6. **Given** dos teléfonos distintos que usan la app sin cuenta, **When** en uno se cocina
   una receta, **Then** en el otro no aparece nada de esa cocinada.

---

### User Story 2 - Instalarla desde el navegador y usarla en el celular (Priority: P1)

Entro a la dirección de la app desde el navegador del celular, la agrego a la pantalla de
inicio y desde ese momento se abre como cualquier otra app: con su ícono y su nombre, a
pantalla completa y sin la barra del navegador. No tengo que pasar por una tienda. Cuando
sale una versión nueva, la recibo sin hacer nada.

**Why this priority**: Es la forma en que la app llega al teléfono en el primer
lanzamiento (decisión 1 de Carlos del 2026-10-09).

**Independent Test**: Desde el navegador de un celular, agregar la app a la pantalla de
inicio, abrirla desde el ícono y comprobar nombre, ícono y ausencia de la barra del
navegador; después publicar un cambio visible y comprobar que la app instalada lo muestra
sin reinstalar.

**Acceptance Scenarios**:

1. **Given** la app abierta en el navegador de un celular, **When** la persona usa
   «Agregar a la pantalla de inicio» (o «Instalar») del navegador, **Then** queda el
   ícono de la app con el nombre «Cocinadas» en la pantalla de inicio del teléfono.
2. **Given** la app instalada, **When** la persona la abre desde su ícono, **Then** se
   abre a pantalla completa, sin la barra de direcciones ni los controles del navegador.
3. **Given** la app instalada, **When** la persona la abre, **Then** arranca en la
   pantalla de entrada (o en la cocinada en curso, si había una), nunca en una página de
   error ni en una dirección que no existe.
4. **Given** la app instalada y una versión nueva en línea, **When** la persona abre la
   app con conexión, **Then** recibe la versión nueva sin reinstalar ni tocar ninguna
   configuración. [NEEDS CLARIFICATION: ¿en qué momento tiene que aplicarse una versión
   nueva: en la apertura siguiente, o también con la app abierta? Y si hay una cocinada en
   curso, ¿se espera a que termine?]
5. **Given** la app servida desde una subcarpeta de un dominio, desde la raíz de un
   dominio propio o desde otra dirección cualquiera, **When** la persona la abre y la
   recorre, **Then** todas las pantallas, fotos, íconos y recetas cargan igual, sin
   ningún archivo que no se encuentre.
6. **Given** la app abierta en una computadora de escritorio, **When** la persona la
   mira, **Then** no existe una versión de escritorio para cocinar. [NEEDS CLARIFICATION:
   ¿qué tiene que ver quien abre la app en una computadora, en una tablet o con el celular
   apaisado: la misma pantalla de celular en una columna angosta centrada, un aviso de
   «abrila en el celular», u otra cosa?]

---

### User Story 3 - Leerla de parado, a un brazo de distancia y con las manos ocupadas (Priority: P1)

Tengo el teléfono apoyado en la mesada y las manos sucias. Leo lo que dice la pantalla sin
acercarme y, cuando tengo que tocar algo, le acierto al botón sin apuntar.

**Why this priority**: Es la condición de uso real: se cocina con las manos ocupadas
(constitución, principio III; decisión 5 de Carlos del 2026-10-09).

**Independent Test**: Recorrer todas las pantallas en un celular, en los dos temas, y
medir el tamaño de cada texto y de cada botón contra los mínimos de esta especificación.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la app en un celular con el tamaño de letra del sistema
   por omisión, **When** se mide el tamaño de cada texto informativo, **Then** ninguno
   mide menos de 13,5 px.
2. **Given** cualquier pantalla de la app, **When** se mide cada botón, **Then** ninguno
   mide menos que el mínimo de RNF-02.
3. **Given** un cronómetro que vence o un paso crítico que necesita atención, **When**
   la persona no está mirando la pantalla, **Then** la app avisa con sonido y vibración,
   no solo con un cambio en la pantalla (constitución, principio III; el detalle de las
   alarmas es de RF-14).
---

### User Story 4 - Abrir la app y cocinar sin internet (Priority: P1)

En mi cocina no llega bien la señal. Abro la app igual, elijo una receta, la cocino entera
con sus fotos, cronómetros y alarmas, y la cocinada queda guardada, todo sin conexión.

**Why this priority**: Carlos lo pidió para el primer lanzamiento: la cocina se maneja con
las manos sucias, con la pantalla siempre encendida y sin internet (decisión 5 del
2026-10-09).

**Independent Test**: Abrir la app una vez con conexión, activar el modo avión, cerrar la
app, volver a abrirla y cocinar una receta de punta a punta; comprobar que no hay ningún
texto, foto, tipografía ni sonido ausente, y que la cocinada queda en el historial.

**Acceptance Scenarios**:

1. **Given** un teléfono que abrió la app al menos una vez con conexión, **When** la
   persona la abre sin internet, **Then** la app abre en la pantalla de entrada igual que
   con conexión, sin ningún mensaje de error del navegador.
2. **Given** la app abierta sin internet, **When** la persona entra a la lista de recetas,
   **Then** ve todas las recetas del catálogo con su foto, su tiempo, sus porciones y sus
   calorías.
3. **Given** la app abierta sin internet, **When** la persona abre la ficha de cualquier
   receta del catálogo, en cualquiera de sus modos de preparación, **Then** ve la ficha
   completa, con la foto de cada ingrediente y de cada utensilio.
4. **Given** la app abierta sin internet, **When** la persona cocina una receta de punta a
   punta, **Then** los cronómetros corren, las alarmas suenan y vibran, las fotos de los
   pasos se ven y se amplían, y la cocinada queda guardada en el historial.
5. **Given** la app abierta sin internet, **When** se compara cualquier pantalla con la
   misma pantalla con conexión, **Then** se ven iguales: las mismas tipografías, los
   mismos íconos y las mismas imágenes.
6. **Given** una persona que está cocinando con conexión, **When** la conexión se corta a
   mitad de la cocinada, **Then** la cocinada sigue sin interrupciones ni avisos de error.
7. **Given** un teléfono que nunca abrió la app, **When** la persona intenta abrirla sin
   internet, **Then** no puede usarse hasta la primera apertura con conexión. [NEEDS
   CLARIFICATION: después de la primera apertura con conexión, ¿la app tiene que avisar
   cuándo terminó de bajar todo y ya puede usarse sin internet? ¿Y funcionar sin internet
   vale solo para la app instalada, o también abriéndola desde el navegador?]

---

### User Story 5 - La pantalla no se apaga mientras se cocina (Priority: P1)

Estoy cocinando con las manos sucias y miro la pantalla cada tanto. El teléfono no se
oscurece ni se bloquea solo, aunque pasen minutos sin que lo toque.

**Why this priority**: Con la pantalla apagada no se ve la tarea ni los cronómetros, y una
alarma puede no sonar y arruinar el plato (riesgo R-01; decisión 5 de Carlos del
2026-10-09).

**Independent Test**: Con el apagado automático del teléfono en su valor más corto,
empezar una cocinada, no tocar el teléfono durante más tiempo que ese valor y comprobar
que la pantalla sigue encendida; salir de la cocina y comprobar que el teléfono vuelve a
apagarse como siempre.

**Acceptance Scenarios**:

1. **Given** una cocinada en curso y el apagado automático del teléfono configurado en
   30 segundos, **When** la persona no toca el teléfono durante 10 minutos, **Then** la
   pantalla sigue encendida, con el brillo normal y sin bloquearse.
2. **Given** una cocinada en curso con la pantalla mantenida encendida, **When** la
   persona pasa a otra app y vuelve a Cocinadas, **Then** la pantalla vuelve a quedar
   encendida sin que tenga que tocar nada más.
3. **Given** una cocinada que terminó o que la persona abandonó, **When** la persona
   vuelve a la lista de recetas y no toca el teléfono, **Then** el teléfono apaga la
   pantalla según su configuración.
4. **Given** una cocinada retomada después de que la app se cerró sola o se recargó,
   **When** la persona vuelve a la cocina, **Then** la pantalla queda encendida igual que
   en una cocinada recién empezada.

[NEEDS CLARIFICATION: ¿en qué pantallas tiene que quedar encendida la pantalla: solo en la
de cocina (pasos, pausa entre etapas y alarma), o también en la mise en place y en los
resultados? Y si el teléfono o el navegador no permiten mantenerla encendida, ¿la app
tiene que avisarlo?]

---

### User Story 6 - Tema claro y oscuro (Priority: P2)

Según la luz de mi cocina elijo ver la app clara u oscura, con un botón que tengo siempre
a mano. La app recuerda lo que elegí.

**Why this priority**: Es parte de la legibilidad en la cocina (constitución, principio
III), pero la app se puede usar con un solo tema.

**Independent Test**: Cambiar de tema con el botón flotante en cada pantalla, capturar
todas las pantallas en los dos temas y comprobar que todo se lee; cerrar y abrir la app y
comprobar que conserva el tema.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla menos la de entrada, **When** la persona toca el botón de
   tema, **Then** toda la app pasa al otro tema en el momento, sin recargar y sin perder
   lo que estaba haciendo (ni la receta elegida, ni lo tildado, ni la cocinada en curso).
2. **Given** una persona que eligió el tema oscuro, **When** cierra la app y la vuelve a
   abrir, **Then** la app arranca en oscuro desde la primera pantalla que tiene tema.
3. **Given** cada pantalla de la app, **When** se la mira en claro y en oscuro, **Then**
   en los dos temas se leen todos los textos y se distinguen todos los botones, los
   estados (cumplido, en curso, pasado de tiempo, crítico) y las fotos.
4. **Given** un teléfono que nunca abrió la app, **When** la persona entra, **Then** la
   app arranca con el tema inicial. [NEEDS CLARIFICATION: cuando la persona nunca eligió
   un tema, ¿la app arranca siempre en claro o toma el tema que tiene configurado el
   teléfono?]

---

### User Story 7 - Moverse por la app con la barra inferior y el botón de atrás del teléfono (Priority: P2)

Uso el botón (o el gesto) de atrás del teléfono como en cualquier app: me lleva a la
pantalla anterior. Recién en la pantalla de entrada me saca de la app.

**Why this priority**: Sin esto, un toque en «atrás» cierra la app en medio de un
recorrido y la persona pierde dónde estaba.

**Independent Test**: Avanzar entrada → lista → ficha → mise en place y tocar «atrás»
del teléfono una vez por pantalla, comprobando que retrocede de a una y que en la entrada
sale de la app.

**Acceptance Scenarios**:

1. **Given** una persona que fue de la lista de recetas a una ficha, **When** toca el
   botón de atrás del teléfono, **Then** vuelve a la lista de recetas y la app sigue
   abierta.
2. **Given** una persona en cualquier pantalla que no es la de entrada, **When** toca el
   botón de atrás del teléfono, **Then** vuelve exactamente una pantalla.
3. **Given** una persona en la pantalla de entrada, **When** toca el botón de atrás del
   teléfono, **Then** sale de la app.
4. **Given** una persona que volvió con un botón «volver» de la propia pantalla, **When**
   después toca el botón de atrás del teléfono, **Then** retrocede una sola pantalla más:
   la vuelta anterior no se cuenta dos veces.
5. **Given** una persona en Recetas, Historial o Perfil, **When** mira el pie de la
   pantalla, **Then** ve una barra con esas tres secciones, y al tocar otra pasa a esa
   sección.
6. **Given** una persona que pasa de una pantalla larga, desplazada hasta abajo, a otra
   pantalla, **When** la nueva pantalla aparece, **Then** se ve desde arriba.

---

### User Story 8 - Animaciones que acompañan, y que se apagan con «reducir movimiento» (Priority: P2)

Los cambios de pantalla y lo que aparece o desaparece se mueven con suavidad, así entiendo
qué cambió. Si tengo activado «reducir movimiento» en el teléfono, la app no anima nada y
sigo viendo todo.

**Why this priority**: Es diseño aprobado por Carlos (sección «En toda la app»), y hay
personas a las que el movimiento les hace mal.

**Independent Test**: Recorrer la app con «reducir movimiento» desactivado y comprobar
las animaciones; activarlo, repetir el recorrido y comprobar que no hay movimiento y que
cada contenido sigue estando.

**Acceptance Scenarios**:

1. **Given** «reducir movimiento» desactivado en el teléfono, **When** la persona cambia
   de pantalla, **Then** el cambio va animado.
2. **Given** «reducir movimiento» desactivado, **When** algo aparece o desaparece dentro
   de una pantalla (la tarjeta de un paso, una explicación, una foto ampliada), **Then**
   lo hace con una animación.
3. **Given** «reducir movimiento» activado en el teléfono, **When** la persona recorre la
   app entera, incluida una cocinada con un paso pasado de tiempo, una alarma y los
   resultados, **Then** no hay ninguna animación: nada se desliza, late, titila ni salta.
4. **Given** «reducir movimiento» activado, **When** se compara cada pantalla con la misma
   pantalla sin esa opción, **Then** están los mismos textos, botones, fotos y estados:
   nada deja de verse por no animarse. [NEEDS CLARIFICATION: con «reducir movimiento»
   activado, ¿los papelitos del festejo de los resultados pueden no mostrarse, o tienen
   que verse quietos? La regla aprobada dice que «nada deja de verse».]
5. **Given** cualquier animación de la app, **When** termina, **Then** lo que queda fijo
   en la pantalla (lo que flota sobre el contenido o lo cubre entero) sigue ocupando el
   lugar que le corresponde respecto de la ventana.

---

### User Story 9 - Ver en grande cualquier foto (Priority: P2)

No estoy seguro de qué ingrediente o qué utensilio es. Toco la foto, la veo grande con su
nombre, y la cierro tocando en cualquier lado.

**Why this priority**: Es diseño aprobado por Carlos para toda la app; ayuda a no
equivocarse de ingrediente, pero no bloquea cocinar.

**Independent Test**: En la ficha, en la mise en place y en la cocina, tocar una foto,
comprobar que se amplía y cerrarla tocando fuera de la foto y sobre la foto.

**Acceptance Scenarios**:

1. **Given** cualquier foto de un ingrediente, de un utensilio o de un paso, en cualquier
   pantalla, **When** la persona la toca, **Then** la foto se amplía sobre la pantalla.
2. **Given** una foto ampliada, **When** la persona toca en cualquier lugar de la
   pantalla, sobre la foto o fuera de ella, **Then** la foto se cierra y la pantalla queda
   como estaba.
3. **Given** una foto ampliada en un teléfono sin conexión, **When** se la mira, **Then**
   se ve igual que con conexión (RNF-03).

---

### User Story 10 - Todo en castellano de Argentina (Priority: P2)

Leo toda la app en mi idioma y como se habla acá: me trata de vos y los números y las
fechas están escritos como los escribo yo.

**Why this priority**: Es el público del primer lanzamiento (RNF-08; constitución,
principio X).

**Independent Test**: Recorrer todas las pantallas y leer cada texto, número y fecha
contra las reglas de RNF-08.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la app, **When** se lee cada texto, **Then** está en
   castellano, sin palabras sueltas en otro idioma salvo nombres propios y términos de
   cocina de uso corriente («mise en place»).
2. **Given** cualquier texto que le habla a la persona, **When** se lo lee, **Then** usa
   el voseo («tocá», «entrá», «marcá»), nunca el tuteo ni el «usted».
3. **Given** un número con decimales en cualquier pantalla, **When** se lo lee, **Then**
   usa coma decimal («2,5 ml»), y un número de cuatro cifras o más usa punto de miles
   («1.500»).
4. **Given** una fecha en cualquier pantalla, **When** se la lee, **Then** está escrita
   como en Argentina: primero el día, después el mes y después el año.
5. **Given** un lector de pantalla o un traductor automático, **When** abre la app,
   **Then** la app se declara en castellano de Argentina.

---

### User Story 11 - La app se llama Cocinadas (Priority: P3)

En todos lados donde aparece la app la reconozco por el mismo nombre y el mismo logotipo:
Cocinadas, con la olla.

**Why this priority**: El nombre está decidido (decisión 28 de Carlos del 2026-10-09);
registrar la marca y los dominios es de un lanzamiento posterior al primero.

**Independent Test**: Buscar el nombre de la app en la pantalla de entrada, en el título
de la pestaña del navegador, en el ícono instalado y en la documentación, y comprobar que
en todos dice «Cocinadas» y en ninguno uno de los nombres descartados.

**Acceptance Scenarios**:

1. **Given** la pantalla de entrada, **When** la persona la mira, **Then** ve el
   logotipo: la olla y la palabra «Cocinadas».
2. **Given** la app abierta en el navegador o instalada, **When** se mira el título de la
   pestaña y el nombre debajo del ícono, **Then** los dos dicen «Cocinadas».
3. **Given** todos los textos de la app y su documentación, **When** se busca cualquiera
   de los nombres descartados (Illioth, Ilioth, Illioth Chef Training, MiseChef,
   CronoChef, Templa), **Then** ninguno aparece como nombre de la app.
4. **Given** el registro de marcas de Argentina, **When** se consulta por «Cocinadas»,
   **Then** la marca figura solicitada o registrada a nombre de Carlos. [NEEDS
   CLARIFICATION: ¿la marca se pide como recomienda el análisis del 2026-10-09 (marca
   mixta con la olla, en las clases 9, 41 y 42), y solo en Argentina o también en otros
   países?]
5. **Given** los registros de dominios, **When** se consultan los dominios de la app,
   **Then** figuran a nombre de Carlos. [NEEDS CLARIFICATION: ¿qué dominios hay que
   reservar (de los libres al 2026-10-09: `.com`, `.app`, `.net`, `.org`, `.io`, `.co`,
   `.es`, `.mx`, y a confirmar `.com.ar` y `.ar`), y la app pasa a abrirse en alguno de
   ellos o sigue en la dirección gratuita?]

---

### User Story 12 - Las alarmas suenan con el celular bloqueado (Priority: P3)

Se me bloqueó el teléfono mientras cocinaba, o lo bloqueé yo. Cuando vence un cronómetro,
la alarma suena igual.

**Why this priority**: Es de un lanzamiento posterior al primero; para el primero, Carlos
asumió que el celular está desbloqueado mientras se cocina (decisión 6 del 2026-10-09).

**Independent Test**: Empezar una cocinada con un proceso que vence en un minuto, bloquear
el teléfono y comprobar que al vencer suena y vibra.

**Acceptance Scenarios**:

1. **Given** una cocinada en curso con un cronómetro corriendo y los sonidos sin
   silenciar, **When** el teléfono está bloqueado y el cronómetro vence, **Then** la
   alarma suena y el teléfono vibra en el momento en que vence, con una demora menor a la
   de RNF-10.
2. **Given** una alarma que sonó con el teléfono bloqueado, **When** la persona lo
   desbloquea, **Then** la app muestra la alarma para atenderla.

[NEEDS CLARIFICATION: con el celular bloqueado, ¿qué tiene que pasar exactamente (sonido,
vibración, una notificación en la pantalla de bloqueo), con cuánta demora como máximo, y
esto se exige a la app web o se cumple recién con las apps nativas (RNF-11)?]

---

### User Story 13 - Apps nativas para Android y iPhone (Priority: P3)

Busco Cocinadas en la tienda de mi teléfono, la instalo como cualquier app y la uso igual
que la versión web.

**Why this priority**: Vienen después del primer lanzamiento, si la app tiene éxito
(decisión 1 de Carlos del 2026-10-09).

**Independent Test**: Instalar la app desde Google Play en un Android y desde la App Store
en un iPhone, y cocinar una receta de punta a punta en cada una.

**Acceptance Scenarios**:

1. **Given** un teléfono Android, **When** la persona busca «Cocinadas» en Google Play,
   **Then** la encuentra, la instala y cocina una receta de punta a punta.
2. **Given** un iPhone, **When** la persona busca «Cocinadas» en la App Store, **Then** la
   encuentra, la instala y cocina una receta de punta a punta.

[NEEDS CLARIFICATION: ¿las apps nativas tienen que hacer todo lo que hace la app web, y
conservar lo que la persona ya tenía guardado en su teléfono con la app web (historial,
experiencia y logros)? ¿La app web sigue existiendo cuando estén las nativas?]

---

### Edge Cases

- **El teléfono no deja guardar** (navegación privada, almacenamiento bloqueado o lleno):
  la app abre y se puede cocinar igual; lo que no se puede guardar se le dice a la
  persona como un error, y no se muestra como si no hubiera nada guardado. Un fallo al
  leer no es lo mismo que «no cocinaste nunca».
- **Lo guardado en el teléfono está dañado o no tiene la forma esperada**: la app abre
  igual. Las cocinadas que no se pueden leer se descartan una por una y las demás se
  conservan; una cocinada en curso que no se puede leer se descarta.
- **Una pantalla falla al dibujarse**: la app no queda en blanco. Muestra un mensaje de
  que algo salió mal, descarta la cocinada en curso (que es lo único guardado que puede
  haberla roto), no toca las cocinadas guardadas y ofrece volver a empezar.
- **El catálogo no se puede leer**: la app lo muestra como un error con su motivo; nunca
  como «no hay recetas».
- **La persona borra los datos del navegador, desinstala la app o cambia de teléfono**:
  pierde su historial, su experiencia, sus logros y sus preferencias. Es un riesgo
  aceptado (R-07) mientras no existan las cuentas (RF-34).
- **El teléfono está en silencio, o el navegador no permite sonar o vibrar**: la app
  sigue mostrando en pantalla todo lo que avisa. La alarma y el silencio son de RF-14 y
  RF-18.
- **Texto del sistema agrandado**: [NEEDS CLARIFICATION: si la persona tiene la letra del
  teléfono agrandada desde la configuración de accesibilidad, ¿la app tiene que agrandar
  sus textos en la misma proporción?]
- **Navegadores y teléfonos soportados**: [NEEDS CLARIFICATION: ¿en qué navegadores y
  desde qué versiones tiene que funcionar la app completa (Chrome en Android, Safari en
  iPhone, otros), y hasta qué tamaño de pantalla mínimo?]

## Requirements *(mandatory)*

### Functional Requirements

Los requerimientos conservan los identificadores del proyecto. Los incisos (a, b, c…)
son las condiciones comprobables de cada uno.

#### Plataforma e instalación

- **RNF-01**: La app es solo para celular: una app web que se instala desde el navegador.
  No hay versión de escritorio para cocinar; la única vista de escritorio prevista es la
  del seguimiento de docentes y supervisores (RF-45), que vive en una dirección aparte y
  no cambia nada del diseño de celular. (Constitución, principio III; decisiones 1, 25 y
  29 de Carlos del 2026-10-09.)
  - (a) Todas las pantallas están diseñadas para la pantalla de un celular.
  - (b) La app se instala desde el navegador del celular con la función de agregar a la
    pantalla de inicio, sin pasar por una tienda de aplicaciones.
  - (c) Instalada, tiene el nombre «Cocinadas» y su ícono, y se abre a pantalla
    completa, sin la barra del navegador.
  - (d) La app instalada se actualiza sola: la persona recibe cada versión nueva sin
    reinstalar.
  - (e) La app funciona igual servida desde cualquier dirección: una subcarpeta, la raíz
    de un dominio propio u otra. Ningún recurso depende de la dirección en la que está
    alojada (ADR-017).
  - (f) La app entera vive en una sola dirección: recorrerla no cambia la dirección que
    muestra el navegador, y abrir esa dirección siempre lleva a la pantalla de entrada o
    a la cocinada en curso.
- **RNF-11**: Existen apps nativas para Android y para iPhone, que se instalan desde
  Google Play y desde la App Store. Son de un lanzamiento posterior al primero y se
  encaran solo si la app web tiene éxito (decisión 1 de Carlos del 2026-10-09). Su
  alcance respecto de la app web está en la pregunta de la historia 13.

#### Legibilidad y uso con las manos ocupadas

- **RNF-02**: La app se lee de parado, a un brazo de distancia y con las manos ocupadas.
  (Constitución, principio III.)
  - (a) Ningún texto informativo mide menos de 13,5 px, con el tamaño de letra del
    sistema por omisión. Es texto informativo todo el que la persona tiene que leer para
    entender o decidir algo: títulos, cuerpos, etiquetas, cantidades, tiempos, ayudas y
    textos de botones. [NEEDS CLARIFICATION: ¿quedan exceptuados del mínimo de 13,5 px
    los signos que van dentro de un ícono o de un círculo (el tilde de un sub-paso
    cumplido, la marca de estado de un proceso), o tampoco esos pueden ser más chicos?]
  - (b) Los botones son grandes. [NEEDS CLARIFICATION: ¿cuál es el tamaño mínimo de un
    botón o de cualquier zona que se toca, en píxeles de alto y de ancho, y cuál la
    separación mínima entre dos botones vecinos? «Botones grandes» no tiene número en
    ninguna fuente.]
  - (c) Lo que avisa (un cronómetro que vence, un paso crítico) avisa con sonido y
    vibración, no solo en pantalla.
- **RNF-04**: La pantalla del teléfono no se apaga, no se atenúa y no se bloquea sola
  mientras se cocina, aunque la persona no la toque.
  - (a) Vale desde que empieza la cocinada hasta que termina o se abandona, incluidas las
    pausas entre etapas y las alarmas.
  - (b) Si la persona sale de la app y vuelve con la cocinada en curso, o la cocinada se
    retoma después de un cierre, la pantalla vuelve a quedar encendida sin ninguna acción
    extra.
  - (c) Fuera de la cocina, la app no impide que el teléfono apague la pantalla.
- **RNF-06**: La app tiene dos temas, claro y oscuro.
  - (a) Se cambia con el botón de tema, disponible en todas las pantallas menos la de
    entrada; el cambio es inmediato y no pierde nada de lo que la persona estaba
    haciendo.
  - (b) El tema elegido se recuerda en el teléfono entre una apertura y la siguiente.
  - (c) Todas las pantallas y todos sus estados están diseñados en los dos temas; ningún
    texto, botón, foto ni indicador de estado deja de distinguirse en alguno de los dos.
  - (d) Lo visual de cada pantalla se verifica con capturas en un celular, en los dos
    temas (constitución, principio VI).
- **RNF-10**: Las alarmas suenan con el celular bloqueado. Es de un lanzamiento posterior
  al primero; para el primero se asume que el celular está desbloqueado mientras se
  cocina (decisión 6 de Carlos del 2026-10-09). El comportamiento exacto y la demora
  máxima están en la pregunta de la historia 12.

#### Datos, cuenta y conexión

- **RNF-05**: La app se usa sin cuenta y guarda todo en el teléfono. (Constitución,
  principio V; decisiones 8 y 27 de Carlos del 2026-10-09.)
  - (a) Sin cuenta se usa la app completa: todo lo que es leer y todo lo que se guarda
    únicamente en el teléfono. Elegir recetas, cocinarlas con sus cronómetros y alarmas,
    ver la experiencia y los logros, y guardar el puntaje.
  - (b) En el teléfono se guardan las cocinadas terminadas, la cocinada en curso, el tema
    elegido y si los sonidos están silenciados. La experiencia y los logros se calculan a
    partir de las cocinadas guardadas.
  - (c) Sin cuenta, nada de lo guardado sale del teléfono: no se envía a ningún servidor
    ni se comparte con otro dispositivo.
  - (d) La app no recoge datos personales ni usa analítica de terceros.
  - (e) Lo que la app lee de lo guardado se comprueba antes de usarse: lo que no tiene la
    forma esperada se descarta sin impedir que la app abra.
  - (f) Un fallo al leer o al guardar se le muestra a la persona como un error; no se
    confunde con que no haya datos.
  - (g) Lo único que exige cuenta es lo que se escribe en el servidor (publicar,
    comentar, dar me gusta) y lo privado; eso es de RF-30 a RF-35 y de RF-40 a RF-45.
- **RNF-03**: La app abre y funciona sin internet.
  - (a) Después de una primera apertura con conexión, la app abre sin conexión.
  - (b) Sin conexión funciona la app completa: la lista de recetas, la ficha de cada
    receta en todos sus modos de preparación, la mise en place, la cocina con sus
    cronómetros y alarmas, los resultados, el historial y el perfil.
  - (c) Sin conexión está todo el catálogo: todas las recetas con todas sus fotos (del
    plato, de cada ingrediente, de cada utensilio y de cada paso), no solo las que la
    persona ya abrió (ADR-017: el sitio se baja entero al teléfono con el catálogo
    adentro).
  - (d) Sin conexión la app se ve igual que con conexión: tipografías, íconos e imágenes
    no dependen de ningún servidor externo en el momento de usarla.
  - (e) Perder la conexión en medio de una cocinada no la interrumpe ni muestra errores.
  - (f) Cuando vuelve la conexión, la app recibe las versiones nuevas (RNF-01, inciso d).

#### Idioma y lugar

- **RNF-08**: La app está en castellano y pensada para Argentina. (Constitución,
  principio X.)
  - (a) Todos los textos de la app están en castellano rioplatense, con voseo.
  - (b) Los números se escriben con coma decimal y punto de miles («2,5 ml», «1.500»), y
    las fechas, como en Argentina, con el día antes que el mes.
  - (c) Las cantidades de las recetas dan la medida casera con su equivalencia en el
    sistema métrico entre paréntesis («1/2 cucharadita (2,5 ml)»).
  - (d) La app se declara en castellano de Argentina ante el navegador y el sistema.
  - (e) El código, los comentarios, los mensajes de los cambios y la documentación del
    proyecto también van en castellano con voseo.
  - [NEEDS CLARIFICATION: además del idioma y de los formatos, ¿qué exige «Argentina»:
    que los ingredientes, las marcas y los utensilios de las recetas sean los que se
    consiguen en Argentina, que la hora sea la de Argentina? ¿Y está previsto algún otro
    idioma o país más adelante?]

#### Marca

- **RF-60**: El nombre de la app es Cocinadas. (Decisión 28 de Carlos del 2026-10-09.)
  - (a) La app se llama «Cocinadas» en todos los lugares donde se nombra: la pantalla de
    entrada, el título en el navegador, el nombre instalado y la documentación.
  - (b) El logotipo es la olla con la palabra «Cocinadas».
  - (c) El nombre se registra como marca. El análisis del 2026-10-09 recomienda pedirla
    como marca mixta, con la olla, en las clases 9 (la app), 42 (el servicio en línea) y
    41 (formación); la consulta por denominación en el INPI argentino y la presentación
    las hace Carlos.
  - (d) Se reservan los dominios del nombre; lo hace Carlos.
  - (e) Los incisos (c) y (d) son de un lanzamiento posterior al primero.
  - (f) Nombres descartados, que no se vuelven a analizar: Illioth e Illioth Chef
    Training (sus dominios `.com` y `.app` están registrados por otro desde junio de
    2025), Ilioth Chef Training, MiseChef (existe una app con ese nombre y la misma
    idea), CronoChef (Chef Chrono en Francia y Cronochef Bernabeu S.L. en Madrid) y
    Templa (campo de marcas saturado y dominios tomados).

#### Operación y calidad

- **RNF-07**: El costo de operación del primer lanzamiento es cero. (Constitución,
  principio IX; ADR-017.)
  - (a) Servir la app, guardar los datos de cada persona y publicar una versión nueva no
    usan ningún servicio pago, ni por uso ni por suscripción.
  - (b) No hay ningún servidor, base de datos ni cuenta de nube que mantener.
  - (c) No se agrega infraestructura, configuración ni abstracción para una necesidad que
    no existe.
  - [NEEDS CLARIFICATION: ¿«costo cero» alcanza solo a operar la app (alojamiento y
    servicios), o también excluye del primer lanzamiento comprar un dominio y pagar el
    registro de la marca (RF-60)?]
- **RNF-09**: Cobertura de pruebas del 100 % y ningún aviso del compilador. (Constitución,
  principio VII.)
  - (a) Las pruebas unitarias cubren el 100 % de instrucciones, ramas, funciones y líneas
    del código de la aplicación y de sus herramientas de construcción. Si alguna de las
    cuatro medidas baja del 100 %, no se puede publicar.
  - (b) De esa medición solo se excluye lo que no decide nada: el punto de arranque de la
    app y las llamadas directas al sistema (escribir archivos, manejar un navegador).
    Toda decisión que estuviera ahí se separa a una parte que sí se mide.
  - (c) El compilador y el analizador estático terminan sin ningún error y sin ningún
    aviso, con las reglas de tipos estrictas. Una regla del analizador solo se apaga con
    su motivo escrito.
  - (d) Una prueba de punta a punta recorre el camino feliz completo, de la entrada a la
    primera cocinada guardada, en un navegador que emula un celular y contra el mismo
    sitio que se publica (ADR-018).
  - (e) Las tres compuertas (analizador, pruebas con cobertura y prueba de punta a punta)
    pasan antes de cada publicación; ninguna se baja.

### Key Entities *(include if feature involves data)*

- **Preferencias**: lo que la persona eligió y la app recuerda en el teléfono: el tema
  (claro u oscuro) y si los sonidos están silenciados.
- **Cocinada guardada**: el registro de una receta cocinada hasta el final, con sus
  tiempos previstos y reales. Vive en el teléfono; de ellas se calculan la experiencia y
  los logros (su detalle es de las capacidades de cocina y de progreso).
- **Cocinada en curso**: el estado de una cocinada sin terminar, que permite retomarla si
  la app se cierra (su detalle es de RF-17).
- **Catálogo**: las recetas, los ingredientes y los utensilios con sus fotos. Es
  contenido de solo lectura que viaja completo con la app (constitución, principio VIII).
- **Marca**: el nombre «Cocinadas», el logotipo (la olla y la palabra), el ícono y los
  dominios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona que nunca usó la app llega de abrirla por primera vez a la
  lista de recetas con un solo toque y sin ingresar ningún dato.
- **SC-002**: En el recorrido completo de la app sin cuenta, la cantidad de pedidos de red
  que envían datos de la persona es cero, y la cantidad de pedidos a servidores que no
  son el del propio sitio es cero.
- **SC-003**: Con el teléfono en modo avión, después de una apertura con conexión, se
  cocina de punta a punta el 100 % de las recetas del catálogo, sin ningún texto, foto ni
  tipografía ausente.
- **SC-004**: Durante una cocinada de 60 minutos sin tocar el teléfono, la pantalla se
  apaga cero veces.
- **SC-005**: En el 100 % de las pantallas, en los dos temas, ningún texto informativo
  mide menos de 13,5 px.
- **SC-006**: El 100 % de las pantallas y de sus estados tiene captura en un celular en
  tema claro y en tema oscuro, sin texto ilegible ni elemento que no se distinga.
- **SC-007**: Con «reducir movimiento» activado, la cantidad de animaciones en un
  recorrido completo es cero y no desaparece ningún contenido informativo.
- **SC-008**: La cobertura de las pruebas unitarias es del 100 % en instrucciones, ramas,
  funciones y líneas, y el compilador y el analizador dan cero avisos.
- **SC-009**: El gasto mensual de operar el primer lanzamiento es de 0 pesos.
- **SC-010**: El 100 % de los textos de la app está en castellano con voseo.
- **SC-011**: Cada escenario de aceptación de esta especificación tiene al menos una
  prueba que lo comprueba.

## Assumptions

- Una app web alcanza para validar la idea antes de encarar apps nativas.
- Mientras se cocina, en el primer lanzamiento, el celular está desbloqueado.
- La primera vez que se abre la app hay conexión a internet.
- Quien usa la app tiene un celular con un navegador actual; los navegadores y versiones
  exactos están en la pregunta de «Edge Cases».
- Perder el historial al cambiar de teléfono o al borrar los datos del navegador es un
  riesgo aceptado (R-07) hasta que existan las cuentas (RF-34).
- El catálogo del primer lanzamiento es lo bastante chico para bajarse entero con la app
  en una conexión de celular (ADR-015 y ADR-017 fijan cuándo revisar esto: por el peso
  total de lo que se baja, no por la cantidad de recetas).
- Las reglas de las alarmas, del silencio y de retomar una cocinada están en la
  especificación de la capacidad de cocina; acá solo se fija lo que vale para toda la
  app.

## Clarifications

Decisiones de Carlos sobre lo general, con su fecha.

### Session 2026-09-06

- Q: ¿El historial de cocinadas va a salir alguna vez del celular? → A: Algún día, pero
  no ahora. Por eso la app no tiene servidor y todo se guarda en el teléfono (ADR-015).
- Q: ¿Se sigue dependiendo de una máquina propia para servir la app? → A: No. La app es
  un sitio estático en un alojamiento gratuito, sin servidor propio (ADR-017).

### Session 2026-09-09

- Q: ¿Cómo llegan los cambios a la app? → A: Todo va directo a la rama principal, sin
  ramas ni revisiones intermedias, y cada subida publica.

### Session 2026-09-15

- Q: ¿A quién se dirige la app? → A: A quien cocina en su casa, a escuelas de cocina y
  universidades, y a restaurantes de hoteles de 4 y 5 estrellas.
- Q: ¿Cuál es el flujo central? → A: Elegir una receta y que la app la lleve paso a paso,
  ganando experiencia y logros. Todo lo demás se suma alrededor y no lo reemplaza.
- Q: ¿La app pasa a llamarse Ilioth Chef Training? → A: Se aplicó ese nombre y el mismo
  día se volvió a Cocinadas.

### Session 2026-09 (sesiones de septiembre, sin día registrado)

- Q: ¿Hay un prototipo aparte que mande sobre el diseño? → A: No. El diseño que Carlos
  aprobó al verlo es la referencia; cambiar una pantalla aprobada es cambiar un
  requerimiento y se le pregunta antes.

### Session 2026-10-09

- Q: ¿App web o apps nativas? → A: En el primer lanzamiento alcanza con una app web, solo
  para celular. Las apps nativas vienen después, si la app tiene éxito (decisión 1).
- Q: ¿Cómo se usa mientras se cocina? → A: Con las manos sucias: botones grandes,
  pantalla siempre encendida y sin internet. La voz queda para una versión más avanzada
  (decisión 5).
- Q: ¿Las alarmas tienen que sonar con el celular bloqueado? → A: En principio el celular
  está desbloqueado; que suenen bloqueado es de más adelante (decisión 6).
- Q: ¿Hay que registrarse? → A: No para cocinar. Para cocinar un POE público nunca se
  pide cuenta; para uno privado, sí (decisiones 8 y 19).
- Q: ¿Cuál es el modelo de negocio? → A: Lo público es gratis, sin límites, anónimo y con
  la cuenta opcional. Lo privado es pago, con una membresía vinculada a la cuenta
  (decisión 19).
- Q: ¿Hay vista de escritorio? → A: Por el momento, solo celular, también para el
  docente, el supervisor y quien carga un POE (decisión 25). El seguimiento de docentes y
  supervisores tiene una vista de escritorio en una dirección aparte; es secundaria y no
  puede afectar el diseño de celular (decisión 29, que completa la 25).
- Q: ¿Qué se puede hacer sin cuenta? → A: Nada que se escriba en el servidor se hace sin
  cuenta. Sin cuenta se puede leer todo y guardar en el propio teléfono, sin compartirlo
  con otro dispositivo (decisión 27).
- Q: ¿Cómo se llama la app? → A: Cocinadas. Illioth queda descartado porque su dominio
  está registrado por otro. Registrar la marca y reservar los dominios lo hace Carlos
  (decisión 28, que reemplaza las decisiones 12 y 23).
- Q: ¿Qué prioridad tiene el proyecto? → A: Es el de menor prioridad del portafolio, pero
  terminado sirve como caso de éxito de la consultoría (decisión 9).

### Session 2026-10-10

- Q: ¿Qué manda, la especificación o el código? → A: La especificación. Tiene que alcanzar
  para rehacer la app sin haber visto el código, y no lleva el avance del trabajo
  (constitución, principio I).
