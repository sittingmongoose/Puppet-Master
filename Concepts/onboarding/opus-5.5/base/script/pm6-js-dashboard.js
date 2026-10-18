
(function () {
  'use strict';
  /* ==========================================================
     PMConcept6 — Dashboard page runtime
     - 4 default widgets rendered live from PM_DEMO state
     - CTA cards (hitl_approval on run.gate, usage warning ambient)
     - Add Widget catalog (8 entries, all insert + render)
     - drag-to-reorder + edge-resize + grid snap (in-memory)
     - Tastebook editor content (static fallback in markup,
       richer bodies rendered here / from PM_DEMO_TEXT.files)
     ========================================================== */

  var D = {
    gateId: null,
    gateOpen: false,
    paused: false,
    complete: false,
    pct: 62,
    nodesDone: 23,
    cooldown: 41 * 60 + 12,
    usagePct: 78,
    metricIdx: 0,
    added: {},                 // catalog kind -> true
    layoutKey: 'widget_layout:v1:dashboard' // in-memory only; reload = pristine
  };

  function root() { return document.getElementById('panel-dashboard'); }
  function $(sel, scope) { return (scope || root() || document).querySelector(sel); }
  function $$(sel, scope) {
    var r = scope || root();
    return r ? Array.prototype.slice.call(r.querySelectorAll(sel)) : [];
  }
  function say(msg) { try { if (window.toast) window.toast(msg); } catch (e) {} }
  function reg(id, fn) {
    try {
      if (window.PM_DEMO && window.PM_DEMO.actions && window.PM_DEMO.actions.register) {
        window.PM_DEMO.actions.register(id, function (ctx) {
          try { fn(ctx); } catch (e) { try { console.error('[pm6-dash]', id, e); } catch (x) {} }
        });
      }
    } catch (e) {}
  }
  function on(topic, fn) {
    try {
      if (window.PM_DEMO && window.PM_DEMO.on) {
        window.PM_DEMO.on(topic, function (p, t) {
          try { fn(p, t); } catch (e) { try { console.error('[pm6-dash]', topic, e); } catch (x) {} }
        });
      }
    } catch (e) {}
  }
  function injectIcons(scope) {
    if (!window.PM_ICONS) return;
    $$('.pm6-ico[data-pm6-icon]', scope || root()).forEach(function (el) {
      var k = el.getAttribute('data-pm6-icon');
      if (window.PM_ICONS[k] && !el.firstElementChild) el.innerHTML = window.PM_ICONS[k];
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ==========================================================
     Tastebook editor files (pre-highlighted; PM_DEMO_TEXT wins)
     ========================================================== */
  function K(s) { return '<span style="color:var(--accent-magenta);">' + s + '</span>'; }   // keyword
  function C(s) { return '<span style="color:var(--text-muted);">' + s + '</span>'; }        // comment
  function S(s) { return '<span style="color:var(--accent-lime);">' + s + '</span>'; }       // string
  function F(s) { return '<span style="color:var(--accent-blue);">' + s + '</span>'; }       // fn/type

  var FILES = {
    'src/main.rs': { diffs: { 8: 'added', 9: 'added', 10: 'added' }, lines: [
      K('use') + ' axum::{' + F('Router') + ', routing::{get, post}};',
      K('use') + ' sqlx::postgres::' + F('PgPoolOptions') + ';',
      K('use') + ' tower_http::cors::' + F('CorsLayer') + ';',
      K('mod') + ' models; ' + K('mod') + ' routes;',
      '',
      C('/// Tastebook API — recipes, ratings, import-from-URL.'),
      '#[tokio::main]',
      K('async fn') + ' ' + F('main') + '() -&gt; anyhow::' + F('Result') + '&lt;()&gt; {',
      '    ' + K('let') + ' pool = ' + F('PgPoolOptions') + '::new()',
      '        .max_connections(8)',
      '        .connect(&amp;std::env::var(' + S('"DATABASE_URL"') + ')?).await?;',
      '    ' + K('let') + ' app = ' + F('Router') + '::new()',
      '        .route(' + S('"/api/recipes"') + ', get(routes::recipes::list))',
      '        .route(' + S('"/api/recipes"') + ', post(routes::recipes::create))',
      '        .route(' + S('"/api/import"') + ', post(routes::import::from_url))',
      '        .layer(' + F('CorsLayer') + '::permissive())',
      '        .with_state(pool);',
      '    ' + K('let') + ' listener = tokio::net::' + F('TcpListener') + '::bind(' + S('"0.0.0.0:8080"') + ').await?;',
      '    axum::serve(listener, app).await?;',
      '    ' + F('Ok') + '(())',
      '}'
    ] },
    'src/routes/recipes.rs': { diffs: { 6: 'modified', 12: 'added', 13: 'added', 14: 'added' }, lines: [
      K('use') + ' axum::{extract::{' + F('State') + ', ' + F('Path') + '}, ' + F('Json') + '};',
      K('use') + ' crate::models::recipe::{' + F('Recipe') + ', ' + F('NewRecipe') + '};',
      '',
      C('/// GET /api/recipes — newest first, rating attached.'),
      K('pub async fn') + ' ' + F('list') + '(' + F('State') + '(pool): ' + F('State') + '&lt;' + F('PgPool') + '&gt;)',
      '    -&gt; ' + F('Json') + '&lt;' + F('Vec') + '&lt;' + F('Recipe') + '&gt;&gt; {',
      '    ' + K('let') + ' rows = sqlx::query_as!(' + F('Recipe') + ', ' + S('"SELECT * FROM recipes ORDER BY created_at DESC LIMIT 50"') + ')',
      '        .fetch_all(&amp;pool).await.unwrap_or_default();',
      '    ' + F('Json') + '(rows)',
      '}',
      '',
      C('/// POST /api/recipes — validates ingredients, computes cook time.'),
      K('pub async fn') + ' ' + F('create') + '(' + F('State') + '(pool): ' + F('State') + '&lt;' + F('PgPool') + '&gt;,',
      '    ' + F('Json') + '(input): ' + F('Json') + '&lt;' + F('NewRecipe') + '&gt;) -&gt; ' + F('Json') + '&lt;' + F('Recipe') + '&gt; {',
      '    input.validate().expect(' + S('"ingredient list must not be empty"') + ');',
      '    ' + K('let') + ' rec = ' + F('Recipe') + '::insert(&amp;pool, input).await.unwrap();',
      '    ' + F('Json') + '(rec)',
      '}'
    ] },
    'src/models/recipe.rs': { diffs: { 9: 'added', 10: 'added' }, lines: [
      K('use') + ' serde::{' + F('Serialize') + ', ' + F('Deserialize') + '};',
      K('use') + ' sqlx::' + F('FromRow') + ';',
      '',
      '#[derive(' + F('Serialize') + ', ' + F('Deserialize') + ', ' + F('FromRow') + ')]',
      K('pub struct') + ' ' + F('Recipe') + ' {',
      '    ' + K('pub') + ' id: ' + F('i64') + ',',
      '    ' + K('pub') + ' title: ' + F('String') + ',',
      '    ' + K('pub') + ' minutes: ' + F('i32') + ',',
      '    ' + K('pub') + ' rating: ' + F('f32') + ',',
      '    ' + K('pub') + ' source_url: ' + F('Option') + '&lt;' + F('String') + '&gt;,',
      '    ' + K('pub') + ' created_at: chrono::' + F('DateTime') + '&lt;chrono::' + F('Utc') + '&gt;,',
      '}',
      '',
      '#[derive(' + F('Deserialize') + ')]',
      K('pub struct') + ' ' + F('NewRecipe') + ' {',
      '    ' + K('pub') + ' title: ' + F('String') + ',',
      '    ' + K('pub') + ' ingredients: ' + F('Vec') + '&lt;' + F('String') + '&gt;,',
      '}'
    ] },
    'web/src/routes/+page.svelte': { diffs: { 2: 'modified' }, lines: [
      '&lt;' + K('script') + '&gt;',
      '  ' + K('import') + ' ' + F('RecipeCard') + ' ' + K('from') + ' ' + S("'$lib/RecipeCard.svelte'") + ';',
      '  ' + K('export let') + ' data; ' + C('// recipes from +page.server.js'),
      '&lt;/' + K('script') + '&gt;',
      '',
      '&lt;' + F('h1') + '&gt;Share recipes you actually cook&lt;/' + F('h1') + '&gt;',
      '&lt;' + F('div') + ' class=' + S('"grid"') + '&gt;',
      '  {#each data.recipes ' + K('as') + ' r}',
      '    &lt;' + F('RecipeCard') + ' recipe={r} /&gt;',
      '  {/each}',
      '&lt;/' + F('div') + '&gt;'
    ] },
    'Cargo.toml': { diffs: {}, lines: [
      '[package]',
      'name = ' + S('"tastebook"'),
      'version = ' + S('"0.4.2"'),
      'edition = ' + S('"2021"'),
      '',
      '[dependencies]',
      'axum = ' + S('"0.7"'),
      'tokio = { version = ' + S('"1"') + ', features = [' + S('"full"') + '] }',
      'sqlx = { version = ' + S('"0.7"') + ', features = [' + S('"postgres"') + ', ' + S('"chrono"') + '] }',
      'serde = { version = ' + S('"1"') + ', features = [' + S('"derive"') + '] }',
      'anyhow = ' + S('"1"'),
      'tower-http = { version = ' + S('"0.5"') + ', features = [' + S('"cors"') + '] }'
    ] },
    'docker-compose.yml': { diffs: {}, lines: [
      'services:',
      '  api:',
      '    build: .',
      '    ports: [' + S('"8080:8080"') + ']',
      '    depends_on: [postgres, redis]',
      '  web:',
      '    build: ./web',
      '    ports: [' + S('"5173:5173"') + ']',
      '  postgres:',
      '    image: ' + S('postgres:16'),
      '    ports: [' + S('"5432:5432"') + ']',
      '  redis:',
      '    image: ' + S('redis:7'),
      '    ports: [' + S('"6379:6379"') + ']'
    ] },
    'Dockerfile': { diffs: {}, lines: [
      K('FROM') + ' rust:1.79 ' + K('AS') + ' build',
      K('WORKDIR') + ' /app',
      K('COPY') + ' . .',
      K('RUN') + ' cargo build --release',
      '',
      K('FROM') + ' debian:bookworm-slim',
      K('COPY') + ' --from=build /app/target/release/tastebook /usr/local/bin/',
      K('EXPOSE') + ' 8080',
      K('CMD') + ' [' + S('"tastebook"') + ']'
    ] },
    'README.md': { diffs: {}, lines: [
      '# Tastebook',
      '',
      'Share recipes you actually cook. SvelteKit + Rust/Axum + Postgres.',
      '',
      '## Dev',
      '- `docker compose up` then `cargo run`',
      '- web on :5173, API on :8080'
    ] }
  };
  var BASENAMES = {};
  Object.keys(FILES).forEach(function (p) {
    var b = p.split('/').pop();
    if (!BASENAMES[b]) BASENAMES[b] = p;
  });
  function resolveFile(name) {
    if (!name) return null;
    if (FILES[name]) return name;
    var tf = null;
    try { tf = window.PM_DEMO_TEXT && window.PM_DEMO_TEXT.files; } catch (e) {}
    if (tf && tf[name]) return name;
    var b = String(name).split('/').pop();
    if (BASENAMES[b]) return BASENAMES[b];
    if (tf) {
      var keys = Object.keys(tf);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].split('/').pop() === b) return keys[i];
      }
    }
    return null;
  }
  function fileBody(path) {
    try {
      var t = window.PM_DEMO_TEXT && window.PM_DEMO_TEXT.files && window.PM_DEMO_TEXT.files[path];
      if (t) {
        if (typeof t === 'string') return { lines: t.split('\n'), diffs: {} };
        if (t.lines) return t;
      }
    } catch (e) {}
    return FILES[path];
  }

  function updateMinimapVp(minimap, code) {
    if (!minimap || !code) return;
    var vp = minimap.querySelector('.minimap-viewport');
    if (!vp) return;
    var mmH = minimap.offsetHeight || 200;
    var sh = code.scrollHeight || 1;
    vp.style.height = Math.max((code.clientHeight / sh) * mmH, 20) + 'px';
    vp.style.top = ((code.scrollTop / sh) * mmH) + 'px';
  }

  function setupDiffFlash(code) {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target._pm6Flashed) {
          entry.target._pm6Flashed = true;
          entry.target.classList.add('diff-scroll-flash');
          setTimeout(function () { entry.target.classList.remove('diff-scroll-flash'); }, 400);
        }
      });
    }, { root: code, threshold: 0.5 });
    var marked = code.querySelectorAll('.code-line.diff-added, .code-line.diff-modified, .code-line.diff-conflict');
    Array.prototype.forEach.call(marked, function (el) { obs.observe(el); });
  }

  function pm6RenderFile(name, prefix) {
    var path = resolveFile(name);
    var fd = path && fileBody(path);
    if (!fd) return false;
    var gutter = document.getElementById(prefix + 'Gutter');
    var code = document.getElementById(prefix + 'Code');
    var minimap = document.getElementById(prefix + 'Minimap');
    if (!gutter || !code) return false;
    /* rendering a real file: drop the context-host detail-view class so the
       pane reverts to its normal code/editor treatment (minimap-only
       scrollbar / no native bar, monospace, overflow), and restore the
       code-editor chrome the context view hid (line gutter + minimap). */
    code.classList.remove('pm6-ctx-host');
    gutter.style.display = '';
    if (minimap) minimap.style.display = '';
    var pre = { added: '+', deleted: '-', modified: '~', conflict: '!' };
    var g = '', c = '';
    fd.lines.forEach(function (line, i) {
      var dt = (fd.diffs && fd.diffs[i]) || '';
      g += '<div class="gutter-line"><span class="gutter-line-num' + (dt ? ' diff-' + dt : '') + '">' + (i + 1) + '</span></div>';
      var px = pre[dt] ? '<span class="diff-prefix ' + dt + '">' + pre[dt] + '</span>' : '<span class="diff-prefix">&nbsp;</span>';
      c += '<span class="code-line' + (dt ? ' diff-' + dt : '') + ' revealing" style="animation-delay:' + (i * 8) + 'ms">' + px + (line || '&nbsp;') + '</span>';
    });
    gutter.innerHTML = g;
    code.innerHTML = '<div class="cursor-line-highlight"></div>' + c;
    /* cursor line highlight follows the pointer exactly. A single rAF
       coalesces the mousemove stream so the overlay never lags the cursor
       and never produces a second highlight (the CSS :hover background is
       neutralized in pm6-css-global, leaving this overlay as the sole cue). */
    var hl = code.querySelector('.cursor-line-highlight');
    var edPendingY = null, edRaf = 0;
    /* The overlay snaps to the line under the cursor. Anchor to the FIRST
       .code-line element's real offsetTop and the rendered line-box height
       (offsetHeight), not to padding/computed line-height. The old hardcoded
       /18 math assumed lines began at padding-top with an 18px grid; in
       reality lines begin ~31px lower and the grid is the rendered box
       height, so the highlight landed ~1-2 lines above the cursor. */
    function edLineMetrics() {
      var first = code.querySelector('.code-line');
      var origin = first ? first.offsetTop : (parseFloat(getComputedStyle(code).paddingTop) || 0);
      var lh = first ? first.offsetHeight : (parseFloat(getComputedStyle(code).lineHeight) || 18);
      return { origin: origin, lh: lh || 18 };
    }
    function edApplyHighlight() {
      edRaf = 0;
      if (!hl || edPendingY == null) return;
      var m = edLineMetrics();
      var row = Math.floor((edPendingY - m.origin) / m.lh);
      if (row < 0) { hl.style.display = 'none'; return; }
      hl.style.top = (m.origin + row * m.lh) + 'px';
      hl.style.display = 'block';
    }
    code.onmousemove = function (e) {
      if (!hl) return;
      var rect = code.getBoundingClientRect();
      edPendingY = e.clientY - rect.top + code.scrollTop;
      if (!edRaf) edRaf = requestAnimationFrame(edApplyHighlight);
    };
    code.onmouseleave = function () {
      if (edRaf) { cancelAnimationFrame(edRaf); edRaf = 0; }
      edPendingY = null;
      if (hl) hl.style.display = 'none';
    };
    /* gutter follows code scroll; minimap viewport tracks on rAF */
    code.onscroll = function () {
      gutter.scrollTop = code.scrollTop;
      if (minimap) {
        requestAnimationFrame(function () { updateMinimapVp(minimap, code); });
      }
    };
    if (minimap) {
      try {
        var canvas = minimap.querySelector('.minimap-canvas');
        if (canvas) {
          var w = minimap.offsetWidth || 28, h = minimap.offsetHeight || 200;
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, w, h);
          var cs = getComputedStyle(document.documentElement);
          var n = fd.lines.length || 1, lh = Math.max(h / n - 0.5, 1);
          fd.lines.forEach(function (line, i) {
            var plain = String(line).replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, 'x');
            var dt = (fd.diffs && fd.diffs[i]) || '';
            ctx.fillStyle = (dt === 'added' ? cs.getPropertyValue('--accent-lime') :
                             dt === 'modified' ? cs.getPropertyValue('--accent-blue') :
                             dt === 'conflict' ? cs.getPropertyValue('--accent-orange') :
                             cs.getPropertyValue('--text-muted')).trim() || '#666';
            ctx.globalAlpha = dt ? 0.4 : 0.14;
            ctx.fillRect(1, (i / n) * h, Math.max(Math.min(plain.trim().length * 0.4, w - 6), 1), lh);
          });
          ctx.globalAlpha = 1;
          /* viewport thumb sized to the visible fraction (min 20px), tracks scroll */
          requestAnimationFrame(function () { updateMinimapVp(minimap, code); });
        }
      } catch (e) {}
      /* Minimap is the only scrollbar for code files: click/drag jumps scroll.
         Inverse of updateMinimapVp — center the viewport thumb on the pointer. */
      if (minimap._pm6MmCleanup) minimap._pm6MmCleanup();
      var mmDragging = false;
      function scrollCodeFromMinimapY(clientY) {
        var rect = minimap.getBoundingClientRect();
        var mmH = minimap.offsetHeight || 200;
        var sh = code.scrollHeight || 1;
        var maxScroll = Math.max(0, sh - code.clientHeight);
        var y = clientY - rect.top;
        var vpH = Math.max((code.clientHeight / sh) * mmH, 20);
        var top = y - vpH / 2;
        code.scrollTop = Math.max(0, Math.min(maxScroll, (top / mmH) * sh));
      }
      function onMmPointerDown(e) {
        mmDragging = true;
        try { minimap.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
        scrollCodeFromMinimapY(e.clientY);
      }
      function onMmPointerMove(e) {
        if (!mmDragging) return;
        e.preventDefault();
        scrollCodeFromMinimapY(e.clientY);
      }
      function onMmPointerUp(e) {
        mmDragging = false;
        try { minimap.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      minimap.addEventListener('pointerdown', onMmPointerDown);
      minimap.addEventListener('pointermove', onMmPointerMove);
      minimap.addEventListener('pointerup', onMmPointerUp);
      minimap.addEventListener('pointercancel', onMmPointerUp);
      minimap._pm6MmCleanup = function () {
        minimap.removeEventListener('pointerdown', onMmPointerDown);
        minimap.removeEventListener('pointermove', onMmPointerMove);
        minimap.removeEventListener('pointerup', onMmPointerUp);
        minimap.removeEventListener('pointercancel', onMmPointerUp);
        delete minimap._pm6MmCleanup;
      };
    }
    setupDiffFlash(code);
    return true;
  }
  window.PM6_RENDER_FILE = pm6RenderFile;

  function activatePaneTab(paneId, fname, codeOnly) {
    var pane = document.getElementById(paneId);
    if (!pane) return;
    var sel = codeOnly ? '.editor-tabs .tab[data-tab-type="code"]' : '.editor-tabs .tab';
    pane.querySelectorAll(sel).forEach(function (t) { t.classList.remove('active'); });
    var target = pane.querySelector('.editor-tabs .tab[data-file="' + fname + '"]');
    if (target) target.classList.add('active');
  }

  function wrapEditorFns() {
    var orig1 = window.switchEditorPane1Tab;
    window.switchEditorPane1Tab = function (fn) {
      if (resolveFile(fn)) {
        activatePaneTab('editorPane1', fn, false);
        pm6RenderFile(fn, 'pane1');
        return;
      }
      if (typeof orig1 === 'function') orig1(fn);
    };
    var orig2 = window.switchEditorPane2CodeTab;
    window.switchEditorPane2CodeTab = function (fn) {
      if (resolveFile(fn)) {
        activatePaneTab('editorPane2', fn, true);
        var codeArea = document.getElementById('editorPane2CodeArea');
        var browserContent = document.getElementById('browserTabContent');
        if (codeArea) codeArea.style.display = '';
        if (browserContent) browserContent.style.display = 'none';
        pm6RenderFile(fn, 'pane2');
        return;
      }
      if (typeof orig2 === 'function') orig2(fn);
    };
    var origB = window.switchEditorPane2Tab;
    if (typeof origB === 'function') {
      window.switchEditorPane2Tab = function (tabType) {
        origB(tabType);
        var bar = document.getElementById('browserAddressBar');
        if (bar && bar.value) bar.value = bar.value.replace('localhost:3000', 'localhost:5173');
      };
    }
  }

  /* ==========================================================
     Editor tab lifecycle — the pane1 strip is owned by the demo
     model (S.files.openTabs / S.files.activeTab): seeded once
     from the static markup, then rendered exclusively from state.
     Tab clicks route through filesFacade.open (PM6_RENDER_FILE
     pipeline + wrapEditorFns wrappers stay intact); a no-op guard
     on the already-active tab prevents render loops.

     CONTEXT-TAB COMPATIBILITY CONTRACT (reserved for the chat
     workstream): S.files.openTabs entries may be pseudo-paths of
     the form "context:<threadId>". The renderer branches on that
     prefix and calls window.PM6_RENDER_CONTEXT(threadId, 'pane1')
     when defined (else it renders a fallback notice into pane1).
     Labels come from the optional S.files.tabLabels map keyed by
     the full (pseudo-)path; closeTab() and the overflow chip are
     path-agnostic, so context tabs close and collapse like file
     tabs. The #contextDetailPane strip itself stays owned by
     PM6_CONTEXT_TAB (29x-pm6-js-chat): its X still closes through
     that facade — we only recompute resizer/empty-state chrome.
     ========================================================== */
  var ED_X_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  var edLocalState = { openTabs: [], activeTab: null }; /* fallback when PM_DEMO is absent */
  var edDirty = {};      /* path -> true (dirty dot carried over from the seed markup) */
  var edHidden = [];     /* paths collapsed into the +N chip (derived on every fit) */
  var edMenuEl = null;
  var edFitQueued = false;
  var edSeeded = false;

  function edState() {
    try {
      if (window.PM_DEMO && window.PM_DEMO.state && window.PM_DEMO.state.files) return window.PM_DEMO.state.files;
    } catch (e) {}
    return edLocalState;
  }
  function edStrip() { return document.querySelector('#editorPane1 .editor-tabs'); }
  function edIsContext(path) { return String(path).indexOf('context:') === 0; }
  function edLabel(path) {
    var st = edState();
    if (st.tabLabels && st.tabLabels[path]) return st.tabLabels[path];
    if (edIsContext(path)) return 'Context: ' + String(path).slice(8);
    return String(path).split('/').pop();
  }

  /* static-markup seed, captured at script eval (part 14 precedes us) so a
     pre-boot engine render cannot wipe the strip before we read it */
  var edSeed = (function () {
    var out = { paths: [], active: null, dirty: {} };
    var strip = edStrip();
    if (!strip) return out;
    var tabs = strip.querySelectorAll('.tab[data-file]');
    for (var i = 0; i < tabs.length; i++) {
      var p = tabs[i].getAttribute('data-file');
      if (!p) continue;
      out.paths.push(p);
      if (tabs[i].classList.contains('active')) out.active = p;
      if (tabs[i].querySelector('.dot')) out.dirty[p] = true;
    }
    return out;
  })();
  function edEnsureSeed() {
    if (edSeeded) return;
    edSeeded = true;
    var st = edState();
    edDirty = edSeed.dirty;
    /* statics go in front (markup order); anything the engine opened before
       boot stays appended after them */
    for (var i = edSeed.paths.length - 1; i >= 0; i--) {
      if (st.openTabs.indexOf(edSeed.paths[i]) === -1) st.openTabs.unshift(edSeed.paths[i]);
    }
    if (!st.activeTab) st.activeTab = edSeed.active || st.openTabs[0] || null;
  }

  function renderEditorTabs() {
    var strip = edStrip();
    if (!strip) return;
    edEnsureSeed();
    edCloseOverflowMenu();
    var st = edState();
    var old = strip.querySelectorAll('.tab, .pm-ed-overflow');
    for (var i = 0; i < old.length; i++) strip.removeChild(old[i]);
    var actions = strip.querySelector('.pane-tabbar-actions');
    st.openTabs.forEach(function (path) {
      var tab = document.createElement('span');
      tab.className = 'tab' + (path === st.activeTab ? ' active' : '');
      tab.setAttribute('data-file', path);
      tab.title = path;
      tab.appendChild(document.createTextNode(edLabel(path)));
      if (edDirty[path]) {
        var dot = document.createElement('span');
        dot.className = 'dot';
        dot.textContent = '*';
        tab.appendChild(dot);
      }
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'tab-close-btn';
      x.title = 'Close tab';
      x.setAttribute('aria-label', 'Close ' + edLabel(path));
      x.innerHTML = ED_X_SVG;
      tab.appendChild(x);
      tab.onclick = function (e) {
        if (e && e.target && e.target.closest && e.target.closest('.tab-close-btn')) return;
        edOpen(path);
      };
      strip.insertBefore(tab, actions);
    });
    edFitOverflow();
  }
  window.PM6_RENDER_EDITOR_TABS = renderEditorTabs;

  function edOpen(path) {
    var st = edState();
    if (st.activeTab === path) return; /* no-op guard: double-render protection */
    if (edIsContext(path)) {
      if (st.openTabs.indexOf(path) === -1) st.openTabs.push(path);
      st.activeTab = path;
      renderEditorTabs();
      edRenderBody(path);
      return;
    }
    try {
      if (window.PM_DEMO && window.PM_DEMO.files && window.PM_DEMO.files.open) {
        window.PM_DEMO.files.open(path);
        return;
      }
    } catch (e) {}
    /* engine absent: local bookkeeping + direct render */
    if (st.openTabs.indexOf(path) === -1) st.openTabs.push(path);
    st.activeTab = path;
    renderEditorTabs();
    edRenderBody(path);
  }

  function edRenderBody(path) {
    if (edIsContext(path)) {
      var tid = String(path).slice(8);
      if (typeof window.PM6_RENDER_CONTEXT === 'function') {
        try { window.PM6_RENDER_CONTEXT(tid, 'pane1'); return; } catch (e) {}
      }
      var gutter = document.getElementById('pane1Gutter');
      var code = document.getElementById('pane1Code');
      if (gutter) gutter.innerHTML = '';
      if (code) {
        code.innerHTML = '<span class="code-line"><span style="color:var(--text-muted);">// Context details for thread &quot;' +
          esc(tid) + '&quot; render here once the shared context renderer lands (demo_scope).</span></span>';
      }
      return;
    }
    var ok = false;
    /* pm6RenderFile also clears pm6-ctx-host; the removal here covers the
       fallback path where the file isn't resolved and we defer to the engine. */
    var code1 = document.getElementById('pane1Code');
    if (code1) code1.classList.remove('pm6-ctx-host');
    try { ok = !!pm6RenderFile(path, 'pane1'); } catch (e2) {}
    if (!ok) {
      try {
        if (window.PM_DEMO && window.PM_DEMO.files && window.PM_DEMO.files.open) window.PM_DEMO.files.open(path);
      } catch (e3) {}
    }
  }

  function edClearPane1() {
    var gutter = document.getElementById('pane1Gutter');
    var code = document.getElementById('pane1Code');
    if (gutter) gutter.innerHTML = '';
    if (code) code.innerHTML = '';
  }

  /* ==========================================================
     CONTEXT-TAB renderer: opens "More details" from the chat as a
     tab in the editor pane (pane1) via the "context:<threadId>"
     pseudo-path, instead of the standalone #contextDetailPane.
     Fields mirror PM6_CONTEXT_TAB.open so the content is identical.
     (esc() is defined earlier in this block.)
     ========================================================== */
  function pm6ContextFields(threadId) {
    var ui = null;
    try { if (window.PM6_CHAT_THREADS) ui = window.PM6_CHAT_THREADS[threadId] || null; } catch (e) {}
    var title = (ui && (ui.titleHtml || ui.title)) || threadId || 'thread';
    title = String(title).replace(/<[^>]+>/g, '').trim();
    var messages = (ui && ui.context && ui.context.messages) || 0;
    if (!messages) {
      try {
        var st = document.querySelector('#chatPanel .messageStream, #floatingChat .messageStream');
        if (st) messages = st.querySelectorAll('.message').length;
      } catch (e2) {}
    }
    var used = 42180, max = 128000;
    try {
      var d = window.PM_DEMO;
      var c = d && d.state && d.state.chat && d.state.chat.context;
      if (c && c.max) { used = c.used || used; max = c.max; }
    } catch (e3) {}
    return {
      thread: title,
      messages: String(messages || 6),
      provider: 'Claude',
      model: 'Sonnet 4.6',
      mode: 'Agent',
      persona: 'Product Manager',
      worker: 'assistant',
      tokens: Number(used).toLocaleString() + ' / ' + Number(max).toLocaleString(),
      pct: Math.min(100, Math.round((used / max) * 100))
    };
  }
  function pm6ContextHtml(f) {
    /* Mirrors the standalone #contextDetailPane (part 14) curated + raw views:
       Overview (with Worker), Breakdown (legend + By-Role), Browser Context,
       Messages (expandable rows), and the Raw/JSON toggle. Inline styles
       reuse the same .cdp-* classes so existing theme rules apply; the few
       color/style bits come straight from the static markup. */
    var onCur = 'this.closest(\'.pm6-ctx-tab\').querySelectorAll(\'.cdp-tab\').forEach(function(t){t.classList.remove(\'active\');});this.classList.add(\'active\');var r=this.closest(\'.pm6-ctx-tab\');r.querySelector(\'.cdp-curated\').style.display=\'block\';r.querySelector(\'.cdp-raw-view\').style.display=\'none\';';
    var onRaw = 'this.closest(\'.pm6-ctx-tab\').querySelectorAll(\'.cdp-tab\').forEach(function(t){t.classList.remove(\'active\');});this.classList.add(\'active\');var r=this.closest(\'.pm6-ctx-tab\');r.querySelector(\'.cdp-curated\').style.display=\'none\';r.querySelector(\'.cdp-raw-view\').style.display=\'block\';';
    return '<div class="pm6-ctx-tab">' +
      '<div class="cdp-tab-bar">' +
        '<div class="cdp-tab active" onclick="' + onCur + '">Curated</div>' +
        '<div class="cdp-tab" onclick="' + onRaw + '">Raw</div>' +
      '</div>' +
      '<div class="cdp-curated" style="display:block;">' +
        /* Overview */
        '<div class="cdp-section">' +
          '<div class="cdp-section-title">Overview</div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Thread</span><span class="cdp-kv-value">' + esc(f.thread) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Messages</span><span class="cdp-kv-value">' + esc(f.messages) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Provider</span><span class="cdp-kv-value">' + esc(f.provider) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Model</span><span class="cdp-kv-value">' + esc(f.model) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Mode</span><span class="cdp-kv-value">' + esc(f.mode) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Persona</span><span class="cdp-kv-value">' + esc(f.persona) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Worker</span><span class="cdp-kv-value">' + esc(f.worker) + '</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Tokens</span><span class="cdp-kv-value">' + esc(f.tokens) + '</span></div>' +
        '</div>' +
        /* Breakdown */
        '<div class="cdp-section" style="border-top: 1px solid var(--border-light);">' +
          '<div class="cdp-section-title">Breakdown</div>' +
          '<div style="font-size:10px; color:var(--text-muted); margin-bottom:var(--xs);">Context Usage &mdash; ' + f.pct + '%</div>' +
          '<div class="cdp-bar">' +
            '<div class="cdp-bar-segment" style="width:19.5%; background:var(--accent-blue);"></div>' +
            '<div class="cdp-bar-segment" style="width:29.4%; background:var(--accent-lime);"></div>' +
            '<div class="cdp-bar-segment" style="width:43%; background:var(--accent-orange);"></div>' +
            '<div class="cdp-bar-segment" style="width:8.1%; background:var(--accent-magenta);"></div>' +
          '</div>' +
          '<div style="display:flex; gap:var(--md); font-size:10px; flex-wrap:wrap; margin-bottom:var(--sm);">' +
            '<span><span style="display:inline-block; width:8px; height:8px; background:var(--accent-blue); border-radius:2px; margin-right:3px;"></span>System 8.2k</span>' +
            '<span><span style="display:inline-block; width:8px; height:8px; background:var(--accent-lime); border-radius:2px; margin-right:3px;"></span>User 12.4k</span>' +
            '<span><span style="display:inline-block; width:8px; height:8px; background:var(--accent-orange); border-radius:2px; margin-right:3px;"></span>Assistant 18.1k</span>' +
            '<span><span style="display:inline-block; width:8px; height:8px; background:var(--accent-magenta); border-radius:2px; margin-right:3px;"></span>Tool 3.5k</span>' +
          '</div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">By Role</span><span class="cdp-kv-value"></span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">User</span><span class="cdp-kv-value">12,400</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">Assistant</span><span class="cdp-kv-value">18,100</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">System</span><span class="cdp-kv-value">8,200</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">Tool</span><span class="cdp-kv-value">3,480</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">Reasoning</span><span class="cdp-kv-value">4,200</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">Cache Read</span><span class="cdp-kv-value">2,100</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">Cache Write</span><span class="cdp-kv-value">800</span></div>' +
        '</div>' +
        /* Browser Context */
        '<div class="cdp-section" style="border-top: 1px solid var(--border-light);">' +
          '<div class="cdp-section-title">Browser Context</div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Active Sessions</span><span class="cdp-kv-value">2</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">workspace_preview</span><span class="cdp-kv-value" style="color:var(--accent-lime);">localhost:5173</span></div>' +
          '<div class="cdp-kv-row" style="padding-left:var(--md);"><span class="cdp-kv-label">automation_session</span><span class="cdp-kv-value" style="color:var(--accent-orange);">test-runner (paused)</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Captured Elements</span><span class="cdp-kv-value">3</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Screenshots</span><span class="cdp-kv-value">1</span></div>' +
          '<div class="cdp-kv-row"><span class="cdp-kv-label">Traces</span><span class="cdp-kv-value">1</span></div>' +
        '</div>' +
        /* Messages */
        '<div class="cdp-section" style="border-top: 1px solid var(--border-light);">' +
          '<div class="cdp-section-title">Messages</div>' +
          '<div class="cdp-msg-row" onclick="this.nextElementSibling.classList.toggle(\'expanded\')">' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span style="color:var(--accent-lime);">user</span> <span class="sep" style="opacity:0.4;">|</span> Agent <span class="sep" style="opacity:0.4;">|</span> Sonnet 4.6</span>' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span>1,240 tok</span></span>' +
          '</div>' +
          '<div class="cdp-msg-detail">' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Provider</span><span class="cdp-kv-value">Claude</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Model</span><span class="cdp-kv-value">Sonnet 4.6</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Effort</span><span class="cdp-kv-value">High</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Persona</span><span class="cdp-kv-value">default</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Input Tokens</span><span class="cdp-kv-value">1,240</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Context at Send</span><span class="cdp-kv-value">8,200 / 128,000</span></div>' +
          '</div>' +
          '<div class="cdp-msg-row" onclick="this.nextElementSibling.classList.toggle(\'expanded\')">' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span style="color:var(--accent-blue);">assistant</span> <span class="sep" style="opacity:0.4;">|</span> Agent <span class="sep" style="opacity:0.4;">|</span> Sonnet 4.6 <span class="sep" style="opacity:0.4;">|</span> 12s</span>' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span>8,420 tok</span></span>' +
          '</div>' +
          '<div class="cdp-msg-detail expanded">' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Provider</span><span class="cdp-kv-value">Claude</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Model</span><span class="cdp-kv-value">Sonnet 4.6</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Effort</span><span class="cdp-kv-value">High</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Persona</span><span class="cdp-kv-value">product-manager</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Input Tokens</span><span class="cdp-kv-value">9,440</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Output Tokens</span><span class="cdp-kv-value">8,420</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Thinking</span><span class="cdp-kv-value">12s</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Context at Send</span><span class="cdp-kv-value">9,440 / 128,000</span></div>' +
            '<div class="cdp-kv-row" style="border-top:1px dashed var(--border-light); padding-top:var(--xs); margin-top:var(--xs);"><span class="cdp-kv-label">Requested Model</span><span class="cdp-kv-value">Opus 4</span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Effective Model</span><span class="cdp-kv-value" style="color:var(--accent-orange);">Sonnet 4.6 <span style="font-size:9px; font-weight:400;">(fallback: rate_limit_5h)</span></span></div>' +
            '<div class="cdp-kv-row"><span class="cdp-kv-label">Reasoning Tokens</span><span class="cdp-kv-value">1,840</span></div>' +
            '<div style="margin-top:var(--sm); padding-top:var(--xs); border-top:1px dashed var(--border-light); font-size:9px; color:var(--text-muted);">Tools: run_shell_command (0.4s), web_search (1.2s)</div>' +
          '</div>' +
          '<div class="cdp-msg-row">' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span style="color:var(--accent-blue);">assistant</span> <span class="sep" style="opacity:0.4;">|</span> Agent <span class="sep" style="opacity:0.4;">|</span> Sonnet 4.6 <span class="sep" style="opacity:0.4;">|</span> 4s</span>' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span>3,200 tok</span></span>' +
          '</div>' +
          '<div class="cdp-msg-row">' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span style="color:var(--accent-lime);">user</span> <span class="sep" style="opacity:0.4;">|</span> Agent <span class="sep" style="opacity:0.4;">|</span> Sonnet 4.6</span>' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span>980 tok</span></span>' +
          '</div>' +
          '<div class="cdp-msg-row">' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span style="color:var(--accent-blue);">assistant</span> <span class="sep" style="opacity:0.4;">|</span> Agent <span class="sep" style="opacity:0.4;">|</span> Sonnet 4.6 <span class="sep" style="opacity:0.4;">|</span> 8s</span>' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span>6,340 tok</span></span>' +
          '</div>' +
          '<div class="cdp-msg-row">' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span style="color:var(--accent-lime);">user</span> <span class="sep" style="opacity:0.4;">|</span> Agent <span class="sep" style="opacity:0.4;">|</span> Sonnet 4.6</span>' +
            '<span style="display:flex; gap:var(--sm); align-items:center;"><span>1,100 tok</span></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      /* Raw view */
      '<div class="cdp-raw-view" style="display:none;">{' + "\n" +
        '  "thread_id": ' + JSON.stringify(String(f.thread).toLowerCase().replace(/\s+/g, '-')) + ',' + "\n" +
        '  "title": ' + JSON.stringify(f.thread) + ',' + "\n" +
        '  "provider": ' + JSON.stringify(f.provider) + ',' + "\n" +
        '  "model": ' + JSON.stringify(f.model) + ',' + "\n" +
        '  "mode": ' + JSON.stringify(f.mode.toLowerCase()) + ',' + "\n" +
        '  "persona": ' + JSON.stringify(f.persona.toLowerCase().replace(/\s+/g, '-')) + ',' + "\n" +
        '  "context": {' + "\n" +
        '    "used": ' + JSON.stringify(f.pct === 0 ? 0 : 42180) + ',' + "\n" +
        '    "limit": 128000' + "\n" +
        '  }' + "\n" +
      '}</div>' +
    '</div>';
  }
  /* PM6_RENDER_CONTEXT: called by edRenderBody for "context:<id>" tabs.
     Renders into pane1's code area (gutter cleared — this is a detail view). */
  window.PM6_RENDER_CONTEXT = function (threadId, paneId) {
    var pid = paneId === 'pane2' ? 'pane2' : 'pane1';
    var gutter = document.getElementById(pid + 'Gutter');
    var code = document.getElementById(pid + 'Code');
    var minimap = document.getElementById(pid + 'Minimap');
    /* Detail view: hide the code-editor chrome (line gutter + minimap) —
       they're meaningless for a context breakdown and the minimap's moving
       viewport reads as a second scrollbar next to the content. */
    if (gutter) { gutter.innerHTML = ''; gutter.style.display = 'none'; }
    if (minimap) minimap.style.display = 'none';
    if (!code) return;
    code.classList.add('pm6-ctx-host');
    code.innerHTML = pm6ContextHtml(pm6ContextFields(threadId));
  };
  /* PM6_OPEN_CONTEXT_TAB: opens (or activates) a context tab in pane1.
     The chat's "More details" link calls this. Reveals the editor view + the
     pane1 tab strip first so the new tab is reachable, then routes through
     edOpen. When the tab is already active, edRenderBody refreshes it
     directly (edOpen otherwise no-ops). */
  window.PM6_OPEN_CONTEXT_TAB = function (threadId, label) {
    var path = 'context:' + threadId;
    edEnsureSeed();
    var st = edState();
    if (st.tabLabels) st.tabLabels[path] = label || ('Context: ' + threadId);
    /* reveal the editor so the tab strip and body are visible */
    try {
      if (typeof window.pm6ReopenEditorPane === 'function') {
        window.pm6ReopenEditorPane('editorPane1');
      } else {
        var p1 = document.getElementById('editorPane1');
        if (p1) p1.style.display = 'flex';
      }
      var ev = document.getElementById('editorView');
      if (ev) ev.style.display = 'flex';
      edRecomputeChrome();
    } catch (ec) {}
    if (st.activeTab === path) { edRenderBody(path); return { ok: true }; }
    edOpen(path);
    return { ok: true };
  };

  function closeTab(path) {
    edEnsureSeed();
    var st = edState();
    var i = st.openTabs.indexOf(path);
    if (i === -1) {
      /* path-agnostic: accept a basename for file tabs */
      for (var k = 0; k < st.openTabs.length; k++) {
        if (!edIsContext(st.openTabs[k]) && String(st.openTabs[k]).split('/').pop() === path) { i = k; break; }
      }
    }
    if (i === -1) return { disabled: true, reason: 'already_done' };
    var closed = st.openTabs[i];
    var wasActive = st.activeTab === closed;
    st.openTabs.splice(i, 1);
    if (wasActive) st.activeTab = st.openTabs[i - 1] || st.openTabs[i] || null; /* left neighbor, else right */
    try {
      if (window.PM_DEMO && window.PM_DEMO.emit) window.PM_DEMO.emit('files.close', { path: closed, tabs: st.openTabs.slice() });
    } catch (e) {}
    renderEditorTabs();
    if (!st.openTabs.length) {
      st.activeTab = null;
      edClearPane1();
      edClosePane('editorPane1'); /* pane-visibility logic (empty state et al) */
    } else if (wasActive && st.activeTab) {
      edRenderBody(st.activeTab);
    }
    return { ok: true };
  }
  window.PM6_CLOSE_EDITOR_TAB = closeTab;

  /* ---------- width-aware overflow: collapse tabs into a "+N more" chip ---------- */
  function edFitOverflow() {
    var strip = edStrip();
    if (!strip) return;
    edMeasureActions(strip);
    edMakeTabsFocusable(strip);
    /* Reuse the chip via display toggles instead of remove/recreate: childList
       mutations here ping-pong with the Home overlay's chrome MutationObserver
       (every fit re-triggered a reseat re-triggered a fit ...). Style and
       hidden-text writes below do not fire childList observers. */
    var chip = strip.querySelector('.pm-ed-overflow');
    /* keep the chip immediately left of the actions cluster: a drag-reorder
       insert can land a tab to the chip's right. Positional guard = zero
       mutations in steady state, so no observer ping-pong. */
    var actionsEl = strip.querySelector('.pane-tabbar-actions');
    if (chip && actionsEl && chip.nextElementSibling !== actionsEl) strip.insertBefore(chip, actionsEl);
    if (chip) chip.style.display = 'none';
    edHidden = [];
    var all = strip.querySelectorAll('.tab');
    var i;
    for (i = 0; i < all.length; i++) all[i].style.display = '';
    if (!strip.clientWidth) return; /* strip not laid out — refit runs on resize */
    var guard = all.length + 1;
    while (edStripContentOverflows(strip) && guard-- > 0) {
      var visible = 0;
      for (i = 0; i < all.length; i++) { if (all[i].style.display !== 'none') visible++; }
      if (visible <= 1) break;
      var pick = null;
      for (i = all.length - 1; i >= 0; i--) {
        if (all[i].style.display === 'none') continue;
        if (all[i].classList.contains('active')) continue; /* active tab always stays visible */
        pick = all[i];
        break;
      }
      if (!pick) break;
      pick.style.display = 'none';
      edHidden.unshift(pick.getAttribute('data-file'));
      if (!chip) {
        chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pm-ed-overflow';
        chip.title = 'Collapsed editor tabs';
        chip.onclick = edToggleOverflowMenu;
        strip.insertBefore(chip, strip.querySelector('.pane-tabbar-actions'));
      }
      chip.style.display = '';
      var label = '+' + edHidden.length + ' more';
      if (chip.textContent !== label) chip.textContent = label;
    }
    if (chip && !edHidden.length) chip.style.display = 'none';
    if (window.PM6_EDTAB_SHAPE) window.PM6_EDTAB_SHAPE.sync(strip, false);
  }
  function edScheduleFit() {
    if (edFitQueued) return;
    edFitQueued = true;
    var run = function () {
      edFitQueued = false;
      edFitOverflow();
    };
    /* rAF is paused in hidden documents — do not defer refits forever */
    if (document.hidden) { setTimeout(run, 50); return; }
    requestAnimationFrame(run);
  }

  /* body-appended picker (terminal overflow-menu pattern): row click
     promotes the tab into the bar, the per-row X closes it */
  function edCloseOverflowMenu() {
    if (edMenuEl && edMenuEl.parentNode) edMenuEl.parentNode.removeChild(edMenuEl);
    edMenuEl = null;
    document.removeEventListener('click', edMenuOutside, true);
    var strip = edStrip();
    var chip = strip && strip.querySelector('.pm-ed-overflow');
    if (chip) chip.classList.remove('active');
  }
  function edMenuOutside(e) {
    if (!edMenuEl) return;
    var t = e.target;
    if (edMenuEl.contains(t)) return;
    if (t && t.closest && t.closest('.pm-ed-overflow')) return;
    edCloseOverflowMenu();
  }
  function edToggleOverflowMenu(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (edMenuEl) { edCloseOverflowMenu(); return; }
    var strip = edStrip();
    var chip = strip && strip.querySelector('.pm-ed-overflow');
    if (!chip) return;
    var menu = document.createElement('div');
    menu.className = 'pm-ed-overflow-menu';
    edHidden.forEach(function (path) {
      var row = document.createElement('button');
      row.type = 'button';
      var lbl = document.createElement('span');
      lbl.className = 'pm-ed-overflow-label';
      lbl.textContent = edLabel(path);
      lbl.title = path;
      var x = document.createElement('span');
      x.className = 'pm-ed-overflow-x';
      x.title = 'Close tab';
      x.innerHTML = ED_X_SVG;
      row.appendChild(lbl);
      row.appendChild(x);
      row.onclick = function (ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        var closeHit = ev && ev.target && ev.target.closest && ev.target.closest('.pm-ed-overflow-x');
        edCloseOverflowMenu();
        if (closeHit) { closeTab(path); return; }
        edPromote(path);
      };
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    var r = chip.getBoundingClientRect();
    var left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8));
    menu.style.left = left + 'px';
    menu.style.top = (r.bottom + 4) + 'px';
    chip.classList.add('active');
    /* sprout-in: let the hidden initial styles paint before opening */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
    });
    edMenuEl = menu;
    document.addEventListener('click', edMenuOutside, true);
  }
  function edPromote(path) {
    var st = edState();
    if (st.openTabs.indexOf(path) === -1) return;
    /* promoteGroupIntoBar semantics: swap the hidden tab with the last
       visible slot, then activate it */
    var strip = edStrip();
    var displaced = null;
    if (strip) {
      var tabs = strip.querySelectorAll('.tab');
      for (var i = tabs.length - 1; i >= 0; i--) {
        if (tabs[i].style.display === 'none') continue;
        if (tabs[i].getAttribute('data-file') === path) continue;
        displaced = tabs[i].getAttribute('data-file');
        break;
      }
    }
    var a = st.openTabs.indexOf(path);
    var b = displaced == null ? -1 : st.openTabs.indexOf(displaced);
    if (a !== -1 && b !== -1 && a !== b) {
      st.openTabs[a] = displaced;
      st.openTabs[b] = path;
    }
    edOpen(path);
  }

  /* ---------- pane close / reopen + editor chrome recompute ---------- */
  function edPaneVisible(id) {
    var el = document.getElementById(id);
    return !!(el && el.style.display !== 'none');
  }
  function edRecomputeChrome() {
    var vis = 0;
    ['editorPane1', 'editorPane2', 'contextDetailPane'].forEach(function (id) {
      if (edPaneVisible(id)) vis++;
    });
    /* split resizer: visible only when at least 2 of the 3 sibling panes
       are visible — the same rule PM6_CONTEXT_TAB's show contract drives */
    var rz = document.getElementById('editorSplitResizer');
    if (rz) rz.style.display = vis >= 2 ? 'block' : 'none';
    var edView = document.getElementById('editorView');
    var empty = document.getElementById('editorEmptyState');
    if (vis === 0) {
      var dash = document.getElementById('dashboardView');
      if (dash && dash.style.display !== 'none') {
        /* dashboard grid sits behind: same behavior as part 25's
           hideEditorViewIfNoVisiblePanes() */
        if (edView) edView.style.display = 'none';
        if (empty) empty.style.display = 'none';
      } else {
        /* editorView must stay (nothing behind it): show the empty state */
        if (edView) edView.style.display = 'flex';
        if (empty) empty.style.display = 'flex';
      }
    } else if (empty) {
      empty.style.display = 'none';
    }
    edScheduleFit();
  }
  function edClosePane(paneId) {
    var pane = paneId && document.getElementById(paneId);
    if (!pane) return;
    pane.style.display = 'none';
    /* sibling fills the freed width: drop resizer-pinned inline sizing */
    ['editorPane1', 'editorPane2'].forEach(function (id) {
      if (id === paneId) return;
      var sib = document.getElementById(id);
      if (sib && sib.style.display !== 'none') { sib.style.width = ''; sib.style.flex = ''; }
    });
    edRecomputeChrome();
  }
  window.pm6ReopenEditorPane = function (id) {
    if (id !== 'editorPane1' && id !== 'editorPane2' && id !== 'contextDetailPane') return { ok: false };
    var pane = document.getElementById(id);
    if (!pane) return { ok: false };
    var wasHidden = pane.style.display === 'none';
    pane.style.display = 'flex';
    var edView = document.getElementById('editorView');
    if (edView) edView.style.display = 'flex';
    edRecomputeChrome();
    if (id === 'editorPane1' && wasHidden) renderEditorTabs();
    return { ok: true };
  };

  /* ---------- pane2 / browser tabs: delegation over the legacy X svgs ---------- */
  function edPane2Neighbor(tab) {
    var sib = tab.previousElementSibling;
    while (sib && !(sib.classList && sib.classList.contains('tab') && sib.style.display !== 'none')) sib = sib.previousElementSibling;
    if (!sib) {
      sib = tab.nextElementSibling;
      while (sib && !(sib.classList && sib.classList.contains('tab') && sib.style.display !== 'none')) sib = sib.nextElementSibling;
    }
    return sib;
  }
  function edActivatePane2(tab) {
    if (!tab) return;
    var tt = tab.getAttribute('data-tab-type');
    if ((tt === 'browser' || tt === 'automation') && typeof window.switchEditorPane2Tab === 'function') {
      window.switchEditorPane2Tab(tt);
      return;
    }
    var f = tab.getAttribute('data-file');
    if (f && typeof window.switchEditorPane2CodeTab === 'function') window.switchEditorPane2CodeTab(f);
  }
  function edClosePane2Tab(tab) {
    if (!tab || !tab.parentNode) return;
    var wasActive = tab.classList.contains('active');
    var neighbor = edPane2Neighbor(tab);
    var strip = tab.parentNode;
    strip.removeChild(tab); /* no S.files bookkeeping for pane2 — the strip IS the model */
    var rest = strip.querySelectorAll('.tab');
    var visibleLeft = 0;
    for (var i = 0; i < rest.length; i++) { if (rest[i].style.display !== 'none') visibleLeft++; }
    if (!visibleLeft) {
      edClosePane('editorPane2');
      return;
    }
    if (wasActive) edActivatePane2(neighbor);
    ed2FitOverflow();
  }

  /* one delegated capture listener for all editor close chrome; it runs
     ahead of part 25's legacy body click handler (which would remove tab
     nodes without model bookkeeping or neighbor activation) */
  function edDelegatedClose(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var pcb = t.closest('.pane-close-btn');
    if (pcb) {
      e.preventDefault();
      e.stopPropagation();
      var paneEl = pcb.closest('.editor-pane');
      edClosePane(pcb.getAttribute('data-pane') || (paneEl && paneEl.id));
      return;
    }
    var x1 = t.closest('#editorPane1 .editor-tabs .tab-close-btn');
    if (x1) {
      e.preventDefault();
      e.stopPropagation();
      var tab1 = x1.closest('.tab');
      if (tab1) closeTab(tab1.getAttribute('data-file'));
      return;
    }
    var x2 = t.closest('#editorPane2 .editor-tabs .tab-close');
    if (x2) {
      /* legacy decorative X in pane2 (incl. #browserPreviewTab) */
      e.preventDefault();
      e.stopPropagation();
      edClosePane2Tab(x2.closest('.tab'));
      return;
    }
    var xc = t.closest('#contextDetailPane .editor-tabs .tab-close');
    if (xc) {
      /* close through PM6_CONTEXT_TAB so its show/hide contract holds
         (part 25's legacy handler would otherwise delete the tab node) */
      e.preventDefault();
      e.stopPropagation();
      try {
        if (window.PM6_CONTEXT_TAB && window.PM6_CONTEXT_TAB.close) window.PM6_CONTEXT_TAB.close();
      } catch (ec) {}
      edRecomputeChrome();
      return;
    }
  }

  /* ---------- pane 2 width-aware overflow: "+N more" chip (parity with pane 1,
     but self-contained — pane 2's model IS its DOM strip, so hidden tabs are
     tracked by tab element order, not S.files.openTabs). ---------- */
  var ed2Hidden = [];     /* collapsed tab elements (right-most first) */
  var ed2MenuEl = null;
  var ed2FitQueued = false;
  function ed2Strip() { return document.querySelector('#editorPane2 .editor-tabs'); }
  function ed2Label(tab) {
    var nm = tab.querySelector('.pm6-mode-name, .pm6-ed-name');
    if (nm) return nm.textContent.trim();
    return tab.textContent.replace(/\s+/g, ' ').trim();
  }
  function ed2FitOverflow() {
    var strip = ed2Strip();
    if (!strip) return;
    edMeasureActions(strip);
    edMakeTabsFocusable(strip);
    edReassertOrder(strip); /* strips that keep order in the DOM re-apply the
                               persisted drag order before every fit, so any
                               re-render source is self-healing */
    /* Reuse the chip via display toggles instead of remove/recreate: childList
       mutations here ping-pong with the Home overlay's chrome observer. */
    var chip = strip.querySelector('.pm-ed-overflow');
    /* keep the chip immediately left of the actions cluster: a drag-reorder
       insert can land a tab to the chip's right. Positional guard = zero
       mutations in steady state, so no observer ping-pong. */
    var actionsEl = strip.querySelector('.pane-tabbar-actions');
    if (chip && actionsEl && chip.nextElementSibling !== actionsEl) strip.insertBefore(chip, actionsEl);
    if (chip) chip.style.display = 'none';
    /* restore only tabs THIS fitter previously hid (data-ed2-hidden). NEVER
       clear display on tabs hidden for other reasons (e.g. the static
       [auto] automation tab, which is conditionally shown by
       switchEditorPane2Tab) — clearing them would un-hide them. */
    var managed = strip.querySelectorAll('.tab[data-ed2-hidden]');
    for (var m = 0; m < managed.length; m++) {
      managed[m].style.display = '';
      managed[m].removeAttribute('data-ed2-hidden');
    }
    ed2Hidden = [];
    /* candidate tabs = those currently in normal flow (not pre-hidden) */
    var all = Array.prototype.filter.call(strip.querySelectorAll('.tab'), function (t) {
      return t.style.display !== 'none';
    });
    if (!strip.clientWidth) return;
    var i;
    var guard = all.length + 1;
    while (edStripContentOverflows(strip) && guard-- > 0) {
      if (all.length <= 1) break;
      var pick = null;
      for (i = all.length - 1; i >= 0; i--) {
        if (all[i].style.display === 'none') continue;
        if (all[i].classList.contains('active')) continue;
        pick = all[i];
        break;
      }
      if (!pick) break;
      pick.style.display = 'none';
      pick.setAttribute('data-ed2-hidden', '1');
      ed2Hidden.unshift(pick);
      /* remove from candidate list so the visible-count reflects reality */
      var idx = all.indexOf(pick);
      if (idx !== -1) all.splice(idx, 1);
      if (!chip) {
        chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pm-ed-overflow';
        chip.title = 'Collapsed editor tabs';
        chip.onclick = ed2ToggleMenu;
        var actions = strip.querySelector('.pane-tabbar-actions');
        strip.insertBefore(chip, actions);
      }
      chip.style.display = '';
      var label2 = '+' + ed2Hidden.length + ' more';
      if (chip.textContent !== label2) chip.textContent = label2;
    }
    if (chip && !ed2Hidden.length) chip.style.display = 'none';
    if (window.PM6_EDTAB_SHAPE) window.PM6_EDTAB_SHAPE.sync(strip, false);
  }
  function ed2ScheduleFit() {
    if (ed2FitQueued) return;
    ed2FitQueued = true;
    var run = function () { ed2FitQueued = false; ed2FitOverflow(); };
    if (document.hidden) { setTimeout(run, 50); return; }
    requestAnimationFrame(run);
  }
  function ed2CloseMenu() {
    if (ed2MenuEl && ed2MenuEl.parentNode) ed2MenuEl.parentNode.removeChild(ed2MenuEl);
    ed2MenuEl = null;
    document.removeEventListener('click', ed2MenuOutside, true);
    var strip = ed2Strip();
    var chip = strip && strip.querySelector('.pm-ed-overflow');
    if (chip) chip.classList.remove('active');
  }
  function ed2MenuOutside(e) {
    if (!ed2MenuEl) return;
    if (ed2MenuEl.contains(e.target)) return;
    if (e.target && e.target.closest && e.target.closest('.pm-ed-overflow')) return;
    ed2CloseMenu();
  }
  function ed2ToggleMenu(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (ed2MenuEl) { ed2CloseMenu(); return; }
    var strip = ed2Strip();
    var chip = strip && strip.querySelector('.pm-ed-overflow');
    if (!chip) return;
    var menu = document.createElement('div');
    menu.className = 'pm-ed-overflow-menu';
    ed2Hidden.forEach(function (tab) {
      var row = document.createElement('button');
      row.type = 'button';
      var lbl = document.createElement('span');
      lbl.className = 'pm-ed-overflow-label';
      lbl.textContent = ed2Label(tab);
      row.appendChild(lbl);
      row.onclick = function (ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        ed2CloseMenu();
        ed2Promote(tab);
      };
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    var r = chip.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
    menu.style.top = (r.bottom + 4) + 'px';
    chip.classList.add('active');
    /* sprout-in: let the hidden initial styles paint before opening */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
    });
    ed2MenuEl = menu;
    document.addEventListener('click', ed2MenuOutside, true);
  }
  /* promote a hidden pane2 tab: swap it back into the last visible slot, then activate */
  function ed2Promote(tab) {
    var strip = ed2Strip();
    if (!strip || !tab || !tab.parentNode) return;
    /* find current last visible tab to displace */
    var tabs = strip.querySelectorAll('.tab');
    var displaced = null;
    for (var i = tabs.length - 1; i >= 0; i--) {
      if (tabs[i] === tab) continue;
      if (tabs[i].style.display === 'none') continue;
      displaced = tabs[i];
      break;
    }
    tab.style.display = '';
    if (displaced && displaced !== tab) {
      strip.insertBefore(tab, displaced);
    }
    ed2FitOverflow();
    edActivatePane2(tab);
  }

  /* ==================================================================
     Contact-aware active-tab silhouette controller (editor strips AND
     the dashboard's Main/Metrics/Monitoring strip).

     One shared shape travels between tabs. Its corner geometry is derived
     from GEOMETRIC CONTACT with the rail's edges, recomputed in the same
     frame as the position -- never eased independently -- so a drag stays
     one-to-one with the pointer and a flush edge never leaves a notch.

       leftProgress  = clamp(leftGap  / MORPH, 0, 1)
       rightProgress = clamp(rightGap / MORPH, 0, 1)

     JS writes ONLY position (--ed-shape-x/--ed-shape-w) and unitless
     progress (--ed-lp/--ed-rp); the 10x-global stylesheet multiplies
     progress by the per-theme radius maxima (--ed-*-rx-max), so themes
     retune corner language without touching this controller. Only the
     HORIZONTAL radius animates: the corner flattens sideways instead of
     shrinking uniformly into a circular dimple.
     ================================================================== */
  var EDSHAPE = (function () {
    var MORPH = 20;                        /* reference canon (explainer HUD):
                                              progress = clamp(gap/20px, 0, 1),
                                              LINEAR -- both the convex neck
                                              and the concave flare share the
                                              one 20px window */
    var STIFF = 520, DAMP = 46;            /* critically damped: the reference
                                              settle decays ~65%/frame with
                                              ZERO overshoot (measured off the
                                              clip at 60fps) */
    /* Glass-only liquid stretch/jiggle (Slint-portable: path rebuild + springs).
       Polish: smoothstep stretch, softer peak, fly→settle blend, short-hop skip. */
    var LIQUID_V_REF = 280;                /* |vx| that maps to full stretch */
    var LIQUID_DIST_REF = 70;              /* remaining travel (px) that sustains stretch */
    var LIQUID_STRETCH_MAX = 0.20;         /* max width inflate fraction */
    var LIQUID_JIGGLE_MS = 300;            /* settle pulse duration */
    var LIQUID_JIGGLE_AMP = 0.08;          /* crown / squash peak (~8%) */
    var LIQUID_BLEND_MS = 70;              /* fly→settle crossfade */
    var LIQUID_MIN_TRAVEL = 28;            /* px — shorter hops skip settle jiggle */
    var shapes = typeof WeakMap === 'function' ? new WeakMap() : null;

    function reduced() {
      if (document.documentElement.getAttribute('data-motion') === 'reduced') return true;
      if (document.documentElement.getAttribute('data-reduced-motion') === '1') return true;
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function isGlassTheme() {
      var t = document.documentElement.getAttribute('data-theme') || '';
      return t.indexOf('glass') === 0;
    }

    function smoothstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }

    function state(strip) {
      if (!shapes) return null;
      var s = shapes.get(strip);
      if (!s) {
        s = {
          x: null, w: null, vx: 0, vw: 0, tx: 0, tw: 0, raf: 0, track: null,
          lastActive: undefined,
          jiggleT: 0,          /* ms remaining in settle jiggle; 0 = idle */
          jiggleLead: 1,       /* last travel direction for lead flare bias */
          liquidScaleY: 1,     /* CSS scaleY during jiggle (1 = rest) */
          travelAccum: 0,      /* |Δx| this selection spring; gates settle */
          blendT: 0,           /* ms remaining in fly→settle blend */
          lastStretch: 0,      /* residual stretch at blend start */
          hopArmed: false      /* true when travelAccum crossed MIN_TRAVEL */
        };
        shapes.set(strip, s);
      }
      return s;
    }

    /* Chrome contract with the Home overlay (attachSurfaceControls in
       pm7-tools/home_workspace_source.py): the T20 move grip now lives at the
       surface's top-RIGHT corner, not in this strip, but the operative rule
       is unchanged -- the shape layer is absolutely positioned, so flex order
       is irrelevant to it: mount it LAST and never insert at firstChild, so
       overlay chrome reseats never fight this layer for the leading slot. */
    function ensure(strip) {
      var el = strip.querySelector(':scope > .ed-tab-shape');
      if (!el) {
        el = document.createElement('span');
        el.className = 'ed-tab-shape';
        el.setAttribute('aria-hidden', 'true');
        strip.appendChild(el);
      }
      strip.classList.add('ed-shape-on');
      return el;
    }

    /* Target box for the active tab in rail-local coordinates, plus the
       STATIC references the contact morph measures against.

       The old track (first/last laid tab's live rects) had two verified
       failure modes: dragging the DOM-first tab right made trackLeft its own
       moving edge (left gap frozen at 0, morph dead, then a one-frame pop on
       re-slot; mirrored on the right), and mid-FLIP neighbours wobbled the
       endpoints by up to a tab-width. The reference canon measures the gap
       to the NEAREST CONTACT per side -- the canvas/strip boundary or the
       adjacent tab's edge, whichever is closer -- against STATIC geometry:
       * canvas boundary = the strip's content box (padding-left is 0 by
         design; the right reserve is the pinned actions/kebab lane)
       * neighbour edges = offsetLeft/offsetWidth, which are LAYOUT values:
         immune to the drag glide and the neighbour FLIP transforms alike.
       The active tab's own box stays PAINTED (transform-inclusive) -- the
       fusion invariant: the surface rides the tab, and while it overlaps a
       neighbour the gap clamps to 0 (contact = flat), exactly the
       reference's ride-over reading. */
    function target(strip) {
      var active = strip.querySelector('.tab.active');
      if (!active || active.style.display === 'none') return null;
      var sr = strip.getBoundingClientRect();
      var ar = active.getBoundingClientRect();
      if (!ar.width) return null;
      /* Two reference frames:
         * caps (--ed-lp/rp) key off the strip BOX edges -- the canvas's real
           outer corners. The tab can never cross the trailing actions lane,
           so the right cap simply never flattens: truthful, it is never
           touched.
         * the SHAPE's flare contacts the CONTENT edge (the actions lane is
           furniture the tab can dock against) and the nearest neighbour. */
      var boxRight = strip.clientWidth;
      var contentRight = boxRight - (parseFloat(getComputedStyle(strip).paddingRight) || 0);
      var prevEdge = 0, nextEdge = contentRight;
      var tabs = strip.querySelectorAll('.tab');
      var seenActive = false;
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        if (t === active) { seenActive = true; continue; }
        if (t.style.display === 'none' || !t.offsetWidth) continue;
        if (!seenActive) prevEdge = Math.max(prevEdge, t.offsetLeft + t.offsetWidth);
        else { nextEdge = Math.min(nextEdge, t.offsetLeft); break; }
      }
      return { x: ar.left - sr.left, w: ar.width,
               trackLeft: 0, trackRight: boxRight,
               prevEdge: prevEdge, nextEdge: nextEdge };
    }

    /* Per-strip geometry cache: theme tokens + the shape element's box.
       Refreshed by sync() (boot, resize, theme change all route through it);
       per-frame paint() must not re-read computed styles. */
    function geo(strip) {
      var s = state(strip);
      if (s && s.geo) return s.geo;
      var cs = getComputedStyle(strip);
      var el = strip.querySelector(':scope > .ed-tab-shape');
      var g = {
        crownR: parseFloat(cs.getPropertyValue('--ed-top-radius')) || 13,
        shMax: parseFloat(cs.getPropertyValue('--ed-shoulder-rx-max')) || 10,
        cvMax: parseFloat(cs.getPropertyValue('--ed-canvas-rx-max')) || 12,
        flare: parseFloat(cs.getPropertyValue('--ed-flare')) || 22,
        h: el ? el.offsetHeight : (strip.offsetHeight - 1)
      };
      if (s) s.geo = g;
      return g;
    }

    /* One continuous silhouette as an SVG path (element-local px), replacing
       border-radius + masked shoulder pseudos. This is the bezier-path
       construction from the newest reference iteration: crown corners are
       superellipse-approximating cubics whose handle length morphs with the
       side's progress (arc at contact, squircle in the open -- the same
       1.0->1.6 character corner-shape gave Chromium, now identical in
       Safari), and each side descends through an ogee: a concave flare
       (cutout r = shoulder token x p) blending into a convex foot (neck r =
       canvas token x p) that lands tangent on the canvas line. clip-path
       clips the crown/canvas background stack, so the morph is the SHAPE
       itself -- visible in every theme regardless of cap contrast. */
    /* distort (optional, glass liquid): { stretch, lead, crownPulse }
       stretch = 0..STRETCH_MAX; lead = -1|1 travel dir; crownPulse = settle. */
    function edShapePath(g, w, lp, rp, distort) {
      var T = g.flare;                     /* static side margin in the box */
      var H = g.h;
      var crown = Math.min(g.crownR, w / 2);
      var stretch = distort && distort.stretch ? distort.stretch : 0;
      var lead = distort && distort.lead ? distort.lead : 0;
      var crownPulse = distort && distort.crownPulse ? distort.crownPulse : 0;
      if (crownPulse) {
        crown = Math.max(2, crown * (1 + crownPulse));
        H = Math.max(crown + 4, H * (1 - Math.abs(crownPulse) * 0.55));
      }
      /* Reference model (explainer HUD): the tab's side is ONE CONCAVE
         QUARTER-ARC -- vertical tangent at the wall, horizontal tangent on
         the canvas line, radius = shoulder token x progress. The convex
         "canvas r" corner is the PANEL's own corner (the strip-end caps),
         not part of this outline. The earlier ogee attempts stacked a convex
         foot under the cutout and read wrong at every handle tuning. */
      var K = 0.5523;                      /* quarter-arc kappa */
      var maxFl = Math.min(g.shMax, T, H - crown - 1);
      var flL = maxFl * lp, flR = maxFl * rp;
      /* Leading edge flares more while stretching; trailing slightly less. */
      if (stretch > 0.001 && lead) {
        if (lead > 0) {
          flR = Math.min(maxFl * 1.55, flR * (1 + stretch * 2.6));
          flL = flL * (1 - stretch * 0.55);
        } else {
          flL = Math.min(maxFl * 1.55, flL * (1 + stretch * 2.6));
          flR = flR * (1 - stretch * 0.55);
        }
      }
      var L = T, R = T + w;                /* tab walls */
      var kL = K + 0.25 * lp, kR = K + 0.25 * rp; /* crown superellipse morph */
      function n(v) { return (Math.round(v * 100) / 100); }
      var p = 'M ' + n(L - flL) + ' ' + n(H);
      if (flL >= 0.1) {
        /* concave quarter up: canvas -> wall */
        p += ' C ' + n(L - flL + K * flL) + ' ' + n(H) +
             ' ' + n(L) + ' ' + n(H - flL + K * flL) +
             ' ' + n(L) + ' ' + n(H - flL);
      }
      p += ' L ' + n(L) + ' ' + n(crown);
      p += ' C ' + n(L) + ' ' + n(crown - kL * crown) + ' ' + n(L + crown - kL * crown) + ' 0 ' + n(L + crown) + ' 0';
      p += ' L ' + n(R - crown) + ' 0';
      p += ' C ' + n(R - crown + kR * crown) + ' 0 ' + n(R) + ' ' + n(crown - kR * crown) + ' ' + n(R) + ' ' + n(crown);
      p += ' L ' + n(R) + ' ' + n(H - flR);
      if (flR >= 0.1) {
        /* concave quarter down: wall -> canvas */
        p += ' C ' + n(R) + ' ' + n(H - flR + K * flR) +
             ' ' + n(R + flR - K * flR) + ' ' + n(H) +
             ' ' + n(R + flR) + ' ' + n(H);
      }
      p += ' Z';
      return p;
    }

    /* Write position AND contact progress together. Progress is a pure
       function of the position passed in, so an animated frame and a dragged
       frame produce exactly the same shape for the same x.
       Two progress pairs with different references:
       * the SHAPE's per-side progress = gap to the NEAREST contact (canvas
         boundary or neighbour edge) -- consumed by the path builder here;
       * the CSS --ed-lp/--ed-rp = gap to the canvas boundary ONLY --
         consumed by the strip-end corner caps and the dashboard header caps,
         which are edge furniture and must not shrink when the tab merely
         nears a NEIGHBOUR mid-strip. */
    function paint(strip, x, w, track, distort) {
      if (!(w > 0)) return; /* never persist a degenerate (collapsed) shape */
      var tl = track ? track.left : 0;
      var tr = track ? track.right : x + w;
      var edgeLp = Math.max(0, Math.min(1, Math.max(0, x - tl) / MORPH));
      var edgeRp = Math.max(0, Math.min(1, Math.max(0, tr - (x + w)) / MORPH));
      var pe = track && track.prevEdge !== undefined ? track.prevEdge : tl;
      var ne = track && track.nextEdge !== undefined ? track.nextEdge : tr;
      var shapeLp = Math.max(0, Math.min(1, Math.max(0, x - pe) / MORPH));
      var shapeRp = Math.max(0, Math.min(1, Math.max(0, ne - (x + w)) / MORPH));
      var paintW = w;
      var paintX = x;
      if (distort && distort.stretch > 0.001) {
        /* Width inflate without changing spring target tw; bias toward lead.
           Kept below CSS scale so the two don't double-count as rubbery. */
        var inflate = w * distort.stretch * 0.7;
        paintW = w + inflate;
        if (distort.lead > 0) paintX = x - inflate * 0.15;
        else if (distort.lead < 0) paintX = x - inflate * 0.85;
        else paintX = x - inflate * 0.5;
      }
      strip.style.setProperty('--ed-shape-x', paintX.toFixed(2) + 'px');
      strip.style.setProperty('--ed-shape-w', paintW.toFixed(2) + 'px');
      strip.style.setProperty('--ed-lp', edgeLp.toFixed(3));
      strip.style.setProperty('--ed-rp', edgeRp.toFixed(3));
      var host = strip.parentElement;
      if (host) {
        host.style.setProperty('--ed-lp', edgeLp.toFixed(3));
        host.style.setProperty('--ed-rp', edgeRp.toFixed(3));
      }
      var el = strip.querySelector(':scope > .ed-tab-shape');
      if (el) {
        var g = geo(strip);
        el.style.clipPath = 'path("' + edShapePath(g, paintW, shapeLp, shapeRp, distort) + '")';
        var sx = distort && distort.scaleX != null ? distort.scaleX : 1;
        var sy = distort && distort.scaleY != null ? distort.scaleY : 1;
        if (sx !== 1 || sy !== 1) {
          /* Stretch forward along travel; squash from the canvas join. */
          var ox = '50%';
          if (distort && distort.lead > 0) ox = '12%';
          else if (distort && distort.lead < 0) ox = '88%';
          el.style.transformOrigin = ox + ' 100%';
          el.style.transform = 'scale(' + sx.toFixed(4) + ', ' + sy.toFixed(4) + ')';
        } else {
          el.style.transform = '';
          el.style.transformOrigin = '';
        }
      }
    }

    /* Glass-only velocity stretch + settle jiggle. Returns null when idle.
       mode: 'fly' | 'jiggle' | 'blend' */
    function liquidDistort(s, mode) {
      if (!s || !isGlassTheme() || reduced()) return null;
      var stretch = 0;
      var lead = s.jiggleLead || 0;
      var crownPulse = 0;
      var scaleX = 1;
      var scaleY = 1;

      function flyStretch() {
        var avx = Math.abs(s.vx);
        var dist = Math.abs(s.tx - s.x);
        var fromVel = smoothstep(Math.min(1, avx / LIQUID_V_REF)) * LIQUID_STRETCH_MAX;
        var fromDist = smoothstep(Math.min(1, dist / LIQUID_DIST_REF)) * LIQUID_STRETCH_MAX * 0.85;
        var st = Math.max(fromVel, fromDist);
        if (avx > 0.5) lead = s.vx >= 0 ? 1 : -1;
        else if (dist > 0.5) lead = (s.tx - s.x) >= 0 ? 1 : -1;
        if (lead) s.jiggleLead = lead;
        return st;
      }

      function applyFly(st) {
        stretch = st;
        /* Softer scale so CSS scale + path inflate don't stack rubbery. */
        scaleX = 1 + stretch * 0.55;
        scaleY = 1 - stretch * 0.28;
        crownPulse = stretch * 0.06;
        s.lastStretch = stretch;
      }

      function applyJiggle() {
        /* One slow cycle — soft jelly land, not a bounce train. */
        var u = 1 - (s.jiggleT / LIQUID_JIGGLE_MS);
        var env = Math.exp(-3.6 * u);
        var wave = Math.sin(u * Math.PI * 2);
        crownPulse = LIQUID_JIGGLE_AMP * env * wave;
        scaleX = 1 + crownPulse * 0.7;
        scaleY = 1 - crownPulse * 0.85;
        s.liquidScaleY = scaleY;
        lead = s.jiggleLead || 0;
      }

      if (mode === 'fly') {
        applyFly(flyStretch());
      } else if (mode === 'jiggle' && s.jiggleT > 0) {
        applyJiggle();
      } else if (mode === 'blend' && s.blendT > 0) {
        /* Crossfade residual fly stretch into settle pulse. */
        var bu = 1 - (s.blendT / LIQUID_BLEND_MS);
        var be = smoothstep(bu);
        var residual = (s.lastStretch || 0) * (1 - be);
        applyFly(residual);
        if (s.jiggleT > 0) {
          var ju = 1 - (s.jiggleT / LIQUID_JIGGLE_MS);
          var jenv = Math.exp(-3.6 * ju);
          var jwave = Math.sin(ju * Math.PI * 2);
          var jp = LIQUID_JIGGLE_AMP * jenv * jwave * be;
          crownPulse += jp;
          scaleX += jp * 0.7;
          scaleY -= jp * 0.85;
        }
        lead = s.jiggleLead || 0;
      }

      if (stretch < 0.002 && Math.abs(crownPulse) < 0.002 &&
          Math.abs(scaleX - 1) < 0.002 && Math.abs(scaleY - 1) < 0.002) return null;
      return {
        stretch: stretch, lead: lead, crownPulse: crownPulse,
        scaleX: scaleX, scaleY: scaleY
      };
    }

    function step(strip) {
      var s = state(strip);
      if (!s) return;
      s.raf = 0;
      var dt = 1 / 60;
      var glassLiquid = isGlassTheme() && !reduced();
      var draggingLive = Boolean(strip.querySelector('.tab.dragging'));
      if (draggingLive) {
        s.jiggleT = 0;
        s.blendT = 0;
        s._wantJiggle = false;
        s.hopArmed = false;
        s.travelAccum = 0;
        s.liquidScaleY = 1;
        s.lastStretch = 0;
      }
      var ax = (-STIFF * (s.x - s.tx) - DAMP * s.vx);
      var aw = (-STIFF * (s.w - s.tw) - DAMP * s.vw);
      s.vx += ax * dt; s.x += s.vx * dt;
      s.vw += aw * dt; s.w += s.vw * dt;
      if (glassLiquid && !draggingLive && s.x !== null) {
        var origin = (s._travelOriginX != null) ? s._travelOriginX : s.x;
        s.travelAccum = Math.max(s.travelAccum || 0, Math.abs((s.tx || 0) - origin));
        if (s.travelAccum >= LIQUID_MIN_TRAVEL) s.hopArmed = true;
      }
      var nearRest = Math.abs(s.x - s.tx) < 2.5 && Math.abs(s.vx) < 40 &&
                     Math.abs(s.w - s.tw) < 2.5 && Math.abs(s.vw) < 40;
      var done = Math.abs(s.x - s.tx) < 0.3 && Math.abs(s.vx) < 2 &&
                 Math.abs(s.w - s.tw) < 0.3 && Math.abs(s.vw) < 2;
      if (done) {
        s.x = s.tx; s.w = s.tw; s.vx = 0; s.vw = 0;
      }
      /* Arm settle when entering near-rest with enough travel; blend handoff. */
      if (glassLiquid && !draggingLive && nearRest && s.jiggleT <= 0 && s.blendT <= 0 && s.hopArmed) {
        s.blendT = LIQUID_BLEND_MS;
        s.jiggleT = LIQUID_JIGGLE_MS;
        s.hopArmed = false;
        s._wantJiggle = false;
      } else if (glassLiquid && !draggingLive && !nearRest) {
        s._wantJiggle = true;
      }
      if (s.blendT > 0) {
        s.blendT = Math.max(0, s.blendT - dt * 1000);
      }
      if (s.jiggleT > 0) {
        s.jiggleT = Math.max(0, s.jiggleT - dt * 1000);
        if (s.jiggleT <= 0) { s.liquidScaleY = 1; s.lastStretch = 0; }
      }
      var distort = null;
      if (glassLiquid && !draggingLive) {
        if (s.blendT > 0) distort = liquidDistort(s, 'blend');
        else if (!done && !nearRest) distort = liquidDistort(s, 'fly');
        else if (s.jiggleT > 0) distort = liquidDistort(s, 'jiggle');
        else if (!done) distort = liquidDistort(s, 'fly');
      }
      paint(strip, s.x, s.w, s.track, distort);
      if (!done || s.jiggleT > 0 || s.blendT > 0) s.raf = requestAnimationFrame(function () { step(strip); });
    }

    /* animate=false snaps (drag frames, resize, theme/motion change, boot).
       A SELECTION change always springs, whatever the caller asked for: picking a
       tab re-renders the strip, and that re-render's own snap-sync used to land
       first and leave the spring with nothing left to travel -- so the shape
       teleported between tabs instead of visibly moving. Layout-driven syncs
       (resize, fonts, theme, drag frames) still snap. */
    function sync(strip, animate) {
      if (!strip || !strip.isConnected) return;
      var t = target(strip);
      /* Unmeasurable (hidden page / mid-reparent / zero-size): apply NO chrome
         and write NO geometry -- a half-dressed strip (class on, vars dead) is
         exactly the failure the shipped rev exhibited. Retry ownership sits
         with edEnrolStrips' per-strip ResizeObserver and the body
         MutationObserver: the next measurable frame re-runs the owning
         fitter, whose tail re-syncs us. */
      if (!t) return;
      ensure(strip);
      var s = state(strip);
      if (s) s.geo = null; /* sync = boot/resize/theme/selection: re-read tokens
                              and the shape box here so per-frame paint() never
                              touches computed styles */
      var activeEl = strip.querySelector('.tab.active');
      var activeKey = activeEl ? (activeEl.getAttribute('data-file') || (activeEl.textContent || '').trim()) : null;
      var selectionChanged = (s.lastActive !== undefined && s.lastActive !== activeKey);
      if (selectionChanged) animate = true;
      s.lastActive = activeKey;
      /* drag is 1:1 by canon -- NO independent easing while a reorder gesture
         is live. Without this, grabbing a non-active tab flipped lastActive
         and SPRUNG the plate across (~12 frames); the carried tab paints
         nothing, so the tab underneath showed through the whole flight, and
         sub-0.5px moves fed the spring-preservation guard below, holding the
         hole open for slow drags. Snap instead: the plate must sit under the
         grabbed tab in the same frame the gesture activates. */
      var draggingLive = Boolean(strip.querySelector('.tab.dragging'));
      if (draggingLive) animate = false;
      /* retro is DISCRETE by design: the surface jumps between tabs like a
         character-cell cursor (the bake-off flourishes supply the motion);
         a smooth spring slide reads as the wrong decade there */
      if (animate && /^retro/.test(document.documentElement.getAttribute('data-theme') || '')) animate = false;
      var track = { left: t.trackLeft, right: t.trackRight, prevEdge: t.prevEdge, nextEdge: t.nextEdge };
      if (!s) { paint(strip, t.x, t.w, track); return; }
      var springInFlight = Boolean(s.raf);
      var previousTx = s.tx, previousTw = s.tw;
      s.tx = t.x; s.tw = t.w; s.track = track;
      if (!animate || reduced() || s.x === null) {
        /* A layout-driven snap must NOT kill an in-flight selection spring
           whose target box is unchanged: selecting a tab re-renders the strip
           and the fitter's second scheduled pass lands a snap-sync AFTER
           lastActive was consumed, which used to cancel the spring one frame
           in -- the shape teleported between tabs (the rev-13 lesson,
           regressed via the double-pass; caught by the frame-step harness). */
        if (springInFlight && !reduced() && s.x !== null && !draggingLive &&
            Math.abs(previousTx - t.x) < 0.5 && Math.abs(previousTw - t.w) < 0.5) {
          return;
        }
        if (s.raf) { cancelAnimationFrame(s.raf); s.raf = 0; }
        s.x = t.x; s.w = t.w; s.vx = 0; s.vw = 0;
        s.jiggleT = 0; s.blendT = 0; s._wantJiggle = false; s.liquidScaleY = 1;
        s.hopArmed = false; s.travelAccum = 0; s.lastStretch = 0;
        paint(strip, s.x, s.w, s.track, null);
        return;
      }
      /* New selection spring: mark travel origin so short hops skip settle. */
      if (selectionChanged || s._travelOriginX == null) {
        s._travelOriginX = s.x;
        s.travelAccum = 0;
        s.hopArmed = false;
        s.blendT = 0;
        s.jiggleT = 0;
      }
      if (!s.raf) s.raf = requestAnimationFrame(function () { step(strip); });
    }

    function syncAll(animate) {
      document.querySelectorAll('.editor-tabs, .dashboard-tabs').forEach(function (strip) { sync(strip, animate); });
    }

    /* pointer AND keyboard selection produce the same transition */
    document.addEventListener('click', function (e) {
      var tab = e.target && e.target.closest ? e.target.closest('.editor-tabs .tab, .dashboard-tabs .tab') : null;
      if (!tab) return;
      var strip = tab.closest('.editor-tabs, .dashboard-tabs');
      setTimeout(function () { sync(strip, true); }, 0);
    }, true);
    document.addEventListener('keyup', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key.indexOf('Arrow') !== 0) return;
      var tab = e.target && e.target.closest ? e.target.closest('.editor-tabs .tab, .dashboard-tabs .tab') : null;
      if (!tab) return;
      sync(tab.closest('.editor-tabs, .dashboard-tabs'), true);
    }, true);
    /* (the old dragover snap hook is gone: tab reorder is pointer-capture
       driven and part 25 calls sync(strip, false) itself on every move) */
    window.addEventListener('resize', function () { syncAll(false); });
    document.addEventListener('pm6:theme-changed', function () { syncAll(false); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { syncAll(false); }).catch(function () {});
    }

    return { sync: sync, syncAll: syncAll };
  })();
  window.PM6_EDTAB_SHAPE = EDSHAPE;

  /* ---------- retro tab motion (RETROMOTION) -----------------------------
     The three concepts (phosphor cursor / CRT redraw / DOS inversion) all
     shipped: every selection click rolls a different one from a shuffle
     bag (fair rotation, no immediate repeats). Reorder gestures ALWAYS
     use the DOS dashed cut-out wireframe -- selection rotation does not
     affect drag. Live ONLY when the active theme starts with "retro". All
     visuals live in pm-retro-* classes (10x-pm6-css-global); this IIFE
     only adds/removes them. It rides the SAME capture click wiring EDSHAPE
     uses, never stops propagation, and never touches .ed-tab-shape or the
     --ed-* variables: the silhouette snaps untouched beneath. Part 25 asks
     beginDrag() which always returns 'dos'; the dos gesture quantizes
     the glide to 8px character cells there. */
  var RETROMOTION = (function () {
    var PHOS_DITHER_MS = 240;  /* step 1 (dither) -> step 2 (solid hold) */
    var PHOS_HOLD_MS = 700;    /* 650ms solid-block fade + removal slack */
    var PHOS_GLOW_MS = 720;    /* 650ms afterglow fade + removal slack */
    var CRT_IN_MS = 340;       /* 300ms 6-step wipe + slack */
    var CRT_HOLD_MS = 540;     /* 500ms scanline-block fade + slack */
    var CRT_ROLL_MS = 200;     /* 170ms drop roll + slack */
    var DOS_BLINK_MS = 620;    /* 600ms double inversion blink + slack */
    var DOS_DROP_MS = 320;     /* 280ms single drop blink + slack */
    var MODES = ['phosphor', 'crt', 'dos'];

    function reduced() {       /* same gate EDSHAPE uses */
      if (document.documentElement.getAttribute('data-motion') === 'reduced') return true;
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    function retroOn() {
      return (document.documentElement.getAttribute('data-theme') || '').indexOf('retro') === 0;
    }
    /* User decision: all three concepts stay, rotating randomly per click.
       A shuffle bag guarantees fair rotation; the no-immediate-repeat guard
       keeps back-to-back clicks from ever feeling stuck. */
    var bag = [], lastMode = null;
    function roll() {
      if (!bag.length) {
        bag = MODES.slice();
        for (var i = bag.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = bag[i]; bag[i] = bag[j]; bag[j] = t;
        }
        if (bag[0] === lastMode && bag.length > 1) { bag.push(bag.shift()); }
      }
      lastMode = bag.shift();
      return lastMode;
    }
    function pulse(el, cls, ms) {
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;     /* restart the animation on rapid re-triggers */
      el.classList.add(cls);
      setTimeout(function () { el.classList.remove(cls); }, ms);
    }
    function findByKey(strip, key) {
      if (!key) return null;
      var tabs = strip.querySelectorAll('.tab');
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-file') === key) return tabs[i];
      }
      return null;
    }

    /* SELECTION CHANGE -- at capture time .active still marks the OUTGOING
       tab, so both ends are keyed BEFORE the app's own handlers (and any
       model re-render) run; the timeout then re-resolves live nodes. */
    document.addEventListener('click', function (e) {
      var tab = e.target && e.target.closest ? e.target.closest('.editor-tabs .tab, .dashboard-tabs .tab') : null;
      if (!tab || !retroOn() || reduced()) return;
      var strip = tab.closest('.editor-tabs, .dashboard-tabs');
      var out = strip ? strip.querySelector('.tab.active') : null;
      if (!out || out === tab) return;       /* not a selection change */
      var outKey = out.getAttribute('data-file');
      var stripSel = strip;
      setTimeout(function () {               /* after the app re-rendered */
        var s = stripSel.isConnected ? stripSel : null;
        if (!s) return;
        var act = s.querySelector('.tab.active');
        var prev = findByKey(s, outKey);
        if (!act || act === prev) return;    /* selection did not move */
        var m = roll();
        if (m === 'phosphor') {
          pulse(act, 'pm-retro-phos-in', PHOS_DITHER_MS);
          setTimeout(function () {
            if (act.isConnected && act.classList.contains('active')) pulse(act, 'pm-retro-phos-hold', PHOS_HOLD_MS);
          }, PHOS_DITHER_MS);
          if (prev) pulse(prev, 'pm-retro-phos-glow', PHOS_GLOW_MS);
        } else if (m === 'crt') {
          pulse(act, 'pm-retro-crt-in', CRT_IN_MS);
          setTimeout(function () {
            if (act.isConnected && act.classList.contains('active')) pulse(act, 'pm-retro-crt-hold', CRT_HOLD_MS);
          }, CRT_IN_MS);
        } else {
          pulse(act, 'pm-retro-dos-blink', DOS_BLINK_MS);
        }
      }, 0);
    }, true);

    /* REORDER -- part 25 asks for a gesture mode at its drag threshold.
       Drag ALWAYS uses the DOS dashed cut-out (pm-retro-drag-dos) and
       8px character-cell quantization; only selection clicks rotate. */
    var gestureMode = null, gestureTab = null;
    function beginDrag(tab) {
      if (!retroOn() || reduced()) { gestureMode = null; gestureTab = null; return null; }
      gestureMode = 'dos';
      gestureTab = tab;
      if (tab) tab.classList.add('pm-retro-drag-dos');
      return gestureMode;
    }
    /* This boot-time window listener registers BEFORE part 25's per-gesture
       pointerup listener, so at call time .dragging is still on the tab and
       the settle has not started. Drop cues use composed properties
       (translate / background) that never fight the inline settle glide. */
    window.addEventListener('pointerup', function () {
      if (!gestureTab) return;
      var drag = gestureTab.classList.contains('dragging') ? gestureTab : null;
      var m = gestureMode, t = gestureTab;
      gestureMode = null; gestureTab = null;
      if (drag && retroOn() && !reduced()) {
        if (m === 'crt') pulse(drag, 'pm-retro-crt-roll', CRT_ROLL_MS);
        else if (m === 'dos') pulse(drag, 'pm-retro-dos-drop', DOS_DROP_MS);
      }
      /* clear the carried-tab look after the settle finishes */
      setTimeout(function () {
        t.classList.remove('pm-retro-drag-phos', 'pm-retro-drag-crt', 'pm-retro-drag-dos');
      }, 600);
    }, true);

    return { beginDrag: beginDrag };
  })();
  window.PM6_RETRO_MOTION = RETROMOTION;

  /* ---------- shared tab-strip metrics -----------------------------------
     `.editor-tabs` reserves room on its right for the absolutely-pinned
     `.pane-tabbar-actions` cluster. That reserve was a hard-coded 28px, which
     stopped being true once anything else joined the cluster, so measure it. */
  /* True content-extent overflow test. scrollWidth CANNOT express "content
     reached into the reserved right padding": for non-overflowing content
     scrollWidth === clientWidth by definition, so subtracting the reserve
     from clientWidth made the comparison ALWAYS true and collapsed every
     tab. Measure the right edge of the last in-flow child instead and
     compare it against the content-box limit (strip width minus the
     reserved actions/kebab lane). */
  function edStripContentOverflows(strip) {
    var reserve = parseFloat(getComputedStyle(strip).paddingRight) || 0;
    var rect = strip.getBoundingClientRect();
    var limit = rect.left + strip.clientWidth - reserve;
    var kids = strip.children;
    var right = -Infinity;
    for (var i = 0; i < kids.length; i++) {
      var kid = kids[i];
      if (!kid.classList || kid.classList.contains('pane-tabbar-actions') ||
          kid.classList.contains('ed-tab-shape')) continue;
      if (kid.style.display === 'none') continue;
      var edge = kid.getBoundingClientRect().right;
      if (edge > right) right = edge;
    }
    return right > limit + 1;
  }

  function edMeasureActions(strip) {
    if (!strip) return;
    var actions = strip.querySelector('.pane-tabbar-actions');
    if (!actions) return;
    /* Reserve = distance from the cluster's LEFT edge to the strip's RIGHT
       edge (+8 gap), not the cluster's width alone: the cluster is pinned
       with a right offset, so the reserve now covers that offset too and the
       chip can never underlap right-edge chrome. */
    var sr = strip.getBoundingClientRect(), ar = actions.getBoundingClientRect();
    var w = ar.width ? Math.max(44, Math.ceil(sr.right - ar.left) + 8) : 44; /* floor 44: the kebab column (right:2, 16px wide) + grip live OUTSIDE the actions span now, so an empty span must still reserve their lane */
    strip.style.setProperty('--pm6-ed-actions-w', w + 'px');
  }

  /* ---------- generic per-strip overflow fitter ---------------------------
     Panes 1 and 2 keep their own model-aware fitters (they promote a hidden
     tab into the bar by swapping model entries). Every OTHER strip -- Home
     panels 3 and 4, and any strip added later -- is served by this one, which
     treats the DOM as the model. */
  function edGenericIsManaged(strip) {
    return !!(strip.closest('#editorPane1') || strip.closest('#editorPane2'));
  }

  function edGenericCloseMenu() {
    var menu = document.getElementById('pm-ed-generic-overflow-menu');
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
    document.querySelectorAll('.editor-tabs .pm-ed-overflow.active').forEach(function (c) { c.classList.remove('active'); });
  }

  function edGenericOpenMenu(strip, chip) {
    if (document.getElementById('pm-ed-generic-overflow-menu')) { edGenericCloseMenu(); return; }
    var hidden = strip._pmEdHidden || [];
    if (!hidden.length) return;
    var menu = document.createElement('div');
    menu.id = 'pm-ed-generic-overflow-menu';
    menu.className = 'pm-ed-overflow-menu';
    hidden.forEach(function (tab) {
      var row = document.createElement('button');
      row.type = 'button';
      var label = document.createElement('span');
      label.className = 'pm-ed-overflow-label';
      label.textContent = (tab.getAttribute('data-file') || tab.textContent || '').split('/').pop();
      label.title = tab.getAttribute('data-file') || '';
      row.appendChild(label);
      row.onclick = function (ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        edGenericCloseMenu();
        /* promote: move the hidden tab in front of the last visible one, then
           activate it and refit */
        var visible = Array.prototype.filter.call(strip.querySelectorAll('.tab'), function (t) { return t.style.display !== 'none'; });
        var anchor = visible[visible.length - 1] || strip.querySelector('.pane-tabbar-actions');
        if (anchor) strip.insertBefore(tab, anchor);
        strip.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        tab.style.display = '';
        tab.classList.add('active');
        var pane = strip.closest('.editor-pane');
        var prefix = pane && pane.getAttribute('data-pm-home-editor-prefix');
        var file = tab.getAttribute('data-file');
        if (prefix && file && typeof window.PM6_RENDER_FILE === 'function') {
          try { window.PM6_RENDER_FILE(file, prefix); } catch (e) {}
        }
        edFitStrip(strip);
      };
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    var r = chip.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
    menu.style.top = (r.bottom + 4) + 'px';
    chip.classList.add('active');
    /* sprout-in: let the hidden initial styles paint before opening */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
    });
    setTimeout(function () {
      document.addEventListener('click', function once(ev) {
        if (menu.contains(ev.target) || (ev.target.closest && ev.target.closest('.pm-ed-overflow'))) return;
        document.removeEventListener('click', once, true);
        edGenericCloseMenu();
      }, true);
    }, 0);
  }

  /* Editor tabs were pointer-only: rendered as bare <span> with no tabIndex, so
     they could not be reached, let alone activated, from the keyboard. Give every
     tab the roving-tab semantics its role implies. */
  function edMakeTabsFocusable(strip) {
    strip.querySelectorAll('.tab').forEach(function (tab) {
      if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
      if (!tab.hasAttribute('tabindex')) tab.setAttribute('tabindex', '0');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    });
  }

  function edFitStrip(strip) {
    if (!strip) return;
    edMeasureActions(strip);
    edMakeTabsFocusable(strip);
    if (edGenericIsManaged(strip)) {
      /* keep the model-aware fitters authoritative for panes 1 and 2 */
      if (strip.closest('#editorPane1')) edScheduleFit();
      else ed2ScheduleFit();
      return;
    }
    edReassertOrder(strip); /* DOM-owned strips re-apply persisted drag order */
    /* chip reuse via display toggles: see edFitOverflow for why */
    var chip = strip.querySelector('.pm-ed-overflow');
    /* keep the chip immediately left of the actions cluster: a drag-reorder
       insert can land a tab to the chip's right. Positional guard = zero
       mutations in steady state, so no observer ping-pong. */
    var actionsEl = strip.querySelector('.pane-tabbar-actions');
    if (chip && actionsEl && chip.nextElementSibling !== actionsEl) strip.insertBefore(chip, actionsEl);
    if (chip) chip.style.display = 'none';
    strip._pmEdHidden = [];
    var all = Array.prototype.slice.call(strip.querySelectorAll('.tab'));
    all.forEach(function (t) { t.style.display = ''; });
    if (!strip.clientWidth) return; /* not laid out yet — refit fires on resize */
    var guard = all.length + 1;
    while (edStripContentOverflows(strip) && guard-- > 0) {
      var visible = all.filter(function (t) { return t.style.display !== 'none'; });
      if (visible.length <= 1) break;
      var pick = null;
      for (var i = visible.length - 1; i >= 0; i--) {
        if (visible[i].classList.contains('active')) continue; /* active always stays */
        pick = visible[i];
        break;
      }
      if (!pick) break;
      pick.style.display = 'none';
      strip._pmEdHidden.unshift(pick);
      if (!chip) {
        chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pm-ed-overflow';
        chip.title = 'Collapsed editor tabs';
        chip.onclick = function (ev) { if (ev) ev.stopPropagation(); edGenericOpenMenu(strip, chip); };
        strip.insertBefore(chip, strip.querySelector('.pane-tabbar-actions'));
      }
      chip.style.display = '';
      var labelG = '+' + strip._pmEdHidden.length + ' more';
      if (chip.textContent !== labelG) chip.textContent = labelG;
    }
    if (chip && !strip._pmEdHidden.length) chip.style.display = 'none';
    if (window.PM6_EDTAB_SHAPE) window.PM6_EDTAB_SHAPE.sync(strip, false);
  }
  window.PM6_FIT_EDITOR_TABS = edFitStrip;

  /* Identity key for a tab in a strip whose order lives in the DOM: the file
     path when there is one, else the trimmed label text. Must be computed the
     same way at persist time and at reassert time. */
  function edTabKey(tab) {
    return tab.getAttribute('data-file') || (tab.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* Re-apply a strip's persisted drag order (strip._pmEdOrder) to its DOM.
     Unknown tabs (opened after the last drag) keep their DOM position at the
     end of the known run. Touches the DOM only when the order differs, so
     steady-state fits stay mutation-free. */
  function edReassertOrder(strip) {
    var order = strip._pmEdOrder;
    if (!order || order.length < 2) return;
    var tabs = Array.prototype.slice.call(strip.querySelectorAll('.tab'));
    if (tabs.length < 2) return;
    var known = [], unknown = [];
    tabs.forEach(function (t) {
      (order.indexOf(edTabKey(t)) === -1 ? unknown : known).push(t);
    });
    known.sort(function (a, b) { return order.indexOf(edTabKey(a)) - order.indexOf(edTabKey(b)); });
    var seq = known.concat(unknown);
    var differs = false;
    for (var i = 0; i < tabs.length; i++) { if (seq[i] !== tabs[i]) { differs = true; break; } }
    if (!differs) return;
    /* anchor on the chip when present: after a drag lands a tab past the chip,
       the last tab's nextSibling is the actions cluster, and re-inserting the
       run there would leave the chip stranded mid-run */
    var ref = strip.querySelector('.pm-ed-overflow') || tabs[tabs.length - 1].nextSibling;
    seq.forEach(function (t) { strip.insertBefore(t, ref); });
  }

  /* Write a strip's DOM order back into the model that owns it, so a later
     re-render does not undo a drag-reorder. Pane 1's order lives in
     S.files.openTabs; every other strip owns its order in the DOM, so persist
     it on the strip and let the fitters reassert it after any re-render. The
     pm6:ed-tab-order event lets the Home overlay mirror the order into its
     own per-panel model (buffer_ids) for panes 3/4. */
  function edPersistTabOrder(strip) {
    if (!strip) return;
    if (strip.closest('#editorPane1')) {
      var st = edState();
      var order = Array.prototype.map.call(strip.querySelectorAll('.tab[data-file]'), function (t) {
        return t.getAttribute('data-file');
      }).filter(function (p) { return st.openTabs.indexOf(p) !== -1; });
      st.openTabs.forEach(function (p) { if (order.indexOf(p) === -1) order.push(p); });
      st.openTabs.length = 0;
      order.forEach(function (p) { st.openTabs.push(p); });
      var active = strip.querySelector('.tab.active[data-file]');
      if (active) st.activeTab = active.getAttribute('data-file');
    } else {
      strip._pmEdOrder = Array.prototype.map.call(strip.querySelectorAll('.tab'), edTabKey);
      var pane = strip.closest('.editor-pane');
      if (pane && pane.id) {
        try {
          document.dispatchEvent(new CustomEvent('pm6:ed-tab-order', {
            detail: { pane_id: pane.id, order: strip._pmEdOrder.slice() }
          }));
        } catch (e) {}
      }
    }
    edFitStrip(strip);
  }
  window.PM6_PERSIST_TAB_ORDER = edPersistTabOrder;

  /* Enrol every strip that exists now, and any that appears later. */
  var edStripObserved = typeof WeakSet === 'function' ? new WeakSet() : null;
  function edEnrolStrips() {
    document.querySelectorAll('.editor-tabs').forEach(function (strip) {
      if (edStripObserved && edStripObserved.has(strip)) return;
      if (edStripObserved) edStripObserved.add(strip);
      if (typeof ResizeObserver !== 'undefined') {
        try { new ResizeObserver(function () { edFitStrip(strip); }).observe(strip); } catch (e) {}
      }
      /* childList companion to the RO: adding or closing a TAB does not
         change the strip's own box, so the RO never fires and the overflow
         chip goes stale until the next resize. Watch the strip's children for
         tab adds/removes and refit. Chip (.pm-ed-overflow) reseats are
         ignored -- they are fitter OUTPUT, and reacting to them would
         ping-pong; ditto anything mid-drag (the drag's own inserts). */
      if (typeof MutationObserver === 'function') {
        try {
          new MutationObserver(function (records) {
            if (strip.querySelector('.tab.dragging')) return;
            var hit = false;
            for (var ri = 0; ri < records.length && !hit; ri++) {
              var lists = [records[ri].addedNodes, records[ri].removedNodes];
              for (var li = 0; li < 2 && !hit; li++) {
                for (var ni = 0; ni < lists[li].length; ni++) {
                  var n = lists[li][ni];
                  if (n && n.nodeType === 1 && n.classList && n.classList.contains('tab')) { hit = true; break; }
                }
              }
            }
            if (!hit) return;
            /* mirror edFitStrip's managed dispatch; the pane 1/2 schedulers
               already rAF-coalesce, generic strips get a per-strip flag */
            if (strip.closest('#editorPane1')) { edScheduleFit(); return; }
            if (strip.closest('#editorPane2')) { ed2ScheduleFit(); return; }
            if (strip._pmEdMoQueued) return;
            strip._pmEdMoQueued = true;
            var runMo = function () { strip._pmEdMoQueued = false; edFitStrip(strip); };
            if (document.hidden) { setTimeout(runMo, 50); return; }
            requestAnimationFrame(runMo);
          }).observe(strip, { childList: true });
        } catch (e) {}
      }
      edFitStrip(strip);
    });
    edEnrolDashStrips();
  }

  /* Dashboard strips adopt the same silhouette but NOT the editor's
     overflow fitter: three fixed tabs never overflow, and edFitStrip's
     model bookkeeping (hidden-tab promotion, +N chip) has nothing to do
     here. Enrolment = ARIA tab semantics + a resize re-sync + first sync.
     Called from edEnrolStrips' tail, so the body MutationObserver and the
     boot timeouts that already re-run enrolment cover these strips too. */
  var edDashStripObserved = typeof WeakSet === 'function' ? new WeakSet() : null;
  function edEnrolDashStrips() {
    document.querySelectorAll('.dashboard-tabs').forEach(function (strip) {
      if (edDashStripObserved && edDashStripObserved.has(strip)) return;
      if (edDashStripObserved) edDashStripObserved.add(strip);
      strip.querySelectorAll('.tab').forEach(function (t) {
        t.setAttribute('role', 'tab');
        t.setAttribute('tabindex', '0');
        t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
      });
      if (typeof ResizeObserver !== 'undefined') {
        try { new ResizeObserver(function () { EDSHAPE.sync(strip, false); }).observe(strip); } catch (e) {}
      }
      EDSHAPE.sync(strip, false);
    });
  }
  window.PM6_ENROL_EDITOR_TABS = edEnrolStrips;

  document.addEventListener('keydown', function (e) {
    var tab = e.target && e.target.closest ? e.target.closest('.editor-tabs .tab') : null;
    if (!tab) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      tab.click();
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    var strip = tab.closest('.editor-tabs');
    var vis = Array.prototype.filter.call(strip.querySelectorAll('.tab'), function (t) { return t.style.display !== 'none'; });
    var i = vis.indexOf(tab);
    if (i === -1) return;
    e.preventDefault();
    var next = e.key === 'Home' ? 0
      : e.key === 'End' ? vis.length - 1
      : e.key === 'ArrowLeft' ? Math.max(0, i - 1)
      : Math.min(vis.length - 1, i + 1);
    if (vis[next]) { vis[next].focus(); vis[next].click(); }
  }, true);

  function initEditorTabs() {
    edEnsureSeed();
    renderEditorTabs();
    document.addEventListener('click', edDelegatedClose, true);
    var strip = edStrip();
    if (strip && typeof ResizeObserver !== 'undefined') {
      try {
        new ResizeObserver(function () { edMeasureActions(strip); edScheduleFit(); }).observe(strip);
      } catch (e) {}
    }
    window.addEventListener('resize', edScheduleFit);
    /* pane 2 overflow: observe its strip (parity with pane 1 — same target,
       same fit-on-resize contract). */
    var strip2 = ed2Strip();
    if (strip2 && typeof ResizeObserver !== 'undefined') {
      try {
        new ResizeObserver(function () { edMeasureActions(strip2); ed2ScheduleFit(); }).observe(strip2);
      } catch (e) {}
    }
    window.addEventListener('resize', ed2ScheduleFit);
    window.addEventListener('resize', edEnrolStrips);
    /* strips created later (Home panels 3/4, browser tabs) enrol themselves */
    if (typeof MutationObserver === 'function') {
      try {
        new MutationObserver(function (records) {
          var needsEnrollment = records.some(function (record) {
            return Array.prototype.some.call(record.addedNodes || [], function (node) {
              return node && node.nodeType === 1 && ((node.matches && node.matches('.editor-tabs,.dashboard-tabs')) || (node.querySelector && node.querySelector('.editor-tabs,.dashboard-tabs')));
            });
          });
          if (needsEnrollment) edEnrolStrips();
        }).observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }
    /* initial fit once layout settles */
    setTimeout(function () { try { ed2FitOverflow(); } catch (e) {} edEnrolStrips(); }, 0);
    setTimeout(edEnrolStrips, 600);
  }

  /* ==========================================================
     Widget catalog renderers (8 entries)
     ========================================================== */
  function lane(nameTxt, cls, width, val) {
    return '<div class="pm6-dash-lane"><span class="pm6-dash-lane-name">' + nameTxt +
      '</span><span class="pm6-dash-bar"><span class="pm6-dash-bar-fill ' + cls + '" style="width:' + width + '%;"></span></span>' +
      '<span class="pm6-dash-lane-val">' + val + '</span></div>';
  }
  function row(mainTxt, chipCls, chipTxt, t) {
    return '<div class="pm6-dash-row"><span class="pm6-dash-row-main">' + mainTxt +
      '</span><span class="pm6-dash-chip ' + chipCls + '">' + chipTxt + '</span><span class="pm6-dash-row-t">' + t + '</span></div>';
  }
  function spark(pointsArr, tall) {
    var H = tall ? 44 : 34, W = 120, n = pointsArr.length;
    var pts = pointsArr.map(function (v, i) {
      return Math.round(i * (W / (n - 1))) + ',' + Math.round(H - 4 - v * (H - 8));
    }).join(' ');
    return '<svg class="pm6-dash-spark' + (tall ? ' pm6-dash-spark--tall' : '') + '" viewBox="0 0 120 ' + H +
      '" preserveAspectRatio="none" aria-hidden="true"><polyline class="pm6-dash-spark-fill" points="' + pts + ' 120,' + H + ' 0,' + H +
      '"></polyline><polyline class="pm6-dash-spark-line" points="' + pts + '"></polyline></svg>';
  }
  function donut(pct, big, small) {
    var Cc = 119.4, off = Math.round(Cc * (1 - pct / 100) * 10) / 10;
    return '<div class="pm6-dash-donut-row"><svg viewBox="0 0 48 48" class="pm6-dash-donut" aria-hidden="true">' +
      '<circle class="pm6-dash-ring-track" cx="24" cy="24" r="19"></circle>' +
      '<circle class="pm6-dash-ring-val" cx="24" cy="24" r="19" stroke-dasharray="' + Cc + '" stroke-dashoffset="' + off + '"></circle></svg>' +
      '<div class="pm6-dash-donut-meta"><b>' + big + '</b><small>' + small + '</small></div></div>';
  }
  function rnd(n, lo, hi) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(lo + Math.random() * (hi - lo));
    return out;
  }

  var CATALOG = {
    quota_summary: { title: 'Quota summary', icon: 'scales', w: 2, h: 1, body: function () {
      return lane('Claude &middot; Pro &middot; 5h', 'is-warn', D.usagePct, D.usagePct + '%') +
             lane('Claude &middot; 7d', '', 41, '41%') +
             lane('Codex &middot; plan &middot; 5h', '', 64, '64%') +
             lane('Cursor &middot; inferred', '', 52, 'est.');
    } },
    analytics_chart: { title: 'Usage analytics', icon: 'wave', w: 2, h: 2, body: function () {
      return spark(rnd(12, 0.15, 0.95), true) +
        '<div class="pm6-dash-metric-sub">tokens/hour &middot; peak 92k &middot; cache-read 31% (measured)</div>' +
        lane('input', '', 58, '58%') + lane('output', 'is-run', 22, '22%') + lane('cache write', 'is-done', 9, '9%');
    } },
    budget_donuts: { title: 'Budget donuts', icon: 'swirl', w: 2, h: 2, body: function () {
      return donut(62, '$8.12', 'Claude &middot; of $13 cycle') +
             donut(36, '$2.90', 'Codex API &middot; of $8 cycle') +
        '<div class="pm6-dash-metric-sub">cost attributed to effective_account_id &middot; jared@main</div>';
    } },
    tool_usage: { title: 'Tool usage', icon: 'toolbox', w: 2, h: 2, body: function () {
      return row('run_shell_command &middot; 412 calls', 'pm6-dash-chip--pass', 'p50 0.4s', '0.2% err') +
             row('apply_patch &middot; 168 calls', 'pm6-dash-chip--pass', 'p50 0.7s', '0.6% err') +
             row('web_search &middot; 54 calls', 'pm6-dash-chip--run', 'p95 2.8s', '1.1% err') +
             row('index_lookup &middot; 913 calls', 'pm6-dash-chip--pass', 'index_used 88%', '0% err');
    } },
    multi_account: { title: 'Accounts &amp; pressure', icon: 'masks', w: 2, h: 2, body: function () {
      return row('jared@main &middot; active + effective', 'pm6-dash-chip--pass', 'healthy', 'now') +
             row('jared@backup &middot; cooldown', 'pm6-dash-chip--warn', 'pressure: high', '00:41') +
             row('team-bot &middot; last seen 2d', 'pm6-dash-chip--warn', 'Stale', '2d') +
        '<div class="pm6-dash-metric-sub">1 switch this run &mdash; reason: rate_limit_pressure</div>';
    } },
    lane_health: { title: 'Lane health', icon: 'layers', w: 2, h: 1, body: function () {
      return row('lane-b worktree &middot; wt/lane-b-api', 'pm6-dash-chip--pass', 'clean', 'now') +
             row('lane-c worktree &middot; wt/lane-c-web', 'pm6-dash-chip--run', 'building', 'now') +
             row('n-19 recovery &middot; safe-point retry', 'pm6-dash-chip--warn', 'degraded', 't+85');
    } },
    approval_queue: { title: 'Approval queue', icon: 'clipboard', w: 2, h: 1, body: function () {
      if (D.gateOpen) {
        return row('Run #47 &middot; publish package: image-processing', 'pm6-dash-chip--gate', 'gate', 'n-13') +
          '<div class="pm6-dash-orch-foot"><button class="pm6-dash-btn pm6-dash-btn--primary" data-demo-action="dash.gate.approve">Approve</button>' +
          '<button class="pm6-dash-btn" data-demo-action="dash.gate.details">View details</button></div>';
      }
      return '<div class="pm6-dash-empty">No data yet &mdash; approvals appear when a run hits a gate.</div>';
    } },
    worktree_state: { title: 'Worktree state', icon: 'branch', w: 2, h: 1, body: function () {
      return row('wt/lane-b-api &middot; Orch: lane-b', 'pm6-dash-chip--pass', 'clean', '38m') +
             row('wt/import-url &middot; Thread: Import from URL', 'pm6-dash-chip--run', 'dirty', '2h') +
             row('wt/hotfix-nav &middot; Manual', 'pm6-dash-chip--warn', 'Stale', '9d');
    } }
  };

  function widgetShell(kind, def) {
    return '<header class="pm6-dash-card-head">' +
      '<span class="pm6-dash-drag" data-pm6-dash="drag" title="Drag to reorder" aria-label="Drag to reorder widget"></span>' +
      '<span class="pm6-ico pm6-dash-card-ico pm-hover-icon" data-pm6-icon="' + def.icon + '"></span>' +
      '<h3 class="pm6-dash-card-title">' + def.title + '</h3>' +
      '<button class="pm6-dash-iconbtn" data-pm6-dash="gear" title="Widget settings: time window, filter"><span class="pm6-ico" data-pm6-icon="gear"></span></button>' +
      '<button class="pm6-dash-iconbtn" data-pm6-dash="remove" title="Remove widget">&#10005;</button>' +
      '</header>' +
      '<div class="pm6-dash-card-body" data-widget-body>' + def.body() + '</div>' +
      '<span class="pm6-dash-resize" data-pm6-dash="resize" title="Drag to resize (snaps to grid)"></span>';
  }

  /* engine catalog kind <-> local catalog kind (engine adds arrive via dash.widget) */
  var ENGINE_KINDS = {
    'widget-quota-summary': 'quota_summary',
    'widget-approval-queue': 'approval_queue',
    'widget-account-pressure': 'multi_account',
    'widget-worktree-state': 'worktree_state'
  };

  function addWidget(kind, quiet) {
    var def = CATALOG[kind];
    if (!def) { say('That widget is not in the catalog yet (demo_scope).'); return; }
    if (D.added[kind]) { if (!quiet) say('Already on the grid (already_done) — remove it first to re-add.'); return; }
    var host = document.getElementById('dashGridMain');
    if (!host) return;
    var card = document.createElement('article');
    card.className = 'pm6-dash-card pm-sheen';
    card.setAttribute('data-widget-kind', kind);
    card.setAttribute('data-widget-id', 'pm6-dash-' + kind.replace(/[._]/g, '-'));
    card.style.setProperty('--dw', def.w);
    card.style.setProperty('--dh', def.h);
    card.style.setProperty('--i', 0);
    card.innerHTML = widgetShell(kind, def);
    host.appendChild(card);
    injectIcons(card);
    D.added[kind] = true;
    var item = $('.pm6-dash-catalog-item[data-demo-action="dash.add.' + kind + '"]');
    if (item) item.classList.add('pm6-is-added');
    closeCatalog();
    goSubtab('Main');
    card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (!quiet) say('"' + def.title.replace(/&amp;/g, '&') + '" added to the Main grid.');
  }

  function refreshKind(kind) {
    $$('.pm6-dash-card[data-widget-kind="' + kind + '"]').forEach(function (card) {
      var def = CATALOG[kind];
      var body = card.querySelector('[data-widget-body]');
      if (def && body) { body.innerHTML = def.body(); injectIcons(card); }
    });
  }

  /* ==========================================================
     Catalog overlay
     ========================================================== */
  function openCatalog() {
    var c = document.getElementById('pm6DashCatalog');
    if (!c) return;
    c.hidden = false;
    injectIcons(c);
    var first = c.querySelector('.pm6-dash-catalog-item');
    if (first) try { first.focus(); } catch (e) {}
  }
  function closeCatalog() {
    var c = document.getElementById('pm6DashCatalog');
    if (c) c.hidden = true;
  }

  /* ==========================================================
     Subtabs (Main / Metrics / Monitoring) — part 25 owns the
     click behavior; we just provide programmatic routing.
     ========================================================== */
  function goSubtab(label) {
    var want = String(label || 'Main').toLowerCase();
    var map = { main: 'Main', metrics: 'Metrics', monitoring: 'Monitoring' };
    var target = map[want] || 'Main';
    $$('.dashboard-tabs .tab').forEach(function (t) {
      if (t.textContent.trim() === target && !t.classList.contains('active')) t.click();
    });
  }
  try {
    if (window.PM_PAGES && window.PM_PAGES.registerSubtab) {
      window.PM_PAGES.registerSubtab('dashboard', goSubtab);
    }
  } catch (e) {}

  /* ==========================================================
     Live widget updates (run.* / usage.*)
     ========================================================== */
  function setRing(pct) {
    D.pct = Math.max(0, Math.min(100, Math.round(pct)));
    var ringVal = $('.pm6-dash-card[data-widget-kind="orchestrator-progress"] .pm6-dash-ring-val');
    if (ringVal) ringVal.setAttribute('stroke-dashoffset', (188.5 * (1 - D.pct / 100)).toFixed(1));
    var lbl = $('[data-orch-pct]');
    if (lbl) lbl.textContent = D.pct + '%';
  }
  function setChip(txt, cls) {
    $$('[data-live-chip]').forEach(function (chip) {
      chip.textContent = txt;
      chip.className = 'pm6-dash-chip ' + (cls || 'pm6-dash-chip--live');
    });
  }
  function setOrchLine(txt) {
    var el = $('[data-orch-line]');
    if (el && txt) el.textContent = txt;
  }
  function pushResult(mainTxt, verdict) {
    var host = $('[data-results-rows]');
    if (!host) return;
    var empty = $('[data-results-empty]');
    if (empty) empty.hidden = true;
    var div = document.createElement('div');
    div.className = 'pm6-dash-row pm6-row-new';
    var cls = verdict === 'failed' ? 'pm6-dash-chip--fail' : verdict === 'degraded' ? 'pm6-dash-chip--warn' : 'pm6-dash-chip--pass';
    div.innerHTML = '<span class="pm6-dash-row-main">' + esc(mainTxt) + '</span>' +
      '<span class="pm6-dash-chip ' + cls + '">' + esc(verdict || 'passed') + '</span><span class="pm6-dash-row-t">now</span>';
    host.insertBefore(div, host.firstChild);
    while (host.children.length > 6) host.removeChild(host.lastChild);
  }
  var METRICS = [
    { label: 'PlanUnits built', val: function () { return D.nodesDone; }, sub: '+4 this run &middot; query: planunits_built &middot; refresh 30s' },
    { label: 'Nodes complete', val: function () { return Math.round(D.pct * 0.4); }, sub: 'run #47 &middot; query: nodes_complete &middot; refresh 30s' },
    { label: null }
  ];
  function cycleMetric() {
    D.metricIdx = (D.metricIdx + 1) % METRICS.length;
    var m = METRICS[D.metricIdx];
    var card = $('.pm6-dash-card[data-widget-kind="custom-metrics"]');
    if (!card) return;
    var metric = card.querySelector('.pm6-dash-metric');
    var sub = card.querySelector('[data-metric-sub]');
    var empty = card.querySelector('[data-metric-empty]');
    if (!m.label) {
      if (metric) metric.style.display = 'none';
      if (sub) sub.style.display = 'none';
      if (empty) empty.hidden = false;
      say('Metric cleared — widget shows its Not configured state.');
      return;
    }
    if (metric) metric.style.display = '';
    if (sub) { sub.style.display = ''; sub.innerHTML = m.sub; }
    if (empty) empty.hidden = true;
    var v = card.querySelector('[data-metric-val]');
    var u = card.querySelector('[data-metric-unit]');
    if (v) v.textContent = String(m.val());
    if (u) u.textContent = m.label;
    say('Custom metric → ' + m.label);
  }

  /* ---------- CTA cards ---------- */
  var GATE_DEFAULT_BTNS =
    '<button class="pm6-dash-btn pm6-dash-btn--primary" data-demo-action="dash.gate.approve">Approve</button>' +
    '<button class="pm6-dash-btn" data-demo-action="dash.gate.decline">Decline</button>' +
    '<button class="pm6-dash-btn pm6-dash-btn--ghost" data-demo-action="dash.gate.details">View details</button>';
  function showGateCta(payload) {
    D.gateOpen = true;
    D.gateId = (payload && (payload.id || payload.gateId)) || 'gate-n13';
    var cta = document.getElementById('pm6DashCtaHitl');
    if (cta) {
      cta.hidden = false;
      cta.classList.remove('pm6-dash-cta--blocked');
      /* restore default content (a prior decline replaces title/sub/buttons) */
      var title = cta.querySelector('.pm6-dash-cta-title');
      var sub = cta.querySelector('.pm6-dash-cta-sub');
      var btns = cta.querySelector('.pm6-dash-cta-btns');
      if (title) title.textContent = 'Approval needed — ' + ((payload && payload.label) || 'publish package: image-processing');
      if (sub) sub.textContent = (payload && payload.question) ||
        'Run #47 is holding at node n-13. A chat thread "Approval: Package Gate" was opened — resolve here or there.';
      if (btns) btns.innerHTML = GATE_DEFAULT_BTNS;
      cta.classList.add('pm6-cta-pulse');
      injectIcons(cta);
      setTimeout(function () { cta.classList.remove('pm6-cta-pulse'); }, 3000);
    }
    setChip('Needs Attention', 'pm6-dash-chip--warn');
    setOrchLine('Holding at n-13 — HITL gate: publish package image-processing');
    refreshKind('approval_queue');
  }
  function resolveGate(approved, silent) {
    /* silent = mirroring a resolution that happened in chat/orchestrator —
       render only, never toast (the resolving surface already toasted) */
    if (!D.gateOpen) { if (!silent) say('No pending approval right now (already_done).'); return; }
    D.gateOpen = false;
    var cta = document.getElementById('pm6DashCtaHitl');
    var engineToasted = false;
    try {
      var run = window.PM_DEMO && window.PM_DEMO.run;
      /* engine facades are idempotent (already_done) — safe when the engine initiated this */
      if (run && approved && run.approveGate) { var r0 = run.approveGate(D.gateId); engineToasted = !!(r0 && r0.ok); }
      else if (run && !approved && run.declineGate) { var r1 = run.declineGate(D.gateId); engineToasted = !!(r1 && r1.ok); }
    } catch (e) {}
    if (approved) {
      if (cta) cta.hidden = true;
      setChip('Running', 'pm6-dash-chip--live');
      setOrchLine('Resumed — lane-b: publishing package image-processing');
      if (!silent && !engineToasted) say('Approved — run #47 resuming past node n-13.');
    } else {
      if (cta) {
        cta.classList.add('pm6-dash-cta--blocked');
        var title = cta.querySelector('.pm6-dash-cta-title');
        var sub = cta.querySelector('.pm6-dash-cta-sub');
        var btns = cta.querySelector('.pm6-dash-cta-btns');
        if (title) title.textContent = 'Declined — node n-13 is blocked';
        if (sub) sub.textContent = 'Blocked-owner: User. n-13 is parked at safe point sp-47a9 — retry re-raises the approval.';
        if (btns) btns.innerHTML =
          '<button class="pm6-dash-btn pm6-dash-btn--primary" data-demo-action="run.safe_point_retry" data-command="cmd.orchestrator.safe_point_retry">Retry from safe point</button>' +
          '<button class="pm6-dash-btn" data-demo-action="dash.gate.details">Open Orchestrator</button>' +
          '<button class="pm6-dash-btn pm6-dash-btn--ghost" data-pm6-dash="cta-dismiss">Dismiss</button>';
      }
      setChip('Blocked', 'pm6-dash-chip--fail');
      setOrchLine('Blocked at n-13 — declined by user; safe-point retry available');
      if (!silent && !engineToasted) say('Declined — node n-13 marked blocked (safe-point retry available).');
    }
    refreshKind('approval_queue');
  }

  function fmtCooldown(s) {
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(h) + ':' + p(m) + ':' + p(x);
  }

  /* ==========================================================
     Drag-to-reorder (HTML5 DnD, handle-initiated)
     ========================================================== */
  var dragCard = null;
  function clearDropMarks() {
    $$('.pm6-dash-card').forEach(function (c) { c.classList.remove('pm6-drop-before', 'pm6-drop-after'); });
  }
  /* ==========================================================
     Widget reorder — u11-prism vocabulary (_shared/usage-widgets.js).

     Replaces the old HTML5 drag-and-drop, which only drew a
     before/after marker on the hovered card and moved anything at
     drop time: nothing reflowed while you dragged, so the board
     gave no feedback about where the widget would land.

     Now: the grabbed card is lifted as a fixed clone tracking the
     pointer 1:1, its vacated cell becomes a real in-flow
     placeholder with the same grid span, and every other card FLIPs
     to its new position on each slot change. Nothing re-renders, so
     chart DOM inside widget bodies survives the drag untouched.
     ========================================================== */
  var dashDrag = null;

  function dashReduced() {
    if (document.documentElement.getAttribute('data-motion') === 'reduced') return true;
    if (document.documentElement.getAttribute('data-reduced-motion') === '1') return true;
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function dashCapture(grid) {
    var map = [];
    grid.querySelectorAll('.pm6-dash-card').forEach(function (el) {
      if (el.classList.contains('pm6-dash-placeholder')) return;
      map.push({ el: el, rect: el.getBoundingClientRect() });
    });
    return map;
  }

  function dashFlip(prev) {
    if (dashReduced()) return;
    prev.forEach(function (entry) {
      var el = entry.el;
      if (!el.isConnected) return;
      var now = el.getBoundingClientRect();
      var dx = entry.rect.left - now.left, dy = entry.rect.top - now.top;
      if (!dx && !dy) return;
      window.PM7_MOTION_FINISH.cancel(el, 'transition', 'transform');
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      var settle = function () {
        el.style.removeProperty('transition');
        el.style.removeProperty('transform');
      };
      requestAnimationFrame(function () {
        el.style.transition = 'transform var(--mo-widget-reflow-dur, 240ms) var(--mo-widget-reflow-ease, cubic-bezier(.45,0,.4,1))';
        el.style.removeProperty('transform');
        window.PM7_MOTION_FINISH(el, 'transition', 'transform', settle);
      });
    });
  }

  /* reading-order slot: above the vertical middle -> before; below it ->
     after, except inside the 50-75% band where the horizontal middle
     decides. Works across a multi-column grid, not just a vertical list. */
  function dashCardAtPoint(x, y) {
    var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      var card = el && el.closest ? el.closest('.pm6-dash-card') : null;
      if (card && !card.classList.contains('pm6-dash-placeholder') && !card.hasAttribute('data-pm6-lifted')) return card;
    }
    return null;
  }

  function dashSlotFrom(x, y) {
    var ds = dashDrag;
    if (!ds) return;
    var target = dashCardAtPoint(x, y);
    if (!target || target.parentElement !== ds.placeholder.parentElement) return;
    var r = target.getBoundingClientRect();
    var relY = (y - r.top) / r.height, relX = (x - r.left) / r.width;
    var after = relY >= 0.5 && !(relY <= 0.75 && relX < 0.5);
    if (after ? target.nextSibling === ds.placeholder : ds.placeholder.nextSibling === target) return;
    var prev = dashCapture(ds.grid);
    target.parentElement.insertBefore(ds.placeholder, after ? target.nextSibling : target);
    dashFlip(prev);
  }

  function dashMoveClone() {
    var ds = dashDrag;
    if (!ds) return;
    ds.clone.style.left = (ds.px - ds.ox) + 'px';
    ds.clone.style.top = (ds.py - ds.oy) + 'px';
  }

  function dashEdgeTick() {
    var ds = dashDrag;
    if (!ds) return;
    var h = window.innerHeight, zone = 56, dy = 0;
    if (ds.py < zone) dy = -Math.ceil((zone - ds.py) / 6);
    else if (ds.py > h - zone) dy = Math.ceil((ds.py - (h - zone)) / 6);
    if (dy && ds.scroller) { ds.scroller.scrollBy(0, dy); dashSlotFrom(ds.px, ds.py); }
    ds.raf = requestAnimationFrame(dashEdgeTick);
  }

  function dashFindScroller(grid) {
    var n = grid.parentElement;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);
      if (/(auto|scroll|overlay)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) return n;
      n = n.parentElement;
    }
    return window;
  }

  function dashStartDrag(card, e) {
    if (dashDrag) return;
    var grid = card.closest('.pm6-dash-grid');
    if (!grid) return;
    e.preventDefault();
    var rect = card.getBoundingClientRect();
    var clone = card.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
    clone.setAttribute('data-pm6-lifted', '');
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('pm6-dash-lifted');
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    document.body.appendChild(clone);
    var ph = document.createElement('div');
    ph.className = 'pm6-dash-card pm6-dash-placeholder';
    ph.setAttribute('aria-hidden', 'true');
    ph.style.setProperty('--dw', card.style.getPropertyValue('--dw') || 1);
    ph.style.setProperty('--dh', card.style.getPropertyValue('--dh') || 1);
    card.parentNode.insertBefore(ph, card);
    card.style.display = 'none';
    dashDrag = {
      grid: grid, card: card, clone: clone, placeholder: ph,
      ox: e.clientX - rect.left, oy: e.clientY - rect.top,
      px: e.clientX, py: e.clientY,
      order: Array.prototype.map.call(grid.querySelectorAll('.pm6-dash-card'), function (c) { return c; }),
      scroller: dashFindScroller(grid), raf: 0
    };
    document.documentElement.classList.add('pm6-dash-dragging');
    void clone.offsetWidth;
    clone.classList.add('is-lifted');
    window.addEventListener('pointermove', dashOnMove, true);
    window.addEventListener('pointerup', dashOnUp, true);
    window.addEventListener('pointercancel', dashOnCancel, true);
    window.addEventListener('blur', dashOnCancel);
    dashDrag.raf = requestAnimationFrame(dashEdgeTick);
  }

  function dashOnMove(e) {
    var ds = dashDrag;
    if (!ds) return;
    ds.px = e.clientX; ds.py = e.clientY;
    dashMoveClone();
    dashSlotFrom(e.clientX, e.clientY);
  }

  function dashUnlisten() {
    window.removeEventListener('pointermove', dashOnMove, true);
    window.removeEventListener('pointerup', dashOnUp, true);
    window.removeEventListener('pointercancel', dashOnCancel, true);
    window.removeEventListener('blur', dashOnCancel);
    if (dashDrag && dashDrag.raf) cancelAnimationFrame(dashDrag.raf);
    document.documentElement.classList.remove('pm6-dash-dragging');
  }

  function dashFinish(commit) {
    var ds = dashDrag;
    if (!ds) return;
    dashUnlisten();
    dashDrag = null;
    var landing = ds.placeholder.getBoundingClientRect();
    if (commit) {
      ds.placeholder.parentNode.insertBefore(ds.card, ds.placeholder);
    } else {
      /* revert to the captured order without re-rendering any body */
      var prev = dashCapture(ds.grid);
      ds.order.forEach(function (c) { if (c.parentNode === ds.grid || c.parentNode) c.parentNode.appendChild(c); });
      ds.placeholder.parentNode.insertBefore(ds.card, ds.placeholder);
      dashFlip(prev);
    }
    if (ds.placeholder.parentNode) ds.placeholder.parentNode.removeChild(ds.placeholder);
    ds.card.style.removeProperty('display');
    var done = false;
    var drop = function () {
      if (done) return;
      done = true;
      if (ds.clone.parentNode) ds.clone.parentNode.removeChild(ds.clone);
    };
    if (dashReduced()) { drop(); return; }
    var cl = ds.clone;
    cl.style.transition = 'left var(--mo-widget-drop-dur, 220ms) var(--mo-widget-drop-ease, cubic-bezier(.2,0,0,1)),' +
      'top var(--mo-widget-drop-dur, 220ms) var(--mo-widget-drop-ease, cubic-bezier(.2,0,0,1)),' +
      'width var(--mo-widget-drop-dur, 220ms) var(--mo-widget-drop-ease, cubic-bezier(.2,0,0,1)),' +
      'height var(--mo-widget-drop-dur, 220ms) var(--mo-widget-drop-ease, cubic-bezier(.2,0,0,1)),' +
      'opacity var(--mo-widget-drop-dur, 220ms) var(--mo-widget-drop-ease, cubic-bezier(.2,0,0,1))';
    void cl.offsetWidth;
    cl.style.left = landing.left + 'px';
    cl.style.top = landing.top + 'px';
    cl.style.width = landing.width + 'px';
    cl.style.height = landing.height + 'px';
    cl.style.opacity = '0';
    cl.classList.remove('is-lifted');
    cl.addEventListener('transitionend', drop);
    setTimeout(drop, 420);
  }

  function dashOnUp() { dashFinish(true); }
  function dashOnCancel() { dashFinish(false); }

  function initDnd() {
    var grid = document.getElementById('pm6DashGrid');
    if (!grid) return;
    grid.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var h = e.target.closest ? e.target.closest('[data-pm6-dash="drag"]') : null;
      if (!h) return;
      var card = h.closest('.pm6-dash-card');
      if (card) dashStartDrag(card, e);
    });
    /* the old HTML5 path is retired; make sure nothing re-arms it */
    grid.addEventListener('dragstart', function (e) {
      if (e.target.closest && e.target.closest('.pm6-dash-card')) e.preventDefault();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dashDrag) { e.preventDefault(); dashFinish(false); }
    });
  }

  /* ==========================================================
     Edge-resize with grid snap (pointer events)
     ========================================================== */
  function initResize() {
    var grid = document.getElementById('pm6DashGrid');
    if (!grid) return;
    var rs = null; // {card, cols, cellW, cellH, gap, startW, startH}
    grid.addEventListener('pointerdown', function (e) {
      var grip = e.target.closest ? e.target.closest('[data-pm6-dash="resize"]') : null;
      if (!grip) return;
      var card = grip.closest('.pm6-dash-card');
      if (!card) return;
      e.preventDefault();
      var cs = getComputedStyle(grid);
      var cols = (cs.gridTemplateColumns || '').split(' ').filter(Boolean).length || 2;
      var gap = parseFloat(cs.columnGap) || 8;
      rs = {
        card: card,
        cols: cols,
        gap: gap,
        cellW: (grid.clientWidth - gap * (cols - 1)) / cols,
        cellH: parseFloat(cs.gridAutoRows) || 128,
        w: parseInt(card.style.getPropertyValue('--dw'), 10) || 1,
        h: parseInt(card.style.getPropertyValue('--dh'), 10) || 1
      };
      card.classList.add('pm6-is-resizing');
      try { grip.setPointerCapture(e.pointerId); } catch (x) {}
    });
    grid.addEventListener('pointermove', function (e) {
      if (!rs) return;
      var r = rs.card.getBoundingClientRect();
      var w = Math.round((e.clientX - r.left + rs.gap / 2) / (rs.cellW + rs.gap));
      var h = Math.round((e.clientY - r.top + rs.gap / 2) / (rs.cellH + rs.gap));
      w = Math.max(1, Math.min(w, rs.cols));
      h = Math.max(1, Math.min(h, 3));
      rs.card.style.setProperty('--dw', w);
      rs.card.style.setProperty('--dh', h);
    });
    function endResize() {
      if (!rs) return;
      var w = parseInt(rs.card.style.getPropertyValue('--dw'), 10) || 1;
      var h = parseInt(rs.card.style.getPropertyValue('--dh'), 10) || 1;
      rs.card.classList.remove('pm6-is-resizing');
      if (w !== rs.w || h !== rs.h) say('Widget snapped to ' + w + '×' + h + '.');
      rs = null;
    }
    grid.addEventListener('pointerup', endResize);
    grid.addEventListener('pointercancel', endResize);
  }

  /* ==========================================================
     Delegated clicks for widget chrome (gear/remove/close)
     ========================================================== */
  function initChromeClicks() {
    var r = root();
    if (!r) return;
    r.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-pm6-dash]') : null;
      if (!el) return;
      var op = el.getAttribute('data-pm6-dash');
      if (op === 'catalog-close') { closeCatalog(); return; }
      if (op === 'cta-dismiss') {
        var cta = el.closest('.pm6-dash-cta');
        if (cta) cta.hidden = true;
        return;
      }
      if (op === 'remove') {
        var card = el.closest('.pm6-dash-card');
        if (!card) return;
        var kind = card.getAttribute('data-widget-kind') || '';
        card.style.transition = 'opacity 160ms ease, transform 160ms ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(.96)';
        setTimeout(function () {
          card.remove();
          if (D.added[kind]) {
            delete D.added[kind];
            var item = $('.pm6-dash-catalog-item[data-demo-action="dash.add.' + kind + '"]');
            if (item) item.classList.remove('pm6-is-added');
          }
        }, 170);
        say('Widget removed — Add widget restores it any time.');
        return;
      }
      if (op === 'gear') {
        var gcard = el.closest('.pm6-dash-card');
        var gkind = gcard && gcard.getAttribute('data-widget-kind');
        if (gkind === 'custom-metrics') { cycleMetric(); return; }
        var opts = ['5h', '24h', '7d'];
        var idx = parseInt((gcard && gcard.getAttribute('data-cfg-idx')) || '0', 10);
        if (isNaN(idx)) idx = 0;
        idx = (idx + 1) % opts.length;
        if (gcard) gcard.setAttribute('data-cfg-idx', String(idx));
        say('Widget window → ' + opts[idx] + ' (per-widget setting, this widget only).');
        return;
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var c = document.getElementById('pm6DashCatalog');
        if (c && !c.hidden) closeCatalog();
      }
    });
  }

  /* ==========================================================
     Actions (PM_DEMO router: [data-demo-action] -> here)
     ========================================================== */
  reg('dash.catalog.open', openCatalog);
  Object.keys(CATALOG).forEach(function (kind) {
    reg('dash.add.' + kind, function () { addWidget(kind); });
  });
  reg('dash.gate.approve', function () { resolveGate(true); });
  reg('dash.gate.decline', function () { resolveGate(false); });
  reg('dash.gate.details', function () {
    try { if (window.PM_PAGES) window.PM_PAGES.go('orchestrator', 'progress'); } catch (e) {}
    say('Opening Orchestrator > Progress with run #47 focused.');
  });
  reg('dash.open_plan_compile', function () {
    try { if (window.PM_PAGES) window.PM_PAGES.go('orchestrator', 'plan_compile'); } catch (e) {}
  });
  reg('dash.run.pause', function () {
    D.paused = !D.paused;
    try {
      var run = window.PM_DEMO && window.PM_DEMO.run;
      if (run) { if (D.paused && run.pause) run.pause(); if (!D.paused && run.resume) run.resume(); }
    } catch (e) {}
    var btn = $('[data-orch-pause]');
    if (btn) btn.textContent = D.paused ? 'Resume' : 'Pause';
    if (D.paused) {
      setChip('Paused', 'pm6-dash-chip--warn');
      say('Run #47 paused — lanes hold at their current nodes.');
    } else {
      setChip(D.gateOpen ? 'Needs Attention' : 'Running', D.gateOpen ? 'pm6-dash-chip--warn' : 'pm6-dash-chip--live');
      say('Run #47 resumed.');
    }
  });
  reg('dash.usage.ack', function () {
    var cta = document.getElementById('pm6DashCtaUsage');
    if (cta) cta.hidden = true;
    D.usageAcked = true;
    say('Warning acknowledged — it will return if usage crosses 90%.');
  });
  reg('dash.usage.open', function () {
    try { if (window.PM_PAGES) window.PM_PAGES.go('usage'); } catch (e) {}
  });
  reg('dash.browser.nav', function () {
    say('Preview history is demo scope (demo_scope) — this session has a single page.');
  });
  reg('dash.browser.reload', function () {
    var vp = document.getElementById('browserViewport');
    if (vp) {
      vp.style.transition = 'opacity 140ms ease';
      vp.style.opacity = '0.3';
      setTimeout(function () { vp.style.opacity = '1'; }, 160);
    }
    say('Preview reloaded — localhost:5173 (workspace_preview).');
  });
  reg('dash.browser.detach', function () {
    say('Detach is demo scope (demo_scope) — the preview stays docked in this concept.');
  });
  reg('dash.browser.share', function () {
    say('Preview shared with the agent — session added to thread context.');
  });

  /* ==========================================================
     PM_DEMO subscriptions
     ========================================================== */
  /* live active-lanes widget from run.state lane snapshots */
  function laneCls(state) {
    if (state === 'complete') return 'is-done';
    if (state === 'running' || state === 'executing') return 'is-run';
    if (state === 'blocked' || state === 'attention_required' || state === 'recovering') return 'is-warn';
    return 'is-queue';
  }
  function renderLanes(lanes) {
    if (!lanes || !lanes.length) return;
    var body = $('.pm6-dash-card[data-widget-kind="active-lanes"] [data-widget-body]');
    if (!body) return;
    var html = '';
    lanes.forEach(function (l) {
      var total = l.total || 1;
      var done = typeof l.done === 'number' ? l.done : 0;
      var w = l.state === 'complete' ? 100 : Math.max(Math.round((done / total) * 100), l.state === 'idle' ? 0 : 4);
      var val = l.state === 'complete' ? done + '/' + total + ' &#10003;'
        : l.state === 'idle' ? 'queued' : done + '/' + total;
      html += lane(esc(l.id) + ' &middot; ' + esc(l.label || ''), laneCls(l.state), w, val);
    });
    body.innerHTML = html;
  }
  function runPctFromLanes(lanes) {
    var done = 0, total = 0;
    (lanes || []).forEach(function (l) { done += l.done || 0; total += l.total || 0; });
    return total ? Math.round((done / total) * 100) : null;
  }

  on('run.gate', function (p) {
    if (!p) return;
    var st = p.state || 'attention_required';
    if (st === 'approved' || st === 'resolved') { if (D.gateOpen) resolveGate(true, true); return; }
    if (st === 'declined') { if (D.gateOpen) resolveGate(false, true); return; }
    showGateCta(p); /* attention_required (incl. re-raise after safe-point retry) */
  });
  on('run.state', function (p) {
    if (!p) return;
    var stage = p.stage || null;
    var pct = runPctFromLanes(p.lanes);
    if (pct != null && stage && stage !== 'idle' && stage !== 'pending-launch') setRing(pct);
    renderLanes(p.lanes);
    if (typeof p.planUnits === 'number' && p.planUnits > 0 && D.metricIdx === 0) {
      D.nodesDone = p.planUnits;
      var v = $('[data-metric-val]');
      if (v) v.textContent = String(D.nodesDone);
    }
    if (stage === 'complete') {
      D.complete = true;
      setRing(100);
      setChip('Complete', 'pm6-dash-chip--pass');
      setOrchLine('Run #47 complete — 3 seams sealed, PR chapter unlocked');
    } else if (stage === 'blocked') {
      setChip('Blocked', 'pm6-dash-chip--fail');
    } else if (stage === 'compiling') {
      if (!D.paused) { setChip('Running', 'pm6-dash-chip--live'); }
      setOrchLine('Compiling plan — ' + (p.planUnits || 0) + ' PlanUnits so far · freshness: ' + (p.freshness || 'current'));
    } else if (stage === 'executing' && !D.gateOpen && !D.paused) {
      setChip('Running', 'pm6-dash-chip--live');
      setOrchLine('Building — lanes advancing · freshness: ' + (p.freshness || 'current'));
    }
  });
  on('run.node', function (p) {
    if (!p) return;
    if (p.promotion) {
      pushResult('promotion · ' + p.promotion + (p.ref ? ' · ' + p.ref : ''), 'passed');
      return;
    }
    var n = p.node || p;
    var state = n.state || 'complete';
    var label = (n.id ? n.id + ' · ' : '') + (n.label || n.title || 'node');
    if (state === 'complete') {
      pushResult(label, n.degraded ? 'degraded' : 'passed');
    } else if (p.failed || state === 'blocked') {
      pushResult(label, 'failed');
    } else if (state === 'recovering' || state === 'attention_required') {
      pushResult(label, 'degraded');
    }
    refreshKind('lane_health');
  });
  /* PM7 T10: snapshot-idempotent + hot (census: 16 emissions/30s idle) -> page-gated */
  on('usage.tick', window.pm7PageGate('dashboard', function (p) {
    if (!p) return;
    if (typeof p.cooldownSec === 'number') {
      D.cooldown = p.cooldownSec;
      var cd = document.getElementById('pm6DashCooldown');
      if (cd) cd.textContent = fmtCooldown(D.cooldown);
    }
    var qs = p.quotas;
    if (qs && qs.length) {
      var q = null;
      for (var i = 0; i < qs.length; i++) { if (qs[i].id === 'q-claude-5h') { q = qs[i]; break; } }
      q = q || qs[0];
      if (q && typeof q.pct === 'number' && Math.round(q.pct) !== D.usagePct) {
        D.usagePct = Math.round(q.pct);
        var pctEl = document.getElementById('pm6DashUsagePct');
        if (pctEl) pctEl.textContent = D.usagePct + '%';
        refreshKind('quota_summary');
      }
    }
  }));
  on('usage.alert', function (p) {
    var cta = document.getElementById('pm6DashCtaUsage');
    if (!cta) return;
    var sub = cta.querySelector('.pm6-dash-cta-sub');
    if (p && p.kind === 'account_switch') {
      if (sub) sub.textContent = 'Effective account switched (reason: rate_limit_pressure) — requested account unchanged. Cost now attributed to the effective account.';
      refreshKind('multi_account');
    } else {
      if (p && typeof p.pct === 'number') {
        D.usagePct = Math.round(p.pct);
        var pctEl = document.getElementById('pm6DashUsagePct');
        if (pctEl) pctEl.textContent = D.usagePct + '%';
      }
      if (sub && p && p.suggestion) sub.textContent = String(p.suggestion);
    }
    cta.hidden = false;
    cta.classList.add('pm6-cta-pulse');
    injectIcons(cta);
    setTimeout(function () { cta.classList.remove('pm6-cta-pulse'); }, 3000);
  });
  /* engine-side widget adds (palette / dev panel) land on the grid too */
  on('dash.widget', function (p) {
    if (!p || p.action !== 'add') return;
    var mine = ENGINE_KINDS[p.kind];
    if (mine && !D.added[mine]) addWidget(mine, true);
  });
  /* engine CTA store sync (approve/decline can originate in chat or orchestrator) */
  on('dash.cta', function (p) {
    if (!p) return;
    if (p.action === 'remove' && p.id === 'cta-gate' && D.gateOpen) resolveGate(true);
    if (p.action === 'remove' && p.id === 'cta-usage') {
      var u = document.getElementById('pm6DashCtaUsage');
      if (u) u.hidden = true;
    }
  });

  /* ==========================================================
     Boot
     ========================================================== */
  function boot() {
    injectIcons();
    wrapEditorFns();
    initEditorTabs();
    initDnd();
    initResize();
    initChromeClicks();
    setRing(D.pct);
    // Tastebook editor bodies land after part-26's initial render (100ms).
    setTimeout(function () {
      pm6RenderFile('src/main.rs', 'pane1');
      pm6RenderFile('src/models/recipe.rs', 'pane2');
    }, 350);
    // cooldown countdown on the ambient usage warning card
    // PM7 T08: the decrement keeps its exact schedule; only the DOM write is
    // gated to the active dashboard page and flushed on page.changed.
    var pm7DashCdDirty = false;
    setInterval(function () {
      if (document.hidden) return;
      var el = document.getElementById('pm6DashCooldown');
      if (!el) return;
      D.cooldown = Math.max(0, D.cooldown - 1);
      if (root().classList.contains('active')) { el.textContent = fmtCooldown(D.cooldown); pm7DashCdDirty = false; }
      else { pm7DashCdDirty = true; }
    }, 1000);
    on('page.changed', function (p) {
      if (!p || p.page !== 'dashboard' || !pm7DashCdDirty) return;
      pm7DashCdDirty = false;
      var el = document.getElementById('pm6DashCooldown');
      if (el) el.textContent = fmtCooldown(D.cooldown);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


/* PM7 T48: Home workspace authored-source refresh */
/* PM7 T20: Home workspace model-first controller. */
(function () {
  "use strict";
  if (window.PM_HOME_WORKSPACE) return;

  var HOSTS = ["home_main", "dock_left", "dock_right", "dock_top", "dock_bottom", "floating"];
  var EDITOR_IDS = ["editor_panel_1", "editor_panel_2", "editor_panel_3", "editor_panel_4"];
  /* mirrors --pm-home-collapsed-h in HOME_STYLE */
  var COLLAPSED_STRIP_PX = 34;
  var DRAG_EDGE_ZONE_PX = 56;
  /* border strip that resolves to a dock during a drag */
  var DRAG_DOCK_EDGE_PX = 28;
  /* extra distance past a latched dock's OPENED preview edge the pointer must
     travel before the dock releases -- geometric hysteresis (see
     buildDockLatch) */
  var DOCK_EXIT_SLACK_PX = 44;
  /* Per-host caps on VISIBLE surfaces: a gesture cannot overfill a dock into
     uselessness. home_main is uncapped -- it is the spill/fallback host. */
  var HOST_CAPS = { dock_left: 3, dock_right: 3, dock_top: 2, dock_bottom: 2, floating: 4 };
  /* Single source for dock-track clamps, consumed by BOTH resizeBandFor and
     syncHostGeometry -- the two used to disagree, so a drag could commit a
     basis the track then silently re-clamped. */
  var HOST_BANDS = {
    dock_left: { min: 220, max: 520 },
    dock_right: { min: 220, max: 520 },
    dock_top: { min: 150, max: 380 },
    dock_bottom: { min: 150, max: 380 }
  };
  /* Nominal per-kind minimum main-axis sizes. The EFFECTIVE minimum degrades
     to the host's fair share under pressure (see effectiveMinPx), so a divider
     can always reach every boundary and a crowded row never wedges. */
  function nominalMinPx(surfaceId) {
    if (surfaceId === "chat") return 260;
    if (surfaceId === "dashboard") return 240;
    if (surfaceId.indexOf("terminal_section") === 0) return 150;
    return 220;
  }
  var PROJECT_ID = (document.body && document.body.getAttribute("data-project-id")) || "tastebook";
  var WORKSPACE_TAB_ID = (document.body && document.body.getAttribute("data-workspace-tab-id")) || "home";
  var CURRENT_LAYOUT_VERSION = "1.1.0";
  var STORAGE_KEY = "pm.homeWorkspaceLayout:v2:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID;
  var LEGACY_STORAGE_KEYS = [
    "pm.homeWorkspaceLayout:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID,
    "home_workspace_layout.v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID,
    "home_workspace_layout:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID,
    "pm.home_workspace_layout:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID
  ];
  var QUARANTINE_PREFIX = "pm.homeWorkspaceLayout:quarantine:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID + ":";
  var root = null;
  var grid = null;
  var committed = null;
  var gesture = null;
  var focusSeq = 20;
  var surfaceRegistry = Object.create(null);
  var hostRegistries = Object.create(null);
  var commandLog = [];
  var eventLog = [];
  var receiptLog = [];
  var menuState = { main: null, flyout: null, invoker: null, hoverTimer: null, surfaceId: null };
  var faults = { failNextWrite: false };
  var metrics = {
    commandCount: 0,
    persistCount: 0,
    previewFrameCount: 0,
    cancelledGestureCount: 0,
    recoveredLayoutCount: 0,
    failedPersistenceCount: 0,
    lastCommandId: null,
    lastPersistenceKey: STORAGE_KEY,
    lastRecoveryReason: null
  };
  var FACTORY_FILE_PATHS = ["src/main.rs", "src/routes/recipes.rs", "web/src/routes/+page.svelte", "Cargo.toml", "src/models/recipe.rs", "docker-compose.yml", "Dockerfile"];
  var editorOwners = {
    editor_panel_1: { editor_panel_id: "editor_panel_1", editor_group_id: "editor_group_1", worktree_id: "worktree:main", active_buffer_id: "buffer:src/main.rs", buffer_ids: ["buffer:src/main.rs", "buffer:src/routes/recipes.rs", "buffer:web/src/routes/+page.svelte", "buffer:Cargo.toml", "buffer:src/models/recipe.rs", "buffer:docker-compose.yml", "buffer:Dockerfile"], dirty_buffer_ids: ["buffer:src/routes/recipes.rs"] },
    editor_panel_2: { editor_panel_id: "editor_panel_2", editor_group_id: "editor_group_2", worktree_id: "worktree:main", active_buffer_id: null, buffer_ids: [], dirty_buffer_ids: [] },
    editor_panel_3: { editor_panel_id: "editor_panel_3", editor_group_id: "editor_group_3", worktree_id: "worktree:main", active_buffer_id: "buffer:README.md", buffer_ids: ["buffer:README.md"], dirty_buffer_ids: [] },
    editor_panel_4: { editor_panel_id: "editor_panel_4", editor_group_id: "editor_group_4", worktree_id: "worktree:main", active_buffer_id: "buffer:src/routes/auth.rs", buffer_ids: ["buffer:src/routes/auth.rs"], dirty_buffer_ids: [] }
  };
  var buffersByPath = {
    "src/main.rs": "buffer:src/main.rs",
    "src/routes/recipes.rs": "buffer:src/routes/recipes.rs",
    "web/src/routes/+page.svelte": "buffer:web/src/routes/+page.svelte",
    "Cargo.toml": "buffer:Cargo.toml",
    "src/models/recipe.rs": "buffer:src/models/recipe.rs",
    "docker-compose.yml": "buffer:docker-compose.yml",
    "Dockerfile": "buffer:Dockerfile",
    "README.md": "buffer:README.md",
    "src/routes/auth.rs": "buffer:src/routes/auth.rs"
  };
  var browserOwner = {
    browser_session_id: "br-sess-0472",
    session_class: "workspace_preview",
    target_editor_panel_id: null,
    target_panels: {},
    created_event_emitted: false
  };
  /* The base editor renderer rebuilds tab strips. Retain the two canonical
     Browser tab nodes so a rebuild can re-seat, rather than duplicate, the
     complete workspace-preview/automation session chrome in its owner pane. */
  var browserChrome = { preview: null, automation: null };
  /* Pristine seed for terminal section 1. Kept as a top-level constant so
     defaultLayout can rebuild a WORKING terminal even after the live record
     has been blanked by a workgroup move (makeSurface reads this whenever no
     section anywhere still owns a workgroup). */
  var PRISTINE_TERMINAL_SECTION = {
    terminal_section_id: "terminal_section_1",
    terminal_workgroup_id: "terminal_workgroup_build",
    pane_ids: ["tp-a", "tp-b"],
    terminal_session_ids: ["ts-sess-alpha", "ts-sess-delta"]
  };
  var terminalSections = {
    "terminal_section:terminal_section_1": clone(PRISTINE_TERMINAL_SECTION)
  };
  var activeTerminalSectionId = "terminal_section:terminal_section_1";
  var terminalRuntimeHome = null;
  var terminalRuntimeSignature = null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function reducedMotion() {
    if (document.documentElement.getAttribute("data-motion") === "reduced") return true;
    if (document.documentElement.getAttribute("data-reduced-motion") === "1") return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  var HOST_LABELS = {
    home_main: "Main", dock_left: "Left dock", dock_right: "Right dock",
    dock_top: "Top dock", dock_bottom: "Bottom dock", floating: "Floating"
  };
  function hostLabel(host) { return HOST_LABELS[host] || host; }
  function surfaceLabel(surfaceId) {
    var index = EDITOR_IDS.indexOf(surfaceId);
    if (index !== -1) return "Panel " + (index + 1);
    if (surfaceId === "dashboard") return "Dashboard";
    if (surfaceId === "chat") return "Chat";
    if (String(surfaceId).indexOf("terminal_section:") === 0) return "Terminal section";
    return surfaceId;
  }
  function announce(message) {
    var region = document.getElementById("pm-home-live-region");
    if (region) region.textContent = message;
  }
  function now() { return new Date().toISOString(); }
  function csv(values) { return (values || []).join(","); }
  function splitCsv(value) { return value ? String(value).split(",").filter(Boolean) : []; }
  function uid(prefix) { return prefix + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8); }
  function versionParts(value) {
    var match = String(value || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
  }
  function isFutureVersion(value) {
    var parts = versionParts(value);
    if (!parts) return true;
    return parts[0] > 1 || (parts[0] === 1 && (parts[1] > 1 || (parts[1] === 1 && parts[2] > 0)));
  }

  function makeSurface(id, kind, host, slot, visible) {
    var ref = {};
    if (kind === "editor_panel") {
      var owner = editorOwners[id];
      ref.editor_panel_id = id;
      ref.editor_group_id = owner ? owner.editor_group_id : "editor_group_unknown";
      ref.worktree_id = owner ? owner.worktree_id : "worktree:unknown";
      ref.browser_session_id = null;
      ref.browser_active = false;
    }
    if (kind === "dashboard") ref.dashboard_surface_id = "dashboard";
    if (kind === "chat") ref.chat_surface_id = "chat";
    if (kind === "terminal_section") {
      var section = terminalSections[id] || null;
      /* Section 1 must never seed from a live-but-BLANKED record: if no
         section anywhere still owns a workgroup, fall back to the pristine
         literal so defaultLayout/reset always rebuilds a working terminal. */
      if (id === "terminal_section:terminal_section_1") {
        var anyLiveWorkgroup = Object.keys(terminalSections).some(function (key) {
          return Boolean(terminalSections[key] && terminalSections[key].terminal_workgroup_id);
        });
        if (!anyLiveWorkgroup) section = clone(PRISTINE_TERMINAL_SECTION);
      }
      ref.terminal_section_id = id.split(":")[1];
      ref.terminal_workgroup_id = section ? section.terminal_workgroup_id : null;
      ref.pane_ids = section ? csv(section.pane_ids) : "";
      ref.terminal_session_ids = section ? csv(section.terminal_session_ids) : "";
    }
    return {
      surface_instance_id: id,
      surface_kind: kind,
      domain_ref: ref,
      host: host,
      slot_index: slot,
      split_path: "root/" + slot,
      /* basis_px is the MAIN-axis size (width in a row host, dock-track width
         in a column dock); cross_basis_px is the row-dock TRACK size (height
         of dock_top/dock_bottom), driven by the full-width track handle. */
      size: { basis_px: kind === "terminal_section" ? 260 : 360, cross_basis_px: kind === "terminal_section" ? 260 : 360, flex_weight: 1, min_width_px: 220, min_height_px: 120 },
      visible: visible,
      collapsed: false,
      floating_bounds: null,
      last_docked_host: host === "floating" ? "home_main" : host,
      last_docked_slot_index: slot,
      last_focus_seq: slot + 1
    };
  }

  function defaultLayout() {
    var panelOne = makeSurface("editor_panel_1", "editor_panel", "home_main", 0, true);
    panelOne.domain_ref.browser_session_id = browserOwner.browser_session_id;
    panelOne.domain_ref.browser_active = true;
    return {
      schema_id: "pm.home_workspace_layout.v1",
      schema_version: CURRENT_LAYOUT_VERSION,
      project_id: PROJECT_ID,
      workspace_tab_id: WORKSPACE_TAB_ID,
      layout_revision: 0,
      surfaces: [
        panelOne,
        makeSurface("editor_panel_2", "editor_panel", "home_main", 2, false),
        makeSurface("editor_panel_3", "editor_panel", "home_main", 3, false),
        makeSurface("editor_panel_4", "editor_panel", "home_main", 4, false),
        makeSurface("dashboard", "dashboard", "home_main", 1, true),
        makeSurface("chat", "chat", "dock_right", 0, true),
        makeSurface("terminal_section:terminal_section_1", "terminal_section", "dock_bottom", 0, true)
      ],
      saved_at_utc: now(),
      validation: {
        status: "valid",
        max_editor_panels: 4,
        max_terminal_sections: 4,
        max_visible_terminal_panes: 4,
        fallback_host: "home_main",
        safe_offscreen_fallback: true,
        last_validation_errors: []
      },
      migration: { from_schema_version: null, migrated_at_utc: now(), source_key: null, disposition: "current" }
    };
  }

  function surfaceById(layout, id) {
    if (!layout || !Array.isArray(layout.surfaces)) return null;
    for (var i = 0; i < layout.surfaces.length; i += 1) {
      if (layout.surfaces[i].surface_instance_id === id) return layout.surfaces[i];
    }
    return null;
  }

  function hostIsValid(host) { return HOSTS.indexOf(host) !== -1; }

  function sanitizedDomainRef(surface, fallback) {
    var ref = Object.assign({}, fallback || {}, surface && surface.domain_ref || {});
    if (surface.surface_kind === "editor_panel") {
      var owner = editorOwners[surface.surface_instance_id];
      return {
        editor_panel_id: surface.surface_instance_id,
        editor_group_id: owner ? owner.editor_group_id : ref.editor_group_id,
        worktree_id: ref.worktree_id || owner && owner.worktree_id || "worktree:unknown",
        browser_session_id: typeof ref.browser_session_id === "string" ? ref.browser_session_id : null,
        browser_active: Boolean(ref.browser_active)
      };
    }
    if (surface.surface_kind === "dashboard") return { dashboard_surface_id: "dashboard" };
    if (surface.surface_kind === "chat") return { chat_surface_id: "chat" };
    if (surface.surface_kind === "terminal_section") {
      return {
        terminal_section_id: ref.terminal_section_id || surface.surface_instance_id.split(":")[1],
        terminal_workgroup_id: typeof ref.terminal_workgroup_id === "string" ? ref.terminal_workgroup_id : null,
        pane_ids: typeof ref.pane_ids === "string" ? ref.pane_ids : "",
        terminal_session_ids: typeof ref.terminal_session_ids === "string" ? ref.terminal_session_ids : ""
      };
    }
    return ref;
  }

  function rootBounds() {
    var rect = root && root.getBoundingClientRect ? root.getBoundingClientRect() : null;
    return {
      width: Math.max(320, rect && rect.width || window.innerWidth || 1280),
      height: Math.max(220, rect && rect.height || window.innerHeight - 60 || 720)
    };
  }

  function clampBounds(bounds) {
    var viewport = rootBounds();
    var width = Math.max(240, Math.min(Number(bounds && bounds.width) || 420, viewport.width - 16));
    var height = Math.max(140, Math.min(Number(bounds && bounds.height) || 300, viewport.height - 16));
    var x = Number(bounds && bounds.x);
    var y = Number(bounds && bounds.y);
    if (!isFinite(x)) x = Math.max(8, Math.round((viewport.width - width) / 2));
    if (!isFinite(y)) y = Math.max(8, Math.round((viewport.height - height) / 2));
    x = Math.max(8, Math.min(x, Math.max(8, viewport.width - width - 8)));
    y = Math.max(8, Math.min(y, Math.max(8, viewport.height - height - 8)));
    return { x: x, y: y, width: width, height: height };
  }

  function intersects(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function tiledFloatBounds(layout, surfaceId, seed) {
    var size = clampBounds(seed || { width: 420, height: 300 });
    var viewport = rootBounds();
    var occupied = layout.surfaces.filter(function (surface) {
      return surface.surface_instance_id !== surfaceId && surface.visible && surface.host === "floating" && surface.floating_bounds;
    }).map(function (surface) { return clampBounds(surface.floating_bounds); });
    var candidates = [];
    var gap = 14;
    var columns = Math.max(1, Math.floor((viewport.width - 32 + gap) / (size.width + gap)));
    var rows = Math.max(1, Math.floor((viewport.height - 32 + gap) / (size.height + gap)));
    for (var row = 0; row < rows; row += 1) {
      for (var col = 0; col < columns; col += 1) candidates.push(clampBounds({ x: 16 + col * (size.width + gap), y: 16 + row * (size.height + gap), width: size.width, height: size.height }));
    }
    for (var i = 0; i < candidates.length; i += 1) {
      if (!occupied.some(function (other) { return intersects(candidates[i], other); })) return candidates[i];
    }
    var best = candidates[0] || size;
    var bestArea = Infinity;
    candidates.forEach(function (candidate) {
      var overlapArea = occupied.reduce(function (sum, other) {
        var width = Math.max(0, Math.min(candidate.x + candidate.width, other.x + other.width) - Math.max(candidate.x, other.x));
        var height = Math.max(0, Math.min(candidate.y + candidate.height, other.y + other.height) - Math.max(candidate.y, other.y));
        return sum + width * height;
      }, 0);
      if (overlapArea < bestArea) { bestArea = overlapArea; best = candidate; }
    });
    return best;
  }

  function normalizeSlots(layout) {
    HOSTS.forEach(function (host) {
      layout.surfaces.filter(function (surface) { return surface.host === host; }).sort(function (a, b) {
        return Number(Boolean(b.visible)) - Number(Boolean(a.visible)) || (Number(a.slot_index) || 0) - (Number(b.slot_index) || 0) || a.surface_instance_id.localeCompare(b.surface_instance_id);
      }).forEach(function (surface, index) {
        surface.slot_index = index;
        surface.split_path = "root/" + index;
        if (surface.visible && host !== "floating") {
          surface.last_docked_host = host;
          surface.last_docked_slot_index = index;
        }
      });
    });
    return layout;
  }

  function restoreOwnerRefs(layout) {
    terminalSections = {};
    browserOwner.target_panels = {};
    browserOwner.target_editor_panel_id = null;
    layout.surfaces.forEach(function (surface) {
      if (surface.surface_kind === "editor_panel" && editorOwners[surface.surface_instance_id]) {
        var owner = editorOwners[surface.surface_instance_id];
        surface.domain_ref = surface.domain_ref || {};
        surface.domain_ref.editor_panel_id = surface.surface_instance_id;
        surface.domain_ref.editor_group_id = owner.editor_group_id;
        surface.domain_ref.worktree_id = surface.domain_ref.worktree_id || owner.worktree_id;
        owner.worktree_id = surface.domain_ref.worktree_id;
        if (surface.domain_ref.browser_session_id) {
          browserOwner.target_panels[surface.surface_instance_id] = surface.domain_ref.browser_session_id;
          browserOwner.created_event_emitted = true;
          if (surface.domain_ref.browser_active) browserOwner.target_editor_panel_id = surface.surface_instance_id;
        }
      }
      if (surface.surface_kind === "terminal_section") {
        var ref = surface.domain_ref || {};
        var panes = splitCsv(ref.pane_ids);
        var sessions = splitCsv(ref.terminal_session_ids);
        /* Repair-then-seed, never early-continue: the old
           `return "terminal_workgroup_empty"` skipped the terminalSections
           write entirely, so a workgroup ref with no panes left the section
           with NO record at all and the projection rendered the empty
           template over a supposedly live terminal. Section 1 carrying the
           pristine workgroup id restores the pristine pane/session lists;
           any other paneless workgroup drops to an honest empty (null
           workgroup). Every section ALWAYS gets a well-formed record. */
        if (ref.terminal_workgroup_id && !panes.length) {
          if (surface.surface_instance_id === "terminal_section:terminal_section_1" &&
              ref.terminal_workgroup_id === PRISTINE_TERMINAL_SECTION.terminal_workgroup_id) {
            var pristine = clone(PRISTINE_TERMINAL_SECTION);
            panes = pristine.pane_ids;
            sessions = pristine.terminal_session_ids;
          } else {
            /* Reconstitute a minimal pane rather than nulling: layouts
               persisted by earlier builds carry live workgroup ids whose
               pane CSVs were corrupted to "" -- nulling them re-surfaced the
               big "this terminal section is empty" block on perfectly good
               sections. A workgroup with an id is live by definition. */
            var repairSuffix = surface.surface_instance_id.replace(/[^0-9]+/g, "") || "r";
            panes = ["tp-repair-" + repairSuffix];
            sessions = ["ts-sess-repair-" + repairSuffix];
          }
        }
        terminalSections[surface.surface_instance_id] = {
          terminal_section_id: ref.terminal_section_id || surface.surface_instance_id.split(":")[1],
          terminal_workgroup_id: ref.terminal_workgroup_id || null,
          pane_ids: panes,
          terminal_session_ids: sessions
        };
      }
    });
    /* If NO section carries a live workgroup, the terminal is unusable and
       every section shows the empty note -- a state earlier builds could
       PERSIST (their repair nulled corrupted workgroup ids and wrote that
       back). Reconstitute the pristine workgroup on section 1 and heal the
       persisted ref so the terminal always boots alive. */
    var anyLiveWorkgroup = Object.keys(terminalSections).some(function (id) {
      return Boolean(terminalSections[id].terminal_workgroup_id);
    });
    var firstSection = terminalSections["terminal_section:terminal_section_1"];
    if (!anyLiveWorkgroup && firstSection) {
      var reseed = clone(PRISTINE_TERMINAL_SECTION);
      firstSection.terminal_workgroup_id = reseed.terminal_workgroup_id;
      firstSection.pane_ids = reseed.pane_ids;
      firstSection.terminal_session_ids = reseed.terminal_session_ids;
      var firstSurface = layout.surfaces.filter(function (surface) {
        return surface.surface_instance_id === "terminal_section:terminal_section_1";
      })[0];
      if (firstSurface && firstSurface.domain_ref) {
        firstSurface.domain_ref.terminal_workgroup_id = reseed.terminal_workgroup_id;
        firstSurface.domain_ref.pane_ids = reseed.pane_ids.join(",");
        firstSurface.domain_ref.terminal_session_ids = reseed.terminal_session_ids.join(",");
      }
    }
    var active = layout.surfaces.filter(function (surface) {
      return surface.surface_kind === "terminal_section" && terminalSections[surface.surface_instance_id] && terminalSections[surface.surface_instance_id].terminal_workgroup_id;
    }).sort(function (a, b) { return (b.last_focus_seq || 0) - (a.last_focus_seq || 0); })[0];
    activeTerminalSectionId = active ? active.surface_instance_id : "terminal_section:terminal_section_1";
  }

  function normalizeLayout(candidate, recoveryReason) {
    var base = defaultLayout();
    if (!candidate || typeof candidate !== "object") {
      if (recoveryReason) {
        base.validation.status = "recovered_defaults";
        base.validation.last_validation_errors = [recoveryReason];
        base.migration.disposition = recoveryReason === "corrupt_json" ? "defaults_after_corruption" : "safe_offscreen_recovery";
      }
      return base;
    }
    var out = clone(candidate);
    var warnings = [];
    out.schema_id = "pm.home_workspace_layout.v1";
    out.schema_version = CURRENT_LAYOUT_VERSION;
    out.project_id = PROJECT_ID;
    out.workspace_tab_id = WORKSPACE_TAB_ID;
    out.layout_revision = Math.max(0, Number(out.layout_revision) || 0);
    out.surfaces = Array.isArray(out.surfaces) ? out.surfaces : [];
    var seen = Object.create(null);
    out.surfaces = out.surfaces.filter(function (surface) {
      if (!surface || typeof surface.surface_instance_id !== "string") return false;
      if (seen[surface.surface_instance_id]) { warnings.push("duplicate_surface_identity:" + surface.surface_instance_id); return false; }
      seen[surface.surface_instance_id] = true;
      return true;
    }).map(function (surface) {
      var original = surfaceById(base, surface.surface_instance_id);
      var next = Object.assign({}, original || makeSurface(surface.surface_instance_id, surface.surface_kind || "editor_panel", "home_main", 0, false), surface);
      next.domain_ref = sanitizedDomainRef(next, original && original.domain_ref || {});
      next.host = hostIsValid(next.host) ? next.host : "home_main";
      next.last_docked_host = hostIsValid(next.last_docked_host) && next.last_docked_host !== "floating" ? next.last_docked_host : "home_main";
      next.slot_index = Math.max(0, Number(next.slot_index) || 0);
      next.last_docked_slot_index = Math.max(0, Number(next.last_docked_slot_index) || 0);
      next.last_focus_seq = Math.max(0, Number(next.last_focus_seq) || 0);
      next.visible = Boolean(next.visible);
      next.collapsed = Boolean(next.collapsed);
      next.size = Object.assign({ basis_px: 360, flex_weight: 1, min_width_px: 220, min_height_px: 120 }, next.size || {});
      /* migration: layouts persisted before cross_basis_px existed inherit
         their main-axis basis as the row-dock track size */
      next.size.cross_basis_px = Number(next.size.cross_basis_px) || Number(next.size.basis_px) || 360;
      if (next.host === "floating") {
        var raw = next.floating_bounds;
        var clamped = clampBounds(raw);
        var valid = raw && isFinite(Number(raw.x)) && isFinite(Number(raw.y)) && isFinite(Number(raw.width)) && isFinite(Number(raw.height)) && Number(raw.width) > 0 && Number(raw.height) > 0;
        var changed = !valid || Number(raw.x) !== clamped.x || Number(raw.y) !== clamped.y || Number(raw.width) !== clamped.width || Number(raw.height) !== clamped.height;
        if (changed) {
          next.host = next.last_docked_host || "home_main";
          next.floating_bounds = null;
          warnings.push("offscreen_floating_fallback:" + next.surface_instance_id);
        } else next.floating_bounds = clamped;
      }
      return next;
    });
    EDITOR_IDS.forEach(function (id, index) {
      if (!surfaceById(out, id)) out.surfaces.push(makeSurface(id, "editor_panel", "home_main", index, index < 1));
    });
    if (!surfaceById(out, "dashboard")) out.surfaces.push(makeSurface("dashboard", "dashboard", "home_main", 4, true));
    if (!surfaceById(out, "chat")) out.surfaces.push(makeSurface("chat", "chat", "dock_right", 0, true));
    var terminals = out.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; });
    if (!terminals.length) out.surfaces.push(makeSurface("terminal_section:terminal_section_1", "terminal_section", "dock_bottom", 0, true));
    terminals = out.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; });
    if (terminals.length > 4) {
      var allowed = terminals.slice(0, 4).map(function (surface) { return surface.surface_instance_id; });
      out.surfaces = out.surfaces.filter(function (surface) { return surface.surface_kind !== "terminal_section" || allowed.indexOf(surface.surface_instance_id) !== -1; });
      warnings.push("terminal_section_limit");
    }
    /* Host caps hold on EVERY path (API moves, migrated layouts), not just
       pointer gestures: overflow beyond a cap SPILLS to home_main (the
       uncapped fallback host) with a warning -- old layouts recover, never
       quarantine. Slot order decides who stays. */
    Object.keys(HOST_CAPS).forEach(function (cappedHost) {
      var kept = 0;
      out.surfaces.slice().sort(function (a, b) { return a.slot_index - b.slot_index; }).forEach(function (surface) {
        if (surface.host !== cappedHost || !surface.visible) return;
        kept += 1;
        if (kept > HOST_CAPS[cappedHost]) {
          surface.host = "home_main";
          surface.slot_index = 999;
          warnings.push("host_capacity_spill:" + surface.surface_instance_id);
        }
      });
    });
    out = normalizeSlots(out);
    out.saved_at_utc = out.saved_at_utc || now();
    var errors = recoveryReason ? [recoveryReason] : [];
    warnings.forEach(function (warning) { if (errors.indexOf(warning) === -1) errors.push(warning); });
    out.validation = {
      status: errors.length ? "recovered_defaults" : "valid",
      max_editor_panels: 4,
      max_terminal_sections: 4,
      max_visible_terminal_panes: 4,
      fallback_host: "home_main",
      safe_offscreen_fallback: true,
      last_validation_errors: errors
    };
    out.migration = Object.assign({ from_schema_version: null, migrated_at_utc: now(), source_key: null, disposition: warnings.length ? "safe_offscreen_recovery" : "current" }, out.migration || {});
    if (warnings.length && !recoveryReason) out.migration.disposition = "safe_offscreen_recovery";
    return out;
  }

  function validateLayout(layout) {
    if (!layout || layout.schema_id !== "pm.home_workspace_layout.v1" || layout.schema_version !== CURRENT_LAYOUT_VERSION) return "schema_mismatch";
    if (layout.project_id !== PROJECT_ID || layout.workspace_tab_id !== WORKSPACE_TAB_ID) return "scope_mismatch";
    if (!Array.isArray(layout.surfaces)) return "surfaces_missing";
    var seen = Object.create(null);
    var visibleSlots = Object.create(null);
    var editorIds = [];
    var terminalCount = 0;
    var dashboardCount = 0;
    var chatCount = 0;
    var paneIds = Object.create(null);
    var sessionIds = Object.create(null);
    var totalPanes = 0;
    for (var i = 0; i < layout.surfaces.length; i += 1) {
      var surface = layout.surfaces[i];
      if (!surface || !surface.surface_instance_id || seen[surface.surface_instance_id]) return "duplicate_surface_identity";
      seen[surface.surface_instance_id] = true;
      if (!hostIsValid(surface.host)) return "invalid_host";
      if (!isFinite(Number(surface.slot_index)) || Number(surface.slot_index) < 0) return "invalid_slot";
      if (surface.visible) {
        var slotKey = surface.host + ":" + Number(surface.slot_index);
        if (visibleSlots[slotKey]) return "duplicate_visible_slot";
        visibleSlots[slotKey] = true;
      }
      if (surface.surface_kind === "editor_panel") {
        if (EDITOR_IDS.indexOf(surface.surface_instance_id) === -1) return "editor_panel_identity_set";
        editorIds.push(surface.surface_instance_id);
        if (!surface.domain_ref || surface.domain_ref.editor_panel_id !== surface.surface_instance_id || !surface.domain_ref.editor_group_id || !surface.domain_ref.worktree_id) return "editor_owner_ref_invalid";
      } else if (surface.surface_kind === "terminal_section") {
        terminalCount += 1;
        if (surface.surface_instance_id.indexOf("terminal_section:") !== 0) return "terminal_section_identity_invalid";
        var ref = surface.domain_ref || {};
        var panes = splitCsv(ref.pane_ids);
        var sessions = splitCsv(ref.terminal_session_ids);
        if (panes.length !== sessions.length) return "terminal_pane_session_mismatch";
        for (var p = 0; p < panes.length; p += 1) {
          if (paneIds[panes[p]]) return "duplicate_terminal_pane_identity";
          if (sessionIds[sessions[p]]) return "duplicate_terminal_session_identity";
          paneIds[panes[p]] = true;
          sessionIds[sessions[p]] = true;
        }
        totalPanes += panes.length;
      } else if (surface.surface_kind === "dashboard") {
        if (surface.surface_instance_id !== "dashboard") return "dashboard_identity_invalid";
        dashboardCount += 1;
      } else if (surface.surface_kind === "chat") {
        if (surface.surface_instance_id !== "chat") return "chat_identity_invalid";
        chatCount += 1;
      } else return "unknown_surface_kind";
      if (surface.host === "floating" && surface.floating_bounds) {
        var clamped = clampBounds(surface.floating_bounds);
        if (clamped.x !== Number(surface.floating_bounds.x) || clamped.y !== Number(surface.floating_bounds.y) || clamped.width !== Number(surface.floating_bounds.width) || clamped.height !== Number(surface.floating_bounds.height)) return "offscreen_or_invalid_bounds";
      }
    }
    editorIds.sort();
    if (JSON.stringify(editorIds) !== JSON.stringify(EDITOR_IDS.slice().sort())) return "editor_panel_identity_set";
    if (dashboardCount !== 1) return "dashboard_identity_set";
    if (chatCount !== 1) return "chat_identity_set";
    if (terminalCount > 4) return "terminal_section_limit";
    if (totalPanes > 4) return "terminal_pane_limit";
    return null;
  }

  function writeAndVerify(layout) {
    var encoded = JSON.stringify(layout);
    var priorRaw = null;
    var hadPrior = false;
    try {
      priorRaw = window.localStorage.getItem(STORAGE_KEY);
      hadPrior = priorRaw !== null;
      if (faults.failNextWrite) { faults.failNextWrite = false; throw new Error("injected_write_failure"); }
      window.localStorage.setItem(STORAGE_KEY, encoded);
      var readback = window.localStorage.getItem(STORAGE_KEY);
      if (readback !== encoded) throw new Error("readback_mismatch");
      metrics.persistCount += 1;
      metrics.lastPersistenceKey = STORAGE_KEY;
      return { ok: true };
    } catch (error) {
      try {
        if (hadPrior) window.localStorage.setItem(STORAGE_KEY, priorRaw);
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch (rollbackError) {}
      metrics.failedPersistenceCount += 1;
      metrics.lastRecoveryReason = "local_storage_write_failed";
      return { ok: false, reason: "local_storage_write_failed", error: String(error && error.message || error) };
    }
  }

  function quarantine(raw, reason) {
    if (raw == null) return null;
    var key = QUARANTINE_PREFIX + Date.now();
    try { window.localStorage.setItem(key, JSON.stringify({ reason: reason, captured_at_utc: now(), raw: raw })); return key; }
    catch (error) { return null; }
  }

  function recoveryToast(reason) {
    var prior = document.getElementById("pm-home-recovery-toast");
    if (prior) prior.remove();
    var toast = document.createElement("div");
    toast.id = "pm-home-recovery-toast";
    toast.className = "pm-home-recovery-toast";
    toast.setAttribute("role", "status");
    toast.textContent = "Home layout recovered safely: " + reason.replace(/_/g, " ") + ".";
    document.body.appendChild(toast);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 5200);
  }

  /* The full-thread packet changes only the untouched factory arrangement.
     Copy-forward every customized layout. A legacy record qualifies only
     when its complete surface placement, visibility, collapse, bounds,
     sizing, and Browser ownership still equal the former 1.0.0 seed. */
  function isUntouchedLegacyFactoryLayout(layout) {
    if (!layout || layout.schema_id !== "pm.home_workspace_layout.v1" || layout.schema_version !== "1.0.0" || !Array.isArray(layout.surfaces) || layout.surfaces.length !== 7) return false;
    var expected = {
      editor_panel_1: ["editor_panel", "home_main", 0, true, 360],
      editor_panel_2: ["editor_panel", "home_main", 1, true, 360],
      editor_panel_3: ["editor_panel", "home_main", 3, false, 360],
      editor_panel_4: ["editor_panel", "home_main", 4, false, 360],
      dashboard: ["dashboard", "home_main", 2, true, 360],
      chat: ["chat", "dock_right", 0, false, 360],
      "terminal_section:terminal_section_1": ["terminal_section", "dock_bottom", 0, true, 260]
    };
    return Object.keys(expected).every(function (id) {
      var row = surfaceById(layout, id);
      var want = expected[id];
      if (!row || row.surface_kind !== want[0] || row.host !== want[1] || Number(row.slot_index) !== want[2] || Boolean(row.visible) !== want[3]) return false;
      if (Boolean(row.collapsed) || row.floating_bounds != null) return false;
      var size = row.size || {};
      if (Number(size.basis_px || want[4]) !== want[4]) return false;
      if (size.cross_basis_px != null && Number(size.cross_basis_px) !== want[4]) return false;
      if (row.surface_kind === "editor_panel") {
        var ref = row.domain_ref || {};
        if (Boolean(ref.browser_active) || ref.browser_session_id != null) return false;
      }
      return true;
    });
  }

  function readLayout() {
    var raw = null;
    var sourceKey = STORAGE_KEY;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (var legacyIndex = 0; legacyIndex < LEGACY_STORAGE_KEYS.length; legacyIndex += 1) {
          var legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEYS[legacyIndex]);
          if (legacyRaw) { raw = legacyRaw; sourceKey = LEGACY_STORAGE_KEYS[legacyIndex]; break; }
        }
      }
    } catch (error) { raw = null; }
    if (!raw) return defaultLayout();
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.schema_version && isFutureVersion(parsed.schema_version)) {
        quarantine(raw, "future_schema_version");
        metrics.recoveredLayoutCount += 1;
        metrics.lastRecoveryReason = "future_schema_version";
        var futureRecovered = normalizeLayout(null, "future_schema_version");
        futureRecovered.migration.source_key = sourceKey;
        var futureWrite = writeAndVerify(futureRecovered);
        receipt("storage.recovery", futureWrite.ok ? "applied" : "failed", { reason: futureWrite.ok ? "future_schema_version" : futureWrite.reason, source_key: sourceKey, persisted: futureWrite.ok });
        setTimeout(function () { recoveryToast("future_schema_version"); }, 0);
        return futureRecovered;
      }
      if (isUntouchedLegacyFactoryLayout(parsed)) {
        var factoryMigrated = defaultLayout();
        factoryMigrated.layout_revision = Math.max(0, Number(parsed.layout_revision) || 0);
        factoryMigrated.migration = { from_schema_version: "1.0.0", migrated_at_utc: now(), source_key: sourceKey, disposition: "factory_default_upgrade" };
        factoryMigrated.validation.status = "migrated";
        var factoryWrite = writeAndVerify(factoryMigrated);
        receipt("storage.migration", factoryWrite.ok ? "applied" : "failed", { reason: factoryWrite.ok ? "factory_default_upgrade" : factoryWrite.reason, source_key: sourceKey, persisted: factoryWrite.ok });
        if (factoryWrite.ok && sourceKey !== STORAGE_KEY) try { window.localStorage.removeItem(sourceKey); } catch (ignoredFactory) {}
        return factoryMigrated;
      }
      if (parsed && parsed.schema_version && parsed.schema_version !== CURRENT_LAYOUT_VERSION && Array.isArray(parsed.surfaces)) {
        var migrated = normalizeLayout(parsed, null);
        migrated.migration = { from_schema_version: String(parsed.schema_version), migrated_at_utc: now(), source_key: sourceKey, disposition: "copy_forward_customized" };
        migrated.validation.status = "migrated";
        migrated.validation.last_validation_errors = [];
        var migrationWrite = writeAndVerify(migrated);
        receipt("storage.migration", migrationWrite.ok ? "applied" : "failed", { reason: migrationWrite.ok ? "copy_forward_customized" : migrationWrite.reason, source_key: sourceKey, persisted: migrationWrite.ok });
        if (migrationWrite.ok && sourceKey !== STORAGE_KEY) try { window.localStorage.removeItem(sourceKey); } catch (ignored) {}
        return migrated;
      }
      var errorCode = validateLayout(parsed);
      var normalized = errorCode ? normalizeLayout(parsed, errorCode) : normalizeLayout(parsed, null);
      if (sourceKey !== STORAGE_KEY && !errorCode) {
        normalized.migration = { from_schema_version: String(parsed.schema_version || "1.0.0"), migrated_at_utc: now(), source_key: sourceKey, disposition: "copy_forward_customized" };
        normalized.validation.status = "migrated";
        var legacyWrite = writeAndVerify(normalized);
        receipt("storage.migration", legacyWrite.ok ? "applied" : "failed", { reason: legacyWrite.ok ? "copy_forward_customized" : legacyWrite.reason, source_key: sourceKey, persisted: legacyWrite.ok });
        if (legacyWrite.ok) try { window.localStorage.removeItem(sourceKey); } catch (ignoredLegacy) {}
        return normalized;
      }
      if (errorCode || normalized.validation.last_validation_errors.length) {
        var reason = errorCode || normalized.validation.last_validation_errors[0];
        quarantine(raw, reason);
        metrics.recoveredLayoutCount += 1;
        metrics.lastRecoveryReason = reason;
        var recoveryWrite = writeAndVerify(normalized);
        receipt("storage.recovery", recoveryWrite.ok ? "applied" : "failed", { reason: reason, source_key: sourceKey, persisted: recoveryWrite.ok });
        setTimeout(function () { recoveryToast(reason); }, 0);
      }
      return normalized;
    } catch (error) {
      quarantine(raw, "corrupt_json");
      metrics.recoveredLayoutCount += 1;
      metrics.lastRecoveryReason = "corrupt_json";
      var recovered = normalizeLayout(null, "corrupt_json");
      var corruptWrite = writeAndVerify(recovered);
      receipt("storage.recovery", corruptWrite.ok ? "applied" : "failed", { reason: "corrupt_json", source_key: sourceKey, persisted: corruptWrite.ok });
      setTimeout(function () { recoveryToast("corrupt_json"); }, 0);
      return recovered;
    }
  }

  function command(commandId, payload) {
    var record = Object.assign({
      command_id: commandId,
      project_id: PROJECT_ID,
      workspace_tab_id: WORKSPACE_TAB_ID,
      origin: "home_workspace",
      correlation_id: uid("pm-home"),
      idempotency_key: uid("pm-home-idem"),
      expected_layout_revision: committed ? committed.layout_revision : 0,
      dispatched_at_utc: now()
    }, payload || {});
    commandLog.push(record);
    metrics.commandCount += 1;
    metrics.lastCommandId = commandId;
    try { window.dispatchEvent(new CustomEvent("pm:command-dispatch", { detail: clone(record) })); } catch (error) {}
    return record;
  }

  function receipt(commandId, outcome, details, commandRecord) {
    var record = {
      receipt_type: commandId + ".dispatch_receipt",
      command_id: commandId,
      correlation_id: commandRecord && commandRecord.correlation_id || uid("pm-home-receipt"),
      origin: "home_workspace",
      outcome: outcome,
      details: clone(details || {}),
      recorded_at_utc: now()
    };
    receiptLog.push(record);
    try { window.dispatchEvent(new CustomEvent("pm:dispatch-receipt", { detail: clone(record) })); } catch (error) {}
    return record;
  }

  function emit(eventType, payload) {
    var record = { event_type: eventType, payload: clone(payload) };
    eventLog.push(record);
    try { window.dispatchEvent(new CustomEvent(eventType, { detail: clone(payload) })); } catch (error) {}
    return record;
  }

  function changedSurfaceIds(before, after) {
    var ids = [];
    after.surfaces.forEach(function (surface) {
      var prior = surfaceById(before, surface.surface_instance_id);
      if (!prior || JSON.stringify(prior) !== JSON.stringify(surface)) ids.push(surface.surface_instance_id);
    });
    before.surfaces.forEach(function (surface) {
      if (!surfaceById(after, surface.surface_instance_id) && ids.indexOf(surface.surface_instance_id) === -1) ids.push(surface.surface_instance_id);
    });
    return ids;
  }

  function commitLayout(next, mutationKind, commandId, details) {
    details = details || {};
    var prior = clone(committed);
    var normalized = normalizeLayout(next, null);
    var errorCode = validateLayout(normalized);
    if (errorCode) { renderLayout(prior); return { ok: false, reason: errorCode }; }
    normalized.layout_revision = prior.layout_revision + 1;
    normalized.saved_at_utc = now();
    normalized.validation.status = "valid";
    normalized.validation.last_validation_errors = [];
    var affected = changedSurfaceIds(prior, normalized);
    if (!affected.length) return { ok: true, no_change: true };
    var commandRecord = command(commandId, Object.assign({
      mutation_kind: mutationKind,
      new_layout_revision: normalized.layout_revision,
      affected_surface_instance_ids: affected.slice()
    }, details.command_payload || {}));
    var persisted = writeAndVerify(normalized);
    if (!persisted.ok) {
      receipt(commandId, "failed", { reason: persisted.reason, layout_revision: prior.layout_revision, rolled_back: true }, commandRecord);
      restoreFocusSequence(prior);
      renderLayout(prior);
      recoveryToast(persisted.reason);
      return { ok: false, reason: persisted.reason, command: commandRecord };
    }
    committed = normalized;
    restoreOwnerRefs(committed);
    var layoutPayload = {
      schema_id: "pm.event.workspace_layout_changed.v1",
      schema_version: "1.0.0",
      project_id: PROJECT_ID,
      workspace_tab_id: WORKSPACE_TAB_ID,
      command_id: commandId,
      origin: "home_workspace",
      correlation_id: commandRecord.correlation_id,
      prior_layout_revision: prior.layout_revision,
      new_layout_revision: normalized.layout_revision,
      mutation_kind: mutationKind,
      affected_surface_instance_ids: affected.slice(),
      source_host: details.source_host !== undefined ? details.source_host : null,
      target_host: details.target_host !== undefined ? details.target_host : null,
      target_slot_index: details.target_slot_index !== undefined ? details.target_slot_index : null,
      target_surface_instance_id: details.target_surface_instance_id || null,
      insertion_edge: details.insertion_edge || null,
      persisted: true
    };
    emit("workspace.layout_changed", layoutPayload);
    if (commandId === "cmd.panel.undock") {
      emit("panel.undocked", {
        project_id: PROJECT_ID,
        workspace_tab_id: WORKSPACE_TAB_ID,
        command_id: commandRecord.command_id,
        correlation_id: commandRecord.correlation_id,
        surface_instance_id: details.command_payload && details.command_payload.surface_instance_id || affected[0],
        source_host: layoutPayload.source_host,
        target_host: "floating",
        layout_revision: normalized.layout_revision
      });
    } else if (commandId === "cmd.panel.redock") {
      emit("panel.redocked", {
        project_id: PROJECT_ID,
        workspace_tab_id: WORKSPACE_TAB_ID,
        command_id: commandRecord.command_id,
        correlation_id: commandRecord.correlation_id,
        surface_instance_id: details.command_payload && details.command_payload.surface_instance_id || affected[0],
        source_host: "floating",
        target_host: layoutPayload.target_host,
        target_slot_index: layoutPayload.target_slot_index,
        layout_revision: normalized.layout_revision
      });
    }
    receipt(commandId, "applied", { layout_revision: normalized.layout_revision, persisted: true, affected_surface_instance_ids: affected }, commandRecord);
    /* Drag and resize commits pre-seat the DOM to equal the committed model,
       so the full render (which reseats chrome on every surface) would be a
       geometric no-op with a visible settle flash. They pass skip_render and
       get the light sync instead. */
    if (details && details.skip_render) {
      syncHostGeometry(committed);
      updateMenuAvailability(committed);
    } else {
      renderLayout(committed);
    }
    return { ok: true, command: commandRecord, event: layoutPayload };
  }

  /* Panels 3 and 4 get the SAME internal ids pm6RenderFile(name, prefix)
     writes into (#<prefix>Gutter / #<prefix>Code / #<prefix>Minimap), so
     "Open in Panel" renders a real buffer there instead of a debug string. */
  function editorPrefixFor(surfaceId) {
    var index = EDITOR_IDS.indexOf(surfaceId);
    return index === -1 ? null : "pane" + (index + 1);
  }

  function makeEditorShell(surfaceId, index) {
    var safe = surfaceId.replace(/[^a-z0-9]+/gi, "_");
    var existing = document.getElementById("pmHomeEditor_" + safe);
    if (existing) return existing;
    var owner = editorOwners[surfaceId];
    var prefix = editorPrefixFor(surfaceId) || ("pane" + index);
    var seed = index === 3 ? "README.md" : "src/routes/auth.rs";
    var panel = document.createElement("section");
    panel.id = "pmHomeEditor_" + safe;
    panel.className = "editor-pane pm-home-editor-shell";
    panel.innerHTML = '<div class="editor-tabs" role="tablist" aria-label="Panel ' + index + ' tabs">' +
      '<span class="tab active" role="tab" tabindex="0" data-file="' + seed + '">' + (index === 3 ? 'README.md' : 'auth.rs') + '</span>' +
      '<span class="pane-tabbar-actions"></span></div>' +
      '<div class="editor-area">' +
      '<div class="editor-gutter" id="' + prefix + 'Gutter"></div>' +
      '<div class="editor-code" id="' + prefix + 'Code" tabindex="0"></div>' +
      '<div class="editor-minimap" id="' + prefix + 'Minimap"><canvas class="minimap-canvas"></canvas><div class="minimap-viewport"></div></div>' +
      '</div>';
    panel.setAttribute("data-editor-panel-id", surfaceId);
    panel.setAttribute("data-editor-group-id", owner.editor_group_id);
    panel.setAttribute("data-pm-home-editor-prefix", prefix);
    if (typeof window.PM6_RENDER_FILE === "function") {
      try { window.PM6_RENDER_FILE(seed, prefix); } catch (error) {}
    }
    return panel;
  }

  function makeTerminalShell(surfaceId) {
    var safe = surfaceId.replace(/[^a-z0-9]+/gi, "_");
    var existing = document.getElementById("pmHomeTerminal_" + safe);
    if (existing) return existing;
    var section = document.createElement("section");
    section.id = "pmHomeTerminal_" + safe;
    section.className = "pm-home-terminal-shell";
    section.innerHTML = '<div class="pm-home-terminal-head"><button type="button" data-pm-home-workgroup-handle>Workgroup</button><strong data-pm-home-terminal-title></strong><span class="pm-home-terminal-spacer"></span><button type="button" data-pm-home-action="split-terminal-pane">Split Pane</button><button type="button" data-pm-home-action="move-workgroup-new-section">New Section</button><span data-pm-home-terminal-counts></span></div><div class="pm-home-terminal-body" data-pm-home-terminal-body></div>';
    return section;
  }

  function surfaceElement(surface) {
    if (surface.surface_instance_id === "editor_panel_1") return document.getElementById("editorPane1");
    if (surface.surface_instance_id === "editor_panel_2") return document.getElementById("editorPane2");
    if (surface.surface_instance_id === "editor_panel_3") return makeEditorShell(surface.surface_instance_id, 3);
    if (surface.surface_instance_id === "editor_panel_4") return makeEditorShell(surface.surface_instance_id, 4);
    if (surface.surface_instance_id === "dashboard") return document.getElementById("dashboardView");
    if (surface.surface_instance_id === "chat") return document.getElementById("chatPanel");
    if (surface.surface_kind === "terminal_section" && surface.surface_instance_id === "terminal_section:terminal_section_1") return document.getElementById("bottomPanel");
    if (surface.surface_kind === "terminal_section") return makeTerminalShell(surface.surface_instance_id);
    return null;
  }

  function captureBrowserChrome() {
    if (!browserChrome.preview) browserChrome.preview = document.getElementById("browserPreviewTab");
    if (!browserChrome.automation) browserChrome.automation = document.getElementById("automationBrowserTab");
    return browserChrome;
  }

  /* The shared Panel 1 overflow fitter owns only its collapsed file tabs, but
     legacy fit passes clear inline display on every tab before measuring. Keep
     Automation's separate session visibility truthful after those passes:
     inactive is absent from layout and focus order; active remains revealable. */
  function syncAutomationTabVisibility() {
    var chrome = captureBrowserChrome();
    var automation = chrome.automation;
    if (!automation) return;
    /* Preview wins any transient dual-active residue left by the retired Pane 2
       switcher after both canonical Browser tabs move into Panel 1. */
    var previewActive = Boolean(chrome.preview && chrome.preview.classList.contains("active"));
    var active = automation.classList.contains("active") && !previewActive;
    if (!active) automation.classList.remove("active");
    var display = active ? "" : "none";
    if (automation.style.display !== display) automation.style.display = display;
    automation.setAttribute("aria-hidden", active ? "false" : "true");
    automation.setAttribute("tabindex", active ? "0" : "-1");
    automation.setAttribute("data-pm-home-automation-active", active ? "true" : "false");
  }

  /* PM_DEMO is intentionally non-persistent. Seed its first-open file model
     from the accepted factory arrangement, then remove the retired Panel 2
     copies. Context tabs created before Home boots are retained after the
     seven factory buffers; ordinary file duplication is not. */
  function syncFactoryEditorProjection() {
    var state = null;
    try { state = window.PM_DEMO && window.PM_DEMO.state && window.PM_DEMO.state.files; } catch (error) {}
    if (state && Array.isArray(state.openTabs)) {
      var contexts = state.openTabs.filter(function (path) { return String(path).indexOf("context:") === 0; });
      state.openTabs.length = 0;
      FACTORY_FILE_PATHS.concat(contexts).forEach(function (path) {
        if (state.openTabs.indexOf(path) === -1) state.openTabs.push(path);
      });
      if (state.openTabs.indexOf(state.activeTab) === -1) state.activeTab = FACTORY_FILE_PATHS[0];
      if (typeof window.PM6_RENDER_EDITOR_TABS === "function") {
        try { window.PM6_RENDER_EDITOR_TABS(); } catch (error) {}
      }
    }
    var paneTwoStrip = document.querySelector("#editorPane2 .editor-tabs");
    if (paneTwoStrip) {
      Array.prototype.forEach.call(paneTwoStrip.querySelectorAll('.tab[data-file]'), function (tab) { tab.remove(); });
    }
  }

  function ensureBrowserTab(surfaceId, element) {
    if (!element) return null;
    var tabs = element.querySelector(".editor-tabs");
    if (!tabs) return null;
    if (browserOwner.target_editor_panel_id !== surfaceId) return null;
    var chrome = captureBrowserChrome();
    var existing = chrome.preview;
    if (!existing) return null;
    var before = tabs.querySelector(".pm-ed-overflow") || tabs.querySelector(".pane-tabbar-actions");
    existing.removeAttribute("onclick");
    existing.classList.add("pm-home-browser-tab");
    existing.setAttribute("role", "tab");
    existing.setAttribute("tabindex", "0");
    existing.setAttribute("data-pm-home-browser-tab", surfaceId);
    existing.setAttribute("aria-label", "Open Browser in Panel " + (EDITOR_IDS.indexOf(surfaceId) + 1));
    if (chrome.automation) {
      chrome.automation.removeAttribute("onclick");
      chrome.automation.setAttribute("role", "tab");
      chrome.automation.setAttribute("tabindex", "0");
      chrome.automation.setAttribute("data-pm-home-automation-tab", surfaceId);
      chrome.automation.setAttribute("aria-label", "Open automation Browser in Panel " + (EDITOR_IDS.indexOf(surfaceId) + 1));
      var browserGroupStable = existing.parentNode === tabs &&
        chrome.automation.parentNode === tabs &&
        existing.nextElementSibling === chrome.automation &&
        chrome.automation.nextElementSibling === before;
      if (!browserGroupStable) {
        tabs.insertBefore(existing, before);
        tabs.insertBefore(chrome.automation, before);
      }
      syncAutomationTabVisibility();
    } else if (existing.parentNode !== tabs || existing.nextElementSibling !== before) {
      tabs.insertBefore(existing, before);
    }
    return existing;
  }

  function buildSurfaceRegistry(layout) {
    surfaceRegistry = Object.create(null);
    hostRegistries = Object.create(null);
    HOSTS.forEach(function (host) { hostRegistries[host] = []; });
    layout.surfaces.forEach(function (surface) {
      var element = surfaceElement(surface);
      surfaceRegistry[surface.surface_instance_id] = { id: surface.surface_instance_id, kind: surface.surface_kind, element: element };
      hostRegistries[surface.host].push(surface.surface_instance_id);
      if (surface.surface_kind === "editor_panel" && element) {
        var owner = editorOwners[surface.surface_instance_id];
        element.setAttribute("data-editor-panel-id", owner.editor_panel_id);
        element.setAttribute("data-editor-group-id", owner.editor_group_id);
        ensureBrowserTab(surface.surface_instance_id, element);
      }
    });
    HOSTS.forEach(function (host) {
      hostRegistries[host].sort(function (a, b) {
        return surfaceById(layout, a).slot_index - surfaceById(layout, b).slot_index;
      });
    });
  }

  /* Registry refresh WITHOUT re-resolving elements: a live gesture needs the
     draft ordering to reflect the in-flight placement, but re-resolving
     surface elements mid-drag would recreate shells and drop pointer capture. */
  function buildHostRegistriesFrom(layout) {
    hostRegistries = Object.create(null);
    HOSTS.forEach(function (host) { hostRegistries[host] = []; });
    layout.surfaces.forEach(function (surface) {
      if (hostRegistries[surface.host]) hostRegistries[surface.host].push(surface.surface_instance_id);
    });
    HOSTS.forEach(function (host) {
      hostRegistries[host].sort(function (a, b) {
        return surfaceById(layout, a).slot_index - surfaceById(layout, b).slot_index;
      });
    });
  }

  function hostElement(host) { return root.querySelector('[data-pm-home-host="' + host + '"]'); }

  function clearSurfacePosition(element) {
    if (!element) return;
    ["left", "right", "top", "bottom", "width", "height", "max-width", "max-height", "z-index", "order", "flex"].forEach(function (name) { element.style.removeProperty(name); });
    element.style.removeProperty("--pm-home-float-z");
  }

  /* Lines-only grip glyph for the surface's top-right corner: two groove
     strokes for drag affordance (no fill triangle -- the corner stays open)
     and an inset ring path the CSS reveals on :focus-visible (an outline
     would be clipped away by the triangular clip-path). */
  var GRIP_SVG = '<svg aria-hidden="true" viewBox="0 0 20 20">' +
    '<path class="pm-home-grip-groove" d="M9.5 4.5 L15.5 10.5 M4.5 4.5 L15.5 15.5" fill="none" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path class="pm-home-grip-ring" d="M1.5 2 L16 2 Q18 2 18 4 L18 18.5 Z" fill="none" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  /* The grip is the surface element's own absolutely-positioned first child,
     an 18px lines-only triangle in the TOP-RIGHT corner. It sits at z-index
     140 -- above the pinned actions cluster (130), chat's stacked header (25),
     the surface kebab (130) and the resize handles (100). Only the upper-right
     triangle of its box steals hits (clip-path polygon(0 0, 100% 0,
     100% 100%)); everything left of the hypotenuse passes through to the
     chrome beneath.
     (The old in-row grip lived inside `.editor-tabs`, where it fought the tab
     silhouette layer for slot 0 on every chrome reseat.) */

  function attachSurfaceControls(surface) {
    var record = surfaceRegistry[surface.surface_instance_id];
    var element = record && record.element;
    if (!element) return;
    var grip = element.querySelector('[data-pm-home-handle="' + surface.surface_instance_id + '"]');
    if (!grip) {
      grip = document.createElement("button");
      grip.type = "button";
      grip.className = "pm-home-surface-grip";
      grip.setAttribute("data-pm-home-handle", surface.surface_instance_id);
      grip.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
      grip.setAttribute("aria-label", "Move " + surface.surface_instance_id);
      grip.setAttribute("aria-grabbed", "false");
      grip.title = "Drag to move, or press Enter to move with the arrow keys";
      grip.innerHTML = GRIP_SVG;
      element.insertBefore(grip, element.firstChild);
      bindDragHandle(grip, surface.surface_instance_id);
    } else if (grip.parentNode !== element || element.firstElementChild !== grip) {
      /* the chat engine rebuilds #chatPanel with innerHTML -- re-seat rather
         than duplicate. The grip is a child of the SURFACE, not any head row,
         so PM6 tab-strip rebuilds no longer touch it at all. */
      element.insertBefore(grip, element.firstChild);
    }
    var options = element.querySelector('[data-pm-home-surface-options="' + surface.surface_instance_id + '"]');
    if (surface.surface_kind === "chat") {
      /* the chat keeps its ORIGINAL header menu (Duplicate/Archive/Pop out/
         Close -- richer than the T20 kebab's single Pop Out row, and its
         pop-out already routes through the T20 float guard). Two adjacent
         "more options" buttons read as a bug. The one T20-exclusive row --
         Dock Back for a FLOATING chat -- is injected into the base menu
         below (the base template always renders its docked variant because
         T20 floats #chatPanel itself, so a floated chat otherwise shows a
         useless "Pop out window" and no way back but the grip). */
      if (options && options.parentNode) options.parentNode.removeChild(options);
      options = null;
      var chatMenu = element.querySelector(".pm6-chat-more-menu");
      if (chatMenu) {
        var dockRow = chatMenu.querySelector("[data-pm-home-chat-row]");
        if (!dockRow) {
          dockRow = document.createElement("button");
          dockRow.type = "button";
          /* pm6-chat-more-item = base styling PLUS the base delegated
             close-menu path (its generic row branch closes the menu with the
             portal animation, same as Duplicate/Archive) -- the redock action
             itself is dispatched by wireActions' capture listener keyed on
             data-pm-home-chat-row, which deliberately does NOT stop
             propagation so that base close still runs. */
          dockRow.className = "pm6-chat-more-item";
          dockRow.setAttribute("role", "menuitem");
          dockRow.setAttribute("data-pm-home-chat-row", "redock");
          dockRow.title = "Dock back into the workspace";
          dockRow.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M14 6.5 L14 14 L6.5 14"/><path d="M13.5 13.5 L7.8 7.8"/></svg><span>Dock back</span>';
          chatMenu.insertBefore(dockRow, chatMenu.querySelector(".closeChatBtn"));
        }
        /* host-aware visibility, write-if-changed so chromeWatch stays quiet:
           floating -> show Dock back, hide the base "Pop out window" (it
           would re-run popOutChat on an already-floating surface). */
        var floatingNow = surface.host === "floating";
        if (dockRow.style.display !== (floatingNow ? "" : "none")) dockRow.style.display = floatingNow ? "" : "none";
        var popRow = chatMenu.querySelector(".popOutBtn");
        if (popRow && popRow.style.display !== (floatingNow ? "none" : "")) popRow.style.display = floatingNow ? "none" : "";
      }
    } else if (!options) {
      options = document.createElement("button");
      options.type = "button";
      options.className = "pm-home-surface-options";
      options.setAttribute("data-pm-home-surface-options", surface.surface_instance_id);
      options.setAttribute("data-pm-home-action", "open-surface-menu");
      options.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
      options.setAttribute("aria-haspopup", "menu");
      options.setAttribute("aria-expanded", "false");
      options.setAttribute("aria-label", "Options for " + surface.surface_instance_id);
      options.title = "Surface options";
      /* VERTICAL dots: the kebab reads as a right-edge column control, sitting
         directly below the grip triangle (grip z 140 owns the y 0-18
         upper-right triangle; the kebab owns y 20-40). */
      options.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>';
      /* the kebab is a child of the SURFACE itself, like the grip -- parking
         it inside .pane-tabbar-actions / a head row let PM6 strip rebuilds
         destroy it, and gave the terminal a stranded "..." bar */
      element.appendChild(options);
    } else if (options.parentNode !== element) {
      /* re-seat rather than duplicate, mirroring the grip's guard */
      element.appendChild(options);
    }
    /* Per-surface divider: ALWAYS a column handle now -- it transfers WIDTH
       between the adjacent pair in every row-axis host. In a row dock
       (dock_top/dock_bottom) the divider is emitted on every visible surface
       EXCEPT the last (a pair transfer needs a right-hand partner; the last
       sibling gets none), and dock HEIGHT moves to the separate full-width
       track handle created below. home_main/dock_left/dock_right keep their
       existing per-surface divider behavior. */
    var resizer = element.querySelector('[data-pm-home-resizer="' + surface.surface_instance_id + '"]:not([data-pm-home-resizer-corner]):not([data-pm-home-resizer-track])');
    var resizeClass = "resizer-col";
    var rowDock = surface.host === "dock_top" || surface.host === "dock_bottom";
    var captured = gesture && gesture.kind === "resize" && gesture.surfaceId === surface.surface_instance_id;
    var wantsDivider = true;
    /* home_main joins the row docks in suppressing the LAST visible
       sibling's divider: a pair transfer needs a right-hand partner, and the
       last home_main divider had none -- beginResize found no nextId, so it
       fell to the diluted single-basis path (the exact non-local behavior
       the pair-transfer rebuild retired), and its 16x56 grab-glow pseudo
       overhung the host's right edge by ~11px, which was the last real
       source of the Home screen's horizontal overflow. dock_left/dock_right
       KEEP their last-surface dividers: on the column docks that handle
       drives the dock track itself via previewResize. */
    var pairRow = rowDock || surface.host === "home_main";
    if (pairRow) {
      var rowRef = (gesture && gesture.draft) || committed;
      var rowVisibleIds = (hostRegistries[surface.host] || []).filter(function (id) {
        var sibling = rowRef && surfaceById(rowRef, id);
        return Boolean(sibling && sibling.visible);
      });
      wantsDivider = rowVisibleIds.length > 0 && rowVisibleIds[rowVisibleIds.length - 1] !== surface.surface_instance_id;
    }
    /* Never destroy the element that currently holds pointer capture: removing
       it mid-drag fires lostpointercapture and the gesture dies on frame one. */
    if (resizer && (resizer.getAttribute("data-pm-home-resize-orientation") !== resizeClass || !wantsDivider) && !captured) {
      resizer.remove();
      resizer = null;
    }
    if (!resizer && wantsDivider) {
      resizer = document.createElement("div");
      resizer.setAttribute("data-pm-home-resizer", surface.surface_instance_id);
      resizer.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
      resizer.setAttribute("data-pm-home-resize-orientation", resizeClass);
      resizer.setAttribute("role", "separator");
      resizer.setAttribute("tabindex", "0");
      resizer.setAttribute("aria-label", "Resize " + surface.surface_instance_id);
      resizer.setAttribute("aria-orientation", "vertical");
      resizer.className = "pm-home-resize-handle " + resizeClass;
      element.appendChild(resizer);
      bindResizer(resizer, surface.surface_instance_id);
    }
    if (resizer) {
      /* Rewrite the orientation class WITHOUT dropping state classes the
         shared resizer controller owns (`.resizing` drives the grab-glow); the
         old unconditional className assignment wiped it on every render
         frame. */
      resizer.classList.add("pm-home-resize-handle");
      resizer.classList.toggle("resizer-col", resizeClass === "resizer-col");
      resizer.classList.toggle("resizer-row", resizeClass === "resizer-row");
      resizer.setAttribute("data-pm-home-resize-orientation", resizeClass);
      resizer.setAttribute("aria-orientation", "vertical");
      if (resizer.parentNode !== element) element.appendChild(resizer);
    }
    /* Row-dock TRACK handle: a full-width row handle on the dock's outer edge
       that drives the dock's cross-axis track (cross_basis_px). Follows the
       floating corner handle's create/remove pattern; surfaces docked
       anywhere else must not carry it. */
    var track = element.querySelector('[data-pm-home-resizer-track="' + surface.surface_instance_id + '"]');
    if (rowDock) {
      if (!track) {
        track = document.createElement("div");
        track.setAttribute("data-pm-home-resizer-track", surface.surface_instance_id);
        track.setAttribute("data-pm-home-resizer", surface.surface_instance_id);
        track.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
        track.setAttribute("data-pm-home-resize-orientation", "resizer-track");
        track.setAttribute("role", "separator");
        track.setAttribute("tabindex", "0");
        track.setAttribute("aria-label", "Resize " + surface.surface_instance_id + " (dock height)");
        track.setAttribute("aria-orientation", "horizontal");
        track.className = "pm-home-resize-handle resizer-row";
        element.appendChild(track);
        bindResizer(track, surface.surface_instance_id, { track: true });
      } else if (track.parentNode !== element) {
        element.appendChild(track);
      }
    } else if (track && !captured) {
      track.remove();
    }
    /* Floating surfaces additionally get a bottom-right corner handle that
       drives BOTH axes; docked surfaces must not carry it. */
    var corner = element.querySelector('[data-pm-home-resizer-corner="' + surface.surface_instance_id + '"]');
    if (surface.host === "floating") {
      if (!corner) {
        corner = document.createElement("div");
        corner.setAttribute("data-pm-home-resizer-corner", surface.surface_instance_id);
        corner.setAttribute("data-pm-home-resizer", surface.surface_instance_id);
        corner.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
        corner.setAttribute("data-pm-home-resize-orientation", "resizer-corner");
        corner.setAttribute("role", "separator");
        corner.setAttribute("tabindex", "0");
        corner.setAttribute("aria-label", "Resize " + surface.surface_instance_id + " (both directions)");
        corner.className = "pm-home-resize-handle resizer-corner";
        element.appendChild(corner);
        bindResizer(corner, surface.surface_instance_id, { corner: true });
      } else if (corner.parentNode !== element) {
        element.appendChild(corner);
      }
    } else if (corner && !(gesture && gesture.kind === "resize" && gesture.surfaceId === surface.surface_instance_id)) {
      corner.remove();
    }
    if (surface.surface_kind === "terminal_section") wireTerminalLocalControls(surface, element);
  }

  function terminalTree(paneIds) {
    function leaf(id) { return { type: "leaf", paneId: id }; }
    if (paneIds.length <= 1) return leaf(paneIds[0]);
    if (paneIds.length === 2) return { type: "row", children: paneIds.map(leaf) };
    if (paneIds.length === 3) return { type: "col", children: [{ type: "row", children: paneIds.slice(0, 2).map(leaf) }, leaf(paneIds[2])] };
    return { type: "col", children: [{ type: "row", children: paneIds.slice(0, 2).map(leaf) }, { type: "row", children: paneIds.slice(2, 4).map(leaf) }] };
  }

  function syncTerminalRuntime(section) {
    var demo = window.PM_TERMINAL_DEMO;
    var state = demo && demo.state;
    if (!state || !Array.isArray(state.terminalGroups) || !section || !section.terminal_workgroup_id) return;
    var signature = JSON.stringify({ workgroup: section.terminal_workgroup_id, panes: section.pane_ids, sessions: section.terminal_session_ids });
    if (terminalRuntimeSignature !== signature) {
      var group = state.terminalGroups.filter(function (candidate) { return candidate.id === "g1"; })[0] || state.terminalGroups[0];
      if (!group) return;
      group.title = "Build";
      for (var i = 0; i < section.pane_ids.length; i += 1) {
        var paneId = section.pane_ids[i];
        var sessionId = section.terminal_session_ids[i];
        if (!state.panes[paneId]) {
          var seed = clone(state.panes[section.pane_ids[0]] || state.panes[Object.keys(state.panes)[0]] || {});
          seed.id = paneId;
          seed.displayName = "shell " + (i + 1);
          seed.lines = [{ t: "line", c: "$ terminal " + sessionId + " ready" }];
          state.panes[paneId] = seed;
        }
        state.panes[paneId].id = paneId;
        state.panes[paneId].sessionId = sessionId;
      }
      group.tree = terminalTree(section.pane_ids.slice());
      state.activeGroupId = group.id;
      if (section.pane_ids.indexOf(state.focusedPaneId) === -1) state.focusedPaneId = section.pane_ids[0];
      terminalRuntimeSignature = signature;
      try { demo.renderAll(); demo.syncTerminalTabBar("terminal"); } catch (error) {}
    }
    section.pane_ids.forEach(function (paneId, index) {
      var pane = document.querySelector('#bottomTerminalHost .terminal-pane[data-pane-id="' + paneId + '"]');
      if (pane) {
        pane.setAttribute("data-terminal-pane-id", paneId);
        pane.setAttribute("data-terminal-session-id", section.terminal_session_ids[index]);
      }
    });
    var activePill = document.querySelector("#pmTerminalCenterWrap .pm-term-wg-tab.pm-term-tab-active");
    if (activePill) {
      activePill.draggable = false;
      activePill.ondragstart = null;
      activePill.setAttribute("data-pm-home-workgroup-handle", "true");
      activePill.setAttribute("data-pm-home-surface-id", activeTerminalSectionId);
      activePill.setAttribute("data-terminal-workgroup-id", section.terminal_workgroup_id);
      bindWorkgroupHandle(activePill, activeTerminalSectionId);
    }
  }

  /* Split/New Section stay in .bottom-tabs-right, before the collapse chevron.
     PM6 pins that chevron with `margin-left: auto`, so it keeps the right edge
     regardless. (#pmBottomTermChrome looked like the natural toolbar slot but
     is not laid out in the Home projection, which made both controls
     invisible.) */
  function ensureBottomTerminalControls(surfaceId, element) {
    var host = element.querySelector(".bottom-tabs-right") || element.querySelector(".bottom-tabs");
    if (!host) return;
    var controls = element.querySelector(".pm-home-terminal-inline-controls");
    if (!controls) {
      controls = document.createElement("span");
      controls.className = "pm-home-terminal-inline-controls";
      controls.innerHTML = '<button type="button" class="pm-tiny-btn" data-pm-home-action="split-terminal-pane">Split Pane</button><button type="button" class="pm-tiny-btn" data-pm-home-action="move-workgroup-new-section">New Section</button>';
    }
    if (controls.parentNode !== host) host.insertBefore(controls, host.firstChild);
    controls.querySelectorAll("[data-pm-home-action]").forEach(function (button) { button.setAttribute("data-pm-home-surface-id", surfaceId); });
  }

  function projectTerminalRuntime(surface, element, section) {
    var runtime = document.getElementById("bottomTerminalHost");
    var originalParent = document.getElementById("bottomTabsContent");
    if (runtime && originalParent && !terminalRuntimeHome) {
      terminalRuntimeHome = document.createElement("span");
      terminalRuntimeHome.hidden = true;
      terminalRuntimeHome.setAttribute("data-pm-home-terminal-runtime-home", "true");
      originalParent.insertBefore(terminalRuntimeHome, runtime);
    }
    if (element.id === "bottomPanel") ensureBottomTerminalControls(surface.surface_instance_id, element);
    /* Model-truth gate for the HOME_STYLE empty-state rules: both
       display:block rules require #bottomPanel[data-pm-term-empty="true"],
       so the guidance note can only show while the model says the section is
       actually empty. Stamped on every bottomPanel-related pass. */
    if (element.id === "bottomPanel") {
      var bottomPanelEl = document.getElementById("bottomPanel");
      if (bottomPanelEl) bottomPanelEl.setAttribute("data-pm-term-empty", String(!section.terminal_workgroup_id));
    }
    var center = document.getElementById("pmTermCenterOuter");
    var chrome = document.getElementById("pmBottomTermChrome");
    if (chrome) chrome.style.setProperty("display", "none", "important");
    /* Empty-state removal is hoisted ABOVE the element-branch split and looks
       the note up at DOCUMENT level: when the runtime host is projected into
       a generated section, `element` is that shell, so an element-scoped
       lookup could never find (let alone remove) the note stranded inside
       #bottomTabsContent. Any live workgroup sweeps it. */
    var oldEmpty = document.querySelector("#bottomTabsContent > .pm-home-terminal-empty-state");
    if (section.terminal_workgroup_id && oldEmpty) { oldEmpty.remove(); oldEmpty = null; }
    if (section.terminal_workgroup_id) {
      activeTerminalSectionId = surface.surface_instance_id;
      syncTerminalRuntime(section);
      if (element.id === "bottomPanel") {
        if (runtime && terminalRuntimeHome && terminalRuntimeHome.parentNode && runtime.parentNode !== terminalRuntimeHome.parentNode) terminalRuntimeHome.parentNode.insertBefore(runtime, terminalRuntimeHome.nextSibling);
        if (center) center.style.removeProperty("display");
      } else {
        var body = element.querySelector("[data-pm-home-terminal-body]");
        if (body && runtime && runtime.parentNode !== body) { body.textContent = ""; body.appendChild(runtime); }
        if (center) center.style.setProperty("display", "none", "important");
      }
    } else if (element.id === "bottomPanel") {
      if (center) center.style.setProperty("display", "none", "important");
      if (!oldEmpty) {
        oldEmpty = document.createElement("div");
        oldEmpty.className = "pm-home-terminal-empty-state";
        oldEmpty.textContent = "This terminal section is empty. Drag the workgroup pill here to bring it back, or use Reset Layout in the Home menu.";
        if (originalParent) originalParent.appendChild(oldEmpty);
      }
    }
  }

  function renderTerminal(surface, element) {
    var section = terminalSections[surface.surface_instance_id] || { terminal_section_id: surface.surface_instance_id.split(":")[1], terminal_workgroup_id: null, pane_ids: [], terminal_session_ids: [] };
    var title = element.querySelector("[data-pm-home-terminal-title]");
    var body = element.querySelector("[data-pm-home-terminal-body]");
    var runtime = document.getElementById("bottomTerminalHost");
    var counts = element.querySelector("[data-pm-home-terminal-counts]");
    var workgroupButton = element.querySelector("[data-pm-home-workgroup-handle]");
    if (title) title.textContent = section.terminal_section_id.replace(/_/g, " ");
    if (counts) counts.textContent = section.pane_ids.length + "/4 panes";
    if (body) {
      if (!section.terminal_workgroup_id && runtime && body.contains(runtime) && terminalRuntimeHome && terminalRuntimeHome.parentNode) {
        terminalRuntimeHome.parentNode.insertBefore(runtime, terminalRuntimeHome.nextSibling);
      }
      body.classList.toggle("pm-home-terminal-empty", !section.terminal_workgroup_id);
      if (!runtime || !body.contains(runtime)) {
        body.textContent = section.terminal_workgroup_id ? "Workgroup " + section.terminal_workgroup_id + "\nPanes " + section.pane_ids.join(", ") + "\nSessions " + section.terminal_session_ids.join(", ") : "Empty terminal section. Move a workgroup here to reuse it.";
      }
    }
    if (workgroupButton) {
      workgroupButton.hidden = !section.terminal_workgroup_id;
      workgroupButton.textContent = section.terminal_workgroup_id || "Workgroup";
      bindWorkgroupHandle(workgroupButton, surface.surface_instance_id);
    }
    projectTerminalRuntime(surface, element, section);
    element.querySelectorAll('[data-pm-home-action="split-terminal-pane"]').forEach(function (button) {
      var total = totalTerminalPanes();
      button.disabled = !section.terminal_workgroup_id || total >= 4;
      var reason = !section.terminal_workgroup_id ? "Move a workgroup here first" : (total >= 4 ? "Maximum four visible terminal panes" : "");
      button.setAttribute("aria-disabled", String(button.disabled));
      button.setAttribute("data-disabled-reason", reason);
      button.setAttribute("aria-description", reason || "Split active terminal pane");
      button.title = reason || "Split active terminal pane";
    });
    element.querySelectorAll('[data-pm-home-action="move-workgroup-new-section"]').forEach(function (button) {
      var atLimit = terminalSurfaceCount() >= 4;
      button.disabled = !section.terminal_workgroup_id || atLimit;
      var reason = !section.terminal_workgroup_id ? "Move a workgroup here first" : (atLimit ? "Maximum four terminal sections" : "");
      button.setAttribute("aria-disabled", String(button.disabled));
      button.setAttribute("data-disabled-reason", reason);
      button.setAttribute("aria-description", reason || "Move this workgroup into a new terminal section");
      button.title = reason || "Move this workgroup into a new terminal section";
    });
  }

  function applySurface(surface, element) {
    if (!element) return;
    clearSurfacePosition(element);
    element.classList.add("pm-home-surface");
    element.setAttribute("data-pm-home-surface", surface.surface_instance_id);
    element.setAttribute("data-pm-home-kind", surface.surface_kind);
    element.setAttribute("data-pm-home-visible", String(surface.visible));
    element.setAttribute("data-pm-home-collapsed", String(surface.collapsed));
    element.setAttribute("data-pm-home-slot", String(surface.slot_index));
    element.setAttribute("data-pm-home-current-host", surface.host);
    applySurfaceFlex(surface, element);
    if (surface.surface_kind === "chat") element.classList.toggle("hidden", !surface.visible);
    if (!surface.visible) return;
    var host = hostElement(surface.host);
    if (host && element.parentNode !== host) host.appendChild(element);
    element.style.setProperty("order", String(surface.slot_index));
    if (surface.host === "floating") {
      var bounds = clampBounds(surface.floating_bounds || tiledFloatBounds(committed, surface.surface_instance_id));
      element.style.setProperty("left", bounds.x + "px", "important");
      element.style.setProperty("top", bounds.y + "px", "important");
      element.style.setProperty("width", bounds.width + "px", "important");
      element.style.setProperty("height", bounds.height + "px", "important");
      element.style.setProperty("--pm-home-float-z", String(Math.max(1, surface.last_focus_seq || 1)));
    }
    /* Panels 3/4 hydrate lazily: a generated editor shell whose .editor-code
       has never drawn a buffer (PM6_RENDER_FILE was not up yet when the shell
       was built) renders its owner's active buffer the moment it is seated
       visible in a host. */
    if (element.classList.contains("pm-home-editor-shell")) {
      var shellCode = element.querySelector(".editor-code");
      var shellOwner = editorOwners[surface.surface_instance_id];
      if (shellCode && shellCode.childElementCount === 0 && shellOwner && shellOwner.active_buffer_id) {
        try { renderFileIntoPanel(surface.surface_instance_id, String(shellOwner.active_buffer_id).replace(/^buffer:/, "")); } catch (error) {}
      }
    }
    attachSurfaceControls(surface);
    syncCollapseControl(surface, element);
    if (surface.surface_kind === "terminal_section") renderTerminal(surface, element);
  }

  /* No-dead-space invariant for the main row: re-sum the visible surfaces'
     committed bases to the host's actual width (proportional rescale). A
     persisted degenerate layout (tiny bases, lost grow, stale window size)
     self-heals at render time instead of drawing an unclaimable void, and the
     pair-transfer resize always starts from px-true bases. Projection-layer
     normalization only -- no command, no revision bump; the corrected bases
     ride along with the next real commit. */
  function normalizeMainRowBases(layout) {
    var hostEl = hostElement("home_main");
    if (!hostEl || !hostEl.clientWidth) return;
    var row = layout.surfaces.filter(function (surface) {
      return surface.visible && surface.host === "home_main" && !surface.collapsed;
    });
    if (!row.length) return;
    /* keep in lockstep with --pm-home-gap */
    var gaps = 4 * Math.max(0, row.length - 1);
    var avail = Math.max(120 * row.length, hostEl.clientWidth - gaps);
    var sum = 0;
    row.forEach(function (surface) { sum += Math.max(80, Number(surface.size.basis_px) || 360); });
    if (!sum) return;
    row.forEach(function (surface) {
      var share = Math.max(80, Number(surface.size.basis_px) || 360) / sum;
      surface.size.basis_px = Math.round(avail * share);
      var el = surfaceRegistry[surface.surface_instance_id] && surfaceRegistry[surface.surface_instance_id].element;
      if (el) el.style.setProperty("flex", "1 1 " + surface.size.basis_px + "px", "important");
    });
  }

  function syncHostGeometry(layout) {
    function basis(host, fallback, max) {
      var surfaces = layout.surfaces.filter(function (surface) { return surface.visible && surface.host === host; });
      if (!surfaces.length) return "0px";
      /* A dock whose every visible surface is collapsed shrinks to the strip
         height instead of holding its full track open over empty space. */
      var live = surfaces.filter(function (surface) { return !surface.collapsed; });
      if (!live.length) return COLLAPSED_STRIP_PX + "px";
      /* Row docks (top/bottom) size their TRACK from cross_basis_px -- the
         per-surface basis_px is the surface's main-axis WIDTH there, owned by
         the pair-transfer dividers. Column docks keep basis_px as the track
         width. */
      var rowAxisTrack = host === "dock_top" || host === "dock_bottom";
      var raw = Math.max.apply(null, live.map(function (surface) {
        if (rowAxisTrack) return Number(surface.size.cross_basis_px) || Number(surface.size.basis_px) || fallback;
        return Number(surface.size.basis_px) || fallback;
      }));
      var band = HOST_BANDS[host];
      return Math.max(band.min, Math.min(raw, band.max)) + "px";
    }
    grid.style.setProperty("--pm-home-left-w", basis("dock_left", 300));
    grid.style.setProperty("--pm-home-right-w", basis("dock_right", 300));
    grid.style.setProperty("--pm-home-top-h", basis("dock_top", 210));
    grid.style.setProperty("--pm-home-bottom-h", basis("dock_bottom", 210));
    ["home_main", "dock_left", "dock_right", "dock_top", "dock_bottom"].forEach(function (host) {
      var el = hostElement(host);
      var has = layout.surfaces.some(function (surface) { return surface.visible && surface.host === host; });
      if (el) el.classList.toggle("pm-home-host-empty", !has);
    });
  }

  /* Projection-layer browser deactivation: clears BOTH the runtime pointer
     AND the committed model flag. Clearing only the pointer left
     domain_ref.browser_active stale, and restoreOwnerRefs (which runs on
     EVERY commit) resurrected the browser into the panel on the next
     unrelated commit -- clicking Split Pane flipped the center editor back
     to the browser. No command, no revision bump: the cleared flag rides
     along with the next real commit (same precedent as
     normalizeMainRowBases). */
  function deactivateBrowserProjection(surfaceId) {
    browserOwner.target_editor_panel_id = null;
    var surface = surfaceById(committed, surfaceId);
    if (surface && surface.domain_ref) surface.domain_ref.browser_active = false;
    var content = document.getElementById("browserTabContent");
    if (content) content.style.display = "none";
  }

  function mountActiveBrowser() {
    var content = document.getElementById("browserTabContent");
    if (!content || !browserOwner.target_editor_panel_id) return;
    var targetRecord = surfaceRegistry[browserOwner.target_editor_panel_id];
    var target = targetRecord && targetRecord.element;
    if (!target) return;
    EDITOR_IDS.forEach(function (id) {
      var record = surfaceRegistry[id];
      var element = record && record.element;
      if (!element) return;
      var tab = element.querySelector('[data-pm-home-browser-tab="' + id + '"]');
      if (tab) tab.classList.toggle("active", id === browserOwner.target_editor_panel_id);
      if (id === browserOwner.target_editor_panel_id) {
        /* single-active invariant: the base strip manager
           (switchEditorPane2Tab) is bypassed on this path, so without this
           sweep the previously active FILE tab kept its highlight while the
           content flipped to the browser -- a dual-active strip. And a
           browser tab the overflow fitter had collapsed while inactive must
           be revealed, or the highlight lands on a hidden element. */
        element.querySelectorAll(".editor-tabs .tab.active").forEach(function (other) {
          if (other !== tab) other.classList.remove("active");
        });
        if (tab && tab.style.display === "none") tab.style.display = "";
      }
      element.querySelectorAll(".editor-area").forEach(function (area) { area.style.display = id === browserOwner.target_editor_panel_id ? "none" : "flex"; });
    });
    if (content.parentNode !== target) target.appendChild(content);
    content.style.display = "flex";
    content.setAttribute("data-pm-home-browser-session-id", browserOwner.browser_session_id);
    content.setAttribute("data-pm-home-browser-target-panel", browserOwner.target_editor_panel_id);
    syncAutomationTabVisibility();
  }

  function eligibleBottomTerminal(layout) {
    return layout.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section" && surface.host === "dock_bottom" && surface.visible; }).sort(function (a, b) {
      var aOwner = terminalSections[a.surface_instance_id];
      var bOwner = terminalSections[b.surface_instance_id];
      return Number(Boolean(bOwner && bOwner.terminal_workgroup_id)) - Number(Boolean(aOwner && aOwner.terminal_workgroup_id)) || b.last_focus_seq - a.last_focus_seq || a.slot_index - b.slot_index;
    })[0];
  }

  function updateMenuAvailability(layout) {
    var terminal = eligibleBottomTerminal(layout);
    var collapse = document.querySelector('#pm-home-more-menu [data-pm-home-action="collapse-terminal"]');
    if (collapse) {
      /* The AUTHORED HOME_MARKUP label must stay exactly "Collapse Bottom
         Terminal" -- a T20 build gate asserts that byte string in the menu
         markup. The toggle relabel below is RUNTIME-only, applied to the live
         DOM after the menu is in the document. */
      var disabled = !terminal;
      var disabledReason = disabled ? "No terminal is docked at the bottom" : "";
      var collapseLabel = terminal && terminal.collapsed ? "Expand Bottom Terminal" : "Collapse Bottom Terminal";
      collapse.disabled = disabled;
      collapse.setAttribute("aria-disabled", String(disabled));
      collapse.setAttribute("data-disabled-reason", disabledReason);
      var collapseSpan = collapse.querySelector("span");
      if (collapseSpan) collapseSpan.textContent = collapseLabel;
      collapse.setAttribute("aria-description", disabledReason || collapseLabel);
      collapse.title = disabledReason || collapseLabel;
      collapse.setAttribute("data-pm-home-surface-id", terminal ? terminal.surface_instance_id : "");
    }
  }

  function renderLayout(layout) {
    /* A placeholder can only exist inside a live move gesture. One stranded by
       an interrupted drag is an unclaimable void in the row (it has no handle
       and no chrome), so every render outside a gesture sweeps it. */
    if (!gesture) {
      var strayPlaceholder = document.getElementById("pm-home-drop-placeholder");
      if (strayPlaceholder && strayPlaceholder.parentNode) strayPlaceholder.parentNode.removeChild(strayPlaceholder);
    }
    buildSurfaceRegistry(layout);
    layout.surfaces.slice().sort(function (a, b) {
      return HOSTS.indexOf(a.host) - HOSTS.indexOf(b.host) || a.slot_index - b.slot_index;
    }).forEach(function (surface) { applySurface(surface, surfaceRegistry[surface.surface_instance_id].element); });
    normalizeMainRowBases(layout);
    syncHostGeometry(layout);
    mountActiveBrowser();
    updateMenuAvailability(layout);
    if (window.PM_EDGE && typeof window.PM_EDGE.enroll === "function") {
      root.querySelectorAll(".pm-home-scrollport, .pm-home-terminal-body").forEach(function (scrollport) {
        scrollport.classList.add("pm6-bottom-scroll");
        window.PM_EDGE.enroll(scrollport);
      });
      window.PM_EDGE.refresh();
    }
    watchSurfaceChrome();
  }

  function focusSurface(surfaceId) {
    var surface = surfaceById(committed, surfaceId);
    var record = surfaceRegistry[surfaceId];
    var element = record && record.element;
    if (!surface || !element) return;
    if (surface.host === "floating") element.style.setProperty("--pm-home-float-z", String(surface.last_focus_seq));
    var focusTarget = element.querySelector(".editor-code, button, [tabindex]") || element;
    try { focusTarget.focus({ preventScroll: true }); } catch (error) { try { focusTarget.focus(); } catch (ignored) {} }
  }

  function focusSurfaceModel(layout, surfaceId) {
    var surface = surfaceById(layout, surfaceId);
    if (!surface) return;
    surface.last_focus_seq = ++focusSeq;
  }

  function restoreFocusSequence(layout) {
    focusSeq = Math.max(20, Math.max.apply(null, (layout && layout.surfaces || []).map(function (surface) { return Number(surface.last_focus_seq) || 0; })));
  }

  function noChangeCommand(commandId, payload, reason) {
    var record = command(commandId, payload);
    receipt(commandId, "no_change", { reason: reason }, record);
    return { ok: true, no_change: true, command: record };
  }

  function openPanel(surfaceId) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "not_editor_panel" };
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (current.visible) {
      var focused = clone(committed);
      focusSurfaceModel(focused, surfaceId);
      var noChange = commitLayout(focused, "focus", "cmd.editor.open_panel", { affected_surface_instance_ids: [surfaceId], source_host: current.host, target_host: current.host, target_slot_index: current.slot_index, command_payload: { editor_panel_id: surfaceId, target_host: current.host, target_slot_index: current.slot_index, already_open: true } });
      focusSurface(surfaceId);
      return noChange;
    }
    var next = clone(committed);
    var surface = surfaceById(next, surfaceId);
    surface.visible = true;
    surface.host = surface.last_docked_host || "home_main";
    surface.slot_index = surface.last_docked_slot_index || 0;
    focusSurfaceModel(next, surfaceId);
    normalizeSlots(next);
    var result = commitLayout(next, "open", "cmd.editor.open_panel", { affected_surface_instance_ids: [surfaceId], source_host: null, target_host: surface.host, target_slot_index: surface.slot_index, command_payload: { editor_panel_id: surfaceId, target_host: surface.host, target_slot_index: surface.slot_index } });
    if (result.ok) focusSurface(surfaceId);
    return result;
  }

  function closePanel(surfaceId) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "not_editor_panel" };
    var next = clone(committed);
    var surface = surfaceById(next, surfaceId);
    if (!surface) return { ok: false, reason: "unknown_surface" };
    if (!surface.visible) return noChangeCommand("cmd.editor.close_panel", { editor_panel_id: surfaceId }, "already_closed");
    surface.visible = false;
    var closedActiveBrowser = browserOwner.target_editor_panel_id === surfaceId;
    if (closedActiveBrowser) {
      surface.domain_ref.browser_active = false;
    }
    var result = commitLayout(next, "close", "cmd.editor.close_panel", { affected_surface_instance_ids: [surfaceId], source_host: surface.host, target_host: null, command_payload: { editor_panel_id: surfaceId, close_reason: "user" } });
    if (result.ok && closedActiveBrowser) {
      browserOwner.target_editor_panel_id = null;
      var browserContent = document.getElementById("browserTabContent");
      if (browserContent) browserContent.style.display = "none";
    }
    return result;
  }

  function placementFor(layout, surfaceId, host, insertion) {
    var surface = surfaceById(layout, surfaceId);
    if (!surface) return null;
    var candidates = layout.surfaces.filter(function (other) { return other.surface_instance_id !== surfaceId && other.visible && other.host === host; }).sort(function (a, b) { return a.slot_index - b.slot_index; });
    var index = insertion && isFinite(insertion.index) ? Math.max(0, Math.min(insertion.index, candidates.length)) : candidates.length;
    surface.host = host;
    surface.visible = true;
    surface.slot_index = index;
    candidates.splice(index, 0, surface);
    candidates.forEach(function (candidate, slot) {
      candidate.slot_index = slot;
      candidate.split_path = "root/" + slot;
      if (host !== "floating") {
        candidate.last_docked_host = host;
        candidate.last_docked_slot_index = slot;
      }
    });
    if (host === "floating" && !surface.floating_bounds) surface.floating_bounds = tiledFloatBounds(layout, surfaceId, { width: Math.max(300, surface.size.basis_px), height: 300 });
    return surface;
  }

  function moveSurface(surfaceId, host, insertion) {
    if (!hostIsValid(host)) return { ok: false, reason: "invalid_host" };
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    var next = clone(committed);
    var moved = placementFor(next, surfaceId, host, insertion || null);
    focusSurfaceModel(next, surfaceId);
    if (host === "floating" && insertion && insertion.bounds) moved.floating_bounds = clampBounds(insertion.bounds);
    var targetSurfaceId = insertion && insertion.target_surface_instance_id || null;
    var edge = insertion && insertion.insertion_edge || null;
    if (JSON.stringify(current) === JSON.stringify(moved)) return noChangeCommand(host === "floating" ? "cmd.panel.undock" : "cmd.workspace_layout.move_surface", { surface_instance_id: surfaceId, source_host: current.host, target_host: host, target_slot_index: moved.slot_index, target_surface_instance_id: targetSurfaceId, insertion_edge: edge }, "already_placed");
    var affected = changedSurfaceIds(committed, normalizeLayout(next, null));
    var commandId = host === "floating" ? "cmd.panel.undock" : (current.host === "floating" ? "cmd.panel.redock" : "cmd.workspace_layout.move_surface");
    return commitLayout(next, host === "floating" ? "undock" : (current.host === "floating" ? "redock" : "move"), commandId, {
      affected_surface_instance_ids: affected, source_host: current.host, target_host: host, target_slot_index: moved.slot_index, target_surface_instance_id: targetSurfaceId, insertion_edge: edge,
      command_payload: { surface_instance_id: surfaceId, source_host: current.host, target_host: host, target_slot_index: moved.slot_index, target_surface_instance_id: targetSurfaceId, insertion_edge: edge }
    });
  }

  function popOutPanel(surfaceId) {
    var userActivation = !navigator.userActivation || navigator.userActivation.isActive === true;
    var popupAttempted = window.PM_HOME_ENABLE_OPTIONAL_POPUPS === true && userActivation;
    var popupBlocked = false;
    if (popupAttempted) {
      var probe = null;
      try { probe = window.open("about:blank", "pm-home-panel-probe", "popup=yes,width=480,height=360"); } catch (error) { probe = null; }
      popupBlocked = !probe;
      if (probe) {
        try { probe.close(); } catch (ignored) {}
      }
    }
    var result = moveSurface(surfaceId, "floating");
    /* corner-origin sprout on the freshly floated surface (transient class so
       later re-renders do not replay it) */
    var floatedEl = surfaceRegistry[surfaceId] && surfaceRegistry[surfaceId].element;
    if (floatedEl && result && result.ok !== false) {
      floatedEl.classList.add("pm-home-float-enter");
      setTimeout(function () { floatedEl.classList.remove("pm-home-float-enter"); }, 360);
    }
    var disposition = popupAttempted && popupBlocked ? "popup_blocked_in_canvas_fallback" : (popupAttempted ? "popup_capable_in_canvas_prototype" : (userActivation ? "in_canvas_float" : "direct_user_activation_required_in_canvas_fallback"));
    if (root) root.setAttribute("data-pm-home-popup-disposition", disposition);
    if (result) result.web_popup = { attempted: popupAttempted, blocked: popupBlocked, direct_user_activation: userActivation, disposition: disposition };
    return result;
  }

  function setSurfaceCollapsed(surfaceId, collapsed) {
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (collapsed === undefined) collapsed = true;
    collapsed = Boolean(collapsed);
    if (current.collapsed === collapsed) return noChangeCommand("cmd.workspace_layout.set_collapsed", { surface_instance_id: surfaceId, collapsed: collapsed }, collapsed ? "already_collapsed" : "already_expanded");
    var next = clone(committed);
    surfaceById(next, surfaceId).collapsed = collapsed;
    return commitLayout(next, collapsed ? "collapse" : "expand", "cmd.workspace_layout.set_collapsed", { affected_surface_instance_ids: [surfaceId], source_host: current.host, target_host: current.host, command_payload: { surface_instance_id: surfaceId, collapsed: collapsed } });
  }

  /* The top-bar menu row is a TOGGLE now: handleAction routes it through
     toggleBottomTerminalCollapsed, and updateMenuAvailability relabels the
     row "Expand Bottom Terminal" at runtime while the terminal is collapsed
     (the authored markup keeps the "Collapse Bottom Terminal" byte string a
     build gate asserts). collapseBottomTerminal stays as the one-way entry
     point for callers that must never expand. */
  function collapseBottomTerminal() {
    var terminal = eligibleBottomTerminal(committed);
    if (!terminal) return { ok: false, reason: "no_bottom_terminal" };
    if (terminal.collapsed) return { ok: false, reason: "already_collapsed" };
    return setSurfaceCollapsed(terminal.surface_instance_id, true);
  }

  function toggleBottomTerminalCollapsed() {
    var terminal = eligibleBottomTerminal(committed);
    if (!terminal) return { ok: false, reason: "no_bottom_terminal" };
    return setSurfaceCollapsed(terminal.surface_instance_id, !terminal.collapsed);
  }

  /* Projects the model's collapse state onto the PM6 bottom-panel contract:
     `.bottom-panel.collapsed` hides `.bottom-tabs-content`, and the chevron
     flips + reports the POST-commit state. */
  var COLLAPSE_CHEVRON_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

  function syncCollapseControl(surface, element) {
    if (!element) return;
    var collapsed = Boolean(surface && surface.collapsed);
    if (element.id === "bottomPanel") element.classList.toggle("collapsed", collapsed);
    var button = element.querySelector("#collapseBottom, [data-pm-home-collapse-toggle]");
    if (!button) return;
    if (!button.getAttribute("data-pm-home-collapse-toggle")) {
      button.setAttribute("data-pm-home-collapse-toggle", surface.surface_instance_id);
      button.innerHTML = COLLAPSE_CHEVRON_SVG;
      button.classList.add("pm-home-collapse-toggle");
    }
    button.setAttribute("aria-expanded", collapsed ? "false" : "true");
    button.setAttribute("aria-label", collapsed ? "Expand the bottom panel" : "Collapse the bottom panel");
    button.title = collapsed ? "Expand the bottom panel" : "Collapse the bottom panel";
    button.setAttribute("data-pm-home-collapsed", String(collapsed));
  }

  function setSurfaceVisible(surfaceId, visible, commandId) {
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (current.visible === Boolean(visible)) {
      focusSurface(surfaceId);
      return noChangeCommand(commandId, { surface_instance_id: surfaceId, visible: Boolean(visible) }, visible ? "already_open" : "already_closed");
    }
    var next = clone(committed);
    var surface = surfaceById(next, surfaceId);
    surface.visible = Boolean(visible);
    if (visible) {
      surface.host = surface.last_docked_host || "home_main";
      surface.slot_index = surface.last_docked_slot_index || 0;
      focusSurfaceModel(next, surfaceId);
    }
    normalizeSlots(next);
    var result = commitLayout(next, visible ? "open" : "close", commandId, {
      affected_surface_instance_ids: [surfaceId], source_host: current.host, target_host: visible ? surface.host : null, target_slot_index: visible ? surface.slot_index : null,
      command_payload: { panel_id: surfaceId, surface_instance_id: surfaceId, visible: Boolean(visible) }
    });
    if (result.ok && visible) focusSurface(surfaceId);
    return result;
  }

  function resetLayout() {
    var next = defaultLayout();
    next.layout_revision = committed.layout_revision;
    EDITOR_IDS.forEach(function (id) {
      var old = surfaceById(committed, id);
      var fresh = surfaceById(next, id);
      if (old && fresh) fresh.domain_ref = clone(old.domain_ref);
    });
    /* Carry the LIVE workgroup into the reset section 1, not blindly the
       first terminal surface: after a workgroup move the first section's ref
       is blanked, and cloning that blank left reset with no terminal. */
    var terminalCarriers = committed.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; });
    var liveCarrier = terminalCarriers.filter(function (surface) {
      return surface.domain_ref && surface.domain_ref.terminal_workgroup_id;
    })[0] || terminalCarriers[0];
    if (liveCarrier) {
      var carrierRef = clone(liveCarrier.domain_ref);
      carrierRef.terminal_section_id = "terminal_section_1";
      surfaceById(next, "terminal_section:terminal_section_1").domain_ref = carrierRef;
    }
    return commitLayout(next, "reset", "cmd.workspace_layout.reset", { affected_surface_instance_ids: next.surfaces.map(function (surface) { return surface.surface_instance_id; }), command_payload: {} });
  }

  /* Top-bar "Reset Layout": reset + persist the default layout through the
     normal command path, defensively close the legacy floating chat, then
     reload. PM_DEMO keeps no persistent state and exposes no reset API (its
     state root is closure-private and its beat timers cannot be re-armed
     without double-scheduling), so a reload is the only HONEST demo reset --
     the freshly persisted default layout is exactly what boot then loads. */
  function resetWorkspaceAndDemo() {
    var result = resetLayout();
    var floatingChat = document.getElementById("floatingChat");
    if (floatingChat) floatingChat.style.display = "none";
    document.body.classList.add("pm-home-resetting");
    setTimeout(function () { try { window.location.reload(); } catch (error) {} }, 180);
    return result;
  }

  /* Chat pop-out for the retired base overlay path: the base applyLayout guard
     (installed by the T20 build transform) routes its overlay/detached modes
     here, so the chat floats INSIDE the workspace like every other surface
     instead of covering it with a fixed scrim window. */
  function popOutChat() {
    var surface = surfaceById(committed, "chat");
    if (!surface) return null;
    if (!surface.visible) setSurfaceVisible("chat", true);
    return popOutPanel("chat");
  }

  /* Boot demotion: floating is a within-session state, never a boot state. A
     surface persisted as floating reopens in its last dock (bounds preserved
     so an explicit re-float restores its spot). This, plus drag-to-float
     removal, is what ends "opens popped out by default". */
  function demoteFloatingAtBoot(layout) {
    var demoted = [];
    (layout.surfaces || []).forEach(function (surface) {
      if (surface.host !== "floating") return;
      surface.host = surface.last_docked_host || "home_main";
      surface.slot_index = typeof surface.last_docked_slot_index === "number" ? surface.last_docked_slot_index : 0;
      demoted.push(surface.surface_instance_id);
    });
    if (demoted.length) {
      var normalized = normalizeLayout(layout, null);
      writeAndVerify(normalized);
      receipt("storage.boot_demote_floating", "applied", { demoted_surface_instance_ids: demoted, layout_revision: normalized.layout_revision }, null);
      return normalized;
    }
    return layout;
  }

  function emitBrowserEvents(commandRecord, created) {
    if (created) emit("browser.session.created", { command_id: commandRecord.command_id, origin: "home_workspace", correlation_id: commandRecord.correlation_id, browser_session_id: browserOwner.browser_session_id, session_class: browserOwner.session_class, project_id: PROJECT_ID });
    emit("browser.session.state_changed", { command_id: commandRecord.command_id, origin: "home_workspace", correlation_id: commandRecord.correlation_id, browser_session_id: browserOwner.browser_session_id, session_class: browserOwner.session_class, state: "active", target_editor_panel_id: browserOwner.target_editor_panel_id, target_editor_group_id: editorOwners[browserOwner.target_editor_panel_id].editor_group_id });
  }

  function openBrowser(surfaceId) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "not_editor_panel" };
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    var next = clone(committed);
    var target = surfaceById(next, surfaceId);
    var affected = [];
    next.surfaces.forEach(function (surface) {
      if (surface.surface_kind !== "editor_panel") return;
      var wasActive = Boolean(surface.domain_ref && surface.domain_ref.browser_active);
      surface.domain_ref = surface.domain_ref || {};
      surface.domain_ref.browser_active = surface.surface_instance_id === surfaceId;
      if (wasActive !== surface.domain_ref.browser_active) affected.push(surface.surface_instance_id);
    });
    target.domain_ref.browser_session_id = browserOwner.browser_session_id;
    focusSurfaceModel(next, surfaceId);
    if (!target.visible) {
      target.visible = true;
      target.host = target.last_docked_host || "home_main";
      target.slot_index = target.last_docked_slot_index || 0;
      affected.push(surfaceId);
    }
    normalizeSlots(next);
    var wasCreated = !browserOwner.created_event_emitted;
    var result;
    if (affected.length || browserOwner.target_editor_panel_id !== surfaceId) {
      result = commitLayout(next, "open_browser", "cmd.browser.open_workspace_preview", {
        affected_surface_instance_ids: affected.length ? Array.from(new Set(affected)) : [surfaceId], source_host: current.host, target_host: target.host, target_slot_index: target.slot_index,
        command_payload: { target: { kind: "editor_panel", editor_panel_id: surfaceId, editor_group_id: editorOwners[surfaceId].editor_group_id }, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id }
      });
    } else {
      result = noChangeCommand("cmd.browser.open_workspace_preview", { target: { kind: "editor_panel", editor_panel_id: surfaceId, editor_group_id: editorOwners[surfaceId].editor_group_id }, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id }, "browser_already_active");
    }
    if (!result.ok) return result;
    browserOwner.target_panels[surfaceId] = browserOwner.browser_session_id;
    browserOwner.target_editor_panel_id = surfaceId;
    browserOwner.created_event_emitted = true;
    mountActiveBrowser();
    emitBrowserEvents(result.command, wasCreated);
    receipt("cmd.browser.open_workspace_preview", "projected", { browser_session_id: browserOwner.browser_session_id, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id }, result.command);
    focusSurface(surfaceId);
    return { ok: true, command: result.command, browser_session_id: browserOwner.browser_session_id, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id };
  }

  /* Actually open the file. Panel 1 routes through the canonical PM_DEMO open
     path so the tab is added to the open-tab model and the strip re-renders;
     every panel then renders the buffer with PM6_RENDER_FILE against its own
     <prefix>Gutter/<prefix>Code/<prefix>Minimap ids. The previous code called
     switchEditorPane*Tab (which only activates an ALREADY-open tab) for panels
     1-2 and wrote a debug string into .editor-code for panels 3-4, so nothing
     opened anywhere. */
  function ensurePanelTab(element, path, surfaceId) {
    if (!element) return;
    var strip = element.querySelector(".editor-tabs");
    if (!strip) return;
    var tabs = strip.querySelectorAll(".tab");
    var existing = null;
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.classList.remove("active");
      if (tab.getAttribute("data-file") === path) existing = tab;
    });
    if (!existing) {
      existing = document.createElement("span");
      existing.className = "tab";
      existing.setAttribute("role", "tab");
      existing.setAttribute("tabindex", "0");
      existing.setAttribute("data-file", path);
      existing.textContent = String(path).split("/").pop();
      /* Insert at the buffer's model position (buffer_ids order), not always
         at the end: a shell rebuild replays the persisted drag order this
         way. Falls back to before the overflow chevron (or the actions
         cluster when no chevron exists) for unknown buffers. */
      var before = strip.querySelector(".pm-ed-overflow") || strip.querySelector(".pane-tabbar-actions");
      var owner = surfaceId ? editorOwners[surfaceId] : null;
      var bufferId = owner ? buffersByPath[path] : null;
      var want = owner && bufferId ? owner.buffer_ids.indexOf(bufferId) : -1;
      if (want !== -1) {
        var fileTabs = strip.querySelectorAll(".tab[data-file]");
        for (var fi = 0; fi < fileTabs.length; fi++) {
          var otherId = buffersByPath[fileTabs[fi].getAttribute("data-file")];
          var otherIdx = otherId ? owner.buffer_ids.indexOf(otherId) : -1;
          if (otherIdx !== -1 && otherIdx > want) { before = fileTabs[fi]; break; }
        }
      }
      strip.insertBefore(existing, before);
    }
    existing.classList.add("active");
    if (typeof window.PM6_FIT_EDITOR_TABS === "function") {
      try { window.PM6_FIT_EDITOR_TABS(strip); } catch (error) {}
    }
  }

  /* Mirror a drag-reordered strip back into the per-panel buffer model. The
     base dispatches pm6:ed-tab-order with the pane element id and the tab
     keys (data-file paths, or label text for non-buffer tabs, which we skip).
     Pane 1's order lives in the base's own S.files model, not here. */
  document.addEventListener("pm6:ed-tab-order", function (event) {
    var detail = event && event.detail;
    if (!detail || !detail.pane_id || !detail.order) return;
    var surfaceId = null;
    if (detail.pane_id === "editorPane2") surfaceId = "editor_panel_2";
    else {
      var match = /^pmHomeEditor_(editor_panel_\d)$/.exec(detail.pane_id);
      if (match) surfaceId = match[1];
    }
    var owner = surfaceId && editorOwners[surfaceId];
    if (!owner) return;
    var ordered = [];
    detail.order.forEach(function (key) {
      var bufferId = buffersByPath[key];
      if (bufferId && owner.buffer_ids.indexOf(bufferId) !== -1 && ordered.indexOf(bufferId) === -1) {
        ordered.push(bufferId);
      }
    });
    owner.buffer_ids.forEach(function (bufferId) {
      if (ordered.indexOf(bufferId) === -1) ordered.push(bufferId);
    });
    owner.buffer_ids = ordered;
  });

  function renderFileIntoPanel(surfaceId, path) {
    var element = surfaceRegistry[surfaceId] && surfaceRegistry[surfaceId].element;
    var prefix = editorPrefixFor(surfaceId);
    if (surfaceId === "editor_panel_1" && window.PM_DEMO && window.PM_DEMO.files && typeof window.PM_DEMO.files.open === "function") {
      try { window.PM_DEMO.files.open(path); return; } catch (error) {}
    }
    ensurePanelTab(element, path, surfaceId);
    if (surfaceId === "editor_panel_2") {
      /* opening a file into pane 2 deactivates the browser THROUGH THE MODEL
         when pane 2 owns it -- a DOM-only hide left browser_active stale and
         the next commit re-mounted the browser (same bug class as the
         code-tab click path) */
      if (browserOwner.target_editor_panel_id === "editor_panel_2") {
        deactivateBrowserProjection("editor_panel_2");
      } else {
        var browserContent = document.getElementById("browserTabContent");
        var pane2Record = surfaceRegistry.editor_panel_2;
        if (browserContent && pane2Record && pane2Record.element && pane2Record.element.contains(browserContent)) {
          browserContent.style.display = "none";
        }
      }
      var codeArea = document.getElementById("editorPane2CodeArea");
      if (codeArea) codeArea.style.display = "";
    }
    if (prefix && typeof window.PM6_RENDER_FILE === "function") {
      try { window.PM6_RENDER_FILE(path, prefix); } catch (error) {}
    }
  }

  function openFileInPanel(surfaceId, path) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "unknown_editor_panel" };
    path = path || "src/main.rs";
    var owner = editorOwners[surfaceId];
    var hadBufferIdentity = Object.prototype.hasOwnProperty.call(buffersByPath, path);
    var bufferId = buffersByPath[path] || (buffersByPath[path] = "buffer:" + path);
    var nextBufferIds = owner.buffer_ids.slice();
    if (nextBufferIds.indexOf(bufferId) === -1) nextBufferIds.push(bufferId);
    var next = clone(committed);
    var target = surfaceById(next, surfaceId);
    focusSurfaceModel(next, surfaceId);
    var layoutChanged = false;
    if (!target.visible) {
      target.visible = true;
      target.host = target.last_docked_host || "home_main";
      target.slot_index = target.last_docked_slot_index || 0;
      layoutChanged = true;
    }
    var payload = { path: path, target_editor_panel_id: surfaceId, target_editor_group_id: owner.editor_group_id, target_group: owner.editor_group_id };
    var result;
    result = commitLayout(next, layoutChanged ? "open_file_target" : "focus_file_target", "cmd.file.open", { affected_surface_instance_ids: [surfaceId], source_host: layoutChanged ? null : target.host, target_host: target.host, target_slot_index: target.slot_index, command_payload: payload });
    if (!result.ok) {
      if (!hadBufferIdentity) delete buffersByPath[path];
      return result;
    }
    owner.buffer_ids = nextBufferIds;
    owner.active_buffer_id = bufferId;
    renderFileIntoPanel(surfaceId, path);
    window.PM_HOME_LAST_OPEN_FILE = Object.assign({ buffer_id: bufferId }, payload);
    focusSurface(surfaceId);
    return Object.assign({ ok: true, buffer_id: bufferId }, payload);
  }

  function fileManagerTargetPath() {
    var remembered = window.PM_HOME_FILE_TARGET;
    if (remembered && remembered.getAttribute && remembered.getAttribute("data-path")) return remembered.getAttribute("data-path");
    var active = document.querySelector("#panel-files .fm-row.active-file[data-path], #panel-files .fm-row[data-path], #panel-files .fm-openrow[data-path]");
    return active ? active.getAttribute("data-path") : null;
  }

  function installFileManagerOpenTargets() {
    var panel = document.getElementById("panel-files");
    var contextMenu = document.getElementById("fileContextMenu");
    if (!panel || !contextMenu || contextMenu.getAttribute("data-pm-home-file-targets") === "true") return;
    if (contextMenu.parentNode !== document.body) document.body.appendChild(contextMenu);
    contextMenu.style.setProperty("z-index", "10070", "important");
    contextMenu.setAttribute("data-pm-home-body-portal", "true");
    contextMenu.setAttribute("data-pm-home-file-targets", "true");
    var item = document.createElement("button");
    item.type = "button";
    item.className = "fm-ctx-item";
    item.setAttribute("role", "menuitem");
    item.setAttribute("aria-haspopup", "menu");
    item.setAttribute("aria-expanded", "false");
    item.setAttribute("aria-controls", "pm-home-file-panel-menu");
    item.setAttribute("data-pm-home-file-submenu", "true");
    item.innerHTML = '<span class="fm-ctx-label">Open in Panel</span><span class="fm-ctx-key">&#8250;</span>';
    var firstSeparator = contextMenu.querySelector(".fm-ctx-sep");
    contextMenu.insertBefore(item, firstSeparator || contextMenu.firstChild);
    function remember(event) {
      var row = event.target && event.target.closest ? event.target.closest(".fm-row[data-path], .fm-openrow[data-path]") : null;
      if (row) window.PM_HOME_FILE_TARGET = row;
    }
    panel.addEventListener("contextmenu", remember, true);
    panel.addEventListener("click", remember, true);
    panel.addEventListener("keydown", remember, true);
    item.addEventListener("mouseenter", function () { openFlyout(document.getElementById("pm-home-file-panel-menu"), item); });
    item.addEventListener("click", function (event) { event.preventDefault(); openFlyout(document.getElementById("pm-home-file-panel-menu"), item, true); });
    item.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") { event.preventDefault(); openFlyout(document.getElementById("pm-home-file-panel-menu"), item, true); }
    });
  }

  function terminalSurfaceCount() { return committed.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; }).length; }
  function totalTerminalPanes() { return Object.keys(terminalSections).reduce(function (sum, id) { return sum + (terminalSections[id].pane_ids || []).length; }, 0); }
  function firstEmptyTerminalSection(excludeId) {
    var found = null;
    committed.surfaces.some(function (surface) {
      var section = terminalSections[surface.surface_instance_id];
      if (surface.surface_kind === "terminal_section" && surface.surface_instance_id !== excludeId && section && !section.terminal_workgroup_id) { found = surface.surface_instance_id; return true; }
      return false;
    });
    return found;
  }

  function nextTerminalSectionId() {
    for (var i = 1; i <= 4; i += 1) {
      var id = "terminal_section:terminal_section_" + i;
      if (!surfaceById(committed, id)) return id;
    }
    return null;
  }

  function syncTerminalRef(layout, surfaceId, section) {
    var surface = surfaceById(layout, surfaceId);
    if (!surface) return;
    surface.domain_ref = surface.domain_ref || {};
    surface.domain_ref.terminal_section_id = section.terminal_section_id;
    surface.domain_ref.terminal_workgroup_id = section.terminal_workgroup_id;
    surface.domain_ref.pane_ids = csv(section.pane_ids);
    surface.domain_ref.terminal_session_ids = csv(section.terminal_session_ids);
  }

  function moveWorkgroupToHost(host, targetSectionId, forceCreate) {
    var sourceId = activeTerminalSectionId;
    var workgroup = terminalSections[sourceId];
    if (!workgroup || !workgroup.terminal_workgroup_id) return { ok: false, reason: "terminal_workgroup_missing" };
    var next = clone(committed);
    var sectionCreated = false;
    if (!targetSectionId && !forceCreate) targetSectionId = firstEmptyTerminalSection(sourceId);
    if (!targetSectionId) {
      targetSectionId = nextTerminalSectionId();
      if (!targetSectionId) return { ok: false, reason: "terminal_section_limit" };
      var targetHost = hostIsValid(host) ? host : "home_main";
      var targetSlot = next.surfaces.filter(function (surface) { return surface.visible && surface.host === targetHost; }).length;
      var newSurface = makeSurface(targetSectionId, "terminal_section", targetHost, targetSlot, true);
      next.surfaces.push(newSurface);
      sectionCreated = true;
      terminalSections[targetSectionId] = { terminal_section_id: targetSectionId.split(":")[1], terminal_workgroup_id: null, pane_ids: [], terminal_session_ids: [] };
    }
    var targetOwner = terminalSections[targetSectionId];
    if (!targetOwner || targetOwner.terminal_workgroup_id) return { ok: false, reason: "terminal_target_not_empty" };
    var sourceSnapshot = clone(workgroup);
    terminalSections[targetSectionId] = clone(sourceSnapshot);
    terminalSections[targetSectionId].terminal_section_id = targetSectionId.split(":")[1];
    terminalSections[sourceId] = { terminal_section_id: sourceId.split(":")[1], terminal_workgroup_id: null, pane_ids: [], terminal_session_ids: [] };
    /* Move-and-reseed: "New Section" (forceCreate) should not strand an empty
       source. While the pane budget allows, seed the vacated source with a
       fresh one-pane workgroup IN THE SAME COMMIT, allocating ids with the
       same numbering scan splitTerminalPane uses. At the pane cap the source
       stays empty (today's behavior). */
    var sourceReseeded = false;
    var seededWorkgroup = null;
    if (forceCreate === true && totalTerminalPanes() < 4) {
      var seedPanes = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].pane_ids || []); }, []);
      var seedSessions = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].terminal_session_ids || []); }, []);
      var seedWorkgroups = Object.keys(terminalSections).map(function (id) { return terminalSections[id].terminal_workgroup_id; });
      var seedNumber = 1;
      while (seedPanes.indexOf("tp-" + seedNumber) !== -1 || seedSessions.indexOf("ts-sess-" + seedNumber) !== -1 || seedWorkgroups.indexOf("terminal_workgroup_" + seedNumber) !== -1) seedNumber += 1;
      seededWorkgroup = {
        terminal_section_id: sourceId.split(":")[1],
        terminal_workgroup_id: "terminal_workgroup_" + seedNumber,
        pane_ids: ["tp-" + seedNumber],
        terminal_session_ids: ["ts-sess-" + seedNumber]
      };
      terminalSections[sourceId] = seededWorkgroup;
      sourceReseeded = true;
    }
    var targetSurface = surfaceById(next, targetSectionId);
    targetSurface.host = hostIsValid(host) ? host : targetSurface.host;
    targetSurface.visible = true;
    targetSurface.last_focus_seq = ++focusSeq;
    syncTerminalRef(next, sourceId, terminalSections[sourceId]);
    syncTerminalRef(next, targetSectionId, terminalSections[targetSectionId]);
    normalizeSlots(next);
    var workgroupAffected = changedSurfaceIds(committed, normalizeLayout(next, null));
    var result = commitLayout(next, "move_workgroup", "cmd.terminal.move_workgroup", {
      affected_surface_instance_ids: workgroupAffected, source_host: surfaceById(committed, sourceId).host, target_host: targetSurface.host, target_slot_index: targetSurface.slot_index,
      command_payload: { terminal_workgroup_id: sourceSnapshot.terminal_workgroup_id, source_terminal_section_id: sourceId.split(":")[1], target_terminal_section_id: targetSectionId.split(":")[1], create_target_section: sectionCreated, target_workspace_host: targetSurface.host, target_slot_index: targetSurface.slot_index, preserve_session_identity: true, source_reseeded: sourceReseeded }
    });
    if (!result.ok) {
      /* rollback restores BOTH sections' prior refs: the source snapshot
         also discards any reseeded workgroup written above */
      terminalSections[sourceId] = sourceSnapshot;
      if (targetOwner) terminalSections[targetSectionId] = targetOwner;
      else delete terminalSections[targetSectionId];
      return result;
    }
    if (sourceReseeded && seededWorkgroup) {
      receipt("cmd.terminal.move_workgroup", "projected", {
        source_reseeded: true,
        source_terminal_section_id: sourceId.split(":")[1],
        seeded_terminal_workgroup_id: seededWorkgroup.terminal_workgroup_id,
        seeded_pane_ids: seededWorkgroup.pane_ids.slice(),
        seeded_session_ids: seededWorkgroup.terminal_session_ids.slice()
      }, result.command);
    }
    activeTerminalSectionId = targetSectionId;
    emit("terminal.workgroup_moved", {
      schema_id: "pm.event.terminal_workgroup_moved.v1", schema_version: "1.0.0", project_id: PROJECT_ID,
      command_id: result.command.command_id, origin: "home_workspace", correlation_id: result.command.correlation_id,
      terminal_workgroup_id: sourceSnapshot.terminal_workgroup_id,
      source_terminal_section_id: sourceId.split(":")[1], target_terminal_section_id: targetSectionId.split(":")[1],
      contained_pane_ids: sourceSnapshot.pane_ids.slice(), contained_session_ids: sourceSnapshot.terminal_session_ids.slice(), section_created: sectionCreated, preserve_session_identity: true
    });
    return result;
  }

  function splitTerminalPane(surfaceId) {
    var section = terminalSections[surfaceId];
    if (!section || !section.terminal_workgroup_id) return { ok: false, reason: "terminal_workgroup_missing" };
    if (totalTerminalPanes() >= 4) return { ok: false, reason: "terminal_pane_limit" };
    var allPanes = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].pane_ids || []); }, []);
    var allSessions = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].terminal_session_ids || []); }, []);
    var paneNumber = 1;
    while (allPanes.indexOf("tp-" + paneNumber) !== -1 || allSessions.indexOf("ts-sess-" + paneNumber) !== -1) paneNumber += 1;
    var paneId = "tp-" + paneNumber;
    var sessionId = "ts-sess-" + paneNumber;
    var next = clone(committed);
    section.pane_ids.push(paneId);
    section.terminal_session_ids.push(sessionId);
    syncTerminalRef(next, surfaceId, section);
    var result = commitLayout(next, "terminal_split", "cmd.terminal.split_pane", { affected_surface_instance_ids: [surfaceId], source_host: surfaceById(committed, surfaceId).host, target_host: surfaceById(committed, surfaceId).host, command_payload: { terminal_tab_id: section.terminal_workgroup_id, terminal_pane_id: paneId, terminal_session_id: sessionId, direction: "horizontal" } });
    if (!result.ok) { section.pane_ids.pop(); section.terminal_session_ids.pop(); return result; }
    receipt("cmd.terminal.split_pane", "applied", { terminal_pane_id: paneId, terminal_session_id: sessionId, visible_panes: totalTerminalPanes(), max_visible_panes: 4 }, result.command);
    return result;
  }

  function setTerminalPaneCount(count) {
    count = Number(count) || 1;
    if (count > 4) return { ok: false, reason: "terminal_pane_limit", visible_panes: totalTerminalPanes(), max_visible_panes: 4 };
    count = Math.max(1, count);
    var section = terminalSections[activeTerminalSectionId];
    if (!section || !section.terminal_workgroup_id) return { ok: false, reason: "terminal_workgroup_missing" };
    while (totalTerminalPanes() < count) {
      var result = splitTerminalPane(activeTerminalSectionId);
      if (!result.ok) return result;
    }
    return { ok: true, visible_panes: totalTerminalPanes(), max_visible_panes: 4 };
  }

  function wireTerminalLocalControls(surface, element) {
    element.querySelectorAll('[data-pm-home-action="split-terminal-pane"], [data-pm-home-action="move-workgroup-new-section"]').forEach(function (button) {
      button.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
    });
  }

  var portalClosures = typeof WeakMap === "function" ? new WeakMap() : null;

  function portalOpen(menu, anchor) {
    if (!menu) return;
    var pending = portalClosures && portalClosures.get(menu);
    if (pending) pending.cancel();
    if (window.PM6_SPROUT && typeof window.PM6_SPROUT.open === "function") window.PM6_SPROUT.open(menu, null, anchor);
    else { menu.style.display = "block"; requestAnimationFrame(function () { menu.classList.add("is-open"); }); }
  }

  function portalClose(menu, done) {
    if (!menu) { if (done) done(); return; }
    var previous = portalClosures && portalClosures.get(menu);
    if (previous) previous.cancel();
    var settled = false;
    var timer = null;
    function finish(event) {
      if (settled || (event && event.target !== menu)) return;
      if (event && event.propertyName && event.propertyName !== "opacity" && event.propertyName !== "transform") return;
      settled = true;
      if (timer) clearTimeout(timer);
      menu.removeEventListener("transitionend", finish);
      menu.classList.remove("is-closing");
      menu.style.display = "none";
      if (portalClosures) portalClosures.delete(menu);
      if (done) done();
    }
    function cancel() {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      menu.removeEventListener("transitionend", finish);
      menu.classList.remove("is-closing");
      if (portalClosures) portalClosures.delete(menu);
    }
    menu.classList.remove("is-open", "is-size-bounce");
    menu.classList.add("is-closing");
    menu.addEventListener("transitionend", finish);
    timer = setTimeout(finish, document.documentElement.getAttribute("data-motion") === "reduced" ? 0 : 280);
    if (portalClosures) portalClosures.set(menu, { cancel: cancel });
  }

  function positionMain(menu, anchor) {
    var rect = anchor.getBoundingClientRect();
    var width = menu.offsetWidth || 260;
    var height = menu.offsetHeight || 120;
    var left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    var top = rect.bottom + 6;
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.bottom = "auto";
  }

  function positionFlyout(menu, anchor) {
    var rect = anchor.getBoundingClientRect();
    var width = menu.offsetWidth || 148;
    var height = menu.offsetHeight || 150;
    var left = rect.right + 6;
    if (left + width > window.innerWidth - 8) left = rect.left - width - 6;
    menu.style.left = Math.max(8, left) + "px";
    menu.style.top = Math.max(8, Math.min(rect.top, window.innerHeight - height - 8)) + "px";
    menu.style.bottom = "auto";
  }

  function openMainMenu(menu, anchor) {
    closeAllMenus(false);
    menuState.main = menu;
    menuState.invoker = anchor;
    anchor.setAttribute("aria-expanded", "true");
    menu.style.display = "block";
    positionMain(menu, anchor);
    portalOpen(menu, anchor);
  }

  function openFlyout(menu, anchor, focusFirst) {
    if (!menu || !anchor || anchor.disabled) return;
    if (menuState.flyout && menuState.flyout !== menu) portalClose(menuState.flyout);
    document.querySelectorAll('[data-pm-home-submenu], [data-pm-home-file-submenu]').forEach(function (row) { row.setAttribute("aria-expanded", String(row === anchor)); });
    menuState.flyout = menu;
    menu.style.display = "block";
    positionFlyout(menu, anchor);
    portalOpen(menu, anchor);
    if (focusFirst) setTimeout(function () { focusMenuItem(menu, 0); }, 0);
  }

  function closeFlyout(returnFocus) {
    var flyout = menuState.flyout;
    if (!flyout) return;
    var owner = document.querySelector('[aria-controls="' + flyout.id + '"], [data-pm-home-submenu="' + flyout.id + '"]');
    menuState.flyout = null;
    portalClose(flyout);
    document.querySelectorAll('[data-pm-home-submenu], [data-pm-home-file-submenu]').forEach(function (row) { row.setAttribute("aria-expanded", "false"); });
    if (returnFocus && owner) owner.focus();
  }

  function closeAllMenus(restoreFocus) {
    if (menuState.hoverTimer) { clearTimeout(menuState.hoverTimer); menuState.hoverTimer = null; }
    closeFlyout(false);
    var main = menuState.main;
    var invoker = menuState.invoker;
    menuState.main = null;
    menuState.invoker = null;
    menuState.surfaceId = null;
    document.querySelectorAll("[data-pm-home-surface-options], #pm-home-more-btn").forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
    if (main) portalClose(main);
    if (restoreFocus && invoker && document.contains(invoker)) setTimeout(function () { try { invoker.focus({ preventScroll: true }); } catch (error) { invoker.focus(); } }, 0);
  }

  function enabledMenuItems(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]')).filter(function (item) { return !item.disabled && item.getAttribute("aria-disabled") !== "true"; });
  }

  function focusMenuItem(menu, index) {
    var items = enabledMenuItems(menu);
    if (!items.length) return;
    index = (index + items.length) % items.length;
    items[index].focus();
  }

  function menuKeydown(event) {
    var menu = event.currentTarget;
    var items = enabledMenuItems(menu);
    var index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown") { event.preventDefault(); focusMenuItem(menu, index + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); focusMenuItem(menu, index - 1); }
    else if (event.key === "Home") { event.preventDefault(); focusMenuItem(menu, 0); }
    else if (event.key === "End") { event.preventDefault(); focusMenuItem(menu, items.length - 1); }
    else if (event.key === "ArrowRight") {
      var target = event.target.closest("[data-pm-home-submenu]");
      if (target) { event.preventDefault(); openFlyout(document.getElementById(target.getAttribute("data-pm-home-submenu")), target, true); }
    } else if (event.key === "ArrowLeft" && menuState.flyout === menu) { event.preventDefault(); closeFlyout(true); }
    else if (event.key === "Escape") { event.preventDefault(); closeAllMenus(true); }
  }

  function surfaceMenuMarkup(surface) {
    var html = "";
    /* Movement is direct manipulation only (drag the top-right grip, or focus
       it and press Enter for the keyboard path); the menu carries ACTIONS, no
       placement copy. Separators are emitted only between groups that both
       exist, so no menu ever opens on, closes on, or doubles a separator. */
    function separator() {
      if (html) html += '<div class="pm-home-menu-separator" role="separator"></div>';
    }
    if (surface.surface_kind === "editor_panel") html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-browser" data-pm-home-surface-id="' + surface.surface_instance_id + '">Open Browser</button>';
    /* Pop Out is the ONLY route to floating (drag can no longer float), so
       every non-terminal surface offers it; a floating surface offers the
       reverse. Close stays editor-only. */
    var canFloat = surface.surface_kind === "editor_panel" || surface.surface_kind === "chat" || surface.surface_kind === "dashboard";
    if (canFloat && surface.host !== "floating") { separator(); html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="popout-panel" data-pm-home-surface-id="' + surface.surface_instance_id + '">Pop Out</button>'; }
    if (surface.host === "floating") { separator(); html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="redock-surface" data-pm-home-surface-id="' + surface.surface_instance_id + '">Dock Back</button>'; }
    if (surface.surface_kind === "editor_panel") html += '<button type="button" class="pm-home-menu-row pm-home-menu-danger" role="menuitem" data-pm-home-action="close-panel" data-pm-home-surface-id="' + surface.surface_instance_id + '">Close Panel</button>';
    if (surface.surface_kind === "terminal_section") {
      var section = terminalSections[surface.surface_instance_id];
      var splitDisabled = !section || !section.terminal_workgroup_id || totalTerminalPanes() >= 4;
      var sectionDisabled = !section || !section.terminal_workgroup_id || terminalSurfaceCount() >= 4;
      var splitReason = !section || !section.terminal_workgroup_id ? "Move a workgroup here first" : "Maximum four visible terminal panes";
      var sectionReason = !section || !section.terminal_workgroup_id ? "Move a workgroup here first" : "Maximum four terminal sections";
      separator();
      html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="split-terminal-pane" data-pm-home-surface-id="' + surface.surface_instance_id + '"' + (splitDisabled ? ' disabled aria-disabled="true" aria-description="' + splitReason + '" data-disabled-reason="' + splitReason + '" title="' + splitReason + '"' : '') + '>Split Pane</button><button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="move-workgroup-new-section" data-pm-home-surface-id="' + surface.surface_instance_id + '"' + (sectionDisabled ? ' disabled aria-disabled="true" aria-description="' + sectionReason + '" data-disabled-reason="' + sectionReason + '" title="' + sectionReason + '"' : '') + '>Move Workgroup to New Section</button>';
    }
    return html;
  }

  function openSurfaceMenu(anchor, surfaceId) {
    var surface = surfaceById(committed, surfaceId);
    var menu = document.getElementById("pm-home-surface-menu");
    if (!surface || !menu) return;
    menu.innerHTML = surfaceMenuMarkup(surface);
    menu.setAttribute("aria-label", "Options for " + surfaceId);
    menuState.surfaceId = surfaceId;
    openMainMenu(menu, anchor);
  }

  function scheduleFlyout(anchor) {
    if (menuState.hoverTimer) clearTimeout(menuState.hoverTimer);
    menuState.hoverTimer = setTimeout(function () {
      var menu = document.getElementById(anchor.getAttribute("data-pm-home-submenu"));
      openFlyout(menu, anchor, false);
    }, 140);
  }

  function handleAction(button) {
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
    var action = button.getAttribute("data-pm-home-action");
    var surfaceId = button.getAttribute("data-pm-home-surface-id");
    var result = null;
    if (action === "open-panel") result = openPanel(surfaceId);
    else if (action === "open-browser") result = openBrowser(surfaceId);
    else if (action === "collapse-terminal") result = toggleBottomTerminalCollapsed();
    else if (action === "close-panel") result = closePanel(surfaceId);
    else if (action === "popout-panel") result = popOutPanel(surfaceId);
    else if (action === "redock-surface") {
      var redockTarget = surfaceById(committed, surfaceId);
      result = moveSurface(surfaceId, (redockTarget && redockTarget.last_docked_host) || "home_main");
    }
    else if (action === "reset-layout") result = resetWorkspaceAndDemo();
    else if (action === "run-onboarding") {
      var onboarding = window.PM7_ONBOARDING_CINEMATIC;
      if (onboarding && typeof onboarding.replay === "function") result = onboarding.replay({ source_surface: "home_menu" });
      else { announce("Setup is not available yet."); result = false; }
    }
    else if (action === "file-open-panel") result = openFileInPanel(surfaceId, fileManagerTargetPath() || "src/main.rs");
    else if (action === "split-terminal-pane") result = splitTerminalPane(surfaceId);
    else if (action === "move-workgroup-new-section") { activeTerminalSectionId = surfaceId; result = moveWorkgroupToHost(surfaceById(committed, surfaceId).host, null, true); }
    if (action && action !== "open-surface-menu") closeAllMenus(true);
    return result;
  }

  /* ------------------------------------------------------------------ *
   * Direct-manipulation move.
   *
   * The held surface becomes a fixed clone tracking the pointer 1:1; the slot
   * it vacated becomes a real in-flow placeholder inside the target host, and
   * every other surface FLIPs to its new position on each slot change. There
   * is no target-picker rail: the drop host comes from hit-testing the live
   * layout, with an edge-zone fallback for docks that are currently empty.
   * ------------------------------------------------------------------ */

  function hostAxisIsVertical(host) { return host === "dock_left" || host === "dock_right"; }

  /* Layout-true midline for an element mid-FLIP: getBoundingClientRect
     includes the FLIP translate, so a reflow-in-progress used to flap the
     resolved index every frame (the "placeholder never follows the pointer"
     defect). Subtract the live transform's translation to measure where the
     element actually LIVES, not where it is currently painted. */
  function layoutRect(element) {
    var rect = element.getBoundingClientRect();
    var transform = window.getComputedStyle(element).transform;
    if (transform && transform !== "none") {
      var match = /matrix\(([^)]+)\)/.exec(transform);
      if (match) {
        var parts = match[1].split(",");
        var tx = parseFloat(parts[4]) || 0;
        var ty = parseFloat(parts[5]) || 0;
        return { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
      }
    }
    return rect;
  }

  function insertionAt(host, clientX, clientY, movingId) {
    var ids = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(gesture.draft, id);
      return id !== movingId && surface && surface.visible;
    });
    var vertical = hostAxisIsVertical(host);
    var index = ids.length;
    var targetId = null;
    var edge = null;
    for (var i = 0; i < ids.length; i += 1) {
      var record = surfaceRegistry[ids[i]];
      var rect = record && record.element && record.element.isConnected && layoutRect(record.element);
      if (!rect || (!rect.width && !rect.height)) continue;
      var midpoint = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
      var point = vertical ? clientY : clientX;
      if (point < midpoint) { index = i; targetId = ids[i]; edge = "before"; break; }
      if (i === ids.length - 1) { targetId = ids[i]; edge = "after"; }
    }
    return { index: index, target_surface_instance_id: targetId, insertion_edge: edge };
  }

  function hostFull(host, movingId) {
    var cap = HOST_CAPS[host];
    if (!cap || !committed) return false;
    var count = 0;
    (committed.surfaces || []).forEach(function (surface) {
      if (surface.host === host && surface.visible && surface.surface_instance_id !== movingId) count += 1;
    });
    return count >= cap;
  }

  /* Target priority, in order:
       1. a real surface under the pointer  -> that surface's host (precise
          positional insertion; this must beat the edge zones or the first slot
          of home_main is unreachable behind the left dock's hot edge)
       2. an edge zone                      -> that dock (the only way to reach
          a dock that is currently empty and therefore zero-sized)
       3. whatever host is under the pointer
       4. home_main
     Outside the window entirely -> INVALID (never a silent float: an
     accidental pointer exit used to undock the surface and persist it, which
     is why a panel "opened popped-out by default". Floating is an explicit
     action now -- the Pop Out menu row or the keyboard F key). */
  /* Frozen dock hit-bands for ONE drag gesture. Computed once at pickup from
     committed geometry PLUS the preview expansion each dock WILL get if
     adopted (the same clamp syncDragPreview applies), so no preview reflow,
     FLIP marker or drop-active class can move a band mid-gesture. The old
     resolver read PAINTED geometry (elementsFromPoint): adopting a dock
     opened its track, the opened track starved the next hit-test (terminal
     mid-FLIP skipped, dock drop-active skipped), resolution fell through to
     home_main, the track collapsed, and the cycle restarted at ~4-6 frames
     -- the violent shake. Frame-count hysteresis cannot damp that loop
     because each alternating state is stable for more than two frames;
     freezing the geometry severs the feedback path by construction.
     Entry: the dock's committed rect union its narrow edge strip.
     Exit: entry extended past the ANTICIPATED opened track, plus slack --
     strictly wider than entry, so adoption is sticky (geometric hysteresis). */
  function buildDockLatch(sourceRect) {
    if (!root) return null;
    var bounds = root.getBoundingClientRect();
    var latch = {};
    ["dock_right", "dock_top", "dock_bottom", "dock_left"].forEach(function (dock) {
      var band = HOST_BANDS[dock];
      if (!band) return;
      var el = hostElement(dock);
      var rect = el ? el.getBoundingClientRect() : null;
      var occupied = Boolean(rect && rect.width > 4 && rect.height > 4);
      var footprint = hostAxisIsVertical(dock) ? sourceRect.width : sourceRect.height;
      var trackPx = Math.max(band.min, Math.min(band.max, Math.round(footprint || band.min)));
      var edge = DRAG_DOCK_EDGE_PX;
      var entry, exit;
      if (dock === "dock_bottom") {
        entry = occupied ? Math.min(rect.top, bounds.bottom - edge) : bounds.bottom - edge;
        exit = Math.min(entry, bounds.bottom - trackPx) - DOCK_EXIT_SLACK_PX;
      } else if (dock === "dock_top") {
        entry = occupied ? Math.max(rect.bottom, bounds.top + edge) : bounds.top + edge;
        exit = Math.max(entry, bounds.top + trackPx) + DOCK_EXIT_SLACK_PX;
      } else if (dock === "dock_right") {
        entry = occupied ? Math.min(rect.left, bounds.right - edge) : bounds.right - edge;
        exit = Math.min(entry, bounds.right - trackPx) - DOCK_EXIT_SLACK_PX;
      } else {
        entry = occupied ? Math.max(rect.right, bounds.left + edge) : bounds.left + edge;
        exit = Math.max(entry, bounds.left + trackPx) + DOCK_EXIT_SLACK_PX;
      }
      latch[dock] = { entry: entry, exit: exit, trackPx: trackPx };
    });
    return latch;
  }

  function dropHostAt(clientX, clientY) {
    if (!root) return null;
    if (clientX < 0 || clientX > window.innerWidth || clientY < 0 || clientY > window.innerHeight) return null;
    var bounds = root.getBoundingClientRect();
    if (clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return null;
    /* While the pointer is still inside the dragged surface's own PICKUP
       rect, the gesture has not really left home -- resolve to the source
       placement. The grip sits on the panel's top corner, which is also the
       workspace's edge band whenever the panel touches that edge; without
       this guard, pickup itself opened a dock preview whose expansion then
       captured every later hit-test. */
    var pickupRect = gesture && gesture.sourceRect;
    if (pickupRect &&
        clientX >= pickupRect.left && clientX <= pickupRect.left + pickupRect.width &&
        clientY >= pickupRect.top && clientY <= pickupRect.top + pickupRect.height) {
      return gesture.sourceHost;
    }
    var latch = gesture && gesture.dockLatch;
    /* LATCHED HOLD: once a dock is adopted, only leaving its frozen EXIT band
       releases it. The exit band already covers the opened preview track plus
       slack, so the expansion and its FLIP wave cannot unlatch the dock. A
       latched top/bottom dock still yields to dock_right's entry band, so the
       right column keeps its corner precedence while latched. */
    if (latch && gesture.latchedDock && latch[gesture.latchedDock]) {
      var heldDock = gesture.latchedDock;
      var hold = latch[heldDock];
      var inHold =
        heldDock === "dock_bottom" ? clientY >= hold.exit :
        heldDock === "dock_top" ? clientY <= hold.exit :
        heldDock === "dock_right" ? clientX >= hold.exit :
        clientX <= hold.exit;
      if (inHold && heldDock !== "dock_right" && latch.dock_right && clientX >= latch.dock_right.entry) inHold = false;
      if (inHold) return heldDock;
    }
    /* FROZEN ENTRY SCAN, replacing both the live edge bands and the painted
       elementsFromPoint stack walk. An occupied dock's entry band covers its
       pickup-time committed rect, so pointing at the dock's surfaces still
       adopts the dock -- from frozen geometry. Everything outside every dock
       band is home_main by construction (floating is never a pointer-drag
       target), so no painted-stack resolution remains at all.
       RIGHT is tested FIRST: the right column (chat's full-height dock) spans
       all three grid rows, so the corners belong to dock_right. */
    if (latch) {
      if (latch.dock_right && clientX >= latch.dock_right.entry) return "dock_right";
      if (latch.dock_top && clientY <= latch.dock_top.entry) return "dock_top";
      if (latch.dock_bottom && clientY >= latch.dock_bottom.entry) return "dock_bottom";
      if (latch.dock_left && clientX <= latch.dock_left.entry) return "dock_left";
    } else {
      /* no latch (defensive: keyboard-originated or degraded gesture) --
         narrow live edge bands only */
      var edge = DRAG_DOCK_EDGE_PX;
      if (clientX >= bounds.right - edge) return "dock_right";
      if (clientY <= bounds.top + edge) return "dock_top";
      if (clientY >= bounds.bottom - edge) return "dock_bottom";
      if (clientX <= bounds.left + edge) return "dock_left";
    }
    return "home_main";
  }

  /* ---- FLIP: neighbours animate from their pre-move rects ---- */
  function captureSurfaceRects() {
    var map = Object.create(null);
    Object.keys(surfaceRegistry).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element || !element.isConnected) return;
      var rect = element.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      map[id] = rect;
    });
    return map;
  }

  function flipSurfaces(previous) {
    if (reducedMotion()) return;
    /* Staggered wave: neighbours start their reflow 16ms apart in reading
       order, so a slot change reads as one choreographed motion instead of a
       simultaneous jump. (This runs only on target CHANGES now, so the wave
       is legible; per-frame restarts were the old "jumps around" defect.) */
    var moved = [];
    Object.keys(previous).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element || !element.isConnected) return;
      var before = previous[id];
      var after = element.getBoundingClientRect();
      var dx = before.left - after.left;
      var dy = before.top - after.top;
      if (!dx && !dy) return;
      moved.push({ element: element, dx: dx, dy: dy, order: after.top * 4096 + after.left });
    });
    moved.sort(function (a, b) { return a.order - b.order; });
    moved.forEach(function (entry, index) {
      var element = entry.element;
      window.PM7_MOTION_FINISH.cancel(element, 'transition', 'transform');
      element.style.transition = "none";
      element.style.transform = "translate(" + entry.dx + "px," + entry.dy + "px)";
      /* Mid-flight marker for hit-testing: the inline transform is EMPTY
         while the animation runs (the transition plays via removeProperty),
         so a style check cannot detect a FLIP in progress -- this attribute
         is the only reliable marker. Removed on settle and by
         clearFlipResidue. */
      element.setAttribute("data-pm-home-flip", "");
      var settle = function () {
        element.removeAttribute("data-pm-home-flip");
        if (!element.style.transform) {
          element.style.removeProperty("transition");
          element.style.removeProperty("transition-delay");
          element.style.removeProperty("transform");
        }
      };
      requestAnimationFrame(function () {
        element.style.transition = "transform var(--pm-home-reflow-dur) var(--pm-home-reflow-ease)";
        element.style.transitionDelay = (index * 16) + "ms";
        element.style.removeProperty("transform");
        window.PM7_MOTION_FINISH(element, 'transition', 'transform', settle);
      });
    });
  }

  function clearFlipResidue() {
    Object.keys(surfaceRegistry).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element) return;
      element.style.removeProperty("transition");
      element.style.removeProperty("transition-delay");
      element.style.removeProperty("transform");
      element.removeAttribute("data-pm-home-flip");
    });
  }

  /* ---- placeholder ---- */
  /* Creation only: the placeholder's SIZE is projected per-target inside
     syncDragPreview (post-drop fair share of the target host), not the
     surface's pickup-time footprint. */
  function ensurePlaceholder() {
    var placeholder = document.getElementById("pm-home-drop-placeholder");
    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.id = "pm-home-drop-placeholder";
      placeholder.className = "pm-home-drop-placeholder pm-home-surface";
      placeholder.setAttribute("aria-hidden", "true");
    }
    return placeholder;
  }

  function clearPlaceholder() {
    var placeholder = document.getElementById("pm-home-drop-placeholder");
    if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    var hosts = root ? root.querySelectorAll("[data-pm-home-host]") : [];
    Array.prototype.forEach.call(hosts, function (host) { host.classList.remove("pm-home-drop-active"); });
    if (gesture && gesture.previewTrack) { gesture.previewTrack = null; if (committed) syncHostGeometry(committed); }
  }

  /* Seat the placeholder at the live insertion point and reflow the rest.
     Nothing here is a re-render: the surfaces keep their DOM subtrees, which
     is what lets terminals, chat and editors survive a drag intact. */
  function syncDragPreview(host, insertion) {
    if (!gesture || !root) return;
    var previous = captureSurfaceRects();
    var placeholder = ensurePlaceholder();
    var hostEl = hostElement(host);
    if (!hostEl) { clearPlaceholder(); return; }
    var siblings = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(gesture.draft, id);
      return id !== gesture.surfaceId && surface && surface.visible;
    });
    /* Track sizing runs FIRST: an EMPTY dock has a zero-size track, so the
       placeholder fair-share math below must read the host's geometry with
       the track already opened to the incoming surface's band-clamped
       footprint. */
    if (gesture.previewTrack) { syncHostGeometry(gesture.draft); gesture.previewTrack = null; }
    var dockBand = HOST_BANDS[host];
    var trackPx = null;
    if (grid && dockBand) {
      var trackVar = host === "dock_left" ? "--pm-home-left-w" : host === "dock_right" ? "--pm-home-right-w" : host === "dock_top" ? "--pm-home-top-h" : "--pm-home-bottom-h";
      var latchedBand = gesture.dockLatch && gesture.dockLatch[host];
      if (latchedBand && latchedBand.trackPx) {
        /* single source with the frozen latch: the exit band and the actual
           opened track can never disagree */
        trackPx = latchedBand.trackPx;
      } else {
        var sourceRect = gesture.sourceRect || {};
        var footprint = hostAxisIsVertical(host) ? sourceRect.width : sourceRect.height;
        trackPx = Math.max(dockBand.min, Math.min(dockBand.max, Math.round(footprint || dockBand.min)));
      }
      grid.style.setProperty(trackVar, trackPx + "px");
      gesture.previewTrack = trackVar;
    }
    /* PROJECTED placeholder: preview the surface's POST-DROP footprint (the
       target host's fair share among its future occupants), never its
       pickup-time size -- dropping a wide main panel into a crowded dock now
       previews the sliver it will actually get. */
    /* read the gap the host actually renders (falls back to the 4px token
       default when the computed value is unusable) */
    var gapPx = parseFloat(getComputedStyle(hostEl).columnGap) || parseFloat(getComputedStyle(hostEl).gap) || 4;
    if (hostAxisIsVertical(host)) {
      var mainPxV = Math.max(60, Math.round((hostEl.clientHeight - gapPx * siblings.length) / (siblings.length + 1)));
      placeholder.style.setProperty("flex", "0 0 " + mainPxV + "px", "important");
      /* no min-height: the column dock fills the width for it */
      placeholder.style.removeProperty("min-height");
    } else {
      /* PROPORTIONAL projection, not an equal fair share: the placeholder
         takes the dragged surface's committed-basis share of the row (same
         80px floor normalizeMainRowBases applies), so the preview width is
         the width the drop will actually commit. */
      var dragged = surfaceById(gesture.draft, gesture.surfaceId);
      var draggedBasis = Math.max(80, Number(dragged && dragged.size && dragged.size.basis_px) || Math.round(gesture.sourceRect ? gesture.sourceRect.width : 360));
      var sumBases = draggedBasis;
      siblings.forEach(function (siblingId) {
        var siblingSurface = surfaceById(gesture.draft, siblingId);
        sumBases += Math.max(80, Number(siblingSurface && siblingSurface.size && siblingSurface.size.basis_px) || 360);
      });
      var mainPx = Math.max(120, Math.round(draggedBasis / sumBases * (hostEl.clientWidth - gapPx * siblings.length)));
      placeholder.style.setProperty("flex", "0 0 " + mainPx + "px", "important");
      placeholder.style.setProperty("min-height", (trackPx !== null ? trackPx : hostEl.clientHeight) + "px");
    }
    var beforeId = insertion && insertion.insertion_edge === "before" ? insertion.target_surface_instance_id : null;
    if (!beforeId && insertion && typeof insertion.index === "number" && insertion.index < siblings.length) {
      beforeId = siblings[insertion.index];
    }
    var beforeEl = beforeId && surfaceRegistry[beforeId] ? surfaceRegistry[beforeId].element : null;
    /* Surfaces are flex-ordered by their committed slot_index (applySurface
       writes inline `order`), so DOM position alone cannot place the
       placeholder -- it must carry a matching order or it always RENDERS
       first regardless of where it was inserted. Equal order + earlier DOM
       position = renders immediately before the target. */
    if (beforeEl && beforeEl.parentNode === hostEl) {
      placeholder.style.order = beforeEl.style.order || "0";
      hostEl.insertBefore(placeholder, beforeEl);
    } else {
      var maxOrder = 0;
      Array.prototype.forEach.call(hostEl.children, function (child) {
        if (child === placeholder) return;
        var value = parseInt(child.style.order || "0", 10);
        if (value >= maxOrder) maxOrder = value + 1;
      });
      placeholder.style.order = String(maxOrder);
      hostEl.appendChild(placeholder);
    }
    var hosts = root.querySelectorAll("[data-pm-home-host]");
    Array.prototype.forEach.call(hosts, function (node) {
      node.classList.toggle("pm-home-drop-active", node.getAttribute("data-pm-home-host") === host);
    });
    flipSurfaces(previous);
  }

  /* ---- lifted clone ---- */
  function makeLiftedClone(element) {
    var clone = element.cloneNode(true);
    /* Duplicate ids would poison every getElementById lookup for the duration
       of the drag, and duplicate hooks would re-bind handles onto the copy. */
    if (clone.removeAttribute) clone.removeAttribute("id");
    var tagged = clone.querySelectorAll("[id], [data-pm-home-handle], [data-pm-home-resizer], [data-pm-home-surface-options], [data-pm-home-surface]");
    Array.prototype.forEach.call(tagged, function (node) {
      node.removeAttribute("id");
      node.removeAttribute("data-pm-home-handle");
      node.removeAttribute("data-pm-home-resizer");
      node.removeAttribute("data-pm-home-surface-options");
      node.removeAttribute("data-pm-home-surface");
      node.removeAttribute("data-pm-home-drag-bound");
      node.removeAttribute("data-pm-home-resize-bound");
    });
    clone.classList.remove("pm-home-surface");
    clone.classList.add("pm-home-lifted");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("data-pm-home-lifted", "true");
    return clone;
  }

  function moveClone() {
    if (!gesture || !gesture.clone) return;
    gesture.clone.style.left = (gesture.pointerX - gesture.offsetX) + "px";
    gesture.clone.style.top = (gesture.pointerY - gesture.offsetY) + "px";
  }

  function dragAutoScroll() {
    if (!gesture || gesture.kind !== "move" || !gesture.scroller) return;
    var height = window.innerHeight;
    var delta = 0;
    if (gesture.pointerY < DRAG_EDGE_ZONE_PX) delta = -Math.ceil((DRAG_EDGE_ZONE_PX - gesture.pointerY) / 6);
    else if (gesture.pointerY > height - DRAG_EDGE_ZONE_PX) delta = Math.ceil((gesture.pointerY - (height - DRAG_EDGE_ZONE_PX)) / 6);
    if (delta) {
      /* Re-hit-test only when something actually MOVED: a scroller pinned at
         its limit ignores scrollBy, yet the old code re-ran applyDragPoint
         every rAF anyway -- re-resolving targets against mid-FLIP geometry
         with a stationary pointer was the edge-zone shake. */
      var isWindowScroller = gesture.scroller === window;
      var beforeTop = isWindowScroller ? window.scrollY : gesture.scroller.scrollTop;
      var beforeLeft = isWindowScroller ? window.scrollX : gesture.scroller.scrollLeft;
      gesture.scroller.scrollBy(0, delta);
      var afterTop = isWindowScroller ? window.scrollY : gesture.scroller.scrollTop;
      var afterLeft = isWindowScroller ? window.scrollX : gesture.scroller.scrollLeft;
      var scrolled = afterTop !== beforeTop || afterLeft !== beforeLeft;
      var pointerMoved = gesture.pointerX !== gesture.lastAutoX || gesture.pointerY !== gesture.lastAutoY;
      if (scrolled || pointerMoved) applyDragPoint(gesture.pointerX, gesture.pointerY);
    }
    gesture.lastAutoX = gesture.pointerX;
    gesture.lastAutoY = gesture.pointerY;
    gesture.raf = requestAnimationFrame(dragAutoScroll);
  }

  function findDragScroller() {
    var node = root ? root.parentElement : null;
    while (node && node !== document.documentElement) {
      var styles = window.getComputedStyle(node);
      if (/(auto|scroll|overlay)/.test(styles.overflowY) && node.scrollHeight > node.clientHeight) return node;
      node = node.parentElement;
    }
    return window;
  }

  function beginDrag(surfaceId, event) {
    if (gesture || !committed || (event.button !== undefined && event.button !== 0)) return;
    var surface = surfaceById(committed, surfaceId);
    var record = surfaceRegistry[surfaceId];
    if (!surface || !surface.visible || !record || !record.element) return;
    var element = record.element;
    var rect = element.getBoundingClientRect();
    var lifted = makeLiftedClone(element);
    lifted.style.left = rect.left + "px";
    lifted.style.top = rect.top + "px";
    lifted.style.width = rect.width + "px";
    lifted.style.height = rect.height + "px";
    document.body.appendChild(lifted);
    gesture = {
      kind: "move", surfaceId: surfaceId, pointerId: event.pointerId,
      snapshot: clone(committed), draft: clone(committed), sourceHost: surface.host,
      element: element, clone: lifted, sourceParent: element.parentNode, sourceNext: element.nextSibling,
      offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
      pointerX: event.clientX, pointerY: event.clientY,
      changed: false, finished: false, insertion: null, handle: event.currentTarget,
      keyboard: false, scroller: findDragScroller(), raf: 0,
      sourceRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      dockLatch: null, latchedDock: null
    };
    /* frozen dock bands: computed AFTER the surface is registered but BEFORE
       any preview can perturb layout -- the element is still in place here */
    gesture.dockLatch = buildDockLatch(gesture.sourceRect);
    element.style.setProperty("display", "none", "important");
    document.body.classList.add("pm-home-dragging");
    /* PM_EDGE defers scrollport band geometry while body.pm-resizing is set
       and flushes when PM_DRAGEND is invoked (PM_DRAGEND is the callable;
       PM_ON_DRAGEND is the registrar). Pair/track resizes already get this
       pair from the shared registerResizer; drags must opt in themselves or
       the edge bands recompute against mid-drag geometry and blur. */
    document.body.classList.add("pm-resizing");
    if (event.currentTarget && event.currentTarget.classList) {
      event.currentTarget.classList.add("pm-home-handle-active");
      event.currentTarget.setAttribute("aria-grabbed", "true");
    }
    /* Capture keeps touch/pen streams bound to the grip; the move/up listeners
       still live on window, NOT on the handle, because live reflow reparents
       nodes and a handle-scoped lostpointercapture would cancel the drag on
       frame one. */
    try { if (event.currentTarget && event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
    window.addEventListener("pointermove", onDragPointerMove, true);
    window.addEventListener("pointerup", onDragPointerUp, true);
    window.addEventListener("pointercancel", onDragPointerCancel, true);
    window.addEventListener("blur", onDragPointerCancel);
    void lifted.offsetWidth;
    lifted.classList.add("is-lifted");
    applyDragPoint(event.clientX, event.clientY);
    gesture.raf = requestAnimationFrame(dragAutoScroll);
    event.preventDefault();
  }

  function applyDragPoint(clientX, clientY) {
    if (!gesture || gesture.kind !== "move") return;
    gesture.pointerX = clientX;
    gesture.pointerY = clientY;
    moveClone();
    var host = dropHostAt(clientX, clientY);
    var disposition = null;
    if (host && host !== "floating" && host !== gesture.sourceHost && hostFull(host, gesture.surfaceId)) {
      disposition = "host_full";
      host = null;
    } else if (!host) {
      disposition = "invalid_target";
    }
    if (!host) {
      gesture.draft = clone(gesture.snapshot);
      gesture.insertion = null;
      gesture.changed = false;
      gesture.lastTargetKey = null;
      gesture.pendingTargetKey = null;
      gesture.latchedDock = null;
      metrics.previewFrameCount += 1;
      clearPlaceholder();
      root.setAttribute("data-pm-home-drop-disposition", disposition);
      return;
    }
    root.removeAttribute("data-pm-home-drop-disposition");
    metrics.previewFrameCount += 1;
    var insertion = insertionAt(host, clientX, clientY, gesture.surfaceId);
    /* The draft rebuild, registry rebuild and preview reflow run ONLY when the
       resolved (host, slot) target actually changes. Re-running them per
       pointermove restarted every neighbour's FLIP transition each frame --
       the board "jumped around" and never settled. */
    var targetKey = host + "|" + (insertion.insertion_edge === "before" ? insertion.target_surface_instance_id : "end" + insertion.index);
    if (host !== "floating" && gesture.lastTargetKey === targetKey) return;
    /* 2-frame hysteresis: a NEW target key must survive two consecutive
       passes before the board reflows to it. A single-frame phantom (a
       mid-FLIP neighbour momentarily under the pointer, a scroll tick) can
       no longer restart the wave -- that oscillation was the shake. The very
       first target (lastTargetKey null) adopts immediately so pickup
       previews without a dead frame; previewFrameCount was already
       incremented above, so the deferred frame still counts. */
    if (host !== "floating" && gesture.lastTargetKey != null) {
      if (gesture.pendingTargetKey !== targetKey) {
        gesture.pendingTargetKey = targetKey;
        return;
      }
    }
    gesture.pendingTargetKey = null;
    gesture.lastTargetKey = targetKey;
    /* latch the adopted dock (or clear it): from here only the frozen exit
       band in dropHostAt can release the dock */
    gesture.latchedDock = HOST_BANDS[host] ? host : null;
    var draft = clone(gesture.snapshot);
    if (host === "floating") {
      var rootRect = root.getBoundingClientRect();
      var original = surfaceById(draft, gesture.surfaceId);
      insertion.bounds = clampBounds({
        x: clientX - rootRect.left - gesture.offsetX,
        y: clientY - rootRect.top - gesture.offsetY,
        width: (original.floating_bounds && original.floating_bounds.width) || Math.max(300, original.size.basis_px),
        height: (original.floating_bounds && original.floating_bounds.height) || 300
      });
    }
    var moved = placementFor(draft, gesture.surfaceId, host, insertion);
    if (insertion.bounds) moved.floating_bounds = insertion.bounds;
    gesture.draft = draft;
    gesture.insertion = insertion;
    gesture.targetHost = host;
    gesture.changed = JSON.stringify(gesture.snapshot.surfaces) !== JSON.stringify(draft.surfaces);
    buildHostRegistriesFrom(draft);
    syncDragPreview(host, insertion);
  }

  /* Kept as the public/legacy entry point (PM_HOME_WORKSPACE.updateDrag calls
     it with an event). The clone tracks the pointer 1:1 on every event; the
     hit-test/preview pipeline is coalesced to one pass per animation frame. */
  function updateDrag(event) {
    if (!gesture || gesture.kind !== "move") return;
    if (event.pointerId !== undefined && gesture.pointerId !== undefined && event.pointerId !== gesture.pointerId) return;
    gesture.pointerX = event.clientX;
    gesture.pointerY = event.clientY;
    moveClone();
    if (!gesture.frameQueued) {
      gesture.frameQueued = true;
      requestAnimationFrame(function () {
        if (!gesture || gesture.kind !== "move") return;
        gesture.frameQueued = false;
        applyDragPoint(gesture.pointerX, gesture.pointerY);
      });
    }
    if (event.cancelable) event.preventDefault();
  }

  function onDragPointerMove(event) { updateDrag(event); }
  function onDragPointerUp(event) {
    if (!gesture || gesture.kind !== "move") return;
    if (event.pointerId !== undefined && gesture.pointerId !== undefined && event.pointerId !== gesture.pointerId) return;
    finishDrag(true);
  }
  function onDragPointerCancel() { finishDrag(false); }

  function unlistenDrag() {
    window.removeEventListener("pointermove", onDragPointerMove, true);
    window.removeEventListener("pointerup", onDragPointerUp, true);
    window.removeEventListener("pointercancel", onDragPointerCancel, true);
    window.removeEventListener("blur", onDragPointerCancel);
  }

  function settleClone(node, targetRect) {
    if (!node) return;
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      if (node.parentNode) node.parentNode.removeChild(node);
    };
    if (reducedMotion() || !targetRect || (!targetRect.width && !targetRect.height)) { finish(); return; }
    node.style.transition = "left var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "top var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "width var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "height var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "opacity var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "transform var(--pm-home-drop-dur) var(--pm-home-drop-ease)";
    void node.offsetWidth;
    node.style.left = targetRect.left + "px";
    node.style.top = targetRect.top + "px";
    node.style.width = targetRect.width + "px";
    node.style.height = targetRect.height + "px";
    node.style.opacity = "0";
    node.classList.remove("is-lifted");
    node.addEventListener("transitionend", finish);
    setTimeout(finish, 420);
  }

  function finishDrag(shouldCommit) {
    if (!gesture || gesture.kind !== "move" || gesture.finished) return;
    gesture.finished = true;
    var active = gesture;
    gesture = null;
    unlistenDrag();
    if (active.raf) cancelAnimationFrame(active.raf);
    document.body.classList.remove("pm-home-dragging");
    document.body.classList.remove("pm-resizing");
    if (root) root.removeAttribute("data-pm-home-drop-disposition");
    if (active.handle && active.handle.classList) {
      active.handle.classList.remove("pm-home-handle-active");
      active.handle.setAttribute("aria-grabbed", "false");
    }
    clearFlipResidue();
    /* Pre-seat the real element where the placeholder previewed it BEFORE the
       commit renders: the post-commit layout is then geometrically identical
       to the preview, so the drop lands with zero jump. */
    if (shouldCommit && active.changed) {
      var seatTarget = document.getElementById("pm-home-drop-placeholder");
      if (seatTarget && seatTarget.parentNode && active.element) {
        seatTarget.parentNode.insertBefore(active.element, seatTarget);
        /* surfaces render by flex order, so seat that too */
        active.element.style.order = seatTarget.style.order || "0";
      }
    }
    clearPlaceholder();
    if (active.element) active.element.style.removeProperty("display");
    if (shouldCommit && active.changed) {
      var after = surfaceById(active.draft, active.surfaceId);
      var dragAffected = changedSurfaceIds(active.snapshot, normalizeLayout(active.draft, null));
      var dragCommandId = after.host === "floating" ? "cmd.panel.undock" : (active.sourceHost === "floating" ? "cmd.panel.redock" : "cmd.workspace_layout.move_surface");
      commitLayout(active.draft, after.host === "floating" ? "undock" : (active.sourceHost === "floating" ? "redock" : "move"), dragCommandId, {
        affected_surface_instance_ids: dragAffected, source_host: active.sourceHost, target_host: after.host, target_slot_index: after.slot_index,
        target_surface_instance_id: active.insertion && active.insertion.target_surface_instance_id, insertion_edge: active.insertion && active.insertion.insertion_edge,
        command_payload: { surface_instance_id: active.surfaceId, source_host: active.sourceHost, target_host: after.host, target_slot_index: after.slot_index, target_surface_instance_id: active.insertion && active.insertion.target_surface_instance_id, insertion_edge: active.insertion && active.insertion.insertion_edge }
      });
      announce(surfaceLabel(active.surfaceId) + " moved to " + hostLabel(after.host) + ", position " + (after.slot_index + 1) + ".");
    } else {
      if (!shouldCommit) metrics.cancelledGestureCount += 1;
      renderLayout(active.snapshot);
      announce(shouldCommit ? "Move cancelled, no change." : "Move cancelled.");
    }
    var landed = active.element && active.element.isConnected ? active.element.getBoundingClientRect() : null;
    settleClone(active.clone, landed);
    /* flush the PM_EDGE band geometry deferred while body.pm-resizing was on
       (PM_DRAGEND is the callable; PM_ON_DRAGEND is the registrar) */
    if (typeof window.PM_DRAGEND === "function") { try { window.PM_DRAGEND(); } catch (error) {} }
  }

  /* ---- keyboard move: the grip is the only movement affordance now that the
     per-surface Move/Dock menu rows are retired, so it must work without a
     pointer. Enter/Space picks up, arrows move, Enter drops, Escape reverts. */
  var KEY_HOST_STEPS = {
    home_main: { ArrowLeft: "dock_left", ArrowRight: "dock_right", ArrowUp: "dock_top", ArrowDown: "dock_bottom" },
    dock_left: { ArrowRight: "home_main" },
    dock_right: { ArrowLeft: "home_main" },
    dock_top: { ArrowDown: "home_main" },
    dock_bottom: { ArrowUp: "home_main" },
    floating: { ArrowLeft: "home_main", ArrowRight: "home_main", ArrowUp: "home_main", ArrowDown: "home_main" }
  };

  function beginKeyboardMove(surfaceId, handle) {
    if (gesture || !committed) return false;
    var surface = surfaceById(committed, surfaceId);
    var record = surfaceRegistry[surfaceId];
    if (!surface || !surface.visible || !record || !record.element) return false;
    gesture = {
      kind: "move", surfaceId: surfaceId, pointerId: undefined,
      snapshot: clone(committed), draft: clone(committed), sourceHost: surface.host,
      element: record.element, clone: null, offsetX: 0, offsetY: 0,
      pointerX: 0, pointerY: 0, changed: false, finished: false, insertion: null,
      handle: handle, keyboard: true, targetHost: surface.host, scroller: null, raf: 0
    };
    document.body.classList.add("pm-home-dragging");
    if (handle) { handle.classList.add("pm-home-handle-active"); handle.setAttribute("aria-grabbed", "true"); }
    announce("Moving " + surfaceLabel(surfaceId) + " from " + hostLabel(surface.host) +
      ". Use the arrow keys to choose a place, F to float, Enter to drop, Escape to cancel.");
    return true;
  }

  function keyboardPlace(host, index) {
    if (!gesture || !gesture.keyboard) return;
    var draft = clone(gesture.snapshot);
    var siblings = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(draft, id);
      return id !== gesture.surfaceId && surface && surface.visible;
    });
    var bounded = Math.max(0, Math.min(index, siblings.length));
    var insertion = {
      index: bounded,
      target_surface_instance_id: siblings[bounded] || siblings[siblings.length - 1] || null,
      insertion_edge: siblings[bounded] ? "before" : "after"
    };
    if (host === "floating") {
      var original = surfaceById(draft, gesture.surfaceId);
      insertion.bounds = clampBounds(original.floating_bounds || tiledFloatBounds(draft, gesture.surfaceId));
    }
    var moved = placementFor(draft, gesture.surfaceId, host, insertion);
    if (insertion.bounds) moved.floating_bounds = insertion.bounds;
    gesture.draft = draft;
    gesture.insertion = insertion;
    gesture.targetHost = host;
    gesture.changed = JSON.stringify(gesture.snapshot.surfaces) !== JSON.stringify(draft.surfaces);
    metrics.previewFrameCount += 1;
    buildHostRegistriesFrom(draft);
    if (host !== "floating") syncDragPreview(host, insertion);
    else clearPlaceholder();
    announce(surfaceLabel(gesture.surfaceId) + " over " + hostLabel(host) + ", position " + (bounded + 1) + ".");
  }

  function keyboardStep(key) {
    if (!gesture || !gesture.keyboard) return false;
    var host = gesture.targetHost || gesture.sourceHost;
    var current = surfaceById(gesture.draft, gesture.surfaceId);
    var vertical = hostAxisIsVertical(host);
    var along = vertical ? (key === "ArrowUp" || key === "ArrowDown") : (key === "ArrowLeft" || key === "ArrowRight");
    var siblings = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(gesture.draft, id);
      return id !== gesture.surfaceId && surface && surface.visible;
    });
    var index = Math.max(0, Math.min(current ? current.slot_index : 0, siblings.length));
    if (along && host !== "floating") {
      var next = (key === "ArrowUp" || key === "ArrowLeft") ? index - 1 : index + 1;
      if (next >= 0 && next <= siblings.length) { keyboardPlace(host, next); return true; }
    }
    var stepHost = KEY_HOST_STEPS[host] && KEY_HOST_STEPS[host][key];
    if (stepHost) {
      /* caps hold on the keyboard path too: announce and stay */
      if (stepHost !== gesture.sourceHost && hostFull(stepHost, gesture.surfaceId)) {
        announce(hostLabel(stepHost) + " is full.");
        return true;
      }
      keyboardPlace(stepHost, (hostRegistries[stepHost] || []).length);
      return true;
    }
    return false;
  }

  function bindDragHandle(handle, surfaceId) {
    if (handle.getAttribute("data-pm-home-drag-bound") === "true") return;
    handle.setAttribute("data-pm-home-drag-bound", "true");
    handle.draggable = false;
    handle.addEventListener("dragstart", function (event) { event.preventDefault(); });
    handle.addEventListener("pointerdown", function (event) { beginDrag(surfaceId, event); });
    handle.addEventListener("keydown", function (event) {
      var holding = gesture && gesture.kind === "move" && gesture.keyboard && gesture.surfaceId === surfaceId;
      if (event.key === "Escape") {
        if (holding) { event.preventDefault(); finishDrag(false); }
        return;
      }
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        if (holding) { finishDrag(true); return; }
        if (!beginKeyboardMove(surfaceId, handle)) announce("This surface cannot be moved right now.");
        return;
      }
      if (!holding) return;
      if (event.key === "f" || event.key === "F") { event.preventDefault(); keyboardPlace("floating", 0); return; }
      if (event.key.indexOf("Arrow") === 0) {
        if (keyboardStep(event.key)) event.preventDefault();
      }
    });
  }

  function beginWorkgroupDrag(surfaceId, event) {
    var section = terminalSections[surfaceId];
    if (gesture || !section || !section.terminal_workgroup_id) return;
    gesture = { kind: "workgroup", sourceId: surfaceId, pointerId: event.pointerId, snapshot: clone(committed), draft: clone(committed), targetSectionId: null, targetHost: surfaceById(committed, surfaceId).host, changed: false, handle: event.currentTarget };
    document.body.classList.add("pm-home-dragging");
    /* same PM_EDGE defer/flush pair as beginDrag (see comment there) */
    document.body.classList.add("pm-resizing");
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
    event.preventDefault();
  }

  function updateWorkgroupDrag(event) {
    if (!gesture || gesture.kind !== "workgroup" || gesture.pointerId !== event.pointerId) return;
    var hit = document.elementFromPoint ? document.elementFromPoint(event.clientX, event.clientY) : event.target;
    var surfaceEl = hit && hit.closest ? hit.closest("[data-pm-home-surface]") : null;
    var targetId = surfaceEl && surfaceEl.getAttribute("data-pm-home-surface");
    var target = targetId && surfaceById(committed, targetId);
    if (!target || target.surface_kind !== "terminal_section" || targetId === gesture.sourceId || terminalSections[targetId].terminal_workgroup_id) targetId = null;
    var targetHost = dropHostAt(event.clientX, event.clientY);
    if (!targetHost) {
      gesture.targetSectionId = null;
      gesture.targetHost = null;
      gesture.changed = false;
      metrics.previewFrameCount += 1;
      clearPlaceholder();
      root.setAttribute("data-pm-home-drop-disposition", "invalid_target");
      event.preventDefault();
      return;
    }
    root.removeAttribute("data-pm-home-drop-disposition");
    gesture.targetSectionId = targetId;
    gesture.targetHost = targetHost;
    gesture.changed = Boolean(targetId) || gesture.targetHost !== surfaceById(gesture.snapshot, gesture.sourceId).host;
    metrics.previewFrameCount += 1;
    event.preventDefault();
  }

  function finishWorkgroupDrag(shouldCommit) {
    if (!gesture || gesture.kind !== "workgroup") return;
    var active = gesture;
    gesture = null;
    document.body.classList.remove("pm-home-dragging");
    document.body.classList.remove("pm-resizing");
    if (root) root.removeAttribute("data-pm-home-drop-disposition");
    clearPlaceholder();
    if (shouldCommit && active.changed) {
      activeTerminalSectionId = active.sourceId;
      moveWorkgroupToHost(active.targetHost, active.targetSectionId);
    } else {
      if (!shouldCommit) metrics.cancelledGestureCount += 1;
      renderLayout(active.snapshot);
    }
    /* flush the PM_EDGE band geometry deferred while body.pm-resizing was on
       (PM_DRAGEND is the callable; PM_ON_DRAGEND is the registrar) */
    if (typeof window.PM_DRAGEND === "function") { try { window.PM_DRAGEND(); } catch (error) {} }
  }

  function bindWorkgroupHandle(handle, surfaceId) {
    if (handle.getAttribute("data-pm-home-workgroup-bound") === "true") return;
    handle.setAttribute("data-pm-home-workgroup-bound", "true");
    handle.setAttribute("data-pm-home-workgroup-handle", "true");
    handle.draggable = false;
    handle.addEventListener("pointerdown", function (event) { beginWorkgroupDrag(surfaceId, event); });
    handle.addEventListener("pointermove", updateWorkgroupDrag);
    handle.addEventListener("pointerup", function (event) { if (gesture && gesture.pointerId === event.pointerId) finishWorkgroupDrag(true); });
    handle.addEventListener("pointercancel", function () { finishWorkgroupDrag(false); });
    handle.addEventListener("lostpointercapture", function () { if (gesture) finishWorkgroupDrag(false); });
  }

  /* A drag that grows the surface must move the pointer TOWARD the rest of the
     workspace: a right/bottom dock's handle sits on its inner edge, so its
     delta is inverted. */
  function resizeSignFor(host) { return (host === "dock_right" || host === "dock_bottom") ? -1 : 1; }

  /* Clamp band shared with syncHostGeometry, so a drag can actually reach the
     dock-track limits instead of silently discarding most of its range. */
  function resizeBandFor(surface) {
    var band = HOST_BANDS[surface.host];
    if (band) return band;
    return { min: Math.max(160, surface.size.min_width_px || 220), max: 1200 };
  }

  /* The EFFECTIVE minimum degrades to the host's fair share when the row is
     crowded: with hard nominal minimums, a full row wedged every divider and
     the layout could not be repaired by resizing. */
  function effectiveMinPx(host, surfaceId) {
    var nominal = nominalMinPx(surfaceId);
    var hostEl = hostElement(host);
    var reference = (gesture && gesture.draft) || committed;
    var ids = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(reference, id);
      return surface && surface.visible && !surface.collapsed;
    });
    if (!hostEl || !hostEl.clientWidth || !ids.length) return nominal;
    var fair = Math.floor(hostEl.clientWidth / ids.length);
    return Math.max(80, Math.min(nominal, fair));
  }

  function beginResize(surfaceId, event, options) {
    /* Only another resize blocks a resize. A stranded move/workgroup gesture
       used to lock every grabber in the workspace. */
    if (gesture && gesture.kind === "resize") return;
    if (gesture && gesture.kind === "move") finishDrag(false);
    if (gesture && gesture.kind === "workgroup") finishWorkgroupDrag(false);
    if (gesture) return;
    var surface = surfaceById(committed, surfaceId);
    if (!surface) return;
    gesture = { kind: "resize", surfaceId: surfaceId, snapshot: clone(committed), draft: clone(committed), startX: event && event.clientX || 0, startY: event && event.clientY || 0, startBasis: Number(surface.size.basis_px) || 360, changed: false, cancelled: false, pair: null, corner: Boolean(options && options.corner), track: Boolean(options && options.track), startCross: Number(surface.size.cross_basis_px) || Number(surface.size.basis_px) || 360, startHeight: surface.floating_bounds ? surface.floating_bounds.height : null, startWidth: surface.floating_bounds ? surface.floating_bounds.width : null };
    /* Row-host dividers transfer pixels between the ADJACENT PAIR -- this now
       covers home_main AND the row docks (dock_top/dock_bottom); a TRACK
       gesture (the row dock's full-width handle) never pairs, it drives
       cross_basis_px instead. Freeze every visible sibling's rendered width
       as its flex basis first: with one shared free-space pool, a
       single-basis write was diluted across every sibling's flex-grow, so a
       200px drag moved the pair ~130px and dragged the far dashboard along
       with it. Constant pair sum + px bases on all siblings makes the divider
       px-exact and strictly local. */
    var draftSurface = surfaceById(gesture.draft, surfaceId);
    /* a TRACK gesture starts from the dock's CURRENT rendered thickness (the
       max over its surfaces), not the grabbed surface's own value -- else
       grabbing a shorter sibling's handle snaps the dock on the first move */
    if (gesture.track && draftSurface) {
      var startMax = 0;
      (hostRegistries[draftSurface.host] || []).forEach(function (peerId) {
        var peer = surfaceById(gesture.draft, peerId);
        if (peer && peer.visible) startMax = Math.max(startMax, Number(peer.size.cross_basis_px) || Number(peer.size.basis_px) || 0);
      });
      if (startMax) gesture.startCross = startMax;
    }
    if (draftSurface && !hostAxisIsVertical(draftSurface.host) && draftSurface.host !== "floating" && !(options && options.track)) {
      var rowIds = (hostRegistries[draftSurface.host] || []).filter(function (id) {
        var rowSurface = surfaceById(gesture.draft, id);
        return rowSurface && rowSurface.visible && !rowSurface.collapsed;
      });
      var rowIndex = rowIds.indexOf(surfaceId);
      var nextId = rowIndex !== -1 ? rowIds[rowIndex + 1] : null;
      if (nextId) {
        var sizes = {};
        rowIds.forEach(function (id) {
          var el = surfaceRegistry[id] && surfaceRegistry[id].element;
          var w = el ? Math.round(el.getBoundingClientRect().width) : 0;
          sizes[id] = w;
          var rowSurface = surfaceById(gesture.draft, id);
          if (rowSurface && w) rowSurface.size.basis_px = w;
          if (el && w) el.style.setProperty("flex", "1 1 " + w + "px", "important");
        });
        gesture.pair = { nextId: nextId, startA: sizes[surfaceId] || gesture.startBasis, startB: sizes[nextId] || 0 };
      }
    }
  }

  /* Preview writes ONLY the dragged surface's geometry. The old full
     renderLayout() per pointermove re-ran attachSurfaceControls for every
     surface, which could remove the very handle holding pointer capture. */
  /* Main-axis sizing is written INLINE with `important`. A stylesheet rule
     cannot win here: PM6 blocks that load after pm6-css-dashboard set
     `.editor-pane { flex: 1 }` (and equivalents for the dashboard and chat),
     which flattens flex-basis to 0 and made every resize a visual no-op even
     though the model committed a new basis. */
  function applySurfaceFlex(surface, element) {
    if (!element) return;
    if (surface.host === "floating") { element.style.removeProperty("flex"); return; }
    if (surface.collapsed) { element.style.removeProperty("flex"); return; }
    /* Floor at 80, not the nominal minimum: minimum POLICY lives in the
       resize/normalize layers (fair-share degradation) -- re-clamping here to
       220 fought the degraded bases and forced the row into overflow. */
    var basis = Math.max(80, surface.size.basis_px || 360);
    element.style.setProperty("--pm-home-basis", basis + "px");
    if (hostAxisIsVertical(surface.host)) element.style.setProperty("flex", "1 1 auto", "important");
    else element.style.setProperty("flex", "1 1 " + basis + "px", "important");
  }

  function previewResize(layout, surfaceId) {
    var surface = surfaceById(layout, surfaceId);
    var record = surfaceRegistry[surfaceId];
    var element = record && record.element;
    if (!surface || !element) return;
    applySurfaceFlex(surface, element);
    if (surface.host === "floating" && surface.floating_bounds) {
      element.style.setProperty("width", surface.floating_bounds.width + "px", "important");
      element.style.setProperty("height", surface.floating_bounds.height + "px", "important");
      return;
    }
    if (grid) {
      if (surface.host === "dock_left") grid.style.setProperty("--pm-home-left-w", surface.size.basis_px + "px");
      if (surface.host === "dock_right") grid.style.setProperty("--pm-home-right-w", surface.size.basis_px + "px");
      /* row docks preview their TRACK from cross_basis_px */
      if (surface.host === "dock_top") grid.style.setProperty("--pm-home-top-h", (Number(surface.size.cross_basis_px) || surface.size.basis_px) + "px");
      if (surface.host === "dock_bottom") grid.style.setProperty("--pm-home-bottom-h", (Number(surface.size.cross_basis_px) || surface.size.basis_px) + "px");
    }
  }

  function updateResize(surfaceId, event) {
    if (!gesture || gesture.kind !== "resize" || gesture.surfaceId !== surfaceId) return;
    var surface = surfaceById(gesture.draft, surfaceId);
    /* Row-dock TRACK gesture: vertical drag moves the dock's cross-axis
       track (cross_basis_px), band-clamped; the per-surface widths are
       untouched. */
    if (gesture.track) {
      var rawT = (event.clientY - gesture.startY) * resizeSignFor(surface.host);
      var bandT = HOST_BANDS[surface.host];
      if (bandT) {
        var trackPxNext = Math.max(bandT.min, Math.min(bandT.max, Math.round(gesture.startCross + rawT)));
        /* the dock TRACK is a host-level dimension; syncHostGeometry takes
           max(cross_basis_px) over the dock, so every visible surface in the
           host must carry the new value or a taller sibling silently pins
           the track and the drag looks dead */
        (hostRegistries[surface.host] || []).forEach(function (siblingId) {
          var sibling = surfaceById(gesture.draft, siblingId);
          if (sibling && sibling.visible) sibling.size.cross_basis_px = trackPxNext;
        });
        gesture.changed = trackPxNext !== gesture.startCross;
        metrics.previewFrameCount += 1;
        previewResize(gesture.draft, surfaceId);
      }
      return;
    }
    if (gesture.pair && !hostAxisIsVertical(surface.host) && surface.host !== "floating") {
      var rawA = event.clientX - gesture.startX;
      var minA = effectiveMinPx(surface.host, surfaceId);
      var minB = effectiveMinPx(surface.host, gesture.pair.nextId);
      var total = gesture.pair.startA + gesture.pair.startB;
      var sizeA = Math.max(minA, Math.min(total - minB, gesture.pair.startA + rawA));
      var sizeB = total - sizeA;
      surface.size.basis_px = Math.round(sizeA);
      var partner = surfaceById(gesture.draft, gesture.pair.nextId);
      if (partner) partner.size.basis_px = Math.round(sizeB);
      gesture.changed = Math.round(sizeA) !== Math.round(gesture.pair.startA);
      metrics.previewFrameCount += 1;
      var elA = surfaceRegistry[surfaceId] && surfaceRegistry[surfaceId].element;
      var elB = surfaceRegistry[gesture.pair.nextId] && surfaceRegistry[gesture.pair.nextId].element;
      if (elA) elA.style.setProperty("flex", "1 1 " + Math.round(sizeA) + "px", "important");
      if (elB) elB.style.setProperty("flex", "1 1 " + Math.round(sizeB) + "px", "important");
      return;
    }
    var horizontal = surface.host !== "dock_top" && surface.host !== "dock_bottom";
    var raw = horizontal ? event.clientX - gesture.startX : event.clientY - gesture.startY;
    var delta = raw * resizeSignFor(surface.host);
    var band = resizeBandFor(surface);
    surface.size.basis_px = Math.max(band.min, Math.min(band.max, gesture.startBasis + delta));
    if (surface.host === "floating") {
      var bounds = clone(surface.floating_bounds || { x: 24, y: 24, width: gesture.startBasis, height: 300 });
      /* seed from the CURRENT floating width: basis_px carries the docked
         row basis (rewritten by home_main normalization), so using it here
         made a shrink drag GROW a float whose rendered width differed */
      bounds.width = Math.max(240, Math.min(rootBounds().width - bounds.x - 8, (gesture.startWidth || gesture.startBasis) + delta));
      /* the corner handle drives BOTH axes; the edge handle stays width-only */
      if (gesture.corner) {
        var rawY = event.clientY - gesture.startY;
        var startH = gesture.startHeight || bounds.height || 300;
        bounds.height = Math.max(180, Math.min(rootBounds().height - bounds.y - 8, startH + rawY));
      }
      surface.floating_bounds = clampBounds(bounds);
    }
    gesture.changed = JSON.stringify(gesture.snapshot.surfaces) !== JSON.stringify(gesture.draft.surfaces);
    metrics.previewFrameCount += 1;
    previewResize(gesture.draft, surfaceId);
  }

  /* Semantic resize entry point for owner-driven restoration. Pointer gestures
     and this path settle through the same revisioned command/persistence owner;
     callers cannot replace a layout, owner ref, buffer, or terminal session. */
  function resizeSurface(surfaceId, values) {
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (gesture) return { ok: false, reason: "gesture_in_progress" };
    var allowed = ["width_px", "height_px", "flex_weight", "expected_layout_revision"];
    if (!values || typeof values !== "object" || Array.isArray(values) || Object.keys(values).some(function (key) { return allowed.indexOf(key) === -1; })) return { ok: false, reason: "invalid_resize_values" };
    if (!Number.isInteger(values.expected_layout_revision) || values.expected_layout_revision !== committed.layout_revision) return { ok: false, reason: "stale_layout_revision" };
    if (["width_px", "height_px", "flex_weight"].some(function (key) { return values[key] !== undefined && (typeof values[key] !== "number" || !isFinite(values[key]) || values[key] <= 0); })) return { ok: false, reason: "invalid_resize_values" };
    var next = clone(committed), after = surfaceById(next, surfaceId), band = resizeBandFor(current);
    if (values.width_px !== undefined) after.size.basis_px = Math.max(band.min, Math.min(band.max, values.width_px));
    if (values.height_px !== undefined) {
      var crossBand = HOST_BANDS[current.host];
      after.size.cross_basis_px = crossBand && (current.host === "dock_top" || current.host === "dock_bottom") ? Math.max(crossBand.min, Math.min(crossBand.max, values.height_px)) : values.height_px;
    }
    if (values.flex_weight !== undefined) after.size.flex_weight = values.flex_weight;
    if (current.host === "floating" && after.floating_bounds) {
      if (values.width_px !== undefined) after.floating_bounds.width = values.width_px;
      if (values.height_px !== undefined) after.floating_bounds.height = values.height_px;
      after.floating_bounds = clampBounds(after.floating_bounds);
    }
    var result = commitLayout(next, "resize_commit", "cmd.workspace_layout.resize_surface", {
      skip_render: true, source_host: current.host, target_host: current.host,
      command_payload: { surface_instance_id: surfaceId, width_px: after.host === "floating" && after.floating_bounds ? after.floating_bounds.width : after.size.basis_px, height_px: after.host === "floating" && after.floating_bounds ? after.floating_bounds.height : after.size.cross_basis_px, flex_weight: after.size.flex_weight }
    });
    if (result.ok) previewResize(committed, surfaceId);
    return result;
  }

  function finishResize() {
    if (!gesture || gesture.kind !== "resize") return;
    var active = gesture;
    gesture = null;
    if (active.cancelled) { metrics.cancelledGestureCount += 1; renderLayout(active.snapshot); return; }
    if (!active.changed) { renderLayout(active.snapshot); return; }
    var before = surfaceById(active.snapshot, active.surfaceId);
    var after = surfaceById(active.draft, active.surfaceId);
    commitLayout(active.draft, "resize_commit", "cmd.workspace_layout.resize_surface", {
      skip_render: true,
      affected_surface_instance_ids: active.pair ? [active.surfaceId, active.pair.nextId] : [active.surfaceId], source_host: before.host, target_host: after.host,
      command_payload: { surface_instance_id: active.surfaceId, width_px: after.host === "floating" && after.floating_bounds ? after.floating_bounds.width : after.size.basis_px, height_px: after.host === "floating" && after.floating_bounds ? after.floating_bounds.height : ((after.host === "dock_top" || after.host === "dock_bottom") ? (Number(after.size.cross_basis_px) || null) : null), flex_weight: after.size.flex_weight }
    });
  }

  function cancelResizeGesture() {
    if (!gesture || gesture.kind !== "resize") return;
    gesture.cancelled = true;
    if (typeof window.PM_CANCEL_RESIZER === "function") {
      try { window.PM_CANCEL_RESIZER(); } catch (error) {}
    }
    if (gesture && gesture.kind === "resize") finishResize();
  }

  function bindResizer(resizer, surfaceId, options) {
    if (resizer.getAttribute("data-pm-home-resize-bound") === "true") return;
    resizer.setAttribute("data-pm-home-resize-bound", "true");
    var cancelled = false;
    resizer.addEventListener("pointercancel", function () { cancelled = true; if (gesture && gesture.kind === "resize") gesture.cancelled = true; }, true);
    resizer.addEventListener("lostpointercapture", function () { cancelled = true; if (gesture && gesture.kind === "resize") gesture.cancelled = true; }, true);
    if (typeof window.registerResizer === "function") {
      window.registerResizer(resizer, {
        isHorizontal: !resizer.classList.contains("resizer-row"),
        onStart: function (event) { cancelled = false; beginResize(surfaceId, event, options); },
        onMove: function (event) { updateResize(surfaceId, event); },
        onEnd: function () { if (gesture && gesture.kind === "resize") gesture.cancelled = gesture.cancelled || cancelled; finishResize(); }
      });
    }
  }

  function installTitlebarHomeControl() {
    var themeWrap = document.getElementById("themeMenuWrap");
    if (!themeWrap || document.getElementById("pm-home-more-btn")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pm6-tb-menu-trigger pm-home-titlebar-more";
    button.id = "pm-home-more-btn";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "pm-home-more-menu");
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-label", "Home more options");
    button.title = "Home more options";
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
    themeWrap.parentNode.insertBefore(button, themeWrap);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var menu = document.getElementById("pm-home-more-menu");
      if (menuState.main === menu) closeAllMenus(true); else openMainMenu(menu, button);
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMainMenu(document.getElementById("pm-home-more-menu"), button);
        setTimeout(function () { focusMenuItem(document.getElementById("pm-home-more-menu"), 0); }, 0);
      }
    });
  }

  function installSettingsReset() {
    document.addEventListener("click", function (event) {
      /* T44 owns the Settings renderer and exposes actions semantically. This
         exact typed control is the sole Settings-to-Home bridge; capture it
         before T44's generic concept-preview handler, while leaving every
         other `run-setting-action` untouched. Keep the retired selector only
         as a compatibility input for older transformed candidates. */
      var button = event.target && event.target.closest ? event.target.closest('[data-action="run-setting-action"][data-setting="general.startup.reset-home-layout"], .s4-row[data-sid="general.startup.reset-home-layout"] .s4-action') : null;
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var result = resetLayout();
      var ok = Boolean(result && result.ok);
      var noChange = Boolean(ok && result.no_change);
      button.setAttribute("data-pm-home-reset-outcome", ok ? (noChange ? "no_change" : "applied") : "failed");
      button.setAttribute("aria-label", ok ? (noChange ? "Home workspace layout is already at the safe default" : "Home workspace layout reset") : "Home workspace layout reset unavailable");
      if (typeof window.toast === "function") {
        window.toast(ok ? (noChange ? "Home workspace layout is already at the safe default" : "Home workspace layout reset") : "Home workspace layout could not be reset");
      }
    }, true);
    if (window.MutationObserver) {
      var resetSelector = '[data-action="run-setting-action"][data-setting="general.startup.reset-home-layout"], .s4-row[data-sid="general.startup.reset-home-layout"] .s4-action';
      function normalizeResetButton(button) {
        if (button && !button.classList.contains("s4-working") && !button.textContent.trim()) button.textContent = "Reset";
      }
      var observer = new MutationObserver(function (records) {
        /* Settings swaps can add dozens of nodes. Inspect only each newly
           attached subtree instead of rescanning this multi-megabyte concept
           document after every unrelated mutation. */
        records.forEach(function (record) {
          Array.prototype.forEach.call(record.addedNodes || [], function (node) {
            if (!node || node.nodeType !== 1) return;
            if (node.matches && node.matches(resetSelector)) normalizeResetButton(node);
            if (node.querySelectorAll) node.querySelectorAll(resetSelector).forEach(normalizeResetButton);
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  function wireMenus() {
    document.querySelectorAll(".pm-home-portal").forEach(function (menu) {
      menu.addEventListener("keydown", menuKeydown);
      menu.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
      menu.addEventListener("click", function (event) {
        event.stopPropagation();
        var submenu = event.target.closest ? event.target.closest("[data-pm-home-submenu]") : null;
        if (submenu) { event.preventDefault(); openFlyout(document.getElementById(submenu.getAttribute("data-pm-home-submenu")), submenu, false); return; }
        var action = event.target.closest ? event.target.closest("[data-pm-home-action]") : null;
        if (action) { event.preventDefault(); handleAction(action); }
      });
    });
    var topMenu = document.getElementById("pm-home-more-menu");
    if (topMenu) {
      topMenu.querySelectorAll("[data-pm-home-submenu]").forEach(function (row) {
        row.addEventListener("mouseenter", function () { scheduleFlyout(row); });
        row.addEventListener("mouseleave", function () { if (menuState.hoverTimer) { clearTimeout(menuState.hoverTimer); menuState.hoverTimer = null; } });
      });
    }
    [document.getElementById("pm-home-open-panel-flyout"), document.getElementById("pm-home-open-browser-flyout"), document.getElementById("pm-home-file-panel-menu")].forEach(function (menu) {
      if (!menu) return;
      menu.addEventListener("mouseenter", function () { if (menuState.hoverTimer) { clearTimeout(menuState.hoverTimer); menuState.hoverTimer = null; } });
      menu.addEventListener("mouseleave", function () { menuState.hoverTimer = setTimeout(function () { closeFlyout(false); }, 140); });
    });
    document.addEventListener("pointerdown", function (event) {
      if (!menuState.main && !menuState.flyout) return;
      if (event.target.closest && event.target.closest(".pm-home-portal, #pm-home-more-btn, [data-pm-home-surface-options], [data-pm-home-file-submenu]")) return;
      closeAllMenus(false);
    }, true);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && (menuState.main || menuState.flyout)) { event.preventDefault(); closeAllMenus(true); return; }
      if (event.key !== "Escape" || !gesture) return;
      if (gesture.kind === "move") finishDrag(false);
      else if (gesture.kind === "workgroup") finishWorkgroupDrag(false);
      else cancelResizeGesture();
    }, true);
  }

  function wireActions() {
    document.addEventListener("click", function (event) {
      var bottomCollapse = event.target && event.target.closest ? event.target.closest("#collapseBottom, [data-pm-home-collapse-toggle]") : null;
      if (bottomCollapse && bottomCollapse.closest("#pm-home-workspace")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        /* Toggle, then read the POST-commit state: the old code negated the
           value for the command but reported the pre-mutation value to
           aria-expanded, so the control always announced the wrong state. */
        toggleBottomTerminalCollapsed();
        var settled = eligibleBottomTerminal(committed);
        if (settled) {
          var settledEl = surfaceRegistry[settled.surface_instance_id] && surfaceRegistry[settled.surface_instance_id].element;
          syncCollapseControl(settled, settledEl);
          announce(settled.collapsed ? "Bottom terminal collapsed." : "Bottom terminal expanded.");
        }
        return;
      }
      var surfaceMenuButton = event.target && event.target.closest ? event.target.closest("[data-pm-home-surface-options]") : null;
      if (surfaceMenuButton) { event.preventDefault(); openSurfaceMenu(surfaceMenuButton, surfaceMenuButton.getAttribute("data-pm-home-surface-options")); return; }
      var chatRow = event.target && event.target.closest ? event.target.closest("[data-pm-home-chat-row]") : null;
      if (chatRow) {
        /* injected "Dock back" row in the BASE chat menu. Do the redock here
           but do NOT preventDefault/stopImmediatePropagation: the click must
           still reach the base delegated .pm6-chat-more-item handler, whose
           generic row branch closes the menu with the portal animation (the
           same path Duplicate/Archive take). Mirrors handleAction's
           redock-surface semantics. */
        var chatSurface = surfaceById(committed, "chat");
        moveSurface("chat", (chatSurface && chatSurface.last_docked_host) || "home_main");
        return;
      }
      var localAction = event.target && event.target.closest ? event.target.closest("#pm-home-workspace [data-pm-home-action]") : null;
      if (localAction) { event.preventDefault(); event.stopImmediatePropagation(); handleAction(localAction); return; }
      var browserTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-browser-tab]") : null;
      if (browserTab) { event.preventDefault(); openBrowser(browserTab.getAttribute("data-pm-home-browser-tab")); }
      var automationTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-automation-tab]") : null;
      if (automationTab) {
        event.preventDefault();
        var automationPanel = automationTab.getAttribute("data-pm-home-automation-tab");
        openBrowser(automationPanel);
        var automationBanner = document.getElementById("automationBanner");
        var sessionBadge = document.getElementById("browserSessionBadge");
        var addressBar = document.getElementById("browserAddressBar");
        var previewTab = browserChrome.preview;
        if (previewTab) previewTab.classList.remove("active");
        automationTab.style.display = "";
        automationTab.classList.add("active");
        syncAutomationTabVisibility();
        if (automationBanner) automationBanner.style.display = "flex";
        if (sessionBadge) { sessionBadge.className = "browser-session-badge automation"; sessionBadge.textContent = "automation_session"; }
        if (addressBar) addressBar.value = "http://localhost:5173/test-runner";
      }
      var codeTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-surface] .editor-tabs .tab[data-file]") : null;
      if (codeTab) {
        var surfaceEl = codeTab.closest("[data-pm-home-surface]");
        var surfaceId = surfaceEl && surfaceEl.getAttribute("data-pm-home-surface");
        if (surfaceId && browserOwner.target_editor_panel_id === surfaceId) {
          deactivateBrowserProjection(surfaceId);
          surfaceEl.querySelectorAll(".editor-area").forEach(function (area) { area.style.display = "flex"; });
        }
        /* Generated shells (panels 3/4) have no PM6 tab controller of their
           own: activate the clicked tab and render its buffer here. */
        if (surfaceId && surfaceEl.classList.contains("pm-home-editor-shell")) {
          var clickedFile = codeTab.getAttribute("data-file");
          if (clickedFile) {
            renderFileIntoPanel(surfaceId, clickedFile);
            Array.prototype.forEach.call(codeTab.parentNode.querySelectorAll(".tab"), function (tab) {
              tab.classList.toggle("active", tab === codeTab);
            });
            if (editorOwners[surfaceId] && buffersByPath[clickedFile]) editorOwners[surfaceId].active_buffer_id = buffersByPath[clickedFile];
          }
        }
      }
    }, true);
    /* Chat visibility reconciles on the BUBBLE phase, after PM6's own toggle
       has run. Intercepting it in capture with stopImmediatePropagation used to
       skip the base bookkeeping (mount layout, split refit, rail state), and
       the model then re-applied `.hidden` on the next render -- the two states
       fought and chat ended up neither open nor properly closed. */
    document.addEventListener("click", function (event) {
      var chatToggle = event.target && event.target.closest ? event.target.closest('.activity-bar .icon[title="Chat"]') : null;
      if (!chatToggle) return;
      var panel = document.getElementById("chatPanel");
      if (!panel) return;
      var visible = !panel.classList.contains("hidden");
      var chatSurface = surfaceById(committed, "chat");
      if (chatSurface && chatSurface.visible === visible) return;
      setSurfaceVisible("chat", visible, "cmd.panel.switch");
    }, false);
    document.addEventListener("keydown", function (event) {
      var browserTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-browser-tab]") : null;
      if (browserTab && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openBrowser(browserTab.getAttribute("data-pm-home-browser-tab")); }
    });
  }

  function mountWorkspace() {
    var page = document.getElementById("panel-dashboard");
    if (!page || !root) return false;
    page.classList.add("pm-home-owned");
    page.appendChild(root);
    var editorView = document.getElementById("editorView");
    var pane1 = document.getElementById("editorPane1");
    var pane2 = document.getElementById("editorPane2");
    var dashboard = document.getElementById("dashboardView");
    var bottom = document.getElementById("bottomPanel");
    var chat = document.getElementById("chatPanel");
    if (pane1) hostElement("home_main").appendChild(pane1);
    if (pane2) hostElement("home_main").appendChild(pane2);
    if (dashboard) hostElement("home_main").appendChild(dashboard);
    if (bottom) hostElement("dock_bottom").appendChild(bottom);
    if (chat) hostElement("dock_right").appendChild(chat);
    if (editorView) editorView.style.setProperty("display", "none", "important");
    ["editorSplitResizer", "editorDashResizer", "terminalResizer", "chatResizer"].forEach(function (id) {
      var element = document.getElementById(id);
      if (element) element.style.setProperty("display", "none", "important");
    });
    return true;
  }

  function identitySnapshot() {
    var buffers = Object.keys(buffersByPath).map(function (path) { return { path: path, buffer_id: buffersByPath[path] }; });
    var terminals = Object.keys(terminalSections).map(function (id) { return clone(Object.assign({ surface_instance_id: id }, terminalSections[id])); });
    var renderedTerminalPanes = Array.prototype.slice.call(document.querySelectorAll('#bottomTerminalHost .terminal-pane[data-terminal-pane-id]')).map(function (pane) {
      return { terminal_pane_id: pane.getAttribute("data-terminal-pane-id"), terminal_session_id: pane.getAttribute("data-terminal-session-id"), element_count: document.querySelectorAll('[data-terminal-pane-id="' + pane.getAttribute("data-terminal-pane-id") + '"]').length };
    });
    return { editors: clone(editorOwners), buffers: buffers, browser: clone(browserOwner), terminals: terminals, rendered_terminal_panes: renderedTerminalPanes };
  }

  function identityIntegrity() {
    var snapshot = identitySnapshot();
    var panelIds = Object.keys(snapshot.editors);
    var groups = panelIds.map(function (id) { return snapshot.editors[id].editor_group_id; });
    var bufferIds = snapshot.buffers.map(function (buffer) { return buffer.buffer_id; });
    var paneIds = [];
    var sessionIds = [];
    snapshot.terminals.forEach(function (section) { paneIds = paneIds.concat(section.pane_ids); sessionIds = sessionIds.concat(section.terminal_session_ids); });
    function unique(values) { return new Set(values).size === values.length; }
    var renderedIds = snapshot.rendered_terminal_panes.map(function (pane) { return pane.terminal_pane_id; });
    var renderedSessions = snapshot.rendered_terminal_panes.map(function (pane) { return pane.terminal_session_id; });
    var renderedOwner = paneIds.every(function (id) { return renderedIds.indexOf(id) !== -1; }) && sessionIds.every(function (id) { return renderedSessions.indexOf(id) !== -1; }) && snapshot.rendered_terminal_panes.every(function (pane) { return pane.element_count === 1; });
    return { ok: unique(panelIds) && unique(groups) && unique(bufferIds) && unique(paneIds) && unique(sessionIds) && renderedOwner, editor_panel_ids_unique: unique(panelIds), editor_group_ids_unique: unique(groups), buffer_ids_unique: unique(bufferIds), terminal_pane_ids_unique: unique(paneIds), terminal_session_ids_unique: unique(sessionIds), rendered_terminal_owner_bound: renderedOwner };
  }

  /* The chat engine rebuilds #chatPanel with `innerHTML = CHAT_TEMPLATE(...)`
     and the editor tab renderers rebuild `.editor-tabs` from state -- both
     destroy the grip, kebab and collapse chevron mounted inside them. Re-seat
     the chrome whenever a claimed surface's subtree is rebuilt, rather than
     hoping the 250ms/1000ms boot catch-ups land after the last re-render. */
  var chromeWatch = { observer: null, queued: false, busy: false, watched: null };
  var overflowSafety = { observed: typeof WeakSet === "function" ? new WeakSet() : null, states: typeof WeakMap === "function" ? new WeakMap() : null };

  function overflowChipWidth(chip, label) {
    if (!chip || !document.body) return 0;
    var cloneChip = chip.cloneNode(false);
    cloneChip.removeAttribute("id");
    cloneChip.removeAttribute("data-pm-home-overflow-mode");
    cloneChip.textContent = label;
    cloneChip.style.cssText = "position:fixed!important;left:-10000px!important;top:-10000px!important;display:block!important;visibility:hidden!important;width:auto!important;min-width:0!important;max-width:none!important;pointer-events:none!important;";
    document.body.appendChild(cloneChip);
    var width = cloneChip.getBoundingClientRect().width;
    cloneChip.remove();
    return width;
  }

  function overflowHiddenCount(strip, chip) {
    var textMatch = /\+(\d+)/.exec(chip.textContent || "");
    if (textMatch) return Number(textMatch[1]) || 0;
    var stored = Number(chip.getAttribute("data-pm-home-hidden-count"));
    if (stored > 0) return stored;
    if (strip._pmEdHidden && strip._pmEdHidden.length) return strip._pmEdHidden.length;
    return strip.querySelectorAll('.tab[data-ed-hidden], .tab[data-ed2-hidden], .tab[style*="display: none"]').length;
  }

  /* The base fitter correctly chooses which tabs collapse, but under extreme
     fair-share compression its final one-tab floor can still put the chip in
     the surface kebab's lane. Keep the full label when it fits, then degrade
     only the chip's presentation (+N, then an accessible ellipsis). If even
     20px cannot coexist with four pixels of clearance, hide the chip until a
     ResizeObserver sees usable space again. Domain state and hidden-tab
     ownership stay in the base fitter; this is presentation containment only. */
  function enforceHomeOverflowClearance(strip) {
    if (!strip || !strip.isConnected) return;
    if (document.documentElement.getAttribute('data-pm-page-transition') === 'running') return;
    var ownerPage = strip.closest && strip.closest('.primary-content > .page');
    if (ownerPage && !ownerPage.classList.contains('active')) return;
    var surface = strip.closest('[data-pm-home-surface][data-pm-home-kind="editor_panel"]');
    var chip = strip.querySelector(".pm-ed-overflow");
    var kebab = surface && surface.querySelector(':scope > [data-pm-home-surface-options]');
    if (!surface || !chip || !kebab) return;
    var stripWidth = strip.getBoundingClientRect().width;
    if (chip.getAttribute("data-pm-home-overflow-mode") === "hidden") {
      var hiddenAtWidth = Number(chip.getAttribute("data-pm-home-hidden-at-width"));
      if (Number.isFinite(hiddenAtWidth) && Math.abs(hiddenAtWidth - stripWidth) < 1) return;
      chip.removeAttribute("data-pm-home-overflow-mode");
      chip.removeAttribute("data-pm-home-hidden-at-width");
      chip.setAttribute("aria-hidden", "false");
      if (typeof window.PM6_FIT_EDITOR_TABS === "function") {
        try { window.PM6_FIT_EDITOR_TABS(strip); } catch (error) {}
      }
      scheduleHomeOverflowClearance(strip);
      return;
    }
    if (getComputedStyle(chip).display === "none") return;
    var count = overflowHiddenCount(strip, chip);
    if (!count) return;
    chip.setAttribute("data-pm-home-hidden-count", String(count));
    chip.setAttribute("aria-label", count + " collapsed editor tab" + (count === 1 ? "" : "s"));
    var full = "+" + count + " more";
    var compact = "+" + count;
    chip.setAttribute("data-pm-home-compact-label", compact);
    var stripRect = strip.getBoundingClientRect();
    var kebabRect = kebab.getBoundingClientRect();
    var allowedRight = Math.min(stripRect.right, kebabRect.left - 4);
    var chipRect = chip.getBoundingClientRect();
    var available = Math.max(0, allowedRight - chipRect.left);
    var fullWidth = overflowChipWidth(chip, full);
    var compactWidth = overflowChipWidth(chip, compact);
    var mode = fullWidth <= available + .5 ? "full" : (compactWidth <= available + .5 ? "compact" : (20 <= available + .5 ? "ellipsis" : "hidden"));
    if (mode === "full") chip.removeAttribute("data-pm-home-overflow-mode");
    else chip.setAttribute("data-pm-home-overflow-mode", mode);
    if (mode === "hidden") chip.setAttribute("data-pm-home-hidden-at-width", String(stripWidth));
    else chip.removeAttribute("data-pm-home-hidden-at-width");
    chip.setAttribute("aria-hidden", mode === "hidden" ? "true" : "false");
    chip.setAttribute("data-pm-home-clearance-px", String(Math.floor(allowedRight - chip.getBoundingClientRect().right)));
  }

  function scheduleHomeOverflowClearance(strip) {
    if (!strip || !strip.isConnected) return;
    if (document.documentElement.getAttribute('data-pm-page-transition') === 'running') return;
    var ownerPage = strip.closest && strip.closest('.primary-content > .page');
    if (ownerPage && !ownerPage.classList.contains('active')) return;
    var state = overflowSafety.states && overflowSafety.states.get(strip);
    if (!state) {
      state = { queued: false };
      if (overflowSafety.states) overflowSafety.states.set(strip, state);
      else state = strip._pmHomeOverflowSafety || (strip._pmHomeOverflowSafety = { queued: false });
    }
    if (state.queued) return;
    state.queued = true;
    requestAnimationFrame(function () {
      state.queued = false;
      enforceHomeOverflowClearance(strip);
    });
  }

  function enrolHomeOverflowSafety(element) {
    var strip = element && element.querySelector && element.querySelector(".editor-tabs");
    if (!strip) return;
    if (overflowSafety.observed && overflowSafety.observed.has(strip)) { scheduleHomeOverflowClearance(strip); return; }
    if (overflowSafety.observed) overflowSafety.observed.add(strip);
    if (typeof ResizeObserver === "function") {
      try { new ResizeObserver(function () { scheduleHomeOverflowClearance(strip); }).observe(strip); } catch (error) {}
    }
    if (typeof MutationObserver === "function") {
      try {
        new MutationObserver(function () { syncAutomationTabVisibility(); scheduleHomeOverflowClearance(strip); }).observe(strip, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["style"] });
      } catch (error) {}
    }
    scheduleHomeOverflowClearance(strip);
  }

  function reseatSurfaceChrome() {
    chromeWatch.queued = false;
    if (!committed || gesture) return;
    chromeWatch.busy = true;
    try {
      committed.surfaces.forEach(function (surface) {
        if (!surface.visible) return;
        var record = surfaceRegistry[surface.surface_instance_id];
        if (!record || !record.element || !record.element.isConnected) return;
        if (surface.surface_kind === "editor_panel") {
          ensureBrowserTab(surface.surface_instance_id, record.element);
          enrolHomeOverflowSafety(record.element);
        }
        attachSurfaceControls(surface);
        syncCollapseControl(surface, record.element);
      });
    } finally {
      chromeWatch.busy = false;
    }
  }

  function queueChromeReseat() {
    if (chromeWatch.queued || chromeWatch.busy) return;
    chromeWatch.queued = true;
    requestAnimationFrame(reseatSurfaceChrome);
  }

  function watchSurfaceChrome() {
    if (typeof MutationObserver !== "function") return;
    if (!chromeWatch.observer) {
      chromeWatch.observer = new MutationObserver(function (records) {
        if (chromeWatch.busy || gesture) return;
        for (var i = 0; i < records.length; i += 1) {
          var target = records[i].target;
          /* ignore our own re-seating and the lifted drag clone */
          if (target && target.closest && target.closest("[data-pm-home-lifted]")) continue;
          queueChromeReseat();
          return;
        }
      });
    }
    chromeWatch.observer.disconnect();
    chromeWatch.watched = [];
    Object.keys(surfaceRegistry).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element || !element.isConnected) return;
      chromeWatch.observer.observe(element, { childList: true, subtree: true });
      chromeWatch.watched.push(id);
    });
  }

  function init() {
    root = document.getElementById("pm-home-workspace");
    grid = document.getElementById("pm-home-host-grid");
    if (!root || !grid || !mountWorkspace()) return;
    captureBrowserChrome();
    committed = readLayout();
    committed = demoteFloatingAtBoot(committed);
    restoreOwnerRefs(committed);
    syncFactoryEditorProjection();
    restoreFocusSequence(committed);
    installTitlebarHomeControl();
    installFileManagerOpenTargets();
    installSettingsReset();
    wireMenus();
    wireActions();
    document.querySelectorAll(".pane-header-drag").forEach(function (legacyHandle) { legacyHandle.draggable = false; });
    watchSurfaceChrome();
    /* Escape cancels a POINTER drag too. The handle's own keydown only fires
       while it holds focus, which a pointer drag does not guarantee. */
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !gesture) return;
      if (gesture.kind === "move") { event.preventDefault(); finishDrag(false); }
      else if (gesture.kind === "workgroup") { event.preventDefault(); finishWorkgroupDrag(false); }
      else if (gesture.kind === "resize") { event.preventDefault(); cancelResizeGesture(); }
    }, true);
    /* Workgroup drags ride these document listeners. Surface MOVE drags do
       NOT: beginDrag installs its own window-level capture listeners, and
       running both meant every pointermove was processed twice. */
    document.addEventListener("pointermove", function (event) { updateWorkgroupDrag(event); }, { passive: false });
    document.addEventListener("pointerup", function (event) {
      if (gesture && gesture.kind === "workgroup" && gesture.pointerId === event.pointerId) finishWorkgroupDrag(true);
    });
    document.addEventListener("pointercancel", function () {
      if (gesture && gesture.kind === "workgroup") finishWorkgroupDrag(false);
      else if (gesture && gesture.kind === "resize") cancelResizeGesture();
    });
    window.addEventListener("blur", function (event) {
      /* Capture-phase, so ELEMENT blurs pass through here too. Only a blur of
         the window itself cancels: beginDrag hides the dragged surface, which
         blurs a focused grip inside it, and that element blur used to kill
         the drag on frame one (a drag begun on a focused grip -- chat's
         out-of-the-box state -- cancelled instantly). */
      if (event && event.target !== window) return;
      if (gesture && gesture.kind === "move") finishDrag(false);
      else if (gesture && gesture.kind === "workgroup") finishWorkgroupDrag(false);
      else if (gesture && gesture.kind === "resize") cancelResizeGesture();
    }, true);
    window.addEventListener("resize", function () {
      if (!gesture && committed) { normalizeMainRowBases(committed); syncHostGeometry(committed); }
    });
    /* One render, inside DOMContentLoaded, before first paint. The old 250ms
       and 1000ms catch-up renders caused a visible double relayout at boot;
       late PM6 rebuilds are chromeWatch's job now. */
    renderLayout(committed);
    queueChromeReseat();
    window.PM_HOME_WORKSPACE = api;
  }

  var api = {
    schema_id: "pm.home_workspace_layout.v1",
    storage_key: STORAGE_KEY,
    hosts: HOSTS.slice(),
    editor_panel_ids: EDITOR_IDS.slice(),
    get layout() { return clone(committed); },
    get draft_layout() { return gesture ? clone(gesture.draft) : null; },
    get surface_registry() {
      var out = {};
      Object.keys(surfaceRegistry).forEach(function (id) { out[id] = { id: surfaceRegistry[id].id, kind: surfaceRegistry[id].kind, element_id: surfaceRegistry[id].element && surfaceRegistry[id].element.id }; });
      return out;
    },
    get host_registries() { return clone(hostRegistries); },
    get terminal_workgroups() { return clone(terminalSections); },
    get active_terminal_section_id() { return activeTerminalSectionId; },
    get command_log() { return clone(commandLog); },
    get event_log() { return clone(eventLog); },
    get receipt_log() { return clone(receiptLog); },
    get metrics() { return clone(metrics); },
    get browser() { return clone(browserOwner); },
    get identities() { return identitySnapshot(); },
    identityIntegrity: identityIntegrity,
    openPanel: openPanel,
    closePanel: closePanel,
    setSurfaceVisible: setSurfaceVisible,
    moveSurface: moveSurface,
    popOutPanel: popOutPanel,
    popOutChat: popOutChat,
    moveWorkgroup: function (host) { return moveWorkgroupToHost(host || "home_main", null); },
    setCollapsed: setSurfaceCollapsed,
    reset: resetLayout,
    openBrowser: openBrowser,
    openFileInPanel: openFileInPanel,
    splitTerminalPane: splitTerminalPane,
    setTerminalPaneCount: setTerminalPaneCount,
    validate: function (value) { return validateLayout(value || committed); },
    recover: function (reason) {
      var next = normalizeLayout(null, reason || "manual_recovery");
      next.layout_revision = committed.layout_revision;
      return commitLayout(next, "recovery", "cmd.workspace_layout.reset", { affected_surface_instance_ids: next.surfaces.map(function (surface) { return surface.surface_instance_id; }) });
    },
    failNextPersistenceWrite: function () { faults.failNextWrite = true; },
    beginDrag: beginDrag,
    updateDrag: updateDrag,
    commitDrop: function () { finishDrag(true); },
    cancelDrag: function () { finishDrag(false); },
    beginResize: beginResize,
    resizeSurface: resizeSurface,
    updateResize: updateResize,
    commitResize: finishResize,
    cancelResize: cancelResizeGesture
  };

  function safeInit() {
    try { init(); }
    catch (error) {
      window.PM_HOME_INIT_ERROR = { name: String(error && error.name || "Error"), message: String(error && error.message || error) };
      try { console.error("[pm-home] initialization failed", error); } catch (ignored) {}
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safeInit);
  else setTimeout(safeInit, 0);
})();
