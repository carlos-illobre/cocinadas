# Capas de la pantalla de inicio

Los originales que exportó Carlos: diez capas sobre un mismo lienzo de 1414 × 2000, ya
alineadas entre sí (la 1 es el fondo de pizarra, las demás son los vegetales con
transparencia). Están en PNG y en SVG; los SVG son el mismo PNG embebido en base64, así
que pesan más y no aportan nada vectorial.

Lo que usa la app son las versiones livianas en
`microservices/frontend/public/inicio/`: el fondo en JPEG y los vegetales en WebP, a
1000 px de ancho. Las diez juntas pesan 407 KB en vez de 5,3 MB.

Para regenerarlas después de cambiar un original, con Chrome instalado:

```
node docs/mockups/inicio-capas/optimizar.mjs <carpeta-con-los-png> <carpeta-de-salida>
```
