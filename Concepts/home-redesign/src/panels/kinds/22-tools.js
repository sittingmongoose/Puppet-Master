/* The dev-session tool kinds (D9; CONTRACT sections 2, 3, 5 and 7): Output, Problems, Ports and Debug Console. They
   replace PMConcept7's bottom-panel hosts (#bottomOutputHost, #bottomProblemsHost, #bottomPortsHost, #bottomDebugHost)
   and keep their demo story: the Tastebook import worker reads "1 1/2 cup" as 11.5, the build and the tests say so,
   Problems lists it, the debugger is paused on it.
     output             one Output tab, the channel switched inside it (D31): Build, Tests, Language server, Puppet Master;
                        lines stream while the tab is visible
     output:<channel>   a channel split off into its own tab from the picker, fixed to that channel
     problems           one per workspace; grouped by file; a click opens the editor at the line (D7)
     ports              one per workspace; Open in browser opens a Browser tab, Copy address copies it
     debug-console      one Debug Console tab, a sub-tab per debug session (D33): each session its console, its state
                        and an input line for the paused frame
   Every file reference opens the D7 way: a single click is a preview tab, a double click keeps it, Alt+click opens a
   new panel. Each uses the shared header row; no internal ids are shown (the PM7 hosts printed session ids). */

var SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs, kids) {
  var el = document.createElement(tag);
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
  return add(el, kids);
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? document.createTextNode(String(kids)) : kids);
  return el;
}
function ico(name, size) { return PMW.icon(name, { size: size || 14 }); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clock() { var d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

/* status glyphs in SVG, never characters: error (circled x), warn (triangle), info (circled i), ok (check) */
var MARKS = {
  error: 'M8 2.2a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 8 2.2zM5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2',
  warn: 'M8 2.4 14 13.2H2zM8 6.6v3.2M8 11.3v.1',
  info: 'M8 2.2a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 8 2.2zM8 7.3v4M8 5v.1',
  ok: 'M3.5 8.5l3 3 6-7'
};
function mark(kind, size) {
  var s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('width', size || 13); s.setAttribute('height', size || 13);
  s.setAttribute('class', 'pmw-tool-mark is-' + kind); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', MARKS[kind] || MARKS.info); s.appendChild(p);
  return s;
}
/* custom header-row icons (an SVG string is drawn by PMW.icon at 14 px) */
var CLEAR_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" class="pmw-ico" aria-hidden="true" focusable="false"><path d="M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM4.1 11.9l7.8-7.8"/></svg>';
var FOLLOW_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" class="pmw-ico" aria-hidden="true" focusable="false"><path d="M8 2.5v8.5M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/></svg>';
var WRAP_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" class="pmw-ico" aria-hidden="true" focusable="false"><path d="M2.5 4h11M2.5 8h9a2 2 0 0 1 0 4H8M9.5 10.5 8 12l1.5 1.5M2.5 12h3"/></svg>';

/* D7 file opens from a tool row: single click a preview tab, double click keeps it, Alt+click a new panel */
function fileOpener(api, path, line, col) {
  return {
    click: function (e) { api.open({ kind: 'editor', path: path, line: line, col: col || null, where: e && e.altKey ? 'panel' : 'auto' }); },
    dbl: function () { api.open({ kind: 'editor', path: path, line: line, col: col || null, mode: 'keep' }); }
  };
}
/* text with path:line(:col) references turned into D7 links */
var PATH_RX = /((?:src|web|tests|benches|migrations|config)\/[\w./+\-[\]]+\.(?:rs|svelte|tsx?|sql|toml|js)):(\d+)(?::(\d+))?/g;
function linkify(api, text) {
  var frag = document.createDocumentFragment(), last = 0, m;
  PATH_RX.lastIndex = 0;
  while ((m = PATH_RX.exec(text))) {
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    var o = fileOpener(api, m[1], +m[2], m[3] ? +m[3] : null);
    var a = h('button', { type: 'button', class: 'pmw-tool-flink', text: m[0], 'data-pm-hover-label': 'Open at line ' + m[2], 'data-pm-hover-detail': 'Double click keeps the tab; Alt+click opens a new panel', 'data-pmh': 'off' });
    a.addEventListener('click', o.click); a.addEventListener('dblclick', o.dbl);
    frag.appendChild(a);
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  return frag;
}
function copyText(api, text, done) {
  var ok = function () { PMW.toast(done); api.announce(done); };
  var no = function () { PMW.toast('Could not copy: the browser did not allow it.'); };
  try { navigator.clipboard.writeText(text).then(ok, no); } catch (_) { no(); }
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Output                                                                                                              */
/* ------------------------------------------------------------------------------------------------------------------ */

var CHANNELS = [
  { id: 'build', label: 'Build', sub: 'cargo build' },
  { id: 'tests', label: 'Tests', sub: 'cargo test' },
  { id: 'language-server', label: 'Language server', sub: 'rust-analyzer' },
  { id: 'puppet-master', label: 'Puppet Master', sub: 'What Puppet Master and its agents did' }
];
function channelOf(id) { for (var i = 0; i < CHANNELS.length; i++) if (CHANNELS[i].id === id) return CHANNELS[i]; return { id: id, label: id.replace(/-/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); }), sub: '' }; }

/* [level, text] or ['pause', ms]; levels: cmd, dim, plain, info, ok, warn, error. `seed` lines show at once. */
var SCRIPTS = {
  build: { seed: 12, lines: [
    ['cmd', '$ cargo build --workspace'],
    ['dim', '   Compiling tastebook-model v1.2.0 (/home/dev/tastebook/model)'],
    ['dim', '   Compiling image-processing v0.9.4'],
    ['dim', '   Compiling import-worker v0.7.1'],
    ['dim', '   Compiling tastebook-api v1.2.0 (/home/dev/tastebook/api)'],
    ['warn', 'warning: unused variable: `servings_hint`'],
    ['plain', '  --> src/services/import.rs:58:9'],
    ['plain', '   |'],
    ['plain', '58 |     let servings_hint = ld.get("recipeYield");'],
    ['plain', '   |         ^^^^^^^^^^^^^ help: if this is intentional, prefix it with an underscore: `_servings_hint`'],
    ['warn', 'warning: `tastebook-api` (bin "tastebook-api") generated 1 warning'],
    ['ok', '    Finished `dev` profile [unoptimized + debuginfo] target(s) in 42.3s'],
    ['pause', 2600],
    ['info', '[watch] src/services/import.rs changed, rebuilding'],
    ['cmd', '$ cargo build --workspace'],
    ['dim', '   Compiling tastebook-api v1.2.0 (/home/dev/tastebook/api)'],
    ['error', 'error[E0308]: mismatched types'],
    ['plain', '  --> src/services/import.rs:95:23'],
    ['plain', '   |'],
    ['plain', '95 |     let whole: f32 = caps.get(1).map(|m| m.as_str().parse().ok());'],
    ['plain', '   |                ---   ^^^ expected `f32`, found `Option<Option<f32>>`'],
    ['error', 'error: could not compile `tastebook-api` (bin "tastebook-api") due to 1 previous error'],
    ['pause', 3200],
    ['info', '[watch] src/services/import.rs changed, rebuilding'],
    ['cmd', '$ cargo build --workspace'],
    ['dim', '   Compiling tastebook-api v1.2.0 (/home/dev/tastebook/api)'],
    ['ok', '    Finished `dev` profile [unoptimized + debuginfo] target(s) in 6.81s'],
    ['pause', 4200]
  ] },
  tests: { seed: 10, lines: [
    ['cmd', '$ cargo test -p tastebook-api'],
    ['dim', '    Finished `test` profile [unoptimized + debuginfo] target(s) in 3.02s'],
    ['dim', '     Running unittests src/main.rs (target/debug/deps/tastebook_api-3f9c2e)'],
    ['plain', ''],
    ['plain', 'running 214 tests'],
    ['ok', 'test import::tests::simple_units_still_parse ... ok'],
    ['ok', 'test import::tests::fraction_only ... ok'],
    ['error', 'test import::tests::mixed_fraction_regression_47 ... FAILED'],
    ['ok', 'test routes::recipes::tests::list_is_paginated ... ok'],
    ['ok', 'test analytics::queries::tests::tenant_scope_uses_index ... ok'],
    ['plain', ''],
    ['plain', 'failures:'],
    ['plain', '---- import::tests::mixed_fraction_regression_47 stdout ----'],
    ['error', "thread 'import::tests::mixed_fraction_regression_47' panicked at src/services/import.rs:110:9:"],
    ['plain', 'assertion `left == right` failed'],
    ['plain', '  left: 11.5'],
    ['plain', ' right: 1.5'],
    ['plain', ''],
    ['error', 'test result: FAILED. 213 passed; 1 failed; 0 ignored; 0 measured; finished in 3.41s'],
    ['pause', 4000],
    ['info', '[watch] running the failed test again'],
    ['cmd', '$ cargo test -p tastebook-api mixed_fraction'],
    ['ok', 'test import::tests::mixed_fraction_regression_47 ... ok'],
    ['ok', 'test result: ok. 1 passed; 0 failed; 0 ignored; 213 filtered out; finished in 0.04s'],
    ['pause', 5000]
  ] },
  'language-server': { seed: 5, lines: [
    ['info', '[info] rust-analyzer 2026-09-29 started for /home/dev/tastebook'],
    ['info', '[info] loaded 214 crates in 0.9 s'],
    ['info', '[info] indexed 412 of 412 files'],
    ['warn', '[warn] sqlx::query! needs DATABASE_URL to check queries; using the offline data in .sqlx'],
    ['info', '[info] diagnostics: 2 errors, 4 warnings in 4 files'],
    ['pause', 1800],
    ['dim', '[trace] textDocument/didChange src/services/import.rs (version 41)'],
    ['dim', '[trace] textDocument/publishDiagnostics src/services/import.rs: 3 items'],
    ['pause', 2600],
    ['dim', '[trace] textDocument/hover src/services/import.rs:95:23'],
    ['dim', '[trace] textDocument/completion web/src/lib/RecipeCard.svelte:6:12'],
    ['info', '[info] check finished in 2.1 s'],
    ['pause', 4000]
  ] },
  'puppet-master': { seed: 5, lines: [
    ['info', 'Query Analyzer opened a terminal for "cargo test"'],
    ['plain', 'Checkpoint saved before editing src/services/import.rs:95'],
    ['plain', 'Problems updated: 2 errors, 4 warnings'],
    ['warn', 'Schema Reviewer is waiting for your approval to change the production schema'],
    ['ok', 'Plan "Tenant-scoped analytics read path" is ready to build'],
    ['pause', 3000],
    ['plain', 'Query Analyzer read postgresql.org/docs/16/indexes-multicolumn.html'],
    ['plain', 'Context: 64 % of this thread’s context is in use'],
    ['pause', 2400],
    ['ok', 'Benchmark Runner finished: p95 24 ms at 3,980 rows/s'],
    ['pause', 4200]
  ] }
};
var OUT_CAP = 600;

/* D31: Output is one tab ('output') with the channel as view state, switched inside it by the header row's channel
   picker, like VS Code. A picker row's trailing cell opens a split-off tab 'output:<channel>' fixed to that channel.
   PM_HOME.open({ kind: 'output', channel }) focuses a split-off tab already showing the channel, otherwise it switches
   the Output tab (idFor picks the id; the core hands { channel } to reveal on an open tab). A saved 'output:build'
   from an older layout is simply a split-off tab. */
function outputLabel(channel) { return 'Output · ' + channelOf(channel || 'build').label; }
function fixedChannel(id) { var m = /^output:(.+)$/.exec(String(id || '')); return m ? m[1] : null; }
function splitOffId(channel) { return 'output:' + channel; }
function isOpenTab(id) { var l = PMW.state && PMW.state.layout; return !!(l && l.tabs[id]); }
/* a split-off tab: a tab with a plus in its corner, drawn in the 16 px stroke grammar */
PMW.registerIcon('outputNewTab', 'M2.5 13.5v-9h4.5l1 2h5.5v7zM10.5 8.5v3.5M8.75 10.25h3.5', '+');

PM_HOME.registerKind('output', {
  label: 'Output', group: 'Tools', icon: 'output', prefixes: ['output:', 'output'], min: { w: 280, h: 120 }, dedicated: true,
  idFor: function (spec) {
    var c = spec && spec.channel;
    return c && isOpenTab(splitOffId(c)) ? splitOffId(c) : 'output';
  },
  labelFor: function (id) { var f = fixedChannel(id); return f ? outputLabel(f) : 'Output'; },
  plus: { order: 70, group: 'tools', label: 'Output', spec: function () { return { kind: 'output' }; } },
  mount: function (host, st, api) {
    st = st || {};
    var fixed = fixedChannel(api.id);
    var channel = fixed || st.channel || 'build';
    var follow = st.follow !== false;
    var wrap = !!st.wrap;
    var timer = 0, shown = false;
    var chans = {};   // channel -> { frag, at, lines, started }: each channel keeps its own lines while another shows
    var root = h('div', { class: 'pmw-tool pmw-tool-out' + (wrap ? ' is-wrap' : '') + (fixed ? ' is-fixed' : '') });
    host.appendChild(root);

    var chanBtn = null, chanText = h('span', { class: 'pmw-tool-chanl' });
    if (!fixed) {
      chanBtn = h('button', { type: 'button', class: 'pmw-tool-chan', 'aria-haspopup': 'menu',
        'data-pm-hover-label': 'Channel', 'data-pm-hover-detail': 'Show another channel here, or open one in its own tab', 'data-pmh': 'icon' },
        [chanText, ico('chevronDown', 12)]);
      chanBtn.addEventListener('click', function () {
        PMW.menu.open(chanBtn, { id: 'out-chan:' + api.id, title: 'Show channel', width: 300, rows: CHANNELS.map(function (c) {
          return { id: c.id, label: c.label, sub: c.sub, checked: c.id === channel,
            run: function (info) { if (info && info.alt) openSplitOff(c.id, 'panel'); else setChannel(c.id, true); },
            alt: { label: 'Open in new tab', icon: 'outputNewTab', run: function () { openSplitOff(c.id, 'tab'); } } };
        }) });
      });
    }
    var countEl = h('span', { class: 'pmw-tool-count', text: '' });
    function leftSpec() {
      return fixed ? [{ id: 'chan', icon: 'output', text: channelOf(channel).label, strong: true }, { id: 'count', el: countEl, dim: true }]
        : [{ id: 'chan', el: chanBtn }, { id: 'count', el: countEl, dim: true }];
    }
    function followDetail() { return follow ? 'New lines scroll into view' : 'Scroll to the end and follow new lines'; }
    function actions() {
      return [
        { id: 'follow', label: 'Follow', icon: FOLLOW_ICON, pressed: follow, detail: followDetail(), run: function () { setFollow(!follow); } },
        { id: 'clear', label: 'Clear', icon: CLEAR_ICON, detail: 'Clear this channel', run: clear },
        { id: 'more', label: 'More', icon: 'more', menu: function () {
          var rows = [
            { id: 'wrap', label: 'Wrap long lines', checked: wrap, run: function () { wrap = !wrap; root.classList.toggle('is-wrap', wrap); api.saveSoon(); } },
            { id: 'copy', label: 'Copy all', icon: 'link', run: function () { copyText(api, log.innerText, 'Output copied'); } },
            { id: 'doc', label: 'Open as a document', icon: 'file', sub: 'A read-only editor tab', run: function () {
              api.open({ kind: 'editor', text: log.innerText, language: 'text', title: outputLabel(channel), label: outputLabel(channel) });
            } }
          ];
          if (fixed) rows.push('-', { id: 'main', label: 'Show in the Output tab', icon: 'output', sub: 'Switch the Output tab to ' + channelOf(channel).label,
            run: function () { api.open({ kind: 'output', id: 'output', channel: channel }); } });
          else rows.push('-', { id: 'split', label: 'Open ' + channelOf(channel).label + ' in new tab', icon: 'outputNewTab', run: function () { openSplitOff(channel, 'tab'); } });
          return rows;
        } }
      ];
    }
    var row = api.headerRow({ label: 'Output controls', left: leftSpec(), actions: actions() });
    root.appendChild(row.el);
    var log = h('div', { class: 'pmw-tool-log', role: 'log', 'aria-live': 'off', tabindex: '0', 'data-pmh': 'off', 'data-pm-hover-exempt': 'true' });
    root.appendChild(log);
    var empty = h('p', { class: 'pmw-tool-empty', text: 'Nothing here yet. New lines appear while this tab is open.' });

    function openSplitOff(c, where) { api.open({ kind: 'output', id: splitOffId(c), channel: c, where: where }); }
    function cur() { return chans[channel]; }
    function script() { return SCRIPTS[channel] || { seed: 0, lines: [] }; }
    function setFollow(on) {
      follow = on;
      row.setAction('follow', { pressed: follow, detail: followDetail() });
      if (follow) log.scrollTop = log.scrollHeight;
      api.saveSoon();
    }
    function count() { var c = cur(); countEl.textContent = c && c.lines ? plural(c.lines, 'line', 'lines') : ''; }
    function append(lv, text) {
      if (empty.parentNode) empty.remove();
      var line = h('div', { class: 'pmw-tool-line is-' + lv }, [
        h('span', { class: 'pmw-tool-time', text: clock() }),
        h('span', { class: 'pmw-tool-lg' }, lv === 'error' || lv === 'warn' || lv === 'ok' ? [mark(lv, 12)] : null),
        h('span', { class: 'pmw-tool-text' }, [linkify(api, text)])
      ]);
      log.appendChild(line);
      var c = cur();
      c.lines += 1;
      while (log.childElementCount > OUT_CAP) { log.firstElementChild.remove(); c.lines -= 1; }
      count();
      if (follow) log.scrollTop = log.scrollHeight;
    }
    function clear() {
      log.textContent = '';
      cur().lines = 0;
      count();
      log.appendChild(empty);
      api.announce(outputLabel(channel) + ' cleared');
    }
    function step() {
      timer = 0;
      var sc = script();
      if (!sc.lines.length) return;
      var c = cur();
      var ln = sc.lines[c.at % sc.lines.length];
      c.at += 1;
      if (ln[0] === 'pause') { timer = setTimeout(step, ln[1]); return; }
      append(ln[0], ln[1]);
      timer = setTimeout(step, 260 + Math.round(Math.random() * 420));
    }
    function start() { if (!timer && shown && script().lines.length) timer = setTimeout(step, 700); }
    function stop() { clearTimeout(timer); timer = 0; }
    /* show `c` in the log: the channel on screen keeps its lines aside, the next one comes back as it was left */
    function showChannel(c) {
      if (chans[channel] && chans[channel] !== chans[c]) {
        var frag = document.createDocumentFragment();
        while (log.firstChild) frag.appendChild(log.firstChild);
        chans[channel].frag = frag;
      }
      channel = c;
      var rec = chans[c];
      if (!rec) {
        rec = chans[c] = { frag: null, at: 0, lines: 0 };
        var sc = script();
        log.textContent = '';
        for (var i = 0; i < sc.seed && i < sc.lines.length; i++) { if (sc.lines[i][0] !== 'pause') append(sc.lines[i][0], sc.lines[i][1]); }
        rec.at = sc.seed;
        if (!sc.lines.length) log.appendChild(empty);
      } else {
        log.textContent = '';
        if (rec.frag) log.appendChild(rec.frag);
        rec.frag = null;
        if (!log.firstChild) log.appendChild(empty);
      }
      count();
      chanText.textContent = channelOf(c).label;
      if (chanBtn) chanBtn.setAttribute('aria-label', 'Channel: ' + channelOf(c).label);
      log.setAttribute('aria-label', outputLabel(c));
      row.set({ left: leftSpec() });
      api.update({ label: fixed ? outputLabel(c) : 'Output', title: 'Output: ' + channelOf(c).label });
      if (follow) log.scrollTop = log.scrollHeight;
    }
    function setChannel(c, byUser) {
      if (!c || c === channel) return;
      stop();
      showChannel(c);
      start();
      api.saveSoon();
      if (byUser) api.announce('Output shows ' + channelOf(c).label);
    }
    log.addEventListener('scroll', function () {
      var atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
      if (follow !== atEnd) { follow = atEnd; row.setAction('follow', { pressed: follow, detail: followDetail() }); }
    });

    showChannel(channel);

    return {
      onShow: function () { shown = true; start(); },
      onHide: function () { shown = false; stop(); },
      onResize: function () { if (follow) log.scrollTop = log.scrollHeight; },
      focus: function () { log.focus({ preventScroll: true }); },
      /* an open of this tab with a channel (from the chat, a run, the catalog): the Output tab switches to it */
      reveal: function (s) { if (s && s.channel && !fixed) setChannel(String(s.channel), false); },
      serialize: function () { return { channel: channel, follow: follow, wrap: wrap }; },
      unmount: stop
    };
  }
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Problems                                                                                                            */
/* ------------------------------------------------------------------------------------------------------------------ */

var PROBLEMS = [
  { path: 'src/services/import.rs', items: [
    { sev: 'error', msg: 'mismatched types: expected `f32`, found `Option<Option<f32>>`', src: 'rustc E0308', line: 95, col: 23 },
    { sev: 'warn', msg: 'called `unwrap_or_default` on a regex match: a missing group parses as 0', src: 'clippy', line: 94, col: 39 },
    { sev: 'warn', msg: 'unused variable: `servings_hint`', src: 'rustc', line: 58, col: 9 }
  ] },
  { path: 'tests/analytics_query_test.rs', items: [
    { sev: 'error', msg: 'cannot find function `seed_events` in this scope', src: 'rustc E0425', line: 22, col: 5 }
  ] },
  { path: 'src/analytics/queries.rs', items: [
    { sev: 'warn', msg: 'unused import: `sqlx::Row`', src: 'rustc', line: 4, col: 5 }
  ] },
  { path: 'web/src/lib/RecipeCard.svelte', items: [
    { sev: 'warn', msg: 'A link that wraps only an image needs a text label', src: 'svelte-check a11y', line: 6, col: 3 },
    { sev: 'info', msg: '`recipe.thumb` can be undefined while the list loads', src: 'svelte-check', line: 6, col: 14 }
  ] }
];
/* the editor draws each one under the word it names (Problems to highlight, code.editing.diagnostics-visibility) */
PMW.problems = function () { return PROBLEMS; };
var SEV_ORDER = { error: 0, warn: 1, info: 2 };
var SEV_WORD = { error: 'Error', warn: 'Warning', info: 'Info' };
function problemCounts() {
  var c = { error: 0, warn: 0, info: 0 };
  PROBLEMS.forEach(function (f) { f.items.forEach(function (it) { c[it.sev] += 1; }); });
  return c;
}
function problemsSummary() {
  var c = problemCounts();
  return plural(c.error, 'error', 'errors') + ', ' + plural(c.warn, 'warning', 'warnings');
}

PM_HOME.registerKind('problems', {
  label: 'Problems', group: 'Tools', icon: 'problems', prefixes: [], min: { w: 280, h: 120 }, dedicated: true,
  idFor: function () { return 'problems'; },
  plus: { order: 71, group: 'tools', label: 'Problems', spec: function () { return { kind: 'problems' }; } },
  mount: function (host, st, api) {
    st = st || {};
    var show = Object.assign({ error: true, warn: true, info: true }, st.show || {});
    var collapsed = Object.assign({}, st.collapsed || {});
    var root = h('div', { class: 'pmw-tool pmw-tool-prob' });
    host.appendChild(root);

    function countsEl() {
      var c = problemCounts();
      var el = h('span', { class: 'pmw-tool-counts', 'aria-label': problemsSummary() + ', ' + plural(c.info, 'note', 'notes') });
      [['error', c.error], ['warn', c.warn], ['info', c.info]].forEach(function (p) {
        el.appendChild(h('span', { class: 'pmw-tool-cnt is-' + p[0] + (show[p[0]] ? '' : ' is-off') }, [mark(p[0], 13), h('b', { text: String(p[1]) })]));
      });
      return el;
    }
    function allCollapsed() { return PROBLEMS.every(function (f) { return collapsed[f.path]; }); }
    function actions() {
      var all = allCollapsed();
      return [
        { id: 'filter', label: 'Filter', icon: 'search', detail: 'Show errors, warnings or notes', menu: function () {
          return { id: 'prob-filter', title: 'Show', width: 240, align: 'end', rows: ['error', 'warn', 'info'].map(function (s) {
            return { id: s, label: s === 'error' ? 'Errors' : s === 'warn' ? 'Warnings' : 'Notes', checked: !!show[s], keepOpen: true,
              run: function () { show[s] = !show[s]; paint(); api.saveSoon(); } };
          }) };
        } },
        { id: 'fold', label: all ? 'Expand all' : 'Collapse all', icon: all ? 'chevronDown' : 'chevronRight', run: function () {
          var c = !allCollapsed();
          PROBLEMS.forEach(function (f) { collapsed[f.path] = c; });
          paint(); api.saveSoon();
        } },
        { id: 'recheck', label: 'Check again', icon: 'reload', detail: 'Run the checks again', run: function () {
          list.classList.add('is-checking');
          setTimeout(function () { list.classList.remove('is-checking'); api.announce('Checked: ' + problemsSummary()); PMW.toast('Checked: ' + problemsSummary()); }, PMW.reduced() ? 0 : 420);
        } }
      ];
    }
    var row = api.headerRow({ label: 'Problems controls', left: [{ id: 'counts', el: countsEl() }], actions: actions() });
    root.appendChild(row.el);
    var list = h('div', { class: 'pmw-tool-list', role: 'tree', 'aria-label': 'Problems', 'data-pmh': 'off' });
    root.appendChild(list);

    function paint() {
      var focusKey = document.activeElement && list.contains(document.activeElement) ? document.activeElement.getAttribute('data-key') : null;
      list.textContent = '';
      var any = false;
      PROBLEMS.forEach(function (f) {
        var items = f.items.filter(function (it) { return show[it.sev]; }).sort(function (a, b) { return SEV_ORDER[a.sev] - SEV_ORDER[b.sev] || a.line - b.line; });
        if (!items.length) return;
        any = true;
        var open = !collapsed[f.path];
        var dir = f.path.indexOf('/') >= 0 ? f.path.slice(0, f.path.lastIndexOf('/')) : '';
        var fb = h('button', { type: 'button', class: 'pmw-tool-file pmw-cur', role: 'treeitem', 'aria-expanded': open ? 'true' : 'false', 'data-key': f.path, 'data-pmh': 'row',
          'data-pm-hover-visual-suppressed': 'true' }, [
          h('span', { class: 'pmw-tool-tw', 'aria-hidden': 'true' }, [ico(open ? 'chevronDown' : 'chevronRight', 12)]),
          PMW.kindIcon('file'),
          h('b', { class: 'pmw-tool-fname', text: f.path.split('/').pop() }),
          h('span', { class: 'pmw-tool-fdir', text: dir }),
          h('span', { class: 'pmw-tool-fcount', text: String(items.length) })
        ]);
        fb.addEventListener('click', function () { collapsed[f.path] = open; paint(); api.saveSoon(); });
        list.appendChild(fb);
        if (!open) return;
        items.forEach(function (it, i) {
          var o = fileOpener(api, f.path, it.line, it.col);
          var pb = h('button', { type: 'button', class: 'pmw-tool-prow pmw-cur', role: 'treeitem', 'data-key': f.path + ':' + i, 'data-pmh': 'row',
            'aria-label': SEV_WORD[it.sev] + ': ' + it.msg + '. ' + f.path.split('/').pop() + ' line ' + it.line,
            'data-pm-hover-label': 'Open at line ' + it.line, 'data-pm-hover-detail': 'Double click keeps the tab; Alt+click opens a new panel' }, [
            mark(it.sev, 13),
            h('span', { class: 'pmw-tool-pmsg', text: it.msg }),
            h('span', { class: 'pmw-tool-psrc', text: it.src }),
            h('span', { class: 'pmw-tool-ppos', text: 'Ln ' + it.line + ', Col ' + it.col })
          ]);
          pb.addEventListener('click', o.click);
          pb.addEventListener('dblclick', o.dbl);
          list.appendChild(pb);
        });
      });
      if (!any) list.appendChild(h('p', { class: 'pmw-tool-empty', text: 'Nothing to show with these filters.' }));
      row.set({ left: [{ id: 'counts', el: countsEl() }], actions: actions() });
      api.update({ label: 'Problems', title: 'Problems: ' + problemsSummary() });
      if (focusKey) { var back = list.querySelector('[data-key="' + focusKey.replace(/"/g, '') + '"]'); if (back) back.focus({ preventScroll: true }); }
    }
    list.addEventListener('keydown', function (e) {
      var rows = Array.prototype.slice.call(list.querySelectorAll('button[role="treeitem"]'));
      var at = rows.indexOf(document.activeElement);
      if (at < 0) return;
      var cur = rows[at];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var nx = rows[at + (e.key === 'ArrowDown' ? 1 : -1)]; if (nx) nx.focus(); }
      else if (e.key === 'Home') { e.preventDefault(); rows[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); rows[rows.length - 1].focus(); }
      else if (cur.classList.contains('pmw-tool-file') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        var want = e.key === 'ArrowLeft';
        var key = cur.getAttribute('data-key');
        if (!!collapsed[key] !== want) { e.preventDefault(); collapsed[key] = want; paint(); api.saveSoon(); }
      }
    });
    paint();
    return {
      focus: function () { var f = list.querySelector('button'); if (f) f.focus({ preventScroll: true }); },
      serialize: function () { return { show: show, collapsed: collapsed }; }
    };
  }
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Ports                                                                                                               */
/* ------------------------------------------------------------------------------------------------------------------ */

var PORTS = [
  { port: 5173, name: 'tastebook-web', proc: 'vite dev server', addr: 'localhost:5173', url: 'http://localhost:5173/', origin: 'Found automatically', web: true },
  { port: 8080, name: 'tastebook-api', proc: 'cargo run', addr: 'localhost:8080', url: 'http://localhost:8080/health', origin: 'Found automatically', web: true },
  { port: 5432, name: 'postgres', proc: 'database', addr: 'localhost:5432', origin: 'Added by you', web: false },
  { port: 54112, name: 'debugger', proc: 'tastebook-api debug session', addr: '127.0.0.1:54112', origin: 'Found automatically', web: false }
];

PM_HOME.registerKind('ports', {
  label: 'Ports', group: 'Tools', icon: 'ports', prefixes: [], min: { w: 280, h: 120 }, dedicated: true,
  idFor: function () { return 'ports'; },
  plus: { order: 72, group: 'tools', label: 'Ports', spec: function () { return { kind: 'ports' }; } },
  mount: function (host, st, api) {
    st = st || {};
    var extra = Array.isArray(st.extra) ? st.extra.slice(0, 20) : [];
    var removed = Array.isArray(st.removed) ? st.removed.slice() : [];
    var root = h('div', { class: 'pmw-tool pmw-tool-ports' });
    host.appendChild(root);
    function ports() { return PORTS.concat(extra).filter(function (p) { return removed.indexOf(p.port) < 0; }); }
    var countEl = h('span', { class: 'pmw-tool-count' });
    var row = api.headerRow({ label: 'Ports controls', left: [{ id: 'count', el: countEl }], actions: [
      { id: 'add', label: 'Forward a port', icon: 'plus', detail: 'Make a port on this machine reachable here', run: function (e, btn) {
        PMW.menu.prompt(btn, { title: 'Forward a port', value: '3000', ok: 'Forward', done: function (v) {
          var n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
          if (!n || n < 1 || n > 65535) { PMW.toast('A port is a number from 1 to 65535.'); return; }
          if (ports().some(function (p) { return p.port === n; })) { PMW.toast('Port ' + n + ' is already forwarded.'); return; }
          var ri = removed.indexOf(n);
          if (ri >= 0 && PORTS.some(function (p) { return p.port === n; })) removed.splice(ri, 1);
          else extra.push({ port: n, name: '', proc: 'Nothing is listening yet', addr: 'localhost:' + n, url: 'http://localhost:' + n + '/', origin: 'Added by you', web: true });
          paint(); api.saveSoon();
          api.announce('Port ' + n + ' forwarded');
        } });
      } }
    ] });
    root.appendChild(row.el);
    var table = h('div', { class: 'pmw-tool-ptable', role: 'table', 'aria-label': 'Forwarded ports', 'data-pmh': 'off' });
    root.appendChild(h('div', { class: 'pmw-tool-scroll' }, [table]));

    function btn(label, iconName, detail, run, o) {
      o = o || {};
      var b = h('button', { type: 'button', class: 'pmw-tool-btn' + (o.iconOnly ? ' is-icon' : ''), 'data-pmh': 'icon', 'aria-label': o.aria || label,
        'data-pm-hover-label': label, 'data-pm-hover-detail': detail || '' }, [ico(iconName, 14), o.iconOnly ? null : h('span', { class: 'pmw-tool-btnl', text: label })]);
      if (o.disabled) { b.setAttribute('aria-disabled', 'true'); b.setAttribute('data-pm-hover-detail', o.disabled); }
      b.addEventListener('click', function (e) { if (b.getAttribute('aria-disabled') === 'true') { PMW.toast(o.disabled); return; } run(e); });
      return b;
    }
    function paint() {
      var list = ports();
      countEl.textContent = list.length ? plural(list.length, 'forwarded port', 'forwarded ports') : 'No forwarded ports';
      table.textContent = '';
      table.appendChild(h('div', { class: 'pmw-tool-tr is-head', role: 'row' }, ['Port', 'Address', 'Running', 'Origin', ''].map(function (c) { return h('span', { role: 'columnheader', text: c }); })));
      list.forEach(function (p) {
        var open = btn('Open in browser', 'browser', 'Shows this address in a Browser tab; Alt+click opens a new panel', function (e) {
          api.open({ kind: 'browser', url: p.url, where: e.altKey ? 'panel' : 'auto' });
        }, { disabled: p.web ? null : 'Not a web page: nothing to show in a browser' });
        var copy = btn('Copy address', 'link', 'Copies this address', function () { copyText(api, p.web ? p.url : p.addr, 'Address copied'); }, { iconOnly: true });
        var stop = btn('Stop forwarding', 'close', 'Port ' + p.port + ' stops being reachable here', function () {
          removed.push(p.port);
          extra = extra.filter(function (x) { return x.port !== p.port; });
          paint(); api.saveSoon();
          api.announce('Stopped forwarding port ' + p.port);
        }, { iconOnly: true });
        table.appendChild(h('div', { class: 'pmw-tool-tr', role: 'row' }, [
          h('span', { role: 'cell', class: 'pmw-tool-port' }, [h('b', { text: String(p.port) }), p.name ? h('span', { text: p.name }) : null]),
          h('span', { role: 'cell', class: 'pmw-tool-addr', text: p.addr }),
          h('span', { role: 'cell', class: 'pmw-tool-proc', text: p.proc }),
          h('span', { role: 'cell', class: 'pmw-tool-origin', text: p.origin }),
          h('span', { role: 'cell', class: 'pmw-tool-acts' }, [open, copy, stop])
        ]));
      });
      if (!list.length) table.appendChild(h('p', { class: 'pmw-tool-empty', text: 'No ports are forwarded. Use Forward a port to add one.' }));
    }
    paint();
    api.update({ label: 'Ports', title: 'Ports: ' + countEl.textContent });
    return {
      focus: function () { var f = table.querySelector('button'); if (f) f.focus({ preventScroll: true }); },
      serialize: function () { return { extra: extra, removed: removed }; }
    };
  }
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Debug Console                                                                                                       */
/* ------------------------------------------------------------------------------------------------------------------ */

/* D33 (Jared): "One Debug tab with a sub-tab per debug session." The tab id is 'debug-console' and the session on
   screen is its view state (serialize: session), switched inside the tab the way Output (D31) switches its channel: a
   row of sub-tabs in the header row, one per debug session, each the session's name and its state in plain words with
   the state dot. It is a real tablist (roving tabindex; Left, Right, Home and End move and choose; Enter and Space
   choose) whose chosen sub-tab is filled on its own box (the lead's ruling of 2026-10-10: no underline, which DR-069,
   F3-648 and D5 ban): DL-162's tab ink, Retro's reverse video, NieR's ink block, and the fill moves in the look's own
   tab-change voice (instant under Reduced Motion). The header row's actions and the input line act on the chosen session; each
   session keeps its own console and its own state while another one is on screen. PM_HOME.open({ kind:
   'debug-console', session }) reveals the tab and switches it (reveal). The ids of the old one-tab-per-session shape,
   'debug-console:<session>', fold into this tab with that session chosen wherever they turn up (opens, saved and named
   layouts, the reopen list: the kind's fold, CONTRACT section 3). */
var SESSIONS = [
  { id: 'main', name: 'tastebook-api', how: 'cargo run', mode: 'paused', pid: 88431, thread: 'main',
    bp: 'src/services/import.rs:95', pauseAt: 'src/services/import.rs:31', pauseThread: 'worker-2',
    boot: ['     Running `target/debug/tastebook-api`', 'listening on http://127.0.0.1:8080'],
    run: ['import job 91: fetched 48 KB from seriouseats.com', 'import job 91: parsed 14 ingredients'],
    seed: [
      ['dbg', 'Debugger attached to tastebook-api (process 88431)'],
      ['out', '    Finished `dev` profile [unoptimized + debuginfo] target(s) in 8.42s'],
      ['out', '     Running `target/debug/tastebook-api`'],
      ['out', 'listening on http://127.0.0.1:8080'],
      ['err', 'warning: unused variable `servings_hint`'],
      ['dbg', 'Paused on a breakpoint at src/services/import.rs:95 (thread main)'],
      ['in', 'raw'], ['res', '"1 1/2 cup"'],
      ['in', 'qty.value'], ['res', '11.5'],
      ['in', 'caps.get(2)'], ['res', 'None']
    ],
    /* what the paused frame knows (the import worker reading "1 1/2 cup") */
    frame: {
      'raw': '"1 1/2 cup"',
      's': '"1 1/2 cup"',
      'qty': 'Quantity { value: 11.5, unit: Some("cup") }',
      'qty.value': '11.5',
      'qty.unit': 'Some("cup")',
      'whole': '11.0',
      'frac': '0.5',
      'caps': 'Captures { 0: "11/2 cup", 1: "11", 2: None, 3: None, 4: "cup" }',
      'caps.get(1)': 'Some(Match { start: 0, end: 2, text: "11" })',
      'caps.get(2)': 'None',
      'job': 'ImportJob { id: 91, url: "seriouseats.com/recipe/pan-pizza", attempt: 1 }',
      'job.id': '91',
      'job.url': '"seriouseats.com/recipe/pan-pizza"',
      'job.attempt': '1',
      'recipe.title': '"Pan Pizza"',
      'line': '3',
      's.trim()': '"1 1/2 cup"',
      's.len()': '9'
    } },
  /* the import worker drains the queue while the API sits on its breakpoint: running, so it streams while the tab is on
     screen; a Pause lands in the mixed-fraction parser the run #47 fix rewrote */
  { id: 'worker', name: 'import-worker', how: 'cargo run -p import-worker', mode: 'running', pid: 88502, thread: 'queue-1',
    bp: null, pauseAt: 'src/services/import/normalize_units/mixed_fractions.rs:19', pauseThread: 'queue-1',
    boot: ['     Running `target/debug/import-worker`', 'import queue: 4 jobs waiting'],
    seed: [
      ['dbg', 'Debugger attached to import-worker (process 88502)'],
      ['out', '     Running `target/debug/import-worker`'],
      ['out', 'import queue: 4 jobs waiting'],
      ['out', 'import job 92: fetched 31 KB from bonappetit.com'],
      ['out', 'import job 92: parsed 9 ingredients, 9 quantities'],
      ['out', 'import job 92: saved "Buttermilk Pancakes"']
    ],
    loop: [
      'import job 93: fetched 22 KB from smittenkitchen.com',
      'import job 93: parsed 11 ingredients, 11 quantities',
      'import job 93: saved "Cream Scones"',
      'import queue: 2 jobs waiting',
      'import job 94: fetched 40 KB from seriouseats.com',
      'import job 94: parsed 16 ingredients, 15 quantities',
      'import job 94: kept "a pinch of salt" as written',
      'import job 94: saved "Weeknight Ragu"',
      'import queue: 1 job waiting'
    ],
    frame: {
      'raw': '"2 3/4"',
      's': '"2 3/4"',
      'whole': '"2"',
      'frac': '"3/4"',
      'w': '2.0',
      'parse_simple(frac)': 'Some(0.75)',
      'job': 'ImportJob { id: 95, url: "kingarthurbaking.com/recipes/scones", attempt: 1 }',
      'job.id': '95',
      'job.url': '"kingarthurbaking.com/recipes/scones"',
      'job.attempt': '1',
      'queue.len()': '1',
      's.trim()': '"2 3/4"',
      's.len()': '5'
    } }
];
function sessionOf(sid) { for (var i = 0; i < SESSIONS.length; i++) if (SESSIONS[i].id === sid) return SESSIONS[i]; return null; }
var DBG_WORD = { paused: 'Paused', running: 'Running', ended: 'Ended' };
var DBG_DOT = { paused: 'is-warn', running: 'is-ok', ended: 'is-dim' };
var DBG_CAP = 400;
function splitLoc(at) { var m = /^(.*):(\d+)$/.exec(String(at || '')); return m ? { path: m[1], line: +m[2] } : { path: String(at || ''), line: null }; }
function shortLoc(at) { var p = splitLoc(at); return p.path.split('/').pop() + (p.line ? ':' + p.line : ''); }
/* a small arithmetic reader (numbers, + - * / %, parentheses); never eval */
function arith(src) {
  var i = 0, s = src.replace(/\s+/g, '');
  function num() {
    var m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error('x');
    i += m[0].length; return parseFloat(m[0]);
  }
  function atom() {
    if (s[i] === '(') { i++; var v = expr(); if (s[i] !== ')') throw new Error('x'); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    return num();
  }
  function term() {
    var v = atom();
    while (s[i] === '*' || s[i] === '/' || s[i] === '%') { var op = s[i++], r = atom(); v = op === '*' ? v * r : op === '/' ? v / r : v % r; }
    return v;
  }
  function expr() {
    var v = term();
    while (s[i] === '+' || s[i] === '-') { var op = s[i++], r = term(); v = op === '+' ? v + r : v - r; }
    return v;
  }
  var out = expr();
  if (i !== s.length) throw new Error('x');
  return out;
}
/* an expression in a paused frame: a name the frame knows, a literal, or arithmetic over numbers and the frame's
   numeric values (whole + frac, qty.value * 2) */
function evaluate(src, frame) {
  var has = function (k) { return Object.prototype.hasOwnProperty.call(frame, k); };
  var e = src.trim().replace(/;$/, '');
  if (!e) return null;
  if (has(e)) return { ok: true, text: frame[e] };
  if (/^"[^"]*"$/.test(e)) return { ok: true, text: e };
  if (e === 'true' || e === 'false') return { ok: true, text: e };
  var unknown = null;
  var subst = e.replace(/[A-Za-z_][\w.]*(\(\d*\))?/g, function (name) {
    var v = has(name) ? frame[name] : null;
    if (v != null && /^-?\d+(\.\d+)?$/.test(v)) return '(' + v + ')';
    if (!unknown) unknown = name;
    return name;
  });
  if (!unknown && subst !== e) e = subst;
  if (/^[\d\s+\-*/%().]+$/.test(e)) {
    try { var v = arith(e); return isFinite(v) ? { ok: true, text: String(Math.round(v * 1e6) / 1e6) } : { ok: false, text: 'attempt to divide by zero' }; }
    catch (_) { return { ok: false, text: 'expected an expression' }; }
  }
  var id = /^[A-Za-z_]\w*/.exec(e);
  if (id && !has(id[0])) return { ok: false, text: 'cannot find value `' + id[0] + '` in this scope' };
  return { ok: false, text: 'no field or method `' + e.replace(/^[A-Za-z_]\w*\.?/, '') + '` here' };
}

PM_HOME.registerKind('debug-console', {
  label: 'Debug Console', group: 'Tools', icon: 'console', prefixes: ['debug-console:', 'debug-console'], min: { w: 280, h: 120 }, dedicated: true,
  idFor: function () { return 'debug-console'; },
  /* the old one-tab-per-session ids: the one tab, with that session chosen */
  fold: function (id) { var m = /^debug-console:(.+)$/.exec(String(id || '')); return m ? { id: 'debug-console', state: { session: m[1] } } : null; },
  labelFor: function () { return 'Debug Console'; },
  plus: { order: 73, group: 'tools', label: 'Debug Console', spec: function () { return { kind: 'debug-console' }; } },
  mount: function (host, st, api) {
    st = st || {};
    var cur = sessionOf(st.session) ? String(st.session) : SESSIONS[0].id;
    var hist = Array.isArray(st.history) ? st.history.slice(-30) : [];
    var hAt = hist.length;
    var shown = false, offs = [];
    var base = PMW.uid('pmw-dbg-');
    var root = h('div', { class: 'pmw-tool pmw-tool-dbg' });
    host.appendChild(root);

    /* one record per session: its sub-tab, its console (a tabpanel) and its live state */
    var recs = {};
    var tabsEl = h('div', { class: 'pmw-tool-stabs pmw-ink-row', role: 'tablist', 'aria-label': 'Debug sessions' });
    var ink = PMW.frames.ink(tabsEl);
    var panes = h('div', { class: 'pmw-tool-dpanes' });
    SESSIONS.forEach(function (s) {
      var r = recs[s.id] = { s: s, mode: s.mode, where: s.mode === 'paused' ? (s.bp || s.pauseAt) : null, timers: [], stream: 0, loopAt: 0, follow: true, top: 0 };
      r.dot = h('i', { class: 'pmw-tool-sdot', 'aria-hidden': 'true' });
      r.word = h('span', { class: 'pmw-tool-sword' });
      r.tab = h('button', { type: 'button', role: 'tab', id: base + '-' + s.id, class: 'pmw-tool-stab pmw-ink-opt', tabindex: '-1', 'aria-selected': 'false',
        'aria-controls': base + '-' + s.id + '-pane', 'data-session': s.id, 'data-pmh': 'icon', 'data-pmh-tag': 'literal' },
        [r.dot, h('span', { class: 'pmw-tool-sname', text: s.name }), r.word]);
      r.tab.addEventListener('click', function () { select(s.id, { user: true }); });
      tabsEl.appendChild(r.tab);
      r.log = h('div', { class: 'pmw-tool-log pmw-tool-con', role: 'log', 'aria-live': 'off', 'aria-label': s.name + ' console', tabindex: '0', 'data-pmh': 'off', 'data-pm-hover-exempt': 'true' });
      r.pane = h('div', { class: 'pmw-tool-dpane', role: 'tabpanel', id: base + '-' + s.id + '-pane', 'aria-labelledby': base + '-' + s.id, hidden: true }, [r.log]);
      r.log.addEventListener('scroll', function () { if (!r.pane.hidden) r.follow = r.log.scrollHeight - r.log.scrollTop - r.log.clientHeight < 24; });
      r.log.addEventListener('click', function (e) { if (!e.target.closest('button') && !window.getSelection().toString()) input.focus({ preventScroll: true }); });
      panes.appendChild(r.pane);
    });
    /* Left and Right (wrapping), Home and End move to a session and choose it (automatic activation: the console is
       already drawn); Enter and Space choose the one with focus */
    tabsEl.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var ids = SESSIONS.map(function (s) { return s.id; });
      var i = ids.indexOf(e.target && e.target.getAttribute ? e.target.getAttribute('data-session') : null);
      if (i < 0) return;
      var n = ids.length;
      var to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
      if (to >= 0) { e.preventDefault(); select(ids[to], { user: true, focus: true }); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(ids[i], { user: true }); }
    });

    /* where the chosen session is paused: a D7 file reference (click previews, double click keeps, Alt opens a new
       panel), shown only while it is paused */
    var atBtn = h('button', { type: 'button', class: 'pmw-tool-flink pmw-tool-dat', 'data-pmh': 'off', 'data-pmh-tag': 'literal' });
    atBtn.addEventListener('click', function (e) {
      var w = recs[cur].where; if (!w) return;
      var p = splitLoc(w); fileOpener(api, p.path, p.line).click(e);
    });
    atBtn.addEventListener('dblclick', function () {
      var w = recs[cur].where; if (!w) return;
      var p = splitLoc(w); fileOpener(api, p.path, p.line).dbl();
    });
    function left() {
      var r = recs[cur];
      var out = [{ id: 'sessions', el: tabsEl, grow: true }];
      if (r.mode === 'paused' && r.where) {
        setText(atBtn, shortLoc(r.where));
        atBtn.setAttribute('aria-label', 'Paused at ' + r.where + '. Open it');
        atBtn.setAttribute('data-pm-hover-label', r.where);
        atBtn.setAttribute('data-pm-hover-detail', 'Where ' + r.s.name + ' is paused. Click previews the file; double-click keeps it open.');
        out.push({ id: 'at', el: atBtn, icon: 'target', mono: true });
      }
      return out;
    }
    function actions() {
      var m = recs[cur].mode;
      var act = function (fn) { return function () { fn(recs[cur]); }; };
      return [
        m === 'running' ? { id: 'pause', label: 'Pause', icon: 'pause', run: act(pause) }
          : { id: 'cont', label: m === 'ended' ? 'Start' : 'Continue', icon: 'play', run: act(function (r) { if (r.mode === 'ended') restart(r); else cont(r); }) },
        { id: 'restart', label: 'Restart', icon: 'reload', disabled: m === 'ended', run: act(restart) },
        { id: 'stop', label: 'Stop', icon: 'stop', disabled: m === 'ended', danger: m !== 'ended', run: act(stopSession) },
        { id: 'clear', label: 'Clear', icon: CLEAR_ICON, detail: 'Clear this session’s console', run: act(clear) }
      ];
    }
    /* the sub-tabs and the session facts cost the buttons their words below 820 px */
    var row = api.headerRow({ label: 'Debug controls', left: left(), actions: actions(), labelsAt: 820 });
    root.appendChild(row.el);
    root.appendChild(panes);
    var input = h('input', { type: 'text', class: 'pmw-tool-in', spellcheck: 'false', autocomplete: 'off', 'data-pmh': 'off',
      'data-pm-hover-label': 'Evaluate', 'data-pm-hover-detail': 'Type an expression and press Enter; Up and Down bring back earlier ones' });
    var inRow = h('label', { class: 'pmw-tool-inrow' }, [h('span', { class: 'pmw-tool-prompt', 'aria-hidden': 'true', text: '›' }), input]);
    root.appendChild(inRow);

    /* The chosen sub-tab's fill is its own box and one ink carries it from box to box on a change, in the look's own
       tab-change voice (the chosen fill: 45-frames.css and PMW.frames.ink in 27-frames.js, shared with every segmented
       toggle). The ink only travels while the tab is on screen. */
    function paintTab(r) {
      r.tab.setAttribute('data-mode', r.mode);
      r.dot.className = 'pmw-tool-sdot ' + DBG_DOT[r.mode];
      setText(r.word, DBG_WORD[r.mode]);
      r.tab.setAttribute('data-pm-hover-label', r.s.name);
      r.tab.setAttribute('data-pm-hover-detail', r.s.how + ' · ' + (r.mode === 'paused' && r.where ? 'paused at ' + r.where : r.mode === 'running' ? 'running' : 'ended'));
    }
    function setText(el, t) { if (el.textContent !== t) el.textContent = t; }
    function refresh() {
      var r = recs[cur];
      SESSIONS.forEach(function (s) { paintTab(recs[s.id]); });
      row.set({ left: left(), actions: actions() });
      input.placeholder = r.mode === 'paused' ? 'Evaluate an expression in the paused frame' : r.mode === 'running' ? 'Pause the program to evaluate' : 'Start the session to evaluate';
      input.setAttribute('aria-label', 'Evaluate an expression in ' + r.s.name);
      root.setAttribute('data-mode', r.mode);
      var busy = SESSIONS.some(function (s) { return recs[s.id].mode === 'running'; });
      api.update({ busy: busy, title: 'Debug Console: ' + r.s.name + ', ' + DBG_WORD[r.mode].toLowerCase() });
    }
    /* choose a session: its sub-tab, its console and the actions; the console comes back where it was left */
    function select(sid, o) {
      o = o || {};
      if (!recs[sid]) return false;
      var prev = recs[cur], changed = sid !== cur;
      if (changed && !prev.pane.hidden) prev.top = prev.log.scrollTop;
      cur = sid;
      var r = recs[sid];
      SESSIONS.forEach(function (s) {
        var x = recs[s.id], on = s.id === sid;
        x.tab.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tab.tabIndex = on ? 0 : -1;
        x.pane.hidden = !on;
      });
      r.log.scrollTop = r.follow ? r.log.scrollHeight : r.top;
      if (o.focus) r.tab.focus({ preventScroll: true });
      refresh();
      if (!changed) return true;
      if (o.instant || !shown) ink.stop(); else ink.move(prev.tab, r.tab);
      if (!o.instant) PMW.motion.animate(r.pane, [{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { dur: 170, easing: PMW.motion.ease('out') });
      api.saveSoon();
      if (!o.user) api.announce('Debug Console shows ' + r.s.name);
      return true;
    }
    function line(r, kind, text) {
      var el = h('div', { class: 'pmw-tool-cl is-' + kind }, [
        h('span', { class: 'pmw-tool-clg', 'aria-hidden': 'true' }, kind === 'in' ? '›' : kind === 'err' || kind === 'rerr' ? [mark(kind === 'err' ? 'warn' : 'error', 12)] : null),
        h('span', { class: 'pmw-tool-ct' }, [linkify(api, text)])
      ]);
      r.log.appendChild(el);
      while (r.log.childElementCount > DBG_CAP) r.log.firstElementChild.remove();
      if (r.follow && !r.pane.hidden) r.log.scrollTop = r.log.scrollHeight;
    }
    function later(r, ms, fn) { var t = setTimeout(fn, PMW.reduced() ? Math.min(ms, 60) : ms); r.timers.push(t); }
    function clearTimers(r) { r.timers.forEach(clearTimeout); r.timers = []; stopStream(r); }
    /* a running session with a loop prints while the tab is on screen */
    function streamStep(r) {
      r.stream = 0;
      if (r.mode !== 'running' || !shown || !r.s.loop) return;
      line(r, 'out', r.s.loop[r.loopAt % r.s.loop.length]);
      r.loopAt += 1;
      r.stream = setTimeout(function () { streamStep(r); }, 1400 + Math.round(Math.random() * 1600));
    }
    function startStream(r) { if (!r.stream && r.mode === 'running' && shown && r.s.loop) r.stream = setTimeout(function () { streamStep(r); }, 900); }
    function stopStream(r) { clearTimeout(r.stream); r.stream = 0; }
    function pausedOnBreakpoint(r) {
      line(r, 'dbg', 'Paused on a breakpoint at ' + r.s.bp + ' (thread ' + r.s.thread + ')');
      r.mode = 'paused'; r.where = r.s.bp; refresh();
      api.announce(r.s.name + ' paused on a breakpoint');
    }
    function cont(r) {
      clearTimers(r);
      r.mode = 'running'; r.where = null; refresh();
      line(r, 'dbg', 'Continued');
      if (!r.s.bp) { startStream(r); return; }
      (r.s.run || []).forEach(function (t, i) { later(r, 500 + i * 600, function () { line(r, 'out', t); }); });
      later(r, 1900, function () { pausedOnBreakpoint(r); });
    }
    function pause(r) {
      clearTimers(r);
      line(r, 'dbg', 'Paused at ' + r.s.pauseAt + ' (thread ' + r.s.pauseThread + ')');
      r.mode = 'paused'; r.where = r.s.pauseAt; refresh();
      api.announce(r.s.name + ' paused');
    }
    function restart(r) {
      clearTimers(r);
      line(r, 'dbg', (r.mode === 'ended' ? 'Starting ' : 'Restarting ') + r.s.name);
      r.mode = 'running'; r.where = null; refresh();
      r.s.boot.forEach(function (t, i) { later(r, 600 + i * 400, function () { line(r, 'out', t); }); });
      if (r.s.bp) later(r, 1700, function () { pausedOnBreakpoint(r); });
      else later(r, 600 + r.s.boot.length * 400, function () { startStream(r); });
    }
    function stopSession(r) {
      clearTimers(r);
      line(r, 'dbg', 'Session ended, exit code 0');
      r.mode = 'ended'; r.where = null; refresh();
      api.announce(r.s.name + ' debug session ended');
    }
    function clear(r) { r.log.textContent = ''; api.announce(r.s.name + ' console cleared'); }
    input.addEventListener('keydown', function (e) {
      var r = recs[cur];
      if (e.key === 'Enter') {
        e.preventDefault();
        var src = input.value;
        if (!src.trim()) return;
        hist.push(src); if (hist.length > 30) hist.shift(); hAt = hist.length;
        input.value = '';
        r.follow = true;
        line(r, 'in', src);
        api.saveSoon();
        if (r.mode !== 'paused') {
          var why = r.mode === 'running' ? 'The program is running. Pause it to evaluate expressions.' : 'No session. Start one to evaluate expressions.';
          line(r, 'rerr', why); api.announce(why); return;
        }
        var res = evaluate(src, r.s.frame || {});
        if (res) { line(r, res.ok ? 'res' : 'rerr', res.text); api.announce(res.text); }
      } else if (e.key === 'ArrowUp') {
        if (!hist.length) return;
        e.preventDefault(); hAt = Math.max(0, hAt - 1); input.value = hist[hAt] || '';
      } else if (e.key === 'ArrowDown') {
        if (!hist.length) return;
        e.preventDefault(); hAt = Math.min(hist.length, hAt + 1); input.value = hist[hAt] || '';
      } else if (e.key === 'Escape' && input.value) {
        e.preventDefault(); e.stopPropagation(); input.value = '';
      }
    });

    SESSIONS.forEach(function (s) { s.seed.forEach(function (l) { line(recs[s.id], l[0], l[1]); }); });
    select(cur, { instant: true, user: true });
    api.update({ label: 'Debug Console' });
    // a look changes the sub-tabs' face and voice (NieR's caption, Retro's code face): a move in flight ends at once
    offs.push(api.on('look', ink.stop));

    return {
      focus: function () { input.focus({ preventScroll: true }); },
      wantsKey: function (e) { return e.key === 'Escape' && document.activeElement === input && !!input.value; },
      /* an open of this tab with a session (the catalog, an old 'debug-console:<session>' id): switch to it */
      reveal: function (f) { if (f && f.session != null && sessionOf(String(f.session))) select(String(f.session), {}); },
      serialize: function () { return { session: cur, history: hist.slice(-20) }; },
      onResize: function () { ink.stop(); },
      onShow: function () { shown = true; SESSIONS.forEach(function (s) { startStream(recs[s.id]); }); },
      onHide: function () { shown = false; ink.stop(); SESSIONS.forEach(function (s) { stopStream(recs[s.id]); }); },
      unmount: function () { ink.stop(); SESSIONS.forEach(function (s) { clearTimers(recs[s.id]); }); offs.forEach(function (f) { try { f(); } catch (_) {} }); }
    };
  }
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* The catalog (Ctrl+P, the "+" pickers): a channel or a session switches its one tab (D31, D33)                     */
/* ------------------------------------------------------------------------------------------------------------------ */

PM_HOME.catalog.add('output', CHANNELS.map(function (c) {
  return { id: 'output:' + c.id, label: outputLabel(c.id), sub: c.sub, icon: 'output', keywords: 'output log ' + c.label, spec: { kind: 'output', channel: c.id } };
}));
PM_HOME.catalog.add('problems', [{ id: 'problems', label: 'Problems', sub: problemsSummary(), icon: 'problems', keywords: 'errors warnings diagnostics', spec: { kind: 'problems' } }]);
PM_HOME.catalog.add('ports', [{ id: 'ports', label: 'Ports', sub: PORTS.length + ' forwarded', icon: 'ports', keywords: 'ports forwarded localhost', spec: { kind: 'ports' } }]);
PM_HOME.catalog.add('debug-console', SESSIONS.map(function (s) {
  return { id: 'debug-console:' + s.id, label: 'Debug Console · ' + s.name, sub: s.how, icon: 'console', keywords: 'debug console evaluate repl session ' + s.name,
    spec: { kind: 'debug-console', session: s.id, label: 'Debug Console' } };
}));
