# Decisiones de producto

Lo que Carlos decidió sobre qué tiene que hacer la app, por fecha. Es el par de los
[ADR](adr/), que guardan las decisiones técnicas. Cada decisión está además en la sección
Clarifications de la especificación que toca (`specs/`). Una decisión nueva se agrega acá
con su fecha; las anteriores no se reescriben: si una cambia, se agrega la nueva y se anota
a cuál reemplaza.

Acá no se dice qué está hecho: eso está en `proyecto/estado.yml`. Lo que todavía no está
decidido está en [specs/preguntas-abiertas.md](../specs/preguntas-abiertas.md).

## Decisiones del 2026-10-09

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
12. El nombre no está decidido: Cocinadas o Illioth Chef Training (RF-60). Resuelto en
    la decisión 28.

## Respuestas a las preguntas de la revisión (2026-10-09)

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

27. **Nada que se escriba en el servidor se hace sin cuenta.** Sin cuenta se puede leer
    todo y guardar en el propio teléfono: cocinar, ver el progreso, guardar el puntaje y
    guardar POE propios, sin compartirlo con otro dispositivo. Publicar, comentar y dar me
    gusta exigen cuenta, para poder banear a quien publique algo ofensivo (sección 2,
    RF-31, RF-32, RF-35). Completa las decisiones 8 y 19.
28. **El nombre es Cocinadas.** Illioth queda descartado porque su dominio ya está
    registrado. Falta registrar la marca y reservar los dominios (RF-60). Reemplaza la
    decisión 23.
29. El seguimiento de docentes y supervisores tiene una vista de escritorio, en una
    dirección aparte. Es secundaria: lo que importa es que no afecte el diseño de celular
    (RF-45). Completa la decisión 25.

## Decisiones anteriores, de las sesiones de septiembre de 2026

13. La interfaz publicada es la fuente de verdad del diseño. No hay prototipo aparte.
14. El criterio de puntos quedó confirmado el 2026-09-07 (sección 6.4).
15. La cocinada se guarda siempre al terminar. No existe «salir sin guardar».
16. El seguimiento se hace con los issues del repositorio (2026-09-12).
17. A quién se dirige (2026-09-15): a quien cocina en su casa, a escuelas de cocina y
    universidades, y a restaurantes de hoteles de 4 y 5 estrellas.
18. El flujo central es elegir una receta y que la app la lleve paso a paso, ganando
    experiencia y logros. Todo lo demás se suma alrededor de eso y no lo reemplaza
    (2026-09-15).
