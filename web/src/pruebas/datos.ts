import type { Fetch, Receta, RecetaResumen } from '../api';

/** Datos de ejemplo con la forma que sirve el catálogo. Fuera de la cobertura (src/pruebas/**). */

export const resumenSpaghetti: RecetaResumen = {
  plato: 'spaghetti-integral-brocoli-camarones',
  nombre: 'Spaghetti integral con brócoli, champiñones y camarones al limón',
  momento: 'cena',
  porciones: 1,
  nutricion: { kcal: 720, proteina_g: 38, fibra_g: 17, sodio_mg: 250 },
  foto: '/fotos/recetas/spaghetti-integral-brocoli-camarones.jpg',
  versiones: [
    { numero: 1, clave: 'linea-de-tiempo', titulo: 'Flujo continuo', resumen: 'Todo en una sola pasada.', icono: '⚡', tiempo_total_s: 960, tiempo_total_texto: '16 min' },
    { numero: 2, clave: 'dos-etapas', titulo: 'Mise en place primero', resumen: 'Primero se prepara todo sin apuro.', icono: '🎯', tiempo_total_s: 1260, tiempo_total_texto: '11 + 10 min' },
  ],
};

export const resumenSinFoto: RecetaResumen = {
  plato: 'merluza-arroz',
  nombre: 'Merluza al limón con arroz integral',
  momento: 'almuerzo',
  porciones: 2,
  nutricion: { kcal: 600, proteina_g: 40, fibra_g: 9, sodio_mg: 200 },
  foto: null,
  versiones: [{ numero: 1, clave: 'linea-de-tiempo', titulo: 'Flujo continuo', resumen: 'r', icono: '⚡', tiempo_total_s: 1500, tiempo_total_texto: '25 min' }],
};

export const recetaDosEtapas: Receta = {
  ...resumenSpaghetti,
  version: resumenSpaghetti.versiones[1] as Receta['version'],
  sal_agregada_g: 0,
  tiempo_total_s: 1260,
  tiempo_total_texto: '11 + 10 min',
  utensilios: [
    { id: 'wok-eternity-copper-30cm', nombre: 'Wok Eternity 30 cm con su tapa', uso: 'Todo lo del wok', foto: '/fotos/utensilios/wok-eternity-copper-30cm.jpg', foto_grande: '/fotos/utensilios-grandes/wok-eternity-copper-30cm.jpg' },
    { id: 'jarro-slow-fire-2l', nombre: 'Jarro hervidor Slow Fire 2 L', uso: 'Hervir la pasta', foto: null, foto_grande: null },
    { id: null, nombre: '1 bol mediano', uso: 'Descongelar', foto: null, foto_grande: null },
  ],
  ingredientes: [
    { id: 'brocoli-entero', nombre: 'Brócoli fresco entero', cantidad: '½ pieza', preparacion: 'Flores, tallo y hojas', foto: '/fotos/ingredientes/brocoli-entero.jpg', foto_grande: '/fotos/ingredientes-grandes/brocoli-entero.jpg' },
    { id: 'ajo-picado-congelado', nombre: 'Ajo picado congelado', cantidad: '1 cdta', preparacion: 'Directo al wok', foto: null, foto_grande: null },
    { id: null, nombre: 'Agua', cantidad: '0,8 L', preparacion: 'Para la pasta', foto: null, foto_grande: null },
  ],
  etapas: [
    {
      id: 'e1',
      numero: 1,
      nombre: 'Etapa 1 · Preparación',
      vigilancia: false,
      duracion_s: 660,
      arranque: 'Al abrir el freezer.',
      pausa_despues: 'Puede haber pausa.',
      procesos: [{ id: 'e1-camarones', nombre: 'Camarones en agua fría', tipo: 'frio', inicio_s: 0, fin_s: 600, critico: false, ingrediente: 'camarones-congelados', nota: 'No usar agua tibia.', al_terminar: 'e1-p3' }],
      pasos: [
        { id: 'e1-p1', inicio_s: 0, duracion_s: 30, critico: false, espera: false, titulo: 'Pesar y poner a descongelar los camarones', acciones: ['Tarar el bol.'], ingredientes: ['camarones-congelados'], inicia_procesos: ['e1-camarones'], por_que: { etiquetas: ['SEGURIDAD'], texto: 'En agua fría se mantiene por debajo de 5 °C.' } },
        { id: 'e1-p2', inicio_s: 30, duracion_s: 150, critico: false, espera: false, titulo: 'Lavar y cortar el brócoli', acciones: ['Lavar.', 'Cortar.'], ingredientes: ['brocoli-entero'], inicia_procesos: [], por_que: { etiquetas: ['NUTRICIÓN'], texto: 'El reposo forma sulforafano.' } },
        { id: 'e1-p3', inicio_s: 180, duracion_s: 120, critico: false, espera: true, titulo: 'Esperar los camarones', acciones: ['Nada que vigilar.'], ingredientes: [], inicia_procesos: [], por_que: { etiquetas: ['TIEMPO'], texto: 'Porque sí.' } },
      ],
    },
    {
      id: 'e2',
      numero: 2,
      nombre: 'Etapa 2 · Cocción y plato',
      vigilancia: true,
      duracion_s: 600,
      arranque: 'Cuando el agua rompe hervor.',
      pausa_despues: null,
      procesos: [
        { id: 'e2-pasta', nombre: 'Spaghetti en el jarro', tipo: 'hervor', inicio_s: 75, fin_s: 495, critico: true, ingrediente: 'tallarines-en-paquete', nota: '7 min al dente.', al_terminar: 'e2-p5' },
        { id: 'e2-brocoli', nombre: 'Brócoli tapado', tipo: 'tapado', inicio_s: 270, fin_s: 450, critico: true, ingrediente: 'brocoli-entero', nota: 'Más tiempo lo pasa.', al_terminar: 'e2-p4' },
      ],
      pasos: [
        { id: 'e2-p1', inicio_s: 0, duracion_s: 30, critico: false, espera: false, titulo: 'Wok al fuego', acciones: ['Aceite.'], ingredientes: [], inicia_procesos: [], por_que: { etiquetas: ['TIEMPO'], texto: 'Porque sí.' } },
        { id: 'e2-p2', inicio_s: 30, duracion_s: 45, critico: true, espera: false, titulo: 'Champiñones al wok', acciones: ['Una capa.'], ingredientes: ['champinones-blancos-el-mercado-200g'], inicia_procesos: ['e2-brocoli'], por_que: { etiquetas: ['SABOR'], texto: 'Maillard.' } },
        { id: 'e2-p3', inicio_s: 75, duracion_s: 45, critico: true, espera: false, titulo: 'Pasta al jarro', acciones: ['Hundir.'], ingredientes: [], inicia_procesos: ['e2-pasta'], por_que: { etiquetas: ['NUTRICIÓN'], texto: 'Al dente.' } },
        { id: 'e2-p4', inicio_s: 120, duracion_s: 60, critico: false, espera: true, titulo: 'Esperar el vapor', acciones: ['No destapar.'], ingredientes: [], inicia_procesos: [], por_que: { etiquetas: ['TIEMPO'], texto: 'Porque sí.' } },
        { id: 'e2-p5', inicio_s: 180, duracion_s: 60, critico: true, espera: false, titulo: 'Mantecar', acciones: ['Mezclar.'], ingredientes: [], inicia_procesos: [], por_que: { etiquetas: ['TIEMPO'], texto: 'Porque sí.' } },
      ],
    },
  ],
};

export const recetaUnaEtapa: Receta = {
  ...recetaDosEtapas,
  version: resumenSpaghetti.versiones[0] as Receta['version'],
  tiempo_total_s: 960,
  tiempo_total_texto: '16 min',
  etapas: [
    {
      ...(recetaDosEtapas.etapas[0] as Receta['etapas'][number]),
      id: 'e1',
      nombre: 'Línea de tiempo',
      vigilancia: true,
      duracion_s: 960,
      pausa_despues: null,
    },
  ],
};

/** Un fetch que responde por ruta; lo que no está preparado rechaza con un Error. */
export function fetchDeCatalogo(respuestas: Record<string, unknown>, fallos: Record<string, number> = {}): Fetch {
  return (url) => {
    // Las respuestas se preparan por recurso (`/recetas`), no por archivo: que el
    // catálogo sea un JSON en el bundle y no un endpoint es asunto de api.ts.
    const ruta = url.replace('api/catalogo', '').replace(/\.json$/, '');
    if (ruta in fallos) {
      return Promise.resolve({ ok: false, status: fallos[ruta] as number, json: () => Promise.resolve({}) });
    }
    if (ruta in respuestas) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(respuestas[ruta]) });
    }
    return Promise.reject(new Error(`sin respuesta preparada para ${url}`));
  };
}

export const nunca: Fetch = () => new Promise(() => undefined);
