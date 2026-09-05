"""Valida los JSON de recetas contra el catálogo de fichas.

Uso:  python data/recetas/validar-receta.py            (todas las recetas)
      python data/recetas/validar-receta.py ruta.json  (una sola)

Sin dependencias externas. Devuelve código 1 si hay errores.
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_ING = os.path.join(RAIZ, "ingredientes")
DIR_UT = os.path.join(RAIZ, "utencillos")
DIR_REC = os.path.join(RAIZ, "recetas")
ETIQUETAS = {"NUTRICIÓN", "DESPERDICIO", "TIEMPO", "SEGURIDAD", "SABOR"}
TIPOS = {"frio", "calor", "hervor", "tapado", "reposo"}


def ids_fichas(carpeta, recursivo):
    ids = set()
    for base, dirs, archivos in os.walk(carpeta):
        for a in archivos:
            if a.endswith(".md") and a != "README.md" and not a.startswith(("plantilla-", "indice-")):
                ids.add(a[:-3])
        if not recursivo:
            break
    return ids


def validar(ruta, ing_ids, ut_ids):
    errores = []
    e = errores.append
    with io.open(ruta, encoding="utf-8") as f:
        r = json.load(f)
    carpeta = os.path.dirname(ruta)
    base = os.path.basename(ruta)[:-5]

    if r.get("esquema") != 1:
        e("esquema debe ser 1")
    esperado = f"{r.get('plato')}-v{r.get('version', {}).get('numero')}-{r.get('version', {}).get('clave')}"
    if base != esperado:
        e(f"el nombre del archivo debería ser {esperado}.json")
    if os.path.basename(carpeta) != r.get("plato"):
        e(f"la carpeta debería llamarse {r.get('plato')}")
    for k in ("html", "pdf"):
        a = r.get("fuentes", {}).get(k)
        if not a or not os.path.exists(os.path.join(carpeta, a)):
            e(f"fuentes.{k} no existe: {a}")
    foto = r.get("fuentes", {}).get("foto")
    if foto is None:
        e("fuentes.foto falta: la app muestra el plato por su foto (recetas/README.md)")
    elif not os.path.exists(os.path.join(carpeta, foto)):
        e(f"fuentes.foto no existe: {foto}")
    elif not foto.lower().endswith((".jpg", ".jpeg", ".webp")):
        e(f"fuentes.foto tiene que ser JPEG o WebP (fotos, sin transparencia): {foto}")

    for i in r.get("ingredientes", []):
        if i.get("id") is not None and i["id"] not in ing_ids:
            e(f"ingrediente sin ficha: {i['id']}")
    for u in r.get("utensilios", []):
        if u.get("id") is not None and u["id"] not in ut_ids:
            e(f"utensilio sin ficha: {u['id']}")
    ing_receta = {i["id"] for i in r.get("ingredientes", []) if i.get("id")}
    ut_receta = {u["id"] for u in r.get("utensilios", []) if u.get("id")}

    total = 0
    for et in r.get("etapas", []):
        pid = et["id"]
        pasos = et.get("pasos", [])
        procs = et.get("procesos", [])
        ids_pasos = {p["id"] for p in pasos}
        ids_procs = {p["id"] for p in procs}
        dur = et.get("duracion_s", 0)
        total += dur

        fin_anterior = 0
        for p in pasos:
            if not p["id"].startswith(pid + "-"):
                e(f"{p['id']}: el id debería empezar con {pid}-")
            if p["inicio_s"] < fin_anterior:
                e(f"{p['id']}: empieza en {p['inicio_s']} s pero el paso anterior termina en {fin_anterior} s")
            fin_anterior = p["inicio_s"] + p["duracion_s"]
            for x in p.get("ingredientes", []):
                if x not in ing_receta:
                    e(f"{p['id']}: ingrediente {x} no está en la lista de la receta")
            for x in p.get("utensilios", []):
                if x not in ut_receta:
                    e(f"{p['id']}: utensilio {x} no está en la lista de la receta")
            for x in p.get("inicia_procesos", []):
                if x not in ids_procs:
                    e(f"{p['id']}: inicia_procesos apunta a {x}, que no existe")
            for t in p.get("por_que", {}).get("etiquetas", []):
                if t not in ETIQUETAS:
                    e(f"{p['id']}: etiqueta desconocida {t}")
            if not p.get("acciones"):
                e(f"{p['id']}: sin acciones")
        if pasos and fin_anterior != dur:
            e(f"{pid}: los pasos terminan en {fin_anterior} s pero la etapa dura {dur} s")

        for pr in procs:
            if not pr["id"].startswith(pid + "-"):
                e(f"{pr['id']}: el id debería empezar con {pid}-")
            if pr.get("tipo") not in TIPOS:
                e(f"{pr['id']}: tipo desconocido {pr.get('tipo')}")
            if not (0 <= pr["inicio_s"] < pr["fin_s"] <= dur):
                e(f"{pr['id']}: [{pr['inicio_s']}, {pr['fin_s']}] fuera de la etapa (0–{dur})")
            if pr.get("al_terminar") is not None and pr["al_terminar"] not in ids_pasos:
                e(f"{pr['id']}: al_terminar apunta a {pr['al_terminar']}, que no existe")
            if pr.get("ingrediente") and pr["ingrediente"] not in ing_receta:
                e(f"{pr['id']}: ingrediente {pr['ingrediente']} no está en la receta")
            if pr.get("utensilio") and pr["utensilio"] not in ut_receta:
                e(f"{pr['id']}: utensilio {pr['utensilio']} no está en la receta")

    if total != r.get("tiempo_total_s"):
        e(f"tiempo_total_s es {r.get('tiempo_total_s')} pero las etapas suman {total}")
    return errores


def main():
    ing_ids = ids_fichas(DIR_ING, recursivo=True)
    ut_ids = ids_fichas(DIR_UT, recursivo=False)
    rutas = sys.argv[1:] or sorted(
        os.path.join(b, a)
        for b, _, arch in os.walk(DIR_REC)
        for a in arch
        if a.endswith(".json") and b != DIR_REC
    )
    fallas = 0
    for ruta in rutas:
        errs = validar(ruta, ing_ids, ut_ids)
        rel = os.path.relpath(ruta, RAIZ)
        if errs:
            fallas += 1
            print(f"ERROR {rel}")
            for x in errs:
                print("   - " + x)
        else:
            print(f"OK    {rel}")
    print(f"{len(rutas)} receta(s), {fallas} con errores")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
