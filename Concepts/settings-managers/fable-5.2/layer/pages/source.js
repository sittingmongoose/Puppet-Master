/* Settings managers, rethought (Fable 5.2): the chapter "Source control".
   Today this is Source Control: five tabs (Code Services, Local Tools, Repositories, Defaults & Safety, Actions &
   Pipelines), a roster of 11 code services of which 10 are not connected, and a second account that shows only inside
   one service's detail (until 2026-11-11 it vanished the moment it was added; stream F's FO-126 gave it a list
   there). A newcomer does not know Git, so this chapter answers their questions in their own data:
   - the overview says where the code is saved online and who they are there, then lists each code service with its
     accounts and online copies underneath it, so every account is a row that can be opened;
   - a code service, an account, a repository, a working copy and a tool each have a page of their own;
   - who you are in the history and how Git signs in are one page; the keys themselves live with the computers;
   - how runs save work, the safety rules and the ways to undo are one page, written as what happens.
   Every flow is PMConcept7's own (connect a code service, Set up Git, new repository, contribute, recovery tools):
   the buttons carry its action names. Where PMConcept7 offers an item only inside a "More actions" menu, the item is an
   ordinary button here that does the same thing; the report lists each one. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, D = SMX.drawn;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const B = 'branching.worktrees.';
  const SRC = { domain: 'source', ws: 'source-manager', manager: 'source-manager' };
  const OLD = (tab) => ['source', 'source-manager', tab, 'source-manager'];
  const enc = encodeURIComponent;
  const count = (n, one, many) => d.plural(n, one, many);
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const seg = (value, options, o) => { try { return kit().segmented(value, options, o); } catch (e) { return ''; } };
  const stepList = (list) => { try { return kit().steps(list.filter(Boolean)); } catch (e) { return ''; } };
  /* PMConcept7's rows keep their ids, values and controls; where their words call a working copy a "workspace" (or
     use Git's jargon) the words are replaced as the row is drawn. {id: {label, help, action, unit}} */
  const copyBtn = (label, text, what, o) => ui.btn(Object.assign({ label, icon: 'copy', action: 'pm51-servers-copy-text', data: { text, what } }, o || {}));
  const lower = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
  SMX.reword({
    [B + 'auto-worktree-new-threads']: { label: 'Give each new chat its own working copy', help: 'Each new chat gets its own branch and working copy on its first message, so an experiment never touches your main files until it is merged.' },
    [B + 'assistant-worktree-base']: { label: 'Chat working copies start from', help: 'The branch a new chat’s working copy is made from.' },
    [B + 'file-manager-follows']: { help: 'The file browser shows the files of the chat you are in, so you always look at the version being edited.' },
    [B + 'worktree-cleanup']: { label: 'When a chat is deleted, its working copy', help: 'Ask each time, keep it, or remove it with the chat.' },
    [B + 'thread-worktree-binding']: { label: 'This chat’s working copy', action: 'Set up this chat’s working copy' },
    [B + 'clean-untracked-before-run']: { label: 'Start each run with a clean working copy', help: 'Removes stray files that are not in history before a run starts, so leftovers from an earlier attempt cannot confuse the assistant.' },
    [B + 'clear-agent-output']: { help: 'So results never mix with the files of a run before.' },
    [B + 'clean-ignored-files']: { help: 'Also clears files Git is told to ignore, such as caches and local settings.' },
    [B + 'remove-build-artifacts']: { help: 'Removes known build folders when a run ends. It frees disk space; the next build is slower.' },
    [B + 'clean-workspace-now']: { label: 'Clean the working copy now', help: 'Removes stray files right away. You see what would go, and confirm first.', action: 'Clean this working copy' },
    [B + 'worktree-base-dir']: { label: 'Folder for working copies', help: 'Where working copies are made. Empty keeps them inside the project’s folder.' },
    [B + 'worktree-count-warning']: { label: 'Warn me at this many working copies', unit: 'working copies' },
    [B + 'worktree-creation-timeout']: { label: 'Give up creating a working copy after' },
    [B + 'clean-all-worktrees']: { label: 'Remove every working copy', action: 'Remove all working copies' },
    [B + 'recovery-tools']: { label: 'Fix a stuck branch or working copy', help: 'Guided fixes for a merge that stopped halfway, a working copy with no branch, a change saved on the wrong branch, or a leftover lock.' },
    [B + 'default-branch']: { help: 'Used for new repositories, working copies and runs.' },
    [B + 'worktree-filter']: { label: 'Working copies listed', help: 'Which working copies the panel lists: all, or only the ones made by chats, by Goals or by you.' },
    [B + 'branch-strategy']: { label: 'How branches are used', help: 'One branch per piece of work, hotfix or release branches, straight onto the main branch, or a pattern of your own.' },
    [B + 'merge-strategy']: { help: 'Follow the project’s own way, keep every saved change, combine them into one tidy change, or replay them on top of the main branch.' },
    [B + 'push-behavior']: { label: 'Send changes online', help: 'When you say, after each merge, or never until you change this.' },
    [B + 'auto-pr']: { help: 'When a run has merged its branch, a review request is opened for you (GitHub calls it a pull request).' },
    [B + 'github-actions-auto-refresh']: { help: 'Pinned checks show their latest result without you asking.' },
    'planning.testing.github-actions-template': { label: 'Add a starter test check', help: 'Writes a ready-made test check into the repository.' }
  });

  /* ------------------------------------------------------------------ readers (the rules PMConcept7's manager uses) */
  const sc = (st) => st.sourceControl || {};
  const forges = (st) => sc(st).forges || [];
  const tools = (st) => sc(st).tools || [];
  const repos = (st) => sc(st).repositories || [];
  const copies = (st) => sc(st).worktrees || [];
  const flows = (st) => sc(st).actions || [];
  const connected = (f) => f.status === 'active';
  const cfg = (st) => Object.assign({ tool: 'Git', service: 'GitHub', protectMain: true, askDelete: true, backupRisky: true, updatePolicy: {} }, (st.pm51 || {}).sourceDefaults || {});
  const server = (st) => { const S = d.sp(st); return ((S.servers || []).find((s) => s.default) || d.homeServer(st) || {}).name || 'your Server'; };
  const mainBranch = () => String(SMX.val(B + 'default-branch') || 'main').trim() || 'main';
  const MARK = { github: 'GH', 'github-enterprise': 'GE', gitlab: 'GL', 'gitlab-self': 'GS', azure: 'AZ', 'azure-server': 'AS', bitbucket: 'BB', 'bitbucket-dc': 'BD', forgejo: 'FJ', gitea: 'GT', 'generic-git': 'Git' };
  const VERB = { github: 'Connect GitHub', 'github-enterprise': 'Connect GitHub Enterprise', gitlab: 'Connect GitLab', 'gitlab-self': 'Connect GitLab', azure: 'Connect Azure DevOps', 'azure-server': 'Connect Azure DevOps Server', bitbucket: 'Connect Bitbucket', 'bitbucket-dc': 'Connect Bitbucket', forgejo: 'Connect Forgejo', gitea: 'Connect Gitea', 'generic-git': 'Add a repository by its address' };
  const API = { github: 'api.github.com', gitlab: 'gitlab.com/api/v4', azure: 'dev.azure.com', bitbucket: 'api.bitbucket.org/2.0' };
  const KIND = { hosted: 'A website that keeps a copy of your code online.', instance: 'A code service your organization runs itself. It needs its address first.', generic: 'Any plain Git repository reached by its address. It has no reviews and no online checks.' };
  const about = (f) => (f.kind === 'generic' ? KIND.generic : f.help && f.kind !== 'hosted' ? `${f.help.replace(/\.$/, '')}. It needs its address first.` : f.help || KIND[f.kind] || KIND.hosted);
  const ghOnly = () => String(SMX.val('ai.accounts.github-host-policy') || 'github.com_only') !== 'enterprise_allowed';
  const blocked = (f) => f.id === 'github-enterprise' && ghOnly() && !connected(f);
  const webAddress = (f) => (f.id === 'github' ? `https://github.com/${connected(f) ? f.defaultAccount : ''}` : f.instanceUrl || '');
  const svcRoute = (f) => `source/service/${enc(f.id)}`;
  const acctRoute = (f, a) => `source/service/${enc(f.id)}/${enc(a.name)}`;
  const repoRoute = (r) => `source/repos/${enc(r.name)}`;
  const copyRoute = (w) => `source/working-copy/${enc(w.name)}`;
  /* the key Git uses for a code service: the one it names, or (PMConcept7's one-time default) the first current key */
  const keyOf = (st, f) => {
    if (f.pushAccess !== 'Ready' || f.pushVia === 'https') return null;
    const keys = d.sshKeys(st);
    if (f.pushKeyId) return keys.find((k) => k.id === f.pushKeyId) || null;
    return f.pushKeyId === undefined ? keys.find((k) => !k.old) || keys[0] || null : null;
  };
  const gitSignIn = (st, f) => (f.pushAccess !== 'Ready' ? 'Not set up yet' : f.pushVia === 'https' ? 'A token kept in the keychain' : keyOf(st, f) ? `The key ${keyOf(st, f).name}` : 'An SSH key');
  /* who you are in the history */
  const me = (st) => ({ name: String(SMX.val(B + 'git-author-name') || ''), email: String(SMX.val(B + 'git-author-email') || ''), scope: ((st.pm51 || {}).sourceGit || {}).scope || 'all', sign: String(SMX.val(B + 'commit-signing') || 'off'), signKey: String(SMX.val(B + 'commit-signing-key') || '') });
  const signText = (st, m) => (m.sign === 'ssh-key' ? `With the key ${(d.sshKeys(st).find((k) => k.id === m.signKey) || {}).name || 'you chose'}` : m.sign === 'gpg-key' ? `With the GPG key ${m.signKey}`.trim() : 'Not signed');
  /* safety: the level decides three switches unless it is Custom */
  const PRESET = B + 'git-policy-preset', FORCE = B + 'force-push-policy', PIN = B + 'github-pinned-workflows';
  const PRESETS = { strict: { protectMain: true, askDelete: true, backupRisky: true }, standard: { protectMain: true, askDelete: false, backupRisky: true }, lenient: { protectMain: false, askDelete: false, backupRisky: false } };
  const preset = () => String(SMX.val(PRESET) || 'strict');
  const safety = (st) => (preset() === 'custom' ? cfg(st) : PRESETS[preset()] || PRESETS.strict);
  const label = (id, v) => { try { return String(kit().valueLabel(id, v)); } catch (e) { return String(v); } };
  const protectedList = () => { const v = SMX.val(B + 'protected-branches'); return Array.isArray(v) && v.length ? v.map(String) : [mainBranch(), 'release/*']; };
  const plainBranches = (list) => list.map((x) => (/\/\*$/.test(x) ? `every branch that starts with ${x.slice(0, -1)}` : x)).join(', ');
  /* repositories and working copies */
  const repoAddress = (st, r) => { if (r.address) return r.address; if (r.forge === 'Local') return ''; const gh = forges(st).find((f) => f.id === 'github'); return r.forge === 'GitHub' && gh && connected(gh) ? `github.com/${gh.defaultAccount}/${r.name}` : `${r.name} on ${r.forge}`; };
  const changesOf = (x) => { const m = /^(\d+)\s+changed/.exec(String(x.state || '')); return m ? `${count(Number(m[1]), 'change')} not saved to history yet` : x.state === 'Clean' ? '' : x.state === 'Checking' ? '' : `${x.state} · not saved to history yet`; };
  const repoStatus = (r) => (r.state === 'Clean' ? { text: 'Ready', tone: 'ready' } : r.state === 'Checking' ? { text: 'Checking', tone: 'info' } : { text: 'Needs attention', tone: 'attention' });
  const repoCopies = (st, r) => copies(st).filter((w) => (w.repo || (repos(st)[0] || {}).name) === r.name);
  const stale = (w) => /^Stale/.test(String(w.lease || ''));
  const inGoal = (w) => /Goal/.test(String(w.lease || ''));
  const owner = (st, w) => { const m = /^Goal\s+(\S+)$/.exec(String(w.owner || '')); if (!m) return w.owner === 'User' ? 'You' : w.owner; const g = (st.activeGoals || []).find((x) => x.id === m[1]); return g ? `The Goal “${g.name}”` : 'A Goal'; };
  const kept = (w) => (stale(w) ? `Not used for ${String(w.lease).replace(/^Stale\s*·\s*/, '')}` : inGoal(w) ? 'Kept while its Goal runs' : w.lease === 'Persistent' ? 'Kept until you remove it' : String(w.lease || ''));
  /* online checks: pins move once from each workflow into the "Pinned workflows" setting (PMConcept7 does this the
     first time its Actions tab draws); before that both places are read */
  const pinned = (st) => { const v = SMX.val(PIN); const list = Array.isArray(v) ? v.map(String) : []; return sc(st).o55Pins ? list : Array.from(new Set(list.concat(flows(st).filter((w) => w.pinned).map((w) => w.name)))); };
  const TRIGGER = { 'Push and pull request': 'Runs on every push and review request', Manual: 'Started by hand', Tag: 'Runs when a release is tagged' };
  const checksFor = (st) => { const c = cfg(st); const f = forges(st).find((x) => x.name === c.service && connected(x)) || forges(st).find(connected); const ok = !!f && !/not available|connect automation/i.test(f.automationLabel || ''); return { f, ok, repo: f ? ((repos(st).find((r) => r.forge === f.name) || repos(st)[0] || {}).name || 'this project') : '' }; };

  /* One-time moves PMConcept7 makes when its own manager first draws, made here too so a list reads the same on a
     fresh load: the pinned checks become the "Pinned workflows" setting, and a code service that already sends over
     SSH names the key it uses (which is what makes that key say "Used by GitHub" under Computers). */
  let settling = false;
  const settle = (st) => {
    if (settling) return;
    const needPins = !sc(st).o55Pins && flows(st).length > 0;
    const needKey = forges(st).some((f) => f.pushKeyId === undefined && f.pushAccess === 'Ready' && f.pushVia !== 'https' && d.sshKeys(st).length);
    if (!needPins && !needKey) return;
    settling = true;
    W.setTimeout(() => {
      try {
        const s = eng().getState(); const S = s.sourceControl || {}; let was = null;
        if (!S.o55Pins && (S.actions || []).length) { was = S.actions.filter((w) => w.pinned).map((w) => w.name); S.actions.forEach((w) => { delete w.pinned; }); S.o55Pins = true; }
        const keys = d.sshKeys(s); const first = keys.find((k) => !k.old) || keys[0];
        if (first) (S.forges || []).forEach((f) => { if (f.pushKeyId === undefined && f.pushAccess === 'Ready' && f.pushVia !== 'https') f.pushKeyId = first.id; });
        eng().setState(s);
        if (was && was.length) { const cur = SMX.val(PIN); if (!Array.isArray(cur) || !cur.length) eng().setSettingFromHost(PIN, was, false); }
      } catch (e) { /* the lists still read both places */ }
      settling = false; SMX.soon(20);
    }, 0);
  };

  /* ------------------------------------------------------------------ every account of a code service
     PMConcept7 keeps every signed-in account by name (accountNames; stream F's FO-126, 2026-11-11) and lists them on
     the service's detail, each with its own Disconnect. Before that it kept one name and a count, and this page noted
     the others itself as its guided flow finished; that stand-in is gone. The list is read the way PMConcept7 reads
     it (managers/35-source.js accountList): its names, else the account in use, filled up to the count with
     "Account 2", "Account 3" for a saved state that has a count and no names. What PMConcept7 does not keep is HOW
     each account signed in, so that one fact is still noted here from its own flow's answers. */
  let lastDraft = null, lastAt = 0;
  W.document.addEventListener('click', (e) => {
    const wrap = e.target && e.target.closest ? e.target.closest('.drawer-wrap') : null;
    const api = wrap && wrap._o55Wizard;
    if (api && api.draft && 'tokenGiven' in api.draft && 'via' in api.draft) { lastDraft = api.draft; lastAt = W.performance.now(); }   // the connect flow's answers
  }, true);
  const namesOf = (f) => {
    if (!connected(f)) return [];
    const kept = (Array.isArray(f.accountNames) ? f.accountNames.filter(Boolean) : []).filter((x, i, a) => a.indexOf(x) === i);
    const names = kept.length ? kept.slice() : [f.defaultAccount].filter((x) => x && x !== 'None');
    const n = Math.max(1, names.length, Number(f.accounts) || 0);
    while (names.length < n) names.push(`Account ${names.length + 1}`);
    return names;
  };
  const accountsOf = (st, f) => {
    const names = namesOf(f);
    if (!names.length) { SMX.local.flags['src:how:' + f.id] = {}; return []; }
    const hows = SMX.local.flags['src:how:' + f.id] = Object.assign({}, SMX.local.flags['src:how:' + f.id]);
    const fresh = lastDraft && W.performance.now() - lastAt < 20000 ? lastDraft : null;
    if (fresh && fresh.account && names.includes(String(fresh.account))) { hows[String(fresh.account)] = fresh.how === 'token' ? 'A token' : 'Your browser'; lastDraft = null; }
    for (const k of Object.keys(hows)) if (!names.includes(k)) delete hows[k];
    const use = names.includes(f.defaultAccount) ? f.defaultAccount : names[0];
    const usual = /token/i.test(f.auth || '') && !/oauth|app|sign-in|entra/i.test(f.auth || '') ? 'A token' : 'Your browser';
    return [use].concat(names.filter((x) => x !== use)).map((name) => ({ name, inUse: name === use, how: hows[name] || (name === use ? usual : 'Your browser') }));
  };
  const accountName = (a) => a.name;

  /* ------------------------------------------------------------------ what needs you */
  const needs = (st) => {
    const out = []; const m = me(st);
    if (!m.name || !m.email) out.push({ home: true, title: 'Your name and email for saved changes are not set', detail: 'Every saved change carries them. Saving a change fails until they are set.', fix: { label: 'Add them', action: 'pm51-source-git-setup', data: { step: 0 } } });
    for (const f of forges(st)) {
      if (f.status === 'needs-signin') out.push({ home: true, title: `${f.name} needs you to sign in again`, detail: 'Nothing can be sent there or fetched from there until you do.', fix: { label: 'Sign in', action: 'pm51-source-connect', data: { id: f.id } } });
      else if (connected(f) && f.pushAccess !== 'Ready') out.push({ home: true, title: `Git cannot send changes to ${f.name} yet`, detail: 'You are signed in on the website, but Git itself still needs a key or a token.', fix: { label: 'Set it up', action: 'pm51-source-push', data: { id: f.id } } });
    }
    for (const t of tools(st)) if (t.default && t.status !== 'ready') out.push({ home: true, tone: 'blocked', title: `${t.name} is not installed on ${server(st)}`, detail: 'Version history cannot be kept without it.', fix: { label: `Install ${t.name}`, action: 'pm51-source-install', data: { id: t.id } } });
    for (const w of flows(st)) if (w.status === 'failing') out.push({ home: true, title: `The online check “${w.name}” is failing`, detail: `Last run ${lower(w.lastRun)}.`, fix: { label: 'See the checks', go: 'source/checks' } });
    for (const r of repos(st)) if (changesOf(r)) out.push({ tone: 'info', title: `${r.name} has ${changesOf(r)}`, detail: 'Nothing is lost. They are saved the next time you or the assistant saves a change.', fix: { label: 'Open it', go: repoRoute(r) } });
    const old = copies(st).filter(stale);
    if (old.length) out.push({ tone: 'info', title: `${count(old.length, 'working copy', 'working copies')} ${old.length === 1 ? 'is' : 'are'} no longer used`, detail: `${old.map((w) => w.name).join(', ')}. Removing ${old.length === 1 ? 'it' : 'them'} frees space; the branches are kept.`, fix: { label: 'Clean up', action: 'pm51-source-cleanup' } });
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign((st) => { settle(st); return needs(st); }, { chapter: 'source' }));
  /* the chapter says its own state on Settings Home and in the navigation */
  const chapter = SMX.chapters.find((c) => c.id === 'source');
  if (chapter && !chapter.status) chapter.status = (ctx) => { const n = needs(ctx.st).filter((x) => x.home).length; const on = forges(ctx.st).filter(connected); return n ? { tone: 'attention', text: n === 1 ? '1 needs you' : `${n} need you` } : on.length ? { tone: 'ready', text: `Saved to ${on[0].name}` } : { tone: 'off', text: 'No online copy' }; };

  /* a row of a list, in the shape ui.things draws (used where rows of two kinds share one list) */
  const thing = (o) => {
    const open = o.go ? ` data-smx-go="${h(o.go)}"` : o.action ? ` data-action="${h(o.action)}"${SMX.data(o.data)}` : '';
    return `<div class="smx-thing${open ? ' is-clickable' : ''}${o.cls ? ' ' + o.cls : ''}"${open ? ` role="button" tabindex="0"${open}` : ''}><span class="smx-thing-avatar${o.icon ? '' : ' is-initials'}">${o.icon ? SMX.icon(o.icon) : h(o.initials || '?')}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(o.name)}${o.tag ? ` <span class="smx-thing-tag">${h(o.tag)}</span>` : ''}</span>${o.sub ? `<span class="smx-thing-sub">${h(o.sub)}</span>` : ''}${o.sub2 ? `<span class="smx-thing-sub">${h(o.sub2)}</span>` : ''}</span><span class="smx-thing-end">${o.status ? ui.status(o.status.text, o.status.tone) : ''}${o.side || ''}${open ? `<span class="smx-thing-go">${SMX.icon('go')}</span>` : ''}</span></div>`;
  };
  const repoThing = (st, r, o) => Object.assign({ icon: 'folder', name: r.name, tag: r.forge === 'Local' ? `Only on ${server(st)}` : `Online copy on ${r.forge}`, sub: `Branch ${r.branch}${r.protection === 'Protected' ? ' · protected' : ''}${repoAddress(st, r) ? ' · ' + repoAddress(st, r) : ''}`, sub2: changesOf(r), status: repoStatus(r), go: repoRoute(r) }, o || {});
  const connectBtn = (f, o) => ui.btn(Object.assign({ label: VERB[f.id] || `Connect ${f.name}`, icon: f.kind === 'generic' ? 'plus' : 'link', action: 'pm51-source-connect', data: { id: f.id }, disabled: blocked(f), reason: 'Allow company GitHub servers first. The switch is on this service’s page.' }, o || {}));

  /* ================================================================== Overview: code services & accounts */
  const servicesCard = (st) => {
    const c = cfg(st); const on = forges(st).filter((f) => connected(f) || f.status === 'needs-signin');
    const rows = on.map((f) => {
      const accts = accountsOf(st, f); const mine = repos(st).filter((r) => r.forge === f.name);
      return thing({ initials: MARK[f.id] || '?', name: f.name, tag: c.service === f.name ? 'New online copies go here' : '', sub: connected(f) ? `Git sends your changes with ${lower(gitSignIn(st, f))}` : 'Signed out', sub2: f.lastCheck ? `Checked ${f.lastCheck}` : '', status: connected(f) ? { text: 'Connected', tone: 'ready' } : { text: 'Needs sign-in', tone: 'attention' }, go: svcRoute(f) })
        + accts.map((a) => thing({ cls: 'smx-branch', icon: 'user', name: accountName(a), tag: a.inUse ? (accts.length > 1 ? 'The account in use' : 'Your account') : 'Also signed in', sub: `Signed in with ${lower(a.how || 'your browser')}`, go: acctRoute(f, a) })).join('')
        + mine.slice(0, 4).map((r) => thing(repoThing(st, r, { cls: 'smx-branch', tag: 'Online copy', sub: `${repoAddress(st, r)} · branch ${r.branch}` }))).join('')
        + (mine.length > 4 ? thing({ cls: 'smx-branch', icon: 'folder', name: `${mine.length - 4} more online ${mine.length - 4 === 1 ? 'copy' : 'copies'}`, go: svcRoute(f) }) : '');
    }).join('');
    const names = forges(st).filter(connected).map((f) => f.name);
    const where = names.length ? `<div class="smx-pad">${ui.sentence(`<span>A new online copy is created on</span>${select(c.service, names.includes(c.service) || c.service === 'None' ? ['None', ...names] : [c.service, 'None', ...names], { action: 'pm51-source-cfg', data: { key: 'service' }, label: 'Where new online copies are created' })}`)}</div>` : '';
    const body = rows ? `<div class="smx-things smx-tree">${rows}</div>${where}` : `<div class="smx-empty">${SMX.icon('cloud')}<div class="smx-empty-title">No code service is connected</div><div class="smx-empty-text">Your work still has version history on ${h(server(st))}. A code service keeps a second copy online and lets you work from more than one computer.</div>${ui.btn({ label: 'Connect a code service', icon: 'link', primary: true, action: 'pm51-source-add-service' })}</div>`;
    return ui.card({ title: 'Where your code is saved online', help: rows ? 'Each code service, who you are there, and the online copies it holds. Open any row.' : '', side: rows ? ui.btn({ label: 'Add a service or an account', icon: 'plus', action: 'pm51-source-add-service' }) : '', body, cls: 'smx-things-card', anchor: 'services' });
  };
  const toolsCard = (st) => {
    const c = cfg(st);
    return ui.things({ cls: 'smx-src-rows', title: 'Tools that keep the history', help: `They run on ${server(st)}. Puppet Master installs and runs them; you never type their commands.`, anchor: 'tools',
      items: tools(st).map((t) => ({ icon: 'branch', name: t.name, tag: t.default ? 'Used for new folders' : '', sub: t.status === 'ready' ? `Version ${t.version} · from the ${lower(t.source)}` : 'Not installed', sub2: TOOL_LINE[t.id] || '', status: t.status === 'ready' ? { text: 'Ready', tone: 'ready' } : { text: 'Not installed', tone: 'off' }, go: `source/tool/${enc(t.id)}` })) })
      + ui.card({ body: ui.rows([{ label: 'New folders keep their history with', help: 'Git is the common choice. Jujutsu makes undo easy and works alongside Git.', control: seg(c.tool, ['Git', 'Jujutsu'], { action: 'pm51-source-cfg-seg', data: { key: 'tool' }, label: 'Version history tool' }) }]) });
  };
  const TOOL_LINE = { git: 'The most common version history tool. It calls a line of work a branch.', jj: 'A newer tool that makes undo easy and works alongside Git. It calls a line of work a bookmark.', 'git-lfs': 'An add-on for Git that keeps big files out of the main history.' };
  SMX.extend('source', {
    noPagesList: true,
    legacy: [OLD('services'), OLD('tools')],
    keywords: ['github', 'gitlab', 'bitbucket', 'forgejo', 'gitea', 'azure devops', 'git', 'jujutsu', 'token', 'code service', 'account', 'online copy', 'version history'],
    lead: (ctx) => {
      const st = ctx.st; settle(st);
      const c = cfg(st); const on = forges(st).filter(connected); const main = on.find((f) => f.name === c.service) || on[0];
      const rest = forges(st).filter((f) => !connected(f) && f.status !== 'needs-signin');
      const rs = repos(st); const online = rs.filter((r) => r.forge !== 'Local'); const local = rs.filter((r) => r.forge === 'Local');
      const m = me(st); const nd = needs(st);
      return [
        { key: 'summary', html: ui.summary({ icon: 'branch', tone: nd.some((n) => n.tone !== 'info') ? 'attention' : main ? 'ready' : 'info', lines: main ? [
          `Your code is saved online on ${ui.word(main.name, { go: svcRoute(main) })} as ${ui.word(main.defaultAccount, { go: acctRoute(main, { name: main.defaultAccount }) })}${on.length > 1 ? `, and on ${count(on.length - 1, 'more code service')}` : ''}.`,
          `Puppet Master keeps version history for ${ui.word(count(rs.length, 'folder'), { go: 'source/repos' })}: ${online.length} ${online.length === 1 ? 'has' : 'have'} an online copy${local.length ? ` and ${local.length} ${local.length === 1 ? 'is' : 'are'} kept only on ${h(server(st))}` : ''}. ${m.name ? `Your changes are saved as ${ui.word(m.name, { go: 'source/you' })}.` : `${ui.word('Your name for saved changes', { go: 'source/you' })} is not set yet.`}`
        ] : [
          `Your code is not saved online yet. Its version history is kept on ${ui.b(server(st))} only.`,
          'Connect a code service such as GitHub to keep a second copy online and to work from more than one computer.'
        ], side: main ? '' : ui.btn({ label: 'Connect a code service', icon: 'link', primary: true, small: false, action: 'pm51-source-add-service' }) }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'services', html: servicesCard(st) },
        { key: 'local', html: main && local.length ? `<p class="smx-quiet-line">${h(local.map((r) => r.name).join(', '))}: no online copy; kept only on ${h(server(st))}. ${ui.link({ label: 'See every repository', go: 'source/repos' })}</p>` : '' },
        { key: 'tasks', html: ui.tasks([
          { icon: 'cloud', title: 'Put a project online', sub: 'A new online copy, with its first files', action: 'pm51-source-new-repo' },
          { icon: 'download', title: 'Bring a project here', sub: 'From a code service, or a folder that has history', go: 'source/repos', anchor: 'repos' },
          { icon: 'user', title: m.name ? 'Change who you are in the history' : 'Say who you are in the history', sub: 'Your name and email, signing and special files', action: 'pm51-source-git-setup' },
          { icon: 'branch', title: 'Help with someone else’s project', sub: 'Your own copy and a branch for your changes', action: 'pm51-source-contribute' }
        ], { title: 'What do you want to do?' }) },
        { key: 'pages', html: ui.pages('source', ctx, { title: 'Everything in this chapter' }) },
        { key: 'rest', html: rest.length ? `<details class="smx-fold smx-fold-more" data-smx-fold="source:rest"${SMX.local.openMore['source:rest'] ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">${count(rest.length, 'more code service')} you can connect</span><span class="smx-fold-help">Not connected</span></summary><div class="smx-fold-body">${ui.things({ cls: 'smx-src-rows', items: rest.map((f) => ({ initials: MARK[f.id] || '?', name: f.name, tag: f.kind === 'instance' ? 'Run by your organization' : f.kind === 'generic' ? 'By address' : '', sub: about(f), sub2: blocked(f) ? 'Not allowed yet: only github.com may be used' : '', go: svcRoute(f) })) })}</div></details>` : '' },
        { key: 'links', html: ui.links([{ label: 'Check version history and code services', action: 'pm51-source-diagnostics' }, { label: 'How version history works', action: 'pm51-source-help' }, { label: 'Put the source control choices back', action: 'pm51-source-reset' }]) }
      ];
    },
    expert: [{ key: 'tools', html: (ctx) => toolsCard(ctx.st), count: 0 }],
    expertLabel: 'The tools underneath', expertHelp: 'Git, Jujutsu and Git LFS: installed and run for you',
    covers: { 'ai.accounts.github-connect': 'The GitHub row of “Where your code is saved online”; signing out is on GitHub’s own page.', 'ai.accounts.github-token': 'On GitHub’s own page, under More options.', 'ai.accounts.github-host-policy': 'On GitHub Enterprise’s own page: “Company GitHub servers”.', 'ai.accounts.github-oauth-loopback': 'On GitHub’s own page, under For experts.' },
    changes: [
      { was: 'The page opens on a roster of 11 code services, of which only GitHub is connected, beside the detail of the first. Three show the same mark, G (GitHub, GitLab.com, Gitea), three more start with G (GE, GS, GO), and two show AD.', now: 'It opens on two sentences in your own data: where your code is saved online and who you are there; how many folders have history and how many have an online copy. Only the services you use are listed. The other 10 are one click away, each with a mark of its own (GH, GE, GL, GS, AZ, AS, BB, BD, FJ, GT).' },
      { was: 'A second GitHub account appears only inside GitHub’s detail, in a list “Signed-in accounts” with “Disconnect” on each; the page’s first view shows a number (“Accounts => 2”). The account work is saved as cannot be changed. (When this concept was reviewed the second account could not be seen at all; PMConcept7 gained the list on 2026-11-11.)', now: 'Every account is a row under its code service, on the first page, and opens on a page of its own. An account can be made the one in use (the concept’s own action), or signed out by itself (PMConcept7’s own).' },
      { was: 'Five tabs; “Local Tools” (Git 2.51, Jujutsu 0.33, Git LFS 3.7) is the second, before repositories. “Reset source control defaults” and “How version history works” repeat under all five.', now: 'Tabs became pages named for what a person wants. The tools are folded under “The tools underneath” because Puppet Master runs them for you. The two links appear once, here.' },
      { was: '“Default code service” is a dropdown on Defaults & Safety, a read-only line under Repositories (“New repositories go to: GitHub”), and “Make default” in each service’s menu. “Version history tool” is a choice on Defaults & Safety and again “Make default” on each tool.', now: 'Each is chosen once: “A new online copy is created on …” sits under the list of services, and “New folders keep their history with …” sits with the tools.' },
      'Words: PMConcept7 uses “code service”, “Source Control”, “SCM” and (in code) “forge” for one thing, and “repository”, “project”, “workspace” and “folder” for another. Here a code service holds an online copy; a repository is a folder whose history is kept; a working copy is what Git calls a worktree.'
    ]
  });

  /* ================================================================== one code service */
  const svcOf = (ctx) => forges(ctx.st).find((f) => f.id === (ctx.params || {}).sid) || null;
  const pickMenu = (text) => { const pop = W.document.querySelector('.pm51-popout.pm51-menu'); const it = pop ? [...pop.querySelectorAll('.pm51-menu-item')].find((b) => ((b.querySelector('.pm51-popout-label') || b).textContent || '').trim() === text) : null; if (it) it.click(); return !!it; };
  const svcMenu = (id) => Object.assign({}, SRC, { tab: 'services', select: { action: 'pm51-select', data: { manager: 'source-manager', id } }, find: (b) => [...b.querySelectorAll('.manager-detail button, .pm51-detail button, button')].find((x) => /^More actions$/.test((x.getAttribute('aria-label') || x.textContent || '').trim())) });
  /* "Sign in again" is PMConcept7's Reauthorize: it exists only inside the service's "More actions" menu, so the real
     menu is opened from this button and its item chosen at once; the guided flow that follows is PMConcept7's own. */
  SMX.warmers['source-reauth'] = (el) => svcMenu(el.getAttribute('data-id'));
  SMX.act('source-reauth', async (el) => { const ok = await SMX.borrow(el, svcMenu(el.getAttribute('data-id'))); if (!ok) return; for (let i = 0; i < 12; i++) { if (pickMenu('Reauthorize')) return; await SMX.wait(60); } });
  SMX.page({
    id: 'source/service/:sid', chapter: 'source', parent: 'source',
    title: (ctx) => { const f = svcOf(ctx); return f ? f.name : 'Code service'; },
    nav: (ctx) => { const f = svcOf(ctx); return f ? f.name : 'Code service'; },
    purpose: (ctx) => { const f = svcOf(ctx); return f ? about(f) : ''; },
    legacy: [OLD('services')],
    headSide: (ctx) => { const f = svcOf(ctx); if (!f) return ''; const can = connected(f) || (f.kind === 'generic' && !!f.instanceUrl); return ui.btn({ label: 'Check the connection', icon: 'test', action: 'pm51-source-check', data: { id: f.id }, disabled: !can, reason: f.kind === 'generic' ? 'Enter the repository’s address first.' : 'Connect it first; until then there is nothing to check.' }); },
    lead: (ctx) => {
      const st = ctx.st, f = svcOf(ctx);
      if (!f) return [{ key: 'gone', html: ui.card({ title: 'This code service is not in the list', body: ui.btn({ label: 'Back to Source control', go: 'source' }) }) }];
      settle(st);
      const on = connected(f), c = cfg(st), accts = accountsOf(st, f), mine = repos(st).filter((r) => r.forge === f.name);
      const generic = f.kind === 'generic'; const gh = f.id === 'github' || f.id === 'github-enterprise';
      const blocks = [];
      blocks.push({ key: 'summary', html: ui.summary({ icon: on ? 'cloud' : 'link', tone: on ? 'ready' : f.status === 'needs-signin' ? 'attention' : 'off', lines: on ? [
        `${ui.b(f.name)} is connected. You are signed in as ${ui.word(f.defaultAccount, { go: acctRoute(f, { name: f.defaultAccount }) })}${accts.length > 1 ? `, with ${count(accts.length - 1, 'more account')} signed in` : ''}.`,
        `Git sends your changes there with ${ui.word(lower(gitSignIn(st, f)), { go: 'source/you' })}. Last checked ${h(f.lastCheck || 'not yet')}.`
      ] : f.status === 'needs-signin' ? [`${ui.b(f.name)} needs you to sign in again.`, 'Nothing can be sent there or fetched from there until you do.'] : [
        `${ui.b(f.name)} is not connected.`,
        blocked(f) ? 'It cannot be connected yet: only github.com may be used. Allow company servers below first.' : generic ? 'Add a repository by its address to use it. There is nothing to sign in to.' : `Connecting is a short guided set-up: ${f.kind === 'instance' ? 'its address, ' : ''}sign in, choose how Git signs in, and check that it works.`
      ], side: on ? '' : connectBtn(f, { primary: true, small: false, label: f.status === 'needs-signin' ? 'Sign in again' : VERB[f.id] || `Connect ${f.name}` }) }) });
      if (f.id === 'github-enterprise') blocks.push({ key: 'allow', html: ui.card({ title: 'Company GitHub servers', help: 'GitHub Enterprise is a GitHub your company runs. It can be connected only while company servers are allowed.', body: ui.settings(['ai.accounts.github-host-policy']) }) });
      if (f.kind !== 'hosted' && !(on && f.pushAccess === 'Ready')) blocks.push({ key: 'ready', html: ui.card({ title: 'Getting it ready', help: 'Each step turns green by itself. You can stop and come back at any point.', body: stepList([
        { title: f.addressLabel || 'Service address', desc: f.instanceUrl || (generic ? 'Where the repository lives, by SSH or HTTPS.' : 'Where your organization runs it.'), status: f.instanceUrl ? 'Ready' : 'Not set up', tone: f.instanceUrl ? 'ready' : 'off', done: !!f.instanceUrl, action: { label: f.instanceUrl ? 'Change' : 'Enter the address', action: 'pm51-source-address', data: { id: f.id } } },
        generic ? null : { title: 'Sign in', desc: /oauth|sign-in|entra|app/i.test(f.auth || '') ? 'With your organization account. A token works where sign-in is not offered.' : 'With a token from your account settings on the service.', status: on ? 'Ready' : 'Not set up', tone: on ? 'ready' : 'off', done: on, action: on || blocked(f) ? null : { label: 'Sign in', action: 'pm51-source-connect', data: { id: f.id } } },
        { title: 'Let Git send changes', desc: 'Git signs in separately from the website, with a key or a token.', status: f.pushAccess === 'Ready' ? 'Ready' : 'Not set up', tone: f.pushAccess === 'Ready' ? 'ready' : 'off', done: f.pushAccess === 'Ready', action: f.pushAccess === 'Ready' ? null : { label: 'Set it up', action: 'pm51-source-push', data: { id: f.id } } }
      ]) }) });
      if (on && !generic) blocks.push({ key: 'accounts', html: ui.things({ cls: 'smx-src-rows', title: 'Accounts', help: accts.length > 1 ? `Work is saved as the account marked “in use”. The others stay signed in.` : 'You can sign in with more than one, for example a personal and a work account.', add: { label: 'Add an account', action: 'pm51-source-connect', data: { id: f.id } },
        items: accts.map((a) => ({ icon: 'user', name: accountName(a), tag: a.inUse ? (accts.length > 1 ? 'The account in use' : '') : 'Also signed in', sub: `Signed in with ${lower(a.how || 'your browser')}`, status: { text: 'Signed in', tone: 'ready' }, go: acctRoute(f, a) })) }) });
      if (on || mine.length) blocks.push({ key: 'copies', html: ui.things({ cls: 'smx-src-rows', title: `Online copies on ${f.name}`, items: mine.map((r) => repoThing(st, r, { tag: '' })), empty: { icon: 'folder', title: 'No online copy here yet', text: 'Create a new one, or bring one of yours here from Repositories.', fix: generic ? null : { label: 'Put a project online', action: 'pm51-source-new-repo' } } }) });
      blocks.push({ key: 'using', html: ui.card({ title: `About ${f.name}`, body: ui.rows([
        on ? { label: 'New online copies are created here', help: 'One code service is the place where a new online copy is made.', status: ui.status(c.service === f.name ? 'Yes' : 'No', c.service === f.name ? 'ready' : 'off'), control: ui.btn({ label: 'Change', go: 'source', anchor: 'services' }) } : null,
        on || generic ? { label: 'How Git signs in', help: 'Separate from the website sign-in. The keys themselves are kept with your computers.', value: generic ? f.auth : gitSignIn(st, f), control: generic ? '' : ui.btn({ label: 'Change', go: 'source/you' }) } : null,
        { label: 'What it calls a code review', help: generic ? 'A plain repository has no reviews.' : 'Someone looks at a change before it joins the main branch.', value: generic ? 'Not available' : f.reviewLabel, muted: generic },
        { label: 'Builds and tests it runs for you', value: generic ? 'Not available' : f.automationLabel, muted: generic || /not available|connect automation/i.test(f.automationLabel || ''), control: on && !/not available|connect automation/i.test(f.automationLabel || '') ? ui.btn({ label: 'Online checks', go: 'source/checks' }) : '' }
      ]) }) });
      if (on) blocks.push({ key: 'actions', html: `<div class="smx-btn-row">${generic ? '' : ui.btn({ label: 'Sign in again', icon: 'refresh', do: 'source-reauth', data: { id: f.id } })}${webAddress(f) ? copyBtn('Copy its web address', webAddress(f), 'Link') : ''}${ui.btn({ label: generic ? 'Forget this repository…' : `Sign out of ${f.name}…`, icon: 'close', danger: true, action: 'pm51-source-gh-disconnect', data: { id: f.id } })}</div>` });
      return blocks;
    },
    more: [{ key: 'token', when: (ctx) => (svcOf(ctx) || {}).id === 'github', html: () => ui.card({ title: 'An access token for extra GitHub features', help: 'Optional. It is kept in the keychain and never shown again. It is not what Git signs in with.', body: ui.settings(['ai.accounts.github-token']) }), count: 0 },
      { key: 'token-ghe', when: (ctx) => (svcOf(ctx) || {}).id === 'github-enterprise', html: () => ui.card({ title: 'Access token', help: 'GitHub Enterprise uses the same token as GitHub.', body: ui.btn({ label: 'Open GitHub', go: 'source/service/github' }) }), count: 0 }],
    moreLabel: 'An access token', moreHelp: 'For extra GitHub features',
    expert: [{ key: 'tech', html: (ctx) => { const st = ctx.st, f = svcOf(ctx); if (!f) return ''; const on = connected(f), acct = on ? f.defaultAccount : 'you'; const gh = f.id === 'github' || f.id === 'github-enterprise';
      return ui.card({ title: 'Technical details', body: ui.facts([['Sign-in method', f.auth], ['API address', API[f.id] || (f.instanceUrl ? f.instanceUrl.replace(/\/$/, '') + '/api' : 'Known once the address is entered')], ['Permissions granted', (f.scopes || []).length ? f.scopes.join(' · ') : 'None yet'], ['SSH host key', f.ssh], ['Fetch address', f.id === 'github' && on ? `https://github.com/${acct}/Puppet-Master.git` : f.kind === 'generic' ? (f.instanceUrl || 'Not set') : 'Set when the first repository is added'], ['Push address', f.id === 'github' && on ? `git@github.com:${acct}/Puppet-Master.git` : f.kind === 'generic' ? (f.instanceUrl || 'Not set') : 'Set when the first repository is added'], ['Last test', f.lastTest || 'Not run'], ['Accounts signed in', String(on ? Math.max(1, Number(f.accounts) || 0) : 0)]]) + (f.id === 'github' ? ui.settings(['ai.accounts.github-oauth-loopback']) : gh ? `<p class="smx-quiet-line smx-pad">The sign-in return address is shared with GitHub and is on GitHub’s page.</p>` : '') }); }, count: 0 }],
    changes: [
      { was: 'A service’s detail shares the tab with the roster of all 11. For GitHub Enterprise the same action is offered twice: “Connect GitHub Enterprise” is enabled at the top and disabled below (“Allow company servers first.”), and nothing says which one is the gate.', now: 'A code service has a page. There is one Connect button; while company servers are not allowed it is unavailable and says why, and the switch that allows them is the card right under it.' },
      { was: '“GitHub servers allowed” is drawn on GitHub and again on GitHub Enterprise, the only service it affects. “Access token” has two doors for one secret (the Sign-in row and the guided flow’s token field).', now: '“Company GitHub servers” is on GitHub Enterprise’s page only. The access token is on GitHub’s page, under More options, with a line saying it is not what Git signs in with.' },
      { was: '“Check connection” is offered on a service that is not connected; its panel then lists three steps as “Skipped” and ends “Not connected”. “Copy link” copies an API address for a service that has no page yet.', now: '“Check the connection” is unavailable until there is something to check, and says so. The web address can be copied only once the service is connected.' },
      { was: '“More actions” hides Reauthorize, Copy link, Make default and Disconnect. “Technical details” shows the sign-in method, API address, SSH host key and an editable “Sign-in return address” (127.0.0.1).', now: 'The actions are ordinary buttons, the destructive one last. “Make default” became the one choice on the overview. The technical facts and the return address are under “For experts”.' }
    ]
  });

  /* ================================================================== one account */
  const acctOf = (ctx) => { const f = svcOf(ctx); if (!f) return { f: null, a: null, all: [] }; const all = accountsOf(ctx.st, f); const key = (ctx.params || {}).account || ''; return { f, all, a: all.find((x) => x.name === key) || null }; };
  /* Signing one account out is PMConcept7's own action now (pm51-source-account-disconnect, FO-126); this page only
     goes back to the code service afterwards, because the page of an account that is gone has nothing to show. What
     PMConcept7 still has no action for is choosing which account work is saved as, so "Use this account" is the
     concept's own: it writes the one field PMConcept7's own flow writes (the account in use), and the names as read. */
  SMX.act('source-account-use', (el) => {
    const id = el.getAttribute('data-id'), name = el.getAttribute('data-name'); const s = eng().getState(); const f = ((s.sourceControl || {}).forges || []).find((x) => x.id === id); if (!f || !name) return;
    const names = namesOf(f); if (!names.includes(name)) return;
    f.accountNames = names; f.accounts = names.length; f.defaultAccount = name; eng().setState(s);
    SMX.toast(`${f.name} now uses ${name}`, 'New work is saved to its online copies as this account. Example only: nothing was sent.', 'info');
  });
  SMX.act('source-account-out', (el) => {
    const id = el.getAttribute('data-id'), name = el.getAttribute('data-name'); const f = forges(SMX.fresh()).find((x) => x.id === id); if (!f || !name) return;
    SMX.run('pm51-source-account-disconnect', { id, name });
    SMX.go(svcRoute(f), { replace: true });
  });
  SMX.page({
    id: 'source/service/:sid/:account', chapter: 'source', parent: 'source',
    title: (ctx) => { const { a } = acctOf(ctx); return a ? accountName(a) : 'Account'; },
    nav: (ctx) => { const { a } = acctOf(ctx); return a ? accountName(a) : 'Account'; },
    purpose: (ctx) => { const { f, a } = acctOf(ctx); return a ? `An account at ${f.name}. It is who you are on that code service; the name on your saved changes is set separately.` : ''; },
    crumbs: (ctx) => { const { f } = acctOf(ctx); return f ? [['source', 'Source control'], [svcRoute(f), f.name]] : [['source', 'Source control']]; },
    legacy: [OLD('services')],
    lead: (ctx) => {
      const st = ctx.st; const { f, a, all } = acctOf(ctx);
      if (!f || !a) return [{ key: 'gone', html: ui.card({ title: 'This account is no longer signed in', body: ui.btn({ label: f ? `Back to ${f.name}` : 'Back to Source control', go: f ? svcRoute(f) : 'source' }) }) }];
      const name = accountName(a); const mine = a.inUse ? repos(st).filter((r) => r.forge === f.name) : []; const m = me(st);
      const only = all.length === 1;
      return [
        { key: 'summary', html: ui.summary({ icon: 'user', tone: 'ready', lines: [a.inUse ? `${ui.b(name)} is the ${h(f.name)} account Puppet Master uses.` : `${ui.b(name)} is signed in to ${h(f.name)}, but work is saved as ${ui.word(f.defaultAccount, { go: acctRoute(f, { name: f.defaultAccount }) })}.`], side: a.inUse ? '' : ui.btn({ label: 'Use this account', icon: 'check', primary: true, small: false, do: 'source-account-use', data: { id: f.id, name: a.name } }) }) },
        { key: 'facts', html: ui.card({ title: 'This account', body: ui.rows([
          { label: 'Code service', value: f.name, control: ui.btn({ label: 'Open', go: svcRoute(f) }) },
          f.id === 'github' && !/^Account \d+$/.test(a.name) ? { label: 'Its page online', value: `github.com/${a.name}`, control: copyBtn('Copy the link', `https://github.com/${a.name}`, 'Link') } : null,
          { label: 'Signed in with', help: 'The website sign-in. Git itself signs in with a key or a token.', value: a.how || 'Your browser' },
          { label: 'What Puppet Master may do there', value: (f.scopes || []).length ? f.scopes.join(' · ') : 'Nothing yet' },
          a.inUse ? { label: 'How Git signs in', value: gitSignIn(st, f), control: ui.btn({ label: 'Change', go: 'source/you' }) } : null,
          { label: 'Name on your saved changes', help: 'Separate from the account: it is written into the history itself.', value: m.name ? `${m.name} · ${m.email}` : 'Not set yet', muted: !m.name, control: ui.btn({ label: m.name ? 'Change' : 'Set it', go: 'source/you' }) }
        ]) }) },
        { key: 'copies', html: a.inUse ? ui.things({ cls: 'smx-src-rows', title: 'Online copies under this account', items: mine.map((r) => repoThing(st, r, { tag: '' })), empty: { icon: 'folder', title: 'No online copy yet', text: 'A project you put online appears here.' } }) : '' },
        { key: 'actions', html: `<div class="smx-btn-row">${a.inUse ? ui.btn({ label: 'Sign in again', icon: 'refresh', do: 'source-reauth', data: { id: f.id } }) : ui.btn({ label: 'Use this account', icon: 'check', do: 'source-account-use', data: { id: f.id, name: a.name } })}${only ? ui.btn({ label: `Sign out of ${f.name}…`, icon: 'close', danger: true, action: 'pm51-source-gh-disconnect', data: { id: f.id } }) : ui.btn({ label: 'Sign out of this account', icon: 'close', danger: true, do: 'source-account-out', data: { id: f.id, name: a.name } })}</div>` }
      ];
    },
    changes: [
      { was: 'An account has no place of its own. With one account, GitHub’s detail shows “Signed in as sittingmongoose” and “Accounts — You can sign in with more than one. => 1”; with two, a list “Signed-in accounts” names both, one marked “Used by default”. (The list is new in PMConcept7 since 2026-11-11; when this concept was reviewed the second account raised the number to 2 and showed nothing.)', now: 'An account has a page: which code service it belongs to, how it signed in, what Puppet Master may do there, and its online copies.' },
      { was: 'Each account in that list has “Disconnect”, and the service has one that forgets them all. Which account is “Used by default” cannot be chosen: it changes only when that account is disconnected.', now: '“Sign out of this account” is PMConcept7’s own per-account Disconnect. “Use this account” makes it the one work is saved as; PMConcept7 has no such action, so that one is the concept’s own and is listed in the build report.' }
    ]
  });

  /* ================================================================== one tool */
  SMX.act('source-open-tools', () => { SMX.local.openMore['source:expert'] = true; SMX.go('source', { anchor: 'tools' }); });
  const POLICIES = ['Follow the system package', 'Ask me', 'Update automatically'];
  const TOOL_PATH = { git: '/usr/bin/git', jj: '/usr/local/bin/jj', 'git-lfs': '/usr/bin/git-lfs' };
  const TOOL_USES = { git: 'Branches', jj: 'Bookmarks', 'git-lfs': 'Large files' };
  const toolOf = (ctx) => tools(ctx.st).find((t) => t.id === (ctx.params || {}).tid) || null;
  const policyOf = (st, t) => (cfg(st).updatePolicy || {})[t.id] || POLICIES[0];
  SMX.act('source-tool-policy', (el) => {
    const sel = el.querySelector('select'); const id = el.getAttribute('data-id'); if (!sel || !id) return;
    const s = eng().getState(); s.pm51 = s.pm51 || {}; s.pm51.sourceDefaults = Object.assign({ tool: 'Git', service: 'GitHub', protectMain: true, askDelete: true, backupRisky: true, updatePolicy: {} }, s.pm51.sourceDefaults || {});
    s.pm51.sourceDefaults.updatePolicy = Object.assign({}, s.pm51.sourceDefaults.updatePolicy, { [id]: sel.value }); eng().setState(s);
  });
  SMX.act('source-tool-update', (el) => {
    const st = SMX.fresh(); const t = tools(st).find((x) => x.id === el.getAttribute('data-id')); if (!t) return; const ready = t.status === 'ready';
    try { kit().check({ title: `Check for ${t.name} update`, steps: [{ title: 'Installed version', desc: ready ? t.version : 'Not installed' }, { title: 'Newest available', desc: `Looked up from ${ready ? String(t.source).toLowerCase() : 'the official source'}`, status: 'Example', tone: 'info' }, { title: 'Update policy', desc: policyOf(st, t), status: 'Checked', tone: 'ready' }] }); } catch (e) { /* no check panel */ }
  });
  SMX.page({
    id: 'source/tool/:tid', chapter: 'source', parent: 'source',
    title: (ctx) => { const t = toolOf(ctx); return t ? t.name : 'Tool'; },
    nav: (ctx) => { const t = toolOf(ctx); return t ? t.name : 'Tool'; },
    purpose: (ctx) => { const t = toolOf(ctx); return t ? (TOOL_LINE[t.id] || '') : ''; },
    legacy: [OLD('tools')],
    headSide: (ctx) => { const t = toolOf(ctx); return t ? ui.btn({ label: 'Check this tool', icon: 'test', action: 'pm51-source-check-tool', data: { id: t.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, t = toolOf(ctx);
      if (!t) return [{ key: 'gone', html: ui.card({ title: 'This tool is not in the list', body: ui.btn({ label: 'Back to Source control', go: 'source' }) }) }];
      const ready = t.status === 'ready';
      return [
        { key: 'summary', html: ui.summary({ icon: 'branch', tone: ready ? 'ready' : 'off', lines: [ready ? `${ui.b(t.name)} ${h(t.version)} is ready on ${ui.b(server(st))}.` : `${ui.b(t.name)} is not installed on ${ui.b(server(st))}.`, t.id === 'git-lfs' ? `It is used when ${ui.word('big files are kept separately', { go: 'source/rules', reveal: B + 'large-file-storage' })}.` : t.default ? 'New folders keep their history with it.' : `New folders keep their history with ${ui.word(cfg(st).tool, { do: 'source-open-tools' })}.`], side: ready ? '' : ui.btn({ label: `Install ${t.name}`, icon: 'download', primary: true, small: false, action: 'pm51-source-install', data: { id: t.id } }) }) },
        { key: 'facts', html: ui.card({ title: 'About this tool', body: ui.rows([
          { label: 'Version', value: ready ? t.version : 'Not installed', muted: !ready },
          { label: 'Runs on', help: 'Where version history work happens.', value: server(st) },
          { label: 'Installed from', value: ready ? t.source : 'Nowhere yet', muted: !ready },
          { label: 'What it calls a line of work', help: t.id === 'git-lfs' ? 'It only stores big files; it has no lines of work of its own.' : '', value: TOOL_USES[t.id] || '' },
          { label: 'When a newer version is out', help: 'Following the system package is the safest choice.', control: `<span data-smx-do-change="source-tool-policy" data-id="${h(t.id)}">${select(policyOf(st, t), POLICIES, { action: 'pm51-noop', label: `Update policy for ${t.name}` })}</span>` }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Look for an update', icon: 'refresh', do: 'source-tool-update', data: { id: t.id } })}${t.id !== 'git-lfs' && ready && !t.default ? ui.btn({ label: `Use ${t.name} for new folders`, icon: 'check', action: 'pm51-source-tool-default', data: { id: t.id } }) : ''}</div>` }
      ];
    },
    expert: [{ key: 'tech', html: (ctx) => { const t = toolOf(ctx); if (!t) return ''; const ready = t.status === 'ready'; return ui.card({ title: 'Technical details', body: ui.facts([['Program file', ready ? TOOL_PATH[t.id] || '' : 'Not installed'], ['Update policy', policyOf(ctx.st, t)], ['Managed by', ready ? t.source : 'Nothing yet'], ['Used for new folders', t.default ? 'Yes' : 'No']]) }); }, count: 0 }],
    changes: [
      { was: '“Local Tools” is the second of five tabs: a roster of Git, Jujutsu and Git LFS beside a detail pane. “Check for update” and “Update policy” are inside “More actions”; the policy opens a side panel that holds one dropdown.', now: 'A tool has a small page, reached from “The tools underneath”. The update policy is a dropdown on the page, and “Look for an update” is an ordinary button.' },
      { was: 'Jujutsu’s page says “Uses => Bookmarks” with no more explanation.', now: 'The row reads “What it calls a line of work”, and the page says in one sentence what the tool is for.' }
    ]
  });

  /* ================================================================== You & your key */
  SMX.act('source-open-keys', () => { SMX.local.openMore['computers/list:more'] = true; SMX.go('computers/list', { anchor: 'keys' }); });
  SMX.extend('source/you', {
    title: 'You & your key', icon: 'user',
    purpose: 'The name and email written on every change you save, and how Git signs in to send your changes online.',
    legacy: [OLD('defaults')],
    blurb: (ctx) => { const m = me(ctx.st); const on = forges(ctx.st).filter(connected); return `${m.name ? `Saved as ${m.name}` : 'Your name is not set yet'}${on.length ? ` · Git signs in to ${on[0].name} with ${lower(gitSignIn(ctx.st, on[0]))}` : ''}`; },
    status: (ctx) => { const m = me(ctx.st); return m.name && m.email ? { text: 'Set', tone: 'ready' } : { text: 'Needs you', tone: 'attention' }; },
    lead: (ctx) => {
      const st = ctx.st; settle(st); const m = me(st); const on = forges(st).filter((f) => connected(f) && f.kind !== 'generic'); const set = !!(m.name && m.email);
      const keyRow = (f) => { const k = keyOf(st, f); const uses = k ? (d.sshKeyUses(st, k.id) || []).filter((u) => u !== `${f.name} (Git)`) : []; return { label: f.name, help: f.pushAccess !== 'Ready' ? 'You are signed in on the website, but Git cannot send changes yet.' : k ? `${k.type} · ${lower(k.where)} on ${k.on}${uses.length ? ` · also used by ${uses.join(', ')}` : ''}` : f.pushVia === 'https' ? 'Over HTTPS, with a token from the keychain.' : '', value: gitSignIn(st, f), muted: f.pushAccess !== 'Ready', control: ui.btn({ label: f.pushAccess !== 'Ready' ? 'Set it up' : f.pushVia === 'https' ? 'Use a key instead' : 'Change the key', icon: 'key', primary: f.pushAccess !== 'Ready', action: 'pm51-source-push', data: { id: f.id } }) }; };
      return [
        { key: 'summary', html: ui.summary({ icon: 'user', tone: set ? 'ready' : 'attention', lines: set ? [
          `Your changes are saved as ${ui.b(m.name)} (${h(m.email)}), ${m.scope === 'all' ? `in every project on ${h(server(st))}` : 'in this project only'}.`,
          `They are ${m.sign === 'off' ? 'not signed' : `signed ${h(lower(signText(st, m)))}`}.${on.length ? ` Git signs in to ${h(on[0].name)} with ${h(lower(gitSignIn(st, on[0])))}.` : ''}`
        ] : [
          'Your name and email are not set yet. Saving a change fails until they are.',
          'Every saved change carries a name and an email, so anyone reading the history can see who made it.'
        ], side: set ? '' : ui.btn({ label: 'Add your name and email', icon: 'user', primary: true, small: false, action: 'pm51-source-git-setup', data: { step: 0 } }) }) },
        { key: 'you', html: ui.card({ title: 'Who you are in the history', help: 'Anyone who can see the history sees these. A code service uses the email to link changes to your account.', side: ui.btn({ label: set ? 'Change name and email' : 'Set name and email', icon: 'edit', action: 'pm51-source-git-setup', data: { step: 0 } }), body: ui.rows([
          { label: 'Name on your changes', covers: B + 'git-author-name', value: m.name || 'Not set yet', muted: !m.name },
          { label: 'Email on your changes', covers: B + 'git-author-email', help: m.email ? (m.scope === 'all' ? `Used in every project on ${server(st)}.` : 'Used in this project only.') : 'A code service can give you a private address that keeps yours out of public history.', value: m.email || 'Not set yet', muted: !m.email },
          { label: 'Sign your changes', covers: `${B}commit-signing ${B}commit-signing-key`, help: 'A signature proves a change really came from you. Some projects only accept signed changes.', value: signText(st, m), control: ui.btn({ label: 'Change', action: 'pm51-source-git-setup', data: { step: 1 } }) }
        ]) }) },
        { key: 'git', html: ui.card({ title: 'How Git signs in', anchor: 'git', help: 'Git signs in separately from the website. A key lets it send your changes without asking for a password each time.', body: (on.length ? `<div data-smx-covers="${h(B)}git-push-method ${h(B)}git-push-key">${ui.rows(on.map(keyRow))}</div>` : `<div class="smx-empty">${SMX.icon('key')}<div class="smx-empty-title">No code service is connected</div><div class="smx-empty-text">Git has nowhere to sign in to yet. Connecting a code service sets this up as one of its steps.</div>${ui.btn({ label: 'Connect a code service', primary: true, action: 'pm51-source-add-service' })}</div>`)
          + `<p class="smx-quiet-line smx-pad">Keys are kept in one place, with your computers. ${ui.link({ label: 'Open Sign-in keys', do: 'source-open-keys' })}</p>` }) }
      ];
    },
    covers: { [B + 'git-author-name']: 'The card “Who you are in the history” on this page.', [B + 'git-author-email']: 'The card “Who you are in the history” on this page.', [B + 'commit-signing']: '“Sign your changes”, in the card “Who you are in the history”.', [B + 'commit-signing-key']: '“Sign your changes”, in the card “Who you are in the history”.', [B + 'git-push-method']: 'The card “How Git signs in” on this page: one row for each code service.', [B + 'git-push-key']: 'The card “How Git signs in” on this page: one row for each code service.' },
    changes: [
      { was: '“You and sign-in” is a section of the Defaults & Safety tab. Four of its buttons open the same guided set-up (“Set up Git” and three times “Change”), and two more “Change” buttons one section down open it too. The warning “Not set yet. Saving changes fails until it is.” sits in the middle of a tab about defaults.', now: 'It is a page. It opens by saying whether your name and email are set and what happens if they are not, with one button. Name and email share one button; signing has its own, which opens the set-up at that step.' },
      { was: '“How Git signs in — For GitHub. Separate from the website sign-in.” is one row that describes only the default code service; what each other service uses is visible only in Details.', now: 'One row for each connected code service, each with its own button, which starts PMConcept7’s own key steps for that service.' },
      { was: 'The same key is shown in four places: Servers › SSH keys, “How Git signs in”, the connect flow’s “Which key?” and the signing step. Source Control can pick a key but not add one; Servers can add one but not say which one Git uses.', now: 'Keys have one home, “Sign-in keys” under Computers. This page says which key Git uses for each code service, what else uses that key, and links there.' }
    ]
  });

  /* ================================================================== Repositories & working copies */
  const NEW_REPO = [B + 'create-github-repo', B + 'new-repo-details'], CONTRIB = [B + 'upstream-repo', B + 'create-fork', B + 'fork-location', B + 'feature-branch-name'];
  const CHAT = [B + 'auto-worktree-new-threads', B + 'assistant-worktree-base', B + 'file-manager-follows', B + 'worktree-cleanup', B + 'thread-worktree-binding'];
  const RUNS = [B + 'clean-untracked-before-run', B + 'clear-agent-output', B + 'clean-ignored-files', B + 'remove-build-artifacts', B + 'clean-workspace-now'];
  const STORE = [B + 'worktree-base-dir', B + 'worktree-count-warning', B + 'worktree-creation-timeout', B + 'clean-all-worktrees'];
  const how = (ids, text) => { const o = {}; for (const id of ids) o[id] = text; return o; };
  const copyThing = (st, w) => ({ icon: 'layers', name: w.name, tag: stale(w) ? 'Not used' : inGoal(w) ? 'Used by a Goal' : w.name === 'main' ? 'Your own files' : '', sub: `Branch ${w.branch} · ${owner(st, w) === 'No active owner' ? 'nobody is using it' : 'used by ' + lower(owner(st, w))}`, sub2: stale(w) ? 'It can be cleaned up.' : changesOf(w), status: w.state === 'Clean' ? { text: 'Ready', tone: 'ready' } : { text: 'Needs attention', tone: 'attention' }, go: copyRoute(w) });
  SMX.extend('source/repos', {
    nav: 'Repositories & working copies', title: 'Repositories & working copies', icon: 'folder',
    purpose: 'A repository is a folder whose history Puppet Master keeps. A working copy is a second folder of the same repository, so a chat or a Goal can work without touching your files.',
    legacy: [OLD('repos')],
    keywords: ['repository', 'repo', 'worktree', 'working copy', 'workspace', 'clone', 'fork', 'import', 'clean'],
    blurb: (ctx) => `${count(repos(ctx.st).length, 'repository', 'repositories')} · ${count(copies(ctx.st).length, 'working copy', 'working copies')}`,
    status: (ctx) => { const n = repos(ctx.st).filter((r) => changesOf(r)).length + copies(ctx.st).filter(stale).length; return n ? { text: n === 1 ? '1 to look at' : `${n} to look at`, tone: 'attention' } : { text: 'All saved', tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st; const old = copies(st).filter(stale);
      return [
        { key: 'repos', html: ui.things({ cls: 'smx-src-rows', title: 'Repositories', anchor: 'repos', help: 'Open one to see its online copy, its branch and its working copies.', add: { label: 'Add a repository', action: 'pm51-source-add-repo' }, items: repos(st).map((r) => repoThing(st, r)), empty: { icon: 'folder', title: 'No repositories yet', text: 'Add a folder that already has history, copy one from a code service, or start history in this project’s folder.', fix: { label: 'Add a repository', icon: 'plus', action: 'pm51-source-add-repo' } } }) },
        { key: 'new', html: ui.tasks([
          { icon: 'cloud', title: 'Create a new repository online', sub: 'With a license, an ignore list and a starting branch', action: 'pm51-source-new-repo' },
          { icon: 'branch', title: 'Contribute to someone else’s project', sub: 'Your own copy (a fork) and a branch for your changes', action: 'pm51-source-contribute' },
          { icon: 'search', title: 'Find my repositories on GitHub', sub: 'Lists the ones that are not here yet', action: 'pm51-source-find' }
        ], { title: 'Start something new', cols: 3 }) },
        { key: 'copies', html: ui.things({ cls: 'smx-src-rows', title: 'Working copies', help: 'Git calls these worktrees. Each is a second folder of a repository, on its own branch.', add: { label: 'Create a working copy', action: 'pm51-source-worktree-new' }, items: copies(st).map((w) => copyThing(st, w)), empty: { icon: 'layers', title: 'No working copies', text: 'Create one to work on two things at once.' } }) },
        { key: 'stale', html: old.length ? `<p class="smx-quiet-line">${h(old.map((w) => w.name).join(', '))}: nobody has used ${old.length === 1 ? 'it' : 'them'} for a while. ${ui.link({ label: old.length === 1 ? 'Remove it' : 'Remove them', action: 'pm51-source-cleanup' })} (the branch is kept)</p>` : `<p class="smx-quiet-line">Every working copy is in use. ${ui.link({ label: 'Look for unused ones', action: 'pm51-source-cleanup' })}</p>` }
      ];
    },
    sections: [
      { key: 'chat', title: 'Working copies for chats', help: 'With this on, each chat works in its own working copy. The choices that go with it appear underneath.', ids: CHAT },
      { key: 'runs', title: 'Before and after each run', help: 'Clears leftovers so a run starts clean and old results never mix with new ones.', ids: RUNS }
    ],
    more: [
      { key: 'new-repo', html: (ctx) => { const v = SMX.val(B + 'new-repo-details'); const o = v && typeof v === 'object' ? v : {}; const c = cfg(ctx.st);
        return ui.card({ title: 'A new online copy', help: 'What “Create a new repository online” starts with. The guided steps remember your last answers.', side: ui.btn({ label: 'Create one now', icon: 'plus', action: 'pm51-source-new-repo' }), body: `<div data-smx-covers="${h(B)}new-repo-details">${ui.rows([
          { label: 'Created on', value: c.service || 'None', control: ui.btn({ label: 'Change', go: 'source', anchor: 'services' }) },
          { label: 'Who can see it', value: o.visibility === 'public' ? 'Public: anyone' : 'Private: only you and people you invite' },
          { label: 'Starting branch', value: o.default_branch || mainBranch(), control: ui.btn({ label: 'Main branch name', go: 'source/rules', reveal: B + 'default-branch' }) },
          { label: 'License', value: o.license || 'Asked each time' },
          { label: 'Ignore list it starts with', help: 'A ready-made list of files that should not be saved in history.', value: o.gitignore && o.gitignore !== 'None' ? `The ${o.gitignore} list` : 'None' }
        ])}</div>` + ui.settings([B + 'create-github-repo']) }); }, count: 2 },
      { key: 'contribute', html: () => { const up = String(SMX.val(B + 'upstream-repo') || ''); const fork = SMX.val(B + 'create-fork') !== false; const loc = String(SMX.val(B + 'fork-location') || ''); const br = String(SMX.val(B + 'feature-branch-name') || '');
        return ui.card({ title: 'Contribute to someone else’s project', help: 'What the guided steps last set up.', side: ui.btn({ label: up ? 'Change' : 'Set it up', icon: 'branch', action: 'pm51-source-contribute' }), body: `<div data-smx-covers="${CONTRIB.map(h).join(' ')}">${ui.rows([
          { label: 'Original project', value: up || 'Not set up yet', muted: !up },
          { label: 'Work in my own copy (a fork)', help: 'Your changes go back to the original as a review request.', value: !up ? '—' : fork ? 'Yes' : 'No, on the original', muted: !up },
          { label: 'My copy', value: loc || (up ? 'Made when the steps finish' : '—'), muted: !loc },
          { label: 'Branch for my changes', value: br || '—', muted: !br }
        ])}</div>` }); }, count: 4 }
    ],
    moreLabel: 'What the guided set-ups remember', moreHelp: 'For a new online copy and for contributing',
    expert: [
      { key: 'store', title: 'Where working copies are kept', help: 'The folder they are made in, when to warn about too many, and removing them all.', ids: STORE },
      { key: 'store-link', html: () => `<p class="smx-quiet-line">Where the project itself is kept is under Computers. ${ui.link({ label: 'Where projects are kept', go: 'computers/projects' })}</p>`, count: 0 }
    ],
    expertHelp: 'The folder for working copies, and removing them all',
    covers: Object.assign({}, how(NEW_REPO, 'The card “A new online copy” on this page, under More options.'), how(CONTRIB, 'The card “Contribute to someone else’s project” on this page, under More options.')),
    changes: [
      { was: 'One word, “workspace”, means two things: here a second copy of a repository (“Give each new chat its own workspace”, “Workspace folder”, “Remove every workspace”), and on History & Artifacts the whole project (“What happened in this workspace”). The same thing is also called “worktree” two sections up.', now: 'It is a “working copy” everywhere, with “Git calls these worktrees” said once. Ten row labels on this page were reworded; the settings and their controls are PMConcept7’s own.' },
      { was: 'A repository opens in a side panel; a worktree’s Details, “Copy folder path” and “Remove” are inside a “More actions” menu on its row.', now: 'A repository and a working copy each open on a page of their own, with their actions as ordinary buttons.' },
      { was: '“Repository defaults” repeats three choices as read-only lines (“New repositories go to: GitHub”, “Main branch: main”, “Large files: Git LFS when a file is over 50 MB”) under “More options”, next to “Find repositories on GitHub” and “Clean up stale worktrees”, which are actions.', now: 'The two actions are on the page: “Find my repositories on GitHub” is a task, and the working copies nobody uses are named with one link to remove them. The repeated lines became “A new online copy”, where each line links to the one place it is changed.' },
      { was: 'Four of the five “Workspaces for chats” rows never appear unless the first switch is on, and nothing says they exist.', now: 'The card’s first line says what it does; the four follow-up choices appear under the switch when it is on, as PMConcept7 draws them.' }
    ]
  });

  /* ---- one repository */
  const repoOf = (ctx) => repos(ctx.st).find((r) => r.name === (ctx.params || {}).name) || null;
  /* "Check remote" is the button of PMConcept7's repository side panel; that panel is opened and its button pressed */
  SMX.act('source-repo-check', async (el) => { SMX.run('pm51-source-repo', { name: el.getAttribute('data-name') }); for (let i = 0; i < 15; i++) { await SMX.wait(60); const b = [...W.document.querySelectorAll('.drawer-wrap button')].find((x) => /^Check remote$/.test((x.textContent || '').trim())); if (b) { b.click(); return; } } });
  SMX.page({
    id: 'source/repos/:name', chapter: 'source', parent: 'source/repos',
    title: (ctx) => { const r = repoOf(ctx); return r ? r.name : 'Repository'; },
    nav: (ctx) => { const r = repoOf(ctx); return r ? r.name : 'Repository'; },
    purpose: (ctx) => { const r = repoOf(ctx); return r ? (r.forge === 'Local' ? `A folder whose history Puppet Master keeps. It has no online copy: it is kept only on ${server(ctx.st)}.` : `A folder whose history Puppet Master keeps. Its online copy is on ${r.forge}.`) : ''; },
    legacy: [OLD('repos')],
    headSide: (ctx) => { const r = repoOf(ctx); return r ? ui.btn({ label: r.forge === 'Local' ? 'Check its history' : 'Check the online copy', icon: 'test', do: 'source-repo-check', data: { name: r.name } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, r = repoOf(ctx);
      if (!r) return [{ key: 'gone', html: ui.card({ title: 'This repository is no longer in the list', body: ui.btn({ label: 'Back to Repositories', go: 'source/repos' }) }) }];
      const f = forges(st).find((x) => x.name === r.forge); const s = repoStatus(r); const addr = repoAddress(st, r); const wts = repoCopies(st, r); const ch = changesOf(r);
      return [
        { key: 'summary', html: ui.summary({ icon: 'folder', tone: s.tone, lines: [`${ui.b(r.name)} ${r.forge === 'Local' ? `is kept only on ${h(server(st))}` : `has an online copy on ${f ? ui.word(r.forge, { go: svcRoute(f) }) : h(r.forge)}`}, on the branch ${ui.b(r.branch)}.`, ch ? `It has ${h(ch)}. Nothing is lost; they are saved the next time you or the assistant saves a change.` : r.state === 'Checking' ? 'It was just added and is being read.' : 'Everything in it is saved to history.'] }) },
        { key: 'facts', html: ui.card({ title: 'About this repository', body: ui.rows([
          { label: 'Online copy', help: r.forge === 'Local' ? 'Putting it online keeps a second copy somewhere else.' : '', value: addr || 'None', muted: !addr, control: addr ? copyBtn('Copy the address', addr, 'Address') : ui.btn({ label: 'Put a project online', action: 'pm51-source-new-repo' }) },
          { label: 'Branch', help: 'The line of work it is on now.', value: r.branch },
          { label: 'Changes waiting', value: r.state === 'Clean' ? 'None' : r.state === 'Checking' ? 'Not checked yet' : (ch.replace(/ not saved to history yet$/, '') || r.state), status: r.state === 'Clean' || r.state === 'Checking' ? '' : ui.status('Not saved to history yet', 'attention') },
          { label: 'Protection', help: r.protection === 'Protected' ? `${r.branch} cannot be overwritten; changes to it go through a review.` : 'Nothing stops this branch from being overwritten.', value: r.protection === 'Protected' ? 'Protected' : 'None', control: ui.btn({ label: 'Safety rules', go: 'source/rules' }) },
          { label: 'Big files', help: 'Whether big files are kept apart from the normal history.', value: r.lfs === 'Ready' ? 'Kept separately' : r.lfs }
        ]) }) },
        { key: 'copies', html: ui.things({ cls: 'smx-src-rows', title: 'Working copies of this repository', add: { label: 'Create a working copy', action: 'pm51-source-worktree-new' }, items: wts.map((w) => copyThing(st, w)), empty: { icon: 'layers', title: 'No extra working copies', text: 'Create one to work on two things at once.' } }) },
        { key: 'links', html: ui.links([f && connected(f) && !/not available|connect automation/i.test(f.automationLabel || '') ? { label: `See its online checks (${f.automationLabel})`, go: 'source/checks' } : null, { label: 'How this repository is backed up', go: 'keeping' }]) }
      ];
    },
    changes: [
      { was: 'A repository opens as a side panel over the list: five facts, its worktrees as plain text, and one button, “Check remote”.', now: 'It has a page: one sentence on where it is kept and whether everything is saved, the same five facts in plain words, and its working copies as rows that open.' },
      { was: '“Concept scratch — Needs attention — 3 changed · not yet saved to history” gives a status and no way forward.', now: 'The page says what the status means (“Nothing is lost; they are saved the next time you or the assistant saves a change”).' }
    ]
  });

  /* ---- one working copy */
  const wcOf = (ctx) => copies(ctx.st).find((w) => w.name === (ctx.params || {}).name) || null;
  /* Remove exists only inside PMConcept7's "More actions" menu of a worktree row; the same confirmation and the same
     change, as an ordinary button */
  SMX.act('source-copy-remove', (el) => {
    const name = el.getAttribute('data-name'); const w0 = copies(SMX.fresh()).find((x) => x.name === name); if (!w0) return;
    kit().confirm(`Remove the working copy ${name}?`, w0.state === 'Clean' ? 'The folder is deleted. Its branch is kept.' : `${w0.state} that are not saved to history would be lost.`, 'Remove', () => {
      const s = eng().getState(); const S = s.sourceControl || {}; S.worktrees = (S.worktrees || []).filter((x) => x.name !== name); eng().setState(s);
      SMX.toast('Working copy removed', name, 'warning'); SMX.go('source/repos', { replace: true });
    }, true);
  });
  SMX.page({
    id: 'source/working-copy/:name', chapter: 'source', parent: 'source/repos',
    title: (ctx) => { const w = wcOf(ctx); return w ? w.name : 'Working copy'; },
    nav: (ctx) => { const w = wcOf(ctx); return w ? w.name : 'Working copy'; },
    purpose: () => 'A working copy (Git calls it a worktree): a second folder of a repository, on its own branch, so two things can happen at once.',
    legacy: [OLD('repos')],
    lead: (ctx) => {
      const st = ctx.st, w = wcOf(ctx);
      if (!w) return [{ key: 'gone', html: ui.card({ title: 'This working copy is no longer there', body: ui.btn({ label: 'Back to Repositories', go: 'source/repos' }) }) }];
      const repo = repos(st).find((r) => r.name === (w.repo || (repos(st)[0] || {}).name)); const who = owner(st, w); const busy = inGoal(w) || w.name === 'main';
      return [
        { key: 'summary', html: ui.summary({ icon: 'layers', tone: w.state === 'Clean' ? (stale(w) ? 'info' : 'ready') : 'attention', lines: [`${ui.b(w.name)} is a working copy${repo ? ` of ${ui.word(repo.name, { go: repoRoute(repo) })}` : ''} on the branch ${ui.b(w.branch)}.`, stale(w) ? 'Nobody is using it any more. It can be removed; its branch is kept.' : who === 'No active owner' ? '' : `${h(who)} ${who === 'You' ? 'use' : 'uses'} it.${changesOf(w) ? ` It has ${h(changesOf(w))}.` : ''}`] }) },
        { key: 'facts', html: ui.card({ title: 'About this working copy', body: ui.rows([
          { label: 'Folder', value: w.path, control: copyBtn('Copy the folder path', w.path, 'Folder path') },
          { label: 'Branch', value: w.branch },
          { label: 'Used by', value: who === 'No active owner' ? 'Nobody' : who },
          { label: 'How long it is kept', value: kept(w) },
          { label: 'Changes waiting', value: w.state === 'Clean' ? 'None' : (changesOf(w).replace(/ not saved to history yet$/, '') || w.state), status: w.state === 'Clean' ? '' : ui.status('Not saved to history yet', 'attention') }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Remove this working copy…', icon: 'trash', danger: true, do: 'source-copy-remove', data: { name: w.name }, disabled: busy, reason: w.name === 'main' ? 'This is the main working copy: your own files. It cannot be removed.' : 'A Goal is using it. It can be removed once the Goal ends.' })}</div>` }
      ];
    },
    changes: [
      { was: 'A worktree is one row whose only control is “More actions”: Details (a side panel of five facts), “Copy folder path” and “Remove”. “Remove” is greyed out for main and for one a Goal uses, with the reason only inside the menu.', now: 'A working copy has a page with the five facts. Copying the path is a button beside the path; Remove is a button that says why when it cannot be used.' },
      { was: 'The row reads “audit/settings · No active owner · Stale · 3 days”.', now: 'The page says “Nobody is using it any more. It can be removed; its branch is kept.”' }
    ]
  });

  /* ================================================================== How work is saved */
  const HOW_BRANCH = { Feature: 'one branch per piece of work', Hotfix: 'hotfix branches', Release: 'release branches', Trunk: 'the main branch itself', Custom: 'branches named your own way' };
  const HOW_MERGE = { auto: 'the way the project does it', merge: 'keeping every saved change', squash: 'combining them into one tidy change', rebase: 'replaying its changes on top' };
  const HOW_PUSH = { manual: 'when you say', auto: 'after each merge', never: 'never by themselves' };
  const phrase = (map, id) => map[String(SMX.val(id))] || lower(label(id, SMX.val(id)));
  const said = (st) => { const e = safety(st); return [`${mainBranch()} is ${e.protectMain ? 'protected, so changes to it go through a review' : 'not protected'}`, e.askDelete ? 'you are asked before a branch is deleted' : 'branches are deleted without asking', e.backupRisky ? 'a safety copy is saved before anything risky' : 'no safety copy is saved first']; };
  const FILES = [B + 'large-file-storage', B + 'large-file-threshold', B + 'large-file-types', B + 'default-ignore-patterns'];
  SMX.extend('source/rules', {
    title: 'How work is saved', icon: 'shield',
    purpose: 'How the assistant’s runs use version history, what guards your main branch, what is never saved, and how to undo.',
    legacy: [OLD('defaults')],
    keywords: ['branch', 'merge', 'push', 'force push', 'protected', 'lfs', 'ignore', 'gitignore', 'undo', 'recovery', 'squash', 'rebase', 'review request', 'pull request'],
    blurb: () => `Safety level ${label(PRESET, preset())} · changes go online ${phrase(HOW_PUSH, B + 'push-behavior')}`,
    status: () => ({ text: label(PRESET, preset()), tone: preset() === 'lenient' ? 'attention' : 'ready' }),
    lead: (ctx) => {
      const st = ctx.st; const e = safety(st); const custom = preset() === 'custom'; const runsOn = SMX.val(B + 'enable-git') !== false;
      const big = SMX.val(B + 'large-file-storage') !== false; const mb = SMX.val(B + 'large-file-threshold') || 50; const types = SMX.val(B + 'large-file-types'); const ign = SMX.val(B + 'default-ignore-patterns');
      const typeText = Array.isArray(types) && types.length ? types.join(', ') : ''; const ignList = Array.isArray(ign) ? ign : [];
      const tests = SMX.has(B + 'pre-merge-tests') ? (SMX.val(B + 'pre-merge-tests') ? 'On' : 'Off') : '';
      const pub = SMX.has('safety.approvals.external-publish-ask') ? (SMX.val('safety.approvals.external-publish-ask') ? 'Asks you first' : 'Does not ask') : 'Set under Safety';
      return [
        { key: 'summary', html: ui.summary({ icon: 'shield', tone: preset() === 'lenient' ? 'attention' : 'ready', lines: [
          runsOn ? `A run saves its work on ${ui.word(phrase(HOW_BRANCH, B + 'branch-strategy'), { go: 'source/rules', reveal: B + 'branch-strategy' })}; finished work joins the main branch by ${ui.word(phrase(HOW_MERGE, B + 'merge-strategy'), { go: 'source/rules', reveal: B + 'merge-strategy' })}. Changes go online ${ui.word(phrase(HOW_PUSH, B + 'push-behavior'), { go: 'source/rules', reveal: B + 'push-behavior' })}.` : `Runs ${ui.word('do not use version history', { go: 'source/rules', reveal: B + 'enable-git' })}: the assistant makes no branches and saves no changes to history.`,
          `The safety level is ${ui.b(label(PRESET, preset()))}: ${h(said(st).join('; '))}.`
        ] }) },
        { key: 'safety', html: ui.card({ title: 'Safety', anchor: 'safety', help: 'Guard rails for the assistant and for you. One level sets the three rules below it; Custom lets you set each one.', body: ui.settings([PRESET, FORCE]) + ui.rows([
          { label: 'Protected branches', covers: B + 'protected-branches', help: e.protectMain ? 'Never overwritten; a change to one of these goes through a review first.' : 'Not protected at this safety level.', value: plainBranches(protectedList()), muted: !e.protectMain, control: ui.btn({ label: 'Change', action: 'pm51-source-protected' }) },
          custom ? { label: 'Protect the main branch', help: 'Changes to it go through a review first.', control: toggle(!!e.protectMain, { action: 'pm51-source-cfg-toggle', data: { key: 'protectMain' }, label: 'Protect the main branch' }) } : null,
          custom ? { label: 'Ask before deleting a branch', control: toggle(!!e.askDelete, { action: 'pm51-source-cfg-toggle', data: { key: 'askDelete' }, label: 'Ask before deleting branches' }) } : null,
          custom ? { label: 'Save a safety copy before anything risky', help: 'So the step can be undone.', control: toggle(!!e.backupRisky, { action: 'pm51-source-cfg-toggle', data: { key: 'backupRisky' }, label: 'Back up before risky operations' }) } : null,
          tests ? { label: 'Tests before work is merged', help: 'Set with the other testing choices.', value: tests, control: ui.btn({ label: 'Testing', go: 'code/testing', reveal: B + 'pre-merge-tests' }) } : null,
          { label: 'Publishing and releases', help: 'Whether the assistant asks before it publishes anything is one of the things it always asks about.', value: pub, control: ui.btn({ label: 'When it asks you', go: 'safety/asking', reveal: 'safety.approvals.external-publish-ask' }) }
        ]) }) },
        { key: 'files', html: ui.card({ title: 'Files that need care', help: 'Big files slow history down, and some files must never be saved in it.', side: ui.btn({ label: 'Change', icon: 'edit', action: 'pm51-source-git-setup', data: { step: 2 } }), body: `<div data-smx-covers="${FILES.map(h).join(' ')}">${ui.rows([
          { label: 'Big files', help: big ? 'Kept apart from the normal history (with Git LFS), so the project stays small and fast.' : 'Stored like any other file.', value: big ? `Over ${mb} MB${typeText ? `, and always ${typeText}` : ''}` : 'No special handling' },
          { label: 'Never saved in history', help: 'Written to the ignore list (.gitignore) of every new repository. Secrets such as .env belong here.', value: ignList.length ? `${ignList.slice(0, 3).join(', ')}${ignList.length > 3 ? ` and ${ignList.length - 3} more` : ''}` : 'Nothing' }
        ])}</div>` }) },
        { key: 'undo', html: ui.card({ title: 'If something goes wrong', anchor: 'undo', help: 'These undo version history only. Nothing here deletes newer work.', body: ui.rows([
          { label: 'Undo the last thing Git did', help: 'Push of main to GitHub · 8 minutes ago', control: ui.btn({ label: 'Undo…', icon: 'restore', action: 'pm51-source-undo' }) },
          { label: 'Safety copies', help: 'Saved before each risky step. Going back to one never deletes newer work.', value: '3 saved', control: ui.btn({ label: 'Show them', icon: 'history', action: 'pm51-source-recovery' }) }
        ]) + ui.setting(B + 'recovery-tools')
          + `<p class="smx-quiet-line smx-pad">To bring back files or a whole project, use a backup: ${ui.link({ label: 'Get work back', go: 'keeping/restore' })}. A Goal’s own saved progress: ${ui.link({ label: 'When something goes wrong', go: 'planning/recovery' })}.</p>` }) }
      ];
    },
    sections: [{ key: 'runs', title: 'How runs use version history', help: 'Branches, merging and sending online, for work the assistant does. Off keeps runs away from history altogether.', ids: [B + 'enable-git', B + 'branch-strategy', B + 'branch-naming-pattern', B + 'merge-strategy', B + 'push-behavior', B + 'auto-pr', B + 'default-branch'] }],
    expert: [
      { key: 'panel', title: 'The Source Control side panel', help: 'What that panel shows beside your files. These change nothing about how work is saved.', ids: [B + 'source-control-sections', B + 'worktree-filter'] },
      { key: 'effect', html: (ctx) => { const st = ctx.st, e = safety(st); return ui.card({ title: 'Rules in effect', help: 'Written from the choices above and from Testing.', body: ui.facts([['Protected branches', e.protectMain ? protectedList().join(', ') : 'None'], ['Tests before merge', SMX.has(B + 'pre-merge-tests') ? (SMX.val(B + 'pre-merge-tests') ? 'On' : 'Off') : 'Set under Testing'], ['Force push', label(FORCE, SMX.val(FORCE))], ['Push credentials', 'The account that owns the code service'], ['Uncommitted changes', e.backupRisky ? 'Preserved before destructive operations' : 'Not preserved first']]) }) + ui.card({ title: 'Recent operations', body: ui.facts([['Push', 'main to GitHub · 8 minutes ago · succeeded'], ['Force push', 'main · 2 days ago · denied by policy'], ['Branch deleted', 'audit/settings · yesterday · you confirmed']]) }); }, count: 0 }
    ],
    covers: Object.assign({ [PRESET]: 'The card “Safety” on this page.', [FORCE]: 'The card “Safety” on this page.', [B + 'protected-branches']: '“Protected branches”, in the card “Safety”.', [B + 'recovery-tools']: '“Fix a stuck branch or working copy”, in the card “If something goes wrong”.' }, how(FILES, 'The card “Files that need care” on this page.')),
    changes: [
      { was: '“Defaults & Safety” is one tab of 23 rows in six sections: two defaults, who you are, files, how runs use history, safety and recovery, with 27 buttons.', now: 'Who you are moved to “You & your key”, and the two defaults to the overview. This page keeps what its name says, and opens with two sentences that read your current choices back to you; each underlined word jumps to its row.' },
      { was: '“Protected branches — main, release/*” shows pattern syntax with no explanation.', now: 'It reads “main, every branch that starts with release/”. The editor still takes patterns.' },
      { was: '“Recovery” offers “Undo last operation”, “Recovery points” and “Open recovery tools”. Elsewhere “recovery point” also means a backup, “restore point” a settings snapshot and an update’s safe point, and “checkpoint” a Goal’s progress; nothing says which one brings back what.', now: 'The card is “If something goes wrong”, says it undoes version history only, calls its points “safety copies”, and links to backups and to a Goal’s saved progress for the other two kinds.' },
      { was: '“Publishing and releases => On [Permissions]” and the policy line “Tests before merge: On” restate choices owned by Permissions and by Testing, as bare values.', now: 'Each says what the value means and links to the page that owns it: “When it asks you” and “Testing”.' },
      { was: '“Source Control panel” (which sections stay open, which workspaces are listed) sits under “Defaults & Safety”, as if it protected something.', now: 'It is under “For experts”, titled for what it is, with a line saying it changes nothing about how work is saved.' }
    ]
  });

  /* ================================================================== Online checks */
  SMX.extend('source/checks', {
    title: 'Online checks', icon: 'play',
    purpose: 'Builds and tests that a code service runs for you each time work is sent online. GitHub calls them Actions; others call them pipelines.',
    legacy: [OLD('actions')],
    keywords: ['actions', 'pipeline', 'pipelines', 'ci', 'workflow', 'runner', 'checks', 'build'],
    blurb: (ctx) => { const { f, ok } = checksFor(ctx.st); const list = flows(ctx.st); return ok ? `${count(list.length, 'check')} on ${f.name} · ${list.filter((w) => w.status === 'passing').length} passing` : 'No code service that runs checks is connected'; },
    status: (ctx) => { const { ok } = checksFor(ctx.st); const bad = flows(ctx.st).filter((w) => w.status === 'failing').length; return !ok ? { text: 'Not connected', tone: 'off' } : bad ? { text: `${bad} failing`, tone: 'attention' } : { text: 'Passing', tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st; settle(st); const { f, ok, repo } = checksFor(st); const list = flows(st); const pins = pinned(st);
      if (!ok) return [{ key: 'none', html: ui.card({ body: `<div class="smx-empty">${SMX.icon('play')}<div class="smx-empty-title">No online checks yet</div><div class="smx-empty-text">${h(f ? `${f.name} does not run builds and tests here.` : 'Connect a code service that runs builds and tests, such as GitHub, to see its checks here.')}</div>${ui.btn({ label: 'Code services', primary: true, go: 'source' })}</div>` }) }];
      const pass = list.filter((w) => w.status === 'passing').length, fail = list.filter((w) => w.status === 'failing').length, never = list.filter((w) => w.status !== 'passing' && w.status !== 'failing').length;
      return [
        { key: 'summary', html: ui.summary({ icon: 'play', tone: fail ? 'attention' : 'ready', lines: [`${ui.word(f.name, { go: svcRoute(f) })} runs ${ui.b(count(list.length, 'check'))} for ${ui.b(repo)}: ${[pass ? `${pass} passing` : '', fail ? `${fail} failing` : '', never ? `${never} never run` : ''].filter(Boolean).join(', ') || 'none yet'}.`, 'A pinned check is watched from inside Puppet Master: its result shows in the Source Control panel.'] }) },
        { key: 'list', html: `<div data-smx-covers="${h(PIN)}">${ui.things({ title: `Checks on ${f.name}`, help: `${f.automationLabel} for ${repo}.`, add: { label: 'Copy the link to them', icon: 'copy', action: 'pm51-source-open-external', data: { name: f.name, id: f.id } },
          items: list.map((w) => { const on = pins.includes(w.name); return { icon: 'play', name: w.name, tag: on ? 'Pinned' : '', sub: `${TRIGGER[w.trigger] || w.trigger} · last run ${lower(w.lastRun)}`, sub2: w.workflow, status: w.status === 'passing' ? { text: 'Passing', tone: 'ready' } : w.status === 'failing' ? { text: 'Failing', tone: 'attention' } : { text: 'Never run', tone: 'off' }, side: ui.btn({ label: on ? 'Unpin' : 'Pin', icon: 'pin', action: 'pm51-source-pin', data: { name: w.name } }) + ui.btn({ label: 'Run', icon: 'play', action: 'pm51-source-run', data: { name: w.name } }) }; }),
          empty: { icon: 'play', title: 'No checks in this repository yet', text: 'The switch below adds a starter test check.' } })}</div>` },
        { key: 'logs', html: ui.links([{ label: 'See what the latest runs printed', action: 'pm51-source-logs' }]) }
      ];
    },
    sections: [{ key: 'current', title: 'Keeping checks current', help: 'Refreshing the results of pinned checks, and a ready-made test check for a repository that has none.', ids: [B + 'github-actions-auto-refresh', 'planning.testing.github-actions-template'] }],
    expert: [{ key: 'runners', when: (ctx) => checksFor(ctx.st).ok, html: (ctx) => { const { f } = checksFor(ctx.st); return ui.card({ title: 'Where the checks run', help: 'A runner is the computer a check runs on.', body: ui.facts([['Hosted runners', `Provided by ${f.name}`], ['Self-hosted', 'None registered'], ['Concurrency', 'Up to 4 jobs at once']]) }); }, count: 0 }],
    covers: { [PIN]: 'The list “Checks” on this page: Pin and Unpin on each row.' },
    changes: [
      { was: 'The tab is called “Actions & Pipelines” and lists workflows as “ci.yml · runs on every push and pull request · last run 8 minutes ago”. Pinning is an icon with no word.', now: 'The page is “Online checks” and its first sentence says what a check is. Each row leads with when it runs; the file name is second. Pin and Run are buttons with words.' },
      { was: '“View logs” is under “More options” next to runner facts (“Hosted runners”, “Self-hosted”, “Concurrency”), so the one thing needed when a check fails is hidden behind what almost nobody needs.', now: '“See what the latest runs printed” is under the list. The runner facts are under “For experts”, with one line saying what a runner is.' },
      { was: 'Pins are kept twice in PMConcept7 (on each workflow and in the “Pinned workflows” setting) and are moved from one to the other the first time the tab draws.', now: 'The list reads both, so it shows the same pins on a fresh load and after.' }
    ]
  });

  /* search: code services, accounts, repositories, working copies and tools, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => {
    const out = [];
    for (const f of forges(st)) { out.push({ title: f.name, sub: `Source control › ${connected(f) ? 'connected' : 'not connected'}`, route: svcRoute(f) }); for (const a of accountsOf(st, f)) out.push({ title: a.name, sub: `Source control › ${f.name} › account`, route: acctRoute(f, a) }); }
    for (const r of repos(st)) out.push({ title: r.name, sub: 'Source control › Repositories', route: repoRoute(r) });
    for (const w of copies(st)) out.push({ title: w.name, sub: 'Source control › Working copies', route: copyRoute(w) });
    for (const t of tools(st)) out.push({ title: t.name, sub: 'Source control › The tools underneath', route: `source/tool/${enc(t.id)}` });
    for (const w of flows(st)) out.push({ title: w.name, sub: 'Source control › Online checks', route: 'source/checks' });
    return out;
  });
})(window);
