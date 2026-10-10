(function () {
  /* T.SchemeImport: colour-scheme import of the common terminal theme formats (D15).

     API
       T.SchemeImport.formats            [{ id, label, extensions }]
       T.SchemeImport.detect(text, filename)          -> formatId | null
       T.SchemeImport.parse(text, filename, format?)  ->
         { ok: true, format, scheme: { name, appearance, colors: { background, foreground, cursor, cursorText,
           selectionBackground, selectionForeground, ansi: [16] } }, warnings: [] }
         | { ok: false, code, error }

     Rules
       - Colours come out as lowercase '#rrggbb'. Optional fields that the file does not set are null.
       - background and foreground are required. Missing ANSI 0-7 fall back to the xterm defaults, missing
         ANSI 8-15 copy their normal colour; both add a warning naming the indexes.
       - appearance is inferred from the background: relative luminance < 0.18 is dark (the same test as
         T.color.ensure in 00-core.js).
       - Input is capped at 256 KB (UTF-8 bytes). Nothing is ever evaluated: every format has its own small reader
         and JSON goes through JSON.parse after comments and trailing commas are stripped.
       - Error messages are fixed strings and never contain any part of the input. Warnings name only keys from
         this file's own tables, with one exception: a Windows Terminal settings.json with several schemes lists
         the names of the schemes it did not import (sanitised, capped in length and count).
       - Unknown keys are ignored. Every colour value is validated; an invalid one is dropped with a warning. */

  var MAX_BYTES = 256 * 1024;
  var MAX_NAME = 64;
  var MAX_OTHER_SCHEMES = 20;
  var MAX_DEPTH = 32;

  var FORMATS = [
    { id: 'iterm2', label: 'iTerm2 colour preset', extensions: ['.itermcolors'] },
    { id: 'windows-terminal', label: 'Windows Terminal scheme or settings.json', extensions: ['.json'] },
    { id: 'kitty', label: 'kitty theme', extensions: ['.conf'] },
    { id: 'ghostty', label: 'Ghostty theme', extensions: ['.ghostty', ''] },
    { id: 'alacritty', label: 'Alacritty theme (TOML or legacy YAML)', extensions: ['.toml', '.yml', '.yaml'] },
    { id: 'base16', label: 'base16 scheme', extensions: ['.yaml', '.yml'] },
    { id: 'base24', label: 'base24 scheme', extensions: ['.yaml', '.yml'] },
    { id: 'xresources', label: 'Xresources', extensions: ['.xresources', '.xdefaults', '.ad'] }
  ];

  var ERR = {
    input: 'The file could not be read as text.',
    size: 'The file is larger than 256 KB, the import limit.',
    empty: 'The file is empty.',
    binary: 'The file is not a text file.',
    format: 'The file is not a colour scheme format that can be imported.',
    syntax: {
      'iterm2': 'The file is not a valid iTerm2 colour preset.',
      'windows-terminal': 'The file is not valid Windows Terminal JSON.',
      'kitty': 'The file is not a valid kitty theme.',
      'ghostty': 'The file is not a valid Ghostty theme.',
      'alacritty': 'The file is not a valid Alacritty theme.',
      'base16': 'The file is not a valid base16 scheme.',
      'base24': 'The file is not a valid base24 scheme.',
      'xresources': 'The file is not a valid Xresources file.'
    },
    noschemes: 'The file has no colour schemes in it.',
    nocolours: 'The file has no terminal colours in it.',
    required: 'The scheme has no valid background or foreground colour.'
  };

  var FIELD_LABEL = {
    background: 'background', foreground: 'foreground', cursor: 'cursor', cursorText: 'cursor text',
    selectionBackground: 'selection background', selectionForeground: 'selection foreground'
  };

  /* xterm's default 16 (used only to fill missing ANSI 0-7) */
  var XTERM16 = ['#000000', '#cd0000', '#00cd00', '#cdcd00', '#0000ee', '#cd00cd', '#00cdcd', '#e5e5e5',
    '#7f7f7f', '#ff0000', '#00ff00', '#ffff00', '#5c5cff', '#ff00ff', '#00ffff', '#ffffff'];

  /* ------------------------------------------------------------------ helpers */

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function dict() { return Object.create(null); }

  function SyntaxErr() { this.pmImport = true; }

  function hex2(n) { return (n < 16 ? '0' : '') + n.toString(16); }
  function rgbHex(r, g, b) { return '#' + hex2(r) + hex2(g) + hex2(b); }

  /* Parse a colour value. style: 'css' (#rgb doubles each digit), 'x11' (#rgb, #rrrgggbbb and #rrrrggggbbbb keep
     the most significant bits, rgb:h/h/h scales). Accepts '#', '0x' or bare hex. Returns '#rrggbb' or null. */
  function parseColour(v, style) {
    if (v === null || v === undefined) return null;
    if (typeof v !== 'string') return null;
    var s = v.trim();
    if (s.length === 0 || s.length > 40) return null;
    var m;
    if (style === 'x11') {
      m = /^rgb:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})$/i.exec(s);
      if (m) {
        var sc = function (h) { var max = Math.pow(16, h.length) - 1; return Math.round(parseInt(h, 16) * 255 / max); };
        return rgbHex(sc(m[1]), sc(m[2]), sc(m[3]));
      }
    }
    if (s[0] === '#') s = s.slice(1);
    else if (/^0x/i.test(s)) s = s.slice(2);
    if (!/^[0-9a-f]+$/i.test(s)) return null;
    s = s.toLowerCase();
    if (style === 'x11') {
      if (s.length === 3) return '#' + s[0] + '0' + s[1] + '0' + s[2] + '0';
      if (s.length === 6) return '#' + s;
      if (s.length === 9) return '#' + s.slice(0, 2) + s.slice(3, 5) + s.slice(6, 8);
      if (s.length === 12) return '#' + s.slice(0, 2) + s.slice(4, 6) + s.slice(8, 10);
      return null;
    }
    if (s.length === 3) return '#' + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    if (s.length === 6) return '#' + s;
    return null;
  }

  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function luminance(h) {
    var n = parseInt(h.slice(1), 16);
    return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  }

  function cleanName(s) {
    if (typeof s !== 'string') return null;
    s = s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, '')
      .replace(/\s+/g, ' ').trim();
    if (!s) return null;
    if (s.length > MAX_NAME) s = s.slice(0, MAX_NAME).trim();
    return s;
  }

  function baseName(filename) {
    if (typeof filename !== 'string' || !filename) return null;
    var b = filename.replace(/^.*[\\/]/, '');
    b = b.replace(/\.(itermcolors|json|conf|ghostty|toml|ya?ml|xresources|xdefaults|ad)$/i, '');
    b = b.replace(/[_]+/g, ' ');
    return cleanName(b);
  }

  function extOf(filename) {
    if (typeof filename !== 'string') return '';
    var b = filename.replace(/^.*[\\/]/, '');
    if (/^\.?xresources$/i.test(b) || /^\.?xdefaults$/i.test(b)) return '.xresources';
    var i = b.lastIndexOf('.');
    return i > 0 ? b.slice(i).toLowerCase() : '';
  }

  function utf8Length(s, cap) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) n += 1;
      else if (c < 0x800) n += 2;
      else if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; }
      else n += 3;
      if (n > cap) return n;
    }
    return n;
  }

  /* Strip a comment that starts with ch (outside quotes). hashNeedsSpace: '#' only starts a comment at the line
     start or after whitespace (YAML, so '#002b36' values survive unquoted). */
  function stripComment(line, ch, hashNeedsSpace) {
    var q = null;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (q) {
        if (c === '\\' && q === '"') { i++; continue; }
        if (c === q) q = null;
        continue;
      }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === ch) {
        if (hashNeedsSpace && i > 0 && !/\s/.test(line[i - 1])) continue;
        return line.slice(0, i);
      }
    }
    return line;
  }

  function unquote(v) {
    v = v.trim();
    if (v.length >= 2 && ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"))) {
      return v.slice(1, -1);
    }
    return v;
  }

  /* ------------------------------------------------------------------ result assembly */

  function Collector(style) {
    this.style = style || 'css';
    this.colors = { background: null, foreground: null, cursor: null, cursorText: null,
      selectionBackground: null, selectionForeground: null };
    this.ansi = new Array(16).fill(null);
    this.invalid = dict();
    this.seen = 0;
  }
  Collector.prototype.set = function (field, value) {
    var c = parseColour(value, this.style);
    this.seen++;
    if (c === null) { this.invalid[FIELD_LABEL[field]] = true; return; }
    this.colors[field] = c;
  };
  /* For fields whose value may be a keyword meaning "follow the cell" (kitty 'none'/'background', Alacritty
     'CellForeground'): those leave the field null without a warning. */
  Collector.prototype.setOrKeyword = function (field, value, keywords) {
    if (typeof value === 'string' && keywords.indexOf(value.trim().toLowerCase()) >= 0) { this.seen++; return; }
    this.set(field, value);
  };
  Collector.prototype.setAnsi = function (i, value) {
    if (!(i >= 0 && i < 16)) return;
    var c = parseColour(value, this.style);
    this.seen++;
    if (c === null) { this.invalid['ANSI ' + i] = true; return; }
    this.ansi[i] = c;
  };
  Collector.prototype.finish = function (format, name, warnings) {
    var k, i, w = warnings || [];
    var bad = Object.keys(this.invalid);
    if (bad.length) w.push('Ignored invalid colour values: ' + bad.join(', ') + '.');
    var have = this.ansi.some(function (x) { return x !== null; });
    if (!have && this.colors.background === null && this.colors.foreground === null) {
      return fail(this.seen ? 'required' : 'nocolours');
    }
    if (this.colors.background === null || this.colors.foreground === null) return fail('required');
    var ansi = this.ansi.slice(), missNormal = [], missBright = [];
    for (i = 0; i < 8; i++) if (ansi[i] === null) { ansi[i] = XTERM16[i]; missNormal.push(i); }
    for (i = 8; i < 16; i++) if (ansi[i] === null) { ansi[i] = ansi[i - 8]; missBright.push(i); }
    if (missNormal.length) w.push('ANSI colours ' + missNormal.join(', ') + ' were missing; the xterm defaults are used.');
    if (missBright.length) w.push('ANSI colours ' + missBright.join(', ') + ' were missing; the normal colours are reused.');
    var colors = {};
    for (k in this.colors) colors[k] = this.colors[k];
    colors.ansi = ansi;
    return {
      ok: true,
      format: format,
      scheme: {
        name: cleanName(name) || 'Imported scheme',
        appearance: luminance(colors.background) < 0.18 ? 'dark' : 'light',
        colors: colors
      },
      warnings: w
    };
  };

  function fail(code, format) {
    var msg = code === 'syntax' ? ERR.syntax[format] || ERR.format : ERR[code];
    return { ok: false, code: code, error: msg };
  }

  /* ------------------------------------------------------------------ 1. iTerm2 (.itermcolors, XML plist) */

  var XML_ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  function xmlText(s) {
    return s.replace(/&(#x[0-9a-f]{1,6}|#[0-9]{1,7}|amp|lt|gt|quot|apos);/gi, function (m, e) {
      if (e[0] === '#') {
        var n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
      }
      return XML_ENT[e.toLowerCase()];
    });
  }

  /* A small plist reader: tokenises tags and text, then builds dict / array / string / real / integer / bool /
     data / date values. Rejects mismatched tags and depth beyond MAX_DEPTH. */
  function readPlist(text) {
    var toks = [], i = 0, n = text.length;
    while (i < n) {
      var lt = text.indexOf('<', i);
      if (lt < 0) { toks.push({ t: 'text', v: text.slice(i) }); break; }
      if (lt > i) toks.push({ t: 'text', v: text.slice(i, lt) });
      if (text.startsWith('<!--', lt)) {
        var ce = text.indexOf('-->', lt + 4); if (ce < 0) throw new SyntaxErr();
        i = ce + 3; continue;
      }
      if (text.startsWith('<?', lt)) {
        var pe = text.indexOf('?>', lt + 2); if (pe < 0) throw new SyntaxErr();
        i = pe + 2; continue;
      }
      if (text.startsWith('<!', lt)) {
        var de = text.indexOf('>', lt + 2); if (de < 0) throw new SyntaxErr();
        i = de + 1; continue;
      }
      var gt = text.indexOf('>', lt + 1);
      if (gt < 0) throw new SyntaxErr();
      var body = text.slice(lt + 1, gt).trim();
      var m = /^(\/?)([A-Za-z][\w.-]*)(?:\s[^>]*?)?(\/?)$/.exec(body);
      if (!m) throw new SyntaxErr();
      toks.push({ t: m[1] ? 'close' : (m[3] ? 'empty' : 'open'), v: m[2] });
      i = gt + 1;
    }
    var p = 0;
    function skipWs() { while (p < toks.length && toks[p].t === 'text' && !toks[p].v.trim()) p++; }
    function textUntil(tag) {
      var s = '';
      while (p < toks.length && toks[p].t === 'text') s += toks[p++].v;
      if (p >= toks.length || toks[p].t !== 'close' || toks[p].v !== tag) throw new SyntaxErr();
      p++;
      return xmlText(s);
    }
    function value(depth) {
      if (depth > MAX_DEPTH) throw new SyntaxErr();
      skipWs();
      var tk = toks[p++];
      if (!tk) throw new SyntaxErr();
      if (tk.t === 'empty') {
        if (tk.v === 'true') return true;
        if (tk.v === 'false') return false;
        if (tk.v === 'dict') return dict();
        if (tk.v === 'array') return [];
        if (tk.v === 'string' || tk.v === 'data') return '';
        throw new SyntaxErr();
      }
      if (tk.t !== 'open') throw new SyntaxErr();
      switch (tk.v) {
        case 'dict': {
          var d = dict();
          for (;;) {
            skipWs();
            var k = toks[p];
            if (!k) throw new SyntaxErr();
            if (k.t === 'close' && k.v === 'dict') { p++; return d; }
            if (k.t !== 'open' || k.v !== 'key') throw new SyntaxErr();
            p++;
            var key = textUntil('key');
            d[key] = value(depth + 1);
          }
        }
        case 'array': {
          var a = [];
          for (;;) {
            skipWs();
            var e = toks[p];
            if (!e) throw new SyntaxErr();
            if (e.t === 'close' && e.v === 'array') { p++; return a; }
            a.push(value(depth + 1));
          }
        }
        case 'real': case 'integer': {
          var s = textUntil(tk.v).trim();
          if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) throw new SyntaxErr();
          return Number(s);
        }
        case 'string': case 'data': case 'date':
          return textUntil(tk.v);
        case 'plist': {
          var v = value(depth + 1);
          skipWs();
          if (!toks[p] || toks[p].t !== 'close' || toks[p].v !== 'plist') throw new SyntaxErr();
          p++;
          return v;
        }
        default: throw new SyntaxErr();
      }
    }
    var root = value(0);
    skipWs();
    if (p !== toks.length) throw new SyntaxErr();
    return root;
  }

  var ITERM_KEYS = {
    'Background Color': 'background', 'Foreground Color': 'foreground', 'Cursor Color': 'cursor',
    'Cursor Text Color': 'cursorText', 'Selection Color': 'selectionBackground',
    'Selected Text Color': 'selectionForeground'
  };

  function itermColour(d, spaces) {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
    var comps = ['Red Component', 'Green Component', 'Blue Component'], out = [];
    for (var i = 0; i < 3; i++) {
      var v = d[comps[i]];
      if (typeof v !== 'number' || !isFinite(v)) return null;
      out.push(Math.round(Math.min(1, Math.max(0, v)) * 255));
    }
    var space = typeof d['Color Space'] === 'string' ? d['Color Space'] : '';
    if (/^p3$/i.test(space)) spaces.p3 = true;
    else if (/^calibrated$/i.test(space)) spaces.calibrated = true;
    if (typeof d['Alpha Component'] === 'number' && d['Alpha Component'] < 1) spaces.alpha = true;
    return rgbHex(out[0], out[1], out[2]);
  }

  function parseIterm(text, filename) {
    var root;
    try { root = readPlist(text); } catch (e) { if (e instanceof SyntaxErr) return fail('syntax', 'iterm2'); throw e; }
    if (!root || typeof root !== 'object' || Array.isArray(root)) return fail('syntax', 'iterm2');
    var col = new Collector('css'), spaces = {}, warnings = [];
    for (var key in root) {
      var m = /^Ansi (\d{1,2}) Color$/.exec(key), field = ITERM_KEYS[key];
      if (!m && !field) continue;
      var c = itermColour(root[key], spaces);
      if (m) {
        var idx = Number(m[1]);
        if (idx > 15) continue;
        if (c === null) { col.seen++; col.invalid['ANSI ' + idx] = true; } else col.setAnsi(idx, c);
      } else if (c === null) { col.seen++; col.invalid[FIELD_LABEL[field]] = true; } else col.set(field, c);
    }
    if (spaces.p3) warnings.push('Display P3 colours were read as sRGB; they may look slightly less saturated.');
    if (spaces.calibrated) warnings.push('Calibrated (device) colours were read as sRGB.');
    if (spaces.alpha) warnings.push('Colour transparency was ignored.');
    return col.finish('iterm2', baseName(filename), warnings);
  }

  /* ------------------------------------------------------------------ 2. Windows Terminal (JSON with comments) */

  /* Removes // and block comments and trailing commas outside strings, so JSON.parse can read the JSONC that
     Windows Terminal accepts. Throws on an unterminated string or comment. */
  function stripJsonc(s) {
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '"') {
        var j = i + 1;
        while (j < n && s[j] !== '"') { if (s[j] === '\\') j++; if (s[j] === '\n') throw new SyntaxErr(); j++; }
        if (j >= n) throw new SyntaxErr();
        out += s.slice(i, j + 1); i = j + 1; continue;
      }
      if (c === '/' && s[i + 1] === '/') { while (i < n && s[i] !== '\n') i++; continue; }
      if (c === '/' && s[i + 1] === '*') {
        var e = s.indexOf('*/', i + 2); if (e < 0) throw new SyntaxErr();
        out += ' '; i = e + 2; continue;
      }
      if (c === ',') {
        var k = i + 1;
        for (;;) {
          while (k < n && /\s/.test(s[k])) k++;
          if (s[k] === '/' && s[k + 1] === '/') { while (k < n && s[k] !== '\n') k++; continue; }
          if (s[k] === '/' && s[k + 1] === '*') { var e2 = s.indexOf('*/', k + 2); if (e2 < 0) throw new SyntaxErr(); k = e2 + 2; continue; }
          break;
        }
        if (s[k] === '}' || s[k] === ']') { i++; continue; }
      }
      out += c; i++;
    }
    return out;
  }

  var WT_ANSI = ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white',
    'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightPurple', 'brightCyan', 'brightWhite'];

  function isWtScheme(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
    return hasOwn(o, 'background') || hasOwn(o, 'foreground') || hasOwn(o, 'black') || hasOwn(o, 'brightBlack');
  }

  function parseWt(text, filename) {
    var root;
    try { root = JSON.parse(stripJsonc(text)); } catch (e) { return fail('syntax', 'windows-terminal'); }
    var warnings = [], scheme = null;
    if (Array.isArray(root)) root = { schemes: root };
    if (!root || typeof root !== 'object') return fail('syntax', 'windows-terminal');
    if (Array.isArray(root.schemes)) {
      var list = root.schemes.filter(isWtScheme);
      if (!list.length) return fail('noschemes');
      scheme = list[0];
      if (list.length > 1) {
        var others = [];
        for (var i = 1; i < list.length && others.length < MAX_OTHER_SCHEMES; i++) {
          others.push(cleanName(list[i].name) || 'unnamed');
        }
        var more = list.length - 1 - others.length;
        warnings.push('The file has ' + list.length + ' schemes; the first was imported. Not imported: ' +
          others.join(', ') + (more > 0 ? ' and ' + more + ' more' : '') + '.');
      }
    } else if (isWtScheme(root)) {
      scheme = root;
    } else {
      return fail('noschemes');
    }
    var col = new Collector('css');
    if (hasOwn(scheme, 'background')) col.set('background', scheme.background);
    if (hasOwn(scheme, 'foreground')) col.set('foreground', scheme.foreground);
    if (hasOwn(scheme, 'cursorColor')) col.set('cursor', scheme.cursorColor);
    if (hasOwn(scheme, 'selectionBackground')) col.set('selectionBackground', scheme.selectionBackground);
    for (var a = 0; a < 16; a++) if (hasOwn(scheme, WT_ANSI[a])) col.setAnsi(a, scheme[WT_ANSI[a]]);
    return col.finish('windows-terminal', cleanName(scheme.name) || baseName(filename), warnings);
  }

  /* ------------------------------------------------------------------ 3. kitty */

  var KITTY_KEYS = {
    background: 'background', foreground: 'foreground', cursor: 'cursor', cursor_text_color: 'cursorText',
    selection_background: 'selectionBackground', selection_foreground: 'selectionForeground'
  };

  function parseKitty(text, filename) {
    var col = new Collector('css'), name = null, lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i].trim();
      var nm = /^##\s*name\s*:\s*(.+)$/i.exec(raw);
      if (nm && name === null) { name = nm[1]; continue; }
      if (!raw || raw[0] === '#') continue;
      var m = /^([A-Za-z_][\w]*)\s+(\S+)/.exec(raw);
      if (!m) continue;
      var key = m[1], val = m[2], cm = /^color(\d{1,3})$/.exec(key);
      if (cm) { if (Number(cm[1]) < 16) col.setAnsi(Number(cm[1]), val); continue; }
      var f = KITTY_KEYS[key];
      if (f === 'cursorText') col.setOrKeyword(f, val, ['background']);
      else if (f === 'cursor' || f === 'selectionBackground' || f === 'selectionForeground') col.setOrKeyword(f, val, ['none']);
      else if (f) col.set(f, val);
    }
    return col.finish('kitty', name || baseName(filename), []);
  }

  /* ------------------------------------------------------------------ 4. Ghostty */

  var GHOSTTY_KEYS = {
    background: 'background', foreground: 'foreground', 'cursor-color': 'cursor', 'cursor-text': 'cursorText',
    'selection-background': 'selectionBackground', 'selection-foreground': 'selectionForeground'
  };

  function parseGhostty(text, filename) {
    var col = new Collector('css'), lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i].trim();
      if (!raw || raw[0] === '#') continue;
      var eq = raw.indexOf('=');
      if (eq < 0) continue;
      var key = raw.slice(0, eq).trim(), val = unquote(raw.slice(eq + 1));
      if (key === 'palette') {
        var pm = /^(\d{1,3})\s*=\s*(.*)$/.exec(val);
        if (!pm) { col.seen++; col.invalid['palette entry'] = true; continue; }
        if (Number(pm[1]) < 16) col.setAnsi(Number(pm[1]), unquote(pm[2]));
        continue;
      }
      var f = GHOSTTY_KEYS[key];
      if (f === 'cursorText' || f === 'selectionBackground' || f === 'selectionForeground') {
        col.setOrKeyword(f, val, ['cell-foreground', 'cell-background']);
      } else if (f) col.set(f, val);
    }
    return col.finish('ghostty', baseName(filename), []);
  }

  /* ------------------------------------------------------------------ 5. Alacritty (TOML, legacy YAML) */

  /* Minimal TOML subset: [table] and [a.b] headers, [[array.of.tables]] (skipped), bare / quoted / dotted keys,
     basic and literal single-line strings, one-line inline tables (nested), and other scalars kept as text.
     Single-line arrays are skipped. Multi-line strings and arrays are rejected. */
  function readTomlString(s, i) {
    var q = s[i], j = i + 1, out = '';
    if (s.startsWith(q + q + q, i)) throw new SyntaxErr();
    while (j < s.length) {
      var c = s[j];
      if (c === q) return { v: out, end: j + 1 };
      if (q === '"' && c === '\\') {
        var e = s[j + 1];
        if (e === 'u' || e === 'U') {
          var len = e === 'u' ? 4 : 8, hx = s.slice(j + 2, j + 2 + len);
          if (!/^[0-9a-fA-F]+$/.test(hx) || hx.length !== len) throw new SyntaxErr();
          var cp = parseInt(hx, 16); if (cp > 0x10ffff) throw new SyntaxErr();
          out += String.fromCodePoint(cp); j += 2 + len; continue;
        }
        var map = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\' };
        if (!hasOwn(map, e)) throw new SyntaxErr();
        out += map[e]; j += 2; continue;
      }
      out += c; j++;
    }
    throw new SyntaxErr();
  }

  function readTomlKey(s, i) {
    var parts = [];
    for (;;) {
      while (s[i] === ' ' || s[i] === '\t') i++;
      if (s[i] === '"' || s[i] === "'") { var r = readTomlString(s, i); parts.push(r.v); i = r.end; }
      else {
        var m = /^[A-Za-z0-9_-]+/.exec(s.slice(i));
        if (!m) throw new SyntaxErr();
        parts.push(m[0]); i += m[0].length;
      }
      while (s[i] === ' ' || s[i] === '\t') i++;
      if (s[i] === '.') { i++; continue; }
      return { parts: parts, end: i };
    }
  }

  function tomlSet(root, path, v, depth) {
    if (path.length > MAX_DEPTH || depth > MAX_DEPTH) throw new SyntaxErr();
    var o = root;
    for (var i = 0; i < path.length - 1; i++) {
      if (!o[path[i]] || typeof o[path[i]] !== 'object') o[path[i]] = dict();
      o = o[path[i]];
    }
    o[path[path.length - 1]] = v;
  }

  function readTomlValue(s, i, depth) {
    if (depth > MAX_DEPTH) throw new SyntaxErr();
    while (s[i] === ' ' || s[i] === '\t') i++;
    var c = s[i];
    if (c === '"' || c === "'") return readTomlString(s, i);
    if (c === '{') {
      var t = dict(); i++;
      for (;;) {
        while (s[i] === ' ' || s[i] === '\t') i++;
        if (s[i] === '}') return { v: t, end: i + 1 };
        var k = readTomlKey(s, i); i = k.end;
        if (s[i] !== '=') throw new SyntaxErr();
        var r = readTomlValue(s, i + 1, depth + 1); i = r.end;
        tomlSet(t, k.parts, r.v, depth + 1);
        while (s[i] === ' ' || s[i] === '\t') i++;
        if (s[i] === ',') { i++; continue; }
        if (s[i] === '}') return { v: t, end: i + 1 };
        throw new SyntaxErr();
      }
    }
    if (c === '[') {
      var lvl = 0, j = i, q = null;
      for (; j < s.length; j++) {
        var ch = s[j];
        if (q) { if (ch === '\\' && q === '"') j++; else if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") q = ch;
        else if (ch === '[') lvl++;
        else if (ch === ']' && --lvl === 0) return { v: null, end: j + 1 };
      }
      throw new SyntaxErr();
    }
    var m = /^[^\s,}#]+/.exec(s.slice(i));
    if (!m) throw new SyntaxErr();
    return { v: m[0], end: i + m[0].length };
  }

  function readToml(text) {
    var root = dict(), cur = root, lines = text.split('\n');
    for (var n = 0; n < lines.length; n++) {
      var line = lines[n].trim();
      if (!line || line[0] === '#') continue;
      if (line.startsWith('[[')) {
        if (!/\]\]\s*(#.*)?$/.test(line)) throw new SyntaxErr();
        cur = dict(); /* arrays of tables are not colours: read into a throwaway table */
        continue;
      }
      if (line[0] === '[') {
        var k = readTomlKey(line, 1);
        if (line[k.end] !== ']') throw new SyntaxErr();
        var rest = line.slice(k.end + 1).trim();
        if (rest && rest[0] !== '#') throw new SyntaxErr();
        cur = root;
        for (var p = 0; p < k.parts.length; p++) {
          if (p > MAX_DEPTH) throw new SyntaxErr();
          if (!cur[k.parts[p]] || typeof cur[k.parts[p]] !== 'object') cur[k.parts[p]] = dict();
          cur = cur[k.parts[p]];
        }
        continue;
      }
      var key = readTomlKey(line, 0);
      if (line[key.end] !== '=') throw new SyntaxErr();
      var val = readTomlValue(line, key.end + 1, 0);
      var tail = line.slice(val.end).trim();
      if (tail && tail[0] !== '#') throw new SyntaxErr();
      tomlSet(cur, key.parts, val.v, 0);
    }
    return root;
  }

  /* Minimal YAML subset for theme files: nested block mappings by indentation, 'key: value' scalars (plain,
     single- or double-quoted), '#' comments. Sequences and flow collections are skipped. All scalars stay text. */
  function readYaml(text) {
    var root = dict(), stack = [{ ind: -1, obj: root }], lines = text.split('\n');
    for (var n = 0; n < lines.length; n++) {
      var rawLine = lines[n];
      if (/^\s*(---|\.\.\.)\s*$/.test(rawLine)) continue;
      var line = stripComment(rawLine, '#', true).replace(/\s+$/, '');
      if (!line.trim()) continue;
      if (/\t/.test(line.match(/^\s*/)[0])) throw new SyntaxErr();
      var ind = line.match(/^ */)[0].length, body = line.slice(ind);
      if (body[0] === '-') continue; /* sequence items are not used by any colour key */
      var m = /^("(?:[^"\\]|\\.)*"|'[^']*'|[^:'"][^:]*?)\s*:(?:\s+(.*)|\s*)$/.exec(body);
      if (!m) throw new SyntaxErr();
      while (stack.length > 1 && ind <= stack[stack.length - 1].ind) stack.pop();
      var parent = stack[stack.length - 1].obj, key = unquote(m[1]), v = m[2];
      if (v === undefined || v === '') {
        if (stack.length > MAX_DEPTH) throw new SyntaxErr();
        var child = dict(); parent[key] = child;
        stack.push({ ind: ind, obj: child });
      } else {
        v = v.trim();
        if ((v[0] === '"' || v[0] === "'") && (v.length < 2 || v[v.length - 1] !== v[0])) throw new SyntaxErr();
        parent[key] = unquote(v);
      }
    }
    return root;
  }

  var ALA_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

  function parseAlacritty(text, filename, yaml) {
    var root;
    try { root = yaml ? readYaml(text) : readToml(text); } catch (e) {
      if (e instanceof SyntaxErr) return fail('syntax', 'alacritty'); throw e;
    }
    var colors = root.colors;
    if (!colors || typeof colors !== 'object') return fail('nocolours');
    var col = new Collector('css'), cell = ['cellforeground', 'cellbackground'];
    function tbl(k) { var t = colors[k]; return t && typeof t === 'object' ? t : dict(); }
    var pri = tbl('primary'), cur = tbl('cursor'), sel = tbl('selection'), nor = tbl('normal'), bri = tbl('bright');
    if ('background' in pri) col.set('background', pri.background);
    if ('foreground' in pri) col.set('foreground', pri.foreground);
    if ('cursor' in cur) col.setOrKeyword('cursor', cur.cursor, cell);
    if ('text' in cur) col.setOrKeyword('cursorText', cur.text, cell);
    if ('background' in sel) col.setOrKeyword('selectionBackground', sel.background, cell);
    if ('text' in sel) col.setOrKeyword('selectionForeground', sel.text, cell);
    for (var i = 0; i < 8; i++) {
      if (ALA_NAMES[i] in nor) col.setAnsi(i, nor[ALA_NAMES[i]]);
      if (ALA_NAMES[i] in bri) col.setAnsi(i + 8, bri[ALA_NAMES[i]]);
    }
    return col.finish('alacritty', baseName(filename), []);
  }

  /* ------------------------------------------------------------------ 6. base16 and base24 (YAML)

     base16 to ANSI, the base16-shell mapping (tinted-theming base16-shell, base16 styling guide):
       0 black   = base00   8  bright black   = base03
       1 red     = base08   9  bright red     = base08
       2 green   = base0B   10 bright green   = base0B
       3 yellow  = base0A   11 bright yellow  = base0A
       4 blue    = base0D   12 bright blue    = base0D
       5 magenta = base0E   13 bright magenta = base0E
       6 cyan    = base0C   14 bright cyan    = base0C
       7 white   = base05   15 bright white   = base07
       background = base00, foreground = base05, cursor = base05, cursor text = base00,
       selection background = base02, selection foreground = base05.

     base24 to ANSI (tinted-theming base24 styling.md 0.1.3, its ANSI column): 0-8 and 15 as base16, and the
     brights from the extra slots:
       9  bright red     = base12   12 bright blue    = base16
       10 bright green   = base14   13 bright magenta = base17
       11 bright yellow  = base13   14 bright cyan    = base15
     A base24 slot the file leaves out uses the spec's base16 fallback (base12 -> base08, base13 -> base0A,
     base14 -> base0B, base15 -> base0C, base16 -> base0D, base17 -> base0E).

     Both the legacy flat form ('scheme:', 'author:', 'base00: "002b36"') and the tinted-theming form
     ('system:', 'name:', 'variant:', 'palette:' with the slots nested) are read. */

  var B16_ANSI = ['00', '08', '0B', '0A', '0D', '0E', '0C', '05', '03', '08', '0B', '0A', '0D', '0E', '0C', '07'];
  var B24_ANSI = ['00', '08', '0B', '0A', '0D', '0E', '0C', '05', '03', '12', '14', '13', '16', '17', '15', '07'];
  var B24_FALLBACK = { '12': '08', '13': '0A', '14': '0B', '15': '0C', '16': '0D', '17': '0E' };

  function baseSlots(root) {
    var src = root.palette && typeof root.palette === 'object' ? root.palette : root, slots = dict(), any24 = false;
    for (var k in src) {
      var m = /^base([0-9a-f]{2})$/i.exec(k);
      if (!m || typeof src[k] !== 'string') continue;
      var id = m[1].toUpperCase();
      if (!/^(0[0-9A-F]|1[0-7])$/.test(id)) continue;
      slots[id] = src[k];
      if (id[0] === '1') any24 = true;
    }
    return { slots: slots, base24: any24 || /^base24$/i.test(root.system || '') };
  }

  function parseBase(text, filename, format) {
    var root;
    try { root = readYaml(text); } catch (e) { if (e instanceof SyntaxErr) return fail('syntax', format); throw e; }
    var b = baseSlots(root), s = b.slots;
    if (!Object.keys(s).length) return fail('nocolours');
    var is24 = format === 'base24', map = is24 ? B24_ANSI : B16_ANSI, col = new Collector('css');
    var bad = dict(), warnings = [];
    function slot(id) {
      if (is24 && !(id in s) && B24_FALLBACK[id]) id = B24_FALLBACK[id];
      if (!(id in s)) return null;
      var c = parseColour(s[id], 'css');
      if (c === null) { bad['base' + id] = true; return null; }
      return c;
    }
    var bg = slot('00'), fg = slot('05');
    if (bg) col.set('background', bg); if (fg) col.set('foreground', fg);
    if (fg) col.set('cursor', fg); if (bg) col.set('cursorText', bg);
    var selBg = slot('02'); if (selBg) col.set('selectionBackground', selBg);
    if (fg) col.set('selectionForeground', fg);
    for (var i = 0; i < 16; i++) { var c = slot(map[i]); if (c) col.setAnsi(i, c); }
    var badKeys = Object.keys(bad);
    if (badKeys.length) warnings.push('Ignored invalid colour values: ' + badKeys.join(', ') + '.');
    var nm = typeof root.scheme === 'string' ? root.scheme : (typeof root.name === 'string' ? root.name : null);
    return col.finish(format, nm || baseName(filename), warnings);
  }

  /* ------------------------------------------------------------------ 7. Xresources */

  var XRES_KEYS = {
    background: 'background', foreground: 'foreground', cursorcolor: 'cursor',
    highlightcolor: 'selectionBackground', highlighttextcolor: 'selectionForeground'
  };
  /* Accepted resource prefixes (the part before the last name, with '.' and '*' removed, lowercased). */
  var XRES_PREFIX = { '': 1, 'urxvt': 1, 'rxvt': 1, 'xterm': 1, 'uxterm': 1, 'xtermvt100': 1, 'uxtermvt100': 1 };

  function parseXres(text, filename) {
    var col = new Collector('x11'), defs = dict(), ndefs = 0, lines = text.split('\n');
    for (var n = 0; n < lines.length; n++) {
      var line = lines[n];
      while (/\\$/.test(line) && n + 1 < lines.length) line = line.slice(0, -1) + lines[++n];
      line = line.trim();
      if (!line || line[0] === '!') continue;
      if (line[0] === '#') {
        var dm = /^#\s*define\s+([A-Za-z_]\w*)\s+(.+)$/.exec(line);
        if (dm && ndefs < 512) { defs[dm[1]] = dm[2].replace(/\s*\/\*.*\*\/\s*$/, '').trim(); ndefs++; }
        continue;
      }
      var colon = line.indexOf(':');
      if (colon < 0) continue;
      var spec = line.slice(0, colon).trim(), val = line.slice(colon + 1).trim();
      var mm = /^(.*?)([A-Za-z0-9_-]+)$/.exec(spec);
      if (!mm) continue;
      var prefix = mm[1].replace(/[.*?\s]/g, '').toLowerCase(), leaf = mm[2].toLowerCase();
      if (!hasOwn(XRES_PREFIX, prefix)) continue;
      for (var d = 0; d < 8 && /^[A-Za-z_]\w*$/.test(val) && val in defs; d++) val = defs[val];
      var cm = /^color(\d{1,3})$/.exec(leaf);
      if (cm) { if (Number(cm[1]) < 16) col.setAnsi(Number(cm[1]), val); continue; }
      if (hasOwn(XRES_KEYS, leaf)) col.set(XRES_KEYS[leaf], val);
    }
    return col.finish('xresources', baseName(filename), []);
  }

  /* ------------------------------------------------------------------ detection */

  function prepare(text) {
    if (text && typeof text === 'object' && typeof text.byteLength === 'number') {
      if (text.byteLength > MAX_BYTES) return { err: 'size' };
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(text);
      } catch (e) { return { err: 'input' }; }
    }
    if (typeof text !== 'string') return { err: 'input' };
    if (text.length > MAX_BYTES || utf8Length(text, MAX_BYTES) > MAX_BYTES) return { err: 'size' };
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    if (text.indexOf('\u0000') >= 0) return { err: 'binary' };
    text = text.replace(/\r\n?/g, '\n');
    if (!text.trim()) return { err: 'empty' };
    return { text: text };
  }

  function sniff(text, filename) {
    var head = text.replace(/^\s+/, '');
    if (/^(<\?xml|<!DOCTYPE\s+plist|<plist)/i.test(head)) return 'iterm2';
    var noCom = head.replace(/^(\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)+/, '');
    if (noCom[0] === '{' || noCom[0] === '[' && /^\[\s*[{\]]/.test(noCom)) return 'windows-terminal';
    if (/^\s*\[\s*colors(\s*\.|\s*\])/m.test(text) || /^\s*colors\.[\w.]+\s*=/m.test(text)) return 'alacritty';
    if (/^\s*["']?base0[0-9a-f]["']?\s*:/mi.test(text)) {
      return /^\s*["']?base1[0-7]["']?\s*:/mi.test(text) || /^\s*system\s*:\s*["']?base24/mi.test(text) ? 'base24' : 'base16';
    }
    if (/^colors\s*:\s*(#.*)?$/m.test(text)) return 'alacritty';
    if (/^\s*palette\s*=\s*\d+\s*=/m.test(text) ||
      /^\s*(background|foreground|cursor-color|selection-background)\s*=/m.test(text)) return 'ghostty';
    if (/^\s*#\s*define\s/m.test(text) ||
      /^\s*[\w.*?-]*[.*](background|foreground|color\d{1,2}|cursorColor)\s*:/mi.test(text) ||
      /^\s*(background|foreground|color\d{1,2}|cursorColor)\s*:/m.test(text)) return 'xresources';
    if (/^\s*(color\d{1,2}|background|foreground|cursor|selection_background)\s+\S/m.test(text)) return 'kitty';
    var ext = extOf(filename);
    if (ext === '.itermcolors') return 'iterm2';
    if (ext === '.json') return 'windows-terminal';
    if (ext === '.conf') return 'kitty';
    if (ext === '.toml') return 'alacritty';
    if (ext === '.ghostty') return 'ghostty';
    if (ext === '.xresources' || ext === '.xdefaults' || ext === '.ad') return 'xresources';
    return null;
  }

  function detect(text, filename) {
    var p = prepare(text);
    if (p.err) return null;
    return sniff(p.text, filename);
  }

  function parse(text, filename, format) {
    var p = prepare(text);
    if (p.err) return fail(p.err);
    var fmt = format && FORMATS.some(function (f) { return f.id === format; }) ? format : sniff(p.text, filename);
    if (!fmt) return fail('format');
    try {
      switch (fmt) {
        case 'iterm2': return parseIterm(p.text, filename);
        case 'windows-terminal': return parseWt(p.text, filename);
        case 'kitty': return parseKitty(p.text, filename);
        case 'ghostty': return parseGhostty(p.text, filename);
        case 'alacritty': {
          var yaml = !/^\s*\[/m.test(p.text) && /^colors\s*:/m.test(p.text);
          return parseAlacritty(p.text, filename, yaml);
        }
        case 'base16': case 'base24': return parseBase(p.text, filename, fmt);
        case 'xresources': return parseXres(p.text, filename);
      }
    } catch (e) {
      return fail('syntax', fmt);
    }
    return fail('format');
  }

  T.SchemeImport = {
    formats: FORMATS.map(function (f) { return { id: f.id, label: f.label, extensions: f.extensions.slice() }; }),
    maxBytes: MAX_BYTES,
    detect: detect,
    parse: parse
  };
})();
