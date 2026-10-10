// Secrets in saved scrollback (D36, js/37-scrub.js): the well-known formats are found, a saved line keeps its width,
// a token that soft-wrapped is found across the wrap, a private key's body goes while BEGIN and END stay, the live
// packs are never touched, and ordinary text (hashes, paths, prose) is left alone.
// Run: node harness/checks/scrub.test.mjs
import assert from 'node:assert/strict';
import { loadT } from './load.mjs';

const T = loadT(['00-core.js', '37-scrub.js']);
const S = T.Scrub;
let passed = 0;
function test(name, fn) { try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; } }

/* a pack as 38-saved.js makes it, from a string (one cell per character) */
function pack(str, wrapped) { const c = Uint16Array.from([...str].map(ch => ch.codePointAt(0))); return { n: c.length, c, s: Uint32Array.from([0, c.length]), f: null, g: null, w: wrapped ? 1 : 0 }; }
function str(pk) { return Array.from(pk.c.subarray(0, pk.n), cp => cp ? String.fromCharCode(cp) : ' ').join(''); }

const SECRETS = [
  ['export OPENAI_API_KEY=sk-proj-abcDEF1234567890ghijKLMNopqr', 'API key'],
  ['ANTHROPIC key sk-ant-api03-AbCdEfGhIjKlMnOpQrStUvWx', 'API key'],
  ['aws_access_key_id = AKIAIOSFODNN7EXAMPLE', 'API key'],
  ['token ghp_0123456789abcdefghijABCDEFGHIJklmnop here', 'API key'],
  ['curl -H "Authorization: Bearer abc.def-ghi_jkl.mno123456"', 'token'],
  ['jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N', 'token'],
  ['DB_PASSWORD=hunter2hunter2', 'secret']
];

test('every well-known format is found and its cells rewritten in place', () => {
  for (const [line, label] of SECRETS) {
    const pk = pack(line), r = S.packs([pk]);
    assert.ok(r.count >= 1, line);
    const out = str(r.packs[0]);
    assert.equal(r.packs[0].n, pk.n, 'width kept: ' + line);
    assert.ok(out.includes('not saved]') || out.includes('•'), out);
    if (out.includes('not saved]')) assert.ok(out.includes('[' + label), label + ' in ' + out);
    assert.equal(str(pk), line, 'the live pack is untouched');
  }
});

test('ordinary output is left alone', () => {
  for (const line of ['commit 4f2a9c1e8b7d6a5f4e3d2c1b0a9f8e7d6c5b4a39', '/home/user/.cache/sk-learn/model.bin', 'tokens: 1824 used of 4096',
    'Compiling tastebook-api v0.1.0 (/home/me/tastebook/api)', 'password: ']) {
    const r = S.packs([pack(line)]);
    assert.equal(r.count, 0, line);
    assert.equal(r.packs[0], r.packs[0]);
    assert.equal(str(r.packs[0]), line);
  }
});

test('a token that soft-wrapped is found across the wrap', () => {
  const a = pack('key: ghp_0123456789abcdefgh', true), b = pack('ijABCDEFGHIJklmnop done');
  const r = S.packs([a, b]);
  assert.equal(r.count, 1);
  assert.ok(!str(r.packs[0]).includes('ghp_'), str(r.packs[0]));
  assert.ok(!str(r.packs[1]).includes('klmnop'), str(r.packs[1]));
  assert.ok(str(r.packs[1]).endsWith(' done'));
});

test('a private key block keeps BEGIN and END and loses its body', () => {
  const lines = ['$ cat id_ed25519', '-----BEGIN OPENSSH PRIVATE KEY-----', 'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQ',
    'AAAAMwAAAAtzc2gtZWQyNTUxOQAAACBkZWFkYmVlZg', '-----END OPENSSH PRIVATE KEY-----', '$ ls'].map(l => pack(l));
  const r = S.packs(lines), out = r.packs.map(str);
  assert.equal(out[1], '-----BEGIN OPENSSH PRIVATE KEY-----');
  assert.ok(out[2].startsWith('[private key · not saved]'), out[2]);
  assert.equal(out[3].trim(), '');
  assert.equal(out[4], '-----END OPENSSH PRIVATE KEY-----');
  assert.equal(out[5], '$ ls');
  assert.equal(r.count, 1);
});

test('a cut-off key block (no END line) masks its body and leaves the output after it', () => {
  const lines = ['-----BEGIN RSA PRIVATE KEY-----', 'MIIEowIBAAKCAQEA1b2c3d4e5f6g7h8', '~/api main $ echo after', 'after'].map(l => pack(l));
  const out = S.packs(lines).packs.map(str);
  assert.ok(out[1].startsWith('[private key'), out[1]);
  assert.equal(out[2], '~/api main $ echo after');
  assert.equal(out[3], 'after');
});

test('command lines and link targets are scrubbed as text', () => {
  const r = S.text('export GITHUB_TOKEN=ghp_0123456789abcdefghijABCDEFGHIJklmnop');
  assert.ok(r.count >= 1 && !r.text.includes('ghp_'), r.text);
  assert.equal(S.text('ls -la').text, 'ls -la');
  const cut = S.text("printf '-----BEGIN RSA PRIVATE KEY-----' MIIEowIBAAKCAQEA1b2c3d4e5f6g7h8 | head -1").text;
  assert.ok(!cut.includes('MIIEow') && cut.endsWith('| head -1'), cut);
  assert.ok(!S.text('https://api.example.com/x?access_token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijk').text.includes('eyJ'));
});

console.log(`scrub tests ok (${passed})`);
