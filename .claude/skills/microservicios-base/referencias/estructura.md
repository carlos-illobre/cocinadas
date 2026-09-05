# Estructura de directorios

```
.
├── .github/workflows/            Pipeline: pruebas, imágenes, publicación del sitio
├── deployment/
│   └── <destino>-<topología>/    Un directorio por forma de desplegar
│       ├── .env                  Datos reales del despliegue. EN EL .gitignore
│       ├── .env.<destino>        Plantilla versionada, con marcadores de posición
│       └── deploy.sh             El despliegue, idempotente
├── docs/
│   ├── adr/                      Un archivo por decisión + README.md con el índice
│   ├── diagrams/                 Mermaid: C4, clases, secuencias, estados, despliegue
│   ├── ARCHITECTURE.md           Vista general, componentes, decisiones y sus ADR
│   ├── DEPLOYMENT.md             Dominio, TLS, puertos, respaldo, reversión
│   ├── SECURITY.md               Amenazas, qué las mitiga, qué queda abierto
│   ├── TESTING.md                Los niveles, las compuertas, qué está excluido
│   └── index.html                Portada del sitio publicado
├── infrastructure/               Piezas que no son microservicios propios
│   └── reverse-proxy/            Plantilla de configuración + entrypoint
├── microservices/
│   └── <servicio>/               Autocontenido: build propio, Dockerfile propio
├── tests/
│   ├── utest.sh                  Unitarias de todos los servicios, con la compuerta
│   ├── itest.sh                  Integración: necesitan el stack arriba
│   ├── mutation.sh               Mutation testing (informa, no reprueba)
│   └── integration/              Un script por asunto + utilidades compartidas
├── .env                          Configuración local. EN EL .gitignore
├── .env.example                  Plantilla versionada
├── docker-compose.yml            Único. Todo lo variable sale del .env
└── README.md                     Cómo levantarlo y cómo se usa la API
```

---

## Por qué cada decisión de forma

**`deployment/<destino>-<topología>`, no `deployment/<destino>`.** El sufijo de topología
—`<proveedor>-single`, `<proveedor>-ha`— deja lugar a que convivan dos formas de desplegar
en el mismo proveedor sin renombrar nada. Cuando llega la segunda, ya hay dónde ponerla.

**`infrastructure/` separado de `microservices/`.** Un proxy o un broker configurado no
tienen código propio ni suite de pruebas; mezclarlos con los servicios hace que los
corredores de prueba tengan que saltearlos de a uno.

**`tests/` en la raíz, no adentro de cada servicio.** Los de cada servicio ya viven en su
proyecto. Lo que va acá es lo que cruza servicios: la paridad de configuración, los
límites de la infraestructura, el camino de punta a punta. Son cosas que ningún servicio
puede verificar solo.

**`docs/index.html` versionado.** La portada del sitio publicado sale de un archivo del
repositorio, no de un `cat` adentro del pipeline. Cambiarla no debería ser tocar el CI.

---

## El `Dockerfile` de un servicio

Multi-etapa, y con tres cosas que conviene no olvidar:

**Usuario sin privilegios con uid fijo.** El uid tiene que ser literal, no asignado por el
sistema: los volúmenes guardan el número, y si cambia entre versiones el contenedor deja
de poder escribir sin ninguna explicación.

**Los directorios que se montan como volumen se crean en la imagen con el dueño
correcto.** Docker copia el contenido de la imagen al volumen nuevo conservando el
propietario; es lo que hace que el volumen nazca escribible.

**Las capas van de lo que menos cambia a lo que más.** Si el runtime lo permite, separar
dependencias de código propio: cambiar una línea no debería invalidar una capa de decenas
de megas que hay que volver a transferir en cada despliegue.

---

## El `.dockerignore`

Cada servicio con el suyo. Como mínimo, fuera: artefactos de build, `node_modules` o
equivalente, el `.git`, y **cualquier archivo `.env`**.
