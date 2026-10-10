# Interfaz de la capacidad «Cocinar»

Requerimientos de interfaz y diseño aprobado de RF-11 a RF-20. La regla de qué tiene que
pasar está en `spec.md`; acá va cómo se le presenta a quien cocina.

## Para quién se diseña

Una persona parada frente a la mesada, con las manos mojadas, sucias u ocupadas, y el
teléfono apoyado a un brazo de distancia. De eso salen las reglas que valen para todas las
pantallas de esta capacidad:

- **Solo celular**, en vertical. No hay versión de escritorio para cocinar (RNF-01).
- **Se lee de lejos**: ningún texto informativo por debajo de 13,5 px; los números de los
  relojes y el título del paso son lo más grande de la pantalla (RNF-02).
- **Se toca grueso**: las acciones que se usan con las manos ocupadas («Listo»,
  «Atendido», tildar un item, empezar la etapa) son botones grandes, que ocupan el ancho,
  y no exigen precisión ni gestos (arrastrar, mantener apretado, doble toque).
- **Una mano, un toque**: cada momento de la cocinada tiene una sola acción principal.
- **No depende de mirar**: lo que vence avisa con sonido y vibración, no solo en pantalla.
- **No depende del color solo**: el estado que se marca con color (pasado de tiempo,
  próximo a vencer, crítico) lleva además un texto o un número.
- **Tema claro y oscuro** (RNF-06), y con «reducir movimiento» las animaciones se apagan
  sin que nada deje de verse.
- **Arriba, a la derecha, flotan dos botones redondos**: el de tema y, debajo, el de
  sonido. Los dos se recuerdan.
- **Sin conexión**: toda la cocinada funciona sin internet (RNF-03); ninguna pantalla de
  esta capacidad tiene un estado «cargando» ni un error de red propio, porque la receta ya
  está entera en el teléfono cuando se llega a la mise en place.
- **La pantalla no se apaga** mientras se cocina (RNF-04).

## Historia 1 · Mise en place (RF-11)

**Qué tiene que poder hacer**: repasar la lista, tildar cada item con un toque en
cualquier parte de su fila, tildar todo de una vez, ampliar una foto para confirmar que es
ese producto, volver a la ficha, y pasar a cocinar.

**Qué necesita ver, en orden**:

1. El título «Mise en place» y la indicación «Verificá que tenés todo antes de empezar».
2. Una barra fija arriba, que no se va con el scroll: «N de M items», el porcentaje y una
   barra de avance.
3. Los utensilios, bajo el título «Utensilios»: foto, nombre y un círculo para el tilde.
4. Los ingredientes, bajo el título «Ingredientes»: foto, nombre, cantidad y el círculo.
   Las cantidades se escriben como en la ficha de la receta: la fracción en tres caracteres
   («1/2»), la unidad con su palabra entera y la equivalencia entre paréntesis.
5. Fijo al pie: la acción de marcar todos y el botón de cocinar.

**Estados**:

| Estado | Qué se ve |
|---|---|
| Sin tildar | El círculo vacío; la foto del item se mueve (un bamboleo suave) para llamar la atención |
| Tildado | El círculo con «✓»; la foto queda quieta y la fila se atenúa |
| Item sin foto | Un ícono en lugar de la foto; se tilda igual |
| Incompleto | El botón de cocinar deshabilitado, con el texto «Faltan N items»; la acción de arriba dice «Marcá todos los items para continuar» |
| Completo | La barra y el botón pasan a verde; el botón dice «Todo listo → Cocinar»; la acción de arriba dice «Desmarcar todos» |
| Foto ampliada | La foto grande sobre la pantalla; un toque en cualquier lado la cierra |
| Reducir movimiento | Las fotos no se mueven; el círculo vacío alcanza para saber qué resta |

No hay estado de error ni de carga.

## Historia 2 · La tarea de ahora (RF-12)

**Qué tiene que poder hacer**: leer qué hacer, tildar sub-pasos, ver el porqué, ampliar la
foto, reiniciar el paso, dar el paso por terminado y salir de la cocina.

**Qué necesita ver, en orden**:

1. Fijo arriba: la acción «‹ Volver», el nombre de la etapa, «Paso N de M», y a la derecha
   el reloj de la etapa («3:20» y debajo «de 12:00») con su barra.
2. Fijo arriba, debajo: lo que corre solo (historia 3).
3. La tarjeta del paso:
   - Una línea chica con el tipo de momento y el plan: «Ahora · con las manos», «Espera ·
     preparate» o «Todavía no · empieza en», y a la derecha el tramo previsto dentro de la
     etapa («2:00 → 4:00»).
   - La foto del ingrediente principal del paso, el título del paso y, a la derecha, la
     caja del cronómetro: el tiempo transcurrido en grande y debajo «de 2:00 previstos».
   - La barra del paso.
   - Los sub-pasos, uno por renglón, cada uno con su círculo para tildar.
   - Las etiquetas de qué cuida el paso (NUTRICIÓN, DESPERDICIO, TIEMPO, SEGURIDAD, SABOR),
     siempre a la vista, y un botón «?» que muestra y oculta el texto del porqué.
   - Al pie de la tarjeta: el botón chico de reiniciar el paso («↺») y el botón grande
     «Listo».
4. La línea de tiempo (historia 4).

**Estados de la tarjeta**:

| Estado | Qué se ve | Texto del botón principal |
|---|---|---|
| En tiempo | Cronómetro y barra en verde | «Listo, siguiente ✓» |
| Pasado, etapa crítica | La tarjeta late en rojo; el cronómetro muestra el exceso («+0:12»); una nota dice cuánto se pasó y qué se arruina (el porqué del paso). Nada en verde salvo los tildes de los sub-pasos | «Listo (con demora) ✓» |
| Pasado, etapa tranquila | La tarjeta late en ámbar; la nota dice «✓ Sin apuro: en esta etapa pasarse no cambia el plato». Nada en verde salvo los tildes | «Listo (con demora) ✓» |
| Todavía no empieza | El cronómetro cuenta para atrás, con la leyenda «para empezar este paso» | «Ya lo hice ✓» |
| Espera | El cronómetro cuenta para atrás lo que resta para que venza lo que corre, con la leyenda «para que venza lo que corre». Si no corre nada, muestra el cronómetro común | «Seguir ✓» |
| Receta completada | La tarjeta se reemplaza por un tilde grande, «¡Receta completada!» y un botón. Arriba, en lugar de «Paso N de M», dice «Receta completa» | «Ver resultados 🏆» |

Cada paso nuevo se muestra desde arriba de la pantalla, con el porqué cerrado y la foto sin
ampliar. Cambiar de paso no funde la pantalla entera (la tarjeta entra animada); cambiar de
fase (alarma, pausa, final) sí.

**Sonido**: un toque seco y corto al tocar «Listo», que confirma sin interrumpir.

## Historia 3 · Lo que corre solo y sus avisos (RF-13, RF-14, RF-19a, RF-19b)

**Qué tiene que poder hacer**: de un vistazo, saber qué está corriendo, cuánto le resta a
cada cosa y cuál lo va a interrumpir; cuando suena una alarma, apagarla con un toque.

**Qué necesita ver, en orden**:

1. La zona de lo que corre solo, fija arriba, con su título («En el fuego» en una etapa
   crítica, «Corre solo» en una tranquila). Si no corre nada, la zona no ocupa lugar.
2. Una fila por proceso: la foto del ingrediente (o un ícono según el tipo: frío, calor,
   hervor, tapado, reposo), el nombre, la nota de una línea, la cuenta regresiva con la
   leyenda «restante», y su barra.
3. La señal de si ese cronómetro lleva alarma o no (RF-19b).

**Sincronía (RF-19a)**: los números de todos los relojes de la pantalla cambian en el
mismo instante, y cada barra dibuja exactamente lo que dice su número. Ninguna barra se
anima con un retardo propio que la deje atrás de su número o de las otras.

**La alarma** (vencimiento de un proceso crítico):

- Tapa toda la pantalla, en rojo y coral alternados, con una campana.
- Dice, en este orden: la etapa y «tiempo crítico»; el nombre del proceso, en grande; su
  nota; y, si la receta dice qué paso hay que hacer cuando vence, ese paso con su foto, su
  título, su primer sub-paso y su duración.
- Al pie: «Seguir con (título del paso)», el botón blanco «Atendido», del ancho de la
  pantalla, y la leyenda «Suena y vibra hasta que toques».
- Es lo único en pantalla: no hay otra cosa que tocar.

**Sonidos y vibración**:

| Aviso | Cuándo | Cómo |
|---|---|---|
| Toque | Al confirmar un paso | Una nota corta, sin vibración |
| Suave | Vence un proceso no crítico | Dos notas que suben, una vez, con una vibración corta |
| Fuerte | Vence un proceso crítico | Dos tonos alternados, como un despertador, que se oyen sobre el ruido de la cocina, con vibración larga; se repite cada 2 segundos hasta «Atendido» |
| Festejo | Al ver los resultados | Un arpegio que sube |

**Estados**:

| Estado | Qué se ve |
|---|---|
| Nada corre | La zona no aparece |
| Proceso corriendo | Su fila, con la cuenta regresiva y la barra |
| Proceso crítico a 30 segundos o menos de vencer | La fila en ámbar, latiendo |
| Vence un proceso no crítico | Suena el aviso suave y la fila sale de la zona |
| Vence un proceso crítico | La alarma tapa la pantalla |
| Silencio activado | Todo igual en pantalla, sin sonido |
| El teléfono no puede sonar o vibrar | Todo igual en pantalla |
| Reducir movimiento | Sin latidos ni parpadeos; colores, textos y números iguales |

**Sin definir, a preguntarle a Carlos antes de diseñar** (decisión 21): cómo se ven las
barras, con qué señal se distingue el cronómetro que lleva alarma, qué aviso da un paso de
manos que se pasa, y si el vencimiento de un proceso no crítico deja una señal en pantalla.
Las preguntas están en `spec.md`. El rediseño pasa por maquetas que Carlos elige.

## Historia 4 · La línea de tiempo (RF-15)

**Qué tiene que poder hacer**: mirar, sin tocar nada, qué viene y cómo va.

**Qué necesita ver**: bajo el título «Línea de tiempo», con la cuenta de pasos terminados
sobre el total, una fila por paso con cuatro datos (el minuto previsto de inicio, un punto
de estado, el título, y a la derecha la duración prevista o, si ya se terminó, el desvío) y,
a la derecha de todo, el diagrama de carriles: el tiempo corre hacia abajo, la primera
barra son las manos y cada proceso tiene la suya en paralelo.

**Estados de una fila**: terminada (con su desvío: «+0:12», «−0:06» o «0:00»), actual
(destacada, llenándose), por venir, y espera (con otro tratamiento, porque no es trabajo de
manos). Un carril de proceso crítico va en color cálido; uno no crítico, en frío.

El alto de cada fila es proporcional a su tiempo, con un mínimo que deja leer el título.

## Historia 5 · La pausa entre etapas y el final (RF-12)

**Qué tiene que poder hacer**: respirar, ver cómo le fue en la etapa, leer qué condiciones
tiene la pausa y arrancar la etapa siguiente con un toque.

**Qué necesita ver, en orden**:

1. El nombre de la etapa y «lista».
2. El tiempo real de la etapa, en grande, y debajo «previsto 12:00».
3. El desvío en una frase: «Justo a tiempo.» o «+0:40 respecto de lo previsto.».
4. Las condiciones de la pausa que da la receta, si las da.
5. Los pasos de la etapa, cada uno con lo previsto y su desvío.
6. El botón «Empezar (nombre de la etapa siguiente)» y, debajo, cuándo arranca su reloj
   según la receta.

En la pausa no corre ningún reloj ni suena nada.

**Salir**: «‹ Volver» y el botón de atrás del teléfono vuelven a la pantalla anterior y
descartan la cocinada en curso.

## Historia 6 · Retomar (RF-17)

No tiene pantalla propia: al abrir la app con una cocinada en curso se entra directo a la
cocina, sin cartel de «¿querés retomar?». Si pasaron más de seis horas, se entra por la
pantalla de entrada como siempre, sin mensaje.

## Historia 7 · Silenciar (RF-18)

El botón redondo de sonido flota arriba a la derecha, debajo del de tema, en todas las
pantallas menos la de entrada. Muestra un parlante («🔊») con los sonidos activados y un
parlante tachado («🔇») en silencio. Su nombre accesible dice la acción: «Silenciar los
sonidos» o «Activar los sonidos».

## Historia 8 · Comodidad (RF-19)

Los requerimientos de la primera sección de este documento. El listado concreto de qué
resulta incómodo sale de una cocinada real de Carlos (pregunta abierta en `spec.md`) y
cada punto se resuelve con maquetas que él elige.

## Historias 9 y 10 · Voz y videos (RF-16, RF-20)

Sin diseño: son de un lanzamiento posterior al primero. El video se ve en la tarjeta del
paso, sin sacar de la vista el cronómetro ni el botón «Listo».

## Diseño aprobado por Carlos

Cada punto lo pidió Carlos o lo aprobó al verlo. Cambiar cualquiera es cambiar un
requerimiento: se le pregunta antes.

**En toda la app, en lo que toca a esta capacidad**

- Es de celular y se lee de parado: ningún texto informativo por debajo de 13,5 px.
- Dos botones redondos flotan arriba a la derecha en todas las pantallas menos la de
  entrada: el de tema (claro u oscuro) y, debajo, el de sonido. Los dos se recuerdan.
- El botón de atrás del teléfono vuelve una pantalla.
- Todo se guarda en el teléfono y nada sale de él. Sin cuenta se usa la app completa.
- Los cambios de pantalla y lo que aparece o desaparece van animados. Con «reducir
  movimiento» activado en el teléfono las animaciones se apagan y nada deja de verse.
- Cualquier foto de un ingrediente, de un utensilio o de un paso se amplía al tocarla y se
  cierra tocando en cualquier lado.

**Mise en place y cocina**

- Mise en place: una barra fija arriba dice cuántos van de cuántos. La foto de cada item
  sin tildar se mueve hasta que se tilda. Un toque en «Marcá todos los items para
  continuar» marca todo, y otro lo desmarca. No se cocina sin todo tildado.
- En la cocina quedan fijos arriba, aunque se haga scroll: la etapa, «Paso N de M», el
  reloj de la etapa con su barra y lo que corre solo.
- La tarjeta del paso tiene la foto, el título, el cronómetro contra lo previsto, los
  sub-pasos para tildar, las etiquetas de qué cuida el paso, un «?» con el porqué, un botón
  para reiniciar el paso y el botón «Listo».
- Pasado de tiempo, la tarjeta late: en rojo si la etapa es crítica y en ámbar si no lo es.
  En ese estado nada queda en verde, salvo los tildes de los sub-pasos.
- La línea de tiempo va debajo, con el diagrama de carriles a la derecha.
- La alarma de un proceso crítico tapa la pantalla y suena fuerte, repetida, hasta que se
  toca «Atendido».
- **Los cronómetros, sus barras y las alarmas se rediseñan.** Lo que este apartado dice de
  ellos es el diseño anterior, no lo que hay que conservar. Hasta que ese rediseño esté
  definido con Carlos, no se agrega nada nuevo encima.
- Entre etapas hay una pausa con el resumen de la etapa que terminó.
- Al terminar el último paso no se salta a los resultados: la tarjeta pasa a decir
  «¡Receta completada!» con un botón, y el festejo empieza al tocarlo.
- Salir de la cocina descarta la cocinada en curso. Si la app se cierra sola o se recarga,
  se retoma donde estaba, hasta seis horas después.
- Sonidos: un toque al confirmar un paso, un aviso suave cuando vence un proceso no
  crítico, el aviso fuerte de la alarma y un arpegio al ver los resultados.

**Dejado afuera a propósito**

- Cronómetros por paso independientes entre sí.
- Los sub-pasos numerados.
