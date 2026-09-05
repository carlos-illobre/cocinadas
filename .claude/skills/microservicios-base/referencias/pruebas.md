# Estrategia de pruebas

Tres niveles, separados por lo que necesitan y por si tienen compuerta.

| Nivel | Necesita | Compuerta | Corredor |
|---|---|---|---|
| Unitarias | Nada | **Sí**: 100 % de instrucciones y ramas | `tests/utest.sh` |
| Integración | El stack levantado | No | `tests/itest.sh` |
| Mutación | Nada | **No**, informa | `tests/mutation.sh` |

**Por qué separadas:** mezclarlas hace que una suite que debería correr en segundos
dependa de que haya un broker arriba, y que la compuerta de cobertura se vuelva
inaplicable porque los tests de integración inflan los números sin probar ramas.

---

## Unitarias

Corren sin levantar nada y **exigen el 100 %**. La compuerta va en el build de cada
servicio, y el corredor la vuelve a comprobar para que el fallo se vea en una tabla que
dice qué clase bajó, en vez de en un error de la herramienta de build.

### El corredor

Recorre los servicios, corre la suite de cada uno, y para cada uno imprime: cuántas
pruebas pasaron, la cobertura por clase, y el total. Sale con código 1 si alguno baja del
umbral, **nombrando cuál y en qué métrica**.

**Un detalle que costó encontrar:** al contar pruebas, apuntá al directorio de resultados
**de las unitarias**, no al directorio padre. Ahí abajo también están los de integración,
y contarlos hace que el número cambie según si alguien corrió el otro corredor antes —con
la etiqueta diciendo «unitarias» en los dos casos.

---

## Integración

Necesitan el stack arriba y no tienen compuerta de cobertura. Verifican lo que ninguna
prueba unitaria puede:

- **Paridad de configuración por ambiente** (ver más abajo).
- **Los límites configurados se cumplen de verdad**: el tope de memoria, la retención, el
  rate limit, el cupo. Se comprueban contra el sistema corriendo, no contra la constante
  del código.
- **El camino de punta a punta** entre servicios.

Aceptan `--rapido` para saltear las que tardan minutos, y dicen cuáles saltearon.

### La prueba de paridad, que es la que más rinde

Comprueba dos cosas:

1. Que todos los `.env*` declaren **exactamente el mismo conjunto de variables**.
2. Que **ninguna variable que el compose interpola** quede sin declarar en ellos.

La segunda es la que atrapa el error caro: una variable que el compose usa y ningún `.env`
define cae en su valor por omisión sin que nada avise. En el mejor caso el ambiente
arranca distinto de lo esperado; en el peor —una variable de seguridad— arranca abierto.

---

## Mutación

Rompe el código a propósito y mira si alguna prueba se da cuenta. **Sólo aporta cuando la
cobertura ya está en el techo**, que es cuando deja de poder distinguir una prueba que
verifica de una decorativa.

### Sin umbral, y no es pereza

Existen los **mutantes equivalentes**: producen código con el mismo comportamiento, así
que ninguna prueba puede matarlos, y decidir si un mutante es equivalente es indecidible
en el caso general. Un umbral obligaría a pelear con eso en vez de leer los
sobrevivientes que sí importan.

**El objetivo correcto no es un porcentaje: es que no quede ningún sobreviviente sin
explicar.** Cada uno termina en una de tres cosas:

1. Una prueba nueva, porque es un hueco real.
2. Una anotación con el motivo, porque es equivalente. Las herramientas suelen filtrar por
   anotación —basta con que se llame `DoNotMutate`— y entonces el número recupera sentido.
3. Una decisión documentada de no cubrirlo.

Cuando no queda ninguno sin clasificar, el 100 % sí es alcanzable y sí puede ser
compuerta.

### Dos cosas que arruinan el informe si no se configuran

**El ruido del compilador.** Los lenguajes que insertan código —comprobaciones de nulidad,
métodos sintéticos— hacen que la herramienta mute ese código y produzca mutantes que nadie
puede matar. Medido en una suite con la cobertura al 100 %: **76 de 94 sobrevivientes**. Casi siempre hay una
opción para excluir esas llamadas; buscala antes de mirar el informe.

**Las llamadas al registro de logs.** Nadie asserta sobre los logs, así que borrarlas
siempre sobrevive. Las herramientas suelen filtrarlas de fábrica, **pero la opción que
excluye llamadas puede reemplazar esa lista en vez de sumarse a ella**: al configurar la
primera exclusión se pierde la segunda sin aviso. En la misma suite eso eran otros
**53 de 98**. Revisá que la lista incluya las dos cosas.

Entre las dos configuraciones, esa suite pasó de 98 sobrevivientes a 44 sin escribir una
sola prueba nueva. Ninguno de los dos ajustes viene de fábrica.

---

## Mutation testing a mano, además del automático

Antes de que exista el automático —y para lo que el automático no alcanza— rompé a
propósito los puntos críticos y confirmá que la prueba falla. **Documentá el ejercicio en
una tabla**, incluidas las filas donde la prueba **no** detectó nada: esas son las que
valen.

Cosas que el mutation testing automático no cubre y este ejercicio sí:

- Borrar una variable de un `.env`.
- Cambiar la implementación de una biblioteca por otra que dice hacer lo mismo.
- Quitar una anotación que hace que un componente exista.

---

## La documentación de pruebas

`docs/TESTING.md` explica los niveles, **qué está excluido de la cobertura y por qué, una
clase a la vez**, y el resultado del mutation testing. Los números salen de lo que el
build ya produjo, no se escriben a mano: se desfasan.
