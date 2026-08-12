/* pm-provider.js — window.PMProvider
   fable Settings bakeoff shared PROVIDER SEMANTICS.
   The four concepts must show identical provider/account/model/installation
   product behavior in four different visual idioms. Every state string,
   allowed action, and boundary explanation resolves HERE and only here, so
   behavior cannot drift between concepts.

   CONTRACT: this module exports NO HTML and NO CSS. Resolvers return plain
   data ({label, tone, detail, actions, ...}); each concept renders them in
   its own composition. Tones map onto the shared .pm-status-word palette:
   ok | attention | setup | muted | progress. */
(function () {
  'use strict';

  function str(x) { return typeof x === 'string' ? x : ''; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }

  /* ------------------------------------------------------------------ */
  /* Installation update lifecycle: the single source of the ten states. */
  /* ------------------------------------------------------------------ */

  var UPDATE_STATES = {
    'up-to-date':          { label: 'Up to date',                     tone: 'ok',        busy: false },
    'update-available':    { label: 'Update available',              tone: 'setup',     busy: false },
    'waiting-idle':        { label: 'Waiting for work to finish',    tone: 'progress',  busy: false },
    'updating':            { label: 'Updating',                      tone: 'progress',  busy: true },
    'verifying':           { label: 'Verifying',                     tone: 'progress',  busy: true },
    'ready':               { label: 'Ready',                         tone: 'ok',        busy: false },
    'verification-failed': { label: 'Verification failed',           tone: 'attention', busy: false },
    'rolled-back':         { label: 'Rolled back',                   tone: 'attention', busy: false },
    'needs-repair':        { label: 'Needs repair',                  tone: 'attention', busy: false },
    'managed-externally':  { label: 'Managed externally',            tone: 'muted',     busy: false },
    'unknown-method':      { label: 'Could not identify installation method', tone: 'muted', busy: false }
  };

  var CONFIDENCE = {
    'proven':    { label: 'Proven',              canManage: true },
    'strong':    { label: 'Strongly identified', canManage: true },
    'probable':  { label: 'Probable',            canManage: false },
    'ambiguous': { label: 'Ambiguous',           canManage: false },
    'unknown':   { label: 'Unknown',             canManage: false }
  };

  /* Success is never the installer exit code alone. */
  var VERIFY_CHECKLIST = [
    'Exact path resolves',
    'Launch health',
    'Auth and profile identity',
    'Model catalog',
    'Adapter handshake',
    'Required capabilities',
    'Dependent routes refreshed'
  ];

  function resolveUpdateState(update) {
    var u = obj(update);
    var meta = UPDATE_STATES[str(u.state)] || UPDATE_STATES['up-to-date'];
    var detail = '';
    if (u.state === 'update-available' && u.available) {
      detail = 'Version ' + str(u.available.version) + ' is available. Policy: install ' +
        (obj(u.policy).install === 'auto-idle' ? 'automatically when idle' : 'after asking first') + '.';
    } else if (u.state === 'waiting-idle') {
      detail = str(u.idleNote) || 'The update installs when no runs are active.';
    } else if (u.state === 'rolled-back') {
      detail = str(u.rollbackNote) || 'The previous generation was restored after verification failed.';
    } else if (u.state === 'managed-externally') {
      detail = str(u.managedBy) || 'Another package manager owns this installation.';
    } else if (u.state === 'unknown-method') {
      detail = 'No package database claims this binary, so updates stay manual.';
    }
    return {
      state: str(u.state) || 'up-to-date',
      label: meta.label,
      tone: meta.tone,
      busy: meta.busy,
      detail: detail,
      available: u.available || null,
      policy: obj(u.policy),
      history: arr(u.history),
      verifyChecklist: VERIFY_CHECKLIST
    };
  }

  function resolveInstallation(inst) {
    var i = obj(inst);
    var conf = CONFIDENCE[str(i.confidence)] || CONFIDENCE['unknown'];
    var manualOnly = i.manualOnly === true || !conf.canManage;
    var actions = [];
    var upd = resolveUpdateState(i.update);

    if (i.selected !== true) { actions.push({ id: 'select', label: 'Use this installation' }); }
    if (!manualOnly) {
      if (upd.state === 'update-available') { actions.push({ id: 'update', label: 'Install update' }); }
      if (upd.state === 'verification-failed') { actions.push({ id: 'rollback', label: 'Roll back' }); }
      if (upd.state === 'needs-repair' || upd.state === 'rolled-back') { actions.push({ id: 'repair', label: 'Repair' }); }
      actions.push({ id: 'verify', label: 'Verify' });
    }
    actions.push({ id: 'details', label: 'Advanced detail' });

    return {
      id: str(i.id),
      title: str(i.label) || str(i.configuredCommand),
      version: str(i.version),
      selected: i.selected === true,
      shadowed: i.shadowed === true,
      shadowedBy: str(i.shadowedBy) || null,
      shadowNote: i.shadowed === true
        ? 'Another selected installation resolves first for the same command. This one stays installed but unused.'
        : null,
      confidence: { id: str(i.confidence) || 'unknown', label: conf.label },
      manualOnly: manualOnly,
      manualOnlyReason: str(i.manualOnlyReason) ||
        (manualOnly ? 'Ownership is not proven, so Puppet Master never modifies this installation. Updates stay manual.' : null),
      update: upd,
      actions: actions,
      advanced: {
        configuredCommand: str(i.configuredCommand),
        resolvedLauncher: str(i.resolvedLauncher),
        actualExecutable: str(i.actualExecutable),
        method: str(i.method),
        packageIdentity: i.packageIdentity == null ? null : String(i.packageIdentity),
        managerRoot: i.managerRoot == null ? null : String(i.managerRoot),
        hostId: str(i.hostId),
        envId: str(i.envId),
        arch: str(i.arch),
        evidence: arr(i.evidence)
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /* Free routes: the six packet states.                                 */
  /* ------------------------------------------------------------------ */

  var FREE_ROUTE_STATES = {
    'ready':               { label: 'Ready',               tone: 'ok' },
    'needs-setup':         { label: 'Needs setup',         tone: 'setup' },
    'cooling-down':        { label: 'Cooling down',        tone: 'progress' },
    'no-longer-free':      { label: 'No longer free',      tone: 'attention' },
    'no-longer-available': { label: 'No longer available', tone: 'muted' },
    'unverified':          { label: 'Unverified',          tone: 'setup' }
  };

  function resolveFreeRoute(route) {
    var r = obj(route);
    var meta = FREE_ROUTE_STATES[str(r.state)] || FREE_ROUTE_STATES['unverified'];
    return {
      id: str(r.id),
      state: str(r.state) || 'unverified',
      label: meta.label,
      tone: meta.tone,
      note: str(r.stateNote),
      qualifier: str(r.qualifier),
      underlyingProviderId: str(r.underlyingProviderId),
      wrapperNote: 'Free Models is a wrapper over the underlying route. Credentials, quota, switching, and usage always belong to the underlying provider.',
      setupSteps: arr(r.setupSteps)
    };
  }

  /* ------------------------------------------------------------------ */
  /* Authentication boundary.                                            */
  /* ------------------------------------------------------------------ */

  var AUTH_KINDS = {
    'cli-owned':       { label: 'Sign-in owned by the CLI',   pmDirect: false },
    'pm-direct-oauth': { label: 'Puppet Master sign-in',      pmDirect: true },
    'api-key':         { label: 'API key connection',         pmDirect: false },
    'server':          { label: 'Server connection',          pmDirect: false },
    'wrapper':         { label: 'No credentials of its own',  pmDirect: false }
  };

  function resolveAuthBoundary(provider) {
    var p = obj(provider);
    var b = obj(p.authBoundary);
    var meta = AUTH_KINDS[str(b.kind)] || AUTH_KINDS['api-key'];
    return {
      kind: str(b.kind) || 'api-key',
      label: meta.label,
      pmDirect: meta.pmDirect,
      note: str(b.note),
      signInVerb: meta.pmDirect ? 'Sign in with Puppet Master'
        : (b.kind === 'cli-owned' ? 'Open the CLI’s own sign-in'
        : (b.kind === 'api-key' ? 'Add API key reference'
        : (b.kind === 'server' ? 'Check server connection' : 'Set up the underlying route')))
    };
  }

  /* ------------------------------------------------------------------ */
  /* Requested vs effective routes.                                      */
  /* ------------------------------------------------------------------ */

  function resolveRoute(item) {
    var r = obj(item);
    var requested = str(r.requestedRoute) || (r.requested === true ? str(r.name) : '');
    var effective = str(r.effectiveRoute);
    var differs = !!(requested && effective && requested !== effective);
    return {
      requested: requested || null,
      effective: effective || requested || null,
      differs: differs,
      why: differs ? (str(r.fallbackReason) || str(r.effectiveReason)) : null
    };
  }

  /* ------------------------------------------------------------------ */
  /* Explicit install offers (never bundled, never silent).              */
  /* ------------------------------------------------------------------ */

  function installOfferSteps(provider) {
    var p = obj(provider);
    var offer = obj(p.setupOffer);
    return {
      available: !!p.setupOffer,
      officialSource: str(offer.officialSource),
      sourceNote: str(offer.sourceNote),
      hostChoices: arr(offer.hostChoices),
      steps: arr(offer.steps),
      policyNote: 'Provider CLIs are acquired only by an explicit Install or Set Up, from the official source, for the exact selected host and environment. Installation and authentication stay separate.'
    };
  }

  /* ------------------------------------------------------------------ */
  /* Provider status words shared by all four concepts.                  */
  /* ------------------------------------------------------------------ */

  var PROVIDER_STATUS = {
    'ready':          { label: 'Ready',                       tone: 'ok' },
    'degraded':       { label: 'Degraded',                    tone: 'attention' },
    'signed-out':     { label: 'Not signed in',               tone: 'setup' },
    'auth-no-invoke': { label: 'Signed in, cannot invoke',    tone: 'attention' },
    'refreshing':     { label: 'Refreshing',                  tone: 'progress' },
    'not-installed':  { label: 'Not installed',               tone: 'setup' },
    'unreachable':    { label: 'Unreachable',                 tone: 'attention' }
  };

  function resolveProviderStatus(provider) {
    var p = obj(provider);
    var meta = PROVIDER_STATUS[str(p.status)] || { label: str(p.status) || 'Unknown', tone: 'muted' };
    return { state: str(p.status), label: meta.label, tone: meta.tone, note: str(p.statusNote) };
  }

  function resolveUsageDetails(provider) {
    var p = obj(provider);
    if (p.usageDetails && p.usageDetails.state === 'unavailable') {
      return { state: 'unavailable', reason: str(p.usageDetails.reason), affectsReadiness: false };
    }
    return { state: 'available', reason: null, affectsReadiness: false };
  }

  window.PMProvider = {
    resolveInstallation: resolveInstallation,
    resolveUpdateState: resolveUpdateState,
    resolveFreeRoute: resolveFreeRoute,
    resolveAuthBoundary: resolveAuthBoundary,
    resolveRoute: resolveRoute,
    resolveProviderStatus: resolveProviderStatus,
    resolveUsageDetails: resolveUsageDetails,
    installOfferSteps: installOfferSteps,
    UPDATE_STATES: UPDATE_STATES,
    FREE_ROUTE_STATES: FREE_ROUTE_STATES,
    VERIFY_CHECKLIST: VERIFY_CHECKLIST
  };
})();
