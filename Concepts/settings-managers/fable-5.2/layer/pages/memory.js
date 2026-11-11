/* Settings managers, rethought (Fable 5.2): the chapter "Memory & helpers".
   Today this is two managers of eleven tabs: Context & Memory (Memories, Context space, Instructions, Finding memories,
   Keeping & privacy, Sources) and Personas & Crews (Personas, Crews, Group work, Helpers, Defaults). Here it is six
   pages that each answer one question a newcomer has: what does it remember, which rules does it follow, how much can
   it keep in mind, who answers, who works as a team, and who helps with a big job.
   - Every memory, persona and crew has a page of its own with everything about that one thing. Its actions are
     ordinary buttons there, the destructive one last. In PMConcept7 most of those actions are items of a "More
     actions" menu that exists only while its manager is drawn, so they have no action name to call. Where PMConcept7
     has an action name the button calls it; the others do the same thing here, on the same demo state.
   - A model, a permission or a limit that one persona, a crew or the helpers may differ in is shown as an exception to
     the page that owns the choice, with a link there. It is never a second copy of the choice.
   - Lists are read from the engine's state. The Memory manager adds two example notes and its "could be forgotten"
     list the first time it draws, so memState() asks it for that before a list is read on a fresh load. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const DOC = W.document;

  /* ------------------------------------------------------------------ small helpers */
  const on = (v) => v === true || v === 'on' || v === 'true';
  const val = (id) => SMX.val(id);
  const word = (id, v) => { try { return String(kit().valueLabel(id, v === undefined ? val(id) : v)); } catch (e) { return String(v === undefined ? val(id) : v); } };
  const and = (list) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`);
  const count = d.plural;
  const toggle = (onNow, o) => { try { return kit().toggle(onNow, o); } catch (e) { return ''; } };
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const srows = (list) => { try { return kit().scoped.rows(list.filter(Boolean)); } catch (e) { return list.filter(Boolean).join(''); } };
  const facts = (pairs) => ui.facts(pairs.filter(Boolean));
  const initials = (name) => String(name || '?').split(/[\s/]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const newId = (p) => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
  const enc = encodeURIComponent;
  /* change the engine's demo state, the way a manager's own menu items do */
  const write = (fn) => { const st = eng().getState(); fn(st); eng().setState(st); SMX.fresh(); SMX.soon(30); };
  const fold = (key, label, help, body) => `<details class="smx-fold smx-fold-more" data-smx-fold="${h(key)}"${SMX.local.openMore[key] ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">${h(label)}</span><span class="smx-fold-help">${h(help)}</span></summary><div class="smx-fold-body">${body}</div></details>`;
  /* rows that say what a choice owned by another page is set to; the link goes to wherever that setting is placed */
  const elsewhere = (title, help, rows) => ui.card({ cls: 'smx-things-card', title, help, body: `<div class="smx-things">${rows.filter(Boolean).map(([name, v, go, reveal]) => { const w = reveal ? SMX.where(reveal) : null; const to = w ? w.route : go; return `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(to)}"${reveal ? ` data-smx-reveal="${h(reveal)}"` : ''}><span class="smx-thing-copy"><span class="smx-thing-name">${h(name)}</span><span class="smx-thing-sub">${h(v)} · ${h(SMX.pageName(to))}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`; }).join('')}</div>` });
  const switchLine = (label, control) => `<span class="smx-switch-line"><span>${h(label)}</span>${control}</span>`;
  const everydayModel = () => { const v = val('ai.models.default-model'); return v ? word('ai.models.default-model', v) : 'the everyday model'; };
  const uncover = (page, ids) => { if (page && page.covers) for (const id of ids) delete page.covers[id]; };

  /* The framework's "show me that setting" centres the row with scrollIntoView, which also scrolls the app's window
     (the title bar slides out of sight and nothing brings it back). While one of this lane's pages is showing, the
     window is put back at once; the page's own scroller keeps the row in view. */
  if (!SMX.shellGuard) {
    SMX.shellGuard = true;
    W.addEventListener('scroll', (e) => {
      const t = e.target; if (t !== DOC && t !== DOC.body && t !== DOC.documentElement) return;
      if (SMX.view !== 'new' || !/^(memory|planning)(\/|$)/.test(String(SMX.route || ''))) return;
      if (DOC.body.scrollTop) DOC.body.scrollTop = 0;
      if (DOC.documentElement.scrollTop) DOC.documentElement.scrollTop = 0;
    }, true);
  }

  /* Jump to a place on the page by moving the page's own scroller. (The framework's own jump uses scrollIntoView,
     which also moves the app's window and pushes the title bar out of sight.) */
  const jump = (anchor) => { const sc = SMX.scroller && SMX.scroller(); const n = sc ? sc.querySelector(`[data-smx-anchor="${anchor}"]`) : null; if (n) sc.scrollTop += n.getBoundingClientRect().top - sc.getBoundingClientRect().top - 14; };
  SMX.act('lane-jump', (el) => jump(el.getAttribute('data-to')));

  /* When one of PMConcept7's own flows makes a thing (the persona and crew set-up helpers, Duplicate), the manager
     selects it. The page follows that selection to the new thing's own page. */
  const follow = (st, key, routeOf) => {
    const sel = ((st.pm51 || {}).sel || {})[key] || ''; const k = 'sel:' + key; const seen = SMX.local.flags[k];
    SMX.local.flags[k] = sel;
    if (seen === undefined || !sel || sel === seen) return;
    const to = routeOf(sel); if (to && to !== SMX.route) W.setTimeout(() => SMX.go(to), 0);
  };

  /* A filter box over a list (the framework's own kind of field): the page is drawn again after every keystroke and
     each list reads what is typed from the field itself. The line that holds the field never changes as you type. */
  const filterBox = (name, placeholder) => `<label class="smx-filter"><span class="icon" aria-hidden="true">${SMX.icon('search')}</span><input type="search" autocomplete="off" spellcheck="false" placeholder="${h(placeholder)}" aria-label="${h(placeholder)}" data-smx-input="lane-filter" data-smx-filter="${h(name)}" data-smx-key="filter-${h(name)}"></label>`;
  const typed = (name) => { const host = SMX.host && SMX.host(); const box = host ? host.querySelector(`[data-smx-filter="${name}"]`) : null; return box ? String(box.value || '').trim().toLowerCase() : ''; };
  const hits = (q, ...texts) => !q || texts.join(' ').toLowerCase().includes(q);
  const noMatch = (q, what) => `<p class="smx-quiet-line">No ${h(what)} matches “${h(q)}”.</p>`;
  SMX.act('lane-filter', () => { /* nothing to keep: the lists read the field when they are drawn */ });

  /* rows of this chapter whose words say "workspace" for a working copy */
  if (SMX.reword) SMX.reword({
    'branching.subagents.parallel-subagents': { help: 'Each helper works in its own working copy, at the same time, instead of taking turns.' },
    'branching.subagents.write-isolation-mode': { help: 'Restrict helpers further: only the lead edits files, helpers suggest patches, or each helper gets its own working copy.' }
  });

  /* ================================================================== readers */
  const M = { on: 'memory.retention.enabled', show: 'memory.retention.gist-review-filter', fade: 'memory.retention.half-life-by-kind', keepNew: 'memory.retention.auto-save-unverified', helpers: 'memory.retention.subagent-access', max: 'memory.assembly.max-injected-memories', mode: 'memory.retention.retrieval-mode', packs: 'memory.assembly.rule-pack-display', appRules: 'memory.assembly.app-rules', projectRules: 'memory.assembly.project-rules', reuse: 'memory.assembly.dry-method-guard', history: 'memory.retention.history-retention' };
  const memState = (st) => {
    let m = (st.pm51 || {}).memory || {};
    if (!m.o55V2) { try { eng().dispatchAction('pm51-memory-candidate', { id: 'smx-none' }); st = SMX.fresh(); m = (st.pm51 || {}).memory || {}; } catch (e) { /* the lists then show what the state holds */ } }
    return { st, m, list: st.memories || [] };
  };
  const WHERE = { Project: 'This project', User: 'You, in every project', Thread: 'One chat' };
  const WHERE_IN = { Project: 'this project', User: 'you, in every project', Thread: 'one chat' };
  const KIND = {
    Rule: ['A rule the assistant always follows', 'Rules are always followed.'],
    Decision: ['A decision it keeps in mind', 'Decisions record a choice that was made.'],
    Preference: ['A preference of yours', 'Preferences shape how it does things.'],
    'Working context': ['A working note', 'Working notes describe one piece of work and matter only while it lasts.']
  };
  const LEARNED = { Explicit: 'you said it', Confirmed: 'you confirmed it', Observed: 'the assistant noticed it' };
  const SHOWS = { Unverified: (x) => x.confidence === 'Observed', Verified: (x) => x.confidence !== 'Observed', Pinned: (x) => !!x.pinned, All: () => true };
  const unchecked = SHOWS.Unverified;
  const memOn = () => on(val(M.on));
  const showNow = () => { const v = String(val(M.show) || 'All'); return SHOWS[v] ? v : 'All'; };
  const memStatus = (x, onNow) => (!onNow ? ['Not used', 'off'] : unchecked(x) ? ['Not checked yet', 'attention'] : x.pinned ? ['Pinned', 'ready'] : ['In use', 'ready']);
  const memRoute = (id) => `memory/item/${enc(id)}`;
  const memThing = (x, onNow) => {
    const [text, tone] = memStatus(x, onNow);
    return { icon: x.store === 'Thread' ? 'clock' : x.pinned ? 'pin' : 'memory', name: x.title, tag: x.type, sub: x.text, sub2: `Kept for ${WHERE_IN[x.store] || x.store} · ${LEARNED[x.confidence] || x.confidence} · ${String(x.updated || '').toLowerCase()}`, status: { text, tone }, go: memRoute(x.id),
      side: unchecked(x) ? ui.btn({ label: 'Confirm', icon: 'check', action: 'pm51-memory-confirm', data: { id: x.id } }) + ui.btn({ label: 'Forget', do: 'memory-forget', data: { id: x.id } }) : '' };
  };
  const conflictsFor = (list, x) => list.filter((o) => o.id !== x.id && o.type === x.type && o.store === x.store && String(o.title).split(' ')[0] === String(x.title).split(' ')[0]);
  const protectedWords = (m) => { const p = ((m.privacy || {}).protect) || {}; const parts = [p.pinned ? 'Pinned' : '', p.rules ? 'Rules' : '', p.decisions ? 'Decisions' : '', p.preferences ? 'Preferences' : ''].filter(Boolean); return parts.length ? parts.join(' · ') : 'None'; };

  /* personas, crews, templates: plain state */
  const P = 'personas.library.', U = 'personas.tuning.', T = 'personas.tools.';
  const PS = {
    name: P + 'persona-name', desc: P + 'persona-description', pid: P + 'persona-id', aliases: P + 'persona-aliases', tags: P + 'persona-tags', hidden: P + 'disabled-bundled', chatDefault: P + 'default-persona', pick: P + 'selection-mode', lock: P + 'lock-persona',
    style: U + 'response-style', format: U + 'output-format', mode: U + 'default-mode', verbosity: U + 'verbosity', talk: U + 'talkativeness',
    platform: U + 'default-platform', model: U + 'default-model', variant: U + 'default-variant', effort: U + 'reasoning-effort', budget: U + 'cost-budget', temp: U + 'temperature', topp: U + 'top-p',
    prompt: T + 'system-prompt', perms: T + 'permission-profile', posture: T + 'tool-posture', prefer: T + 'preferred-tools', avoid: T + 'discouraged-tools', guidance: T + 'tool-guidance', skills: T + 'default-skills', plugins: T + 'disabled-plugins',
    crews: 'branching.crew.crew-enabled', helpers: 'branching.subagents.enable-subagents'
  };
  const personas = (st) => st.personas || [];
  const crews = (st) => st.crews || [];
  const hiddenIds = () => { const v = val(PS.hidden); return Array.isArray(v) ? v.map(String) : []; };
  const isHidden = (p) => p.group === 'Bundled' && hiddenIds().includes(p.id);
  const kindOf = (p) => (p.locked ? 'core' : p.group === 'Bundled' ? 'bundled' : 'custom');
  const defaultPersona = (st) => personas(st).find((p) => p.id === String(val(PS.chatDefault))) || personas(st).find((p) => p.id === 'assistant') || personas(st)[0] || null;
  const personaRoute = (id) => `memory/personas/${enc(id)}`;
  const crewRoute = (id) => `memory/crews/${enc(id)}`;
  const goalDefaults = (st) => (((st.pm51 || {}).goals || {}).defaults) || {};
  const crewsOn = () => on(val(PS.crews));
  const helpersOn = () => on(val(PS.helpers));
  const HANDOFFS = [['Structured task summary', 'Task summary'], ['Test results', 'Test results'], ['Screens and findings', 'Screens and findings'], ['Full notes', 'Full notes']];
  const handoffLabel = (v) => (HANDOFFS.find((x) => x[0] === v || x[1] === v) || [v, String(v || '').replace(/receipts?/i, 'summary')])[1];

  /* what needs you, for this chapter and for Settings Home */
  const needs = (st0, here) => {
    const { list } = memState(st0); if (!memOn()) return [];
    const n = list.filter(unchecked).length;
    return n ? [{ tone: 'info', title: `${count(n, 'note')} the assistant made ${n === 1 ? 'is' : 'are'} waiting for you to check`, detail: 'It does not rely on a note it noticed by itself until someone confirms it.', fix: Object.assign({ label: n === 1 ? 'Check it' : 'Check them' }, here ? { do: 'lane-jump', data: { to: 'memories-first' } } : { go: 'memory' }) }] : [];
  };
  (SMX.needSources = SMX.needSources || []).push((st) => needs(st, false));

  /* ================================================================== Memories (the chapter's first page) */
  const FIRST = {
    Unverified: ['Waiting for you to check', 'The assistant noticed these by itself. Confirm the ones that are right and forget the rest.', { icon: 'check', title: 'Nothing is waiting to be checked', text: 'Every note the assistant noticed has been checked.' }],
    Verified: ['Checked by you', 'Things you said yourself, and notes you confirmed.', { icon: 'memory', title: 'Nothing has been checked yet', text: 'Confirm a note and it is listed here.' }],
    Pinned: ['Pinned', 'Considered before any other memory.', { icon: 'pin', title: 'Nothing is pinned', text: 'Open a memory and pin it to have it considered first.' }]
  };
  const tryCard = (m, onNow) => {
    const res = m.results; const manual = String(val(M.mode) || '') === 'manual';
    let input = ''; try { input = kit().input(m.query || '', { action: 'pm51-memory-query', placeholder: 'For example: what are the rules for installing provider tools?', label: 'Question' }); } catch (e) { input = ''; }
    const out = !res ? '' : !res.length ? ui.note(onNow ? 'No memory fits that question. The assistant would answer from the conversation alone.' : 'Remembering is turned off, so nothing would be read.')
      : (manual ? ui.note('Memories are read only when you ask for them, so in a chat these would wait for you.', 'info') : '') + `<div class="smx-things">${res.map((x, i) => `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(memRoute(x.id))}"><span class="smx-thing-avatar is-initials">${i + 1}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(x.title)}</span><span class="smx-thing-sub">${h([WHERE[x.store] || x.store, x.type, x.reason].filter(Boolean).join(' · '))}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`).join('')}</div>`;
    return ui.card({ anchor: 'try', title: 'Try a question', help: 'Type what you might ask in a chat. You see which memories the assistant would read first, and why.', body: `<div class="pm51-memory-try">${input}${ui.btn({ label: 'Search memories', icon: 'search', primary: true, action: 'pm51-memory-search' })}</div>${out ? `<div class="smx-pad">${out}</div>` : ''}` });
  };
  /* PMConcept7 keeps the open tab of Context & Memory under its workspace id, so "Today" is sent there by that name */
  const OLD_MEMORY = (tab) => ['memory', 'context-memory', tab, 'context-memory'];
  SMX.extend('memory', {
    legacy: [OLD_MEMORY('memories'), OLD_MEMORY('retrieval'), OLD_MEMORY('retention')],
    purpose: 'A memory is a short note the assistant keeps so you do not have to repeat yourself. This chapter also holds the rules it follows and who does the work.',
    keywords: ['remember', 'forget', 'memory', 'memories', 'notes', 'pin', 'pinned', 'prefer pinned', 'unconfirmed', 'confirm', 'privacy', 'crews can read', 'disagree', 'conflict', 'export memories', 'delete all memories', 'tidy'],
    lead: (ctx) => {
      const { st, m, list } = memState(ctx.st); const onNow = memOn(); const show = showNow();
      const q = typed('memories'); const match = (x) => hits(q, x.title, x.text, x.type, WHERE[x.store] || '');
      const proj = list.filter((x) => x.store === 'Project').length, you = list.filter((x) => x.store === 'User').length, chat = list.filter((x) => x.store === 'Thread').length;
      const parts = [proj ? `${proj} about ${d.project(st)}` : '', you ? `${you} about you` : '', chat ? `${chat} from a single chat` : ''].filter(Boolean);
      const cand = (m.candidates || []).length; const dp = defaultPersona(st);
      const first = (show === 'All' ? [] : list.filter(SHOWS[show])).filter(match); const rest = (show === 'All' ? list.slice() : list.filter((x) => !SHOWS[show](x))).filter(match);
      rest.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      const blocks = [
        { key: 'summary', html: ui.summary({ icon: 'memory', tone: !onNow ? 'off' : list.some(unchecked) ? 'attention' : 'ready', lines: [
          !list.length ? 'Puppet Master has no memories yet. Tell it something to remember, or let it notice things as you work.'
            : onNow ? `Puppet Master remembers ${ui.b(count(list.length, 'thing'))}: ${h(and(parts))}. Before it answers, it reads the ones that fit your question.`
              : `Remembering is turned off, so every chat starts from a clean slate. The ${ui.b(count(list.length, 'memory', 'memories'))} below ${list.length === 1 ? 'is' : 'are'} kept until you delete ${list.length === 1 ? 'it' : 'them'}.`,
          `It follows ${ui.word('your rules', { go: 'memory/rules' })} in every chat. ${dp ? ui.word(dp.name, { go: 'memory/personas' }) : 'A persona'} answers unless you pick someone else${helpersOn() ? `, and ${ui.word('helpers', { go: 'memory/helpers' })} can share a big job` : ''}.`
        ], side: switchLine('Remember between chats', ui.toggle(M.on, { label: 'Remember things between chats' })) }) },
        { key: 'needs', html: ui.needs(needs(st, true)) },
        { key: 'tools', html: `<div class="smx-toolbar">${list.length ? ui.select(M.show, { prefix: 'Listed first', label: 'Which memories are listed first', width: 170 }) : ''}${list.length && show !== 'All' ? ui.link({ label: 'List them all together', action: 'pm51-memory-show-all' }) : ''}<span class="smx-toolbar-gap"></span>${list.length > 3 ? filterBox('memories', 'Filter memories') : ''}</div>` }
      ];
      if (!list.length) blocks.push({ key: 'list-first', html: ui.things({ anchor: 'memories-first', title: 'What it remembers', items: [], empty: { icon: 'memory', title: 'No memories yet', text: 'Add a memory to give the assistant something to keep in mind.', fix: { label: 'Add a memory', action: 'pm51-memory-add' } } }) });
      else if (q && !first.length && !rest.length) blocks.push({ key: 'list-none', html: noMatch(q, 'memory') });
      else if (show === 'All') blocks.push({ key: 'list-first', html: ui.things({ anchor: 'memories-first', title: 'What it remembers', help: 'Open one to read it, pin it, move it or forget it.', items: rest.map((x) => memThing(x, onNow)) }) });
      else {
        if (first.length || !q) blocks.push({ key: 'list-first', html: ui.things({ anchor: 'memories-first', title: `${FIRST[show][0]}${first.length ? ` · ${first.length}` : ''}`, help: FIRST[show][1], items: first.map((x) => memThing(x, onNow)), empty: FIRST[show][2] }) });
        if (rest.length) blocks.push({ key: 'list-rest', html: ui.things({ anchor: 'memories-rest', title: `Everything else it remembers · ${rest.length}`, help: 'Open one to read it, pin it, move it or forget it.', items: rest.map((x) => memThing(x, onNow)) }) });
      }
      blocks.push({ key: 'tasks', html: ui.tasks([
        { icon: 'plus', title: 'Tell it something to remember', sub: 'A rule, a decision or a preference, in your own words', action: 'pm51-memory-add' },
        { icon: 'search', title: 'See what it would use', sub: 'Ask a question and see which memories it would read', do: 'lane-jump', data: { to: 'try' } },
        { icon: 'archive', title: 'Clear out old notes', sub: cand ? `${count(cand, 'working note')} could be forgotten` : 'Nothing is waiting to be cleared', action: 'pm51-memory-candidates' },
        { icon: 'notes', title: 'Write rules it always follows', sub: 'For every project, or for this one', go: 'memory/rules' }
      ], { title: 'What do you want to do?' }) });
      blocks.push({ key: 'try', fixed: true, sig: JSON.stringify([m.results || null, onNow, val(M.mode)]), html: tryCard(m, onNow) });
      return blocks;
    },
    sections: [
      { key: 'keeping', html: (ctx) => { const { m } = memState(ctx.st); const cand = (m.candidates || []).length, gone = (m.forgotten || []).length; return ui.card({ title: 'Keeping and forgetting', help: 'A memory nobody uses fades: the assistant stops reading it. Nothing is removed for good without you.', body: srows([ui.setting(M.fade), ui.setting(M.keepNew)]) + ui.rows([
        { label: 'Old notes that could go', help: 'Working notes that probably no longer matter. You keep or forget each one.', value: cand ? count(cand, 'note') : 'None right now', muted: !cand, control: cand ? ui.btn({ label: 'Review', icon: 'eye', action: 'pm51-memory-candidates' }) : '' },
        gone ? { label: 'Forgotten in the last 30 days', help: 'Kept that long in case you change your mind.', value: count(gone, 'memory', 'memories'), control: ui.btn({ label: 'Restore', icon: 'restore', action: 'pm51-memory-restore' }) } : null,
        { label: 'Never forgotten by itself', help: 'These stay, whatever the fade times say.', value: protectedWords(m), control: ui.btn({ label: 'Change', action: 'pm51-memory-protected' }) }
      ]) }); } },
      { key: 'sharing', html: (ctx) => { const { m } = memState(ctx.st); return ui.card({ title: 'Who else can read them', help: 'Only the assistant you talk to reads your memories, unless you allow more here.', body: srows([ui.setting(M.helpers)]) + ui.rows([
        { label: 'Crews can read project memories', help: 'Crew members see project rules and decisions. Memories about you stay private.', control: toggle(!!((m.privacy || {}).shareWithCrews), { action: 'pm51-memory-share', label: 'Crews can read project memories' }) },
        { label: 'What a helper starts with', help: 'Whether a helper starts from a clean slate is chosen with the helpers.', control: ui.btn({ label: 'Helper agents', icon: 'arrowRight', go: 'memory/helpers', reveal: 'branching.subagents.child-state-isolation' }) }
      ]) }); } }
    ],
    more: [
      { key: 'used', title: 'When memories are read', help: 'Whether they come in by themselves, and how many fit in one reply.', ids: ['memory.retention.retrieval-mode', 'memory.retention.rehydration', M.max] },
      { key: 'match', title: 'How memories are matched to a question', help: 'By what they mean, by how recent they are, or by the exact words.', ids: ['memory.retention.retrieval-strategy', 'memory.retention.retrieval-balance', 'memory.limits.memory-context-window'] },
      { key: 'pinned', html: (ctx) => { const { m } = memState(ctx.st); const r = m.retrieval || {}; return ui.card({ title: 'Pinned memories, and memories that disagree', body: ui.rows([
        { label: 'Prefer pinned memories', help: 'Pinned memories are considered before anything else.', control: toggle(!!r.preferPinned, { action: 'pm51-memory-retrieval-toggle', data: { key: 'preferPinned' }, label: 'Prefer pinned memories' }) },
        { label: 'When memories disagree', help: 'What happens when two memories point different ways.', control: select(r.disagree || 'Ask me', ['Ask me', 'Newest wins', 'Show both'], { action: 'pm51-memory-retrieval-select', data: { key: 'disagree' }, label: 'When memories disagree' }) },
        { label: 'Memories that could disagree', help: 'Pairs of the same kind that might contradict each other.', control: ui.btn({ label: 'Review', icon: 'eye', action: 'pm51-memory-conflicts' }) }
      ]) }); }, count: 2 },
      { key: 'fine', title: 'Fine points of keeping', help: 'How fast finished work fades, and what counts as checked.', ids: ['memory.retention.done-decay-multiplier', 'memory.retention.pinned-unverified-injection', 'memory.retention.verify-without-evidence'] },
      S('memory-retention-tools', { title: 'Tidy up', help: 'Chores that keep memory quick and accurate. None of them deletes a note for good.' })
    ],
    moreLabel: 'Finding, fading and tidying', moreHelp: 'How memories are picked for a reply, and upkeep',
    expert: [
      { key: 'how', count: 0, html: (ctx) => { const { m } = memState(ctx.st); const strategy = String(val('memory.retention.retrieval-strategy') || 'hybrid'); const bal = Number(val('memory.retention.retrieval-balance')); const pct = Math.round((Number.isFinite(bal) ? bal : 0.5) * 100); return ui.card({ title: 'How it decides right now', help: 'Written from the choices under “Finding, fading and tidying”.', body: facts([
        ['Read into a reply', word(M.mode)], ['Matched by', strategy === 'recency' ? 'Most recent first' : strategy === 'semantic' ? `Meaning (${pct}% meaning, ${100 - pct}% exact words)` : `Meaning and recency (${pct}% meaning)`],
        ['At most', `${count(Math.round(Number(val(M.max)) || 5), 'memory', 'memories')} in one reply`], ['Pinned', (m.retrieval || {}).preferPinned === false ? 'Ranked like any other memory' : 'Considered before anything else'],
        ['Pinned but not checked', on(val('memory.retention.pinned-unverified-injection')) ? 'Used' : 'Left out until you confirm it'], ['Notes kept for one chat', 'Only used in the chat that made them'],
        ['Never read into a reply', 'Passwords, keys and secret files · memories you forgot, even while they can still be restored'], ['Very long sources', 'Summarized, with a pointer to the original']
      ]) }); } },
      { key: 'budget', title: 'Room for memories in one reply', help: 'Counted in tokens, the unit AI models measure text in.', ids: ['memory.assembly.memory-capsule-budget'] },
      { key: 'all', html: () => ui.card({ title: 'All memories at once', help: 'Export leaves out secrets. Deleting everything cannot be undone.', body: `<div class="smx-btn-row">${ui.btn({ label: 'Export memories', icon: 'download', action: 'pm51-memory-export' })}${ui.btn({ label: 'Check that memory works', icon: 'test', action: 'pm51-memory-diagnostics' })}${ui.btn({ label: 'Delete all memories…', icon: 'trash', danger: true, action: 'pm51-memory-delete-all' })}</div>` }) }
    ],
    expertLabel: 'For experts', expertHelp: 'How it decides right now, export, a full check, and deleting everything',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How memory works', action: 'pm51-memory-help' }, { label: 'Put the memory choices back to how they came', action: 'pm51-memory-reset' }]) }],
    covers: { [M.fade]: 'The first row of “Keeping and forgetting” on this page.', [M.keepNew]: 'The second row of “Keeping and forgetting” on this page.', [M.on]: 'The switch “Remember between chats” at the top of this page.', [M.show]: 'The choice “Listed first” above the list of memories.', [M.helpers]: 'The first row of “Who else can read them” on this page.' },
    changes: [
      { was: 'Context & Memory is one manager of 6 tabs (Memories, Context space, Instructions, Finding memories, Keeping & privacy, Sources). “Reset memory settings” and “How memory works” repeat under all six.', now: 'Three pages, each one question: what it remembers (here), the rules it follows, and how much it can keep in mind. The two links appear once, here.' },
      { was: 'The Memories tab opens on three counters and a list filtered to “Unconfirmed”: 3 of 7 memories show, and both pinned rules are hidden until “Show all”.', now: 'Two sentences say what is remembered and for whom. Every memory is always listed; the same Show choice (now “Listed first”) only decides which group comes first, and the 3 unchecked notes have Confirm and Forget on their row.' },
      { was: 'A memory is read in a detail pane beside the list. Its actions (Edit, Pin, Move, Keep it longer, View source, Forget, Delete) are in a “More actions” menu.', now: 'A memory has its own page: what it says, who it is kept for, how it was learned, and its actions as ordinary buttons, Delete last.' },
      { was: 'How long a memory lasts, unconfirmed notes, forgetting and privacy are the fifth tab; “Try a question” is on the fourth; “Run diagnostics” is inside one memory’s Technical details.', now: 'What a newcomer decides is on this page in two cards (keeping and forgetting; who else can read). “Try a question” is a card here. Matching, limits and chores are folded; export, the check and “Delete all memories” are under For experts.' },
      'Words: “unconfirmed” is “not checked yet” wherever this page writes its own text; the setting rows keep PMConcept7’s labels. “Workspace” is “project”.'
    ]
  });

  /* ---- one memory ----------------------------------------------------------------------------------------------- */
  const memOf = (ctx) => { const o = memState(ctx.st); o.x = o.list.find((y) => y.id === (ctx.params || {}).id) || null; return o; };
  const findMem = (id) => (eng().getState().memories || []).find((y) => y.id === id) || null;
  SMX.act('memory-pin', (el) => { const id = el.getAttribute('data-id'); write((st) => { const x = (st.memories || []).find((y) => y.id === id); if (x) x.pinned = !x.pinned; }); });
  SMX.act('memory-move', (el) => {
    const id = el.getAttribute('data-id'); const x = findMem(id); if (!x) return; const oneChat = x.store === 'Thread';
    kit().panel({ title: oneChat ? 'Keep it longer' : 'Move memory', subtitle: x.title,
      body: (oneChat ? kit().note('Kept for one chat now, so it fades when that chat ends.', 'info') : '') + kit().panelSection('Who it is for', kit().field('Keep this memory for', kit().select(oneChat ? 'Project' : x.store, [['Project', 'This project'], ['User', 'You, in every project']], { label: 'Keep it for' }), 'Project memories stay with this project. Memories about you follow you to every project.')),
      primaryLabel: oneChat ? 'Keep it' : 'Move', onPrimary: (wrap) => { const sel = wrap.querySelector('select'); const to = sel && sel.value ? sel.value : 'Project'; write((st) => { const y = (st.memories || []).find((o) => o.id === id); if (y) { y.store = to; y.updated = 'Now'; } }); SMX.toast(oneChat ? 'Memory kept' : 'Memory moved', to === 'User' ? `${x.title} now follows you to every project.` : `${x.title} now stays with this project.`); } });
  });
  SMX.act('memory-forget', (el) => {
    const id = el.getAttribute('data-id'); const x = findMem(id); if (!x) return;
    kit().confirm(`Forget “${x.title}”?`, 'The assistant stops using it. It can be restored for 30 days from “Forgotten in the last 30 days” on the Memories page.', 'Forget', () => {
      write((st) => { const i = (st.memories || []).findIndex((y) => y.id === id); if (i < 0) return; const [y] = st.memories.splice(i, 1); const m = st.pm51.memory; (m.forgotten = m.forgotten || []).push(y); m.candidates = (m.candidates || []).filter((c) => c.id !== id); });
      SMX.toast('Memory forgotten', `${x.title} can be restored for 30 days.`, 'info'); if (SMX.route !== 'memory') SMX.go('memory', { replace: true });
    });
  });
  SMX.act('memory-delete', (el) => {
    const id = el.getAttribute('data-id'); const x = findMem(id); if (!x) return;
    kit().confirm(`Delete “${x.title}”?`, 'This removes the memory for good. Forget it instead if you might want it back.', 'Delete', () => {
      write((st) => { st.memories = (st.memories || []).filter((y) => y.id !== id); const m = st.pm51.memory; m.candidates = (m.candidates || []).filter((c) => c.id !== id); });
      SMX.toast('Memory deleted', x.title, 'warning'); if (SMX.route !== 'memory') SMX.go('memory', { replace: true });
    }, true);
  });
  SMX.page({
    id: 'memory/item/:id', chapter: 'memory', parent: 'memory',
    title: (ctx) => { const { x } = memOf(ctx); return x ? x.title : 'Memory'; },
    nav: (ctx) => { const { x } = memOf(ctx); return x ? x.title : 'Memory'; },
    purpose: (ctx) => { const { x } = memOf(ctx); return x ? `${(KIND[x.type] || ['A note'])[0]}, kept for ${WHERE_IN[x.store] || x.store}.` : ''; },
    legacy: [['memory', 'context-memory', 'memories', 'context-memory']],
    headSide: (ctx) => { const { x } = memOf(ctx); return x && unchecked(x) ? ui.btn({ label: 'Confirm', icon: 'check', primary: true, small: false, action: 'pm51-memory-confirm', data: { id: x.id } }) : ''; },
    lead: (ctx) => {
      const { x } = memOf(ctx); const onNow = memOn();
      if (!x) return [{ key: 'gone', html: ui.card({ title: 'This memory is no longer there', help: 'It was forgotten or deleted. A forgotten memory can be restored for 30 days from the Memories page.', body: ui.btn({ label: 'Back to Memories', go: 'memory' }) }) }];
      const [, tone] = memStatus(x, onNow); const oneChat = x.store === 'Thread';
      const how = unchecked(x) ? 'The assistant noticed this by itself, and nobody has checked it yet. It is not relied on until you confirm it.'
        : x.confidence === 'Explicit' ? 'You told the assistant this, so it treats it as a firm instruction.' : 'You confirmed this, so it is used like anything you said yourself.';
      return [
        { key: 'summary', html: ui.summary({ icon: oneChat ? 'clock' : x.pinned ? 'pin' : 'memory', tone, lines: [
          `${h(how)}${x.pinned ? ' It is pinned, so it is considered before any other memory.' : ''}`,
          !onNow ? 'Remembering is turned off, so it is not read right now.' : oneChat ? 'It is kept for one chat only and fades when that chat ends. To keep it, use “Keep it longer” below.' : ''
        ] }) },
        { key: 'text', html: ui.card({ title: 'What it says', side: ui.btn({ label: 'Edit', icon: 'edit', action: 'pm51-memory-edit', data: { id: x.id } }), body: `<p class="pm51-memory-text">${h(x.text || '')}</p>` }) },
        { key: 'about', html: ui.card({ title: 'About this memory', body: ui.rows([
          { label: 'Kept for', help: 'Project memories stay with this project. Memories about you follow you to every project.', value: WHERE[x.store] || x.store, control: ui.btn({ label: oneChat ? 'Keep it longer…' : 'Move…', do: 'memory-move', data: { id: x.id } }) },
          { label: 'Kind', help: (KIND[x.type] || ['', ''])[1], value: x.type },
          { label: 'How it was learned', help: unchecked(x) ? 'Noticed by the assistant, not said by you.' : x.confidence === 'Explicit' ? 'You said it directly.' : 'Recorded, then confirmed by you.', value: x.source },
          { label: 'Last changed', value: x.updated },
          { label: 'Pinned', help: 'A pinned memory is considered before any other.', control: `<span data-smx-do="memory-pin" data-id="${h(x.id)}">${toggle(!!x.pinned, { action: 'pm51-noop', label: `Pin ${x.title}` })}</span>` }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Forget', icon: 'history', do: 'memory-forget', data: { id: x.id } })}${ui.btn({ label: 'Delete this memory…', icon: 'trash', danger: true, do: 'memory-delete', data: { id: x.id } })}</div><p class="smx-quiet-line smx-pad">Forgetting keeps it for 30 days in case you change your mind. Deleting removes it for good.</p>` }
      ];
    },
    more: [{ key: 'conflicts', when: (ctx) => !!memOf(ctx).x, html: (ctx) => { const { x, list } = memOf(ctx); if (!x) return ''; const c = conflictsFor(list, x); return ui.things({ title: 'Memories that could contradict it', help: 'Others of the same kind, kept for the same place, that might point another way.', items: c.map((o) => ({ icon: 'memory', name: o.title, sub: `${WHERE[o.store] || o.store} · ${o.type} · ${o.updated}`, go: memRoute(o.id) })), empty: { icon: 'check', title: 'Nothing contradicts it', text: 'When two memories disagree, the newer thing you said wins.' } }); }, count: 0 }],
    moreLabel: 'Could it contradict another memory?', moreHelp: 'Memories of the same kind that point another way',
    expert: [{ key: 'tech', when: (ctx) => !!memOf(ctx).x, html: (ctx) => { const { x } = memOf(ctx); if (!x) return ''; return ui.card({ title: 'Technical details', body: facts([['Memory id', x.id], ['Store key', String(x.store || '').toLowerCase()], ['Pinned', x.pinned ? 'Yes' : 'No'], ['Type', x.type], ['Confidence', x.confidence]]) }); }, count: 0 }],
    changes: [
      { was: 'One memory is read in a pane beside the list. Edit, Pin, Move (or “Keep it longer”), View source, Forget and Delete are items of a “More actions” menu; “View source” opens a side panel that repeats the pane.', now: 'A page of its own. One sentence says how far the assistant relies on it; then what it says, who it is kept for and how it was learned. Confirm is the button at the top while a note is unchecked; Edit sits with the text, Move on the “Kept for” row, Pin is a switch, and Forget and Delete are buttons at the foot, Delete last.' },
      { was: '“Run diagnostics” for the whole memory system sits in one memory’s Technical details.', now: 'The check is on the Memories page under For experts. This page keeps only this memory’s own technical facts.' }
    ]
  });

  /* ================================================================== Rules & instructions */
  /* PMConcept7 keeps its seven example rule packs in the manager's code, not in its state, so they are named here. */
  const APP_RULES_SEED = 'Seeded from AGENTS.md on first run';
  const ruleText = (id) => { const v = String(val(id) || ''); return id === M.appRules && v === APP_RULES_SEED ? '' : v; };
  const PACKS = [
    { id: 'agents', name: 'AGENTS.md', from: 'A file in the project folder', state: () => 'Loaded' },
    { id: 'persona', name: 'Persona rules', from: 'The instructions of the persona that is answering', state: () => 'Loaded', go: 'memory/personas', goLabel: 'Personas' },
    { id: 'reuse', name: 'Reuse-first guard', from: 'Built in: reuse code before writing new code. A nudge only; safety rules always apply.', state: () => (on(val(M.reuse)) ? 'Loaded' : 'Switched off'), toggle: M.reuse },
    { id: 'style', name: 'Team style guide', from: 'docs/STYLE.md', state: () => 'Switched off' },
    { id: 'lint', name: 'Old lint rules', from: 'tools/lint-rules.md', state: () => 'Could not load', why: 'The file was moved or deleted.' }
  ];
  const packTone = (s) => (s === 'Loaded' ? 'ready' : s === 'Could not load' ? 'attention' : 'off');
  const docs = (st) => [[M.appRules, 'Rules for every project', 'Everywhere', 'Started from your AGENTS.md', 'Every piece of work reads these, in every project.'], [M.projectRules, `Rules for ${d.project(st)}`, 'This project', 'Nothing written yet', 'Saved with the code in .puppet-master/project-rules.md, so everyone on the project gets the same rules.']];
  const packsShown = () => { const mode = String(val(M.packs) || 'active'); return PACKS.map((p) => Object.assign({}, p, { now: p.state() })).filter((p) => (mode === 'all' ? true : mode === 'active' ? p.now === 'Loaded' : p.now !== 'Switched off')); };
  SMX.act('memory-packs-all', () => { try { eng().setSettingFromHost(M.packs, 'all', false); } catch (e) { /* the list keeps its view */ } SMX.fresh(); SMX.tick(); W.setTimeout(() => jump('packs'), 80); });
  const rulesPage = SMX.extend('memory/rules', {
    legacy: [OLD_MEMORY('instructions')],
    purpose: 'Standing instructions the assistant reads before every piece of work: for every project, or only for this one.',
    blurb: (ctx) => { const n = docs(ctx.st).filter(([id]) => id === M.appRules || ruleText(id).trim()).length + PACKS.filter((p) => p.state() === 'Loaded').length; return `${count(n, 'set')} of rules ${n === 1 ? 'is' : 'are'} read before every piece of work`; },
    status: () => (PACKS.some((p) => p.state() === 'Could not load') ? { text: '1 could not load', tone: 'attention' } : { text: 'Loaded', tone: 'ready' }),
    lead: (ctx) => {
      const st = ctx.st; const failed = PACKS.filter((p) => p.state() === 'Could not load'); const shown = packsShown();
      const loaded = PACKS.filter((p) => p.state() === 'Loaded').length; const projText = ruleText(M.projectRules).trim();
      const doc = ([id, name, tag, emptyWord, help]) => { const text = ruleText(id).trim(); const lines = text ? text.split('\n').filter((l) => l.trim()) : []; const has = id === M.appRules || !!text;
        return { icon: 'notes', name, tag, sub: lines.length ? `${lines[0]}${lines.length > 1 ? ` · ${lines.length} lines` : ''}` : emptyWord, sub2: help, status: { text: has ? 'Loaded' : 'Empty', tone: has ? 'ready' : 'off' }, action: 'pm51-memory-rules', data: { setting: id }, side: ui.btn({ label: text ? 'Edit' : 'Write', icon: 'edit', action: 'pm51-memory-rules', data: { setting: id } }) }; };
      return [
        { key: 'summary', html: ui.summary({ icon: 'notes', tone: failed.length ? 'attention' : 'ready', lines: [
          `Before every piece of work the assistant reads ${ui.b('your rules for every project')}${projText ? ` and ${ui.b(`your rules for ${d.project(st)}`)}` : ''}, then ${ui.b(count(loaded, 'more set'))} of rules from the project and from Puppet Master itself.`,
          failed.length ? `${ui.word(failed.map((p) => p.name).join(', '), { do: 'memory-packs-all' })} could not be loaded: ${h(String(failed[0].why || '').replace(/^The file/, 'its file'))} The assistant works without ${failed.length === 1 ? 'it' : 'them'}.` : projText ? '' : `Nothing is written for ${h(d.project(st))} alone yet.`
        ] }) },
        { key: 'docs', html: ui.things({ title: 'Rules you write', help: 'Plain sentences or a list. Keep them short: all of it is read every time.', items: docs(st).map(doc) }) },
        { key: 'packs', html: ui.card({ anchor: 'packs', cls: 'smx-things-card', title: 'Other rules it reads', help: 'Where each set comes from, and whether it loaded.', side: `<span class="smx-toolbar-inline">${ui.select(M.packs, { prefix: 'Show', label: 'Which rule sets to list', width: 190 })}<span class="smx-quiet-line">${shown.length} of ${PACKS.length}</span></span>`,
          body: shown.length ? `<div class="smx-things">${shown.map((p) => `<div class="smx-thing"><span class="smx-thing-avatar">${SMX.icon(p.id === 'persona' ? 'user' : p.id === 'reuse' ? 'refresh' : 'file')}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(p.name)}</span><span class="smx-thing-sub">${h(p.why ? `${p.from}. ${p.why}` : p.from)}</span></span><span class="smx-thing-end">${ui.status(p.now, packTone(p.now))}${p.toggle ? ui.toggle(p.toggle, { label: 'Reuse code before writing new code' }) : ''}${p.go ? ui.btn({ label: p.goLabel, icon: 'arrowRight', go: p.go }) : ''}</span></div>`).join('')}</div>` : `<p class="smx-quiet-line smx-pad">No set of rules matches this view.</p>` }) }
      ];
    },
    sections: [
      { key: 'packing', title: 'How much of the rules is read', help: 'Long rules can be read whole, kept within a size limit, or cut to the parts that fit the job.', ids: ['memory.assembly.instruction-budget-mode'] },
      S('memory-assembly-view', { title: 'Seeing what it was given', help: 'So you can check what the assistant read before a piece of work.', ids: ['memory.assembly.instruction-visibility', 'memory.assembly.injected-context-breakdown', 'memory.assembly.compiled-prompt-preview', 'memory.assembly.integrity-tracking'] })
    ],
    expert: [S('memory-assembly-safety', { title: 'Keeping instructions safe', help: 'Keep these on unless you are tracking down a problem.' })],
    covers: { [M.appRules]: 'The first row of “Rules you write” on this page.', [M.projectRules]: 'The second row of “Rules you write” on this page.', [M.reuse]: 'The switch on “Reuse-first guard” in “Other rules it reads”.', [M.packs]: 'The Show choice of “Other rules it reads”.' },
    changes: [
      { was: 'Instructions is the third tab of Context & Memory. “Rules for every project” appears twice on it under the same name: as a row with “Write” under Standing instructions, and as a row with “Open” under Rule packs. Both buttons open the same editor.', now: 'Each set of rules is listed once. The two you write come first, each with one button (Write, or Edit once there is text); the other five follow as “Other rules it reads”.' },
      { was: 'The rule pack list opens on “Loaded rule packs” (4 of 7), so “Old lint rules — Could not load” is hidden until the filter is changed.', now: 'The first sentences say when a set of rules could not be loaded and why; the words open the full list. The Show choice is kept.' },
      { was: '“Reuse code before writing new code” is a switch under Standing instructions and, again, the rule pack “Reuse-first guard” in the list below.', now: 'One row: the Reuse-first guard, with its switch on it.' },
      { was: 'Six “Prompt safety checks” (for example “Stable prompt baseline”, “Explain cache effects”) share the tab’s “More options” with nothing else.', now: 'They are under For experts as “Keeping instructions safe”.' }
    ]
  });
  uncover(rulesPage, ['memory.assembly.instruction-budget-mode']);

  /* ================================================================== Working space */
  const SOURCES = {
    'Project files': ['Project files', 'Files in this project, read when a question needs them.'],
    Plans: ['Plans', 'Your plans and what each one has to achieve.'],
    'Chat history': ['Earlier chats', 'Earlier chats in this project. Off keeps each chat on its own.'],
    'Tool output': ['Results from tools', 'What tests, terminals and the browser reported.'],
    'Manager records': ['What is set up in Settings', 'Settings and status from other pages, such as which services are connected.']
  };
  const OWNERS = { providers: 'ai', web: 'ai/web', mcp: 'code/connections', 'context-memory': 'memory', personas: 'memory/personas', 'source-manager': 'source', notifications: 'notifications/sounds', backup: 'keeping', skills: 'code/skills', plugins: 'code/plugins', commands: 'code/commands' };
  const sourcesOf = (m) => (Array.isArray(m.sources) ? m.sources : []);
  SMX.extend('memory/space', {
    legacy: [OLD_MEMORY('context'), OLD_MEMORY('sources')],
    purpose: 'How much a chat can keep in mind at once, what the assistant may read by itself, and what happens when a long chat fills up.',
    blurb: () => (on(val('memory.limits.auto-compress')) ? `A long chat is summarized from ${Number(val('memory.limits.pressure-start-threshold')) || 70}% full, so it can keep going` : 'Long chats are not summarized by themselves'),
    status: () => (on(val('memory.limits.auto-compress')) ? { text: 'Automatic', tone: 'ready' } : { text: 'By hand', tone: 'info' }),
    keywords: ['context', 'compaction', 'squeeze', 'summarize', 'tokens', 'notebook', 'sources', 'chat history', 'working space', 'project files', 'tool output', 'manager records', 'coverage'],
    lead: (ctx) => {
      const { m } = memState(ctx.st); const src = sourcesOf(m); const onN = src.filter((s) => s[1]).length; const auto = on(val('memory.limits.auto-compress'));
      const start = Number(val('memory.limits.pressure-start-threshold')) || 70, hard = Number(val('memory.limits.pressure-aggressive-threshold')) || 85;
      return [
        { key: 'summary', html: ui.summary({ icon: 'database', tone: auto ? 'ready' : 'info', lines: [
          auto ? `A chat can only keep so much in mind at once. When one is about ${ui.b(start + '% full')}, its oldest parts are summarized so the work can go on; from ${ui.b(hard + '%')} this is done firmly.`
            : `A chat can only keep so much in mind at once. Summarizing by itself is ${ui.b('turned off')}, so a long chat stops when it is full.`,
          `The assistant may read ${ui.b(`${onN} of ${src.length}`)} kinds of material by itself. Each chat shows how full it is (${ui.word('What the chat shows', { go: 'assistant/view', reveal: 'general.interaction.context-usage' })} has that meter). One chat can also be summarized at once from its own menu, with “Squeeze now”.`
        ] }) },
        { key: 'sources', html: ui.card({ title: 'What it may read by itself', help: 'Turn off anything the assistant should not read on its own.', body: ui.rows(src.map(([label, onNow], i) => { const [name, help] = SOURCES[label] || [label, '']; return label === 'Chat history'
          ? { label: name, help, control: ui.select(M.history, { label: 'Earlier chats', width: 160, choices: String(val(M.history)) === 'custom' ? ['none', 'recent', 'full', 'custom'] : ['none', 'recent', 'full'] }) }
          : { label: name, help, control: toggle(!!onNow, { action: 'pm51-memory-source', data: { index: i }, label: name }) }; })) }) },
        { key: 'when', html: ui.card({ title: 'What goes into a chat, and when', body: facts([['Always', 'The chat itself, the project’s rules, and the Goal it works on'], ['When a question needs it', 'Earlier chats, files, memories, and what is set up in Settings'], ['Never', 'Passwords and keys, secret files, unrelated personal data'], ['Very long files', 'Summarized, with a pointer to the original and a size limit']]) }) }
      ];
    },
    sections: [
      { key: 'full', title: 'When a chat fills up', help: 'Older parts are summarized (the rows below call this squeezing) so a long chat can keep going.', ids: ['memory.limits.auto-compress', 'memory.limits.compaction-mode', 'memory.limits.pressure-start-threshold', 'memory.limits.pressure-aggressive-threshold', 'memory.limits.low-context-warning'] },
      { key: 'notebook', title: 'Notes it keeps for itself', help: 'During a long job the assistant writes down what it found, so a fresh start does not lose it.', ids: ['memory.notebook.auto-capture', 'memory.notebook.resume-capsule'] }
    ],
    more: [
      { key: 'kept', title: 'What is kept when space is short', help: 'Which parts of a chat are protected, and how much of a tool’s result stays.', ids: ['memory.limits.tool-result-policy', 'memory.limits.budget-buckets', 'memory.limits.compaction-immune-pct', 'memory.limits.local-llm-caps'] }
    ],
    moreLabel: 'What is kept when space is short', moreHelp: 'Protected share, tool results and small models',
    expert: [
      { key: 'sizes', title: 'Sizes, in tokens', help: 'A token is the unit AI models measure text in: about three quarters of a word.', ids: ['memory.limits.max-context-ktokens', 'memory.limits.large-block-threshold', 'memory.limits.compaction-loop-limit', 'memory.notebook.capsule-budget-tokens', 'memory.notebook.injection-budget-tokens'] },
      { key: 'owners', html: (ctx) => { const { m } = memState(ctx.st); const src = sourcesOf(m); return ui.card({ title: 'Where each of these is managed', help: 'What the assistant can read is set up on other pages. Each has one home.', side: ui.btn({ label: 'Check that each one feeds in', icon: 'test', action: 'pm51-memory-coverage' }),
        body: `<div class="smx-things">${(m.owners || []).map(([resource, , , ws]) => { const go = OWNERS[ws] || 'home'; return `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(go)}"><span class="smx-thing-copy"><span class="smx-thing-name">${h(resource)}</span><span class="smx-thing-sub">${h(SMX.pageName(go))}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`; }).join('')}</div>` + `<div class="smx-pad">${facts([['Kinds of material turned on', `${src.filter((s) => s[1]).length} of ${src.length}`], ['Places linked', String((m.owners || []).length)], ['Last check', m.coverage || 'Not run yet']])}</div>` }); }, count: 0 }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How memory and the working space differ', action: 'pm51-memory-help' }]) }],
    covers: { [M.history]: 'The row “Earlier chats” of “What it may read by itself” on this page.', 'memory.limits.manual-compact': 'A sentence at the top of this page: one chat can be summarized at once from its own menu.' },
    changes: [
      { was: 'The working space of a chat is two tabs of Context & Memory: “Context space” (17 rows, 8 of them number boxes) and “Sources” (4 switches and a choice).', now: 'One page. Two sentences say what happens when a chat fills up; then what the assistant may read by itself; then the five choices about a full chat and the two about its own notes.' },
      { was: 'Rows measured in tokens (“Recap size limit 512 tokens”, “Notebook space per reply 1024 tokens”, “Largest working space”) sit among the everyday choices.', now: 'Every size counted in tokens is under For experts, with one line saying what a token is.' },
      { was: '“Squeeze one chat now” is a row whose value is the text “In each chat’s menu”: it sets nothing.', now: 'It is a sentence at the top of the page, not a row.' },
      { was: 'Sources › More options lists 11 “Single owners” (AI provider accounts, Backups, Skills…): links to other managers that have nothing to do with a chat’s working space, followed by a “Coverage” check.', now: 'The 11 are kept under For experts as “Where each of these is managed”, each opening the page that now holds it. The check is a button on that card.' },
      { was: '“Show a space meter in each chat” is on this manager although it only changes what a chat displays.', now: 'It moved to Chat & assistant › What the chat shows; this page says so and links to it.' }
    ]
  });

  /* ================================================================== Personas */
  const SHOW_PERSONAS = { all: 'All personas', custom: 'Yours', bundled: 'Specialists', core: 'Built in', hidden: 'Hidden from pickers' };
  const personaThing = (st, p) => { const dp = defaultPersona(st); return { initials: initials(p.name), name: p.name, tag: dp && dp.id === p.id ? 'Answers by default' : p.chat === false ? 'Helper only' : isHidden(p) ? 'Hidden from pickers' : '', sub: p.description, sub2: (p.crews || []).length ? `In ${p.crews.join(', ')}` : '', go: personaRoute(p.id) }; };
  const personasPage = SMX.extend('memory/personas', {
    purpose: 'A persona is a character the assistant plays: it has a job, its own way of answering, and the tools it reaches for.',
    blurb: (ctx) => { const dp = defaultPersona(ctx.st); const n = personas(ctx.st).length; return `${dp ? dp.name : 'Nobody'} answers by default · ${count(n, 'persona')}, ${personas(ctx.st).filter((p) => kindOf(p) === 'custom').length} of them yours`; },
    status: () => ({ text: word(PS.pick), tone: 'ready' }),
    lead: (ctx) => {
      const st = ctx.st; const all = personas(st); follow(st, 'personas', (id) => (all.some((p) => p.id === id) ? personaRoute(id) : ''));
      const q = typed('personas'); const match = (p) => hits(q, p.name, p.description || '', (p.crews || []).join(' '));
      const dp = defaultPersona(st); const mode = String(val(PS.pick) || 'auto'); const show = SHOW_PERSONAS[((st.pm51 || {}).personas || {}).show] ? st.pm51.personas.show : 'all';
      const mine = all.filter((p) => kindOf(p) === 'custom'), bundled = all.filter((p) => kindOf(p) === 'bundled' && !isHidden(p)), core = all.filter((p) => kindOf(p) === 'core'), hid = all.filter(isHidden);
      const want = (k, list) => (show === 'all' || show === k) && (!q || list.some(match));
      const rows = (list) => list.filter(match).map((p) => personaThing(st, p));
      const blocks = [
        { key: 'summary', html: ui.summary({ icon: 'user', tone: 'ready', lines: [
          `${dp ? ui.b(dp.name) : 'Nobody'} answers your chats when no one else is picked. ${mode === 'manual' ? `You ${ui.word('pick the persona yourself', { go: 'memory/personas', reveal: PS.pick })} for each chat.` : mode === 'hybrid' ? `Puppet Master ${ui.word('suggests a persona', { go: 'memory/personas', reveal: PS.pick })} and you confirm it.` : `For each new request, ${ui.word('Puppet Master picks', { go: 'memory/personas', reveal: PS.pick })} the persona that fits best.`}`,
          `You have ${ui.b(count(all.length, 'persona'))}: ${h(and([`${mine.length} you made`, `${bundled.length + hid.length} specialists that came with Puppet Master`, `${core.length} built in`]))}. In any chat you can say “let the researcher handle this”, and that persona takes over.`
        ] }) },
        { key: 'tools', html: `<div class="smx-toolbar"><span class="o55-bound-prefix">Show</span>${select(show, Object.entries(SHOW_PERSONAS).map(([v, l]) => ({ value: v, label: l, meta: v === 'hidden' ? `${hid.length} hidden` : v === 'core' ? `${core.length} locked` : '' })), { action: 'pm51-personas-show', label: 'Which personas to show', width: 190 })}<span class="smx-toolbar-gap"></span>${filterBox('personas', 'Filter personas')}</div>` }
      ];
      if (want('custom', mine)) blocks.push({ key: 'mine', html: ui.things({ anchor: 'personas-mine', title: `Yours · ${mine.length}`, help: 'Made by you. Change, export or delete them freely.', items: rows(mine), empty: { icon: 'user', title: 'You have not made a persona yet', text: 'Start from a copy of one you like, or from nothing. The steps guide you.', fix: { label: 'New persona', action: 'pm51-personas-new' } } }) });
      if (want('bundled', bundled)) blocks.push({ key: 'bundled', html: ui.things({ anchor: 'personas-bundled', cls: 'smx-two', title: `Specialists that came with Puppet Master · ${bundled.length}`, help: 'You can change these, or hide the ones you never use.', items: rows(bundled), empty: { icon: 'users', title: 'None showing', text: 'Every specialist is hidden from pickers.' } }) });
      if (want('core', core)) blocks.push({ key: 'core', html: ui.things({ anchor: 'personas-core', cls: 'smx-two', title: `Built in · ${core.length}`, help: 'Always there, and locked. Duplicate one to make a version you can change.', items: rows(core) }) });
      if ((show === 'hidden' || (show === 'all' && hid.length)) && (!q || hid.some(match))) blocks.push({ key: 'hidden', html: ui.things({ anchor: 'personas-hidden', title: `Hidden from pickers · ${hid.length}`, help: 'Specialists you chose not to see when picking a persona.', items: rows(hid), empty: { icon: 'eye', title: 'Nothing is hidden', text: 'A specialist you hide from pickers is listed here.' } }) });
      if (q && !all.some(match)) blocks.push({ key: 'list-none', html: noMatch(q, 'persona') });
      blocks.push({ key: 'tasks', html: ui.tasks([
        { icon: 'plus', title: 'Make a persona, or bring one in', sub: 'Step by step, from a copy, or from a PERSONA.md file', action: 'pm51-personas-add' },
        { icon: 'user', title: 'Choose who answers by default', sub: dp ? `Now: ${dp.name}` : '', go: 'memory/personas', reveal: PS.chatDefault },
        { icon: 'people', title: 'Put personas in a team', sub: 'A crew works on one Goal together', go: 'memory/crews' }
      ], { title: 'What do you want to do?', cols: 3 }) });
      return blocks;
    },
    sections: [
      { key: 'who', title: 'Who answers', help: 'When you have not picked a persona yourself.', ids: [PS.chatDefault, PS.pick, PS.lock] },
      { key: 'chats', html: () => `<p class="smx-quiet-line">Each chat shows who is answering in its persona chip, and you can change it there for that chat only. Switching by asking (“let the researcher handle this”) is always on.</p>` }
    ],
    more: [
      { key: 'new', title: 'New personas', help: 'Where a persona you make is saved, and a marker for choices a model cannot follow.', ids: [P + 'custom-scope', T + 'support-badges'] },
      { key: 'elsewhere', html: (ctx) => { const st = ctx.st; const roster = val('planning.verification.review-roster'); return elsewhere('Other places that pick a persona', 'Each is set where it is used. They are listed here so you can always answer “who will do this?”.', [
        ['Who asks the questions and drafts a plan', word('planning.interview.builder-persona-mode'), 'planning', 'planning.interview.builder-persona-mode'],
        ['Who reviews finished work', Array.isArray(roster) && roster.length ? roster.join(', ') : 'Puppet Master picks', 'planning/proof', 'planning.verification.review-roster'],
        ['Who a new Goal starts with', goalDefaults(st).persona || 'Assistant', 'planning/goals', ''],
        ['Which personas may be handed a small job', helpersOn() ? 'Any persona that can help' : 'Helpers are off', 'memory/helpers', '']
      ]); }, count: 0 }
    ],
    moreLabel: 'New personas, and other places that pick one', moreHelp: 'Where new ones are saved; planning, reviews, Goals and helpers',
    expert: [S('personas-tools-audit', { title: 'Choices a model could not follow', help: 'A log of persona settings that a model skipped on recent work.' })],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Check every persona', action: 'pm51-personas-validate' }, { label: 'How personas work', action: 'pm51-personas-help' }, { label: 'Put the persona choices back to how they came', action: 'pm51-personas-reset' }]) }],
    covers: { [P + 'active-persona']: 'A sentence under “Who answers”: each chat changes its own persona in its persona chip.', [P + 'ask-by-name']: 'A sentence under “Who answers”: switching by asking is always on.', [PS.hidden]: 'The switch “Show in pickers” on each specialist’s own page, and the group “Hidden from pickers” in the list.' },
    changes: [
      { was: 'Personas & Crews is one manager of 5 tabs (Personas, Crews, Group work, Helpers, Defaults). The Personas tab is a list of 21 beside the full detail of the first one; who answers by default is on the last tab.', now: 'Three pages: Personas, Crews & group work, Helper agents. This one opens with who answers and how a persona is picked, then the 21 as three groups: yours, the specialists, the built-in ones.' },
      { was: 'A persona’s actions (Duplicate, Add to crew, Hide from pickers, Export, Delete) are items of a “More actions” menu at the top of its detail pane; the only visible button is “Duplicate to edit” or “Try it”.', now: 'A persona has its own page. Its actions are ordinary buttons there, each where it belongs, Delete last.' },
      { was: 'The Defaults tab holds three “Change” rows that only point at other managers (Planning helpers, Reviewers, Goals).', now: 'They are one list, “Other places that pick a persona”, with what each is set to and a link.' },
      { was: '“Persona in one chat — Set in each chat” and “Switch by asking — Always on” are rows with nothing to set.', now: 'They are one sentence under “Who answers”.' },
      { was: '“Reset persona defaults” and “How personas work” repeat under all five tabs.', now: 'Once, at the foot of this page, with “Check every persona”.' }
    ]
  });
  uncover(personasPage, [PS.lock]);

  /* ---- one persona ---------------------------------------------------------------------------------------------- */
  const MIRROR = { [PS.name]: 'name', [PS.desc]: 'description', [PS.prompt]: 'prompt' };
  const pval = (p, id) => { if (MIRROR[id]) return p[MIRROR[id]] || ''; if (id === PS.pid) return p.id; if (id === PS.prefer) return (p.props && p.props[id]) || p.tools || []; try { return kit().scopedValue(p, id); } catch (e) { return undefined; } };
  const TUNE = {
    [PS.temp]: { min: 0, max: 2, step: 0.1, ends: ['Predictable', 'Inventive'], word: (v) => (v < 0.3 ? 'Very predictable' : v < 0.6 ? 'Predictable' : v <= 1 ? 'Balanced' : v <= 1.4 ? 'Inventive' : 'Very inventive') },
    [PS.topp]: { min: 0.05, max: 1, step: 0.05, ends: ['Likeliest words', 'Any word'], word: (v) => (v < 0.4 ? 'Narrow' : v < 0.75 ? 'Focused' : v < 0.95 ? 'Wide' : 'Full range') }
  };
  const tuneNum = (v) => (v == null || v === '' || v === 'inherit' ? NaN : Number(v));
  const tuneText = (id, v) => { const n = tuneNum(v); return Number.isFinite(n) ? `${+n.toFixed(2)} · ${TUNE[id].word(n)}` : 'Same as the project'; };
  const capOn = (v) => Number(v) > 0;
  const dataOf = (o) => SMX.data(o);
  const tuneCtl = (p, id) => {
    const t = TUNE[id], n = tuneNum(pval(p, id)), dd = { id: p.id, setting: id };
    if (!Number.isFinite(n)) return `<span class="o55-inherit o55-mgp-own"><span class="o55-auto">${SMX.icon('spark')}<span>Same as the project</span></span><button type="button" class="o55-textbtn" data-action="pm51-personas-own"${dataOf(dd)}>Set its own</button></span>`;
    const v = Math.max(t.min, Math.min(t.max, n));
    return `<div class="o55-mgp-tune"><div class="o55-mgp-tune-track"><span class="o55-mgp-tune-end" aria-hidden="true">${h(t.ends[0])}</span><input type="range" min="${t.min}" max="${t.max}" step="${t.step}" value="${v}" data-action="pm51-personas-tune"${dataOf(dd)} aria-label="${h(kit().rowLabel(kit().setting(id)))}" aria-valuetext="${h(tuneText(id, v))}"><span class="o55-mgp-tune-end" aria-hidden="true">${h(t.ends[1])}</span></div><div class="o55-mgp-tune-foot"><output class="o55-mgp-tune-now">${h(tuneText(id, v))}</output><button type="button" class="o55-textbtn" data-action="pm51-personas-inherit"${dataOf(dd)}>Same as the project</button></div></div>`;
  };
  const capCtl = (p) => {
    const v = pval(p, PS.budget), dd = { id: p.id, setting: PS.budget };
    if (!capOn(v)) return `<span class="o55-inherit o55-mgp-own"><span class="o55-auto">${SMX.icon('spark')}<span>No cap</span></span><button type="button" class="o55-textbtn" data-action="pm51-personas-own"${dataOf(dd)}>Set a cap</button></span>`;
    return `<span class="o55-inherit o55-mgp-own">${kit().scoped.control(PS.budget, v, { scope: 'persona', data: { id: p.id } })}<button type="button" class="o55-textbtn" data-action="pm51-personas-inherit"${dataOf(dd)}>Remove the cap</button></span>`;
  };
  const notesCtl = (p) => { const text = String(pval(p, PS.guidance) || '').trim(), first = text.split('\n').find((l) => l.trim()) || ''; return `<span class="o55-mgp-doc${text ? '' : ' is-empty'}">${h(text ? first : 'None yet')}</span>${ui.btn({ label: text ? 'Edit notes' : 'Write notes', icon: 'edit', action: 'pm51-personas-guidance', data: { id: p.id } })}`; };
  const TOOLS = ['Files', 'Terminal', 'Browser', 'Web search', 'Testing', 'Source control', 'Documents', 'Images', 'Profiler', 'Repository read', 'Planning tools'];
  const picks = (st, p, id) => { const base = id === PS.skills ? (((st.pm51 || {}).skills) || []).map((k) => k.name) : id === PS.plugins ? (((st.pm51 || {}).plugins) || []).map((k) => k.name) : TOOLS; const cur = pval(p, id); return [...new Set([...base, ...(Array.isArray(cur) ? cur.map(String) : [])])]; };
  const prow = (st, p, id, o) => { try { return kit().scoped.row(id, pval(p, id), Object.assign({ scope: 'persona', data: { id: p.id }, noChanged: true }, TUNE[id] ? { control: tuneCtl(p, id) } : id === PS.budget ? { control: capCtl(p) } : id === PS.guidance ? { control: notesCtl(p) } : [PS.prefer, PS.avoid, PS.skills, PS.plugins].includes(id) ? { choices: picks(st, p, id) } : {}, o || {})); } catch (e) { return ''; } };
  const pfact = (p, id, label) => { const s = kit().setting(id); if (!s) return null; const v = pval(p, id); let text = ''; try { text = TUNE[id] ? tuneText(id, v) : id === PS.budget && !capOn(v) ? 'No cap' : id === PS.pid ? p.id : kit().valueText(s, v); } catch (e) { text = String(v == null ? '' : v); } return [label || kit().rowLabel(s), text]; };
  const personaOf = (ctx) => personas(ctx.st).find((p) => p.id === (ctx.params || {}).id) || null;
  const findPersona = (st, id) => personas(st).find((p) => p.id === id) || null;
  const OWN_MODEL = [PS.platform, PS.model, PS.variant, PS.effort];
  const hasOwnModel = (p) => OWN_MODEL.some((id) => { const v = pval(p, id); return v != null && v !== '' && v !== 'inherit'; });
  SMX.act('persona-model-own', (el) => { SMX.local.flags['pmodel:' + el.getAttribute('data-id')] = true; });
  SMX.act('persona-model-clear', (el) => { const id = el.getAttribute('data-id'); write((st) => { const p = findPersona(st, id); if (p && p.props) for (const k of OWN_MODEL) delete p.props[k]; }); SMX.local.flags['pmodel:' + id] = false; SMX.toast('Saved', 'It follows the everyday model again.'); });
  SMX.act('persona-add-to-crew', (el) => {
    const st = eng().getState(); const p = findPersona(st, el.getAttribute('data-id')); if (!p) return;
    const options = crews(st).filter((c) => !(c.members || []).includes(p.name));
    if (!options.length) { SMX.toast('Already in every crew', `${p.name} is a member of every crew.`, 'info'); return; }
    kit().panel({ title: 'Add to a crew', subtitle: p.name, body: kit().panelSection('Crew', kit().field('Add to', kit().select(options[0].id, options.map((c) => [c.id, `${c.name} · ${count((c.members || []).length, 'member')}`]), { label: 'Crew' }))),
      primaryLabel: 'Add', onPrimary: (wrap) => { const sel = wrap.querySelector('select'); const cid = sel ? sel.value : ''; let joined = ''; write((s2) => { const c = crews(s2).find((x) => x.id === cid), q = findPersona(s2, p.id); if (!c || !q) return; c.members = [...(c.members || []), q.name]; q.crews = [...new Set([...(q.crews || []), c.name])]; joined = c.name; }); if (joined) SMX.toast('Added to crew', `${p.name} joined ${joined}.`); } });
  });
  SMX.act('persona-hide', (el) => {
    const st = eng().getState(); const p = findPersona(st, el.getAttribute('data-id')); if (!p) return;
    const cur = hiddenIds(); const next = cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id];
    try { eng().setSettingFromHost(PS.hidden, next, false); } catch (e) { return; }
    SMX.toast(next.includes(p.id) ? 'Hidden from pickers' : 'Back in pickers', next.includes(p.id) ? `${p.name} no longer shows when you pick a persona. It is listed under “Hidden from pickers”.` : `${p.name} shows when you pick a persona again.`);
  });
  SMX.act('persona-export', (el) => {
    const st = eng().getState(); const p = findPersona(st, el.getAttribute('data-id')); if (!p) return;
    kit().panel({ title: 'Export persona', subtitle: p.name, body: kit().panelSection('What is included', kit().kv([['Name', p.name], ['Tools', (pval(p, PS.prefer) || []).join(' · ') || 'None'], ['Instructions', `${String(p.prompt || '').length} characters`], ['Format', 'PERSONA.md · no secrets']])) + kit().note('Saving a file needs the desktop app. Nothing is written in this preview.'), primaryLabel: 'Save file', onPrimary: () => SMX.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info') });
  });
  SMX.act('persona-delete', (el) => {
    const st = eng().getState(); const p = findPersona(st, el.getAttribute('data-id')); if (!p || p.locked || p.group === 'Bundled') return;
    kit().confirm(`Delete “${p.name}”?`, 'It is removed from every crew. Goals already using it keep their copy.', 'Delete', () => {
      write((s2) => { s2.personas = personas(s2).filter((x) => x.id !== p.id); for (const c of crews(s2)) { c.members = (c.members || []).filter((m) => m !== p.name); if (c.lead === p.name) c.lead = c.members[0] || ''; } });
      SMX.toast('Persona deleted', p.name, 'warning'); SMX.go('memory/personas', { replace: true });
    }, true);
  });
  const personaSig = (st, p) => JSON.stringify([p.id, p.locked, p.group, p.name, p.description, p.prompt, p.crews, isHidden(p), !!SMX.local.flags['pmodel:' + p.id], Object.entries(p.props || {}).map(([k, v]) => [k, TUNE[k] ? Number.isFinite(tuneNum(v)) : k === PS.budget ? capOn(v) : Array.isArray(v) && k !== PS.aliases ? 'list' : v]), crews(st).map((c) => c.name), (st.goalTemplates || []).map((t) => t.persona), goalDefaults(st).persona, val(PS.chatDefault), val('ai.models.default-model')]);
  SMX.page({
    id: 'memory/personas/:id', chapter: 'memory', parent: 'memory/personas',
    title: (ctx) => { const p = personaOf(ctx); return p ? p.name : 'Persona'; },
    nav: (ctx) => { const p = personaOf(ctx); return p ? p.name : 'Persona'; },
    purpose: (ctx) => { const p = personaOf(ctx); return p ? p.description || '' : ''; },
    legacy: [['memory', 'personas', 'personas', 'personas']],
    headSide: (ctx) => { const p = personaOf(ctx); if (!p) return ''; return p.locked ? ui.btn({ label: 'Duplicate to edit', icon: 'copy', primary: true, small: false, action: 'pm51-personas-duplicate', data: { id: p.id } }) : ui.btn({ label: 'Try it', icon: 'play', small: false, action: 'pm51-personas-try-open', data: { id: p.id } }); },
    lead: (ctx) => {
      const st = ctx.st; const p = personaOf(ctx);
      follow(st, 'personas', (id) => (personas(st).some((x) => x.id === id) ? personaRoute(id) : ''));
      if (!p) return [{ key: 'gone', html: ui.card({ title: 'This persona is no longer there', body: ui.btn({ label: 'Back to Personas', go: 'memory/personas' }) }) }];
      const locked = !!p.locked, bundled = p.group === 'Bundled'; const dp = defaultPersona(st); const sig = personaSig(st, p);
      const inCrews = crews(st).filter((c) => (c.members || []).includes(p.name)); const tpls = (st.goalTemplates || []).filter((t) => t.persona === p.name);
      const used = [dp && dp.id === p.id ? 'answers your chats by default' : '', inCrews.length ? `is in ${and(inCrews.map((c) => c.name))}` : '', goalDefaults(st).persona === p.name ? 'is who a new Goal starts with' : '', tpls.length ? `does the work in ${and(tpls.map((t) => `the template “${t.name}”`))}` : ''].filter(Boolean);
      const about = locked ? facts([pfact(p, PS.name), pfact(p, PS.desc), pfact(p, PS.aliases), pfact(p, PS.tags), pfact(p, PS.pid)])
        : ui.rows([
          { label: 'Name', help: 'Shown in pickers and in chat. Crews, templates and Goals that use it follow a new name.', value: p.name, control: ui.btn({ label: 'Change', icon: 'edit', action: 'pm51-personas-about', data: { id: p.id } }) },
          { label: 'What it is for', help: 'One line. It also helps Puppet Master pick the right persona.', value: p.description || 'Not set', control: ui.btn({ label: 'Change', icon: 'edit', action: 'pm51-personas-about', data: { id: p.id } }) },
          { label: 'Other names it answers to', help: 'So “ask the prof” reaches your teacher persona.', value: (pval(p, PS.aliases) || []).join(', ') || 'None', control: ui.btn({ label: 'Change', icon: 'edit', action: 'pm51-personas-aliases', data: { id: p.id } }) }
        ]) + srows([prow(st, p, PS.tags)]);
      const answers = locked ? facts([PS.style, PS.format, PS.mode, PS.verbosity, PS.talk].map((id) => pfact(p, id))) : srows([PS.style, PS.format, PS.mode, PS.verbosity, PS.talk].map((id) => prow(st, p, id)));
      const own = hasOwnModel(p) || !!SMX.local.flags['pmodel:' + p.id];
      const model = locked ? facts([['Model', hasOwnModel(p) ? [PS.model, PS.variant].map((id) => (pfact(p, id) || [])[1]).filter(Boolean).join(' · ') : `Follows the everyday model, ${everydayModel()}`], pfact(p, PS.effort), pfact(p, PS.budget)])
        : (own ? ui.rows([{ label: `${p.name} has its own model`, help: `It no longer follows the everyday model, ${everydayModel()}, for the choices below.`, control: ui.btn({ label: 'Use the everyday model again', icon: 'refresh', do: 'persona-model-clear', data: { id: p.id } }) + ui.btn({ label: 'The everyday model', go: 'ai/models', ghost: true }) }]) + srows(OWN_MODEL.map((id) => prow(st, p, id)))
          : ui.rows([{ label: 'Model', help: `Follows the everyday model, ${everydayModel()}.`, control: ui.btn({ label: `Give ${p.name} its own`, do: 'persona-model-own', data: { id: p.id } }) + ui.btn({ label: 'The everyday model', go: 'ai/models', ghost: true }) }]))
          + srows([prow(st, p, PS.budget, { label: 'Most it may spend on one piece of work', help: 'A model that would cost more is skipped, with a note.' })]);
      const perms = locked ? facts([pfact(p, PS.perms), pfact(p, PS.posture), pfact(p, PS.prefer)]) : srows([prow(st, p, PS.perms, { help: 'Same as the project follows what you chose under Safety & permissions.' }), prow(st, p, PS.posture), prow(st, p, PS.prefer)]);
      const moreBody = [
        ui.card({ title: 'Fine-tuning its answers', help: 'Rarely needed. Each follows the project until you give this persona its own.', body: locked ? facts([pfact(p, PS.temp), pfact(p, PS.topp)]) : srows([prow(st, p, PS.temp), prow(st, p, PS.topp)]) }),
        ui.card({ title: 'More about its tools', body: locked ? facts([pfact(p, PS.avoid), pfact(p, PS.skills), pfact(p, PS.plugins), pfact(p, PS.guidance)]) : srows([prow(st, p, PS.avoid), prow(st, p, PS.skills), prow(st, p, PS.plugins), prow(st, p, PS.guidance)]) }),
        ui.card({ title: 'Try it and compare', help: 'See how it would approach a question. This preview cannot run a model.', body: `<div class="pm51-personas-try">${kit().input('', { action: 'pm51-noop', placeholder: 'Ask something this persona would handle', label: 'Question', cls: 'pm51-personas-question' })}${ui.btn({ label: 'Try', icon: 'play', action: 'pm51-personas-try', data: { id: p.id } })}</div>` + (personas(st).length > 1 ? `<div class="pm51-personas-try smx-pad">${kit().select(personas(st).filter((o) => o.id !== p.id)[0].id, personas(st).filter((o) => o.id !== p.id).map((o) => [o.id, o.name]), { action: 'pm51-noop', label: 'Compare with', cls: 'pm51-personas-compare-pick' })}${ui.btn({ label: 'Compare', icon: 'eye', action: 'pm51-personas-compare', data: { id: p.id } })}</div>` : '') })
      ].join('');
      return [
        { key: 'summary', html: ui.summary({ icon: locked ? 'lock' : 'user', tone: 'ready', lines: [
          locked ? `${ui.b(p.name)} is built into Puppet Master, so it is locked. Duplicate it to make a version you can change.` : bundled ? `${ui.b(p.name)} came with Puppet Master. What you change here stays in this project.` : `${ui.b(p.name)} is a persona you made.`,
          `${used.length ? `It ${h(and(used))}.` : 'Nothing uses it by default: pick it in a chat, or ask for it by name.'}${p.chat === false ? ' It works as a helper only and does not answer chats.' : ''}${isHidden(p) ? ' It is hidden from pickers.' : ''}`
        ] }) },
        { key: 'used', html: ui.card({ title: 'Where it is used', body: ui.rows([
          p.chat === false ? { label: 'Chats', value: 'Helper only: it does not answer chats', muted: true } : { label: 'Chats', help: 'Any chat can pick it, or you can ask for it by name.', value: dp && dp.id === p.id ? 'Answers by default' : 'When picked', control: ui.btn({ label: 'Who answers by default', go: 'memory/personas', reveal: PS.chatDefault, ghost: true }) },
          { label: 'Crews', help: 'Teams this persona is a member of.', value: inCrews.length ? '' : 'Not in a crew', muted: !inCrews.length, control: inCrews.map((c) => ui.btn({ label: c.name, go: crewRoute(c.id) })).join('') + ui.btn({ label: 'Add to a crew…', icon: 'plus', do: 'persona-add-to-crew', data: { id: p.id } }) },
          { label: 'Goals', help: 'Templates that name it, and what a new Goal starts with.', value: tpls.length || goalDefaults(st).persona === p.name ? [goalDefaults(st).persona === p.name ? 'New Goals start with it' : '', ...tpls.map((t) => t.name)].filter(Boolean).join(' · ') : 'Not named by a template', muted: !(tpls.length || goalDefaults(st).persona === p.name), control: ui.btn({ label: 'Goals', go: 'planning/goals', ghost: true }) }
        ]) }) },
        { key: 'about', fixed: true, sig, html: ui.card({ title: 'About', help: 'Its name, what it is for, and other names it answers to.', body: about }) },
        { key: 'instructions', html: ui.card({ title: 'Its instructions', help: 'What this persona reads before every task. Plain sentences are fine.', side: locked ? '' : ui.btn({ label: String(p.prompt || '').trim() ? 'Edit instructions' : 'Write instructions', icon: 'edit', action: 'pm51-personas-prompt', data: { id: p.id } }), body: `<p class="pm51-personas-prompt">${h(String(p.prompt || '').trim() || 'None yet.')}</p>` }) },
        { key: 'answers', fixed: true, sig, html: ui.card({ title: 'How it answers', help: 'The style, shape and length of its replies.', body: answers }) },
        { key: 'model', fixed: true, sig, html: ui.card({ title: 'Model and cost', help: 'One everyday model answers for every persona. Give this persona its own only when it needs something special.', body: model + `<p class="smx-quiet-line smx-pad">Limits for a whole run are under ${ui.link({ label: 'Limits for one run', go: 'safety/limits' })}; the monthly limit is under ${ui.link({ label: 'Spending & warnings', go: 'ai/spending' })}.</p>` }) },
        { key: 'tools', fixed: true, sig, html: ui.card({ title: 'What it may do, and its tools', help: 'A persona can be more careful than the project, or favour some tools.', side: ui.btn({ label: 'When it asks you', go: 'safety/asking', ghost: true }), body: perms }) },
        { key: 'more', fixed: true, sig, html: fold('persona:more', 'More about this persona', 'Fine-tuning, more tool choices, and trying it out', moreBody) },
        { key: 'actions', html: `<div class="smx-btn-row">${locked ? '' : ui.btn({ label: 'Duplicate', icon: 'copy', action: 'pm51-personas-duplicate', data: { id: p.id } })}${bundled ? ui.btn({ label: isHidden(p) ? 'Show in pickers' : 'Hide from pickers', icon: 'eye', do: 'persona-hide', data: { id: p.id } }) : ''}${ui.btn({ label: 'Export…', icon: 'download', do: 'persona-export', data: { id: p.id } })}${ui.btn({ label: 'Delete this persona…', icon: 'trash', danger: true, do: 'persona-delete', data: { id: p.id }, disabled: locked || bundled, reason: locked ? 'Built-in personas cannot be deleted.' : 'This one came with Puppet Master. Hide it from pickers instead.' })}</div>` }
      ];
    },
    expert: [{ key: 'tech', when: (ctx) => !!personaOf(ctx), html: (ctx) => { const p = personaOf(ctx); if (!p) return ''; return ui.card({ title: 'Technical details', body: facts([['Short id', p.id], ['Kind', p.locked ? 'Core, locked' : p.group === 'Bundled' ? 'Bundled' : 'Custom'], ['Model route', p.route || '—'], ['Tone', p.tone || '—'], ['May answer chats', p.chat === false ? 'No' : 'Yes'], ['May be a helper', p.helper === false ? 'No' : 'Yes']]) }); }, count: 0 }],
    changes: [
      { was: 'A persona’s 25 fields fill a pane beside the list of 21: About, How it answers, Model and cost, Tools and instructions, then “More options”.', now: 'A persona has a page. It opens with what it is and where it is used (chats, crews, Goals), then the same fields in the same four groups; the rarely used ones and “Try it” are folded at the end.' },
      { was: 'Duplicate, Add to crew, Hide from pickers, Export and Delete are behind “More actions”. For a built-in persona Delete is greyed out there with the two words “Built in”.', now: 'All five are ordinary buttons: “Add to a crew” on the Crews row of “Where it is used”, the others at the foot of the page, Delete last. Delete says why it is unavailable for a built-in or bundled persona.' },
      { was: 'Six of the seven rows of “Model and cost” read “Same as the project” for every persona: the everyday model, its edition and its thinking effort, repeated once per persona.', now: 'One line says the persona follows the everyday model and names it. The four model rows appear only when you give this persona its own, and one button puts it back. Spending links to the two pages that own limits.' },
      { was: '“What it may do without asking” is a per-persona row with no word about where the project’s own answer is set.', now: 'The row says it follows Safety & permissions and the card links to “When it asks you”.' }
    ]
  });

  /* ================================================================== Crews & group work */
  const crewOf = (ctx) => crews(ctx.st).find((c) => c.id === (ctx.params || {}).id) || null;
  const findCrew = (st, id) => crews(st).find((c) => c.id === id) || null;
  const lineup = (id, sizeId) => { const v = val(id); return Array.isArray(v) && v.length ? v.join(', ') : `Puppet Master picks ${Number(val(sizeId)) || 4}`; };
  SMX.extend('memory/crews', {
    purpose: 'A crew is a team of personas that works on one Goal together, with a lead. A group session lets several personas talk one question through.',
    blurb: (ctx) => `${count(crews(ctx.st).length, 'crew')} · BrainStorm, Chat Room and Review`,
    status: () => (crewsOn() ? { text: 'On', tone: 'ready' } : { text: 'Off', tone: 'off' }),
    lead: (ctx) => {
      const st = ctx.st; const list = crews(st); const onNow = crewsOn(); const def = goalDefaults(st).crew || '';
      follow(st, 'personas-crews', (id) => (list.some((c) => c.id === id) ? crewRoute(id) : ''));
      const reviewers = String(val('planning.verification.review-strategy') || '') === 'Multi-pass' ? count(Number(val('planning.verification.review-reviewer-count')) || 3, 'reviewer') : 'One reviewer';
      const session = (icon, name, text, who, go, reveal) => `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(go)}" data-smx-reveal="${h(reveal)}"><span class="smx-thing-avatar">${SMX.icon(icon)}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(name)}</span><span class="smx-thing-sub">${h(text)}</span><span class="smx-thing-sub">${h(who)}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`;
      return [
        { key: 'summary', html: ui.summary({ icon: 'people', tone: onNow ? 'ready' : 'off', lines: [
          onNow ? `Crews are ${ui.b('on')}. You have ${ui.b(count(list.length, 'crew'))}${def ? `; ${ui.word(def, { go: 'planning/goals' })} is the one a new Goal starts with` : ''}.` : `Crews are ${ui.b('turned off')}. You can set them up, but nothing uses a crew until you turn them on.`,
          'Several personas on one Goal use noticeably more credits than one. Group sessions (BrainStorm, Chat Room, Review) work whether crews are on or off.'
        ], side: switchLine('Use crews', ui.toggle(PS.crews, { label: 'Use crews' })) }) },
        { key: 'crews', html: ui.things({ title: 'Your crews', help: 'Open a crew to see its members and how they work together.', add: { label: 'New crew', action: 'pm51-personas-crew-new' },
          items: list.map((c) => ({ icon: 'people', name: c.name, tag: def && def === c.name ? 'New Goals start with it' : '', sub: `${count((c.members || []).length, 'member')} · ${c.lead ? `led by ${c.lead}` : 'no lead'}`, sub2: (c.members || []).join(', '), status: onNow ? { text: 'Ready', tone: 'ready' } : { text: 'Not in use', tone: 'off' }, go: crewRoute(c.id) })),
          empty: { icon: 'people', title: 'No crews yet', text: 'A crew is a team of personas that work together. The steps ask for a name, the members and a lead.', fix: { label: 'New crew', action: 'pm51-personas-crew-new' } } }) },
        { key: 'sessions', html: ui.card({ cls: 'smx-things-card', title: 'Group sessions', help: 'Three ways for several personas to work on one question. You start one in a chat; these are what each starts with.', body: `<div class="smx-things">${session('sparkle', 'BrainStorm', 'Each persona proposes an idea, then they debate and vote. A Deep Plan can use it.', `Takes part: ${lineup('branching.crew.brainstorm-roster', 'branching.crew.brainstorm-core-participants')}`, 'memory/crews', 'branching.crew.brainstorm-roster')}${session('chat', 'Chat Room', 'Several personas talk a question through with you, in rounds.', `Takes part: ${lineup('branching.crew.chat-room-roster', 'branching.crew.chat-room-participant-count')}`, 'memory/crews', 'branching.crew.chat-room-roster')}${session('check', 'Review', 'Independent reviewers read finished work and report. Set with the other checks.', `${reviewers} · Planning & goals › Checking the work`, 'planning/proof', 'planning.verification.review-strategy')}</div>` }) },
        { key: 'off', html: onNow ? '' : `<p class="smx-quiet-line">Turn crews on to choose what a new crew starts with, and whether the assistant may offer a crew for a big request.</p>` }
      ];
    },
    sections: [
      { key: 'defaults', title: 'New crews start with', help: 'Copied into each new crew. Change a crew on its own page.', when: () => crewsOn(), ids: ['branching.crew.crew-members', 'branching.crew.crew-participant-count', 'branching.crew.crew-coordinator', 'branching.crew.crew-assignment-strategy', 'branching.crew.crew-parallelism'] },
      { key: 'auto', title: 'Offering a crew for a big request', help: 'The assistant only suggests. Nothing starts until you agree.', when: () => crewsOn(), ids: ['branching.crew.crew-auto-enabled', 'branching.crew.crew-auto-complexity', 'branching.crew.crew-auto-max-members', 'branching.crew.crew-auto-roster'] }
    ],
    more: [
      { key: 'brainstorm', title: 'BrainStorm: who takes part', help: 'An empty lineup lets Puppet Master pick that many personas.', ids: ['branching.crew.brainstorm-roster', 'branching.crew.brainstorm-core-participants', 'branching.crew.brainstorm-external-research'] },
      S('personas-brainstorm-debate', { title: 'BrainStorm: debate and vote', help: 'How ideas are compared and decided.', ids: ['branching.crew.brainstorm-independent-proposals', 'branching.crew.brainstorm-debate-rounds', 'branching.crew.brainstorm-voting', 'branching.crew.brainstorm-preserve-dissent'] }),
      { key: 'chatroom', title: 'Chat Room', help: 'Several personas talking it through with you.', ids: ['branching.crew.chat-room-roster', 'branching.crew.chat-room-participant-count', 'branching.crew.chat-room-turn-policy', 'branching.crew.chat-room-max-rounds', 'branching.crew.chat-room-pause-between-rounds'] }
    ],
    moreLabel: 'BrainStorm and Chat Room', moreHelp: 'Who takes part, and how each session runs',
    expert: [{ key: 'caps', title: 'Hard limits for crews', help: 'The Server may allow fewer.', ids: ['branching.crew.max-crews-per-platform', 'branching.crew.max-agents-per-crew'] }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How personas and crews work', action: 'pm51-personas-help' }, { label: 'How many questions a BrainStorm may ask', go: 'planning', reveal: 'branching.crew.brainstorm-question-limit' }]) }],
    covers: { [PS.crews]: 'The switch “Use crews” at the top of this page.' },
    changes: [
      { was: 'Crews and Group work are two tabs of Personas & Crews. With crews off (the default), the Crews tab lists 4 crews as if they were in use, beside the note “Crews are off. You can still set them up; nothing uses them until you turn this on.”', now: 'One page. The first sentence and a switch say whether crews are used; each crew shows “Not in use” while they are off; the two groups of defaults appear only when crews are on.' },
      { was: 'A crew’s actions (Add member, Duplicate, Delete) are items of a “More actions” menu; “Edit” is the only visible button.', now: 'A crew has its own page with Edit, Add a member, Duplicate and Delete as ordinary buttons, Delete last.' },
      { was: 'Group work is 21 rows under four headings; nothing says what BrainStorm, Chat Room and Review are apart from one sentence above them.', now: 'The three are a short list that says what each is and who takes part now. Their 12 fine-tuning rows are folded; Review’s 7 rows moved to Planning & goals › Checking the work, beside the other checks of finished work.' },
      { was: '“Pause between rounds” (a Chat Room setting) is drawn under “BrainStorm: who takes part”. “Questions it may ask you” and “Extra questions in Grill Me” are here while the five other question limits are on Planning.', now: '“Pause between rounds” is under Chat Room. Every question limit is in one place, on Planning & goals › Plans.' }
    ]
  });

  /* ---- one crew -------------------------------------------------------------------------------------------------- */
  SMX.act('crew-add-member', (el) => {
    const st = eng().getState(); const c = findCrew(st, el.getAttribute('data-id')); if (!c) return;
    const options = personas(st).filter((p) => !(c.members || []).includes(p.name));
    if (!options.length) { SMX.toast('Everyone is already in', `${c.name} already includes every persona.`, 'info'); return; }
    kit().panel({ title: 'Add a member', subtitle: c.name, body: kit().panelSection('Persona', kit().field('Add', kit().select(options[0].id, options.map((p) => [p.id, p.name]), { label: 'Persona' }))),
      primaryLabel: 'Add', onPrimary: (wrap) => { const sel = wrap.querySelector('select'); const pid = sel ? sel.value : ''; let who = ''; write((s2) => { const c2 = findCrew(s2, c.id), p = findPersona(s2, pid); if (!c2 || !p) return; c2.members = [...(c2.members || []), p.name]; p.crews = [...new Set([...(p.crews || []), c2.name])]; who = p.name; }); if (who) SMX.toast('Member added', `${who} joined ${c.name}.`); } });
  });
  SMX.act('crew-duplicate', (el) => {
    const id = el.getAttribute('data-id'); const nid = newId('crew'); let name = '';
    write((st) => { const c = findCrew(st, id); if (!c) return; const copy = JSON.parse(JSON.stringify(c)); copy.id = nid; copy.name = `${c.name} copy`; name = copy.name; st.crews.push(copy); for (const p of personas(st)) if ((copy.members || []).includes(p.name)) p.crews = [...new Set([...(p.crews || []), copy.name])]; });
    if (name) { SMX.toast('Crew duplicated', name); SMX.go(crewRoute(nid)); }
  });
  SMX.act('crew-delete', (el) => {
    const st = eng().getState(); const c = findCrew(st, el.getAttribute('data-id')); if (!c) return;
    kit().confirm(`Delete “${c.name}”?`, 'The personas in it are kept.', 'Delete', () => {
      write((s2) => { s2.crews = crews(s2).filter((x) => x.id !== c.id); for (const p of personas(s2)) p.crews = (p.crews || []).filter((n) => n !== c.name); });
      SMX.toast('Crew deleted', c.name, 'warning'); SMX.go('memory/crews', { replace: true });
    }, true);
  });
  SMX.page({
    id: 'memory/crews/:id', chapter: 'memory', parent: 'memory/crews',
    title: (ctx) => { const c = crewOf(ctx); return c ? c.name : 'Crew'; },
    nav: (ctx) => { const c = crewOf(ctx); return c ? c.name : 'Crew'; },
    purpose: (ctx) => { const c = crewOf(ctx); return c ? `A crew of ${count((c.members || []).length, 'persona')}${c.lead ? `, led by ${c.lead}` : ''}. A crew works on one Goal together.` : ''; },
    legacy: [['memory', 'personas', 'crews', 'personas']],
    headSide: (ctx) => { const c = crewOf(ctx); return c ? ui.btn({ label: 'Edit', icon: 'edit', primary: true, small: false, action: 'pm51-personas-crew-edit', data: { id: c.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st; const c = crewOf(ctx);
      follow(st, 'personas-crews', (id) => (crews(st).some((x) => x.id === id) ? crewRoute(id) : ''));
      if (!c) return [{ key: 'gone', html: ui.card({ title: 'This crew is no longer there', body: ui.btn({ label: 'Back to Crews', go: 'memory/crews' }) }) }];
      const onNow = crewsOn(); const isDefault = (goalDefaults(st).crew || '') === c.name; const members = c.members || [];
      return [
        { key: 'summary', html: ui.summary({ icon: 'people', tone: onNow ? 'ready' : 'off', lines: [
          `${ui.b(c.name)} has ${ui.b(count(members.length, 'member'))}${c.lead ? ` and is led by ${ui.b(c.lead)}` : '; nobody leads, so each member works alone'}.${isDefault ? ' A new Goal starts with this crew.' : ''}`,
          onNow ? '' : `Crews are turned off, so nothing uses it yet. ${ui.word('Turn crews on', { go: 'memory/crews' })} on the Crews page.`
        ] }) },
        { key: 'members', html: ui.things({ title: 'Members', help: 'Open a member to see or change that persona.', add: { label: 'Add a member', do: 'crew-add-member', data: { id: c.id } },
          items: members.map((name) => { const p = personas(st).find((x) => x.name === name); return { initials: initials(name), name, tag: c.lead === name ? 'Lead' : '', sub: p ? p.description : 'This persona no longer exists', go: p ? personaRoute(p.id) : '' }; }),
          empty: { icon: 'people', title: 'No members yet', text: 'A crew needs at least two.', fix: { label: 'Add a member', do: 'crew-add-member', data: { id: c.id } } } }) },
        { key: 'how', html: ui.card({ title: 'How they work together', help: 'Edit, at the top of the page, walks through the name, the members, the lead and these choices.', body: ui.rows([
          { label: 'Lead', help: 'Hands out the work and reports back.', value: c.lead || 'Nobody; each works alone' },
          { label: 'What members hand on', help: 'What each member passes to the next.', value: handoffLabel(c.handoff) },
          { label: 'Members working at once', help: 'How many may be busy at the same time.', value: `Up to ${c.concurrency}` },
          { label: 'Model', help: c.route === 'Per persona' ? `Each member uses its own; unless a persona has its own, that is the everyday model, ${everydayModel()}.` : 'This crew names its own, in place of each member’s.', value: c.route === 'Per persona' ? 'Each member’s own' : c.route, control: ui.btn({ label: 'Which model does what', go: 'ai/models', ghost: true }) }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Duplicate', icon: 'copy', do: 'crew-duplicate', data: { id: c.id } })}${ui.btn({ label: 'Delete this crew…', icon: 'trash', danger: true, do: 'crew-delete', data: { id: c.id } })}</div>` }
      ];
    },
    more: [{ key: 'handoffs', when: (ctx) => !!crewOf(ctx), html: () => ui.card({ title: 'How handoffs work', body: facts([['Task summary', 'What was asked, what was done, what was checked, and what is left'], ['Passed on', 'Only what the next member needs'], ['Disagreements', 'The lead decides and records why'], ['A handoff that fails', 'Goes back to the lead instead of stalling']]) }), count: 0 }],
    moreLabel: 'How handoffs work', moreHelp: 'What passes from one member to the next',
    changes: [
      { was: 'A crew is five read-only rows in a pane beside the list (Lead, Members as chips, Model route “Per persona”, What members hand on, Members working at once). “Edit” is a button; Add member, Duplicate and Delete are in “More actions”.', now: 'A page: who is in it, as rows that open each persona; how they work together; and Add a member, Duplicate and Delete as buttons.' },
      { was: '“Model route — Per persona” is shown with no explanation.', now: 'The row reads “Model: each member’s own”, says that this is the everyday model unless a persona has its own, and links to “Which model does what”.' }
    ]
  });

  /* ================================================================== Helper agents */
  SMX.extend('memory/helpers', {
    purpose: 'A helper is a short-lived extra worker. A persona hands it one small job, like finding files or running tests; it reports back and stops.',
    blurb: () => (helpersOn() ? `A big job is split when it has ${Number(val('branching.subagents.fanout-threshold')) || 3} parts or more` : 'One agent does everything'),
    status: () => (helpersOn() ? { text: 'On', tone: 'ready' } : { text: 'Off', tone: 'off' }),
    lead: (ctx) => {
      const st = ctx.st; const onNow = helpersOn(); const side = on(val('branching.subagents.parallel-subagents')); const max = Number(val('branching.subagents.max-parallel')) || 4; const parts = Number(val('branching.subagents.fanout-threshold')) || 3;
      const never = personas(st).filter((p) => p.helper === false).map((p) => p.name), only = personas(st).filter((p) => p.chat === false).map((p) => p.name);
      return [
        { key: 'summary', html: ui.summary({ icon: 'users', tone: onNow ? 'ready' : 'off', lines: [
          onNow ? `Helpers are ${ui.b('on')}. A job is split when it has ${ui.b(`${parts} parts or more`)}; helpers ${side ? `work side by side, up to ${ui.b(String(max))} at once` : ui.b('take turns')}.` : `Helpers are ${ui.b('off')}: one agent does everything, one step after another.`,
          `A helper starts from a clean slate and reports back when its job is done.${never.length ? ` ${h(and(never))} ${never.length === 1 ? 'is' : 'are'} never handed a job` : ''}${only.length ? `; ${h(and(only))} work only as helpers` : ''}.`
        ], side: switchLine('Use helper agents', ui.toggle(PS.helpers, { label: 'Use helper agents' })) }) },
        { key: 'elsewhere', html: elsewhere('Decided on other pages', 'Each of these has one home. It is listed here so you can see what applies to helpers.', [
          ['The model helpers use', word('ai.models.subagent-model'), 'ai/models', 'ai.models.subagent-model'],
          ['How hard helpers think', word('ai.models.subagent-effort'), 'ai/models', 'ai.models.subagent-effort'],
          ['Whether helpers can read your memories', on(val(M.helpers)) ? 'They can' : 'They cannot', 'memory', M.helpers],
          ['What may be done without asking you', SMX.has('safety.approvals.autonomy-mode') ? word('safety.approvals.autonomy-mode') : 'One choice for everything', 'safety/asking', SMX.has('safety.approvals.autonomy-mode') ? 'safety.approvals.autonomy-mode' : ''],
          ['How far and how long one run may go', 'Limits for one run', 'safety/limits', '']
        ]) }
      ];
    },
    sections: [
      { key: 'share', title: 'How work is shared', help: 'When a job is split, and whether helpers work at the same time.', when: () => helpersOn(), ids: ['branching.subagents.fanout-threshold', 'branching.subagents.parallel-subagents', 'branching.subagents.max-parallel', 'general.interaction.subagent-disclosure'] },
      { key: 'safe', title: 'Keeping helpers safe', help: 'Two helpers never change the same files at once, and one helper’s mistakes stay its own.', when: () => helpersOn(), ids: ['branching.subagents.single-writer-lease', 'branching.subagents.child-state-isolation'] }
    ],
    more: [
      { key: 'which', title: 'Which personas help', help: 'Always include some, never use others, or choose for each kind of step.', when: () => helpersOn(), ids: ['branching.subagents.required-subagents', 'branching.subagents.disabled-subagents', 'branching.subagents.per-node-overrides', 'code.editing.lsp-subagent-bias'] },
      { key: 'fine', title: 'When a helper fails, and how far helping goes', when: () => helpersOn(), ids: ['branching.subagents.retry-policy', 'branching.subagents.subagents-mandatory', 'branching.subagents.write-isolation-mode', 'branching.subagents.delegation-depth', 'branching.subagents.external-agent-provenance'] }
    ],
    moreLabel: 'Which personas help, and fine points', moreHelp: 'Who is included, retries, and helpers of helpers',
    expert: [
      { key: 'caps', title: 'Hard limits for all agents', help: 'Emergency brakes. The Server may allow fewer.', ids: ['branching.subagents.input-token-limit', 'branching.subagents.provider-concurrency-cap', 'branching.subagents.max-total-active-agents', 'branching.subagents.max-nesting-depth', 'branching.subagents.max-total-spawned'] },
      S('personas-helper-tools', { title: 'What a helper is given', help: 'The rules and the job description a helper receives before it starts.' })
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How personas, crews and helpers work', action: 'pm51-personas-help' }]) }],
    covers: { [PS.helpers]: 'The switch “Use helper agents” at the top of this page.' },
    changes: [
      { was: 'Helpers is the fourth tab of Personas & Crews: 23 rows, 14 of them before “More options”, opening on the switch “Use helper agents” inside a card.', now: 'Two sentences say whether helpers are used and how a job is split; the switch is beside them. Six rows follow in two groups (sharing the work, keeping helpers safe); the rest is folded.' },
      { was: 'The seven number boxes of “Limits for all agents” and the two “Helper contracts” buttons are one click away from the everyday rows; two of the seven are limits for crews.', now: 'Five agent limits and the two buttons are under For experts. The two crew limits moved to Crews & group work.' },
      { was: 'What applies to a helper is spread over four managers with no pointer: its model (AI Providers › Models), reading memories (Context & Memory › Keeping & privacy), asking first (Permissions) and limits (Permissions › Limits).', now: 'A short list, “Decided on other pages”, says what each is set to (the model, its thinking effort, memories, asking first, limits) and opens it.' }
    ]
  });

  /* search: memories, personas and crews, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st0) => {
    const { st, list } = memState(st0);
    return [
      ...list.map((x) => ({ title: x.title, sub: 'Memory & helpers › a memory', route: memRoute(x.id) })),
      ...personas(st).map((p) => ({ title: p.name, sub: 'Memory & helpers › Personas', route: personaRoute(p.id) })),
      ...crews(st).map((c) => ({ title: c.name, sub: 'Memory & helpers › Crews & group work', route: crewRoute(c.id) }))
    ];
  });
})(window);
