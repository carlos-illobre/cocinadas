# Tasks: plan de Cocinadas

Las tareas del proyecto, por etapa. **Este archivo es la fuente de verdad**: lo lee el
tablero del portafolio, y una tarea existe cuando está escrita acá.

Cada tarea es una línea. Entre corchetes van quién la hace (`[carlos]` o `[agente]`),
la prioridad si no es la normal (`[alta]`, `[baja]`), `[definir]` si antes Carlos
tiene que decidir algo y `[en curso]` mientras se hace. Al final, entre paréntesis, de
qué depende, cuánto lleva y entre qué fechas va:

    - [ ] T041 [carlos] [alta] Llamar al plomero (depende de T040) (estimación 2h) (2026-10-20 a 2026-10-22)

Una tarea nueva lleva el número que sigue al más alto del archivo y va bajo su etapa. Al
terminarla se marca `[x]`; no se borra. El `(#N)` del final es el issue de GitHub del
que salió cada una, el 2026-10-13; los issues ya no se usan.

## Lanzamiento 1 · Cocinar sin cuenta

- [ ] T070 [agente] Nuevo formato de receta: qué se cronometra, qué puede pasarse, qué tiene mínimo y qué se paraleliza (#70)
- [ ] T092 [carlos] Receta de lanzamiento: filet de merluza al papillot (#92)
- [ ] T093 [carlos] Receta de lanzamiento: pizza al molde (#93)
- [ ] T094 [carlos] Receta de lanzamiento: bife de chorizo con arroz (#94)
- [ ] T095 [agente] Abrir y cocinar sin internet (#95)
- [ ] T096 [agente] Mantener la pantalla encendida mientras se cocina (#96)
- [ ] T098 [agente] Mejorar la comodidad de uso mientras se cocina (depende de T107) (#98)
- [ ] T099 [carlos] Revisar que toda la información del POE de papel esté en la app (depende de T103, T104, T105, T106) (#99)
- [ ] T101 [agente] Las barras de los cronómetros no avanzan sincronizadas (depende de T107) (#101)
- [ ] T102 [agente] Las alertas aparecen solo en algunos cronómetros (depende de T107) (#102)
- [ ] T103 [agente] Cargar un POE sin editar archivos a mano (depende de T070) (#103)
- [ ] T104 [agente] Valores nutricionales completos en la ficha de la receta (#104)
- [ ] T105 [agente] Indicar si la receta tiene TACC o es sin TACC (#105)
- [ ] T106 [agente] Octógonos de advertencia: exceso de azúcares, de grasas, de sodio y los demás (#106)
- [ ] T107 [agente] Rediseñar los cronómetros, sus barras y las alarmas de la cocina (#107)

## Lanzamiento 2 · Cuentas y POE públicos

- [ ] T068 [agente] Backend con cuentas de usuario y base de datos (#68)
- [ ] T069 [agente] Iniciar sesión con Google o Instagram (depende de T068) (#69)
- [ ] T071 [agente] El usuario crea sus propias recetas (depende de T070, T074) (#71)
- [ ] T074 [agente] Compartir recetas con otros usuarios (depende de T068, T071) (#74)
- [ ] T075 [agente] Comentarios y likes en las recetas (depende de T074) (#75)
- [ ] T111 [agente] Moderación: banear la cuenta que publica contenido ofensivo (depende de T068) (#111)

## Lanzamiento 3 · Espacios privados por suscripción

- [ ] T085 [agente] Escuelas de cocina: la app como apoyo para alumnos (depende de T068, T071) (#85)
- [ ] T100 [agente] Espacios privados por suscripción para instituciones (depende de T068, T069, T071) (#100)
- [ ] T110 [agente] Seguridad del espacio privado: cifrado y garantía de que los datos no se comparten (depende de T100) (#110)
- [ ] T112 [agente] Vista de escritorio para el seguimiento de docentes y supervisores, en una dirección aparte (depende de T085, T100) (#112)

## Más adelante

- [ ] T072 [agente] Ingredientes y utensilios propios (#72)
- [ ] T073 [agente] Buscar recetas por los ingredientes que tengo (#73)
- [ ] T076 [agente] Tabla de posiciones por ranking (depende de T068) (#76)
- [ ] T077 [agente] Videos en los pasos de la receta (depende de T070) (#77)
- [ ] T078 [agente] Costo de los ingredientes y de la receta (depende de T108) (#78)
- [ ] T079 [agente] Imprimir la receta (#79)
- [ ] T080 [agente] Comprar los ingredientes en el supermercado online más cercano (depende de T078) (#80)
- [ ] T081 [agente] Comprar los utensilios en Mercado Libre (#81)
- [ ] T082 [agente] Elegir entre marcas de un ingrediente (#82)
- [ ] T083 [agente] Filtro con sal / sin sal (#83)
- [ ] T084 [agente] Filtro para celíacos (depende de T105) (#84)
- [ ] T086 [agente] Compartir el progreso en Instagram (#86)
- [ ] T087 [carlos] Registrar Cocinadas como marca y reservar los dominios (#87)
- [ ] T097 [agente] Manejar la cocina con la voz, para cuando las manos están sucias (#97)
- [ ] T108 [agente] Integración con supermercados: precios actuales y alta de supermercados por un administrador (#108)
- [ ] T109 [agente] Variantes de la receta seleccionables y combinables: sin sal, cero desperdicio y porciones (depende de T070) (#109)

## Sin etapa

- [x] T114 [agente] Un pedido de Carlos que cambia cómo se ve o se comporta algo se escribe en la documentación antes de programarlo (estimación 1h) (#114)
- [x] T115 [agente] Flujo de siete pasos con compuerta, y las tareas pasan de los issues a tasks.md
