#!/usr/bin/env bash
#
# Paridad de configuración por ambiente (invariante 4). Comprueba dos cosas:
#
#   1. Que todos los .env de la aplicación declaren EXACTAMENTE las mismas variables:
#      .env.example, deployment/oracle-single/.env.oracle y, si existe, .env.
#   2. Que ninguna variable que docker-compose.yml interpola quede sin declarar en ellos.
#
# La segunda es la que atrapa el error caro: una variable que el compose usa y ningún
# .env define cae en su valor por omisión sin que nada avise.
#
# Lo mismo para el par de despliegue: deployment/oracle-single/.env.deploy.example y,
# si existe, deployment/oracle-single/.env.
#
# No necesita el stack arriba. Sale con 1 si hay diferencias, nombrando cuál.
set -uo pipefail
. "$(dirname "$0")/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

fallos=0

# Nombres de variable declarados en un archivo .env (ignora comentarios y vacías).
variables_de() {
    sed -n 's/^[[:space:]]*\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' "$1" | sort -u
}

comparar_conjunto() {
    local referencia=$1 archivo=$2
    local faltan sobran
    faltan=$(comm -23 <(variables_de "$referencia") <(variables_de "$archivo"))
    sobran=$(comm -13 <(variables_de "$referencia") <(variables_de "$archivo"))
    if [ -z "$faltan" ] && [ -z "$sobran" ]; then
        ok "$archivo declara lo mismo que $referencia"
    else
        mal "$archivo difiere de $referencia"
        [ -n "$faltan" ] && nota "faltan:  $(echo "$faltan" | tr '\n' ' ')"
        [ -n "$sobran" ] && nota "sobran:  $(echo "$sobran" | tr '\n' ' ')"
        fallos=$((fallos+1))
    fi
}

titulo "Los .env de la aplicación"
referencia=.env.example
for archivo in deployment/oracle-single/.env.oracle .env; do
    if [ -f "$archivo" ]; then
        comparar_conjunto "$referencia" "$archivo"
    else
        aviso "$archivo no existe (válido: es local y no se versiona)"
    fi
done

titulo "Lo que interpola docker-compose.yml"
# ${VAR}, ${VAR:?...}, ${VAR:-...}. Se excluyen los $$ que son para el shell del contenedor.
interpoladas=$(grep -o '[^$]\${[A-Za-z_][A-Za-z0-9_]*' docker-compose.yml | sed 's/.*\${//' | sort -u)
sin_declarar=$(comm -23 <(echo "$interpoladas") <(variables_de "$referencia"))
if [ -z "$sin_declarar" ]; then
    ok "las $(echo "$interpoladas" | wc -l | tr -d ' ') variables que usa el compose están declaradas en $referencia"
else
    mal "el compose usa variables que $referencia no declara:"
    nota "$(echo "$sin_declarar" | tr '\n' ' ')"
    fallos=$((fallos+1))
fi
# Un valor por omisión en el compose (${VAR:-x} o ${VAR-x}) es un fallback: convierte una
# variable olvidada en un ambiente que arranca distinto sin avisar (invariante 3).
fallbacks=$(grep -oE '\$\{[A-Za-z_][A-Za-z0-9_]*:?-[^}]*\}' docker-compose.yml | sort -u)
if [ -z "$fallbacks" ]; then
    ok "el compose no tiene valores por omisión: toda variable ausente corta el arranque"
else
    mal "el compose tiene valores por omisión (fallbacks):"
    nota "$(echo "$fallbacks" | tr '\n' ' ')"
    fallos=$((fallos+1))
fi
no_usadas=$(comm -13 <(echo "$interpoladas") <(variables_de "$referencia"))
if [ -n "$no_usadas" ]; then
    aviso "declaradas en $referencia pero no usadas por el compose: $(echo "$no_usadas" | tr '\n' ' ')"
    nota "si ya no hacen falta, borrarlas de los tres .env"
fi

titulo "Los .env del despliegue"
referencia=deployment/oracle-single/.env.deploy.example
if [ -f deployment/oracle-single/.env ]; then
    comparar_conjunto "$referencia" deployment/oracle-single/.env
else
    aviso "deployment/oracle-single/.env no existe (válido hasta el primer despliegue)"
fi

printf '\n'
if [ "$fallos" -eq 0 ]; then
    printf "${VERDE}✓ paridad de configuración${NC}\n"
else
    printf "${ROJO}✗ %s diferencia(s) de configuración${NC}\n" "$fallos"
fi
exit "$fallos"
