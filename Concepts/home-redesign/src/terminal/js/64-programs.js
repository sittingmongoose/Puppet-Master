/* T.Programs: the simulated machine's programs (ARCHITECTURE.md section 4, program contract).
   Each program is { run: async (ctx) -> exit code, summary, complete(args)? } and writes real escape sequences:
   SGR 16/256/truecolor, styled underlines (4:3 with 58), OSC 8 links, cursor movement, the alternate screen,
   synchronized output (mode 2026), OSC 9;4 progress, kitty graphics, sixel and iTerm2 images.
   Builtins (cd, echo, printf, sleep ...) belong to the shell, not here.
   Source is ASCII only: every non-ASCII character is built at runtime with String.fromCodePoint. */
(function () {
  var P = T.Programs = T.Programs || {};
  var ESC = '\u001b', CSI = ESC + '[', ST = ESC + '\\', BEL = '\u0007';
  function U() { return String.fromCodePoint.apply(String, arguments); }
  var CH = {
    h: U(0x2500), v: U(0x2502), tl: U(0x250c), tr: U(0x2510), bl: U(0x2514), br: U(0x2518), lt: U(0x251c), rt: U(0x2524),
    rtl: U(0x256d), rtr: U(0x256e), rbl: U(0x2570), rbr: U(0x256f), full: U(0x2588), light: U(0x2591), med: U(0x2592),
    upper: U(0x2580), lower: U(0x2584), arrow: U(0x279c), check: U(0x2713), cross: U(0x2717), mu: U(0x00b5), dot: U(0x00b7),
    ell: U(0x2026), tri: U(0x25bd)
  };
  var SPIN = [0x280b, 0x2819, 0x2839, 0x2838, 0x283c, 0x2834, 0x2826, 0x2827, 0x2807, 0x280f].map(function (c) { return U(c); });

  /* ------------------------------------------------------------------ helpers */
  function sgr(s) { return CSI + s + 'm'; }
  var R0 = sgr('0');
  function colorOn(ctx) { return ctx.isatty !== false && !(ctx.env && ctx.env.NO_COLOR); }
  function paint(on, code, s) { return on ? sgr(code) + s + R0 : s; }
  function link(uri, text) { return ESC + ']8;;' + uri + ST + text + ESC + ']8;;' + ST; }
  function progress(state, value) { return ESC + ']9;4;' + state + (value !== undefined ? ';' + Math.round(value) : '') + ST; }
  var SYNC_ON = CSI + '?2026h', SYNC_OFF = CSI + '?2026l';
  function wcw(cp) {
    if (T.wcwidth) return T.wcwidth(cp);
    if (cp < 0x20) return 0;
    if ((cp >= 0x300 && cp <= 0x36f) || cp === 0x200d || (cp >= 0xfe00 && cp <= 0xfe0f)) return 0;
    if ((cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xff00 && cp <= 0xff60) || (cp >= 0x1f300 && cp <= 0x1faff)) return 2;
    return 1;
  }
  var ESC_RE = /\u001b\[[0-9;:?<>=]*[ -\/]*[@-~]|\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)|\u001b[_P^][^\u001b]*\u001b\\|\u001b[()][A-Za-z0-9]|\u001b[=>78]/g;
  function strip(s) { return String(s).replace(ESC_RE, ''); }
  function width(s) {
    s = strip(s); var w = 0;
    for (var i = 0; i < s.length; i++) { var c = s.codePointAt(i); if (c > 0xffff) i++; w += wcw(c); }
    return w;
  }
  function pad(s, n) { return s + ' '.repeat(Math.max(0, n - width(s))); }
  function lpad(s, n) { s = String(s); return ' '.repeat(Math.max(0, n - width(s))) + s; }
  function cut(s, n) {
    var out = '', w = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i), ch = String.fromCodePoint(c); if (c > 0xffff) i++;
      var cw = wcw(c); if (w + cw > n) break; out += ch; w += cw;
    }
    return out;
  }
  var ERR = { ENOENT: 'No such file or directory', EISDIR: 'Is a directory', ENOTDIR: 'Not a directory',
    ELOOP: 'Too many levels of symbolic links', EACCES: 'Permission denied', EINVAL: 'Invalid argument',
    EEXIST: 'File exists', ENOTEMPTY: 'Directory not empty', EIO: 'Input/output error' };
  function errText(e) { return (e && ERR[e.code]) || (e && e.message) || 'error'; }
  function abs(ctx, p) { return ctx.vfs.resolve(ctx.cwd, p); }
  function wopts(ctx) { return { root: !!(ctx.env && ctx.env.USER === 'root') }; }
  function isSignal(e) { return e && (e instanceof (T.Signal || function () {}) || e.signal); }
  function rnd(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function utf8(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.codePointAt(i); if (c > 0xffff) i++;
      if (c < 0x80) out.push(c); else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function b64(bytes) {
    if (typeof bytes === 'string') bytes = utf8(bytes);
    var out = [], i = 0, n = bytes.length, chunk = '';
    for (; i + 2 < n; i += 3) {
      var v = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      chunk += B64[v >> 18] + B64[(v >> 12) & 63] + B64[(v >> 6) & 63] + B64[v & 63];
      if (chunk.length >= 8192) { out.push(chunk); chunk = ''; }
    }
    if (i < n) {
      var a = bytes[i], b = i + 1 < n ? bytes[i + 1] : 0, w = (a << 16) | (b << 8);
      chunk += B64[w >> 18] + B64[(w >> 12) & 63] + (i + 1 < n ? B64[(w >> 6) & 63] : '=') + '=';
    }
    out.push(chunk);
    return out.join('');
  }
  function human(n) {
    if (n < 1024) return String(n);
    var u = ['K', 'M', 'G', 'T'], i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < 3);
    return (n < 10 ? (Math.ceil(n * 10) / 10).toFixed(1) : String(Math.ceil(n))) + u[i];
  }
  function mib(n) { return (n / 1048576).toFixed(1) + ' MiB'; }
  function hostOf(ctx) { return (ctx.env && ctx.env.HOSTNAME) || (ctx.vfs && ctx.vfs.host) || 'nas1'; }
  function userOf(ctx) { return (ctx.env && ctx.env.USER) || 'jared'; }
  function homeOf(ctx) { return (ctx.env && ctx.env.HOME) || (ctx.vfs && ctx.vfs.home) || '/home/jared'; }
  function assets(ctx) { return ctx.assets || T.Assets; }
  function relTo(base, p) { return p === base ? '.' : p.indexOf(base + '/') === 0 ? p.slice(base.length + 1) : p; }

  /* getopt-ish: short flags may be combined (-la); `values` lists flags that take an argument */
  function parse(args, values) {
    values = values || [];
    var f = {}, pos = [], i = 0;
    while (i < args.length) {
      var a = args[i];
      if (a === '--') { pos = pos.concat(args.slice(i + 1)); break; }
      if (/^--[^=]+=/.test(a)) { var k = a.slice(2, a.indexOf('=')); f[k] = a.slice(a.indexOf('=') + 1); i++; continue; }
      if (/^--./.test(a)) { var name = a.slice(2); if (values.indexOf(name) >= 0 && i + 1 < args.length) { f[name] = args[i + 1]; i += 2; } else { f[name] = true; i++; } continue; }
      if (/^-[^-]/.test(a) && !/^-\d/.test(a)) {
        for (var j = 1; j < a.length; j++) {
          var c = a[j];
          if (values.indexOf(c) >= 0) { if (j + 1 < a.length) f[c] = a.slice(j + 1); else { f[c] = args[i + 1]; i++; } break; }
          f[c] = true;
        }
        i++; continue;
      }
      pos.push(a); i++;
    }
    return { f: f, pos: pos };
  }
  /* inputs: files (or stdin) as [{ name, text }], printing errors as `prog: name: reason` */
  function inputs(ctx, prog, files, out) {
    var list = [];
    if (!files.length || (files.length === 1 && files[0] === '-')) { list.push({ name: '', text: ctx.stdin || '' }); return { list: list, rc: 0 }; }
    var rc = 0;
    files.forEach(function (fn) {
      if (fn === '-') { list.push({ name: '-', text: ctx.stdin || '' }); return; }
      try { list.push({ name: fn, text: ctx.vfs.readText(abs(ctx, fn)) }); }
      catch (e) { ctx.err(prog + ': ' + fn + ': ' + errText(e) + '\n'); rc = 1; }
    });
    return { list: list, rc: rc };
  }
  /* run another program inside this job (sudo, make, ssh host cmd) */
  async function runSub(ctx, argv, over) {
    var res = T.resolveProgram ? T.resolveProgram(ctx.vfs, ctx.cwd, argv[0]) : null;
    var prog = (res && res.prog) || P[argv[0]];
    if (!prog) return null;
    var sub = Object.create(ctx);
    var props = Object.assign({ argv: argv.slice() }, over || {});
    /* the shell's ctx defines cwd and signal as getters: shadow them with plain values */
    Object.keys(props).forEach(function (k) { Object.defineProperty(sub, k, { value: props[k], writable: true, configurable: true, enumerable: true }); });
    var code = await prog.run(sub);
    return typeof code === 'number' ? code : 0;
  }
  function splitWords(s) { var out = [], m, re = /"([^"]*)"|'([^']*)'|(\S+)/g; while ((m = re.exec(s))) out.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]); return out; }

  /* event loop for full-screen programs: keys, a periodic tick, resizes and wake-ups */
  async function loop(ctx, h) {
    var pending = null, wakeFn = null, woke = false, nextTick = h.ms ? Date.now() + h.ms : 0;
    ctx.onResize(function () { h.resized = true; if (wakeFn) wakeFn('wake'); else woke = true; });
    h.wake = function () { if (wakeFn) wakeFn('wake'); else woke = true; };
    if (h.draw) h.draw();
    while (!h.done) {
      if (!pending) pending = ctx.readKey().then(function (k) { return { k: k }; }, function (e) { return { e: e }; });
      var waits = [pending, new Promise(function (res) { wakeFn = res; })];
      if (h.ms) waits.push(ctx.sleep(Math.max(0, nextTick - Date.now())).then(function () { return 'tick'; }, function (e) { return { e: e }; }));
      if (woke) { woke = false; wakeFn('wake'); }
      var r = await Promise.race(waits);
      wakeFn = null;
      if (r && r.e) throw r.e;
      if (r && r.k !== undefined) { pending = null; if (h.key(r.k) === false) h.done = true; }
      else if (r === 'tick') { nextTick = Date.now() + h.ms; if (h.tick) h.tick(); }
      if (h.done) break;
      if (h.resized) { h.resized = false; if (h.resize) h.resize(); }
      if (h.draw) h.draw();
    }
  }
  /* split a line holding SGR and OSC 8 into rows of at most `cols` cells, carrying the active style across rows */
  function wrapAnsi(line, cols) {
    var rows = [], cur = '', w = 0, active = '', re = /\u001b\[[0-9;:]*m|\u001b\]8;[^\u0007\u001b]*(?:\u0007|\u001b\\)|[\s\S]/gu, m;
    while ((m = re.exec(line))) {
      var t = m[0];
      if (t.charCodeAt(0) === 27) {
        cur += t;
        if (/^\u001b\[0?m$/.test(t)) active = ''; else if (t[1] === '[') active += t;
        continue;
      }
      var cw = wcw(t.codePointAt(0));
      if (w + cw > cols) { rows.push(cur + R0); cur = active; w = 0; }
      cur += t; w += cw;
    }
    rows.push(cur);
    return rows;
  }

  /* ------------------------------------------------------------------ the pager (less, man, git) */
  async function pager(ctx, text, o) {
    o = o || {};
    if (ctx.isatty === false) { ctx.out(text); return 0; }
    var lines = String(text).replace(/\n$/, '').split('\n');
    var sz = ctx.size(), rows = sz.rows, cols = sz.cols, wrapped = [];
    function rewrap() { sz = ctx.size(); rows = sz.rows; cols = sz.cols; wrapped = []; lines.forEach(function (l) { wrapAnsi(l.replace(/\t/g, '        '), cols).forEach(function (r) { wrapped.push(r); }); }); }
    rewrap();
    if (o.quitIfOneScreen && wrapped.length <= rows - 1) { ctx.out(text); return 0; }
    var top = 0, search = null, typing = null, msg = '', quit = false, h = {};
    ctx.trap('SIGINT', true);
    ctx.onSignal(function (n) { if (n === 'SIGINT' || n === 'SIGTERM') { quit = true; if (h.wake) h.wake(); } });
    ctx.setRaw(true);
    ctx.out(CSI + '?1049h' + CSI + 'H' + CSI + '2J');
    var maxTop = function () { return Math.max(0, wrapped.length - (rows - 1)); };
    function hl(row) {
      if (!search) return row;
      var plain = strip(row), re;
      try { re = new RegExp(search, 'gi'); } catch (e) { return row; }
      if (!re.test(plain)) return row;
      return plain.replace(new RegExp(search, 'gi'), function (x) { return sgr('7') + x + sgr('27'); });
    }
    h.draw = function () {
      var out = SYNC_ON + CSI + 'H';
      for (var i = 0; i < rows - 1; i++) {
        var row = wrapped[top + i];
        out += CSI + (i + 1) + ';1H' + (row === undefined ? sgr('1;34') + '~' + R0 : hl(row) + R0) + CSI + 'K';
      }
      var status;
      if (typing !== null) status = '/' + typing;
      else if (msg) status = sgr('7') + msg + R0;
      else if (top >= maxTop()) status = sgr('7') + '(END)' + R0;
      else if (top === 0 && o.name) status = sgr('7') + o.name + R0;
      else status = ':';
      out += CSI + rows + ';1H' + status + CSI + 'K' + SYNC_OFF;
      msg = '';
      ctx.out(out);
    };
    h.resize = function () { rewrap(); top = Math.min(top, maxTop()); };
    function find(dir, from) {
      var re; try { re = new RegExp(search, 'i'); } catch (e) { msg = 'Invalid pattern'; return; }
      for (var i = from; i >= 0 && i < wrapped.length; i += dir) if (re.test(strip(wrapped[i]))) { top = Math.min(i, maxTop()); return; }
      msg = 'Pattern not found';
    }
    h.key = function (k) {
      if (quit) return false;
      var page = rows - 1;
      if (typing !== null) {
        if (k === '\r' || k === '\n') { search = typing || search; typing = null; if (search) find(1, top + 1); }
        else if (k === '\u007f' || k === '\b') { if (!typing.length) typing = null; else typing = typing.slice(0, -1); }
        else if (k === ESC || k === '\u0003') typing = null;
        else if (k >= ' ') typing += k;
        return true;
      }
      switch (k) {
        case 'q': case 'Q': case '\u0003': return false;
        case 'j': case 'e': case '\r': case '\n': case CSI + 'B': case ESC + 'OB': case '\u000e': top++; break;
        case 'k': case 'y': case CSI + 'A': case ESC + 'OA': case '\u0010': top--; break;
        case ' ': case 'f': case CSI + '6~': case '\u0006': top += page; break;
        case 'b': case CSI + '5~': case '\u0002': top -= page; break;
        case 'd': case '\u0004': top += Math.floor(page / 2); break;
        case 'u': case '\u0015': top -= Math.floor(page / 2); break;
        case 'g': case '<': case CSI + 'H': case CSI + '1~': top = 0; break;
        case 'G': case '>': case CSI + 'F': case CSI + '4~': top = maxTop(); break;
        case '/': typing = ''; break;
        case 'n': if (search) find(1, top + 1); break;
        case 'N': if (search) find(-1, top - 1); break;
        case 'h': case 'H': msg = 'q quit  space/b page  j/k line  g/G top/end  /pattern search  n/N next'; break;
        default: if (/^\u001b\[<\d+;\d+;\d+[Mm]$/.test(k)) { var b = +k.slice(3).split(';')[0]; if (b === 64) top -= 3; else if (b === 65) top += 3; }
      }
      top = Math.max(0, Math.min(top, maxTop()));
      return true;
    };
    h.tick = function () {};
    var orig = h.key; h.key = function (k) { var r = orig(k); return quit ? false : r; };
    try { await loop(ctx, h); }
    finally { ctx.out(CSI + '?1049l'); ctx.setRaw(false); ctx.trap('SIGINT', false); }
    return 0;
  }
  T.pager = pager;
  function wantsPager(ctx) {
    var e = ctx.env || {};
    return ctx.isatty !== false && !e.PM_AGENT && e.GIT_PAGER !== 'cat' && e.PAGER !== 'cat';
  }

  /* ------------------------------------------------------------------ ls */
  var IMG_RE = /\.(png|jpe?g|gif|webp|bmp|svg|ico)$/i, ARC_RE = /\.(tar|tgz|gz|zip|xz|bz2|zst|7z)$/i;
  function lsColor(name, st, lst) {
    if (lst && lst.type === 'symlink') return st ? '01;36' : '40;31;01';
    if (!st) return null;
    if (st.type === 'dir') return (st.mode & 512) && (st.mode & 2) ? '30;42' : (st.mode & 2) ? '34;42' : '01;34';
    if (st.type === 'char') return '40;33;01';
    if (st.type === 'fifo') return '40;33';
    if (st.type === 'sock') return '01;35';
    if (st.mode & 73) return '01;32';
    if (IMG_RE.test(name)) return '01;35';
    if (ARC_RE.test(name)) return '01;31';
    return null;
  }
  function modeStr(st) {
    var t = { dir: 'd', symlink: 'l', char: 'c', fifo: 'p', sock: 's', file: '-', proc: '-' }[st.type] || '-';
    var m = st.mode, s = '', bits = 'rwxrwxrwx';
    for (var i = 0; i < 9; i++) s += (m & (256 >> i)) ? bits[i] : '-';
    if (m & 512) s = s.slice(0, 8) + (s[8] === 'x' ? 't' : 'T');
    return t + s;
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function lsTime(ms) {
    var d = new Date(ms), old = Math.abs(Date.now() - ms) > 182 * 86400000;
    return MON[d.getMonth()] + ' ' + lpad(String(d.getDate()), 2) + ' ' + (old ? ' ' + d.getFullYear() : two(d.getHours()) + ':' + two(d.getMinutes()));
  }
  P.ls = {
    summary: 'list directory contents',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['color', 'hyperlink', 'sort']), f = a.f, vfs = ctx.vfs;
      var long = f.l || f.n || f.g, all = f.a, almost = f.A, human_ = f.h, one = f['1'], dirOnly = f.d, rev = f.r;
      var colorMode = f.color === true ? 'always' : f.color || 'auto';
      var color = colorMode === 'always' || (colorMode === 'auto' && colorOn(ctx));
      var hyper = f.hyperlink === true || f.hyperlink === 'always' || (f.hyperlink === 'auto' && ctx.isatty !== false);
      var targets = a.pos.length ? a.pos : ['.'], rc = 0, files = [], dirs = [];
      targets.forEach(function (t) {
        var p = abs(ctx, t), st = vfs.stat(p), lst = vfs.lstat(p);
        if (!st && !(lst && lst.type === 'symlink' && long)) {
          var code = 'ENOENT'; try { vfs.statOrThrow(p); } catch (e) { code = e.code; }
          ctx.err("ls: cannot access '" + t + "': " + (ERR[code] || code) + '\n'); rc = 2; return;
        }
        if (st && st.type === 'dir' && !dirOnly && !(long && lst.type === 'symlink' && !/\/$/.test(t))) dirs.push({ name: t, path: p });
        else files.push({ name: t, path: p, st: st, lst: lst });
      });
      var host = hostOf(ctx);
      function entry(e) {
        var nm = e.name, code = color ? lsColor(nm, e.st, e.lst) : null, shown = code ? sgr('0') + sgr(code) + nm + R0 : nm;
        if (hyper) shown = link('file://' + host + encodeURI(e.path), shown);
        return shown;
      }
      function sortList(list) {
        if (f.t) list.sort(function (x, y) { return ((y.lst || y.st || {}).mtime || 0) - ((x.lst || x.st || {}).mtime || 0); });
        else if (f.S) list.sort(function (x, y) { return ((y.st || {}).size || 0) - ((x.st || {}).size || 0); });
        if (rev) list.reverse();
        return list;
      }
      function render(list, showTotal) {
        var out = '';
        if (long) {
          if (showTotal) { var blocks = 0; list.forEach(function (e) { var s = e.lst || e.st; if (s && s.type === 'file') blocks += Math.ceil(s.size / 4096) * 4; else if (s && s.type === 'dir') blocks += 4; }); out += 'total ' + blocks + '\n'; }
          var rowsL = list.map(function (e) {
            var s = e.lst || e.st;
            var size = s.type === 'char' ? s.rdev : human_ ? human(s.size) : String(s.size);
            var tail = e.lst && e.lst.type === 'symlink' ? ' -> ' + (color ? (e.st ? sgr(lsColor(e.lst.target, e.st, null) || '0') + e.lst.target + R0 : sgr('40;31;01') + e.lst.target + R0) : e.lst.target) : '';
            return [modeStr(s), String(s.nlink), f.n ? (s.user === 'root' ? '0' : '1000') : s.user, f.n ? (s.group === 'root' ? '0' : '1000') : s.group, size, lsTime(s.mtime), entry(e) + tail];
          });
          var wd = [0, 0, 0, 0, 0];
          rowsL.forEach(function (r) { for (var i = 1; i < 5; i++) wd[i] = Math.max(wd[i], r[i].length); });
          rowsL.forEach(function (r) {
            out += r[0] + ' ' + lpad(r[1], wd[1]) + ' ' + (f.g ? '' : pad(r[2], wd[2]) + ' ') + pad(r[3], wd[3]) + ' ' + lpad(r[4], wd[4]) + ' ' + r[5] + ' ' + r[6] + '\n';
          });
          return out;
        }
        if (one || ctx.isatty === false) { list.forEach(function (e) { out += entry(e) + '\n'; }); return out; }
        if (!list.length) return '';
        var W = ctx.size().cols, names = list.map(function (e) { return width(e.name); }), n = list.length, best = 1;
        for (var c = n; c >= 1; c--) {
          var rws = Math.ceil(n / c), tot = 0;
          for (var col = 0; col < c; col++) { var mx = 0; for (var rr = 0; rr < rws; rr++) { var ix = col * rws + rr; if (ix < n) mx = Math.max(mx, names[ix]); } tot += mx + (col < c - 1 ? 2 : 0); }
          if (tot <= W) { best = c; break; }
        }
        var R = Math.ceil(n / best), widths = [];
        for (var cc = 0; cc < best; cc++) { var m2 = 0; for (var r2 = 0; r2 < R; r2++) { var k = cc * R + r2; if (k < n) m2 = Math.max(m2, names[k]); } widths.push(m2 + 2); }
        for (var r3 = 0; r3 < R; r3++) {
          var line = '';
          for (var c3 = 0; c3 < best; c3++) { var j = c3 * R + r3; if (j >= n) continue; var last = c3 === best - 1 || (c3 + 1) * R + r3 >= n; line += entry(list[j]) + (last ? '' : ' '.repeat(widths[c3] - names[j])); }
          out += line + '\n';
        }
        return out;
      }
      var out = '';
      if (files.length) out += render(sortList(files), false);
      dirs.forEach(function (d, i) {
        var names;
        try { names = vfs.list(d.path); } catch (e) { ctx.err("ls: cannot open directory '" + d.name + "': " + errText(e) + '\n'); rc = 2; return; }
        if (!all) names = names.filter(function (n) { return n[0] !== '.'; });
        if (all && !almost) names = ['.', '..'].concat(names);
        else if (almost) names = names.filter(function (n) { return n !== '.' && n !== '..'; });
        var list = names.map(function (n) {
          var p = n === '.' ? d.path : n === '..' ? T.VFS.dirname(d.path) : (d.path === '/' ? '' : d.path) + '/' + n;
          return { name: n, path: p, st: vfs.stat(p), lst: vfs.lstat(p) };
        });
        if (files.length || dirs.length > 1) out += (out ? '\n' : '') + d.name + ':\n';
        out += render(sortList(list), true);
        void i;
      });
      ctx.out(out);
      return rc;
    }
  };

  P.cat = {
    summary: 'concatenate files and print on the standard output',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), r = inputs(ctx, 'cat', a.pos), n = 0;
      r.list.forEach(function (it) {
        var t = it.text;
        if (a.f.n) t = t.replace(/\n$/, '').split('\n').map(function (l) { return lpad(String(++n), 6) + '\t' + l; }).join('\n') + (it.text.slice(-1) === '\n' ? '\n' : '');
        if (a.f.A) t = t.replace(/\u001b/g, '^[').replace(/\u0007/g, '^G').replace(/\u0000/g, '^@').replace(/\t/g, '^I').replace(/\n/g, '$\n');
        ctx.out(t);
      });
      return r.rc;
    }
  };

  function headTail(isTail) {
    return {
      summary: isTail ? 'output the last part of files' : 'output the first part of files',
      run: async function (ctx) {
        var args = ctx.argv.slice(1).map(function (x) { return /^-\d+$/.test(x) ? '-n' + x.slice(1) : x; });
        var a = parse(args, ['n', 'c']), n = a.f.n !== undefined ? parseInt(a.f.n, 10) : 10, prog = isTail ? 'tail' : 'head';
        var r = inputs(ctx, prog, a.pos);
        r.list.forEach(function (it, i) {
          if (r.list.length > 1) ctx.out((i ? '\n' : '') + '==> ' + it.name + ' <==\n');
          if (a.f.c !== undefined) { var c = parseInt(a.f.c, 10); ctx.out(isTail ? it.text.slice(-c) : it.text.slice(0, c)); return; }
          var ls = it.text.replace(/\n$/, '').split('\n'); if (it.text === '') ls = [];
          var sel = isTail ? ls.slice(Math.max(0, ls.length - n)) : ls.slice(0, n);
          if (sel.length) ctx.out(sel.join('\n') + '\n');
        });
        if (isTail && a.f.f && r.list.length) { for (;;) await ctx.sleep(1000); }
        return r.rc;
      }
    };
  }
  P.head = headTail(false);
  P.tail = headTail(true);

  P.grep = {
    summary: 'print lines that match patterns',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['e', 'color', 'colour', 'm', 'A', 'B', 'C', 'include', 'exclude-dir']), f = a.f;
      var pat = f.e !== undefined ? f.e : a.pos.shift();
      if (pat === undefined) { ctx.err('Usage: grep [OPTION]... PATTERNS [FILE]...\nTry \'grep --help\' for more information.\n'); return 2; }
      var src = f.F ? pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : f.E || f.P ? pat : pat.replace(/\\\|/g, '|').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
      if (f.w) src = '\\b(?:' + src + ')\\b';
      if (f.x) src = '^(?:' + src + ')$';
      var re;
      try { re = new RegExp(src, f.i ? 'gi' : 'g'); } catch (e) { ctx.err('grep: Unmatched ( or \\(\n'); return 2; }
      var cm = f.color || f.colour || 'auto', color = cm === 'always' || (cm === 'auto' && colorOn(ctx));
      var recursive = f.r || f.R, files = a.pos.slice(), rc = 1, err = false;
      if (!files.length && recursive) files = ['.'];
      var items = [];
      if (!files.length) items.push({ name: '(standard input)', text: ctx.stdin || '' });
      files.forEach(function (fn) {
        var p = abs(ctx, fn), st = ctx.vfs.stat(p);
        if (!st) { ctx.err('grep: ' + fn + ': ' + ERR.ENOENT + '\n'); err = true; return; }
        if (st.type === 'dir') {
          if (!recursive) { ctx.err('grep: ' + fn + ': ' + ERR.EISDIR + '\n'); return; }
          ctx.vfs.walk(p, function (q, s) {
            var b = T.VFS.basename(q);
            if (s.type === 'dir') return q === p || ['.git', 'target', 'node_modules'].indexOf(b) < 0;
            if (s.type !== 'file' || s.asset) return true;
            if (f.include && !new RegExp('^' + f.include.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$').test(b)) return true;
            var shown = fn === '.' ? relTo(p, q) : (fn.replace(/\/$/, '') + '/' + relTo(p, q));
            try { items.push({ name: shown, text: ctx.vfs.readText(q) }); } catch (e) {}
            return true;
          });
        } else {
          if (st.asset) { re.lastIndex = 0; return; }
          try { items.push({ name: fn, text: ctx.vfs.readText(p) }); } catch (e) { ctx.err('grep: ' + fn + ': ' + errText(e) + '\n'); err = true; }
        }
      });
      var showName = f.H || ((files.length > 1 || recursive) && !f.h), out = '';
      items.forEach(function (it) {
        var ls = it.text.replace(/\n$/, '').split('\n'), count = 0;
        for (var i = 0; i < ls.length; i++) {
          re.lastIndex = 0;
          var hit = re.test(ls[i]); if (f.v) hit = !hit;
          if (!hit) continue;
          count++; rc = 0;
          if (f.l || f.c || f.q) continue;
          var name = showName ? (color ? sgr('35') + it.name + R0 + sgr('36') + ':' + R0 : it.name + ':') : '';
          var num = f.n ? (color ? sgr('32') + (i + 1) + R0 + sgr('36') + ':' + R0 : (i + 1) + ':') : '';
          var body = ls[i];
          if (f.o && !f.v) { re.lastIndex = 0; var mm; while ((mm = re.exec(ls[i]))) { out += name + num + (color ? sgr('01;31') + CSI + 'K' + mm[0] + sgr('') + CSI + 'K' : mm[0]) + '\n'; if (!mm[0].length) re.lastIndex++; } continue; }
          if (color && !f.v) { re.lastIndex = 0; body = body.replace(re, function (x) { return sgr('01;31') + CSI + 'K' + x + sgr('') + CSI + 'K'; }); }
          out += name + num + body + '\n';
          if (f.m && count >= +f.m) break;
        }
        if (f.l && count) out += (color ? sgr('35') + it.name + R0 : it.name) + '\n';
        if (f.c) out += (showName ? it.name + ':' : '') + count + '\n';
      });
      if (!f.q) ctx.out(out);
      return err && rc ? 2 : rc;
    },
    complete: function () { return ['-n', '-i', '-r', '-v', '-c', '-l', '-w', '-E', '-F', '--color=always']; }
  };

  P.tree = {
    summary: 'list contents of directories in a tree-like format',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['L', 'I']), f = a.f, vfs = ctx.vfs, color = colorOn(ctx) && !f.n;
      var maxDepth = f.L ? parseInt(f.L, 10) : Infinity, root = a.pos[0] || '.', base = abs(ctx, root);
      var st = vfs.stat(base);
      if (!st) { ctx.out(root + '  [error opening dir]\n\n0 directories, 0 files\n'); return 2; }
      var nd = 0, nf = 0, out = (color ? sgr('01;34') + root + R0 : root) + '\n';
      function rec(dir, prefix, depth) {
        if (depth > maxDepth) return;
        var names = vfs.list(dir).filter(function (n) { return (f.a || n[0] !== '.') && (!f.I || !new RegExp('^(' + f.I.replace(/\*/g, '.*') + ')$').test(n)); });
        if (!f.a) names = names.filter(function (n) { return n !== 'target' && n !== 'node_modules'; });
        if (f.d) names = names.filter(function (n) { var s = vfs.stat(dir + '/' + n); return s && s.type === 'dir'; });
        names.forEach(function (n, i) {
          var p = (dir === '/' ? '' : dir) + '/' + n, s = vfs.stat(p), l = vfs.lstat(p), last = i === names.length - 1;
          var code = color ? lsColor(n, s, l) : null, shown = code ? sgr(code) + n + R0 : n;
          if (l && l.type === 'symlink') shown += ' -> ' + l.target;
          out += prefix + (last ? CH.bl : CH.lt) + CH.h + CH.h + ' ' + shown + '\n';
          if (s && s.type === 'dir' && !(l && l.type === 'symlink')) { nd++; rec(p, prefix + (last ? '    ' : CH.v + '   '), depth + 1); }
          else nf++;
        });
      }
      if (st.type === 'dir') rec(base, '', 1);
      out += '\n' + nd + ' director' + (nd === 1 ? 'y' : 'ies') + (f.d ? '' : ', ' + nf + ' file' + (nf === 1 ? '' : 's')) + '\n';
      ctx.out(out);
      return 0;
    }
  };

  P.wc = {
    summary: 'print newline, word, and byte counts for each file',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), f = a.f, r = inputs(ctx, 'wc', a.pos), rows = [], tot = [0, 0, 0];
      var sel = f.l || f.w || f.c || f.m ? [!!f.l, !!f.w, !!(f.c || f.m)] : [true, true, true];
      r.list.forEach(function (it) {
        var c = [(it.text.match(/\n/g) || []).length, (it.text.match(/\S+/g) || []).length, utf8(it.text).length];
        tot[0] += c[0]; tot[1] += c[1]; tot[2] += c[2];
        rows.push({ c: c, name: it.name });
      });
      if (rows.length > 1) rows.push({ c: tot, name: 'total' });
      var w = a.pos.length ? Math.max(1, String(Math.max.apply(null, tot)).length) : 7;
      if (sel.filter(Boolean).length === 1 && a.pos.length <= 1) w = 1;
      ctx.out(rows.map(function (row) { return row.c.filter(function (_, i) { return sel[i]; }).map(function (v) { return lpad(String(v), w); }).join(' ') + (row.name ? ' ' + row.name : ''); }).join('\n') + '\n');
      return r.rc;
    }
  };

  P.du = {
    summary: 'estimate file space usage',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['d']), f = a.f, vfs = ctx.vfs, targets = a.pos.length ? a.pos : ['.'], rc = 0, out = '';
      var maxD = f.s ? 0 : f.d !== undefined ? parseInt(f.d, 10) : Infinity, grand = 0;
      var fmt = function (k) { return f.h ? human(k * 1024) : String(k); };
      targets.forEach(function (t) {
        var p = abs(ctx, t);
        if (!vfs.lstat(p)) { ctx.err("du: cannot access '" + t + "': " + ERR.ENOENT + '\n'); rc = 1; return; }
        function size(q, depth) {
          var s = vfs.lstat(q), k = s.type === 'file' ? Math.ceil(s.size / 4096) * 4 : s.type === 'dir' ? 4 : 0;
          if (s.type === 'dir') vfs.list(q).forEach(function (n) { k += size((q === '/' ? '' : q) + '/' + n, depth + 1); });
          var shown = q === p ? t : t.replace(/\/$/, '') + '/' + relTo(p, q);
          if ((s.type === 'dir' || f.a || q === p) && depth <= maxD) out += fmt(k) + '\t' + shown + '\n';
          return k;
        }
        grand += size(p, 0);
      });
      if (f.c) out += fmt(grand) + '\ttotal\n';
      ctx.out(out);
      return rc;
    }
  };

  function globRe(g, ci) { return new RegExp('^' + g.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\[!/g, '[^') + '$', ci ? 'i' : ''); }
  P.find = {
    summary: 'search for files in a directory hierarchy',
    run: async function (ctx) {
      var args = ctx.argv.slice(1), paths = [], i = 0, vfs = ctx.vfs;
      while (i < args.length && args[i][0] !== '-') paths.push(args[i++]);
      if (!paths.length) paths = ['.'];
      var name = null, type = null, maxd = Infinity, mind = 0;
      for (; i < args.length; i++) {
        var o = args[i];
        if (o === '-name' || o === '-iname') name = globRe(args[++i] || '', o === '-iname');
        else if (o === '-type') type = args[++i];
        else if (o === '-maxdepth') maxd = parseInt(args[++i], 10);
        else if (o === '-mindepth') mind = parseInt(args[++i], 10);
        else if (o === '-print') continue;
        else { ctx.err("find: unknown predicate `" + o + "'\n"); return 1; }
      }
      var rc = 0, out = '';
      paths.forEach(function (pth) {
        var p = abs(ctx, pth);
        if (!vfs.lstat(p)) { ctx.err("find: '" + pth + "': " + ERR.ENOENT + '\n'); rc = 1; return; }
        vfs.walk(p, function (q, s, depth) {
          if (depth > maxd) return false;
          var b = q === p ? T.VFS.basename(pth) || pth : T.VFS.basename(q);
          var t = { dir: 'd', file: 'f', symlink: 'l', char: 'c', fifo: 'p', sock: 's', proc: 'f' }[s.type];
          if (depth >= mind && (!name || name.test(b)) && (!type || type === t)) out += (q === p ? pth : pth.replace(/\/$/, '') + '/' + relTo(p, q)) + '\n';
          return s.type === 'dir';
        });
      });
      ctx.out(out);
      return rc;
    }
  };

  P.touch = {
    summary: 'change file timestamps (creates missing files)',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), rc = 0;
      if (!a.pos.length) { ctx.err('touch: missing file operand\n'); return 1; }
      a.pos.forEach(function (fn) { try { ctx.vfs.touch(abs(ctx, fn), wopts(ctx)); } catch (e) { ctx.err("touch: cannot touch '" + fn + "': " + errText(e) + '\n'); rc = 1; } });
      return rc;
    }
  };
  P.mkdir = {
    summary: 'make directories',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), rc = 0;
      if (!a.pos.length) { ctx.err('mkdir: missing operand\n'); return 1; }
      a.pos.forEach(function (d) {
        try { ctx.vfs.mkdir(abs(ctx, d), { parents: !!a.f.p, root: wopts(ctx).root }); if (a.f.v) ctx.out("mkdir: created directory '" + d + "'\n"); }
        catch (e) { ctx.err("mkdir: cannot create directory '" + d + "': " + errText(e) + '\n'); rc = 1; }
      });
      return rc;
    }
  };
  P.rm = {
    summary: 'remove files or directories',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), f = a.f, rc = 0, vfs = ctx.vfs;
      if (!a.pos.length) { if (!f.f) { ctx.err('rm: missing operand\n'); return 1; } return 0; }
      var rec = f.r || f.R || f.recursive;
      for (var i = 0; i < a.pos.length; i++) {
        var fn = a.pos[i], p = abs(ctx, fn), l = vfs.lstat(p);
        if (p === '/' && rec) { ctx.err("rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe\n"); rc = 1; continue; }
        if (!l) { if (!f.f) { ctx.err("rm: cannot remove '" + fn + "': " + ERR.ENOENT + '\n'); rc = 1; } continue; }
        if (l.type === 'dir' && !rec) { if (f.d) { try { vfs.rmdir(p, wopts(ctx)); } catch (e) { ctx.err("rm: cannot remove '" + fn + "': " + errText(e) + '\n'); rc = 1; } continue; } ctx.err("rm: cannot remove '" + fn + "': " + ERR.EISDIR + '\n'); rc = 1; continue; }
        try { if (l.type === 'dir') vfs.remove(p, wopts(ctx)); else vfs.unlink(p, wopts(ctx)); if (f.v) ctx.out("removed '" + fn + "'\n"); }
        catch (e) { ctx.err("rm: cannot remove '" + fn + "': " + errText(e) + '\n'); rc = 1; }
      }
      return rc;
    }
  };
  function cpmv(isMove) {
    var name = isMove ? 'mv' : 'cp';
    return {
      summary: isMove ? 'move (rename) files' : 'copy files and directories',
      run: async function (ctx) {
        var a = parse(ctx.argv.slice(1)), f = a.f, vfs = ctx.vfs, rc = 0;
        if (a.pos.length < 2) { ctx.err(name + ': missing ' + (a.pos.length ? "destination file operand after '" + a.pos[0] + "'" : 'file operand') + '\n'); return 1; }
        var dest = a.pos[a.pos.length - 1], srcs = a.pos.slice(0, -1), dp = abs(ctx, dest), dst = vfs.stat(dp);
        if (srcs.length > 1 && !(dst && dst.type === 'dir')) { ctx.err(name + ": target '" + dest + "': " + ERR.ENOTDIR + '\n'); return 1; }
        srcs.forEach(function (s) {
          var sp = abs(ctx, s), st = vfs.stat(sp);
          if (!st && !vfs.lstat(sp)) { ctx.err(name + ": cannot stat '" + s + "': " + ERR.ENOENT + '\n'); rc = 1; return; }
          if (!isMove && st && st.type === 'dir' && !(f.r || f.R || f.a)) { ctx.err("cp: -r not specified; omitting directory '" + s + "'\n"); rc = 1; return; }
          try {
            if (isMove) vfs.rename(sp, dp, wopts(ctx)); else vfs.copy(sp, dp, { recursive: true, root: wopts(ctx).root });
            if (f.v) ctx.out((isMove ? 'renamed ' : '') + "'" + s + "' -> '" + dest + "'\n");
          } catch (e) { ctx.err(name + ": cannot " + (isMove ? 'move' : 'create regular file') + " '" + (isMove ? s : dest) + "': " + errText(e) + '\n'); rc = 1; }
        });
        return rc;
      }
    };
  }
  P.cp = cpmv(false);
  P.mv = cpmv(true);

  function tzName(d, utc) {
    if (utc) return 'UTC';
    try { var p = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(d).filter(function (x) { return x.type === 'timeZoneName'; })[0]; return p ? p.value : 'UTC'; } catch (e) { return 'UTC'; }
  }
  function strftime(fmt, d, utc) {
    var g = function (k) { return utc ? d['getUTC' + k]() : d['get' + k](); };
    var off = utc ? 0 : -d.getTimezoneOffset(), oz = (off >= 0 ? '+' : '-') + two(Math.floor(Math.abs(off) / 60)) + two(Math.abs(off) % 60);
    return fmt.replace(/%([a-zA-Z%])/g, function (_, c) {
      switch (c) {
        case 'a': return DAY[g('Day')]; case 'A': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][g('Day')];
        case 'b': case 'h': return MON[g('Month')]; case 'B': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][g('Month')];
        case 'd': return two(g('Date')); case 'e': return lpad(String(g('Date')), 2); case 'H': return two(g('Hours'));
        case 'I': return two(g('Hours') % 12 || 12); case 'p': return g('Hours') < 12 ? 'AM' : 'PM';
        case 'M': return two(g('Minutes')); case 'S': return two(g('Seconds')); case 'Y': return String(g('FullYear'));
        case 'y': return two(g('FullYear') % 100); case 'm': return two(g('Month') + 1); case 's': return String(Math.floor(d.getTime() / 1000));
        case 'F': return g('FullYear') + '-' + two(g('Month') + 1) + '-' + two(g('Date'));
        case 'T': return two(g('Hours')) + ':' + two(g('Minutes')) + ':' + two(g('Seconds'));
        case 'Z': return tzName(d, utc); case 'z': return oz; case 'n': return '\n'; case 't': return '\t'; case '%': return '%';
        case 'N': return String(d.getMilliseconds() * 1000000).padStart(9, '0');
      }
      return '%' + c;
    });
  }
  P.date = {
    summary: 'print the system date and time',
    run: async function (ctx) {
      var args = ctx.argv.slice(1), utc = false, fmt = '%a %b %e %H:%M:%S %Z %Y';
      for (var i = 0; i < args.length; i++) {
        var x = args[i];
        if (x === '-u' || x === '--utc') utc = true;
        else if (x === '-I' || x === '--iso-8601') fmt = '%F';
        else if (x === '-R' || x === '--rfc-email') fmt = '%a, %d %b %Y %H:%M:%S %z';
        else if (x[0] === '+') fmt = x.slice(1);
        else { ctx.err("date: invalid date '" + x + "'\n"); return 1; }
      }
      ctx.out(strftime(fmt, new Date(), utc) + '\n');
      return 0;
    }
  };
  P.uname = {
    summary: 'print system information',
    run: async function (ctx) {
      var f = parse(ctx.argv.slice(1)).f, remote = ctx.vfs && ctx.vfs.host !== 'nas1';
      var rel = remote ? '5.15.0-122-generic' : '6.8.0-45-generic', ver = remote ? '#132-Ubuntu SMP Thu Aug 29 13:45:52 UTC 2024' : '#45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 30 12:02:04 UTC 2024';
      var parts = [];
      if (f.a || f.s || !Object.keys(f).length) parts.push('Linux');
      if (f.a || f.n) parts.push(hostOf(ctx));
      if (f.a || f.r) parts.push(rel);
      if (f.a || f.v) parts.push(ver);
      if (f.a || f.m) parts.push('x86_64');
      if (f.a) parts.push('x86_64', 'x86_64');
      if (f.a || f.o) parts.push('GNU/Linux');
      ctx.out(parts.join(' ') + '\n');
      return 0;
    }
  };
  P.whoami = { summary: 'print effective user name', run: async function (ctx) { ctx.out(userOf(ctx) + '\n'); return 0; } };
  P.hostname = { summary: 'show the system host name', run: async function (ctx) { ctx.out(hostOf(ctx) + '\n'); return 0; } };
  P.id = {
    summary: 'print user and group ids',
    run: async function (ctx) {
      ctx.out(userOf(ctx) === 'root' ? 'uid=0(root) gid=0(root) groups=0(root)\n' : 'uid=1000(' + userOf(ctx) + ') gid=1000(' + userOf(ctx) + ') groups=1000(' + userOf(ctx) + '),4(adm),27(sudo),998(docker)\n');
      return 0;
    }
  };
  P.seq = {
    summary: 'print a sequence of numbers',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1).map(function (x) { return /^-\d/.test(x) ? '\u0000' + x : x; }), ['s']);
      var nums = a.pos.map(function (x) { return parseFloat(x.replace('\u0000', '')); });
      if (!nums.length || nums.some(isNaN)) { ctx.err('seq: missing operand\n'); return 1; }
      var first = nums.length > 1 ? nums[0] : 1, step = nums.length > 2 ? nums[1] : 1, last = nums[nums.length - 1];
      if (step === 0) { ctx.err("seq: invalid Zero increment value: '0'\n"); return 1; }
      var sep = a.f.s !== undefined ? a.f.s.replace(/\\n/g, '\n').replace(/\\t/g, '\t') : '\n', wid = a.f.w ? String(Math.floor(Math.max(Math.abs(first), Math.abs(last)))).length : 0;
      var buf = [], count = 0;
      for (var v = first; step > 0 ? v <= last + 1e-9 : v >= last - 1e-9; v += step) {
        var s = Number.isInteger(step) && Number.isInteger(first) ? String(Math.round(v)) : String(+v.toFixed(6));
        buf.push(wid ? s.padStart(wid, '0') : s);
        if (++count % 2000 === 0) { ctx.out(buf.join(sep) + sep); buf = []; await ctx.sleep(0); }
      }
      if (buf.length) ctx.out(buf.join(sep) + '\n'); else if (count) ctx.out(sep === '\n' ? '' : '\n');
      return 0;
    }
  };
  P.yes = {
    summary: 'output a string repeatedly until killed (Ctrl+C stops it)',
    run: async function (ctx) {
      var word = ctx.argv.length > 1 ? ctx.argv.slice(1).join(' ') : 'y', block = (word + '\n').repeat(64);
      if (ctx.isatty === false) { ctx.out((word + '\n').repeat(1000)); return 0; }
      for (;;) { ctx.out(block); await ctx.sleep(16); }
    }
  };

  function imageInfo(b) {
    if (!b || b.length < 24) return null;
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { fmt: 'png', w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0 };
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return { fmt: 'gif', w: b[6] | b[7] << 8, h: b[8] | b[9] << 8 };
    if (b[0] === 0xff && b[1] === 0xd8) {
      for (var i = 2; i + 9 < b.length;) {
        if (b[i] !== 0xff) { i++; continue; }
        var m = b[i + 1], len = b[i + 2] << 8 | b[i + 3];
        if (m >= 0xc0 && m <= 0xc3) return { fmt: 'jpeg', w: b[i + 7] << 8 | b[i + 8], h: b[i + 5] << 8 | b[i + 6] };
        i += 2 + len;
      }
      return { fmt: 'jpeg', w: 0, h: 0 };
    }
    return null;
  }
  P.file = {
    summary: 'determine file type',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), vfs = ctx.vfs, rc = 0;
      if (!a.pos.length) { ctx.err('Usage: file [-bchikLlNnprsSvzZ0] [--apple] [--extension] [--mime-encoding] [--mime-type] [-e <testname>] [-F <separator>] [-f <namefile>] [-m <magicfiles>] [-P <parameter=value>] [--exclude-quiet] <file> ...\n'); return 1; }
      for (var i = 0; i < a.pos.length; i++) {
        var fn = a.pos[i], p = abs(ctx, fn), l = vfs.lstat(p), d;
        if (!l) d = "cannot open `" + fn + "' (" + ERR.ENOENT + ')';
        else if (l.type === 'symlink') { var ok = vfs.stat(p); d = (ok ? 'symbolic link to ' : 'broken symbolic link to ') + l.target; }
        else if (l.type === 'dir') d = (l.mode & 512) ? 'sticky, directory' : 'directory';
        else if (l.type === 'char') d = 'character special (' + l.rdev.replace(', ', '/') + ')';
        else if (l.type === 'sock') d = 'socket';
        else if (l.type === 'fifo') d = 'fifo (named pipe)';
        else if (l.size === 0) d = 'empty';
        else if (l.asset) {
          var s = l.asset;
          d = s.fmt === 'png' ? 'PNG image data, ' + s.w + ' x ' + s.h + ', 8-bit/color RGBA, non-interlaced' : s.fmt === 'gif' ? 'GIF image data, version 89a, ' + s.w + ' x ' + s.h : 'JPEG image data, JFIF standard 1.01, aspect ratio, density 1x1, segment length 16, baseline, precision 8, ' + s.w + 'x' + s.h + ', components 3';
        } else {
          var txt = ''; try { txt = vfs.readText(p); } catch (e) { txt = ''; }
          var ascii = /^[\x09\x0a\x0d\x20-\x7e]*$/.test(txt) ? 'ASCII text' : /\u001b/.test(txt) ? 'ASCII text, with escape sequences' : 'Unicode text, UTF-8 text';
          d = /^#!.*bash/.test(txt) ? 'Bourne-Again shell script, ' + ascii + ' executable' : /\.rs$/.test(fn) ? 'Rust source, ' + ascii : /\.json$/.test(fn) ? 'JSON text data' : /\.toml$/.test(fn) ? ascii : /\.sql$/.test(fn) ? ascii : ascii;
        }
        if (!l) rc = 0;
        ctx.out(fn + ': ' + d + '\n');
      }
      return rc;
    }
  };

  P.less = {
    summary: 'a pager on the alternate screen (q quits, / searches)',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['x']), fn = a.pos[0], text;
      if (fn) { try { text = ctx.vfs.readText(abs(ctx, fn)); } catch (e) { ctx.err(fn + ': ' + errText(e) + '\n'); return 1; } }
      else if (ctx.stdin !== null && ctx.stdin !== undefined) text = ctx.stdin;
      else { ctx.err('Missing filename ("less --help" for help)\n'); return 1; }
      if (!a.f.R && !a.f.r) text = text.replace(/\u001b/g, sgr('7') + 'ESC' + sgr('27'));
      return pager(ctx, text, { name: fn || '', quitIfOneScreen: !!a.f.F });
    }
  };
  P.more = P.less;

  /* man pages: bold for names and sections, underline for arguments, as man renders them through less */
  var MAN = {
    ls: ['ls - list directory contents', 'ls [OPTION]... [FILE]...', 'List information about the FILEs (the current directory by default).',
      [['-a, --all', 'do not ignore entries starting with .'], ['-l', 'use a long listing format'], ['-h, --human-readable', 'with -l, print sizes like 1K 234M 2G'],
        ['--color[=WHEN]', 'color the output WHEN; more info below'], ['--hyperlink[=WHEN]', 'hyperlink file names WHEN'], ['-t', 'sort by time, newest first'], ['-1', 'list one file per line']]],
    grep: ['grep - print lines that match patterns', 'grep [OPTION...] PATTERNS [FILE...]', 'grep searches for PATTERNS in each FILE.',
      [['-i', 'ignore case distinctions in patterns and data'], ['-n', 'prefix each line of output with its line number'], ['-r', 'read all files under each directory, recursively'], ['-v', 'select non-matching lines'], ['--color[=WHEN]', 'surround the matched strings with escape sequences']]],
    less: ['less - opposite of more', 'less [options] [file]', 'Less is a program similar to more, but it allows backward movement in the file as well as forward movement.',
      [['q', 'exit'], ['SPACE, b', 'forward and backward one window'], ['j, k', 'forward and backward one line'], ['/pattern', 'search forward for a matching line'], ['g, G', 'go to the first or last line']]],
    htop: ['htop - interactive process viewer', 'htop [-dChustv]', 'htop is a cross-platform ncurses-based process viewer.',
      [['F5, t', 'tree view'], ['F6, P, M', 'sort by a column, by CPU, by memory'], ['Up, Down', 'select a process'], ['q, F10', 'quit']]],
    kitten: ['kitten-icat - display images in the terminal', 'kitten icat [options] image_file...', 'A cat like utility to display images in the terminal using the kitty graphics protocol.',
      [['--transfer-mode', 'detect, file, stream, memory or temp: how the image data reaches the terminal'], ['--place WxH@LxT', 'display the image in the given rectangle of cells'],
        ['--z-index N', 'z-index of the image; negative values place it under the text'], ['--unicode-placeholder', 'use Unicode placeholder characters for the image'], ['--clear', 'remove all images currently displayed on the screen'],
        ['--align', 'center, left or right']]],
    ssh: ['ssh - OpenSSH remote login client', 'ssh [-p port] [-l login_name] destination [command]', 'ssh is a program for logging into a remote machine and for executing commands on a remote machine.',
      [['-p port', 'port to connect to on the remote host'], ['-l login_name', 'the user to log in as on the remote machine']]],
    sudo: ['sudo - execute a command as another user', 'sudo [-k] command', 'sudo allows a permitted user to execute a command as the superuser. The password prompt is always answered by the person at the keyboard.',
      [['-k', 'invalidate the cached credentials'], ['-v', 'update the cached credentials']]],
    git: ['git - the stupid content tracker', 'git [--version] <command> [<args>]', 'Git is a fast, scalable, distributed revision control system.',
      [['status', 'show the working tree status'], ['log', 'show commit logs'], ['diff', 'show changes between commits and the working tree'], ['branch, switch', 'list, create or switch branches'], ['add, commit', 'record changes to the repository']]],
    cargo: ['cargo - the Rust package manager', 'cargo [OPTIONS] COMMAND', 'This program is a package manager and build tool for the Rust language.',
      [['build', 'compile the current package'], ['test', 'run the tests'], ['bench', 'run the benchmarks'], ['run', 'run a binary of the local package'], ['clean', 'remove the target directory']]],
    chafa: ['chafa - character art facsimile generator', 'chafa [OPTION...] [FILE...]', 'Chafa displays images in the terminal as symbols, sixels, kitty graphics or iTerm2 images.',
      [['-f, --format', 'kitty, sixels, iterm or symbols'], ['-s, --size WxH', 'the size of the output in character cells']]]
  };
  P.man = {
    summary: 'an interface to the system reference manuals',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1)), name = a.pos.filter(function (x) { return !/^\d$/.test(x); })[0];
      if (!name) { ctx.err('What manual page do you want?\nFor example, try \'man man\'.\n'); return 1; }
      var page = MAN[name] || (P[name] ? [name + ' - ' + P[name].summary, name + ' [OPTION]...', P[name].summary.charAt(0).toUpperCase() + P[name].summary.slice(1) + '.', []] : null);
      if (!page) { ctx.err('No manual entry for ' + name + '\n'); return 16; }
      var cols = Math.min(ctx.size().cols, 100), title = name.toUpperCase() + '(1)', mid = 'User Commands';
      var gap = Math.max(1, Math.floor((cols - title.length * 2 - mid.length) / 2));
      var B = function (s) { return sgr('1') + s + sgr('22'); }, I = function (s) { return sgr('4') + s + sgr('24'); };
      var body = [title + ' '.repeat(gap) + mid + ' '.repeat(Math.max(1, cols - title.length * 2 - mid.length - gap)) + title, '',
        B('NAME'), '       ' + page[0], '', B('SYNOPSIS'), '       ' + page[1].replace(/^(\S+)/, B('$1')).replace(/\[([A-Z_.]+)\]/g, function (_, x) { return '[' + I(x) + ']'; }), '',
        B('DESCRIPTION'), '       ' + page[2], ''];
      page[3].forEach(function (o) { body.push('       ' + B(o[0])); body.push('              ' + o[1]); body.push(''); });
      body.push(B('SEE ALSO'), '       ' + Object.keys(MAN).filter(function (k) { return k !== name; }).slice(0, 4).map(function (k) { return B(k) + '(1)'; }).join(', '), '');
      body.push('GNU coreutils 9.4' + ' '.repeat(Math.max(1, cols - 17 - 12 - title.length)) + 'October 2026' + ' '.repeat(2) + title);
      return pager(ctx, body.join('\n') + '\n', { name: 'Manual page ' + name + '(1) line 1 (press h for help or q to quit)' });
    },
    complete: function () { return Object.keys(MAN); }
  };

  /* ------------------------------------------------------------------ git */
  function short(h) { return h ? h.slice(0, 7) : ''; }
  function relDate(ms) {
    var s = Math.max(1, Math.round((Date.now() - ms) / 1000));
    if (s < 60) return s + ' seconds ago'; var m = Math.round(s / 60); if (m < 60) return m + ' minute' + (m === 1 ? '' : 's') + ' ago';
    var h = Math.round(m / 60); if (h < 24) return h + ' hour' + (h === 1 ? '' : 's') + ' ago';
    var d = Math.round(h / 24); return d + ' day' + (d === 1 ? '' : 's') + ' ago';
  }
  function gitDate(ms) { var d = new Date(ms); return strftime('%a %b %e %H:%M:%S %Y %z', d, false); }
  function decorations(repo, hash, color) {
    var refs = [];
    var C = function (code, s) { return color ? sgr(code) + s + sgr('33') : s; };
    Object.keys(repo.branches).forEach(function (b) {
      if (repo.branches[b] !== hash) return;
      if (b === repo.branch) refs.unshift(C('1;36', 'HEAD -> ') + C('1;32', b)); else refs.push(C('1;32', b));
    });
    Object.keys(repo.remoteBranches || {}).forEach(function (b) { if (repo.remoteBranches[b] === hash) refs.push(C('1;31', b)); });
    Object.keys(repo.tags || {}).forEach(function (t) { if (repo.tags[t] === hash) refs.push(C('1;33', 'tag: ' + t)); });
    if (!refs.length) return '';
    return (color ? sgr('33') : '') + ' (' + refs.join((color ? sgr('33') : '') + ', ') + (color ? sgr('33') : '') + ')' + (color ? R0 : '');
  }
  function colorGraph(g, color) {
    if (!color) return g;
    var cols = ['31', '32', '33', '34', '35', '36'];
    return g.replace(/[|\\/]/g, function (ch, i) { return sgr(cols[Math.floor(i / 2) % cols.length]) + ch + R0; });
  }
  function fileDiff(rel, a, b, color, o) {
    o = o || {};
    var B = function (s) { return color ? sgr('1') + s + R0 : s; };
    var out = B('diff --git a/' + rel + ' b/' + rel) + '\n';
    var ha = T.VFS.hex40('blob' + (a || '')).slice(0, 7), hb = T.VFS.hex40('blob' + (b || '')).slice(0, 7);
    if (a === null) out += B('new file mode 100644') + '\n' + B('index 0000000..' + hb) + '\n' + B('--- /dev/null') + '\n' + B('+++ b/' + rel) + '\n';
    else if (b === null) out += B('deleted file mode 100644') + '\n' + B('index ' + ha + '..0000000') + '\n' + B('--- a/' + rel) + '\n' + B('+++ /dev/null') + '\n';
    else out += B('index ' + ha + '..' + hb + ' 100644') + '\n' + B('--- a/' + rel) + '\n' + B('+++ b/' + rel) + '\n';
    var hs = o.hunks || T.VFS.hunks(a || '', b || '', 3);
    hs.forEach(function (h) {
      var head = '@@ -' + h.aStart + (h.aLen !== 1 ? ',' + h.aLen : '') + ' +' + h.bStart + (h.bLen !== 1 ? ',' + h.bLen : '') + ' @@';
      out += (color ? sgr('36') + head + R0 : head) + (h.fn ? ' ' + h.fn : '') + '\n';
      h.lines.forEach(function (l) {
        var line = l.t + l.s;
        out += (color && l.t === '-' ? sgr('31') + line + R0 : color && l.t === '+' ? sgr('32') + line + R0 : line) + '\n';
      });
    });
    return out;
  }
  function statLine(rel, ins, del, width_) {
    var tot = ins + del;
    return ' ' + pad(rel, width_) + ' | ' + lpad(String(tot), 3) + ' ' + sgr('32') + '+'.repeat(Math.min(ins, 40)) + R0 + sgr('31') + '-'.repeat(Math.min(del, 40)) + R0;
  }
  function headCommit(repo) {
    var h = repo.branches[repo.branch];
    for (var i = 0; i < repo.commits.length; i++) if (repo.commits[i].hash === h) return repo.commits[i];
    return repo.commits.filter(function (c) { return !c.edge; })[0];
  }
  function findCommit(repo, rev) {
    rev = rev || 'HEAD';
    var list = repo.commits.filter(function (c) { return !c.edge; });
    var m = /^(HEAD|@)(?:~(\d+)|\^)?$/.exec(rev);
    if (m) { var head = headCommit(repo), i = list.indexOf(head) + (m[2] ? +m[2] : rev.slice(-1) === '^' ? 1 : 0); return list[i] || null; }
    if (repo.branches[rev]) rev = repo.branches[rev];
    else if (repo.tags[rev]) rev = repo.tags[rev];
    else if (repo.remoteBranches && repo.remoteBranches[rev]) rev = repo.remoteBranches[rev];
    return list.filter(function (c) { return c.hash.indexOf(rev) === 0; })[0] || null;
  }
  var GIT_SUB = ['status', 'log', 'diff', 'show', 'branch', 'switch', 'checkout', 'add', 'commit', 'restore', 'rev-parse', 'remote', 'push', 'pull', 'fetch', 'stash', 'blame'];
  P.git = {
    summary: 'the stupid content tracker',
    complete: function (args) {
      if (args.length <= 1) return GIT_SUB;
      if (args[0] === 'switch' || args[0] === 'checkout' || args[0] === 'branch') return ['main', 'search-ranking', '-c'];
      if (args[0] === 'log') return ['--oneline', '--graph', '--decorate', '--all', '-n'];
      if (args[0] === 'diff') return ['--stat', '--cached', '--staged'];
      return [];
    },
    run: async function (ctx) {
      var argv = ctx.argv.slice(1), sub = argv[0], vfs = ctx.vfs, color = colorOn(ctx);
      if (!sub || sub === '--help' || sub === 'help') {
        ctx.out('usage: git [-v | --version] [-h | --help] <command> [<args>]\n\nThese are common Git commands used in various situations:\n\n' +
          '   status    Show the working tree status\n   log       Show commit logs\n   diff      Show changes between commits, commit and working tree, etc\n' +
          '   branch    List, create, or delete branches\n   switch    Switch branches\n   add       Add file contents to the index\n   commit    Record changes to the repository\n');
        return sub ? 0 : 1;
      }
      if (sub === '--version' || sub === '-v' || sub === 'version') { ctx.out('git version 2.43.0\n'); return 0; }
      if (GIT_SUB.indexOf(sub) < 0) { ctx.err("git: '" + sub + "' is not a git command. See 'git --help'.\n"); return 1; }
      var repo = vfs.repoFor ? vfs.repoFor(ctx.cwd) : null;
      if (!repo) { ctx.err('fatal: not a git repository (or any of the parent directories): .git\n'); return 128; }
      var a = parse(argv.slice(1), ['n', 'm', 'c', 'b', 'format', 'pretty']), f = a.f;
      var cwdRel = relTo(repo.root, ctx.cwd), prefix = cwdRel === '.' ? '' : cwdRel + '/';
      var showPath = function (rel) { if (!prefix) return rel; if (rel.indexOf(prefix) === 0) return rel.slice(prefix.length); var ups = cwdRel.split('/').length; return '../'.repeat(ups) + rel; };
      var toRel = function (p) { return relTo(repo.root, abs(ctx, p)); };
      var current = function (rel) { try { return vfs.readText(repo.root + '/' + rel); } catch (e) { return null; } };
      var baseText = function (rel) { return rel in repo.staged ? (typeof repo.staged[rel] === 'string' && !/^(asset|bytes):/.test(repo.staged[rel]) ? repo.staged[rel] : repo.staged[rel]) : vfs.gitHeadText(repo, rel); };
      var page = async function (text) { if (wantsPager(ctx)) return pager(ctx, text, { quitIfOneScreen: true }); ctx.out(text); return 0; };
      var head = headCommit(repo);

      if (sub === 'status') {
        var rows = vfs.gitStatus(repo);
        if (f.s || f.short || f.porcelain) {
          var o = f.b ? '## ' + (color ? sgr('32') + repo.branch + R0 : repo.branch) + '...' + (color ? sgr('31') + repo.upstream + R0 : repo.upstream) + '\n' : '';
          rows.forEach(function (r) {
            if (r.index === '?') o += (color ? sgr('31') + '??' + R0 : '??') + ' ' + showPath(r.path) + '\n';
            else o += (color && r.index !== ' ' ? sgr('32') + r.index + R0 : r.index) + (color && r.work !== ' ' ? sgr('31') + r.work + R0 : r.work) + ' ' + showPath(r.path) + '\n';
          });
          ctx.out(o); return 0;
        }
        var staged = rows.filter(function (r) { return r.index !== ' ' && r.index !== '?'; });
        var unstaged = rows.filter(function (r) { return r.work === 'M' || r.work === 'D'; });
        var untracked = rows.filter(function (r) { return r.index === '?'; });
        var out = 'On branch ' + repo.branch + '\n';
        if (repo.branch === 'main') {
          var ahead = 0, list = repo.commits.filter(function (c) { return !c.edge; });
          for (var i = 0; i < list.length && list[i].hash !== repo.remoteBranches['origin/main']; i++) ahead++;
          out += ahead ? "Your branch is ahead of 'origin/main' by " + ahead + ' commit' + (ahead === 1 ? '' : 's') + '.\n  (use "git push" to publish your local commits)\n' : "Your branch is up to date with 'origin/main'.\n";
        }
        var kind = { M: 'modified:   ', A: 'new file:   ', D: 'deleted:    ' };
        if (staged.length) {
          out += '\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n';
          staged.forEach(function (r) { out += '\t' + (color ? sgr('32') : '') + kind[r.index] + showPath(r.path) + (color ? R0 : '') + '\n'; });
        }
        if (unstaged.length) {
          out += '\nChanges not staged for commit:\n  (use "git add' + (unstaged.some(function (r) { return r.work === 'D'; }) ? '/rm' : '') + ' <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n';
          unstaged.forEach(function (r) { out += '\t' + (color ? sgr('31') : '') + kind[r.work] + showPath(r.path) + (color ? R0 : '') + '\n'; });
        }
        if (untracked.length) {
          out += '\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
          untracked.forEach(function (r) { out += '\t' + (color ? sgr('31') : '') + showPath(r.path) + (color ? R0 : '') + '\n'; });
        }
        if (!rows.length) out += '\nnothing to commit, working tree clean\n';
        else if (!staged.length) out += '\nno changes added to commit (use "git add" and/or "git commit -a")\n';
        ctx.out(out); return 0;
      }

      if (sub === 'log') {
        var n = f.n !== undefined ? parseInt(f.n, 10) : Infinity;
        a.pos.forEach(function (p) { if (/^-\d+$/.test(p)) n = parseInt(p.slice(1), 10); });
        argv.forEach(function (p) { if (/^-\d+$/.test(p)) n = parseInt(p.slice(1), 10); });
        var oneline = f.oneline || f.pretty === 'oneline' || f.format === 'oneline', graph = f.graph, decorate = f.decorate !== 'no';
        var out2 = '', shown = 0;
        for (var k = 0; k < repo.commits.length && shown < n; k++) {
          var c = repo.commits[k];
          if (c.edge) { if (graph && shown) out2 += colorGraph(c.graph, color).replace(/\s+$/, '') + '\n'; continue; }
          var g = graph ? colorGraph(c.graph, color) : '';
          var dec = decorate ? decorations(repo, c.hash, color) : '';
          if (oneline) out2 += g + (color ? sgr('33') + short(c.hash) + R0 : short(c.hash)) + dec + ' ' + c.subject + '\n';
          else {
            var bar = graph ? colorGraph(c.graph.replace('*', '|').replace(/\s+$/, ''), color) + ' ' : '';
            out2 += g + (color ? sgr('33') + 'commit ' + c.hash + R0 : 'commit ' + c.hash) + dec + '\n';
            if (c.merge) {
              var rest = repo.commits.slice(k + 1).filter(function (x) { return !x.edge; });
              var p1 = rest.filter(function (x) { return x.graph.charAt(0) === '*'; })[0], p2 = rest.filter(function (x) { return x.graph.indexOf('| *') === 0; })[0];
              out2 += bar + 'Merge: ' + short(p1 && p1.hash) + ' ' + short(p2 && p2.hash) + '\n';
            }
            out2 += bar + 'Author: ' + c.author + '\n' + bar + 'Date:   ' + gitDate(c.when) + '\n' + bar + '\n' + bar + '    ' + c.subject + '\n';
            if (c.body) c.body.split('\n').forEach(function (l) { out2 += bar + '    ' + l + '\n'; });
            out2 += bar + '\n';
          }
          shown++;
        }
        return page(out2);
      }

      if (sub === 'diff') {
        var cached = f.cached || f.staged, paths = a.pos.map(toRel), out3 = '', stats = [];
        var rowsD = vfs.gitStatus(repo).filter(function (r) { return !paths.length || paths.some(function (p) { return r.path === p || r.path.indexOf(p + '/') === 0; }); });
        rowsD.forEach(function (r) {
          var A, Bv;
          if (cached) { if (r.index === ' ' || r.index === '?') return; A = r.index === 'A' ? null : vfs.gitHeadText(repo, r.path); Bv = r.index === 'D' ? null : (typeof repo.staged[r.path] === 'string' && !/^(asset|bytes):/.test(repo.staged[r.path]) ? repo.staged[r.path] : current(r.path)); }
          else { if (r.work !== 'M' && r.work !== 'D') return; A = baseText(r.path); Bv = r.work === 'D' ? null : current(r.path); }
          if (A !== null && typeof A !== 'string') { out3 += 'Binary files a/' + r.path + ' and b/' + r.path + ' differ\n'; return; }
          var d = T.VFS.diffLines(A || '', Bv || ''), ins = 0, del = 0;
          d.forEach(function (l) { if (l.t === '+') ins++; else if (l.t === '-') del++; });
          stats.push([r.path, ins, del]);
          out3 += fileDiff(r.path, A, Bv, color);
        });
        if (f.stat) {
          var wmax = Math.max.apply(null, stats.map(function (s) { return s[0].length; }).concat([1]));
          out3 = stats.map(function (s) { return statLine(s[0], s[1], s[2], wmax); }).join('\n') + (stats.length ? '\n' : '');
          var ti = stats.reduce(function (x, s) { return x + s[1]; }, 0), td = stats.reduce(function (x, s) { return x + s[2]; }, 0);
          if (stats.length) out3 += ' ' + stats.length + ' file' + (stats.length === 1 ? '' : 's') + ' changed, ' + ti + ' insertion' + (ti === 1 ? '' : 's') + '(+), ' + td + ' deletion' + (td === 1 ? '' : 's') + '(-)\n';
        }
        if (f.quiet || f['exit-code']) return stats.length ? 1 : 0;
        if (!out3) return 0;
        return page(out3);
      }

      if (sub === 'show') {
        var c2 = findCommit(repo, a.pos[0]);
        if (!c2) { ctx.err("fatal: ambiguous argument '" + a.pos[0] + "': unknown revision or path not in the working tree.\n"); return 128; }
        var o4 = (color ? sgr('33') + 'commit ' + c2.hash + R0 : 'commit ' + c2.hash) + decorations(repo, c2.hash, color) + '\nAuthor: ' + c2.author + '\nDate:   ' + gitDate(c2.when) + '\n\n    ' + c2.subject + '\n';
        if (c2.body) c2.body.split('\n').forEach(function (l) { o4 += '    ' + l + '\n'; });
        o4 += '\n';
        (c2.patch || []).forEach(function (p) { o4 += fileDiff(p.path, p.before !== undefined ? p.before : '', p.after !== undefined ? p.after : '', color, { hunks: p.hunks }); });
        return page(o4);
      }

      if (sub === 'branch') {
        if (f.d || f.D) {
          var del = a.pos[0] || f.d || f.D;
          if (!repo.branches[del]) { ctx.err("error: branch '" + del + "' not found\n"); return 1; }
          if (del === repo.branch) { ctx.err("error: cannot delete branch '" + del + "' used by worktree at '" + repo.root + "'\n"); return 1; }
          var hh = repo.branches[del]; delete repo.branches[del];
          ctx.out('Deleted branch ' + del + ' (was ' + short(hh) + ').\n'); return 0;
        }
        if (a.pos.length && !f.a && !f.v) {
          if (repo.branches[a.pos[0]]) { ctx.err("fatal: a branch named '" + a.pos[0] + "' already exists\n"); return 128; }
          repo.branches[a.pos[0]] = repo.branches[repo.branch]; return 0;
        }
        var names = Object.keys(repo.branches).sort(), o5 = '';
        var wb = Math.max.apply(null, names.map(function (x) { return x.length; }));
        names.forEach(function (b) {
          var cur = b === repo.branch, c3 = findCommit(repo, repo.branches[b]);
          var label = cur ? '* ' + (color ? sgr('32') + b + R0 : b) : '  ' + b;
          o5 += (f.v ? pad(label, wb + 2) + ' ' + (color ? sgr('33') : '') + short(repo.branches[b]) + (color ? R0 : '') + ' ' + (c3 ? c3.subject : '') : label) + '\n';
        });
        if (f.a || f.r) Object.keys(repo.remoteBranches || {}).sort().forEach(function (b) { o5 += '  ' + (color ? sgr('31') + 'remotes/' + b + R0 : 'remotes/' + b) + '\n'; });
        ctx.out(o5); return 0;
      }

      if (sub === 'switch' || sub === 'checkout') {
        var create = f.c || f.b, target = typeof create === 'string' ? create : a.pos[0];
        if (!target) { ctx.err('fatal: missing branch or commit argument\n'); return 128; }
        if (create) {
          if (repo.branches[target]) { ctx.err("fatal: a branch named '" + target + "' already exists\n"); return 128; }
          repo.branches[target] = repo.branches[repo.branch];
        } else if (!repo.branches[target]) {
          if (repo.remoteBranches['origin/' + target]) { repo.branches[target] = repo.remoteBranches['origin/' + target]; ctx.out("branch '" + target + "' set up to track 'origin/" + target + "'.\n"); }
          else { ctx.err((sub === 'switch' ? 'fatal: invalid reference: ' : "error: pathspec '") + target + (sub === 'switch' ? '' : "' did not match any file(s) known to git") + '\n'); return sub === 'switch' ? 128 : 1; }
        } else if (target === repo.branch) { ctx.err("Already on '" + target + "'\n"); return 0; }
        vfs.gitStatus(repo).filter(function (r) { return r.work === 'M' || r.index === 'M'; }).forEach(function (r) { ctx.out('M\t' + showPath(r.path) + '\n'); });
        repo.branch = target;
        try { vfs.write(repo.root + '/.git/HEAD', 'ref: refs/heads/' + target + '\n'); } catch (e) {}
        ctx.err((create ? "Switched to a new branch '" : "Switched to branch '") + target + "'\n");
        return 0;
      }

      if (sub === 'add') {
        var addAll = f.A || f.all || a.pos.indexOf('.') >= 0;
        if (!a.pos.length && !addAll) { ctx.out('Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?\n'); return 0; }
        if (addAll) { vfs.gitStatus(repo).forEach(function (r) { vfs.gitAdd(repo, r.path); }); return 0; }
        for (var q = 0; q < a.pos.length; q++) {
          if (!vfs.gitAdd(repo, toRel(a.pos[q]))) { ctx.err("fatal: pathspec '" + a.pos[q] + "' did not match any files\n"); return 128; }
        }
        return 0;
      }

      if (sub === 'restore') {
        a.pos.forEach(function (p) {
          var rel = toRel(p);
          if (f.staged || f.S) { delete repo.staged[rel]; return; }
          var t = baseText(rel); if (typeof t === 'string') { try { vfs.write(repo.root + '/' + rel, t); } catch (e) {} }
        });
        return 0;
      }

      if (sub === 'commit') {
        if (f.a || f.all) vfs.gitStatus(repo).forEach(function (r) { if (r.work === 'M' || r.work === 'D') vfs.gitAdd(repo, r.path); });
        if (typeof f.m !== 'string') { ctx.err('Aborting commit due to empty commit message.\n'); return 1; }
        var before = {};
        Object.keys(repo.staged).forEach(function (rel) { before[rel] = { a: vfs.gitHeadText(repo, rel), b: typeof repo.staged[rel] === 'string' && !/^(asset|bytes):/.test(repo.staged[rel]) ? repo.staged[rel] : null }; });
        var st = vfs.gitCommit(repo, f.m, 'Jared <jared@sittingmongoose.party>');
        if (!st) {
          var o6 = 'On branch ' + repo.branch + '\n';
          var any = vfs.gitStatus(repo);
          o6 += any.length ? 'Changes not staged for commit:\n' + any.filter(function (r) { return r.work !== ' ' && r.index !== '?'; }).map(function (r) { return '\tmodified:   ' + showPath(r.path) + '\n'; }).join('') + '\nno changes added to commit (use "git add" and/or "git commit -a")\n' : 'nothing to commit, working tree clean\n';
          ctx.out(o6); return 1;
        }
        var nc = repo.commits[0];
        nc.patch = Object.keys(before).map(function (rel) { return { path: rel, before: before[rel].a, after: before[rel].b, hunks: T.VFS.hunks(before[rel].a || '', before[rel].b || '', 3) }; });
        try { vfs.write(repo.root + '/.git/refs/heads/' + repo.branch, st.hash + '\n'); } catch (e) {}
        ctx.out('[' + repo.branch + ' ' + short(st.hash) + '] ' + f.m.split('\n')[0] + '\n ' + st.files + ' file' + (st.files === 1 ? '' : 's') + ' changed, ' + st.ins + ' insertion' + (st.ins === 1 ? '' : 's') + '(+), ' + st.del + ' deletion' + (st.del === 1 ? '' : 's') + '(-)\n' +
          st.created.map(function (r) { return ' create mode 100644 ' + r + '\n'; }).join(''));
        return 0;
      }

      if (sub === 'rev-parse') {
        if (f['show-toplevel']) { ctx.out(repo.root + '\n'); return 0; }
        if (f['abbrev-ref']) { ctx.out(repo.branch + '\n'); return 0; }
        var c4 = findCommit(repo, a.pos[0] || 'HEAD');
        if (!c4) { ctx.err("fatal: ambiguous argument '" + a.pos[0] + "': unknown revision\n"); return 128; }
        ctx.out((f.short ? short(c4.hash) : c4.hash) + '\n'); return 0;
      }
      if (sub === 'remote') { ctx.out(f.v ? 'origin\t' + repo.remoteUrl + ' (fetch)\norigin\t' + repo.remoteUrl + ' (push)\n' : 'origin\n'); return 0; }
      if (sub === 'fetch' || sub === 'pull') {
        await ctx.sleep(700);
        ctx.out(sub === 'pull' ? 'Already up to date.\n' : ''); return 0;
      }
      if (sub === 'push') {
        var list2 = repo.commits.filter(function (c) { return !c.edge; }), ahead2 = 0;
        for (var z = 0; z < list2.length && list2[z].hash !== repo.remoteBranches['origin/' + repo.branch]; z++) ahead2++;
        if (!repo.remoteBranches['origin/' + repo.branch]) ahead2 = 1;
        if (!ahead2) { await ctx.sleep(500); ctx.err('Everything up-to-date\n'); return 0; }
        var steps = ['Enumerating objects: 9, done.', 'Counting objects: 100% (9/9), done.', 'Delta compression using up to 8 threads', 'Compressing objects: 100% (5/5), done.', 'Writing objects: 100% (5/5), 1.12 KiB | 1.12 MiB/s, done.', 'Total 5 (delta 3), reused 0 (delta 0), pack-reused 0 (from 0)'];
        for (var s = 0; s < steps.length; s++) { await ctx.sleep(180); ctx.err(steps[s] + '\n'); }
        var old = repo.remoteBranches['origin/' + repo.branch];
        repo.remoteBranches['origin/' + repo.branch] = repo.branches[repo.branch];
        ctx.err('To ' + repo.remoteUrl.replace(/^git@/, '').replace(':', '/') + '\n   ' + short(old || '0000000') + '..' + short(repo.branches[repo.branch]) + '  ' + repo.branch + ' -> ' + repo.branch + '\n');
        return 0;
      }
      if (sub === 'stash') { ctx.out('No local changes to save\n'); return 0; }
      if (sub === 'blame') {
        var rel2 = toRel(a.pos[0] || ''), txt = current(rel2);
        if (txt === null) { ctx.err("fatal: no such path '" + rel2 + "' in HEAD\n"); return 128; }
        var b2 = txt.replace(/\n$/, '').split('\n').map(function (l, i2) { return (color ? sgr('33') : '') + short(head.hash) + (color ? R0 : '') + ' (Jared ' + strftime('%F %T %z', new Date(head.when)) + ' ' + lpad(String(i2 + 1), 3) + ') ' + l; }).join('\n') + '\n';
        return page(b2);
      }
      return 0;
    }
  };

  /* ------------------------------------------------------------------ cargo */
  function findUp(vfs, dir, name) {
    var p = dir;
    for (;;) { var st = vfs.stat((p === '/' ? '' : p) + '/' + name); if (st && st.type === 'file') return p; if (p === '/') return null; p = T.VFS.dirname(p); }
  }
  function cargoStatus(color, word, rest, code) {
    var w = lpad(word, 12);
    return (color ? sgr('1') + sgr(code || '32') + w + R0 : w) + ' ' + rest;
  }
  function fmtSecs(ms) { var s = ms / 1000; return s >= 60 ? Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's' : s.toFixed(2) + 's'; }
  /* a rustc diagnostic, coloured as rustc does */
  function diag(color, kind, code, msg, file, line, col, src, span, label, notes) {
    var red = kind === 'error', head = kind + (code ? '[' + code + ']' : '');
    var B = function (s) { return color ? sgr('1') + s + R0 : s; }, blue = function (s) { return color ? sgr('1;34') + s + R0 : s; };
    var g = ' '.repeat(String(line).length);
    var out = (color ? sgr('1;' + (red ? '31' : '33')) + head + R0 : head) + B(': ' + msg) + '\n';
    out += g + blue('--> ') + file + ':' + line + ':' + col + '\n';
    out += g + ' ' + blue('|') + '\n';
    out += blue(String(line) + ' |') + ' ' + src + '\n';
    out += g + ' ' + blue('|') + ' ' + ' '.repeat(col - 1) + (color ? sgr('1;' + (red ? '31' : '33')) : '') + '^'.repeat(span) + ' ' + label + (color ? R0 : '') + '\n';
    (notes || []).forEach(function (n) { out += g + ' ' + blue('|') + '\n' + g + ' ' + blue('=') + ' ' + B('note') + ': ' + n + '\n'; });
    return out + '\n';
  }
  function locate(text, re) {
    var ls = text.split('\n');
    for (var i = 0; i < ls.length; i++) { var m = re.exec(ls[i]); if (m) return { line: i + 1, col: m.index + (m[1] ? m[0].indexOf(m[1]) : 0) + 1, src: ls[i], tok: m[1] || m[0] }; }
    return null;
  }
  function cargoProject(ctx) {
    var root = findUp(ctx.vfs, ctx.cwd, 'Cargo.toml');
    if (!root) return null;
    var toml = ctx.vfs.readText(root + '/Cargo.toml');
    var name = (/^name\s*=\s*"([^"]+)"/m.exec(toml) || [])[1] || T.VFS.basename(root), ver = (/^version\s*=\s*"([^"]+)"/m.exec(toml) || [])[1] || '0.1.0';
    var imp = null; try { imp = ctx.vfs.readText(root + '/src/media/import.rs'); } catch (e) { imp = null; }
    var warn = null, bug = null;
    if (imp) {
      var w = locate(imp, /let (started) = Instant::now\(\);/);
      if (w && imp.split('started').length === 2) warn = w;
      if (/fn import_rejects_duplicate_hash\((?!pool)\w+: PgPool\)/.test(imp)) bug = locate(imp, /^\s+&(pool),\s*$/);
    }
    return { root: root, name: name, ver: ver, warn: warn, bug: bug };
  }
  /* compile phase: dependency lines with a progress bar, OSC 9;4 progress, then the crate itself */
  async function compile(ctx, proj, o) {
    var color = colorOn(ctx), vfs = ctx.vfs, tty = ctx.isatty !== false;
    var dir = proj.root + '/target/' + (o.release ? 'release' : 'debug'), fresh = !vfs.stat(dir), t0 = Date.now(), r = rnd(T.VFS.fnv(proj.name + (o.release ? 'r' : 'd')));
    var crates = fresh ? T.VFS.CRATES.slice() : [];
    if (o.extra) crates = crates.concat(o.extra);
    var total = crates.length + 1, done = 0, word = o.check ? 'Checking' : 'Compiling';
    var bar = function (names) {
      var cols = Math.max(20, ctx.size().cols), bw = Math.min(25, Math.max(10, cols - 60)), fill = Math.floor(bw * done / total);
      var s = cargoStatus(color, 'Building', '[' + '='.repeat(fill) + (fill < bw ? '>' : '') + ' '.repeat(Math.max(0, bw - fill - 1)) + '] ' + done + '/' + total + ': ' + names, '36');
      return cut(strip(s), cols - 1) === strip(s) ? s : cargoStatus(color, 'Building', '[' + '='.repeat(fill) + '>' + ' '.repeat(Math.max(0, bw - fill - 1)) + '] ' + done + '/' + total, '36');
    };
    if (tty) ctx.out(CSI + '?25l');
    for (var i = 0; i < crates.length; i++) {
      var c = crates[i];
      ctx.out((tty ? '\r' + CSI + 'K' : '') + cargoStatus(color, word, c[0] + ' v' + c[1]) + '\n');
      done++;
      if (tty) ctx.out(bar(crates.slice(i + 1, i + 4).map(function (x) { return x[0]; }).join(', ') || proj.name) + progress(1, done * 100 / total));
      await ctx.sleep(40 + Math.floor(r() * 120));
    }
    ctx.out((tty ? '\r' + CSI + 'K' : '') + cargoStatus(color, word, proj.name + ' v' + proj.ver + ' (' + proj.root + ')') + '\n');
    if (tty) ctx.out(bar(proj.name + '(bin)') + progress(1, Math.max(5, done * 100 / total)));
    await ctx.sleep(o.release ? 1400 : 900);
    if (tty) ctx.out('\r' + CSI + 'K');
    var warned = 0;
    if (proj.warn && !o.quietWarn) {
      var w = proj.warn;
      ctx.out(diag(color, o.denyWarnings ? 'error' : 'warning', '', 'unused variable: `' + w.tok + '`', 'src/media/import.rs', w.line, w.col, w.src, w.tok.length,
        'help: if this is intentional, prefix it with an underscore: `_' + w.tok + '`', [o.denyWarnings ? '`-D unused-variables` implied by `-D warnings`' : '`#[warn(unused_variables)]` on by default']));
      warned = 1;
    }
    if (o.test && o.failOnBug && proj.bug) {
      var b = proj.bug;
      ctx.out(progress(2, 100));
      ctx.out(diag(color, 'error', 'E0425', 'cannot find value `pool` in this scope', 'src/media/import.rs', b.line, b.col, b.src, 4, 'not found in this scope', null));
      ctx.out((color ? sgr('1') : '') + 'For more information about this error, try `rustc --explain E0425`.' + (color ? R0 : '') + '\n');
      ctx.out((color ? sgr('1;33') + 'warning' + R0 + sgr('1') : 'warning') + ': `' + proj.name + '` (bin "' + proj.name + '" test) generated ' + warned + ' warning' + (color ? R0 : '') + '\n');
      ctx.out((color ? sgr('1;31') + 'error' + R0 + sgr('1') : 'error') + ': could not compile `' + proj.name + '` (bin "' + proj.name + '" test) due to 1 previous error; ' + warned + ' warning emitted' + (color ? R0 : '') + '\n');
      ctx.out(progress(0));
      if (tty) ctx.out(CSI + '?25h');
      return 101;
    }
    if (o.denyWarnings && warned) {
      ctx.out((color ? sgr('1;31') + 'error' + R0 : 'error') + ': could not compile `' + proj.name + '` (bin "' + proj.name + '") due to 1 previous error\n' + progress(0));
      if (tty) ctx.out(CSI + '?25h');
      return 101;
    }
    if (warned) ctx.out((color ? sgr('1;33') + 'warning' + R0 + sgr('1') : 'warning') + ': `' + proj.name + '` (bin "' + proj.name + '"' + (o.test ? ' test' : '') + ') generated 1 warning' + (color ? R0 : '') + '\n');
    var profile = o.profile || (o.release ? '`release` profile [optimized]' : '`dev` profile [unoptimized + debuginfo]');
    ctx.out(cargoStatus(color, 'Finished', profile + ' target(s) in ' + fmtSecs(Date.now() - t0 + (fresh ? 0 : 0))) + '\n' + progress(0));
    if (tty) ctx.out(CSI + '?25h');
    try {
      vfs.mkdir(dir, { parents: true });
      vfs.write(dir + '/' + proj.name, new Uint8Array(o.release ? 8960 : 24512));
      vfs.mkdir(proj.root + '/target/' + (o.release ? 'release' : 'debug') + '/deps', { parents: true });
    } catch (e) {}
    return 0;
  }
  var TEST_NAMES = (function () {
    var mods = {
      'media::import::tests': ['hashes_are_stable', 'import_rejects_duplicate_hash', 'large_images_are_scaled_to_max_edge', 'unknown_format_is_unprocessable', 'webp_is_accepted', 'thumbnail_is_square', 'png_alpha_is_kept', 'jpeg_orientation_is_applied'],
      'media::tests': ['kind_from_png', 'kind_from_jpeg', 'kind_rejects_gif', 'error_status_codes', 'store_round_trip', 'store_creates_dirs'],
      'router::tests': ['healthz_answers_ok', 'upload_limit_is_25_mib', 'upload_413_over_limit', 'list_orders_by_created_at', 'cors_is_permissive', 'multipart_without_file_name', 'unknown_recipe_is_404'],
      'search::rank::tests': [], 'search::tokenize::tests': [], 'recipes::tests': [], 'db::tests': []
    };
    var words = ['title', 'ingredient', 'unicode', 'accent', 'plural', 'stopword', 'exact', 'prefix', 'fuzzy', 'empty', 'long', 'quantity', 'unit', 'fraction', 'servings', 'tag', 'author', 'draft', 'publish', 'slug'];
    var verbs = ['matches', 'ranks_first', 'is_ignored', 'round_trips', 'is_rejected', 'is_normalised', 'keeps_order', 'is_stable'];
    var fill = ['search::rank::tests', 'search::tokenize::tests', 'recipes::tests', 'db::tests'], out = [];
    Object.keys(mods).forEach(function (m) { mods[m].forEach(function (t) { out.push(m + '::' + t); }); });
    var k = 0;
    while (out.length < 214) { var m2 = fill[k % fill.length]; out.push(m2 + '::' + words[(k * 7) % words.length] + '_' + verbs[(k * 3 + Math.floor(k / 20)) % verbs.length] + (k >= 160 ? '_' + (k % 9) : '')); k++; }
    return out;
  })();
  P.cargo = {
    summary: "Rust's package manager",
    complete: function (args) { return args.length <= 1 ? ['build', 'check', 'test', 'bench', 'run', 'clean', 'fmt', 'clippy', 'doc', '--version'] : ['--release', '--workspace', '--locked']; },
    run: async function (ctx) {
      var argv = ctx.argv.slice(1), sub = argv[0], color = colorOn(ctx);
      if (!sub) { ctx.out("Rust's package manager\n\nUsage: cargo [OPTIONS] [COMMAND]\n\nCommands:\n    build, b    Compile the current package\n    check, c    Analyze the current package and report errors, but don't build object files\n    test, t     Run the tests\n    bench       Run the benchmarks\n    run, r      Run a binary or example of the local package\n    clean       Remove the target directory\n"); return 0; }
      if (sub === '--version' || sub === '-V') { ctx.out('cargo 1.82.0 (8f40fc59f 2024-08-21)\n'); return 0; }
      var alias = { b: 'build', c: 'check', t: 'test', r: 'run' }; sub = alias[sub] || sub;
      var proj = cargoProject(ctx);
      if (!proj) { ctx.err((color ? sgr('1;31') + 'error' + R0 : 'error') + ': could not find `Cargo.toml` in `' + ctx.cwd + '` or any parent directory\n'); return 101; }
      var a = parse(argv.slice(1), ['p', 'bench', 'test', 'j', 'features']), f = a.f;
      try {
        if (sub === 'build' || sub === 'check') return await compile(ctx, proj, { release: !!f.release || !!f.r, check: sub === 'check' });
        if (sub === 'clippy') return await compile(ctx, proj, { check: true, denyWarnings: argv.indexOf('warnings') >= 0 && argv.indexOf('-D') >= 0 });
        if (sub === 'fmt') { await ctx.sleep(300); return 0; }
        if (sub === 'doc') { var rc0 = await compile(ctx, proj, { profile: '`dev` profile [unoptimized + debuginfo]', quietWarn: true }); ctx.out(cargoStatus(color, 'Generated', link('file://' + hostOf(ctx) + proj.root + '/target/doc/' + proj.name.replace(/-/g, '_') + '/index.html', proj.root + '/target/doc/' + proj.name.replace(/-/g, '_') + '/index.html')) + '\n'); return rc0; }
        if (sub === 'clean') {
          var n = 0, bytes = 0;
          ctx.vfs.walk(proj.root + '/target', function (p, s) { if (s.type === 'file') { n++; bytes += s.size; } return true; });
          if (ctx.vfs.stat(proj.root + '/target')) { ctx.vfs.remove(proj.root + '/target'); n = n * 311 + 1562; bytes = 642349875; }
          ctx.out(cargoStatus(color, 'Removed', n + ' files' + (n ? ', ' + (bytes / 1048576).toFixed(1) + 'MiB total' : '')) + '\n');
          return 0;
        }
        if (sub === 'test') {
          var filter = a.pos[0] || '';
          var rc = await compile(ctx, proj, { test: true, failOnBug: /^media(::|$)/.test(filter), profile: '`test` profile [unoptimized + debuginfo]' });
          if (rc) return rc;
          var names = TEST_NAMES.filter(function (t) { return !filter || t.indexOf(filter) >= 0; });
          ctx.out(cargoStatus(color, 'Running', 'unittests src/main.rs (target/debug/deps/' + proj.name.replace(/-/g, '_') + '-1f6b2c9d0e3a4b57)') + '\n\nrunning ' + names.length + ' test' + (names.length === 1 ? '' : 's') + '\n');
          var t0 = Date.now(), ok = color ? sgr('32') + 'ok' + R0 : 'ok';
          for (var i = 0; i < names.length; i += 9) {
            ctx.out(names.slice(i, i + 9).map(function (t) { return 'test ' + t + ' ... ' + ok; }).join('\n') + '\n' + progress(1, (i + 9) * 100 / names.length));
            await ctx.sleep(35);
          }
          ctx.out('\ntest result: ' + ok + '. ' + names.length + ' passed; 0 failed; 0 ignored; 0 measured; ' + (TEST_NAMES.length - names.length) + ' filtered out; finished in ' + ((Date.now() - t0) / 1000 + 0.6).toFixed(2) + 's\n\n' + progress(0));
          return 0;
        }
        if (sub === 'bench') {
          var rc2 = await compile(ctx, proj, { release: true, quietWarn: true, profile: '`bench` profile [optimized]', extra: [['criterion', '0.5.1'], ['plotters', '0.3.7']] });
          if (rc2) return rc2;
          ctx.out(cargoStatus(color, 'Running', 'benches/import.rs (target/release/deps/import-8c2e4f1a9b3d5e70)') + '\nGnuplot not found, using plotters backend\n');
          var benches = [
            ['import/content_hash', [24.117, 24.203, 24.301], CH.mu + 's', [-1.8812, -1.2043, -0.5521], 'noise', [4, 3, 1], '2.1M'],
            ['import/parse_manifest', [1.2843, 1.2911, 1.2987], CH.mu + 's', [-0.9123, 0.3108, 1.4410], 'none', [2, 2, 0], '39M'],
            ['import/decode_jpeg', [3.8112, 3.8297, 3.8503], 'ms', [-13.402, -12.611, -11.873], 'improved', [6, 4, 2], '1300'],
            ['import/thumbnail_256', [1.8121, 1.8236, 1.8360], 'ms', [4.1203, 4.8820, 5.6013], 'regressed', [1, 1, 0], '2750']
          ];
          for (var k = 0; k < benches.length; k++) {
            var b = benches[k], id = b[0], tty = ctx.isatty !== false;
            var stage = function (s) { if (tty) ctx.out('\r' + CSI + 'K' + 'Benchmarking ' + id + ': ' + s); };
            stage('Warming up for 3.0000 s'); ctx.out(progress(1, k * 25 + 4)); await ctx.sleep(450);
            stage('Collecting 100 samples in estimated 5.0' + (k * 37 % 100) + ' s (' + b[6] + ' iterations)'); ctx.out(progress(1, k * 25 + 15)); await ctx.sleep(800);
            stage('Analyzing'); await ctx.sleep(220);
            if (tty) ctx.out('\r' + CSI + 'K');
            var t = b[1], u = b[2];
            ctx.out(pad(color ? sgr('32') + id + R0 : id, 24) + 'time:   [' + t[0].toFixed(3) + ' ' + u + ' ' + (color ? sgr('1') : '') + t[1].toFixed(3) + ' ' + u + (color ? R0 : '') + ' ' + t[2].toFixed(3) + ' ' + u + ']\n');
            var ch = b[3], pct = function (v) { return (v > 0 ? '+' : '') + v.toFixed(4) + '%'; };
            var mid = color && b[4] === 'improved' ? sgr('1;32') + pct(ch[1]) + R0 : color && b[4] === 'regressed' ? sgr('1;31') + pct(ch[1]) + R0 : pct(ch[1]);
            ctx.out(' '.repeat(24) + 'change: [' + pct(ch[0]) + ' ' + mid + ' ' + pct(ch[2]) + '] (p = ' + (b[4] === 'none' ? '0.43 > 0.05' : '0.00 < 0.05') + ')\n');
            var verdict = b[4] === 'improved' ? (color ? sgr('32') + 'Performance has improved.' + R0 : 'Performance has improved.') : b[4] === 'regressed' ? (color ? sgr('31') + 'Performance has regressed.' + R0 : 'Performance has regressed.') : b[4] === 'noise' ? 'Change within noise threshold.' : 'No change in performance detected.';
            ctx.out(' '.repeat(24) + verdict + '\n');
            if (b[5][0]) ctx.out((color ? sgr('33') : '') + 'Found ' + b[5][0] + ' outliers among 100 measurements (' + b[5][0].toFixed(2) + '%)' + (color ? R0 : '') + '\n' + (b[5][1] ? '  ' + b[5][1] + ' (' + b[5][1].toFixed(2) + '%) high mild\n' : '') + (b[5][2] ? '  ' + b[5][2] + ' (' + b[5][2].toFixed(2) + '%) high severe\n' : ''));
            ctx.out('\n');
          }
          ctx.out(progress(0));
          return 0;
        }
        if (sub === 'run') {
          var rc3 = await compile(ctx, proj, { release: !!f.release });
          if (rc3) return rc3;
          ctx.out(cargoStatus(color, 'Running', '`target/' + (f.release ? 'release' : 'debug') + '/' + proj.name + '`') + '\n');
          var ts = function () { return new Date().toISOString().replace(/Z$/, String(Math.floor(Math.random() * 1000)).padStart(3, '0') + 'Z'); };
          var D = function (s) { return color ? sgr('2') + s + R0 : s; }, info = color ? sgr('32') + ' INFO' + R0 : ' INFO', I = function (s) { return color ? sgr('3') + s + R0 : s; };
          await ctx.sleep(300);
          ctx.out(D(ts()) + info + ' ' + D('tastebook_api' + ':') + ' listening on ' + link('http://127.0.0.1:8080', 'http://127.0.0.1:8080') + '\n');
          var paths = ['/healthz', '/api/v1/recipes/9f1c2e70/media', '/api/v1/recipes', '/api/v1/search?q=tomato'], r = rnd(17);
          for (var q = 0; ; q++) {
            await ctx.sleep(1800 + Math.floor(r() * 2400));
            var pth = paths[q % paths.length], lat = 2 + Math.floor(r() * 40), method = q % 5 === 3 ? 'POST' : 'GET';
            ctx.out(D(ts()) + info + ' ' + (color ? sgr('1') + 'request' + R0 + sgr('1') + '{' + R0 : 'request{') + 'method=' + method + ' uri=' + pth + ' version=HTTP/1.1' + (color ? sgr('1') + '}' + R0 : '}') + D(':') + ' ' + D('tower_http::trace::on_response' + ':') + ' finished processing request ' + I('latency') + D('=') + lat + ' ms ' + I('status') + D('=') + '200\n');
          }
        }
        ctx.err((color ? sgr('1;31') + 'error' + R0 : 'error') + ": no such command: `" + sub + "`\n\n\tView all installed commands with `cargo --list`\n");
        return 101;
      } finally {
        if (ctx.signal && ctx.signal.aborted) { /* the shell clears progress and the cursor */ }
      }
    }
  };

  /* ------------------------------------------------------------------ npm and the Vite dev server */
  P.npm = {
    summary: 'javascript package manager',
    complete: function (args) { return args.length <= 1 ? ['install', 'run', 'ci', 'test', '--version'] : ['dev', 'build', 'preview']; },
    run: async function (ctx) {
      var argv = ctx.argv.slice(1), sub = argv[0], color = colorOn(ctx), tty = ctx.isatty !== false;
      if (sub === '--version' || sub === '-v') { ctx.out('10.9.0\n'); return 0; }
      if (!sub) { ctx.out('npm <command>\n\nUsage:\n\nnpm install        install all the dependencies in your project\nnpm run <foo>      run the script named <foo>\nnpm test           run this project\'s tests\n\nnpm@10.9.0 /usr/lib/node_modules/npm\n'); return 1; }
      var root = findUp(ctx.vfs, ctx.cwd, 'package.json');
      var E = function (s) { return (color ? sgr('31') + 'npm error' + R0 : 'npm error') + ' ' + s + '\n'; };
      if (!root) { ctx.err(E('code ENOENT') + E('syscall open') + E('path ' + ctx.cwd + '/package.json') + E('errno -2') + E('enoent Could not read package.json: Error: ENOENT: no such file or directory, open \'' + ctx.cwd + '/package.json\'')); return 254; }
      var pkg = {}; try { pkg = JSON.parse(ctx.vfs.readText(root + '/package.json')); } catch (e) { pkg = {}; }
      var scripts = pkg.scripts || {};
      if (sub === 'install' || sub === 'i' || sub === 'ci' || sub === 'add') {
        var steps = ['idealTree:tastebook: sill idealTree buildDeps', 'idealTree: timing idealTree:#root Completed in 412ms', 'reify:fsevents: sill reify mark deleted [optional]',
          'reify:@esbuild/linux-x64: http fetch GET 200 https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.24.0.tgz', 'reify:rollup: http fetch GET 200 https://registry.npmjs.org/rollup/-/rollup-4.24.0.tgz',
          'reify:react-dom: timing reifyNode:node_modules/react-dom Completed in 312ms', 'reify:vite: timing reifyNode:node_modules/vite Completed in 655ms', 'reify:typescript: timing reifyNode:node_modules/typescript Completed in 901ms',
          'build:esbuild: sill build linkStuff', 'audit: sill audit bulk request'];
        var t0 = Date.now();
        if (tty) ctx.out(CSI + '?25l');
        for (var i = 0; i <= 40; i++) {
          var pct = i / 40, bw = 18, full = Math.round(pct * bw);
          var line = '(' + (color ? sgr('37') : '') + CH.full.repeat(full) + (color ? sgr('90') : '') + CH.light.repeat(bw - full) + (color ? R0 : '') + ') ' + SPIN[i % SPIN.length] + ' ' + steps[Math.min(steps.length - 1, Math.floor(pct * steps.length))];
          if (tty) ctx.out('\r' + CSI + 'K' + cut(line, ctx.size().cols - 1) + progress(1, pct * 100));
          await ctx.sleep(70 + (i % 7) * 12);
        }
        if (tty) ctx.out('\r' + CSI + 'K' + CSI + '?25h' + progress(0));
        try { ctx.vfs.mkdir(root + '/node_modules', { parents: true }); } catch (e) {}
        ctx.out('\nadded 312 packages, and audited 313 packages in ' + Math.max(1, Math.round((Date.now() - t0) / 1000)) + 's\n\n' + (color ? sgr('1') + '58' + sgr('22') : '58') + ' packages are looking for funding\n  run `npm fund` for details\n\nfound ' + (color ? sgr('32;1') + '0' + R0 : '0') + ' vulnerabilities\n');
        return 0;
      }
      if (sub === 'test' || sub === 't') sub = 'run', argv = ['run', 'test'];
      if (sub === 'run' || sub === 'run-script') {
        var name = argv[1];
        if (!name) { ctx.out('Lifecycle scripts included in ' + (pkg.name || 'package') + '@' + (pkg.version || '0.0.0') + ':\n' + Object.keys(scripts).map(function (k) { return '  ' + k + '\n    ' + scripts[k]; }).join('\n') + '\n'); return 0; }
        if (!scripts[name]) { ctx.err(E('Missing script: "' + name + '"') + E('') + E('To see a list of scripts, run:') + E('  npm run')); return 1; }
        ctx.out('\n> ' + pkg.name + '@' + pkg.version + ' ' + name + '\n> ' + scripts[name] + '\n\n');
        if (!ctx.vfs.stat(root + '/node_modules/vite')) { ctx.err('sh: 1: vite: not found\n'); return 127; }
        if (/^vite build/.test(scripts[name])) {
          ctx.out((color ? sgr('36') : '') + 'vite v6.0.3 ' + (color ? sgr('32') : '') + 'building for production...' + (color ? R0 : '') + '\n');
          await ctx.sleep(600); ctx.out('transforming...\n'); await ctx.sleep(900);
          ctx.out((color ? sgr('32') + CH.check + R0 : CH.check) + ' 34 modules transformed.\nrendering chunks...\ncomputing gzip size...\n'); await ctx.sleep(400);
          var D2 = function (s) { return color ? sgr('2') + s + R0 : s; };
          ctx.out(D2('dist/') + (color ? sgr('32') : '') + 'index.html' + (color ? R0 : '') + '                 ' + D2('  0.46 kB') + D2(' ' + CH.dot + ' gzip:  0.30 kB') + '\n' +
            D2('dist/') + (color ? sgr('36') : '') + 'assets/index-DiwrgTda.js' + (color ? R0 : '') + '  ' + (color ? sgr('1') : '') + '143.36 kB' + (color ? R0 : '') + D2(' ' + CH.dot + ' gzip: 46.11 kB') + '\n' +
            (color ? sgr('32') + CH.check + ' built in 1.92s' + R0 : CH.check + ' built in 1.92s') + '\n');
          return 0;
        }
        return viteDev(ctx, color);
      }
      ctx.err('Unknown command: "' + sub + '"\n\nTo see a list of supported npm commands, run:\n  npm help\n');
      return 1;
    }
  };
  async function viteDev(ctx, color) {
    var G = function (s) { return color ? sgr('32') + s + R0 : s; }, Bd = function (s) { return color ? sgr('1') + s + sgr('22') : s; }, Dm = function (s) { return color ? sgr('2') + s + sgr('22') : s; };
    var url = 'http://localhost:5173/', shownUrl = color ? sgr('36') + 'http://localhost:' + Bd('5173') + sgr('36') + '/' + R0 : url;
    var stopped = false;
    await ctx.sleep(412);
    var urls = function () { return '  ' + G(CH.arrow) + '  ' + Bd('Local') + ':   ' + link(url, shownUrl) + '\n  ' + G(CH.arrow) + '  ' + Bd('Network') + Dm(': use ') + Bd('--host') + Dm(' to expose') + '\n'; };
    ctx.out('\n  ' + (color ? sgr('1;32') + 'VITE' + R0 + ' ' + sgr('32') + 'v6.0.3' + R0 : 'VITE v6.0.3') + '  ' + Dm('ready in ') + Bd('412') + ' ms\n\n' + urls() + Dm('  ' + G(CH.arrow) + '  press ') + Bd('h + enter') + Dm(' to show help') + '\n');
    var stamp = function () { var d = new Date(); return Dm((d.getHours() % 12 || 12) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + ' ' + (d.getHours() < 12 ? 'AM' : 'PM')); };
    var V = color ? sgr('1;36') + '[vite]' + R0 : '[vite]';
    var events = [['(client) ' + G('hmr update ') + Dm('/src/App.tsx')], ['(client) ' + G('hmr update ') + Dm('/src/RecipeList.tsx')], [G('page reload ') + Dm('src/main.tsx')],
      ['(client) ' + G('hmr update ') + Dm('/src/RecipeList.tsx') + (color ? sgr('33') + ' (x2)' + R0 : ' (x2)')], ['(client) ' + G(String.fromCodePoint(0x2728) + ' new dependencies optimized: ') + Dm('react-dom/client')]];
    var logLoop = (async function () {
      for (var i = 0; ; i++) {
        await ctx.sleep(3000 + (i * 1300) % 2500);
        if (stopped) return;
        ctx.out(stamp() + ' ' + V + ' ' + events[i % events.length][0] + '\n');
      }
    })();
    var readLoop = (async function () {
      for (;;) {
        var line = (await ctx.readLine('', {})).trim();
        if (line === 'q') { stopped = true; return 0; }
        if (line === 'h') ctx.out('\n  Shortcuts\n' + ['r + enter to restart the server', 'u + enter to show server url', 'o + enter to open in browser', 'c + enter to clear console', 'q + enter to quit'].map(function (s) { return Dm('  press ') + Bd(s.split(' to ')[0]) + Dm(' to ' + s.split(' to ')[1]); }).join('\n') + '\n');
        else if (line === 'u') ctx.out('\n' + urls());
        else if (line === 'c') ctx.out(CSI + 'H' + CSI + '2J' + CSI + '3J');
        else if (line === 'r') ctx.out(stamp() + ' ' + V + ' ' + G('server restarted.') + '\n');
        else if (line === 'o') ctx.out(stamp() + ' ' + V + ' opening ' + link(url, url) + '\n');
      }
    })();
    return new Promise(function (res, rej) { readLoop.then(res, rej); logLoop.catch(function (e) { stopped = true; rej(e); }); });
  }

  /* ------------------------------------------------------------------ python3 */
  P.python3 = {
    summary: 'Python 3.12 (http.server and a small REPL)',
    complete: function () { return ['-m', 'http.server', '--version', '-c']; },
    run: async function (ctx) {
      var argv = ctx.argv.slice(1), color = colorOn(ctx);
      if (argv[0] === '--version' || argv[0] === '-V') { ctx.out('Python 3.12.3\n'); return 0; }
      if (argv[0] === '-m' && argv[1] === 'http.server') {
        var a = parse(argv.slice(2), ['b', 'bind', 'd', 'directory']), port = parseInt(a.pos[0] || '8000', 10), bind = a.f.b || a.f.bind || '0.0.0.0';
        var dir = a.f.d || a.f.directory ? abs(ctx, a.f.d || a.f.directory) : ctx.cwd;
        var files = []; try { ctx.vfs.walk(dir, function (p, s, d) { if (d > 2) return false; if (s.type === 'file') files.push('/' + relTo(dir, p)); return T.VFS.basename(p)[0] !== '.' || p === dir; }); } catch (e) {}
        var stop = false, wake = null;
        ctx.trap('SIGINT', true);
        ctx.onSignal(function (n) { if (n === 'SIGINT') { stop = true; if (wake) wake(); } });
        var u = 'http://' + bind + ':' + port + '/';
        ctx.out('Serving HTTP on ' + bind + ' port ' + port + ' (' + link(u, u) + ') ...\n');
        var r = rnd(port), paths = ['/'].concat(files.slice(0, 8));
        while (!stop) {
          await new Promise(function (res) { wake = res; ctx.sleep(1500 + Math.floor(r() * 3000)).then(res, res); });
          wake = null;
          if (stop) break;
          var p = paths[Math.floor(r() * paths.length)], d = new Date();
          var ts = two(d.getDate()) + '/' + MON[d.getMonth()] + '/' + d.getFullYear() + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds());
          var code = r() < 0.12 ? 404 : r() < 0.2 ? 304 : 200;
          ctx.err('127.0.0.1 - - [' + ts + '] ' + (color && code === 404 ? sgr('33') : '') + '"GET ' + (code === 404 ? '/favicon.ico' : p) + ' HTTP/1.1" ' + code + ' -' + (color && code === 404 ? R0 : '') + '\n');
        }
        ctx.out('\nKeyboard interrupt received, exiting.\n');
        ctx.trap('SIGINT', false);
        return 0;
      }
      if (argv[0] === '-c') { return pyEval(ctx, argv[1] || '', true); }
      if (argv[0] === '-m') { ctx.err('/usr/bin/python3: No module named ' + argv[1] + '\n'); return 1; }
      if (argv[0]) { ctx.err("python3: can't open file '" + abs(ctx, argv[0]) + "': [Errno 2] No such file or directory\n"); return 2; }
      ctx.out('Python 3.12.3 (main, Sep 11 2024, 14:17:37) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n');
      for (;;) {
        var line = await ctx.readLine('>>> ', {});
        if (/^\s*(exit|quit)\(\)\s*$/.test(line)) return 0;
        if (!line.trim()) continue;
        await pyEval(ctx, line, false);
      }
    }
  };
  async function pyEval(ctx, src, script) {
    src = src.trim();
    var m = /^print\((.*)\)$/.exec(src);
    var expr = m ? m[1] : src;
    var out;
    var sm = /^(["'])(.*)\1$/.exec(expr);
    if (sm) out = sm[2];
    else if (/^[\d\s+\-*/%().]+$/.test(expr)) {
      try { var v = Function('"use strict"; return (' + expr.replace(/\/\//g, '/') + ');')(); out = Number.isInteger(v) ? String(v) : String(+v.toPrecision(15)); }
      catch (e) { ctx.err('  File "<stdin>", line 1\n    ' + src + '\n' + 'SyntaxError: invalid syntax\n'); return 1; }
    } else {
      var id = (/^[A-Za-z_]\w*/.exec(expr) || ['x'])[0];
      ctx.err('Traceback (most recent call last):\n  File "' + (script ? '<string>' : '<stdin>') + '", line 1, in <module>\nNameError: name \'' + id + '\' is not defined\n');
      return 1;
    }
    if (m || !script) ctx.out(m || !sm ? out + '\n' : "'" + out + "'\n");
    return 0;
  }

  /* ------------------------------------------------------------------ make */
  P.make = {
    summary: 'GNU make utility to maintain groups of programs',
    complete: function () { return ['all', 'build', 'test', 'lint', 'bench', 'clean']; },
    run: async function (ctx) {
      var vfs = ctx.vfs, mf = ['GNUmakefile', 'makefile', 'Makefile'].map(function (n) { return ctx.cwd + '/' + n; }).filter(function (p) { return vfs.stat(p); })[0];
      var goals = ctx.argv.slice(1).filter(function (x) { return x[0] !== '-'; });
      if (!mf) { ctx.err(goals.length ? "make: *** No rule to make target '" + goals[0] + "'.  Stop.\n" : 'make: *** No targets specified and no makefile found.  Stop.\n'); return 2; }
      var lines_ = vfs.readText(mf).split('\n'), rules = {}, order = [], cur = null;
      lines_.forEach(function (l, i) {
        var m = /^([A-Za-z0-9_.\-]+)\s*:(?!=)\s*(.*)$/.exec(l);
        if (m) { cur = m[1]; if (cur[0] !== '.') order.push(cur); rules[cur] = { deps: m[2].split(/\s+/).filter(Boolean), cmds: [], line: i + 1 }; }
        else if (/^\t/.test(l) && cur) rules[cur].cmds.push({ cmd: l.slice(1), line: i + 1 });
        else if (!l.trim()) { /* keep */ }
      });
      if (!goals.length) goals = [order[0]];
      var made = {};
      async function build(t) {
        if (made[t]) return 0;
        made[t] = true;
        var r = rules[t];
        if (!r) { if (vfs.stat(ctx.cwd + '/' + t)) return 0; ctx.err("make: *** No rule to make target '" + t + "'.  Stop.\n"); return 2; }
        for (var i = 0; i < r.deps.length; i++) { var c = await build(r.deps[i]); if (c) return c; }
        if (!r.cmds.length && goals.indexOf(t) >= 0 && !r.deps.length) { ctx.out("make: Nothing to be done for '" + t + "'.\n"); return 0; }
        for (var k = 0; k < r.cmds.length; k++) {
          var cmd = r.cmds[k].cmd, silent = cmd[0] === '@';
          if (silent) cmd = cmd.slice(1);
          if (!silent) ctx.out(cmd + '\n');
          var code = await runSub(ctx, splitWords(cmd));
          if (code === null) { ctx.err('make: ' + splitWords(cmd)[0] + ': No such file or directory\n'); code = 127; }
          if (code) { ctx.err('make: *** [' + T.VFS.basename(mf) + ':' + r.cmds[k].line + ': ' + t + '] Error ' + code + '\n'); return 2; }
        }
        return 0;
      }
      for (var g = 0; g < goals.length; g++) { var rc = await build(goals[g]); if (rc) return rc; }
      return 0;
    }
  };

  /* ------------------------------------------------------------------ scripts/deploy.sh */
  P.deploy = {
    summary: 'deploy tastebook-api to stage or production (scripts/deploy.sh)',
    complete: function () { return ['--stage', '--prod', '--skip-build', '--help']; },
    run: async function (ctx) {
      var me = ctx.argv[0] === 'deploy' ? './scripts/deploy.sh' : ctx.argv[0], args = ctx.argv.slice(1), color = colorOn(ctx), tty = ctx.isatty !== false;
      var target = '', skip = false;
      for (var i = 0; i < args.length; i++) {
        if (args[i] === '--stage') target = 'stage'; else if (args[i] === '--prod') target = 'prod'; else if (args[i] === '--skip-build') skip = true;
        else if (args[i] === '-h' || args[i] === '--help') { ctx.out('# Deploys tastebook-api to stage or production.\n# Usage: ./scripts/deploy.sh --stage | --prod [--skip-build]\n'); return 0; }
        else { ctx.err('unknown option: ' + args[i] + '\n'); return 2; }
      }
      if (!target) { ctx.err('usage: ' + me + ' --stage|--prod\n'); return 2; }
      var repo = ctx.vfs.repoFor ? ctx.vfs.repoFor(ctx.cwd) : null;
      var rev = repo ? short(headCommit(repo).hash) : '9c1e2f4', host = target + '.tastebook.dev', t0 = Date.now();
      var overall = function (step, frac) { return progress(1, ((step - 1) + frac) * 20); };
      var step = function (n, s) { ctx.out((color ? sgr('1;34') + '[' + n + '/5]' + R0 : '[' + n + '/5]') + ' ' + s + '\n' + overall(n, 0)); };
      if (target === 'prod') {
        var ans = await ctx.readLine('Deploy ' + rev + ' to production? [y/N] ', {});
        if (!/^y(es)?$/i.test(ans.trim())) { ctx.out('aborted\n'); return 1; }
      }
      var spinFor = async function (label, ms, n) {
        var steps_ = Math.max(1, Math.round(ms / 90));
        for (var k = 0; k < steps_; k++) { if (tty) ctx.out('\r' + CSI + 'K      ' + SPIN[k % SPIN.length] + ' ' + label + overall(n, k / steps_)); await ctx.sleep(90); }
        if (tty) ctx.out('\r' + CSI + 'K');
      };
      if (tty) ctx.out(CSI + '?25l');
      step(1, 'Checking working tree');
      await spinFor('git diff --quiet', 700, 1);
      if (repo && ctx.vfs.gitStatus(repo).some(function (r) { return r.work === 'M' || r.index === 'M'; })) ctx.out((color ? sgr('33') : '') + 'warning: uncommitted changes are not deployed' + (color ? R0 : '') + '\n');
      step(2, 'Building release');
      if (!skip) {
        var proj = cargoProject(ctx);
        if (proj) {
          ctx.out(cargoStatus(color, 'Compiling', proj.name + ' v' + proj.ver + ' (' + proj.root + ')') + '\n');
          await spinFor('rustc --edition=2021 --crate-name ' + proj.name.replace(/-/g, '_') + ' -C opt-level=3 -C lto=thin', 3200, 2);
          ctx.out(cargoStatus(color, 'Finished', '`release` profile [optimized] target(s) in 3.41s') + '\n');
        }
      }
      step(3, 'Running migrations on ' + target);
      await spinFor('sqlx migrate run', 1300, 3);
      ctx.vfs.deployState = ctx.vfs.deployState || {};
      if (!ctx.vfs.deployState[target]) { ctx.out('Applied 20261005/migrate media hash unique (14.212ms)\n'); ctx.vfs.deployState[target] = true; }
      step(4, 'Uploading artifacts');
      ctx.out('uploading 14 assets' + CH.ell + '\n');
      var uploads = [['tastebook-api', 25.6, 6800], ['static/ (14 files)', 3.2, 1600]];
      for (var u = 0; u < uploads.length; u++) {
        var up = uploads[u], ticks = Math.round(up[2] / 120), bw = 24;
        for (var k = 0; k <= ticks; k++) {
          var fr = k / ticks, full = Math.round(fr * bw), sent = up[1] * fr, rate = 3.6 + Math.sin(k / 3) * 0.6;
          var line = '      ' + pad(up[0], 20) + ' ' + (color ? sgr('32') : '') + CH.full.repeat(full) + (color ? sgr('90') : '') + CH.light.repeat(bw - full) + (color ? R0 : '') + ' ' + lpad(Math.round(fr * 100) + '%', 4) + '  ' + lpad(sent.toFixed(1), 4) + '/' + up[1].toFixed(1) + ' MiB  ' + rate.toFixed(1) + ' MiB/s';
          if (tty) ctx.out('\r' + CSI + 'K' + cut(line, ctx.size().cols - 1) + overall(4, (u + fr) / uploads.length));
          await ctx.sleep(120);
        }
        if (tty) ctx.out('\n'); else ctx.out('      ' + up[0] + ' 100%\n');
      }
      step(5, 'Health check');
      ctx.out('      restarting tastebook-api on ' + host + '\n');
      await spinFor('ssh deploy@' + host + ' systemctl restart tastebook-api', 1900, 5);
      await spinFor('curl -fsS http://127.0.0.1:8080/healthz', 900, 5);
      ctx.out('      ' + (color ? sgr('32') + 'ok' + R0 : 'ok') + ' (200, 84 ms)\n');
      ctx.out((color ? sgr('1;32') : '') + 'deployed ' + rev + ' to ' + target + (color ? R0 : '') + ' in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's\n' + progress(0));
      if (tty) ctx.out(CSI + '?25h');
      return 0;
    }
  };
  /* a command word with a slash (./scripts/deploy.sh) resolves through the VFS: { prog } or { error } or null */
  T.resolveProgram = function (vfs, cwd, word) {
    if (!word || word.indexOf('/') < 0 || !vfs) return null;
    var p = vfs.resolve(cwd, word), st = vfs.stat(p);
    if (!st) return { error: 'no such file or directory' };
    if (st.type === 'dir' || !(st.mode & 73)) return { error: 'permission denied' };
    if (st.exec && P[st.exec]) return { prog: P[st.exec] };
    var base = T.VFS.basename(p);
    if (P[base]) return { prog: P[base] };
    return { error: 'exec format error' };
  };
  function shellProg(name) {
    return {
      summary: name === 'bash' ? 'GNU Bourne-Again SHell' : 'command interpreter (dash)',
      run: async function (ctx) {
        var args = ctx.argv.slice(1);
        if (args[0] === '--version') { ctx.out('GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)\n'); return 0; }
        if (args[0] === '-c') { var c = await runSub(ctx, splitWords(args[1] || '')); if (c === null) { ctx.err(name + ': line 1: ' + splitWords(args[1] || '')[0] + ': command not found\n'); return 127; } return c; }
        if (args[0]) {
          var p = abs(ctx, args[0]), st = ctx.vfs.stat(p);
          if (!st) { ctx.err(name + ': ' + args[0] + ': No such file or directory\n'); return 127; }
          if (st.exec && P[st.exec]) return runSub(ctx, [st.exec].concat(args.slice(1)));
          return 0;
        }
        return ctx.subshell({ host: hostOf(ctx), user: userOf(ctx), vfs: ctx.vfs, remote: !!ctx.remote, cwd: ctx.cwd });
      }
    };
  }
  P.bash = shellProg('bash');
  P.sh = shellProg('sh');

  /* ------------------------------------------------------------------ htop */
  var PROCS = [
    [1, 0, 'root', '/sbin/init splash', 0, 12, 166], [412, 1, 'root', '/usr/lib/systemd/systemd-journald', 0.1, 48, 90],
    [655, 1, 'root', 'sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups', 0, 9, 15],
    [802, 1, 'postgres', '/usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main', 0.3, 31, 220],
    [811, 802, 'postgres', 'postgres: 16/main: checkpointer', 0, 8, 220], [812, 802, 'postgres', 'postgres: 16/main: walwriter', 0.1, 6, 220],
    [814, 802, 'postgres', 'postgres: 16/main: tastebook tastebook 127.0.0.1(51322) idle', 1.2, 22, 224],
    [1021, 1, 'jared', '/usr/lib/systemd/systemd --user', 0, 11, 20], [1388, 1021, 'jared', '/opt/puppet-master/puppet-master --profile default', 6.5, 612, 4210],
    [1402, 1388, 'jared', '/usr/bin/zsh -l', 0, 8, 14], [-1, 1402, 'jared', 'htop', 1.0, 6, 12],
    [2210, 1388, 'jared', '/home/jared/.cargo/bin/rust-analyzer', 3.2, 1480, 2850], [2231, 2210, 'jared', '/home/jared/.rustup/toolchains/1.82.0/libexec/rust-analyzer-proc-macro-srv', 0.2, 48, 120],
    [2275, 1388, 'jared', 'node /home/jared/tastebook/node_modules/.bin/vite web', 1.4, 188, 1090], [2290, 2275, 'jared', '/home/jared/tastebook/node_modules/@esbuild/linux-x64/bin/esbuild --service=0.24.0 --ping', 0.3, 34, 1240],
    [1433, 1021, 'jared', '/usr/bin/pipewire', 0.2, 18, 120], [1460, 1021, 'jared', '/usr/bin/gnome-keyring-daemon --foreground --components=pkcs11,secrets', 0, 9, 380],
    [3001, 1, 'root', '/usr/sbin/cron -f -P', 0, 3, 8], [3022, 1, 'root', '/usr/lib/snapd/snapd', 0.1, 38, 1900],
    [3110, 1, 'root', '/usr/bin/containerd', 0.4, 52, 1980], [3180, 1, 'root', '/usr/sbin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock', 0.2, 88, 2600],
    [3301, 1, 'root', '/usr/sbin/rsyslogd -n -iNONE', 0, 6, 222], [3390, 1, 'root', '/usr/sbin/NetworkManager --no-daemon', 0.1, 21, 330]
  ];
  P.htop = {
    summary: 'interactive process viewer (q, F10 or Ctrl+C quits)',
    run: async function (ctx) {
      if (ctx.isatty === false) { ctx.err('Error opening terminal: unknown.\n'); return 1; }
      var r = rnd(4242), selfPid = 48211, tree = true, sortKey = 'cpu', sel = 0, scroll = 0, quit = false, uptime = 274375;
      var cpus = [], load = [0.82, 0.71, 0.66], memUsed = 9.21, totalMem = 15.61;
      for (var c = 0; c < 8; c++) cpus.push({ n: 8 + r() * 20, k: 2 + r() * 6, l: r() * 3 });
      var procs = PROCS.map(function (p) { return { pid: p[0] < 0 ? selfPid : p[0], ppid: p[1], user: p[2], cmd: p[3], base: p[4], cpu: p[4], res: p[5], virt: p[6], shr: Math.max(2, Math.round(p[5] * 0.3)), time: Math.round(p[4] * 400000 + r() * 3000), s: 'S', pri: 20, ni: 0 }; });
      procs.forEach(function (p) { if (p.user === 'postgres') p.pri = 20; if (p.cmd === '/usr/bin/pipewire') { p.pri = 9; p.ni = -11; } });
      var byPid = {}; procs.forEach(function (p) { byPid[p.pid] = p; });
      function order() {
        if (!tree) return procs.slice().sort(function (a, b) { return sortKey === 'mem' ? b.res - a.res : b.cpu - a.cpu || a.pid - b.pid; }).map(function (p) { return { p: p, prefix: '' }; });
        var out = [];
        (function walk(ppid, prefix) {
          var kids = procs.filter(function (p) { return p.ppid === ppid; }).sort(function (a, b) { return a.pid - b.pid; });
          kids.forEach(function (k, i) {
            var last = i === kids.length - 1;
            out.push({ p: k, prefix: ppid === 0 ? '' : prefix + (last ? CH.bl : CH.lt) + CH.h + ' ' });
            walk(k.pid, ppid === 0 ? '' : prefix + (last ? '   ' : CH.v + '  '));
          });
        })(0, '');
        return out;
      }
      function tick() {
        cpus.forEach(function (x) { x.n = Math.max(1, Math.min(85, x.n + (r() - 0.5) * 14)); x.k = Math.max(0.5, Math.min(15, x.k + (r() - 0.5) * 3)); x.l = Math.max(0, Math.min(6, x.l + (r() - 0.5) * 2)); });
        procs.forEach(function (p) { p.cpu = Math.max(0, p.base + (r() - 0.45) * (p.base > 1 ? p.base : 0.6)); p.time += Math.round(p.cpu); p.s = p.cpu > 2.5 && r() < 0.5 ? 'R' : 'S'; });
        byPid[selfPid].s = 'R';
        memUsed = Math.max(8.6, Math.min(10.4, memUsed + (r() - 0.5) * 0.08));
        load = load.map(function (v, i) { return Math.max(0.2, v + (r() - 0.5) * 0.1 / (i + 1)); });
        uptime++;
      }
      function memStr(mb) { if (mb >= 1000) return (mb / 1024).toFixed(1) + 'G'; return Math.round(mb) + 'M'; }
      function memCol(mb, w) { var s = lpad(memStr(mb), w); return mb >= 1000 ? sgr('32') + s + R0 : s.replace(/(\d+)M$/, function (_, d) { return sgr('36') + d + R0 + 'M'; }); }
      function timeStr(cs) { var s = Math.floor(cs / 100), m = Math.floor(s / 60), h = Math.floor(m / 60); return h ? h + 'h' + two(m % 60) + ':' + two(s % 60) : m + ':' + two(s % 60) + '.' + two(cs % 100); }
      function meter(label, lw, w, parts, text) {
        var inner = Math.max(4, w - lw - 2), bar = '', used = 0;
        parts.forEach(function (pt) { var n = Math.round(pt[0] * inner); n = Math.min(n, inner - used); bar += sgr(pt[1]) + '|'.repeat(n) + R0; used += n; });
        var t = cut(text, inner), gap = inner - used - t.length;
        if (gap < 0) { bar = ''; used = 0; var keep = inner - t.length; parts.forEach(function (pt) { var n = Math.min(Math.round(pt[0] * inner), keep - used); if (n > 0) { bar += sgr(pt[1]) + '|'.repeat(n) + R0; used += n; } }); gap = inner - used - t.length; }
        return sgr('36') + lpad(label, lw) + R0 + sgr('1') + '[' + R0 + bar + ' '.repeat(Math.max(0, gap)) + sgr('2') + t + R0 + sgr('1') + ']' + R0;
      }
      function info(label, value) { return sgr('36') + label + R0 + value; }
      var h = {};
      h.draw = function () {
        var sz = ctx.size(), W = sz.cols, H = sz.rows, lines = [];
        var colW = Math.floor((W - 1) / 2), compact = H < 16 || W < 50;
        var cpuMeter = function (i, lw) { var x = cpus[i]; return meter(String(i), lw, colW, [[x.l / 100, '34'], [x.n / 100, '32'], [x.k / 100, '31']], (x.n + x.k + x.l).toFixed(1) + '%'); };
        var mem = meter('Mem', 3, colW, [[memUsed / totalMem * 0.82, '32'], [0.04, '34'], [0.09, '33']], memUsed.toFixed(2) + 'G/' + totalMem.toFixed(1) + 'G');
        var swp = meter('Swp', 3, colW, [[0.013, '31']], '52.0M/4.00G');
        var tasks = info('Tasks: ', sgr('1') + '214' + R0 + ', ' + sgr('1;32') + '1012' + R0 + ' thr, ' + sgr('1') + '0' + R0 + ' kthr; ' + sgr('1;32') + '3' + R0 + ' running');
        var la = info('Load average: ', sgr('1') + load[0].toFixed(2) + R0 + ' ' + load[1].toFixed(2) + ' ' + load[2].toFixed(2));
        var up = Math.floor(uptime), ut = info('Uptime: ', sgr('1') + Math.floor(up / 86400) + ' days, ' + two(Math.floor(up % 86400 / 3600)) + ':' + two(Math.floor(up % 3600 / 60)) + ':' + two(up % 60) + R0);
        var left, right;
        if (compact) {
          var avg = cpus.reduce(function (s, x) { return s + x.n + x.k + x.l; }, 0) / cpus.length;
          left = [meter('CPU', 3, colW, [[avg * 0.75 / 100, '32'], [avg * 0.25 / 100, '31']], avg.toFixed(1) + '%'), mem];
          right = [tasks, la];
          if (W < 50) { left = [meter('CPU', 3, W - 1, [[avg * 0.75 / 100, '32'], [avg * 0.25 / 100, '31']], avg.toFixed(1) + '%')]; right = []; }
        } else {
          left = [cpuMeter(0, 3), cpuMeter(1, 3), cpuMeter(2, 3), cpuMeter(3, 3), mem, swp];
          right = [cpuMeter(4, 3), cpuMeter(5, 3), cpuMeter(6, 3), cpuMeter(7, 3), tasks, la, ut];
        }
        for (var i = 0; i < Math.max(left.length, right.length); i++) lines.push(' ' + pad(left[i] || '', colW) + (right[i] ? ' ' + right[i] : ''));
        lines.push('');
        var hdrCols = [['PID', 7, 'r'], ['USER', 9, 'l'], ['PRI', 3, 'r'], ['NI', 3, 'r'], ['VIRT', 5, 'r'], ['RES', 5, 'r'], ['SHR', 5, 'r'], ['S', 1, 'l'], ['CPU%', 5, 'r'], ['MEM%', 5, 'r'], ['TIME+', 9, 'r'], ['Command', 0, 'l']];
        var hdr = hdrCols.map(function (c2) {
          var t = c2[2] === 'r' ? lpad(c2[0], c2[1]) : c2[1] ? pad(c2[0], c2[1]) : c2[0];
          var on = (sortKey === 'cpu' && c2[0] === 'CPU%' && !tree) || (sortKey === 'mem' && c2[0] === 'MEM%' && !tree);
          return on ? sgr('30;46') + t.slice(0, -1) + CH.tri + sgr('30;42') : t;
        }).join(' ');
        lines.push(sgr('30;42') + pad(width(hdr) > W ? cut(strip(hdr), W) : hdr, W) + R0);
        var list = order(), area = Math.max(1, H - lines.length - 1);
        sel = Math.max(0, Math.min(sel, list.length - 1));
        if (sel < scroll) scroll = sel; if (sel >= scroll + area) scroll = sel - area + 1;
        h.rowTop = lines.length; h.area = area; h.count = list.length;
        for (var k = 0; k < area; k++) {
          var it = list[scroll + k];
          if (!it) { lines.push(''); continue; }
          var p = it.p, isSel = scroll + k === sel;
          var cmd = p.cmd, m2 = /^(\S*\/)?([^\/\s]+)(.*)$/.exec(cmd), cmdS = m2 ? (m2[1] || '') + (isSel ? '' : sgr('1')) + m2[2] + (isSel ? '' : R0) + m2[3] : cmd;
          var memPct = (p.res / (totalMem * 1024) * 100);
          var row = lpad(String(p.pid), 7) + ' ' + pad(p.user, 9) + ' ' + lpad(String(p.pri), 3) + ' ' + lpad(String(p.ni), 3) + ' ' +
            (isSel ? lpad(memStr(p.virt), 5) + ' ' + lpad(memStr(p.res), 5) : memCol(p.virt, 5) + ' ' + memCol(p.res, 5)) + ' ' + lpad(memStr(p.shr), 5) + ' ' +
            (p.s === 'R' && !isSel ? sgr('1;32') + 'R' + R0 : p.s) + ' ' + lpad(p.cpu.toFixed(1), 5) + ' ' + lpad(memPct.toFixed(1), 5) + ' ' + lpad(timeStr(p.time), 9) + ' ' +
            (isSel ? '' : sgr('2')) + it.prefix + (isSel ? '' : R0) + cmdS;
          if (isSel) { var plain = strip(row); lines.push(sgr('30;46') + pad(cut(plain, W), W) + R0); }
          else lines.push(row);
        }
        var keys = [['F1', 'Help'], ['F2', 'Setup'], ['F3', 'Search'], ['F4', 'Filter'], ['F5', tree ? 'List' : 'Tree'], ['F6', 'SortBy'], ['F7', 'Nice -'], ['F8', 'Nice +'], ['F9', 'Kill'], ['F10', 'Quit']];
        var foot = '', fw = 0;
        keys.forEach(function (kk, ki) { var lab = ki === keys.length - 1 ? kk[1] : pad(kk[1], 6); if (fw + kk[0].length + lab.length > W) return; foot += R0 + kk[0] + sgr('30;46') + lab; fw += kk[0].length + lab.length; });
        foot += sgr('30;46') + ' '.repeat(Math.max(0, W - fw)) + R0;
        while (lines.length < H - 1) lines.push('');
        lines = lines.slice(0, H - 1); lines.push(foot);
        var out = SYNC_ON;
        lines.forEach(function (l, i) {
          var w = width(l);
          if (w > W) { l = cut(strip(l), W); w = W; }
          out += CSI + (i + 1) + ';1H' + l + R0 + (w < W ? CSI + 'K' : '');
        });
        ctx.out(out + SYNC_OFF);
      };
      h.ms = 1000;
      h.tick = tick;
      h.key = function (k) {
        if (quit) return false;
        var mm = /^\u001b\[<(\d+);(\d+);(\d+)([Mm])$/.exec(k);
        if (mm) {
          var b = +mm[1], y = +mm[3] - 1;
          if (b === 64) sel -= 3; else if (b === 65) sel += 3;
          else if (b === 0 && mm[4] === 'M' && y >= h.rowTop && y < h.rowTop + h.area) sel = scroll + (y - h.rowTop);
          return true;
        }
        switch (k) {
          case 'q': case 'Q': case CSI + '21~': case '\u0003': return false;
          case CSI + 'A': case ESC + 'OA': sel--; break;
          case CSI + 'B': case ESC + 'OB': sel++; break;
          case CSI + '5~': sel -= h.area; break;
          case CSI + '6~': sel += h.area; break;
          case CSI + 'H': case CSI + '1~': case ESC + 'OH': sel = 0; break;
          case CSI + 'F': case CSI + '4~': case ESC + 'OF': sel = h.count - 1; break;
          case 't': case CSI + '15~': tree = !tree; sel = 0; break;
          case 'P': tree = false; sortKey = 'cpu'; break;
          case 'M': tree = false; sortKey = 'mem'; break;
          case CSI + '17~': case '>': tree = false; sortKey = sortKey === 'cpu' ? 'mem' : 'cpu'; break;
        }
        return true;
      };
      ctx.setRaw(true);
      ctx.trap('SIGINT', true);
      ctx.onSignal(function (n) { if (n === 'SIGINT' || n === 'SIGTERM') { quit = true; h.done = true; if (h.wake) h.wake(); } });
      ctx.out(CSI + '?1049h' + CSI + '?25l' + CSI + '?1000h' + CSI + '?1006h' + CSI + 'H' + CSI + '2J');
      try { await loop(ctx, h); }
      finally { ctx.out(CSI + '?1006l' + CSI + '?1000l' + CSI + '?25h' + CSI + '?1049l'); ctx.setRaw(false); ctx.trap('SIGINT', false); }
      return 0;
    }
  };
  P.top = P.htop;

  /* ------------------------------------------------------------------ colortest */
  function hsl(h, s, l) {
    var a = s * Math.min(l, 1 - l), f = function (n) { var k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return [f(0), f(8), f(4)];
  }
  P.colortest = {
    summary: 'show the 16 colours, the 256 palette, truecolor and every text style',
    run: async function (ctx) {
      var W = Math.max(40, ctx.size().cols), out = '', H = function (s) { return '\n' + sgr('1') + s + R0 + '\n'; };
      var names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
      out += H('16 colours');
      var sw = W >= 66 ? 8 : 5;
      [0, 8].forEach(function (base) {
        var row = '  ';
        for (var i = 0; i < 8; i++) { var n = base + i, fg = n === 0 || n === 8 ? '97' : '30'; row += sgr((base ? '10' : '4') + i + ';' + fg) + pad(' ' + n, sw) + R0; }
        out += row + '\n';
      });
      var fgRow = '  ', fgRowB = '  ';
      for (var i = 0; i < 8; i++) { fgRow += sgr('3' + i) + pad(names[i], sw) + R0; fgRowB += sgr('9' + i) + pad(names[i].slice(0, sw - 1), sw) + R0; }
      out += fgRow + '\n' + fgRowB + '\n';
      out += H('256 colours: the 6x6x6 cube and the grey ramp');
      var cw = W >= 80 ? 2 : 1;
      for (var g = 0; g < 6; g++) {
        var line = '  ';
        for (var r = 0; r < 6; r++) { for (var b = 0; b < 6; b++) line += sgr('48;5;' + (16 + 36 * r + 6 * g + b)) + ' '.repeat(cw); line += R0 + (r < 5 && cw > 1 ? ' ' : ''); }
        out += line + R0 + '\n';
      }
      var greys = '  ';
      for (var gr = 232; gr < 256; gr++) greys += sgr('48;5;' + gr) + ' '.repeat(cw === 2 ? 3 : 1);
      out += greys + R0 + '\n';
      out += H('truecolor (24-bit)');
      var tw = W - 4;
      [[0.78, 0.66], [0.54, 0.42]].forEach(function (pair) {
        var l2 = '  ';
        for (var x = 0; x < tw; x++) { var hh = x / tw * 360, t = hsl(hh, 0.85, pair[0]), bb = hsl(hh, 0.85, pair[1]); l2 += sgr('38;2;' + t.join(';') + ';48;2;' + bb.join(';')) + CH.upper; }
        out += l2 + R0 + '\n';
      });
      var ramp = '  ';
      for (var x2 = 0; x2 < tw; x2++) { var v = Math.round(x2 / (tw - 1) * 255); ramp += sgr('48;2;' + v + ';' + v + ';' + v) + ' '; }
      out += ramp + R0 + '\n';
      out += H('text styles');
      var sample = 'The quick brown fox jumps over the lazy dog';
      var styles = [
        ['bold', '1'], ['dim', '2'], ['italic', '3'], ['bold italic', '1;3'], ['underline', '4'], ['double underline', '4:2'],
        ['curly underline, red', '4:3;58:2::235:80:80'], ['curly underline, palette 33', '4:3;58:5:33'], ['dotted underline', '4:4;58:2::120:200:120'],
        ['dashed underline', '4:5;58:2::230:170:60'], ['overline', '53'], ['strikethrough', '9'], ['inverse', '7'], ['blink', '5'], ['invisible (select it)', '8']
      ];
      styles.forEach(function (s) { out += '  ' + pad(s[0], 30) + sgr(s[1]) + cut(sample, Math.max(10, W - 34)) + R0 + '\n'; });
      out += '  ' + pad('hyperlink (OSC 8)', 30) + link('https://sw.kovidgoyal.net/kitty/underlines/', sgr('34;4') + 'kitty: colored and styled underlines' + R0) + '\n';
      out += '  ' + pad('error squiggle', 30) + 'let x = ' + sgr('4:3;58:2::235:80:80') + 'pool' + R0 + '.begin();' + '\n';
      ctx.out(out.replace(/^\n/, ''));
      return 0;
    }
  };

  /* ------------------------------------------------------------------ unicode-test */
  P['unicode-test'] = {
    summary: 'wide and combining characters, emoji sequences, box drawing, blocks, braille, powerline, sextants',
    run: async function (ctx) {
      var W = Math.max(40, ctx.size().cols), out = '', H = function (s) { return '\n' + sgr('1') + s + R0 + '\n'; };
      var range = function (a, b) { var s = ''; for (var c = a; c <= b; c++) s += U(c); return s; };
      out += H('CJK (two cells each)');
      var cjk = U(0x65e5, 0x672c, 0x8a9e, 0x306e, 0x30c6, 0x30ad, 0x30b9, 0x30c8) + ' ' + U(0x4e2d, 0x6587) + ' ' + U(0xd55c, 0xad6d, 0xc5b4);
      out += '  |' + cjk + '|\n  |' + '-'.repeat(width(cjk)) + '|\n';
      out += H('combining marks');
      out += '  caf' + U(0xe9) + ' / cafe' + U(0x301) + '   n' + U(0x303) + ' o' + U(0x302) + ' a' + U(0x308) + ' u' + U(0x30a) + '   Z' + U(0x351, 0x315) + 'a' + U(0x306) + 'l' + U(0x300) + 'g' + U(0x303) + 'o' + U(0x352) + '\n';
      out += H('emoji and ZWJ sequences');
      var Z = 0x200d;
      var emo = [U(0x1f468, Z, 0x1f469, Z, 0x1f467, Z, 0x1f466), U(0x1f9d1, Z, 0x1f4bb), U(0x1f3f3, 0xfe0f, Z, 0x1f308), U(0x1f44d, 0x1f3fd), U(0x2764, 0xfe0f, Z, 0x1f525), U(0x1f1ec, 0x1f1e7), U(0x2728)];
      out += '  ' + emo.map(function (e) { return '|' + e + '|'; }).join(' ') + '\n';
      out += H('box drawing: light, heavy, double, rounded');
      var sets = [[0x250c, 0x2500, 0x252c, 0x2510, 0x2502, 0x251c, 0x253c, 0x2524, 0x2514, 0x2534, 0x2518], [0x250f, 0x2501, 0x2533, 0x2513, 0x2503, 0x2523, 0x254b, 0x252b, 0x2517, 0x253b, 0x251b],
        [0x2554, 0x2550, 0x2566, 0x2557, 0x2551, 0x2560, 0x256c, 0x2563, 0x255a, 0x2569, 0x255d], [0x256d, 0x2500, 0x252c, 0x256e, 0x2502, 0x251c, 0x253c, 0x2524, 0x2570, 0x2534, 0x256f]];
      var rowsB = ['', '', '', '', ''];
      sets.forEach(function (s) {
        var q = function (i) { return U(s[i]); }, hz = q(1) + q(1) + q(1);
        rowsB[0] += '  ' + q(0) + hz + q(2) + hz + q(3); rowsB[1] += '  ' + q(4) + '   ' + q(4) + '   ' + q(4);
        rowsB[2] += '  ' + q(5) + hz + q(6) + hz + q(7); rowsB[3] += '  ' + q(4) + '   ' + q(4) + '   ' + q(4);
        rowsB[4] += '  ' + q(8) + hz + q(9) + hz + q(10);
      });
      out += rowsB.join('\n') + '\n';
      out += '  ' + range(0x2571, 0x2573) + '  ' + range(0x2574, 0x257f) + '\n';
      out += H('blocks and shades');
      out += '  ' + range(0x2580, 0x259f) + '\n  ' + range(0x2581, 0x2588) + ' ' + U(0x2588, 0x2589, 0x258a, 0x258b, 0x258c, 0x258d, 0x258e, 0x258f) + '  ' + U(0x2591, 0x2592, 0x2593, 0x2588) + '\n';
      out += H('braille');
      for (var b0 = 0x2800; b0 < 0x2900; b0 += 64) out += '  ' + cut(range(b0, b0 + 63), W - 4) + '\n';
      out += H('powerline (U+E0B0 to U+E0B3)');
      out += '  ' + sgr('30;44') + ' ~/tastebook/api ' + sgr('34;42') + U(0xe0b0) + sgr('30;42') + ' main ' + sgr('32;49') + U(0xe0b0) + R0 + '  ' + U(0xe0b1) + ' ' + U(0xe0b3) + '  ' +
        sgr('33;49') + U(0xe0b2) + sgr('30;43') + ' 0:42 ' + R0 + '\n';
      out += H('sextants (U+1FB00 to U+1FB3B)');
      var sx = range(0x1fb00, 0x1fb3b);
      out += '  ' + (W - 4 >= 60 ? sx : sx.slice(0, 60) + '\n  ' + sx.slice(60)) + '\n';
      ctx.out(out.replace(/^\n/, ''));
      return 0;
    }
  };

  /* ------------------------------------------------------------------ kitty graphics helpers */
  function apc(keys, payload) { return ESC + '_G' + keys + (payload ? ';' + payload : '') + ST; }
  /* base64 split into 4096-byte chunks: the first carries every key, the rest only m (and `cont`, e.g. a=f) */
  function chunked(keys, data64, cont) {
    if (data64.length <= 4096) return apc(keys, data64);
    var out = '';
    for (var i = 0; i < data64.length; i += 4096) {
      var more = i + 4096 < data64.length ? 1 : 0;
      out += apc((i === 0 ? keys + ',' : (cont ? cont + ',' : '')) + 'm=' + more, data64.slice(i, i + 4096));
    }
    return out;
  }
  var KITTY_REPLY = /\u001b_G([^;\u001b]*);([^\u001b]*)\u001b\\/g;
  function kittyReplies(s) { var out = {}, m; KITTY_REPLY.lastIndex = 0; while ((m = KITTY_REPLY.exec(s || ''))) { var id = (/(?:^|,)i=(\d+)/.exec(m[1]) || [])[1]; out[id || '?'] = m[2]; } return out; }
  /* ask whether the terminal speaks kitty graphics, and which media it accepts */
  async function kittyDetect(ctx, media) {
    var q = apc('i=31,s=1,v=1,a=q,t=d,f=24', 'AAAA'), tmp = null, shm = null, vfs = ctx.vfs;
    if (media) {
      tmp = '/tmp/tty-graphics-protocol-' + Math.random().toString(36).slice(2, 10);
      shm = '/tty-graphics-protocol-' + Math.random().toString(36).slice(2, 10);
      try { vfs.write(tmp, new Uint8Array([0, 0, 0])); q += apc('i=32,s=1,v=1,a=q,t=t,f=24', b64(tmp)); } catch (e) { tmp = null; }
      try { vfs.shm.create(shm, new Uint8Array([0, 0, 0])); q += apc('i=33,s=1,v=1,a=q,t=s,f=24', b64(shm)); } catch (e) { shm = null; }
    }
    var reply = await ctx.query(q + CSI + 'c', { until: /\u001b\[\?[\d;]*c/, timeout: 1500 });
    if (tmp && vfs.lstat(tmp)) { try { vfs.unlink(tmp); } catch (e) {} }
    if (shm) { try { vfs.shm.unlink(shm); } catch (e) {} }
    var r = kittyReplies(reply);
    return { direct: r['31'] === 'OK', file: r['32'] === 'OK', memory: r['33'] === 'OK', raw: reply };
  }

  P.fastfetch = {
    summary: 'system information beside the Puppet Master logo',
    run: async function (ctx) {
      var color = colorOn(ctx), remote = !!ctx.remote || (ctx.vfs && ctx.vfs.host !== 'nas1'), user = userOf(ctx), host = hostOf(ctx);
      var K = function (k, v) { return (color ? sgr('1;34') + k + R0 : k) + ': ' + v; };
      var pctC = function (p) { return color ? sgr(p < 60 ? '32' : p < 80 ? '33' : '31') + p + '%' + R0 : p + '%'; };
      var info = [(color ? sgr('1;34') + user + R0 + '@' + sgr('1;34') + host + R0 : user + '@' + host), '-'.repeat(user.length + host.length + 1),
        K('OS', remote ? 'Ubuntu 22.04.5 LTS x86_64' : 'Ubuntu 24.04.1 LTS x86_64'), K('Host', 'KVM/QEMU Standard PC (Q35 + ICH9, 2009)'),
        K('Kernel', remote ? 'Linux 5.15.0-122-generic' : 'Linux 6.8.0-45-generic'), K('Uptime', remote ? '12 days, 2 hours, 41 mins' : '3 days, 4 hours, 12 mins'),
        K('Packages', remote ? '942 (dpkg)' : '1873 (dpkg), 12 (snap)'), K('Shell', remote ? 'bash 5.1.16' : 'zsh 5.9')];
      if (!remote) info.push(K('Display (Virtual-1)', '2560x1440 @ 60 Hz'));
      info.push(K('Terminal', remote ? 'sshd' : 'PuppetMaster ' + (T.VERSION || '0.4.0')), K('CPU', 'Intel(R) Core(TM) i7-8700 (8) @ 3.20 GHz'));
      if (!remote) info.push(K('GPU', 'Red Hat, Inc. Virtio 1.0 GPU'));
      info.push(K('Memory', (remote ? '2.41 GiB / 7.75 GiB (' + pctC(31) : '9.21 GiB / 15.61 GiB (' + pctC(59)) + ')'),
        K('Disk (/)', (remote ? '61.02 GiB / 97.87 GiB (' + pctC(62) : '212.40 GiB / 467.89 GiB (' + pctC(45)) + ') - ext4'),
        K('Local IP (enp1s0)', remote ? '192.168.50.42/24' : '192.168.50.136/24'), K('Locale', 'en_US.UTF-8'), '');
      var blocks = ['', ''];
      for (var i = 0; i < 8; i++) { blocks[0] += sgr('4' + i) + '   '; blocks[1] += sgr('10' + i) + '   '; }
      info.push(blocks[0] + R0, blocks[1] + R0);
      var det = ctx.isatty !== false ? await kittyDetect(ctx, false) : { direct: false };
      var out = '';
      if (det.direct) {
        var cols = 20, rows = 10, bytes = await assets(ctx).png('logo', 256, 256);
        out += chunked('a=T,f=100,t=d,c=' + cols + ',r=' + rows + ',C=1,q=2', b64(bytes));
        info.forEach(function (l) { out += CSI + (cols + 3) + 'C' + l + '\n'; });
        for (var k = info.length; k < rows; k++) out += '\n';
      } else {
        var art = [
          '      ___      ', ' o====[+]====o ', ' |     |     | ', ' |   --+--   | ', ' :     :     : ', ' :     :     : ', ' *     @     * ', '               '
        ];
        info.forEach(function (l, j) { var a = art[j] || ' '.repeat(15); out += (color ? sgr(j < 4 ? '1;35' : '36') + a + R0 : a) + '   ' + l + '\n'; });
      }
      ctx.out(out);
      return 0;
    }
  };
  P.neofetch = P.fastfetch;

  /* systemctl: enough for the agent demo (restart needs root, so it runs under sudo) */
  var UNITS = { tastebook: { desc: 'Tastebook API (axum)', pid: 48211, active: true, since: 'Fri 2026-10-09 18:42:07 UTC' },
    postgresql: { desc: 'PostgreSQL RDBMS', pid: 1187, active: true, since: 'Thu 2026-10-08 09:14:52 UTC' } };
  P.systemctl = {
    summary: 'control the system service manager (status, start, stop, restart)',
    complete: function (args) { return args.length <= 1 ? ['status', 'start', 'stop', 'restart', 'is-active'] : Object.keys(UNITS); },
    run: async function (ctx) {
      var verb = ctx.argv[1], name = String(ctx.argv[2] || '').replace(/\.service$/, ''), u = UNITS[name];
      var root = ctx.env.USER === 'root' || ctx.env.SUDO_USER;
      if (!verb) { ctx.out('systemctl: missing verb\n'); return 1; }
      if (!u) { ctx.out('Unit ' + (name || '(none)') + '.service could not be found.\n'); return verb === 'status' ? 4 : 5; }
      if (verb === 'is-active') { ctx.out((u.active ? 'active' : 'inactive') + '\n'); return u.active ? 0 : 3; }
      if (verb === 'status') {
        var dot = u.active ? sgr('1;32') + '\u25cf' + sgr('0') : '\u25cb';
        ctx.out(dot + ' ' + name + '.service - ' + u.desc + '\n' +
          '     Loaded: loaded (/etc/systemd/system/' + name + '.service; enabled; preset: enabled)\n' +
          '     Active: ' + (u.active ? sgr('1;32') + 'active (running)' + sgr('0') + ' since ' + u.since : 'inactive (dead)') + '\n' +
          (u.active ? '   Main PID: ' + u.pid + ' (' + name + ')\n      Tasks: 9 (limit: 18977)\n     Memory: 41.6M\n' : ''));
        return u.active ? 0 : 3;
      }
      if (verb === 'start' || verb === 'stop' || verb === 'restart') {
        if (!root) { ctx.out('Failed to ' + verb + ' ' + name + '.service: Access denied\nSee system logs and \'systemctl status ' + name + '.service\' for details.\n'); return 1; }
        await ctx.sleep(verb === 'restart' ? 900 : 500);
        u.active = verb !== 'stop';
        if (u.active) { u.pid = 48211 + Math.floor(Math.random() * 400); u.since = new Date().toUTCString().replace('GMT', 'UTC'); }
        return 0;
      }
      ctx.out('Unknown command verb ' + verb + '.\n'); return 1;
    }
  };

  P.bell = {
    summary: 'ring the terminal bell (BEL); bell N rings N times',
    run: async function (ctx) {
      var n = Math.max(1, Math.min(10, parseInt(ctx.argv[1] || '1', 10) || 1));
      for (var i = 0; i < n; i++) { ctx.out(BEL); if (i < n - 1) await ctx.sleep(350); }
      return 0;
    }
  };
  P.notify = {
    summary: 'send a desktop notification (OSC 777; --osc 9 for the plain form)',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['t', 'title', 'd', 'delay', 'osc']), clean = function (s) { return String(s).replace(/[\u0000-\u001f\u007f;]/g, ' ').slice(0, 400); };
      var title = clean(a.f.t || a.f.title || 'Terminal'), body = clean(a.pos.join(' ') || 'Done');
      var delay = parseFloat(a.f.d || a.f.delay || '0') || 0;
      if (delay) await ctx.sleep(delay * 1000);
      ctx.out(a.f.osc === '9' ? ESC + ']9;' + body + ST : ESC + ']777;notify;' + title + ';' + body + ST);
      return 0;
    }
  };

  /* ------------------------------------------------------------------ image tools */
  /* load an image file: bytes, format and size (lazy assets are drawn by T.Assets on first read) */
  async function loadImage(ctx, file) {
    var p = abs(ctx, file), st;
    try { st = ctx.vfs.statOrThrow(p); } catch (e) { return { error: e, path: p }; }
    if (st.type === 'dir') return { error: { code: 'EISDIR' }, path: p };
    var bytes;
    try { bytes = await ctx.vfs.readBytes(p); } catch (e) { return { error: e, path: p }; }
    var inf = imageInfo(bytes), asset = ctx.vfs.assetOf(p);
    if (asset && inf && (!inf.w || !inf.h)) { inf.w = asset.w; inf.h = asset.h; }
    return { path: p, bytes: bytes, info: inf, asset: asset };
  }
  /* RGBA pixels of an image at w x h: assets are redrawn at that size, other files are decoded by the browser */
  async function pixels(ctx, img, w, h) {
    w = Math.max(1, Math.round(w || img.info.w)); h = Math.max(1, Math.round(h || img.info.h));
    if (img.asset) return { rgba: assets(ctx).rgba(img.asset.asset, w, h, img.asset.opts || undefined), w: w, h: h };
    if (typeof createImageBitmap === 'undefined' || typeof document === 'undefined') throw { code: 'EIO' };
    var bmp = await createImageBitmap(new Blob([img.bytes]));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); g.drawImage(bmp, 0, 0, w, h);
    return { rgba: g.getImageData(0, 0, w, h).data, w: w, h: h };
  }
  /* cells an image of w x h px needs, fitted into maxCols x maxRows (cell aspect kept) */
  function fitCells(ctx, w, h, maxCols, maxRows) {
    var s = ctx.size(), cw = s.cellW || 8, chh = s.cellH || 17;
    var cols = Math.ceil(w / cw), rows = Math.ceil(h / chh);
    if (maxCols && cols > maxCols) { rows = Math.max(1, Math.ceil(h * (maxCols * cw / w) / chh)); cols = maxCols; }
    if (maxRows && rows > maxRows) { cols = Math.max(1, Math.ceil(w * (maxRows * chh / h) / cw)); rows = maxRows; }
    return { cols: cols, rows: rows, scaled: cols !== Math.ceil(w / cw) };
  }
  function randId() { var hi = 1 + Math.floor(Math.random() * 254), mid = 1 + Math.floor(Math.random() * 65534), lo = Math.floor(Math.random() * 256); return ((hi << 24) >>> 0) + mid * 256 + lo; }

  var ICAT_USAGE = 'Usage: kitten icat [options] image_file_or_url_or_directory...\n\nA cat like utility to display images in the terminal.\n';
  async function icat(ctx, args) {
    var a = parse(args, ['transfer-mode', 't', 'place', 'z-index', 'z', 'align', 'image-id', 'loop', 'l', 'detection-timeout']), f = a.f, color = colorOn(ctx);
    var vfs = ctx.vfs, files = a.pos;
    var mode = f['transfer-mode'] || f.t || 'detect';
    if (['detect', 'file', 'stream', 'memory', 'temp'].indexOf(mode) < 0) { ctx.err('Error: ' + mode + ' is not a valid choice for --transfer-mode\n'); return 1; }
    var z = f['z-index'] !== undefined ? f['z-index'] : f.z;
    if (z !== undefined && !/^-?\d+$/.test(String(z).replace(/^--/, '-'))) { ctx.err('Error: ' + z + ' is not a valid z-index\n'); return 1; }
    if (z !== undefined) z = parseInt(String(z).replace(/^--/, '-'), 10);
    if (f.clear) { ctx.out(apc('a=d,d=A')); if (!files.length) return 0; }
    if (!files.length && !f['detect-support']) { ctx.err(ICAT_USAGE); return 1; }
    if (ctx.isatty === false) { ctx.err('Error: Must be run in a terminal: stdout is not a TTY\n'); return 1; }
    var det = await kittyDetect(ctx, true);
    if (f['detect-support']) {
      if (!det.direct) { ctx.err('This terminal does not support the graphics protocol\n'); return 1; }
      ctx.err(det.memory ? 'memory\n' : det.file ? 'file\n' : 'stream\n');
      return 0;
    }
    if (!det.direct) {
      ctx.err('This terminal does not support the graphics protocol use a terminal such as kitty, WezTerm or Konsole that does. If you are running inside a terminal multiplexer such as tmux or screen that might be interfering as well.\n');
      return 1;
    }
    var place = null;
    if (f.place) {
      var pm = /^(\d+)x(\d+)@(\d+)x(\d+)$/.exec(f.place);
      if (!pm) { ctx.err('Error: Invalid --place specification: ' + f.place + '\n'); return 1; }
      place = { w: +pm[1], h: +pm[2], x: +pm[3], y: +pm[4] };
    }
    var rc = 0;
    for (var i = 0; i < files.length; i++) {
      var r = await icatOne(ctx, files[i], { mode: mode, det: det, z: z, place: place, align: f.align || 'center', placeholder: !!f['unicode-placeholder'],
        id: f['image-id'] ? parseInt(f['image-id'], 10) : 0, loop: f.loop !== undefined ? parseInt(f.loop, 10) : (f.l !== undefined ? parseInt(f.l, 10) : -1),
        newline: !f['no-trailing-newline'] && !f.n, color: color });
      if (r) rc = r;
    }
    return rc;
  }
  async function icatOne(ctx, file, o) {
    var vfs = ctx.vfs, abspath = abs(ctx, file), size = ctx.size();
    var medium = o.mode === 'detect' ? null : o.mode;
    if (ctx.remote && medium && medium !== 'stream') medium = 'stream';
    var img = await loadImage(ctx, file);
    /* an explicit file transfer sends the path as given: the terminal decides whether it may read it, and its
       single error reply is all the program learns */
    if (medium === 'file' && (img.error || !img.info)) {
      var id0 = randId();
      var rep0 = await ctx.query(apc('a=T,f=100,t=f,i=' + id0 + ',q=0', b64(abspath)), { until: /\u001b_G[^\u001b]*\u001b\\/, timeout: 3000 });
      var msg0 = kittyReplies(rep0)[String(id0)];
      if (msg0 && msg0 !== 'OK') { ctx.err('Failed to display image: ' + file + ': the terminal replied: ' + msg0 + '\n'); return 1; }
      if (!msg0) { ctx.err('Failed to display image: ' + file + ': no reply from the terminal\n'); return 1; }
      return 0;
    }
    if (img.error) { ctx.err('Failed to process image file: ' + file + ' with error: open ' + abspath + ': ' + errText(img.error).toLowerCase() + '\n'); return 1; }
    if (!img.info) { ctx.err('Failed to process image file: ' + file + ' with error: image: unknown format\n'); return 1; }
    var W = img.info.w, Hh = img.info.h;
    var geo = o.place ? { cols: o.place.w, rows: o.place.h, scaled: true } : fitCells(ctx, W, Hh, size.cols, 0);
    var prefix = '';
    if (o.place) prefix = CSI + (o.place.y + 1) + ';' + (o.place.x + 1) + 'H';
    else if (!o.placeholder) { var off = o.align === 'left' ? 0 : o.align === 'right' ? size.cols - geo.cols : Math.floor((size.cols - geo.cols) / 2); prefix = '\r' + (off > 0 ? CSI + off + 'C' : ''); }
    var common = (geo.scaled || o.place ? ',c=' + geo.cols + ',r=' + geo.rows : '') + (o.z !== undefined ? ',z=' + o.z : '') + (o.place ? ',C=1' : '');

    /* animated GIF: frame 1 with a=T, the gap of frame 1, the other frames with a=f, playback with a=a */
    if (img.info.fmt === 'gif' && img.asset && img.asset.frames > 1) {
      var frames = assets(ctx).frames(img.asset.asset, W, Hh, img.asset.frames), num = o.id || (1 + Math.floor(Math.random() * 9999));
      var key = o.id ? 'i=' + num : 'I=' + num, out = prefix;
      out += chunked('a=T,f=32,s=' + W + ',v=' + Hh + ',' + key + common + ',q=2', b64(new Uint8Array(frames[0].rgba.buffer || frames[0].rgba)));
      out += apc('a=a,' + key + ',r=1,z=' + frames[0].delayMs + ',q=2');
      ctx.out(out);
      for (var k = 1; k < frames.length; k++) {
        ctx.out(chunked('a=f,' + key + ',f=32,s=' + W + ',v=' + Hh + ',X=1,z=' + frames[k].delayMs + ',q=2', b64(new Uint8Array(frames[k].rgba.buffer || frames[k].rgba)), 'a=f'));
        if (k === 1) ctx.out(apc('a=a,' + key + ',s=2,q=2'));
        await ctx.sleep(0);
      }
      ctx.out(apc('a=a,' + key + ',s=3,v=' + (o.loop < 0 ? 1 : o.loop + 1) + ',q=2') + (o.newline && !o.place ? '\n' : ''));
      return 0;
    }

    var data = img.bytes, fmtKeys = ',f=100';
    if (img.info.fmt !== 'png') {
      var px = await pixels(ctx, img, W, Hh);
      data = new Uint8Array(px.rgba.buffer ? px.rgba.buffer.slice(0) : px.rgba);
      fmtKeys = ',f=32,s=' + W + ',v=' + Hh;
    }
    if (!medium) medium = img.info.fmt === 'png' && o.det.file ? 'file' : o.det.memory ? 'memory' : o.det.file ? 'temp' : 'stream';
    if (ctx.remote && medium !== 'stream') medium = 'stream';
    if (medium === 'file' && img.info.fmt !== 'png') medium = o.det.file || o.mode === 'file' ? 'temp' : 'stream';

    var id = o.id || randId(), payload, tkeys, wantReply = medium !== 'stream';
    if (medium === 'stream') { tkeys = ',t=d'; payload = b64(data); }
    else if (medium === 'file') { tkeys = ',t=f'; payload = b64(img.path); }
    else if (medium === 'temp') {
      var tmp = '/tmp/tty-graphics-protocol-' + Math.random().toString(36).slice(2, 12) + (img.info.fmt === 'png' ? '.png' : '.rgba');
      try { vfs.write(tmp, data); } catch (e) { ctx.err('Failed to create temporary file: ' + errText(e) + '\n'); return 1; }
      tkeys = ',t=t,S=' + data.length; payload = b64(tmp);
    } else {
      var name = '/tty-graphics-protocol-' + Math.random().toString(36).slice(2, 12);
      try { vfs.shm.create(name, data); } catch (e) { ctx.err('Failed to create shared memory object: ' + errText(e) + '\n'); return 1; }
      tkeys = ',t=s,S=' + data.length; payload = b64(name);
    }

    if (o.placeholder) {
      var D = T.KITTY_DIACRITICS;
      if (!D) { ctx.err('Unicode placeholders are not available\n'); return 1; }
      if (geo.cols >= D.length || geo.rows >= D.length) { ctx.err('Image too large to be displayed using Unicode placeholders\n'); return 1; }
      var pid = id || randId(), cmd = 'a=T,U=1,i=' + pid + fmtKeys + tkeys + ',c=' + geo.cols + ',r=' + geo.rows + ',q=2';
      var txt = medium === 'stream' ? chunked(cmd, payload) : apc(cmd, payload);
      var fg = CSI + '38:2:' + ((pid >> 16) & 255) + ':' + ((pid >> 8) & 255) + ':' + (pid & 255) + 'm', hi = U(D[(pid >>> 24) & 255]);
      for (var y = 0; y < geo.rows; y++) {
        txt += fg;
        for (var x = 0; x < geo.cols; x++) txt += U(0x10eeee) + U(D[y]) + U(D[x]) + hi;
        txt += CSI + '39m' + (y < geo.rows - 1 || o.newline ? '\n' : '');
      }
      ctx.out(txt);
      return 0;
    }

    var keys = 'a=T' + fmtKeys + tkeys + common + (wantReply ? ',i=' + id + ',q=0' : ',q=2');
    if (!wantReply) { ctx.out(prefix + chunked(keys, payload) + (o.newline && !o.place ? '\n' : '')); return 0; }
    var rep = await ctx.query(prefix + apc(keys, payload), { until: /\u001b_G[^\u001b]*\u001b\\/, timeout: 3000 });
    var msg = kittyReplies(rep)[String(id)];
    if (msg && msg !== 'OK') { ctx.err('\nFailed to display image: ' + file + ': the terminal replied: ' + msg + '\n'); return 1; }
    if (o.newline && !o.place) ctx.out('\n');
    return 0;
  }
  P.kitten = {
    summary: 'kitty kittens: icat displays images with the kitty graphics protocol',
    complete: function (args) { return args.length <= 1 ? ['icat'] : ['--transfer-mode=stream', '--transfer-mode=file', '--transfer-mode=memory', '--transfer-mode=temp', '--place', '--z-index', '--unicode-placeholder', '--clear', '--align', '--detect-support']; },
    run: async function (ctx) {
      var sub = ctx.argv[1];
      if (sub === '--version' || sub === '-v') { ctx.out('kitten 0.49.0 created by Kovid Goyal\n'); return 0; }
      if (sub === 'icat') return icat(ctx, ctx.argv.slice(2));
      if (!sub) { ctx.err('Usage: kitten command [command options] [command args]\n\nCommands:\n  icat    Display images in the terminal\n'); return 1; }
      ctx.err('Unknown kitten: ' + sub + '\n'); return 1;
    }
  };
  P.kitty = {
    summary: 'kitty (here only +kitten icat)',
    run: async function (ctx) {
      if (ctx.argv[1] === '+kitten' && ctx.argv[2] === 'icat') return icat(ctx, ctx.argv.slice(3));
      if (ctx.argv[1] === '--version') { ctx.out('kitty 0.49.0 created by Kovid Goyal\n'); return 0; }
      ctx.err('kitty: this machine has no display for a new kitty window; try kitten icat\n'); return 1;
    }
  };

  P.img2sixel = {
    summary: 'convert an image into a sixel image (DEC SIXEL graphics)',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['w', 'h', 'p', 'width', 'height', 'colors']), f = a.f, file = a.pos[0];
      if (!file) { ctx.err('img2sixel: no input file\nUsage: img2sixel [Options] imagefiles\n'); return 1; }
      var img = await loadImage(ctx, file);
      if (img.error) { ctx.err('img2sixel: ' + file + ': ' + errText(img.error) + '\n'); return 1; }
      if (!img.info) { ctx.err('img2sixel: ' + file + ': unknown image format\n'); return 1; }
      if (!T.Sixel || !T.Sixel.encode) { ctx.err('img2sixel: the sixel encoder is not available\n'); return 1; }
      var w = parseInt(f.w || f.width || '0', 10), h = parseInt(f.h || f.height || '0', 10), W0 = img.info.w, H0 = img.info.h;
      if (w && !h) h = Math.round(H0 * w / W0); else if (h && !w) w = Math.round(W0 * h / H0);
      var px;
      try { px = await pixels(ctx, img, w || W0, h || H0); } catch (e) { ctx.err('img2sixel: ' + file + ': cannot decode image\n'); return 1; }
      var colors = parseInt(f.p || f.colors || '256', 10) || 256;
      var six = T.Sixel.encode(px.rgba, px.w, px.h, { colors: Math.max(2, Math.min(256, colors)) });
      ctx.out(six);
      return 0;
    }
  };

  /* iTerm2 inline images: one OSC 1337 File= up to 1 MiB, MultipartFile/FilePart/FileEnd above that */
  function iterm(ctx, bytes, name, args) {
    var head = 'name=' + b64(name) + ';size=' + bytes.length + ';' + args, data = b64(bytes);
    if (bytes.length <= 1048576) return ESC + ']1337;File=' + head + ':' + data + BEL;
    var out = ESC + ']1337;MultipartFile=' + head + BEL;
    for (var i = 0; i < data.length; i += 65536) out += ESC + ']1337;FilePart=' + data.slice(i, i + 65536) + BEL;
    return out + ESC + ']1337;FileEnd' + BEL;
  }
  P.imgcat = {
    summary: 'show images inline with the iTerm2 image protocol',
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['W', 'H', 'width', 'height']), f = a.f, rc = 0;
      if (!a.pos.length) { ctx.err('Usage: imgcat [-p] [-n] [-W width] [-H height] [-r] [-s] [-u] [-f] filename ...\n'); return 2; }
      for (var i = 0; i < a.pos.length; i++) {
        var file = a.pos[i], p = abs(ctx, file), bytes;
        try { bytes = await ctx.vfs.readBytes(p); } catch (e) { ctx.err('imgcat: ' + file + ': No such file or directory\n'); rc = 2; continue; }
        var args = 'width=' + (f.W || f.width || 'auto') + ';height=' + (f.H || f.height || 'auto') + (f.r ? ';preserveAspectRatio=0' : '') + ';inline=1';
        ctx.out(iterm(ctx, bytes, T.VFS.basename(p), args) + '\n');
        if (f.p) ctx.out(T.VFS.basename(p) + '\n');
      }
      return rc;
    }
  };

  P.chafa = {
    summary: 'character art facsimile generator (symbols, kitty, sixels, iterm)',
    complete: function () { return ['--format=symbols', '--format=kitty', '--format=sixels', '--format=iterm', '--size']; },
    run: async function (ctx) {
      var a = parse(ctx.argv.slice(1), ['format', 'f', 'size', 's']), f = a.f, file = a.pos[0];
      if (!file) { ctx.err('chafa: No input files.\n'); return 2; }
      var fmt = (f.format || f.f || 'symbols').replace(/^sixel$/, 'sixels');
      if (['symbols', 'kitty', 'sixels', 'iterm'].indexOf(fmt) < 0) { ctx.err("chafa: Output format given as '" + fmt + "'. Must be one of [iterm, kitty, sixels, symbols].\n"); return 2; }
      var img = await loadImage(ctx, file);
      if (img.error || !img.info) { ctx.err('chafa: Failed to open \'' + file + '\': ' + (img.error ? errText(img.error) : 'Unknown file format') + '\n'); return 2; }
      var sz = ctx.size(), maxC = sz.cols, maxR = Math.max(4, sz.rows - 2);
      var sm = /^(\d*)x?(\d*)$/.exec(f.size || f.s || '');
      if (sm && sm[1]) maxC = Math.min(maxC, +sm[1]);
      if (sm && sm[2]) maxR = +sm[2];
      var W = img.info.w, Hh = img.info.h, geo = fitCells(ctx, W, Hh, maxC, maxR), cw = sz.cellW || 8, chh = sz.cellH || 17;
      if (fmt === 'kitty') {
        var keys = 'a=T,t=d,c=' + geo.cols + ',r=' + geo.rows + ',q=2';
        if (img.info.fmt === 'png') ctx.out(chunked(keys + ',f=100', b64(img.bytes)) + '\n');
        else { var px = await pixels(ctx, img, W, Hh); ctx.out(chunked(keys + ',f=32,s=' + px.w + ',v=' + px.h, b64(new Uint8Array(px.rgba.buffer || px.rgba))) + '\n'); }
        return 0;
      }
      if (fmt === 'sixels') {
        if (!T.Sixel || !T.Sixel.encode) { ctx.err('chafa: sixel output is not available\n'); return 1; }
        var px2 = await pixels(ctx, img, geo.cols * cw, geo.rows * chh);
        ctx.out(T.Sixel.encode(px2.rgba, px2.w, px2.h, { colors: 256 }) + '\n');
        return 0;
      }
      if (fmt === 'iterm') { ctx.out(iterm(ctx, img.bytes, T.VFS.basename(img.path), 'width=' + geo.cols + ';height=' + geo.rows + ';inline=1') + '\n'); return 0; }
      /* symbols: upper half blocks, top pixel as foreground, bottom pixel as background, 24-bit colour */
      var cols = geo.cols, rows = geo.rows, px3 = await pixels(ctx, img, cols, rows * 2), d = px3.rgba, out = '';
      var at = function (x, y) { var i = (y * cols + x) * 4; return d[i + 3] < 128 ? null : [d[i], d[i + 1], d[i + 2]]; };
      for (var y = 0; y < rows; y++) {
        var lastF = '', lastB = '';
        for (var x = 0; x < cols; x++) {
          var t = at(x, y * 2), b = at(x, y * 2 + 1), fs, bs, ch;
          if (!t && !b) { fs = '39'; bs = '49'; ch = ' '; }
          else if (!t) { fs = '38;2;' + b.join(';'); bs = '49'; ch = CH.lower; }
          else { fs = '38;2;' + t.join(';'); bs = b ? '48;2;' + b.join(';') : '49'; ch = CH.upper; }
          var codes = [];
          if (fs !== lastF) { codes.push(fs); lastF = fs; }
          if (bs !== lastB) { codes.push(bs); lastB = bs; }
          out += (codes.length ? sgr(codes.join(';')) : '') + ch;
        }
        out += R0 + '\n';
      }
      ctx.out(out);
      return 0;
    }
  };

  /* ------------------------------------------------------------------ sudo */
  P.sudo = {
    summary: 'execute a command as the superuser (the password prompt goes to the human)',
    run: async function (ctx) {
      var args = ctx.argv.slice(1), vfs = ctx.vfs, user = userOf(ctx);
      if (args[0] === '-k' || args[0] === '-K') { vfs.sudoUntil = 0; args = args.slice(1); if (!args.length) return 0; }
      var validateOnly = args[0] === '-v';
      if (!args.length) { ctx.err('usage: sudo -h | -K | -k | -V\nusage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]\nusage: sudo [-ABbEHkNnPS] [-C num] [-D directory] [-g group] [-h host] [-p prompt] [-R directory] [-T timeout] [-u user] [VAR=value] [-i | -s] [command [arg ...]]\n'); return 1; }
      if (!(vfs.sudoUntil > Date.now())) {
        var ok = false;
        for (var i = 0; i < 3 && !ok; i++) {
          var pw = await ctx.readLine('[sudo] password for ' + user + ': ', { secret: true });
          if (pw.length) ok = true; else ctx.err('Sorry, try again.\n');
        }
        if (!ok) { ctx.err('sudo: 3 incorrect password attempts\n'); return 1; }
        vfs.sudoUntil = Date.now() + 15 * 60000;
      }
      if (validateOnly) return 0;
      var name = args[0];
      if ((T.BUILTINS || []).indexOf(name) >= 0 && name !== 'sleep' && name !== 'echo') { ctx.err('sudo: ' + name + ': command not found\n'); return 1; }
      var env = Object.assign({}, ctx.env, { USER: 'root', LOGNAME: 'root', HOME: '/root', SUDO_USER: user, SUDO_UID: '1000' });
      var code = await runSub(ctx, args, { env: env });
      if (code === null) {
        if (name === 'echo') { ctx.out(args.slice(1).join(' ') + '\n'); return 0; }
        ctx.err('sudo: ' + name + ': command not found\n'); return 1;
      }
      return code;
    }
  };

  /* ------------------------------------------------------------------ ssh */
  var HOSTS = { devbox: { ip: '192.168.50.42', fp: 'SHA256:Lm3k9V0x1QWm8b8Yp2rTn6s7cJm1fXo0vH5dE4aB2wQ' } };
  P.ssh = {
    summary: 'OpenSSH remote login client',
    complete: function () { return Object.keys(HOSTS); },
    run: async function (ctx) {
      /* options end at the destination: everything after it is the remote command, flags included */
      var args = ctx.argv.slice(1), a = { f: {} }, dest = null, cmd = [];
      for (var ai = 0; ai < args.length; ai++) {
        var x = args[ai];
        if (dest === null && /^-[plio]$/.test(x)) { a.f[x[1]] = args[++ai]; continue; }
        if (dest === null && /^-/.test(x)) { a.f[x.slice(1)] = true; continue; }
        if (dest === null) { dest = x; continue; }
        cmd = args.slice(ai); break;
      }
      if (!dest) { ctx.err('usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] [-b bind_address]\n           [-c cipher_spec] [-D [bind_address:]port] [-E log_file]\n           [-i identity_file] [-J destination] [-l login_name] [-p port]\n           destination [command [argument ...]]\n'); return 255; }
      var user = a.f.l || userOf(ctx), host = dest;
      if (dest.indexOf('@') > 0) { user = dest.split('@')[0]; host = dest.split('@')[1]; }
      var hostInfo = HOSTS[host] || Object.keys(HOSTS).map(function (k) { return HOSTS[k].ip === host ? HOSTS[k] : null; }).filter(Boolean)[0];
      if (hostInfo && HOSTS[host] === undefined) host = Object.keys(HOSTS).filter(function (k) { return HOSTS[k] === hostInfo; })[0];
      if (!hostInfo || host === hostOf(ctx)) { await ctx.sleep(250); ctx.err('ssh: Could not resolve hostname ' + host + ': Name or service not known\n'); return 255; }
      await ctx.sleep(300);
      var vfs = ctx.vfs, kh = homeOf(ctx) + '/.ssh/known_hosts', known = '';
      try { known = vfs.readText(kh); } catch (e) { known = ''; }
      if (known.split('\n').every(function (l) { return l.split(' ')[0].split(',').indexOf(host) < 0; })) {
        ctx.out("The authenticity of host '" + host + ' (' + hostInfo.ip + ")' can't be established.\nED25519 key fingerprint is " + hostInfo.fp + '.\nThis key is not known by any other names.\n');
        var ans = (await ctx.readLine('Are you sure you want to continue connecting (yes/no/[fingerprint])? ', {})).trim();
        while (ans !== 'yes' && ans !== 'no' && ans !== hostInfo.fp) ans = (await ctx.readLine("Please type 'yes', 'no' or the fingerprint: ", {})).trim();
        if (ans === 'no') { ctx.err('Host key verification failed.\n'); return 255; }
        try { vfs.append(kh, host + ',' + hostInfo.ip + ' ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7q0bVd3w8m2k5yR4sT1uV6xY9zA0bC2dE3fG4hI5jK\n'); } catch (e) {}
        ctx.err("Warning: Permanently added '" + host + "' (ED25519) to the list of known hosts.\n");
      }
      var ok = false;
      for (var i = 0; i < 3 && !ok; i++) {
        var pw = await ctx.readLine(user + '@' + host + "'s password: ", { secret: true });
        if (pw.length) ok = true; else { await ctx.sleep(600); ctx.err('Permission denied, please try again.\n'); }
      }
      if (!ok) { ctx.err(user + '@' + host + ': Permission denied (publickey,password).\n'); return 255; }
      var rvfs = T.VFS.remote ? T.VFS.remote(host) : vfs;
      if (cmd.length) {
        var code = await runSub(ctx, cmd, { vfs: rvfs, remote: { host: host }, cwd: rvfs.home, env: Object.assign({}, ctx.env, { HOSTNAME: host, HOME: rvfs.home, USER: user, PWD: rvfs.home }) });
        if (code === null) { ctx.err('bash: line 1: ' + cmd[0] + ': command not found\n'); return 127; }
        return code;
      }
      var last = new Date(Date.now() - 20 * 3600000);
      var motd = 'Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-122-generic x86_64)\n\n * Documentation:  ' + link('https://help.ubuntu.com', 'https://help.ubuntu.com') +
        '\n * Management:     ' + link('https://landscape.canonical.com', 'https://landscape.canonical.com') + '\n\n  System load:  0.08              Processes:             131\n  Usage of /:   62.3% of 97.87GB   Users logged in:       0\n  Memory usage: 31%               IPv4 address for eth0: ' + hostInfo.ip +
        '\n\nLast login: ' + strftime('%a %b %e %H:%M:%S %Y', last, false) + ' from 192.168.50.136\n';
      var rc = await ctx.subshell({ host: host, user: user, vfs: rvfs, remote: true, motd: motd });
      ctx.out('Connection to ' + host + ' closed.\n');
      return typeof rc === 'number' ? rc : 0;
    }
  };
})();
