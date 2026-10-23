import { build } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const isWatch = process.argv.includes('--watch');
const distDir = resolve(process.cwd(), 'dist');
mkdirSync(distDir, { recursive: true });
mkdirSync(join(distDir, 'features'), { recursive: true });

export function generateManifest() {
  const getFiles = (dir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    let results = [];
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getFiles(full));
      } else if ((entry.name.endsWith('.js') || entry.name.endsWith('.css')) && !entry.name.endsWith('.map')) {
        results.push(full);
      }
    }
    return results;
  };

  const files = getFiles(distDir);
  const manifest = {
    generatedAt: new Date().toISOString(),
    files: {},
  };

  for (const filePath of files) {
    const relPath = filePath.replace(distDir + '/', '');
    const content = readFileSync(filePath);
    const hash = createHash('sha384').update(content).digest('base64');
    manifest.files[relPath] = {
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
    build({
      entryPoints: ['src/features/backToTop/index.ts'],
      outfile: 'dist/features/backToTop.js',
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
