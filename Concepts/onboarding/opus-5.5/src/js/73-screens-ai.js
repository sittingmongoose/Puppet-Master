/* Chapter 4 — AI [provider_setup -> free_models_setup], only after the Project exists. Accounts and plans, never
   adapters: detection is bounded, cached per work computer (by its id, never its name) and runs there; each provider
   row offers its own way in — Install (only where a vendor program is required), Sign In, Enter API Key, a choice of
   two ways (Codex: ChatGPT or an OpenAI API key; Cursor: a key or its browser sign-in), or a server profile (OpenCode)
   — and an account is Ready only once it is checked and has what it needs (Multi-Account §9.3: Logged in is not Ready).
   Steps that need a real service (a key, an address, a code) carry the demo's hint with values that work and fail.
   Every connected account is its own record with a stable id, the identity it reports and the computer it is kept on,
   so a second account of one provider, or the wrong one, can be added or removed (provider-login audit P08). Skip is
   allowed and says what it limits; Set Up Free Models is offered either way, and a usable free route counts as an AI
   (P18). What is set up goes to the app at the end (O55.handoff part 'accounts' and 'free_routes', P13). */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const PROV = () => O55.fixtures.PROVIDERS;
  const prov = (id) => PROV().find((x) => x.id === id);
  /* the computer that does the work (O55.handoff's, the one Server/Connect decided); its id keys detection and accounts */
  function host(S) {
    const h = O55.handoff && O55.handoff.host ? O55.handoff.host(S) : null;
    if (h && h.name) return { id: h.id || 'host:' + U.slug(h.name), name: h.name, role: h.role };
    const d = md(S);
    return d.server_mode === 'this_device' ? { id: S.env.here.id, name: T('where.this.title'), role: 'this_device' } : { id: d.server_ref || 'host:' + U.slug(O55.project.serverName(S)), name: O55.project.serverName(S), role: d.server_mode };
  }
  const onServer = (S) => host(S).role !== 'this_device';
  const hostName = (S) => (onServer(S) ? host(S).name : T('where.this.title').toLowerCase());
  /* where a key or password is kept: the keychain on the computer that does the work */
  const keychain = (S) => (onServer(S) ? T('ai.keychainOn', { host: host(S).name }) : T('ai.keychainHere'));
  const pname = (p) => O55.tx('ai.names')[p.id] || p.name;
  /* Each provider's mark: its initial in its hue; under NieR Mode, where hues give way to ink, a two-letter code (the
     hue was the only thing telling Claude, ChatGPT and Cursor apart). Fixed per provider so no two codes meet. */
  const MONO = { claude: 'CL', codex: 'GP', antigravity: 'AG', cursor: 'CU', grok: 'GK', muse: 'MU', copilot: 'CP', 'qwen-coding': 'QC', 'qwen-token': 'QT',
    zai: 'ZA', kimi: 'KM', minimax: 'MM', 'opencode-go': 'OG', 'opencode-zen': 'OZ', 'opencode-runtime': 'OC', 'anthropic-api': 'AN', 'gemini-api': 'GM', vertex: 'VX',
    'xai-api': 'XA', 'meta-api': 'ME' };
  const mono = (p) => MONO[p.id] || String(p.name || p.id).replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
  const DETECT_PHASES = [{ key: 'likely', ms: 900 }, { key: 'copied', ms: 500 }];
  const DETECT_FOUND = { done: 'found', intensity: 0.55 };
  const DETECT_QUIET = { done: 'phase', intensity: 0.55 };
  const detKey = (S) => 'detect:' + host(S).id;
  /* this computer has no connection: the fixture's own (where.check.offline), or the one-shot drop of the aiOffline situation */
  const offlineNow = (S) => !S.env.here.internet || O55.fixtures.offlineOnce(S.env);

  /* ------------------------------------------------------------------ session records
     sess.ai.accounts[providerId]: that provider row's setup in progress (its state, the way chosen, attempts); the
     scenes and the scenario checks read its state. sess.ai.list: the connected accounts. Neither holds a key, a code
     or a password: a key is read from its field when it is checked and the field is cleared. */
  function A(S) {
    const a = S.sess.ai;
    a.accounts = a.accounts || {}; a.list = a.list || []; a.freeRoutes = a.freeRoutes || {}; a.freeRows = a.freeRows || {}; a.freeAccounts = a.freeAccounts || {};
    if (!a.v2) {
      /* a session saved before accounts had their own records: each Ready provider becomes one account here */
      a.v2 = true;
      Object.keys(a.accounts).forEach((id) => { const r = a.accounts[id]; if (r && r.state === 'ready' && prov(id)) a.list.push(record(S, prov(id), { via: r.via || 'detected' })); });
    }
    return a;
  }
  const R = (S, id) => (A(S).accounts[id] = A(S).accounts[id] || {});
  /* the way in a row is using: the provider's own, or its second way (alt) once chosen */
  const way = (p, r) => (r && r.method === 'alt' && p.alt ? Object.assign({}, p, p.alt) : p);
  const accts = (S, p) => A(S).list.filter((e) => e.provider === p.id && e.host === host(S).id && e.state === 'ready');
  const readyIds = (S) => PROV().filter((p) => accts(S, p).length).map((p) => p.id);
  const freeReady = (S) => O55.fixtures.FREE_ROUTES.filter((r) => !r.retired && A(S).freeRoutes[r.id] === 'ready').length;

  function record(S, p, o) {
    const a = S.sess.ai, h = host(S), w = way(p, o.row);
    a.seq = (a.seq || 0) + 1;
    const same = (a.list || []).filter((e) => e.provider === p.id && e.method === w.auth && (e.family || null) === (w.family || null)).length;
    return { id: 'acct-' + p.id + '-' + a.seq, provider: p.id, settings: p.settings, method: w.auth, family: w.family || null, product: w.product,
      who: o.who || null, plan: o.plan || null, n: same + 1, bill: w.bill, custody: w.custody || p.custody, host: h.id, hostName: h.name, hostRole: h.role,
      workspace: o.workspace || null, entity: o.entity || null, mode: o.mode || null, endpoint: o.endpoint || null,
      via: o.via, at: new Date().toISOString(), state: 'ready' };
  }
  function addAccount(S, p, o) {
    const r = R(S, p.id), e = record(S, p, Object.assign({ row: r }, o));
    A(S).list.push(e);
    Object.assign(r, { state: 'ready', adding: false, manage: false, dup: null, removing: null, remote: null, ctx: null });
    S.save(); O55.ui.refresh();
    O55.ui.charm(S.root.querySelector(`[data-key="pv-${p.id}"]`), pname(p), 'spark');
    return e;
  }
  /* what this fixture's sign-in reports: the next of the provider's accounts (a third try is the first one again, so
     signing in twice with the same account can be seen) */
  function nextWho(S, p) { const r = R(S, p.id), list = p.who || []; const who = list.length ? list[(r.signins || 0) % list.length] : null; r.signins = (r.signins || 0) + 1; return who; }

  /* What the work computer already has: this computer's providers, or the Server's ready accounts. */
  function detected(S, p) {
    if (onServer(S)) {
      const srv = O55.connect && O55.connect.allServers(S).find((x) => x.id === md(S).server_ref);
      const acc = srv && srv.accounts.find((a) => a.provider === p.id);
      return acc ? { installed: true, signedIn: !!acc.ready, account: acc.who || acc.label, plan: acc.plan || null } : null;
    }
    return S.env.here.providers[p.id] || null;
  }
  function copiedFrom(S) {
    const d = md(S); if (d.settings_transfer.mode !== 'copy_from_project') return null;
    const src = S.env.here.projects.find((x) => x.id === d.settings_transfer.source_project_id);
    return src ? { name: src.name, providers: src.providers || [] } : null;
  }
  /* The short list: what the person asked for (I don't have any of these), copied routes, then what is found here and
     the likely products (at most four rows, more when more are Ready). */
  function shortlist(S) {
    const cp = copiedFrom(S), ids = [];
    (A(S).wanted || []).forEach((id) => ids.includes(id) || ids.push(id));
    (cp ? cp.providers : []).forEach((id) => ids.includes(id) || ids.push(id));
    PROV().filter((p) => detected(S, p)).forEach((p) => ids.includes(p.id) || ids.push(p.id));
    PROV().filter((p) => p.likely).sort((a, b) => a.likely - b.likely).forEach((p) => ids.includes(p.id) || ids.push(p.id));
    readyIds(S).forEach((id) => ids.includes(id) || ids.push(id));
    return ids.slice(0, Math.max(4, readyIds(S).length)).map(prov).filter(Boolean);
  }
  /* Row state: what the person is doing, then their accounts, then detection (cached per computer), then the way in. */
  function state(S, p) {
    const r = A(S).accounts[p.id];
    if (r && r.state && r.state !== 'ready') return r.state;
    if (accts(S, p).length) return 'ready';
    const det = F.state(S, detKey(S));
    if (!det || det.state !== 'done') return 'checking';
    if (p.auth === 'server') return 'server';
    if (p.alt && !(r && r.method)) return 'choose';
    const w = way(p, r), d = detected(S, p);
    if (d && d.installed && d.expired && !(r && r.attempt)) return 'expired';
    if (w.cli && !installed(S, p, r)) return 'install';
    return w.auth === 'key' ? 'key' : 'signin';
  }
  const installed = (S, p, r) => (r && r.method === 'alt' ? !!(r && r.altInstalled) : !!((detected(S, p) || {}).installed || (r && r.installed)));
  function autoReady(S) {
    /* verified credentials connect automatically — no Connect button (packet 03); one the person removed stays removed */
    PROV().forEach((p) => {
      const d = detected(S, p), r = R(S, p.id), h = host(S).id;
      if (!d || !d.installed || !d.signedIn || (r.dismissed || []).includes(h) || A(S).list.some((e) => e.provider === p.id && e.host === h && e.via === 'detected')) return;
      A(S).list.push(record(S, p, { via: 'detected', who: d.account || null, plan: d.plan || null }));
      r.state = 'ready'; r.installed = true;
    });
    S.save();
  }
  function onDetect(S) { autoReady(S); O55.ui.refresh(); }

  /* ------------------------------------------------------------------ what a row says */
  /* an account's name: who it is; a key has none, so its number (or, for a provider's second way, which key it is) */
  const accLabel = (e) => e.who || (e.method === 'server' ? T('ai.acct.server') : e.family === 'api_key' && e.n === 1 ? T('ai.acct.altKey', { product: e.product }) : T('ai.acct.key', { n: e.n || 1 }));
  function billLine(S, e) {
    const extra = [e.workspace || '', e.entity ? T('ai.ctx.billing.via', { who: e.entity }) : ''].filter(Boolean);
    let b;
    if (e.method === 'server') b = e.mode === 'attached' ? T('ai.bill.attached', { address: e.endpoint || '' }) : T('ai.bill.managed', { host: e.hostRole === 'this_device' ? T('where.this.title').toLowerCase() : e.hostName });
    else if (e.plan) b = e.plan;
    else if (e.bill === 'use') b = (prov(e.provider) || {}).freeLimits ? e.product : T('ai.bill.use', { product: e.product });
    else b = T('ai.bill.plan', { product: e.product });
    return [b].concat(extra).join(' · ');
  }
  function readyMeta(S, p) {
    const list = accts(S, p);
    if (list.length === 1) return accLabel(list[0]) + ' · ' + billLine(S, list[0]);
    return T('ai.acct.many', { n: list.length }) + ': ' + list.map(accLabel).join(', ');
  }
  const btnIn = (label, act, arg, kind, o) => O55.ui.btn(Object.assign({ label, do: act, arg, cls: 'o55-small', tip: false }, o || {}), kind === 'primary' ? 'o55-primary' : 'o55-secondary');

  /* the key field of a provider (or of a Free Models route's own provider): what kind of key, where it is made, where
     it is kept; a refused key says what to check */
  /* the demo's hint (O55.flow.hint, concept only): values that take each branch, filled as typing does */
  const DEMO_KEY = 'demo-key-0000-1111-2222', DEMO_BAD = 'short-key', DEMO_REVOKED = 'demo-key-revoked-0000';
  /* the fixture's answer to a key: no connection, too short to be a key, one the vendor revoked (or that expired), or works */
  const keyVerdict = (v, offline) => (offline ? 'offline' : v.length < 12 ? 'key_rejected' : /revoked/i.test(v) ? 'key_revoked' : null);
  const hint = (id, items, when) => (F.hint ? F.hint(id, items, { when }) : '');
  function keyArea(S, o) {
    const ks = F.state(S, o.op), failed = ks && ks.state === 'failed';
    const why = failed ? (ks.code === 'offline' ? T('ai.offline') : ks.code === 'key_revoked' ? T('ai.keyRevoked') : T('ai.keyBad', { name: o.name })) : '';
    let out = C.field({ bind: o.bind, id: 'o55f-' + o.bind.replace(':', '-'), type: 'password', protected: true, label: T('ai.keyLabel', { name: o.name }), value: '',
      hint: T('ai.keyHint', { where: keychain(S) }), error: why, invalid: failed, tip: 'field:key' });
    out += hint('key:' + o.key, [{ label: DEMO_KEY, outcome: 'works', fills: [[o.bind, DEMO_KEY]] }, { label: DEMO_BAD, outcome: 'refused', fills: [[o.bind, DEMO_BAD]] }, { label: DEMO_REVOKED, outcome: 'revoked', fills: [[o.bind, DEMO_REVOKED]] }], !o.typed && !o.checking);
    if (o.more) out += o.more;
    out += `<div class="o55-inline" data-key="kb-${U.esc(o.key)}">` + btnIn(T('ai.verify'), o.check, o.arg, 'secondary', { disabled: !o.typed || o.checking, reason: T('ai.keyLabel', { name: o.name }) })
      + (o.from ? C.link(T('ai.keyFrom', { name: o.from.name }), o.fromDo, o.arg, { tip: false }) : '') + (o.cancel ? C.link(T('ai.cancel'), o.cancel, o.arg, { tip: false }) : '') + '</div>';
    return out;
  }

  function rowHtml(S, p) {
    const st = state(S, p), r = A(S).accounts[p.id] || {}, d = detected(S, p), cp = copiedFrom(S), w = way(p, r);
    const fromCopy = cp && cp.providers.includes(p.id);
    let meta = T('ai.pairs.' + p.id) !== 'ai.pairs.' + p.id ? T('ai.pairs.' + p.id) : p.product;
    let pill = null, action = null, extra = '';
    const ex = (k, html) => `<div class="o55-rowextra" data-key="${k}-${p.id}">${html}</div>`;
    if (st === 'checking') pill = ['wait', T('ai.checking')];
    if (st === 'ready') {
      pill = ['ready', T('ai.ready')]; meta = readyMeta(S, p); action = { label: T('ai.manage'), do: 'manage', arg: p.id };
      if (r.dup) extra = ex('dup', C.note(T('ai.dup', { who: r.dup }), 'info'));
      if (r.manage) extra = ex('mg', manageHtml(S, p, r));
    }
    if (st === 'choose') { pill = ['needs', T('ai.notReady')]; action = { label: T('ai.connect'), do: 'choose', arg: p.id }; }
    if (st === 'choosing') extra = ex('way', C.cards('way', [{ v: p.id + '|main', title: T('ai.way.' + p.id + '.main'), sub: T('ai.way.' + p.id + '.mainSub') }, { v: p.id + '|alt', title: T('ai.way.' + p.id + '.alt'), sub: T('ai.way.' + p.id + '.altSub') }], null, { label: pname(p) })
      + (r.adding ? `<div class="o55-sublinks">${C.link(T('ai.cancel'), 'cancelAdd', p.id, { tip: false })}</div>` : ''));
    if (st === 'choosing') { pill = ['needs', T('ai.notReady')]; }
    if (st === 'install') { pill = ['needs', T('ai.notInstalled')]; action = { label: onServer(S) ? T('ai.installOn', { host: host(S).name }) : T('ai.install'), do: 'install', arg: p.id }; }
    if (st === 'expired') { pill = ['fail', T('ai.expired.title')]; meta = T('ai.expired.body', { who: d.account || pname(p) }); action = { label: T('ai.signinFail.retry'), do: 'signin', arg: p.id }; }
    if (st === 'signin') { pill = ['needs', T('ai.notReady')]; action = { label: T('ai.signIn'), do: 'signin', arg: p.id }; if (r.adding) extra = ex('add', `<div class="o55-sublinks">${C.link(T('ai.cancel'), 'cancelAdd', p.id, { tip: false })}</div>`); }
    if (st === 'key') { action = { label: T('ai.key'), do: 'key', arg: p.id }; }
    if (st === 'server') { pill = ['needs', T('ai.notSetUp')]; meta = T('ai.pairs.opencode-runtime'); action = { label: T('ai.setUp'), do: 'server', arg: p.id }; }
    if (fromCopy && st !== 'ready') meta = T('ai.unavailable', { project: cp.name, host: hostName(S) });
    else if (fromCopy) meta = T('ai.from', { project: cp.name }) + ' · ' + meta;
    else if (d && d.installed && !['ready', 'server', 'expired'].includes(st)) meta = (onServer(S) ? T('ai.foundOn', { host: host(S).name }) : T('ai.found')) + ' · ' + meta;
    /* inline states */
    if (r.confirmInstall) extra = ex('ask', `<span class="o55-labq">${U.esc(T('ai.installAsk', { name: pname(p), host: hostName(S), vendor: p.vendor }))}${O55.tips.q('group:install')}</span>${O55.ui.btn({ label: T('ai.installGo'), do: 'installGo', arg: p.id, cls: 'o55-small', tip: false, by: 'group:install' }, 'o55-primary')}${O55.tips.explainer('group:install')}`);
    if (st === 'installing') { pill = ['wait', T('chrome.working')]; extra = ex('ph', F.phases(S, 'install:' + p.id + (r.method === 'alt' ? ':alt' : ''), ['download', 'install', 'verify'], { download: T('ai.installPhases.download', { vendor: p.vendor }), install: T('ai.installPhases.install'), verify: T('ai.installPhases.verify') })); }
    if (st === 'signingIn') {
      pill = ['wait', T('ai.signinWaitPill')]; meta = onServer(S) ? T('ai.signinWaitOn', { host: host(S).name }) : T('ai.signinWait');
      extra = ex('wait', remoteHtml(S, p, r));
    }
    /* a browser sign-in that did not finish (the page was closed, or never completed): nothing connected; ask again */
    if (st === 'signinFailed') { pill = ['fail', T('ai.signinFail.title')]; meta = r.failCode === 'offline' ? T('ai.offline') : T('ai.signinFail.body', { vendor: p.vendor }); action = { label: T('ai.signinFail.retry'), do: 'signin', arg: p.id }; }
    if (st === 'keyEntry' || st === 'keyChecking') {
      pill = st === 'keyChecking' ? ['wait', T('ai.checking')] : null;
      const project = p.context === 'project' ? C.field({ bind: 'project:' + p.id, id: 'o55f-project-' + p.id, label: T('ai.ctx.project.label'), value: r.project || '', placeholder: 'my-project', hint: T('ai.ctx.project.hint'), tip: 'field:project' }) : '';
      extra = ex('key', keyArea(S, { bind: 'key:' + p.id, key: p.id, arg: p.id, op: 'key:' + p.id + ':' + (r.attempt || 0), name: w.auth === 'key' && r.method === 'alt' ? w.product : pname(p),
        typed: r.keyTyped, checking: st === 'keyChecking', check: 'keyCheck', from: w.keyFrom || p.keyFrom, fromDo: 'keyFrom', more: project, cancel: r.adding ? 'cancelAdd' : null }));
    }
    if (st === 'context' || st === 'contextChecking') { pill = st === 'contextChecking' ? ['wait', T('ai.checking')] : ['needs', T('ai.needsChoice')]; extra = ex('ctx', contextHtml(S, p, r)); }
    if (st === 'serverPick') { pill = ['needs', T('ai.notSetUp')]; meta = T('ai.pairs.opencode-runtime'); extra = ex('srv', serverHtml(S, p, r)); }
    if (st === 'launching' || st === 'connecting') {
      pill = ['wait', T('chrome.working')];
      const k = 'oc:' + p.id + ':' + (r.attempt || 0), order = st === 'launching' ? ['launch', 'health', 'discover'] : ['connect', 'health', 'discover'];
      extra = ex('ph', F.phases(S, k, order, { launch: T('ai.oc.phase.launch', { host: hostName(S) }), connect: T('ai.oc.phase.connect'), health: T('ai.oc.phase.health'), discover: T('ai.oc.phase.discover') }));
    }
    if (st === 'connectFailed') { pill = ['fail', T('ai.oc.failTitle')]; meta = T('ai.oc.fail'); action = { label: T('chrome.tryAgain'), do: 'server', arg: p.id }; }
    const lead = `<span class="o55-plogo" style="--plh:${U.hash(p.vendor) % 360}" aria-hidden="true"><span class="o55-plogo-l">${U.esc(pname(p).slice(0, 1))}</span><span class="o55-plogo-m">${U.esc(mono(p))}</span></span>`;
    return `<div class="o55-provider" data-key="pv-${p.id}" data-state="${st}">` + C.row({ key: p.id, lead, title: pname(p), meta, state: pill, action, tip: 'provider:' + p.id }) + extra + '</div>';
  }

  /* a Ready provider's accounts: each one, Remove it (wrong account), or add another of the same provider */
  function manageHtml(S, p, r) {
    let out = accts(S, p).map((e) => {
      if (r.removing === e.id) {
        return `<div class="o55-inline" data-key="rm-${U.esc(e.id)}"><span class="o55-hint">${U.esc(T('ai.removeAsk', { who: accLabel(e), vendor: p.vendor }))}</span>`
          + btnIn(T('ai.removeGo'), 'removeGo', e.id, 'primary') + C.link(T('ai.keep'), 'removeNo', p.id, { tip: false }) + '</div>';
      }
      return `<div class="o55-inline" data-key="ac-${U.esc(e.id)}"><span class="o55-hint">${U.esc(accLabel(e) + ' · ' + billLine(S, e))}</span>${C.link(T('ai.remove'), 'remove', e.id, { tip: false })}</div>`;
    }).join('');
    if (p.auth !== 'server') out += `<div class="o55-inline" data-key="add-${p.id}">${btnIn(T('ai.addAnother', { name: pname(p) }), 'addAnother', p.id)}</div>`;
    return out;
  }
  /* Browser didn't open? Where the vendor supports it: a device code typed on its page (device), or the code its page
     shows pasted back here (paste); otherwise the sign-in link to copy. Protected input is read from its field once
     and cleared; it is never saved. */
  function remoteHtml(S, p, r) {
    const links = `<div class="o55-sublinks" data-key="nob-${p.id}">${r.remote ? '' : C.link(T('online.signin.noBrowser'), 'noBrowser', p.id, { tip: false })}${C.link(T('ai.cancel'), 'cancelSignin', p.id, { tip: false })}</div>`;
    if (r.remote === 'code') {
      const t = F.countdown(r.codeUntil || Date.now()), url = O55.fixtures.OFFICIAL.device[p.id] || null;
      return `<div class="o55-devicecode" data-key="dc-${p.id}"><span class="o55-hint">${U.esc(url ? T('online.signin.codeLead', { url }) : T('ai.deviceLead', { vendor: p.vendor }))}</span><span class="o55-paircode">${U.esc(r.code || 'WDJB-MJHT')}</span>`
        + `<span class="o55-hint">${U.esc(t.left ? T('chrome.expiresIn', { m: t.m, s: t.s }) : T('connect.pair.expired'))}</span><span class="o55-pairbtns">${F.copyBtn(r.code || 'WDJB-MJHT', 'dcode-' + p.id)}</span></div>` + F.copyNote('dcode-' + p.id) + links;
    }
    if (r.remote === 'paste') {
      const cs = F.state(S, 'code:' + p.id + ':' + (r.attempt || 0)), failed = cs && cs.state === 'failed';
      return `<p class="o55-hint" data-key="pl-${p.id}">${U.esc(T('ai.pasteLead'))}</p>`
        + `<div class="o55-inline" data-key="cl-${p.id}">${btnIn(T('ai.copyLink'), 'copySigninLink', p.id)}</div>`
        + C.field({ bind: 'paste:' + p.id, id: 'o55f-paste-' + p.id, type: 'password', protected: true, label: T('ai.pasteLabel'), value: '', error: failed ? T('ai.pasteBad') : '', invalid: failed, tip: 'field:paste' })
        + hint('paste:' + p.id, [{ label: 'K7QM-4XWD', outcome: 'works', fills: [['paste:' + p.id, 'K7QM-4XWD']] }, { label: '12', outcome: 'refused', fills: [['paste:' + p.id, '12']] }], !r.pasteTyped)
        + `<div class="o55-inline" data-key="pb-${p.id}">${btnIn(T('ai.pasteGo'), 'submitCode', p.id, 'secondary', { disabled: !r.pasteTyped || (cs && cs.state === 'running'), reason: T('ai.pasteLabel') })}</div>` + links;
    }
    return links;
  }
  /* what a signed-in account still needs before it is Ready: whose Copilot plan, which Anthropic workspace */
  function contextHtml(S, p, r) {
    const c = r.ctx || {};
    if (p.context === 'billing') {
      const orgs = (S.env.forges.github && S.env.forges.github.orgs) || [];
      return `<p class="o55-hint" data-key="ctxq-${p.id}">${U.esc(T('ai.ctx.billing.title'))}</p>` + C.cards('entity', [{ v: p.id + '|' + c.who, glyph: 'person', title: T('ai.ctx.billing.me', { who: c.who }) }]
        .concat(orgs.map((o) => ({ v: p.id + '|' + o, glyph: 'globe', title: T('ai.ctx.billing.org', { org: o }) }))), null, { label: T('ai.ctx.billing.title') });
    }
    if (p.context === 'workspace') {
      return `<p class="o55-hint" data-key="ctxq-${p.id}">${U.esc(T('ai.ctx.workspace.title'))}</p>` + C.cards('workspace', (p.workspaces || [T('ai.ctx.workspace.default')]).map((w) => ({ v: p.id + '|' + w, glyph: 'folder', title: w })), null, { label: T('ai.ctx.workspace.title') });
    }
    return '';
  }
  /* OpenCode: Puppet Master runs the server (installing OpenCode with consent where it is missing), or it attaches to
     one the person runs. The server's own username and password are its own, not a model provider's key. */
  function serverHtml(S, p, r) {
    const inst = installed(S, p, r), ok = F.isHttps(r.endpoint) || /^http:\/\/[^\s/?#]+(?::\d+)?\/?$/.test(String(r.endpoint || '').trim());
    const managed = inst ? `<div class="o55-inline">${btnIn(T('ai.oc.start', { host: hostName(S) }), 'ocStart', p.id, 'primary')}</div>`
      : `<span class="o55-labq">${U.esc(T('ai.installAsk', { name: pname(p), host: hostName(S), vendor: p.vendor }))}${O55.tips.q('group:install')}</span>${O55.ui.btn({ label: T('ai.installGo'), do: 'installGo', arg: p.id, cls: 'o55-small', tip: false, by: 'group:install' }, 'o55-primary')}${O55.tips.explainer('group:install')}`;
    const attached = C.field({ bind: 'ocAddr:' + p.id, id: 'o55f-ocaddr', label: T('ai.oc.addr'), value: r.endpoint || '', placeholder: 'http://127.0.0.1:4096', hint: T('ai.oc.addrHint'), tip: 'field:ocAddr' })
      + hint('ocAddr', [{ label: 'http://127.0.0.1:4096', outcome: 'works', fills: [['ocAddr:' + p.id, 'http://127.0.0.1:4096']] }, { label: 'http://192.168.1.99:4096', outcome: 'noAnswer', fills: [['ocAddr:' + p.id, 'http://192.168.1.99:4096']] }], !ok)
      + C.field({ bind: 'ocUser:' + p.id, id: 'o55f-ocuser', label: T('ai.oc.user'), value: r.user || '', placeholder: 'opencode', tip: 'field:ocUser' })
      + C.field({ bind: 'ocPass:' + p.id, id: 'o55f-ocpass', type: 'password', protected: true, label: T('ai.oc.pass'), value: '', hint: T('ai.keyHint', { where: keychain(S) }), tip: 'field:ocPass' })
      + `<div class="o55-inline">${btnIn(T('ai.oc.connect'), 'ocConnect', p.id, 'primary', { disabled: !ok, reason: T('ai.oc.addr') })}</div>`;
    return C.cards('ocMode', [
      { v: 'managed', glyph: 'server', title: T('ai.oc.managed'), sub: T('ai.oc.managedSub', { host: hostName(S) }), under: r.mode === 'managed' ? managed : '' },
      { v: 'attached', glyph: 'link', title: T('ai.oc.attached'), sub: T('ai.oc.attachedSub'), under: r.mode === 'attached' ? attached : '' }
    ], r.mode, { label: pname(p) });
  }

  def('ai', {
    chapter: 'ai', stage: 'provider_setup', charmSlot: 'ai',
    scene: (S) => ({ id: 'power', beat: readyIds(S).length ? 'ready' : 'waiting', params: { n: readyIds(S).length } }),
    enter(S) { S.sess.active = 'main'; },
    eyebrow: () => T('ai.eyebrow'),
    title: () => T('ai.title'),
    lead: () => T('ai.lead'),
    body(S) {
      const a = A(S);
      let out = '';
      /* which computer does what (P11): the AI works on the Server; sign-ins open on this device and are kept there */
      if (onServer(S)) out += `<div class="o55-banner o55-banner-soft" data-key="where">${C.small('server', 18)}<span>${U.esc(T('ai.where', { host: host(S).name }))}</span></div>`;
      out += `<div class="o55-providers" data-key="list">${shortlist(S).map((p) => rowHtml(S, p)).join('')}</div>`;
      out += `<div class="o55-sublinks" data-key="links">${C.link(T('ai.seeAll'), 'all')}${readyIds(S).length ? '' : C.link(T('ai.none'), 'none')}</div>`;
      if (a.skipped && !readyIds(S).length && !freeReady(S)) out += C.note(T('ai.skipNote'), 'warn', 'spark');
      if (readyIds(S).length || a.skipped) {
        out += O55.tips.opt('free', `<button type="button" class="o55-card o55-card-link" data-o55-do="free" data-o55-sound="self" data-pm-hover-exempt="true" data-key="free">${C.glyph('stack')}<span class="o55-cardtext"><span class="o55-cardtitle">${U.esc(T('ai.free.title'))}</span><span class="o55-cardsub">${U.esc(freeReady(S) ? T('ai.free.some', { n: freeReady(S) }) : T('ai.free.sub'))}</span></span><span class="o55-cardarrow" aria-hidden="true">›</span></button>`);
      }
      return out;
    },
    mounted(S) {
      /* bounded detection on the selected work computer, once per computer (cached by its id). refresh() calls mounted
         every time, and a finished check must not scan providers or build a new options object. */
      A(S);
      const key = detKey(S), st = F.state(S, key);
      if (st && st.state === 'done') { tickCode(S); return; }
      const any = !st && PROV().some((p) => detected(S, p));
      F.op(S, key, 'cmd.integration.connection.detect', DETECT_PHASES, { payload: { host_id: host(S).id, host_role: host(S).role, bounded: 4 }, sound: any ? DETECT_FOUND : DETECT_QUIET, onDone: onDetect });
    },
    foot(S) {
      const a = A(S), n = readyIds(S).length;
      if (n || a.skipped) return { back: false, primary: { label: T('chrome.continue'), do: 'next' } };
      return { back: false, secondary: [{ label: T('ai.skip'), do: 'skip', cls: 'o55-ghost' }], primary: { label: T('chrome.continue'), do: 'next', disabled: true, reason: T('ai.skipNote') } };
    },
    do: {
      choose(S, id) { R(S, id).state = 'choosing'; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); },
      way(S, v) {
        const [id, m] = String(v).split('|'), p = prov(id), r = R(S, id);
        r.method = m === 'alt' ? 'alt' : 'main'; r.state = null; S.save();
        const w = way(p, r);
        if (w.cli && !installed(S, p, r)) { r.state = 'install'; r.confirmInstall = true; S.save(); O55.ui.refresh(); return; }
        if (w.auth === 'key') return O55.screens.defs.ai.do.key(S, id);
        return O55.screens.defs.ai.do.signin(S, id);
      },
      install(S, id) { R(S, id).confirmInstall = true; S.save(); O55.ui.refresh(); },
      installGo(S, id) {
        const p = prov(id), r = R(S, id), alt = r.method === 'alt', w = way(p, r);
        Object.assign(r, { confirmInstall: false, state: 'installing' });
        S.save(); O55.ui.refresh(); O55.sound.play('tap');
        F.op(S, 'install:' + id + (alt ? ':alt' : ''), 'cmd.tool_product.install', [{ key: 'download', ms: 1300 }, { key: 'install', ms: 1100 }, { key: 'verify', ms: 700 }], {
          payload: { product: w.cli, host_id: host(S).id, host_role: host(S).role, official: true },
          onDone: () => {
            if (alt) r.altInstalled = true; else r.installed = true;
            /* OpenCode Managed Server: installed, then started on the same computer */
            if (p.auth === 'server') { r.state = 'serverPick'; S.save(); return O55.screens.defs.ai.do.ocStart(S, id); }
            r.state = w.auth === 'key' ? 'key' : 'signin'; S.save(); O55.ui.refresh();
          }
        });
      },
      signin(S, id) {
        const p = prov(id), r = R(S, id), w = way(p, r), h = host(S);
        Object.assign(r, { state: 'signingIn', remote: null, dup: null, manage: false });
        r.attempt = (r.attempt || 0) + 1; S.save();
        O55.official.open(S, { name: p.vendor, url: r.method === 'alt' ? null : O55.fixtures.OFFICIAL.provider[p.id] || null });
        O55.ui.refresh();
        const attempt = r.attempt, offline = offlineNow(S), fails = !offline && O55.fixtures.signinFails(S.env, id);
        r.failCode = null;
        F.op(S, 'signin:' + id + ':' + attempt, 'cmd.auth_profile.sign_in', [{ key: 'browser', ms: offline ? 900 : fails ? 1800 : 2400, fail: () => (offline ? 'offline' : fails ? 'signin_incomplete' : null) }, { key: 'verify', ms: 600 }], {
          quiet: true, sound: { fail: 'warn' },
          payload: { provider_entry_id: p.settings, auth_family: w.family || w.auth, account_ref: null, host_id: h.id, host_role: h.role, client_id: S.env.client.id, return_context: 'onboarding:' + S.sess.screen },
          onDone: () => { if (r.attempt === attempt && r.state === 'signingIn' && !r.remote) signedIn(S, p); },
          onFail: (S2, st) => { if (r.attempt !== attempt || r.state !== 'signingIn') return; r.state = 'signinFailed'; r.failed = true; r.failCode = st && st.code; S.save(); O55.ui.refresh(); }
        });
      },
      /* Cancel a sign-in under way: the wait is dropped (its late result is ignored) and nothing is connected */
      cancelSignin(S, id) {
        const p = prov(id), r = R(S, id);
        O55.owners.dispatch('cmd.auth_profile.cancel', { provider_entry_id: p.settings, operation_ref: 'signin:' + id + ':' + (r.attempt || 0), client_id: S.env.client.id }, S.ctx(), () => ({ ok: true }));
        r.attempt = (r.attempt || 0) + 1; r.remote = null; r.state = accts(S, p).length && !r.adding ? 'ready' : null; S.save(); O55.ui.refresh();
      },
      noBrowser(S, id) {
        const p = prov(id), r = R(S, id);
        if (p.remote === 'device') {
          r.attempt = (r.attempt || 0) + 1; Object.assign(r, { remote: 'code', code: 'WDJB-MJHT', codeUntil: Date.now() + 900000 }); S.save(); O55.ui.refresh(); O55.sound.play('reveal');
          const attempt = r.attempt; tickCode(S);
          F.op(S, 'signin:' + id + ':' + attempt, 'cmd.auth_profile.sign_in', [{ key: 'device', ms: 7000 }, { key: 'verify', ms: 600 }], { quiet: true, sound: { fail: 'warn' },
            payload: { provider_entry_id: p.settings, flow: 'device_code', host_id: host(S).id, client_id: S.env.client.id },
            onDone: () => { if (r.attempt === attempt && r.state === 'signingIn') signedIn(S, p); } });
          return;
        }
        if (p.remote === 'paste') { r.attempt = (r.attempt || 0) + 1; r.remote = 'paste'; r.pasteTyped = false; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); return; }
        O55.screens.defs.ai.do.copySigninLink(S, id);
      },
      copySigninLink(S, id) { const url = O55.fixtures.OFFICIAL.provider[id]; if (url) { U.copyText(url); O55.sound.play('copy'); } O55.ui.toast(url ? T('online.signin.linkCopied', { url: url.replace(/^https:\/\//, '') }) : T('online.signin.linkCopiedNone')); },
      submitCode(S, id) {
        const p = prov(id), r = R(S, id), i = S.root.querySelector('#o55f-paste-' + id), v = i ? i.value.trim() : '';
        if (i) i.value = ''; r.pasteTyped = false; S.save(); O55.ui.refresh();
        const attempt = r.attempt || 0;
        F.op(S, 'code:' + id + ':' + attempt, 'cmd.auth_profile.submit_code', [{ key: 'verify', ms: 900, fail: () => (v.length >= 4 ? null : 'code_rejected') }], { sound: { fail: 'warn' },
          payload: { provider_entry_id: p.settings, protected_input_ref: 'protected:' + id + ':' + attempt, protected_input_persisted: false, client_id: S.env.client.id },
          onDone: () => { if (r.attempt === attempt && r.state === 'signingIn') signedIn(S, p); },
          onFail: () => { F.reset(S, 'code:' + id + ':' + attempt); S.sess.ops['code:' + id + ':' + attempt] = { state: 'failed', phases: [], code: 'code_rejected' }; S.save(); O55.ui.refresh(); } });
      },
      key(S, id) { const r = R(S, id); Object.assign(r, { state: 'keyEntry', manage: false, dup: null }); S.save(); O55.ui.refresh(); O55.sound.play('reveal'); const i = S.root.querySelector('#o55f-key-' + id); if (i) i.focus(); },
      keyFrom(S, id) { const p = prov(id), r = R(S, id), kf = way(p, r).keyFrom || p.keyFrom; if (kf) O55.official.open(S, { kind: 'page', name: kf.name, url: kf.url }); },
      keyCheck(S, id) {
        const p = prov(id), r = R(S, id), w = way(p, r), i = S.root.querySelector('#o55f-key-' + id), v = i ? i.value.trim() : '';
        if (i) i.value = '';
        r.keyTyped = false; r.state = 'keyChecking'; r.attempt = (r.attempt || 0) + 1; S.save(); O55.ui.refresh();
        /* a late result of an older try never overwrites a newer one (pm7-srv's sweep) */
        const offline = offlineNow(S), at = r.attempt, current = () => r.attempt === at && r.state === 'keyChecking';
        F.op(S, 'key:' + id + ':' + r.attempt, 'cmd.integration.connection.test', [{ key: 'verify', ms: 900, fail: () => keyVerdict(v, offline) }], {
          payload: { provider_entry_id: p.settings, auth_family: w.family || 'api_key', method: 'api_key', host_id: host(S).id }, sound: { fail: 'warn' }, /* a refused key is a soft warning under its field */
          onDone: () => {
            if (!current()) return;
            if (p.context === 'workspace' && (p.workspaces || []).length > 1) { r.state = 'context'; r.ctx = { via: 'key' }; S.save(); O55.ui.refresh(); return; }
            addAccount(S, p, { via: 'key', workspace: p.context === 'project' && r.project ? T('ai.ctx.project.named', { project: r.project }) : null });
          },
          onFail: () => { if (!current()) return; r.state = 'keyEntry'; S.save(); O55.ui.refresh(); }
        });
      },
      entity(S, v) { pickContext(S, v, 'entity'); },
      workspace(S, v) { pickContext(S, v, 'workspace'); },
      manage(S, id) { const r = R(S, id); r.manage = !r.manage; r.removing = null; r.dup = null; S.save(); O55.ui.refresh(); },
      remove(S, accId) { const e = A(S).list.find((x) => x.id === accId); if (!e) return; R(S, e.provider).removing = accId; S.save(); O55.ui.refresh(); },
      removeNo(S, id) { R(S, id).removing = null; S.save(); O55.ui.refresh(); },
      removeGo(S, accId) {
        const a = A(S), e = a.list.find((x) => x.id === accId); if (!e) return;
        const r = R(S, e.provider);
        O55.owners.dispatch('cmd.auth_profile.sign_out', { account_ref: e.id, provider_entry_id: e.settings, disposition: 'remove_from_pm_only', host_id: e.host }, S.ctx(), () => ({ ok: true }));
        if (e.via === 'detected') r.dismissed = Array.from(new Set((r.dismissed || []).concat([e.host])));
        a.list = a.list.filter((x) => x.id !== accId);
        r.removing = null;
        /* the last one gone: the row asks again from the start (a provider with two ways asks which) */
        if (!accts(S, prov(e.provider)).length) { r.state = null; r.manage = false; if (prov(e.provider).alt) r.method = undefined; }
        S.save(); O55.ui.refresh(); O55.sound.play('tap');
      },
      addAnother(S, id) {
        const p = prov(id), r = R(S, id);
        Object.assign(r, { adding: true, manage: false, dup: null, removing: null });
        if (p.alt) { r.method = undefined; r.state = 'choosing'; S.save(); O55.ui.refresh(); return; }
        if (p.auth === 'key') return O55.screens.defs.ai.do.key(S, id);
        r.state = 'signin'; S.save(); O55.ui.refresh();
      },
      cancelAdd(S, id) { const p = prov(id), r = R(S, id); Object.assign(r, { adding: false, state: accts(S, p).length ? 'ready' : null, method: accts(S, p).length ? r.method : undefined, keyTyped: false }); S.save(); O55.ui.refresh(); },
      server(S, id) { const r = R(S, id); r.state = 'serverPick'; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); },
      ocMode(S, v) { const r = R(S, 'opencode-runtime'); r.mode = v; S.save(); O55.ui.refresh(); },
      ocStart(S, id) {
        const p = prov(id), r = R(S, id); r.state = 'launching'; r.attempt = (r.attempt || 0) + 1; S.save(); O55.ui.refresh(); O55.sound.play('tap');
        F.op(S, 'oc:' + id + ':' + r.attempt, 'cmd.integration.connection.add', [{ key: 'launch', ms: 1200 }, { key: 'health', ms: 700 }, { key: 'discover', ms: 900 }], {
          payload: { provider_entry_id: p.settings, profile_mode: 'managed_server', host_id: host(S).id },
          onDone: () => { if (r.state === 'launching') addAccount(S, p, { via: 'server', mode: 'managed' }); } });
      },
      ocConnect(S, id) {
        const p = prov(id), r = R(S, id), pass = S.root.querySelector('#o55f-ocpass'), endpoint = String(r.endpoint || '').trim();
        if (pass) pass.value = '';
        r.state = 'connecting'; r.attempt = (r.attempt || 0) + 1; S.save(); O55.ui.refresh(); O55.sound.play('tap');
        /* in this demo an OpenCode server answers on this computer or on a device the fixture knows (Home NAS) */
        let where = ''; try { where = new URL(endpoint).hostname; } catch (_) {}
        const reachable = /^https?:\/\/[^\s/?#]+(?::\d+)?\/?$/.test(endpoint) && !(where !== '127.0.0.1' && where !== 'localhost' && offlineNow(S)) && ['127.0.0.1', 'localhost'].concat(S.env.devices.map((d) => d.address), S.env.pmServers.map((x) => x.address)).includes(where);
        F.op(S, 'oc:' + id + ':' + r.attempt, 'cmd.integration.connection.add', [{ key: 'connect', ms: 1000, fail: () => (reachable ? null : 'unreachable') }, { key: 'health', ms: 700 }, { key: 'discover', ms: 900 }], {
          payload: { provider_entry_id: p.settings, profile_mode: 'attach_existing_server', endpoint_label: endpoint, server_auth: r.user ? 'basic' : 'none' }, sound: { fail: 'warn' },
          onDone: () => { if (r.state === 'connecting') addAccount(S, p, { via: 'server', mode: 'attached', endpoint: endpoint.replace(/\/$/, '') }); },
          onFail: () => { if (r.state === 'connecting') { r.state = 'connectFailed'; S.save(); O55.ui.refresh(); } } });
      },
      all(S) { O55.ui.go('ai-all'); },
      none(S) { O55.ui.go('ai-none'); },
      skip(S) { A(S).skipped = true; S.save(); O55.ui.refresh(); },
      free(S) { O55.ui.go('free'); },
      next(S) { O55.ui.go('ready'); }
    },
    /* a field's input: a key, a pasted code or a server password is only noted as typed; the server's address and
       username are kept (they are not secret) */
    bind: new Proxy({}, { get: (t, key) => (S, v) => {
      const [kind, id] = String(key).split(':'), r = A(S).accounts[id]; if (!r) return;
      if (kind === 'ocAddr' || kind === 'ocUser' || kind === 'project') { r[kind === 'ocAddr' ? 'endpoint' : kind === 'ocUser' ? 'user' : 'project'] = v; S.save(); O55.ui.refresh(); return; }
      const flag = kind === 'paste' ? 'pasteTyped' : kind === 'ocPass' ? 'secretTyped' : 'keyTyped';
      const had = !!r[flag]; r[flag] = v.length > 0; if (had !== r[flag]) { S.save(); O55.ui.refresh(); }
    } }),
    onBack: () => false
  });

  /* a sign-in came back: an account that still needs a choice asks for it; the same account twice is said so */
  function signedIn(S, p) {
    const r = R(S, p.id), w = way(p, r), who = nextWho(S, p);
    r.recovered = !!r.failed; r.failed = false; r.remote = null;
    if (accts(S, p).some((e) => e.who === who && (e.family || null) === (w.family || null))) { Object.assign(r, { state: 'ready', adding: false, dup: who }); S.save(); O55.ui.refresh(); return; }
    if (p.context === 'billing' && ((S.env.forges.github && S.env.forges.github.orgs) || []).length) { r.state = 'context'; r.ctx = { via: 'signin', who }; S.save(); O55.ui.refresh(); return; }
    addAccount(S, p, { via: 'signin', who, plan: w === p ? p.plan || null : null, entity: p.context === 'billing' ? who : null });
  }
  function pickContext(S, v, kind) {
    const [id, choice] = String(v).split('|'), p = prov(id), r = R(S, id), c = r.ctx || {};
    r.state = 'contextChecking'; r.attempt = (r.attempt || 0) + 1; S.save(); O55.ui.refresh();
    F.op(S, 'ctx:' + id + ':' + r.attempt, 'cmd.auth_profile.select', [{ key: 'verify', ms: 700 }], { quiet: true,
      payload: { provider_entry_id: p.settings, selection_kind: kind === 'entity' ? 'billing_entity' : 'workspace', host_id: host(S).id },
      onDone: () => r.state === 'contextChecking' && addAccount(S, p, { via: c.via || 'signin', who: c.who || null, entity: kind === 'entity' ? choice : null, workspace: kind === 'workspace' ? choice : null }) });
  }
  /* the device code's countdown keeps going while its row shows it */
  function tickCode(S) {
    const scr = S.sess.screen, any = () => Object.values(A(S).accounts).some((r) => r && r.state === 'signingIn' && r.remote === 'code');
    if (any()) F.ticker(S, scr, 1000, () => !any());
  }

  /* ------------------------------------------------------------------ all providers (what pays for them) */
  const GROUPS = [['plan', 'subs'], ['use', 'apis'], ['own', 'own']];
  def('ai-all', {
    chapter: 'ai', stage: 'provider_setup',
    scene: (S) => ({ id: 'power', beat: readyIds(S).length ? 'ready' : 'waiting', params: { n: readyIds(S).length } }),
    eyebrow: () => T('ai.eyebrow'),
    title: () => T('ai.allTitle'),
    lead: () => T('ai.allLead'),
    body(S) {
      const q = String(S.sess.ui.aiQ || '').toLowerCase();
      const match = (p) => !q || [pname(p), p.vendor, p.product, p.aka || ''].join(' ').toLowerCase().includes(q);
      let out = C.field({ bind: 'q', label: T('chrome.search'), value: S.sess.ui.aiQ || '', placeholder: T('ai.searchPlaceholder') });
      if (onServer(S)) out += `<div class="o55-banner o55-banner-soft" data-key="where">${C.small('server', 18)}<span>${U.esc(T('ai.where', { host: host(S).name }))}</span></div>`;
      GROUPS.forEach(([bill, k]) => {
        const rows = PROV().filter((p) => p.bill === bill && match(p));
        if (rows.length) out += C.group(T('ai.' + k), `<p class="o55-hint">${U.esc(T('ai.' + k + 'Sub'))}</p>` + rows.map((p) => rowHtml(S, p)).join(''));
      });
      return out;
    },
    mounted(S) { O55.screens.defs.ai.mounted(S); },
    foot: () => ({ primary: { label: T('chrome.done'), do: 'done' } }),
    do: { done(S) { O55.ui.back(); } },
    bind: { q(S, v) { S.sess.ui.aiQ = v; S.save(); O55.ui.refresh(); } }
  });
  /* the all-providers rows reuse the same actions */
  Object.keys(O55.screens.defs.ai.do).filter((k) => !['all', 'none', 'skip', 'free', 'next'].includes(k)).forEach((k) => { O55.screens.defs['ai-all'].do[k] = O55.screens.defs.ai.do[k]; });
  O55.screens.defs['ai-all'].bind = new Proxy({ q: O55.screens.defs['ai-all'].bind.q }, { get: (t, key) => t[key] || O55.screens.defs.ai.bind[key] });

  /* ------------------------------------------------------------------ I don't have any of these */
  /* what each kind leads to: its sign-up pages, and the rows the AI screen then puts first so the person comes back to
     the provider they signed up with (P10) */
  const SIGNUP = { sub: [['Claude', 'claude'], ['ChatGPT', 'codex']], api: [['Anthropic', 'anthropic-api'], ['Google AI Studio', 'gemini-api']] };
  def('ai-none', {
    chapter: 'ai', stage: 'provider_setup',
    scene: () => ({ id: 'power', beat: 'waiting', params: { n: 0 } }),
    eyebrow: () => T('aiNone.eyebrow'),
    title: () => T('aiNone.title'),
    lead: () => T('aiNone.lead'),
    body(S) {
      /* where to sign up for the chosen kind: under its own card (QA round 2, Q7) */
      const links = (kind) => `<div class="o55-sublinks" data-key="su">${SIGNUP[kind].map(([n]) => C.link(T('aiNone.signup', { name: n }), 'signup', n)).join('')}${O55.tips.q('group:signup')}</div>${O55.tips.explainer('group:signup')}`;
      const sel = S.sess.ui.aiNone;
      return C.cards('pick', [
        { v: 'sub', glyph: 'spark', title: T('aiNone.sub.title'), sub: T('aiNone.sub.sub'), under: sel === 'sub' ? links('sub') : '' },
        { v: 'api', glyph: 'key', title: T('aiNone.api.title'), sub: T('aiNone.api.sub'), under: sel === 'api' ? links('api') : '' },
        { v: 'free', glyph: 'stack', title: T('aiNone.free.title'), sub: T('aiNone.free.sub') }
      ], sel, { label: T('aiNone.title') }) + C.note(T('aiNone.nothing'), 'info');
    },
    foot: (S) => ({ primary: { label: S.sess.ui.aiNone === 'free' ? T('ai.free.title') : T('chrome.continue'), do: 'next' } }),
    do: {
      pick(S, v) { S.sess.ui.aiNone = v; S.save(); O55.ui.refresh(); },
      signup(S, name) { O55.official.open(S, { kind: 'signup', name, url: O55.fixtures.OFFICIAL.signup[name] || null }); },
      next(S) {
        const sel = S.sess.ui.aiNone;
        if (sel === 'free') return O55.ui.go('free');
        if (SIGNUP[sel]) { A(S).wanted = SIGNUP[sel].map(([, id]) => id); S.save(); }
        O55.ui.back();
      }
    }
  });

  /* ------------------------------------------------------------------ Free Models */
  /* Each route is set up through its own provider's account (MA-064): its row names that provider and its state before
     and after, and the key field is that provider's. Only routes a new account gets free today are listed; a route its
     vendor closed is never offered (P01). */
  const FR = () => O55.fixtures.FREE_ROUTES;
  function freeState(S, r) {
    const f = A(S).freeRoutes, rec = A(S).freeRows[r.id] || {};
    if (r.retired) return f[r.id] ? 'retired' : null;
    if (f[r.id]) return f[r.id];
    if (rec.state) return rec.state;
    return 'needs';
  }
  function freeRow(S, r) {
    const st = freeState(S, r); if (!st) return '';
    const rec = A(S).freeRows[r.id] || {}, acct = A(S).freeAccounts[r.id];
    let meta = acct ? T('free.via', { provider: r.provider, who: acct }) : st === 'needs' || st === 'keyEntry' || st === 'keyChecking' ? T('free.notConnected', { provider: r.provider }) : r.provider;
    let pill = ['needs', r.needs === 'signin' ? T('free.needsSignin') : T('free.needsSetup')], action = { label: r.needs === 'signin' ? T('free.signIn') : T('free.setup'), do: 'route', arg: r.id }, extra = '';
    if (st === 'ready') { pill = ['ready', T('free.ready')]; action = null; }
    if (st === 'working') { pill = ['wait', T('chrome.working')]; action = null; }
    if (st === 'limited') { pill = ['needs', T('free.limited')]; meta = T('free.limitedMeta', { provider: r.provider }); action = { label: T('free.retry'), do: 'retry', arg: r.id }; }
    if (st === 'retired') { pill = ['needs', T('free.retired')]; meta = T('free.retiredMeta', { provider: r.provider }); action = null; }
    if (st === 'keyEntry' || st === 'keyChecking') {
      pill = st === 'keyChecking' ? ['wait', T('ai.checking')] : pill; action = null;
      extra = `<div class="o55-rowextra" data-key="fk-${r.id}">` + keyArea(S, { bind: 'fkey:' + r.id, key: r.id, arg: r.id, op: 'fkey:' + r.id + ':' + (rec.attempt || 0), name: r.provider,
        typed: rec.keyTyped, checking: st === 'keyChecking', check: 'fkeyCheck', from: r.keyFrom, fromDo: 'fkeyFrom', cancel: 'fcancel' }) + '</div>';
    }
    return `<div class="o55-provider" data-key="fr-${r.id}" data-state="${st}">` + C.row({ key: r.id, glyph: 'stack', title: r.name, meta, state: pill, action, tip: 'route:' + r.id }) + extra + '</div>';
  }
  def('free', {
    chapter: 'ai', stage: 'free_models_setup', charmSlot: 'free',
    scene: (S) => ({ id: 'power', beat: 'free', params: { n: readyIds(S).length + freeReady(S) } }),
    eyebrow: () => T('free.eyebrow'),
    title: () => T('free.title'),
    lead: () => T('free.lead'),
    body(S) {
      A(S);
      let out = FR().map((r) => freeRow(S, r)).join('');
      if (readyIds(S).length) out += C.note(T('free.paidFirst'), 'info', 'spark');
      out += `<div class="o55-sublinks" data-key="attr">${C.link(T('free.attribution'), 'attribution')}</div>`;
      return out;
    },
    foot: () => ({ primary: { label: T('free.done'), do: 'next' } }),
    do: {
      route(S, id) {
        const r = FR().find((x) => x.id === id), a = A(S), f = a.freeRoutes;
        if (r.needs === 'key') { a.freeRows[id] = Object.assign(a.freeRows[id] || {}, { state: 'keyEntry' }); S.save(); O55.ui.refresh(); O55.sound.play('reveal'); return; }
        f[id] = 'working'; S.save(); O55.ui.refresh();
        O55.official.open(S, { name: r.provider, url: O55.fixtures.OFFICIAL.free[r.id] || null });
        F.op(S, 'free:' + id + ':' + Date.now(), 'cmd.free_models.route.enable', [{ key: 'enable', ms: 1400 }], { quiet: true, payload: { route: id, underlying_provider: r.provider, setup: 'sign_in' },
          onDone: () => { f[id] = 'ready'; a.freeAccounts[id] = r.who || null; a.free = 'setup'; S.save(); O55.ui.refresh(); } });
      },
      fkeyFrom(S, id) { const r = FR().find((x) => x.id === id); if (r && r.keyFrom) O55.official.open(S, { kind: 'page', name: r.keyFrom.name, url: r.keyFrom.url }); },
      fcancel(S, id) { const rec = A(S).freeRows[id]; if (rec) { rec.state = null; rec.keyTyped = false; } S.save(); O55.ui.refresh(); },
      fkeyCheck(S, id) {
        const r = FR().find((x) => x.id === id), a = A(S), rec = a.freeRows[id] = a.freeRows[id] || {}, i = S.root.querySelector('#o55f-fkey-' + id), v = i ? i.value.trim() : '';
        if (i) i.value = '';
        rec.keyTyped = false; rec.state = 'keyChecking'; rec.attempt = (rec.attempt || 0) + 1; S.save(); O55.ui.refresh();
        const offline = offlineNow(S), at = rec.attempt, current = () => rec.attempt === at && rec.state === 'keyChecking';
        F.op(S, 'fkey:' + id + ':' + rec.attempt, 'cmd.free_models.route.enable', [{ key: 'verify', ms: 900, fail: () => keyVerdict(v, offline) }, { key: 'enable', ms: 600 }], {
          payload: { route: id, underlying_provider: r.provider, setup: 'api_key', host_id: host(S).id }, sound: { fail: 'warn' },
          onDone: () => { if (!current()) return; rec.state = null; a.freeRoutes[id] = r.limitedOnce && !rec.retried ? 'limited' : 'ready'; a.freeAccounts[id] = T('free.keyAccount'); a.free = 'setup'; S.save(); O55.ui.refresh(); },
          onFail: () => { if (!current()) return; rec.state = 'keyEntry'; S.save(); O55.ui.refresh(); } });
      },
      /* Retry now: one check against the provider; a limit that has reset clears, one that hasn't stays (MA-065) */
      retry(S, id) {
        const r = FR().find((x) => x.id === id), a = A(S), rec = a.freeRows[id] = a.freeRows[id] || {};
        a.freeRoutes[id] = 'working'; rec.retried = true; S.save(); O55.ui.refresh();
        F.op(S, 'free-retry:' + id + ':' + Date.now(), 'cmd.free_models.route.enable', [{ key: 'check', ms: 1000 }], { quiet: true, payload: { route: id, underlying_provider: r.provider, setup: 'retry_now' },
          onDone: () => { a.freeRoutes[id] = 'ready'; S.save(); O55.ui.refresh(); } });
      },
      attribution(S) { O55.official.open(S, { kind: 'page', name: 'free-coding-models', url: 'https://github.com/vava-nessa/free-coding-models' }); },
      next(S) { O55.ui.go('ready'); }
    },
    bind: new Proxy({}, { get: (t, key) => (S, v) => {
      const id = String(key).replace(/^fkey:/, ''), rec = A(S).freeRows[id]; if (!rec) return;
      const had = !!rec.keyTyped; rec.keyTyped = v.length > 0; if (had !== rec.keyTyped) { S.save(); O55.ui.refresh(); }
    } })
  });

  /* ------------------------------------------------------------------ what the app reads at the end (P13) */
  /* Each connected account with the id Settings uses for its provider, its auth family, the computer it is kept on and
     who keeps the credential; each Free Models route with its own provider's account. Ids, labels and states only. */
  const CUSTODY = { cli: 'cli_profile', store: 'os_keychain', server: 'opencode_server' };
  function accountsPart(S) {
    return A(S).list.filter((e) => e.state === 'ready').map((e) => ({
      account_id: e.id, provider_entry_id: e.settings, onboarding_provider_id: e.provider, display_name: accLabel(e), display_identity: e.who || null,
      auth_method: e.method === 'key' ? 'api_key' : e.method === 'server' ? 'server_profile' : 'oauth', auth_family: e.family || null,
      custody: CUSTODY[e.custody] || 'os_keychain', host: { id: e.host, name: e.hostName, role: e.hostRole }, billing: e.bill, plan_label: e.plan || null,
      workspace: e.workspace, billing_entity: e.entity, profile_mode: e.mode === 'managed' ? 'managed_server' : e.mode === 'attached' ? 'attach_existing_server' : null,
      endpoint_label: e.endpoint, state: 'Ready', status: 'active', via: e.via, connected_at: e.at }));
  }
  function freePart(S) {
    const a = A(S);
    return FR().filter((r) => !r.retired || a.freeRoutes[r.id]).map((r) => ({
      route_id: r.id, name: r.name, underlying_provider: r.provider, underlying_account: a.freeAccounts[r.id] || null,
      state: r.retired ? 'no_longer_available' : a.freeRoutes[r.id] === 'ready' ? 'ready' : a.freeRoutes[r.id] === 'limited' ? 'limit_reached' : 'not_set_up' }));
  }
  /* the vendor programs found or installed on the computer that does the work (Settings: installed, still to sign in) */
  const installedPart = (S) => PROV().filter((p) => p.cli && (A(S).accounts[p.id] || {}).installed || (p.cli && (detected(S, p) || {}).installed)).map((p) => p.settings);
  const register = () => { if (O55.handoff && O55.handoff.part) { O55.handoff.part('accounts', accountsPart); O55.handoff.part('free_routes', freePart); O55.handoff.part('installed_tools', installedPart); } };
  if (O55.handoff) register(); else Promise.resolve().then(register);

  O55.ai = { readyIds, freeReady, shortlist, pname, mono, accounts: (S) => A(S).list.slice(), host };
})();
