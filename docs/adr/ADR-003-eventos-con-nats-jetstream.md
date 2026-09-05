# ADR-003: Eventos entre servicios con NATS JetStream

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

Los tres servicios (ADR-002) tienen que enterarse de hechos de los otros: una cocinada
registrada, un usuario dado de baja, una receta nueva en el catálogo. El usuario eligió
comunicación por eventos con un broker, y entre los brokers, NATS JetStream. Todo corre en
una sola VM de Oracle Always Free, donde la memoria y la cantidad de contenedores pesan.

Tamaños de imagen medidos en esta máquina (`docker images`, descomprimidas):

| Imagen | Tamaño |
|---|---|
| `nats:2-alpine` | **41,1 MB** |
| `rabbitmq:4-alpine` | 265 MB |
| `redpandadata/redpanda:latest` | 478 MB |

## Opciones consideradas

### 1. HTTP directo entre servicios, sin broker

La opción más simple y la recomendada en la pregunta inicial. El usuario la descartó:
prefiere el desacople de los eventos desde el inicio, aunque cueste un contenedor más.
Queda registrado que era viable.

### 2. Redpanda (compatible con Kafka)

La opción con más ecosistema: log persistente, relectura desde cualquier offset,
clientes Kafka maduros. Se descartó por peso: 478 MB de imagen y, según su propia
documentación, un mínimo recomendado de 2 GB de memoria por nodo, que en una VM
compartida con PostgreSQL y cuatro procesos más es demasiado para el volumen que va a
tener este sistema (un usuario cocinando genera decenas de eventos por día, no miles por
segundo).

### 3. RabbitMQ

Colas AMQP con consola web. Más liviano que Redpanda (265 MB) y muy conocido. Se descartó
porque no retiene un log releíble: un consumidor que se agrega después no puede
reconstruir su estado desde el historial, y eso es justamente lo que necesita un servicio
nuevo (por ejemplo, uno de estadísticas) al nacer.

### 4. NATS JetStream

Un binario de 41 MB, JetStream para persistir streams con retención configurable y
relectura por secuencia, clientes Node oficiales, y monitoreo por HTTP en el 8222.
Menos ecosistema que Kafka, pero lo que hace falta acá (publicar, suscribir con
persistencia, releer) lo hace.

## Decisión

NATS 2 con JetStream habilitado (`--jetstream --store_dir /data`), un solo nodo, en el
compose con el volumen `nats-datos`. Los subjects siguen la forma
`templa.<servicio-emisor>.<tipo-del-evento>.v<N>`. Los mensajes son JSON con esquema
versionado (ADR-004). Cada servicio se conecta al broker al arrancar aunque todavía no
publique nada, para que una `NATS_URL` mal configurada corte el arranque.

Entrega **al menos una vez**: los consumidores descartan duplicados por el `id` del sobre.

## Consecuencias

### Positivas

- Desacople real: un servicio caído no bloquea al que publica.
- Un servicio nuevo puede reconstruir su estado releyendo el stream.
- 41 MB de imagen y un techo de 256 MB de memoria alcanzan.

### Negativas

- Un contenedor más que operar, respaldar (`nats-datos`) y monitorear.
- Consistencia eventual: lo que `cocinadas` sabe de un usuario puede ir unos milisegundos
  detrás de `usuarios`. Cada consumidor tiene que ser idempotente.
- Menos herramientas y ejemplos que con Kafka; los problemas raros se resuelven leyendo
  la documentación de NATS, no un hilo de StackOverflow.
- No hay «exactamente una vez»: la deduplicación es responsabilidad de cada consumidor.

### Lo que no cambia

El frontend no habla con el broker. Las peticiones del navegador siguen siendo HTTP
síncrono contra cada servicio a través del proxy.

## Cuándo revisar esta decisión

- Si un consumidor necesita procesar más de unos miles de eventos por segundo o
  particionar por clave con garantías de orden entre particiones: Redpanda.
- Si el stream persistente nunca se relee en un año: bastaba con NATS core sin JetStream,
  o con HTTP.

## Referencias

- [ADR-004](ADR-004-mensajes-json-con-esquema-versionado.md).
- `contratos/eventos/README.md`.
