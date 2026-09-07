// @ts-check
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/*
 * La compuerta de calidad estática. `tsc` ya atrapa los errores de tipos; esto atrapa lo
 * que compila y está mal igual: promesas sin `await`, condiciones que siempre dan lo
 * mismo, hooks fuera de las reglas, `any` que se cuelan. Las reglas de tipos
 * (`strict-type-checked`) necesitan el programa de TypeScript, por eso `parserOptions`.
 */
export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'public/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Tres decisiones de estilo del proyecto, no relajaciones:
      // - `x as string` en vez de `x!`: la aserción dice qué tipo se espera, el `!` solo
      //   dice «confiá». Se lee mejor y se busca mejor.
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      // - Los números van derecho en las plantillas (`${p.izquierda}%`): son la mitad
      //   de la app. Lo que sí sigue prohibido es meter objetos o `unknown`.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // - `onClick={() => setX(1)}` devuelve void y está bien: es el idioma de React.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Las pruebas y los scripts de build son los adaptadores del sistema: hablan con
    // `fs`, con el navegador falso y con `console`. No aplican las mismas reglas.
    files: ['**/*.test.{ts,tsx}', 'src/pruebas/**', 'herramientas/**', 'e2e/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // `expect(objeto.metodo)` y `vi.spyOn` separan el método de su objeto a propósito.
      '@typescript-eslint/unbound-method': 'off',
      // Un doble que es solo un constructor que lanza es la forma más corta de simular
      // «el navegador no pudo crear el AudioContext».
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'eslint.config.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
