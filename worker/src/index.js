const HOP_BY_HOP_HEADERS = new Set([
  'connection', 'host', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade'
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = createCorsHeaders(origin, env.ALLOWED_WEB_ORIGINS);
    if (!cors) return new Response('Origin is not allowed.', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return withCors(new Response('POST only.', { status: 405 }), cors);

    let payload;
    try {
      payload = await request.json();
    } catch (_) {
      return withCors(new Response('Invalid JSON payload.', { status: 400 }), cors);
    }

    const target = validateTarget(payload?.url, env.TARGET_ORIGIN_ALLOWLIST);
    if (!target) return withCors(new Response('Target URL is not allowed.', { status: 403 }), cors);
    const method = String(payload?.method || 'GET').toUpperCase();
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes(method)) {
      return withCors(new Response('HTTP method is not allowed.', { status: 400 }), cors);
    }

    const headers = new Headers();
    for (const pair of Array.isArray(payload?.headers) ? payload.headers : []) {
      if (!Array.isArray(pair) || pair.length !== 2) continue;
      const [name, value] = pair;
      if (typeof name !== 'string' || HOP_BY_HOP_HEADERS.has(name.toLowerCase())) continue;
      headers.append(name, String(value));
    }

    try {
      const upstream = await fetch(target, {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method) ? undefined : payload?.body ?? undefined,
        redirect: 'manual'
      });
      const responseHeaders = new Headers(upstream.headers);
      for (const [name, value] of Object.entries(cors)) responseHeaders.set(name, value);
      responseHeaders.set('X-Curl-Proxy', 'dev-tool');
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
    } catch (_) {
      return withCors(new Response('Proxy could not reach the target.', { status: 502 }), cors);
    }
  }
};

function createCorsHeaders(origin, configuredOrigins = '') {
  const allowed = configuredOrigins.split(',').map((item) => item.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': '*',
    'Vary': 'Origin'
  };
}

function validateTarget(rawUrl, configuredOrigins = '') {
  try {
    const target = new URL(rawUrl);
    const allowed = configuredOrigins.split(',').map((item) => item.trim()).filter(Boolean);
    return target.protocol === 'https:' && allowed.includes(target.origin) ? target.toString() : null;
  } catch (_) {
    return null;
  }
}

function withCors(response, cors) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(cors)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
