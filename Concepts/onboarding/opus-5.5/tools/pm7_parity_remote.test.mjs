import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createInputServer, remoteServeHost, storageProbeHtml } from './pm7_parity_remote.mjs';
import { CdpWebSocket } from './cdp-websocket.mjs';
import { request } from 'node:https';

function fetchInput(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = request(url, { ...options, rejectUnauthorized: false }, response => {
      const parts = []; response.on('data', part => parts.push(part));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers,
        text: async () => Buffer.concat(parts).toString(), arrayBuffer: async () => Buffer.concat(parts) }));
    });
    req.on('error', reject); req.end();
  });
}

test('remote document URL serves exact selected bytes and inert probe, with no other HTTP routes', async () => {
  const server = await createInputServer('127.0.0.1', '127.0.0.1');
  try {
    const input = value => ({ body: Buffer.from(value).toString('base64'), sha256: createHash('sha256').update(value).digest('hex') });
    const baseline = Buffer.from('<!doctype html>\r\n<p>baseline é</p>'), candidate = Buffer.from('<!doctype html><p>candidate</p>');
    const browser = { input: input(baseline) }, unregister = server.register(browser), url = browser.documentUrl;
    const response = await fetchInput(url);
    assert.equal(response.status, 200); assert.equal(response.headers['cache-control'], 'no-store');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), baseline);
    browser.storageProbe = true;
    assert.equal(await (await fetchInput(url)).text(), storageProbeHtml);
    browser.storageProbe = false; browser.input = input(candidate);
    assert.equal(browser.documentUrl, url);
    assert.deepEqual(Buffer.from(await (await fetchInput(url)).arrayBuffer()), candidate);
    assert.equal((await fetchInput(server.origin + '/')).status, 404);
    assert.equal((await fetchInput(url + '&other=1')).status, 404);
    assert.equal((await fetchInput(url, { method: 'POST' })).status, 404);
    assert.equal(server.stats.probes, 1);
    assert.deepEqual(Object.values(server.stats.inputs), [1, 1]);
    unregister(); assert.equal((await fetchInput(url)).status, 404);
  } finally { await server.close(); }
});
test('remote transport stays opt-in and requires an explicit valid advertised address', () => {
  assert.equal(remoteServeHost('192.168.50.179'), '192.168.50.179');
  for (const value of ['http://192.168.50.179', '0.0.0.0', '::1', 'not-a-host']) assert.throws(() => remoteServeHost(value), /IPv4/);
  assert.throws(() => new CdpWebSocket('ws://192.168.50.253:1234/devtools/browser/test'), /local ws/);
  assert.throws(() => new CdpWebSocket('wss://192.168.50.253:1234/', { allowRemote: true }), /local ws/);
});
