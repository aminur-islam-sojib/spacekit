/// <reference types="@cloudflare/workers-types" />
import { describe, it, expect, beforeEach } from 'vitest';
import worker, { type Env } from '../../worker/src/index.js';
import type { SiteKitConfig } from '../../src/shared/types.js';

// In-memory mock for Cloudflare Workers KV
class MockKV {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

describe('Cloudflare Worker Backend (TC-W01..TC-W08)', () => {
  let mockKV: MockKV;
  let env: Env;

  const validConfig: SiteKitConfig = {
    schemaVersion: 1,
    revision: 1,
    updatedAt: '2026-10-23T10:00:00Z',
    disabled: false,
    features: {
      backToTop: { enabled: true, side: 'right' },
    },
    targets: {},
  };

  beforeEach(() => {
    mockKV = new MockKV();
    env = {
      KV: mockKV as unknown as KVNamespace,
      ADMIN_TOKEN: 'secret-test-token-12345',
    };
  });

  it('TC-W01: PUT /config without token returns 401 Unauthorized', async () => {
    const req = new Request('https://worker.local/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validConfig),
    });

    const res = await worker.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it('TC-W02: PUT /config with invalid token returns 401 Unauthorized', async () => {
    const req = new Request('https://worker.local/config', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer wrong-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validConfig),
    });

    const res = await worker.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it('TC-W03: PUT /config with valid token increments revision, stores to KV, and returns 200', async () => {
    const req = new Request('https://worker.local/config', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer secret-test-token-12345',
        'Content-Type': 'application/json',
        'If-Match': '0',
      },
      body: JSON.stringify(validConfig),
    });

    const res = await worker.fetch(req, env);
    expect(res.status).toBe(200);

    const json = (await res.json()) as SiteKitConfig;
    expect(json.revision).toBe(1);

    // Verify GET /config.json returns the saved config
    const getReq = new Request('https://worker.local/config.json', { method: 'GET' });
    const getRes = await worker.fetch(getReq, env);
    expect(getRes.status).toBe(200);

    const retrieved = (await getRes.json()) as SiteKitConfig;
    expect(retrieved.revision).toBe(1);
    expect(retrieved.features.backToTop.enabled).toBe(true);

    // Verify revision history is saved in KV
    const revHistory = await mockKV.get('rev:1');
    expect(revHistory).not.toBeNull();
  });

  it('TC-W04: PUT /config with invalid schema returns 400 Bad Request', async () => {
    const corruptPayload = {
      schemaVersion: 'invalid-not-number',
      revision: 1,
    };

    const req = new Request('https://worker.local/config', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer secret-test-token-12345',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(corruptPayload),
    });

    const res = await worker.fetch(req, env);
    expect(res.status).toBe(400);
  });

  it('TC-W05: PUT /config with payload exceeding 100KB returns 413 Payload Too Large', async () => {
    const hugePayload = {
      ...validConfig,
      hugeString: 'a'.repeat(105_000),
    };

    const req = new Request('https://worker.local/config', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer secret-test-token-12345',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hugePayload),
    });

    const res = await worker.fetch(req, env);
    expect(res.status).toBe(413);
  });

  it('TC-W06: PUT /config with stale If-Match revision returns 409 Conflict', async () => {
    // Seed existing config at revision 5
    await mockKV.put('config', JSON.stringify({ ...validConfig, revision: 5 }));

    const req = new Request('https://worker.local/config', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer secret-test-token-12345',
        'Content-Type': 'application/json',
        'If-Match': '3', // Stale revision (expected 5)
      },
      body: JSON.stringify({ ...validConfig, revision: 3 }),
    });

    const res = await worker.fetch(req, env);
    expect(res.status).toBe(409);
  });

  it('TC-W07: GET /config.json returns Cache-Control headers', async () => {
    const req = new Request('https://worker.local/config.json', { method: 'GET' });
    const res = await worker.fetch(req, env);

    expect(res.status).toBe(200);
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('max-age=');
  });

  it('TC-W08: OPTIONS request returns permissive CORS headers', async () => {
    const req = new Request('https://worker.local/config', { method: 'OPTIONS' });
    const res = await worker.fetch(req, env);

    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('PUT');
  });
});
