# Esquema del archivo de datos de una receta (`esquema: 1`)

Cada versión de una receta tiene, junto a su HTML y su PDF, un archivo JSON con el mismo nombre base:

```
data/recetas/<plato>/<plato>-v<N>-<clave>.json
```

La app detecta una receta por la existencia de ese JSON. El HTML y el PDF son la versión imprimible; el JSON es lo que la app usa para armar la línea de tiempo, los cronómetros y las alarmas. Tienen que decir lo mismo: si se corrige uno, se corrige el otro.

Todos los tiempos van en **segundos enteros** con sufijo `_s`. Los identificadores (`id`) son el nombre de archivo de la ficha correspondiente sin la extensión `.md` (ver `data/ingredientes/README.md` y `data/utencillos/README.md`). Un `id` en `null` significa que el elemento no tiene ficha (agua, un bol, un plato): la app lo muestra por su `nombre`, sin foto.

## Raíz

| Campo | Tipo | Contenido |
|---|---|---|
| `esquema` | número | Versión de este esquema. Hoy `1`. |
| `plato` | texto | Nombre de la carpeta del plato (`spaghetti-integral-brocoli-camarones`). |
| `version` | objeto | `numero` (1, 2…), `clave` (`linea-de-tiempo`, `dos-etapas`…), `titulo` corto tal como lo muestra la app (hoy «Flujo continuo» y «Mise en place primero»), `resumen` de una o dos oraciones que explica qué cambia, e `icono`: un solo emoji que identifica el modo en la tarjeta (hoy ⚡ para el flujo continuo y 🎯 para la mise en place primero). La app ordena las versiones de la más lenta a la más rápida y propone la más lenta. |
| `nombre` | texto | Título completo del plato. |
| `momento` | texto | `almuerzo`, `cena`… |
| `porciones` | número | Rinde. |
| `sal_agregada_g` | número | Gramos de sal agregada (0 salvo carnes rojas). |
| `tiempo_total_s` | número | Suma de las etapas. |
| `tiempo_total_texto` | texto | Cómo se declara el total en el documento. |
| `nutricion` | objeto | `kcal`, `proteina_g`, `fibra_g`, `sodio_mg` por porción. |
| `fuentes` | objeto | Nombres de archivo del `html` y del `pdf` de esta versión, y de la `foto` del plato terminado, todos en la misma carpeta. La foto es una por plato (`<plato>.jpg`), compartida por todas sus versiones; JPEG o WebP, cuadrada o casi, de al menos 800 px de lado. |
| `data/ingredientes` | lista | Ver abajo. |
| `utensilios` | lista | Ver abajo. |
| `sobrantes` | texto | Qué se guarda y cómo, para repetir el plato. |
| `etapas` | lista | Una por reloj. La versión 1 tiene una sola etapa. |
| `criterios` | lista de objetos | La sección «Criterios de diseño» del documento, un objeto `{ "titulo", "texto" }` por criterio, en el mismo orden y con el mismo texto. La app no los muestra hoy: se probaron en la portada y la volvían larguísima. Quedan en el JSON porque son parte de la receta y para tenerlos si algún día hay una pantalla que los merezca. |
| `seguridad` | lista de textos | Las reglas de seguridad y conservación del documento. Como `criterios`, hoy la app no las muestra. |

## Ingrediente

`{ "id", "nombre", "cantidad", "preparacion" }`. `nombre` es como lo llama el documento (marca incluida); `cantidad` es texto tal como se imprime ("125 g (½ bolsa)"); `preparacion` es el estado en que entra al plato.

## Utensilio

`{ "id", "nombre", "uso" }`. `nombre` puede ser más específico que la ficha (por ejemplo "Tabla de corte verde" apunta a la ficha del juego de tablas).

## Etapa

| Campo | Contenido |
|---|---|
| `id` | `e1`, `e2`… Prefijo de los ids de sus pasos y procesos. |
| `numero`, `nombre` | Como en el documento. |
| `vigilancia` | `false` si pasarse de tiempo no altera el plato (la app tranquiliza en vez de alarmar). |
| `duracion_s` | Duración prevista de la etapa. |
| `arranque`, `cierre` | Cuándo arranca y termina el reloj, en palabras. |
| `pausa_despues` | Texto con las condiciones de la pausa, o `null` si no puede haber pausa. |
| `procesos` | Cosas que corren solas mientras las manos hacen otra cosa: cada una es un carril paralelo y una alarma. |
| `pasos` | Trabajo de manos, en orden, sin solaparse entre sí. |

### Paso (trabajo de manos)

| Campo | Contenido |
|---|---|
| `id` | `e1-p3`. Estable: la app guarda los tiempos reales contra este id. |
| `inicio_s`, `duracion_s` | Minuto previsto de inicio dentro de la etapa y duración prevista. El paso siguiente empieza en `inicio_s + duracion_s` salvo que haya un proceso de por medio. |
| `titulo` | Título en negrita del documento. |
| `acciones` | Las viñetas de "Qué hacer", una oración cada una; la app las muestra como sub-pasos tildables. |
| `critico` | `true` si pasarse de tiempo arruina algo (dorado, vapor, pasta, proteico, mantecatura). |
| `espera` | `true` si el paso es una espera sin tarea ("Espera libre", "Esperar el vapor"). |
| `data/ingredientes`, `utensilios` | Ids de lo que se usa en el paso; la app muestra sus fotos. |
| `inicia_procesos` | Ids de los procesos que arrancan al terminar este paso. |
| `por_que` | `etiquetas` (NUTRICIÓN, DESPERDICIO, TIEMPO, SEGURIDAD, SABOR) y `texto`. Solo referencia. |

Si el documento impreso no tiene una fila propia para una espera que la app necesita mostrar, se agrega un paso con `espera: true` y se aclara en `por_que.texto` que es derivado del HTML.

### Proceso (corre solo)

| Campo | Contenido |
|---|---|
| `id` | `e2-pasta`. |
| `nombre` | Cómo lo muestra la app ("Brócoli tapado · no destapar"). |
| `tipo` | `frio` (descongelado), `calor` (algo calentándose o dorándose), `hervor`, `tapado`, `reposo`. Define color e ícono. |
| `inicio_s`, `fin_s` | Dentro de la etapa. |
| `critico` | `true` si al vencer hay que actuar de inmediato (suena alarma fuerte); `false` si puede esperar (aviso suave). |
| `ingrediente`, `utensilio` | Id para la foto, o `null`. |
| `nota` | Una oración de aclaración (qué no hacer, qué pasa si se demora). |
| `al_terminar` | Id del paso que hay que hacer cuando vence, o `null`. |

## Validación

`python data/recetas/validar-receta.py` recorre todos los JSON de `data/recetas/` y comprueba: que los ids de ingredientes y utensilios existan como fichas, que los pasos de cada etapa no se solapen y sumen la duración de la etapa, que los procesos queden dentro de la etapa, que `al_terminar` e `inicia_procesos` apunten a ids existentes, y que los archivos de `fuentes` existan.
