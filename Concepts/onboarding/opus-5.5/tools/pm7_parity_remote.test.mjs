import test from 'node:test';
import assert from 'node:assert/strict';
import { parityDocumentUrl, storageProbeHtml, gotoRemoteDocument, remoteNetworkPolicy } from './pm7_parity_remote.mjs';
import { CdpWebSocket } from './cdp-websocket.mjs';

test('virtual document preserves the local origin and preparation query on remote browsers', () => {
  assert.equal(parityDocumentUrl, 'file:///__pm7_parity__/input.html?o55=off&o55scenario=fresh&pm-warm=0');
  assert.equal(storageProbeHtml, '<!doctype html><title>Storage isolation probe</title>');
});
test('CDP LAN sockets remain explicit opt-in and never change protocol', () => {
  assert.throws(() => new CdpWebSocket('ws://192.168.50.253:1234/devtools/browser/test'), /local ws/);
  assert.throws(() => new CdpWebSocket('wss://192.168.50.253:1234/', { allowRemote: true }), /local ws/);
});
test('remote sampler-marker policy preserves local settings and avoids legacy substring globs', () => {
  assert.deepEqual(remoteNetworkPolicy(false), { urls: [] });
  assert.deepEqual(remoteNetworkPolicy(true), { urls: [], urlPatterns: [{ urlPattern: 'file:///__pm7_parity_asset__/*', block: true }] });
});
test('remote navigation ignores the old blank load and a child frame load', async () => {
  let listener, removed = false, done = false;
  const result = gotoRemoteDocument(async () => ({ frameId: 'main', loaderId: 'new' }), (_, fn) => {
    listener = fn; return () => { removed = true; };
  }, parityDocumentUrl).then(() => { done = true; });
  await Promise.resolve();
  listener({ name: 'load', frameId: 'main', loaderId: 'blank' });
  listener({ name: 'load', frameId: 'child', loaderId: 'new' });
  await Promise.resolve(); assert.equal(done, false);
  listener({ name: 'load', frameId: 'main', loaderId: 'new' });
  await result; assert.equal(removed, true);
});
test('remote navigation retains its load event when it precedes the navigate reply', async () => {
  let listener, reply;
  const result = gotoRemoteDocument(() => new Promise(resolve => { reply = resolve; }), (_, fn) => {
    listener = fn; return () => {};
  }, parityDocumentUrl);
  listener({ name: 'load', frameId: 'main', loaderId: 'new' });
  reply({ frameId: 'main', loaderId: 'new' }); await result;
});
test('remote navigation rejects failed or non-document navigations and removes listeners', async () => {
  let removed = 0;
  const on = () => () => { removed++; };
  await assert.rejects(gotoRemoteDocument(async () => ({ errorText: 'blocked' }), on, parityDocumentUrl), /blocked/);
  await assert.rejects(gotoRemoteDocument(async () => ({}), on, parityDocumentUrl), /loader/);
  assert.equal(removed, 2);
});
