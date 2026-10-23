import { build } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const isWatch = process.argv.includes('--watch');
const distDir = resolve(process.cwd(), 'dist');
mkdirSync(distDir, { recursive: true });

export function generateManifest() {
  const files = readdirSync(distDir).filter(
    (f) => (f.endsWith('.js') || f.endsWith('.css')) && !f.endsWith('.map')
  );
  const manifest = {
    generatedAt: new Date().toISOString(),
    files: {},
  };

  for (const file of files) {
    const fullPath = join(distDir, file);
    const content = readFileSync(fullPath);
    const hash = createHash('sha384').update(content).digest('base64');
    manifest.files[file] = {
      size: content.length,
      sri: `sha384-${hash}`,
    };
  }

  writeFileSync(
    join(distDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  return manifest;
}

export async function runBuild() {
  await Promise.all([
    build({
      entryPoints: ['src/core/index.ts'],
      outfile: 'dist/sitekit.core.js',
      bundle: true,
      minify: true,
      format: 'iife',
      target: 'es2020',
      sourcemap: true,
    }),
    build({
      entryPoints: ['src/editor/index.ts'],
      outfile: 'dist/sitekit.editor.js',
      bundle: true,
      minify: true,
      format: 'iife',
      target: 'es2020',
      sourcemap: true,
    }),
  ]);

  generateManifest();
}

if (!isWatch) {
  runBuild()
    .then(() => {
      console.log('Build completed successfully.');
    })
    .catch((err) => {
      console.error('Build failed:', err);
      process.exit(1);
    });
}

