# Interfaz: lo que vale para todas las pantallas

Requerimientos de interfaz generales de Cocinadas y el diseño que Carlos aprobó para toda
la app. Lo propio de cada pantalla está en el `ux.md` de su capacidad. Cada punto de
«Diseño aprobado por Carlos» es una regla: cambiarlo es cambiar un requerimiento y se le
pregunta antes (constitución, principio VI).

## Requerimientos de interfaz generales

### Dónde y cómo se usa

- **UX-01** La app se usa en un celular apoyado en la mesada: se lee de
  parado, a un brazo de distancia y con las manos ocupadas (RNF-01, RNF-02).
- **UX-02** No hay diseño de escritorio para cocinar. La única vista de escritorio
  prevista es la del seguimiento (RF-45), en una dirección aparte, y no modifica ninguna
  pantalla de celular (RNF-01).
- **UX-03** Al pasar de una pantalla a otra, la nueva se ve desde arriba, aunque la
  anterior estuviera desplazada.

### Letra y botones

- **UX-04** Ningún texto informativo mide menos de 13,5 px (RNF-02, inciso a).
- **UX-05** Los botones son grandes; el tamaño mínimo es el de RNF-02, inciso b.
- **UX-06** Todo botón se puede ubicar por su función y por un nombre legible: su texto
  o, si es solo un ícono, un nombre que un lector de pantalla puede leer (ADR-018).

### Temas

- **UX-07** Hay dos temas, claro y oscuro, y cada pantalla y cada estado se diseña en los
  dos (RNF-06).
- **UX-08** Todo estado (cumplido, en curso, pasado de tiempo, crítico) se reconoce en
  claro y en oscuro.
- **UX-09** Lo visual se verifica con capturas en un celular, en los dos temas, y no
  leyendo las hojas de estilo (constitución, principio VI).

### Movimiento

- **UX-10** Los cambios de pantalla y lo que aparece o desaparece van animados.
- **UX-11** Con «reducir movimiento» activado en el teléfono no hay ninguna animación, y
  nada deja de verse.
- **UX-12** Una animación nunca deja fuera de lugar lo que queda fijo sobre la pantalla:
  lo que flota o cubre la ventana entera ocupa la ventana, no la pantalla desplazada.

### Avisos y errores

- **UX-13** Lo que avisa (un cronómetro que vence, un paso crítico) avisa con sonido y
  vibración además de la pantalla (constitución, principio III).
- **UX-14** Un error se dice como error, con su motivo, en castellano. Nunca se muestra
  como una lista vacía ni como «no cocinaste nunca» (RNF-05, inciso f).
- **UX-15** Si una pantalla falla al dibujarse, la app muestra un mensaje de que algo
  salió mal y un botón para volver a empezar; no queda en blanco.

### Idioma

- **UX-16** Todos los textos van en castellano rioplatense, con voseo («tocá», «entrá»,
  «marcá») (RNF-08).
- **UX-17** Los números usan coma decimal y punto de miles («2,5 ml», «1.500»).

### Marca

- **UX-18** El nombre es «Cocinadas» y el logotipo es la olla con la palabra (RF-60). La
  palabra del logotipo es texto, no una imagen.
- **UX-19** Tipografías: una para todos los textos (Nunito), una de ancho fijo para los
  números (Space Mono) y una caligráfica reservada para la marca (Lobster).
- **UX-20** El color de marca es el naranja. El tema claro va sobre marfil.

## Diseño aprobado por Carlos

En toda la app. Cada punto lo pidió Carlos o lo aprobó al verlo.

- Es de celular y se lee de parado: ningún texto informativo por debajo de 13,5 px.
- Dos botones redondos flotan arriba a la derecha en todas las pantallas menos la de
  entrada: el de tema (claro u oscuro) y, debajo, el de sonido. Los dos se recuerdan.
- Una barra inferior con Recetas, Historial y Perfil, en esas tres pantallas.
- El botón de atrás del teléfono vuelve una pantalla. Solo en la de entrada sale de la app.
- Todo se guarda en el teléfono y nada sale de él. Sin cuenta se usa la app completa.
- Los cambios de pantalla y lo que aparece o desaparece van animados. Con «reducir
  movimiento» activado en el teléfono las animaciones se apagan y nada deja de verse.
- Cualquier foto de un ingrediente, de un utensilio o de un paso se amplía al tocarla y se
  cierra tocando en cualquier lado.
- Se instala desde el navegador y se actualiza sola.

### Precisiones sobre lo aprobado

- **Los dos botones flotantes.** Flotan: siguen a la vista aunque la pantalla se
  desplace. «Los dos se recuerdan» quiere decir que el tema elegido y el silencio se
  conservan en el teléfono entre una apertura y la siguiente (RNF-05, RNF-06). Qué
  silencia el botón de sonido es de RF-18.
- **La barra inferior.** Sus tres secciones se llaman Recetas, Historial y Perfil, y va
  solo en esas tres pantallas: no aparece en la entrada, en la ficha, en la mise en
  place ni en la cocina.
- **El botón de atrás.** Un botón «volver» de la propia pantalla y el botón de atrás del
  teléfono retroceden cada uno una pantalla; usar el de la pantalla no hace que el del
  teléfono cuente dos veces. Qué pasa con una cocinada en curso al volver desde la cocina
  es de la capacidad de cocina.
- **Las fotos que se amplían.** «En cualquier lado» incluye la propia foto ampliada.
- **Reducir movimiento.** Si los papelitos del festejo pueden no mostrarse con esa opción
  activada es una pregunta abierta de la `spec.md`.

## Preguntas abiertas de interfaz

Las preguntas a Carlos sobre lo general están en la `spec.md` de esta carpeta, marcadas
como `[NEEDS CLARIFICATION]`: el tamaño mínimo de los botones, las excepciones al mínimo
de letra, el tema inicial, qué se ve en una computadora o con el celular apaisado, si los
textos acompañan la letra agrandada del sistema y qué pasa con el festejo cuando está
activado «reducir movimiento».
