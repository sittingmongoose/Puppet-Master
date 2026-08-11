/* panel-protosKimi — _shared.js
   Harness engine: variant registry, panel/variant/theme/width switching,
   canonical PM sprout menus (replaces all native selects), drag resizer,
   and working chrome (accordions, tabs, filter chips, flags, flags rows). */
(function () {
  'use strict';

  var REG = {}; // panelId -> { variants: {n: {name, blurb, html}} }
  var PANELS = [
    { id: 'search',    label: 'Search' },
    { id: 'source',    label: 'Source Control' },
    { id: 'actions',   label: 'GitHub Actions' },
    { id: 'docker',    label: 'Docker Manager' },
    { id: 'tests',     label: 'Testing' },
    { id: 'agents',    label: 'Agents' },
    { id: 'artifacts', label: 'Artifacts' }
  ];
  var THEMES = [
    ['friendly-dark', 'Friendly Dark'], ['friendly-light', 'Friendly Light'],
    ['glass-dark', 'Glass Dark'], ['glass-light', 'Glass Light'],
    ['retro-dark', 'Retro Dark'], ['retro-light', 'Retro Light'],
    ['basic-dark', 'Basic Dark'], ['basic-light', 'Basic Light']
  ];
  var FAMILY_NAMES = {
    1: 'Ledger', 2: 'Rail Tabs', 3: 'Receipt Feed', 4: 'Data Grid', 5: 'Command Bar', 6: 'Focus Mode'
  };

  var state = {
    panel: 'search',
    variantByPanel: {},   // per-panel memory (mix-and-match)
    theme: 'friendly-dark',
    width: 320
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  window.PanelProtos = {
    register: function (panelId, n, def) {
      if (!REG[panelId]) REG[panelId] = { variants: {} };
      REG[panelId].variants[n] = def;
    },
    registerCrowd: function (panelId, groups) {
      if (!REG[panelId]) REG[panelId] = { variants: {} };
      REG[panelId].crowd = groups;
    }
  };

  /* ---------------- density engine ----------------
     Base rows marked data-crowd="<group>" are templates. Corpus items from
     the panel's registerCrowd call are cloned family-natively: clone the
     base row, swap text in the first node matching the field's selectors. */
  var DENSITY_LEVELS = { demo: 0, busy: 4, crowded: 12 };
  var density = 'demo';

  function applyField(clone, selectors, text) {
    for (var i = 0; i < selectors.length; i++) {
      var el = clone.matches(selectors[i]) ? clone : clone.querySelector(selectors[i]);
      if (el) { el.textContent = text; return true; }
    }
    return false;
  }

  function clearClones(root) {
    $all('[data-clone]', root).forEach(function (c) { c.remove(); });
  }

  function applyDensity() {
    var slot = $('#ppSlotContent');
    clearClones(slot);
    var want = DENSITY_LEVELS[density] || 0;
    if (!want) return;
    var reg = REG[state.panel];
    if (!reg || !reg.crowd) return;
    reg.crowd.forEach(function (g) {
      var bases = $all('[data-crowd="' + g.group + '"]', slot).filter(function (el) {
        return !el.hasAttribute('data-clone');
      });
      if (!bases.length) return;
      var n = Math.min(want, g.items.length);
      var anchor = bases[bases.length - 1];
      if (anchor.nextElementSibling && anchor.nextElementSibling.classList.contains('gr-sub')) {
        anchor = anchor.nextElementSibling;
      }
      for (var i = 0; i < n; i++) {
        var item = g.items[i];
        var base = bases[i % bases.length];
        var clone = base.cloneNode(true);
        clone.setAttribute('data-clone', '1');
        clone.classList.remove('open');
        Object.keys(item).forEach(function (field) {
          if (field === 'sub') return;
          var sels = (g.fields && g.fields[field]) || [];
          applyField(clone, sels, item[field]);
        });
        anchor.parentNode.insertBefore(clone, anchor.nextSibling);
        anchor = clone;
        // grid-family sub row rides as the next sibling
        if (base.nextElementSibling && base.nextElementSibling.classList.contains('gr-sub')) {
          var subClone = base.nextElementSibling.cloneNode(true);
          subClone.setAttribute('data-clone', '1');
          if (item.sub) subClone.textContent = item.sub;
          anchor.parentNode.insertBefore(subClone, anchor.nextSibling);
          anchor = subClone;
        }
      }
    });
    wireChrome(slot);
  }

  function setDensity(d) {
    density = d;
    $all('.pp-densitybtn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-density') === d);
    });
    applyDensity();
  }

  /* ---------------- PM sprout menu engine ----------------
     Canonical pattern (pm6-tb-menu + ACD-439): corner-origin sprout,
     ~300ms overshoot open, ~220ms close, outside-click/Esc close,
     flip at viewport edges, reduced-motion instant. */
  var openMenu = null;

  function sproutOrigin(menu, trigger) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var r = trigger.getBoundingClientRect();
    var m = menu.getBoundingClientRect();
    var ox = 88, oy = 0, tx = 0, ty = -10;
    menu.classList.remove('align-left', 'drop-up');
    // horizontal: flip left when close to right edge
    if (r.right + 8 + m.width > vw && r.left - m.width > 0) { menu.classList.add('align-left'); ox = 12; }
    // vertical: drop up when close to bottom edge
    if (r.bottom + 8 + m.height > vh && r.top - m.height > 0) { menu.classList.add('drop-up'); oy = 100; ty = 10; }
    menu.style.setProperty('--pp-sprout-ox', ox + '%');
    menu.style.setProperty('--pp-sprout-oy', oy + '%');
    menu.style.setProperty('--pp-sprout-ty', ty + 'px');
  }

  function menuOpen(wrap) {
    var menu = $('.pp-menu', wrap), trigger = $('.pp-menu-trigger', wrap);
    if (!menu || !trigger) return;
    if (openMenu && openMenu !== wrap) menuClose(openMenu, true);
    sproutOrigin(menu, trigger);
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = wrap;
  }

  function menuClose(wrap, instant) {
    var menu = $('.pp-menu', wrap), trigger = $('.pp-menu-trigger', wrap);
    if (!menu || !menu.classList.contains('is-open')) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    menu.classList.remove('is-open');
    if (instant || reduced) {
      menu.classList.remove('is-closing');
    } else {
      menu.classList.add('is-closing');
      setTimeout(function () { menu.classList.remove('is-closing'); }, 260);
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (openMenu === wrap) openMenu = null;
  }

  function wireMenus(root) {
    $all('.pp-menuwrap', root).forEach(function (wrap) {
      var trigger = $('.pp-menu-trigger', wrap);
      if (!trigger || trigger.dataset.ppWired) return;
      trigger.dataset.ppWired = '1';
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        if (wrap === openMenu) menuClose(wrap); else menuOpen(wrap);
      });
      $all('.pp-mitem', wrap).forEach(function (item) {
        if (item.dataset.ppWired) return;
        item.dataset.ppWired = '1';
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          if (item.hasAttribute('data-select-value')) {
            $all('.pp-mitem', wrap).forEach(function (i) { i.classList.remove('is-selected'); });
            item.classList.add('is-selected');
            var label = $('.pp-mt-label', trigger);
            if (label) label.textContent = item.getAttribute('data-select-value');
          }
          menuClose(wrap);
        });
      });
    });
  }

  document.addEventListener('click', function () { if (openMenu) menuClose(openMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openMenu) menuClose(openMenu); });

  /* ---------------- working chrome inside panels ---------------- */
  function wireChrome(root) {
    // accordions (family 1 + generic [data-acc])
    $all('[data-acc-h]', root).forEach(function (h) {
      if (h.dataset.ppWired) return; h.dataset.ppWired = '1';
      h.addEventListener('click', function () { h.parentElement.classList.toggle('open'); });
    });
    // tab strips (family 2)
    $all('[data-tabstrip]', root).forEach(function (strip) {
      if (strip.dataset.ppWired) return; strip.dataset.ppWired = '1';
      strip.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-tab]');
        if (!tab) return;
        var scope = strip.closest('[data-tabscope]') || root;
        $all('[data-tab]', strip).forEach(function (t) { t.classList.toggle('active', t === tab); });
        $all('[data-tabview]', scope).forEach(function (v) {
          v.classList.toggle('active', v.getAttribute('data-tabview') === tab.getAttribute('data-tab'));
        });
      });
    });
    // toggle flags (Aa .* \b etc.)
    $all('.pp-flag', root).forEach(function (f) {
      if (f.dataset.ppWired) return; f.dataset.ppWired = '1';
      f.addEventListener('click', function () { f.classList.toggle('active'); });
    });
    // filter chips: single-select within a group, filters [data-fam] rows
    $all('[data-filters]', root).forEach(function (group) {
      if (group.dataset.ppWired) return; group.dataset.ppWired = '1';
      group.addEventListener('click', function (e) {
        var chip = e.target.closest('[data-filter]');
        if (!chip) return;
        var val = chip.getAttribute('data-filter');
        $all('[data-filter]', group).forEach(function (c) { c.classList.toggle('active', c === chip); });
        var scope = group.closest('.pp-panel') || root;
        $all('[data-fam]', scope).forEach(function (row) {
          row.style.display = (val === 'all' || row.getAttribute('data-fam') === val) ? '' : 'none';
        });
      });
    });
    // segmented controls (single select)
    $all('.pp-seg', root).forEach(function (seg) {
      if (seg.dataset.ppWired) return; seg.dataset.ppWired = '1';
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        $all('button', seg).forEach(function (x) { x.classList.toggle('active', x === b); });
      });
    });
    // expandable rows (worktree rows etc.)
    $all('[data-expand-h]', root).forEach(function (h) {
      if (h.dataset.ppWired) return; h.dataset.ppWired = '1';
      h.addEventListener('click', function (e) {
        if (e.target.closest('button.pp-mini, button.pp-btn, .pp-menuwrap')) return;
        var row = h.closest('[data-expand]');
        if (row) row.classList.toggle('open');
      });
    });
    // focus-mode drill-in (family 6)
    $all('[data-fo-go]', root).forEach(function (item) {
      if (item.dataset.ppFoWired) return; item.dataset.ppFoWired = '1';
      item.addEventListener('click', function () {
        var panel = item.closest('.fam-focus');
        if (!panel) return;
        var target = item.getAttribute('data-fo-go');
        $all('[data-fo-view]', panel).forEach(function (v) {
          v.classList.toggle('active', v.getAttribute('data-fo-view') === target);
        });
        panel.classList.add('fo-deep');
        var cur = $('[data-fo-crumb-current]', panel);
        if (cur) cur.textContent = item.getAttribute('data-fo-label') || target;
      });
    });
    $all('[data-fo-back]', root).forEach(function (btn) {
      if (btn.dataset.ppFoWired) return; btn.dataset.ppFoWired = '1';
      btn.addEventListener('click', function () {
        var panel = btn.closest('.fam-focus');
        if (panel) panel.classList.remove('fo-deep');
      });
    });
    // replace row toggle (search panels)
    $all('[data-replace-toggle]', root).forEach(function (b) {
      if (b.dataset.ppWired) return; b.dataset.ppWired = '1';
      b.addEventListener('click', function () {
        var row = $('[data-replace-row]', b.closest('.pp-panel'));
        if (row) row.classList.toggle('pp-hidden');
        b.classList.toggle('active');
      });
    });
    wireMenus(root);
  }

  /* ---------------- rendering ---------------- */
  function currentVariant(panelId) {
    var v = state.variantByPanel[panelId];
    if (!v || !REG[panelId] || !REG[panelId].variants[v]) {
      var nums = REG[panelId] ? Object.keys(REG[panelId].variants).map(Number).sort() : [];
      v = nums.length ? nums[0] : 1;
      state.variantByPanel[panelId] = v;
    }
    return v;
  }

  function renderPanel() {
    var slot = $('#ppSlotContent');
    var reg = REG[state.panel];
    var v = currentVariant(state.panel);
    var def = reg && reg.variants[v];
    slot.innerHTML = def ? def.html : '<div class="pp-panel"><div class="pp-head"><span class="pp-head-title">No variant registered</span></div></div>';
    wireChrome(slot);
    applyDensity();
    // header meta
    var meta = PANELS.filter(function (p) { return p.id === state.panel; })[0];
    $('#ppNowPanel').textContent = meta.label;
    $('#ppNowVariant').textContent = 'v' + v + ' ' + (def ? def.name : '');
    $('#ppNowBlurb').textContent = def ? def.blurb : '';
    // activity bar active state
    $all('.pp-abar-icon[data-panel]').forEach(function (i) {
      i.classList.toggle('active', i.getAttribute('data-panel') === state.panel);
    });
    renderVariantPicker();
  }

  function renderVariantPicker() {
    var menu = $('#variantMenu');
    var reg = REG[state.panel];
    var v = currentVariant(state.panel);
    var html = '';
    for (var n = 1; n <= 6; n++) {
      var def = reg && reg.variants[n];
      if (!def) continue;
      html += '<button type="button" class="pp-mitem' + (n === v ? ' is-selected' : '') + '" data-variant="' + n + '">' +
        '<span>v' + n + ' — ' + def.name + '</span>' +
        '<span class="pp-mi-meta">' + FAMILY_NAMES[n] + '</span></button>';
    }
    menu.innerHTML = html;
    $all('[data-variant]', menu).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        setVariant(state.panel, parseInt(b.getAttribute('data-variant'), 10));
        menuClose($('#variantMenuWrap'));
      });
    });
    $('#variantTriggerLabel').textContent = 'v' + v + ' ' + (reg && reg.variants[v] ? reg.variants[v].name : '');
  }

  function setVariant(panelId, n, applyAll) {
    if (applyAll) {
      PANELS.forEach(function (p) { state.variantByPanel[p.id] = n; });
    } else {
      state.variantByPanel[panelId] = n;
    }
    renderPanel();
  }

  function setPanel(id) {
    if (!REG[id]) return;
    state.panel = id;
    renderPanel();
  }

  function setTheme(t) {
    state.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    $all('#themeMenu .pp-mitem').forEach(function (i) {
      i.classList.toggle('is-selected', i.getAttribute('data-theme-value') === t);
    });
    $('#themeTriggerLabel').textContent = THEMES.filter(function (x) { return x[0] === t; })[0][1];
  }

  function setWidth(w) {
    state.width = w;
    var slot = $('#ppSlot');
    slot.style.width = w + 'px';
    slot.classList.toggle('w-narrow', w < 360);
    slot.classList.toggle('w-tiny', w < 280);
    $all('.pp-sizebtn').forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-width'), 10) === w);
    });
    $('#ppNowWidth').textContent = w + 'px';
  }

  /* ---------------- activity bar + pickers boot ---------------- */
  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    source: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/><line x1="6" y1="9" x2="6" y2="15"/></svg>',
    actions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    docker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    tests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16.4 9"/></svg>',
    agents: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M9 12.5h.01M15 12.5h.01" stroke-width="2.4"/><path d="M9.5 16h5"/></svg>',
    artifacts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    run: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8"/></svg>'
  };

  function buildActivityBar() {
    var bar = $('#ppAbar');
    var groups = [
      { items: [['files', 'File Manager (not in this proto)', 1], ['search', 'Search'], ['source', 'Source Control']] },
      { items: [['actions', 'GitHub Actions'], ['docker', 'Docker Manager'], ['tests', 'Testing']] },
      { items: [['chat', 'Chat (not in this proto)', 1], ['agents', 'Agents']] },
      { items: [['run', 'Run & Debug (not in this proto)', 1], ['artifacts', 'Runtime Artifacts']] }
    ];
    var html = '';
    groups.forEach(function (g, gi) {
      if (gi > 0) html += '<div class="pp-abar-sep"></div>';
      g.items.forEach(function (it) {
        var dis = it[2] ? ' disabled' : '';
        var dp = it[2] ? '' : ' data-panel="' + it[0] + '"';
        html += '<button class="pp-abar-icon' + dis + '"' + dp + ' title="' + it[1] + '" aria-label="' + it[1] + '">' + ICONS[it[0]] + '</button>';
      });
    });
    bar.innerHTML = html;
    $all('.pp-abar-icon[data-panel]', bar).forEach(function (i) {
      i.addEventListener('click', function () { setPanel(i.getAttribute('data-panel')); });
    });
  }

  function buildThemeMenu() {
    var menu = $('#themeMenu');
    menu.innerHTML = THEMES.map(function (t) {
      return '<button type="button" class="pp-mitem" role="menuitem" data-theme-value="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
    $all('[data-theme-value]', menu).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        setTheme(b.getAttribute('data-theme-value'));
        menuClose($('#themeMenuWrap'));
      });
    });
  }

  function buildResizer() {
    var resizer = $('#ppResizer'), slot = $('#ppSlot');
    var dragging = false;
    resizer.addEventListener('pointerdown', function (e) {
      dragging = true;
      resizer.classList.add('dragging');
      resizer.setPointerCapture(e.pointerId);
    });
    resizer.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var x = e.clientX - slot.getBoundingClientRect().left + slot.style.width.length * 0;
      var w = Math.round(e.clientX - $('#ppAbar').getBoundingClientRect().width - 0);
      w = Math.max(200, Math.min(w, 480));
      setWidth(w);
    });
    resizer.addEventListener('pointerup', function () {
      dragging = false;
      resizer.classList.remove('dragging');
    });
    resizer.addEventListener('dblclick', function () { setWidth(320); });
  }

  function boot() {
    buildActivityBar();
    buildThemeMenu();
    buildResizer();
    wireMenus(document);
    $all('.pp-sizebtn').forEach(function (b) {
      b.addEventListener('click', function () { setWidth(parseInt(b.getAttribute('data-width'), 10)); });
    });
    $all('.pp-densitybtn').forEach(function (b) {
      b.addEventListener('click', function () { setDensity(b.getAttribute('data-density')); });
    });
    $('#applyAllBtn').addEventListener('click', function () {
      setVariant(state.panel, currentVariant(state.panel), true);
    });
    setTheme(state.theme);
    setWidth(state.width);
    renderPanel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // verification hooks (used by verify/capture.mjs)
  window.__ppSetPanel = setPanel;
  window.__ppSetVariant = setVariant;
  window.__ppSetTheme = setTheme;
  window.__ppSetWidth = setWidth;
  window.__ppSetDensity = setDensity;
})();
