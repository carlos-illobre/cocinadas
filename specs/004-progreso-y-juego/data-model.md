# Datos de la capacidad «Progreso y juego»

Qué guarda la capacidad, dónde tiene que vivir y qué se calcula sin guardarse. No dice con
qué formato ni bajo qué nombre se guarda: eso lo decide quien la construya.

## Dónde vive todo

**En el teléfono de quien cocina, sin cuenta.** Ver la experiencia y los logros y guardar
el puntaje son cosas que se hacen sin registrarse (RNF-05), y nada que se escriba en un
servidor se hace sin cuenta (decisión 27 del 2026-10-09). Por lo tanto, mientras la
persona no tenga cuenta, ningún dato de esta capacidad sale del teléfono ni se comparte
con otro dispositivo.

Consecuencias que hay que respetar:

- El historial es de ese navegador en ese teléfono. Si la persona borra los datos del
  navegador o cambia de teléfono, lo pierde (riesgo R-07).
- Lo guardado no es de confianza al leerlo: pudo escribirlo otra versión de la app o
  quedar dañado. Lo que no tenga forma de cocinada se ignora, sin romper la app y sin
  borrar lo demás.
- Si el teléfono no deja guardar (modo privado, almacenamiento bloqueado), la app funciona
  igual y recuerda las cocinadas mientras esté abierta.

## Lo único que se guarda: las cocinadas

El **historial** es la lista de todas las cocinadas terminadas. No tiene tope de cantidad
ni vencimiento.

Cada **cocinada** guarda:

| Dato | Para qué |
|---|---|
| Un identificador propio, único | Que guardar dos veces la misma cocinada no la duplique |
| Qué receta es (identificador y nombre) | Agrupar el historial por receta y mostrar el nombre aunque la receta ya no esté en el catálogo |
| Qué modo de preparación fue (identificador y título) | Mostrarlo en cada intento; cada modo tiene su tiempo objetivo |
| Fecha y hora en que terminó, como instante universal | Ordenar, mostrar en la hora del teléfono y calcular la racha |
| Tiempo total previsto y tiempo total real, en segundos | El bonus, el logro «En tiempo» y el punto del gráfico |
| Cada etapa: nombre, previsto y real | El paso a paso de los resultados |
| Cada paso: cuál es, título, previsto, real y si era crítico | Los puntos por paso a tiempo y el paso a paso |
| Cuántos pasos críticos tenía y cuántos se hicieron a tiempo | El logro «Sin pasarse» y el detalle de cada intento |

Reglas:

- **Se guarda sola**, una sola vez, en el momento en que se abren los resultados. No hay
  acción de guardar ni de descartar (decisión 15).
- **Solo se guardan cocinadas terminadas.** Una cocinada que se abandona no deja nada.
- **Cada cocinada lleva consigo los tiempos previstos con los que se cocinó.** Si la receta
  cambia después, los puntos de las cocinadas anteriores no cambian.
- **No se guardan los puntos.** Los puntos de una cocinada se calculan con las reglas
  vigentes a partir de sus tiempos.

## Lo que se calcula y no se guarda

La experiencia y los logros se calculan a partir de las cocinadas guardadas; no se guardan
aparte. Así no hay un segundo dato que pueda quedar desfasado del primero, y cambiar una
regla del juego no invalida nada guardado.

| Dato calculado | Cómo sale |
|---|---|
| Puntos de una cocinada | 200 + 100 si estuvo en tiempo + 10 por cada paso a tiempo |
| En tiempo | El desvío del total, en valor absoluto, dividido por el total previsto, queda a menos del 10 %. Con total previsto cero, nunca |
| Paso a tiempo | Su tiempo real es menor o igual a su previsto |
| Precisión de una cocinada | Pasos a tiempo sobre pasos totales, en porcentaje entero; 0 si no hay pasos |
| Experiencia | Suma de los puntos de todas las cocinadas |
| Nivel | El de mayor umbral que la experiencia alcanza: 0 Aprendiz, 500 Cocinero, 1.500 Sous Chef, 3.000 Chef, 5.000 Chef Maestro |
| Avance dentro del nivel | Experiencia recorrida desde el umbral del nivel, sobre la distancia al umbral siguiente |
| Logros | Cuatro condiciones sobre el historial entero («Primera receta», «En tiempo», «Sin pasarse», «Racha de 3») |
| Logros nuevos de una cocinada | Los que el historial tiene con esa cocinada y no tenía sin ella |
| Día de una cocinada, para la racha | El día del calendario en la zona horaria del teléfono |
| Progreso de una receta | Sus cocinadas en orden cronológico y su tiempo objetivo |
| Recetas cocinadas y minutos en la cocina | Cantidad de cocinadas y suma de sus tiempos reales |

## Preferencias

Esta capacidad no guarda preferencias propias. Las que existen en la app (tema claro u
oscuro, sonidos apagados) se guardan también en el teléfono y pertenecen a otras
capacidades; el festejo de los resultados respeta la de sonido.

## Lo que no se guarda

- Ninguna identificación de la persona ni del teléfono.
- La experiencia, el nivel y los logros.
- Las cocinadas sin terminar.

## Con lanzamientos posteriores

- **Cuentas (RF-34)**: con cuenta, el historial y el progreso se guardan en la cuenta, y
  se conserva lo que ya estaba en el teléfono: las cocinadas guardadas sin cuenta pasan a la
  cuenta al registrarse, sin perder ninguna. Quien no tiene cuenta sigue como antes, con
  todo en su teléfono.
- **Tabla de posiciones (RF-24)**: necesita que la experiencia de cada cuenta esté en el
  servidor; solo participa quien tiene cuenta.
- **Compartir en Instagram (RF-25)**: la imagen se arma con los datos de una cocinada.
  Si eso exige guardar algo fuera del teléfono está sin definir.
- **Seguimiento de alumnos y cocineros (RF-41, RF-42)**: se apoya en estas mismas
  cocinadas, vistas por un docente o un supervisor dentro de un espacio privado.
