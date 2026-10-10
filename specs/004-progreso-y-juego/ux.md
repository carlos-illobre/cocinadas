# Interfaz de la capacidad «Progreso y juego»

Requerimientos de interfaz y diseño aprobado de RF-21 a RF-25. La regla de qué tiene que
pasar (puntos, niveles, logros) está en `spec.md`; acá va cómo se le presenta a quien
cocina.

## Para quién se diseña

Dos momentos distintos de la misma persona:

- **Recién terminó de cocinar** (resultados): sigue parada frente a la mesada, con las
  manos sucias y el plato listo, y el teléfono a un brazo de distancia. Tiene que
  enterarse de cómo le fue de un vistazo y salir con un solo toque grueso. Nada de lo que
  importa puede exigir scroll ni lectura fina.
- **Después, con el teléfono en la mano** (historial y perfil): mira con calma cómo viene
  mejorando.

Reglas que valen para todas las pantallas de esta capacidad:

- Solo celular, en vertical (RNF-01). Ningún texto informativo por debajo de 13,5 px,
  tampoco los rótulos de un gráfico (RNF-02).
- Tema claro y oscuro (RNF-06). Con «reducir movimiento», el confeti no se muestra y los
  rebotes se apagan, sin que ningún dato deje de verse.
- **El color nunca dice «más rápido es mejor».** Verde es cerca del objetivo; el otro
  color es lejos, por arriba o por abajo. Un desvío negativo no se festeja.
- El estado que se marca con color lleva además un texto o un número.
- Todo se ve sin cuenta y sin internet: los datos están en el teléfono. Ninguna pantalla
  de esta capacidad tiene estado «cargando» ni error de red.
- Una barra inferior con Recetas, Historial y Perfil está en esas tres pantallas; los
  resultados no la tienen.

## Historia 1 · Resultados (RF-21)

**Qué tiene que poder hacer**: ver cómo le fue, enterarse de que quedó guardada, y seguir
con un toque. No hay nada que decidir.

**Qué necesita ver, en este orden** (lo de arriba es lo que se ve sin scroll):

1. El festejo: confeti sobre toda la pantalla, un trofeo, el título «¡Receta completada!»
   y el nombre de la receta. Suena un arpegio que sube.
2. Cuatro tarjetas, de a dos:
   - «Tiempo total»: el tiempo real en grande y debajo «objetivo: 20:00». En verde si la
     cocinada estuvo en tiempo; en coral si no.
   - «XP ganado»: «+360», «puntos de experiencia».
   - «Pasos en tiempo»: «6/8» y el porcentaje de precisión («75% de precisión»).
   - «Resultado»: «Excelente» y «¡Dentro del objetivo!» si estuvo en tiempo; «Completado»
     y «Seguí mejorando» si no.
3. «Desglose de XP», una fila por regla y el total: «Receta completada +200», «Bonus por
   tiempo +100», «Pasos a tiempo +60», «Total +360». La fila que suma cero se muestra
   apagada, con «+0».
4. La confirmación «✓ Guardada en este teléfono. Se ve en Progreso.» y el botón principal
   «Ver el progreso», que lleva al historial. Van antes del paso a paso, porque es lo que
   se busca al terminar y el paso a paso es largo.
5. «Paso a paso», con la aclaración «previsto → real»: por etapa, su nombre y su tiempo
   real, y cada paso con su tiempo previsto, su título y su desvío («+0:12», «−0:06»,
   «0:00»).
6. Los logros nuevos, si los hay, bajo «Logro conseguido» o «Logros conseguidos»: ícono,
   nombre y qué pide cada uno.

**Estados**:

| Estado | Qué se ve |
|---|---|
| En tiempo | Tiempo total en verde; «Excelente»; bonus +100 |
| Fuera del margen, por arriba o por abajo | Tiempo total en coral; «Completado»; bonus +0, apagado. El mismo trato para quien tardó de más y para quien terminó mucho antes |
| Ningún paso a tiempo | «Pasos a tiempo +0», apagado; «0/8» |
| Sin logros nuevos | La sección de logros no aparece |
| Un logro nuevo / varios | Título en singular / en plural |
| Silencio activado | Sin arpegio; lo demás igual |
| Reducir movimiento | Sin confeti ni rebote del trofeo |
| El teléfono no deja guardar | Los resultados se ven igual |

La pantalla se abre desde arriba, aunque la cocina hubiera quedado desplazada. El confeti
cubre la ventana entera, no solo la parte de arriba del contenido.

No hay cartel modal de «Logro desbloqueado»: se dejó afuera a propósito.

## Historia 2 · Nivel y experiencia (RF-22)

**Qué necesita ver**: en la lista de recetas, una barra de experiencia con «Nivel 2 —
Cocinero», los puntos («870 XP»), la barra dorada del avance dentro del nivel y, en sus
extremos, dónde empieza el nivel y dónde empieza el siguiente («500 XP» y «1500 XP»).

**Estados**:

| Estado | Qué se ve |
|---|---|
| Sin cocinadas | «Nivel 1 — Aprendiz», «0 XP», la barra vacía |
| A mitad de un nivel | La barra llena en la proporción recorrida del nivel |
| Último nivel | Sin definir: es una pregunta abierta en `spec.md` |

## Historia 3 · Logros (RF-22)

Se ven en el perfil, los cuatro siempre, y en los resultados cuando se consiguen.

| Logro | Texto de qué pide | Ícono |
|---|---|---|
| Primera receta | «Cociná una receta de punta a punta.» | 🍳 |
| En tiempo | «Terminá a menos del 10 % del tiempo previsto.» | ⏱️ |
| Sin pasarse | «Hacé todos los pasos críticos a tiempo en una misma cocinada.» | 🎯 |
| Racha de 3 | «Cociná tres días seguidos.» | 🔥 |

**Estados de un logro**: conseguido (a color, con la leyenda «Conseguido ✓») y sin
conseguir (apagado, pero legible: se tiene que poder leer qué pide).

## Historia 4 · Historial por receta (RF-23)

**Qué tiene que poder hacer**: elegir una receta y ver cómo viene.

**Qué necesita ver, en orden**:

1. La leyenda «Guardado en este teléfono» y el título «Progreso».
2. Si cocinó más de una receta, un selector con el nombre de cada una. Si cocinó una sola,
   no hay selector.
3. El nombre de la receta elegida.
4. El gráfico:
   - Un punto por cocinada, de izquierda a derecha de la más antigua a la más reciente,
     numerados 1, 2, 3… en el eje de abajo, y unidos por una línea cuando hay más de uno.
   - El objetivo es una línea horizontal en el medio del gráfico, con el rótulo «objetivo»
     y su tiempo en el eje.
   - La escala es simétrica alrededor del objetivo: el eje marca el objetivo y un valor a
     igual distancia por arriba y por abajo. Tiene un mínimo de amplitud para que, con una
     sola cocinada clavada en el objetivo, la línea se lea como centro y no como borde.
   - Cada punto lleva encima su tiempo real.
   - Punto verde: a menos del 10 % del objetivo. Punto coral: más lejos, por arriba o por
     abajo.
   - Al pie: «Cada punto es un intento, en orden; la línea es el objetivo. Cuanto más
     cerca de la línea, mejor. Verde: a menos del 10 %; coral: más lejos.»
   - Tiene una descripción en texto para quien no ve el gráfico: de qué receta es y cuál
     es el objetivo.
5. Dos datos de resumen: «Mejor», con el objetivo debajo, y «Promedio», con la cantidad de
   intentos («1 intento», «4 intentos»). [NEEDS CLARIFICATION: «Mejor», ¿es la cocinada
   más cercana al objetivo o la más corta? Si se premia la precisión y no la velocidad, la
   más corta no es la mejor.]
6. «Intentos», del más reciente al primero: por cada uno, la fecha y la hora («5 sep 2026
   · 19:40», en la hora del teléfono), el modo de preparación, el tiempo real, el desvío
   («+0:40», «−0:15» o «justo») y cuántos pasos críticos hizo a tiempo sobre cuántos tenía.

**Estados**:

| Estado | Qué se ve |
|---|---|
| Vacío | «Todavía no hay cocinadas guardadas. Al terminar una receta se guarda sola, y acá vas a ver cómo mejora cada vez.» Sin gráfico ni selector |
| Una cocinada | Un punto, sin línea que una; «1 intento» |
| Varias recetas | El selector; se muestra primero la de la cocinada más reciente |
| Recién guardada | Al llegar desde los resultados, la cocinada nueva ya está |
| Datos dañados | Se muestra lo que se pudo leer; sin mensaje de error |

## Historia 5 · Perfil (RF-22)

**Qué necesita ver, en orden**:

1. El número del nivel, en grande, el nombre del nivel y «Nivel N».
2. La experiencia: dónde empieza el nivel, «870 / 1500 XP», la barra dorada y «630 XP
   para el nivel siguiente».
3. Cuatro números, de a dos: «Recetas cocinadas», «Minutos en la cocina», «Experiencia» y
   «Logros» («2/4»).
4. Los cuatro logros (historia 3).
5. «Tus cocinadas»: «Suman 61:30 de cocina, guardadas en este teléfono.», o «Todavía no
   hay cocinadas guardadas.».
6. La versión de la app.

**Estados**: sin cocinadas (Aprendiz, todo en cero, los cuatro logros apagados) y con
cocinadas.

## Historias 6 y 7 · Tabla de posiciones e Instagram (RF-24, RF-25)

Sin diseño: son de un lanzamiento posterior al primero. Dos condiciones que ya valen:

- La tabla ordena por experiencia, que premia la precisión; no puede haber una tabla de
  «el más rápido».
- La imagen para Instagram muestra el tiempo, la precisión y el logro de la cocinada, y
  se ofrece desde los resultados.

## Diseño aprobado por Carlos

Cada punto lo pidió Carlos o lo aprobó al verlo. Cambiar cualquiera es cambiar un
requerimiento: se le pregunta antes.

**Resultados, experiencia, historial y perfil**

- Los resultados muestran confeti, el tiempo real contra el previsto, el desglose de
  puntos, los logros nuevos y el paso a paso con el desvío de cada paso.
- Puntos por cocinada, confirmados por Carlos el 2026-09-07: 200 por completar la receta,
  100 más si el total quedó a menos del 10 % del previsto y 10 por cada paso que no se
  pasó de su tiempo.
- El margen del 10 % es simétrico a propósito: vale por arriba y por abajo, así que
  terminar mucho antes tampoco da el bonus. Se premia la precisión, no la velocidad.
- Niveles, con la experiencia desde la que empieza cada uno: Aprendiz (0), Cocinero (500),
  Sous Chef (1.500), Chef (3.000) y Chef Maestro (5.000).
- Logros: «Primera receta», «En tiempo» (la misma regla del 10 %), «Sin pasarse» (todos
  los pasos críticos a tiempo en una cocinada) y «Racha de 3» (tres días seguidos).
- La experiencia y los logros se calculan a partir de las cocinadas guardadas; no se
  guardan aparte.
- Historial: por receta, cada cocinada es un punto contra la línea del tiempo objetivo,
  con escala simétrica. Acercarse a la línea es mejorar.
- Perfil: nivel, experiencia, recetas cocinadas, minutos en la cocina y logros.

**De la cocina y de toda la app, en lo que toca a esta capacidad**

- Al terminar el último paso no se salta a los resultados: la tarjeta pasa a decir
  «¡Receta completada!» con un botón, y el festejo empieza al tocarlo.
- Un arpegio suena al ver los resultados.
- La lista de recetas muestra el saludo y la barra de experiencia.
- Una barra inferior con Recetas, Historial y Perfil, en esas tres pantallas.
- Todo se guarda en el teléfono y nada sale de él. Sin cuenta se usa la app completa.
- La cocinada se guarda siempre al terminar. No existe «salir sin guardar».

**Dejado afuera a propósito**

- El ingreso por nombre.
- La dificultad.
- El cartel modal «Logro desbloqueado».
