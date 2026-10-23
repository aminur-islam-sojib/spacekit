import { context } from 'esbuild';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { generateManifest } from './build.mjs';

const PORT = 5173;
const distDir = resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const manifestPlugin = {
  name: 'manifest-generator',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length === 0) {
        generateManifest();
      }
    });
  },
};

async function startDev() {
  const ctx = await context({
    entryPoints: [
      { in: 'src/core/index.ts', out: 'sitekit.core' },
      { in: 'src/editor/index.ts', out: 'sitekit.editor' },
      { in: 'src/features/backToTop/index.ts', out: 'features/backToTop' },
    ],
    outdir: 'dist',
    bundle: true,
    minify: false,
    format: 'iife',
    target: 'es2020',
    sourcemap: true,
    jsx: 'automatic',
    jsxImportSource: 'preact',
    plugins: [manifestPlugin],
  });

  await ctx.watch();

  const server = createServer((req, res) => {
    // CORS & Cache prevention headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, If-Match, Access-Control-Request-Private-Network, *');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const configFilePath = join(distDir, 'config.json');

    // Local dev mock for GET /config and GET /config.json
    if (req.method === 'GET' && (url.pathname === '/config.json' || url.pathname === '/config')) {
      const configData = existsSync(configFilePath)
        ? readFileSync(configFilePath, 'utf-8')
        : JSON.stringify({ schemaVersion: 1, revision: 0, disabled: false, features: {}, targets: {} }, null, 2);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(configData);
      return;
    }

    // Local dev mock for PUT /config (Publish)
    if (req.method === 'PUT' && url.pathname === '/config') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          parsed.revision = (parsed.revision || 0) + 1;
          parsed.updatedAt = new Date().toISOString();
          const serialized = JSON.stringify(parsed, null, 2);
          writeFileSync(configFilePath, serialized, 'utf-8');
          console.log(`[Spacekit Dev] Configuration published (rev ${parsed.revision})`);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(serialized);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`Bad Request: ${(e as Error).message}`);
        }
      });
      return;
    }

    const pathname = url.pathname.replace(/^\/+/, '');
    const filePath = join(distDir, pathname || 'sitekit.core.js');

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`File not found: ${pathname}`);
      return;
    }

    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = readFileSync(filePath);

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });

  server.listen(PORT, () => {
    console.log(`\n========================================================================`);
    console.log(`[Spacekit] Dev server running at http://localhost:${PORT}`);
    console.log(`========================================================================`);
    console.log(`Squarespace Code Injection Snippet:`);
    console.log(`------------------------------------------------------------------------`);
    console.log(`<script src="http://localhost:${PORT}/sitekit.core.js" data-config="http://localhost:${PORT}/config.json" defer></script>`);
    console.log(`------------------------------------------------------------------------`);
    console.log(`CORS: Enabled (*) | Cache: Disabled (no-store) | Watch mode: Active`);
    console.log(`Mock Backend: Active (GET /config.json, PUT /config)`);
    console.log(`========================================================================\n`);
  });
}

startDev().catch((err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

