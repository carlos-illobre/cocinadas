# Implementation Plan: Base del sistema

**Branch**: `001-base-del-sistema` | **Date**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-base-del-sistema/spec.md`

**Note**: Este plan describe la arquitectura como está decidida en los ADR vigentes
(ADR-015 en adelante) y en la constitución. No lleva el avance del trabajo: dónde el
código se aparta de lo decidido se anota en `proyecto/estado/001.yml`.

## Summary

Cocinadas es un sitio estático: una aplicación de una sola página que se baja entera al
teléfono, con el catálogo de recetas adentro, y que guarda los datos de cada persona en
su propio teléfono. No tiene servidor, base de datos ni cuentas. El catálogo se genera al
compilar a partir del contenido del repositorio. Cada subida a la rama principal pasa
tres compuertas y se publica sola en un alojamiento gratuito de archivos estáticos
(ADR-015, ADR-017, ADR-018).

## Technical Context

**Language/Version**: TypeScript con las reglas de tipos estrictas, sobre Node 22 para
compilar y probar. Python 3 solo para validar el catálogo.

**Primary Dependencies**: React 19 y Vite (ADR-013, enmendado por ADR-015); pnpm 10 como
gestor de paquetes (ADR-010). En el sitio que se sirve no corre ninguna dependencia de
servidor.

**Storage**: El almacenamiento local del navegador de cada teléfono, detrás de una
interfaz de almacén que se puede reemplazar (ADR-015). Sin base de datos.

**Testing**: Vitest para las unitarias, con compuerta de cobertura del 100 % (ADR-010,
enmendado por ADR-017); Playwright con Chromium emulando un Pixel 7 para la prueba de
punta a punta, contra el sitio compilado (ADR-018); `tsc` y ESLint con reglas de tipos
como analizador.

**Target Platform**: El navegador de un celular (Android y iPhone), como app web
instalable. Alojamiento: GitHub Pages (ADR-017).

**Project Type**: Aplicación web de una sola página, solo cliente, más herramientas de
compilación.

**Performance Goals**: Sin metas numéricas decididas. La señal para revisar la
arquitectura es el peso total de lo que se baja al teléfono, no la cantidad de recetas
(ADR-015, ADR-017). [NEEDS CLARIFICATION: ¿cuál es el peso máximo aceptable de la app con
su catálogo completo para bajarla en una conexión de celular?]

**Constraints**: Sin servidor propio y con costo de operación cero en el primer
lanzamiento (RNF-07); todas las rutas relativas (ADR-017); funciona sin internet
(RNF-03); nada de lo guardado sale del teléfono (RNF-05); no se construye nada para una
necesidad que no existe (constitución, principio IX).

**Scale/Scope**: Primer lanzamiento con cuatro recetas (RF-04), un solo ambiente (el
sitio en línea) y una sola persona que escribe el catálogo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo lo cumple esta arquitectura |
|---|---|
| I. La especificación manda y no depende del código | La regla está en `specs/`; el avance, en `proyecto/estado/`. Este plan no nombra archivos del código de la aplicación. |
| III. Se cocina con las manos ocupadas | Solo celular; mínimos de letra y de botones en RNF-02; dos temas. |
| V. Lo público es gratis y sin cuenta | Sin servidor: no hay nada que escribir fuera del teléfono, así que nada exige cuenta. |
| VII. Primero la prueba | Tres compuertas antes de publicar; cobertura del 100 %; analizador sin avisos. |
| VIII. Los datos son contenido | El catálogo se escribe como contenido y se convierte al compilar; la app lo lee tal cual. |
| IX. Nada «para después» | Ningún servicio, configuración ni abstracción sin uso. Las dos únicas puertas que se dejan abiertas tienen costo nulo: el prefijo de las direcciones del catálogo y el almacén reemplazable. |
| X. En castellano y con voseo | Código, comentarios, documentación y textos. |
| XI. Toda decisión queda escrita | Cada decisión técnica de este plan cita su ADR; lo que no tiene ADR está en «Decisiones técnicas sin ADR». |
| Restricciones técnicas | Sitio estático con rutas relativas; todo directo a la rama principal; ninguna ruta fuera de la carpeta del proyecto. |

## Arquitectura decidida

### 1. Un sitio estático, sin servidor (ADR-015, ADR-017)

- La aplicación es una sola página que se baja entera al teléfono. Todo lo que el
  navegador pide son archivos: el documento, el código compilado, las imágenes y el
  catálogo.
- No hay servidor de aplicación, base de datos, cola de mensajes ni proxy propios. La
  simplificación buscada no es «menos servicios» sino ningún servicio.
- **Todas las rutas son relativas.** El alojamiento sirve el sitio en una subcarpeta con
  el nombre del repositorio, no en la raíz: una ruta absoluta apuntaría al dominio y
  fallaría solo en línea. Con rutas relativas el mismo sitio compilado sirve igual en una
  subcarpeta, en la raíz de un dominio propio o abierto desde el disco, y el nombre del
  repositorio no aparece en ningún lado.
- **La aplicación no cambia la dirección** al pasar de una pantalla a otra. La navegación
  es una pila de pantallas atada al historial del navegador, para que el botón de atrás
  del teléfono vuelva una pantalla. Es lo que hace que las rutas relativas resuelvan
  siempre contra el mismo lugar. Si alguna vez hay enlaces profundos, esta decisión se
  revisa (ADR-017, ADR-018).
- **Instalable.** El sitio declara nombre, íconos, idioma y modo de pantalla completa
  para que el navegador ofrezca agregarlo a la pantalla de inicio (RNF-01).
- **Un solo ambiente:** el sitio en línea. Lo más cercano en una máquina de desarrollo
  es compilar y servir el resultado.

### 2. El catálogo se genera al compilar a partir del contenido (ADR-006 enmendado, ADR-015)

- El catálogo es contenido del repositorio, no código: recetas, fichas de ingredientes y
  fichas de utensilios, con sus fotos (constitución, principio VIII). Cada receta existe
  en tres formas (para imprimir, en PDF y como datos) que dicen lo mismo; un validador lo
  comprueba.
- Un paso de la compilación lee ese contenido y escribe los archivos que la aplicación
  consume: un índice con el resumen de cada plato y sus modos de preparación, un archivo
  por receta y modo con las rutas de las fotos resueltas, y las fotos.
- Ese paso está partido en dos: una parte pura que decide qué archivos van y con qué
  contenido, medida al 100 %, y una parte que solo los escribe.
- Solo se copian las fotos que alguna receta usa: el sitio se baja entero al teléfono, y
  una foto sin uso es peso que nadie mira.
- Si una receta no tiene alguna de sus fotos, la compilación se corta y dice cuál; no se publica
  una receta incompleta.
- Las imágenes tienen dos vidas: los originales, junto al contenido, y las versiones que
  se sirven, en un formato liviano y al tamaño al que se muestran. Las segundas se
  regeneran con una herramienta cuando cambia una imagen.
- El catálogo en línea es siempre el de una versión entera del repositorio: revertir el
  código revierte también las recetas, y agregar una receta obliga a publicar de nuevo.
- Las direcciones del catálogo conservan el prefijo `api/` aunque detrás no haya ninguna
  API: es la puerta por la que entra un servidor sin tocar las pantallas (ADR-015).

### 3. Los datos de cada persona viven en su teléfono (ADR-015)

- Las cocinadas terminadas, la cocinada en curso, el tema y el silencio se guardan en el
  almacenamiento local del navegador. No salen del teléfono y no se cifran.
- La experiencia y los logros no se guardan: se calculan a partir de las cocinadas.
- El acceso a lo guardado pasa por una interfaz de almacén que recibe quien la usa. Es lo
  que permite reemplazarla por un cliente de servidor el día que existan las cuentas
  (RF-30, RF-34), sin tocar las pantallas.
- Lo que se lee de lo guardado se trata como dato desconocido y se comprueba antes de
  usarse; nunca se da por bueno.
- En el servidor no queda nada que respaldar.

### 4. Cómo se publica (ADR-017, ADR-018)

- Todo va directo a la rama principal, sin ramas ni revisiones intermedias (decisión de
  Carlos del 2026-09-09), y cada subida a esa rama publica el sitio sola.
- Antes de publicar pasan tres compuertas, y si una falla no se publica nada:
  1. **Analizador:** compilador de tipos sin errores y analizador estático sin avisos.
  2. **Pruebas unitarias** con cobertura del 100 % en instrucciones, ramas, funciones y
     líneas del código de la aplicación y de sus herramientas.
  3. **Prueba de punta a punta:** el camino feliz completo en un navegador que emula un
     celular, contra el sitio compilado y no contra el servidor de desarrollo. Va en un
     trabajo aparte de las unitarias, porque necesita bajar el navegador.
- Además, en cada subida: el validador del catálogo, el control de que la especificación
  y el estado coinciden, y un escaneo de vulnerabilidades y de secretos, que informa.
- El trabajo que publica compila el sitio, comprueba que el documento principal no tenga
  rutas absolutas y lo sube al alojamiento. Publica de a una versión por vez y no cancela
  una publicación en curso.
- Publicar no usa ninguna credencial guardada: el trabajo se autentica con la identidad
  de su propia ejecución, y es el único con permiso de escribir en el alojamiento.
- **Revertir** es revertir el cambio en la rama principal: la subida siguiente publica de
  nuevo.

### 5. Pruebas (ADR-010 enmendado, ADR-018)

- Las unitarias son el nivel principal. Corren sin levantar nada, con el reloj, la red,
  el almacén y el sonido inyectados.
- De la cobertura se excluye solo lo que no decide nada: el punto de arranque de la
  aplicación, la escritura a disco del catálogo, el manejo del navegador que convierte
  imágenes, y las propias pruebas. Criterio: la decisión se mide; la llamada al sistema
  externo, no.
- La prueba de punta a punta existe para lo que las unitarias no pueden ver: que el
  catálogo generado se sirva, que las rutas relativas resuelvan, que las fotos existan
  de verdad, que lo guardado sobreviva a una recarga y que la política de contenido no
  bloquee nada. Son pocas a propósito, sin compuerta de cobertura; una segunda prueba
  comprueba que los sonidos lleguen al navegador.
- Las pruebas de integración y las de mutación se dieron de baja con el paso a sitio
  estático (ADR-017).

## Seguridad exigida

La superficie es chica: el sitio son archivos estáticos y lo que queda expuesto es el
navegador de quien cocina.

### Política de contenido

El alojamiento no permite definir cabeceras, así que la política de contenido viaja
dentro del documento y se agrega solo al compilar (el servidor de desarrollo necesita lo
que ella prohíbe). La política exigida:

- Por omisión, nada de ningún origen.
- Código: solo el del propio sitio. Ningún código en línea.
- Estilos: solo los del propio sitio; se permiten los estilos puestos como atributo de un
  elemento (anchos de barras, posiciones calculadas); las hojas de estilo en línea quedan
  prohibidas.
- Tipografías, imágenes, conexiones y la declaración de instalación: solo del propio
  sitio.
- Sin dirección base, sin envío de formularios, sin objetos incrustados, y toda conexión
  insegura se eleva a segura.
- La prueba de punta a punta comprueba que la política esté en el sitio compilado y que
  el navegador no informe ningún bloqueo en el recorrido completo.
- Las cabeceras que no se pueden poner desde el documento (permisos, política de
  referencia, tipo de contenido, transporte seguro estricto y quién puede enmarcar el
  sitio) quedan en manos del alojamiento. Si alguna se vuelve necesaria, el alojamiento
  deja de alcanzar (ADR-017).

### Amenazas y mitigación exigida

| Amenaza | Mitigación exigida |
|---|---|
| Secretos filtrados en el repositorio | El proyecto no necesita ningún secreto para publicar. Un escaneo busca secretos en cada subida. |
| El sitio se publica roto o incompleto | Solo se publica si pasaron las tres compuertas, y se comprueba que el documento principal no tenga rutas absolutas. |
| Tráfico en claro | El sitio se sirve solo por HTTPS, con el certificado del alojamiento. |
| Código inyectado a través del contenido del catálogo | El catálogo lo escribe el proyecto y se genera al compilar; todo texto se muestra escapado; el código no inserta HTML sin escapar ni evalúa texto como código, y el analizador lo vigila; la política de contenido solo deja correr código del propio sitio. |
| Datos guardados en el teléfono manipulados o dañados | Lo guardado se lee como dato desconocido y se comprueba antes de usarse: se descartan las cocinadas sin la forma esperada, y la cocinada en curso exige marca de tiempo, plato y modo. Un límite de error cubre el resto: si una pantalla falla al dibujarse, se descarta la cocinada en curso y se ofrece volver a empezar. |
| Terceros que ven quién usa la app | Ningún recurso se carga de un tercero: las tipografías se sirven desde el propio sitio. Lo exige además RNF-03. |
| Dependencia con una vulnerabilidad conocida | Un servicio vigila las dependencias de la aplicación y las acciones de la integración continua y propone la actualización; un escaneo corre en cada subida. |
| Una versión maliciosa que entra por una actualización | Las actualizaciones se proponen, nunca se aplican solas, y no se aceptan a ciegas el mismo día. El gestor de paquetes no ejecuta los guiones de instalación de las dependencias. |
| Cadena de suministro de las acciones de la integración continua | Las acciones se fijan por el identificador exacto de su versión (el hash del commit), no por una etiqueta que el autor puede mover. El permiso por omisión es de solo lectura; solo el trabajo que publica puede escribir, y solo en el alojamiento. |
| Que alguien publique en nombre del proyecto | Solo publica el trabajo que corre sobre la rama principal, con la identidad de su propia ejecución. Depende de quién puede escribir en esa rama. |
| Datos personales | El sitio no recoge ninguno: sin cuentas, sin analítica de terceros, y todo lo que se guarda queda en el teléfono. |
| Cocinadas a la vista de quien tenga el teléfono desbloqueado | Riesgo aceptado: lo guardado no se cifra; son tiempos de cocina. |
| Pérdida del historial al borrar los datos del sitio o cambiar de teléfono | Riesgo aceptado (R-07). Lo resuelven las cuentas (RF-34); ADR-015 deja preparado el camino. |

### Reglas que se sostienen en el código

- Publicar no requiere ninguna credencial guardada.
- Nunca se inserta HTML sin escapar ni se evalúa texto como código.
- Lo que entra de lo guardado en el teléfono se lee como dato desconocido y se comprueba;
  no se convierte de tipo a ciegas.
- Se distingue «no hay» de «no pude preguntar»: un fallo al leer el catálogo o lo
  guardado se muestra como error, no como una lista vacía.

### Ante un incidente

1. Volver atrás: revertir el cambio en la rama principal; la subida siguiente publica.
2. Bajar el sitio: desactivar la publicación en la configuración del alojamiento.
3. Ver qué se publicó y cuándo: el registro de ejecuciones del trabajo que publica.
4. El alojamiento no expone registros de acceso; si se vuelven necesarios, es una razón
   para volver a tener servidor propio.

### Amenazas que vuelven con un servidor

Sesiones falsificadas, inyección en la base, entrada maliciosa por la API y contenedores
con privilegios vuelven a aplicar cuando las cocinadas salgan del teléfono. Están
analizadas en el «camino de vuelta» de ADR-015 y en ADR-017.

## El camino de vuelta a un servidor (ADR-015, ADR-017)

Se dispara cuando el historial tenga que salir del teléfono (cuentas, RF-30 y RF-34),
cuando aparezca algo que por definición pasa en el servidor (pagos, algo compartido entre
personas, un secreto), cuando se necesiten cabeceras que el alojamiento no deja poner, o
cuando el catálogo pese demasiado para bajarlo entero.

- Preparado: el prefijo `api/` de las direcciones del catálogo y el almacén reemplazable.
- A decidir en ese momento, cada cosa con su ADR: la base de datos (ADR-005 como punto de
  partida), el marco del servidor (ADR-007), la forma de autorizar (ADR-012) y si se
  necesita un intermediario de mensajes (ADR-003).
- Dónde va el servidor: con orígenes separados la sesión termina guardada en el navegador
  y aparecen los pedidos entre orígenes; con una red de distribución delante de un
  dominio propio hay un solo origen y una cookie normal. ADR-017 prefiere lo segundo, que
  cuesta un dominio.
- Lo que no se repite: no se crea ningún servicio antes de que tenga algo que hacer.

## Decisiones técnicas sin ADR

Lo que la especificación exige y ningún ADR vigente decide. Cada una necesita su ADR
antes de construirse (constitución, principio XI).

- **Funcionar sin internet (RNF-03).** [NEEDS CLARIFICATION: ningún ADR decide con qué
  mecanismo la app queda disponible sin conexión ni cómo convive eso con que se actualice
  sola. ADR-018 solo anota que el día que exista ese mecanismo hay que revisar la prueba
  de punta a punta.]
- **Pantalla encendida (RNF-04).** Sin ADR; no se registró ninguna alternativa.
- **Alarmas con el celular bloqueado (RNF-10) y apps nativas (RNF-11).** Sin ADR; son de
  lanzamientos posteriores al primero.
- **Dominio propio (RF-60).** ADR-017 publica en la dirección gratuita del alojamiento;
  pasar a un dominio propio es una decisión nueva.

## Registro de decisiones de arquitectura

Vigente: la decisión rige. Historia: la decisión fue superada y se conserva como punto
de partida para volver a decidir. Un ADR nunca se reescribe; se le agrega una enmienda.

| N.º | Título | Qué decide | Historia o vigente |
|---|---|---|---|
| 001 | Un solo `docker-compose.yml` y el `.env` como fuente de la verdad | Que todo lo que cambia entre ambientes esté en un único archivo de configuración | Historia (enmendado por 017: no hay contenedores ni ambientes) |
| 002 | Tres microservicios: catalogo, usuarios, cocinadas | Dividir el sistema en tres servicios | Historia (superado por 015) |
| 003 | Eventos entre servicios con NATS JetStream | Comunicar los servicios por eventos | Historia (superado por 015) |
| 004 | Mensajes JSON con esquema versionado en el repositorio | El formato de los eventos | Historia (superado por 015) |
| 005 | PostgreSQL para usuarios y cocinadas | La base de datos | Historia (superado por 015); punto de partida si vuelve un servidor |
| 006 | El catálogo se lee de los JSON del repositorio y viaja dentro de la imagen | Que el catálogo salga del contenido del repositorio y sea el de la versión que se publica | Historia en su forma original; su principio rige a través de la enmienda de 015 |
| 007 | Fastify como framework HTTP de los servicios | El marco del servidor | Historia (superado por 015) |
| 008 | Drizzle como capa de acceso a PostgreSQL | La capa de acceso a datos | Historia (superado por 015) |
| 009 | Caddy como reverse proxy con TLS automático | Quién termina el TLS y reparte el tráfico | Historia (enmendado por 015, 016 y 017) |
| 010 | pnpm, Vitest y Stryker | El gestor de paquetes, el corredor de pruebas y la compuerta del 100 % | Historia en la parte de pruebas de mutación; el resto rige a través de la enmienda de 017 |
| 011 | Despliegue en una VM de Oracle Cloud con imágenes multi-arquitectura por SHA | Dónde y cómo se despliega | Historia (superado por 017) |
| 012 | Autorización con JWT emitido por usuarios y verificado localmente | Cómo se autoriza | Historia (superado por 015) |
| 013 | El frontend como SPA React + Vite en su propia imagen | Que la interfaz sea una aplicación de una sola página con React y Vite | Historia en lo de la imagen propia; la elección de React y Vite rige a través de la enmienda de 015 |
| 014 | Endurecimiento antes de publicar a internet | Las medidas de seguridad del servidor | Historia (enmendado por 015 y 017) |
| 015 | De cuatro servicios a una sola SPA estática | Ningún servicio: una aplicación estática con el catálogo generado al compilar, los datos en el teléfono y el camino de vuelta a un servidor | Vigente (enmendado por 016 y 017 en cómo se sirve) |
| 016 | El reverse proxy es una pieza de la máquina, no de la aplicación | Sacar el TLS y el reparto por dominio a un proxy aparte | Historia (superado por 017) |
| 017 | Sitio estático en GitHub Pages, sin servidor propio | Publicar en un alojamiento estático gratuito en cada subida a la rama principal, con rutas relativas | Vigente |
| 018 | Un E2E de camino feliz con Playwright | Una sola prueba de punta a punta del camino feliz, contra el sitio compilado, emulando un celular, sin compuerta de cobertura | Vigente |

## Project Structure

### Documentation (this feature)

```text
specs/001-base-del-sistema/
├── spec.md              # Los requerimientos generales: RNF-01 a RNF-11 y RF-60
├── ux.md                # Lo que vale para todas las pantallas y el diseño aprobado
├── plan.md              # Este archivo
└── quickstart.md        # Cómo se instala, se levanta, se prueba y se publica
```

### Source Code (repository root)

```text
data/        # El catálogo: recetas, ingredientes y utensilios. Contenido, no código
web/         # La aplicación, sus herramientas de compilación y sus pruebas
docs/        # Los ADR y la descripción de negocio
specs/       # La especificación, una carpeta por capacidad
proyecto/    # La gestión del portafolio y el estado por requerimiento
```

**Structure Decision**: Un solo proyecto de aplicación, dividido por dónde corre cada
cosa: lo que va al navegador, lo que corre al compilar y las pruebas de punta a punta. El
contenido del catálogo queda fuera de la aplicación porque no es código (constitución,
principio VIII). La guía de uso de las carpetas está en [quickstart.md](quickstart.md).

## Complexity Tracking

Sin violaciones de la constitución que justificar.
