import { createReadStream } from 'node:fs';
import { extname } from 'node:path';
import type { FastifyInstance, FastifyReply } from 'fastify';
import type { Catalogo } from './catalogo.js';

/** Un identificador de plato, ingrediente o utensilio: el nombre de archivo de su ficha. */
const ID = { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', maxLength: 120 } as const;

const TIPOS: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function tipoDeImagen(ruta: string): string | null {
  return TIPOS[extname(ruta).toLowerCase()] ?? null;
}

function enviarFoto(reply: FastifyReply, ruta: string | null): FastifyReply {
  const tipo = ruta === null ? null : tipoDeImagen(ruta);
  if (ruta === null || tipo === null) {
    return reply.code(404).send({ error: 'sin foto' });
  }
  // Las fotos cambian solo con un despliegue nuevo (viajan en la imagen, ADR-006): un día
  // de caché en el navegador evita bajar 25 fotos cada vez que se abre una receta.
  return reply.type(tipo).header('cache-control', 'public, max-age=86400').send(createReadStream(ruta));
}

export function registrarRutas(app: FastifyInstance, catalogo: Catalogo): void {
  app.get('/recetas', async () => catalogo.recetas());

  app.get<{ Params: { plato: string } }>(
    '/recetas/:plato/foto',
    { schema: { params: { type: 'object', properties: { plato: ID }, required: ['plato'] } } },
    async (peticion, reply) => enviarFoto(reply, catalogo.fotoReceta(peticion.params.plato)),
  );

  app.get<{ Params: { plato: string; version: string } }>(
    '/recetas/:plato/:version',
    {
      schema: {
        params: {
          type: 'object',
          properties: { plato: ID, version: { type: 'string', pattern: '^[a-z0-9-]+$', maxLength: 40 } },
          required: ['plato', 'version'],
        },
      },
    },
    async (peticion, reply) => {
      const receta = catalogo.receta(peticion.params.plato, peticion.params.version);
      if (receta === null) {
        return reply.code(404).send({ error: `no existe la receta ${peticion.params.plato} en la versión ${peticion.params.version}` });
      }
      return receta;
    },
  );

  app.get<{ Params: { id: string } }>(
    '/ingredientes/:id/foto',
    { schema: { params: { type: 'object', properties: { id: ID }, required: ['id'] } } },
    async (peticion, reply) => enviarFoto(reply, catalogo.fotoIngrediente(peticion.params.id)),
  );

  app.get<{ Params: { id: string } }>(
    '/utensilios/:id/foto',
    { schema: { params: { type: 'object', properties: { id: ID }, required: ['id'] } } },
    async (peticion, reply) => enviarFoto(reply, catalogo.fotoUtensilio(peticion.params.id)),
  );
}
