/* pm2-search.js — PM2.search
   fable Seven New Concepts shared-v2 UNIVERSAL SEARCH (CONTRACT2.md,
   "pm2-search.js"; packet search_contract v2).

   Headless, DOM-free search over the whole Settings world:
     - all 828 inventory settings (rid s:<settingId>) with their search[] terms
     - every manager def, including deferred owner shells (m:<managerId>)
     - managed objects from every def.objects(store)  (o:<managerId>/<objectId>)
     - actions from def.actions(store) plus human-meaningful PM2.states
       triggers (a:<actionId>)
     - setup / sign-in / repair workflows derived from provider data
       (w:setup.cursor-cli, w:signin.<provider>, w:repair.<installation>, ...)
     - diagnostics and read-only statuses (d:<id> — doctor checks, context
       receipts, index failures)
     - unavailable capabilities with honest reasons (u:<id>)
     - help topics from the Teacher (h:<topicId>)

   The index is built LAZILY on the first query and NEVER instantiates any
   manager UI: it reads def metadata and the data-only objects(store)/
   actions(store) functions. Store events 'scenario' / 'fixtures' / 'value'
   (plus 'stress' and 'copy') invalidate cheaply; the rebuild happens on the
   next query. Queries are synchronous, so latest-request-wins holds trivially;
   results are bounded by {limit}. Rids are immutable strings — routing is by
   rid/dest only, never by array position or label.

   Slint note: candidates are flat structs with precomputed lowercase match
   fields; the scorer is a pure function over them, portable to a Slint model.
   No emoji. */
(function () {
  'use strict';

  window.PM2 = window.PM2 || {};
  if (window.PM2.search) { return; /* never clobber an installed search */ }

  /* ---------------- tiny helpers ---------------- */

  function arr(x) { return Object.prototype.toString.call(x) === '[object Array]' ? x : []; }
  function obj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }
  function str(x) { return typeof x === 'string' ? x : ''; }
  function lower(x) { return str(x).toLowerCase(); }
  function trunc(s, n) {
    s = str(s);
    return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
  }

  /* Words of 2+ characters, lowercased, for word-level rungs and fuzzy. */
  function wordsOf(s) {
    var out = [];
    var parts = lower(s).split(/[^a-z0-9]+/);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].length >= 2) { out.push(parts[i]); }
    }
    return out;
  }

  /* True when a and b are within Levenshtein distance 1 (but not equal-0 is
     fine too). Linear walk — no matrix. */
  function editDistance1(a, b) {
    var la = a.length, lb = b.length;
    if (la > lb) { var t = a; a = b; b = t; var lt = la; la = lb; lb = lt; }
    if (lb - la > 1) { return false; }
    var i = 0, j = 0, edits = 0;
    while (i < la && j < lb) {
      if (a.charAt(i) === b.charAt(j)) { i += 1; j += 1; continue; }
      edits += 1;
      if (edits > 1) { return false; }
      if (la === lb) { i += 1; j += 1; }  /* substitution */
      else { j += 1; }                     /* insertion into the longer */
    }
    if (j < lb || i < la) { edits += (lb - j) + (la - i); }
    return edits <= 1;
  }

  /* Subsequence check (label rung, tokens of 4+ chars). */
  function isSubsequence(needle, hay) {
    var i = 0;
    for (var j = 0; j < hay.length && i < needle.length; j++) {
      if (hay.charCodeAt(j) === needle.charCodeAt(i)) { i += 1; }
    }
    return i === needle.length;
  }

  /* ---------------- kinds ---------------- */

  var KIND_ORDER = ['setting', 'manager', 'object', 'action', 'workflow',
    'diagnostic', 'unavailable', 'help'];
  var KIND_LABELS = {
    'setting': 'Settings',
    'manager': 'Managers',
    'object': 'Managed objects',
    'action': 'Actions',
    'workflow': 'Setup & repair',
    'diagnostic': 'Diagnostics & status',
    'unavailable': 'Not available right now',
    'help': 'Help & guides'
  };
  var KIND_BONUS = { 'setting': 6, 'manager': 5 };

  /* ---------------- environment access ---------------- */

  function inventory() { return obj(window.PM2_INVENTORY); }

  function resolveStore() {
    var S = window.PM2 && window.PM2.store;
    if (S && typeof S.current === 'function') {
      try { return S.current() || null; } catch (e) { return null; }
    }
    return null;
  }

  function worldData(store) {
    return (store && store.data) ? store.data : obj(window.PM_DATA);
  }

  var catTitles = null;   /* cat id -> title */
  var subTitles = null;   /* cat id -> { sub id -> title } */
  function ensureTitles() {
    if (catTitles) { return; }
    catTitles = {};
    subTitles = {};
    var cats = arr(inventory().categories);
    for (var i = 0; i < cats.length; i++) {
      catTitles[cats[i].id] = str(cats[i].title) || cats[i].id;
      var m = {};
      var subs = arr(cats[i].subgroups);
      for (var j = 0; j < subs.length; j++) { m[subs[j].id] = str(subs[j].title) || subs[j].id; }
      subTitles[cats[i].id] = m;
    }
  }
  function catTitle(cat) {
    ensureTitles();
    return catTitles[cat] || 'Settings';
  }
  function subTitle(cat, sub) {
    ensureTitles();
    return (subTitles[cat] || {})[sub] || sub || '';
  }

  /* ---------------- candidate assembly ---------------- */

  /* Each candidate: {rid, kind, label, sub?, path[], dest, availability?,
     weight, curated, simple, _label, _labelWords, _terms, _termWords,
     _path, _desc}. */

  function makeCandidate(spec) {
    var c = {
      rid: spec.rid,
      kind: spec.kind,
      label: str(spec.label),
      sub: spec.sub ? str(spec.sub) : null,
      path: arr(spec.path).slice(),
      dest: obj(spec.dest),
      availability: spec.availability ? str(spec.availability) : null,
      weight: typeof spec.weight === 'number' ? spec.weight : 0,
      curated: spec.curated === true,
      simple: spec.simple === true
    };
    c._label = lower(c.label);
    c._labelWords = wordsOf(c.label);
    var terms = [];
    var tw = [];
    var src = arr(spec.terms);
    for (var i = 0; i < src.length; i++) {
      var t = lower(src[i]);
      if (!t) { continue; }
      terms.push(t);
      var ws = wordsOf(t);
      for (var j = 0; j < ws.length; j++) { tw.push(ws[j]); }
    }
    c._terms = terms;
    c._termWords = tw;
    /* path rung skips the constant 'Settings' crumb */
    c._path = lower(c.path.slice(1).join(' / '));
    c._desc = lower(spec.desc);
    return c;
  }

  function destClone(d, cat) {
    var out = {};
    var s = obj(d);
    for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) { out[k] = s[k]; } }
    if (cat && !out.cat) { out.cat = cat; }
    return out;
  }

  /* -- settings (828) -- */
  function buildSettings(out) {
    var list = arr(inventory().settings);
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var ct = catTitle(s.cat);
      var st = subTitle(s.cat, s.sub);
      out.push(makeCandidate({
        rid: 's:' + s.id,
        kind: 'setting',
        label: str(s.label) || s.id,
        sub: st || null,
        path: ['Settings', ct, st, str(s.label) || s.id],
        dest: { route: 'setting', cat: s.cat, sub: s.sub, settingId: s.id },
        terms: s.search,
        desc: s.desc,
        curated: s.curated === true,
        simple: s.tier === 'simple'
      }));
    }
  }

  /* -- stress fixtures (only while stress mode is active) -- */
  function buildStress(out) {
    var S = window.PM2 && window.PM2.states;
    if (!S || typeof S.stressActive !== 'function' || !S.stressActive()) { return; }
    if (typeof S.stressRecords !== 'function') { return; }
    var rows = arr(S.stressRecords());
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      out.push(makeCandidate({
        rid: 's:' + r.id,
        kind: 'setting',
        label: str(r.label) || r.id,
        sub: 'Stress fixture',
        path: ['Settings', catTitle(r.cat), 'Stress fixtures', str(r.label) || r.id],
        dest: { route: 'all', cat: r.cat },
        availability: 'Synthetic scale-test record from the stress overlay. It is not a real setting.',
        terms: r.search,
        desc: r.desc,
        weight: -30
      }));
    }
  }

  /* -- managers, including deferred owner shells -- */
  function managerDefs() {
    var M = window.PM2 && window.PM2.managers;
    if (!M || typeof M.all !== 'function') { return []; }
    try { return arr(M.all()); } catch (e) { return []; }
  }

  function buildManagers(out) {
    var defs = managerDefs();
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var deferred = d.status === 'deferred_named_owner';
      out.push(makeCandidate({
        rid: 'm:' + d.id,
        kind: 'manager',
        label: str(d.title) || d.id,
        sub: trunc(d.blurb, 96) || null,
        path: ['Settings', catTitle(d.cat), str(d.title) || d.id],
        dest: { route: 'manager', cat: d.cat, managerId: d.id },
        availability: deferred
          ? 'Reserved destination — the named owner module has not landed yet.'
          : null,
        terms: [d.family],
        desc: d.blurb,
        weight: deferred ? -6 : 0
      }));
    }
  }

  /* -- managed objects, diagnostics, unavailable recasts, help topics -- */

  var DIAG_OBJECT_KINDS = { 'diagnostic': true, 'report': true, 'index-failure': true };

  function safeObjects(def, store) {
    if (typeof def.objects !== 'function') { return []; }
    try { return arr(def.objects(store)); } catch (e) { return []; }
  }
  function safeActions(def, store) {
    if (typeof def.actions !== 'function') { return []; }
    try { return arr(def.actions(store)); } catch (e) { return []; }
  }

  /* Media purposes with no provider are unavailable capabilities; the
     legacy settings map carries the honest reason for video. */
  function mediaUnavailability(store) {
    var map = {};
    var rows = arr(worldData(store).media);
    var legacy = obj(obj(window.PM_DATA).settings);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] && !rows[i].providerRef) {
        var reason = null;
        if (rows[i].purpose === 'video') {
          reason = str(obj(legacy['media.capabilities.video']).unavailableReason);
        }
        map[rows[i].id] = reason ||
          'No connected provider offers this yet. Requests return an honest failure.';
      }
    }
    return map;
  }

  function buildManagerChildren(out, store) {
    var defs = managerDefs();
    var mediaOff = null;
    for (var i = 0; i < defs.length; i++) {
      var def = defs[i];
      var base = ['Settings', catTitle(def.cat), str(def.title) || def.id];
      var objs = safeObjects(def, store);
      var containers = {};
      var j, o;
      for (j = 0; j < objs.length; j++) {
        o = objs[j];
        if (o && o.dest && o.dest.objectId === o.id) { containers[o.id] = str(o.label); }
      }
      for (j = 0; j < objs.length; j++) {
        o = objs[j];
        if (!o || !o.id) { continue; }
        var kind = 'object';
        var rid = 'o:' + def.id + '/' + o.id;
        var availability = null;
        var note = str(o.note);
        if (o.kind === 'help-topic') {
          kind = 'help';
          rid = 'h:' + o.id;
        } else if (DIAG_OBJECT_KINDS[o.kind]) {
          kind = 'diagnostic';
          rid = 'd:' + def.id + '/' + o.id;
        } else if (def.id === 'm.media') {
          if (mediaOff === null) { mediaOff = mediaUnavailability(store); }
          if (mediaOff[o.id]) {
            kind = 'unavailable';
            rid = 'u:' + def.id + '/' + o.id;
            availability = mediaOff[o.id];
          }
        } else if (/unavailable|offline/i.test(note)) {
          kind = 'unavailable';
          rid = 'u:' + def.id + '/' + o.id;
          availability = note;
        }
        var path = base.slice();
        var containerLabel = null;
        if (o.dest && o.dest.objectId && o.dest.objectId !== o.id &&
            containers[o.dest.objectId]) {
          containerLabel = containers[o.dest.objectId];
          path.push(containerLabel);
        }
        path.push(str(o.label));
        var dest = destClone(o.dest, def.cat);
        if (kind === 'unavailable' && availability && !dest.reason) { dest.reason = availability; }
        var kindTerm = str(o.kind).replace(/[-_]+/g, ' ');
        out.push(makeCandidate({
          rid: rid,
          kind: kind,
          label: str(o.label) || o.id,
          sub: note || null,
          path: path,
          dest: dest,
          availability: availability,
          terms: [note, containerLabel, def.title, kindTerm],
          desc: def.blurb
        }));
      }
      buildActionCandidates(out, def, base, store);
    }
    buildDerivedCredentials(out, store);
  }

  /* Actions from def.actions(store). Setup and repair actions are skipped
     here because the workflow corpus (w:) carries them with richer context. */
  function buildActionCandidates(out, def, base, store) {
    var acts = safeActions(def, store);
    for (var i = 0; i < acts.length; i++) {
      var a = acts[i];
      if (!a || !a.id || !a.label) { continue; }
      if (/^act\.setup\./.test(a.id) || a.id.indexOf('install-repair') >= 0) { continue; }
      out.push(makeCandidate({
        rid: 'a:' + a.id,
        kind: 'action',
        label: str(a.label),
        sub: str(def.title) || null,
        path: base.concat([str(a.label)]),
        dest: { route: 'manager', cat: def.cat, managerId: def.id },
        availability: a.available === false
          ? (str(a.reason) || 'Not available right now.')
          : null,
        terms: [def.title, def.family],
        desc: def.blurb
      }));
    }
  }

  /* Stored sign-in credentials, derived honestly from provider connection
     data (oauth tokens live as vault references). The API-key credential
     objects for Claude / OpenRouter / OpenCode already come from
     m.providers.objects(); these fill in the oauth-owned providers so a
     hunt like "openai api key" lands on the provider that owns it. */
  function buildDerivedCredentials(out, store) {
    var d = worldData(store);
    var provs = arr(d.providers);
    var base = ['Settings', catTitle('ai'), 'AI Providers'];
    for (var i = 0; i < provs.length; i++) {
      var p = provs[i];
      var conns = arr(p.connections);
      for (var j = 0; j < conns.length; j++) {
        var c = conns[j];
        if (!c || c.kind !== 'oauth') { continue; }
        out.push(makeCandidate({
          rid: 'o:m.providers/' + p.id + '.cred.' + c.id,
          kind: 'object',
          label: 'Sign-in credential',
          sub: str(p.name) + ' · token stored as a vault reference',
          path: base.concat([str(p.name), 'Sign-in credential']),
          dest: { route: 'manager', cat: 'ai', managerId: 'm.providers',
                  objectId: p.id, tab: 'accounts', sectionId: 'conn.' + c.id },
          terms: ['api key', 'token', 'credential', 'oauth', 'sign in',
                  p.name, p.family, c.route],
          desc: c.note
        }));
      }
    }
  }

  /* -- setup / sign-in / repair workflows from provider data -- */

  var ACCOUNT_ATTENTION = {
    'signed-out': 'An account is signed out on this machine.',
    'auth-no-invoke': 'Signed in, but requests cannot invoke yet.'
  };

  function providerResolver() {
    return (window.PMProvider && typeof window.PMProvider === 'object')
      ? window.PMProvider : null;
  }

  function buildWorkflows(out, store) {
    var d = worldData(store);
    var PV = providerResolver();
    var base = ['Settings', catTitle('ai'), 'AI Providers'];
    var provs = arr(d.providers);
    var i, j, p;

    for (i = 0; i < provs.length; i++) {
      p = provs[i];

      /* setup offers (explicit, user-triggered, official source only) */
      if (p.setupOffer) {
        var sub = 'Explicit, user-triggered install from the official source.';
        try {
          if (PV && typeof PV.installOfferSteps === 'function') {
            var offer = PV.installOfferSteps(p);
            if (offer && offer.officialSource) {
              sub = 'Explicit install from ' + offer.officialSource +
                ' for the exact selected host. Sign-in stays a separate step.';
            }
          }
        } catch (e) { /* keep the generic honest line */ }
        out.push(makeCandidate({
          rid: 'w:setup.' + p.id,
          kind: 'workflow',
          label: 'Set up ' + str(p.name),
          sub: sub,
          path: base.concat([str(p.name), 'Set up ' + str(p.name)]),
          dest: { route: 'manager', cat: 'ai', managerId: 'm.providers',
                  objectId: p.id, tab: 'setup' },
          terms: ['setup', 'set up', 'install', 'get started', p.name, p.family],
          desc: p.statusNote
        }));
      }

      /* sign-in workflows for every provider that holds accounts */
      var accts = arr(p.accounts);
      if (accts.length) {
        var verb = null;
        try {
          if (PV && typeof PV.resolveAuthBoundary === 'function') {
            verb = str(obj(PV.resolveAuthBoundary(p)).signInVerb) || null;
          }
        } catch (e2) { verb = null; }
        var attention = null;
        for (j = 0; j < accts.length; j++) {
          if (ACCOUNT_ATTENTION[accts[j].health]) {
            attention = ACCOUNT_ATTENTION[accts[j].health];
            break;
          }
        }
        out.push(makeCandidate({
          rid: 'w:signin.' + p.id,
          kind: 'workflow',
          label: 'Sign in to ' + str(p.name),
          sub: verb || 'Runs the provider-owned sign-in flow.',
          path: base.concat([str(p.name), 'Sign in to ' + str(p.name)]),
          dest: { route: 'manager', cat: 'ai', managerId: 'm.providers',
                  objectId: p.id, tab: 'accounts' },
          availability: attention,
          terms: ['sign in', 'login', 'log in', 'account', 'authentication',
                  'reconnect', p.name, p.family],
          desc: p.oauthNote
        }));
      }

      /* repair workflows for installations that truly offer repair */
      var insts = arr(p.installations);
      for (j = 0; j < insts.length; j++) {
        var r = null;
        try {
          if (PV && typeof PV.resolveInstallation === 'function') {
            r = PV.resolveInstallation(insts[j]);
          }
        } catch (e3) { r = null; }
        if (!r) { continue; }
        var hasRepair = false;
        var racts = arr(r.actions);
        for (var k = 0; k < racts.length; k++) {
          if (racts[k] && racts[k].id === 'repair') { hasRepair = true; break; }
        }
        if (!hasRepair) { continue; }
        out.push(makeCandidate({
          rid: 'w:repair.' + r.id,
          kind: 'workflow',
          label: 'Repair ' + (str(r.title) || str(p.name)),
          sub: 'Restores the last verified generation, then re-runs the verify checklist.',
          path: base.concat([str(p.name), 'Repair ' + (str(r.title) || str(p.name))]),
          dest: { route: 'manager', cat: 'ai', managerId: 'm.providers',
                  objectId: p.id, tab: 'installs', sectionId: 'inst.' + r.id },
          availability: obj(r.update).label === 'Rolled back'
            ? 'The last update failed verification and was rolled back.'
            : null,
          terms: ['repair', 'fix', 'reinstall', 'broken', p.name, p.family]
        }));
      }
    }

    /* web routes that need setup (API key reference and similar) */
    var webProviders = arr(obj(d.webResearch).providers);
    for (i = 0; i < webProviders.length; i++) {
      var wp = webProviders[i];
      if (!wp || wp.state !== 'needs-setup') { continue; }
      out.push(makeCandidate({
        rid: 'w:setup.' + wp.id,
        kind: 'workflow',
        label: 'Set up ' + str(wp.name) + ' search',
        sub: str(wp.setupNote) || 'Needs setup before this route can run.',
        path: ['Settings', catTitle('web'), 'Web & Research', str(wp.name),
               'Set up ' + str(wp.name) + ' search'],
        dest: { route: 'manager', cat: 'web', managerId: 'm.web', objectId: wp.id },
        terms: ['setup', 'set up', 'api key', 'search route', wp.name]
      }));
    }
  }

  /* -- extra unavailable capabilities (data-derived, honest) -- */

  function buildUnavailable(out, store) {
    var d = worldData(store);
    var hosts = arr(obj(d.serverTopology).hosts);
    for (var i = 0; i < hosts.length; i++) {
      var envs = arr(hosts[i].environments);
      for (var j = 0; j < envs.length; j++) {
        var e = envs[j];
        if (!e || e.kind !== 'wsl' || e.state !== 'off') { continue; }
        out.push(makeCandidate({
          rid: 'u:' + e.id,
          kind: 'unavailable',
          label: str(e.label) || 'Linux through WSL',
          sub: 'Optional environment · off',
          path: ['Settings', catTitle('system'), 'Servers & Hosts',
                 str(hosts[i].name), str(e.label) || 'Linux through WSL'],
          dest: { route: 'manager', cat: 'system', managerId: 'm.servers',
                  objectId: hosts[i].id, reason: str(e.healthNote) },
          availability: str(e.healthNote) ||
            'Off. Setup appears only when a selected capability needs Linux.',
          terms: ['wsl', 'linux', 'ubuntu', 'environment', 'execution host',
                  'off', hosts[i].name]
        }));
      }
    }
  }

  /* -- human-meaningful triggers not already surfaced as manager actions -- */

  var TRIGGER_ACTIONS = [
    { name: 'install-select', label: 'Select which installation to use',
      cat: 'ai', sub: 'AI Providers',
      dest: { route: 'manager', cat: 'ai', managerId: 'm.providers',
              objectId: 'claude', tab: 'installs' },
      terms: ['installation', 'select', 'switch', 'version', 'cli'] },
    { name: 'sound-test', label: 'Test a notification sound',
      cat: 'general', sub: 'Sound Library',
      dest: { route: 'manager', cat: 'general', managerId: 'm.sounds' },
      terms: ['sound', 'audio', 'chime', 'test', 'notification'] },
    { name: 'import-cancel', label: 'Cancel the staged settings import',
      cat: 'system', sub: 'Settings Lifecycle',
      dest: { route: 'manager', cat: 'system', managerId: 'm.lifecycle' },
      terms: ['import', 'cancel', 'staged', 'settings file'] },
    { name: 'copy-preview', label: 'Preview a settings copy',
      cat: null, sub: 'Copy from another project',
      dest: { route: 'copy' },
      terms: ['copy', 'project', 'transfer', 'preview', 'another project'] },
    { name: 'copy-apply', label: 'Apply the staged settings copy',
      cat: null, sub: 'Copy from another project',
      dest: { route: 'copy' },
      terms: ['copy', 'project', 'transfer', 'apply'] },
    { name: 'copy-rollback', label: 'Roll back the last settings copy',
      cat: null, sub: 'Copy from another project',
      dest: { route: 'copy' },
      terms: ['copy', 'rollback', 'undo', 'restore point'] }
  ];

  function buildTriggerActions(out) {
    var S = window.PM2 && window.PM2.states;
    if (!S || typeof S.triggerNames !== 'function') { return; }
    var names = {};
    try {
      var list = arr(S.triggerNames());
      for (var i = 0; i < list.length; i++) { names[list[i]] = true; }
    } catch (e) { return; }
    for (var t = 0; t < TRIGGER_ACTIONS.length; t++) {
      var spec = TRIGGER_ACTIONS[t];
      if (!names[spec.name]) { continue; }
      var crumb = spec.cat
        ? ['Settings', catTitle(spec.cat), spec.sub, spec.label]
        : ['Settings', spec.sub, spec.label];
      out.push(makeCandidate({
        rid: 'a:trigger.' + spec.name,
        kind: 'action',
        label: spec.label,
        sub: spec.sub,
        path: crumb,
        dest: spec.dest,
        terms: spec.terms
      }));
    }
  }

  /* ---------------- the index ---------------- */

  var index = null;        /* {list:[candidates], byRid:{}} */
  var indexStore = null;   /* store the index was built against */
  var hookedStores = [];   /* stores whose invalidating events are wired */

  function invalidate() { index = null; }

  function hookStore(store) {
    if (!store || typeof store.on !== 'function') { return; }
    for (var i = 0; i < hookedStores.length; i++) {
      if (hookedStores[i] === store) { return; }
    }
    hookedStores.push(store);
    var evts = ['scenario', 'fixtures', 'value', 'stress', 'copy'];
    for (var j = 0; j < evts.length; j++) {
      try { store.on(evts[j], invalidate); } catch (e) { /* optional */ }
    }
  }

  function ensureIndex() {
    var store = resolveStore();
    hookStore(store);
    if (index && indexStore === store) { return index; }
    var list = [];
    buildSettings(list);
    buildStress(list);
    buildManagers(list);
    buildManagerChildren(list, store);
    buildWorkflows(list, store);
    buildUnavailable(list, store);
    buildTriggerActions(list);
    var byRid = {};
    var deduped = [];
    for (var i = 0; i < list.length; i++) {
      if (byRid[list[i].rid]) { continue; /* first registration wins */ }
      byRid[list[i].rid] = list[i];
      deduped.push(list[i]);
    }
    index = { list: deduped, byRid: byRid };
    indexStore = store;
    return index;
  }

  /* ---------------- scoring ----------------
     Ladder (CONTRACT2: label > search terms > path > desc), with prefix and
     distance-1 fuzzy rungs. Every token must land somewhere; a token's score
     is its best rung. */

  function scoreToken(token, c) {
    var i;
    if (c._label === token) { return 130; }
    if (c._label.indexOf(token) === 0) { return 120; }
    var lw = c._labelWords;
    for (i = 0; i < lw.length; i++) {
      if (lw[i].indexOf(token) === 0) { return 110; }
    }
    if (c._label.indexOf(token) >= 0) { return 100; }
    if (token.length >= 4 && isSubsequence(token, c._label)) { return 80; }
    var tw = c._termWords;
    for (i = 0; i < tw.length; i++) {
      if (tw[i] === token) { return 70; }
    }
    var fuzzy = token.length >= 5;
    if (fuzzy) {
      for (i = 0; i < lw.length; i++) {
        if (editDistance1(token, lw[i])) { return 60; }
      }
    }
    var ts = c._terms;
    for (i = 0; i < ts.length; i++) {
      if (ts[i].indexOf(token) >= 0) { return 55; }
    }
    if (fuzzy) {
      for (i = 0; i < tw.length; i++) {
        if (editDistance1(token, tw[i])) { return 45; }
      }
    }
    if (c._path.indexOf(token) >= 0) { return 40; }
    if (c._desc.indexOf(token) >= 0) { return 25; }
    return 0;
  }

  function scoreCandidate(tokens, c) {
    var total = 0;
    for (var t = 0; t < tokens.length; t++) {
      var s = scoreToken(tokens[t], c);
      if (s === 0) { return 0; /* every token must match */ }
      total += s;
    }
    if (c.curated) { total += 18; }
    if (c.simple) { total += 8; }
    total += KIND_BONUS[c.kind] || 0;
    total += c.weight;
    return total;
  }

  /* ---------------- public result shape ---------------- */

  function publicResult(c) {
    var r = { rid: c.rid, kind: c.kind, label: c.label };
    if (c.sub) { r.sub = c.sub; }
    r.path = c.path.slice();
    r.dest = destClone(c.dest, null);
    if (c.availability) { r.availability = c.availability; }
    return r;
  }

  /* ---------------- API ---------------- */

  function query(q, opts) {
    var o = obj(opts);
    var limit = typeof o.limit === 'number' && isFinite(o.limit)
      ? Math.max(1, Math.min(200, Math.floor(o.limit))) : 50;
    var text = str(q).trim();
    var qLower = text.toLowerCase();
    if (!qLower) { return { query: text, total: 0, groups: [] }; }
    var tokens = qLower.split(/\s+/);
    var ix = ensureIndex();
    var hits = [];
    for (var i = 0; i < ix.list.length; i++) {
      var c = ix.list[i];
      var score = scoreCandidate(tokens, c);
      if (score > 0) { hits.push({ c: c, score: score }); }
    }
    hits.sort(function (a, b) {
      if (b.score !== a.score) { return b.score - a.score; }
      return a.c.rid < b.c.rid ? -1 : (a.c.rid > b.c.rid ? 1 : 0);
    });
    var total = hits.length;
    if (hits.length > limit) { hits.length = limit; }

    /* group by kind in the fixed prominence order (settings and managers
       first); within a group, relevance order is preserved. */
    var byKind = {};
    var g;
    for (var h = 0; h < hits.length; h++) {
      var kind = hits[h].c.kind;
      g = byKind[kind];
      if (!g) { g = byKind[kind] = []; }
      g.push(publicResult(hits[h].c));
    }
    var groups = [];
    for (var k = 0; k < KIND_ORDER.length; k++) {
      g = byKind[KIND_ORDER[k]];
      if (g && g.length) {
        groups.push({ kind: KIND_ORDER[k], label: KIND_LABELS[KIND_ORDER[k]], results: g });
      }
    }
    return { query: text, total: total, groups: groups };
  }

  function resolveRid(rid) {
    var ix = ensureIndex();
    var c = ix.byRid[str(rid)];
    return c ? publicResult(c) : null;
  }

  function corpusStats() {
    var ix = ensureIndex();
    var byKind = {};
    for (var i = 0; i < KIND_ORDER.length; i++) { byKind[KIND_ORDER[i]] = 0; }
    var stress = 0;
    for (var j = 0; j < ix.list.length; j++) {
      var c = ix.list[j];
      byKind[c.kind] = (byKind[c.kind] || 0) + 1;
      if (c.sub === 'Stress fixture') { stress += 1; }
    }
    var S = window.PM2 && window.PM2.states;
    return {
      total: ix.list.length,
      byKind: byKind,
      settings: byKind.setting,
      managers: byKind.manager,
      stressActive: !!(S && typeof S.stressActive === 'function' && S.stressActive()),
      stressRecords: stress
    };
  }

  window.PM2.search = {
    query: query,
    resolveRid: resolveRid,
    corpusStats: corpusStats,
    invalidate: invalidate
  };
})();
