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

  /* ---- size presets (lane c-presets, Jared 2026-10-09: "Panel size presets need to be rethought and polished.
     Currently they make the panels small and the content doesn't make sense."; PRESETS.md in the lane folder) ----
     A kind's presets (tools/boards.py) carry a width per board class (the same pixel width at every class, or the board's
     width) and a height in rows, or by content: fit = n (the smallest height that shows n complete items: accounts, rows,
     resets, models) or 'all' (the smallest that folds nothing). A fit height is measured by rendering the kind in a hidden
     card at that width, in the current look, through the board's own render path (renderBody, then one synchronous fit
     pass), and kept per look, range, scope, configuration and board class. */
  var CLS_ORDER = ['S', 'M', 'L', 'XL'], GAP_PX = 8, ROW_PX = 30, FOLD_TAG = 'Not shown at this size';
  /* what counts as one item of a kind for fit = n (a kind without an entry, or a card that draws none, fits "nothing
     folded") */
  var ITEM_SEL = { kpi: '.pmu-fact', limit: '.pmu-accrow', provider: '.pmu-accrow', list: '.pmu-lrow', table: '.pmu-tbody > .pmu-trow', agenda: '.pmu-agline',
    qhist: '.pmu-qrow:not(.pmu-qaxis)', models: '.pmu-sbrow', ranked: '.pmu-rk', mix: '.pmu-mixrow', providers: '.pmu-provrow', context: '.pmu-ctxleg' };
  /* a plate of one account has no account rows: its "account" is the plate, complete when every window meter shows */
  var WHOLE_SEL = { limit: '.pmu-limitmeter', provider: '.pmu-accmeter' };
  var ITEM_WORD = { kpi: ['fact', 'facts'], limit: ['account', 'accounts'], provider: ['account', 'accounts'], list: ['row', 'rows'], table: ['row', 'rows'],
    agenda: ['reset', 'resets'], qhist: ['account', 'accounts'], models: ['model', 'models'], ranked: ['row', 'rows'], mix: ['part', 'parts'],
    providers: ['provider', 'providers'], context: ['family', 'families'] };
  var fitCache = {};   /* measured fit heights: id|class|w|fit|look|range|scope|config -> rows */
  /* the heights of the last opening of the picker: each opening measures afresh (the data may have changed), and until it
     has, a pick, a row and a Shift step use these (no 80-160 ms measure in the click; the idle measure corrects a row) */
  var fitStale = {};
  /* widget id -> {class: {w, h, px, pid}}: the preset a panel was last set to from the menu at each board class (its fit
     height); kept in the layout record (40-board, presets), so a reload keeps the preset's name */
  var picked = {};
  function pickedAt(id, cls) { return picked[id] ? picked[id][cls] || null : null; }
  function clsNow() { return PMU.board && PMU.board.cls ? PMU.board.cls() : { name: 'S', tracks: 12, pitchX: 47 }; }
  function viewKey(id) {
    var l = PMU.theme.look(), c = cfgOf(id);
    return l.slug + (l.nier ? '+nier' : '') + '|' + st.range + '|' + st.scope + '|' + Object.keys(c).sort().map(function (k) { return k + '=' + c[k]; }).join(',');
  }
  function offered(p, cls) { return !p.from || CLS_ORDER.indexOf(cls) >= CLS_ORDER.indexOf(p.from); }
  function widthOf(p, cls) { return typeof p.w === 'object' ? (p.w[cls] != null ? p.w[cls] : p.w.S) : p.w; }
  /* a preset's width at the board now: authored in tracks at the nominal 47 px pitch (S at a 557 px board, M at 929 px),
     resolved to the same pixel width at the live pitch (never more than 2 % narrower: the content tiers switch at fixed
     pixel widths, and a 264 px "274 px" card crossed them), so a preset is the same card on a 400 px board (pitch 34)
     and a 1700 px one; a board-wide preset takes the class's tracks. Inside the kind's range. A preset with minPx is not
     offered where the board cannot give it that width (the one-line switch strip needs about 480 px). */
  var NOMINAL_PITCH = 47;
  function widthAt(p, ks, cls) {
    var cap = Math.max(1, Math.min(cls.tracks, (ks && ks.wMax) || cls.tracks)), lo = Math.min((ks && ks.wMin) || 1, cap);
    if (p.full) return cap;
    var pitch = cls.pitchX || NOMINAL_PITCH, px = widthOf(p, cls.name) * NOMINAL_PITCH - GAP_PX;
    var t = Math.max(1, Math.round((px + GAP_PX) / pitch));
    while (t * pitch - GAP_PX < px * 0.98) t += 1;
    return Math.max(lo, Math.min(cap, t));
  }
  /* the measured height belongs to the card's pixel width (the same tracks are 34 px apart on a 400 px board, 47 on a
     557 px one) */
  function pxOf(w) { var c = clsNow(); return Math.round(w * (c.pitchX || NOMINAL_PITCH) - GAP_PX); }
  function fitKeyOf(id, cls, w, fit) { return [id, cls, pxOf(w), fit, viewKey(id)].join('|'); }
  /* the presets a panel offers at the board's class now: [{id, name, desc, w, h, fit, measured}] (a fit preset's h is its
     measured height when known, else the kind's fallback) */
  function presetsOf(id) { return dedupe(allPresets(id)); }
  presetsOf.all = function (id) { return allPresets(id); };
  function allPresets(id) {
    var ks = PMU.widgets.spec(id), cls = clsNow();
    if (!ks) return [];
    var list = (ks.presets || []).filter(function (p) { return offered(p, cls.name) && (!p.minPx || Math.min(cls.tracks, (ks.wMax || cls.tracks)) * (cls.pitchX || NOMINAL_PITCH) - GAP_PX >= p.minPx); }).map(function (p) {
      var w = widthAt(p, ks, cls), h = p.h, measured = p.fit == null, stale = false;
      if (p.fit != null) {
        var key = fitKeyOf(id, cls.name, w, p.fit), k = fitCache[key], pk = pickedAt(id, cls.name);
        if (k != null) { h = k; measured = true; }
        else if (pk && pk.pid === p.id && pk.w === w && pk.px === pxOf(w)) { h = pk.h; measured = true; stale = true; }
        else if (fitStale[key] != null) { h = fitStale[key]; measured = true; stale = true; }
      }
      return { id: p.id, name: p.name, desc: p.desc, w: w, h: h, fit: p.fit == null ? null : p.fit, hMin: p.hMin || null, measured: measured, stale: stale };
    });
    return list;
  }
  /* two presets that come to the same size here (a narrow board gives a 10- and a 12-track preset its whole width; a
     fit of eight rows where the panel has eight) are one preset: the later, larger tier keeps the row */
  function dedupe(list) {
    return list.filter(function (p, i) {
      return !list.slice(i + 1).some(function (q) { return q.w === p.w && (p.measured && q.measured ? q.h === p.h : p.fit == null && q.fit == null ? q.h === p.h : p.fit != null && q.fit === p.fit); });
    });
  }
  /* the preset name of a size (the menu's "Current", the resize outline, the layout record's preset_id): with the widget
     id, the preset it was last set to or a measured preset of that size; without, a fixed preset of that size */
  function sizeName(ks, w, h, id) {
    var cls = clsNow().name;
    if (id) {
      var pk = pickedAt(id, cls), list = presetsOf(id);
      if (pk && pk.w === w && pk.h === h) {
        var mine = function (p) { return p.id === pk.pid && p.w === w; };
        var hit = list.filter(mine)[0] || allPresets(id).filter(mine)[0]; if (hit) return hit.name;
      }
      var m = list.filter(function (p) { return p.w === w && p.h === h && p.measured; })[0];
      return m ? m.name : null;
    }
    var c0 = clsNow(), q = (ks && ks.presets || []).filter(function (x) { return offered(x, cls) && x.fit == null && widthAt(x, ks, c0) === w && x.h === h; })[0];
    return q ? q.name : null;
  }

  /* ---- the hidden card: the real kind rendered at a preset's size (the fit measure and the picker's miniature) ---- */
  var measureHost = null;
  function hostEl() {
    var app = document.getElementById('pmuApp'); if (!app) return null;
    if (!measureHost || !measureHost.isConnected) { measureHost = document.createElement('div'); measureHost.className = 'pmu-szmeasure'; measureHost.setAttribute('aria-hidden', 'true'); app.appendChild(measureHost); }
    return measureHost;
  }
  function ghostCard(id) {
    var live = PMU.board.card(id), room = live ? live.getAttribute('data-room') : st.room;
    var card = PMU.cards.build(id, room);
    card._pmuPreview = true;
    card.classList.add('pmu-szcard');
    card.removeAttribute('tabindex'); card.removeAttribute('aria-roledescription');
    card.setAttribute('aria-hidden', 'true'); card.setAttribute('inert', '');
    if (live && live.hasAttribute('data-hero')) card.setAttribute('data-hero', '');
    return card;
  }
  function dropGhost(card) {
    if (!card) return;
    var b = card.querySelector('.pmu-cardbody');
    if (b && b._pmuKind && b._pmuKind.destroy) { try { b._pmuKind.destroy(b, b._pmuCtx); } catch (error) {} }
    if (b) { b._pmuKind = null; b._pmuCtx = null; }
    card.remove();
  }
  /* render the kind at w x h: the head form, the measured tier, the body, one synchronous fit pass; then what it shows */
  function renderAt(card, w, h) {
    var id = card.getAttribute('data-widget'), cls = clsNow(), def = PMU.widgets.get(id) || {};
    card.dataset.x = 0; card.dataset.y = 0; card.dataset.w = w; card.dataset.h = h;
    card.style.width = Math.round(w * cls.pitchX - GAP_PX) + 'px';
    card.style.height = (h * ROW_PX - GAP_PX) + 'px';
    var form = headForm(def, w, h, cls.pitchX);
    if (card.getAttribute('data-head') !== form) card.setAttribute('data-head', form);
    var tier = PMU.board.measure(card);
    card.setAttribute('data-tw', tier.w); card.setAttribute('data-th', tier.h);
    PMU.cards.renderBody(card, tier, false);
    var body = card.querySelector('.pmu-cardbody');
    /* the charts draw now, not in the next microtask (a meter or a ring sets its row's height) */
    if (PMU.charts && PMU.charts.flush) { try { PMU.charts.flush(); } catch (error) {} }
    if (body && PMU.content && PMU.content.fitNow) { try { PMU.content.fitNow(body); } catch (error) { console.error('[pm-usage] preset fit pass', error); } }
    /* a miniature is never a flight's end (WOW-SPEC-3 6.3 shared keys stay on the board) */
    Array.prototype.forEach.call(card.querySelectorAll('[data-share]'), function (el) { el.removeAttribute('data-share'); });
    return readShown(card, def.kind);
  }
  function readShown(card, kind) {
    var body = card.querySelector('.pmu-cardbody'), sel = ITEM_SEL[kind];
    /* an item counts when it is laid out whole inside the body (a row a plate's own clip hides is not shown) */
    var bb = body ? body.getBoundingClientRect() : null;
    var inside = function (el) { var r = el.getBoundingClientRect(); return r.height > 0 && r.top >= bb.top - 1 && r.bottom <= bb.bottom + 1; };
    var items = sel && body ? Array.prototype.filter.call(body.querySelectorAll(sel), inside).length : 0;
    var whole = WHOLE_SEL[kind] && body ? Array.prototype.filter.call(body.querySelectorAll(WHOLE_SEL[kind]), inside).length : 0;
    /* clipped: a word, a mark or a chart running past the card's edges (a fragment, whatever the fold markers say), or
       more than 3 px into the body's bottom padding (agent 4: a NieR totals strip's last line sat on the frame's corner
       ticks, 0 px from the card's edge, and passed); a plate's foot sits in that padding by design */
    var cr = card.getBoundingClientRect(), clipped = false;
    var floor = body ? Math.min(cr.bottom + 1, bb.bottom - Math.max(0, (parseFloat(getComputedStyle(body).paddingBottom) || 0) - 3)) : cr.bottom + 1;
    if (body) Array.prototype.some.call(body.querySelectorAll('*'), function (el) {
      if (el.closest('svg') && !/^svg$/i.test(el.tagName)) return false;
      var own = /^svg$/i.test(el.tagName) || Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (!own) return false;
      var r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
      if (r.bottom > (el.closest('.pmu-cardfoot') ? cr.bottom + 1 : floor) || r.top < bb.top - 1 || r.right > cr.right + 1 || r.left < cr.left - 1) { clipped = true; return true; }
      return false;
    });
    var hidden = 0;
    Array.prototype.forEach.call(card.querySelectorAll('.pmu-more'), function (el) { var m = /^(\d+) more\b/.exec(el.textContent || ''); if (m && el.getClientRects().length) hidden += +m[1]; });
    Array.prototype.forEach.call(card.querySelectorAll('.pmu-headmore'), function (el) { hidden += +(el.getAttribute('data-n') || 0); });
    /* a fold tag without a count ("Not shown at this size" on a body, a strip, a ring) counts the items its tag lists, so
       a fit can tell a strip that folds four families from a ladder that folds none */
    var tags = Array.prototype.filter.call(card.querySelectorAll('[data-pm-hover-label="' + FOLD_TAG + '"]'), function (el) { return !el.classList.contains('pmu-headmore') && !el.classList.contains('pmu-more'); });
    tags.forEach(function (el) { var d = el.getAttribute('data-pm-hover-detail') || ''; hidden += d ? d.split('; ').length : 1; });
    var tagged = tags.length > 0 || !!card.querySelector('[data-pm-hover-label="' + FOLD_TAG + '"]');
    return { items: items, whole: whole, hidden: hidden, folded: hidden > 0 || tagged, clipped: clipped };
  }
  /* the smallest height (rows) at width w that shows fit = n items, or everything (fit 'all'); where even the kind's tallest
     size folds, the smallest that shows as much as the tallest. A job renders one height a step, so the picker can
     measure in idle slices (one render, 15-30 ms, a slice) and a pick can finish it at once. */
  var jobs = {};
  function fitJob(id, w, fit) {
    var cls = clsNow(), key = fitKeyOf(id, cls.name, w, fit);
    if (jobs[key] && !jobs[key].done) return jobs[key];
    var job = { key: key, done: false, h: fitCache[key] != null ? fitCache[key] : null, renders: 0, t0: performance.now() };
    if (job.h != null) { job.done = true; return job; }
    jobs[key] = job;
    var ks = PMU.widgets.spec(id) || {};
    var pre = (ks.presets || []).filter(function (p) { return p.fit === fit && offered(p, cls.name) && widthAt(p, ks, cls) === w; })[0];
    /* a preset's own floor (per class): the form it names needs its rows (the switch ladder) */
    var pm = pre && pre.hMin ? (typeof pre.hMin === 'object' ? pre.hMin[cls.name] || 0 : pre.hMin) : 0;
    var hMin = Math.max(ks.hMin || 3, 3, pm), hMax = Math.max(hMin, Math.min(ks.hMax || 30, 40));
    var fb = Math.max(hMin, Math.min(hMax, pre ? pre.h : hMin)), want = fit === 'all' || fit === 'items' ? null : +fit;
    var card = null, top = null, lo = hMin, hi = hMax, phase = 'top';
    var at = function (h) {
      if (!card) { var host = hostEl(); if (!host) throw new Error('no host'); card = ghostCard(id); host.appendChild(card); }
      job.renders++; return renderAt(card, w, h);
    };
    /* judged against the tallest size: n items (or every item there is), every window of a one-account plate, or
       everything the tallest shows; never a clipped card where the tallest is whole */
    var ok = function (r) {
      if (r.clipped && !top.clipped) return false;
      if (fit === 'all') {
        if (top.items > 0) return r.items >= top.items && r.hidden <= top.hidden;
        if (top.whole > 0 && r.whole < top.whole) return false;
        return top.folded ? r.hidden <= top.hidden : !r.folded;
      }
      /* fit 'items': every item of the kind (every family of a context ring), its other facts may fold to the count */
      if (fit === 'items' && top.items > 0) return r.items >= top.items;
      if (top.items > 0) return r.items >= Math.min(want, top.items);
      if (top.whole > 0) return r.whole >= top.whole;
      return top.folded ? r.hidden <= top.hidden : !r.folded;
    };
    var finish = function (h) {
      job.done = true; job.h = h; delete jobs[key];
      if (h != null) { fitCache[key] = h; delete fitStale[key]; }
      dropGhost(card); card = null;
      if (PMU.cards._fitLog) PMU.cards._fitLog.push({ id: id, w: w, fit: fit, h: h, renders: job.renders, ms: Math.round(performance.now() - job.t0) });
    };
    /* the tallest size first (how many items there are, whether everything can show), then the fallback height (usually
       within a row or two of the answer), then a bisection on the side it points to */
    job.step = function () {
      if (job.done) return true;
      try {
        if (phase === 'top') { top = at(hMax); phase = 'fb'; }
        else if (phase === 'fb') { if (ok(at(fb))) { lo = hMin; hi = fb; } else { lo = fb + 1; hi = hMax; } phase = 'bisect'; }
        else if (lo < hi) { var mid = (lo + hi) >> 1; if (ok(at(mid))) hi = mid; else lo = mid + 1; }
        if (phase === 'bisect' && lo >= hi) finish(lo);
      } catch (error) { console.error('[pm-usage] preset fit ' + id, error); finish(null); }
      return job.done;
    };
    job.cancel = function () { if (!job.done) { job.done = true; delete jobs[key]; dropGhost(card); card = null; } };
    return job;
  }
  function measureFit(id, w, fit) { var j = fitJob(id, w, fit); var guard = 0; while (!j.done && guard++ < 50) j.step(); return j.h; }
  /* a fit preset's height now (measured, or measured here) */
  function presetH(id, p) {
    if (p.fit == null || p.measured) return p.h;   /* a stale height counts: the idle measure corrects it */
    var m = measureFit(id, p.w, p.fit);
    if (m != null) { p.h = m; p.measured = true; }
    return p.h;
  }

  /* ---- the size picker (the size tool, and the card menu's "Size" row drilling in): the Chat Assistant menu with a
     preview stage. The stage shows a faithful miniature: the real card rendered by its own kind at the preset's pixel
     size, in the current look, scaled into the stage over the board's track grid at the same scale; hover or the arrow
     keys move it (the frame springs to the new proportions, the new content cross-fades in). ---- */
  var pv = null;   /* the open picker's stage: {id, h, el, view, item, card, outline, key, measuring} */
  function easeOf(kind) {
    var f = PMU.motion && PMU.motion.family ? PMU.motion.family() : 'basic';
    if (f === 'nier') return kind === 'fade' ? 'steps(3, jump-start)' : 'steps(5, jump-start)';
    if (f === 'retro') return kind === 'fade' ? 'steps(2, jump-start)' : 'steps(4, jump-start)';
    return kind === 'fade' ? 'cubic-bezier(.22,.8,.28,1)' : f === 'friendly' ? 'cubic-bezier(.34,1.56,.64,1)' : 'cubic-bezier(.22,1.55,.36,1)';
  }
  function reducedNow() { return PMU.motion && PMU.motion.reduced ? PMU.motion.reduced() : false; }
  function speedNow() { return PMU.motion && PMU.motion.speed ? PMU.motion.speed() : 1; }
  /* the footprint glyph of a size row: the board's width as a frame, the card's share of it, its height to one scale */
  function footprint(w, h, tracks, hRef) {
    var W = 26, H = 18, cw = Math.max(3, Math.round(W * w / tracks * 10) / 10), ch = Math.max(3, Math.round(H * Math.min(1, h / hRef) * 10) / 10);
    return '<svg class="pmu-szfp" viewBox="0 0 28 20" aria-hidden="true"><rect x="1" y="1" width="' + W + '" height="' + H + '" rx="2" fill="none" stroke="currentColor" stroke-opacity=".32" stroke-dasharray="1.6 1.4"/>' +
      '<rect x="1" y="1" width="' + cw + '" height="' + ch + '" rx="1.6" fill="currentColor" fill-opacity=".9"/></svg>';
  }
  function sizeRows(id, list) {
    var me = PMU.board.rect(id), cls = clsNow(), hRef = Math.max(12, Math.max.apply(null, list.map(function (p) { return p.h; }).concat([1])));
    return list.map(function (p) {
      var key = 'szfp:' + p.w + 'x' + p.h + ':' + cls.tracks + ':' + hRef;
      if (!SVG[key]) SVG[key] = footprint(p.w, p.h, cls.tracks, hRef);
      return { value: 'size:' + p.id, label: p.name, sub: p.desc, right: p.w + ' x ' + p.h, icon: key, preset: p,
        active: !!me && me.w === p.w && me.h === p.h && p.measured, keywords: p.id };
    });
  }
  function applySize(id, v) {
    var m = /^size:(.+)$/.exec(v); if (!m) return false;
    var raw = /^(\d+)x(\d+)$/.exec(m[1]);
    if (raw) { PMU.board.resize(id, { w: +raw[1], h: +raw[2] }, 'size_menu'); return true; }
    /* a row the idle measure has since folded into a larger preset of the same size (a click that lands while the rows
       update) still picks: the preset itself, at its size */
    var p = presetsOf(id).filter(function (x) { return x.id === m[1]; })[0] || presetsOf.all(id).filter(function (x) { return x.id === m[1]; })[0];
    if (!p) return false;
    var h = presetH(id, p), cls = clsNow().name;
    (picked[id] = picked[id] || {})[cls] = { w: p.w, px: pxOf(p.w), h: h, pid: p.id };
    PMU.board.resize(id, { w: p.w, h: h }, 'size_menu');
    return true;
  }
  function currentLabel(id) {
    var me = PMU.board.rect(id), ks = PMU.widgets.spec(id) || {}; if (!me) return '';
    var nm = sizeName(ks, me.w, me.h, id);
    return (nm ? nm + ' · ' : '') + me.w + ' x ' + me.h;
  }
  function stageMarkup() {
    return '<div class="pmu-szview"><i class="pmu-szgrid" aria-hidden="true"></i><i class="pmu-szoutline" aria-hidden="true"></i></div>' +
      '<div class="pmu-szcap" aria-live="polite"><b class="pmu-szname"></b><span class="pmu-szdim"></span><span class="pmu-szwhat"></span></div>';
  }
  function dropStage() {
    if (!pv) return;
    clearTimeout(pv.t0); if (pv.raf) cancelAnimationFrame(pv.raf); if (pv.idle && window.cancelIdleCallback) { try { cancelIdleCallback(pv.idle); } catch (error) {} }
    [pv.item, pv.oldItem].forEach(function (it) { if (it) { dropGhost(it.firstChild); it.remove(); } });
    if (pv.el) pv.el.remove();
    pv = null;
  }
  function presetOfRow(h, row) {
    if (!row || !h || !h.flat) return null;
    var r = h.flat[+row.getAttribute('data-mi')];
    return r && r.preset ? r.preset : null;
  }
  /* what the miniature actually shows, read from the rendered card */
  function shownText(kind, r, p) {
    var word = ITEM_WORD[kind];
    if (!r.folded) return word && r.items ? 'Every ' + word[0] + ' shows: ' + r.items + ' ' + (r.items === 1 ? word[0] : word[1]) : 'Everything shows';
    var more = (r.hidden ? r.hidden + ' more' : 'The rest') + ' in its hover tag and Details';
    return word && r.items ? r.items + ' ' + (r.items === 1 ? word[0] : word[1]) + ' · ' + more : more;
  }
  function previewTo(p) {
    if (!pv || !p || !pv.view || !pv.view.isConnected) return;
    var id = pv.id, cls = clsNow(), h = presetH(id, p), key = p.id + ':' + p.w + 'x' + h;
    pv.p = p;
    if (pv.key === key) return;
    var view = pv.view, vw = view.clientWidth || 320, vh = view.clientHeight || 160;
    var pxW = Math.round(p.w * cls.pitchX - GAP_PX), pxH = h * ROW_PX - GAP_PX;
    /* the whole card where it fits at a legible scale; a tall card keeps at least 0.42 (its top part, the rest fading
       under the stage's edge: the caption and the footprint glyph give its whole size) */
    var kFit = Math.min(1, (vw - 20) / pxW, (vh - 20) / pxH), k = Math.min(1, (vw - 20) / pxW, Math.max(kFit, 0.42));
    var crop = pxH * k > vh - 20 + 0.5;
    var left = Math.round((vw - pxW * k) / 2), top = crop ? 10 : Math.round((vh - pxH * k) / 2);
    view.classList.toggle('is-crop', crop);
    /* rendered unscaled (the fit pass and the tier read real boxes), then scaled into the stage */
    var item = document.createElement('div'); item.className = 'pmu-szitem';
    item.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + pxW + 'px;height:' + pxH + 'px;opacity:0';
    var card = ghostCard(id); item.appendChild(card); view.appendChild(item);
    var shown = { items: 0, hidden: 0, folded: false };
    try { shown = renderAt(card, p.w, h); } catch (error) { console.error('[pm-usage] size preview ' + id, error); }
    item.style.transform = 'scale(' + k.toFixed(4) + ')'; item.style.opacity = '';
    /* the board's track grid behind it, at the miniature's scale, aligned to the card's left and top edges */
    view.style.setProperty('--sz-px', (cls.pitchX * k).toFixed(3) + 'px');
    view.style.setProperty('--sz-py', (ROW_PX * k).toFixed(3) + 'px');
    view.style.setProperty('--sz-ox', (left - GAP_PX * k / 2).toFixed(2) + 'px');
    view.style.setProperty('--sz-oy', (top - GAP_PX * k / 2).toFixed(2) + 'px');
    var def = PMU.widgets.get(id) || {};
    var cap = pv.el.querySelector('.pmu-szcap');
    if (cap) {
      cap.querySelector('.pmu-szname').textContent = p.name;
      cap.querySelector('.pmu-szdim').textContent = p.w + ' x ' + h + ' · ' + pxW + ' x ' + pxH + ' px';
      cap.querySelector('.pmu-szwhat').textContent = shownText(def.kind, shown, p);
    }
    var outline = pv.el.querySelector('.pmu-szoutline'), box = { x: left, y: top, w: pxW * k, h: pxH * k };
    var old = pv.item, oldBox = pv.box;
    pv.oldItem && pv.oldItem !== old && (dropGhost(pv.oldItem.firstChild), pv.oldItem.remove());
    pv.item = item; pv.card = card; pv.key = key; pv.box = box; pv.oldItem = old || null;
    var place = function (el, b) { el.style.transform = 'translate(' + b.x.toFixed(2) + 'px,' + b.y.toFixed(2) + 'px)'; el.style.width = b.w.toFixed(2) + 'px'; el.style.height = b.h.toFixed(2) + 'px'; };
    if (outline) place(outline, box);
    if (!old || !oldBox || reducedNow() || typeof item.animate !== 'function') {
      if (old) { dropGhost(old.firstChild); old.remove(); pv.oldItem = null; }
      return;
    }
    /* the frame springs from the old proportions to the new (transform only), the new miniature cross-fades in over it, the
       old one fades out and leaves; NieR and Retro step */
    var sp = speedNow(), dur = 300 * sp, fade = 160 * sp;
    var sx = oldBox.w / box.w, sy = oldBox.h / box.h, dx = oldBox.x - box.x, dy = oldBox.y - box.y;
    if (outline) outline.animate([{ transform: 'translate(' + oldBox.x.toFixed(2) + 'px,' + oldBox.y.toFixed(2) + 'px) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' },
      { transform: 'translate(' + box.x.toFixed(2) + 'px,' + box.y.toFixed(2) + 'px) scale(1,1)' }], { duration: dur, easing: easeOf('spring') });
    item.animate([{ opacity: 0, transform: 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + (k * Math.min(sx, sy)).toFixed(4) + ')' }, { opacity: 1, transform: 'scale(' + k.toFixed(4) + ')' }],
      { duration: dur, easing: easeOf('spring') }).finished.then(function () {}, function () {});
    item.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fade, delay: 40 * sp, easing: easeOf('fade'), fill: 'backwards' });
    var gone = old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fade, easing: easeOf('fade'), fill: 'forwards' });
    gone.finished.then(function () { if (pv && pv.oldItem === old) pv.oldItem = null; dropGhost(old.firstChild); old.remove(); }, function () { dropGhost(old.firstChild); old.remove(); });
  }
  /* measure the picker's fit presets while the page is idle, one render a slice, then show their heights and the check */
  function measureLater(h, id) {
    if (!pv) return;
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(function () { fn({ timeRemaining: function () { return 12; } }); }, 30); };
    var job = null;
    var step = function (deadline) {
      if (!pv || pv.id !== id || pv.h !== h || !h.open) { if (job) job.cancel(); return; }
      var t0 = performance.now();
      do {
        if (!job || job.done) {
          var next = presetsOf(id).filter(function (p) { return p.fit != null && (!p.measured || p.stale); })[0];
          if (!next) { if (h.spec && h.spec.id === 'size:' + id) settleRows(h, id); return; }
          job = fitJob(id, next.w, next.fit);
        }
        job.step();
      } while (performance.now() - t0 < 8 && deadline && deadline.timeRemaining && deadline.timeRemaining() > 20);
      pv.idle = idle(step, { timeout: 500 });
    };
    pv.idle = idle(step, { timeout: 500 });
  }
  /* the measured rows: the same presets update in place (their size, footprint and check), so a row never re-renders under
     the pointer; only a changed set of rows (a preset that came to the size of a larger one) rebuilds the list */
  function settleRows(h, id) {
    var next = sizeMenuSpec(id, h.spec._nested), rows = next.sections[1].rows;
    var els = Array.prototype.slice.call(h.el.querySelectorAll('.pmu-mitem'));
    var olds = els.map(function (el) { return h.flat[+el.getAttribute('data-mi')]; });
    var same = !h.query && olds.length === rows.length && olds.every(function (r, i) { return r && r.preset && r.value === rows[i].value; });
    if (!same) { h.update(next); return; }
    h.spec = next;
    els.forEach(function (el, i) {
      var r = rows[i], mi = +el.getAttribute('data-mi'), was = h.flat[mi];
      h.flat[mi] = r;
      if (was.right !== r.right) { var rt = el.querySelector('.pmu-mright'); if (rt) rt.textContent = r.right; }
      if (was.icon !== r.icon) { var ic = el.querySelector('.pmu-micon'); if (ic) ic.innerHTML = SVG[r.icon] || ''; }
      if (!!was.active !== !!r.active) {
        el.classList.toggle('active', !!r.active); el.setAttribute('aria-checked', r.active ? 'true' : 'false');
        var ck = el.querySelector('.pmu-mcheck');
        if (r.active && !ck) el.insertAdjacentHTML('beforeend', '<span class="pmu-mcheck" aria-hidden="true">' + (SVG.check || '') + '</span>');
        else if (!r.active && ck) ck.remove();
      }
    });
    var cur = h.el.querySelector('.pmu-mcur'); if (cur && next.current) cur.textContent = 'Current · ' + next.current;
    /* the miniature on show follows its row's measured height */
    if (pv && pv.h === h && pv.p) { var now = rows.filter(function (r) { return r.preset.id === pv.p.id; })[0]; if (now) previewTo(now.preset); }
  }
  function mountStage(id, h) {
    var slot = h.el.querySelector('.pmu-szslot'); if (!slot) return;
    if (!pv || pv.id !== id || pv.h !== h) {
      dropStage();
      var el = document.createElement('div'); el.className = 'pmu-szstage'; el.innerHTML = stageMarkup();
      pv = { id: id, h: h, el: el, view: el.querySelector('.pmu-szview'), key: null };
      /* the first miniature waits for the menu's sprout (a render inside it would cost the open its frames) */
      pv.t0 = setTimeout(function () {
        if (!pv || pv.h !== h || !h.open) return;
        var rows = Array.prototype.slice.call(h.el.querySelectorAll('.pmu-mitem')), act = rows.filter(function (r) { return r.classList.contains('active'); })[0];
        var focus = rows.indexOf(document.activeElement) >= 0 ? document.activeElement : null;
        previewTo(presetOfRow(h, focus) || presetOfRow(h, act) || presetOfRow(h, rows[0]));
        measureLater(h, id);
      }, reducedNow() ? 0 : 340 * speedNow());
    }
    slot.appendChild(pv.el);
    /* the stage gives way where the menu would not fit beside its anchor (a card near the window's top or bottom edge):
       the view shrinks to 96 px at least, so every size row shows without the menu scrolling (the menu's own room:
       45-menu.js place, 6 px gap and 8 px edge) */
    fitStage(h);
    if (!h.el._pmuSzWired) {
      h.el._pmuSzWired = true;
      /* one miniature a frame, the last row asked for (a fast sweep down the rows renders where it stops) */
      var onRow = function (event) {
        if (!pv || pv.h !== h || !h.spec || h.spec.id !== 'size:' + pv.id) return;
        var row = event.target.closest && event.target.closest('.pmu-mitem'), p = presetOfRow(h, row);
        if (!p || pv.key === null) return;
        pv.want = p;
        if (!pv.raf) pv.raf = requestAnimationFrame(function () { if (!pv) return; pv.raf = 0; previewTo(pv.want); });
      };
      h.el.addEventListener('pointerover', onRow);
      h.el.addEventListener('focusin', onRow);
    }
  }
  /* the menu's height with nothing cut: its box is capped (place's max-height once it has opened, a spring's fixed height
     while it springs), so the list's hidden overflow is added back. The room is the side place gave it once it has
     opened (a drill-in from the card menu keeps the card menu's side), else the larger side, as place will choose */
  var STAGE_PX = 160, STAGE_MIN = 96;
  function fitStage(h) {
    var appEl = document.getElementById('pmuApp'), a = h.anchor && h.anchor.isConnected ? h.anchor.getBoundingClientRect() : h.lastAnchor;
    if (!appEl || !a || !pv || !pv.view) return;
    var hostR = appEl.getBoundingClientRect(), capped = parseFloat(h.el.style.maxHeight);
    var room = capped > 0 ? capped : Math.max(hostR.bottom - a.bottom, a.top - hostR.top) - 6 - 8;
    var was = pv.view.offsetHeight, hold = h.el.style.height;
    pv.view.style.height = '';
    h.el.style.height = '';
    var list = h.el.querySelector('.pmu-mlist');
    var natural = h.el.offsetHeight + (list ? Math.max(0, list.scrollHeight - list.clientHeight) : 0);
    h.el.style.height = hold;
    var over = Math.ceil(natural - room);
    if (over > 0) pv.view.style.height = Math.max(STAGE_MIN, STAGE_PX - over) + 'px';
    /* a stage that changed height re-places the miniature on show */
    if (pv.key && pv.p && pv.view.offsetHeight !== was) { var p = pv.p; pv.key = null; previewTo(p); }
  }
  /* a fresh measure for each opening of the picker: the data, the range or the look may have changed since the last one */
  function freshFits(id) { Object.keys(fitCache).forEach(function (k) { if (k.indexOf(id + '|') === 0) { fitStale[k] = fitCache[k]; delete fitCache[k]; } }); }
  function sizeMenuSpec(id, nested) {
    var list = presetsOf(id);
    return { id: 'size:' + id, _nested: !!nested, title: t('cardmenu.size'), current: currentLabel(id), align: 'end', width: 360, className: 'pmu-szmenu',
      sections: [{ rows: [{ html: '<div class="pmu-szslot"></div>' }] }, { rows: sizeRows(id, list) }],
      foot: 'Drag any edge or corner for any size in between.',
      body: function (c, h) { mountStage(id, h); },
      onPick: function (v) { applySize(id, v); return true; },
      onClose: function () { dropStage(); } };
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
    var title = text(def.title, ctxBase(id, st.room)), nm = me ? sizeName(ks, me.w, me.h, id) : null;
    var cur = me ? (nm ? t('cardmenu.current_size', { name: nm, w: me.w, h: me.h }) : t('cardmenu.custom_size', { w: me.w, h: me.h })) : '';
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
    /* the sizes are one row that drills into the size picker and its previews (lane c-presets) */
    var sizeRow = { value: 'sizes', label: t('cardmenu.size'), sub: (cur ? cur + ' · ' : '') + 'preview each preset', icon: 'size', submenu: function () { freshFits(id); return sizeMenuSpec(id, true); } };
    return { id: 'card:' + id, title: title, current: cur, align: 'end', width: 360,
      sections: [{ rows: [sizeRow] }, { label: 'Panel', rows: panelRows }],
      onPick: function (v) { return cardAction(id, v); }, onClose: function () { dropStage(); } };
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
        var titleEl = card.querySelector('.pmu-cardtitle'), title0 = titleEl ? titleEl.textContent : '';
        syncHead(card, ctx);
        /* the head's title just changed (the short title of a narrow tile): the tier was measured under the old head (a
           wrapped title took the tile's second line, so a 4 x 4 tile rendered its h0 strip with a free line under it);
           measure again and render for the head as it is now (lane c-presets) */
        if (titleEl && titleEl.textContent !== title0 && PMU.board && PMU.board.measure) {
          var t2 = PMU.board.measure(card);
          if (t2.w !== tier.w || t2.h !== tier.h || t2.bw !== tier.bw || t2.bh !== tier.bh) {
            tier = t2;
            if (card.getAttribute('data-tw') !== tier.w) card.setAttribute('data-tw', tier.w);
            if (card.getAttribute('data-th') !== tier.h) card.setAttribute('data-th', tier.h);
            ctx = ctxFor(card, tier, entering);
          }
        }
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
      /* an empty board's note rises 12 px, 320 OUT (WOW-SPEC 3.16) */
      if (PMU.motion) PMU.motion.animate(el, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { dur: 320, delay: 80, easing: 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
      return el;
    },
    menu: function (id, anchor) { return PMU.menu.toggle(anchor, cardMenuSpec(id)); },
    sizeMenu: function (id, anchor) { if (!(pv && pv.id === id)) freshFits(id); return PMU.menu.toggle(anchor, sizeMenuSpec(id)); },
    gear: function (id, anchor) { return PMU.menu.toggle(anchor, gearSpec(id)); },
    sizeName: sizeName,
    /* the presets of a panel at the board's class now ([{id, name, desc, w, h, fit, measured}]), a fit preset's measured
       height, and applying one (the keyboard's Shift steps, the API, the probes) */
    presets: presetsOf, presetH: function (id, p) { return presetH(id, p); }, measureFit: measureFit,
    applyPreset: function (id, pid) { return applySize(id, 'size:' + pid); }, _fitLog: null,
    /* the layout record's presets ({class: {id, w, h, px}}): the preset a panel was set to at each class while its geometry
       there is still that size (40-board writes and reads it) */
    presetsSet: function (id, geo) {
      var out = null, mine = picked[id] || {};
      Object.keys(mine).forEach(function (cls) {
        var pk = mine[cls], g = geo && geo[cls];
        if (pk && g && g.w === pk.w && g.h === pk.h) (out = out || {})[cls] = { id: pk.pid, w: pk.w, h: pk.h, px: pk.px };
      });
      return out;
    },
    seedPresets: function (id, set, geo) {
      Object.keys(set || {}).forEach(function (cls) {
        var e = set[cls], g = geo && geo[cls];
        if (!e || typeof e.id !== 'string' || !g || g.w !== e.w || g.h !== e.h) return;
        (picked[id] = picked[id] || {})[cls] = { w: e.w, h: e.h, px: +e.px || 0, pid: e.id };
      });
    }
  };

  /* tool clicks (delegated on the board) */
  /* delegated on the scroll pane: the board element is swapped on a room change (the old one leaves as the ghost) */
  var boardEl = document.getElementById('pmuScroll') || document.getElementById('pmuBoard');
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
