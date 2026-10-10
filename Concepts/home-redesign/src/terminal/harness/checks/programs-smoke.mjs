// Smoke test for the simulated machine: js/60-vfs.js, js/64-programs.js, js/66-assets.js.
// Every program runs against a fake ctx that records output. query() answers the way a kitty-capable terminal does
// (OK for direct media; the single EBADF error for file media in /proc, /sys, /dev, symlink loops, or any file medium
// when remote). T.Sixel and T.Assets are stubs; the GIF encoder is checked with a small decoder.
// Run: node harness/checks/programs-smoke.mjs
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const js = (f) => fs.readFileSync(path.join(here, '..', '..', 'js', f), 'utf8');

class Signal extends Error { constructor(name) { super(name); this.name = name; this.signal = name; } }

function makeT() {
  const T = { Signal, BUILTINS: ['cd', 'pwd', 'echo', 'printf', 'export', 'unset', 'alias', 'history', 'clear', 'exit', 'true', 'false', 'type', 'which', 'source', 'jobs', 'fg', 'kill', 'sleep', 'env'] };
  for (const f of ['31-kitty-diacritics.js', '60-vfs.js', '64-programs.js']) new Function('window', 'T', js(f))({}, T);
  T.Sixel = { encode: (rgba, w, h, o) => '\x1bPq"1;1;' + w + ';' + h + '#0;2;0;0;0#0~-' + (o && o.colors) + '\x1b\\' };
  T.Assets = stubAssets();
  return T;
}
function stubAssets() {
  const png = (w, h) => { const n = Math.max(6000, Math.round(w * h * 1.25)); const b = new Uint8Array(n); b.set([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]); const dv = new DataView(b.buffer); dv.setUint32(16, w); dv.setUint32(20, h); return b; };
  const jpeg = (w, h) => { const b = new Uint8Array(4000); b.set([0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3]); return b; };
  const gif = (w, h) => { const b = new Uint8Array(2000); b.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, w & 255, w >> 8, h & 255, h >> 8]); return b; };
  const rgba = (w, h) => { const d = new Uint8ClampedArray(w * h * 4); for (let i = 0; i < d.length; i += 4) { d[i] = (i / 4) % 256; d[i + 1] = 120; d[i + 2] = 200; d[i + 3] = (i / 4) % 7 === 0 ? 0 : 255; } return d; };
  return {
    names: ['bench', 'chart', 'logo', 'photo', 'spinner', 'avatar'], available: () => true,
    png: async (n, w, h) => png(w, h), jpeg: async (n, w, h) => jpeg(w, h), gif: async (n, w, h) => gif(w, h),
    rgba: (n, w, h) => rgba(w, h), frames: (n, w, h, k) => Array.from({ length: k || 12 }, () => ({ rgba: rgba(w, h), delayMs: 80 })),
    draw: () => { throw new Error('no canvas in node'); }
  };
}

function kittyReply(seq, remote) {
  let out = '';
  const re = /\x1b_G([^;\x1b]*)(?:;([^\x1b]*))?\x1b\\/g; let m;
  while ((m = re.exec(seq))) {
    const keys = Object.fromEntries(m[1].split(',').filter(Boolean).map((kv) => kv.split('=')));
    if (!keys.i || keys.q === '2') continue;
    let msg = 'OK';
    if (keys.t === 'f' || keys.t === 't' || keys.t === 's') {
      const p = Buffer.from(m[2] || '', 'base64').toString('utf8');
      if (remote || /^\/(proc|sys|dev)(\/|$)/.test(p) || /\/tmp\/loop/.test(p) || (keys.t === 't' && !/tty-graphics-protocol/.test(p))) msg = 'EBADF:Failed to read image file';
    }
    if (keys.q === '1' && msg === 'OK') continue;
    out += '\x1b_Gi=' + keys.i + ';' + msg + '\x1b\\';
  }
  if (/\x1b\[c/.test(seq)) out += '\x1b[?62;4;22c';
  return out;
}

function makeCtx(T, argv, o = {}) {
  const outs = [], rec = { queries: [], secret: [], subshell: null, raw: false };
  const vfs = o.vfs || T.VFS.local();
  const keys = (o.keys || []).slice(), lines = (o.lines || []).slice();
  const pend = new Set(), sigFns = [], trapped = {}, resizeFns = [];
  let sleeps = 0, aborted = false, cwd = o.cwd || vfs.home + '/tastebook/api';
  const raise = (name) => {
    if (trapped[name]) { sigFns.forEach((f) => f(name)); return; }
    aborted = true; const e = new Signal(name);
    pend.forEach((r) => r(e)); pend.clear(); sigFns.forEach((f) => f(name));
  };
  const waitable = (fn) => new Promise((res, rej) => { if (aborted) { rej(new Signal('SIGINT')); return; } const r = (e) => rej(e); pend.add(r); fn((v) => { pend.delete(r); res(v); }); });
  const ctx = {
    argv, env: Object.assign({ HOME: vfs.home, USER: 'jared', HOSTNAME: o.remote ? o.remote.host : 'nas1', PWD: cwd, TERM: 'xterm-256color', COLORTERM: 'truecolor', TERM_PROGRAM: 'PuppetMaster' }, o.env || {}),
    get cwd() { return cwd; }, setCwd: (p) => { cwd = p; },
    out: (s) => { if (!aborted) outs.push(String(s)); }, err: (s) => outs.push(String(s)),
    sleep: (ms) => {
      sleeps++;
      if (o.interruptAfter && sleeps === o.interruptAfter) setTimeout(() => raise('SIGINT'), 0);
      return waitable((done) => setTimeout(done, Math.min(ms, 1)));
    },
    get signal() { return { aborted, name: aborted ? 'SIGINT' : null }; },
    onSignal: (f) => sigFns.push(f), trap: (n, on) => { trapped[n] = on; },
    setRaw: (on) => { rec.raw = on; },
    readKey: () => waitable((done) => { if (keys.length) setTimeout(() => done(keys.shift()), o.keyDelay || 15); }),
    readLine: (prompt, opts) => { outs.push(prompt || ''); rec.secret.push(!!(opts && opts.secret)); return waitable((done) => { if (lines.length) done(lines.shift()); }); },
    size: () => ({ cols: o.cols || 80, rows: o.rows || 24, cellW: 8, cellH: 17 }),
    onResize: (f) => resizeFns.push(f),
    query: async (seq, opt) => { rec.queries.push(seq); outs.push(seq); return kittyReply(seq, !!o.remote); },
    vfs, remote: o.remote || null, by: 'user', assets: T.Assets,
    subshell: async (opts) => { rec.subshell = opts; return 0; },
    isatty: o.isatty !== false, stdin: o.stdin !== undefined ? o.stdin : null
  };
  return { ctx, outs, rec, vfs, resize: () => resizeFns.forEach((f) => f()) };
}

async function run(T, argv, o = {}) {
  const h = makeCtx(T, argv, o);
  const res = (T.resolveProgram && T.resolveProgram(h.vfs, h.ctx.cwd, argv[0])) || null;
  const prog = (res && res.prog) || T.Programs[argv[0]];
  if (!prog) throw new Error('no program ' + argv[0]);
  let code;
  const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout: ' + argv.join(' '))), o.timeout || 20000));
  try { code = await Promise.race([prog.run(h.ctx), timer]); }
  catch (e) { if (e instanceof Signal) code = 130; else throw e; }
  return Object.assign(h, { code, text: h.outs.join('') });
}

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, info) { if (cond) pass++; else { fail++; failures.push(name + (info ? ' :: ' + info : '')); } }
async function t(name, argv, o, expect) {
  const T = o.T || makeT();
  let r;
  try { r = await run(T, argv, o); }
  catch (e) { check(name, false, 'threw ' + (e && e.stack || e)); return null; }
  check(name + ' exit ' + expect.code, r.code === expect.code, 'got ' + r.code + '\n' + JSON.stringify(r.text.slice(-600)));
  const plain = r.text.replace(/\x1b\[[0-9;:?<>=]*[ -\/]*[@-~]/g, '');
  for (const re of expect.has || []) check(name + ' has ' + re, re.test(r.text) || re.test(plain), JSON.stringify(r.text.slice(0, 400)));
  for (const re of expect.not || []) check(name + ' lacks ' + re, !re.test(r.text));
  if (expect.fn) { try { expect.fn(r); } catch (e) { check(name + ' fn', false, String(e && e.stack || e)); } }
  return r;
}
const E = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// ---------------- VFS
{
  const T = makeT(), v = T.VFS.local();
  const imp = v.readText('/home/jared/tastebook/api/src/media/import.rs').split('\n');
  check('import.rs line 128 col 14 is pool', imp[127].slice(13, 17) === 'pool', JSON.stringify(imp[127]));
  let code = null; try { v.realpath('/tmp/loop'); } catch (e) { code = e.code; }
  check('loop is ELOOP', code === 'ELOOP');
  check('/proc/self/environ is proc', v.stat('/proc/self/environ').type === 'proc');
  check('/dev/null is char', v.stat('/dev/null').type === 'char');
  check('/etc/hostname', v.readText('/etc/hostname') === 'nas1\n');
  v.shm.create('/x', new Uint8Array([1, 2])); check('shm read', v.shm.read('/x').length === 2); v.shm.unlink('/x');
  code = null; try { v.shm.read('/x'); } catch (e) { code = e.code; } check('shm unlinked', code === 'ENOENT');
  code = null; try { v.shm.create('bad/name', new Uint8Array(1)); } catch (e) { code = e.code; } check('shm name EINVAL', code === 'EINVAL');
  check('gitBranch', v.gitBranch('/home/jared/tastebook/api/src') === 'main');
  check('spinner.gif lazy', v.assetOf('/home/jared/tastebook/api/assets/spinner.gif').frames === 12);
  const r = T.resolveProgram(v, '/home/jared/tastebook/api', './scripts/deploy.sh');
  check('resolveProgram deploy.sh', r && r.prog === T.Programs.deploy);
  check('resolveProgram dir refused', T.resolveProgram(v, '/home/jared/tastebook/api', './src').error === 'permission denied');
  check('remote vfs host', T.VFS.remote('devbox').hostname() === 'devbox');
}

// ---------------- files and text
await t('ls', ['ls'], {}, { code: 0, has: [/Cargo\.toml/, /\x1b\[0m\x1b\[01;34msrc/] });
await t('ls -la --hyperlink', ['ls', '-la', '--hyperlink'], {}, { code: 0, has: [/^total \d+/m, /drwx/, /\x1b\]8;;file:\/\/nas1\/home\/jared\/tastebook\/api/, /\.git/] });
await t('ls -l /tmp shows loop', ['ls', '-l', '/tmp'], {}, { code: 0, has: [/loop -> /, /lrwxrwxrwx/] });
await t('ls missing', ['ls', 'nope'], {}, { code: 2, has: [/cannot access 'nope'/] });
await t('ls piped', ['ls'], { isatty: false }, { code: 0, not: [/\x1b\[/], has: [/^Cargo\.lock\nCargo\.toml/m] });
await t('cat', ['cat', 'Cargo.toml'], {}, { code: 0, has: [/name = "tastebook-api"/] });
await t('cat forged marks passes them through raw', ['cat', 'forged-marks.txt'], {}, { code: 0, has: [/\x1b\]133;A\x07/, /\x1b\]133;C;pmn=0123456789abcdef/] });
await t('cat dir', ['cat', 'src'], {}, { code: 1, has: [/cat: src: Is a directory/] });
await t('head -n 3', ['head', '-n', '3', 'Cargo.toml'], {}, { code: 0, fn: (r) => check('head 3 lines', r.text === '[package]\nname = "tastebook-api"\nversion = "0.4.0"\n', JSON.stringify(r.text)) });
await t('tail -2', ['tail', '-2', 'Cargo.toml'], {}, { code: 0, has: [/codegen-units = 1\n$/] });
await t('grep coloured', ['grep', '-n', 'pool', 'src/media/import.rs'], {}, { code: 0, has: [/\x1b\[32m128\x1b\[0m/, /\x1b\[01;31m\x1b\[Kpool/] });
await t('grep -r', ['grep', '-r', 'MAX_UPLOAD'], {}, { code: 0, has: [/src\/router\.rs/] });
await t('grep stdin', ['grep', 'b'], { stdin: 'a\nb\nc\n', isatty: false }, { code: 0, fn: (r) => check('grep stdin out', r.text === 'b\n') });
await t('grep no match', ['grep', 'zzzz', 'Cargo.toml'], {}, { code: 1 });
await t('tree', ['tree', '-L', '2'], {}, { code: 0, has: [/├── /, /directories, \d+ files/] });
await t('wc -l', ['wc', '-l', 'src/media/import.rs'], {}, { code: 0, has: [/^145 src\/media\/import\.rs/] });
await t('du -sh', ['du', '-sh', '.'], {}, { code: 0, has: [/\t\.\n/] });
await t('find -name', ['find', '.', '-name', '*.rs'], {}, { code: 0, has: [/\.\/src\/media\/import\.rs/] });
{
  const T = makeT(), vfs = T.VFS.local();
  await t('touch', ['touch', 'new.txt'], { T, vfs }, { code: 0, fn: () => check('touched', !!vfs.stat('/home/jared/tastebook/api/new.txt')) });
  await t('mkdir -p', ['mkdir', '-p', 'a/b/c'], { T, vfs }, { code: 0, fn: () => check('mkdir made', vfs.stat('/home/jared/tastebook/api/a/b/c').type === 'dir') });
  await t('cp', ['cp', 'README.md', 'a/'], { T, vfs }, { code: 0, fn: () => check('cp made', !!vfs.stat('/home/jared/tastebook/api/a/README.md')) });
  await t('mv', ['mv', 'new.txt', 'a/b/'], { T, vfs }, { code: 0, fn: () => check('mv moved', !!vfs.stat('/home/jared/tastebook/api/a/b/new.txt')) });
  await t('rm dir without -r', ['rm', 'a'], { T, vfs }, { code: 1, has: [/Is a directory/] });
  await t('rm -r', ['rm', '-r', 'a'], { T, vfs }, { code: 0, fn: () => check('rm removed', !vfs.stat('/home/jared/tastebook/api/a')) });
  await t('git status sees untracked', ['git', 'status', '-s'], { T, vfs }, { code: 0, has: [/\?\? forged-marks\.txt/, / M src\/media\/import\.rs/] });
}
await t('date', ['date', '+%Y-%m-%d'], {}, { code: 0, has: [/^\d{4}-\d{2}-\d{2}\n$/] });
await t('uname -a', ['uname', '-a'], {}, { code: 0, has: [/^Linux nas1 6\.8\.0-45-generic .* GNU\/Linux\n$/] });
await t('whoami', ['whoami'], {}, { code: 0, has: [/^jared\n$/] });
await t('seq', ['seq', '3'], {}, { code: 0, fn: (r) => check('seq out', r.text === '1\n2\n3\n') });
await t('yes stops on Ctrl+C', ['yes'], { interruptAfter: 5 }, { code: 130, has: [/^y\ny\n/] });
await t('file png', ['file', 'assets/bench.png'], {}, { code: 0, has: [/PNG image data, 600 x 150/] });
await t('file proc', ['file', '/proc/self/environ'], {}, { code: 0, has: [/empty/] });
await t('less q', ['less', 'src/media/import.rs'], { keys: ['j', ' ', 'G', 'q'] }, { code: 0, has: [/\x1b\[\?1049h/, /\x1b\[\?2026h/, /\(END\)/, /\x1b\[\?1049l/] });
await t('man ls', ['man', 'ls'], { keys: ['q'] }, { code: 0, has: [/\x1b\[1mNAME/, /Manual page ls\(1\)/] });
await t('man missing', ['man', 'nosuch'], {}, { code: 16, has: [/No manual entry for nosuch/] });

// ---------------- git
await t('git status', ['git', 'status'], {}, { code: 0, has: [/On branch main/, /\x1b\[31mmodified:   src\/media\/import\.rs/, /Untracked files/] });
await t('git log graph', ['git', 'log', '--oneline', '--graph', '--decorate'], { env: { GIT_PAGER: 'cat' } }, { code: 0, has: [/\x1b\[1;36mHEAD -> (\x1b\[33m)?\x1b\[1;32mmain/, /\x1b\[1;31morigin\/main/, /tag: v0\.4\.0/, /\x1b\[3\dm\|\x1b\[0m\x1b\[3\dm\\/] });
await t('git diff', ['git', 'diff'], { env: { GIT_PAGER: 'cat' } }, { code: 0, has: [/\x1b\[1mdiff --git a\/src\/media\/import\.rs/, /\x1b\[36m@@ -\d+,\d+ \+\d+,\d+ @@/, /\x1b\[31m-    async fn import_rejects_duplicate_hash\(pool: PgPool\)/, /\x1b\[32m\+    async fn import_rejects_duplicate_hash\(db: PgPool\)/] });
await t('git branch', ['git', 'branch'], {}, { code: 0, has: [/\* \x1b\[32mmain/, /search-ranking/] });
await t('git show', ['git', 'show'], { env: { GIT_PAGER: 'cat' } }, { code: 0, has: [/commit [0-9a-f]{40}/, /keep originals/, /\+        let path = dir\.join/] });
await t('git switch', ['git', 'switch', 'search-ranking'], {}, { code: 0, has: [/Switched to branch 'search-ranking'/] });
await t('git outside repo', ['git', 'status'], { cwd: '/tmp' }, { code: 128, has: [/not a git repository/] });
{
  const T = makeT(), vfs = T.VFS.local();
  await t('git add', ['git', 'add', 'src/router.rs'], { T, vfs }, { code: 0 });
  await t('git commit', ['git', 'commit', '-m', 'router: 413 above 25 MiB'], { T, vfs }, { code: 0, has: [/\[main [0-9a-f]{7}\] router: 413/, /1 file changed/] });
  await t('git status after commit', ['git', 'status'], { T, vfs }, { code: 0, has: [/ahead of 'origin\/main' by 1 commit/] });
}

// ---------------- cargo, npm, python, make, deploy
await t('cargo build', ['cargo', 'build'], {}, { code: 0, has: [/\x1b\[1m\x1b\[32m   Compiling\x1b\[0m tokio v1\.40\.0/, /\x1b\]9;4;1;\d+\x1b\\/, /src\/media\/import\.rs:71:13/, /Finished\x1b\[0m `dev` profile/, /\x1b\]9;4;0\x1b\\/] });
// the test binary compiles whole before a filter picks tests, so the seeded broken test module fails every `cargo test`
await t('cargo test', ['cargo', 'test'], {}, { code: 101, has: [/error\[E0425\]/, /could not compile `tastebook-api`/], not: [/running 214 tests/] });
{
  const T = makeT(), vfs = T.VFS.local();
  await t('git restore import.rs', ['git', 'restore', 'src/media/import.rs'], { T, vfs }, { code: 0 });
  await t('cargo test after restore', ['cargo', 'test'], { T, vfs }, { code: 0, has: [/running 214 tests/, /test result: \x1b\[32mok\x1b\[0m\. 214 passed; 0 failed/] });
}
await t('cargo test media::', ['cargo', 'test', 'media::'], {}, { code: 101, has: [/error\[E0425\]/, /cannot find value `pool` in this scope/, /--> src\/media\/import\.rs:128:14/, /128 \|/, /could not compile `tastebook-api`/] });
await t('cargo bench', ['cargo', 'bench'], {}, { code: 0, has: [/Benchmarking import\/content_hash: Warming up/, /time:   \[24\.117 µs/, /Performance has improved/] });
await t('cargo run stops on Ctrl+C', ['cargo', 'run'], { interruptAfter: 80 }, { code: 130, has: [/Running\x1b\[0m `target\/debug\/tastebook-api`/, /listening on/] });
await t('cargo outside', ['cargo', 'build'], { cwd: '/tmp' }, { code: 101, has: [/could not find `Cargo.toml`/] });
await t('npm install', ['npm', 'install'], {}, { code: 0, has: [/█/, /░/, /added 312 packages/] });
await t('npm run dev', ['npm', 'run', 'dev'], { lines: ['h', 'q'] }, { code: 0, has: [/VITE\x1b\[0m \x1b\[32mv6\.0\.3/, /\x1b\]8;;http:\/\/localhost:5173\/\x1b\\/, /Shortcuts/] });
await t('npm run dev Ctrl+C', ['npm', 'run', 'dev'], { interruptAfter: 4 }, { code: 130, has: [/hmr update/] });
await t('npm missing script', ['npm', 'run', 'nope'], {}, { code: 1, has: [/Missing script: "nope"/] });
await t('python http.server', ['python3', '-m', 'http.server'], { interruptAfter: 6 }, { code: 0, has: [/Serving HTTP on 0\.0\.0\.0 port 8000/, /"GET /, /Keyboard interrupt received, exiting\./] });
await t('python repl', ['python3'], { lines: ['2**10', 'print("hi")', 'exit()'] }, { code: 0, has: [/>>> /, /1024\n/, /hi\n/] });
await t('make lint fails like clippy -D warnings', ['make'], {}, { code: 2, has: [/cargo fmt --check/, /cargo clippy/, /make: \*\*\* \[Makefile:13: lint\] Error 101/] });
await t('deploy --stage', ['./scripts/deploy.sh', '--stage'], {}, { code: 0, has: [/\[1\/5\]/, /\[5\/5\]/, /uncommitted changes/, /█/, /deployed [0-9a-f]{7} to stage/, /\x1b\]9;4;1;\d+/, /\x1b\]9;4;0\x1b\\/] });
await t('deploy no args', ['deploy'], {}, { code: 2, has: [/usage:/] });
await t('deploy --prod declined', ['deploy', '--prod'], { lines: ['n'] }, { code: 1, has: [/to production\? \[y\/N\]/, /aborted/] });

// ---------------- full-screen and showcase programs
await t('htop', ['htop'], { keys: ['\x1b[B', 't', '\x1b[<0;10;12M', 'q'], keyDelay: 25 }, { code: 0, has: [/\x1b\[\?1049h/, /\x1b\[\?2026h/, /\x1b\[\?1000h/, /PID USER/, /F10\x1b\[30;46mQuit/, /\x1b\[30;46m/, /└─ /, /\x1b\[\?1049l/] });
await t('htop Ctrl+C', ['htop'], { keys: ['\x03'] }, { code: 0, has: [/\x1b\[\?1049l/] });
{
  const T = makeT(); let resized = null;
  await t('htop resize', ['htop'], { T, keys: ['q'], keyDelay: 40, cols: 44, rows: 12 }, { code: 0, has: [/CPU\x1b\[0m\x1b\[1m\[/] });
  void resized;
}
await t('colortest', ['colortest'], {}, { code: 0, has: [/\x1b\[48;5;16m/, /\x1b\[48;5;255m/, /\x1b\[38;2;\d+;\d+;\d+;48;2;/, /\x1b\[4:3;58:2::235:80:80m/, /\x1b\[4:2m/, /\x1b\[4:4;/, /\x1b\[53m/, /\x1b\[9m/, /\x1b\[8m/, /\x1b\[7m/, /\x1b\]8;;https:\/\/sw\.kovidgoyal\.net/] });
await t('unicode-test', ['unicode-test'], {}, { code: 0, has: [/日本語/, /\u{1F468}‍\u{1F469}/u, /╔═/, /╭/, /⠀/, //, /\u{1FB00}/u, /\u{1FB3B}/u] });
await t('fastfetch kitty', ['fastfetch'], {}, { code: 0, has: [/\x1b_Ga=q|\x1b_Gi=31,s=1,v=1,a=q/, /\x1b_Ga=T,f=100,t=d,c=20,r=10,C=1,q=2/, /\x1b\[23C/, /OS\x1b\[0m: Ubuntu 24\.04/] });
await t('bell', ['bell', '2'], {}, { code: 0, fn: (r) => check('two BEL', (r.text.match(/\x07/g) || []).length === 2) });
await t('notify', ['notify', '-t', 'Build', 'cargo; done'], {}, { code: 0, has: [/\x1b\]777;notify;Build;cargo  done\x1b\\/] });

// ---------------- images
const icatQ = /\x1b_Gi=31,s=1,v=1,a=q,t=d,f=24;AAAA\x1b\\/;
await t('icat stream', ['kitten', 'icat', '--transfer-mode=stream', 'assets/bench.png'], {}, { code: 0, has: [icatQ, /\x1b_Ga=T,f=100,t=d,q=2,m=1;/, /\x1b_Gm=1;/, /\x1b_Gm=0;/], fn: (r) => {
  const chunks = r.text.match(/\x1b_G[^;\x1b]*;([^\x1b]*)\x1b\\/g).filter((c) => /m=1/.test(c));
  check('icat chunks are 4096', chunks.every((c) => c.split(';')[1].replace(/\x1b\\$/, '').length === 4096));
} });
await t('icat default picks file for a local png', ['kitten', 'icat', 'assets/logo.png'], {}, { code: 0, has: [/a=T,f=100,t=f,i=\d+,q=0;/] });
await t('icat file', ['kitten', 'icat', '--transfer-mode=file', 'assets/chart.png'], {}, { code: 0, fn: (r) => {
  const m = /a=T,f=100,t=f,i=\d+,q=0;([^\x1b]+)/.exec(r.text);
  check('icat file payload is the path', m && Buffer.from(m[1], 'base64').toString() === '/home/jared/tastebook/api/assets/chart.png');
} });
{
  const T = makeT(), vfs = T.VFS.local();
  await t('icat memory', ['kitten', 'icat', '--transfer-mode=memory', 'assets/bench.png'], { T, vfs }, { code: 0, has: [/t=s,S=\d+,i=\d+,q=0;/], fn: (r) => {
    const m = /t=s,S=\d+,i=\d+,q=0;([^\x1b]+)/.exec(r.text), name = Buffer.from(m[1], 'base64').toString();
    check('shm name has no extra slash', /^\/[^/]+$/.test(name));
    check('shm object exists until the terminal unlinks it', vfs.shm.list().indexOf(name) >= 0);
  } });
  await t('icat temp', ['kitten', 'icat', '--transfer-mode=temp', 'assets/bench.png'], { T, vfs }, { code: 0, fn: (r) => {
    const m = /t=t,S=\d+,i=\d+,q=0;([^\x1b]+)/.exec(r.text);
    check('temp path in /tmp with tty-graphics-protocol', m && /^\/tmp\/.*tty-graphics-protocol/.test(Buffer.from(m[1], 'base64').toString()));
  } });
}
await t('icat jpeg as RGBA', ['kitten', 'icat', '--transfer-mode=stream', 'assets/photo.jpg'], {}, { code: 0, has: [/a=T,f=32,s=800,v=450,t=d/] });
await t('icat remote falls back to stream', ['kitten', 'icat', '--transfer-mode=file', 'pics/bench.png'], { vfs: makeT().VFS.remote('devbox'), cwd: '/home/jared', remote: { host: 'devbox' } }, { code: 0, has: [/a=T,f=100,t=d/], not: [/t=f,/] });
await t('icat animation', ['kitten', 'icat', 'assets/spinner.gif'], {}, { code: 0, has: [/a=T,f=32,s=64,v=64,I=\d+,q=2/, /a=a,I=\d+,r=1,z=80/, /a=f,I=\d+,f=32,s=64,v=64,X=1,z=80/, /a=a,I=\d+,s=2/, /a=a,I=\d+,s=3,v=1/] });
await t('icat placeholder', ['kitten', 'icat', '--unicode-placeholder', 'assets/logo.png'], {}, { code: 0, has: [/a=T,U=1,i=\d+,f=100/, /\x1b\[38:2:\d+:\d+:\d+m\u{10EEEE}̅̅/u, /\x1b\[39m/] });
await t('icat place and z-index', ['kitten', 'icat', '--place', '20x10@4x2', '--z-index=-1', '--transfer-mode=stream', 'assets/logo.png'], {}, { code: 0, has: [/\x1b\[3;5H/, /c=20,r=10,z=-1,C=1/] });
await t('icat clear', ['kitten', 'icat', '--clear'], {}, { code: 0, has: [/\x1b_Ga=d,d=A\x1b\\/] });
await t('icat refuses /proc/self/environ (terminal reply)', ['kitten', 'icat', '--transfer-mode=file', '/proc/self/environ'], {}, { code: 1, has: [/EBADF:Failed to read image file/] });
await t('icat refuses the /tmp/loop symlink loop', ['kitten', 'icat', '--transfer-mode=file', '/tmp/loop'], {}, { code: 1, has: [/EBADF:Failed to read image file/] });
await t('icat missing file', ['kitten', 'icat', 'nope.png'], {}, { code: 1, has: [/Failed to process image file/] });
await t('img2sixel', ['img2sixel', 'assets/bench.png'], {}, { code: 0, has: [/^\x1bPq"1;1;600;150/, /256\x1b\\$/] });
await t('imgcat', ['imgcat', 'assets/bench.png'], {}, { code: 0, has: [/\x1b\]1337;File=name=YmVuY2gucG5n;size=\d+;width=auto;height=auto;inline=1:/, /\x07\n$/] });
await t('imgcat multipart above 1 MiB', ['imgcat', '/home/jared/Pictures/photo-large.png'], {}, { code: 0, has: [/\x1b\]1337;MultipartFile=/, /\x1b\]1337;FilePart=/, /\x1b\]1337;FileEnd\x07/] });
await t('chafa symbols', ['chafa', 'assets/bench.png'], {}, { code: 0, has: [/\x1b\[38;2;\d+;120;200;48;2;\d+;120;200m▀/] });
await t('chafa kitty', ['chafa', '--format=kitty', 'assets/bench.png'], {}, { code: 0, has: [/a=T,t=d,c=\d+,r=\d+,q=2,f=100/] });
await t('chafa sixels', ['chafa', '--format=sixels', 'assets/bench.png'], {}, { code: 0, has: [/\x1bPq/] });
await t('chafa iterm', ['chafa', '-f', 'iterm', 'assets/bench.png'], {}, { code: 0, has: [/\x1b\]1337;File=/] });

// ---------------- sudo, ssh
await t('sudo', ['sudo', 'whoami'], { lines: ['correct horse'] }, { code: 0, has: [/\[sudo\] password for jared: /, /^\[sudo\][^\n]*root\n$/m], fn: (r) => check('sudo prompt is secret', r.rec.secret[0] === true) });
await t('sudo empty passwords', ['sudo', 'ls'], { lines: ['', '', ''] }, { code: 1, has: [/Sorry, try again\./, /3 incorrect password attempts/] });
await t('ssh devbox', ['ssh', 'devbox'], { lines: ['yes', 'pw'] }, { code: 0, has: [/authenticity of host 'devbox \(192\.168\.50\.42\)'/, /Permanently added 'devbox'/, /Connection to devbox closed\./], fn: (r) => {
  check('ssh password is secret', r.rec.secret[1] === true && r.rec.secret[0] === false);
  const s = r.rec.subshell;
  check('ssh subshell', s && s.host === 'devbox' && s.user === 'jared' && s.remote === true && s.vfs && s.vfs.hostname() === 'devbox' && /Welcome to Ubuntu/.test(s.motd));
  check('known_hosts updated', /^devbox,/m.test(r.vfs.readText('/home/jared/.ssh/known_hosts')));
} });
await t('ssh host key refused', ['ssh', 'devbox'], { lines: ['no'] }, { code: 255, has: [/Host key verification failed/] });
await t('ssh unknown host', ['ssh', 'nowhere'], {}, { code: 255, has: [/Could not resolve hostname nowhere/] });
await t('ssh remote command', ['ssh', 'devbox', 'uname', '-n'], { lines: ['yes', 'pw'] }, { code: 0, has: [/password: devbox\n$/] });

// ---------------- every program has a summary and runs without throwing on --help-ish input
{
  const T = makeT();
  for (const [name, p] of Object.entries(T.Programs)) check('summary ' + name, typeof p.summary === 'string' && p.summary.length > 3);
  for (const [name, p] of Object.entries(T.Programs)) if (p.complete) check('complete ' + name, Array.isArray(p.complete([''])));
}

// ---------------- the GIF encoder of 66-assets.js, decoded back
{
  const T2 = {}; new Function('window', 'T', js('66-assets.js'))({}, T2);
  check('assets unavailable in node', T2.Assets.available() === false);
  const w = 37, h = 23, frames = [0, 1, 2].map((k) => { const d = new Uint8ClampedArray(w * h * 4); for (let i = 0; i < w * h; i++) { d[i * 4] = ((i + k * 11) * 47) % 256; d[i * 4 + 1] = (i * 13) % 256; d[i * 4 + 2] = (i * 29 + k) % 256; d[i * 4 + 3] = i % 9 ? 255 : 0; } return { rgba: d, delayMs: 80 }; });
  const gif = T2.Assets.encodeGif(frames, w, h);
  check('gif header', String.fromCharCode(...gif.slice(0, 6)) === 'GIF89a' && gif[gif.length - 1] === 0x3b);
  const dec = decodeGif(gif);
  check('gif frame count', dec.frames.length === 3, String(dec.frames.length));
  let okPix = true;
  dec.frames.forEach((idx, k) => {
    for (let i = 0; i < w * h; i++) {
      const d = frames[k].rgba, want = d[i * 4 + 3] < 128 ? 255 : Math.round(d[i * 4] / 51) * 42 + Math.round(d[i * 4 + 1] / 42.5) * 6 + Math.round(d[i * 4 + 2] / 51);
      if (idx[i] !== want) { okPix = false; break; }
    }
  });
  check('gif LZW round trip', okPix);
  check('gif delay 8 cs', dec.delays.every((d) => d === 8));
}
function decodeGif(b) {
  let p = 13 + 768; const frames = [], delays = [];
  while (p < b.length && b[p] !== 0x3b) {
    if (b[p] === 0x21) { if (b[p + 1] === 0xf9) delays.push(b[p + 4] | b[p + 5] << 8); p += 2; while (b[p]) p += b[p] + 1; p++; continue; }
    if (b[p] === 0x2c) {
      const w = b[p + 5] | b[p + 6] << 8, h = b[p + 7] | b[p + 8] << 8; p += 10;
      const min = b[p++]; const data = [];
      while (b[p]) { for (let i = 1; i <= b[p]; i++) data.push(b[p + i]); p += b[p] + 1; }
      p++;
      frames.push(lzwDecode(data, min, w * h));
      continue;
    }
    throw new Error('bad gif block ' + b[p] + ' at ' + p);
  }
  return { frames, delays };
}
function lzwDecode(data, min, n) {
  const clear = 1 << min, eoi = clear + 1; let size = min + 1, dict = [], prev = null, bit = 0; const out = [];
  const reset = () => { dict = []; for (let i = 0; i < clear; i++) dict[i] = [i]; dict[clear] = []; dict[eoi] = []; size = min + 1; prev = null; };
  reset();
  const read = () => { let v = 0; for (let i = 0; i < size; i++) { const byte = data[(bit + i) >> 3]; if (byte === undefined) return eoi; v |= ((byte >> ((bit + i) & 7)) & 1) << i; } bit += size; return v; };
  for (;;) {
    const code = read();
    if (code === clear) { reset(); continue; }
    if (code === eoi) break;
    let entry;
    if (code < dict.length) entry = dict[code]; else if (prev) entry = prev.concat([prev[0]]); else throw new Error('bad code');
    out.push(...entry);
    if (prev) { dict.push(prev.concat([entry[0]])); if (dict.length === (1 << size) && size < 12) size++; }
    prev = entry;
  }
  return out.slice(0, n);
}

console.log('programs-smoke: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { failures.forEach((f) => console.log('  FAIL ' + f)); process.exit(1); }
