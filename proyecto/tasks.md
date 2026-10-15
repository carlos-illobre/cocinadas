# Tasks: plan de Cocinadas

Las tareas del proyecto, por etapa. **Este archivo es la fuente de verdad**: lo lee el
tablero del portafolio, y una tarea existe cuando está escrita acá.

Cada tarea es una línea. Entre corchetes van quién la hace (`[carlos]` o `[agente]`),
la prioridad si no es la normal (`[alta]`, `[baja]`), `[definir]` si antes Carlos
tiene que decidir algo y `[en curso]` mientras se hace. Al final, entre paréntesis, de
qué depende, cuánto lleva y entre qué fechas va:

    - [ ] T041 [carlos] [alta] Llamar al plomero (depende de T040) (estimación 2h) (2026-10-20 a 2026-10-22)

Debajo de una tarea puede haber notas, con sangría de dos espacios: a qué requerimiento
corresponde y en qué carpeta de `specs/` está especificado, y lo que aclaraba su issue que
no es una regla del producto (pasos sugeridos, qué decidir antes, cómo está hoy el código).
Las reglas están en `specs/`; lo que falta decidir, en `specs/preguntas-abiertas.md`.

Una tarea nueva lleva el número que sigue al más alto del archivo y va bajo su etapa. Al
terminarla se marca `[x]`; no se borra. El `(#N)` del final es el issue de GitHub del
que salió cada una, el 2026-10-13; los issues ya no se usan.

## Lanzamiento 1 · Cocinar sin cuenta

- [ ] T070 [agente] Nuevo formato de receta: qué se cronometra, qué puede pasarse, qué tiene mínimo y qué se paraleliza (#70)
  Requerimiento RF-05, especificado en specs/002-catalogo-y-poe.
  Hoy esas declaraciones están repartidas entre la `vigilancia` de la etapa, los `procesos` y la
  `espera` del formato vigente (data/recetas/esquema-receta.md); el defecto está en RF-05 de
  proyecto/estado.yml.
  El modelo de la cocina (web/src/cocina/modelo.ts) y el diagrama de tiempos tienen que leer el
  formato nuevo.
  Conviene hacerla antes de T071, para que las recetas de los usuarios nazcan con el formato
  definitivo.
- [ ] T092 [carlos] Receta de lanzamiento: filet de merluza al papillot (#92)
  Requerimiento RF-04, especificado en specs/002-catalogo-y-poe.
- [ ] T093 [carlos] Receta de lanzamiento: pizza al molde (#93)
  Requerimiento RF-04, especificado en specs/002-catalogo-y-poe.
- [ ] T094 [carlos] Receta de lanzamiento: bife de chorizo con arroz (#94)
  Requerimiento RF-04, especificado en specs/002-catalogo-y-poe.
- [ ] T095 [agente] Abrir y cocinar sin internet (#95)
  Requerimiento RNF-03, especificado en specs/001-base-del-sistema.
- [ ] T096 [agente] Mantener la pantalla encendida mientras se cocina (#96)
  Requerimiento RNF-04, especificado en specs/001-base-del-sistema.
- [ ] T098 [agente] Mejorar la comodidad de uso mientras se cocina (depende de T107) (#98)
  Requerimiento RF-19, especificado en specs/003-cocinar.
  Relato de Carlos (2026-10-09): la app es incómoda de usar cuando se está cocinando.
  Pasos: revisar la pantalla de cocina en una cocinada real, con las manos ocupadas, y convertir
  cada molestia en un cambio concreto.
  Los dos problemas ya identificados tienen su tarea: T101 (barras desincronizadas) y T102
  (alertas que faltan).
- [ ] T099 [carlos] Revisar que toda la información del POE de papel esté en la app (depende de T103, T104, T105, T106) (#99)
  Requerimiento RF-06, especificado en specs/002-catalogo-y-poe.
- [ ] T101 [agente] Las barras de los cronómetros no avanzan sincronizadas (depende de T107) (#101)
  Requerimiento RF-19a, especificado en specs/003-cocinar.
  Relato de Carlos (2026-10-09): las barras de los cronómetros no están bien sincronizadas entre
  sí ni con el reloj.
  Implementa el comportamiento que define T107.
- [ ] T102 [agente] Las alertas aparecen solo en algunos cronómetros (depende de T107) (#102)
  Requerimiento RF-19b, especificado en specs/003-cocinar.
  Relato de Carlos (2026-10-09): la alerta de vencimiento se ve en algunos cronómetros y en otros
  no. Tiene que avisar siempre.
  Implementa el comportamiento que define T107.
- [ ] T103 [agente] Cargar un POE sin editar archivos a mano (depende de T070) (#103)
  Requerimiento RF-06a, especificado en specs/002-catalogo-y-poe.
  Hoy falta el mecanismo (defecto en RF-06a de proyecto/estado.yml). En el primer lanzamiento lo
  usa solo Carlos; es la base de la carga por usuarios del segundo (T071).
- [ ] T104 [agente] Valores nutricionales completos en la ficha de la receta (#104)
  Requerimiento RF-06c, especificado en specs/002-catalogo-y-poe.
  Hoy se ven calorías y proteína; falta la tabla completa del POE de papel (defecto en RF-06c de
  proyecto/estado.yml).
- [ ] T105 [agente] Indicar si la receta tiene TACC o es sin TACC (#105)
  Requerimiento RF-06d, especificado en specs/002-catalogo-y-poe.
  Relacionada con el filtro para celíacos (T084).
- [ ] T106 [agente] Octógonos de advertencia: exceso de azúcares, de grasas, de sodio y los demás (#106)
  Requerimiento RF-06e, especificado en specs/002-catalogo-y-poe.
- [ ] T107 [agente] Rediseñar los cronómetros, sus barras y las alarmas de la cocina (#107)
  Requerimientos RF-13, RF-14, RF-19a y RF-19b, especificados en specs/003-cocinar.
  Es bloqueante para el primer lanzamiento (decisión 21 de docs/decisiones-de-negocio.md).
  Antes de empezar: preguntarle a Carlos los cambios específicos. No se diseña por cuenta propia.
  Define el comportamiento que después implementan T101 (barras sincronizadas) y T102 (qué avisa
  cada cronómetro), y parte de T098.
  Cómo avisa hoy la app, según el issue: un proceso crítico que vence dispara la alarma a
  pantalla completa, con sonido repetido, y treinta segundos antes se marca en ámbar, sin
  sonido; un proceso no crítico que vence suena suave, sin cartel; un paso que se pasa de su
  tiempo solo cambia de color (rojo en etapa crítica, ámbar en las demás), sin sonido. Dónde eso
  se aparta de la regla está en RF-13, RF-14 y RF-19b de proyecto/estado.yml.

## Lanzamiento 2 · Cuentas y POE públicos

- [ ] T068 [agente] Backend con cuentas de usuario y base de datos (#68)
  Requerimientos RF-30 y RF-34, especificados en specs/005-cuentas-y-comunidad.
  Hoy la app es un sitio estático y todo se guarda en el teléfono (ADR-015, que dejó escrito el
  camino de vuelta, y ADR-017).
  Lo necesitan compartir recetas, comentar, dar me gusta, la tabla de posiciones e iniciar sesión.
  Decisiones a tomar: dónde se hospeda, qué base de datos, cómo se autentica y qué pasa con el
  historial que ya está en cada teléfono (la migración, RF-34).
  El issue daba como hospedaje ya documentado Oracle Cloud, en un documento de despliegue que ya
  no existe; lo que queda de eso es ADR-011, superado por ADR-017.
- [ ] T069 [agente] Iniciar sesión con Google o Instagram (depende de T068) (#69)
  Requerimiento RF-31, especificado en specs/005-cuentas-y-comunidad.
  Hoy el botón «Continuar con Google» de la pantalla de entrada no hace nada (defecto en RF-31 de
  proyecto/estado.yml).
  Instagram usa el inicio de sesión de Facebook (Meta); Google es OAuth directo.
- [ ] T071 [agente] El usuario crea sus propias recetas (depende de T070, T103) (#71)
  Requerimiento RF-32, especificado en specs/005-cuentas-y-comunidad; el formato es el de RF-05
  y la carga parte de RF-06a (specs/002-catalogo-y-poe).
  Un editor de recetas dentro de la app: pasos, tiempos, ingredientes, utensilios y fotos.
  Crear y guardar un POE en el propio teléfono no necesita cuenta; publicarlo sí (T074).
  El issue decía que las recetas propias se guardan primero en el teléfono y, cuando haya cuentas
  (T068), en la cuenta. La especificación lo tiene sin decidir: pregunta 10 de «Cuentas y
  comunidad» en specs/preguntas-abiertas.md.
- [ ] T074 [agente] Compartir recetas con otros usuarios (depende de T068, T071) (#74)
  Requerimiento RF-32, especificado en specs/005-cuentas-y-comunidad.
  Publicar una receta propia para que otros la cocinen.
- [ ] T075 [agente] Comentarios y likes en las recetas (depende de T074) (#75)
  Requerimiento RF-33, especificado en specs/005-cuentas-y-comunidad.
  Sobre las recetas compartidas: comentar, dar me gusta y ver las más votadas. Si existe la lista
  de las más votadas es la pregunta 8 de «Cuentas y comunidad» en specs/preguntas-abiertas.md.
- [ ] T111 [agente] Moderación: banear la cuenta que publica contenido ofensivo (depende de T068) (#111)
  Requerimiento RF-35, especificado en specs/005-cuentas-y-comunidad.
  Decisión 27 de docs/decisiones-de-negocio.md.
  A definir: quién banea, qué pasa con lo que esa cuenta ya publicó y cómo se denuncia un
  contenido (preguntas 13 y 14 de «Cuentas y comunidad» en specs/preguntas-abiertas.md).
  Ver el riesgo R-06 en proyecto/riesgos.yml.

## Lanzamiento 3 · Espacios privados por suscripción

- [ ] T085 [agente] Escuelas de cocina: la app como apoyo para alumnos (depende de T068, T071, T100) (#85)
  Requerimiento RF-41, especificado en specs/006-espacios-privados.
  A definir: qué ve el docente y cómo se agrupan los alumnos (preguntas 5 y 2 de «Espacios
  privados» en specs/preguntas-abiertas.md).
- [ ] T100 [agente] Espacios privados por suscripción para instituciones (depende de T068, T069, T071) (#100)
  Requerimientos RF-40 y RF-43, especificados en specs/006-espacios-privados.
- [ ] T110 [agente] Seguridad del espacio privado: cifrado y garantía de que los datos no se comparten (depende de T100) (#110)
  Requerimiento RF-44, especificado en specs/006-espacios-privados.
  Decisión 19 de docs/decisiones-de-negocio.md.
  A definir: qué se cifra y dónde, quién puede ver qué y cómo se le garantiza por escrito a una
  institución (preguntas 10 y 11 de «Espacios privados» en specs/preguntas-abiertas.md).
- [ ] T112 [agente] Vista de escritorio para el seguimiento de docentes y supervisores, en una dirección aparte (depende de T085, T100) (#112)
  Requerimiento RF-45, especificado en specs/006-espacios-privados.
  Decisión 29 de docs/decisiones-de-negocio.md.

## Más adelante

- [ ] T072 [agente] Ingredientes y utensilios propios (#72)
  Requerimiento RF-52, especificado en specs/002-catalogo-y-poe.
  Datos que nombraba el issue para cada uno: nombre, foto y unidad (pregunta 29 de «Catálogo y
  POE» en specs/preguntas-abiertas.md).
  Hace falta para T071.
- [ ] T073 [agente] Buscar recetas por los ingredientes que tengo (#73)
  Requerimiento RF-52, especificado en specs/002-catalogo-y-poe.
  Con el catálogo que la app ya trae alcanza para las recetas propias del repositorio: no
  necesita servidor.
  El issue pedía mostrar las recetas que salen con lo marcado y las que salen «con uno o dos
  más»; la especificación dice todas las demás, con lo que les falta. Es la pregunta 49 de
  «Catálogo y POE» en specs/preguntas-abiertas.md.
- [ ] T076 [agente] Tabla de posiciones por ranking (depende de T068) (#76)
  Requerimiento RF-24, especificado en specs/004-progreso-y-juego.
  Se arma a partir de la experiencia que la app ya calcula (web/src/progreso/xp.ts), que premia
  la precisión y no la velocidad.
- [ ] T077 [agente] Videos en los pasos de la receta (depende de T070) (#77)
  Requerimiento RF-20, especificado en specs/003-cocinar.
  A decidir: dónde se alojan los videos y cómo se ven en la tarjeta del paso (pregunta 14 de
  «Cocinar» en specs/preguntas-abiertas.md). YouTube embebido choca con la política de seguridad
  de contenido de hoy (specs/001-base-del-sistema/plan.md); un archivo propio pesa.
- [ ] T078 [agente] Costo de los ingredientes y de la receta (depende de T108) (#78)
  Requerimiento RF-06b, especificado en specs/002-catalogo-y-poe.
  No se muestra ningún costo hasta que exista la integración con supermercados (decisión 22 de
  docs/decisiones-de-negocio.md).
  El issue pedía el precio de cada ingrediente en la ficha y el costo total de la porción; la
  especificación lo tiene sin decidir (pregunta 21 de «Catálogo y POE» en
  specs/preguntas-abiertas.md).
  Es la base de T080 y de T082.
- [ ] T079 [agente] Imprimir la receta (#79)
  Requerimiento RF-10, especificado en specs/002-catalogo-y-poe.
  Cada receta del catálogo ya tiene su planilla imprimible, en HTML y en PDF, en data/recetas/.
  Falta el botón en la app que la abra, y que las recetas de los usuarios (T071) generen la suya
  (defecto en RF-10 de proyecto/estado.yml).
- [ ] T080 [agente] Comprar los ingredientes en el supermercado online más cercano (depende de T078, T108) (#80)
  Requerimiento RF-53, especificado en specs/002-catalogo-y-poe.
  Armar el carrito con los ingredientes de la receta en un supermercado con compra online.
  El issue decía elegir el más cercano por geolocalización; la especificación lo tiene sin
  decidir (pregunta 33 de «Catálogo y POE» en specs/preguntas-abiertas.md).
  Depende también de qué supermercados tengan API o enlaces con carrito prearmado.
- [ ] T081 [agente] Comprar los utensilios en Mercado Libre (#81)
  Requerimiento RF-53, especificado en specs/002-catalogo-y-poe.
  El issue pedía, desde la ficha del utensilio, «un enlace o búsqueda» en Mercado Libre, sin
  elegir entre los dos.
  Mercado Libre tiene API pública y programa de afiliados.
- [ ] T082 [agente] Elegir entre marcas de un ingrediente (#82)
  Requerimientos RF-53 y RF-55, especificados en specs/002-catalogo-y-poe.
  Hoy cada ficha de ingrediente (data/ingredientes/) tiene una sola marca (defecto en RF-53 de
  proyecto/estado.yml).
  El issue pedía que un ingrediente tenga varias marcas, cada una con su foto y su precio, y que
  el usuario elija la suya; la especificación lo tiene sin decidir (pregunta 32 de «Catálogo y
  POE» en specs/preguntas-abiertas.md).
- [ ] T083 [agente] Filtro con sal / sin sal (#83)
  Requerimiento RF-09, especificado en specs/002-catalogo-y-poe.
  Las recetas del catálogo propio son sin sal agregada; el filtro y la marca en la receta hacen
  falta cuando entran las recetas de los usuarios (T071).
- [ ] T084 [agente] Filtro para celíacos (depende de T105) (#84)
  Requerimiento RF-09, especificado en specs/002-catalogo-y-poe; la marca de sin TACC es RF-06d
  (T105).
  El issue pedía marcar sin TACC tanto las recetas como los ingredientes; si la receta lo declara
  o se deduce de sus ingredientes es la pregunta 17 de «Catálogo y POE» en
  specs/preguntas-abiertas.md.
- [ ] T086 [agente] Compartir el progreso en Instagram (#86)
  Requerimiento RF-25, especificado en specs/004-progreso-y-juego.
- [ ] T087 [carlos] Registrar Cocinadas como marca y reservar los dominios (#87)
  Requerimiento RF-60, especificado en specs/001-base-del-sistema.
  Lo que falta, y lo hace Carlos: consultar «Cocinadas» por denominación en el INPI argentino
  (exige iniciar sesión con ARCA), reservar los dominios (libres al 2026-10-09) y presentar la
  solicitud de marca.
  El análisis de los nombres está en RF-60 de la especificación.
  Del comentario de Carlos del 2026-10-09 quedó sin decidir si la app comparte marca con la
  consultoría: pregunta 17 de «Toda la app» en specs/preguntas-abiertas.md.
- [ ] T097 [agente] Manejar la cocina con la voz, para cuando las manos están sucias (#97)
  Requerimiento RF-16, especificado en specs/003-cocinar.
- [ ] T108 [agente] Integración con supermercados: precios actuales y alta de supermercados por un administrador (#108)
  Requerimientos RF-54 y RF-56, especificados en specs/002-catalogo-y-poe. Es la base de RF-06b
  (T078), de RF-53 (T080) y de RF-55.
  Decisión 22 de docs/decisiones-de-negocio.md: en el primer lanzamiento no se muestran costos.
  Antes de empezar: discutir con Carlos cómo se hace la integración para que un administrador
  agregue supermercados. No está definido (pregunta 36 de «Catálogo y POE» en
  specs/preguntas-abiertas.md).
- [ ] T109 [agente] Variantes de la receta seleccionables y combinables: sin sal, cero desperdicio y porciones (depende de T070) (#109)
  Requerimientos RF-08 y RF-08a, especificados en specs/002-catalogo-y-poe.
  Decisión 26 de docs/decisiones-de-negocio.md. En la primera versión no están esos selectores.
  A definir: cómo declara una receta sus variantes, cómo cambia con cada combinación (cantidades,
  pasos y tiempos) y cómo convive con el modo de preparación fácil o difícil, que ya es un
  selector (preguntas 24 y 25 de «Catálogo y POE» en specs/preguntas-abiertas.md).

## Sin etapa

- [x] T114 [agente] Un pedido de Carlos que cambia cómo se ve o se comporta algo se escribe en la documentación antes de programarlo (estimación 1h) (#114)
- [x] T115 [agente] Flujo de siete pasos con compuerta, y las tareas pasan de los issues a tasks.md
- [x] T116 [agente] Pasar a la documentación lo que decían los issues y cerrarlos
- [x] T117 [agente] Preparar el proyecto para sesiones de Claude Code en la nube
- [x] T118 [agente] Revisión de tipos y linter después de cada edición
- [x] T119 [agente] En la nube, un dominio que no está permitido se le pide a Carlos
- [x] T120 [agente] Las sesiones en la nube suben a main sin preguntar por su rama
