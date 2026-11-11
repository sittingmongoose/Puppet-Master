/* Settings managers, rethought (Fable 5.2): the chapter "Backups & history".
   Today this is two managers in two chapters: System › Backup & Restore (four tabs) and Projects & Sync › History &
   Artifacts (four tabs). Between them, six of the actions a person needs when something is lost are folded under
   "More options", "restore" names six different things, and how long anything is kept is set in fourteen places in six
   wordings. Here:
   - the chapter opens with the answer to "is my work safe?": when the last backup ran, where it went, whether it can
     be read back, and the two things people come for, "Back up now" and "Get something back";
   - a place backups go, a backup, a session and a file the work produced each have a page of their own;
   - getting work back reads as three sentences with PMConcept7's own controls in them, and checking or looking
     inside a backup sits beside the button that starts it;
   - "How long things are kept" is the one page for every keep-for choice, in one wording, and it lists the ones
     other chapters own with a link to each.
   Every flow is PMConcept7's own; the buttons carry its action names. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const enc = encodeURIComponent;
  const count = (n, one, many) => d.plural(n, one, many);
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const seg = (value, options, o) => { try { return kit().segmented(value, options, o); } catch (e) { return ''; } };
  /* PMConcept7's rows keep their ids, values and controls; their words are replaced as the row is drawn, so every
     keep-for choice reads the same way. {id: {label, help, action, unit}} (the same small helper as in source.js) */
  const reword = (map) => {
    SMX.words = Object.assign(SMX.words || {}, map);
    if (SMX.wordsOn) return; SMX.wordsOn = true;
    const text = (row, sel, to) => { const n = row.querySelector(sel); if (!n) return; const t = [...n.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim()); if (t) { if (t.nodeValue !== to) t.nodeValue = to; } else if (!n.firstChild) n.textContent = to; };
    const fix = (row) => { const w = SMX.words[String(row.id || '').slice(8)]; if (!w) return; if (w.label) text(row, '.setting-label', w.label); if (w.help) text(row, '.setting-description', w.help); if (w.action) { const b = row.querySelector('.setting-control .btn span, .setting-control .o55-textbtn'); if (b && b.textContent !== w.action) b.textContent = w.action; } if (w.unit) { const u = row.querySelector('.o55-unit'); if (u && u.textContent !== w.unit) u.textContent = w.unit; } };
    const ROW = '.setting-row[id^="setting-"]';
    const scan = (n) => { if (!n || n.nodeType !== 1) return; if (n.matches(ROW)) fix(n); n.querySelectorAll(ROW).forEach(fix); };
    const start = () => { const host = SMX.host && SMX.host(); if (!host) { W.setTimeout(start, 300); return; } new W.MutationObserver((list) => { for (const m of list) { const el = m.target && m.target.nodeType === 1 ? m.target : m.target && m.target.parentElement; const row = el && el.closest ? el.closest(ROW) : null; if (row) fix(row); for (const n of m.addedNodes) scan(n); } }).observe(host, { childList: true, subtree: true, characterData: true }); scan(host); };
    start();
  };
  reword({
    'system.advanced.chat-history-retention': { label: 'Keep chats', help: 'Until you delete them. The two choices below tidy quiet chats away and give you time to change your mind.' },
    'general.interaction.thread-archive-days': { label: 'Move a chat to the archive when untouched for', help: '0 never archives. An archived chat is kept, out of the way.' },
    'general.interaction.thread-retention-days': { label: 'Keep deleted chats for', help: 'A deleted chat can be brought back until then.' },
    'system.advanced.runtime-history-days': { label: 'Keep records of Goals and runs for', help: 'At least 365 days.' },
    'system.advanced.diagnostic-history-days': { label: 'Keep diagnostic logs for', help: 'At least 30 days.' },
    'system.advanced.released-safe-point-days': { label: 'Keep safe points that are no longer needed for', help: 'At least 90 days.' },
    'system.advanced.preserved-terminal-runs': { label: 'Keep the latest terminal runs', help: 'Always kept, whatever the choice for logs says.' },
    'branching.worktrees.evidence-retention-days': { help: 'Automatic keeps them until you delete them.' },
    'branching.worktrees.evidence-retain-last-runs': { label: 'Keep test logs from only the last runs', help: 'Automatic sets no limit.' },
    'planning.verification.evidence-retention-days': { help: 'Automatic keeps it until you delete it.' },
    'planning.verification.evidence-retain-runs': { label: 'Always keep Goal proof from the last runs', help: 'Kept however old it is.' },
    'planning.verification.prune-on-cleanup': { label: 'Delete proof past its time when a working copy is cleaned', help: 'When you clean a working copy, proof older than the times above goes too.' }
  });
  const lower = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
  const BK = (tab) => ['system', 'backup', tab, 'backup'];
  const HI = (tab) => ['projects', 'project-history', tab, 'project-history'];

  /* ------------------------------------------------------------------ readers: backups
     PMConcept7 keeps places, the Recovery Kit and what is protected in state.pm51.backup, and the schedules and the
     backups that ran in state.backup. The choices of "Get work back" appear in state.pm51.backupRestore only once
     they were touched; until then the manager's own starting values apply. */
  const bk = (st) => (st.pm51 || {}).backup || { automatic: false, recoveryKit: {}, protected: {}, destinations: [] };
  const places = (st) => bk(st).destinations || [];
  const mainPlace = (st) => places(st).find((x) => x.default) || places(st)[0] || null;
  const schedules = (st) => (st.backup || {}).schedules || [];
  const runs = (st) => (st.backup || {}).history || [];
  const snapId = (x) => (x && (x.snapshot_id || x.receipt || x.backup_id)) || '';
  const latest = (st) => runs(st)[0] || null;
  const checked = (x) => !!x && /verified/i.test(String(x.result || ''));
  const fits = (what, x) => what !== 'Whole server' || /server/i.test(String(x.type));
  const restoreOf = (st) => { const R = (st.pm51 || {}).backupRestore || {}; return { what: R.what || 'Whole workspace', whichId: R.whichId || snapId(latest(st)), where: R.where || 'In place' }; };
  const placeRoute = (p) => `keeping/places/${enc(p.id)}`;
  const runRoute = (x) => `keeping/restore/${enc(snapId(x))}`;
  const when = (t) => String(t || '').replace(/^(Today|Yesterday)/, (m) => m.toLowerCase()).replace(/\s*·\s*/, ' at ');
  const holds = (x) => (/full/i.test(String(x.type)) ? 'Everything' : /server/i.test(String(x.type)) ? 'The whole Server' : 'Changes since the backup before');
  const everyWhen = (s) => { const w = String(s.when || ''); return / · /.test(w) ? `every ${w.split(' · ')[0]} at ${w.split(' · ')[1]}` : `every day at ${w}`; };
  const keepN = (s) => parseInt(String(s.retention || ''), 10) || 0;
  const speedOf = (B) => { const v = String(B.bandwidth || 'Night schedule · 40 MB/s'); return /no limit/i.test(v) ? 'No limit' : /10/.test(v) ? '10 MB/s' : '40 MB/s'; };
  const dayOnly = (B) => (B.bandwidthDayOnly != null ? !!B.bandwidthDayOnly : /night/i.test(String(B.bandwidth || 'Night schedule')));
  const kitWord = (st) => { const k = bk(st).recoveryKit || {}; return !k.saved ? ['Not saved', 'off'] : k.tested ? ['Saved and tested', 'ready'] : ['Saved, not tested yet', 'attention']; };
  const placeTone = (p) => (p.state === 'Ready' ? 'ready' : p.state === 'Needs sign-in' ? 'attention' : 'off');
  const PLACE_ICON = { 'Cloud account': 'cloud', 'Storage bucket': 'database', 'Another computer or NAS': 'nas', 'Self-hosted storage': 'nas' };

  /* ------------------------------------------------------------------ readers: history
     PMConcept7's History manager adds three example events, the keep-for values and the cleanup groups the first time
     it draws. The lists here read the same things in either state. */
  const EXTRA = [
    { event: 'Settings change proposed: raise the run budget', time: 'Today · 09:12', device: 'Laptop', type: 'Settings', approved: false },
    { event: 'Prototype session archived', time: 'Last week', device: 'Desktop', type: 'Sessions', archived: true },
    { event: 'recipe-api: tests passed on main', time: 'Yesterday · 17:40', device: 'Home server', type: 'Tests', project: 'recipe-api' }
  ];
  const GROUPS = [{ id: 'temp', title: 'Temporary artifacts', meta: '214 MB · 12 items', count: 12 }, { id: 'recordings', title: 'Expired visual recordings', meta: '1.8 GB · 4 items', count: 4 }, { id: 'stale', title: 'Stale sessions', meta: '2 sessions, untouched for 60 days', count: 2 }];
  const hist = (st) => (st.pm51 || {}).history || { timeline: [] };
  const timeline = (st) => { const H = hist(st); const t = H.timeline || []; return H.o55V2 ? t : t.concat(EXTRA.filter((e) => !t.some((x) => x.event === e.event))); };
  const PH = (st) => st.projectHistory || { sessions: [], artifacts: [] };
  const sessions = (st) => PH(st).sessions || [];
  const files = (st) => PH(st).artifacts || [];
  const tempKeep = (st) => (PH(st).retention || (st.backup || {}).retention || {}).temporaryArtifacts || '7 days';
  const groups = (st) => (st.pm51 || {}).historyCleanup || GROUPS;
  const waiting = (st) => groups(st).reduce((n, g) => n + (g.count || 0), 0);
  const removed = (st) => (st.pm51 || {}).historyQuarantine || [];
  const filterOf = (st) => Object.assign({ q: '', type: 'All' }, (st.pm51 || {}).historyFilter || {});
  const on = (v) => v === true || v === 'on' || v === 'true';
  const V = { scope: 'general.interaction.history-scope', approved: 'general.interaction.history-approved-only', archived: 'general.interaction.history-archived', exportRow: 'general.interaction.history-export', compare: 'general.interaction.history-compare', lineage: 'general.interaction.thread-lineage', runs: 'system.advanced.runtime-history-days' };
  const TYPE_ICON = { Tests: 'test', Goals: 'rocket', Settings: 'settings', Backups: 'archive', Sessions: 'history', Artifacts: 'file' };
  const sessionTone = (s) => (s === 'Active' ? 'ready' : s === 'Paused' ? 'attention' : 'off');
  const KEEP = [['Keep indefinitely', 'Until I delete it'], ['1 year', '1 year'], ['90 days', '90 days'], ['30 days', '30 days'], ['7 days', '7 days']];
  const keepValue = (v) => (String(v).toLowerCase() === 'keep' ? 'Keep indefinitely' : String(v));
  const keptFor = (v) => (/indefinitely|^keep$/i.test(String(v)) ? 'Kept until you delete it' : `Kept for ${v}`);
  const fileIcon = (a) => (a.type === 'Video' ? 'video' : a.type === 'Archive' ? 'archive' : 'file');

  /* ------------------------------------------------------------------ what needs you */
  const needs = (st) => {
    const out = []; const B = bk(st); const last = latest(st); const main = mainPlace(st); const k = B.recoveryKit || {};
    if (!places(st).length) out.push({ home: true, tone: 'blocked', title: 'There is nowhere for backups to go', detail: 'Add a place first: another computer, a NAS or a cloud account.', fix: { label: 'Add a place', action: 'pm51-backup-dest-add' } });
    else if (main && main.state !== 'Ready') out.push({ home: true, title: `${main.name}, where backups go first, ${main.state === 'Needs sign-in' ? 'needs you to sign in' : 'is not ready'}`, detail: 'Backups cannot be sent there until it is ready.', fix: main.state === 'Needs sign-in' ? { label: 'Sign in', action: 'pm51-backup-dest-signin', data: { id: main.id } } : { label: 'Open it', go: placeRoute(main) } });
    if (!B.automatic) out.push({ home: true, title: 'Backups do not run by themselves', detail: 'Automatic backups are off, so only the backups you start are made.', fix: { label: 'See the schedule', go: 'keeping', anchor: 'schedule' } });
    if (!last) out.push({ home: true, title: 'Nothing has been backed up yet', detail: 'The first backup takes longest; after that only what changed is saved.', fix: { label: 'Back up now', action: 'pm51-backup-now' } });
    else if (!checked(last)) out.push({ home: true, title: `The latest backup has not been checked (${last.result})`, detail: 'A check proves it can really be read back.', fix: { label: 'Check it', action: 'pm51-backup-verify' } });
    if (!k.saved) out.push({ home: true, title: 'You have no Recovery Kit', detail: 'It holds the key to your backups. Without it they cannot be opened if this Server is lost.', fix: { label: 'Save a Recovery Kit', action: 'pm51-backup-kit-save' } });
    else if (!k.tested) out.push({ home: true, title: 'Your Recovery Kit has not been tested', detail: 'It is the key to your backups if this Server is lost. A test proves it opens one.', fix: { label: 'Test the kit', action: 'pm51-backup-kit-test' } });
    for (const p of places(st)) if (p !== main && p.state === 'Needs sign-in') out.push({ tone: 'info', title: `${p.name} needs you to sign in`, detail: 'Nothing is backed up there until you do.', fix: { label: 'Sign in', action: 'pm51-backup-dest-signin', data: { id: p.id } } });
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign((st) => needs(st), { chapter: 'keeping' }));
  const chapter = SMX.chapters.find((c) => c.id === 'keeping');
  if (chapter && !chapter.status) chapter.status = (ctx) => { const n = needs(ctx.st).filter((x) => x.home).length; const last = latest(ctx.st); return n ? { tone: 'attention', text: n === 1 ? '1 needs you' : `${n} need you` } : last ? { tone: 'ready', text: `Backed up ${when(last.time).split(' at ')[0]}` } : { tone: 'off', text: 'No backup yet' }; };

  /* PMConcept7's five Recovery Kit actions (save, test, hand over the key, rotate, re-encrypt) end in a "protected
     handoff" panel that waits for the Server. In PMConcept7 as built they stop with an error toast instead ("Cannot read
     properties of null (reading 'client')": its concept host has no environment record unless onboarding ran first). The
     concept shows the intended behaviour: while one of these flows, started from these pages, is open, the lookup is
     told there is no host, so PMConcept7's own panel opens and waits as designed. Nothing else is changed. */
  let handoffTimer = 0;
  W.document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('#smx-root [data-action^="pm51-backup-k"]') : null;
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    let broken = false; try { const O = W.O55; broken = !!(O && O.S) && !(O.S.env && O.S.env.client) && !W.__O55_OWNER_CONTEXT__; } catch (err) { broken = false; }
    if (!broken) return;
    const mine = W.__O55_OWNER_CONTEXT__ = { project: '' };
    W.clearInterval(handoffTimer); let quiet = 0;
    handoffTimer = W.setInterval(() => { const open = [...W.document.querySelectorAll('[role="dialog"], dialog[open], [aria-modal="true"], .drawer-wrap, .pm51-drawer-wrap, .modal-wrap, .pm51-confirm, .o55-sheet')].some((n) => { const r = n.getBoundingClientRect(); return r.width > 4 && r.height > 4 && (n.checkVisibility ? n.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true) && !n.closest('[inert]'); }); quiet = open ? 0 : quiet + 1; if (quiet >= 3) { W.clearInterval(handoffTimer); if (W.__O55_OWNER_CONTEXT__ === mine) delete W.__O55_OWNER_CONTEXT__; } }, 400);
  }, true);

  /* ================================================================== Overview: is my work safe? */
  SMX.extend('keeping', {
    noPagesList: true,
    legacy: [BK('backup')],
    keywords: ['backup', 'back up', 'restore', 'recovery kit', 'recovery key', 'schedule', 'encryption', 'safe', 'lost'],
    lead: (ctx) => {
      const st = ctx.st; const B = bk(st); const last = latest(st); const main = mainPlace(st); const sch = schedules(st); const nd = needs(st); const [kw, kt] = kitWord(st); const k = B.recoveryKit || {};
      const lastPlace = last ? places(st).find((p) => p.name === last.destination) : null;
      return [
        { key: 'summary', html: ui.summary({ icon: 'archive', tone: nd.some((n) => n.tone !== 'info') ? 'attention' : 'ready', lines: [
          last ? `Your work was last backed up ${ui.b(when(last.time))} to ${lastPlace ? ui.word(last.destination, { go: placeRoute(lastPlace) }) : ui.b(last.destination)}${checked(last) ? ', and that backup was checked: it can be read back' : ''}.` : 'Your work has not been backed up yet.',
          B.automatic && sch.filter((s) => s.enabled).length ? `Backups run by themselves, ${h(sch.filter((s) => s.enabled).map(everyWhen).join(' and '))}. You can go back to any of ${ui.word(count(runs(st).length, 'backup'), { go: 'keeping/restore' })}.` : B.automatic ? 'Automatic backups are on, but no schedule is switched on.' : `Backups do not run by themselves: ${ui.word('automatic backups are off', { go: 'keeping', anchor: 'schedule' })}.`
        ] }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'archive', title: 'Back up now', sub: 'Runs in the background; you can keep working', action: 'pm51-backup-now' },
          { icon: 'restore', title: 'Get something back', sub: 'A file, this whole project, or the whole Server', go: 'keeping/restore' },
          { icon: 'test', title: 'Check the latest backup', sub: 'Proves it can really be read back', action: 'pm51-backup-verify' }
        ], { title: 'What do you want to do?', cols: 3 }) },
        { key: 'what', html: ui.card({ title: 'What is backed up', body: ui.rows([
          { label: 'Puppet Master’s own records of this project', help: 'Settings, history, Goals and chats.', status: ui.status('Always included', 'info') },
          { label: 'Project files', help: 'The files in the project’s folder.', control: toggle(!!(B.protected || {}).files, { action: 'pm51-backup-scope', data: { key: 'files' }, label: 'Back up project files' }) },
          { label: 'Version history', help: 'Every saved change and branch, from Git and Jujutsu.', control: toggle(!!(B.protected || {}).history, { action: 'pm51-backup-scope', data: { key: 'history' }, label: 'Back up version history' }) }
        ]) }) },
        { key: 'schedule', html: ui.card({ title: 'When backups run', anchor: 'schedule', help: B.automatic ? 'Each schedule keeps its own number of backups; older ones wait for your review before they are removed.' : 'Paused while backing up by itself is off.', side: ui.btn({ label: 'Add a schedule', icon: 'plus', action: 'pm51-backup-schedule', data: { id: '' } }), body: ui.rows([
          { label: 'Back up by itself', help: 'On the schedules below. Off means only the backups you start are made.', control: toggle(!!B.automatic, { action: 'pm51-backup-auto', label: 'Automatic backups' }) },
          ...sch.map((s) => ({ label: s.name, help: `${everyWhen(s).replace(/^e/, 'E')} · to ${s.destination} · keeps the newest ${keepN(s) || s.retention}`, status: ui.status(!B.automatic ? 'Paused' : s.enabled ? 'On' : 'Off', !B.automatic || !s.enabled ? 'off' : 'ready'), control: ui.btn({ label: 'Edit', action: 'pm51-backup-schedule', data: { id: s.id } }) }))
        ]) + (sch.length ? '' : `<p class="smx-quiet-line smx-pad">No schedule yet. Add one so backups run by themselves.</p>`) }) },
        { key: 'kit', html: ui.card({ title: 'Recovery Kit', anchor: 'kit', help: 'The key to your backups, kept by you and not by Puppet Master. It is separate from your account: you need it if this Server is lost.', side: ui.btn({ label: k.saved ? 'Save the kit again' : 'Save a Recovery Kit', icon: 'key', primary: !k.saved, action: 'pm51-backup-kit-save' }), body: ui.rows([
          { label: 'Your kit', help: k.tested ? 'A test proved it opens a backup.' : k.saved ? 'Testing proves the saved kit really opens a backup. The kit stays in your hands.' : 'Save it somewhere away from this Server: a file, a printout or a USB drive.', status: ui.status(kw, kt), control: ui.btn({ label: 'Test the kit', icon: 'test', action: 'pm51-backup-kit-test', disabled: !k.saved, reason: 'Save the Recovery Kit first.' }) },
          { label: 'The recovery key', help: 'The key inside the kit. It is handed to you once, after you confirm it is you, and is never put on the clipboard.', control: ui.btn({ label: 'Hand me the key…', icon: 'key', action: 'pm51-backup-key-copy', disabled: !k.saved, reason: 'Save the Recovery Kit first.' }) }
        ]) + `<p class="smx-quiet-line smx-pad">Saving, printing, testing and handing over all go through a protected handoff: the kit is shown only to you, once, and Puppet Master keeps no copy.</p>` }) },
        { key: 'pages', html: ui.pages('keeping', ctx, { title: 'Everything in this chapter' }) },
        { key: 'links', html: ui.links([{ label: 'Check everything about backups', action: 'pm51-backup-diagnostics' }, { label: 'How backups work', action: 'pm51-backup-help' }, { label: 'Put the backup choices back', action: 'pm51-backup-reset' }, { label: 'Run a full checkup', go: 'system' }]) }
      ];
    },
    more: [
      { key: 'server', html: () => ui.card({ title: 'The whole Server', anchor: 'server', help: 'Everything on the Server, not just this project. Use it before replacing the Server or its disks.', side: ui.btn({ label: 'Back up the whole Server', icon: 'archive', action: 'pm51-backup-server' }), body: ui.facts([['Included', 'The Server’s settings, every project, their histories and their receipts'], ['Left out', 'Caches, programs that are running, and secrets themselves (only where they are kept)']]) }), count: 0 },
      { key: 'speed', html: (ctx) => { const B = bk(ctx.st); return ui.card({ title: 'How fast backups upload', body: ui.rows([
        { label: 'Fastest a backup may upload', help: 'A limit keeps backups from crowding out everything else on your connection.', control: select(speedOf(B), ['No limit', '10 MB/s', '40 MB/s'], { action: 'pm51-backup-bandwidth', label: 'Upload speed limit' }) },
        speedOf(B) === 'No limit' ? null : { label: 'Only hold back during the day', help: 'At night backups upload at full speed.', control: toggle(dayOnly(B), { action: 'pm51-backup-bandwidth-day', label: 'Only during the day' }) }
      ]) }); }, count: 0 }
    ],
    moreLabel: 'The whole Server, and upload speed', moreHelp: 'Back up everything on the Server; limit how fast backups upload',
    expert: [
      { key: 'key', html: (ctx) => { const st = ctx.st; const k = bk(st).recoveryKit || {}; return ui.card({ title: 'Looking after the key', help: 'Rarely needed. A rotation keeps the same backups. Re-encrypting is for a key someone else may have.', body: ui.rows([
        { label: 'Give the kit a fresh key slot', help: 'A new slot is added and checked, then the old one is removed. The same backups stay readable, and your kit keeps working.', control: ui.btn({ label: 'Rotate key slot', icon: 'key', action: 'pm51-backup-key-rotate', disabled: !k.saved, reason: 'Save the Recovery Kit first.' }) },
        { label: 'The key may have been taken', help: 'Not a rotation: the backups are encrypted again with a brand-new key. Backups made before this stay exposed if the old key was taken.', control: ui.btn({ label: 'Re-encrypt…', icon: 'restore', danger: true, action: 'pm51-backup-key-reencrypt', disabled: !latest(st), reason: 'There is no backup to re-encrypt yet.' }) }
      ]) + ui.facts([['Last rotation', k.rotatedAt || 'Never'], ['Re-encrypted', k.reencryptedAt || 'Never']]) }); }, count: 0 },
      { key: 'tech', html: (ctx) => { const st = ctx.st; const last = latest(st); const main = mainPlace(st); return ui.card({ title: 'Technical details', body: ui.facts([['Encryption', 'Each backup is encrypted before it leaves the Server; the key lives in your Recovery Kit'], ['Last receipt', last ? `${last.receipt} · ${last.time}` : 'None'], ['Backups go first to', main ? main.name : 'Nowhere yet']]) }); }, count: 0 }
    ],
    expertLabel: 'Looking after the key, and technical details', expertHelp: 'Rotating or replacing the key that locks your backups',
    changes: [
      { was: 'Backup & Restore is the 26th of 29 Settings pages, inside “System”. It opens on a section, “Protect your work”, whose rows are a switch, a destination name, “Last backup Verified => Today · 2:00 AM · TrueNAS backup” and a link to another tab.', now: 'The chapter opens on the answer to “is my work safe?”: when the last backup ran, where it went, whether it was checked, and how often backups run, as two sentences. Then the three things people come to do.' },
      { was: 'Six safety actions are inside a closed “More options”: “Back up whole server”, “Verify latest backup”, “Check backups”, “Browse”, “Verify recovery point” and “Export backup history”. A person who never opens it cannot find them.', now: '“Check the latest backup” is one of the three tasks. Looking inside a backup and checking one sit beside the button that starts getting work back. “Check everything about backups” is a link on this page. Only the whole-Server backup and upload speed stay folded.' },
      { was: 'The Recovery Kit row reads “Status Not tested => Saved · Not tested [Test Recovery Kit]”, and the button beside “Recovery key” says “Copy Recovery Key” under a sentence saying the key is never put on the clipboard.', now: 'A kit that is saved but not tested is listed under “Needs you”, here and on Settings Home, with the one button that fixes it. The key’s button says what it does: “Hand me the key…”.' },
      { was: '“Test Recovery Kit” does not open its panel in PMConcept7: it ends in an error toast, “Control could not complete — Pm51 Backup Kit Test: Cannot read properties of null (reading ‘client’)”. Saving the kit, handing over the key, rotating and re-encrypting stop the same way one step later.', now: 'The concept shows the intended behaviour: PMConcept7’s own “Protected handoff” panel opens and waits (“Waiting for the protected handoff”). The defect is PMConcept7’s and is listed in the build report.' },
      { was: '“Rotate key slot”, “Suspected compromise”, “encryption domain” and “re-encrypt” share “More options” with upload speed.', now: 'They are under “For experts”, each with a sentence in plain words saying when it is needed.' },
      { was: 'The four tabs are Backup, Destinations, Restore and History; “Reset backup defaults”, “How backups work” and “Open Readiness & Doctor” repeat under all four.', now: 'Tabs became pages named for what a person wants: Where backups go, Get work back (which also lists every backup that ran). The three links appear once.' }
    ]
  });
  /* links written before this chapter existed point at "keeping/backups" (Settings Home, a computer's page) */
  SMX.page({ id: 'keeping/:old', chapter: 'keeping', parent: 'keeping', title: 'Backups & history', changes: ['Not a page of its own: an address kept so that links written as “keeping/backups” (on Settings Home and on a computer’s page) open Backups.'], lead: (ctx) => { W.setTimeout(() => { if (SMX.route === ctx.route) SMX.go('keeping', { replace: true, anchor: (ctx.params || {}).old === 'backups' ? '' : (ctx.params || {}).old }); }, 0); return []; } });

  /* ================================================================== Where backups go */
  const placeThing = (st, p) => ({ icon: PLACE_ICON[p.family] || 'nas', name: p.name, tag: p.default ? 'Backups go here first' : '', sub: `${p.type} · ${p.account}`, sub2: p.usedBy && !/nothing/i.test(p.usedBy) ? `Used by ${p.usedBy}` : 'No schedule uses it yet', status: { text: p.state, tone: placeTone(p) }, go: placeRoute(p) });
  SMX.extend('keeping/places', {
    title: 'Where backups go', icon: 'cloud',
    purpose: 'The places a backup is sent: another computer or a NAS, a cloud account, or storage you rent. Every backup is locked with your key before it leaves the Server.',
    legacy: [BK('destinations')],
    keywords: ['destination', 'place', 's3', 'google drive', 'onedrive', 'nas', 'sftp', 'webdav', 'bucket', 'backblaze', 'nextcloud'],
    blurb: (ctx) => { const m = mainPlace(ctx.st); return `${count(places(ctx.st).length, 'place')}${m ? ` · backups go to ${m.name} first` : ''}`; },
    status: (ctx) => { const bad = places(ctx.st).filter((p) => p.state !== 'Ready').length; return !places(ctx.st).length ? { text: 'None yet', tone: 'attention' } : bad ? { text: bad === 1 ? '1 needs sign-in' : `${bad} need sign-in`, tone: 'attention' } : { text: 'Ready', tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st; const fam = (bk(st).destinationFamilies || []).map((f) => [f[0], f[1].join(' · ')]);
      return [
        { key: 'places', html: ui.things({ cls: 'smx-keep-rows', title: 'Places backups go', help: 'Open one to test it, change it or remove it.', add: { label: 'Add a place', action: 'pm51-backup-dest-add' }, items: places(st).map((p) => placeThing(st, p)), empty: { icon: 'cloud', title: 'No place yet', text: 'Backups need somewhere to go that is not this Server.', fix: { label: 'Add a place', icon: 'plus', action: 'pm51-backup-dest-add' } } }) },
        { key: 'kinds', html: fam.length ? ui.card({ title: 'What a place can be', help: 'Adding one asks for the kind first, then the service.', body: ui.facts(fam) }) : '' }
      ];
    },
    changes: [
      { was: '“Destinations” is a tab with a list beside a detail pane. Its vocabulary is “destination”, “Folder / NAS share”, “bucket”, “endpoint”, “object lock” and “quota”.', now: 'The page is “Where backups go” and a destination is “a place”. Each place says in a line what it is, which schedules use it and whether it is ready, and opens on a page of its own. The storage terms are under “For experts” on that page.' },
      { was: '“Make default” and “Remove” are inside “More actions”; both are greyed out for the default place, with the reason only inside the menu.', now: 'On a place’s page they are ordinary buttons, “Send backups here first” and “Remove this place…”, and each says why when it cannot be used.' }
    ]
  });

  /* ---- one place. "Send backups here first" and "Remove" exist only inside PMConcept7's "More actions" menu of a
     destination; the same change and the same confirmation, as ordinary buttons */
  const placeOf = (ctx) => places(ctx.st).find((p) => p.id === (ctx.params || {}).id) || null;
  SMX.act('keeping-place-first', (el) => { const id = el.getAttribute('data-id'); const s = eng().getState(); const list = ((s.pm51 || {}).backup || {}).destinations || []; const p = list.find((x) => x.id === id); if (!p) return; list.forEach((x) => { x.default = x.id === id; }); eng().setState(s); SMX.toast('Backups go here first', p.name); });
  SMX.act('keeping-place-remove', (el) => {
    const id = el.getAttribute('data-id'); const p0 = places(SMX.fresh()).find((x) => x.id === id); if (!p0) return;
    kit().confirm(`Remove ${p0.name}?`, 'Backups already stored there are not deleted. Schedules using it need a new destination.', 'Remove', () => { const s = eng().getState(); const B = (s.pm51 || {}).backup; if (!B) return; B.destinations = (B.destinations || []).filter((x) => x.id !== id); eng().setState(s); SMX.toast('Place removed', p0.name, 'warning'); SMX.go('keeping/places', { replace: true }); }, true);
  });
  SMX.page({
    id: 'keeping/places/:id', chapter: 'keeping', parent: 'keeping/places',
    title: (ctx) => { const p = placeOf(ctx); return p ? p.name : 'A place for backups'; },
    nav: (ctx) => { const p = placeOf(ctx); return p ? p.name : 'A place for backups'; },
    purpose: (ctx) => { const p = placeOf(ctx); return p ? `A place backups are sent to: ${lower(p.type)}.` : ''; },
    legacy: [BK('destinations')],
    headSide: (ctx) => { const p = placeOf(ctx); return p ? ui.btn({ label: 'Test this place', icon: 'test', action: 'pm51-backup-dest-test', data: { id: p.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, p = placeOf(ctx);
      if (!p) return [{ key: 'gone', html: ui.card({ title: 'This place is no longer in the list', body: ui.btn({ label: 'Back to Where backups go', go: 'keeping/places' }) }) }];
      const sign = p.state === 'Needs sign-in'; const here = runs(st).filter((x) => x.destination === p.name);
      return [
        { key: 'summary', html: ui.summary({ icon: PLACE_ICON[p.family] || 'nas', tone: placeTone(p), lines: [sign ? `${ui.b(p.name)} needs you to sign in before anything can be backed up there.` : `${ui.b(p.name)} is ${h(lower(p.state))}${p.default ? ' and is where backups go first' : ''}.`, here.length ? `${count(here.length, 'backup')} ${here.length === 1 ? 'is' : 'are'} kept here; the newest is from ${h(when(here[0].time))}.` : 'No backup has been sent here yet.'], side: sign ? ui.btn({ label: 'Sign in', icon: 'key', primary: true, small: false, action: 'pm51-backup-dest-signin', data: { id: p.id } }) : '' }) },
        { key: 'facts', html: ui.card({ title: 'About this place', body: ui.rows([
          { label: 'Kind', value: `${p.type}${p.family && p.family !== p.type ? ` (${lower(p.family)})` : ''}` },
          { label: p.family === 'Cloud account' ? 'Account' : 'Address', value: p.account },
          { label: 'Folder', value: p.path },
          { label: 'Locked with your key', help: 'A backup is encrypted before it leaves the Server, so whoever runs this place cannot read it.', value: p.encryption, status: /ready|encrypted/i.test(String(p.encryption)) ? ui.status('Ready', 'ready') : ui.status('Needs attention', 'attention') },
          { label: 'Used by', value: p.usedBy || 'Nothing yet', control: ui.btn({ label: 'Schedules', go: 'keeping', anchor: 'schedule' }) },
          { label: 'Last checked', value: p.lastCheck === 'Not checked' ? 'Not checked yet' : p.lastCheck }
        ]) }) },
        { key: 'backups', html: here.length ? ui.things({ cls: 'smx-keep-rows', title: 'Backups kept here', items: here.map((x) => ({ icon: 'archive', name: x.time, tag: holds(x), sub: x.size, status: { text: x.result, tone: checked(x) ? 'ready' : 'attention' }, go: runRoute(x) })) }) : '' },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Change its details', icon: 'edit', action: 'pm51-backup-dest-edit', data: { id: p.id } })}${ui.btn({ label: 'Send backups here first', icon: 'check', do: 'keeping-place-first', data: { id: p.id }, disabled: !!p.default, reason: 'Backups already go here first.' })}${ui.btn({ label: 'Remove this place…', icon: 'trash', danger: true, do: 'keeping-place-remove', data: { id: p.id }, disabled: !!p.default, reason: 'Backups go here first. Choose another place for that, then remove this one.' })}</div>` }
      ];
    },
    expert: [{ key: 'tech', html: (ctx) => { const p = placeOf(ctx); if (!p) return ''; const bucket = p.family === 'Storage bucket'; return ui.card({ title: 'Storage details', body: ui.facts(bucket ? [['Bucket', p.path], ['Region', p.region || 'Automatic'], ['Endpoint', p.endpoint || 'Provider default']] : [['Location', p.path], ['Share type', p.type]]) + ui.facts([['Locking', 'One backup at a time per place'], ['Object lock', bucket ? 'Off' : 'Not available for this kind'], ['Quota', p.quota || 'No limit set']]) }); }, count: 0 }],
    changes: [
      { was: 'A destination’s details share the tab with the list of all of them; its two everyday actions are a header button (“Edit” or “Sign In”) and “Test destination” on the Connection row, and the rest are in a menu.', now: 'A place has a page: whether it is ready, what it is, the backups kept there, and its four actions as buttons. “Technical details” and “Locking and quota” became one card under “For experts”.' }
    ]
  });

  /* ================================================================== Get work back */
  const WHAT = [['Whole workspace', 'This whole project'], ['Some files', 'Some files'], ['Whole server', 'The whole Server']];
  const WHERE = [['In place', 'Where it is now'], ['As a new workspace', 'In a new project beside it']];
  const WHAT_HELP = { 'Whole workspace': 'Settings, history, Goals, chats and files of this project.', 'Some files': 'You pick the files and folders from the backup.', 'Whole server': 'Everything on the Server. It needs a backup of the whole Server.' };
  const picked = (st) => { const R = restoreOf(st); const hit = runs(st).filter((x) => snapId(x) === R.whichId); const rec = hit.length === 1 ? hit[0] : null; return { R, rec, gone: !rec && runs(st).length > 0, mismatch: !!rec && !fits(R.what, rec) }; };
  SMX.act('keeping-use-backup', (el) => { SMX.run('pm51-backup-restore-from', { id: el.getAttribute('data-id') }); SMX.go('keeping/restore'); });
  SMX.act('keeping-look-inside', (el) => { SMX.run('pm51-backup-restore-from', { id: el.getAttribute('data-id') }); SMX.run('pm51-backup-browse'); });
  SMX.extend('keeping/restore', {
    title: 'Get work back', icon: 'restore',
    purpose: 'Bring back a file, this whole project or the whole Server from a backup. You see what will happen first, and nothing changes until you confirm.',
    legacy: [BK('restore'), BK('history')],
    keywords: ['restore', 'recover', 'undo', 'bring back', 'lost', 'deleted', 'browse backup', 'verify'],
    blurb: (ctx) => { const l = latest(ctx.st); return l ? `${count(runs(ctx.st).length, 'backup')} to choose from · the newest is from ${when(l.time)}` : 'No backup to go back to yet'; },
    status: (ctx) => { const l = latest(ctx.st); return !l ? { text: 'No backup yet', tone: 'attention' } : checked(l) ? { text: 'Ready', tone: 'ready' } : { text: 'Latest not checked', tone: 'attention' }; },
    lead: (ctx) => {
      const st = ctx.st; const list = runs(st); const { R, rec, gone, mismatch } = picked(st);
      if (!list.length) return [{ key: 'none', html: ui.card({ body: `<div class="smx-empty">${SMX.icon('restore')}<div class="smx-empty-title">There is no backup to go back to yet</div><div class="smx-empty-text">Once a backup has run, this page lets you bring back a file, the project or the whole Server from it.</div>${ui.btn({ label: 'Back up now', primary: true, action: 'pm51-backup-now' })}</div>` }) }];
      const which = list.filter((x) => snapId(x) && fits(R.what, x)).map((x) => [snapId(x), `${x.time} · ${lower(holds(x))} · ${x.size}`]);
      if (gone) which.unshift([R.whichId, 'The chosen backup is no longer listed']);
      if (mismatch) which.unshift([R.whichId, 'The chosen backup is not of the whole Server']);
      const whole = R.what === 'Whole server'; const whatWord = (WHAT.find((x) => x[0] === R.what) || WHAT[0])[1];
      const review = rec && !mismatch ? `${whatWord} from the backup of ${when(rec.time)}, ${whole || R.where === 'In place' ? 'put back where it is now' : 'as a new project beside this one'}.` : gone ? 'The chosen backup is no longer listed. Choose another one.' : mismatch ? 'Bringing back the whole Server needs a backup of the whole Server. None of these is one.' : 'Nothing to bring back yet.';
      const why = gone ? 'The chosen backup is no longer listed. Choose another one.' : mismatch ? 'Bringing back the whole Server needs a backup of the whole Server.' : 'There is no backup to go back to yet.';
      return [
        { key: 'steps', html: ui.card({ title: 'What do you want back?', help: 'Nothing changes until you confirm at the end.', cls: 'smx-restore', body:
          ui.sentence(`<span>Bring back</span>${seg(R.what, WHAT, { action: 'pm51-backup-restore-what', label: 'What to bring back' })}`) + `<p class="smx-sentence-note">${h(WHAT_HELP[R.what] || '')}</p>`
          + ui.sentence(`<span>from the backup of</span>${which.length ? select(R.whichId, which, { action: 'pm51-backup-restore-which', label: 'Which backup', width: 420 }) : '<strong>no backup that fits</strong>'}`) + `<p class="smx-sentence-note">${rec && !mismatch ? `Kept on ${h(rec.destination)}. ${checked(rec) ? 'It was checked: it can be read back.' : h(rec.result)}` : h(review)}</p>`
          + (whole ? ui.sentence('<span>and put it back onto this Server.</span>') : ui.sentence(`<span>and put it</span>${seg(R.where, WHERE, { action: 'pm51-backup-restore-where', label: 'Where to put it' })}`)) + `<p class="smx-sentence-note">${whole || R.where === 'In place' ? 'This replaces what is here now. A safety copy of how things are now is made first, so you can go back.' : 'What is here now is kept, and a new project is made beside it.'}</p>`
          + `<div class="smx-restore-go"><p class="smx-restore-review">${h(review)}</p><div class="smx-btn-row">${ui.btn({ label: 'Bring it back…', icon: 'restore', primary: true, small: false, action: 'pm51-backup-restore-start', disabled: !rec || mismatch, reason: why })}${ui.btn({ label: 'Look inside this backup', icon: 'folder', small: false, action: 'pm51-backup-browse', disabled: !rec, reason: why })}${ui.btn({ label: 'Check it can be read back', icon: 'test', small: false, action: 'pm51-backup-verify-selected', disabled: !rec, reason: why })}</div></div>` }) },
        { key: 'list', html: ui.things({ cls: 'smx-keep-rows', title: 'Every backup that ran', help: 'Newest first. Open one to see what it holds, or to start from it.', items: list.map((x) => ({ icon: 'archive', name: x.time, tag: snapId(x) === R.whichId ? 'Chosen above' : '', sub: `${holds(x)} · ${x.size} · kept on ${x.destination}`, status: { text: checked(x) ? 'Checked' : x.result, tone: checked(x) ? 'ready' : 'attention' }, go: runRoute(x) })) }) },
        { key: 'links', html: ui.links([{ label: 'Save the list of backups as a file', action: 'pm51-backup-history-export' }, { label: 'Undo a change to version history instead', go: 'source/rules', anchor: 'undo' }, { label: 'Pick up a Goal from its saved progress', go: 'planning/recovery' }]) }
      ];
    },
    expert: [{ key: 'compat', html: (ctx) => ui.card({ title: 'Will an older backup still open?', body: ui.facts([['Backups were made by', 'Puppet Master 0.8.0'], ['This version', (ctx.st.updates || {}).currentVersion || '0.8.0-dev'], ['Result', 'Compatible · no conversion needed']]) }), count: 0 }],
    changes: [
      { was: 'Restore is four numbered steps on a tab: “What” (Whole workspace | Some files | Whole server), “Which backup”, “Where” (In place | As a new workspace) and “Review”, with “Start restore”. The backups themselves are listed on a different tab, History.', now: 'It reads as one sentence with PMConcept7’s own controls in it: “Bring back … from the backup of … and put it …”, followed by what will happen in words. The list of every backup is on the same page, and the chosen one is marked.' },
      { was: '“Browse” and “Verify recovery point”, the two ways to be sure before restoring, are folded under “More options”. The choice reads “Today · 2:00 AM · Incremental · 182 MB”.', now: '“Look inside this backup” and “Check it can be read back” sit beside “Bring it back…”. A backup says what it holds in words: “changes since the backup before” or “everything”.' },
      { was: 'Choosing “Whole server” empties the backup list and disables “Start restore”; the reason is one line in the Review step.', now: 'The sentence under the choice says a backup of the whole Server is needed, and each unavailable button gives the same reason.' },
      { was: '“Restore” names six things in Settings: a settings restore point, this restore, a whole-Server backup, a history event, a Goal checkpoint and an update’s restore point.', now: 'This page is “Get work back” and is only about backups. It links to the two neighbours people confuse it with: undoing a change to version history, and picking up a Goal from its saved progress.' }
    ]
  });

  /* ---- one backup */
  const runOf = (ctx) => { const hit = runs(ctx.st).filter((x) => snapId(x) === (ctx.params || {}).id); return hit.length === 1 ? hit[0] : null; };
  SMX.page({
    id: 'keeping/restore/:id', chapter: 'keeping', parent: 'keeping/restore',
    title: (ctx) => { const x = runOf(ctx); return x ? `Backup of ${when(x.time)}` : 'Backup'; },
    nav: (ctx) => { const x = runOf(ctx); return x ? x.time : 'Backup'; },
    purpose: (ctx) => { const x = runOf(ctx); return x ? `What was saved at that moment: ${lower(holds(x))}.` : ''; },
    legacy: [BK('history')],
    lead: (ctx) => {
      const st = ctx.st, x = runOf(ctx);
      if (!x) return [{ key: 'gone', html: ui.card({ title: 'This backup is no longer in the list', body: ui.btn({ label: 'Back to Get work back', go: 'keeping/restore' }) }) }];
      const place = places(st).find((p) => p.name === x.destination); const id = snapId(x);
      return [
        { key: 'summary', html: ui.summary({ icon: 'archive', tone: checked(x) ? 'ready' : 'attention', lines: [`This backup was made ${ui.b(when(x.time))} and is kept on ${place ? ui.word(x.destination, { go: placeRoute(place) }) : ui.b(x.destination)}.`, checked(x) ? 'It was checked: it can be read back.' : `It has not been checked (${h(x.result)}).`], side: ui.btn({ label: 'Get work back from it', icon: 'restore', primary: true, small: false, do: 'keeping-use-backup', data: { id } }) }) },
        { key: 'facts', html: ui.card({ title: 'About this backup', body: ui.rows([
          { label: 'Made', value: x.time },
          { label: 'What it holds', help: /full/i.test(String(x.type)) ? 'A full backup: a complete copy.' : 'An incremental backup: only what changed. Getting work back from it uses the earlier backups too, by itself.', value: holds(x) },
          { label: 'Kept on', value: x.destination, control: place ? ui.btn({ label: 'Open', go: placeRoute(place) }) : '' },
          { label: 'Size', value: x.size },
          { label: 'Result', help: checked(x) ? 'It was read back and compared after it was made.' : '', value: x.result },
          { label: 'Receipt', help: 'The number to quote if you ever need help with this backup.', value: x.receipt || '—' }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Look inside', icon: 'folder', do: 'keeping-look-inside', data: { id } })}${ui.btn({ label: 'Check it can be read back', icon: 'test', action: 'pm51-backup-verify-selected', data: { id } })}</div>` }
      ];
    },
    changes: [
      { was: 'A backup opens as a side panel over the History tab: six facts and two buttons, “Restore from this backup” (which jumps to another tab) and “Verify”.', now: 'A backup has a page with the same facts in plain words. “Get work back from it” goes to the sentence on “Get work back” with this backup chosen; looking inside and checking are buttons here.' },
      { was: 'The list calls a backup “Incremental backup” or “Full backup”; only the schedule editor says what the words mean.', now: 'The row “What it holds” says it, and adds that getting work back from a changes-only backup uses the earlier ones by itself.' }
    ]
  });

  /* ================================================================== History of this project */
  SMX.extend('keeping/history', {
    title: 'History of this project', icon: 'history',
    purpose: 'What happened and when, the sessions it happened in, and the files the work produced.',
    legacy: [HI('timeline'), HI('sessions'), HI('artifacts')],
    keywords: ['timeline', 'activity', 'sessions', 'artifacts', 'files produced', 'export history', 'import history', 'compare', 'receipts'],
    blurb: (ctx) => `${count(timeline(ctx.st).filter((t) => !t.project).length, 'event')} · ${count(sessions(ctx.st).length, 'session')} · ${count(files(ctx.st).length, 'file')} produced`,
    status: (ctx) => { const a = sessions(ctx.st).filter((s) => s.state === 'Active').length; return a ? { text: `${a} active`, tone: 'ready' } : { text: 'Quiet', tone: 'off' }; },
    lead: (ctx) => {
      const st = ctx.st; const all = timeline(st); const F = filterOf(st);
      const everywhere = String(SMX.val(V.scope)) === 'All projects', approvedOnly = on(SMX.val(V.approved)), withArchived = on(SMX.val(V.archived));
      const types = ['All', ...new Set(all.map((t) => t.type))];
      const rows = all.filter((t) => (everywhere || !t.project) && (!approvedOnly || t.approved !== false) && (withArchived || !t.archived) && (F.type === 'All' || t.type === F.type));
      const first = rows[0];
      let listHtml = '';
      try { listHtml = rows.length ? kit().list(rows.map((t) => ({ title: t.event, meta: [t.time, t.device, t.project ? `in ${t.project}` : '', t.approved === false ? 'waiting for approval' : '', t.archived ? 'archived' : ''].filter(Boolean).join(' · '), avatar: kit().icon(TYPE_ICON[t.type] || 'clock'), end: kit().chip(t.type) + kit().icon('chevron'), action: 'pm51-history-event', data: { index: all.indexOf(t) } }))) : `<div class="smx-empty">${SMX.icon('history')}<div class="smx-empty-title">Nothing matches</div><div class="smx-empty-text">Choose another kind, or switch “Approved only” off.</div></div>`; } catch (e) { listHtml = ''; }
      let search = ''; try { search = kit().input('', { action: 'pm51-history-search', placeholder: 'Search what happened', label: 'Search what happened' }); } catch (e) { search = ''; }
      return [
        { key: 'summary', html: ui.summary({ icon: 'history', tone: 'info', lines: [first ? `The latest: ${ui.b(first.event)}, ${h(when(first.time))} on ${h(first.device)}.` : 'Nothing has been recorded yet.', `${ui.b(count(sessions(st).length, 'session'))} and ${ui.b(count(files(st).length, 'file'))} the work produced are kept. ${ui.word('How long each kind is kept', { go: 'keeping/cleanup' })} is one page.`] }) },
        { key: 'timeline', html: ui.card({ title: 'What happened', help: 'Newest first. Open an item for its details, or to compare it with an earlier one.', cls: 'smx-timeline', side: ui.btn({ label: 'Compare two', icon: 'layers', action: 'pm51-history-compare' }), body:
          `<div class="smx-filter" data-smx-covers="${h(V.scope)} ${h(V.approved)} ${h(V.archived)} ${h(V.compare)}">${search}${select(F.type, types.map((t) => [t, t === 'All' ? 'Every kind' : t]), { action: 'pm51-history-type', label: 'Kind' })}${ui.select(V.scope, { prefix: 'Show', width: 150 })}<label class="smx-filter-chip">${ui.toggle(V.approved, { label: 'Approved only' })}<span>Approved only</span></label><label class="smx-filter-chip">${ui.toggle(V.archived, { label: 'Include archived' })}<span>Include archived</span></label></div>${listHtml}` }) },
        { key: 'sessions', html: ui.things({ cls: 'smx-keep-rows', title: 'Sessions', anchor: 'sessions', help: 'A session keeps your Goals, chats and open editors together on one device. Open it on another device to carry on where you stopped.', add: { label: 'Start a new session', action: 'pm51-history-session-new' },
          items: sessions(st).map((s) => ({ icon: 'history', name: s.title, sub: `${s.device} · ${lower(s.updated)}`, sub2: `${count(s.artifacts || 0, 'file')} produced`, status: { text: s.state, tone: sessionTone(s.state) }, go: `keeping/session/${enc(s.id)}` })),
          empty: { icon: 'history', title: 'No sessions yet', text: 'A session starts the first time you open this project on a device.', fix: { label: 'Start a new session', action: 'pm51-history-session-new' } } }) },
        { key: 'files', html: ui.things({ cls: 'smx-keep-rows', title: 'Files the work produced', anchor: 'files', help: 'Puppet Master calls these artifacts: archives, receipts and recordings the assistant made along the way.',
          items: files(st).map((a) => ({ icon: fileIcon(a), name: a.name, tag: a.type, sub: `${a.size} · made by ${a.owner || 'this project'}`, sub2: keptFor(keepValue(a.retention)), go: `keeping/file/${enc(a.id)}` })),
          empty: { icon: 'file', title: 'No files yet', text: 'Files the assistant produces show up here.' } }) }
      ];
    },
    more: [
      { key: 'transfer', html: () => ui.card({ title: 'Take history out, or bring it in', body: `<div data-smx-covers="${h(V.exportRow)}">${ui.rows([
        { label: 'Save this history as a file', help: 'Sessions, events and details of the files. Passwords and keys are left out.', control: ui.btn({ label: 'Export…', icon: 'download', action: 'run-setting-action', data: { setting: V.exportRow, settingId: V.exportRow } }) },
        { label: 'Bring in a history file', help: 'From another project or an older backup. You see what would change before anything is added.', control: ui.btn({ label: 'Import…', icon: 'upload', action: 'pm51-history-import' }) }
      ])}</div>` }), count: 1 },
      { key: 'where', html: (ctx) => { const extra = ((ctx.st.pm51 || {}).historyLocations || []).map((l) => [l.name, l.path]); return ui.card({ title: 'Where the files are stored', side: ui.btn({ label: 'Add a location', icon: 'plus', action: 'pm51-history-location-add' }), body: ui.facts([['Files the work produced', 'The folder “Artifacts” inside this project’s folder'], ['Recordings', 'This project’s media folder on your Server'], ['Temporary files', '/mnt/data, emptied when you clean up'], ...extra]) }); }, count: 0 },
      { key: 'receipt-detail', title: 'How much the record of each action says', help: 'More detail makes a richer history and takes longer to read. It changes nothing about what is done.', ids: ['system.advanced.receipts-verbosity'] },
      { key: 'receipts', html: (ctx) => { const st = ctx.st; const all = timeline(st); const n = sessions(st).reduce((x, s) => x + Math.max(1, Math.round((s.artifacts || 0) / 4)), 0); return ui.card({ title: 'Receipts', help: 'Each Goal leaves a receipt saying what it did.', body: ui.rows([
        { label: 'Receipts in this project', value: String(n) },
        { label: 'Latest receipt', value: all[0] ? `${all[0].time} · ${all[0].event}` : 'None' },
        { label: 'Kept for', value: `${SMX.val(V.runs) || 365} days`, control: ui.btn({ label: 'How long things are kept', go: 'keeping/cleanup', reveal: V.runs }) }
      ]) }); }, count: 0 }
    ],
    moreLabel: 'Export, import and where files are stored', moreHelp: 'Take history out or bring it in; storage locations; receipts',
    expert: [
      { key: 'lineage', html: () => ui.card({ title: 'In chats', body: ui.settings([V.lineage]) }), count: 1 },
      { key: 'tech', html: (ctx) => { const st = ctx.st; const all = timeline(st); return ui.card({ title: 'Technical details', body: ui.facts([['Events recorded', String(all.length)], ['Kept in', 'This project’s database on your Server'], ['Devices reporting', [...new Set(all.map((t) => t.device))].join(' · ')], ['Files produced', String(files(st).length)], ['Their size', files(st).map((a) => a.size).join(' + ') || '0']]) }); }, count: 0 }
    ],
    covers: { [V.scope]: '“Show”, above the list “What happened” on this page.', [V.approved]: '“Approved only”, above the list “What happened”.', [V.archived]: '“Include archived”, above the list “What happened”.', [V.compare]: 'The button “Compare two” on the list “What happened”, and inside each item.', [V.exportRow]: '“Save this history as a file”, under More options on this page.', [V.lineage]: 'The switch under For experts on this page.' },
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How history works', action: 'pm51-history-help' }, { label: 'Check the history', action: 'pm51-history-diagnostics' }]) }],
    changes: [
      { was: 'History & Artifacts is one of the two pages of a chapter called “Projects & Sync”, which lists no projects and has no sync setting. Its header reads “What happened in this workspace and the files it produced.”', now: 'It is “History of this project”, beside backups in “Backups & history”. Where a project is kept and how devices stay in step are in “Computers & remote access”.' },
      { was: 'Timeline, Sessions and Artifacts are three tabs. A session’s details sit in a pane beside the list; an artifact opens in a side panel; “Run diagnostics” repeats on all three.', now: 'One page, in the order people ask: what happened, the sessions, the files. A session and a file each open on a page of their own. “Check the history” appears once.' },
      { was: 'The files are called “artifacts” everywhere, with no explanation, and each ends in “Keep indefinitely”, “Keep for 1 year” or “Keep for 90 days”.', now: 'The list is “Files the work produced”, with one line saying Puppet Master calls them artifacts. Each says “Kept until you delete it” or “Kept for 1 year”, the wording every keep-for choice now uses.' },
      { was: '“Export history” and “Import a history archive” are under “More options” beside a “Receipts” block that points at “(Cleanup tab)” for its own value.', now: 'They stay folded, as “Take history out, or bring it in”. Receipts say how long they are kept and link to the one page where that is set.' }
    ]
  });

  /* ---- one session. Rename, Archive and Delete exist only inside PMConcept7's "More actions" menu of a session; the
     same changes and the same confirmation, as ordinary buttons */
  const sessionOf = (ctx) => sessions(ctx.st).find((s) => s.id === (ctx.params || {}).id) || null;
  const editSession = (id, fn) => { const s = eng().getState(); const list = (s.projectHistory || {}).sessions || []; const x = list.find((y) => y.id === id); if (!x) return null; fn(x, s); eng().setState(s); return x; };
  SMX.act('keeping-session-rename', (el) => {
    const id = el.getAttribute('data-id'); const s0 = sessions(SMX.fresh()).find((x) => x.id === id); if (!s0) return;
    try { kit().panel({ title: 'Rename session', subtitle: s0.title, body: kit().panelSection('Name', kit().field('Name', kit().input(s0.title, { label: 'Name', cls: 'smx-rename' }))), primaryLabel: 'Save', onPrimary: (wrap) => { const v = String((wrap.querySelector('.smx-rename') || {}).value || '').trim(); if (!v) return false; editSession(id, (x) => { x.title = v; }); SMX.soon(20); } }); } catch (e) { /* no panel */ }
  });
  SMX.act('keeping-session-archive', (el) => { const x = editSession(el.getAttribute('data-id'), (s) => { s.state = 'Archived'; }); if (x) SMX.toast('Session archived', x.title, 'info'); });
  SMX.act('keeping-session-delete', (el) => {
    const id = el.getAttribute('data-id'); const s0 = sessions(SMX.fresh()).find((x) => x.id === id); if (!s0) return;
    kit().confirm(`Delete “${s0.title}”?`, 'The session and its saved state are removed. Artifacts it produced stay under Artifacts.', 'Delete', () => { const s = eng().getState(); if (!s.projectHistory) return; s.projectHistory.sessions = (s.projectHistory.sessions || []).filter((x) => x.id !== id); eng().setState(s); SMX.toast('Session deleted', s0.title, 'warning'); SMX.go('keeping/history', { replace: true }); }, true);
  });
  SMX.page({
    id: 'keeping/session/:id', chapter: 'keeping', parent: 'keeping/history',
    title: (ctx) => { const s = sessionOf(ctx); return s ? s.title : 'Session'; },
    nav: (ctx) => { const s = sessionOf(ctx); return s ? s.title : 'Session'; },
    purpose: () => 'A session keeps your Goals, chats and open editors together, so you can carry on where you stopped, on this device or another.',
    legacy: [HI('sessions')],
    headSide: (ctx) => { const s = sessionOf(ctx); return s ? ui.btn({ label: s.state === 'Active' ? 'Open' : 'Carry on with it', icon: 'play', primary: true, action: 'pm51-history-session-resume', data: { id: s.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, s = sessionOf(ctx);
      if (!s) return [{ key: 'gone', html: ui.card({ title: 'This session is no longer there', body: ui.btn({ label: 'Back to History', go: 'keeping/history' }) }) }];
      const days = SMX.val(V.runs) || 365;
      return [
        { key: 'summary', html: ui.summary({ icon: 'history', tone: sessionTone(s.state) === 'off' ? 'info' : sessionTone(s.state), lines: [`${ui.b(s.title)} is ${h(lower(s.state))}. It was last used ${h(lower(s.updated))} on ${ui.b(s.device)}.`, s.state === 'Paused' ? 'Carrying on reopens its Goals, chats and editors where they stopped.' : s.state === 'Archived' ? 'It is archived: kept, but out of the way.' : ''] }) },
        { key: 'facts', html: ui.card({ title: 'About this session', body: ui.rows([
          { label: 'Device', value: s.device },
          { label: 'Last used', value: s.updated },
          { label: 'Files it produced', value: String(s.artifacts || 0), control: ui.btn({ label: 'See the files', go: 'keeping/history', anchor: 'files' }) },
          { label: 'Its Goal receipts are kept for', value: `${days} days`, control: ui.btn({ label: 'How long things are kept', go: 'keeping/cleanup', reveal: V.runs }) },
          { label: 'What carrying on brings back', value: 'Goals, chats and editors you had not saved' }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Rename', icon: 'edit', do: 'keeping-session-rename', data: { id: s.id } })}${ui.btn({ label: 'Archive', icon: 'archive', do: 'keeping-session-archive', data: { id: s.id }, disabled: s.state === 'Archived', reason: 'It is already archived.' })}${ui.btn({ label: 'Delete this session…', icon: 'trash', danger: true, do: 'keeping-session-delete', data: { id: s.id } })}</div>` }
      ];
    },
    changes: [
      { was: 'A session’s details share the Sessions tab with the list; “Rename”, “Archive” and “Delete” are inside “More actions”, and the main button says “Open” or “Resume”.', now: 'A session has a page: what state it is in and what carrying on brings back, in words; its three actions as ordinary buttons, Delete last.' },
      { was: 'The detail says “Goal receipts => Kept for 365 days” with no way to change it; the value is set on the Cleanup tab.', now: 'The same line links to “How long things are kept”, where it is set.' }
    ]
  });

  /* ---- one file the work produced */
  const fileOf = (ctx) => files(ctx.st).find((a) => a.id === (ctx.params || {}).id) || null;
  SMX.page({
    id: 'keeping/file/:id', chapter: 'keeping', parent: 'keeping/history',
    title: (ctx) => { const a = fileOf(ctx); return a ? a.name : 'File'; },
    nav: (ctx) => { const a = fileOf(ctx); return a ? a.name : 'File'; },
    purpose: (ctx) => { const a = fileOf(ctx); return a ? `A file the work produced (an artifact): ${lower(a.type)}, ${a.size}.` : ''; },
    legacy: [HI('artifacts')],
    headSide: (ctx) => { const a = fileOf(ctx); return a ? ui.btn({ label: 'Open', icon: 'external', primary: true, action: 'pm51-history-artifact-open', data: { id: a.id } }) : ''; },
    lead: (ctx) => {
      const a = fileOf(ctx);
      if (!a) return [{ key: 'gone', html: ui.card({ title: 'This file is no longer there', help: 'A deleted file waits under “Recently removed” for 7 days.', body: `<div class="smx-btn-row">${ui.btn({ label: 'Back to History', go: 'keeping/history' })}${ui.btn({ label: 'Recently removed', go: 'keeping/cleanup', anchor: 'removed' })}</div>` }) }];
      const v = keepValue(a.retention);
      return [
        { key: 'facts', html: ui.card({ title: 'About this file', body: ui.rows([
          { label: 'Kind', value: a.type },
          { label: 'Size', value: a.size },
          { label: 'Made by', value: a.owner || 'This project' },
          { label: 'Keep for', help: 'Only this file. Other files follow the rule for their kind.', control: select(v, KEEP.some((k) => k[0] === v) ? KEEP : [[v, v], ...KEEP], { action: 'pm51-history-artifact-keep', data: { id: a.id }, label: 'Keep this file for' }) + ui.btn({ label: 'The rule for each kind', go: 'keeping/cleanup', ghost: true }) }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Download', icon: 'download', action: 'pm51-history-artifact-download', data: { id: a.id } })}${ui.btn({ label: 'Delete this file…', icon: 'trash', danger: true, action: 'pm51-history-artifact-delete', data: { id: a.id } })}</div>` }
      ];
    },
    changes: [
      { was: 'An artifact opens in a side panel that shows “Keep for” twice, once as a fact and once as a dropdown, above Open, Download and Delete.', now: 'A file has a page: its facts, one “Keep for” choice, and its actions as buttons. After Delete the page says where the file waits for 7 days.' }
    ]
  });

  /* ================================================================== How long things are kept */
  const CHATS = ['system.advanced.chat-history-retention', 'general.interaction.thread-archive-days', 'general.interaction.thread-retention-days'];
  /* the lead's integration: the keep-for choices of other chapters have their home here too (they were pointers), so
     that this page is what its first line says. Those chapters now point here (ui.elsewhere). */
  const MADE = ['media.io.artifact-retention'];
  const RECORDS = ['system.advanced.runtime-history-days', 'system.advanced.diagnostic-history-days', 'ai.usage.usage-retention', 'code.terminal.transcript-retention', 'code.execution.receipt-retention', 'system.advanced.released-safe-point-days', 'system.advanced.preserved-terminal-runs'];
  const PROOF = ['branching.worktrees.evidence-retention-days', 'branching.worktrees.evidence-retain-last-runs', 'planning.verification.evidence-retention-days', 'planning.verification.evidence-retain-runs', 'planning.verification.prune-on-cleanup'];
  const TOOLS = ['general.interaction.history-rebuild', 'system.advanced.request-storage-compaction', 'system.advanced.inspect-holds-quarantine'];
  /* what other chapters keep for a while as part of how they work (a page read from the web is reused, a note fades):
     said here in the same words, with a link to where each is changed */
  const ELSEWHERE = [
    ['web.fetch.cache-ttl-fetch', 'Web pages it read'],
    ['web.fetch.cache-ttl-search', 'Web search results'],
    ['web.fetch.cache-ttl-crawl', 'Outlines of whole websites'],
    ['safety.approvals.bsd-retain-transcript', 'The Back Seat Driver’s conversation'],
    ['memory.retention.half-life-by-kind', 'Memories (they fade; they are not deleted on a date)']
  ];
  const keepText = (id) => {
    let t = ''; try { t = String(kit().valueText(kit().setting(id), kit().value(id))); } catch (e) { t = String(SMX.val(id)); }
    t = t.replace(/\b1 hours\b/, '1 hour').replace(/\b1 days\b/, '1 day');
    if (/^\d+\s*(s|seconds?|min|minutes?|hours?|days?|weeks?|months?|years?)$/i.test(t)) return `Keep for ${t}`;
    if (/^last week$/i.test(t)) return 'Keep for 1 week'; if (/^last month$/i.test(t)) return 'Keep for 1 month'; if (/^forever$/i.test(t)) return 'Until you delete them';
    if (id === 'memory.retention.half-life-by-kind') return 'Days to weeks, by kind of note';
    if (id === 'code.terminal.transcript-retention') return /scrollback/i.test(t) ? 'As long as its terminal is kept' : `Keep for ${t.toLowerCase()}`;
    if (/^on$/i.test(t)) return 'Kept'; if (/^off$/i.test(t)) return 'Not kept';
    return t.length > 60 ? t.slice(0, 58) + '…' : t;
  };
  const cleanNeeds = (st) => { const n = waiting(st); return n ? [{ title: `${count(n, 'item')} ${n === 1 ? 'is' : 'are'} past ${n === 1 ? 'its' : 'their'} keep-for time`, detail: 'Nothing is removed until you have looked. What you delete then waits 7 days before it is gone for good.', fix: { label: 'Review them', action: 'pm51-history-cleanup-review' } }] : []; };
  SMX.extend('keeping/cleanup', {
    title: 'How long things are kept', icon: 'clock',
    purpose: 'One page for every “keep for” choice. Nothing is removed without a review first, and what you delete waits 7 days before it is gone for good.',
    legacy: [HI('cleanup')],
    keywords: ['retention', 'cleanup', 'clean up', 'delete', 'keep for', 'archive', 'storage', 'space', 'logs', 'quarantine', 'recently removed', 'holds'],
    blurb: (ctx) => { const st = ctx.st; return `Chats until you delete them · records ${SMX.val(V.runs) || 365} days · temporary files ${tempKeep(st)}`; },
    status: (ctx) => { const n = waiting(ctx.st); return n ? { text: `${n} to review`, tone: 'attention' } : { text: 'Nothing waiting', tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st; const n = waiting(st); const gone = removed(st); const temp = tempKeep(st);
      return [
        { key: 'summary', html: ui.summary({ icon: 'clock', tone: n ? 'attention' : 'ready', lines: [
          `Chats are kept ${ui.b('until you delete them')}. Records of Goals and runs are kept for ${ui.word(`${SMX.val(V.runs) || 365} days`, { go: 'keeping/cleanup', reveal: V.runs })}, logs for ${ui.word(`${SMX.val('system.advanced.diagnostic-history-days') || 30} days`, { go: 'keeping/cleanup', reveal: 'system.advanced.diagnostic-history-days' })} and temporary files for ${ui.b(/indefinitely/i.test(temp) ? 'as long as you like' : temp)}.`,
          n ? `${ui.b(count(n, 'item'))} ${n === 1 ? 'is' : 'are'} past ${n === 1 ? 'its' : 'their'} time and wait for you. Nothing is removed before you look.` : 'Nothing is waiting to be cleaned up.'
        ] }) },
        { key: 'needs', html: ui.needs(cleanNeeds(st)) },
        { key: 'review', html: ui.card({ title: 'Waiting for your review', anchor: 'review', help: 'The one rule for every cleanup: you see the list first, and you choose.', body: ui.rows([
          { label: 'Old files, recordings and sessions', help: n ? groups(st).map((g) => `${g.title} (${g.meta})`).join(' · ') : 'Items show up here once they pass their keep-for time.', value: n ? count(n, 'item') : 'Nothing', muted: !n, control: ui.btn({ label: 'Review', icon: 'eye', action: 'pm51-history-cleanup-review', disabled: !n, reason: 'Nothing is waiting.' }) },
          { label: 'Old backups', help: 'Backups past the number their schedule keeps. The latest checked backup is always kept.', control: ui.btn({ label: 'Review', icon: 'eye', action: 'pm51-backup-cleanup' }) }
        ]) }) },
        { key: 'files', html: ui.card({ title: 'Files', body: ui.rows([
          { label: 'Keep temporary files for', help: 'Scratch files the assistant made along the way.', control: select(temp, KEEP.some((k) => k[0] === temp) ? KEEP : [[temp, temp], ...KEEP], { action: 'pm51-history-keep', data: { key: 'temporaryArtifacts' }, label: 'Keep temporary files for' }) },
          { label: 'Keep the files the work produced for', help: 'Each file has its own choice, set on the file.', value: files(st).length ? `${files(st).filter((a) => /^keep$/i.test(String(a.retention))).length} of ${files(st).length} until you delete them` : 'No files yet', control: ui.btn({ label: 'The files', go: 'keeping/history', anchor: 'files' }) },
          ...schedules(st).map((s) => ({ label: `Keep backups from “${s.name}”`, help: 'Backups are kept by number, not by age.', value: `The newest ${keepN(s) || s.retention}`, control: ui.btn({ label: 'Edit the schedule', action: 'pm51-backup-schedule', data: { id: s.id } }) }))
        ]) }) },
        { key: 'removed', html: ui.card({ title: 'Recently removed', anchor: 'removed', help: 'What you deleted waits here for 7 days before it is gone for good.', body: gone.length ? ui.facts(gone.map((q) => [q.title, `${q.meta} · gone ${q.until}`])) : `<p class="smx-quiet-line">Nothing was removed recently.</p>` }) }
      ];
    },
    sections: [
      { key: 'chats', title: 'Chats', help: 'A chat stays until you delete it. These choices tidy quiet chats away and give you time to change your mind.', ids: CHATS },
      { key: 'made', title: 'Pictures, speech and video', help: 'What the assistant made for you with its picture, voice and video abilities. The folder they go to is chosen under AI providers › Pictures, voice & video.', ids: MADE },
      { key: 'records', title: 'Records and logs', help: 'What Goals did, what the AI used, what terminals printed and what was done to containers. Puppet Master sets a shortest time for some, so the proof of what happened is not lost; you can keep longer. A safe point is the state saved before the assistant tries something, so the attempt can be undone.', ids: RECORDS },
      { key: 'proof', title: 'Proof that work was checked', help: 'Logs of test runs, and what a Goal kept to show it finished.', ids: PROOF, also: ['planning.verification.evidence-redaction'], alsoTitle: 'What is hidden in proof' },
      { key: 'elsewhere', html: () => { const rows = ELSEWHERE.filter(([id]) => SMX.has(id) && SMX.where(id)).map(([id, name]) => { const w = SMX.where(id); return { label: name, value: keepText(id), control: ui.btn({ label: SMX.pageName(w.route), go: w.route, reveal: id }) }; }); return rows.length ? ui.card({ title: 'Reused or faded, not kept', help: 'These are part of how web research, the Back Seat Driver and memories work, so each is set there. They are listed so this page answers “how long is it kept?” for everything.', body: ui.rows(rows) }) : ''; } }
    ],
    more: [
      { key: 'space', html: () => ui.card({ title: 'What takes up space', body: ui.facts([['Sessions and chats', '38 MB'], ['Files the work produced', '48.4 MB'], ['Recordings', '1.8 GB'], ['Temporary files', '214 MB']]) }), count: 0 },
      { key: 'holds', html: () => ui.card({ title: 'Never cleaned up', help: 'Cleanup leaves these alone whatever their age.', body: ui.facts([['Files of a Goal that is running', 'Protected while the Goal runs'], ['Pinned items', 'Kept until you unpin them'], ['Receipts of the latest backup', 'Kept with the backup']]) }), count: 0 }
    ],
    moreLabel: 'What takes up space, and what is never cleaned up', moreHelp: 'Sizes, and the things cleanup leaves alone',
    expert: [{ key: 'tools', title: 'Index and storage tools', help: 'Rebuild the search of history, ask for storage to be compacted, and see what is on hold. None of these deletes anything.', ids: TOOLS }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Put the keep-for choices back', action: 'pm51-history-reset' }, { label: 'How history works', action: 'pm51-history-help' }]) }],
    changes: [
      { was: 'How long something is kept is set in at least 14 places with six wordings: “Keep for 90 days”, “keeps 30 daily”, “In days; at least 365”, “The latest 25 are kept”, “Until I delete them” and “Kept while the chat exists”. Cleanup is the fourth tab of History & Artifacts.', now: 'One page, one wording: “Keep … for”. The 13 choices this chapter owns are rows here; backups (kept by number) and each file’s own choice are named with a button; nine choices owned by other chapters are listed with their value and a link.' },
      { was: 'Two reviews with the same name: “Cleanup review — 18 items ready” on this tab and “Cleanup review” for old backups, folded under “More options” on the Backup tab. Deleted items wait in “quarantine” in one sentence and under “Recently removed” in another.', now: 'One card, “Waiting for your review”, holds both, under one rule stated once. What you delete is “Recently removed” everywhere; “quarantine” is left to the read-only inspector under “For experts”.' },
      { was: 'The row “Test evidence — Until I delete them [Change]” only jumps to Testing & Debug, and the same value is shown again on Browser & SCM.', now: 'The real rows for test logs and Goal proof are here, in one card, so the value is changed where it is read.' },
      { was: '“Released safe points — In days; at least 90.” and “Goal and run records — In days; at least 365.” give a unit and a floor, not a meaning.', now: 'The card says why there is a shortest time and what a safe point is; the rows read “Keep safe points that are no longer needed for” and “Keep records of Goals and runs for”.' },
      { was: '“See holds and quarantined values” is drawn twice on the tab, in “Index and storage tools” and again in “Holds”.', now: 'It appears once, with the other two tools, under “For experts”.' }
    ]
  });

  /* search: places, backups, sessions and files, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => {
    const out = [];
    for (const p of places(st)) out.push({ title: p.name, sub: 'Backups & history › Where backups go', route: placeRoute(p) });
    for (const x of runs(st)) if (snapId(x)) out.push({ title: `Backup of ${when(x.time)}`, sub: 'Backups & history › Get work back', route: runRoute(x) });
    for (const s of sessions(st)) out.push({ title: s.title, sub: 'Backups & history › History › session', route: `keeping/session/${enc(s.id)}` });
    for (const a of files(st)) out.push({ title: a.name, sub: 'Backups & history › History › file', route: `keeping/file/${enc(a.id)}` });
    return out;
  });
})(window);
