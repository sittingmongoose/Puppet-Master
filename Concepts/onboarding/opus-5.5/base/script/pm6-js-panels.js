
/* pm6-js-panels -- shell chrome wiring: activity-bar page navigation +
   Ctrl+1..9, activity-bar customization (reorder / hide / More tray),
   theme + project title-bar sprout menus, the title-bar density ladder,
   and the depth-background pointer parallax. The legacy side-panel render
   JS (git / docker / artifacts / notifications / agents mirror / worktree
   row expansion / file filter) was removed in the 2026-07-29 deferred-
   cleanup wave: the PM6 panels it served were replaced by the Cozy Shelves
   panels, whose behavior lives in pm6-js-cozy-shelves. */
(function () {
  'use strict';
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byId(id) { return document.getElementById(id); }
  function demo() { return window.PM_DEMO || null; }

  /* ================= activity bar: page icons + Ctrl+1..8 ================= */
  function wireActivityBar() {
    var bar = byId('activityBar');
    if (!bar) return;
    /* capture stage: page-nav icons must not fall through to the legacy
       data-target toggle (which would hide the side panel on second click). */
    document.addEventListener('click', function (e) {
      var icon = e.target && e.target.closest ? e.target.closest('.activity-bar .icon[data-demo-action="page.go"]') : null;
      if (!icon) return;
      e.stopPropagation();
      e.preventDefault();
      var D = demo();
      var arg = icon.dataset.demoArg || '';
      var a = arg.split(':');
      try {
        if (D && D.guard && D.guard.attempt) D.guard.attempt('page.go', { el: icon, arg: arg });
        else if (window.PM_PAGES) window.PM_PAGES.go(a[0], a[1]);
      } catch (err) {}
    }, true);

    document.addEventListener('keydown', function (e) {
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
      var n = parseInt(e.key, 10);
      if (!(n >= 1 && n <= 9)) return;
      var icons = $all('.activity-bar .icon[data-target]');
      var icon = icons[n - 1];
      if (icon) { e.preventDefault(); icon.click(); }
    });
  }

  /* ================= activity bar customization (reorder / hide / More tray) =================
     Persistence: single key pm.activity_bar_order:v2 — one JSON array of
     data-ab-id strings containing the "__more__" sentinel; ids after the
     sentinel are the hidden (tray) set. This is FinalGUISpec's
     "ordered list of activity bar item IDs + separator position" contract.
     Hotkeys: the Ctrl+1..8 handler in wireActivityBar live-queries
     '.activity-bar .icon[data-target]' per keydown, so DOM order == hotkey
     order — hotkeys follow the VISUAL order automatically and hidden icons
     drop out of the numbering; zero code needed here.
     Boot flattens the decorative .pm6-ab-group wrappers (any future
     group-scoped CSS goes inert — the separator rules in pm6-css-panels
     already are). Icon nodes are MOVED, never cloned: the delegated
     Chat/Dashboard title-matched handlers (js-terminal-demo) keep working. */
  function initActivityBarCustomization() {
    var LS_KEY = 'pm.activity_bar_order:v2';
    var SENTINEL = '__more__';
    var bar = byId('activityBar');
    var moreBtn = byId('abMoreBtn');
    if (!bar || !moreBtn) return;

    function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

    var hidden = [];   /* [{ id, node }] — detached icon nodes, in tray order */
    var drag = null;   /* active gesture state */

    function visibleIcons() {
      return $all('#activityBar > .icon[data-ab-id]').filter(function (i) { return i !== moreBtn; });
    }
    function syncMore() { moreBtn.setAttribute('data-empty', hidden.length ? '0' : '1'); }
    function persist() {
      var order = visibleIcons().map(function (i) { return i.getAttribute('data-ab-id'); });
      order.push(SENTINEL);
      hidden.forEach(function (h) { order.push(h.id); });
      lsSet(LS_KEY, JSON.stringify(order));
    }
    function killTray() {
      var t = document.querySelector('.pm-ab-tray');
      if (t && t.parentNode) t.parentNode.removeChild(t);
    }

    /* ---- boot: flatten groups, apply persisted order, detach hidden ---- */
    (function bootOrder() {
      var domIcons = $all('.icon[data-ab-id]', bar).filter(function (i) { return i !== moreBtn; });
      var map = {};
      domIcons.forEach(function (i) { map[i.getAttribute('data-ab-id')] = i; });
      var saved = null;
      try { saved = JSON.parse(lsGet(LS_KEY) || 'null'); } catch (e) { saved = null; }
      if (!saved || Object.prototype.toString.call(saved) !== '[object Array]') saved = null;
      var migratedLegacyActivityOrder = false;
      if (saved) saved = saved.map(function (id) { var canonical = id === 'gh-actions' || id === 'github_actions' || id === 'git' ? 'repository_automation' : id; if (canonical !== id) migratedLegacyActivityOrder = true; return canonical; });
      var visIds = [], hidIds = [], seen = {}, past = false;
      (saved || []).forEach(function (id) {
        if (id === SENTINEL) { past = true; return; }
        if (!map[id] || seen[id]) return;          /* persisted id missing from DOM: dropped */
        seen[id] = true;
        (past ? hidIds : visIds).push(id);
      });
      domIcons.forEach(function (i) {              /* unknown new ids: visible, at the end */
        var id = i.getAttribute('data-ab-id');
        if (!seen[id]) { seen[id] = true; visIds.push(id); }
      });
      visIds.forEach(function (id) { bar.insertBefore(map[id], moreBtn); });   /* moved, not cloned */
      hidIds.forEach(function (id) {
        var n = map[id];
        if (n.parentNode) n.parentNode.removeChild(n);
        hidden.push({ id: id, node: n });
      });
      $all('.pm6-ab-group', bar).forEach(function (g) {                        /* remove emptied wrappers */
        if (!g.querySelector('.icon') && g.parentNode) g.parentNode.removeChild(g);
      });
      syncMore();
      if (migratedLegacyActivityOrder) persist();
    })();

    /* ---- shared pointer-drag engine (bar icons + tray rows) ---- */
    function suppressNextClick() {
      /* one-shot window-CAPTURE suppressor: it runs before the document
         capture-stage page.go handler in wireActivityBar AND before the
         legacy body-level bubble handler (js-terminal-demo), so a drop
         never doubles as a click on either path. */
      var fn = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.removeEventListener('click', fn, true);
      };
      window.addEventListener('click', fn, true);
      setTimeout(function () { window.removeEventListener('click', fn, true); }, 0);
    }
    function computeSlots() {
      /* midpoints of the visible icons — pure vertical-list math, identical
         at 36px collapsed and 72px expanded */
      return visibleIcons().map(function (i) {
        var r = i.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, mid: r.top + r.height / 2 };
      });
    }
    function armGesture(e, node, id, fromTray, captureEl) {
      if (e.button !== 0) return;
      drag = { node: node, id: id, fromTray: !!fromTray, started: false, sx: e.clientX, sy: e.clientY, pid: e.pointerId };
      try { captureEl.setPointerCapture(e.pointerId); } catch (err) {}
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);
    }
    function beginDrag() {
      drag.started = true;
      document.body.classList.add('pm-ab-dragging');   /* shows the More target + disables jiggle/hover-scale */
      killTray();
      var g = drag.node.cloneNode(true);               /* ghost is a throwaway clone; the real node moves at drop */
      g.classList.add('pm-ab-ghost');
      g.classList.remove('active');
      var w = drag.fromTray ? moreBtn.getBoundingClientRect().width : drag.node.getBoundingClientRect().width;
      g.style.width = Math.max(32, Math.round(w)) + 'px';
      document.body.appendChild(g);
      drag.ghost = g;
      if (!drag.fromTray) drag.node.classList.add('pm-ab-drag-src');
      var ind = document.createElement('div');
      ind.className = 'pm-ab-drop-indicator';
      var br = bar.getBoundingClientRect();
      ind.style.left = (br.left + 4) + 'px';
      ind.style.width = (br.width - 8) + 'px';
      ind.style.display = 'none';
      document.body.appendChild(ind);
      drag.indicator = ind;
      drag.moreRect = moreBtn.getBoundingClientRect(); /* after the body class: More is visible now */
      drag.slots = computeSlots();
    }
    function onPointerMove(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      if (!drag.started) {
        if (Math.abs(e.clientX - drag.sx) < 4 && Math.abs(e.clientY - drag.sy) < 4) return;   /* 4px threshold */
        beginDrag();
      }
      drag.ghost.style.left = (e.clientX + 6) + 'px';
      drag.ghost.style.top = (e.clientY - 12) + 'px';
      var mr = drag.moreRect;
      drag.overMore = !drag.fromTray &&
        e.clientX >= mr.left && e.clientX <= mr.right && e.clientY >= mr.top && e.clientY <= mr.bottom;
      moreBtn.classList.toggle('pm-ab-drop-hot', !!drag.overMore);
      if (drag.overMore) { drag.indicator.style.display = 'none'; drag.insertAt = -1; return; }
      var idx = drag.slots.length;
      for (var i = 0; i < drag.slots.length; i++) {
        if (e.clientY < drag.slots[i].mid) { idx = i; break; }
      }
      drag.insertAt = idx;
      var y = idx < drag.slots.length
        ? drag.slots[idx].top - 1
        : (drag.slots.length ? drag.slots[drag.slots.length - 1].bottom + 1 : mr.top - 4);
      drag.indicator.style.top = y + 'px';
      drag.indicator.style.display = 'block';
    }
    function onPointerUp(e) { if (drag && e.pointerId === drag.pid) endDrag(false); }
    function onPointerCancel(e) { if (drag && e.pointerId === drag.pid) endDrag(true); }
    function endDrag(cancelled) {
      var d = drag;
      drag = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (!d || !d.started) return;                    /* below threshold: plain click proceeds */
      document.body.classList.remove('pm-ab-dragging');
      moreBtn.classList.remove('pm-ab-drop-hot');
      if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
      if (d.indicator && d.indicator.parentNode) d.indicator.parentNode.removeChild(d.indicator);
      d.node.classList.remove('pm-ab-drag-src');
      if (!cancelled) applyDrop(d);
      suppressNextClick();
    }
    function applyDrop(d) {
      if (!d.fromTray && d.overMore) {                 /* drop-to-hide */
        if (d.node.parentNode) d.node.parentNode.removeChild(d.node);
        hidden.push({ id: d.id, node: d.node });
        syncMore();
        persist();
        return;
      }
      if (d.insertAt == null || d.insertAt < 0) return;
      var vis = visibleIcons();
      var ref = d.insertAt < vis.length ? vis[d.insertAt] : moreBtn;
      if (ref === d.node) return;
      if (d.fromTray) {
        for (var i = 0; i < hidden.length; i++) {
          if (hidden[i].id === d.id) { hidden.splice(i, 1); break; }
        }
        syncMore();
      }
      bar.insertBefore(d.node, ref);                   /* positioned restore / reorder */
      persist();
    }

    bar.addEventListener('pointerdown', function (e) {
      var icon = e.target && e.target.closest ? e.target.closest('#activityBar > .icon[data-ab-id]') : null;
      if (!icon || icon === moreBtn) return;
      armGesture(e, icon, icon.getAttribute('data-ab-id'), false, icon);
    });

    /* ---- More tray popover (cloned from the terminal overflow-menu
       pattern: body-appended, outside-click close) ---- */
    function restoreHidden(id, beforeNode) {
      for (var i = 0; i < hidden.length; i++) {
        if (hidden[i].id !== id) continue;
        var h = hidden.splice(i, 1)[0];
        bar.insertBefore(h.node, beforeNode || moreBtn);   /* default: end of the visible list */
        syncMore();
        persist();
        return h;
      }
      return null;
    }
    function buildTrayRow(h) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'pm-ab-tray-row';
      row.setAttribute('data-ab-id', h.id);
      var ico = document.createElement('span');
      ico.className = 'pm-ab-tray-ico';
      var svg = h.node.querySelector('svg');
      if (svg) ico.appendChild(svg.cloneNode(true));   /* display clone only; the real node stays in the map */
      row.appendChild(ico);
      var label = document.createElement('span');
      label.textContent = h.node.getAttribute('title') || h.id;
      row.appendChild(label);
      row.addEventListener('click', function (ev) {    /* click = restore to end of visible */
        ev.stopPropagation();
        restoreHidden(h.id, null);
        refreshTray();
      });
      row.addEventListener('pointerdown', function (ev) {   /* drag back onto the bar = positioned restore */
        armGesture(ev, h.node, h.id, true, row);
      });
      return row;
    }
    function refreshTray() {
      var tray = document.querySelector('.pm-ab-tray');
      if (!tray) return;
      if (!hidden.length) { killTray(); return; }
      while (tray.firstChild) tray.removeChild(tray.firstChild);
      hidden.forEach(function (h) { tray.appendChild(buildTrayRow(h)); });
    }
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('#abMoreBtn') : null;
      if (!btn) return;
      e.stopPropagation();       /* keep the legacy .icon body handler from claiming More */
      e.preventDefault();
      var existing = document.querySelector('.pm-ab-tray');
      if (existing) { killTray(); return; }
      if (!hidden.length) return;
      var m = document.createElement('div');
      m.className = 'pm-ab-tray';
      hidden.forEach(function (h) { m.appendChild(buildTrayRow(h)); });
      document.body.appendChild(m);
      var r = moreBtn.getBoundingClientRect();
      m.style.left = (r.right + 8) + 'px';
      m.style.top = Math.min(r.top, Math.max(8, window.innerHeight - m.offsetHeight - 8)) + 'px';
      setTimeout(function () {
        function close(ev) {
          if (m.contains(ev.target)) return;
          if (m.parentNode) m.parentNode.removeChild(m);
          document.removeEventListener('click', close);
        }
        document.addEventListener('click', close);
      }, 0);
    }, true);
  }

  /* ================= theme + project title-bar sprout menus =================
     Theme model: family (friendly|glass|retro|basic) x mode (light|dark|auto).
     Persistence: pm.themeFamily + pm.themeMode, plus the resolved slug kept in
     the legacy pm.theme key for older readers. Auto follows the OS via
     prefers-color-scheme and re-resolves live on scheme change.
     data-theme on <html> ALWAYS carries one of the 8 resolved slugs, so every
     [data-theme…] CSS block and the /-light$/ glass-alpha clamps keep working. */
  var PM_THEME_FAMILIES = { friendly: 'Friendly', glass: 'Glass', retro: 'Retro', basic: 'Basic' };
  var PM_THEME_MODES = ['light', 'dark', 'auto'];
  var PM_THEME_SLUGS = {
    'friendly-dark': 'Friendly Dark',
    'friendly-light': 'Friendly Light',
    'glass-dark': 'Glass Dark',
    'glass-light': 'Glass Light',
    'retro-dark': 'Retro Dark',
    'retro-light': 'Retro Light',
    'basic-dark': 'Basic Dark',
    'basic-light': 'Basic Light'
  };
  var PM_THEME_SLUG_RE = /^(friendly|glass|retro|basic)-(light|dark)$/;
  var themeState = { family: 'friendly', mode: 'dark' };

  function themeLsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function themeLsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  function themeResolveScheme(mode) {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  }

  function themeReadState() {
    var fam = themeLsGet('pm.themeFamily');
    var mode = themeLsGet('pm.themeMode');
    var leg = PM_THEME_SLUG_RE.exec(themeLsGet('pm.theme') || '');
    if (!PM_THEME_FAMILIES[fam]) fam = leg ? leg[1] : 'friendly';
    if (PM_THEME_MODES.indexOf(mode) < 0) mode = leg ? leg[2] : 'dark';
    return { family: fam, mode: mode };
  }

  function themeApply(family, mode, opts) {
    opts = opts || {};
    if (!PM_THEME_FAMILIES[family]) family = 'friendly';
    if (PM_THEME_MODES.indexOf(mode) < 0) mode = 'dark';
    themeState.family = family;
    themeState.mode = mode;
    var slug = (function(f){try{var p=typeof window.PM_THEME_PAINT_FAMILY==='function'?window.PM_THEME_PAINT_FAMILY(f):f;return /^(friendly|glass|retro|basic)$/.test(p)?p:f;}catch(e){return f;}})(family) + '-' + themeResolveScheme(mode);
    var prev = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', slug);
    if (opts.persist !== false) {
      themeLsSet('pm.themeFamily', family);
      themeLsSet('pm.themeMode', mode);
      themeLsSet('pm.theme', slug);
    }
    themeSyncChrome();
    if (opts.dispatch !== false && prev !== slug) {
      var btn = byId('themeSelect');
      if (btn) {
        try { btn.dispatchEvent(new Event('change', { bubbles: true })); } catch (e0) {}
      }
    }
    if (window.PM_GLASS_LOCK_REFRESH) {
      try { window.PM_GLASS_LOCK_REFRESH(); } catch (e1) {}
    }
    return slug;
  }

  function themeSyncChrome() {
    var family = themeState.family;
    var mode = themeState.mode;
    var scheme = themeResolveScheme(mode);
    var slug = family + '-' + scheme;
    var btn = byId('themeSelect');
    var label = byId('themeMenuLabel');
    var menu = byId('themeMenu');
    if (btn) {
      btn.setAttribute('data-value', slug);
      btn.setAttribute('data-mode-icon', mode === 'light' ? 'sun' : (mode === 'dark' ? 'moon' : 'auto'));
      var paintLabel = typeof window.PM_THEME_PAINT_LABEL === 'function' ? window.PM_THEME_PAINT_LABEL() : '';
      var title = paintLabel ? 'Theme: ' + paintLabel + (mode === 'auto' ? ' (Auto)' : ' (' + (scheme === 'light' ? 'Light' : 'Dark') + ')') :
        'Theme: ' + PM_THEME_FAMILIES[family] +
        (mode === 'auto' ? ' (Auto)' : ' (' + PM_THEME_SLUGS[slug] + ')');
      btn.setAttribute('title', title);
      if (btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', title);
      try { btn.value = slug; } catch (e0) {}
    }
    if (label) label.textContent = (typeof window.PM_THEME_PAINT_LABEL === 'function' && window.PM_THEME_PAINT_LABEL()) || PM_THEME_FAMILIES[family] || family;
    if (menu) {
      menu.querySelectorAll('.pm6-tt-mode').forEach(function (b) {
        b.setAttribute('aria-checked', b.getAttribute('data-mode-value') === mode ? 'true' : 'false');
      });
      menu.querySelectorAll('.pm6-tt-family').forEach(function (row) {
        var on = row.getAttribute('data-family') === family;
        row.classList.toggle('is-selected', on);
        row.setAttribute('aria-checked', on ? 'true' : 'false');
        row.querySelectorAll('.pm6-tt-chip').forEach(function (chip) {
          chip.classList.toggle('is-active', chip.getAttribute('data-chip') === family + '-' + scheme);
        });
      });
    }
  }

  function tbMenuIsOpen(menu) {
    var sprout = window.PM6_SPROUT;
    if (sprout && sprout.isOpen) return sprout.isOpen(menu);
    return !!(menu && menu.classList.contains('is-open'));
  }
  /* A title-bar menu hangs below the bar over the page, and the bar is a stacking context (z-index 50) beneath the
     panels' resize strips (z-index 100; it stays there so the switcher's chips, at 51, are drawn over it). The strips are
     clear, so a menu over one looked whole but gave the strip its clicks: the project menu's rows, which reach the left
     panel's edge, started a resize drag instead of a pick (Retro at full width). While one of the bar's menus is open
     the strips take no pointer (style-002.css, .app-shell[data-tb-menu-open]). */
  function tbMenuShield() {
    var shell = document.querySelector('.app-shell');
    if (!shell) return;
    var open = false;
    document.querySelectorAll('.title-bar .pm6-tb-menu').forEach(function (m) { if (!open && tbMenuIsOpen(m)) open = true; });
    if (open !== shell.hasAttribute('data-tb-menu-open')) { if (open) shell.setAttribute('data-tb-menu-open', ''); else shell.removeAttribute('data-tb-menu-open'); }
  }
  function tbMenuOpen(menu, btn) {
    var sprout = window.PM6_SPROUT;
    if (sprout && sprout.open) sprout.open(menu, null, btn);
    else if (menu) {
      menu.classList.add('is-open');
      menu.classList.remove('is-closing');
      menu.style.display = 'block';
    }
    tbMenuShield();
  }
  function tbMenuClose(menu) {
    var sprout = window.PM6_SPROUT;
    if (sprout && sprout.close) sprout.close(menu);
    else if (menu) {
      menu.classList.remove('is-open', 'is-closing', 'active');
      menu.style.display = 'none';
    }
    tbMenuShield();
  }
  function tbCloseAllMenus(except) {
    document.querySelectorAll('.pm6-tb-menu').forEach(function (m) {
      if (except && m === except) return;
      if (tbMenuIsOpen(m)) tbMenuClose(m);
      var wrap = m.closest('.pm6-tb-menu-wrap');
      var btn = wrap && wrap.querySelector('.pm6-tb-menu-trigger');
      if (btn && btn.getAttribute('aria-expanded') !== 'false') btn.setAttribute('aria-expanded', 'false');   /* O55: only a change (T8) */
    });
  }

  window.PM_THEME = {
    get: function () {
      return document.documentElement.getAttribute('data-theme') ||
        (themeState.family + '-' + themeResolveScheme(themeState.mode));
    },
    getFamily: function () { return themeState.family; },
    getMode: function () { return themeState.mode; },
    setFamily: function (f, opts) {
      return themeApply(f, themeState.mode, opts || {});
    },
    setMode: function (m, opts) {
      return themeApply(themeState.family, m, opts || {});
    },
    /* legacy/settings path: full slug ('retro-light') parses into
       family + EXPLICIT mode (a slug pick can never mean auto) */
    set: function (t, opts) {
      var m = PM_THEME_SLUG_RE.exec(t || '');
      if (!m) return themeApply(themeState.family, themeState.mode, opts || {});
      return themeApply(m[1], m[2], opts || {});
    },
    syncChrome: function () { themeSyncChrome(); }
  };

  function wireTheme() {
    var btn = byId('themeSelect');
    var menu = byId('themeMenu');
    if (!btn || !menu) return;

    /* boot: adopt the head-snippet state (already migrated + resolved pre-paint);
       re-persist so a legacy-only profile gains the family/mode keys. */
    var st = { family: 'basic', mode: 'dark' };
    themeApply(st.family, st.mode, { dispatch: false, persist: false });

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (window.PM_TB_SEARCH && window.PM_TB_SEARCH.close) window.PM_TB_SEARCH.close();
      var open = tbMenuIsOpen(menu);
      tbCloseAllMenus(open ? null : menu);
      if (open) {
        tbMenuClose(menu);
        btn.setAttribute('aria-expanded', 'false');
      } else {
        tbMenuOpen(menu, btn);
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    menu.addEventListener('click', function (ev) {
      var seg = ev.target && ev.target.closest ? ev.target.closest('.pm6-tt-mode[data-mode-value]') : null;
      if (seg) {
        ev.preventDefault();
        var modeValue = seg.getAttribute('data-mode-value');   /* O55: the radio answers first (B4) */
        menu.querySelectorAll('.pm6-tt-mode').forEach(function (b) { b.setAttribute('aria-checked', b === seg ? 'true' : 'false'); });
        if (window.PM_THEME_TRANSITION) window.PM_THEME_TRANSITION(function () { window.PM7_SETTINGS_TOME.setChromeThemeMode(modeValue); }, { mode: modeValue });
        else window.PM7_SETTINGS_TOME.setChromeThemeMode(modeValue);
        return; /* mode is a filter, not a final pick: menu stays open */
      }
      var row = ev.target && ev.target.closest ? ev.target.closest('.pm6-tt-family[data-family]') : null;
      if (!row) return;
      ev.preventDefault();
      var familyValue = row.getAttribute('data-family');   /* O55: the row answers first (B4) */
      menu.querySelectorAll('.pm6-tt-family').forEach(function (r) { var on = r === row; r.classList.toggle('is-selected', on); r.setAttribute('aria-checked', on ? 'true' : 'false'); });
      if (window.PM_THEME_TRANSITION) window.PM_THEME_TRANSITION(function () { window.PM7_SETTINGS_TOME.setChromeThemeFamily(familyValue); }, { family: familyValue });
      else window.PM7_SETTINGS_TOME.setChromeThemeFamily(familyValue);
      tbMenuClose(menu);
      btn.setAttribute('aria-expanded', 'false');
    });

    /* auto mode: re-resolve + reapply when the OS color scheme flips */
    try {
      if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var onSchemeChange = function () {
          if (themeState.mode !== 'auto') return;
          themeApply(themeState.family, themeState.mode, {});
        };
        if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
        else if (mq.addListener) mq.addListener(onSchemeChange);
      }
    } catch (e) {}
  }

  /* ================= the project box (option A "Tab"; F3-661, DL-236) =================
     One of the title bar's tabs: the page tabs' height, type and resting ink, a folder from PMG, a drawn chevron, the
     project's badge, and the chosen tab's chip while its menu is open (style-002.css with the switcher tokens). The menu
     lists every project in two-line rows: renderProjectRow is the one row renderer, and onboarding adds its project through
     PM_PROJECT_BOX.add (O55.shell.selectProject). The badge and each row's state read the work projection,
     PM_WORK.project(id), which keeps B5's order; the box passes it the active project's unsaved shell state. A pick
     dispatches cmd.project.switch_active_tab (B1), Ctrl/Cmd+Enter or Ctrl/Cmd+click cmd.project.open_in_new_workspace_tab
     (B6), and Ctrl+Shift+P opens the menu (ui.project_switcher.open, B2). #projectMenuLabel keeps the bare project name:
     Home, Settings, the dashboard and the sound binding read it. The chosen tab's chip follows the box's width in the same
     frame (glass.js, the #projectMenuWrap observer), and the density ladder runs again whenever the box changes width. */
  /* B5: needs you > blocked > working > unsaved > calm (calm has no mark) */
  var PROJECT_STATES = {
    waiting: { rank: 4, word: 'Needs you' },
    blocked: { rank: 3, word: 'Blocked' },
    working: { rank: 2, word: 'Working' },
    'change-modified': { rank: 1, word: 'Unsaved' }
  };
  var projectLog = [];
  function projectEsc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function projectIcon(name, px) { var G = window.PMG; return G && G.icon ? G.icon(name, px) : ''; }
  /* one state for a project: the highest-ranked key the projection reports, with its phrase */
  function projectNormalize(v) {
    if (!v) return { key: '', say: '' };
    if (typeof v === 'string') return PROJECT_STATES[v] ? { key: v, say: '' } : { key: '', say: '' };
    var keys = Array.isArray(v.keys) ? v.keys.slice() : [v.key], best = '';
    keys.forEach(function (k) { if (PROJECT_STATES[k] && (!best || PROJECT_STATES[k].rank > PROJECT_STATES[best].rank)) best = k; });
    return { key: best, say: best ? String(v.say || '') : '' };
  }
  /* FinalGUISpec 3.4's "unsaved shell state": a Home tab with unsaved changes. Home saves its layout by itself, so its
     open buffers are the only unsaved state, and only the active project has its tabs open (Home fires pm7.home.unsaved
     when a tab's mark changes) */
  function projectUnsaved(id) {
    var P = window.PMW, tabs = P && P.state && P.state.layout && P.state.layout.tabs, sel = projectSelected();
    if (!tabs || !sel || sel.getAttribute('data-project') !== id) return false;
    for (var k in tabs) if (tabs[k] && tabs[k].dirty) return true;
    return false;
  }
  function projectState(id) {
    var W = window.PM_WORK;
    if (!W || typeof W.project !== 'function') return { key: '', say: '' };
    try { return projectNormalize(W.project(id, { unsaved: projectUnsaved(id) })); } catch (e) { return { key: '', say: '' }; }
  }
  function projectInfo(item) {
    var id = item.getAttribute('data-project') || '';
    return {
      id: id, name: item.getAttribute('data-project-name') || id, path: item.getAttribute('data-project-path') || '',
      branch: item.getAttribute('data-project-branch') || '', stack: item.getAttribute('data-project-stack') || ''
    };
  }
  /* the path summary (FinalGUISpec 3.4, B3): the hover tag and the rows carry it, the box shows the name */
  function projectWhere(info, on) { return info.path ? info.path + (info.branch ? (on ? ' on ' : ' · ') + info.branch : '') : info.branch; }
  function projectMonogram(name) { var m = /[A-Za-z0-9]/.exec(name || ''); return m ? m[0].toUpperCase() : '?'; }
  function projectRows() { var menu = byId('projectMenu'); return menu ? $all('.pm6-tb-menu-item[data-project]', menu) : []; }
  function projectSelected() {
    var rows = projectRows();
    for (var i = 0; i < rows.length; i++) if (rows[i].classList.contains('is-selected')) return rows[i];
    return rows[0] || null;
  }
  /* the one row renderer: a monogram tile, the name, the path and branch, and the state in words beside its mark */
  function renderProjectRow(item) {
    var info = projectInfo(item), st = projectState(info.id), where = projectWhere(info, false), G = window.PMG;
    var word = st.key ? PROJECT_STATES[st.key].word : '', sig = [info.name, where, st.key, !!G].join('|');
    if (item.__pmProjectRow === sig) return item;
    item.__pmProjectRow = sig;
    item.setAttribute('data-state', st.key || 'idle');
    item.setAttribute('aria-label', info.name + (where ? ', ' + projectWhere(info, true) : '') + (word ? ', ' + word : ''));
    item.innerHTML = '<span class="pm6-tb-project-tile" aria-hidden="true">' + projectEsc(projectMonogram(info.name)) + '</span>' +
      '<span class="pm6-tb-project-text"><b class="pm6-tb-project-name">' + projectEsc(info.name) + '</b>' +
      (where ? '<small class="pm6-tb-project-path">' + projectEsc(where) + '</small>' : '') + '</span>' +
      '<span class="pm6-tb-project-state" aria-hidden="true">' + (st.key && G && G.calm ? G.calm(st.key, 12) + '<span>' + projectEsc(word) + '</span>' : '') + '</span>';
    return item;
  }
  function renderProjectAll(item) {
    if (!item || item.__pmProjectRow === 'all' || !window.PMG) return;
    item.__pmProjectRow = 'all';
    item.innerHTML = '<span class="pm6-tb-project-tile" aria-hidden="true">' + projectIcon('grid', 14) + '</span>' +
      '<span class="pm6-tb-project-text"><b class="pm6-tb-project-name">All projects</b></span>' +
      '<span class="pm6-tb-project-state" aria-hidden="true">' + projectIcon('arrow-right', 13) + '</span>';
  }
  /* the box: its folder and chevron once, its badge whenever the state changes, its hover tag (the name, then the path
     summary, the stack and the state: B3) and its name for assistive tech (the folded box keeps the name) */
  function paintProjectButton() {
    var btn = byId('projectMenuBtn'), label = byId('projectMenuLabel'), wrap = byId('projectMenuWrap');
    if (!btn || !label) return false;
    var item = projectSelected(), info = item ? projectInfo(item) : { id: label.textContent.trim(), name: label.textContent.trim(), path: '', branch: '', stack: '' };
    var name = label.textContent.trim() || info.name, st = projectState(info.id), G = window.PMG, widthMoved = false;
    var ico = btn.querySelector('.pm6-tb-project-ico'), chev = btn.querySelector('.pm6-tb-project-chevron'), badge = btn.querySelector('.pm6-tb-project-badge');
    if (G && ico && !ico.firstChild) ico.innerHTML = projectIcon('folder', 15);
    if (G && chev && !chev.firstChild) chev.innerHTML = projectIcon('chevron-down', 12);
    if (badge && G && badge.getAttribute('data-k') !== (st.key || 'idle')) {
      badge.setAttribute('data-k', st.key || 'idle');
      if (badge.hidden !== !st.key) widthMoved = true;
      badge.innerHTML = st.key ? (st.key === 'change-modified' ? G.calm(st.key, 12) : G.status(st.key, 12)) : '';
      badge.hidden = !st.key;
    }
    if (btn.getAttribute('data-state') !== (st.key || 'idle')) btn.setAttribute('data-state', st.key || 'idle');
    var word = st.key ? PROJECT_STATES[st.key].word : '', say = st.say || word;
    var detail = [projectWhere(info, true), info.stack, say].filter(Boolean).join(' · ') + '. Switch project: Ctrl+Shift+P';
    if (btn.getAttribute('data-pm-hover-label') !== name) btn.setAttribute('data-pm-hover-label', name);
    if (btn.getAttribute('data-pm-hover-detail') !== detail) btn.setAttribute('data-pm-hover-detail', detail);
    var folded = wrap && wrap.getAttribute('data-mode') === 'icon';
    var aria = folded || say ? 'Project: ' + name + (say ? ', ' + say : '') : '';
    if (aria) { if (btn.getAttribute('aria-label') !== aria) btn.setAttribute('aria-label', aria); }
    else if (btn.hasAttribute('aria-label')) btn.removeAttribute('aria-label');
    return widthMoved;
  }
  function refreshProjectBox() {
    var menu = byId('projectMenu');
    projectRows().forEach(renderProjectRow);
    if (menu) renderProjectAll(menu.querySelector('.pm6-tb-project-all'));
    if (paintProjectButton() && window.PM_TB_DENSITY) window.PM_TB_DENSITY.apply();
  }
  function projectNote(kind, id, payload) {
    var row = { kind: kind, id: id, payload: payload || {}, at: Date.now() };
    projectLog.push(row); if (projectLog.length > 50) projectLog.shift();
    try { window.dispatchEvent(new CustomEvent(kind === 'command' ? 'pm7.project.command' : 'pm7.project.ui_action', { detail: row })); } catch (e) {}
  }
  /* the shell state controller's answer in this concept: the chosen row, the label, the box */
  function selectProjectRow(item) {
    var label = byId('projectMenuLabel');
    if (!item) return false;
    var info = projectInfo(item);
    projectRows().forEach(function (el) { if (el.classList.contains('is-selected') !== (el === item)) el.classList.toggle('is-selected', el === item); });
    if (label && label.textContent !== info.name) label.textContent = info.name;
    paintProjectButton();
    return true;
  }
  function projectMenuOpen(focusRow) {
    var btn = byId('projectMenuBtn'), menu = byId('projectMenu');
    if (!btn || !menu) return;
    if (!tbMenuIsOpen(menu)) {
      if (window.PM_TB_SEARCH && window.PM_TB_SEARCH.close) window.PM_TB_SEARCH.close();
      tbCloseAllMenus(menu);
      refreshProjectBox();
      tbMenuOpen(menu, btn);
      btn.setAttribute('aria-expanded', 'true');
      projectNote('ui', 'ui.project_switcher.open');
    }
    if (focusRow) { var row = projectSelected(); if (row) try { row.focus({ preventScroll: true }); } catch (e) { row.focus(); } }
  }
  function projectMenuClose(refocus) {
    var btn = byId('projectMenuBtn'), menu = byId('projectMenu');
    if (!btn || !menu) return;
    var had = menu.contains(document.activeElement);
    if (tbMenuIsOpen(menu)) { tbMenuClose(menu); projectNote('ui', 'ui.project_switcher.close'); }
    if (btn.getAttribute('aria-expanded') !== 'false') btn.setAttribute('aria-expanded', 'false');
    if (refocus || had) try { btn.focus({ preventScroll: true }); } catch (e) {}
  }
  function pickProject(item, newTab, viaKey) {
    var info = projectInfo(item);
    projectNote('command', newTab ? 'cmd.project.open_in_new_workspace_tab' : 'cmd.project.switch_active_tab', { project_id: info.id, source: 'title_bar_project_box' });
    selectProjectRow(item);
    projectMenuClose(viaKey);
  }

  function wireProjectMenu() {
    var btn = byId('projectMenuBtn');
    var menu = byId('projectMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (tbMenuIsOpen(menu)) projectMenuClose(false);
      else projectMenuOpen(ev.detail === 0);
    });
    btn.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowDown' || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      ev.preventDefault();
      projectMenuOpen(true);
    });

    menu.addEventListener('click', function (ev) {
      var t = ev.target && ev.target.closest ? ev.target : null;
      if (t && t.closest('.pm6-tb-project-all')) {
        ev.preventDefault();
        projectNote('ui', 'ui.project_switcher.all_projects', { tab_id: 'projects' });
        projectMenuClose(false);
        try { if (window.PM_PAGES && window.PM_PAGES.go) window.PM_PAGES.go('projects'); } catch (e0) {}
        return;
      }
      var item = t ? t.closest('.pm6-tb-menu-item[data-project]') : null;
      if (!item) return;
      ev.preventDefault();
      pickProject(item, ev.ctrlKey || ev.metaKey, ev.detail === 0);
    });
    /* the menu's keys: arrows, Home and End move between rows; Ctrl/Cmd+Enter opens a row in a new workspace tab;
       Escape closes and hands focus back to the box (the page-wide Escape closes every other menu) */
    menu.addEventListener('keydown', function (ev) {
      var items = $all('.pm6-tb-menu-item', menu), i = items.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp' || ev.key === 'Home' || ev.key === 'End') {
        ev.preventDefault();
        var n = ev.key === 'Home' ? 0 : ev.key === 'End' ? items.length - 1 : ev.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        if (items[n]) items[n].focus({ preventScroll: true });
      } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        var row = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.pm6-tb-menu-item[data-project]') : null;
        if (!row || !menu.contains(row)) return;
        ev.preventDefault();
        pickProject(row, true, true);
      } else if (ev.key === 'Escape') {
        projectMenuClose(true);
      }
    });
    /* Ctrl+Shift+P (FinalGUISpec's keyboard table; F3-058): open the menu on the chosen row. Never under the onboarding
       window or the tour, which cover the title bar. */
    document.addEventListener('keydown', function (ev) {
      if (!(ev.ctrlKey || ev.metaKey) || !ev.shiftKey || ev.altKey || ev.code !== 'KeyP' || ev.repeat) return;
      var root = document.documentElement;
      if (root.hasAttribute('data-o55-open') || root.hasAttribute('data-o55-tour')) return;
      ev.preventDefault();
      ev.stopPropagation();
      projectMenuOpen(true);
    }, true);

    refreshProjectBox();
    /* PMG and the work projection are head modules, so both are here first; the projection says when its states change
       (also as the window event, which is all this listens to), and Home when a tab gains or loses unsaved changes */
    window.addEventListener('pm7.work.changed', refreshProjectBox);
    window.addEventListener('pm7.home.unsaved', refreshProjectBox);

    window.PM_PROJECT_BOX = {
      /* the one row renderer: a row element with data-project (and data-project-name, -path, -branch, -stack) */
      row: renderProjectRow,
      /* a project the menu does not list yet: a row from the renderer, first in the list */
      add: function (id, info) {
        info = info || {};
        var found = projectRows().filter(function (r) { return r.getAttribute('data-project') === id; })[0];
        if (found) return found;
        var item = document.createElement('button');
        item.type = 'button'; item.className = 'pm6-tb-menu-item'; item.setAttribute('role', 'menuitem');
        item.setAttribute('data-project', id);
        if (info.name && info.name !== id) item.setAttribute('data-project-name', info.name);
        ['path', 'branch', 'stack'].forEach(function (k) { if (info[k]) item.setAttribute('data-project-' + k, info[k]); });
        item.setAttribute('data-command-id', 'cmd.project.switch_active_tab');
        item.setAttribute('data-binding-id', 'shell.project.pick');
        var first = projectRows()[0];
        menu.insertBefore(renderProjectRow(item), first || menu.querySelector('.pm6-tb-project-sep'));
        return item;
      },
      select: function (id) { return selectProjectRow(projectRows().filter(function (r) { return r.getAttribute('data-project') === id; })[0] || null); },
      state: projectState,
      states: function () { return Object.keys(PROJECT_STATES); },
      refresh: refreshProjectBox,
      open: function () { projectMenuOpen(false); },
      close: function () { projectMenuClose(false); },
      log: function () { return projectLog.slice(); }
    };
  }

  function wireTitleBarMenusDismiss() {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t && t.closest && t.closest('.pm6-tb-menu-wrap')) return;
      if (t && t.closest && t.closest('.pm6-tb-search-wrap')) return;
      tbCloseAllMenus(null);
      if (window.PM_TB_SEARCH && window.PM_TB_SEARCH.close) window.PM_TB_SEARCH.close();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        tbCloseAllMenus(null);
        if (window.PM_TB_SEARCH && window.PM_TB_SEARCH.close) window.PM_TB_SEARCH.close();
      }
    });
  }

  /* ================= title-bar density: theme → search → notify → project → page ▼ ===== */
  function wireTitleBarDensity() {
    var bar = document.querySelector('.title-bar');
    var wrap = byId('tbSearchWrap');
    var inline = byId('tbSearchInput');
    var btn = byId('tbSearchBtn');
    var pop = byId('tbSearchPop');
    var popInput = byId('tbSearchPopInput');
    var notify = byId('notifySlot');
    var themeWrap = byId('themeMenuWrap');
    var projectWrap = byId('projectMenuWrap');
    if (!bar || !wrap || !inline || !btn || !pop || !notify || !themeWrap || !projectWrap) return;

    function searchMaxPx() {
      try {
        wrap.style.removeProperty('--tb-search-w');
        var raw = getComputedStyle(wrap).getPropertyValue('--tb-search-w').trim();
        var n = parseFloat(raw);
        if (isFinite(n) && n > 0) return n;
      } catch (e) {}
      return 170;
    }
    var SEARCH_MIN = 112;
    var NOTIFY_MAX = 248;
    var NOTIFY_MIN = 120;
    var THEME_ICON = 32;
    var PROJECT_ICON = 32;
    var popOpen = false;
    var closeTimer = null;
    var raf = null;
    var fullThemeW = 0;
    var fullProjectW = 0;
    /* T36: set after responsive title-bar geometry changes, or when
       page.changed selects a tab currently in the overflow menu. Normal
       wide-tab page-change spring motion stays intact. */
    var pageInkResyncPending = false;

    function reduced() {
      try {
        return document.documentElement.getAttribute('data-motion') === 'reduced' ||
          (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }

    function openPop() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      popOpen = true;
      pop.classList.remove('is-closing');
      pop.classList.add('open', 'is-open');
      btn.setAttribute('aria-expanded', 'true');
      if (popInput) {
        popInput.value = inline.value || '';
        try { popInput.focus(); popInput.select(); } catch (e0) {}
      }
    }
    function closePop() {
      if (!popOpen && !pop.classList.contains('open') && !pop.classList.contains('is-open')) return;
      popOpen = false;
      btn.setAttribute('aria-expanded', 'false');
      if (popInput && inline) inline.value = popInput.value || inline.value;
      if (reduced()) {
        pop.classList.remove('open', 'is-open', 'is-closing');
        return;
      }
      pop.classList.add('is-closing');
      pop.classList.remove('open', 'is-open');
      closeTimer = setTimeout(function () {
        pop.classList.remove('is-closing');
        closeTimer = null;
      }, 240);
    }

    window.PM_TB_SEARCH = {
      open: openPop,
      close: closePop,
      isOpen: function () { return popOpen; }
    };

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      tbCloseAllMenus(null);
      if (popOpen) closePop();
      else openPop();
    });

    if (popInput) {
      popInput.addEventListener('input', function () {
        inline.value = popInput.value;
      });
      popInput.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') { ev.stopPropagation(); closePop(); }
      });
    }

    function setSearchW(px) {
      wrap.style.setProperty('--tb-search-w', px + 'px');
    }
    function setNotifyW(px) {
      notify.style.setProperty('--rs-stack-w', px + 'px');
      notify.style.width = px + 'px';
    }
    function setSearchMode(mode) {
      wrap.setAttribute('data-mode', mode);
      if (mode === 'icon') {
        btn.hidden = false;
        inline.setAttribute('aria-hidden', 'true');
      } else {
        btn.hidden = true;
        inline.removeAttribute('aria-hidden');
        closePop();
      }
    }
    function setThemeMode(mode) {
      themeWrap.setAttribute('data-mode', mode);
      var trig = byId('themeSelect');
      if (trig) {
        if (mode === 'icon') trig.setAttribute('aria-label', 'Theme');
        else trig.removeAttribute('aria-label');
      }
    }
    function setProjectMode(mode) {
      if (projectWrap.getAttribute('data-mode') === mode) return;
      projectWrap.setAttribute('data-mode', mode);
      paintProjectButton();   /* the folded box keeps the project's name for assistive tech */
    }

    var pageStrip = document.querySelector('.title-bar .page-tabs');
    var moreWrap = byId('pageTabsMoreWrap');
    var moreBtn = byId('pageTabsMoreBtn');
    var moreMenu = byId('pageTabsMoreMenu');
    var PAGE_ICONS = {
      dashboard: 'home',
      projects: 'folder',
      wizard: 'wand',
      orchestrator: 'layers',
      usage: 'dial',
      settings: 'gear'
    };

    function pageTabs() {
      if (!pageStrip) return [];
      return Array.prototype.slice.call(pageStrip.querySelectorAll('.page-tab[data-page]'));
    }
    function resetPageTabsOverflow() {
      pageTabs().forEach(function (t) { t.classList.remove('is-overflow'); });
      if (moreWrap) moreWrap.hidden = true;
      if (moreMenu) moreMenu.innerHTML = '';
      if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false');
      if (moreMenu && tbMenuIsOpen(moreMenu)) tbMenuClose(moreMenu);
      bar.removeAttribute('data-tb-tabs');
    }
    function rebuildPageOverflowMenu(hiddenTabs) {
      if (!moreMenu || !moreWrap) return;
      moreMenu.innerHTML = '';
      if (!hiddenTabs.length) {
        moreWrap.hidden = true;
        return;
      }
      moreWrap.hidden = false;
      var icons = window.PM_ICONS || {};
      hiddenTabs.forEach(function (t) {
        var page = t.getAttribute('data-page') || '';
        var label = (t.textContent || page).trim();
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pm6-tb-menu-item pm6-tb-pages-more-item';
        btn.setAttribute('role', 'menuitem');
        btn.setAttribute('data-page', page);
        if (t.classList.contains('active')) btn.classList.add('is-selected');
        var icoKey = PAGE_ICONS[page];
        var icoHtml = (icoKey && icons[icoKey]) ? icons[icoKey] : '';
        btn.innerHTML = icoHtml + '<span></span>';
        var span = btn.querySelector('span');
        if (span) span.textContent = label;
        moreMenu.appendChild(btn);
      });
    }
    function fitPageTabsOverflow() {
      if (!pageStrip || !moreWrap) return;
      resetPageTabsOverflow();
      void bar.offsetWidth;
      if (naturalOverflow() <= 0) return;

      moreWrap.hidden = false;
      void moreWrap.offsetWidth;
      var guard = 12;
      while (naturalOverflow() > 0 && guard-- > 0) {
        var tabs = pageTabs().filter(function (t) {
          return !t.classList.contains('is-overflow');
        });
        var hide = null;
        for (var i = tabs.length - 1; i >= 0; i--) {
          if (!tabs[i].classList.contains('active')) { hide = tabs[i]; break; }
        }
        if (!hide && tabs.length > 1) hide = tabs[tabs.length - 1];
        if (!hide) break;
        hide.classList.add('is-overflow');
      }
      var hidden = pageTabs().filter(function (t) {
        return t.classList.contains('is-overflow');
      });
      rebuildPageOverflowMenu(hidden);
      if (hidden.length) bar.setAttribute('data-tb-tabs', 'overflow');
    }

    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (window.PM_TB_SEARCH && window.PM_TB_SEARCH.close) window.PM_TB_SEARCH.close();
        var open = tbMenuIsOpen(moreMenu);
        tbCloseAllMenus(open ? null : moreMenu);
        if (open) {
          tbMenuClose(moreMenu);
          moreBtn.setAttribute('aria-expanded', 'false');
        } else {
          tbMenuOpen(moreMenu, moreBtn);
          moreBtn.setAttribute('aria-expanded', 'true');
        }
      });
      moreMenu.addEventListener('click', function (ev) {
        var item = ev.target && ev.target.closest ? ev.target.closest('.pm6-tb-menu-item[data-page]') : null;
        if (!item) return;
        ev.preventDefault();
        var page = item.getAttribute('data-page');
        tbMenuClose(moreMenu);
        moreBtn.setAttribute('aria-expanded', 'false');
        try {
          if (window.PM_PAGES && window.PM_PAGES.go) window.PM_PAGES.go(page);
        } catch (e0) {}
        schedule();
      });
    }

    function measureThemeFull() {
      setThemeMode('full');
      void themeWrap.offsetWidth;
      fullThemeW = Math.max(themeWrap.offsetWidth || 0, themeWrap.scrollWidth || 0, THEME_ICON + 40);
      return fullThemeW;
    }
    function measureProjectFull() {
      setProjectMode('full');
      void projectWrap.offsetWidth;
      fullProjectW = Math.max(projectWrap.offsetWidth || 0, projectWrap.scrollWidth || 0, PROJECT_ICON + 40);
      return fullProjectW;
    }

    function naturalOverflow() {
      var gap = 0;
      var pad = 0;
      try {
        var cs = window.getComputedStyle(bar);
        gap = parseFloat(cs.gap) || 0;
        pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      } catch (e1) {}
      function hMargins(el) {
        try {
          var m = window.getComputedStyle(el);
          /* auto margins (the notify slot's centering spacers) must not count
             as needed width */
          var ml = m.marginLeft;
          var mr = m.marginRight;
          var left = (ml === 'auto') ? 0 : (parseFloat(ml) || 0);
          var right = (mr === 'auto') ? 0 : (parseFloat(mr) || 0);
          return left + right;
        } catch (e2) { return 0; }
      }
      var kids = Array.prototype.slice.call(bar.children);
      var sum = 0;
      kids.forEach(function (el, i) {
        if (i) sum += gap;
        var w = 0;
        if (el === wrap) {
          var mode = wrap.getAttribute('data-mode');
          if (mode === 'icon') w = 32;
          else w = parseFloat(wrap.style.getPropertyValue('--tb-search-w')) || searchMaxPx();
          /* the wrap's own horizontal padding (min-gap guard against the
             centered notify slot) is real width on top of --tb-search-w */
          try {
            var wcs = window.getComputedStyle(wrap);
            w += (parseFloat(wcs.paddingLeft) || 0) + (parseFloat(wcs.paddingRight) || 0);
          } catch (e3) {}
        } else if (el === notify) {
          w = parseFloat(notify.style.getPropertyValue('--rs-stack-w')) || NOTIFY_MAX;
        } else if (el === themeWrap) {
          if (themeWrap.getAttribute('data-mode') === 'icon') w = THEME_ICON;
          else w = fullThemeW || Math.max(el.offsetWidth || 0, el.scrollWidth || 0);
        } else if (el === projectWrap) {
          if (projectWrap.getAttribute('data-mode') === 'icon') w = PROJECT_ICON;
          else w = fullProjectW || Math.max(el.offsetWidth || 0, el.scrollWidth || 0);
        } else if (el === pageStrip) {
          /* Sum visible tabs + more chip so a constrained nav box cannot
             under-count needed width (offsetWidth alone stalled density). */
          var tw = 0;
          pageTabs().forEach(function (t) {
            if (t.classList.contains('is-overflow')) return;
            tw += Math.max(t.offsetWidth || 0, t.scrollWidth || 0);
          });
          if (moreWrap && !moreWrap.hidden) {
            tw += Math.max(moreWrap.offsetWidth || 0, moreWrap.scrollWidth || 0);
          }
          w = Math.max(tw, el.offsetWidth || 0, el.scrollWidth || 0);
        } else {
          w = Math.max(el.offsetWidth || 0, el.scrollWidth || 0);
        }
        sum += w;
        /* the notify slot owns both auto margins (free-space absorbers for
           centering); hMargins zeroes autos, so every child counts safely */
        sum += hMargins(el);
      });
      /* clientWidth includes padding; flex kids live in content box */
      return sum - (bar.clientWidth - pad);
    }

    function applyDensity() {
      var SEARCH_MAX = searchMaxPx();
      setSearchMode('full');
      setThemeMode('icon');
      setProjectMode('full');
      setSearchW(SEARCH_MAX);
      setNotifyW(NOTIFY_MAX);
      resetPageTabsOverflow();
      void bar.offsetWidth;
      measureProjectFull();

      var over = naturalOverflow();
      if (over <= 0) return;

      var need = over;

      /* Theme trigger stays icon-only; family name lives in the menu/tooltip. */

      /* 1) Compress search SEARCH_MAX → SEARCH_MIN */
      var searchW = SEARCH_MAX;
      if (need > 0) {
        var cut = Math.min(need, SEARCH_MAX - SEARCH_MIN);
        searchW = SEARCH_MAX - cut;
        setSearchW(searchW);
        need -= cut;
      }
      if (need <= 0) return;

      /* 2) Search → icon */
      setSearchMode('icon');
      need -= (searchW - 32);
      if (need <= 0) return;

      /* 3) Shorten notify NOTIFY_MAX → NOTIFY_MIN */
      if (need > 0) {
        var ncut = Math.min(need, NOTIFY_MAX - NOTIFY_MIN);
        setNotifyW(NOTIFY_MAX - ncut);
        need -= ncut;
      }
      if (need <= 0) return;

      /* 4) Project label → folder icon */
      var pw = fullProjectW || measureProjectFull();
      setProjectMode('icon');
      need -= Math.max(0, pw - PROJECT_ICON);
      if (need <= 0) return;

      /* 5) Progressive page-tab overflow → ▼ sprout (last resort) */
      if (naturalOverflow() > 0) fitPageTabsOverflow();
    }

    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        raf = null;
        applyDensity();
        if (pageInkResyncPending) {
          pageInkResyncPending = false;
          if (window.PM7_PAGE_TAB_INK && typeof window.PM7_PAGE_TAB_INK.resync === 'function') {
            window.PM7_PAGE_TAB_INK.resync();
          }
        }
      });
    }

    setSearchW(searchMaxPx());
    setNotifyW(NOTIFY_MAX);
    setSearchMode('full');
    setThemeMode('icon');
    setProjectMode('full');
    resetPageTabsOverflow();
    schedule();

    /* The project box changes width with the project's name and its badge, not only with the bar: the ladder runs
       again at once, in the task that changed it (a label written anywhere: a pick, onboarding, Demo Studio), so the
       frame that draws the new name already draws the fold that fits it, and the tabs and their chip (glass.js) move
       once, together. */
    function applyNow() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      applyDensity();
      if (window.PM7_PAGE_TAB_INK && typeof window.PM7_PAGE_TAB_INK.resync === 'function' && bar.getAttribute('data-tb-tabs') === 'overflow') window.PM7_PAGE_TAB_INK.resync();
    }
    var projectLabel = byId('projectMenuLabel');
    if (projectLabel && typeof MutationObserver === 'function') {
      new MutationObserver(applyNow).observe(projectLabel, { childList: true, characterData: true, subtree: true });
    }
    window.PM_TB_DENSITY = { apply: applyNow, schedule: schedule };

    if (typeof ResizeObserver !== 'undefined') {
      var lastBarWidth = bar.getBoundingClientRect().width;
      var ro = new ResizeObserver(function (entries) {
        var width = entries.length ? entries[entries.length - 1].contentRect.width : lastBarWidth;
        if (Math.abs(width - lastBarWidth) < .5) return;
        lastBarWidth = width;
        pageInkResyncPending = true;
        schedule();
      });
      ro.observe(bar);
    } else {
      window.addEventListener('resize', function () {
        pageInkResyncPending = true;
        schedule();
      });
    }
    try {
      if (window.PM_DEMO && typeof window.PM_DEMO.on === 'function') {
        window.PM_DEMO.on('page.changed', function (payload) {
          var pageId = payload && payload.page;
          var activeTab = pageId && pageStrip
            ? pageStrip.querySelector('.page-tab[data-page="' + pageId + '"]')
            : null;
          if (activeTab && activeTab.classList.contains('is-overflow')) {
            pageInkResyncPending = true;
            schedule();
          } else if (moreMenu) {
            moreMenu.querySelectorAll('.pm6-tb-pages-more-item[data-page]').forEach(function (item) {
              item.classList.toggle('is-selected', item.getAttribute('data-page') === pageId);
            });
          }
        });
      }
    } catch (e3) {}
  }

  /* ================= boot ================= */
  function boot() {
    try { wireActivityBar(); } catch (e) { console.warn('[pm6] wireActivityBar', e); }
    try { initActivityBarCustomization(); } catch (e) { console.warn('[pm6] initActivityBarCustomization', e); }
    try { wireTheme(); } catch (e) {}
    try { wireProjectMenu(); } catch (e) {}
    try { wireTitleBarMenusDismiss(); } catch (e) {}
    try { wireTitleBarDensity(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
