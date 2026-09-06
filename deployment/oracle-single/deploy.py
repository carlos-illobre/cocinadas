#!/usr/bin/env python3
"""Actualiza la instancia de Oracle con lo que hay en la rama principal (ADR-011).

Se ejecuta DESDE LA MÁQUINA DE QUIEN DESPLIEGA, no desde la instancia. En Python y no en
shell para que corra igual en Windows, macOS y Linux, y en el CI, sin depender de bash:

    python deployment/oracle-single/deploy.py              el último commit de origin/main
    python deployment/oracle-single/deploy.py <sha>        un commit concreto, o volver atrás
    python deployment/oracle-single/deploy.py --dry-run    imprime los comandos, no toca nada
    python deployment/oracle-single/deploy.py --preflight  las comprobaciones previas

Todo lo del despliegue sale de deployment/oracle-single/.env, así que este archivo no
tiene ningún dato de la instancia y se versiona sin filtrar nada.

Por qué por SHA y no por `latest`: `latest` es una etiqueta móvil, sirve para «dame lo
último» pero no para saber qué está corriendo. Con el SHA fijado, `docker compose ps`
dice exactamente qué versión hay, la reversión es determinística, y dos despliegues del
mismo commit no traen cosas distintas.

NO se prueba ejecutándolo: se verifica leyéndolo y con --dry-run, que imprime cada
comando remoto sin correrlo.
"""

from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

RAMA_PRINCIPAL = "main"
# Puertos de /health publicados en 127.0.0.1 de la instancia. Los define el .env de la VM;
# estos son el respaldo para --dry-run, que no llega a leerlo.
PUERTOS_POR_OMISION = {"catalogo": 3101, "usuarios": 3102, "cocinadas": 3103, "frontend": 8180}
INTENTOS_HEALTH = 30
ESPERA_ENTRE_INTENTOS_S = 4

# La consola de Windows viene en una codificación heredada que no sabe escribir «✓»:
# sin esto, el script muere con UnicodeEncodeError en la primera línea que imprime.
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8")
    except (AttributeError, OSError):
        pass


def _se_puede_escribir(texto: str) -> bool:
    try:
        texto.encode(sys.stdout.encoding or "ascii")
    except (UnicodeEncodeError, LookupError):
        return False
    return True


# Y si aun así no entran, se usan símbolos que entren en cualquier consola.
_TILDE, _CRUZ, _FLECHA = ("✓", "✗", "▶") if _se_puede_escribir("✓✗▶") else ("OK", "X", ">")

# Los colores se apagan solos cuando la salida no es una terminal (el log del CI, un
# archivo): si no, quedan los códigos de escape crudos entre el texto.
_COLOR = sys.stdout.isatty() and os.environ.get("NO_COLOR") is None
VERDE, ROJO, NEGRITA, NC = ("\033[0;32m", "\033[0;31m", "\033[1m", "\033[0m") if _COLOR else ("", "", "", "")


def ok(mensaje: str) -> None:
    print(f"  {VERDE}{_TILDE}{NC} {mensaje}")


def info(mensaje: str) -> None:
    print(f"    {mensaje}")


def paso(mensaje: str) -> None:
    print(f"\n{NEGRITA}{_FLECHA} {mensaje}{NC}")


def morir(mensaje: str) -> None:
    print(f"\n{ROJO}{_CRUZ} {mensaje}{NC}", file=sys.stderr)
    raise SystemExit(1)


def raiz_del_repositorio() -> Path:
    """La raíz según git, no contando `..`: así funciona desde cualquier directorio."""
    try:
        salida = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=Path(__file__).resolve().parent,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError):
        morir("no encuentro la raíz del repositorio (¿está git en el PATH?)")
    return Path(salida.stdout.strip())


def leer_env(ruta: Path) -> dict[str, str]:
    """Las líneas `CLAVE=valor` de un .env. Sin expandir nada: son valores literales."""
    valores: dict[str, str] = {}
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        limpia = linea.strip()
        if not limpia or limpia.startswith("#") or "=" not in limpia:
            continue
        clave, _, valor = limpia.partition("=")
        valores[clave.strip()] = valor.strip().strip("'\"")
    return valores


class Instancia:
    """Los comandos contra la VM. En --dry-run se imprimen en vez de correrse.

    Escrito así desde el principio y no improvisado con un `if` en cada llamada: la forma
    de probar algo que despliega no es desplegando.
    """

    def __init__(self, destino: str, dry_run: bool) -> None:
        self.destino = destino
        self.dry_run = dry_run

    def correr(self, comando: str, *, silencioso: bool = False) -> tuple[int, str]:
        """Corre un comando en la instancia. Devuelve el código de salida y su salida."""
        if self.dry_run:
            print(f"    $ ssh {self.destino} {comando!r}")
            return 0, ""
        proceso = subprocess.run(
            ["ssh", self.destino, comando],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if not silencioso and proceso.stderr.strip():
            info(proceso.stderr.strip())
        return proceso.returncode, proceso.stdout.strip()

    def copiar(self, origen: Path, destino_remoto: str) -> int:
        if self.dry_run:
            print(f"    $ scp {origen} {self.destino}:{destino_remoto}")
            return 0
        return subprocess.run(["scp", "-q", str(origen), f"{self.destino}:{destino_remoto}"]).returncode


def resolver_sha(raiz: Path, pedido: str | None, dry_run: bool) -> str:
    paso("Resolviendo la versión")
    hay_remoto = subprocess.run(
        ["git", "fetch", "origin", RAMA_PRINCIPAL, "--quiet"],
        cwd=raiz,
        capture_output=True,
    ).returncode == 0
    if not hay_remoto:
        # Sin remoto no hay «último commit verificado»: en --dry-run se sigue con HEAD
        # para poder leer los comandos; en un despliegue real es un error.
        if not dry_run:
            morir("no se pudo consultar el remoto")
        info(f"(sin remoto: --dry-run usa HEAD local en vez de origin/{RAMA_PRINCIPAL})")

    referencia = pedido if pedido else ("HEAD" if not hay_remoto else f"origin/{RAMA_PRINCIPAL}")
    resultado = subprocess.run(
        ["git", "rev-parse", "--verify", f"{referencia}^{{commit}}"],
        cwd=raiz,
        capture_output=True,
        text=True,
    )
    if resultado.returncode != 0:
        morir(f"'{referencia}' no es un commit de este repositorio")
    sha = resultado.stdout.strip()
    if pedido:
        info(f"SHA pedido a mano: {sha[:7]}")
    else:
        # El último commit del remoto, no el de la copia local: desplegar lo que hay en el
        # disco es cómo termina en producción un commit que nunca pasó por el CI.
        info(f"último de origin/{RAMA_PRINCIPAL}: {sha[:7]}")
    ok(f"versión a desplegar: {sha[:7]}")
    return sha


def puertos_de_la_instancia(vm: Instancia, ruta_remota: str) -> dict[str, int]:
    """Los PUERTO_* del .env de la VM; si no se pueden leer, los de por omisión."""
    if vm.dry_run:
        return PUERTOS_POR_OMISION
    codigo, salida = vm.correr(
        f"sed -n 's/^PUERTO_\\(CATALOGO\\|USUARIOS\\|COCINADAS\\|FRONTEND\\)=//p' '{ruta_remota}/.env'",
        silencioso=True,
    )
    valores = [linea for linea in salida.splitlines() if linea.strip()]
    if codigo != 0 or len(valores) != 4:
        info("no pude leer los PUERTO_* del .env remoto: uso los de por omisión")
        return PUERTOS_POR_OMISION
    return dict(zip(("catalogo", "usuarios", "cocinadas", "frontend"), (int(v) for v in valores)))


def preflight(vm: Instancia, raiz: Path) -> int:
    """Corre las comprobaciones previas EN la instancia, sin tocar nada."""
    guion = raiz / "deployment" / "oracle-single" / "preflight.sh"
    paso("Comprobaciones previas en la instancia")
    if vm.dry_run:
        print(f"    $ ssh {vm.destino} 'bash -s' < {guion}")
        return 0
    with guion.open("rb") as f:
        return subprocess.run(["ssh", vm.destino, "bash -s"], stdin=f).returncode


def desplegar(vm: Instancia, raiz: Path, ruta_remota: str, sha: str) -> None:
    paso("Estado actual de la instancia")
    anterior = ""
    if not vm.dry_run:
        _, anterior = vm.correr(f"grep -m1 '^TAG=' '{ruta_remota}/.env' 2>/dev/null | cut -d= -f2", silencioso=True)
    if anterior:
        ok(f"corriendo ahora: {anterior[:7]}")
        info(f"para volver acá:  python {Path(__file__).name} {anterior}")
        if anterior == sha:
            info("(es la misma versión: el despliegue va a ser un no-op)")
    else:
        info("no hay despliegue previo, no se pudo leer, o es --dry-run")

    paso("Copiando la configuración")
    # El .env de la APLICACIÓN en la instancia NO se pisa: tiene los valores de producción
    # y no está en el repositorio. Solo se actualiza la etiqueta de versión.
    if vm.copiar(raiz / "docker-compose.yml", f"{ruta_remota}/docker-compose.yml") != 0:
        morir("no pude copiar el docker-compose.yml")
    ok("docker-compose.yml")
    vm.correr(f"mkdir -p '{ruta_remota}/infrastructure/reverse-proxy'")
    if vm.copiar(raiz / "infrastructure" / "reverse-proxy" / "Caddyfile", f"{ruta_remota}/infrastructure/reverse-proxy/Caddyfile") != 0:
        morir("no pude copiar el Caddyfile")
    ok("infrastructure/reverse-proxy/Caddyfile")

    codigo, _ = vm.correr(
        f"cd '{ruta_remota}' && test -f .env && sed -i '/^TAG=/d' .env && printf 'TAG=%s\\n' '{sha}' >> .env"
    )
    if codigo != 0:
        morir(f"no se pudo fijar la versión: ¿existe {ruta_remota}/.env en la instancia? (sale de .env.oracle)")
    ok(f"TAG={sha[:7]} fijado en el .env remoto")

    paso("Trayendo las imágenes")
    # GHCR público no necesita login; si el paquete es privado, el `docker login ghcr.io`
    # se hace una vez en la instancia con un token de solo lectura.
    codigo, _ = vm.correr(f"cd '{ruta_remota}' && docker compose pull --quiet")
    if codigo != 0:
        morir(f"no se pudieron traer las imágenes de {sha[:7]} — ¿el CI terminó de publicarlas?")
    ok(f"imágenes de {sha[:7]} en la instancia")

    paso("Reemplazando los contenedores")
    # `up -d` reemplaza SOLO los contenedores cuya imagen cambió. No hace falta bajar todo.
    codigo, _ = vm.correr(f"cd '{ruta_remota}' && docker compose up -d --remove-orphans")
    if codigo != 0:
        morir("el reemplazo falló — la versión anterior puede haber quedado a medias")
    ok("contenedores actualizados")

    paso("Comprobando que quedó arriba")
    # `docker compose ps` muestra «Up» un contenedor que se está reiniciando en bucle. Lo
    # que dice que el despliegue salió bien es que los servicios CONTESTEN.
    for servicio, puerto in puertos_de_la_instancia(vm, ruta_remota).items():
        if vm.dry_run:
            info(f"$ ssh {vm.destino} curl -sf http://localhost:{puerto}/health  (hasta {INTENTOS_HEALTH} intentos)")
            continue
        for intento in range(INTENTOS_HEALTH):
            codigo, _ = vm.correr(f"curl -sf -o /dev/null http://localhost:{puerto}/health", silencioso=True)
            if codigo == 0:
                ok(f"{servicio} responde")
                break
            time.sleep(ESPERA_ENTRE_INTENTOS_S)
        else:
            vm.correr(f"cd '{ruta_remota}' && docker compose logs --tail 40 '{servicio}'")
            morir(
                f"{servicio} no respondió en {INTENTOS_HEALTH * ESPERA_ENTRE_INTENTOS_S // 60} minutos. "
                f"Para volver: python {Path(__file__).name} {anterior or '<sha-anterior>'}"
            )

    paso("Liberando disco")
    # `-a` no es opcional: sin ella se borran solo las imágenes COLGADAS, y las etiquetadas
    # por SHA nunca lo están —cada una conserva su etiqueta—. El comando corre, dice que
    # liberó cero, y el disco sigue creciendo.
    #
    # `until=24h` conserva las recientes para que revertir no tenga que volver a bajar todo.
    if vm.dry_run:
        info(f"$ ssh {vm.destino} docker image prune -af --filter until=24h")
    else:
        _, salida = vm.correr("docker image prune -af --filter until=24h", silencioso=True)
        info(salida.splitlines()[-1] if salida else "sin imágenes para borrar")
        _, libre = vm.correr("df -h / | awk 'NR==2 {print $4 \" de \" $2}'", silencioso=True)
        if libre:
            info(f"libre en /: {libre}")

    print(f"\n{VERDE}{_TILDE} desplegado {sha[:7]}{NC}")


def main(argumentos: list[str]) -> int:
    dry_run = "--dry-run" in argumentos
    solo_preflight = "--preflight" in argumentos
    sueltos = [a for a in argumentos if not a.startswith("-")]
    desconocidos = [a for a in argumentos if a.startswith("-") and a not in ("--dry-run", "--preflight")]
    if desconocidos:
        morir(f"opción desconocida: {desconocidos[0]}")
    if len(sueltos) > 1:
        morir("un solo SHA por vez")

    raiz = raiz_del_repositorio()
    config = raiz / "deployment" / "oracle-single" / ".env"
    if config.exists():
        valores = leer_env(config)
        destino = valores.get("SSH", "")
        ruta_remota = valores.get("RUTA_REMOTA", "")
    elif dry_run:
        # Sin configuración, --dry-run igual sirve para leer los comandos; es lo que corre
        # el CI para comprobar que este script no se rompió.
        info(f"(sin {config.relative_to(raiz).as_posix()}: --dry-run usa valores de ejemplo)")
        destino, ruta_remota = "usuario@instancia", "/home/usuario/templa"
    else:
        morir(f"falta {config} — copiar .env.deploy.example y completarlo")
    if not destino or not ruta_remota:
        morir(f"falta SSH o RUTA_REMOTA en {config}")

    vm = Instancia(destino, dry_run)
    if dry_run:
        info("(modo --dry-run: nada de lo que sigue toca la instancia)")

    if solo_preflight:
        return preflight(vm, raiz)

    sha = resolver_sha(raiz, sueltos[0] if sueltos else None, dry_run)
    desplegar(vm, raiz, ruta_remota, sha)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
