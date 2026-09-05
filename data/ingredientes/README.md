# Catálogo base de ingredientes

Esta carpeta contiene los ingredientes disponibles para futuras recetas. Las fichas registran únicamente la identidad, el estado, el formato y las características del producto o del envase.

## Organización

- `frescos/`: frutas, verduras y otros alimentos frescos.
- `congelados/`: productos congelados, blanqueados o listos para cocinar.
- `secos-y-envasados/`: pastas, arroz y otros productos de paquete.
- `refrigerados-y-al-vacio/`: carnes y otros productos refrigerados envasados al vacío.
- `especias-y-condimentos/`: hierbas y especias.
- `fotos-envases/`: imágenes de los envases vinculadas desde sus fichas.

## Criterio de registro

Usar un archivo Markdown por ingrediente o producto concreto. Cada ficha debe incluir, cuando estén disponibles:

- Nombre del producto.
- Categoría, estado y formato.
- Marca, variedad y presentación.
- Material o tipo de envase.
- Tratamientos aplicados, como cocido o blanqueado.
- Temperatura de conservación.
- Origen, fabricante, código de barras e información nutricional visible.
- Foto del envase, vinculada mediante una ruta relativa.

## Identificador y detección automática

- El nombre del archivo de la ficha, sin `.md`, es el **identificador** del ingrediente (`brocoli-entero`, `camarones-congelados`, `tallarines-en-paquete`). Es el que usan los JSON de las recetas (`data/recetas/esquema-receta.md`). Minúsculas, sin acentos, guiones entre palabras.
- La app recorre las subcarpetas de categoría y toma cada `.md` como un ingrediente. Ignora `README.md`, `indice-ingredientes.md` y `plantilla-*.md`.
- La foto se resuelve **desde la ficha**: la app usa la primera imagen Markdown enlazada (`![...](../fotos-envases/archivo.jpg)`). Por eso el nombre de la foto puede seguir describiendo producto, marca y presentación, y una ficha puede enlazar varias tomas (frente, dorso, información nutricional): la primera es la principal.
- Una ficha sin foto se muestra con su nombre y un marcador vacío; conviene dejar la sección "Foto del envase" con la nota "Pendiente".
- No renombrar una ficha ya usada por alguna receta sin actualizar su JSON; `python data/recetas/validar-receta.py` lo detecta.
