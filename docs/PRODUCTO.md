# Cocinadas: qué es, para quién y cómo funciona

Descripción funcional y de negocio de la aplicación, tal como está publicada en
<https://carlos-illobre.github.io/cocinadas/>. Lo técnico está en
[ARCHITECTURE.md](ARCHITECTURE.md); lo que todavía no existe está en el
[backlog](https://github.com/carlos-illobre/cocinadas/issues) y no acá.

## En una frase

Una app de celular que convierte una receta en una línea de tiempo viva, guía la
preparación paso a paso con el reloj corriendo, y mide cuánto se acercó cada cocinada a los
tiempos previstos, para que quien cocina entrene y mejore con cada repetición.

## El problema

Las recetas tradicionales dicen qué hacer, pero no cuándo. Quien cocina tiene que calcular
por su cuenta cuándo poner el agua, cuándo sacar el brócoli, cuánto lleva descongelar, y
qué cosas pueden correr al mismo tiempo. El resultado es comida que se pasa, que se enfría
esperando otra cosa, o que lleva el doble del tiempo anunciado. Las apps de recetas
existentes son recetarios con fotos; los temporizadores de cocina son relojes sin receta.
Ninguna de las dos une el qué con el cuándo.

## La propuesta

Cada receta viene con su tiempo pensado: qué paso empieza en qué minuto, cuánto dura, qué
procesos corren solos en paralelo (un descongelado, una olla al fuego) y cuáles son
críticos, es decir, en cuáles pasarse arruina el plato. La app lleva el reloj, muestra en
todo momento la tarea de las manos y lo que corre solo, avisa con sonido y vibración cuando
algo vence, y al final compara lo previsto con lo real.

Sobre eso hay un juego: la app **premia la precisión, no la velocidad**. Cocinar la misma
receta varias veces y acercarse al tiempo previsto da experiencia, sube de nivel y
desbloquea logros. Es una app de entrenamiento con forma de recetario.

## Para quién

- **Quien quiere aprender a cocinar bien una receta**, no cien. Repetirla hasta que salga
  al punto, con una guía que no lo deja solo con el reloj.
- **Quien cocina con poco tiempo** y necesita que los 20 minutos declarados sean 20.
- **Quien come con criterio**: las recetas del catálogo son POE (procedimiento operativo
  estándar): una porción, cero desperdicio, sin sal agregada, con calorías y proteína a la
  vista. El reloj arranca al abrir el freezer y el tiempo declarado incluye descongelar,
  lavar y cortar.

## Modelo de negocio hoy

Hoy la app es gratuita y no tiene cuentas: es un sitio estático que se baja entero al
teléfono, con el catálogo adentro, y guarda las cocinadas en el propio dispositivo. No hay
servidor, base de datos ni costo de operación más allá del alojamiento gratuito. Es la
versión de validación: sirve para probar la mecánica con usuarios reales sin construir
infraestructura.

El valor acumulable está en dos activos: **el catálogo** (recetas con tiempos probados, que
es trabajo editorial difícil de copiar) y **el historial de cada usuario** (sus cocinadas,
su progreso, sus logros), que hoy vive en el teléfono y que, con cuentas, pasa a ser lo que
retiene.

## El recorrido

Las pantallas van en este orden. El botón de tema (claro u oscuro) y el de sonido flotan
sobre todas menos la primera. Una barra inferior con tres pestañas (Recetas, Historial,
Perfil) aparece en las pantallas que no son parte de una cocinada.

### 1. Inicio

La mesada de una cocina, en capas, con el logotipo y el lema «Tu receta, al punto justo».
Dos botones: «Continuar con Google», que hoy no hace nada (queda como intención), y «Entrar
sin cuenta», que es la entrada real. Es la única pantalla sin los botones flotantes.

### 2. Recetas

Cabecera oscura con el saludo y la barra de experiencia: nivel actual, nombre del nivel,
puntos y cuánto falta para el siguiente. Debajo, una tarjeta grande por receta, con su foto
a sangre y tres datos en chips: tiempo total del modo propuesto, porciones y calorías.
Tocar la tarjeta abre la receta.

### 3. Portada de la receta

La foto del plato con el título encima y la fila de valores: tiempo, porciones, calorías y
proteína.

**Modo de preparación.** Una receta puede tener más de una versión. Se muestran como
tarjetas para elegir: la más lenta se marca en verde como «¡Fácil!» (mise en place primero,
una cosa por vez) y la más rápida en rojo como «¡Difícil!» (flujo continuo, todo en una
pasada). Cambiar de modo cambia el orden de los pasos y el tiempo total, no el plato. Un
botón «?» explica esto en la misma pantalla.

**Qué necesitás.** Dos solapas, Ingredientes y Utensilios, con foto, nombre y cantidad. Las
cantidades se muestran legibles («½ cucharadita (2,5 ml)»). Cualquier foto se amplía a
pantalla completa al tocarla, con una animación que la lleva de la miniatura a la grande.

El botón fijo al pie, «Comenzar · 21 min →», lleva a la mise en place.

### 4. Mise en place

La lista de todo lo que hay que tener en la mano antes de arrancar: utensilios e
ingredientes, cada uno con su foto, para tildar. Una barra fija arriba muestra cuántos van
de cuántos y el porcentaje. Las fotos de lo que falta se mueven suavemente hasta que se
tilda. Un enlace marca o desmarca todo de una vez. El botón «Cocinar» se habilita recién con
todo tildado: la receta es un procedimiento, y empezar sin el rallador en la mano es como se
pierde el tiempo crítico.

### 5. Cocina

La pantalla central. Se divide en tres zonas:

**Arriba, fijo al hacer scroll.** El nombre de la etapa, «Paso 3 de 9», el reloj de la etapa
contra su duración prevista y una barra de avance. Debajo, «Corre solo» o «En el fuego»: los
procesos que están andando sin las manos (descongelado, agua calentándose, pasta, brócoli
tapado), cada uno con su foto, su cuenta regresiva y una alerta ámbar cuando está por
vencer.

**En el medio, la tarjeta del paso.** Qué hacer ahora, con la foto del ingrediente
principal, el título, y a la derecha el cronómetro: cuenta lo transcurrido contra lo
previsto. Si el paso todavía no tiene que empezar, cuenta regresiva hasta que empiece; si es
un paso de espera, cuenta hasta que venza lo que corre. Los sub-pasos se tildan uno a uno.
Etiquetas dicen qué cuida el paso (sabor, seguridad, desperdicio) y un «?» despliega el
porqué completo. Dos botones: reiniciar el paso y «Listo, siguiente ✓», que suena al
tocarse.

Cuando el paso se pasa de tiempo, la tarjeta entera late: **en rojo si la etapa es crítica**
(el brócoli se pasa, los camarones se ponen gomosos) y **en ámbar si es tranquila**, con el
aviso «Sin apuro: en esta etapa pasarse no cambia el plato». El botón pasa a decir «Listo
(con demora)».

**Abajo, la línea de tiempo.** Un riel vertical con todos los pasos de la etapa a escala de
tiempo: los hechos con su desvío («+0:12», «−0:05»), el actual llenándose con el cronómetro,
los que vienen en gris. A la derecha, un diagrama de Gantt con un carril por proceso
paralelo, para ver qué corre junto con qué.

**Alarma.** Cuando vence un proceso crítico, una pantalla roja parpadeante tapa todo, con
sonido fuerte repetido y vibración, hasta que se toca «Atendido».

**Fin de etapa.** Entre etapas, una pausa con el resumen de la etapa que terminó (cada paso
con su desvío) y el botón para seguir.

**Receta completada.** Al terminar el último paso no se salta a los resultados: la tarjeta
se vuelve «¡Receta completada!» con un botón «Ver resultados 🏆». El festejo empieza recién
al tocarlo.

Salir de la cocina con «‹ Volver» o con el botón de atrás del teléfono descarta la cocinada.
Si el teléfono descarta la pestaña o la página se recarga, la cocinada en curso se retoma
donde estaba.

### 6. Resultados

Confeti, trofeo y el tiempo total contra el previsto. La cocinada se guarda sola. Debajo:

- **El desglose de experiencia**: 200 puntos por completar la receta, 100 de bonus si el
  total quedó a menos del 10 % del previsto (por arriba o por abajo, a propósito: la
  velocidad no vale), y 10 por cada paso que no se pasó de su tiempo.
- **Los logros nuevos** que esta cocinada desbloqueó.
- **El paso a paso** de toda la receta con el desvío de cada paso.

### 7. Historial

Un gráfico por receta: cada cocinada es un punto contra la línea del tiempo objetivo, con
escala simétrica, así que la distancia a la línea es el desempeño y acercarse es mejorar.
Debajo, la lista de intentos con fecha, modo, tiempo y desvío. Se puede cambiar de receta.

### 8. Perfil

Nivel y nombre del nivel (Aprendiz, Cocinero, Sous Chef, Chef, Chef Maestro), la barra de
experiencia, y los números: recetas cocinadas, minutos en la cocina, experiencia y logros
conseguidos. La lista de logros, cada uno con su condición:

| Logro | Condición |
|---|---|
| Primera receta | Cocinar una receta de punta a punta. |
| En tiempo | Terminar a menos del 10 % del tiempo previsto. |
| Sin pasarse | Todos los pasos críticos a tiempo en una misma cocinada. |
| Racha de 3 | Cocinar tres días seguidos. |

Todo sale de las cocinadas guardadas: no hay un estado paralelo que pueda desincronizarse.

## Transversal

- **Solo para celular**, pensada para leerse de parado, a un brazo de distancia, con las
  manos ocupadas: tipografía grande, botones grandes, nada informativo por debajo de
  13,5 px.
- **Tema claro y oscuro**, con un botón flotante, recordado en el teléfono.
- **Sonidos y vibración**: un toque al confirmar un paso, un aviso suave cuando vence un
  proceso no crítico, uno fuerte y repetido en la alarma, un arpegio al terminar. Un botón
  flotante los silencia. Respeta «reducir movimiento» del sistema.
- **Instalable**: desde el navegador se agrega a la pantalla de inicio y abre sin la barra
  del navegador. Se actualiza sola con cada publicación.
- **Recuperación**: si algo falla, una pantalla de error deja volver al inicio sin perder lo
  guardado.
- **Sin cuentas ni datos personales**: nada sale del teléfono.

## El catálogo

Las recetas son contenido, no código. Cada versión de una receta existe en tres formatos
que dicen lo mismo: un HTML imprimible, un PDF y el JSON que la app consume. Cada
ingrediente y cada utensilio tiene su ficha con foto (marca y modelo concretos). El catálogo
se valida automáticamente y la app se publica con él adentro.

Hoy hay una receta, Spaghetti integral con brócoli, champiñones y camarones al limón, en
sus dos modos. El formato está pensado para agregar recetas sin tocar la app.
