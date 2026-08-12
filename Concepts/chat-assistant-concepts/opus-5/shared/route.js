/* PMXRoute — Opus 5
 *
 * The provider / account / model catalog and the thread-local route state built on it.
 *
 * THE CENTRAL IDEA: a route is the pair (account, model), never a model name.
 * ------------------------------------------------------------------------
 * `Opus 5` appears under BOTH `Anthropic — Work` and `Anthropic — Personal` in the catalog below.
 * They are two distinct routes with different connections, different setup states, different
 * allowances and different privacy posture, and the picker has to make that visible. Every function
 * here therefore keys on `accountId + '/' + modelName`, and `routeOf()` returns both. A flat model
 * list — which is what `selectors.js` had — cannot express this at all, which is why it is replaced
 * rather than extended.
 *
 * WHAT THE ADAPTER OWNS AND THE UI MUST NOT GUESS
 * ----------------------------------------------
 * `effort()` and `supportsFast()` read DECLARED flags on the model record. Inferring "this looks
 * like a small model so it probably supports Fast" is exactly the class of guess that produces a
 * control the backend cannot honour. When a capability is absent the control is ABSENT, not
 * disabled-with-a-shrug: `effort()` returns null for Haiku 4.5 and GPT-5.6 Mini, and the Route popup
 * omits the whole submenu rather than showing three greyed rows.
 *
 * SETUP IS PART OF THE ROUTE, NOT A SEPARATE SCREEN
 * ------------------------------------------------
 * A route whose account needs a sign-in, a CLI, a key or an update is not usable, and the composer
 * must say which one. `setupStateOf()` returns one literal from `session.providerSetup`, and
 * `settingsTarget()` names the exact destination plus the way back, so the offer is "open the place
 * that fixes this" rather than a generic settings link. CLI-owned OAuth accounts deliberately expose
 * only `Open Provider Settings` — PM must not present a sign-in button for a session it does not own
 * (05_ATTACHMENTS_PROVIDER_SETUP_SYNC_AND_NOTIFICATIONS.md:55).
 *
 * Contract: CONTRACT.md sections 4, 5 and 8.9; SERVICES.md "PMXRoute".
 */
(function (global) {
  'use strict';

  var store = null;
  var data = null;

  var RECENTS_CAP = 5;

  /* ------------------------------------------------------------------ catalog
   *
   * Six accounts across five providers, covering every connection form and every interesting
   * setup state at once, because the demo has to reach each one without a fixture edit:
   *   ready              -> Anthropic Work, OpenAI Team
   *   signin_required    -> Anthropic Personal (Claude CLI holds the OAuth session)
   *   cli_missing        -> Google Lab (Antigravity CLI is not installed)
   *   usage_unavailable  -> Alibaba (the account works, its usage endpoint does not)
   *   model_unavailable  -> Moonshot (the account works, the model is not being served)
   *
   * The last two are the interesting ones: they are DEGRADED, not broken, and the packet requires
   * the difference to be visible rather than collapsed into one "error" state.
   */
  var PROVIDERS = [
    { id: 'prov-anthropic', name: 'Anthropic', icon: 'provider-anthropic' },
    { id: 'prov-openai', name: 'OpenAI', icon: 'provider-openai' },
    { id: 'prov-google', name: 'Google', icon: 'provider-google' },
    { id: 'prov-alibaba', name: 'Alibaba', icon: 'provider-alibaba' },
    { id: 'prov-moonshot', name: 'Moonshot', icon: 'provider-moonshot' }
  ];

  /* `connection` is the human-readable prose the account row shows; `oauthOwner` is what makes the
   * sign-in question answerable. When a CLI owns the session, PM cannot refresh it, so the only
   * honest action is to send the user to the place that can. */
  var ACCOUNTS = [
    {
      id: 'acct-anthropic-work', providerId: 'prov-anthropic', label: 'Anthropic — Work',
      connection: 'API key', oauthOwner: null, state: 'ready'
    },
    {
      id: 'acct-anthropic-personal', providerId: 'prov-anthropic', label: 'Anthropic — Personal',
      connection: 'Claude CLI (OAuth)', oauthOwner: 'Claude CLI', state: 'signin_required'
    },
    {
      id: 'acct-openai-team', providerId: 'prov-openai', label: 'OpenAI — Team',
      connection: 'API key', oauthOwner: null, state: 'ready'
    },
    {
      id: 'acct-google-lab', providerId: 'prov-google', label: 'Google — Lab',
      connection: 'Antigravity CLI (OAuth)', oauthOwner: 'Antigravity CLI', state: 'cli_missing'
    },
    {
      id: 'acct-alibaba', providerId: 'prov-alibaba', label: 'Alibaba — Cloud',
      connection: 'API key', oauthOwner: null, state: 'usage_unavailable'
    },
    {
      id: 'acct-moonshot', providerId: 'prov-moonshot', label: 'Moonshot — Trial',
      connection: 'API key', oauthOwner: null, state: 'model_unavailable'
    }
  ];

  /* `facts` is capped at three entries by construction, not by a slice at render time: the picker
   * shows at most context size, Fast and Vision, and a fourth fact is a badge wall
   * (01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md:20). `effortLevels: null` means the model has no
   * reasoning-effort axis at all, so the submenu is omitted. */
  var MODELS = [
    {
      name: 'Opus 5', accountId: 'acct-anthropic-work',
      effortLevels: ['High', 'Medium', 'Low'], fast: false,
      capabilities: { context: '200K context', vision: true, video: false },
      available: true, disabledReason: null
    },
    {
      name: 'Sonnet 5', accountId: 'acct-anthropic-work',
      effortLevels: ['High', 'Medium', 'Low'], fast: true,
      capabilities: { context: '200K context', vision: true, video: false },
      available: true, disabledReason: null
    },
    {
      name: 'Haiku 4.5', accountId: 'acct-anthropic-work',
      effortLevels: null, fast: true,
      capabilities: { context: '128K context', vision: true, video: false },
      available: true, disabledReason: null
    },
    /* The second Anthropic account. Same two model NAMES as above, different routes: the account
     * needs a CLI sign-in, so both are unavailable until it is repaired — and the reason names the
     * account, not the model, because the model is fine. */
    {
      name: 'Opus 5', accountId: 'acct-anthropic-personal',
      effortLevels: ['High', 'Medium', 'Low'], fast: false,
      capabilities: { context: '200K context', vision: true, video: false },
      available: false, disabledReason: 'Sign in through Claude CLI to use this account'
    },
    {
      name: 'Sonnet 5', accountId: 'acct-anthropic-personal',
      effortLevels: ['High', 'Medium', 'Low'], fast: true,
      capabilities: { context: '200K context', vision: true, video: false },
      available: false, disabledReason: 'Sign in through Claude CLI to use this account'
    },
    {
      name: 'GPT-5.6 Pro', accountId: 'acct-openai-team',
      effortLevels: ['High', 'Medium', 'Low'], fast: false,
      capabilities: { context: '256K context', vision: true, video: false },
      available: true, disabledReason: null
    },
    {
      name: 'GPT-5.6 Mini', accountId: 'acct-openai-team',
      effortLevels: null, fast: true,
      capabilities: { context: '128K context', vision: false, video: false },
      available: true, disabledReason: null
    },
    /* The one video-capable route. The attachment resolver's alternate-route offer names this model
     * by label, so the name here and the copy in shared/attach.js must stay in step. */
    {
      name: 'Gemini 3 Ultra', accountId: 'acct-google-lab',
      effortLevels: ['High', 'Medium', 'Low'], fast: false,
      capabilities: { context: '1M context', vision: true, video: true },
      available: false, disabledReason: 'Antigravity CLI is not installed'
    },
    {
      name: 'Qwen 3.8', accountId: 'acct-alibaba',
      effortLevels: ['High', 'Medium', 'Low'], fast: false,
      capabilities: { context: '128K context', vision: true, video: false },
      available: true, disabledReason: null
    },
    {
      name: 'Kimi K3', accountId: 'acct-moonshot',
      effortLevels: ['High', 'Medium', 'Low'], fast: false,
      capabilities: { context: '256K context', vision: false, video: false },
      available: false, disabledReason: 'This model is not being served on this account right now'
    }
  ];

  /* Which classes of change cross a boundary the user must be told about BEFORE the turn is resent.
   * Provider identity and prompt-cache continuity are the two that always matter; hosting/privacy
   * is added when the target account sits with a different provider entirely. */
  function consequencesOf(fromAccount, toAccount) {
    var out = [];
    if (!fromAccount || !toAccount) return out;
    if (fromAccount.providerId !== toAccount.providerId) {
      out.push('provider_boundary');
      out.push('cache_loss');
      out.push('privacy_hosting_change');
    } else if (fromAccount.id !== toAccount.id) {
      /* Same provider, different account: the conversation is replayed under another credential and
       * the cache is keyed per account, so the cache is still lost — but privacy posture is not. */
      out.push('conversation_replay');
      out.push('cache_loss');
    }
    return out;
  }

  function bind(s, d) {
    store = s || null;
    data = d || null;
    seedSetupStates();
    return api;
  }

  /* The setup ladder is store state so the demo director can walk an account through
   * install_required -> update_available -> verifying -> update_failed -> needs_repair without
   * touching the catalog. Seeding is one-way: an account already carrying a state keeps it, so a
   * re-bind after the corpus loads cannot undo a director step. */
  function seedSetupStates() {
    if (!store) return;
    var setup = store.get('session.providerSetup') || {};
    var changed = false;
    for (var i = 0; i < ACCOUNTS.length; i++) {
      var a = ACCOUNTS[i];
      if (setup[a.id] === undefined) { setup[a.id] = a.state; changed = true; }
    }
    if (changed) store.set('session.providerSetup', setup);
  }

  function providers() {
    return PROVIDERS.map(function (p) {
      var ids = [];
      for (var i = 0; i < ACCOUNTS.length; i++) if (ACCOUNTS[i].providerId === p.id) ids.push(ACCOUNTS[i].id);
      return { id: p.id, name: p.name, icon: p.icon, accounts: ids };
    });
  }

  function providerById(id) {
    for (var i = 0; i < PROVIDERS.length; i++) if (PROVIDERS[i].id === id) return PROVIDERS[i];
    return null;
  }

  function accountRecord(idOrLabel) {
    for (var i = 0; i < ACCOUNTS.length; i++) {
      if (ACCOUNTS[i].id === idOrLabel || ACCOUNTS[i].label === idOrLabel) return ACCOUNTS[i];
    }
    return null;
  }

  /* Accounts carry their own action list rather than a boolean, because "can PM sign this in?" is
   * not a yes/no the caller should have to derive. A CLI-owned session gets exactly one action. */
  function accounts() {
    return ACCOUNTS.map(function (a) {
      var p = providerById(a.providerId);
      return {
        id: a.id, providerId: a.providerId, provider: p ? p.name : '',
        label: a.label, connection: a.connection, oauthOwner: a.oauthOwner,
        state: setupStateOf(a.id),
        actions: a.oauthOwner
          ? [{ id: 'open_settings', label: 'Open Provider Settings' }]
          : (setupStateOf(a.id) === 'ready'
            ? []
            : [{ id: 'open_settings', label: 'Open Provider Settings' }])
      };
    });
  }

  function models(accountId) {
    var out = [];
    for (var i = 0; i < MODELS.length; i++) {
      var m = MODELS[i];
      if (accountId && m.accountId !== accountId) continue;
      var a = accountRecord(m.accountId);
      out.push({
        id: m.accountId + '/' + m.name,
        name: m.name,
        accountId: m.accountId,
        accountLabel: a ? a.label : '',
        providerId: a ? a.providerId : '',
        capabilities: {
          context: m.capabilities.context,
          fast: m.fast,
          vision: m.capabilities.vision,
          video: m.capabilities.video
        },
        /* Three compact facts, in the order the picker prints them. */
        facts: factsOf(m),
        available: m.available && setupStateOf(m.accountId) === 'ready',
        disabledReason: m.available && setupStateOf(m.accountId) !== 'ready'
          ? setupReason(setupStateOf(m.accountId))
          : m.disabledReason
      });
    }
    return out;
  }

  function factsOf(m) {
    var f = [m.capabilities.context];
    if (m.fast) f.push('Fast');
    if (m.capabilities.vision) f.push('Vision');
    return f.slice(0, 3);
  }

  /* One sentence per setup literal. These are the strings the composer's `setup-required` state and
   * the Route popup footer print verbatim, so they live in exactly one place. */
  var SETUP_REASONS = {
    ready: 'Ready',
    cli_missing: 'The command line tool for this account is not installed',
    signin_required: 'This account needs to be signed in again',
    key_required: 'This account needs an API key',
    usage_unavailable: 'Usage reporting is unavailable for this account',
    model_unavailable: 'This model is not being served on this account right now',
    update_required: 'This account needs an update before it can be used',
    install_required: 'This provider needs to be installed',
    update_available: 'An update is available for this provider',
    update_scheduled: 'An update is scheduled for this provider',
    waiting_for_work: 'Waiting for work to finish before updating',
    verifying: 'Verifying the installed provider',
    update_failed: 'The last update failed',
    needs_repair: 'This provider needs repair'
  };

  function setupReason(stateLiteral) {
    return SETUP_REASONS[stateLiteral] || SETUP_REASONS.needs_repair;
  }

  function modelRecord(accountId, name) {
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].accountId === accountId && MODELS[i].name === name) return MODELS[i];
    }
    /* Called with a bare model name (the store's `session.defaults.model` is a name, not a route
     * id), so fall back to the first account that serves it. */
    for (var j = 0; j < MODELS.length; j++) if (MODELS[j].name === name) return MODELS[j];
    return null;
  }

  /* modelId may be either a route id (`acct-x/Model`) or a bare model name. Both appear: the picker
   * has the route id, the store's defaults have the name. */
  function splitModelId(modelId) {
    var s = String(modelId || '');
    var i = s.indexOf('/');
    if (i < 0) return { accountId: null, name: s };
    return { accountId: s.slice(0, i), name: s.slice(i + 1) };
  }

  function routeOf(threadId) {
    if (!store) return { provider: '', account: '', model: '', effort: null, speed: 'normal' };
    var account = store.runtime(threadId, 'account');
    var acct = accountRecord(account);
    var p = acct ? providerById(acct.providerId) : null;
    return {
      provider: p ? p.name : store.runtime(threadId, 'provider'),
      accountId: acct ? acct.id : null,
      account: acct ? acct.label : account,
      model: store.runtime(threadId, 'model'),
      effort: store.runtime(threadId, 'effort'),
      speed: store.runtime(threadId, 'speed')
    };
  }

  /* setRoute(threadId, patch) -> { ok, warning }
   *
   * Every field is written through setRuntime, so the change applies to THIS thread and future
   * turns only. The warning is raised BEFORE the caller can act on the new route: PMXApprovals owns
   * the record and its four actions (Cancel / Branch / Switch / Details); this module only supplies
   * the consequence classes and the verbatim copy. */
  function setRoute(threadId, patch) {
    if (!store || !patch) return { ok: false, warning: null };

    var before = routeOf(threadId);
    var fromAcct = accountRecord(before.account);

    var nextAccountId = patch.accountId || (patch.account ? (accountRecord(patch.account) || {}).id : null);
    var toAcct = nextAccountId ? accountRecord(nextAccountId) : fromAcct;

    var nextName = patch.model;
    if (nextName && String(nextName).indexOf('/') >= 0) {
      var split = splitModelId(nextName);
      nextName = split.name;
      if (split.accountId) toAcct = accountRecord(split.accountId) || toAcct;
    }

    var warning = null;
    var classes = consequencesOf(fromAcct, toAcct);
    if (classes.length && global.PMXApprovals && global.PMXApprovals.raise) {
      warning = global.PMXApprovals.raise(threadId, {
        kind: 'warning',
        severity: 'material',
        cls: classes,
        actions: [
          { id: 'cancel', label: 'Cancel' },
          { id: 'branch', label: 'Branch' },
          { id: 'switch', label: 'Switch', primary: true },
          { id: 'details', label: 'Details' }
        ],
        details: {
          commands: [], files: [], servers: [],
          domains: toAcct ? [(providerById(toAcct.providerId) || {}).name || ''] : [],
          persistence: 'This thread and its future turns',
          saferAlternative: 'Branch the thread so the current conversation keeps its cache',
          receipts: []
        }
      });
    }

    if (toAcct) {
      store.setRuntime(threadId, 'account', toAcct.label);
      var tp = providerById(toAcct.providerId);
      if (tp) store.setRuntime(threadId, 'provider', tp.name);
    }
    if (nextName) {
      store.setRuntime(threadId, 'model', nextName);
      /* A model without an effort axis must not keep a stale effort value, or the collapsed
       * selector would print `GPT-5.6 Mini · High` for an axis that does not exist. */
      var rec = modelRecord(toAcct ? toAcct.id : null, nextName);
      if (rec && !rec.effortLevels) store.setRuntime(threadId, 'effort', null);
      if (rec && !rec.fast && store.runtime(threadId, 'speed') === 'fast') {
        store.setRuntime(threadId, 'speed', 'normal');
      }
    }
    if (patch.effort !== undefined) store.setRuntime(threadId, 'effort', patch.effort);
    if (patch.speed !== undefined) store.setRuntime(threadId, 'speed', patch.speed);
    if (patch.persona !== undefined) store.setRuntime(threadId, 'persona', patch.persona);

    noteUse(threadId);
    /* Any model change can invalidate an attachment resolution (a route that cannot read video
     * turns a native video into an alternate-route offer), so the resolver is told immediately
     * rather than on the next render. */
    if ((nextName || toAcct) && global.PMXAttach && global.PMXAttach.reevaluate) {
      global.PMXAttach.reevaluate(threadId);
    }
    return { ok: true, warning: warning };
  }

  function effort(modelId) {
    var s = splitModelId(modelId);
    var rec = modelRecord(s.accountId, s.name);
    if (!rec || !rec.effortLevels) return null;
    return rec.effortLevels.slice();
  }

  function supportsFast(modelId) {
    var s = splitModelId(modelId);
    var rec = modelRecord(s.accountId, s.name);
    return !!(rec && rec.fast);
  }

  /* effective(threadId) -> { requested, effective, differs, reason }
   *
   * The selector prints `<requested> → <effective>` when these diverge, so the divergence has to be
   * computed from the same catalog the picker read, not from a separate availability check. */
  function effective(threadId) {
    var requested = routeOf(threadId);
    var acct = accountRecord(requested.account);
    var eff = {
      provider: requested.provider, accountId: requested.accountId, account: requested.account,
      model: requested.model, effort: requested.effort, speed: requested.speed
    };
    var reason = null;

    var rec = acct ? modelRecord(acct.id, requested.model) : null;
    var setupState = acct ? setupStateOf(acct.id) : 'needs_repair';

    if (!rec) {
      reason = 'That model is not offered on ' + (requested.account || 'this account') + '.';
    } else if (!rec.available || setupState !== 'ready') {
      reason = rec.available
        ? setupReason(setupState) + '.'
        : (rec.disabledReason ? rec.disabledReason + '.' : 'That route is unavailable.');
    }

    if (reason) {
      var fallback = firstAvailable(acct ? acct.id : null);
      if (fallback) {
        eff.accountId = fallback.accountId;
        eff.account = fallback.accountLabel;
        eff.model = fallback.name;
        var fa = accountRecord(fallback.accountId);
        var fp = fa ? providerById(fa.providerId) : null;
        eff.provider = fp ? fp.name : eff.provider;
      }
    }

    var differs = eff.model !== requested.model || eff.account !== requested.account;
    return { requested: requested, effective: eff, differs: differs, reason: differs ? reason : null };
  }

  /* Prefer another model on the SAME account: keeping the credential is a smaller surprise than
   * silently moving the conversation to a different provider. */
  function firstAvailable(preferredAccountId) {
    var list = models(null);
    var i;
    if (preferredAccountId) {
      for (i = 0; i < list.length; i++) if (list[i].accountId === preferredAccountId && list[i].available) return list[i];
    }
    for (i = 0; i < list.length; i++) if (list[i].available) return list[i];
    return null;
  }

  function favorites() {
    if (!store) return { models: [], accounts: [] };
    var f = store.get('session.favorites') || {};
    return { models: (f.models || []).slice(), accounts: (f.accounts || []).slice() };
  }

  function toggleFavorite(kind, id) {
    if (!store || (kind !== 'models' && kind !== 'accounts')) return false;
    var f = store.get('session.favorites') || { models: [], accounts: [] };
    var list = (f[kind] || []).slice();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    f[kind] = list;
    store.set('session.favorites', f);
    return true;
  }

  function recents() {
    if (!store) return { models: [], accounts: [] };
    var r = store.get('session.recents') || {};
    return { models: (r.models || []).slice(), accounts: (r.accounts || []).slice() };
  }

  /* Recents are OBSERVED, favorites are CHOSEN — two groups in the picker, two store slices. Most
   * recent first, no duplicates, capped, so the group never grows into a second full catalog. */
  function noteUse(threadId) {
    if (!store) return false;
    var rt = routeOf(threadId);
    var r = store.get('session.recents') || { models: [], accounts: [] };
    r.models = pushRecent(r.models, (rt.accountId || '') + '/' + rt.model);
    r.accounts = pushRecent(r.accounts, rt.account);
    store.set('session.recents', r);
    return true;
  }

  function pushRecent(list, value) {
    if (!value) return (list || []).slice();
    var out = (list || []).slice();
    var i = out.indexOf(value);
    if (i >= 0) out.splice(i, 1);
    out.unshift(value);
    return out.slice(0, RECENTS_CAP);
  }

  function setupStateOf(accountId) {
    var a = accountRecord(accountId);
    if (!a) return 'needs_repair';
    if (!store) return a.state;
    var setup = store.get('session.providerSetup') || {};
    return setup[a.id] || a.state;
  }

  function setSetupState(accountId, stateLiteral) {
    var a = accountRecord(accountId);
    if (!store || !a || !SETUP_REASONS[stateLiteral]) return false;
    var setup = store.get('session.providerSetup') || {};
    setup[a.id] = stateLiteral;
    store.set('session.providerSetup', setup);
    return true;
  }

  /* settingsTarget(accountId) -> { label, returnContext, destination, reason }
   *
   * `returnContext` is what makes this "the exact setup destination" rather than a settings link:
   * the caller carries it so the user lands back on this thread, with this route selected, after the
   * account is repaired. */
  function settingsTarget(accountId) {
    var a = accountRecord(accountId);
    var stateLiteral = setupStateOf(accountId);
    return {
      label: 'Open Provider Settings',
      destination: a ? ('Provider settings · ' + a.label) : 'Provider settings',
      reason: setupReason(stateLiteral),
      returnContext: {
        surface: 'chat',
        accountId: a ? a.id : null,
        account: a ? a.label : null,
        returnLabel: 'Back to this conversation'
      }
    };
  }

  /* The two literals the picker needs for a Speed submenu it must not render as three greyed rows.
   * Exposed so the copy lives with the capability rather than in the renderer. */
  var FAST_UNAVAILABLE_LINE = 'Fast is not available on this route';

  var api = {
    bind: bind,
    providers: providers,
    accounts: accounts,
    models: models,
    routeOf: routeOf,
    setRoute: setRoute,
    effort: effort,
    supportsFast: supportsFast,
    effective: effective,
    favorites: favorites,
    toggleFavorite: toggleFavorite,
    recents: recents,
    noteUse: noteUse,
    setupStateOf: setupStateOf,
    setSetupState: setSetupState,
    settingsTarget: settingsTarget,
    setupReason: setupReason,
    SETUP_STATES: (function () { var k = []; for (var n in SETUP_REASONS) if (Object.prototype.hasOwnProperty.call(SETUP_REASONS, n)) k.push(n); return k; })(),
    FAST_UNAVAILABLE_LINE: FAST_UNAVAILABLE_LINE
  };

  global.PMXRoute = api;
})(window);
