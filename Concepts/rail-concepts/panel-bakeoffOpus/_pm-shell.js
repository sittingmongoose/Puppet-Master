/* PANEL BAKEOFF — harness runtime
   =====================================================================
   Owns: the version registry, the stage renderer, the control bar, the
   resizer, the four view modes, and the per-panel pick map.

   Public surface
     PM_BAKEOFF.register(id, def)   called by each versions/*.js at load
     PM_BAKEOFF.boot()             called once at the bottom of index.html
     PM_BAKEOFF.state              live config (read-only by convention)
     PM_BAKEOFF.setState(patch)    programmatic config change + re-render
     PM_BAKEOFF.stages()           the live .pm-stage elements on screen
     PM_BAKEOFF.showCombo(c)       jump the live stage to one fit-check combo

   A "stage" is a themed subtree: <div class="pm-stage" data-theme=...>. It
   replaces <html> for the design under test. Themes are container-scopable in
   this codebase, so N stages with N themes coexist in one document.
   ===================================================================== */
(function (global) {
  'use strict';

  var D = global.PM_DATA;
  var registry = [];          // [{id, name, blurb, panels, fixes}]
  var byId = {};

  var state = {
    version: 'v0',
    panel: 'search',
    theme: 'friendly-dark',
    width: 380,
    mode: 'single',
    density: 'comfortable',
    motion: 'full',
    glassBg: 'mesh',
    rail: 36,                 // activity bar: 36 (app collapsed) | 48 (spec) | 72 (app expanded)
    compareB: 'v0',
    followA: true
  };

  var picks = {};             // {panelId: versionId}
  var PICK_KEY = 'pm.bakeoff.picks';

  /* ------------------------------------------------------------ utilities */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------- registry */
  function register(id, def) {
    if (byId[id]) { console.warn('[bakeoff] duplicate version id: ' + id); return; }
    var v = {
      id: id,
      name: def.name || id,
      blurb: def.blurb || '',
      panels: def.panels || {},
      /* v0-baseline opts OUT of the shared fixes so the fit checker can prove
         it detects the real, known defects (sub-24px hit targets in all 8
         themes). Every other version opts in. */
      fixes: def.fixes === false ? 'off' : 'on'
    };
    byId[id] = v;
    registry.push(v);
  }

  /* -------------------------------------------------------------- markup */
  var ICONS = {
    files:     '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
    search:    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    source:    '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/><line x1="6" y1="9" x2="6" y2="15"/>',
    git:       '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    docker:    '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    tests:     '<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16.4 9"/>',
    agents:    '<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M9 12.5h.01M15 12.5h.01" stroke-width="2.4"/><path d="M9.5 16h5"/><path d="M3 12v4M21 12v4"/>',
    artifacts: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>'
  };

  function svg(name, size) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 16) + '" height="' + (size || 16) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function activityBarHTML(activePanel, railW) {
    var h = '<nav class="activity-bar' + (railW <= 48 ? ' collapsed' : '') +
            '" aria-label="Activity bar">';
    D.panels.forEach(function (p) {
      h += '<div class="icon' + (p.id === activePanel ? ' active' : '') +
           '" data-ab-id="' + p.id + '" data-pm-tip="' + esc(p.label) + '" role="button" tabindex="0">' +
           '<span class="symbol">' + svg(p.id) + '</span>' +
           '<span class="icon-label">' + esc(p.label.split(' ')[0].toUpperCase()) + '</span></div>';
    });
    return h + '</nav>';
  }

  /* cfg, NOT the module-scope state.
     This bit is load-bearing and was wrong: passing `state` meant that during a
     fit sweep every panel rendered markup keyed to whatever width the CONTROL
     BAR happened to show, and was then laid out in a different box. Every
     width-responsive version was measured against markup built for the wrong
     bucket -- one version reported ~1,900 failures that way and 0 once fixed.
     Any renderer that takes a config must be handed THAT config. */
  function panelHTML(version, panelId, cfg) {
    var v = byId[version];
    if (!v) return emptyPanel('unknown version: ' + version);
    var html = v.panels[panelId];
    if (html == null) {
      return emptyPanel(v.name + ' has no design for "' + panelId + '" yet');
    }
    return typeof html === 'function' ? html(D, cfg || state) : html;
  }

  function emptyPanel(msg) {
    return '<div class="pm-sp-header"><span>NOT BUILT</span></div>' +
      '<div class="pm-sp-content" style="padding:16px">' +
      '<div class="pm-sp-note" style="opacity:.6;font-size:11px;line-height:1.6">' +
      esc(msg) + '</div></div>';
  }

  /* A simplified HOME behind the panel.
     The panel is the subject of this exercise, but judging it against a dashed
     "not under test" box is judging it against nothing: you cannot see how the
     rail reads beside real content, how much of the shell it claims, or where
     the eye lands first. This is a deliberately low-fidelity stand-in for the
     dashboard - real proportions, real theme tokens, no real data - so the
     panel sits in a plausible app instead of a void. It is intentionally
     quieter than the panel and says so in its own footnote. */
  function homeBackdropHTML() {
    var m = [
      ['LANES', D.source.counts ? D.source.counts.worktrees : 8, 'active', 66, ''],
      ['TESTS', D.tests.active ? D.tests.active.passed : 214, 'passed', 92, 'ok'],
      ['DOCKER', (D.docker.containers || []).filter(function (c) {
        return c.status === 'running'; }).length, 'running', 60, ''],
      ['ACTIONS', (D.actions.runs || []).filter(function (r) {
        return r.status === 'failed'; }).length, 'failed', 33, 'err']
    ];
    var cards = m.map(function (c) {
      return '<div class="pm-hg-card"><span class="pm-hg-k">' + c[0] + '</span>' +
        '<span class="pm-hg-v">' + c[1] + '<span class="pm-hg-u"> ' + c[2] + '</span></span>' +
        '<i class="pm-hg-bar ' + c[4] + '" style="--w:' + c[3] + '%"></i></div>';
    }).join('');
    var lines = '';
    for (var i = 0; i < 16; i++) lines += '<i style="--w:' + (26 + ((i * 37) % 60)) + '%"></i>';
    return '<div class="pm-home">' +
      '<div class="pm-hg-head"><span class="pm-hg-title">HOME</span>' +
        '<span class="pm-hg-sub">' + esc(D.project.name) + ' &middot; run #47 in progress</span></div>' +
      '<div class="pm-hg-metrics">' + cards + '</div>' +
      '<div class="pm-hg-editor"><div class="pm-hg-etabs"><i></i><i></i><i class="on"></i></div>' +
        '<div class="pm-hg-lines">' + lines + '</div></div>' +
      '<div class="pm-hg-note">Simplified home backdrop &mdash; the left panel is the subject ' +
        'of these prototypes. Built by Claude Opus.</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------- stage build */
  function buildStage(cfg) {
    var v = byId[cfg.version] || {};
    var stage = el('div', 'pm-stage');
    stage.setAttribute('data-theme', cfg.theme);
    stage.setAttribute('data-glass-bg', cfg.glassBg || 'mesh');
    stage.setAttribute('data-density', cfg.density || 'comfortable');
    stage.setAttribute('data-pm-fixes', v.fixes || 'on');
    if ((cfg.motion || 'full') === 'reduced') stage.setAttribute('data-motion', 'reduced');
    stage.setAttribute('data-pm-version', cfg.version);
    stage.setAttribute('data-pm-panel', cfg.panel);
    stage.style.setProperty('--files-panel-w', cfg.width + 'px');
    stage.style.setProperty('--activity-bar-w', (cfg.rail || 36) + 'px');

    stage.innerHTML =
      '<div class="pm-glass-bg"></div>' +
      '<div class="app-shell">' +
        '<div class="title-bar">' +
          '<span class="app-name">Puppet Master</span>' +
          '<span class="pm-page-tabs" aria-hidden="true">' +
            '<span class="pm-page-tab is-on">Home</span>' +
            '<span class="pm-page-tab">Projects</span>' +
            '<span class="pm-page-tab">Orchestrator</span>' +
            '<span class="pm-page-tab">Usage</span>' +
          '</span>' +
          '<span class="title-spacer"></span>' +
          '<span class="pm-by">Claude Opus</span>' +
          '<span style="font-size:11px;font-family:var(--body-font);opacity:.65">' +
            esc(D.project.name) + '</span>' +
        '</div>' +
        '<div class="main-area">' +
          '<div class="left-panel">' +
            activityBarHTML(cfg.panel, cfg.rail || 36) +
            '<aside class="side-panel-slot" data-pm-slot>' +
              '<div class="side-panel-view active" data-pm-panelview>' +
                panelHTML(cfg.version, cfg.panel, cfg) +
              '</div>' +
            '</aside>' +
          '</div>' +
          '<div class="resizer-col" data-pm-resizer title="Drag to resize"></div>' +
          '<div class="editor-view">' + homeBackdropHTML() + '</div>' +
        '</div>' +
        '<div class="status-bar">' +
          '<span>Orchestrator: Ready</span><span>Index - ' +
          D.search.index.documents.toLocaleString() + ' files</span>' +
          '<span style="margin-left:auto">' + esc(D.project.branch) + '</span>' +
        '</div>' +
      '</div>';

    wireResizer(stage);
    /* The activity bar was inert: the only way to change panel was the control
       bar's dropdown, which does not exist once a stage is embedded or opened
       full. Clicking a rail icon now switches the panel, which is also the
       only way to feel how a design's navigation actually behaves. */
    stage.addEventListener('click', function (e) {
      var ico = e.target.closest && e.target.closest('.activity-bar .icon[data-ab-id]');
      if (!ico) return;
      var id = ico.getAttribute('data-ab-id');
      if (id && id !== state.panel) setState({ panel: id });
    });
    stage.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var ico = e.target.closest && e.target.closest('.activity-bar .icon[data-ab-id]');
      if (!ico) return;
      e.preventDefault();
      setState({ panel: ico.getAttribute('data-ab-id') });
    });
    if (global.PM && global.PM.mountAll) global.PM.mountAll(stage);
    return stage;
  }

  function frame(cfg, capOverride) {
    var v = byId[cfg.version] || { name: cfg.version };
    var f = el('figure', 'hx-frame');
    var cap = el('figcaption', 'hx-cap');
    cap.innerHTML = '<b>' + esc(cfg.version) + '</b> ' + esc(v.name) +
      ' &middot; ' + esc(labelFor('panel', cfg.panel)) +
      ' &middot; ' + esc(cfg.theme) +
      ' &middot; ' + cfg.width + 'px' +
      (capOverride ? ' &middot; ' + esc(capOverride) : '');
    var pick = el('button', 'hx-pickbtn', 'pick');
    pick.type = 'button';
    pick.setAttribute('aria-pressed', picks[cfg.panel] === cfg.version ? 'true' : 'false');
    pick.title = 'Record ' + cfg.version + ' as the pick for ' + cfg.panel;
    pick.addEventListener('click', function () {
      if (picks[cfg.panel] === cfg.version) delete picks[cfg.panel];
      else picks[cfg.panel] = cfg.version;
      savePicks();
      render();
    });
    cap.appendChild(pick);
    f.appendChild(cap);
    f.appendChild(buildStage(cfg));
    return f;
  }

  function labelFor(kind, id) {
    if (kind === 'panel') {
      for (var i = 0; i < D.panels.length; i++) if (D.panels[i].id === id) return D.panels[i].label;
    }
    return id;
  }

  /* ------------------------------------------------------------- resizer
     The real setupResizer from PMConcept7.html:20936, reduced to what a stage
     needs. Drag feel is part of what is under test, so this is not a stub.
     Unlike the app, the harness DOES persist the width (the app keeps it in an
     inline style only and loses it on reload -- a gap against FinalGUISpec
     section 15 Persistence, recorded in README). */
  function wireResizer(stage) {
    var bar = $('[data-pm-resizer]', stage);
    var slot = $('[data-pm-slot]', stage);
    if (!bar || !slot) return;
    bar.addEventListener('mousedown', function (e) {
      e.preventDefault();
      bar.classList.add('resizing');
      var startX = e.clientX, startW = slot.getBoundingClientRect().width;
      function move(ev) {
        var w = Math.round(startW + (ev.clientX - startX));
        w = Math.max(160, Math.min(w, 720));
        setState({ width: w });
      }
      function up() {
        bar.classList.remove('resizing');
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    bar.addEventListener('dblclick', function () { setState({ width: 380 }); });
  }

  /* ====================================================== row activation
     BLIND SPOT 18. There was no row-activation handler anywhere in the
     harness, so every row in every version was selection-only and section
     7.7's load-bearing 240px behaviour -- what a row DOES when you commit to
     it -- had never once been exercised. That is one harness gap, not six
     design failures, and it is why the audit reclassified it away from the
     versions.

     This is a PROTOTYPE rig: "activation" means visibly acknowledging the
     intent, not navigating away. Navigating would destroy the thing under
     test. So a commit dispatches a real bubbling `pm:activate` -- which a
     version, or the eventual Slint port, can listen for -- and the harness
     answers with a dismissible confirmation naming the row and the action
     that would have run.

     Delegated on `document`, once, rather than per stage: a fit sweep builds
     3,584 stages and none of them should pay for a listener no sweep ever
     fires. Compare and contact modes get it for free at the same time.

     The confirmation is styled as HARNESS chrome -- graphite, acid green,
     monospace, like the control bar and unlike all eight themes -- so it can
     never be mistaken for a component any design is proposing. */
  var actStyled = false;
  function ensureActStyles() {
    if (actStyled) return;
    actStyled = true;
    var s = document.createElement('style');
    s.setAttribute('data-pm-activate-css', '');
    s.textContent =
      '.pm-act{position:absolute;left:8px;bottom:30px;z-index:60;' +
        'max-width:min(430px,calc(100% - 16px));display:flex;align-items:flex-start;gap:8px;' +
        'padding:6px 8px;background:#101215;border:1px solid #00E5A0;color:#E6EAEE;' +
        'font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:11px;' +
        'line-height:1.45;box-shadow:0 6px 20px rgba(0,0,0,.45)}' +
      '.pm-act-body{flex:1 1 auto;min-width:0}' +
      '.pm-act-k{color:#00E5A0;font-weight:700;letter-spacing:.08em;' +
        'text-transform:uppercase;font-size:9px;display:block}' +
      '.pm-act-t{display:block;overflow-wrap:anywhere}' +
      '.pm-act-n{display:block;color:#8A939D;font-size:10px;margin-top:2px}' +
      '.pm-act-x{flex:0 0 24px;width:24px;height:24px;display:inline-flex;' +
        'align-items:center;justify-content:center;background:transparent;' +
        'border:1px solid #3A424B;color:#8A939D;cursor:pointer;padding:0}' +
      '.pm-act-x:hover{color:#E6EAEE;border-color:#00E5A0}';
    document.head.appendChild(s);
  }

  var X_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  /** One confirmation per stage; a second activation replaces the first. */
  function confirmAct(stage, kind, what, note) {
    ensureActStyles();
    var old = stage.querySelector('.pm-act');
    if (old) { clearTimeout(old.__t); old.remove(); }
    var box = el('div', 'pm-act');
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML =
      '<span class="pm-act-body"><span class="pm-act-k">' + esc(kind) + '</span>' +
      '<span class="pm-act-t">' + esc(what) + '</span>' +
      '<span class="pm-act-n">' + esc(note) + '</span></span>' +
      '<button type="button" class="pm-act-x" aria-label="Dismiss">' + X_ICON + '</button>';
    box.querySelector('.pm-act-x').addEventListener('click', function () {
      clearTimeout(box.__t); box.remove();
    });
    box.__t = setTimeout(function () { box.remove(); }, 6000);
    stage.appendChild(box);
    return box;
  }

  /** The action a row would run: its own primary overflow item. Read from the
   *  row's `template[data-pm-items]`, so the wording comes from the fixture
   *  by way of the version, and the harness invents no verb of its own. */
  function primaryAction(row) {
    var t = row.querySelector('template[data-pm-items]');
    if (!t || !t.content) return null;
    var items = t.content.querySelectorAll('div[data-value]');
    for (var i = 0; i < items.length; i++) {
      if (!items[i].hasAttribute('data-disabled')) {
        return { value: items[i].getAttribute('data-value') || '',
                 label: (items[i].textContent || '').trim() };
      }
    }
    return null;
  }

  function rowIdentity(row) {
    var k = row.getAttribute('data-pm-key');
    if (k) return k;
    var id = row.querySelector('.pmk-id,.pmk-id-stack');
    return ((id || row).textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90);
  }

  function activateRow(row, how) {
    var stage = row.closest('.pm-stage');
    if (!stage) return;
    var act = primaryAction(row);
    var who = rowIdentity(row);
    row.dispatchEvent(new CustomEvent('pm:activate', {
      bubbles: true,
      detail: {
        key: row.getAttribute('data-pm-key') || '',
        identity: who,
        action: act ? act.value : '',
        label: act ? act.label : '',
        how: how,
        version: stage.getAttribute('data-pm-version'),
        panel: stage.getAttribute('data-pm-panel'),
        row: row
      }
    }));
    confirmAct(stage, 'activate' + (how === 'key' ? ' - keyboard' : ''),
      (act ? act.label + ' - ' : '') + who,
      'pm:activate dispatched. The prototype acknowledges the intent; it does not navigate.');
  }

  function activateGrip(grip, how) {
    var stage = grip.closest('.pm-stage');
    if (!stage) return;
    var surface = grip.getAttribute('data-pm-grip') || '';
    grip.dispatchEvent(new CustomEvent('pm:detach', {
      bubbles: true, detail: { surface: surface, how: how }
    }));
    confirmAct(stage, 'detach', (how === 'drag' ? 'Drag to detach - ' : 'Pop out - ') + surface,
      'pm:detach dispatched. FinalGUISpec 5.6 signal 1; the rig does not open a second window.');
  }

  function wireActivation() {
    document.addEventListener('click', function (e) {
      var grip = e.target.closest && e.target.closest('[data-pm-grip]');
      if (grip) return;                          /* the grip answers to dblclick */
      var row = global.PM && global.PM.list ? global.PM.list.rowFromEvent(e) : null;
      if (!row || !row.closest('.pm-stage')) return;
      activateRow(row, 'click');
    });

    document.addEventListener('dblclick', function (e) {
      var grip = e.target.closest && e.target.closest('[data-pm-grip]');
      if (grip && grip.closest('.pm-stage')) activateGrip(grip, 'dblclick');
    });

    document.addEventListener('dragstart', function (e) {
      var grip = e.target.closest && e.target.closest('[data-pm-grip]');
      if (!grip || !grip.closest('.pm-stage')) return;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', grip.getAttribute('data-pm-grip') || '');
      }
      activateGrip(grip, 'drag');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var t = e.target;
      if (!t || !t.closest || !t.closest('.pm-stage')) return;

      var grip = t.closest('[data-pm-grip]');
      if (grip === t) { e.preventDefault(); activateGrip(grip, 'key'); return; }

      /* Only a row that IS the focused element activates. Enter inside the
         row's overflow trigger belongs to the menu. */
      var row = global.PM && global.PM.list ? global.PM.list.rowFromEvent(e) : null;
      if (!row || row !== t) return;
      e.preventDefault();
      activateRow(row, 'key');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var boxes = document.querySelectorAll('.pm-act');
      Array.prototype.forEach.call(boxes, function (b) { clearTimeout(b.__t); b.remove(); });
    });
  }

  /* --------------------------------------------------------------- render */
  function render() {
    var wrap = $('#stageWrap');
    document.body.setAttribute('data-mode', state.mode);
    wrap.innerHTML = '';

    if (state.mode === 'matrix') { renderMatrix(wrap); syncControls(); return; }

    var lane = el('div', 'hx-lane');

    if (state.mode === 'single' || state.mode === 'solo') {
      lane.appendChild(frame(cfg()));
    } else if (state.mode === 'compare') {
      lane.appendChild(frame(cfg()));
      lane.appendChild(frame(cfg({ version: state.compareB })));
    } else if (state.mode === 'contact') {
      D.themes.forEach(function (t) {
        lane.appendChild(frame(cfg({ theme: t.id }), t.label));
      });
    }
    wrap.appendChild(lane);

    if (state.mode === 'contact') {
      var n = el('div', 'hx-note');
      n.innerHTML = 'Contact sheet: one version and panel at one width across all 8 themes. ' +
        'This is the mode that makes cross-theme spacing breakage visible without reading a ' +
        'report. Watch for: labels that ellipsize in <code>basic-*</code> but not elsewhere ' +
        '(Inter 15px plus 0.02em tracking is the widest text of the eight), rows that grow a ' +
        'line in <code>retro-*</code> (2px borders), and anything clipped by the friendly ' +
        'hover ring.';
      wrap.appendChild(n);
    }
    syncControls();
    applyDebug();
  }

  function cfg(over) {
    var c = {
      version: state.version, panel: state.panel, theme: state.theme,
      width: state.width, density: state.density, motion: state.motion,
      glassBg: state.glassBg, rail: state.rail
    };
    if (over) for (var k in over) if (Object.prototype.hasOwnProperty.call(over, k)) c[k] = over[k];
    return c;
  }

  function renderMatrix(wrap) {
    var rep = global.PM_FIT && global.PM_FIT.lastReport();
    if (!rep) {
      var e = el('div', 'hx-empty');
      e.innerHTML = 'No fit report yet. Press <b>Run fit check</b> to sweep every ' +
        'version x panel x theme x width combination.';
      wrap.appendChild(e);
      return;
    }
    wrap.appendChild(global.PM_FIT.matrixTable(rep, function (combo) {
      setState({ version: combo.version, panel: combo.panel, theme: combo.theme,
                 width: combo.width, mode: 'single' });
      requestAnimationFrame(function () {
        var st = $('#stageWrap .pm-stage');
        if (st) global.PM_FIT.highlight(st, combo);
      });
    }));
  }

  function applyDebug() {
    var wrap = $('#stageWrap');
    wrap.classList.toggle('hx-dbg-box', $('#dbgBox').checked);
    wrap.classList.toggle('hx-dbg-hit', $('#dbgHit').checked);
  }

  /* ------------------------------------------------------------ controls */
  function seg(host, items, get, set) {
    host.innerHTML = '';
    items.forEach(function (it) {
      var b = el('button', null, it.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(get() === it.value));
      if (it.title) b.title = it.title;
      b.addEventListener('click', function () { set(it.value); });
      host.appendChild(b);
    });
  }

  function syncControls() {
    seg($('#cVersion'), registry.map(function (v) {
      return { value: v.id, label: v.id.toUpperCase(), title: v.name + (v.blurb ? ' - ' + v.blurb : '') };
    }), function () { return state.version; }, function (v) { setState({ version: v }); });

    seg($('#cWidth'), D.widths.map(function (w) {
      return { value: w.px, label: w.label,
               title: w.adversarial ? 'below the 240px spec floor - what the app clamps to today' : w.tier };
    }), function () { return state.width; }, function (v) { setState({ width: v }); });

    seg($('#cMode'), [
      { value: 'single',  label: 'Single' },
      { value: 'compare', label: 'Compare', title: 'Two versions side by side' },
      { value: 'contact', label: 'Contact', title: 'All 8 themes at once' },
      { value: 'matrix',  label: 'Matrix',  title: 'Fit-check results grid' }
    ], function () { return state.mode; }, function (v) { setState({ mode: v }); });

    seg($('#cDensity'), [{ value: 'comfortable', label: 'Comfort' }, { value: 'compact', label: 'Compact' }],
      function () { return state.density; }, function (v) { setState({ density: v }); });
    seg($('#cMotion'), [{ value: 'full', label: 'Full' }, { value: 'reduced', label: 'Reduced' }],
      function () { return state.motion; }, function (v) { setState({ motion: v }); });
    seg($('#cGlass'), [{ value: 'mesh', label: 'Mesh' }, { value: 'depth', label: 'Depth' }, { value: 'minimal', label: 'Min' }],
      function () { return state.glassBg; }, function (v) { setState({ glassBg: v }); });
    seg($('#cRail'), [
      { value: 36, label: '36', title: 'app collapsed (ships this way)' },
      { value: 48, label: '48', title: 'FinalGUISpec section 12.4' },
      { value: 72, label: '72', title: 'app expanded' }
    ], function () { return state.rail; }, function (v) { setState({ rail: v }); });

    var wr = $('#cWidthRange');
    if (document.activeElement !== wr) wr.value = state.width;
    $('#cWidthNum').textContent = state.width + 'px';

    /* The two native <select>s are part of the HARNESS chrome, not the design
       under test -- using OS controls here is deliberate reinforcement that the
       bar is an instrument, not the app. They still have to follow state when
       it changes programmatically (deep link, matrix cell click, setState). */
    var ps = $('#cPanel'), ts = $('#cTheme');
    if (ps && ps.value !== state.panel) ps.value = state.panel;
    if (ts && ts.value !== state.theme) ts.value = state.theme;
  }

  function buildStaticControls() {
    var p = $('#cPanel');
    p.innerHTML = '';
    D.panels.forEach(function (pn) {
      var o = el('option', null, pn.label + (pn.redesign ? '' : '  (peer)'));
      o.value = pn.id;
      p.appendChild(o);
    });
    p.value = state.panel;
    p.addEventListener('change', function () { setState({ panel: p.value }); });

    var t = $('#cTheme');
    t.innerHTML = '';
    D.themes.forEach(function (th) {
      var o = el('option', null, th.label);
      o.value = th.id;
      t.appendChild(o);
    });
    t.value = state.theme;
    t.addEventListener('change', function () { setState({ theme: t.value }); });

    $('#cWidthRange').addEventListener('input', function () {
      setState({ width: parseInt(this.value, 10) });
    });
    $('#cRow2').addEventListener('click', function () {
      var r = $('#row2');
      r.hidden = !r.hidden;
    });
    $('#dbgBox').addEventListener('change', applyDebug);
    $('#dbgHit').addEventListener('change', applyDebug);

    $('#cFit').addEventListener('click', runFit);
    $('#cReport').addEventListener('click', downloadReport);
  }

  /* ----------------------------------------------------------- fit check */
  function runFit() {
    if (!global.PM_FIT) { setPill('fit checker not loaded', 'fail'); return; }
    setPill('running...', '');
    global.PM_FIT.runMatrix({ registry: registry, buildStage: buildStage })
      .then(function (rep) {
        if (rep.aborted) { setPill(rep.abortReason, 'fail'); return; }
        var tone = rep.totals.fail ? 'fail' : rep.totals.warn ? 'warn' : 'pass';
        setPill(rep.totals.fail + ' fail / ' + rep.totals.warn + ' warn / ' +
                rep.totals.combos + ' combos', tone);
        if (state.mode === 'matrix') render();
      })
      .catch(function (err) {
        console.error(err);
        setPill('error - see console', 'fail');
      });
  }

  function setPill(txt, tone) {
    var p = $('#cFitPill');
    p.textContent = txt;
    if (tone) p.setAttribute('data-tone', tone); else p.removeAttribute('data-tone');
  }

  function downloadReport() {
    var rep = global.PM_FIT && global.PM_FIT.lastReport();
    if (!rep) { setPill('run the check first', 'warn'); return; }
    var payload = JSON.stringify({ report: rep, picks: picks }, null, 2);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    a.download = 'fit-report.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ------------------------------------------------------ state plumbing */
  function setState(patch) {
    var changed = false;
    for (var k in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, k) && state[k] !== patch[k]) {
        state[k] = patch[k];
        changed = true;
      }
    }
    if (!changed) return;
    writeHash();
    render();
  }

  function readHash() {
    var h = location.hash.replace(/^#/, '');
    if (!h) return;
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i < 0) return;
      var k = decodeURIComponent(kv.slice(0, i)), v = decodeURIComponent(kv.slice(i + 1));
      if (k === 'v') state.version = v;
      else if (k === 'panel') state.panel = v;
      else if (k === 'theme') state.theme = v;
      else if (k === 'w') state.width = parseInt(v, 10) || state.width;
      else if (k === 'mode') state.mode = v;
      else if (k === 'rail') state.rail = parseInt(v, 10) || state.rail;
    });
  }

  function writeHash() {
    var h = 'v=' + state.version + '&panel=' + state.panel + '&theme=' + state.theme +
            '&w=' + state.width + '&mode=' + state.mode;
    history.replaceState(null, '', '#' + h);
  }

  function loadPicks() {
    try { picks = JSON.parse(localStorage.getItem(PICK_KEY) || '{}') || {}; }
    catch (e) { picks = {}; }
  }
  function savePicks() {
    try { localStorage.setItem(PICK_KEY, JSON.stringify(picks)); } catch (e) { /* private mode */ }
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    if (!registry.length) {
      register('v0', { name: 'no versions loaded', panels: {}, fixes: false });
    }
    if (!byId[state.version]) state.version = registry[0].id;
    state.compareB = registry.length > 1 ? registry[1].id : registry[0].id;
    loadPicks();
    readHash();
    buildStaticControls();
    writeHash();
    render();
    if (global.PM && global.PM.tip) global.PM.tip.attach(document);
    wireActivation();
  }

  global.PM_BAKEOFF = {
    register: register,
    boot: boot,
    state: state,
    setState: setState,
    picks: function () { return picks; },
    versions: function () { return registry.slice(); },
    buildStage: buildStage,
    stages: function () {
      return Array.prototype.slice.call(document.querySelectorAll('#stageWrap .pm-stage'));
    },
    showCombo: function (c) { setState(c); }
  };
})(window);
