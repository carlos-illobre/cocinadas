# Preguntas abiertas

Reglas del producto que ninguna fuente define. Salieron el 2026-10-10 al escribir las
especificaciones completas: en vez de inventar una regla, cada vacío quedó como pregunta.
Son 121, sacadas de las marcas `[NEEDS CLARIFICATION]` de cada documento. El
requerimiento que figura al lado es el que nombra la pregunta o el último nombrado antes
de ella.

Solo Carlos las puede contestar. Cada respuesta se anota con su fecha en
[docs/decisiones-de-negocio.md](../docs/decisiones-de-negocio.md) y en la sección
Clarifications de la especificación, se escribe la regla donde estaba la marca y la
pregunta se borra de acá. Una especificación no está completa mientras tenga preguntas.

Muchas son de lanzamientos posteriores al primero y no hace falta contestarlas todavía.

### Catálogo y POE (002)

1. **RF-07.** Si una receta tiene un solo modo, ¿la ficha lo muestra igual como tarjeta «¡Fácil!» o no muestra selector de modo?
2. **RF-07.** Si dos modos de una receta duran lo mismo, ¿cuál es el fácil y cuál se propone?
3. **RF-09.** ¿qué muestra la lista si el catálogo no tiene ninguna receta? En el primer lanzamiento no debería pasar, pero con filtros (RF-09) o búsqueda por lo que hay en casa (RF-52) sí puede quedar vacía.
4. **RF-01.** ¿en qué orden se listan las recetas?
5. **RF-04.** ¿cada receta de lanzamiento tiene que traer los dos modos de preparación (fácil y difícil), o alcanza con uno?
6. **RF-04.** El bife de chorizo lleva sal agregada según el formato de datos («0 salvo carnes rojas»); ¿la receta de lanzamiento del bife se escribe con sal o sin sal agregada?
7. **RF-05.** ¿«tarea» unifica en un solo concepto el trabajo de manos y lo que corre solo, o se conservan las dos clases y cada una suma estas declaraciones?
8. **RF-05.** ¿la criticidad por tarea reemplaza a la marca de «vigilancia» de la etapa entera, o conviven?
9. **RF-05.** El paralelismo, ¿se declara nombrando las otras tareas o se deduce de los minutos de inicio y fin?
10. **RF-06b.** Los criterios de diseño y las reglas de seguridad y conservación se probaron en la ficha y la volvían larguísima; ¿en qué pantalla y de qué forma se muestran?
11. **RF-06b.** ¿dónde se muestran la preparación de cada ingrediente, el uso de cada utensilio, la sal agregada y qué sobra y cómo se guarda: en la ficha, en la mise en place o en el paso donde se usan?
12. **RF-32.** ¿qué forma tiene el mecanismo: un formulario dentro de la app, un asistente que conversa, la importación de un documento u otra cosa?
13. **RF-32.** En el primer lanzamiento no hay servidor ni costo de operación; ¿cómo llega al catálogo de todos un POE que Carlos carga desde su teléfono?
14. **RF-32.** ¿el mecanismo también tiene que producir la planilla para imprimir y cargar las fotos del plato, de los ingredientes y de los utensilios?
15. **RF-06c.** ¿qué nutrientes forman la tabla «completa»? El formato de receta declara calorías, proteína, fibra y sodio; las fichas de los ingredientes traen además carbohidratos, grasas totales y grasas saturadas; los octógonos necesitan además azúcares.
16. **RF-06c.** ¿la tabla completa reemplaza a la fila de tiempo, porciones, calorías y proteína de la ficha, o se suma aparte y la fila queda como está?
17. **RF-06d.** ¿lo declara quien escribe la receta, o se deduce de sus ingredientes, marcando cada ingrediente como con o sin TACC?
18. **RF-06d.** ¿con qué texto o símbolo se muestra, y qué se muestra si de algún ingrediente no se sabe?
19. **RF-06e.** ¿los calcula la app a partir de los valores nutricionales del plato, con los límites del etiquetado frontal, o los declara quien escribe la receta?
20. **RF-06e.** ¿«los demás» son exceso de grasas totales, de grasas saturadas y de calorías, y también las leyendas de edulcorantes y de cafeína?
21. **RF-54.** ¿el costo es por porción o de la receta entera, y se muestra también el precio de cada ingrediente?
22. **RF-54.** ¿el costo del plato incluye el de los utensilios, o los utensilios se informan aparte?
23. **RF-08.** Al cambiar los comensales, ¿cambian solo las cantidades, o también los tiempos, los pasos y los utensilios? ¿Entre qué cantidades se puede elegir?
24. **RF-08a.** ¿cómo declara una receta sus variantes y qué cambia con cada combinación: cantidades, pasos, tiempos?
25. **RF-08a.** ¿cómo conviven las variantes con el modo de preparación, que ya es un selector de la ficha, y qué combinación se propone al abrirla?
26. **RF-08a.** Si «sin sal» también es una variante elegible de cada receta (RF-08a), ¿el filtro muestra las recetas que se escribieron sin sal o las que ofrecen esa variante?
27. **RF-08a.** ¿los dos filtros se combinan entre sí?
28. **RF-32.** ¿se imprime la planilla del modo de preparación elegido, o se ofrecen las de todos los modos?
29. **RF-52.** ¿qué datos se piden de un ingrediente o utensilio propio: nombre, foto y unidad, o también marca y valores nutricionales?
30. **RF-52.** Lo que hay en casa, ¿se registra solo como «tengo» o «no tengo», o con cantidades?
31. **RF-52.** ¿los ingredientes y utensilios propios quedan solo en el teléfono de quien los cargó, o los ven todos?
32. **RF-53.** «eligiendo entre marcas», ¿vale para los ingredientes, para los utensilios o para los dos? Si un ingrediente admite varias marcas, ¿la receta sigue nombrando un producto concreto como recomendado?
33. **RF-53.** ¿cómo se determina el supermercado más cercano: por la ubicación del teléfono o por una dirección que carga quien compra?
34. **RF-55.** ¿cómo se define «la zona» de quien usa la app, y qué se muestra cuando un ingrediente no tiene precio en ningún supermercado?
35. **RF-55.** Cuando un ingrediente tiene precio en varios supermercados, ¿qué precio entra en el costo del plato: el más bajo, el del más cercano o un promedio?
36. **RF-56.** ¿cómo agrega un administrador un supermercado y quién es administrador? Carlos pidió discutirlo antes de empezar la integración.
37. **RF-07.** ¿qué texto se muestra si no hay ninguna receta para listar?
38. **RF-03.** Si la receta tiene un solo modo, ¿se muestra igual como tarjeta «¡Fácil!» o no se muestra el selector?
39. **RF-06e.** ¿qué nutrientes y en qué lugar de la ficha: reemplazan a la fila de cuatro valores o van aparte?
40. **RF-06e.** ¿con qué texto o símbolo, y en qué lugar de la ficha?
41. **RF-06e.** ¿en qué lugar de la ficha van los octógonos, y se ven también en la tarjeta de la lista?
42. **RF-06e.** ¿en qué pantalla va cada uno? Los criterios y la seguridad se probaron en la ficha y la volvían larguísima.
43. **RF-06a.** ¿qué forma tiene el mecanismo de carga? Sin esa respuesta no hay pantallas que describir.
44. **RF-08a.** ¿cómo conviven los selectores de variantes con las tarjetas de modo, y qué combinación se propone al abrir la ficha?
45. **RF-09.** ¿los filtros se combinan, y dónde van en la lista?
46. **RF-10.** ¿imprime la planilla del modo elegido o deja elegir entre las de todos los modos?
47. **RF-52.** ¿qué datos se piden de un ingrediente o utensilio propio, y lo que hay en casa se registra con cantidades?
48. **RF-56.** ¿qué se muestra cuando un ingrediente no tiene precio, y cómo agrega un supermercado el administrador?

### Cocinar (003)

1. **RF-19a.** Además del sonido, ¿el vencimiento de un proceso no crítico tiene que dejar una señal visible (un cartel, la fila marcada) hasta que se la descarte?
2. **RF-19a.** ¿el aviso previo de 30 segundos se conserva en el rediseño, vale para todos los cronómetros o solo para los críticos, y lleva sonido?
3. **RF-19b.** ¿con qué señal se distingue el cronómetro que lleva alarma del que no: un ícono de campana, un color, una leyenda?
4. **RF-19b.** ¿qué aviso da un paso que se pasa de su tiempo: el suave, el fuerte si el paso es crítico, uno solo o repetido?
5. **RF-21.** ¿qué molestias concretas encontró Carlos al cocinar (qué botón no alcanzó, qué no pudo leer, qué lo obligó a hacer scroll o a limpiarse las manos)? Cada una se convierte en un escenario acá
6. **RF-21.** ¿qué acciones se manejan con la voz (avanzar, atender la alarma, reiniciar el paso, leer el paso en voz alta) y con qué palabras?
7. **RF-21.** Una receta sin ningún item, ¿puede existir? Si existe, ¿se cocina sin pasar por la mise en place?
8. **RF-21.** ¿se puede tocar «Listo» con sub-pasos sin tildar, o hay que tildarlos todos como en la mise en place?
9. **RF-21.** Si la app se cierra durante la mise en place, ¿al volver se conservan los items tildados?
10. **RF-13.** Carlos pidió rediseñar las barras de los cronómetros (decisión 21): ¿qué tiene que cambiar concretamente en cómo se ven (forma, tamaño, color, sentido en que se llenan, qué pasa con la barra del paso cuando se pasa de tiempo)?
11. **RF-14.** Carlos pidió rediseñar la lógica de qué cronómetro lleva alarma (decisión 21): ¿la alarma que tapa la pantalla es solo para los procesos críticos, o también para un paso de manos crítico que se pasa de su tiempo y para el reloj de la etapa?
12. **RF-17.** Las seis horas, ¿se cuentan desde la última acción de la cocinada (el último «Listo», tilde o aviso) o desde que empezó?
13. **RF-18.** Al silenciar, ¿se apaga también la vibración, o el teléfono sigue vibrando en cada aviso? ¿Y la alarma de un proceso crítico suena igual aunque esté en silencio?
14. **RF-20.** ¿dónde se alojan los videos, cuánto pueden durar, se reproducen solos o al tocarlos, con o sin sonido, y se ven también sin internet?

### Progreso y juego (004)

1. **RF-20.** Un desvío de exactamente el 10 %, ¿da el bonus de 100 puntos o no?
2. **RF-20.** El tiempo que se pasa en la pausa entre etapas, ¿queda afuera del tiempo real total con el que se calculan el bonus y el historial?
3. **RF-20.** En el último nivel, ¿qué muestran la barra y la leyenda de cuánto resta para el nivel siguiente? ¿La barra queda llena, o hay una meta más allá de los 5.000?
4. **RF-20.** Una cocinada sin ningún paso crítico, ¿cuenta para «Sin pasarse»?
5. **RF-20.** «Racha de 3», una vez conseguido, ¿queda para siempre, o se pierde cuando la racha se corta?
6. **RF-20.** Cuando una receta se cocinó en modos distintos, que tienen tiempos objetivo distintos, ¿contra qué objetivo se dibujan los puntos: un gráfico por modo, o todos juntos contra un solo objetivo, y cuál?
7. **RF-20.** «recetas cocinadas», ¿cuenta cocinadas (tres veces la misma receta son 3) o recetas distintas (son 1)?
8. **RF-12.** ¿quien cocina tiene que poder borrar una cocinada o todo su historial, y exportarlo e importarlo a mano para no perderlo al cambiar de teléfono?
9. **RF-31.** ¿entre quiénes se compara (todos, los que uno sigue, los de un curso o un restaurante), en qué período (histórico, semanal, mensual), general o por receta, y de qué lanzamiento es?
10. **RF-25.** ¿compartir exige cuenta, o alcanza con generar la imagen en el teléfono para que la persona la publique? ¿La imagen lleva la marca y un enlace a la receta?
11. **RF-23.** «Mejor», ¿es la cocinada más cercana al objetivo o la más corta? Si se premia la precisión y no la velocidad, la más corta no es la mejor.

### Cuentas y comunidad (005)

1. **RF-35.** ¿con qué nombre y qué foto aparece una persona como autora de un POE o de un comentario: los de su cuenta de Google o Instagram, o un apodo que elige? Lo público se define como «anónimo» para quien lee y con «autor identificado» para quien escribe; hay que decidir cuánto de la identidad real queda a la vista de todos.
2. **RF-35.** ¿la persona puede eliminar su cuenta? Si la elimina, ¿qué pasa con sus POE públicos, sus comentarios y sus me gusta? ¿Hay edad mínima para tener cuenta y hay que aceptar términos de uso y una política de privacidad al crearla?
3. **RF-31.** ¿la cuenta se crea sola la primera vez que alguien inicia sesión, sin formulario de registro? Si la misma persona entra una vez con Google y otra con Instagram, ¿son dos cuentas distintas o una sola, y se pueden unir?
4. **RF-31.** Cuando alguien sin sesión toca comentar, dar me gusta o publicar y entonces inicia sesión, ¿la app completa sola la acción que había empezado o la persona tiene que repetirla? ¿Y la persona puede cerrar la sesión cuando quiera?
5. **RF-20.** Al crear un POE, ¿los ingredientes y los utensilios se eligen del catálogo común, o cada persona carga los suyos con su marca y su foto? ¿Qué es lo mínimo que tiene que tener un POE para poder guardarse y para poder publicarse?
6. **RF-20.** Después de publicar un POE, ¿su autor puede modificarlo, retirarlo de lo público o borrarlo? Si lo hace, ¿qué pasa con los comentarios, los me gusta y el historial de quienes ya lo cocinaron?
7. **RF-20.** ¿un POE se publica al instante o pasa antes por una aprobación? El plan de contingencia del riesgo R-06 prevé la publicación con aprobación previa.
8. **RF-20.** ¿dónde aparecen los POE públicos de los usuarios: mezclados con las recetas del catálogo de Carlos o en un lugar aparte? ¿Con qué orden y con qué búsqueda? ¿Existe la lista de «los más votados»?
9. **RF-20.** Cocinar un POE propio o un POE público de otro usuario, ¿da experiencia y logros igual que una receta del catálogo de Carlos? Si da lo mismo, alguien puede armarse un POE trivial para sumar puntos.
10. **RF-20.** Con cuenta, ¿los POE propios sin publicar se guardan también en la cuenta, para no perderlos al cambiar de teléfono, o quedan solo en el teléfono? Si se guardan en la cuenta sin ser públicos, son contenido privado en el servidor, que según el modelo de negocio es lo que se paga con la membresía.
11. **RF-33.** Reglas de los comentarios y de los me gusta. ¿El comentario es solo texto, con qué largo máximo? ¿Se puede responder a un comentario? ¿Quién puede borrar un comentario: su autor, el autor del POE, el administrador? ¿El me gusta es uno por cuenta y por POE y se puede quitar? ¿Se puede dar me gusta a un comentario?
12. **RF-34.** Cuando alguien inicia sesión en un teléfono que tiene cocinadas y su cuenta ya tenía otras de otro teléfono, ¿se suman las dos? Al cerrar la sesión, ¿el historial queda en el teléfono o se va con la cuenta? ¿Qué más se guarda en la cuenta además de las cocinadas: la preferencia de tema y de sonido, la cocinada en curso?
13. **RF-35.** ¿quién banea: solo Carlos, o hay más administradores? ¿Cómo se entera de un contenido ofensivo: hay un botón para denunciar, y lo puede usar alguien sin cuenta? ¿Qué se considera ofensivo?
14. **RF-35.** ¿qué pasa con lo que la cuenta baneada ya había subido: sus POE, sus comentarios y sus me gusta se ocultan, se borran o quedan? ¿El baneo es definitivo o puede ser por un tiempo? ¿Se le avisa a la persona y puede reclamar? ¿Conserva el historial guardado en su cuenta? ¿Qué pasa si además tiene una membresía paga?
15. **RF-35.** ¿dónde ve una persona lo nuevo de quienes sigue? ¿Los mensajes son privados entre dos cuentas, y se le puede escribir a cualquiera o solo a quien uno sigue? ¿Se puede bloquear a alguien y denunciar un mensaje, y el baneo de RF-35 alcanza a los mensajes? La descripción de negocio pone el seguir a un creador junto con los comentarios y los me gusta: ¿seguir se adelanta al segundo lanzamiento o queda para más adelante junto con los mensajes?
16. **RF-51.** ¿dónde se muestra la publicidad y dónde nunca (por ejemplo, mientras se cocina con las manos ocupadas)? ¿Quién anuncia y cómo carga su aviso? ¿La ve también quien paga una membresía? ¿Qué se anuncia: productos de cocina, POE promocionados, cuentas?
17. **RF-31.** La pantalla de entrada aprobada tiene «Continuar con Google» y «Entrar sin cuenta». ¿Se le agrega un botón «Continuar con Instagram» al lado del de Google? ¿Y desde qué otro lugar de la app se inicia y se cierra la sesión: el Perfil?
18. **RF-32.** ¿en qué lugar de la app vive «Mis POE» (los que la persona creó) y desde dónde se crea uno nuevo: dentro de Recetas, dentro de Perfil, o con una entrada nueva en la barra inferior, que es diseño aprobado?

### Espacios privados (006)

1. **RF-32.** ¿cómo elige el dueño quién ve su espacio: invitando por correo, con un enlace, con un código? ¿La persona invitada necesita solo una cuenta gratuita, o también tiene que pagar? Cuando el dueño le quita el acceso a alguien, ¿qué pasa con las cocinadas que esa persona hizo en el espacio?
2. **RF-32.** ¿cómo se organiza un espacio por dentro? ¿Una membresía es un solo espacio, o una escuela puede tener varios cursos y un restaurante varias brigadas, cada uno con sus POE y su gente? ¿El acceso se da al espacio entero o POE por POE? ¿Una persona puede ser miembro de varios espacios a la vez?
3. **RF-32.** ¿quién puede qué dentro del espacio? ¿Quién nombra a un docente o a un supervisor? ¿Solo el dueño carga POE y videos, o también los docentes, los supervisores o cualquier miembro? ¿El espacio de un particular tiene estos roles?
4. **RF-32.** ¿un POE puede pasar de privado a público y de público a privado? ¿Los POE privados tienen comentarios y me gusta entre los miembros? ¿Un miembro puede cocinar un POE privado sin internet, aunque eso deje una copia en su teléfono? ¿Los videos tienen un límite de duración o de tamaño?
5. **RF-41.** ¿qué ve exactamente el docente y con qué alcance? ¿Solo las cocinadas de los POE del espacio, o también lo que el alumno cocina por su cuenta de lo público? ¿El alumno tiene que aceptar que el docente lo vea? ¿Un alumno ve el progreso de sus compañeros? ¿Las cocinadas de los POE del espacio suman a la experiencia y a los logros personales del alumno, y las conserva si deja el curso?
6. **RF-41.** ¿el docente solo mira, o además hace algo: asignar un POE como práctica con una fecha, poner una nota, dejarle una devolución al alumno? ¿Qué significa «llegar al tiempo»: terminar a menos del 10 % del tiempo previsto, como el bonus de puntos?
7. **RF-42.** ¿cuándo se considera que un cocinero «domina» un plato: tras cuántas cocinadas seguidas a tiempo, con qué margen? ¿El seguimiento del supervisor es el mismo que el del docente con otros nombres (brigada por curso, cocinero por alumno), o son dos seguimientos distintos? ¿El cocinero ve sus propios números y los de sus compañeros?
8. **RF-43.** ¿cuánto cuesta la membresía y cómo se cobra? ¿Es mensual o anual? ¿Hay un precio único o planes distintos para un particular, una escuela y un restaurante, o según la cantidad de miembros? ¿Con qué medio de pago y en qué moneda? ¿Se emite factura? ¿Hay un período de prueba gratis?
9. **RF-43.** ¿qué pasa cuando la membresía vence o se deja de pagar? ¿Los POE, los videos y el seguimiento se bloquean, se borran después de un plazo, o quedan a la vista solo del dueño? ¿El dueño puede llevarse una copia de lo suyo? ¿La membresía se puede pasar a otra cuenta, por ejemplo cuando quien la compró deja la institución?
10. **RF-35.** ¿qué se cifra y hasta dónde? ¿Alcanza con cifrar lo que viaja y lo que se guarda, o el cifrado tiene que impedir que el propio operador de Cocinadas lea el contenido? ¿Carlos o un administrador pueden ver un espacio privado para dar soporte o para moderar, y el baneo de RF-35 vale para lo que se escribe adentro?
11. **RF-35.** ¿cómo se le garantiza por escrito a una institución que sus datos no se comparten: con los términos del servicio, con un contrato firmado? ¿Qué promete esa garantía sobre el borrado definitivo cuando el dueño se va, y sobre los datos personales de los alumnos, que pueden ser menores?
12. **RF-42.** ¿el seguimiento se puede mirar también desde el celular, o solo desde la vista de escritorio? La decisión del 2026-10-09 primero dijo «solo celular, también para el docente y el supervisor» y después sumó la vista de escritorio. ¿La vista de escritorio muestra solo el seguimiento, o también sirve para administrar el espacio (invitar gente, cargar POE y videos)? ¿Se puede descargar o imprimir el seguimiento?
13. **RF-42.** ¿qué muestra primero la vista de escritorio y cómo se recorre: una tabla con una fila por alumno o por cocinero y una columna por POE, un gráfico de evolución por persona, las dos cosas? ¿Qué quiere ver un docente apenas entra, y qué un supervisor?
14. **RF-40.** En el celular, ¿los POE del espacio privado aparecen en la misma lista de Recetas, marcados como privados, o en un lugar aparte? ¿Y desde dónde se llega a la compra de la membresía: desde el Perfil, o solo cuando alguien quiere guardar algo como privado?

### Toda la app (001)

1. **RF-60.** ¿en qué momento tiene que aplicarse una versión nueva: en la apertura siguiente, o también con la app abierta? Y si hay una cocinada en curso, ¿se espera a que termine?
2. **RF-60.** ¿qué tiene que ver quien abre la app en una computadora, en una tablet o con el celular apaisado: la misma pantalla de celular en una columna angosta centrada, un aviso de «abrila en el celular», u otra cosa?
3. **RF-14.** ¿en qué pantallas tiene que quedar encendida la pantalla: solo en la de cocina (pasos, pausa entre etapas y alarma), o también en la mise en place y en los resultados? Y si el teléfono o el navegador no permiten mantenerla encendida, ¿la app tiene que avisarlo?
4. **RF-14.** Cuando la persona nunca eligió un tema, ¿la app arranca siempre en claro o toma el tema que tiene configurado el teléfono?
5. **RF-14.** Con «reducir movimiento» activado, ¿los papelitos del festejo de los resultados pueden no mostrarse, o tienen que verse quietos? La regla aprobada dice que «nada deja de verse».
6. **RNF-08.** ¿qué dominios hay que reservar (de los libres al 2026-10-09: `.com`, `.app`, `.net`, `.org`, `.io`, `.co`, `.es`, `.mx`, y a confirmar `.com.ar` y `.ar`), y la app pasa a abrirse en alguno de ellos o sigue en la dirección gratuita?
7. **RNF-11.** Con el celular bloqueado, ¿qué tiene que pasar exactamente (sonido, vibración, una notificación en la pantalla de bloqueo), con cuánta demora como máximo, y esto se exige a la app web o se cumple recién con las apps nativas (RNF-11)?
8. **RNF-11.** ¿las apps nativas tienen que hacer todo lo que hace la app web, y conservar lo que la persona ya tenía guardado en su teléfono con la app web (historial, experiencia y logros)? ¿La app web sigue existiendo cuando estén las nativas?
9. **RF-18.** Si la persona tiene la letra del teléfono agrandada desde la configuración de accesibilidad, ¿la app tiene que agrandar sus textos en la misma proporción?
10. **RF-18.** ¿en qué navegadores y desde qué versiones tiene que funcionar la app completa (Chrome en Android, Safari en iPhone, otros), y hasta qué tamaño de pantalla mínimo?
11. **RNF-02.** ¿quedan exceptuados del mínimo de 13,5 px los signos que van dentro de un ícono o de un círculo (el tilde de un sub-paso cumplido, la marca de estado de un proceso), o tampoco esos pueden ser más chicos?
12. **RNF-02.** ¿cuál es el tamaño mínimo de un botón o de cualquier zona que se toca, en píxeles de alto y de ancho, y cuál la separación mínima entre dos botones vecinos? «Botones grandes» no tiene número en ninguna fuente.
13. **RNF-08.** Además del idioma y de los formatos, ¿qué exige «Argentina»: que los ingredientes, las marcas y los utensilios de las recetas sean los que se consiguen en Argentina, que la hora sea la de Argentina? ¿Y está previsto algún otro idioma o país más adelante?
14. **RF-60.** ¿«costo cero» alcanza solo a operar la app (alojamiento y servicios), o también excluye del primer lanzamiento comprar un dominio y pagar el registro de la marca (RF-60)?
15. ¿cuál es el peso máximo aceptable de la app con su catálogo completo para bajarla en una conexión de celular?
16. **RNF-03.** Ningún ADR decide con qué mecanismo la app queda disponible sin conexión ni cómo convive eso con que se actualice sola. ADR-018 solo anota que el día que exista ese mecanismo hay que revisar la prueba de punta a punta.
