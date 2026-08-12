/* ============================================================================
   Kimi K3 — left-of-Chat artifact workspace (window.K3ArtifactWS).

   ONE shared surface element + controller, reused by every window adapter:
   K3ArtifactWS.surface(ctx) creates the element on first call and returns
   the SAME element on every later call. The surface shows a switcher strip
   (artifact chips: kind icon + status dot + title), a title + version/source
   line, an actions overflow menu (Open in editor tab — the pre-existing
   store `openTabs` path — Copy link, Close), and a body rendered by kind:
   code/file (mono numbered lines), diff (aligned +/- rows), image (SVG
   placeholder frame), report (prose).

   Per-artifact states: 'loading' (spinner — resolved ONLY by an external
   K3Demo call, never by a timer), 'ready', 'updated' (Updated badge +
   flash; flash suppressed under reduced motion), 'error' (message + Retry
   -> loading). Switch swaps the body with a short animation.

   CONTEXT RULE: opening an artifact NEVER injects its content into model
   context. The Context Lens admission receipt lists only explicitly
   admitted items; an open artifact is not one of them.

   GEOMETRY CONTRACT (enforced by the window adapters, not here): the
   surface is a plain block element; the WINDOW owns placement. The chat
   slot must stay >= 300px at 520 total width, and this surface must never
   overlap [data-k3-slot="thread"] or [data-k3-slot="composer"] rects
   (probe-asserted in the harness).

   State persists per thread in the store slice artifactWs.<tid> =
   {open, activeId, order, docked}; every mutation emits
   'artifact-ws-changed'. css prefix k3aw-. No emoji, no timers.
   ========================================================================== */
(function () {
  'use strict';

  var el = null;          // the ONE shared surface element
  var els = null;         // cached sub-element refs
  // ctx from the first surface() call. Safe as a page-lifetime binding:
  // host.html creates exactly one boot ctx (K3.makeCtx()) and every
  // window/thread remount reuses it — ctx.on/off and ctx.store are the
  // global emitter/store, never per-mount instances.
  var surfaceCtx = null;
  var subscribed = false;

  function store() { return window.K3Store; }
  function data() { return window.K3Data; }
  function icon(name) { return window.K3Icons.get(name); }
  function reduced() { return window.K3 && window.K3.motionReduced && window.K3.motionReduced(); }
  function emitWs(tid, artifactId, open) {
    if (window.K3 && typeof window.K3.emit === 'function') {
      window.K3.emit('data', { type: 'artifact-ws-changed', threadId: tid, artifactId: artifactId, open: open });
    }
  }
  function wsState(tid) {
    var s = store().get('artifactWs.' + tid, null);
    if (!s || typeof s !== 'object') s = { open: false, activeId: null, order: [], docked: false };
    if (!Array.isArray(s.order)) s.order = [];
    return s;
  }
  function writeWs(tid, s, artifactId) {
    store().set('artifactWs.' + tid, s);
    emitWs(tid, artifactId != null ? artifactId : s.activeId, s.open);
  }
  function artifactOf(tid, artifactId) {
    var t = data().thread(tid);
    var list = (t && Array.isArray(t.artifacts)) ? t.artifacts : [];
    for (var i = 0; i < list.length; i++) if (list[i].id === artifactId) return list[i];
    return null;
  }
  function artifactsOf(tid) {
    var t = data().thread(tid);
    return (t && Array.isArray(t.artifacts)) ? t.artifacts : [];
  }
  function kindIcon(kind) {
    if (kind === 'diff') return 'diff';
    if (kind === 'code' || kind === 'file') return 'source';
    if (kind === 'report' || kind === 'document') return 'draft';
    return 'artifact'; // image + fallback
  }

  /* --- fixture bodies (deterministic; demo content, not fetched) ------------ */
  var CODE_LINES = [
    "import { useMemo, useState } from 'react';",
    "import { ProviderRail } from './ProviderRail';",
    "import { RouteRows } from './RouteRows';",
    "import { SetupStateLine } from './SetupStateLine';",
    "import type { ProviderRoute, RouteStatus } from './provider-routes';",
    '',
    'type PickerProps = {',
    '  routes: ProviderRoute[];',
    '  favorites: string[];',
    '  recents: string[];',
    '  onSelect: (routeKey: string) => void;',
    '  onToggleFavorite: (routeKey: string) => void;',
    '};',
    '',
    'export function ProviderSettings(props: PickerProps) {',
    "  const [query, setQuery] = useState('');",
    "  const [providerId, setProviderId] = useState<string | null>(null);",
    '',
    '  const visible = useMemo(() => {',
    '    return props.routes.filter((route) => {',
    '      if (providerId && route.providerId !== providerId) return false;',
    '      if (!query) return true;',
    '      const hay = `${route.providerName} ${route.accountLabel} ${route.modelLabel}`;',
    '      return hay.toLowerCase().includes(query.toLowerCase());',
    '    });',
    '  }, [props.routes, providerId, query]);',
    '',
    '  return (',
    '    <section className="provider-settings" aria-label="Provider settings">',
    '      <ProviderRail',
    '        selected={providerId}',
    '        onSelect={setProviderId}',
    '      />',
    '      <div className="provider-settings-main">',
    '        <input',
    '          value={query}',
    '          onChange={(e) => setQuery(e.target.value)}',
    '          placeholder="Search routes"',
    '        />',
    '        <RouteRows routes={visible} onSelect={props.onSelect} />',
    '        <SetupStateLine routes={visible} />',
    '      </div>',
    '    </section>',
    '  );',
    '}'
  ];

  var DIFF_FILES = [
    {
      path: 'Concepts/settings/ProviderSettings.tsx', added: 214, removed: 96,
      rows: [
        { t: 'ctx', text: "import { useMemo, useState } from 'react';" },
        { t: 'del', text: "import { ModelDropdown } from './ModelDropdown';" },
        { t: 'add', text: "import { ProviderRail } from './ProviderRail';" },
        { t: 'add', text: "import { RouteRows } from './RouteRows';" },
        { t: 'ctx', text: '' },
        { t: 'del', text: 'export function ProviderSettings() {' },
        { t: 'add', text: 'export function ProviderSettings(props: PickerProps) {' },
        { t: 'add', text: "  const [providerId, setProviderId] = useState<string | null>(null);" }
      ]
    },
    {
      path: 'Concepts/settings/provider-routes.ts', added: 88, removed: 12,
      rows: [
        { t: 'ctx', text: 'export type RouteStatus =' },
        { t: 'del', text: "  | 'ok' | 'unavailable';" },
        { t: 'add', text: "  | 'ok'" },
        { t: 'add', text: "  | 'api-key-required'" },
        { t: 'add', text: "  | 'sign-in-required'" },
        { t: 'add', text: "  | 'cli-not-found'" },
        { t: 'add', text: "  | 'update-available'" },
        { t: 'add', text: "  | 'unavailable';" }
      ]
    },
    {
      path: 'docs/provider-settings.md', added: 47, removed: 0,
      rows: [
        { t: 'add', text: '# Provider Settings redesign' },
        { t: 'add', text: '' },
        { t: 'add', text: 'The picker presents provider, account, and model as one route.' },
        { t: 'add', text: 'Unavailable routes stay visible with an honest reason line.' }
      ]
    }
  ];

  var REPORT_PARAS = [
    'Verification pass over the provider/account/model route picker. Forty-one assertions across two suites; all pass at 520, 750, 975, and 1200 widths under every bundled theme.',
    'The rail filter narrows routes without remounting the list. Favorites persist across a simulated restart; recents cap at eight with the most recent first.',
    'Material route warnings appear before any provider-boundary switch and offer Continue here, Branch with new model, Start new chat, and Cancel. The prompt-cache restart consequence leads the card.',
    'Residual: the Ollama route remains blocked until the CLI is installed; the setup state line deep-links into Provider Settings as designed.'
  ];

  /* --- body renderers -------------------------------------------------------- */
  function renderCode(body) {
    var wrap = document.createElement('div');
    wrap.className = 'k3aw-code';
    CODE_LINES.forEach(function (line, i) {
      var row = document.createElement('div');
      row.className = 'k3aw-code-row';
      var no = document.createElement('span');
      no.className = 'k3aw-code-no';
      no.textContent = String(i + 1);
      var tx = document.createElement('span');
      tx.className = 'k3aw-code-tx';
      tx.textContent = line === '' ? ' ' : line;
      row.appendChild(no);
      row.appendChild(tx);
      wrap.appendChild(row);
    });
    body.appendChild(wrap);
  }

  function renderDiff(body) {
    var wrap = document.createElement('div');
    wrap.className = 'k3aw-diff';
    DIFF_FILES.forEach(function (f) {
      var head = document.createElement('div');
      head.className = 'k3aw-diff-file';
      var path = document.createElement('span');
      path.className = 'k3aw-diff-path';
      path.textContent = f.path;
      var counts = document.createElement('span');
      counts.className = 'k3aw-diff-counts';
      var plus = document.createElement('span');
      plus.className = 'k3aw-diff-plus';
      plus.textContent = '+' + f.added;
      var minus = document.createElement('span');
      minus.className = 'k3aw-diff-minus';
      minus.textContent = '-' + f.removed;
      counts.appendChild(plus);
      counts.appendChild(minus);
      head.appendChild(path);
      head.appendChild(counts);
      wrap.appendChild(head);
      f.rows.forEach(function (r) {
        var row = document.createElement('div');
        row.className = 'k3aw-diff-row is-' + r.t;
        var sign = document.createElement('span');
        sign.className = 'k3aw-diff-sign';
        sign.textContent = r.t === 'add' ? '+' : (r.t === 'del' ? '-' : ' ');
        var tx = document.createElement('span');
        tx.className = 'k3aw-diff-tx';
        tx.textContent = r.text === '' ? ' ' : r.text;
        row.appendChild(sign);
        row.appendChild(tx);
        wrap.appendChild(row);
      });
    });
    body.appendChild(wrap);
  }

  function renderImage(body, artifact) {
    var wrap = document.createElement('div');
    wrap.className = 'k3aw-image';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 180');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', artifact.title || 'test screenshot');
    svg.innerHTML =
      '<rect x="1" y="1" width="318" height="178" rx="6" class="k3aw-image-frame"/>' +
      '<rect x="16" y="16" width="120" height="10" rx="3" class="k3aw-image-block"/>' +
      '<rect x="16" y="36" width="288" height="8" rx="3" class="k3aw-image-block is-soft"/>' +
      '<rect x="16" y="52" width="240" height="8" rx="3" class="k3aw-image-block is-soft"/>' +
      '<rect x="16" y="76" width="140" height="88" rx="4" class="k3aw-image-block"/>' +
      '<rect x="168" y="76" width="136" height="40" rx="4" class="k3aw-image-block is-soft"/>' +
      '<rect x="168" y="124" width="136" height="40" rx="4" class="k3aw-image-block is-soft"/>';
    var cap = document.createElement('div');
    cap.className = 'k3aw-image-cap';
    cap.textContent = 'test screenshot';
    wrap.appendChild(svg);
    wrap.appendChild(cap);
    body.appendChild(wrap);
  }

  function renderReport(body) {
    var wrap = document.createElement('div');
    wrap.className = 'k3aw-report';
    REPORT_PARAS.forEach(function (p) {
      var para = document.createElement('p');
      para.textContent = p;
      wrap.appendChild(para);
    });
    body.appendChild(wrap);
  }

  function renderLoading(body) {
    var wrap = document.createElement('div');
    wrap.className = 'k3aw-state k3aw-loading';
    var spin = document.createElement('span');
    spin.className = 'k3aw-spinner';
    spin.setAttribute('aria-hidden', 'true');
    var label = document.createElement('span');
    label.className = 'k3aw-state-label';
    label.textContent = 'Loading artifact…';
    wrap.appendChild(spin);
    wrap.appendChild(label);
    body.appendChild(wrap);
  }

  function renderError(body, tid, artifact) {
    var wrap = document.createElement('div');
    wrap.className = 'k3aw-state k3aw-error';
    var label = document.createElement('div');
    label.className = 'k3aw-state-label';
    label.textContent = 'The artifact could not be loaded.';
    var hint = document.createElement('div');
    hint.className = 'k3aw-state-hint';
    hint.textContent = 'The source moved while the workspace was closed.';
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'k3-btn k3aw-retry';
    retry.setAttribute('data-testid', 'k3aw-retry');
    retry.textContent = 'Retry';
    retry.addEventListener('click', function () {
      K3ArtifactWS.setStatus(tid, artifact.id, 'loading');
    });
    wrap.appendChild(label);
    wrap.appendChild(hint);
    wrap.appendChild(retry);
    body.appendChild(wrap);
  }

  /* --- surface --------------------------------------------------------------- */
  function build(ctx) {
    var root = document.createElement('section');
    root.className = 'k3aw-surface';
    root.setAttribute('data-testid', 'k3aw-surface');
    root.setAttribute('aria-label', 'Artifact workspace');

    var switcher = document.createElement('div');
    switcher.className = 'k3aw-switcher';
    switcher.setAttribute('role', 'tablist');

    var head = document.createElement('header');
    head.className = 'k3aw-head';
    var headtext = document.createElement('div');
    headtext.className = 'k3aw-headtext';
    var title = document.createElement('div');
    title.className = 'k3aw-title';
    var meta = document.createElement('div');
    meta.className = 'k3aw-meta';
    headtext.appendChild(title);
    headtext.appendChild(meta);
    var badge = document.createElement('span');
    badge.className = 'k3aw-updated';
    badge.hidden = true;
    badge.textContent = 'Updated';
    var actions = document.createElement('button');
    actions.type = 'button';
    actions.className = 'k3-icon-btn k3aw-actionsbtn';
    actions.setAttribute('data-testid', 'k3aw-actions');
    actions.setAttribute('aria-label', 'Artifact actions');
    actions.appendChild(icon('more'));
    head.appendChild(headtext);
    head.appendChild(badge);
    head.appendChild(actions);

    var body = document.createElement('div');
    body.className = 'k3aw-body k3-scroll';

    root.appendChild(switcher);
    root.appendChild(head);
    root.appendChild(body);

    actions.addEventListener('click', function () {
      var tid = store().get('activeThreadId', null);
      var ws = tid ? wsState(tid) : null;
      var artifact = ws && ws.activeId ? artifactOf(tid, ws.activeId) : null;
      if (!artifact) return;
      window.K3UI.menu(actions, [
        {
          label: 'Open in editor tab', icon: 'external', testid: 'k3aw-open-tab',
          action: function () {
            // the pre-packet handoff path: fake editor tab via store openTabs
            var tabs = store().get('openTabs', []);
            if (!Array.isArray(tabs)) tabs = [];
            var exists = tabs.some(function (t) { return t && t.id === artifact.id; });
            if (!exists) {
              store().set('openTabs', tabs.concat([{
                id: artifact.id,
                title: artifact.title || artifact.id,
                kind: 'artifact',
                projectPath: artifact.projectPath || '',
                target: 'editor tab'
              }]));
            }
          }
        },
        {
          label: 'Copy link', icon: 'copy', testid: 'k3aw-copy-link',
          action: function () {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText('k3://artifact/' + tid + '/' + artifact.id);
              }
            } catch (e) { /* clipboard unavailable (file:// etc.) */ }
          }
        },
        { type: 'separator' },
        {
          label: 'Close', icon: 'close', testid: 'k3aw-close',
          action: function () { K3ArtifactWS.close(ctx, tid); }
        }
      ], {});
    });

    els = { root: root, switcher: switcher, title: title, meta: meta, badge: badge, body: body };
    return root;
  }

  function render(ctx) {
    if (!el) return;
    var tid = store().get('activeThreadId', null);
    var ws = tid ? wsState(tid) : { open: false, activeId: null, order: [] };
    var artifacts = tid ? artifactsOf(tid) : [];
    var active = ws.activeId ? artifactOf(tid, ws.activeId) : null;

    el.classList.toggle('is-open', !!(ws.open && active));

    // switcher strip
    els.switcher.textContent = '';
    artifacts.forEach(function (a) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'k3aw-chip' + (active && a.id === active.id ? ' is-active' : '');
      chip.setAttribute('role', 'tab');
      chip.setAttribute('aria-selected', active && a.id === active.id ? 'true' : 'false');
      chip.setAttribute('data-testid', 'k3aw-chip-' + a.id);
      var ic = document.createElement('span');
      ic.className = 'k3aw-chip-icon';
      ic.appendChild(icon(kindIcon(a.kind)));
      var tx = document.createElement('span');
      tx.className = 'k3aw-chip-title';
      tx.textContent = a.title || a.id;
      var dot = document.createElement('span');
      dot.className = 'k3aw-dot is-' + (a.status || 'ready');
      dot.setAttribute('aria-hidden', 'true');
      chip.appendChild(ic);
      chip.appendChild(tx);
      chip.appendChild(dot);
      chip.addEventListener('click', function () {
        K3ArtifactWS.switchTo(ctx, tid, a.id);
      });
      els.switcher.appendChild(chip);
    });

    // head
    if (ws.open && active) {
      els.title.textContent = active.title || active.id;
      els.meta.textContent = 'v1 · ' + (active.projectPath || 'workspace artifact');
      els.badge.hidden = active.status !== 'updated';
    } else {
      els.title.textContent = 'Artifact workspace';
      els.meta.textContent = artifacts.length ? 'Open an artifact from the thread' : 'No artifacts in this thread';
      els.badge.hidden = true;
    }

    // body
    els.body.textContent = '';
    if (!ws.open || !active) {
      var empty = document.createElement('div');
      empty.className = 'k3aw-state k3aw-empty';
      empty.textContent = artifacts.length
        ? 'Pick an artifact above to view it here.'
        : 'Artifacts created in this thread appear here, left of the chat.';
      els.body.appendChild(empty);
      return;
    }
    var status = active.status || 'ready';
    if (status === 'loading') {
      renderLoading(els.body);
    } else if (status === 'error') {
      renderError(els.body, tid, active);
    } else if (active.kind === 'diff') {
      renderDiff(els.body);
    } else if (active.kind === 'image') {
      renderImage(els.body, active);
    } else if (active.kind === 'report' || active.kind === 'document') {
      renderReport(els.body);
    } else {
      renderCode(els.body);
    }
    if (status === 'updated' && !reduced()) {
      // one-shot flash; removed by the animation's own end event (no timers)
      els.body.classList.add('k3aw-flash');
      els.body.addEventListener('animationend', function () {
        els.body.classList.remove('k3aw-flash');
      }, { once: true });
    }
  }

  function subscribe(ctx) {
    if (subscribed) return;
    subscribed = true;
    function onData(evt) {
      if (evt && evt.type === 'artifact-ws-changed') render(ctx);
    }
    ctx.on('data', onData);
    ctx.store.subscribe('artifactWs', function () { render(ctx); });
    ctx.store.subscribe('activeThreadId', function () { render(ctx); });
  }

  var K3ArtifactWS = {
    // The ONE shared surface. Same element on every call.
    surface: function (ctx) {
      if (!el) {
        surfaceCtx = ctx;
        el = build(ctx);
        subscribe(ctx);
        render(ctx);
      }
      return el;
    },

    open: function (ctx, tid, artifactId) {
      if (!tid || !artifactOf(tid, artifactId)) return false;
      var ws = wsState(tid);
      ws.open = true;
      ws.activeId = artifactId;
      if (ws.order.indexOf(artifactId) < 0) ws.order.push(artifactId);
      writeWs(tid, ws, artifactId);
      render(ctx);
      return true;
    },

    close: function (ctx, tid) {
      if (!tid) return false;
      var ws = wsState(tid);
      if (!ws.open) return false;
      ws.open = false;
      writeWs(tid, ws, ws.activeId);
      render(ctx);
      return true;
    },

    switchTo: function (ctx, tid, artifactId) {
      if (!tid || !artifactOf(tid, artifactId)) return false;
      var ws = wsState(tid);
      var changed = ws.activeId !== artifactId;
      ws.open = true;
      ws.activeId = artifactId;
      if (ws.order.indexOf(artifactId) < 0) ws.order.push(artifactId);
      writeWs(tid, ws, artifactId);
      render(ctx);
      if (changed && el && !reduced()) {
        els.body.classList.add('k3aw-swap');
        els.body.addEventListener('animationend', function () {
          els.body.classList.remove('k3aw-swap');
        }, { once: true });
      }
      return true;
    },

    // status: 'loading' | 'ready' | 'updated' | 'error'. Loading resolves ONLY
    // via an external K3Demo call — no timers here.
    setStatus: function (tid, artifactId, status) {
      var artifact = artifactOf(tid, artifactId);
      if (!artifact) return false;
      artifact.status = status;
      emitWs(tid, artifactId, wsState(tid).open);
      if (el && surfaceCtx) render(surfaceCtx);
      return true;
    }
  };

  window.K3ArtifactWS = K3ArtifactWS;
})();
