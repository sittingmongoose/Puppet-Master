/* Widget registry and card chrome (owner: engine; ARCHITECTURE.md section 4.7, DESIGN-SPEC section 3,
   DESIGN-SPEC-ATLAS section 3). Content registers kinds (render / update / enter / resize? / destroy?) and widget
   definitions (model, inspect, config); the engine builds the chrome (plate, line or tile head; subtitle; tools cluster
   with grip, size, gear and menu; seven resize handles), measures the tier and calls the kind. The card menu, the size
   picker and the gear are PMU.menu dropdowns (the Chat Assistant 5.6 Pro style). A widget with no kind yet renders a
   quiet placeholder. */
(function () {
  var kinds = {}, defs = {};
  var EDGES = ['e', 'w', 's', 'se', 'sw', 'ne', 'nw'];
  var TILE_KINDS = { kpi: 1, free: 1, cache: 1, gauge: 1 };
  var LINE_KINDS = { kpis: 1 };
  var HEAD_PX = { plate: 52, line: 34, tile: 30 };
  var st = PMU.core.state;

  PMU.widgets = {
    kind: function (name, impl) { kinds[name] = impl; },
    define: function (id, def) { defs[id] = Object.assign({}, defs[id] || {}, def); },
    get: function (id) {
      var d = defs[id], b = PMU_BOARDS.widgets[id];
      if (!d && !b) return null;
      return Object.assign({ kind: b && b.kind, level: b && b.level, title: b && b.title, meta: b && b.meta }, d || {});
    },
    kindOf: function (id) { var d = PMU.widgets.get(id); return d ? kinds[d.kind] || null : null; },
    kinds: function () { return Object.keys(kinds); },
    list: function (room) { return Object.keys(defs).filter(function (id) { return defs[id].room === room; }); },
    spec: function (id) { var d = PMU.widgets.get(id); return d ? PMU_BOARDS.kinds[d.kind] || null : null; }
  };

  function text(v, ctx) { try { return typeof v === 'function' ? (v(ctx) || '') : (v || ''); } catch (error) { console.error('[pm-usage] text', error); return ''; } }
  /* a per-widget fixed range / scope (gear) is applied by swapping the shared view state around the widget's own calls,
     so PMU.data (which reads the page state) answers for the widget's window without any change in the content code */
  function cfgOf(id) { return PMU.board && PMU.board.config ? PMU.board.config(id) : {}; }
  function withView(id, fn) {
    var cfg = cfgOf(id), saved = null;
    if (cfg.range || cfg.scope) { saved = { range: st.range, scope: st.scope }; if (cfg.range) st.range = cfg.range; if (cfg.scope) st.scope = cfg.scope; }
    try { return fn(cfg); } finally { if (saved) { st.range = saved.range; st.scope = saved.scope; } }
  }
  function ctxBase(id, room, cfg) {
    cfg = cfg || cfgOf(id);
    return { id: id, room: room, state: { range: cfg.range || st.range, scope: cfg.scope || st.scope, detail: st.detail, pageRange: st.range, pageScope: st.scope },
      look: PMU.theme.look(), thresholds: PMU.roster && PMU.roster.thresholds ? PMU.roster.thresholds() : null, config: cfg };
  }
  function ctxFor(card, tier, entering) {
    var id = card.getAttribute('data-widget'), room = card.getAttribute('data-room');
    var base = ctxBase(id, room), def = PMU.widgets.get(id) || {};
    var model = null;
    try { model = typeof def.model === 'function' ? def.model(base) : null; } catch (error) { console.error('[pm-usage] model ' + id, error); }
    return Object.assign(base, { def: def, model: model, tier: tier, _inner: true, rawTier: tier && tier.pw != null ? { w: tier.w, h: tier.h, bw: tier.pw, bh: tier.ph } : tier,
      size: { w: +card.dataset.w, h: +card.dataset.h }, entering: !!entering, card: card,
      head: card.querySelector('.pmu-headtools'), form: card.getAttribute('data-head') || 'line' });
  }
  function headForm(def, w, h, pitch) {
    if (TILE_KINDS[def.kind]) return 'tile';
    if (LINE_KINDS[def.kind]) return 'line';
    var px = w * pitch - 8;
    return h >= 7 && px >= 228 ? 'plate' : 'line';
  }
  function asideHtml(v) {
    if (!v) return '';
    if (typeof v === 'string') return esc(v);
    return v.html != null ? v.html : '<span' + (v.tone ? ' data-tone="' + esc(v.tone) + '"' : '') + '>' + esc(v.text || '') + '</span>';
  }
  /* the head key (A1 3.1 / 5.3): def.mark = provider id (mark 24 in plates, 18 in line heads, 16 in tiles); def.key =
     html, or {swatch: 'tk-in'} | {line: 'tk-cost'} | {half: ['tk-cw', 'tk-cr']} (token colours) | {mark: id}; default:
     the widget's provider (def.prov, or the provider of an acct-<providerId> plate) in plates and tiles */
  function swatch(tok, cls) { return '<i class="pmu-keysw' + (cls ? ' ' + cls : '') + '" style="--k:var(--pmu-' + esc(String(tok).replace(/^--pmu-/, '')) + ')"></i>'; }
  function keyHtml(def, ctx, form) {
    var size = form === 'plate' ? 24 : form === 'tile' ? 16 : 18;
    var k = def.key ? (typeof def.key === 'function' ? def.key(Object.assign({ form: form }, ctx)) : def.key) : null;
    if (k && typeof k === 'object') {
      if (k.mark) return PMU.mark(k.mark, size);
      if (k.swatch) return swatch(k.swatch);
      if (k.line) return swatch(k.line, 'is-line');
      if (k.half) return (k.half || []).map(function (h) { return swatch(h, 'is-half'); }).join('');
      if (k.html) return k.html;
      return '';
    }
    if (typeof k === 'string' && k) return k;
    var m = def.mark ? text(def.mark, ctx) : '';
    if (m) return PMU.mark(m, size);
    var acct = def.kind === 'provider' && /^acct-/.test(ctx.id) ? ctx.id.slice(5) : '';
    var prov = def.prov || acct;
    if (prov && (form !== 'line' || acct)) return PMU.mark(prov, size);   /* provider widgets keep their mark in a line head too */
    return '';
  }
  function syncHead(card, ctx) {
    var def = ctx.def, form = card.getAttribute('data-head') || 'line', tier = ctx.tier || {};
    var titleEl = card.querySelector('.pmu-cardtitle'), subEl = card.querySelector('.pmu-cardsub'), asideEl = card.querySelector('.pmu-cardmeta'), keyEl = card.querySelector('.pmu-cardkey');
    var full = text(def.title, ctx), sub = text(def.meta, ctx);
    var want = (tier.w === 'xs' || tier.w === 's') && def.short ? text(def.short, ctx) : full;
    if (titleEl) {
      if (titleEl.textContent !== want) titleEl.textContent = want;
      if (titleEl.getAttribute('data-pm-hover-label') !== full) titleEl.setAttribute('data-pm-hover-label', full);
      if ((titleEl.getAttribute('data-pm-hover-detail') || '') !== sub) titleEl.setAttribute('data-pm-hover-detail', sub);
    }
    if (subEl && subEl.textContent !== sub) subEl.textContent = sub;
    if (asideEl) { var a = asideHtml(text(def.aside || def.lineMeta, ctx)); if (asideEl._pmu !== a) { asideEl.innerHTML = a; asideEl._pmu = a; } }
    if (keyEl) { var k = keyHtml(def, ctx, form); if (keyEl._pmu !== k) { keyEl.innerHTML = k; keyEl._pmu = k; keyEl.hidden = !k; } }
    var tone = def.tone ? text(def.tone, ctx) : '';
    if ((card.getAttribute('data-tone') || '') !== tone) { if (tone) card.setAttribute('data-tone', tone); else card.removeAttribute('data-tone'); }
  }

  /* ---- the card menu, the size picker and the gear (PMU.menu) ---- */
  function sizeName(kindSpec, w, h) {
    var p = (kindSpec && kindSpec.presets || []).filter(function (x) { return x.w === w && x.h === h; })[0];
    return p ? p.name : null;
  }
  function sizeRows(id) {
    var ks = PMU.widgets.spec(id), cls = PMU.board.cls(), me = PMU.board.rect(id);
    if (!ks || !me) return [];
    return (ks.presets || []).map(function (p) {
      var w = Math.min(p.w, cls.tracks), wide = p.w > cls.tracks;
      return { value: 'size:' + p.w + 'x' + p.h, label: p.name, right: w + ' x ' + p.h, active: me.w === p.w && me.h === p.h,
        disabled: wide, reason: wide ? 'Wider than this board (' + cls.tracks + ' columns)' : null };
    });
  }
  function applySize(id, v) {
    var m = /^size:(\d+)x(\d+)$/.exec(v); if (!m) return false;
    PMU.board.resize(id, { w: +m[1], h: +m[2] }, 'size_menu');
    return true;
  }
  var RANGES = [['5h', 'Last 5 hours'], ['24h', 'Last 24 hours'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']];
  function gearSpec(id) {
    var def = PMU.widgets.get(id) || {}, cfg = cfgOf(id), sections = [];
    var title = text(def.title, ctxBase(id, st.room));
    if (def.range !== false) sections.push({ label: t('gear.range'), rows: [{ value: 'range:', label: t('gear.range_follow'), sub: t('gear.range_follow_sub', { range: st.range }), active: !cfg.range }]
      .concat(RANGES.map(function (r) { return { value: 'range:' + r[0], label: r[1], sub: t('gear.range_fixed_sub'), right: r[0], active: cfg.range === r[0] }; })) });
    if (def.scope !== false) sections.push({ label: t('gear.scope'), rows: [{ value: 'scope:', label: t('gear.scope_follow'), sub: t('gear.scope_follow_sub', { scope: PMU.shell.scopeLabel(st.scope) }), active: !cfg.scope }]
      .concat(DATA.providers.map(function (p) { return { value: 'scope:provider:' + p.id, label: PMU.shell.providerName(p.id) + ' only', mark: p.id, active: cfg.scope === 'provider:' + p.id }; })) });
    (Array.isArray(def.config) ? def.config : []).forEach(function (opt) {
      var cur = cfg[opt.id] !== undefined ? cfg[opt.id] : (typeof opt.value === 'function' ? opt.value(ctxBase(id, st.room)) : opt.value);
      sections.push({ label: opt.label, rows: (opt.options || []).map(function (o) {
        return { value: 'cfg:' + opt.id + ':' + o.value, label: o.label, sub: o.sub, right: o.right, active: String(cur) === String(o.value), disabled: o.disabled, reason: o.reason };
      }) });
    });
    if (!sections.length) sections.push({ rows: [{ html: '<p class="pmu-mnote">' + esc('This panel has nothing to configure.') + '</p>' }] });
    return { id: 'gear:' + id, title: t('gear.title'), current: title, align: 'end', width: 320, keepOpen: true, foot: t('gear.note'), sections: sections,
      onPick: function (v, row, h) {
        var m = /^(range|scope):(.*)$/.exec(v), patch = {};
        if (m) patch[m[1]] = m[2] || null;
        var c = /^cfg:([^:]+):(.*)$/.exec(v);
        if (c) {
          var opt = (def.config || []).filter(function (o) { return o.id === c[1]; })[0];
          var val = opt ? (opt.options || []).filter(function (o) { return String(o.value) === c[2]; })[0] : null;
          patch[c[1]] = val ? val.value : c[2];
          if (opt && typeof opt.set === 'function') { try { opt.set(patch[c[1]], ctxBase(id, st.room)); } catch (error) { console.error('[pm-usage] config set', error); } }
        }
        PMU.board.setConfig(id, patch);
        h.spec = gearSpec(id);
        return false;
      } };
  }
  function cardMenuSpec(id) {
    var def = PMU.widgets.get(id) || {}, me = PMU.board.rect(id), ks = PMU.widgets.spec(id) || {};
    var title = text(def.title, ctxBase(id, st.room));
    var cur = me ? (sizeName(ks, me.w, me.h) ? t('cardmenu.current_size', { name: sizeName(ks, me.w, me.h), w: me.w, h: me.h }) : t('cardmenu.custom_size', { w: me.w, h: me.h })) : '';
    var kind = PMU.widgets.kindOf(id);
    var panelRows = [{ value: 'configure', label: t('cardmenu.configure'), sub: t('cardmenu.configure_sub'), icon: 'gear', submenu: function () { return gearSpec(id); } }];
    if (kind && typeof kind.autoH === 'function') panelRows.push({ value: 'fit', label: t('cardmenu.fit'), sub: t('cardmenu.fit_sub'), icon: 'size', action: true });
    if (typeof def.inspect === 'function') panelRows.push({ value: 'details', label: t('cardmenu.details'), sub: t('cardmenu.details_sub'), icon: 'info', action: true });
    panelRows.push({ value: 'kbmove', label: t('cardmenu.move'), sub: t('cardmenu.move_sub'), icon: 'grip', action: true },
      { value: 'kbresize', label: t('cardmenu.resize'), sub: t('cardmenu.resize_sub'), icon: 'resize', action: true },
      { value: 'tidy', label: t('cardmenu.tidy'), sub: t('cardmenu.tidy_sub'), icon: 'tidy', action: true },
      { value: 'hide', label: t('cardmenu.hide'), sub: t('cardmenu.hide_sub'), icon: 'eyeOff', action: true, danger: true });
    return { id: 'card:' + id, title: title, current: cur, align: 'end', width: 300,
      sections: [{ label: t('cardmenu.size'), rows: sizeRows(id) }, { label: 'Panel', rows: panelRows }],
      onPick: function (v) { return cardAction(id, v); } };
  }
  function cardAction(id, v) {
    var card = PMU.board.card(id), def = PMU.widgets.get(id) || {};
    if (applySize(id, v)) return true;
    if (v === 'fit') {
      var kind = PMU.widgets.kindOf(id), body = card && card.querySelector('.pmu-cardbody');
      var rows = null; try { rows = kind.autoH(body && body._pmuCtx ? body._pmuCtx : ctxBase(id, st.room)); } catch (error) { rows = null; }
      if (rows) PMU.board.resize(id, { h: rows }, 'size_menu');
      return true;
    }
    if (v === 'details') { try { PMU.inspector.open(def.inspect(ctxBase(id, st.room)), card); } catch (error) { console.error('[pm-usage] inspect', error); } return true; }
    if (v === 'kbmove') { setTimeout(function () { PMU.board.keyboard(id, 'move'); }, 0); return true; }
    if (v === 'kbresize') { setTimeout(function () { PMU.board.keyboard(id, 'resize'); }, 0); return true; }
    if (v === 'tidy') { PMU.board.tidy(); return true; }
    if (v === 'hide') { var name = text(def.title, ctxBase(id, st.room)); PMU.board.setVisible(id, false); PMU.shell.toast(t('toast.hidden', { name: name })); return true; }
    return true;
  }
  function sizeMenuSpec(id) {
    var def = PMU.widgets.get(id) || {}, me = PMU.board.rect(id), ks = PMU.widgets.spec(id) || {};
    var nm = me ? sizeName(ks, me.w, me.h) : null;
    return { id: 'size:' + id, title: t('cardmenu.size'), current: me ? (nm ? nm + ' · ' : '') + me.w + ' x ' + me.h : '', align: 'end', width: 260,
      rows: sizeRows(id), foot: 'Drag any edge or corner for any size in between.', onPick: function (v) { applySize(id, v); return true; } };
  }

  PMU.cards = {
    HEAD_PX: HEAD_PX,
    headForm: headForm,
    build: function (id, room, rect) {
      var def = PMU.widgets.get(id) || { title: id, kind: 'unknown' };
      var card = document.createElement('article');
      card.className = 'pmu-card';
      card.setAttribute('data-widget', id);
      card.setAttribute('data-room', room);
      card.setAttribute('data-kind', def.kind || 'unknown');
      card.setAttribute('data-level', def.level || 'glance');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-roledescription', 'panel');
      card.setAttribute('data-pm-hover-exempt', 'panel');   /* the title carries the panel's hover tag; the plate itself shows none (no tag over a keyboard move) */
      if (def.prov) card.setAttribute('data-prov', def.prov);
      var base = ctxBase(id, room), title = text(def.title, base), sub = text(def.meta, base);
      card.setAttribute('aria-label', title);
      card.innerHTML = '<header class="pmu-cardhead"><span class="pmu-cardkey" hidden></span>' +
        '<div class="pmu-cardtitles"><h3 class="pmu-cardtitle" data-pm-hover-label="' + esc(title) + '" data-pm-hover-detail="' + esc(sub) + '">' + esc(title) + '</h3>' +
        '<span class="pmu-cardsub">' + esc(sub) + '</span></div>' +
        '<span class="pmu-cardmeta"></span><span class="pmu-headtools"></span>' +
        '<span class="pmu-cardtools">' +
        '<button type="button" class="pmu-iconbtn pmu-grip" data-tool="grip" aria-label="' + esc(t('board.grip')) + '" data-pm-hover-label="' + esc(t('board.grip')) + '">' + SVG.grip + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardsize" data-tool="size" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(t('board.size_tool')) + '">' + SVG.size + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardgear" data-tool="gear" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(t('board.gear_tool')) + '">' + SVG.gear + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardmenu" data-tool="menu" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(t('board.menu_tool')) + '">' + SVG.kebab + '</button></span></header>' +
        '<div class="pmu-cardbody"></div>' + EDGES.map(function (e) { return '<i class="pmu-h" data-edge="' + e + '" aria-hidden="true"></i>'; }).join('');
      if (rect) PMU.board.place(card, rect);
      return card;
    },
    /* (re)build the body for a tier: destroy the old kind instance, render, and play the one entrance when entering */
    renderBody: function (card, tier, entering) {
      var body = card.querySelector('.pmu-cardbody'); if (!body) return;
      var id = card.getAttribute('data-widget'), kind = PMU.widgets.kindOf(id);
      withView(id, function () {
        var ctx = ctxFor(card, tier, entering);
        syncHead(card, ctx);
        if (body._pmuKind && body._pmuKind.destroy) { try { body._pmuKind.destroy(body, body._pmuCtx); } catch (error) {} }
        body.textContent = '';
        var head = card.querySelector('.pmu-headtools'); if (head) head.textContent = '';
        body._pmuKind = kind; body._pmuCtx = ctx; body._pmuSize = ctx.size.w + 'x' + ctx.size.h + '@' + tier.bw + 'x' + tier.bh;
        if (!kind) {
          body.innerHTML = '<div class="pmu-todo">' + esc(t('board.not_built', { kind: ctx.def.kind || 'widget', w: ctx.size.w, h: ctx.size.h })) + ' · ' + tier.w + ' / ' + tier.h + '</div>';
          return;
        }
        try {
          kind.render(body, ctx);
          if (entering && kind.enter) kind.enter(body, ctx, (card._pmuEnterDelay || 0) + 160);
        } catch (error) { console.error('[pm-usage] render ' + id, error); body.innerHTML = '<div class="pmu-todo">' + esc(id) + '</div>'; }
      });
    },
    /* the same tier at a new pixel size (a resize within the tier, a dock drag): kind.resize when the kind has one */
    resizeBody: function (card, tier) {
      var body = card.querySelector('.pmu-cardbody'); if (!body) return;
      var id = card.getAttribute('data-widget'), kind = body._pmuKind;
      if (!kind) return;
      if (typeof kind.resize !== 'function') { PMU.cards.renderBody(card, tier, false); return; }
      withView(id, function () {
        var ctx = ctxFor(card, tier, false); ctx.reason = 'resize';
        body._pmuCtx = ctx; body._pmuSize = ctx.size.w + 'x' + ctx.size.h + '@' + tier.bw + 'x' + tier.bh;
        try { kind.resize(body, ctx); } catch (error) { console.error('[pm-usage] resize ' + id, error); }
      });
    },
    updateAll: function (cards, reason) {
      cards.forEach(function (card) { PMU.cards.update(card, reason); });
    },
    update: function (card, reason) {
      var body = card.querySelector('.pmu-cardbody'); if (!body) return;
      var id = card.getAttribute('data-widget');
      var kind = body._pmuKind, tier = body._pmuCtx ? body._pmuCtx.tier : PMU.board.measure(card);
      withView(id, function () {
        var ctx = ctxFor(card, tier, false); ctx.reason = reason;
        syncHead(card, ctx);
        if (kind && kind.update) { try { body._pmuCtx = ctx; kind.update(body, ctx); } catch (error) { console.error('[pm-usage] update ' + id, error); } }
        else if (kind) PMU.cards.renderBody(card, tier, false);
      });
    },
    empty: function (room) {
      var el = document.createElement('div');
      el.className = 'pmu-empty pmu-board-empty';
      var rank = (DETAIL[st.detail] || DETAIL.glance).rank;
      var holder = ['detailed', 'diagnostics'].filter(function (lv) { return DETAIL[lv].rank > rank && PMU.board.layout(room).some(function (r) { return (PMU.widgets.get(r.id) || {}).level === lv; }); })[0];
      el.textContent = holder ? t('board.empty_level', { level: DETAIL[st.detail].label, holder: DETAIL[holder].label }) : t('board.empty_none');
      return el;
    },
    menu: function (id, anchor) { return PMU.menu.toggle(anchor, cardMenuSpec(id)); },
    sizeMenu: function (id, anchor) { return PMU.menu.toggle(anchor, sizeMenuSpec(id)); },
    gear: function (id, anchor) { return PMU.menu.toggle(anchor, gearSpec(id)); },
    sizeName: sizeName
  };

  /* tool clicks (delegated on the board) */
  var boardEl = document.getElementById('pmuBoard');
  if (boardEl) boardEl.addEventListener('click', function (event) {
    var tool = event.target.closest('.pmu-cardtools [data-tool]');
    if (!tool) return;
    var card = tool.closest('.pmu-card'); if (!card) return;
    var id = card.getAttribute('data-widget'), which = tool.getAttribute('data-tool');
    event.stopPropagation();
    if (which === 'menu') PMU.cards.menu(id, tool);
    else if (which === 'size') PMU.cards.sizeMenu(id, tool);
    else if (which === 'gear') PMU.cards.gear(id, tool);
    else if (which === 'grip' && event.detail === 0) PMU.board.keyboard(id, 'move');   /* keyboard activation of the grip */
  });
})();
