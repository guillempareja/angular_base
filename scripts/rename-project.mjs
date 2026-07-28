#!/usr/bin/env node
/**
 * Renombra el template: sustituye los placeholders del proyecto por el nombre real.
 *
 * Uso:
 *   npm run rename -- "Gestión de Expedientes"
 *   npm run rename -- "Gestión de Expedientes" --slug expedientes
 *   npm run rename -- "Gestión de Expedientes" --dry
 *
 * Placeholders sustituidos (ver README.md § Placeholders):
 *   app-template   → slug técnico  (package.json, angular.json, docs)
 *   App Template   → nombre visible (index.html, i18n `app.name`, docs)
 *
 * La carpeta del repositorio NO se renombra desde aquí (está en uso mientras
 * corre el script): al terminar se imprime el comando para hacerlo a mano.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SLUG_PLACEHOLDER = 'app-template';
const NAME_PLACEHOLDER = 'App Template';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.angular',
  '.vscode',
  'dist',
  'coverage',
]);
const IGNORED_FILES = new Set(['package-lock.json', 'rename-project.mjs']);
const TEXT_EXTENSIONS = new Set([
  '.json',
  '.ts',
  '.html',
  '.md',
  '.scss',
  '.css',
  '.js',
  '.mjs',
  '.yml',
  '.yaml',
]);

//----------------------------------------------------------------
// ARGS
//----------------------------------------------------------------

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry');
const slugFlagIndex = args.indexOf('--slug');
const explicitSlug = slugFlagIndex !== -1 ? args[slugFlagIndex + 1] : null;
const slugValueIndex = slugFlagIndex === -1 ? -1 : slugFlagIndex + 1;
const displayName = args.find(
  (arg, index) => !arg.startsWith('--') && index !== slugValueIndex,
);

if (!displayName) {
  console.error(
    'Falta el nombre del proyecto.\n' +
      'Uso: npm run rename -- "Nombre Visible" [--slug nombre-tecnico] [--dry]',
  );
  process.exit(1);
}

const slug = explicitSlug ?? slugify(displayName);

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(
    `El slug "${slug}" no es válido: usa minúsculas, números y guiones (npm/angular.json).`,
  );
  process.exit(1);
}

//----------------------------------------------------------------
// RUN
//----------------------------------------------------------------

const touchedFiles = [];
walk(ROOT);

console.log(
  `\n${isDryRun ? '[dry-run] ' : ''}Renombrado "${NAME_PLACEHOLDER}" → "${displayName}" | "${SLUG_PLACEHOLDER}" → "${slug}"`,
);
console.log(
  touchedFiles.length
    ? `Ficheros actualizados (${touchedFiles.length}):\n  ${touchedFiles.join('\n  ')}`
    : 'No se ha encontrado ningún placeholder. ¿Ya se había renombrado el proyecto?',
);

console.log(
  '\nPendiente a mano:\n' +
    `  1. Renombrar la carpeta del repo a "${slug}" (con el editor cerrado).\n` +
    '  2. Revisar las URLs de API en src/environments/*.ts.\n' +
    '  3. Sustituir el favicon en src/assets/images/ y la paleta en src/styles/base/_variables.scss.\n' +
    '  4. Ejecutar `npm run format`.',
);

//----------------------------------------------------------------
// HELPERS
//----------------------------------------------------------------

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      if (!IGNORED_DIRS.has(entry)) walk(fullPath);
      continue;
    }

    if (IGNORED_FILES.has(entry) || !TEXT_EXTENSIONS.has(extname(entry))) continue;

    replaceInFile(fullPath);
  }
}

function replaceInFile(filePath) {
  const original = readFileSync(filePath, 'utf8');
  const updated = original
    .split(NAME_PLACEHOLDER)
    .join(displayName)
    .split(SLUG_PLACEHOLDER)
    .join(slug);

  if (updated === original) return;

  if (!isDryRun) writeFileSync(filePath, updated, 'utf8');
  touchedFiles.push(relative(ROOT, filePath));
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
