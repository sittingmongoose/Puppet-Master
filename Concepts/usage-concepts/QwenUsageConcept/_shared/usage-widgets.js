/* usage-concepts/_shared/usage-widgets.js
   The ONE DRY widget canvas for the Usage concepts (U7/U8/U9 all consume this
   module; U1/U2 never import it). Host-agnostic so Home/Orchestrator can adopt
   it later (Rebuild Plan L47).

   Contract:
   - Sizing is FREE grid-span (cols 1..tracks, rows 2..40, no snap on release)
     per cmd.widget.resize (UCC L377). S/M/L/XL are NON-BINDING preset
     shortcuts; when the span matches no preset the kebab shows "Custom"
     (gap G3 resolution: presets sit on top of free resize, never constrain).
   - Persistence: localStorage "pmw:<pageId>" as {v:2, items:[{uid,type,c,r,
     cfg,focus}]}. v1 bare arrays migrate on load; unknown/retired types are
     filtered (never rendered as empty shells); PMWidgets.reset(canvas)
     restores defaults (cmd.widget.reset_layout, UCC L380).
   - Menus ride the shared PMMenu sprout registry (one popup at a time,
     ACD-438): opening cross-closes PMMenu AND PMContext; the private
     menuSprout re-implementation is gone.
    - Focus mode: single widget at a time, scrim behind, Esc exits, persisted.
     - Entrance (uwIn) fires ONLY on mount/add/reset via .uw-enter, as a
       staggered wave: each entering widget is delayed --mo-stagger × its
       flow-order index (capped so the board lands < ~700ms); resize and
       drag-reorder use FLIP and never replay it. Reduced motion skips FLIP
       and the stagger (USrender.isRM) and the themes.css kill-switch freezes
       the rest.
    - Live behaviors: opt-in per-canvas intervals (PMWidgets.startLive /
      def.live hooks) so concepts don't each re-implement timers; everything
      is cleared on unmount.
     - Drag is REORDER (item order flows through the responsive grid; tiles
       never overlap): grab lifts a fixed clone that follows the pointer 1:1,
       a .uw.is-placeholder ghost marks the landing slot, neighbors reflow
       LIVE via DOM move + FLIP (bodies never re-render), drop settles with
       the widget-drop token; Esc/pointercancel/blur revert, drop-in-place
       and revert never save. Free x/y placement was retired with the U8 freeform
      engine; a stored {v:2, layout:'free'} envelope still loads — layout/x/y
      are ignored and the mirrored c/r spans normalize it on first save.

    Slint note: FLIP/rect-measurement is prototype-only; the Rust port animates
    the c/r spans from the same item model (motion-to-slint-map #9). */
(function () {
  'use strict';
  var R = window.USrender;
  var TYPES = {};
  var MOUNTS = [];
  var VERSION = 2;
  var counter = 0;
  var PRESETS = { S: [1, 4], M: [2, 6], L: [3, 8], XL: [4, 7] };
  var PRESET_ORDER = ['S', 'M', 'L', 'XL'];
  var sprout = null, scrim = null, sproutCtx = null, dragState = null, resizeState = null;

  /* kebabV is defined in usage-icons.js, but some hosts (U9) load only the base
     icons.js — register it additively if absent so the module is self-sufficient. */
  if (window.PMIcons && !window.PMIcons.kebabV) {
    window.PMIcons.kebabV = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
  }
  function I(name) { return window.PMIcon ? window.PMIcon(name) : ''; }
  function isRM() { var u = R || window.USrender; return u && typeof u.isRM === 'function' && u.isRM(); } /* late lookup: hosts may load USrender after this module */
  function clampC(n) { n = parseInt(n, 10); return isNaN(n) || n < 1 ? 2 : Math.min(n, 12); }
  function clampR(n) { n = parseInt(n, 10); return isNaN(n) || n < 1 ? 6 : Math.min(n, 40); }

  function register(id, def) { TYPES[id] = def; }
  function typeKnown(t) { return !!TYPES[t]; }
  function spanFor(t) { var s = (TYPES[t] && TYPES[t].span) || [2, 6]; return [clampC(s[0]), clampR(s[1])]; }
  function byUid(canvas, uidv) { return canvas._pmw.items.filter(function (x) { return x.uid === uidv; })[0] || null; }
  function uid() { return 'w' + (++counter) + '_' + Date.now().toString(36); }
  function sizeKeyOf(it) {
    for (var i = 0; i < PRESET_ORDER.length; i++) {
      var p = PRESETS[PRESET_ORDER[i]];
      if (p[0] === it.c && p[1] === it.r) return PRESET_ORDER[i];
    }
    return 'custom';
  }

  /* ---------- persistence: v2 envelope + v1 migration + unknown filtering --- */
  function keyFor(pageId) { return 'pmw:' + pageId; }
  /* retired free envelopes ({v:2, layout:'free', items with x/y/w/h}) load
     through the same path: layout/x/y are ignored and the mirrored c/r spans
     normalize every item back to the grid envelope on first save. */
  function normItem(it) {
    if (!it || typeof it !== 'object' || !typeKnown(it.type)) return null;
    var c = it.c != null ? it.c : it.w; /* free-envelope fallback: w/h mirror c/r */
    var r = it.r != null ? it.r : it.h;
    return {
      uid: String(it.uid || uid()), type: it.type,
      c: clampC(c), r: clampR(r),
      cfg: (it.cfg && typeof it.cfg === 'object') ? it.cfg : {},
      focus: !!it.focus
    };
  }
  function defaultItems(types) {
    return (types || []).filter(typeKnown).map(function (t) {
      var sp = spanFor(t);
      return { uid: uid(), type: t, c: sp[0], r: sp[1], cfg: {}, focus: false };
    });
  }
  /* curated board: [{type,c,r,cfg?}] — used for first-load seeding AND reset
     when a host passes mount(...,{defaultBoard}); spans fall back to the type
     default when c/r are omitted. Absent a board, behavior is unchanged. */
  function boardItems(board) {
    return (board || []).filter(function (b) { return b && typeKnown(b.type); }).map(function (b) {
      var sp = spanFor(b.type);
      return {
        uid: uid(), type: b.type,
        c: clampC(b.c != null ? b.c : sp[0]), r: clampR(b.r != null ? b.r : sp[1]),
        cfg: (b.cfg && typeof b.cfg === 'object') ? b.cfg : {}, focus: false
      };
    });
  }
  function seedItems(types, board) {
    return board ? boardItems(board) : defaultItems(types);
  }
  function load(pageId, types, board) {
    var items = null, migrated = false;
    try {
      var raw = localStorage.getItem(keyFor(pageId));
      if (raw) {
        var data = JSON.parse(raw);
        var env = Array.isArray(data) ? { v: 1, items: data } : data; /* v1 = bare array */
        if (env && (env.v === 1 || env.v === 2) && Array.isArray(env.items)) {
          migrated = env.v === 1 || env.layout === 'free'; /* free envelope -> rewritten as plain grid on first save */
          items = [];
          env.items.forEach(function (it) { var n = normItem(it); if (n) items.push(n); });
          if (!items.length && env.items.length) items = null; /* every stored type retired -> repair with defaults */
          var seenFocus = false; /* single-focus invariant */
          (items || []).forEach(function (it) { if (it.focus) { if (seenFocus) it.focus = false; seenFocus = true; } });
        }
      }
    } catch (e) {}
    return { items: items || seedItems(types, board), migrated: migrated };
  }
  function save(canvas) {
    var pmw = canvas._pmw;
    try {
      localStorage.setItem(keyFor(pmw.pageId), JSON.stringify({
        v: VERSION,
        items: pmw.items.map(function (it) { return { uid: it.uid, type: it.type, c: it.c, r: it.r, cfg: it.cfg || {}, focus: !!it.focus }; })
      }));
    } catch (e) {}
  }

  /* ---------- sprout menus via PMMenu (ACD-438: one popup at a time) -------- */
  function ensureSprout() {
    if (sprout) return sprout;
    sprout = document.createElement('div');
    sprout.className = 'pm-sprout uw-sprout';
    document.body.appendChild(sprout);
    sprout.addEventListener('click', onSproutClick);
    sprout.addEventListener('keydown', onSproutKeys);
    return sprout;
  }
  function crossClose() {
    if (window.PMMenu && PMMenu.closeAll) PMMenu.closeAll();
    if (window.PMContext && PMContext.closeAll) PMContext.closeAll();
  }
  function anyMenuOpen() {
    return !!document.querySelector('.pm-sprout.is-open, .pm6-tb-menu.is-open, .pm6-chat-more-menu.is-open');
  }
  function placeFixed(sp, r) {
    var sw = sp.offsetWidth || 200, sh = sp.offsetHeight || 160;
    var vw = window.innerWidth, vh = window.innerHeight;
    var below = r.bottom + 6 + sh <= vh - 8;
    var top = below ? r.bottom + 6 : Math.max(8, r.top - sh - 6);
    var left = Math.min(Math.max(8, r.right - sw), vw - sw - 8);
    sp.style.position = 'fixed';
    sp.style.top = top + 'px'; sp.style.left = left + 'px';
    sp.style.right = 'auto'; sp.style.bottom = 'auto';
    sp.style.setProperty('--pm6-sprout-ox', ((r.left + r.width / 2) < (left + sw / 2)) ? '12%' : '88%');
    sp.style.setProperty('--pm6-sprout-oy', below ? '0%' : '100%');
    sp.style.setProperty('--pm6-sprout-ty', below ? '-10px' : '10px');
  }
  function openSprout(html, anchor) {
    var sp = ensureSprout();
    crossClose(); /* close PMMenu sprouts/menus AND context-lens popups first */
    sp.innerHTML = html;
    sp._pmTrigger = anchor || null;
    if (anchor) anchor.setAttribute('aria-haspopup', 'menu');
    if (anchor) placeFixed(sp, anchor.getBoundingClientRect()); /* position before open: PMMenu.open moves focus into the menu, so it must already be on-screen */
    if (window.PMMenu && PMMenu.open) PMMenu.open(sp, null); /* registry + sprout motion; placement is ours (fixed, corner-origin) */
    else { sp.classList.remove('is-closing'); sp.classList.add('is-open'); }
  }
  function closeSprout() {
    if (!sprout) return;
    if (window.PMMenu && PMMenu.close) PMMenu.close(sprout);
    else { sprout.classList.remove('is-open'); sprout.classList.add('is-closing'); }
    if (sprout._pmTrigger) { sprout._pmTrigger.setAttribute('aria-expanded', 'false'); sprout._pmTrigger = null; }
  }
  function sproutOpenFor(anchor) {
    return !!sprout && sprout.classList.contains('is-open') && sprout._pmTrigger === anchor;
  }
  function onSproutKeys(e) {
    var items = Array.prototype.slice.call(sprout.querySelectorAll('[role="menuitem"]:not([disabled])'));
    var idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[idx + 1] || items[0]).focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (items[idx - 1] || items[items.length - 1]).focus(); }
    else if (e.key === 'Home') { e.preventDefault(); if (items[0]) items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); if (items.length) items[items.length - 1].focus(); }
  }
  function anchorFor(ctx) {
    if (ctx.mode === 'picker') return ctx.anchor;
    var host = uwEl(ctx.canvas, ctx.uid);
    return host && host.querySelector('.uw-kebab');
  }
  function reopenKebab(ctx) {
    var it = byUid(ctx.canvas, ctx.uid); if (!it) return;
    sproutCtx = { canvas: ctx.canvas, uid: ctx.uid, mode: 'kebab' };
    openSprout(kebabHTML(it), anchorFor(sproutCtx));
  }

  function onSproutClick(e) {
    e.stopPropagation(); /* keep PMMenu's document-level closeAll from killing our own sprout */
    var ctx = sproutCtx, t;
    if ((t = e.target.closest('[data-pmw-size]'))) {
      if (ctx) { setSize(ctx.canvas, ctx.uid, t.getAttribute('data-pmw-size')); reopenKebab(ctx); }
      return;
    }
    if ((t = e.target.closest('[data-pmw-focus]'))) {
      if (ctx) { var itf = byUid(ctx.canvas, ctx.uid); if (itf) setFocus(ctx.canvas, ctx.uid, !itf.focus); }
      return;
    }
    if ((t = e.target.closest('[data-pmw-config]'))) {
      if (ctx) {
        var itc = byUid(ctx.canvas, ctx.uid);
        if (itc) { sproutCtx = { canvas: ctx.canvas, uid: ctx.uid, mode: 'config' }; openSprout(configFormHTML(itc), anchorFor(sproutCtx)); }
      }
      return;
    }
    if ((t = e.target.closest('[data-cfg-back]'))) { if (ctx) reopenKebab(ctx); return; }
    if ((t = e.target.closest('[data-cfg]'))) {
      if (ctx) {
        var iti = byUid(ctx.canvas, ctx.uid);
        if (iti) {
          iti.cfg = iti.cfg || {};
          var k = t.getAttribute('data-cfg');
          iti.cfg[k] = t.type === 'checkbox' ? t.checked : t.value;
          var d = TYPES[iti.type];
          if (d && typeof d.onConfig === 'function') d.onConfig(iti, k, iti.cfg[k]);
          rerenderBody(ctx.canvas, ctx.uid);
          save(ctx.canvas);
        }
      }
      return;
    }
    if ((t = e.target.closest('[data-pmw-remove]'))) {
      if (ctx) { var c = ctx.canvas, u = ctx.uid; closeSprout(); sproutCtx = null; removeWidget(c, u); }
      return;
    }
    if ((t = e.target.closest('[data-pmw-pksize]'))) {
      if (ctx) { ctx.canvas._pmw.pkSize = t.getAttribute('data-pmw-pksize'); openSprout(pickerHTML(ctx.canvas), anchorFor(ctx)); }
      return;
    }
    if ((t = e.target.closest('[data-pmw-addtype]'))) {
      if (ctx) {
        var cv = ctx.canvas, type = t.getAttribute('data-pmw-addtype');
        var sz = cv._pmw.pkSize;
        addWidget(cv, type, sz === 'default' ? null : sz);
        openSprout(pickerHTML(cv), anchorFor(ctx)); /* stay open: the "added" mark updates live */
      }
      return;
    }
    if (e.target.closest('input,select,textarea,option,label')) return; /* let form controls work */
    closeSprout(); /* padding click dismisses */
    sproutCtx = null;
  }

  /* ---------- menu bodies ---------------------------------------------------- */
  function kebabHTML(item) {
    var d = TYPES[item.type];
    var cur = sizeKeyOf(item);
    var szBtns = PRESET_ORDER.map(function (s) {
      var p = PRESETS[s];
      return '<button type="button" role="menuitem" class="uw-sz' + (s === cur ? ' on' : '') + '" data-pmw-size="' + s + '" aria-label="Size ' + s + ' (' + p[0] + ' by ' + p[1] + ')"' + (s === cur ? ' aria-current="true"' : '') + '>' + s + '</button>';
    }).join('') + (cur === 'custom' ? '<span class="uw-sz uw-sz-custom on" title="Free span: ' + item.c + ' cols, ' + item.r + ' rows">Custom</span>' : '');
    return '<div class="uw-menu" role="none">' +
      '<button type="button" role="menuitem" class="mi" data-pmw-focus>' + I(item.focus ? 'x' : 'eye') + '<span>' + (item.focus ? 'Exit focus' : 'Focus') + '</span></button>' +
      '<div class="uw-szgroup" role="group" aria-label="Size presets (shortcuts over free resize)">' + szBtns + '</div>' +
      ((d && typeof d.config === 'function') ? '<button type="button" role="menuitem" class="mi" data-pmw-config>' + I('cog') + '<span>Configure</span></button>' : '') +
      '<div class="sep" role="separator"></div>' +
      '<button type="button" role="menuitem" class="mi uw-danger" data-pmw-remove>' + I('trash') + '<span>Remove</span></button>' +
      '</div>';
  }
  function configFormHTML(item) {
    var d = TYPES[item.type];
    var specs = (d && typeof d.config === 'function') ? d.config(item) : [];
    var rows = specs.map(function (sp) {
      var val = (item.cfg && item.cfg[sp.key] !== undefined) ? item.cfg[sp.key] : sp.value;
      if (sp.type === 'toggle') return '<label class="mi uw-cfgrow">' + sp.label + '<input type="checkbox" data-cfg="' + sp.key + '" aria-label="' + sp.label + '"' + (val ? ' checked' : '') + '></label>';
      if (sp.type === 'select') return '<label class="mi uw-cfgrow">' + sp.label + '<select data-cfg="' + sp.key + '" aria-label="' + sp.label + '">' + (sp.options || []).map(function (o) { return '<option value="' + o + '"' + (String(o) === String(val) ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>';
      return '<label class="mi uw-cfgrow">' + sp.label + '<input type="text" data-cfg="' + sp.key + '" aria-label="' + sp.label + '" value="' + (val == null ? '' : val) + '"></label>';
    }).join('');
    return '<div class="uw-menu" role="none">' +
      '<button type="button" role="menuitem" class="mi uw-back" data-cfg-back>' + I('chevR') + '<span>Back</span></button>' +
      '<div class="sep" role="separator"></div>' +
      (rows || '<div class="uw-pk-cap">No options</div>') +
      '</div>';
  }
  function pickerHTML(canvas) {
    var pmw = canvas._pmw;
    var sel = pmw.pkSize || 'default';
    var chips = ['default'].concat(PRESET_ORDER).map(function (s) {
      return '<button type="button" class="uw-sz' + (s === sel ? ' on' : '') + '" data-pmw-pksize="' + s + '" aria-label="' + (s === 'default' ? 'Default size (type span)' : 'Size ' + s) + '"' + (s === sel ? ' aria-current="true"' : '') + '>' + (s === 'default' ? 'Default' : s) + '</button>';
    }).join('');
    var counts = {};
    pmw.items.forEach(function (it) { counts[it.type] = (counts[it.type] || 0) + 1; });
    var rows = (pmw.types || []).filter(typeKnown).map(function (t) {
      var d = TYPES[t], n = counts[t] || 0;
      return '<button type="button" role="menuitem" class="uw-pk-row' + (n ? ' is-added' : '') + '" data-pmw-addtype="' + t + '">' +
        '<span class="uw-pk-ico" aria-hidden="true">' + (d.icon || '') + '</span>' +
        '<span class="uw-pk-txt"><span class="uw-pk-lab">' + d.label + '</span>' + (d.desc ? '<span class="uw-pk-desc">' + d.desc + '</span>' : '') + '</span>' +
        (n ? '<span class="uw-pk-added" aria-label="' + n + ' on page">' + I('check') + '<b>' + n + '</b></span>' : '') +
        '</button>';
    }).join('');
    return '<div class="uw-menu uw-picker" role="none">' +
      '<div class="uw-pk-cap">Add widget</div>' +
      '<div class="uw-szgroup" role="group" aria-label="Initial size">' + chips + '</div>' +
      '<div class="sep" role="separator"></div>' +
      (rows || '<div class="uw-pk-empty">No widget types registered</div>') +
      '</div>';
  }

  /* ---------- render / FLIP --------------------------------------------------- */
  function renderBody(item) {
    var d = TYPES[item.type];
    if (!d || typeof d.render !== 'function') return '';
    try { return d.render(item, sizeKeyOf(item)) || ''; } catch (err) { return ''; }
  }
  /* a focused card is parked on <body> (see hoistFocus), so lookups that only
     scan the canvas miss it — resolve through the parked element first. */
  function uwEl(canvas, uidv) {
    var p = canvas._pmw && canvas._pmw.parked;
    if (p && p.getAttribute('data-uid') === uidv) return p;
    return canvas.querySelector('.uw[data-uid="' + uidv + '"]');
  }
  /* effective span = min(stored c, live track count). Stored item.c is NEVER
     mutated here, so wide tiers restore the full span; narrow tiers stop
     forcing implicit ghost columns and the responsive breakpoints take effect. */
  function canvasCols(canvas) {
    var t = getComputedStyle(canvas).gridTemplateColumns;
    if (!t || t === 'none') return 0; /* hidden (inactive tab panel) */
    /* Oversized spans force implicit "ghost" tracks, and the computed
       gridTemplateColumns lists them too (while their content-width shrinks the
       1fr tracks), so naive counting/probing is self-defeating. Force every
       card to span 1 for one synchronous read: a span-1 grid can never outrun
       the explicit template, so the list we count IS the explicit tier. */
    var kids = canvas.querySelectorAll('.uw');
    var saved = [];
    kids.forEach(function (el, i) { saved[i] = el.style.gridColumn; el.style.gridColumn = 'span 1'; });
    var n = getComputedStyle(canvas).gridTemplateColumns.split(' ').length;
    kids.forEach(function (el, i) { el.style.gridColumn = saved[i]; });
    return n;
  }
  function applySpans(canvas) {
    if (!canvas._pmw) return;
    var cols = canvasCols(canvas);
    if (!cols) return; /* hidden (inactive tab panel): leave spans untouched */
    canvas._pmw.items.forEach(function (it) {
      var el = uwEl(canvas, it.uid);
      if (!el) return;
      el.style.gridColumn = 'span ' + Math.min(it.c, cols);
      el.style.gridRow = 'span ' + it.r;
    });
  }
  var rszTimer = null;
  window.addEventListener('resize', function () {
    if (rszTimer) clearTimeout(rszTimer);
    rszTimer = setTimeout(function () { MOUNTS.forEach(function (c) { applySpans(c); }); }, 120);
  });
  /* enterDelay: false = no entrance; a number = play uwIn delayed that many ms
     (the stagger step; 0 for a lone add). The delay rides the inline style so
     it is consumed with the element — nothing lingers for a later replay. */
  function widgetHTML(item, enterDelay) {
    var d = TYPES[item.type];
    var enter = typeof enterDelay === 'number';
    var pos = 'grid-column:span ' + item.c + ';grid-row:span ' + item.r;
    if (enter && enterDelay > 0) pos += ';animation-delay:' + enterDelay + 'ms';
    return '<article class="uw' + (item.focus ? ' is-focus' : '') + (enter ? ' uw-enter' : '') + '" data-uid="' + item.uid + '" style="' + pos + '">' +
      '<div class="uw-head">' +
      '<button type="button" class="uw-grip" data-pmw-grip title="Drag to move" aria-label="Move ' + d.label + '">' + I('grip') + '</button>' +
      '<span class="uw-ico" aria-hidden="true">' + (d.icon || '') + '</span>' +
      '<span class="uw-tt">' + d.label + '</span>' +
      '<button type="button" class="uw-kebab" data-pmw-kebab title="Widget options" aria-label="Options for ' + d.label + '" aria-haspopup="menu" aria-expanded="false">' + I('kebabV') + '</button>' +
      '</div>' +
      '<div class="uw-body">' + renderBody(item) + '</div>' +
      '<button type="button" class="uw-resize" data-pmw-resize title="Drag to resize" aria-label="Resize ' + d.label + '">' + I('expand') + '</button>' +
      '</article>';
  }
  /* animationend fires delay+duration after mount, so one listener still
     catches each staggered widget exactly once; a fallback timeout (inline
     delay + spring duration + slack) strips the class even if the event is
     swallowed (background tab, kill-switch edge). */
  function consumeEntrance(canvas) {
    canvas.querySelectorAll('.uw.uw-enter').forEach(function (el) {
      var fallback;
      var done = function (ev) {
        if (ev && (ev.target !== el || ev.animationName !== 'uwIn')) return;
        el.removeEventListener('animationend', done);
        clearTimeout(fallback);
        el.classList.remove('uw-enter');
        el.style.animationDelay = ''; /* the stagger step is consumed with the entrance */
      };
      el.addEventListener('animationend', done);
      fallback = setTimeout(done, (parseFloat(el.style.animationDelay) || 0) + tokenMs('--mo-spring-dur', 420) + 160);
    });
  }
  /* enterUids: true = entrance on every widget (mount/reset); array = only
     those uids (add); otherwise entrance never replays (resize/reorder/config).
     A hidden canvas (inactive tab panel, display:none) never gets the class:
     the entrance can't play there, and leaving it stamped is what replayed uwIn
     across the whole grid on every reveal. Visible widgets are stripped the
     moment uwIn ends (consumeEntrance) so no later display toggle replays it. */
  var ENTER_BUDGET_MS = 700; /* the whole entrance wave must land inside this */
  function render(canvas, enterUids) {
    var enterAll = enterUids === true;
    var only = Array.isArray(enterUids) ? enterUids : null;
    var hidden = canvas.getClientRects().length === 0;
    /* stagger wave: --mo-stagger × flow-order index, capped so the last
       widget still lands inside ENTER_BUDGET_MS. mount/add/reset only —
       resize/reorder/config never pass enterUids, so they never stagger. */
    var step = (!hidden && (enterAll || (only && only.length)) && !isRM()) ? tokenMs('--mo-stagger', 24) : 0;
    var cap = Math.max(0, ENTER_BUDGET_MS - tokenMs('--mo-spring-dur', 420));
    var ei = 0;
    unhoistFocus(canvas); /* drop any parked card so the innerHTML rebuild clears it */
    canvas.innerHTML = canvas._pmw.items.map(function (it) {
      var enter = !hidden && (enterAll || (only && only.indexOf(it.uid) !== -1));
      var delay = false;
      if (enter) { delay = Math.min(ei * step, cap); ei++; }
      return widgetHTML(it, delay);
    }).join('');
    applySpans(canvas);
    hoistFocus(canvas);
    reconcileLives(canvas);
    if (!hidden) consumeEntrance(canvas);
  }
  function rerenderBody(canvas, uidv) {
    var host = uwEl(canvas, uidv);
    var el = host && host.querySelector('.uw-body');
    var it = byUid(canvas, uidv);
    if (!el || !it) return;
    el.innerHTML = renderBody(it);
  }
  function capture(canvas) {
    var m = {};
    canvas.querySelectorAll('.uw').forEach(function (el) {
      if (!el.dataset.uid || el.classList.contains('is-placeholder')) return; /* the landing slot never FLIPs */
      m[el.dataset.uid] = el.getBoundingClientRect();
    });
    return m;
  }
  function flip(canvas, prev, durV, easeV) {
    if (isRM()) return; /* reduced motion: layout just lands */
    durV = durV || 'var(--mo-enter, 220ms)';
    easeV = easeV || 'var(--ease-out-bold, cubic-bezier(0, 0.4, 0, 1))';
    canvas.querySelectorAll('.uw').forEach(function (el) {
      var pr = prev[el.dataset.uid]; if (!pr) return;
      var lr = el.getBoundingClientRect();
      var dx = pr.left - lr.left, dy = pr.top - lr.top;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      var settle = function (ev) {
        if (ev.target !== el || ev.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', settle);
        if (!el.style.transform) el.style.transition = ''; /* hand transform back to the stylesheet (hover depth) */
      };
      el.addEventListener('transitionend', settle);
      requestAnimationFrame(function () {
        el.style.transition = 'transform ' + durV + ' ' + easeV;
        el.style.transform = '';
      });
    });
  }
  function tokenMs(varName, fallbackMs) {
    try {
      var probe = document.createElement('i');
      probe.style.transitionDuration = 'var(' + varName + ', ' + fallbackMs + 'ms)';
      document.body.appendChild(probe);
      var s = getComputedStyle(probe).transitionDuration;
      var v = parseFloat(s);
      document.body.removeChild(probe);
      return isNaN(v) ? fallbackMs : (s.indexOf('ms') === -1 ? v * 1000 : v);
    } catch (e) { return fallbackMs; }
  }

  /* ---------- focus mode: single widget + scrim, persisted -------------------- */
  /* Stacking escape: host chrome wraps the page in an ancestor stacking context
     (e.g. .us-center at z-index:1), so a focused card can never out-z the
     body-level .uw-scrim (z:500) from inside it and gets dimmed by its own
     scrim. The card is position:fixed, so we park it on <body> beside the scrim
     (z:510 > z:500, fully bright) and return it to the canvas on every rebuild. */
  function unhoistFocus(canvas) {
    var pmw = canvas._pmw;
    if (!pmw) return;
    if (pmw.parked && pmw.parked.parentNode) pmw.parked.parentNode.removeChild(pmw.parked);
    pmw.parked = null;
  }
  function hoistFocus(canvas) {
    var pmw = canvas._pmw;
    var el = canvas.querySelector('.uw.is-focus');
    if (!el || !pmw) return;
    pmw.parked = el;
    /* the card no longer sits inside the canvas, so mirror the canvas's
       delegated pointer/click wiring onto it (kebab "Exit focus" still works) */
    if (pmw.pd) el.addEventListener('pointerdown', pmw.pd);
    if (pmw.ck) el.addEventListener('click', pmw.ck);
    document.body.appendChild(el);
  }
  function ensureScrim() {
    if (scrim) return scrim;
    scrim = document.createElement('div');
    scrim.className = 'uw-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    scrim.addEventListener('click', function () {
      var f = findFocused();
      if (f) setFocus(f.canvas, f.item.uid, false);
    });
    document.body.appendChild(scrim);
    return scrim;
  }
  function findFocused() {
    for (var i = 0; i < MOUNTS.length; i++) {
      var c = MOUNTS[i];
      for (var j = 0; j < c._pmw.items.length; j++) if (c._pmw.items[j].focus) return { canvas: c, item: c._pmw.items[j] };
    }
    return null;
  }
  function syncScrim() {
    var f = findFocused();
    if (f) { var sc = ensureScrim(); void sc.offsetWidth; sc.classList.add('is-on'); }
    else if (scrim) scrim.classList.remove('is-on');
  }
  function rectOf(canvas, uidv) {
    var el = uwEl(canvas, uidv);
    return el ? el.getBoundingClientRect() : null;
  }
  /* Connected slot<->focus morph (FLIP): the card travels between its board rect
     and the fixed overlay rect on a compositor transform (translate+scale from a
     top-left origin), so content never reflows mid-flight. enter=true runs the
     focus-enter token (board->overlay), false the focus-exit token (overlay->
     board). Reduced motion (USrender.isRM) or a missing anchor lands instantly;
     every focus change re-renders (new elements), so an interrupted morph is
     discarded with its element and the card always lands in its final rect. */
  function morphCard(el, fromRect, enter) {
    if (!el || !fromRect || isRM()) return;
    var toRect = el.getBoundingClientRect();
    if (!toRect.width || !toRect.height) return; /* not laid out (hidden panel) */
    var dx = fromRect.left - toRect.left, dy = fromRect.top - toRect.top;
    var sx = fromRect.width / toRect.width, sy = fromRect.height / toRect.height;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
    var dur = enter ? 'var(--mo-focus-enter-dur, 400ms)' : 'var(--mo-focus-exit-dur, 300ms)';
    var ease = enter ? 'var(--mo-focus-enter-ease, cubic-bezier(0, 0.4, 0, 1))' : 'var(--mo-focus-exit-ease, cubic-bezier(0.4, 0, 0.2, 1))';
    el.style.transformOrigin = 'top left';
    el.style.transition = 'none';
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    void el.offsetWidth; /* commit the invert before the play */
    el.style.transition = 'transform ' + dur + ' ' + ease;
    el.style.transform = '';
    var done = function (ev) {
      if (ev && (ev.target !== el || ev.propertyName !== 'transform')) return;
      el.removeEventListener('transitionend', done);
      el.style.transition = ''; el.style.transform = ''; el.style.transformOrigin = '';
    };
    el.addEventListener('transitionend', done);
  }
  function setFocus(canvas, uidv, on) {
    closeSprout(); sproutCtx = null;
    var prevFocused = findFocused(); /* capture rects BEFORE the change (FLIP first) */
    var prevFocusedRect = prevFocused ? rectOf(prevFocused.canvas, prevFocused.item.uid) : null;
    var targetRect = rectOf(canvas, uidv);
    MOUNTS.forEach(function (c) { c._pmw.items.forEach(function (it) { it.focus = false; }); }); /* only ever one */
    var it = byUid(canvas, uidv);
    if (it && on) it.focus = true;
    MOUNTS.forEach(function (c) { render(c); save(c); }); /* last: fresh elements in final position */
    var nowFocused = findFocused();
    /* the card that lost focus travels overlay->board (skipped when the same
       card stays focused, i.e. a no-op re-focus) */
    if (prevFocused && (!nowFocused || nowFocused.item.uid !== prevFocused.item.uid || nowFocused.canvas !== prevFocused.canvas)) {
      morphCard(uwEl(prevFocused.canvas, prevFocused.item.uid), prevFocusedRect, false);
    }
    if (nowFocused) morphCard(uwEl(nowFocused.canvas, nowFocused.item.uid), targetRect, true); /* board->overlay */
    syncScrim();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (dragState) { var ds = dragState; unlistenDrag(); revertDrag(ds); return; } /* Esc mid-drag reverts, no save */
    if (anyMenuOpen()) return; /* first Esc closes menus; the next one exits focus */
    var f = findFocused();
    if (f) setFocus(f.canvas, f.item.uid, false);
  });

  /* ---------- mutations -------------------------------------------------------- */
  function addWidget(canvas, type, size) {
    if (!typeKnown(type)) return null;
    var sp = (size && PRESETS[size]) ? PRESETS[size] : spanFor(type);
    var prev = capture(canvas);
    var it = { uid: uid(), type: type, c: sp[0], r: sp[1], cfg: {}, focus: false };
    canvas._pmw.items.push(it);
    render(canvas, [it.uid]); /* only the newcomer plays uwIn */
    flip(canvas, prev);
    save(canvas);
    return it;
  }
  function removeWidget(canvas, uidv) {
    var it = byUid(canvas, uidv);
    if (it && it.focus) { canvas._pmw.items.forEach(function (x) { x.focus = false; }); }
    stopUidLives(canvas, uidv);
    var prev = capture(canvas);
    canvas._pmw.items = canvas._pmw.items.filter(function (x) { return x.uid !== uidv; });
    render(canvas); flip(canvas, prev); save(canvas);
    syncScrim();
  }
  function setSize(canvas, uidv, s) {
    var sp = PRESETS[s]; if (!sp) return; /* presets are shortcuts; free resize stays canonical */
    var it = byUid(canvas, uidv); if (!it) return;
    var prev = capture(canvas);
    it.c = sp[0]; it.r = sp[1];
    render(canvas); flip(canvas, prev); save(canvas);
  }
  function resetCanvas(canvas) {
    if (!canvas || !canvas._pmw) return;
    closeSprout(); sproutCtx = null;
    try { localStorage.removeItem(keyFor(canvas._pmw.pageId)); } catch (e) {}
    MOUNTS.forEach(function (c) { c._pmw.items.forEach(function (it) { it.focus = false; }); });
    canvas._pmw.items = seedItems(canvas._pmw.types, canvas._pmw.defaultBoard);
    render(canvas, true); save(canvas); syncScrim();
  }

  /* ---------- free-span resize (canonical; no snap on release) ----------------- */
  function startResize(canvas, el, e) {
    var it = byUid(canvas, el.dataset.uid);
    if (!it || it.focus) return;
    e.preventDefault();
    var cs = getComputedStyle(canvas);
    var cols = canvasCols(canvas) || 4;
    var gap = parseFloat(cs.columnGap || cs.gap || '10') || 10;
    var rowH = 28 + gap;
    var colW = (canvas.clientWidth - gap * (cols - 1)) / cols;
    resizeState = { canvas: canvas, el: el, it: it, startW: el.offsetWidth, startH: el.offsetHeight, sx: e.clientX, sy: e.clientY, cols: cols, colW: colW, rowH: rowH, gap: gap, moved: false };
    el.classList.add('is-resizing');
    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', endResize);
  }
  function onResizeMove(e) {
    var rs = resizeState; if (!rs) return;
    var nc = Math.max(1, Math.min(rs.cols, Math.round((rs.startW + (e.clientX - rs.sx) + rs.gap / 2) / (rs.colW + rs.gap))));
    var nr = Math.max(2, Math.min(40, Math.round((rs.startH + (e.clientY - rs.sy) + rs.gap / 2) / rs.rowH)));
    if (nc !== rs.it.c || nr !== rs.it.r) {
      rs.it.c = nc; rs.it.r = nr; rs.moved = true;
      rs.el.style.gridColumn = 'span ' + nc;
      rs.el.style.gridRow = 'span ' + nr; /* live span change: no re-render, no entrance replay */
    }
  }
  function endResize() {
    var rs = resizeState; if (!rs) return;
    window.removeEventListener('pointermove', onResizeMove);
    window.removeEventListener('pointerup', endResize);
    resizeState = null;
    rs.el.classList.remove('is-resizing');
    if (rs.moved) { rerenderBody(rs.canvas, rs.it.uid); save(rs.canvas); } /* size-aware render(item, size) sees the new span */
  }

  /* ---------- drag reorder: lifted clone + landing ghost + live reflow ---------
     Grab lifts a fixed clone of the widget (it IS the held widget, visually),
     the vacated grid slot becomes a .uw.is-placeholder that marks the landing
     slot, and every slot change MOVES the placeholder + FLIPs the neighbors —
     never a re-render, so widget bodies (charts) keep their DOM untouched.
     Drop settles the clone onto the placeholder with the widget-drop token,
     then swaps the real element back in underneath. Esc / pointercancel /
     window blur revert to the captured original order without saving. */
  var REFLOW_DUR = 'var(--mo-widget-reflow-dur, 240ms)';
  var REFLOW_EASE = 'var(--mo-widget-reflow-ease, cubic-bezier(0.45, 0, 0.4, 1))';
  function findScroller(canvas) {
    var n = canvas.parentElement;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);
      if (/(auto|scroll|overlay)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) return n;
      n = n.parentElement;
    }
    return window;
  }
  function startDrag(canvas, el, e) {
    var it = byUid(canvas, el.dataset.uid);
    if (!it || it.focus || dragState) return;
    e.preventDefault();
    closeSprout(); sproutCtx = null;
    var rect = el.getBoundingClientRect();
    var clone = el.cloneNode(true);
    clone.removeAttribute('data-uid'); /* lookups must never hit the held copy */
    clone.setAttribute('data-pmw-lifted', '');
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.remove('uw-enter', 'is-focus', 'is-resizing');
    clone.classList.add('uw-lifted');
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    var srcB = el.querySelectorAll('.uw-body'), clnB = clone.querySelectorAll('.uw-body'), k;
    for (k = 0; k < srcB.length; k++) clnB[k].scrollTop = srcB[k].scrollTop; /* held copy keeps its place */
    document.body.appendChild(clone);
    var ph = document.createElement('div');
    ph.className = 'uw is-placeholder';
    ph.setAttribute('aria-hidden', 'true');
    ph.style.gridColumn = el.style.gridColumn || ('span ' + it.c);
    ph.style.gridRow = el.style.gridRow || ('span ' + it.r);
    el.parentNode.replaceChild(ph, el);
    dragState = {
      canvas: canvas, uid: it.uid, el: el, ph: ph, clone: clone,
      ox: e.clientX - rect.left, oy: e.clientY - rect.top, /* track by grab offset: no jump */
      lx: e.clientX, ly: e.clientY,
      slotUid: null, slotAfter: false,
      origItems: canvas._pmw.items.slice(),
      scroller: findScroller(canvas), raf: 0
    };
    document.documentElement.classList.add('pmw-drag');
    void clone.offsetWidth; /* commit scale(1) at the source rect before the lift plays */
    clone.classList.add('is-lifted');
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', cancelDrag);
    window.addEventListener('blur', cancelDrag);
    dragState.raf = requestAnimationFrame(edgeTick);
  }
  function moveClone() {
    var ds = dragState; if (!ds) return;
    ds.clone.style.left = (ds.lx - ds.ox) + 'px'; /* no transition on left/top: 1:1 with the pointer */
    ds.clone.style.top = (ds.ly - ds.oy) + 'px';
  }
  function onDragMove(e) {
    var ds = dragState; if (!ds) return;
    ds.lx = e.clientX; ds.ly = e.clientY;
    moveClone();
    slotFromPoint(e.clientX, e.clientY);
  }
  /* edge auto-scroll: while held near the viewport top/bottom, keep scrolling
     the scrollable ancestor (rAF loop) and re-run slot detection so the board
     keeps reflowing under the held widget */
  function edgeTick() {
    var ds = dragState; if (!ds) return;
    var vh = window.innerHeight, zone = 56, dy = 0;
    if (ds.ly < zone) dy = -Math.ceil((zone - ds.ly) / 6);
    else if (ds.ly > vh - zone) dy = Math.ceil((ds.ly - (vh - zone)) / 6);
    if (dy) { ds.scroller.scrollBy(0, dy); slotFromPoint(ds.lx, ds.ly); }
    ds.raf = requestAnimationFrame(edgeTick);
  }
  /* hit-test through non-widget chrome (the shell's fixed status-bar overlays
     the viewport bottom) via the full elementsFromPoint stack; pointer-events
     filtering already skips the clone/ghost, the attribute/class checks are
     belt-and-braces. */
  function widgetAtPoint(x, y) {
    var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      var t = (el.classList && el.classList.contains('uw')) ? el : (el.closest ? el.closest('.uw') : null);
      if (t && !t.classList.contains('is-placeholder') && !t.hasAttribute('data-pmw-lifted')) return t;
    }
    return null;
  }
  /* reading-order slot: above the vertical center -> before; below the middle
     band -> after; inside the band the horizontal center decides. Works across
     a multi-column grid, not just vertical lists. */
  function slotFromPoint(x, y) {
    var ds = dragState; if (!ds) return;
    var t = widgetAtPoint(x, y);
    if (!t || !ds.canvas.contains(t)) return;
    var r = t.getBoundingClientRect();
    var relY = (y - r.top) / r.height, relX = (x - r.left) / r.width;
    var after = relY >= 0.5 && !(relY <= 0.75 && relX < 0.5);
    moveSlotTo(t.dataset.uid, after);
  }
  /* move the placeholder (NEVER re-render) and FLIP every other widget from its
     pre-move rect; items[] is spliced in lockstep so save() on drop is correct */
  function moveSlotTo(uidv, after) {
    var ds = dragState; if (!ds) return;
    if (ds.slotUid === uidv && ds.slotAfter === after) return;
    var canvas = ds.canvas, ph = ds.ph;
    var tel = canvas.querySelector('.uw[data-uid="' + uidv + '"]');
    if (!tel) return;
    if (after ? (tel.nextSibling === ph) : (ph.nextSibling === tel)) {
      ds.slotUid = uidv; ds.slotAfter = after; return; /* already parked in this slot */
    }
    ds.slotUid = uidv; ds.slotAfter = after;
    var prev = capture(canvas);
    canvas.insertBefore(ph, after ? tel.nextSibling : tel);
    var items = canvas._pmw.items, from = -1, ti = -1, i, moved;
    for (i = 0; i < items.length; i++) { if (items[i].uid === ds.uid) from = i; if (items[i].uid === uidv) ti = i; }
    if (from < 0 || ti < 0) return;
    moved = items.splice(from, 1)[0];
    if (from < ti) ti--;
    items.splice(ti + (after ? 1 : 0), 0, moved);
    flip(canvas, prev, REFLOW_DUR, REFLOW_EASE);
  }
  function unlistenDrag() {
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', cancelDrag);
    window.removeEventListener('blur', cancelDrag);
    if (dragState && dragState.raf) cancelAnimationFrame(dragState.raf);
    document.documentElement.classList.remove('pmw-drag');
  }
  function orderChanged(ds) {
    var items = ds.canvas._pmw && ds.canvas._pmw.items;
    if (!items || items.length !== ds.origItems.length) return true;
    for (var i = 0; i < items.length; i++) if (items[i].uid !== ds.origItems[i].uid) return true;
    return false;
  }
  function endDrag() {
    var ds = dragState; if (!ds) return;
    unlistenDrag();
    dragState = null;
    var changed = orderChanged(ds);
    var finish = function () {
      if (ds.clone.parentNode) ds.clone.parentNode.removeChild(ds.clone);
      if (ds.ph.parentNode) ds.ph.parentNode.replaceChild(ds.el, ds.ph); /* real widget lands under the settle */
      if (changed && ds.canvas._pmw) save(ds.canvas); /* drop-in-place is a clean no-op */
    };
    if (isRM()) { finish(); return; } /* reduced motion: lands instantly, ghost still did its job */
    var pr = ds.ph.getBoundingClientRect(), cl = ds.clone, done = false;
    var complete = function () {
      if (done) return; done = true;
      cl.removeEventListener('transitionend', onEnd);
      clearTimeout(settleTimer);
      finish();
    };
    var onEnd = function (ev) { if (ev.target === cl && (ev.propertyName === 'left' || ev.propertyName === 'transform')) complete(); };
    cl.addEventListener('transitionend', onEnd);
    var dd = 'var(--mo-widget-drop-dur, 220ms)', de = 'var(--mo-widget-drop-ease, cubic-bezier(0.2, 0, 0, 1))';
    cl.style.transformOrigin = 'top left';
    cl.style.transition = 'left ' + dd + ' ' + de + ', top ' + dd + ' ' + de + ', width ' + dd + ' ' + de + ', height ' + dd + ' ' + de + ', transform ' + dd + ' ' + de;
    void cl.offsetWidth;
    cl.style.left = pr.left + 'px';
    cl.style.top = pr.top + 'px';
    cl.style.width = pr.width + 'px';
    cl.style.height = pr.height + 'px';
    cl.classList.remove('is-lifted'); /* scale/tilt ease back to 1 on the same curve */
    var settleTimer = setTimeout(complete, tokenMs('--mo-widget-drop-dur', 220) + 120);
  }
  function revertDrag(ds) {
    dragState = null;
    var canvas = ds.canvas;
    if (ds.clone.parentNode) ds.clone.parentNode.removeChild(ds.clone);
    if (!canvas._pmw) { if (ds.ph.parentNode) ds.ph.parentNode.removeChild(ds.ph); return; }
    var items = canvas._pmw.items;
    items.length = 0;
    ds.origItems.forEach(function (x) { items.push(x); });
    if (ds.ph.parentNode) ds.ph.parentNode.replaceChild(ds.el, ds.ph);
    var prev = capture(canvas);
    items.forEach(function (x) { /* re-seat the existing nodes in the original order: no re-render */
      var n = uwEl(canvas, x.uid);
      if (n && n.parentNode === canvas) canvas.appendChild(n); /* a parked focus card stays parked */
    });
    flip(canvas, prev, REFLOW_DUR, REFLOW_EASE);
  }
  function cancelDrag() {
    var ds = dragState; if (!ds) return;
    unlistenDrag();
    revertDrag(ds);
  }

  /* ---------- live behaviors (opt-in timers, cleaned on unmount) --------------- */
  function startLive(canvas, key, ms, fn) {
    if (!canvas || !canvas._pmw || !key || !fn) return;
    stopLive(canvas, key);
    canvas._pmw.live[key] = setInterval(function () {
      if (!document.body.contains(canvas)) { stopLive(canvas, key); return; }
      fn(canvas);
    }, ms || 1000);
  }
  function stopLive(canvas, key) {
    if (!canvas || !canvas._pmw || !canvas._pmw.live || !canvas._pmw.live[key]) return;
    clearInterval(canvas._pmw.live[key]);
    delete canvas._pmw.live[key];
  }
  function stopUidLives(canvas, uidv) {
    var pre = 'w:' + uidv + ':';
    Object.keys(canvas._pmw.live).forEach(function (k) { if (k.indexOf(pre) === 0) stopLive(canvas, k); });
  }
  /* def.live = [{key, ms, tick(item, bodyEl, api{refresh, save})}] — per-widget
     hooks (e.g. ledger append ~9s). Intervals reconcile after every render. */
  function reconcileLives(canvas) {
    canvas._pmw.items.forEach(function (it) {
      var d = TYPES[it.type];
      var hooks = (d && d.live) || [];
      hooks.forEach(function (h) {
        var key = 'w:' + it.uid + ':' + (h.key || 'tick');
        if (canvas._pmw.live[key]) return;
        canvas._pmw.live[key] = setInterval(function () {
        var cur = byUid(canvas, it.uid);
        var host = uwEl(canvas, it.uid);
        var el = host && host.querySelector('.uw-body');
        if (!cur || !el || typeof h.tick !== 'function') { stopLive(canvas, key); return; }
          h.tick(cur, el, { refresh: function () { rerenderBody(canvas, cur.uid); }, save: function () { save(canvas); } });
        }, h.ms || 9000);
      });
    });
  }

  /* ---------- mount -------------------------------------------------------------- */
  function buildAddbar(canvas) {
    var addbar = document.createElement('div');
    addbar.className = 'uw-addbar';
    addbar.innerHTML =
      '<button type="button" class="uw-addbtn" data-pmw-add title="Add a widget" aria-haspopup="menu" aria-expanded="false">' + I('plus') + '<span>Add widget</span></button>' +
      '<button type="button" class="uw-resetbtn" data-pmw-resetpage title="Reset layout" aria-label="Reset layout to defaults">' + I('refresh') + '</button>' +
      '<span class="uw-hint">Drag the grip to move, drag the corner to resize, open a widget menu for focus, size, config and remove.</span>';
    canvas.insertAdjacentElement('beforebegin', addbar);
    addbar.addEventListener('click', function (e) {
      var add = e.target.closest('[data-pmw-add]');
      if (add) {
        e.stopPropagation();
        if (sproutOpenFor(add)) { closeSprout(); sproutCtx = null; return; }
        sproutCtx = { canvas: canvas, mode: 'picker', anchor: add };
        openSprout(pickerHTML(canvas), add);
        return;
      }
      var rst = e.target.closest('[data-pmw-resetpage]');
      if (rst) { e.stopPropagation(); resetCanvas(canvas); }
    });
    return addbar;
  }
  function wire(canvas) {
    /* handlers are stashed on _pmw so hoistFocus can mirror them onto a card
       that is parked outside the canvas (events no longer bubble to canvas) */
    canvas._pmw.pd = function (e) {
      var grip = e.target.closest('[data-pmw-grip]');
      if (grip) { startDrag(canvas, grip.closest('.uw'), e); return; }
      var rz = e.target.closest('[data-pmw-resize]');
      if (rz) startResize(canvas, rz.closest('.uw'), e);
    };
    canvas._pmw.ck = function (e) {
      var keb = e.target.closest('[data-pmw-kebab]');
      if (!keb) return;
      e.stopPropagation();
      if (sproutOpenFor(keb)) { closeSprout(); sproutCtx = null; return; }
      var el = keb.closest('.uw'), uidv = el.dataset.uid;
      var it = byUid(canvas, uidv); if (!it) return;
      sproutCtx = { canvas: canvas, uid: uidv, mode: 'kebab' };
      openSprout(kebabHTML(it), keb);
    };
    canvas.addEventListener('pointerdown', canvas._pmw.pd);
    canvas.addEventListener('click', canvas._pmw.ck);
  }
  function mount(canvas, opts) {
    opts = opts || {};
    if (canvas._pmw) unmount(canvas);
    var pageId = opts.pageId || 'default';
    var types = (opts.types || []).filter(typeKnown);
    var defaultBoard = Array.isArray(opts.defaultBoard) ? opts.defaultBoard : null;
    var loaded = load(pageId, types, defaultBoard);
    canvas.classList.add('uw-canvas');
    canvas._pmw = { pageId: pageId, types: types, defaultBoard: defaultBoard, items: loaded.items, live: {}, pkSize: 'default' };
    MOUNTS.push(canvas);
    canvas._pmw.addbar = buildAddbar(canvas);
    wire(canvas); /* before first render: hoisted cards mirror these handlers */
    render(canvas, true);
    if (loaded.migrated) save(canvas); /* write the v1 -> v2 upgrade through */
    /* hidden canvases (inactive tab panels) report no tracks; re-apply the
       effective spans the moment one becomes visible again */
    if (window.IntersectionObserver) {
      canvas._pmw.io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) applySpans(en.target); });
      });
      canvas._pmw.io.observe(canvas);
    }
    syncScrim();
    var handle = {
      canvas: canvas,
      add: function (t, size) { return addWidget(canvas, t, size); },
      remove: function (u) { removeWidget(canvas, u); },
      reset: function () { resetCanvas(canvas); },
      unmount: function () { unmount(canvas); },
      rerender: function (u) { if (u) rerenderBody(canvas, u); else render(canvas); },
      startLive: function (key, ms, fn) { startLive(canvas, key, ms, fn); },
      stopLive: function (key) { stopLive(canvas, key); }
    };
    /* live view: remove/reset replace the items array, so a frozen ref would go stale */
    Object.defineProperty(handle, 'items', { enumerable: true, get: function () { return canvas._pmw ? canvas._pmw.items : []; } });
    canvas._pmw.handle = handle;
    return handle;
  }
  function unmount(canvas) {
    if (!canvas || !canvas._pmw) return;
    if (dragState && dragState.canvas === canvas) { /* never leave a clone/ghost orphaned */
      var dsv = dragState;
      unlistenDrag(); dragState = null;
      if (dsv.clone.parentNode) dsv.clone.parentNode.removeChild(dsv.clone);
      if (dsv.ph.parentNode) dsv.ph.parentNode.removeChild(dsv.ph);
    }
    Object.keys(canvas._pmw.live).forEach(function (k) { stopLive(canvas, k); });
    var i = MOUNTS.indexOf(canvas);
    if (i !== -1) MOUNTS.splice(i, 1);
    closeSprout(); sproutCtx = null;
    if (canvas._pmw.io) canvas._pmw.io.disconnect();
    unhoistFocus(canvas); /* a parked card is outside the canvas: drop it explicitly */
    if (canvas._pmw.addbar && canvas._pmw.addbar.parentNode) canvas._pmw.addbar.parentNode.removeChild(canvas._pmw.addbar);
    canvas.classList.remove('uw-canvas');
    canvas.innerHTML = '';
    delete canvas._pmw;
    syncScrim();
  }

  window.PMWidgets = {
    VERSION: VERSION,
    register: register,
    mount: mount,
    reset: resetCanvas,
    unmount: unmount,
    startLive: startLive,
    stopLive: stopLive
  };
})();
