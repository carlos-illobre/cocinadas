# Capas de la pantalla de inicio

Los originales que exportó Carlos: once capas sobre un mismo lienzo de 1414 × 2000, ya
alineadas entre sí (la 1 es el fondo de pizarra, las demás son los vegetales con
transparencia). Las diez primeras están en PNG y en SVG; los SVG son el mismo PNG
embebido en base64, así que pesan más y no aportan nada vectorial.

La 11 (los dientes de ajo de abajo a la izquierda) llegó con fondo blanco y con la sombra
de la foto. `quitar-fondo.mjs` la recorta: aplana sobre blanco, marca como fondo lo claro
y sin color empezando desde los bordes (así los brillos claros de adentro del ajo no se
pierden), encoge un poco el borde para llevarse la sombra y le devuelve su color quitando
el blanco que traía mezclado, que es lo que dejaría un halo sobre la pizarra.

```
node docs/mockups/inicio-capas/quitar-fondo.mjs <carpeta-origen> 11.png <carpeta-de-salida>
```

Nunca pisa el archivo de entrada: deja `11-sin-fondo.png` al lado, para mirar el recorte,
y el `11.webp` que usa la app.

Lo que usa la app son las versiones livianas en
`microservices/frontend/public/inicio/`: el fondo en JPEG y los vegetales en WebP, a
1000 px de ancho. Las once juntas pesan 425 KB.

Para regenerarlas después de cambiar un original, con Chrome instalado:

```
node docs/mockups/inicio-capas/optimizar.mjs <carpeta-con-los-png> <carpeta-de-salida>
```
