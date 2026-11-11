/* Settings managers, rethought (Fable 5.2): the chapter "Safety & permissions".
   Today this is Safety › Permissions & Safety: five tabs (Profiles, Rules, Protected Files, Approvals, Limits) that all
   answer one question, "may it act without asking?", in five vocabularies. Here the chapter opens on the answer:
   - one sentence that says what the assistant may do right now, built from the profile in use and the start modes;
   - the profiles as the one plain choice, and a short list of what that means for the things people worry about, each
     line driven by the real settings and opening the place that changes it;
   - a profile has its own page and a rule has its own page, so one screen is about one thing;
   - rules are shown as what they are: exceptions to the profile, with the order they are checked in said once.
   Every setting row is PMConcept7's own row, and every guided step (new profile, add a rule, protect a folder, approve a
   request, the checks) is PMConcept7's own action. The Permissions manager exports no readers, so the three small
   tables it keeps to itself (the built-in profiles' answers, their preset names and their example rules) are repeated
   here. Lists are read in both shapes the manager leaves them in (before and after it has been opened once), and the
   first time a page of this chapter is shown they are put in the later shape, as the manager's own first draw does, so
   that PMConcept7's actions and these pages always count the same rules. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec, D = SMX.drawn;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const val = SMX.val;

  /* ------------------------------------------------------------------ small helpers */
  const isOn = (id, dflt) => { if (!SMX.has(id)) return !!dflt; const v = val(id); return !!v && v !== 'off'; };
  const word = (id) => { try { return String(kit().valueLabel(id, val(id))); } catch (e) { return String(val(id) == null ? '' : val(id)); } };
  const plural = d.plural;
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  const low = (s) => String(s).charAt(0).toLowerCase() + String(s).slice(1);
  const listOf = (a, joiner) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} ${joiner} ${a[a.length - 1]}`);
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const seg = (value, options, o) => { try { return kit().segmented(value, options, o); } catch (e) { return ''; } };
  const input = (value, o) => { try { return kit().input(value, o); } catch (e) { return ''; } };
  const steps = (items) => { try { return kit().steps(items); } catch (e) { return ''; } };
  const enc = encodeURIComponent;

  /* a row that opens something and also has its own buttons: the part that opens is one button, the others sit beside
     it, so pressing "Use this profile" never also opens the profile */
  const openAttrs = (it) => (it.go ? ` data-smx-go="${h(it.go)}"${it.reveal ? ` data-smx-reveal="${h(it.reveal)}"` : ''}` : it.action ? ` data-action="${h(it.action)}"${SMX.data(it.data)}` : '');
  const splitRow = (it) => `<div class="smx-thing smx-split"><button type="button" class="smx-split-open"${openAttrs(it)}><span class="smx-thing-avatar${it.icon ? '' : ' is-initials'}">${it.icon ? SMX.icon(it.icon) : h(it.initials || '?')}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(it.name)}${it.tag ? ` <span class="smx-thing-tag">${h(it.tag)}</span>` : ''}</span>${it.sub ? `<span class="smx-thing-sub">${h(it.sub)}</span>` : ''}${it.sub2 ? `<span class="smx-thing-sub">${h(it.sub2)}</span>` : ''}</span>${it.status ? `<span class="smx-split-status">${ui.status(it.status.text, it.status.tone)}</span>` : ''}<span class="smx-thing-go">${SMX.icon('go')}</span></button>${it.side ? `<span class="smx-thing-end">${it.side}</span>` : ''}</div>`;
  const splitThings = ({ title, help, add, items, anchor }) => ui.card({ title, help, anchor, cls: 'smx-things-card', side: add ? ui.btn(Object.assign({ icon: 'plus' }, add)) : '', body: `<div class="smx-things">${items.map(splitRow).join('')}</div>` });

  /* ------------------------------------------------------------------ profiles (the same tables the manager keeps) */
  const PRESET_OF = { 'hands-off': 'full', 'review-first': 'regular', 'read-only': 'read_only' };
  const BUILTIN = {
    'hands-off': { files: 'allow', commands: 'allow', network: 'allow', publish: 'ask' },
    'review-first': { files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' },
    'read-only': { files: 'deny', commands: 'deny', network: 'ask', publish: 'deny' }
  };
  const SEED = {
    'review-first': [{ action: 'Read project files', decision: 'Allow', condition: 'Inside project root' }, { action: 'Run project tests', decision: 'Ask', condition: 'Show the command and folder first' }, { action: 'Send external message', decision: 'Ask', condition: 'Preview recipient and content' }],
    'read-only': [{ action: 'Read project files', decision: 'Allow', condition: 'Inside project root' }, { action: 'Search the web', decision: 'Ask', condition: 'Show the address first' }]
  };
  const ABILITIES = [
    ['files', 'Change files in the project', 'Create, edit and delete files inside this project.', 'changes files'],
    ['commands', 'Run commands', 'Tests, builds and other programs.', 'runs commands'],
    ['network', 'Use the internet', 'Search the web and read pages.', 'uses the internet'],
    ['publish', 'Save, push and publish', 'Save to version history, send changes online, publish releases.', 'publishes']
  ];
  const ANS = [['allow', 'Without asking'], ['ask', 'Ask me first'], ['deny', 'Never']];
  const SAY = { allow: ['Without asking', 'ready'], ask: ['Asks first', 'info'], deny: ['Never', 'blocked'] };
  const DEC = { Allow: 'allow', Ask: 'ask', Deny: 'deny' };
  const sayDec = (decision) => SAY[DEC[decision] || 'ask'];

  const profiles = (st) => (Array.isArray(st.permissionProfiles) ? st.permissionProfiles : []);
  const builtIn = (p) => !!PRESET_OF[p.id];
  const presetOf = (p) => PRESET_OF[p.id] || p.preset || 'custom';
  const answers = (p) => Object.assign({ files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' }, BUILTIN[p.id] || p.abilities || {});
  const profById = (st, id) => profiles(st).find((p) => p.id === id) || null;
  /* the profile in use is the safety level setting; the manager moves its "in use" mark to match when it draws */
  const current = (st) => {
    const P = profiles(st), want = val('safety.rules.permission-preset'), cur = P.find((p) => p.status === 'default');
    if (cur && (want == null || presetOf(cur) === want)) return cur;
    return P.find((p) => presetOf(p) === want) || cur || P[0] || null;
  };
  const scopeWord = (s) => (s === 'Session' ? 'Until you close the app' : s === 'User' ? 'Everywhere' : 'This project');
  const by = (p, v) => { const ab = answers(p); return ABILITIES.filter((x) => ab[x[0]] === v).map((x) => x[3]); };
  /* "Asks before it changes files, runs commands, uses the internet or publishes." */
  const plainOf = (p, who) => {
    const A = by(p, 'allow'), B = by(p, 'ask'), C = by(p, 'deny'); const out = [];
    const s = (first, rest) => (who ? `${out.length ? 'It' : who} ${low(first)} ${rest}` : `${first} ${rest}`);
    if (A.length) out.push(who ? `${out.length ? 'It' : who} ${listOf(A, 'and')} by itself.` : `${cap(listOf(A, 'and'))} by itself.`);
    if (B.length) out.push(s('Asks', `before it ${listOf(B, 'or')}.`));
    if (C.length) out.push(s('Never', `${listOf(C, 'or')}.`));
    return out.join(' ');
  };

  /* ------------------------------------------------------------------ rules: read in both shapes
     Before the manager has been opened a rule names its profile only in `source`, and the two built-in profiles that
     have no saved rules get their example rules when it first draws. After, every rule has `profile` ('' = project). */
  const ownerOf = (st, r) => (r.profile !== undefined ? (r.profile || '') : ((profiles(st).find((p) => p.name === r.source || p.id === r.source) || {}).id || ''));
  const allRules = (st) => {
    const out = (Array.isArray(st.permissionRules) ? st.permissionRules : []).map((r) => ({ r, owner: ownerOf(st, r) }));
    if (!(st.pm51 && st.pm51.o55PermSeeded)) for (const [pid, list] of Object.entries(SEED)) { const p = profById(st, pid); if (p && !out.some((x) => x.owner === pid)) for (const r of list) out.push({ r: Object.assign({ source: p.name, profile: pid }, r), owner: pid }); }
    return out;
  };
  const rulesOf = (st, pid) => allRules(st).filter((x) => x.owner === (pid || '')).map((x, k, list) => Object.assign({ k, n: list.length, id: `${pid || 'project'}~${k}` }, x));
  const findRule = (st, id) => { const m = /^(.*)~(\d+)$/.exec(String(id || '')); if (!m) return null; return rulesOf(st, m[1] === 'project' ? '' : m[1])[Number(m[2])] || null; };
  const ownerName = (st, pid) => (pid ? (profById(st, pid) || {}).name || 'A profile' : 'This project');
  const condOf = (r) => (r.condition && r.condition !== 'Always' ? r.condition : '');
  const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

  /* Before this file changes a rule or a profile it puts the lists in the shape the manager leaves them in, exactly as
     the manager's first draw does, so both always work on the same data. */
  function settled() {
    const st = eng().getState(); const P = profiles(st);
    if (!Array.isArray(st.permissionRules)) st.permissionRules = [];
    const R = st.permissionRules; st.pm51 = st.pm51 || {};
    R.forEach((r) => { if (r.profile === undefined) r.profile = ownerOf(st, r); });
    if (!st.pm51.o55PermSeeded) { st.pm51.o55PermSeeded = true; for (const [pid, list] of Object.entries(SEED)) { const p = P.find((x) => x.id === pid); if (p && !R.some((r) => r.profile === pid)) for (const r of list) R.push(Object.assign({ source: p.name, profile: pid }, r)); } }
    const cur = current(st); if (cur) P.forEach((p) => { if (p.id === cur.id) p.status = 'default'; else if (p.status === 'default') p.status = 'available'; });
    return st;
  }
  const mine = (st, pid) => st.permissionRules.filter((r) => (r.profile || '') === (pid || ''));
  /* PMConcept7's own actions (use a profile, attach a rule, the permissions check) count rules by `profile`, so the
     lists are put in that shape the first time a page of this chapter is shown, as the manager does when it is opened. */
  let settling = false;
  const unsettled = (st) => { const c = current(st); return (st.permissionRules || []).some((r) => r.profile === undefined) || !(st.pm51 && st.pm51.o55PermSeeded) || (!!c && c.status !== 'default'); };
  const keepSettled = (st) => { if (settling || !unsettled(st)) return; settling = true; W.setTimeout(() => { try { commit(settled()); } catch (e) { /* the readers cope with both shapes */ } settling = false; SMX.soon(20); }, 0); };
  function commit(st) {
    profiles(st).forEach((p) => { p.rules = st.permissionRules.filter((r) => r.profile === p.id).length; });
    eng().setState(st);
    /* the inventory keeps the rule list as a setting too; keep it in step, as the manager does after every change */
    try { eng().setSettingFromHost('safety.rules.rule-editor', st.permissionRules.map((r) => `${r.action}: ${String(r.decision).toLowerCase()}${condOf(r) ? ` (${r.condition})` : ''}${r.profile ? ` [${ownerName(st, r.profile)}]` : ''}`), false); } catch (e) { /* the list itself is saved */ }
    SMX.fresh();
  }
  const ruleAt = (el) => { const m = /^(.*)~(\d+)$/.exec(el.getAttribute('data-rid') || ''); if (!m) return null; const st = settled(); const pid = m[1] === 'project' ? '' : m[1]; const list = mine(st, pid); const r = list[Number(m[2])]; return r ? { st, r, pid, k: Number(m[2]), list } : null; };

  SMX.act('safety-rule-answer', (el, e) => {
    const b = e && e.target && e.target.closest ? e.target.closest('button[data-value]') : null; const hit = ruleAt(el); if (!b || !hit) return;
    const next = { allow: 'Allow', ask: 'Ask', deny: 'Deny' }[b.getAttribute('data-value')]; if (!next || hit.r.decision === next) return;
    hit.r.decision = next; commit(hit.st);
    SMX.toast('Saved', `“${hit.r.action}”: ${sayDec(next)[0].toLowerCase()}.`);
  });
  SMX.act('safety-rule-text', (el) => {
    const box = el.querySelector('input'); const hit = ruleAt(el); if (!box || !hit) return;
    const field = el.getAttribute('data-field'); const text = String(box.value || '').trim();
    if (field === 'action') { if (!text) { SMX.toast('Name the action', 'Say what the rule is about.', 'info'); return; } if (hit.r.action === text) return; hit.r.action = text; }
    else { const c = text || 'Always'; if (hit.r.condition === c) return; hit.r.condition = c; }
    commit(hit.st); SMX.toast('Saved', field === 'action' ? `The rule is now about “${text}”.` : (text ? `It applies when: ${text}.` : 'It applies always.'));
  });
  SMX.act('safety-rule-owner', (el) => {
    const sel = el.querySelector('select'); const hit = ruleAt(el); if (!sel || !hit) return;
    const to = sel.value || ''; if (to === hit.pid) return;
    const p = to ? profById(hit.st, to) : null; if (to && !p) return;
    const R = hit.st.permissionRules; R.splice(R.indexOf(hit.r), 1); hit.r.profile = to; hit.r.source = p ? p.name : 'Project rule'; R.push(hit.r);
    const k = mine(hit.st, to).length - 1; commit(hit.st);
    if (p) SMX.toast(`Attached to ${p.name}`, `“${hit.r.action}” now travels with ${p.name} and no longer applies with other profiles.`);
    else SMX.toast('Moved to this project', `“${hit.r.action}” now applies whichever profile is in use.`);
    SMX.go(`safety/rules/${enc(`${to || 'project'}~${k}`)}`, { replace: true });
  });
  SMX.act('safety-rule-move', (el) => {
    const hit = ruleAt(el); if (!hit) return; const dir = Number(el.getAttribute('data-dir')) || 0; const other = hit.list[hit.k + dir]; if (!other) return;
    const R = hit.st.permissionRules; const i = R.indexOf(hit.r), j = R.indexOf(other); R[i] = other; R[j] = hit.r; commit(hit.st);
    SMX.go(`safety/rules/${enc(`${hit.pid || 'project'}~${hit.k + dir}`)}`, { replace: true, keepScroll: true });
  });
  SMX.act('safety-rule-delete', (el) => {
    const first = ruleAt(el); if (!first) return; const rid = el.getAttribute('data-rid'); const name = first.r.action, pid = first.pid, pname = ownerName(first.st, pid);
    kit().confirm(pid ? `Remove “${name}” from ${pname}?` : `Delete “${name}”?`, pid ? 'The rule is deleted. The profile’s four answers and the project’s rules still apply.' : 'The rules after it move up.', pid ? 'Remove' : 'Delete', () => {
      const hit = ruleAt({ getAttribute: () => rid }); if (!hit) return;
      hit.st.permissionRules.splice(hit.st.permissionRules.indexOf(hit.r), 1); commit(hit.st);
      SMX.toast('Rule deleted', `“${name}” no longer applies.`);
      SMX.go(pid ? `safety/profile/${enc(pid)}` : 'safety/rules', { replace: true });
    }, true);
  });
  SMX.act('safety-profile-duplicate', (el) => {
    const st = settled(); const p = profById(st, el.getAttribute('data-id')); if (!p) return;
    const c = JSON.parse(JSON.stringify(p)); c.id = `permission-${String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-copy-${Date.now().toString(36)}`; c.name = `${p.name} copy`; c.status = 'available'; c.abilities = answers(p); c.preset = 'custom';
    st.permissionProfiles.push(c);
    mine(st, p.id).forEach((r) => st.permissionRules.push(Object.assign(JSON.parse(JSON.stringify(r)), { profile: c.id, source: c.name })));
    commit(st); SMX.toast(`${c.name} made`, 'A copy with the same answers and rules. You can change it freely.');
    SMX.go(`safety/profile/${enc(c.id)}`);
  });
  SMX.act('safety-profile-delete', (el) => {
    const id = el.getAttribute('data-id'); const st0 = SMX.fresh(); const p0 = profById(st0, id); if (!p0) return; const n = rulesOf(st0, id).length;
    kit().confirm(`Delete ${p0.name}?`, n ? `Its ${plural(n, 'rule')} ${n === 1 ? 'goes' : 'go'} with it. This project’s rules are kept.` : 'This project’s rules are kept.', 'Delete', () => {
      const st = settled(); st.permissionProfiles = profiles(st).filter((x) => x.id !== id); st.permissionRules = st.permissionRules.filter((r) => r.profile !== id); commit(st);
      SMX.toast('Profile deleted', `${p0.name} is gone. The profile in use did not change.`);
      SMX.go('safety', { replace: true });
    }, true);
  });
  SMX.act('safety-why', (el) => {
    const text = el.getAttribute('data-text') || ''; const st = eng().getState(); st.pm51 = st.pm51 || {}; st.pm51.permWhy = text; eng().setState(st);
    SMX.run('pm51-permissions-why');
  });

  /* ------------------------------------------------------------------ what waits for you, and what is unguarded */
  const waiting = (st) => ((((st.pm51 || {}).permissions || {}).approvals) || []).filter((x) => x.status === 'Waiting');
  const paths = (st) => (Array.isArray(st.fileSafePaths) ? st.fileSafePaths : []);
  const guardsOff = () => [
    isOn('safety.protection.filesafe-integration', true) ? null : { tone: 'blocked', title: 'File and command protection is off', detail: 'Nothing stops the assistant from touching protected files or running dangerous commands.', fix: { label: 'Turn it back on', go: 'safety/protected', reveal: 'safety.protection.filesafe-integration' } },
    isOn('safety.protection.security-filter', true) ? null : { title: 'Secret files are not protected', detail: 'Passwords, .env files and keys can be read.', fix: { label: 'Protect them', go: 'safety/protected', reveal: 'safety.protection.security-filter' } },
    isOn('safety.protection.bash-guard', true) ? null : { title: 'Dangerous commands are not blocked', detail: 'A command that wipes files would run like any other.', fix: { label: 'Block them', go: 'safety/protected', reveal: 'safety.protection.bash-guard' } },
    isOn('safety.protection.allow-destructive', false) ? { title: 'Dangerous commands are let through', detail: 'The block list is overridden; each use still asks.', fix: { label: 'See the choice', go: 'safety/protected', reveal: 'safety.protection.allow-destructive' } } : null
  ].filter(Boolean);
  const needs = (st) => [
    ...waiting(st).map((x) => ({ title: `“${x.action}” is waiting for your answer`, detail: [x.from, x.risk].filter(Boolean).join(' · '), fix: { label: 'Answer it', go: 'safety/asking' } })),
    ...guardsOff()
  ];
  (SMX.needSources = SMX.needSources || []).push(Object.assign(needs, { chapter: 'safety' }));
  /* the chapter says its state on Settings Home, as the two finished chapters do */
  const chapter = SMX.chapters.find((c) => c.id === 'safety');
  if (chapter && !chapter.status) chapter.status = (ctx) => { const n = waiting(ctx.st).length, off = guardsOff().length, p = current(ctx.st); return n ? { tone: 'attention', text: `${n} waiting for you` } : off ? { tone: 'attention', text: 'A guard is off' } : { tone: 'ready', text: p ? p.name : 'Set up' }; };

  /* ------------------------------------------------------------------ the start modes, in words */
  const RUN = 'code.execution.run-mode', CHAT = 'safety.rules.chat-mode';
  const MODE_MEANS = {
    Ask: 'It answers and looks around, and changes nothing.',
    Plan: 'It looks around and writes a plan, and changes nothing.',
    Regular: 'It works, and stops to ask wherever “What that means right now” says “Asks first”.',
    YOLO: 'It works without stopping for questions. Blocked actions stay blocked, and file and command guards still apply.'
  };
  const modeNote = () => {
    const run = String(val(RUN) || 'Regular'), chat = String(val(CHAT) || 'Regular');
    const a = `${ui.b(word(RUN))}: ${h(low(MODE_MEANS[run] || ''))}`;
    return chat === run ? `Both start in ${a}` : `A run in ${a} A chat in ${ui.b(word(CHAT))}: ${h(low(MODE_MEANS[chat] || ''))}`;
  };

  /* ------------------------------------------------------------------ what it may do right now: one line per worry */
  const webWords = () => { const v = Object.values(val('safety.protection.web-tool-permissions') || {}); if (!v.length || v.every((x) => x === 'ask')) return 'Each web ability asks too.'; if (v.every((x) => x === 'allow')) return 'The web abilities themselves do not ask.'; if (v.every((x) => x === 'deny')) return 'Every web ability is blocked.'; return 'Some web abilities have their own answer.'; };
  const always = (k) => { const v = val('safety.approvals.checkpoint-types'); return Array.isArray(v) && v.includes(k); };
  function rightNow(st) {
    const p = current(st); if (!p) return [];
    const ab = answers(p), tools = val('safety.rules.per-tool-permissions') || {}, here = `safety/profile/${enc(p.id)}`;
    const line = (icon, name, say, sub, go, reveal) => ({ icon, name, sub, status: { text: say[0], tone: say[1] }, go, reveal });
    const offline = isOn('web.fetch.air-gap-mode', false);
    const guard = isOn('safety.protection.bash-guard', true), secrets = isOn('safety.protection.security-filter', true);
    const spend = Number(val('ai.usage.run-spend-budget')) || 0;
    const outside = String(val('safety.protection.external-dir-action') || 'ask');
    const n = paths(st).filter((f) => f.status !== 'disabled').length;
    const pub = ab.publish !== 'deny' && isOn('safety.approvals.external-publish-ask', true);
    return [
      line('eye', 'Read files in the project', SAY[tools.read] || SAY.allow, secrets ? 'Reading never changes anything. Secret files, such as passwords and keys, stay closed.' : 'Reading never changes anything. Secret files are not protected at the moment.', 'safety/rules', 'safety.rules.per-tool-permissions'),
      line('edit', 'Change files in the project', SAY[ab.files], `${p.name} decides this.${n ? ` ${plural(n, 'protected place')} ${n === 1 ? 'keeps its' : 'keep their'} own rules.` : ''}`, here),
      line('terminal', 'Run commands', SAY[ab.commands], `${p.name} decides this. ${guard ? 'Commands that could wipe files are stopped before they run.' : 'Dangerous commands are not blocked at the moment.'}`, here),
      line('globe', 'Use the internet', offline ? ['Never', 'blocked'] : SAY[ab.network], offline ? 'Working offline is on, so nothing reaches the internet.' : `${p.name} decides this. ${ab.network === 'deny' ? '' : webWords()}`, offline ? 'ai/web' : here),
      line('upload', 'Send work online and publish', pub ? ['Always asks', 'info'] : SAY[ab.publish], pub ? 'Anything that leaves this computer needs your OK, whatever the profile says.' : `${p.name} decides this.`, pub ? 'safety/asking' : here, pub ? 'safety.approvals.external-publish-ask' : ''),
      line('wallet', 'Spend money', always('billing') ? ['Always asks', 'info'] : ['No extra question', 'off'], `${spend > 0 ? `One run may spend up to $${spend}.` : 'One run has no spending limit of its own.'}`, 'safety/asking', 'safety.approvals.checkpoint-types'),
      line('trash', 'Delete things', always('destructive') ? ['Always asks', 'info'] : ['No extra question', 'off'], guard ? 'Commands that wipe whole folders are blocked outright.' : 'Commands that wipe whole folders are not blocked at the moment.', 'safety/asking', 'safety.approvals.checkpoint-types'),
      line('folder', 'Touch folders outside the project', SAY[outside] || SAY.ask, 'Everything else on this computer.', 'safety/protected', 'safety.protection.external-dir-action')
    ];
  }

  /* ================================================================== What it may do (the chapter's first page) */
  SMX.extend('safety', {
    noPagesList: true,
    keywords: ['permission', 'permissions', 'profile', 'yolo', 'no pauses', 'plan only', 'ask', 'allow', 'approve', 'safe', 'safety level', 'hands-off', 'review-first', 'read-only'],
    lead: (ctx) => {
      const st = ctx.st, p = current(st), P = profiles(st), nd = needs(st);
      keepSettled(st);
      if (!p) return [{ key: 'none', html: ui.things({ title: 'How much it may do by itself', items: [], empty: { icon: 'shield', title: 'No profile yet', text: 'A profile is a ready-made answer to “how much may the assistant do by itself?”.', fix: { label: 'Make a profile', action: 'pm51-permissions-profile-new' } } }) }];
      const run = String(val(RUN) || 'Regular');
      const runs = `New runs start in ${ui.word(word(RUN), { go: 'safety', reveal: RUN })} and new chats in ${ui.word(word(CHAT), { go: 'safety', reveal: CHAT })}`;
      return [
        { key: 'summary', html: ui.summary({ icon: 'shield', tone: nd.some((x) => x.tone !== 'info') ? 'attention' : 'ready', lines: [
          `With ${ui.word(p.name, { go: `safety/profile/${enc(p.id)}` })} in use, ${h(low(plainOf(p, 'the assistant')))}`,
          `${runs}${run === 'YOLO' ? ', so runs do not stop for those questions.' : run === 'Regular' ? ', so those questions reach you.' : ', which only looks and changes nothing.'}`
        ], side: ui.btn({ label: 'Check permissions', icon: 'test', action: 'pm51-permissions-diagnostics' }) }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'profiles', html: splitThings({ title: 'How much may it do by itself?', help: 'Pick one profile. A profile is a ready-made answer to that question; you can make your own.', add: { label: 'New profile', action: 'pm51-permissions-profile-new' },
          items: P.map((x) => { const used = x.id === p.id, n = rulesOf(st, x.id).length; return { icon: builtIn(x) ? 'shield' : 'user', name: x.name, tag: builtIn(x) ? 'Built in' : 'Your own', sub: plainOf(x), sub2: `${n ? `${plural(n, 'rule')} of its own` : 'No rules of its own'} · ${scopeWord(x.scope)}`, status: used ? { text: 'In use', tone: 'ready' } : null, side: used ? '' : ui.btn({ label: 'Use this profile', action: 'pm51-permissions-profile-use', data: { id: x.id } }), go: `safety/profile/${enc(x.id)}` }; }) }) },
        { key: 'now', html: ui.things({ title: 'What that means right now', help: `With ${p.name} in use. Each line opens the place that decides it.${run === 'YOLO' ? ' New runs start with no pauses, so they do not stop at “Asks first”.' : run === 'Ask' || run === 'Plan' ? ` New runs start in ${word(RUN)}, which changes nothing until you switch a run to Regular.` : ''}`, items: rightNow(st) }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'sliders', title: 'Make an exception for one action', sub: 'Allow, ask or never, for one kind of action', action: 'pm51-permissions-rule-add' },
          { icon: 'lock', title: 'Protect a folder or a file', sub: 'Decide what the assistant may do there', action: 'pm51-permissions-path-add' },
          { icon: 'clock', title: 'Limit how far one run may go', sub: 'Time, steps and spending', go: 'safety/limits' },
          { icon: 'search', title: 'Find out why it did something', sub: 'See which rule decided it', go: 'safety/rules', anchor: 'why' }
        ], { title: 'What do you want to do?' }) },
        { key: 'modes', html: ui.card({ title: 'How a new run or chat starts', help: 'A mode is for one run or one chat. You can switch it there at any time.', body:
          ui.sentence(`<span>A new run starts in</span>${ui.select(RUN, { label: 'New agent runs start in' })}<span>and a new chat in</span>${ui.select(CHAT, { label: 'New chats start in' })}`)
          + `<p class="smx-sentence-note">${modeNote()}</p>`
          + ui.rows([{ label: 'Extra working style', help: 'Debug, interview or brainstorm on top of the mode. It never allows more than the mode does.', covers: 'code.execution.mode-overlay', control: ui.select('code.execution.mode-overlay', { label: 'Extra working style' }) }])
          + ui.links([{ label: 'What a new chat is for (ask, build or plan) is chosen under Chat & assistant', go: 'assistant', reveal: 'general.interaction.assistant-mode' }]) }) }
      ];
    },
    sections: [],
    expert: [S('permissions-freedom-more', { title: 'Who carries out the actions', help: 'Whether Puppet Master or the AI provider’s own app does each step.' })],
    expertHelp: 'Safe to leave alone',
    tail: (ctx) => [
      { key: 'pages', html: ui.pages('safety', ctx, { title: 'Also in this chapter' }) },
      { key: 'links', html: ui.links([{ label: 'How permissions work', action: 'pm51-permissions-help' }, { label: 'Put the safety settings back to how they came…', action: 'pm51-permissions-reset' }]) }
    ],
    covers: { 'safety.rules.permission-preset': 'The choice “How much may it do by itself?” at the top of this page.', 'code.execution.run-mode': 'The sentence “A new run starts in …” on this page.', 'safety.rules.chat-mode': 'The sentence “A new run starts in … and a new chat in …” on this page.', 'code.execution.mode-overlay': 'The row under that sentence.' },
    changes: [
      { was: 'The question “may it act without asking?” is answered across five tabs (Profiles, Rules, Protected Files, Approvals, Limits) and beyond: 111 rows in 36 views of Settings are about asking or approving. Permissions opens on a sentence about how profiles and rules relate, then a list beside a detail pane.', now: 'The page opens on what the answer is right now, in one sentence built from the profile in use and the two start modes. The profiles follow as one choice, each with a sentence made from its real answers.' },
      { was: '“Effective access now”, the only table that says what will actually happen, is inside “More options” on the Profiles tab and has five rows (Project files, Protected paths, Commands, Network, Version history).', now: 'It is the second thing on the page: eight plain lines (read, change, run commands, internet, publish, spend, delete, outside the project). Each line says what decides it and opens that place.' },
      { was: 'The profile in use appears twice on one tab: as the selected item of the list and as a readout “Safety level: Regular” (safety.rules.permission-preset).', now: 'Once: the profile marked “In use”. The level is a fact on the profile’s own page.' },
      { was: 'The selected profile’s detail shares its pane with five more blocks (its answers, its rules, “Also applies”, “In short”, “New runs and chats”): 727 words on the first tab.', now: 'A profile has a page of its own. This page lists the profiles, one line each.' },
      { was: 'A request that is waiting for approval is visible only on the fourth tab, Approvals. Settings Home lists three other warnings and not this one.', now: 'It is a “Needs you” line here and on Settings Home, with one button.' },
      { was: '“New chats start in” exists twice with different choices: here (Regular, No pauses) and under App & Input (Ask, Agent, Debug, Plan, Deep Plan). “New agent runs start in” has four choices and a help line that explains two of them.', now: 'One sentence holds both choices, and the line under it says in words what the current choice does. A link names the other “new chat” choice and where it lives.' },
      { was: '“How permissions work”, “Run permissions check” and “Reset these settings to the defaults” repeat under all five tabs.', now: 'Each appears once in the chapter.' }
    ]
  });

  /* ================================================================== one profile */
  const profOf = (ctx) => profById(ctx.st, (ctx.params || {}).pid);
  SMX.page({
    id: 'safety/profile/:pid', chapter: 'safety', parent: 'safety',
    title: (ctx) => { const p = profOf(ctx); return p ? p.name : 'Profile'; },
    nav: (ctx) => { const p = profOf(ctx); return p ? p.name : 'Profile'; },
    purpose: (ctx) => { const p = profOf(ctx); return p ? `A profile: a ready-made answer to “how much may the assistant do by itself?”. ${builtIn(p) ? 'It comes with Puppet Master.' : 'You made this one.'}` : ''; },
    legacy: [['safety', 'permissions', 'profiles', 'permissions']],
    headSide: (ctx) => { const p = profOf(ctx); if (!p) return ''; const cur = current(ctx.st); return cur && cur.id === p.id ? '' : ui.btn({ label: 'Use this profile', icon: 'check', primary: true, small: false, action: 'pm51-permissions-profile-use', data: { id: p.id } }); },
    lead: (ctx) => {
      const st = ctx.st, p = profOf(ctx);
      keepSettled(st);
      if (!p) return [{ key: 'gone', html: ui.card({ title: 'This profile is no longer there', body: ui.btn({ label: 'Back to Safety & permissions', go: 'safety' }) }) }];
      const cur = current(st), used = !!cur && cur.id === p.id, fixed = builtIn(p), ab = answers(p), own = rulesOf(st, p.id), proj = rulesOf(st, '');
      const n = paths(st).filter((f) => f.status !== 'disabled').length;
      return [
        { key: 'summary', html: ui.summary({ icon: fixed ? 'shield' : 'user', tone: used ? 'ready' : 'info', lines: [
          `${ui.b(p.name)} ${used ? 'is in use' : 'is not in use'}. ${h(plainOf(p, 'The assistant'))}`,
          used ? '' : `${ui.b(cur ? cur.name : 'Another profile')} is in use at the moment.`
        ] }) },
        { key: 'answers', html: ui.card({ title: 'What it may do without asking', help: fixed ? 'A built-in profile keeps these four answers. Make a copy to change them.' : 'One answer for each kind of action. “Ask me first” is the safe middle.',
          side: fixed ? ui.btn({ label: 'Make a copy to change', icon: 'copy', action: 'pm51-permissions-profile-copy', data: { id: p.id } }) : '',
          body: ui.rows(ABILITIES.map(([k, label, help]) => (fixed ? { label, help, control: ui.status(SAY[ab[k]][0], SAY[ab[k]][1]) } : { label, help, control: seg(ab[k], ANS, { action: 'pm51-permissions-ability', data: { id: p.id, key: k }, label }) }))) }) },
        { key: 'rules', html: ui.things({ title: 'Rules that come with it', help: own.length ? 'Exceptions to the four answers above. They are checked top to bottom, and the last one that matches decides.' : '', add: { label: 'Add a rule', action: 'pm51-permissions-rule-add', data: { profile: p.id } },
          items: own.map((x) => ({ initials: String(x.k + 1), name: x.r.action, sub: condOf(x.r) || 'Always', status: { text: sayDec(x.r.decision)[0], tone: sayDec(x.r.decision)[1] }, go: `safety/rules/${enc(x.id)}` })),
          empty: { icon: 'list', title: 'No rules of its own', text: 'Its four answers decide. Add a rule when one kind of action needs a different answer.' } }) },
        { key: 'attach', html: `<div class="smx-btn-row">${ui.btn({ label: 'Attach a rule from this project', icon: 'link', action: 'pm51-permissions-attach', data: { profile: p.id }, disabled: !proj.length, reason: 'This project has no rules of its own to attach.' })}</div>` },
        { key: 'also', html: ui.things({ title: 'Also applies, whichever profile is in use', items: [
          { icon: 'lock', name: 'Protected files and commands', sub: `Always checked first. ${plural(n, 'protected place')}.`, go: 'safety/protected' },
          { icon: 'sliders', name: 'This project’s rules', sub: `Checked after this profile’s own rules. ${plural(proj.length, 'rule')}.`, go: 'safety/rules' },
          { icon: 'chat', name: 'What always asks', sub: 'Spending, deleting, passwords and publishing ask whatever a profile says.', go: 'safety/asking' }
        ] }) },
        { key: 'actions', html: `<div class="smx-btn-row">${fixed ? '' : ui.btn({ label: 'Change it step by step…', icon: 'edit', action: 'pm51-permissions-profile-edit', data: { id: p.id } })}${ui.btn({ label: 'Duplicate', icon: 'copy', do: 'safety-profile-duplicate', data: { id: p.id } })}${ui.btn({ label: 'Delete this profile…', icon: 'trash', danger: true, do: 'safety-profile-delete', data: { id: p.id }, disabled: used || fixed, reason: fixed ? 'A built-in profile cannot be deleted.' : 'It is in use. Use another profile first.' })}</div>` }
      ];
    },
    expert: [{ key: 'facts', html: (ctx) => { const p = profOf(ctx); if (!p) return ''; let level = presetOf(p); try { level = kit().valueLabel('safety.rules.permission-preset', presetOf(p)); } catch (e) { /* the raw name */ } const own = rulesOf(ctx.st, p.id).map((x) => x.r), proj = rulesOf(ctx.st, '').map((x) => x.r).filter((r) => !own.some((o) => same(o.action, r.action))); const pick = (v, d2) => { const out = ABILITIES.filter((x) => answers(p)[x[0]] === v).map((x) => low(x[1])).concat(own.concat(proj).filter((r) => r.decision === d2).map((r) => low(r.action))); return Array.from(new Set(out)); };
      return ui.card({ title: 'About this profile', body: ui.facts([['Summary', p.description || 'Your own profile'], ['Asks before', cap(listOf(pick('ask', 'Ask'), 'and')) || 'Nothing extra'], ['Never allows', cap(listOf(pick('deny', 'Deny'), 'and')) || 'Nothing is fully blocked'], ['Safety level', `${level} (built-in profiles are the preset levels; your own count as Custom)`], ['Applies', scopeWord(p.scope)], ['Saved in', builtIn(p) ? 'Built in' : `permission-profiles/${p.id}.toml`], ['Its id', p.id]]) }); }, count: 0 }],
    expertLabel: 'About this profile', expertHelp: 'Its level, where it applies and where it is saved',
    changes: [
      { was: 'A profile is the right-hand pane of the Profiles tab: its four answers, its rules, “Also applies”, “In short” and “New runs and chats” in one column, with three more blocks under “More options”.', now: 'A profile has a page. One sentence says what it lets the assistant do; then the four answers, then its rules as a list in which each rule opens.' },
      { was: 'A built-in profile and one of your own look the same, but only your own can be changed: the built-in shows text where yours shows three-way choices, and the reason is a help line.', now: 'A built-in profile shows its answers as statuses, with one button beside them: “Make a copy to change”.' },
      { was: '“Duplicate” and “Delete” are inside a “More actions” menu; “Delete” is greyed out with a one-word reason (“In use”, “Built in”).', now: 'They are ordinary buttons at the end of the page, the risky one last. A button that cannot be used says why in a sentence.' },
      { was: '“In short” repeats the answers above it as two lists (“Asks before”, “Never allows”) and adds “Summary”, “Safety level” and “Applies”.', now: 'The sentence at the top is the summary. The three facts are under “About this profile”.' }
    ]
  });

  /* ================================================================== When it asks you */
  SMX.extend('safety/asking', {
    blurb: (ctx) => { const n = waiting(ctx.st).length; return n ? `${plural(n, 'request')} waiting for your answer` : `Nothing is waiting · questions appear in ${low(word('safety.approvals.alert-channel'))}`; },
    status: (ctx) => { const n = waiting(ctx.st).length; return n ? { text: `${n} waiting`, tone: 'attention' } : { text: 'Nothing waiting', tone: 'ready' }; },
    keywords: ['approval', 'approve', 'reject', 'ask me', 'timeout', 'pause', 'checkpoint', 'waiting', 'request'],
    lead: (ctx) => {
      const st = ctx.st, A = waiting(st);
      return [
        { key: 'summary', html: ui.summary({ icon: 'chat', tone: A.length ? 'attention' : 'ready', lines: [
          A.length ? `${ui.b(plural(A.length, 'request'))} ${A.length === 1 ? 'is' : 'are'} waiting for your answer.` : 'Nothing is waiting for your answer.',
          `Questions appear in ${ui.word(low(word('safety.approvals.alert-channel')), { go: 'safety/asking', reveal: 'safety.approvals.alert-channel' })}. If you do not answer, the run ${ui.word(({ off: 'keeps waiting', ask: 'asks again', long_wait: 'is marked as waiting a long time' })[String(val('safety.approvals.timeout-mode'))] || 'keeps waiting', { go: 'safety/asking', reveal: 'safety.approvals.timeout-mode' })}.`
        ] }) },
        { key: 'waiting', html: ui.things({ title: 'Waiting for your answer', help: A.length ? 'Things the assistant wants to do but may not do alone.' : '',
          items: A.map((x) => ({ icon: 'alert', name: x.action, sub: [x.from, x.risk].filter(Boolean).join(' · '), side: ui.btn({ label: 'Approve', icon: 'check', primary: true, action: 'pm51-permissions-approve', data: { id: x.id } }) + ui.btn({ label: 'Reject', action: 'pm51-permissions-reject', data: { id: x.id } }) })),
          empty: { icon: 'check', title: 'Nothing is waiting', text: 'When the assistant needs your OK, the request shows up here and in the place you choose below.' } }) }
      ];
    },
    sections: [
      { key: 'always', title: 'Always ask first', help: 'These need your OK whatever the profile says.', ids: ['safety.approvals.checkpoint-types', 'safety.approvals.external-publish-ask', 'safety.approvals.boundary-enforcement'] },
      { key: 'answering', title: 'When you are asked', help: 'Where the question shows up, and what happens while it waits.', ids: ['safety.approvals.alert-channel', 'safety.approvals.timeout-mode', 'safety.approvals.approval-ladder-default'] }
    ],
    more: [
      { key: 'pauses', title: 'Stops in long work', help: 'Besides single questions, a long run can stop at set points so you can look before it goes on.', ids: ['safety.approvals.autonomy-mode', 'safety.approvals.gate-seam', 'safety.approvals.gate-package', 'safety.approvals.gate-lane', 'safety.approvals.auto-continue', 'safety.approvals.require-plan-first'] },
      { key: 'answers', title: 'What you see, and what your answer does', ids: ['safety.approvals.pre-run-display', 'safety.approvals.wake-scheduler', 'safety.protection.safe-point-restore'] }
    ],
    moreLabel: 'Stops in long work, and what an answer does', moreHelp: 'Less common choices',
    expert: [S('permissions-approvals-more', { title: 'Strictness and records', help: 'How exactly an OK is matched, and what is kept of your answers.' })],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How the alert for a waiting request sounds and where it goes', go: 'notifications/events' }, { label: 'When scheduled work may run without you', go: 'planning/goals' }]) }],
    changes: [
      { was: 'Approvals is the fourth of five tabs. The request that is waiting sits above 20 setting rows of equal weight (669 words: five chips, twelve switches, five dropdowns), eight of them behind “More options”.', now: 'The waiting request comes first, with its two buttons. Six everyday choices follow in two groups. The other 17 rows are folded: stops in long work, what an answer does, and strictness for experts.' },
      { was: '“How runs pause: Hands-off” uses the word of the profile “Hands-off development”, though one is about stops at milestones of a long run and the other about single actions.', now: 'The group is called “Stops in long work” and says how it differs from single questions. The option’s own word is unchanged, because it belongs to PMConcept7’s row.' },
      { was: '“Always ask about these” and “Extra approval for risky actions” sit beside the profile’s answers with nothing saying which one wins.', now: 'The group says it in its first line: these need your OK whatever the profile says. The first page of the chapter shows the result as “Always asks”.' },
      { was: 'Three hidden rows (“Pause before each big stretch of work”, “… each package”, “… each lane”) appear only after “How runs pause” is set to “Ask at checkpoints”, on a tab that already has 20 rows.', now: 'They are kept, under “Stops in long work”, and still appear only when they apply.' }
    ]
  });

  /* ================================================================== Rules for each action */
  const TOOLS = [['bash', 'Run commands', 'Tests, builds and other programs.', 'commands'], ['edit', 'Edit files', 'Create and change files.', 'files'], ['read', 'Read files', 'Open files to look at them.'], ['grep', 'Search in files', 'Look for text across the project.'], ['question', 'Ask you a question', 'Stop and ask you something.'], ['todo_write', 'Write the to-do list', 'Keep its own checklist up to date.'], ['todo_read', 'Read the to-do list', 'Look at its own checklist.'], ['skill', 'Use skills', 'Follow a skill you have installed.'], ['lsp_readonly', 'Code intelligence (read only)', 'Look up names and definitions in code. It changes nothing.']];
  const WEB_TOOLS = [['websearch', 'Search the web', 'Look something up.'], ['webfetch', 'Read one page', 'Open one web page and read it.'], ['webextract', 'Turn pages into data', 'Pull tables and lists out of pages.'], ['webresearch', 'Research', 'Search, read several pages and sum them up.'], ['webcrawl', 'Crawl a site', 'Follow the links through a whole site.'], ['webmap', 'Outline a site', 'List the pages a site has.']];
  const toolRows = (st, id, tools) => { const v = val(id) || {}; const p = current(st); const ab = p ? answers(p) : {};
    return ui.rows(tools.map(([key, label, help, ability]) => ({ label, help: `${help}${ability && p ? ` ${p.name} answers this first: ${SAY[ab[ability]][0].toLowerCase()}.` : ''}`, control: seg(v[key] || 'ask', ANS, { action: 'pm51-permissions-tool', data: { setting: id, tool: key }, label }) }))); };
  const orderCard = (st) => { const p = current(st); return ui.card({ title: 'Which answer wins', help: 'For every action, the first of these that has an answer decides.', body: steps([
    { title: 'Protected files and commands', desc: 'Checked first, always. A protected place or a dangerous command is stopped whatever comes after.', action: ui.btn({ label: 'Open', go: 'safety/protected' }) },
    { title: p ? `${p.name}, the profile in use` : 'The profile in use', desc: 'Its own rules, then its four answers (files, commands, internet, publishing).', action: p ? ui.btn({ label: 'Open', go: `safety/profile/${enc(p.id)}` }) : '' },
    { title: 'This project’s rules', desc: 'The list below. Used when the profile has no rule for the action.' },
    { title: 'The answer for each tool', desc: `Under “More options”. Anything nothing mentions: ${low(word('safety.rules.default-tool-permission'))}.` }
  ]) + `<p class="smx-sentence-note">After that, an “Asks first” answer waits for you (${ui.link({ label: 'When it asks you', go: 'safety/asking' })}), and limits stop work that runs away, whatever the rules say (${ui.link({ label: 'Limits for one run', go: 'safety/limits' })}).</p>` }); };
  const rulesPage = SMX.extend('safety/rules', {
    purpose: 'An answer for one kind of action: without asking, ask first, or never. A rule is an exception to the profile in use.',
    blurb: (ctx) => { const n = rulesOf(ctx.st, '').length; return `${plural(n, 'rule')} for this project · anything nothing mentions: ${low(word('safety.rules.default-tool-permission'))}`; },
    keywords: ['rule', 'rules', 'exception', 'allow list', 'tool permission', 'why', 'explain', 'import rules', 'export rules', 'web ability'],
    lead: (ctx) => {
      const st = ctx.st, p = current(st), proj = rulesOf(st, ''), own = p ? rulesOf(st, p.id) : [];
      keepSettled(st);
      const shadow = (r) => own.find((x) => same(x.r.action, r.action));
      const examples = proj.slice(0, 3).map((x) => x.r.action);
      return [
        { key: 'summary', html: ui.summary({ icon: 'sliders', tone: 'ready', lines: [
          `${ui.b(plural(proj.length, 'rule'))} ${proj.length === 1 ? 'belongs' : 'belong'} to this project and ${proj.length === 1 ? 'applies' : 'apply'} whichever profile is in use.`,
          p ? `${ui.word(p.name, { go: `safety/profile/${enc(p.id)}` })} brings ${own.length ? `${plural(own.length, 'rule')} of its own, which ${own.length === 1 ? 'is' : 'are'} checked first` : 'no rules of its own; its four answers decide'}.` : ''
        ] }) },
        { key: 'order', html: orderCard(st) },
        { key: 'project', html: ui.things({ title: 'Rules for this project', help: proj.length ? 'Checked top to bottom; the last one that matches decides. Open a rule to change it.' : '', add: { label: 'Add a rule', action: 'pm51-permissions-rule-add' },
          items: proj.map((x) => { const s = shadow(x.r); return { initials: String(x.k + 1), name: x.r.action, tag: s ? `${p.name} answers this first` : '', sub: condOf(x.r) || 'Always', status: { text: sayDec(x.r.decision)[0], tone: sayDec(x.r.decision)[1] }, go: `safety/rules/${enc(x.id)}` }; }),
          empty: { icon: 'list', title: 'No rules for this project yet', text: 'Add a rule when one kind of action needs the same answer whichever profile is in use.', fix: { label: 'Add a rule', action: 'pm51-permissions-rule-add' } } }) },
        { key: 'rest', html: ui.card({ title: 'Everything else', body: ui.sentence(`<span>When nothing mentions an action:</span>${ui.select('safety.rules.default-tool-permission', { label: 'Anything without a rule' })}`) }) },
        { key: 'why', html: ui.card({ anchor: 'why', title: 'Why did it do that?', help: 'Type what the assistant did, or pick one, and see which rule decided it.', body: `<div class="pm51-perm-why">${input((st.pm51 || {}).permWhy || '', { action: 'pm51-permissions-why-input', placeholder: 'For example: Force push', label: 'Action to explain' })}${ui.btn({ label: 'Explain', icon: 'search', action: 'pm51-permissions-why' })}</div>${examples.length ? `<div class="smx-btn-row smx-pad">${examples.map((t) => ui.btn({ label: t, ghost: true, do: 'safety-why', data: { text: t } })).join('')}</div>` : ''}` }) }
      ];
    },
    more: [
      { key: 'tools', html: (ctx) => `<div data-smx-covers="safety.rules.per-tool-permissions">${ui.card({ title: 'The answer for each tool', help: 'Used when no rule mentions the action. Reading and searching are safe to allow.', body: toolRows(ctx.st, 'safety.rules.per-tool-permissions', TOOLS) })}</div>`, count: 9 },
      { key: 'web', html: (ctx) => ui.card({ title: 'The answer for each web ability', help: 'What the assistant may do on the web. “Ask me first” is safest.', side: ui.btn({ label: 'Web research', go: 'ai/web' }), body: toolRows(ctx.st, 'safety.protection.web-tool-permissions', WEB_TOOLS) }), count: 6 }
    ],
    moreLabel: 'An answer for each tool and web ability', moreHelp: 'For when no rule decides',
    expert: [
      { key: 'view', title: 'View and scope', help: 'Simple or Expert, and rules for one part of a project.', ids: ['safety.rules.ui-mode', 'safety.rules.scoped-overrides', 'safety.rules.scope-selector'] },
      S('permissions-rules-more', { title: 'Where rules are kept and shown' }),
      { key: 'sources', html: (ctx) => { const st = ctx.st, all = allRules(st), src = {}; all.forEach((x) => { const k = x.owner ? `Profile: ${ownerName(st, x.owner)}` : (x.r.source && x.r.source !== 'Project rule' ? `Project: ${x.r.source}` : 'Project rule'); src[k] = (src[k] || 0) + 1; });
        return ui.card({ title: 'Where every rule comes from', body: ui.facts([['Profiles', profiles(st).length], ['Rules in profiles', all.filter((x) => x.owner).length], ['Rules for this project', all.filter((x) => !x.owner).length], ['Protected places', paths(st).length], ['Order of evaluation', 'Protected files, then the profile’s rules, then this project’s rules, then approvals, then limits'], ...Object.entries(src).map(([k, n]) => [k, plural(n, 'rule')])]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Save an audit report', icon: 'download', action: 'pm51-permissions-audit-export' })}</div>` }); }, count: 0 }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Save the rules to a file', action: 'pm51-permissions-rules-export' }, { label: 'Bring in rules from a file', action: 'pm51-permissions-rules-import' }]) }],
    covers: { 'safety.rules.rule-editor': 'The list “Rules for this project” on this page; each rule opens on its own page.', 'safety.rules.default-tool-permission': 'The sentence “When nothing mentions an action” on this page.', 'safety.rules.per-tool-permissions': 'The card “The answer for each tool”, under More options.', 'safety.protection.web-tool-permissions': 'The card “The answer for each web ability”, under More options.' },
    changes: [
      { was: 'The same choice is made three ways with three sets of words: a profile’s answers (“Without asking / Ask me first / Never”), rules (“Without asking / Asks first / Never”) and tool answers (“Allow / Ask / Block”). Which one wins is said only inside the help panel “How permissions work”.', now: 'One set of words. A card, “Which answer wins”, gives the order once, and each step opens its place.' },
      { was: 'The Rules tab opens on a switch, “Permissions view: Simple / Expert”. In Simple view the project’s four rules are a sentence (“4 rules for this project and 3 rules in Review-first decide the details. Switch the view to Expert to see and change them.”).', now: 'The rules are a list on the page, each with its answer. A rule that the profile in use also answers says so. The view switch is kept under “For experts”; in this design it no longer hides anything.' },
      { was: '15 three-way controls (9 tools, 6 web abilities) fill the tab before any rule is visible, with no line saying what a tool does.', now: 'They are under “More options”, one line of explanation each. “Run commands” and “Edit files” say that the profile answers them first.' },
      { was: '“Why is this allowed?” is a text box inside “More options” on another tab (Profiles) and expects the exact name of an action.', now: 'It is on this page as “Why did it do that?”, with the project’s own rule names as one-press examples.' },
      { was: '“Export rules” and “Import rules” exist only in Expert view and inside “More options”; the audit’s driver could not find them.', now: 'Two plain links at the end of the page.' }
    ]
  });
  if (rulesPage && rulesPage.covers) for (const id of ['safety.rules.ui-mode', 'safety.rules.scoped-overrides', 'safety.rules.scope-selector']) delete rulesPage.covers[id];

  /* ================================================================== one rule */
  const ruleOf = (ctx) => findRule(ctx.st, (ctx.params || {}).rid);
  SMX.page({
    id: 'safety/rules/:rid', chapter: 'safety', parent: 'safety/rules',
    title: (ctx) => { const x = ruleOf(ctx); return x ? x.r.action : 'Rule'; },
    nav: (ctx) => { const x = ruleOf(ctx); return x ? x.r.action : 'Rule'; },
    purpose: (ctx) => { const x = ruleOf(ctx); if (!x) return ''; return x.owner ? `A rule that comes with the profile ${ownerName(ctx.st, x.owner)}. It applies only while that profile is in use.` : 'A rule of this project. It applies whichever profile is in use.'; },
    crumbs: (ctx) => { const x = ruleOf(ctx); return x && x.owner ? [['safety', 'Safety & permissions'], [`safety/profile/${enc(x.owner)}`, ownerName(ctx.st, x.owner)]] : [['safety', 'Safety & permissions'], ['safety/rules', 'Rules for each action']]; },
    legacy: [['safety', 'permissions', 'rules', 'permissions']],
    lead: (ctx) => {
      const st = ctx.st, x = ruleOf(ctx);
      keepSettled(st);
      if (!x) return [{ key: 'gone', html: ui.card({ title: 'This rule is no longer there', body: ui.btn({ label: 'Back to the rules', go: 'safety/rules' }) }) }];
      const r = x.r, p = current(st), say = sayDec(r.decision), rid = x.id;
      const wrap = (act, extra, html) => `<span data-smx-do-change="${act}" data-rid="${h(rid)}"${extra}>${html}</span>`;
      const does = { allow: 'it goes ahead without asking', ask: 'it asks you first', deny: 'it is stopped, every time' }[DEC[r.decision] || 'ask'];
      const inProfile = !x.owner && p ? rulesOf(st, p.id).find((y) => same(y.r.action, r.action)) : null;
      const inProject = x.owner ? rulesOf(st, '').find((y) => same(y.r.action, r.action)) : null;
      const usedNow = !x.owner || (p && p.id === x.owner);
      const where = [
        ['Checked', `${x.n === 1 ? 'The only rule' : `Number ${x.k + 1} of ${x.n}`} in ${x.owner ? `${ownerName(st, x.owner)}’s rules` : 'this project’s rules'}. The last rule that matches decides.`],
        x.owner ? ['Right now', usedNow ? `${ownerName(st, x.owner)} is in use, so this rule applies.` : `${ownerName(st, x.owner)} is not in use, so this rule is asleep.`] : null,
        inProfile ? ['Answered first by', `${p.name} has its own rule for “${inProfile.r.action}” (${sayDec(inProfile.r.decision)[0].toLowerCase()}). A profile’s rules are checked first, so this one is not reached while ${p.name} is in use.`] : null,
        inProject ? ['Also a project rule', `This project has a rule for “${inProject.r.action}” (${sayDec(inProject.r.decision)[0].toLowerCase()}). It decides whenever ${ownerName(st, x.owner)} is not in use.`] : null,
        ['Before any rule', 'Protected files and dangerous commands are checked first.']
      ].filter(Boolean);
      return [
        { key: 'summary', html: ui.summary({ icon: 'sliders', tone: say[1] === 'blocked' ? 'blocked' : 'ready', lines: [
          `When the assistant wants to ${ui.b(low(r.action))}, ${h(does)}.`,
          condOf(r) ? `Only when: ${h(condOf(r))}.` : 'It applies always.'
        ] }) },
        { key: 'rule', html: ui.card({ title: 'The rule', body: ui.rows([
          { label: 'The answer', help: 'Ask me first is the safe middle.', control: `<span data-smx-do="safety-rule-answer" data-rid="${h(rid)}">${seg(DEC[r.decision] || 'ask', ANS, { action: 'pm51-noop', label: `Answer for ${r.action}` })}</span>` },
          { label: 'What it is about', help: 'The kind of action, in your own words.', control: wrap('safety-rule-text', ' data-field="action"', input(r.action, { action: 'pm51-noop', placeholder: 'For example: Send external message', label: 'Action' })) },
          { label: 'Only when', help: 'Leave empty and it applies always.', control: wrap('safety-rule-text', ' data-field="condition"', input(condOf(r), { action: 'pm51-noop', placeholder: 'For example: Only inside the project', label: 'Condition' })) },
          { label: 'Belongs to', help: 'A profile’s rules go with it. This project’s rules apply whichever profile is in use.', control: wrap('safety-rule-owner', '', select(x.owner, [['', 'This project (every profile)']].concat(profiles(st).map((q) => [q.id, `${q.name} (only this profile)`])), { action: 'pm51-noop', label: 'Belongs to' })) }
        ]) }) },
        { key: 'where', html: ui.card({ title: 'Where it stands', side: x.n > 1 ? `<span class="smx-order">${ui.btn({ icon: 'up', label: 'Check it earlier', do: 'safety-rule-move', data: { rid, dir: -1 }, disabled: x.k === 0, reason: 'It is already first.' })}${ui.btn({ icon: 'down', label: 'Check it later', do: 'safety-rule-move', data: { rid, dir: 1 }, disabled: x.k === x.n - 1, reason: 'It is already last.' })}</span>` : '', body: ui.facts(where) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'See which rule decides an action', icon: 'search', do: 'safety-why', data: { text: r.action } })}${ui.btn({ label: x.owner ? 'Remove this rule…' : 'Delete this rule…', icon: 'trash', danger: true, do: 'safety-rule-delete', data: { rid } })}</div>` }
      ];
    },
    changes: [
      { was: 'A rule is one line in a list. Changing it means a “More for …” menu (Move up, Move down, Edit, Move to this project’s rules or Attach to a profile…, Delete) and then a four-field dialog.', now: 'A rule has a page: one sentence says what it does, its four parts are changed in place, and moving, re-homing and deleting are ordinary controls with the risky one last.' },
      { was: 'Nothing on a rule says whether another rule covers the same action. “Send external message” is a rule of this project and also a rule of Review-first, with no hint that only one of them is ever reached.', now: '“Where it stands” says where the rule is in its list and names any rule elsewhere that covers the same action, and which of the two decides.' },
      { was: 'In the dialog, “Belongs to” silently decides whether a rule applies to every profile or to one.', now: 'The page says it in its first line, and the choice explains both outcomes.' }
    ]
  });

  /* ================================================================== Protected files & commands */
  const ROOT = '${projectRoot}';
  const placeName = (p) => { const s = String(p || ''); if (s === ROOT || s === `${ROOT}/`) return 'The project folder'; if (s.startsWith(`${ROOT}/`)) return `${s.slice(ROOT.length + 1)} in the project folder`; if (s === '~' || s === '~/') return 'Your home folder'; if (s.startsWith('~/')) return `${s.slice(2)} in your home folder`; return s; };
  const ACCESS = { 'Read and write': 'The assistant may read and change it.', 'Read only': 'The assistant may read it, never change it.', 'Source-control tools only': 'Only the version history tools may touch it.', 'Temporary artifacts only': 'Only for temporary files.', 'Deny direct read': 'The assistant may not even read it.' };
  const accessWords = (f) => ACCESS[f.access] || `${f.access}.`;
  SMX.extend('safety/protected', {
    blurb: (ctx) => { const n = paths(ctx.st).filter((f) => f.status !== 'disabled').length; return `${plural(n, 'protected place')} · secret files ${isOn('safety.protection.security-filter', true) ? 'closed' : 'not protected'} · dangerous commands ${isOn('safety.protection.bash-guard', true) ? 'blocked' : 'not blocked'}`; },
    status: () => (guardsOff().length ? { text: 'A guard is off', tone: 'attention' } : { text: 'Protected', tone: 'ready' }),
    keywords: ['filesafe', 'secret', 'secrets', 'env', 'dangerous', 'rm -rf', 'redact', 'protected path', 'outside the project', 'ssh', 'password'],
    lead: (ctx) => {
      const st = ctx.st, F = paths(st), live = F.filter((f) => f.status !== 'disabled');
      const secrets = isOn('safety.protection.security-filter', true), guard = isOn('safety.protection.bash-guard', true);
      const closed = live.filter((f) => /deny/i.test(f.access)).length;
      return [
        { key: 'summary', html: ui.summary({ icon: 'lock', tone: guardsOff().length ? 'attention' : 'ready', lines: [
          `${secrets ? 'Secret files stay closed' : 'Secret files are not protected'}, and dangerous commands ${guard ? 'are stopped before they run' : 'are not blocked'}.`,
          `${ui.b(plural(live.length, 'place'))} ${live.length === 1 ? 'has' : 'have'} rules of ${live.length === 1 ? 'its' : 'their'} own${closed ? `, ${closed} of them closed completely` : ''}. Outside the project, the assistant ${ui.word(({ allow: 'works without asking', ask: 'asks first', deny: 'is not allowed' })[String(val('safety.protection.external-dir-action'))] || 'asks first', { go: 'safety/protected', reveal: 'safety.protection.external-dir-action' })}.`
        ] }) },
        { key: 'needs', html: ui.needs(guardsOff()) },
        { key: 'places', html: ui.things({ title: 'Protected folders and files', help: 'Each place has its own rule. It holds whichever profile is in use, and it is checked before anything else.', add: { label: 'Protect a folder or file', action: 'pm51-permissions-path-add' },
          items: F.map((f, i) => ({ icon: /deny/i.test(f.access) ? 'lock' : 'folder', name: placeName(f.path), sub: accessWords(f), status: f.status === 'disabled' ? { text: 'Off', tone: 'off' } : f.status === 'attention' ? { text: 'Needs attention', tone: 'attention' } : { text: 'On', tone: 'ready' }, action: 'pm51-permissions-path', data: { index: i } })),
          empty: { icon: 'lock', title: 'No protected places', text: 'Protect a folder to decide what the assistant may read or change there.', fix: { label: 'Protect a folder or file', action: 'pm51-permissions-path-add' } } }) },
        { key: 'check', html: ui.card({ title: 'Check one file or folder', help: 'See what the assistant may do with it. Nothing is touched.', body: `<div class="pm51-perm-check">${input((st.pm51 || {}).permCheckPath || '', { action: 'pm51-permissions-check-input', placeholder: 'For example: ~/.ssh/id_ed25519', label: 'Path to check' })}${ui.btn({ label: 'Check it', icon: 'test', action: 'pm51-permissions-check' })}</div>` }) }
      ];
    },
    sections: [{ key: 'guards', title: 'Always on guard', help: 'These hold whichever profile is in use.', ids: ['safety.protection.security-filter', 'safety.protection.bash-guard', 'safety.protection.external-dir-action', 'safety.protection.redaction-profile'] }],
    more: [
      { key: 'files', title: 'Guarding files', help: 'How strictly changes to files are watched.', ids: ['safety.protection.filesafe-integration', 'safety.protection.file-guard', 'safety.protection.strict-mode', 'safety.protection.governance-unlock', 'safety.protection.write-conflict-detection'] },
      { key: 'commands', title: 'Dangerous commands', help: 'Commands you trust, more to block, and the override.', ids: ['safety.protection.approved-commands', 'safety.protection.custom-patterns-path', 'safety.protection.allow-destructive'] },
      { key: 'outside', title: 'Folders outside the project', ids: ['safety.protection.external-dir-allowlist'] },
      { key: 'secrets', title: 'Hiding secrets in pictures and in proof', help: 'Before a screenshot is shared with the AI, and before proof that work was checked is saved.', ids: ['safety.protection.screenshot-redaction', 'planning.verification.evidence-redaction'] }
    ],
    expert: [
      S('permissions-exceptions', { title: 'Exceptions during checks' }),
      { key: 'inherit', html: (ctx) => ui.card({ title: 'How a place gets its rule', help: 'A file or folder takes the rule of the closest protected folder above it. These are the paths as they are saved.', body: ui.facts(paths(ctx.st).map((f) => [f.path, `${f.inheritance} · ${f.access}${f.status === 'disabled' ? ' · off' : ''}`])) }), count: 0 }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Protected branches are under Source control', go: 'source/rules' }, { label: 'How permissions work', action: 'pm51-permissions-help' }]) }],
    changes: [
      { was: 'Protected places are shown as they are typed: “${projectRoot}”, “${projectRoot}/.git”, “~/.ssh”. A row reads “${projectRoot} ReadyRead and write”.', now: 'Each place has a plain name (“The project folder”, “.ssh in your home folder”) and a sentence for what the assistant may do there. The typed paths are in the place’s own panel and under “For experts”.' },
      { was: '17 setting rows follow the list at equal weight (eleven switches, three dropdowns), from “Protect secret files” to “Extra block list file”, and three more are behind “More options”.', now: 'Four guards a newcomer should know are shown: secret files, dangerous commands, folders outside the project, hiding secrets. The other 13 are grouped under “More options” and “For experts”.' },
      { was: 'Nothing on the tab says that these guards beat every profile and rule; that is one line of the help panel.', now: 'The list’s first line and the guards’ group both say it, and “Which answer wins” on the rules page puts them first.' },
      { was: '“Let dangerous commands through” sits directly under “Block dangerous commands”, the same size, with the warning “Can wipe files” run into its label.', now: 'It is last in its folded group. If it is ever on, the chapter says so under “Needs you”.' }
    ]
  });

  /* ================================================================== Limits for one run */
  const money = (n) => (Number(n) > 0 ? `$${Number(n)}` : '');
  SMX.extend('safety/limits', {
    blurb: () => `One run: ${low(word('ai.usage.max-wall-clock'))}, ${val('ai.usage.max-tool-rounds')} steps, ${money(val('ai.usage.run-spend-budget')) || 'no spending limit'}`,
    keywords: ['limit', 'limits', 'timeout', 'runaway', 'loop', 'stuck', 'budget per run', 'steps', 'retries', 'spending per run'],
    lead: (ctx) => {
      const st = ctx.st; const spend = money(val('ai.usage.run-spend-budget')); const act = String(val('safety.approvals.doom-loop-action') || 'ask');
      return [
        { key: 'summary', html: ui.summary({ icon: 'clock', tone: 'ready', lines: [
          `One run may take up to ${ui.word(low(word('ai.usage.max-wall-clock')), { go: 'safety/limits', reveal: 'ai.usage.max-wall-clock' })} and ${ui.word(`${val('ai.usage.max-tool-rounds')} steps`, { go: 'safety/limits', reveal: 'ai.usage.max-tool-rounds' })}, and may spend ${ui.word(spend ? `up to ${spend}` : 'any amount', { go: 'safety/limits', reveal: 'ai.usage.run-spend-budget' })}. At a limit it stops and asks you.`,
          act === 'allow' ? 'If the assistant repeats itself, it is left to carry on.' : `If the assistant repeats the same step ${ui.word(`${val('safety.approvals.doom-loop-threshold')} times`, { go: 'safety/limits', reveal: 'safety.approvals.doom-loop-threshold' })}, ${act === 'deny' ? 'the step is blocked' : 'it stops and asks you'}.`
        ] }) }
      ];
    },
    sections: [
      { key: 'run', title: 'One run may use at most', help: 'When a run reaches a limit it stops and asks you. 0 means no limit.', ids: ['ai.usage.run-spend-budget', 'ai.usage.max-wall-clock', 'ai.usage.max-tool-rounds'] },
      { key: 'stuck', title: 'When it gets stuck', help: 'A run that keeps repeating itself is stopped before it wastes time and money.', ids: ['safety.approvals.doom-loop-action', 'safety.approvals.doom-loop-threshold'] },
      { key: 'elsewhere', html: () => { const monthly = money(val('ai.usage.monthly-spend-limit')); return ui.things({ title: 'Limits that are set somewhere else', help: 'Each of these belongs to one thing, so it is set where that thing is.', items: [
          { icon: 'wallet', name: 'Money for a whole month', sub: monthly ? `At most ${monthly} a month` : 'No monthly limit set', go: 'ai/spending' },
          { icon: 'swap', name: 'When an AI account runs out', sub: 'Move to the next account, or stop and ask', go: 'ai/limits' },
          { icon: 'globe', name: 'What web research may spend', sub: 'Counted in the search services’ own credits', go: 'ai/web' },
          { icon: 'target', name: 'How a Goal recovers and retries', sub: 'For long work the assistant keeps doing by itself', go: 'planning/recovery' },
          { icon: 'clock', name: 'How long things are kept', sub: 'Chats, records and proof of work', go: 'keeping/cleanup' }
        ] }); } }
    ],
    more: [
      { key: 'failures', title: 'Giving up after failures', help: 'How many times something may fail before the run stops.', ids: ['safety.approvals.max-shell-failures', 'safety.approvals.max-write-thrash', 'safety.approvals.max-retryable-errors'] },
      { key: 'goals', title: 'Goals, helpers and single steps', help: 'A Goal is long work the assistant keeps doing by itself. “Automatic” uses the Goal’s own limit.', ids: ['ai.usage.max-goal-turns', 'ai.usage.subagent-wave-cost', 'ai.usage.node-timeout'] }
    ],
    expert: [
      { key: 'tokens', title: 'Counted in tokens', help: 'A token is the unit AI providers count and bill by: about four characters of text.', ids: ['memory.limits.run-token-budget', 'memory.limits.goal-token-budget'] },
      { key: 'style', title: 'How loops are spotted', ids: ['safety.approvals.loop-detection-mode'] }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Which model does the work', go: 'ai/models' }, { label: 'See what was used: open the Usage page', do: 'open-usage' }]) }],
    changes: [
      { was: 'Limits is the last of five Permissions tabs: 14 rows, three of them behind “More options”. Limits on money, time and work are also set under Providers › Limits & switching, Providers › Usage & budgets, Goals and Web › Limits & saving, and none of those places points to another.', now: 'This page holds every limit for one run and opens with what they add up to, in a sentence. A list names the five other places, with what each is set to.' },
      { was: 'The numbers come without context: “Steps per agent 200”, “Tokens one run may use 80000”, “Rounds before a Goal checks in: Automatic”.', now: 'Money, time and steps come first, under “One run may use at most”. The two budgets counted in tokens are under “For experts”, with a line saying what a token is.' },
      { was: '“Stop runaway work” lists five thresholds before the limits a person would set first.', now: 'The two that matter (what happens, and after how many repeats) are shown as “When it gets stuck”. The three failure counts are folded.' }
    ]
  });

  /* search: profiles, rules and protected places, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => [
    ...profiles(st).map((p) => ({ title: p.name, sub: 'Safety & permissions › profile', route: `safety/profile/${enc(p.id)}` })),
    ...rulesOf(st, '').map((x) => ({ title: x.r.action, sub: 'Safety & permissions › Rules for each action', route: `safety/rules/${enc(x.id)}` })),
    ...profiles(st).flatMap((p) => rulesOf(st, p.id).map((x) => ({ title: x.r.action, sub: `Safety & permissions › ${p.name} › rule`, route: `safety/rules/${enc(x.id)}` }))),
    ...paths(st).map((f) => ({ title: placeName(f.path), sub: 'Safety & permissions › Protected files & commands', route: 'safety/protected' }))
  ]);
})(window);
