/**
 * Consulta el /health de cada microservicio a través del reverse proxy. Es lo único que
 * hace el esqueleto: mostrar que el frontend llega a los tres servicios por las rutas
 * /api/<servicio>/ que Caddy enruta (ADR-009).
 */
export const SERVICIOS = ['catalogo', 'usuarios', 'cocinadas'] as const;
export type Servicio = (typeof SERVICIOS)[number];

export type EstadoServicio =
  | { readonly servicio: Servicio; readonly estado: 'ok'; readonly version: string }
  | { readonly servicio: Servicio; readonly estado: 'caido'; readonly detalle: string };

export type Fetch = (url: string) => Promise<{ readonly ok: boolean; readonly status: number; json(): Promise<unknown> }>;

function versionDe(cuerpo: unknown): string {
  // La respuesta viene de un servicio propio, pero se valida igual: un cuerpo inesperado
  // tiene que mostrarse como «caído» y no como «undefined» en pantalla.
  if (typeof cuerpo === 'object' && cuerpo !== null && 'version' in cuerpo && typeof cuerpo.version === 'string') {
    return cuerpo.version;
  }
  throw new Error('respuesta sin versión');
}

export async function consultarSalud(servicio: Servicio, fetchImpl: Fetch): Promise<EstadoServicio> {
  try {
    const respuesta = await fetchImpl(`/api/${servicio}/health`);
    if (!respuesta.ok) {
      return { servicio, estado: 'caido', detalle: `HTTP ${respuesta.status}` };
    }
    return { servicio, estado: 'ok', version: versionDe(await respuesta.json()) };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    return { servicio, estado: 'caido', detalle };
  }
}

export function consultarTodos(fetchImpl: Fetch): Promise<readonly EstadoServicio[]> {
  return Promise.all(SERVICIOS.map((servicio) => consultarSalud(servicio, fetchImpl)));
}
