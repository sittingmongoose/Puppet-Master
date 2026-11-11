/* Settings managers, rethought (Fable 5.2): the chapter "AI providers".
   Today this is AI & Providers › Providers & Accounts: a list of 22 providers beside a detail pane with every account
   opened in place, three more tabs, and the same "switch at this much left" choice drawn per account, per provider and
   again as the shared setting. Here:
   - the overview lists only the providers you have, each with its tightest usage, and says in two sentences which model
     answers and what happens when an account runs out;
   - a provider has its own page and an account has its own page, so one screen is about one thing;
   - running out is one rule, and a provider or an account that differs is shown as an exception to it;
   - "which model does what" is one page that also lists every other place a model is chosen.
   Every control is PMConcept7's own: account rows are the kit's per-account rows (scope providers-account), the rule
   is read and written through PM51.providerPolicy, and every button is the action PMConcept7 has today. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec, D = SMX.drawn;
  const kit = () => W.PM51;
  const ACC = 'providers-account', SVC = 'providers-service';
  const SW = 'ai.accounts.hard-switch-level', WARN = 'ai.accounts.soft-warning-level', COOL = 'ai.accounts.cooldown-policy', AUTO = 'ai.accounts.multi-account-switching';

  /* ------------------------------------------------------------------ readers (the same rules PMConcept7's manager uses) */
  const all = (st) => st.providers || [];
  const find = (st, id) => all(st).find((p) => p.id === id) || null;
  const routes = (st) => (st.freeRoutes || []).filter((r) => !['free-community', 'free-github-models', 'free-cerebras', 'free-hf'].includes(r.id));
  const ROUTE_NAMES = { 'free-openrouter': 'OpenRouter free models', 'free-groq': 'Groq free plan', 'free-nvidia': 'NVIDIA free models' };
  const routeName = (r) => ROUTE_NAMES[r.id] || r.name;
  const plain = (p) => d.providerState(p);   // "Ready" only when it can answer now (see smx-ia.js)
  const toneOf = (p) => ({ Ready: 'ready', Off: 'off', 'Not installed': 'off', 'Not set up': 'off', Checking: 'info' }[plain(p)] || 'attention');
  const inUse = (a) => !!a.active && a.enabled !== false;
  const active = (p) => (p.accounts || []).filter(inUse);
  const ordered = (p) => { const accs = p.accounts || []; const order = (p.routing && p.routing.accountOrder) || []; return order.map((id) => accs.find((x) => x.id === id)).filter(Boolean).concat(accs.filter((x) => !order.includes(x.id))); };
  const usedFirst = (p) => ordered(p).find(inUse);
  const isSetUp = (p) => !['Not set up', 'Not installed', 'Off'].includes(plain(p)) || (p.accounts || []).length > 0 || p.status === 'disabled';
  const count = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const statusLabel = (st, p) => {
    const base = plain(p);
    if (p.id === 'free-models') return base === 'Off' ? base : `${base} · ${routes(st).filter((r) => r.enabled).length} of ${routes(st).length} free routes on`;
    const n = active(p).length, total = (p.accounts || []).length;
    if (base === 'Ready' && n) return total > n ? `${n} of ${count(total, 'account')} in use` : `${count(n, 'account')}`;
    if (base === 'Needs attention' && p.id === 'github-copilot') return 'Needs a Copilot seat';
    return base;
  };
  const seatless = (a) => /seat/i.test(String(a.health || ''));
  const usage = (a) => (a && a.usage && typeof a.usage === 'object' ? a.usage : { text: typeof (a || {}).usage === 'string' ? a.usage : '', windows: {} });
  const limitHit = (a) => /limit/i.test(String(a.health || '')) || Object.values(usage(a).windows || {}).some((w) => w && typeof w === 'object' && Number(w.pct) >= 100);
  const accStatus = (a) => (!a.active ? ['Needs sign-in', 'attention'] : a.enabled === false ? ['Not in use', 'off'] : seatless(a) ? ['Needs a seat', 'attention'] : limitHit(a) ? ['Limit reached', 'blocked'] : (a.health && !/^(healthy|ready|ok)$/i.test(a.health)) ? [a.health, 'attention'] : ['Ready', 'ready']);
  const WINDOW_LABELS = { fiveHour: '5-hour limit', weekly: 'Weekly limit', monthly: 'Monthly limit' };
  const windowLabel = (p, k) => { const v = (p.windows || {})[k]; return (typeof v === 'string' && v ? v.replace(/window/i, 'limit') : WINDOW_LABELS[k]) || k; };
  const windowsOf = (p, a) => Object.entries(usage(a).windows || {}).filter(([, w]) => w && typeof w === 'object' && w.pct != null).map(([k, w]) => ({ key: k, label: windowLabel(p, k), pct: Number(w.pct), reset: w.reset || '' }));
  const meters = (p, a, max) => { const ws = windowsOf(p, a).sort((x, y) => y.pct - x.pct).slice(0, max || 9); return ws.length ? ws.map((w) => ui.meter({ label: w.label, pct: w.pct, reset: w.reset })).join('') : ''; };
  const primaryFor = (p) => {
    const data = { provider: p.id };
    if (p.status === 'disabled') return { label: 'Turn it on', icon: 'play', action: 'pm51-providers-turn-on', data };
    switch (p.nextAction) {
      case 'install': return { label: 'Install', icon: 'download', action: 'pm51-providers-install', data };
      case 'signin': return { label: 'Sign in', icon: 'user', action: 'pm51-providers-signin', data };
      case 'apikey': return { label: 'Enter a key', icon: 'key', action: 'pm51-providers-apikey', data };
      case 'attach': return { label: 'Set up a server', icon: 'nas', action: 'pm51-providers-signin', data };
      case 'address': return { label: 'Enter its address', icon: 'link', action: 'pm51-providers-address', data };
      case 'routes': return { label: 'Choose free routes', icon: 'route', action: 'pm51-providers-routes', data };
      default: return { label: 'Add an account', icon: 'plus', action: 'pm51-providers-add-account', data };
    }
  };
  const KIND = { plan: 'A plan you pay for monthly', use: 'Pay as you go', own: 'Free, or your own' };
  const initials = (name) => String(name || '?').split(/[\s/]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const srow = (id, value, o) => { try { return kit().scoped.row(id, value, o); } catch (e) { return ''; } };
  const sfield = (id, value, o) => { try { return kit().scoped.field(id, value, o); } catch (e) { return ''; } };
  const sval = (thing, id) => { try { return kit().scopedValue(thing, id); } catch (e) { return undefined; } };
  const srows = (list) => { try { return kit().scoped.rows(list.filter(Boolean)); } catch (e) { return `<div class="setting-list">${list.filter(Boolean).join('')}</div>`; } };
  const sfields = (list) => { try { return kit().scoped.fields(list.filter(Boolean)); } catch (e) { return list.filter(Boolean).join(''); } };
  const pol = () => kit().providerPolicy;
  const left = (v) => { const n = Number(v); return Number.isFinite(n) ? `${n}% left` : String(v || ''); };
  const model = (st) => { const v = SMX.val('ai.models.default-model'); if (!v) return 'the everyday model'; try { return String(kit().valueLabel('ai.models.default-model', v) || v); } catch (e) { return String(v); } };

  /* what needs you, for this chapter and for Settings Home */
  const needs = (st) => {
    const out = [];
    for (const p of all(st)) {
      const w = plain(p);
      if (w === 'Needs sign-in') out.push({ title: `${p.name} needs you to sign in again`, detail: 'Its models are not available until you do.', fix: { label: 'Sign in', action: 'pm51-providers-signin', data: { provider: p.id } }, also: { label: 'Open', go: `ai/provider/${p.id}` } });
      else if (w === 'Needs attention') out.push({ title: p.id === 'github-copilot' ? 'GitHub Copilot cannot be used yet' : `${p.name} needs attention`, detail: p.id === 'github-copilot' ? 'The sign-in works, but this GitHub account has no Copilot seat.' : (p.statusLabel || ''), fix: { label: 'See what to do', go: `ai/provider/${p.id}` } });
      if (isSetUp(p)) for (const a of (p.accounts || [])) if (!a.active) out.push({ tone: 'info', title: `${a.nickname} (${p.name}) is signed out`, detail: 'Work skips it until you sign in again.', fix: { label: 'Sign in again', action: 'pm51-providers-account-signin', data: { provider: p.id, account: a.id } } });
    }
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(needs);

  /* ------------------------------------------------------------------ the one rule, in words */
  const ruleWords = (st) => {
    const on = SMX.val(AUTO) !== false && SMX.val(AUTO) !== 'off';
    const down = SMX.val('ai.models.provider-fallback') !== false && SMX.val('ai.models.provider-fallback') !== 'off';
    return { on, down, sw: left(SMX.val(SW)), warn: left(SMX.val(WARN)) };
  };
  const exceptions = (st) => {
    const out = [];
    for (const p of all(st)) {
      let own = {}; try { own = pol().own(p.id) || {}; } catch (e) { own = {}; }
      const keys = Object.keys(own);
      if (keys.length) out.push({ kind: 'provider', p, text: [own[AUTO] !== undefined ? (own[AUTO] ? 'switches by itself' : 'never switches by itself') : '', own[SW] !== undefined ? `switches at ${left(own[SW])}` : '', own[WARN] !== undefined ? `warns at ${left(own[WARN])}` : '', own[COOL] !== undefined ? `rests ${own[COOL]} after a rate limit` : ''].filter(Boolean).join(' · ') });
      for (const a of (p.accounts || [])) { const v = (a.props || {})[SW]; if (v !== undefined && v !== null && v !== '') out.push({ kind: 'account', p, a, text: `switches at ${left(v)}` }); }
    }
    return out;
  };

  /* ================================================================== Overview */
  SMX.page({
    id: 'ai', chapter: 'ai', icon: 'brain', noPagesList: true,
    title: 'AI providers',
    purpose: 'The AI that does the work. Sign in to the ones you already pay for, add a key, or use the free ones.',
    legacy: [['ai', 'providers', 'services', 'providers']],
    keywords: ['provider', 'providers', 'service', 'claude', 'chatgpt', 'codex', 'gemini', 'copilot', 'account', 'accounts', 'sign in', 'api key', 'free models'],
    lead: (ctx) => {
      const st = ctx.st;
      // the filter box is its own state: what is typed in it narrows both lists
      const box = SMX.host() && SMX.host().querySelector('[data-smx-input="ai-filter"]');
      const q = box ? box.value.trim().toLowerCase() : '';
      const hit = (p) => !q || [p.name, p.vendor, p.product, p.kind, p.connect].some((x) => String(x || '').toLowerCase().includes(q));
      const everyMine = all(st).filter(isSetUp), everyRest = all(st).filter((p) => !isSetUp(p));
      const mine = everyMine.filter(hit); const rest = everyRest.filter(hit);
      const ready = everyMine.filter((p) => plain(p) === 'Ready').length; const r = ruleWords(st); const nd = needs(st);
      const wait = everyMine.filter((p) => toneOf(p) === 'attention').length, begun = everyMine.filter((p) => toneOf(p) === 'off').length;
      const order = { attention: 0, ready: 1, info: 1, off: 2 };
      const thing = (p) => { const first = usedFirst(p); return { initials: initials(p.name), name: p.name, tag: KIND[p.bill] || '', sub: statusLabel(st, p), meters: first ? meters(p, first, 1) : '', status: { text: plain(p), tone: toneOf(p) }, go: `ai/provider/${p.id}` }; };
      return [
        { key: 'summary', html: ui.summary({ icon: 'brain', tone: nd.some((n) => n.tone !== 'info') ? 'attention' : 'ready', lines: [
          `${ui.b(count(ready, 'AI provider'))} can answer now${wait ? `, ${ui.b(String(wait))} need${wait === 1 ? 's' : ''} you` : ''}${begun ? `, ${begun} ${begun === 1 ? 'is' : 'are'} started but not finished` : ''}; ${everyRest.length} more can be added.`,
          `${ui.word(model(st), { go: 'ai/models' })} answers unless a job needs something else.`,
          r.on ? `When an account has ${ui.word(r.sw, { go: 'ai/limits' })}, work moves to your next account${r.down ? `; if a whole provider is down it ${ui.word('moves to another provider', { go: 'ai/limits' })}` : ''}.` : `Accounts ${ui.word('never switch by themselves', { go: 'ai/limits' })}: work stops when one runs out.`
        ], side: ui.btn({ label: 'Add an AI provider', icon: 'plus', primary: true, small: false, action: 'pm51-providers-add' }) }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'filter', html: all(st).length > 8 ? `<label class="smx-filter"><span class="icon" aria-hidden="true">${SMX.icon('search')}</span><input type="search" data-smx-input="ai-filter" data-smx-key="ai-filter" placeholder="Filter the AI providers by name" aria-label="Filter the AI providers by name" autocomplete="off"></label>` : '' },
        { key: 'mine', html: ui.things({ title: 'Your AI providers', help: 'The ones you have signed in to or started to set up. Open one to see its accounts.', items: mine.slice().sort((a, b) => (order[toneOf(a)] - order[toneOf(b)])).map(thing), empty: q ? { icon: 'search', title: `None of your providers matches “${q}”`, text: rest.length ? 'There is a match among the ones you can add, below.' : 'Try fewer letters.' } : { icon: 'brain', title: 'No AI provider yet', text: 'Puppet Master needs at least one to do anything.', fix: { label: 'Add an AI provider', action: 'pm51-providers-add' } } }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'sparkle', title: 'Choose which model does what', sub: 'One everyday model, or a different one for some jobs', go: 'ai/models' },
          { icon: 'swap', title: 'Decide what happens when one runs out', sub: 'Switch accounts, switch providers, or stop and ask', go: 'ai/limits' },
          { icon: 'wallet', title: 'Set a spending limit', sub: 'A monthly cap, and a warning before you reach it', go: 'ai/spending' }
        ], { title: 'What do you want to do?', cols: 3 }) },
        { key: 'pages', html: ui.pages('ai', ctx, { title: 'Everything in this chapter' }) },
        { key: 'rest', html: rest.length ? `<details class="smx-fold smx-fold-more" data-smx-fold="ai:rest"${SMX.local.openMore['ai:rest'] || q ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">${count(rest.length, 'more provider')} you can add</span><span class="smx-fold-help">Not set up yet</span></summary><div class="smx-fold-body">${ui.things({ items: rest.map((p) => ({ initials: initials(p.name), name: p.name, tag: KIND[p.bill] || '', sub: p.connect || p.product || '', side: ui.btn(primaryFor(p)), go: `ai/provider/${p.id}` })) })}</div></details>` : '' },
        { key: 'links', html: ui.links([{ label: 'Check every provider', action: 'pm51-providers-diagnostics' }, { label: 'Look for new models', action: 'run-setting-action', data: { setting: 'ai.usage.refresh-models', settingId: 'ai.usage.refresh-models' } }, { label: 'Find installed apps again', action: 'run-setting-action', data: { setting: 'system.advanced.binary-rescan', settingId: 'system.advanced.binary-rescan' } }, { label: 'How AI providers work', action: 'pm51-providers-help' }, { label: 'Put the example providers back', action: 'pm51-providers-reset' }]) }
      ];
    },
    covers: Object.assign({}, D('providers-home', 'On each provider’s page, or on each account’s page.'), { 'ai.accounts.provider-connections': 'The list “Your AI providers” on this page.', 'ai.usage.provider-health': 'The link “Check every provider” on this page.', 'ai.usage.refresh-models': 'The link “Look for new models” on this page.', 'system.advanced.binary-rescan': 'The link “Find installed apps again” on this page.' }),
    changes: [
      { was: 'The page opens on three counters and a list of all 22 providers, set up or not, beside the full detail of the first one. The counters (12 ready, 1 needs attention, 8 not set up) add up to 21 while the list says 22, and “Ready 12” counts seven providers that have no model switched on, each marked “Ready” above the words “Getting it ready”.', now: 'It opens on sentences: how many providers can answer now (one that is listed but has no model on is “started but not finished”, not ready), how many need you, and which model answers; then what happens when an account runs out. Then only the providers you have; the others are one click away under “more providers you can add”. The filter box narrows both lists.' },
      { was: 'Every account of the selected provider is opened in place, so the Claude page alone carries four copies of the same 14 controls.', now: 'A provider has its own page and an account has its own page. The list shows each provider’s tightest limit, so you can see who is about to run out without opening anything.' },
      { was: '“Check every service” appears twice on the page; the three footer links repeat under all four tabs.', now: 'Each appears once, here.' },
      { was: 'Three warnings live on Settings Home and in the rail, none with a button.', now: '“Needs you” lists them here and on Home, each with the one button that fixes it.' },
      'Wording: the Plans say “AI provider” and “account”; PMConcept7 mixes “service”, “provider” and “platform”. This chapter uses “AI provider” throughout.'
    ]
  });

  /* ================================================================== one provider */
  const RUNS_OUT = { 'next-account': ['Try my next account', 'Then another provider, if you allow that.'], 'next-service': ['Move to another provider', 'The next provider in your order takes over.'], 'next-route': ['Try the next free route', 'Free routes are tried in the order shown.'], ask: ['Stop and ask me', 'Work pauses until you choose.'], overage: ['Keep going, billed by use', 'Pay-per-use prices after the plan’s included use ends.'] };
  const provOf = (ctx) => find(ctx.st, (ctx.params || {}).pid);
  SMX.act('ai-rule-own', (el) => { SMX.local.flags['rule:' + el.getAttribute('data-key')] = true; });
  SMX.act('ai-rule-set', (el) => { const sel = el.querySelector('select'); if (!sel) return; const pid = el.getAttribute('data-provider'), aid = el.getAttribute('data-account'), id = el.getAttribute('data-id'); const v = sel.value === '' ? null : (id === COOL ? sel.value : Number(sel.value)); let ok = false; try { ok = aid ? pol().account.setMany(pid, aid, [{ id, value: v }]) : pol().set(pid, id, v); } catch (e) { ok = false; } if (!ok) { let why = ''; try { why = pol().why(); } catch (e) { why = ''; } SMX.toast('Not changed', why || 'The switch level has to stay below the warn level.', 'info'); } });
  SMX.act('ai-rule-clear', (el) => { const pid = el.getAttribute('data-provider'), aid = el.getAttribute('data-account'); try { if (aid) pol().account.setMany(pid, aid, [{ id: SW, value: null }]); else pol().setMany(pid, [AUTO, SW, WARN, COOL].map((id) => ({ id, value: null }))); } catch (e) { /* nothing to clear */ } SMX.local.flags['rule:' + (aid ? pid + '/' + aid : pid)] = false; });
  SMX.act('ai-provider-remove', (el) => { const pid = el.getAttribute('data-provider'); const st = SMX.fresh(); const p = find(st, pid); if (!p) return; kit().confirm(`Remove ${p.name}?`, 'Puppet Master forgets its accounts and models. “Put the example providers back” on the AI providers page brings it back.', 'Remove', () => { const s2 = W.PM12_KIMI.getState(); s2.providers = (s2.providers || []).filter((x) => x.id !== pid); W.PM12_KIMI.setState(s2); SMX.toast('Provider removed', `${p.name} is gone from your list.`); SMX.go('ai', { replace: true }); }, true); });
  const levelOpts = (list, own, inheritLabel) => [['', inheritLabel]].concat(Array.from(new Set(list.concat(own !== undefined && own !== null && own !== '' ? [Number(own)] : []))).sort((a, b) => a - b).map((n) => [String(n), `${n}% left · ${100 - n}% used`]));
  /* a provider's rule: follows the main rule, or its own */
  const providerRule = (st, p) => {
    let multi = false, own = {}; try { multi = pol().multi(p.id); own = pol().own(p.id) || {}; } catch (e) { multi = false; }
    if (p.id === 'free-models' || p.kind === 'URL' || p.kind === 'Server') return '';
    if (!multi) return ui.rows([{ label: 'Switching between its accounts', help: 'There is nothing to switch to until a second account is signed in.', value: 'One account', muted: true }]);
    const r = ruleWords(st); const hasOwn = Object.keys(own).length > 0; const open = hasOwn || SMX.local.flags['rule:' + p.id];
    if (!open) return ui.rows([{ label: 'Switching between its accounts', help: r.on ? `Follows your main rule: move to the next account at ${r.sw}, warn at ${r.warn}.` : 'Follows your main rule: accounts never switch by themselves.', control: ui.btn({ label: `Give ${p.name} its own rule`, do: 'ai-rule-own', data: { key: p.id } }) + ui.btn({ label: 'The main rule', go: 'ai/limits', ghost: true }) }]);
    const g = (id) => { try { return pol().get(p.id, id) || {}; } catch (e) { return {}; } };
    const wrap = (id, html) => `<span data-smx-do-change="ai-rule-set" data-provider="${h(p.id)}" data-id="${h(id)}">${html}</span>`;
    const auto = g(AUTO);
    return ui.rows([
      { label: `${p.name} has its own rule`, help: 'It no longer follows the main rule for the choices below.', control: ui.btn({ label: 'Use the main rule again', icon: 'refresh', action: 'pm51-providers-policy-shared', data: { provider: p.id } }) },
      { label: 'Switch accounts by themselves', help: 'When an account runs low, the next one with room carries on once the current task ends.', control: toggle(auto.value !== false && auto.value !== 'off', { action: 'pm51-scoped-toggle', data: { scope: SVC, setting: AUTO, provider: p.id }, label: `Switch accounts by themselves for ${p.name}` }) },
      { label: 'Move to the next account at', control: wrap(SW, select(own[SW] === undefined ? '' : String(own[SW]), levelOpts([5, 10, 15, 20, 25, 30], own[SW], `Main rule · ${r.sw}`), { action: 'pm51-noop', label: `Switch level for ${p.name}` })) },
      { label: 'Warn me at', control: wrap(WARN, select(own[WARN] === undefined ? '' : String(own[WARN]), levelOpts([10, 15, 20, 25, 30, 40, 50], own[WARN], `Main rule · ${r.warn}`), { action: 'pm51-noop', label: `Warn level for ${p.name}` })) },
      { label: 'Rest after a rate limit', control: wrap(COOL, select(own[COOL] === undefined ? '' : String(own[COOL]), [['', 'Main rule'], ['5 min', '5 minutes'], ['15 min', '15 minutes'], ['30 min', '30 minutes'], ['60 min', 'an hour']], { action: 'pm51-noop', label: `Rest for ${p.name}` })) }
    ]);
  };
  SMX.page({
    id: 'ai/provider/:pid', chapter: 'ai', parent: 'ai',
    title: (ctx) => { const p = provOf(ctx); return p ? p.name : 'AI provider'; },
    nav: (ctx) => { const p = provOf(ctx); return p ? p.name : 'AI provider'; },
    purpose: (ctx) => { const p = provOf(ctx); return p ? [p.product, p.connect].filter(Boolean).join(' · ') : ''; },
    legacy: [['ai', 'providers', 'services', 'providers']],
    headSide: (ctx) => { const p = provOf(ctx); if (!p) return ''; const st = ctx.st; const can = p.status !== 'disabled' && (p.readiness || {}).installed; return ui.btn({ label: 'Check the connection', icon: 'test', action: 'pm51-providers-check', data: { provider: p.id }, disabled: !can, reason: p.status === 'disabled' ? 'Turn it on first.' : 'Set it up first.' }); },
    lead: (ctx) => {
      const st = ctx.st, p = provOf(ctx);
      if (!p) return [{ key: 'gone', html: ui.card({ title: 'This provider is no longer in your list', body: ui.btn({ label: 'Back to AI providers', go: 'ai' }) }) }];
      const r = p.readiness || {}; const first = usedFirst(p); const accs = ordered(p); const ready = plain(p) === 'Ready';
      const cli = p.kind === 'CLI', url = p.kind === 'URL', free = p.id === 'free-models';
      const facts = free ? [`${routes(st).filter((x) => x.enabled).length} of ${routes(st).length} free routes are on`] : [cli ? (r.installed ? `installed (version ${p.version})` : 'not installed yet') : '', url ? (p.address ? `reaches ${p.address}` : 'no address yet') : r.signedIn ? `signed in${first ? ' as ' + first.identity : ''}` : 'not signed in', url ? '' : `${count(active(p).length, 'account')} in use`, `${count((p.models || []).filter((m) => m.enabled).length, 'model')} ready`].filter(Boolean);
      const blocks = [];
      const prim = ready && p.nextAction === 'addaccount' ? null : primaryFor(p);
      blocks.push({ key: 'summary', html: ui.summary({ icon: 'brain', tone: toneOf(p), lines: [`${ui.b(p.name)} ${ready ? 'is ready' : plain(p) === 'Off' ? 'is turned off' : 'is not ready yet'}: ${facts.map(h).join(', ')}.`, `Last checked ${h(String(p.lastCheck || 'not yet'))}.${p.pairNote ? ' ' + h(p.pairNote) : ''}`], side: (prim && !ready ? ui.btn(Object.assign({ primary: true, small: false }, prim)) : '') + (p.pair && find(st, p.pair) ? ui.btn({ label: `${find(st, p.pair).bill === 'use' ? 'Paying by use instead?' : 'Have the plan instead?'} ${find(st, p.pair).name}`, go: `ai/provider/${p.pair}`, ghost: true }) : '') }) });
      if (!ready && plain(p) !== 'Off' && !free) {
        const steps = [cli || p.kind === 'Server' ? [cli ? 'Install it' : 'A server', !!r.installed, cli ? 'Puppet Master installs it on your Server, only from the official provider, and only when you choose Install.' : 'Let Puppet Master run one, or use one you already run.'] : null, [url ? 'Its address' : (p.signIn || []).every((s) => s[0] === 'apikey') ? 'A key' : 'Sign in', !!r.signedIn, url ? 'The address of the model server on your network.' : (p.signIn || []).map((s) => s[1]).join(', ') || 'Sign in.'], url ? null : ['An account in use', !!r.accountChosen, (p.accounts || []).length ? 'Turn on an account below, or sign in to one again.' : 'Appears once you sign in.'], ['Models', !!r.modelsReady, p.id === 'github-copilot' ? 'This GitHub account has no Copilot seat, so no models can run.' : 'They appear by themselves after you sign in.']].filter(Boolean);
        let stepsHtml = ''; try { let nextDone = false; stepsHtml = kit().steps(steps.map(([title, done, desc]) => { const next = !done && !nextDone; if (next) nextDone = true; return { title, desc, done, status: next ? 'Next' : '', tone: 'info' }; })); } catch (e) { stepsHtml = ''; }
        blocks.push({ key: 'ready', html: ui.card({ title: 'Getting it ready', help: 'Each step turns green by itself. The button above does the next one.', body: stepsHtml }) });
      }
      if (!free && !url && (accs.length || p.kind !== 'Server')) blocks.push({ key: 'accounts', html: ui.things({ title: 'Accounts', help: accs.length > 1 ? 'Tried from the top. When the first runs out, the next one takes over.' : accs.length === 1 ? 'Add another account to keep working when this one runs out.' : '', add: (p.signIn || []).length ? { label: 'Add an account', action: 'pm51-providers-add-account', data: { provider: p.id } } : null, cls: 'smx-accounts',
        items: accs.map((a, i) => { const [word, t] = accStatus(a); return { initials: String(i + 1), name: a.nickname, tag: first && first.id === a.id ? 'Used first' : '', sub: `${a.identity} · ${a.method}`, meters: meters(p, a) || `<span class="smx-quiet-line">${h(usage(a).text || 'Usage appears after sign-in')}</span>`, status: { text: word, tone: t }, go: `ai/provider/${p.id}/${a.id}`, side: accs.length > 1 ? `<span class="smx-order">${ui.btn({ icon: 'up', label2: `Try ${a.nickname} earlier`, action: 'pm51-providers-account-move', data: { provider: p.id, account: a.id, dir: -1 }, ghost: true, disabled: i === 0, reason: 'It is already first.' })}${ui.btn({ icon: 'down', label2: `Try ${a.nickname} later`, action: 'pm51-providers-account-move', data: { provider: p.id, account: a.id, dir: 1 }, ghost: true, disabled: i === accs.length - 1, reason: 'It is already last.' })}</span>` : '' }; }),
        empty: { icon: 'user', title: 'No accounts yet', text: r.installed ? 'Signing in adds the first one.' : 'Accounts appear here after you install and sign in.' } }) });
      if (free) {
        const item = (x) => ({ icon: 'route', name: routeName(x), sub: x.enabled ? [x.models && x.models.length ? x.models.join(', ') : 'No models yet', x.limit].filter(Boolean).join(' · ') : ['Off', x.limit].filter(Boolean).join(' · '), sub2: x.status === 'attention' ? x.signIn : '', status: { text: x.status === 'active' ? 'Ready' : x.status === 'attention' ? 'Needs attention' : 'Off', tone: x.status === 'active' ? 'ready' : x.status === 'attention' ? 'attention' : 'off' }, side: toggle(!!x.enabled, { action: 'pm51-providers-route-toggle', data: { route: x.id }, label: routeName(x) }), action: 'pm51-providers-route', data: { route: x.id } });
        const main = routes(st).filter((x) => !x.more), more = routes(st).filter((x) => x.more);
        blocks.push({ key: 'routes', html: ui.things({ title: 'Free routes', help: 'Each one signs in with its own provider. Their limits can change without notice, so they are tried in this order.', items: main.map(item) }) });
        if (more.length) blocks.push({ key: 'routes-more', html: `<details class="smx-fold smx-fold-more" data-smx-fold="ai:routes"${SMX.local.openMore['ai:routes'] || more.some((x) => x.enabled) ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">More free options</span><span class="smx-fold-help">${count(more.length, 'more route')}</span></summary><div class="smx-fold-body">${ui.things({ items: more.map(item) })}</div></details>` });
      }
      if (p.id === 'opencode') blocks.push({ key: 'server', html: ui.card({ title: 'The server', help: 'The OpenCode server has its own sign-in. Model plans such as OpenCode Go are separate providers.', side: ui.btn({ label: 'Add a server', icon: 'plus', action: 'pm51-providers-opencode-add' }), body: ui.settings(['ai.accounts.opencode-endpoint', 'ai.accounts.opencode-server-auth', 'ai.accounts.opencode-disable-cc-skills']) + `<div class="smx-btn-row smx-pad">${[['Reconnect', 'reconnect'], ['Restart', 'restart'], ['Look for models again', 'discovery'], ['Stop managing it', 'detach']].map(([label, what]) => ui.btn({ label, action: 'pm51-providers-opencode-control', data: { what } })).join('')}</div>` }) });
      const choices = free ? ['next-route', 'ask'] : ['next-account', 'next-service', 'ask'].concat(p.overage ? ['overage'] : []);
      const cur = choices.includes((p.routing || {}).exhaustion) ? p.routing.exhaustion : choices[0];
      blocks.push({ key: 'this', html: ui.card({ title: `Using ${p.name}`, body: srows([
        p.id === 'opencode' ? ui.setting('ai.accounts.opencode-enable', { label: 'Use OpenCode', help: 'Off hides its servers and models.' }) : srow('ai.models.provider-enabled', p.status !== 'disabled', { scope: SVC, data: { provider: p.id }, label: `Use ${p.name}`, help: 'Off sends it nothing new. Its accounts and choices are kept.' })
      ]) + ui.rows([
        p.id === 'github-copilot' ? { label: 'Copilot plan', help: 'Separate from the GitHub account you use for your code.', control: select(p.entitlement || 'Individual', ['Individual', 'Organization', 'Enterprise'], { action: 'pm51-providers-entitlement', data: { provider: p.id }, label: 'Copilot plan' }) } : null,
        { label: 'When it runs out completely', help: (RUNS_OUT[cur] || [])[1], control: select(cur, choices.map((c) => ({ value: c, label: RUNS_OUT[c][0], meta: RUNS_OUT[c][1] })), { action: 'pm51-providers-exhaustion', data: { provider: p.id }, label: 'When it runs out' }) }
      ]) + providerRule(st, p) + (free ? ui.settings(['ai.usage.free-models-auto-apply']) : '') }) });
      return blocks;
    },
    more: [{ key: 'signin', html: (ctx) => { const p = provOf(ctx); if (!p) return ''; const keys = (p.signIn || []).map((s) => s[0]); const modes = ['provider-default'].concat(keys.includes('apikey') ? ['api-key'] : [], keys.some((k) => /^signin-/.test(k)) ? ['oauth'] : [], keys.includes('import-auth') ? ['session'] : []); const rows = [modes.length > 2 ? srow('ai.accounts.auth-mode', sval(p, 'ai.accounts.auth-mode'), { scope: SVC, data: { provider: p.id }, label: 'Preferred way to sign in', help: `Only the ways ${p.name} supports.`, choices: modes }) : '', p.app ? ui.setting(p.app) : '', p.id === 'opencode' ? ui.setting('ai.accounts.opencode-discovery-ttl') : '', p.id === 'opencode' ? ui.setting('ai.accounts.opencode-cli-path') : ''].filter(Boolean); return rows.length ? ui.card({ title: 'Signing in and where its app is', body: srows(rows) }) : ''; }, count: 0 }],
    moreLabel: 'Sign-in and app location',
    expert: [{ key: 'about', html: (ctx) => { const p = provOf(ctx); if (!p) return ''; const r = p.readiness || {}; const yn = (v) => (v ? 'yes' : 'no'); return ui.card({ title: 'About this provider', body: ui.facts([['Made by', p.vendor || '—'], ['Billed as', p.bill === 'plan' ? (p.product || 'A monthly plan') : p.bill === 'use' ? 'Pay as you go' : p.product || 'Free or your own'], ['Installed', p.kind === 'CLI' ? (p.version ? `Version ${p.version} · ${p.installSource}` : 'Not installed') : p.kind === 'Server' ? (p.installSource || 'Server') : 'Nothing to install'], ['Ways to sign in', (p.signIn || []).length ? p.signIn.map((s) => s[1]).join(' · ') : 'No sign-in needed'], ['Limits it reports', Object.keys(p.windows || {}).map((k) => windowLabel(p, k)).join(', ') || 'None'], ...((p.diagnostics || []).map((x, i) => [`Note ${i + 1}`, x])), ['Its id', p.id], ['Connects by', p.kind], ['Ready?', `installed ${yn(r.installed)} · signed in ${yn(r.signedIn)} · account in use ${yn(r.accountChosen)} · models ready ${yn(r.modelsReady)}`], ['Account order', ((p.routing || {}).accountOrder || []).join(' → ') || 'None']]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Look for its models again', icon: 'refresh', action: 'pm51-providers-refresh-models', data: { provider: p.id } })}${ui.btn({ label: 'Save a report (no keys in it)', icon: 'download', action: 'pm51-providers-export', data: { provider: p.id } })}${ui.btn({ label: 'Remove this provider…', icon: 'trash', danger: true, do: 'ai-provider-remove', data: { provider: p.id } })}</div>` }); }, count: 0 }],
    expertLabel: 'About, technical details and removing it',
    changes: [
      { was: 'A provider’s detail pane holds its readiness, a note, every account opened in place, its own rule, and three more folded sections, in a pane that shares the screen with the list of all 22.', now: 'A provider has a page. One sentence says whether it works; then its accounts as a short list, each with its limits; then the few choices about this provider.' },
      { was: 'Reordering accounts uses two chevrons that look like the third chevron beside them, which opens the account instead (Jared’s point 7 of 2026-11-09).', now: 'Two labelled arrows change the order (“Try earlier”, “Try later”); opening an account is a click on its row.' },
      { was: 'The provider’s switch rule is three dropdowns that always show (“Shared · 10% left”), repeating the shared setting.', now: 'One line says the provider follows your main rule and quotes it. The dropdowns appear only when you choose to give this provider its own rule, and one button puts it back.' },
      { was: '“Remove from this list” is hidden in a “More actions” menu beside “Add account” and “Check connection”, which are also buttons on the page.', now: 'Add an account and Check the connection are on the page once. Removing sits with the technical details, marked as risky.' }
    ]
  });

  /* ================================================================== one account */
  const accOf = (ctx) => { const p = provOf(ctx); const a = p ? (p.accounts || []).find((x) => x.id === (ctx.params || {}).aid) : null; return { p, a }; };
  SMX.page({
    id: 'ai/provider/:pid/:aid', chapter: 'ai', parent: 'ai',
    title: (ctx) => { const { a } = accOf(ctx); return a ? a.nickname : 'Account'; },
    nav: (ctx) => { const { a } = accOf(ctx); return a ? a.nickname : 'Account'; },
    purpose: (ctx) => { const { p, a } = accOf(ctx); return a ? `An account at ${p.name}: ${a.identity} · ${a.method}.` : ''; },
    crumbs: (ctx) => { const { p } = accOf(ctx); return p ? [['ai', 'AI providers'], [`ai/provider/${p.id}`, p.name]] : [['ai', 'AI providers']]; },
    legacy: [['ai', 'providers', 'services', 'providers']],
    lead: (ctx) => {
      const st = ctx.st; const { p, a } = accOf(ctx);
      if (!p || !a) return [{ key: 'gone', html: ui.card({ title: 'This account is no longer there', body: ui.btn({ label: 'Back to AI providers', go: 'ai' }) }) }];
      const data = { provider: p.id, account: a.id }; const opt = { scope: ACC, data };
      const [word, t] = accStatus(a); const first = usedFirst(p);
      const key = p.keyOnlyFor ? sval(a, 'ai.accounts.codex-auth-family') === p.keyOnlyFor : ((p.signIn || []).length > 0 && (p.signIn || []).every((s) => s[0] === 'apikey')) || /key|credential/i.test(String(a.method || ''));
      const ready = p.status !== 'disabled' && (p.readiness || {}).installed && inUse(a) && !seatless(a);
      const catalog = p.models || []; const on = catalog.filter((m) => ((a.models || []).find((x) => x.id === m.id) || {}).enabled);
      const PLAN = { Included: 'Included in your plan', Metered: 'Pay per use', Plan: 'Included in the coding plan', Free: 'Free route', Unknown: 'Plan unknown until sign-in', Unavailable: 'Unavailable' };
      const modelsBody = !catalog.length ? ui.note('Models appear here after sign-in.') : !ready ? `<p class="smx-quiet-line">${h(!a.active ? 'They come back after you sign in again.' : a.enabled === false ? 'Turn the account on first.' : seatless(a) ? 'This account needs a seat first.' : 'After setup.')}</p>` : ui.rows([{ label: 'The model this account uses', help: 'Unless a job or a Goal picks another.', control: on.length ? select(a.defaultModel, on.map((m) => [m.id, m.name]), { action: 'pm51-providers-account-model-default', data, label: 'Default model' }) : '<span class="pm51-row-value is-muted">Turn on a model first</span>' }, ...catalog.map((m) => { const am = (a.models || []).find((x) => x.id === m.id); return { label: m.name, help: `${PLAN[m.plan] || m.plan || ''}${m.context && !/N\/A|Unknown/.test(m.context) ? ' · ' + m.context + ' context' : ''}`, control: am ? toggle(!!am.enabled, { action: 'pm51-providers-account-model', data: { provider: p.id, account: a.id, model: m.id }, label: m.name }) : '<span class="pm51-row-value is-muted">Not on this account</span>' }; })]);
      const ownSw = (a.props || {})[SW]; const hasOwn = ownSw !== undefined && ownSw !== null && ownSw !== ''; const openRule = hasOwn || SMX.local.flags['rule:' + p.id + '/' + a.id];
      let inherited = ''; try { inherited = left((pol().account.get(p.id, a.id, SW) || {}).inherited); } catch (e) { inherited = ''; }
      const rule = !openRule ? ui.rows([{ label: 'When this account runs low', help: `Follows ${p.name}’s rule: work moves on at ${inherited}.`, control: ui.btn({ label: 'Give this account its own level', do: 'ai-rule-own', data: { key: p.id + '/' + a.id } }) }])
        : ui.rows([{ label: 'Move on from this account at', help: `Only for ${a.nickname}.`, control: `<span data-smx-do-change="ai-rule-set" data-provider="${h(p.id)}" data-account="${h(a.id)}" data-id="${h(SW)}">${select(hasOwn ? String(ownSw) : '', levelOpts([5, 10, 15, 20, 25, 30], ownSw, `${p.name}’s rule · ${inherited}`), { action: 'pm51-noop', label: `Switch level for ${a.nickname}` })}</span>${ui.btn({ label: `Use ${p.name}’s rule again`, icon: 'refresh', do: 'ai-rule-clear', data: { provider: p.id, account: a.id } })}` }]);
      return [
        { key: 'summary', html: ui.summary({ icon: 'user', tone: t, lines: [`${ui.b(a.nickname)} is ${h(word.toLowerCase())}${first && first.id === a.id ? ' and is used first' : ''}.`, a.active ? '' : 'Work skips it until you sign in again.'], side: a.active ? '' : ui.btn({ label: 'Sign in again', icon: 'user', primary: true, small: false, action: 'pm51-providers-account-signin', data }) }) },
        { key: 'usage', html: windowsOf(p, a).length ? ui.card({ title: 'How much is used', body: `<div class="smx-meters">${meters(p, a)}</div>` }) : '' },
        { key: 'about', html: ui.card({ title: 'This account', body: srows([
          srow('ai.accounts.account-name', a.nickname, Object.assign({}, opt, { label: 'Nickname', help: 'Only the name shown in Puppet Master.', noChanged: true })),
          srow('ai.accounts.account-enabled', a.enabled !== false, Object.assign({}, opt, { label: 'Use this account', help: 'Off keeps it signed in and saved, but work skips it.' })),
          p.id === 'claude-code' ? srow('ai.accounts.claude-login-method', sval(a, 'ai.accounts.claude-login-method'), Object.assign({}, opt, { label: 'How it signs in', help: 'Choosing another way opens that sign-in.' })) : '',
          p.id === 'openai-codex' ? srow('ai.accounts.codex-auth-family', sval(a, 'ai.accounts.codex-auth-family'), Object.assign({}, opt, { label: 'Kind of account', help: 'Set when the account was added. Add another account for the other kind.' })) : '',
          p.gcp ? srow('ai.accounts.gcp-project-id', sval(a, 'ai.accounts.gcp-project-id'), Object.assign({}, opt, { label: 'Google Cloud project', help: 'The project that is billed and whose quota applies.' })) : '',
          srow('ai.accounts.account-roles', sval(a, 'ai.accounts.account-roles'), Object.assign({}, opt, { label: 'Jobs it may do', help: 'None picked means any job. Keep a costly account off routine work.' })),
          srow('ai.accounts.billing-entity', sval(a, 'ai.accounts.billing-entity'), Object.assign({}, opt, { label: 'Who is billed', help: 'Costs on the Usage page are grouped by this.' }))
        ]) + ui.rows([p.regions ? { label: 'Region', help: 'Where this plan was bought.', control: select(a.region || p.regions[0], p.regions, { action: 'pm51-providers-account-region', data, label: 'Region' }) } : null, key ? { label: 'Its key', help: 'Kept in the keychain of the computer that does the work. Never shown again.', covers: p.key || '', status: ui.status('Saved', 'ready'), control: ui.btn({ label: 'Replace the key', icon: 'refresh', action: 'pm51-providers-apikey', data }) } : null]) }) },
        { key: 'models', html: ui.card({ title: 'Models on this account', body: modelsBody }) },
        { key: 'low', html: ui.card({ title: 'Running low', body: rule }) },
        { key: 'actions', html: `<div class="smx-btn-row">${inUse(a) ? ui.btn({ label: 'Use it for the next run', icon: 'pin', action: 'pm51-providers-account-next', data }) : ''}${ui.btn({ label: a.active ? 'Sign out' : 'Sign in again', icon: a.active ? 'lock' : 'user', action: a.active ? 'pm51-providers-account-signout' : 'pm51-providers-account-signin', data })}${ui.btn({ label: 'Remove this account…', icon: 'trash', danger: true, action: 'pm51-providers-account-remove', data })}</div>` }
      ];
    },
    more: [{ key: 'share', html: (ctx) => { const { p, a } = accOf(ctx); if (!a) return ''; const opt = { scope: ACC, data: { provider: p.id, account: a.id } }; return ui.card({ title: 'Sharing work and resting', help: `Only for ${a.nickname}.`, body: sfields([sfield('ai.accounts.switch-mode-override', sval(a, 'ai.accounts.switch-mode-override'), Object.assign({}, opt, { label: 'Sharing work with other accounts' })), sfield('ai.accounts.cooldown-policy', sval(a, 'ai.accounts.cooldown-policy'), Object.assign({}, opt, { label: 'Rest after a rate limit' })), sfield('ai.accounts.retry-budget', sval(a, 'ai.accounts.retry-budget'), Object.assign({}, opt, { label: 'Retries before it rests' }))]) }); }, count: 3 }],
    expert: [{ key: 'tech', html: (ctx) => { const { p, a } = accOf(ctx); if (!a) return ''; const opt = { scope: ACC, data: { provider: p.id, account: a.id } }; const key = /key|credential/i.test(String(a.method || '')) || ((p.signIn || []).length > 0 && (p.signIn || []).every((s) => s[0] === 'apikey')); return ui.card({ title: 'Technical', body: sfields([sfield('ai.accounts.auth-family', sval(a, 'ai.accounts.auth-family'), Object.assign({}, opt, { label: 'Account type' })), sfield('ai.accounts.quota-profile', sval(a, 'ai.accounts.quota-profile'), Object.assign({}, opt, { label: 'Quota profile' })), key ? sfield('ai.accounts.credential-storage', sval(a, 'ai.accounts.credential-storage'), Object.assign({}, opt, { label: 'Where the key is kept' })) : '', key ? sfield('ai.accounts.auth-surface', sval(a, 'ai.accounts.auth-surface'), Object.assign({}, opt, { label: 'How the key is sent' })) : '']) }); }, count: 2 }],
    changes: [
      { was: 'An account opens in place inside its provider’s pane: about 890 px of controls per account, 14 of them, under four sub-headings. Four accounts means the same block four times on one page.', now: 'An account has a page of its own. It says whether the account works, shows its limits, then its five everyday choices. Sharing, resting and technical fields are folded.' },
      { was: '“Switch when this much is left” appears in every account as a dropdown that reads “Claude · 10% left”, a third copy of the shared choice.', now: 'One line says the account follows its provider’s rule and quotes it. The dropdown appears only if you give this account its own level.' },
      { was: '“Models on this account” comes first, before the account’s name and on/off switch.', now: 'Order follows how often things are needed: is it working, how much is used, its name and switch, then models.' }
    ]
  });

  /* ================================================================== Which model does what */
  const JOB_IDS = ['ai.models.overseer-model', 'ai.models.worker-model', 'ai.models.gui-worker-model', 'ai.models.high-effort-worker-model', 'ai.models.auditor-model', 'ai.models.goal-worker-model', 'ai.models.goal-verifier-model', 'ai.models.subagent-model', 'ai.models.teach-model', 'ai.models.thread-title-model'];
  const followsEveryday = (v) => v == null || v === '' || /^(same as|automatic|default|inherit)/i.test(String(v));
  SMX.page({
    id: 'ai/models', chapter: 'ai', nav: 'Which model does what', icon: 'sparkle',
    title: 'Which model does what',
    purpose: 'One model answers everything unless you give a job its own. This page is the only place that choice is made.',
    blurb: (ctx) => { const n = JOB_IDS.filter((id) => SMX.has(id) && !followsEveryday(SMX.val(id))).length; return `${model(ctx.st)} answers${n ? ` · ${count(n, 'job')} use${n === 1 ? 's' : ''} another model` : ' everything'}`; },
    legacy: [['ai', 'providers', 'models', 'providers']],
    keywords: ['model', 'default model', 'thinking', 'reasoning', 'effort', 'temperature', 'opus', 'sonnet', 'gpt'],
    lead: (ctx) => {
      const st = ctx.st; const own = JOB_IDS.filter((id) => SMX.has(id) && !followsEveryday(SMX.val(id)));
      const others = [
        ['Back Seat Driver', SMX.val('safety.approvals.bsd-model'), 'ai/advisor'],
        ['Making pictures', SMX.val('media.image.model'), 'ai/media'],
        ['Reading pictures while planning', SMX.val('planning.interview.vision-provider'), 'planning'],
        ['Each persona', 'A persona can prefer its own model', 'memory/personas'],
        ['Each of your commands', 'A command can name its own model', 'code/commands'],
        ['Each account', 'An account has the model it uses by default', 'ai']
      ].filter((x) => x[1] != null);
      SMX.local.modelOthers = others; SMX.local.modelOwn = own.length;
      return [];
    },
    sections: [
      { key: 'everyday', title: 'The everyday model', help: 'What answers when nothing more specific is chosen: chat, planning, research and building.', ids: ['ai.models.default-model', 'ai.models.default-provider', 'ai.models.default-variant', 'ai.models.reasoning-effort'] },
      { key: 'jobs-head', html: () => { const n = SMX.local.modelOwn || 0; return ui.summary({ icon: 'sparkle', tone: 'info', lines: [n ? `${ui.b(count(n, 'job'))} ${n === 1 ? 'uses' : 'use'} a model of ${n === 1 ? 'its' : 'their'} own. Every other job uses the everyday model.` : 'Every job uses the everyday model. That is right for most people.', 'A stronger model for the hardest jobs and a cheaper one for small ones can save money. You can change one job below without touching the rest.'] }); } },
      S('providers-jobs', { title: 'A model for each job', help: 'Leave one on “Same as the everyday model” and it follows it.' }),
      S('providers-jobs-more', { title: 'Goals, helpers and small jobs' }),
      { key: 'elsewhere', html: () => ui.card({ title: 'Other places that pick a model', help: 'These belong to one thing each, so they are set where that thing is. They are listed here so you can always answer “which model will do this?”.', body: `<div class="smx-things">${(SMX.local.modelOthers || []).map(([name, v, go]) => `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(go)}"><span class="smx-thing-copy"><span class="smx-thing-name">${h(name)}</span><span class="smx-thing-sub">${h(String(v))}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`).join('')}</div>` }) },
      S('providers-everyday', { key: 'everyday-more', title: 'Knowing what answered', help: 'So nothing swaps without you seeing it.', ids: ['general.interaction.provider-disclosure', 'ai.usage.auto-refresh-discovery'] })
    ],
    more: [S('providers-presets', { title: 'Your own presets and nicknames' })],
    expert: [S('providers-answers'), S('providers-features'), S('providers-lanes')],
    changes: [
      { was: '39 rows on one tab: 12 model dropdowns of 14 to 23 options each are shown at once, before anything says most people need only the first.', now: 'The everyday model comes first, alone. A sentence says whether any job differs. The per-job rows follow for those who want them.' },
      { was: 'Which model does the work is decided in at least seven places (this tab, each account, each persona, each command, Back Seat Driver, Media, Planning): 70 rows in 20 views mention a model, and no page says which one wins.', now: 'This page owns the choice and lists every other place that can pick a model, with its current value and a link.' },
      { was: '“Service tried first” and “Everyday model” are two rows that can disagree (a model from a provider that is not the one tried first).', now: 'They sit together in one card under one explanation, model first.' },
      { was: 'Expert rows (“Instruction role name”, “Work lanes”, “Role rules”, “Gemini cache lifetime”) share the page with the everyday choice under one “More options”.', now: 'They are under “For experts”. Presets and nicknames, which some people do use, are under “More options”.' }
    ]
  });

  /* ================================================================== When an account runs out */
  SMX.page({
    id: 'ai/limits', chapter: 'ai', nav: 'When an account runs out', icon: 'swap',
    title: 'When an account runs out',
    purpose: 'One rule for every provider and account. A provider or an account can differ, and then it is listed here as an exception.',
    blurb: (ctx) => { const r = ruleWords(ctx.st); const n = exceptions(ctx.st).length; return `${r.on ? `Move to the next account at ${r.sw}` : 'Accounts never switch by themselves'}${n ? ` · ${count(n, 'exception')}` : ''}`; },
    legacy: [['ai', 'providers', 'limits', 'providers']],
    keywords: ['switch', 'auto-switch', 'fallback', 'quota', 'rate limit', 'runs out', 'threshold'],
    lead: (ctx) => {
      const st = ctx.st; const ex = exceptions(st); const r = ruleWords(st);
      const single = all(st).filter((p) => isSetUp(p) && (p.accounts || []).length === 1 && p.kind !== 'URL' && p.kind !== 'Server' && p.id !== 'free-models');
      return [
        { key: 'rule', html: ui.card({ title: 'The main rule', help: 'Used by every provider that has two or more accounts, unless it is listed as an exception below.', body:
          ui.sentence(`<span>When an account runs low, move to the next one by itself</span>${ui.toggle(AUTO, { label: 'Switch accounts by themselves' })}`) +
          ui.sentence(`<span>Move on when an account has</span>${ui.select(SW, { label: 'Switch when this much is left' })}<span>and warn me at</span>${ui.select(WARN, { label: 'Warn when this much is left' })}`) +
          ui.sentence(`<span>Wait for a natural break before moving</span>${ui.toggle('ai.accounts.soft-switch', { label: 'Switch at a natural break' })}`) +
          `<p class="smx-sentence-note">${r.on ? `For example: when your first Claude account has ${h(r.sw)}, the task in hand finishes and the next task starts on your second account.` : 'With this off, an account that runs low stays in use until you switch yourself.'}</p>` }) },
        { key: 'exceptions', html: ui.things({ title: 'Exceptions', help: 'A provider or an account with its own rule. Open one to change it or to put it back on the main rule.',
          items: ex.map((x) => ({ initials: initials(x.kind === 'account' ? x.a.nickname : x.p.name), name: x.kind === 'account' ? `${x.a.nickname} · ${x.p.name}` : x.p.name, tag: x.kind === 'account' ? 'One account' : 'A provider', sub: x.text, go: x.kind === 'account' ? `ai/provider/${x.p.id}/${x.a.id}` : `ai/provider/${x.p.id}`, side: ui.btn({ label: 'Use the main rule', do: 'ai-rule-clear', data: { provider: x.p.id, account: x.kind === 'account' ? x.a.id : null } }) })),
          empty: { icon: 'check', title: 'No exceptions', text: 'Every provider and account follows the main rule. To give one its own, open it and choose “Give it its own rule”.' } }) },
        { key: 'single', html: single.length ? `<p class="smx-quiet-line">${h(single.map((p) => p.name).join(', '))}: one account each, so there is nothing to switch to until you add a second.</p>` : '' }
      ];
    },
    sections: [
      S('providers-switch-services', { title: 'When a whole provider is down or used up', help: 'Whether work may move to another provider, and in which order they are tried.' }),
      S('providers-switch-accounts', { title: 'Which account goes first', help: 'Each provider’s own order is on its page.', ids: ['ai.accounts.default-account', 'ai.accounts.account-binding'] })
    ],
    expert: [S('providers-limits-more')],
    covers: { 'ai.accounts.multi-account-switching': 'The first sentence of the main rule.', 'ai.accounts.hard-switch-level': 'The second sentence of the main rule.', 'ai.accounts.soft-warning-level': 'The second sentence of the main rule.', 'ai.accounts.soft-switch': 'The third sentence of the main rule.' },
    changes: [
      { was: 'The tab opens with “Auto-switch policies”: one row per provider, each with a switch and a dropdown that mostly repeat the shared value (“Shared · 10% left”). The shared setting they repeat comes after them.', now: 'The rule comes first and reads as three sentences with the real controls inside them, followed by an example of what it means.' },
      { was: 'The same level exists as a shared setting, per provider (drawn here and on each provider) and per account (drawn in every account): one value in up to 30 dropdowns, and nothing lists who differs.', now: 'One rule, and one list of exceptions. Each exception says how it differs and has a button that puts it back.' },
      { was: 'Providers with one account get a sentence listing eight names in the middle of the policy list.', now: 'The same fact is one quiet line under the exceptions.' }
    ]
  });

  /* ================================================================== Spending & warnings */
  SMX.page({
    id: 'ai/spending', chapter: 'ai', nav: 'Spending & warnings', icon: 'wallet',
    title: 'Spending & warnings',
    purpose: 'A monthly limit on what the AI may cost, and a heads-up before any limit is reached.',
    blurb: () => { const v = Number(SMX.val('ai.usage.monthly-spend-limit')); return v > 0 ? `At most $${v} a month` : 'No monthly limit set'; },
    legacy: [['ai', 'providers', 'usage', 'providers']],
    keywords: ['budget', 'spend', 'cost', 'limit', 'usage', 'warning', 'tokens'],
    lead: () => [{ key: 'usage', html: ui.links([{ label: 'See what was used: open the Usage page', do: 'open-usage' }, { label: 'Limits for a single run', go: 'safety/limits' }, { label: 'What web research may spend', go: 'ai/web' }]) }],
    sections: [S('providers-budgets', { title: 'Monthly limit', help: '0 means no limit.' }), S('providers-warnings', { title: 'Warnings', help: 'A heads-up before anything stops.' }),
      { key: 'creep', title: 'Costs that creep up', help: 'Some changes to instructions make every request cost more, because the AI can no longer reuse what it has already read. This warns you before such a change takes effect.', ids: ['system.advanced.cache-linter'] }],
    more: [S('providers-board', { title: 'What the Usage page shows', help: 'These only change how the Usage page looks. You can also change them there.' })],
    moreLabel: 'What the Usage page shows', moreHelp: 'Display choices for the Usage page',
    expert: [Object.assign(S('providers-records'), { also: ['ai.usage.usage-retention'] })],
    changes: [
      { was: 'Spending limits, warnings and six display options of the Usage page (chart style, rows per page, export format) are one tab of equal-weight rows.', now: 'The limit and the warnings are the page. The Usage page’s display options are folded, with a note that they can be changed on the Usage page itself.' },
      { was: 'Money limits are in four places: here, Permissions › Limits (per run), each persona (“Spending cap”) and Web (“Never spend more than”). No page points to the others.', now: 'This page links to the per-run limits and to web spending, and they link back.' }
    ]
  });
  SMX.act('open-usage', () => { try { W.PM_PAGES.go('usage'); } catch (e) { /* no Usage page */ } });

  /* ================================================================== Web research, media, the advisor: their rows; lists come from layer/pages/ai-more.js */
  SMX.page({
    id: 'ai/web', pending: true, chapter: 'ai', nav: 'Web research', icon: 'globe', title: 'Web research',
    purpose: 'Lets the assistant look things up on the web: search, read pages, follow links.',
    legacy: [['ai', 'web', 'abilities', 'web'], ['ai', 'web', 'services', 'web'], ['ai', 'web', 'limits', 'web'], ['ai', 'web', 'network', 'web']],
    keywords: ['web search', 'search', 'crawl', 'firecrawl', 'tavily', 'brave', 'exa', 'proxy', 'offline'],
    sections: [S('web-spending', { title: 'What web research may spend' })],
    more: [S('web-caching-o55', { title: 'Saved web pages' }), S('web-network-o55', { title: 'Network and proxy' })],
    expert: [S('web-network-more')],
    covers: Object.assign({}, D('web-abilities', 'The card “What it can do on the web” on this page.'), D('web-services', 'The list “Search services” on this page.'))
  });
  SMX.page({
    id: 'ai/media', pending: true, chapter: 'ai', nav: 'Pictures, voice & video', icon: 'image', title: 'Pictures, voice & video',
    purpose: 'Whether the assistant can make and understand pictures, speech, video and music, and where the results go.',
    legacy: [['ai', 'media', 'abilities', 'media'], ['ai', 'media', 'files', 'media']],
    keywords: ['image', 'picture', 'voice', 'speech', 'tts', 'video', 'music', 'screenshot'],
    sections: [S('media-io', { title: 'Pictures you share' }), S('media-files', { title: 'Where results go' })],
    expert: [S('media-more')],
    covers: Object.assign({}, D('media-switches', 'The switches at the top of this page.'), D('media-abilities', 'The list “What it can make and understand” on this page.'))
  });
  SMX.page({
    id: 'ai/advisor', pending: true, chapter: 'ai', nav: 'Back Seat Driver', icon: 'eye', title: 'Back Seat Driver',
    purpose: 'A second AI that watches the work as it happens and speaks up when something looks wrong. It never changes anything itself.',
    legacy: [['ai', 'bsd', 'overview', 'bsd'], ['ai', 'bsd', 'stages', 'bsd'], ['ai', 'bsd', 'findings', 'bsd']],
    keywords: ['advisor', 'second opinion', 'bsd', 'watcher', 'findings'],
    covers: Object.assign({}, D('bsd-advisor', 'The card “The advisor” on this page.'), D('bsd-stages', 'The card “Where it watches” on this page.'), D('bsd-memory', 'Two fields under For experts.'))
  });

  /* search: providers and accounts by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => {
    const out = [];
    for (const p of all(st)) { out.push({ title: p.name, sub: 'AI providers', route: `ai/provider/${p.id}` }); for (const a of (p.accounts || [])) out.push({ title: a.nickname, sub: `AI providers › ${p.name} › account`, route: `ai/provider/${p.id}/${a.id}` }); }
    return out;
  });
})(window);
