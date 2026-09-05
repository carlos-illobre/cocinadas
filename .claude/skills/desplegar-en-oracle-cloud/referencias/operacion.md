# Operación: TLS, disco, respaldo y los límites del plan gratuito

## El dominio y el certificado

Let's Encrypt **no emite certificados para direcciones IP**. Sin dominio no hay HTTPS, y
sin HTTPS el navegador marca el sitio como no seguro y algunas APIs del navegador ni
funcionan.

Tres caminos, de menos a más:

| | Costo | Sirve para |
|---|---|---|
| Sólo IP, sin TLS | 0 | Una demo interna. Nada que reciba credenciales |
| Dominio dinámico gratuito | 0 | Un trabajo práctico, un proyecto personal |
| Dominio propio | unos dólares al año | Cualquier cosa que alguien más vaya a usar |

Los dominios dinámicos gratuitos funcionan perfectamente con Let's Encrypt: se apunta el
subdominio a la IP pública de la instancia y se emite el certificado igual.

### El certificado se emite con el puerto 80 abierto

El desafío HTTP-01 exige que Let's Encrypt pueda llegar al puerto 80 desde internet. Si
está cerrado en la Security List, la emisión falla con un error que habla de «connection
refused» y no de firewalls.

**El orden importa:** abrir puertos → apuntar el DNS → *esperar a que propague* → emitir.
Emitir antes de que el DNS resuelva quema uno de los pocos intentos que Let's Encrypt
permite por hora.

Comprobá la propagación antes de intentar:

```sh
dig +short tu-dominio
```

Si no devuelve la IP de la instancia, todavía no.

### La renovación

Los certificados de Let's Encrypt duran 90 días. La renovación tiene que ser automática y
—esto es lo que se olvida— **el proxy tiene que recargar la configuración** después de
renovar: un certificado nuevo en el disco que el proceso no releyó sigue sirviendo el
viejo hasta que alguien reinicie.

---

## El disco se llena, y la limpieza obvia no limpia

En una instancia chica el disco es un recurso escaso, y cada despliegue deja imágenes.

**`docker image prune` sin `-a` no sirve para esto.** Sin esa opción borra sólo imágenes
*colgadas* (sin etiqueta), y las imágenes etiquetadas por SHA **nunca están colgadas**: cada
una conserva su etiqueta. El comando corre, dice que liberó cero bytes, y el disco sigue
creciendo.

```sh
docker image prune -af --filter until=24h
```

- `-a` incluye las etiquetadas que ningún contenedor usa. **Es la que hace el trabajo.**
- `--filter until=24h` conserva las recientes, para que revertir al despliegue anterior no
  tenga que volver a bajar todo.

Que el script **informe cuánto liberó y cuánto queda libre**. Una limpieza silenciosa es
indistinguible de una que no hace nada — que es exactamente lo que pasaba.

---

## Respaldo

El estado que importa vive en volúmenes. Se respaldan con un contenedor descartable:

```sh
docker run --rm -v <volumen>:/d -v "$PWD:/b" alpine tar czf /b/<volumen>.tgz -C /d .
```

Enumerá **todos** los volúmenes del compose, y para cada uno decí en la guía **qué se
pierde** si se pierde. «Un respaldo de tres volúmenes» no le dice a nadie cuál es urgente;
«perder este borra las suscripciones, que no están replicadas en ningún lado» sí.

---

## Los límites del plan gratuito

Lo que hay que tener presente para no llevarse una sorpresa:

- **La transferencia de salida tiene un tope mensual.** Servir archivos pesados desde la
  instancia lo consume rápido.
- **El balanceador de capa 7 está incluido pero limitado a 10 Mbps.** El de red (capa 4)
  no tiene ese tope declarado.
- **El API Gateway NO está en el plan gratuito.** Es un error común al buscar reemplazo
  para un proxy propio.
- **Una instancia inactiva puede reclamarse.** Oracle recupera las que están sin uso;
  vale la pena que algo la mantenga con actividad si el proyecto tiene que seguir online.

Verificá los límites vigentes en la documentación de Oracle antes de afirmarlos en la
guía: cambian, y una guía que promete algo que ya no es gratis es peor que no tener guía.

---

## La operación de todos los días

La guía tiene que cerrar con esto, que es lo que se consulta después:

```sh
# qué está corriendo y con qué versión
ssh destino 'cd <ruta> && docker compose ps'

# los logs de un servicio
ssh destino 'cd <ruta> && docker compose logs -f --tail 100 <servicio>'

# cuánto consume cada uno
ssh destino 'docker stats --no-stream'

# espacio en disco
ssh destino 'df -h / && docker system df'

# reiniciar uno solo
ssh destino 'cd <ruta> && docker compose restart <servicio>'
```

Y **cómo volver atrás**, que es lo que se busca con apuro y no se encuentra:

```sh
bash deployment/oracle-single/deploy.sh <sha-anterior>
```
