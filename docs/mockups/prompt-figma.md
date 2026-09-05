# Prompt para reproducir el diseño de Templa en Figma

Copiá desde la línea siguiente hasta el final y pegalo en ChatGPT. Adjuntá estos archivos
de la carpeta del proyecto: `docs/mockups/app-cocina-mockup.html` (la referencia visual
exacta, abrila en un navegador para verla), `microservices/frontend/public/logo.png`,
`microservices/frontend/public/icono-512.png`, `microservices/frontend/public/marca.png`,
`microservices/frontend/public/inicio.jpg` (fondo de la pantalla de inicio),
`data/recetas/spaghetti-integral-brocoli-camarones/spaghetti-integral-brocoli-camarones.jpg`
(foto del plato) y, si querés las fotos de ingredientes, la carpeta
`data/ingredientes/fotos-envases/`.

---

Quiero que crees en mi cuenta de Figma un archivo llamado **Templa** con el diseño de una
app móvil, siguiendo al pie de la letra la especificación de abajo. El diseño ya existe como
mockup en HTML (adjunto `app-cocina-mockup.html`; abrilo para ver el resultado esperado):
tu trabajo es reproducirlo en Figma con componentes, estilos y variables reutilizables, no
reinterpretarlo. Donde la especificación y el HTML difieran, manda el HTML.

## 1. Qué es Templa

Una app de celular que guía la preparación de un plato como una **línea de tiempo viva**:
muestra una sola tarea para las manos con su cronómetro, arriba los procesos que corren
solos (descongelado, agua, pasta, brócoli tapado) con cuenta regresiva, y abajo el riel
completo de pasos con carriles de colores que marcan qué corre en paralelo. Al terminar,
guarda los tiempos para mostrar el progreso por receta. Se usa con el celular apoyado en
la mesada, con las manos mojadas, mirando de reojo: todo grande, un solo foco, un solo
botón por pantalla.

Lema: **«Tu receta, al punto justo»**. Eslogan secundario que aparece como texto pequeño:
«Cero desperdicio · sin sal · 1 porción».

## 2. Configuración del archivo

- Frames de **390 × 844** (iPhone 14 / 15), con status bar (hora «9:41», 5G, batería) y
  la isla dinámica dibujada como cápsula negra de 110 × 32 centrada arriba.
- Radio de la pantalla 42. Fondo del teléfono `#0D110F`.
- Creá una página «Sistema» (variables, estilos, componentes) y una página «Pantallas».
- Usá **Auto Layout** en todo, variables de color y estilos de texto con los nombres de
  abajo, y componentes con variantes donde se indica.

## 3. Variables de color (nombres exactos)

| Variable | Hex | Uso |
|---|---|---|
| `ground` | #F3F5EF | Fondo de todas las pantallas claras |
| `paper` | #FFFFFF | Tarjetas |
| `ink` | #16211B | Texto principal, botón primario, trabajo con las manos |
| `muted` | #66736B | Texto secundario, etiquetas |
| `line` | #DDE2D8 | Bordes de tarjetas, círculos vacíos |
| `soft` | #E8ECE3 | Fondos de barras y pestañas, botón secundario |
| `green` | #1E7A4C | Hecho, progreso en etapa tranquila, acento |
| `green-soft` | #DDEFE3 | Fondo de chips verdes, halo de tarjeta seleccionada |
| `coral` | #E0522A | Fuego, tiempo crítico, exceso de tiempo, alarma |
| `coral-soft` | #FBE3DA | Fondos suaves de coral |
| `coral-deep` | #B83E1C | Texto sobre coral-soft |
| `cold` | #3D6CA6 | Proceso frío sin vigilancia (descongelado) |
| `cold-soft` | #DEE8F5 | Fondo del ícono de proceso frío |
| `amber` | #D8951A | Alerta próxima (faltan menos de 30 s) |
| `amber-soft` | #FBEFD2 | Halo de la alerta próxima |

Regla semántica: negro = manos, azul = frío pasivo, coral = fuego/crítico/exceso, ámbar =
por sonar, verde = hecho. El coral y el ámbar nunca se usan como decoración.

## 4. Tipografía (Google Fonts)

- **Bricolage Grotesque** (variable, eje `opsz`) para títulos, números grandes y botones.
- **Instrument Sans** para todo el texto corriente.

Estilos de texto:

| Estilo | Fuente | Tamaño / peso | Notas |
|---|---|---|---|
| `Titulo/Portada` | Bricolage 800 | 27–31 px, line-height 1.02, tracking -3 % | `text-wrap: balance` |
| `Titulo/Pantalla` | Bricolage 700 | 22 px, tracking -2 % | «Paso 2 de 9» |
| `Titulo/Tarjeta` | Bricolage 700 | 21 px | Título de la tarea actual |
| `Numero/Grande` | Bricolage 700 | 58 px, line-height 0.95, tracking -4 %, tabular | Cronómetro |
| `Numero/Total` | Bricolage 700 | 72 px | Tiempo total en el resumen |
| `Numero/Reloj` | Bricolage 600 | 22 px, tabular | Reloj de etapa arriba a la derecha |
| `Numero/Proceso` | Bricolage 600 | 19 px, tabular | Cuenta regresiva de un proceso |
| `Boton` | Bricolage 700 | 16–18 px, tracking -1 % | |
| `Eyebrow` | Instrument Sans 600 | 11 px, mayúsculas, tracking +12 % | color `muted` |
| `Cuerpo` | Instrument Sans 400 | 13.5–14 px, line-height 1.35 | |
| `Secundario` | Instrument Sans 500 | 11.5–12.5 px | color `muted` |
| `Micro` | Instrument Sans 600 | 9.5–10.5 px | cantidades bajo fotos, etiquetas de carril |

Todos los números que se alinean usan cifras tabulares.

## 5. Componentes (con variantes)

1. **Botón** — alto 54 (58 en portada, 62 en alarma), radio 16, texto `Boton`. Variantes:
   `primario` (fondo `ink`, texto blanco), `fuego` (fondo `coral`), `blanco` (fondo blanco,
   texto `coral-deep`, solo en la alarma), `fantasma` (54 × 54, fondo `soft`, para el «?»).
2. **Chip** — píldora radio 999, 6 × 10 de padding, `Secundario` 12 px 600. Variantes:
   `neutro` (paper + borde line), `verde` (green-soft / green), `activo` (ink / blanco).
3. **Tarjeta de proceso** («corre solo») — paper, borde line, radio 14, padding 9/12.
   Grilla: foto circular 38 con insignia de 16 abajo a la derecha (color según tipo), nombre
   14 px 600 + subtítulo 11.5 `muted`, tiempo a la derecha (`Numero/Proceso`) con
   «restante» debajo, y barra de 4 px abajo (fondo `soft`, relleno del color del tipo).
   Variantes por tipo: `frio` (cold), `fuego` (coral), `alerta` (amber: borde amber, halo
   de 3 px amber-soft que **late**, número en amber).
4. **Tarjeta Ahora** — paper, borde line, radio 22, padding 16/18, sombra
   `0 12 28 -18 rgba(22,33,27,.35)`. Contiene: eyebrow en `green` (o `coral` en variante
   `critica`) + rango previsto «0:30 → 3:00» a la derecha; foto circular 44 + título;
   número grande + «de 2:30 previstos»; **barra de progreso** (ver 6); lista de sub-pasos
   con círculo 16 (vacío = borde line; hecho = green con tilde blanco y texto tachado en
   `muted`); fila de botones: primario «Listo, siguiente ✓» + fantasma «?».
5. **Fila del riel** — alto 50, borde superior line, grilla: minuto (12.5 px 600 `muted`) ·
   punto de estado (10 px: vacío borde line / hecho green / actual ink con halo 4 px /
   actual pasado coral con halo coral-soft) · columna de carriles de 22 px · nombre 14 px
   (700 si es actual, `muted` si está hecho, cursiva `muted` si es espera) · desvío a la
   derecha (12 px, tabular: `+0:04` en coral, `−0:06` en green, `0:00` en muted; si titila,
   coral 700).
6. **Carril paralelo** — barra vertical de 5 px, radio 3, del color del proceso (cold o
   coral, opacidad 0.9; un segundo carril a la izquierda con opacidad 0.55), que abarca las
   filas del riel durante las cuales el proceso corre; etiqueta vertical (`Micro`, mayúsculas,
   tracking +10 %) pegada al carril: «CAMARONES 10 MIN», «PASTA 7 MIN».
7. **Barra de progreso de paso** — 8 px, radio 4, fondo `soft`, relleno `green` (o `coral`
   en etapa crítica). **Estado pasado de tiempo**: la escala se agranda para que quepa el
   exceso; lo previsto se comprime hacia una marca vertical de 2 px negra con el tiempo
   previsto encima («1:30», `Micro`), y el tramo sobrante crece en `coral` **titilando**
   (opacidad 1 → 0.25 cada segundo). El número grande muestra el tiempo real y, al lado,
   «+0:12» en coral 26 px titilando.
8. **Segmento de versiones** — fondo `soft`, radio 14, padding 4, dos celdas de 46 de alto,
   radio 11; la elegida en paper con sombra `0 2 6 rgba(22,33,27,.12)` y su línea pequeña
   en `green`. Texto: «Versión 1 · una línea / 16 min · todo a la vez», «Versión 2 · dos
   etapas / 21 min · con pausa».
9. **Fila de ingredientes** — círculos de 44 con foto (borde 1.5 line), cantidad debajo en
   `Micro` («100 g», «½ pieza», «125 g»), y un círculo «+6» en `soft` al final.
10. **Tarjeta de etapa** — paper, borde line (coral-soft si es crítica), radio 18–20, padding
    12–14/14–16: nombre (Bricolage 700 16.5–18) y duración a la derecha; una línea `muted`;
    **mini Gantt** (filas de 8–9 px: etiqueta 72 px a la izquierda, barra fondo `soft` con
    segmentos: `cold` para camarones, `coral` para fuego, **rayado diagonal coral/coral-soft**
    para tapado, `ink` para manos; eje 0 · 5 · 11 min debajo); si es crítica, chip pequeño
    «● 6 PASOS CON TIEMPO CRÍTICO» en coral-soft/coral-deep.
11. **Tarjeta de receta** (selección) — paper, radio 20, padding 12/14; foto del plato 76 × 64
    radio 14 a la izquierda (si no hay foto, racimo de tres fotos circulares de ingredientes
    superpuestas: 44, 44 y 36); título Bricolage 700 16; meta `Secundario` «21 min · 720
    kcal · 38 g proteína / Última vez hoy · 21:34 · 2 versiones» (la parte verde en `green`);
    círculo 30 con «›» a la derecha (ink/blanco en la tarjeta destacada, `soft` en las
    demás). Variante `destacada`: borde `green` + halo 3 px green-soft. Variante `ejemplo`:
    opacidad 0.78.
12. **Barra inferior** (solo en la selección) — 3 pestañas con ícono de línea 22 px y
    etiqueta 10.5 px 600: Recetas (activa, `green`), Ingredientes, Utensilios.
13. **KPI** — paper, borde line, radio 16, padding 12/14: eyebrow 10 px, número Bricolage 700
    24 tabular, línea pequeña `muted`.

## 6. Pantallas a crear (en este orden, con estos nombres)

Usá **exactamente estos datos** (son de la receta real):

### 0 · Inicio
Fondo: la foto `inicio.jpg` a pantalla completa, `cover`, con un velo radial oscuro en el
centro (elipse 70 % × 45 % en el 48 % de la altura, rgba(10,12,11,.72) → transparente).
Centrado: `logo.png` a 300 de ancho con sombra `0 6 18 rgba(0,0,0,.45)`, debajo el lema
«Tu receta, al punto justo» (Instrument Sans 500 20 px, blanco 94 %, sombra), y un botón
`fuego` de 220 × 56 «Empezar» con sombra coral.

### A1 · Selección de recetas
Eyebrow «CERO DESPERDICIO · SIN SAL · 1 PORCIÓN», título «Recetas» (Bricolage 800 34),
campo de búsqueda 44 de alto (paper, borde line, radio 14, lupa + «Buscar por ingrediente o
plato»), chips «Todas» (activo), «Menos de 20 min», «Con lo que tenés», «Pescado».
Eyebrow «LISTAS PARA COCINAR» → tarjeta destacada con la **foto del plato**
(spaghetti-integral-brocoli-camarones.jpg): «Spaghetti integral con brócoli, champiñones y
camarones al limón» / «21 min · 720 kcal · 38 g proteína» / «Última vez hoy · 21:34 · 2
versiones». Eyebrow «CON LO QUE TENÉS EN CASA · ejemplos» → dos tarjetas `ejemplo` con
racimos de ingredientes: «Merluza al limón con arroz integral y tomate» y «Revuelto de
huevos con champiñones y perejil», meta «Ejemplo · receta todavía no escrita / Falta
cronometrar» (esta última en ámbar). Barra inferior.

### A2 · Portada, versión 2 elegida
Eyebrow «‹ RECETAS · 1 PORCIÓN · 0 G SAL», título de la receta con la foto del plato (84 ×
84, radio 18) a la derecha, chips «720 kcal», «38 g proteína», «17 g fibra». Segmento de
versiones con la 2 elegida. Fila de ingredientes: spaghetti «100 g», brócoli «½ pieza»,
camarones «125 g», champiñones «100 g», cherry «125 g», limón «½», «+6». Tarjeta «Etapa 1 ·
Preparación — 11:00», línea «Sin vigilancia: si algo se demora, el plato no cambia.»,
Gantt: Camarones (cold, 0→91 %), Agua al fuego (coral, 55→100 %), Manos (ink, 0→68 % y
91→100 %), eje 0 · 5 · 11 min. Tarjeta crítica «Etapa 2 · Cocción y plato — 10:00», línea
«Con vigilancia: arranca cuando el agua rompe hervor.», Gantt: Jarro · pasta (coral,
12→70 %), Wok (coral 5→40 %, rayado 45→75 %, coral 75→83 %), Manos (0→50 % y 75→100 %),
eje 0 · 5 · 10 min, chip «● 6 PASOS CON TIEMPO CRÍTICO». Botón primario «Empezar etapa 1»
y debajo «Primer paso: pesar y poner a descongelar los camarones».

### A3 · Portada, versión 1 elegida
Igual que A2 con la versión 1 elegida y una sola tarjeta crítica «Una sola línea de tiempo
— 16:00», línea «Manos y fuego se solapan todo el tiempo: 5 min menos, pero sin pausa
posible y con corte mientras el wok trabaja.», Gantt de 4 filas (Camarones cold 0→62 %;
Jarro · pasta: coral-soft 3→40 % y coral 40→84 %; Wok: coral 31→60 %, rayado 60→80 %,
coral 80→85 %; Manos 0→60 %, 62→70 %, 80→100 %; eje 0 · 5 · 10 · 16 min), chip «● 7 PASOS
CON TIEMPO CRÍTICO», y la lista de 14 pasos en dos columnas (`Micro` 11 px): 0:00
Descongelar camarones · 0:30 Agua al fuego · 1:00 Cortar brócoli · 3:30 Laminar champiñones ·
5:00 Wok con champiñones · 5:30 Lavar limón y jengibre · 6:30 Pasta al agua, cherry · 7:30
Revolver champiñones · 8:15 Sofrito · 9:15 Brócoli, tapar · 10:00 Secar camarones · 12:45
Camarones al wok · 13:30 Mantecar · 15:00 Emplatar. Botón «Empezar · 16 min» y debajo «Sin
pausa: el cronómetro no se detiene hasta emplatar».

### B1 · Etapa 1 en curso
Cabecera: eyebrow «ETAPA 1 · PREPARACIÓN», «Paso 2 de 9»; a la derecha reloj «1:40 / de
11:00»; barra de etapa 6 px verde al 15 %. Eyebrow «CORRE SOLO» + tarjeta de proceso `frio`:
foto camarones, «Camarones en agua fría / Listos a las 10:00 · no usar agua tibia», «8:20 /
restante», barra 17 %. Tarjeta Ahora: «AHORA · CON LAS MANOS» «0:30 → 3:00», foto brócoli,
«Lavar y cortar el brócoli entero», «1:10» «de 2:30 previstos», barra verde 47 %, sub-pasos:
✓ «Lavar la mitad del brócoli bajo la canilla» (hecho), «Flores en bocados de 3 cm; pelar
solo la piel dura del tallo y cortarlo en rodajas de 4 mm; hojas enteras», «Dejar todo
junto en un extremo de la tabla verde»; botones «Listo, siguiente ✓» y «?». Riel: eyebrow
«LÍNEA DE TIEMPO — toca un paso para verlo»; filas: 0:00 Pesar y descongelar camarones
(hecho, +0:04) · 0:30 Lavar y cortar el brócoli (actual, 1:10) · 3:00 Limpiar y laminar
champiñones (1:30) · 4:30 Partir los cherry (0:30) · 5:00 Lavar limón y jengibre · pesar
pasta (1:00) · 6:00 Agua al fuego / «arranca el carril del jarro» (0:30) · 6:30 Ordenar el
puesto de cocción (1:00) · 7:30 Espera libre (espera, 2:30) · 10:00 Escurrir y secar
camarones (1:00). Carril cold «CAMARONES 10 MIN» desde la fila 0:00 hasta el inicio de la
fila 10:00; segundo carril coral (agua) desde la fila 6:00 hasta el final.

### B2 · Paso pasado de tiempo
Igual que B1 en el minuto 4:42, «Paso 3 de 9», barra de etapa 43 %, proceso camarones
«5:18 restante» barra 47 %. Tarjeta Ahora: «3:00 → 4:30», foto champiñones, «Limpiar y
laminar los champiñones», número «1:42» con «+0:12» en coral titilando, barra en estado
pasado (previsto verde al 88 % con marca «1:30», exceso coral 12 % titilando), nota verde
«✓ Sin apuro: en esta etapa pasarse no cambia el plato», sub-pasos: ✓ «Frotar cada
champiñón con un paño apenas húmedo, sin sumergir», ✓ «Láminas de 5 mm, tallo incluido»,
«Dejarlos en otro extremo de la tabla». Riel: eyebrow «vas +0:16 sobre lo previsto»; 0:00
hecho +0:04 · 0:30 hecho 0:00 · 3:00 Limpiar y laminar champiñones (actual pasado: punto
coral, desvío «+0:12» coral titilando) · resto como B1.

### B3 · Etapa 2, alerta inminente
Cabecera «ETAPA 2 · COCCIÓN Y PLATO», «Paso 7 de 10», reloj «7:14 / de 10:00», barra de
etapa **coral** 72 %. Eyebrow «EN EL FUEGO»: tarjeta `alerta` foto brócoli «Brócoli tapado ·
no destapar / 3 min de vapor · fuego medio» «0:16 / restante» barra 91 % (late); tarjeta
`fuego` foto spaghetti «Spaghetti en el jarro / 7 min · al dente a las 8:15» «1:01» barra
86 %. Tarjeta Ahora variante crítica: «SIGUIENTE · PREPARATE» «7:30 → 8:15», foto camarones,
«Camarones al wok», «0:16» «para empezar», barra coral 91 %, sub-pasos: «Tené el bol de
camarones en la mano», «Al sonar: destapar, subir a fuego alto, volcar», «Revolver 45 s
hasta verlos opacos y con vapor. No más de 2 min o quedan gomosos»; botón `fuego` «Sonó ·
empezar 0:45» + «?». Riel: eyebrow «5 críticos hechos · 1 pendiente»; 0:00 Wok al fuego ·
jarro a medio (hecho −0:02) · 0:30 Champiñones al wok (hecho) · 1:15 Pasta al jarro · hundir
(+0:05) · 2:30 Revolver champiñones · 3:15 Sofrito aromático (+0:03) · 4:00 Brócoli:
saltear, agua, tapar · 5:00 Revolver la pasta · 7:30 Camarones al wok (actual, 0:45) · 8:15
Apagar y mantecar (1:00) · 9:15 Emplatar (0:45). Carril coral «PASTA 7 MIN» de la fila 1:15
a la 8:15; segundo carril coral (brócoli tapado) de mitad de la fila 4:00 a la 7:30.

### B4 · Alarma
Pantalla entera `coral`, texto blanco. Arriba: campana en un anillo de 120 (borde 8 px
blanco 35 %, dos anillos concéntricos más finos, late). Eyebrow «ETAPA 2 · 7:30 · TIEMPO
CRÍTICO», título Bricolage 800 44 «Destapar el brócoli», párrafo «Cumplió sus 3 min de
vapor. Más tiempo lo pasa: pierde el verde y la vitamina C.» Tarjeta translúcida (blanco
14 %, borde blanco 30 %, radio 18): foto camarones 48, «Camarones al wok / Fuego alto ·
volcar desde el bol · revolver con la cuchara de madera», «0:45» grande a la derecha.
Abajo: botón `blanco` 62 «Destapé · arrancar 0:45» y texto «Sonido y vibración hasta que
toques · la pasta sigue: 0:45 restante».

### B5 · Resumen final
Eyebrow «PLATO LISTO · HOY 10:03 · VERSIÓN 2», número «21:34» (72 px) «totales», línea
«Previsto 21:00 · **+0:34** (coral), casi todo en la etapa 1». Cuatro KPI en dos columnas:
«ETAPA 1 / 11:22 / previsto 11:00», «ETAPA 2 / 10:12 / previsto 10:00», «MANOS OCUPADAS /
15:40 / 73 % del tiempo», «CRÍTICOS A TIEMPO / 6 / 6 / ninguno pasado». Riel «PASO A PASO —
previsto → real» con filas de 42: subtítulo «Etapa 1 · Preparación — 11:22»: 0:30 Pesar y
descongelar +0:04 · 2:30 Lavar y cortar brócoli 0:00 · 1:30 Champiñones +0:18 · 0:30 Cherry
0:00 · 1:00 Limón, jengibre, pesar pasta +0:06; subtítulo «Etapa 2 · Cocción — 10:12»: 0:45
Camarones al wok 0:00 · 1:00 Apagar y mantecar +0:08 · 0:45 Emplatar +0:04. Botones
«Guardar esta vez» (primario) y «Comparar» (fantasma, 120 de ancho).

### C · Anatomía de la barra (frame de documentación, no pantalla)
Tres ejemplos del componente 7 con sus números: «En curso 0:30 de 1:00» (50 % verde),
«Justo a tiempo 1:00 de 1:00» (100 %), «Pasado de tiempo 1:10 +0:10» (previsto 86 % +
exceso coral 14 % titilando con marca «1:00»), cada uno con una línea de explicación.

## 7. Entregables

- El archivo Templa con las dos páginas, todas las pantallas nombradas como arriba, los
  componentes con variantes y las variables de color y texto.
- Los prototipos enlazados: Inicio → A1 → A2 (tocar la tarjeta) → A3 (tocar la pestaña) →
  B1 (Empezar) → B2 → B3 → B4 (al llegar a 0:00) → B5.
- Un frame extra «Sistema» con la paleta, la tipografía y los 13 componentes en fila.

Cuando termines, listá qué no pudiste reproducir exactamente y por qué.
