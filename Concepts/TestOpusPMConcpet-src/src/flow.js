/* =====================================================================
   PMO FLOW — the onboarding draft model, fixtures and receipts.

   Everything the user chooses before the commit screen lives in one
   reversible draft. Nothing here creates a project, a folder, a history,
   an online repository or a sync binding; the commit step is the only
   place side effects are produced, and it produces a receipt.
   ===================================================================== */
(function () {
  'use strict';
  if (window.PMO_FLOW) return;

  var STORAGE = 'pmo.onboarding.draft.v1';

  /* ---------------------------------------------------------------
     Fixtures — deterministic stand-ins for canonical owner services.
     --------------------------------------------------------------- */

  var FIXTURES = {

    /* Devices this client can already see. Cached-first: this list is the
       cache, and a bounded refresh tops it up rather than probing at start. */
    devices: [
      { id: 'studio', name: 'Studio', detail: 'In this house · seen 2 minutes ago', kind: 'server', ready: true },
      { id: 'attic',  name: 'Attic Mini', detail: 'In this house · seen yesterday', kind: 'server', ready: true,
        /* Seen a while ago: it can drop out between review and commit, which is
           exactly the case the recovery route exists for. */
        flaky: true }
    ],

    /* Storage devices discovered on the local network. */
    networkDevices: [
      { id: 'nas', name: 'HomeVault', detail: 'Network storage · 192.168.1.42', suggestedUser: 'sam' },
      { id: 'tower', name: 'Workshop Tower', detail: 'Computer · 192.168.1.18', suggestedUser: 'sam' }
    ],

    /* Existing projects, used for "start like another project". */
    projects: [
      { id: 'tastebook', name: 'Tastebook', detail: 'Used yesterday', groups: ['Planning preferences', 'Permissions', 'Notifications', 'Testing defaults', 'AI accounts'] },
      { id: 'ledger',    name: 'Ledger',    detail: 'Used last week',  groups: ['Planning preferences', 'Permissions', 'Notifications'] }
    ],

    /* Online places source files can live. */
    onlineHosts: [
      { id: 'github', name: 'GitHub',     detail: 'The most common place to keep work online' },
      { id: 'gitlab', name: 'GitLab',     detail: 'Common in workplaces and schools' },
      { id: 'bitbucket', name: 'Bitbucket', detail: 'Often used with Jira' },
      { id: 'forgejo', name: 'Forgejo',   detail: 'Runs on a computer you own' }
    ],

    /* Ways to reach another computer or storage device. SSH leads. */
    networkProtocols: [
      { id: 'ssh',  name: 'SSH',   detail: 'Secure and works almost everywhere. Recommended.', recommended: true },
      { id: 'smb',  name: 'Shared folder (SMB)', detail: 'Common for Windows and network drives' },
      { id: 'nfs',  name: 'NFS',   detail: 'Common on Linux file servers' }
    ],

    /* Accounts that can power Puppet Master. `binary` present means the
       vendor ships a CLI we may need to install on the execution host. */
    providers: [
      { id: 'claude-sub',  name: 'Claude',            plan: 'Subscription', binary: 'claude', detected: 'ready',
        note: 'Signed in on this computer' },
      { id: 'cursor',      name: 'Cursor',            plan: 'API key',      binary: null,     detected: 'key',
        note: 'Paste a key from your Cursor account' },
      { id: 'antigravity', name: 'Google Antigravity', plan: 'Subscription', binary: 'agy',   detected: 'install',
        note: 'Needs the Antigravity app on this computer' },
      { id: 'anthropic',   name: 'Anthropic API',     plan: 'Pay as you go', binary: null,    detected: 'key',
        note: 'Billed separately from a Claude subscription' },
      { id: 'grok',        name: 'Grok Build',        plan: 'Subscription',  binary: 'grok',  detected: 'signin',
        note: 'Installed here, but signed out' },
      { id: 'gemini',      name: 'Gemini API',        plan: 'Pay as you go', binary: null,    detected: 'key',
        note: 'Uses a key from Google AI Studio' }
    ],

    freeModels: [
      { id: 'free-fast',  name: 'Quick helper',  detail: 'Good for short questions and simple edits' },
      { id: 'free-local', name: 'On this computer', detail: 'Runs offline. Slower, but private and free.' }
    ]
  };

  /* ---------------------------------------------------------------
     Draft
     --------------------------------------------------------------- */

  function blankDraft() {
    return {
      schema_id: 'pmo.onboarding.draft.v1',
      where: 'this-device',
      device: null,
      pairCode: null,
      begin: 'new',
      name: '',
      slug: '',
      location: null,
      locationCustom: false,
      source: null,            /* folder | online | network */
      folderPath: null,
      online: { host: null, account: null, repo: null, signedIn: false, creating: false },
      network: { protocol: 'ssh', device: null, address: '', user: '', path: '', keyInstalled: false, tested: false },
      history: true,
      onlineCopy: false,
      inherit: null,
      inheritGroups: null,
      restoreFrom: null,
      committed: false,
      receipt: null,
      commitAttempts: 0,
      providers: [],           /* ids that reached Ready */
      freeModels: false,
      visited: []
    };
  }

  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  }

  var draft = blankDraft();
  var listeners = [];

  function emit(reason) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](draft, reason); } catch (e) {}
    }
  }

  function set(patch, reason) {
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) draft[k] = patch[k];
    if (patch.name !== undefined) {
      draft.slug = slugify(patch.name);
      if (!draft.locationCustom) draft.location = draft.slug ? '~/Puppet Master/' + draft.slug : null;
    }
    persist();
    emit(reason || 'set');
    return draft;
  }

  function persist() {
    try { localStorage.setItem(STORAGE, JSON.stringify(draft)); } catch (e) {}
  }

  function restore() {
    try {
      var raw = localStorage.getItem(STORAGE);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.schema_id !== 'pmo.onboarding.draft.v1') return false;
      draft = parsed;
      return true;
    } catch (e) { return false; }
  }

  function reset() { draft = blankDraft(); persist(); emit('reset'); return draft; }

  /* ---------------------------------------------------------------
     Preflight — read-only checks. Safe before commit; leaves nothing
     behind if it fails.
     --------------------------------------------------------------- */

  function preflight() {
    var checks = [];
    checks.push({ id: 'name', ok: !!draft.name.trim(), label: 'Project name', detail: draft.name || 'Not set yet' });
    checks.push({ id: 'location', ok: !!draft.location, label: 'Where files go', detail: draft.location || 'Not set yet' });
    checks.push({ id: 'host', ok: true, label: 'Computer doing the work',
                  detail: draft.where === 'this-device' ? 'This computer' : (draft.device && draft.device.name) || 'Another device' });
    if (draft.source === 'online') {
      checks.push({ id: 'online', ok: !!draft.online.signedIn, label: 'Online account',
                    detail: draft.online.signedIn ? (draft.online.account + ' on ' + hostName(draft.online.host)) : 'Sign in needed' });
    }
    if (draft.source === 'network') {
      checks.push({ id: 'network', ok: !!draft.network.tested, label: 'Network connection',
                    detail: draft.network.tested ? ('Connected to ' + draft.network.address) : 'Not connected yet' });
    }
    return { ok: checks.every(function (c) { return c.ok; }), checks: checks };
  }

  function hostName(id) {
    for (var i = 0; i < FIXTURES.onlineHosts.length; i++) if (FIXTURES.onlineHosts[i].id === id) return FIXTURES.onlineHosts[i].name;
    return id || '';
  }

  /* ---------------------------------------------------------------
     Commit — the one place side effects happen. Idempotent by key,
     receipt-backed, and it reports the phase it is actually in.
     --------------------------------------------------------------- */

  function commitPhases() {
    var phases = [{ id: 'folder', label: 'Making the project folder' }];
    if (draft.history) phases.push({ id: 'history', label: 'Starting the change history' });
    if (draft.source === 'online') phases.push({ id: 'clone', label: 'Bringing in your files from ' + hostName(draft.online.host) });
    if (draft.source === 'network') phases.push({ id: 'mount', label: 'Connecting to ' + (draft.network.address || 'the device') });
    if (draft.source === 'folder') phases.push({ id: 'import', label: 'Linking your existing folder' });
    if (draft.onlineCopy) phases.push({ id: 'backup', label: 'Setting up the online copy' });
    if (draft.inherit) phases.push({ id: 'settings', label: 'Copying settings from ' + projectName(draft.inherit) });
    phases.push({ id: 'register', label: 'Adding the project to Puppet Master' });
    return phases;
  }

  function projectName(id) {
    for (var i = 0; i < FIXTURES.projects.length; i++) if (FIXTURES.projects[i].id === id) return FIXTURES.projects[i].name;
    return id || '';
  }

  var idempotencyKey = null;
  function commitKey() {
    if (!idempotencyKey) idempotencyKey = 'pmo-commit-' + draft.slug + '-' + Date.now().toString(36);
    return idempotencyKey;
  }

  /* Runs the commit. `opts.fail` forces the truthful failure path so the
     recovery route can be demonstrated. Returns a controller so the UI can
     follow the real phase rather than invent a percentage. */
  function commit(opts, onPhase, onDone) {
    opts = opts || {};
    draft.commitAttempts = (draft.commitAttempts || 0) + 1;
    /* Revalidation at commit time: a device last seen a while ago may have gone
       away since the review. The first attempt surfaces it truthfully; a retry
       reuses the same idempotency key and succeeds if it came back. */
    var failAt = opts.fail || null;
    if (!failAt && draft.where !== 'this-device' && draft.device && draft.device.flaky && draft.commitAttempts === 1) {
      failAt = 'register';
    }
    opts = { fail: failAt };
    var phases = commitPhases(), i = -1, cancelled = false;
    var receipt = {
      schema_id: 'pmo.project_commit_receipt.v1',
      idempotency_key: commitKey(),
      project: { name: draft.name, slug: draft.slug, location: draft.location },
      started_utc: new Date().toISOString(),
      phases: [], status: 'running'
    };

    function step() {
      if (cancelled) return;
      i += 1;
      if (i >= phases.length) {
        receipt.status = 'succeeded';
        receipt.finished_utc = new Date().toISOString();
        draft.committed = true; draft.receipt = receipt; persist(); emit('commit');
        onDone && onDone(null, receipt);
        return;
      }
      var ph = phases[i];
      onPhase && onPhase(ph, i, phases.length);
      var dur = 520 + (i === 0 ? 240 : 0);
      setTimeout(function () {
        if (cancelled) return;
        if (opts.fail && ph.id === opts.fail) {
          receipt.phases.push({ id: ph.id, status: 'failed' });
          receipt.status = 'failed';
          var hostName = (draft.device && draft.device.name) || 'that computer';
          receipt.failure = { phase: ph.id, label: ph.label,
            reason: ph.id === 'register'
              ? (hostName + ' stopped responding.')
              : 'Puppet Master could not finish this step.',
            recovery: 'Nothing was left half-made, and no second project was created. ' +
                      'You can try again, or choose a different computer.' };
          draft.receipt = receipt; persist(); emit('commit-failed');
          onDone && onDone(receipt.failure, receipt);
          return;
        }
        receipt.phases.push({ id: ph.id, status: 'succeeded' });
        step();
      }, dur);
    }
    step();
    return { cancel: function () { cancelled = true; }, phases: phases, receipt: receipt };
  }

  /* ---------------------------------------------------------------
     Provider detection — bounded, cached-first. Nothing probes until the
     provider phase is actually on screen.
     --------------------------------------------------------------- */

  function detectProviders(cb) {
    var out = FIXTURES.providers.map(function (p) {
      return { id: p.id, name: p.name, plan: p.plan, binary: p.binary, note: p.note,
               state: p.detected === 'ready' ? 'ready' : p.detected };
    });
    setTimeout(function () { cb(out); }, 420);
    return out;
  }

  /* Settings Transfer preview, in the words a newcomer would use. */
  function inheritPreview(projectId) {
    var p = null;
    for (var i = 0; i < FIXTURES.projects.length; i++) if (FIXTURES.projects[i].id === projectId) p = FIXTURES.projects[i];
    if (!p) return null;
    return {
      project: p,
      summary: 'Uses the same planning preferences, permissions, notifications and testing defaults as ' + p.name +
               '. Your new files, history and plans stay separate.',
      groups: p.groups
    };
  }

  window.PMO_FLOW = {
    schema_id: 'pmo.onboarding.flow.v1',
    concept_simulation_only: true,
    fixtures: FIXTURES,
    get draft() { return draft; },
    set: set,
    reset: reset,
    restore: restore,
    persist: persist,
    slugify: slugify,
    preflight: preflight,
    commit: commit,
    commitPhases: commitPhases,
    detectProviders: detectProviders,
    inheritPreview: inheritPreview,
    hostName: hostName,
    projectName: projectName,
    subscribe: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  };
})();
