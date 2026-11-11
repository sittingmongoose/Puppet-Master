/* Settings managers, rethought (Fable 5.2): the chapter "Health & updates".
   Today these are five pages of the System chapter (Settings Transfer, Readiness & Doctor, App Updates, Advanced
   Settings) and one of Projects & Sync (All Project Settings). Here:
   - Checkup answers "is everything working?" in a sentence, lists what needs the person with one button each, and
     shows the seven areas it looked at as a short list; an area has its own page with its findings;
   - Updates says which version runs, whether one is waiting and on which computers;
   - Copy settings is three guided tasks, with what never moves said before the first click;
   - Setup & tour holds the first-time setup, the tour and what a fresh start shows;
   - Privacy & troubleshooting is what is shared, extra detail for hunting a problem, and starting over;
   - Every setting, as a list, is the expert's way in: one searchable list that opens each setting at its new home.
   Every guided step, check and panel is PMConcept7's own action. The one exception is said where it happens: the
   Recovery Kit test, whose protected handoff fails in PMConcept7 with an error. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec, D = SMX.drawn;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const val = SMX.val, plural = d.plural;
  const Doc = W.document;

  /* ------------------------------------------------------------------ small helpers */
  const isOn = (id, dflt) => { if (!SMX.has(id)) return !!dflt; const v = val(id); return !!v && v !== 'off'; };
  const word = (id) => { try { return String(kit().valueLabel(id, val(id))); } catch (e) { return String(val(id) == null ? '' : val(id)); } };
  const low = (s) => String(s).charAt(0).toLowerCase() + String(s).slice(1);
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const steps = (items) => { try { return kit().steps(items); } catch (e) { return ''; } };
  const serviceText = (s) => { try { return kit().serviceText(s); } catch (e) { return String(s || ''); } };
  const enc = encodeURIComponent;
  const flags = () => SMX.local.flags;
  /* a row that opens something and also has its own buttons (see safety.css for the same shape) */
  const openAttrs = (it) => (it.go ? ` data-smx-go="${h(it.go)}"` : it.action ? ` data-action="${h(it.action)}"${SMX.data(it.data)}` : '');
  const splitRow = (it) => `<div class="smx-thing smx-split"><button type="button" class="smx-split-open"${openAttrs(it)}><span class="smx-thing-avatar">${SMX.icon(it.icon)}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(it.name)}${it.tag ? ` <span class="smx-thing-tag">${h(it.tag)}</span>` : ''}</span>${it.sub ? `<span class="smx-thing-sub">${h(it.sub)}</span>` : ''}</span>${it.status ? `<span class="smx-split-status">${ui.status(it.status.text, it.status.tone)}</span>` : ''}<span class="smx-thing-go">${SMX.icon('go')}</span></button>${it.side ? `<span class="smx-thing-end">${it.side}</span>` : ''}</div>`;
  const splitThings = ({ title, help, side, items }) => ui.card({ title, help, side, cls: 'smx-things-card', body: `<div class="smx-things">${items.map(splitRow).join('')}</div>` });

  /* Four rows PMConcept7 draws by hand on Readiness & Doctor and on Advanced Settings are settings like any other.
     They are named here so they count, can be found by search, and appear in "Everything that moved". */
  SMX.handIds = SMX.handIds || []; SMX.handHomes = SMX.handHomes || {};
  for (const [id, home] of [['onboarding', ['doctor', 'Setup and tour']], ['teacher', ['doctor', 'Setup and tour']], ['feature-flags', ['advanced', 'Sharing with the makers']], ['developer-mode', ['advanced', 'Sharing with the makers']]]) { if (!SMX.handIds.includes(id)) SMX.handIds.push(id); if (!SMX.handHomes[id]) SMX.handHomes[id] = home; }

  /* ================================================================== the checkup: what it found, in plain words */
  const groups = (st) => (((st.pm51 || {}).doctor || {}).groups) || [];
  const findings = (st) => groups(st).flatMap((g) => (g.findings || []).map((f) => ({ g, f, key: `${g.id}:${f.id}` })));
  const STATE = { Ready: ['Working', 'ready'], 'Needs attention': ['Needs you', 'attention'], 'Not set up': ['Not set up', 'off'], Unavailable: ['Not available', 'off'], Checking: ['Checking', 'info'] };
  const stateOf = (f) => STATE[f.state] || [String(f.state || ''), 'off'];
  const AREAS = {
    server: ['nas', 'Your Server', 'The computer that keeps your projects, and whether this device can reach it.', 'computers/list', 'Computers'],
    devices: ['phone', 'Devices and remote access', 'Pairing a device, and getting in when you are away from home.', 'computers/devices', 'Paired devices'],
    ai: ['brain', 'AI providers', 'Whether the AI that does the work can be reached and is signed in.', 'ai', 'AI providers'],
    code: ['branch', 'Code and version history', 'Git, Jujutsu and the code services that hold a copy online.', 'source', 'Source control'],
    backups: ['archive', 'Backups and recovery', 'Whether your work could be brought back if a computer were lost.', 'keeping', 'Backups & history'],
    updates: ['download', 'Updates', 'Puppet Master itself and the lists it keeps current.', 'system/updates', 'Updates'],
    optional: ['puzzle', 'Optional extras', 'Things you can turn on later. Off by choice counts as working.', 'code/containers', 'Containers']
  };
  const areaOf = (g) => AREAS[g.id] || ['heart', g.title, g.help || '', 'system', 'Checkup'];
  /* what each finding is called when it needs someone, what it costs, and the one thing to do about it */
  const FIX = {
    'devices:pairing': { title: 'The pairing code has expired', detail: 'A new device cannot be paired until you make a new code.', label: 'Make a new code', go: 'computers/devices', action: 'pm51-servers-pair' },
    'devices:tailscale': { title: 'Tailscale is not set up', detail: 'You can reach your Server only on your home network.', label: 'Set up a way in', go: 'computers/away' },
    'ai:antigravity': { title: 'Google Antigravity is signed out', detail: 'Work meant for it falls back to another AI provider.', label: 'Sign in again', go: 'ai/provider/antigravity', action: 'pm51-providers-signin', data: { provider: 'antigravity' } },
    'code:push': { title: 'GitHub cannot receive your changes yet', detail: 'Changes can be read from GitHub but not sent to it.', label: 'Set up sending', go: 'source' },
    'backups:kit': { title: 'The Recovery Kit has never been tested', detail: 'You have a kit, but it has never been proven to unlock a backup.', label: 'Test the Recovery Kit', do: 'system-kit-test' },
    'updates:app': { title: 'An update is ready', detail: 'Optional. Nothing is broken.', label: 'See the update', go: 'system/updates' },
    'optional:containers': { title: 'No container engine on this computer', detail: 'Container work runs on your Server instead. Nothing is broken.', label: 'See how to set one up', action: 'pm51-doctor-fix', data: { gid: 'optional', fid: 'containers' } },
    'optional:gpu': { title: 'No graphics card to use here', detail: 'Making pictures and video uses your Server instead. Nothing to do.' }
  };
  const fixOf = (x) => { const k = FIX[x.key]; if (k) return k; return { title: serviceText(x.f.title), detail: x.f.impact || '', label: x.f.fix ? String(x.f.fix).charAt(0) + String(x.f.fix).slice(1).toLowerCase() : '', action: x.f.fix ? 'pm51-doctor-fix' : '', data: { gid: x.g.id, fid: x.f.id } }; };
  const fixBtn = (x, o) => { const k = fixOf(x); if (!k.label || x.f.state === 'Checking' || (x.f.state === 'Ready' && x.key !== 'updates:app')) return null; return Object.assign({ label: k.label, do: 'system-fix', data: { key: x.key } }, o || {}); };
  const nameOf = (x) => (x.f.state === 'Ready' ? serviceText(x.f.title) : fixOf(x).title);
  const counts = (st) => { const c = { Ready: 0, 'Needs attention': 0, 'Not set up': 0, Unavailable: 0, Checking: 0 }; for (const x of findings(st)) c[x.f.state] = (c[x.f.state] || 0) + 1; return c; };
  const checking = (st) => findings(st).some((x) => x.f.state === 'Checking');
  const lastCheck = (st) => String((st.pm51 || {}).doctorLastCheck || '2 min ago');
  const needy = (st) => findings(st).filter((x) => x.f.state === 'Needs attention');
  const needLine = (x) => { const k = fixOf(x); return { title: k.title, detail: k.detail, fix: fixBtn(x) }; };

  /* One fix for every finding. PMConcept7 sends each fix to its old manager and promises to check again on return; the
     same promise is kept here: the finding's area is checked again the next time the checkup is shown. */
  SMX.act('system-fix', (el) => {
    const key = el.getAttribute('data-key') || ''; const st = SMX.fresh(); const x = findings(st).find((y) => y.key === key); if (!x) return;
    const k = fixOf(x);
    if (k.do) { const f = SMX.acts[k.do]; if (f) f(el); return; }
    if (k.go) { flags().fixing = key; SMX.toast('Come back to the checkup when you are done', `“${k.title}” is checked again when you return.`, 'info'); SMX.go(k.go); }
    if (k.action) SMX.run(k.action, k.data || {});
  });
  const recheckOnReturn = () => { const key = flags().fixing; if (!key) return; flags().fixing = ''; const gid = key.split(':')[0]; W.setTimeout(() => SMX.run('pm51-doctor-check', { gid }), 250); };

  /* The Recovery Kit test. PMConcept7's own button (pm51-backup-kit-test) stops with "Cannot read properties of null
     (reading 'client')" when its protected handoff asks who is asking. When that question can be answered, the real flow
     runs; when it cannot, this shows the first screen the flow is written to show, and where it would wait. */
  const kitSteps = (st) => { const last = (((st.backup || {}).history) || [])[0] || {}; return [{ title: 'Kit file readable', desc: 'Saved copy found' }, { title: 'Key opens the latest backup', desc: [last.time, last.size].filter(Boolean).join(' · ') || 'The newest backup' }, { title: 'Trial restore in a scratch folder', desc: 'A few files are read back and compared' }]; };
  const kitPanel = (asked) => {
    const st = SMX.fresh();
    let body = '';
    try {
      body = kit().panelSection('What happens', kit().steps(kitSteps(st).map((s) => ({ title: s.title, desc: s.desc, status: 'Waiting', tone: 'info' }))))
        + kit().panelSection('Confirm', kit().btn({ label: 'Confirm it’s you', small: true, icon: 'key', callback: () => kitPanel(true) }))
        + ui.note(asked ? 'The protected handoff is not available in this preview, so nothing is tested yet. Try again when your Server can answer.' : 'The kit is shown only to you, once, on this device. Nothing is tested until the protected handoff answers.');
      kit().panel({ title: 'Test the Recovery Kit', subtitle: 'Proves the saved kit can open a backup. The kit itself stays in your hands.', pill: ui.status(asked ? 'Waiting for the protected handoff' : 'Protected handoff', 'info'), body, primaryLabel: 'Done', onPrimary: () => true });
    } catch (e) { SMX.toast('Test the Recovery Kit', 'The protected handoff is not available in this preview, so nothing is tested yet.', 'info'); }
  };
  SMX.act('system-kit-test', () => {
    let works = true;
    try { const O = W.O55 && W.O55.ownerResults; const p = W.PM7_SETTINGS_TOME && W.PM7_SETTINGS_TOME.project(); if (O && O.protectedContext) O.protectedContext(p && p.id); } catch (e) { works = false; }
    if (works) SMX.run('pm51-backup-kit-test'); else kitPanel(false);
  });

  /* what needs you, for Settings Home: a finding another chapter already reports is left to that chapter */
  let asking = false;
  const WORDS = { 'devices:pairing': /pair/i, 'ai:antigravity': /antigravity/i, 'code:push': /push|github/i, 'backups:kit': /recovery kit/i };
  const homeNeeds = (st) => {
    if (asking) return [];
    asking = true; let others = [];
    try { for (const f of (SMX.needSources || [])) { if (f === homeNeeds) continue; try { others = others.concat(f(st) || []); } catch (e) { /* a chapter that fails adds nothing */ } } } finally { asking = false; }
    return needy(st).filter((x) => { const re = WORDS[x.key]; return !(re && others.some((n) => re.test(`${n.title || ''} ${n.detail || ''}`))); }).map(needLine);
  };
  (SMX.needSources = SMX.needSources || []).push(homeNeeds);
  const U = (st) => st.updates || { currentVersion: '', availableVersion: '', history: [] };
  const hasUpdate = (st) => { const u = U(st); return !!u.availableVersion && u.availableVersion !== u.currentVersion; };
  const chapter = SMX.chapters.find((c) => c.id === 'system');
  if (chapter && !chapter.status) chapter.status = (ctx) => { const n = needy(ctx.st).length; return n ? { tone: 'attention', text: `${n} ${n === 1 ? 'needs' : 'need'} you` } : hasUpdate(ctx.st) ? { tone: 'info', text: 'An update is ready' } : { tone: 'ready', text: 'Working' }; };

  const areaWorst = (g) => { const fs = g.findings || []; const n = fs.filter((f) => f.state === 'Needs attention').length; if (fs.some((f) => f.state === 'Checking')) return { text: 'Checking', tone: 'info' }; if (n) return { text: `${n} ${n === 1 ? 'needs' : 'need'} you`, tone: 'attention' }; const s = fs.filter((f) => f.state === 'Not set up').length; if (s) return { text: `${s} not set up`, tone: 'off' }; return { text: 'Working', tone: 'ready' }; };
  const areaSub = (g) => { const open = (g.findings || []).filter((f) => f.state !== 'Ready'); return open.length ? open.map((f) => nameOf({ g, f, key: `${g.id}:${f.id}` })).join(' · ') : (g.findings || []).map((f) => serviceText(f.title)).join(' · '); };
  const FREQ = { Hourly: 'every hour', Daily: 'every day', Weekly: 'every week' };

  SMX.extend('system', {
    noPagesList: true,
    keywords: ['doctor', 'readiness', 'checkup', 'health', 'diagnostics', 'problem', 'broken', 'not working', 'support', 'recovery kit'],
    lead: (ctx) => {
      const st = ctx.st, c = counts(st), all = findings(st), busy = checking(st);
      recheckOnReturn();
      const auto = isOn('system.health.auto-run', true) && FREQ[String(val('system.health.check-frequency'))];
      return [
        { key: 'summary', html: ui.summary({ icon: 'heart', tone: c['Needs attention'] ? 'attention' : 'ready', lines: [
          busy ? 'A checkup is running…' : c['Needs attention'] ? `Puppet Master works. The last checkup found ${ui.b(plural(c['Needs attention'], 'thing'))} that ${c['Needs attention'] === 1 ? 'needs' : 'need'} you.` : 'Everything the last checkup looked at is working.',
          `${c.Ready} of ${all.length} checks passed${c['Not set up'] ? `, ${c['Not set up']} ${c['Not set up'] === 1 ? 'is' : 'are'} optional and not set up` : ''}${c.Unavailable ? `, ${c.Unavailable} ${c.Unavailable === 1 ? 'is' : 'are'} not available on this computer` : ''}. Last checked ${h(low(lastCheck(st)))}. ${auto ? `A checkup runs by itself ${ui.word(auto, { go: 'system', reveal: 'system.health.check-frequency' })}.` : `Checkups run ${ui.word('only when you start one', { go: 'system', reveal: 'system.health.auto-run' })}.`}`
        ], side: ui.btn({ label: busy ? 'Checking…' : 'Run a checkup', icon: 'refresh', primary: true, small: false, action: 'run-setting-action', data: { setting: 'system.health.run-doctor', settingId: 'system.health.run-doctor' }, disabled: busy, reason: 'A checkup is running.' }) }) },
        { key: 'needs', html: ui.needs(needy(st).map(needLine)) },
        { key: 'areas', html: ui.things({ title: 'What the checkup looked at', help: 'Seven areas. Open one to see each check, when it ran and what to do.',
          items: groups(st).map((g) => { const a = areaOf(g); return { icon: a[0], name: a[1], sub: areaSub(g), status: areaWorst(g), go: `system/checkup/${enc(g.id)}` }; }),
          empty: { icon: 'heart', title: 'No checkup yet', text: 'Run one to see whether everything Puppet Master depends on is working.' } }) }
      ];
    },
    sections: [{ key: 'auto', title: 'Checking by itself', help: 'How often a checkup runs without you, and what it looks at.', ids: ['system.health.auto-run', 'system.health.check-frequency', 'system.health.check-scope', 'system.advanced.version-handshake'] }],
    expert: [
      S('doctor-tools', { title: 'For support', help: 'Details a support person may ask for. Secrets are removed.' }),
      { key: 'cache', html: (ctx) => { const st = ctx.st; return ui.card({ title: 'What the last checkup kept', body: ui.facts([['Last check', (st.pm51 || {}).doctorLastCheck || 'Loaded from the saved results · 2 min ago'], ['Results kept', findings(st).length], ['Oldest result', '2 h ago (Code and version history)'], ['Age limit', 'Results older than a day are marked for another check']]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Save the report as a file', icon: 'download', action: 'pm51-doctor-export' })}</div>` }); }, count: 0 }
    ],
    expertLabel: 'For support', expertHelp: 'Details to send when you ask for help',
    tail: (ctx) => [{ key: 'pages', html: ui.pages('system', ctx, { title: 'Also in this chapter' }) }],
    changes: [
      { was: 'Readiness & Doctor opens on four counters (Ready 7, Needs attention 4, Not set up 2, Unavailable 1) and then 14 findings in 7 sections: 2,674 px before the first setting, 46 buttons.', now: 'It opens on the answer in a sentence, then only what needs you: four lines, each with the one button that deals with it. The seven areas are a short list; each opens on its own page.' },
      { was: 'A finding is opened with a small chevron button whose centre is covered by the title bar; the audit’s driver had to press it by script (“Open Pairing code expired”, “Open Recovery Kit not tested”).', now: 'On an area’s page the whole row of a finding opens it.' },
      { was: '“Test Recovery Kit” stops with an error: “Control could not complete / Pm51 Backup Kit Test: Cannot read properties of null (reading ’client’)”. The fix button on Doctor only leads to the page where that button is.', now: 'The finding has its button here and on Settings Home. This concept shows what the flow is written to do: a protected handoff opens, lists its three steps and waits for you to confirm it is you. PMConcept7’s own button is left as it is; the defect is reported.' },
      { was: 'Every fix sends you to another manager with a toast, “Come back to Doctor when done”. Fix buttons are named four ways (“Create New Code”, “Set Up”, “Sign In Again”, “Open Update…”).', now: 'Each line says what is wrong and what it costs you, and its button says what it does (“Make a new code”, “Sign in again”). The area is checked again when you come back.' },
      { was: 'Doctor also carries “What you see around the app” (3 switches) and “Setup and tour” (5 rows), which are not findings.', now: 'Setup and the tour have their own page in this chapter. The three switches are under Chat & assistant › Help & explanations.' },
      { was: '“Check the app’s parts match at startup” is on Advanced Settings.', now: 'It is here, with the other automatic checks.' },
      { was: 'Under “More options” two buttons, “Collect support details” and “Copy support details”, do the same thing: both put the same summary on the clipboard and show the same message.', now: 'One button, “Collect support details”, and “Save the report as a file” beside the facts about the last checkup.' }
    ]
  });

  /* ------------------------------------------------------------------ one area of the checkup */
  const groupOf = (ctx) => groups(ctx.st).find((g) => g.id === (ctx.params || {}).gid) || null;
  SMX.page({
    id: 'system/checkup/:gid', chapter: 'system', parent: 'system',
    title: (ctx) => { const g = groupOf(ctx); return g ? areaOf(g)[1] : 'Checkup'; },
    nav: (ctx) => { const g = groupOf(ctx); return g ? areaOf(g)[1] : 'Checkup'; },
    purpose: (ctx) => { const g = groupOf(ctx); return g ? areaOf(g)[2] : ''; },
    legacy: [['system', 'doctor']],
    headSide: (ctx) => { const g = groupOf(ctx); if (!g) return ''; const busy = (g.findings || []).some((f) => f.state === 'Checking'); return ui.btn({ label: busy ? 'Checking…' : 'Check this again', icon: 'refresh', action: 'pm51-doctor-check', data: { gid: g.id }, disabled: busy, reason: 'This area is being checked.' }); },
    lead: (ctx) => {
      const st = ctx.st, g = groupOf(ctx);
      if (!g) return [{ key: 'gone', html: ui.card({ title: 'This part of the checkup is not there', body: ui.btn({ label: 'Back to the checkup', go: 'system' }) }) }];
      recheckOnReturn();
      const a = areaOf(g), w = areaWorst(g), list = (g.findings || []).map((f) => ({ g, f, key: `${g.id}:${f.id}` }));
      const ok = list.filter((x) => x.f.state === 'Ready').length;
      return [
        { key: 'summary', html: ui.summary({ icon: a[0], tone: w.tone === 'off' ? 'info' : w.tone, lines: [
          ok === list.length ? `Everything here works: ${ui.b(plural(list.length, 'check'))} passed.` : `${ui.b(`${ok} of ${plural(list.length, 'check')}`)} passed.`,
          `This is managed under ${ui.word(a[4], { go: a[3] })}.`
        ] }) },
        { key: 'findings', html: splitThings({ title: 'What was checked', help: 'Open a line for what it means, what to do, and the details behind it.',
          items: list.map((x) => { const s = stateOf(x.f), b = fixBtn(x); return { icon: x.f.state === 'Ready' ? 'check' : x.f.state === 'Needs attention' ? 'alert' : 'info', name: nameOf(x), sub: `${x.f.state === 'Ready' ? '' : `${fixOf(x).detail} `}Checked ${low(String(x.f.checked || ''))}.`, status: { text: s[0], tone: s[1] }, side: b ? ui.btn(b) : '', action: 'pm51-doctor-open', data: { gid: g.id, fid: x.f.id } }; }) }) }
      ];
    },
    changes: [
      { was: 'All 14 findings of all seven areas are on one page, each with a “checked 5 min ago” note, up to two buttons and a chevron.', now: 'An area has a page: its checks as a list, a sentence on each one that is not working, one “Check this again”, and a link to where the area is managed.' },
      { was: 'A finding’s state is one of “Ready”, “Needs attention”, “Not set up”, “Unavailable”; “GPU Unavailable” is drawn in red although nothing can or should be done.', now: 'The words are “Working”, “Needs you”, “Not set up” and “Not available”, and only “Needs you” is marked as needing attention.' }
    ]
  });

  /* ================================================================== Updates */
  const X = (st) => (st.pm51 || {}).updates || {};
  const RESULT = { Current: ['Running now', 'ready'], 'Available for rollback': ['Can go back to it', 'info'], 'Rolled forward': ['Replaced', 'off'] };
  SMX.extend('system/updates', {
    blurb: (ctx) => { const u = U(ctx.st); return hasUpdate(ctx.st) ? `Version ${u.availableVersion} is ready to install · ${u.currentVersion} is running` : `Version ${u.currentVersion} is running · nothing newer`; },
    status: (ctx) => (hasUpdate(ctx.st) ? { text: 'An update is ready', tone: 'info' } : { text: 'Up to date', tone: 'ready' }),
    keywords: ['update', 'version', 'release', 'channel', 'roll back', 'go back', 'install', 'release notes', 'catalog', 'model list'],
    lead: (ctx) => {
      const st = ctx.st, u = U(st), x = X(st), up = hasUpdate(st), servers = d.sp(st).servers || [];
      const where = (x.appliesTo || []).length ? x.appliesTo : servers.map((s) => s.name);
      const autoOn = isOn('system.advanced.auto-update', true);
      const notes = ui.word(up ? `See what is new in ${u.availableVersion}` : 'Read the release notes', { action: 'pm7-typed-consumer', data: { consumerKind: 'local', uiActionId: 'ui.update.app.open_release_notes', availability: 'concept_local_controller_available', disabledReason: 'none', productionHandlerStatus: 'handler_unavailable', canonicalContractStatus: 'canonical_static_contract_present', conceptSimulationOnly: 'true', nativeBinding: 'false', exactReturn: 'initiating_route_focus_identity_currentness', eventRecord: 'not_emitted', runtimeReceipt: 'not_issued', productionMutationDispatched: 'false', targetId: 'current_fixture' } });
      return [
        { key: 'summary', html: ui.summary({ icon: 'download', tone: 'ready', lines: [
          up ? `Puppet Master ${ui.b(u.currentVersion)} is running. Version ${ui.b(u.availableVersion)} is ready to install. ${notes}` : `Puppet Master ${ui.b(u.currentVersion)} is running, and nothing newer is out. ${notes}`,
          `An update goes to ${where.length ? `${where.map(h).join(' and ')}: ` : ''}${ui.word('every computer', { go: 'computers/list' })} that runs Puppet Master for this project, so they always match. Last looked ${h(low(String(u.lastCheck || 'not yet')))}.`
        ], side: (up ? ui.btn({ label: 'Install and restart…', icon: 'download', primary: true, small: false, action: 'pm51-updates-install' }) : '') + ui.btn({ label: 'Look for updates now', icon: 'refresh', action: 'pm51-updates-check', data: { commandId: 'cmd.update.app.check' } }) }) },
        { key: 'computers', html: ui.things({ title: 'The version on each computer', help: 'Computers are added and removed under Computers & remote access.',
          items: servers.map((s) => ({ icon: s.role === 'This computer' ? 'laptop' : 'nas', name: s.name, sub: `Version ${s.version}`, status: s.updateReady ? { text: 'Update ready', tone: 'info' } : { text: 'Up to date', tone: 'ready' }, go: `computers/list/${enc(s.id)}` })),
          empty: { icon: 'computer', title: 'Only this computer', text: `It runs version ${u.currentVersion}.` } }) },
        { key: 'how', html: ui.card({ title: 'How updates arrive', body: ui.rows([
          { label: 'Look for updates automatically', help: 'You can still look at any time.', covers: 'system.advanced.auto-update', control: ui.toggle('system.advanced.auto-update', { label: 'Look for updates automatically' }) },
          autoOn ? { label: 'Also install by itself when nothing is running', help: 'Otherwise you are asked before anything is installed.', control: toggle(!!u.automatic, { action: 'pm51-updates-auto', data: { commandId: 'cmd.update.app.automatic.set_enabled' }, label: 'Also install by itself when nothing is running' }) } : null,
          { label: 'When an update needs a restart', help: 'Work that is running pauses and carries on after the restart.', control: select(u.restartPolicy || 'Wait until idle', [['Wait until idle', 'Wait until nothing is running'], ['Ask me first', 'Ask me first'], ['Right away', 'Restart right away']], { action: 'pm51-updates-restart', label: 'When an update needs a restart' }) }
        ]) }) },
        { key: 'lists', html: ui.card({ title: 'Lists it keeps current', help: 'Which AI models exist, the free models, and the help texts. These refresh without a restart.', side: ui.btn({ label: 'Refresh the lists now', icon: 'refresh', action: 'pm51-updates-catalogs' }), body: ui.rows([{ label: 'Keep these lists current', help: 'Templates, personas and presets come the same way.', covers: 'system.advanced.catalog-updates', control: ui.toggle('system.advanced.catalog-updates', { label: 'Keep content up to date' }) }].concat((x.catalogs || []).map(([name, status]) => { const onNow = isOn('system.advanced.catalog-updates', true); const parts = String(status).split(' · '); return { label: name, value: onNow ? `Refreshed ${parts[1] || ''}`.trim() : 'Not kept current', status: ui.status(onNow ? parts[0] : 'Off', onNow ? 'ready' : 'off') }; }))) }) },
        { key: 'history', html: splitThings({ title: 'Versions you have had', help: 'Before each install the version in use is kept, so you can go back to it.',
          items: (u.history || []).map((v, i) => { const r = RESULT[v.result] || [v.result, 'off']; return { icon: 'download', name: v.version, sub: [`Installed ${v.installed}`, v.notes].filter(Boolean).join(' · '), status: { text: r[0], tone: r[1] }, side: v.result === 'Available for rollback' ? ui.btn({ label: `Go back to ${v.version}…`, icon: 'restore', action: 'pm51-updates-rollback', data: { index: i, commandId: 'cmd.update.app.rollback' } }) : '', action: 'pm51-updates-details', data: { index: i, uiActionId: 'ui.update.app.open_details' } }; }) }) }
      ];
    },
    more: [
      S('updates-settings', { title: 'How often and which releases' }),
      { key: 'install', html: (ctx) => { const u = U(ctx.st); return ui.card({ title: 'Installing', body: ui.rows([{ label: 'Skip versions with known problems', help: 'Waits for the fixed release instead.', control: toggle(u.skipKnownBad !== false, { action: 'pm51-updates-skipbad', label: 'Skip versions with known problems' }) }, { label: 'Updates come from', value: u.source || 'GitHub Releases' }]) }); }, count: 1 }
    ],
    expert: [{ key: 'tech', html: () => { const c = (id, label) => ui.btn({ label, action: 'pm7-typed-consumer', data: { consumerKind: 'local', uiActionId: id, availability: 'concept_local_controller_available', disabledReason: 'none', productionHandlerStatus: 'handler_unavailable', canonicalContractStatus: 'canonical_static_contract_present', conceptSimulationOnly: 'true', nativeBinding: 'false', exactReturn: 'initiating_route_focus_identity_currentness', eventRecord: 'not_emitted', runtimeReceipt: 'not_issued', productionMutationDispatched: 'false', targetId: 'current_fixture' } });
      return ui.card({ title: 'Technical details', body: ui.facts([['Signed releases', 'Every download is checked against the publisher’s signature before it is installed'], ['Going back', 'The version in use is kept before each install'], ['Conversions', 'Stored data and settings are converted during an install']]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Check that updating works', icon: 'test', action: 'pm51-updates-diagnostics' })}${c('ui.update.app.open_logs', 'Update logs')}${c('ui.update.content.open_details', 'Details of the list updates')}</div>` }); }, count: 0 }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How updates work', action: 'pm51-updates-help' }, { label: 'Put the update choices back to how they came…', action: 'pm51-updates-reset' }]) }],
    changes: [
      { was: 'App Updates opens on a section named “Puppet Master” with six rows of equal weight (two switches, “Installed version”, “Available”, “Last check”, “Applies to”); “Install & restart” is the control of the fourth row.', now: 'Two sentences say which version runs, whether one is waiting and which computers get it. “Install and restart” is the main button of the page.' },
      { was: 'Which computer runs which version is a pair of text lines inside “More options” (“Versions per server”), and the same fact is repeated on each server’s detail.', now: 'It is a list on the page, and each computer opens its own page in Computers & remote access, where computers are managed.' },
      { was: '“Restore point” means three things in Settings: a kept copy of settings (Settings Transfer), a backup to restore from (Backup & Restore) and the previous version of the app (here). History offers “Roll back”.', now: 'This page says what happens in its own words: the version in use is kept, and you can “go back to” it. No “restore point” here.' },
      { was: '“Release notes” is a button at the bottom of “More options › Technical details”, next to “Update logs”.', now: '“See what is new in 0.8.1” is a link in the first sentence, next to the version it is about. Logs stay with the technical details.' },
      { was: 'When an update restarts the app (“Restart: Wait until idle”) is under “More options”, though it decides whether work is interrupted.', now: 'It is on the page, worded as a question: “When an update needs a restart”.' }
    ]
  });

  /* ================================================================== Copy settings */
  const history = (st) => (Array.isArray(st.settingsTransferHistory) ? st.settingsTransferHistory : []);
  const KINDS = [['Appearance & workspace', 'Appearance & input'], ['Assistant chat', 'Appearance & input'], ['Providers, accounts, models & routing', 'AI providers & accounts · Model routing'], ['Planning & Goals', 'Goals & personas'], ['Orchestrator & automation', 'Goals & personas'], ['Tools & integrations', 'Source control · Project & sync'], ['Testing, browser & devices', 'Testing profiles'], ['Permissions & security', 'Permissions'], ['Memory, retention & history', 'Context & memory behavior'], ['Notifications, usage & budgets', 'Notifications & sounds']];
  const tidy = (s) => String(s || '').replace(/concept fixture/gi, 'example data').replace(/Detached snapshot · /i, '').replace(/rollback not created/i, 'it cannot be undone').replace(/^Historical /, 'Earlier ');
  const histIcon = (x) => (/save|export/i.test(x.action) ? 'download' : /load|import/i.test(x.action) ? 'upload' : 'copy');
  const histSub = (x) => [x.time, x.categories != null ? `${plural(x.categories, 'kind')} of settings` : '', tidy(x.result)].filter(Boolean).join(' · ');
  SMX.act('system-transfer-remove', (el) => {
    const i = Number(el.getAttribute('data-index')); const x = history(SMX.fresh())[i]; if (!x) return;
    kit().confirm(`Remove “${x.action}” from the list?`, x.rollback_available ? 'Its undo copy is deleted too, so it can no longer be undone. Your settings stay as they are now.' : 'Only the entry is removed. Your settings stay as they are now.', 'Remove', () => {
      const st = eng().getState(); const H = history(st); const y = H[i]; if (!y) return;
      if (y.rollback_ref && st.settingsTransferRollbacks) delete st.settingsTransferRollbacks[y.rollback_ref];
      H.splice(i, 1); st.settingsTransferHistory = H; eng().setState(st); SMX.fresh();
      SMX.toast('Removed from the list', `“${x.action}” is gone. Your settings did not change.`);
      SMX.go('system/copy', { replace: true });
    }, true);
  });
  SMX.extend('system/copy', {
    purpose: 'Bring settings into this project, or take them to another computer. You see every change before it happens, and passwords, keys and sign-ins never move.',
    blurb: (ctx) => { const hst = history(ctx.st); return hst.length ? `Last: ${hst[0].action} · ${String(hst[0].time || '').toLowerCase()}` : 'From another project, or to and from a file'; },
    keywords: ['transfer', 'export', 'import', 'copy settings', 'save settings', 'load settings', 'another computer', 'move settings', 'settings file'],
    lead: (ctx) => {
      const st = ctx.st, H = history(st), last = ((st.pm51 || {}).transfer || {}).sourceLabel;
      return [
        { key: 'tasks', html: ui.tasks([
          { icon: 'copy', title: 'From another project, into this one', sub: last ? `Last time from ${last}. That project is only read.` : 'Bring over a setup you already like. That project is only read.', action: 'pm51-transfer-start', data: { mode: 'copy' } },
          { icon: 'download', title: 'From here, to another computer', sub: 'Save these settings to a file and take it with you.', action: 'run-setting-action', data: { setting: 'system.advanced.export-settings', settingId: 'system.advanced.export-settings' } },
          { icon: 'upload', title: 'From another computer, into this project', sub: 'Load a file saved earlier. Older files are converted first.', action: 'run-setting-action', data: { setting: 'system.advanced.import-settings', settingId: 'system.advanced.import-settings' } }
        ], { title: 'Where should settings go?', cols: 3 }) },
        { key: 'how', html: ui.card({ title: 'How each of them goes', body: steps([
          { title: 'You choose which kinds of settings', desc: 'Ten kinds, from how it looks to permissions. Only the kinds you pick are touched.' },
          { title: 'You see every change first', desc: 'Each line shows the value here and the value it would take. Nothing has changed yet.' },
          { title: 'Where both differ, you say which wins', desc: 'Use theirs, keep what you changed here, or choose one by one.' },
          { title: 'It can be undone', desc: 'A copy of the old settings is kept first. “Undo” is in the list below.' }
        ]) }) },
        { key: 'never', html: ui.card({ title: 'What never moves', body: ui.facts([['Passwords, keys and sign-ins', 'They stay with the project and computer they belong to.'], ['Paired devices', 'Each device pairs with a Server by itself.'], ['Which computer is your Server', 'Decided for each project.'], ['Which account an AI provider uses', 'Kept as it is here.']]) }) },
        { key: 'history', html: ui.things({ title: 'Copies, saves and loads so far', help: H.length ? 'Open one to see what it changed. A copy or a load can be undone while its undo copy is kept.' : '',
          items: H.map((x, i) => ({ icon: histIcon(x), name: x.action, sub: histSub(x), status: x.rollback_available ? { text: 'Can be undone', tone: 'info' } : null, go: `system/copy/${i}` })),
          empty: { icon: 'copy', title: 'Nothing copied yet', text: 'Copies, saved files and loaded files show up here, with what each one changed.' } }) }
      ];
    },
    expert: [
      S('transfer-files-more', { title: 'The settings file', help: 'How settings files are written, and which old file names still load.' }),
      { key: 'receipts', html: (ctx) => { const st = ctx.st, snap = st.settingsSourceSnapshot; return ui.card({ title: 'Records of the last copy', body: ui.facts(snap ? [['Last copy from', snap.source_project_id], ['Settings copied', (snap.copied_setting_ids || []).length], ['Receipt', snap.receipt_id || 'Not supplied'], ['Undo copy', snap.rollback_ref || 'None'], ['Copied at', snap.copied_at ? new Date(snap.copied_at).toLocaleString() : '—']] : [['Last copy', 'No record yet'], ['Undo copy', 'None']]) }); }, count: 0 },
      { key: 'kinds', html: () => ui.card({ title: 'What each kind of settings holds', body: ui.facts(KINDS) }), count: 0 }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How copying settings works', action: 'pm51-transfer-help' }, { label: 'Forget the choices of the last copy', action: 'pm51-transfer-reset' }]) }],
    changes: [
      { was: 'Settings Transfer is three rows in two sections (“Copy from another project: Start”, “Save to a file…”, “Load a file…”), named for the mechanism. Nothing says which one you need to get settings onto another computer.', now: 'The page asks one question, “Where should settings go?”, with three answers named by direction. Each starts PMConcept7’s own guided steps.' },
      { was: '“What is never copied” (passwords, device pairings, server identity, account choices) is inside “More options”, after the buttons that start a copy.', now: 'It is on the page before anything is started, with the four steps every copy goes through.' },
      { was: 'The word for undoing a copy is “restore point” (“A copy or load can be rolled back while its restore point is kept”), the same word Backup & Restore and App Updates use for other things.', now: 'It is “Undo”, and the kept copy is “its undo copy”.' },
      { was: 'A history entry is opened through a “More for …” menu with two items (Details, Remove from history); the example entry says “Historical example data; rollback not created”.', now: 'An entry opens on its own page with what it changed and two buttons, the risky one last. The example entry says “it cannot be undone”.' },
      { was: 'The page is in the System chapter under the name “Settings Transfer”; its two file-format rows carry ids from Advanced Settings (system.advanced.config-format, …legacy-config-names).', now: 'It is “Copy settings” in Health & updates. The two file rows are under “For experts”.' }
    ]
  });
  const histOf = (ctx) => { const i = Number((ctx.params || {}).n); const x = history(ctx.st)[i]; return x ? { x, i } : null; };
  SMX.page({
    id: 'system/copy/:n', chapter: 'system', parent: 'system/copy',
    title: (ctx) => { const o = histOf(ctx); return o ? o.x.action : 'A copy'; },
    nav: (ctx) => { const o = histOf(ctx); return o ? o.x.action : 'A copy'; },
    purpose: (ctx) => { const o = histOf(ctx); return o ? String(o.x.time || '') : ''; },
    legacy: [['system', 'settings-transfer']],
    lead: (ctx) => {
      const o = histOf(ctx);
      if (!o) return [{ key: 'gone', html: ui.card({ title: 'This entry is no longer in the list', body: ui.btn({ label: 'Back to Copy settings', go: 'system/copy' }) }) }];
      const x = o.x; let label = (id) => id; try { label = (id) => { const s = kit().setting(id); return s ? kit().rowLabel(s) : id; }; } catch (e) { /* ids as they are */ }
      return [
        { key: 'summary', html: ui.summary({ icon: histIcon(x), tone: 'info', lines: [`${ui.b(x.action)}${x.categories != null ? `, ${plural(x.categories, 'kind')} of settings` : ''}.`, x.rollback_available ? 'It can be undone: the settings from before are kept.' : 'It cannot be undone from here: no copy of the settings from before was kept.'] }) },
        { key: 'facts', html: ui.card({ title: 'What happened', body: ui.facts([['When', x.time || '—'], ['Kinds of settings', x.categories != null ? x.categories : '—'], ['Result', tidy(x.result) || '—'], ['Receipt', x.receipt_id || 'None'], ['Undo copy', x.rollback_available ? 'Kept' : 'None']]) }) },
        { key: 'kept', html: x.kept && x.kept.length ? ui.card({ title: 'Kept as they were', help: 'Settings you chose to keep your own value for.', body: ui.facts(x.kept.map((id) => [label(id), 'Your value stayed'])) }) : '' },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Undo this…', icon: 'restore', action: 'pm51-transfer-rollback', data: { index: o.i }, disabled: !x.rollback_available, reason: 'No copy of the settings from before was kept, so there is nothing to go back to.' })}${ui.btn({ label: 'Remove from the list…', icon: 'trash', danger: true, do: 'system-transfer-remove', data: { index: o.i } })}</div>` }
      ];
    },
    changes: [{ was: 'Details of a copy are a side panel behind a “More for …” menu; “Roll back” appears on the list only for entries that can be rolled back, so the seeded entries show no way to undo and no reason.', now: 'The entry has a page. “Undo this…” is always there, and when it cannot be used it says why.' }]
  });

  /* ================================================================== Setup & tour */
  const canResume = () => { try { if (typeof W.O55TourSettingsRows !== 'function') return false; const html = String(W.O55TourSettingsRows(kit().icon) || ''); const m = /<[^>]*data-action="resume-guided-tour"[^>]*>/.exec(html); return !!m && !/disabled/i.test(m[0]); } catch (e) { return false; } };
  SMX.extend('system/setup', {
    blurb: () => `First-time setup: ${low(String(val('onboarding') || 'done'))}`,
    keywords: ['onboarding', 'tour', 'guided tour', 'first run', 'wizard', 'setup again', 'tips', 'teacher'],
    lead: () => {
      const resume = canResume();
      return [
        { key: 'summary', html: ui.summary({ icon: 'rocket', tone: 'info', lines: [`First-time setup: ${ui.b(low(String(val('onboarding') || 'done')))}.`, 'You can go through it again at any time. Nothing you have set up is lost by looking.'], side: ui.btn({ label: 'See the steps', icon: 'list', action: 'open-resource-setting', data: { setting: 'onboarding' } }) }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'refresh', title: 'Go through setup again', sub: 'The first-time setup, from the start. The tour starts over too.', action: 'replay-onboarding' },
          { icon: 'play', title: 'Start the Guided Tour', sub: 'From the first step, with a local example.', action: 'restart-guided-tour' },
          resume ? { icon: 'arrowRight', title: 'Pick up the tour where I left it', sub: 'Carry on from the step you stopped at.', action: 'resume-guided-tour' } : null
        ], { title: 'What do you want to do?', cols: 3 }) },
        { key: 'noresume', html: resume ? '' : '<p class="smx-quiet-line">There is no tour to pick up: none was left half-way.</p>' }
      ];
    },
    sections: [
      S('doctor-onboarding', { title: 'On a fresh start', help: 'What a new setup shows and offers.' }),
      { key: 'teacher', html: () => ui.card({ title: 'The teacher', help: 'The helper that walks you through things step by step.', body: ui.settings(['teacher']) }) }
    ],
    covers: { onboarding: 'The sentence at the top of this page and its button “See the steps”.', teacher: 'The card “The teacher” on this page.' },
    changes: [
      { was: 'Setup and the tour are in three places: three rows on Settings Home (one of them permanently greyed out, “Resume the Guided Tour: No tour to pick up”), five rows on Readiness & Doctor (“Setup and tour”), and nothing in the list of pages.', now: 'One page. “Pick up the tour” is offered only when there is a tour to pick up; otherwise one quiet line says so.' },
      { was: '“Onboarding progress: 7 of 9 complete” is a row whose button opens a panel.', now: 'It is the first sentence of the page, with “See the steps” beside it.' }
    ]
  });

  /* ================================================================== Privacy & troubleshooting */
  SMX.extend('system/advanced', {
    blurb: () => `${isOn('system.health.telemetry', false) ? 'Usage and crash reports are shared' : 'Nothing is shared with the makers'} · logs record ${low(word('system.advanced.log-verbosity'))}`,
    keywords: ['telemetry', 'privacy', 'crash reports', 'logs', 'debug', 'reset', 'defaults', 'start over', 'renderer', 'experimental', 'developer', 'feature flags'],
    lead: () => {
      const share = isOn('system.health.telemetry', false), extra = isOn('system.advanced.debug-mode', false);
      return [
        { key: 'summary', html: ui.summary({ icon: 'lock', tone: 'ready', lines: [
          share ? `Anonymous usage and crash reports are ${ui.word('shared with the makers', { go: 'system/advanced', reveal: 'system.health.telemetry' })} of Puppet Master.` : `${ui.word('Nothing is shared', { go: 'system/advanced', reveal: 'system.health.telemetry' })} with the makers of Puppet Master.`,
          `Extra detail for hunting a problem is ${ui.b(extra ? 'on' : 'off')}; the logs record ${ui.b(low(word('system.advanced.log-verbosity')))}.`
        ] }) }
      ];
    },
    sections: [
      { key: 'privacy', title: 'Sharing with the makers', help: 'Anonymous reports that help improve the app. Off unless you turn it on.', ids: ['system.health.telemetry'] },
      { key: 'reset', html: () => ui.card({ title: 'Start over', help: 'For when a change made things worse and you cannot find which one.', body: ui.rows([{ label: 'Put every setting of this project back to how it came', help: 'Accounts, keys and history are kept. A copy of your settings is made first, so you can undo it.', covers: 'system.advanced.reset-defaults', control: (() => { try { return kit().bound.action('system.advanced.reset-defaults', { label: 'Start over…', icon: 'restore' }); } catch (e) { return ''; } })() }]) }) }
    ],
    more: [{ key: 'hunt', title: 'When something misbehaves', help: 'Extra detail for hunting a problem. Leave these off otherwise.', ids: ['system.advanced.debug-mode', 'system.advanced.log-verbosity', 'system.advanced.runtime-artifacts'], also: ['system.advanced.receipts-verbosity', 'system.advanced.cache-linter'] }],
    moreLabel: 'When something misbehaves', moreHelp: 'Extra detail for hunting a problem',
    expert: [
      { key: 'draw', title: 'Starting and drawing', help: 'How the app starts and draws its windows.', ids: ['system.advanced.viewer-mode', 'system.advanced.renderer'] },
      { key: 'early', html: () => ui.card({ title: 'Unfinished features and developer details', help: 'Features that are still being tried out, and the internal names developers use.', body: ui.settings(['feature-flags', 'developer-mode']) }), count: 2 }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Collect details for support: on the Checkup page', go: 'system', reveal: 'system.health.platform-diagnostics' }, { label: 'Every setting, as a list', go: 'system/all' }]) }],
    covers: { 'system.advanced.reset-defaults': 'The card “Start over” on this page.', 'feature-flags': 'Under For experts: “Unfinished features and developer details”.', 'developer-mode': 'Under For experts: “Unfinished features and developer details”.' },
    changes: [
      { was: 'Advanced Settings is the last page of Settings: 12 rows with nothing folded, titled “Diagnostics, runtime options, and deliberate recovery actions”. Its first row is “Experimental features: 3 available”.', now: 'The page is “Privacy & troubleshooting”. It opens on what is shared (nothing, unless you say so), then “Start over”. Troubleshooting is folded; the two rows only a developer needs are under “For experts”.' },
      { was: 'The privacy choice (“Share anonymous usage and crash reports”) is the third row of a group that starts with “Experimental features” and “Developer diagnostics”.', now: 'It is the first thing on the page and has the group to itself.' },
      { was: 'There are two ways to reset everything: “Reset settings to defaults” here and “Reset all to defaults” at the foot of All Project Settings. The row here promises “Pick one setting, a section or everything; you see it first”, but its button opens a single confirmation for everything.', now: 'One: “Start over”, the one that keeps a copy first so it can be undone. Its row says what the button really does. The list of every setting links to it.' },
      { was: '“Check the app’s parts match at startup” is among the drawing options.', now: 'It moved to the Checkup page, with the other automatic checks.' }
    ]
  });

  /* ================================================================== Every setting, as a list */
  let ROWS = null;
  function rows() {
    if (ROWS) return ROWS;
    const ref = new Map(); try { for (const c of Object.values((W.PM12_REFERENCE || {}).byCat || {})) for (const r of (c.settings || [])) ref.set(r.id, r); } catch (e) { /* no reference */ }
    const order = new Map(SMX.chapters.map((c, i) => [c.id, i])); const out = [];
    for (const [id, rec] of SMX.placement().claimed) {
      const s = kit().setting(id); if (!s) continue; const c = ref.get(id) || {};
      let label = s.label; try { label = kit().rowLabel(s) || label; } catch (e) { /* the inventory's label */ }
      const m = SMX.match(rec.route); const pg = m ? m.page : null;
      out.push({ id, label: String(label || id), route: rec.route, chapter: pg ? pg.chapter : '', level: rec.level, section: rec.section || '',
        cat: c.cat || (String(id).includes('.') ? String(id).split('.')[0] : 'system'), tier: c.tier || s.tier || 'simple', control: String(c.type || s.canonicalType || s.control || 'text'),
        applies: (Array.isArray(c.scope) && c.scope.length ? c.scope : ['project']).map((v) => String(v).toLowerCase()), owner: String((c.status && c.status.state) || s.ownerStatus || 'ok').toLowerCase(), result: String(s.resultType || 'ordinary-setting').toLowerCase(),
        text: [label, s.label, c.desc || s.description || '', (c.search || []).join(' '), String(id).replace(/[.\-]/g, ' ')].join(' ').toLowerCase() });
    }
    out.sort((a, b) => ((order.has(a.chapter) ? order.get(a.chapter) : 99) - (order.has(b.chapter) ? order.get(b.chapter) : 99)) || a.label.localeCompare(b.label));
    ROWS = out; return out;
  }
  const F = () => { const f = flags(); if (!f.all) f.all = { q: '', chapter: '', show: '', changed: false, ids: false, more: false, cat: '', control: '', applies: '', owner: '', result: '', open: {} }; return f.all; };
  const filtering = (a) => !!(a.q.trim() || a.chapter || a.show || a.changed || a.cat || a.control || a.applies || a.owner || a.result);
  const humanize = (s) => String(s || '').replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
  /* typing in the list's search box: the text is kept with this concept's own state, and the list redraws */
  Doc.addEventListener('input', (e) => { const t = e.target; if (t && t.matches && t.matches('[data-smx-all-q]')) F().q = String(t.value || ''); }, true);
  SMX.act('system-all-set', (el) => { const sel = el.querySelector('select'); if (sel) F()[el.getAttribute('data-key')] = sel.value; });
  SMX.act('system-all-flip', (el) => { const k = el.getAttribute('data-key'); F()[k] = !F()[k]; });
  SMX.act('system-all-open', (el) => { const k = el.getAttribute('data-ch'); F().open[k] = !F().open[k]; });
  SMX.act('system-all-every', () => { const a = F(); const any = Object.values(a.open).some(Boolean); a.open = {}; if (!any) for (const c of SMX.chapters) a.open[c.id] = true; });
  SMX.act('system-all-clear', () => { const a = F(); Object.assign(a, { q: '', chapter: '', show: '', changed: false, cat: '', control: '', applies: '', owner: '', result: '' }); const box = SMX.host() && SMX.host().querySelector('[data-smx-all-q]'); if (box) box.value = ''; });
  const matches = (st, a) => {
    const terms = a.q.trim().toLowerCase().split(/\s+/).filter(Boolean); const changed = st.changed || {};
    return rows().filter((r) => (!a.chapter || r.chapter === a.chapter) && (!a.show || r.tier === a.show) && (!a.changed || changed[r.id]) && (!a.cat || r.cat === a.cat) && (!a.control || r.control === a.control) && (!a.applies || r.applies.includes(a.applies)) && (!a.owner || r.owner === a.owner) && (!a.result || r.result === a.result) && terms.every((t) => r.text.includes(t)));
  };
  const valueOf = (id) => { try { const s = kit().setting(id); const t = String(kit().valueText(s, kit().value(id))); return t.length > 44 ? `${t.slice(0, 42)}…` : t; } catch (e) { return ''; } };
  const where = (r) => `${SMX.pageName(r.route)}${r.section ? ` › ${r.section}` : ''}${r.level === 'more' ? ' · under More options' : r.level === 'expert' ? ' · under For experts' : ''}`;
  const settingRow = (st, a, r) => `<div class="smx-thing is-clickable smx-all-row" role="button" tabindex="0" data-smx-go="${h(r.route)}" data-smx-reveal="${h(r.id)}"><span class="smx-thing-copy"><span class="smx-thing-name">${h(r.label)}${(st.changed || {})[r.id] ? ' <span class="smx-thing-tag">Changed</span>' : ''}</span><span class="smx-thing-sub">${h(where(r))}</span>${a.ids ? `<span class="smx-thing-sub smx-all-id">${h(r.id)}</span>` : ''}</span><span class="smx-thing-end"><span class="smx-all-value">${h(valueOf(r.id))}</span><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`;
  const CAP = 150;
  SMX.extend('system/all', {
    blurb: () => { try { return `${rows().length} settings, each with a link to the page it lives on`; } catch (e) { return 'All settings in one searchable list'; } },
    keywords: ['all settings', 'every setting', 'list', 'index', 'setting id', 'changed settings', 'export list'],
    lead: (ctx) => {
      const st = ctx.st, a = F();
      /* arriving on the page starts with an empty search box, so what the box shows and what is filtered always agree */
      const box = SMX.host() && SMX.host().querySelector('[data-smx-all-q]'); if (!box) a.q = '';
      const all = rows(), list = matches(st, a), on = filtering(a);
      const uniq = (f) => Array.from(new Set(all.flatMap(f))).sort();
      const wrap = (key, html) => `<span data-smx-do-change="system-all-set" data-key="${key}">${html}</span>`;
      const titles = new Map((((W.PM12_REFERENCE || {}).categories) || []).map((c) => [c.id, c.title]));
      const pick = (key, first, opts) => wrap(key, select(a[key], [['', first]].concat(opts), { action: 'pm51-noop', label: first, width: 190 }));
      const flip = (key, label) => `<label class="smx-all-check"><span data-smx-do="system-all-flip" data-key="${key}">${toggle(!!a[key], { action: 'pm51-noop', label })}</span><span>${h(label)}</span></label>`;
      const byCh = new Map(); for (const r of list) { if (!byCh.has(r.chapter)) byCh.set(r.chapter, []); byCh.get(r.chapter).push(r); }
      let left = CAP; const groupsHtml = [];
      for (const c of SMX.chapters) {
        const rs = byCh.get(c.id) || []; if (!rs.length) continue;
        const open = on || !!a.open[c.id];
        const shown = open ? (on ? rs.slice(0, Math.max(0, left)) : rs) : []; if (on) left -= shown.length;
        groupsHtml.push(`<section class="smx-all-group"><button type="button" class="smx-all-head${open ? ' is-open' : ''}"${on ? ' disabled' : ` data-smx-do="system-all-open" data-ch="${h(c.id)}" aria-expanded="${open}"`}>${SMX.icon('fold')}<span class="smx-all-title">${h(c.title)}</span><span class="smx-all-count">${plural(rs.length, 'setting')}</span></button>${shown.length ? `<div class="smx-things smx-all-rows">${shown.map((r) => settingRow(st, a, r)).join('')}</div>` : ''}</section>`);
      }
      const anyOpen = Object.values(a.open).some(Boolean);
      return [
        { key: 'find', html: `<label class="smx-search smx-all-find">${SMX.icon('search')}<input type="search" autocomplete="off" spellcheck="false" placeholder="Search every setting by name, by what it does, or by its id" aria-label="Search every setting" data-smx-all-q data-smx-key="all-q"></label>` },
        { key: 'filters', html: `<div class="smx-all-bar">${pick('chapter', 'All chapters', SMX.chapters.map((c) => [c.id, c.title]))}${pick('show', 'Common and advanced', [['simple', 'Common only'], ['advanced', 'Advanced only']])}${flip('changed', 'Changed only')}${ui.link({ label: a.more ? 'Fewer filters' : 'More filters', do: 'system-all-flip', data: { key: 'more' } })}</div>${a.more ? `<div class="smx-all-bar smx-all-more">${pick('cat', 'All categories', uniq((r) => [r.cat]).map((v) => [v, titles.get(v) || humanize(v)]))}${pick('control', 'All control types', uniq((r) => [r.control]).map((v) => [v, humanize(v)]))}${pick('applies', 'All applicability', uniq((r) => r.applies).map((v) => [v, humanize(v)]))}${pick('owner', 'All owner statuses', uniq((r) => [r.owner]).map((v) => [v, humanize(v)]))}${pick('result', 'All result types', uniq((r) => [r.result]).map((v) => [v, humanize(v)]))}${flip('ids', 'Show setting ids')}</div>` : ''}` },
        { key: 'count', html: `<div class="smx-all-countline"><span aria-live="polite">${on ? `${list.length} of ${plural(all.length, 'setting')} match${list.length === 1 ? 'es' : ''}${list.length > CAP ? `. The first ${CAP} are shown; narrow the search to see the rest` : ''}` : `${plural(all.length, 'setting')} in ${plural(SMX.chapters.length, 'chapter')}. Open a chapter, or search.`}</span>${on ? ui.link({ label: 'Clear the search and filters', do: 'system-all-clear' }) : ui.link({ label: anyOpen ? 'Close every chapter' : 'Open every chapter', do: 'system-all-every' })}</div>` },
        { key: 'list', html: groupsHtml.length ? `<div class="smx-all-list">${groupsHtml.join('')}</div>` : `<div class="smx-empty">${SMX.icon('search')}<div class="smx-empty-title">No setting matches</div><div class="smx-empty-text">Try another word, or clear the search and filters to see everything.</div>${ui.btn({ label: 'Clear the search and filters', do: 'system-all-clear' })}</div>` }
      ];
    },
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Save this list to a file', action: 'pm51-all-export' }, { label: 'Put every setting back to how it came: Start over', go: 'system/advanced', reveal: 'system.advanced.reset-defaults' }]) }],
    changes: [
      { was: 'All Project Settings is the first page of a chapter called “Projects & Sync”, which has no list of projects and no sync settings. It lists 999 settings in the inventory’s 12 categories (“Branching & Collaboration”, “Code & Execution”), which match no page of Settings.', now: 'It is the last page of Health & updates, named for what it is. Settings are grouped by the chapters of this redesign, and each line says the page and group it lives in.' },
      { was: 'Each line is the whole setting row with its control, so the list is a second place to change every setting. Opened fully it was over 100,000 px tall.', now: 'Each line is a pointer: name, where it lives, its value now, and whether you changed it. Pressing it opens the setting at its home, with its explanation.' },
      { was: 'The count reads “999 settings in 12 categories” while the inventory holds 1,011: twelve retired ids are silently left out.', now: 'The count is the number of settings that have a place in the redesign, and every one of them is in the list.' },
      { was: 'Two dropdowns, a checkbox, “More filters” with four more dropdowns and a checkbox, “Open every category”, “Clear filters”, “Reset all to defaults” and “Export list”.', now: 'The same filters, with chapters as the main one and the old categories under “More filters”. “Reset all to defaults” became a link to “Start over”, the reset that can be undone.' }
    ]
  });
  /* a look or a reset can change labels: the list is read again the next time it is shown */
  const reset0 = SMX.resetLocal; SMX.resetLocal = function () { ROWS = null; return reset0.apply(this, arguments); };

  /* search: the areas of the checkup, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => groups(st).map((g) => ({ title: areaOf(g)[1], sub: 'Health & updates › Checkup', route: `system/checkup/${enc(g.id)}` })));
})(window);
