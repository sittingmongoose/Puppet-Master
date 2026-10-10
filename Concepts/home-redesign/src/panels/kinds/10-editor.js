/* The Editor tab kind (D21; CONTRACT section 2 `editor`; brief 3.6). Ids: file:<path> for project files (and the
   chat's changed files, which open in diff mode), buffer:<n> for given text (read-only unless edit: true; an untitled
   buffer is editable).

   What it draws, inside the tab body only (sizes key on @container pmw-body and api.size(), never the window):
     - one scroller holding a sticky gutter (line numbers, a +/~/! sign column) and the code, so the two can never
       drift; only the visible lines plus a margin are in the DOM, so a 10,000-line buffer scrolls like a 90-line one;
     - per-language colouring from a small sticky-regex tokenizer with a per-line end-state cache (rust, ts/js, svelte,
       css, toml, markdown, sql, json, yaml, bash, dockerfile, xml, log), coloured by --pmw-ed-* tokens per look;
     - the minimap scrollbar, kept and polished per Jared's fixes: it starts below the header plate (the frost never
       shows it), bars, marks and thumb share one mapping, there is no native scrollbar, the thumb keeps its grab
       offset, a track click centres and keeps dragging, Escape cancels, the wheel works over it, the canvas is DPR
       correct and redraws on look and size changes, and it is never hidden (marks only when narrow or switched off);
     - code that visibly scrolls under the header row's frosted plate (J2), sticky scroll, find and replace, go to
       line, a caret and a selection model, typing with undo, and diff mode (side by side from 900 px, inline below).
   Settings (one model): editor.font.size, editor.lineHeight, editor.minimap, editor.stickyScroll,
   editor.stickyScroll.maxLines, editor.diff.layout, editor.scheme (D27: 'follow' or a scheme id from the catalog the
   terminal package publishes on window.PMT; see "Code colour schemes" below). No emoji, no pills, no side stripes:
   diff lines are a tinted row plus a sign glyph. */

var doc = document;
var EDITORS = [];            // live instances (font loads and settings re-measure them)
var untitledSeq = 0;

/* ---- small DOM helpers ---- */
function h(tag, attrs, kids) {
  var el = doc.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (var s in v) el.style.setProperty(s, v[s]); }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  if (kids != null) add(el, kids);
  return el;
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? doc.createTextNode(String(kids)) : kids);
  return el;
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function ico(name, size) { return PMW.icon(name, { size: size || 14 }); }
function basename(p) { return String(p || '').split('/').pop(); }
function keyLabel(k) { return PMW.keyLabel ? PMW.keyLabel(k) : k; }
function reduced() { return PMW.reduced ? PMW.reduced() : false; }
function nowMs() { return Date.now(); }

/* ---- settings this kind adds to the one model (CONTRACT section 12 keys are the core's) ---- */
try {
  PM_HOME.settings.register('editor', {
    'stickyScroll.maxLines': { type: 'number', min: 1, max: 5, label: 'Sticky scroll lines' },
    'diff.sideBySideMin': { type: 'number', min: 600, max: 1600, label: 'Side by side from (px)' },
    'scheme': { type: 'string', label: 'Code colours', detail: "'follow' keeps the look's colours (D21); otherwise a scheme id from the shared catalog (D27)" }
  }, { 'stickyScroll.maxLines': 3, 'diff.sideBySideMin': 900, 'scheme': 'follow' });
} catch (_) {}
function setting(key, dflt) {
  try { var v = PM_HOME.settings.get(key); return v == null ? dflt : v; } catch (_) { return dflt; }
}

/* ======================================================================================================== */
/* Languages and the tokenizer                                                                               */
/* ======================================================================================================== */

/* rule: [stickyRegex, kind | null, next?]; next is a state to push, '@pop', or '@swap:<state>' */
function W(words, flags) { return new RegExp('(?:' + words.split(' ').join('|') + ')\\b', 'y' + (flags || '')); }
var WS = [/\s+/y, null];

var JS_KW = 'import export from as default const let var function return if else for of in while do switch case break ' +
  'continue new class extends implements interface type enum async await yield try catch finally throw typeof ' +
  'instanceof void delete this super null undefined true false static readonly declare';
var JS_ROOT = [
  [/\/\/.*/y, 'com'], [/\/\*/y, 'com', 'jsCom'], [/`/y, 'str', 'jsTpl'],
  [/"(?:[^"\\]|\\.)*"?/y, 'str'], [/'(?:[^'\\]|\\.)*'?/y, 'str'],
  [W(JS_KW), 'kw'], [W('string number boolean any unknown never object'), 'ty'],
  [/0[xX][\da-fA-F_]+n?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?/y, 'num'],
  [/[A-Z][\w$]*/y, 'ty'], [/[a-z_$][\w$]*(?=\s*\()/y, 'fn'], [/[A-Za-z_$][\w$]*/y, null],
  [/=>|\?\.|\.\.\.|[{}()\[\];,.:]/y, 'pun'], [/[=+\-*\/%<>!&|^?~@]+/y, 'op'], WS
];
var JS = {
  root: JS_ROOT,
  jsCom: [[/.*?\*\//y, 'com', '@pop'], [/.+/y, 'com']],
  jsTpl: [[/\\./y, 'esc'], [/\$\{/y, 'pun', 'jsExpr'], [/`/y, 'str', '@pop'], [/[^`\\$]+/y, 'str'], [/\$/y, 'str']],
  jsExpr: [[/\}/y, 'pun', '@pop'], [/\{/y, 'pun', 'jsExpr']].concat(JS_ROOT)
};

var RUST = {
  root: [
    [/\/\/.*/y, 'com'], [/\/\*/y, 'com', 'rsCom'],
    [/b?r(#*)"/y, 'str', 'rsRaw'],
    [/b?"(?:[^"\\]|\\.)*"/y, 'str'], [/b?"(?:[^"\\]|\\.)*$/y, 'str', 'rsStr'],
    [/b?'(?:[^'\\]|\\.(?:\{[\da-fA-F]+\})?)'/y, 'str'], [/'[a-z_]\w*/y, 'mac'],
    [/#!?\[[^\]]*\]?/y, 'attr'], [/[a-z_]\w*!/y, 'mac'],
    [W('as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move ' +
      'mut pub ref return self Self static struct super trait true type unsafe use where while'), 'kw'],
    [W('u8 u16 u32 u64 u128 usize i8 i16 i32 i64 i128 isize f32 f64 bool char str'), 'ty'],
    [/0x[\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?(?:[iuf](?:8|16|32|64|128|size))?/y, 'num'],
    [/[A-Z][A-Za-z0-9_]*/y, 'ty'], [/[a-z_]\w*(?=\s*(?:::<[^>]*>)?\()/y, 'fn'], [/[A-Za-z_]\w*/y, null],
    [/::|->|=>|[{}()\[\];,.:]/y, 'pun'], [/[=+\-*\/%<>!&|^?@]+/y, 'op'], WS
  ],
  rsCom: [[/.*?\*\//y, 'com', '@pop'], [/.+/y, 'com']],
  rsStr: [[/(?:[^"\\]|\\.)*"/y, 'str', '@pop'], [/.+/y, 'str']],
  rsRaw: [[/.*?"#*/y, 'str', '@pop'], [/.+/y, 'str']]
};

var CSS_VALUE = [
  [/\/\*/y, 'com', 'cssCom'], [/"(?:[^"\\]|\\.)*"?/y, 'str'], [/'(?:[^'\\]|\\.)*'?/y, 'str'],
  [/#[\da-fA-F]{3,8}\b/y, 'num'], [/--[\w-]+/y, 'var'], [/!important\b/y, 'kw'],
  [/-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem|%|ms|s|deg|vh|vw|fr|ch|ex)?/y, 'num'],
  [/[\w-]+(?=\()/y, 'fn'], [/[\w-]+/y, null], [/[;:,()\/*+]/y, 'pun'], WS
];
var CSS = {
  root: [
    [/\/\*/y, 'com', 'cssCom'], [/@[\w-]+/y, 'kw'], [/\{/y, 'pun', 'cssBlock'], [/\}/y, 'pun'],
    [/[.#][\w-]+/y, 'ty'], [/::?[\w-]+/y, 'kw'], [/\[[^\]]*\]?/y, 'attr'], [/[a-z][\w-]*/y, 'tag'],
    [/"(?:[^"\\]|\\.)*"?/y, 'str'], [/[>+~,*()&]/y, 'pun'], [/\d+%?/y, 'num'], WS
  ],
  cssBlock: [[/\}/y, 'pun', '@pop'], [/\{/y, 'pun', 'cssBlock'], [/--[\w-]+(?=\s*:)/y, 'var'], [/[\w-]+(?=\s*:(?!:))/y, 'prop']].concat(CSS_VALUE),
  cssCom: [[/.*?\*\//y, 'com', '@pop'], [/.+/y, 'com']]
};

/* markup: Svelte, XML and HTML share the tag rules; Svelte adds script and style blocks and {expressions} */
function markup(svelte) {
  var root = [
    [/<!--/y, 'com', 'mkCom'], [/<\?[\w-]+/y, 'mac', 'mkPi'], [/<!\w+[^>]*>?/y, 'mac']
  ];
  if (svelte) {
    root.push([/<script\b/y, 'tag', 'mkScriptTag'], [/<style\b/y, 'tag', 'mkStyleTag'],
      [/\{[#:\/@][a-z]+/y, 'kw', 'jsExprSv'], [/\{/y, 'pun', 'jsExprSv']);
  }
  root.push([/<\/?[A-Z][\w.]*/y, 'ty', 'mkTag'], [/<\/?[a-z][\w:.-]*/y, 'tag', 'mkTag'], [/&#?\w+;/y, 'esc'],
    [svelte ? /[^<{&]+/y : /[^<&]+/y, null]);
  var attrs = [
    [/[\w:|.-]+(?=\s*=)/y, 'attr'], [/[\w:|.-]+/y, 'attr'], [/=/y, 'pun'],
    [/"[^"]*"?/y, 'str'], [/'[^']*'?/y, 'str'], WS
  ];
  if (svelte) attrs.splice(3, 0, [/\{/y, 'pun', 'jsExprSv']);
  var st = {
    root: root,
    mkCom: [[/.*?-->/y, 'com', '@pop'], [/.+/y, 'com']],
    mkPi: [[/\?>/y, 'mac', '@pop']].concat(attrs),
    mkTag: [[/\/?>/y, 'tag', '@pop']].concat(attrs)
  };
  if (svelte) {
    st.jsExprSv = [[/\}/y, 'pun', '@pop'], [/\{/y, 'pun', 'jsExprSv']].concat(JS_ROOT);
    st.mkScriptTag = [[/>/y, 'tag', '@swap:mkScript']].concat(attrs);
    st.mkScript = [[/<\/script>/y, 'tag', '@pop'], [/\/\*/y, 'com', 'jsCom'], [/`/y, 'str', 'jsTpl']].concat(JS_ROOT);
    st.mkStyleTag = [[/>/y, 'tag', '@swap:mkStyle']].concat(attrs);
    st.mkStyle = [[/<\/style>/y, 'tag', '@pop']].concat(CSS.root);
    st.jsCom = JS.jsCom; st.jsTpl = JS.jsTpl; st.jsExpr = JS.jsExpr;
    st.cssBlock = CSS.cssBlock; st.cssCom = CSS.cssCom;
  }
  return st;
}
var SVELTE = markup(true), XML = markup(false);

var MD = {
  root: [
    [/^\s*```.*$/y, 'code', 'mdFence'], [/^#{1,6}\s.*$/y, 'head'], [/^\s*>.*$/y, 'com'],
    [/^\s*(?:[-*+]|\d+\.)(?=\s)/y, 'pun'], [/^\s*(?:-{3,}|\*{3,})\s*$/y, 'pun'],
    [/`[^`]+`/y, 'code'], [/\*\*[^*]+\*\*/y, 'strong'],
    [/\*[^*\s][^*]*\*/y, 'emph'], [/(?<![\w])_[^_\s][^_]*_(?![\w])/y, 'emph'],
    [/!?\[[^\]]*\]\([^)]*\)/y, 'link'], [/<[^>]+>/y, 'tag'], [/[^`*_\[!<]+/y, null]
  ],
  mdFence: [[/^\s*```\s*$/y, 'code', '@pop'], [/.+/y, 'code']]
};

var SQL = {
  root: [
    [/--.*/y, 'com'], [/\/\*/y, 'com', 'sqlCom'], [/'(?:[^']|'')*'?/y, 'str'], [/"[^"]*"?/y, 'prop'],
    [W('select from where and or not null is in exists join left right inner outer full cross on using group by order ' +
      'having limit offset union all distinct as case when then else end insert into values update set delete returning ' +
      'create alter drop table index unique primary key foreign references constraint default check cascade restrict ' +
      'if concurrently include with recursive begin commit rollback analyze explain asc desc nulls first last generated ' +
      'always stored between like ilike coalesce now', 'i'), 'kw'],
    [W('bigint bigserial int integer smallint serial text varchar char boolean bool timestamptz timestamp date time ' +
      'interval uuid jsonb json numeric decimal real double precision bytea tsvector', 'i'), 'ty'],
    [/\d+(?:\.\d+)?/y, 'num'], [/\$\d+/y, 'var'], [/[A-Za-z_]\w*(?=\s*\()/y, 'fn'], [/[A-Za-z_]\w*/y, null],
    [/[(),;.]/y, 'pun'], [/[=<>!+\-*\/%|:~]+/y, 'op'], WS
  ],
  sqlCom: [[/.*?\*\//y, 'com', '@pop'], [/.+/y, 'com']]
};

var TOML = {
  root: [
    [/#.*/y, 'com'], [/^\s*\[\[?[^\]]*\]\]?/y, 'head'], [/[A-Za-z0-9_.-]+(?=\s*=)/y, 'prop'],
    [/"""/y, 'str', 'tomlMl'], [/"(?:[^"\\]|\\.)*"?/y, 'str'], [/'[^']*'?/y, 'str'], [W('true false'), 'kw'],
    [/\d{4}-\d\d-\d\d(?:[T ][\d:.]+Z?)?|[+-]?\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/y, 'num'],
    [/[=,{}\[\]]/y, 'pun'], WS, [/[^\s=,{}\[\]#"']+/y, null]
  ],
  tomlMl: [[/.*?"""/y, 'str', '@pop'], [/.+/y, 'str']]
};

var JSON_L = {
  root: [
    [/"(?:[^"\\]|\\.)*"(?=\s*:)/y, 'prop'], [/"(?:[^"\\]|\\.)*"?/y, 'str'], [W('true false null'), 'kw'],
    [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, 'num'], [/[{}\[\],:]/y, 'pun'], WS
  ]
};

var YAML = {
  root: [
    [/(?<=^|\s)#.*/y, 'com'], [/^\s*-(?=\s|$)/y, 'pun'],
    [/(?<=^\s*(?:-\s+)?)[\w.\/-]+(?=\s*:(?:\s|$))/y, 'prop'],
    [/"(?:[^"\\]|\\.)*"?/y, 'str'], [/'[^']*'?/y, 'str'],
    [W('true false null yes no on off'), 'kw'], [/[&*][\w-]+/y, 'mac'],
    [/-?\d+(?:\.\d+)?(?=\s|$|,|\])/y, 'num'], [/[:{}\[\],|>]/y, 'pun'], WS, [/[^\s:#"'{}\[\],]+/y, null]
  ]
};

var SH_RULES = [
  [/(?<=^|\s)#.*/y, 'com'], [/"/y, 'str', 'shDq'], [/'[^']*'?/y, 'str'],
  [/\$(?:\{[^}]*\}|[A-Za-z_]\w*|[0-9@#?$!*-])/y, 'var'],
  [W('if then else elif fi for in do done case esac while until function return export local readonly set unset'), 'kw'],
  [/(?<=^\s*|[|;&]\s*|\b(?:then|do|else|sudo|exec|time)\s+)[\w.\/-]+/y, 'fn'],
  [/--?[\w-]+/y, 'attr'], [/&&|\|\||[|;<>&]/y, 'op'], WS, [/[^\s"'$|;&<>#]+/y, null]
];
var SH = {
  root: SH_RULES,
  shDq: [[/\\./y, 'esc'], [/\$(?:\{[^}]*\}|[A-Za-z_]\w*|[0-9@#?$!*-])/y, 'var'], [/"/y, 'str', '@pop'], [/[^"\\$]+/y, 'str'], [/\$/y, 'str']]
};
var DOCKER = {
  root: [
    [/^\s*#.*/y, 'com'],
    [/^\s*(?:FROM|RUN|CMD|COPY|ADD|WORKDIR|EXPOSE|ENV|ARG|ENTRYPOINT|LABEL|USER|VOLUME|HEALTHCHECK|SHELL|ONBUILD|STOPSIGNAL|MAINTAINER)\b/yi, 'kw'],
    [/\bAS\b/y, 'kw'], [/--[\w-]+(?:=\S*)?/y, 'attr'], [/\[|\]|,/y, 'pun']
  ].concat(SH_RULES),
  shDq: SH.shDq
};
var LOG = {
  root: [
    [/^\d{4}-\d\d-\d\dT[\d:.]+Z?/y, 'com'], [/\b(?:ERROR|error)\b:?/y, 'bad'], [/\b(?:WARN|warning)\b:?/y, 'warn'],
    [/\bINFO\b/y, 'fn'], [/^\s*(?:Compiling|Finished|Running|Checking)\b/y, 'kw'],
    [/[\w.\/-]+\.\w+:\d+(?::\d+)?/y, 'link'], [/`[^`]*`/y, 'code'], [/^\s*#.*/y, 'com'],
    [/\d+(?:\.\d+)?(?:s|ms|%)?\b/y, 'num'], WS, [/[A-Za-z_][\w.:-]*/y, null]
  ]
};
var PLAIN = { root: [] };

var LANGS = {
  rust: { name: 'Rust', st: RUST, scopes: 'brace' },
  js: { name: 'JavaScript', st: JS, scopes: 'brace' },
  ts: { name: 'TypeScript', st: JS, scopes: 'brace' },
  svelte: { name: 'Svelte', st: SVELTE, scopes: 'indent' },
  css: { name: 'CSS', st: CSS, scopes: 'brace' },
  toml: { name: 'TOML', st: TOML, scopes: 'section' },
  md: { name: 'Markdown', st: MD, scopes: 'heading' },
  sql: { name: 'SQL', st: SQL, scopes: 'indent' },
  json: { name: 'JSON', st: JSON_L, scopes: 'brace' },
  yaml: { name: 'YAML', st: YAML, scopes: 'indent' },
  sh: { name: 'Bash', st: SH, scopes: 'indent' },
  dockerfile: { name: 'Dockerfile', st: DOCKER, scopes: 'none' },
  xml: { name: 'XML', st: XML, scopes: 'indent' },
  log: { name: 'Log', st: LOG, scopes: 'none' },
  text: { name: 'Plain text', st: PLAIN, scopes: 'none' }
};
var LANG_ALIAS = { rs: 'rust', javascript: 'js', typescript: 'ts', jsx: 'js', tsx: 'ts', mjs: 'js', cjs: 'js', markdown: 'md',
  yml: 'yaml', bash: 'sh', zsh: 'sh', shell: 'sh', html: 'xml', svg: 'xml', plaintext: 'text', plain: 'text', txt: 'text',
  docker: 'dockerfile' };
function langOf(path, given) {
  var g = String(given || '').toLowerCase();
  if (g) { g = LANG_ALIAS[g] || g; if (LANGS[g]) return g; }
  var name = basename(path).toLowerCase();
  if (name === 'dockerfile' || /\.dockerfile$/.test(name)) return 'dockerfile';
  var m = /\.([a-z0-9]+)$/.exec(name);
  var ext = m ? m[1] : '';
  ext = LANG_ALIAS[ext] || ext;
  return LANGS[ext] ? ext : 'text';
}

/* one line: returns { toks: [[start, end, kind]], end: state }. The state is a '>'-joined stack. */
function tokenizeLine(lang, text, state) {
  var table = LANGS[lang] ? LANGS[lang].st : PLAIN;
  var out = [];
  if (!table.root.length || !text) {
    if (text) out.push([0, text.length, null]);
    return { toks: out, end: state || 'root' };
  }
  var stack = (state || 'root').split('>');
  var pos = 0, n = text.length, guard = 0;
  function emit(len, kind) {
    var last = out[out.length - 1];
    if (last && last[2] === kind && last[1] === pos) last[1] += len; else out.push([pos, pos + len, kind]);
    pos += len;
  }
  scan: while (pos < n && guard++ < 20000) {
    var rules = table[stack[stack.length - 1]] || table.root;
    for (var i = 0; i < rules.length; i++) {
      var re = rules[i][0];
      re.lastIndex = pos;
      var m = re.exec(text);
      if (!m || !m[0].length) continue;
      emit(m[0].length, rules[i][1]);
      var next = rules[i][2];
      if (next === '@pop') { if (stack.length > 1) stack.pop(); }
      else if (next && next.indexOf('@swap:') === 0) stack[stack.length - 1] = next.slice(6);
      else if (next) stack.push(next);
      continue scan;
    }
    emit(1, null);
  }
  if (pos < n) emit(n - pos, null);
  return { toks: out, end: stack.join('>') };
}

/* ======================================================================================================== */
/* Documents                                                                                                  */
/* ======================================================================================================== */

var FILES = {};          // path -> { lines, base, conflicts } (parsed from CORPUS at setup)
var CHAT = {};           // path -> the chat's change record (hunks only)
var BINARY = {
  'src/.DS_Store': { reason: 'Binary file', detail: '6,148 bytes · macOS Finder metadata',
    note: 'Ignored by the project and skipped by the indexer. Open it with an outside tool if you need the bytes.' },
  'binary-asset.bin': { reason: 'Binary file', detail: '1,048,576 bytes · application/octet-stream',
    note: 'Marked read-only in the file manager. The editor does not decode it as text; use a hex viewer.' }
};
var DOCS = {};           // path -> doc (one per path, shared, kept for the session so a reopened file keeps its edits)

function splitLines(text) { return String(text == null ? '' : text).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n'); }

function newDoc(o) {
  var d = {
    path: o.path || null, title: o.title || null, lang: langOf(o.path || '', o.language),
    lines: o.lines || [''], base: o.base || null, conflicts: o.conflicts || [], chat: o.chat || null,
    binary: o.binary || null, missing: !!o.missing,
    readOnly: o.readOnly || null, version: 1, savedVersion: 1, savedLines: null,
    toks: [], ends: [], tokFrom: 0, tokConverge: -1, tokValidTo: 0, guess: {}, bg: 0,
    marks: null, scopes: null, scopesVer: -1, maxCols: 0, maxVer: -1,
    undo: [], redo: [], views: []
  };
  d.savedLines = d.lines.slice();
  return d;
}

function docForPath(path) {
  if (DOCS[path]) return DOCS[path];
  var f = FILES[path], d;
  if (f) d = newDoc({ path: path, lines: f.lines.slice(), base: f.base ? f.base.slice() : null, conflicts: f.conflicts || [] });
  else if (CHAT[path]) d = newDoc({ path: path, lines: [''], chat: CHAT[path], language: CHAT[path].language, readOnly: 'A change record' });
  else if (BINARY[path]) d = newDoc({ path: path, binary: BINARY[path], readOnly: 'Binary file' });
  else d = newDoc({ path: path, missing: true, readOnly: 'Not in this project' });
  DOCS[path] = d;
  return d;
}

/* ---- tokens: cached per line with the end state; an edit invalidates from its line until the state converges ---- */
function tokensOf(d, i, guess) {
  if (i < d.tokFrom && d.toks[i]) return d.toks[i];
  if (guess && i - d.tokFrom > 300) {
    // far ahead of the tokenized prefix (a jump in a long file): colour this line from a clean state for now and let
    // the background pass catch up; the rows are redrawn when it gets there
    scheduleTokens(d);
    var g = d.guess[i];
    if (!g) { g = tokenizeLine(d.lang, d.lines[i] || '', 'root').toks; d.guess[i] = g; }
    return g;
  }
  var j = Math.min(d.tokFrom, i);
  while (j <= i) {
    var prev = j > 0 ? d.ends[j - 1] : 'root';
    var old = d.ends[j];
    var r = tokenizeLine(d.lang, d.lines[j] || '', prev);
    d.toks[j] = r.toks; d.ends[j] = r.end;
    d.tokFrom = Math.max(d.tokFrom, j + 1);
    if (j > d.tokConverge && old === r.end && d.tokValidTo > j + 1) {
      // converged past the edit: the cached lines after it are still right
      d.tokFrom = d.tokValidTo; d.tokValidTo = 0;
    }
    j = d.tokFrom;
  }
  return d.toks[i];
}
function scheduleTokens(d) {
  if (d.bg || d.tokFrom >= d.lines.length) return;
  d.bg = setTimeout(function step() {
    var end = Math.min(d.lines.length - 1, d.tokFrom + 1200);
    if (d.tokFrom <= end) tokensOf(d, end);
    var done = d.tokFrom >= d.lines.length;
    d.views.forEach(function (v) { v.tokensReady(done); });
    if (done) { d.bg = 0; d.guess = {}; } else d.bg = setTimeout(step, 12);
  }, 40);
}
function invalidateTokens(d, line, removed, inserted) {
  d.guess = {};
  // keep the cache arrays aligned with the lines, then re-tokenize from `line` until the end state matches again
  var oldFrom = d.tokFrom, k, nulls = [], ends = [];
  for (k = 0; k < inserted; k++) { nulls.push(null); ends.push('\u0000'); }
  d.toks.splice.apply(d.toks, [line, removed].concat(nulls));
  d.ends.splice.apply(d.ends, [line, removed].concat(ends));
  d.tokValidTo = oldFrom > line + removed ? oldFrom - removed + inserted : 0;
  d.tokConverge = line + inserted - 1;
  d.tokFrom = Math.min(oldFrom, line);
}

function maxColsOf(d) {
  if (d.maxVer === d.version) return d.maxCols;
  var m = 0;
  for (var i = 0; i < d.lines.length; i++) if (d.lines[i].length > m) m = d.lines[i].length;
  d.maxCols = m; d.maxVer = d.version;
  return m;
}

/* ======================================================================================================== */
/* Diff: the chat's hunk shape ({ kind: ctx|add|del|meta, old, new, text }), derived for project files from    */
/* the base and the current text with a small LCS line diff                                                    */
/* ======================================================================================================== */

function diffLines(a, b) {
  var p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
  var s = 0; while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  var A = a.slice(p, a.length - s), B = b.slice(p, b.length - s), n = A.length, m = B.length, rows = [], i, j;
  for (i = 0; i < p; i++) rows.push({ kind: 'ctx', old: i + 1, new: i + 1, text: a[i] });
  if (n * m > 4e6) {
    A.forEach(function (t, k) { rows.push({ kind: 'del', old: p + k + 1, new: null, text: t }); });
    B.forEach(function (t, k) { rows.push({ kind: 'add', old: null, new: p + k + 1, text: t }); });
  } else {
    var L = [];
    for (i = 0; i <= n; i++) L.push(new Uint32Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && A[i] === B[j]) { rows.push({ kind: 'ctx', old: p + i + 1, new: p + j + 1, text: A[i] }); i++; j++; }
      else if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) { rows.push({ kind: 'del', old: p + i + 1, new: null, text: A[i] }); i++; }
      else { rows.push({ kind: 'add', old: null, new: p + j + 1, text: B[j] }); j++; }
    }
  }
  for (var k = 0; k < s; k++) rows.push({ kind: 'ctx', old: a.length - s + k + 1, new: b.length - s + k + 1, text: a[a.length - s + k] });
  // inside a change block, dels come before adds (pairing relies on it)
  var out = [], blk = null;
  function flush() { if (blk) { out.push.apply(out, blk.d.concat(blk.a)); blk = null; } }
  rows.forEach(function (r) {
    if (r.kind === 'ctx') { flush(); out.push(r); return; }
    if (!blk) blk = { d: [], a: [] };
    (r.kind === 'del' ? blk.d : blk.a).push(r);
  });
  flush();
  return out;
}

function toHunks(rows, C) {
  C = C == null ? 3 : C;
  var ch = [], spans = [], k;
  for (k = 0; k < rows.length; k++) if (rows[k].kind !== 'ctx') ch.push(k);
  ch.forEach(function (x) { var last = spans[spans.length - 1]; if (last && x - last[1] <= 2 * C + 1) last[1] = x; else spans.push([x, x]); });
  return spans.map(function (sp) {
    var a = Math.max(0, sp[0] - C), b = Math.min(rows.length, sp[1] + C + 1);
    if (a <= 2) a = 0;                                   // never fold one or two lines at the edges
    if (rows.length - b <= 2) b = rows.length;
    var lines = rows.slice(a, b);
    var o = lines.filter(function (l) { return l.old != null; }), nw = lines.filter(function (l) { return l.new != null; });
    var oldStart = o.length ? o[0].old : 0, newStart = nw.length ? nw[0].new : 0;
    return { header: '@@ -' + oldStart + ',' + o.length + ' +' + newStart + ',' + nw.length + ' @@', oldStart: oldStart,
      oldLines: o.length, newStart: newStart, newLines: nw.length, lines: lines, from: a, to: b };
  });
}

/* word marks on a paired row (only when the two lines are at least 40 % alike, else the row tint says enough) */
function wordDiff(x, y) {
  var tx = x.match(/\w+|\s+|[^\w\s]/g) || [], ty = y.match(/\w+|\s+|[^\w\s]/g) || [];
  if (tx.length * ty.length > 40000) return null;
  var n = tx.length, m = ty.length, L = [], i, j;
  for (i = 0; i <= n; i++) L.push(new Uint16Array(m + 1));
  for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = tx[i] === ty[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  var left = [], right = [], px = 0, py = 0, same = 0;
  function mark(arr, s, e) { var last = arr[arr.length - 1]; if (last && last[1] === s) last[1] = e; else arr.push([s, e]); }
  i = 0; j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && tx[i] === ty[j]) { same += tx[i].length; px += tx[i].length; py += ty[j].length; i++; j++; }
    else if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) { mark(left, px, px + tx[i].length); px += tx[i].length; i++; }
    else { mark(right, py, py + ty[j].length); py += ty[j].length; j++; }
  }
  var big = Math.max(x.length, y.length) || 1;
  if (same / big < 0.4) return null;
  return { left: left, right: right };
}

/* source-mode marks for the current text: per line '', 'add', 'mod', 'conf'; deletions as counts before a line */
function computeMarks(d) {
  if (!d.base) { d.marks = null; return null; }
  var rows = diffLines(d.base, d.lines);
  var kinds = new Array(d.lines.length), dels = {}, changes = [], i = 0;
  for (var q = 0; q < kinds.length; q++) kinds[q] = '';
  while (i < rows.length) {
    if (rows[i].kind === 'ctx') { i++; continue; }
    var ds = [], as = [];
    while (i < rows.length && rows[i].kind === 'del') ds.push(rows[i++]);
    while (i < rows.length && rows[i].kind === 'add') as.push(rows[i++]);
    var firstNew = as.length ? as[0].new - 1 : (i < rows.length && rows[i].new != null ? rows[i].new - 1 : d.lines.length);
    changes.push(firstNew);
    as.forEach(function (a, k) { kinds[a.new - 1] = k < ds.length ? 'mod' : 'add'; });
    if (ds.length > as.length) {
      var at = as.length ? as[as.length - 1].new : firstNew;   // the line after the block
      dels[at] = (dels[at] || 0) + ds.length - as.length;
    }
  }
  var conf = {};
  (d.conflicts || []).forEach(function (t) { conf[t] = 1; });
  for (var c = 0; c < kinds.length; c++) if (kinds[c] && conf[d.lines[c]]) kinds[c] = 'conf';
  var add = 0, del = 0;
  rows.forEach(function (r) { if (r.kind === 'add') add++; else if (r.kind === 'del') del++; });
  d.marks = { kinds: kinds, dels: dels, changes: changes, rows: rows, add: add, del: del, ver: d.version };
  return d.marks;
}
function marksOf(d) { if (d.base && (!d.marks || d.marks.ver !== d.version)) computeMarks(d); return d.marks; }

/* the chat's records: hunks parsed into { kind, old, new, text } with the numbers the record carries */
function parseChatHunks(rec) {
  return rec.hunks.map(function (hk) {
    var o = hk[0], n = hk[1], oldLines = 0, newLines = 0;
    var lines = hk[2].split('\n').map(function (l) {
      var s = l.charAt(0), t = l.slice(1);
      if (s === '+') { newLines++; return { kind: 'add', old: null, new: n++, text: t }; }
      if (s === '-') { oldLines++; return { kind: 'del', old: o++, new: null, text: t }; }
      if (s === '\\') return { kind: 'meta', old: null, new: null, text: t };
      oldLines++; newLines++; return { kind: 'ctx', old: o++, new: n++, text: t };
    });
    return { header: '@@ -' + hk[0] + ',' + oldLines + ' +' + hk[1] + ',' + newLines + ' @@', oldStart: hk[0], oldLines: oldLines,
      newStart: hk[1], newLines: newLines, lines: lines };
  });
}

/* ======================================================================================================== */
/* Scopes (sticky scroll and the breadcrumb's symbol)                                                         */
/* ======================================================================================================== */

var CONT_RE = /^(?:\)|->|where\b|\.|\{|\}|=>|\|)/;
function headerOf(lines, st) {
  var i = st;
  while (i > 0 && (CONT_RE.test(lines[i].trim()) || !lines[i].trim())) i--;
  return i;
}
function scopesOf(d) {
  if (d.scopesVer === d.version && d.scopes) return d.scopes;
  var mode = (LANGS[d.lang] || LANGS.text).scopes, lines = d.lines, out = [], i;
  if (mode === 'brace' && lines.length > 3000 && d.tokFrom < lines.length) { scheduleTokens(d); return []; }
  if (lines.length > 60000) mode = 'none';
  if (mode === 'brace') {
    var open = [];
    for (i = 0; i < lines.length; i++) {
      var toks = tokensOf(d, i);
      for (var t = 0; t < toks.length; t++) {
        if (toks[t][2] !== 'pun') continue;
        for (var c = toks[t][0]; c < toks[t][1]; c++) {
          var ch = lines[i].charAt(c);
          if (ch === '{') open.push(i);
          else if (ch === '}') { var st = open.pop(); if (st != null && i - st >= 2) out.push({ start: headerOf(lines, st), end: i }); }
        }
      }
    }
  } else if (mode === 'heading') {
    var heads = [];
    var fence = false;
    for (i = 0; i < lines.length; i++) {
      if (/^\s*```/.test(lines[i])) fence = !fence;
      var m = !fence && /^(#{1,6})\s/.exec(lines[i]);
      if (m) heads.push({ start: i, level: m[1].length });
    }
    heads.forEach(function (hd, k) {
      var end = lines.length - 1;
      for (var q = k + 1; q < heads.length; q++) if (heads[q].level <= hd.level) { end = heads[q].start - 1; break; }
      if (end - hd.start >= 2) out.push({ start: hd.start, end: end });
    });
  } else if (mode === 'section') {
    var secs = [];
    for (i = 0; i < lines.length; i++) if (/^\s*\[/.test(lines[i])) secs.push(i);
    secs.forEach(function (s0, k) { var end = (k + 1 < secs.length ? secs[k + 1] : lines.length) - 1; if (end - s0 >= 2) out.push({ start: s0, end: end }); });
  } else if (mode === 'indent') {
    var ind = lines.map(function (l) { return l.trim() ? l.length - l.replace(/^\s+/, '').length : -1; });
    for (i = 0; i < lines.length; i++) {
      if (ind[i] < 0) continue;
      var j = i + 1; while (j < lines.length && ind[j] < 0) j++;
      if (j >= lines.length || ind[j] <= ind[i]) continue;
      var end2 = j;
      for (var k2 = j; k2 < lines.length; k2++) { if (ind[k2] < 0) continue; if (ind[k2] <= ind[i]) break; end2 = k2; }
      if (end2 - i >= 2) out.push({ start: i, end: end2 });
    }
  }
  // one scope per header line (the outermost), outer before inner
  var seen = {};
  out.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
  out = out.filter(function (s) { if (seen[s.start]) return false; seen[s.start] = 1; return true; });
  d.scopes = out; d.scopesVer = d.version;
  return out;
}
function symbolName(text, lang) {
  var t = String(text || '').trim(), m;
  if (lang === 'md') return t.replace(/^#+\s*/, '');
  if (lang === 'toml') return t;
  if ((m = /\bimpl(?:<[^>]*>)?\s+(?:([\w:<>]+)\s+for\s+)?([\w:]+)/.exec(t))) return m[1] ? m[1] + ' for ' + m[2] : 'impl ' + m[2];
  if ((m = /\b(?:fn|struct|enum|trait|mod|union|type)\s+([A-Za-z_]\w*)/.exec(t))) return m[1];
  if ((m = /\b(?:function\*?|class|interface)\s+([A-Za-z_$][\w$]*)/.exec(t))) return m[1];
  if ((m = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/.exec(t))) return m[1];
  if ((m = /\bCREATE\s+(?:UNIQUE\s+)?(?:TABLE|INDEX|VIEW)\s+(?:CONCURRENTLY\s+)?(?:IF NOT EXISTS\s+)?([\w.]+)/i.exec(t))) return m[1];
  if ((m = /^<([\w:-]+)/.exec(t))) return '<' + m[1] + '>';
  if ((m = /^(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/.exec(t))) return m[1];
  if ((m = /^(?:-\s+)?([\w.\/-]+)\s*:/.exec(t)) && (lang === 'yaml')) return m[1];
  return t.length > 42 ? t.slice(0, 40) + '…' : t;
}

/* ======================================================================================================== */
/* Find                                                                                                       */
/* ======================================================================================================== */

function findPattern(q, o) {
  if (!q) return { re: null };
  var src = o.regex ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (o.word) src = '\\b(?:' + src + ')\\b';
  try { return { re: new RegExp(src, o.caseSensitive ? 'g' : 'gi'), src: src }; } catch (e) { return { re: null, error: 'Invalid pattern' }; }
}
function findAll(count, textAt, q, o, cap) {
  cap = cap || 9999;
  var pat = findPattern(q, o);
  if (!pat.re) return { hits: [], error: pat.error || null };
  var re = pat.re, hits = [];
  for (var r = 0; r < count && hits.length < cap; r++) {
    var t = textAt(r);
    if (t == null || !t) continue;
    re.lastIndex = 0;
    var m;
    while ((m = re.exec(t)) && hits.length < cap) {
      if (!m[0].length) { re.lastIndex++; continue; }
      hits.push({ r: r, s: m.index, e: m.index + m[0].length, side: textAt.side ? textAt.side(r) : 'r' });
    }
  }
  return { hits: hits, capped: hits.length >= cap, src: pat.src };
}

/* go to line: "12", "12:5", ":12", "-1" (the last line) */
function parseGoto(s, n) {
  var m = /^\s*:?\s*(-?\d+)?\s*(?:[:,]\s*(\d+))?\s*$/.exec(s);
  if (!m || (!m[1] && !m[2])) return null;
  var line = m[1] != null ? +m[1] : null;
  if (line != null && line < 0) line = n + line + 1;
  return { line: clamp(line == null ? 1 : line, 1, Math.max(1, n)), col: m[2] ? Math.max(+m[2], 1) : 1 };
}

/* ======================================================================================================== */
/* The editor instance                                                                                        */
/* ======================================================================================================== */

var SIGN = { add: '+', mod: '~', conf: '!', del: '-' };
var KIND_WORD = { add: 'added', mod: 'changed', conf: 'in conflict', del: 'removed' };
var SIDE_MIN_DEFAULT = 900, SIDE_HYST = 48, NARROW_TRACK_W = 420;
var STATUS_WORD = { added: 'Added', modified: 'Modified', deleted: 'Deleted', renamed: 'Renamed' };


/* ======================================================================================================== */
/* The rows' stylesheet. The code is drawn inside a shadow root so the page's ~12,000 rules (about 900 of them  */
/* unkeyed) never match its elements: style and layout for a new screen of rows drops from about 70 ms to     */
/* about 1 ms. Every colour and every look difference comes in through inherited --pmw-ed-* tokens            */
/* (css/60-kind-editor.css), so the looks still live in one place.                                            */
/* ======================================================================================================== */
var SHADOW_CSS = [
  '.pmw-ed-sizer { position: relative; isolation: isolate; min-width: 100%; background: var(--pmw-ed-sizer-bg, transparent); }',
  '.pmw-ed-bands, .pmw-ed-ov, .pmw-ed-sels, .pmw-ed-carets { position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; }',
  '.pmw-ed-sels { z-index: var(--pmw-ed-sel-z, -1); mix-blend-mode: var(--pmw-ed-sel-blend, normal); }',
  '.pmw-ed-carets { z-index: 1; mix-blend-mode: var(--pmw-ed-caret-blend, normal); }',
  '.pmw-ed-rows { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }',
  '.pmw-ed-row { position: absolute; left: 0; width: 100%; height: var(--pmw-ed-lh); display: flex; white-space: pre; }',
  '.pmw-ed-row:is(.is-add, .is-mod, .is-conf, .is-del)::before, .pmw-ed-half::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; }',
  '.pmw-ed-row.is-add::before, .pmw-ed-half.is-add::before { background: var(--pmw-ed-add-bg); }',
  '.pmw-ed-row.is-mod::before { background: var(--pmw-ed-mod-bg); }',
  '.pmw-ed-row.is-conf::before { background: var(--pmw-ed-conf-bg); }',
  '.pmw-ed-row.is-del::before, .pmw-ed-half.is-del::before { background: var(--pmw-ed-del-bg); }',
  '.pmw-ed-half.is-empty::before { background: color-mix(in srgb, var(--pmw-ed-fg) 3%, transparent); }',
  '.pmw-ed-row.is-sbs::before { display: none; }',
  '.pmw-ed-gut { position: sticky; left: 0; z-index: 2; flex: none; display: flex; width: var(--pmw-ed-gut, 54px); height: 100%; background: var(--pmw-ed-gutbg); }',
  '.pmw-ed-row.is-add .pmw-ed-gut, .pmw-ed-half.is-add .pmw-ed-gut { background: linear-gradient(var(--pmw-ed-add-bg), var(--pmw-ed-add-bg)), var(--pmw-ed-gutbg); }',
  '.pmw-ed-row.is-mod .pmw-ed-gut { background: linear-gradient(var(--pmw-ed-mod-bg), var(--pmw-ed-mod-bg)), var(--pmw-ed-gutbg); }',
  '.pmw-ed-row.is-conf .pmw-ed-gut { background: linear-gradient(var(--pmw-ed-conf-bg), var(--pmw-ed-conf-bg)), var(--pmw-ed-gutbg); }',
  '.pmw-ed-row.is-del .pmw-ed-gut, .pmw-ed-half.is-del .pmw-ed-gut { background: linear-gradient(var(--pmw-ed-del-bg), var(--pmw-ed-del-bg)), var(--pmw-ed-gutbg); }',
  '.pmw-ed-ln { flex: none; width: var(--pmw-ed-lnw, 40px); box-sizing: border-box; padding-right: 6px; text-align: right; color: var(--pmw-ed-ln); font-size: max(11px, calc(var(--pmw-ed-fs, 13px) - 1px)); font-variant-numeric: tabular-nums; }',
  '.pmw-ed-ln.is-old { opacity: .78; }',
  '.pmw-ed-row.is-cur .pmw-ed-ln { color: var(--pmw-ed-ln-cur); }',
  '.pmw-ed-sg { position: relative; flex: none; width: 16px; text-align: center; font-weight: 700; color: var(--pmw-ed-ln); }',
  '.pmw-ed-row.is-add .pmw-ed-sg, .pmw-ed-half.is-add .pmw-ed-sg { color: var(--pmw-ed-sg-ink, var(--pmw-ed-add-fg)); background: var(--pmw-ed-sg-fill-add, transparent); }',
  '.pmw-ed-row.is-mod .pmw-ed-sg { color: var(--pmw-ed-sg-ink, var(--pmw-ed-mod-fg)); background: var(--pmw-ed-sg-fill-mod, transparent); }',
  '.pmw-ed-row.is-conf .pmw-ed-sg { color: var(--pmw-ed-sg-ink, var(--pmw-ed-conf-fg)); background: var(--pmw-ed-sg-fill-conf, transparent); }',
  '.pmw-ed-row.is-del .pmw-ed-sg, .pmw-ed-half.is-del .pmw-ed-sg { color: var(--pmw-ed-sg-ink, var(--pmw-ed-del-fg)); background: var(--pmw-ed-sg-fill-del, transparent); }',
  ':host([data-mode="file"]) .pmw-ed-row:is(.is-add, .is-mod, .is-conf) .pmw-ed-sg { cursor: pointer; }',
  /* removed lines in the file view: a small wedge at the boundary and a dashed hairline across it (never a stripe) */
  '.pmw-ed-row.has-del .pmw-ed-sg::before, .pmw-ed-row.has-del-end .pmw-ed-sg::after { content: ""; position: absolute; left: 2px; width: 7px; height: 8px; background: var(--pmw-ed-del-fg); clip-path: polygon(0 0, 100% 50%, 0 100%); }',
  '.pmw-ed-row.has-del .pmw-ed-sg::before { top: -4px; }',
  '.pmw-ed-row.has-del-end .pmw-ed-sg::after { bottom: -4px; }',
  '.pmw-ed-row.has-del::after, .pmw-ed-row.has-del-end::after { content: ""; position: absolute; left: var(--pmw-ed-gut, 54px); right: 0; height: 0; pointer-events: none; border-top: 1px dashed color-mix(in srgb, var(--pmw-ed-del-fg) 65%, transparent); }',
  '.pmw-ed-row.has-del::after { top: 0; }',
  '.pmw-ed-row.has-del-end::after { bottom: 0; }',
  '.pmw-ed-tx { flex: none; padding-left: 10px; color: var(--pmw-ed-fg); }',
  '.pmw-ed-t-kw { color: var(--pmw-ed-s-kw); font-weight: var(--pmw-ed-kw-weight, 400); }',
  '.pmw-ed-t-str { color: var(--pmw-ed-s-str); }',
  '.pmw-ed-t-com { color: var(--pmw-ed-s-com); font-style: var(--pmw-ed-com-style, italic); }',
  '.pmw-ed-t-fn { color: var(--pmw-ed-s-fn); }',
  '.pmw-ed-t-ty { color: var(--pmw-ed-s-ty); }',
  '.pmw-ed-t-num { color: var(--pmw-ed-s-num); }',
  '.pmw-ed-t-op { color: var(--pmw-ed-s-op); }',
  '.pmw-ed-t-pun { color: var(--pmw-ed-s-pun); }',
  '.pmw-ed-t-prop { color: var(--pmw-ed-s-prop); }',
  '.pmw-ed-t-attr { color: var(--pmw-ed-s-attr); }',
  '.pmw-ed-t-mac { color: var(--pmw-ed-s-mac); }',
  '.pmw-ed-t-tag { color: var(--pmw-ed-s-tag); font-weight: var(--pmw-ed-tag-weight, 400); }',
  '.pmw-ed-t-esc { color: var(--pmw-ed-s-esc); }',
  '.pmw-ed-t-head { color: var(--pmw-ed-s-head); font-weight: 700; }',
  '.pmw-ed-t-link { color: var(--pmw-ed-s-link); text-decoration: underline; text-underline-offset: 2px; }',
  '.pmw-ed-t-var { color: var(--pmw-ed-s-var); }',
  '.pmw-ed-t-code { color: var(--pmw-ed-s-code); }',
  '.pmw-ed-t-strong { font-weight: 700; }',
  '.pmw-ed-t-emph { font-style: italic; }',
  '.pmw-ed-t-bad { color: var(--pmw-bad); font-weight: 600; }',
  '.pmw-ed-t-warn { color: var(--pmw-warn); font-weight: 600; }',
  '.pmw-ed-t-ok { color: var(--pmw-ok); }',
  '.pmw-ed-w { border-radius: var(--pmw-ed-r2, 2px); }',
  ':is(.pmw-ed-row.is-add, .pmw-ed-half.is-add) .pmw-ed-w { background: var(--pmw-ed-wadd); }',
  ':is(.pmw-ed-row.is-del, .pmw-ed-half.is-del) .pmw-ed-w { background: var(--pmw-ed-wdel); }',
  /* the reveal: lines arrive top to bottom on open (J1); never under Reduced Motion */
  '@keyframes pmw-ed-reveal { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }',
  '.pmw-ed-row.is-reveal { animation: pmw-ed-reveal 150ms cubic-bezier(.2, .8, .2, 1) both; }',
  '.pmw-ed-curline, .pmw-ed-focus { position: absolute; left: 0; right: 0; height: var(--pmw-ed-lh); }',
  '.pmw-ed-curline { background: var(--pmw-ed-line); }',
  '.pmw-ed-focus { background: var(--pmw-ed-focus-bg); transition: opacity 600ms ease-out; }',
  '.pmw-ed-focus.is-fading { opacity: 0; }',
  '.pmw-ed-curline[hidden], .pmw-ed-focus[hidden], .pmw-ed-caret[hidden] { display: none; }',
  '.pmw-ed-sel { position: absolute; height: var(--pmw-ed-lh); background: var(--pmw-ed-sel); border-radius: var(--pmw-ed-r3, 3px); }',
  ':host(:not(:focus)) .pmw-ed-sel { background: var(--pmw-ed-sel-blur); }',
  '.pmw-ed-hit { position: absolute; height: var(--pmw-ed-lh); background: var(--pmw-ed-hit); border-radius: var(--pmw-ed-r2, 2px); }',
  '.pmw-ed-hit.is-cur { background: var(--pmw-ed-hit-cur); outline: 1px var(--pmw-ed-ring-style, solid) var(--pmw-ed-hit-ring); outline-offset: 0; }',
  '.pmw-ed-caret { position: absolute; left: 0; top: 0; width: var(--pmw-ed-caret-w, 2px); height: var(--pmw-ed-lh); background: var(--pmw-ed-caret); border-radius: var(--pmw-ed-r1, 1px); }',
  '.pmw-ed-caret.is-blink { animation: pmw-ed-blink 1.06s steps(1, end) .5s infinite; }',
  /* the IME field: the keyboard focus for typing, kept at the caret so a composition window opens there; invisible
     until a composition shows its text in place */
  '.pmw-ed-ime { position: absolute; left: 0; top: 0; z-index: 3; width: 1px; height: var(--pmw-ed-lh); margin: 0; padding: 0; border: 0; outline: none; resize: none; overflow: hidden; white-space: pre; opacity: 0; color: transparent; caret-color: transparent; background: transparent; font: inherit; line-height: var(--pmw-ed-lh); -webkit-user-select: text; user-select: text; pointer-events: none; }',
  '.pmw-ed-ime.is-composing { opacity: 1; color: var(--pmw-ed-fg); background: var(--pmw-ed-gutbg); text-decoration: underline; text-underline-offset: 3px; box-shadow: 0 0 0 1px var(--pmw-ed-caret-mark); }',
  '@keyframes pmw-ed-blink { 50% { opacity: 0; } }',
  /* diff mode */
  '.pmw-ed-row.is-meta { color: var(--pmw-text-3); }',
  '.pmw-ed-mt { flex: none; padding-left: 10px; display: flex; align-items: center; gap: 12px; }',
  '.pmw-ed-row.is-hunk { background: color-mix(in srgb, var(--pmw-ed-mod-fg) 7%, transparent); }',
  '.pmw-ed-row.is-hunk .pmw-ed-gut { background: linear-gradient(color-mix(in srgb, var(--pmw-ed-mod-fg) 7%, transparent), color-mix(in srgb, var(--pmw-ed-mod-fg) 7%, transparent)), var(--pmw-ed-gutbg); }',
  '.pmw-ed-hk { color: color-mix(in srgb, var(--pmw-ed-mod-fg) 80%, var(--pmw-ed-fg)); }',
  '.pmw-ed-hks { color: var(--pmw-text-2); font-family: var(--pm-font-ui); font-size: 12px; }',
  '.pmw-ed-row.is-gap .pmw-ed-mt { font-style: italic; font-family: var(--pm-font-ui); font-size: 12px; }',
  '.pmw-ed-row.is-note .pmw-ed-mt { font-family: var(--pm-font-ui); font-size: 12px; color: var(--pmw-text-2); }',
  '.pmw-ed-row.is-lead .pmw-ed-mt { color: var(--pmw-text); }',
  '.pmw-ed-fold { pointer-events: auto; display: inline-flex; align-items: center; gap: 6px; height: calc(var(--pmw-ed-lh) - 2px); margin-top: 1px; padding: 0 8px 0 6px; border: 0; border-radius: var(--pmw-ed-r5, 5px); background: transparent; color: var(--pmw-text-2); font: 500 12px/1 var(--pm-font-ui); cursor: pointer; }',
  '.pmw-ed-fold:hover { background: var(--pmw-ed-fold-hover-bg, var(--pmw-hover)); color: var(--pmw-ed-fold-hover-fg, var(--pmw-text)); }',
  '.pmw-ico { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; flex: none; }',
  '.pmw-ed-half { position: absolute; top: 0; height: 100%; display: flex; overflow: hidden; }',
  '.pmw-ed-half.is-l { left: 0; width: var(--pmw-ed-half); }',
  '.pmw-ed-half.is-r { left: var(--pmw-ed-half); right: 0; box-shadow: -1px 0 0 var(--pmw-line); }',
  '.pmw-ed-half .pmw-ed-gut { position: relative; }',
  '.pmw-ed-half.is-l .pmw-ed-tx { transform: translateX(calc(-1 * var(--pmw-ed-sxl, 0px))); }',
  '.pmw-ed-half.is-r .pmw-ed-tx { transform: translateX(calc(-1 * var(--pmw-ed-sxr, 0px))); }',
  /* sticky rows (their own shadow root, same sheet) */
  '.pmw-ed-sticky-in { position: relative; }',
  '.pmw-ed-srow .pmw-ed-gut { position: relative; }',
  '.pmw-ed-srow:hover { background: var(--pmw-hover); }',
  '.pmw-ed-srow:hover .pmw-ed-gut { background: linear-gradient(var(--pmw-hover), var(--pmw-hover)), var(--pmw-ed-gutbg); }',
  ':host([data-reduced]) .pmw-ed-row.is-reveal, :host([data-reduced]) .pmw-ed-caret.is-blink { animation: none; }',
  ':host([data-reduced]) .pmw-ed-focus { transition: none; }',
  '@media (prefers-reduced-motion: reduce) { .pmw-ed-row.is-reveal, .pmw-ed-caret.is-blink { animation: none; } .pmw-ed-focus { transition: none; } }'
].join('\n');
var shadowSheet = null;
function shadowFor(hostEl, delegates) {
  // delegates: focusing the host focuses the IME field inside it, and the host still matches :focus
  var sr = hostEl.attachShadow(delegates ? { mode: 'open', delegatesFocus: true } : { mode: 'open' });
  try {
    if (!shadowSheet) { shadowSheet = new CSSStyleSheet(); shadowSheet.replaceSync(SHADOW_CSS); }
    sr.adoptedStyleSheets = [shadowSheet];
  } catch (_) {
    sr.appendChild(h('style', { text: SHADOW_CSS }));
  }
  return sr;
}

function linesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function paintTokens(el, text, toks, words) {
  // toks [[s, e, kind]]; words [[s, e]] (diff word marks) split the tokens
  if (!text) return;
  if (!toks || !toks.length) toks = [[0, text.length, null]];
  for (var t = 0; t < toks.length; t++) {
    var s = toks[t][0], e = toks[t][1], kind = toks[t][2];
    var cuts = [s];
    if (words) for (var w = 0; w < words.length; w++) {
      if (words[w][0] > s && words[w][0] < e) cuts.push(words[w][0]);
      if (words[w][1] > s && words[w][1] < e) cuts.push(words[w][1]);
    }
    cuts.push(e);
    cuts.sort(function (a, b) { return a - b; });
    for (var c = 0; c < cuts.length - 1; c++) {
      var a0 = cuts[c], b0 = cuts[c + 1];
      if (b0 <= a0) continue;
      var inWord = false;
      if (words) for (var q = 0; q < words.length; q++) if (a0 >= words[q][0] && b0 <= words[q][1]) { inWord = true; break; }
      var part = text.slice(a0, b0);
      if (!kind && !inWord) { el.appendChild(doc.createTextNode(part)); continue; }
      var sp = doc.createElement('span');
      sp.className = (kind ? 'pmw-ed-t-' + kind : '') + (inWord ? ' pmw-ed-w' : '');
      sp.textContent = part;
      el.appendChild(sp);
    }
  }
}

/* ======================================================================================================== */
/* Code colour schemes (D27, CONTRACT 10.1): one catalog shared with the terminal, published by the terminal        */
/* package on window.PMT. Everything here is feature-detected: in a build without src/terminal the editor keeps    */
/* Follow look, Retro dark stays green and the Appearance row is absent.                                           */
/* ======================================================================================================== */

var SYN_KEYS = ['kw', 'str', 'num', 'com', 'fn', 'ty', 'var', 'prop', 'op', 'pun', 'tag', 'attr', 'esc', 'mac', 'link', 'head', 'code'];
function edAppearance() {
  try {
    var A = window.PMT && window.PMT.Appearance;
    return A && typeof A.editorTokens === 'function' && typeof A.palette === 'function' ? A : null;
  } catch (_) { return null; }
}
function edPopover() {
  try { var P = window.PMT && window.PMT.AppearancePopover; return P && typeof P.open === 'function' ? P : null; } catch (_) { return null; }
}
function retroPhosphor() {
  try {
    var A = window.PMT && window.PMT.Appearance;
    return A && typeof A.retroPhosphor === 'function' && A.retroPhosphor() === 'amber' ? 'amber' : 'green';
  } catch (_) { return 'green'; }
}
var pmtHooked = null;
function hookPmt() {
  // once per Appearance object: the terminal's phosphor pick (Retro dark) restyles every open editor live
  var A = null;
  try { A = window.PMT && window.PMT.Appearance; } catch (_) {}
  if (!A || pmtHooked === A || typeof A.on !== 'function') return;
  pmtHooked = A;
  try { A.on('retro-phosphor', function () { EDITORS.forEach(function (v) { if (v.scheme) v.scheme(); }); }); } catch (_) {}
}
function schemeList() {
  var A = edAppearance();
  if (!A || typeof A.schemes !== 'function') return [];
  try { var l = A.schemes(); return Array.isArray(l) ? l : []; } catch (_) { return []; }
}
function schemeName(id) {
  if (!id || id === 'follow') return 'Follow look';
  var l = schemeList();
  for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i].name || 'Scheme';
  return 'Follow look';
}
/* colour arithmetic for the contrast floor (text keeps 4.5:1 on the scheme's own background) */
function rgbOf(v) {
  var m = /^#?([\da-f]{3}|[\da-f]{6})(?:[\da-f]{2})?$/i.exec(String(v || '').trim());
  if (!m) return null;
  var x = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}
function hexOf(c) { return '#' + c.map(function (n) { return ('0' + Math.round(clamp(n, 0, 255)).toString(16)).slice(-2); }).join(''); }
function mixRgb(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function lumOf(c) {
  var v = c.map(function (n) { n /= 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function contrastOf(a, b) { var x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function legible(c, bg, min) {
  // move toward white or black (whichever the background allows) until the colour reads at min:1
  if (!c) return null;
  if (contrastOf(c, bg) >= min) return c;
  var to = contrastOf([255, 255, 255], bg) >= contrastOf([0, 0, 0], bg) ? [255, 255, 255] : [0, 0, 0];
  for (var t = 0.05; t <= 1.0001; t += 0.05) { var m = mixRgb(c, to, t); if (contrastOf(m, bg) >= min) return m; }
  return to;
}
function alphaOf(c, a) { return 'rgba(' + Math.round(c[0]) + ', ' + Math.round(c[1]) + ', ' + Math.round(c[2]) + ', ' + a + ')'; }
/* the custom properties a scheme writes on the code elements, or null for Follow look (or an unknown id) */
function schemeVars(id) {
  if (!id || id === 'follow') return null;
  var A = edAppearance();
  if (!A) return null;
  var known = schemeList();
  if (known.length && !known.some(function (x) { return x && x.id === id; })) return null;
  var toks = null, pal = null;
  try { toks = A.editorTokens(id); pal = A.palette(id); } catch (err) { try { console.warn('[pm-home] editor scheme ' + id + ' failed', err); } catch (_) {} return null; }
  if (!toks || !pal) return null;
  var bg = rgbOf(pal.background), fg0 = rgbOf(pal.foreground);
  if (!bg || !fg0) return null;
  var ansi = Array.isArray(pal.ansi) ? pal.ansi.map(rgbOf) : [];
  function an(i, dflt) { return ansi[i] || ansi[i > 7 ? i - 8 : i + 8] || dflt; }
  var fg = legible(fg0, bg, 4.5);
  var red = legible(an(1, [224, 108, 117]), bg, 4.5), green = legible(an(2, [152, 195, 121]), bg, 4.5), yellow = legible(an(3, [229, 192, 123]), bg, 4.5);
  var hitC = an(11, an(3, [229, 192, 123]));
  var conf = legible(mixRgb(an(1, red), an(3, yellow), 0.5), bg, 4.5);
  var blue = an(4, fg);
  var cursor = rgbOf(pal.cursor) || fg, sel = rgbOf(pal.selection);
  var dark = lumOf(bg) < 0.2;
  var v = {
    '--pmw-ed-bg': hexOf(bg), '--pmw-ed-gutbg': hexOf(bg), '--pmw-ed-fg': hexOf(fg),
    '--pmw-ed-ln': hexOf(legible(mixRgb(fg, bg, 0.5), bg, 4.5)), '--pmw-ed-ln-cur': hexOf(fg),
    '--pmw-ed-line': alphaOf(fg, dark ? 0.05 : 0.06),
    '--pmw-ed-sel': sel ? hexOf(sel) : alphaOf(blue, 0.32), '--pmw-ed-sel-blur': hexOf(mixRgb(sel || mixRgb(bg, fg, 0.2), bg, 0.45)),
    '--pmw-ed-sel-z': '-1', '--pmw-ed-sel-blend': 'normal',
    '--pmw-ed-caret': hexOf(cursor), '--pmw-ed-caret-mark': alphaOf(fg, 0.55),
    '--pmw-ed-hit': alphaOf(hitC, 0.26), '--pmw-ed-hit-cur': alphaOf(hitC, 0.5), '--pmw-ed-hit-ring': hexOf(legible(hitC, bg, 3)), '--pmw-ed-hit-mark': hexOf(hitC),
    '--pmw-ed-focus-bg': alphaOf(blue, 0.16),
    '--pmw-ed-mm-ink': hexOf(fg), '--pmw-ed-mm-alpha': dark ? '.28' : '.34',
    '--pmw-ed-add-fg': hexOf(green), '--pmw-ed-mod-fg': hexOf(yellow), '--pmw-ed-del-fg': hexOf(red), '--pmw-ed-conf-fg': hexOf(conf),
    '--pmw-ed-add-bg': alphaOf(green, dark ? 0.12 : 0.10), '--pmw-ed-mod-bg': alphaOf(yellow, dark ? 0.10 : 0.08),
    '--pmw-ed-del-bg': alphaOf(red, dark ? 0.12 : 0.09), '--pmw-ed-conf-bg': alphaOf(conf, dark ? 0.15 : 0.12),
    '--pmw-ed-wadd': alphaOf(green, dark ? 0.30 : 0.22), '--pmw-ed-wdel': alphaOf(red, dark ? 0.30 : 0.20),
    '--pmw-ed-fold-hover-bg': alphaOf(fg, 0.10), '--pmw-ed-fold-hover-fg': hexOf(fg),
    // the page tokens the code rows read (diff meta rows, folds, log marks): kept on the scheme's background
    '--pmw-text': hexOf(fg), '--pmw-text-2': hexOf(legible(mixRgb(fg, bg, 0.25), bg, 4.5)), '--pmw-text-3': hexOf(legible(mixRgb(fg, bg, 0.42), bg, 4.5)),
    '--pmw-hover': alphaOf(fg, 0.08), '--pmw-line': alphaOf(fg, 0.14),
    '--pmw-ok': hexOf(green), '--pmw-warn': hexOf(yellow), '--pmw-bad': hexOf(red)
  };
  SYN_KEYS.forEach(function (k) { v['--pmw-ed-s-' + k] = hexOf(legible(rgbOf(toks[k]) || fg, bg, 4.5)); });
  return v;
}
function openAppearance(anchor) {
  var P = edPopover();
  if (!P) return;
  var KEYS = { scheme: 'editor.scheme', font: 'editor.font.family', size: 'editor.font.size' };
  function full(k) { return KEYS[k] || (String(k).indexOf('editor.') === 0 ? k : null); }
  function get(k) {
    if (k == null) return { scheme: setting('editor.scheme', 'follow'), font: setting('editor.font.family', 'JetBrains Mono'), size: setting('editor.font.size', 13) };
    var f = full(k);
    return f ? PM_HOME.settings.get(f) : undefined;
  }
  function set(k, val) {
    if (k && typeof k === 'object') { Object.keys(k).forEach(function (kk) { set(kk, k[kk]); }); return; }
    var f = full(k);
    if (f) PM_HOME.settings.set(f, val);
  }
  try { P.open(anchor, { surface: 'editor', get: get, set: set }); }
  catch (err) { try { console.error('[pm-home] the Appearance popover failed', err); } catch (_) {} }
}

function mountEditor(host, st, api) {
  st = st || {};
  var tabId = api.id;
  var path = st.path || (tabId.indexOf('file:') === 0 ? tabId.slice(5) : null);
  var d, untitled = false;
  if (path) d = docForPath(path);
  else {
    var title = st.title || null;           // PM_HOME.open passes spec.title as state.title
    untitled = st.text == null || (st.text === '' && (!title || title === 'Untitled'));
    d = newDoc({ lines: splitLines(st.text || ''), language: st.language || (untitled ? 'text' : null), title: title,
      readOnly: (untitled || st.edit) ? null : (typeof st.readOnly === 'string' ? st.readOnly : 'Read-only') });
    if (untitled) { untitledSeq += 1; d.title = 'Untitled ' + untitledSeq; }
    if (untitled) api.update({ label: d.title, title: d.title });   // labelFor names it before mount; the number comes now
  }
  var lang = LANGS[d.lang] || LANGS.text;
  var name = path ? basename(path) : (d.title || 'Text');
  var special = d.binary || d.missing;

  /* ---- state ---- */
  var mode = d.chat ? 'diff' : ((st.mode === 'diff' || st.view === 'diff' || st.diff === true) && d.base ? 'diff' : 'file');
  var diffLayoutPick = st.diffLayout || null;      // per-tab override of editor.diff.layout
  var sideNow = false;                              // the resolved layout (with hysteresis)
  var V = null;                                     // the row model for the current mode
  var caret = { r: 0, c: 0 }, anchor = null, side = 'r', goalCol = -1;
  var focused = false, visible = true, alive = true;
  var fs = 13, lh = 20, cw = 7.8, headH = 31, padT = 35, padB = 80, padL = 10, padR = 32;
  var lnW = 40, gutW = 54, textX = 64, contentW = 0, trackW = 22, half = 0, gutS = 54;
  var sxl = 0, sxr = 0;                             // side by side: each side's own horizontal offset
  var rowEls = new Map(), rendered = { a: -1, b: -1 };
  var revealPending = !reduced();
  var stickyH = 0, stickyRows = [];
  var find = { open: false, replace: false, q: '', rep: '', caseSensitive: false, word: false, regex: false, hits: [], cur: -1, error: null, capped: false };
  var focusBand = null, focusTimer = 0, fadeTimer = 0;
  var colorCache = null;
  var timers = {};
  var expanded = {};                                // diff folds opened by the user
  var lastReadOnlyNote = 0;
  var geo = { st: 0, sl: 0, ch: 0, cwid: 0, sh: 1, sw: 1, trackH: 1 };   // scroll geometry, read once per scroll or layout
  var usedGuess = false;

  /* ---- DOM ---- */
  var root = h('div', { class: 'pmw-ed', 'data-lang': d.lang, 'data-mode': mode });
  var head = h('div', { class: 'pmw-ed-head' });
  var scroller = h('div', { class: 'pmw-ed-scroll', tabindex: '0', role: 'textbox', 'aria-multiline': 'true',
    'aria-readonly': d.readOnly || mode === 'diff' ? 'true' : 'false', 'aria-label': name + ' editor', 'data-pmh': 'off',
    'data-pm-hover-visual-suppressed': 'true', 'data-pmw-host-keys': '',
    id: 'pmw-ed-' + Math.random().toString(36).slice(2, 9) });
  var sizer = h('div', { class: 'pmw-ed-sizer' });
  var bands = h('div', { class: 'pmw-ed-bands', 'aria-hidden': 'true' });
  var curEl = h('i', { class: 'pmw-ed-curline', hidden: true });
  var focusEl = h('i', { class: 'pmw-ed-focus', hidden: true });
  bands.appendChild(curEl); bands.appendChild(focusEl);
  var ov = h('div', { class: 'pmw-ed-ov', 'aria-hidden': 'true' });
  var rowsEl = h('div', { class: 'pmw-ed-rows' });
  var selsEl = h('div', { class: 'pmw-ed-sels', 'aria-hidden': 'true' });
  var caretLayer = h('div', { class: 'pmw-ed-carets', 'aria-hidden': 'true' });
  var caretEl = h('i', { class: 'pmw-ed-caret' });
  caretLayer.appendChild(caretEl);
  /* typing goes through a hidden textarea inside the scroller's shadow root, so dead keys and IME composition
     (Japanese, Chinese, accents) work; [data-pmw-host-keys] keeps every host key (CONTRACT section 9), and to the
     page the focus is still the scroller */
  var ime = h('textarea', { class: 'pmw-ed-ime', 'aria-label': name + ' editor', autocomplete: 'off', autocapitalize: 'off',
    autocorrect: 'off', spellcheck: 'false', wrap: 'off', rows: '1', 'data-pm-hover-visual-suppressed': 'true', 'data-pmh': 'off' });
  sizer.appendChild(bands); sizer.appendChild(ov); sizer.appendChild(rowsEl); sizer.appendChild(selsEl); sizer.appendChild(caretLayer);
  sizer.appendChild(ime);
  shadowFor(scroller, true).appendChild(sizer);
  var sticky = h('div', { class: 'pmw-ed-sticky', 'aria-hidden': 'true', 'data-pmh': 'off', hidden: true });
  var stickyBox = h('div', { class: 'pmw-ed-sticky-box' });
  shadowFor(sticky).appendChild(stickyBox);
  scroller.setAttribute('data-mode', mode);
  function markReduced() { var r = reduced(); [scroller, sticky].forEach(function (el) { if (r) el.setAttribute('data-reduced', ''); else el.removeAttribute('data-reduced'); }); }
  markReduced();
  var hbar = h('div', { class: 'pmw-ed-hbar', 'aria-hidden': 'true' }, [h('i', { class: 'pmw-ed-hthumb' })]);
  var hthumb = hbar.firstChild;
  var track = h('div', { class: 'pmw-ed-track', role: 'scrollbar', 'aria-controls': scroller.id, 'aria-orientation': 'vertical',
    'aria-valuemin': '1', 'aria-label': 'Scroll ' + name, 'data-pmh': 'off' });
  var canvas = h('canvas', { class: 'pmw-ed-canvas', 'aria-hidden': 'true' });
  var thumb = h('i', { class: 'pmw-ed-thumb', 'aria-hidden': 'true' });
  var probe = h('i', { class: 'pmw-ed-probe', 'aria-hidden': 'true' });
  track.appendChild(canvas); track.appendChild(thumb); track.appendChild(probe);
  var measureEl = h('span', { class: 'pmw-ed-measure', 'aria-hidden': 'true', text: new Array(101).join('0') });
  root.appendChild(scroller); root.appendChild(sticky); root.appendChild(hbar); root.appendChild(track);
  root.appendChild(head); root.appendChild(measureEl);
  host.appendChild(root);

  /* ---- the header row (CONTRACT section 5): breadcrumb on the left, then the actions ---- */
  var crumbs = h('span', { class: 'pmw-ed-crumbs' });
  var symEl = h('span', { class: 'pmw-ed-sym' });
  var factEl = h('span', { class: 'pmw-ed-fact' });
  buildCrumbs();
  var hrow = api.headerRow({ label: name + ' controls', left: [{ id: 'crumbs', el: crumbs }], actions: actionList() });
  head.appendChild(hrow.el);

  function buildCrumbs() {
    crumbs.textContent = '';
    if (path) {
      var parts = path.split('/');
      parts.forEach(function (p, i) {
        var last = i === parts.length - 1;
        crumbs.appendChild(h('span', { class: 'pmw-ed-seg' + (last ? ' is-file' : ''), text: p }));
        if (!last) crumbs.appendChild(h('span', { class: 'pmw-ed-sep', 'aria-hidden': 'true', text: '/' }));
      });
    } else {
      crumbs.appendChild(h('span', { class: 'pmw-ed-seg is-file', text: d.title || 'Text' }));
    }
    crumbs.appendChild(symEl);
    factEl.textContent = '';
    var facts = [];
    if (d.chat) {
      var c = d.chat;
      facts.push({ t: STATUS_WORD[c.status] || 'Changed' });
      if (c.oldPath) facts.push({ t: 'from ' + c.oldPath });
      var hk = chatHunks();
      var a = 0, r = 0;
      hk.forEach(function (x) { x.lines.forEach(function (l) { if (l.kind === 'add') a++; else if (l.kind === 'del') r++; }); });
      facts.push({ t: '+' + a, cls: 'is-add' }, { t: '−' + r, cls: 'is-del' });
    } else if (d.readOnly && !special) facts.push({ t: d.readOnly });
    else if (mode === 'diff' && d.base) {
      var mk = marksOf(d);
      facts.push({ t: '+' + mk.add, cls: 'is-add' }, { t: '−' + mk.del, cls: 'is-del' });
    }
    facts.forEach(function (f, i) {
      if (i) factEl.appendChild(h('span', { class: 'pmw-ed-dot', 'aria-hidden': 'true', text: ' ' }));
      factEl.appendChild(h('span', { class: f.cls || '', text: f.t }));
    });
    if (facts.length) crumbs.appendChild(factEl);
  }
  function chatHunks() { return d.chatHunks || (d.chatHunks = parseChatHunks(d.chat)); }
  function hasChanges() { if (d.chat) return true; var mk = marksOf(d); return !!(mk && mk.changes.length); }

  function actionList() {
    var acts = [];
    if (special) return [{ id: 'more', label: 'More', icon: 'more', menu: moreMenu }];
    if (mode === 'file') acts.push({ id: 'pos', label: posLabel(), icon: 'target', detail: 'Go to line (' + keyLabel('Ctrl+G') + ')', run: function () { openGoto(); } });
    if (mode === 'diff') {
      acts.push({ id: 'prev', label: 'Previous change', icon: 'arrowUp', shortcut: 'Shift+Alt+F5', run: function () { gotoChange(-1); } });
      acts.push({ id: 'next', label: 'Next change', icon: 'arrowDown', shortcut: 'Alt+F5', run: function () { gotoChange(1); } });
      acts.push({ id: 'layout', label: layoutLabel(), icon: sideNow ? 'splitRight' : 'splitDown', detail: 'Side by side or inline', menu: layoutMenu });
    }
    if (d.base && !d.chat) acts.push({ id: 'diff', label: mode === 'diff' ? 'Changes' : 'Changes', icon: 'diff', pressed: mode === 'diff',
      detail: mode === 'diff' ? 'Back to the file' : 'Show what changed since the last commit', disabled: !hasChanges() && mode !== 'diff',
      run: function () { setMode(mode === 'diff' ? 'file' : 'diff'); } });
    acts.push({ id: 'find', label: 'Find', icon: 'search', shortcut: 'Ctrl+F', run: function () { openFind(false); } });
    acts.push({ id: 'more', label: 'More', icon: 'more', menu: moreMenu });
    return acts;
  }
  function posLabel() { return 'Ln ' + (caret.r + 1) + ', Col ' + (caret.c + 1); }
  function layoutLabel() {
    var pick = diffLayoutPick || setting('editor.diff.layout', 'auto');
    return pick === 'auto' ? (sideNow ? 'Side by side' : 'Inline') : pick === 'side' ? 'Side by side' : 'Inline';
  }
  function layoutMenu() {
    var pick = diffLayoutPick || setting('editor.diff.layout', 'auto');
    function row(v, label, sub) {
      return { id: 'layout-' + v, label: label, detail: sub, checked: pick === v, run: function () { diffLayoutPick = v; resolveLayout(true); } };
    }
    // the header row maps CONTRACT section 4 items (detail, shortcut) the same way api.menu does
    return { id: 'ed-layout', title: 'Diff layout', width: 280, align: 'end', rows: [
      row('auto', 'Automatic', 'Side by side from ' + setting('editor.diff.sideBySideMin', SIDE_MIN_DEFAULT) + ' px wide'),
      row('side', 'Side by side', 'Old on the left, new on the right'),
      row('inline', 'Inline', 'One column, removed lines above added ones')
    ] };
  }
  function moreMenu() {
    var rows = [];
    if (!special) {
      rows.push({ id: 'goto', label: 'Go to line', icon: 'target', shortcut: 'Ctrl+G', run: function () { openGoto(); } });
      rows.push({ id: 'replace', label: 'Find and replace', icon: 'replace', shortcut: 'Ctrl+H', run: function () { openFind(true); } });
      rows.push('-');
      rows.push({ id: 'minimap', label: 'Minimap', detail: 'Line shapes in the scrollbar', checked: !!setting('editor.minimap', true),
        run: function () { PM_HOME.settings.set('editor.minimap', !setting('editor.minimap', true)); } });
      rows.push({ id: 'sticky', label: 'Sticky scroll', detail: 'Keep the enclosing lines in view', checked: !!setting('editor.stickyScroll', true),
        run: function () { PM_HOME.settings.set('editor.stickyScroll', !setting('editor.stickyScroll', true)); } });
      // D27: the one Appearance popover, shared with the terminal; absent when the terminal package is not in the build
      if (edPopover()) rows.push({ id: 'appearance', label: 'Appearance...', icon: 'edPalette', detail: schemeName(setting('editor.scheme', 'follow')) + ' · font and size',
        run: function () { setTimeout(function () { openAppearance(hrow.action('more') || head); }, 0); } });
      if (isEditable() && isDirty()) { rows.push('-'); rows.push({ id: 'save', label: 'Save', icon: 'check', shortcut: 'Ctrl+S', run: function () { save(); } }); }
    }
    if (path) {
      if (rows.length) rows.push('-');
      rows.push({ id: 'copy-path', label: 'Copy path', icon: 'link', run: function () { copyText(path); PMW.toast('Path copied'); } });
    }
    return { id: 'ed-more', width: 260, align: 'end', rows: rows };
  }
  function refreshHeader() {
    hrow.set({ actions: actionList() });
    buildCrumbs();
    updateSymbol();
  }
  function updatePos() {
    var b = hrow.action('pos');
    if (!b) return;
    var lab = b.querySelector('.pmw-hbtn-label');
    var t = posLabel();
    if (lab && lab.textContent !== t) { lab.textContent = t; b.setAttribute('aria-label', t + ' (' + keyLabel('Ctrl+G') + ')'); b.setAttribute('data-pm-hover-label', t); }
  }

  /* ---- the reason view (binary, not in this project) ---- */
  if (special) {
    root.setAttribute('data-special', '');
    var info = d.binary || { reason: 'Not in this project', detail: path || '', note: 'The demo project has no file at this path, so there is nothing to show.' };
    root.appendChild(h('div', { class: 'pmw-ed-reason' }, [
      h('div', { class: 'pmw-ed-reason-col' }, [
        h('span', { class: 'pmw-ed-reason-ico' }, [ico(d.binary ? 'file' : 'eye', 16)]),
        h('h2', { text: info.reason }),
        h('p', { class: 'pmw-ed-reason-detail', text: info.detail }),
        h('p', { text: info.note })
      ])
    ]));
  }

  /* ==== code colour scheme (D27): written on the code elements only, so the header row and popovers keep the look ==== */
  var codeEls = [scroller, sticky, track, hbar];
  var schemeOn = null;
  function applyScheme() {
    hookPmt();
    if (retroPhosphor() === 'amber') root.setAttribute('data-phosphor', 'amber'); else root.removeAttribute('data-phosphor');
    var id = setting('editor.scheme', 'follow');
    var vars = special ? null : schemeVars(id);
    var old = schemeOn || {};
    Object.keys(old).forEach(function (n) { if (!vars || !(n in vars)) codeEls.forEach(function (el) { el.style.removeProperty(n); }); });
    if (vars) Object.keys(vars).forEach(function (n) { if (old[n] !== vars[n]) codeEls.forEach(function (el) { el.style.setProperty(n, vars[n]); }); });
    if (vars) root.setAttribute('data-scheme', id); else root.removeAttribute('data-scheme');
    schemeOn = vars;
    colorCache = null;
  }
  applyScheme();

  /* ==== metrics and layout ==== */
  var varCache = {};
  function setVar(name, value) {
    // an inherited custom property restyles every row under the root, so only write real changes
    if (varCache[name] === value) return;
    varCache[name] = value;
    if (value == null) root.style.removeProperty(name); else root.style.setProperty(name, value);
  }
  function setTop(v) {
    geo.st = clamp(v, 0, Math.max(0, geo.sh - geo.ch));
    scroller.scrollTop = geo.st;
  }
  function setLeft(v) {
    geo.sl = clamp(v, 0, Math.max(0, geo.sw - geo.cwid));
    scroller.scrollLeft = geo.sl;
  }
  function readGeo() {
    geo.ch = scroller.clientHeight; geo.cwid = scroller.clientWidth;
    geo.sh = Math.max(scroller.scrollHeight, geo.ch); geo.sw = Math.max(scroller.scrollWidth, geo.cwid);
    geo.trackH = track.clientHeight;
    geo.st = scroller.scrollTop; geo.sl = scroller.scrollLeft;
  }
  function measure() {
    fs = clamp(+setting('editor.font.size', 13) || 13, 10, 22);
    var lhx = +setting('editor.lineHeight', 1.55) || 1.55;
    lh = Math.max(Math.round(fs * (lhx < 3 ? lhx : lhx / fs)), fs + 3);
    setVar('--pmw-ed-fs', fs + 'px');
    setVar('--pmw-ed-lh', lh + 'px');
    var fam = setting('editor.font.family', 'JetBrains Mono');
    if (fam && fam !== 'JetBrains Mono') setVar('--pmw-ed-font', '"' + String(fam).replace(/"/g, '') + '", var(--pm-font-code)');
    else setVar('--pmw-ed-font', null);
    var w = measureEl.getBoundingClientRect().width / 100;
    if (w > 2) cw = w; else cw = fs * 0.6;
    setVar('--pmw-ed-cw', cw + 'px');
  }
  function layout() {
    headH = head.offsetHeight;
    var bodyW = host.clientWidth;
    var mm = !!setting('editor.minimap', true) && bodyW >= NARROW_TRACK_W;
    trackW = special ? 0 : (mm ? 22 : 10);
    setVar('--pmw-ed-head', headH + 'px');
    setVar('--pmw-ed-track', trackW + 'px');
    root.setAttribute('data-track', mm ? 'full' : 'marks');
    var n = V ? V.n : 1;
    var digits = Math.max(3, String(mode === 'diff' ? maxLineNo() : n).length);
    lnW = Math.ceil(digits * cw + 16);
    gutW = lnW + 16;
    textX = gutW + padL;
    padT = headH + 6;
    padB = Math.max(lh * 4, 24);
    var sw = Math.max(0, bodyW - trackW);
    if (mode === 'diff' && sideNow) {
      half = Math.floor(sw / 2);
      gutS = gutW;
      contentW = sw;
    } else {
      var cols = mode === 'diff' ? V.maxCols : maxColsOf(d);
      contentW = Math.max(sw, Math.ceil(textX + (cols + 1) * cw + padR));
    }
    setVar('--pmw-ed-lnw', lnW + 'px');
    setVar('--pmw-ed-gut', gutW + 'px');
    setVar('--pmw-ed-tx', textX + 'px');
    setVar('--pmw-ed-half', half + 'px');
    sizer.style.width = contentW + 'px';
    sizer.style.height = (padT + n * lh + padB) + 'px';
    track.setAttribute('aria-valuemax', String(Math.max(1, n)));
    readGeo();
  }
  function maxLineNo() {
    var m = 1;
    if (!V || !V.rows) return 999;
    V.rows.forEach(function (r) { m = Math.max(m, r.o || 0, r.n || 0, r.L ? r.L.n || 0 : 0, r.R ? r.R.n || 0 : 0); });
    return m;
  }

  /* ==== the row model ==== */
  function buildView() {
    if (mode === 'diff') V = buildDiffView();
    else V = { n: d.lines.length, text: function (r) { return d.lines[r]; } };
    V.side = mode === 'diff' && sideNow;
  }
  function buildDiffView() {
    var rows = [], hunks, full = null, isSide = sideNow, delFile = d.chat && d.chat.status === 'deleted';
    if (d.chat) hunks = chatHunks();
    else { var mk = marksOf(d); full = mk.rows; hunks = toHunks(full, 3); }
    var scopes = d.chat ? [] : scopesOf(d);
    function tokRun(list, which) {
      // carry the tokenizer state through one side of a hunk
      var state = 'root';
      list.forEach(function (l) {
        if (l.kind === 'meta' || l.kind === 'hunk') return;
        if (which === 'new' && l.kind === 'del') return;
        if (which === 'old' && l.kind === 'add') return;
        var r = tokenizeLine(d.lang, l.text, state);
        state = r.end;
        if (which === 'new') l.tn = r.toks; else l.to = r.toks;
      });
    }
    function scopeAt(line0) {
      var best = null;
      for (var i = 0; i < scopes.length; i++) { var s = scopes[i]; if (s.start > line0) break; if (s.end >= line0 && s.start < line0) best = s; }
      return best ? symbolName(d.lines[best.start], d.lang) : '';
    }
    function pushLines(lines) {
      if (!isSide) {
        var i = 0;
        while (i < lines.length) {
          var l = lines[i];
          if (l.kind === 'ctx') { rows.push({ k: 'ctx', o: l.old, n: l.new, t: l.text, tk: l.tn || l.to }); i++; continue; }
          if (l.kind === 'meta') { rows.push({ k: 'note', t: l.text }); i++; continue; }
          var ds = [], as = [];
          while (i < lines.length && lines[i].kind === 'del') ds.push(lines[i++]);
          while (i < lines.length && lines[i].kind === 'add') as.push(lines[i++]);
          var ws = [];
          for (var k = 0; k < Math.min(ds.length, as.length); k++) ws.push(wordDiff(ds[k].text, as[k].text));
          ds.forEach(function (x, k2) { rows.push({ k: 'del', o: x.old, n: null, t: x.text, tk: x.to, w: ws[k2] ? ws[k2].left : null }); });
          as.forEach(function (x, k3) { rows.push({ k: 'add', o: null, n: x.new, t: x.text, tk: x.tn, w: ws[k3] ? ws[k3].right : null }); });
        }
        return;
      }
      var j = 0;
      while (j < lines.length) {
        var m = lines[j];
        if (m.kind === 'ctx') { rows.push({ k: 'ctx', L: { n: m.old, t: m.text, tk: m.to }, R: { n: m.new, t: m.text, tk: m.tn } }); j++; continue; }
        if (m.kind === 'meta') { rows.push({ k: 'note', t: m.text }); j++; continue; }
        var dd = [], aa = [];
        while (j < lines.length && lines[j].kind === 'del') dd.push(lines[j++]);
        while (j < lines.length && lines[j].kind === 'add') aa.push(lines[j++]);
        for (var q = 0; q < Math.max(dd.length, aa.length); q++) {
          var x0 = dd[q], y0 = aa[q], wd = x0 && y0 ? wordDiff(x0.text, y0.text) : null;
          rows.push({ k: x0 && y0 ? 'mod' : x0 ? 'del' : 'add',
            L: x0 ? { n: x0.old, t: x0.text, tk: x0.to, w: wd && wd.left } : null,
            R: y0 ? { n: y0.new, t: y0.text, tk: y0.tn, w: wd && wd.right } : null });
        }
      }
    }
    function pushFold(from, to) {
      if (to <= from) return;
      if (expanded[from] || to - from <= 2) {
        var ls = full.slice(from, to).map(function (r) { return { kind: 'ctx', old: r.old, new: r.new, text: r.text }; });
        ls.forEach(function (l) { var ix = l.new - 1; l.tn = tokensOf(d, ix); l.to = l.tn; });
        pushLines(ls);
        return;
      }
      rows.push({ k: 'fold', key: from, count: to - from, t: (to - from) + ' unchanged lines' });
    }
    if (d.chat) {
      var c = d.chat;
      var noteBits = [];
      if (c.oldPath) noteBits.push('Renamed from ' + c.oldPath);
      if (c.summary) noteBits.push(c.summary);
      if (noteBits.length) rows.push({ k: 'note', t: noteBits.join(' · '), lead: true });
    }
    if (!hunks.length) {
      rows.push({ k: 'note', t: d.chat ? 'This change record carries no lines, so there is nothing to show.' : 'No changes since the last commit.', lead: true });
      if (!d.chat) pushFold(0, full.length);
    }
    var prevEnd = 0, prevNew = 0, prevOld = 0;
    hunks.forEach(function (hk) {
      var ls = hk.lines.map(function (l) { return { kind: l.kind, old: l.old, new: l.new, text: l.text }; });
      if (full) {
        pushFold(prevEnd, hk.from);
        prevEnd = hk.to;
        ls.forEach(function (l) { if (l.new != null) l.tn = tokensOf(d, l.new - 1); });
        tokRun(ls, 'old');
      } else {
        var startN = delFile ? hk.oldStart : hk.newStart, prevN = delFile ? prevOld : prevNew;
        if (startN > prevN + 1) rows.push({ k: 'gap', t: 'Lines ' + (prevN + 1) + '–' + (startN - 1) + ' are not in this record' });
        tokRun(ls, 'new'); tokRun(ls, 'old');
        prevNew = hk.newStart + hk.newLines - 1; prevOld = hk.oldStart + hk.oldLines - 1;
      }
      var sc = full ? scopeAt(Math.max(0, hk.newStart - 1)) : '';
      rows.push({ k: 'hunk', t: hk.header, scope: sc, hunk: hk });
      pushLines(ls);
    });
    if (full && hunks.length) pushFold(prevEnd, full.length);
    var view = { rows: rows, n: rows.length, maxCols: 0, changes: [] };
    var prevChange = false;
    rows.forEach(function (r, i) {
      var len = Math.max(r.t ? r.t.length : 0, r.L ? r.L.t.length : 0, r.R ? r.R.t.length : 0);
      if (r.k !== 'note' && r.k !== 'gap' && len > view.maxCols) view.maxCols = len;
      var ch = r.k === 'add' || r.k === 'del' || r.k === 'mod';
      if (ch && !prevChange) view.changes.push(i);
      prevChange = ch;
    });
    view.text = function (r, sd) {
      var row = rows[r];
      if (!row) return null;
      if (!isSide) return row.k === 'ctx' || row.k === 'add' || row.k === 'del' ? row.t : null;
      var cell = (sd || 'r') === 'l' ? row.L : row.R;
      return cell ? cell.t : null;
    };
    view.side = isSide;
    view.delFile = delFile;
    return view;
  }

  /* ==== rendering rows (only the visible ones plus a margin) ==== */
  function visibleRange() {
    var top = geo.st, hgt = geo.ch;
    var a = Math.floor((top - padT) / lh) - 24, b = Math.ceil((top + hgt - padT) / lh) + 24;
    return { a: clamp(a, 0, Math.max(0, V.n - 1)), b: clamp(b, 0, V.n - 1) };
  }
  function renderRows(force) {
    if (special || !V) return;
    if (force) { rowEls.forEach(function (el) { el.remove(); }); rowEls.clear(); rendered = { a: -1, b: -1 }; }
    var rg = visibleRange();
    if (!force && rg.a === rendered.a && rg.b === rendered.b) return;
    rowEls.forEach(function (el, r) { if (r < rg.a || r > rg.b) { el.remove(); rowEls.delete(r); } });
    var frag = doc.createDocumentFragment(), first = -1;
    var revealTop = revealPending ? Math.floor((geo.st - padT) / lh) : 0;
    for (var r = rg.a; r <= rg.b && V.n; r++) {
      if (rowEls.has(r)) continue;
      var el = mode === 'diff' ? (V.side ? makeSideRow(r) : makeInlineRow(r)) : makeSourceRow(r);
      if (revealPending && r >= revealTop) {
        var k = r - Math.max(0, revealTop);
        if (k < 60) { el.classList.add('is-reveal'); el.style.animationDelay = (Math.min(k, 40) * 8) + 'ms'; }
      }
      rowEls.set(r, el);
      frag.appendChild(el);
      if (first < 0) first = r;
    }
    rowsEl.appendChild(frag);
    rendered = rg;
    if (revealPending) { revealPending = false; clearTimeout(timers.reveal); timers.reveal = setTimeout(function () { rowsEl.querySelectorAll('.is-reveal').forEach(function (x) { x.classList.remove('is-reveal'); x.style.animationDelay = ''; }); }, 900); }
  }
  function rowBase(r, cls) {
    var el = doc.createElement('div');
    el.className = 'pmw-ed-row' + (cls ? ' ' + cls : '');
    el.style.top = (padT + r * lh) + 'px';
    el.setAttribute('data-r', r);
    return el;
  }
  function gutter(num, sign, cls, title) {
    var g = doc.createElement('span');
    g.className = 'pmw-ed-gut';
    var ln = doc.createElement('span');
    ln.className = 'pmw-ed-ln' + (cls ? ' ' + cls : '');
    ln.textContent = num == null ? '' : String(num);
    var sg = doc.createElement('span');
    sg.className = 'pmw-ed-sg';
    sg.textContent = sign || '';
    if (title) sg.setAttribute('data-title', title);
    g.appendChild(ln); g.appendChild(sg);
    return g;
  }
  function makeSourceRow(r) {
    var mk = marksOf(d);
    var kind = mk ? mk.kinds[r] : '';
    var dels = mk ? mk.dels[r] || 0 : 0;
    var endDels = mk && r === d.lines.length - 1 ? mk.dels[d.lines.length] || 0 : 0;
    var el = rowBase(r, (kind ? 'is-' + kind : '') + (dels ? ' has-del' : '') + (endDels ? ' has-del-end' : '') + (r === caret.r && mode === 'file' ? ' is-cur' : ''));
    var title = kind ? 'Line ' + KIND_WORD[kind] + ' since the last commit' : '';
    if (dels) title = (title ? title + '; ' : '') + dels + (dels === 1 ? ' line removed above' : ' lines removed above');
    el.appendChild(gutter(r + 1, SIGN[kind] || '', null, title));
    var tx = doc.createElement('span');
    tx.className = 'pmw-ed-tx';
    if (r - d.tokFrom > 300) usedGuess = true;
    paintTokens(tx, d.lines[r], tokensOf(d, r, true), null);
    el.appendChild(tx);
    return el;
  }
  function makeInlineRow(r) {
    var row = V.rows[r];
    if (row.k === 'hunk' || row.k === 'fold' || row.k === 'gap' || row.k === 'note') return makeMetaRow(r, row);
    var el = rowBase(r, 'is-' + row.k + (focusBand && focusBand.r === r ? ' is-focusrow' : ''));
    var num = row.k === 'del' ? row.o : row.n;
    el.appendChild(gutter(num, row.k === 'ctx' ? '' : SIGN[row.k], row.k === 'del' ? 'is-old' : null));
    var tx = doc.createElement('span');
    tx.className = 'pmw-ed-tx';
    paintTokens(tx, row.t, row.tk, row.w);
    el.appendChild(tx);
    return el;
  }
  function makeSideRow(r) {
    var row = V.rows[r];
    if (row.k === 'hunk' || row.k === 'fold' || row.k === 'gap' || row.k === 'note') return makeMetaRow(r, row);
    var el = rowBase(r, 'is-' + row.k + ' is-sbs');
    [['l', row.L], ['r', row.R]].forEach(function (pair) {
      var sd = pair[0], cell = pair[1];
      var kind = !cell ? 'empty' : row.k === 'ctx' ? 'ctx' : sd === 'l' ? 'del' : 'add';
      var hf = doc.createElement('span');
      hf.className = 'pmw-ed-half is-' + sd + ' is-' + kind;
      if (cell) {
        hf.appendChild(gutter(cell.n, kind === 'ctx' ? '' : SIGN[kind], sd === 'l' ? 'is-old' : null));
        var tx = doc.createElement('span');
        tx.className = 'pmw-ed-tx';
        paintTokens(tx, cell.t, cell.tk, cell.w);
        hf.appendChild(tx);
      }
      el.appendChild(hf);
    });
    return el;
  }
  function makeMetaRow(r, row) {
    var el = rowBase(r, 'is-meta is-' + row.k + (row.lead ? ' is-lead' : ''));
    var g = doc.createElement('span');
    g.className = 'pmw-ed-gut';
    el.appendChild(g);
    var tx = doc.createElement('span');
    tx.className = 'pmw-ed-mt';
    if (row.k === 'fold') {
      var b = h('button', { type: 'button', class: 'pmw-ed-fold', tabindex: '-1', 'data-key': row.key,
        'data-pm-hover-label': 'Show ' + row.count + ' unchanged lines', 'data-pmh': 'icon' }, [ico('chevronDown', 12), h('span', { text: row.t })]);
      tx.appendChild(b);
    } else if (row.k === 'hunk') {
      tx.appendChild(h('span', { class: 'pmw-ed-hk', text: row.t }));
      if (row.scope) tx.appendChild(h('span', { class: 'pmw-ed-hks', text: row.scope }));
    } else tx.textContent = row.t;
    el.appendChild(tx);
    return el;
  }

  /* ==== overlays: the caret line, the selection, find hits, the focus band, the caret ==== */
  function selRange() {
    if (!anchor || (anchor.r === caret.r && anchor.c === caret.c)) return null;
    var a = anchor, b = caret;
    if (a.r > b.r || (a.r === b.r && a.c > b.c)) { var t = a; a = b; b = t; }
    return { a: a, b: b };
  }
  function xOf(c, sd) {
    if (V.side) return (sd === 'l' ? 0 : half) + gutS + padL + c * cw - (sd === 'l' ? sxl : sxr);
    return textX + c * cw;
  }
  function clipX(x0, x1, sd) {
    if (!V.side) return [x0, x1];
    var lo = (sd === 'l' ? 0 : half) + gutS, hi = sd === 'l' ? half : contentW;
    return [Math.max(lo, x0), Math.min(hi, x1)];
  }
  function renderOverlays() {
    if (special || !V) return;
    ov.textContent = '';
    selsEl.textContent = '';
    var rg = visibleRange();
    var frag = doc.createDocumentFragment(), sfrag = doc.createDocumentFragment();
    var showCur = focused && mode === 'file' && !selRange();
    curEl.hidden = !showCur;
    if (showCur) curEl.style.top = (padT + caret.r * lh) + 'px';
    focusEl.hidden = !focusBand;
    if (focusBand) {
      focusEl.style.top = (padT + focusBand.r * lh) + 'px';
      focusEl.classList.toggle('is-fading', !!focusBand.fading);
    }
    var s = selRange();
    if (s) {
      for (var r = Math.max(s.a.r, rg.a); r <= Math.min(s.b.r, rg.b); r++) {
        var t = V.text(r, side);
        if (t == null) continue;
        var c0 = r === s.a.r ? s.a.c : 0, c1 = r === s.b.r ? s.b.c : t.length + 1;
        if (c1 <= c0) continue;
        var xs = clipX(xOf(c0, side), xOf(c1, side), side);
        if (xs[1] <= xs[0]) continue;
        sfrag.appendChild(h('i', { class: 'pmw-ed-sel', style: { top: (padT + r * lh) + 'px', left: xs[0] + 'px', width: (xs[1] - xs[0]) + 'px' } }));
      }
    }
    if (find.open && find.hits.length) {
      var lo = lowerBound(find.hits, rg.a), cur = find.hits[find.cur];
      for (var i = lo; i < find.hits.length && find.hits[i].r <= rg.b; i++) {
        var hh = find.hits[i];
        var hx = clipX(xOf(hh.s, hh.side), xOf(hh.e, hh.side), hh.side);
        if (hx[1] <= hx[0]) continue;
        frag.appendChild(h('i', { class: 'pmw-ed-hit' + (hh === cur ? ' is-cur' : ''), style: { top: (padT + hh.r * lh) + 'px', left: hx[0] + 'px', width: (hx[1] - hx[0]) + 'px' } }));
      }
    }
    ov.appendChild(frag);
    selsEl.appendChild(sfrag);
    placeCaret();
  }
  function lowerBound(hits, r) {
    var lo = 0, hi = hits.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (hits[mid].r < r) lo = mid + 1; else hi = mid; }
    return lo;
  }
  var lastCurRow = -1;
  function placeCaret() {
    if (lastCurRow !== caret.r) { lastCurRow = caret.r; markCurrentRow(); }
    var show = focused && !special && V && V.text(caret.r, side) != null;
    caretEl.hidden = !show || composing;
    if (!show) return;
    var tf = 'translate(' + Math.round(xOf(caret.c, side) - 1) + 'px,' + (padT + caret.r * lh) + 'px)';
    if (ime._tf !== tf) { ime._tf = tf; ime.style.transform = tf; }
    if (ime.readOnly === isEditable()) ime.readOnly = !isEditable();   // a read-only view takes no composition
    if (caretEl._tf !== tf) {
      caretEl._tf = tf;
      caretEl.style.transform = tf;
      caretEl.classList.remove('is-blink'); void caretEl.offsetWidth; caretEl.classList.add('is-blink');
    }
    var ch = (V.text(caret.r, side) || '').charAt(caret.c) || ' ';
    caretEl.setAttribute('data-ch', ch);
  }
  function markCurrentRow() {
    if (mode !== 'file') return;
    rowEls.forEach(function (el, r) { el.classList.toggle('is-cur', r === caret.r); });
  }

  /* ==== the scroll track (the minimap scrollbar): one mapping for bars, marks and the thumb ==== */
  function trackGeom() {
    var sh = Math.max(geo.sh, 1), ch = geo.ch;
    var T = Math.max(1, sh - headH), viewH = Math.max(1, ch - headH);
    var trackH = Math.max(1, geo.trackH);
    var scrollable = sh > ch + 1;
    var k = trackH / T, exactTop = geo.st * k, exactH = viewH * k;
    var hgt = Math.max(exactH, 24);
    var top = clamp(exactTop + exactH / 2 - hgt / 2, 0, Math.max(0, trackH - hgt));
    return { scrollable: scrollable, k: k, top: top, h: hgt, exactTop: exactTop, exactH: exactH, trackH: trackH, T: T };
  }
  function updateThumb() {
    if (special) return;
    var g = trackGeom();
    thumb.hidden = !g.scrollable;
    thumb.style.height = g.h + 'px';
    thumb.style.transform = 'translateY(' + g.top + 'px)';
    var now = String(topRow() + 1);
    if (track._now !== now) { track._now = now; track.setAttribute('aria-valuenow', now); }
  }
  function colors() {
    if (colorCache) return colorCache;
    var out = {};
    ['mm-ink', 'add-fg', 'mod-fg', 'del-fg', 'conf-fg', 'hit-mark', 'caret-mark'].forEach(function (k) {
      probe.style.color = 'var(--pmw-ed-' + k + ')';
      out[k] = getComputedStyle(probe).color;
    });
    var cs = getComputedStyle(track);
    out.inkA = parseFloat(cs.getPropertyValue('--pmw-ed-mm-alpha')) || 0.22;
    colorCache = out;
    return out;
  }
  function rowKindFor(r) {
    if (mode === 'diff') { var row = V.rows[r]; return row.k === 'add' || row.k === 'del' || row.k === 'mod' ? row.k : ''; }
    var mk = marksOf(d);
    return mk ? mk.kinds[r] : '';
  }
  function drawTrack() {
    if (special || !V) return;
    timers.drawQueued = false;
    var tw = trackW, th = geo.trackH;
    if (!tw || !th) return;
    var dpr = window.devicePixelRatio || 1;
    var W0 = Math.round(tw * dpr), H0 = Math.round(th * dpr);
    if (canvas.width !== W0) canvas.width = W0;
    if (canvas.height !== H0) canvas.height = H0;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, tw, th);
    var col = colors(), g = trackGeom(), n = V.n;
    var full = root.getAttribute('data-track') === 'full';
    var laneX = 3, laneW = full ? 13 : 0, markX = full ? tw - 5 : 3, markW = 4;
    var pitch = g.scrollable ? lh * g.k : Math.min(3, th / Math.max(n, 1));
    var y0 = g.scrollable ? (padT - headH) * g.k : 0;
    var kindColor = { add: col['add-fg'], mod: col['mod-fg'], del: col['del-fg'], conf: col['conf-fg'] };
    function textFor(r) {
      if (mode !== 'diff') return d.lines[r];
      var row = V.rows[r];
      return row.t != null && (row.k === 'ctx' || row.k === 'add' || row.k === 'del') ? row.t : row.R ? row.R.t : row.L ? row.L.t : '';
    }
    if (laneW) {
      var scale = laneW / 80;
      if (pitch >= 1) {
        for (var r = 0; r < n; r++) {
          var y = y0 + r * pitch;
          if (y > th) break;
          var t = textFor(r) || '';
          var len = t.length; if (!len) continue;
          var ind = len - t.replace(/^\s+/, '').length;
          if (ind >= len) continue;
          var kd = rowKindFor(r);
          ctx.globalAlpha = kd ? 0.62 : col.inkA;
          ctx.fillStyle = kd ? kindColor[kd] : col['mm-ink'];
          var bh = Math.max(pitch - (pitch >= 3 ? 1 : 0), 1);
          ctx.fillRect(laneX + Math.min(ind, 70) * scale, y, Math.max(Math.min(len - ind, 80 - Math.min(ind, 70)) * scale, 1), bh);
        }
      } else {
        // very long documents: one pixel row takes the longest line and the strongest kind under it
        var rank = { '': 0, add: 1, mod: 2, del: 3, conf: 4 };
        var acc = {}, kinds = {};
        for (var r2 = 0; r2 < n; r2++) {
          var py = Math.floor(y0 + r2 * pitch);
          var t2 = textFor(r2) || '';
          var ind2 = t2.length - t2.replace(/^\s+/, '').length;
          var w2 = Math.max(0, t2.length - ind2);
          var a = acc[py];
          if (!a || w2 > a[1]) acc[py] = [ind2, w2];
          var k2 = rowKindFor(r2);
          if (rank[k2] > rank[kinds[py] || '']) kinds[py] = k2;
        }
        Object.keys(acc).forEach(function (pyS) {
          var p = +pyS, v = acc[pyS], kk = kinds[pyS] || '';
          if (!v[1]) return;
          ctx.globalAlpha = kk ? 0.62 : col.inkA;
          ctx.fillStyle = kk ? kindColor[kk] : col['mm-ink'];
          ctx.fillRect(laneX + Math.min(v[0], 70) * scale, p, Math.max(Math.min(v[1], 80) * scale, 1), 1);
        });
      }
    }
    // the mark lane: changes, find hits, the caret line
    ctx.globalAlpha = 1;
    var markH = Math.max(pitch, 2);
    for (var r3 = 0; r3 < n; r3++) {
      var k3 = rowKindFor(r3);
      if (!k3) continue;
      ctx.fillStyle = kindColor[k3];
      ctx.fillRect(markX, Math.floor(y0 + r3 * pitch), markW, markH);
    }
    if (mode === 'file') {
      var mk = marksOf(d);
      if (mk) Object.keys(mk.dels).forEach(function (at) {
        ctx.fillStyle = kindColor.del;
        ctx.fillRect(markX - 1, Math.max(0, Math.floor(y0 + (+at) * pitch) - 1), markW + 1, 2);
      });
    }
    if (find.open && find.hits.length) {
      ctx.fillStyle = col['hit-mark'];
      var lastY = -9;
      find.hits.forEach(function (hh, i) {
        var yy = Math.floor(y0 + hh.r * pitch);
        if (yy === lastY && i !== find.cur) return;
        lastY = yy;
        ctx.fillRect(i === find.cur ? markX - 2 : markX, yy, i === find.cur ? markW + 2 : markW, Math.max(markH, 2));
      });
    }
    if (mode === 'file') {
      ctx.fillStyle = col['caret-mark'];
      ctx.fillRect(full ? laneX : 1, Math.floor(y0 + caret.r * pitch + Math.max(pitch, 1) / 2), full ? tw - laneX - 1 : tw - 2, 1);
    }
  }
  function queueDraw() {
    if (timers.drawQueued) return;
    timers.drawQueued = true;
    requestAnimationFrame(function () { if (alive) drawTrack(); });
  }

  /* track pointer: grab keeps its offset, a track press centres the thumb and keeps dragging, Escape cancels */
  track.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || special) return;
    var g = trackGeom();
    if (!g.scrollable) return;
    var rect = track.getBoundingClientRect(), y = e.clientY - rect.top;
    var onThumb = y >= g.top && y <= g.top + g.h;
    var grab = onThumb ? y - g.top : g.h / 2;
    var start = geo.st;
    function to(py) {
      var gg = trackGeom();
      var exactTop = (py - grab) + gg.h / 2 - gg.exactH / 2;
      setTop(clamp(exactTop / gg.k, 0, geo.sh - geo.ch));
    }
    try { track.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
    track.classList.add('is-drag');
    to(y);
    function move(ev) { to(ev.clientY - track.getBoundingClientRect().top); }
    function key(ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); setTop(start); end(); } }
    function end() {
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', end);
      track.removeEventListener('lostpointercapture', end);
      window.removeEventListener('keydown', key, true);
      track.classList.remove('is-drag');
    }
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', end);
    track.addEventListener('lostpointercapture', end);
    window.addEventListener('keydown', key, true);
  });
  track.addEventListener('wheel', function (e) {
    e.preventDefault();
    var unit = e.deltaMode === 1 ? lh : e.deltaMode === 2 ? geo.ch : 1;
    setTop(geo.st + (e.deltaY * unit));
    setLeft(geo.sl + (e.deltaX * unit));
  }, { passive: false });

  /* the horizontal thumb: a thin custom bar, shown while the code overflows and the pointer is over it or it scrolls */
  function updateHbar() {
    if (special || V.side) { hbar.hidden = true; return; }
    var cwid = geo.cwid, sw = geo.sw;
    var over = sw > cwid + 1;
    hbar.hidden = !over;
    if (!over) return;
    var lane = Math.max(1, cwid - gutW - 8);
    var w = Math.max(28, lane * (cwid - gutW) / Math.max(1, sw - gutW));
    var x = (lane - w) * (geo.sl / Math.max(1, sw - cwid));
    hthumb.style.width = w + 'px';
    hthumb.style.transform = 'translateX(' + x + 'px)';
  }
  hbar.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    var r = hbar.getBoundingClientRect();
    var tw = hthumb.getBoundingClientRect();
    var onThumb = e.clientX >= tw.left && e.clientX <= tw.right;
    var grab = onThumb ? e.clientX - tw.left : tw.width / 2;
    var start = geo.sl;
    function to(cx) {
      var lane = Math.max(1, r.width), w = tw.width;
      var x = clamp(cx - r.left - grab, 0, lane - w);
      setLeft(x / Math.max(1, lane - w) * (geo.sw - geo.cwid));
    }
    to(e.clientX);
    try { hbar.setPointerCapture(e.pointerId); } catch (_) {}
    hbar.classList.add('is-drag');
    function move(ev) { to(ev.clientX); }
    function key(ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); setLeft(start); end(); } }
    function end() { hbar.removeEventListener('pointermove', move); hbar.removeEventListener('pointerup', end); hbar.removeEventListener('lostpointercapture', end); window.removeEventListener('keydown', key, true); hbar.classList.remove('is-drag'); }
    hbar.addEventListener('pointermove', move); hbar.addEventListener('pointerup', end); hbar.addEventListener('lostpointercapture', end);
    window.addEventListener('keydown', key, true);
  });

  /* ==== sticky scroll ==== */
  function topRow() { return Math.max(0, Math.floor((geo.st + headH - padT) / lh + 0.001)); }
  function updateSticky() {
    var on = !!setting('editor.stickyScroll', true) && mode === 'file' && !special && (geo.ch - headH) >= 240;
    var max = clamp(+setting('editor.stickyScroll.maxLines', 3) || 3, 1, 5);
    var rows = [], shift = 0;
    if (on) {
      var scopes = scopesOf(d), first = topRow();
      for (var i = 0; i < scopes.length; i++) {
        var s = scopes[i], cover = first + rows.length;
        if (s.start >= cover) break;
        if (s.end >= cover && s.start < cover) rows.push(s);
        if (rows.length === max) break;
      }
      var last = rows[rows.length - 1];
      if (last) {
        // push-up: the last sticky row slides out as its scope's end passes (scroll-linked, so it stays under Reduced Motion)
        var endY = padT + (last.end + 1) * lh - geo.st - headH;
        shift = Math.min(0, endY - rows.length * lh);
      }
    }
    var key = rows.map(function (s) { return s.start; }).join(',') + '|' + shift + '|' + geo.sl + '|' + d.version;
    if (sticky._key === key) return;
    sticky._key = key;
    stickyRows = rows;
    stickyH = rows.length ? Math.max(0, rows.length * lh + shift) : 0;
    sticky.hidden = !rows.length;
    stickyBox.textContent = '';
    if (!rows.length) return;
    sticky.style.height = stickyH + 'px';
    var inner = h('div', { class: 'pmw-ed-sticky-in', style: { transform: 'translate(' + (-geo.sl) + 'px,' + shift + 'px)', width: contentW + 'px' } });
    rows.forEach(function (s, i) {
      var el = doc.createElement('div');
      el.className = 'pmw-ed-row pmw-ed-srow';
      el.style.top = (i * lh) + 'px';
      el.setAttribute('data-line', s.start);
      var g = gutter(s.start + 1, '', null);
      g.style.transform = 'translateX(' + geo.sl + 'px)';
      el.appendChild(g);
      var tx = doc.createElement('span');
      tx.className = 'pmw-ed-tx';
      paintTokens(tx, d.lines[s.start], tokensOf(d, s.start, true), null);
      el.appendChild(tx);
      inner.appendChild(el);
    });
    stickyBox.appendChild(inner);
  }
  sticky.addEventListener('mousedown', function (e) {
    var t0 = innerTarget(e);
    var row = t0 && t0.closest && t0.closest('.pmw-ed-srow');
    if (!row) return;
    e.preventDefault();
    var line = +row.getAttribute('data-line');
    setCaret({ r: line, c: firstNonSpace(d.lines[line]) }, false);
    setTop(padT + line * lh - headH);
    scroller.focus({ preventScroll: true });
  });

  /* breadcrumb symbol: the innermost scope at the top line (or the hunk at the top in diff mode) */
  function updateSymbol() {
    var name2 = '';
    if (special) name2 = '';
    else if (mode === 'file') {
      var line = Math.min(d.lines.length - 1, topRow() + stickyRows.length);
      var scopes = scopesOf(d), best = null;
      for (var i = 0; i < scopes.length; i++) { var s = scopes[i]; if (s.start > line) break; if (s.end >= line && s.start <= line) best = s; }
      if (best) name2 = symbolName(d.lines[best.start], d.lang);
    } else if (V && V.changes && V.changes.length) {
      var tr = topRow(), idx = 0;
      for (var j = 0; j < V.changes.length; j++) if (V.changes[j] <= tr + 2) idx = j;
      name2 = 'Change ' + (idx + 1) + ' of ' + V.changes.length;
    }
    if (symEl.textContent !== name2) symEl.textContent = name2;
    symEl.hidden = !name2;
  }

  /* ==== scrolling ==== */
  var scrollIdle = 0;
  function onScroll() {
    geo.st = scroller.scrollTop; geo.sl = scroller.scrollLeft;
    renderRows(false);
    renderOverlays();
    updateThumb();
    updateSticky();
    updateHbar();
    hbar.classList.add('is-active');
    clearTimeout(scrollIdle);
    scrollIdle = setTimeout(function () { hbar.classList.remove('is-active'); }, 900);
    if (!timers.sym) timers.sym = requestAnimationFrame(function () { timers.sym = 0; updateSymbol(); });
  }
  scroller.addEventListener('scroll', onScroll, { passive: true });
  scroller.addEventListener('wheel', function (e) {
    if (!V || !V.side) return;
    var dx = e.shiftKey ? e.deltaY : e.deltaX;
    if (!dx) return;
    e.preventDefault();
    var r = scroller.getBoundingClientRect();
    var sd = e.clientX - r.left < half ? 'l' : 'r';
    var maxS = Math.max(0, padL + (V.maxCols + 2) * cw - (half - gutS));
    if (sd === 'l') sxl = clamp(sxl + dx, 0, maxS); else sxr = clamp(sxr + dx, 0, maxS);
    setVar('--pmw-ed-sxl', sxl + 'px');
    setVar('--pmw-ed-sxr', sxr + 'px');
    renderOverlays();
  }, { passive: false });

  function scrollToRow(r, how) {
    var y = padT + r * lh;
    var viewTop = geo.st + headH + stickyH, viewBot = geo.st + geo.ch - 10;
    if (how === 'center') setTop(y - headH - (geo.ch - headH) / 2 + lh / 2);
    else if (how === 'top') setTop(y - headH - stickyH);
    else if (y < viewTop) setTop(y - headH - stickyH - lh);
    else if (y + lh > viewBot) setTop(y + lh - geo.ch + 10 + lh);
  }
  function ensureCaretVisible() {
    scrollToRow(caret.r);
    if (V.side) return;
    var x = textX + caret.c * cw, left = geo.sl + gutW + 8, right = geo.sl + geo.cwid - 24;
    if (x < left) setLeft(Math.max(0, x - gutW - 40));
    else if (x > right) setLeft(x - geo.cwid + 64);
  }

  /* ==== the focus band (an opened line: chat, problems, terminal links, go to line) ==== */
  function showFocus(r) {
    clearTimeout(focusTimer); clearTimeout(fadeTimer);
    focusBand = { r: r, fading: false };
    renderOverlays();
    var ms = +setting('code.editing.goto-highlight-ms', 5000) || 5000;
    focusTimer = setTimeout(function () {
      if (!focusBand) return;
      if (reduced()) { focusBand = null; renderOverlays(); return; }
      focusBand.fading = true; renderOverlays();
      fadeTimer = setTimeout(function () { focusBand = null; renderOverlays(); }, 650);
    }, ms);
  }

  /* ==== modes and layout ==== */
  function resolveLayout(announceIt) {
    if (mode !== 'diff') return false;
    var w = host.clientWidth, min = +setting('editor.diff.sideBySideMin', SIDE_MIN_DEFAULT) || SIDE_MIN_DEFAULT;
    var pick = diffLayoutPick || setting('editor.diff.layout', 'auto');
    var want;
    if (pick === 'inline') want = false;
    else if (pick === 'side') {
      want = w >= 600;
      if (!want && announceIt) PMW.announce('Too narrow for side by side, so the diff is inline');
    } else want = sideNow ? w >= min - SIDE_HYST : w >= min;
    var changed = want !== sideNow;
    if (changed || announceIt) {
      var keep = { caret: lineOfRow(caret.r), top: lineOfRow(topRow()), focus: focusBand ? lineOfRow(focusBand.r) : null };
      sideNow = want;
      side = 'r'; anchor = null;
      rebuild();
      if (keep.caret) caret = { r: rowForLine(keep.caret - 1), c: 0 };
      if (keep.focus && focusBand) focusBand.r = rowForLine(keep.focus - 1);
      if (keep.top) setTop(padT + rowForLine(keep.top - 1) * lh - headH);
      onScroll();
      refreshHeader();
    }
    return changed;
  }
  function setMode(m, o) {
    o = o || {};
    if (m === 'diff' && !d.base && !d.chat) return;
    if (m === 'file' && d.chat) return;
    if (m === mode && !o.force) return;
    var keepLine = mode === 'file' ? topRow() : null;
    mode = m;
    root.setAttribute('data-mode', mode);
    scroller.setAttribute('data-mode', mode);
    scroller.setAttribute('aria-readonly', d.readOnly || mode === 'diff' ? 'true' : 'false');
    anchor = null; side = 'r';
    if (mode === 'diff') {
      var w = host.clientWidth, pick = diffLayoutPick || setting('editor.diff.layout', 'auto');
      sideNow = pick === 'side' ? w >= 600 : pick === 'inline' ? false : w >= (+setting('editor.diff.sideBySideMin', SIDE_MIN_DEFAULT) || SIDE_MIN_DEFAULT);
    }
    rebuild();
    refreshHeader();
    if (find.open) runFind(true);
    if (mode === 'diff') {
      var target = o.line != null ? rowForLine(o.line - 1) : keepLine != null ? rowForLine(keepLine) : (V.changes[0] || 0);
      caret = { r: clamp(target, 0, V.n - 1), c: 0 };
      scrollToRow(caret.r, 'center');
    } else {
      var ln = o.line != null ? o.line - 1 : 0;
      caret = { r: clamp(ln, 0, d.lines.length - 1), c: 0 };
      scrollToRow(caret.r, 'center');
    }
    renderOverlays();
    PMW.announce(mode === 'diff' ? 'Showing changes' + (sideNow ? ' side by side' : ' inline') : 'Showing the file');
  }
  function lineOfRow(r) {
    // the line number a row shows (new numbering; old in a deleted file); meta rows take the next numbered row
    if (mode !== 'diff') return r + 1;
    for (var i = Math.max(0, r); i < V.rows.length; i++) {
      var row = V.rows[i], n;
      if (V.side) n = V.delFile ? (row.L && row.L.n) : ((row.R && row.R.n) || (row.L && row.L.n));
      else n = V.delFile ? row.o : (row.n || row.o);
      if (n) return n;
    }
    return null;
  }
  function rowForLine(line0) {
    // a 0-based line of the current text -> the diff row showing it (new numbering; old in a deleted file)
    if (mode !== 'diff') return line0;
    var want = line0 + 1, best = 0, bestD = Infinity;
    for (var r = 0; r < V.rows.length; r++) {
      var row = V.rows[r], num = null;
      if (V.side) num = V.delFile ? (row.L && row.L.n) : (row.R && row.R.n);
      else num = V.delFile ? row.o : (row.k === 'del' ? null : row.n);
      if (num == null) continue;
      var dd = Math.abs(num - want);
      if (dd < bestD) { bestD = dd; best = r; if (!dd) break; }
    }
    return best;
  }
  function gotoChange(dir) {
    var list = mode === 'diff' ? V.changes : (marksOf(d) ? marksOf(d).changes : []);
    if (!list || !list.length) { PMW.announce('No changes'); return; }
    var cur = mode === 'diff' ? caret.r : caret.r;
    var idx = -1;
    if (dir > 0) { for (var i = 0; i < list.length; i++) if (list[i] > cur) { idx = i; break; } if (idx < 0) idx = 0; }
    else { for (var j = list.length - 1; j >= 0; j--) if (list[j] < cur) { idx = j; break; } if (idx < 0) idx = list.length - 1; }
    var r = Math.min(list[idx], V.n - 1);
    setCaret({ r: r, c: 0 }, false);
    scrollToRow(r, 'center');
    PMW.announce('Change ' + (idx + 1) + ' of ' + list.length);
    updateSymbol();
  }
  function rebuild() {
    buildView();
    root.classList.toggle('is-sbs', !!V.side);
    setVar('--pmw-ed-sxl', '0px'); setVar('--pmw-ed-sxr', '0px');
    sxl = 0; sxr = 0;
    layout();
    renderRows(true);
    sticky._key = null;
    updateSticky();
    renderOverlays();
    updateThumb();
    updateHbar();
    queueDraw();
    updateSymbol();
  }

  /* ==== caret and selection ==== */
  function lineLen(r) { var t = V.text(r, side); return t == null ? 0 : t.length; }
  function firstNonSpace(t) { var m = /\S/.exec(t || ''); return m ? m.index : 0; }
  function setCaret(p, extend) {
    if (extend) { if (!anchor) anchor = { r: caret.r, c: caret.c }; }
    else anchor = null;
    var r = clamp(p.r, 0, Math.max(0, V.n - 1));
    caret = { r: r, c: clamp(p.c, 0, lineLen(r)) };
    if (anchor && anchor.r === caret.r && anchor.c === caret.c && !extend) anchor = null;
    markCurrentRow();
    renderOverlays();
    updatePos();
    if (mode === 'file') queueDraw();
  }
  function isWordCh(ch) { return /[\w$]/.test(ch); }
  function wordLeft(t, c) {
    var i = c;
    while (i > 0 && /\s/.test(t.charAt(i - 1))) i--;
    if (i > 0 && isWordCh(t.charAt(i - 1))) { while (i > 0 && isWordCh(t.charAt(i - 1))) i--; }
    else if (i > 0) { var k = t.charAt(i - 1); while (i > 0 && !isWordCh(t.charAt(i - 1)) && !/\s/.test(t.charAt(i - 1)) && t.charAt(i - 1) === k) i--; if (i === c) i--; }
    return Math.max(0, i);
  }
  function wordRight(t, c) {
    var i = c, n = t.length;
    while (i < n && /\s/.test(t.charAt(i))) i++;
    if (i < n && isWordCh(t.charAt(i))) { while (i < n && isWordCh(t.charAt(i))) i++; }
    else if (i < n) { var k = t.charAt(i); while (i < n && !isWordCh(t.charAt(i)) && !/\s/.test(t.charAt(i)) && t.charAt(i) === k) i++; }
    return i;
  }
  function wordAt(r, c) {
    var t = V.text(r, side) || '';
    var a = c, b = c;
    if (!isWordCh(t.charAt(c)) && c > 0 && isWordCh(t.charAt(c - 1))) { a = c - 1; b = c - 1; }
    if (!isWordCh(t.charAt(a))) return { a: c, b: Math.min(t.length, c + 1) };
    while (a > 0 && isWordCh(t.charAt(a - 1))) a--;
    while (b < t.length && isWordCh(t.charAt(b))) b++;
    return { a: a, b: b };
  }
  function move(kind, extend, ctrl) {
    var s = selRange();
    var t = V.text(caret.r, side) || '';
    var p = { r: caret.r, c: caret.c };
    if (s && !extend && (kind === 'left' || kind === 'right')) { setCaret(kind === 'left' ? s.a : s.b, false); goalCol = -1; ensureCaretVisible(); return; }
    if (kind === 'left') {
      if (ctrl) { if (p.c === 0 && p.r > 0) { p.r--; p.c = lineLen(p.r); } else p.c = wordLeft(t, p.c); }
      else if (p.c > 0) p.c--; else if (p.r > 0) { p.r--; p.c = lineLen(p.r); }
      goalCol = -1;
    } else if (kind === 'right') {
      if (ctrl) { if (p.c >= t.length && p.r < V.n - 1) { p.r++; p.c = 0; } else p.c = wordRight(t, p.c); }
      else if (p.c < t.length) p.c++; else if (p.r < V.n - 1) { p.r++; p.c = 0; }
      goalCol = -1;
    } else if (kind === 'up' || kind === 'down' || kind === 'pageup' || kind === 'pagedown') {
      if (goalCol < 0) goalCol = p.c;
      var step = kind === 'up' ? -1 : kind === 'down' ? 1 : (kind === 'pageup' ? -1 : 1) * Math.max(1, Math.floor((geo.ch - headH - stickyH) / lh) - 1);
      var nr = clamp(p.r + step, 0, V.n - 1);
      if (nr === p.r && step < 0) { p.c = 0; goalCol = -1; }
      else if (nr === p.r && step > 0) { p.c = lineLen(p.r); goalCol = -1; }
      else { p.r = nr; p.c = Math.min(goalCol, lineLen(nr)); }
      if (kind === 'pageup' || kind === 'pagedown') setTop(geo.st + (step * lh));
    } else if (kind === 'home') {
      if (ctrl) { p.r = 0; p.c = 0; }
      else { var fns = firstNonSpace(t); p.c = p.c === fns ? 0 : fns; }
      goalCol = -1;
    } else if (kind === 'end') {
      if (ctrl) { p.r = V.n - 1; p.c = lineLen(p.r); } else p.c = t.length;
      goalCol = -1;
    }
    setCaret(p, extend);
    ensureCaretVisible();
  }
  function selectedText() {
    var s = selRange();
    if (!s) return '';
    var out = [];
    for (var r = s.a.r; r <= s.b.r; r++) {
      var t = V.text(r, side);
      if (t == null) continue;
      out.push(t.slice(r === s.a.r ? s.a.c : 0, r === s.b.r ? s.b.c : t.length));
    }
    return out.join('\n');
  }
  function selectAll() {
    anchor = { r: 0, c: 0 };
    caret = { r: V.n - 1, c: lineLen(V.n - 1) };
    renderOverlays(); updatePos();
  }

  /* ==== editing (source mode, editable documents) ==== */
  function isEditable() { return mode === 'file' && !d.readOnly && !special; }
  function isDirty() { return !linesEqual(d.lines, d.savedLines); }
  function noteReadOnly() {
    if (nowMs() - lastReadOnlyNote < 3000) return;
    lastReadOnlyNote = nowMs();
    var why = mode === 'diff' ? 'The changes view does not edit. Switch back to the file to type.' : (d.readOnly || 'Read-only') + ': this text cannot be edited.';
    PMW.toast(why);
  }
  function edit(a, b, text, kind) {
    var L = d.lines;
    var before = L[a.r].slice(0, a.c), after = L[b.r].slice(b.c);
    var ins = (before + text + after).split('\n');
    var removed = L.slice(a.r, b.r + 1);
    var selBefore = { caret: { r: caret.r, c: caret.c }, anchor: anchor ? { r: anchor.r, c: anchor.c } : null };
    L.splice.apply(L, [a.r, b.r - a.r + 1].concat(ins));
    invalidateTokens(d, a.r, removed.length, ins.length);
    d.version++;
    var endPos = { r: a.r + ins.length - 1, c: ins[ins.length - 1].length - after.length };
    var top = d.undo[d.undo.length - 1], t = nowMs();
    if (kind && top && top.kind === kind && t - top.t < 900 && top.start === a.r && top.inserted.length === 1 && ins.length === 1 && removed.length === 1) {
      top.inserted = ins.slice(); top.after = { caret: endPos, anchor: null }; top.t = t;
    } else {
      d.undo.push({ start: a.r, removed: removed, inserted: ins.slice(), before: selBefore, after: { caret: endPos, anchor: null }, kind: kind, t: t });
      if (d.undo.length > 400) d.undo.shift();
    }
    d.redo = [];
    anchor = null;
    caret = endPos;
    afterEdit();
  }
  function replaceSel(text, kind) {
    if (!isEditable()) { noteReadOnly(); return; }
    var s = selRange() || { a: caret, b: caret };
    edit(s.a, s.b, text, kind);
  }
  function undoRedo(dir) {
    if (!isEditable()) { noteReadOnly(); return; }
    var from = dir < 0 ? d.undo : d.redo, to = dir < 0 ? d.redo : d.undo;
    var u = from.pop();
    if (!u) { PMW.announce(dir < 0 ? 'Nothing to undo' : 'Nothing to redo'); return; }
    var cur = dir < 0 ? u.inserted : u.removed, next = dir < 0 ? u.removed : u.inserted;
    d.lines.splice.apply(d.lines, [u.start, cur.length].concat(next));
    invalidateTokens(d, u.start, cur.length, next.length);
    d.version++;
    var sel = dir < 0 ? u.before : u.after;
    caret = { r: sel.caret.r, c: sel.caret.c };
    anchor = sel.anchor ? { r: sel.anchor.r, c: sel.anchor.c } : null;
    to.push(u);
    afterEdit();
  }
  function afterEdit() {
    V.n = d.lines.length;
    layout();
    renderRows(true);
    renderOverlays();
    ensureCaretVisible();
    updatePos();
    markCurrentRow();
    setDirty(isDirty());
    d.views.forEach(function (v) { if (v !== self) v.docChanged(); });
    clearTimeout(timers.edit);
    timers.edit = setTimeout(function () {
      if (!alive) return;
      if (d.base) { computeMarks(d); renderRows(true); renderOverlays(); refreshHeaderSoft(); }
      sticky._key = null; updateSticky(); updateSymbol();
      if (find.open) runFind(false);
      queueDraw();
    }, 160);
    queueDraw();
  }
  function refreshHeaderSoft() {
    var b = hrow.action('diff');
    var has = hasChanges();
    if (b && (b.getAttribute('aria-disabled') === 'true') === has) refreshHeader();
  }
  var dirtyShown = false;
  function setDirty(v) {
    if (v === dirtyShown) return;
    dirtyShown = v;
    api.update({ dirty: !!v });
  }
  function save() {
    if (!isDirty()) { PMW.toast('No changes to save'); return; }
    d.savedLines = d.lines.slice();
    d.savedVersion = d.version;
    setDirty(false);
    PMW.toast('Saved');
    PMW.announce(name + ' saved');
  }
  function indentOf(t) { return (/^\s*/.exec(t) || [''])[0]; }
  function typeEnter() {
    var t = d.lines[caret.r], c = caret.c;
    var ind = indentOf(t);
    if (c < ind.length) ind = ind.slice(0, c);
    var before = t.slice(0, c).replace(/\s+$/, ''), after = t.slice(c);
    var opener = /[{(\[]$/.test(before) || (d.lang === 'yaml' && /:$/.test(before)) || (d.lang === 'md' && false);
    var closer = /^\s*[}\])]/.test(after);
    if (opener && closer) {
      replaceSel('\n' + ind + '    \n' + ind, 'enter');
      caret = { r: caret.r - 1, c: ind.length + 4 };
      anchor = null; renderOverlays(); updatePos();
      return;
    }
    var list = d.lang === 'md' && /^(\s*)([-*+]|\d+\.)\s+\S/.exec(t);
    if (list && c === t.length) { replaceSel('\n' + list[1] + (/\d/.test(list[2]) ? (parseInt(list[2], 10) + 1) + '.' : list[2]) + ' ', 'enter'); return; }
    replaceSel('\n' + ind + (opener ? '    ' : ''), 'enter');
  }
  function typeTab(outdent) {
    var s = selRange();
    if (!s && !outdent) { var spaces = 4 - (caret.c % 4); replaceSel(new Array(spaces + 1).join(' '), 'type'); return; }
    var a = s ? s.a : caret, b = s ? s.b : caret;
    var lastLine = b.c === 0 && b.r > a.r ? b.r - 1 : b.r;
    var lines = d.lines.slice(a.r, lastLine + 1).map(function (l) {
      if (outdent) return l.replace(/^ {1,4}/, '');
      return l.length ? '    ' + l : l;
    });
    var shift0 = lines[0].length - d.lines[a.r].length;
    var shiftN = lines[lines.length - 1].length - d.lines[lastLine].length;
    var keepAnchor = anchor ? { r: anchor.r, c: anchor.c } : null, keepCaret = { r: caret.r, c: caret.c };
    edit({ r: a.r, c: 0 }, { r: lastLine, c: d.lines[lastLine].length }, lines.join('\n'), 'indent');
    function fix(p) { if (!p) return null; var sh = p.r === a.r ? shift0 : p.r === lastLine ? shiftN : (outdent ? -4 : 4); return { r: p.r, c: Math.max(0, p.c + (p.r >= a.r && p.r <= lastLine ? sh : 0)) }; }
    anchor = fix(keepAnchor); caret = fix(keepCaret);
    if (anchor) { anchor.c = Math.min(anchor.c, d.lines[anchor.r].length); }
    caret.c = Math.min(caret.c, d.lines[caret.r].length);
    renderOverlays(); updatePos();
  }
  function typeBackspace(word) {
    var s = selRange();
    if (s) { replaceSel('', 'del'); return; }
    if (caret.c === 0) { if (caret.r === 0) return; edit({ r: caret.r - 1, c: d.lines[caret.r - 1].length }, caret, '', 'join'); return; }
    var t = d.lines[caret.r], from = caret.c - 1;
    if (word) from = wordLeft(t, caret.c);
    else if (/^ +$/.test(t.slice(0, caret.c)) && caret.c % 4 === 0) from = caret.c - 4;
    edit({ r: caret.r, c: Math.max(0, from) }, caret, '', 'del');
  }
  function typeDelete(word) {
    var s = selRange();
    if (s) { replaceSel('', 'del'); return; }
    var t = d.lines[caret.r];
    if (caret.c >= t.length) { if (caret.r >= d.lines.length - 1) return; edit(caret, { r: caret.r + 1, c: 0 }, '', 'join'); return; }
    edit(caret, { r: caret.r, c: word ? wordRight(t, caret.c) : caret.c + 1 }, '', 'fdel');
  }

  /* ==== clipboard (the scroller is focusable, not a text field, so the host's keys stay the host's) ==== */
  function copyText(text) {
    var ta = h('textarea', { class: 'pmw-ed-clip', 'aria-hidden': 'true', tabindex: '-1' });
    ta.value = text;
    root.appendChild(ta);
    var had = doc.activeElement;
    ta.select();
    try { doc.execCommand('copy'); } catch (_) {}
    ta.remove();
    if (had && had.focus) try { had.focus({ preventScroll: true }); } catch (_) {}
  }
  scroller.addEventListener('copy', function (e) {
    var t = selectedText();
    if (!t) return;
    e.preventDefault();
    e.clipboardData.setData('text/plain', t);
  });
  scroller.addEventListener('cut', function (e) {
    var t = selectedText();
    if (!t) return;
    e.preventDefault();
    e.clipboardData.setData('text/plain', t);
    if (isEditable()) replaceSel('', 'cut'); else noteReadOnly();
  });
  scroller.addEventListener('paste', function (e) {
    var t = e.clipboardData && e.clipboardData.getData('text/plain');
    e.preventDefault();
    if (t == null) return;
    if (!isEditable()) { noteReadOnly(); return; }
    replaceSel(t.replace(/\r\n?/g, '\n').replace(/\t/g, '    '), 'paste');
  });

  /* ==== keyboard ==== */
  function isPrintable(e) { return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey; }
  scroller.addEventListener('keydown', function (e) {
    if (e.isComposing) return;
    var ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey, alt = e.altKey, k = e.key, code = e.code;
    var handled = true;
    if (ctrl && !alt && code === 'KeyF' && !shift) openFind(false);
    else if (ctrl && !alt && code === 'KeyH' && !shift) openFind(true);
    else if (ctrl && !alt && code === 'KeyG' && !shift) openGoto();
    else if (ctrl && !alt && code === 'KeyS' && !shift) { if (isEditable() || isDirty()) save(); else PMW.toast(d.readOnly ? d.readOnly + ': nothing to save' : 'No changes to save'); }
    else if (ctrl && !alt && code === 'KeyA' && !shift) selectAll();
    else if (ctrl && !alt && code === 'KeyZ') undoRedo(shift ? 1 : -1);
    else if (ctrl && !alt && code === 'KeyY' && !shift) undoRedo(1);
    else if (ctrl && !alt && (code === 'KeyC' || code === 'KeyX' || code === 'KeyV')) handled = false;   // copy, cut and paste events
    else if (k === 'F3' && !ctrl && !alt) { if (find.q) stepFind(shift ? -1 : 1); else openFind(false); }
    else if (k === 'F5' && alt && !ctrl) gotoChange(shift ? -1 : 1);
    else if (k === 'Escape' && !shift && !ctrl && !alt) {
      if (find.open) closeFind(); else if (selRange()) { anchor = null; renderOverlays(); } else handled = false;
    }
    else if (k === 'ArrowLeft' && !alt) move('left', shift, ctrl);
    else if (k === 'ArrowRight' && !alt) move('right', shift, ctrl);
    else if (k === 'ArrowUp' && !alt) { if (ctrl && !shift) setTop(geo.st - (lh)); else move('up', shift, false); }
    else if (k === 'ArrowDown' && !alt) { if (ctrl && !shift) setTop(geo.st + (lh)); else move('down', shift, false); }
    else if (k === 'Home' && !alt) move('home', shift, ctrl);
    else if (k === 'End' && !alt) move('end', shift, ctrl);
    else if (k === 'PageUp' && !ctrl && !alt) move('pageup', shift, false);
    else if (k === 'PageDown' && !ctrl && !alt) move('pagedown', shift, false);
    else if (k === 'Enter' && !ctrl && !alt) {
      if (mode === 'diff' && V.rows[caret.r] && V.rows[caret.r].k === 'fold') expandFold(V.rows[caret.r].key);
      else if (isEditable()) typeEnter(); else noteReadOnly();
    }
    else if (k === 'Tab' && !ctrl && !alt) { if (isEditable()) typeTab(shift); else handled = false; }
    else if (k === 'Backspace' && !alt) { if (isEditable()) typeBackspace(ctrl); else noteReadOnly(); }
    else if (k === 'Delete' && !alt && !shift) { if (isEditable()) typeDelete(ctrl); else noteReadOnly(); }
    else if (isPrintable(e)) { if (isEditable()) replaceSel(k, k === ' ' ? 'space' : 'type'); else noteReadOnly(); }
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  });

  /* ==== IME and dead keys: text that keydown did not type arrives in the hidden field ==== */
  var composing = false;
  function imeFit() { ime.style.width = '1px'; ime.style.width = Math.max(1, ime.scrollWidth + 2) + 'px'; }
  function imeClear() { ime.value = ''; ime.style.width = ''; }
  function imeInsert(text) {
    imeClear();
    if (!text) return;
    if (!isEditable()) { noteReadOnly(); return; }
    replaceSel(String(text).replace(/\r\n?/g, '\n').replace(/\t/g, '    '), 'type');
  }
  ime.addEventListener('compositionstart', function () {
    composing = true;
    ime.classList.add('is-composing');
    placeCaret();
    imeFit();
  });
  ime.addEventListener('compositionupdate', function () { requestAnimationFrame(imeFit); });
  ime.addEventListener('compositionend', function (e) {
    composing = false;
    ime.classList.remove('is-composing');
    imeInsert(e.data != null && e.data !== '' ? e.data : ime.value);
    renderOverlays();
  });
  ime.addEventListener('input', function (e) {
    // AltGr and Option characters, a dead key followed by a letter, insertText: everything keydown left alone
    if (composing || e.isComposing) return;
    imeInsert(ime.value);
  });

  /* ==== mouse: click places the caret, drag selects, double click a word, triple click a line, the gutter selects lines ==== */
  function posAt(cx, cy) {
    var sr = scroller.getBoundingClientRect();
    var y = cy - sr.top + geo.st, xIn = cx - sr.left;
    var r = clamp(Math.floor((y - padT) / lh), 0, Math.max(0, V.n - 1));
    var sd = side, x;
    if (V.side) { sd = xIn < half ? 'l' : 'r'; x = xIn; }
    else x = xIn + geo.sl;
    var t = V.text(r, sd) || '';
    var c = clamp(Math.round((x - xOf(0, sd)) / cw), 0, t.length);
    var inGutter = V.side ? ((sd === 'l' ? xIn : xIn - half) < gutS) : xIn < gutW;
    return { r: r, c: c, side: sd, inGutter: inGutter };
  }
  var drag = null;
  function innerTarget(e) {
    var t0 = e.composedPath ? e.composedPath()[0] : e.target;
    return t0 && t0.nodeType === 3 ? t0.parentNode : t0;
  }
  scroller.addEventListener('mousedown', function (e) {
    if (e.button !== 0 || special) return;
    var tIn = innerTarget(e);
    var fold = tIn && tIn.closest && tIn.closest('.pmw-ed-fold');
    if (fold) { e.preventDefault(); expandFold(+fold.getAttribute('data-key')); return; }
    var sg = tIn && tIn.closest && tIn.closest('.pmw-ed-sg');
    if (sg && mode === 'file' && sg.textContent && d.base) {
      e.preventDefault();
      var line = +sg.closest('.pmw-ed-row').getAttribute('data-r');
      setMode('diff', { line: line + 1 });
      scroller.focus({ preventScroll: true });
      return;
    }
    var p = posAt(e.clientX, e.clientY);
    e.preventDefault();
    scroller.focus({ preventScroll: true });
    if (V.side && p.side !== side) { side = p.side; anchor = null; }
    var clicks = e.detail || 1;
    if (p.inGutter && !V.side) {
      anchor = { r: p.r, c: 0 };
      setCaret(p.r + 1 < V.n ? { r: p.r + 1, c: 0 } : { r: p.r, c: lineLen(p.r) }, true);
      drag = { mode: 'line', from: p.r };
    } else if (clicks === 2) {
      var w = wordAt(p.r, p.c);
      anchor = { r: p.r, c: w.a }; setCaret({ r: p.r, c: w.b }, true);
      drag = { mode: 'word', from: { r: p.r, a: w.a, b: w.b } };
    } else if (clicks >= 3) {
      anchor = { r: p.r, c: 0 };
      setCaret(p.r + 1 < V.n ? { r: p.r + 1, c: 0 } : { r: p.r, c: lineLen(p.r) }, true);
      drag = { mode: 'line', from: p.r };
    } else {
      setCaret({ r: p.r, c: p.c }, e.shiftKey);
      drag = { mode: 'char' };
    }
    goalCol = -1;
    function onMove(ev) {
      if (!drag) return;
      var q = posAt(ev.clientX, ev.clientY);
      if (drag.mode === 'line') {
        if (q.r >= drag.from) { anchor = { r: drag.from, c: 0 }; caret = q.r + 1 < V.n ? { r: q.r + 1, c: 0 } : { r: q.r, c: lineLen(q.r) }; }
        else { anchor = drag.from + 1 < V.n ? { r: drag.from + 1, c: 0 } : { r: drag.from, c: lineLen(drag.from) }; caret = { r: q.r, c: 0 }; }
        renderOverlays(); updatePos();
      } else if (drag.mode === 'word') {
        var w2 = wordAt(q.r, q.c);
        var f = drag.from;
        if (q.r > f.r || (q.r === f.r && w2.b >= f.b)) { anchor = { r: f.r, c: f.a }; caret = { r: q.r, c: w2.b }; }
        else { anchor = { r: f.r, c: f.b }; caret = { r: q.r, c: w2.a }; }
        renderOverlays(); updatePos();
      } else setCaret({ r: q.r, c: q.c }, true);
      // auto-scroll while the pointer is past an edge
      var sr = scroller.getBoundingClientRect();
      var top = sr.top + headH + stickyH, bot = sr.bottom;
      drag.vy = ev.clientY < top ? -Math.min(40, top - ev.clientY) : ev.clientY > bot ? Math.min(40, ev.clientY - bot) : 0;
      drag.lastX = ev.clientX; drag.lastY = ev.clientY;
      if (drag.vy && !drag.timer) drag.timer = setInterval(function () {
        if (!drag || !drag.vy) { if (drag) { clearInterval(drag.timer); drag.timer = 0; } return; }
        setTop(geo.st + (drag.vy));
        onMove({ clientX: drag.lastX, clientY: drag.lastY });
      }, 30);
    }
    function onUp() {
      if (drag && drag.timer) clearInterval(drag.timer);
      drag = null;
      doc.removeEventListener('mousemove', onMove, true);
      doc.removeEventListener('mouseup', onUp, true);
      if (mode === 'file') queueDraw();
    }
    doc.addEventListener('mousemove', onMove, true);
    doc.addEventListener('mouseup', onUp, true);
  });
  function expandFold(key) {
    expanded[key] = true;
    var keepTop = geo.st;
    rebuild();
    setTop(keepTop);
    PMW.announce('Unchanged lines shown');
  }
  scroller.addEventListener('focus', function () { focused = true; root.classList.add('is-focused'); renderOverlays(); });
  scroller.addEventListener('blur', function () { focused = false; root.classList.remove('is-focused'); renderOverlays(); });
  scroller.addEventListener('mouseenter', function () { hbar.classList.add('is-hover'); });
  scroller.addEventListener('mouseleave', function () { hbar.classList.remove('is-hover'); });

  /* ==== find and replace ==== */
  var findEl = null, fIn = null, rIn = null, fCount = null, fNote = null, fTogs = {};
  function buildFind() {
    if (findEl) return;
    function tog(id, icon, label, detail) {
      var b = h('button', { type: 'button', class: 'pmw-ed-fb pmw-ed-ftog', 'aria-pressed': 'false', 'aria-label': label,
        'data-pm-hover-label': label, 'data-pm-hover-detail': detail || '', 'data-pmh': 'icon' }, [ico(icon, 14)]);
      b.addEventListener('click', function () { find[id] = !find[id]; b.setAttribute('aria-pressed', find[id] ? 'true' : 'false'); runFind(false); fIn.focus(); });
      fTogs[id] = b;
      return b;
    }
    function btn(icon, label, detail, run, cls) {
      var b = h('button', { type: 'button', class: 'pmw-ed-fb' + (cls ? ' ' + cls : ''), 'aria-label': label, 'data-pm-hover-label': label,
        'data-pm-hover-detail': detail || '', 'data-pmh': 'icon' }, [ico(icon, 14)]);
      b.addEventListener('click', run);
      return b;
    }
    var exp = btn('chevronRight', 'Show replace', keyLabel('Ctrl+H'), function () { setReplace(!find.replace); (find.replace ? rIn : fIn).focus(); }, 'pmw-ed-fexp');
    // a field names itself for the hover tags (otherwise the tag engine says "Change this setting.")
    fIn = h('input', { type: 'text', class: 'pmw-ed-fin', placeholder: 'Find', 'aria-label': 'Find', spellcheck: 'false', autocomplete: 'off',
      'data-pm-hover-label': 'Find in this file', 'data-pm-hover-detail': keyLabel('Enter') + ' next match, ' + keyLabel('Shift+Enter') + ' previous' });
    rIn = h('input', { type: 'text', class: 'pmw-ed-fin', placeholder: 'Replace', 'aria-label': 'Replace with', spellcheck: 'false', autocomplete: 'off',
      'data-pm-hover-label': 'Replace with', 'data-pm-hover-detail': keyLabel('Enter') + ' replaces this match, ' + keyLabel('Ctrl+Alt+Enter') + ' every match' });
    fCount = h('span', { class: 'pmw-ed-fcount', 'aria-live': 'polite' });
    fNote = h('p', { class: 'pmw-ed-fnote', hidden: true });
    var row1 = h('div', { class: 'pmw-ed-frow' }, [
      exp, h('span', { class: 'pmw-ed-ffield' }, [fIn]),
      tog('caseSensitive', 'caseSense', 'Match case', keyLabel('Alt+C')), tog('word', 'wholeWord', 'Whole word', 'Words only, not parts of words'),
      tog('regex', 'regex', 'Regular expression', keyLabel('Alt+R')),
      fCount,
      btn('arrowUp', 'Previous match', keyLabel('Shift+Enter'), function () { stepFind(-1); }),
      btn('arrowDown', 'Next match', keyLabel('Enter'), function () { stepFind(1); }),
      btn('close', 'Close', 'Escape', function () { closeFind(); })
    ]);
    var repOne = h('button', { type: 'button', class: 'pmw-ed-fbtn', 'data-pm-hover-label': 'Replace this match', 'data-pm-hover-detail': keyLabel('Ctrl+Shift+1'), 'data-pmh': 'icon' }, [ico('replace', 14), h('span', { text: 'Replace' })]);
    var repAll = h('button', { type: 'button', class: 'pmw-ed-fbtn', 'data-pm-hover-label': 'Replace every match', 'data-pm-hover-detail': keyLabel('Ctrl+Alt+Enter'), 'data-pmh': 'icon' }, [h('span', { text: 'Replace all' })]);
    repOne.addEventListener('click', function () { replaceOne(); });
    repAll.addEventListener('click', function () { replaceAll(); });
    var row2 = h('div', { class: 'pmw-ed-frow is-rep' }, [h('span', { class: 'pmw-ed-fpad' }), h('span', { class: 'pmw-ed-ffield' }, [rIn]), repOne, repAll]);
    findEl = h('div', { class: 'pmw-ed-find', role: 'dialog', 'aria-label': 'Find in ' + name, hidden: true }, [row1, row2, fNote]);
    root.appendChild(findEl);
    fIn.addEventListener('input', function () { find.q = fIn.value; clearTimeout(timers.find); timers.find = setTimeout(function () { runFind(false, true); }, V.n > 5000 ? 120 : 30); });
    rIn.addEventListener('input', function () { find.rep = rIn.value; });
    function keys(e) {
      var ctrl = e.ctrlKey || e.metaKey;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeFind(); return; }
      if (ctrl && !e.altKey && !e.shiftKey && e.code === 'KeyP') { e.preventDefault(); openQuick(); return; }
      if (e.key === 'Enter' && ctrl && e.altKey) { e.preventDefault(); replaceAll(); return; }
      if (e.key === 'Enter' && e.target === rIn && !e.shiftKey) { e.preventDefault(); replaceOne(); return; }
      if (e.key === 'Enter' || e.key === 'F3') { e.preventDefault(); stepFind(e.shiftKey ? -1 : 1); return; }
      if (ctrl && e.shiftKey && (e.code === 'Digit1')) { e.preventDefault(); replaceOne(); return; }
      if (ctrl && !e.altKey && e.code === 'KeyF') { e.preventDefault(); setReplace(false); fIn.focus(); fIn.select(); return; }
      if (ctrl && !e.altKey && e.code === 'KeyH') { e.preventDefault(); setReplace(true); rIn.focus(); rIn.select(); return; }
      if (e.altKey && !ctrl && (e.code === 'KeyC' || e.code === 'KeyR')) {
        e.preventDefault();
        var id = e.code === 'KeyC' ? 'caseSensitive' : 'regex';
        find[id] = !find[id]; fTogs[id].setAttribute('aria-pressed', find[id] ? 'true' : 'false'); runFind(false);
      }
    }
    fIn.addEventListener('keydown', keys);
    rIn.addEventListener('keydown', keys);
  }
  function setReplace(on) {
    find.replace = !!on;
    findEl.classList.toggle('is-replace', find.replace);
    var exp = findEl.querySelector('.pmw-ed-fexp');
    exp.replaceChildren(ico(find.replace ? 'chevronDown' : 'chevronRight', 14));
    exp.setAttribute('aria-label', find.replace ? 'Hide replace' : 'Show replace');
    exp.setAttribute('aria-expanded', find.replace ? 'true' : 'false');
    var ro = !isEditable();
    findEl.querySelectorAll('.is-rep button, .is-rep input').forEach(function (x) { if (ro) x.setAttribute('aria-disabled', 'true'); else x.removeAttribute('aria-disabled'); });
    rIn.readOnly = ro;
    showFindNote();
  }
  function showFindNote() {
    var msg = find.error ? find.error : (find.replace && !isEditable() ? (mode === 'diff' ? 'The changes view does not edit, so replace is off here.' : (d.readOnly || 'Read-only') + ', so replace is off here.') : '');
    fNote.hidden = !msg;
    fNote.textContent = msg;
    fIn.setAttribute('aria-invalid', find.error ? 'true' : 'false');
  }
  function openFind(replace) {
    if (special) return;
    buildFind();
    var wasOpen = find.open;
    find.open = true;
    findEl.hidden = false;
    root.classList.add('is-finding');
    setReplace(replace || (wasOpen && find.replace && replace !== false && false));
    if (replace) setReplace(true);
    var s = selectedText();
    if (s && s.indexOf('\n') < 0) { find.q = s; fIn.value = s; }
    else if (!wasOpen && !fIn.value && V.text(caret.r, side)) {
      var w = wordAt(caret.r, caret.c), t = V.text(caret.r, side) || '';
      var word = t.slice(w.a, w.b);
      if (/\w/.test(word)) { find.q = word; fIn.value = word; }
    }
    (replace ? rIn : fIn).focus();
    fIn.select();
    runFind(false, true);
  }
  function closeFind() {
    if (!find.open) return;
    find.open = false;
    findEl.hidden = true;
    root.classList.remove('is-finding');
    var cur = find.hits[find.cur];
    if (cur) { side = cur.side || side; anchor = { r: cur.r, c: cur.s }; caret = { r: cur.r, c: cur.e }; }
    renderOverlays(); queueDraw();
    scroller.focus({ preventScroll: true });
  }
  function findSource() {
    // source: lines; diff inline: row text; diff side by side: the new side, plus the old side of removed and changed rows
    if (mode !== 'diff') return { n: d.lines.length, at: function (i) { return d.lines[i]; }, map: function (i) { return { r: i, side: 'r' }; } };
    if (!V.side) return { n: V.n, at: function (i) { return V.text(i); }, map: function (i) { return { r: i, side: 'r' }; } };
    var idx = [];
    V.rows.forEach(function (row, r) { if (row.R) idx.push([r, 'r']); if (row.L && (row.k === 'del' || row.k === 'mod')) idx.push([r, 'l']); });
    return { n: idx.length, at: function (i) { return V.text(idx[i][0], idx[i][1]); }, map: function (i) { return { r: idx[i][0], side: idx[i][1] }; } };
  }
  function runFind(keepCur, jump) {
    if (!find.open) return;
    var src = findSource();
    var res = findAll(src.n, src.at, find.q, find, 9999);
    find.error = res.error;
    find.capped = res.capped;
    find.hits = res.hits.map(function (x) { var m = src.map(x.r); return { r: m.r, s: x.s, e: x.e, side: m.side }; });
    find.hits.sort(function (a, b) { return a.r - b.r || (a.side === b.side ? 0 : a.side === 'l' ? -1 : 1) || a.s - b.s; });
    if (!find.hits.length) find.cur = -1;
    else if (!keepCur || find.cur < 0 || find.cur >= find.hits.length) {
      // the first match at or after the caret
      var i = 0;
      while (i < find.hits.length && (find.hits[i].r < caret.r || (find.hits[i].r === caret.r && find.hits[i].e < caret.c))) i++;
      find.cur = i < find.hits.length ? i : 0;
    }
    paintCount();
    showFindNote();
    if (jump && find.cur >= 0) revealHit(find.hits[find.cur]);
    renderOverlays();
    queueDraw();
  }
  function paintCount() {
    var n = find.hits.length;
    fCount.textContent = find.error ? '' : !find.q ? '' : !n ? 'No results' : (find.cur + 1) + ' of ' + (find.capped ? n + '+' : n);
    fCount.classList.toggle('is-none', !!find.q && !n);
  }
  function revealHit(hh) {
    if (!hh) return;
    var y = padT + hh.r * lh, top = geo.st + headH + stickyH + 40, bot = geo.st + geo.ch - 20;
    if (y < top || y + lh > bot) scrollToRow(hh.r, 'center');
    if (!V.side) {
      var x = textX + hh.s * cw;
      if (x < geo.sl + gutW || x + (hh.e - hh.s) * cw > geo.sl + geo.cwid - 24) setLeft(Math.max(0, x - geo.cwid / 2));
    }
  }
  function stepFind(dir) {
    if (!find.hits.length) { if (find.open) runFind(false, true); return; }
    find.cur = (find.cur + dir + find.hits.length) % find.hits.length;
    var hh = find.hits[find.cur];
    caret = { r: hh.r, c: hh.s }; anchor = null; side = hh.side || side;
    paintCount();
    revealHit(hh);
    renderOverlays(); updatePos(); queueDraw();
    PMW.announce('Match ' + (find.cur + 1) + ' of ' + find.hits.length);
  }
  function replaceOne() {
    if (!isEditable()) { showFindNote(); noteReadOnly(); return; }
    var hh = find.hits[find.cur];
    if (!hh) return;
    var pat = findPattern(find.q, find);
    if (!pat.re) return;
    var line = d.lines[hh.r];
    var piece = line.slice(hh.s, hh.e).replace(new RegExp(pat.src, find.caseSensitive ? '' : 'i'), find.regex ? find.rep : find.rep.replace(/\$/g, '$$$$'));
    edit({ r: hh.r, c: hh.s }, { r: hh.r, c: hh.e }, piece, 'replace');
    runFind(true);
    if (find.hits.length) {
      var i = 0;
      while (i < find.hits.length && (find.hits[i].r < hh.r || (find.hits[i].r === hh.r && find.hits[i].s < hh.s + piece.length))) i++;
      find.cur = i % find.hits.length;
      paintCount(); revealHit(find.hits[find.cur]); renderOverlays();
    }
  }
  function replaceAll() {
    if (!isEditable()) { showFindNote(); noteReadOnly(); return; }
    if (!find.hits.length) return;
    var pat = findPattern(find.q, find);
    if (!pat.re) return;
    var n = find.hits.length;
    var first = find.hits[0].r, last = find.hits[n - 1].r;
    var re = new RegExp(pat.src, find.caseSensitive ? 'g' : 'gi');
    var rep = find.regex ? find.rep : find.rep.replace(/\$/g, '$$$$');
    var lines = d.lines.slice(first, last + 1).map(function (l) { return l.replace(re, rep); });
    edit({ r: first, c: 0 }, { r: last, c: d.lines[last].length }, lines.join('\n'), 'replace-all');
    runFind(false);
    PMW.toast('Replaced ' + n + (n === 1 ? ' match' : ' matches'));
  }

  function openQuick() {
    var a = null;
    try { a = PM_HOME.active(); } catch (_) {}
    PMW.quickOpen(a ? a.panelId : null);
  }

  /* ==== go to line ==== */
  var gotoEl = null;
  function openGoto() {
    if (special) return;
    if (gotoEl) { gotoEl.querySelector('input').focus(); return; }
    var startTop = geo.st, startCaret = { r: caret.r, c: caret.c }, startAnchor = anchor;
    var nLines = mode === 'diff' ? maxLineNo() : d.lines.length;
    var input = h('input', { type: 'text', class: 'pmw-ed-gin', placeholder: 'Line or line:column', 'aria-label': 'Go to line', spellcheck: 'false', autocomplete: 'off', inputmode: 'numeric',
      'data-pm-hover-label': 'Go to line', 'data-pm-hover-detail': 'A line, or line:column. ' + keyLabel('Enter') + ' goes there' });
    var hint = h('p', { class: 'pmw-ed-ghint', text: '1–' + nLines + ' · now ' + (mode === 'diff' ? 'in the changes' : (caret.r + 1) + ':' + (caret.c + 1)) });
    gotoEl = h('div', { class: 'pmw-ed-goto', role: 'dialog', 'aria-label': 'Go to line' }, [h('span', { class: 'pmw-ed-gico' }, [ico('target', 14)]), input, hint]);
    root.appendChild(gotoEl);
    function target() { return parseGoto(input.value, nLines); }
    function preview() {
      var t = target();
      if (!t) { setTop(startTop); focusBand = null; renderOverlays(); return; }
      var r = mode === 'diff' ? rowForLine(t.line - 1) : t.line - 1;
      scrollToRow(r, 'center');
      focusBand = { r: r, fading: false };
      renderOverlays();
    }
    function close(commit) {
      var t = commit ? target() : null;
      gotoEl.remove(); gotoEl = null;
      if (t) {
        var r = mode === 'diff' ? rowForLine(t.line - 1) : t.line - 1;
        side = 'r';
        setCaret({ r: r, c: t.col - 1 }, false);
        scrollToRow(r, 'center');
        showFocus(r);
        PMW.announce('Line ' + t.line);
      } else {
        setTop(startTop); caret = startCaret; anchor = startAnchor; focusBand = null; renderOverlays();
      }
      scroller.focus({ preventScroll: true });
    }
    input.addEventListener('input', preview);
    input.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.code === 'KeyP') { e.preventDefault(); close(false); openQuick(); return; }
      if (e.key === 'Enter') { e.preventDefault(); close(true); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); }
    });
    input.addEventListener('blur', function () { setTimeout(function () { if (gotoEl && !gotoEl.contains(doc.activeElement)) close(false); }, 0); });
    input.focus();
  }

  /* ==== reveal (open with a line), resize, look, settings ==== */
  function reveal(s, o) {
    s = s || {};
    o = o || {};
    if (special) return;
    if (!firstDone && !o.initial) {
      // not painted yet: remember the target; the first paint applies it
      if (s.line != null) { st.line = s.line; st.col = s.col; st.top = null; }
      if ((s.mode === 'diff' || s.view === 'diff' || s.diff === true) && d.base && mode !== 'diff') {
        mode = 'diff'; root.setAttribute('data-mode', mode); scroller.setAttribute('data-mode', mode); buildView(); refreshHeader();
      }
      return;
    }
    if ((s.mode === 'diff' || s.view === 'diff' || s.diff === true) && mode !== 'diff') setMode('diff', { line: s.line });
    if ((s.mode === 'file' || s.view === 'file') && mode === 'diff' && !d.chat) setMode('file', { line: s.line });
    var line = s.line != null ? +s.line : (d.chat && o.initial ? d.chat.line : null);
    if (line == null || isNaN(line)) return;
    var r = mode === 'diff' ? rowForLine(line - 1) : clamp(line - 1, 0, d.lines.length - 1);
    var c = s.col != null ? Math.max(0, +s.col - 1) : (mode === 'file' ? firstNonSpace(d.lines[r]) : 0);
    side = 'r';
    setCaret({ r: r, c: c }, false);
    scrollToRow(r, 'center');
    showFocus(r);
  }
  function onResize(sz) {
    if (!alive) return;
    if (!firstDone) { firstPaint(); return; }
    if (sz && sz.final === false && mode === 'diff') { layout(); renderRows(true); renderOverlays(); updateThumb(); return; }
    var changed = resolveLayout(false);
    if (!changed) { layout(); renderRows(true); renderOverlays(); updateThumb(); updateHbar(); sticky._key = null; updateSticky(); }
    queueDraw();
  }
  function relayoutAll() {
    if (!firstDone) return;
    var top = topRow();
    measure();
    layout();
    renderRows(true);
    setTop(padT + top * lh - headH);
    sticky._key = null;
    updateSticky(); renderOverlays(); updateThumb(); updateHbar(); queueDraw();
  }

  /* ==== first paint ====
     The host attaches the tab body before mount (22-render.js), so a tab that shows paints right here; an eager
     background tab is attached hidden (no size), and its first paint (measure, layout, the restored top line or the
     opened line) waits for the first sized onResize or onShow. */
  buildView();
  var firstDone = false;
  function firstPaint() {
    if (firstDone || !alive || !host.isConnected || !host.clientWidth || !host.clientHeight) return false;
    firstDone = true;
    measure();
    if (mode === 'diff') {
      var w0 = host.clientWidth, pick0 = diffLayoutPick || setting('editor.diff.layout', 'auto');
      sideNow = pick0 === 'side' ? w0 >= 600 : pick0 === 'inline' ? false : w0 >= (+setting('editor.diff.sideBySideMin', SIDE_MIN_DEFAULT) || SIDE_MIN_DEFAULT);
      buildView();
      refreshHeader();
    }
    root.classList.toggle('is-sbs', !!(V && V.side));
    layout();
    if (st.top != null) {
      var topR = mode === 'diff' ? rowForLine(+st.top - 1) : +st.top - 1;
      setTop(padT + topR * lh - headH);
    } else if (st.line != null || d.chat) {
      reveal({ line: st.line != null ? st.line : null, col: st.col }, { initial: true });
    }
    if (d.chat && st.line == null && st.top == null) setCaret({ r: V.changes[0] || 0, c: 0 }, false);
    renderRows(true);
    renderOverlays();
    updateThumb();
    updateHbar();
    sticky._key = null;
    updateSticky();
    updateSymbol();
    queueDraw();
    return true;
  }
  firstPaint();

  var offs = [];
  offs.push(api.on('look', function () { applyScheme(); markReduced(); if (!firstDone) return; measure(); var hh = head.offsetHeight; if (hh !== headH) relayoutAll(); else { renderOverlays(); queueDraw(); } }));
  offs.push(api.on('settings', function (ev) {
    var key = ev && ev.key;
    if (!key || key.indexOf('editor.') !== 0 && key !== 'code.editing.goto-highlight-ms') return;
    if (key === 'editor.scheme') { applyScheme(); if (firstDone) queueDraw(); return; }
    if (!firstDone) return;
    if (key === 'editor.diff.layout' || key === 'editor.diff.sideBySideMin') { resolveLayout(true); return; }
    if (key === 'editor.stickyScroll' || key === 'editor.stickyScroll.maxLines') { sticky._key = null; updateSticky(); return; }
    relayoutAll();
  }));

  var self = {
    docChanged: function () { if (!alive || !firstDone) return; V.n = d.lines.length; layout(); renderRows(true); renderOverlays(); queueDraw(); },
    tokensReady: function (done) {
      if (!alive || !firstDone || mode !== 'file') return;
      if (usedGuess && (done || rendered.b < d.tokFrom)) { usedGuess = false; renderRows(true); renderOverlays(); }
      if (done) { sticky._key = null; updateSticky(); updateSymbol(); }
    },
    relayout: relayoutAll,
    scheme: function () { if (!alive) return; applyScheme(); if (firstDone) queueDraw(); }
  };
  d.views.push(self);
  EDITORS.push(self);

  var instance = {
    unmount: function () {
      alive = false;
      Object.keys(timers).forEach(function (k) { if (typeof timers[k] === 'number') { clearTimeout(timers[k]); } });
      clearTimeout(focusTimer); clearTimeout(fadeTimer); clearTimeout(scrollIdle);
      offs.forEach(function (f) { try { f(); } catch (_) {} });
      d.views = d.views.filter(function (v) { return v !== self; });
      var i = EDITORS.indexOf(self); if (i >= 0) EDITORS.splice(i, 1);
      root.remove();
    },
    serialize: function () {
      if (!firstDone) return st;              // never painted: keep what was restored
      var out = { mode: mode };
      if (path) out.path = path;
      out.line = mode === 'diff' ? (lineOfRow(topRow()) || 1) : topRow() + 1;
      out.top = out.line;                     // restore puts this line back at the top (a plain `line` is a target)
      if (mode === 'diff' && diffLayoutPick) out.diffLayout = diffLayoutPick;
      if (!path) {
        out.title = d.title; out.language = d.lang;
        if (d.readOnly) out.readOnly = d.readOnly; else out.edit = true;
        var text = d.lines.join('\n');
        if (text.length <= 12000) out.text = text;
      }
      return out;
    },
    onResize: onResize,
    onShow: function () { visible = true; if (!firstDone) { firstPaint(); return; } queueDraw(); },
    onHide: function () { visible = false; clearTimeout(scrollIdle); },
    onFocus: function () {},
    onBlur: function () {},
    onLook: function () { colorCache = null; queueDraw(); },
    focus: function () { if (special) { root.setAttribute('tabindex', '-1'); root.focus({ preventScroll: true }); return; } scroller.focus({ preventScroll: true }); },
    reveal: function (s) { reveal(s || {}); },     // focus is the host's call (D8: an agent's open never takes it)
    wantsKey: function (e) {
      var ctrl = e.ctrlKey || e.metaKey, alt = e.altKey, shift = e.shiftKey, k = e.key, code = e.code;
      var inField = e.target && e.target.tagName === 'INPUT';
      if (k === 'F6' || (shift && k === 'Escape' && !ctrl && !alt)) return false;
      // a dead key (a Mac Option+` or Option+e accent, a European layout's ^) and an IME's Process key are typing
      if (k === 'Dead' || k === 'Process' || e.keyCode === 229) return true;
      if (alt && !ctrl) {
        if (k === 'F5') return true;
        if (inField && (code === 'KeyC' || code === 'KeyR')) return true;
        // on a Mac, Option+letter and Option+` type characters (a dagger, an accent), so the editor keeps them as
        // typing there and the host's Alt stand-ins fire from outside it (CONTRACT section 9's Mac typing rule)
        if (PMW.isMac && (/^Key[A-Z]$/.test(code) || code === 'Backquote')) return true;
        return false;                         // Alt+1..9, Alt+arrows, Alt+T/W, Alt+` stay the host's
      }
      if (ctrl && !alt) {
        if (k === 'PageUp' || k === 'PageDown' || code === 'Backslash' || code === 'KeyP' || code === 'KeyT' || code === 'KeyW' || code === 'Tab') return false;
        if (shift && (code === 'Space' || code === 'Backquote' || code === 'KeyB' || code === 'KeyA')) return false;
        return true;                          // Ctrl+F/H/G/S, Ctrl+A/C/X/V/Z/Y, Ctrl+arrows, Ctrl+Home/End, Ctrl+Backspace
      }
      if (ctrl && alt) return k === 'Enter' && inField;
      return true;                            // typing, Enter, Tab, arrows, Home/End, PageUp/PageDown, Escape, F3
    },
    canClose: function () {
      if (!isDirty() || !path && untitled && !d.lines.join('').length) return true;
      return new Promise(function (resolve) {
        var done = false;
        function fin(v) { if (done) return; done = true; resolve(v); }
        var r = host.getBoundingClientRect();
        api.menu([
          { id: 'save', label: 'Save', icon: 'check', detail: 'Keep the changes, then close', run: function () { save(); fin(true); } },
          { id: 'discard', label: 'Close without saving', icon: 'close', danger: true, detail: 'The changes are lost', run: function () { d.lines = d.savedLines.slice(); d.version++; d.toks = []; d.ends = []; d.tokFrom = 0; d.undo = []; d.redo = []; fin(true); } },
          { id: 'cancel', label: 'Cancel', detail: 'Keep the tab open', run: function () { fin(false); } }
        ], { x: Math.round(r.left + Math.max(12, r.width / 2 - 150)), y: Math.round(r.top + Math.min(80, r.height / 3)) },
        { title: 'Save changes to ' + name + '?', width: 300, onClose: function () { setTimeout(function () { fin(false); }, 0); } });
      });
    },
    _debug: function () { return { mode: mode, side: !!(V && V.side), caret: caret, anchor: anchor, n: V ? V.n : 0, lh: lh, cw: cw, headH: headH, padT: padT, trackW: trackW, gutW: gutW, stickyH: stickyH, find: { q: find.q, n: find.hits.length, cur: find.cur }, dirty: isDirty(), rendered: rowEls.size, lang: d.lang }; }
  };
  host._pmwEditor = instance;
  return instance;
}

/* ======================================================================================================== */
/* Ctrl+P (PMW.quickOpen), the "+" menu's file search (PMW.fileIndex) and the demo catalog                     */
/* ======================================================================================================== */

function projectPaths() { return Object.keys(FILES).concat(Object.keys(BINARY)); }
function chatPaths() { return Object.keys(CHAT); }
function fuzzy(str, q) {
  // a subsequence match; consecutive letters and letters at word starts score more; -1 when it does not match
  var s = str.toLowerCase(), i = 0, score = 0, last = -2, start = -1, gaps = 0;
  for (var j = 0; j < q.length; j++) {
    var ch = q.charAt(j);
    if (ch === ' ') continue;
    var at = s.indexOf(ch, i);
    if (at < 0) return -1;
    if (start < 0) start = at;
    if (last >= 0 && at !== last + 1) gaps++;
    score += at === last + 1 ? 6 : 1;
    if (at === 0 || /[\/._\-\s\[]/.test(str.charAt(at - 1))) score += 5;
    last = at; i = at + 1;
  }
  if (gaps > Math.max(2, Math.floor(q.length / 2))) return -1;     // letters scattered all over a long path
  return score - start * 0.05 - s.length * 0.01;
}
function rankPaths(paths, q) {
  q = String(q || '').trim().toLowerCase();
  if (!q) return paths.slice();
  var words = q.split(/\s+/);
  var out = [];
  paths.forEach(function (p) {
    var base = basename(p), total = 0, ok = true;
    words.forEach(function (w) {
      if (!ok) return;
      var sb = fuzzy(base, w), sp = fuzzy(p, w);
      if (sb < 0 && sp < 0) { ok = false; return; }
      var sc = Math.max(sb >= 0 ? sb * 2 + 8 : -1, sp);
      if (base.toLowerCase().indexOf(w) === 0) sc += 20;
      else if (p.toLowerCase().indexOf(w) >= 0) sc += 8;
      total += sc;
    });
    if (ok) out.push({ p: p, s: total });
  });
  out.sort(function (a, b) { return b.s - a.s || a.p.length - b.p.length || (a.p < b.p ? -1 : 1); });
  return out.map(function (x) { return x.p; });
}
PMW.fileIndex = function (q, n) {
  var list = rankPaths(projectPaths().concat(chatPaths()), q);
  return list.slice(0, n || 20);
};

PMW.quickOpen = function (panelId, o) {
  o = o || {};
  function openPath(p, newPanel) {
    var spec = { kind: 'editor', path: p, mode: 'keep', where: newPanel ? 'panel' : (panelId || 'auto'), source: panelId };
    if (CHAT[p]) spec.line = CHAT[p].line;
    return PM_HOME.open(spec);
  }
  function row(p, q) {
    var dir = p.indexOf('/') >= 0 ? p.slice(0, p.lastIndexOf('/')) : 'project root';
    var sub = CHAT[p] ? (STATUS_WORD[CHAT[p].status] || 'Changed') + ' in the chat · ' + dir : dir;
    return { id: 'qo:' + p, label: basename(p), sub: sub, kind: 'file', keywords: p + ' ' + (q || ''),
      run: function (info) { openPath(p, !!info.alt || !!o.newPanel); },
      alt: { label: 'Open in new panel', run: function () { openPath(p, true); } } };
  }
  function sections(q) {
    q = String(q || '').trim();
    if (!q) {
      var recent = (PMW.recent ? PMW.recent.list() : []).filter(function (p) { return FILES[p] || BINARY[p] || CHAT[p]; }).slice(0, 5);
      var rest = projectPaths().filter(function (p) { return recent.indexOf(p) < 0; }).sort();
      var secs = [];
      if (recent.length) secs.push({ label: 'Recent', rows: recent.map(function (p) { return row(p); }) });
      secs.push({ label: 'Files', rows: rest.map(function (p) { return row(p); }) });
      secs.push({ label: 'Changed in the chat', rows: chatPaths().map(function (p) { return row(p); }) });
      return secs;
    }
    var proj = rankPaths(projectPaths(), q).slice(0, 30), chat = rankPaths(chatPaths(), q).slice(0, 12);
    var out = [];
    if (proj.length) out.push({ label: 'Files', rows: proj.map(function (p) { return row(p, q); }) });
    if (chat.length) out.push({ label: 'Changed in the chat', rows: chat.map(function (p) { return row(p, q); }) });
    return out;
  }
  var anchor = o.anchor || null, at = null;
  if (!anchor) {
    var panelEl = PMW.render && PMW.render.panelEl && panelId ? PMW.render.panelEl(panelId) : null;
    var box = (panelEl || PMW.state.centre || doc.body).getBoundingClientRect();
    at = { x: Math.round(box.left + Math.max(8, (box.width - 440) / 2)), y: Math.round(box.top + 44) };
    anchor = doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement : null;
  }
  var spec = { id: 'quick-open', title: 'Open a file', meta: keyLabel('Ctrl+P'), search: { placeholder: 'File name or path' }, width: 440,
    sections: sections(''), filter: function (q) { return sections(q); }, empty: 'No file matches. Try fewer letters.',
    foot: 'Enter opens it here · Alt+Enter opens it in a new panel' };
  if (at) spec.at = at;
  return PMW.menu.open(anchor, spec);
};

/* ======================================================================================================== */
/* Registration                                                                                               */
/* ======================================================================================================== */

function setup() {
  CORPUS.forEach(function (f) {
    var lines = [], base = f.d ? [] : null, conflicts = [];
    f.t.split('\n').forEach(function (l) {
      if (!f.d) { lines.push(l); return; }
      var m = l.charAt(0), s = l.slice(1);
      if (m === '-') base.push(s);
      else if (m === '+' || m === '!') { lines.push(s); if (m === '!') conflicts.push(s); }
      else { lines.push(s); base.push(s); }
    });
    FILES[f.p] = { lines: lines, base: base, conflicts: conflicts };
  });
  CHAT_CHANGES.forEach(function (c) { CHAT[c.path] = c; });
  // the Appearance row's mark (D27): a painter's palette in the 16 px stroke grammar
  try { PMW.registerIcon('edPalette', 'M8 2.2a5.8 5.8 0 1 0 0 11.6c1 0 1.4-.7 1.1-1.5-.3-.8.3-1.6 1.1-1.6h1.6a2.2 2.2 0 0 0 2.2-2.2C14 5 11.3 2.2 8 2.2zM5 8.3h.01M6.4 5.3h.01M9.7 5.1h.01', '*'); } catch (_) {}

  PM_HOME.registerKind('editor', {
    label: 'Editor',
    group: 'Files',
    icon: 'file',
    prefixes: ['file:', 'buffer:'],
    min: { w: 280, h: 120 },
    document: true,
    // the label of a tab that is not mounted yet (background, agent-opened or restored); state is read-only
    labelFor: function (id, s) {
      s = s || {};
      if (s.path) return basename(s.path);
      if (String(id).indexOf('file:') === 0) return basename(String(id).slice(5));
      if (s.title) return String(s.title);
      return s.text == null || s.text === '' ? 'Untitled' : 'Text';
    },
    idFor: function (spec) {
      if (spec.path) return 'file:' + spec.path;
      untitledIds += 1;
      return 'buffer:' + Date.now().toString(36) + untitledIds;
    },
    plus: {
      order: 30, label: 'File...', shortcut: 'Ctrl+P', keywords: 'file open editor code',
      pick: function (ctx) { PMW.quickOpen(ctx.panelId, { newPanel: ctx.newPanel, anchor: ctx.anchor }); },
      spec: function () { return { kind: 'editor' }; }
    },
    mount: mountEditor
  });

  var items = [];
  projectPaths().sort().forEach(function (p) {
    items.push({ id: 'file:' + p, label: basename(p), sub: p, icon: 'file', keywords: p, spec: { kind: 'editor', path: p, mode: 'keep' } });
  });
  chatPaths().forEach(function (p) {
    var c = CHAT[p];
    items.push({ id: 'file:' + p, label: basename(p), sub: (STATUS_WORD[c.status] || 'Changed') + ' in the chat · ' + p, icon: 'file',
      keywords: p + ' diff changed', spec: { kind: 'editor', path: p, line: c.line, mode: 'keep' } });
  });
  PM_HOME.catalog.add('editor', items);

  /* re-measure every open editor when a font arrives (JetBrains Mono loads on first use) */
  try {
    if (doc.fonts && doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', function () { EDITORS.forEach(function (v) { v.relayout(); }); });
  } catch (_) {}
  PMW.editorOf = function (tabId) {
    var body = doc.querySelector('.pmw-tabbody[data-pmw-tab="' + String(tabId).replace(/"/g, '\\"') + '"]');
    return body && body._pmwEditor ? body._pmwEditor : null;
  };
}
var untitledIds = 0;

/* ==== CORPUS:START (generated from the research digests; file contents, not Puppet Master copy) ==== */
/* The demo project (Tastebook). d: 1 marks a file written as its change from the last commit: the first character
   of each line is " " unchanged, "+" added, "-" removed (only in the old text), "!" a merge conflict line. */
var CORPUS = [
  { p: 'src/main.rs', d: 1, t: ` //! Tastebook API — service entry point.
 //! Run #47 wires the media router and the import queue channel.
 
 use std::net::SocketAddr;
 use std::sync::Arc;
-use std::time::Duration;
 
 use axum::{Router, routing::get};
 use tower_http::cors::CorsLayer;
 use tower_http::trace::TraceLayer;
 use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
 
 use tastebook_api::{config, db, routes, services};
 
 /// Shared state handed to every router.
 #[derive(Clone)]
 pub struct AppState {
     pub pool: sqlx::PgPool,
+    pub media: Arc<services::image::MediaPipeline>,
+    pub importer: Arc<services::import::ImportQueue>,
 }
 
 #[tokio::main]
 async fn main() {
     tracing_subscriber::registry()
         .with(tracing_subscriber::EnvFilter::new("tastebook=debug,tower_http=info"))
         .with(tracing_subscriber::fmt::layer())
         .init();
 
     let cfg = config::load().expect("TASTEBOOK_* env incomplete");
     let pool = db::connect(&cfg.database_url).await.expect("postgres unreachable");
-    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
+    db::migrate(&pool).await.expect("migrations failed");
 
+    // media pipeline owns the resize ladder + EXIF strip
+    let media = Arc::new(services::image::MediaPipeline::new(cfg.media_root.clone()));
+    // import queue polls its table every 5s; retries live in the worker
+    let importer = Arc::new(services::import::ImportQueue::spawn(pool.clone()));
 
-    let state = AppState { pool };
+    let state = AppState { pool, media, importer };
 
     let app = Router::new()
         .merge(routes::recipes::router())
         .merge(routes::auth::router())
+        .merge(routes::media::router())      // new in v1.2
         .route("/healthz", get(healthz))
-        .layer(CorsLayer::very_permissive())
+        .layer(CorsLayer::permissive())
         .layer(TraceLayer::new_for_http())
         .with_state(state);
 
     let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
     tracing::info!(%addr, "tastebook-api listening");
     let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
-    axum::serve(listener, app.into_make_service())
+    axum::serve(listener, app)
+        .with_graceful_shutdown(shutdown_signal())
         .await
         .unwrap();
 }
 
 async fn healthz() -> &'static str {
     "ok"
 }
 
 /// SIGTERM from compose gets a 20s drain window before the socket closes.
 async fn shutdown_signal() {
     let ctrl_c = async {
         tokio::signal::ctrl_c().await.expect("ctrl_c handler");
     };
     #[cfg(unix)]
     let term = async {
         tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
             .expect("sigterm handler")
             .recv()
             .await;
     };
     tokio::select! {
         _ = ctrl_c => {},
         _ = term => {},
     }
     tracing::info!("shutdown requested — draining connections");
 }
 
 #[cfg(test)]
 mod tests {
     use super::*;
 
     #[tokio::test]
     async fn healthz_returns_ok() {
         assert_eq!(healthz().await, "ok");
     }
 }` },
  { p: 'src/routes/recipes.rs', d: 1, t: ` use axum::extract::{Path, Query, State};
 use axum::{Json, Router, routing::{get, post}};
 use serde::{Deserialize, Serialize};
-use sqlx::PgPool;
 
 use crate::AppState;
 use crate::models::{Recipe, NewRecipe, RecipeSummary};
+use crate::services::image::MediaPipeline;
 
 pub fn router() -> Router<AppState> {
     Router::new()
         .route("/api/recipes", get(list).post(create))
+        .route("/api/recipes/search", get(search))
-        .route("/api/recipes/:id", get(show).put(update).delete(destroy))
+        .route("/api/recipes/:id", get(show).put(update).delete(archive))
+        .route("/api/recipes/:id/photos", post(attach_photo))
 }
 
 #[derive(Deserialize)]
 pub struct PageParams {
     // keyset cursor — updated_at of the last card on the previous page
     pub after: Option<String>,
     pub limit: Option<i64>,
 }
 
 // GET /api/recipes — 24 cards per page, newest first.
 async fn list(State(st): State<AppState>, Query(p): Query<PageParams>) -> Json<Vec<RecipeSummary>> {
-    let limit = p.limit.unwrap_or(20).min(100);
+    let limit = p.limit.unwrap_or(24).clamp(1, 48);
     let rows = sqlx::query_as!(
         RecipeSummary,
         "SELECT id, title, hero_thumb, stars, cook_minutes
            FROM recipes
           WHERE archived_at IS NULL
             AND updated_at < COALESCE($1, now())
           ORDER BY updated_at DESC LIMIT $2",
         p.after, limit
     )
     .fetch_all(&st.pool)
     .await
     .unwrap_or_default();
     Json(rows)
 }
 
+// GET /api/recipes/search?q= — full-text over title + ingredients.
+async fn search(State(st): State<AppState>, Query(p): Query<SearchParams>) -> Json<Vec<RecipeSummary>> {
     let rows = sqlx::query_as!(
         RecipeSummary,
         "SELECT id, title, hero_thumb, stars, cook_minutes
            FROM recipes
           WHERE fts @@ websearch_to_tsquery('english', $1)
           ORDER BY ts_rank(fts, websearch_to_tsquery('english', $1)) DESC
           LIMIT 24",
         p.q
     )
     .fetch_all(&st.pool)
     .await
     .unwrap_or_default();
     Json(rows)
 }
 
 async fn show(State(st): State<AppState>, Path(id): Path<i64>) -> Result<Json<Recipe>, ApiError> {
     let recipe = sqlx::query_as!(Recipe, "SELECT * FROM recipes WHERE id = $1", id)
         .fetch_optional(&st.pool)
         .await?
         .ok_or(ApiError::NotFound)?;
     Ok(Json(recipe))
 }
 
 async fn create(State(st): State<AppState>, Json(body): Json<NewRecipe>) -> Result<Json<Recipe>, ApiError> {
     body.validate()?;
     let recipe = sqlx::query_as!(
         Recipe,
         "INSERT INTO recipes (title, author_id, body) VALUES ($1, $2, $3) RETURNING *",
         body.title, body.author_id, body.body
     )
     .fetch_one(&st.pool)
     .await?;
+    notify::fan_out(&st.pool, recipe.id).await;   // followers hear about new dishes
     Ok(Json(recipe))
 }
 
 async fn update(State(st): State<AppState>, Path(id): Path<i64>, Json(body): Json<NewRecipe>) -> Result<Json<Recipe>, ApiError> {
     body.validate()?;
     let recipe = sqlx::query_as!(
         Recipe,
         "UPDATE recipes SET title = $2, body = $3, updated_at = now() WHERE id = $1 RETURNING *",
         id, body.title, body.body
     )
     .fetch_one(&st.pool)
     .await?;
     Ok(Json(recipe))
 }
 
-// hard delete — the card and every link to it are gone at once
+// soft delete — cards drop out of list() but stay linkable for 30 days
 async fn archive(State(st): State<AppState>, Path(id): Path<i64>) -> Result<StatusCode, ApiError> {
     sqlx::query!("UPDATE recipes SET archived_at = now() WHERE id = $1", id)
         .execute(&st.pool)
         .await?;
     Ok(StatusCode::NO_CONTENT)
 }
 
+// POST /api/recipes/:id/photos — multipart upload, renditions run async.
+async fn attach_photo(State(st): State<AppState>, Path(id): Path<i64>, mut parts: Multipart) -> Result<Json<PhotoReceipt>, ApiError> {
     let field = parts.next_field().await?.ok_or(ApiError::EmptyUpload)?;
     let raw = field.bytes().await?;
+    if raw.len() > 12 * 1024 * 1024 {
         return Err(ApiError::PayloadTooLarge);
     }
+    let receipt = st.media.enqueue(id, raw.to_vec()).await?;
     Ok(Json(receipt))
 }` },
  { p: 'src/routes/auth.rs', d: 1, t: ` use axum::extract::{Path, Query, State};
 use axum::http::StatusCode;
 use axum::{Json, Router, routing::{get, post}};
 use time::{Duration, OffsetDateTime};
 
 use crate::AppState;
 use crate::models::{Account, Session};
 
 pub fn router() -> Router<AppState> {
     Router::new()
         .route("/api/auth/login", post(login))
         .route("/api/auth/logout", post(logout))
-        .route("/api/auth/oauth/google", get(oauth_start))
+        .route("/api/auth/oauth/:provider", get(oauth_start))
+        .route("/api/auth/oauth/:provider/callback", get(oauth_callback))
+        .route("/api/auth/me", get(whoami))
 }
 
 #[derive(serde::Deserialize)]
 pub struct LoginReq {
     pub email: String,
     pub password: String,
 }
 
-// Session cookies were 7-day fixed expiry before v1.2.
+// Now: HttpOnly + SameSite=Lax, 30-day sliding expiry; Argon2id hashes.
 async fn login(State(st): State<AppState>, Json(body): Json<LoginReq>) -> Result<Json<Session>, AuthError> {
     let account = Account::by_email(&st.pool, &body.email)
         .await?
         .ok_or(AuthError::BadCredentials)?;
     verify_password(&account.password_hash, &body.password)?;
     let session = Session::issue(&st.pool, account.id, Duration::days(30)).await?;
     Ok(Json(session))
 }
 
 async fn logout(State(st): State<AppState>, session: Session) -> StatusCode {
     let _ = session.revoke(&st.pool).await;
     StatusCode::NO_CONTENT
 }
 
+// OAuth: Google + GitHub. The state parameter is a signed nonce, 10 minute TTL.
+async fn oauth_start(Path(provider): Path<String>, State(st): State<AppState>) -> Result<Redirect, AuthError> {
+    let client = st.oauth.client(&provider).ok_or(AuthError::UnknownProvider)?;
+    let (url, nonce) = client.authorize_url();
+    st.oauth.remember_nonce(nonce).await;
+    Ok(Redirect::temporary(url.as_str()))
 }
 
 async fn oauth_callback(
     Path(provider): Path<String>,
     Query(cb): Query<CallbackParams>,
     State(st): State<AppState>,
 ) -> Result<Redirect, AuthError> {
+    st.oauth.check_nonce(&cb.state).await?;
     let token = st.oauth.client(&provider).unwrap().exchange(cb.code).await?;
     let profile = token.fetch_profile().await?;
     let account = Account::upsert_oauth(&st.pool, &provider, &profile).await?;
     Session::issue(&st.pool, account.id, Duration::days(30)).await?;
     Ok(Redirect::temporary("/"))
 }
 
 async fn whoami(session: Option<Session>) -> Json<Option<Account>> {
     match session {
         Some(s) => Json(Some(s.account)),
         None => Json(None),
     }
 }
 
 fn verify_password(hash: &str, candidate: &str) -> Result<(), AuthError> {
     use argon2::{Argon2, PasswordHash, PasswordVerifier};
     let parsed = PasswordHash::new(hash).map_err(|_| AuthError::BadCredentials)?;
     Argon2::default()
         .verify_password(candidate.as_bytes(), &parsed)
         .map_err(|_| AuthError::BadCredentials)
 }
 
 #[derive(Debug, thiserror::Error)]
 pub enum AuthError {
     #[error("bad credentials")]
     BadCredentials,
+    #[error("unknown oauth provider")]
+    UnknownProvider,
     #[error("oauth state mismatch")]
     StateMismatch,
     #[error(transparent)]
     Db(#[from] sqlx::Error),
 }
 
 #[cfg(test)]
 mod tests {
     use super::*;
 
     #[test]
     fn verify_rejects_wrong_password() {
         let hash = seed_hash("correct horse");
         assert!(verify_password(&hash, "wrong pony").is_err());
     }
 }` },
  { p: 'src/services/image.rs', d: 1, t: `+//! image-processing package — resize ladder, EXIF strip, content-hash naming.
+//! Publishing this package is the gate at node n-13.
 
 use std::path::{Path, PathBuf};
-use std::sync::mpsc;
+use tokio::sync::mpsc;
 
 use image::{DynamicImage, ImageFormat, imageops::FilterType};
 use sha2::{Digest, Sha256};
 
 /// Rendition widths, small → hero. Heights follow aspect.
 pub const SIZES: [u32; 3] = [320, 800, 1600];
+/// WebP quality — 82 keeps plate texture without ballooning bytes.
+pub const WEBP_QUALITY: f32 = 82.0;
 
 pub struct MediaPipeline {
     root: PathBuf,
     tx: mpsc::Sender<Job>,
 }
 
 pub struct Rendition {
     pub width: u32,
     pub path: PathBuf,
     pub bytes: u64,
 }
 
 impl MediaPipeline {
     pub fn new(root: PathBuf) -> Self {
-        let (tx, rx) = mpsc::channel();
+        let (tx, rx) = mpsc::channel(64);
         tokio::spawn(worker(rx));
         MediaPipeline { root, tx }
     }
 
+    /// Queue a raw upload; renditions land async, the receipt returns at once.
+    pub async fn enqueue(&self, recipe_id: i64, raw: Vec<u8>) -> Result<PhotoReceipt, ImgError> {
+        let key = content_key(&raw);
+        self.tx.send(Job { recipe_id, key: key.clone(), raw }).await?;
         Ok(PhotoReceipt { key, status: "queued" })
     }
 }
 
 async fn worker(mut rx: mpsc::Receiver<Job>) {
     while let Some(job) = rx.recv().await {
         if let Err(e) = process_upload(&job).await {
             tracing::warn!(key = %job.key, "rendition failed: {e}");
         }
     }
 }
 
 pub async fn process_upload(job: &Job) -> Result<Vec<Rendition>, ImgError> {
     let img = image::load_from_memory(&job.raw)?;
     let img = strip_exif(img);
     let mut out = Vec::with_capacity(SIZES.len());
     for w in SIZES {
         out.push(rendition(&img, w, &job.key)?);
     }
     Ok(out)
 }
 
 /// Orientation is normalized, then every other EXIF byte is dropped —
 /// kitchen GPS tags have no business on a public CDN.
 fn strip_exif(img: DynamicImage) -> DynamicImage {
     // re-encode through a raster buffer; metadata does not survive the trip
     DynamicImage::ImageRgba8(img.to_rgba8())
 }
 
 fn rendition(img: &DynamicImage, w: u32, key: &str) -> Result<Rendition, ImgError> {
     // Lanczos3 keeps herbs looking like herbs, not soup
     let scaled = img.resize(w, w * 2, FilterType::Lanczos3);
     let path = rendition_path(key, w);
     let mut buf = Vec::new();
-    scaled.write_to(&mut Cursor::new(&mut buf), ImageFormat::Jpeg)?;
+    scaled.write_to(&mut Cursor::new(&mut buf), ImageFormat::WebP)?;
     std::fs::write(&path, &buf)?;
     Ok(Rendition { width: w, path, bytes: buf.len() as u64 })
 }
 
 /// media/ab/cd/abcd…-320.webp — two-level fanout keeps ls usable.
 fn rendition_path(key: &str, w: u32) -> PathBuf {
-    PathBuf::from(format!("media/{key}-{w}.jpg"))
+    PathBuf::from(format!("media/{}/{}/{key}-{w}.webp", &key[..2], &key[2..4]))
 }
 
 fn content_key(raw: &[u8]) -> String {
     let mut h = Sha256::new();
     h.update(raw);
     hex::encode(&h.finalize()[..12])
 }
 
 #[derive(Debug, thiserror::Error)]
 pub enum ImgError {
     #[error("unreadable image")]
     Decode(#[from] image::ImageError),
+    #[error("queue closed")]
+    Queue(#[from] mpsc::error::SendError<Job>),
     #[error(transparent)]
     Io(#[from] std::io::Error),
 }
 
 #[cfg(test)]
 mod tests {
     use super::*;
 
     #[test]
     fn ladder_is_ordered() {
         assert!(SIZES.windows(2).all(|p| p[0] < p[1]));
     }
 
     #[test]
     fn content_key_is_stable() {
         assert_eq!(content_key(b"carbonara"), content_key(b"carbonara"));
     }
 }` },
  { p: 'src/services/import.rs', d: 1, t: ` //! import-from-url worker — schema.org Recipe extraction (test target n-19).
 //! Run #47 hardens retries and fixes the mixed-fraction regression.
 
 use scraper::{Html, Selector};
 use serde_json::Value;
 use std::time::Duration;
 
 pub struct ImportQueue {
     pool: sqlx::PgPool,
 }
 
 impl ImportQueue {
     /// Poll import_jobs every 5s; one in-flight fetch per host.
     pub fn spawn(pool: sqlx::PgPool) -> Self {
         let q = ImportQueue { pool: pool.clone() };
         tokio::spawn(poll_loop(pool));
         q
     }
 }
 
 async fn poll_loop(pool: sqlx::PgPool) {
     loop {
         if let Some(job) = next_job(&pool).await {
             match import_url(&job.url).await {
                 Ok(draft) => save_draft(&pool, job.id, draft).await,
                 Err(e) => mark_failed(&pool, job.id, e).await,
             }
         }
         tokio::time::sleep(Duration::from_secs(5)).await;
     }
 }
 
 pub async fn import_url(url: &str) -> Result<DraftRecipe, ImportError> {
-    let body = reqwest::get(url).await?.text().await?;
+    let body = fetch_with_retries(url, 3).await?;
     let doc = Html::parse_document(&body);
     let ld = json_ld_recipe(&doc).ok_or(ImportError::NoRecipe)?;
     // sanitize: strip scripts, clamp step count, normalize units
     Ok(DraftRecipe::from_json_ld(sanitize(ld))?)
 }
 
+/// Backoff: 1s → 4s → 9s. A 429 also honors Retry-After when present.
 async fn fetch_with_retries(url: &str, max: u32) -> Result<String, ImportError> {
     let mut attempt = 0;
     loop {
         attempt += 1;
         match fetch_once(url).await {
             Ok(body) => return Ok(body),
-            Err(e) if attempt == max => return Err(e),
+            Err(e) if attempt >= max => return Err(e),
+            Err(ImportError::RateLimited(after)) => {
+                tokio::time::sleep(after.unwrap_or(Duration::from_secs(4))).await;
+            }
             Err(_) => {
-                tokio::time::sleep(Duration::from_secs(4)).await;
+                tokio::time::sleep(Duration::from_secs((attempt * attempt) as u64)).await;
             }
         }
     }
 }
 
 fn json_ld_recipe(doc: &Html) -> Option<Value> {
     let sel = Selector::parse("script[type=\\"application/ld+json\\"]").ok()?;
     doc.select(&sel)
         .filter_map(|n| serde_json::from_str::<Value>(&n.inner_html()).ok())
         .flat_map(flatten_graph)
         .find(|v| v["@type"] == "Recipe")
 }
 
 /// Some blogs wrap the recipe in an @graph array; unwrap one level.
 fn flatten_graph(v: Value) -> Vec<Value> {
     match v["@graph"].as_array() {
         Some(items) => items.clone(),
         None => vec![v],
     }
 }
 
 fn sanitize(mut ld: Value) -> Value {
+    ld["recipeInstructions"] = clamp_steps(ld["recipeInstructions"].take(), 40);
+    ld["description"] = strip_markup(ld["description"].take());
     ld
 }
 
 // KNOWN FLAKE (run #47, n-19): "1 1/2 cup" parsed as 11/2 before the fix.
 pub fn normalize_units(s: &str) -> Quantity {
     parse_mixed_fraction(s)
 }
 
 fn parse_mixed_fraction(s: &str) -> Quantity {
-    // split on '/' first, then read the whole number
-    let re = regex!(r"^(\\d+)/(\\d+)\\s*(.*)$");
!    // whole + fraction must be separated: (\\d+)\\s+(\\d+)/(\\d+)
+    let re = regex!(r"^(\\d+)(?:\\s+(\\d+)/(\\d+))?\\s*(.*)$");
     let caps = re.captures(s.trim()).unwrap_or_default();
     let whole: f32 = caps.get(1).map_or(0.0, |m| m.as_str().parse().unwrap_or(0.0));
+    let frac = match (caps.get(2), caps.get(3)) {
         (Some(n), Some(d)) => n.as_str().parse::<f32>().unwrap_or(0.0) / d.as_str().parse::<f32>().unwrap_or(1.0),
         _ => 0.0,
     };
     Quantity::new(whole + frac, unit_of(caps.get(4)))
 }
 
 #[cfg(test)]
 mod tests {
     use super::*;
 
     #[test]
+    fn mixed_fraction_regression_47() {
+        assert_eq!(normalize_units("1 1/2 cup"), Quantity::new(1.5, Unit::Cup));
     }
 
     #[test]
     fn simple_units_still_parse() {
         assert_eq!(normalize_units("2 tbsp"), Quantity::new(2.0, Unit::Tbsp));
     }
 }` },
  { p: 'src/services/import/normalize_units/mixed_fractions.rs', d: 1, t: `+//! Mixed-fraction parsing — "1 1/2 cups" and the vulgar-fraction forms.
+//! New in run #47: the n-19 flake was this module returning 11/2.
+
 use std::str::FromStr;
 
 /// U+00BD and friends, expanded before the ASCII pass.
 const VULGAR: &[(char, f64)] = &[
     ('\\u{00bd}', 0.5), ('\\u{2153}', 0.333_333_3), ('\\u{2154}', 0.666_666_7),
+    ('\\u{00bc}', 0.25), ('\\u{00be}', 0.75), ('\\u{215b}', 0.125),
+];
+
+pub fn parse(raw: &str) -> Option<f64> {
+    let s = raw.trim();
+    if s.is_empty() { return None; }
+
+    // A space between whole and fraction is the mixed form: "1 1/2".
+    // Splitting on '/' first is what produced 11/2 = 5.5.
+    if let Some((whole, frac)) = s.split_once(' ') {
+        let w = f64::from_str(whole).ok()?;
+        return Some(w + parse_simple(frac)?);
+    }
     parse_simple(s)
 }
 
 fn parse_simple(s: &str) -> Option<f64> {
     if let Some(&(_, v)) = VULGAR.iter().find(|(c, _)| s.starts_with(*c)) {
         return Some(v);
     }
     match s.split_once('/') {
         Some((n, d)) => {
             let d = f64::from_str(d).ok()?;
             if d == 0.0 { return None; }
             Some(f64::from_str(n).ok()? / d)
         }
         None => f64::from_str(s).ok(),
     }
 }
 
 #[cfg(test)]
 mod tests {
     use super::*;
 
     #[test]
     fn mixed_is_not_concatenated() {
         assert_eq!(parse("1 1/2"), Some(1.5));
         assert_eq!(parse("2 3/4"), Some(2.75));
     }
 
     #[test]
     fn vulgar_forms() {
         assert_eq!(parse("\\u{00bd}"), Some(0.5));
     }
 }` },
  { p: 'src/services/import/normalize_units/units_table.rs', t: `//! Unit aliases and their canonical metric conversion.
//! Everything downstream stores grams or millilitres.

use std::collections::HashMap;
use std::sync::OnceLock;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Measure { Mass, Volume, Count }

#[derive(Debug, Clone, Copy)]
pub struct Unit {
    pub canonical: &'static str,
    pub measure: Measure,
    pub factor: f64,
}

/// Aliases are matched lowercase, trailing "s" stripped.
const TABLE: &[(&str, Unit)] = &[
    ("cup",        Unit { canonical: "ml", measure: Measure::Volume, factor: 236.588 }),
    ("tbsp",       Unit { canonical: "ml", measure: Measure::Volume, factor: 14.787 }),
    ("tablespoon", Unit { canonical: "ml", measure: Measure::Volume, factor: 14.787 }),
    ("tsp",        Unit { canonical: "ml", measure: Measure::Volume, factor: 4.929 }),
    ("teaspoon",   Unit { canonical: "ml", measure: Measure::Volume, factor: 4.929 }),
    ("fl oz",      Unit { canonical: "ml", measure: Measure::Volume, factor: 29.574 }),
    ("oz",         Unit { canonical: "g",  measure: Measure::Mass,   factor: 28.350 }),
    ("lb",         Unit { canonical: "g",  measure: Measure::Mass,   factor: 453.592 }),
    ("g",          Unit { canonical: "g",  measure: Measure::Mass,   factor: 1.0 }),
    ("kg",         Unit { canonical: "g",  measure: Measure::Mass,   factor: 1000.0 }),
    ("clove",      Unit { canonical: "ct", measure: Measure::Count,  factor: 1.0 }),
];

fn index() -> &'static HashMap<&'static str, Unit> {
    static IDX: OnceLock<HashMap<&str, Unit>> = OnceLock::new();
    IDX.get_or_init(|| TABLE.iter().copied().collect())
}

pub fn lookup(raw: &str) -> Option<Unit> {
    let key = raw.trim().to_lowercase();
    let key = key.strip_suffix('s').unwrap_or(&key);
    index().get(key).copied()
}` },
  { p: 'src/models/recipe.rs', d: 1, t: ` //! Recipe aggregate — the row shape the API and the importer share.
 
 use chrono::{DateTime, Utc};
 use serde::{Deserialize, Serialize};
 use sqlx::FromRow;
 
 #[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
 pub struct Recipe {
     pub id: i64,
     pub title: String,
     pub minutes: i32,
     pub rating: f32,
+    pub source_url: Option<String>,
+    pub hero_rendition: Option<String>,
+    pub created_at: DateTime<Utc>,
 }
 
 #[derive(Debug, Deserialize)]
 pub struct NewRecipe {
     pub title: String,
     pub ingredients: Vec<String>,
     pub steps: Vec<String>,
 }
 
 impl Recipe {
     /// Renditions are addressed by content hash, never by upload name.
     pub fn hero_url(&self) -> Option<String> {
-        self.hero_rendition.as_ref().map(|h| format!("/media/{}.jpg", h))
+        self.hero_rendition.as_ref().map(|h| format!("/media/{}/1200.webp", h))
     }
 }` },
  { p: 'migrations/0001_init.sql', d: 1, t: ` -- 0001_init: full Tastebook schema as of v1.2 (squashed for the demo tree).
 -- Ordering: accounts → sessions → recipes → steps → media → import queue.
 
 CREATE TABLE accounts (
   id             BIGSERIAL PRIMARY KEY,
   email          TEXT NOT NULL UNIQUE,
   display_name   TEXT NOT NULL,
   password_hash  TEXT,                 -- NULL for oauth-only accounts
+  oauth_provider TEXT,
+  oauth_subject  TEXT,
   created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
 );
 
 CREATE TABLE sessions (
   token       TEXT PRIMARY KEY,
   account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
   expires_at  TIMESTAMPTZ NOT NULL,
-  -- fixed 7-day expiry from login
+  -- sliding expiry: touched on every authenticated request
   touched_at  TIMESTAMPTZ NOT NULL DEFAULT now()
 );
 
 CREATE TABLE recipes (
   id           BIGSERIAL PRIMARY KEY,
   title        TEXT NOT NULL,
   author_id    BIGINT REFERENCES accounts(id),
   body         JSONB NOT NULL,
+  hero_thumb   TEXT,
   stars        NUMERIC(2,1) DEFAULT 0,
   cook_minutes INT,
+  archived_at  TIMESTAMPTZ,
   updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
-  search_doc   TSVECTOR GENERATED ALWAYS AS (
+  fts          TSVECTOR GENERATED ALWAYS AS (
                  to_tsvector('english', title || ' ' || coalesce(body->>'ingredients', ''))
                ) STORED
 );
 
 CREATE TABLE recipe_steps (
   recipe_id  BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
   position   INT NOT NULL,
   text       TEXT NOT NULL,
+  photo_key  TEXT,                 -- content hash into media
   PRIMARY KEY (recipe_id, position)
 );
 
+-- media: one row per original upload; renditions fan out below.
+CREATE TABLE media (
   key          TEXT PRIMARY KEY,
   recipe_id    BIGINT REFERENCES recipes(id) ON DELETE SET NULL,
   uploaded_by  BIGINT REFERENCES accounts(id),
   bytes        BIGINT NOT NULL,
   created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
 );
 
+CREATE TABLE media_renditions (
   key    TEXT NOT NULL REFERENCES media(key) ON DELETE CASCADE,
   width  INT NOT NULL,
   path   TEXT NOT NULL,
   bytes  BIGINT NOT NULL,
   PRIMARY KEY (key, width)
 );
 
 -- import queue: worker polls every 5s, one in-flight fetch per host.
 CREATE TABLE import_jobs (
   id            BIGSERIAL PRIMARY KEY,
   url           TEXT NOT NULL,
   requested_by  BIGINT REFERENCES accounts(id),
   status        TEXT NOT NULL DEFAULT 'queued',   -- queued | fetching | done | failed
-  attempts      SMALLINT NOT NULL DEFAULT 0,
+  attempts      INT NOT NULL DEFAULT 0,
   last_error    TEXT,
   created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
 );
 
--- ratings table moved to 0002 so seed data can land first
 
 CREATE INDEX recipes_fts      ON recipes USING GIN (fts);
+CREATE INDEX recipes_updated  ON recipes (updated_at DESC) WHERE archived_at IS NULL;
 CREATE INDEX media_by_recipe  ON media (recipe_id);
 CREATE INDEX import_jobs_todo ON import_jobs (status) WHERE status = 'queued';
 
 -- keep updated_at honest on every write
 CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
 BEGIN
   NEW.updated_at := now();
   RETURN NEW;
 END;
 $$ LANGUAGE plpgsql;
 
 CREATE TRIGGER recipes_touch
   BEFORE UPDATE ON recipes
   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();` },
  { p: 'migrations/0002_ratings.sql', t: `-- 0002_ratings: one rating per account per recipe
CREATE TABLE ratings (
  recipe_id  BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  account_id BIGINT REFERENCES accounts(id),
  stars      SMALLINT CHECK (stars BETWEEN 1 AND 5),
  PRIMARY KEY (recipe_id, account_id)
);` },
  { p: 'web/src/routes/+page.svelte', d: 1, t: ` <script>
   import RecipeCard from '$lib/RecipeCard.svelte';
+  import SearchBar from '$lib/SearchBar.svelte';
   import { navigating } from '$app/stores';
   export let data; // +page.server.js load()
 
+  let query = '';
+  let activeTag = null;
   const tags = ['weeknight', 'bread', 'grill', 'dessert', 'batch-cook'];
 
   $: visible = data.recipes
     .filter((r) => !activeTag || r.tags.includes(activeTag))
-    .filter((r) => !query || r.title.includes(query));
+    .filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()));
 
   async function loadMore() {
     const last = data.recipes.at(-1);
-    const res = await fetch(\`/api/recipes?page=\${page + 1}\`);
+    const res = await fetch(\`/api/recipes?after=\${last.updatedAt}\`);
     data.recipes = [...data.recipes, ...(await res.json())];
   }
 </script>
 
 <svelte:head>
   <title>Tastebook — fresh this week</title>
 </svelte:head>
 
 <header class="hero">
   <h1>Fresh this week</h1>
-  <p>{data.recipes.length} recipes from people who actually cook.</p>
+  <SearchBar bind:value={query} placeholder="Search titles…" />
 </header>
 
 <nav class="tags">
   {#each tags as t}
     <button
       class:active={activeTag === t}
       on:click={() => (activeTag = activeTag === t ? null : t)}
     >
       {t}
     </button>
   {/each}
 </nav>
 
+{#if $navigating}
+  <div class="skeleton-grid" aria-hidden="true">
     {#each Array(8) as _}
       <div class="skeleton-card" />
     {/each}
   </div>
 {:else if visible.length === 0}
+  <p class="empty">Nothing matches — clear the search or try another tag.</p>
 {:else}
   <div class="grid">
     {#each visible as r (r.id)}
       <RecipeCard recipe={r} />
     {/each}
   </div>
-  <button class="more" on:click={loadMore}>More</button>
+  <button class="more" on:click={loadMore}>Load more</button>
 {/if}
 
 <style>
   .grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
     gap: 1rem;
   }
   .tags {
     display: flex;
     gap: 0.5rem;
     flex-wrap: wrap;
     margin: 1rem 0;
   }
   .tags button.active {
     background: #e0532f;
     color: white;
   }
+  .skeleton-card {
     height: 220px;
     border-radius: 12px;
     animation: pulse 1.2s ease-in-out infinite alternate;
   }
   .empty {
     padding: 4rem 0;
     text-align: center;
     opacity: 0.7;
   }
   .more {
     margin: 2rem auto;
     display: block;
   }
 </style>` },
  { p: 'web/src/routes/recipe/[id]/+page.svelte', t: `<script>
  export let data;
  $: recipe = data.recipe;
</script>

<article>
  <img srcset={recipe.renditions} alt={recipe.title} />
  <h1>{recipe.title}</h1>
  <Ratings stars={recipe.stars} />
  <Steps steps={recipe.body.steps} />
</article>` },
  { p: 'web/src/lib/RecipeCard.svelte', t: `<script>
  export let recipe;
</script>

<a class="card" href="/recipe/{recipe.id}">
  <img src={recipe.thumb} alt="" loading="lazy" />
  <h3>{recipe.title}</h3>
  <span>{recipe.stars}/5 · {recipe.cookMinutes} min</span>
</a>` },
  { p: 'web/src/lib/Editor.svelte', d: 1, t: ` <!-- step-by-step editor: drag photos onto a step to attach -->
 <script>
   import { upload } from '$lib/upload';
   import { createEventDispatcher, onDestroy } from 'svelte';
 
   export let recipe = { title: '', steps: [{ text: '', photo: null }] };
-  const dispatch = createEventDispatcher();
 
   let saving = false;
   let savedAt = null;
   let timer = null;
 
+  // autosave: 1.2s after the last keystroke, never while a photo uploads
   function queueSave() {
     clearTimeout(timer);
-    timer = setTimeout(save, 3000);
+    timer = setTimeout(save, 1200);
   }
 
   async function save() {
     if (saving) return queueSave();
     saving = true;
     try {
       await fetch(\`/api/recipes/\${recipe.id}\`, {
         method: 'PUT',
         headers: { 'content-type': 'application/json' },
         body: JSON.stringify(recipe)
       });
       savedAt = new Date();
     } finally {
       saving = false;
     }
   }
 
   function addStep(after) {
     recipe.steps.splice(after + 1, 0, { text: '', photo: null });
     recipe.steps = recipe.steps;
     queueSave();
   }
 
   function removeStep(i) {
     recipe.steps.splice(i, 1);
     recipe.steps = recipe.steps;
     queueSave();
   }
 
+  // hits /api/recipes/:id/photos; renditions land async
+  async function onDrop(step, event) {
+    const file = event.dataTransfer?.files?.[0];
+    if (!file || !file.type.startsWith('image/')) return;
+    step.photo = { status: 'uploading' };
     recipe.steps = recipe.steps;
-    step.photo = await upload(file);
+    step.photo = await upload(recipe.id, file);
     recipe.steps = recipe.steps;
     queueSave();
   }
 
   onDestroy(() => clearTimeout(timer));
 </script>
 
 <section class="editor">
   <input class="title" bind:value={recipe.title} on:input={queueSave} placeholder="Name this dish…" />
 
   <ol>
     {#each recipe.steps as step, i}
       <li
+        on:dragover|preventDefault
+        on:drop|preventDefault={(e) => onDrop(step, e)}
       >
         <textarea
           rows="2"
           bind:value={step.text}
           on:input={queueSave}
           placeholder="Step {i + 1} — what happens here?"
         />
         {#if step.photo?.status === 'uploading'}
+          <span class="chip">uploading…</span>
         {:else if step.photo}
-          <img src={step.photo.url} alt="" />
+          <img src={step.photo.thumb} alt="" />
         {/if}
         <button class="ghost" on:click={() => addStep(i)}>+ step</button>
         <button class="ghost" on:click={() => removeStep(i)} disabled={recipe.steps.length === 1}>remove</button>
       </li>
     {/each}
   </ol>
 
   <footer>
+    {#if saving}Saving…{:else if savedAt}Saved {savedAt.toLocaleTimeString()}{/if}
   </footer>
 </section>
 
 <style>
   li { border: 1px dashed transparent; border-radius: 8px; padding: 0.75rem; }
+  li:has(.chip) { border-color: #e0532f; }
   img { max-width: 160px; border-radius: 8px; }
   .ghost { opacity: 0.6; }
   .title { font-size: 1.4rem; font-weight: 600; width: 100%; }
 </style>` },
  { p: 'docker-compose.yml', d: 1, t: ` # Tastebook stack — compose file shared by dev and the Unraid template.
 # docker compose up → web on :5173, API on :8080.
 
 name: tastebook
 
 services:
   db:
     image: postgres:16-alpine
     restart: unless-stopped
     environment:
       POSTGRES_DB: tastebook
       POSTGRES_USER: tastebook
       POSTGRES_PASSWORD_FILE: /run/secrets/pg_password
     volumes:
       - pgdata:/var/lib/postgresql/data
     healthcheck:
       test: ["CMD-SHELL", "pg_isready -U tastebook"]
       interval: 5s
       timeout: 3s
       retries: 10
 
   cache:
     image: redis:7-alpine
     restart: unless-stopped
-    command: redis-server --maxmemory 64mb
+    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
 
   api:
-    image: jared/tastebook:v1.1
+    image: jared/tastebook:v1.2
     restart: unless-stopped
     depends_on:
       db:
         condition: service_healthy
       cache:
         condition: service_started
     environment:
       TASTEBOOK_DATABASE_URL: postgres://tastebook@db/tastebook
+      TASTEBOOK_MEDIA_ROOT: /data/media
       TASTEBOOK_CACHE_URL: redis://cache:6379
       RUST_LOG: tastebook=info,tower_http=warn
     volumes:
+      - media:/data/media
     ports:
       - "8080:8080"
 
   web:
     image: jared/tastebook-web:v1.2
     restart: unless-stopped
     depends_on: [api]
     environment:
       PUBLIC_API_BASE: http://api:8080
     ports:
       - "5173:5173"
-      - "3000:3000"        # legacy dev port
 
+  worker:
+    image: jared/tastebook-worker:v1.2
     restart: unless-stopped
+    command: import-worker --poll 5s
     depends_on:
       db:
         condition: service_healthy
     environment:
       TASTEBOOK_DATABASE_URL: postgres://tastebook@db/tastebook
+      IMPORT_MAX_RETRIES: "3"
     deploy:
       resources:
         limits:
           memory: 256M
 
   backup:
     image: offen/docker-volume-backup:v2
     restart: unless-stopped
     environment:
       BACKUP_CRON_EXPRESSION: "0 4 * * *"
-      # nightly sync to S3 cold storage
+      # nightly sync to Cloudflare R2 per the storage decision
       AWS_ENDPOINT: https://ACCOUNT_ID.r2.cloudflarestorage.com
     volumes:
       - pgdata:/backup/pgdata:ro
+      - media:/backup/media:ro
 
 volumes:
   pgdata:
+  media:
 
 secrets:
   pg_password:
     file: ./secrets/pg_password.txt` },
  { p: 'Dockerfile', t: `FROM rust:1.83-alpine AS build
WORKDIR /app
COPY . .
RUN cargo build --release --locked

FROM alpine:3.20
# multi-arch: linux/amd64 + linux/arm64 via buildx
COPY --from=build /app/target/release/tastebook-api /usr/local/bin/
EXPOSE 8080
CMD ["tastebook-api"]` },
  { p: 'Cargo.toml', t: `# Tastebook API workspace
[package]
name = "tastebook-api"
version = "1.2.0"
edition = "2021"

[dependencies]
axum = "0.8"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.8", features = ["postgres", "runtime-tokio"] }
image = "0.25"   # image-processing package
scraper = "0.20" # import-from-url worker
serde = { version = "1", features = ["derive"] }` },
  { p: 'README.md', t: `# Tastebook

Recipe sharing for people who actually cook.

SvelteKit front end, Rust/Axum API, Postgres 16, Docker for everything.

## Quick start

- \`docker compose up\` brings up the web app on \`:5173\` and the API on \`:8080\`
- \`cargo test --workspace\` and \`pnpm test\` before every push

## Layout

- \`src/\` the API
- \`web/\` the SvelteKit front end
- \`migrations/\` sqlx migrations, applied at boot
- \`unraid-template.xml\` the publish target

Run #47 (this build) adds the **image-processing package** and hardens *import from URL*.
See [the PRD](PRD.md) for the why.` },
  { p: 'PRD.md', d: 1, t: ` # PRD — Tastebook v1.2: media pipeline + import hardening
 
 **Owner:** Jared · **Status:** approved (rev 12) · **Run:** #47
 
 ## Summary
 
 Two long-standing complaints, one release: recipe photos look terrible
 because we serve originals, and import-from-URL breaks on roughly one
 blog in five. v1.2 adds a proper image-processing package and rebuilds
 the import worker around retries and sanitization.
 
 ## Problem
 
 - Photos: a 12 MB kitchen-phone original ships to every card on the
   grid. Home page LCP is 4.1s on cable, worse on mobile.
-- EXIF: uploads keep camera tags.
+- EXIF: uploads keep GPS tags. That is a privacy bug, full stop.
 - Imports: schema.org data on real blogs is messy — @graph wrappers,
   mixed-fraction quantities, scripts inside instruction HTML.
 
 ## Goals
 
+1. Every upload gets a 320 / 800 / 1600 resize ladder in WebP.
+2. All EXIF stripped at ingest; orientation normalized first.
 3. Import succeeds on 95% of the top-200 recipe-blog fixture set.
+4. A failed import always leaves a useful error, never a half-draft.
 
 ## Non-goals
 
 - Meal planning, mobile apps, federation (parked for v2).
+- Video. The pipeline is images only for now.
 
 ## Users
 
 - Home cooks posting 1-3 recipes a month from a phone.
 - Collectors importing from blogs they already follow.
-- Lurkers — 40:1 read-to-write; the grid must stay fast for them.
 
 ## Solution sketch
 
 **Media:** uploads hit POST /api/recipes/:id/photos, get a content-hash
-key and a receipt. The API renders the ladder inside the request
+key and a queued receipt. A worker renders the ladder off the request
 path; the card grid reads renditions, never originals.
 
 **Import:** the worker polls import_jobs every 5s, one in-flight fetch
-per host, a fixed 4s wait between retries. Extraction reads
+per host, backoff 1s → 4s → 9s honoring Retry-After. Extraction reads
 JSON-LD first, microdata fallback second. Everything is sanitized:
 scripts stripped, steps clamped at 40, units normalized.
 
 ## Storage decision
 
+Renditions live on the media volume; a nightly backup syncs to
+Cloudflare R2. Chosen over S3 for zero egress fees on the public
 bucket — read traffic outweighs writes 40:1.
 
 ## Rollout
 
 Ship behind a flag to the beta cohort first; everyone else after one
 clean week. The import worker deploys separately so a bad extractor
 never takes down the API.
 
 ## Acceptance
 
 23 PlanUnits across 4 lanes; seam boundaries hold; the auditor review
 loop closes with zero open findings. Fixture suite: cargo test -p
-import-worker must go 15/15, including the fraction regressions
+import-worker must go 15/15, including the mixed-fraction regression
 from run #47 (the n-19 flake).
 
 ## Risks
 
 - image crate CVE surface — pinned at 0.25, audited on every bump.
+- Rendition backlog under burst upload — queue bounded at 64; uploads
+  past that return 503 with Retry-After.
 - Import legal posture: we store extracted text, link the source, and
   never republish photos.
 
 ## Metrics
 
+- Home page LCP at p75: 1.8s target, from 4.1s.
 - Import success on the fixture set: 95% target, from 78%.
 - EXIF fields on stored renditions: zero, audited nightly.
 
 ## Open questions
 
 1. Gate imports behind an account to slow scraper abuse? (leaning yes)` },
  { p: 'unraid-template.xml', t: `<?xml version="1.0"?>
<Container version="2">
  <Name>Tastebook</Name>
  <Repository>jared/tastebook:v1.2</Repository>
  <WebUI>http://[IP]:[PORT:8080]</WebUI>
  <Config Name="Media path" Target="/data/media" Mode="rw"/>
  <Config Name="Backups" Target="/data/backups" Mode="rw"/>
</Container>` },
  { p: '.github/workflows/ci.yml', t: `name: CI — build + test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cargo test --workspace
      - run: pnpm install && pnpm test` },
  { p: 'build.log', t: `# .gitignore'd — kept in the tree so the ignored-row styling has a subject.

   Compiling tastebook-api v0.1.0 (/workspace/tastebook)
   Compiling import-worker v0.1.0 (/workspace/tastebook/crates/import-worker)
warning: unused import: \`std::time::Duration\`
  --> src/main.rs:6:5
   |
 6 | use std::time::Duration;
   |     ^^^^^^^^^^^^^^^^^^^
   |
   = note: \`#[warn(unused_imports)]\` on by default

    Finished \`release\` profile [optimized] target(s) in 1m 12s
     Running \`target/release/tastebook\`
2026-08-03T04:11:07Z  INFO tastebook: listening on 0.0.0.0:8080
2026-08-03T04:11:07Z  INFO tastebook::db: pool ready (max=16)
2026-08-03T04:11:08Z  INFO import_worker: queue bound=64, workers=4
2026-08-03T04:11:22Z  WARN import_worker: retry 1/3 for job 9f3c (upstream 503)
2026-08-03T04:11:24Z  INFO import_worker: job 9f3c ok in 2.1s
2026-08-03T04:12:03Z  INFO tastebook::media: rendition 1200.webp written (hash 7ac91e)` }
];
/* The 5.6 Pro chat's change records (data.js 584-1160): hunks only; lines start with " ", "+", "-" or "\\" (a note). */
var CHAT_CHANGES = [
  { path: 'migrations/0043_tenant_created_index.sql', line: 1, status: 'added', language: 'sql',
    summary: `Add the tenant_id + created_at composite index as a concurrent, non-transactional migration`,
    hunks: [[0, 1, `+-- 0043_tenant_created_index
+-- Leading column is tenant_id: every analytics read is tenant-scoped,
+-- and created_at carries the range predicate plus the ORDER BY.
+--
+-- CONCURRENTLY cannot run inside a transaction block, so this file is
+-- split out of the batch migration and applied on its own.
+-- no-transaction
+
+CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_created
+    ON analytics_events (tenant_id, created_at DESC)
+    INCLUDE (event_kind, actor_id);
+
+ANALYZE analytics_events;
+
+-- rollback:
+--   DROP INDEX CONCURRENTLY IF EXISTS idx_events_tenant_created;
+-- The rollback is rehearsed in tests/analytics_query_test.rs so the
+-- forward migration is never the only tested direction.`]] },
  { path: 'src/analytics/queries.rs', line: 128, status: 'modified', language: 'rust',
    summary: `Replace the per-row event lookup with one batched, tenant-first query`,
    hunks: [[122, 122, ` use crate::analytics::schema::{EventKind, TenantScope};
-use crate::db::Row;
+use crate::analytics::index_hints::IndexHint;
+use crate::db::{Row, RowBatch};
 
 impl AnalyticsQueries {
-    /// Loads events one tenant at a time. O(n) round trips.
-    pub async fn events_for(&self, scope: &TenantScope) -> Result<Vec<Row>> {
-        let mut out = Vec::new();
-        for tenant in scope.tenants() {
-            out.extend(self.one_tenant(tenant).await?);
+    /// Loads every tenant in one round trip. The index hint keeps the
+    /// planner on idx_events_tenant_created even when the range is wide.
+    pub async fn events_for(&self, scope: &TenantScope) -> Result<RowBatch> {
+        let hint = IndexHint::tenant_created();
+        let batch = self
+            .pool
+            .fetch_batch(hint.apply(EVENTS_BY_TENANT), scope.tenant_ids())
+            .await?;
         }
         Ok(out)
     }`],
      [196, 199, ` const EVENTS_BY_TENANT: &str = r#"
-    SELECT * FROM analytics_events
-     WHERE tenant_id = $1
-     ORDER BY created_at DESC
+    SELECT event_kind, actor_id, created_at, payload
+      FROM analytics_events
+     WHERE tenant_id = ANY($1)
+       AND created_at >= $2
+     ORDER BY tenant_id, created_at DESC
+     LIMIT $3
 "#;
 
+/// Batch size chosen so one page of the composite index is one read.
+pub const EVENT_PAGE: i64 = 512;
+
+#[cfg(test)]
+mod planner_guard {
+    use super::*;
+
+    /// Fails loudly if the planner stops choosing the composite index,
+    /// which is the only way this change silently regresses.
+    #[tokio::test]
+    async fn uses_composite_index() {
+        let plan = explain(EVENTS_BY_TENANT).await;
+        assert!(plan.contains("idx_events_tenant_created"), "{plan}");
+    }
+}
 `]] },
  { path: 'src/analytics/bench.rs', line: 44, status: 'modified', language: 'rust',
    summary: `Add the tenant-scale benchmark fixture and record the write-amplification cost`,
    hunks: [[41, 41, ` use criterion::{criterion_group, Criterion};
-const TENANTS: usize = 8;
-const EVENTS_PER_TENANT: usize = 400;
-
+/// 128,400 rows across 214 tenants -- the shape production actually has.
+/// The old 8x400 fixture was small enough that a sequential scan won,
+/// which is why the previous benchmark showed no gain from the index.
+const TENANTS: usize = 214;
+const EVENTS_PER_TENANT: usize = 600;
+
+fn write_amplification(c: &mut Criterion) {
+    c.bench_function("insert_with_composite_index", |b| {
+        b.iter(|| insert_batch(EVENTS_PER_TENANT));
+    });
+}
+
 fn read_path(c: &mut Criterion) {
+    let fixture = seed(TENANTS, EVENTS_PER_TENANT);
+    c.bench_function("events_for_tenant_page", |b| {
+        b.iter(|| fixture.events_for(&scope()));
+    });
 }
 
+criterion_group!(benches, read_path, write_amplification);
+// Baseline p95 482 ms -> 71 ms read; writes +4.8%.
 `]] },
  { path: 'threads/provider-selector.js', line: 64, status: 'modified', language: 'javascript',
    summary: `Route the selector through configured accounts instead of one account per provider`,
    hunks: [[58, 58, ` import { configuredProviders } from '../providers/registry.js';
-import { firstAccount } from '../providers/accounts.js';
+import { accountsFor, accountState } from '../providers/accounts.js';
+import { STATUS_LABEL } from '../providers/labels.js';
 
-// One provider used to mean one account, so the selector could key its
-// rows on the provider id -- an assumption that is now wrong.
-export function providerRows() {
-  return configuredProviders().map((p) => ({
-    id: p.id,
-    account: firstAccount(p.id),
+// A provider can expose the same model through several configured
+// accounts, so rows are keyed on \`\${providerId}:\${accountId}\` and the
+// model name alone is no longer unique inside the list.
+export function providerRows() {
+  return configuredProviders().flatMap((p) => accountsFor(p.id).map((a) => ({
+    id: \`\${p.id}:\${a.id}\`,
+    providerId: p.id,
+    account: a,
+    state: accountState(a),
   }));
 }`],
      [96, 100, ` export function renderSelector(host, state) {
-  const rows = providerRows();
-  host.innerHTML = rows.map((r) => row(r, r.id === state.provider)).join('');
+  const rows = providerRows();
+  const grouped = groupByProvider(rows);
+  host.innerHTML = grouped
+    .map(([providerId, items]) => section(providerId, items, state))
+    .join('');
+  host.dataset.accountCount = String(rows.length);
+  host.dataset.needsAttention = String(rows.filter(needsAttention).length);
 }
 
-function row(r, active) {
-  return \`<button class="row \${active ? 'active' : ''}" data-id="\${r.id}">
-    <span class="name">\${r.id}</span>
-    <span class="account">\${r.account.label}</span>
-  </button>\`;
-}
+function groupByProvider(rows) {
+  const map = new Map();
+  for (const r of rows) {
+    if (!map.has(r.providerId)) map.set(r.providerId, []);
+    map.get(r.providerId).push(r);
+  }
+  return [...map.entries()];
+}
+
+function section(providerId, items, state) {
+  const attention = items.filter(needsAttention).length;
+  return [
+    \`<div class="provider-group" data-provider="\${providerId}">\`,
+    \`  <div class="group-head">\`,
+    \`    <span class="group-name">\${providerId}</span>\`,
+    \`    <span class="group-count">\${items.length} accounts</span>\`,
+    attention ? \`    <span class="group-warn">\${attention} need attention</span>\` : '',
+    \`  </div>\`,
+    items.map((r) => row(r, r.id === state.route)).join(''),
+    \`</div>\`,
+  ].filter(Boolean).join('\\n');
+}
+
+function row(r, active) {
+  const blocked = needsAttention(r);
+  return [
+    \`<button class="row \${active ? 'active' : ''} \${blocked ? 'blocked' : ''}"\`,
+    \`        data-id="\${r.id}" \${blocked ? 'aria-disabled="true"' : ''}>\`,
+    \`  <span class="name">\${r.account.model}</span>\`,
+    \`  <span class="account">\${r.account.label}</span>\`,
+    \`  <span class="state">\${STATUS_LABEL[r.state] ?? r.state}</span>\`,
+    \`</button>\`,
+  ].join('\\n');
+}
+
+function needsAttention(r) {
+  return r.state !== 'ready' && r.state !== 'update-available';
+}
 `],
      [168, 200, ` export function selectRoute(host, id) {
-  host.dataset.provider = id;
-  emit(host, 'route', { provider: id });
-}
+  const [providerId, accountId] = id.split(':');
+  const row = providerRows().find((r) => r.id === id);
+  if (!row) return false;
+  if (needsAttention(row)) {
+    // Do not silently fall back to another account: the user picked a
+    // specific one, and a quiet substitution is how a thread ends up
+    // billed to an account nobody chose.
+    emit(host, 'route-blocked', { providerId, accountId, state: row.state });
+    return false;
+  }
+  host.dataset.provider = providerId;
+  host.dataset.account = accountId;
+  host.dataset.route = id;
+  emit(host, 'route', { providerId, accountId, model: row.account.model });
+  return true;
+}
+
+export function routeLabel(id) {
+  const row = providerRows().find((r) => r.id === id);
+  if (!row) return 'No configured route';
+  return \`\${row.account.model} · \${row.account.label}\`;
+}
+
+// Two accounts on the same provider can expose the same model, so the
+// thread has to record which one it actually ran on. Reading it back
+// off the model name would silently merge them.
+export function routeState(host) {
+  const id = host.dataset.route;
+  const row = id && providerRows().find((r) => r.id === id);
+  if (!row) {
+    return { ok: false, reason: 'no-configured-route', label: routeLabel(id) };
+  }
+  const ok = !needsAttention(row);
+  return { ok, reason: row.state, providerId: row.providerId,
+           accountId: row.account.id, label: routeLabel(id) };
+}
 `]] },
  { path: 'threads/access-controls.css', line: 12, status: 'modified', language: 'css',
    summary: `Replace the colour-only permission accent with a token set that survives all eight themes`,
    hunks: [[12, 12, ` .access-row {
-  border-left: 3px solid #4c8dff;
-  padding: 6px 8px 6px 11px;
-  background: rgba(76, 141, 255, 0.08);
-  color: #e8ecf6;
-}
-
-.access-row.denied { border-left-color: #ff5c5c; }
-.access-row.pending { border-left-color: #ffb648; }
-.access-row.granted { border-left-color: #37d67a; }
-
-.access-row .label { font-size: 11px; opacity: 0.7; }
-.access-row .value { font-size: 12px; }
+  /* A coloured left-edge bar may not carry status: it is invisible to
+     anyone who cannot separate the hues, and it collides with the
+     selection accent. Status is an icon plus a word plus a tone. */
+  display: grid;
+  grid-template-columns: 18px minmax(0, 1fr) auto;
+  align-items: center;
+  gap: 8px;
+  padding: 6px 9px;
+  border: 1px solid var(--border);
+  border-radius: var(--radius-sm);
+  background: var(--surface-raised);
+  color: var(--text);
+}
+
+.access-row > .access-icon {
+  display: grid;
+  place-items: center;
+  inline-size: 18px;
+  block-size: 18px;
+  color: var(--muted);
+}
+
+.access-row.denied  > .access-icon { color: var(--danger); }
+.access-row.pending > .access-icon { color: var(--warning); }
+.access-row.granted > .access-icon { color: var(--positive); }
+
+.access-row .label { font-size: 11px; color: var(--muted); }
+.access-row .value { font-size: 12px; color: var(--text); }
+.access-row .state { font-size: 10px; color: var(--subtle); }
 `],
      [58, 80, ` .access-panel {
-  max-height: 320px;
-  overflow: hidden;
-}
-
-@media (prefers-color-scheme: light) {
-  .access-row { background: rgba(76, 141, 255, 0.06); color: #14181f; }
-  .access-row .label { opacity: 0.6; }
-}
-
-@media (max-width: 700px) {
-  .access-row { border-left-width: 2px; }
-  .access-panel { max-height: 200px; }
-}
-
-.access-row:hover { background: rgba(76, 141, 255, 0.16); }
-.access-row:focus-visible { outline: 2px solid #4c8dff; }
-.access-row[aria-disabled='true'] { opacity: 0.4; }
-
-.access-row .chip { border-radius: 3px; padding: 1px 4px; }
-.access-row .chip.danger { background: #ff5c5c; }
-.access-row .chip.warn { background: #ffb648; }
-.access-row .chip.ok { background: #37d67a; }
-
-.access-note { font-size: 10px; color: #8a93a6; }
-
-.access-panel::-webkit-scrollbar { width: 6px; }
-.access-panel::-webkit-scrollbar-thumb { background: #4c8dff; }
+  max-height: min(320px, 100vh - 24px);
+  overflow: auto;
+  overscroll-behavior: contain;
+  scrollbar-gutter: stable;
+}
+
+/* Theme handling moved to tokens: the eight themes are explicit
+   attribute states, not a light/dark media query, so this block was
+   only ever correct in two of them. */
+.access-row:hover { background: var(--surface-hover); }
+.access-row:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
+.access-row[aria-disabled='true'] { opacity: 0.55; cursor: not-allowed; }
+.access-row[aria-disabled='true'] .state { color: var(--danger); }
+
+.access-row .chip {
+  padding: 1px 5px; font-size: 9px; border-radius: var(--radius-sm);
+  border: 1px solid var(--border); background: var(--surface);
+}
+.access-row .chip.danger { border-color: var(--danger); color: var(--danger); }
+.access-row .chip.warn   { border-color: var(--warning); color: var(--warning); }
+.access-row .chip.ok     { border-color: var(--positive); color: var(--positive); }
+
+.access-note { font-size: 10px; color: var(--subtle); }
+
+@media (max-width: 700px) {
+  .access-row { grid-template-columns: 18px minmax(0, 1fr); }
+  .access-row .state { grid-column: 2; }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .access-row { transition: none; }
+}
 `]] },
  { path: 'verification/interaction-probes.mjs', line: 22, status: 'modified', language: 'javascript',
    summary: `Assert painted pixels instead of bounding boxes in the interaction probes`,
    hunks: [[22, 22, ` export async function probeVisible(page, selector) {
-  // TODO: this does not prove the element is actually painted.
-  const box = await page.locator(selector).boundingBox();
-  return Boolean(box && box.width > 0 && box.height > 0);
-}
+  // A bounding box is reported for elements that are clipped, occluded,
+  // or mid-transition -- which is how three "fixes" passed while invisible.
+  const box = await page.locator(selector).boundingBox();
+  if (!box || box.width <= 0 || box.height <= 0) return false;
+  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
+  const onTop = await page.evaluate(
+    ([x, y, sel]) => document.elementFromPoint(x, y)?.closest(sel) !== null,
+    [cx, cy, selector],
+  );
+  // Distinct colours, not mean luminance: a placeholder box has exactly one.
+  return onTop && distinctColours(await page.screenshot({ clip: box })) > 3;
+}
 `],
      [70, 91, ` export async function probeHoverOnly(page, selector) {
-  await page.hover(selector);
-  const shown = await probeVisible(page, selector);
-  return shown;
-}
-
-export const PROBES = [probeVisible, probeHoverOnly];
+  const atRest = await probeVisible(page, selector);
+  await page.hover(selector);
+  await page.waitForFunction(
+    (sel) => getComputedStyle(document.querySelector(sel)).opacity === '1',
+    selector,
+  );
+  const onHover = await probeVisible(page, selector);
+  // The assertion is the PAIR: absent at rest AND present on hover.
+  return { atRest, onHover, pass: atRest === false && onHover === true };
+}
+
+export async function probeScrolls(page, selector) {
+  const before = await page.locator(selector).evaluate((el) => el.scrollTop);
+  await page.locator(selector).evaluate((el) => { el.scrollTop = 9999; });
+  const after = await page.locator(selector).evaluate((el) => el.scrollTop);
+  return after > before;
+}
+
+export const PROBES = [probeVisible, probeHoverOnly, probeScrolls];
 `]] },
  { path: 'src/analytics/legacy_rollup.rs', line: 1, status: 'deleted', language: 'rust',
    summary: `Delete the hourly rollup table now that the composite index serves the same reads`,
    hunks: [[1, 0, `-//! Hourly rollup of analytics_events.
-//!
-//! Superseded by idx_events_tenant_created: the rollup existed only to
-//! avoid the sequential scan the index now removes.
-
-use crate::db::Pool;
-
-pub struct LegacyRollup {
-    pool: Pool,
-    window_hours: u32,
-}
-
-impl LegacyRollup {
-    pub fn new(pool: Pool) -> Self {
-        Self { pool, window_hours: 24 }
-    }
-
-    pub async fn refresh(&self) -> Result<u64> {
-        self.pool.execute(REFRESH_ROLLUP).await
-    }
-}
-
-const REFRESH_ROLLUP: &str = "REFRESH MATERIALIZED VIEW events_hourly";
\\\\ No newline at end of file`]] },
  { path: 'src/analytics/index_hints.rs', line: 1, status: 'added', language: 'rust',
    summary: `New index-hint helper so the planner choice is explicit and testable`,
    hunks: [[0, 1, `+//! Explicit planner hints.
+//!
+//! The planner picking the right index by accident is not the same as
+//! the planner picking it on purpose, and only one of those survives a
+//! statistics refresh.
+
+#[derive(Clone, Copy, Debug, PartialEq, Eq)]
+pub struct IndexHint {
+    name: &'static str,
+}
+
+impl IndexHint {
+    pub const fn tenant_created() -> Self {
+        Self { name: "idx_events_tenant_created" }
+    }
+
+    pub fn apply(&self, sql: &str) -> String {
+        format!("/*+ IndexScan({}) */ {sql}", self.name)
+    }
+
+    pub const fn name(&self) -> &'static str {
+        self.name
+    }
+}`]] },
  { path: 'docs/query-performance.md', line: 1, status: 'renamed', oldPath: 'docs/perf-notes.md', language: 'markdown',
    summary: `Rename the perf notes to a durable report and record the rollback rehearsal`,
    hunks: [[1, 1, `-# Perf notes
-
-Scratch notes on the analytics read path. Not authoritative.
-
-- index? maybe
+# Query performance
+
+Authoritative record for the tenant-scoped analytics read path.
+
+| Metric | Before | After |
+| --- | --- | --- |
+| p95 read | 482 ms | 71 ms |
+| p50 read | 118 ms | 24 ms |
+| Write throughput | baseline | +4.8% cost |
+
+The rollback is rehearsed, not assumed: see tests/analytics_query_test.rs.
 `]] },
  { path: 'src/analytics/schema.rs', line: 88, status: 'modified', language: 'rust',
    summary: `Narrow the event payload column and drop the unused rollup foreign key`,
    hunks: [[86, 86, ` pub struct AnalyticsEvent {
-    pub payload: serde_json::Value,
+    /// Bounded at write time; unbounded payloads were 61% of row width.
+    pub payload: BoundedJson<4096>,
     pub created_at: DateTime<Utc>,
 }`],
      [140, 141, ` impl Schema for AnalyticsEvent {
-    const FOREIGN_KEYS: &[&str] = &["events_hourly_fk"];
-    const INDEXES: &[&str] = &["events_created_idx"];
-    const PARTITION: Option<&str> = None;
+    const FOREIGN_KEYS: &[&str] = &[];
+    const INDEXES: &[&str] = &["idx_events_tenant_created"];
+    const PARTITION: Option<&str> = Some("created_at");
+    const RETENTION: Duration = Duration::days(9);
 }`]] },
  { path: 'tests/analytics_query_test.rs', line: 31, status: 'modified', language: 'rust',
    summary: `Rehearse the rollback direction and assert the planner keeps the index`,
    hunks: [[29, 29, ` #[tokio::test]
-async fn forward_migration_applies() {
-    apply("0043_tenant_created_index").await.unwrap();
+async fn forward_and_rollback_both_apply() {
+    apply("0043_tenant_created_index").await.unwrap();
+    assert!(index_exists("idx_events_tenant_created").await);
+    rollback("0043_tenant_created_index").await.unwrap();
+    assert!(!index_exists("idx_events_tenant_created").await);
+    apply("0043_tenant_created_index").await.unwrap();
 }`],
      [72, 78, ` #[tokio::test]
 async fn tenant_isolation_holds() {
+    // The index reorders rows; isolation must be proven, not inferred.
+    let a = events_for(tenant("a")).await;
+    let b = events_for(tenant("b")).await;
+    assert!(a.iter().all(|e| e.tenant_id == tenant("a")));
+    assert!(b.iter().all(|e| e.tenant_id == tenant("b")));
+    assert_eq!(a.len(), 600);
+    assert_eq!(b.len(), 600);
 }`]] },
  { path: 'config/observability.toml', line: 14, status: 'modified', language: 'toml',
    summary: `Emit the planner choice and the write-amplification gauge`,
    hunks: [[12, 12, ` [metrics.analytics]
-histogram_buckets = [50, 100, 250, 500]
-emit_plan_name = false
+histogram_buckets = [10, 25, 50, 100, 250, 500]
+emit_plan_name = true
+emit_write_amplification = true
+
+[metrics.analytics.alert]
+p95_read_ms = 100
 `]] }
];
/* ==== CORPUS:END ==== */

setup();
