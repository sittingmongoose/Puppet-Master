/* Permissions & Safety — what the assistant may do on its own, and when it must ask. */
(function () {
  const ID = 'permissions';
  const KEY = 'permissions-filesafe';
  const TABS = [{ id: 'profiles', label: 'Profiles' }, { id: 'rules', label: 'Rules' }, { id: 'protected', label: 'Protected Files' }, { id: 'approvals', label: 'Approvals' }, { id: 'limits', label: 'Limits' }];
  const DECISIONS = ['Allow', 'Ask', 'Deny'];
  const ACCESS_OPTIONS = ['Read and write', 'Read only', 'Source-control tools only', 'Temporary artifacts only', 'Deny direct read'];
  const h = PM51.h;

  PM51.style(`
#panel-settings .pm51-perm-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-perm-check { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
#panel-settings .pm51-perm-check .text-control { width: 280px; max-width: 100%; }
#panel-settings .pm51-perm-why { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
#panel-settings .pm51-perm-why .text-control { flex: 1 1 240px; }
#panel-settings .pm51-perm-table { width: 100%; border-collapse: collapse; font-size: 12px; }
#panel-settings .pm51-perm-table th, #panel-settings .pm51-perm-table td { text-align: left; padding: 7px 8px; border-top: 1px solid var(--k3-line); vertical-align: top; }
#panel-settings .pm51-perm-table th { color: var(--k3-text-3); font-weight: 650; font-size: 11px; border-top: 0; }
#panel-settings .pm51-perm-table td:first-child { color: var(--k3-text-1); font-weight: 600; }
`);

  const pm = () => PM51.s().permissions;
  const profiles = () => state.permissionProfiles;
  const rules = () => state.permissionRules;
  const paths = () => state.fileSafePaths;
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const inUse = p => p.status === 'default';
  const decisionTone = d => d === 'Allow' ? 'ready' : d === 'Ask' ? 'attention' : 'blocked';
  const pathTone = st => st === 'active' ? 'ready' : st === 'attention' ? 'attention' : 'off';
  const pathPill = st => PM51.pill(st === 'active' ? 'Ready' : st === 'attention' ? 'Needs attention' : 'Off', pathTone(st));
  const asksBefore = () => rules().filter(r => r.decision === 'Ask').map(r => r.action);
  const neverAllows = () => rules().filter(r => r.decision === 'Deny').map(r => r.action);
  const listSentence = (items, fallback) => items.length ? items.join(', ').replace(/, ([^,]*)$/, ' and $1') : fallback;
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- Profiles ---------------------------------------------------- */
  function renderProfiles() {
    const P = profiles();
    if (!P.length) return PM51.section({ title: 'Profiles', body: PM51.empty('No profiles yet', 'A profile bundles rules into one choice you can switch between.', { label: 'New profile', action: 'pm51-permissions-profile-new' }) });
    const current = P.find(inUse) || P[0];
    const selId = PM51.sel(ID, current.id);
    const p = P.find(x => x.id === selId) || current;
    const items = P.map(x => ({ id: x.id, title: x.name, meta: `${x.rules} rules · ${x.scope}`, tone: inUse(x) ? 'ready' : 'neutral', selected: x.id === p.id }));
    const body = PM51.section({ title: 'What this profile does', body: PM51.rows([
      { label: 'Summary', value: p.description },
      { label: 'Rules', value: `${p.rules} rules`, action: { label: 'See rules', icon: 'arrowRight', action: 'pm51-permissions-tab', data: { tab: 'rules' } } },
      { label: 'Scope', help: 'Project applies to this workspace. Session lasts until you close the app.', value: p.scope },
      { label: 'Asks before', value: listSentence(asksBefore(), 'Nothing extra') },
      { label: 'Never allows', value: listSentence(neverAllows(), 'Nothing is fully blocked') }
    ]) });
    const effective = `<table class="pm51-perm-table"><thead><tr><th>Resource</th><th>Right now</th><th>Because of</th></tr></thead><tbody>${[
      ['Project files', 'Read and write inside the project', 'Profile rule'],
      ['Protected paths', `${paths().length} boundaries applied`, 'Protected Files'],
      ['Commands', 'Tests run freely; installs ask first', 'Profile rule'],
      ['Network', pm().guardrails.network, 'Limits'],
      ['Version history', 'Force push blocked on protected branches', 'Rule']
    ].map(r => `<tr><td>${h(r[0])}</td><td>${h(r[1])}</td><td>${h(r[2])}</td></tr>`).join('')}</tbody></table>`;
    const advanced = PM51.advanced([
      PM51.section({ title: 'Effective access now', help: `With ${current.name} in use.`, body: effective }),
      PM51.section({ title: 'Why is this allowed?', help: 'Type an action to see which rule decides it.', body: `<div class="pm51-perm-why">${PM51.input(PM51.s().permWhy || '', { action: 'pm51-permissions-why-input', placeholder: 'e.g. Write project files', label: 'Action to explain' })}${PM51.btn({ label: 'Explain', small: true, icon: 'search', action: 'pm51-permissions-why' })}</div>` }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Profiles', String(P.length)], ['Rules', String(rules().length)], ['Protected paths', String(paths().length)], ['Order of evaluation', 'Protected Files, then rules in order, then approvals, then limits']]) + `<div class="pm51-perm-actions" style="margin-top:10px">${PM51.btn({ label: 'Export audit report', small: true, icon: 'download', action: 'pm51-permissions-audit-export' })}${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-permissions-diagnostics' })}</div>` })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Profiles', count: P.length,
      add: { action: 'pm51-permissions-profile-new', label: 'New profile' },
      items,
      detail: {
        title: p.name, subtitle: p.scope === 'Session' ? 'Lasts until you close the app' : 'Applies to this workspace', pill: PM51.pill(inUse(p) ? 'In use' : 'Available', inUse(p) ? 'ready' : 'off'),
        primary: inUse(p) ? { label: 'Edit', icon: 'edit', action: 'pm51-permissions-profile-edit', data: { id: p.id } } : { label: 'Use this profile', icon: 'check', action: 'pm51-permissions-profile-use', data: { id: p.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => editPermissionProfile(p) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const c = clone(p); c.id = uid('permission', `${p.name}-copy`); c.name = `${p.name} copy`; c.status = 'available'; P.push(c); PM51.setSel(ID, c.id); refresh(); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, disabled: inUse(p), meta: inUse(p) ? 'In use' : '', onClick: () => PM51.confirm(`Delete ${p.name}?`, 'Rules that belong only to this profile are removed with it.', 'Delete', () => { state.permissionProfiles = P.filter(x => x.id !== p.id); PM51.setSel(ID, (state.permissionProfiles.find(inUse) || state.permissionProfiles[0] || {}).id || ''); refresh(); }, true) }
        ], p.name),
        body: body + advanced
      }
    });
  }

  /* ---------- Rules ------------------------------------------------------- */
  function renderRules() {
    const R = rules();
    const list = R.length ? PM51.list(R.map((r, i) => ({
      title: r.action, meta: r.condition, pill: PM51.pill(r.decision, decisionTone(r.decision)), avatar: `<span class="pm51-step-n">${i + 1}</span>`,
      end: PM51.iconBtn({ icon: 'more', label: `More for ${r.action}`, callback: el => PM51.menu(el, [
        { label: 'Move up', icon: 'up', disabled: i === 0, onClick: () => { moveItem(R, i, -1); refresh(); } },
        { label: 'Move down', icon: 'down', disabled: i === R.length - 1, onClick: () => { moveItem(R, i, 1); refresh(); } },
        { label: 'Edit', icon: 'edit', onClick: () => ruleDialog(i) },
        { separator: true },
        { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${r.action}”?`, 'Later rules move up to take its place.', 'Delete', () => { R.splice(i, 1); refresh(); }, true) }
      ], r.action) })
    }))) : PM51.empty('No rules yet', 'Add a rule to decide what the assistant may do on its own.', { label: 'Add rule', action: 'pm51-permissions-rule-add' });
    const section = PM51.section({ title: 'Rules, in order', help: 'The first matching rule decides. Allow happens quietly, Ask waits for you, Deny always blocks.', action: { label: 'Add rule', icon: 'plus', action: 'pm51-permissions-rule-add' }, body: list });
    const sources = {}; R.forEach(r => { sources[r.source || 'Project rule'] = (sources[r.source || 'Project rule'] || 0) + 1; });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Rule sources', help: 'Where each rule came from.', body: PM51.kv(Object.entries(sources).map(([k, v]) => [k, `${v} rule${v === 1 ? '' : 's'}`])) }),
      PM51.section({ title: 'Import and export', body: `<div class="pm51-perm-actions">${PM51.btn({ label: 'Export rules', small: true, icon: 'download', action: 'pm51-permissions-rules-export' })}${PM51.btn({ label: 'Import rules', small: true, icon: 'upload', action: 'pm51-permissions-rules-import' })}${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-permissions-diagnostics' })}</div>` })
    ].join(''));
    return section + advanced;
  }

  /* ---------- Protected Files --------------------------------------------- */
  function renderProtected() {
    const F = paths();
    const list = F.length ? PM51.list(F.map((f, i) => ({
      title: f.path, meta: f.access, pill: pathPill(f.status), avatar: icon(f.access === 'Deny direct read' ? 'lock' : 'folder'), end: icon('chevron'),
      action: 'pm51-permissions-path', data: { index: i }
    }))) : PM51.empty('No protected paths', 'Add a path to control what the assistant may read or change there.', { label: 'Add path', action: 'pm51-permissions-path-add' });
    const protectedSection = PM51.section({ title: 'Protected paths', help: 'Folders and files with their own access rules.', action: { label: 'Add path', icon: 'plus', action: 'pm51-permissions-path-add' }, body: list });
    const check = PM51.section({ title: 'Check a path', help: 'See what the assistant may do with a file or folder.', body: `<div class="pm51-perm-check">${PM51.input(PM51.s().permCheckPath || '', { action: 'pm51-permissions-check-input', placeholder: '${projectRoot}/src/main.rs', label: 'Path to check' })}${PM51.btn({ label: 'Check path', small: true, icon: 'test', action: 'pm51-permissions-check' })}</div>` });
    const advanced = PM51.advanced(PM51.section({ title: 'Inheritance details', help: 'A path takes the rule of the closest protected folder above it.', body: PM51.kv(F.map(f => [f.path, `${f.inheritance} · ${f.access}`])) }));
    return protectedSection + check + advanced;
  }

  /* ---------- Approvals --------------------------------------------------- */
  function renderApprovals() {
    const A = pm().approvals.filter(x => x.status === 'Waiting'), pol = pm().policy;
    const waiting = PM51.section({ title: 'Waiting for you', help: 'Actions the assistant wants to take but is not allowed to do alone.', body: A.length ? PM51.list(A.map(x => ({
      title: x.action, meta: `${x.from} · ${x.risk}`, avatar: icon('alert'),
      end: PM51.btn({ label: 'Approve', small: true, primary: true, icon: 'check', action: 'pm51-permissions-approve', data: { id: x.id } }) + PM51.btn({ label: 'Reject', small: true, action: 'pm51-permissions-reject', data: { id: x.id } })
    }))) : PM51.empty('Nothing waiting.', 'Requests that need your say-so show up here.') });
    const policy = PM51.section({ title: 'Approval policy', body: PM51.rows([
      { label: 'Expire after', help: 'Unanswered requests are treated as rejected.', control: PM51.select(pol.expire, ['15 minutes', '30 minutes', '1 hour', 'Never'], { action: 'pm51-permissions-policy-expire', label: 'Expire after' }) },
      { label: 'Remember my choice for this session', help: 'The same request is not asked again until you close the app.', control: PM51.toggle(!!pol.remember, { action: 'pm51-permissions-policy-remember', label: 'Remember my choice for this session' }) }
    ]) });
    const advanced = PM51.advanced(PM51.section({ title: 'Technical details', body: PM51.kv([['Answered this session', String(pm().approvals.filter(x => x.status !== 'Waiting').length)], ['Waiting', String(A.length)], ['Alerts route', pol.askIn]]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-permissions-diagnostics' })}</div>` }));
    return waiting + policy + advanced;
  }

  /* ---------- Limits ------------------------------------------------------ */
  function renderLimits() {
    const G = pm().guardrails;
    const runaway = PM51.section({ title: 'Stop runaway work', help: 'Safety nets for Goals that loop, stall, or spend too much.', body: PM51.rows([
      { label: 'Max time without progress', control: PM51.select(G.maxIdle, ['10 minutes', '20 minutes', '30 minutes', '1 hour'], { action: 'pm51-permissions-limit-select', data: { key: 'maxIdle' }, label: 'Max time without progress' }) },
      { label: 'Then', help: 'What happens when a limit is hit.', control: PM51.select(G.then, ['Pause and ask', 'Stop the Goal', 'Keep going but warn me'], { action: 'pm51-permissions-limit-select', data: { key: 'then' }, label: 'Then' }) }
    ]) });
    const resources = PM51.section({ title: 'Resource limits', body: PM51.rows([
      { label: 'Parallel tasks', help: 'How many things run at once.', control: PM51.select(String(G.parallel), ['1', '2', '3', '4', '6', '8'], { action: 'pm51-permissions-limit-select', data: { key: 'parallel' }, label: 'Parallel tasks' }) },
      { label: 'Disk', help: 'Space the assistant may use for its own files.', control: PM51.select(G.disk, ['1 GB', '5 GB', '20 GB', 'No limit'], { action: 'pm51-permissions-limit-select', data: { key: 'disk' }, label: 'Disk' }) },
      { label: 'Network', control: PM51.select(G.network, ['Ask for new hosts', 'Allow all', 'Block all'], { action: 'pm51-permissions-limit-select', data: { key: 'network' }, label: 'Network' }) }
    ]) });
    const advanced = PM51.advanced(PM51.section({ title: 'Technical thresholds', body: PM51.kv([['Repeated identical failures', '3 before pausing'], ['Shell failures in a row', '5'], ['Rewrite churn on one file', '4 rewrites without a passing check'], ['Loop detection', 'Same tool call repeated 6 times']]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-permissions-diagnostics' })}</div>` }));
    return runaway + resources + advanced;
  }

  function render() {
    const tab = PM51.tab(ID, 'profiles');
    const body = tab === 'rules' ? renderRules() : tab === 'protected' ? renderProtected() : tab === 'approvals' ? renderApprovals() : tab === 'limits' ? renderLimits() : renderProfiles();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Reset permissions defaults', action: 'pm51-permissions-reset' },
      { label: 'How permissions work', action: 'pm51-permissions-help' }
    ] });
  }
  PM51.manager('permissions', { render });

  /* ---------- dialogs & panels -------------------------------------------- */
  function ruleDialog(index) {
    const R = rules(), r = index >= 0 ? R[index] : null;
    openDialog({ title: r ? 'Edit rule' : 'Add rule', subtitle: 'Say what the action is, what should happen, and when the rule applies.', body: PM51.form([
      { label: 'Action', name: 'action', value: r ? r.action : '', placeholder: 'e.g. Send external message', autofocus: true, full: true },
      { label: 'Decision', name: 'decision', value: r ? r.decision : 'Ask', type: 'select', choices: DECISIONS },
      { label: 'Condition', name: 'condition', value: r ? r.condition : '', placeholder: 'e.g. Only inside the project', full: true, help: 'Leave empty to apply always.' }
    ]), saveLabel: r ? 'Save' : 'Add rule', onSave: data => {
      const action = String(data.action || '').trim(); if (!action) { PM51.toast('Name the action', 'Say what the rule is about.', 'warning'); return false; }
      const next = { action, decision: DECISIONS.includes(data.decision) ? data.decision : 'Ask', condition: String(data.condition || '').trim() || 'Always', source: r ? r.source : 'Project rule' };
      if (r) Object.assign(r, next); else R.push(next);
      refresh();
    } });
  }
  function pathDialog(index) {
    const F = paths(), f = index >= 0 ? F[index] : null;
    openDialog({ title: f ? 'Edit protected path' : 'Add protected path', subtitle: 'Paths can use ${projectRoot} for the workspace folder.', body: PM51.form([
      { label: 'Path', name: 'path', value: f ? f.path : '${projectRoot}/', autofocus: true, full: true },
      { label: 'Access', name: 'access', value: f ? f.access : 'Read only', type: 'select', choices: ACCESS_OPTIONS },
      { label: 'Applies to', name: 'inheritance', value: f ? f.inheritance : 'This folder and everything inside', placeholder: 'This folder and everything inside' }
    ]), saveLabel: f ? 'Save' : 'Add path', onSave: data => {
      const path = String(data.path || '').trim(); if (!path) return false;
      const next = { path, access: String(data.access), inheritance: String(data.inheritance || '').trim() || 'This folder and everything inside', status: f ? f.status : 'active' };
      if (f) Object.assign(f, next); else F.push(next);
      closeOverlay(); refresh();
    } });
  }
  function pathPanel(index) {
    const f = paths()[index]; if (!f) return;
    PM51.panel({
      title: f.path, subtitle: f.access, pill: pathPill(f.status),
      body: PM51.panelSection('Protected path', PM51.kv([['Path', f.path], ['Access', f.access], ['Applies to', f.inheritance], ['Status', f.status === 'active' ? 'Ready' : f.status]]))
        + PM51.panelSection('Actions', `<div class="pm51-perm-actions">${PM51.btn({ label: 'Edit', small: true, icon: 'edit', action: 'pm51-permissions-path-edit', data: { index } })}${PM51.btn({ label: f.status === 'disabled' ? 'Turn on' : 'Turn off', small: true, icon: f.status === 'disabled' ? 'play' : 'pause', action: 'pm51-permissions-path-toggle', data: { index } })}${PM51.btn({ label: 'Remove', small: true, danger: true, icon: 'trash', action: 'pm51-permissions-path-remove', data: { index } })}</div>`),
      primaryLabel: 'Done', onPrimary: () => refresh()
    });
  }
  function explain(actionText) {
    const q = String(actionText || '').trim().toLowerCase();
    const R = rules();
    const rule = q ? R.find(r => r.action.toLowerCase().includes(q) || q.includes(r.action.toLowerCase())) : null;
    const current = profiles().find(inUse) || profiles()[0];
    PM51.panel({
      title: 'Why is this allowed?', subtitle: actionText ? `“${actionText}”` : 'No action typed', pill: rule ? PM51.pill(rule.decision, decisionTone(rule.decision)) : PM51.pill('Ask', 'attention'),
      body: PM51.panelSection('Decision path', PM51.steps([
        { title: 'Protected Files', desc: `${paths().length} boundaries checked first`, done: true },
        { title: rule ? `Rule ${R.indexOf(rule) + 1}: ${rule.action}` : 'No matching rule', desc: rule ? `${rule.decision} · ${rule.condition}` : 'Unmatched actions ask first', done: true },
        { title: 'Profile', desc: current ? `${current.name} is in use` : 'No profile', done: true },
        { title: 'Result', desc: rule ? `${rule.decision}${rule.decision === 'Ask' ? ' — you are asked before it happens' : rule.decision === 'Deny' ? ' — always blocked' : ' — happens without asking'}` : 'Ask — you are asked before it happens', status: rule ? rule.decision : 'Ask', tone: rule ? decisionTone(rule.decision) : 'attention' }
      ]))
    });
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('permissions-tab', el => { PM51.setTab(ID, ds(el, 'tab')); PM51.refresh(ID); });
  PM51.on('permissions-profile-new', () => editPermissionProfile());
  PM51.on('permissions-profile-edit', el => { const p = profiles().find(x => x.id === ds(el, 'id')); if (p) editPermissionProfile(p); });
  PM51.on('permissions-profile-use', el => { const p = profiles().find(x => x.id === ds(el, 'id')); if (!p) return; profiles().forEach(x => { if (inUse(x)) x.status = 'available'; }); p.status = 'default'; refresh(); PM51.toast(`${p.name} is in use`, 'New actions follow this profile from now on.'); });
  PM51.onInput('permissions-why-input', el => { PM51.s().permWhy = el.value; });
  PM51.on('permissions-why', el => { const input = el.closest('.pm51-perm-why')?.querySelector('input'); explain(input ? input.value : PM51.s().permWhy); });
  PM51.on('permissions-audit-export', () => PM51.toast('Audit report prepared', 'Example data only. A report of profiles, rules, protected paths, and approvals would be saved.', 'info'));
  PM51.on('permissions-diagnostics', () => PM51.check({ title: 'Permissions & Safety diagnostics', steps: [
    { title: 'One profile in use', desc: (profiles().find(inUse) || {}).name || 'None', tone: profiles().some(inUse) ? 'ready' : 'attention', status: profiles().some(inUse) ? 'Checked' : 'Needs attention' },
    { title: 'Rules readable in order', desc: `${rules().length} rules` },
    { title: 'Protected paths resolve', desc: `${paths().length} paths` },
    { title: 'Approval route reachable', desc: pm().policy.askIn },
    { title: 'Limits within safe range', desc: `${pm().guardrails.maxTurns} turns · ${pm().guardrails.maxCost} · ${pm().guardrails.parallel} parallel` }
  ] }));
  PM51.on('permissions-rule-add', () => ruleDialog(-1));
  PM51.on('permissions-rules-export', () => PM51.toast('Rules export prepared', 'Example data only. The rules would be saved as a file you can share.', 'info'));
  PM51.on('permissions-rules-import', () => openDialog({ title: 'Import rules', subtitle: 'You see the rules before they are added.', body: PM51.form([{ label: 'Rules file', name: 'file', value: '', type: 'file', full: true }, { label: 'Where to add them', name: 'where', value: 'After existing rules', type: 'select', choices: ['After existing rules', 'Before existing rules', 'Replace existing rules'] }]), saveLabel: 'Preview import', onSave: data => { PM51.toast('Import preview', `Example data only. ${data.file || 'The file'} would be checked before any rule is added.`, 'info'); } }));
  PM51.on('permissions-path', el => pathPanel(Number(ds(el, 'index'))));
  PM51.on('permissions-path-add', () => pathDialog(-1));
  PM51.on('permissions-path-edit', el => pathDialog(Number(ds(el, 'index'))));
  PM51.on('permissions-path-toggle', el => { const f = paths()[Number(ds(el, 'index'))]; if (!f) return; f.status = f.status === 'disabled' ? 'active' : 'disabled'; closeOverlay(); refresh(); });
  PM51.on('permissions-path-remove', el => { const i = Number(ds(el, 'index')), f = paths()[i]; if (!f) return; PM51.confirm(`Remove ${f.path}?`, 'The path falls back to the rules of the folder above it.', 'Remove', () => { paths().splice(i, 1); closeOverlay(); refresh(); }, true); });
  PM51.onInput('permissions-check-input', el => { PM51.s().permCheckPath = el.value; });
  PM51.on('permissions-check', el => {
    const input = el.closest('.pm51-perm-check')?.querySelector('input'); const path = String((input ? input.value : PM51.s().permCheckPath) || '').trim();
    if (!path) { PM51.toast('Type a path first', 'For example ${projectRoot}/src.', 'info'); return; }
    const match = paths().filter(f => f.status !== 'disabled' && (path.startsWith(f.path.replace(/\/$/, '')) || path === f.path)).sort((x, y) => y.path.length - x.path.length)[0];
    PM51.check({ title: `Check path · ${path}`, subtitle: 'What the assistant may do here. Example data only; no file was touched.', outcome: match ? match.access : 'Read and write', tone: match && /deny/i.test(match.access) ? 'blocked' : match && /only/i.test(match.access) ? 'attention' : 'ready', steps: [
      { title: 'Path resolved', desc: path },
      { title: match ? `Inside ${match.path}` : 'No protected path applies', desc: match ? match.inheritance : 'Project defaults apply' },
      { title: 'Access', desc: match ? match.access : 'Read and write', status: match ? match.access : 'Read and write', tone: match && /deny/i.test(match.access) ? 'blocked' : match && /only/i.test(match.access) ? 'attention' : 'ready' }
    ] });
  });
  PM51.on('permissions-approve', el => { const x = pm().approvals.find(y => y.id === ds(el, 'id')); if (!x) return; x.status = 'Approved'; refresh(); PM51.toast('Approved', `Example data only. “${x.action}” would go ahead now.`, 'info'); });
  PM51.on('permissions-reject', el => { const x = pm().approvals.find(y => y.id === ds(el, 'id')); if (!x) return; x.status = 'Rejected'; refresh(); PM51.toast('Rejected', `“${x.action}” will not happen.`, 'info'); });
  PM51.onChange('permissions-policy-askin', el => { pm().policy.askIn = el.value; saveState(); });
  PM51.onChange('permissions-policy-expire', el => { pm().policy.expire = el.value; saveState(); });
  PM51.on('permissions-policy-remember', () => { pm().policy.remember = !pm().policy.remember; refresh(); });
  PM51.onInput('permissions-limit', el => { const key = ds(el, 'key'); pm().guardrails[key] = key === 'maxTurns' ? Number(el.value) || 0 : el.value; saveState(); });
  PM51.onChange('permissions-limit-select', el => { const key = ds(el, 'key'); pm().guardrails[key] = key === 'parallel' ? Number(el.value) : el.value; saveState(); });
  PM51.on('permissions-reset', () => PM51.confirm('Reset permissions defaults?', 'Approval policy and limits go back to their defaults. Profiles, rules, and protected paths are kept.', 'Reset', () => { const s = PM51.s(); s.permissions.policy = { askIn: 'In-app', expire: '30 minutes', remember: true }; s.permissions.guardrails = { maxTurns: 60, maxCost: '$5.00', maxIdle: '20 minutes', then: 'Pause and ask', parallel: 3, disk: '5 GB', network: 'Ask for new hosts' }; refresh(); PM51.toast('Permissions defaults restored'); }));
  PM51.on('permissions-help', () => PM51.panel({
    title: 'How permissions work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A profile is a bundle of rules. Each rule says whether an action happens quietly (Allow), waits for you (Ask), or is always blocked (Deny). Protected Files add extra care for specific folders.</p>')
      + PM51.panelSection('Order', PM51.kv([['1. Protected Files', 'Checked first, always.'], ['2. Rules', 'The first matching rule decides.'], ['3. Approvals', 'Ask rules wait for your answer.'], ['4. Limits', 'Runaway work is paused no matter what the rules say.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Anything without a rule asks first. You can always answer “Remember my choice for this session” to stop repeat questions.</p>')
  }));
})();
