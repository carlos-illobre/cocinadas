# La instancia y la red

## Shapes del plan gratuito

| Shape | Recursos | Arquitectura |
|---|---|---|
| **VM.Standard.A1.Flex** (Ampere) | Hasta 4 OCPU y 24 GB, repartibles entre instancias | **`arm64`** |
| **VM.Standard.E2.1.Micro** (AMD) | 1/8 OCPU y 1 GB, hasta dos instancias | `amd64` |

**La Ampere es la que sirve** para un stack de varios contenedores: con 1 GB no entra ni
una JVM con su broker al lado.

**La arquitectura no es un detalle.** Si el CI construye `amd64` y la instancia es Ampere,
los contenedores fallan al arrancar con `exec format error` y el mensaje no dice nada de
arquitecturas. Se resuelve de una de dos formas:

- Construir en un runner ARM. Si el CI lo ofrece gratis para repositorios públicos, es la
  mejor: **compilar arm64 sobre x86 con QEMU tarda varias veces más**.
- Construir multi-arquitectura con `buildx`, que cuesta el doble de tiempo de build.

**Conseguir una Ampere cuesta.** El error «Out of host capacity» es habitual y no es un
problema de la cuenta: la región no tiene capacidad libre en ese momento. Se reintenta, se
prueba otro dominio de disponibilidad, o se elige otra región **al crear la cuenta**
—después no se puede cambiar el home region—.

---

## El firewall: lo que casi todo el mundo hace mal

**Los puertos que publica Docker no pasan por la cadena `INPUT`.**

Cuando el compose publica un puerto, Docker instala una regla DNAT en `nat/PREROUTING`. A
partir de ahí el destino del paquete es la IP del contenedor, así que el kernel lo
**enruta** en vez de entregarlo localmente: recorre `FORWARD` → `DOCKER-USER` → `DOCKER`,
y **nunca pasa por `INPUT`**.

Esto se midió con los contadores de `iptables` sobre un puerto 443 publicado por un
contenedor:

| Cadena | Paquetes |
|---|---|
| `INPUT` | 31 |
| `DOCKER` | **13.426** |

Cuatrocientas treinta y tres veces más por `DOCKER`. Los 31 de `INPUT` entraron mientras
el contenedor estaba caído y nadie hacía el DNAT.

### Las tres consecuencias

**1. `ufw` no protege lo que creés que protege.** Sus reglas van a `INPUT`. Un `ufw deny`
sobre un puerto publicado por Docker **no bloquea nada**, y da la peor de las
sensaciones: la de estar protegido.

**2. El firewall efectivo es la Security List de la VCN** (o un Network Security Group).
Filtra antes de que el paquete llegue a la máquina, así que es indiferente a lo que haga
Docker con las cadenas. **Ahí se decide qué está abierto**, y en ningún otro lado.

**3. Si algún día hace falta filtrar a nivel del host** para tráfico dirigido a
contenedores, la cadena correcta es **`DOCKER-USER`**: es la única que Docker respeta y no
reescribe.

### Y una trampa más, específica de las imágenes de Oracle

Las imágenes de Ubuntu que provee Oracle vienen con reglas de `iptables` preinstaladas que
descartan casi todo el tráfico entrante. Abrir el puerto en la Security List y no acordarse
de esto produce el síntoma más confuso posible: `curl` desde adentro de la máquina anda,
desde afuera da timeout, y la Security List «está bien».

Comprobalo antes de dar el puerto por abierto:

```sh
sudo iptables -L INPUT -n --line-numbers
```

Si hay un `REJECT` general al final, o el puerto no está permitido, hay que agregar la
regla **y persistirla** — si no, se pierde en el próximo reinicio.

---

## Qué puertos abrir

**Sólo los que el proyecto publica hacia afuera, y ninguno más.** Se leen del
`docker-compose.yml`; no los inventes.

El patrón que conviene: **publicar los servicios en `127.0.0.1` y exponer sólo el proxy.**
Con una variable que controle la interfaz de publicación:

```yaml
ports:
  - "${PUBLISH_ADDR}:8080:8080"
```

En desarrollo vale `0.0.0.0` para llegar desde el navegador; **en producción, `127.0.0.1`**.
Así, aunque alguien abra un puerto de más en la Security List, del otro lado no hay nada
escuchando en la interfaz pública. Los servicios internos —paneles de administración,
métricas— se miran por túnel SSH:

```sh
ssh -L 9090:localhost:9090 usuario@ip
```

---

## Lo que conviene verificar antes de instalar nada

Un `preflight.sh` que **no modifique nada** y sólo informe. Comprueba lo que puede estar
mal antes del primer `docker compose up`, con el remedio de cada caso a mano:

- Memoria **disponible**, no la nominal: en una VM de cloud siempre hay agentes del
  proveedor corriendo, y los techos de memoria se reparten sobre lo que sobra.
- Espacio en disco.
- Docker instalado, corriendo, y el usuario en el grupo `docker`.
- Los puertos que el stack necesita, libres.
- Las reglas de `iptables` que puedan estorbar.

**Corrélo antes de levantar el stack**: una vez arriba, la comprobación de puertos libres
marca como ocupados justamente los que usa el sistema.

Conviene que funcione **por stdin sobre SSH**, para poder usarlo antes de clonar nada:

```sh
ssh destino 'bash -s' < deployment/oracle-single/preflight.sh
```

En esa forma `sudo` no puede pedir contraseña —stdin lo ocupa el propio script—. En las
imágenes Ubuntu de Oracle el usuario `ubuntu` tiene sudo sin contraseña, así que funciona;
agregar `-t` no ayuda, porque fuerza un pseudo terminal que compite con la redirección.
