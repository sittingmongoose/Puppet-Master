/* The board engine (owner: engine; ARCHITECTURE.md section 4.8, DESIGN-SPEC sections 2, 5 and 6).
   Explicit placement on 12 / 20 / 24 / 30 tracks chosen from the measured board width, the only-obstructed-peers
   resolver, the layout store (widget_layout:v1:usage, v12 migrated once), held build + release, the tier pass.
   Skeleton: classes, defaults, projection, resolver, mount, tier pass, persistence and the move / resize commits are
   working; the pointer and keyboard gestures with their previews (DESIGN-SPEC 6.2-6.4) are the engine builder's. */
(function () {
  var CLASSES = [{ name: 'S', tracks: 12, min: 0 }, { name: 'M', tracks: 20, min: 820 }, { name: 'L', tracks: 24, min: 1100 }, { name: 'XL', tracks: 30, min: 1460 }];
  var GAP = 8, ROW = 30, HYST = 24;
  var STORE_KEY = 'widget_layout:v1:usage';
  var DEFAULT_SET = 'pmu-b2-2026-10-02';
  var LEVEL_RANK = { glance: 0, detailed: 1, diagnostics: 2 };
  var st = PMU.core.state;
  var scroll = document.getElementById('pmuScroll');
  var boardEl = document.getElementById('pmuBoard');
  var current = { cls: null, room: null, mounted: false, pending: false };
  var listeners = {};

  function emit(evt, detail) { (listeners[evt] || []).slice().forEach(function (fn) { try { fn(detail); } catch (error) { console.error('[pm-usage] board ' + evt, error); } }); }
  function boardWidth() {
    if (!scroll) return 0;
    var cs = getComputedStyle(boardEl || scroll);
    return Math.max(0, (boardEl || scroll).clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0));
  }
  function pickClass(W) {
    var prev = current.cls, pick = CLASSES[0];
    CLASSES.forEach(function (c) {
      var min = c.min;
      if (prev && c.min > 0 && CLASSES.indexOf(c) <= CLASSES.indexOf(prev)) min = c.min - HYST;  /* leave a class downward only 24 px below */
      if (W >= min) pick = c;
    });
    var pitch = (W + GAP) / pick.tracks;
    return { name: pick.name, tracks: pick.tracks, pitchX: pitch, W: W, def: pick };
  }

  /* ---- layout store (DESIGN-SPEC 6.6) ---- */
  function loadEnvelope() {
    var env = STORE.get(STORE_KEY, null);
    if (env && env.schema_id === 'pm.usage.widget_layout.v1' && env.default_set_version === DEFAULT_SET) return env;
    if (env) { STORE.set(STORE_KEY + ':quarantine', env); }
    var old = STORE.get(WORKSPACE_KEY, null) || STORE.get(PRIOR_WORKSPACE_KEY, null);
    var view = { room: 'overview', detail: 'glance', range: '24h', scope: 'all', more: false }, hidden = {};
    var receipt = null;
    if (old && typeof old === 'object') {
      ['room', 'detail', 'range', 'scope', 'more'].forEach(function (k) { if (old[k] !== undefined) view[k] = old[k]; });
      Object.keys(old.hidden || {}).forEach(function (room) {
        Object.keys(old.hidden[room] || {}).forEach(function (id) {
          var to = (PMU_BOARDS.migrate || {})[id] || id;
          (hidden[room] = hidden[room] || {})[to] = true;
        });
      });
      receipt = { from: STORE.get(WORKSPACE_KEY, null) ? WORKSPACE_KEY : PRIOR_WORKSPACE_KEY, at: new Date().toISOString(),
        carried: ['room', 'detail', 'range', 'scope', 'more', 'hidden'], dropped: ['layout', 'order'] };
    }
    env = { schema_id: 'pm.usage.widget_layout.v1', layout_schema_version: 1, default_set_version: DEFAULT_SET, host_id: 'usage',
      project_id: null, view: view, hidden: hidden, layouts: {}, records: [], migration_receipt: receipt };
    STORE.set(STORE_KEY, env);
    return env;
  }
  var envelope = loadEnvelope();
  if (ROOM[envelope.view.room]) st.room = envelope.view.room;
  if (DETAIL[envelope.view.detail]) st.detail = envelope.view.detail;
  if (['5h', '24h', '7d', '30d'].indexOf(envelope.view.range) >= 0) st.range = envelope.view.range;
  if (typeof envelope.view.scope === 'string') st.scope = envelope.view.scope;
  st.hidden = envelope.hidden || {};
  st.layout = envelope.layouts || {};
  var saveTimer = 0;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      envelope.view = { room: st.room, detail: st.detail, range: st.range, scope: st.scope, more: !!st.more };
      envelope.hidden = st.hidden; envelope.layouts = st.layout;
      STORE.set(STORE_KEY, envelope);
    }, 400);
  }

  /* ---- defaults, projection, resolver ---- */
  function rectsOf(list) { return list.map(function (e) { return { id: e[0], x: e[1], y: e[2], w: e[3], h: e[4] }; }); }
  function firstFit(items, tracks) {
    var placed = [];
    items.forEach(function (it) {
      var w = Math.min(it.w, tracks), y = 0, x = null;
      while (x === null) {
        for (var cx = 0; cx + w <= tracks; cx++) {
          var free = placed.every(function (p) { return !(cx < p.x + p.w && p.x < cx + w && y < p.y + p.h && p.y < y + it.h); });
          if (free) { x = cx; break; }
        }
        if (x === null) y++;
      }
      placed.push({ id: it.id, x: x, y: y, w: w, h: it.h });
    });
    return placed;
  }
  function project(rects, tracks) {
    var sorted = rects.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    return firstFit(sorted, tracks);
  }
  function defaultsFor(room, cls) {
    var rooms = PMU_BOARDS.rooms[room] || {};
    if (rooms[cls.name]) return rectsOf(rooms[cls.name]);
    return project(rectsOf(rooms.L || rooms.M || rooms.S || []), cls.tracks);  /* XL projects from L */
  }
  function resolve(snapshot, activeId, rect) {
    var placed = [{ id: activeId, x: rect.x, y: rect.y, w: rect.w, h: rect.h }];
    snapshot.filter(function (r) { return r.id !== activeId; }).sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (r) {
      var c = { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }, moved = true;
      while (moved) {
        moved = false;
        placed.forEach(function (p) {
          if (c.x < p.x + p.w && p.x < c.x + c.w && c.y < p.y + p.h && p.y < c.y + c.h) { c.y = p.y + p.h; moved = true; }
        });
      }
      placed.push(c);
    });
    return placed;
  }
  function levelOf(id) { var w = PMU_BOARDS.widgets[id]; var def = PMU.widgets.get(id); return (def && def.level) || (w && w.level) || 'glance'; }
  function visibleIds(room) {
    var rank = LEVEL_RANK[st.detail] || 0, hidden = st.hidden[room] || {};
    return layoutFor(room).filter(function (r) { return (LEVEL_RANK[levelOf(r.id)] || 0) <= rank && !hidden[r.id]; }).map(function (r) { return r.id; });
  }
  function layoutFor(room) {
    var cls = current.cls || pickClass(boardWidth());
    var saved = st.layout[room] && st.layout[room][cls.name];
    var rects = saved ? saved.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; }) : defaultsFor(room, cls);
    if (room === 'accounts') rects = mergeRoster(rects, cls);
    return rects;
  }
  /* the Accounts room: one acct-<providerId> widget per Settings provider with accounts (ARCHITECTURE 4.8) */
  function mergeRoster(rects, cls) {
    var roster = PMU.roster && PMU.roster.read ? PMU.roster.read() : null;
    if (!roster || !roster.providers.length) return rects;
    var withAccounts = {}; roster.providers.forEach(function (p) { if (p.accounts.length) withAccounts['acct-' + p.id] = p; });
    var known = {}; Object.keys(PMU_BOARDS.widgets).forEach(function (id) { known[id] = true; });
    var kept = rects.filter(function (r) { return !/^acct-/.test(r.id) || !known[r.id] || PMU_BOARDS.widgets[r.id].kind !== 'provider' || withAccounts[r.id]; });
    var have = {}; kept.forEach(function (r) { have[r.id] = true; });
    var extra = Object.keys(withAccounts).filter(function (id) { return !have[id]; }).map(function (id) {
      var many = withAccounts[id].accounts.length > 1; return { id: id, w: Math.min(many ? 10 : 4, cls.tracks), h: many ? 8 : 6 };
    });
    if (!extra.length) return kept;
    return kept.concat(firstFit(kept.concat(extra), cls.tracks).filter(function (r) { return !have[r.id]; }));
  }

  /* ---- mount, tiers, refresh ---- */
  function tierOf(bw, bh) {
    return { w: bw < 168 ? 'xs' : bw < 248 ? 's' : bw < 360 ? 'm' : bw < 520 ? 'l' : 'xl',
      h: bh < 60 ? 'h0' : bh < 120 ? 'h1' : bh < 200 ? 'h2' : bh < 300 ? 'h3' : 'h4', bw: bw, bh: bh };
  }
  function tierPass(cards, force) {
    var reads = cards.map(function (card) { var body = card.querySelector('.pmu-cardbody'); return { card: card, body: body, bw: body ? body.clientWidth : 0, bh: body ? body.clientHeight : 0 }; });
    reads.forEach(function (r) {
      if (!r.body) return;
      var tier = tierOf(r.bw, r.bh);
      var changed = r.card.getAttribute('data-tw') !== tier.w || r.card.getAttribute('data-th') !== tier.h;
      if (changed) { r.card.setAttribute('data-tw', tier.w); r.card.setAttribute('data-th', tier.h); }
      if (changed || force) PMU.cards.renderBody(r.card, tier, force === 'enter');
    });
  }
  function mount(room, opts) {
    opts = opts || {};
    if (!boardEl || !scroll) return;
    var W = boardWidth();
    if (W <= 0) { current.pending = true; current.room = room; return; }
    current.pending = false;
    current.cls = pickClass(W);
    current.room = room;
    var rects = layoutFor(room), ids = visibleIds(room);
    var byId = {}; rects.forEach(function (r) { byId[r.id] = r; });
    boardEl.setAttribute('data-held', '');
    boardEl.setAttribute('data-room', room);
    boardEl.setAttribute('data-cls', current.cls.name);
    boardEl.style.setProperty('--pmu-tracks', current.cls.tracks);
    var app = document.getElementById('pmuApp'); if (app) app.setAttribute('data-cls', current.cls.name);
    boardEl.textContent = '';
    var cards = ids.map(function (id) {
      var card = PMU.cards.build(id, room, byId[id]);
      boardEl.appendChild(card);
      return card;
    });
    if (!cards.length) boardEl.appendChild(PMU.cards.empty(room));
    tierPass(cards, opts.instant || PMU.motion.reduced() ? true : 'enter');
    current.mounted = true;
    PMU.motion.release(boardEl);
    if (!opts.instant) PMU.motion.enter(cards.slice().sort(function (a, b) { return (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); }));
    emit('mount', { room: room, cls: current.cls.name, widgets: ids });
  }
  function refresh(reason) {
    if (!current.mounted) return;
    PMU.cards.updateAll(Array.prototype.slice.call(boardEl.querySelectorAll('.pmu-card')), reason);
  }
  function place(card, r) {
    card.style.gridColumn = (r.x + 1) + ' / span ' + r.w;
    card.style.gridRow = (r.y + 1) + ' / span ' + r.h;
    card.dataset.x = r.x; card.dataset.y = r.y; card.dataset.w = r.w; card.dataset.h = r.h;
  }
  function commit(room, next) {
    st.layout[room] = st.layout[room] || {};
    st.layout[room][current.cls.name] = next.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
    var cards = Array.prototype.slice.call(boardEl.querySelectorAll('.pmu-card'));
    PMU.motion.flip(cards, function () {
      next.forEach(function (r) { var card = boardEl.querySelector('.pmu-card[data-widget="' + r.id + '"]'); if (card) place(card, r); });
    });
    tierPass(cards, false);
    persist();
  }
  function move(id, to, source) {
    var room = current.room, snap = layoutFor(room), me = snap.filter(function (r) { return r.id === id; })[0];
    if (!me || (me.x === to.x && me.y === to.y)) return null;
    var rect = { x: Math.max(0, Math.min(current.cls.tracks - me.w, to.x)), y: Math.max(0, to.y), w: me.w, h: me.h };
    var receipt = command('cmd.widget.move', { room: room, widget_id: id, from: { x: me.x, y: me.y }, to: { x: rect.x, y: rect.y }, board_class: current.cls.name, source: source || 'api' }, { moved: true });
    if (receipt.dispatch_accepted === false) return receipt;
    commit(room, resolve(snap, id, rect));
    emit('commit', { op: 'move', id: id, rect: rect });
    return receipt;
  }
  function resize(id, to, source) {
    var room = current.room, snap = layoutFor(room), me = snap.filter(function (r) { return r.id === id; })[0];
    if (!me) return null;
    var kind = (PMU_BOARDS.kinds[(PMU_BOARDS.widgets[id] || {}).kind] || { wMin: 3, wMax: null, hMin: 3, hMax: 16 });
    var x = Math.max(0, to.x === undefined ? me.x : to.x), w = Math.max(kind.wMin, Math.min(kind.wMax || current.cls.tracks, current.cls.tracks - x, to.w || me.w));
    var rect = { x: x, y: to.y === undefined ? me.y : to.y, w: w, h: Math.max(kind.hMin, Math.min(kind.hMax, to.h || me.h)) };
    if (rect.x === me.x && rect.y === me.y && rect.w === me.w && rect.h === me.h) return null;
    var receipt = command('cmd.widget.resize', { room: room, widget_id: id, from: { x: me.x, y: me.y, w: me.w, h: me.h }, to: rect, board_class: current.cls.name, source: source || 'api' }, { resized: true });
    if (receipt.dispatch_accepted === false) return receipt;
    commit(room, resolve(snap, id, rect));
    emit('commit', { op: 'resize', id: id, rect: rect });
    return receipt;
  }
  function setVisible(id, visible) {
    var room = current.room; st.hidden[room] = st.hidden[room] || {};
    if (visible) delete st.hidden[room][id]; else st.hidden[room][id] = true;
    var receipt = command(visible ? 'cmd.widget.add' : 'cmd.widget.remove', { room: room, widget_id: id }, { visible: !!visible });
    persist(); mount(room, { instant: true });
    return receipt;
  }
  function reset(scope) {
    var receipt = command('cmd.widget.reset_layout', { scope: scope || 'room', room: current.room }, { reset: true });
    if (scope === 'all') { st.layout = {}; st.hidden = {}; } else { delete st.layout[current.room]; delete st.hidden[current.room]; }
    persist(); mount(current.room, { instant: true });
    return receipt;
  }

  if (scroll && window.ResizeObserver) {
    var roPending = 0;
    new ResizeObserver(function () {
      if (roPending) return;
      roPending = requestAnimationFrame(function () {
        roPending = 0;
        var W = boardWidth(); if (W <= 0) return;
        if (current.pending || !current.mounted) { mount(current.room || st.room, {}); return; }
        var next = pickClass(W);
        if (!current.cls || next.name !== current.cls.name) { mount(current.room, { instant: true }); emit('class', { cls: next.name }); return; }
        current.cls = next;
        tierPass(Array.prototype.slice.call(boardEl.querySelectorAll('.pmu-card')), false);
      });
    }).observe(scroll);
  }

  PMU.board = {
    CLASSES: CLASSES, STORE_KEY: STORE_KEY, DEFAULT_SET: DEFAULT_SET,
    cls: function () { return current.cls || pickClass(boardWidth()); },
    mount: mount, refresh: refresh, layout: function (room) { return layoutFor(room || current.room || st.room); },
    visible: function (room) { return visibleIds(room || current.room || st.room); },
    resolve: resolve, project: project, firstFit: firstFit, tierOf: tierOf,
    move: move, resize: resize, setVisible: setVisible, reset: reset, place: place, persist: persist,
    card: function (id) { return boardEl ? boardEl.querySelector('.pmu-card[data-widget="' + id + '"]') : null; },
    on: function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return function () { listeners[evt] = listeners[evt].filter(function (f) { return f !== fn; }); }; },
    envelope: function () { return JSON.parse(JSON.stringify(envelope)); }
  };
})();
