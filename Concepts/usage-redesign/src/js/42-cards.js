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
  var HEAD_PX = { plate: 52, line: 34, tile: 30, band: 52 };
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
    if (def.kind === 'group') return 'band';
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
  /* a provider mark in a card head is a shared element of the flight (WOW-SPEC-3 6.3 prov:<p.id>, N3-1): it flies between
     rooms that both show it */
  function markHtml(id, size) {
    var html = PMU.mark(id, size);
    return id && html ? String(html).replace(/^(\s*<[a-zA-Z][\w-]*)/, '$1 data-share="prov:' + esc(id) + '"') : html;
  }
  function keyHtml(def, ctx, form) {
    var size = form === 'plate' ? 24 : form === 'tile' ? 16 : 18;
    var k = def.key ? (typeof def.key === 'function' ? def.key(Object.assign({ form: form }, ctx)) : def.key) : null;
    if (k && typeof k === 'object') {
      if (k.mark) return markHtml(k.mark, size);
      if (k.swatch) return swatch(k.swatch);
      if (k.line) return swatch(k.line, 'is-line');
      if (k.half) return (k.half || []).map(function (h) { return swatch(h, 'is-half'); }).join('');
      if (k.html) return k.html;
      return '';
    }
    if (typeof k === 'string' && k) return k;
    var m = def.mark ? text(def.mark, ctx) : '';
    if (m) return markHtml(m, size);
    var acct = def.kind === 'provider' && /^acct-/.test(ctx.id) ? ctx.id.slice(5) : '';
    var prov = def.prov || acct;
    if (prov && (form !== 'line' || acct)) return markHtml(prov, size);   /* provider widgets keep their mark in a line head too */
    return '';
  }
  /* does the whole title fit its head line? Measured without a layout read: the card width from its grid rect and the
     board pitch, the text in the theme face (NieR: tracked capitals). A plate whose title does not fit wraps the title to
     two lines and gives the subtitle line to it (the subtitle stays in the title's hover tag). */
  function titleFits(card, text, form) {
    var cls = PMU.board && PMU.board.cls ? PMU.board.cls() : null;
    if (!cls || !cls.pitchX || !PMU.charts || !PMU.charts.textW) return true;
    var w = (+card.dataset.w || 0) * cls.pitchX - 8 - 28 - (card.querySelector('.pmu-cardkey:not([hidden])') ? 34 : 0) - 6;
    var nier = document.documentElement.getAttribute('data-o55-nier') === 'on';
    var px = form === 'plate' ? 15 : form === 'tile' ? 13 : 13.5, tx = nier ? String(text).toUpperCase() : String(text);
    /* 10 % and a 12 px gap of margin: a canvas measure can run narrower than the laid-out face (Retro's mono, NieR) */
    var wide = nier || /^retro/.test(document.documentElement.getAttribute('data-theme') || '');
    return (PMU.charts.textW(tx, px, false, 640) + (nier ? tx.length * px * 0.05 : 0)) * (wide ? 1.25 : 1.1) <= w - 12;
  }
  /* a plate's subtitle drops whole trailing " · " parts where it would end in an ellipsis beside the aside (NOTES2-content
     engine 4: Retro and NieR fonts run wider); the full line stays in the title's hover tag. Canvas measure, no layout read. */
  function fitSub(card, sub, asideText, form) {
    if (form !== 'plate' || !sub || sub.indexOf(' · ') < 0 || !PMU.charts || !PMU.charts.textW) return sub;
    var cls = PMU.board && PMU.board.cls ? PMU.board.cls() : null;
    if (!cls || !cls.pitchX) return sub;
    var cardW = (+card.dataset.w || 0) * cls.pitchX - 8;
    var key = card.querySelector('.pmu-cardkey:not([hidden])') ? 34 : 0;
    var nier = document.documentElement.getAttribute('data-o55-nier') === 'on';
    var wide = nier || /^retro/.test(document.documentElement.getAttribute('data-theme') || '');
    var k = wide ? 1.22 : 1.08;
    var aside = asideText ? Math.min(cardW * 0.46, PMU.charts.textW(String(asideText), 12.5, false, 500) * k) + 10 : 0;
    /* NieR's plate ticks keep 34 px at the subtitle's right (90-nier-shell.css) */
    var avail = cardW - 28 - key - aside - 4 - (nier ? 34 : 0);
    var parts = sub.split(' · '), out = sub;
    while (parts.length > 1 && PMU.charts.textW(out, 12, false, 400) * k > avail) { parts.pop(); out = parts.join(' · '); }
    return out;
  }
  /* a title never breaks at a word's own hyphen (final fix M9b: "Headroom and auto- / switch" in the 4-track tile): the
     shown text joins hyphenated words with U+2011; the hover tag, the menus and search keep the plain hyphen */
  function nbHyphen(s) { return String(s == null ? '' : s).replace(/(\S)-(?=\S)/g, '$1\u2011'); }
  function syncHead(card, ctx) {
    var def = ctx.def, form = card.getAttribute('data-head') || 'line', tier = ctx.tier || {};
    var titleEl = card.querySelector('.pmu-cardtitle'), subEl = card.querySelector('.pmu-cardsub'), asideEl = card.querySelector('.pmu-cardmeta'), keyEl = card.querySelector('.pmu-cardkey');
    /* the key (mark or swatch) first: titleFits and fitSub measure the room beside it, and a hidden key read on the first
       sync made the subtitle 34 px too generous (FINAL-REVIEW-3 must-fix 8: Muse Code "Standby · alex@orbit.example" cut
       at 140 / 185 px in Glass Dark 1440) */
    if (keyEl) { var k = keyHtml(def, ctx, form); if (keyEl._pmu !== k) { keyEl.innerHTML = k; keyEl._pmu = k; keyEl.hidden = !k; } }
    var full = text(def.title, ctx), sub = text(def.meta, ctx);
    /* the short title only where the whole title does not fit its line (final fix M8: provider tiles keep their Settings
       names wherever they fit) */
    var want = nbHyphen((tier.w === 'xs' || tier.w === 's') && def.short && !titleFits(card, full, form) ? text(def.short, ctx) : full);
    if (titleEl) {
      if (titleEl.textContent !== want) titleEl.textContent = want;
      if (titleEl.getAttribute('data-pm-hover-label') !== full) titleEl.setAttribute('data-pm-hover-label', full);
      if ((titleEl.getAttribute('data-pm-hover-detail') || '') !== sub) titleEl.setAttribute('data-pm-hover-detail', sub);
    }
    var asideV = text(def.aside || def.lineMeta, ctx);
    var shown = fitSub(card, sub, asideV && typeof asideV === 'object' ? (asideV.text || String(asideV.html || '').replace(/<[^>]+>/g, '')) : asideV, form);
    if (subEl && subEl.textContent !== shown) subEl.textContent = shown;
    var wrap = form === 'plate' && !titleFits(card, want, form);
    if (card.hasAttribute('data-title-wrap') !== wrap) card.toggleAttribute('data-title-wrap', wrap);
    if (asideEl) { var a = asideHtml(asideV); if (asideEl._pmu !== a) { asideEl.innerHTML = a; asideEl._pmu = a; } }
    var tone = def.tone ? text(def.tone, ctx) : '';
    if ((card.getAttribute('data-tone') || '') !== tone) { if (tone) card.setAttribute('data-tone', tone); else card.removeAttribute('data-tone'); }
  }

  /* ---- the card menu, the size picker and the gear (PMU.menu) ---- */
  function sizeName(kindSpec, w, h) {
    var p = (kindSpec && kindSpec.presets || []).filter(function (x) { return x.w === w && x.h === h; })[0];
    return p ? p.name : null;
  }
  /* one muted line per size row, the way the Chat Assistant menus describe each choice: what the panel shows at that size */
  var SIZE_DESC = {
    limit: [[3, 'The binding window on one line'], [6, 'Every window and its reset'], [8, 'Windows and the plan line'], [99, 'Windows, plan, spend and facts']],
    kpi: [[3, 'The value alone'], [4, 'Value and its second line'], [6, 'Value, line and facts'], [99, 'Value, trend and every fact']],
    kpis: [[3, 'Values in one strip'], [5, 'Values with their second lines'], [99, 'Two rows of values']],
    provider: [[3, 'One line per account'], [7, 'Accounts with every window'], [99, 'Accounts, windows and notes']],
    providers: [[4, 'Two or three lines'], [99, 'Every provider line']],
    switch: [[3, 'Toggle and threshold on one line'], [99, 'Toggle, threshold and most room']],
    alert: [[6, 'State, detail and meter'], [99, 'State, meter, actions and facts']],
    free: [[6, 'State and price'], [99, 'State, price and every fact']],
    cache: [[6, 'Read share and split'], [99, 'Read share, split and facts']],
    context: [[6, 'Ring and families'], [99, 'Ring, families and route']],
    trend: [[5, 'A compact chart'], [8, 'Chart with axes and legend'], [99, 'Chart, legend and facts']],
    columns: [[5, 'A compact chart'], [8, 'Chart with axes'], [99, 'Chart, caption and facts']],
    budget: [[6, 'Spend and projection'], [99, 'Spend, projection chart and facts']],
    heat: [[6, 'The week at a glance'], [99, 'Every hour with labels']],
    donut: [[10, 'Ring and top models'], [99, 'Ring and every model']],
    breakdown: [[10, 'Every token type'], [99, 'Types with the counting note']],
    efficiency: [[9, 'Ring and savings'], [99, 'Ring, savings and trend']],
    models: [[8, 'The top models'], [99, 'Every model']],
    mix: [[4, 'The mix bar'], [99, 'Mix bar and every part']],
    setup: [[3, 'The setup line'], [99, 'Setup and every fact']]
  };
  function sizeDesc(kind, w, h) {
    var list = SIZE_DESC[kind] || [[6, 'The first rows'], [10, 'Most rows'], [99, 'Every row']];
    for (var i = 0; i < list.length; i++) if (h <= list[i][0]) return list[i][1];
    return list[list.length - 1][1];
  }
  function sizeRows(id) {
    var ks = PMU.widgets.spec(id), cls = PMU.board.cls(), me = PMU.board.rect(id), kind = (PMU.widgets.get(id) || {}).kind;
    if (!ks || !me) return [];
    return (ks.presets || []).map(function (p) {
      var w = Math.min(p.w, cls.tracks), wide = p.w > cls.tracks;
      return { value: 'size:' + p.w + 'x' + p.h, label: p.name, sub: sizeDesc(kind, p.w, p.h), right: w + ' x ' + p.h, active: me.w === p.w && me.h === p.h,
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
    /* "Fit" only when it would change the card (the kind's autoH names a taller height that shows every row) */
    var fitH = null;
    if (kind && typeof kind.autoH === 'function') { try { var cb = PMU.board.card(id), bd = cb && cb.querySelector('.pmu-cardbody'); fitH = kind.autoH(bd && bd._pmuCtx ? bd._pmuCtx : ctxBase(id, st.room)); } catch (error) { fitH = null; } }
    if (fitH) panelRows.push({ value: 'fit', label: t('cardmenu.fit'), sub: t('cardmenu.fit_sub'), icon: 'size', action: true });
    if (typeof def.inspect === 'function') panelRows.push({ value: 'details', label: t('cardmenu.details'), sub: t('cardmenu.details_sub'), icon: 'info', action: true });
    panelRows.push({ value: 'kbmove', label: t('cardmenu.move'), sub: t('cardmenu.move_sub'), icon: 'grip', action: true },
      { value: 'kbresize', label: t('cardmenu.resize'), sub: t('cardmenu.resize_sub'), icon: 'resize', action: true },
      { value: 'tidy', label: t('cardmenu.tidy'), sub: t('cardmenu.tidy_sub'), icon: 'tidy', action: true },
      { value: 'hide', label: t('cardmenu.hide'), sub: t('cardmenu.hide_sub'), icon: 'eyeOff', action: true, danger: true });
    return { id: 'card:' + id, title: title, current: cur, align: 'end', width: 320,
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
    return { id: 'size:' + id, title: t('cardmenu.size'), current: me ? (nm ? nm + ' · ' : '') + me.w + ' x ' + me.h : '', align: 'end', width: 300,
      rows: sizeRows(id), foot: 'Drag any edge or corner for any size in between.', onPick: function (v) { applySize(id, v); return true; } };
  }

  /* the heads follow the look: a NieR or Retro switch (or a web font that lands late) changes the face the subtitles and
     titles are measured in, so every card's head is fitted again (Mac NieR 1920: a plate subtitle fitted in the Basic
     face kept its third part and ended in an ellipsis) */
  function resyncHeads() {
    var board = document.getElementById('pmuBoard'); if (!board) return;
    Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card'), function (card) {
      var body = card.querySelector('.pmu-cardbody'), ctx = body && body._pmuCtx;
      if (!ctx || !ctx.def) return;
      try { withView(card.getAttribute('data-widget'), function () { syncHead(card, ctx); }); } catch (error) {}
    });
  }
  var headT = 0;
  function resyncSoon() { if (headT) return; headT = requestAnimationFrame(function () { headT = 0; resyncHeads(); }); }
  if (PMU.theme && PMU.theme.onChange) PMU.theme.onChange(resyncSoon);
  try { if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', resyncSoon); } catch (error) {}
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
      /* live readings this card shows without a share key on screen yet (an arriving alert): share-key prefixes */
      if (def.live) card.setAttribute('data-live', [].concat(def.live).join(' '));
      var base = ctxBase(id, room), title = text(def.title, base), sub = text(def.meta, base);
      card.setAttribute('aria-label', title);
      card.innerHTML = '<header class="pmu-cardhead"><span class="pmu-cardkey" hidden></span>' +
        '<div class="pmu-cardtitles"><h3 class="pmu-cardtitle" data-pm-hover-label="' + esc(title) + '" data-pm-hover-detail="' + esc(sub) + '">' + esc(nbHyphen(title)) + '</h3>' +
        '<span class="pmu-cardsub">' + esc(sub) + '</span></div>' +
        '<span class="pmu-cardmeta"></span><span class="pmu-headtools"></span>' +
        '<span class="pmu-cardtools">' +
        '<button type="button" class="pmu-iconbtn pmu-grip" data-tool="grip" aria-label="' + esc(t('board.grip')) + '" data-pm-hover-label="' + esc(t('board.grip')) + '">' + SVG.toolGrip + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardsize" data-tool="size" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(t('board.size_tool')) + '">' + SVG.toolSize + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardgear" data-tool="gear" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(t('board.gear_tool')) + '">' + SVG.toolGear + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardmenu" data-tool="menu" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(t('board.menu_tool')) + '">' + SVG.toolKebab + '</button></span></header>' +
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
          /* the inner entrance runs through PMU.film.cue: at once (with the card's wave delay + 160), or, while the
             first arrival holds the board, at its release (WOW-SPEC 3.1) */
          if (entering && kind.enter) {
            if (PMU.film && PMU.film.cue) PMU.film.cue(card, function (d) { withView(id, function () { kind.enter(body, ctx, d); }); });
            else kind.enter(body, ctx, (card._pmuEnterDelay || 0) + 160);
          }
        } catch (error) { console.error('[pm-usage] render ' + id, error); body.innerHTML = '<div class="pmu-todo">' + esc(id) + '</div>'; }
      });
      refitSoon(card);
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
      refitSoon(card);
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
      refitSoon(card);
    },
    empty: function (room) {
      var el = document.createElement('div');
      el.className = 'pmu-empty pmu-board-empty';
      var rank = (DETAIL[st.detail] || DETAIL.glance).rank;
      var holder = ['detailed', 'diagnostics'].filter(function (lv) { return DETAIL[lv].rank > rank && PMU.board.layout(room).some(function (r) { return (PMU.widgets.get(r.id) || {}).level === lv; }); })[0];
      el.textContent = holder ? t('board.empty_level', { level: DETAIL[st.detail].label, holder: DETAIL[holder].label }) : t('board.empty_none');
      /* an empty board's note rises 12 px, 320 OUT (WOW-SPEC 3.16) */
      if (PMU.motion) PMU.motion.animate(el, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { dur: 320, delay: 80, easing: 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
      return el;
    },
    menu: function (id, anchor) { return PMU.menu.toggle(anchor, cardMenuSpec(id)); },
    sizeMenu: function (id, anchor) { return PMU.menu.toggle(anchor, sizeMenuSpec(id)); },
    gear: function (id, anchor) { return PMU.menu.toggle(anchor, gearSpec(id)); },
    sizeName: sizeName
  };

  /* ---- the head's room for its actions (Jared's note 6b, 2026-10-09) ----
     The tools cluster shows at the head's top right on hover and on keyboard focus. It never covers the title or the
     head tools and always fits in the head. Entering a card reads its head once, as it rests, and picks the widest form
     of the cluster that leaves the whole title where it is: all four tools, grip and menu, or the menu alone (it holds
     size, configure, details, move, resize, tidy and hide). The head tools slide exactly clear of it. Where even the
     menu alone does not fit beside the title, the title yields the room: it ends in an ellipsis on the lines it has at
     rest, so the head never grows and the body never moves; the full title stays in its hover tag, the card menu's
     title and Details. Only the head is restyled (the body is contain: strict), once per entered card. */
  var FOLDS = [['full', 4], ['pair', 2], ['menu', 1]], TOOL_GAP = 8;
  var fitT = null;
  function fitTools(card) {
    if (!card || card._pmuLeaving || card.hasAttribute('data-leaving')) return;
    var form = card.getAttribute('data-head'); if (form === 'band') return;
    var head = card.querySelector(':scope > .pmu-cardhead'), tools = head && head.querySelector(':scope > .pmu-cardtools');
    var titles = head && head.querySelector(':scope > .pmu-cardtitles'), title = titles && titles.querySelector('.pmu-cardtitle');
    if (!tools || !title) return;
    var ht = head.querySelector(':scope > .pmu-headtools');
    /* the head as it rests: no room taken, no clamp (the hover styles read these two only) */
    head.style.removeProperty('--pmu-head-room'); head.removeAttribute('data-title-lines');
    var hw = head.offsetWidth; if (!hw) return;
    var hb = head.getBoundingClientRect(), k = hb.width ? hw / hb.width : 1;   /* a card still entering may be scaled */
    var tcs = getComputedStyle(tools), btn = parseFloat(getComputedStyle(tools.lastElementChild).width) || 24;
    var right = hw - (parseFloat(tcs.right) || 6), pad = (parseFloat(tcs.paddingLeft) || 2) * 2;
    var tl = titles.offsetLeft, tr = tl + titles.offsetWidth, tb = title.getBoundingClientRect(), titlesH = titles.getBoundingClientRect().height * k;
    var rg = document.createRange(); rg.selectNodeContents(title);
    var textR = tl, tops = [];
    Array.prototype.forEach.call(rg.getClientRects(), function (r) {
      if (r.width < 0.5 || r.bottom <= tb.top + 0.5 || r.top >= tb.bottom - 0.5) return;   /* a clamped line is not shown */
      textR = Math.max(textR, (Math.min(r.right, tb.right) - hb.left) * k);
      if (!tops.some(function (t) { return Math.abs(t - r.top) < 3; })) tops.push(r.top);
    });
    var htW = ht && ht.firstChild && getComputedStyle(ht).display !== 'none' ? ht.offsetWidth : 0, htR = htW ? ht.offsetLeft + htW : 0;
    var pick = null;
    for (var i = 0; i < FOLDS.length; i++) {
      var left = right - (FOLDS[i][1] * btn + (FOLDS[i][1] - 1) + pad);
      var slide = htW ? Math.max(0, htR - (left - TOOL_GAP)) : 0;
      var limit = (htW ? Math.min(htR - htW - slide, left) : left) - TOOL_GAP;
      pick = { fold: FOLDS[i][0], slide: slide, limit: limit };
      if (textR <= limit + 0.5) break;
    }
    var yieldTitle = textR > pick.limit + 0.5;
    var room = Math.max(0, Math.ceil(tr - pick.limit));
    /* a title that fits keeps a whole pixel clear of its last glyph: the room never narrows its box to the text's own
       width, where the line breaker (1/64 px) and the measured glyphs disagree and the title wrapped ("Kimi / Code",
       "Claud / e") and the head grew */
    if (!yieldTitle) room = Math.min(room, Math.max(0, Math.floor(tr - textR - 1)));
    /* a yielding title keeps the room it has at rest (the titles block's height is held, so the head never grows or
       shrinks and the body never moves) and the lines it has at rest, the last ending in an ellipsis; where a word of a wrapped title would
       not fit the narrower box whole (it would break inside the word, "Gemin / i API"), the title shows one line ending
       in an ellipsis instead. The words are measured here, as the title rests, before the room is written. */
    var lines = Math.max(1, tops.length);
    if (yieldTitle && lines > 1) {
      var wide = 0, wr = document.createRange(), walk = document.createTreeWalker(title, NodeFilter.SHOW_TEXT), tn, re = /\S+/g, mm;
      while ((tn = walk.nextNode())) { re.lastIndex = 0; while ((mm = re.exec(tn.data))) { wr.setStart(tn, mm.index); wr.setEnd(tn, mm.index + mm[0].length); wide = Math.max(wide, wr.getBoundingClientRect().width * k); } }
      if (wide > tr - room - (tb.left - hb.left) * k - 2) lines = 1;
    }
    head.style.setProperty('--pmu-head-room', room + 'px');
    head.style.setProperty('--pmu-head-slide', (pick.slide ? -Math.ceil(pick.slide) : 0) + 'px');
    if (tools.getAttribute('data-fold') !== pick.fold) tools.setAttribute('data-fold', pick.fold);
    if (yieldTitle) {
      head.style.setProperty('--pmu-title-lines', String(lines));
      head.style.setProperty('--pmu-title-h', (tb.height * k * lines / Math.max(1, tops.length)) + 'px');
      /* the resting height, read above: read here, under :hover the room is already taken and the title has wrapped */
      head.style.setProperty('--pmu-titles-h', titlesH + 'px');
      head.setAttribute('data-title-lines', '');
    }
    card._pmuFitOn = true;
  }
  /* the clamp of a yielding title goes once the title has its room back (its margin returns 300 after leaving: the
     cluster fades 140, then the head tools slide back 160) */
  function unfitSoon(card) {
    if (!card || !card._pmuFitOn) return;
    setTimeout(function () {
      if (card.matches(':hover') || card.matches(':focus-visible')) return;
      var head = card.querySelector(':scope > .pmu-cardhead');
      if (head && head.hasAttribute('data-tools-on')) return;
      if (head) head.removeAttribute('data-title-lines');
      card._pmuFitOn = false;
    }, 340 * M.speed());
  }
  /* a card whose head changes while it shows its tools (a resize from its own size menu, a live update) is fitted again */
  function refitSoon(card) {
    if (!card || !card._pmuFitOn) return;
    if (fitT) cancelAnimationFrame(fitT);
    fitT = requestAnimationFrame(function () { fitT = null; if (card.isConnected && (card.matches(':hover') || card.matches(':focus-visible'))) fitTools(card); });
  }
  var M = PMU.motion;

  /* tool clicks (delegated on the board) */
  /* delegated on the scroll pane: the board element is swapped on a room change (the old one leaves as the ghost) */
  var boardEl = document.getElementById('pmuScroll') || document.getElementById('pmuBoard');
  if (boardEl) {
    boardEl.addEventListener('pointerover', function (event) {
      var card = event.target.closest && event.target.closest('.pmu-card');
      if (!card || card.contains(event.relatedTarget) || card.parentNode !== document.getElementById('pmuBoard')) return;
      try { fitTools(card); } catch (error) { console.error('[pm-usage] head fit', error); }
    });
    boardEl.addEventListener('pointerout', function (event) {
      var card = event.target.closest && event.target.closest('.pmu-card');
      if (card && !card.contains(event.relatedTarget)) unfitSoon(card);
    });
    boardEl.addEventListener('focusin', function (event) {
      var card = event.target.closest && event.target.closest('.pmu-card'); if (!card) return;
      var inTools = !!event.target.closest('.pmu-cardtools'), head = card.querySelector(':scope > .pmu-cardhead');
      if (head && inTools !== head.hasAttribute('data-tools-on')) head.toggleAttribute('data-tools-on', inTools);
      if (inTools || event.target === card) { try { fitTools(card); } catch (error) { console.error('[pm-usage] head fit', error); } }
    });
    boardEl.addEventListener('focusout', function (event) {
      var card = event.target.closest && event.target.closest('.pmu-card'); if (!card) return;
      if (card.contains(event.relatedTarget) && event.relatedTarget.closest('.pmu-cardtools')) return;
      var head = card.querySelector(':scope > .pmu-cardhead'); if (head) head.removeAttribute('data-tools-on');
      unfitSoon(card);
    });
  }
  if (boardEl) boardEl.addEventListener('click', function (event) {
    var tool = event.target.closest('.pmu-cardtools [data-tool]');
    if (!tool) return;
    var card = tool.closest('.pmu-card'); if (!card || card._pmuLeaving || card.hasAttribute('data-leaving')) return;
    var id = card.getAttribute('data-widget'), which = tool.getAttribute('data-tool');
    event.stopPropagation();
    if (which === 'menu') PMU.cards.menu(id, tool);
    else if (which === 'size') PMU.cards.sizeMenu(id, tool);
    else if (which === 'gear') PMU.cards.gear(id, tool);
    else if (which === 'grip' && event.detail === 0) PMU.board.keyboard(id, 'move');   /* keyboard activation of the grip */
  });
})();
