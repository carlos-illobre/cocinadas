# Constitución de Cocinadas

Lo que no se negocia. Toda especificación, plan y tarea se revisa contra este documento; si
algo lo contradice, se cambia ese algo o se enmienda la constitución con la aprobación de
Carlos. El porqué de cada regla técnica está en los ADR ([docs/adr](../../docs/adr/)).

## Core Principles

### I. La especificación manda y no depende del código

Lo fijo son las reglas del producto; el código puede rehacerse en cualquier momento. Las
especificaciones tienen que alcanzar para que alguien que nunca vio este código construya
de nuevo una aplicación que cumpla todos los requerimientos, funcionales y no funcionales.
Por eso describen qué tiene que pasar y nunca cómo está hecho hoy: no nombran archivos ni
componentes del código, y no dicen si algo está construido o no.

No se escribe código de una funcionalidad sin su `spec.md` aprobada por Carlos. Si el
trabajo no coincide con la especificación, se corrige el trabajo o se le pregunta a Carlos
si cambia la especificación; el agente no decide el alcance.

### II. Una receta es un POE

Cada receta es un procedimiento operativo estándar: el plato tiene que salir igual, con la
misma calidad, sin importar quién lo haga. Un POE dice qué hacer y cuándo: qué paso empieza
en qué minuto, cuánto dura, qué corre solo en paralelo, en qué pasos pasarse arruina el
plato y qué hay que tener en la mano antes de empezar. El tiempo declarado cuenta todo,
desde abrir el freezer.

### III. Se cocina con las manos ocupadas

La app es solo para celular y se lee de parado, a un brazo de distancia: ningún texto
informativo por debajo de 13,5 px, botones grandes, tema claro y oscuro. No hay versión de
escritorio para cocinar. Lo que avisa (un cronómetro que vence, un paso crítico) avisa con
sonido y vibración, no solo en pantalla.

### IV. Se premia la precisión, no la velocidad

El juego existe para que cada plato salga siempre igual: da experiencia acercarse al tiempo
previsto, tanto por arriba como por abajo. Terminar antes no vale más que terminar justo.

### V. Lo público es gratis y sin cuenta; lo privado es pago

Todo lo público es gratuito, sin límites y sin obligación de registrarse: lo primero es la
difusión. Nada que se escriba en el servidor se hace sin cuenta; todo lo que es leer, o
guardar en el propio teléfono, se hace sin ella. Lo privado (POE y videos que solo ve quien
el dueño elige) se paga con una membresía y exige cuenta.

### VI. El diseño aprobado es regla

Cada pantalla que Carlos aprobó se conserva: cambiarla es cambiar un requerimiento y se le
pregunta antes. El `ux.md` de cada capacidad describe lo aprobado. Lo visual se verifica
con capturas en un celular, en los dos temas, no leyendo el CSS.

### VII. Primero la prueba, y «hecho» solo con evidencia

Cada escenario de aceptación de una especificación tiene una prueba. Un requerimiento
figura como hecho solo cuando sus escenarios tienen pruebas que pasan. Ese estado no se
escribe en la especificación: vive en `proyecto/estado.yml`, con las pruebas que lo
respaldan, y es lo único que hay que reiniciar si el código se rehace.

Las compuertas del repositorio no se bajan: cobertura del 100 % en el código de la
aplicación y sus herramientas, y compilador y analizador sin ningún aviso.

### VIII. Los datos son contenido, no código

Las recetas, los ingredientes y los utensilios son el catálogo: se escriben como contenido
y la aplicación los lee tal cual. Cada receta existe en sus tres formas (para imprimir, en
PDF y como datos) y las tres tienen que decir lo mismo.

### IX. Nada se construye «para después»

No se agrega infraestructura, configuración ni abstracción para una necesidad que todavía
no existe. El primer lanzamiento no tiene costo de operación.

### X. En castellano y con voseo

Código, comentarios, commits, documentación y textos de la app van en español, con voseo
(«tocá», «entrá»). Los comentarios explican por qué, no qué.

### XI. Toda decisión queda escrita

Una decisión técnica es un ADR, con las opciones consideradas y el porqué. Un ADR viejo no
se reescribe: se le agrega una enmienda. Las decisiones de producto de Carlos se anotan con
su fecha en la especificación que tocan y en
[docs/decisiones-de-negocio.md](../../docs/decisiones-de-negocio.md).

## Restricciones técnicas

- **Sitio estático** publicado en GitHub Pages, que se baja entero al teléfono con el
  catálogo adentro (ADR-017). Todas las rutas son relativas.
- **Todo va directo a `main`**, sin ramas ni pull requests, y cada push publica. Antes de
  subir código pasan las tres compuertas: analizador, pruebas con cobertura y prueba de
  punta a punta.
- **Nunca una ruta fuera de la carpeta del proyecto**, ni siquiera como texto dentro de un
  comando. Lo temporal va en `tmp/`, que no se versiona, y se limpia al terminar.

## Flujo de trabajo

Cuatro roles, y ninguno más:

| Paso | Rol | Cómo | Produce | Aprueba Carlos |
|---|---|---|---|---|
| 1 | Analista de negocio | `/speckit-specify` y `/speckit-clarify`: le pregunta a Carlos hasta poder escribir la regla | `spec.md` | Sí |
| 2 | Diseñador | `/ux`: dos o tres maquetas de la pantalla principal para que Carlos elija | Maquetas y `ux.md` | Sí, elige la maqueta |
| 3 | Planificador | `/speckit-plan` y `/speckit-tasks` | `plan.md` corto y `tasks.md` | No |
| 4 | Desarrollador | `/speckit-implement` | Código, pruebas y el estado al día | Lo prueba en la app publicada |

El paso 2 se saltea cuando la funcionalidad no tiene pantallas nuevas. No se usan los
comandos opcionales del kit (análisis de coherencia, listas de control). Los comandos de
Spec Kit no crean rama.

No todo cambio pasa por los cuatro:

| Tamaño | Ejemplo | Quién interviene |
|---|---|---|
| Arreglo | Un error o un texto; no cambia ninguna regla | Solo el desarrollador, con su prueba. Sin documentos |
| Cambio de regla | Un requerimiento nuevo o modificado dentro de una capacidad | Analista y desarrollador. La regla se escribe directamente en la `spec.md` de la capacidad, sin carpeta propia |
| Funcionalidad nueva | Varias historias o pantallas nuevas | Los cuatro, con carpeta propia: `spec.md`, maquetas y `tasks.md` |

Como nadie revisa después al desarrollador, toda lista de tareas termina con estas tres, y
la funcionalidad no está terminada sin ellas:

1. Una prueba por cada escenario de aceptación, anotada en `proyecto/estado.yml`.
2. Si hay pantallas, comparar el resultado con la maqueta aprobada mediante capturas en un
   celular, en los dos temas, y mostrarle a Carlos las diferencias.
3. Actualizar `proyecto/estado.yml`, incorporar lo nuevo a la `spec.md` de la capacidad,
   escribir el ADR si hubo una decisión técnica y cerrar el issue.

## Convenciones propias sobre Spec Kit

- **Plantillas casi sin tocar.** Los títulos de las plantillas quedan como los trae el kit,
  en inglés, para no apartarse del estándar; el contenido se escribe en castellano. El único
  cambio propio es la fase final de `tasks-template.md`, con las tres tareas de cierre.
- **Identificadores.** Los requerimientos conservan sus IDs (`RF-14`, `RNF-03`) en lugar de
  `FR-001`. Los nuevos siguen la numeración de su capacidad.
- **Una carpeta por capacidad.** Las carpetas `001` a `006` especifican cada capacidad
  completa: todos sus requerimientos, estén construidos o no, y de cualquier lanzamiento.
  Son la especificación vigente. Las siguientes son funcionalidades nuevas.
- **Qué vale hoy.** Al terminar una funcionalidad, lo que cambia de una capacidad se
  incorpora a la `spec.md` de esa capacidad, con una nota de qué carpeta lo cambió y cuándo.
- **Regla y estado, separados.** `specs/` dice qué tiene que hacer la app.
  `proyecto/estado.yml` dice, por requerimiento, si está hecho, qué pruebas lo respaldan y
  en qué se aparta hoy el código de la regla. `herramientas/trazabilidad.mjs` controla en
  el CI que los dos coincidan.
- **`ux.md` son los requerimientos de interfaz y el diseño que Carlos aprobó** de cada
  capacidad. En una funcionalidad nueva, las maquetas van en `specs/NNN/maquetas/`.
- **Índice.** [specs/README.md](../../specs/README.md) lista cada requerimiento y su
  carpeta. Es la entrada para quien llega al proyecto.
- **Fuera de Spec Kit:** los ADR (`docs/adr/`), la descripción de negocio
  (`docs/PRODUCTO.md`), las decisiones de producto (`docs/decisiones-de-negocio.md`), el
  manual de publicación (`docs/operacion/`), el catálogo (`data/`) y la gestión del
  portafolio (`proyecto/`).

## Governance

Esta constitución prevalece sobre cualquier otra práctica del repositorio. Se enmienda con
la aprobación de Carlos, anotando qué cambió y por qué, y subiendo la versión. Cada rol
comprueba su trabajo contra ella antes de entregarlo; lo que la incumple no se termina.

**Version**: 1.0.0 | **Ratified**: 2026-10-10 | **Last Amended**: 2026-10-10
