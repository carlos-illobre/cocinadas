# Invariantes

Las restricciones que sostienen el proyecto. Cada una viene con el porqué, porque una
regla sin su motivo se afloja la primera vez que estorba.

---

## 1. Un solo `docker-compose.yml`

**No hay `docker-compose.prod.yml`.** Un archivo, y lo que cambia entre ambientes sale del
`.env`.

**Por qué:** dos composes divergen en silencio. El día que alguien agrega un servicio,
una variable o un `healthcheck` en uno solo, producción y desarrollo dejan de ser el mismo
sistema y nadie se entera hasta que falla el despliegue. Con un archivo, la diferencia
entre ambientes es exactamente el contenido del `.env`, que se puede leer de un vistazo y
comparar con un test.

Los servicios que sólo existen en un ambiente van con `profiles:`, no en otro archivo.

---

## 2. El `.env` es la fuente de la verdad

**Todo lo que cambia entre ambientes vive en el `.env` y en ningún otro lado.**

Esto implica algo que se olvida seguido: **si una variable está en el `.env`, la
configuración de la aplicación no debe tener un valor por omisión para ella.** Un default
en `application.yml` (o equivalente) más la variable en el `.env` son dos fuentes de
verdad, y la que gana no es evidente al leer ninguno de los dos archivos.

```yaml
# mal: dos lugares donde mirar, y el default gana si alguien borra la variable
timeout-ms: ${TIMEOUT_MS:5000}

# bien: una sola fuente; si falta, el arranque falla y se ve
timeout-ms: ${TIMEOUT_MS}
```

**Excepción legítima:** los valores que **no** dependen del ambiente van literales en el
compose, no en el `.env`. Un nombre de tópico interno o la cantidad de particiones no
cambian entre desarrollo y producción: meterlos en el `.env` es ruido que hay que mantener
sincronizado en tres archivos para nada.

---

## 3. Sin código de fallback

**Una variable ausente tiene que impedir que el contenedor arranque**, no degradar el
comportamiento en silencio.

```yaml
DATABASE_URL: ${DATABASE_URL:?falta DATABASE_URL en el .env}
```

**Por qué:** un fallback convierte un error de configuración en un comportamiento raro.
En el mejor caso el ambiente arranca distinto de lo esperado; en el peor —una variable de
seguridad— arranca abierto. Fallar al arrancar es el único momento en que el error todavía
es barato.

### La distinción que sí importa: ausente vs. vacía

No son lo mismo y el código tiene que tratarlas distinto:

- **Ausente** = el `.env` está incompleto. Es un error, corta el arranque.
- **Declarada pero vacía** = una opción apagada a propósito. Es válida.

En shell son dos formas distintas, y la diferencia es un solo carácter:

```sh
: "${OBLIGATORIA:?falta OBLIGATORIA}"   # con dos puntos: vacía también falla
: "${OPCIONAL?falta OPCIONAL}"          # sin dos puntos: vacía es válida
```

Un ejemplo real de por qué hace falta: la URL de un servicio optativo. Vacía significa
«este despliegue no levantó ese servicio» y la aplicación oculta esa funcionalidad;
ausente significa que alguien se olvidó de declararla.

### El corolario que se pasa por alto

Cuando un servicio consulta a otro, distinguí **«no hay» de «no pude preguntar»**. Son
dos respuestas distintas que llevan a decisiones opuestas:

```kotlin
// null = no se pudo consultar. Lista vacía = se consultó y no hay.
// Con esta distinción, un borrado puede fallar cerrado en vez de borrar a ciegas.
fun dependientesDe(recursos: List<String>): List<Dependiente>?
```

Sin ella, un servicio caído se lee como «no hay nada que dependa de esto» y el borrado
sigue adelante.

Colapsar las dos en «lista vacía» es un fallback disfrazado de tipo de retorno.

---

## 4. La configuración por ambiente se verifica con un test

Un corredor de pruebas comprueba que **todos los `.env*` declaren exactamente las mismas
variables**, y que ninguna variable que el compose interpola quede sin declarar.

**Por qué:** sin esto, agregar una variable a un ambiente y olvidarla en el otro sólo se
descubre al desplegar. El test lo dice en segundos y nombra cuál falta.

---

## 5. Cobertura con compuerta, y exclusiones justificadas una por una

**100 % de instrucciones y ramas**, y el build falla si baja.

Las exclusiones se listan explícitamente con el motivo de cada una, y sólo valen para
**adaptadores de infraestructura**: una clase que no hace más que configurar un cliente
real y no se puede ejercitar sin él.

**El criterio que decide:** si la clase excluida contiene una decisión —un `if`, un
mapeo de errores, una política—, **esa decisión se extrae a una clase medible** y afuera
queda sólo la llamada al sistema externo. Excluir la decisión junto con el andamiaje es
cómo una regla de negocio termina sin ninguna prueba.

---

## 6. Una verificación que no puede fallar no es una verificación

El hilo que conecta a casi todas las demás. Aparece de muchas formas:

- Un test que pasaría igual con el código roto.
- Una regla de firewall que nunca se evalúa porque el tráfico no pasa por esa cadena.
- Una limpieza de imágenes que no libera nada porque el filtro no aplica.
- Un aviso de «copia desactualizada» que se muestra siempre.

**Cómo se combate, en orden de costo:**

1. **Romper el código a propósito** y confirmar que la prueba falla. Si no falla, la
   prueba es decorativa. Documentar el ejercicio, incluidos los casos donde la prueba
   **no** detectó nada.
2. **Mutation testing** cuando la cobertura ya está en el techo, que es cuando deja de
   distinguir un test bueno de uno decorativo. Sin umbral: hay mutantes *equivalentes*
   que ningún test puede matar, y perseguir el número lleva a castigar código correcto.
3. **Medir en vez de afirmar.** Cuando una afirmación técnica se pueda comprobar con un
   comando, comprobala antes de escribirla en la documentación.

---

## 7. Cada microservicio es autocontenido

Su propio wrapper de build, su `Dockerfile`, su contexto de build limitado a su carpeta.
No hay build multi-proyecto en la raíz.

**Por qué:** el `Dockerfile` puede copiar su carpeta entera y nada más, así que un cambio
en un servicio no invalida la caché de capas de los otros. El costo es que compartir
código entre servicios se vuelve incómodo, **y eso es deliberado**: obliga a que la
duplicación sea una decisión consciente y no un accidente.

### Cuando aparezca código duplicado entre servicios

Distinguí dos cosas que se confunden:

- **Duplicar la decisión** —que cada servicio verifique por sí mismo en tiempo de
  ejecución— suele ser correcto, sobre todo en seguridad.
- **Duplicar la implementación** —copiar y pegar el código— es otra cosa, y no se
  justifica con el argumento anterior.

Si la duplicación es inevitable, que sea explícita: un ADR con el motivo, y el comentario
en el código apuntándolo. Si no lo es, extraela.

---

## 8. Un ADR por decisión técnica

Ver `adr.md`. La regla corta: **si hubo una alternativa razonable, hay un ADR.**

---

## 9. Los comentarios explican el porqué, no el qué

El código dice qué hace. El comentario dice **por qué así y no de la otra forma**, y sobre
todo **qué se rompe si alguien lo cambia**.

```kotlin
// mal
// Pone el group id del consumer.
put(GROUP_ID_CONFIG, "entregas-$topic")

// bien
// El group id es la clave con la que Kafka guarda el offset commiteado. Renombrarlo
// estrena un grupo sin offsets y, con `auto.offset.reset=latest`, cada suscripción se
// saltea en silencio lo publicado entre el despliegue y la primera asignación.
put(GROUP_ID_CONFIG, "entregas-$topic")
```

El segundo evita que alguien «limpie» el nombre y pierda eventos. El primero no evita
nada.

---

## 10. Nombres coherentes y autodescriptivos

**No se arrastran nombres viejos** aunque cueste compatibilidad. Un identificador que
miente cuesta cada vez que alguien lo lee; romper compatibilidad cuesta una vez y se
puede anunciar.

Cuando el cambio tenga un costo real —resetear offsets, invalidar cachés— el costo se
documenta en el ADR con su ventana y su mitigación, y se hace igual.

---

## 11. Sin secretos en el repositorio

- El `.env` real va al `.gitignore`.
- Se versionan `.env.example` y `.env.<destino>` con **marcadores de posición**, nunca con
  valores reales.
- Ningún dato sensible fuera del `.env`, ni siquiera en comentarios o documentación.

---

## 12. Una rama por cambio

Nunca se commitea directo a la rama principal. Cada cambio va en su rama y entra por PR,
incluso trabajando solo: el PR es donde queda el registro de por qué se hizo.
