// Cloudflare Worker: public GET config, token-protected PUT.
// Bindings needed: KV namespace "KV", secret "ADMIN_TOKEN".
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (req.method === 'GET') {
      const value = (await env.KV.get('config')) || '{"features":{}}';
      return new Response(value, {
        headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
      });
    }

    if (req.method === 'PUT') {
      if (req.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
        return new Response('Unauthorized', { status: 401, headers: CORS });
      }
      const body = await req.text();
      if (body.length > 100_000) return new Response('Too large', { status: 413, headers: CORS });
      try { JSON.parse(body); } catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }
      await env.KV.put('config', body);
      return new Response('ok', { headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
