import test from 'node:test';
import assert from 'node:assert/strict';
import { parityDocumentUrl, storageProbeHtml } from './pm7_parity_remote.mjs';
import { CdpWebSocket } from './cdp-websocket.mjs';

test('virtual document preserves the local origin and preparation query on remote browsers', () => {
  assert.equal(parityDocumentUrl, 'file:///__pm7_parity__/input.html?o55=off&o55scenario=fresh&pm-warm=0');
  assert.equal(storageProbeHtml, '<!doctype html><title>Storage isolation probe</title>');
});
test('CDP LAN sockets remain explicit opt-in and never change protocol', () => {
  assert.throws(() => new CdpWebSocket('ws://192.168.50.253:1234/devtools/browser/test'), /local ws/);
  assert.throws(() => new CdpWebSocket('wss://192.168.50.253:1234/', { allowRemote: true }), /local ws/);
});
