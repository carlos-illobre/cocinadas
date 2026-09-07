import type { Almacen } from './historial/almacen';

/**
 * El tema visual: claro (el de la cocina con luz) u oscuro, con un botón flotante. Se guarda en el dispositivo y se aplica
 * como atributo `data-tema` en el elemento raíz; el CSS redefine los tokens de color
 * según ese atributo (estilos.css).
 */
export type Tema = 'claro' | 'oscuro';

export const CLAVE_TEMA = 'cocinadas.tema';

export function esTema(valor: unknown): valor is Tema {
  return valor === 'claro' || valor === 'oscuro';
}

/** Lee la preferencia guardada; sin preferencia (o con basura), claro. */
export function leerTema(almacen: Almacen): Tema {
  const guardado = almacen.getItem(CLAVE_TEMA);
  return esTema(guardado) ? guardado : 'claro';
}

export function guardarTema(almacen: Almacen, tema: Tema): void {
  almacen.setItem(CLAVE_TEMA, tema);
}

export function elOtro(tema: Tema): Tema {
  return tema === 'claro' ? 'oscuro' : 'claro';
}

/** Aplica el tema al documento. El CSS mira `data-tema`. */
export function aplicarTema(raiz: { setAttribute(nombre: string, valor: string): void }, tema: Tema): void {
  raiz.setAttribute('data-tema', tema);
}
