import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', '@litertjs', 'core', 'wasm');
const target = join(root, 'public', 'litert-wasm');

if (!existsSync(source)) {
  console.error('LiteRT wasm folder not found in node_modules. Run npm install first.');
  process.exit(1);
}

mkdirSync(target, { recursive: true });

const files = [
  'litert_wasm_internal.js',
  'litert_wasm_internal.wasm',
  'litert_wasm_compat_internal.js',
  'litert_wasm_compat_internal.wasm',
];

for (const file of files) {
  const srcFile = join(source, file);
  const destFile = join(target, file);
  if (existsSync(srcFile)) {
    cpSync(srcFile, destFile);
    console.log(`Successfully copied ${file} to public/litert-wasm/`);
  } else {
    console.warn(`[Warning] WASM file not found: ${file}`);
  }
}

console.log('LiteRT wasm runtime setup complete.');