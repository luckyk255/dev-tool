import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { Readable } from 'node:stream';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const MAX_REQUEST_BYTES = 1024 * 1024;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

createServer(async (request, response) => {
  if (request.url === '/api/curl-proxy') {
    await proxyRequest(request, response);
    return;
  }
  serveStatic(request, response);
}).listen(PORT, HOST, () => {
  console.log(`Dev Tool is running at http://localhost:${PORT}`);
});

async function proxyRequest(request, response) {
  if (request.method !== 'POST') return send(response, 405, 'POST only.');
  let payload;
  try {
    payload = JSON.parse(await readBody(request));
  } catch (error) {
    return send(response, 400, `Invalid proxy request: ${error.message}`);
  }

  let target;
  try {
    target = new URL(payload?.url);
  } catch (_) {
    return send(response, 400, 'A valid target URL is required.');
  }
  if (!['http:', 'https:'].includes(target.protocol)) return send(response, 400, 'Only HTTP(S) targets are supported.');

  const method = String(payload?.method || 'GET').toUpperCase();
  const headers = new Headers();
  for (const pair of Array.isArray(payload?.headers) ? payload.headers : []) {
    if (!Array.isArray(pair) || pair.length !== 2) continue;
    const [name, value] = pair;
    if (typeof name === 'string' && !isHopByHopHeader(name)) headers.append(name, String(value));
  }

  const controller = new AbortController();
  response.once('close', () => {
    if (!response.writableEnded) controller.abort();
  });
  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? undefined : payload?.body ?? undefined,
      signal: controller.signal,
      redirect: 'manual'
    });
    response.writeHead(upstream.status, upstream.statusText, Object.fromEntries(upstream.headers));
    if (!upstream.body) return response.end();
    Readable.fromWeb(upstream.body).pipe(response);
  } catch (error) {
    if (!response.headersSent) send(response, 502, `Proxy request failed: ${error.message}`);
  }
}

function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = normalize(join(ROOT, relativePath));
  if (!filePath.startsWith(`${ROOT}\\`) && filePath !== join(ROOT, 'index.html')) return send(response, 403, 'Forbidden.');
  try {
    if (!statSync(filePath).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
  } catch (_) {
    send(response, 404, 'Not found.');
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_REQUEST_BYTES) request.destroy(new Error('Request body is too large.'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function isHopByHopHeader(name) {
  return new Set(['connection', 'host', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade']).has(name.toLowerCase());
}

function send(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}
