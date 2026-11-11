/* Settings managers, rethought (Fable 5.2): three more pages of the chapter "AI providers".
   Today these are three managers of nine tabs: Web & Research (Abilities, Search services, Limits & saving, Network),
   Media & Output (Abilities, Pictures & files) and Back Seat Driver (Overview, Stages, Findings). Each opens on a
   list of abilities or a strip of counters, and none says in a sentence whether the thing works. Here:
   - Web research answers "can the assistant look things up, and with what?". Every ability and every search service
     is a thing with a page of its own, named for what it does; each setting is drawn once, on the page it belongs to.
   - Pictures, voice & video answers "can it make and understand pictures, speech, video and music?". The three
     switches that decide what may run at all come first, each saying what turning it off means.
   - Back Seat Driver says what it is, whether it is on and what it last said; how much it watches is the first
     control; a note it raised is a sentence a person can act on, with the raw references under "For experts".
   A model or an AI provider that one of these picks for itself is worded as an exception to the everyday model and
   links to "Which model does what"; keys of AI providers, monthly spending and what may run without asking are linked,
   never drawn again.
   Every control is PMConcept7's own: rows are the kit's rows bound to the same setting ids, and buttons call the
   actions the three managers have today. Where an action exists only as an item of a "More actions" menu, a plain
   button here opens that menu from the manager and presses the item (putting one ability back to how it came), or
   writes the same fields the item writes (turning one web ability off, dismissing a note).
   Two things show what PMConcept7 means to do where it does something else today, and say so in their page's
   `changes`: removing a search key (PMConcept7's Remove changes nothing for the two example keys), and one list of
   models for Back Seat Driver's backup (PMConcept7 offers a different list from the one for its main model).
   Data that moves: the Media manager tidies its example data the first time it draws, so its list is read through the
   same rules and the manager is asked to draw once; Back Seat Driver's stages are read from the setting once it holds
   them and from the manager's state before that. Each list reads the same on a fresh load and afterwards. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const DOC = W.document;

  /* ------------------------------------------------------------------ small helpers */
  const val = (id) => SMX.val(id);
  const isOn = (id) => { const v = val(id); return !!v && v !== 'off'; };
  const say = (id, v) => { const x = v === undefined ? val(id) : v; try { return String(kit().valueLabel(id, x) || x); } catch (e) { return String(x); } };
  const count = d.plural;
  const and = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  /* the names of several abilities as the start of a sentence: “Reading aloud and making short videos” */
  const nouns = (rs, names) => cap(and(rs.map((r) => String(names[r.id].noun).charAt(0).toLowerCase() + String(names[r.id].noun).slice(1))));
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const steps = (items) => { try { return kit().steps(items); } catch (e) { return ''; } };
  const provider = (name) => { try { return String(kit().serviceName(name) || name); } catch (e) { return String(name || ''); } };
  const everyday = () => { const v = val('ai.models.default-model'); return v ? say('ai.models.default-model', v) : 'the everyday model'; };
  const ago = (t) => String(t || '').replace(/\b(\d+) h\b/, (m, n) => `${n} hour${n === '1' ? '' : 's'}`).replace(/\b(\d+) min\b/, (m, n) => `${n} minute${n === '1' ? '' : 's'}`).replace(/\b(\d+) s\b/, (m, n) => `${n} second${n === '1' ? '' : 's'}`);
  const where = (id, fallback) => { const w = SMX.where(id); return w ? w.route : fallback; };
  /* change the engine's demo state, the way the item of a manager's own menu does */
  const write = (fn) => { const st = eng().getState(); fn(st); eng().setState(st); SMX.fresh(); SMX.soon(30); };
  const fold = (key, label, help, body) => `<details class="smx-fold smx-fold-more" data-smx-fold="${h(key)}"${SMX.local.openMore[key] ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">${h(label)}</span><span class="smx-fold-help">${h(help)}</span></summary><div class="smx-fold-body">${body}</div></details>`;
  const gone = (what, back, label) => [{ key: 'gone', html: ui.card({ title: `This ${what} is no longer there`, body: ui.btn({ label, go: back }) }) }];
  const uncover = (page, ids) => { if (page && page.covers) for (const id of ids) delete page.covers[id]; };
  /* A card that holds a field of this page's own is left as it is while the person types in that field: drawing it
     again on every keystroke would move the caret. */
  const kept = {};
  const steady = (key, html) => { const a = DOC.activeElement; if (a && a.getAttribute && a.getAttribute('data-am-field') === key && kept[key]) return kept[key]; kept[key] = html; return html; };
  /* an item of a menu that PMConcept7 opened from one of these pages' buttons */
  const pickMenu = (text) => { const pop = DOC.querySelector('.pm51-popout.pm51-menu'); const it = pop ? [...pop.querySelectorAll('.pm51-menu-item')].find((b) => ((b.querySelector('.pm51-popout-label') || b).textContent || '').trim() === text) : null; if (it) it.click(); return !!it; };
  /* The “More actions” button of the detail that shows the named thing. PMConcept7 swaps one detail for the next with
     a short animation, so just after a selection the detail of the thing shown before is still there, and its menu is
     that thing’s menu. This answers only once the right detail is showing. */
  const moreFor = (name) => (b) => { for (const dt of b.querySelectorAll('.pm51-detail')) { const t = dt.querySelector('.pm51-detail-title'); if (!t || t.textContent.trim().indexOf(name) !== 0) continue; const btn = [...dt.querySelectorAll('button')].find((x) => /^More actions$/.test((x.getAttribute('aria-label') || x.textContent || '').trim())); if (btn) return btn; } return null; };
  /* The Settings engine goes back to its parked place with a short animation. Until it has arrived nothing may
     “follow” it, or the page would jump to the manager the engine is just leaving. */
  const untilParked = () => { let n = 0; SMX.borrowing = true; const look = () => { let home = true; try { home = !!eng().getState().home; } catch (e) { home = true; } if (home || ++n > 80) { SMX.borrowing = false; SMX.fresh(); SMX.soon(30); } else W.setTimeout(look, 40); }; look(); };
  const afterLending = () => { let n = 0; const watch = () => { if (++n > 3000) return; if (SMX.borrowing) { W.setTimeout(watch, 25); return; } let home = true; try { home = !!eng().getState().home; } catch (e) { home = true; } if (!home) untilParked(); }; W.setTimeout(watch, 25); };
  const borrowItem = (name, specOf, item) => { SMX.warmers[name] = specOf; SMX.act(name, async (el) => { const ok = await SMX.borrow(el, specOf(el)); if (!ok) return; afterLending(); for (let i = 0; i < 14; i++) { if (pickMenu(item)) return; await SMX.wait(60); } }); };

  /* ================================================================== Web research: what the manager knows */
  const WEB = { matrix: 'web.providers.capability-matrix', status: 'web.providers.provider-status', keys: 'web.providers.web-api-keys', search: 'web.providers.web-search-enable', offline: 'web.fetch.air-gap-mode', ask: 'web.fetch.cost-warning-threshold', backup: 'web.providers.provider-order', errors: 'web.providers.health-disclosure' };
  const WEB_OLD = ['ai', 'web', 'abilities', 'web'];
  const KEYS_PANEL = { action: 'run-setting-action', data: { setting: WEB.keys, settingId: WEB.keys } };
  /* the six abilities, named for what each lets the assistant do; "was" is PMConcept7's one-word name */
  const AB = {
    search: { name: 'Search the web', was: 'Search', icon: 'search', verb: 'search the web', noun: 'Searching the web', short: 'Looks things up and tells you which sources it used.', role: 'decides what to look for and writes the answer', roleShort: 'writes the answer', purpose: 'Lets the assistant look something up when it does not know: current facts, documentation, prices, news. It tells you which sources it used.', limits: ['web.fetch.search-max-results', 'web.fetch.research-max-sources', 'web.fetch.research-auto-read-pages'], limitsHelp: 'How much one search may bring back and read.' },
    fetch: { name: 'Read a page', was: 'Fetch', icon: 'download', verb: 'read a page', noun: 'Reading a page', short: 'Reads one page or file you point it at.', role: 'reads the page for you', roleShort: 'reads it', purpose: 'Lets the assistant read one web page or file you point it at, such as an article, a manual or a PDF.', limits: ['web.fetch.pdf-mode', 'web.fetch.request-timeout'], limitsHelp: 'How one page is read, and how long it may take.' },
    crawl: { name: 'Read a whole site', was: 'Crawl', icon: 'network', verb: 'read a whole site', noun: 'Reading a whole site', short: 'Follows links and reads many pages of one site.', role: 'decides which pages matter', roleShort: 'picks the pages', purpose: 'Lets the assistant follow the links of one website and read many of its pages, for example all the documentation of a tool. You set how many pages and how far it follows links.', limits: ['web.fetch.crawl-max-pages', 'web.fetch.crawl-max-depth'], limitsHelp: 'How far it may go into one site.' },
    browser: { name: 'Use a real browser', was: 'Browser', icon: 'browser', verb: 'use a real browser', noun: 'Using a real browser', short: 'Clicks, types and scrolls, the way a person would.', role: 'decides where to click and what to type', roleShort: 'does the clicking', purpose: 'Lets the assistant open pages in the built-in browser and click, type and scroll the way a person would. Some sites only work that way.', limits: [] },
    map: { name: 'Outline a site', was: 'Map', icon: 'map', verb: 'outline a site', noun: 'Outlining a site', short: 'Lists what a website or a codebase contains.', role: 'sorts what it finds into an outline', roleShort: 'sorts what it finds', purpose: 'Lets the assistant list what a website or a codebase contains, as an outline, before it decides what to read.', limits: ['web.fetch.map-max-pages', 'web.fetch.map-max-depth'], limitsHelp: 'How large an outline may get.' },
    extract: { name: 'Pull out data', was: 'Extract', icon: 'brackets', verb: 'pull data out of pages', noun: 'Pulling out data', short: 'Turns pages and documents into tables and lists.', role: 'reads the pages and fills in the data', roleShort: 'fills in the data', purpose: 'Lets the assistant turn pages and documents into tables and lists, and check that the result is complete.', limits: [] }
  };
  const AB_IDS = Object.keys(AB);
  const USED_FOR = { search: 'search the web', research: 'answer questions that need several sources', fetch: 'read a page', crawl: 'read a whole site', map: 'outline a site', extract: 'pull out data' };
  const abRoute = (id) => `ai/web/ability/${id}`;
  /* the search services, with the names PMConcept7 stores them under */
  const SERVICES = [
    { key: 'exa', name: 'Exa', label: 'Exa', icon: 'search', enable: 'web.providers.exa-enable', keyed: true, site: 'exa.ai', what: 'Strong at searching and at questions that need several sources.' },
    { key: 'tavily', name: 'Tavily', label: 'Tavily', icon: 'search', enable: 'web.providers.tavily-enable', keyed: true, site: 'tavily.com', what: 'Searches, reads pages and pulls data out of them.', rows: ['web.providers.tavily-fetch-mode'], rowsTitle: 'How Tavily reads', rowsHelp: 'Reading more deeply finds more and costs more for each page.' },
    { key: 'firecrawl', name: 'Firecrawl', label: 'Firecrawl', icon: 'network', enable: 'web.providers.firecrawl-enable', keySetting: 'web.providers.firecrawl-api-key', site: 'firecrawl.dev', what: 'Reads difficult sites, the kind that only show their content after scripts have run. Works with a key, or with a Firecrawl server of your own.', rows: ['web.providers.firecrawl-url', 'web.fetch.firecrawl-proxy-mode', 'web.fetch.provider-cache'], rowsTitle: 'How Firecrawl works', rowsHelp: 'Leave these as they are unless you run your own Firecrawl server or a site keeps blocking it.' },
    { key: 'brave', name: 'Brave', label: 'Brave Search', icon: 'search', enable: 'web.providers.brave-enable', keyed: true, site: 'brave.com/search/api', what: 'A search index of its own, independent of the big search engines.' },
    { key: 'jina', name: 'Jina', label: 'Jina Reader', icon: 'file', enable: 'web.providers.jina-enable', keyed: true, site: 'jina.ai', what: 'Reads pages that other services cannot.' },
    { key: 'duckduckgo', name: 'DuckDuckGo', label: 'DuckDuckGo', icon: 'search', enable: 'web.providers.duckduckgo-enable', free: true, what: 'Free, basic search. A good backup when the others have no answer. No key.' },
    { key: 'site-reader', name: 'Site Reader', label: 'Site Reader', icon: 'file', builtIn: true, what: 'Puppet Master’s own page reader. Built in, nothing to set up.' },
    { key: 'model-native', name: 'model-native', label: 'Your AI model’s own web search', said: 'your AI model’s own web search', icon: 'brain', enable: 'web.providers.model-native-enable', free: true, what: 'The search that comes with the AI account you already have. No extra key.' }
  ];
  const CHAIN_ONLY = { 'PM-composed search+read': { name: 'PM-composed search+read', label: 'Puppet Master’s own search and read', said: 'Puppet Master’s own search and read', builtIn: true, what: 'Searches with the services above, then reads the results itself.' } };
  const svc = (name) => SERVICES.find((s) => s.name === name) || CHAIN_ONLY[name] || { name, label: name, what: '' };
  const svcRoute = (s) => `ai/web/service/${s.key}`;
  const webRoutes = (st) => st.webRoutes || [];
  const webRoute = (st, id) => webRoutes(st).find((r) => r.id === id) || null;
  const searchOn = () => val(WEB.search) !== false;
  const offline = () => isOn(WEB.offline);
  const abState = (r) => ((r.id === 'search' && !searchOn()) || r.status === 'disabled' ? 'Off' : r.status === 'ready' ? 'Ready' : 'Not set up');
  const abTone = (word) => (word === 'Ready' ? 'ready' : 'off');
  const chainOf = (ability) => { const raw = (val(WEB.matrix) || {})[ability]; return typeof raw === 'string' && raw.trim() ? raw.split(/\s*(?:→|->|,)\s*/).filter(Boolean) : []; };
  const hasKey = (st, s) => { const p = st.pm51 || {}; const known = (val(WEB.status) || {})[s.name] === 'connected'; return s.keySetting ? !!(p.o55Keys || {})[s.keySetting] || known : !!(p.o55WebKeys || {})[s.name] || (!!s.keyed && known); };
  /* A service's state. PMConcept7 says "Off" for a service that is off even when it also has no key; here that reads
     "Not set up", because switching it on would not be enough. */
  const svcFacts = (st, s) => {
    const off = !!s.enable && val(s.enable) === false;
    const needsKey = !!(s.keyed || s.keySetting) && !hasKey(st, s);
    const raw = (val(WEB.status) || {})[s.name];
    const failed = raw === 'failed' || raw === 'error';
    const status = s.builtIn ? ['Built in', 'ready'] : off ? (needsKey ? ['Not set up', 'off'] : ['Off', 'off']) : needsKey ? ['Needs a key', 'attention'] : failed ? ['Failed recently', 'blocked'] : ['Ready', 'ready'];
    return { off, needsKey, failed, usable: !!s.builtIn || (!off && !needsKey), status, mine: !!s.builtIn || !off || (!!(s.keyed || s.keySetting) && !needsKey) };
  };
  const usedBy = (s) => Object.keys(val(WEB.matrix) || {}).filter((k) => chainOf(k).includes(s.name));
  const isTool = (e) => !e || e.type === 'tool' || e.provider === 'Built-in';
  const modelWords = (e) => (!e ? 'nothing yet' : isTool(e) ? `a built-in tool (${e.model})` : `${e.model} from ${provider(e.provider)}`);
  const backupWords = (r) => { const on = (r.fallbacks || []).filter((f) => f.enabled !== false); return on.length ? `Then ${on.map(modelWords).join(', then ')}.` : 'Nothing. It stops and tells you.'; };
  const LAST = { search: '2 h ago', fetch: '2 h ago', browser: 'yesterday', map: '3 h ago', extract: '2 h ago' };
  const checkWords = (r) => { const s = abState(r); if (s === 'Off') return 'Not checked while it is off'; if (r.lastCheck) return /since the change/i.test(r.lastCheck) ? 'Not checked since you changed its model' : ago(r.lastCheck); return r.status === 'ready' ? `Passed ${ago(LAST[r.id] || '2 h ago')}` : 'Not checked yet'; };
  /* a list of services in the order they are tried: the ones that will run are numbered, the others say why not */
  const chainHtml = (st, names) => {
    if (!names.length) return '<span class="pm51-row-value is-muted">None: only its AI model is used</span>';
    let n = 0;
    return `<span class="smx-am-chain">${names.map((nm) => { const s = svc(nm), f = svcFacts(st, s); return f.usable ? `<span class="smx-am-step"><b>${++n}</b><span>${h(s.label)}</span></span>` : `<span class="smx-am-step is-skipped"><span>${h(s.label)}</span><i>${f.off ? (f.needsKey ? 'not set up' : 'off') : 'no key'}, skipped</i></span>`; }).join(`<span class="smx-am-then">${SMX.icon('arrowRight')}</span>`)}</span>`;
  };
  const usable = (st, names) => names.map(svc).filter((s) => svcFacts(st, s).usable);
  const chainTitle = (id) => (id === 'research' ? 'Questions that need several sources: search services, in order' : `${AB[id].name}: search services, in order`);

  /* what needs the person: only what is wrong. An ability that was never set up is offered on the page, not here. */
  const webProblems = (st) => {
    const out = [];
    if (offline()) return out;
    for (const s of SERVICES) {
      const f = svcFacts(st, s);
      if (!f.off && f.needsKey) out.push({ title: `${s.label} is switched on but has no key`, detail: 'It is skipped until it has one.', fix: { label: 'Add its key', action: 'pm51-web-key', data: { service: s.name } }, also: { label: 'Open', go: svcRoute(s) } });
      else if (!f.off && f.failed) out.push({ tone: 'blocked', title: `${s.label} failed its last check`, detail: 'The next service in the order is used until it answers again.', fix: { label: 'Open', go: svcRoute(s) } });
    }
    for (const r of webRoutes(st)) {
      if (!AB[r.id] || r.id === 'browser' || abState(r) !== 'Ready') continue;
      const names = chainOf(r.id);
      if (names.length && !usable(st, names).length) out.push({ title: `${AB[r.id].noun} has no search service it can use`, detail: 'Every service in its order is off or has no key.', fix: { label: 'Change the order', action: 'pm51-web-chain', data: { ability: r.id, title: chainTitle(r.id) } } });
    }
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign(webProblems, { chapter: 'ai' }));

  /* ================================================================== Web research: the overview */
  const webPage = SMX.extend('ai/web', {
    pending: false,
    purpose: 'Lets the assistant look things up on the web: search, read pages, follow links. Search services do the looking; some need a key.',
    blurb: (ctx) => { const st = ctx.st; if (offline()) return 'Working offline: nothing is looked up'; const ready = webRoutes(st).filter((r) => AB[r.id] && abState(r) === 'Ready').length; const mine = SERVICES.filter((s) => svcFacts(st, s).mine).length; return `${ready} of ${AB_IDS.length} abilities ready · ${count(mine, 'search service')} in use`; },
    status: (ctx) => (offline() ? { text: 'Offline', tone: 'off' } : webProblems(ctx.st).length ? { text: 'Needs you', tone: 'attention' } : { text: 'Ready', tone: 'ready' }),
    keywords: ['web search', 'search', 'crawl', 'fetch', 'browse', 'look up', 'research', 'deep research', 'internet', 'online', 'offline', 'firecrawl', 'tavily', 'brave', 'exa', 'jina', 'duckduckgo', 'api key', 'credits', 'proxy', 'certificate'],
    lead: (ctx) => {
      const st = ctx.st; const off = offline();
      const rs = webRoutes(st).filter((r) => AB[r.id]);
      const by = (word) => rs.filter((r) => abState(r) === word);
      const ready = by('Ready'), notSet = by('Not set up'), turnedOff = by('Off');
      const mine = SERVICES.filter((s) => svcFacts(st, s).mine), rest = SERVICES.filter((s) => !svcFacts(st, s).mine);
      const anyKey = SERVICES.some((s) => (s.keyed || s.keySetting) && hasKey(st, s));
      const first = ready.some((r) => r.id === 'search') ? usable(st, chainOf('search'))[0] : null;
      const problems = webProblems(st);
      const line1 = off ? `${ui.b('Working offline is on.')} The assistant cannot look anything up. Pages it saved earlier still work.`
        : `${ready.length ? `The assistant can ${ui.b(AB[ready[0].id].verb)}${ready.length > 1 ? `, ${and(ready.slice(1).map((r) => AB[r.id].verb))}` : ''}.` : 'The assistant cannot use the web yet.'}${notSet.length ? ` ${nouns(notSet, AB)} ${notSet.length === 1 ? 'is' : 'are'} not set up yet.` : ''}${turnedOff.length ? ` ${nouns(turnedOff, AB)} ${turnedOff.length === 1 ? 'is' : 'are'} turned off.` : ''}`;
      const line2 = `${first ? `It searches with ${ui.word(first.label, first.key ? { go: svcRoute(first) } : { go: 'ai/web', anchor: 'services' })} first. ` : ''}${ui.word(count(mine.length, 'search service'), { go: 'ai/web', anchor: 'services' })} ${mine.length === 1 ? 'is' : 'are'} in use${rest.length ? `; ${rest.length} more can be added` : ''}. A web job asks you before it spends more than ${ui.word(`${val(WEB.ask)} credits`, { go: 'ai/web', reveal: WEB.ask })}.`;
      const thing = (r) => { const a = AB[r.id], word = abState(r); const names = r.id === 'browser' ? [] : usable(st, chainOf(r.id)).map((s) => s.said || s.label); return { icon: a.icon, name: a.name, tag: a.was, sub: a.short, sub2: [names.length ? `With ${names.join(', then ')}` : r.id === 'browser' ? 'In the built-in browser' : '', isTool(r.primary) ? '' : `${r.primary.model} ${a.roleShort}`].filter(Boolean).join(' · '), status: { text: word, tone: abTone(word) }, go: abRoute(r.id) }; };
      const service = (s, add) => { const f = svcFacts(st, s); const uses = usedBy(s).map((k) => USED_FOR[k] || k); return { icon: s.icon, name: s.label, tag: s.builtIn ? 'Built in' : s.free ? 'Free' : '', sub: s.what, sub2: add ? (f.needsKey ? `Needs a key from ${s.site}` : 'Switched off') : uses.length ? `Used to ${and(uses)}` : (val(WEB.backup) || []).includes(s.name) ? 'Only in the backup order, for an ability that has no order of its own' : 'No ability uses it yet', status: { text: f.status[0], tone: f.status[1] }, go: svcRoute(s), side: add ? (f.needsKey ? ui.btn({ label: 'Add its key', icon: 'key', action: 'pm51-web-key', data: { service: s.name } }) : ui.btn({ label: 'Turn it on', icon: 'play', action: 'toggle-setting', data: { setting: s.enable } })) : '' }; };
      return [
        { key: 'summary', html: ui.summary({ icon: 'globe', tone: off ? 'off' : problems.length ? 'attention' : ready.length ? 'ready' : 'attention', lines: [line1, off ? '' : line2],
          side: off ? ui.btn({ label: 'Go back online', icon: 'globe', primary: true, small: false, action: 'toggle-setting', data: { setting: WEB.offline } }) : ui.btn(Object.assign({ label: anyKey ? 'Add or replace a key' : 'Add a key', icon: 'key', primary: !anyKey, small: false }, KEYS_PANEL)) }) },
        { key: 'needs', html: ui.needs([...problems, ...(off ? [] : notSet.map((r) => ({ tone: 'info', title: `${AB[r.id].noun} is not set up yet`, detail: 'The assistant says it cannot do this until then. Its page lists what is left to do.', fix: { label: 'Set it up', go: abRoute(r.id) } })))]) },
        { key: 'abilities', html: `<div data-smx-covers="${h(WEB.matrix)}">${ui.things({ title: 'What it can do on the web', help: 'Each one is a job the assistant can do. Open one to see who does it and its limits.', items: rs.map(thing) })}</div>` },
        { key: 'services', html: `<div data-smx-covers="${h(WEB.status)}">${ui.things({ anchor: 'services', title: 'Search services', help: 'They find and read the pages. Each ability tries them in an order of its own.', items: mine.map((s) => service(s, false)), empty: { icon: 'search', title: 'No search service is in use', text: 'Add a key for one, or switch on a free one below.' } })}</div>` },
        { key: 'services-add', html: rest.length ? fold('ai/web:add', `${count(rest.length, 'more search service')} you can add`, 'Not set up yet', ui.things({ items: rest.map((s) => service(s, true)) })) : '' },
        { key: 'tasks', html: ui.tasks([
          { icon: 'route', title: 'Choose which service searches first', sub: 'The order for searching; every ability has its own', action: 'pm51-web-chain', data: { ability: 'search', title: chainTitle('search') } },
          { icon: 'test', title: 'Check that it all works', sub: 'One small request to each ability and service', action: 'pm51-web-diagnostics' },
          { icon: 'sliders', title: 'Use a proxy or a company certificate', sub: 'Only if this computer needs one to reach the internet', go: 'ai/web', reveal: 'web.fetch.proxy-mode' }
        ], { title: 'What do you want to do?', cols: 3 }) }
      ];
    },
    sections: [
      S('web-spending', { title: 'What web research may spend', help: 'Counted in credits, the unit search services charge in. A job that would cost more asks you first.' }),
      { key: 'spend-links', html: () => ui.links([{ label: 'Your monthly limit for AI', go: 'ai/spending' }, { label: 'Limits for a single run', go: 'safety/limits' }]) },
      { key: 'offline', title: 'Without the internet', help: 'For a computer that must not go online. This stops everything that needs the internet, not only web research.', ids: [WEB.offline] }
    ],
    more: [
      S('web-caching-o55', { title: 'Pages it has already read', help: 'A page read a moment ago is used again, so the same question is not paid for twice.' }),
      { key: 'backup-order', title: 'Search services: the backup order, and errors', help: 'The backup order is used only by an ability whose own order is empty.', ids: [WEB.backup, WEB.errors] },
      S('web-network-o55', { key: 'proxy', title: 'Proxy and certificates', help: 'How this computer reaches the internet. Most people never change these.', ids: ['web.fetch.proxy-mode', 'web.fetch.proxy-http-url', 'web.fetch.proxy-https-url', 'web.fetch.proxy-credentials', 'web.fetch.no-proxy-domains', 'web.fetch.ca-bundle'] })
    ],
    moreHelp: 'Saved pages, the backup order, proxy and certificates',
    expert: [S('web-network-more', { title: 'Search services you run yourself', help: 'Rules for a service on your own server, such as your own Firecrawl.' })],
    tail: (ctx) => {
      const elsewhere = [
        ['safety.protection.web-tool-permissions', 'shield', 'Whether it asks before using the web', () => 'Allow, ask first or never, for each web ability'],
        ['planning.interview.web-research-mode', 'map', 'Looking things up while planning', (id) => say(id)],
        ['branching.crew.brainstorm-external-research', 'people', 'Research during a BrainStorm', (id) => say(id)],
        ['planning.testing.cap-online-research', 'flask', 'Looking up testing tools online', (id) => (isOn(id) ? 'On' : 'Off')],
        ['web.fetch.browser-session-profile', 'browser', 'Signing in to websites in the built-in browser', (id) => say(id)]
      ].filter(([id]) => SMX.has(id) && SMX.where(id) && !/^ai\/web/.test(SMX.where(id).route));
      return [
        { key: 'elsewhere', html: elsewhere.length ? ui.things({ title: 'Decided somewhere else', help: 'Each of these belongs to another part of Puppet Master, so it is set there. They are listed so this page answers every question about the web.', items: elsewhere.map(([id, icon, name, text]) => ({ icon, name, sub: text(id), go: SMX.where(id).route, reveal: id })).concat([{ icon: 'clock', name: 'How long everything else is kept', sub: 'Chats, records and results', go: 'keeping/cleanup' }]) }) : '' },
        { key: 'links', html: ui.links([{ label: 'How web research works', action: 'pm51-web-help' }, { label: 'Put the web abilities back to how they came', action: 'pm51-web-reset' }]) }
      ];
    },
    covers: { [WEB.matrix]: 'On each ability’s page: the search services it uses, in order.', [WEB.status]: 'The status beside each search service.', [WEB.keys]: 'The button “Add or replace a key” at the top of this page.' },
    changes: [
      { was: 'Web & Research opens on a list of six one-word abilities beside the full detail of the first. Whether the assistant can look things up, and what is missing, has to be worked out from four tabs. The audit found that the first thing a newcomer needs is a key for a search service, and that it is not the first thing on screen: keys are on the second tab, behind “Expand”.', now: 'The page opens on the answer in two sentences: what it can do on the web and what is not set up; which service searches first and how many are in use. “Add or replace a key” is the first button on the page.' },
      { was: '“Check every ability” reports “5 ready, 0 need a key” while Firecrawl, Brave Search and Jina Reader each show “Add key”: its count leaves out every service that is switched off.', now: 'The summary counts every service: the ones in use, and the ones that can still be added. The check is PMConcept7’s own panel and still shows its own count; the concept shows the intended numbers and the wrong count is reported as a defect of PMConcept7.' },
      { was: 'Four tabs (Abilities, Search services, Limits & saving, Network) with the same three footer links under each, and two rows named “Check every ability” on neighbouring managers.', now: 'One page. Abilities and search services are two short lists whose rows open a page each. Spending is on the page; saved pages, the backup order, proxy and certificates are folded. Each link appears once.' },
      { was: 'A service that is off reads “Off” even when it also has no key, so three services that cannot work yet look like a choice someone made.', now: 'Services you use are listed; the three that are neither switched on nor have a key are under “more search services you can add”, each with the one button that starts it.' },
      { was: '“Work offline” is one of four equal rows on the Network tab, though it stops all internet use, not only research.', now: 'It has a card of its own that says what it stops. While it is on, the summary says so and its button is “Go back online”.' },
      { was: 'Web research is also decided on four other pages (whether it asks first, research while planning, research in a BrainStorm, looking up testing tools) and no page lists them.', now: '“Decided somewhere else” lists each with its current value and a link. Monthly money and the limits for one run are linked from the spending card.' },
      'Wording: Fetch, Crawl, Map and Extract are named for what they let the assistant do (“Read a page”, “Read a whole site”, “Outline a site”, “Pull out data”); the old word stays beside the name so it can still be found. A web search service is always a “search service”, never a “service”, which this chapter keeps for nothing else.'
    ]
  });
  uncover(webPage, ['web.providers.web-search-enable', ...AB_IDS.flatMap((id) => AB[id].limits), ...SERVICES.flatMap((s) => [s.enable, s.keySetting].concat(s.rows || [])).filter(Boolean), WEB.backup, WEB.errors]);

  /* ================================================================== one web ability */
  const POLICY = {
    timeout: { label: 'Time limit for the whole job', help: 'Seconds before it gives up.', number: true },
    costGuard: { label: 'Paying per use', help: 'Whether this ability may use a price you pay per use, beyond what your plans include.', options: [['Prefer included usage', 'Use what my plans include first'], ['Allow metered usage', 'May pay per use'], ['Ask before metered usage', 'Ask me before paying per use']] },
    citations: { label: 'Sources', help: 'Whether an answer says where each fact came from.', options: [['Required', 'Always name them'], ['Preferred', 'Name them when possible'], ['Off', 'Do not name them'], ['Preserve source offsets', 'Keep the exact place of each fact']] },
    privacy: { label: 'What is sent to the search service', options: [['Standard', 'Only the question'], ['Strict', 'Only the question, nothing about the project']] },
    maxSize: { label: 'Largest page or file', options: ['5 MB', '20 MB', '50 MB'] },
    robots: { label: 'A site’s own rules for automatic readers', help: 'Most sites say which of their pages may be read automatically.', options: [['Respect', 'Follow them'], ['Ignore on sites you own', 'Ignore them on sites you own']] },
    concurrency: { label: 'Pages read at the same time', number: true },
    downloads: { label: 'Downloading files', options: [['Ask', 'Ask me first'], ['Allow', 'Allow'], ['Block', 'Never']] },
    screenshots: { label: 'Taking a screenshot', options: [['On failure', 'When something fails'], ['Always', 'Always'], ['Never', 'Never']] },
    credentials: { label: 'Passwords saved in the browser', fixed: 'Never shared with the AI' },
    output: { label: 'Form of the result', options: [['Structured JSON', 'Data (JSON)'], ['Markdown outline', 'An outline (Markdown)']] },
    deduplicate: { label: 'Skip pages that repeat', toggle: true },
    includeMetadata: { label: 'Include each page’s title, date and address', toggle: true },
    validation: { label: 'Checking the result', options: [['Strict schema', 'It must match exactly'], ['Lenient', 'Best effort']] },
    retries: { label: 'Tries before it gives up', number: true },
    pii: { label: 'Personal details in logs', options: [['Redact in logs', 'Hide them'], ['Keep in logs', 'Keep them']] }
  };
  const policyRows = (r) => Object.keys(r.policy || {}).filter((k) => POLICY[k]).sort((a, b) => Object.keys(POLICY).indexOf(a) - Object.keys(POLICY).indexOf(b)).map((k) => {
    const def = POLICY[k], data = { route: r.id, key: k }, v = r.policy[k];
    if (def.fixed) return { label: def.label, help: def.help, value: def.fixed };
    if (def.toggle) return { label: def.label, help: def.help, control: toggle(!!v, { action: 'pm51-web-policy-toggle', data, label: def.label }) };
    if (def.number) return { label: def.label, help: def.help, control: `<input class="text-control pm51-input" type="number" value="${h(v)}" data-action="pm51-web-policy-input" data-route="${h(r.id)}" data-key="${h(k)}" data-am-field="web-tune-${h(r.id)}" aria-label="${h(def.label)}"/>` };
    const opts = def.options.map((o) => (Array.isArray(o) ? o : [o, o])); if (!opts.some((o) => o[0] === v)) opts.unshift([v, String(v)]);
    return { label: def.label, help: def.help, control: select(v, opts, { action: 'pm51-web-policy', data, label: def.label }) };
  });
  SMX.act('web-onoff', (el) => {
    const id = el.getAttribute('data-id'); const r = webRoute(SMX.fresh(), id); if (!r) return;
    if (abState(r) === 'Off') { SMX.run('pm51-web-turn-on', { route: id }); return; }
    write((st) => { const x = webRoute(st, id); if (x) { x.prevStatus = x.status; x.status = 'disabled'; } });
    SMX.toast(`${AB[id].name} is off`, 'The assistant will say it cannot do this until you turn it back on.');
  });
  borrowItem('web-reset-one', (el) => ({ domain: 'ai', ws: 'web', manager: 'web', tab: 'abilities', select: { action: 'pm51-select', data: { manager: 'web', id: el.getAttribute('data-id') } }, find: moreFor((AB[el.getAttribute('data-id')] || {}).was || '—') }), 'Reset to the example');
  const ABILITY_CHANGES = [
    { was: 'An ability is a row in a list of six one-word names (Search, Fetch, Crawl, Browser, Map, Extract) beside a detail pane. Once a link has taken you to a setting on another page (“Open Browser & SCM” does), a second card, “Web abilities”, appears under the detail of every ability for the rest of the visit and lists eleven rows again: the search switch, the table of services and the limits of all six abilities.', now: 'An ability has a page, named for what it lets the assistant do. Each setting is drawn once, on the page of the ability it belongs to, however you got there.' },
    { was: 'An ability that is not ready says “Not set up” and nothing says what is missing; its Check button is greyed with “Choose a model first.”', now: 'A page that is not ready lists the steps to get there, and the button at the top does the next one.' },
    { was: 'An order can hold a search service that cannot run. Brave Search is second-to-last in the order for Search although it is off and has no key: the row strikes its name through, the order panel says “Off”, and neither says that it is skipped or what it is missing.', now: 'The services that will run are numbered. One that is off, not set up or without a key says which, and says it is skipped.' },
    { was: 'Turned off, an ability still reads “Last check: Passed 2 h ago”, and the word “Off” replaces the name of its AI model.', now: 'Off reads “Not checked while it is off”, and the model it would use stays readable. The concept shows the intended behaviour; both are reported as defects of PMConcept7.' },
    { was: 'Each ability has its own model picker and its own list of backup models, with nothing that relates them to the everyday model chosen under Models.', now: 'The row says this job has a model of its own, names your everyday model, and links to “Which model does what”.' },
    { was: 'Turning an ability off and resetting it exist only in a “More actions” menu.', now: 'On or off is the first row of the page. “Put it back to how it came” is a button under For experts.' }
  ];
  for (const id of AB_IDS) {
    const A = AB[id];
    SMX.page({
      id: abRoute(id), chapter: 'ai', parent: 'ai/web', icon: A.icon,
      title: A.name, purpose: A.purpose,
      legacy: [WEB_OLD],
      keywords: [A.was.toLowerCase(), id, 'web'].concat(id === 'search' ? ['deep research', 'research', 'sources', 'citations'] : id === 'fetch' ? ['pdf', 'download'] : id === 'crawl' ? ['spider', 'whole site'] : id === 'map' ? ['sitemap', 'outline'] : id === 'extract' ? ['scrape', 'data', 'table'] : ['click', 'built-in browser']),
      headSide: (ctx) => { const r = webRoute(ctx.st, id); if (!r) return ''; const word = abState(r); return ui.btn({ label: 'Check it', icon: 'test', action: 'pm51-web-check', data: { route: id }, disabled: word !== 'Ready' || offline(), reason: offline() ? 'Working offline is on.' : word === 'Off' ? 'Turn it on first.' : 'Finish setting it up first.' }); },
      lead: (ctx) => {
        const st = ctx.st, r = webRoute(st, id);
        if (!r) return gone('ability', 'ai/web', 'Back to Web research');
        const word = abState(r), off = word === 'Off', ready = word === 'Ready';
        const names = id === 'browser' ? [] : chainOf(id); const run = usable(st, names);
        const tool = isTool(r.primary);
        const who = `${id === 'browser' ? 'It works in the built-in browser. ' : run.length ? `It finds and reads pages with ${run.map((s) => s.said || s.label).join(', then ')}. ` : ''}${tool ? 'No AI model is needed: a built-in tool does the work.' : `${r.primary.model} from ${provider(r.primary.provider)} ${A.role}.`}`;
        const blocks = [];
        blocks.push({ key: 'summary', html: ui.summary({ icon: A.icon, tone: offline() ? 'off' : abTone(word), lines: [
          `${ui.b(A.noun)} ${ready ? 'is ready' : off ? 'is turned off' : 'is not set up yet'}.${offline() ? ` ${ui.word('Working offline', { go: 'ai/web', reveal: WEB.offline })} is on, so it cannot reach the internet.` : off ? ' The assistant says it cannot do this until you turn it back on.' : ''}`,
          off ? '' : who
        ], side: off ? ui.btn({ label: 'Turn it on', icon: 'play', primary: true, small: false, action: 'pm51-web-turn-on', data: { route: id } }) : !ready ? ui.btn({ label: 'Finish setting it up', icon: 'arrowRight', primary: true, small: false, action: 'pm51-web-change', data: { route: id } }) : '' }) });
        if (!ready && !off) {
          const skipped = names.map(svc).filter((s) => !svcFacts(st, s).usable);
          blocks.push({ key: 'ready', html: ui.card({ title: 'Getting it ready', help: 'The button above does the step marked “Next”.', body: steps([
            id === 'browser' ? null : { title: 'A search service that reads the pages', done: run.length > 0, desc: run.length ? `${run[0].label} does it.${skipped.length ? ` ${and(skipped.map((s) => s.label))} ${skipped.length === 1 ? 'is' : 'are'} in the order too, but skipped until set up.` : ''}` : 'Every service in its order is off or has no key. Change the order below, or set one of them up.' },
            { title: 'Confirm what does the thinking', done: false, status: 'Next', tone: 'info', desc: tool ? `It would use ${modelWords(r.primary)}, with no AI model. Confirm that, or pick an AI model.` : `It would use ${modelWords(r.primary)}. Confirm that, or pick another.` },
            { title: 'Check it', done: false, desc: 'One small request, start to finish. “Check it” at the top of this page becomes available.' }
          ]) }) });
        }
        const rows = [
          id === 'search'
            ? { label: 'Let the assistant search the web', help: 'Off stops every web search, in chat and in /web.', covers: WEB.search, control: ui.toggle(WEB.search, { label: 'Let the assistant search the web' }) }
            : { label: `Let the assistant ${A.verb}`, help: 'Off: it says it cannot do this. Everything chosen below is kept.', control: `<span data-smx-do="web-onoff" data-id="${h(id)}">${toggle(!off, { action: 'pm51-noop', label: `Let the assistant ${A.verb}` })}</span>` },
          id === 'browser' ? null : { cls: 'is-wrap', label: 'Search services it uses', help: 'They find and read the pages, tried from the first. One that is off or has no key is skipped.', covers: WEB.matrix, control: chainHtml(st, names) + ui.btn({ label: 'Change the order', icon: 'edit', action: 'pm51-web-chain', data: { ability: id, title: chainTitle(id) } }) },
          id === 'search' ? { cls: 'is-wrap', label: 'For questions that need several sources', help: 'Sometimes called deep research: it reads several sites and compares them before answering.', control: chainHtml(st, chainOf('research')) + ui.btn({ label: 'Change the order', icon: 'edit', action: 'pm51-web-chain', data: { ability: 'research', title: chainTitle('research') } }) } : null,
          { label: tool ? 'What does the thinking' : 'The model that does the thinking', help: tool ? `A built-in tool (${r.primary.model}). Nothing is sent to an AI provider for this.` : `This job has a model of its own, on the account ${r.primary.account || 'used by default'}. Your everyday model is ${everyday()}.`, value: tool ? 'No AI model' : `${r.primary.model} · ${provider(r.primary.provider)}`, control: ui.btn({ label: tool ? 'Use an AI model' : 'Change', icon: 'edit', action: 'pm51-web-change', data: { route: id } }) + ui.btn({ label: 'Which model does what', go: 'ai/models', ghost: true }) },
          { label: 'If that fails', help: backupWords(r), control: ui.btn({ label: 'Change the backups', icon: 'edit', action: 'pm51-web-fallbacks', data: { route: id } }) },
          { label: 'Last check', help: 'One small request, start to finish. In this preview a check uses example data.', value: checkWords(r) }
        ];
        blocks.push({ key: 'who', html: ui.card({ title: 'Who does it', body: ui.rows(rows) }) });
        if (id === 'browser') blocks.push({ key: 'browser', html: ui.card({ title: 'The browser it uses', body: ui.rows([{ label: 'Signing in to websites', help: 'Whether the built-in browser stays signed in between tasks. Set with the browser’s other choices.', value: say('web.fetch.browser-session-profile'), control: ui.btn({ label: 'Built-in browser', icon: 'arrowRight', go: where('web.fetch.browser-session-profile', 'code/browser'), reveal: 'web.fetch.browser-session-profile' }) }]) }) });
        return blocks;
      },
      sections: A.limits.length ? [{ key: 'limits', title: 'Limits', help: `${A.limitsHelp} They apply every time the assistant does this.`, ids: A.limits }] : [],
      more: [{ key: 'tune', html: (ctx) => { const r = webRoute(ctx.st, id); const rows = r ? policyRows(r) : []; return rows.length ? steady(`web-tune-${id}`, ui.card({ title: 'Fine-tuning', help: `Only for ${A.noun.toLowerCase()}.`, body: ui.rows(rows) })) : '<p class="smx-quiet-line">This ability has nothing to fine-tune.</p>'; } }],
      moreHelp: 'Time limits, sources and what is sent',
      expert: [{ key: 'tech', html: (ctx) => { const r = webRoute(ctx.st, id); if (!r) return ''; return ui.card({ title: 'Technical details', body: ui.facts([['Called', `${A.was} (${id})`], ['How it works', (r.primary && r.primary.mode) || '—'], ['Stored state', r.status], ['Stored order', (val(WEB.matrix) || {})[id] || '—'], id === 'search' ? ['Stored order for several sources', (val(WEB.matrix) || {}).research || '—'] : null].filter(Boolean)) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Put it back to how it came…', icon: 'restore', do: 'web-reset-one', data: { id } })}</div>` }); } }],
      expertLabel: 'Technical details and starting over',
      covers: id === 'search' ? { [WEB.search]: 'The first row of this page: “Let the assistant search the web”.' } : {},
      changes: ABILITY_CHANGES
    });
  }

  /* ================================================================== one search service */
  const SERVICE_CHANGES = [
    { was: 'A search service is one of eight cards that fold open in place. Its key, its switch and its own settings are behind “Expand”, and which abilities use it can only be learned by opening every ability.', now: 'A search service has a page: whether it works, its switch, its key, and the abilities that use it with its place in each order.' },
    { was: 'Firecrawl’s key goes through one dialog (a setting, “Add key”), the other four through another (kept by the manager, “Add key”), and a third panel, “Service keys”, lists all five again.', now: 'Every service page has the same row, “Its key”, with one button. The panel that lists every key opens from Web research.' },
    { was: 'In the panel “Service keys”, Remove asks “Remove the Exa key?” and then changes nothing: Exa still reads “Saved securely”, because a key also counts as saved while the service’s status says connected.', now: '“Remove the key…” on the service’s page removes it: the service then reads “Needs a key” and Web research lists it under what needs you. The concept shows the intended behaviour; the defect is reported for PMConcept7.' },
    { was: '“Off” hides that a key is missing: Firecrawl, Brave Search and Jina Reader read “Off” although each also needs a key before it can work.', now: 'A service that is off and has no key reads “Not set up”, and its page lists the steps: add a key, switch it on, put it in an ability’s order.' }
  ];
  SMX.act('web-key-remove', (el) => {
    const s = svc(el.getAttribute('data-service'));
    kit().confirm(`Remove the ${s.label} key?`, 'The service stops working until you add a key again.', 'Remove', () => {
      write((st) => { if (st.pm51 && st.pm51.o55WebKeys) delete st.pm51.o55WebKeys[s.name]; const cur = st.settings && st.settings[WEB.status]; if (cur && cur[s.name] === 'connected') st.settings[WEB.status] = Object.assign({}, cur, { [s.name]: 'needs_auth' }); });
      SMX.toast('Key removed', `${s.label} is skipped until it has a key again.`);
    }, true);
  });
  for (const s of SERVICES) {
    const keyed = !!(s.keyed || s.keySetting);
    SMX.page({
      id: svcRoute(s), chapter: 'ai', parent: 'ai/web', icon: s.icon,
      title: s.label, purpose: `A search service. ${s.what}`,
      legacy: [['ai', 'web', 'services', 'web']],
      keywords: [s.name.toLowerCase(), 'search service', 'key'],
      lead: (ctx) => {
        const st = ctx.st, f = svcFacts(st, s); const uses = usedBy(s);
        const saved = keyed && hasKey(st, s);
        const state = s.builtIn ? 'is built in and always ready' : f.off ? (f.needsKey ? 'is not set up yet' : 'is switched off') : f.needsKey ? 'is switched on, but it has no key' : f.failed ? 'failed its last check' : 'is ready';
        const next = s.builtIn ? null : f.needsKey ? { label: 'Add its key', icon: 'key', action: 'pm51-web-key', data: { service: s.name } } : f.off ? { label: 'Turn it on', icon: 'play', action: 'toggle-setting', data: { setting: s.enable } } : null;
        const blocks = [];
        blocks.push({ key: 'summary', html: ui.summary({ icon: s.icon, tone: f.status[1], lines: [`${ui.b(s.label)} ${state}.`, uses.length ? `It is used to ${and(uses.map((k) => USED_FOR[k] || k))}.` : 'No ability uses it yet.'], side: next ? ui.btn(Object.assign({ primary: true, small: false }, next)) : '' }) });
        if (!s.builtIn && !f.usable) blocks.push({ key: 'ready', html: ui.card({ title: 'Getting it ready', help: 'The button above does the step marked “Next”.', body: steps([
          keyed ? { title: 'A key', done: !f.needsKey, status: f.needsKey ? 'Next' : '', tone: 'info', desc: `You get one from ${s.site}. Paste it once; it is kept in the keychain of your Server and never shown again.${s.keySetting ? ' With a Firecrawl server of your own, enter its address below.' : ''}` } : null,
          { title: 'Switched on', done: !f.off, status: !f.needsKey && f.off ? 'Next' : '', tone: 'info', desc: 'Until then every ability skips it.' },
          { title: 'In the order of an ability', done: uses.length > 0, desc: uses.length ? `It is already in the order used to ${and(uses.map((k) => USED_FOR[k] || k))}.` : 'Open an ability and add it to the search services it uses.' }
        ]) }) });
        const rows = [
          s.enable ? { label: `Use ${s.label}`, help: 'Off: every ability skips it. Its key and choices are kept.', covers: s.enable, control: ui.toggle(s.enable, { label: `Use ${s.label}` }) } : { label: 'Always available', help: 'It is part of Puppet Master and has no switch.', value: 'Built in' },
          keyed ? { label: 'Its key', help: `From ${s.site}. Kept in the keychain of your Server and never shown again.`, covers: s.keySetting || '', status: saved ? ui.status('Saved', 'ready') : '', control: ui.btn({ label: saved ? 'Replace the key' : 'Add a key', icon: saved ? 'refresh' : 'key', action: 'pm51-web-key', data: { service: s.name } }) + (saved && !s.keySetting ? ui.btn({ label: 'Remove the key…', icon: 'trash', ghost: true, do: 'web-key-remove', data: { service: s.name } }) : '') } : s.builtIn ? null : { label: 'Its key', help: 'It needs none.', value: 'No key needed', muted: true }
        ];
        blocks.push({ key: 'use', html: ui.card({ title: `Using ${s.label}`, body: ui.rows(rows) + (isOn(WEB.errors) && !f.off && (f.needsKey || f.failed) ? ui.note(f.needsKey ? `Last check: ${s.label} answered that it needs a key.` : `Last check: ${s.label} did not answer.`, 'attention') : '') }) });
        blocks.push({ key: 'used', html: ui.things({ title: 'Where it is used', help: 'An ability tries its search services in order. Open one to change the order.', items: uses.map((k) => { const names = chainOf(k); const at = names.indexOf(s.name) + 1; const a = k === 'research' ? { icon: 'search', name: 'Questions that need several sources' } : AB[k] || { icon: 'globe', name: k }; return { icon: a.icon, name: a.name, sub: `${at === 1 ? 'Tried first' : `Tried ${['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'][at] || 'number ' + at}`} of ${names.length}`, go: abRoute(k === 'research' ? 'search' : k), side: ui.btn({ label: 'Change the order', action: 'pm51-web-chain', data: { ability: k, title: chainTitle(k) } }) }; }), empty: { icon: 'route', title: 'No ability uses it', text: 'Open an ability under Web research and add it to the search services it uses.', fix: { label: 'Web research', go: 'ai/web' } } }) });
        return blocks;
      },
      sections: (s.rows || []).length ? [{ key: 'own', title: s.rowsTitle, help: s.rowsHelp, ids: s.rows }] : [],
      expert: [{ key: 'tech', html: () => ui.card({ title: 'Technical details', body: ui.facts([['Stored as', s.name], ['Its site', s.site || '—'], ['Status it reported', String((val(WEB.status) || {})[s.name] || '—')], ['Switch', s.enable || 'None: built in']]) }) }],
      covers: Object.assign({}, s.enable ? { [s.enable]: `The switch “Use ${s.label}” on this page.` } : {}, s.keySetting ? { [s.keySetting]: 'The row “Its key” on this page.' } : {}),
      changes: SERVICE_CHANGES
    });
  }

  /* ================================================================== Pictures, voice & video: what the manager knows */
  const MED = { output: 'media.io.media-output', master: 'media.capabilities.master', input: 'media.io.media-input', kinds: 'media.capabilities.enabled-types', picture: 'media.image.provider', models: 'media.image.model', vision: 'media.io.vision-bridge', visionBackup: 'media.io.vision-fallback-model', folder: 'media.io.artifacts-location', keep: 'media.io.artifact-retention' };
  const MEDIA_OLD = ['ai', 'media', 'abilities', 'media'];
  /* the seven abilities, named for what each lets a person do; "was" is PMConcept7's name */
  const MA = {
    'image-understanding': { name: 'Look at pictures', was: 'Image Understanding', icon: 'eye', takes: true, verb: 'look at pictures', noun: 'Looking at pictures', short: 'Describes a picture or screenshot you paste, and reads the text in it.', purpose: 'Lets the assistant see a picture or a screenshot you paste: it can describe what is in it, read its text, and compare a screen with what it built.', switch: MED.vision, own: ['detail', 'ocr'], ownTitle: 'How it looks' },
    transcription: { name: 'Turn speech into text', was: 'Speech & Transcription', icon: 'mic', takes: true, verb: 'turn speech into text', noun: 'Turning speech into text', short: 'Writes down what is said in a recording, and lets you talk instead of type.', purpose: 'Lets the assistant write down what is said in a recording you share, and lets you talk to it instead of typing.', ids: ['media.io.voice-input'], idsTitle: 'Talking instead of typing', own: ['format', 'language', 'speakers'], ownTitle: 'What it writes down' },
    'image-generation': { name: 'Make pictures', was: 'Image Generation', icon: 'image', makes: true, verb: 'make pictures', noun: 'Making pictures', short: 'Draws a picture from your description.', purpose: 'Lets the assistant draw a picture from your description: an icon, a diagram, a first sketch of a screen.', ids: ['media.capabilities.aspect-ratio', 'media.capabilities.image-size', 'media.capabilities.image-quality', 'media.capabilities.image-count', 'media.capabilities.image-format'], idsTitle: 'A new picture', idsHelp: 'What you get when you do not say otherwise. You can still ask for something else in a request.', moreIds: ['media.capabilities.response-format', 'media.capabilities.seed', 'media.capabilities.prompt-optimizer'], ownMore: ['metadata'], folder: 'images' },
    'text-to-speech': { name: 'Read aloud', was: 'Text to Speech', icon: 'volume', makes: true, verb: 'read text aloud', noun: 'Reading aloud', short: 'Reads an answer or a text aloud in a voice you pick.', purpose: 'Lets the assistant read an answer or a text aloud, in a voice you pick, and save it as a sound file.', switch: 'media.capabilities.tts', ids: ['media.capabilities.tts-voice'], idsTitle: 'The voice', own: ['format'], ownTitle: 'The file it makes', folder: 'audio' },
    'audio-generation': { name: 'Make music and sounds', was: 'Audio Generation', icon: 'wave', makes: true, verb: 'make music and sounds', noun: 'Making music and sounds', short: 'Makes a short piece of music or a sound effect from your description.', purpose: 'Lets the assistant make a short piece of music or a sound effect from your description.', switch: 'media.capabilities.music', ids: ['media.capabilities.music-bpm'], idsTitle: 'A new piece of music', own: ['format', 'duration'], ownTitle: 'The file it makes', folder: 'audio' },
    'video-generation': { name: 'Make short videos', was: 'Video Generation', icon: 'video', makes: true, verb: 'make short videos', noun: 'Making short videos', short: 'Makes a few seconds of video from your description.', purpose: 'Lets the assistant make a few seconds of video from your description.', switch: 'media.capabilities.video', ids: ['media.capabilities.video-duration', 'media.capabilities.video-resolution'], idsTitle: 'A new video', own: ['format'], ownTitle: 'The file it makes', folder: 'video' },
    'artifact-output': { name: 'Make documents', was: 'Document & Artifact Output', icon: 'file', verb: 'make documents', noun: 'Making documents', short: 'Makes a PDF, a Word file, a spreadsheet or slides you ask for.', purpose: 'Lets the assistant hand you a finished file: a PDF, a Word document, a spreadsheet, slides or a web page.', own: ['overwrite'], ownTitle: 'The files it makes', folder: 'exports' }
  };
  const MA_IDS = Object.keys(MA);
  const maRoute = (id) => `ai/media/ability/${id}`;
  const PICTURE = { 'OpenAI/Codex subscription': ['ChatGPT / Codex plan', 'openai-codex'], 'OpenAI gpt-image-2': ['GPT Image 2 with an OpenAI API key', 'openai-codex'], 'OpenAI Responses image_generation': ['Pictures inside OpenAI replies', 'openai-codex'], 'MiniMax Image-01': ['MiniMax Image-01', 'minimax-coding'], 'Gemini Direct': ['Gemini API', 'gemini-direct'], 'Antigravity gemini-3.1-flash-image': ['Google Antigravity', 'antigravity'] };
  const OWN = {
    detail: { label: 'How closely it looks', options: [['Adaptive', 'Adjust to the picture'], ['Low', 'A quick look (cheaper)'], ['High', 'Every detail and small text']] },
    ocr: { label: 'Reading the text in a picture', options: [['Only when needed', 'Only when needed'], ['Always', 'Always'], ['Never', 'Never']] },
    format: { label: 'File type', by: { transcription: [['Text + timestamps', 'Text with times'], ['Plain text', 'Plain text'], ['Subtitles (SRT)', 'Subtitles (SRT)']], 'text-to-speech': [['WAV', 'WAV (best quality)'], ['MP3', 'MP3 (smaller)'], ['OGG', 'OGG (smallest)']], 'audio-generation': [['WAV', 'WAV (best quality)'], ['MP3', 'MP3 (smaller)'], ['OGG', 'OGG (smallest)']], 'video-generation': [['MP4', 'MP4 (plays everywhere)'], ['WebM', 'WebM (smaller)']] } },
    language: { label: 'Language of the recording', options: ['Auto-detect', 'English', 'Spanish', 'German', 'French', 'Japanese'].map((x) => [x, x === 'Auto-detect' ? 'Work it out' : x]) },
    speakers: { label: 'Who is speaking', options: [['Detect when supported', 'Tell speakers apart when possible'], ['Single speaker', 'Treat as one speaker'], ['Off', 'Do not label speakers']] },
    duration: { label: 'Longest clip', options: [['Ask', 'Ask each time'], ['Up to 30 s', 'Up to 30 seconds'], ['Up to 2 min', 'Up to 2 minutes'], ['Up to 10 min', 'Up to 10 minutes']] },
    metadata: { label: 'Extra details in the file', help: 'Whether your description is saved inside the picture file.', options: [['Preserve prompt receipt', 'Keep the description with the file'], ['Strip everything', 'Keep nothing extra']] },
    overwrite: { label: 'When a file with that name already exists', options: [['Never without approval', 'Ask me first'], ['Always', 'Replace it']] }
  };
  const FILE_TYPES = [['PDF', 'PDF'], ['DOCX', 'Word'], ['PPTX', 'PowerPoint'], ['XLSX', 'Excel'], ['CSV', 'CSV'], ['HTML', 'Web page'], ['MD', 'Markdown']];
  const TOOL_KINDS = ['screenshot', 'diagram', 'recording'];
  const OLD_FOLDER = { 'Project artifacts/images': 'images', 'Project artifacts/audio': 'audio', 'Project artifacts/video': 'video', 'Project artifacts/exports': 'exports' };
  /* The Media manager tidies its example data the first time it draws (folder names, one copy of each choice, "the
     default model"). A fresh load has not been through that, so the list is read through the same rules here, and the
     manager is asked to draw once, unseen, so that its own panels then work on tidy data. */
  const mediaTidy = (st) => !!((st.pm51 || {}).o55MediaV2);
  const mediaRoutes = (st) => {
    const all = st.mediaRoutes || []; if (mediaTidy(st)) return all;
    const defaults = val(MED.models) !== 'Per-task override';
    return all.map((r) => {
      const x = Object.assign({}, r, { primary: Object.assign({}, r.primary || {}), output: Object.assign({}, r.output || {}) }); const o = x.output, a = MA[r.id] || {};
      if (r.id === 'image-generation') { delete o.format; delete o.quality; }
      if (r.id === 'video-generation') delete o.quality;
      if (r.id === 'text-to-speech') delete o.voice;
      delete o.retention;
      if (o.overwrite === 'Ask each time') o.overwrite = 'Never without approval';
      if (o.destination != null) o.destination = OLD_FOLDER[o.destination] || (o.destination === 'Ask each time' ? '@ask' : o.destination);
      if (typeof o.formats === 'string') o.formats = o.formats.split(/\s*,\s*/).filter(Boolean);
      if (defaults && x.primary.provider !== 'Built-in') x.primary.model = '';
      if (x.status === 'disabled' && (a.switch || r.id === 'image-generation')) x.status = x.prevStatus || 'ready';
      return x;
    });
  };
  let mediaAsked = false;
  const settleMedia = (st) => {
    if (mediaAsked || mediaTidy(st) || SMX.view !== 'new' || SMX.borrowing) return;
    mediaAsked = true;
    W.setTimeout(() => {
      if (SMX.borrowing || SMX.view !== 'new' || mediaTidy(SMX.fresh())) { mediaAsked = false; return; }
      try { eng().navigate('ai', 'media'); } catch (e) { /* the pages then show what the state holds */ }
      try { eng().dispatchAction('home'); } catch (e) { /* the next redraw parks it */ }
      untilParked();
    }, 0);
  };
  const mRoute = (st, id) => mediaRoutes(st).find((r) => r.id === id) || null;
  const GATE = {
    [MED.input]: { why: 'taking in pictures and files is turned off', fix: 'Let it take in pictures and files' },
    [MED.output]: { why: 'handing files and media back is turned off', fix: 'Let it hand back files and media' },
    [MED.master]: { why: 'making media is turned off', fix: 'Let it make media' }
  };
  /* the switch for the whole project that keeps an ability from running, if any */
  const gateOf = (id) => { const a = MA[id]; return a.takes ? (isOn(MED.input) ? '' : MED.input) : !isOn(MED.output) ? MED.output : a.makes && !isOn(MED.master) ? MED.master : ''; };
  const mOn = (r) => { const a = MA[r.id]; return a.switch ? isOn(a.switch) : r.id === 'image-generation' ? (val(MED.kinds) || []).includes('image') : r.status !== 'disabled'; };
  const mPrimary = (r) => { if (r.id !== 'image-generation') return r.primary || null; const pc = PICTURE[val(MED.picture)]; if (!pc) return null; return { picture: true, provider: pc[0], model: r.primary && r.primary.picture === val(MED.picture) ? r.primary.model : '', account: r.primary && r.primary.account }; };
  const mUnset = (r) => { const p = mPrimary(r); return !p || p.provider === 'Not configured'; };
  const mState = (r) => (gateOf(r.id) || !mOn(r) ? 'Off' : !mUnset(r) && r.status !== 'setup' ? 'Ready' : 'Not set up');
  const mWho = (r) => { const p = mPrimary(r); if (mUnset(r)) return r.id === 'image-generation' ? 'No picture service chosen yet' : 'No AI provider chosen yet'; if (p.provider === 'Built-in') return 'Puppet Master itself'; return `${p.picture ? p.provider : provider(p.provider)} · ${p.model || 'its default model'}`; };
  /* why an ability is not ready, in words */
  const mWhy = (r) => { const g = gateOf(r.id); if (g) return cap(GATE[g].why); if (!mOn(r)) return 'Switched off'; if (mUnset(r)) return ''; if (r.status === 'setup') return 'Suggested, not confirmed yet'; return ''; };
  const M_LAST = { 'image-generation': '1 h ago', 'image-understanding': '2 h ago', 'text-to-speech': 'yesterday', 'artifact-output': '3 h ago' };
  const mCheck = (r) => { const s = mState(r); if (s === 'Off') return 'Not checked while it is off'; if (r.lastCheck) return /since the change/i.test(r.lastCheck) ? 'Not checked since you changed who does it' : ago(r.lastCheck); return s === 'Ready' ? `Passed ${ago(M_LAST[r.id] || '2 h ago')}` : 'Not checked yet'; };
  const folderRoot = () => String(val(MED.folder) || '').replace(/^\$\{PROJECT_ROOT\}\/?/, '').replace(/\/+$/, '') || 'the results folder';
  const keepWords = () => (val(MED.keep) === 'Unlimited' ? 'until you delete it' : `for ${say(MED.keep).toLowerCase()}`);
  const saveWords = (r) => { const dst = (r.output || {}).destination; return dst === '@ask' ? 'You are asked each time' : dst === '@chat' || dst == null ? 'Shown in the chat only, not saved' : `The folder “${dst}” in your results folder`; };
  const mBackup = (r) => { if (r.id === 'image-understanding' && val(MED.visionBackup) === 'auto') return 'Then the best model available at the time that can see pictures.'; const on = (r.fallbacks || []).filter((f) => f.enabled !== false); return on.length ? `Then ${on.map((f) => (f.provider === 'Built-in' ? `a built-in tool (${f.model})` : `${f.model || 'the default model'} from ${provider(f.provider)}`)).join(', then ')}.` : 'Nothing. It stops and tells you.'; };
  const providerOf = (st, r) => { const p = mPrimary(r); if (!p || p.provider === 'Built-in' || mUnset(r)) return null; const pc = p.picture ? PICTURE[val(MED.picture)] : null; return (st.providers || []).find((x) => (pc ? x.id === pc[1] : x.name === provider(p.provider))) || null; };
  /* the next thing to do for an ability that is not ready: one button */
  const mNext = (r) => {
    const g = gateOf(r.id), a = MA[r.id], data = { route: r.id };
    if (g) return { label: GATE[g].fix, icon: 'play', action: 'toggle-setting', data: { setting: g } };
    if (!mOn(r)) return a.switch ? { label: 'Turn it on', icon: 'play', action: 'toggle-setting', data: { setting: a.switch } } : r.id === 'image-generation' ? { label: 'Turn it on', icon: 'play', action: 'pm51-media-kind', data: { kind: 'image' } } : { label: 'Turn it on', icon: 'play', action: 'pm51-media-status', data };
    if (mUnset(r)) return { label: r.id === 'image-generation' ? 'Choose a picture service' : 'Choose an AI provider', icon: 'route', action: 'pm51-media-change', data };
    if (r.status === 'setup') return { label: 'Confirm who does it', icon: 'route', action: 'pm51-media-change', data };
    return null;
  };
  /* what is wrong: an ability that should work but whose AI provider cannot answer */
  const mediaProblems = (st) => {
    const out = [];
    for (const r of mediaRoutes(st)) {
      if (!MA[r.id] || mState(r) !== 'Ready') continue;
      const p = providerOf(st, r);
      if (p && !d.providerReady(p)) out.push({ title: `${MA[r.id].noun} cannot work: ${p.name} cannot answer right now`, detail: `${p.name} is ${String(d.providerState(p)).toLowerCase()}.`, fix: { label: `Open ${p.name}`, go: `ai/provider/${p.id}` }, also: { label: 'Choose another', action: 'pm51-media-change', data: { route: r.id } } });
    }
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign(mediaProblems, { chapter: 'ai' }));

  /* ================================================================== Pictures, voice & video: the overview */
  const mediaPage = SMX.extend('ai/media', {
    pending: false,
    purpose: 'Whether the assistant can understand pictures and speech, and make pictures, speech, music, video and documents. And where the things it makes are saved.',
    blurb: (ctx) => { const rs = mediaRoutes(ctx.st).filter((r) => MA[r.id]); const ready = rs.filter((r) => mState(r) === 'Ready'); return `${ready.length ? cap(and(ready.map((r) => MA[r.id].verb))) : 'Text only'}${isOn(MED.master) ? '' : ' · making media is off'}`; },
    status: (ctx) => { const n = mediaRoutes(ctx.st).filter((r) => MA[r.id] && mState(r) === 'Ready').length; return mediaProblems(ctx.st).length ? { text: 'Needs you', tone: 'attention' } : { text: `${n} of ${MA_IDS.length} ready`, tone: n ? 'ready' : 'off' }; },
    keywords: ['image', 'picture', 'photo', 'screenshot', 'vision', 'voice', 'speech', 'dictation', 'transcribe', 'tts', 'read aloud', 'video', 'music', 'sound', 'audio', 'document', 'pdf', 'word', 'excel', 'slides', 'artifacts', 'results folder', 'media'],
    lead: (ctx) => {
      const st = ctx.st; settleMedia(st);
      const rs = MA_IDS.map((id) => mRoute(st, id)).filter(Boolean);
      const ready = rs.filter((r) => mState(r) === 'Ready');
      const master = isOn(MED.master);
      const notSet = rs.filter((r) => mState(r) === 'Not set up');
      const off = rs.filter((r) => mState(r) === 'Off');
      const byMaster = off.filter((r) => gateOf(r.id) === MED.master);
      const otherOff = off.filter((r) => gateOf(r.id) !== MED.master);
      const line1 = `${ready.length ? `The assistant can ${ui.b(MA[ready[0].id].verb)}${ready.length > 1 ? ` and ${and(ready.slice(1).map((r) => MA[r.id].verb))}` : ''}.` : 'The assistant works with text only at the moment.'}${byMaster.length ? ` Making ${byMaster.length === 4 ? 'pictures, speech, music and video' : and(byMaster.map((r) => MA[r.id].verb.replace(/^make |^read /, '')))} is turned off.` : ''}${otherOff.length ? ` ${nouns(otherOff, MA)} ${otherOff.length === 1 ? 'is' : 'are'} turned off.` : ''}${notSet.length ? ` ${nouns(notSet, MA)} ${notSet.length === 1 ? 'is' : 'are'} not set up yet.` : ''}`;
      const line2 = `What it makes is saved in ${ui.word(folderRoot(), { go: 'ai/media', reveal: MED.folder })} inside your project and kept ${ui.word(keepWords(), SMX.at(MED.keep))}.`;
      const kinds = (val(MED.kinds) || []).filter((k) => TOOL_KINDS.includes(k));
      let chips = ''; try { chips = kit().scoped.control(MED.kinds, kinds, { scope: 'media-kinds', choices: TOOL_KINDS, label: 'Tools may also hand back' }); } catch (e) { chips = ''; }
      const thing = (r) => { const a = MA[r.id], word = mState(r), why = mWhy(r); return { icon: a.icon, name: a.name, tag: a.was, sub: a.short, sub2: [mWho(r), why].filter(Boolean).join(' · '), status: { text: word, tone: word === 'Ready' ? 'ready' : 'off' }, go: maRoute(r.id) }; };
      return [
        { key: 'summary', html: ui.summary({ icon: 'image', tone: mediaProblems(st).length ? 'attention' : ready.length ? 'ready' : 'off', lines: [line1, line2] }) },
        { key: 'switches', html: `<div data-smx-covers="${h(MED.kinds)}">${ui.card({ title: 'What it may do at all', help: 'Three switches for the whole project. Each ability below also has a switch of its own.', body: ui.rows([
          { label: 'Let the assistant make pictures, speech, music and video', help: master ? 'On. Each of the four has its own switch on its page.' : 'Off to begin with, because making media can cost money for every picture or second. While it is off, the four abilities that make media stay off.', covers: MED.master, control: ui.toggle(MED.master, { label: 'Let the assistant make pictures, speech, music and video' }) },
          { label: 'Let it hand files and media back to you', help: 'Off means every answer is text only: no documents, no pictures.', covers: MED.output, control: ui.toggle(MED.output, { label: 'Let it hand files and media back to you' }) },
          isOn(MED.output) && chips ? { cls: 'is-wrap', label: 'Its tools may also hand back', help: 'What the assistant’s tools make along the way. Pictures and videos have their switch on their own pages.', control: chips } : null,
          { label: 'Let it take in pictures and files you share', help: 'Off means it cannot look at a picture or listen to a recording.', covers: MED.input, control: ui.toggle(MED.input, { label: 'Let it take in pictures and files you share' }) }
        ]) })}</div>` },
        { key: 'needs', html: ui.needs([...mediaProblems(st), ...notSet.map((r) => ({ tone: 'info', title: `${MA[r.id].noun} is not set up yet`, detail: mUnset(r) ? 'Nothing has been chosen to do it.' : `${mWho(r).split(' · ')[0]} is suggested for it. Confirm that, or choose another.`, fix: { label: 'Set it up', go: maRoute(r.id) } }))]) },
        { key: 'takes', html: ui.things({ title: 'What it can understand', help: 'Things you give it. Open one to see who does it.', items: rs.filter((r) => MA[r.id].takes).map(thing) }) },
        { key: 'makes', html: ui.things({ title: 'What it can make', help: 'Things it hands back to you. Open one to choose who makes it and what you get.', items: rs.filter((r) => !MA[r.id].takes).map(thing) }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'image', title: 'Choose who makes pictures', sub: 'A picture service from an AI provider you are signed in to', action: 'pm51-media-change', data: { route: 'image-generation' } },
          { icon: 'test', title: 'Check that it all works', sub: 'One small request to each ability that is ready', action: 'pm51-media-diagnostics' },
          { icon: 'folder', title: 'Change where results are saved', sub: `Now: ${folderRoot()}, inside your project`, go: 'ai/media', reveal: MED.folder }
        ], { title: 'What do you want to do?', cols: 3 }) }
      ];
    },
    sections: [
      { key: 'share', title: 'Pictures you share', help: 'What happens when you give the assistant a picture or a screenshot.', ids: ['media.io.screenshot-source', 'media.io.redaction-policy'], also: ['general.interaction.composer-media-controls'] },
      { key: 'results', title: 'Where results go', help: 'One folder inside your project. Each kind of result has a folder of its own inside it, set on its page.', ids: [MED.folder], also: [MED.keep] },
      { key: 'results-links', html: () => ui.links([{ label: 'How long everything else is kept', go: 'keeping/cleanup' }, { label: 'The files this project has produced', go: 'keeping/history' }]) }
    ],
    more: [{ key: 'which', title: 'When several pictures could be meant', help: 'For when you say “the picture” and more than one fits.', ids: ['media.io.image-source-order'] }],
    moreHelp: 'Which picture is meant when several fit',
    expert: [
      { key: 'models', title: 'Only for picture, speech and video models', help: 'Nicknames and extra options for every other model are on “Which model does what”.', ids: ['media.image.model-aliases', 'media.capabilities.provider-params'] },
      { key: 'mode', html: () => ui.card({ title: 'Technical details', body: ui.facts([['Models for these abilities', val(MED.models) === 'Per-task override' ? 'At least one ability has a model you picked' : 'Every ability uses its AI provider’s default model'], ['Picture service, as stored', String(val(MED.picture) || 'None')], ['Kinds it may hand back, as stored', (val(MED.kinds) || []).join(', ') || 'None']]) + ui.links([{ label: 'Which model does what', go: 'ai/models' }]) }) }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How pictures, voice and video work', action: 'pm51-media-help' }, { label: 'Put these abilities back to how they came', action: 'pm51-media-reset' }]) }],
    covers: { [MED.master]: 'The first switch on this page.', [MED.output]: 'The second switch on this page.', [MED.input]: 'The third switch on this page.', [MED.kinds]: 'The three choices “Its tools may also hand back” on this page. Pictures and videos have their switch on their own pages.', [MED.models]: 'Set by “Change” on each ability’s page: the AI provider’s default model, or one you pick. Shown under For experts.' },
    changes: [
      { was: 'Media & Output opens on three switches and a list of seven abilities named for the technique (Image Generation, Image Understanding, Speech & Transcription, Text to Speech, Audio Generation, Video Generation, Document & Artifact Output), beside the detail of the first one, which is off.', now: 'The page opens on what the assistant can understand and make right now, in a sentence. The three switches for the whole project come next, “make pictures, speech, music and video” first, each saying what off means. Then two short lists: what it can understand, what it can make.' },
      { was: 'With “Let the assistant make media” off, four abilities read Off for a reason given in one small line on each, and Image Generation shows its own switch “Make pictures” as on while its status reads Off.', now: 'Each row says why it is not ready (“Making media is turned off”, “Suggested, not confirmed yet”), and its page says which switch to turn, with one button that does it.' },
      { was: 'One setting, “Kinds of media it may make”, is drawn two ways on one tab: as three chips (“Tools may also hand back”) and as the switch “Make pictures”.', now: 'The three chips are here. “Make pictures” is the switch on the page Make pictures, and video follows the video switch. Each part is drawn once.' },
      { was: 'The results folder is shown on five abilities as a full path with its own “Change”, and again as “Results folder” on the second tab, where it is edited.', now: 'The folder is set once, here. An ability says which folder inside it its results go to, and links here.' },
      { was: '“Expert options” holds three unrelated rows: “Which picture wins”, “Model nicknames” and “Extra options for the service”. The last two have twins with the same labels under Providers & Accounts › Models.', now: '“When several pictures could be meant” is under More options, with an example. The other two are under For experts, named for what they cover (picture, speech and video models), and say where every other model’s are.' },
      { was: 'The link “Check every ability” has the same words as the one on Web & Research, though its panel is titled “Check every media ability”.', now: 'One tile on this page, “Check that it all works”. Web research has its own.' },
      'Wording: an ability is named for what it lets a person do (“Look at pictures”, “Read aloud”, “Make documents”), with PMConcept7’s name beside it. “Service” for an AI provider is “AI provider”; “artifacts” are “results”.'
    ]
  });
  uncover(mediaPage, [MED.picture, MED.vision, MED.visionBackup, ...MA_IDS.flatMap((id) => [MA[id].switch].concat(MA[id].ids || [], MA[id].moreIds || [])).filter(Boolean)]);

  /* ================================================================== one media ability */
  borrowItem('media-reset-one', (el) => ({ domain: 'ai', ws: 'media', manager: 'media', tab: 'abilities', select: { action: 'pm51-select', data: { manager: 'media', id: el.getAttribute('data-id') } }, find: moreFor((MA[el.getAttribute('data-id')] || {}).was || '—') }), 'Reset to the example');
  const ownRow = (r, key) => { const def = OWN[key], v = (r.output || {})[key]; const opts = (def.by ? def.by[r.id] : def.options) || []; const all = opts.some((x) => x[0] === v) ? opts : [[v, String(v)], ...opts]; return { label: def.label, help: def.help, control: select(v, all, { action: 'pm51-media-own', data: { route: r.id, key }, label: def.label }) }; };
  const MEDIA_ABILITY_CHANGES = [
    { was: 'An ability is a row in a list of seven beside a detail pane, named for a technique (“Image Understanding”, “Document & Artifact Output”).', now: 'An ability has a page, named for what it lets a person do, with one sentence that says whether it works and who does it.' },
    { was: 'Image Generation reads “Uses: Nothing yet” and its Check is greyed, yet “Choose service” opens a panel with “ChatGPT / Codex plan” already selected, so it is unclear whether a picture service is chosen.', now: 'The page says “No picture service chosen yet” and makes choosing one the next step. The panel is PMConcept7’s own and still pre-selects the first service it can use; that is reported as a defect of PMConcept7.' },
    { was: 'Speech & Transcription reads “Not set up” while “Uses” names ChatGPT / Codex, its Check works, and “Check every media ability” tells it to “Choose a service first.”', now: 'One rule for every ability: it can be checked once it is ready. Speech reads “Suggested, not confirmed yet”, and its next step is to confirm who does it. The concept shows the intended behaviour; the contradiction is reported as a defect of PMConcept7.' },
    { was: 'An ability that is off because of a switch for the whole project says so in one line above its details, and the switch is on another part of the page.', now: 'The summary names the switch and its button turns it on from here. “Getting it ready” lists what else is left.' },
    { was: 'Every ability has its own picker for an AI service, a model and backups, with nothing that relates it to the everyday model.', now: 'The row says this job has an AI provider of its own, names your everyday model, and links to “Which model does what”.' },
    { was: '“Saves to” shows a full path on each ability and edits the folder name in a panel, while the folder itself is edited on the other tab.', now: 'The row says which folder inside your results folder it uses, and links to the one place the results folder is set.' }
  ];
  for (const id of MA_IDS) {
    const A = MA[id];
    SMX.page({
      id: maRoute(id), chapter: 'ai', parent: 'ai/media', icon: A.icon,
      title: A.name, purpose: A.purpose,
      legacy: [MEDIA_OLD],
      keywords: [A.was.toLowerCase(), 'media'].concat(id === 'image-generation' ? ['draw', 'image', 'picture service', 'dall-e', 'gpt image'] : id === 'image-understanding' ? ['vision', 'screenshot', 'ocr', 'see'] : id === 'transcription' ? ['dictation', 'voice typing', 'microphone', 'transcribe', 'subtitles'] : id === 'text-to-speech' ? ['tts', 'voice', 'speak'] : id === 'audio-generation' ? ['music', 'sound effect', 'song'] : id === 'video-generation' ? ['clip', 'movie'] : ['pdf', 'word', 'excel', 'powerpoint', 'slides', 'spreadsheet', 'export']),
      headSide: (ctx) => { const r = mRoute(ctx.st, id); if (!r) return ''; const word = mState(r); return ui.btn({ label: 'Check it', icon: 'test', action: 'pm51-media-check', data: { route: id }, disabled: word !== 'Ready', reason: word === 'Off' ? 'Turn it on first.' : 'Finish setting it up first.' }); },
      lead: (ctx) => {
        const st = ctx.st; settleMedia(st);
        const r = mRoute(st, id);
        if (!r) return gone('ability', 'ai/media', 'Back to Pictures, voice & video');
        const word = mState(r), ready = word === 'Ready', g = gateOf(id), on = mOn(r), unset = mUnset(r), p = mPrimary(r), next = mNext(r);
        const blocks = [];
        blocks.push({ key: 'summary', html: ui.summary({ icon: A.icon, tone: ready ? 'ready' : 'off', lines: [
          `${ui.b(A.noun)} ${ready ? 'is ready' : g ? `is off: ${h(GATE[g].why)} for the whole project` : !on ? 'is switched off' : !unset && r.status === 'setup' ? `is not set up yet: ${h(mWho(r).split(' · ')[0])} is suggested for it, and that has not been confirmed` : 'is not set up yet'}.`,
          unset ? (id === 'image-generation' ? 'No picture service is chosen yet.' : 'No AI provider is chosen for it yet.') : !ready && on && !g && r.status === 'setup' ? '' : `${p.provider === 'Built-in' ? 'Puppet Master does this itself; no AI provider is needed' : ready ? `It is done by ${h(mWho(r).replace(' · ', ', with '))}` : `${h(mWho(r).replace(' · ', ', with '))}, is chosen to do it`}.`
        ], side: next ? ui.btn(Object.assign({ primary: true, small: false }, next)) : '' }) });
        if (!ready) {
          let marked = false; const mark = (done) => { if (done || marked) return {}; marked = true; return { status: 'Next', tone: 'info' }; };
          const gateId = A.takes ? MED.input : A.makes ? MED.master : MED.output;
          blocks.push({ key: 'ready', html: ui.card({ title: 'Getting it ready', help: 'The button above does the step marked “Next”.', body: steps([
            Object.assign({ title: 'Allowed for this project', done: !g, desc: g ? `${cap(GATE[g].why)}. That switch is on Pictures, voice & video.` : A.makes && isOn(MED.output) ? 'Making media and handing it back are both allowed.' : `“${GATE[gateId].fix}” is on.` }, mark(!g)),
            Object.assign({ title: 'Switched on', done: on, desc: on ? 'Its own switch is on.' : 'Its own switch, the first row below, is off.' }, mark(on)),
            Object.assign({ title: id === 'image-generation' ? 'A picture service' : 'An AI provider that can do it', done: !unset && r.status !== 'setup', desc: unset ? 'Only AI providers you are signed in to can be chosen.' : r.status === 'setup' ? `${mWho(r).split(' · ')[0]} is suggested. Confirm it, or choose another.` : mWho(r) }, mark(!unset && r.status !== 'setup')),
            { title: 'Check it', done: false, desc: 'One small request. “Check it” at the top of this page becomes available.' }
          ]) }) });
        }
        const switchRow = A.switch
          ? { label: `Let the assistant ${A.verb}`, help: g ? `On or off, it does not run while ${GATE[g].why}.` : 'Off: it says it cannot do this. Everything chosen below is kept.', covers: A.switch, control: ui.toggle(A.switch, { label: `Let the assistant ${A.verb}` }) }
          : { label: `Let the assistant ${A.verb}`, help: g ? `On or off, it does not run while ${GATE[g].why}.` : 'Off: it says it cannot do this. Everything chosen below is kept.', control: toggle(on, id === 'image-generation' ? { action: 'pm51-media-kind', data: { kind: 'image' }, label: `Let the assistant ${A.verb}` } : { action: 'pm51-media-status', data: { route: id }, label: `Let the assistant ${A.verb}` }) };
        const rows = [
          switchRow,
          { label: 'Done by', covers: id === 'image-generation' ? MED.picture : '', help: unset ? (id === 'image-generation' ? 'Pictures need a model that can draw, so this job has a choice of its own. Only AI providers you are signed in to can be chosen.' : 'Only AI providers you are signed in to can be chosen.') : p.provider === 'Built-in' ? 'Built in. Nothing is sent to an AI provider.' : `${id === 'image-generation' ? 'Pictures need a model that can draw, so this job has a choice of its own' : 'This job has an AI provider of its own'}${p.account && !/^(none|no account)$/i.test(p.account) ? `, on the account ${p.account}` : ''}. Your everyday model is ${everyday()}.`, value: mWho(r), control: ui.btn({ label: unset ? 'Choose' : 'Change', icon: 'route', action: 'pm51-media-change', data: { route: id } }) + (p && p.provider === 'Built-in' ? '' : ui.btn({ label: unset ? 'AI providers' : 'Which model does what', go: unset ? 'ai' : 'ai/models', ghost: true })) },
          { label: 'If that fails', covers: id === 'image-understanding' ? MED.visionBackup : '', help: mBackup(r), control: ui.btn({ label: 'Change the backups', icon: 'edit', action: 'pm51-media-fallbacks', data: { route: id } }) },
          { label: 'Last check', help: 'One small request to whoever does it. In this preview a check uses example data.', value: mCheck(r) }
        ];
        blocks.push({ key: 'who', html: ui.card({ title: 'Who does it', body: ui.rows(rows) }) });
        const own = (A.own || []).filter((k) => (r.output || {})[k] != null).map((k) => ownRow(r, k));
        if (id === 'artifact-output') { const cur = (r.output || {}).formats || []; own.unshift({ cls: 'is-wrap', label: 'File types it may make', help: 'At least one stays on. To stop it making files, switch the ability off.', control: `<div class="chip-select o55-chips" role="group" aria-label="File types it may make">${FILE_TYPES.map(([v, l]) => { const x = cur.includes(v); return `<button type="button" class="${x ? 'active' : ''}" aria-pressed="${x}" data-action="pm51-media-filetype" data-route="${h(id)}" data-value="${h(v)}">${x ? SMX.icon('check') : ''}<span>${h(l)}</span></button>`; }).join('')}</div>` }); }
        if (A.folder) own.push({ label: 'Where its results go', help: `Kept ${keepWords()}. The results folder itself is set once, for every ability.`, value: saveWords(r), control: ui.btn({ label: 'Change', icon: 'folder', action: 'pm51-media-saveto', data: { route: id } }) + ui.btn({ label: 'The results folder', go: 'ai/media', reveal: MED.folder, ghost: true }) });
        if (own.length) blocks.push({ key: 'own', html: ui.card({ title: A.ownTitle || 'What it makes', body: ui.rows(own) }) });
        return blocks;
      },
      sections: (A.ids || []).length ? [{ key: 'defaults', title: A.idsTitle, help: A.idsHelp || '', ids: A.ids }] : [],
      more: (A.moreIds || A.ownMore) ? [
        { key: 'fine', title: 'Fine-tuning', help: `Only for ${A.noun.toLowerCase()}.`, ids: A.moreIds || [] },
        { key: 'fine-own', html: (ctx) => { const r = mRoute(ctx.st, id); const rows = r ? (A.ownMore || []).filter((k) => (r.output || {})[k] != null).map((k) => ownRow(r, k)) : []; return rows.length ? ui.card({ title: 'In the file', body: ui.rows(rows) }) : ''; } }
      ] : [],
      moreHelp: 'How pictures come back, and repeating a result',
      expert: [{ key: 'tech', html: (ctx) => { const r = mRoute(ctx.st, id); if (!r) return ''; const raw = (ctx.st.mediaRoutes || []).find((x) => x.id === id) || r; return ui.card({ title: 'Technical details', body: ui.facts([['Called', `${A.was} (${id})`], ['Stored state', raw.status], ['Stored AI provider', (raw.primary && raw.primary.provider) || '—'], ['Stored folder', (raw.output || {}).destination == null ? '—' : String(raw.output.destination)]]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Put it back to how it came…', icon: 'restore', do: 'media-reset-one', data: { id } })}</div>` }); } }],
      expertLabel: 'Technical details and starting over',
      covers: Object.assign({}, A.switch ? { [A.switch]: 'The first row of this page.' } : {}, id === 'image-generation' ? { [MED.picture]: 'The row “Done by” on this page.' } : {}, id === 'image-understanding' ? { [MED.visionBackup]: 'The row “If that fails” on this page.' } : {}),
      changes: MEDIA_ABILITY_CHANGES
    });
  }

  /* ================================================================== Back Seat Driver: what the manager knows */
  const BSD = { mode: 'safety.approvals.bsd-mode', twin: 'planning.verification.back-seat-driver-mode', speak: 'safety.approvals.bsd-trigger-sensitivity', quiet: 'safety.approvals.bsd-cooldown-turns', persona: 'safety.approvals.bsd-persona', model: 'safety.approvals.bsd-model', keep: 'safety.approvals.bsd-retain-transcript', catchUp: 'safety.approvals.bsd-catch-up-seconds', tidy: 'safety.approvals.bsd-self-compact-threshold', stages: 'safety.approvals.bsd-stage-bindings' };
  const MODES = [
    ['Off', 'Off', 'Nobody watches the work.'],
    ['Auto', 'Auto', 'Checks in at key moments: before a risky step, and when work looks finished. Right for most people.'],
    ['On', 'Always watching', 'Looks at every step. It notices more, and uses more of your AI plan.']
  ];
  const MODE_NAME = { Off: 'Off', Auto: 'Auto', On: 'Always watching' };
  /* a stage of the work, named for what happens in it: [name, when a note was raised in it] */
  const STAGE = {
    prd: ['Shaping the idea', 'while the idea was being shaped', 'Before any plan exists: what you want to build, and for whom.'],
    wizard: ['The planning interview', 'during the planning interview', 'The questions that turn the idea into goals.'],
    drafting: ['Writing the plan', 'while the plan was being written', 'The plan as a document, written and revised.'],
    compile: ['Splitting the plan into pieces of work', 'while the plan was being split into pieces of work', 'Each piece is small enough to build and check by itself.'],
    worknodes: ['Turning the pieces into steps', 'while the plan was being turned into steps', 'The concrete steps an agent can carry out.'],
    code: ['Writing code', 'while code was being written', 'Agents writing and changing files.'],
    verify: ['Testing the work', 'while the work was being tested', 'Tests and checks that prove a step worked.'],
    gate: ['The check before moving on', 'while deciding whether work may move on', 'Whether a step is good enough for the next one to start.'],
    audit: ['Reviewing finished work', 'while finished work was being reviewed', 'A second look for gaps, once the work is done.'],
    certify: ['The final sign-off', 'during the final sign-off', 'The last check that everything asked for is there.']
  };
  const PLANNING_STAGES = ['prd', 'wizard', 'drafting', 'compile', 'worknodes'];
  const SEV = { critical: ['Serious problem', 'blocked', 'alert'], concern: ['Concern', 'attention', 'info'], nit: ['Small thing', 'off', 'edit'] };
  const NOTE = { held: ['Being double-checked', 'info'], emitted: ['Told you in chat', 'ready'], cleared: ['Let go', 'off'], closed: ['Dismissed', 'off'] };
  const NOTE_FILTERS = [['all', 'All'], ['held', 'Being double-checked'], ['delivered', 'Told you'], ['cleared', 'Let go']];
  const FILTER_STATES = { all: null, held: ['held'], delivered: ['emitted'], cleared: ['cleared', 'closed'] };
  const SPEND = [['Use included plans only', 'Only what my plans include'], ['Allow metered usage', 'May pay per use'], ['Ask each time', 'Ask me each time']];
  const bsd = (st) => (st.pm51 || {}).bsd || { status: 'Idle', lastCheck: '', stages: [], findings: [] };
  const bsdMode = () => { const m = String(val(BSD.mode) || 'Auto'); return MODE_NAME[m] ? m : 'Auto'; };
  const bsdOn = () => bsdMode() !== 'Off';
  /* The ten stages. Once the Back Seat Driver manager has drawn, the setting holds each stage's choice ("code:auto");
     before that it still holds an older list of five names, and the stages are read from the manager's own state. */
  const stagesOf = (st) => { const v = val(BSD.stages), map = {}; if (Array.isArray(v)) v.forEach((x) => { const m = /^([a-z]+):(inherit|off|auto|on)$/.exec(String(x)); if (m) map[m[1]] = cap(m[2]); }); return (bsd(st).stages || []).map((s) => Object.assign({}, s, { mode: map[s.key] || s.mode })); };
  const notes = (st) => (bsd(st).findings || []).filter((f) => f && f.id);
  const noteRoute = (f) => `ai/advisor/note/${encodeURIComponent(f.id)}`;
  const stageName = (st, key) => (STAGE[key] || [(stagesOf(st).find((s) => s.key === key) || {}).label || key])[0];
  const during = (key) => (STAGE[key] || ['', ''])[1];
  const sev = (f) => SEV[f.severity] || SEV.concern;
  const noteState = (f) => NOTE[f.state] || NOTE.closed;
  /* the models it can fall back to: the same ones "The model it uses" offers, so the two lists agree */
  const backupModels = (st) => {
    const b = st.bsd || {}; let ready = []; try { ready = kit().readyModels() || []; } catch (e) { ready = []; }
    const options = ready.map((o) => ({ value: String(o.value).replace('/', '::'), label: o.label }));
    const p = (st.providers || []).find((x) => x.name === provider(b.fallbackProvider)); const m = p ? (p.models || []).find((x) => x.name === b.fallbackModel) : null;
    let value = p && m ? `${p.id}::${m.id || m.name}` : '';
    if (!options.some((o) => o.value === value)) { if (b.fallbackModel) { value = 'current::' + b.fallbackModel; options.unshift({ value, label: `${b.fallbackModel}${b.fallbackProvider ? ' · ' + provider(b.fallbackProvider) : ''}` }); } else value = options.length ? options[0].value : ''; }
    return { options, value };
  };
  const bsdProblems = (st) => {
    if (!bsdOn()) return [];
    const v = val(BSD.model); if (!v || v === 'Default') return [];
    let ready = []; try { ready = (kit().readyModels() || []).map((o) => o.value); } catch (e) { ready = []; }
    return ready.includes(v) ? [] : [{ title: 'The model Back Seat Driver uses cannot answer right now', detail: 'Until it can, the backup model is used.', fix: { label: 'Choose another', go: 'ai/advisor', reveal: BSD.model } }];
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign(bsdProblems, { chapter: 'ai' }));
  const thingRows = (items) => `<div class="smx-things">${items.map((it) => `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(it.go)}"><span class="smx-thing-avatar smx-am-sev tone-${h(it.tone)}">${SMX.icon(it.icon)}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(it.name)} <span class="smx-thing-tag">${h(it.tag)}</span></span><span class="smx-thing-sub">${h(it.sub)}</span><span class="smx-thing-sub">${h(it.sub2)}</span></span><span class="smx-thing-end">${ui.status(it.status[0], it.status[1])}<span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`).join('')}</div>`;

  /* ================================================================== Back Seat Driver: the page */
  SMX.act('bsd-open-stages', () => { SMX.local.openMore['ai/advisor:more'] = true; SMX.go('ai/advisor', { anchor: 'stages' }); });
  const advisorPage = SMX.extend('ai/advisor', {
    pending: false,
    purpose: 'A second AI that watches the work as it happens and speaks up when something looks wrong, for example a check that was marked as passed although its test never ran. It never changes anything itself.',
    blurb: (ctx) => { const st = ctx.st; if (!bsdOn()) return 'Off: nobody is watching the work'; const told = notes(st).filter((f) => f.state === 'emitted').length, held = notes(st).filter((f) => f.state === 'held').length; return `${bsdMode() === 'On' ? 'Watching all the time' : 'Checks in at key moments'} · told you ${count(told, 'thing')}${held ? ` · ${held} being double-checked` : ''}`; },
    status: (ctx) => (!bsdOn() ? { text: 'Off', tone: 'off' } : bsdProblems(ctx.st).length ? { text: 'Needs you', tone: 'attention' } : { text: 'Watching', tone: 'ready' }),
    keywords: ['advisor', 'adviser', 'second opinion', 'bsd', 'back seat driver', 'watcher', 'watch', 'findings', 'review', 'supervise', 'oversight', 'mistakes', 'critical advisor'],
    lead: (ctx) => {
      const st = ctx.st, b = bsd(st), mode = bsdMode(), on = mode !== 'Off';
      const all = notes(st); const told = all.filter((f) => f.state === 'emitted'), held = all.filter((f) => f.state === 'held');
      const last = told[0];
      const stages = stagesOf(st); const eff = (s) => (s.mode === 'Inherit' ? mode : s.mode);
      const watched = on ? stages.filter((s) => eff(s) !== 'Off').length : 0; const own = stages.filter((s) => s.mode !== 'Inherit').length;
      const filter = FILTER_STATES[(st.pm51 || {}).bsdFilter] !== undefined ? st.pm51.bsdFilter : 'all';
      const shown = all.filter((f) => !FILTER_STATES[filter] || FILTER_STATES[filter].includes(f.state));
      let seg = ''; try { seg = kit().segmented(filter, NOTE_FILTERS, { action: 'pm51-bsd-findings-filter', label: 'Which notes to show' }); } catch (e) { seg = ''; }
      const EMPTY = { all: ['It has not said anything yet', 'Notes appear here when it notices something.'], held: ['Nothing is being double-checked', 'A note waits here while it is compared with newer work.'], delivered: ['It has not told you anything yet', 'What it confirmed and sent to the chat appears here.'], cleared: ['Nothing was let go', 'Notes that no longer held, and ones you dismissed, appear here.'] };
      return [
        { key: 'summary', html: ui.summary({ icon: 'eye', tone: on ? 'ready' : 'off', lines: [
          !on ? `${ui.b('Back Seat Driver is off.')} Nobody is watching the work for mistakes.` : mode === 'On' ? `It is ${ui.b('on')} and looks at every step of the work. It last looked ${h(ago(b.lastCheck))}.` : `It is ${ui.b('on')} and checks in at key moments, such as before a risky step. It last looked ${h(ago(b.lastCheck))}.`,
          `${last ? `The last thing it told you, ${h(ago(last.delivered || last.raised).toLowerCase())}: ${ui.word(`“${last.title}”`, { go: noteRoute(last) })}.` : 'It has not told you anything yet.'}${on && held.length ? ` ${held.length === 1 ? 'One more note is' : `${held.length} more notes are`} being double-checked before you are told.` : ''}`
        ] }) },
        { key: 'mode', html: `<div data-smx-covers="${h(BSD.mode)} ${h(BSD.twin)}">${ui.card({ title: 'How much it watches', help: 'The one choice that matters. It only ever advises: it cannot change, approve or stop anything.', body: `<div class="smx-am-choices" role="radiogroup" aria-label="How much Back Seat Driver watches">${MODES.map(([v, name, line]) => `<button type="button" class="smx-am-choice${mode === v ? ' is-on' : ''}" role="radio" aria-checked="${mode === v}" data-action="set-setting" data-setting="${BSD.mode}" data-value="${v}" data-smx-key="bsd-mode-${v}"><span class="smx-am-choice-name">${h(name)}${mode === v ? SMX.icon('check') : ''}</span><span class="smx-am-choice-line">${h(line)}</span></button>`).join('')}</div><p class="smx-sentence-note">${on ? `It watches ${ui.b(`${watched} of ${stages.length}`)} stages of the work${own ? `; ${own} ${own === 1 ? 'has' : 'have'} a choice of ${own === 1 ? 'its' : 'their'} own` : ''}.` : 'While it is off no stage of the work is watched. The choice for each stage is kept.'} ${ui.link({ label: 'A choice for each stage', do: 'bsd-open-stages' })}</p>` })}</div>` },
        { key: 'needs', html: ui.needs(bsdProblems(st)) },
        { key: 'notes', html: ui.card({ cls: 'smx-things-card smx-am-notes', anchor: 'notes', title: 'What it noticed', help: 'A note is first compared with the newest work. Only one that still holds is sent to you in the chat.', side: all.length ? `<span class="smx-am-filter">${seg}</span>` : '', body: shown.length ? thingRows(shown.map((f) => ({ go: noteRoute(f), icon: sev(f)[2], tone: sev(f)[1], name: f.title, tag: sev(f)[0], sub: f.claim, sub2: `Raised ${String(ago(f.raised)).toLowerCase()} ${during(f.stage)}`, status: noteState(f) }))) : `<div class="smx-empty">${SMX.icon('eye')}<div class="smx-empty-title">${h((EMPTY[filter] || EMPTY.all)[0])}</div><div class="smx-empty-text">${h((EMPTY[filter] || EMPTY.all)[1])}</div></div>` }) }
      ];
    },
    sections: [
      { key: 'speaks', title: 'When it speaks up, and how', help: 'How readily it interrupts, how long it then stays quiet, and its tone.', ids: [BSD.speak, BSD.quiet, BSD.persona], when: bsdOn },
      { key: 'runs', when: bsdOn, html: (ctx) => { const st = ctx.st, fb = backupModels(st); const spend = SPEND.some((x) => x[0] === (st.bsd || {}).usageBoundary) ? st.bsd.usageBoundary : SPEND[0][0]; return ui.card({ title: 'What it runs on', help: 'Back Seat Driver is a second AI, so it uses a model of its own. What it uses is counted apart from your main work.', body: ui.rows([
        { label: 'The model it uses', help: `An exception to your everyday model (${everyday()}). “Automatic” lets Puppet Master pick one you are signed in to.`, covers: BSD.model, control: ui.select(BSD.model, { label: 'The model Back Seat Driver uses' }) + ui.btn({ label: 'Which model does what', go: 'ai/models', ghost: true }) },
        { label: 'If that model cannot answer', help: 'Used only until its own model is back.', control: select(fb.value, fb.options, { action: 'pm51-bsd-fallback-model', label: 'If its model cannot answer', search: fb.options.length > 12, width: 240 }) },
        { label: 'What it may spend', help: 'How far it may go before it asks you.', control: select(spend, SPEND, { action: 'pm51-bsd-boundary', label: 'What Back Seat Driver may spend' }) + ui.btn({ label: 'Spending & warnings', go: 'ai/spending', ghost: true }) }
      ]) }); } },
      { key: 'off-note', when: () => !bsdOn(), html: () => '<p class="smx-quiet-line">When it speaks up, its tone and the model it runs on appear here once it is on.</p>' }
    ],
    more: [
      { key: 'stages', html: (ctx) => { const st = ctx.st, mode = bsdMode(); const row = (s) => ({ label: stageName(st, s.key), help: (STAGE[s.key] || [])[2] || s.desc, control: select(s.mode, [{ value: 'Inherit', label: 'Same as the main choice', meta: `Now ${MODE_NAME[mode]}` }, { value: 'Off', label: 'Off' }, { value: 'Auto', label: 'Auto', meta: 'At key moments' }, { value: 'On', label: 'Always watching' }], { action: 'pm51-bsd-stage', data: { key: s.key }, label: `${stageName(st, s.key)}: how much it watches` }) }); const stages = stagesOf(st); const plan = stages.filter((s) => PLANNING_STAGES.includes(s.key)), build = stages.filter((s) => !PLANNING_STAGES.includes(s.key)); return `<div data-smx-covers="${h(BSD.stages)}">${ui.card({ title: 'A choice for each stage of the work', help: `Every stage follows the main choice (now ${MODE_NAME[mode]}) unless you give it its own.`, side: ui.btn({ label: 'Put the stages back', icon: 'restore', action: 'pm51-bsd-stages-reset' }), body: (bsdOn() ? '' : ui.note('Back Seat Driver is off, so no stage is watched. These choices apply again when you turn it back on.', 'info')) + ui.kicker('While planning') + ui.rows(plan.map(row)) + ui.kicker('While building and checking') + ui.rows(build.map(row)) })}</div>`; }, count: 1 },
      { key: 'talk', title: 'Its own conversation', help: 'What Back Seat Driver said to itself while it watched.', ids: [BSD.keep], when: bsdOn }
    ],
    moreLabel: 'A choice for each stage, and its own conversation', moreHelp: 'For when one part of the work needs more or less watching',
    expert: [
      { key: 'pace', title: 'Keeping up and tidying up', ids: [BSD.catchUp, BSD.tidy], when: bsdOn },
      { key: 'tech', html: (ctx) => { const st = ctx.st, b = bsd(st); return ui.card({ title: 'Technical details', body: ui.facts([['State', `${b.status || '—'} · last looked ${ago(b.lastCheck) || '—'}`], ['Mode, as stored', `${String(val(BSD.mode))} (the planning copy holds ${String(val(BSD.twin))})`], ...stagesOf(st).map((s) => [`${stageName(st, s.key)}`, `${s.label} · ${s.key}:${String(s.mode).toLowerCase()}`])]) }); } }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How Back Seat Driver works', action: 'pm51-bsd-help' }, { label: 'Check that it works', action: 'pm51-bsd-diagnostics' }, { label: 'Put Back Seat Driver back to how it came', action: 'pm51-bsd-reset' }]) }],
    covers: { [BSD.mode]: 'The three choices under “How much it watches”.', [BSD.twin]: 'The same choice as “How much it watches”: this older copy follows it and is not drawn.', [BSD.model]: 'The row “The model it uses” in the card “What it runs on”.', [BSD.stages]: 'The ten rows under “A choice for each stage of the work”, under More options.' },
    changes: [
      { was: 'Back Seat Driver opens on three counters (“Idle · checked 18 s ago”, “1 held · 3 delivered”, “10 of 10”) above ten rows. What it is for is one small line, and “held” and “delivered” are used before anything explains them.', now: 'The page says what it is in its first sentence, with an example. Then whether it is on and the last thing it told you. How much it watches is the first control: three choices that each say what they mean and what they cost.' },
      { was: 'A finding opens a sheet whose evidence is raw references (“gate/F3-441/decision.json · result: pass”, “src/net/retry.rs:44-71”), beside “Generation 41” and “Finding id: bsdf-0412”.', now: 'A note has a page that says in sentences what it noticed, how serious it is, when it was raised and what happens next. The raw references, the generation and the id are under For experts, where the original sheet is one button away.' },
      { was: 'Notes are Held, Delivered or Cleared, and severities are Critical, Concern and Nit; the stages are named PRD Builder, PlanUnit Compilation, WorkNode Generation, Gate Evaluation.', now: 'A note is “being double-checked”, “told you in chat” or “let go”, and is a serious problem, a concern or a small thing, the words the choice “How readily it speaks up” already uses. A stage is named for what happens in it (“Writing the plan”, “The check before moving on”); PMConcept7’s names are under For experts.' },
      { was: 'Two lists of models disagree: “Model it uses” offers 13 choices (Automatic and 12 models, two of them free routes), while “If its model is not available” offers a different 10, without the free routes. Both offer GPT Image, a model that makes pictures.', now: 'Both rows offer the same models and sit in one card, “What it runs on”, worded as an exception to the everyday model with a link to “Which model does what”. The lists are PMConcept7’s; the mismatch and the picture model are reported as defects.' },
      { was: 'The Stages tab is ten dropdowns of equal weight. Five say “Same as Overview” and five say “Auto” while Overview is also “Auto”, so all ten do the same thing.', now: 'One line under the main choice says how many stages are watched and how many have a choice of their own. The ten rows are folded, in two groups: while planning, while building and checking.' },
      { was: 'The same choice is stored twice: “Advisor” (Off, Auto, Always watching) and a planning copy (Off, Auto, On) that follows it.', now: 'One control. The copy is not drawn, and a search for it lands on the main choice.' },
      { was: '“Spending” for Back Seat Driver is a third place that limits money, next to the monthly limit and the web credits, and no page points from one to the other.', now: 'It is a row in “What it runs on”, with a link to Spending & warnings.' },
      { was: 'The row “How readily it speaks up” is explained by “How readily the adviser speaks up.”, and “Quiet turns after advice” does not say what a turn is.', now: 'The rows are reworded: what speaking up easily means, and that a turn is one message from you and the answer to it.' }
    ]
  });
  uncover(advisorPage, [BSD.speak, BSD.quiet, BSD.persona, BSD.keep, BSD.catchUp, BSD.tidy]);

  /* ================================================================== one note from Back Seat Driver */
  const noteOf = (ctx) => notes(ctx.st).find((f) => f.id === (ctx.params || {}).id) || null;
  SMX.act('bsd-recheck', () => SMX.toast('Asked for a second look', 'It compares this note with the newest work at its next review, and the note stays as it is until then. Example only: no advisor runs in this preview.', 'info'));
  SMX.act('bsd-open-chat', () => SMX.toast('Not in this preview', 'In the app this opens the chat at the place where Back Seat Driver told you.', 'info'));
  SMX.act('bsd-dismiss', (el) => {
    const id = el.getAttribute('data-id'); const f = notes(SMX.fresh()).find((x) => x.id === id); if (!f) return;
    kit().confirm('Dismiss this note?', 'It closes for you and stays closed unless what it pointed at changes. Back Seat Driver is not told it was wrong.', 'Dismiss', () => {
      write((st) => { const x = (((st.pm51 || {}).bsd || {}).findings || []).find((y) => y.id === id); if (x) { x.state = 'closed'; x.closedReason = 'Dismissed by you'; x.closed = 'Just now'; } });
      SMX.toast('Note dismissed', `“${f.title}” is closed.`);
    });
  });
  SMX.page({
    id: 'ai/advisor/note/:id', chapter: 'ai', parent: 'ai/advisor',
    title: (ctx) => { const f = noteOf(ctx); return f ? f.title : 'A note from Back Seat Driver'; },
    purpose: (ctx) => { const f = noteOf(ctx); return f ? `A note from Back Seat Driver, raised ${String(ago(f.raised)).toLowerCase()} ${during(f.stage)}.` : ''; },
    legacy: [['ai', 'bsd', 'findings', 'bsd']],
    lead: (ctx) => {
      const st = ctx.st, f = noteOf(ctx);
      if (!f) return gone('note', 'ai/advisor', 'Back to Back Seat Driver');
      const [sevName, sevTone, sevIcon] = sev(f); const [stateName] = noteState(f); const n = Number(f.reconfirmations) || 0;
      const next = f.state === 'held' ? 'It is being double-checked. The work has moved on since it was raised, so at its next review Back Seat Driver compares it with the newest work. If it still holds, you are told in the chat; if not, it is let go. You are never shown a note that may be out of date as if it were current.'
        : f.state === 'emitted' ? `It was sent to you in the chat${f.frozen ? ' when the work had stopped, so it did not need a second check' : ' after it was compared with newer work and still held'}. What to do about it is yours to decide: Back Seat Driver cannot change anything.`
        : f.state === 'cleared' ? 'It was compared with newer work and no longer held, so it was let go without being shown to you.'
        : `${f.closedReason || 'Closed'}. It stays closed unless what it pointed at changes.`;
      const can = f.state === 'held' ? 'Wait for the second look, ask for it now, or dismiss the note if you already know it is wrong.' : f.state === 'emitted' ? 'Ask the assistant in the chat to fix it, or dismiss the note if you disagree.' : 'Nothing. It is kept here so you can look it up.';
      return [
        { key: 'summary', html: ui.summary({ icon: sevIcon, tone: f.state === 'held' || f.state === 'emitted' ? sevTone : 'off', lines: [h(f.claim), `${ui.b(sevName)} · ${h(stateName)}`] }) },
        { key: 'next', html: ui.card({ title: 'What happens next', body: `<p class="smx-am-text">${h(next)}</p>` + ui.rows([{ label: 'What you can do', help: can, control: (f.state === 'held' ? ui.btn({ label: 'Check it again now', icon: 'refresh', do: 'bsd-recheck', data: { id: f.id } }) : '') + (f.state === 'emitted' ? ui.btn({ label: 'Show it in the chat', icon: 'chat', do: 'bsd-open-chat', data: { id: f.id } }) : '') + (f.state === 'held' || f.state === 'emitted' ? ui.btn({ label: 'Dismiss it…', do: 'bsd-dismiss', data: { id: f.id } }) : '') }]) }) },
        { key: 'about', html: ui.card({ title: 'About this note', body: ui.facts([['How serious', sevName], ['Raised', `${ago(f.raised)}, ${during(f.stage)}`], f.delivered ? ['Told you in chat', ago(f.delivered)] : null, f.cleared ? ['Let go', ago(f.cleared)] : null, f.closed ? ['Closed', `${ago(f.closed)} · ${f.closedReason || 'Closed'}`] : null, ['Compared with newer work', n === 0 ? 'Not yet' : n === 1 ? 'Once' : `${n} times`], ['It pointed at', (f.evidence || []).length ? `${count(f.evidence.length, 'place')} in the work (listed under For experts)` : 'Nothing was recorded']].filter(Boolean)) }) }
      ];
    },
    expert: [{ key: 'raw', html: (ctx) => { const st = ctx.st, f = noteOf(ctx); if (!f) return ''; const label = (stagesOf(st).find((s) => s.key === f.stage) || {}).label || f.stage; let tech = (e) => `<code>${h(e)}</code>`; try { const t = kit().tech; if (t) tech = t; } catch (e) { /* plain code */ } return ui.card({ title: 'What it pointed at', help: 'The references Back Seat Driver recorded when it raised this, as it wrote them.', body: ((f.evidence || []).length ? `<ul class="smx-am-evidence">${f.evidence.map((e) => `<li>${tech(e)}</li>`).join('')}</ul>` : '<p class="smx-quiet-line">No references were recorded.</p>') + ui.facts([['Stage, as PMConcept7 names it', label], ['Version of the work it was raised against', `Generation ${f.generation || '—'}`], ['Note id', f.id], ['State, as stored', f.state]]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Open the original sheet', icon: 'external', action: 'pm51-bsd-finding', data: { id: f.id } })}</div>` }); }, count: 0 }],
    expertLabel: 'What it pointed at, and the original sheet', expertHelp: 'File names and references, as recorded',
    changes: [
      { was: 'A finding is a sheet over the list: “Severity: Critical”, “Stage: Gate Evaluation”, “Raised against: Generation 41”, “Reconfirmed: 0×”, then evidence as raw references such as “gate/F3-441/decision.json · result: pass” and “verify/pre-merge/run-2026-09-09T18:41 · no result recorded”.', now: 'The note opens on what it says, in the words Back Seat Driver wrote for a person. Then what happens next and what you can do. Its references are counted in a sentence and listed, as recorded, under For experts.' },
      { was: '“Open in chat” on a delivered finding answers “cmd.bsd.finding.open is not registered yet, so this preview cannot jump to the advice card.”', now: '“Show it in the chat” says in everyday words that the preview cannot open the chat. The original sheet and its buttons are still reachable under For experts; the message that names a command is reported as a defect of PMConcept7.' },
      { was: '“Reconfirm now” and “Dismiss” are the sheet’s two buttons, in words that need the help panel (“held”, “reconfirmed”).', now: '“Check it again now” and “Dismiss it…”, under a line that says what each is for.' }
    ]
  });
  (SMX.thingSources = SMX.thingSources || []).push((st) => notes(st).map((f) => ({ title: f.title, sub: 'AI providers › Back Seat Driver › a note it raised', route: noteRoute(f) })));

  /* ================================================================== words: rows of PMConcept7 that read better said another way */
  SMX.reword({
    'web.fetch.research-max-sources': { label: 'Most websites for one question', help: 'For questions that need several sources. Fewer is faster and cheaper.' },
    'web.fetch.crawl-max-pages': { label: 'Most pages of one site', help: 'It stops reading a site after this many pages.' },
    'web.fetch.crawl-max-depth': { label: 'How many links deep it goes', help: 'How many clicks away from the first page it may follow links.' },
    'web.fetch.map-max-pages': { help: 'An outline lists a site’s pages without reading them. It stops listing after this many.' },
    'web.fetch.map-max-depth': { help: 'How many clicks away from the first page it may list.' },
    'web.fetch.cache-ttl-fetch': { help: 'After this a page is read again.' },
    'web.fetch.cache-ttl-crawl': { label: 'Keep whole sites and outlines for', help: 'After this they are read again.' },
    'web.providers.provider-order': { label: 'Backup order of search services', help: 'Used only by an ability whose own order is empty.' },
    'web.providers.health-disclosure': { label: 'Show why a search service failed', help: 'Its last error is shown on the search service’s page.' },
    'media.capabilities.tts-voice': { help: 'The voice that reads aloud.' },
    'media.capabilities.video-resolution': { help: 'Sharper video takes longer and costs more.' },
    'media.capabilities.response-format': { help: 'As a link to the picture, or as the picture itself inside the reply.' },
    'media.capabilities.provider-params': { label: 'Extra options for the AI provider' },
    'media.image.model-aliases': { label: 'Nicknames for picture and video models' },
    'media.io.image-source-order': { label: 'Which picture is meant', help: 'For example: you attach a picture, and the assistant made one a moment ago. The first place in this list wins.' },
    'media.io.redaction-policy': { help: 'For example a screenshot that shows a password. Blocking the picture is safest.' },
    'safety.approvals.bsd-trigger-sensitivity': { help: 'Small things are easy to ignore; a serious problem is not.' },
    'safety.approvals.bsd-cooldown-turns': { label: 'After it speaks, stay quiet for', help: 'A turn is one message from you and the answer to it. This keeps it from repeating itself.' },
    'safety.approvals.bsd-retain-transcript': { label: 'Keep Back Seat Driver’s own conversation', help: 'Lets you open it and see why it told you something.' },
    'safety.approvals.bsd-persona': { help: 'A persona sets its tone. Critical Advisor is blunt about risk and was made for this. Your own personas can be chosen too.' }
  });
})(window);
