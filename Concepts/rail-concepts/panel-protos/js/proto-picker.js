/* =====================================================================
   proto-picker.js — orchestrates the prototype.
   - loads the active design's CSS + renderer
   - renders the active design+panel into #panelHost
   - wires design picker / panel picker / width toggle / theme menu / activity bar
   Designs register themselves: window.PROTO_DESIGNS[id] = { meta, render(panel) }
   Slint note: the picker itself is dev-only; each design becomes its own
   .slint component module and the chosen one is compiled in.
   ===================================================================== */
(function () {
  'use strict';

  var DESIGNS = [
    { id: 'A', css: 'designs/A-progressive/design.css',  name: 'Progressive' },
    { id: 'B', css: 'designs/B-segmented/design.css',    name: 'Segmented' },
    { id: 'C', css: 'designs/C-command-rail/design.css', name: 'Command-Rail' },
    { id: 'D', css: 'designs/D-timeline/design.css',     name: 'Timeline' },
    { id: 'E', css: 'designs/E-dense-kv/design.css',     name: 'Dense KV' },
    { id: 'F', css: 'designs/F-floating/design.css',     name: 'Floating' }
  ];

  var state = {
    design: 'A',
    panel: 'search',
    width: 260,
    density: 'sparse'
  };

  var WIDTHS = [220, 260, 320, 480];
  var DENSITIES = ['sparse', 'realistic', 'extreme'];

  /* ---- CSS loader (idempotent) ---- */
  var loadedCss = {};
  function loadCss(href) {
    if (loadedCss[href]) return;
    loadedCss[href] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /* ---- design script loader (renders must be registered before render()) ---- */
  var loadedScripts = {};
  function loadScript(src, cb) {
    if (loadedScripts[src]) { if (cb) cb(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { loadedScripts[src] = true; if (cb) cb(); };
    s.onerror = function () { console.error('failed to load', src); };
    document.body.appendChild(s);
  }

  function getDesign(designId) {
    return window.PROTO_DESIGNS && window.PROTO_DESIGNS[designId];
  }

  function render() {
    var host = document.getElementById('panelHost');
    if (!host) return;
    var d = getDesign(state.design);
    if (!d) {
      host.innerHTML = '<div class="cs-placeholder"><p>Loading design ' + state.design + '…</p></div>';
      return;
    }
    var html;
    try {
      html = d.render(state.panel);
    } catch (e) {
      html = '<div class="cs-placeholder"><p>Error rendering design ' + state.design + ' / ' + state.panel + ': ' + (e.message || e) + '</p></div>';
      console.error(e);
    }
    host.innerHTML = html;
    host.scrollTop = 0;
    // assign stagger index to list rows for the entrance cascade (proto-polish.css).
    // Selector list MUST match the actual list/row classes each design emits.
    try {
      var rows = host.querySelectorAll('.pa-list>.pa-row,.pb-list>.pb-row,.pc-list>.pc-row,.pt-spine>.pt-entry,.pk-list>.pk-row,.pf-list>.pf-row');
      for (var i = 0; i < Math.min(rows.length, 10); i++) {
        rows[i].style.setProperty('--proto-i', i);
      }
    } catch (e) {}
    // update design token so design CSS can gate on it
    document.documentElement.style.setProperty('--proto-design', "'" + state.design + "'");
    // tell the sprout engine to re-bind nothing (delegation handles it)
    updateChrome();
  }

  function ensureDesignLoaded(designId, cb) {
    var meta = DESIGNS.find(function (d) { return d.id === designId; });
    if (!meta) { if (cb) cb(); return; }
    loadCss(meta.css);
    var jsPath = meta.css.replace('design.css', 'design.js');
    loadScript(jsPath, function () {
      // design registered now; render
      if (cb) cb();
    });
  }

  function switchDesign(designId) {
    if (designId === state.design) return;
    state.design = designId;
    document.getElementById('panelHost').innerHTML =
      '<div class="cs-placeholder"><p>Loading design ' + designId + '…</p></div>';
    ensureDesignLoaded(designId, render);
  }

  function switchPanel(panelId) {
    state.panel = panelId;
    // activity bar active state
    document.querySelectorAll('.ab-icon[data-panel]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-panel') === panelId);
    });
    render();
  }

  function setWidth(w) {
    state.width = w;
    var slot = document.getElementById('sidePanelSlot');
    if (slot) {
      slot.style.width = w + 'px';
      slot.style.flex = '0 0 ' + w + 'px';
    }
    document.querySelectorAll('.pc-btn[data-width]').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.getAttribute('data-width'), 10) === w);
    });
    // emit event for designs that need to re-measure
    document.dispatchEvent(new CustomEvent('proto:resize', { detail: { width: w } }));
  }

  function setDensity(mode) {
    if (DENSITIES.indexOf(mode) < 0) return;
    state.density = mode;
    if (window.PROTO_DATA) window.PROTO_DATA.setDensity(mode);
    document.querySelectorAll('.pc-btn[data-density]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-density') === mode);
    });
    // re-render so the new volume shows immediately
    render();
  }

  function updateChrome() {
    // design buttons
    document.querySelectorAll('.pc-btn[data-design]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-design') === state.design);
    });
    // panel buttons
    document.querySelectorAll('.pc-btn[data-panel]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-panel') === state.panel);
    });
    // panel title
    var titleEl = document.getElementById('panelTitle');
    if (titleEl) {
      var meta = window.PROTO_DATA.PANEL_META[state.panel];
      titleEl.textContent = meta ? meta.label : state.panel;
    }
  }

  function toast(msg) {
    var t = document.getElementById('protoToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---- theme menu callback (selected by sprout engine) ---- */
  window.protoSelectTheme = function (item) {
    var v = item.getAttribute('data-theme-value');
    if (window.PROTO_THEME) window.PROTO_THEME.set(v);
  };

  /* ---- generic select callbacks for in-panel sprout menus ---- */
  window.protoSelectGeneric = function (item, wrap) {
    var val = item.getAttribute('data-value');
    var label = item.querySelector('.pm6-mi-label');
    var labelText = label ? label.textContent : (item.textContent || '');
    var labelTarget = wrap && wrap.getAttribute('data-label-target');
    if (labelTarget) {
      var lt = document.getElementById(labelTarget);
      if (lt) lt.textContent = labelText;
    }
    var action = wrap && wrap.getAttribute('data-action');
    if (action) toast(action + ' → ' + (val || labelText));
  };

  function wireChrome() {
    // design picker
    document.querySelectorAll('.pc-btn[data-design]').forEach(function (el) {
      el.addEventListener('click', function () { switchDesign(el.getAttribute('data-design')); });
    });
    // panel picker
    document.querySelectorAll('.pc-btn[data-panel]').forEach(function (el) {
      el.addEventListener('click', function () { switchPanel(el.getAttribute('data-panel')); });
    });
    // activity bar
    document.querySelectorAll('.ab-icon[data-panel]').forEach(function (el) {
      el.addEventListener('click', function () { switchPanel(el.getAttribute('data-panel')); });
    });
    // width toggle
    document.querySelectorAll('.pc-btn[data-width]').forEach(function (el) {
      el.addEventListener('click', function () { setWidth(parseInt(el.getAttribute('data-width'), 10)); });
    });
    // density toggle
    document.querySelectorAll('.pc-btn[data-density]').forEach(function (el) {
      el.addEventListener('click', function () { setDensity(el.getAttribute('data-density')); });
    });
    // activity bar collapse toggle
    var abToggle = document.getElementById('abToggle');
    if (abToggle) {
      abToggle.addEventListener('click', function () {
        var ab = document.getElementById('activityBar');
        if (ab) ab.classList.toggle('collapsed');
      });
    }
    // keyboard: [ and ] to cycle designs, , and . to cycle panels
    document.addEventListener('keydown', function (ev) {
      if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') return;
      var di = DESIGNS.findIndex(function (d) { return d.id === state.design; });
      var panels = window.PROTO_DATA.PANELS;
      var pi = panels.indexOf(state.panel);
      if (ev.key === '[') { switchDesign(DESIGNS[(di + DESIGNS.length - 1) % DESIGNS.length].id); }
      else if (ev.key === ']') { switchDesign(DESIGNS[(di + 1) % DESIGNS.length].id); }
      else if (ev.key === ',') { switchPanel(panels[(pi + panels.length - 1) % panels.length]); }
      else if (ev.key === '.') { switchPanel(panels[(pi + 1) % panels.length]); }
      else if (ev.key === 'd') { var ni = (DENSITIES.indexOf(state.density) + 1) % DENSITIES.length; setDensity(DENSITIES[ni]); }
    });
  }

  function init() {
    wireChrome();
    setWidth(state.width);
    ensureDesignLoaded(state.design, function () {
      switchPanel(state.panel);
    });
  }

  window.PROTO_PICKER = {
    state: state,
    DESIGNS: DESIGNS,
    WIDTHS: WIDTHS,
    DENSITIES: DENSITIES,
    switchDesign: switchDesign,
    switchPanel: switchPanel,
    setWidth: setWidth,
    setDensity: setDensity,
    render: render,
    toast: toast,
    ensureDesignLoaded: ensureDesignLoaded
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
