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
  var GAP = 8, ROW = 30, HYST = 24, MOVE_THRESHOLD = 4, TARGET_HYST = 0.675, SCROLL_BAND = 48;
  var STORE_KEY = 'widget_layout:v1:usage';
  var DEFAULT_SET = 'pmu-b2-2026-10-02c';   /* c: the fixer's default boards (fill the first screen, Settings order in Accounts) */
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
    return { schema_id: 'pm.usage.widget_layout.v1', layout_schema_version: 1, default_set_version: DEFAULT_SET, host_id: 'usage', project_id: 'tastebook',
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
    var keepGeometry = env.default_set_version === DEFAULT_SET;
    if (!keepGeometry) {
      env.migration_receipt = { from: 'default_set_version ' + env.default_set_version, at: new Date().toISOString(), carried: ['view', 'visible', 'configuration_refs'], dropped: ['geometry'] };
      env.default_set_version = DEFAULT_SET;
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
  function cardOf(id) { return boardEl ? boardEl.querySelector('.pmu-card[data-widget="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]') : null; }
  function cardsNow() { return boardEl ? Array.prototype.slice.call(boardEl.querySelectorAll(':scope > .pmu-card')) : []; }
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
    reads.forEach(function (r) {
      if (!r.body) return;
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
  function readingOrder(cards) { return cards.slice().sort(function (a, b) { return (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); }); }
  /* the diagonal wave of the film core (WOW-SPEC 3.1 Phase B): 45 ms per top row, 25 ms per column, cap 640 */
  function setEntranceDelays(cards) {
    if (PMU.film && PMU.film.wave) { PMU.film.wave(cards, {}); return; }
    readingOrder(cards).forEach(function (card, rank) { card._pmuEnterDelay = reduced() || PMU.motion.paused() ? 0 : Math.min(480, 32 * rank); });
  }
  /* the held build (WOW-SPEC 3.1 Phase A): bodies render in reading order in slices of at most 8 ms per frame while the
     board is held (data-held: nothing visible), so the click and every frame stay short; each body's inner entrance is
     queued by PMU.film.cue and released with the wave. A newer mount supersedes a running build. */
  var buildToken = 0;
  function buildSliced(cards, onBuilt) {
    var token = ++buildToken, queue = readingOrder(cards);
    function slice() {
      if (token !== buildToken) return;
      var t0 = performance.now();
      while (queue.length && performance.now() - t0 < 8) {
        var c = queue.shift();
        if (c.isConnected) tierPass([c], 'enter');
      }
      if (queue.length) { requestAnimationFrame(slice); return; }
      if (onBuilt) { try { onBuilt(cards); } catch (error) { console.error('[pm-usage] board built', error); } }
    }
    requestAnimationFrame(slice);
  }

  /* ---- mount (held build, release, entrance) and the room transition ---- */
  function exitBoard(dir) {
    var cards = cardsNow();
    if (!cards.length || reduced() || !stage) { cards.forEach(destroyCard); return; }
    var ghost = document.createElement('div');
    ghost.className = 'pmu-board-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.top = scroll.offsetTop + 'px'; ghost.style.left = scroll.offsetLeft + 'px';
    ghost.style.width = scroll.clientWidth + 'px'; ghost.style.height = scroll.clientHeight + 'px';
    var inner = document.createElement('div');
    inner.className = 'pmu-board';
    inner.setAttribute('data-cls', boardEl.getAttribute('data-cls') || '');
    inner.style.cssText = boardEl.style.cssText;
    inner.style.transform = 'translateY(' + (-scroll.scrollTop) + 'px)';
    cards.forEach(function (c) { inner.appendChild(c); });
    Array.prototype.slice.call(boardEl.children).forEach(function (n) { if (!n.classList.contains('pmu-landing') && !n.classList.contains('pmu-outline')) n.remove(); });
    ghost.appendChild(inner);
    stage.appendChild(ghost);
    var a = PMU.motion.animate(ghost, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(' + (-22 * (dir || 1)) + 'px)' }], { dur: 'exit', ease: 'in', fill: 'forwards' });
    var done = function () { cards.forEach(destroyCard); ghost.remove(); };
    if (a) a.onfinish = done; else done();
    setTimeout(function () { if (ghost.isConnected) done(); }, 400);
  }
  function destroyCard(card) {
    var body = card.querySelector('.pmu-cardbody');
    if (body && body._pmuKind && body._pmuKind.destroy) { try { body._pmuKind.destroy(body, body._pmuCtx); } catch (error) {} }
  }
  function ensurePreviews() {
    if (!landing || !landing.isConnected) { landing = document.createElement('div'); landing.className = 'pmu-landing'; landing.hidden = true; landing.setAttribute('aria-hidden', 'true'); }
    if (!outline || !outline.isConnected) {
      outline = document.createElement('div'); outline.className = 'pmu-outline'; outline.hidden = true; outline.setAttribute('aria-hidden', 'true');
      outline.innerHTML = '<span class="pmu-outline-label"><b class="pmu-ol-name"></b><span class="pmu-ol-size"></span><span class="pmu-ol-note"></span></span>';
    }
    if (landing.parentNode !== boardEl) boardEl.appendChild(landing);
    if (outline.parentNode !== boardEl) boardEl.appendChild(outline);
  }
  function mount(room, opts) {
    ensure();
    opts = opts || {};
    if (!boardEl || !scroll) return;
    if (gesture) endGesture(gesture, 'cancel', true);
    if (PMU.menu) PMU.menu.close();
    var W = boardWidth();
    if (W <= 0) { current.pending = true; current.room = room; return; }
    current.pending = false;
    var roomChanged = current.room !== room;
    var transition = !!opts.transition && current.mounted && roomChanged && !opts.instant;
    if (transition) exitBoard(opts.dir || 1);
    else cardsNow().forEach(destroyCard);
    current.cls = pickClass(W);
    current.room = room;
    var rects = layoutFor(room), ids = visibleIds(room);
    var byId = {}; rects.forEach(function (r) { byId[r.id] = r; });
    boardEl.setAttribute('data-held', '');
    boardEl.setAttribute('data-room', room);
    boardEl.setAttribute('data-cls', current.cls.name);
    boardEl.style.setProperty('--pmu-tracks', current.cls.tracks);
    boardEl.removeAttribute('data-op');
    var app = document.getElementById('pmuApp'); if (app) app.setAttribute('data-cls', current.cls.name);
    boardEl.textContent = '';
    if (roomChanged) scroll.scrollTop = 0;
    var cards = ids.map(function (id) { var card = PMU.cards.build(id, room, byId[id]); boardEl.appendChild(card); return card; });
    ensurePreviews();
    if (!cards.length) boardEl.appendChild(PMU.cards.empty(room));
    if (opts.held && !reduced()) {
      /* the first arrival: chrome now, bodies in slices, PMU.film releases the board (data-held stays until then) */
      buildToken++;
      setEntranceDelays(cards);
      current.mounted = true;
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
    PMU.motion.release(boardEl);
    if (entering) PMU.motion.enter(readingOrder(cards), { base: transition ? 16 : 0, dir: transition ? (opts.dir || 1) : 0 });
    emit('mount', { room: room, cls: current.cls.name, widgets: ids });
  }
  function refresh(reason) {
    if (!current.mounted) return;
    PMU.cards.updateAll(cardsNow(), reason);
  }
  /* reconcile the board to a layout: leaving cards fade, staying cards slide (FLIP), new cards enter (B v2 8.2) */
  function reconcile(rects, opts) {
    opts = opts || {};
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
  function slidePeers(map, exceptId, durName, easeName) {
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
    moves.forEach(function (m) {
      var c = m.c;
      if (Math.abs(m.dx) < 0.5 && Math.abs(m.dy) < 0.5) { c._pmuSlideFrom = null; return; }
      c._pmuSlideFrom = { x: m.dx, y: m.dy };
      c._pmuSlide = PMU.motion.animate(c, [{ transform: 'translate(' + m.dx + 'px,' + m.dy + 'px)' }, { transform: 'translate(0,0)' }], { dur: durName || 'slide', ease: easeName || 'slide' });
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
  function liftScale() { var f = PMU.motion.family(); return f === 'glass' ? 1.04 : f === 'friendly' ? 1.035 : f === 'retro' || f === 'nier' ? 1 : 1.03; }
  function frameMove(g) {
    var now = performance.now();
    var dx = g.px - g.sx + (scroll.scrollLeft - g.scrollL), dy = g.py - g.sy + (scroll.scrollTop - g.scrollT);
    var k = reduced() ? 1 : Math.min(1, (now - g.liftAt) / (140 * speed()));
    var s = 1 + (liftScale() - 1) * (1 - Math.pow(1 - k, 3));
    var tilt = PMU.motion.family() === 'friendly' ? ' rotate(' + (-0.6 * k).toFixed(3) + 'deg)' : '';
    var tr = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')' + tilt;
    if (g.lastTr !== tr) { g.card.style.transform = tr; g.lastTr = tr; }
    g.dx = dx; g.dy = dy; g.s = s;
    /* the target slot is the cell under the card's top-left anchor, with 35 % of a pitch of hysteresis across the boundary */
    var cls = current.cls, rawX = (g.cardL + dx - g.pad.l) / cls.pitchX, rawY = (g.cardT + dy - g.pad.t) / ROW;
    var nx = g.target.x, ny = g.target.y;
    if (Math.abs(rawX - g.target.x) >= TARGET_HYST) nx = Math.max(0, Math.min(cls.tracks - g.me.w, Math.round(rawX)));
    if (Math.abs(rawY - g.target.y) >= TARGET_HYST) ny = Math.max(0, Math.min(g.maxY, Math.round(rawY)));
    if (nx !== g.target.x || ny !== g.target.y) {
      g.target = { id: g.id, x: nx, y: ny, w: g.me.w, h: g.me.h };
      previewTo(g, g.target);
    }
  }
  function previewTo(g, rect) {
    g.preview = resolve(g.snapshot, g.id, rect);
    var map = toMap(g.preview);
    if (g.type === 'move') glide(landing, rect, 'landing'); else showOutline(g, rect);
    slidePeers(map, g.id);
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
      var peers = g.preview.filter(function (r) { return r.id !== g.id && !sameRect(r, snapMap[r.id]); });
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
      saveLayout(current.room, g.preview);
      revisions[g.id] = (revisions[g.id] || 0) + 1;
      persist();
      if (g.type === 'move') settleMove(g, instant); else morphResize(g, instant);
      hidePreview(g.type === 'move' ? landing : outline);
      say(g.type === 'move' ? t('board.moved', { x: g.target.x + 1, y: g.target.y + 1 }) : t('board.resized', { name: sizeLabel(g.id, g.target).name || 'custom size', w: g.target.w, h: g.target.h }));
      emit('commit', { op: g.type, id: g.id, rect: g.target, receipt: receipt });
    } else {
      /* cancel, rejection or no change: everything glides back to the snapshot; no command, no write */
      if (g.type === 'move') settleMove(g, instant, true); else { card.removeAttribute('data-resizing'); }
      slidePeers(toMap(g.snapshot), g.id, how === 'drop' ? 'settle' : 'cancel', how === 'drop' ? 'settle' : 'cancel');
      hidePreview(g.type === 'move' ? landing : outline);
      if (how === 'rejected') PMU.shell.toast(t('board.rejected'));
      if (how !== 'drop') { say(t('board.cancelled', { name: cardTitle(g.id) })); emit('cancel', { op: g.type, id: g.id, reason: how }); }
    }
    if (g.kb && card.isConnected) card.focus({ preventScroll: true });
    if (!g.kb && g.started) suppressClick();
  }
  function settleMove(g, instant, back) {
    var card = g.card;
    var cur = card.style.transform;
    var from = px(g.me), to = px(back ? g.me : g.target);
    var dx = g.dx || 0, dy = g.dy || 0, s = g.s || (g.kb && g.type === 'move' ? liftScale() : 1);
    card.style.transform = '';
    card.removeAttribute('data-lifted');
    if (!back) place(card, g.target);
    if (instant || reduced()) return;
    var tx = from.l + dx - to.l, ty = from.t + dy - to.t;
    if (Math.abs(tx) < 0.5 && Math.abs(ty) < 0.5 && Math.abs(s - 1) < 0.002) return;
    card.setAttribute('data-settling', '');
    card._pmuSettle = PMU.motion.animate(card, [{ transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')' + (/rotate/.test(cur) ? ' rotate(-0.6deg)' : '') }, { transform: 'none' }],
      { dur: back ? 'cancel' : 'settle', ease: back ? 'cancel' : 'settle' });
    var clear = function () { card.removeAttribute('data-settling'); card._pmuSettle = null; };
    if (card._pmuSettle) card._pmuSettle.onfinish = clear; else clear();
  }
  /* DESIGN-SPEC 8.6: the card takes its new placement; a surface (.pmu-morph) scales from the old rect to the new one
     while the card's own surface is transparent and its content fades in at the new tier between 40 % and 100 % */
  function morphResize(g, instant) {
    var card = g.card;
    var o = px(g.me), n = px(g.target);
    var old = { l: o.l, t: o.t, w: o.w, h: o.h }, now = { l: n.l, t: n.t, w: n.w, h: n.h };
    card.removeAttribute('data-resizing');
    place(card, g.target);
    if (instant || reduced()) { tierPass([card], true); return; }
    /* the body re-renders at its new tier on the next frame, while the morph (compositor transform) already runs */
    requestAnimationFrame(function () { if (card.isConnected) tierPass([card], true); });
    if (!now.w || !now.h) return;
    var m = document.createElement('div');
    m.className = 'pmu-morph';
    m.setAttribute('aria-hidden', 'true');
    m.style.left = old.l + 'px'; m.style.top = old.t + 'px'; m.style.width = old.w + 'px'; m.style.height = old.h + 'px';
    boardEl.appendChild(m);
    card.setAttribute('data-morphing', '');
    var a = PMU.motion.animate(m, [{ transform: 'translate(0,0) scale(1,1)' }, { transform: 'translate(' + (now.l - old.l) + 'px,' + (now.t - old.t) + 'px) scale(' + (now.w / old.w) + ',' + (now.h / old.h) + ')' }],
      { dur: 'morphSize', ease: 'settle', fill: 'forwards' });
    Array.prototype.forEach.call(card.querySelectorAll(':scope > .pmu-cardhead, :scope > .pmu-cardbody'), function (part) {
      PMU.motion.animate(part, [{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], { dur: 'morphSize', easing: 'linear' });
    });
    var done = function () { m.remove(); card.removeAttribute('data-morphing'); };
    if (a) a.onfinish = done; else done();
    setTimeout(function () { if (m.isConnected) done(); }, 600 * speed());
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
    if (!card || card.parentNode !== boardEl || card.hasAttribute('data-leaving')) return;
    var handle = event.target.closest('.pmu-h');
    var g = { id: card.getAttribute('data-widget'), card: card, pointerId: event.pointerId, sx: event.clientX, sy: event.clientY, px: event.clientX, py: event.clientY, started: false };
    g.onMove = function (e) { if (e.pointerId !== g.pointerId) return; g.px = e.clientX; g.py = e.clientY;
      if (!g.started && Math.hypot(g.px - g.sx, g.py - g.sy) >= MOVE_THRESHOLD) { g.started = true; if (!beginGesture(g)) return; capture(g, card); }
      if (g.started) e.preventDefault(); };
    g.onUp = function (e) { if (e.pointerId !== g.pointerId) return; g.px = e.clientX; g.py = e.clientY;
      if (!g.started) { detach(g); return; }
      if (gesture === g) { if (g.type === 'move') frameMove(g); else frameResize(g); }
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
  if (boardEl) {
    boardEl.addEventListener('pointerdown', onPointerDown);
    boardEl.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', function (event) { if (gesture && event.key === 'Escape' && !gesture.kb) { event.preventDefault(); endGesture(gesture, 'escape'); } }, true);
    document.addEventListener('selectstart', function (event) { if (gesture && !gesture.kb) event.preventDefault(); }, true);
    boardEl.addEventListener('dragstart', function (event) { if (event.target.closest && event.target.closest('.pmu-card')) event.preventDefault(); });
  }

  /* ---- API commits (size menu, keyboard-free callers, verifiers): same resolver, same motion ---- */
  function apiCommit(type, id, rect, source) {
    var card = cardOf(id);
    var snap = snapshotNow(), me = snap.filter(function (r) { return r.id === id; })[0];
    if (!me) return null;
    var g = { id: id, card: card, type: type, kb: true, started: true, source: source || 'api', snapshot: snap, me: me, target: rect };
    if (sameRect(rect, me)) return null;
    g.preview = resolve(snap, id, rect);
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
    var room = current.room || st.room; st.hidden[room] = st.hidden[room] || {};
    if (visible) delete st.hidden[room][id]; else st.hidden[room][id] = true;
    var receipt = command(visible ? 'cmd.widget.add' : 'cmd.widget.remove', { room: room, widget_id: id }, { visible: !!visible });
    revisions[id] = (revisions[id] || 0) + 1;
    if (current.mounted) {
      var rects = layoutFor(room);
      if (visible) {
        /* a returning panel takes its rectangle; panels now in the way move down (the resolver) */
        var me = rects.filter(function (r) { return r.id === id; })[0];
        var shown = visibleIds(room);
        if (me && rects.some(function (r) { return r.id !== id && shown.indexOf(r.id) >= 0 && overlaps(r, me); })) { rects = resolve(rects, id, me); saveLayout(room, rects); }
      }
      reconcile(rects);
    }
    persist();
    if (PMU.shell) PMU.shell.render();
    return receipt;
  }
  function tidy() {
    if (!current.mounted) return [];
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
      reconcile(accepted, { dur: 'slide', ease: 'settle' });
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

  /* the board width decides the class (24 px hysteresis); within a class, bodies re-measure (debounced for dock drags) */
  var roTimer = 0;
  if (scroll && window.ResizeObserver) {
    var roPending = 0;
    new ResizeObserver(function () {
      if (roPending) return;
      roPending = requestAnimationFrame(function () {
        roPending = 0;
        var W = boardWidth(); if (W <= 0) return;
        if (current.pending || !current.mounted) { mount(current.room || st.room, PMU.film && PMU.film.holding() ? { held: true, onBuilt: PMU.film.rehold() } : {}); return; }
        var next = pickClass(W);
        if (!current.cls || next.name !== current.cls.name) {
          if (gesture) endGesture(gesture, 'cancel', true);
          var prev = current.cls ? current.cls.name : null;
          current.cls = next;
          /* while the first arrival holds the board, a class change rebuilds it held (never the instant remount that
             cancelled the entrance, MOTION-REVIEW-2 item 1) */
          if (PMU.film && PMU.film.holding()) mount(current.room, { held: true, onBuilt: PMU.film.rehold() });
          else mount(current.room, { instant: true });
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
    CLASSES: CLASSES, STORE_KEY: STORE_KEY, DEFAULT_SET: DEFAULT_SET, ROW: ROW, GAP: GAP,
    cls: function () { return current.cls || pickClass(boardWidth()); },
    mount: mount, refresh: refresh, relevel: relevel, layout: function (room) { return layoutFor(room || current.room || st.room); },
    visible: function (room) { return visibleIds(room || current.room || st.room); },
    rect: function (id) { return layoutFor(current.room || st.room).filter(function (r) { return r.id === id; })[0] || null; },
    resolve: resolve, project: project, firstFit: firstFit, tierOf: tierOf, tierPass: tierPass, measure: measure,
    move: move, resize: resize, setVisible: setVisible, reset: reset, tidy: tidy, place: place, persist: persist,
    config: config, setConfig: setConfig, keyboard: keyboard,
    gesture: function () { return gesture ? { type: gesture.type, id: gesture.id, edge: gesture.edge || null, kb: !!gesture.kb, target: gesture.target, me: gesture.me } : null; },
    cancel: function () { if (gesture) endGesture(gesture, 'cancel'); },
    card: cardOf,
    on: function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return function () { listeners[evt] = listeners[evt].filter(function (f) { return f !== fn; }); }; },
    envelope: function () { ensure(); var e = JSON.parse(JSON.stringify(envelope)); e.view = { room: st.room, detail: st.detail, range: st.range, scope: st.scope, more: !!st.more }; e.records = recordsNow(); return e; }
  };
})();
