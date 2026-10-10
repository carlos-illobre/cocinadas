# Datos de la capacidad «Cocinar»

Qué guarda la capacidad, dónde tiene que vivir y cuánto dura. No dice con qué formato ni
bajo qué nombre se guarda: eso lo decide quien la construya.

## Dónde vive todo

**En el teléfono de quien cocina, y en ningún otro lado.** Cocinar no exige cuenta
(RNF-05) y nada que se escriba en un servidor se hace sin cuenta (decisión 27 del
2026-10-09); por lo tanto ningún dato de esta capacidad sale del teléfono ni se comparte
con otro dispositivo. La receta que se cocina tampoco se pide en el momento: ya está en el
teléfono, para que se pueda cocinar sin internet (RNF-03).

Consecuencias que hay que respetar:

- Lo guardado es de ese navegador en ese teléfono. Si la persona borra los datos del
  navegador o cambia de teléfono, se pierde (riesgo R-07; lo resuelve RF-34 cuando existan
  las cuentas).
- Lo guardado no es de confianza al leerlo: pudo escribirlo otra versión de la app o
  quedar dañado. Se valida antes de usarlo y, ante cualquier duda, se ignora. Retomar un
  estado que no corresponde es peor que no retomar, porque manda a cocinar el paso
  equivocado.
- Si el teléfono no deja guardar (modo privado, almacenamiento bloqueado), la app funciona
  igual y lo recuerda mientras esté abierta.

## Lo que se guarda

### Cocinada en curso

La cocinada que todavía no terminó. Hay **como mucho una**.

| Dato | Para qué |
|---|---|
| De qué receta y de qué modo de preparación es | Saber a qué cocina volver, y no retomar con una receta o un modo distintos |
| La receta completa tal como estaba al empezar | Volver directo a la cocina sin pedir nada |
| Momento, fase: cocinando, con una alarma sin atender, en la pausa entre etapas | Volver a la misma pantalla |
| Etapa y paso en que va | Volver al mismo paso |
| Instante en que empezó la etapa | El reloj de la etapa |
| Instante en que empieza a contar el paso actual | El cronómetro del paso, incluida la cuenta regresiva previa cuando la receta deja un intervalo libre |
| Sub-pasos tildados del paso actual | Que no haya que tildarlos de nuevo |
| Pasos terminados, por etapa: cuál, tiempo previsto, tiempo real, si era crítico | La línea de tiempo, el resumen de la etapa y los resultados |
| Duración real de cada etapa terminada | El resumen y el total |
| Procesos en marcha: cuál, instante en que empezó, duración, si ya avisó | Las cuentas regresivas y los avisos |
| Qué alarma está sin atender, si hay alguna | Volver a mostrarla |
| Instante del último guardado | El plazo de seis horas |

Reglas:

- **Los tiempos son instantes absolutos del reloj, no contadores.** Así, al volver, cada
  cronómetro muestra lo que de verdad pasó mientras la app no estaba (RF-17).
- **Se guarda a cada cambio** (un «Listo», un tilde, un vencimiento, una alarma atendida),
  no cada tanto: el teléfono puede cerrar la app en cualquier momento, sin avisar.
- **Se borra** cuando la cocinada termina (pasa al historial, RF-21), cuando se sale de la
  cocina, o cuando pasaron más de **seis horas**.
- **No se retoma** si la receta o el modo de preparación que se van a cocinar no son los
  de lo guardado.
- Nunca se guarda en el historial una cocinada sin terminar.

### Preferencia de sonido

Si los sonidos están apagados. Una sola, para toda la app. Sin nada guardado, los sonidos
están activados. No vence: dura hasta que la persona la cambia.

### Mise en place

Qué items están tildados. Vale mientras se está en esa pantalla; al empezar a cocinar deja
de importar.

## Lo que no se guarda

- Ninguna identificación de la persona ni del teléfono.
- Las cocinadas abandonadas.
- Los sonidos que se dieron: un aviso ya dado no se repite al retomar; una alarma sin
  atender, sí se vuelve a mostrar.

## Lo que esta capacidad le entrega a «Progreso y juego»

Al terminar la última etapa, la cocinada en curso se convierte en una cocinada terminada:
receta y modo, fecha, total previsto y total real, cada etapa y cada paso con su previsto y
su real, y cuántos pasos críticos hubo y cuántos se hicieron a tiempo. Qué se hace con eso
está en la capacidad de progreso y juego.

## Con lanzamientos posteriores

- **Videos de los pasos (RF-20)**: los videos son contenido de la receta, no datos de quien
  cocina. Dónde se alojan está sin definir.
- **Cuentas (RF-34)**: lo que pasa a la cuenta es el historial y el progreso. La cocinada
  en curso sigue siendo del teléfono en el que se está cocinando.
