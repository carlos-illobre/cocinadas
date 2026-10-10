# Especificaciones de Cocinadas

La entrada al proyecto: de qué se trata y dónde está escrito cada requerimiento. Con lo que
hay en esta carpeta, alguien que nunca vio el código tiene que poder construir de nuevo una
aplicación que cumpla todos los requerimientos, funcionales y no funcionales.

**Acá no se dice si algo está hecho.** Eso depende del código de hoy y vive en
[proyecto/estado.yml](../proyecto/estado.yml), con las pruebas que lo respaldan y los puntos
donde el código se aparta de la regla.

## De qué se trata

Una app para aprender a cocinar donde cada receta es un POE, un procedimiento operativo
estándar: que el plato salga siempre igual, con la misma calidad, sin importar quién lo
haga. La app lleva el reloj, muestra la tarea de las manos y lo que corre solo, avisa
cuando algo vence y, al terminar, compara lo previsto con lo real. Un juego premia la
precisión, no la velocidad.

A quién le sirve y por qué está en [docs/PRODUCTO.md](../docs/PRODUCTO.md). Los
lanzamientos y el modelo de negocio (lo público es gratis y sin cuenta; lo privado es pago)
están en [001-base-del-sistema](001-base-del-sistema/spec.md).

## Cómo está organizado

| Dónde | Qué tiene |
|---|---|
| [La constitución](../.specify/memory/constitution.md) | Lo que no se negocia y el flujo de trabajo, con sus cuatro roles |
| [001-base-del-sistema](001-base-del-sistema/) | Lo que vale para toda la app: los requerimientos no funcionales y el nombre (`spec.md`), lo que comparten todas las pantallas (`ux.md`), la arquitectura decidida (`plan.md`) y cómo se levanta, se prueba y se publica (`quickstart.md`) |
| `002` a `006` | Una por capacidad, con todos sus requerimientos, de cualquier lanzamiento: `spec.md` (historias, escenarios de aceptación y requerimientos), `ux.md` (requerimientos de interfaz y el diseño que Carlos aprobó) y, donde hay datos, `data-model.md`. El formato de una receta está en `002-catalogo-y-poe/contracts/` |
| `007` en adelante | Una por funcionalidad nueva, con el flujo de la constitución |
| [preguntas-abiertas.md](preguntas-abiertas.md) | Lo que todavía no está decidido. Cada pregunta está marcada en su documento como `[NEEDS CLARIFICATION]` |

Fuera de `specs/`: las decisiones técnicas en [docs/adr](../docs/adr/), las decisiones
de producto de Carlos en [docs/decisiones-de-negocio.md](../docs/decisiones-de-negocio.md),
el manual de publicación en [docs/operacion](../docs/operacion/), el catálogo de recetas,
ingredientes y utensilios en `data/`, y lo que falta hacer en los
[issues](https://github.com/carlos-illobre/cocinadas/issues).

## Requerimientos funcionales

### Catálogo y POE

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-01 | Lista de recetas con foto, tiempo total, porciones y calorías | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-02 | Ficha de la receta: plato, calorías y proteína, ingredientes y utensilios con foto | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-03 | Modo de preparación fácil (una cosa por vez) o difícil (todo en paralelo) | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-04 | Recetas de lanzamiento: fideos con brócoli, filet de merluza al papillot, pizza al molde y bife de chorizo con arroz | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-05 | Formato de receta que declara, por tarea, si se cronometra, si pasarse arruina el plato, si tiene un mínimo y con qué corre en paralelo | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-06 | La app muestra toda la información del POE de papel, adaptada a la pantalla del celular | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-06a | Mecanismo para cargar un POE sin editar archivos a mano | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-06b | Costo del plato en la ficha | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-06c | Valores nutricionales completos | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-06d | Si la receta tiene TACC o no | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-06e | Octógonos de advertencia: exceso de azúcares, de grasas, de sodio y los demás | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-07 | Recetas de una porción | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-08 | La receta se adapta a la cantidad de comensales | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-08a | Variantes de la receta, que se eligen desde su ficha y se combinan entre sí: sin sal, cero desperdicio y cantidad de porciones | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-09 | Filtros: con o sin sal, apto celíacos | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-10 | Imprimir la receta | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-52 | Ingredientes y utensilios propios, y buscar recetas por lo que hay en casa | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-53 | Compra desde la receta: los ingredientes en el supermercado online más cercano y los utensilios en Mercado Libre, eligiendo entre marcas | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-54 | El costo del plato se calcula con precios actuales: los ingredientes en las páginas de los supermercados de la zona y los utensilios en Mercado Libre | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-55 | Cuando el mismo ingrediente o utensilio está en más de un lugar, la app compara precios y deja elegir | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |
| RF-56 | Un administrador agrega supermercados nuevos a la integración | [002-catalogo-y-poe](002-catalogo-y-poe/spec.md) |

### Cocinar

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-11 | Mise en place: lista de ingredientes y utensilios con foto para tildar; no se empieza sin todo | [003-cocinar](003-cocinar/spec.md) |
| RF-12 | Paso a paso: la tarea de ahora, sus sub-pasos, el porqué y el cronómetro contra el tiempo previsto | [003-cocinar](003-cocinar/spec.md) |
| RF-13 | Varios cronómetros a la vez: lo que corre solo, con su cuenta regresiva | [003-cocinar](003-cocinar/spec.md) |
| RF-14 | Alarmas con sonido y vibración | [003-cocinar](003-cocinar/spec.md) |
| RF-15 | Línea de tiempo de la etapa con un carril por proceso paralelo | [003-cocinar](003-cocinar/spec.md) |
| RF-16 | Manejo con la voz, para cuando las manos están sucias | [003-cocinar](003-cocinar/spec.md) |
| RF-17 | Si se cierra la app, la cocinada se retoma donde estaba | [003-cocinar](003-cocinar/spec.md) |
| RF-18 | Silenciar los sonidos | [003-cocinar](003-cocinar/spec.md) |
| RF-19 | La pantalla de cocina es cómoda de usar mientras se cocina, con las manos ocupadas | [003-cocinar](003-cocinar/spec.md) |
| RF-19a | Las barras de todos los cronómetros avanzan sincronizadas entre sí y con el reloj, según el rediseño de #107 | [003-cocinar](003-cocinar/spec.md) |
| RF-19b | Queda claro qué cronómetro lleva alarma y cuál no, y todo el que vence avisa, según el rediseño de #107 | [003-cocinar](003-cocinar/spec.md) |
| RF-20 | Videos cortos (reels) que muestran cómo se hace cada paso; los sube quien crea el POE | [003-cocinar](003-cocinar/spec.md) |

### Progreso y juego

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-21 | Resultados al terminar: tiempo real contra previsto y puntos, premiando la precisión y no la velocidad | [004-progreso-y-juego](004-progreso-y-juego/spec.md) |
| RF-22 | Niveles y logros | [004-progreso-y-juego](004-progreso-y-juego/spec.md) |
| RF-23 | Historial por receta: cada cocinada contra el tiempo objetivo | [004-progreso-y-juego](004-progreso-y-juego/spec.md) |
| RF-24 | Tabla de posiciones | [004-progreso-y-juego](004-progreso-y-juego/spec.md) |
| RF-25 | Compartir el progreso en Instagram | [004-progreso-y-juego](004-progreso-y-juego/spec.md) |

### Cuentas y comunidad

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-30 | Cuentas de usuario con backend y base de datos | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-31 | Iniciar sesión con Google o Instagram | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-32 | Cualquiera crea su POE y lo guarda en su teléfono, sin cuenta | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-33 | Comentarios y me gusta en los POE | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-34 | Con cuenta, el historial y el progreso se guardan en la cuenta, y se conserva lo que ya estaba en el teléfono | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-35 | La cuenta que publica contenido ofensivo se puede banear | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-50 | Red social: seguir cocineros y mandarse mensajes | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |
| RF-51 | Publicidad, al estilo de Instagram pero de cocina | [005-cuentas-y-comunidad](005-cuentas-y-comunidad/spec.md) |

### Espacios privados

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-40 | Una institución o un particular tiene un espacio privado con sus POE y sus videos, visibles solo para quienes elige | [006-espacios-privados](006-espacios-privados/spec.md) |
| RF-41 | Escuelas y universidades: el alumno se autoevalúa con su historial y el docente sigue el progreso de cada alumno y del curso | [006-espacios-privados](006-espacios-privados/spec.md) |
| RF-42 | Restaurantes: el supervisor mide tiempos, desvíos y repeticiones de cada cocinero | [006-espacios-privados](006-espacios-privados/spec.md) |
| RF-43 | Cobro de la membresía, vinculada a la cuenta de quien la compra | [006-espacios-privados](006-espacios-privados/spec.md) |
| RF-44 | El espacio privado tiene un marco de seguridad: cifrado y la garantía de que los datos no se comparten | [006-espacios-privados](006-espacios-privados/spec.md) |
| RF-45 | El docente y el supervisor miran el seguimiento en una vista de escritorio, en una dirección aparte | [006-espacios-privados](006-espacios-privados/spec.md) |

## Requerimientos no funcionales y marca

### Toda la app

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-60 | El nombre de la app es Cocinadas | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-01 | Solo celular: app web que se instala desde el navegador | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-02 | Se lee de parado, a un brazo de distancia y con las manos ocupadas: letra y botones grandes | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-03 | Abre y funciona sin internet | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-04 | La pantalla no se apaga mientras se cocina | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-05 | Se usa sin cuenta y guarda todo en el teléfono | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-06 | Tema claro y oscuro | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-07 | Costo de operación cero en el primer lanzamiento | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-08 | Castellano y Argentina | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-09 | Cobertura de pruebas del 100 % y sin avisos del compilador | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-10 | Las alarmas suenan con el celular bloqueado | [001-base-del-sistema](001-base-del-sistema/spec.md) |
| RNF-11 | Apps nativas para Android y iPhone | [001-base-del-sistema](001-base-del-sistema/spec.md) |

## De dónde vino cada cosa

La documentación anterior a Spec Kit se repartió así el 2026-10-10. Los archivos viejos
están en el historial de git.

| Documento anterior | Dónde quedó |
|---|---|
| Requerimientos: objetivo, lanzamientos y modelo de negocio | Este archivo y `001-base-del-sistema/spec.md` |
| Requerimientos funcionales | Este índice y la `spec.md` de cada capacidad (`002` a `006`) |
| Requerimientos no funcionales | Este índice, `001-base-del-sistema/spec.md` y la constitución |
| El estado de cada requerimiento | `proyecto/estado.yml` |
| Decisiones de Carlos | `docs/decisiones-de-negocio.md` y la sección Clarifications de cada `spec.md` |
| «Lo que ya funciona y no se puede romper» | La sección «Diseño aprobado por Carlos» del `ux.md` de cada capacidad |
| Arquitectura y seguridad | `001-base-del-sistema/plan.md` y la constitución |
| Pruebas | `001-base-del-sistema/quickstart.md` y la constitución |
| Formato de las recetas | `002-catalogo-y-poe/contracts/receta.md` |
| Despliegue | `docs/operacion/` |
| Reglas para agentes | Constitución; `CLAUDE.md` conserva lo operativo |
