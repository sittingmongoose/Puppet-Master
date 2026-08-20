/* pm2-managers.js — PM2.managers (part 1 of 2)
   fable Seven New Concepts shared-v2 MANAGER VIEW-MODEL REGISTRY.

   Defines the registry object + shared helpers, and registers the first 15
   manager families:
     m.providers m.context m.memory m.personas m.goal m.crew m.permissions
     m.bsd m.notifications m.sounds m.appearance m.spellcheck m.desktop
     m.teacher m.doctor
   (pm2-managers2.js registers the remaining families and deferred shells.)

   CONTRACT (CONTRACT2.md): this module exports NO HTML and NO CSS. Every
   manager def returns plain data trees that seven very different concept UIs
   render in their own layout. Provider state strings resolve ONLY through
   window.PMProvider — never re-derived here.

   View-model conventions (all managers in this file):
     model(store) -> {
       managerId, title, blurb, archetype,
       sections: [ { id, kind:'overview'|'roster'|'form'|'table'|'steps'|
                     'log'|'health'|'preview', title, note?, advanced?,
                     items?|rows?|fields?|steps?|entries?|checks?|groups?,
                     dest? } ],
       pages?: { objectId: { title, tabs:[tabId], sections:{tabId:section} } }
     }
     item/row: { id, label, sub?, status?:{label,tone,note?}, meta?, detail?,
                 dest? }   — tones: ok|attention|setup|muted|progress.
     form field: { id, settingId?, label, value, valueLabel, note?, dest? }
   Human product English in labels; raw ids/enums live only in detail/advanced
   fields. Results are cached per store until the store emits an invalidating
   event ('scenario' | 'fixtures' | 'value'); PM2.managers.invalidate(id) is
   the manual override. */
(function () {
  'use strict';

  window.PM2 = window.PM2 || {};
  if (window.PM2.managers && typeof window.PM2.managers.register === 'function') {
    return; /* registry already installed; never clobber it */
  }

  /* ------------------------------------------------------------------ */
  /* Registry                                                            */
  /* ------------------------------------------------------------------ */

  var DEFS = [];      /* registration order preserved */
  var BY_ID = {};
  var CACHE = {};     /* managerId -> {store, vm} — one store per page */
  var HOOKED = [];    /* stores whose invalidating events are subscribed */

  function invalidate(id) {
    if (id == null) { CACHE = {}; return; }
    delete CACHE[id];
  }

  function hookStore(store) {
    if (!store || typeof store.on !== 'function') { return; }
    for (var i = 0; i < HOOKED.length; i++) { if (HOOKED[i] === store) { return; } }
    HOOKED.push(store);
    var wipe = function () { CACHE = {}; };
    store.on('scenario', wipe);
    store.on('fixtures', wipe);
    store.on('value', wipe);
  }

  function wrapModel(def, build) {
    var wrapped = function (store) {
      hookStore(store);
      var hit = CACHE[def.id];
      if (hit && hit.store === store) { return hit.vm; }
      var vm = build(store);
      CACHE[def.id] = { store: store, vm: vm };
      return vm;
    };
    wrapped.__pm2cached = true;
    return wrapped;
  }

  var managers = {
    register: function (defs) {
      var list = Object.prototype.toString.call(defs) === '[object Array]' ? defs : [defs];
      for (var i = 0; i < list.length; i++) {
        var def = list[i];
        if (!def || !def.id) { continue; }
        if (typeof def.model === 'function' && !def.model.__pm2cached) {
          def.model = wrapModel(def, def.model);
        }
        if (BY_ID[def.id]) {
          /* re-registration replaces in place, keeps order */
          for (var j = 0; j < DEFS.length; j++) { if (DEFS[j].id === def.id) { DEFS[j] = def; break; } }
        } else {
          DEFS.push(def);
        }
        BY_ID[def.id] = def;
        delete CACHE[def.id];
      }
    },
    get: function (id) { return BY_ID[id] || null; },
    all: function () { return DEFS.slice(); },
    byCat: function (cat) {
      var out = [];
      for (var i = 0; i < DEFS.length; i++) { if (DEFS[i].cat === cat) { out.push(DEFS[i]); } }
      return out;
    },
    demonstrated: function () {
      var out = [];
      for (var i = 0; i < DEFS.length; i++) { if (DEFS[i].status === 'demonstrated') { out.push(DEFS[i]); } }
      return out;
    },
    deferred: function () {
      var out = [];
      for (var i = 0; i < DEFS.length; i++) { if (DEFS[i].status === 'deferred_named_owner') { out.push(DEFS[i]); } }
      return out;
    },
    model: function (id, store) {
      var def = BY_ID[id];
      return (def && typeof def.model === 'function') ? def.model(store) : null;
    },
    invalidate: invalidate
  };
  window.PM2.managers = managers;

  /* ------------------------------------------------------------------ */
  /* Shared helpers (data access, dests, ops, inventory rows)            */
  /* ------------------------------------------------------------------ */

  function D(store) {
    return (store && store.data) ? store.data : (window.PM_DATA || {});
  }
  function arr(x) { return Object.prototype.toString.call(x) === '[object Array]' ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function trunc(s, n) {
    s = String(s == null ? '' : s);
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function mdest(managerId, objectId, tab, sectionId) {
    var d = { route: 'manager', managerId: managerId };
    if (objectId) { d.objectId = objectId; }
    if (tab) { d.tab = tab; }
    if (sectionId) { d.sectionId = sectionId; }
    return d;
  }
  function sdest(settingId) { return { route: 'setting', settingId: settingId }; }

  function hasFx(store, fxId) {
    if (!store || typeof store.get !== 'function') { return false; }
    var fx = store.get('fixtures');
    if (!fx) { return false; }
    if (Object.prototype.toString.call(fx) === '[object Array]') {
      for (var i = 0; i < fx.length; i++) { if (fx[i] === fxId) { return true; } }
      return false;
    }
    return fx[fxId] === true;
  }

  /* Truthful staged op / receipt. Never a silent no-op: when PM2.states is
     absent (smoke context) an honest simulated receipt object comes back. */
  function runOp(name, ref, label, detail) {
    var S = window.PM2 && window.PM2.states;
    if (S && typeof S.op === 'function') {
      try { var r = S.op(name, ref); if (r != null) { return r; } } catch (e) { /* fall through */ }
    }
    return receipt(label || name, detail || ('Simulated run of ' + name + (ref ? ' for ' + ref : '') + '. Nothing actually executed.'));
  }
  function receipt(label, detail) {
    var S = window.PM2 && window.PM2.states;
    if (S && typeof S.receipt === 'function') {
      try { var r = S.receipt(label, detail); if (r != null) { return r; } } catch (e) { /* fall through */ }
    }
    return { ok: true, simulated: true, kind: 'receipt', label: label, detail: detail || '' };
  }
  /* An action that truthfully cannot run still answers honestly. */
  function refuse(label, reason) {
    return receipt(label + ' — not attempted', reason);
  }

  /* Inventory row lookup: prefer store.resolveRow (THE row view model),
     fall back to the raw inventory record so smoke contexts still work. */
  var INV_INDEX = null;
  function invRecord(id) {
    if (!INV_INDEX) {
      INV_INDEX = {};
      var inv = window.PM2_INVENTORY;
      var list = inv ? arr(inv.settings) : [];
      for (var i = 0; i < list.length; i++) { INV_INDEX[list[i].id] = list[i]; }
    }
    return INV_INDEX[id] || null;
  }
  function field(store, settingId, note) {
    if (store && typeof store.resolveRow === 'function') {
      try {
        var r = store.resolveRow(settingId);
        if (r) {
          return { id: 'f.' + settingId, settingId: settingId, label: r.label,
                   value: r.value, valueLabel: r.valueLabel, state: r.state,
                   note: note || r.desc, dest: sdest(settingId) };
        }
      } catch (e) { /* fall through */ }
    }
    var rec = invRecord(settingId);
    var v = rec ? rec['default'] : null;
    if (store && typeof store.getValue === 'function') {
      try { var sv = store.getValue(settingId); if (sv !== undefined) { v = sv; } } catch (e2) { /* keep default */ }
    }
    return { id: 'f.' + settingId, settingId: settingId,
             label: rec ? rec.label : settingId,
             value: v, valueLabel: v == null ? '—' : String(v),
             note: note || (rec ? rec.desc : ''), dest: sdest(settingId) };
  }
  /* A plain informational field not bound to an inventory setting. */
  function info(id, label, value, note, dest) {
    var f = { id: id, label: label, value: value, valueLabel: String(value == null ? '—' : value) };
    if (note) { f.note = note; }
    if (dest) { f.dest = dest; }
    return f;
  }

  /* ------------------------------------------------------------------ */
  /* m.providers — Provider / Account / Model / Installation             */
  /* ------------------------------------------------------------------ */

  var PV = function () { return window.PMProvider; };

  var GROUP_ORDER = [
    { id: 'grp.tools',    kind: 'tool',    label: 'Installed tools and signed-in apps' },
    { id: 'grp.accounts', kind: 'account', label: 'Connected accounts' },
    { id: 'grp.api',      kind: 'api',     label: 'API connections' },
    { id: 'grp.servers',  kind: 'server',  label: 'Server connections' },
    { id: 'grp.free',     kind: 'free',    label: 'Free and community models' }
  ];

  var WHAT_NEXT_LABELS = {
    'stop-wait':      'Stop and wait for the included-usage reset',
    'extra-balance':  'Spend from the extra balance',
    'switch-account': 'Switch to the next enabled account',
    'api-billing':    'Fall back to metered API billing',
    'ask':            'Ask before spending anything'
  };
  var ACCOUNT_HEALTH = {
    'ready':           { label: 'Ready',                    tone: 'ok' },
    'usage-exhausted': { label: 'Included usage used up',   tone: 'attention' },
    'signed-out':      { label: 'Not signed in',            tone: 'setup' },
    'auth-no-invoke':  { label: 'Signed in, cannot invoke', tone: 'attention' }
  };
  var FREE_QUALIFIER = {
    'rate-limited':            'Rate limited',
    'account-required':        'Account required',
    'keyless':                 'No account needed',
    'data-sharing':            'Data-sharing terms apply',
    'subscription-included':   'Included with a subscription',
    'promotional':             'Promotional offer',
    'temporarily-unavailable': 'Temporarily unavailable'
  };

  function providerStatus(p) {
    var st = PV().resolveProviderStatus(p);
    return { label: st.label, tone: st.tone, note: st.note || null };
  }

  function whatNextSteps(p) {
    var steps = [];
    var list = arr(p.whatNext);
    for (var i = 0; i < list.length; i++) {
      steps.push({ n: i + 1, label: WHAT_NEXT_LABELS[list[i]] || String(list[i]) });
    }
    return steps;
  }

  function providerCard(p, store) {
    var dab = obj(p.defaultAnswerBlock);
    var st = providerStatus(p);
    var card = {
      id: p.id, label: p.name, sub: dab.accountInUse || null,
      status: st,
      answers: {
        connected: dab.connected === true,
        accountInUse: dab.accountInUse || null,
        modelsAvail: dab.modelsAvail || null,
        onExhaust: dab.onExhaust || null,
        attention: dab.attention || null
      },
      dest: mdest('m.providers', p.id, 'overview')
    };
    if (hasFx(store, 'fx.reconnect-required') && (p.groupKind === 'server')) {
      card.status = { label: 'Reconnect required', tone: 'attention',
                      note: 'The last connection check could not reach this server. Reconnect to continue.' };
    }
    return card;
  }

  function secOverviewFor(p, store) {
    var dab = obj(p.defaultAnswerBlock);
    var st = providerStatus(p);
    var usage = PV().resolveUsageDetails(p);
    var items = [
      info('q.connected', 'Is it connected?', dab.connected ? 'Yes — ' + st.label : st.label,
           st.note || p.statusNote || null),
      info('q.account', 'Which account will be used?', dab.accountInUse || 'No account applies', null),
      info('q.included', 'What is included?', dab.billingRoute || 'Nothing metered here', dab.remaining || null),
      info('q.exhaust', 'What happens when included usage ends?', dab.onExhaust || 'Not applicable', null),
      info('q.models', 'Which models are available?', dab.modelsAvail || 'None yet', null),
      info('q.setup', 'Does anything need setup or repair?', dab.attention || 'Nothing right now.', null)
    ];
    if (usage.state === 'unavailable') {
      items.push(info('q.usage', 'Usage reporting', 'Unavailable', usage.reason));
      items[items.length - 1].tone = 'muted';
    }
    return { id: 'overview', kind: 'overview', title: 'At a glance',
             status: st, note: p.statusNote || null, items: items,
             whatNext: whatNextSteps(p) };
  }

  function secAccountsFor(p) {
    var boundary = PV().resolveAuthBoundary(p);
    var items = [];
    var accts = arr(p.accounts);
    var i;
    for (i = 0; i < accts.length; i++) {
      var a = accts[i];
      var h = ACCOUNT_HEALTH[a.health] || { label: 'Unknown', tone: 'muted' };
      items.push({
        id: 'acct.' + a.id, label: a.nickname || a.identity, sub: a.identity || null,
        status: { label: h.label, tone: h.tone },
        meta: {
          enabled: a.enabled === true,
          priority: a.priority || null,
          sticky: a.sticky === true,
          useNext: a.useNext === true,
          lastUse: obj(a.usage).lastUse || null
        },
        detail: {
          usage: obj(a.usage),
          projection: a.projection || null,
          signInOwner: boundary.label,
          authOwner: a.authOwner || null,
          lastCatalogRefresh: a.lastCatalogRefresh || null
        },
        dest: mdest('m.providers', p.id, 'accounts', 'acct.' + a.id)
      });
    }
    var conns = arr(p.connections);
    for (i = 0; i < conns.length; i++) {
      var c = conns[i];
      items.push({
        id: 'conn.' + c.id, label: connectionLabel(c), sub: null,
        status: { label: 'Connection', tone: 'muted' },
        detail: { route: c.route, note: c.note, kind: c.kind },
        dest: mdest('m.providers', p.id, 'accounts', 'conn.' + c.id)
      });
    }
    return { id: 'accounts', kind: 'roster', title: 'Accounts & connections',
             note: boundary.note || null,
             boundary: { label: boundary.label, signInVerb: boundary.signInVerb, pmDirect: boundary.pmDirect },
             items: items };
  }
  function connectionLabel(c) {
    if (c.kind === 'cli') { return 'Command-line sign-in'; }
    if (c.kind === 'oauth') { return 'Direct sign-in'; }
    if (c.kind === 'api') { return 'API connection'; }
    if (c.kind === 'server') { return 'Server connection'; }
    if (c.kind === 'grouping') { return 'Underlying routes'; }
    return 'Connection';
  }

  function secModelsFor(p) {
    var rows = [];
    var models = arr(p.models);
    for (var i = 0; i < models.length; i++) {
      var m = models[i];
      var route = PV().resolveRoute(m);
      var modes = [];
      if (arr(m.effort).length) { modes.push('adjustable thinking effort'); }
      if (m.fast) { modes.push('fast mode'); }
      rows.push({
        id: 'model.' + m.id,
        cells: {
          model: m.name,
          context: m.ctx ? (Math.round(m.ctx / 1000) + 'k tokens') : '—',
          modes: modes.length ? modes.join(', ') : 'standard',
          tools: m.toolSupport === 'full' ? 'Full tool use' : (m.toolSupport || 'Unknown'),
          route: route.differs ? ('Requested, but routing to ' + route.effective) : (m.fav ? 'Favorite' : 'Available')
        },
        flags: { favorite: m.fav === true, hidden: m.hidden === true, requested: m.requested === true },
        routing: route,
        detail: { evidence: arr(m.evidence), modalities: arr(m.modalities), priority: m.priority || null },
        dest: mdest('m.providers', p.id, 'models', 'model.' + m.id)
      });
    }
    return { id: 'models', kind: 'table', title: 'Models',
             note: 'Capabilities keep their evidence and freshness; fast mode and image support are never guessed from a name.',
             columns: [
               { id: 'model', label: 'Model' }, { id: 'context', label: 'Context' },
               { id: 'modes', label: 'Modes' }, { id: 'tools', label: 'Tools' },
               { id: 'route', label: 'Route' }
             ],
             rows: rows };
  }

  function secLimitsFor(p, store) {
    var items = [];
    var plans = arr(p.plans);
    var i;
    for (i = 0; i < plans.length; i++) {
      var pl = plans[i];
      items.push(info('plan.' + pl.id, pl.name,
        pl.kind === 'subscription' ? 'Subscription' : 'Pay as you go', pl.note || null));
    }
    var snap = obj(obj(D(store).usageSnapshot).perProvider)[p.id];
    if (snap) {
      items.push(info('usage.included', 'Included usage remaining', snap.includedRemaining || '—', snap.freshness || null));
      if (snap.extra) { items.push(info('usage.extra', 'Extra balance', snap.extra, null)); }
      if (snap.projection) { items.push(info('usage.projection', 'Outlook', snap.projection, null)); }
    }
    var usage = PV().resolveUsageDetails(p);
    if (usage.state === 'unavailable') {
      var it = info('usage.unavailable', 'Usage reporting', 'Unavailable', usage.reason);
      it.tone = 'muted';
      items.push(it);
    }
    return { id: 'limits', kind: 'overview', title: 'Plans, limits, and extra usage', items: items };
  }

  function secRoutingFor(p) {
    var items = [
      info('routing.exhaust', 'When included usage runs out',
           obj(p.defaultAnswerBlock).onExhaust || 'Not applicable', null)
    ];
    var models = arr(p.models);
    for (var i = 0; i < models.length; i++) {
      var route = PV().resolveRoute(models[i]);
      if (route.differs) {
        items.push(info('routing.fallback.' + models[i].id,
          'Requested ' + (route.requested || models[i].name),
          'Currently routed to ' + route.effective, route.why));
      }
    }
    return { id: 'routing', kind: 'overview', title: 'Routing & fallback',
             note: 'What runs where, and why a request may land on a different route than the one you asked for.',
             items: items, whatNext: whatNextSteps(p) };
  }

  function secInstallsFor(p, store) {
    var items = [];
    var insts = arr(p.installations);
    for (var i = 0; i < insts.length; i++) {
      var inst = PV().resolveInstallation(insts[i]);
      var item = {
        id: 'inst.' + inst.id,
        label: inst.title + (inst.version ? ' · ' + inst.version : ''),
        sub: inst.confidence.label + (inst.selected ? ' · In use' : ''),
        status: { label: inst.update.label, tone: inst.update.tone, note: inst.update.detail || null },
        flags: { selected: inst.selected, shadowed: inst.shadowed, manualOnly: inst.manualOnly, busy: inst.update.busy },
        shadowNote: inst.shadowNote,
        manualOnlyReason: inst.manualOnlyReason,
        actions: inst.actions,
        detail: {
          advanced: inst.advanced,
          updatePolicy: inst.update.policy,
          updateHistory: inst.update.history,
          verifyChecklist: inst.update.verifyChecklist
        },
        dest: mdest('m.providers', p.id, 'installs', 'inst.' + inst.id)
      };
      items.push(item);
    }
    return { id: 'installs', kind: 'roster', title: 'Installation and updates',
             note: 'One humanized card per installation. Success is never the installer exit code alone — the verify checklist must pass.',
             items: items };
  }

  function secSetupFor(p) {
    var offer = PV().installOfferSteps(p);
    var steps = [];
    var os = arr(offer.steps);
    for (var i = 0; i < os.length; i++) {
      steps.push({ n: i + 1, label: os[i].title, detail: os[i].body });
    }
    var choices = [];
    var hc = arr(offer.hostChoices);
    for (var j = 0; j < hc.length; j++) {
      choices.push({ id: hc[j].hostId + '/' + hc[j].envId, label: hc[j].label,
                     detail: { hostId: hc[j].hostId, envId: hc[j].envId } });
    }
    return { id: 'setup', kind: 'steps', title: 'Set up ' + p.name,
             note: offer.sourceNote,
             officialSource: offer.officialSource,
             policyNote: offer.policyNote,
             hostChoices: choices,
             steps: steps };
  }

  function secActivityFor(p, store) {
    var entries = [];
    var cat = obj(p.catalog);
    var ch = arr(cat.materialChanges);
    var i;
    for (i = 0; i < ch.length; i++) {
      entries.push({ at: ch[i].at, label: ch[i].what, detail: ch[i].effect, tone: 'muted' });
    }
    var insts = arr(p.installations);
    for (i = 0; i < insts.length; i++) {
      var hist = arr(obj(insts[i].update).history);
      for (var j = 0; j < hist.length; j++) {
        var h = hist[j];
        entries.push({ at: h.when,
          label: 'Updated ' + (insts[i].label || p.name) + ' from ' + h.from + ' to ' + h.to,
          detail: h.detail || null,
          tone: h.result === 'verified' ? 'ok' : 'attention' });
      }
    }
    var sec = { id: 'activity', kind: 'log', title: 'Activity', entries: entries };
    if (cat.lastChecked) {
      sec.note = 'Model catalog last checked ' + cat.lastChecked +
        (cat.state === 'fresh' ? ' — fresh.' : ' — ' + (cat.state || 'unknown') + '.');
      sec.catalog = { lastChecked: cat.lastChecked, state: cat.state || null,
                      sourceVersion: cat.sourceVersion || null, lastKnownGood: cat.lastKnownGood === true };
    }
    if (hasFx(store, 'fx.loading-cached')) {
      sec.loading = { state: 'refreshing', note: 'Showing the last known activity while a refresh runs.' };
    }
    return sec;
  }

  function secAdvancedFor(p) {
    var boundary = PV().resolveAuthBoundary(p);
    var fields = [
      info('adv.boundary', 'Sign-in ownership', boundary.label, boundary.note)
    ];
    if (p.oauthNote) { fields.push(info('adv.oauth', 'Sign-in note', p.oauthNote, null)); }
    var conns = arr(p.connections);
    for (var i = 0; i < conns.length; i++) {
      fields.push(info('adv.conn.' + conns[i].id, connectionLabel(conns[i]), conns[i].route, conns[i].note));
    }
    var cat = obj(p.catalog);
    if (cat.sourceVersion) {
      fields.push(info('adv.catalog', 'Catalog source', cat.sourceVersion, 'Last activated ' + (cat.lastActivated || '—')));
    }
    return { id: 'advanced', kind: 'form', title: 'Advanced & support', advanced: true, fields: fields };
  }

  function secServerFor(p) {
    var si = obj(p.serverInfo);
    return { id: 'server', kind: 'overview', title: 'Server',
             note: obj(p.authBoundary).note || null,
             items: [
               info('srv.url', 'Address', si.url || '—', null),
               info('srv.version', 'Server version', si.version || '—', null),
               info('srv.reach', 'Reachability', si.reachability === 'reachable' ? 'Reachable' : (si.reachability || 'Unknown'),
                    'Last handshake ' + (si.lastHandshake || '—')),
               info('srv.catalog', 'Model catalog', si.catalogSource === 'server-supplied' ? 'Supplied by the server' : (si.catalogSource || '—'),
                    'The server owns its provider credentials; Puppet Master holds only a scoped access token reference.')
             ] };
  }

  function secFreeRoutesFor(store) {
    var d = D(store);
    var items = [];
    var routes = arr(d.freeRoutes);
    var byId = {};
    var provs = arr(d.providers);
    var i;
    for (i = 0; i < provs.length; i++) { byId[provs[i].id] = provs[i]; }
    for (i = 0; i < routes.length; i++) {
      var r = PV().resolveFreeRoute(routes[i]);
      var under = byId[r.underlyingProviderId];
      items.push({
        id: 'route.' + r.id,
        label: routes[i].modelRef || r.id,
        sub: FREE_QUALIFIER[routes[i].qualifier] || routes[i].qualifier || null,
        status: { label: r.label, tone: r.tone, note: r.note || null },
        detail: {
          wrapperNote: r.wrapperNote,
          setupSteps: r.setupSteps,
          underlyingProvider: under ? under.name : r.underlyingProviderId
        },
        underlyingDest: mdest('m.providers', r.underlyingProviderId, 'overview'),
        dest: mdest('m.providers', 'free-community', 'routes', 'route.' + r.id)
      });
    }
    return { id: 'routes', kind: 'roster', title: 'Free routes',
             note: 'Free Models is a wrapper over the underlying routes. Credentials, quota, switching, and usage always belong to the underlying provider.',
             items: items };
  }

  function secFreeCatalogFor(store) {
    var fc = obj(D(store).freeCatalog);
    var entries = [];
    var hist = arr(fc.changeHistory);
    var i;
    for (i = 0; i < hist.length; i++) {
      entries.push({ at: hist[i].when, label: hist[i].change, tone: 'muted' });
    }
    var sources = [];
    var src = arr(fc.sources);
    for (i = 0; i < src.length; i++) {
      sources.push({ id: src[i].id, label: src[i].name,
                     sub: 'Checked ' + (src[i].lastChecked || '—'),
                     status: { label: src[i].validation === 'passed' ? 'Validated' : 'Needs review',
                               tone: src[i].validation === 'passed' ? 'ok' : 'attention' },
                     detail: { sourceVersion: src[i].sourceVersion, lastImported: src[i].lastImported,
                               lastActivated: src[i].lastActivated, lastKnownGood: src[i].lastKnownGood === true } });
    }
    return { id: 'catalog', kind: 'log', title: 'Catalog sources & changes',
             note: 'Catalogs refresh continuously and fall back to the last known good import when validation fails.',
             sources: sources, entries: entries };
  }

  function providerPage(p, store) {
    var tabs = ['overview'];
    var sections = { overview: secOverviewFor(p, store) };
    if (p.id === 'free-community') {
      sections.routes = secFreeRoutesFor(store);
      sections.catalog = secFreeCatalogFor(store);
      tabs.push('routes', 'catalog');
    }
    if (p.serverInfo) { sections.server = secServerFor(p); tabs.push('server'); }
    if (arr(p.accounts).length || arr(p.connections).length) {
      sections.accounts = secAccountsFor(p); tabs.push('accounts');
    }
    if (arr(p.models).length && p.id !== 'free-community') {
      sections.models = secModelsFor(p); tabs.push('models');
    }
    if (arr(p.plans).length || obj(obj(D(store).usageSnapshot).perProvider)[p.id] || p.usageDetails) {
      sections.limits = secLimitsFor(p, store); tabs.push('limits');
    }
    if (arr(p.models).length && p.id !== 'free-community') {
      sections.routing = secRoutingFor(p); tabs.push('routing');
    }
    if (arr(p.installations).length) { sections.installs = secInstallsFor(p, store); tabs.push('installs'); }
    if (p.setupOffer) { sections.setup = secSetupFor(p); tabs.push('setup'); }
    sections.activity = secActivityFor(p, store); tabs.push('activity');
    sections.advanced = secAdvancedFor(p); tabs.push('advanced');
    return { title: p.name, status: providerStatus(p), tabs: tabs, sections: sections };
  }

  function providersModel(store) {
    var d = D(store);
    var provs = arr(d.providers);
    var groups = [];
    var pages = {};
    var attention = [];
    var i, g;
    for (g = 0; g < GROUP_ORDER.length; g++) {
      groups.push({ id: GROUP_ORDER[g].id, label: GROUP_ORDER[g].label, items: [] });
    }
    for (i = 0; i < provs.length; i++) {
      var p = provs[i];
      var card = providerCard(p, store);
      for (g = 0; g < GROUP_ORDER.length; g++) {
        if (GROUP_ORDER[g].kind === p.groupKind) { groups[g].items.push(card); break; }
      }
      pages[p.id] = providerPage(p, store);
      if (card.answers.attention || card.status.tone === 'attention' || card.status.tone === 'setup') {
        attention.push({
          id: 'att.' + p.id, label: p.name,
          value: card.answers.attention || card.status.label,
          note: card.status.note, tone: card.status.tone === 'setup' ? 'setup' : 'attention',
          dest: card.dest
        });
      }
    }
    var kept = [];
    for (g = 0; g < groups.length; g++) { if (groups[g].items.length) { kept.push(groups[g]); } }
    var sections = [];
    if (attention.length) {
      sections.push({ id: 'attention', kind: 'overview', title: 'Needs attention', items: attention });
    }
    sections.push({ id: 'connections', kind: 'roster', title: 'Connections', groups: kept,
                    note: 'Providers are grouped by how they connect. Open one for accounts, models, limits, routing, and installation.' });
    return {
      managerId: 'm.providers', title: 'AI Providers', archetype: 'roster-detail',
      blurb: 'Accounts, models, usage behavior, routing, and installations for every AI connection.',
      sections: sections,
      pages: pages
    };
  }

  function providersObjects(store) {
    var d = D(store);
    var out = [];
    var provs = arr(d.providers);
    var i, j;
    for (i = 0; i < provs.length; i++) {
      var p = provs[i];
      out.push({ id: p.id, label: p.name, kind: 'provider',
                 note: obj(p.defaultAnswerBlock).accountInUse || null,
                 dest: mdest('m.providers', p.id, 'overview') });
      var accts = arr(p.accounts);
      for (j = 0; j < accts.length; j++) {
        out.push({ id: p.id + '.acct.' + accts[j].id, label: accts[j].nickname || accts[j].identity,
                   kind: 'account', note: p.name,
                   dest: mdest('m.providers', p.id, 'accounts', 'acct.' + accts[j].id) });
      }
      var insts = arr(p.installations);
      for (j = 0; j < insts.length; j++) {
        out.push({ id: p.id + '.inst.' + insts[j].id,
                   label: (insts[j].label || p.name) + ' installation',
                   kind: 'installation', note: insts[j].version ? ('Version ' + insts[j].version) : null,
                   dest: mdest('m.providers', p.id, 'installs', 'inst.' + insts[j].id) });
      }
      var models = arr(p.models);
      for (j = 0; j < models.length; j++) {
        out.push({ id: p.id + '.model.' + models[j].id, label: models[j].name,
                   kind: 'model', note: p.name,
                   dest: mdest('m.providers', p.id, 'models', 'model.' + models[j].id) });
      }
      if (arr(p.plans).length || p.usageDetails) {
        out.push({ id: p.id + '.limits', label: 'Rate limits', kind: 'page', note: p.name,
                   dest: mdest('m.providers', p.id, 'limits') });
      }
    }
    /* Credential objects — duplicate "API key" labels are intentional search
       corpus cases; each note disambiguates. */
    out.push({ id: 'claude.key', label: 'API key', kind: 'credential',
               note: 'Anthropic API · Platyr billing (disabled)',
               dest: mdest('m.providers', 'claude', 'accounts', 'acct.claude-api') });
    out.push({ id: 'openrouter.key', label: 'API key', kind: 'credential',
               note: 'OpenRouter · stored in the system keychain',
               dest: mdest('m.providers', 'openrouter', 'accounts') });
    out.push({ id: 'opencode.key', label: 'API key', kind: 'credential',
               note: 'OpenCode Server · scoped access token reference',
               dest: mdest('m.providers', 'opencode', 'server') });
    var routes = arr(d.freeRoutes);
    for (i = 0; i < routes.length; i++) {
      out.push({ id: 'free.' + routes[i].id, label: routes[i].modelRef || routes[i].id,
                 kind: 'free-route', note: FREE_QUALIFIER[routes[i].qualifier] || null,
                 dest: mdest('m.providers', 'free-community', 'routes', 'route.' + routes[i].id) });
    }
    return out;
  }

  function providersActions(store) {
    var d = D(store);
    var provs = arr(d.providers);
    var byId = {};
    for (var i = 0; i < provs.length; i++) { byId[provs[i].id] = provs[i]; }
    var ollamaInst = byId['local-ollama'] ? PV().resolveInstallation(arr(byId['local-ollama'].installations)[0]) : null;
    return [
      { id: 'act.provider-refresh', label: 'Refresh provider status', ico: 'refresh', available: true,
        run: function () { return runOp('provider-refresh', 'all', 'Provider status refresh', 'Re-checks reachability, sign-in, and usage for every connection.'); } },
      { id: 'act.catalog-refresh', label: 'Refresh model catalogs', ico: 'refresh', available: true,
        run: function () { return runOp('catalog-refresh', 'all', 'Model catalog refresh', 'Fetches, validates, and activates catalogs; falls back to last known good on failure.'); } },
      { id: 'act.reconnect', label: 'Reconnect servers', ico: 'plug', available: true,
        run: function () { return runOp('reconnect', 'servers', 'Server reconnect', 'Re-establishes the local and LAN server connections.'); } },
      { id: 'act.invoke-test', label: 'Run a test generation', ico: 'play', available: true,
        run: function () { return runOp('invoke-test', 'copilot', 'Test generation', 'Sends one tiny masked request through the selected route and reports the result honestly.'); } },
      { id: 'act.install-scan', label: 'Scan for installations', ico: 'search', available: true,
        run: function () { return runOp('install-scan', 'all-hosts', 'Installation scan', 'Detects candidates, traces wrappers and symlinks, and queries package databases.'); } },
      { id: 'act.install-update.codex', label: 'Install the Codex CLI update', ico: 'download', available: true,
        reason: null,
        run: function () { return runOp('install-update', 'inst.codex.npm', 'Codex CLI update', 'Ask-first policy: this click is the ask. Staged install, then the full verify checklist.'); } },
      { id: 'act.install-update.ollama', label: 'Update the local Ollama runtime', ico: 'download',
        available: false,
        reason: (ollamaInst && ollamaInst.manualOnlyReason) || 'Ownership is not proven, so Puppet Master never modifies this installation. Updates stay manual.',
        run: function () {
          return refuse('Ollama update',
            (ollamaInst && ollamaInst.manualOnlyReason) || 'Unknown installation owner: manual-only. Puppet Master will not modify it.');
        } },
      { id: 'act.install-repair.copilot', label: 'Repair the Copilot extension', ico: 'wrench', available: true,
        run: function () { return runOp('install-repair', 'inst.copilot.ghext', 'Copilot repair', 'Restores the last verified generation and re-runs the verify checklist.'); } },
      { id: 'act.setup.cursor-cli', label: 'Set up the Cursor CLI', ico: 'download', available: true,
        run: function () {
          return runOp('install-acquire', 'cursor-cli', 'Cursor CLI setup',
            'Explicit install from cursor.com/cli for the exact selected host and environment. Sign-in stays a separate step.');
        } }
    ];
  }

  managers.register([{
    id: 'm.providers',
    family: 'Provider / Account / Model / Installation',
    cat: 'ai',
    title: 'AI Providers',
    blurb: 'Accounts, models, usage behavior, routing, and installations for every AI connection.',
    icon: 'brain',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['ai.'],
    model: providersModel,
    objects: providersObjects,
    actions: providersActions,
    states: ['fx.loading-cached', 'fx.reconnect-required', 'fx.rollback-complete', 'fx.changed-elsewhere']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.context — Context & Instructions                                  */
  /* ------------------------------------------------------------------ */

  function contextModel(store) {
    var cs = obj(D(store).contextSources);
    var fields = [];
    var controls = arr(cs.normalControls);
    var i;
    for (i = 0; i < controls.length; i++) { fields.push(field(store, controls[i])); }

    var admitted = [];
    var adm = arr(obj(cs.lastTurn).admitted);
    for (i = 0; i < adm.length; i++) {
      admitted.push({ id: 'adm.' + i, cells: { source: adm[i].source,
        size: (adm[i].tokens != null ? (adm[i].tokens >= 1000 ? (Math.round(adm[i].tokens / 100) / 10) + 'k tokens' : adm[i].tokens + ' tokens') : '—'),
        why: adm[i].why } });
    }
    var omitted = [];
    var om = arr(obj(cs.lastTurn).omitted);
    for (i = 0; i < om.length; i++) {
      omitted.push({ id: 'om.' + i, cells: { source: om[i].source, why: om[i].why } });
    }
    var chain = [];
    var ac = arr(cs.agentsChain);
    for (i = 0; i < ac.length; i++) {
      chain.push({ id: 'chain.' + ac[i].precedence, cells: { order: String(ac[i].precedence), path: ac[i].path } });
    }
    var tools = obj(cs.toolsSelectedVsInstalled);
    var cache = obj(cs.cacheStrategy);
    var hashes = [];
    var sh = arr(cache.sourceHashes);
    for (i = 0; i < sh.length; i++) {
      hashes.push({ id: 'hash.' + i, cells: { source: sh[i].source, hash: sh[i].hash } });
    }

    return {
      managerId: 'm.context', title: 'Context & Instructions', archetype: 'preference-doc',
      blurb: 'What goes into each request, which instructions apply, and how the context window is spent.',
      sections: [
        { id: 'controls', kind: 'form', title: 'What the model gets',
          note: 'Everyday choices about what accompanies each request. The diagnostic sections below show exactly what happened last turn.',
          fields: fields },
        { id: 'lastTurn', kind: 'table', title: 'What went into the last request',
          note: 'The context admission receipt for the most recent turn.',
          columns: [{ id: 'source', label: 'Source' }, { id: 'size', label: 'Size' }, { id: 'why', label: 'Why it was included' }],
          rows: admitted },
        { id: 'omitted', kind: 'table', title: 'Left out, and why',
          columns: [{ id: 'source', label: 'Source' }, { id: 'why', label: 'Why it stayed out' }],
          rows: omitted },
        { id: 'footprint', kind: 'overview', title: 'Footprint',
          items: [
            info('fp.persona', 'Persona footprint', cs.personaFootprint || '—', null),
            info('fp.tools', 'Tools offered this turn',
                 arr(tools.selected).length + ' of ' + arr(tools.installed).length + ' installed',
                 'Only tools selected for the turn enter the prompt; the rest stay out until needed.')
          ] },
        { id: 'instructions', kind: 'table', title: 'Instruction sources in effect', advanced: true,
          note: 'Project instruction files apply in this order; later files refine earlier ones.',
          columns: [{ id: 'order', label: 'Order' }, { id: 'path', label: 'File' }],
          rows: chain },
        { id: 'cache', kind: 'overview', title: 'Prompt caching', advanced: true,
          note: cache.note || null,
          items: [ info('cache.strategy', 'Strategy', cache.strategy || '—', null) ],
          hashes: { prefixHash: cache.prefixHash || null, rows: hashes } }
      ]
    };
  }

  managers.register([{
    id: 'm.context',
    family: 'Context & Instructions',
    cat: 'memory',
    title: 'Context & Instructions',
    blurb: 'What goes into each request, which instructions apply, and how the context window is spent.',
    icon: 'layers',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['memory.assembly.', 'memory.limits.'],
    model: contextModel,
    objects: function (store) {
      return [
        { id: 'ctx.last-request', label: 'Last request contents', kind: 'report',
          note: 'What was admitted and omitted last turn', dest: mdest('m.context', null, null, 'lastTurn') },
        { id: 'ctx.instruction-chain', label: 'Instruction precedence chain', kind: 'report',
          note: 'Which instruction files apply, in order', dest: mdest('m.context', null, null, 'instructions') },
        { id: 'ctx.cache', label: 'Prompt cache strategy', kind: 'report',
          note: 'Stable prefix caching and source hashes', dest: mdest('m.context', null, null, 'cache') }
      ];
    },
    actions: function (store) {
      return [
        { id: 'act.context.preview', label: 'Preview the compiled prompt', ico: 'eye', available: true,
          run: function () { return receipt('Compiled prompt preview', 'Assembled from the sources above exactly as the next request would see them. Nothing is sent.'); } },
        { id: 'act.context.compact', label: 'Compact the conversation now', ico: 'broom', available: true,
          run: function () { return runOp('context-compact', 'current-thread', 'Manual compaction', 'Summarizes older turns and keeps the summary in place of the originals.'); } }
      ];
    },
    states: ['fx.loading-cached', 'fx.long-text']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.memory — Memory                                                   */
  /* ------------------------------------------------------------------ */

  var MEMORY_KIND = { 'preference': 'Preference', 'project-fact': 'Project fact', 'lesson': 'Lesson' };
  var MEMORY_STATE = {
    'verified':        { label: 'Verified',        tone: 'ok' },
    'awaiting-review': { label: 'Awaiting review', tone: 'setup' }
  };

  function memoryModel(store) {
    var gists = arr(D(store).memory);
    var items = [];
    var pinned = 0, awaiting = 0;
    for (var i = 0; i < gists.length; i++) {
      var g = gists[i];
      if (g.pinned) { pinned++; }
      if (g.state === 'awaiting-review') { awaiting++; }
      var st = MEMORY_STATE[g.state] || { label: 'Stored', tone: 'muted' };
      items.push({
        id: 'mem.' + g.id,
        label: trunc(g.text, 96),
        sub: (MEMORY_KIND[g.kind] || 'Note') + ' · ' + (g.scope === 'project' ? 'This project' : 'Everywhere'),
        status: { label: st.label, tone: st.tone },
        meta: { pinned: g.pinned === true, halfLife: g.halfLife || null, lastRecall: g.lastRecall || null },
        detail: { fullText: g.text, versions: arr(g.versions), evidence: arr(g.evidence) },
        dest: mdest('m.memory', null, null, 'mem.' + g.id)
      });
    }
    return {
      managerId: 'm.memory', title: 'Memory', archetype: 'roster-detail',
      blurb: 'What the Assistant remembers about you and this project, with evidence and honest fading.',
      sections: [
        { id: 'overview', kind: 'overview', title: 'How memory behaves',
          note: 'Fading changes how readily a memory is recalled — it never silently changes or deletes what was stored. Pinned memories stay active.',
          items: [
            info('mem.count', 'Memories kept', gists.length + ' — ' + pinned + ' pinned', null),
            info('mem.review', 'Awaiting your review', awaiting === 0 ? 'None' : String(awaiting),
                 awaiting ? 'Unreviewed memories are recalled cautiously until you confirm them.' : null)
          ] },
        { id: 'gists', kind: 'roster', title: 'Memories', items: items },
        { id: 'maintenance', kind: 'overview', title: 'Maintenance', advanced: true,
          items: [
            info('mem.versions', 'Version history', 'Kept per memory', 'Every edit keeps the previous wording; restore is always available.'),
            info('mem.evidence', 'Evidence', 'Kept per memory', 'Each memory records where it came from. Verify shows the evidence before you confirm.')
          ] }
      ]
    };
  }

  managers.register([{
    id: 'm.memory',
    family: 'Memory',
    cat: 'memory',
    title: 'Memory',
    blurb: 'What the Assistant remembers about you and this project, with evidence and honest fading.',
    icon: 'sparkle',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['memory.retention.'],
    model: memoryModel,
    objects: function (store) {
      var gists = arr(D(store).memory);
      var out = [];
      for (var i = 0; i < gists.length; i++) {
        out.push({ id: 'mem.' + gists[i].id, label: trunc(gists[i].text, 64), kind: 'memory',
                   note: gists[i].scope === 'project' ? 'This project' : 'Everywhere',
                   dest: mdest('m.memory', null, null, 'mem.' + gists[i].id) });
      }
      return out;
    },
    actions: function (store) {
      return [
        { id: 'act.memory.review', label: 'Review unconfirmed memories', ico: 'eye', available: true,
          run: function () { return receipt('Memory review', 'Opens each awaiting-review memory with its evidence so you can confirm, edit, or discard it.'); } },
        { id: 'act.memory.dedupe', label: 'Merge duplicates', ico: 'copy', available: true,
          run: function () { return runOp('memory-dedupe', 'project', 'Duplicate merge', 'Finds near-duplicate memories and proposes merges. Nothing merges without your confirmation.'); } },
        { id: 'act.memory.archive', label: 'Archive fully faded memories', ico: 'box', available: true,
          run: function () { return runOp('memory-archive', 'project', 'Archive faded memories', 'Moves memories below the recall threshold to the archive. They stay stored and restorable.'); } }
      ];
    },
    states: ['fx.long-text', 'fx.loading-cached']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.personas — Personas                                               */
  /* ------------------------------------------------------------------ */

  var PERSONA_SCOPE = { 'thread': 'Per conversation', 'project': 'This project', 'global': 'Everywhere' };

  function personasModel(store) {
    var list = arr(D(store).personas);
    var items = [];
    var defaultId = null;
    if (store && typeof store.getValue === 'function') {
      try { defaultId = store.getValue('personas.library.default-persona'); } catch (e) { defaultId = null; }
    }
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var eligible = obj(p.runtime).eligible !== false;
      items.push({
        id: 'persona.' + p.id,
        label: p.name,
        sub: p.role || null,
        status: eligible ? { label: 'Available', tone: 'ok' }
                         : { label: 'Helper only', tone: 'muted',
                             note: 'Used only inside delegated work; never a conversation default.' },
        meta: { footprint: obj(p.runtime).footprint || null,
                defaultScope: PERSONA_SCOPE[p.scopeDefault] || p.scopeDefault || null,
                childOnly: p.childOnly === true },
        detail: { summary: p.definitionSummary, capsulePreview: p.capsulePreview },
        dest: mdest('m.personas', null, null, 'persona.' + p.id)
      });
    }
    return {
      managerId: 'm.personas', title: 'Personas', archetype: 'roster-detail',
      blurb: 'The working styles the AI can adopt — behavior, never authority.',
      sections: [
        { id: 'overview', kind: 'overview', title: 'Personas',
          items: [
            info('ps.count', 'Personas installed', String(list.length), null),
            info('ps.default', 'Default for new conversations',
                 defaultId ? String(defaultId) : 'Assistant',
                 null, sdest('personas.library.default-persona'))
          ] },
        { id: 'roster', kind: 'roster', title: 'Library', items: items },
        { id: 'capsule', kind: 'preview', title: 'What the model actually sees',
          note: 'The capsule is the persona text sent to the model, with its size. Nothing hidden rides along.',
          preview: { text: list.length ? list[0].capsulePreview : '', tokens: list.length ? obj(list[0].runtime).footprint : null } },
        { id: 'boundary', kind: 'overview', title: 'What a persona can never do',
          note: 'A persona shapes behavior only. It cannot grant broader access, widen the protected-file boundary, force a provider, or load every skill eagerly. Conversation mode and access level are separate choices.',
          items: [] }
      ]
    };
  }

  managers.register([{
    id: 'm.personas',
    family: 'Personas',
    cat: 'personas',
    title: 'Personas',
    blurb: 'The working styles the AI can adopt — behavior, never authority.',
    icon: 'masks',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['personas.'],
    model: personasModel,
    objects: function (store) {
      var list = arr(D(store).personas);
      var out = [];
      for (var i = 0; i < list.length; i++) {
        out.push({ id: 'persona.' + list[i].id, label: list[i].name, kind: 'persona',
                   note: list[i].role || null,
                   dest: mdest('m.personas', null, null, 'persona.' + list[i].id) });
      }
      return out;
    },
    actions: function (store) {
      return [
        { id: 'act.persona.import', label: 'Import a persona', ico: 'upload', available: true,
          run: function () { return runOp('import-preview', 'persona', 'Persona import preview', 'Shows the definition diff and runs the trust, secret, and prompt-injection scans before anything is added.'); } },
        { id: 'act.persona.capsule', label: 'Preview a capsule', ico: 'eye', available: true,
          run: function () { return receipt('Capsule preview', 'Shows the exact persona text and token estimate the model would receive.'); } }
      ];
    },
    states: ['fx.import-conflict', 'fx.long-text']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.goal — Goal & Automation                                          */
  /* ------------------------------------------------------------------ */

  var GOAL_VALUE_LABELS = {
    'every-phase': 'At every phase boundary',
    'checkpoint-safe': 'Pause and resume only at safe checkpoints',
    'standard': 'Standard',
    'ask': 'Ask first',
    'auto-per-goal': 'A fresh worktree per goal',
    'high-quality': 'High quality',
    'balanced': 'Balanced',
    'fast-local': 'Fast local'
  };
  function goalLabel(v) { return GOAL_VALUE_LABELS[v] || String(v == null ? '—' : v); }

  function goalModel(store) {
    var g = obj(D(store).goalDefaults);
    var op = obj(D(store).operational);
    var pr = obj(g.planningRoute);
    var route = PV().resolveRoute({ requestedRoute: pr.requested, effectiveRoute: pr.effective, fallbackReason: pr.why });
    return {
      managerId: 'm.goal', title: 'Goals & Automation', archetype: 'preference-doc',
      blurb: 'Defaults and ceilings for long-running goals. Live run state lives with the run, not here.',
      sections: [
        { id: 'defaults', kind: 'form', title: 'Goal defaults',
          fields: [
            info('goal.checkpoint', 'Checkpoints', goalLabel(g.checkpointPolicy), 'Where progress is saved and where a pause can safely land.'),
            info('goal.pause', 'Pause and resume', goalLabel(g.pauseResume), null),
            info('goal.verify', 'Verification strength', goalLabel(g.verificationStrength), 'How hard finished work is checked before it counts as done.'),
            info('goal.reserve', 'Capacity reserve', g.capacityReserve || '—', 'Held back for synthesis, verification, and repair at the end of a run.'),
            info('goal.cross', 'Working across projects', goalLabel(g.crossProject), null),
            info('goal.worktree', 'Worktrees', goalLabel(g.worktreePolicy), 'Keeps goal work isolated from your checkout until it merges.')
          ] },
        { id: 'fanout', kind: 'overview', title: 'Parallel work',
          note: op.waveWarning || null,
          items: [
            info('fan.pref', 'Preferred parallel agents', String(obj(g.fanOut).sustainable || '—'),
                 'The everyday level the schedule aims for.'),
            info('fan.ceiling', 'Never more than', String(obj(g.fanOut).ceiling || '—'), null),
            info('fan.now', 'Sustainable right now', String(op.sustainableNow != null ? op.sustainableNow : '—'),
                 op.reason || null)
          ] },
        { id: 'routes', kind: 'overview', title: 'Route classes',
          items: [
            info('route.planning', 'Planning route',
                 route.differs ? ('Requested ' + route.requested + ', currently ' + route.effective) : (route.effective || '—'),
                 route.differs ? route.why : 'The high-quality route used to draft and revise plans.'),
            info('route.worker', 'Worker route class', goalLabel(g.workerRouteClass), null),
            info('route.reviewer', 'Reviewer route class', goalLabel(g.reviewerRouteClass), null)
          ] },
        { id: 'boundary', kind: 'overview', title: 'Who owns what',
          note: g.boundaryNote || null, items: [] }
      ]
    };
  }

  managers.register([{
    id: 'm.goal',
    family: 'Goal & Automation',
    cat: 'planning',
    title: 'Goals & Automation',
    blurb: 'Defaults and ceilings for long-running goals. Live run state lives with the run, not here.',
    icon: 'clipboard',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['planning.interview.', 'planning.verification.'],
    model: goalModel,
    objects: function (store) {
      return [
        { id: 'goal.defaults', label: 'Goal defaults', kind: 'page',
          note: 'Checkpoints, verification, reserves', dest: mdest('m.goal', null, null, 'defaults') },
        { id: 'goal.fanout', label: 'Parallel work limits', kind: 'page',
          note: 'Preferred and maximum concurrent agents', dest: mdest('m.goal', null, null, 'fanout') },
        { id: 'goal.planning-route', label: 'Planning route', kind: 'page',
          note: 'Requested versus effective planning model', dest: mdest('m.goal', null, null, 'routes') }
      ];
    },
    actions: function (store) {
      return [
        { id: 'act.goal.capacity', label: 'Check sustainable capacity now', ico: 'gauge', available: true,
          run: function () {
            var op = obj(D(store).operational);
            return receipt('Capacity check',
              'Sustainable now: ' + (op.sustainableNow != null ? op.sustainableNow : '—') +
              ' of a ceiling of ' + (op.configuredCeiling != null ? op.configuredCeiling : '—') + '. ' + (op.reason || ''));
          } }
      ];
    },
    states: ['fx.changed-elsewhere']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.crew — Crew                                                       */
  /* ------------------------------------------------------------------ */

  function crewPage(c) {
    var memberRows = [];
    var ms = arr(c.members);
    for (var i = 0; i < ms.length; i++) {
      memberRows.push({ id: 'member.' + i, cells: {
        role: ms[i].role, persona: ms[i].persona,
        routes: arr(ms[i].routeCandidates).join(' · ') || '—'
      } });
    }
    return {
      title: c.name,
      tabs: ['members', 'guards', 'workflow'],
      sections: {
        members: { id: 'members', kind: 'table', title: 'Members',
          note: 'Route candidates are preferences; accounts and installations stay managed by the providers, never by the crew.',
          columns: [{ id: 'role', label: 'Role' }, { id: 'persona', label: 'Persona' }, { id: 'routes', label: 'Route candidates' }],
          rows: memberRows },
        guards: { id: 'guards', kind: 'form', title: 'Budgets & guards',
          fields: [
            info('guard.usage', 'Usage guard', obj(c.guards).usage || '—', null),
            info('guard.time', 'Time guard', obj(c.guards).time || '—', null),
            info('guard.reserve', 'Reserve', c.reserve || '—', null),
            info('guard.size', 'Crew size', c.minMembers + ' to ' + c.maxMembers + ' members',
                 'The crew shrinks toward the minimum when capacity is tight.')
          ] },
        workflow: { id: 'workflow', kind: 'overview', title: 'How the crew works',
          items: [
            info('wf.board', 'Coordination', c.board || '—', null),
            info('wf.consensus', 'Sign-off', c.consensus || '—', null),
            info('wf.isolation', 'Write isolation',
                 obj(c.isolation).worktree ? 'Each run works in its own worktree' : 'Shared checkout',
                 arr(obj(c.isolation).paths).length ? ('Allowed paths: ' + arr(obj(c.isolation).paths).join(', ')) : null),
            info('wf.failure', 'If things go wrong', c.failure || '—', null)
          ] }
      }
    };
  }

  function crewModel(store) {
    var crews = arr(D(store).crew);
    var items = [];
    var pages = {};
    for (var i = 0; i < crews.length; i++) {
      var c = crews[i];
      var squeezed = c.effectiveConcurrency != null && c.requestedConcurrency != null &&
                     c.effectiveConcurrency < c.requestedConcurrency;
      items.push({
        id: c.id, label: c.name, sub: c.purpose || null,
        status: squeezed
          ? { label: 'Running below requested size', tone: 'progress',
              note: c.requestedConcurrency + ' requested, ' + c.effectiveConcurrency + ' running now, ' +
                    (c.queuedWaves || 0) + ' waves queued. Capacity, not configuration.' }
          : { label: 'Ready', tone: 'ok' },
        meta: { minMembers: c.minMembers, maxMembers: c.maxMembers,
                requestedConcurrency: c.requestedConcurrency, effectiveConcurrency: c.effectiveConcurrency,
                queuedWaves: c.queuedWaves || 0 },
        dest: mdest('m.crew', c.id, 'members')
      });
      pages[c.id] = crewPage(c);
    }
    return {
      managerId: 'm.crew', title: 'Crews', archetype: 'roster-detail',
      blurb: 'Reusable team templates for parallel work — roles, budgets, and coordination.',
      sections: [
        { id: 'overview', kind: 'overview', title: 'Crews',
          note: 'A crew is a template, not a persona, provider, or permission grant. Members still obey every permission rule.',
          items: [ info('crew.count', 'Templates', String(crews.length), null) ] },
        { id: 'roster', kind: 'roster', title: 'Templates', items: items }
      ],
      pages: pages
    };
  }

  managers.register([{
    id: 'm.crew',
    family: 'Crew',
    cat: 'branching',
    title: 'Crews',
    blurb: 'Reusable team templates for parallel work — roles, budgets, and coordination.',
    icon: 'users',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['branching.crew.', 'branching.subagents.'],
    model: crewModel,
    objects: function (store) {
      var crews = arr(D(store).crew);
      var out = [];
      for (var i = 0; i < crews.length; i++) {
        out.push({ id: crews[i].id, label: crews[i].name, kind: 'crew',
                   note: crews[i].purpose || null, dest: mdest('m.crew', crews[i].id, 'members') });
      }
      return out;
    },
    actions: function (store) {
      return [
        { id: 'act.crew.validate', label: 'Validate route candidates', ico: 'checkCircle', available: true,
          run: function () { return runOp('invoke-test', 'crew-routes', 'Crew route validation', 'Checks that every member has at least one ready route candidate and reports the ones that would fall back.'); } }
      ];
    },
    states: ['fx.loading-cached']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.permissions — Permissions & FileSafe                              */
  /* ------------------------------------------------------------------ */

  var DECISION_LABELS = { 'ask': 'Ask first', 'allow': 'Allowed', 'deny': 'Never' };
  var TOOL_LABELS = {
    '*': 'Everything', 'file.read': 'Reading files', 'file.write': 'Writing files',
    'shell.exec': 'Running commands', 'web.fetch': 'Fetching web pages'
  };

  function permissionsModel(store) {
    var pm = obj(D(store).permissionsModel);
    var i;
    var profiles = arr(pm.accessProfiles);
    var profileOptions = [];
    for (i = 0; i < profiles.length; i++) { profileOptions.push({ id: profiles[i].id, label: profiles[i].label }); }
    var currentProfile = pm.accessProfile || 'ask';
    var currentLabel = currentProfile;
    for (i = 0; i < profiles.length; i++) { if (profiles[i].id === currentProfile) { currentLabel = profiles[i].label; } }

    var ruleRows = [];
    var rules = arr(pm.rules);
    for (i = 0; i < rules.length; i++) {
      var r = rules[i];
      ruleRows.push({
        id: 'rule.' + r.n,
        cells: {
          order: String(r.n),
          applies: (TOOL_LABELS[r.tool] || r.tool) + (r.match && r.match !== '*' ? ' matching ' + r.match : ''),
          decision: DECISION_LABELS[r.decision] || r.decision,
          origin: r.origin || '—'
        },
        flags: { locked: r.locked === true, managed: r.managed === true },
        stateNote: r.managed ? (r.managedReason || 'Managed by an external policy.') : (r.locked ? (r.note || 'The wildcard floor cannot be removed.') : null),
        detail: { tool: r.tool, match: r.match, scope: r.scope },
        dest: mdest('m.permissions', null, null, 'rule.' + r.n)
      });
    }

    var trace = obj(pm.evaluationTrace);
    var personaRows = [];
    var pp = arr(pm.perPersona);
    for (i = 0; i < pp.length; i++) {
      personaRows.push({ id: 'pp.' + pp[i].personaId, cells: {
        persona: pp[i].personaId === 'p-patch-auditor' ? 'Patch Auditor' : (pp[i].personaId === 'p-teacher' ? 'Teacher' : pp[i].personaId),
        profile: pp[i].profile === 'read-only' ? 'Read only' : pp[i].profile,
        delta: pp[i].delta || 'No additions'
      } });
    }

    var fs = obj(pm.fileSafe);
    var fsChecks = [
      { id: 'fs.state', label: 'Boundary', state: fs.state === 'healthy' ? 'Healthy' : (fs.state || 'Unknown'),
        tone: fs.state === 'healthy' ? 'ok' : 'attention', note: fs.floorNote || null },
      { id: 'fs.scopes', label: 'Protected locations', state: arr(fs.protectedScopes).length + ' protected',
        tone: 'ok', note: 'Always protected, no matter what any rule says.',
        detail: { scopes: arr(fs.protectedScopes) } },
      { id: 'fs.external', label: 'Outside folders allowed in', state: arr(fs.externalAllowlist).length + ' entry',
        tone: 'ok', detail: { allowlist: arr(fs.externalAllowlist) } },
      { id: 'fs.repair', label: 'Repair', state: obj(fs.repair).needed ? 'Needed' : 'Not needed',
        tone: obj(fs.repair).needed ? 'attention' : 'ok', note: obj(fs.repair).guidance || null }
    ];

    var dl = obj(pm.doomLoop);
    var tripped = hasFx(store, 'fx.doom-loop-tripped') || dl.lastTrip != null;

    return {
      managerId: 'm.permissions', title: 'Permissions & FileSafe', archetype: 'preference-doc',
      blurb: 'What the AI may do on its own, when it must ask, and the file boundary nothing can cross.',
      sections: [
        { id: 'profile', kind: 'form', title: 'Access level',
          note: pm.planReviewNote || null,
          fields: [
            { id: 'f.access-profile', label: 'How much the AI may do on its own',
              value: currentProfile, valueLabel: currentLabel, options: profileOptions,
              note: 'Plan and review work is effect-limited, not tool-free: safe reading, research, and testing still run.',
              dest: sdest('safety.rules.default-tool-permission') }
          ] },
        { id: 'rules', kind: 'table', title: 'Rules',
          note: 'Rules are checked in order and the last matching rule wins. Drag to reorder; the worked example below shows the logic on a real command.',
          columns: [
            { id: 'order', label: 'Order' }, { id: 'applies', label: 'Applies to' },
            { id: 'decision', label: 'Decision' }, { id: 'origin', label: 'Came from' }
          ],
          rows: ruleRows },
        { id: 'explain', kind: 'overview', title: 'Worked example', advanced: true,
          note: trace.explanation || null,
          items: [
            info('trace.input', 'Command tested', trace.input || '—', null),
            info('trace.matches', 'Rules that matched', arr(trace.matches).join(', ') || '—', null),
            info('trace.winner', 'Rule that decided', trace.winner != null ? String(trace.winner) : '—', null)
          ] },
        { id: 'personas', kind: 'table', title: 'Per-persona limits',
          note: 'A persona can be held below the project access level, never above it.',
          columns: [{ id: 'persona', label: 'Persona' }, { id: 'profile', label: 'Profile' }, { id: 'delta', label: 'Adjustments' }],
          rows: personaRows },
        { id: 'filesafe', kind: 'health', title: 'FileSafe',
          note: fs.floor === 'non-bypassable' ? 'FileSafe is the floor under every rule. No profile, persona, or rule can widen it.' : null,
          checks: fsChecks },
        { id: 'doomloop', kind: 'form', title: 'Stuck-loop guard',
          fields: [
            info('dl.threshold', 'Denied retries before pausing', dl.threshold != null ? String(dl.threshold) : '—', dl.note || null),
            info('dl.action', 'What happens then', dl.action === 'pause-and-ask' ? 'Pause the run and ask you' : (dl.action || '—'), null),
            info('dl.last', 'Last time it triggered', tripped ? 'Tripped — a run is paused and waiting for you' : 'Never', null)
          ],
          state: tripped ? 'tripped' : 'idle' }
      ]
    };
  }

  managers.register([{
    id: 'm.permissions',
    family: 'Permissions & FileSafe',
    cat: 'safety',
    title: 'Permissions & FileSafe',
    blurb: 'What the AI may do on its own, when it must ask, and the file boundary nothing can cross.',
    icon: 'shield',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['safety.rules.', 'safety.approvals.', 'safety.protection.'],
    model: permissionsModel,
    objects: function (store) {
      return [
        { id: 'perm.rules', label: 'Permission rules', kind: 'page',
          note: 'Ordered rules; the last match wins', dest: mdest('m.permissions', null, null, 'rules') },
        { id: 'perm.filesafe', label: 'FileSafe boundary', kind: 'page',
          note: 'The non-bypassable protected-file floor', dest: mdest('m.permissions', null, null, 'filesafe') },
        { id: 'perm.doomloop', label: 'Stuck-loop guard', kind: 'page',
          note: 'Pauses a run after repeated denied retries', dest: mdest('m.permissions', null, null, 'doomloop') },
        { id: 'perm.profiles', label: 'Access level', kind: 'page',
          note: 'Ask, auto-accept edits, auto, or full access', dest: mdest('m.permissions', null, null, 'profile') }
      ];
    },
    actions: function (store) {
      return [
        { id: 'act.perm.test', label: 'Test a command against the rules', ico: 'beaker', available: true,
          run: function () { return runOp('permission-test', 'shell.exec', 'Permission test', 'Evaluates a command you type against the ordered rules and shows which rule decides, without running anything.'); } }
      ];
    },
    states: ['fx.doom-loop-tripped', 'fx.changed-elsewhere']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.bsd — Back Seat Driver                                            */
  /* ------------------------------------------------------------------ */

  function bsdModel(store) {
    var b = obj(D(store).bsd);
    var modes = arr(b.modes);
    var options = [];
    var currentLabel = b.mode || 'auto';
    for (var i = 0; i < modes.length; i++) {
      options.push({ id: modes[i].id, label: modes[i].label, note: modes[i].note });
      if (modes[i].id === b.mode) { currentLabel = modes[i].label; }
    }
    var route = obj(b.route);
    var h = obj(b.health);
    return {
      managerId: 'm.bsd', title: 'Back Seat Driver', archetype: 'preference-doc',
      blurb: 'A second model that watches risky moments and speaks up — without ever holding the wheel.',
      sections: [
        { id: 'mode', kind: 'form', title: 'When it watches',
          fields: [
            { id: 'f.bsd-mode', label: 'Back Seat Driver', value: b.mode || 'auto', valueLabel: currentLabel,
              options: options, note: 'Auto steps in only when a risky action or phase justifies it. On may look at every turn.',
              dest: sdest('planning.verification.back-seat-driver-mode') }
          ] },
        { id: 'route', kind: 'overview', title: 'Which model it uses',
          items: [
            info('bsd.route', 'Reviewing model', route.effective || '—',
                 route.why || null),
            info('bsd.class', 'Preference', route.requestedClass === 'fast-local' ? 'Fast local' : (route.requestedClass || '—'),
                 'Kept cheap and quick so reviews never crowd out the real work.')
          ] },
        { id: 'triggers', kind: 'overview', title: 'What wakes it up',
          items: [
            info('bsd.risk', 'Risky actions', arr(obj(b.triggers).risk).join(', ') || '—', null),
            info('bsd.phases', 'Sensitive phases', arr(obj(b.triggers).phases).join(', ') || '—', null),
            info('bsd.budget', 'Usage guard', 'At most ' + (obj(b.usageGuard).maxPctOfRun != null ? obj(b.usageGuard).maxPctOfRun : '—') + '% of a run',
                 'Reviews have a latency budget of ' + (b.latencyBudgetMs != null ? b.latencyBudgetMs + ' ms' : '—') + ' so they never stall the run.')
          ] },
        { id: 'privacy', kind: 'overview', title: 'What it can see and touch',
          items: [
            info('bsd.privacy', 'What it sees', b.privacyNote || 'Bounded excerpts of the work in progress', null),
            info('bsd.tools', 'What it can do', b.toolAccess === 'read-only' ? 'Look, never touch — read-only' : (b.toolAccess || '—'),
                 'It can flag and suggest; it cannot widen anyone\'s authority.'),
            info('bsd.override', 'Overriding from chat', arr(b.chatOverride).length ? ('You can silence or summon it for ' + arr(b.chatOverride).join(' or ')) : '—', null)
          ] },
        { id: 'health', kind: 'health', title: 'Health',
          checks: [
            { id: 'bsd.state', label: 'Back Seat Driver', state: h.state === 'ok' ? 'Working normally' : (h.state || 'Unknown'),
              tone: h.state === 'ok' ? 'ok' : 'attention',
              note: h.note || null },
            { id: 'bsd.lastFailure', label: 'Last failure', state: h.lastFailure ? String(h.lastFailure) : 'None recorded',
              tone: h.lastFailure ? 'attention' : 'ok',
              note: h.cannotBlockPrimary ? 'If it ever fails, your main work keeps going — a broken reviewer can never block the run.' : null }
          ] }
      ]
    };
  }

  managers.register([{
    id: 'm.bsd',
    family: 'Back Seat Driver',
    cat: 'safety',
    title: 'Back Seat Driver',
    blurb: 'A second model that watches risky moments and speaks up — without ever holding the wheel.',
    icon: 'eye',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['planning.verification.back-seat-driver'],
    model: bsdModel,
    objects: function (store) {
      return [
        { id: 'bsd.mode', label: 'Back Seat Driver mode', kind: 'page',
          note: 'Off, Auto, or On', dest: mdest('m.bsd', null, null, 'mode') },
        { id: 'bsd.health', label: 'Back Seat Driver health', kind: 'page',
          note: 'It can never block your main work', dest: mdest('m.bsd', null, null, 'health') }
      ];
    },
    actions: function (store) {
      return [
        { id: 'act.bsd.check', label: 'Review the last turn now', ico: 'eye', available: true,
          run: function () { return runOp('invoke-test', 'bsd-review', 'One-off review', 'Runs a single Back Seat Driver pass over the last turn within its usage and latency budget.'); } }
      ];
    },
    states: ['fx.changed-elsewhere']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.notifications — Notifications & Sounds                            */
  /* ------------------------------------------------------------------ */

  var DEST_STATE = {
    'ready':            { label: 'Ready',            tone: 'ok' },
    'needs-setup':      { label: 'Needs setup',      tone: 'setup' },
    'validation-error': { label: 'Needs correction', tone: 'attention' },
    'disabled':         { label: 'Off',              tone: 'muted' }
  };
  var DEST_KIND_LABEL = {
    'in-app': 'In this app', 'system': 'System', 'slack': 'Slack', 'discord': 'Discord',
    'webhook': 'Webhook', 'ntfy': 'ntfy', 'pushover': 'Pushover', 'telegram': 'Telegram'
  };
  var ROUTING_VALUE = {
    'always': 'Always', 'when-unfocused': 'When away', 'failures-only': 'Failures only', 'never': 'Never'
  };

  function destSummary(dst) {
    var c = obj(dst.config);
    if (dst.kind === 'slack') { return (c.workspace ? c.workspace + ' · ' : '') + (c.channel || ''); }
    if (dst.kind === 'ntfy') { return c.topic ? ('Topic ' + c.topic) : ''; }
    if (dst.kind === 'telegram') { return 'Bot delivery' + (c.retry ? ' · retries ' + c.retry : ''); }
    if (dst.kind === 'pushover') { return c.device ? ('Device ' + c.device) : ''; }
    if (dst.kind === 'webhook') { return c.url || ''; }
    if (dst.kind === 'system') { return c.respectFocusAssist ? 'Respects system focus mode' : ''; }
    return '';
  }

  function notificationsModel(store) {
    var n = obj(D(store).notifications);
    var master = obj(n.master);
    var i;

    var destItems = [];
    var dests = arr(n.destinations);
    for (i = 0; i < dests.length; i++) {
      var dst = dests[i];
      var st = DEST_STATE[dst.state] || { label: 'Unknown', tone: 'muted' };
      var item = {
        id: dst.id, label: dst.label, sub: destSummary(dst) || (DEST_KIND_LABEL[dst.kind] || null),
        status: { label: st.label, tone: st.tone,
                  note: dst.setupNote || dst.disabledNote || obj(dst.validationError).message || null },
        validationError: dst.validationError || null,
        flags: { builtIn: dst.builtIn === true, locked: dst.locked === true },
        lockedReason: dst.lockedReason || null,
        lastTest: dst.lastTest || null,
        detail: { kind: dst.kind, config: obj(dst.config) },
        dest: mdest('m.notifications', null, null, dst.id)
      };
      destItems.push(item);
    }

    var routeRows = [];
    var routing = arr(n.routing);
    var soundNames = {};
    var lib = arr(obj(n.sounds).library);
    for (i = 0; i < lib.length; i++) { soundNames[lib[i].id] = lib[i].name; }
    for (i = 0; i < routing.length; i++) {
      var rt = routing[i];
      var perDest = [];
      for (var k in rt.destinations) {
        if (Object.prototype.hasOwnProperty.call(rt.destinations, k)) {
          var dl = null;
          for (var d2 = 0; d2 < dests.length; d2++) { if (dests[d2].id === k) { dl = dests[d2].label; } }
          perDest.push((dl || k) + ': ' + (ROUTING_VALUE[rt.destinations[k]] || rt.destinations[k]));
        }
      }
      routeRows.push({
        id: rt.eventId,
        cells: {
          event: rt.label,
          importance: rt.severity === 'attention' ? 'Needs you' : (rt.severity === 'warning' ? 'Warning' : 'Informational'),
          sound: rt.soundId ? (soundNames[rt.soundId] || 'Custom sound') : 'Silent',
          where: perDest.join(' · ')
        },
        detail: { severity: rt.severity, soundId: rt.soundId, destinations: rt.destinations },
        dest: mdest('m.notifications', null, null, 'route.' + rt.eventId)
      });
    }

    var testEntries = [];
    for (i = 0; i < dests.length; i++) {
      if (dests[i].lastTest) {
        testEntries.push({ at: dests[i].lastTest.when,
          label: 'Masked test to ' + dests[i].label + (dests[i].lastTest.ok ? ' delivered' : ' failed'),
          detail: dests[i].lastTest.receiptId ? ('Receipt ' + dests[i].lastTest.receiptId) : null,
          tone: dests[i].lastTest.ok ? 'ok' : 'attention' });
      }
    }

    return {
      managerId: 'm.notifications', title: 'Notifications & Sounds', archetype: 'roster-detail',
      blurb: 'What the app tells you about, where those messages go, and how they sound.',
      sections: [
        { id: 'master', kind: 'form', title: 'Basics',
          note: obj(n.surfaceRule).note || null,
          fields: [
            info('nt.enabled', 'Notifications', master.enabled ? 'On' : 'Off', null, sdest('general.interaction.notifications-enabled')),
            info('nt.volume', 'Sound volume', (master.volume != null ? master.volume + '%' : '—'), null, sdest('general.interaction.sound-effects')),
            info('nt.quiet', 'Quiet hours', obj(master.quietHours).start ? (master.quietHours.start + ' to ' + master.quietHours.end + ', ' + (master.quietHours.days === 'daily' ? 'every day' : master.quietHours.days)) : 'Off',
                 null, sdest('general.interaction.alert-quiet-window')),
            info('nt.focus', 'While you are focused', master.focusBehavior === 'suppress-noncritical' ? 'Hold everything that can wait' : (master.focusBehavior || '—'), null)
          ],
          soundNotSoleIndicator: n.soundNotSoleIndicator === true,
          indicatorNote: 'Sound is never the only signal — anything important also appears in the title-bar stack.' },
        { id: 'destinations', kind: 'roster', title: 'Where notifications go', items: destItems },
        { id: 'routing', kind: 'table', title: 'Event routing',
          note: 'Each event decides where it goes and how it sounds. Tests are always explicit, masked, and receipted.',
          columns: [
            { id: 'event', label: 'Event' }, { id: 'importance', label: 'Importance' },
            { id: 'sound', label: 'Sound' }, { id: 'where', label: 'Where it goes' }
          ],
          rows: routeRows },
        { id: 'tests', kind: 'log', title: 'Recent tests', advanced: true, entries: testEntries }
      ]
    };
  }

  managers.register([{
    id: 'm.notifications',
    family: 'Notifications & Sounds',
    cat: 'general',
    title: 'Notifications & Sounds',
    blurb: 'What the app tells you about, where those messages go, and how they sound.',
    icon: 'bell',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['general.interaction.notification', 'general.interaction.alert-quiet-window', 'general.interaction.tray-notifications'],
    model: notificationsModel,
    objects: function (store) {
      var n = obj(D(store).notifications);
      var out = [];
      var dests = arr(n.destinations);
      var i;
      for (i = 0; i < dests.length; i++) {
        out.push({ id: dests[i].id, label: dests[i].label, kind: 'destination',
                   note: DEST_KIND_LABEL[dests[i].kind] || null,
                   dest: mdest('m.notifications', null, null, dests[i].id) });
      }
      var routing = arr(n.routing);
      for (i = 0; i < routing.length; i++) {
        out.push({ id: 'route.' + routing[i].eventId, label: routing[i].label, kind: 'event-route',
                   note: 'Notification routing', dest: mdest('m.notifications', null, null, 'route.' + routing[i].eventId) });
      }
      return out;
    },
    actions: function (store) {
      var n = obj(D(store).notifications);
      var discord = null;
      var dests = arr(n.destinations);
      for (var i = 0; i < dests.length; i++) { if (dests[i].id === 'dest.discord') { discord = dests[i]; } }
      return [
        { id: 'act.notif.test', label: 'Send a masked test notification', ico: 'bell', available: true,
          run: function () { return runOp('dest-test', 'dest.slack', 'Masked test notification', 'Sends one clearly-marked test with masked content and records a receipt. Rate limited.'); } },
        { id: 'act.notif.test.discord', label: 'Test the Discord destination', ico: 'bell',
          available: !(discord && discord.state === 'needs-setup'),
          reason: (discord && discord.state === 'needs-setup') ? 'Finish setting up the Discord webhook first.' : null,
          run: function () {
            if (discord && discord.state === 'needs-setup') {
              return refuse('Discord test', 'The webhook reference is missing, so there is nowhere to deliver a test yet.');
            }
            return runOp('dest-test', 'dest.discord', 'Masked test notification', 'Sends one clearly-marked test to Discord and records a receipt.');
          } }
      ];
    },
    states: ['fx.validation-error', 'fx.reconnect-required']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.sounds — Sound Library / Uploads / Packs                          */
  /* ------------------------------------------------------------------ */

  var PACK_STATE = {
    'imported':           { label: 'Imported',           tone: 'ok' },
    'license-unverified': { label: 'License unverified', tone: 'setup' },
    'format-invalid':     { label: 'Not importable',     tone: 'attention' }
  };

  function soundsModel(store) {
    var d = D(store);
    var n = obj(d.notifications);
    var sounds = obj(n.sounds);
    var i;

    var eventNames = {};
    var routing = arr(n.routing);
    for (i = 0; i < routing.length; i++) { eventNames[routing[i].eventId] = routing[i].label; }
    function eventLabels(ids) {
      var out = [];
      var list = arr(ids);
      for (var j = 0; j < list.length; j++) { out.push(eventNames[list[j]] || list[j]); }
      return out;
    }

    var libRows = [];
    var lib = arr(sounds.library);
    for (i = 0; i < lib.length; i++) {
      var s = lib[i];
      libRows.push({
        id: s.id,
        cells: {
          name: s.name,
          source: s.source === 'built-in' ? 'Built in' : (s.source === 'upload' ? 'Your upload' : (s.source || '—')),
          length: s.duration != null ? (s.duration + 's') : '—',
          usedFor: eventLabels(s.defaultFor).join(', ') || 'Not mapped'
        },
        detail: { license: s.license, version: s.version, hash: s.hash,
                  format: s.format, sampleRate: s.sampleRate },
        dest: mdest('m.sounds', null, null, s.id)
      });
    }

    var packItems = [];
    var packs = arr(sounds.packs);
    for (i = 0; i < packs.length; i++) {
      var p = packs[i];
      var st = PACK_STATE[p.state] || { label: 'Unknown', tone: 'muted' };
      packItems.push({
        id: p.id, label: p.name,
        sub: (p.origin === 'file' ? 'Local file' : p.origin) + (p.soundCount ? ' · ' + p.soundCount + ' sounds' : ''),
        status: { label: st.label, tone: st.tone,
                  note: obj(p.licenseCheck).detail || obj(p.formatCheck).detail || null },
        detail: { version: p.version, licenseCheck: obj(p.licenseCheck), formatCheck: obj(p.formatCheck),
                  importedAt: p.importedAt || null },
        dest: mdest('m.sounds', null, null, p.id)
      });
    }

    var mapRows = [];
    for (i = 0; i < routing.length; i++) {
      var rt = routing[i];
      var name = 'Silent';
      for (var j = 0; j < lib.length; j++) { if (lib[j].id === rt.soundId) { name = lib[j].name; } }
      mapRows.push({ id: 'map.' + rt.eventId,
        cells: { event: rt.label, sound: rt.soundId ? name : 'Silent' },
        dest: mdest('m.notifications', null, null, 'route.' + rt.eventId) });
    }

    return {
      managerId: 'm.sounds', title: 'Sound Library', archetype: 'catalog',
      blurb: 'Every sound the app can make — built-ins, your uploads, and imported packs.',
      sections: [
        { id: 'overview', kind: 'overview', title: 'Library',
          note: sounds.previewNote || 'Previews play locally on this computer only; nothing is sent anywhere.',
          items: [
            info('snd.count', 'Sounds', String(lib.length), null),
            info('snd.packs', 'Packs', String(packs.length),
                 'Packs are checked for format and license before anything imports. Unverified packs never import silently.')
          ] },
        { id: 'library', kind: 'table', title: 'Sounds',
          columns: [
            { id: 'name', label: 'Sound' }, { id: 'source', label: 'Source' },
            { id: 'length', label: 'Length' }, { id: 'usedFor', label: 'Used for' }
          ],
          rows: libRows },
        { id: 'packs', kind: 'roster', title: 'Imported packs', items: packItems },
        { id: 'mappings', kind: 'table', title: 'Event mappings',
          note: 'Which sound plays for which event. Edit the mapping from Notifications routing.',
          columns: [{ id: 'event', label: 'Event' }, { id: 'sound', label: 'Sound' }],
          rows: mapRows }
      ]
    };
  }

  managers.register([{
    id: 'm.sounds',
    family: 'Sound Library / Uploads / Packs',
    cat: 'general',
    title: 'Sound Library',
    blurb: 'Every sound the app can make — built-ins, your uploads, and imported packs.',
    icon: 'speaker',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['general.interaction.sound'],
    model: soundsModel,
    objects: function (store) {
      var n = obj(D(store).notifications);
      var out = [];
      var lib = arr(obj(n.sounds).library);
      var i;
      for (i = 0; i < lib.length; i++) {
        out.push({ id: lib[i].id, label: lib[i].name, kind: 'sound',
                   note: lib[i].source === 'built-in' ? 'Built-in sound' : 'Uploaded sound',
                   dest: mdest('m.sounds', null, null, lib[i].id) });
      }
      var packs = arr(obj(n.sounds).packs);
      for (i = 0; i < packs.length; i++) {
        out.push({ id: packs[i].id, label: packs[i].name, kind: 'sound-pack',
                   note: (PACK_STATE[packs[i].state] || {}).label || null,
                   dest: mdest('m.sounds', null, null, packs[i].id) });
      }
      return out;
    },
    actions: function (store) {
      var packs = arr(obj(obj(D(store).notifications).sounds).packs);
      var unverified = null;
      for (var i = 0; i < packs.length; i++) { if (packs[i].state === 'license-unverified') { unverified = packs[i]; } }
      return [
        { id: 'act.sound.preview', label: 'Preview a sound', ico: 'play', available: true,
          run: function () { return runOp('sound-preview', 'snd.soft-chime', 'Local sound preview', 'Plays the sound on this computer only.'); } },
        { id: 'act.sound.upload', label: 'Upload a sound', ico: 'upload', available: true,
          run: function () { return runOp('sound-upload', 'custom', 'Sound upload', 'Checks the format, records source and license metadata, then adds it to the library.'); } },
        { id: 'act.pack.import', label: 'Import a sound pack', ico: 'package', available: true,
          run: function () { return runOp('pack-import', 'new-pack', 'Pack import', 'Runs the format and license checks first; nothing imports if either fails.'); } },
        { id: 'act.pack.review-license', label: 'Review the unverified pack license', ico: 'scales',
          available: unverified != null,
          reason: unverified ? null : 'No pack is waiting on a license review.',
          run: function () {
            if (!unverified) { return refuse('License review', 'No pack is waiting on a license review.'); }
            return receipt('License review', unverified.name + ' names no license in its manifest. Import stays blocked until you confirm the terms; unverified packs are never bundled.');
          } }
      ];
    },
    states: ['fx.import-conflict', 'fx.validation-error']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.appearance — Appearance / themes / fonts / motion                 */
  /* ------------------------------------------------------------------ */

  var THEME_STATE = {
    'active':           { label: 'In use',           tone: 'ok' },
    'invalid':          { label: 'Falling back',     tone: 'attention' },
    'restart-required': { label: 'Restart to apply', tone: 'progress' },
    'available':        { label: 'Available',        tone: 'muted' }
  };

  function appearanceModel(store) {
    var a = obj(D(store).appearance);
    var base = obj(a.base);
    var i;

    var themeItems = [];
    var customs = arr(a.customThemes);
    for (i = 0; i < customs.length; i++) {
      var t = customs[i];
      var st = THEME_STATE[t.state] || THEME_STATE['available'];
      var note = null;
      if (t.state === 'invalid' && t.fallback && t.fallback.active) {
        note = t.fallback.reason || ('Using ' + t.fallback.to + ' until the theme file is fixed.');
      } else if (t.state === 'restart-required') {
        note = t.restartNote || 'Applies at the next start.';
      }
      themeItems.push({
        id: t.id, label: t.name, sub: 'Based on ' + humanTheme(t.baseTheme),
        status: { label: st.label, tone: st.tone, note: note },
        errors: arr(t.errors),
        fallback: t.fallback || null,
        detail: { file: t.file, schemaVersion: t.schemaVersion, lastLoaded: t.lastLoaded,
                  liveReload: t.liveReload === true },
        dest: mdest('m.appearance', null, null, t.id)
      });
    }

    var fonts = obj(a.fonts);
    var customFont = obj(fonts.custom);
    var scale = obj(a.uiScale);
    var pendingRestart = scale.pendingRestart === true || hasFx(store, 'fx.restart-required');

    var lockedItems = [];
    var locked = arr(a.lockedRows);
    for (i = 0; i < locked.length; i++) {
      lockedItems.push(info('locked.' + i,
        (invRecord(locked[i].settingId) || { label: locked[i].settingId }).label,
        'Not available in the current theme', locked[i].reason, sdest(locked[i].settingId)));
    }

    return {
      managerId: 'm.appearance', title: 'Appearance', archetype: 'preference-doc',
      blurb: 'Themes, fonts, scale, and motion — including your own theme files.',
      sections: [
        { id: 'theme', kind: 'form', title: 'Theme',
          fields: [
            field(store, 'general.visual.theme'),
            field(store, 'general.visual.theme-mode'),
            info('ap.follow', 'Follow the system', base.followOS ? 'On — light and dark follow the OS' : 'Off',
                 null, sdest('general.visual.theme-mode'))
          ] },
        { id: 'custom', kind: 'roster', title: 'Custom themes',
          note: 'Custom themes are files that inherit from a built-in theme. They are validated on load; a broken theme falls back safely and says so.',
          items: themeItems },
        { id: 'fonts', kind: 'form', title: 'Fonts',
          fields: [
            info('ap.font-ui', 'Interface font', fonts.ui || '—', null, sdest('general.visual.app-font')),
            info('ap.font-mono', 'Code font', fonts.mono || '—', null),
            info('ap.font-custom', 'Requested font',
                 customFont.requested ? (customFont.requested + (customFont.state === 'not-installed' ? ' — not installed' : '')) : 'None',
                 customFont.note || null),
            info('ap.font-chain', 'Fallback order', arr(fonts.fallbackChain).join(' → ') || '—',
                 'If a font is missing, the next one in line is used — text never disappears.')
          ] },
        { id: 'scale', kind: 'form', title: 'Size & motion',
          state: pendingRestart ? 'restart-required' : 'normal',
          fields: [
            info('ap.scale', 'Interface scale', scale.value != null ? (Math.round(scale.value * 100) + '%') : '—',
                 pendingRestart ? 'The new scale finishes applying after a restart.' : null,
                 sdest('general.visual.ui-scale')),
            field(store, 'general.visual.reduce-animations')
          ] },
        { id: 'locked', kind: 'overview', title: 'Not available right now',
          note: 'Some rows only apply in certain themes. They stay visible with the reason instead of disappearing.',
          items: lockedItems }
      ]
    };
  }
  function humanTheme(id) {
    var map = { 'friendly-light': 'Friendly Light', 'friendly-dark': 'Friendly Dark',
                'glass-light': 'Glass Light', 'glass-dark': 'Glass Dark',
                'retro-light': 'Retro Light', 'retro-dark': 'Retro Dark',
                'basic-light': 'Basic Light', 'basic-dark': 'Basic Dark' };
    return map[id] || String(id || '—');
  }

  managers.register([{
    id: 'm.appearance',
    family: 'Appearance / themes / fonts / motion',
    cat: 'general',
    title: 'Appearance',
    blurb: 'Themes, fonts, scale, and motion — including your own theme files.',
    icon: 'palette',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['general.visual.'],
    model: appearanceModel,
    objects: function (store) {
      var a = obj(D(store).appearance);
      var out = [];
      var customs = arr(a.customThemes);
      for (var i = 0; i < customs.length; i++) {
        out.push({ id: customs[i].id, label: customs[i].name, kind: 'theme',
                   note: 'Custom theme', dest: mdest('m.appearance', null, null, customs[i].id) });
      }
      out.push({ id: 'ap.fonts', label: 'Fonts', kind: 'page',
                 note: 'Interface and code fonts with fallbacks', dest: mdest('m.appearance', null, null, 'fonts') });
      return out;
    },
    actions: function (store) {
      return [
        { id: 'act.theme.reload', label: 'Reload custom themes', ico: 'refresh', available: true,
          run: function () { return runOp('theme-reload', 'custom-themes', 'Theme reload', 'Re-reads every custom theme file, validates it, and applies or falls back with the reason.'); } },
        { id: 'act.theme.export', label: 'Export the current theme', ico: 'download', available: true,
          run: function () { return receipt('Theme export', 'Writes the active theme as a portable file you can edit or share.'); } }
      ];
    },
    states: ['fx.theme-fallback', 'fx.restart-required']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.spellcheck — Spellcheck & Dictionaries                            */
  /* ------------------------------------------------------------------ */

  function spellModel(store) {
    var sp = obj(D(store).spell);
    var i;
    function wordItems(list, prefix) {
      var out = [];
      var words = arr(list);
      for (i = 0; i < words.length; i++) {
        out.push({ id: prefix + '.' + i, label: words[i] });
      }
      return out;
    }
    var packItems = [];
    var packs = arr(sp.packs);
    for (i = 0; i < packs.length; i++) {
      packItems.push({
        id: 'pack.' + i, label: packs[i].lang,
        status: packs[i].installed ? { label: 'Installed', tone: 'ok' }
                                   : { label: 'Available to download', tone: 'muted' }
      });
    }
    return {
      managerId: 'm.spellcheck', title: 'Spellcheck & Dictionaries', archetype: 'preference-doc',
      blurb: 'Spelling checks, your dictionaries, and language packs. Never autocorrect.',
      sections: [
        { id: 'basics', kind: 'form', title: 'Spelling',
          note: 'Spellcheck underlines; it never rewrites your words. Grammar and style help is a separate opt-in feature with its own privacy and cost disclosure.',
          fields: [
            info('sp.enabled', 'Check spelling', 'On', null),
            info('sp.language', 'Language', 'Automatic', 'Detected from what you are typing.',
                 sdest('general.interaction.language-detection')),
            info('sp.source', 'Dictionary source', 'Automatic',
                 'Tries the system spelling service first, then the app\'s own dictionaries. You can pin either one under advanced options.'),
            info('sp.technical', 'Check technical prose', 'On', 'Code-like words and identifiers are not flagged.'),
            info('sp.names', 'Underline unknown names', 'Off', null)
          ] },
        { id: 'personal', kind: 'table', title: 'Personal dictionary',
          note: 'Words you told the checker to accept everywhere.',
          columns: [{ id: 'word', label: 'Word' }],
          rows: wordRows(sp.personal, 'pw') },
        { id: 'project', kind: 'table', title: 'Project dictionary',
          note: 'Accepted for this project and shared with everyone who works in it.',
          columns: [{ id: 'word', label: 'Word' }],
          rows: wordRows(sp.project, 'jw') },
        { id: 'packs', kind: 'roster', title: 'Language packs', items: packItems }
      ]
    };
  }
  function wordRows(list, prefix) {
    var out = [];
    var words = arr(list);
    for (var i = 0; i < words.length; i++) {
      out.push({ id: prefix + '.' + i, cells: { word: words[i] } });
    }
    return out;
  }

  managers.register([{
    id: 'm.spellcheck',
    family: 'Spellcheck & Dictionaries',
    cat: 'general',
    title: 'Spellcheck & Dictionaries',
    blurb: 'Spelling checks, your dictionaries, and language packs. Never autocorrect.',
    icon: 'doc',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['general.interaction.language-detection'],
    model: spellModel,
    objects: function (store) {
      var sp = obj(D(store).spell);
      var out = [
        { id: 'spell.personal', label: 'Personal dictionary', kind: 'page',
          note: arr(sp.personal).length + ' words', dest: mdest('m.spellcheck', null, null, 'personal') },
        { id: 'spell.project', label: 'Project dictionary', kind: 'page',
          note: arr(sp.project).length + ' words', dest: mdest('m.spellcheck', null, null, 'project') }
      ];
      var packs = arr(sp.packs);
      for (var i = 0; i < packs.length; i++) {
        out.push({ id: 'spell.pack.' + i, label: packs[i].lang + ' language pack', kind: 'language-pack',
                   note: packs[i].installed ? 'Installed' : 'Available to download',
                   dest: mdest('m.spellcheck', null, null, 'packs') });
      }
      return out;
    },
    actions: function (store) {
      return [
        { id: 'act.spell.download', label: 'Download a language pack', ico: 'download', available: true,
          run: function () { return runOp('pack-download', 'spell-german', 'Language pack download', 'Fetches the dictionary pack from the official source and verifies it before install.'); } }
      ];
    },
    states: ['fx.long-text']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.desktop — Desktop / Tray / Window                                 */
  /* ------------------------------------------------------------------ */

  function desktopModel(store) {
    var dt = obj(D(store).desktop);
    var tray = obj(dt.tray);
    var launch = obj(dt.launch);
    var crash = obj(dt.crashRecovery);
    var bar = obj(dt.activityBar);
    var limits = obj(dt.limits);
    return {
      managerId: 'm.desktop', title: 'Desktop & Window', archetype: 'preference-doc',
      blurb: 'The tray, what reopens at launch, crash recovery, and window limits.',
      sections: [
        { id: 'tray', kind: 'form', title: 'Tray',
          note: tray.automationBadgeNote || null,
          fields: [
            info('dk.min', 'Minimize to the tray', tray.minimizeToTray ? 'On' : 'Off', null, sdest('general.interaction.minimize-to-tray')),
            info('dk.close', 'Close to the tray', tray.closeToTray ? 'On' : 'Off',
                 'Off means the close button really quits.'),
            info('dk.badge', 'While automation runs', tray.automationBadge === 'progress-ring' ? 'Show a quiet progress ring' : (tray.automationBadge || '—'),
                 'The tray menu offers ' + arr(tray.menu).join(', ') + '.')
          ] },
        { id: 'launch', kind: 'form', title: 'At launch',
          fields: [
            info('dk.dest', 'Open to', launch.destination === 'last-project' ? 'The last project you had open' : (launch.destination || '—'),
                 null, sdest('general.startup.restore-panel')),
            info('dk.windows', 'Restore windows', launch.restoreWindows ? 'On' : 'Off', null, sdest('general.startup.window-state')),
            info('dk.panels', 'Restore panels', launch.restorePanels ? 'On' : 'Off', null),
            info('dk.tabs', 'Restore tabs', launch.restoreTabs ? 'On' : 'Off', null, sdest('general.startup.max-persisted-tabs'))
          ] },
        { id: 'recovery', kind: 'overview', title: 'Crash recovery',
          note: crash.note || null,
          items: [
            info('dk.protect', 'Unsaved work', crash.unsavedProtection === 'always' ? 'Always protected' : (crash.unsavedProtection || '—'),
                 null, sdest('general.startup.unsaved-capture')),
            info('dk.last', 'Last recovery', crash.lastRecovery || 'Never needed',
                 crash.buffersRestored != null ? (crash.buffersRestored + ' unsaved buffers came back.') : null,
                 sdest('general.startup.crash-restore'))
          ] },
        { id: 'activitybar', kind: 'form', title: 'Activity bar',
          fields: [
            info('dk.order', 'Order', arr(bar.order).length + ' entries, drag to rearrange', null, sdest('general.interaction.activity-bar-order')),
            info('dk.hidden', 'Hidden', arr(bar.hidden).length ? arr(bar.hidden).join(', ') : 'Nothing hidden', null),
            info('dk.overflow', 'When space runs out', bar.overflow === 'menu' ? 'Fold extras into a menu' : (bar.overflow || '—'), null)
          ] },
        { id: 'limits', kind: 'form', title: 'Limits', advanced: true,
          fields: [
            info('dk.tabs-max', 'Editor tabs kept open', limits.maxEditorTabs != null ? String(limits.maxEditorTabs) : '—',
                 null, sdest('general.interaction.max-editor-tabs')),
            info('dk.tree', 'File tree rows drawn at once', limits.treeRenderLimit != null ? String(limits.treeRenderLimit) : '—',
                 'Larger folders stay scrollable; rows draw as they come into view.'),
            info('dk.history', 'History kept before archiving', limits.historyArchiveDays != null ? (limits.historyArchiveDays + ' days') : '—',
                 null, sdest('general.interaction.thread-archive-days'))
          ] }
      ]
    };
  }

  managers.register([{
    id: 'm.desktop',
    family: 'Desktop / Tray / Window',
    cat: 'general',
    title: 'Desktop & Window',
    blurb: 'The tray, what reopens at launch, crash recovery, and window limits.',
    icon: 'tray',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['general.startup.', 'general.interaction.minimize-to-tray', 'general.interaction.max-editor-tabs', 'general.interaction.activity-bar-order', 'general.interaction.panel-dock', 'general.interaction.persist-tree-state'],
    model: desktopModel,
    objects: function (store) {
      return [
        { id: 'desk.tray', label: 'Tray behavior', kind: 'page',
          note: 'Minimize, close, and the automation badge', dest: mdest('m.desktop', null, null, 'tray') },
        { id: 'desk.launch', label: 'Launch & restore', kind: 'page',
          note: 'What reopens when the app starts', dest: mdest('m.desktop', null, null, 'launch') },
        { id: 'desk.recovery', label: 'Crash recovery', kind: 'page',
          note: 'Unsaved-work protection', dest: mdest('m.desktop', null, null, 'recovery') }
      ];
    },
    actions: function (store) {
      return [
        { id: 'act.desktop.reset-layout', label: 'Reset the window layout', ico: 'undo', available: true,
          run: function () { return receipt('Window layout reset', 'Panels, splits, and the activity bar go back to their defaults. Your work and settings are untouched.'); } }
      ];
    },
    states: ['fx.restart-required']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.teacher — Teacher / Help                                          */
  /* ------------------------------------------------------------------ */

  var TEACHER_KIND = {
    'explain-screen': 'Explains a screen',
    'guided-action':  'Guided steps'
  };
  function teacherSurfaceDest(surface) {
    /* 'manager.providers' -> m.providers etc. */
    var s = String(surface || '');
    if (s.indexOf('manager.') === 0) { return mdest('m.' + s.slice(8)); }
    return null;
  }

  function teacherModel(store) {
    var t = obj(D(store).teacher);
    var items = [];
    var topics = arr(t.topics);
    for (var i = 0; i < topics.length; i++) {
      var tp = topics[i];
      var steps = [];
      var ts = arr(tp.steps);
      for (var j = 0; j < ts.length; j++) {
        steps.push({ n: j + 1, label: ts[j].text, action: ts[j].action || null });
      }
      items.push({
        id: tp.id, label: tp.title,
        sub: TEACHER_KIND[tp.kind] || 'Help topic',
        status: { label: tp.kind === 'guided-action' ? 'Can act with you' : 'Explains', tone: 'muted' },
        steps: steps,
        surfaceDest: teacherSurfaceDest(tp.surface),
        dest: mdest('m.teacher', null, null, tp.id)
      });
    }
    return {
      managerId: 'm.teacher', title: 'Teacher & Help', archetype: 'catalog',
      blurb: 'Guided explanations that can walk the real screens with you, safely.',
      sections: [
        { id: 'overview', kind: 'overview', title: 'Teacher',
          note: 'The Teacher explains the screen you are on and can carry a guided task into real actions — always showing what it is about to do first.',
          items: [
            info('tc.enabled', 'Teacher', t.enabled ? 'On' : 'Off', null),
            info('tc.last', 'Last session', t.lastSession || 'Never', null)
          ] },
        { id: 'topics', kind: 'roster', title: 'Topics', items: items }
      ]
    };
  }

  managers.register([{
    id: 'm.teacher',
    family: 'Teacher / Help',
    cat: 'general',
    title: 'Teacher & Help',
    blurb: 'Guided explanations that can walk the real screens with you, safely.',
    icon: 'grad',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['general.startup.onboarding', 'general.interaction.show-tooltips', 'general.interaction.explain-disabled'],
    model: teacherModel,
    objects: function (store) {
      var t = obj(D(store).teacher);
      var out = [];
      var topics = arr(t.topics);
      for (var i = 0; i < topics.length; i++) {
        out.push({ id: topics[i].id, label: topics[i].title, kind: 'help-topic',
                   note: TEACHER_KIND[topics[i].kind] || null,
                   dest: mdest('m.teacher', null, null, topics[i].id) });
      }
      return out;
    },
    actions: function (store) {
      return [
        { id: 'act.teacher.explain', label: 'Explain this screen', ico: 'grad', available: true,
          run: function () { return runOp('teacher-explain', 'current-screen', 'Teacher explanation', 'Walks through what everything on the current screen means, using your real values.'); } }
      ];
    },
    states: ['fx.long-text']
  }]);

  /* ------------------------------------------------------------------ */
  /* m.doctor — Doctor (read-only health projection)                     */
  /* ------------------------------------------------------------------ */

  function doctorModel(store) {
    var d = D(store);
    var checks = [];
    var i;

    /* Providers */
    var provs = arr(d.providers);
    var provProblems = [];
    for (i = 0; i < provs.length; i++) {
      var st = PV().resolveProviderStatus(provs[i]);
      if (st.tone === 'attention' || st.tone === 'setup') {
        provProblems.push(provs[i].name + ' — ' + st.label);
      }
    }
    checks.push({ id: 'doc.providers', label: 'AI connections',
      state: provProblems.length ? (provProblems.length + ' of ' + provs.length + ' need attention') : 'All ready',
      tone: provProblems.length ? 'attention' : 'ok',
      note: provProblems.length ? provProblems.join(' · ') : null,
      dest: mdest('m.providers') });

    /* Installations */
    var instProblems = [];
    for (i = 0; i < provs.length; i++) {
      var insts = arr(provs[i].installations);
      for (var j = 0; j < insts.length; j++) {
        var upd = PV().resolveUpdateState(insts[j].update);
        if (upd.tone === 'attention') {
          instProblems.push({ provider: provs[i], label: (insts[j].label || provs[i].name) + ' — ' + upd.label });
        }
      }
    }
    checks.push({ id: 'doc.installs', label: 'Provider installations',
      state: instProblems.length ? (instProblems.length + ' need a look') : 'Healthy',
      tone: instProblems.length ? 'attention' : 'ok',
      note: instProblems.length ? instProblems[0].label + (instProblems.length > 1 ? ' and more' : '') : null,
      dest: instProblems.length ? mdest('m.providers', instProblems[0].provider.id, 'installs') : mdest('m.providers') });

    /* FileSafe */
    var fs = obj(obj(d.permissionsModel).fileSafe);
    checks.push({ id: 'doc.filesafe', label: 'Protected-file boundary',
      state: fs.state === 'healthy' ? 'Healthy' : (fs.state || 'Unknown'),
      tone: fs.state === 'healthy' ? 'ok' : 'attention',
      note: fs.state === 'healthy' ? null : obj(fs.repair).guidance,
      dest: mdest('m.permissions', null, null, 'filesafe') });

    /* Storage */
    var storage = obj(d.storage);
    var pressured = hasFx(store, 'fx.storage-pressure') || storage.pressure === 'high';
    var totalGB = obj(storage.usage).totalGB;
    checks.push({ id: 'doc.storage', label: 'Storage',
      state: pressured ? 'Running low' : ((totalGB != null ? totalGB + ' GB in use' : 'In use') + ', comfortable'),
      tone: pressured ? 'attention' : 'ok',
      note: pressured ? 'The vault is close to its comfortable limit. Cleanup or a bigger retention window will help.' : null,
      dest: mdest('m.storage') });

    /* Backups */
    var rps = arr(obj(d.backups).restorePoints);
    checks.push({ id: 'doc.backups', label: 'Backups & restore points',
      state: rps.length ? (rps.length + ' restore points') : 'None yet',
      tone: rps.length ? 'ok' : 'setup',
      note: rps.length ? ('Most recent: ' + (rps[0].label || rps[0].id)) : 'No restore point exists yet.',
      dest: mdest('m.backup') });

    /* Project search index */
    var idx = obj(d.searchIndex);
    var idxFailed = hasFx(store, 'fx.index-failed') || idx.phase === 'failed';
    var idxFailures = arr(idx.failures);
    checks.push({ id: 'doc.index', label: 'Project search index',
      state: idxFailed ? 'Last build failed' : (idx.phase === 'ready' ? 'Ready' : (idx.phase || 'Unknown')),
      tone: idxFailed ? 'attention' : (idx.phase === 'ready' ? 'ok' : 'progress'),
      note: idxFailed ? 'The index will rebuild on request; search falls back to the previous good index meanwhile.'
                      : (idxFailures.length ? (idxFailures.length + ' file skipped: ' + idxFailures[0].reason) : null),
      dest: mdest('m.searchIndex') });

    /* Home server & environments */
    var topo = obj(d.serverTopology);
    var hosts = arr(topo.hosts);
    var hostProblems = [];
    for (i = 0; i < hosts.length; i++) {
      var hs = hosts[i].state;
      if (hs !== 'connected' && hs !== 'this-device' && hs !== 'reachable') {
        hostProblems.push(hosts[i].name + ' — ' + hs);
      }
    }
    checks.push({ id: 'doc.hosts', label: 'Computers & environments',
      state: hostProblems.length ? hostProblems.join(' · ') : (hosts.length + ' connected'),
      tone: hostProblems.length ? 'attention' : 'ok',
      note: 'Optional environments that are off count as healthy — setup appears only when something you selected needs them.',
      dest: mdest('m.servers') });

    /* Model catalogs */
    var catStale = 0, catQuarantined = 0;
    for (i = 0; i < provs.length; i++) {
      var cat = obj(provs[i].catalog);
      if (cat.state === 'quarantined') { catQuarantined++; }
      else if (cat.state && cat.state !== 'fresh') { catStale++; }
    }
    checks.push({ id: 'doc.catalogs', label: 'Model catalogs',
      state: catQuarantined ? (catQuarantined + ' failed validation, last good import in use')
             : (catStale ? (catStale + ' waiting on a refresh') : 'Fresh'),
      tone: catQuarantined ? 'attention' : (catStale ? 'progress' : 'ok'),
      note: 'A catalog that fails validation is quarantined and its last known good import stays active.',
      dest: mdest('m.providers') });

    /* Back Seat Driver */
    var bh = obj(obj(d.bsd).health);
    checks.push({ id: 'doc.bsd', label: 'Back Seat Driver',
      state: bh.state === 'ok' ? 'Working normally' : (bh.state || 'Unknown'),
      tone: bh.state === 'ok' ? 'ok' : 'attention',
      note: bh.cannotBlockPrimary ? 'Even if it fails, your main work keeps going.' : null,
      dest: mdest('m.bsd', null, null, 'health') });

    /* Doom-loop guard */
    var dl = obj(obj(d.permissionsModel).doomLoop);
    var tripped = hasFx(store, 'fx.doom-loop-tripped') || dl.lastTrip != null;
    checks.push({ id: 'doc.doomloop', label: 'Stuck-loop guard',
      state: tripped ? 'Tripped — a run is paused for you' : 'Quiet',
      tone: tripped ? 'attention' : 'ok',
      note: tripped ? 'A run hit the retry limit and is waiting for your decision.' : null,
      dest: mdest('m.permissions', null, null, 'doomloop') });

    var attention = 0;
    for (i = 0; i < checks.length; i++) { if (checks[i].tone === 'attention') { attention++; } }

    /* Diagnostic drawer entries */
    var entries = [];
    var notices = arr(d.notices);
    for (i = 0; i < notices.length && i < 4; i++) {
      entries.push({ at: null, label: notices[i].headline, detail: notices[i].consequence,
                     tone: notices[i].kind === 'attention' ? 'attention' : 'muted' });
    }
    var crash = obj(obj(d.desktop).crashRecovery);
    if (crash.lastRecovery) {
      entries.push({ at: crash.lastRecovery, label: 'Recovered from a crash', detail: crash.note || null, tone: 'ok' });
    }
    for (i = 0; i < provs.length; i++) {
      var pinsts = arr(provs[i].installations);
      for (var j2 = 0; j2 < pinsts.length; j2++) {
        var hist = arr(obj(pinsts[j2].update).history);
        for (var k2 = 0; k2 < hist.length; k2++) {
          entries.push({ at: hist[k2].when,
            label: (pinsts[j2].label || provs[i].name) + ' updated to ' + hist[k2].to +
                   (hist[k2].result === 'verified' ? ' and verified' : ''),
            detail: hist[k2].detail || null,
            tone: hist[k2].result === 'verified' ? 'ok' : 'attention' });
        }
      }
    }

    return {
      managerId: 'm.doctor', title: 'Doctor', archetype: 'health',
      blurb: 'One honest picture of system health, projected from live results.',
      readOnly: true,
      sections: [
        { id: 'summary', kind: 'health', title: 'Health',
          note: attention ? (attention + ' of ' + checks.length + ' checks need attention.') : 'Everything checked out.',
          checks: checks },
        { id: 'diagnostics', kind: 'log', title: 'Recent events', advanced: true, entries: entries },
        { id: 'about', kind: 'overview', title: 'About these results', advanced: true,
          note: 'Doctor owns its checks and repair flows. This page projects the current results honestly; opening it never re-runs anything.',
          items: [ field(store, 'system.health.check-frequency'), field(store, 'system.health.degraded-visibility') ] }
      ]
    };
  }

  managers.register([{
    id: 'm.doctor',
    family: 'Doctor',
    cat: 'system',
    title: 'Doctor',
    blurb: 'One honest picture of system health, projected from live results.',
    icon: 'gauge',
    archetype: 'health',
    status: 'demonstrated',
    settingPrefixes: ['system.health.'],
    model: doctorModel,
    objects: function (store) {
      return [
        { id: 'doc.providers', label: 'AI connection health', kind: 'diagnostic',
          note: 'Doctor check', dest: mdest('m.doctor', null, null, 'doc.providers') },
        { id: 'doc.filesafe', label: 'Protected-file boundary health', kind: 'diagnostic',
          note: 'Doctor check', dest: mdest('m.doctor', null, null, 'doc.filesafe') },
        { id: 'doc.storage', label: 'Storage health', kind: 'diagnostic',
          note: 'Doctor check', dest: mdest('m.doctor', null, null, 'doc.storage') },
        { id: 'doc.index', label: 'Search index health', kind: 'diagnostic',
          note: 'Doctor check', dest: mdest('m.doctor', null, null, 'doc.index') },
        { id: 'doc.backups', label: 'Backup health', kind: 'diagnostic',
          note: 'Doctor check', dest: mdest('m.doctor', null, null, 'doc.backups') }
      ];
    },
    actions: function (store) {
      return [
        { id: 'act.doctor.run', label: 'Run health checks now', ico: 'gauge', available: true,
          run: function () { return runOp('doctor-run', 'all-checks', 'Health check run', 'Doctor re-runs its checks and this page updates from the results. Repairs remain separate, explicit steps.'); } }
      ];
    },
    states: ['fx.storage-pressure', 'fx.index-failed', 'fx.doom-loop-tripped', 'fx.reconnect-required']
  }]);

  /* ---- end of registrations ---- */
})();
