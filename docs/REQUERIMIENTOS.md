# Requerimientos

Qué tiene que hacer la app y con qué calidad, por lanzamiento. Fuente: `docs/PRODUCTO.md`,
los issues del repositorio, el relato de Carlos del 2026-10-09 y lo que Carlos fue pidiendo
en las sesiones de trabajo de septiembre de 2026. La descripción de negocio está en
[PRODUCTO.md](PRODUCTO.md); acá va lo mismo como lista verificable, con su estado.

**Es la fuente de verdad de qué se espera de la app, hoy y más adelante.** Quien vaya a
agregar o cambiar algo lee antes tres cosas: la sección 3, para saber de qué lanzamiento es;
la sección 6, que es lo que ya funciona y no se puede romper; y la sección 7, que es lo que
todavía no está decidido y no se resuelve por cuenta propia.

- **Hecho:** está publicado.
- **Pendiente:** tiene tarea y no está hecho.
- **Fuera de esta etapa:** es de un lanzamiento posterior al primero.

## 1. Objetivo

Una app para aprender a cocinar donde cada receta es un POE (procedimiento operativo
estándar): que el plato salga siempre igual, con la misma calidad, sin importar quién lo
haga.

## 2. Lanzamientos

| Lanzamiento | Qué habilita | Quién carga POE |
|---|---|---|
| 1 · Cocinar sin cuenta | Elegir una receta y cocinarla paso a paso, sin registrarse | Solo Carlos |
| 2 · Cuentas y POE públicos | Registrarse para subir POE públicos y comentar; cocinar sigue sin cuenta | Cualquier usuario registrado |
| 3 · Espacios privados | Quien no quiere publicar sus POE ni sus videos los guarda en un espacio privado y los comparte solo con quienes elige, pagando una membresía | Quien paga la membresía: instituciones o particulares |
| Más adelante | Red social de cocina, publicidad, compras, apps nativas | |

El modelo de negocio es el de GitHub y tiene dos partes.

**Lo público es gratis, sin límites y anónimo.** Lo primero es la difusión: que la use la
mayor cantidad de gente posible, para que el boca a boca la haga popular. Por eso todo lo
público es 100 % gratuito, sin ninguna limitación y sin obligación de registrarse. La cuenta
es opcional.

**Lo privado es pago y exige cuenta.** Hay POE que valen mucho: un restaurante no quiere
compartir sus recetas, y un instituto no quiere publicar su metodología, que puede incluir
videos con derechos de autor. Para ellos, y para cualquier particular que quiera lo mismo,
hay un espacio privado: sus POE y sus videos los ve solo quien el dueño elige. Ahí la cuenta
es obligatoria, porque hay que saber de quién es lo que no se divulga, y la app da un marco
de seguridad: cifrado y la garantía de que esos datos no se comparten. Ese espacio se vende
como una membresía vinculada a la cuenta, y es la primera fuente de ingresos.

En una línea: si todo lo que hacés es público, es gratis y sin cuenta; si querés que algo
sea privado, pagás la membresía.

## 3. Requerimientos funcionales

### 3.1 Catálogo y ficha de la receta

| ID | Requerimiento | Estado |
|---|---|---|
| RF-01 | Lista de recetas con foto, tiempo total, porciones y calorías | Hecho |
| RF-02 | Ficha de la receta: plato, calorías y proteína, ingredientes y utensilios con foto | Hecho |
| RF-03 | Modo de preparación fácil (una cosa por vez) o difícil (todo en paralelo) | Hecho |
| RF-04 | Recetas de lanzamiento: fideos con brócoli, filet de merluza al papillot, pizza al molde y bife de chorizo con arroz | Hecho en parte: 1 de 4 (#92, #93, #94) |
| RF-05 | Formato de receta que declara, por tarea, si se cronometra, si pasarse arruina el plato, si tiene un mínimo y con qué corre en paralelo | Pendiente (#70) |
| RF-06 | La app muestra toda la información del POE de papel, adaptada a la pantalla del celular. Lo que falta está en RF-06a, RF-06c, RF-06d y RF-06e. El costo (RF-06b) no es del primer lanzamiento | Pendiente (#99) |
| RF-06a | Mecanismo para cargar un POE sin editar archivos a mano. En el primer lanzamiento lo usa solo Carlos | Pendiente (#103) |
| RF-06b | Costo del plato en la ficha. Se muestra recién cuando exista la integración con supermercados (RF-54) | Pendiente (#78), fuera de esta etapa |
| RF-06c | Valores nutricionales completos | Pendiente (#104) |
| RF-06d | Si la receta tiene TACC o no | Pendiente (#105) |
| RF-06e | Octógonos de advertencia: exceso de azúcares, de grasas, de sodio y los demás | Pendiente (#106) |
| RF-07 | Recetas de una porción. Es como están escritas hoy, no una regla: la cantidad de porciones pasa a ser una variante (RF-08a) | Hecho |
| RF-08 | La receta se adapta a la cantidad de comensales | Pendiente (#109), fuera de esta etapa |
| RF-08a | Variantes de la receta, que se eligen desde su ficha y se combinan entre sí: sin sal, cero desperdicio y cantidad de porciones. Por ejemplo, sin sal y cero desperdicio para dos personas | Pendiente (#109), fuera de esta etapa |
| RF-09 | Filtros: con o sin sal, apto celíacos | Pendiente (#83, #84), fuera de esta etapa |
| RF-10 | Imprimir la receta | Pendiente (#79), fuera de esta etapa |

### 3.2 Cocinar

| ID | Requerimiento | Estado |
|---|---|---|
| RF-11 | Mise en place: lista de ingredientes y utensilios con foto para tildar; no se empieza sin todo | Hecho |
| RF-12 | Paso a paso: la tarea de ahora, sus sub-pasos, el porqué y el cronómetro contra el tiempo previsto | Hecho |
| RF-13 | Varios cronómetros a la vez: lo que corre solo, con su cuenta regresiva. Funciona, pero las barras se rediseñan | Hecho en parte (#107) |
| RF-14 | Alarmas con sonido y vibración. Funciona para los procesos críticos, pero la lógica de qué cronómetro lleva alarma se rediseña | Hecho en parte (#107) |
| RF-15 | Línea de tiempo de la etapa con un carril por proceso paralelo | Hecho |
| RF-16 | Manejo con la voz, para cuando las manos están sucias. Por ahora alcanza con tocar botones y escuchar alarmas | Pendiente (#97), fuera de esta etapa |
| RF-17 | Si se cierra la app, la cocinada se retoma donde estaba | Hecho |
| RF-18 | Silenciar los sonidos | Hecho |
| RF-19 | La pantalla de cocina es cómoda de usar mientras se cocina, con las manos ocupadas | Pendiente (#98) |
| RF-19a | Las barras de todos los cronómetros avanzan sincronizadas entre sí y con el reloj, según el rediseño de #107 | Pendiente (#101) |
| RF-19b | Queda claro qué cronómetro lleva alarma y cuál no, y todo el que vence avisa, según el rediseño de #107 | Pendiente (#102) |
| RF-20 | Videos cortos (reels) que muestran cómo se hace cada paso; los sube quien crea el POE | Pendiente (#77), fuera de esta etapa |

### 3.3 Progreso y juego

| ID | Requerimiento | Estado |
|---|---|---|
| RF-21 | Resultados al terminar: tiempo real contra previsto y puntos, premiando la precisión y no la velocidad | Hecho |
| RF-22 | Niveles y logros | Hecho |
| RF-23 | Historial por receta: cada cocinada contra el tiempo objetivo | Hecho |
| RF-24 | Tabla de posiciones | Pendiente (#76), fuera de esta etapa |
| RF-25 | Compartir el progreso en Instagram | Pendiente (#86), fuera de esta etapa |

### 3.4 Lanzamiento 2: cuentas y POE públicos

| ID | Requerimiento | Estado |
|---|---|---|
| RF-30 | Cuentas de usuario con backend y base de datos | Pendiente (#68), fuera de esta etapa |
| RF-31 | Iniciar sesión con Google o Instagram. Solo se pide para subir o comentar un POE; para cocinar no hace falta | Pendiente (#69), fuera de esta etapa |
| RF-32 | Un usuario registrado crea su POE y lo publica | Pendiente (#71, #74), fuera de esta etapa |
| RF-33 | Comentarios y me gusta en los POE | Pendiente (#75), fuera de esta etapa |
| RF-34 | Con cuenta, el historial y el progreso se guardan en la cuenta, y se conserva lo que ya estaba en el teléfono. Es lo que resuelve el riesgo R-07 | Nuevo, fuera de esta etapa |

### 3.5 Lanzamiento 3: espacios privados por suscripción

| ID | Requerimiento | Estado |
|---|---|---|
| RF-40 | Una institución o un particular tiene un espacio privado con sus POE y sus videos, visibles solo para quienes elige. Para entrar hay que iniciar sesión | Pendiente (#100), fuera de esta etapa |
| RF-41 | Escuelas y universidades: el alumno se autoevalúa con su historial y el docente sigue el progreso de cada alumno y del curso | Pendiente (#85), fuera de esta etapa |
| RF-42 | Restaurantes: el supervisor mide tiempos, desvíos y repeticiones de cada cocinero | Nuevo, fuera de esta etapa |
| RF-43 | Cobro de la membresía, vinculada a la cuenta de quien la compra | Pendiente (#100), fuera de esta etapa |
| RF-44 | El espacio privado tiene un marco de seguridad: cifrado y la garantía de que los datos no se comparten | Pendiente (#110), fuera de esta etapa |

### 3.6 Más adelante

| ID | Requerimiento | Estado |
|---|---|---|
| RF-50 | Red social: seguir cocineros y mandarse mensajes | Nuevo, fuera de esta etapa |
| RF-51 | Publicidad, al estilo de Instagram pero de cocina | Nuevo, fuera de esta etapa |
| RF-52 | Ingredientes y utensilios propios, y buscar recetas por lo que hay en casa | Pendiente (#72, #73), fuera de esta etapa |
| RF-53 | Compra desde la receta: los ingredientes en el supermercado online más cercano y los utensilios en Mercado Libre, eligiendo entre marcas | Pendiente (#80, #81, #82), fuera de esta etapa |
| RF-54 | El costo del plato se calcula con precios actuales: los ingredientes en las páginas de los supermercados de la zona y los utensilios en Mercado Libre | Pendiente (#108), fuera de esta etapa |
| RF-55 | Cuando el mismo ingrediente o utensilio está en más de un lugar, la app compara precios y deja elegir | Nuevo, fuera de esta etapa |
| RF-56 | Un administrador agrega supermercados nuevos a la integración | Pendiente (#108), fuera de esta etapa |

### 3.7 Marca

| ID | Requerimiento | Estado |
|---|---|---|
| RF-60 | Nombre definitivo de la app: Cocinadas o Illioth Chef Training. El primer lanzamiento sale como Cocinadas; queda pendiente el análisis de marca para saber cuál conviene y si comparte marca con la consultoría | Pendiente (#87), fuera de esta etapa |

Lo que ya se analizó (2026-09-12 y 2026-09-15), para no repetirlo:

- **Cocinadas**: sin marcas registradas en TMview, `cocinadas.com` y `cocinadas.app` libres.
  En Instagram `@cocinadas` es un blog de recetas y en TikTok está tomado.
- **De dónde sale el nombre**: de Illobre, el apellido de Carlos. La consultoría de software
  que va a tener esta app en su portafolio se llamaría Illioth-Bress. Por eso lleva doble
  «l».
- **Illioth** (2026-10-09): sin marcas en la base mundial de WIPO. `illioth.com` e
  `illioth.app` están registrados desde junio de 2025 y hay un sitio publicado con ese
  nombre; `illioth.com.ar` está libre. En YouTube `@illioth` es de otra persona; en TikTok e
  Instagram está libre. «Illiothbress» no tiene marcas y sus dominios están libres.
- **Ilioth**, con una sola «l» (2026-09-15): sin marcas en WIPO, sin apps en las tiendas,
  dominios y usuarios de YouTube, TikTok e Instagram libres. Se aplicó a la app ese día
  como «Ilioth Chef Training» y se volvió a Cocinadas.
- En los dos casos «Chef» y «Training» son descriptivos: lo que se protege es la primera
  palabra.
- **Descartados**: MiseChef (ya existe una app con ese nombre y la misma idea), CronoChef
  (Chef Chrono en Francia, Cronochef Bernabeu S.L. en Madrid) y Templa (el nombre anterior,
  con el campo de marcas saturado y los dominios tomados).
- **Falta en todos**: la consulta por denominación en el INPI argentino, que exige iniciar
  sesión con ARCA.
- **Mientras no se decida**, el repositorio, la dirección publicada y los datos guardados en
  cada teléfono siguen llamándose `cocinadas` (riesgo R-04).

## 4. Requerimientos no funcionales

| ID | Requerimiento | Estado |
|---|---|---|
| RNF-01 | Solo celular: app web que se instala desde el navegador. No hay versión de escritorio | Hecho |
| RNF-02 | Se lee de parado, a un brazo de distancia y con las manos ocupadas: letra y botones grandes | Hecho |
| RNF-03 | Abre y funciona sin internet | Pendiente (#95) |
| RNF-04 | La pantalla no se apaga mientras se cocina | Pendiente (#96) |
| RNF-05 | Se usa sin cuenta y guarda todo en el teléfono | Hecho |
| RNF-06 | Tema claro y oscuro | Hecho |
| RNF-07 | Costo de operación cero en el primer lanzamiento | Hecho |
| RNF-08 | Castellano y Argentina | Hecho |
| RNF-09 | Cobertura de pruebas del 100 % y sin avisos del compilador | Hecho |
| RNF-10 | Las alarmas suenan con el celular bloqueado | Nuevo, fuera de esta etapa |
| RNF-11 | Apps nativas para Android y iPhone | Nuevo, fuera de esta etapa |

## 5. Decisiones de Carlos (2026-10-09)

1. En el primer lanzamiento alcanza con una app web, solo para celular. Las apps nativas
   vienen después, si la app tiene éxito.
2. El POE de papel es una planilla; la app tiene que tener toda esa información, pero
   adaptada a la pantalla interactiva del celular.
3. Las recetas las escribe Carlos a medida que las aprende.
4. Quién carga POE cambia con cada lanzamiento (sección 2).
5. La cocina se maneja con las manos sucias: botones grandes, pantalla siempre encendida
   y sin internet. La voz queda para una versión más avanzada.
6. Varios cronómetros a la vez; en principio el celular está desbloqueado.
7. Una porción por ahora; más adelante se adapta a los comensales.
8. Sin registro para cocinar; el registro aparece solo para subir o comentar un POE.
9. Es el proyecto de menor prioridad, pero terminado sirve como caso de éxito de la
   consultoría.

10. Qué no funciona bien hoy: las barras de los cronómetros no están sincronizadas, las
    alertas aparecen solo en algunos y la pantalla es incómoda de usar mientras se cocina
    (RF-19, RF-19a, RF-19b).
11. Qué falta del POE de papel: cómo cargarlo, el costo, los valores nutricionales, si
    tiene TACC y los octógonos (RF-06a a RF-06e).
12. El nombre no está decidido: Cocinadas o Illioth Chef Training (RF-60).

### Respuestas a las preguntas de la revisión (2026-10-09)

19. **Modelo de negocio.** Lo público es gratis, sin límites, anónimo y con la cuenta
    opcional. Lo privado es pago, con una membresía vinculada a la cuenta, y ahí la cuenta
    es obligatoria. Lo privado incluye un marco de seguridad: cifrado y garantía de que los
    datos no se comparten (sección 2, RF-40, RF-43, RF-44). Precisa la decisión 8: para
    cocinar un POE público nunca hace falta cuenta; para uno privado, sí.
20. Un particular puede tener un POE privado solo si compra la membresía. Gratis es
    únicamente lo público.
21. **Los cronómetros, sus barras y las alarmas se rediseñan.** A Carlos no le gusta cómo
    quedaron las barras y no queda claro con qué lógica un cronómetro lleva alarma. Es
    bloqueante para el primer lanzamiento. Al empezar la tarea (#107) se le preguntan los
    cambios específicos.
22. En el primer lanzamiento no se muestran costos. Se muestran cuando exista la
    integración con los supermercados, y antes de hacerla se discute con Carlos cómo un
    administrador agrega supermercados (#108). Reemplaza lo que la decisión 11 decía del
    costo.
23. El primer lanzamiento sale como Cocinadas. El nombre deriva de Illobre, el apellido de
    Carlos; queda pendiente el análisis de marca entre Illioth e Ilioth (#87).
24. La gamificación es de ahora: ya está publicada. No es bloqueante, como sí lo son los
    cronómetros y las alarmas.
25. Por el momento, solo celular, también para el docente, el supervisor y quien carga un
    POE. Una vista de escritorio se puede discutir si hace falta.
26. Una porción, cero desperdicio y sin sal agregada no son obligatorios: son variantes
    que se eligen desde la receta y se combinan. En la primera versión no están esos
    selectores (#109).

### Decisiones anteriores, de las sesiones de septiembre de 2026

13. La interfaz publicada es la fuente de verdad del diseño. No hay prototipo aparte.
14. El criterio de puntos quedó confirmado el 2026-09-07 (sección 6.4).
15. La cocinada se guarda siempre al terminar. No existe «salir sin guardar».
16. El seguimiento se hace con los issues del repositorio (2026-09-12).
17. A quién se dirige (2026-09-15): a quien cocina en su casa, a escuelas de cocina y
    universidades, y a restaurantes de hoteles de 4 y 5 estrellas.
18. El flujo central es elegir una receta y que la app la lleve paso a paso, ganando
    experiencia y logros. Todo lo demás se suma alrededor de eso y no lo reemplaza
    (2026-09-15).

## 6. Lo que ya funciona y no se puede romper

El detalle de los requerimientos en estado Hecho, tal como está publicado. Cada punto lo
pidió Carlos o lo aprobó al verlo. Cambiar cualquiera es cambiar un requerimiento: se le
pregunta antes.

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
  Google», que todavía no hace nada, y «Entrar sin cuenta».
- Lista: saludo, barra de experiencia y una tarjeta por receta con foto, tiempo del modo
  propuesto (el más lento), porciones y calorías.
- Ficha: tiempo, porciones, calorías y proteína. Los modos de preparación son tarjetas: el
  más lento va en verde con el cartel «¡Fácil!» y los demás en rojo con «¡Difícil!». Un «?»
  explica qué es el modo. Cambiar de modo no hace parpadear la pantalla.
- Ingredientes y utensilios en dos solapas, con foto. Las cantidades se leen sin ambigüedad:
  la fracción en tres caracteres («1/2»), la unidad con su palabra entera («cucharadita»)
  y la equivalencia entre paréntesis («(2,5 ml)»).
- Un botón fijo al pie lleva a la mise en place y dice el tiempo total.

### 6.3 Mise en place y cocina

- Mise en place: una barra fija arriba dice cuántos van de cuántos. La foto de lo que falta
  se mueve hasta que se tilda. Un toque en «Marcá todos los items para continuar» marca
  todo, y otro lo desmarca. No se cocina sin todo tildado.
- En la cocina quedan fijos arriba, aunque se haga scroll: la etapa, «Paso N de M», el reloj
  de la etapa con su barra y lo que corre solo.
- La tarjeta del paso tiene la foto, el título, el cronómetro contra lo previsto, los
  sub-pasos para tildar, las etiquetas de qué cuida el paso, un «?» con el porqué, un botón
  para reiniciar el paso y el botón «Listo».
- Pasado de tiempo, la tarjeta late: en rojo si la etapa es crítica y en ámbar si no lo es.
  En ese estado nada queda en verde, salvo los tildes de los sub-pasos.
- La línea de tiempo va debajo, con el diagrama de carriles a la derecha.
- La alarma de un proceso crítico tapa la pantalla y suena fuerte, repetida, hasta que se
  toca «Atendido».
- **Los cronómetros, sus barras y las alarmas se rediseñan (#107).** Lo que este apartado
  dice de ellos describe lo publicado, no lo que hay que conservar. Hasta que ese rediseño
  esté definido con Carlos, no se construye nada nuevo encima.
- Entre etapas hay una pausa con el resumen de la etapa que terminó.
- Al terminar el último paso no se salta a los resultados: la tarjeta pasa a decir «¡Receta
  completada!» con un botón, y el festejo empieza al tocarlo.
- Salir de la cocina descarta la cocinada en curso. Si la app se cierra sola o se recarga,
  se retoma donde estaba, hasta seis horas después.
- Sonidos: un toque al confirmar un paso, un aviso suave cuando vence un proceso no
  crítico, el aviso fuerte de la alarma y un arpegio al ver los resultados.

### 6.4 Resultados, experiencia, historial y perfil

- Los resultados muestran confeti, el tiempo real contra el previsto, el desglose de puntos,
  los logros nuevos y el paso a paso con el desvío de cada paso.
- Puntos por cocinada, confirmados por Carlos el 2026-09-07: 200 por completar la receta,
  100 más si el total quedó a menos del 10 % del previsto y 10 por cada paso que no se
  pasó de su tiempo.
- El margen del 10 % es simétrico a propósito: vale por arriba y por abajo, así que terminar
  mucho antes tampoco da el bonus. Se premia la precisión, no la velocidad.
- Niveles, con la experiencia desde la que empieza cada uno: Aprendiz (0), Cocinero (500),
  Sous Chef (1.500), Chef (3.000) y Chef Maestro (5.000).
- Logros: «Primera receta», «En tiempo» (la misma regla del 10 %), «Sin pasarse» (todos los
  pasos críticos a tiempo en una cocinada) y «Racha de 3» (tres días seguidos).
- La experiencia y los logros se calculan a partir de las cocinadas guardadas; no se guardan
  aparte.
- Historial: por receta, cada cocinada es un punto contra la línea del tiempo objetivo, con
  escala simétrica. Acercarse a la línea es mejorar.
- Perfil: nivel, experiencia, recetas cocinadas, minutos en la cocina y logros.

### 6.5 Las recetas del catálogo propio

- Cada receta existe como planilla para imprimir y como ficha que usa la app, y las dos
  dicen lo mismo.
- La receta publicada es de una porción, con cero desperdicio y sin sal agregada. No es
  una regla del catálogo: son variantes que más adelante se eligen (RF-08a).
- El tiempo declarado es el real de punta a punta: el reloj arranca al abrir el freezer e
  incluye descongelar, lavar y cortar.
- Cada ingrediente y cada utensilio es uno concreto, con su marca y su foto.

## 7. Contradicciones y preguntas abiertas

Ninguna se resuelve sin Carlos. Cuando responda, la respuesta va a la sección 5 con su
fecha y la pregunta se borra de acá. Las ocho de la revisión del 2026-10-09 ya están
respondidas (decisiones 19 a 26).

1. **¿Se puede publicar y comentar sin cuenta?** La decisión 19 dice que lo público no
   obliga a registrarse y que la cuenta es opcional. La decisión 8, RF-31 y RF-32 dicen que
   el registro aparece justamente para subir o comentar un POE. Falta decidir si publicar
   un POE, comentar y dar me gusta se pueden hacer de forma anónima, o si «sin cuenta» vale
   para cocinar y mirar. De eso depende cómo se modera lo que se sube (riesgo R-06) y cómo
   se sigue a un creador (RF-50).
