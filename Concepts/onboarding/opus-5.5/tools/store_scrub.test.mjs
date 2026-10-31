// O55.store's secret guard (src/js/20-store.js): protected field names never reach a saved record, while the ids a
// map is keyed by (a provider called qwen-token, an operation key:qwen-token:1) are kept with their non-secret state.
// Provider-login audit P17. Run: node --test Concepts/onboarding/opus-5.5/tools/store_scrub.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadStore(withStorage) {
  const src = readFileSync(new URL('../src/js/20-store.js', import.meta.url), 'utf8');
  const data = new Map();
  const localStorage = { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
  const window = { O55: {} };
  if (withStorage) window.localStorage = localStorage;
  else Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: opaque origin'); } });
  vm.runInNewContext(src, { window });
  return { store: window.O55.store, data };
}

const session = () => ({
  screen: 'ai',
  ai: {
    accounts: {
      cursor: { state: 'ready', via: 'key', attempt: 1, keyTyped: false },
      'qwen-token': { state: 'ready', via: 'key', attempt: 1, apiKey: 'sk-sp-AUDIT', keyTyped: false },
      'opencode-runtime': { state: 'ready', via: 'server', serverPassword: 'hunter2', passwordTyped: true }
    },
    list: [{ id: 'acct-qwen-token-1', provider: 'qwen-token', state: 'ready', token: 'AUDIT-NOT-A-REAL-KEY' }],
    freeRoutes: { 'free-groq': 'ready' }
  },
  flow: { 'key:qwen-token:1': { state: 'done' }, 'token:github': { state: 'failed' } },
  forgeAccounts: { 'github|hosted|': 'jared-p' },
  backup: { access: { secret: 'AUDIT', secretTyped: true, bucket: 'b' } },
  ssh: { privateKey: '-----BEGIN', private_key: 'x', deviceCode: 'WDJB', device_code: 'K3PX', code_value: '1', passphrase: 'p' }
});

for (const withStorage of [true, false]) {
  test(`provider ids that contain a secret-like word survive a save (${withStorage ? 'normal page' : 'opaque preview'})`, () => {
    const { store } = loadStore(withStorage);
    assert.equal(store.persistent, withStorage);
    assert.ok(store.set('onboarding', session()));
    const back = store.get('onboarding');
    assert.deepEqual(Object.keys(back.ai.accounts).sort(), ['cursor', 'opencode-runtime', 'qwen-token']);
    assert.equal(back.ai.accounts['qwen-token'].state, 'ready');
    assert.equal(back.ai.list[0].provider, 'qwen-token');
    assert.equal(back.flow['key:qwen-token:1'].state, 'done');
    assert.equal(back.flow['token:github'].state, 'failed');
    assert.equal(back.forgeAccounts['github|hosted|'], 'jared-p');
  });

  test(`protected field names never reach the saved record (${withStorage ? 'normal page' : 'opaque preview'})`, () => {
    const { store, data } = loadStore(withStorage);
    store.set('onboarding', session());
    const back = store.get('onboarding');
    assert.equal('apiKey' in back.ai.accounts['qwen-token'], false);
    assert.equal('serverPassword' in back.ai.accounts['opencode-runtime'], false);
    assert.equal('token' in back.ai.list[0], false);
    assert.equal('secret' in back.backup.access, false);
    for (const k of ['privateKey', 'private_key', 'deviceCode', 'device_code', 'code_value', 'passphrase']) assert.equal(k in back.ssh, false, k);
    assert.equal(back.backup.access.bucket, 'b');
    if (withStorage) {
      const raw = data.get('pm.o55.onboarding.v1');
      for (const s of ['sk-sp-AUDIT', 'hunter2', 'AUDIT-NOT-A-REAL-KEY', '-----BEGIN', 'WDJB', 'K3PX']) assert.equal(raw.includes(s), false, s);
    }
  });
}

test('the old guard is what lost Qwen Token Plan (control)', () => {
  const OLD = /password|secret|token|apiKey|api_key|privateKey|deviceCode|code_value/i;
  assert.equal(OLD.test('qwen-token'), true);
  const { store } = loadStore(true);
  assert.equal(Object.keys(store.scrub(session(), 'onboarding').ai.accounts).includes('qwen-token'), true);
});
