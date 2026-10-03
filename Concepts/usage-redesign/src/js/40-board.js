/* The board engine (owner: engine; ARCHITECTURE.md section 4.8, DESIGN-SPEC sections 2, 5 and 6, DESIGN-SPEC-ATLAS 0.1).
   Explicit placement on 12 / 20 / 24 / 30 tracks chosen from the measured board width (24 px hysteresis); the
   only-obstructed-peers resolver; MOVE with a live preview (lift, 1:1 follow, landing placeholder in the exact target
   slot, obstructed peers sliding live and gliding back, zero-overshoot settle, Escape glides back); RESIZE with a live
   preview from every edge and corner (snapped outline with its size name and W x H, peers reflowing live, the morph on
   release); keyboard move and resize; edge auto-scroll; one cmd.widget.move / cmd.widget.resize per changed release;
   the layout store (widget_layout:v1:usage records, v12 migrated once, default_set_version); the held build, the room
   transition and the reading-order entrance; the tier pass. */
(function () {
  var CLASSES = [{ name: 'S', tracks: 12, min: 0 }, { name: 'M', tracks: 20, min: 820 }, { name: 'L', tracks: 24, min: 1100 }, { name: 'XL', tracks: 30, min: 1460 }];
  var GAP = 8, ROW = 30, HYST = 24, MOVE_THRESHOLD = 4, TARGET_HYST = 0.75, SCROLL_BAND = 48;
  var STORE_KEY = 'widget_layout:v1:usage';
  /* the default set follows the generated boards (tools/boards.py writes PMU_BOARDS.version): a saved layout from an
     older set keeps its view and visibility and resets its geometry once (62-boards-data.js loads after this file, so it is
     read when the store is, never at load) */
  function defaultSet() { return 'pmu-b2:' + ((typeof PMU_BOARDS !== 'undefined' && PMU_BOARDS && PMU_BOARDS.version) || '2026-10-02c'); }
  var LEVEL_RANK = { glance: 0, detailed: 1, diagnostics: 2 };
  var st = PMU.core.state;
  var scroll = document.getElementById('pmuScroll');
  var boardEl = document.getElementById('pmuBoard');
  var stage = document.getElementById('pmuStage');
  var live = document.getElementById('pmuLive');
  var current = { cls: null, room: null, mounted: false, pending: false };
  var listeners = {};
  var gesture = null;
  var configs = {};       /* widget id -> {range?, scope?, <option id>: value} (the records' configuration_refs) */
  var parkedFrom = {};    /* room/class/widget -> the rect a hidden panel had before it was parked under the board */
  var revisions = {};     /* widget id -> committed_revision */
  var landing = null, outline = null;

  function emit(evt, detail) { (listeners[evt] || []).slice().forEach(function (fn) { try { fn(detail); } catch (error) { console.error('[pm-usage] board ' + evt, error); } }); }
  function speed() { return PMU.motion.speed(); }
  function reduced() { return PMU.motion.reduced(); }
  function say(text) { if (live) { live.textContent = ''; live.textContent = text; } }
  var padCache = null;
  function padOf(fresh) {
    if (padCache && !fresh) return padCache;
    var cs = getComputedStyle(boardEl);
    padCache = { l: parseFloat(cs.paddingLeft) || 0, r: parseFloat(cs.paddingRight) || 0, t: parseFloat(cs.paddingTop) || 0 };
    return padCache;
  }
  function boardWidth() {
    if (!boardEl) return 0;
    var p = padOf(true);
    current.wSeen = view.w;
    return Math.max(0, boardEl.clientWidth - p.l - p.r);
  }
  function pickClass(W) {
    var prev = current.cls, pick = CLASSES[0];
    CLASSES.forEach(function (c) {
      var min = c.min;
      if (prev && c.min > 0 && CLASSES.map(function (x) { return x.name; }).indexOf(c.name) <= CLASSES.map(function (x) { return x.name; }).indexOf(prev.name)) min = c.min - HYST;
      if (W >= min) pick = c;
    });
    return { name: pick.name, tracks: pick.tracks, pitchX: (W + GAP) / pick.tracks, W: W };
  }
  function kindSpec(id) { var d = PMU.widgets.get(id); return (d && PMU_BOARDS.kinds[d.kind]) || { wMin: 3, wMax: null, hMin: 3, hMax: 16, presets: [] }; }

  /* ---- layout store (DESIGN-SPEC 6.6): one envelope, records per widget, geometry per board class edited ---- */
  function geoStr(r) { return r.x + ',' + r.y + ',' + r.w + ',' + r.h; }
  function parseGeo(s) { var p = String(s || '').split(',').map(Number); return p.length === 4 && p.every(function (n) { return isFinite(n) && n >= 0; }) ? { x: p[0], y: p[1], w: p[2], h: p[3] } : null; }
  function cfgRefs(cfg) { return Object.keys(cfg || {}).filter(function (k) { return cfg[k] != null && cfg[k] !== ''; }).map(function (k) { return k + '=' + cfg[k]; }); }
  function parseRefs(list) { var out = {}; (list || []).forEach(function (s) { var i = String(s).indexOf('='); if (i > 0) out[s.slice(0, i)] = s.slice(i + 1); }); return out; }
  function emptyView() { return { room: 'overview', detail: 'glance', range: '24h', scope: 'all', more: false }; }
  function newEnvelope(view, receipt) {
    return { schema_id: 'pm.usage.widget_layout.v1', layout_schema_version: 1, default_set_version: defaultSet(), host_id: 'usage', project_id: 'tastebook',
      view: view || emptyView(), records: [], migration_receipt: receipt || null };
  }
  function loadEnvelope() {
    var env = STORE.get(STORE_KEY, null), hidden = {}, layout = {};
    if (env && (typeof env !== 'object' || env.schema_id !== 'pm.usage.widget_layout.v1' || !env.view)) {
      /* a corrupt or unknown envelope is set aside and the defaults apply (no second migration) */
      STORE.set(STORE_KEY + ':quarantine', env);
      return { env: newEnvelope(null, { from: STORE_KEY + ':quarantine', at: new Date().toISOString(), carried: [], dropped: ['everything'] }), hidden: hidden, layout: layout, fresh: true };
    }
    if (!env) {
      /* migration, once: v12 (else v11) carries room, detail, range, scope, more and hidden; layout and order are dropped */
      var oldKey = STORE.get(WORKSPACE_KEY, null) ? WORKSPACE_KEY : STORE.get(PRIOR_WORKSPACE_KEY, null) ? PRIOR_WORKSPACE_KEY : null;
      var old = oldKey ? STORE.get(oldKey, null) : null, view = emptyView(), receipt = null;
      if (old && typeof old === 'object') {
        ['room', 'detail', 'range', 'scope', 'more'].forEach(function (k) { if (old[k] !== undefined) view[k] = old[k]; });
        Object.keys(old.hidden || {}).forEach(function (room) {
          Object.keys(old.hidden[room] || {}).forEach(function (id) { if (old.hidden[room][id]) { var to = (PMU_BOARDS.migrate || {})[id] || id; (hidden[room] = hidden[room] || {})[to] = true; } });
        });
        receipt = { from: oldKey, at: new Date().toISOString(), carried: ['room', 'detail', 'range', 'scope', 'more', 'hidden'], dropped: ['layout', 'order'] };
      }
      env = newEnvelope(view, receipt);
      return { env: env, hidden: hidden, layout: layout, fresh: true };
    }
    var keepGeometry = env.default_set_version === defaultSet();
    if (!keepGeometry) {
      env.migration_receipt = { from: 'default_set_version ' + env.default_set_version, at: new Date().toISOString(), carried: ['view', 'visible', 'configuration_refs'], dropped: ['geometry'] };
      env.default_set_version = defaultSet();
    }
    /* the skeleton's interim maps (hidden / layouts) read once */
    if (env.hidden && typeof env.hidden === 'object') Object.keys(env.hidden).forEach(function (room) { hidden[room] = Object.assign({}, env.hidden[room]); });
    if (keepGeometry && env.layouts && typeof env.layouts === 'object') Object.keys(env.layouts).forEach(function (room) { layout[room] = env.layouts[room]; });
    delete env.hidden; delete env.layouts;
    (env.records || []).forEach(function (rec) {
      if (!rec || !rec.room_id || !rec.widget_id) return;
      if (rec.visible === false) (hidden[rec.room_id] = hidden[rec.room_id] || {})[rec.widget_id] = true;
      if (rec.configuration_refs && rec.configuration_refs.length) configs[rec.widget_id] = parseRefs(rec.configuration_refs);
      if (rec.committed_revision) revisions[rec.widget_id] = rec.committed_revision;
      if (!keepGeometry) return;
      Object.keys(rec.geometry || {}).forEach(function (cls) {
        var g = parseGeo(rec.geometry[cls]); if (!g) return;
        layout[rec.room_id] = layout[rec.room_id] || {};
        (layout[rec.room_id][cls] = layout[rec.room_id][cls] || []).push({ id: rec.widget_id, x: g.x, y: g.y, w: g.w, h: g.h });
      });
    });
    return { env: env, hidden: hidden, layout: layout, fresh: false };
  }
  /* the envelope loads once, lazily (PMU_BOARDS, needed for the v12 id map, is defined by a later file); 90-api's boot
     calls PMU.board.init() before the first render, and every entry point below calls ensure() */
  var loaded = null, envelope = null;
  function ensure() {
    if (loaded) return;
    loaded = loadEnvelope(); envelope = loaded.env;
    if (ROOM[envelope.view.room]) st.room = envelope.view.room;
    if (DETAIL[envelope.view.detail]) st.detail = envelope.view.detail;
    if (['5h', '24h', '7d', '30d'].indexOf(envelope.view.range) >= 0) st.range = envelope.view.range;
    if (typeof envelope.view.scope === 'string') st.scope = envelope.view.scope;
    st.more = !!envelope.view.more;
    st.hidden = loaded.hidden;
    st.layout = loaded.layout;
    if (loaded.fresh || !loaded.env.records || (envelope.migration_receipt && !envelope.records.length)) persist();
  }
  var widgetRoom = null;
  function roomOfWidget(id) {
    if (!widgetRoom) { widgetRoom = {}; Object.keys(PMU_BOARDS.rooms).forEach(function (room) { Object.keys(PMU_BOARDS.rooms[room]).forEach(function (cls) { (PMU_BOARDS.rooms[room][cls] || []).forEach(function (e) { widgetRoom[e[0]] = room; }); }); }); }
    return widgetRoom[id] || (/^acct-/.test(id) ? 'accounts' : null);
  }
  function recordsNow() {
    var recs = [], rooms = {};
    Object.keys(st.layout).forEach(function (r) { rooms[r] = true; });
    Object.keys(st.hidden).forEach(function (r) { rooms[r] = true; });
    var byWidget = {};
    Object.keys(configs).forEach(function (id) { var room = roomOfWidget(id); if (room) rooms[room] = true; });
    Object.keys(rooms).forEach(function (room) {
      var geo = {}, order = {};
      Object.keys(st.layout[room] || {}).forEach(function (cls) {
        (st.layout[room][cls] || []).slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (r, i) {
          (geo[r.id] = geo[r.id] || {})[cls] = geoStr(r);
          if (order[r.id] == null) order[r.id] = i;
        });
      });
      var ids = {};
      Object.keys(geo).forEach(function (id) { ids[id] = true; });
      Object.keys(st.hidden[room] || {}).forEach(function (id) { ids[id] = true; });
      Object.keys(configs).forEach(function (id) { if (roomOfWidget(id) === room) ids[id] = true; });
      Object.keys(ids).forEach(function (id) {
        if (byWidget[room + '/' + id]) return;
        var g = geo[id] || {}, cls = current.cls ? current.cls.name : null, mine = cls && g[cls] ? parseGeo(g[cls]) : null;
        var card = current.room === room ? cardOf(id) : null;
        var rec = { room_id: room, widget_id: id, visible: !(st.hidden[room] || {})[id], order_index: order[id] != null ? order[id] : null, geometry: g,
          preset_id: mine ? (PMU.cards.sizeName(kindSpec(id), mine.w, mine.h) || 'custom') : null,
          semantic_tier_id: card ? (card.getAttribute('data-tw') || '') + '.' + (card.getAttribute('data-th') || '') : null,
          configuration_refs: cfgRefs(configs[id]), committed_revision: revisions[id] || 0 };
        byWidget[room + '/' + id] = rec; recs.push(rec);
      });
    });
    return recs;
  }
  var saveTimer = 0;
  function persist() {
    ensure();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      envelope.view = { room: st.room, detail: st.detail, range: st.range, scope: st.scope, more: !!st.more };
      envelope.records = recordsNow();
      STORE.set(STORE_KEY, envelope);
    }, 400);
  }

  /* ---- defaults, projection, resolver ---- */
  function rectsOf(list) { return list.map(function (e) { return { id: e[0], x: e[1], y: e[2], w: e[3], h: e[4] }; }); }
  function overlaps(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function firstFit(items, tracks) { return firstFitInto([], items, tracks); }
  /* first-fit `items` into a board that already holds `seed` (real rects, never re-packed); returns only the new rects */
  function firstFitInto(seed, items, tracks) {
    var placed = (seed || []).map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; }), fresh = [];
    items.forEach(function (it) {
      var w = Math.min(it.w, tracks), y = 0, x = null;
      while (x === null) {
        for (var cx = 0; cx + w <= tracks; cx++) {
          var cand = { x: cx, y: y, w: w, h: it.h };
          if (placed.every(function (p) { return !overlaps(cand, p); })) { x = cx; break; }
        }
        if (x === null) y++;
      }
      var rect = { id: it.id, x: x, y: y, w: w, h: it.h };
      placed.push(rect); fresh.push(rect);
    });
    return fresh;
  }
  function project(rects, tracks) {
    return firstFit(rects.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }), tracks);
  }
  function nearestEdited(room, cls) {
    var saved = st.layout[room] || {}, order = ['L', 'M', 'S', 'XL'];
    if (cls.name === 'XL') order = ['L', 'M', 'S'];
    else if (cls.name === 'L') order = ['XL', 'M', 'S'];
    else if (cls.name === 'M') order = ['L', 'S', 'XL'];
    else order = ['M', 'L', 'XL'];
    for (var i = 0; i < order.length; i++) if (saved[order[i]] && saved[order[i]].length) return saved[order[i]];
    return null;
  }
  function defaultsFor(room, cls) {
    var rooms = PMU_BOARDS.rooms[room] || {};
    if (rooms[cls.name]) return rectsOf(rooms[cls.name]);
    return project(rectsOf(rooms.L || rooms.M || rooms.S || []), cls.tracks);  /* XL projects from L (DESIGN-SPEC 6.7) */
  }
  /* DESIGN-SPEC 6.1: only obstructed peers move, straight down, from the gesture's snapshot */
  function resolve(snapshot, activeId, rect) {
    var placed = [{ id: activeId, x: rect.x, y: rect.y, w: rect.w, h: rect.h }];
    snapshot.filter(function (r) { return r.id !== activeId; }).sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (r) {
      var c = { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }, moved = true;
      while (moved) {
        moved = false;
        for (var i = 0; i < placed.length; i++) { var p = placed[i]; if (overlaps(c, p)) { c.y = p.y + p.h; moved = true; } }
      }
      placed.push(c);
    });
    return placed;
  }
  function levelOf(id) { var def = PMU.widgets.get(id); return (def && def.level) || 'glance'; }
  function clampRect(r, tracks) {
    var ks = kindSpec(r.id), w = Math.max(1, Math.min(r.w, tracks)), x = Math.max(0, Math.min(r.x, tracks - w));
    return { id: r.id, x: x, y: Math.max(0, r.y), w: w, h: Math.max(ks.hMin || 1, r.h) };
  }
  function layoutFor(room, clsOpt) {
    ensure();
    var cls = clsOpt || current.cls || pickClass(boardWidth());
    var saved = st.layout[room] && st.layout[room][cls.name], rects;
    var defaults = defaultsFor(room, cls);
    if (saved && saved.length) {
      rects = saved.map(function (r) { return clampRect(r, cls.tracks); });
      var have = {}; rects.forEach(function (r) { have[r.id] = true; });
      var missing = defaults.filter(function (r) { return !have[r.id]; });
      if (missing.length) rects = rects.concat(firstFitInto(rects, missing, cls.tracks));
    } else {
      var near = nearestEdited(room, cls);
      rects = near ? project(near.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; }), cls.tracks) : defaults;
      if (near) { var hv = {}; rects.forEach(function (r) { hv[r.id] = true; }); var miss = defaults.filter(function (r) { return !hv[r.id]; }); if (miss.length) rects = rects.concat(firstFitInto(rects, miss, cls.tracks)); }
    }
    if (room === 'accounts') rects = mergeRoster(rects, cls);
    return rects;
  }
  /* the Accounts room: one acct-<providerId> widget per Settings provider with accounts (ARCHITECTURE 4.8, A1 10.7:
     a provider that gains its first account is appended at Standard 4 x 7 single or Group 10 x 11) */
  function mergeRoster(rects, cls) {
    var roster = null;
    try { roster = PMU.roster && PMU.roster.read ? PMU.roster.read() : null; } catch (error) { roster = null; }
    if (!roster || !roster.providers || !roster.providers.length) return rects;
    var withAccounts = {}; roster.providers.forEach(function (p) { if (p.accounts && p.accounts.length) withAccounts['acct-' + p.id] = p; });
    var kept = rects.filter(function (r) { var b = PMU_BOARDS.widgets[r.id]; return !/^acct-/.test(r.id) || !b || b.kind !== 'provider' || withAccounts[r.id]; });
    var have = {}; kept.forEach(function (r) { have[r.id] = true; });
    var extra = Object.keys(withAccounts).filter(function (id) { return !have[id]; }).map(function (id) {
      var many = withAccounts[id].accounts.length > 1; return { id: id, w: Math.min(many ? 10 : 4, cls.tracks), h: many ? 11 : 7 };
    });
    if (!extra.length) return kept;
    return kept.concat(firstFitInto(kept, extra, cls.tracks));
  }
  function visibleIds(room) {
    var rank = LEVEL_RANK[st.detail] || 0, hidden = st.hidden[room] || {};
    return layoutFor(room).filter(function (r) { return (LEVEL_RANK[levelOf(r.id)] || 0) <= rank && !hidden[r.id]; }).map(function (r) { return r.id; });
  }
  function saveLayout(room, rects) {
    st.layout[room] = st.layout[room] || {};
    st.layout[room][current.cls.name] = rects.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
  }

  /* ---- cards: placement, head form, tiers ---- */
  /* cards leaving the board (a room change fading out in place, a hidden panel) are not the board's cards any more */
  /* a card of the old room is leaving: data-leaving, or (without a GPU) only the _pmuLeaving flag, since the attribute's
     z-index change repainted the whole old board in the click's frame (50 ms of raster, a 48 ms software draw, PERF-3) */
  function isLeaving(c) { return !!c._pmuLeaving || c.hasAttribute('data-leaving'); }
  function cardOf(id) {
    if (!boardEl) return null;
    var list = boardEl.querySelectorAll(':scope > .pmu-card[data-widget="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    for (var i = 0; i < list.length; i++) if (!isLeaving(list[i])) return list[i];
    return null;
  }
  function cardsNow() { return boardEl ? Array.prototype.filter.call(boardEl.querySelectorAll(':scope > .pmu-card'), function (c) { return !isLeaving(c); }) : []; }
  function gridPlace(el, r) {
    var col = (r.x + 1) + ' / span ' + r.w, row = (r.y + 1) + ' / span ' + r.h;
    if (el.style.gridColumn !== col) el.style.gridColumn = col;
    if (el.style.gridRow !== row) el.style.gridRow = row;
  }
  function place(card, r) {
    gridPlace(card, r);
    card.dataset.x = r.x; card.dataset.y = r.y; card.dataset.w = r.w; card.dataset.h = r.h;
    var def = PMU.widgets.get(card.getAttribute('data-widget')) || {};
    var form = PMU.cards.headForm(def, r.w, r.h, current.cls ? current.cls.pitchX : 48);
    if (card.getAttribute('data-head') !== form) card.setAttribute('data-head', form);
  }
  function rectOfCard(card) { return { id: card.getAttribute('data-widget'), x: +card.dataset.x, y: +card.dataset.y, w: +card.dataset.w, h: +card.dataset.h }; }
  function tierOf(bw, bh) {
    return { w: bw < 168 ? 'xs' : bw < 248 ? 's' : bw < 360 ? 'm' : bw < 520 ? 'l' : 'xl',
      h: bh < 60 ? 'h0' : bh < 120 ? 'h1' : bh < 200 ? 'h2' : bh < 300 ? 'h3' : 'h4', bw: bw, bh: bh };
  }
  /* tiers come from the body's INNER size (DESIGN-SPEC 2.3: card - head - body padding): clientWidth / clientHeight less
     the padding of the head form (plate 4 / 12, line and tile 0 / 10, 14 each side); tier.pw / ph keep the padded box */
  function innerTier(card, cw, ch) {
    var plate = card.getAttribute('data-head') === 'plate';
    var t = tierOf(Math.max(0, cw - 28), Math.max(0, ch - (plate ? 16 : 10)));
    t.pw = cw; t.ph = ch; t.inner = true;
    return t;
  }
  function measure(card) { var body = card.querySelector('.pmu-cardbody'); return body ? innerTier(card, body.clientWidth, body.clientHeight) : tierOf(0, 0); }
  /* one batched read of every body, then the writes and renders (DESIGN-SPEC 8.4) */
  function tierPass(cards, mode) {
    var reads = cards.map(function (card) { var body = card.querySelector('.pmu-cardbody'); return { card: card, body: body, bw: body ? body.clientWidth : 0, bh: body ? body.clientHeight : 0 }; });
    /* a body measured while its old content was set aside (data-pmu-stale, morphResize) gets it back before any write */
    reads.forEach(function (r) { if (r.body && r.body.hasAttribute('data-pmu-stale')) r.body.removeAttribute('data-pmu-stale'); });
    reads.forEach(function (r) {
      if (!r.body || mode === 'held' && r.card.hasAttribute('data-late')) return;
      var tier = innerTier(r.card, r.bw, r.bh);
      var changed = r.card.getAttribute('data-tw') !== tier.w || r.card.getAttribute('data-th') !== tier.h;
      if (changed) { r.card.setAttribute('data-tw', tier.w); r.card.setAttribute('data-th', tier.h); emit('tier', { id: r.card.getAttribute('data-widget'), tier: tier }); }
      var sized = r.body._pmuSize !== (r.card.dataset.w + 'x' + r.card.dataset.h + '@' + tier.bw + 'x' + tier.bh);
      if (mode === 'enter') PMU.cards.renderBody(r.card, tier, true);
      /* 'held': the re-measure just before a held board is released: a card whose tier changed since its slice renders
         again with its entrance (queued again by PMU.film.cue); the others keep their body */
      else if (mode === 'held') { if (changed) PMU.cards.renderBody(r.card, tier, true); else if (sized) PMU.cards.resizeBody(r.card, tier); }
      else if (changed || mode === true || !r.body._pmuKind && !r.body.firstChild) PMU.cards.renderBody(r.card, tier, false);
      else if (sized) PMU.cards.resizeBody(r.card, tier);
    });
  }
  /* ---- the scroll viewport without layout reads in a moment (PERF-3): the height from the ResizeObserver entry, the
     top from scroll events and the board's own scroll writes; a card is in view when its grid rows meet it ---- */
  var view = { top: 0, h: 0, w: 0, wAt: 0 };
  function viewNow(fresh) {
    if ((fresh || !view.h) && scroll) { view.top = scroll.scrollTop; view.h = scroll.clientHeight; }
    return view;
  }
  function inView(card) {
    if (!view.h || !card || !card.dataset) return true;
    var t = (padCache ? padCache.t : 0) + (+card.dataset.y || 0) * ROW, h = (+card.dataset.h || 0) * ROW;
    return t + h > view.top - 24 && t < view.top + view.h + 24;
  }
  if (scroll) scroll.addEventListener('scroll', function () { view.top = scroll.scrollTop; if (streaming && streaming.late) streaming.late(); if (lateHeld) lateHeld(true); }, { passive: true });
  function readingOrder(cards) { return cards.slice().sort(function (a, b) { return (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); }); }
  /* the diagonal wave of the film core (WOW-SPEC 3.1 Phase B): 45 ms per top row, 25 ms per column, cap 640 */
  function setEntranceDelays(cards) {
    if (PMU.film && PMU.film.wave) { PMU.film.wave(cards, {}); return; }
    readingOrder(cards).forEach(function (card, rank) { card._pmuEnterDelay = reduced() || PMU.motion.paused() ? 0 : Math.min(480, 32 * rank); });
  }
  /* the held build (WOW-SPEC 3.1 Phase A): bodies render in reading order in slices of at most 8 ms per frame while the
     board is held (data-held: nothing visible), so the click and every frame stay short; each body's inner entrance is
     queued by PMU.film.cue and released with the wave. A newer mount supersedes a running build. */
  var buildToken = 0, lateHeld = null;
  function buildSliced(cards, onBuilt) {
    /* reading order, the hero first (WOW-SPEC-3 5); without a GPU the bodies outside the viewport wait until the moment
       is over (data-late: never measured or entered by the release; PERF-3) */
    var token = ++buildToken, all = readingOrder(cards).sort(function (a, b) { return b.hasAttribute('data-hero') - a.hasAttribute('data-hero'); });
    var soft = softGpu();
    if (soft) viewNow(true);   /* the mount just read the board's width: the layout is clean */
    var queue = soft ? all.filter(inView) : all, later = soft ? all.filter(function (c) { return !inView(c); }) : [];
    later.forEach(function (c) { c.setAttribute('data-late', ''); });
    function slice() {
      if (token !== buildToken) return;
      var t0 = performance.now(), builtNow = [];
      fitSliced(function () {
        while (queue.length && performance.now() - t0 < 8) {
          var c = queue.shift();
          if (c.isConnected) { tierPass([c], 'enter'); builtNow.push(c); }
        }
      });
      /* revealed after the slice's fit pass, so a body never shows its unfitted first render */
      builtNow.forEach(function (c) { if (PMU.film && PMU.film.bodyBuilt) PMU.film.bodyBuilt(c); else c.removeAttribute('data-body-wait'); });
      if (queue.length) { requestAnimationFrame(slice); return; }
      if (onBuilt) { try { onBuilt(cards); } catch (error) { console.error('[pm-usage] board built', error); } }
      if (later.length) {
        var lateT = setTimeout(function () { lateHeld && lateHeld(false); }, 1700 * speed());   /* about when the hero's instruments end */
        lateHeld = function (now) {
          clearTimeout(lateT);
          if (token !== buildToken) { lateHeld = null; return; }
          var t1 = performance.now();
          while (later.length && (now || performance.now() - t1 < 8)) {
            var c2 = later.shift();
            if (!c2.isConnected) continue;
            c2.removeAttribute('data-late');
            tierPass([c2], false);
            c2.removeAttribute('data-body-wait');
          }
          if (later.length) lateNext(function () { lateHeld && lateHeld(false); }); else lateHeld = null;
        };
      }
    }
    requestAnimationFrame(slice);
  }

  /* ---- the room change (WOW-SPEC 3.2, WOW-TASKS E-1, coordinator decision 5: no main-thread task over ~50 ms on a
     room click). The click frame starts the light, the title and the exit and builds only the new chrome; the bodies are
     built in slices of at most 8 ms per frame in reading order, and each plate enters as soon as its body exists, at
     max(its wave delay, its build time), so the wave streams with the build. The old room fades out IN PLACE (its cards
     stay in the grid, inert, 160 ms), so nothing is re-parented and re-laid out on the click; a widget present in both
     rooms keeps its card and glides from its old rect to its new one (FLIP 320 SETTLE). ---- */
  var leaving = [], leaveFlushQueued = false, pendingOld = null;
  /* a build or refresh slice runs with the content fit pass deferred to the slice's end (one batched read for the cards of
     the slice, inside the slice; NOTES3-content E1, NOTES3-perf C1/Q6), never as a microtask after it */
  /* integ3: the off-screen bodies built after a moment (no-GPU profile) go one batch per IDLE period, not per frame: they
     are not motion and nothing waits for them (a scroll or a gesture builds them at once); a frame callback per card made
     the census read Usage frame work in the settled board (HARD USAGE-RAF on Cache at 1440) */
  function lateNext(fn) { if (window.requestIdleCallback) requestIdleCallback(function () { fn(); }, { timeout: 400 }); else setTimeout(fn, 16); }
  function fitSliced(fn) {
    var C = PMU.content;
    if (!C || typeof C.fitSlice !== 'function') return fn();
    var was = C.fitDefer; C.fitDefer = true;
    try { return fn(); } finally { C.fitDefer = was; try { C.fitSlice(); } catch (error) { console.error('[pm-usage] fit slice', error); } }
  }
  /* the old room kept still through a no-GPU room click goes with the new chrome (one batch) */
  function dropOld() {
    var p = pendingOld; if (!p) return;
    pendingOld = null;
    p.cards.forEach(function (c) { destroyCard(c); });
    retireBoard(p.el);
  }
  /* two board elements live in the scroll pane for good: the shown one (#pmuBoard) and a hidden spare; a room change swaps
     their roles by attributes, the old one leaves (as the ghost with a GPU) and then empties into the spare */
  function spareBoard() {
    var sp = scroll && scroll.querySelector(':scope > .pmu-board[hidden]');
    if (!sp) { sp = document.createElement('div'); sp.className = 'pmu-board'; sp.hidden = true; scroll.appendChild(sp); }
    return sp;
  }
  function retireBoard(el) {
    if (!el || el === boardEl) return;
    el.textContent = '';
    el.hidden = true;
    el.className = 'pmu-board';
    el.removeAttribute('style');
    ['data-film', 'data-op', 'data-held', 'data-hold-bodies'].forEach(function (a) { el.removeAttribute(a); });
  }
  function filmE(name, dflt) { return (PMU.film && PMU.film.E && PMU.film.E[name]) || dflt; }
  function softGpu() { return document.documentElement.hasAttribute('data-pmu-soft'); }
  function flushLeaving(all) {
    leaving = leaving.filter(function (l) {
      if (!all && !l.done) return true;
      destroyCard(l.card); if (l.card.isConnected) l.card.remove();
      return false;
    });
  }
  function queueLeaveFlush() {
    if (leaveFlushQueued) return;
    leaveFlushQueued = true;
    requestAnimationFrame(function () { leaveFlushQueued = false; flushLeaving(false); });
  }
  function leaveCards(ids, dir, sTop, instant) {
    var want = {}; ids.forEach(function (id) { want[id] = true; });
    var reuse = {}, f = PMU.motion.family();
    var stepped = f === 'retro' || f === 'nier', blur = f === 'glass' && !softGpu();
    var ty = -28 * (dir || 1);
    cardsNow().forEach(function (c) {
      var id = c.getAttribute('data-widget');
      if (want[id] && !reuse[id] && !c.hasAttribute('data-pending')) {
        /* shared widget: it stays, and glides from where it is now to its new rect once placed */
        reuse[id] = c; c._pmuFromPx = px(rectOfCard(c)); c._pmuFromScroll = sTop;
        return;
      }
      /* no inert, no aria-hidden and no getAnimations() here: inert restyles the whole subtree, getAnimations() flushes the style
         once per card (84 ms of style recalc in one click on the VM); a card still entering leaves from its entrance:
         the exit animations are created later, so they win over it */
      c._pmuLeaving = true;
      if (c._pmuSlide) { c._pmuSlide.cancel(); c._pmuSlide = null; }
      if (!softGpu()) c.setAttribute('data-leaving', 'room');
      /* without a GPU (data-pmu-soft) the old room goes at once: fading it would first re-raster every old card into its
         own layer on the CPU (190 ms on the VM before the first frame of the change could be drawn); the new plates'
         entrance carries the change there */
      if (instant || c.hasAttribute('data-pending') || c.hasAttribute('data-body-wait') || reduced() || softGpu()) { leaving.push({ card: c, done: true }); return; }
      /* the scroll goes back to the top for the new room: the old cards keep their place on screen (translateY by the old
         scroll), then leave: opacity 1 -> 0 on (.33,0,.67,1), translateY(-28 px x dir) scale(.985) on IN, 160 ms */
      var t0 = 'translateY(' + (-sTop) + 'px)', t1 = 'translateY(' + (-sTop + ty) + 'px) scale(.985)';
      var fr = [{ transform: t0 }, { transform: t1 }];
      if (blur) { fr[0].filter = 'blur(0px)'; fr[1].filter = 'blur(6px)'; }
      PMU.motion.animate(c, fr, { dur: 160, easing: stepped ? 'steps(3,jump-start)' : filmE('in', 'cubic-bezier(.4,0,1,1)'), fill: 'forwards' });
      /* the old room stays opaque for the first 30 % and then fades on (.33,0,.67,1): it crosses 50 % at about 104 ms,
         after the first new plates (base 30, fade 280 OUT) have passed 50 % (film: no frame where both are below it) */
      var a = PMU.motion.animate(c, [{ opacity: 1, easing: stepped ? 'steps(3,jump-start)' : filmE('exit', 'cubic-bezier(.33,0,.67,1)') }, { opacity: 1, offset: 0.3, easing: stepped ? 'steps(3,jump-start)' : filmE('exit', 'cubic-bezier(.33,0,.67,1)') }, { opacity: 0 }], { dur: 160, easing: 'linear', fill: 'forwards' });
      var rec = { card: c, done: !a };
      leaving.push(rec);
      if (a) a.finished.then(function () { rec.done = true; queueLeaveFlush(); }, function () { rec.done = true; queueLeaveFlush(); });
    });
    /* without a GPU the old room stays (inert, static) until the first rAF swaps it for the new frames in one batch, so
       no frame shows an empty board (PERF-3) */
    if (!softGpu() && !leaving.some(function (l) { return !l.done; })) flushLeaving(true);
    return reuse;
  }
  /* the room's key light changes tint by a cross-fade (the old light, cloned, fades out over the new one, 420 OUT;
     opacity only). The light itself is PMU.film.key (15-film.js). */
  function keyShift(room) {
    var key = stage ? stage.querySelector(':scope > .pmu-film-key:not(.pmu-key-old)') : null;
    if (!key) { if (PMU.film && PMU.film.key) PMU.film.key({ room: room }); return; }
    if (key.getAttribute('data-room') === room) return;
    if (!reduced() && !(PMU.theme.look().nier) && !softGpu()) {
      var old = key.cloneNode(false);
      old.classList.add('pmu-key-old');
      key.parentNode.insertBefore(old, key.nextSibling);
      var a = PMU.motion.animate(old, [{ opacity: 1 }, { opacity: 0 }], { dur: 420, easing: filmE('out', 'cubic-bezier(.22,.8,.28,1)'), fill: 'forwards' });
      if (a) a.finished.then(function () { old.remove(); }, function () { old.remove(); }); else old.remove();
    }
    if (PMU.film && PMU.film.key) PMU.film.key({ room: room }); else key.setAttribute('data-room', room);
  }
  /* the hover tags wait for the moment to end (WOW-SPEC 3.2 budget): PMU.film.deferHoverTags holds the app's hover-tag
     controller in its page-settling state and scans the Usage panel once when the entrance is over */
  function deferHover(ms) { if (PMU.film && typeof PMU.film.deferHoverTags === 'function') PMU.film.deferHoverTags(ms); }
  /* the streamed build of a room change: chrome and body together, card by card in reading order, in slices of at most
     8 ms per frame; each plate enters as soon as it exists. plans: [{id, rect, card?}] (card = a shared widget's card) */
  var filmEndT = 0;
  function streamBuild(plans, o) {
    var token = ++buildToken, t0 = o.t0, sp = speed(), first = true, built = [], soft = softGpu();
    /* the wave on the whole new layout (grid rows and columns from the rects; no element needed yet) */
    var proxies = plans.map(function (pl) { return { plan: pl, dataset: { x: pl.rect.x, y: pl.rect.y } }; });
    var fresh = proxies.filter(function (q) { return !q.plan.card; });
    /* the structure wave of a room change (WOW-SPEC-3 6.2): 90 + 28 x rowRank + 16 x colRank, cap 200 */
    if (PMU.film && PMU.film.wave) PMU.film.wave(fresh, { row: PMU.motion.family() === 'retro' ? 60 : 28, col: 16, cap: 200 });
    else readingOrder(fresh).forEach(function (q, i) { q._pmuEnterDelay = Math.min(480, 32 * i); });
    proxies.forEach(function (q) { q.plan.at = q.plan.card ? 0 : (q._pmuEnterDelay || 0) + o.base; });
    /* build order: the hero first (it reveals at 200), then the bodies that hold flight targets, then reading order; the
       cards outside the viewport last (the board is at its top after a room change; their rects say where they are) */
    var heroes = [].concat(o.hero || []), firsts = [].concat(o.first || []);
    var rank = function (id) { return heroes.indexOf(id) >= 0 ? 2 : firsts.indexOf(id) >= 0 ? 1 : 0; };
    var order = proxies.map(function (q) { return q.plan; }).sort(function (a, b) { return (rank(b.id) - rank(a.id)) || (a.rect.y - b.rect.y) || (a.rect.x - b.rect.x); });
    var queue = order.filter(function (pl) { return pl.card || rectInView(pl.rect); });
    /* without a GPU the bodies outside the viewport are built after the moment (PERF-3: a heavy body is one 50-100 ms
       task on the VM; while the entrance runs only what can be seen is built); a scroll, a gesture or a re-class builds
       them at once (completeStream) */
    var later = order.filter(function (pl) { return queue.indexOf(pl) < 0; });
    if (!soft) { queue = queue.concat(later); later = []; }
    /* every new card's chrome in one batch in the first rAF after the click (PERF-3): inserting cards one slice at a time
       changed the board's child list every frame, and the app's positional rules (:nth-child with a descendant part) then
       restyled every card already on the board (500-1,000 elements, 20-57 ms per slice on the VM); inside the click task
       the clicked button's focus forced the chrome's layout (31 ms). Without a GPU the old room is swapped out in the
       same batch (it stays, inert, through the click's frame) and only the first screen's chrome is built. */
    var chromes = false;
    function buildChromes() {
      if (chromes || token !== buildToken) return;
      chromes = true;
      if (soft) { keyShift(o.room); boardEl.setAttribute('data-film', ''); }
      dropOld();
      var frag = document.createDocumentFragment();
      /* without a GPU only the chrome of what can be seen is built now; the rest comes with its body after the moment */
      /* the DOM keeps reading order (Tab order, reduced-motion parity); only the build order puts the hero first */
      var made = [], dom = (soft ? queue : order).slice().sort(function (a, b) { return (a.rect.y - b.rect.y) || (a.rect.x - b.rect.x); });
      dom.forEach(function (pl) { if (chrome(pl, frag)) made.push(pl); });
      boardEl.insertBefore(frag, landing && landing.parentNode === boardEl ? landing : null);
      /* frames first (VERIFY-3: the new room came up as empty skeletons after a gap; WOW-SPEC-3 6.2): the plates enter now
         in the wave, the board is never empty, and each body is revealed when it is built */
      var elapsed = (performance.now() - t0) / sp, cards = [];
      made.forEach(function (pl) { pl.el._pmuEnterDelay = Math.max(0, pl.at - elapsed); cards.push(pl.el); });
      if (cards.length) {
        /* the frames enter in the structure wave while the ghost leaves; without a GPU (no ghost: the old room goes in this
           frame) they start at 55 %, so no frame shows the board under half (6.2 "never empty": the dip stays under 60 ms) */
        if (PMU.film && PMU.film.frames) PMU.film.frames(cards, { dir: o.dir, base: 0, wave: false, scan: true, board: boardEl, from: soft ? 0.55 : 0 });
        else PMU.motion.enter(cards, { base: 0, dir: o.dir });
      }
    }
    function chrome(pl, frag) {
      if (pl.card || pl.el) return false;
      var c = PMU.cards.build(pl.id, o.room, pl.rect);
      if (heroes.indexOf(pl.id) >= 0) c.setAttribute('data-hero', '');
      c.setAttribute('data-body-wait', '');
      pl.el = c; frag.appendChild(c);
      return true;
    }
    /* a body built after its frame goes to the film's timeline (WOW-SPEC-3 6.2): the hero reveals 200 after the click with
       its instruments, the supporting bodies quietly from 480, 24 apart (PMU.film.bodyBuilt) */
    function revealBody(c) {
      if (PMU.film && PMU.film.bodyBuilt) { PMU.film.bodyBuilt(c); return; }
      c.removeAttribute('data-body-wait');
    }
    function slice(all) {
      if (token !== buildToken || !queue.length && finished) return;
      buildChromes();
      flushLeaving(!!all);
      try { performance.mark('pmu-room-slice'); } catch (error) {}
      /* the style and layout the frame owes already (the inner entrances of the plates built last frame) are flushed
         first, so the 8 ms budget measures this slice's own cards (on the CPU-only VM that flush is 10-25 ms and would
         otherwise leave room for one card per frame, stretching a 300 ms wave over a second) */
      void boardEl.offsetWidth;
      /* the flight's landing rects are read here, where the layout is clean (the flush above), once the bodies that hold the
         targets are built (they are built first, after the hero) */
      slices++;
      if (PMU.film && PMU.film.pairFlights && (slices > 1 || all)) { try { /* a room seen before pairs as soon as the bodies that held its targets are built; a first visit waits for every
           first-screen body (a key can sit in the hero AND in a plate: pairing early picked the hero's headroom ladder) */
        if (firsts.length > 0 ? !queue.some(function (pl) { return firsts.indexOf(pl.id) >= 0 || heroes.indexOf(pl.id) >= 0; }) : all || slices > 8) PMU.film.pairFlights(all || slices > 8 || firsts.length > 0); } catch (error) { console.error('[pm-usage] flight pair', error); } }
      var start = performance.now(), now = [], entering = [];
      fitSliced(function () {
        while (queue.length && (all || !now.length || performance.now() - start < 8)) {
          var pl = queue.shift(), c = pl.card || pl.el;
          if (c && !c.isConnected) continue;
          c._pmuPlan = pl.at;
          c._pmuEnterDelay = Math.max(0, pl.at - (performance.now() - t0) / sp);
          if (pl.card) tierPass([c], false); else { tierPass([c], 'enter'); entering.push(c); }
          now.push(c); built.push(c);
        }
      });
      entering.forEach(revealBody);
      if (queue.length) { requestAnimationFrame(function () { slice(false); }); return; }
      /* the last targets were built in this slice: pair in the next frame, once its layout is done */
      if (PMU.film && PMU.film.pairFlights) requestAnimationFrame(function () { if (token === buildToken) { void boardEl.offsetWidth; try { PMU.film.pairFlights(true); } catch (error) {} } });
      finish();
      if (all) buildLater(true);
    }
    var finished = false, lateT = 0, slices = 0;
    function finish() {
      if (finished) return;
      finished = true;
      var elapsed = (performance.now() - t0) / sp, last = 0;
      var live = built.filter(function (c) { return c.isConnected; });
      live.forEach(function (c) { c._pmuEnterDelay = Math.max(0, (c._pmuPlan || 0) - elapsed); last = Math.max(last, c._pmuEnterDelay); });
      var shared = {}; plans.forEach(function (pl) { if (pl.card) shared[pl.id] = true; });
      try { if (PMU.film && PMU.film.allBuilt) PMU.film.allBuilt(o.room, live.filter(function (c) { return !shared[c.getAttribute('data-widget')]; })); } catch (error) { console.error('[pm-usage] room beat', error); }
      if (!live.length && !later.length && !boardEl.querySelector(':scope > .pmu-board-empty')) boardEl.appendChild(PMU.cards.empty(o.room));
      /* the moment ends about 2 s after the click (the hero's instruments and the beat); the hover tags scan then */
      var endAt = Math.max(0, 2100 - elapsed);
      deferHover(endAt);
      clearTimeout(filmEndT);
      filmEndT = setTimeout(function () { filmEndT = 0; if (token === buildToken) boardEl.removeAttribute('data-film'); }, endAt * sp);
      try { performance.mark('pmu-room-built'); } catch (error) {}
      if (later.length) { lateT = setTimeout(function () { lateT = 0; buildLater(false); }, (last + 160 + 1100) * sp); return; }
      if (streaming && streaming.token === token) streaming = null;
      emit('built', { room: o.room, cards: live.length, ms: Math.round(performance.now() - t0) });
    }
    /* the bodies outside the viewport, after the moment: one card per frame (no entrance, they are not seen) */
    function buildLater(all) {
      clearTimeout(lateT); lateT = 0;
      if (token !== buildToken) return;
      if (later.some(function (pl) { return !pl.el; })) {
        var frag = document.createDocumentFragment();
        later.forEach(function (pl) { chrome(pl, frag); });
        boardEl.insertBefore(frag, landing && landing.parentNode === boardEl ? landing : null);
      }
      var start = performance.now();
      while (later.length && (all || performance.now() - start < 8)) {
        var pl = later.shift(), c = pl.el;
        if (!c || !c.isConnected) continue;
        c.removeAttribute('data-body-wait');
        tierPass([c], false);
        built.push(c);
      }
      if (later.length) { lateNext(function () { buildLater(false); }); return; }
      if (streaming && streaming.token === token) streaming = null;
      emit('built', { room: o.room, cards: built.filter(function (c) { return c.isConnected; }).length, ms: Math.round(performance.now() - t0) });
    }
    /* the click's own frame paints the exit, the title and the light (a rAF registered in the click task runs in that
       same frame, so the chrome waits for the next one); the frame after lays out the new room's chrome (one batch: inside
       the click task the button's focus forced its layout, 31 ms on the VM); the bodies follow from the frame after */
    streaming = { token: token, complete: function () { slice(true); if (!queue.length) buildLater(true); }, late: function () { if (finished && later.length) buildLater(true); } };
    requestAnimationFrame(function () { requestAnimationFrame(function () { buildChromes(); requestAnimationFrame(function () { slice(false); }); }); });
  }
  function rectInView(r) {
    if (!view.h) return true;
    var t = (padCache ? padCache.t : 0) + r.y * ROW, h = r.h * ROW;
    return t + h > view.top - 24 && t < view.top + view.h + 24;
  }
  /* a gesture, a layout change or a re-class while a room is still being built finishes the build at once, so every
     card of the room exists (at its planned rect) before anything moves */
  var streaming = null;
  function completeStream() {
    flushRefresh();
    dropOld();
    if (lateHeld && !(PMU.film && PMU.film.holding && PMU.film.holding())) lateHeld(true);
    var sm = streaming;
    if (sm && sm.token === buildToken) { try { sm.complete(); } catch (error) { console.error('[pm-usage] complete build', error); } }
    streaming = null;
  }
  function destroyCard(card) {
    var body = card.querySelector('.pmu-cardbody');
    if (body && body._pmuKind && body._pmuKind.destroy) { try { body._pmuKind.destroy(body, body._pmuCtx); } catch (error) {} }
  }
  var morphEl = null;
  function ensurePreviews() {
    /* the preview elements of a board stay with it: after a board swap the new board gets fresh ones (moving the morph,
       the first child of the old board, shifted every old card's child index, and the app's positional rules then
       restyled the old room's ~600 elements in the room click: VM trace, inv2.py) */
    var foreign = function (el) { return el && el.parentNode && el.parentNode !== boardEl && el.parentNode.classList && el.parentNode.classList.contains('pmu-board'); };
    if (foreign(morphEl)) morphEl = null;
    if (foreign(landing)) landing = null;
    if (foreign(outline)) outline = null;
    if (!morphEl) { morphEl = document.createElement('div'); morphEl.className = 'pmu-morph'; morphEl.hidden = true; morphEl.setAttribute('aria-hidden', 'true'); }
    if (morphEl.parentNode !== boardEl) boardEl.insertBefore(morphEl, boardEl.firstChild);
    if (!landing || !landing.isConnected) { landing = document.createElement('div'); landing.className = 'pmu-landing'; landing.hidden = true; landing.setAttribute('aria-hidden', 'true'); }
    if (!outline || !outline.isConnected) {
      outline = document.createElement('div'); outline.className = 'pmu-outline'; outline.hidden = true; outline.setAttribute('aria-hidden', 'true');
      outline.innerHTML = '<span class="pmu-outline-label"><b class="pmu-ol-name"></b><span class="pmu-ol-size"></span><span class="pmu-ol-note"></span></span>';
    }
    if (landing.parentNode !== boardEl) boardEl.appendChild(landing);
    if (outline.parentNode !== boardEl) boardEl.appendChild(outline);
  }
  /* the room's hero plate (WOW-SPEC 2.2, 6: Glass gives it a static specular sheet): the largest plate (w x h, at least
     8 tracks and 7 rows) that starts in the first 12 rows; no layout read */
  /* the room's hero (WOW-SPEC-3 7, E3-5): explicit per room and board class in PMU_BOARDS.heroes (tools/boards.py; one id
     or a group of ids that act as one hero: Free models, Prompt cache); every shown card of it is marked data-hero. The
     round-2 guess (the largest plate in the first 12 rows) stays only as the fallback for a room the table does not name. */
  function heroOf(rects, ids, room) {
    var shown = {}; ids.forEach(function (id) { shown[id] = true; });
    var table = typeof PMU_BOARDS !== 'undefined' && PMU_BOARDS && PMU_BOARDS.heroes ? PMU_BOARDS.heroes[room || current.room] : null;
    var pick = table ? table[current.cls ? current.cls.name : 'M'] || table.L || table.M || table.S : null;
    if (pick) { var list = [].concat(pick).filter(function (id) { return shown[id]; }); if (list.length) return list; }
    var best = null;
    rects.forEach(function (r) {
      if (!shown[r.id] || r.y > 12 || r.w < 8 || r.h < 7) return;
      var k = (PMU.widgets.get(r.id) || {}).kind; if (k === 'group' || k === 'kpi' || k === 'kpis') return;
      if (!best || r.w * r.h > best.w * best.h) best = r;
    });
    return best ? [best.id] : [];
  }
  function markHero(card, heroIds) { if ((heroIds || []).indexOf(card.getAttribute('data-widget')) >= 0) card.setAttribute('data-hero', ''); else card.removeAttribute('data-hero'); }
  /* the board class on the board and the shell: written only when it changes (--pmu-tracks is an inherited custom
     property: writing it, even with the same value, restyles every element of the board) */
  function setBoardClass() {
    var name = current.cls.name, tr = String(current.cls.tracks);
    if (boardEl.getAttribute('data-cls') !== name) boardEl.setAttribute('data-cls', name);
    if (boardEl.style.getPropertyValue('--pmu-tracks') !== tr) boardEl.style.setProperty('--pmu-tracks', tr);
    var app = document.getElementById('pmuApp'); if (app && app.getAttribute('data-cls') !== name) app.setAttribute('data-cls', name);
  }
  function mount(room, opts) {
    ensure();
    opts = opts || {};
    if (refreshQ) { refreshQ.cancelled = true; refreshQ = null; }   /* the new room renders with the current view anyway */
    if (!boardEl || !scroll) return;
    if (gesture) endGesture(gesture, 'cancel', true);
    if (PMU.menu) PMU.menu.close();
    /* a room change reads no layout (PERF-3 rule 12): the board width is the last one measured while the scroll's
       ResizeObserver has seen no change since; anything else measures */
    var W = opts.transition && current.mounted && current.cls && view.w && Math.abs(view.w - (current.wSeen || -1)) < 0.5 ? current.cls.W : boardWidth();
    if (W <= 0) { current.pending = true; current.room = room; return; }
    current.pending = false;
    flushGravity();
    var t0 = performance.now(), sTop = scroll.scrollTop;   /* every read before the first write */
    var roomChanged = current.room !== room;
    var transition = !!opts.transition && current.mounted && roomChanged && !opts.instant && !opts.held && !reduced() && !PMU.motion.paused();
    current.cls = pickClass(W);
    current.room = room;
    var rects = layoutFor(room), ids = visibleIds(room);
    var byId = {}; rects.forEach(function (r) { byId[r.id] = r; });
    clearTimeout(filmEndT); boardEl.removeAttribute('data-film');
    if (transition) {
      try { performance.mark('pmu-room-click'); } catch (error) {}
      var dir = opts.dir || 1;
      /* rapid switching (WOW-SPEC-3 6.2): a running arrival or room change finishes at once (its animations jump to their
         end, its unbuilt bodies stay unbuilt: they leave with the ghost), and this room change starts from there */
      if (PMU.film && PMU.film.holding && PMU.film.holding()) PMU.film.cancelHold();
      buildToken++; streaming = null; lateHeld = null;
      if (PMU.film && PMU.film.begin) PMU.film.begin('room', room);
      deferHover(4000);
      /* the key light's tint is a full-stage repaint: without a GPU it changes with the new chrome (frame B, which repaints
         the board anyway) instead of in the click's frame, whose raster delayed the first frame by ~50 ms (PERF-3); with
         a GPU it also moves with the camera (6.1) */
      if (!softGpu()) { keyShift(room); if (PMU.film && PMU.film.keyPan) PMU.film.keyPan(dir); }
      /* the old room leaves as ONE layer (WOW-SPEC-3 6.2, PERF-3 rule 10): its cards move into the ghost board at their place
         on screen and that one element drifts and fades; a widget shown in both rooms keeps its card and glides */
      var want = {}; ids.forEach(function (id) { want[id] = true; });
      var reuse = {}, outgoing = [];
      flushLeaving(true);
      cardsNow().forEach(function (c) {
        var id = c.getAttribute('data-widget');
        if (want[id] && !reuse[id] && !c.hasAttribute('data-body-wait') && !c.hasAttribute('data-pending')) { reuse[id] = c; c._pmuFromPx = px(rectOfCard(c)); c._pmuFromScroll = sTop; return; }
        if (c._pmuSlide) { c._pmuSlide.cancel(); c._pmuSlide = null; }
        outgoing.push(c);
      });
      /* the old BOARD itself becomes the ghost (no card is moved, so nothing of the old room is restyled or laid out
         again: moving 16 cards into a new layer cost the VM ~100 ms of style recalc in the click's frame); a fresh board
         element takes its id and place in the scroll's single grid cell, under it */
      if (outgoing.length && !reduced()) {
        /* the second board element already waits in the scroll pane (hidden, empty): no element is inserted next to the
           old board, so the app's positional rules (:nth-child with a descendant part) restyle nothing of it (VM profile:
           inserting a sibling board restyled the old room's ~600-1,000 elements in the click, 23-54 ms) */
        var oldBoard = boardEl, nb = spareBoard();
        dropOld();
        Array.prototype.slice.call(oldBoard.attributes).forEach(function (at) { if (at.name !== 'id' && at.name !== 'class' && at.name !== 'hidden' && !/^data-(film|op|held|hold-bodies)$/.test(at.name)) nb.setAttribute(at.name, at.value); });
        nb.className = 'pmu-board';
        Object.keys(reuse).forEach(function (id) { nb.appendChild(reuse[id]); });
        oldBoard.removeAttribute('id');
        nb.id = 'pmuBoard';
        nb.hidden = false;
        boardEl = nb;
        outgoing.forEach(function (c) { c._pmuLeaving = true; });
        /* without a GPU the old room is not lifted into a layer of its own (its first raster cost the VM ~150 ms before the
           click's first frame): it stays where it is, inert and still, until the new chrome replaces it in the next
           frame (PERF-3's one full-board repaint); with a GPU it leaves as the ghost */
        if (softGpu() || !(PMU.film && PMU.film.ghost)) {
          oldBoard.classList.add('pmu-oldboard');
          if (sTop) oldBoard.style.transform = 'translateY(' + (-sTop) + 'px)';
          pendingOld = { el: oldBoard, cards: outgoing, sTop: sTop };
        }
        else PMU.film.ghost(outgoing, { dir: dir, sTop: sTop, board: nb, ghost: oldBoard, destroy: destroyCard });
      } else outgoing.forEach(function (c) { destroyCard(c); c.remove(); });
      /* what exists in both rooms flies (6.3): the flyers lift at their old place now; they pair with their targets once the
         target bodies are built (the slices) */
      if (PMU.film && PMU.film.flight) { try { PMU.film.flight({ dir: dir }); } catch (error) { console.error('[pm-usage] flight', error); } }
      boardEl.removeAttribute('data-held');
      boardEl.removeAttribute('data-hold-bodies');
      boardEl.setAttribute('data-room', room);
      setBoardClass();
      boardEl.removeAttribute('data-op');
      Array.prototype.slice.call(boardEl.children).forEach(function (n) { if (!n.classList.contains('pmu-card') && n !== morphEl && n !== landing && n !== outline) n.remove(); });
      if (sTop) scroll.scrollTop = 0;
      view.top = 0;
      ensurePreviews();
      /* the click frame builds no card: the plans go to the slices; a shared widget's card is placed now and glides from
         its old place on screen to its new rect (no layout read: grid geometry) */
      var plans = ids.map(function (id) {
        var old = reuse[id];
        if (old) {
          old.setAttribute('data-room', room);
          place(old, byId[id]);   /* never re-appended: a moved node is laid out again from scratch */
          var to = px(byId[id]), from = old._pmuFromPx, dx = from ? from.l - to.l : 0, dy = from ? from.t - old._pmuFromScroll - to.t : 0;
          old._pmuFromPx = null;
          if (Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5) PMU.motion.animate(old, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { dur: 320, easing: filmE('settle', 'cubic-bezier(.17,.84,.29,.99)') });
        }
        return { id: id, rect: byId[id], card: old || null };
      });
      /* the plates' film layers (data-film): without a GPU from the new chrome on, since in the click's frame they would
         promote and re-raster every card of the old room (PERF-3) */
      if (!softGpu()) boardEl.setAttribute('data-film', '');
      current.mounted = true;
      var hero = heroOf(rects, ids, room);
      plans.forEach(function (pl) { if (pl.card) markHero(pl.card, hero); });
      streamBuild(plans, { t0: t0, base: 90, dir: dir, room: room, hero: hero, first: opts.first || (PMU.film && PMU.film.flightCards ? PMU.film.flightCards(room) : []) });
      emit('mount', { room: room, cls: current.cls.name, widgets: ids, transition: true, scrolled: sTop });
      return;
    }
    flushLeaving(true);
    dropOld();
    cardsNow().forEach(destroyCard);
    boardEl.setAttribute('data-held', '');
    boardEl.removeAttribute('data-hold-bodies');
    boardEl.setAttribute('data-room', room);
    setBoardClass();
    boardEl.removeAttribute('data-op');
    boardEl.textContent = '';
    if (roomChanged) { scroll.scrollTop = 0; view.top = 0; }
    var heroId = heroOf(rects, ids, room);
    var held = !!(opts.held && !reduced());
    var frag = document.createDocumentFragment();
    var cards = ids.map(function (id) { var card = PMU.cards.build(id, room, byId[id]); markHero(card, heroId); if (held) card.setAttribute('data-body-wait', ''); frag.appendChild(card); return card; });
    boardEl.appendChild(frag);
    ensurePreviews();
    if (!cards.length) boardEl.appendChild(PMU.cards.empty(room));
    if (held) {
      /* the first arrival (WOW-SPEC-3 5 Phase A): the frames (chrome) are on screen from the first frame and enter in the
         structure wave (PMU.film.frames: one animation per frame); only their BODIES wait, each hidden by opacity
         (data-body-wait, never visibility: an animation created under visibility: hidden runs on the main thread), built
         in slices with the hero first and revealed by PMU.film (the hero at the release, the rest quietly after it) */
      buildToken++;
      current.mounted = true;
      boardEl.removeAttribute('data-held');
      boardEl.removeAttribute('data-hold-bodies');
      viewNow(true);
      if (PMU.film && PMU.film.frames) { PMU.film.frames(cards, { dir: 0, base: 40, board: boardEl }); boardEl.setAttribute('data-film', ''); }
      buildSliced(cards, opts.onBuilt);
      emit('mount', { room: room, cls: current.cls.name, widgets: ids, held: true });
      return;
    }
    buildToken++;
    if (PMU.film && PMU.film.holding()) PMU.film.cancelHold();   /* a room click during the arrival takes over */
    var entering = !opts.instant && !reduced();
    setEntranceDelays(cards);
    tierPass(cards, entering ? 'enter' : true);
    current.mounted = true;
    /* Reduce Motion (E-12): the board shows at once; otherwise the entrance releases it two frames later */
    if (reduced() || opts.instant) boardEl.removeAttribute('data-held'); else PMU.motion.release(boardEl);
    if (entering) PMU.motion.enter(readingOrder(cards), { base: transition ? 16 : 0, dir: transition ? (opts.dir || 1) : 0 });
    emit('mount', { room: room, cls: current.cls.name, widgets: ids });
  }
  /* a range or scope change updates the cards in slices (charts / engine NOTES2 3: one task re-rendering every body was
     100-256 ms on the CPU-only VM): the cards in view first, in reading order, then the rest; at most about 6 ms of
     updates (and their chart draws) per frame, at least one card, starting in the frame after the click. Each card's morph starts in its own slice, so the board
     changes as a quick cascade instead of a freeze. A newer refresh replaces the queue; other reasons stay synchronous. */
  var refreshQ = null;
  function refresh(reason, ropts) {
    if (!current.mounted) return;
    ropts = ropts || {};
    if (refreshQ) { refreshQ.cancelled = true; refreshQ = null; }
    var cards = cardsNow();
    /* a Settings ripple re-renders some bodies in place: the app's hover-tag controller would bind every new node in the
       next frame (35-57 ms on the VM after an Auto-switch toggle); it scans the panel once when the ripple is over */
    if (reason === 'settings' && !reduced()) deferHover(1200);
    /* a Settings change (NOTES3-content E2 / NOTES3-perf C3): the cards that hold the bound controls, notches and active
       marks update in the click task (their ripple starts there); the rest follow in slices from the next frame */
    if (reason === 'settings' && ropts.first && ropts.first.length && !reduced() && cards.length >= 4) {
      var firstIds = {}; ropts.first.forEach(function (id) { firstIds[id] = true; });
      var now0 = cards.filter(function (c) { return firstIds[c.getAttribute('data-widget')]; });
      fitSliced(function () { PMU.cards.updateAll(now0, reason); });
      var rest = readingOrder(cards.filter(function (c) { return !firstIds[c.getAttribute('data-widget')] && inView(c); }))
        .concat(readingOrder(cards.filter(function (c) { return !firstIds[c.getAttribute('data-widget')] && !inView(c); })));
      var sq = refreshQ = { list: rest, reason: reason, cancelled: false };
      var sslice = function () {
        if (sq.cancelled) return;
        var ts = performance.now();
        fitSliced(function () { while (sq.list.length && performance.now() - ts < 6) { var cc = sq.list.shift(); if (cc.isConnected) PMU.cards.update(cc, sq.reason); } });
        if (sq.list.length) requestAnimationFrame(sslice); else if (refreshQ === sq) refreshQ = null;
      };
      if (rest.length) requestAnimationFrame(sslice); else refreshQ = null;
      return;
    }
    if ((reason !== 'range' && reason !== 'scope') || reduced() || cards.length < 4) { PMU.cards.updateAll(cards, reason); return; }
    var top = scroll ? scroll.scrollTop : 0, vh = scroll ? scroll.clientHeight : 900, pitch = ROW;
    /* (named apart from the board's inView: a local var of that name shadowed it for the whole function, hoisted) */
    var inViewNow = function (c) { var y = (+c.dataset.y || 0) * pitch, h = (+c.dataset.h || 0) * pitch; return y + h > top && y < top + vh; };
    var order = readingOrder(cards.filter(inViewNow)).concat(readingOrder(cards.filter(function (c) { return !inViewNow(c); })));
    var q = refreshQ = { list: order, reason: reason, cancelled: false };
    /* the app's hover-tag controller re-binds every new element of each re-rendered body in rAF batches (115 ms of its own
       work in the frames of an Analytics range change on the VM): it waits until the morphs are over and then scans the
       panel once, as after a room change */
    deferHover(1600);
    function slice() {
      if (q.cancelled) return;
      var t0 = performance.now();
      /* each card's charts are drawn inside its slice (the chart kit's flush would otherwise run after the slice, in the
         task's microtasks, outside the budget) */
      fitSliced(function () {
        while (q.list.length && (performance.now() - t0 < 6)) {
          var c = q.list.shift();
          if (c.isConnected) { PMU.cards.update(c, q.reason); if (PMU.charts && PMU.charts.flush) PMU.charts.flush(); }
        }
      });
      if (q.list.length) requestAnimationFrame(slice); else if (refreshQ === q) refreshQ = null;
    }
    /* the click task only starts the change: the control's own feedback (the range ink, the pressed state) draws in the
       next frame, and the first cards change in the frame after it */
    requestAnimationFrame(slice);
  }
  /* a pending sliced refresh finishes at once (a gesture, a mount or a test that reads every card) */
  function flushRefresh() { var q = refreshQ; if (!q) return; refreshQ = null; q.cancelled = true; q.list.forEach(function (c) { if (c.isConnected) PMU.cards.update(c, q.reason); }); }
  /* reconcile the board to a layout: leaving cards fade, staying cards slide (FLIP), new cards enter (B v2 8.2) */
  function reconcile(rects, opts) {
    opts = opts || {};
    completeStream();
    flushGravity();
    var room = current.room, ids = visibleIds(room), want = {};
    ids.forEach(function (id) { want[id] = true; });
    var byId = {}; rects.forEach(function (r) { byId[r.id] = r; });
    var existing = cardsNow(), have = {};
    existing.forEach(function (c) { have[c.getAttribute('data-widget')] = c; });
    var empty = boardEl.querySelector(':scope > .pmu-board-empty'); if (empty && ids.length) empty.remove();
    existing.forEach(function (c) {
      var id = c.getAttribute('data-widget');
      if (want[id]) return;
      c.setAttribute('data-leaving', '');
      c.style.pointerEvents = 'none';
      var a = PMU.motion.animate(c, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { dur: 'exit', ease: 'in', fill: 'forwards' });
      var gone = function () { destroyCard(c); c.remove(); };
      if (a) a.onfinish = gone; else gone();
    });
    var staying = existing.filter(function (c) { return want[c.getAttribute('data-widget')]; });
    var sizes = {};
    staying.forEach(function (c) { sizes[c.getAttribute('data-widget')] = c.dataset.w + 'x' + c.dataset.h; });
    PMU.motion.flip(staying, function () { staying.forEach(function (c) { var r = byId[c.getAttribute('data-widget')]; if (r) place(c, r); }); }, { dur: opts.dur || 'slide', ease: opts.ease || 'slide' });
    var added = ids.filter(function (id) { return !have[id]; }).map(function (id) {
      var card = PMU.cards.build(id, room, byId[id]); boardEl.insertBefore(card, landing && landing.parentNode === boardEl ? landing : null); return card;
    });
    tierPass(staying.filter(function (c) { return sizes[c.getAttribute('data-widget')] !== c.dataset.w + 'x' + c.dataset.h; }), false);
    if (added.length) {
      setEntranceDelays(added);
      tierPass(added, reduced() ? true : 'enter');
      PMU.motion.enter(readingOrder(added), { base: 60 });
    }
    if (!ids.length && !boardEl.querySelector(':scope > .pmu-board-empty')) boardEl.appendChild(PMU.cards.empty(room));
    return added;
  }
  function relevel() { if (!current.mounted) return; reconcile(layoutFor(current.room)); emit('mount', { room: current.room, cls: current.cls.name, widgets: visibleIds(current.room) }); }

  /* ---- geometry without layout reads: a grid rect in board pixels (tracks at pitchX, rows at 30 px), and the offset
     an in-flight FLIP still carries (its from-offset times 1 - eased progress). Gestures read no layout at all. ---- */
  function px(r) {
    var c = current.cls, p = padOf();
    return { l: p.l + r.x * c.pitchX, t: p.t + r.y * ROW, w: r.w * c.pitchX - GAP, h: r.h * ROW - GAP };
  }
  function inflight(el, key) {
    var a = el[key], from = el[key + 'From'];
    if (!a || !from) return { x: 0, y: 0, sx: 1, sy: 1 };
    var ct = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
    var p = a.playState === 'finished' ? 1 : ct && ct.progress != null ? ct.progress : 0;
    var k = 1 - p;
    return { x: from.x * k, y: from.y * k, sx: 1 + ((from.sx || 1) - 1) * k, sy: 1 + ((from.sy || 1) - 1) * k };
  }
  /* ---- peers slide live (interruptible: each slide starts from the peer's visual position) ---- */
  function slidePeers(map, exceptId, durName, easeName, step) {
    var pool = gesture && gesture.cards ? gesture.cards : cardsNow();
    var changing = pool.filter(function (c) {
      var id = c.getAttribute('data-widget'), r = map[id];
      return id !== exceptId && r && c.isConnected && (r.x !== +c.dataset.x || r.y !== +c.dataset.y || r.w !== +c.dataset.w || r.h !== +c.dataset.h);
    });
    if (!changing.length) return;
    /* all writes first, then all animations, so creating the animations resolves style once */
    var moves = changing.map(function (c) {
      var r = map[c.getAttribute('data-widget')];
      var from = px(rectOfCard(c)), off = inflight(c, '_pmuSlide'), to = px(r);
      if (c._pmuSlide) { c._pmuSlide.cancel(); c._pmuSlide = null; }
      place(c, r);
      return { c: c, dx: from.l + off.x - to.l, dy: from.t + off.y - to.t };
    });
    if (reduced()) return;
    /* neighbours flow in reading order, `step` ms apart (WOW-SPEC 3.11: 20 during a gesture, 30 for gravity), so the board
       moves like a liquid rather than jumping; an in-flight slide continues from where it is (no delay then) */
    var rank = moves.slice().sort(function (a, b) { return (+a.c.dataset.y - +b.c.dataset.y) || (+a.c.dataset.x - +b.c.dataset.x); });
    moves.forEach(function (m) {
      var c = m.c;
      if (Math.abs(m.dx) < 0.5 && Math.abs(m.dy) < 0.5) { c._pmuSlideFrom = null; return; }
      c._pmuSlideFrom = { x: m.dx, y: m.dy };
      var delay = step ? Math.min(240, step * rank.indexOf(m)) : 0;
      c._pmuSlide = PMU.motion.animate(c, [{ transform: 'translate(' + m.dx + 'px,' + m.dy + 'px)' }, { transform: 'translate(0,0)' }],
        { dur: durName || 250, easing: easeName && /^cubic|^steps|^linear/.test(easeName) ? easeName : undefined, ease: easeName || 'slide', delay: delay, fill: delay ? 'backwards' : 'none' });
      if (c._pmuSlide) { var me = c._pmuSlide; me.onfinish = function () { if (c._pmuSlide === me) { c._pmuSlide = null; c._pmuSlideFrom = null; } }; }
    });
  }
  /* a preview element glides between grid slots (landing 160 ms, outline 120 ms with its label counter-scaled) */
  function glide(el, r, durName, show) {
    if (el._pmuHiding) { el._pmuHiding.onfinish = null; el._pmuHiding.cancel(); el._pmuHiding = null; el.hidden = true; }
    var wasHidden = el.hidden, prev = el._pmuRect;
    var off = inflight(el, '_pmuGlide');
    if (el._pmuGlide) { el._pmuGlide.cancel(); el._pmuGlide = null; }
    if (el._pmuLabelGlide) { el._pmuLabelGlide.cancel(); el._pmuLabelGlide = null; }
    el.hidden = false;
    gridPlace(el, r);
    el._pmuRect = { x: r.x, y: r.y, w: r.w, h: r.h };
    if (wasHidden || !prev || reduced()) {
      if (wasHidden && show !== false) PMU.motion.animate(el, [{ opacity: 0 }, { opacity: 1 }], { dur: 140, ease: 'out' });
      return;
    }
    var a = px(prev), b = px(r);
    var bw = a.w * off.sx, bh = a.h * off.sy, bl = a.l + off.x, bt = a.t + off.y;
    var sx = bw / b.w, sy = bh / b.h, dx = bl - b.l, dy = bt - b.t;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.005 && Math.abs(sy - 1) < 0.005) return;
    el._pmuGlideFrom = { x: dx, y: dy, sx: sx, sy: sy };
    el._pmuGlide = PMU.motion.animate(el, [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')' }, { transform: 'none' }],
      { dur: durName, easing: 'cubic-bezier(.2,.8,.2,1)' });
    var label = el.querySelector('.pmu-outline-label');
    if (label && el._pmuGlide) el._pmuLabelGlide = PMU.motion.animate(label, [{ transform: 'scale(' + (1 / sx) + ',' + (1 / sy) + ')' }, { transform: 'none' }], { dur: durName, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  function hidePreview(el) {
    if (!el || el.hidden || el._pmuHiding) return;
    if (el._pmuGlide) { el._pmuGlide.cancel(); el._pmuGlide = null; }
    el._pmuRect = null;
    var a = PMU.motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 140, ease: 'out', fill: 'forwards' });
    var done = function () { el.hidden = true; el._pmuHiding = null; if (a) a.cancel(); };
    if (a) { el._pmuHiding = a; a.onfinish = done; } else done();
  }

  /* ---- gestures (DESIGN-SPEC 6.2 to 6.4) ---- */
  function snapshotNow() { return layoutFor(current.room).map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; }); }
  function toMap(list) { var m = {}; list.forEach(function (r) { m[r.id] = r; }); return m; }
  function sameRect(a, b) { return a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h; }
  /* body flags for a gesture: pmu-pointer-op (no text selection), pm7u-pointer-op (the PM8 magnet stands down) and the
     app's drag convention pm-resizing (the magnet loop idles and PM_EDGE defers its band geometry; flushed by
     PM_DRAGEND on release, exactly as the Home dashboard drags do) */
  function setOpFlags(on, op) {
    var cl = document.body.classList;
    cl.toggle('pmu-pointer-op', on); cl.toggle('pm7u-pointer-op', on);
    var mine = boardEl.hasAttribute('data-op');
    if (on && !cl.contains('pm-resizing')) { cl.add('pm-resizing'); boardEl._pmuResizingFlag = true; }
    if (on) boardEl.setAttribute('data-op', op); else boardEl.removeAttribute('data-op');
    if (!on && mine && boardEl._pmuResizingFlag) {
      boardEl._pmuResizingFlag = false; cl.remove('pm-resizing');
      try { if (typeof window.PM_DRAGEND === 'function') window.PM_DRAGEND(); } catch (error) {}
    }
  }
  function sizeLabel(id, r) {
    var name = PMU.cards.sizeName(kindSpec(id), r.w, r.h);
    return { name: name, size: r.w + ' x ' + r.h };
  }
  function tierNote(card, r) {
    var cls = current.cls, form = PMU.cards.headForm(PMU.widgets.get(card.getAttribute('data-widget')) || {}, r.w, r.h, cls.pitchX);
    var head = PMU.cards.HEAD_PX[form] || 34, padX = 28, padB = form === 'plate' ? 16 : 10;
    var t2 = tierOf(r.w * cls.pitchX - GAP - padX, r.h * ROW - GAP - head - padB);
    var order = ['xs', 's', 'm', 'l', 'xl'], hord = ['h0', 'h1', 'h2', 'h3', 'h4'];
    var dw = order.indexOf(t2.w) - order.indexOf(card.getAttribute('data-tw') || 'm'), dh = hord.indexOf(t2.h) - hord.indexOf(card.getAttribute('data-th') || 'h2');
    var px = Math.round(r.w * cls.pitchX - GAP) + ' x ' + Math.round(r.h * ROW - GAP) + ' px';
    if (dw > 0 || (dw === 0 && dh > 0)) return t('board.more_detail') + ' · ' + px;
    if (dw < 0 || (dw === 0 && dh < 0)) return t('board.less_detail') + ' · ' + px;
    return px;
  }
  function showOutline(g, r) {
    var lab = sizeLabel(g.id, r);
    outline.querySelector('.pmu-ol-name').textContent = lab.name ? lab.name + ' · ' : '';
    outline.querySelector('.pmu-ol-size').textContent = lab.size;
    outline.querySelector('.pmu-ol-note').textContent = tierNote(g.card, r);
    glide(outline, r, 'outline');
  }
  function autoScroll(g) {
    if (g.kb || g.py == null) return;
    var r = g.scrollRect || (g.scrollRect = scroll.getBoundingClientRect()), v = 0;
    if (g.py < r.top + SCROLL_BAND) v = -(3 + 11 * Math.min(1, (r.top + SCROLL_BAND - g.py) / SCROLL_BAND));
    else if (g.py > r.bottom - SCROLL_BAND) v = 3 + 11 * Math.min(1, (g.py - (r.bottom - SCROLL_BAND)) / SCROLL_BAND);
    /* never scroll a move past the row under the other cards: the landing cannot go lower than that */
    if (v > 0 && g.type === 'move' && g.target && g.target.y >= g.maxY) v = 0;
    if (v) { var before = scroll.scrollTop; scroll.scrollTop = Math.max(0, before + v); if (scroll.scrollTop !== before) g.dirty = true; }
  }
  function loop(g) {
    if (gesture !== g || g.done) return;
    autoScroll(g);
    if (g.type === 'move') frameMove(g); else frameResize(g);
    g.raf = requestAnimationFrame(function () { loop(g); });
  }
  function liftScale() { var f = PMU.motion.family(); return f === 'retro' || f === 'nier' ? 1 : 1.04; }
  /* the velocity tilt's limit per voice (WOW-SPEC 3.11): Basic 1deg, Glass 1.5, Friendly 2, Retro and NieR none */
  function tiltMax() { var f = PMU.motion.family(); return f === 'friendly' ? 2 : f === 'glass' ? 1.5 : f === 'retro' || f === 'nier' ? 0 : 1; }
  var liftEase = null;
  function frameMove(g, force) {
    var now = performance.now();
    var dx = g.px - g.sx + (scroll.scrollLeft - g.scrollL), dy = g.py - g.sy + (scroll.scrollTop - g.scrollT);
    /* pick-up: 140 ms (.2,.8,.2,1) to scale 1.04 and 6 px up (Retro and NieR: no scale, no lift) */
    if (!liftEase) liftEase = PMU.motion.curve('cubic-bezier(.2,.8,.2,1)');
    var k = reduced() ? 1 : liftEase(Math.min(1, (now - g.liftAt) / (140 * speed())));
    var flat = liftScale() === 1;
    var s = 1 + (liftScale() - 1) * k, ly = flat ? 0 : -6 * k;
    /* velocity tilt: rotate = clamp(vx / 1200 px/s x 1deg), easing in while the pointer moves and back to 0 over about
       160 ms when it rests (the loop runs every frame, so a resting pointer reads as vx 0) */
    var dt = g.lastT ? now - g.lastT : 0, max = reduced() ? 0 : tiltMax();
    if (dt > 0) {
      var vx = (g.px - (g.lastPx == null ? g.px : g.lastPx)) / dt * 1000;
      g.vx = (g.vx || 0) * 0.55 + vx * 0.45;
      var target = Math.max(-max, Math.min(max, g.vx / 1200));
      g.tilt = (g.tilt || 0) + (target - (g.tilt || 0)) * Math.min(1, dt / (Math.abs(target) > Math.abs(g.tilt || 0) ? 60 : 160));
    }
    g.lastT = now; g.lastPx = g.px;
    var tilt = max && Math.abs(g.tilt || 0) > 0.01 ? ' rotate(' + g.tilt.toFixed(3) + 'deg)' : '';
    var tr = 'translate3d(' + dx.toFixed(1) + 'px,' + (dy + ly).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')' + tilt;
    if (g.lastTr !== tr) { g.card.style.transform = tr; g.lastTr = tr; }
    g.dx = dx; g.dy = dy + ly; g.s = s;
    /* the target slot is the cell under the card's top-left anchor, with 75 % of a pitch of hysteresis across the
       boundary, and a new slot is taken only after the card has dwelt over it 100 ms (a fast pass does not shove the
       board); the release takes the slot under the pointer at once */
    var cls = current.cls, rawX = (g.cardL + dx - g.pad.l) / cls.pitchX, rawY = (g.cardT + dy - g.pad.t) / ROW;
    var nx = g.target.x, ny = g.target.y;
    if (Math.abs(rawX - g.target.x) >= TARGET_HYST) nx = Math.max(0, Math.min(cls.tracks - g.me.w, Math.round(rawX)));
    if (Math.abs(rawY - g.target.y) >= TARGET_HYST) ny = Math.max(0, Math.min(g.maxY, Math.round(rawY)));
    if (nx !== g.target.x || ny !== g.target.y) {
      if (!g.cand || g.cand.x !== nx || g.cand.y !== ny) g.cand = { x: nx, y: ny, at: now };
      if (force || reduced() || now - g.cand.at >= 100 * speed()) {
        g.cand = null;
        g.target = { id: g.id, x: nx, y: ny, w: g.me.w, h: g.me.h };
        previewTo(g, g.target);
      }
    } else g.cand = null;
  }
  /* the preview IS the board the release commits (final fix M7, Mac film: the peers were pushed down 390 px while
     dragging, then gravity sent budget-now diagonally to a slot the preview never showed): each new slot runs the
     resolver and then the post-gesture gravity on the candidate layout, and the peers slide there live, so the release
     only settles the active card */
  function previewTo(g, rect) {
    /* back on its own slot the release changes nothing, so the preview is the snapshot itself */
    g.preview = sameRect(rect, g.me) ? g.snapshot : gravity(resolve(g.snapshot, g.id, rect), g.id, g.me, g.snapshot, current.cls.tracks);
    g.previewFinal = true;
    var map = toMap(g.preview);
    if (g.type === 'move') glide(landing, rect, 'landing'); else showOutline(g, rect);
    slidePeers(map, g.id, 250, 'slide', g.kb ? 0 : 20);
    emit('preview', { op: g.type, id: g.id, rect: rect, peers: g.preview.filter(function (r) { return r.id !== g.id; }) });
  }
  function frameResize(g) {
    var cls = current.cls, ks = kindSpec(g.id), me = g.me, e = g.edge;
    var ddx = g.px - g.sx, ddy = g.py - g.sy + (scroll.scrollTop - g.scrollT);
    var r = { id: g.id, x: me.x, y: me.y, w: me.w, h: me.h };
    var wMax = Math.min(ks.wMax || cls.tracks, cls.tracks), wMin = Math.min(ks.wMin || 1, wMax);
    if (e.indexOf('e') >= 0) r.w = Math.max(wMin, Math.min(wMax, cls.tracks - me.x, Math.round((g.cardW + GAP + ddx) / cls.pitchX)));
    if (e.indexOf('w') >= 0) {
      var right = me.x + me.w;
      r.w = Math.max(wMin, Math.min(wMax, right, Math.round((g.cardW + GAP - ddx) / cls.pitchX)));
      r.x = right - r.w;
    }
    var hMax = ks.hMax || 40, hMin = Math.min(ks.hMin || 1, hMax);
    if (e.indexOf('s') >= 0) r.h = Math.max(hMin, Math.min(hMax, Math.round((g.cardH + GAP + ddy) / ROW)));
    if (e === 'ne' || e === 'nw') {
      var bottom = me.y + me.h;
      r.h = Math.max(hMin, Math.min(hMax, bottom, Math.round((g.cardH + GAP - ddy) / ROW)));
      r.y = bottom - r.h;
    }
    if (!sameRect(r, g.target)) { g.target = r; previewTo(g, r); }
  }
  function beginGesture(g) {
    completeStream();
    flushGravity();
    sheenOff();
    gesture = g;
    if (PMU.menu) PMU.menu.close();
    g.snapshot = snapshotNow();
    g.me = g.snapshot.filter(function (r) { return r.id === g.id; })[0];
    if (!g.me) { gesture = null; return false; }
    g.target = { id: g.id, x: g.me.x, y: g.me.y, w: g.me.w, h: g.me.h };
    var shownNow = {}; visibleIds(current.room).forEach(function (id) { shownNow[id] = true; });
    g.maxY = g.snapshot.reduce(function (m, r) { return r.id === g.id || !shownNow[r.id] ? m : Math.max(m, r.y + r.h); }, 0);
    g.maxY = Math.max(g.maxY, g.me.y);
    g.preview = g.snapshot;
    g.pad = padOf();
    g.cards = cardsNow();
    var gp = px(g.me);
    g.cardL = gp.l; g.cardT = gp.t; g.cardW = gp.w; g.cardH = gp.h;
    g.scrollL = scroll.scrollLeft; g.scrollT = scroll.scrollTop;
    ensurePreviews();
    setOpFlags(true, g.type);
    if (g.card._pmuSlide) { g.card._pmuSlide.cancel(); g.card._pmuSlide = null; }
    if (g.card._pmuSettle) { g.card._pmuSettle.cancel(); g.card._pmuSettle = null; }
    g.card.removeAttribute('data-settling');
    if (!g.kb) { try { var sel = window.getSelection(); if (sel && sel.rangeCount) sel.removeAllRanges(); } catch (e) {} }
    if (g.type === 'move') {
      g.card.setAttribute('data-lifted', '');
      g.card.setAttribute('aria-grabbed', 'true');
      g.liftAt = performance.now();
      glide(landing, g.target, 'landing');
    } else {
      g.card.setAttribute('data-resizing', g.edge);
      showOutline(g, g.target);
    }
    if (g.kb) {
      if (g.type === 'move') g.card.style.transform = 'scale(' + liftScale() + ')';
      say(t(g.type === 'move' ? 'board.picked' : 'board.resizing', { name: cardTitle(g.id) }));
    } else {
      g.raf = requestAnimationFrame(function () { loop(g); });
    }
    return true;
  }
  function cardTitle(id) { var d = PMU.widgets.get(id) || {}; try { return typeof d.title === 'function' ? d.title({ id: id, room: current.room, state: st }) : (d.title || id); } catch (e) { return id; } }
  /* release: commit (one command) or settle / glide back */
  function endGesture(g, how, instant) {
    if (!g || g.done) return;
    g.done = true;
    cancelAnimationFrame(g.raf);
    if (gesture === g) gesture = null;
    window.removeEventListener('pointermove', g.onMove, true);
    window.removeEventListener('pointerup', g.onUp, true);
    window.removeEventListener('pointercancel', g.onCancel, true);
    window.removeEventListener('blur', g.onBlur);
    if (g.capEl) { try { g.capEl.removeEventListener('lostpointercapture', g.onLost); if (g.capEl.hasPointerCapture && g.capEl.hasPointerCapture(g.pointerId)) g.capEl.releasePointerCapture(g.pointerId); } catch (e) {} }
    setOpFlags(false);
    var card = g.card;
    card.removeAttribute('aria-grabbed');
    var changed = how === 'drop' && !sameRect(g.target, g.me);
    var receipt = null;
    if (changed) {
      var room = current.room, cls = current.cls.name;
      var snapMap = toMap(g.snapshot);
      /* coordinator decision 1: the committed layout is the resolver's preview plus gravity (displaced peers that fit the
         freed region move into it, every card floats up into the holes above it); one command carries every peer */
      g.final = g.previewFinal ? g.preview : gravity(g.preview, g.id, g.me, g.snapshot, current.cls.tracks);
      var peers = g.final.filter(function (r) { return r.id !== g.id && !sameRect(r, snapMap[r.id]); });
      if (g.type === 'move') {
        receipt = command('cmd.widget.move', { room: room, widget_id: g.id, from: { x: g.me.x, y: g.me.y }, to: { x: g.target.x, y: g.target.y }, board_class: cls,
          moved_peers: peers.map(function (r) { return { widget_id: r.id, to: { x: r.x, y: r.y } }; }), source: g.source || (g.kb ? 'keyboard' : 'pointer') }, { moved: true });
      } else {
        var nm = PMU.cards.sizeName(kindSpec(g.id), g.target.w, g.target.h);
        var form = PMU.cards.headForm(PMU.widgets.get(g.id) || {}, g.target.w, g.target.h, current.cls.pitchX);
        var tt = tierOf(g.target.w * current.cls.pitchX - GAP - 28, g.target.h * ROW - GAP - (PMU.cards.HEAD_PX[form] || 34) - (form === 'plate' ? 16 : 10));
        receipt = command('cmd.widget.resize', { room: room, widget_id: g.id, from: { x: g.me.x, y: g.me.y, w: g.me.w, h: g.me.h },
          to: { x: g.target.x, y: g.target.y, w: g.target.w, h: g.target.h }, board_class: cls, preset_id: nm || 'custom', semantic_tier_id: tt.w + '.' + tt.h,
          moved_peers: peers.map(function (r) { return { widget_id: r.id, to: { x: r.x, y: r.y } }; }), source: g.source || (g.kb ? 'keyboard' : 'pointer') }, { resized: true });
      }
      g.receipt = receipt;
      if (receipt.dispatch_accepted === false) { changed = false; how = 'rejected'; }
    }
    if (changed) {
      saveLayout(current.room, g.final || g.preview);
      revisions[g.id] = (revisions[g.id] || 0) + 1;
      persist();
      var settleMs = g.type === 'move' ? settleMove(g, instant) : morphResize(g, instant);
      /* 60 ms after the settle the displaced cards float up (250 SLIDE, 30 apart in reading order) */
      if (g.final) { if (instant || reduced()) { gravityMap = toMap(g.final); flushGravity(); } else scheduleGravity(toMap(g.final), Math.min(settleMs || 0, 280) + 60); }
      hidePreview(g.type === 'move' ? landing : outline);
      say(g.type === 'move' ? t('board.moved', { x: g.target.x + 1, y: g.target.y + 1 }) : t('board.resized', { name: sizeLabel(g.id, g.target).name || 'custom size', w: g.target.w, h: g.target.h }));
      emit('commit', { op: g.type, id: g.id, rect: g.target, receipt: receipt });
    } else {
      /* cancel, rejection or no change: everything glides back to the snapshot; no command, no write */
      if (g.type === 'move') settleMove(g, instant, true); else { card.removeAttribute('data-resizing'); }
      /* peers glide back 250 (WOW-SPEC 3.11 Escape) while the card glides home on the cancel ease */
      slidePeers(toMap(g.snapshot), g.id, how === 'drop' ? 'settle' : 250, how === 'drop' ? 'settle' : 'slide');
      hidePreview(g.type === 'move' ? landing : outline);
      if (how === 'rejected') PMU.shell.toast(t('board.rejected'));
      if (how !== 'drop') { say(t('board.cancelled', { name: cardTitle(g.id) })); emit('cancel', { op: g.type, id: g.id, reason: how }); }
    }
    if (g.kb && card.isConnected) card.focus({ preventScroll: true });
    if (!g.kb && g.started) suppressClick();
  }
  /* the drop (WOW-SPEC 3.11): the card settles from the pointer into its slot on a physical spring (k 520 c 38, about
     260 ms; Friendly k 380 c 22 for a visible hop; Retro snaps in three steps), the lift shadow fades over 200
     (data-settling), then one seat: the rim goes to 45 % accent and back (420 OUT). Escape glides back in 300. Returns the
     settle's duration (unscaled ms) so gravity can follow it. */
  function settleMove(g, instant, back) {
    var card = g.card;
    var from = px(g.me), to = px(back ? g.me : g.target);
    var dx = g.dx || 0, dy = g.dy || 0, s = g.s || (g.kb && g.type === 'move' ? liftScale() : 1), tilt = g.tilt || 0;
    card.style.transform = '';
    card.removeAttribute('data-lifted');
    if (!back) place(card, g.target);
    if (instant || reduced()) return 0;
    var tx = from.l + dx - to.l, ty = from.t + dy - to.t;
    if (Math.abs(tx) < 0.5 && Math.abs(ty) < 0.5 && Math.abs(s - 1) < 0.002) { if (!back) seat(card); return 0; }
    card.setAttribute('data-settling', '');
    var f = PMU.motion.family(), dur, easing;
    if (back) { dur = 300; easing = PMU.motion.ease('cancel'); }
    else if (f === 'retro' || f === 'nier') { dur = 160; easing = 'steps(3,jump-start)'; }
    else if (PMU.film && PMU.film.spring) { var sp = PMU.film.spring(f === 'friendly' ? { k: 380, c: 22, until: 0.005 } : { k: 520, c: 38, until: 0.005 }); dur = sp.duration; easing = sp.easing; }
    else { dur = 220; easing = PMU.motion.ease('settle'); }
    card._pmuSettle = PMU.motion.animate(card, [{ transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')' + (Math.abs(tilt) > 0.01 ? ' rotate(' + tilt.toFixed(3) + 'deg)' : '') }, { transform: 'none' }],
      { dur: dur, easing: easing });
    var clear = function () { card.removeAttribute('data-settling'); card._pmuSettle = null; if (!back) seat(card); };
    if (card._pmuSettle) card._pmuSettle.onfinish = clear; else clear();
    return dur;
  }
  /* one seat (and the inspector's held rim): a pre-rendered 1 px accent rim whose opacity moves */
  function rimOf(card) {
    var r = card.querySelector(':scope > .pmu-rim');
    if (!r) { r = document.createElement('i'); r.className = 'pmu-rim'; r.setAttribute('aria-hidden', 'true'); card.appendChild(r); }
    return r;
  }
  function seat(card) {
    if (reduced() || !card.isConnected) return;
    var r = rimOf(card), nier = PMU.theme.look().nier;
    var a = PMU.motion.animate(r, nier ? [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1, offset: 0.28 }, { opacity: 0 }],
      { dur: nier ? 240 : 420, easing: nier ? 'steps(4,jump-start)' : 'cubic-bezier(.22,.8,.28,1)' });
    if (a) a.finished.then(function () { if (!r.classList.contains('is-held')) r.remove(); }, function () {});
  }
  /* coordinator decision 1 (WOW-SPEC 3.11, 3.13): after a move or resize settles, (1) every peer the gesture displaced
     takes the highest free place above where the resolver put it, preferring the freed region (the active card's old
     rect), then the row, then the column nearest its own; (2) every card but the active one floats straight up into
     the hole above it, in reading order, so the order is kept; (1) and (2) run twice, since a float can open a place
     for a displaced card. Every rect of the room (all levels, hidden ones too) takes part, so no level ever overlaps
     another; the active card stays where it was put. Pure. */
  function gravity(rects, activeId, me, snapshot, tracks) {
    var snap = toMap(snapshot || []);
    var cur = rects.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
    var act = cur.filter(function (r) { return r.id === activeId; })[0] || null;
    /* only the panels on screen float and block (integration 2, real-pointer random test: a Detailed panel, invisible at
       Glance, floated up into the hole a move left and held a visible panel below an empty band). The panels of a
       deeper level and the hidden ones keep their places unless a floated panel lands on them; then they step down. */
    var visSet = null;
    try { if (current.room) { visSet = {}; visibleIds(current.room).forEach(function (id) { visSet[id] = true; }); } } catch (error) { visSet = null; }
    var shown = visSet ? cur.filter(function (r) { return visSet[r.id] || r === act; }) : cur;
    var unseen = visSet ? cur.filter(function (r) { return !(visSet[r.id] || r === act); }) : [];
    function hits(c) { for (var i = 0; i < shown.length; i++) { var p = shown[i]; if (p.id !== c.id && overlaps(c, p)) return true; } return false; }
    function reading(a, b) { return a.y - b.y || a.x - b.x; }
    var others = shown.filter(function (r) { return r !== act; });
    var displaced = others.filter(function (c) { var o = snap[c.id]; return o && (o.x !== c.x || o.y !== c.y); });
    for (var round = 0; round < 2; round++) {
      displaced.sort(reading).forEach(function (c) {
        var o = snap[c.id], best = null, bestScore = Infinity;
        for (var y = 0; y < c.y; y++) {
          for (var x = 0; x + c.w <= tracks; x++) {
            var cand = { id: c.id, x: x, y: y, w: c.w, h: c.h };
            if (hits(cand)) continue;
            var score = (me && act && overlaps(cand, me) ? 0 : 1e6) + y * 1000 + Math.abs(x - o.x);
            if (score < bestScore) { bestScore = score; best = cand; }
          }
        }
        if (best) { c.x = best.x; c.y = best.y; }
      });
      others.sort(reading).forEach(function (c) {
        while (c.y > 0) { c.y--; if (hits(c)) { c.y++; break; } }
      });
    }
    var placed = shown.slice();
    unseen.sort(reading).forEach(function (c) {
      var clash = function () { for (var i = 0; i < placed.length; i++) if (placed[i].id !== c.id && overlaps(c, placed[i])) return true; return false; };
      for (var guard = 0; clash() && guard < 400; guard++) c.y++;
      placed.push(c);
    });
    return cur;
  }
  var gravityT = 0, gravityMap = null;
  function scheduleGravity(map, ms) {
    clearTimeout(gravityT); gravityMap = map;
    if (!ms) { runGravity(); return; }
    gravityT = setTimeout(runGravity, ms * speed());
  }
  function runGravity() {
    gravityT = 0;
    var m = gravityMap; gravityMap = null;
    if (!m || !current.mounted) return;
    slidePeers(m, null, 250, 'slide', 30);
  }
  /* a new gesture, a mount or a reconcile takes the floated layout at once */
  function flushGravity() {
    if (!gravityMap) return;
    clearTimeout(gravityT); gravityT = 0;
    var m = gravityMap; gravityMap = null;
    cardsNow().forEach(function (c) { var r = m[c.getAttribute('data-widget')]; if (r) place(c, r); });
  }
  /* the resize release (WOW-SPEC 3.12, E-3): the body renders at its new tier BEFORE the first morph frame; the plate's
     surface (a .pmu-morph layer under the card) morphs from the old rect to the new one, 220 SETTLE; the card's content
     never fades: it is revealed by clip-path inset() from the old rect to the new on the same 220 (a shrink shows the new
     content at once inside the shrinking surface). NieR snaps in two steps. Returns the morph's duration. */
  function morphResize(g, instant) {
    var card = g.card;
    var o = px(g.me), n = px(g.target);
    /* the old content is set aside (display: none) while the new size is measured (PERF-3): the measure otherwise
       restyled the whole old subtree at the new size (45 ms, 650 elements, for the budget plate on the VM) just before
       the body renders again */
    var oldBody = card.querySelector(':scope > .pmu-cardbody');
    if (oldBody && oldBody.firstChild) oldBody.setAttribute('data-pmu-stale', '');
    card.removeAttribute('data-resizing');
    place(card, g.target);
    tierPass([card], false);
    if (instant || reduced() || !n.w || !n.h || !o.w || !o.h) return 0;
    var nier = PMU.theme.look().nier, dur = nier ? 120 : 220, easing = nier ? 'steps(2,jump-start)' : filmE('settle', 'cubic-bezier(.17,.84,.29,.99)');
    /* the surface is one kept element, the board's first child (PERF-3: inserting a new first child on every release
       shifted every card's :nth-child position, and the app's positional rules restyled the whole board) */
    ensurePreviews();
    var m = morphEl;
    if (m._pmuMorph) { try { m._pmuMorph.cancel(); } catch (e) {} }
    if (m._pmuCard && m._pmuCard !== card) m._pmuCard.removeAttribute('data-morphing');
    m.hidden = false; m._pmuCard = card;
    m.style.left = n.l + 'px'; m.style.top = n.t + 'px'; m.style.width = n.w + 'px'; m.style.height = n.h + 'px';
    card.setAttribute('data-morphing', '');
    var a = m._pmuMorph = PMU.motion.animate(m, [{ transform: 'translate(' + (o.l - n.l) + 'px,' + (o.t - n.t) + 'px) scale(' + (o.w / n.w) + ',' + (o.h / n.h) + ')' }, { transform: 'none' }],
      { dur: dur, easing: easing, fill: 'forwards' });
    /* the content's clip reveal is a main-thread animation: with a GPU only (without one the content shows at its new
       size at once while the surface morphs) */
    var it = Math.max(0, o.t - n.t), il = Math.max(0, o.l - n.l), ir = Math.max(0, (n.l + n.w) - (o.l + o.w)), ib = Math.max(0, (n.t + n.h) - (o.t + o.h));
    if ((it || il || ir || ib) && !softGpu()) {
      var r = getComputedStyle(card).borderTopLeftRadius || '0px';
      PMU.motion.animate(card, [{ clipPath: 'inset(' + it + 'px ' + ir + 'px ' + ib + 'px ' + il + 'px round ' + r + ')' }, { clipPath: 'inset(0px 0px 0px 0px round ' + r + ')' }],
        { dur: dur, easing: easing });
    }
    var done = function () {
      if (m._pmuMorph !== a) return;
      m._pmuMorph = null; m._pmuCard = null; m.hidden = true;
      try { if (a) a.cancel(); } catch (e) {}
      card.removeAttribute('data-morphing');
    };
    if (a) a.finished.then(done, done); else done();
    return dur;
  }
  var suppressT = 0;
  function suppressClick() {
    var kill = function (event) { event.stopPropagation(); event.preventDefault(); window.removeEventListener('click', kill, true); };
    window.addEventListener('click', kill, true);
    clearTimeout(suppressT); suppressT = setTimeout(function () { window.removeEventListener('click', kill, true); }, 0);
  }

  /* pointer: the head (outside its buttons) or the grip lifts after 4 px; a handle resizes at once */
  function onPointerDown(event) {
    if (event.button !== 0 || gesture || !current.mounted) return;
    var card = event.target.closest('.pmu-card');
    if (!card || card.parentNode !== boardEl || isLeaving(card)) return;
    var handle = event.target.closest('.pmu-h');
    var g = { id: card.getAttribute('data-widget'), card: card, pointerId: event.pointerId, sx: event.clientX, sy: event.clientY, px: event.clientX, py: event.clientY, started: false };
    g.onMove = function (e) { if (e.pointerId !== g.pointerId) return; g.px = e.clientX; g.py = e.clientY;
      if (!g.started && Math.hypot(g.px - g.sx, g.py - g.sy) >= MOVE_THRESHOLD) { g.started = true; if (!beginGesture(g)) return; capture(g, card); }
      if (g.started) e.preventDefault(); };
    g.onUp = function (e) { if (e.pointerId !== g.pointerId) return; g.px = e.clientX; g.py = e.clientY;
      if (!g.started) { detach(g); return; }
      if (gesture === g) { if (g.type === 'move') frameMove(g, true); else frameResize(g); }
      var r = scroll.getBoundingClientRect();
      var outside = e.clientX < r.left - 24 || e.clientX > r.right + 24 || e.clientY < r.top - 24 || e.clientY > r.bottom + 24;
      endGesture(g, outside && g.type === 'move' ? 'outside' : 'drop'); };
    g.onCancel = function (e) { if (e.pointerId !== g.pointerId) return; if (!g.started) { detach(g); return; } endGesture(g, 'pointercancel'); };
    g.onLost = function () { if (g.started && !g.done) endGesture(g, 'lostpointercapture'); };
    g.onBlur = function () { if (g.started) endGesture(g, 'blur'); else detach(g); };
    if (handle) {
      g.type = 'resize'; g.edge = handle.getAttribute('data-edge'); g.started = true;
      event.preventDefault();
      if (!beginGesture(g)) return;
      attach(g); capture(g, handle);
      return;
    }
    var head = event.target.closest('.pmu-cardhead');
    if (!head) return;
    var ctl = event.target.closest('button, a, input, select, textarea, label, [role="button"], [data-nodrag], .pmu-headtools');
    if (ctl && !ctl.classList.contains('pmu-grip')) return;
    g.type = 'move';
    attach(g);
  }
  function attach(g) {
    window.addEventListener('pointermove', g.onMove, true);
    window.addEventListener('pointerup', g.onUp, true);
    window.addEventListener('pointercancel', g.onCancel, true);
    window.addEventListener('blur', g.onBlur);
  }
  function detach(g) {
    window.removeEventListener('pointermove', g.onMove, true);
    window.removeEventListener('pointerup', g.onUp, true);
    window.removeEventListener('pointercancel', g.onCancel, true);
    window.removeEventListener('blur', g.onBlur);
  }
  function capture(g, el) {
    try { el.setPointerCapture(g.pointerId); g.capEl = el; el.addEventListener('lostpointercapture', g.onLost); } catch (e) { g.capEl = null; }
  }

  /* keyboard (DESIGN-SPEC 6.4): M or Enter on the grip picks up, R resizes; arrows (Shift = 4 or the next preset), Enter, Escape */
  function keyboard(id, mode) {
    if (gesture) endGesture(gesture, 'cancel', true);
    var card = cardOf(id); if (!card) return false;
    var g = { id: id, card: card, type: mode === 'resize' ? 'resize' : 'move', edge: 'se', kb: true, started: true };
    card.focus({ preventScroll: true });
    if (!beginGesture(g)) return false;
    g.onBlur = function () { if (!g.done) endGesture(g, 'blur'); };
    g.onFocusOut = function (e) { if (!g.done && (!e.relatedTarget || !card.contains(e.relatedTarget))) endGesture(g, 'blur'); card.removeEventListener('focusout', g.onFocusOut); };
    card.addEventListener('focusout', g.onFocusOut);
    window.addEventListener('blur', g.onBlur);
    return true;
  }
  function kbStep(g, key, shift) {
    var cls = current.cls, r = { id: g.id, x: g.target.x, y: g.target.y, w: g.target.w, h: g.target.h }, ks = kindSpec(g.id);
    if (g.type === 'move') {
      var n = shift ? 4 : 1;
      if (key === 'ArrowLeft') r.x -= n; if (key === 'ArrowRight') r.x += n; if (key === 'ArrowUp') r.y -= n; if (key === 'ArrowDown') r.y += n;
      r.x = Math.max(0, Math.min(cls.tracks - r.w, r.x)); r.y = Math.max(0, r.y);
    } else if (shift) {
      /* Shift steps to the next preset in the arrow's direction: Right / Left by width, Down / Up by height (ties: the
         preset closest in the other dimension) */
      var presets = (ks.presets || []).filter(function (p) { return p.w <= cls.tracks - r.x; });
      var horiz = key === 'ArrowRight' || key === 'ArrowLeft', fwd = key === 'ArrowRight' || key === 'ArrowDown';
      var cands = presets.filter(function (p) { var a = horiz ? p.w : p.h, b = horiz ? r.w : r.h; return fwd ? a > b : a < b; });
      cands.sort(function (p, q) {
        var pa = horiz ? p.w : p.h, qa = horiz ? q.w : q.h;
        if (pa !== qa) return fwd ? pa - qa : qa - pa;
        return Math.abs((horiz ? p.h : p.w) - (horiz ? r.h : r.w)) - Math.abs((horiz ? q.h : q.w) - (horiz ? r.h : r.w));
      });
      if (cands[0]) { r.w = cands[0].w; r.h = cands[0].h; }
    } else {
      var wMax = Math.min(ks.wMax || cls.tracks, cls.tracks - r.x), hMax = ks.hMax || 40;
      if (key === 'ArrowRight') r.w = Math.min(wMax, r.w + 1); if (key === 'ArrowLeft') r.w = Math.max(ks.wMin || 1, r.w - 1);
      if (key === 'ArrowDown') r.h = Math.min(hMax, r.h + 1); if (key === 'ArrowUp') r.h = Math.max(ks.hMin || 1, r.h - 1);
    }
    if (sameRect(r, g.target)) return;
    g.target = r;
    previewTo(g, r);
    var el = g.type === 'move' ? landing : outline;
    requestAnimationFrame(function () { if (el && !el.hidden && el.scrollIntoView) { var sr = scroll.getBoundingClientRect(), er = el.getBoundingClientRect();
      if (er.top < sr.top + 8) scroll.scrollTop -= (sr.top + 8 - er.top); else if (er.bottom > sr.bottom - 8) scroll.scrollTop += (er.bottom - sr.bottom + 8); } });
    if (g.type === 'move') say(t('board.moved', { x: r.x + 1, y: r.y + 1 }));
    else say(t('board.resized', { name: sizeLabel(g.id, r).name || 'custom size', w: r.w, h: r.h }));
  }
  function onKeyDown(event) {
    var g = gesture;
    if (g && g.kb) {
      var k = event.key;
      if (k === 'Escape') { event.preventDefault(); event.stopPropagation(); endGesture(g, 'escape'); return; }
      if (k === 'Enter' || k === ' ') { event.preventDefault(); event.stopPropagation(); endGesture(g, 'drop'); return; }
      if (/^Arrow/.test(k)) { event.preventDefault(); event.stopPropagation(); kbStep(g, k, event.shiftKey); return; }
      if (k === 'Tab') { endGesture(g, 'blur'); }
      return;
    }
    if (g && !g.kb && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); endGesture(g, 'escape'); return; }
    var card = event.target.closest && event.target.closest('.pmu-card');
    if (!card || card.parentNode !== boardEl) return;
    var onCard = event.target === card, onGrip = event.target.classList && event.target.classList.contains('pmu-grip');
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if ((onCard && (event.key === 'm' || event.key === 'M')) || (onGrip && (event.key === 'Enter' || event.key === ' '))) {
      event.preventDefault(); keyboard(card.getAttribute('data-widget'), 'move'); return;
    }
    if (onCard && (event.key === 'r' || event.key === 'R')) { event.preventDefault(); keyboard(card.getAttribute('data-widget'), 'resize'); }
  }
  /* ---- the pointer sheen (WOW-SPEC 3.17): a 280 px radial light inside the hovered plate, under its content, moved by
     transform only (one rAF write per pointer frame, the card's rect read once on entry), fading out 200 on leave ---- */
  var sheen = { card: null, el: null, rect: null, x: 0, y: 0, raf: 0 };
  /* the sheen layer is made once per card, on its first hover, and kept (PERF-3): inserting it on every hover changed
     the card's child list, and the app's positional rules then restyled the card's whole subtree (14 ms per hover on the
     VM); leaving only turns it off */
  function sheenOff() {
    var el = sheen.el;
    sheen.card = null; sheen.rect = null; sheen.el = null;
    if (!el) return;
    el.classList.remove('on');
  }
  function sheenMove() {
    sheen.raf = 0;
    if (!sheen.el || !sheen.card) return;
    if (!sheen.rect) sheen.rect = sheen.card.getBoundingClientRect();
    sheen.el.firstChild.style.transform = 'translate(' + (sheen.x - sheen.rect.left).toFixed(1) + 'px,' + (sheen.y - sheen.rect.top).toFixed(1) + 'px)';
  }
  function onSheen(e) {
    if (e.pointerType === 'touch') return;
    var card = gesture || reduced() ? null : (e.target.closest ? e.target.closest('.pmu-card') : null);
    if (card && (card.parentNode !== boardEl || isLeaving(card) || card.hasAttribute('data-pending') || card.getAttribute('data-head') === 'band')) card = null;
    if (card !== sheen.card) {
      sheenOff();
      if (card && PMU.theme.look().nier) card = null;
      if (card) {
        var el = card._pmuSheen;
        if (!el || el.parentNode !== card) {
          el = card._pmuSheen = document.createElement('i'); el.className = 'pmu-sheen'; el.setAttribute('aria-hidden', 'true'); el.appendChild(document.createElement('i'));
          card.insertBefore(el, card.firstChild);
        }
        sheen.card = card; sheen.el = el; sheen.x = e.clientX; sheen.y = e.clientY;
        /* the rect is read in the next frame's rAF, never in the pointer event (a read here forced the hover's style
           recalc into the event: 14 ms on the VM) */
        if (!sheen.raf) sheen.raf = requestAnimationFrame(function () { sheenMove(); if (sheen.el === el) el.classList.add('on'); });
        return;
      }
    }
    if (card) { sheen.x = e.clientX; sheen.y = e.clientY; if (!sheen.raf) sheen.raf = requestAnimationFrame(sheenMove); }
  }
  /* the listeners sit on the scroll pane: a room change swaps the board element (the old one leaves as the ghost) */
  if (boardEl && scroll) {
    scroll.addEventListener('pointermove', onSheen, { passive: true });
    scroll.addEventListener('pointerleave', sheenOff);
    scroll.addEventListener('scroll', function () { sheen.rect = null; }, { passive: true });
    scroll.addEventListener('pointerdown', onPointerDown);
    scroll.addEventListener('keydown', function (event) { if (boardEl.contains(event.target)) onKeyDown(event); });
    document.addEventListener('keydown', function (event) { if (gesture && event.key === 'Escape' && !gesture.kb) { event.preventDefault(); endGesture(gesture, 'escape'); } }, true);
    document.addEventListener('selectstart', function (event) { if (gesture && !gesture.kb) event.preventDefault(); }, true);
    scroll.addEventListener('dragstart', function (event) { if (event.target.closest && event.target.closest('.pmu-card')) event.preventDefault(); });
  }

  /* ---- API commits (size menu, keyboard-free callers, verifiers): same resolver, same motion ---- */
  function apiCommit(type, id, rect, source) {
    completeStream();
    flushGravity();
    var card = cardOf(id);
    var snap = snapshotNow(), me = snap.filter(function (r) { return r.id === id; })[0];
    if (!me) return null;
    var g = { id: id, card: card, type: type, kb: true, started: true, source: source || 'api', snapshot: snap, me: me, target: rect };
    if (sameRect(rect, me)) return null;
    g.preview = gravity(resolve(snap, id, rect), id, me, snap, current.cls.tracks);
    g.previewFinal = true;
    if (!card) {
      /* not on the board (another level): commit the layout without motion */
      var receipt = command(type === 'move' ? 'cmd.widget.move' : 'cmd.widget.resize', { room: current.room, widget_id: id, from: me, to: rect, board_class: current.cls.name, source: g.source }, type === 'move' ? { moved: true } : { resized: true });
      if (receipt.dispatch_accepted !== false) { saveLayout(current.room, g.preview); revisions[id] = (revisions[id] || 0) + 1; persist(); }
      return receipt;
    }
    if (gesture) endGesture(gesture, 'cancel', true);
    gesture = g; g.done = false;
    ensurePreviews();
    if (type === 'move') { card.setAttribute('data-lifted', ''); }
    slidePeers(toMap(g.preview), id);
    endGesture(g, 'drop');
    return g.receipt || null;
  }
  function move(id, to, source) {
    if (!current.mounted) return null;
    var me = layoutFor(current.room).filter(function (r) { return r.id === id; })[0]; if (!me) return null;
    var rect = { id: id, x: Math.max(0, Math.min(current.cls.tracks - me.w, to.x == null ? me.x : to.x)), y: Math.max(0, to.y == null ? me.y : to.y), w: me.w, h: me.h };
    return apiCommit('move', id, rect, source);
  }
  function resize(id, to, source) {
    if (!current.mounted) return null;
    var me = layoutFor(current.room).filter(function (r) { return r.id === id; })[0]; if (!me) return null;
    var ks = kindSpec(id), tracks = current.cls.tracks;
    var x = Math.max(0, to.x == null ? me.x : to.x);
    var wMax = Math.min(ks.wMax || tracks, tracks);
    var w = Math.max(Math.min(ks.wMin || 1, wMax), Math.min(wMax, to.w || me.w));
    if (x + w > tracks) x = Math.max(0, tracks - w);
    var rect = { id: id, x: x, y: Math.max(0, to.y == null ? me.y : to.y), w: w, h: Math.max(ks.hMin || 1, Math.min(ks.hMax || 40, to.h || me.h)) };
    return apiCommit('resize', id, rect, source);
  }
  function setVisible(id, visible) {
    ensure();
    completeStream();
    var room = current.room || st.room; st.hidden[room] = st.hidden[room] || {};
    if (visible) delete st.hidden[room][id]; else st.hidden[room][id] = true;
    /* WOW-SPEC 3.13 (gravity after a hide): the hidden panel is parked under the board (it returns there) and the cards
       below the freed region float up into it; the one command carries the peers that moved */
    var fin = null, movedPeers = [];
    if (!visible && current.mounted) {
      flushGravity();
      var rects0 = layoutFor(room), me0 = rects0.filter(function (r) { return r.id === id; })[0];
      if (me0) {
        var floor = rects0.reduce(function (m, r) { return r.id === id ? m : Math.max(m, r.y + r.h); }, 0);
        var parked = rects0.map(function (r) { return r.id === id ? { id: r.id, x: r.x, y: Math.max(floor, r.y), w: r.w, h: r.h } : r; });
        fin = gravity(parked, id, me0, rects0, current.cls.tracks);
        parkedFrom[room + '/' + current.cls.name + '/' + id] = { x: me0.x, y: me0.y, w: me0.w, h: me0.h };
        var b0 = toMap(rects0);
        movedPeers = fin.filter(function (r) { return r.id !== id && !sameRect(r, b0[r.id]); }).map(function (r) { return { widget_id: r.id, to: { x: r.x, y: r.y } }; });
      }
    }
    var payload = { room: room, widget_id: id };
    if (movedPeers.length) payload.moved_peers = movedPeers;
    var receipt = command(visible ? 'cmd.widget.add' : 'cmd.widget.remove', payload, { visible: !!visible });
    revisions[id] = (revisions[id] || 0) + 1;
    if (current.mounted) {
      var rects = layoutFor(room);
      if (fin && receipt.dispatch_accepted !== false) { saveLayout(room, fin); rects = fin; }
      if (visible) {
        /* a returning panel takes its rectangle (the one it had before it was hidden in this session, else its parked
           one); panels now in the way move down (the resolver) and the board then floats up (gravity) */
        var me = rects.filter(function (r) { return r.id === id; })[0];
        var back = parkedFrom[room + '/' + current.cls.name + '/' + id];
        if (me && back) {
          delete parkedFrom[room + '/' + current.cls.name + '/' + id];
          var snapB = rects.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
          var wantB = { id: id, x: Math.min(back.x, current.cls.tracks - me.w), y: back.y, w: me.w, h: me.h };
          rects = gravity(resolve(snapB, id, wantB), id, me, snapB, current.cls.tracks);
          saveLayout(room, rects);
          me = null;
        }
        var shown = visibleIds(room);
        if (me && rects.some(function (r) { return r.id !== id && shown.indexOf(r.id) >= 0 && overlaps(r, me); })) { rects = resolve(rects, id, me); saveLayout(room, rects); }
      }
      reconcile(rects, fin ? { dur: 250, ease: 'slide' } : {});
    }
    persist();
    if (PMU.shell) PMU.shell.render();
    return receipt;
  }
  function tidy() {
    if (!current.mounted) return [];
    completeStream();
    /* DESIGN-SPEC 6.1: compact every card upward, first-fit in reading order (x may change); the cards shown at this
       detail level go first so their holes close, the cards of other levels and hidden ones follow below them */
    var room = current.room, rects = layoutFor(room).slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    var shown = {}; visibleIds(room).forEach(function (id) { shown[id] = true; });
    var receipts = [];
    var front = firstFit(rects.filter(function (r) { return shown[r.id]; }), current.cls.tracks);
    var placed = front.concat(firstFitInto(front, rects.filter(function (r) { return !shown[r.id]; }), current.cls.tracks));
    var before = toMap(rects);
    placed.forEach(function (r) {
      var b = before[r.id];
      if (b.y !== r.y || b.x !== r.x) receipts.push(command('cmd.widget.move', { room: room, widget_id: r.id, from: { x: b.x, y: b.y }, to: { x: r.x, y: r.y }, board_class: current.cls.name, source: 'tidy' }, { moved: true }));
    });
    var accepted = placed;
    if (receipts.some(function (rc) { return rc.dispatch_accepted === false; })) { PMU.shell.toast(t('board.rejected')); return receipts; }
    if (receipts.length) {
      saveLayout(room, accepted);
      persist();
      /* Tidy (WOW-SPEC 3.13): every card glides to its first-fit place, 420 SETTLE, 16 ms apart in reading order */
      flushGravity();
      slidePeers(toMap(accepted), null, 420, 'settle', 16);
      PMU.shell.toast(t('toast.tidied'));
    }
    return receipts;
  }
  function reset(scope) {
    ensure();
    var receipt = command('cmd.widget.reset_layout', { scope: scope || 'room', room: current.room || st.room }, { reset: true });
    if (scope === 'all') { st.layout = {}; st.hidden = {}; configs = {}; }
    else {
      delete st.layout[current.room]; delete st.hidden[current.room];
      layoutFor(current.room).forEach(function (r) { delete configs[r.id]; });
    }
    persist();
    if (current.mounted) { reconcile(layoutFor(current.room), { dur: 'morph', ease: 'settle' }); refresh('reset'); }
    if (PMU.shell) PMU.shell.render();
    return receipt;
  }
  function config(id) { ensure(); return Object.assign({}, configs[id] || {}); }
  function setConfig(id, patch) {
    ensure();
    var c = configs[id] = Object.assign({}, configs[id] || {});
    Object.keys(patch || {}).forEach(function (k) { if (patch[k] == null || patch[k] === '') delete c[k]; else c[k] = patch[k]; });
    if (!Object.keys(c).length) delete configs[id];
    var receipt = command('cmd.widget.configure', { room: current.room, widget_id: id, configuration_refs: cfgRefs(c), source: 'gear' }, { configured: true });
    revisions[id] = (revisions[id] || 0) + 1;
    persist();
    var card = cardOf(id); if (card) PMU.cards.update(card, 'config');
    return receipt;
  }

  /* a board-class change after the board is mounted (WOW-TASKS E-2): never the instant remount (it killed running
     entrances): the cards take their rects in the new class with FLIP (260 SETTLE, added onto any entrance transform, so
     rolls, fills and draws keep running) and only the bodies whose tier changed render again */
  function reclass(prevCls) {
    completeStream();
    flushGravity();
    var room = current.room, rects = layoutFor(room), ids = visibleIds(room), byId = toMap(rects);
    var cards = cardsNow(), have = {};
    cards.forEach(function (c) { have[c.getAttribute('data-widget')] = true; });
    if (ids.some(function (id) { return !have[id]; }) || cards.some(function (c) { return !byId[c.getAttribute('data-widget')]; })) { mount(room, { instant: true }); return; }
    /* grid geometry, not layout reads (a read would include the entrance transforms the FLIP is added onto) */
    /* the old tracks have already stretched to the new width for a frame: that is where the cards are on screen */
    var p = padOf(), op = prevCls && prevCls.tracks ? (current.cls.W + GAP) / prevCls.tracks : current.cls.pitchX;
    var before = cards.map(function (c) { return { l: p.l + (+c.dataset.x) * op, t: p.t + (+c.dataset.y) * ROW }; });
    setBoardClass();
    cards.forEach(function (c) { place(c, byId[c.getAttribute('data-widget')]); });
    var hero = heroOf(rects, ids, room); cards.forEach(function (c) { markHero(c, hero); });
    if (!reduced()) {
      cards.forEach(function (c, i) {
        var a = before[i], b = px(rectOfCard(c)), dx = a.l - b.l, dy = a.t - b.t;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        PMU.motion.animate(c, [{ transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)' }, { transform: 'translate(0,0)' }],
          { dur: 260, easing: filmE('settle', 'cubic-bezier(.17,.84,.29,.99)'), composite: 'add' });
      });
    }
    tierPass(cards, false);
  }
  /* the board width decides the class (24 px hysteresis); within a class, bodies re-measure (debounced for dock drags) */
  var roTimer = 0;
  if (scroll && window.ResizeObserver) {
    var roPending = 0;
    new ResizeObserver(function (entries) {
      if (entries && entries[0] && entries[0].contentRect) {
        var cr = entries[0].contentRect;
        view.h = cr.height;
        if (Math.abs((view.w || 0) - cr.width) >= 0.5) { view.w = cr.width; view.wAt = performance.now(); }
      }
      if (roPending) return;
      roPending = requestAnimationFrame(function () {
        roPending = 0;
        var W = boardWidth(); if (W <= 0) return;
        if (current.pending || !current.mounted) { mount(current.room || st.room, PMU.film && PMU.film.holding() ? { held: true, onBuilt: PMU.film.rehold() } : {}); return; }
        var next = pickClass(W);
        if (!current.cls || next.name !== current.cls.name) {
          if (gesture) endGesture(gesture, 'cancel', true);
          var prev = current.cls ? current.cls.name : null, prevCls = current.cls;
          current.cls = next;
          /* while the first arrival holds the board, a class change rebuilds it held (never the instant remount that
             cancelled the entrance, MOTION-REVIEW-2 item 1) */
          if (PMU.film && PMU.film.holding()) mount(current.room, { held: true, onBuilt: PMU.film.rehold() });
          else reclass(prevCls);
          emit('class', { cls: next.name, from: prev });
          return;
        }
        current.cls = next;
        if (!gesture) cardsNow().forEach(function (c) { place(c, rectOfCard(c)); });
        if (PMU.film && PMU.film.holding()) return;   /* the held build measures each card in its own slice */
        clearTimeout(roTimer);
        roTimer = setTimeout(function () { if (!gesture) tierPass(cardsNow(), false); }, 120);
      });
    }).observe(scroll);
  }

  PMU.board = {
    init: ensure,
    CLASSES: CLASSES, STORE_KEY: STORE_KEY, get DEFAULT_SET() { return defaultSet(); }, ROW: ROW, GAP: GAP,
    cls: function () { return current.cls || pickClass(boardWidth()); },
    mount: mount, refresh: refresh, flushRefresh: flushRefresh, relevel: relevel, layout: function (room) { return layoutFor(room || current.room || st.room); },
    visible: function (room) { return visibleIds(room || current.room || st.room); },
    rect: function (id) { return layoutFor(current.room || st.room).filter(function (r) { return r.id === id; })[0] || null; },
    resolve: resolve, gravity: gravity, project: project, firstFit: firstFit, tierOf: tierOf, tierPass: tierPass, measure: measure,
    move: move, resize: resize, setVisible: setVisible, reset: reset, tidy: tidy, place: place, persist: persist,
    config: config, setConfig: setConfig, keyboard: keyboard,
    gesture: function () { return gesture ? { type: gesture.type, id: gesture.id, edge: gesture.edge || null, kb: !!gesture.kb, target: gesture.target, me: gesture.me } : null; },
    cancel: function () { if (gesture) endGesture(gesture, 'cancel'); },
    card: cardOf, inView: inView, viewNow: viewNow, isLeaving: isLeaving, cardsNow: cardsNow, refreshing: function () { return !!refreshQ; }, fitSliced: fitSliced,
    on: function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return function () { listeners[evt] = listeners[evt].filter(function (f) { return f !== fn; }); }; },
    envelope: function () { ensure(); var e = JSON.parse(JSON.stringify(envelope)); e.view = { room: st.room, detail: st.detail, range: st.range, scope: st.scope, more: !!st.more }; e.records = recordsNow(); return e; }
  };
})();
