/* usage-concepts/_shared/usage-chrome.js
   Full-page app shell for every usage concept page. Unlike the rail-concepts
   shell (which hosts a side panel), this hosts the Usage page as the CENTER
   content — exactly where it lives in the real app (title bar with page tabs,
   page filling the middle, status bar below).

   Provides:
   - title bar: monogram, project sprout menu, page tabs (USAGE active), search,
     THEME sprout menu (the canonical PM menu that replaces native selects)
   - center column: the concept's <template id="usage-page"> content
   - status bar: fit harness (page-width control to stress the responsive
     2/3/4-column breakpoints of UF-059) + reduced-motion toggle
   - toasts + a demo-action shim (every [data-demo-action] maps to a command)
   - gallery bridge: a parent page can drive theme / page-width / reduced-motion
     across every open concept at once via postMessage.
*/
(function () {
  'use strict';
  /* Boot-race guard (additive). usage-chrome.js loads BEFORE the widget / tab /
     widget-defs modules, and each concept's trailing inline boot calls
     PMUsageChrome.boot() and THEN reaches for those globals (PMWidgets.mount,
     PMTabs.mount, PMWidgetDefs.register). On a cold load one of those modules
     is occasionally not ready yet, so the inline boot threw "reading
     'register'/'mount'/'boot'" and blanked the page until reload. Pre-install
     inert stubs so a late/failed module can never blank the shell; the real
     modules overwrite these wholesale when they load, so behavior is unchanged
     whenever the modules are present (and U1/U2, which use none of them, are
     untouched). */
  var NOOP_HANDLE = { reset: function () {}, rerender: function () {}, handle: { rerender: function () {} }, items: [] };
  window.PMWidgets = window.PMWidgets || {
    register: function () {}, closeAll: function () {}, items: [],
    mount: function () { return NOOP_HANDLE; }
  };
  window.PMTabs = window.PMTabs || { mount: function () {} };
  window.PMWidgetDefs = window.PMWidgetDefs || {
    VERSION: 0, TYPES: {}, layouts: {}, defaultBoard: [],
    register: function () { return []; }, wireCanvas: function () {}, animateBody: function () {}
  };

  var I = window.PMIcon;
  var MIN_W = 360, DEF_W = 1280, MAX_W = 2600;

  var THEMES = [
    ['friendly-dark', 'Friendly Dark'], ['friendly-light', 'Friendly Light'],
    ['glass-dark', 'Glass Dark'], ['glass-light', 'Glass Light'],
    ['retro-dark', 'Retro Dark'], ['retro-light', 'Retro Light'],
    ['basic-dark', 'Basic Dark'], ['basic-light', 'Basic Light']
  ];
  var PROJECTS = [
    ['tastebook', 'tastebook', 'SvelteKit + Axum + Postgres'],
    ['harbor', 'harbor', 'Next.js + Nest'],
    ['loom', 'loom', 'Rust + Slint']
  ];
  var TABS = ['Home', 'Projects', 'Planning Wizard', 'Orchestrator', 'Usage', 'Settings'];

  var toastStack;
  var themeObs = null;

  /* ---- one-shot scroll reveal ------------------------------------------
     Concept markup opts in with class="pm-rev" (hidden state + .in revealed
     state live in base.css); chrome watches those elements and flips .in the
     first time they enter the viewport, then stops watching — a reveal never
     re-hides. Elements in view at load arrive in one IntersectionObserver
     batch and get a light per-item stagger (--mo-stagger steps, capped) so a
     cold load cascades instead of popping in unison. A MutationObserver
     applies the same rules to .pm-rev nodes concepts add later, and
     PMUsageChrome.observeReveals(root) is the manual hook for anything
     rendered outside document.body. Under reduced motion base.css snaps
     .pm-rev visible, so content is never hidden from those users even before
     the observer runs. Nothing used .pm-rev yet, so this is inert for U1–U9
     until concepts adopt the class. ---------------------------------------- */
  var revIO = null, revMO = null, REV_CAP = 6;
  function revStaggerMs() {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mo-stagger'));
    return isFinite(n) && n > 0 ? n : 24;
  }
  function revealBatch(els) {
    var step = els.length > 1 ? revStaggerMs() : 0;
    els.forEach(function (el, i) {
      if (el.classList.contains('in')) return;
      var d = step ? Math.min(i, REV_CAP - 1) * step : 0;
      if (d) el.style.transitionDelay = d + 'ms';
      el.classList.add('in');
      if (revIO) revIO.unobserve(el);
      el.addEventListener('transitionend', function h(ev) {
        if (ev.target !== el) return;
        el.style.transitionDelay = '';           /* don't leak into hover transitions */
        el.removeEventListener('transitionend', h);
      });
    });
  }
  function observeReveals(root) {
    if (!revIO) return;
    (root || document).querySelectorAll('.pm-rev:not(.in)').forEach(function (el) { revIO.observe(el); });
  }
  function initReveals() {
    if (revIO) return;
    var pending = Array.prototype.slice.call(document.querySelectorAll('.pm-rev:not(.in)'));
    if (!('IntersectionObserver' in window)) {   /* never leave content hidden */
      pending.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    revIO = new IntersectionObserver(function (entries) {
      var hits = [];
      entries.forEach(function (e) { if (e.isIntersecting) hits.push(e.target); });
      if (hits.length) revealBatch(hits);
    }, { threshold: 0.12 });
    pending.forEach(function (el) { revIO.observe(el); });
    revMO = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches('.pm-rev:not(.in)')) revIO.observe(node);
          if (node.querySelectorAll) node.querySelectorAll('.pm-rev:not(.in)').forEach(function (el) { revIO.observe(el); });
        });
      });
    });
    revMO.observe(document.body, { childList: true, subtree: true });
  }
  function toast(msg) {
    if (!toastStack) return;
    var t = document.createElement('div');
    t.className = 'rail-toast';
    t.textContent = msg;
    toastStack.appendChild(t);
    while (toastStack.children.length > 5) toastStack.firstChild.remove();
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 300); }, 3400);
  }
  window.toast = toast;

  function wireDemoActions(root) {
    root.querySelectorAll('[data-demo-action]').forEach(function (el) {
      if (el._demoWired) return;
      el._demoWired = true;
      el.addEventListener('click', function (ev) {
        if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
          var reason = el.getAttribute('data-demo-reason') || 'blocked';
          toast('Blocked: ' + reason + (el.getAttribute('data-demo-arg') ? ' \u2014 ' + el.getAttribute('data-demo-arg') : ''));
          ev.preventDefault();
          return;
        }
        toast(el.getAttribute('data-demo-arg') || el.getAttribute('data-demo-action'));
      });
    });
  }

  function titleBarHTML() {
    var projItems = PROJECTS.map(function (p, i) {
      return '<button type="button" class="pm6-tb-menu-item' + (i === 0 ? ' is-selected' : '') + '" role="menuitem" data-value="' + p[0] + '" data-label="' + p[1] + '" data-demo-action="demo.toast" data-demo-arg="Active project: ' + p[1] + ' (' + p[2] + ')">' + p[1] + '</button>';
    }).join('');
    var themeItems = THEMES.map(function (t, i) {
      return '<button type="button" class="pm6-tb-menu-item' + (i === 0 ? ' is-selected' : '') + '" role="menuitem" data-value="' + t[0] + '" data-label="' + t[1] + '">' + t[1] + '</button>';
    }).join('');
    /* Real <button>s inside <nav aria-label="Pages">: this is app PAGE navigation,
       not an ARIA tabstrip (no tabpanels), so buttons + aria-current are the
       honest semantics — natively focusable and Enter/Space-activatable (fires
       click, which wireDemoActions already handles). Additive/safe for U1/U2. */
    var tabs = TABS.map(function (t) {
      var on = t === 'Usage';
      return '<button type="button" class="tb-page-tab' + (on ? ' active' : '') + '"' +
        (on ? ' aria-current="page"' : ' data-demo-action="demo.toast" data-demo-arg="Page: ' + t + ' (simplified in these concepts)"') + '>' + t + '</button>';
    }).join('');
    return '<header class="title-bar">' +
      '<div class="tb-brand">' + I('pm', 'tb-logo') + '<span class="tb-appname">PUPPET MASTER</span></div>' +
      '<div class="pm6-tb-menu-wrap" id="projectMenuWrap"><button type="button" class="pm6-tb-menu-trigger tb-project-btn" aria-controls="projectMenu">' +
      I('files', 'tb-proj-ico') + '<span class="pm6-tb-menu-label">tastebook</span>' + I('chevD', 'tb-chev') + '</button>' +
      '<div class="pm6-tb-menu pm6-tb-menu-left" id="projectMenu" role="menu" aria-label="Project" data-pm-menu-select>' + projItems + '</div></div>' +
      '<nav class="tb-pages" aria-label="Pages">' + tabs + '</nav>' +
      '<div class="tb-search">' + I('search', 'tb-search-ico') + '<input type="text" placeholder="Search files, commands, settings..." aria-label="Global search"></div>' +
      '<div class="pm6-tb-menu-wrap" id="themeMenuWrap"><button type="button" class="pm6-tb-menu-trigger tb-theme-btn" aria-controls="themeMenu" title="Theme">' +
      '<span class="pm6-tb-menu-label" id="themeMenuLabel">Friendly Dark</span>' + I('chevD', 'tb-chev') + I('spark', 'tb-theme-ico') + '</button>' +
      '<div class="pm6-tb-menu" id="themeMenu" role="menu" aria-label="Theme" data-pm-menu-select>' + themeItems + '</div></div>' +
      '</header>';
  }

  function statusBarHTML() {
    return '<footer class="status-bar">' +
      '<div class="sb-chips" id="sbChips">' +
      '<span class="sb-chip">' + I('branch', 'sb-ico') + 'main</span>' +
      '<span class="sb-chip ok">' + I('search', 'sb-ico') + 'index ready</span>' +
      '<span class="sb-chip dim">' + I('bolt', 'sb-ico') + 'run pcr-47 active</span>' +
      '</div>' +
      '<div class="sb-harness" aria-label="Page width fit-check harness">' +
      '<span class="sb-hlabel">PAGE FIT</span>' +
      '<button type="button" class="sb-preset" data-w="900">900</button>' +
      '<button type="button" class="sb-preset" data-w="1280">1280</button>' +
      '<button type="button" class="sb-preset" data-w="1700">1700</button>' +
      '<button type="button" class="sb-preset" data-w="2200">2200</button>' +
      '<button type="button" class="sb-preset" data-w="2500">2500</button>' +
      '<button type="button" class="sb-preset on" data-w="auto">FILL</button>' +
      '<input type="range" id="sbWidth" min="' + MIN_W + '" max="' + MAX_W + '" value="' + DEF_W + '" step="1" aria-label="Page width">' +
      '<span class="sb-wread" id="sbWRead">1280px</span>' +
      '<span class="sb-vsep"></span>' +
      '<button type="button" class="sb-rm" id="sbRM" title="Toggle reduced motion" aria-pressed="false">' + I('motion', 'sb-ico') + 'MOTION</button>' +
      '</div></footer>';
  }

  /* gallery embed mode: the comparison gallery (index.html) loads each concept
     with ?embed=1 so the card shows the concept, not a page-inside-a-page.
     Only the flag triggers it — a standalone/direct load (no embed param) keeps
     the full title bar + status bar, exactly as before. The chrome is still
     BUILT (theme menu, width harness and demo wiring all stay alive for the
     gallery's postMessage bridge); it is just not rendered. */
  var EMBED = /(\?|&)embed=1(&|$)/.test(window.location.search);
  function applyEmbedMode() {
    if (!EMBED) return;
    document.documentElement.classList.add('pm-embed');
    if (document.getElementById('pmEmbedCss')) return;
    var st = document.createElement('style');
    st.id = 'pmEmbedCss';
    st.textContent = 'html.pm-embed .title-bar,html.pm-embed .status-bar{display:none}';
    document.head.appendChild(st);
  }

  var booted = false;
  function boot(opts) {
    if (booted) return;            /* idempotent: a recovery pass never re-boots */
    booted = true;
    opts = opts || {};
    applyEmbedMode();
    var app = document.getElementById('app');
    var tpl = document.getElementById('usage-page');
    var pageHTML = tpl ? tpl.innerHTML : '';

    app.innerHTML =
      '<div id="glassBg" class="glass-bg" aria-hidden="true"><i class="gb-a"></i><i class="gb-b"></i><i class="gb-c"></i></div>' +
      '<div class="app-shell">' +
      titleBarHTML() +
      '<div class="toast-stack" id="toastStack" role="status" aria-live="polite"></div>' +
      '<div class="us-center" id="usCenter"><div class="us-center-inner" id="usCenterInner">' + pageHTML + '</div></div>' +
      statusBarHTML() +
      '</div>';

    toastStack = document.getElementById('toastStack');
    var centerInner = document.getElementById('usCenterInner');

    /* concept label sits in the status bar (a floating overlay used to cover the
       last row of page content); it rides the same collapse rules as the chips */
    if (opts.badge) {
      var sc = document.getElementById('sbChips');
      if (sc) sc.insertAdjacentHTML('afterbegin',
        '<span class="sb-chip sb-badge"><span class="cb-id">' + opts.badge.id + '</span>' +
        '<span class="cb-name">' + opts.badge.name + '</span><a class="cb-home" href="index.html">all concepts</a></span>');
    }

    /* theme menu */
    document.getElementById('themeMenuWrap').addEventListener('pm-menu-pick', function (ev) {
      var v = ev.detail.value; if (!v) return;
      applyTheme(v);
      try { localStorage.setItem('pm.theme', v); } catch (e) {}
    });
    function syncThemeLabel(t) {
      if (!t) return;
      document.documentElement.style.colorScheme = /-dark$/.test(t) ? 'dark' : 'light';
      var lbl = document.getElementById('themeMenuLabel');
      if (lbl) lbl.textContent = (THEMES.filter(function (x) { return x[0] === t; })[0] || [])[1] || lbl.textContent;
      document.querySelectorAll('#themeMenu [data-value]').forEach(function (it) { it.classList.toggle('is-selected', it.getAttribute('data-value') === t); });
    }
    function applyTheme(t) {
      if (!t) return;
      document.documentElement.setAttribute('data-theme', t);
      syncThemeLabel(t);
    }

    /* page-width harness (stresses the 2/3/4-col responsive breakpoints) */
    var slider = document.getElementById('sbWidth'), read = document.getElementById('sbWRead');
    var curW = 'auto';
    function setW(px, fromSlider) {
      if (px === 'auto' || px === null) { curW = 'auto'; centerInner.style.maxWidth = ''; read.textContent = 'fill'; if (!fromSlider) slider.value = MAX_W; }
      else { px = Math.max(MIN_W, Math.min(px, MAX_W)); curW = px; centerInner.style.maxWidth = px + 'px'; read.textContent = px + 'px'; if (!fromSlider) slider.value = px; }
      document.querySelectorAll('.sb-preset').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-w') === String(curW)); });
    }
    slider.addEventListener('input', function () { setW(parseInt(slider.value, 10), true); });
    document.querySelectorAll('.sb-preset').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-w');
        setW(v === 'auto' ? 'auto' : parseInt(v, 10));
      });
    });

    /* reduced motion */
    document.getElementById('sbRM').addEventListener('click', function () {
      var on = document.documentElement.getAttribute('data-reduced-motion') === '1';
      document.documentElement.setAttribute('data-reduced-motion', on ? '0' : '1');
      this.setAttribute('aria-pressed', String(!on));
      this.classList.toggle('on', !on);
      toast(on ? 'Motion restored' : 'Reduced motion on');
    });

    /* hydrate icons in the injected page */
    app.querySelectorAll('i[data-ico]').forEach(function (el) { el.innerHTML = window.PMIcon(el.getAttribute('data-ico'), el.className); });

    /* generic accordion: [data-collapse] toggles .open on closest [data-acc] */
    document.addEventListener('click', function (ev) {
      var head = ev.target.closest('[data-collapse]');
      if (head && !ev.target.closest('button, a, .pm6-tb-menu-trigger, .pm-minibtn, .us-hbtn')) {
        var acc = head.closest('[data-acc]');
        if (acc) acc.classList.toggle('open');
      }
    });
    /* generic subview tabber: [data-tab] toggles [data-pane] within closest .us-pane-scope (or page) */
    document.addEventListener('click', function (ev) {
      var tab = ev.target.closest('[data-tab]');
      if (!tab) return;
      var scope = tab.closest('.us-pane-scope') || app;
      var name = tab.getAttribute('data-tab');
      scope.querySelectorAll('[data-tab]').forEach(function (t) { t.classList.toggle('active', t === tab); });
      scope.querySelectorAll('[data-pane]').forEach(function (p) { p.classList.toggle('pm-hidden', p.getAttribute('data-pane') !== name); });
    });

    if (window.PMMenu && window.PMMenu.init) window.PMMenu.init();   /* guarded: a late menu.js must not blank the shell */
    wireDemoActions(document);
    initReveals();

    setW('auto');
    /* sync the theme-menu label + is-selected state with the theme the inline
       bootstrap already applied (matters when a non-default theme is stored) */
    applyTheme(document.documentElement.getAttribute('data-theme') || 'friendly-dark');
    /* external paths may flip <html data-theme> without going through applyTheme
       (harnesses, gallery bridge, other shells); keep the label + is-selected in
       step. Additive, single-instance (idempotent) — never touches U1/U2 layout. */
    if (!themeObs) {
      themeObs = new MutationObserver(function () {
        syncThemeLabel(document.documentElement.getAttribute('data-theme'));
      });
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    window.PMUsageShell = { toast: toast, setW: setW, applyTheme: applyTheme, syncThemeLabel: syncThemeLabel, wireDemoActions: wireDemoActions, center: centerInner };

    /* ConceptHub bridge.

       This handled the Hub's legacy pm-setw / pm-theme / pm-rm messages and
       announced itself with pm-ready, but never spoke the current protocol, so
       ConceptHub/validate.py failed every page in this folder for missing
       pm-concept-ready and pm-concept-state support. The two siblings that pass
       the gate do so only by declaring controlMode "internal", which sidesteps
       the check rather than satisfying it. This implements the real contract
       instead — see Concepts/ConceptHub/starter/model-folder/concept-hub-bridge.js
       and the Hub consumer in ConceptHub/assets/app.js. */
    function applyConceptState(state) {
      if (!state || typeof state !== 'object') return;
      var root = document.documentElement;
      if (state.theme) applyTheme(state.theme);
      root.setAttribute('data-reduced-motion', state.reducedMotion ? '1' : '0');
      var rm = document.getElementById('sbRM');
      if (rm) { rm.classList.toggle('on', !!state.reducedMotion); rm.setAttribute('aria-pressed', String(!!state.reducedMotion)); }
      if (typeof state.testWidth === 'number') {
        setW(state.testWidth);
        root.style.setProperty('--hub-test-width', state.testWidth + 'px');
        if (state.widthRole) root.style.setProperty('--hub-' + state.widthRole + '-width', state.testWidth + 'px');
      }
      if (typeof state.viewportWidth === 'number') root.style.setProperty('--hub-viewport-width', state.viewportWidth + 'px');
    }
    window.addEventListener('message', function (e) {
      var d = e.data; if (!d || typeof d !== 'object') return;
      if (d.source === 'pm-concept-hub' && d.type === 'pm-concept-state') { applyConceptState(d.state); return; }
      if (d.type === 'pm-setw' && typeof d.w === 'number') setW(d.w);
      else if (d.type === 'pm-theme') applyTheme(d.theme);
      else if (d.type === 'pm-rm') {
        document.documentElement.setAttribute('data-reduced-motion', d.on ? '1' : '0');
        var b = document.getElementById('sbRM'); if (b) { b.classList.toggle('on', !!d.on); b.setAttribute('aria-pressed', String(!!d.on)); }
      }
    });
    function announceConceptReady() {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'pm-ready' }, '*');
          window.parent.postMessage({
            source: 'pm-concept', type: 'pm-concept-ready', version: 1,
            capabilities: { theme: true, reducedMotion: true, testWidth: true }
          }, '*');
        }
      } catch (_) {}
    }
    announceConceptReady();
  }

  window.PMUsageChrome = { boot: boot, observeReveals: observeReveals };

  /* Self-heal the cold-load race: if a concept's inline boot ran before this
     module existed it threw and never booted, leaving #app empty (blank page).
     Once this module loads, boot the shell ourselves if that happened. The
     booted flag makes this a no-op on every normal load (the inline boot already
     ran), so behavior is unchanged when modules load in order. */
  function recover() {
    if (booted) return;
    if (!document.getElementById('app') || !document.getElementById('usage-page')) return;
    var title = document.title || '';
    var nm = /\u00b7\s*(.+?)\s*\u2014/.exec(title);
    boot({ badge: { id: title.split('\u00b7')[0].trim() || 'Usage', name: nm ? nm[1].trim() : '' } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', recover, { once: true });
  else recover();
  window.addEventListener('load', recover);
})();
