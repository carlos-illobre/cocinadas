# Requerimientos de interfaz: Espacios privados

Qué tiene que poder hacer cada rol desde la pantalla, qué información necesita a la vista,
en qué estados puede estar y con qué textos. Acompaña a la especificación de la capacidad
(RF-40 a RF-45).

Las pantallas de esta capacidad se diseñan con maquetas que Carlos elige
antes de planificar el trabajo. Este documento fija lo que cualquier diseño tiene que
cumplir y lista lo que hay que preguntarle.

## Reglas que valen para toda la capacidad

- **La app de cocinar es solo de celular**, también para quien cocina un POE privado: se
  lee de parado, a un brazo de distancia, con ningún texto informativo por debajo de
  13,5 px, botones grandes y tema claro y oscuro.
- **Un POE privado se cocina igual que uno público.** La mise en place, el paso a paso, los
  cronómetros, las alarmas, los resultados y el historial son los mismos. El espacio privado
  no agrega nada a la pantalla de cocina.
- **La única vista de escritorio es la del seguimiento** (RF-45). Vive en una dirección
  aparte y tiene pantallas y estilos propios.
- **La vista de escritorio no puede afectar el diseño de celular.** Las pantallas del
  teléfono no se estiran ni se reacomodan para un ancho mayor, y quien cocina no descarga
  nada de la vista de escritorio.
- **En castellano y con voseo.**
- **Lo privado nunca se asoma en lo público.** Quien no fue elegido por el dueño no ve los
  POE, los videos ni el seguimiento de un espacio.
- **La barra inferior** de la app de cocinar tiene Recetas, Historial y Perfil. Es diseño
  aprobado: sumarle o cambiarle algo es cambiar un requerimiento y se le pregunta a Carlos.

## Qué tiene que poder hacer cada rol

### Dueño del espacio

- Comprar la membresía con su cuenta.
- Guardar POE y videos en su espacio privado.
- Elegir quién ve su espacio, y dejar de compartirlo con alguien.
- Ver que su contenido es privado y con quién está compartido.

Necesita a la vista:

- Que tiene una membresía y a qué cuenta está vinculada.
- Qué POE y qué videos hay en su espacio.
- Quiénes pueden verlo.
- La garantía de seguridad: que su contenido está cifrado y no se comparte.

### Miembro del espacio (alumno, cocinero o invitado de un particular)

- Iniciar sesión para entrar al espacio.
- Ver los POE y los videos del espacio y cocinar esos POE.
- Distinguir un POE del espacio de uno público.

Necesita a la vista:

- En qué espacio está y de quién es.
- Qué POE del espacio puede cocinar.

### Alumno

Además de lo del miembro, se autoevalúa:

- Ver, al terminar una cocinada, su desvío en cada paso.
- Ver su historial de intentos sobre un POE de la cátedra, cada uno contra el tiempo
  objetivo.
- Ver su progreso.

### Docente

- Ver el seguimiento de cada alumno: si mejora, en qué paso se traba y cuánto tarda en
  llegar al tiempo.
- Ver el seguimiento del curso entero y quién mejora.
- Mirarlo en la vista de escritorio.

Necesita a la vista, por alumno y por POE: los intentos, el tiempo real contra el previsto,
el desvío por paso y la evolución entre intentos.

### Cocinero

- Entrenar con los POE del restaurante, con lo mismo que ve cualquier persona al cocinar.

### Supervisor

- Ver el seguimiento de cada cocinero: tiempos, desvíos, pasos críticos a tiempo y
  repeticiones hasta dominar el plato.
- Mirarlo en la vista de escritorio.

Necesita a la vista, por cocinero y por plato: las repeticiones, el tiempo real contra el
previsto, el desvío por paso, cuáles pasos críticos llegaron a tiempo y si ya domina el
plato.

### Quien cocina, sin membresía

- Seguir usando todo lo público sin que la membresía se le interponga.
- Enterarse de que existe la membresía cuando quiere que algo suyo sea privado.

## Estados

De una persona frente a un espacio privado:

| Estado | Qué ve y qué puede |
|---|---|
| Sin sesión | Nada del espacio. Al querer entrar, el pedido de iniciar sesión |
| Con sesión, no elegida por el dueño | Nada del espacio |
| Con sesión, miembro | Los POE y los videos del espacio; puede cocinarlos |
| Con sesión, docente o supervisor | Lo del miembro y además el seguimiento de su curso o de su brigada |
| Con sesión, dueño | Todo el espacio, y elige quién lo ve |

De la membresía:

| Estado | Qué significa |
|---|---|
| Sin membresía | La persona usa lo público gratis. No tiene espacio privado |
| Comprando | Está en el pago. Puede abandonarlo |
| Pago no completado | No tiene membresía; la app se lo dice y sigue con lo público |
| Activa | Tiene su espacio privado |
| Vencida o sin pagar | Depende de las preguntas de RF-43 |

Del seguimiento:

| Estado | Qué se ve |
|---|---|
| Sin cocinadas | Que nadie del curso o de la brigada cocinó ese POE |
| Con cocinadas | Los datos de cada alumno o cocinero y los del conjunto |

## La vista de escritorio del seguimiento

- Está en una dirección distinta de la de la app de cocinar.
- Exige la sesión iniciada de un docente o de un supervisor. Sin sesión pide iniciarla y no
  muestra ningún dato.
- Está pensada para una pantalla grande: sirve para mirar un curso o una brigada entera de
  un vistazo, que es lo que en un celular no entra.
- Muestra el seguimiento de RF-41 (por alumno y por curso) y el de RF-42 (por cocinero).
- No sirve para cocinar: no hay versión de escritorio para cocinar.
- Sus tamaños de letra y de botones son los de una pantalla que se usa sentado; las reglas
  de leer de parado y con las manos ocupadas son de la app de cocinar.

[NEEDS CLARIFICATION: ¿qué muestra primero la vista de escritorio y cómo se recorre: una
tabla con una fila por alumno o por cocinero y una columna por POE, un gráfico de evolución
por persona, las dos cosas? ¿Qué quiere ver un docente apenas entra, y qué un supervisor?]

## Textos

Los textos fijados por las fuentes son los nombres de las cosas:

- «membresía», para lo que se paga. No «suscripción» ni «plan» en lo que lee el usuario.
- «espacio privado», para el lugar del dueño.
- «POE», «curso», «alumno», «docente», «cocinero», «supervisor».
- «seguimiento», para lo que miran el docente y el supervisor.
- «desvío», para la diferencia entre el tiempo real y el previsto.
- La regla del negocio dicha en una línea: «si todo lo que hacés es público, es gratis; si
  querés que algo sea privado, pagás la membresía».

Los demás textos (la oferta de la membresía, el pago, la invitación a un espacio, la
garantía de seguridad, los títulos del seguimiento) se definen con las maquetas, en voseo.

## Lo que depende de una respuesta de Carlos

Cada punto depende de una pregunta abierta de la especificación:

- **Cómo se elige quién ve el espacio** (RF-40): invitación, enlace o código.
- **Cómo se organiza el espacio por dentro** (RF-40): si hay cursos y brigadas, y quién
  nombra a un docente o a un supervisor.
- **Dónde aparece el espacio privado en la app de celular**: cómo llega un miembro a los POE
  de su espacio.

  [NEEDS CLARIFICATION: en el celular, ¿los POE del espacio privado aparecen en la misma
  lista de Recetas, marcados como privados, o en un lugar aparte? ¿Y desde dónde se llega a
  la compra de la membresía: desde el Perfil, o solo cuando alguien quiere guardar algo
  como privado?]
- **El pago** (RF-43): precio, planes, medio de pago y qué pasa al vencer.
- **Qué ve el docente y qué el supervisor** (RF-41, RF-42): si son la misma vista con otros
  nombres, qué significa «dominar» un plato y «llegar al tiempo».
- **El seguimiento en el celular** (RF-45): si existe además de la vista de escritorio.
- **La garantía de seguridad** (RF-44): con qué texto y en qué formato se le entrega a la
  institución.
