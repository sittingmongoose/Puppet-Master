/* Remote document delivery only. Comparison, preparation and request gates stay in pm7_parity. */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { isIP } from 'node:net';

export const storageProbeHtml = '<!doctype html><title>Storage isolation probe</title>';
export function remoteServeHost(explicit) {
  if (explicit) {
    if (isIP(explicit) !== 4 || explicit === '0.0.0.0') throw Error('--serve-host requires an advertised IPv4 address');
    return explicit;
  }
  const addresses = [...new Set(Object.values(networkInterfaces()).flat().filter(x => x.family === 'IPv4' && !x.internal).map(x => x.address))];
  if (addresses.length !== 1) throw Error('Remote input server requires --serve-host IPv4 when this controller has multiple/no LAN addresses');
  return addresses[0];
}
export async function createInputServer(advertiseHost, bindHost = '0.0.0.0') {
  const documents = new Map(), stats = { probes: 0, inputs: {} };
  const server = createServer((request, response) => {
    const browser = documents.get(request.url);
    if (request.method !== 'GET' || !browser) { response.writeHead(404); response.end(); return; }
    const bytes = browser.storageProbe ? Buffer.from(storageProbeHtml) : Buffer.from(browser.input.body, 'base64');
    if (browser.storageProbe) stats.probes++;
    else stats.inputs[browser.input.sha256] = (stats.inputs[browser.input.sha256] || 0) + 1;
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': bytes.length, 'Cache-Control': 'no-store' });
    response.end(bytes);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, bindHost, resolve); });
  const origin = `http://${advertiseHost}:${server.address().port}`;
  return {
    origin, stats,
    register(browser) {
      const path = `/pm7-parity/${randomUUID()}/input.html?o55=off&o55scenario=fresh&pm-warm=0`;
      documents.set(path, browser);
      browser.documentUrl = origin + path;
      return () => documents.delete(path);
    },
    async close() {
      documents.clear(); server.closeAllConnections();
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  };
}
