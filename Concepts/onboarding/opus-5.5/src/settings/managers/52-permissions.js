/* Permissions & Safety — what the assistant may do on its own, and when it must ask.
   One copy of each choice: the manager's own "Expire after", "Remember my choice", "Then", "Parallel tasks", Disk,
   Network and the hard-coded thresholds repeated inventory rows with other values and are gone; the rows are drawn
   in their tabs instead. The profile in use is the inventory's safety level (permission preset); the per-tool answers
   are fixed tables with one line per tool.
   Profiles and rules (Plans/Permissions_System.md §2.4, §9, §10.7): a profile is a named bundle that carries its own
   four plain answers and its own ordered rules (the Persona layer, permission-profiles/<id>.toml); the project's
   rules (.puppet-master/permissions.toml) sit one layer below and apply whichever profile is in use. So every rule
   either belongs to one profile (rule.profile = its id) or to the project (rule.profile = ''); when both cover the
   same action the profile's rule is checked first and wins. A rule can be attached to a profile, moved back to the
   project, or deleted from either place. New profiles are made with a guided set-up (PM51.wizard): start from a
   ready-made level or a copy, the four answers, extra guards, the rules that come with it, a name, and a recap.
   Built-in profiles keep their four answers (they are the preset safety levels); a copy can change them. */
(function () {
  const ID = 'permissions';
  const KEY = 'permissions-filesafe';
  const TABS = [{ id: 'profiles', label: 'Profiles' }, { id: 'rules', label: 'Rules' }, { id: 'protected', label: 'Protected Files' }, { id: 'approvals', label: 'Approvals' }, { id: 'limits', label: 'Limits' }];
  const DECISIONS = ['Allow', 'Ask', 'Deny'];
  const DECISION_WORDS = { Allow: 'Without asking', Ask: 'Asks first', Deny: 'Never' };
  const ACCESS_OPTIONS = ['Read and write', 'Read only', 'Source-control tools only', 'Temporary artifacts only', 'Deny direct read'];
  const RELATION = 'A profile brings its own rules. Rules on the Rules tab belong to this project and apply with every profile; when both cover the same action, the profile’s rule wins.';
  const h = PM51.h, a = PM51.a;

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
  const listSentence = (items, fallback) => items.length ? items.join(', ').replace(/, ([^,]*)$/, ' and $1') : fallback;
  const plural = (n, one) => `${n} ${one}${n === 1 ? '' : 's'}`;
  /* The built-in profiles are the inventory's safety levels; a profile you make yourself counts as Custom. */
  const PRESET_OF = { 'hands-off': 'full', 'review-first': 'regular', 'read-only': 'read_only' };
  const builtIn = p => !!PRESET_OF[p.id];
  const presetOf = p => PRESET_OF[p.id] || p.preset || 'custom';
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
  const simpleView = () => PM51.value('safety.rules.ui-mode') !== 'Expert';

  /* ---------- what a profile may do: four plain answers ------------------------------------------------------------ */
  const ABILITIES = [
    ['files', 'Change files in the project', 'Create, edit and delete files inside this project.', 'file'],
    ['commands', 'Run commands', 'Tests, builds and other programs.', 'terminal'],
    ['network', 'Use the internet', 'Search the web and read pages.', 'globe'],
    ['publish', 'Save, push and publish', 'Save to version history, send changes online, publish releases.', 'branch']
  ];
  const ANS = [['allow', 'Without asking'], ['ask', 'Ask me first'], ['deny', 'Never']];
  const ansWord = v => (ANS.find(x => x[0] === v) || ANS[1])[1];
  const BUILTIN_ABILITIES = {
    'hands-off': { files: 'allow', commands: 'allow', network: 'allow', publish: 'ask' },
    'review-first': { files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' },
    'read-only': { files: 'deny', commands: 'deny', network: 'ask', publish: 'deny' }
  };
  const abilitiesOf = p => Object.assign({ files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' }, BUILTIN_ABILITIES[p.id] || p.abilities || {});
  const PRESETS = [
    { id: 'careful', title: 'Careful', text: 'Reads freely. Asks before it changes, runs or sends anything.', icon: 'shield', abilities: { files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' }, guards: ['secrets', 'dangerous', 'outside', 'install'] },
    { id: 'balanced', title: 'Balanced', text: 'Edits project files on its own. Asks before commands, the internet and publishing.', icon: 'sliders', abilities: { files: 'allow', commands: 'ask', network: 'ask', publish: 'ask' }, guards: ['secrets', 'dangerous', 'outside'] },
    { id: 'handsoff', title: 'Hands-off', text: 'Works on its own inside the project. Still asks before publishing.', icon: 'rocket', abilities: { files: 'allow', commands: 'allow', network: 'allow', publish: 'ask' }, guards: ['secrets', 'dangerous'] }
  ];
  /* extra guards a profile can carry; each one is a rule that travels with it */
  const GUARDS = [
    { id: 'secrets', title: 'Never read secret files', text: '.env files, keys and saved passwords stay closed.', icon: 'lock', rule: { action: 'Read secret files', decision: 'Deny', condition: '.env, .env.*, *.pem and ~/.ssh' } },
    { id: 'dangerous', title: 'Never run dangerous commands', text: 'Commands that wipe files or rewrite history are stopped.', icon: 'alert', rule: { action: 'Run dangerous commands', decision: 'Deny', condition: 'rm -rf, disk wipes and force push' } },
    { id: 'outside', title: 'Ask before going outside the project', text: 'Folders elsewhere on the computer need your OK.', icon: 'folder', rule: { action: 'Change files outside the project', decision: 'Ask', condition: 'Anywhere outside the project folder' } },
    { id: 'install', title: 'Ask before installing anything', text: 'New packages and tools need your OK first.', icon: 'download', rule: { action: 'Install a package or tool', decision: 'Ask', condition: 'Show the package, source and version' } }
  ];

  /* ---------- which rules belong where ---------------------------------------------------------------------------- */
  /* Rules saved before profiles owned rules name their profile in `source`; they are attached to it once. The two
     built-in profiles that had no rules of their own get a few, so every profile shows what it carries. */
  const SEED = {
    'review-first': [{ action: 'Read project files', decision: 'Allow', condition: 'Inside project root' }, { action: 'Run project tests', decision: 'Ask', condition: 'Show the command and folder first' }, { action: 'Send external message', decision: 'Ask', condition: 'Preview recipient and content' }],
    'read-only': [{ action: 'Read project files', decision: 'Allow', condition: 'Inside project root' }, { action: 'Search the web', decision: 'Ask', condition: 'Show the address first' }]
  };
  function ensureAttach() {
    const R = rules(), P = profiles(); if (!Array.isArray(R) || !Array.isArray(P)) return;
    R.forEach(r => { if (r.profile === undefined) { const p = P.find(x => x.name === r.source || x.id === r.source); r.profile = p ? p.id : ''; } });
    const s = PM51.s();
    if (!s.o55PermSeeded) {
      s.o55PermSeeded = true;
      Object.entries(SEED).forEach(([pid, list]) => { const p = P.find(x => x.id === pid); if (p && !R.some(r => r.profile === pid)) list.forEach(r => R.push(Object.assign({ source: p.name, profile: pid }, r))); });
    }
    P.forEach(p => { p.rules = R.filter(r => r.profile === p.id).length; });
  }
  const rulesOf = pid => rules().filter(r => (r.profile || '') === (pid || ''));
  const projectRules = () => rulesOf('');
  const profileName = pid => (profiles().find(p => p.id === pid) || {}).name || 'This project';
  const ruleText = r => `${r.action}: ${String(r.decision).toLowerCase()}${r.condition && r.condition !== 'Always' ? ` (${r.condition})` : ''}${r.profile ? ` [${profileName(r.profile)}]` : ''}`;
  function syncRuleEditor() { if (commitSettingValue('safety.rules.rule-editor', rules().map(ruleText))) saveState(); }
  /* move within the rule's own list (a profile's, or the project's), never past rules of another owner */
  function moveWithin(r, dir) {
    const R = rules(), mine = R.map((x, i) => [x, i]).filter(([x]) => (x.profile || '') === (r.profile || ''));
    const k = mine.findIndex(([x]) => x === r), other = mine[k + dir]; if (!other) return;
    const i = R.indexOf(r), j = other[1]; R[i] = other[0]; R[j] = r;
  }
  /* what a profile asks about or never allows: its answers, its own rules, then the project's rules */
  function profileSummary(p) {
    const ab = abilitiesOf(p), own = rulesOf(p.id), proj = projectRules().filter(r => !own.some(o => o.action.toLowerCase() === r.action.toLowerCase()));
    const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
    const asks = ABILITIES.filter(([k]) => ab[k] === 'ask').map(([, l]) => lower(l)).concat(own.concat(proj).filter(r => r.decision === 'Ask').map(r => lower(r.action)));
    const never = ABILITIES.filter(([k]) => ab[k] === 'deny').map(([, l]) => lower(l)).concat(own.concat(proj).filter(r => r.decision === 'Deny').map(r => lower(r.action)));
    return { asks: [...new Set(asks)], never: [...new Set(never)] };
  }
  function ruleList(list, { profileId }) {
    return PM51.list(list.map((r, i) => ({
      title: r.action, meta: r.condition && r.condition !== 'Always' ? r.condition : 'Always', pill: PM51.pill(DECISION_WORDS[r.decision] || r.decision, decisionTone(r.decision)), avatar: `<span class="pm51-step-n">${i + 1}</span>`,
      end: PM51.iconBtn({ icon: 'more', label: `More for ${r.action}`, callback: el => PM51.menu(el, [
        { label: 'Move up', icon: 'up', disabled: i === 0, onClick: () => { moveWithin(r, -1); syncRuleEditor(); refresh(); } },
        { label: 'Move down', icon: 'down', disabled: i === list.length - 1, onClick: () => { moveWithin(r, 1); syncRuleEditor(); refresh(); } },
        { label: 'Edit', icon: 'edit', onClick: () => ruleDialog(rules().indexOf(r)) },
        profileId ? { label: 'Move to this project’s rules', icon: 'arrowRight', meta: 'Applies with every profile', onClick: () => { r.profile = ''; r.source = 'Project rule'; syncRuleEditor(); refresh(); PM51.toast('Moved to this project', `“${r.action}” now applies whichever profile is in use.`); } }
          : { label: 'Attach to a profile…', icon: 'link', onClick: () => attachPick(el, r) },
        { separator: true },
        { label: profileId ? 'Remove from this profile' : 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(profileId ? `Remove “${r.action}” from ${profileName(profileId)}?` : `Delete “${r.action}”?`, profileId ? 'The rule is deleted. The profile’s four answers and the project’s rules still apply.' : 'The rules after it move up.', profileId ? 'Remove' : 'Delete', () => { const R = rules(), k = R.indexOf(r); if (k >= 0) R.splice(k, 1); syncRuleEditor(); refresh(); }, true) }
      ], r.action) })
    })));
  }
  function attachPick(anchor, r) {
    PM51.pick(anchor, { title: 'Attach to which profile?', search: false, items: profiles().map(p => ({ value: p.id, label: p.name, meta: plural(rulesOf(p.id).length, 'rule') })), onPick: pid => {
      const p = profiles().find(x => x.id === pid); if (!p) return;
      r.profile = p.id; r.source = p.name; syncRuleEditor(); refresh();
      PM51.toast(`Attached to ${p.name}`, `“${r.action}” now travels with ${p.name} and no longer applies with other profiles.`);
    } });
  }

  /* ---------- Profiles ---------------------------------------------------- */
  function renderProfiles() {
    ensureAttach(); syncFromPreset();
    const P = profiles();
    const line = `<p class="o55-quiet-line o55-perm-relation">${h(RELATION)}</p>`;
    if (!P.length) return line + PM51.section({ title: 'Profiles', body: PM51.empty('No profiles yet', 'A profile bundles what the assistant may do, and its own rules, into one choice.', { label: 'New profile', action: 'pm51-permissions-profile-new' }) });
    const current = P.find(inUse) || P[0];
    const selId = PM51.sel(ID, current.id);
    const p = P.find(x => x.id === selId) || current;
    const items = P.map(x => ({ id: x.id, title: x.name, meta: `${plural(rulesOf(x.id).length, 'rule')} · ${scopeWord(x.scope)}`, tone: inUse(x) ? 'ready' : 'neutral', selected: x.id === p.id }));
    const ab = abilitiesOf(p), fixed = builtIn(p), sum = profileSummary(p), own = rulesOf(p.id), proj = projectRules();
    const answers = PM51.section({ title: 'What it may do without asking', help: fixed ? 'Built-in profiles keep these answers. Make a copy to change them.' : 'One answer for each kind of action.', cls: 'o55-perm-answers',
      body: PM51.rows(ABILITIES.map(([k, label, help]) => fixed
        ? { label, help, value: ansWord(ab[k]) }
        : { label, help, cls: 'o55-perm-stack', control: PM51.segmented(ab[k], ANS, { action: 'pm51-permissions-ability', data: { id: p.id, key: k }, label }) })) });
    const ownRules = PM51.section({ title: `Rules in ${p.name}`, help: 'They come with this profile. Checked first, top to bottom; the last match wins.',
      action: { label: 'Add rule', icon: 'plus', small: true, action: 'pm51-permissions-rule-add', data: { profile: p.id } },
      body: (own.length ? ruleList(own, { profileId: p.id }) : PM51.note('No rules of its own yet. Its four answers above decide.', 'info'))
        + `<div class="pm51-perm-actions o55-perm-attach">${PM51.btn({ label: 'Attach a rule from this project', small: true, icon: 'link', action: 'pm51-permissions-attach', data: { profile: p.id }, disabled: !proj.length, reason: 'This project has no rules of its own to attach.' })}</div>` });
    const also = PM51.section({ title: 'Also applies', body: PM51.rows([
      { label: 'This project’s rules', help: 'Checked after the profile’s own rules, whichever profile is in use.', value: plural(proj.length, 'rule'), action: { label: 'See rules', icon: 'arrowRight', action: 'pm51-permissions-tab', data: { tab: 'rules' } } },
      { label: 'Protected files', help: 'Always checked first, whatever the profile says.', value: `${paths().filter(f => f.status !== 'disabled').length} protected`, action: { label: 'See files', icon: 'arrowRight', action: 'pm51-permissions-tab', data: { tab: 'protected' } } }
    ]) });
    const body = PM51.section({ title: 'In short', body: PM51.rows([
      { label: 'Summary', value: p.description || 'Your own profile' },
      { label: 'Safety level', help: 'Built-in profiles are the preset levels; your own count as Custom.', value: PM51.valueLabel('safety.rules.permission-preset', presetOf(p)) },
      { label: 'Applies', help: 'This project, only until you close the app, or every project.', value: scopeWord(p.scope) },
      { label: 'Asks before', value: cap1(listSentence(sum.asks, 'nothing extra')) },
      { label: 'Never allows', value: cap1(listSentence(sum.never, 'nothing is fully blocked')) }
    ]) });
    const netRow = PM51.value('web.fetch.air-gap-mode') === true ? ['Network', 'Blocked: working offline', 'Web & Research'] : ['Network', ab.network === 'deny' ? 'Blocked by the profile' : webSummary(), ab.network === 'deny' ? 'Profile answer' : 'Answers for each web ability'];
    const effective = `<table class="pm51-perm-table"><thead><tr><th>Resource</th><th>Right now</th><th>Because of</th></tr></thead><tbody>${[
      ['Project files', ab.files === 'allow' ? 'Read and write inside the project' : ab.files === 'ask' ? 'Read freely; changes ask first' : 'Read only', `${current.name} profile`],
      ['Protected paths', `${paths().length} boundaries applied`, 'Protected Files'],
      ['Commands', PM51.value('safety.protection.bash-guard') === false || PM51.value('safety.protection.bash-guard') === 'off' ? 'Dangerous commands are not blocked' : ab.commands === 'deny' ? 'No commands' : 'Dangerous commands are blocked; others ' + (ab.commands === 'allow' ? 'run freely' : 'ask first'), 'Dangerous commands'],
      netRow,
      ['Version history', 'Force push blocked on protected branches', 'Project rule']
    ].map(r => `<tr><td>${h(r[0])}</td><td>${h(r[1])}</td><td>${h(r[2])}</td></tr>`).join('')}</tbody></table>`;
    const advanced = PM51.advanced([
      PM51.section({ title: 'Effective access now', help: `With ${current.name} in use.`, body: effective }),
      PM51.section({ title: 'Why is this allowed?', help: 'Type an action to see which rule decides it.', body: `<div class="pm51-perm-why">${PM51.input(PM51.s().permWhy || '', { action: 'pm51-permissions-why-input', placeholder: 'e.g. Write project files', label: 'Action to explain' })}${PM51.btn({ label: 'Explain', small: true, icon: 'search', action: 'pm51-permissions-why' })}</div>` }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Profiles', String(P.length)], ['Rules in profiles', String(rules().filter(r => r.profile).length)], ['Rules for this project', String(proj.length)], ['Protected paths', String(paths().length)], ['Order of evaluation', 'Protected Files, then the profile’s rules, then this project’s rules, then approvals, then limits'], ['Saved in', builtIn(p) ? 'Built in' : `permission-profiles/${p.id}.toml`]]) + `<div class="pm51-perm-actions" style="margin-top:10px">${PM51.btn({ label: 'Export audit report', small: true, icon: 'download', action: 'pm51-permissions-audit-export' })}</div>` })
    ].join(''));
    return line + PM51.home('safety.rules.permission-preset', PM51.listDetail({
      id: ID, rosterTitle: 'Profiles', count: P.length,
      add: { action: 'pm51-permissions-profile-new', label: 'New profile' },
      items,
      detail: {
        title: p.name, subtitle: `${fixed ? 'Built in' : 'Your own'} · ${scopeWord(p.scope)}`, pill: PM51.pill(inUse(p) ? 'In use' : 'Available', inUse(p) ? 'ready' : 'off'),
        primary: inUse(p) ? (fixed ? { label: 'Make a copy', icon: 'copy', action: 'pm51-permissions-profile-copy', data: { id: p.id } } : { label: 'Edit', icon: 'edit', action: 'pm51-permissions-profile-edit', data: { id: p.id } }) : { label: 'Use this profile', icon: 'check', action: 'pm51-permissions-profile-use', data: { id: p.id } },
        menu: anchor => PM51.menu(anchor, [
          fixed ? { label: 'Make a copy to change it', icon: 'copy', onClick: () => profileWizard(null, { copyOf: p.id }) } : { label: 'Edit', icon: 'edit', onClick: () => profileWizard(p) },
          { label: 'Duplicate', icon: 'copy', meta: 'With its rules', onClick: () => duplicate(p) },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, disabled: inUse(p) || fixed, meta: inUse(p) ? 'In use' : fixed ? 'Built in' : '', onClick: () => PM51.confirm(`Delete ${p.name}?`, own.length ? `Its ${plural(own.length, 'rule')} ${own.length === 1 ? 'goes' : 'go'} with it. This project’s rules are kept.` : 'This project’s rules are kept.', 'Delete', () => { state.permissionProfiles = P.filter(x => x.id !== p.id); state.permissionRules = rules().filter(r => r.profile !== p.id); PM51.setSel(ID, (state.permissionProfiles.find(inUse) || state.permissionProfiles[0] || {}).id || ''); syncRuleEditor(); refresh(); }, true) }
        ], p.name),
        body: answers + ownRules + also + body + advanced
      }
    }));
  }
  const scopeWord = s => s === 'Session' ? 'Until you close the app' : s === 'User' ? 'Every project' : 'This project';
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  function duplicate(p) {
    const c = clone(p); c.id = uid('permission', `${p.name}-copy`); c.name = `${p.name} copy`; c.status = 'available'; c.abilities = abilitiesOf(p); c.preset = 'custom';
    profiles().push(c);
    rulesOf(p.id).forEach(r => rules().push(Object.assign(clone(r), { profile: c.id, source: c.name })));
    PM51.setSel(ID, c.id); syncRuleEditor(); refresh();
    PM51.toast(`${c.name} made`, 'A copy with the same answers and rules. You can change it freely.');
  }
  function webSummary() {
    const v = Object.values(PM51.value('safety.protection.web-tool-permissions') || {});
    if (!v.length) return 'Web abilities ask first';
    return v.every(x => x === 'allow') ? 'Web abilities run without asking' : v.every(x => x === 'deny') ? 'Web abilities are blocked' : v.includes('ask') ? 'Web abilities ask first' : 'Some web abilities are blocked';
  }

  /* ---------- Rules ------------------------------------------------------- */
  function renderRules() {
    ensureAttach();
    const R = projectRules(), current = profiles().find(inUse) || profiles()[0];
    if (rules().length && !(PM51.value('safety.rules.rule-editor') || []).length) syncRuleEditor();
    const simple = simpleView();
    const line = `<p class="o55-quiet-line o55-perm-relation">${h(RELATION)}</p>`;
    const view = PM51.section({ title: 'View', help: simple ? 'Simple shows the safety level and plain answers. Expert adds ordered rules and scopes.' : 'Expert view: ordered rules, scopes and where each rule comes from.',
      body: PM51.bound.rows(['safety.rules.ui-mode'].concat(simple ? [] : ['safety.rules.scoped-overrides', 'safety.rules.scope-selector'])) });
    const list = R.length ? ruleList(R, { profileId: '' }) : PM51.empty('No rules for this project yet', 'Add a rule that should apply whichever profile is in use.', { label: 'Add rule', action: 'pm51-permissions-rule-add' });
    const fromProfile = current ? PM51.section({ title: `From ${current.name}`, help: 'The profile in use brings these, and they are checked first. Change them on its profile.',
      action: { label: 'Open profile', icon: 'arrowRight', small: true, action: 'pm51-permissions-open-profile', data: { id: current.id } },
      body: rulesOf(current.id).length ? PM51.kv(rulesOf(current.id).map(r => [r.action, `${DECISION_WORDS[r.decision] || r.decision}${r.condition && r.condition !== 'Always' ? ' · ' + r.condition : ''}`])) : PM51.note(`${current.name} has no rules of its own; its four answers decide.`, 'info') }) : '';
    const ordered = simple
      ? PM51.section({ title: 'Rules', help: `${plural(R.length, 'rule')} for this project and ${plural(current ? rulesOf(current.id).length : 0, 'rule')} in ${current ? current.name : 'the profile'} decide the details. Switch the view to Expert to see and change them.`, body: PM51.bound.rows(['safety.rules.default-tool-permission']) })
      : PM51.section({ title: 'Rules for this project', help: 'They apply with every profile, after the profile’s own rules. Checked top to bottom; the last match wins.', action: { label: 'Add rule', icon: 'plus', action: 'pm51-permissions-rule-add' }, body: PM51.home('safety.rules.rule-editor', list) + PM51.bound.rows(['safety.rules.default-tool-permission']) }) + fromProfile;
    const tools = PM51.section({ title: 'Answers for each tool', help: 'Reading and searching are safe to allow.', body: toolTable('safety.rules.per-tool-permissions', TOOLS) })
      + PM51.section({ title: 'Answers for each web ability', help: 'Ask is safest.', body: toolTable('safety.protection.web-tool-permissions', WEB_TOOLS) });
    const sources = {}; rules().forEach(r => { const k = r.profile ? `Profile: ${profileName(r.profile)}` : (r.source && r.source !== 'Project rule' ? `Project: ${r.source}` : 'Project rule'); sources[k] = (sources[k] || 0) + 1; });
    const advanced = simple ? '' : PM51.advanced([
      PM51.section({ title: 'Rule sources', help: 'Where each rule came from.', body: PM51.kv(Object.entries(sources).map(([k, v]) => [k, plural(v, 'rule')])) }),
      PM51.section({ title: 'Import and export', body: `<div class="pm51-perm-actions">${PM51.btn({ label: 'Export rules', small: true, icon: 'download', action: 'pm51-permissions-rules-export' })}${PM51.btn({ label: 'Import rules', small: true, icon: 'upload', action: 'pm51-permissions-rules-import' })}</div>` })
    ].join(''));
    return line + view + ordered + tools + advanced;
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
    const protectedSection = PM51.section({ title: 'Protected paths', help: 'Folders and files with their own access rules. They apply with every profile.', action: { label: 'Add path', icon: 'plus', action: 'pm51-permissions-path-add' }, body: list });
    const check = PM51.section({ title: 'Check a path', help: 'See what the assistant may do with a file or folder.', body: `<div class="pm51-perm-check">${PM51.input(PM51.s().permCheckPath || '', { action: 'pm51-permissions-check-input', placeholder: '${projectRoot}/src/main.rs', label: 'Path to check' })}${PM51.btn({ label: 'Check path', small: true, icon: 'test', action: 'pm51-permissions-check' })}</div>` });
    const advanced = PM51.advanced(PM51.section({ title: 'Inheritance details', help: 'A path takes the rule of the closest protected folder above it.', body: PM51.kv(F.map(f => [f.path, `${f.inheritance} · ${f.access}`])) }));
    return protectedSection + check + advanced;
  }

  /* ---------- Approvals --------------------------------------------------- */
  function renderApprovals() {
    const A = pm().approvals.filter(x => x.status === 'Waiting');
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

  /* ---------- new profile, step by step ----------------------------------------------------------------------------- */
  const guardById = id => GUARDS.find(g => g.id === id);
  /* the rules the new profile will carry: what it was copied from, the guards, then the ones typed in */
  function draftRules(d) {
    const out = [];
    (d.base || []).forEach((r, i) => out.push(Object.assign({ key: 'b' + i, from: d.baseName ? `From ${d.baseName}` : 'Copied' }, r)));
    (d.guards || []).forEach(g => { const G = guardById(g); if (G && !out.some(r => r.action.toLowerCase() === G.rule.action.toLowerCase())) out.push(Object.assign({ key: 'g:' + g, from: 'Protection you chose' }, G.rule)); });
    (d.mine || []).forEach((r, i) => out.push(Object.assign({ key: 'm' + i, from: 'Added here' }, r)));
    return out;
  }
  const keptRules = d => draftRules(d).filter(r => !(d.off || []).includes(r.key));
  function startFrom(d, key) {
    d.start = key;
    if (key.startsWith('preset:')) { const P = PRESETS.find(x => 'preset:' + x.id === key); d.abilities = Object.assign({}, P.abilities); d.guards = P.guards.slice(); d.base = []; d.baseName = P.title; d.description = P.text; }
    else if (key.startsWith('copy:')) { const p = profiles().find(x => 'copy:' + x.id === key); if (!p) return; d.abilities = abilitiesOf(p); d.guards = []; d.base = rulesOf(p.id).map(r => ({ action: r.action, decision: r.decision, condition: r.condition })); d.baseName = p.name; d.description = p.description || ''; if (!d.nameTouched) d.name = `${p.name} copy`; }
    else { d.abilities = { files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' }; d.guards = []; d.base = []; d.baseName = ''; d.description = ''; }
    d.off = [];
  }
  function abilityRows(d) {
    return PM51.rows(ABILITIES.map(([k, label, help]) => ({ label, help, control: PM51.segmented(d.abilities[k], ANS, { action: 'pm51-permissions-w-ability', data: { key: k }, label }) })), { cls: 'o55-perm-wrows' });
  }
  function guardsStep(d) {
    const F = paths().filter(f => f.status !== 'disabled');
    return PM51.tiles(GUARDS.map(g => ({ title: g.title, text: g.text, icon: g.icon, selected: (d.guards || []).includes(g.id), data: { guard: g.id } })), { action: 'pm51-permissions-w-guard', multi: true })
      + PM51.panelSection('Protected folders for every profile', PM51.kv(F.map(f => [f.path, f.access])), 'Checked before any profile’s answers. Change them under Protected Files.', { icon: 'lock' })
      + `<div class="o55-setup-fields">${PM51.field('Keep another folder read-only (optional)', `<input class="text-control o55-pw-path o55-setup-mono" value="${a(d.extraPath || '')}" placeholder="\${projectRoot}/secrets" autocomplete="off" spellcheck="false"/>`, 'Added to Protected Files, so it holds for every profile.')}</div>`;
  }
  function rulesStep(d) {
    const list = draftRules(d), off = d.off || [];
    const rows = list.length ? PM51.rows(list.map(r => ({ label: r.action, help: `${DECISION_WORDS[r.decision] || r.decision}${r.condition && r.condition !== 'Always' ? ' · ' + r.condition : ''} · ${r.from}`, control: PM51.toggle(!off.includes(r.key), { action: 'pm51-permissions-w-rule', data: { key: r.key }, label: `Keep ${r.action}` }) })), { cls: 'o55-perm-wrows' }) : PM51.note('No rules yet. Its four answers decide; add one below if you like.', 'info');
    const add = `<div class="o55-perm-addrule">${PM51.field('Another rule (optional)', `<input class="text-control o55-pw-ruleact" placeholder="e.g. Delete a branch" autocomplete="off"/>`)}${PM51.field('Answer', PM51.select('Ask', DECISIONS.map(x => [x, DECISION_WORDS[x]]), { cls: 'o55-pw-ruledec', label: 'Answer' }))}${PM51.btn({ label: 'Add', small: true, icon: 'plus', action: 'pm51-permissions-w-addrule' })}</div>`;
    return rows + add + PM51.note(`This project’s ${plural(projectRules().length, 'rule')} also apply with every profile; they stay on the Rules tab.`, 'info');
  }
  function recapStep(d) {
    const ab = d.abilities, by = v => ABILITIES.filter(([k]) => ab[k] === v).map(([, l]) => l.toLowerCase());
    const kept = keptRules(d);
    return PM51.panelSection(d.name || 'New profile', PM51.kv([
      ['Starts from', d.baseName || 'Nothing (empty)'],
      ['Without asking', cap1(listSentence(by('allow'), 'nothing'))],
      ['Asks first', cap1(listSentence(by('ask'), 'nothing'))],
      ['Never', cap1(listSentence(by('deny'), 'nothing'))],
      ['Its rules', kept.length ? kept.map(r => r.action).join(', ') : 'None; its answers decide'],
      ['Also protects', d.extraPath ? `${d.extraPath} (read only, every profile)` : 'Only what Protected Files already has'],
      ['Applies', scopeWord(d.scope)]
    ]), '', { icon: 'shield' })
      + (d.editing ? '' : PM51.rows([{ label: 'Use it now', help: 'Off saves it for later; pick it under Profiles any time.', control: PM51.toggle(!!d.useNow, { action: 'pm51-permissions-w-usenow', label: 'Use it now' }) }]));
  }
  function profileWizard(p, { copyOf } = {}) {
    const editing = !!p;
    const draft = editing
      ? { editing: p.id, abilities: abilitiesOf(p), guards: [], base: rulesOf(p.id).map(r => ({ action: r.action, decision: r.decision, condition: r.condition })), baseName: p.name, off: [], mine: [], name: p.name, description: p.description || '', scope: p.scope || 'Project', nameTouched: true }
      : { start: null, abilities: { files: 'ask', commands: 'ask', network: 'ask', publish: 'ask' }, guards: [], base: [], off: [], mine: [], name: '', description: '', scope: 'Project', useNow: false };
    if (copyOf) startFrom(draft, 'copy:' + copyOf);
    const starts = PRESETS.map(x => ({ title: x.title, text: x.text, icon: x.icon, meta: 'Ready-made', key: 'preset:' + x.id }))
      .concat(profiles().map(x => ({ title: `Copy ${x.name}`, text: x.description || 'Your own profile', icon: 'copy', meta: `${plural(rulesOf(x.id).length, 'rule')} come with it`, key: 'copy:' + x.id })))
      .concat([{ title: 'Start empty', text: 'Every answer is Ask me first, and no rules.', icon: 'plus', meta: 'Build it yourself', key: 'empty' }]);
    const steps = [];
    if (!editing && !copyOf) steps.push({ label: 'Start', icon: 'layers', title: 'Where should the new profile start?', lead: 'Pick a ready-made level, or copy a profile you already have. You can change everything next.',
      render: d => PM51.tiles(starts.map(s => ({ title: s.title, text: s.text, icon: s.icon, meta: s.meta, selected: d.start === s.key, data: { start: s.key } })), { action: 'pm51-permissions-w-start' }),
      check: d => d.start ? '' : 'Pick where to start.' });
    steps.push({ label: 'Freedom', icon: 'sliders', title: 'What may it do without asking?', lead: 'One answer for each kind of action. Ask me first is the safe middle.', render: abilityRows,
      recap: d => { const n = ABILITIES.filter(([k]) => d.abilities[k] === 'allow').length; return n ? `${n} of 4 on its own` : 'Asks for everything'; } });
    steps.push({ label: 'Protection', icon: 'lock', title: 'What should always stay safe?', lead: 'Extra guards this profile carries as rules. The protected folders below apply to every profile anyway.', render: guardsStep,
      collect: (w, d) => { const x = w.querySelector('.o55-pw-path'); if (x) d.extraPath = String(x.value || '').trim(); },
      check: d => d.extraPath && !/^(\$\{projectRoot\}|~|\/)/.test(d.extraPath) ? 'Start the folder with ${projectRoot}, ~ or /.' : '',
      recap: d => (d.guards || []).length ? plural(d.guards.length, 'guard') : 'No extra guards' });
    steps.push({ label: 'Rules', icon: 'list', title: 'Which rules come with it?', lead: 'These rules travel with the profile and are checked before this project’s rules. Switch one off to leave it out.', render: rulesStep,
      recap: d => plural(keptRules(d).length, 'rule') });
    steps.push({ label: 'Name', icon: 'edit', title: 'What should it be called?', lead: 'A name you will recognise when you switch profiles.',
      render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-pw-name" value="${a(d.name)}" placeholder="e.g. Weekend experiments" autocomplete="off"/>`)}${PM51.field('In one line', `<input class="text-control o55-pw-desc" value="${a(d.description)}" placeholder="What it is for" autocomplete="off"/>`)}${PM51.field('Where it applies', PM51.select(d.scope, [['Project', 'This project'], ['Session', 'Only until I close the app'], ['User', 'Every project']], { cls: 'o55-pw-scope', label: 'Where it applies' }))}</div>`,
      collect: (w, d) => { const n = w.querySelector('.o55-pw-name'), ds_ = w.querySelector('.o55-pw-desc'), sc = w.querySelector('.o55-pw-scope'); if (n) { d.name = String(n.value || '').trim(); d.nameTouched = true; } if (ds_) d.description = String(ds_.value || '').trim(); if (sc) d.scope = sc.value; },
      check: d => !d.name ? 'Give it a name.' : profiles().some(x => x.id !== d.editing && x.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a profile called ${d.name}.` : '',
      recap: d => d.name });
    steps.push({ label: 'Recap', icon: 'check', title: d => editing ? `Save ${d.name}?` : `Ready to add ${d.name}?`, lead: 'Check it over. Everything can be changed later on its profile page.', render: recapStep,
      collect: (w, d) => { const t = w.querySelector('[data-action="pm51-permissions-w-usenow"]'); if (t) d.useNow = t.classList.contains('on'); } });
    PM51.wizard({
      title: editing ? `Edit ${p.name}` : 'New permission profile', subtitle: 'A profile is what the assistant may do on its own, plus the rules that come with it.', eyebrow: 'Permission profile', icon: 'shield',
      steps, draft, finishLabel: editing ? 'Save profile' : 'Create profile',
      onFinish: d => {
        const kept = keptRules(d);
        let target = editing ? profiles().find(x => x.id === d.editing) : null;
        if (!target) { target = { id: uid('permission', d.name), status: 'available', preset: 'custom' }; profiles().push(target); }
        Object.assign(target, { name: d.name, description: d.description || 'Your own profile', scope: d.scope, abilities: Object.assign({}, d.abilities) });
        if (editing) state.permissionRules = rules().filter(r => r.profile !== target.id);
        kept.forEach(r => rules().push({ action: r.action, decision: r.decision, condition: r.condition || 'Always', source: target.name, profile: target.id }));
        if (d.extraPath && !paths().some(f => f.path === d.extraPath)) paths().push({ path: d.extraPath, access: 'Read only', inheritance: 'This folder and everything inside', status: 'active' });
        if (d.useNow && !editing) { profiles().forEach(x => { if (inUse(x)) x.status = 'available'; }); target.status = 'default'; commitSettingValue('safety.rules.permission-preset', presetOf(target)); }
        PM51.setSel(ID, target.id); PM51.setTab(ID, 'profiles'); ensureAttach(); syncRuleEditor(); refresh();
        PM51.toast(editing ? `${target.name} saved` : `${target.name} added`, `${plural(kept.length, 'rule')} ${kept.length === 1 ? 'comes' : 'come'} with it.${d.useNow && !editing ? ' It is in use now.' : ' Pick it under Profiles when you want it.'}`);
      }
    });
  }
  PM51.on('permissions-w-start', el => { const w = PM51.wizardOf(el); if (!w) return; startFrom(w.draft, ds(el, 'start')); w.next(); });
  PM51.on('permissions-w-ability', el => {
    const w = PM51.wizardOf(el); if (!w) return; const k = ds(el, 'key'), v = ds(el, 'value'); w.draft.abilities[k] = v;
    el.closest('.pm51-seg')?.querySelectorAll('button').forEach(b => { const on = b.dataset.value === v; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  });
  PM51.on('permissions-w-guard', el => { const w = PM51.wizardOf(el); if (!w) return; const g = ds(el, 'guard'), G = new Set(w.draft.guards || []); G.has(g) ? G.delete(g) : G.add(g); w.draft.guards = [...G]; const on = G.has(g); el.classList.toggle('is-on', on); el.setAttribute('aria-checked', String(on)); });
  PM51.on('permissions-w-rule', el => { const w = PM51.wizardOf(el); if (!w) return; const k = ds(el, 'key'), off = new Set(w.draft.off || []); off.has(k) ? off.delete(k) : off.add(k); w.draft.off = [...off]; const on = !off.has(k); el.classList.toggle('on', on); el.setAttribute('aria-checked', String(on)); });
  PM51.on('permissions-w-usenow', el => { const on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-checked', String(on)); const w = PM51.wizardOf(el); if (w) w.draft.useNow = on; });
  PM51.on('permissions-w-addrule', el => {
    const w = PM51.wizardOf(el); if (!w) return; const box = el.closest('.o55-perm-addrule'); const act = String((box.querySelector('.o55-pw-ruleact') || {}).value || '').trim(), dec = (box.querySelector('.o55-pw-ruledec') || {}).value || 'Ask';
    if (!act) { PM51.toast('Say what the rule is about', 'For example: Delete a branch.', 'info'); return; }
    w.draft.mine = (w.draft.mine || []).concat([{ action: act, decision: DECISIONS.includes(dec) ? dec : 'Ask', condition: 'Always' }]); w.go(w.step());
  });

  /* ---------- dialogs & panels -------------------------------------------- */
  function ruleDialog(index, forProfile) {
    const R = rules(), r = index >= 0 ? R[index] : null;
    const owner = r ? (r.profile || '') : (forProfile || '');
    openDialog({ title: r ? 'Edit rule' : owner ? `Add a rule to ${profileName(owner)}` : 'Add a rule for this project', subtitle: 'Say what the action is, what should happen, and when the rule applies.', body: PM51.form([
      { label: 'Action', name: 'action', value: r ? r.action : '', placeholder: 'e.g. Send external message', autofocus: true, full: true },
      { label: 'Decision', name: 'decision', value: r ? r.decision : 'Ask', type: 'select', choices: DECISIONS.map(x => ({ value: x, label: DECISION_WORDS[x] })) },
      { label: 'Belongs to', name: 'owner', value: owner, type: 'select', choices: [{ value: '', label: 'This project (every profile)' }].concat(profiles().map(p => ({ value: p.id, label: `${p.name} (only this profile)` }))), help: 'A profile’s rules go with it; this project’s rules apply whichever profile is in use.' },
      { label: 'Condition', name: 'condition', value: r ? r.condition : '', placeholder: 'e.g. Only inside the project', full: true, help: 'Leave empty to apply always.' }
    ]), saveLabel: r ? 'Save' : 'Add rule', onSave: data => {
      const action = String(data.action || '').trim(); if (!action) { PM51.toast('Name the action', 'Say what the rule is about.', 'warning'); return false; }
      const pid = profiles().some(p => p.id === data.owner) ? data.owner : '';
      const next = { action, decision: DECISIONS.includes(data.decision) ? data.decision : 'Ask', condition: String(data.condition || '').trim() || 'Always', profile: pid, source: pid ? profileName(pid) : (r && !r.profile ? r.source : 'Project rule') };
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
  /* The profile in use is checked first (its rules, last match wins), then this project's rules. */
  function explain(actionText) {
    ensureAttach();
    const q = String(actionText || '').trim().toLowerCase();
    const current = profiles().find(inUse) || profiles()[0];
    const match = list => q ? list.slice().reverse().find(r => r.action.toLowerCase().includes(q) || q.includes(r.action.toLowerCase())) : null;
    const fromProfile = current ? match(rulesOf(current.id)) : null, fromProject = fromProfile ? null : match(projectRules());
    const rule = fromProfile || fromProject;
    const where = fromProfile ? `${current.name}’s rule` : fromProject ? 'This project’s rule' : '';
    PM51.panel({
      title: 'Why is this allowed?', subtitle: actionText ? `“${actionText}”` : 'No action typed', pill: rule ? PM51.pill(DECISION_WORDS[rule.decision] || rule.decision, decisionTone(rule.decision)) : PM51.pill('Asks first', 'attention'),
      body: PM51.panelSection('Decision path', PM51.steps([
        { title: 'Protected Files', desc: `${paths().length} boundaries checked first`, done: true },
        { title: fromProfile ? `${where}: ${fromProfile.action}` : `No rule in ${current ? current.name : 'the profile'}`, desc: fromProfile ? `${fromProfile.decision} · ${fromProfile.condition}` : 'The profile’s own rules are checked first', done: true },
        { title: fromProject ? `${where}: ${fromProject.action}` : fromProfile ? 'This project’s rules' : 'No rule for this project', desc: fromProject ? `${fromProject.decision} · ${fromProject.condition}` : fromProfile ? 'Not reached; the profile already decided' : `Anything without a rule: ${PM51.valueLabel('safety.rules.default-tool-permission', PM51.value('safety.rules.default-tool-permission'))}`, done: true },
        { title: 'Result', desc: rule ? `${rule.decision}${rule.decision === 'Ask' ? ' — you are asked before it happens' : rule.decision === 'Deny' ? ' — always blocked' : ' — happens without asking'}` : 'Ask — you are asked before it happens', status: rule ? rule.decision : 'Ask', tone: rule ? decisionTone(rule.decision) : 'attention' }
      ]))
    });
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('permissions-tab', el => { PM51.setTab(ID, ds(el, 'tab')); PM51.refresh(ID); });
  PM51.on('permissions-open-profile', el => { PM51.setSel(ID, ds(el, 'id')); PM51.setTab(ID, 'profiles'); PM51.refresh(ID); });
  PM51.on('permissions-profile-new', () => profileWizard(null));
  PM51.on('permissions-profile-copy', el => profileWizard(null, { copyOf: ds(el, 'id') }));
  PM51.on('permissions-profile-edit', el => { const p = profiles().find(x => x.id === ds(el, 'id')); if (!p) return; if (builtIn(p)) profileWizard(null, { copyOf: p.id }); else profileWizard(p); });
  PM51.on('permissions-profile-use', el => { const p = profiles().find(x => x.id === ds(el, 'id')); if (!p) return; profiles().forEach(x => { if (inUse(x)) x.status = 'available'; }); p.status = 'default'; if (commitSettingValue('safety.rules.permission-preset', presetOf(p))) saveState(); refresh(); PM51.toast(`${p.name} is in use`, `Safety level: ${PM51.valueLabel('safety.rules.permission-preset', presetOf(p))}. Its ${plural(rulesOf(p.id).length, 'rule')} now apply, before this project’s rules.`); });
  PM51.on('permissions-ability', el => {
    const p = profiles().find(x => x.id === ds(el, 'id')); if (!p || builtIn(p)) return;
    p.abilities = Object.assign(abilitiesOf(p), { [ds(el, 'key')]: ds(el, 'value') }); saveState();
    el.closest('.pm51-seg')?.querySelectorAll('button').forEach(b => { const on = b.dataset.value === ds(el, 'value'); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    PM51.toast('Saved', `${p.name} · ${(ABILITIES.find(x => x[0] === ds(el, 'key')) || [, ''])[1]}: ${ansWord(ds(el, 'value'))}.`);
  });
  PM51.on('permissions-attach', el => {
    const p = profiles().find(x => x.id === ds(el, 'profile')); const proj = projectRules(); if (!p || !proj.length) return;
    PM51.pick(el, { title: `Attach to ${p.name}`, search: proj.length > 6, items: proj.map((r, i) => ({ value: String(rules().indexOf(r)), label: r.action, meta: DECISION_WORDS[r.decision] || r.decision })), onPick: v => {
      const r = rules()[Number(v)]; if (!r) return; r.profile = p.id; r.source = p.name; syncRuleEditor(); refresh();
      PM51.toast(`Attached to ${p.name}`, `“${r.action}” now travels with ${p.name} and no longer applies with other profiles.`);
    } });
  });
  PM51.onInput('permissions-why-input', el => { PM51.s().permWhy = el.value; });
  PM51.on('permissions-why', el => { const input = el.closest('.pm51-perm-why')?.querySelector('input'); explain(input ? input.value : PM51.s().permWhy); });
  PM51.on('permissions-audit-export', () => PM51.toast('Audit report prepared', 'Example data only. A report of profiles, rules, protected paths, and approvals would be saved.', 'info'));
  PM51.on('permissions-diagnostics', () => PM51.check({ title: 'Permissions & Safety diagnostics', steps: [
    { title: 'One profile in use', desc: (profiles().find(inUse) || {}).name || 'None', tone: profiles().some(inUse) ? 'ready' : 'attention', status: profiles().some(inUse) ? 'Checked' : 'Needs attention' },
    { title: 'Every rule has an owner', desc: `${rules().filter(r => r.profile).length} in profiles · ${projectRules().length} for this project` },
    { title: 'Protected paths resolve', desc: `${paths().length} paths` },
    { title: 'Approval requests reach you', desc: PM51.valueLabel('safety.approvals.alert-channel', PM51.value('safety.approvals.alert-channel')) },
    { title: 'Limits within safe range', desc: `${PM51.value('ai.usage.max-tool-rounds')} steps per agent · ${PM51.valueText(PM51.setting('ai.usage.run-spend-budget'), PM51.value('ai.usage.run-spend-budget'))} per run` }
  ] }));
  PM51.on('permissions-rule-add', el => ruleDialog(-1, ds(el, 'profile')));
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
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A profile says what the assistant may do on its own: four plain answers (files, commands, the internet, publishing) and its own rules. Each rule says whether an action happens quietly (Allow), waits for you (Ask), or is always blocked (Deny). Protected Files add extra care for specific folders.</p>')
      + PM51.panelSection('Profiles and rules', `<p class="pm51-ps-text">${h(RELATION)} Attach a project rule to a profile to make it travel with that profile only.</p>`)
      + PM51.panelSection('Order', PM51.kv([['1. Protected Files', 'Checked first, always.'], ['2. The profile’s rules', 'The profile in use; the last matching rule decides.'], ['3. This project’s rules', 'Only when the profile has no rule for the action.'], ['4. Approvals', 'Ask answers wait for you.'], ['5. Limits', 'Runaway work is paused no matter what the rules say.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Anything without a rule gets the answer set under Rules. When you approve something you can allow it once, for this session, or always.</p>')
  }));
})();
