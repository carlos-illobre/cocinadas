# Catálogo de utensilios y equipos

Una ficha Markdown por utensilio o equipo de cocina, con sus especificaciones reales (capacidad, diámetro, tapa incluida o no, materiales, accesorios). Las recetas se diseñan respetando estas capacidades.

## Convención de nombres

- El nombre del archivo es el **identificador** del utensilio: minúsculas, sin acentos, palabras separadas por guiones, con tipo, marca y medida cuando corresponda. Ejemplos: `wok-eternity-copper-30cm`, `jarro-slow-fire-2l`, `cuchillo-boker-arbolito-chef-ii-8308`.
- Sin prefijos ni sufijos genéricos (`ficha-`, `cocinero-`): el identificador tiene que poder escribirse en el JSON de una receta tal cual.
- Los recursos fijos de la cocina también tienen ficha (`cocina-4-hornallas-a-gas`).
- Un juego de piezas con un solo envase tiene una sola ficha (`tablas-tramontina-mix-25099940` cubre las cuatro tablas de color).
- No se renombra una ficha ya referenciada por alguna receta sin actualizar el JSON de esa receta (`python data/recetas/validar-receta.py` lo detecta).

## Fotos

Van en `fotos/` y se enlazan desde la ficha con una imagen Markdown de ruta relativa, igual que los ingredientes:

```
![Wok Eternity Copper 30 cm](fotos/wok-eternity-copper-30cm-frente.jpg)
```

La app toma la **primera imagen enlazada** en la ficha como foto principal. Ver `fotos/README.md` para la convención de nombres de las fotos.

## Qué lee la app

- Recorre esta carpeta (sin subcarpetas) y toma cada `.md` como un utensilio, salvo `README.md`.
- El título de nivel 1 (`# ...`) es el nombre para mostrar.
- La tabla de especificaciones es informativa; la foto sale del primer enlace de imagen.
