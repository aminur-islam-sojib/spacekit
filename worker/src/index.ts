/// <reference types="@cloudflare/workers-types" />
import { validateSiteKitConfig } from '../../src/shared/schema-validate.js';
import type { SiteKitConfig } from '../../src/shared/types.js';

export interface Env {
  KV: KVNamespace;
  ADMIN_TOKEN: string;
}

const DEFAULT_CONFIG: SiteKitConfig = {
  schemaVersion: 1,
  revision: 0,
  updatedAt: new Date(0).toISOString(),
  disabled: false,
  features: {},
  targets: {},
};

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Match',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function errorResponse(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // 1. CORS Preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Public Read Path (TC-W07, FR-B1)
    if (req.method === 'GET') {
      if (url.pathname === '/config.json' || url.pathname === '/config') {
        const stored = await env.KV.get('config');
        const config = stored ? JSON.parse(stored) : DEFAULT_CONFIG;

        return jsonResponse(config, 200, {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
          ETag: `"${config.revision}"`,
        });
      }
      return errorResponse('Not found', 404);
    }

    // 3. Authenticated Write Path (TC-W01..TC-W06, FR-B2..FR-B4)
    if (req.method === 'PUT') {
      if (url.pathname !== '/config') {
        return errorResponse('Not found', 404);
      }

      // Authentication (TC-W01, TC-W02)
      const auth = req.headers.get('Authorization') || '';
      if (!auth.startsWith('Bearer ') || auth.slice(7) !== env.ADMIN_TOKEN) {
        return errorResponse('Unauthorized: Invalid or missing bearer token', 401);
      }

      // Size limit: 100 KB max (TC-W05)
      const text = await req.text();
      if (text.length > 100_000) {
        return errorResponse('Payload Too Large: Configuration exceeds 100 KB limit', 413);
      }

      // JSON parsing & Schema validation (TC-W04)
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return errorResponse('Bad Request: Invalid JSON', 400);
      }

      const validated = validateSiteKitConfig(parsed);
      if (!validated) {
        return errorResponse('Bad Request: Payload failed schema validation', 400);
      }

      // Concurrency check via If-Match revision (TC-W06)
      const existingRaw = await env.KV.get('config');
      const existing: SiteKitConfig = existingRaw ? JSON.parse(existingRaw) : DEFAULT_CONFIG;
      const ifMatch = req.headers.get('If-Match');

      if (ifMatch !== null && ifMatch !== undefined && ifMatch !== '') {
        const matchRevision = Number(ifMatch);
        if (!Number.isNaN(matchRevision) && matchRevision !== existing.revision) {
          return jsonResponse(
            {
              error: 'Conflict: Remote revision has changed since last fetch',
              currentRevision: existing.revision,
            },
            409
          );
        }
      }

      // Apply new revision & timestamp
      const nextRevision = (existing.revision || 0) + 1;
      const nextConfig: SiteKitConfig = {
        ...validated,
        revision: nextRevision,
        updatedAt: new Date().toISOString(),
      };

      const serialized = JSON.stringify(nextConfig);

      // Store active config and history revision in KV (TC-W03, FR-B5)
      await env.KV.put('config', serialized);
      await env.KV.put(`rev:${nextRevision}`, serialized);

      return jsonResponse(nextConfig, 200, {
        ETag: `"${nextRevision}"`,
      });
    }

    return errorResponse('Method Not Allowed', 405);
  },
};
