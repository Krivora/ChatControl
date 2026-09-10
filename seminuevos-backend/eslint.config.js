// eslint.config.js
//
// Además del linting normal, este archivo contiene las **reglas de
// arquitectura**: las restricciones de capas que antes sólo vivían en la
// documentación y dependían de que alguien las recordara en una revisión.
// Aquí las verifica la herramienta.
//
// Las excepciones están declaradas abajo con su motivo.

const ERROR_SERVICES_SIN_EXPRESS =
  'Los services no conocen Express. Recibe un objeto plano desde el controller ' +
  'y deja la traducción de la petición en la capa HTTP.';

const ERROR_SOLO_REPOS_SQL =
  'Sólo los repositories acceden a la base de datos. Mueve el SQL a un repository.';

const ERROR_SOLO_ENV =
  'Sólo config/env.js lee process.env. Añade la variable a `env` y a .env.example.';

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  },

  // ── Regla de capa: el dominio no conoce el transporte ──────────────────
  {
    files: ['src/services/**/*.js', 'src/utils/**/*.js'],
    // Estos dos NO son utilitarios de dominio: son los adaptadores HTTP.
    // asyncHandler envuelve el handler de Express y ApiResponse escribe la
    // respuesta. Viven en la frontera, así que sí conocen req/res.
    ignores: ['src/utils/asyncHandler.js', 'src/utils/ApiResponse.js'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'req', message: ERROR_SERVICES_SIN_EXPRESS },
        { name: 'res', message: ERROR_SERVICES_SIN_EXPRESS },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Identifier[name="req"]',
          message: ERROR_SERVICES_SIN_EXPRESS,
        },
        {
          selector: 'MemberExpression[object.name="res"]',
          message: ERROR_SERVICES_SIN_EXPRESS,
        },
      ],
    },
  },

  // ── Regla de capa: el SQL vive sólo en repositories ────────────────────
  {
    files: ['src/controllers/**/*.js', 'src/services/**/*.js', 'src/jobs/**/*.js', 'src/middlewares/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/config/db.js'], message: ERROR_SOLO_REPOS_SQL },
          ],
        },
      ],
    },
  },

  // ── Regla de capa: una sola puerta al entorno ──────────────────────────
  {
    files: ['src/**/*.js'],
    ignores: ['src/config/env.js'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: ERROR_SOLO_ENV },
      ],
    },
  },
];
