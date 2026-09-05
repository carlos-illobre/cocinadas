---
name: microservicios-base
description: "Arma el esqueleto de un proyecto de microservicios con un conjunto de restricciones de ingeniería probadas: un docker-compose único con el .env como fuente de la verdad, sin código de fallback, un ADR por decisión técnica, cobertura con compuerta y mutation testing, y documentación con diagramas. No inventa lógica de negocio: pregunta el dominio y el stack antes de escribir nada. Usar al empezar un proyecto nuevo de microservicios, al pedir 'armá la estructura del proyecto', 'scaffolding de microservicios', o cuando se quiera replicar estas convenciones en otro repositorio."
---

# Esqueleto de proyecto de microservicios

Arma la estructura y las **restricciones de ingeniería** de un proyecto de
microservicios. Lo que aporta no son carpetas: son un puñado de reglas que se sostienen
entre sí y que, si se aplican a medias, dejan de valer.

Las reglas y los ejemplos numéricos que aparecen en las referencias salen de haberlas
aplicado, no de un manual. Cuando una diga «se midió», es literal.

**Esta skill no contiene lógica de negocio y no debe inventarla.** Todo lo que dependa
del dominio se pregunta. Todo lo tecnológico que quede ambiguo se pregunta.

---

## Paso 1 — Preguntar antes de escribir nada

**No escribas ni un archivo hasta terminar este paso.** Usá `AskUserQuestion` en tandas.
Si el usuario ya contestó algo en su pedido, no lo vuelvas a preguntar.

### Tanda A — el dominio (siempre se pregunta)

- **¿Qué hace el sistema?** Una frase. Va al README y a `ARCHITECTURE.md`.
- **¿Cuáles son los microservicios y qué hace cada uno?** Nombre y responsabilidad en una
  línea. Si el usuario todavía no lo sabe, arrancá con uno solo: es más barato agregar el
  segundo que desarmar una separación equivocada.
- **¿Quién los consume?** Otros equipos, un front propio, terceros. Define si hace falta
  documentación pública y autenticación entre servicios.

### Tanda B — el stack

- **Lenguaje y framework** de los servicios.
- **Herramienta de build** (Gradle, Maven, npm, cargo…).
- **Cómo se comunican los servicios**: eventos por un broker, HTTP entre ellos, o las dos.
- Si hay eventos: **qué broker** y **qué formato de mensaje** (Avro con registro de
  esquemas, JSON, Protobuf).

### Tanda C — despliegue e infraestructura

- **Dónde se despliega**: una VM propia, un cloud concreto, Kubernetes.
- **Registro de imágenes**.
- **¿Hay dominio propio y TLS?** Define si el esqueleto incluye un reverse proxy.
- **CI**: GitHub Actions u otro.

### Tanda D — convenciones

- **Idioma de la documentación y de los identificadores.**
- **Umbral de cobertura**: por defecto **100 % de instrucciones y ramas**. Si el usuario
  quiere menos, avisale que el resto de las reglas asume ese piso —sobre todo el mutation
  testing, que sólo aporta cuando la cobertura ya está saturada— y registralo en un ADR.
- **¿Mutation testing?** Sí por defecto si el stack tiene una herramienta madura.

### Qué hacer con lo que quede ambiguo

Si a mitad del armado aparece una decisión tecnológica que las respuestas no cubren,
**preguntá en vez de elegir por defecto**. Elegir por vos y anotarlo en un ADR parece
eficiente y no lo es: el ADR queda registrando una decisión que el usuario nunca tomó.

---

## Paso 2 — Leer las referencias

Antes de generar, leé los archivos de `referencias/` que apliquen. Contienen las reglas
con su porqué, que es lo que hace que se puedan defender y revisar después:

| Archivo | Qué contiene |
|---|---|
| `referencias/invariantes.md` | **Las restricciones no negociables.** Leelo siempre. |
| `referencias/estructura.md` | El árbol de directorios y qué va en cada uno. |
| `referencias/adr.md` | Formato de ADR, numeración, enmiendas y plantilla. |
| `referencias/pruebas.md` | Los tres niveles de prueba, las compuertas y los corredores. |

---

## Paso 3 — Generar

En este orden, porque cada paso depende del anterior:

1. **El árbol de directorios** (`referencias/estructura.md`) y el `.gitignore`.
2. **`docker-compose.yml` único** con todas las variables tomadas del `.env`, sin valores
   literales para nada que cambie entre ambientes.
3. **`.env`, `.env.example`** y el `.env.<destino>` del despliegue, con las mismas
   variables declaradas en los tres. El `.env` va al `.gitignore`.
4. **Un microservicio de ejemplo por cada uno que el usuario nombró**, autocontenido: su
   propio wrapper de build, su `Dockerfile` multi-etapa, su usuario sin privilegios.
   **Sin lógica de negocio**: sólo el arranque, el `/health` y la configuración leída del
   entorno.
5. **Los corredores de prueba** (`referencias/pruebas.md`), incluido el que verifica la
   paridad de los `.env`.
6. **El pipeline de CI**.
7. **La documentación**: `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`,
   `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/adr/README.md` y los diagramas.
8. **Los ADR de las decisiones que se acaban de tomar.** Cada respuesta de la tanda B, C y
   D que haya tenido alternativa razonable es un ADR. Como mínimo suelen salir: el broker,
   el formato de mensajes, el compose único con el `.env`, y el destino de despliegue.

---

## Paso 4 — Verificar antes de entregar

No lo des por terminado sin comprobarlo. Estas convenciones sólo valen si se verifican;
afirmar que algo funciona sin haberlo corrido es exactamente lo que buscan evitar:

- [ ] `docker compose config` resuelve sin errores y **sin variables sin definir**.
- [ ] El corredor de paridad de `.env` pasa: los tres archivos declaran lo mismo.
- [ ] Cada servicio compila y su suite pasa con la compuerta de cobertura puesta.
- [ ] `docker compose up -d` levanta y cada `/health` responde 200.
- [ ] Ningún enlace roto en la documentación.
- [ ] El índice de ADR lista todos los ADR y no hay dos con el mismo número.

Reportá lo que verificaste **con el resultado real**, no con un «debería funcionar».

---

## Lo que esta skill no hace

- **No escribe lógica de negocio.** Ni entidades, ni reglas, ni endpoints de dominio.
- **No elige por el usuario** cuando hay alternativas razonables: pregunta.
- **No commitea.** Deja los cambios en el árbol de trabajo, en una rama nueva.
