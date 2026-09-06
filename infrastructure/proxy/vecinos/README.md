# Vecinos

Un archivo `.caddy` por cada **otra** aplicación de la máquina que tenga que atender por
el 80 y el 443. El Caddyfile del proxy los importa con `import /etc/caddy/vecinos/*.caddy`.

Este directorio está casi vacío a propósito: **la configuración de una aplicación es de
esa aplicación**, no de Cocinadas. Cada repositorio trae su propio bloque y lo copia acá
en su despliegue. Así, agregar la tercera aplicación de la máquina no obliga a commitear
en el repositorio de una app de recetas, y desinstalarla es borrar un archivo.

Si no hay ningún `.caddy`, el glob no encuentra nada y la configuración del proxy sigue
siendo válida: el proxy no depende de que haya vecinos.

## Cómo se escribe uno

```caddy
# ~/cocinadas/infrastructure/proxy/vecinos/citypass.caddy
citypass.duckdns.org {
	reverse_proxy host.docker.internal:8181
}
```

**`host.docker.internal` y no `127.0.0.1`**: el proxy corre adentro de un contenedor, así
que `127.0.0.1` es su propio loopback y nunca encontraría al vecino. El compose le da ese
nombre con `extra_hosts: host.docker.internal:host-gateway`. Por eso el vecino tiene que
publicar su puerto en `0.0.0.0` y no en `127.0.0.1`: lo que lo mantiene fuera de internet
es la Security List de la VCN, donde ese puerto no se abre.

Cocinadas no usa `host.docker.internal` porque comparte el compose con el proxy y se
resuelve por nombre de servicio (`web:80`), sin salir a la red del host.

## Después de agregar o sacar uno

```bash
cd ~/cocinadas && docker compose restart proxy
```
