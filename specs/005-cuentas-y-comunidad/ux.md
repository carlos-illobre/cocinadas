# Requerimientos de interfaz: Cuentas y comunidad

Qué tiene que poder hacer cada rol desde la pantalla, qué información necesita a la vista,
en qué estados puede estar y con qué textos. Acompaña a la especificación de la capacidad
(RF-30 a RF-35, RF-50 y RF-51).

Las pantallas de esta capacidad se diseñan con maquetas que Carlos elige
antes de planificar el trabajo. Este documento fija lo que cualquier diseño tiene que
cumplir y lista lo que hay que preguntarle.

## Reglas que valen para toda la capacidad

- **Solo celular.** Todo se usa de parado, a un brazo de distancia: ningún texto informativo
  por debajo de 13,5 px, botones grandes, tema claro y oscuro. Nada de esta capacidad tiene
  vista de escritorio.
- **En castellano y con voseo** («iniciá sesión», «publicá», «comentá»).
- **La cuenta nunca se pide antes de tiempo.** Ninguna pantalla de lectura, de cocina, de
  resultados, de historial ni de perfil muestra un pedido de registro. El pedido aparece en
  el momento en que la persona quiere hacer algo que se escribe en el servidor, y no antes.
- **Se ve igual con cuenta que sin cuenta** todo lo que es leer y cocinar. La sesión agrega
  posibilidades; no cambia ni quita lo demás.
- **La pantalla de cocina no se toca.** Nada de esta capacidad (pedidos de cuenta,
  comentarios, mensajes, publicidad) interrumpe a quien está cocinando con las manos
  ocupadas, salvo que Carlos decida otra cosa para la publicidad (RF-51).
- **La barra inferior** tiene Recetas, Historial y Perfil. Es diseño aprobado: sumarle o
  cambiarle algo es cambiar un requerimiento y se le pregunta a Carlos.
- **Los cambios de pantalla van animados** y respetan «reducir movimiento», como en el resto
  de la app.

## Qué tiene que poder hacer cada rol

### Quien cocina, sin cuenta

- Entrar a la app sin registrarse.
- Ver los POE públicos de otros usuarios, con su autor, y cocinarlos.
- Leer los comentarios de un POE público y ver cuántos me gusta tiene.
- Crear un POE propio, guardarlo en su teléfono, volver a encontrarlo y cocinarlo.
- Iniciar sesión cuando quiera compartir algo.

Necesita a la vista:

- En un POE público: quién es su autor, sus comentarios y sus me gusta.
- En un POE propio: que está guardado solo en este teléfono y que no lo ve nadie más.

### Quien tiene cuenta

Todo lo anterior, y además:

- Publicar un POE propio.
- Comentar un POE público.
- Dar me gusta a un POE público.
- Ver su historial y su progreso, que son los mismos en cualquier teléfono donde inicie
  sesión.
- En la etapa de red social (RF-50): seguir a un creador, ver lo nuevo de quienes sigue y
  mandar y recibir mensajes.

Necesita a la vista:

- Que tiene la sesión iniciada y con qué cuenta.
- En un POE propio: si es solo suyo (guardado en el teléfono) o si es público.
- En un POE público: si ya le dio me gusta.

### Quien publica

- Ver cuáles de sus POE son públicos.
- Ver los comentarios y los me gusta que recibieron sus POE.

Lo que puede hacer con un POE después de publicarlo (modificarlo, retirarlo, borrarlo)
depende de las preguntas de RF-32.

### Administrador

- Banear una cuenta que publicó contenido ofensivo (RF-35).

Desde dónde lo hace, cómo le llega una denuncia y qué ve de la cuenta dependen de las
preguntas de RF-35.

## El inicio de sesión

- La pantalla de entrada tiene el logotipo, el lema «Tu receta, al punto justo», el botón
  «Continuar con Google» y «Entrar sin cuenta». Es diseño aprobado.
- «Continuar con Google» inicia sesión con Google. «Entrar sin cuenta» entra a la app sin
  sesión, con todo lo público disponible.
- El inicio de sesión se ofrece con dos proveedores: Google e Instagram (RF-31).
- El pedido de iniciar sesión aparece también cuando una persona sin sesión quiere publicar,
  comentar o dar me gusta. Le dice para qué se pide la cuenta y le deja cancelar.
- Si la persona cancela, vuelve a donde estaba, sin sesión y sin que se pierda nada de lo
  que tenía en pantalla.

[NEEDS CLARIFICATION: la pantalla de entrada aprobada tiene «Continuar con Google» y «Entrar
sin cuenta». ¿Se le agrega un botón «Continuar con Instagram» al lado del de Google? ¿Y
desde qué otro lugar de la app se inicia y se cierra la sesión: el Perfil?]

## Estados

| Estado | Qué ve y qué puede la persona |
|---|---|
| Sin sesión | Todo lo de leer, cocinar y guardar en el teléfono. Al querer publicar, comentar o dar me gusta, el pedido de iniciar sesión |
| Iniciando sesión | El paso por Google o Instagram. Puede cancelarlo |
| Ingreso cancelado o fallido | Vuelve a donde estaba, sin sesión y sin haber perdido nada. Si falló, la app se lo dice |
| Con sesión | Todo lo anterior más publicar, comentar y dar me gusta. Ve con qué cuenta está |
| Con sesión, sin conexión | Puede leer lo que ya tiene y cocinar. Publicar, comentar y dar me gusta no se pueden escribir en el servidor: la app se lo dice |
| Cuenta baneada | Lee y cocina todo lo público y guarda en su teléfono. No puede publicar, comentar ni dar me gusta. Qué le dice la app depende de las preguntas de RF-35 |

Estados de un POE propio:

| Estado | Qué significa |
|---|---|
| En el teléfono | Lo ve solo su autor, en ese teléfono. No necesita cuenta |
| Público | Lo ve y lo cocina cualquiera. Tiene autor, comentarios y me gusta |

Estados de un me gusta sobre un POE público: sin dar y dado.

## Textos

Los textos fijados por las fuentes son:

- «Continuar con Google» y «Entrar sin cuenta», en la pantalla de entrada.
- «Tu receta, al punto justo», el lema de la pantalla de entrada.
- «me gusta», como nombre de la marca sobre un POE. No se usa «like».
- «POE» para el procedimiento, y «publicar» para pasarlo de propio a público.
- «banear» es el término interno; el texto con el que se le avisa a la persona baneada no
  está definido.

Los demás textos (el pedido de iniciar sesión, los avisos de error, el aviso a la cuenta
baneada, los textos del editor de POE) se definen con las maquetas, en voseo.

## Lo que depende de una respuesta de Carlos

Cada punto depende de una pregunta abierta de la especificación:

- **El editor de POE** (RF-32): qué pasos tiene crear un POE en un celular depende de cómo
  se cargan los ingredientes, los utensilios y las fotos, y del formato de RF-05.
- **Dónde aparecen los POE públicos de los usuarios** frente a las recetas del catálogo, y
  dónde encuentra una persona sus POE propios (RF-32).

  [NEEDS CLARIFICATION: ¿en qué lugar de la app vive «Mis POE» (los que la persona creó) y
  desde dónde se crea uno nuevo: dentro de Recetas, dentro de Perfil, o con una entrada
  nueva en la barra inferior, que es diseño aprobado?]
- **Los comentarios** (RF-33): si hay respuestas, quién puede borrar y con qué largo.
- **El autor a la vista** (RF-30): con qué nombre y con qué foto se muestra.
- **La denuncia y el baneo** (RF-35): si hay un botón para denunciar y desde dónde banea el
  administrador.
- **La red social** (RF-50): dónde se ve lo nuevo de quienes se sigue y dónde están los
  mensajes.
- **La publicidad** (RF-51): dónde se muestra y dónde nunca.
