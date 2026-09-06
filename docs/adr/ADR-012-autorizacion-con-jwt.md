# ADR-012: Autorización con JWT emitido por usuarios y verificado localmente

**Estado:** Superado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)
**Fecha:** 2026-09-05

---

## Contexto

Las cocinadas se guardan por usuario (ADR-005), así que `cocinadas` tiene que saber quién
hace cada petición. El servicio que conoce a los usuarios es `usuarios` (ADR-002). Los
servicios se comunican por eventos, no por HTTP entre sí (ADR-003), y una VM chica no
quiere una llamada extra por cada petición.

## Opciones consideradas

### 1. Sesiones en la base, consultadas por cada servicio

Un `session_id` en cookie y una tabla de sesiones que `cocinadas` consulta en cada
petición. Se descartó porque obliga a `cocinadas` a leer una tabla de `usuarios` (rompe la
frontera del ADR-005) o a llamar a `usuarios` por HTTP en cada petición (lo que el ADR-003
evita).

### 2. Un proxy que autentique (Caddy con un módulo de auth) y pase la identidad en una cabecera

Parecía elegante: los servicios confían en `X-Usuario` que pone el proxy. No lo es: un
servicio que confía en una cabecera confía en que nadie llega sin pasar por el proxy, y
en la red interna del compose cualquier contenedor puede hablarle a otro directamente.
La invariante 7 dice que duplicar la **decisión** de seguridad en cada servicio suele ser
correcto; delegarla toda en el proxy es lo contrario.

### 3. JWT firmado con una clave compartida (HS256), emitido por usuarios y verificado por cada servicio

`usuarios` emite un token firmado con `JWT_SECRET` al iniciar sesión; `cocinadas`
verifica la firma con la misma clave, sin llamar a nadie. Cada servicio decide por sí
mismo si la petición está autorizada.

## Decisión

Opción 3. Detalles que fija este ADR:

- Algoritmo HS256 con `JWT_SECRET` del `.env` (ADR-001); `config.ts` rechaza secretos de
  menos de 32 caracteres para que un `.env` copiado del ejemplo no arranque en producción.
- Claims: `sub` (id del usuario), `iat`, `exp`. Vida corta (horas), no días: sin lista de
  revocación, la vida del token es la única forma de invalidarlo.
- El token viaja en la cabecera `Authorization: Bearer`, no en cookie: la SPA lo guarda
  en memoria y lo renueva; así no hay CSRF que mitigar.
- La verificación es **local** en cada servicio; la implementación se copia (invariante
  7), la decisión es la misma.
- Sin sesión, la app funciona igual pero no guarda cocinadas: la SPA distingue «no hay
  sesión» de «el servicio no contesta».

## Consecuencias

### Positivas

- Cero llamadas entre servicios por petición.
- Cada servicio se defiende solo, incluso si alguien llega sin pasar por el proxy.
- Sin estado de sesión en la base.

### Negativas

- Un token robado vale hasta que expira; no hay revocación inmediata. Mitigación: vida
  corta y renovación.
- La clave es compartida: si se filtra, cualquiera emite tokens válidos para todos los
  servicios. Rotarla invalida todas las sesiones a la vez.
- La verificación está duplicada en dos servicios (y en los que vengan).

### Lo que no cambia

`catalogo` no autentica nada: el catálogo es público.

## Cuándo revisar esta decisión

- Si hace falta revocar sesiones al instante (baja de usuario, robo): lista de
  revocación por eventos, o RS256 con rotación de claves.
- Si aparece un consumidor externo de la API: OAuth2/OIDC con un proveedor.

## Referencias

- [ADR-002](ADR-002-tres-microservicios.md), [ADR-003](ADR-003-eventos-con-nats-jetstream.md).
- `docs/SECURITY.md`.

---

## Enmienda (2026-09-06): superado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)

No hay nada que autorizar: no existe el servicio que emitía los JWT ni el que los
verificaba, y `JWT_SECRET` salió del `.env`. La decisión vuelve a estar abierta para
cuando haya cuentas de verdad.
