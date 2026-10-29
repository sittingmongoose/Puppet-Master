/* The board engine (owner: engine; ARCHITECTURE.md section 4.8, DESIGN-SPEC sections 2, 5 and 6, DESIGN-SPEC-ATLAS 0.1).
   Explicit placement on 12 / 20 / 24 / 30 tracks chosen from the measured board width (24 px hysteresis); the
   only-obstructed-peers resolver; MOVE with a live preview (lift, 1:1 follow, landing placeholder in the exact target
   slot, obstructed peers sliding live and gliding back, zero-overshoot settle, Escape glides back); RESIZE with a live
   preview from every edge and corner (snapped outline with its size name and W x H, peers reflowing live, the morph on
   release); keyboard move and resize; edge auto-scroll; one cmd.widget.move / cmd.widget.resize per changed release;
   the layout store (widget_layout:v1:usage records, v12 migrated once, default_set_version); the held build, the room
   transition and the reading-order entrance; the tier pass.
   Per-instance boards (D10, D10-DESIGN-per-instance-boards.md sections 2 and 3): everything that belongs to one board
   lives in createBoard(opts), one closure per board; the pure geometry, the registry (PMU.boards) and the gesture's two
   document listeners stay at module level. PMU.board is the Usage page's instance, made at the end of this file from the
   same four elements, with the page state, the rooms, the v12 migration and the room film; a hosted board (a Home
   dashboard tab) builds its own DOM, keeps a private state with one fixed room (its id) and takes its width from its
   host (hostResize).
   D10 round two (Jared, 2026-10-10): widget sources (PMU.boards.sources, P3); Start from and the user's saved presets
   (board.sets, board.startFrom, PMU.boards.presets, P4); dashboard keys per project (board.setProject,
   PMU.boards.forgetKey, P5); live beats and Play the next hour on dashboards (PMU.boards.live, PMU.boards.hour, P12); a
   new dash-<n> starts empty (P13). The Usage board takes none of these paths. Then (2026-10-10): the pick-up draws its
   first held frame in the threshold's own frame (beginGesture, prep, setOpFlags, the pressed plate's warm layer), a
   dashboard lights a beat's lead in its own layer and tells its kind ('beat'), and Start from and a project change
   forget the board's size picks. Then (2026-10-11): the lift's paint lands in one frame at scale 1 and the lifted plate
   never repaints while scaled (frameMove, 20-board.css), the first drag's pre-warm (prewarm: the lifted plate's marks
   drawn once at the lift's scale, invisibly, at idle), and a dashboard's committed layout revision with the Undo after
   Start from and Reset widgets (revision, restoreWhy, restoreRevision: one cmd.widget.reset_layout with
   restore_revision, the lead's ruling of 2026-10-11). */
(function () {
  /* (lane c-presets, agent 5) M from 880 px, not 820: at 820 a 20-track board's pitch was 41.4 px and the M default
     boards, authored at the 46.9 px pitch of the 929 px board (1920 with a 480 px chat), clipped and wrapped names letter
     by letter; a 1920 window with a 600 px chat (809 px board) also came out S or M depending on the width it came from
     (hysteresis). From 880 px M never runs under 43.2 px (with the hysteresis), and every look's 1920 board stays M
     (Glass, with its wider rail, is 890 px); 820 to 880 px boards are S at 69 to 74 px tracks, close to the 767 px panel
     the S boards were designed for (BOARDS.md). */
  var CLASSES = [{ name: 'S', tracks: 12, min: 0 }, { name: 'M', tracks: 20, min: 880 }, { name: 'L', tracks: 24, min: 1100 }, { name: 'XL', tracks: 30, min: 1460 }];
  var GAP = 8, ROW = 30, HYST = 24, MOVE_THRESHOLD = 4, TARGET_HYST = 0.75, SCROLL_BAND = 48;
  var STORE_KEY = 'widget_layout:v1:usage';
  /* the default set follows the generated boards (tools/boards.py writes PMU_BOARDS.version): a saved layout from an
     older set keeps its view and visibility and resets its geometry once (62-boards-data.js loads after this file, so it is
     read when the store is, never at load) */
  function defaultSet() { return 'pmu-b2:' + ((typeof PMU_BOARDS !== 'undefined' && PMU_BOARDS && PMU_BOARDS.version) || '2026-10-02c'); }
  var LEVEL_RANK = { glance: 0, detailed: 1, diagnostics: 2 };

  function speed() { return PMU.motion.speed(); }
  function reduced() { return PMU.motion.reduced(); }
  function kindSpec(id) { var d = PMU.widgets.get(id); return (d && PMU_BOARDS.kinds[d.kind]) || { wMin: 3, wMax: null, hMin: 3, hMax: 16, presets: [] }; }

  /* ---- layout store (DESIGN-SPEC 6.6): one envelope, records per widget, geometry per board class edited ---- */
  function geoStr(r) { return r.x + ',' + r.y + ',' + r.w + ',' + r.h; }
  function geoMap(g) { var out = {}; Object.keys(g || {}).forEach(function (cls) { var r = parseGeo(g[cls]); if (r) out[cls] = r; }); return out; }
  /* a stored rect is read in the grid's bounds, as a saved preset's rows are (presetSet: x 0-29, y 0-4000, w 1-30, h 1-40,
     whole tracks): a record with h 1e9 made firstFitInto and gravity step down row by row for good (review 2026-10-10);
     a value that is not a finite number of 0 or more drops the rect, as before */
  function parseGeo(s) {
    var p = String(s || '').split(',').map(Number);
    if (p.length !== 4 || !p.every(function (n) { return isFinite(n) && n >= 0; })) return null;
    var at = function (n, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(n))); };
    return { x: at(p[0], 0, 29), y: at(p[1], 0, 4000), w: at(p[2], 1, 30), h: at(p[3], 1, 40) };
  }
  /* a dashboard envelope's committed_revision: a whole number of 0 or more (absent in an envelope written before it: 0) */
  function revOf(env) { var n = env ? Number(env.committed_revision) : 0; return isFinite(n) && n >= 0 ? Math.min(Math.floor(n), 1e9) : 0; }
  function cfgRefs(cfg) { return Object.keys(cfg || {}).filter(function (k) { return cfg[k] != null && cfg[k] !== ''; }).map(function (k) { return k + '=' + cfg[k]; }); }
  function parseRefs(list) { var out = {}; (list || []).forEach(function (s) { var i = String(s).indexOf('='); if (i > 0) out[s.slice(0, i)] = s.slice(i + 1); }); return out; }

  /* ---- defaults, projection, resolver (pure: every board shares them) ---- */
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
      /* the provider presets' widths (lane c-presets): Standard for a group, Compact for one account */
      var many = withAccounts[id].accounts.length > 1; return { id: id, w: Math.min(many ? 12 : 6, cls.tracks), h: many ? 14 : 7 };
    });
    if (!extra.length) return kept;
    return kept.concat(firstFitInto(kept, extra, cls.tracks));
  }
  function toMap(list) { var m = {}; list.forEach(function (r) { m[r.id] = r; }); return m; }
  function sameRect(a, b) { return a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h; }

  /* ---- cards: the parts that read no board ---- */
  /* a card of the old room is leaving: data-leaving, or (without a GPU) only the _pmuLeaving flag, since the attribute's
     z-index change repainted the whole old board in the click's frame (50 ms of raster, a 48 ms software draw, PERF-3) */
  function isLeaving(c) { return !!c._pmuLeaving || c.hasAttribute('data-leaving'); }
  function gridPlace(el, r) {
    var col = (r.x + 1) + ' / span ' + r.w, row = (r.y + 1) + ' / span ' + r.h;
    if (el.style.gridColumn !== col) el.style.gridColumn = col;
    if (el.style.gridRow !== row) el.style.gridRow = row;
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
  function readingOrder(cards) { return cards.slice().sort(function (a, b) { return (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); }); }
  /* the diagonal wave of the film core (WOW-SPEC 3.1 Phase B): 45 ms per top row, 25 ms per column, cap 640 (no moment
     needed, so a board without the room film enters on it too) */
  function setEntranceDelays(cards) {
    if (PMU.film && PMU.film.wave) { PMU.film.wave(cards, {}); return; }
    readingOrder(cards).forEach(function (card, rank) { card._pmuEnterDelay = reduced() || PMU.motion.paused() ? 0 : Math.min(480, 32 * rank); });
  }
  /* integ3: the off-screen bodies built after a moment (no-GPU profile) go one batch per IDLE period, not per frame: they
     are not motion and nothing waits for them (a scroll or a gesture builds them at once); a frame callback per card made
     the census read Usage frame work in the settled board (HARD USAGE-RAF on Cache at 1440) */
  function lateNext(fn) { if (window.requestIdleCallback) requestIdleCallback(function () { fn(); }, { timeout: 400 }); else setTimeout(fn, 16); }
  /* a build or refresh slice runs with the content fit pass deferred to the slice's end (one batched read for the cards of
     the slice, inside the slice; NOTES3-content E1, NOTES3-perf C1/Q6), never as a microtask after it */
  function fitSliced(fn) {
    var C = PMU.content;
    if (!C || typeof C.fitSlice !== 'function') return fn();
    var was = C.fitDefer; C.fitDefer = true;
    try { return fn(); } finally { C.fitDefer = was; try { C.fitSlice(); } catch (error) { console.error('[pm-usage] fit slice', error); } }
  }
  function filmE(name, dflt) { return (PMU.film && PMU.film.E && PMU.film.E[name]) || dflt; }
  function softGpu() { return document.documentElement.hasAttribute('data-pmu-soft'); }
  function destroyCard(card) {
    var body = card.querySelector('.pmu-cardbody');
    if (body && body._pmuKind && body._pmuKind.destroy) { try { body._pmuKind.destroy(body, body._pmuCtx); } catch (error) {} }
  }
  function markHero(card, heroIds) { if ((heroIds || []).indexOf(card.getAttribute('data-widget')) >= 0) card.setAttribute('data-hero', ''); else card.removeAttribute('data-hero'); }
  /* ---- geometry without layout reads: the offset an in-flight FLIP still carries (its from-offset times 1 - eased
     progress) ---- */
  function inflight(el, key) {
    var a = el[key], from = el[key + 'From'];
    if (!a || !from) return { x: 0, y: 0, sx: 1, sy: 1 };
    var ct = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
    var p = a.playState === 'finished' ? 1 : ct && ct.progress != null ? ct.progress : 0;
    var k = 1 - p;
    return { x: from.x * k, y: from.y * k, sx: 1 + ((from.sx || 1) - 1) * k, sy: 1 + ((from.sy || 1) - 1) * k };
  }
  /* a preview element leaves: it fades out 140 and hides */
  function hidePreview(el) {
    if (!el || el.hidden || el._pmuHiding) return;
    if (el._pmuGlide) { el._pmuGlide.cancel(); el._pmuGlide = null; }
    el._pmuRect = null;
    var a = PMU.motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 140, ease: 'out', fill: 'forwards' });
    var done = function () { el.hidden = true; el._pmuHiding = null; if (a) a.cancel(); };
    if (a) { el._pmuHiding = a; a.onfinish = done; } else done();
  }
  /* the field PMH writes on a hovered plate (opus-5.5 18-hover.js setI / setPos), cleared from a plate as it lifts */
  var PMH_PROPS = ['--pmh-i', '--pmh-x', '--pmh-y', '--pmh-px', '--pmh-py', '--pmh-dx', '--pmh-dy'];
  function liftScale() { var f = PMU.motion.family(); return f === 'retro' || f === 'nier' ? 1 : 1.04; }
  /* the velocity tilt's limit per voice (WOW-SPEC 3.11): Basic 1deg, Glass 1.5, Friendly 2, Retro and NieR none */
  function tiltMax() { var f = PMU.motion.family(); return f === 'friendly' ? 2 : f === 'glass' ? 1.5 : f === 'retro' || f === 'nier' ? 0 : 1; }
  var liftEase = null;
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
  var suppressT = 0;
  function suppressClick() {
    var kill = function (event) { event.stopPropagation(); event.preventDefault(); window.removeEventListener('click', kill, true); };
    window.addEventListener('click', kill, true);
    clearTimeout(suppressT); suppressT = setTimeout(function () { window.removeEventListener('click', kill, true); }, 0);
  }
  function tracksOf(name) { var c = CLASSES.filter(function (x) { return x.name === name; })[0]; return c ? c.tracks : 12; }

  /* ---- the registry (D10 3.1): every board by id in creation order, the Usage board first; the ambient board of a
     synchronous call (run), the board that holds the one page-wide gesture (ACTIVE: its handle), the board whose gesture
     the body's pm-resizing is (RESIZING_BY: its handle; setOpFlags, opSync) and the data epoch that tells a hidden hosted
     board to refresh when it is shown again ---- */
  var REG = {}, ORDER = [], EACH = [], ambient = null, ACTIVE = null, RESIZING_BY = null, EPOCH = 0, LAYER = null, CATALOG = null, FORGET_WARNED = {};
  /* the first drag's pre-warm (createBoard prewarm): once per board, look and Reduce Motion state on the page (a board's
     own plates are what its first drag repaints: Home's dashboard warming at load left the Usage page's first drop cold,
     P1000 2026-10-11); ?pmu-prewarm=0 leaves it out (A/B measurements) */
  var PREWARM_OFF = /[?&]pmu-prewarm=0(?:&|#|$)/.test(location.search);
  /* the pre-warm is for a GPU: a software-rendered page has no programs to compile and would only raster the copy on the
     CPU. The page asks once, off the main thread, at load (O55.motion.softwareRendered: a worker's WebGL context; it reads
     false while it is still asking, and PMH asks it again at 2.5 and 6.5 s and marks html[data-pmh-soft]); the Usage page's
     own answer is html[data-pmu-soft], set once Usage shows. So the pre-warm waits until the page is 7 s old, when that
     answer is in, and runs only where neither mark is set and the answer is a GPU (a second WebGL context of our own, made
     and lost in a worker, left the next first drop cold on the P1000: 2026-10-11). null: not known yet. */
  function gpuNow() {
    var root = document.documentElement;
    if (/[?&]pmu-soft=1\b/.test(location.search) || root.hasAttribute('data-pmu-soft') || root.hasAttribute('data-pmh-soft')) return false;
    if (performance.now() < 7000) return null;
    try {
      if (window.O55 && O55.motion && typeof O55.motion.softwareRendered === 'function') return !O55.motion.softwareRendered();
      return typeof softwareRendered === 'function' ? !softwareRendered() : false;
    } catch (error) { return false; }
  }
  /* the carry frost (Jared, Glass carry option A, 2026-10-11): from a plate's press (or the pick-up of a keyboard move or
     a resize) until its drop, the peers' glides and the float-up are still, html[data-lg-frost="painted"] has Glass swap
     the live backdrop blur of every plate at rest for its painted frost (20-board.css), and pm7-liquid-glass's slab for
     its own. Page-wide holds, one per board, so one board's settle never clears another's carry; set in Glass with a GPU
     only, and removed only if this file set it. ?pmu-frost=0 leaves it out (A/B measurements). */
  var FROST_HOLDS = 0, FROST_SET = false, FROST_OFF = /[?&]pmu-frost=0(?:&|#|$)/.test(location.search);
  function frostHold(on) {
    var root = document.documentElement;
    FROST_HOLDS = Math.max(0, FROST_HOLDS + (on ? 1 : -1));
    if (FROST_HOLDS && !root.hasAttribute('data-lg-frost')) { root.setAttribute('data-lg-frost', 'painted'); FROST_SET = true; }
    else if (!FROST_HOLDS && FROST_SET) { FROST_SET = false; if (root.getAttribute('data-lg-frost') === 'painted') root.removeAttribute('data-lg-frost'); }
  }
  /* ids a hosted board may never take (D10 2.4): the Usage board's, the 13 Usage rooms' (05-data.js ROOM), the kind's own
     and 'dashboard' (the name of a Start-from set, never a board's: D10 P13) */
  var RESERVED = { usage: 1, layer: 1, agents: 1, current: 1, dashboard: 1 };
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function hostsTable() { return typeof PMU_BOARDS !== 'undefined' && PMU_BOARDS && PMU_BOARDS.hosts ? PMU_BOARDS.hosts : null; }
  /* a board's own default set (tools/boards.py HOSTS): home, metrics and monitoring have one; an id without one (a new
     dash-<n>) starts empty, and the 'dashboard' set is only offered in Start from (D10 P13) */
  function hostDefaults(id) { var H = hostsTable(); return H && id !== 'dashboard' && own(H, id) ? H[id] : null; }
  function hostSetVersion(id) { return 'pmu-host:' + (hostDefaults(id) && PMU_BOARDS.hosts_version ? PMU_BOARDS.hosts_version : 'none'); }

  /* ---- widget sources (D10 P3): a widget's source is its id. Usage's ids stay bare (the built-in source, prefix '');
     another source's widgets are '<prefix>:<id>', and the source registers its label, its catalog (catalog() -> [{ id,
     title, kind?, level?, w?, h?, ... }]) and optionally build(id, item) -> a widget definition for PMU.widgets.define,
     asked the first time one of its ids is added. Payloads and records carry the id as it is. ---- */
  var SOURCES = [{ prefix: '', label: 'Usage', builtin: true, catalog: null, build: null }], SRC = { '': SOURCES[0] };
  function registerSource(prefix, spec) {
    prefix = String(prefix == null ? '' : prefix); spec = spec || {};
    var why = !/^[a-z][a-z0-9-]{0,23}$/.test(prefix) ? 'malformed prefix' : typeof spec.catalog !== 'function' ? 'no catalog' : null;
    if (why) { console.error('[pm-usage] boards.sources.register refused (' + why + '): ' + prefix); return null; }
    var rec = { prefix: prefix, label: String(spec.label || prefix), builtin: false, catalog: spec.catalog, build: typeof spec.build === 'function' ? spec.build : null };
    /* registering a prefix again replaces its source (a module that reloads) */
    if (own(SRC, prefix)) SOURCES = SOURCES.map(function (s) { return s.prefix === prefix ? rec : s; }); else SOURCES.push(rec);
    SRC[prefix] = rec;
    return sourceOut(rec);
  }
  function sourceOut(s) { return s ? { prefix: s.prefix, label: s.label, builtin: s.builtin, catalog: s.catalog, build: s.build } : null; }
  /* the source of a widget id: the bare id's is Usage; '<prefix>:...' is that prefix's, null while it is not registered */
  function sourceOf(id) {
    var s = String(id == null ? '' : id), i = s.indexOf(':'), p = i < 0 ? '' : i > 0 ? s.slice(0, i) : null;
    return p != null && own(SRC, p) ? SRC[p] : null;
  }
  function usageId(id) { return String(id == null ? '' : id).indexOf(':') < 0; }
  /* a source's catalog items, each with its full id ('<prefix>:<id>'; an item given without the prefix gets it) */
  function sourceItems(s) {
    var items = [];
    try { items = s.catalog() || []; } catch (error) { console.error('[pm-usage] source catalog ' + s.prefix, error); items = []; }
    return items.filter(function (it) { return it && it.id != null; }).map(function (it) {
      var id = String(it.id); if (id.indexOf(s.prefix + ':') !== 0) id = s.prefix + ':' + id;
      return Object.assign({}, it, { id: id });
    });
  }
  function sourceItem(s, id) { return sourceItems(s).filter(function (it) { return it.id === id; })[0] || null; }

  /* ---- Start from (D10 P4): a set's rows per class, [[widget, x, y, w, h, preset?], ...] as tools/boards.py writes them.
     A Usage room's set is its default board (PMU_BOARDS.rooms, read only) without the group kind (an empty Accounts band
     a dashboard never holds), the rows below a dropped band floated up into its place ---- */
  function floatUp(rows) {
    var placed = [];
    rows.slice().sort(function (a, b) { return a[2] - b[2] || a[1] - b[1]; }).forEach(function (e) {
      var c = { id: e[0], x: e[1], y: e[2], w: e[3], h: e[4] };
      while (c.y > 0) { c.y--; if (placed.some(function (p) { return overlaps(c, p); })) { c.y++; break; } }
      placed.push(c); c.row = e.slice(); c.row[2] = c.y;
    });
    return placed.map(function (c) { return c.row; });
  }
  function roomRows(room) {
    var src = PMU_BOARDS.rooms[room] || {}, W = PMU_BOARDS.widgets || {}, out = {};
    Object.keys(src).forEach(function (cn) {
      var rows = (src[cn] || []).filter(function (e) { return !W[e[0]] || W[e[0]].kind !== 'group'; });
      out[cn] = rows.length < (src[cn] || []).length ? floatUp(rows) : rows.map(function (e) { return e.slice(); });
    });
    return out;
  }
  /* the preset id a set holds for each widget (HOSTS rows' sixth field, a saved preset's map): the board's class first */
  function rowPresets(rows, clsName) {
    var out = {};
    [clsName, 'L', 'M', 'S', 'XL'].forEach(function (cn) { (rows[cn] || []).forEach(function (e) { if (e[5] && !own(out, e[0])) out[e[0]] = e[5]; }); });
    return out;
  }
  function widgetCount(n) { return !n ? 'Empty' : n === 1 ? '1 widget' : n + ' widgets'; }

  /* ---- the user's saved presets (D10 P4): one store for the user, not per project (localStorage widget_presets:v1). A
     preset is a snapshot of a board's layout at every board class, its preset ids and configuration refs (never its view);
     it applies through board.startFrom('user:<id>') on any dashboard ---- */
  var PRESET_KEY = 'widget_presets:v1';
  function presetStore() {
    var s = STORE.get(PRESET_KEY, null);
    return s && typeof s === 'object' && Array.isArray(s.presets) ? s : { schema_id: 'pm.usage.widget_presets.v1', presets: [] };
  }
  /* a stored preset is read as presets.save writes it, and only so: an entry without a string id is skipped, a name that
     is not a string reads 'Saved preset', and its rows, preset ids and configuration refs keep only what has the saved
     shape (a corrupt or older store, review 2026-10-10: one preset with { L: 'x' } made sets() throw, so Start from lost
     every row, the board's own default and the rooms too, and a row whose size was not a number hung the page) */
  function presetOk(p) { return !!p && typeof p === 'object' && typeof p.id === 'string' && !!p.id; }
  function presetById(id) { return presetStore().presets.filter(function (p) { return presetOk(p) && p.id === id; })[0] || null; }
  function presetLabel(p) { return presetName(typeof p.name === 'string' ? p.name : '') || 'Saved preset'; }
  function presetOut(p) { return { id: p.id, name: presetLabel(p), created: typeof p.created === 'string' ? p.created : null, sourceBoard: typeof p.source_board === 'string' ? p.source_board : null }; }
  /* at most 80 characters, cut by code point (a cut by UTF-16 unit could leave half an emoji) */
  function presetName(name) { return Array.from(String(name == null ? '' : name).replace(/\s+/g, ' ').trim()).slice(0, 80).join(''); }
  /* a preset's set (setRows): its rows per board class ([widget, x, y, w, h] in the grid's bounds: x 0-29, y 0-4000, w 1-30,
     h 1-40; a row with a size that is not a number made firstFitInto loop for good, and the page hung on Start from), its
     preset id per widget (strings) and its configuration refs per widget (lists of strings) */
  function presetSet(p) {
    var L = p.layout && typeof p.layout === 'object' ? p.layout : {}, rows = {}, pids = {}, cfgs = {};
    var within = function (n, lo, hi) { return typeof n === 'number' && isFinite(n) && n >= lo && n <= hi; };
    CLASSES.forEach(function (c) {
      var list = (Array.isArray(L[c.name]) ? L[c.name] : []).filter(function (e) { return Array.isArray(e) && typeof e[0] === 'string' && e[0] && within(e[1], 0, 29) && within(e[2], 0, 4000) && within(e[3], 1, 30) && within(e[4], 1, 40); });
      if (list.length) rows[c.name] = list.map(function (e) { return [e[0], Math.round(e[1]), Math.round(e[2]), Math.round(e[3]), Math.round(e[4])]; });
    });
    if (p.presets && typeof p.presets === 'object') Object.keys(p.presets).forEach(function (id) { if (typeof p.presets[id] === 'string' && p.presets[id]) pids[id] = p.presets[id]; });
    if (p.configs && typeof p.configs === 'object') Object.keys(p.configs).forEach(function (id) { var v = p.configs[id]; if (Array.isArray(v)) cfgs[id] = v.filter(function (x) { return typeof x === 'string'; }); });
    return { rows: rows, presets: pids, configs: cfgs };
  }

  /* ---- board keys per project (D10 P5, dashboards only): widget_layout:v1:<project>:<board>; the Usage page keeps
     widget_layout:v1:usage. A board's unscoped key from before (widget_layout:v1:<board>) becomes the first project's that
     asks for it, once, and goes. ---- */
  var KEY_ROOT = 'widget_layout:v1:';
  function boardKey(boardId, projectId) { return KEY_ROOT + (projectId ? projectId + ':' : '') + boardId; }
  function projectOk(p) { return typeof p === 'string' && /^[^\s:]{1,64}$/.test(p); }
  function dropKey(key) { try { localStorage.removeItem(key); localStorage.removeItem(key + ':quarantine'); } catch (error) {} }
  function adoptKey(boardId, projectId) {
    var key = boardKey(boardId, projectId), old = boardKey(boardId, null), raw = null;
    try { if (localStorage.getItem(key) != null) return false; raw = localStorage.getItem(old); } catch (error) { return false; }
    if (raw == null) return false;
    var env = null; try { env = JSON.parse(raw); } catch (error) { env = null; }
    if (env && typeof env === 'object' && !Array.isArray(env)) { env.project_id = projectId; raw = JSON.stringify(env); }
    try { localStorage.setItem(key, raw); localStorage.removeItem(old); } catch (error) { return false; }
    return true;
  }

  /* ---- live beats on dashboards (D10 P12): the Usage page's match of a beat's share keys to a card (15-film.js flush):
     a reading inside it carries one of the keys, or its data-live names a prefix of one ---- */
  function cssq(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/"/g, '\\"'); }
  function liveHit(c, keys) {
    return keys.some(function (k) { return c.querySelector('[data-share="' + cssq(k) + '"], [data-share-v="' + cssq(k) + '"]'); })
      || (c.getAttribute('data-live') && keys.some(function (k) { return c.getAttribute('data-live').split(' ').some(function (pre) { return pre && k.indexOf(pre) === 0; }); }));
  }
  /* every Usage widget the catalog offers, in the Usage rooms' order (05-data.js ROOM) and each room's reading order; a
     widget's home room is the first room it is placed in. The group kind (an empty band) is never offered. */
  function catalogIds() {
    if (CATALOG) return CATALOG;
    var out = [], seen = {}, W = PMU_BOARDS.widgets || {};
    var push = function (id, room) { if (seen[id] || !W[id] || W[id].kind === 'group') return; seen[id] = true; out.push({ id: id, room: room }); };
    Object.keys(ROOM).forEach(function (room) {
      var b = PMU_BOARDS.rooms[room] || {};
      ['L', 'M', 'S'].forEach(function (cn) { (b[cn] || []).slice().sort(function (p, q) { return p[2] - q[2] || p[1] - q[1]; }).forEach(function (e) { push(e[0], room); }); });
      if (room === 'accounts') Object.keys(W).forEach(function (id) { if (/^acct-/.test(id)) push(id, room); });
    });
    Object.keys(W).forEach(function (id) { push(id, null); });
    return (CATALOG = out);
  }
  function titleOf(id, room, state) { var d = PMU.widgets.get(id) || {}; try { return typeof d.title === 'function' ? d.title({ id: id, room: room, state: state }) : (d.title || id); } catch (e) { return id; } }
  /* the flags (00-core.js PMU.flags) and the Animation speed a Usage shell carries, copied onto a hosted shell */
  function copyFlags(el) {
    var f = PMU.flags || {};
    Object.keys(f).forEach(function (k) { el.setAttribute('data-pmu-f-' + k.toLowerCase(), f[k] ? '1' : '0'); });
    var app = document.getElementById('pmuApp'), sp = app ? app.style.getPropertyValue('--pmu-speed') : '';
    if (sp) el.style.setProperty('--pmu-speed', sp);
  }
  /* the shared hosted layer (D10 3.4), made once and kept in the host's overlay root: the menus a hosted board opens, the
     size picker's measure host and the chart readouts live in it, inside a Usage shell (the tokens) that takes no pointer */
  function layer(overlayRoot) {
    if (!LAYER) {
      LAYER = document.createElement('div');
      LAYER.setAttribute('data-pmu-host', 'layer');
      var shell = document.createElement('div');
      shell.className = 'pmu-shell pmu-hosted pmu-layer';
      copyFlags(shell);
      var ms = document.createElement('div'); ms.className = 'pmu-szmeasure'; ms.setAttribute('aria-hidden', 'true');
      var ro = document.createElement('div'); ro.className = 'pmu-rolayer'; ro.setAttribute('aria-hidden', 'true');
      shell.appendChild(ms); shell.appendChild(ro);
      LAYER.appendChild(shell);
    }
    var host = overlayRoot || LAYER.parentNode || document.body;
    if (LAYER.parentNode !== host) host.appendChild(LAYER);
    return LAYER;
  }
  /* a hosted board's own DOM (D10 3.4): root > Usage shell > scroll pane > board, all made here, so the host's sources
     carry no pmu- names; the root's inline layout needs no Usage CSS */
  function hostDom(bo) {
    var root = document.createElement('div');
    root.setAttribute('data-pmu-host', bo.id);
    root.style.cssText = 'position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column';
    var shell = document.createElement('div');
    shell.className = 'pmu-shell pmu-hosted';
    copyFlags(shell);
    var sc = document.createElement('div'); sc.className = 'pmu-scroll';
    var board = document.createElement('div'); board.className = 'pmu-board'; board.setAttribute('data-room', bo.id);
    sc.appendChild(board); shell.appendChild(sc);
    var live = null;
    if (!bo.announce) { live = document.createElement('div'); live.className = 'pmu-sr'; live.setAttribute('aria-live', 'polite'); shell.appendChild(live); }
    root.appendChild(shell);
    if (bo.mount) bo.mount.appendChild(root);
    return { root: root, shell: shell, scroll: sc, board: board, live: live };
  }

  /* ---- one board (D10 2.1): opts as D10 3.2; returns its handle {api, teardowns, ...}. Everything below until the
     handle is the engine as it was, on this board's elements, state and store ---- */
  function createBoard(bo, hosted) {
    /* the board's members are filled in at the end (loadEnvelope hands the board to PMU.cards.holdStored before that) */
    var api = {}, inner = { api: api, teardowns: [], film: !!bo.film };
    /* a dashboard given a project keeps its contents per project (D10 P5); the Usage board's key is its own (STORE_KEY) */
    var perProject = hosted && !bo.storeKey && bo.projectId != null;
    var boardId = bo.id, storeKey = bo.storeKey || boardKey(bo.id, perProject ? bo.projectId : null);
    var hostId = bo.hostId || (hosted ? 'home.dashboard' : bo.id), projectId = bo.projectId || 'tastebook';
    if (perProject) adoptKey(boardId, projectId);
    /* the room film is one board's (D10 2.7): a board without it never begins a moment, ghosts, flies, frames or holds */
    var FILM = bo.film ? PMU.film : null;
    /* the width source (D10 2.8): the Usage board observes its scroll pane, a hosted board hears its host */
    var widthFrom = bo.resize || (hosted ? 'host' : 'observe');
    var dom = hosted ? hostDom(bo) : null;
    if (hosted) layer(bo.overlay);
    /* the Usage board shares the page state (PMU.core.state: 46-shell and 90-api read its hidden and layout); a hosted board
       keeps its own of the same shape, with its one room and every level shown (D10 2.5) */
    var st = bo.state || { room: boardId, detail: 'diagnostics', range: '24h', scope: 'all', more: false, hidden: {}, layout: {} };
    var scroll = dom ? dom.scroll : bo.scroll;
    var boardEl = dom ? dom.board : bo.board;
    var stage = dom ? null : bo.stage;
    var live = dom ? dom.live : bo.live;
    var appEl = dom ? dom.shell : bo.app;
    var rootEl = dom ? dom.root : bo.app;
    var current = { cls: null, room: bo.rooms ? null : st.room, mounted: false, pending: false };
    var listeners = {};
    var gesture = null;
    var configs = {};       /* widget id -> {range?, scope?, <option id>: value} (the records' configuration_refs) */
    var parkedFrom = {};    /* room/class/widget -> the rect a hidden panel had before it was parked under the board */
    var revisions = {};     /* widget id -> committed_revision */
    /* a dashboard's committed layout revision (its envelope's committed_revision; the Undo after Start from, Plans WS-030
       restore_revision, the ruling of 2026-10-11): one more for every accepted command that changes its records. undoMark:
       the revision the last Start from or Reset widgets came from and the one it made ({ rev, at }); a restore to rev runs
       only while the board is still at `at`. The Usage board keeps neither. */
    var boardRev = 0, undoMark = null;
    var PREWARMED = {};     /* look (+ ':rm') -> true: this board's first-drag pre-warm ran (prewarm) */
    var landing = null, outline = null;
    /* a hosted board builds and refreshes only while its host shows it (D10 3.3 show / hide); the Usage board always shows */
    var shownFlag = !hosted || bo.shown !== false, dead = false, dirty = false, sizeDirty = false, seenEpoch = EPOCH;
    /* the set a dashboard's widgets started from (D10 P4, the envelope's set_id; null: its own default set) and that set's
       rows, which are then its defaults (a widget a newer set adds is appended, as a newer default set's is) */
    var startSet = null, startRows = null;
    /* live beats (D10 P12): the share keys a dashboard has not patched yet (hidden or held), the cards of a patch still
       running in slices, and what it did (liveStats) */
    var liveKeys = null, liveQ = null, liveRaf = 0, liveStat = { beats: 0, patched: 0, held: null, last: null };
    /* the lead light (D10 round two): the kept beats' lead keys (newest first), the lead's rect read before a patch
       writes, how many beats a patch carries, and the board's own light layer */
    var liveLead = null, liveLeadRect = null, liveMerged = 0, flyEl = null;

    function emit(evt, detail) {
      (listeners[evt] || []).slice().forEach(function (fn) { try { fn(detail); } catch (error) { console.error('[pm-usage] board ' + evt, error); } });
      /* every mount and build of a shown board asks for the first drag's pre-warm (it waits for an idle period and for the
         film, the held build and any gesture to be over; once per board, look and Reduce Motion state) */
      if (evt === 'mount' || evt === 'built') prewarmSoon(0, true);
    }
    function say(text) {
      if (bo.announce) { try { bo.announce(text); } catch (error) {} return; }
      if (live) { live.textContent = ''; live.textContent = text; }
    }
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
    /* the command seam (D10 2.9): payloads as they were; a hosted board's record scope comes from its own view. The
       Usage board passes no fourth argument, as before. */
    var commandScope = bo.commandScope || (hosted ? function () { return { room: st.room, range: st.range, usage_scope: st.scope, host_id: hostId }; } : null);
    function cmd(commandId, payload, result) { return commandScope ? command(commandId, payload, result, { scope: commandScope() }) : command(commandId, payload, result); }
    /* default_set_version: the Usage boards' set, or a dashboard's (D10 2.2, 4.6: 'pmu-host:<hosts_version>', 'pmu-host:none') */
    function setVersion() { return bo.defaultSet ? bo.defaultSet() : bo.rooms ? defaultSet() : hostSetVersion(boardId); }

    /* ---- layout store (DESIGN-SPEC 6.6): one envelope per board key, records per widget, geometry per board class edited ---- */
    function emptyView() { return bo.rooms ? { room: 'overview', detail: 'glance', range: '24h', scope: 'all', more: false } : { room: boardId, detail: 'diagnostics', range: '24h', scope: 'all', more: false }; }
    function newEnvelope(view, receipt) {
      return { schema_id: 'pm.usage.widget_layout.v1', layout_schema_version: 1, default_set_version: setVersion(), host_id: hostId, project_id: projectId,
        view: view || emptyView(), records: [], migration_receipt: receipt || null };
    }
    function loadEnvelope() {
      var env = STORE.get(storeKey, null), hidden = {}, layout = {};
      if (env && (typeof env !== 'object' || env.schema_id !== 'pm.usage.widget_layout.v1' || !env.view)) {
        /* a corrupt or unknown envelope is set aside and the defaults apply (no second migration) */
        STORE.set(storeKey + ':quarantine', env);
        return { env: newEnvelope(null, { from: storeKey + ':quarantine', at: new Date().toISOString(), carried: [], dropped: ['everything'] }), hidden: hidden, layout: layout, fresh: true };
      }
      if (!env) {
        /* a board without the migration (a hosted board) starts from its default set */
        if (!bo.migrate) return { env: newEnvelope(null, null), hidden: hidden, layout: layout, fresh: true };
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
      var keepGeometry = env.default_set_version === setVersion();
      if (!keepGeometry) {
        /* a board without rooms (a dashboard) holds its widgets only as geometry records: a new default set keeps them and
           writes the receipt (D10 2.2) */
        if (!bo.rooms) { env.migration_receipt = { from: 'default_set_version ' + env.default_set_version, at: new Date().toISOString(), carried: ['view', 'visible', 'configuration_refs', 'geometry'], dropped: [] }; keepGeometry = true; }
        else env.migration_receipt = { from: 'default_set_version ' + env.default_set_version, at: new Date().toISOString(), carried: ['view', 'visible', 'configuration_refs'], dropped: ['geometry'] };
        env.default_set_version = setVersion();
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
        /* the preset the card was set to (WS-020: its table id, never a name; the sizes come from the id and the preset
           table when the card is first seen, and a legacy name, 'custom' or the earlier per-class presets map is read once) */
        if (PMU.cards && PMU.cards.holdStored) PMU.cards.holdStored(rec.widget_id, rec.preset_id, rec.presets, api);
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
      /* rooms off (D10 2.6): the room is the board's id for life and every level shows */
      if (bo.rooms) {
        if (ROOM[envelope.view.room]) st.room = envelope.view.room;
        if (DETAIL[envelope.view.detail]) st.detail = envelope.view.detail;
      }
      if (['5h', '24h', '7d', '30d'].indexOf(envelope.view.range) >= 0) st.range = envelope.view.range;
      if (typeof envelope.view.scope === 'string') st.scope = envelope.view.scope;
      st.more = !!envelope.view.more;
      st.hidden = loaded.hidden;
      st.layout = loaded.layout;
      /* a dashboard: the set it started from (a saved preset deleted since gives no defaults, never the board's own), and
         the project its key belongs to */
      if (hosted) {
        startSet = typeof envelope.set_id === 'string' && envelope.set_id && envelope.set_id !== 'default' ? envelope.set_id : null; startRows = null;
        envelope.project_id = projectId;
        boardRev = revOf(envelope);
      }
      if (loaded.fresh || !loaded.env.records || (envelope.migration_receipt && !envelope.records.length)) persist();
    }
    var widgetRoom = null;
    function roomOfWidget(id) {
      if (!bo.rooms) return st.room;   /* rooms off: every widget is the board's */
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
          /* preset_id (WS-020): the preset's table id while the card is at that preset, else null; a card not yet seen
             since the reload keeps the id it was stored with, and a class without a size of its own keeps the preset the
             card was set to at a class where it still has that size. No per-class preset map is stored. */
          var pid = PMU.cards.heldId ? PMU.cards.heldId(id, api) : null;
          if (!pid && mine) pid = PMU.cards.sizeId(kindSpec(id), mine.w, mine.h, id, api);
          if (!pid && !mine) Object.keys(g).some(function (c) { var gr = parseGeo(g[c]); pid = gr && PMU.cards.pickedId ? PMU.cards.pickedId(id, c, gr.w, gr.h, api) : null; return !!pid; });
          var rec = { room_id: room, widget_id: id, visible: !(st.hidden[room] || {})[id], order_index: order[id] != null ? order[id] : null, geometry: g,
            preset_id: pid || null,
            semantic_tier_id: card ? (card.getAttribute('data-tw') || '') + '.' + (card.getAttribute('data-th') || '') : null,
            configuration_refs: cfgRefs(configs[id]), committed_revision: revisions[id] || 0 };
          byWidget[room + '/' + id] = rec; recs.push(rec);
        });
      });
      return recs;
    }
    var saveTimer = 0, savePending = false;
    function writeNow() {
      savePending = false;
      envelope.view = { room: st.room, detail: st.detail, range: st.range, scope: st.scope, more: !!st.more };
      envelope.records = recordsNow();
      if (hosted) { if (startSet) envelope.set_id = startSet; else delete envelope.set_id; envelope.project_id = projectId; envelope.committed_revision = boardRev; }
      STORE.set(storeKey, envelope);
    }
    function persist() {
      ensure();
      if (dead) return;
      clearTimeout(saveTimer);
      savePending = true;
      saveTimer = setTimeout(writeNow, 400);
    }
    /* the envelope written now, not after the debounce (destroy, a tour snapshot; D10 2.4) */
    function flushNow() { ensure(); if (dead) return false; clearTimeout(saveTimer); saveTimer = 0; writeNow(); return true; }
    /* an accepted command changed the records: the board's revision steps (a dashboard's). The preset hold's resizes settle
       the set a Start from just placed, so they carry an open Undo's revision along with them. */
    function committed(source) {
      if (!hosted) return;
      if (undoMark && undoMark.at === boardRev && source === 'preset_hold') undoMark.at = boardRev + 1;
      boardRev++;
    }

    /* ---- defaults, projection ---- */
    function nearestEdited(room, cls) {
      var saved = st.layout[room] || {}, order = ['L', 'M', 'S', 'XL'];
      if (cls.name === 'XL') order = ['L', 'M', 'S'];
      else if (cls.name === 'L') order = ['XL', 'M', 'S'];
      else if (cls.name === 'M') order = ['L', 'S', 'XL'];
      else order = ['M', 'L', 'XL'];
      for (var i = 0; i < order.length; i++) if (saved[order[i]] && saved[order[i]].length) return saved[order[i]];
      return null;
    }
    /* a board without rooms takes its default set from opts.defaults(class name, tracks), else from PMU_BOARDS.hosts[id]
       (tools/boards.py), else it starts empty (a new dash-<n>, D10 P13) */
    function ownSet() {
      if (!bo.defaults) return hostDefaults(boardId) || {};
      var out = {};
      CLASSES.forEach(function (c) { var list = bo.defaults(c.name, c.tracks); if (list) out[c.name] = list; });
      return out;
    }
    /* once it was started from another set (D10 P4), that set's rows are its defaults */
    function hostSet() {
      if (!startSet) return ownSet();
      if (!startRows) { var s = setRows(startSet); startRows = s ? s.rows : {}; }
      return startRows;
    }
    /* a set by id (D10 P4) -> { rows, presets, configs }, null for an unknown id: 'default' (the board's own), 'room:<id>'
       (a Usage room's default board), 'host:dashboard' (the dashboard starter set) and 'user:<id>' (a saved preset) */
    function setRows(setId, cn) {
      var m = /^(default|room|host|user)(?::(.+))?$/.exec(String(setId || '')), clsName = cn || (current.cls ? current.cls.name : 'L');
      if (!m) return null;
      if (m[1] === 'default') { var mine = ownSet(); return m[2] ? null : { rows: mine, presets: rowPresets(mine, clsName), configs: {} }; }
      if (m[1] === 'room') return own(ROOM, m[2]) && PMU_BOARDS.rooms[m[2]] ? { rows: roomRows(m[2]), presets: {}, configs: {} } : null;
      if (m[1] === 'host') { var H = hostsTable(); return m[2] === 'dashboard' && H && H.dashboard ? { rows: H.dashboard, presets: rowPresets(H.dashboard, clsName), configs: {} } : null; }
      var p = presetById(m[2]);
      return p ? presetSet(p) : null;
    }
    /* a set's rects at a board class: its own rows there, else projected (XL from L) as the Usage page does; the Accounts
       room's set takes the providers with accounts, as the Usage page's Accounts room does */
    function setRects(setId, rows, cls) {
      var rects = rows[cls.name] ? rectsOf(rows[cls.name]) : project(rectsOf(rows.L || rows.M || rows.S || rows.XL || []), cls.tracks);
      rects = rects.map(function (r) { return clampRect(r, cls.tracks); });
      return setId === 'room:accounts' ? mergeRoster(rects, cls) : rects;
    }
    function defaultsFor(room, cls) {
      var rooms = bo.rooms ? PMU_BOARDS.rooms[room] || {} : hostSet();
      if (rooms[cls.name]) return rectsOf(rooms[cls.name]);
      return project(rectsOf(rooms.L || rooms.M || rooms.S || []), cls.tracks);  /* XL projects from L (DESIGN-SPEC 6.7) */
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
      if (bo.rooms ? room === 'accounts' : startSet === 'room:accounts') rects = mergeRoster(rects, cls);
      return rects;
    }
    function visibleIds(room) {
      var rank = LEVEL_RANK[st.detail] || 0, hidden = st.hidden[room] || {};
      /* rooms off: no level filter (a dashboard shows every panel it was given) */
      return layoutFor(room).filter(function (r) { return (!bo.rooms || (LEVEL_RANK[levelOf(r.id)] || 0) <= rank) && !hidden[r.id]; }).map(function (r) { return r.id; });
    }
    function saveLayout(room, rects) {
      st.layout[room] = st.layout[room] || {};
      st.layout[room][current.cls.name] = rects.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
    }

    /* ---- cards: placement, head form, tiers ---- */
    /* cards leaving the board (a room change fading out in place, a hidden panel) are not the board's cards any more */
    function cardOf(id) {
      if (!boardEl) return null;
      var list = boardEl.querySelectorAll(':scope > .pmu-card[data-widget="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
      for (var i = 0; i < list.length; i++) if (!isLeaving(list[i])) return list[i];
      return null;
    }
    function cardsNow() { return boardEl ? Array.prototype.filter.call(boardEl.querySelectorAll(':scope > .pmu-card'), function (c) { return !isLeaving(c); }) : []; }
    /* a card knows its board (D10 0.4): the _pmuBoard expando, written with its place */
    function place(card, r) {
      card._pmuBoard = api;
      gridPlace(card, r);
      card.dataset.x = r.x; card.dataset.y = r.y; card.dataset.w = r.w; card.dataset.h = r.h;
      var def = PMU.widgets.get(card.getAttribute('data-widget')) || {};
      var form = PMU.cards.headForm(def, r.w, r.h, current.cls ? current.cls.pitchX : 48);
      if (card.getAttribute('data-head') !== form) card.setAttribute('data-head', form);
    }
    /* a card's chrome from PMU.cards.build, which is handed this board and places the card through it (place, above) */
    function buildCard(id, room, rect) { return PMU.cards.build(id, room, rect, api); }
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
    var onScrollView = function () { view.top = scroll.scrollTop; if (streaming && streaming.late) streaming.late(); if (lateHeld) lateHeld(true); };
    if (scroll) scroll.addEventListener('scroll', onScrollView, { passive: true });
    /* the held build (WOW-SPEC 3.1 Phase A): bodies render in reading order in slices of at most 8 ms per frame while the
       board is held (data-held: nothing visible), so the click and every frame stay short; each body's inner entrance is
       queued by PMU.film.cue and released with the wave. A newer mount supersedes a running build. */
    var buildToken = 0, lateHeld = null;
    /* warm (the warm build, mount opts.warm): slices in idle periods instead of frames, every body built (no data-late)
       and none revealed: they wait under data-body-wait for the arrival. sync (the arrival's own build when no warm board
       is waiting, PMU.film arriveWhole): every body now, in this task, measured in one read (tierPass) */
    function buildSliced(cards, onBuilt, warm, sync) {
      /* reading order, the hero first (WOW-SPEC-3 5); without a GPU the bodies outside the viewport wait until the moment
         is over (data-late: never measured or entered by the release; PERF-3) */
      var token = ++buildToken, all = readingOrder(cards).sort(function (a, b) { return b.hasAttribute('data-hero') - a.hasAttribute('data-hero'); });
      var soft = softGpu() && !warm;
      if (soft) viewNow(true);   /* the mount just read the board's width: the layout is clean */
      var queue = soft ? all.filter(inView) : all, later = soft ? all.filter(function (c) { return !inView(c); }) : [];
      later.forEach(function (c) { c.setAttribute('data-late', ''); });
      var idle = window.requestIdleCallback || function (fn) { return setTimeout(function () { fn({ timeRemaining: function () { return 8; }, didTimeout: false }); }, 40); };
      function next() { if (warm) idle(slice, { timeout: 1500 }); else requestAnimationFrame(slice); }
      function slice(deadline) {
        if (token !== buildToken) return;
        /* the warm (idle) build must not land inside a resize drag: its fit pass measures the board
           (pass-3 tape: 300-460ms freezes when it fired mid-gesture). Re-queue; the idle timeout
           keeps retrying and the first slice after release runs as before. Arrival builds (sync,
           non-warm) are user-visible and never defer. */
        if (warm && document.body && document.body.classList.contains('pm-resizing')) { next(); return; }
        var t0 = performance.now(), builtNow = [], budget = warm && deadline && deadline.timeRemaining ? Math.min(8, Math.max(1, deadline.timeRemaining())) : 8;
        fitSliced(function () {
          if (sync) { builtNow = queue.splice(0).filter(function (c) { return c.isConnected; }); tierPass(builtNow, 'enter'); return; }
          while (queue.length && (!builtNow.length || performance.now() - t0 < budget)) {
            var c = queue.shift();
            if (c.isConnected) { tierPass([c], 'enter'); builtNow.push(c); }
          }
        });
        /* revealed after the slice's fit pass, so a body never shows its unfitted first render */
        if (!warm) builtNow.forEach(function (c) { if (FILM && FILM.bodyBuilt) FILM.bodyBuilt(c); else c.removeAttribute('data-body-wait'); });
        if (queue.length) { next(); return; }
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
      if (sync) slice(null); else next();
    }

    /* ---- the room change (WOW-SPEC 3.2, WOW-TASKS E-1, coordinator decision 5: no main-thread task over ~50 ms on a
       room click). The click frame starts the light, the title and the exit and builds only the new chrome; the bodies are
       built in slices of at most 8 ms per frame in reading order, and each plate enters as soon as its body exists, at
       max(its wave delay, its build time), so the wave streams with the build. The old room fades out IN PLACE (its cards
       stay in the grid, inert, 160 ms), so nothing is re-parented and re-laid out on the click; a widget present in both
       rooms keeps its card and glides from its old rect to its new one (FLIP 320 SETTLE). Only a board with the room
       film (the Usage board) takes this path. ---- */
    var leaving = [], leaveFlushQueued = false, pendingOld = null;
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
      if (!key) { if (FILM && FILM.key) FILM.key({ room: room }); return; }
      if (key.getAttribute('data-room') === room) return;
      if (!reduced() && !(PMU.theme.look().nier) && !softGpu()) {
        /* the old lights are kept and reused, hidden once faded: inserting one and removing it 420 ms later changed the
           stage's children, which laid the whole Usage page out again each time (100-150 ms in the middle of the next
           room's build on the RTX 3090; Glass review r3 R2, 2026-10-15). Rapid clicks fade several at once. */
        var old = null;
        Array.prototype.some.call(stage.querySelectorAll(':scope > .pmu-film-key.pmu-key-old'), function (o) { if (!o._pmuA) old = o; return !!old; });
        if (!old) { old = document.createElement(key.tagName); key.parentNode.insertBefore(old, key.nextSibling); }
        Array.prototype.slice.call(old.attributes).forEach(function (at) { if (!key.hasAttribute(at.name)) old.removeAttribute(at.name); });
        Array.prototype.slice.call(key.attributes).forEach(function (at) { if (old.getAttribute(at.name) !== at.value) old.setAttribute(at.name, at.value); });
        old.classList.add('pmu-key-old');
        var a = PMU.motion.animate(old, [{ opacity: 1 }, { opacity: 0 }], { dur: 420, easing: filmE('out', 'cubic-bezier(.22,.8,.28,1)'), fill: 'forwards' });
        var parked = function () { if (old._pmuA === a) { old._pmuA = null; old.style.visibility = 'hidden'; } };
        old._pmuA = a || null;
        if (a) a.finished.then(parked, parked); else parked();
      }
      if (FILM && FILM.key) FILM.key({ room: room }); else key.setAttribute('data-room', room);
    }
    /* the hover tags wait for the moment to end (WOW-SPEC 3.2 budget): PMU.film.deferHoverTags holds the app's hover-tag
       controller in its page-settling state and scans the Usage panel once when the entrance is over (the room film's
       board only: the scan is of the Usage panel) */
    function deferHover(ms) { if (FILM && typeof FILM.deferHoverTags === 'function') FILM.deferHoverTags(ms); }
    /* the streamed build of a room change: chrome and body together, card by card in reading order, in slices of at most
       8 ms per frame; each plate enters as soon as it exists. plans: [{id, rect, card?}] (card = a shared widget's card) */
    var filmEndT = 0;
    function streamBuild(plans, o) {
      var token = ++buildToken, t0 = o.t0, sp = speed(), first = true, built = [], soft = softGpu();
      /* the wave on the whole new layout (grid rows and columns from the rects; no element needed yet) */
      var proxies = plans.map(function (pl) { return { plan: pl, dataset: { x: pl.rect.x, y: pl.rect.y } }; });
      var fresh = proxies.filter(function (q) { return !q.plan.card; });
      /* the structure wave of a room change (WOW-SPEC-3 6.2): 90 + row x rowRank + col x colRank in the voice's cadence
         (MOTION-4 4.2: cam asks PMU.film for it; Glass ranks from the hero outward) */
      if (FILM && FILM.wave) FILM.wave(fresh, { row: PMU.motion.family() === 'retro' ? 60 : 28, col: 16, cap: 200, cam: true, heroes: [].concat(o.hero || []) });
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
          if (FILM && FILM.frames) FILM.frames(cards, { dir: o.dir, base: 0, wave: false, scan: true, board: boardEl, from: soft ? 0.55 : 0 });
          else PMU.motion.enter(cards, { base: 0, dir: o.dir });
        }
      }
      function chrome(pl, frag) {
        if (pl.card || pl.el) return false;
        var c = buildCard(pl.id, o.room, pl.rect);
        if (heroes.indexOf(pl.id) >= 0) c.setAttribute('data-hero', '');
        c.setAttribute('data-body-wait', '');
        pl.el = c; frag.appendChild(c);
        return true;
      }
      /* a body built after its frame goes to the film's timeline (WOW-SPEC-3 6.2): the hero reveals 200 after the click with
         its instruments, the supporting bodies quietly from 480, 24 apart (PMU.film.bodyBuilt) */
      function revealBody(c) {
        if (FILM && FILM.bodyBuilt) { FILM.bodyBuilt(c); return; }
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
        if (FILM && FILM.pairFlights && (slices > 1 || all)) { try { /* a room seen before pairs as soon as the bodies that held its targets are built; a first visit waits for every
             first-screen body (a key can sit in the hero AND in a plate: pairing early picked the hero's headroom ladder) */
          if (firsts.length > 0 ? !queue.some(function (pl) { return firsts.indexOf(pl.id) >= 0 || heroes.indexOf(pl.id) >= 0; }) : all || slices > 8) FILM.pairFlights(all || slices > 8 || firsts.length > 0); } catch (error) { console.error('[pm-usage] flight pair', error); } }
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
        if (FILM && FILM.pairFlights) requestAnimationFrame(function () { if (token === buildToken) { void boardEl.offsetWidth; try { FILM.pairFlights(true); } catch (error) {} } });
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
        try { if (FILM && FILM.allBuilt) FILM.allBuilt(o.room, live.filter(function (c) { return !shared[c.getAttribute('data-widget')]; })); } catch (error) { console.error('[pm-usage] room beat', error); }
        if (!live.length && !later.length && !boardEl.querySelector(':scope > .pmu-board-empty')) boardEl.appendChild(PMU.cards.empty(o.room, api));
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
      if (lateHeld && !(FILM && FILM.holding && FILM.holding())) lateHeld(true);
      var sm = streaming;
      if (sm && sm.token === buildToken) { try { sm.complete(); } catch (error) { console.error('[pm-usage] complete build', error); } }
      streaming = null;
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
       round-2 guess (the largest plate in the first 12 rows) stays only as the fallback for a room the table does not name.
       A board without rooms has no hero (D10 2.6). */
    function heroOf(rects, ids, room) {
      if (!bo.rooms) return [];
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
    /* The tracks belong only to this grid. Writing grid-template-columns directly gives the same track sizes without
       changing an inherited custom property on every card and chart when the board crosses a width class. */
    function setBoardClass() {
      var name = current.cls.name, tracks = 'repeat(' + current.cls.tracks + ', minmax(0px, 1fr))';
      if (boardEl.getAttribute('data-cls') !== name) boardEl.setAttribute('data-cls', name);
      if (boardEl.style.gridTemplateColumns !== tracks) boardEl.style.gridTemplateColumns = tracks;
      var app = appEl; if (app && app.getAttribute('data-cls') !== name) app.setAttribute('data-cls', name);
    }
    /* the menu open now is this board's (opened from it, or anchored inside it) */
    function menuOwned() {
      var h = PMU.menu && PMU.menu.current ? PMU.menu.current() : null;
      return !!h && (h.board === api || !!(h.anchor && h.anchor.nodeType === 1 && rootEl && rootEl.contains(h.anchor)));
    }
    /* ---- the reversal (motion QA A12, 2026-10-16): a click back to the room still leaving makes its board, which is
       still on screen as the ghost (PMU.film.ghost), the live board again as it stands: PMU.film.reverse drifts it back
       to rest from where it stands and closes its cut or lens, and the room that was arriving goes in the click's frame
       (its board empties into the spare at once; the user never left the old room, so nothing of it is built again).
       Only when the old board lent no card to the arriving room (a widget in both rooms moved across), the board class
       and the room's widgets are unchanged, and the film says the hand-off can reverse (PMU.film.reversible: Basic,
       Friendly and Glass with a GPU, no room carried from an earlier click). Anything else takes the room change. ---- */
    /* ---- Reduce Motion's room change (motion QA A14, 2026-10-16). Nothing travels, and the new room used to be built
       whole inside the click (M3: a 117 ms frame in Glass Light; the rail and title waited for it too). Now the click's
       frame paints the rail and title at once while the room on screen stays as it is; the new room is built in
       the spare board element, laid out but unseen (visibility): its chrome in the next frame, then its bodies in slices
       of at most 8 ms per frame, what the first screen shows first; when that is built the two boards swap in one frame and the new room dissolves in (160 ms
       from .35, PMU.film.dissolve: the same dissolve as before, now on the room it is for). The cards below the first
       screen are built after the swap, unseen. A newer room click, a gesture or a re-class completes or drops it. ---- */
    var calm = null;
    function dropCalm() {
      var c = calm; calm = null; if (!c) return;
      if (c.el !== boardEl) { Array.prototype.forEach.call(c.el.querySelectorAll(':scope > .pmu-card'), destroyCard); retireBoard(c.el); }
    }
    function calmSwap(room, rects, ids, byId) {
      lastGhost = null; flushLeaving(true); dropOld();
      if (FILM && FILM.holding && FILM.holding()) FILM.cancelHold();
      var token = ++buildToken; streaming = null; lateHeld = null; clearTimeout(filmEndT); filmEndT = 0;
      var old = boardEl, nb = spareBoard();
      Array.prototype.slice.call(old.attributes).forEach(function (at) { if (at.name !== 'id' && at.name !== 'class' && at.name !== 'hidden' && at.name !== 'style' && !/^data-(film|op|held|hold-bodies)$/.test(at.name)) nb.setAttribute(at.name, at.value); });
      nb.className = 'pmu-board';
      nb.style.gridTemplateColumns = 'repeat(' + current.cls.tracks + ', minmax(0px, 1fr))';
      nb.setAttribute('data-cls', current.cls.name);
      nb.setAttribute('data-room', room);
      nb.setAttribute('aria-hidden', 'true');
      nb.style.visibility = 'hidden'; nb.style.pointerEvents = 'none';
      nb.hidden = false;
      current.mounted = true;
      calm = { el: nb, old: old, token: token };
      /* the chrome too is built after the click's frame (as a room change's: inside the click the clicked button's focus
         forced its layout), in one batch */
      var heroId = heroOf(rects, ids, room), cards = null, first = [], rest = [];
      function chromes() {
        if (cards) return;
        var frag = document.createDocumentFragment();
        cards = ids.map(function (id) { var card = buildCard(id, room, byId[id]); markHero(card, heroId); frag.appendChild(card); return card; });
        nb.appendChild(frag);
        if (!cards.length) nb.appendChild(PMU.cards.empty(room, api));
        var top = padCache ? padCache.t : 0, vh = view.h || (window.innerHeight || 900);
        first = readingOrder(cards.filter(function (c) { return top + (+c.dataset.y || 0) * ROW < vh + 24; }));
        rest = readingOrder(cards.filter(function (c) { return first.indexOf(c) < 0; }));
      }
      var swapped = false;
      function swap() {
        if (swapped || token !== buildToken || !calm || calm.el !== nb) return;
        swapped = true;
        /* (the room on screen stayed live meanwhile: restyling it inert cost the click a whole-board style pass; a menu it
           opened in that window closes with it) */
        if (PMU.menu && menuOwned()) PMU.menu.close();
        Array.prototype.forEach.call(old.querySelectorAll(':scope > .pmu-card'), destroyCard);
        old.removeAttribute('id');
        nb.style.visibility = ''; nb.style.pointerEvents = ''; nb.removeAttribute('aria-hidden');
        if (bo.liveId) nb.id = bo.liveId;
        boardEl = nb;
        retireBoard(old);
        scroll.scrollTop = 0; view.top = 0;
        ensurePreviews();
        if (FILM && FILM.dissolve) FILM.dissolve(nb);
        deferHover(400);
      }
      function run(list, all) {
        var t0 = performance.now();
        fitSliced(function () { while (list.length && (all || performance.now() - t0 < 8)) { var c = list.shift(); if (c.isConnected) tierPass([c], true); } });
      }
      function slice() {
        if (token !== buildToken || !calm || calm.el !== nb) return;
        if (!cards) { chromes(); requestAnimationFrame(slice); return; }
        if (first.length) { run(first, false); if (first.length) { requestAnimationFrame(slice); return; } swap(); requestAnimationFrame(slice); return; }
        run(rest, false);
        if (rest.length) { requestAnimationFrame(slice); return; }
        if (calm && calm.el === nb) calm = null;
        if (streaming && streaming.token === token) streaming = null;
        emit('built', { room: room, cards: cards.length, ms: 0 });
      }
      streaming = { token: token, complete: function () { chromes(); run(first, true); swap(); run(rest, true); if (calm && calm.el === nb) calm = null; }, late: function () {} };
      requestAnimationFrame(function () { requestAnimationFrame(slice); });
      emit('mount', { room: room, cls: current.cls.name, widgets: ids, calm: true });
    }
    var lastGhost = null;
    function reverseTo(room, ids) {
      var g = lastGhost, el = g && g.el;
      if (!g || !FILM || !FILM.reverse || !FILM.reversible || !el || el === boardEl || el.hidden || g.lent) return false;
      if (el.getAttribute('data-room') !== room || el.getAttribute('data-cls') !== current.cls.name || !FILM.reversible(el)) return false;
      var cards = Array.prototype.filter.call(el.children, function (n) { return n.classList.contains('pmu-card'); });
      var have = {}; cards.forEach(function (c) { have[c.getAttribute('data-widget')] = true; });
      if (cards.length !== ids.length || !ids.every(function (id) { return have[id]; })) return false;
      lastGhost = null;
      var incoming = boardEl, sTop = g.sTop || 0;
      /* the film reverses first, before anything here changes the old board (its test reads the ghost's state: removing the
         ghost's class first made Retro and NieR refuse, and their finished erase then emptied the live board) */
      var back = FILM.reverse(el, { shift: sTop });
      if (!back) return false;
      /* the arriving room's build stops, and its board empties into the spare now (no frame shows it after this one) */
      buildToken++; streaming = null; lateHeld = null;
      clearTimeout(filmEndT); filmEndT = 0;
      flushLeaving(true);
      Array.prototype.forEach.call(incoming.querySelectorAll(':scope > .pmu-card'), destroyCard);
      incoming.removeAttribute('id');
      /* the old board takes the live board's id and role back; its cards stop leaving. It keeps the ghost's layer
         (.pmu-ghostboard: will-change) until it rests: dropping the layer under its running drift re-rastered every
         Glass plate's frost in the reverse's first frames (a 200 ms GPU stall in a Glass Dark M3 film) */
      ['zIndex', 'pointerEvents', 'opacity'].forEach(function (k) { el.style[k] = ''; });
      if (bo.liveId) el.id = bo.liveId;
      boardEl = el;
      retireBoard(incoming);
      cards.forEach(function (c) { c._pmuLeaving = false; if (c.hasAttribute('data-leaving')) c.removeAttribute('data-leaving'); });
      /* the scroll it left with comes back (its keyframes start that much lower, so it does not move on screen) */
      if (sTop) scroll.scrollTop = sTop;
      view.top = sTop;
      current.mounted = true;
      keyShift(room);
      deferHover(back.ms + 200);
      /* the preview elements and the end of the film window wait for the drift to rest (inserting the morph before the
         first card restyles the board's positional rules: never during a motion) */
      setTimeout(function () { if (boardEl !== el || dead) return; el.classList.remove('pmu-ghostboard'); ensurePreviews(); if (!(FILM.moment && FILM.moment())) el.removeAttribute('data-film'); }, (back.ms + 60) * speed());
      return true;
    }
    function mount(room, opts) {
      ensure();
      prewarmEnd();
      rasterClear();   /* the spare is always empty for a mount (its ghost, calmSwap, reverseTo) */
      opts = opts || {};
      if (!bo.rooms) room = st.room;   /* rooms off: the board's one room */
      if (dead) return;
      /* a hidden hosted board builds nothing: it mounts when it is shown */
      if (hosted && !shownFlag) { current.pending = true; current.room = room; return; }
      /* a hosted board's entrance (D10 3.2): the plain reading-order entrance on its first build, none after it */
      if (hosted && (bo.entrance === 'none' || current.mounted) && !opts.instant) opts = Object.assign({}, opts, { instant: true });
      if (refreshQ) { refreshQ.cancelled = true; refreshQ = null; }   /* the new room renders with the current view anyway */
      if (!boardEl || !scroll) return;
      /* a gesture cut short by a mount takes its flags with it now, before the board element may become the ghost */
      if (gesture) { endGesture(gesture, 'cancel', true); opCancel(); opSync(); }
      if (PMU.menu && (!hosted || menuOwned())) PMU.menu.close();
      /* a room change reads no layout (PERF-3 rule 12): the board width is the last one measured while the scroll's
         ResizeObserver has seen no change since; anything else measures */
      var W = opts.transition && current.mounted && current.cls && view.w && Math.abs(view.w - (current.wSeen || -1)) < 0.5 ? current.cls.W : boardWidth();
      if (W <= 0) {
        current.pending = true; current.room = room;
        /* a mount of the hidden page supersedes a warm board waiting there (PMU.film.warmDrop): the next arrival builds */
        if (!hosted && !opts.warm && FILM && FILM.warming && FILM.warming()) FILM.warmDrop('pending');
        return;
      }
      current.pending = false;
      if (hosted) { seenEpoch = EPOCH; dirty = false; liveStop(); liveKeys = null; liveLead = null; liveMerged = 0; }   /* the mount renders the latest readings */
      flushGravity();
      if (calm) dropCalm();   /* a Reduce Motion build still behind the room on screen goes (a newer mount supersedes it) */
      var t0 = performance.now(), sTop = scroll.scrollTop;   /* every read before the first write */
      var roomChanged = current.room !== room;
      var transition = !!FILM && !!opts.transition && current.mounted && roomChanged && !opts.instant && !opts.held && !reduced() && !PMU.motion.paused();
      current.cls = pickClass(W);
      current.room = room;
      var rects = layoutFor(room), ids = visibleIds(room);
      var byId = {}; rects.forEach(function (r) { byId[r.id] = r; });
      clearTimeout(filmEndT); boardEl.removeAttribute('data-film');
      if (transition) {
        try { performance.mark('pmu-room-click'); } catch (error) {}
        var dir = opts.dir || 1;
        /* a click back to the room still leaving reverses the change (motion QA A12): no new moment, nothing built */
        if (reverseTo(room, ids)) { emit('mount', { room: room, cls: current.cls.name, widgets: ids, transition: true, reversed: true }); return; }
        lastGhost = null;
        /* rapid switching (WOW-SPEC-3 6.2): a running arrival or room change finishes at once (its animations jump to their
           end, its unbuilt bodies stay unbuilt: they leave with the ghost), and this room change starts from there */
        if (FILM && FILM.holding && FILM.holding()) FILM.cancelHold();
        buildToken++; streaming = null; lateHeld = null;
        if (FILM && FILM.begin) FILM.begin('room', room);
        deferHover(4000);
        /* the key light's tint is a full-stage repaint: without a GPU it changes with the new chrome (frame B, which repaints
           the board anyway) instead of in the click's frame, whose raster delayed the first frame by ~50 ms (PERF-3); with
           a GPU it also moves with the camera (6.1) */
        if (!softGpu()) { keyShift(room); if (FILM && FILM.keyPan) FILM.keyPan(dir); }
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
          /* the live board's id (#pmuBoard: the film, 42-cards.js and Home's chat floor rule find the Usage board by it) moves
             to the live element (D10 3.6) */
          if (bo.liveId) nb.id = bo.liveId;
          nb.hidden = false;
          boardEl = nb;
          outgoing.forEach(function (c) { c._pmuLeaving = true; });
          /* without a GPU the old room is not lifted into a layer of its own (its first raster cost the VM ~150 ms before the
             click's first frame): it stays where it is, inert and still, until the new chrome replaces it in the next
             frame (PERF-3's one full-board repaint); with a GPU it leaves as the ghost */
          if (softGpu() || !(FILM && FILM.ghost)) {
            oldBoard.classList.add('pmu-oldboard');
            if (sTop) oldBoard.style.transform = 'translateY(' + (-sTop) + 'px)';
            pendingOld = { el: oldBoard, cards: outgoing, sTop: sTop };
          }
          else {
            FILM.ghost(outgoing, { dir: dir, sTop: sTop, board: nb, ghost: oldBoard, destroy: destroyCard });
            lastGhost = { el: oldBoard, sTop: sTop, lent: Object.keys(reuse).length > 0 };
          }
        } else outgoing.forEach(function (c) { destroyCard(c); c.remove(); });
        /* what exists in both rooms flies (6.3): the flyers lift at their old place now; they pair with their targets once the
           target bodies are built (the slices) */
        if (FILM && FILM.flight) { try { FILM.flight({ dir: dir }); } catch (error) { console.error('[pm-usage] flight', error); } }
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
        streamBuild(plans, { t0: t0, base: 90, dir: dir, room: room, hero: hero, first: opts.first || (FILM && FILM.flightCards ? FILM.flightCards(room) : []) });
        emit('mount', { room: room, cls: current.cls.name, widgets: ids, transition: true, scrolled: sTop });
        return;
      }
      if ((opts.calmEntry || opts.transition && roomChanged && current.mounted) && reduced() && !hosted && bo.rooms && !opts.held) { calmSwap(room, rects, ids, byId); return; }
      lastGhost = null;
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
      var held = !!((opts.held || opts.warm) && !reduced());
      var frag = document.createDocumentFragment();
      var cards = ids.map(function (id) { var card = buildCard(id, room, byId[id]); markHero(card, heroId); if (held) card.setAttribute('data-body-wait', ''); frag.appendChild(card); return card; });
      boardEl.appendChild(frag);
      ensurePreviews();
      if (!cards.length) boardEl.appendChild(PMU.cards.empty(room, api));
      if (opts.warm) {
        /* the warm build (motion QA P2-03, PMU.film.warm): while another page shows, the board of the next arrival is built
           in the Usage page laid out unseen. It stays held (data-held) and plays nothing: its bodies are built in idle
           slices, the hero first, each body's entrance queued on its card (PMU.film.cue), and the arrival plays them */
        buildToken++;
        current.mounted = true;
        viewNow(true);
        buildSliced(cards, opts.onBuilt, opts.warm, !!opts.sync);
        emit('mount', { room: room, cls: current.cls.name, widgets: ids, warm: true, sync: !!opts.sync });
        return;
      }
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
        if (FILM && FILM.frames) { FILM.frames(cards, { dir: 0, base: 40, board: boardEl }); boardEl.setAttribute('data-film', ''); }
        buildSliced(cards, opts.onBuilt);
        emit('mount', { room: room, cls: current.cls.name, widgets: ids, held: true });
        return;
      }
      buildToken++;
      if (FILM && FILM.holding()) FILM.cancelHold();   /* a room click during the arrival takes over (the room film's board only) */
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
       changes as a quick cascade instead of a freeze. A newer refresh replaces the queue; other reasons stay synchronous
       (unless the caller asks for slices: ropts.sliced, a hosted board's data refresh, D10 3.1 touch). */
    var refreshQ = null;
    function refresh(reason, ropts) {
      if (!current.mounted) return;
      /* a warm board waiting unseen is not refreshed in place: it is dropped (PMU.film.warmDrop unmounts it) and the next
         arrival builds the board as it is then */
      if (!hosted && FILM && FILM.warming && FILM.warming()) { FILM.warmDrop('refresh'); return; }
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
      if ((reason !== 'range' && reason !== 'scope' && !ropts.sliced) || reduced() || cards.length < 4) { PMU.cards.updateAll(cards, reason); return; }
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
        var card = buildCard(id, room, byId[id]); boardEl.insertBefore(card, landing && landing.parentNode === boardEl ? landing : null); return card;
      });
      tierPass(staying.filter(function (c) { return sizes[c.getAttribute('data-widget')] !== c.dataset.w + 'x' + c.dataset.h; }), false);
      if (added.length) {
        setEntranceDelays(added);
        tierPass(added, reduced() ? true : 'enter');
        PMU.motion.enter(readingOrder(added), { base: 60 });
      }
      if (!ids.length && !boardEl.querySelector(':scope > .pmu-board-empty')) boardEl.appendChild(PMU.cards.empty(room, api));
      return added;
    }
    function relevel() { if (!current.mounted) return; reconcile(layoutFor(current.room)); emit('mount', { room: current.room, cls: current.cls.name, widgets: visibleIds(current.room) }); }

    /* ---- geometry without layout reads: a grid rect in board pixels (tracks at pitchX, rows at 30 px); gestures read no
       layout at all ---- */
    function px(r) {
      var c = current.cls, p = padOf();
      return { l: p.l + r.x * c.pitchX, t: p.t + r.y * ROW, w: r.w * c.pitchX - GAP, h: r.h * ROW - GAP };
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

    /* ---- gestures (DESIGN-SPEC 6.2 to 6.4) ---- */
    function snapshotNow() { return layoutFor(current.room).map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; }); }
    /* one gesture page-wide (D10 2.10): a gesture on this board first ends the one another board holds; ACTIVE is the
       holder's handle while its gesture runs, so the document listeners act on it */
    function claimGesture() { if (ACTIVE && ACTIVE !== inner) ACTIVE.drop(); ACTIVE = inner; }
    function releaseGesture() { if (!gesture && ACTIVE === inner) ACTIVE = null; }
    /* the page's flags for a gesture: pmu-pointer-op (no text selection) and pm7u-pointer-op (the PM8 magnet stands
       down) on the body, the app's drag convention pm-resizing on the body (the magnet loop idles, PM_EDGE defers its band
       geometry, the side panels' observers defer their refits, Home hides the hover tags and stills the chat's
       transition; PM_DRAGEND flushes them on release, exactly as the Home dashboard drags do) and the board's own data-op
       (its rules restyle every plate's head, tools and resize handles).
       Pick-up profile (P1000, 2026-10-10): pmu-pointer-op and pm7u-pointer-op are read by no style rule; a body class
       change restyles only the body and the side panels' views (a class-attribute rule), about 1 ms. pm-resizing costs
       2-3 ms to set where Home reads it and 13-19 ms to clear (#pm-hover-tag-root leaves and re-enters layout); data-op
       costs 233-252 elements of style on Overview (12-18 ms to set, 11-13 ms to clear), and a selection read forced it
       into the pick-up's task. The body flags are set in the gesture's first task, as before: the magnet's loop stands
       down from the lift frame on (it costs about 10 ms a frame while it runs) and PM_EDGE and the observers defer from
       the first frame. pm-resizing is cleared, and data-op set and cleared, in idle time (opSync): data-op in the idle
       period after prep's frame, both after the drop in the one after the release, forced there so no frame pays for
       them; PM_DRAGEND runs when pm-resizing is cleared, a frame or two after the drop, which defers the flush for the
       magnet, PM_EDGE and the observers by as long and changes nothing they read in between (the drop's settle is a
       transform). What data-op changes waits as long: the other plates stop answering hover and their handles stop taking
       the pointer (the gesture holds the pointer meanwhile); the lifted plate takes data-op's look in the lift's own
       frame (its tools out, head tools and title back: 20-board.css [data-lifted], so it never repaints once scaled) and
       the resizing plate's own lift does not wait for it either (20-board.css). Whose pm-resizing it is stays with one board, page-wide (RESIZING_BY),
       never with the attribute: a gesture's pick-up takes it over from another board that still holds it (a pointer
       drop on one board, then a keyboard pick-up on another before the first one's idle period), and only the board
       that holds it clears it and calls PM_DRAGEND (review 2026-10-10: the first board's idle period cleared it in the
       middle of the second board's gesture). A pm-resizing no board added (Home's own drags) is left alone. */
    var opOn = false, opT = 0;
    function setOpFlags(on) {
      var cl = document.body.classList;
      cl.toggle('pmu-pointer-op', on); cl.toggle('pm7u-pointer-op', on);
      opOn = !!on;
      if (on && (!cl.contains('pm-resizing') || RESIZING_BY)) { cl.add('pm-resizing'); RESIZING_BY = inner; }
      if (!on) opLater();   /* on: prep asks for it, after the frame that follows the lift */
    }
    function opLater() {
      if (opT || dead) return;
      opT = window.requestIdleCallback ? requestIdleCallback(opSync, { timeout: 120 }) : setTimeout(opSync, 32);
    }
    function opCancel() { if (!opT) return; if (window.requestIdleCallback && window.cancelIdleCallback) cancelIdleCallback(opT); else clearTimeout(opT); opT = 0; }
    /* pm-resizing and data-op take the state the gesture has now (a gesture that ended before its idle period sets
       nothing; a new one on this board keeps them) */
    function opSync() {
      opT = 0;
      if (!boardEl) return;
      var live = opOn && !!gesture && !gesture.done, want = live ? gesture.type : null, cl = document.body.classList, ended = false, wrote = false;
      if (live && !cl.contains('pm-resizing')) { cl.add('pm-resizing'); RESIZING_BY = inner; wrote = true; }
      else if (!live && RESIZING_BY === inner) { RESIZING_BY = null; cl.remove('pm-resizing'); ended = wrote = true; }
      if (boardEl.getAttribute('data-op') !== want) { if (want) boardEl.setAttribute('data-op', want); else boardEl.removeAttribute('data-op'); wrote = true; }
      if (wrote) void boardEl.offsetWidth;   /* the restyle runs in this idle period, not in the next frame */
      if (ended) { try { if (typeof window.PM_DRAGEND === 'function') window.PM_DRAGEND(); } catch (error) {} }
    }
    function sizeLabel(id, r) {
      var name = PMU.cards.sizeName(kindSpec(id), r.w, r.h, id, api);
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
      /* a pane already at its top has nowhere to go: no read and no write (the pair forced a layout in every frame of a
         carry that began near the top edge) */
      if (v < 0 && view.top <= 0) v = 0;
      if (v) { var before = scroll.scrollTop; scroll.scrollTop = Math.max(0, before + v); if (scroll.scrollTop !== before) g.dirty = true; }
    }
    function loop(g) {
      if (gesture !== g || g.done) return;
      autoScroll(g);
      if (g.type === 'move') frameMove(g); else frameResize(g);
      g.raf = requestAnimationFrame(function () { loop(g); });
    }
    function frameMove(g, force) {
      var now = performance.now();
      var dx = g.px - g.sx + (scroll.scrollLeft - g.scrollL), dy = g.py - g.sy + (scroll.scrollTop - g.scrollT);
      /* pick-up: 140 ms (.2,.8,.2,1) to scale 1.04 and 6 px up (Retro and NieR: no scale, no lift; Reduce Motion: at once).
         The lift's own frame holds the plate at scale 1 (it follows the pointer, nothing else): every paint change of the
         lift (its shadow, its tools, PMH's light gone) lands in that frame, while the plate's layer still rasters at scale
         1, and the scale comes from the next frame as a compositor-only change. A paint change while the plate is scaled
         re-rastered it at the lift's scale: on a page's first drag that compiled the GPU programs for every kind of mark in
         the plate, 300-600 ms on the P1000 (2026-10-11), and on every later drag it cost a raster. */
      var first = !g.liftFrame;
      g.liftFrame = (g.liftFrame || 0) + 1;
      if (!liftEase) liftEase = PMU.motion.curve('cubic-bezier(.2,.8,.2,1)');
      var k = first ? 0 : reduced() ? 1 : liftEase(Math.min(1, (now - g.liftAt) / (140 * speed())));
      var flat = liftScale() === 1;
      var s = 1 + (liftScale() - 1) * k, ly = flat ? 0 : -6 * k;
      /* velocity tilt: rotate = clamp(vx / 1200 px/s x 1deg), easing in while the pointer moves and back to 0 over about
         160 ms when it rests (the loop runs every frame, so a resting pointer reads as vx 0) */
      var dt = g.lastT ? now - g.lastT : 0, max = first || reduced() ? 0 : tiltMax();
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
      prep(g, true);   /* the board is whole and the preview elements exist before anything slides */
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
    /* the pick-up (Jared, 2026-10-10: the press must feel instant). The threshold's task does only what the first held
       frame shows: the claim, the snapshot and its rects (pure: no layout), the body flags and the plate's own lift or
       resize mark, and the carry's first frame runs in that same frame. The two reads come before any write, so they
       flush only what the pointer itself changed (the selection's clear, last before, forced the board's whole data-op
       restyle into this task: 16 ms of its 20 on the P1000). The rest follows in prep, in the next frame: a build still
       streaming, a pending gravity, the preview elements, the landing or the outline; the board's data-op in idle time
       (setOpFlags). Anything that needs them first (a new slot, a key, the release) runs prep itself, so the carry, its
       previews, peers, auto-scroll, keyboard pick-up, Escape and the drop behave as before. */
    function beginGesture(g) {
      prewarmEnd();
      if (!g.kb) { try { var sel = window.getSelection(); if (sel && sel.rangeCount) sel.removeAllRanges(); } catch (e) {} }
      g.scrollL = scroll.scrollLeft; g.scrollT = scroll.scrollTop;
      claimGesture();
      gesture = g;
      if (PMU.menu) PMU.menu.close();
      g.snapshot = snapshotNow();
      g.me = g.snapshot.filter(function (r) { return r.id === g.id; })[0];
      if (!g.me) { gesture = null; releaseGesture(); unfrost(); return false; }
      frost();
      g.target = { id: g.id, x: g.me.x, y: g.me.y, w: g.me.w, h: g.me.h };
      var shownNow = {}; visibleIds(current.room).forEach(function (id) { shownNow[id] = true; });
      g.maxY = g.snapshot.reduce(function (m, r) { return r.id === g.id || !shownNow[r.id] ? m : Math.max(m, r.y + r.h); }, 0);
      g.maxY = Math.max(g.maxY, g.me.y);
      g.preview = g.snapshot;
      g.pad = padOf();
      g.cards = cardsNow();
      var gp = px(g.me);
      g.cardL = gp.l; g.cardT = gp.t; g.cardW = gp.w; g.cardH = gp.h;
      /* a drop's float-up still pending: this plate takes its floated place now (it moves from there), the rest in prep */
      if (gravityMap && gravityMap[g.id]) place(g.card, gravityMap[g.id]);
      setOpFlags(true);
      if (g.card._pmuSlide) { g.card._pmuSlide.cancel(); g.card._pmuSlide = null; }
      if (g.card._pmuSettle) { g.card._pmuSettle.cancel(); g.card._pmuSettle = null; }
      g.card.removeAttribute('data-settling');
      if (g.type === 'move') {
        /* PMH's light leaves the plate in the lift's frame (PMH clears it a frame later, which then changes nothing here;
           see frameMove for why nothing may change on the plate once it is scaled) */
        PMH_PROPS.forEach(function (p) { g.card.style.removeProperty(p); });
        g.card.setAttribute('data-lifted', '');
        g.card.setAttribute('aria-grabbed', 'true');
        g.liftAt = performance.now();
      } else {
        g.card.setAttribute('data-resizing', g.edge);
      }
      if (g.kb) {
        /* the keyboard's lift scales in the frame after its paint changes, as the pointer's does (frameMove) */
        if (g.type === 'move') requestAnimationFrame(function () { requestAnimationFrame(function () { if (gesture === g && !g.done && g.card.hasAttribute('data-lifted')) g.card.style.transform = 'scale(' + liftScale() + ')'; }); });
        say(t(g.type === 'move' ? 'board.picked' : 'board.resizing', { name: cardTitle(g.id) }));
      } else {
        g.raf = requestAnimationFrame(function () { loop(g); });
      }
      /* two frames: a rAF asked for in the input's own frame runs in that frame (input is dispatched at its start) */
      g.prepRaf = requestAnimationFrame(function () { g.prepRaf = requestAnimationFrame(function () { g.prepRaf = 0; if (gesture === g && !g.done) prep(g, true); }); });
      return true;
    }
    /* the frame after the lift: the room's build finished and a pending gravity placed (every plate at its rect before
       anything slides), the preview elements made, and the landing (a move) or the outline (a resize) shown on the slot.
       Once per gesture; show false (a release that came first) skips the preview. */
    function prep(g, show) {
      if (g.prepped) return;
      g.prepped = true;
      if (g.prepRaf) { cancelAnimationFrame(g.prepRaf); g.prepRaf = 0; }
      var whole = !streaming && !lateHeld && !refreshQ && !pendingOld;
      completeStream();
      flushGravity();
      if (!whole) g.cards = cardsNow();
      ensurePreviews();
      opLater();   /* the board's data-op, in the idle period after this frame */
      if (show === false) return;
      if (g.type === 'move') glide(landing, g.target, 'landing'); else showOutline(g, g.target);
    }
    /* a press on a head (or the grip) pre-warms its plate: the plate takes its own compositor layer as it is pressed, so
       its raster (and in a fresh browser the GPU's first programs for it) is under way before the 4 px threshold, and the
       lift has nothing new to raster but its shadow. The lift took that layer anyway, so text shows the same once the
       plate lifts; a press that ends without a drag gives the layer back. P1000, Basic Dark, Overview, the pre-warm alone
       on the old pick-up: threshold to the first lifted frame on screen 102 -> 57-61 ms on a second drag, 470-810 ->
       150-340 ms on a first one (with the rest of the pick-up: about 110 -> 23 ms, 811 -> 24 ms). Glass plates have a
       layer already (their backdrop). */
    function warm(g) { g.warm = true; g.card.style.willChange = 'transform'; }
    function unwarm(g) { if (!g.warm) return; g.warm = false; g.card.style.willChange = ''; }
    /* this board's hold on the carry frost (frostHold): taken at the press, so the swap lands before the lift's frame, and
       given back once the board is still (no gesture, no settle, no peer glide, no float-up pending, no morph: read on
       expandos, never a layout or style read), at most 2 s after the release; a press that never lifts gives it back at
       once */
    var frosted = false, frostT = 0;
    function frost() {
      if (frosted || dead || FROST_OFF || softGpu() || PMU.motion.family() !== 'glass') return;
      frosted = true; frostHold(true);
    }
    function unfrost() {
      if (!frosted || frostT) return;
      var t0 = performance.now();
      (function check() {
        frostT = 0;
        if (!frosted) return;
        if (!dead && gesture && !gesture.done) return;   /* a new gesture on this board keeps it; its end asks again */
        var moving = !dead && (!!gravityMap || !!gravityT || !!(morphEl && morphEl._pmuMorph) ||
          cardsNow().some(function (c) { return !!(c._pmuSlide || c._pmuSettle); }));
        if (moving && performance.now() - t0 < 2000) { frostT = setTimeout(check, 50); return; }
        frosted = false; frostHold(false);
      })();
    }
    /* the first drag's pre-warm (t3-usage-pm7's recipe, measured on the P1000 2026-10-11). A page's first drag drew what
       the GPU had never drawn: a plate in a layer of its own with its lift shadow, then (in the drop, or mid-carry before
       frameMove kept the lifted plate from repainting) the same plate repainted at the lift's scale, which compiled the
       programs for every kind of mark in it, 300-600 ms of GPU, plus the landing's dashed slot and a slide. So once per
       look (and per Reduce Motion state) and board, in an idle period after a shown board's build, a copy of a plate in view
       (its content too, with no ids, inert and hidden from assistive tech) goes through a drag at 1 % opacity inside a
       copy of the board's class (so the board's own rules draw it): pressed (hovered, in its own layer at scale 1), lifted
       at scale 1, scaled, repainted as the drop repaints it, and slid once, while the landing shows on that plate's slot
       at 1 %. Under Reduce Motion it does not slide, as a Reduce Motion lift's peers do not. Nothing visible changes,
       nothing takes focus, nothing in the board moves (the copy is absolutely placed over its plate; the landing is a grid
       item on that plate's own slot), and nothing runs on a hidden board, without a GPU, during a gesture, a held build or
       a film. ?pmu-prewarm=0 leaves it out. Tries are spent only on a shown board that is busy (12, 0.9 s apart): while
       the page's GPU answer is not in, it waits for it, and a hidden board waits for its show; every mount, build, show
       and look change starts a fresh round (prewarmSoon(ms, true)). */
    var prewarmT = 0, prewarmTries = 0, prewarmEl = null;
    function prewarmKey() { return lookKey() + (reduced() ? ':rm' : ''); }
    function prewarmSoon(ms, fresh) {
      if (fresh) prewarmTries = 0;
      if (PREWARM_OFF || gpuNow() === false || prewarmT || prewarmEl || dead || PREWARMED[prewarmKey()]) return;
      prewarmT = setTimeout(function () {
        prewarmT = 0;
        if (window.requestIdleCallback) requestIdleCallback(prewarm, { timeout: 2000 }); else prewarm();
      }, (ms || 1200) * speed());
    }
    function prewarm() {
      var key = prewarmKey();
      if (dead || prewarmEl || PREWARMED[key]) return;
      var gpu = gpuNow();
      if (gpu === false) return;
      if (gpu === null) { prewarmSoon(Math.max(900, 7100 - performance.now()) / speed()); return; }
      var usageOff = !hosted && !(rootEl && rootEl.closest && rootEl.closest('#panel-usage.active'));
      if (!shownFlag || usageOff || document.hidden) return;
      var busy = !!gesture || !!ACTIVE || !current.mounted || !!streaming || !!lateHeld || !!refreshQ || !!gravityMap ||
        !boardEl || boardEl.hasAttribute('data-held') || boardEl.hasAttribute('data-film') || !current.cls || (PMU.film && PMU.film.moment && PMU.film.moment()) ||
        softGpu() || !scroll || !scroll.clientWidth;
      var cards = busy ? [] : cardsNow().filter(function (c) { return inView(c) && !c.hasAttribute('data-pending') && c.getAttribute('data-head') !== 'band' && c.querySelector(':scope > .pmu-cardbody > *'); });
      var card = cards.filter(function (c) { return c.getAttribute('data-head') === 'plate'; })[0] || cards[0];
      if (!card) { if (++prewarmTries < 12) prewarmSoon(900); return; }
      PREWARMED[key] = true;
      var r = rectOfCard(card), p = px(r), rm = reduced(), s = liftScale();
      var host = prewarmEl = document.createElement('div');
      host.className = 'pmu-board'; host.setAttribute('aria-hidden', 'true'); host.setAttribute('data-pmu-prewarm', ''); host.setAttribute('data-pm-hover-exempt', ''); host.inert = true;
      host.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;padding:0;margin:0;border:0;background:none;overflow:visible;pointer-events:none';
      var copy = card.cloneNode(true);
      ['id', 'data-widget', 'tabindex', 'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-grabbed'].forEach(function (a) { copy.removeAttribute(a); });
      Array.prototype.forEach.call(copy.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
      copy.classList.remove('pmh-out', 'pmh-near', 'pmh-mv');
      /* as a plate is pressed: hovered (PMH's light at full, its Reduce Motion form under Reduce Motion), in a layer of its
         own at scale 1 */
      copy.classList.add('pmh-on');
      copy.style.setProperty('--pmh-i', '1'); copy.style.setProperty('--pmh-x', (p.w / 2) + 'px'); copy.style.setProperty('--pmh-y', '24px');
      copy.style.position = 'absolute'; copy.style.margin = '0'; copy.style.left = p.l + 'px'; copy.style.top = p.t + 'px';
      copy.style.width = p.w + 'px'; copy.style.height = p.h + 'px'; copy.style.opacity = '0.01'; copy.style.willChange = 'transform';
      copy.style.transform = 'translate3d(0px,0px,0)';
      host.appendChild(copy);
      boardEl.appendChild(host);
      ensurePreviews();
      var showLanding = landing && landing.hidden && !landing._pmuHiding;
      if (showLanding) { gridPlace(landing, r); landing.style.opacity = '0.01'; landing.hidden = false; }
      /* then frame by frame what a drag draws: the lift's paint at scale 1 (frameMove's lift frame), the lift's scale, the
         drop's paint at that scale (the settle repaints the plate while it is still scaled), and one peer's slide */
      var n = 0, slide = null, lifted = 'translate3d(0px,' + (s === 1 ? 0 : -6) + 'px,0) scale(' + s + ')';
      var step = function () {
        if (prewarmEl !== host) return;
        n++;
        if (n === 1) { PMH_PROPS.forEach(function (pp) { copy.style.removeProperty(pp); }); copy.classList.remove('pmh-on'); copy.setAttribute('data-lifted', ''); }
        else if (n === 2) copy.style.transform = lifted;
        else if (n === 3) { copy.removeAttribute('data-lifted'); copy.setAttribute('data-settling', ''); }
        else if (n === 4 && !rm) slide = PMU.motion.animate(copy, [{ transform: 'translate3d(8px,2px,0) scale(' + s + ')' }, { transform: lifted }], { dur: 250, ease: 'slide' });
        else if (n >= 6) { prewarmEnd(); return; }
        requestAnimationFrame(step);
      };
      prewarmEnd = function () {
        prewarmEnd = function () {};
        if (slide) { try { slide.cancel(); } catch (e) {} }
        if (host.parentNode) host.parentNode.removeChild(host);
        if (prewarmEl === host) prewarmEl = null;
        if (showLanding && landing) { landing.style.opacity = ''; if (!landing._pmuRect) landing.hidden = true; }
      };
      requestAnimationFrame(step);
    }
    /* a gesture, a mount or a teardown that comes first ends it at once */
    var prewarmEnd = function () {};
    /* ---- the raster room (P2-03; PMU.film's warm raster, 05-film.css data-pmu-raster): while the Usage page is laid out
       unseen for the warm build, the first screen of another room (Costs, Accounts) is built in the hidden spare board
       element, drawn once by the film at opacity .004 so the GPU compiles what that room draws, and torn down. Its chrome in
       one idle task (one child-list change), then its bodies final (no entrance, nothing cued: tierPass mode false) in idle
       slices of at most 8 ms. The spare keeps its hidden attribute: it is laid out only while the panel carries the film's
       "spare" token (data-pmu-raster-room). It never touches the shown or warm board, emits nothing (no 'mount' or 'built':
       no warm drop, no pre-warm), and any mount clears it first, so a room change always finds the spare empty. The Usage
       board only. ---- */
    var rasterJob = null;
    /* step(fn), when given, runs each slice instead of an idle callback (the film's cpu steps on the page-wide idle-warm
       queue, PM_WARM; fn takes the step's idle deadline) */
    function rasterRoom(room, onBuilt, step) {
      if (hosted || dead || !bo.rooms || !current.cls || !scroll || !boardEl || rasterJob || calm || streaming || gesture) return null;
      var sp = spareBoard();
      if (sp.firstChild || sp === boardEl) return null;
      var rects = layoutFor(room), all = visibleIds(room), byId = {};
      rects.forEach(function (r) { byId[r.id] = r; });
      /* what the room's first screen shows (the board scrolls to its top on a room change); only viewport tiles are rastered */
      var top = padCache ? padCache.t : 0, vh = view.h || (window.innerHeight || 900);
      var ids = all.filter(function (id) { return byId[id] && top + byId[id].y * ROW < vh + 24; });
      if (!ids.length) return null;
      Array.prototype.slice.call(boardEl.attributes).forEach(function (at) { if (at.name !== 'id' && at.name !== 'class' && at.name !== 'hidden' && at.name !== 'style' && !/^data-(film|op|held|hold-bodies|pm-hover-exempt)$/.test(at.name)) sp.setAttribute(at.name, at.value); });
      /* (no class or hidden write: Glass's and the hover controller's observers watch those) */
      if (sp.className !== 'pmu-board') sp.className = 'pmu-board';
      sp.style.gridTemplateColumns = 'repeat(' + current.cls.tracks + ', minmax(0px, 1fr))';
      sp.setAttribute('data-cls', current.cls.name);
      sp.setAttribute('data-room', room);
      sp.setAttribute('aria-hidden', 'true');
      sp.setAttribute('data-pmu-raster-room', '');
      var job = rasterJob = { room: room, el: sp, cards: [], queue: [], built: false, at: performance.now() };
      var idle = step ? function (fn) { step(fn); } : window.requestIdleCallback || function (fn) { return setTimeout(function () { fn({ timeRemaining: function () { return 8; }, didTimeout: false }); }, 40); };
      var heroId = heroOf(rects, ids, room);
      /* a build that throws tears the spare down and tells the film (onBuilt(null)), which goes on to its next room: the
         panel is never left laid out and inert waiting for a room that will not come */
      function failed(error) {
        console.error('[pm-usage] raster room', error);
        if (rasterJob !== job) return;
        rasterClear();
        if (onBuilt) { try { onBuilt(null); } catch (e2) { console.error('[pm-usage] raster room', e2); } }
      }
      idle(function () {
        if (rasterJob !== job) return;
        try {
          var frag = document.createDocumentFragment();
          job.cards = ids.map(function (id) { var c = buildCard(id, room, byId[id]); markHero(c, heroId); frag.appendChild(c); return c; });
          sp.appendChild(frag);
          job.queue = readingOrder(job.cards);
        } catch (error) { failed(error); return; }
        idle(slice, { timeout: 2000 });
      }, { timeout: 2000 });
      function slice(deadline) {
        if (rasterJob !== job) return;
        var t0 = performance.now(), n = 0, budget = deadline && deadline.timeRemaining ? Math.min(8, Math.max(1, deadline.timeRemaining())) : 8;
        try {
          fitSliced(function () {
            while (job.queue.length && (!n || performance.now() - t0 < budget)) { var c = job.queue.shift(); if (c.isConnected) { tierPass([c], false); n++; } }
          });
        } catch (error) { failed(error); return; }
        if (job.queue.length) { idle(slice, { timeout: 2000 }); return; }
        job.built = true;
        job.ms = Math.round(performance.now() - job.at);
        if (onBuilt) { try { onBuilt({ room: room, cards: job.cards.length, ms: job.ms }); } catch (error) { console.error('[pm-usage] raster room', error); } }
      }
      return { room: room, cards: ids.length };
    }
    /* the spare goes back to empty and hidden: it stops being laid out the moment its attribute goes (display: none), so
       emptying it lays nothing out */
    function rasterClear() {
      rasterJob = null;
      var sp = scroll && scroll.querySelector(':scope > .pmu-board[data-pmu-raster-room]');
      if (!sp) return;
      sp.removeAttribute('data-pmu-raster-room');
      sp.removeAttribute('aria-hidden');
      Array.prototype.forEach.call(sp.querySelectorAll(':scope > .pmu-card'), destroyCard);
      sp.textContent = '';
      if (sp !== boardEl) sp.removeAttribute('style');
    }
    function cardTitle(id) { var d = PMU.widgets.get(id) || {}; try { return typeof d.title === 'function' ? d.title({ id: id, room: current.room, state: st }) : (d.title || id); } catch (e) { return id; } }
    /* release: commit (one command) or settle / glide back */
    function endGesture(g, how, instant) {
      if (!g || g.done) return;
      prep(g, false);   /* a release before the frame after the lift: the board is made whole first, nothing is shown */
      g.done = true;
      cancelAnimationFrame(g.raf);
      unwarm(g);
      if (gesture === g) gesture = null;
      releaseGesture();
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
          receipt = cmd('cmd.widget.move', { room: room, widget_id: g.id, from: { x: g.me.x, y: g.me.y }, to: { x: g.target.x, y: g.target.y }, board_class: cls,
            moved_peers: peers.map(function (r) { return { widget_id: r.id, to: { x: r.x, y: r.y } }; }), source: g.source || (g.kb ? 'keyboard' : 'pointer') }, { moved: true });
        } else {
          /* a preset reached by Shift steps is kept as the panel's preset at this class, as a pick in the size menu is (its
             table id is then the record's preset_id and survives a reload) */
          if (g.kbPick && g.kbPick.w === g.target.w && g.kbPick.h === g.target.h && PMU.cards.notePick) PMU.cards.notePick(g.id, g.kbPick.pid, g.target.w, g.target.h, api);
          var pid = PMU.cards.sizeId(kindSpec(g.id), g.target.w, g.target.h, g.id, api);
          var form = PMU.cards.headForm(PMU.widgets.get(g.id) || {}, g.target.w, g.target.h, current.cls.pitchX);
          var tt = tierOf(g.target.w * current.cls.pitchX - GAP - 28, g.target.h * ROW - GAP - (PMU.cards.HEAD_PX[form] || 34) - (form === 'plate' ? 16 : 10));
          receipt = cmd('cmd.widget.resize', { room: room, widget_id: g.id, from: { x: g.me.x, y: g.me.y, w: g.me.w, h: g.me.h },
            to: { x: g.target.x, y: g.target.y, w: g.target.w, h: g.target.h }, board_class: cls, preset_id: pid || null, semantic_tier_id: tt.w + '.' + tt.h,
            moved_peers: peers.map(function (r) { return { widget_id: r.id, to: { x: r.x, y: r.y } }; }), source: g.source || (g.kb ? 'keyboard' : 'pointer') }, { resized: true });
        }
        g.receipt = receipt;
        if (receipt.dispatch_accepted === false) { changed = false; how = 'rejected'; }
      }
      if (changed) {
        saveLayout(current.room, g.final || g.preview);
        revisions[g.id] = (revisions[g.id] || 0) + 1;
        committed(g.source);
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
      if (g.kb && !g.api && card.isConnected) card.focus({ preventScroll: true });
      if (!g.kb && g.started) suppressClick();
      unfrost();
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
    /* coordinator decision 1 (WOW-SPEC 3.11, 3.13): after a move or resize settles, (1) every peer the gesture displaced
       takes the highest free place above where the resolver put it, preferring the freed region (the active card's old
       rect), then the row, then the column nearest its own; (2) every card but the active one floats straight up into
       the hole above it, in reading order, so the order is kept; (1) and (2) run twice, since a float can open a place
       for a displaced card. Every rect of the room (all levels, hidden ones too) takes part, so no level ever overlaps
       another; the active card stays where it was put. Pure but for the board's shown panels. */
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
      warm(g);
      frost();
      attach(g);
    }
    function attach(g) {
      window.addEventListener('pointermove', g.onMove, true);
      window.addEventListener('pointerup', g.onUp, true);
      window.addEventListener('pointercancel', g.onCancel, true);
      window.addEventListener('blur', g.onBlur);
    }
    function detach(g) {
      unwarm(g);
      unfrost();
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
      /* the presets' fit heights measure while the page is idle, so a Shift step has them (lane c-presets) */
      if (g.type === 'resize' && PMU.cards.warmFits) PMU.cards.warmFits(id, function () { return gesture === g && !g.done; }, api);
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
        /* the presets offered at this board class, a fit preset at its measured height (lane c-presets) */
        /* ranked on the heights known now (measured, the last picker's, or the kind's fallback); only the preset a step
           lands on is measured, if it still has to be (one fit, not every preset's in one key press) */
        /* every preset the board can give (a card in the right half moves left to take a wider one, as the picker does) */
        var presets = (PMU.cards.presets ? PMU.cards.presets(g.id, api) : []).filter(function (p) { return p.w <= cls.tracks; });
        var horiz = key === 'ArrowRight' || key === 'ArrowLeft', fwd = key === 'ArrowRight' || key === 'ArrowDown';
        var toward = function (p) { var a = horiz ? p.w : p.h, b = horiz ? r.w : r.h; return fwd ? a > b : a < b; };
        /* by width the direction is known; by height a preset not measured yet is ranked on its known height, and only
           where none is left in that direction are the rest measured */
        var cands = presets.filter(toward);
        if (!horiz && !cands.length) cands = presets.filter(function (p) { return !p.measured; });
        cands.sort(function (p, q) {
          var pa = horiz ? p.w : p.h, qa = horiz ? q.w : q.h;
          if (pa !== qa) return fwd ? pa - qa : qa - pa;
          return Math.abs((horiz ? p.h : p.w) - (horiz ? r.h : r.w)) - Math.abs((horiz ? q.h : q.w) - (horiz ? r.h : r.w));
        });
        for (var ci = 0; ci < cands.length; ci++) {
          var cp = cands[ci], ch = PMU.cards.presetH ? PMU.cards.presetH(g.id, cp, api) : cp.h;
          if (toward({ w: cp.w, h: ch })) { r.w = cp.w; r.h = ch; r.x = Math.min(r.x, cls.tracks - r.w); g.kbPick = { pid: cp.id, w: r.w, h: r.h }; break; }
        }
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
    /* (the hover is PMH's, the merged hover engine of PMConcept7, opus-5.5 src/js/18-hover.js: it rides the app's one
       pointer-move dispatcher, rests through every gesture of this board and lights a plate from CSS only;
       20-board.css. The board has no pointer-move listener of its own.) */
    /* the listeners sit on the scroll pane: a room change swaps the board element (the old one leaves as the ghost); the
       document's Escape and selectstart listeners are the module's, for the board that holds the gesture (D10 2.10) */
    var onScrollKey = function (event) { if (boardEl.contains(event.target)) onKeyDown(event); };
    var onDragStart = function (event) { if (event.target.closest && event.target.closest('.pmu-card')) event.preventDefault(); };
    if (boardEl && scroll) {
      scroll.addEventListener('pointerdown', onPointerDown);
      scroll.addEventListener('keydown', onScrollKey);
      scroll.addEventListener('dragstart', onDragStart);
    }
    inner.escape = function (event) { if (gesture && event.key === 'Escape' && !gesture.kb) { event.preventDefault(); endGesture(gesture, 'escape'); } };
    inner.selectstart = function (event) { if (gesture && !gesture.kb) event.preventDefault(); };
    inner.drop = function () { if (gesture) endGesture(gesture, 'cancel', true); };

    /* ---- API commits (size menu, keyboard-free callers, verifiers): same resolver, same motion ---- */
    function apiCommit(type, id, rect, source) {
      completeStream();
      flushGravity();
      var card = cardOf(id);
      var snap = snapshotNow(), me = snap.filter(function (r) { return r.id === id; })[0];
      if (!me) return null;
      /* api: a commit nobody's key or pointer made (the preset hold, the tour, a reload's fit, PM7_USAGE) leaves keyboard
         focus where it is; only the card's own size menu, a person's choice on that card, hands focus back to it */
      var g = { id: id, card: card, type: type, kb: true, api: source !== 'size_menu', started: true, source: source || 'api', snapshot: snap, me: me, target: rect };
      if (sameRect(rect, me)) return null;
      g.preview = gravity(resolve(snap, id, rect), id, me, snap, current.cls.tracks);
      g.previewFinal = true;
      if (!card) {
        /* not on the board (another level): commit the layout without motion */
        var receipt = cmd(type === 'move' ? 'cmd.widget.move' : 'cmd.widget.resize', { room: current.room, widget_id: id, from: me, to: rect, board_class: current.cls.name, source: g.source }, type === 'move' ? { moved: true } : { resized: true });
        if (receipt.dispatch_accepted !== false) { saveLayout(current.room, g.preview); revisions[id] = (revisions[id] || 0) + 1; committed(g.source); persist(); }
        return receipt;
      }
      if (gesture) endGesture(gesture, 'cancel', true);
      claimGesture();
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
    /* WS-020: a card set to a preset keeps that preset_id when the board's pitch or the preset's fit height changes (a look
       change, a reload in another look, a narrower board inside the class): it takes the preset's newly resolved size
       through the board's own resize path, instead of reading as a custom size. Runs after a mount (a room, a reload), a
       class change and a pitch change inside the class, while nothing else moves the board; a fit height that has to be
       measured first is measured in idle slices (PMU.cards.holdTarget hands back the job), then the pass runs again. */
    var holdT = 0;
    function scheduleHold(ms) { if (dead) return; clearTimeout(holdT); holdT = setTimeout(holdPass, ms == null ? 240 : ms); }
    function holdPass() {
      holdT = 0;
      if (dead || hosted && !shownFlag) return;   /* a hidden hosted board holds when it is shown again */
      if (FILM && FILM.warming && FILM.warming()) return;   /* a warm board holds at its arrival (holdSoon) */
      if (!current.mounted || !PMU.cards || !PMU.cards.holdTarget) return;
      if (gesture || (FILM && FILM.holding && FILM.holding())) { scheduleHold(500); return; }
      var room = current.room, wait = null;
      layoutFor(room).forEach(function (r) {
        var to = PMU.cards.holdTarget(r.id, r, api);
        if (!to) return;
        if (to.job) { wait = wait || to.job; return; }
        resize(r.id, { w: to.w, h: to.h }, 'preset_hold');
      });
      if (!wait) return;
      var idle = window.requestIdleCallback || function (fn) { return setTimeout(function () { fn({ timeRemaining: function () { return 12; } }); }, 30); };
      var step = function () {
        if (dead || current.room !== room) { wait.cancel(); return; }
        var t0 = performance.now();
        while (!wait.done && performance.now() - t0 < 8) wait.step();
        if (wait.done) scheduleHold(0); else idle(step, { timeout: 500 });
      };
      idle(step, { timeout: 500 });
    }
    listeners.mount = (listeners.mount || []).concat([function () { scheduleHold(); }]);
    listeners['class'] = (listeners['class'] || []).concat([function () { scheduleHold(); }]);
    /* a look change (D10 U4, WS-020): the Usage board holds too, so its fit-height presets re-resolve in the new look (a
       fit height is measured per look: Retro's mono face and NieR's capitals wrap rows the Basic face fits). Only the
       face counts (data-theme and NieR Mode, as the fit heights are kept); at the same pitch a card at a fixed preset
       already has its size, so only fit presets move. Heard from <html> itself, not PMU.theme.onChange: that one compares
       with the look last read, not the look last announced, so a change something reads before its frame passes
       unannounced (NieR Mode on and off, every time in a trace). A change while the Usage page is hidden (its pane 0
       wide: nothing can be measured) holds at the next width pass that sees the page. A dashboard hears its host's look
       through relook(). */
    var lookSeen = null, lookDirty = false;
    function lookKey() { var r = document.documentElement; return (r.getAttribute('data-theme') || 'basic-dark') + (r.getAttribute('data-o55-nier') === 'on' ? '+nier' : ''); }
    if (!hosted && window.MutationObserver) {
      lookSeen = lookKey();
      new MutationObserver(function () {
        var k = lookKey(); if (k === lookSeen) return;
        lookSeen = k;
        if (dead) return;
        if (current.mounted && view.w > 0) scheduleHold(); else lookDirty = true;
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
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
      var receipt = cmd(visible ? 'cmd.widget.add' : 'cmd.widget.remove', payload, { visible: !!visible });
      revisions[id] = (revisions[id] || 0) + 1;
      if (receipt.dispatch_accepted !== false) committed();
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
      if (bo.onShell) bo.onShell();
      emit('change', { op: visible ? 'show' : 'hide', id: id, receipt: receipt });
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
        if (b.y !== r.y || b.x !== r.x) receipts.push(cmd('cmd.widget.move', { room: room, widget_id: r.id, from: { x: b.x, y: b.y }, to: { x: r.x, y: r.y }, board_class: current.cls.name, source: 'tidy' }, { moved: true }));
      });
      var accepted = placed;
      if (receipts.some(function (rc) { return rc.dispatch_accepted === false; })) { PMU.shell.toast(t('board.rejected')); return receipts; }
      if (receipts.length) {
        receipts.forEach(function () { committed(); });
        saveLayout(room, accepted);
        persist();
        /* Tidy (WOW-SPEC 3.13): every card glides to its first-fit place, 420 SETTLE, 16 ms apart in reading order */
        flushGravity();
        slidePeers(toMap(accepted), null, 420, 'settle', 16);
        PMU.shell.toast(t('toast.tidied'));
        emit('change', { op: 'tidy', receipts: receipts });
      }
      return receipts;
    }
    function reset(scope) {
      ensure();
      var receipt = cmd('cmd.widget.reset_layout', { scope: scope || 'room', room: current.room || st.room }, { reset: true });
      /* a reset the dispatch rejects changes nothing, as Start from's does (review 2026-10-10) */
      if (receipt && receipt.dispatch_accepted === false) { PMU.shell.toast(t('board.rejected')); return receipt; }
      /* a dashboard's reset is to its own default set, whatever set it was started from (D10 P4); its Undo may put back
         the revision it came from */
      if (hosted) { startSet = null; startRows = null; var from = boardRev; committed(); undoMark = { rev: from, at: boardRev }; }
      if (scope === 'all') { st.layout = {}; st.hidden = {}; configs = {}; }
      else {
        delete st.layout[current.room]; delete st.hidden[current.room];
        layoutFor(current.room).forEach(function (r) { delete configs[r.id]; });
      }
      persist();
      if (current.mounted) { reconcile(layoutFor(current.room), { dur: 'morph', ease: 'settle' }); refresh('reset'); }
      if (bo.onShell) bo.onShell();
      emit('change', { op: 'reset', scope: scope || 'room', receipt: receipt });
      return receipt;
    }
    function config(id) { ensure(); return Object.assign({}, configs[id] || {}); }
    function setConfig(id, patch) {
      ensure();
      var c = configs[id] = Object.assign({}, configs[id] || {});
      Object.keys(patch || {}).forEach(function (k) { if (patch[k] == null || patch[k] === '') delete c[k]; else c[k] = patch[k]; });
      if (!Object.keys(c).length) delete configs[id];
      var receipt = cmd('cmd.widget.configure', { room: current.room, widget_id: id, configuration_refs: cfgRefs(c), source: 'gear' }, { configured: true });
      revisions[id] = (revisions[id] || 0) + 1;
      if (receipt.dispatch_accepted !== false) committed();
      persist();
      var card = cardOf(id); if (card) PMU.cards.update(card, 'config');
      emit('change', { op: 'config', id: id, receipt: receipt });
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
    /* the board width decides the class (24 px hysteresis); within a class, bodies re-measure (debounced for dock drags).
       The Usage board hears it from a ResizeObserver on its scroll pane; a hosted board from its host (hostResize). */
    var roTimer = 0, roPending = 0, ro = null;
    function onWidth() {
      var W = boardWidth(); if (W <= 0) return;
      if (lookDirty) { lookDirty = false; if (current.mounted) scheduleHold(); }   /* a look change while the page was hidden */
      if (current.pending || !current.mounted) { mount(current.room || st.room, FILM && FILM.holding() ? { held: true, onBuilt: FILM.rehold() } : {}); return; }
      var next = pickClass(W);
      if (!current.cls || next.name !== current.cls.name) {
        if (gesture) endGesture(gesture, 'cancel', true);
        var prev = current.cls ? current.cls.name : null, prevCls = current.cls;
        current.cls = next;
        /* while the first arrival holds the board, a class change rebuilds it held (never the instant remount that
           cancelled the entrance, MOTION-REVIEW-2 item 1) */
        if (FILM && FILM.holding()) mount(current.room, { held: true, onBuilt: FILM.rehold() });
        else reclass(prevCls);
        emit('class', { cls: next.name, from: prev });
        return;
      }
      var pitchMoved = !current.cls || Math.abs((current.cls.pitchX || 0) - (next.pitchX || 0)) > 0.01;
      current.cls = next;
      if (!gesture) cardsNow().forEach(function (c) { place(c, rectOfCard(c)); });
      if (pitchMoved) scheduleHold(400);
      if (FILM && (FILM.holding() || FILM.warming && FILM.warming())) return;   /* the held and warm builds measure each card in its own slice */
      clearTimeout(roTimer);
      roTimer = setTimeout(function () { if (!gesture) tierPass(cardsNow(), false); }, 120);
    }
    if (widthFrom === 'observe' && scroll && window.ResizeObserver) {
      ro = new ResizeObserver(function (entries) {
        if (entries && entries[0] && entries[0].contentRect) {
          var cr = entries[0].contentRect;
          view.h = cr.height;
          if (Math.abs((view.w || 0) - cr.width) >= 0.5) { view.w = cr.width; view.wAt = performance.now(); }
        }
        if (roPending) return;
        roPending = requestAnimationFrame(function () { roPending = 0; onWidth(); });
      });
      ro.observe(scroll);
    }

    /* ---- the hosted board's own members (D10 3.3) ---- */
    function readView() {
      if (!scroll) return;
      var w = scroll.clientWidth;
      view.top = scroll.scrollTop; view.h = scroll.clientHeight;
      if (Math.abs((view.w || 0) - w) >= 0.5) { view.w = w; view.wAt = performance.now(); }
    }
    /* D10 2.8: the host's size, batched per frame. While it still moves (final false: a divider drag, a glide) the board
       is only marked, and the grid's fr tracks stretch the cards meanwhile; the final size is read once (the layout is
       settled then) and runs the observer's pass: the pending mount, a class change, an in-class pitch change. A hidden
       board keeps the mark for its next show. */
    function hostResize(size) {
      if (dead || widthFrom !== 'host') return;
      if ((size && size.final === false) || hosted && !shownFlag) { sizeDirty = true; return; }
      sizeDirty = false;
      readView();
      onWidth();
    }
    /* hide: the gesture ends, an owned menu closes, the sliced refresh and the hold stop; nothing runs until show */
    function hide() {
      if (!hosted || dead || !shownFlag) return;
      shownFlag = false;
      if (gesture) endGesture(gesture, 'cancel', true);
      if (PMU.menu && menuOwned()) PMU.menu.close();
      if (refreshQ) { refreshQ.cancelled = true; refreshQ = null; dirty = true; }
      if (liveQ) { liveStop(); dirty = true; }   /* a beat's patch cut short: the show refreshes */
      clearTimeout(holdT); holdT = 0;
      if (roTimer) { clearTimeout(roTimer); roTimer = 0; sizeDirty = true; }
    }
    /* show: mount if pending; a size that came while hidden is read now; data that moved while hidden (the epoch, a
       refresh cut short) re-reads Settings and the roster and refreshes in slices, in view first; then the preset hold */
    function show() {
      if (!hosted || dead) return;
      shownFlag = true;
      var fresh = !current.mounted;
      if (fresh || current.pending || sizeDirty) { sizeDirty = false; readView(); onWidth(); }
      if (!fresh && current.mounted && (dirty || seenEpoch !== EPOCH)) {
        dirty = false; seenEpoch = EPOCH; liveKeys = null; liveLead = null; liveMerged = 0;
        if (PMU.settings && PMU.settings.invalidate) PMU.settings.invalidate('page');
        if (PMU.roster && PMU.roster.invalidate) PMU.roster.invalidate();
        refresh('page', { sliced: true });
      } else liveTry();   /* only the beats it missed: the cards their shares match */
      if (current.mounted) { scheduleHold(); prewarmSoon(0, true); }
      /* the live film's tick (15-film.js) is subscribed once the demo engine runs, also when Usage was never opened */
      if (PMU.live && PMU.live.wake) PMU.live.wake();
    }
    /* a look change (the host's onLook): the preset hold re-measures the per-look fit heights; hidden, at the next show */
    function relook() {
      if (dead) return;
      if (shownFlag && current.mounted) { scheduleHold(0); prewarmSoon(0, true); } else dirty = true;
    }
    inner.touch = function (reason) {
      if (!hosted || dead) return;
      if (shownFlag && current.mounted && !current.pending) { seenEpoch = EPOCH; liveKeys = null; liveLead = null; liveMerged = 0; refresh(reason || 'data', { sliced: true }); } else dirty = true;
    };
    /* ---- live beats (D10 P12): a beat's share keys reach every dashboard (PMU.boards.live.beat, from the live film). A
       shown one patches the cards they match, as the Usage page's beat does (15-film.js flush): in slices of about 6 ms, in
       view first, the first slice in the beat's own task, through PMU.cards.update(card, 'live'). A hidden one keeps the
       keys for its show; a held one (a gesture, its own sliced refresh, a menu, a crosshair, the tour, onboarding, the tab
       hidden) until the next tick that finds the hold over. Nothing runs between beats. ---- */
    function liveHeld() {
      var r = document.documentElement;
      if (document.hidden) return 'tab';
      if (r.hasAttribute('data-o55-open')) return 'onboarding';
      if (r.hasAttribute('data-o55-tour')) return 'tour';
      if (gesture) return 'gesture';
      if (refreshQ) return 'refresh';
      if (PMU.menu && PMU.menu.isOpen && PMU.menu.isOpen()) return 'menu';
      if (PMU.charts && PMU.charts.crosshairOn ? PMU.charts.crosshairOn() : !!(boardEl && boardEl.querySelector('.pmu-xh-on'))) return 'crosshair';
      return null;
    }
    function liveStop() { if (liveRaf) { cancelAnimationFrame(liveRaf); liveRaf = 0; } liveQ = null; }
    function liveTry() {
      if (!liveKeys || dead || !shownFlag || !current.mounted || current.pending) return false;
      liveStat.held = liveHeld();
      if (liveStat.held) return false;
      var keys = Object.keys(liveKeys), lead = liveLead || [], merged = liveMerged; liveKeys = null; liveLead = null; liveMerged = 0;
      var hit = cardsNow().filter(function (c) { return liveHit(c, keys); });
      var order = readingOrder(hit.filter(inView)).concat(readingOrder(hit.filter(function (c) { return !inView(c); })));
      liveStat.beats++;
      liveStat.last = { at: Math.round(performance.now()), shares: keys.length, cards: order.map(function (c) { return c.getAttribute('data-widget'); }) };
      /* the lead's place is read before anything is written (one read, clean layout); its light comes with the first
         slice */
      liveLeadRect = order.length ? leadRect(order, lead) : null;
      liveStat.last.lead = liveLeadRect ? liveLeadRect.id : null;
      /* the kind's Live mark pulses on it (the Usage page's indicator pulses on every beat; PMU.live.pulse draws it) */
      emit('beat', { at: liveStat.last.at, cards: liveStat.last.cards.slice(), shares: keys.length, beats: Math.max(1, merged), lead: liveStat.last.lead, reduced: reduced() });
      if (!order.length) return true;
      /* a patch still running takes the new cards at its end (each reads the latest readings when its turn comes) */
      if (liveQ) { order.forEach(function (c) { if (liveQ.indexOf(c) < 0) liveQ.push(c); }); return true; }
      liveQ = order;
      liveStep();
      return true;
    }
    function liveStep() {
      liveRaf = 0;
      var q = liveQ; if (!q || dead) return;
      var ts = performance.now(), first = true;
      fitSliced(function () {
        while (q.length && (first || performance.now() - ts < 6)) {
          var c = q.shift(); first = false;
          if (c.isConnected) { try { PMU.cards.update(c, 'live'); liveStat.patched++; } catch (error) { console.error('[pm-usage] live patch', error); } }
        }
      });
      if (liveLeadRect) { var lr = liveLeadRect; liveLeadRect = null; liveLight(lr); }
      if (q.length && liveQ === q) liveRaf = requestAnimationFrame(liveStep); else if (liveQ === q) liveQ = null;
    }
    /* the board's own light layer: in its scroll pane, above the plates (05-film.css .pmu-flight, z-index 45), so the
       light scrolls with its reading and the pane clips it; made at the first light (the Usage page's #pmuFlight lives in
       #pmuApp, which Home hides) */
    function flyLayer() {
      if (!scroll) return null;
      if (!flyEl || flyEl.parentNode !== scroll) { flyEl = document.createElement('div'); flyEl.className = 'pmu-flight'; flyEl.setAttribute('aria-hidden', 'true'); scroll.appendChild(flyEl); }
      return flyEl;
    }
    /* the lead (15-film.js lead): the first lead key a patched card in view shows, lit in the nearest reading host it
       sits in (PMU.live.LEAD_HOST: a KPI cell, a row, a column), measured from the board's light layer */
    function leadRect(cards, keys) {
      var layer = keys.length && PMU.film && PMU.film.lightAt ? flyLayer() : null;
      if (!layer) return null;
      var host = PMU.live && PMU.live.LEAD_HOST, seen = {}, o = null;
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i]; if (seen[k]) continue; seen[k] = true;
        for (var j = 0; j < cards.length; j++) {
          if (!inView(cards[j])) continue;
          var el = cards[j].querySelector('[data-share="' + cssq(k) + '"], [data-share-v="' + cssq(k) + '"]');
          if (!el) continue;
          var at = (host && el.closest(host)) || el; if (!cards[j].contains(at)) at = el;
          var r = at.getBoundingClientRect(); o = o || layer.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height, id: cards[j].getAttribute('data-widget') };
        }
      }
      return null;
    }
    /* the light in the look's own voice (PMU.film.lightAt: the flash, with a GPU the sweep or Glass's glint); under
       Reduce Motion its calm version (one slow opacity rise and fall of the flash tint) */
    function liveLight(r) {
      var layer = flyLayer(); if (!layer || !shownFlag) return;
      try { PMU.film.lightAt(r, { layer: layer, calm: true }); } catch (error) { console.error('[pm-usage] live light', error); }
    }
    if (hosted) {
      inner.live = function (keys, lead) {
        if (dead) return;
        liveKeys = liveKeys || {};
        keys.forEach(function (k) { liveKeys[k] = true; });
        /* the newest beat's lead first, as the Usage page orders the leads it keeps */
        if (lead && lead.length) liveLead = lead.concat(liveLead || []).slice(0, 24);
        liveMerged++;
        liveTry();
      };
      inner.liveTry = liveTry;
      /* a shown dashboard that holds a Usage widget wants the beats */
      inner.liveWanted = function () { return !dead && shownFlag && current.mounted && cardsNow().some(function (c) { return usageId(c.getAttribute('data-widget')); }); };
    }
    /* the board's own view (D10 2.5): range and scope; the Usage board's is the page's (46-shell.js setView) */
    function setView(v) {
      ensure(); v = v || {};
      if (dead) return false;
      var changed = null;
      if (['5h', '24h', '7d', '30d'].indexOf(v.range) >= 0 && v.range !== st.range) { st.range = v.range; changed = 'range'; }
      if (typeof v.scope === 'string' && v.scope && v.scope !== st.scope) { st.scope = v.scope; changed = changed || 'scope'; }
      if (!changed) return false;
      persist();
      if (current.mounted && shownFlag) refresh(changed); else dirty = true;
      return true;
    }
    /* add (D10 3.3): a widget not on the board, at the standard preset of this class (else the first it offers), in the
       first free slot (no card moves); one cmd.widget.add with the Usage payload. A hidden one comes back (setVisible);
       one on the board is only revealed. The group kind is refused. */
    function add(id, o) {
      ensure(); o = o || {};
      if (dead) return null;
      /* a widget of another source (D10 P3): only on a dashboard, its source registered; a definition the registry does not
         have yet comes from the source's build */
      var src = sourceOf(id), item = src && !src.builtin ? sourceItem(src, String(id)) : null;
      if (!src || (!src.builtin && (bo.rooms || !item))) return null;
      var def = PMU.widgets.get(id);
      if (!def && src.build) {
        try { var made = src.build(String(id), item); if (made && typeof made === 'object') PMU.widgets.define(String(id), made); } catch (error) { console.error('[pm-usage] source build ' + id, error); }
        def = PMU.widgets.get(id);
      }
      if (!def || def.kind === 'group') return null;
      var room = current.room || st.room, hid = st.hidden[room] || {};
      var cls = current.cls || pickClass(boardWidth());
      var rects = layoutFor(room, cls), have = rects.some(function (r) { return r.id === id; });
      if (have && !hid[id]) { if (o.reveal !== false) reveal(id); return null; }
      if (have) { var back = setVisible(id, true); if (o.reveal !== false) reveal(id); return back; }
      var size = null;
      try {
        var list = PMU.cards && PMU.cards.presets ? PMU.cards.presets(id, api) : [];
        var p = list.filter(function (x) { return x.id === 'standard'; })[0] || list[0];
        if (p) size = { w: p.w, h: PMU.cards.presetH ? PMU.cards.presetH(id, p, api) : p.h, pid: p.id };
      } catch (error) { console.error('[pm-usage] board add preset', error); }
      if (!size && item && item.w > 0 && item.h > 0) size = { w: Math.round(item.w), h: Math.round(item.h), pid: null };   /* the source's own size */
      if (!size) { var ks = kindSpec(id); size = { w: Math.max(ks.wMin || 3, 6), h: Math.max(ks.hMin || 3, 6), pid: null }; }
      var rect = firstFitInto(rects, [{ id: id, w: Math.min(size.w, cls.tracks), h: size.h }], cls.tracks)[0];
      var receipt = cmd('cmd.widget.add', { room: room, widget_id: id }, { visible: true });
      if (receipt.dispatch_accepted === false) { PMU.shell.toast(t('board.rejected')); return receipt; }
      if (size.pid && PMU.cards.notePick) PMU.cards.notePick(id, size.pid, rect.w, rect.h, api);
      /* the other classes this room was edited at take it too, in their first free slot (a class never edited projects
         from the nearest edited one, so it has it as well) */
      st.layout[room] = st.layout[room] || {};
      Object.keys(st.layout[room]).forEach(function (name) {
        var saved = st.layout[room][name], tracks = tracksOf(name);
        if (name === cls.name || !saved || !saved.length || saved.some(function (r) { return r.id === id; })) return;
        saved.push(firstFitInto(saved, [{ id: id, w: Math.min(rect.w, tracks), h: rect.h }], tracks)[0]);
      });
      st.layout[room][cls.name] = rects.concat([rect]).map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
      revisions[id] = (revisions[id] || 0) + 1;
      committed();
      persist();
      if (current.mounted) reconcile(layoutFor(room));
      if (bo.onShell) bo.onShell();
      if (o.reveal !== false) reveal(id);
      emit('change', { op: 'add', id: id, receipt: receipt });
      return receipt;
    }
    /* the catalog (D10 3.3, P3): every Usage widget the board can be given, in the Usage rooms' order, then on a dashboard
       every other registered source's items in registration order; each with whether it is on this board now and its
       source (prefix '' and 'Usage' for Usage's own) */
    function catalog() {
      ensure();
      var room = current.room || st.room, hid = st.hidden[room] || {}, on = {};
      layoutFor(room).forEach(function (r) { if (!hid[r.id]) on[r.id] = true; });
      var out = catalogIds().map(function (e) {
        var d = PMU.widgets.get(e.id) || {};
        return { id: e.id, title: titleOf(e.id, e.room, st), kind: d.kind || null, level: d.level || 'glance', homeRoom: e.room,
          homeRoomLabel: e.room && ROOM[e.room] ? ROOM[e.room].label : null, on: !!on[e.id], addable: !on[e.id], source: '', sourceLabel: SRC[''].label };
      });
      if (bo.rooms) return out;
      SOURCES.forEach(function (s) {
        if (s.builtin) return;
        sourceItems(s).forEach(function (it) {
          if (it.kind === 'group') return;
          out.push(Object.assign(it, { title: it.title || it.id, kind: it.kind || null, level: it.level || 'glance', homeRoom: null, homeRoomLabel: null,
            on: !!on[it.id], addable: !on[it.id], source: s.prefix, sourceLabel: s.label }));
        });
      });
      return out;
    }
    /* reveal: the card scrolled into view (grid geometry, one read of the pane) and marked by one seat */
    function reveal(id) {
      var card = cardOf(id); if (!card || !scroll || !current.cls) return false;
      var p = px(rectOfCard(card)), v = viewNow(true);
      if (p.t < v.top || p.t + p.h > v.top + v.h) { scroll.scrollTop = Math.max(0, p.t - 12); view.top = scroll.scrollTop; }
      seat(card);
      return true;
    }
    function focusFirst() { var c = readingOrder(cardsNow())[0]; if (!c) return false; c.focus({ preventScroll: false }); return true; }
    /* reload: the store read again (a tour restore wrote it) and the board mounted at once */
    function reload() {
      if (dead) return false;
      reread();
      emit('change', { op: 'reload' });
      return true;
    }
    function reread() {
      if (gesture) endGesture(gesture, 'cancel', true);
      clearTimeout(saveTimer); saveTimer = 0; savePending = false;
      loaded = null; envelope = null; configs = {}; revisions = {}; parkedFrom = {}; widgetRoom = null; undoMark = null;
      ensure();
      if (current.mounted || current.pending) mount(st.room, { instant: true });
    }
    /* the project (D10 P5, dashboards only): the board's state is written to the project it belongs to, then the board
       takes the new project's key (widget_layout:v1:<project>:<board>, the board's unscoped key adopted once if that is
       missing) and reads it; a hidden board mounts it at its next show */
    function setProject(pid) {
      if (!hosted || dead || bo.storeKey || !projectOk(pid)) return false;
      if (perProject && pid === projectId) return false;
      if (gesture) endGesture(gesture, 'cancel', true);
      if (loaded) flushNow();
      perProject = true; projectId = pid; storeKey = boardKey(boardId, pid); api.STORE_KEY = storeKey;
      adoptKey(boardId, pid);
      /* the session's size picks were the old project's: none may apply to the new project's panels (the write above
         took their preset ids) */
      if (PMU.cards && PMU.cards.forgetPicks) PMU.cards.forgetPicks(null, api);
      /* nor any held preset id: the new project's records hold theirs again as they are read, and a widget they lack is
         added later at no held preset (review 2026-10-10) */
      if (PMU.cards && PMU.cards.forgetHeld) PMU.cards.forgetHeld(null, api);
      reread();
      emit('change', { op: 'project', project: pid });
      return true;
    }
    /* Start from (D10 P4): the sets this dashboard can start from, in this order: its own default set, the 13 Usage rooms'
       in room order, the dashboard starter set, the user's saved presets. active: the set its widgets started from. The
       Usage board offers none (its rooms are its sets). */
    function sets() {
      if (bo.rooms || dead) return [];
      ensure();
      var cls = api.cls(), out = [], at = startSet || 'default';
      var count = function (id, rows) { var ids = {}; setRects(id, rows || {}, cls).forEach(function (r) { ids[r.id] = true; }); return Object.keys(ids).length; };
      var push = function (id, label, kind, detail) { out.push({ id: id, label: label, kind: kind, detail: detail, active: id === at }); };
      push('default', 'Default widgets', 'default', widgetCount(count('default', ownSet())));
      Object.keys(ROOM).forEach(function (room) { if (PMU_BOARDS.rooms[room]) push('room:' + room, ROOM[room].label, 'room', 'Usage room · ' + widgetCount(count('room:' + room, roomRows(room)))); });
      var H = hostsTable(); if (H && H.dashboard) push('host:dashboard', 'Dashboard', 'host', widgetCount(count('host:dashboard', H.dashboard)));
      presetStore().presets.forEach(function (p) { if (presetOk(p)) push('user:' + p.id, presetLabel(p), 'user', 'Saved preset · ' + widgetCount(count('user:' + p.id, presetSet(p).rows))); });
      return out;
    }
    /* startFrom(setId): the board's widgets become the set's at every board class (its rows, else projected as the Usage
       page does); its preset ids are held, so the preset hold resolves their fit heights at this pitch and look, as a
       stored record's are; a saved preset's configuration refs come with it; nothing is hidden. One
       cmd.widget.reset_layout, the reset's payload with the set named: { scope: 'room', room, set_id }. */
    function startFrom(setId) {
      ensure();
      if (bo.rooms || dead) return null;
      setId = String(setId || '');
      var cls = api.cls(), set = setRows(setId, cls.name);
      if (!set) return null;
      completeStream();
      if (gesture) endGesture(gesture, 'cancel', true);
      var room = st.room;
      var receipt = cmd('cmd.widget.reset_layout', { scope: 'room', room: room, set_id: setId }, { reset: true });
      if (receipt && receipt.dispatch_accepted === false) { PMU.shell.toast(t('board.rejected')); return receipt; }
      var from = boardRev; committed(); undoMark = { rev: from, at: boardRev };
      startSet = setId === 'default' ? null : setId; startRows = startSet ? set.rows : null;
      st.layout[room] = {};
      CLASSES.forEach(function (c) {
        var rects = setRects(setId, set.rows, c);
        if (rects.length) st.layout[room][c.name] = rects.map(function (r) { return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h }; });
      });
      st.hidden[room] = {};
      parkedFrom = {};
      configs = {};
      Object.keys(set.configs || {}).forEach(function (id) { var c = parseRefs(set.configs[id]); if (Object.keys(c).length) configs[id] = c; });
      /* every widget of the set is held at the set's preset, or at none (a hold left from before the set would resize it) */
      var held = {}; Object.keys(st.layout[room]).forEach(function (cn) { st.layout[room][cn].forEach(function (r) { held[r.id] = true; }); });
      if (PMU.cards && PMU.cards.holdStored) Object.keys(held).forEach(function (id) { PMU.cards.holdStored(id, (set.presets || {})[id] || null, null, api); });
      /* and no size picked before the set (this session's picks, every widget of the board's) applies to it */
      if (PMU.cards && PMU.cards.forgetPicks) PMU.cards.forgetPicks(null, api);
      persist();
      if (current.mounted && shownFlag) { reconcile(layoutFor(room), { dur: 'morph', ease: 'settle' }); refresh('reset'); scheduleHold(400); }
      else if (current.mounted) mount(room, { instant: true });   /* hidden: it mounts at its show */
      if (bo.onShell) bo.onShell();
      emit('change', { op: 'start', set_id: setId, receipt: receipt });
      return receipt;
    }
    /* the Undo after Start from or Reset widgets (D10 P4; Plans WS-030 and UCC restore_revision, the lead's ruling of
       2026-10-11). restoreWhy(rev, env): why a restore to rev is refused now, or null: 'stale' unless rev is the revision
       the last Start from or Reset came from and nothing else has been committed on the board since (its preset hold
       aside), 'envelope' unless env is the board's envelope at that revision, 'gone' for a board that has none.
       restoreRevision(rev, env): one cmd.widget.reset_layout { scope: 'room', room: <board id>, restore_revision: rev },
       never with set_id; accepted, the board's records are exactly env's again (written back as they were, under this
       project) and the board reads them; refused, nothing is dispatched and { refused: true, reason } comes back. */
    function restoreWhy(rev, env) {
      if (!hosted || dead) return 'gone';
      ensure();
      if (!undoMark || rev !== undoMark.rev || boardRev !== undoMark.at) return 'stale';
      if (env !== undefined && (!env || typeof env !== 'object' || env.schema_id !== 'pm.usage.widget_layout.v1' || !env.view || revOf(env) !== rev)) return 'envelope';
      return null;
    }
    function restoreRevision(rev, env) {
      var why = restoreWhy(rev, env === undefined ? null : env);
      if (why) return { refused: true, reason: why };
      completeStream();
      if (gesture) endGesture(gesture, 'cancel', true);
      var receipt = cmd('cmd.widget.reset_layout', { scope: 'room', room: st.room, restore_revision: rev }, { reset: true, restored_revision: rev });
      if (receipt && receipt.dispatch_accepted === false) { PMU.shell.toast(t('board.rejected')); return receipt; }
      var back = JSON.parse(JSON.stringify(env));
      if (back.project_id != null && back.project_id !== projectId) back.project_id = projectId;
      clearTimeout(saveTimer); saveTimer = 0; savePending = false;
      STORE.set(storeKey, back);
      /* the set's size picks and holds go with it: the records read back hold their own */
      if (PMU.cards && PMU.cards.forgetPicks) PMU.cards.forgetPicks(null, api);
      if (PMU.cards && PMU.cards.forgetHeld) PMU.cards.forgetHeld(null, api);
      reread();
      if (bo.onShell) bo.onShell();
      emit('change', { op: 'restore', restore_revision: rev, receipt: receipt });
      return receipt;
    }
    /* a saved preset's content (PMU.boards.presets.save): the layout at every board class (the shown widgets only), the
       preset id of each widget (as its record would carry it) and its configuration refs; never the view */
    inner.snapshot = function () {
      ensure();
      if (bo.rooms || dead) return null;
      var room = st.room, hid = st.hidden[room] || {}, cur = api.cls(), layout = {}, pids = {}, cfgs = {};
      CLASSES.forEach(function (c) {
        var cls = c.name === cur.name ? cur : { name: c.name, tracks: c.tracks, pitchX: null, W: null };
        var rows = layoutFor(room, cls).filter(function (r) { return !hid[r.id]; }).map(function (r) { return [r.id, r.x, r.y, r.w, r.h]; });
        if (rows.length) layout[c.name] = rows;
      });
      (layout[cur.name] || layout.L || layout.M || layout.S || layout.XL || []).forEach(function (e) {
        var id = e[0], pid = PMU.cards.heldId ? PMU.cards.heldId(id, api) : null;
        if (!pid && current.cls) pid = PMU.cards.sizeId(kindSpec(id), e[3], e[4], id, api);
        if (!pid && PMU.cards.pickedId) CLASSES.some(function (c) { var r = (layout[c.name] || []).filter(function (x) { return x[0] === id; })[0]; pid = r ? PMU.cards.pickedId(id, c.name, r[3], r[4], api) : null; return !!pid; });
        if (pid) pids[id] = pid;
        if (configs[id] && cfgRefs(configs[id]).length) cfgs[id] = cfgRefs(configs[id]);
      });
      return { layout: layout, presets: pids, configs: cfgs };
    };
    /* destroy: the gesture ends, pending state is written, every timer and frame stops, the observer and the scroll
       listeners go, the each() teardowns run, the card bodies are destroyed, the root leaves and the board unregisters.
       The Usage board is never destroyed. */
    function destroy() {
      if (dead || !hosted) return false;
      prewarmEnd(); clearTimeout(prewarmT); prewarmT = 0;
      if (gesture) endGesture(gesture, 'cancel', true);
      if (ACTIVE === inner) ACTIVE = null;
      if (savePending) { clearTimeout(saveTimer); writeNow(); }
      opCancel(); opSync();   /* the flags it holds go with it, now */
      dead = true; shownFlag = false;
      clearTimeout(frostT); frostT = 0; unfrost();
      clearTimeout(saveTimer); clearTimeout(holdT); clearTimeout(gravityT); clearTimeout(filmEndT); clearTimeout(roTimer);
      saveTimer = holdT = gravityT = filmEndT = roTimer = 0; gravityMap = null;
      if (roPending) { cancelAnimationFrame(roPending); roPending = 0; }
      buildToken++; streaming = null; lateHeld = null;
      if (refreshQ) { refreshQ.cancelled = true; refreshQ = null; }
      liveStop(); liveKeys = null; liveLead = null;
      if (ro) { ro.disconnect(); ro = null; }
      if (scroll) {
        scroll.removeEventListener('scroll', onScrollView, { passive: true });
        scroll.removeEventListener('pointerdown', onPointerDown);
        scroll.removeEventListener('keydown', onScrollKey);
        scroll.removeEventListener('dragstart', onDragStart);
      }
      if (PMU.menu && menuOwned()) PMU.menu.close();
      inner.teardowns.splice(0).forEach(function (fn) { try { fn(); } catch (error) { console.error('[pm-usage] board teardown', error); } });
      flushLeaving(true);
      if (boardEl) Array.prototype.forEach.call(boardEl.querySelectorAll(':scope > .pmu-card'), destroyCard);
      /* the board's animations stop with it: no settle, morph, slide or preview handler writes into it afterwards (the
         morph's own finish handler stands down once it is no longer the morph) */
      if (morphEl) { morphEl._pmuMorph = null; morphEl._pmuCard = null; }
      try { if (rootEl && rootEl.getAnimations) rootEl.getAnimations({ subtree: true }).forEach(function (a) { a.onfinish = null; a.cancel(); }); } catch (error) {}
      current.mounted = false; current.pending = false; current.room = null;
      listeners = {};
      if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
      unregister(inner);
      return true;
    }
    function layerShell() { return layer().firstChild; }
    function menuHost() { return hosted ? layerShell() : bo.menuHost || appEl; }
    /* where hidden cards render (the size picker's miniatures and fit measures, 42-cards.js): the shared layer's for a
       hosted board, the Usage shell's own for the Usage board (made on first use, as 42-cards.js makes it) */
    function measureHost() {
      if (hosted) return layerShell().querySelector(':scope > .pmu-szmeasure');
      if (!appEl) return null;
      var m = appEl.querySelector(':scope > .pmu-szmeasure');
      if (!m) { m = document.createElement('div'); m.className = 'pmu-szmeasure'; m.setAttribute('aria-hidden', 'true'); appEl.appendChild(m); }
      return m;
    }

    Object.assign(api, {
      init: ensure,
      CLASSES: CLASSES, STORE_KEY: storeKey, ROW: ROW, GAP: GAP,
      cls: function () { return current.cls || pickClass(boardWidth()); },
      mount: mount, refresh: refresh, flushRefresh: flushRefresh, relevel: relevel,
      layout: function (room) { return layoutFor(bo.rooms ? room || current.room || st.room : st.room); },
      visible: function (room) { return visibleIds(bo.rooms ? room || current.room || st.room : st.room); },
      rect: function (id) { return layoutFor(current.room || st.room).filter(function (r) { return r.id === id; })[0] || null; },
      /* a grid rect in board pixels (no layout read): the flight aims at a predicted plate before its body exists */
      px: function (r) { return r && current.cls ? px(r) : null; },
      resolve: resolve, gravity: gravity, project: project, firstFit: firstFit, tierOf: tierOf, tierPass: tierPass, measure: measure,
      move: move, resize: resize, setVisible: setVisible, reset: reset, tidy: tidy, place: place, persist: persist,
      config: config, setConfig: setConfig, keyboard: keyboard,
      gesture: function () { return gesture ? { type: gesture.type, id: gesture.id, edge: gesture.edge || null, kb: !!gesture.kb, target: gesture.target, me: gesture.me } : null; },
      cancel: function () { if (gesture) endGesture(gesture, 'cancel'); },
      /* a dropped warm board (PMU.film.warmDrop): its build stops and the board counts as never mounted, as a hidden Usage
         board was before the warm build; the next arrival or width pass mounts it. The page's waiting inert and
         aria-hidden go with it (PMU.film.warmUnhide) */
      unmount: function () { if (hosted || dead) return; rasterClear(); buildToken++; current.mounted = false; current.pending = true; if (FILM && FILM.warmUnhide) FILM.warmUnhide(); },
      /* the warm raster's other rooms (P2-03, PMU.film raster) */
      rasterRoom: rasterRoom, rasterClear: rasterClear,
      holdSoon: function (ms) { scheduleHold(ms); },
      card: cardOf, inView: inView, viewNow: viewNow, isLeaving: isLeaving, cardsNow: cardsNow, refreshing: function () { return !!refreshQ; }, fitSliced: fitSliced,
      on: function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return function () { listeners[evt] = (listeners[evt] || []).filter(function (f) { return f !== fn; }); }; },
      envelope: function () { ensure(); var e = JSON.parse(JSON.stringify(envelope)); e.view = { room: st.room, detail: st.detail, range: st.range, scope: st.scope, more: !!st.more }; e.records = recordsNow(); return e; },
      /* D10 3.3 */
      id: boardId, hostId: hostId, state: st,
      el: function () { return boardEl; }, scrollEl: scroll || null, root: rootEl || null, appEl: appEl || null,
      menuHost: menuHost, measureHost: measureHost, hostResize: hostResize,
      show: show, hide: hide, shown: function () { return shownFlag && !dead; },
      relook: relook, setView: setView, add: add, catalog: catalog, count: function () { return visibleIds(current.room || st.room).length; },
      reveal: reveal, focus: focusFirst, flush: flushNow, reload: reload, destroy: destroy,
      details: bo.details || null, navigate: bo.navigate || null,
      /* D10 round two: Start from (P4), the project (P5), what the live beats did here (P12) */
      sets: sets, startFrom: startFrom, setProject: setProject, project: function () { return projectId; },
      /* the Undo after Start from (the ruling of 2026-10-11): a dashboard's committed layout revision (null on the Usage
         board), why a restore to a revision is refused now (null: it may run), and the restore itself */
      revision: function () { if (!hosted || dead) return null; ensure(); return boardRev; },
      restoreWhy: function (rev, env) { return restoreWhy(rev, env); }, restoreRevision: restoreRevision,
      liveStats: function () { return { beats: liveStat.beats, patched: liveStat.patched, held: liveStat.held, pending: liveKeys ? Object.keys(liveKeys).length : 0, running: !!liveQ, last: liveStat.last }; }
    });
    Object.defineProperty(api, 'DEFAULT_SET', { get: setVersion, enumerable: true, configurable: true });
    return inner;
  }

  /* the gesture's two document listeners (were per board): once, capture phase, acting on the board that holds the
     gesture (on the Usage page always the Usage board, so they do what they did) */
  document.addEventListener('keydown', function (event) { if (ACTIVE) ACTIVE.escape(event); }, true);
  document.addEventListener('selectstart', function (event) { if (ACTIVE) ACTIVE.selectstart(event); }, true);

  function unregister(inner) {
    if (own(REG, inner.api.id) && REG[inner.api.id] === inner) delete REG[inner.api.id];
    ORDER = ORDER.filter(function (h) { return h !== inner; });
  }
  function runEach(inner, fn) {
    try { var off = fn(inner.api); if (typeof off === 'function') inner.teardowns.push(off); } catch (error) { console.error('[pm-usage] boards.each', error); }
  }
  /* create (D10 3.2): a board with the page's elements (the Usage board) adopts them; one without (opts.board omitted)
     builds its own DOM in opts.mount. Refused, with a console error and null: a malformed or taken id, a reserved id for a
     hosted board, a second board with the room film. */
  function create(opts) {
    opts = opts || {};
    var id = String(opts.id || ''), hosted = opts.hosted != null ? !!opts.hosted : !('board' in opts);
    var why = !/^[a-z][a-z0-9-]{0,31}$/.test(id) ? 'malformed id' : own(REG, id) ? 'id taken' : hosted && (own(RESERVED, id) || own(ROOM, id)) ? 'reserved id'
      : opts.film && ORDER.some(function (h) { return h.film; }) ? 'a second board with the room film'
      : hosted && opts.projectId != null && !projectOk(opts.projectId) ? 'malformed project id' : null;
    if (why) { console.error('[pm-usage] boards.create refused (' + why + '): ' + id); return null; }
    var inner = createBoard(opts, hosted);
    REG[id] = inner; ORDER.push(inner);
    EACH.slice().forEach(function (fn) { runEach(inner, fn); });
    return inner.api;
  }
  /* the board an element belongs to: its card's, else its hosted root's, else the Usage board inside the Usage page */
  function of(el) {
    if (el && el.nodeType === 3) el = el.parentNode;
    if (!el || el.nodeType !== 1) return null;
    var card = el.closest('.pmu-card'), b = card && card._pmuBoard;
    if (b && own(REG, b.id) && REG[b.id].api === b) return b;
    var host = el.closest('[data-pmu-host]');
    if (host) { for (var i = 0; i < ORDER.length; i++) if (ORDER[i].api.root === host) return ORDER[i].api; }
    return el.closest('#panel-usage') ? PMU.board || null : null;
  }

  PMU.boards = {
    create: create,
    get: function (id) { return own(REG, id) ? REG[id].api : null; },
    all: function () { return ORDER.map(function (h) { return h.api; }); },
    of: of,
    /* fn(board) for every board now and every later one; a function it returns runs when that board is destroyed */
    each: function (fn) { EACH.push(fn); ORDER.slice().forEach(function (h) { runEach(h, fn); }); return function () { EACH = EACH.filter(function (f) { return f !== fn; }); }; },
    current: function () { return ambient || PMU.board || null; },
    run: function (board, fn) { var prev = ambient; ambient = board || null; try { return fn(); } finally { ambient = prev; } },
    active: function () { return ACTIVE ? ACTIVE.api : null; },
    /* data changed (a rerender, a live beat, a Settings write): shown hosted boards refresh in slices, hidden ones on show */
    touch: function (reason) { EPOCH++; ORDER.slice().forEach(function (h) { try { if (h.touch) h.touch(reason); } catch (error) { console.error('[pm-usage] boards.touch', error); } }); },
    epoch: function () { return EPOCH; },
    layer: layer,
    /* widget sources (D10 P3): register(prefix, { label, catalog, build? }) -> source | null; list() -> [{ prefix, label,
       builtin }] (Usage first); of(widgetId) -> its source, null for a prefix nobody registered */
    sources: {
      register: registerSource,
      list: function () { return SOURCES.map(function (s) { return { prefix: s.prefix, label: s.label, builtin: s.builtin }; }); },
      of: function (id) { return sourceOut(sourceOf(id)); }
    },
    /* the user's saved presets (D10 P4), shown in every dashboard's Start from; applied by board.startFrom('user:<id>') */
    presets: {
      list: function () { return presetStore().presets.filter(presetOk).map(presetOut); },
      save: function (board, name) {
        var b = typeof board === 'string' ? (own(REG, board) ? REG[board].api : null) : board;
        var h = b && own(REG, b.id) && REG[b.id].api === b ? REG[b.id] : null, snap = h && h.snapshot ? h.snapshot() : null;
        if (!snap) return null;
        var s = presetStore(), n = s.presets.length, pid = null;
        while (!pid || s.presets.some(function (p) { return p && p.id === pid; })) pid = 'p' + Date.now().toString(36) + (n++).toString(36);
        var p = { id: pid, name: presetName(name) || 'Preset ' + (s.presets.length + 1), created: new Date().toISOString(), source_board: b.id,
          layout: snap.layout, presets: snap.presets, configs: snap.configs };
        s.presets.push(p);
        STORE.set(PRESET_KEY, s);
        return presetOut(p);
      },
      rename: function (id, name) {
        var s = presetStore(), p = s.presets.filter(function (x) { return presetOk(x) && x.id === id; })[0], nm = presetName(name);
        if (!p || !nm) return null;
        p.name = nm; STORE.set(PRESET_KEY, s);
        return presetOut(p);
      },
      remove: function (id) {
        var s = presetStore(), kept = s.presets.filter(function (x) { return !(x && x.id === id); });
        if (kept.length === s.presets.length) return false;
        s.presets = kept; STORE.set(PRESET_KEY, s);
        return true;
      }
    },
    /* a board's key and its quarantine, gone (D10 P5, P6: a deleted dashboard; a closed one leaving the reopen list):
       widget_layout:v1:<project>:<board>, or the unscoped widget_layout:v1:<board> without a project. Never the Usage
       page's. */
    forgetKey: function (boardId, projectId) {
      boardId = String(boardId || '');
      if (!/^[a-z][a-z0-9-]{0,31}$/.test(boardId) || boardId === 'usage' || (projectId != null && !projectOk(projectId))) return false;
      var key = boardKey(boardId, projectId != null ? projectId : null);
      /* refused while a live board holds the key: its next save would write it back (destroy the board first) */
      if (ORDER.some(function (h) { return h.api.STORE_KEY === key; })) {
        if (!own(FORGET_WARNED, key)) { FORGET_WARNED[key] = true; console.warn('[pm-usage] boards.forgetKey refused: a live board holds ' + key); }
        return false;
      }
      dropKey(key);
      return true;
    },
    /* live beats on dashboards (D10 P12), for the live film (15-film.js): wanted() while a shown dashboard holds a Usage
       widget; beat(keys, lead) hands a beat's share keys and its lead keys (the lead light) to every dashboard; flush()
       lets a dashboard whose hold ended patch; hit(card, keys) is the match both use. on() / set(on): the viewer's Live choice (the Usage page's, one for the page). */
    live: {
      wanted: function () { return ORDER.some(function (h) { return !!h.liveWanted && h.liveWanted(); }); },
      beat: function (keys, lead) {
        var list = [].concat(keys || []).filter(function (k) { return typeof k === 'string' && k; });
        if (!list.length) return;
        var leads = [].concat(lead || []).filter(function (k) { return typeof k === 'string' && k; });
        ORDER.slice().forEach(function (h) { try { if (h.live) h.live(list, leads); } catch (error) { console.error('[pm-usage] boards.live', error); } });
      },
      flush: function () { ORDER.slice().forEach(function (h) { try { if (h.liveTry) h.liveTry(); } catch (error) { console.error('[pm-usage] boards.live', error); } }); },
      hit: function (card, keys) { return !!card && !!liveHit(card, [].concat(keys || [])); },
      on: function () { return !!(PMU.live && PMU.live.enabled() && PMU.live.on()); },
      set: function (on) { return !!PMU.live && (on ? PMU.live.resume() : PMU.live.pause()); }
    },
    /* Play the next hour from a dashboard (D10 P12; 15-film.js 8.6): available() as the Usage page's Live menu offers it;
       play() runs the demo hour (Live on), and every shown dashboard patches as it plays; back() returns to now */
    hour: {
      available: function () { var h = PMU.live && PMU.live.hour; return !!(h && h.available()); },
      play: function () { var h = PMU.live && PMU.live.hour; return !!(h && h.play()); },
      back: function () { var h = PMU.live && PMU.live.hour; return !!(h && h.back()); },
      running: function () { var h = PMU.live && PMU.live.hour; return !!(h && h.running()); },
      label: function () { var h = PMU.live && PMU.live.hour; return h ? h.label() : ''; },
      step: function () { var h = PMU.live && PMU.live.hour; return h ? h.step() : 0; }
    }
  };
  /* the Usage page's board, from the same four elements at the same point in load order (D10 2.1 USAGE_OPTS) */
  PMU.board = PMU.boards.create({
    id: 'usage', storeKey: STORE_KEY, hostId: 'usage', projectId: 'tastebook',
    scroll: document.getElementById('pmuScroll'), board: document.getElementById('pmuBoard'), liveId: 'pmuBoard',
    app: document.getElementById('pmuApp'), stage: document.getElementById('pmuStage'), live: document.getElementById('pmuLive'),
    menuHost: document.getElementById('pmuApp'),
    state: PMU.core.state, rooms: true, migrate: true, film: true, resize: 'observe',
    defaultSet: defaultSet,
    onShell: function () { if (PMU.shell) PMU.shell.render(); }
  });
})();
