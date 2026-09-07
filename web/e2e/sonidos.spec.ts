import { expect, test } from '@playwright/test';

/**
 * Que los avisos suenen de verdad en un navegador.
 *
 * `sonido.test.ts` ya comprueba cada nota con un AudioContext falso: la frecuencia, la
 * forma de onda y la envolvente. Lo que no puede comprobar es lo que rompe en la práctica,
 * que es la política de reproducción automática: el navegador no deja sonar hasta que
 * hubo un gesto del usuario, así que el AudioContext se crea al primer toque y no al
 * arrancar. Si esa cadena se corta —el avisador se crea antes de tiempo, o no se crea— la
 * app se queda muda y ninguna prueba unitaria se entera.
 *
 * Se instrumenta `AudioContext` antes de que cargue la app y se anota cada oscilador que
 * se crea, con su frecuencia. No se escucha nada: se cuentan notas.
 *
 * Lo que esta prueba **no** comprueba: que el parlante suene. Playwright arranca Chromium
 * con `--autoplay-policy=no-user-gesture-required`, así que acá el contexto arranca
 * andando aunque no hubiera habido gesto. Lo que sí queda comprobado es que la cadena
 * llega hasta la Web Audio API con las notas correctas en los dos momentos que importan;
 * el gesto lo cubre `App` creando el avisador con el primer `pointerdown`.
 */

interface NotaEspiada {
  readonly frecuencia: number;
  readonly tipo: string;
}

declare global {
  interface Window {
    __notas: NotaEspiada[];
  }
}

test('los avisos suenan al confirmar un paso y al terminar la cocinada', async ({ page }) => {
  await page.addInitScript(() => {
    window.__notas = [];
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      override createOscillator(): OscillatorNode {
        const osc = super.createOscillator();
        osc.start = new Proxy(osc.start, {
          apply: (destino, esto, args: [number?]) => {
            window.__notas.push({ frecuencia: osc.frequency.value, tipo: osc.type });
            Reflect.apply(destino, esto, args);
          },
        });
        return osc;
      }
    };
  });

  await page.goto('.');
  await page.getByRole('button', { name: 'Entrar sin cuenta' }).click();
  await page.getByRole('button', { name: /Spaghetti integral/ }).click();
  await page.getByRole('button', { name: /^Comenzar · / }).click();
  const items = page.locator('.cuerpo button');
  for (let i = 0; i < (await items.count()); i++) {
    await items.nth(i).click();
  }
  await page.getByRole('button', { name: /Cocinar/ }).click();
  await expect(page.getByText('Paso 1 de 9')).toBeVisible();

  await test.step('el toque de confirmar un paso', async () => {
    await page.evaluate(() => {
      window.__notas = [];
    });
    await page.getByRole('button', { name: /^Listo, siguiente/ }).click();
    // `toque` es una sola nota seca de 660 Hz.
    expect(await page.evaluate(() => window.__notas)).toEqual([{ frecuencia: 660, tipo: 'sine' }]);
  });

  await test.step('el arpegio del plato listo', async () => {
    const siguiente = page.getByRole('button', { name: /^(Listo, siguiente|Seguir|Ya lo hice|Empezar) / });
    for (let i = 0; i < 30 && (await siguiente.count()) > 0; i++) {
      await siguiente.first().click();
    }
    await expect(page.getByText(/^Plato listo · /)).toBeVisible();

    // Do, mi, sol, do: las últimas cuatro notas son el festejo, después del toque del
    // último paso.
    const notas = await page.evaluate(() => window.__notas.map((n) => n.frecuencia));
    expect(notas.slice(-4)).toEqual([523, 659, 784, 1047]);
  });
});
