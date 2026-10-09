# Requerimientos

Qué tiene que hacer la app y con qué calidad, por lanzamiento. Fuente: `docs/PRODUCTO.md`,
los issues del repositorio y el relato de Carlos del 2026-10-09. La descripción de negocio
está en [PRODUCTO.md](PRODUCTO.md); acá va lo mismo como lista verificable, con su estado.

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
| 3 · Espacios privados | Universidades, institutos y restaurantes suben POE privados para entrenar a su gente, por suscripción | Instituciones que pagan |
| Más adelante | Red social de cocina, publicidad, compras, apps nativas | |

El modelo de negocio es el de GitHub: lo público es gratis y lo privado se paga.

## 3. Requerimientos funcionales

### 3.1 Catálogo y ficha de la receta

| ID | Requerimiento | Estado |
|---|---|---|
| RF-01 | Lista de recetas con foto, tiempo total, porciones y calorías | Hecho |
| RF-02 | Ficha de la receta: plato, valores nutricionales, ingredientes y utensilios con foto | Hecho |
| RF-03 | Modo de preparación fácil (una cosa por vez) o difícil (todo en paralelo) | Hecho |
| RF-04 | Recetas de lanzamiento: fideos con brócoli, filet de merluza al papillot, pizza al molde y bife de chorizo con arroz | Hecho en parte: 1 de 4 (#92, #93, #94) |
| RF-05 | Formato de receta que declara, por tarea, si se cronometra, si pasarse arruina el plato, si tiene un mínimo y con qué corre en paralelo | Pendiente (#70) |
| RF-06 | La app muestra toda la información del POE de papel, adaptada a la pantalla del celular | Pendiente (#99) |
| RF-07 | Recetas de una porción | Hecho |
| RF-08 | La receta se adapta a la cantidad de comensales | Nuevo, fuera de esta etapa |
| RF-09 | Filtros: con o sin sal, apto celíacos | Pendiente (#83, #84), fuera de esta etapa |
| RF-10 | Imprimir la receta | Pendiente (#79), fuera de esta etapa |

### 3.2 Cocinar

| ID | Requerimiento | Estado |
|---|---|---|
| RF-11 | Mise en place: lista de ingredientes y utensilios con foto para tildar; no se empieza sin todo | Hecho |
| RF-12 | Paso a paso: la tarea de ahora, sus sub-pasos, el porqué y el cronómetro contra el tiempo previsto | Hecho |
| RF-13 | Varios cronómetros a la vez: lo que corre solo, con su cuenta regresiva | Hecho |
| RF-14 | Alarmas con sonido y vibración; la de un paso crítico tapa la pantalla hasta que se atiende | Hecho |
| RF-15 | Línea de tiempo de la etapa con un carril por proceso paralelo | Hecho |
| RF-16 | Manejo con la voz, para cuando las manos están sucias | Pendiente (#97) |
| RF-17 | Si se cierra la app, la cocinada se retoma donde estaba | Hecho |
| RF-18 | Silenciar los sonidos | Hecho |
| RF-19 | Corregir lo que hoy no funciona bien, a relevar con Carlos | Pendiente (#98) |
| RF-20 | Videos cortos en los pasos | Pendiente (#77), fuera de esta etapa |

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

### 3.5 Lanzamiento 3: espacios privados por suscripción

| ID | Requerimiento | Estado |
|---|---|---|
| RF-40 | Una institución tiene un espacio privado con sus POE, visibles solo para su gente | Pendiente (#100), fuera de esta etapa |
| RF-41 | Escuelas y universidades: el docente sigue el progreso de cada alumno y del curso | Pendiente (#85), fuera de esta etapa |
| RF-42 | Restaurantes: el supervisor mide tiempos, desvíos y repeticiones de cada cocinero | Nuevo, fuera de esta etapa |
| RF-43 | Cobro de la suscripción | Pendiente (#100), fuera de esta etapa |

### 3.6 Más adelante

| ID | Requerimiento | Estado |
|---|---|---|
| RF-50 | Red social: seguir cocineros y mandarse mensajes | Nuevo, fuera de esta etapa |
| RF-51 | Publicidad, al estilo de Instagram pero de cocina | Nuevo, fuera de esta etapa |
| RF-52 | Ingredientes y utensilios propios, y buscar recetas por lo que hay en casa | Pendiente (#72, #73), fuera de esta etapa |
| RF-53 | Costo del plato y compra de ingredientes y utensilios, eligiendo entre marcas | Pendiente (#78, #80, #81, #82), fuera de esta etapa |

### 3.7 Marca

| ID | Requerimiento | Estado |
|---|---|---|
| RF-60 | Nombre definitivo de la app, analizado como marca | Pendiente (#87) |

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
5. La cocina se maneja con las manos sucias: voz, botones grandes, pantalla siempre
   encendida y sin internet.
6. Varios cronómetros a la vez; en principio el celular está desbloqueado.
7. Una porción por ahora; más adelante se adapta a los comensales.
8. Sin registro para cocinar; el registro aparece solo para subir o comentar un POE.
9. Es el proyecto de menor prioridad, pero terminado sirve como caso de éxito de la
   consultoría.

**Diferencia con PRODUCTO.md:** ese documento dice que los POE propios son privados por
defecto. La decisión de hoy es la contraria: los de un usuario son públicos y gratuitos, y
lo privado es de las instituciones que pagan.
