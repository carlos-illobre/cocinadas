/**
 * Las cantidades del catálogo, escritas para leerse en el teléfono.
 *
 * Los JSON traen «½ cdta» o «1½ cda (22 ml)»: la fracción es un solo carácter, que en
 * pantalla se ve diminuto, y la unidad viene abreviada. Acá la fracción pasa a tres
 * caracteres («1/2»), la unidad se escribe entera («cucharadita»), y si la cantidad es
 * de cucharadas y no trae ya un equivalente entre paréntesis, se agrega en mililitros.
 * Es formato: los datos no se tocan.
 */
const FRACCIONES: Readonly<Record<string, string>> = { '¼': '1/4', '½': '1/2', '¾': '3/4', '⅓': '1/3', '⅔': '2/3', '⅛': '1/8' };

/** Mililitros de una unidad de medida de cocina. */
const ML_POR_UNIDAD: Readonly<Record<string, number>> = { cdta: 5, cda: 15 };
const NOMBRE_UNIDAD: Readonly<Record<string, readonly [string, string]>> = { cdta: ['cucharadita', 'cucharaditas'], cda: ['cucharada', 'cucharadas'] };

/** «1½» → «1 1/2», «¼» → «1/4». En cualquier parte del texto. */
export function fraccionesLegibles(texto: string): string {
  return texto.replace(/(\d)?([¼½¾⅓⅔⅛])/g, (_, entero: string | undefined, f: string) => `${entero === undefined ? '' : `${entero} `}${FRACCIONES[f] as string}`);
}

/** «1 1/2» → 1.5; «1/4» → 0.25; «2» → 2. */
function valorDe(numero: string): number {
  return numero.split(' ').reduce((suma, parte) => {
    const [n, d] = parte.split('/');
    return suma + (d === undefined ? Number(n) : Number(n) / Number(d));
  }, 0);
}

function mililitros(valor: number): string {
  return `${String(Math.round(valor * 100) / 100).replace('.', ',')} ml`;
}

/**
 * «½ cdta» → «1/2 cucharadita (2,5 ml)»; «1½ cda (22 ml)» → «1 1/2 cucharadas (22 ml)»;
 * «125 g (½ bandeja)» → «125 g (1/2 bandeja)». Lo que no es de cucharadas queda igual,
 * salvo las fracciones.
 */
export function cantidadLegible(cantidad: string): string {
  const texto = fraccionesLegibles(cantidad);
  const m = /^((?:\d+ )?\d+(?:\/\d+)?) (cdta|cda)\b(.*)$/.exec(texto);
  if (m === null) {
    return texto;
  }
  const [, numero, unidad, resto] = m as unknown as [string, string, string, string];
  const valor = valorDe(numero);
  const nombre = NOMBRE_UNIDAD[unidad] as readonly [string, string];
  const equivalente = resto.includes('(') ? '' : ` (${mililitros(valor * (ML_POR_UNIDAD[unidad] as number))})`;
  return `${numero} ${valor > 1 ? nombre[1] : nombre[0]}${resto}${equivalente}`;
}
