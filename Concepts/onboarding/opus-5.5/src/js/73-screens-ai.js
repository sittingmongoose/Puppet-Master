/* Chapter 4 — AI [provider_setup -> free_models_setup], only after the Project exists. Accounts and plans, never
   adapters: detection is bounded, cached and runs on the selected work computer; each row has exactly one action —
   Install (only where a vendor CLI is required), Sign In, or Enter API Key — and becomes Ready by itself once verified.
   Skip is allowed and says what it limits; Set Up Free Models is offered either way. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const A = (S) => { const a = S.sess.ai; a.accounts = a.accounts || {}; return a; };
  const PROV = () => O55.fixtures.PROVIDERS;
  const host = (S) => (md(S).server_mode === 'this_device' ? T('where.this.title').toLowerCase() : O55.project.serverName(S));
  const onServer = (S) => md(S).server_mode !== 'this_device';
  const pname = (p) => O55.tx('ai.names')[p.id] || p.name;

  /* What the work computer already has: this computer's providers, or the Server's ready accounts. */
  function detected(S, p) {
    if (onServer(S)) {
      const srv = O55.connect && O55.connect.allServers(S).find((x) => x.id === md(S).server_ref);
      const acc = srv && srv.accounts.find((a) => a.provider === p.id);
      return acc ? { installed: true, signedIn: !!acc.ready, account: acc.label, plan: 'Claude plan' } : null;
    }
    return S.env.here.providers[p.id] || null;
  }
  function copiedFrom(S) {
    const d = md(S); if (d.settings_transfer.mode !== 'copy_from_project') return null;
    const src = S.env.here.projects.find((x) => x.id === d.settings_transfer.source_project_id);
    return src ? { name: src.name, providers: src.providers || [] } : null;
  }
  /* The short list: copied routes first, then the likely products (at most four rows). */
  function shortlist(S) {
    const cp = copiedFrom(S), ids = [];
    (cp ? cp.providers : []).forEach((id) => ids.includes(id) || ids.push(id));
    PROV().filter((p) => detected(S, p)).forEach((p) => ids.includes(p.id) || ids.push(p.id));
    PROV().filter((p) => p.likely).sort((a, b) => a.likely - b.likely).forEach((p) => ids.includes(p.id) || ids.push(p.id));
    Object.keys(A(S).accounts).forEach((id) => ids.includes(id) || ids.push(id));
    return ids.slice(0, Math.max(4, Object.keys(A(S).accounts).filter((id) => A(S).accounts[id].state === 'ready').length)).map((id) => PROV().find((p) => p.id === id)).filter(Boolean);
  }
  /* Row state: detection first (cached per host), then whatever the person has done in this session. */
  function state(S, p) {
    const a = A(S).accounts[p.id];
    if (a && a.state) return a.state;
    const det = F.state(S, 'detect:' + host(S));
    if (!det || det.state !== 'done') return 'checking';
    const d = detected(S, p);
    if (d && d.installed && d.signedIn) return 'ready';
    if (p.cli && !(d && d.installed)) return 'install';
    if (p.auth === 'key') return 'key';
    return 'signin';
  }
  function autoReady(S) {
    /* verified credentials connect automatically — no Connect button (packet 03) */
    PROV().forEach((p) => { const d = detected(S, p); if (d && d.installed && d.signedIn && !A(S).accounts[p.id]) A(S).accounts[p.id] = { state: 'ready', via: 'detected' }; });
    S.save();
  }
  const readyIds = (S) => Object.keys(A(S).accounts).filter((id) => A(S).accounts[id].state === 'ready');

  function rowHtml(S, p) {
    const st = state(S, p), a = A(S).accounts[p.id] || {}, d = detected(S, p), cp = copiedFrom(S);
    const fromCopy = cp && cp.providers.includes(p.id);
    let meta = T('ai.pairs.' + p.id) !== 'ai.pairs.' + p.id ? T('ai.pairs.' + p.id) : p.product;
    let pill = null, action = null, extra = '';
    if (st === 'checking') pill = ['wait', T('ai.checking')];
    if (st === 'ready') { pill = ['ready', T('ai.ready')]; meta = (d && d.account ? d.account + ' · ' : '') + T('ai.charged.' + p.kind, { plan: (d && d.plan) || p.product }); }
    if (st === 'install') { pill = ['needs', T('ai.notInstalled')]; action = { label: onServer(S) ? T('ai.installOn', { host: host(S) }) : T('ai.install'), do: 'install', arg: p.id }; }
    if (st === 'signin') { pill = ['needs', T('ai.notReady')]; action = { label: T('ai.signIn'), do: 'signin', arg: p.id }; }
    if (st === 'key') { action = { label: T('ai.key'), do: 'key', arg: p.id }; }
    if (fromCopy && st !== 'ready') meta = T('ai.unavailable', { project: cp.name, host: host(S) });
    else if (fromCopy) meta = T('ai.from', { project: cp.name }) + ' · ' + meta;
    else if (d && d.installed && st !== 'ready') meta = (onServer(S) ? T('ai.foundOn', { host: host(S) }) : T('ai.found')) + ' · ' + meta;
    /* inline states */
    if (a.confirmInstall) extra = `<div class="o55-rowextra" data-key="ask-${p.id}"><span>${U.esc(T('ai.installAsk', { name: pname(p), host: host(S), vendor: p.vendor }))}</span>${O55.ui.btn({ label: T('ai.installGo'), do: 'installGo', arg: p.id, cls: 'o55-small' }, 'o55-primary')}</div>`;
    if (st === 'installing') { pill = ['wait', T('chrome.working')]; extra = `<div class="o55-rowextra" data-key="ph-${p.id}">${F.phases(S, 'install:' + p.id, ['download', 'install', 'verify'], { download: T('ai.installPhases.download', { vendor: p.vendor }), install: T('ai.installPhases.install'), verify: T('ai.installPhases.verify') })}</div>`; }
    if (st === 'signingIn') { pill = ['wait', T('ai.signinWait')]; }
    if (st === 'keyEntry' || st === 'keyChecking') {
      const ks = F.state(S, 'key:' + p.id + ':' + (a.attempt || 0));
      pill = st === 'keyChecking' ? ['wait', T('ai.checking')] : null;
      extra = `<div class="o55-rowextra" data-key="key-${p.id}">${C.field({ bind: 'key:' + p.id, id: 'o55f-key-' + p.id, type: 'password', protected: true, label: T('ai.keyLabel', { name: pname(p) }), value: '', hint: T('ai.keyHint'), error: ks && ks.state === 'failed' ? T('ai.keyBad') : '', invalid: !!(ks && ks.state === 'failed') })}`
        + O55.ui.btn({ label: T('ai.verify'), do: 'keyCheck', arg: p.id, cls: 'o55-small', disabled: !a.keyTyped || st === 'keyChecking', reason: T('ai.keyLabel', { name: pname(p) }) }, 'o55-secondary') + '</div>';
    }
    const lead = `<span class="o55-plogo" style="--plh:${U.hash(p.vendor) % 360}" aria-hidden="true">${U.esc(pname(p).slice(0, 1))}</span>`;
    return `<div class="o55-provider" data-key="pv-${p.id}" data-state="${st}">` + C.row({ key: p.id, lead, title: pname(p), meta, state: pill, action }) + extra + '</div>';
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
      let out = `<div class="o55-providers" data-key="list">${shortlist(S).map((p) => rowHtml(S, p)).join('')}</div>`;
      out += `<div class="o55-sublinks" data-key="links">${C.link(T('ai.seeAll'), 'all')}${readyIds(S).length ? C.link(T('ai.another'), 'all') : C.link(T('ai.none'), 'none')}</div>`;
      if (a.skipped && !readyIds(S).length) out += C.note(T('ai.skipNote'), 'warn', 'spark');
      if (readyIds(S).length || a.skipped) {
        out += `<button type="button" class="o55-card o55-card-link" data-o55-do="free" data-pm-hover-exempt="true" data-key="free">${C.glyph('stack')}<span class="o55-cardtext"><span class="o55-cardtitle">${U.esc(T('ai.free.title'))}</span><span class="o55-cardsub">${U.esc(T('ai.free.sub'))}</span></span><span class="o55-cardarrow" aria-hidden="true">›</span></button>`;
      }
      return out;
    },
    mounted(S) {
      /* bounded detection on the selected work computer, once per host (cached) */
      F.op(S, 'detect:' + host(S), 'cmd.integration.connection.detect', [{ key: 'likely', ms: 900 }, { key: 'copied', ms: 500 }], { payload: { host: host(S), bounded: 4 }, onDone: () => { autoReady(S); O55.ui.refresh(); } });
    },
    foot(S) {
      const a = A(S), n = readyIds(S).length;
      if (n || a.skipped) return { back: false, primary: { label: T('chrome.continue'), do: 'next' } };
      return { back: false, secondary: [{ label: T('ai.skip'), do: 'skip', cls: 'o55-ghost' }], primary: { label: T('chrome.continue'), do: 'next', disabled: true, reason: T('ai.skipNote') } };
    },
    do: {
      install(S, id) { A(S).accounts[id] = Object.assign(A(S).accounts[id] || {}, { confirmInstall: true }); S.save(); O55.ui.refresh(); },
      installGo(S, id) {
        const p = PROV().find((x) => x.id === id), acc = A(S).accounts[id] = Object.assign(A(S).accounts[id] || {}, { confirmInstall: false, state: 'installing' });
        S.save(); O55.ui.refresh();
        F.op(S, 'install:' + id, 'cmd.tool_product.install', [{ key: 'download', ms: 1300 }, { key: 'install', ms: 1100 }, { key: 'verify', ms: 700 }], {
          payload: { product: p.cli, host: host(S), official: true },
          onDone: () => { acc.state = p.auth === 'key' ? 'key' : 'signin'; acc.installed = true; S.save(); O55.ui.refresh(); }
        });
      },
      signin(S, id) {
        const p = PROV().find((x) => x.id === id), acc = A(S).accounts[id] = Object.assign(A(S).accounts[id] || {}, { state: 'signingIn' });
        acc.attempt = (acc.attempt || 0) + 1; S.save();
        O55.official.open(S, { name: p.vendor, url: O55.fixtures.OFFICIAL.provider[p.id] || null });
        O55.ui.refresh();
        F.op(S, 'signin:' + id + ':' + acc.attempt, 'cmd.integration.connection.add', [{ key: 'browser', ms: 2400 }, { key: 'verify', ms: 600 }], { quiet: true, payload: { provider: id, host: host(S), method: 'browser' }, onDone: () => { acc.state = 'ready'; acc.via = 'signin'; S.save(); O55.ui.refresh(); O55.ui.charm(S.root.querySelector(`[data-key="pv-${id}"]`), pname(p), 'spark'); } });
      },
      key(S, id) { A(S).accounts[id] = Object.assign(A(S).accounts[id] || {}, { state: 'keyEntry' }); S.save(); O55.ui.refresh(); const i = S.root.querySelector('#o55f-key-' + id); if (i) i.focus(); },
      keyCheck(S, id) {
        const p = PROV().find((x) => x.id === id), acc = A(S).accounts[id], i = S.root.querySelector('#o55f-key-' + id), v = i ? i.value.trim() : '';
        if (i) i.value = '';
        acc.keyTyped = false; acc.state = 'keyChecking'; acc.attempt = (acc.attempt || 0) + 1; S.save(); O55.ui.refresh();
        F.op(S, 'key:' + id + ':' + acc.attempt, 'cmd.integration.connection.test', [{ key: 'verify', ms: 900, fail: () => (v.length >= 12 ? null : 'key_rejected') }], {
          payload: { provider: id, method: 'api_key' },
          onDone: () => { acc.state = 'ready'; acc.via = 'key'; S.save(); O55.ui.refresh(); O55.ui.charm(S.root.querySelector(`[data-key="pv-${id}"]`), pname(p), 'spark'); },
          onFail: () => { acc.state = 'keyEntry'; S.save(); O55.ui.refresh(); }
        });
      },
      all(S) { O55.ui.go('ai-all'); },
      none(S) { O55.ui.go('ai-none'); },
      skip(S) { A(S).skipped = true; S.save(); O55.ui.refresh(); },
      free(S) { O55.ui.go('free'); },
      next(S) { O55.ui.go('ready'); }
    },
    bind: new Proxy({}, { get: (t, key) => (S, v) => { const id = String(key).replace(/^key:/, ''); const acc = A(S).accounts[id]; if (!acc) return; const had = !!acc.keyTyped; acc.keyTyped = v.length > 0; if (had !== acc.keyTyped) { S.save(); O55.ui.refresh(); } } }),
    onBack: () => false
  });

  /* ------------------------------------------------------------------ all providers (subscriptions vs pay-as-you-go) */
  def('ai-all', {
    chapter: 'ai', stage: 'provider_setup',
    scene: (S) => ({ id: 'power', beat: readyIds(S).length ? 'ready' : 'waiting', params: { n: readyIds(S).length } }),
    eyebrow: () => T('ai.eyebrow'),
    title: () => T('ai.allTitle'),
    lead: () => T('ai.lead'),
    body(S) {
      const q = String(S.sess.ui.aiQ || '').toLowerCase();
      const match = (p) => !q || (pname(p) + ' ' + p.vendor + ' ' + p.product).toLowerCase().includes(q);
      const subs = PROV().filter((p) => p.kind !== 'api' && match(p)), apis = PROV().filter((p) => p.kind === 'api' && match(p));
      let out = C.field({ bind: 'q', label: T('chrome.search'), value: S.sess.ui.aiQ || '', placeholder: 'Claude, Gemini, OpenCode…' });
      if (subs.length) out += C.group(T('ai.subs'), `<p class="o55-hint">${U.esc(T('ai.subsSub'))}</p>` + subs.map((p) => rowHtml(S, p)).join(''));
      if (apis.length) out += C.group(T('ai.apis'), `<p class="o55-hint">${U.esc(T('ai.apisSub'))}</p>` + apis.map((p) => rowHtml(S, p)).join(''));
      return out;
    },
    foot: () => ({ primary: { label: T('chrome.done'), do: 'done' } }),
    do: { done(S) { O55.ui.back(); } },
    bind: { q(S, v) { S.sess.ui.aiQ = v; S.save(); O55.ui.refresh(); } }
  });
  /* the all-providers rows reuse the same actions */
  ['install', 'installGo', 'signin', 'key', 'keyCheck'].forEach((k) => { O55.screens.defs['ai-all'].do[k] = O55.screens.defs.ai.do[k]; });
  O55.screens.defs['ai-all'].bind = new Proxy({ q: O55.screens.defs['ai-all'].bind.q }, { get: (t, key) => t[key] || O55.screens.defs.ai.bind[key] });

  /* ------------------------------------------------------------------ I don't have any of these */
  def('ai-none', {
    chapter: 'ai', stage: 'provider_setup',
    scene: () => ({ id: 'power', beat: 'waiting', params: { n: 0 } }),
    eyebrow: () => T('aiNone.eyebrow'),
    title: () => T('aiNone.title'),
    lead: () => T('aiNone.lead'),
    body(S) {
      return C.cards('pick', [
        { v: 'sub', glyph: 'spark', title: T('aiNone.sub.title'), sub: T('aiNone.sub.sub') },
        { v: 'api', glyph: 'key', title: T('aiNone.api.title'), sub: T('aiNone.api.sub') },
        { v: 'free', glyph: 'stack', title: T('aiNone.free.title'), sub: T('aiNone.free.sub') }
      ], S.sess.ui.aiNone, { label: T('aiNone.title') })
        + (S.sess.ui.aiNone === 'sub' ? `<div class="o55-sublinks" data-key="su">${['Claude', 'ChatGPT'].map((n) => C.link(T('aiNone.signup', { name: n }), 'signup', n)).join('')}</div>` : '')
        + (S.sess.ui.aiNone === 'api' ? `<div class="o55-sublinks" data-key="su">${['Anthropic', 'Google AI Studio'].map((n) => C.link(T('aiNone.signup', { name: n }), 'signup', n)).join('')}</div>` : '');
    },
    foot: (S) => ({ primary: { label: S.sess.ui.aiNone === 'free' ? T('ai.free.title') : T('chrome.continue'), do: 'next' } }),
    do: {
      pick(S, v) { S.sess.ui.aiNone = v; S.save(); O55.ui.refresh(); },
      signup(S, name) { O55.official.open(S, { kind: 'signup', name, url: O55.fixtures.OFFICIAL.signup[name] || null }); },
      next(S) { if (S.sess.ui.aiNone === 'free') return O55.ui.go('free'); O55.ui.back(); }
    }
  });

  /* ------------------------------------------------------------------ Free Models */
  function freeState(S, r) {
    const f = (S.sess.ai.freeRoutes = S.sess.ai.freeRoutes || {});
    if (f[r.id]) return f[r.id];
    if (r.usesForge && S.sess.forgeAccounts[r.usesForge]) return 'ready';
    if (r.rateLimited) return 'limited';
    return 'needs';
  }
  def('free', {
    chapter: 'ai', stage: 'free_models_setup', charmSlot: 'free',
    scene: (S) => ({ id: 'power', beat: 'free', params: { n: readyIds(S).length + Object.values(S.sess.ai.freeRoutes || {}).filter((x) => x === 'ready').length } }),
    eyebrow: () => T('free.eyebrow'),
    title: () => T('free.title'),
    lead: () => T('free.lead'),
    body(S) {
      let out = O55.fixtures.FREE_ROUTES.map((r) => {
        const st = freeState(S, r);
        const pill = st === 'ready' ? ['ready', T('free.ready')] : st === 'limited' ? ['needs', T('free.limited')] : st === 'working' ? ['wait', T('chrome.working')] : ['needs', T('free.needsSignin')];
        const action = st === 'ready' || st === 'working' ? null : st === 'limited' ? { label: T('free.reconnect'), do: 'route', arg: r.id } : { label: r.needs === 'signin' ? T('free.signIn') : T('free.setup'), do: 'route', arg: r.id };
        return C.row({ key: r.id, glyph: 'stack', title: r.name, meta: r.provider, state: pill, action });
      }).join('');
      if (readyIds(S).length) out += C.note(T('free.paidFirst'), 'info', 'spark');
      out += `<div class="o55-sublinks" data-key="attr">${C.link(T('free.attribution'), 'attribution')}</div>`;
      return out;
    },
    foot: () => ({ primary: { label: T('free.done'), do: 'next' } }),
    do: {
      route(S, id) {
        const r = O55.fixtures.FREE_ROUTES.find((x) => x.id === id), f = S.sess.ai.freeRoutes = S.sess.ai.freeRoutes || {};
        f[id] = 'working'; S.save(); O55.ui.refresh();
        if (r.needs === 'signin') O55.official.open(S, { name: r.provider, url: O55.fixtures.OFFICIAL.free[r.id] || null });
        F.op(S, 'free:' + id + ':' + Date.now(), 'cmd.free_models.route.enable', [{ key: 'enable', ms: 1400 }], { quiet: true, payload: { route: id }, onDone: () => { f[id] = 'ready'; S.sess.ai.free = 'setup'; S.save(); O55.ui.refresh(); } });
      },
      attribution(S) { O55.official.open(S, { kind: 'page', name: 'free-coding-models', url: 'https://github.com/vava-nessa/free-coding-models' }); },
      next(S) { O55.ui.go('ready'); }
    }
  });

  O55.ai = { readyIds, shortlist, pname };
})();
