# Contrato del catálogo: receta (POE), ingrediente y utensilio

El catálogo es contenido, no código (principio VIII de la constitución): las recetas, los
ingredientes y los utensilios se escriben como datos y la app los lee tal cual. Este
documento es el formato de esos datos. Describe el **esquema 1**; las declaraciones que
agrega RF-05 están al final, con sus preguntas abiertas.

## 1. Reglas generales

- **Una receta, varias versiones.** Un plato tiene una o más versiones (modos de
  preparación). Cada versión es un documento de datos completo y autónomo: repite los datos
  del plato y trae sus propias etapas.
- **Tres formas de cada versión.** Cada versión existe como planilla para imprimir
  (documento editable), como PDF de esa planilla y como datos. Las tres tienen que decir lo
  mismo: si se corrige una, se corrigen las otras. Los datos son lo que la app usa para
  armar la línea de tiempo, los cronómetros y las alarmas.
- **Una versión nunca se pisa con otra distinta.** Una variante nueva del mismo plato se
  agrega con el número siguiente y su propia clave.
- **Tiempos.** Todos los tiempos van en segundos enteros, en campos con sufijo `_s`.
- **Identificadores.** En minúsculas, sin acentos, con las palabras separadas por guiones.
  Son estables: la app guarda datos contra ellos. El identificador de un ingrediente o de
  un utensilio es el de su ficha en el catálogo.
- **Sin ficha.** Un `id` en `null` significa que el elemento no tiene ficha en el catálogo
  (agua, un bol, un plato): se muestra por su `nombre`, sin foto.
- **Texto.** Todo en castellano. Las cantidades se escriben como se imprimen, con
  fracciones tipográficas y abreviaturas («½ cdta», «1½ cda (22 ml)»); hacerlas legibles
  en pantalla es tarea de la app (ver [ux.md](../ux.md)), los datos no se tocan.
  `cdta` es una cucharadita de té (5 ml) y `cda`, una cuchara sopera (15 ml).

## 2. Receta (una versión)

### 2.1 Raíz

| Campo | Tipo | Obligatorio | Contenido |
|---|---|---|---|
| `esquema` | número | sí | Versión de este contrato: `1` |
| `plato` | texto | sí | Identificador del plato, compartido por todas sus versiones. Nombre corto con los ingredientes principales (`spaghetti-integral-brocoli-camarones`) |
| `version` | objeto | sí | Ver 2.2 |
| `nombre` | texto | sí | Título completo del plato |
| `momento` | texto | sí | Momento del día: `almuerzo`, `cena`… |
| `porciones` | número | sí | Para cuántas porciones rinde |
| `sal_agregada_g` | número | sí | Gramos de sal agregada |
| `tiempo_total_s` | número | sí | Tiempo total de la versión. Es exactamente la suma de las duraciones de sus etapas |
| `tiempo_total_texto` | texto | sí | Cómo declara el total la planilla («11 min de preparación + 10 min de cocción») |
| `nutricion` | objeto | sí | Valores por porción: `kcal`, `proteina_g`, `fibra_g`, `sodio_mg` |
| `fuentes` | objeto | sí | Ver 2.3 |
| `ingredientes` | lista | sí | Ver 2.4 |
| `utensilios` | lista | sí | Ver 2.5 |
| `sobrantes` | texto | sí | Qué se guarda y cómo, para repetir el plato |
| `etapas` | lista | sí | Una por reloj. Ver 2.6 |
| `criterios` | lista de objetos | sí, no vacía | La sección «Criterios de diseño» de la planilla: un objeto `{ "titulo", "texto" }` por criterio, en el mismo orden y con el mismo texto |
| `seguridad` | lista de textos | sí, no vacía | Las reglas de seguridad y conservación de la planilla, una por elemento |

Los datos del plato (`plato`, `nombre`, `momento`, `porciones`, `nutricion`, la foto, los
ingredientes y sus cantidades) son los mismos en todas las versiones de un plato: un modo
cambia el orden y el tiempo, no el plato.

### 2.2 `version` (modo de preparación)

| Campo | Tipo | Contenido |
|---|---|---|
| `numero` | número | 1, 2, 3… Único dentro del plato |
| `clave` | texto | Identificador del modo dentro del plato (`linea-de-tiempo`, `dos-etapas`) |
| `titulo` | texto | Nombre corto tal como lo muestra la app («Flujo continuo», «Mise en place primero») |
| `resumen` | texto | Una o dos oraciones que explican qué cambia en este modo |
| `icono` | texto | Un solo emoji que identifica el modo en su tarjeta (⚡ para el flujo continuo, 🎯 para la mise en place primero) |

Los dos modos del catálogo propio:

- `linea-de-tiempo`: un solo reloj desde abrir el freezer hasta emplatar, con el máximo
  solapamiento de tareas. Una sola etapa.
- `dos-etapas`: una etapa de preparación, sin vigilancia, y una de cocción y plato, con
  vigilancia, cada una con su propio reloj.

La app ordena las versiones de un plato de la más lenta a la más rápida y propone la más
lenta. La dificultad no se declara: la más lenta es la fácil y las demás, las difíciles.

### 2.3 `fuentes`

| Campo | Contenido |
|---|---|
| `html` | Nombre del documento de la planilla para imprimir de esta versión |
| `pdf` | Nombre del PDF de esa planilla |
| `foto` | Nombre de la foto del plato terminado |

Los tres documentos existen y se guardan junto a los datos de la versión. La planilla, el
PDF y los datos de una versión comparten el mismo nombre base:
`<plato>-v<numero>-<clave>`.

**Foto del plato:** una por plato, compartida por todas sus versiones. JPEG o WebP, sin
transparencia, cuadrada o casi, de al menos 800 px de lado y menos de 300 KB.

### 2.4 Ingrediente de la receta

`{ "id", "nombre", "cantidad", "preparacion" }`

| Campo | Contenido |
|---|---|
| `id` | Identificador de la ficha del ingrediente, o `null` si no tiene ficha |
| `nombre` | Cómo lo llama la planilla, marca incluida («Camarones cocidos congelados Superbe») |
| `cantidad` | Texto tal como se imprime («125 g (½ bolsa)») |
| `preparacion` | El estado en que entra al plato («Laminados 5 mm») |

### 2.5 Utensilio de la receta

`{ "id", "nombre", "uso" }`

| Campo | Contenido |
|---|---|
| `id` | Identificador de la ficha del utensilio, o `null` si no tiene ficha |
| `nombre` | Cómo lo llama la planilla. Puede ser más específico que la ficha («Tabla de corte verde» apunta a la ficha del juego de tablas) |
| `uso` | Para qué se usa y cómo en esta receta |

### 2.6 Etapa

| Campo | Tipo | Contenido |
|---|---|---|
| `id` | texto | `e1`, `e2`… Es el prefijo de los identificadores de sus pasos y procesos |
| `numero` | número | Como en la planilla |
| `nombre` | texto | Como en la planilla («Etapa 2 · Cocción y plato») |
| `vigilancia` | booleano | `false` si pasarse de tiempo no altera el plato: la app tranquiliza en vez de alarmar |
| `duracion_s` | número | Duración prevista de la etapa |
| `arranque` | texto | Cuándo arranca el reloj, en palabras («Al abrir el freezer.») |
| `cierre` | texto | Cuándo termina, en palabras |
| `pausa_despues` | texto o `null` | Las condiciones de la pausa que puede haber al terminar la etapa, o `null` si no puede haber pausa |
| `procesos` | lista | Lo que corre solo mientras las manos hacen otra cosa. Ver 2.8 |
| `pasos` | lista | El trabajo de manos, en orden. Ver 2.7 |

### 2.7 Paso (trabajo de manos)

| Campo | Tipo | Contenido |
|---|---|---|
| `id` | texto | `e1-p3`: el `id` de la etapa, un guion y el paso. Estable: los tiempos reales de cada cocinada se guardan contra este identificador |
| `inicio_s` | número | Segundo previsto de inicio, contado desde el arranque de la etapa |
| `duracion_s` | número | Duración prevista |
| `titulo` | texto | El título del paso en la planilla |
| `acciones` | lista de textos, no vacía | Las viñetas de «Qué hacer», una oración cada una. La app las muestra como sub-pasos para tildar |
| `critico` | booleano | `true` si pasarse de tiempo arruina algo (dorado, vapor, pasta, proteico, mantecatura) |
| `espera` | booleano | `true` si el paso es una espera sin tarea («Espera libre», «Esperar el vapor») |
| `ingredientes` | lista de textos | Identificadores de los ingredientes que se usan en el paso; la app muestra sus fotos |
| `utensilios` | lista de textos | Identificadores de los utensilios que se usan en el paso |
| `inicia_procesos` | lista de textos | Identificadores de los procesos de la etapa que arrancan al terminar este paso |
| `por_que` | objeto | `etiquetas`: lista con valores de `NUTRICIÓN`, `DESPERDICIO`, `TIEMPO`, `SEGURIDAD`, `SABOR`. `texto`: el porqué. Es solo referencia |

Los pasos de una etapa van en orden y no se solapan. Cada paso empieza donde termina el
anterior, salvo que haya un proceso de por medio: entonces puede quedar un hueco entre los
dos. El último paso termina exactamente al final de la etapa. Cuando la planilla no tiene
una fila propia para una espera que la app necesita mostrar, se agrega un paso con
`espera: true` y se aclara en `por_que.texto` que deriva de la planilla.

### 2.8 Proceso (corre solo)

| Campo | Tipo | Contenido |
|---|---|---|
| `id` | texto | `e2-pasta`: el `id` de la etapa, un guion y un nombre |
| `nombre` | texto | Cómo lo muestra la app («Brócoli tapado · no destapar») |
| `tipo` | texto | `frio` (descongelado), `calor` (algo calentándose o dorándose), `hervor`, `tapado` o `reposo`. Define el color y el ícono |
| `inicio_s`, `fin_s` | número | Dentro de la etapa: `0 ≤ inicio_s < fin_s ≤ duracion_s` de la etapa |
| `critico` | booleano | `true` si al vencer hay que actuar de inmediato; `false` si puede esperar |
| `ingrediente` | texto o `null` | Identificador del ingrediente cuya foto lo representa |
| `utensilio` | texto o `null` | Identificador del utensilio cuya foto lo representa. Opcional: si no está, vale `null` |
| `nota` | texto | Una oración de aclaración: qué no hacer, qué pasa si se demora |
| `al_terminar` | texto o `null` | Identificador del paso que hay que hacer cuando el proceso vence |

Cada proceso es un carril paralelo de la línea de tiempo.

### 2.9 Validación

Una versión es válida, y entra al catálogo, solo si cumple todo esto:

1. `esquema` es `1`.
2. El nombre base de sus documentos es `<plato>-v<numero>-<clave>` y se guarda con las
   demás versiones del mismo `plato`.
3. Existen la planilla, el PDF y la foto que declara `fuentes`, y la foto es JPEG o WebP.
4. `version.icono` no está vacío; `criterios` y `seguridad` no están vacíos, y cada
   criterio tiene `titulo` y `texto`.
5. Todo `id` no nulo de `ingredientes` y de `utensilios` existe como ficha del catálogo.
6. Todo identificador de ingrediente o utensilio que nombra un paso o un proceso está en la
   lista de la receta.
7. Los identificadores de pasos y procesos empiezan con el `id` de su etapa.
8. Los pasos de cada etapa no se solapan y el último termina con la etapa.
9. Todo paso tiene al menos una acción y solo etiquetas conocidas.
10. Todo proceso tiene un `tipo` conocido y queda dentro de su etapa.
11. `inicia_procesos` y `al_terminar` apuntan a identificadores que existen en la misma
    etapa.
12. `tiempo_total_s` es la suma de las duraciones de las etapas.

### 2.10 Ejemplo

Tomado de una receta real del catálogo, abreviado (`…` marca lo omitido).

```json
{
  "esquema": 1,
  "plato": "spaghetti-integral-brocoli-camarones",
  "version": {
    "numero": 2,
    "clave": "dos-etapas",
    "titulo": "Mise en place primero",
    "resumen": "Primero se prepara todo sin apuro; después se cocina concentrado, con una sola cosa que mirar por vez. Entre las dos etapas puede haber pausa.",
    "icono": "🎯"
  },
  "nombre": "Spaghetti integral con brócoli, champiñones y camarones al limón",
  "momento": "cena",
  "porciones": 1,
  "sal_agregada_g": 0,
  "tiempo_total_s": 1260,
  "tiempo_total_texto": "11 min de preparación + 10 min de cocción",
  "nutricion": { "kcal": 720, "proteina_g": 38, "fibra_g": 17, "sodio_mg": 250 },
  "fuentes": {
    "html": "spaghetti-integral-brocoli-camarones-v2-dos-etapas.html",
    "pdf": "spaghetti-integral-brocoli-camarones-v2-dos-etapas.pdf",
    "foto": "spaghetti-integral-brocoli-camarones.jpg"
  },
  "ingredientes": [
    { "id": "camarones-congelados", "nombre": "Camarones cocidos congelados Superbe", "cantidad": "125 g (½ bolsa)", "preparacion": "Congelados; se descongelan en la etapa 1, paso 0:00" },
    { "id": null, "nombre": "Agua", "cantidad": "0,8 L", "preparacion": "Para la pasta (8:1)" }
  ],
  "utensilios": [
    { "id": "tablas-tramontina-mix-25099940", "nombre": "Tabla de corte verde", "uso": "Todo lo que se corta es vegetal" },
    { "id": null, "nombre": "1 plato hondo", "uso": "Servicio" }
  ],
  "sobrantes": "Medio brócoli, medio limón, champiñones y cherry a la heladera para repetir el plato al día siguiente; la media bolsa de camarones vuelve cerrada al freezer.",
  "criterios": [{ "titulo": "Criterio principal: dos etapas", "texto": "…" }],
  "seguridad": ["Tabla y cuchillo solo tocan vegetales; los camarones van del bol al wok volcándolos, sin utensilio."],
  "etapas": [
    {
      "id": "e1",
      "numero": 1,
      "nombre": "Etapa 1 · Preparación",
      "vigilancia": false,
      "duracion_s": 660,
      "arranque": "Al abrir el freezer.",
      "cierre": "Termina a 11:00. La etapa 2 empieza cuando el agua del jarro rompe hervor.",
      "pausa_despues": "Puede haber pausa. Si supera 30 min: …",
      "procesos": [
        {
          "id": "e1-camarones",
          "nombre": "Camarones en agua fría",
          "tipo": "frio",
          "inicio_s": 0,
          "fin_s": 600,
          "critico": false,
          "ingrediente": "camarones-congelados",
          "nota": "Listos a las 10:00. No usar agua tibia. Si tarda más, no pasa nada: pueden esperar en el agua fría.",
          "al_terminar": "e1-p9"
        }
      ],
      "pasos": [
        {
          "id": "e1-p1",
          "inicio_s": 0,
          "duracion_s": 30,
          "critico": false,
          "espera": false,
          "titulo": "Pesar y poner a descongelar los camarones",
          "acciones": ["Poner el bol vacío en la balanza y tarar.", "…"],
          "ingredientes": ["camarones-congelados"],
          "utensilios": ["balanza-masuya-sf400"],
          "inicia_procesos": ["e1-camarones"],
          "por_que": { "etiquetas": ["SEGURIDAD", "DESPERDICIO"], "texto": "En agua fría el producto se mantiene por debajo de 5 °C mientras descongela. …" }
        }
      ]
    },
    { "id": "e2", "numero": 2, "nombre": "Etapa 2 · Cocción y plato", "vigilancia": true, "duracion_s": 600, "arranque": "El reloj arranca cuando el agua rompe hervor y todo lo de la etapa 1 está junto al wok.", "cierre": "Listo a 10:00.", "pausa_despues": null, "procesos": ["…"], "pasos": ["…"] }
  ]
}
```

## 3. Ingrediente (ficha del catálogo)

Una ficha por ingrediente o producto concreto. Registra únicamente la identidad, el estado,
el formato y las características del producto o de su envase; las cantidades y la
preparación son de cada receta.

- **Identificador:** el nombre de la ficha (`brocoli-entero`, `camarones-congelados`,
  `champinones-blancos-el-mercado-200g`). Es el que usan las recetas. No se renombra una
  ficha que alguna receta usa sin actualizar esa receta.
- **Categoría:** cada ficha pertenece a una: frescos, congelados, secos y envasados,
  refrigerados y al vacío, o especias y condimentos.
- **Nombre para mostrar:** el título de la ficha.
- **Foto:** la primera imagen que enlaza la ficha es la principal. Una ficha puede enlazar
  varias tomas (frente, dorso, información nutricional). Una ficha sin foto se muestra con
  su nombre y un marcador vacío.

Contenido de la ficha, cuando el dato está disponible:

| Sección | Datos |
|---|---|
| Características | Categoría, marca, producto o variedad, presentación, formato, estado, tratamiento (cocido, blanqueado…), temperatura de conservación, origen, fabricante, código de barras |
| Características adicionales | Ingredientes declarados, alérgenos declarados, información nutricional visible en el envase (por porción: valor energético, carbohidratos, proteínas, grasas totales, grasas saturadas, fibra alimentaria, sodio) |
| Foto del envase | La imagen enlazada |
| Fuente | De dónde salen los datos, si no es el envase |

Ejemplo, de una ficha real:

```markdown
# Camarones pelados cocidos congelados

![Envase del producto](../fotos-envases/camarones-superbe-250g-frente.jpg)

| Característica | Dato |
|---|---|
| Categoría | Congelados / pescados y mariscos |
| Marca | Superbe |
| Producto | Camarones pelados cocidos congelados |
| Presentación | 250 g |
| Estado | Congelado |
| Tratamiento del producto | Pelados y cocidos |
| Código de barras | 7798146700238 |
| Temperatura de mantenimiento | -18 °C |
| Origen declarado | Ecuador |

## Información nutricional declarada

Valores por porción de 125 g:

| Nutriente | Valor |
|---|---:|
| Valor energético | 132,14 kcal / 552 kJ |
| Proteínas | 15,13 g |
| Sodio | 67,86 mg |
```

Las fotos de envases se nombran por producto, marca y presentación, con la toma al final
(`-frente`, `-dorso`, `-informacion-nutricional`).

## 4. Utensilio (ficha del catálogo)

Una ficha por utensilio o equipo de cocina, con sus especificaciones reales. Las recetas se
diseñan respetando esas capacidades.

- **Identificador:** el nombre de la ficha, con tipo, marca y medida cuando corresponde
  (`wok-eternity-copper-30cm`, `jarro-slow-fire-2l`). Sin prefijos ni sufijos genéricos:
  tiene que poder escribirse en una receta tal cual. No se renombra una ficha que alguna
  receta usa sin actualizar esa receta.
- **Nombre para mostrar:** el título de la ficha.
- **Recursos fijos:** los de la cocina también tienen ficha (`cocina-4-hornallas-a-gas`).
- **Juegos:** un juego de piezas con un solo envase tiene una sola ficha (el juego de
  cuatro tablas de color es una ficha; la receta nombra «Tabla de corte verde»).
- **Foto:** la primera imagen que enlaza la ficha es la principal. Se nombra con el
  identificador de la ficha y la toma (`-frente` la principal, sobre fondo claro y sin
  sombras fuertes; `-detalle`, `-tapa`, `-caja` las secundarias).
- **Manual:** si el equipo tiene manual de usuario, se guarda con el catálogo.

Contenido de la ficha:

| Sección | Datos |
|---|---|
| Especificaciones | Marca, tipo, capacidad, diámetro, altura, material, fondo, cocinas compatibles, tapa incluida o no, revestimiento, apto lavavajillas. Es informativa |
| Incluye | Las piezas y accesorios |
| Foto | La imagen enlazada |

Ejemplo, de una ficha real:

```markdown
# Jarro hervidor Slow Fire 2 L

| Especificación | Dato |
|---|---|
| Marca | Slow Fire |
| Tipo | Jarro hervidor para hornalla |
| Capacidad | 2 L |
| Diámetro | 14,5 cm |
| Material | Acero inoxidable |
| Tapa | No incluye |

## Incluye

- 1 jarro hervidor de 2 L con asa integrada.
```

## 5. Lo que agregan los requerimientos al contrato

El esquema 1 no alcanza para todos los requerimientos de la capacidad. Cada punto que sigue
cambia el contrato cuando se responda su pregunta en [spec.md](../spec.md); el número de
`esquema` sube con el cambio.

| Requerimiento | Qué tiene que poder declararse | Cómo lo expresa el esquema 1 |
|---|---|---|
| RF-05 | Por tarea: si se cronometra | No se declara: todo paso y todo proceso tiene duración. `espera` marca los pasos sin tarea |
| RF-05 | Por tarea: si pasarse arruina el plato o solo demora | `critico` en el paso y en el proceso, y `vigilancia` en la etapa entera |
| RF-05 | Por tarea: si tiene un tiempo mínimo y cuál | No se declara. Un reposo es un proceso de tipo `reposo` y su mínimo va en palabras en `nota` |
| RF-05 | Por tarea: con cuáles corre en paralelo | Se deduce: los procesos se solapan con los pasos por sus tiempos, y `inicia_procesos` y `al_terminar` los enlazan |
| RF-06c | Valores nutricionales completos | `nutricion` trae cuatro: `kcal`, `proteina_g`, `fibra_g`, `sodio_mg` |
| RF-06d | Si tiene TACC | No se declara |
| RF-06e | Octógonos de advertencia | No se declaran; para calcularlos, `nutricion` no trae azúcares ni grasas |
| RF-06b, RF-54 | Costo | No se declara; el precio no es parte de la receta, sale de la integración |
| RF-08, RF-08a | Variantes: sin sal, cero desperdicio, porciones | `porciones` y `sal_agregada_g` son un valor fijo por versión |
| RF-52 | Ingredientes y utensilios propios | Las fichas son las del catálogo propio |
| RF-53, RF-55 | Varias marcas o lugares para un mismo ingrediente | Cada ficha es un producto de una marca |
