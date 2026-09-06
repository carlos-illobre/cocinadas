import { expect, test } from '@playwright/test';

/**
 * El camino feliz entero: entrar, elegir la receta, tildar la mise en place, cocinar los
 * nueve pasos y guardar la cocinada.
 *
 * Lo que aporta sobre las unitarias, que ya cubren cada pantalla por separado: acá corre
 * el bundle compilado en un navegador de verdad, así que también se prueba lo que las
 * unitarias no pueden ver —que el catálogo generado en el build se sirva, que las rutas
 * relativas resuelvan (ADR-017), que las fotos existan y que el `localStorage` sobreviva
 * de una pantalla a la otra—.
 *
 * Se cocina lo más rápido que se pueda tocar, sin esperar los tiempos de la receta: el
 * resultado son 0 XP, y está bien. Lo que se comprueba es que el recorrido llegue hasta
 * el final, no que puntúe; el puntaje ya lo miden `src/xp.test.ts` y `App.test.tsx`.
 */
test('de la portada a la primera cocinada guardada', async ({ page }) => {
  await page.goto('.');

  await test.step('entrar sin cuenta', async () => {
    await expect(page.getByText('Tu receta, al punto justo')).toBeVisible();
    await page.getByRole('button', { name: 'Entrar sin cuenta' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeVisible();
  });

  await test.step('elegir la receta y ver su portada', async () => {
    await page.getByRole('button', { name: /Spaghetti integral/ }).click();
    // La foto del plato viene del catálogo que escribe el build. `naturalWidth > 0` es lo
    // que distingue una imagen cargada de un 404: si no se generó el catálogo o la ruta
    // quedó absoluta (ADR-017), la etiqueta está igual pero el archivo no llegó. No se
    // compara contra un ancho fijo porque plan.ts nunca agranda: el ancho es el del
    // original si mide menos que el de destino.
    const foto = page.locator('img.detalle-foto');
    await expect(foto).toBeVisible();
    await expect
      .poll(() => foto.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await page.getByRole('button', { name: /^Comenzar · / }).click();
  });

  await test.step('tildar los 25 items de la mise en place', async () => {
    await expect(page.getByRole('heading', { level: 1, name: 'Mise en place' })).toBeVisible();
    const items = page.locator('.cuerpo button');
    const total = await items.count();
    expect(total).toBe(25);

    const cocinar = page.getByRole('button', { name: /Cocinar|Faltan/ });
    await expect(cocinar).toBeDisabled();
    for (let i = 0; i < total; i++) {
      await items.nth(i).click();
    }
    await expect(page.getByText('25 de 25 items')).toBeVisible();
    await expect(cocinar).toBeEnabled();
    await cocinar.click();
  });

  await test.step('cocinar los nueve pasos', async () => {
    await expect(page.getByText('Paso 1 de 9')).toBeVisible();

    // Se avanza por lo que hay en pantalla y no por una lista escrita a mano: el botón
    // que sigue cambia de nombre según el paso —«Listo, siguiente» en uno normal,
    // «Seguir» en una espera, «Ya lo hice» si todavía no le llegó el turno— y entre
    // etapas se cruza la pantalla de cierre, que dice «Empezar <etapa>». El tope es una
    // red de seguridad para que un cambio en la receta no deje la prueba colgada.
    const siguiente = page.getByRole('button', { name: /^(Listo, siguiente|Seguir|Ya lo hice|Empezar) / });
    for (let i = 0; i < 30 && (await siguiente.count()) > 0; i++) {
      await siguiente.first().click();
    }
  });

  await test.step('la pantalla de victoria festeja y guarda', async () => {
    await expect(page.getByText(/^Plato listo · /)).toBeVisible();
    // Los papelitos del confeti: 40, los mismos que arma `confeti(40)`.
    await expect(page.locator('.confeti i')).toHaveCount(40);
    await expect(page.getByText(/XP por lo cerca que estuviste/)).toBeVisible();

    await page.getByRole('button', { name: 'Guardar esta cocinada' }).click();
    await expect(page.getByText('Guardada en este teléfono', { exact: false })).toBeVisible();
  });

  await test.step('la cocinada queda en Progreso y sobrevive a recargar', async () => {
    await page.getByRole('button', { name: 'Ver el progreso' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Progreso' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /Spaghetti integral/ })).toBeVisible();

    // Al recargar se vuelve a la portada: lo que persiste es el historial, no en qué
    // pantalla estabas. Que la cocinada siga ahí es lo que se comprueba.
    await page.reload();
    await page.getByRole('button', { name: 'Entrar sin cuenta' }).click();
    await page.getByRole('button', { name: 'Progreso' }).click();
    await expect(page.getByRole('heading', { level: 2, name: /Spaghetti integral/ })).toBeVisible();
  });
});
