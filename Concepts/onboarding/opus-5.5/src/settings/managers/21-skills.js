/* Skills — reusable know-how the assistant can pick up for specific jobs.
   O55: one page that reads top to bottom. "Your skills" is the list and everything that belongs to a list lives on it:
   search, Show, Sort, Rescan and Check all in its toolbar; each skill's switch is its on/off; opening a skill shows
   what it does, what it needs, what it may do and when it may run. Below the list, three short groups say how skills
   are used, how new ones arrive, and whether they are shared with other AI tools; the two size limits and the badge
   choice are under More options. Every inventory row is drawn exactly where it belongs (bound to its setting id), so
   nothing is listed twice.
   Adding a skill is guided (PM51.wizard): write your own (when to use it, what to do, what it may do), pick one from
   the catalog, or bring one in from GitHub or a folder; then review what it needs and may do, where it is saved,
   and whether it starts on. Your own and imported skills' instructions can be edited later; a missing requirement
   links to the page that sets it up. */
(function () {
  const ID = 'skills';
  const KEY = 'tools-integrations';
  const S = {
    list: 'extensions.skills.your-skills', onoff: 'extensions.skills.skill-on-off', search: 'extensions.skills.search',
    show: 'extensions.skills.registry-view', sort: 'extensions.skills.sort', rescan: 'extensions.skills.rescan',
    validate: 'extensions.skills.validate', preview: 'extensions.skills.preview', perms: 'extensions.skills.permissions',
    pattern: 'extensions.skills.pattern-permissions', badges: 'extensions.skills.info-badges'
  };
  const skills = () => PM51.s().skills;
  const byId = id => skills().find(x => x.id === id);
  const bundled = s => /bundled/i.test(s.origin || '');
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'skill';
  const uniqueId = base => { let id = base, n = 2; while (byId(id)) id = base + '-' + n++; return id; };
  const actionRow = (...buttons) => `<div class="pm51-skills-actions">${buttons.join('')}</div>`;
  const reqLabel = r => String(r || '').replace(/\s*\(.*?\)\s*/g, '').trim();
  const reqMissing = r => /\(not connected\)|\(missing\)|\(not installed\)/i.test(String(r || ''));
  const permissionText = s => String(s.permissions || 'Nothing extra').replace(/\s*\(waiting for you\)\s*/i, '');
  const ORIGIN_BY_SOURCE = { catalog: 'Installed from catalog', github: 'Installed from GitHub', disk: 'Imported from disk' };
  const RUN = [['', 'Follows the default'], ['allow', 'Runs when it fits'], ['ask', 'Asks me first'], ['deny', 'Never runs']];
  const runOf = s => { const m = PM51.value(S.perms); return (m && typeof m === 'object' && !Array.isArray(m) && m[s.name]) || ''; };
  const runText = s => (RUN.find(r => r[0] === runOf(s)) || RUN[0])[1];
  /* ---------- guided add ---------- */
  const CATALOG = [
    { id: 'api-docs', name: 'API Docs Writer', icon: 'file', what: 'Writes and updates reference docs from your code.', needs: [], may: 'Write docs folder' },
    { id: 'test-writer', name: 'Test Writer', icon: 'test', what: 'Adds tests for code that has none and explains what each checks.', needs: ['Terminal'], may: 'Edit files with approval' },
    { id: 'a11y-audit', name: 'Accessibility Audit', icon: 'eye', what: 'Checks pages for contrast, labels and keyboard use.', needs: ['Built-in browser'], may: 'Read project files' },
    { id: 'db-migrations', name: 'Database Migrations', icon: 'database', what: 'Writes safe, reversible schema changes.', needs: ['Terminal'], may: 'Edit files with approval' },
    { id: 'bug-triage', name: 'Bug Triage', icon: 'alert', what: 'Groups new issues, finds duplicates and suggests owners.', needs: ['GitHub connected'], may: 'Comment on issues' },
    { id: 'dep-updates', name: 'Dependency Updates', icon: 'refresh', what: 'Upgrades packages in small, tested steps.', needs: ['Terminal', 'Version history read access'], may: 'Edit files with approval' },
    { id: 'security-review', name: 'Security Review', icon: 'shield', what: 'Looks for secrets, injection and risky permissions.', needs: [], may: 'Read project files' },
    { id: 'changelog', name: 'Changelog Keeper', icon: 'history', what: 'Keeps CHANGELOG.md in step with merged work.', needs: ['Version history read access'], may: 'Write docs folder' }
  ];
  const MAY = [['Read project files', 'Only read project files'], ['Write docs folder', 'Write in the docs folder'], ['Edit files with approval', 'Change files, asking me first'], ['Run commands with approval', 'Run commands, asking me first']];
  const NEEDS = ['Built-in browser', 'Terminal', 'Version history read access', 'GitHub connected'];
  const TEMPLATE = 'When this skill applies:\n- \n\nWhat to do:\n1. \n2. \n\nWhen you are done:\n- Say what you changed and what to check.';
  const START = [
    { id: 'write', title: 'Write my own', text: 'Say when it applies and what to do. Saved as a small file you can edit later.', icon: 'edit' },
    { id: 'catalog', title: 'From the catalog', text: 'Reviewed skills that work as soon as they are added.', icon: 'list' },
    { id: 'github', title: 'From GitHub', text: 'A skill someone shared. You check what it asks for first.', icon: 'branch' },
    { id: 'folder', title: 'From a folder', text: 'A skill folder already on this computer.', icon: 'folder' }
  ];
  const onList = c => skills().some(s => s.name === c.name);
  function detailsStep(d) {
    if (d.source === 'catalog') return PM51.tiles(CATALOG.map(c => ({ title: c.name, text: c.what, meta: c.needs.length ? `Needs ${c.needs.join(', ').toLowerCase()}` : 'Needs nothing extra', icon: c.icon, selected: d.pick === c.id, done: onList(c), doneReason: `${c.name} is already on your list.`, data: { pick: c.id } })), { action: 'pm51-skills-pick' });
    if (d.source === 'github' || d.source === 'folder') {
      const gh = d.source === 'github';
      return `<div class="o55-setup-fields">${PM51.field(gh ? 'Link to the skill' : 'Skill folder', `<span class="pm51-commands-inline"><input class="text-control o55-skl-ref o55-setup-mono" value="${a(d.ref || '')}" placeholder="${gh ? 'https://github.com/someone/skills/tree/main/release-helper' : '/home/you/skills/release-helper'}" autocomplete="off" spellcheck="false" data-autofocus/>${PM51.btn({ label: 'Read it', icon: 'search', small: true, action: 'pm51-skills-read' })}</span>`, gh ? 'A folder on GitHub that holds SKILL.md.' : 'The folder that holds SKILL.md.')}</div>`
        + (d.name ? PM51.panelSection('Found', PM51.kv([['Name', d.name], ['What it does', d.description], ['Asks to', (MAY.find(m => m[0] === d.may) || [d.may, d.may])[1]]]), gh ? 'Shared by someone else: read what it asks for before you add it.' : '', { icon: 'file' }) : '');
    }
    return `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-skl-name" value="${a(d.name || '')}" placeholder="e.g. Release Helper" autocomplete="off" data-autofocus/>`, 'Short, so it reads well in chat.')}`
      + PM51.field('When to use it', `<input class="text-control o55-skl-desc" value="${a(d.description || '')}" placeholder="e.g. When I ask for release notes or a changelog" autocomplete="off"/>`, 'The assistant reads this to decide when the skill fits.')
      + PM51.field('What to do', `<textarea class="form-textarea o55-skl-body o55-setup-mono" rows="8" spellcheck="false">${h(d.instructions || TEMPLATE)}</textarea>`, 'Plain steps, the way you would explain it to a new teammate.')
      + PM51.field('It may', PM51.select(d.may || 'Read project files', MAY, { cls: 'o55-skl-may', label: 'It may' }), 'It never gets more than this.')
      + PM51.field('It needs', `<div class="chip-select o55-chips o55-skl-needs" role="group" aria-label="It needs">${NEEDS.map(n => { const on = (d.needs || []).includes(n); return `<button type="button" class="${on ? 'active' : ''}" aria-pressed="${on}" data-action="pm51-skills-need" data-value="${a(n)}"><span>${h(n)}</span></button>`; }).join('')}</div>`, 'Only if it cannot work without them.')
      + `</div>`;
  }
  function collectDetails(wrap, d) {
    if (d.source !== 'write') { const r = wrap.querySelector('.o55-skl-ref'); if (r) d.ref = r.value.trim(); return; }
    const v = s => (wrap.querySelector(s) || {}).value;
    d.name = String(v('.o55-skl-name') || '').trim(); d.description = String(v('.o55-skl-desc') || '').trim(); d.instructions = String(v('.o55-skl-body') || ''); d.may = v('.o55-skl-may') || d.may;
    d.needs = [...wrap.querySelectorAll('.o55-skl-needs button.active')].map(b => b.dataset.value);
  }
  function checkDetails(d) {
    if (d.source === 'catalog') return d.pick ? '' : 'Pick a skill to go on.';
    if (d.source !== 'write') return d.name ? '' : 'Paste it, then choose Read it.';
    if (!d.name) return 'Give the skill a name.';
    if (skills().some(s => s.name.toLowerCase() === d.name.toLowerCase())) return `There is already a skill called ${d.name}.`;
    if (!d.description) return 'Say when the assistant should use it.';
    return '';
  }
  /* GitHub and version history are connected in this example project (Repository Audit and PR Reviewer use them) */
  const missingNeeds = () => [];
  function reviewStep(d) {
    const where = d.where || 'Project';
    return PM51.panelSection(d.name, PM51.kv([['When it is used', d.description || '—'], ['It may', (MAY.find(m => m[0] === d.may) || [d.may, d.may])[1]], ['It needs', (d.needs || []).length ? d.needs.join(', ') : 'Nothing extra']]), '', { icon: 'sliders' })
      + PM51.panelSection('Where it is saved', PM51.select(where, [['Project', 'This project (.puppet-master/skills)'], ['Global', 'Every project (your skills folder)']], { cls: 'o55-skl-where', label: 'Where it is saved' }), `As ${slug(d.name)}/SKILL.md. You can edit it by hand too.`, { icon: 'folder' })
      + PM51.rows([{ label: 'Turn it on now', help: 'Off adds it but keeps it out of the way until you switch it on.', control: PM51.toggle(d.turnOn !== false, { action: 'pm51-skills-won', label: 'Turn it on now' }) }]);
  }
  function skillWizard() {
    PM51.wizard({
      title: 'Add a skill', subtitle: 'A skill is a short set of instructions the assistant follows for one kind of job.', eyebrow: 'Skill', icon: 'sliders',
      draft: { source: null, turnOn: PM51.value('extensions.skills.auto-enable-new') !== false, needs: [] }, finishLabel: 'Add skill',
      steps: [
        { label: 'Start', title: 'Where does it come from?', render: d => PM51.tiles(START.map(x => ({ title: x.title, text: x.text, icon: x.icon, selected: d.source === x.id, data: { source: x.id } })), { action: 'pm51-skills-source' }), check: d => d.source ? '' : 'Pick one to go on.' },
        { label: 'Details', render: detailsStep, collect: collectDetails, check: checkDetails },
        { label: 'Review', title: 'Check it, then add it.', render: reviewStep, collect: (wrap, d) => { const w = wrap.querySelector('.o55-skl-where'); if (w) d.where = w.value; const on = wrap.querySelector('[data-action="pm51-skills-won"]'); if (on) d.turnOn = on.classList.contains('on'); } }
      ],
      onFinish: d => {
        const miss = missingNeeds(d);
        const origin = d.source === 'write' ? 'Written by you' : d.source === 'github' ? 'Installed from GitHub' : d.source === 'folder' ? 'Imported from disk' : 'Installed from catalog';
        skills().push({ id: uniqueId(slug(d.name)), name: d.name, origin, state: miss.length ? 'Needs setup' : 'Ready', enabled: d.turnOn !== false, version: d.source === 'write' ? '1.0' : '1.0', description: d.description, instructions: d.instructions || '', requirements: (d.needs || []).map(n => miss.includes(n) ? `${n} (not connected)` : n), permissions: d.may || 'Read project files', where: d.where || 'Project', justAdded: true });
        saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast(`${d.name} added`, miss.length ? `It needs ${miss.join(' and ').toLowerCase()} before it can run.` : (d.turnOn !== false ? 'It is on and used when it fits.' : 'It is off until you switch it on.'));
      }
    });
  }

  PM51.style(`
#panel-settings .pm51-skills-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-skills-actions:first-child { margin-top: 0; }
#panel-settings .pm51-skills-list .pm51-list { padding: 4px 18px 8px; }
#panel-settings .pm51-skills-list .pm51-item[hidden] { display: none; }
#panel-settings .pm51-skills-list .o55-skills-none { padding: 18px; text-align: center; font-size: 12px; color: var(--k3-text-3); }
#panel-settings .pm51-skills-list .pm51-section-body { padding: 0; }
#panel-settings .o55-skill-run .pm51-dd-trigger { min-width: 170px; }
`);

  function noteFor(s) {
    if (s.state === 'Needs setup') { const missing = (s.requirements || []).filter(reqMissing).map(reqLabel); return missing.length ? `Needs ${missing.join(' and ').toLowerCase()} before it can run.` : 'Open the skill to finish setting it up.'; }
    if (s.state === 'Needs permission') return 'Waiting for your permission. Open the skill to allow it.';
    if (s.state === 'Warning' && s.updateAvailable) return `Update ${s.updateAvailable} is available.`;
    if (s.state === 'Has problems') return 'Something is wrong. Open the skill to see what.';
    return '';
  }
  /* The list follows the Show and Sort choices and the search box (all three are canonical settings). */
  function visible(list) {
    const show = PM51.value(S.show) || 'Active only';
    const q = String(PM51.value(S.search) || '').trim().toLowerCase();
    const sort = PM51.value(S.sort) || 'Name';
    const shown = list.filter(s => s.justAdded || (show === 'All' ? true : show === 'Hide disabled' ? s.enabled : (s.enabled || s.state !== 'Ready')))
      .filter(s => !q || [s.name, s.description, s.origin, s.state, s.permissions].join(' ').toLowerCase().includes(q));
    const key = s => sort === 'Source' ? `${s.origin} ${s.name}` : sort === 'Permission' ? `${runText(s)} ${s.name}` : s.name;
    return shown.sort((x, y) => key(x).localeCompare(key(y)));
  }
  const badgeLine = s => { const b = PM51.value(S.badges); const on = Array.isArray(b) ? b : []; return [on.includes('Source') ? `${s.origin} · version ${s.version}` : `Version ${s.version}`, on.includes('Persona references') && s.personas ? `Used by ${s.personas}` : '', runOf(s) ? runText(s) : ''].filter(Boolean).join(' · '); };
  function listHtml() {
    const all = skills(), shown = visible(all);
    const items = shown.map(s => ({
      title: s.name, meta: badgeLine(s), note: noteFor(s), pill: (PM51.value(S.badges) || []).includes('Readiness') ? PM51.pill(s.state) : '',
      avatar: h(PM51.initials(s.name)),
      end: PM51.toggle(!!s.enabled, { action: 'pm51-skills-toggle', data: { id: s.id }, label: `${s.name} on or off` }),
      action: 'pm51-skills-open', data: { id: s.id }
    }));
    const hiddenCount = all.length - shown.length;
    const toolbar = `<div class="o55-toolbar">${PM51.bound.search(S.search, { placeholder: 'Search skills' })}${PM51.bound.select(S.show, { prefix: 'Show', width: 150 })}${PM51.bound.select(S.sort, { prefix: 'Sort', width: 140 })}<span class="o55-toolbar-spacer"></span>${PM51.bound.action(S.rescan, { label: 'Rescan', icon: 'refresh', ghost: true })}${PM51.bound.action(S.validate, { label: 'Check all', icon: 'test', ghost: true })}</div>`;
    const body = all.length
      ? (items.length ? PM51.list(items) : `<div class="o55-skills-none">No skills match. ${hiddenCount ? 'Try Show: All, or clear the search.' : ''}</div>`)
      : PM51.empty('No skills yet', 'Add one from the catalog.', { label: 'Add skill', action: 'pm51-skills-add', icon: 'plus' });
    return PM51.home(S.list, PM51.home(S.onoff, PM51.home(S.preview, toolbar + body)));
  }
  /* Rules for groups of skills (name patterns like doc-*). A single skill's own choice is in its panel, and shows in
     its line in the list when it is not the default, so the skills are never listed twice. */
  function permissionsCard() {
    const m = PM51.value(S.perms); const rules = Object.entries(m && typeof m === 'object' && !Array.isArray(m) ? m : {}).filter(([k]) => k.includes('*'));
    const body = rules.length
      ? PM51.rows(rules.map(([pattern, v]) => ({ label: pattern, help: `Skills whose name matches ${pattern}`, value: (RUN.find(r => r[0] === v) || [v, v])[1] })))
      : `<p class="o55-quiet-line">No group rules. Each skill follows the default unless you choose in its own panel.</p>`;
    return PM51.home(S.perms, PM51.section({ title: 'Rules for groups of skills', help: "One choice for every skill whose name matches, like doc-*. A skill's own choice beats a rule.", action: PM51.bound.action(S.pattern, { label: rules.length ? 'Edit rules' : 'Add a rule', icon: rules.length ? 'edit' : 'plus' }), body }));
  }
  function render() {
    const body = [
      `<div class="pm51-skills-list">${PM51.section({ title: 'Your skills', help: 'Turn a skill off to keep it out of the way. Open one to see what it needs.', action: { label: 'Add skill', icon: 'plus', action: 'pm51-skills-add' }, body: listHtml() })}</div>`,
      permissionsCard()
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset the skill list', action: 'pm51-skills-reset' }, { label: 'How skills work', action: 'pm51-skills-help' }] });
  }
  PM51.manager('skills', { render });
  /* the list redraws in place when its search, Show, Sort or badge choice changes */
  const redrawList = () => { const host = root.querySelector(`[data-pm51-manager="${ID}"] .pm51-skills-list .pm51-section-body`); if (!host) return; host.innerHTML = listHtml(); PM51.applyFilters(host); const f = host.querySelector('.o55-bound-search input'); if (f && document.activeElement && document.activeElement.matches('.o55-bound-search input')) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } };
  [S.show, S.sort, S.badges].forEach(id => PM51.watch(id, redrawList));
  PM51.watch(S.perms, () => PM51.refresh(ID, { swap: false }));
  PM51.watch(S.search, () => { const host = root.querySelector(`[data-pm51-manager="${ID}"] .pm51-skills-list`); if (!host) return; const tpl = document.createElement('template'); tpl.innerHTML = listHtml(); const next = tpl.content.querySelector('.pm51-list, .o55-skills-none, .pm51-empty'); const cur = host.querySelector('.pm51-list, .o55-skills-none, .pm51-empty'); if (next && cur) cur.replaceWith(next); });

  function openSkill(id) {
    const s = byId(id); if (!s) return;
    const reqs = s.requirements || [];
    PM51.panel({
      title: s.name, eyebrow: 'Skill', icon: 'sliders', subtitle: `${s.origin} · version ${s.version}`, status: s.state,
      body: PM51.panelSection('What it does', `<p class="pm51-ps-text">${h(s.description || 'No description yet.')}</p>` + actionRow(bundled(s) || /catalog/i.test(s.origin || '') ? PM51.btn({ label: 'Read its instructions', small: true, icon: 'file', action: 'pm51-skills-preview', data: { id: s.id } }) : PM51.btn({ label: 'Edit its instructions', small: true, icon: 'edit', action: 'pm51-skills-edit', data: { id: s.id } })), '', { icon: 'info' })
        + PM51.panelSection('Use it', PM51.rows([
          { label: 'On', help: 'Off keeps it on your list but out of the way.', control: PM51.toggle(!!s.enabled, { action: 'pm51-skills-toggle', data: { id: s.id }, label: `${s.name} on or off` }) },
          { label: 'When it may run', help: 'Follows the default unless you choose.', control: PM51.dropdown(runOf(s), RUN.map(([value, label]) => ({ value, label })), { action: 'pm51-skills-run', data: { id: s.id }, label: `When ${s.name} may run` }) }
        ]), '', { icon: 'play' })
        + PM51.panelSection('What it needs', (reqs.length ? PM51.kv(reqs.map(r => [reqLabel(r), reqMissing(r) ? 'Not connected yet' : 'Ready'])) : '<p class="pm51-ps-text">Nothing extra.</p>') + actionRow(PM51.btn({ label: 'Check requirements', small: true, icon: 'test', action: 'pm51-skills-check', data: { id: s.id } }), reqs.some(reqMissing) ? PM51.btn({ label: 'Set up version control', small: true, icon: 'branch', action: 'pm51-skills-setup-source' }) : ''), '', { icon: 'plug' })
        + PM51.panelSection('What it may do', PM51.rows([{ label: permissionText(s), help: s.state === 'Needs permission' ? 'The skill is waiting for your OK.' : 'Granted when the skill was added.', action: s.state === 'Needs permission' ? { label: 'Allow', icon: 'check', action: 'pm51-skills-allow', data: { id: s.id } } : undefined }]), '', { icon: 'lock' })
        + PM51.panelSection('Updates', PM51.rows([{ label: s.updateAvailable ? `Version ${s.updateAvailable} is available` : 'Up to date', help: `You have version ${s.version}.`, action: s.updateAvailable ? { label: 'Update', icon: 'download', action: 'pm51-skills-update', data: { id: s.id } } : undefined }]), '', { icon: 'refresh' })
        + (bundled(s) ? PM51.note('Bundled with Puppet Master, so it can be turned off but not removed.', 'info') : PM51.panelSection('Remove', actionRow(PM51.btn({ label: 'Remove skill', small: true, danger: true, icon: 'trash', action: 'pm51-skills-remove', data: { id: s.id } })), '', { icon: 'trash' }))
    });
  }

  PM51.on('skills-open', el => openSkill(ds(el, 'id')));
  PM51.on('skills-preview', el => { const s = byId(ds(el, 'id')); if (!s) return; PM51.panel({ title: s.name, eyebrow: 'Instructions · read only', icon: 'file', size: 'wide', body: PM51.panelSection('What the assistant reads', `<p class="pm51-ps-text">${h(s.description || 'No description yet.')}</p>`) + PM51.note('The full instructions open here in the real app. Nothing runs while you read them.', 'info') }); });
  PM51.on('skills-toggle', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    s.enabled = !s.enabled; delete s.justAdded;
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', s.enabled); el.setAttribute('aria-checked', String(s.enabled)); }
    saveState(); PM51.toast(s.enabled ? `${s.name} is on` : `${s.name} is off`, s.enabled ? 'The assistant can use it again.' : 'It stays on your list.', 'success');
    if (!el.closest('.pm51-panel')) redrawList();
  });
  PM51.onChange('skills-run', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    const cur = PM51.value(S.perms); const next = Object.assign({}, cur && typeof cur === 'object' && !Array.isArray(cur) ? cur : {});
    if (el.value) next[s.name] = el.value; else delete next[s.name];
    if (!commitSettingValue(S.perms, next)) return;
    saveState(); PM51.toast('Saved', `${s.name}: ${runText(s).toLowerCase()}.`, 'success');
  });
  PM51.on('skills-add', () => skillWizard());
  PM51.on('skills-source', el => { const w = PM51.wizardOf(el); if (!w) return; if (w.draft.source !== ds(el, 'source')) Object.assign(w.draft, { source: ds(el, 'source'), name: '', description: '', pick: null, ref: '', needs: [], may: 'Read project files', instructions: '' }); w.next(); });
  PM51.on('skills-pick', el => { const w = PM51.wizardOf(el); const c = CATALOG.find(x => x.id === ds(el, 'pick')); if (!w || !c) return; Object.assign(w.draft, { pick: c.id, name: c.name, description: c.what, needs: c.needs.slice(), may: c.may }); w.next(); });
  PM51.on('skills-need', el => { el.classList.toggle('active'); el.setAttribute('aria-pressed', String(el.classList.contains('active'))); });
  PM51.on('skills-won', el => { el.classList.toggle('on'); el.setAttribute('aria-checked', String(el.classList.contains('on'))); });
  PM51.on('skills-read', el => {
    const w = PM51.wizardOf(el); if (!w) return; const inp = el.closest('.drawer-wrap').querySelector('.o55-skl-ref'); const ref = String(inp && inp.value || '').trim();
    if (!ref) { PM51.toast('Paste it first', w.draft.source === 'github' ? 'The GitHub link to the skill folder.' : 'The folder that holds SKILL.md.', 'info'); return; }
    const base = ref.split(/[\\/]/).filter(Boolean).pop() || 'skill';
    Object.assign(w.draft, { ref, name: base.replace(/[-_]+/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()), description: 'Read from SKILL.md (example): helps with ' + base.replace(/[-_]+/g, ' ') + '.', may: w.draft.source === 'github' ? 'Edit files with approval' : 'Read project files', needs: [] });
    w.go(1);
  });
  /* your own and imported skills: edit what the assistant reads */
  PM51.on('skills-edit', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    PM51.panel({ title: `${s.name}: instructions`, eyebrow: 'Skill', icon: 'edit', size: 'wide',
      body: `<div class="o55-setup-fields">${PM51.field('When to use it', `<input class="text-control o55-skl-desc" value="${a(s.description || '')}"/>`)}${PM51.field('What to do', `<textarea class="form-textarea o55-skl-body o55-setup-mono" rows="12" spellcheck="false">${h(s.instructions || TEMPLATE)}</textarea>`, `Saved in ${slug(s.name)}/SKILL.md.`)}</div>`,
      primaryLabel: 'Save', onPrimary: wrap => { s.description = wrap.querySelector('.o55-skl-desc').value.trim() || s.description; s.instructions = wrap.querySelector('.o55-skl-body').value; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Instructions saved', `${s.name} uses them from the next chat.`); } });
  });
  PM51.on('skills-check', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    const reqs = s.requirements || [];
    const steps = reqs.length ? reqs.map(r => ({ title: reqLabel(r), desc: reqMissing(r) ? 'Not connected yet. Set it up first.' : 'Available', status: reqMissing(r) ? 'Missing' : 'Checked', tone: reqMissing(r) ? 'attention' : 'ready' })) : [{ title: 'Nothing extra needed', desc: 'This skill runs on its own' }];
    const missing = reqs.some(reqMissing);
    PM51.check({ title: `Check ${s.name}`, steps, outcome: missing ? 'Needs setup · example data' : undefined, tone: missing ? 'attention' : undefined });
  });
  PM51.on('skills-allow', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    PM51.confirm(`Allow ${s.name}?`, `It may ${permissionText(s).toLowerCase()}. You can remove the skill later to take this back.`, 'Allow', () => {
      s.permissions = permissionText(s); s.state = 'Ready'; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Permission granted', `${s.name} is ready.`);
    });
  });
  PM51.on('skills-update', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    PM51.panel({
      title: `Update ${s.name}`, subtitle: `Version ${s.version} to ${s.updateAvailable}.`, icon: 'download', eyebrow: 'Skill',
      body: PM51.panelSection('What changes', PM51.kv([['New', 'Better headings and shorter summaries'], ['Fixed', 'Skips generated files'], ['Permissions', 'Unchanged']])),
      primaryLabel: 'Update', onPrimary: () => { s.version = s.updateAvailable; delete s.updateAvailable; if (s.state === 'Warning') s.state = 'Ready'; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${s.name} updated`, `Now on version ${s.version}. Example only: nothing was downloaded.`, 'info'); }
    });
  });
  PM51.on('skills-setup-source', () => { closeOverlay(false); window.setTimeout(() => PM51.go('source', 'source-manager'), 220); });
  PM51.on('skills-remove', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    PM51.confirm(`Remove ${s.name}?`, 'The skill is taken off your list. You can add it again later.', 'Remove', () => {
      PM51.s().skills = skills().filter(x => x.id !== s.id); saveState(); closeOverlay(false); PM51.refresh(ID, { swap: false }); PM51.toast(`${s.name} removed`, 'It is no longer on your list.');
    }, true);
  });
  /* "Check all" and "Rescan" (bound toolbar buttons) run these through rows.d/21-skills.json */
  PM51.on('skills-diagnostics', () => PM51.check({ title: 'Check all skills', steps: [
    { title: 'Skill folders readable', desc: 'Project and profile folders opened' },
    { title: 'Instructions read', desc: `${skills().length} skills read; headers, names and descriptions checked`, status: 'Example', tone: 'info' },
    { title: 'Catalog reachable', desc: 'Checked through your network', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('skills-rescan', () => PM51.check({ title: 'Look for skills again', outcome: 'Nothing new · example data', steps: [
    { title: 'This project', desc: `.puppet-master/skills · ${skills().filter(s => (s.where || 'Project') === 'Project' && !bundled(s)).length} skills`, status: 'Read', tone: 'ready' },
    { title: 'Your skills folder', desc: `${skills().filter(s => s.where === 'Global').length} skills`, status: 'Read', tone: 'ready' },
    { title: 'Changes since last time', desc: 'No new, changed or removed skills', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('skills-reset', () => PM51.confirm('Reset the skill list?', 'Your skills list goes back to its defaults. The choices below it keep their values; use About on a row to reset one.', 'Reset', () => {
    PM51.s().skills = clone(DATA.skills); delete PM51.s().skillsPrefs; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Skills reset', 'Defaults are back.');
  }));
  PM51.on('skills-help', () => PM51.panel({
    title: 'How skills work', icon: 'info',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A skill is a short set of instructions the assistant follows for one kind of job, like writing release notes. Skills stay out of the way until they fit what you are doing.</p>')
      + PM51.panelSection('Where they come from', PM51.kv([['Bundled with PM', 'Included with Puppet Master. Always available.'], ['Catalog', 'Reviewed skills you can add in one step.'], ['GitHub', 'Skills shared by other people. Check what they ask for.'], ['Disk', 'Folders on this computer, including ones you wrote.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">A skill only gets the permissions it asks for, and you can take them back by removing the skill.</p>')
  }));
})();
