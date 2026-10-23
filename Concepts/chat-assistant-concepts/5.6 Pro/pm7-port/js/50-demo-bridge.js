/* PM56_PORT.demo: the 5.6 Pro chat's demo content, for PMConcept7's one Demo Studio (DECISIONS.md D26; the port's
   CONTRACT.md, demo lane). Loads after app.js. The Studio (Concepts/onboarding/opus-5.5/src/js/91-demo-studio.js and
   92-demo-studio-ui.js) calls only this; this calls only the chat's own handles: PM56_APP (the foundation lane's), and
   PM56_DEMO, PM56_EXT, PM56_DATA, PM56_POLISH and PM56_REPAIR_DEMOS, which the standalone already has.

     groups()            the moments: the chat's trigger groups (app.js demoTriggerGroups) and the single-surface demos
                         (repair-demos.js scenarios, delivery-polish.js feature rows) regrouped by what they show
                         -> [{ id, items: [{ id, label, sub, action, data }] }] (label and sub: the chat's own words)
     run(group, item)    one moment -> { ok }
     guided()            the recorded examples every module adds to the gallery, grouped by feature (GUIDED below)
                         -> [{ id, items: [{ id, label, sub, action, data }] }]
     runGuided(id)       one recorded example ('plan-complete', ...) -> { ok }
     families()          the seven take families -> [{ id, index, label, options: [label], value }]
     take(family)        the take a family shows now (family: id or index) -> index
     setTake(f, index)   -> { ok }
     recipes(), recipe(), setRecipe(index)   the lab's curated recipes (one take per family), -1 = a custom mix
     voices(), voice(), setVoice(id)         the chat's motion voice: 'auto' follows the look
     reset()             the chat's own Reset all -> { ok }
     avail()             the chat is on the page and booted

   Every run goes through the chat's own click path, exactly as the lab gallery's buttons did: a button inside a hidden
   <section class="demo-dialog"> in #pmOverlayRoot is clicked. That keeps what the gallery relied on: modules chain
   'demo-trigger' (BSD, ELI5, Context Lens, the quota strip) and about fifty chain 'reset-all'; b14-start and b15-start
   play their recording only when the button sits in '.demo-dialog .demo-trigger'; recorded-play.js stops the example
   that is playing when such a button is clicked. Before a run the chat is brought on screen (PMW.chatCol.show(), on the
   Home page), so a module that measures the chat's width at seed time measures the real column.

   Dropped from the lab's Demo Studio (D26 clean-up; DEMO-INVENTORY.md in the port's share folder lists every decision):
   the theme list and the NieR Mode section (PMConcept7's Looks section owns looks and NieR), the Edit and branch and
   Restore from point triggers (each only toasted what it would do; the real Branch and restore points are on every
   message's own menu), and the dialog's drag and resize. */
(function () {
  'use strict';
  var W = window;
  var PORT = W.PM56_PORT = W.PM56_PORT || {};
  var app = function () { return W.PM56_APP || null; };
  var lab = function () { return W.PM56_DEMO || null; };
  var ext = function () { return W.PM56_EXT || null; };
  var data = function () { return W.PM56_DATA || null; };
  var fn = function (o, k) { return !!(o && typeof o[k] === 'function'); };
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };

  function avail() { return !!(lab() && ext() && fn(ext(), 'ctx') && document.getElementById('pmRoot')); }
  function state() {
    var A = app();
    if (A && A.state) return A.state;
    var L = lab();
    return L && fn(L, 'getState') ? L.getState() : null;
  }

  /* ---- the chat on screen: the Home page, the column shown (its folded strip opens over the centre) ---- */
  function chatOpen() { var C = W.PMW && W.PMW.chatCol; return !!(C && fn(C, 'isOpen') && C.isOpen()); }
  function bringChat() {
    /* PM_PAGES.current is the page last asked for (null at load, when Home is already in front) */
    try {
      var P = W.PM_PAGES, home = document.querySelector('.primary-content > .page-dashboard');
      var onHome = P && P.current ? P.current === 'dashboard' : !home || home.classList.contains('active');
      if (P && fn(P, 'go') && !onHome) P.go('dashboard');
    } catch (_) {}
    var C = W.PMW && W.PMW.chatCol;
    if (C && fn(C, 'show')) { try { C.show(); } catch (_) {} }
    return chatOpen();
  }
  /* run fire() with the chat on screen: at once when it already was, else after two frames, so the column has its
     width before a module seeds a thread and reads it */
  function withChat(fire) {
    var was = chatOpen();
    bringChat();
    if (was || !W.requestAnimationFrame) { fire(); return; }
    W.requestAnimationFrame(function () { W.requestAnimationFrame(fire); });
  }

  /* ---- the chat's click path ---- */
  function host() {
    var h = document.getElementById('pm56-demo-host');
    if (h && h.isConnected) return h;
    h = document.createElement('section');
    h.id = 'pm56-demo-host'; h.className = 'demo-dialog';
    h.hidden = true; h.setAttribute('aria-hidden', 'true'); h.style.display = 'none';
    (document.getElementById('pmOverlayRoot') || document.body).appendChild(h);
    return h;
  }
  function press(action, dataset) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'demo-trigger'; b.setAttribute('data-action', action);
    Object.keys(dataset || {}).forEach(function (k) { b.dataset[k] = dataset[k]; });
    host().appendChild(b);
    try { b.click(); } finally { if (b.parentNode) b.parentNode.removeChild(b); }
  }

  /* ---- the gallery the modules chain onto PM56_REPAIR_DEMOS.gallery (and PM56_POLISH's feature rows), read once per
     call: every button with its action and dataset, and the words its module wrote ---- */
  function gallery() {
    var P = W.PM56_POLISH, R = W.PM56_REPAIR_DEMOS, E = ext();
    if (!E || !fn(E, 'ctx')) return [];
    var html = '';
    try { var c = E.ctx(); html = P && fn(P, 'gallery') ? P.gallery(c) : R && fn(R, 'gallery') ? R.gallery(c) : ''; } catch (_) { html = ''; }
    var t = document.createElement('template'); t.innerHTML = html;
    return Array.prototype.map.call(t.content.querySelectorAll('button[data-action]'), function (b) {
      var ds = {}; Object.keys(b.dataset).forEach(function (k) { if (k !== 'action') ds[k] = b.dataset[k]; });
      var strong = b.querySelector('strong'), small = b.querySelector('small');
      return { action: b.getAttribute('data-action'), ds: ds,
        label: (strong ? strong.textContent : b.textContent).trim().replace(/\s+/g, ' '),
        sub: (small && strong ? small.textContent : b.getAttribute('title') || '').trim().replace(/\s+/g, ' '),
        section: ((b.closest('section') || {}).querySelector ? (b.closest('section').querySelector('h3') || {}).textContent || '' : '').trim() };
    });
  }
  var keyOf = function (action, ds) { return action + ':' + (ds.flow || ds.scenario || ds.target || ds.trigger || ''); };

  /* ---- recorded examples, grouped by the feature they show (reading order: work, together, help, safety) ---- */
  var GUIDED = [
    ['plan', [['complete', 'plan-demo-start'], ['revise', 'plan-demo-start'], ['recovery', 'b17-start'], ['documents', 'b17-start']]],
    ['goal', [['simple', 'b15-start'], ['authority', 'b15-start'], ['plan', 'b15-start'], ['scheduled', 'b15-start']]],
    ['todo', [['parallel', 'b16-start'], ['restructure', 'b16-start'], ['large', 'b16-start']]],
    ['deepplan', [['thorough', 'b14-start'], ['exhaustive', 'b14-start'], ['budget', 'b14-start'], ['blocker', 'b14-start']]],
    ['schedule', [['due', 'schedule-demo-start'], ['revise', 'schedule-demo-start'], ['cancel', 'schedule-demo-start'], ['messages', 'b18-start'], ['windows', 'b18-start'], ['crew', 'b18c-start'], ['room', 'b18c-start'], ['folder', 'b18c-start']]],
    ['crew', [['delegation', 'crew-demo-start'], ['auto', 'crew-demo-start']]],
    ['room', [['discussion', 'room-demo-start'], ['plan', 'room-demo-start']]],
    ['brainstorm', [['synthesis', 'brainstorm-demo-start'], ['constraint', 'brainstorm-demo-start']]],
    ['review', [['single', 'review-demo-start'], ['multi', 'review-demo-start']]],
    ['wonderer', [['crew', 'wg-demo-start'], ['room', 'wg-demo-start'], ['brainstorm', 'wg-demo-start'], ['deepplan', 'wg-demo-start'], ['leads', 'b13-start'], ['dissent', 'b13-start']]],
    ['lens', [['shape', 'b13-start'], ['stale', 'b13-start']]],
    ['teach', [['capture', 'teach-demo-start'], ['correct', 'teach-demo-start'], ['missed', 'teach-demo-start']]],
    ['memory', [['verified', 'memory-demo-start'], ['locked', 'memory-demo-start']]],
    ['eli5', [['override', 'eli5-demo-start'], ['inherit', 'eli5-demo-start']]],
    ['bsd', [['survives', 'bsd12-start'], ['resolves', 'bsd12-start']]],
    ['debug', [['repair', 'debug-demo-start'], ['drift', 'debug-demo-start']]],
    ['revert', [['whole', 'revert-demo-start'], ['conflict', 'revert-demo-start']]],
    ['attach', [['intake', 'b19-start'], ['live', 'b19-start'], ['folder', 'b19-start']]]
  ];
  /* the single-surface demos (repair-demos.js 'repair-demo' scenarios, delivery-polish.js 'polish-demo-action' rows) */
  var SURFACES = [
    ['scheduling', ['schedules-overview', 'schedules-windows', 'schedule-new', 'schedule-edit', 'schedule-once', 'schedule-recurring']],
    ['safety', ['schedule-stop', 'schedule-race', 'schedule-duplicate', 'af-title-race-demo', 'todo-attempt-bulk-complete', 'todo-attempt-provider-proposal']],
    ['lineups', ['crew-config', 'crew-auto-config', 'chat-room-config', 'brainstorm-config', 'review-config', 'bsd-config', 'bsd-held']],
    ['views', ['plan-index', 'plan-auth', 'record-provider', 'record-provider-second', 'record-note', 'activity-todo', 'activity-changes', 'lens-focus', 'lens-subcompact', 'work-orbit', 'work-simple', 'cs-quota-demo', 'cs-quota-source', 'af-eli5-demo', 'bc-open']]
  ];
  /* app.js demoTriggerGroups' names, by id */
  var TRIGGER_GROUPS = { 'Live turns': 'live', 'Work lifecycle': 'lifecycle', 'Every Working Animation state': 'working', 'Questions and decisions': 'decisions',
    'Artifacts': 'artifacts', 'Capabilities': 'capabilities', 'Thread and message states': 'threads', 'System states': 'system' };
  var DROPPED = { 'Edit and branch': 1, 'Restore from point': 1 };

  function guidedList() {
    var all = gallery(), byKey = {}, used = {};
    all.forEach(function (g) { byKey[keyOf(g.action, g.ds)] = g; });
    var out = GUIDED.map(function (grp) {
      return { id: grp[0], items: grp[1].map(function (it) {
        var g = byKey[it[1] + ':' + it[0]]; if (!g) return null;
        used[it[1] + ':' + it[0]] = 1;
        return { id: grp[0] + '-' + it[0], label: g.label, sub: g.sub, action: it[1], data: g.ds };
      }).filter(Boolean) };
    }).filter(function (grp) { return grp.items.length; });
    /* a recorded example a module adds later shows up under More examples, in its own words, until the Studio's copy
       names it */
    var more = all.filter(function (g) { return !used[keyOf(g.action, g.ds)] && g.ds.flow && g.action !== 'repair-demo' && g.action !== 'polish-demo-action'; })
      .map(function (g) { return { id: 'more-' + slug(g.action + '-' + g.ds.flow), label: g.label, sub: g.sub, action: g.action, data: g.ds }; });
    if (more.length) out.push({ id: 'more', items: more });
    return out;
  }

  function triggerGroups() {
    var A = app(), groups = A && fn(A, 'demoTriggerGroups') ? A.demoTriggerGroups() : null;
    if (!groups) {
      /* without PM56_APP (the standalone, a harness): the flat list, under one group */
      var L = lab(), flat = L && fn(L, 'listTriggers') ? L.listTriggers() : [];
      groups = flat.length ? { Moments: flat } : {};
    }
    return Object.keys(groups).map(function (name) {
      return { id: TRIGGER_GROUPS[name] || slug(name), items: groups[name].filter(function (t) { return !DROPPED[t]; })
        .map(function (t) { return { id: slug(t), label: t, sub: '', action: 'demo-trigger', data: { trigger: t } }; }) };
    });
  }
  function surfaceGroups() {
    var rows = gallery().filter(function (g) { return g.action === 'repair-demo' || g.action === 'polish-demo-action'; }), byId = {}, used = {};
    rows.forEach(function (g) { byId[g.ds.scenario || g.ds.target] = g; });
    var out = SURFACES.map(function (grp) {
      return { id: grp[0], items: grp[1].map(function (id) {
        var g = byId[id]; if (!g) return null; used[id] = 1;
        return { id: id, label: g.label, sub: g.sub, action: g.action, data: g.ds };
      }).filter(Boolean) };
    });
    var rest = rows.filter(function (g) { return !used[g.ds.scenario || g.ds.target]; })
      .map(function (g) { var id = g.ds.scenario || g.ds.target; return { id: id, label: g.label, sub: g.sub, action: g.action, data: g.ds }; });
    if (rest.length) out.push({ id: 'more-surfaces', items: rest });
    return out.filter(function (grp) { return grp.items.length; });
  }
  function groups() { return avail() ? triggerGroups().concat(surfaceGroups()).filter(function (g) { return g.items.length; }) : []; }
  /* public copies: the id, the module's own words, and the action and dataset the click carries (tests locate by them) */
  var strip = function (list) { return list.map(function (g) { return { id: g.id, items: g.items.map(function (it) { return { id: it.id, label: it.label, sub: it.sub, action: it.action, data: Object.assign({}, it.data) }; }) }; }); };

  function run(groupId, itemId) {
    if (!avail()) return { ok: false, reason: 'unavailable' };
    var g = groups().find(function (x) { return x.id === groupId; });
    var it = g && g.items.find(function (x) { return x.id === itemId; });
    if (!it) return { ok: false, reason: 'unknown' };
    withChat(function () { press(it.action, it.data); });
    return { ok: true };
  }
  function runGuided(id) {
    if (!avail()) return { ok: false, reason: 'unavailable' };
    var it = null;
    guidedList().some(function (g) { it = g.items.find(function (x) { return x.id === id; }) || null; return !!it; });
    if (!it) return { ok: false, reason: 'unknown' };
    withChat(function () { press(it.action, it.data); });
    return { ok: true };
  }

  /* ---- takes ---- */
  var FAMILY_IDS = ['body', 'history', 'working', 'activityBar', 'activityDetail', 'transcript', 'decision'];
  function families() {
    var A = app(), list = A && fn(A, 'demoFamilies') ? A.demoFamilies() : null, st = state(), D = data();
    if (!list && D) {
      /* without PM56_APP: the two families PM56_DATA names, so a harness still sees real options */
      list = [null, null, { name: 'Working Animation', options: (D.workingTakes || []).slice() }, null, null, { name: 'Transcript', options: (D.transcriptTakes || []).slice() }, null];
    }
    return (list || []).map(function (f, i) {
      if (!f) return null;
      return { id: FAMILY_IDS[i] || 'family' + i, index: i, label: f.name || f.label || '', options: (f.options || []).map(String), value: st && st.variants ? Number(st.variants[i]) : 0 };
    }).filter(Boolean);
  }
  var famIndex = function (f) { var i = typeof f === 'number' ? f : FAMILY_IDS.indexOf(String(f)); return i >= 0 ? i : Number(f); };
  function take(f) { var st = state(), i = famIndex(f); return st && st.variants ? Number(st.variants[i]) : -1; }
  function setTake(f, index) {
    var L = lab(), i = famIndex(f);
    if (!avail() || !fn(L, 'setVariant') || !(i >= 0 && i < FAMILY_IDS.length)) return { ok: false };
    L.setVariant(i, Number(index));
    return { ok: take(i) === Number(index) };
  }
  function recipes() { var D = data(); return ((D && D.recipes) || []).map(function (r, i) { return { index: i, name: r.name, desc: r.desc, choices: (r.choices || []).slice() }; }); }
  function recipe() { var st = state(); return st && typeof st.recipe === 'number' ? st.recipe : -1; }
  function setRecipe(i) { var L = lab(); if (!avail() || !fn(L, 'setRecipe')) return { ok: false }; L.setRecipe(Number(i)); return { ok: recipe() === Number(i) }; }
  var VOICES = ['auto', 'basic', 'friendly', 'glass', 'retro'];
  function voice() { var st = state(); return st && VOICES.indexOf(st.motionVoice) > 0 ? st.motionVoice : 'auto'; }
  function setVoice(v) { var L = lab(); if (!avail() || !fn(L, 'setVoice')) return { ok: false }; L.setVoice(v); return { ok: voice() === (VOICES.indexOf(v) > 0 ? v : 'auto') }; }

  /* the chat's own Reset all, through the click path so every module's chained reset runs */
  function reset() { if (!avail()) return { ok: false, reason: 'unavailable' }; press('reset-all', {}); return { ok: true }; }

  PORT.demo = {
    avail: avail,
    groups: function () { return strip(groups()); },
    run: run,
    guided: function () { return avail() ? strip(guidedList()) : []; },
    runGuided: runGuided,
    families: function () { return avail() ? families() : []; },
    take: take,
    setTake: setTake,
    recipes: function () { return avail() ? recipes() : []; },
    recipe: recipe,
    setRecipe: setRecipe,
    voices: function () { return VOICES.slice(); },
    voice: voice,
    setVoice: setVoice,
    reset: reset,
    showChat: function () { return { ok: bringChat() }; },
    /* what the chat shows now, for the Studio's run bar */
    now: function () {
      var st = state(); if (!st) return null;
      var t = (st.threads || []).find(function (x) { return x.id === st.selectedThread; });
      return { thread: t ? t.title : '', recipe: recipe(), open: chatOpen() };
    }
  };
})();
