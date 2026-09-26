/* Permissions & Safety — what the assistant may do on its own, and when it must ask.
   One copy of each choice: the manager's own "Expire after", "Remember my choice", "Then", "Parallel tasks", Disk,
   Network and the hard-coded thresholds repeated inventory rows with other values and are gone; the rows are drawn
   in their tabs instead. The profile in use is the inventory's safety level (permission preset); the ordered rule
   list is the inventory's rule list (checked top to bottom, the last match wins); the per-tool answers are fixed
   tables with one line per tool. */
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
  /* The built-in profiles are the inventory's safety levels; a profile you make yourself counts as Custom. */
  const PRESET_OF = { 'hands-off': 'full', 'review-first': 'regular', 'read-only': 'read_only' };
  const presetOf = p => p.preset || PRESET_OF[p.id] || 'custom';
  function syncFromPreset() {
    const want = PM51.value('safety.rules.permission-preset'); const P = profiles() || [];
    const match = P.find(p => presetOf(p) === want); if (!match || inUse(match)) return;
    P.forEach(x => { if (inUse(x)) x.status = 'available'; }); match.status = 'default';
  }
  const TOOLS = [['bash', 'Run commands'], ['edit', 'Edit files'], ['read', 'Read files'], ['grep', 'Search in files'], ['question', 'Ask you a question'], ['todo_write', 'Write the to-do list'], ['todo_read', 'Read the to-do list'], ['skill', 'Use skills'], ['lsp_readonly', 'Code intelligence (read only)']];
  const WEB_TOOLS = [['websearch', 'Search the web'], ['webfetch', 'Read one page'], ['webextract', 'Turn pages into data'], ['webresearch', 'Research'], ['webcrawl', 'Crawl a site'], ['webmap', 'Outline a site']];
  const ANSWERS = [['allow', 'Allow'], ['ask', 'Ask'], ['deny', 'Block']];
  function toolTable(id, tools) {
    const v = PM51.value(id) || {};
    return PM51.home(id, PM51.rows(tools.map(([key, label]) => ({ label, control: PM51.segmented(v[key] || 'ask', ANSWERS, { action: 'pm51-permissions-tool', data: { setting: id, tool: key }, label }) }))), 'div');
  }
  const ruleText = r => `${r.action}: ${String(r.decision).toLowerCase()}${r.condition && r.condition !== 'Always' ? ` (${r.condition})` : ''}`;
  function syncRuleEditor() { if (commitSettingValue('safety.rules.rule-editor', rules().map(ruleText))) saveState(); }
  const simpleView = () => PM51.value('safety.rules.ui-mode') !== 'Expert';

  /* ---------- Profiles ---------------------------------------------------- */
  function renderProfiles() {
    syncFromPreset();
    const P = profiles();
    if (!P.length) return PM51.section({ title: 'Profiles', body: PM51.empty('No profiles yet', 'A profile bundles rules into one choice you can switch between.', { label: 'New profile', action: 'pm51-permissions-profile-new' }) });
    const current = P.find(inUse) || P[0];
    const selId = PM51.sel(ID, current.id);
    const p = P.find(x => x.id === selId) || current;
    const items = P.map(x => ({ id: x.id, title: x.name, meta: `${x.rules} rules · ${x.scope}`, tone: inUse(x) ? 'ready' : 'neutral', selected: x.id === p.id }));
    const body = PM51.section({ title: 'What this profile does', body: PM51.rows([
      { label: 'Summary', value: p.description },
      { label: 'Safety level', help: 'Built-in profiles are the preset levels; your own count as Custom.', value: PM51.valueLabel('safety.rules.permission-preset', presetOf(p)) },
      { label: 'Rules', value: `${p.rules} rules`, action: { label: 'See rules', icon: 'arrowRight', action: 'pm51-permissions-tab', data: { tab: 'rules' } } },
      { label: 'Scope', help: 'Project applies to this workspace. Session lasts until you close the app.', value: p.scope },
      { label: 'Asks before', value: listSentence(asksBefore(), 'Nothing extra') },
      { label: 'Never allows', value: listSentence(neverAllows(), 'Nothing is fully blocked') }
    ]) });
    const effective = `<table class="pm51-perm-table"><thead><tr><th>Resource</th><th>Right now</th><th>Because of</th></tr></thead><tbody>${[
      ['Project files', 'Read and write inside the project', 'Profile rule'],
      ['Protected paths', `${paths().length} boundaries applied`, 'Protected Files'],
      ['Commands', PM51.value('safety.protection.bash-guard') === false || PM51.value('safety.protection.bash-guard') === 'off' ? 'Dangerous commands are not blocked' : 'Tests run freely; dangerous commands are blocked', 'Dangerous commands'],
      ['Network', PM51.value('web.fetch.air-gap-mode') === true ? 'Blocked: working offline' : webSummary(), PM51.value('web.fetch.air-gap-mode') === true ? 'Web & Research' : 'Answers for each web ability'],
      ['Version history', 'Force push blocked on protected branches', 'Rule']
    ].map(r => `<tr><td>${h(r[0])}</td><td>${h(r[1])}</td><td>${h(r[2])}</td></tr>`).join('')}</tbody></table>`;
    const advanced = PM51.advanced([
      PM51.section({ title: 'Effective access now', help: `With ${current.name} in use.`, body: effective }),
      PM51.section({ title: 'Why is this allowed?', help: 'Type an action to see which rule decides it.', body: `<div class="pm51-perm-why">${PM51.input(PM51.s().permWhy || '', { action: 'pm51-permissions-why-input', placeholder: 'e.g. Write project files', label: 'Action to explain' })}${PM51.btn({ label: 'Explain', small: true, icon: 'search', action: 'pm51-permissions-why' })}</div>` }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Profiles', String(P.length)], ['Rules', String(rules().length)], ['Protected paths', String(paths().length)], ['Order of evaluation', 'Protected Files, then rules in order, then approvals, then limits']]) + `<div class="pm51-perm-actions" style="margin-top:10px">${PM51.btn({ label: 'Export audit report', small: true, icon: 'download', action: 'pm51-permissions-audit-export' })}</div>` })
    ].join(''));
    return PM51.home('safety.rules.permission-preset', PM51.listDetail({
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
    }));
  }
  function webSummary() {
    const v = Object.values(PM51.value('safety.protection.web-tool-permissions') || {});
    if (!v.length) return 'Web abilities ask first';
    return v.every(x => x === 'allow') ? 'Web abilities run without asking' : v.every(x => x === 'deny') ? 'Web abilities are blocked' : v.includes('ask') ? 'Web abilities ask first' : 'Some web abilities are blocked';
  }

  /* ---------- Rules ------------------------------------------------------- */
  function renderRules() {
    const R = rules();
    if (R.length && !(PM51.value('safety.rules.rule-editor') || []).length) syncRuleEditor();
    const simple = simpleView();
    const view = PM51.section({ title: 'View', help: simple ? 'Simple shows the safety level and plain answers. Expert adds ordered rules and scopes.' : 'Expert view: ordered rules, scopes and where each rule comes from.',
      body: PM51.bound.rows(['safety.rules.ui-mode'].concat(simple ? [] : ['safety.rules.scoped-overrides', 'safety.rules.scope-selector'])) });
    const list = R.length ? PM51.list(R.map((r, i) => ({
      title: r.action, meta: r.condition, pill: PM51.pill(r.decision, decisionTone(r.decision)), avatar: `<span class="pm51-step-n">${i + 1}</span>`,
      end: PM51.iconBtn({ icon: 'more', label: `More for ${r.action}`, callback: el => PM51.menu(el, [
        { label: 'Move up', icon: 'up', disabled: i === 0, onClick: () => { moveItem(R, i, -1); syncRuleEditor(); refresh(); } },
        { label: 'Move down', icon: 'down', disabled: i === R.length - 1, onClick: () => { moveItem(R, i, 1); syncRuleEditor(); refresh(); } },
        { label: 'Edit', icon: 'edit', onClick: () => ruleDialog(i) },
        { separator: true },
        { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${r.action}”?`, 'The rules after it move up.', 'Delete', () => { R.splice(i, 1); syncRuleEditor(); refresh(); }, true) }
      ], r.action) })
    }))) : PM51.empty('No rules yet', 'Add a rule to decide what the assistant may do on its own.', { label: 'Add rule', action: 'pm51-permissions-rule-add' });
    const ordered = simple
      ? PM51.section({ title: 'Rules', help: `${R.length} ordered rule${R.length === 1 ? '' : 's'} decide the details. Switch the view to Expert to see and change them.`, body: PM51.bound.rows(['safety.rules.default-tool-permission']) })
      : PM51.section({ title: 'Rules, in order', help: 'Checked top to bottom; the last matching rule wins. Allow happens quietly, Ask waits for you, Block always stops it.', action: { label: 'Add rule', icon: 'plus', action: 'pm51-permissions-rule-add' }, body: PM51.home('safety.rules.rule-editor', list) + PM51.bound.rows(['safety.rules.default-tool-permission']) });
    const tools = PM51.section({ title: 'Answers for each tool', help: 'Reading and searching are safe to allow.', body: toolTable('safety.rules.per-tool-permissions', TOOLS) })
      + PM51.section({ title: 'Answers for each web ability', help: 'Ask is safest.', body: toolTable('safety.protection.web-tool-permissions', WEB_TOOLS) });
    const sources = {}; R.forEach(r => { sources[r.source || 'Project rule'] = (sources[r.source || 'Project rule'] || 0) + 1; });
    const advanced = simple ? '' : PM51.advanced([
      PM51.section({ title: 'Rule sources', help: 'Where each rule came from.', body: PM51.kv(Object.entries(sources).map(([k, v]) => [k, `${v} rule${v === 1 ? '' : 's'}`])) }),
      PM51.section({ title: 'Import and export', body: `<div class="pm51-perm-actions">${PM51.btn({ label: 'Export rules', small: true, icon: 'download', action: 'pm51-permissions-rules-export' })}${PM51.btn({ label: 'Import rules', small: true, icon: 'upload', action: 'pm51-permissions-rules-import' })}</div>` })
    ].join(''));
    return view + ordered + tools + advanced;
  }
  PM51.on('permissions-tool', el => {
    const id = ds(el, 'setting'), tool = ds(el, 'tool'), v = ds(el, 'value');
    const next = Object.assign({}, PM51.value(id) || {}, { [tool]: v });
    if (!commitSettingValue(id, next)) return;
    saveState(); o55Notify(id, next);
    el.closest('.pm51-seg')?.querySelectorAll('button').forEach(b => { const on = b.dataset.value === v; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    PM51.toast('Saved', `${el.closest('.pm51-row')?.querySelector('.pm51-row-label')?.textContent || tool}: ${ANSWERS.find(x => x[0] === v)[1]}.`);
  });
  ['safety.rules.ui-mode', 'safety.rules.scoped-overrides', 'safety.rules.permission-preset'].forEach(id => PM51.watch(id, () => PM51.refresh(ID, { swap: false })));

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
    return waiting;
  }

  /* ---------- Limits ------------------------------------------------------ */
  function renderLimits() {
    return '<p class="o55-quiet-line">Safety nets that step in when work loops, keeps failing, or runs too long. They apply whatever the rules say.</p>';
  }

  function render() {
    const tab = PM51.tab(ID, 'profiles');
    const body = tab === 'rules' ? renderRules() : tab === 'protected' ? renderProtected() : tab === 'approvals' ? renderApprovals() : tab === 'limits' ? renderLimits() : renderProfiles();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'How permissions work', action: 'pm51-permissions-help' },
      { label: 'Run permissions check', action: 'pm51-permissions-diagnostics' },
      { label: 'Reset these settings to the defaults', action: 'pm51-permissions-reset' }
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
      syncRuleEditor(); refresh();
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
    const rule = q ? R.slice().reverse().find(r => r.action.toLowerCase().includes(q) || q.includes(r.action.toLowerCase())) : null;
    const current = profiles().find(inUse) || profiles()[0];
    PM51.panel({
      title: 'Why is this allowed?', subtitle: actionText ? `“${actionText}”` : 'No action typed', pill: rule ? PM51.pill(rule.decision, decisionTone(rule.decision)) : PM51.pill('Ask', 'attention'),
      body: PM51.panelSection('Decision path', PM51.steps([
        { title: 'Protected Files', desc: `${paths().length} boundaries checked first`, done: true },
        { title: rule ? `Rule ${R.indexOf(rule) + 1}: ${rule.action}` : 'No matching rule', desc: rule ? `${rule.decision} · ${rule.condition} · the last rule that matches decides` : `Anything without a rule: ${PM51.valueLabel('safety.rules.default-tool-permission', PM51.value('safety.rules.default-tool-permission'))}`, done: true },
        { title: 'Profile', desc: current ? `${current.name} is in use` : 'No profile', done: true },
        { title: 'Result', desc: rule ? `${rule.decision}${rule.decision === 'Ask' ? ' — you are asked before it happens' : rule.decision === 'Deny' ? ' — always blocked' : ' — happens without asking'}` : 'Ask — you are asked before it happens', status: rule ? rule.decision : 'Ask', tone: rule ? decisionTone(rule.decision) : 'attention' }
      ]))
    });
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('permissions-tab', el => { PM51.setTab(ID, ds(el, 'tab')); PM51.refresh(ID); });
  PM51.on('permissions-profile-new', () => editPermissionProfile());
  PM51.on('permissions-profile-edit', el => { const p = profiles().find(x => x.id === ds(el, 'id')); if (p) editPermissionProfile(p); });
  PM51.on('permissions-profile-use', el => { const p = profiles().find(x => x.id === ds(el, 'id')); if (!p) return; profiles().forEach(x => { if (inUse(x)) x.status = 'available'; }); p.status = 'default'; if (commitSettingValue('safety.rules.permission-preset', presetOf(p))) saveState(); refresh(); PM51.toast(`${p.name} is in use`, `Safety level: ${PM51.valueLabel('safety.rules.permission-preset', presetOf(p))}. New actions follow this profile from now on.`); });
  PM51.onInput('permissions-why-input', el => { PM51.s().permWhy = el.value; });
  PM51.on('permissions-why', el => { const input = el.closest('.pm51-perm-why')?.querySelector('input'); explain(input ? input.value : PM51.s().permWhy); });
  PM51.on('permissions-audit-export', () => PM51.toast('Audit report prepared', 'Example data only. A report of profiles, rules, protected paths, and approvals would be saved.', 'info'));
  PM51.on('permissions-diagnostics', () => PM51.check({ title: 'Permissions & Safety diagnostics', steps: [
    { title: 'One profile in use', desc: (profiles().find(inUse) || {}).name || 'None', tone: profiles().some(inUse) ? 'ready' : 'attention', status: profiles().some(inUse) ? 'Checked' : 'Needs attention' },
    { title: 'Rules readable in order', desc: `${rules().length} rules` },
    { title: 'Protected paths resolve', desc: `${paths().length} paths` },
    { title: 'Approval requests reach you', desc: PM51.valueLabel('safety.approvals.alert-channel', PM51.value('safety.approvals.alert-channel')) },
    { title: 'Limits within safe range', desc: `${PM51.value('ai.usage.max-tool-rounds')} steps per agent · ${PM51.valueText(PM51.setting('ai.usage.run-spend-budget'), PM51.value('ai.usage.run-spend-budget'))} per run` }
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
  PM51.on('permissions-reset', () => PM51.confirm('Reset these settings to the defaults?', 'Every setting on these tabs goes back to its default. Profiles, rules and protected paths are kept.', 'Reset', () => {
    Object.values(PM51.placement.byId).filter(e => e.workspace === ID).forEach(e => { try { restoreSettingDefault(e.id); } catch (err) { /* one row never blocks the rest */ } });
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Defaults restored', 'Permissions settings are back to their defaults.');
  }, true));
  PM51.on('permissions-help', () => PM51.panel({
    title: 'How permissions work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A profile is a bundle of rules. Each rule says whether an action happens quietly (Allow), waits for you (Ask), or is always blocked (Deny). Protected Files add extra care for specific folders.</p>')
      + PM51.panelSection('Order', PM51.kv([['1. Protected Files', 'Checked first, always.'], ['2. Rules', 'Checked top to bottom; the last matching rule decides.'], ['3. Approvals', 'Ask rules wait for your answer.'], ['4. Limits', 'Runaway work is paused no matter what the rules say.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Anything without a rule gets the answer set under Rules. When you approve something you can allow it once, for this session, or always.</p>')
  }));
})();
