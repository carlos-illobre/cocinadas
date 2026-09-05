# Recetas

Cada plato tiene su propia carpeta. Dentro van todas las versiones de ese plato, cada una como HTML (fuente editable) + PDF (para imprimir).

## Convención

```
data/recetas/
  README.md
  <plato>/
    <plato>-v1-linea-de-tiempo.html
    <plato>-v1-linea-de-tiempo.pdf
    <plato>-v2-dos-etapas.html
    <plato>-v2-dos-etapas.pdf
    <plato>-v1-linea-de-tiempo.json
    <plato>-v2-dos-etapas.json
    <plato>.jpg
```

- `<plato>`: nombre corto en minúsculas, sin acentos, palabras separadas por guiones, con los ingredientes principales (p. ej. `spaghetti-integral-brocoli-camarones`, `merluza-...`, `bife-de-chorizo-...`).
- `v1-linea-de-tiempo`: un solo reloj desde abrir el freezer hasta emplatar, con máximo solapamiento de tareas.
- `v2-dos-etapas`: etapa 1 de preparación (sin vigilancia) + etapa 2 de cocción y plato (con vigilancia), cada una con su propio reloj.
- Si aparece otra variante del mismo plato, se agrega como `v3-<criterio>` en la misma carpeta; nunca se sobrescribe una versión anterior con otra distinta.
- El HTML es la fuente del documento impreso: cualquier corrección se hace ahí y se vuelve a generar el PDF.
- Cada versión lleva además un **JSON con el mismo nombre base** (`esquema-receta.md` describe su contenido). Es lo que lee la app de cocina: pasos con minuto de inicio y duración, procesos que corren solos (carriles paralelos y alarmas), ingredientes y utensilios por identificador de ficha. La app detecta una receta por la existencia de ese JSON. HTML y JSON tienen que decir lo mismo: si se corrige uno, se corrige el otro.
- `<plato>.jpg` es la **foto del plato terminado**, una por plato y compartida por todas sus versiones. La app la usa en la lista de recetas y en la portada. JPEG (o WebP), sin transparencia, cuadrada o casi, de al menos 800 px de lado y menos de 300 KB; cada JSON la referencia en `fuentes.foto`.
- `python data/recetas/validar-receta.py` comprueba todos los JSON: identificadores existentes, tiempos coherentes, archivos fuente presentes. Correrlo antes de dar por terminada una receta.

## Platos

- `spaghetti-integral-brocoli-camarones/`: spaghetti integral con brócoli entero, champiñones y camarones al limón (cena; 1 porción; v1 16 min, v2 11 + 10 min).
