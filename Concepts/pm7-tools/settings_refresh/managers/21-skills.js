/* Skills — reusable know-how the assistant can pick up for specific jobs. */
(function () {
  const ID = 'skills';
  const KEY = 'tools-integrations';
  /* Wave S: the canonical extensions.skills.* rows (discovery, rescan, which skills to show, auto-run,
     auto-enable, sharing, catalog budget, validate) render inline below the list, so the kit keeps no
     duplicate preference rows of its own. */
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

  PM51.style(`
#panel-settings .pm51-skills-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-skills-actions:first-child { margin-top: 0; }
`);

  function noteFor(s) {
    if (s.state === 'Needs setup') { const missing = (s.requirements || []).filter(reqMissing).map(reqLabel); return missing.length ? `Needs ${missing.join(' and ').toLowerCase()} before it can run.` : 'Open the skill to finish setting it up.'; }
    if (s.state === 'Needs permission') return 'Waiting for your permission. Open the skill to allow it.';
    if (s.state === 'Warning' && s.updateAvailable) return `Update ${s.updateAvailable} is available.`;
    if (s.state === 'Has problems') return 'Something is wrong. Open the skill to see what.';
    return '';
  }

  function render() {
    const list = skills();
    const items = list.map(s => ({
      title: s.name, meta: `${s.origin} · version ${s.version}`, note: noteFor(s), pill: PM51.pill(s.state),
      avatar: h(PM51.initials(s.name)),
      end: PM51.toggle(!!s.enabled, { action: 'pm51-skills-toggle', data: { id: s.id }, label: `${s.name} enabled` }),
      action: 'pm51-skills-open', data: { id: s.id }
    }));
    const body = [
      PM51.section({
        title: 'Your skills', help: 'Turn a skill off to keep it out of the way. Open one to see what it needs.',
        action: { label: 'Add skill', icon: 'plus', action: 'pm51-skills-add' },
        body: items.length ? PM51.list(items) : PM51.empty('No skills yet', 'Add one from the catalog.', { label: 'Add skill', action: 'pm51-skills-add', icon: 'plus' })
      }),
      PM51.advanced([
        PM51.section({ title: 'What each skill may do', help: 'Skills only get what they ask for. You can allow or remove a skill at any time.', body: PM51.rows(list.map(s => ({ label: s.name, help: s.state === 'Needs permission' ? 'Waiting for your permission.' : '', value: permissionText(s) }))) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Skill folders', '.skills in this project · shared skills in your profile'], ['Catalog', 'Puppet Master skill catalog'], ['Skills on your list', String(list.length)]]) + actionRow(PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-skills-diagnostics' })) })
      ].join(''))
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset skill settings', action: 'pm51-skills-reset' }, { label: 'How skills work', action: 'pm51-skills-help' }] });
  }
  PM51.manager('skills', { render });

  function openSkill(id) {
    const s = byId(id); if (!s) return;
    const reqs = s.requirements || [];
    PM51.panel({
      title: s.name, subtitle: `${s.origin} · version ${s.version}`, pill: PM51.pill(s.state),
      body: PM51.panelSection('What it does', `<p class="pm51-ps-text">${h(s.description || 'No description yet.')}</p>`)
        + PM51.panelSection('Use it', PM51.rows([{ label: 'Enabled', help: 'Off keeps it on your list but out of the way.', control: PM51.toggle(!!s.enabled, { action: 'pm51-skills-toggle', data: { id: s.id }, label: `${s.name} enabled` }) }]))
        + PM51.panelSection('What it needs', (reqs.length ? PM51.kv(reqs.map(r => [reqLabel(r), reqMissing(r) ? 'Not connected yet' : 'Ready'])) : '<p class="pm51-ps-text">Nothing extra.</p>') + actionRow(PM51.btn({ label: 'Check requirements', small: true, icon: 'test', action: 'pm51-skills-check', data: { id: s.id } })))
        + PM51.panelSection('Permissions', PM51.rows([{ label: permissionText(s), help: s.state === 'Needs permission' ? 'The skill is waiting for your OK.' : 'Granted when the skill was added.', action: s.state === 'Needs permission' ? { label: 'Allow', icon: 'check', action: 'pm51-skills-allow', data: { id: s.id } } : undefined }]))
        + PM51.panelSection('Updates', PM51.rows([{ label: s.updateAvailable ? `Version ${s.updateAvailable} is available` : 'Up to date', help: `You have version ${s.version}.`, action: s.updateAvailable ? { label: 'Update', icon: 'download', action: 'pm51-skills-update', data: { id: s.id } } : undefined }]))
        + PM51.panelSection('Remove', actionRow(PM51.btn({ label: 'Remove skill', small: true, danger: true, icon: 'trash', action: 'pm51-skills-remove', data: { id: s.id }, disabled: bundled(s), reason: 'Skills bundled with Puppet Master cannot be removed. Turn it off instead.' })))
    });
  }

  PM51.on('skills-open', el => openSkill(ds(el, 'id')));
  PM51.on('skills-toggle', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    s.enabled = !s.enabled;
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', s.enabled); el.setAttribute('aria-checked', String(s.enabled)); }
    saveState(); PM51.refresh(ID, { swap: false });
  });
  PM51.on('skills-add', () => openDialog({
    title: 'Add skill', subtitle: 'Skills are small packs of know-how the assistant can follow.',
    body: formField('Where from', 'source', 'catalog', { type: 'select', full: true, choices: [{ value: 'catalog', label: 'From the catalog' }, { value: 'github', label: 'From GitHub' }, { value: 'disk', label: 'From a folder on this computer' }] })
      + formField('Name or address', 'ref', '', { placeholder: 'e.g. Release Notes, a GitHub link, or a folder path', autofocus: true, full: true, help: 'Catalog: the skill name. GitHub: paste the link. Folder: paste its path.' }),
    saveLabel: 'Add skill',
    onSave: data => {
      const ref = String(data.ref || '').trim(); if (!ref) { PM51.toast('Name needed', 'Type a skill name, link, or folder first.', 'info'); return false; }
      const name = ref.includes('/') ? (ref.split('/').filter(Boolean).pop() || ref).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ref;
      const id = uniqueId(slug(name));
      skills().push({ id, name, origin: ORIGIN_BY_SOURCE[data.source] || 'Installed from catalog', state: 'Needs setup', enabled: false, version: '0.0', description: 'Added by you. Open the skill to finish setting it up.', requirements: [], permissions: 'Not set yet' });
      saveState(); PM51.refresh(ID, { swap: false });
      PM51.toast('Skill added to your list', 'Example data only. Nothing was downloaded in this preview.', 'info');
    }
  }));
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
      title: `Update ${s.name}`, subtitle: `Version ${s.version} to ${s.updateAvailable}.`,
      body: PM51.panelSection('What changes', PM51.kv([['New', 'Better headings and shorter summaries'], ['Fixed', 'Skips generated files'], ['Permissions', 'Unchanged']]))
        + PM51.note('Updates download only in the real app. Nothing changes in this preview.', 'info')
    });
  });
  PM51.on('skills-remove', el => {
    const s = byId(ds(el, 'id')); if (!s) return;
    PM51.confirm(`Remove ${s.name}?`, 'The skill is taken off your list. You can add it again later.', 'Remove', () => {
      PM51.s().skills = skills().filter(x => x.id !== s.id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${s.name} removed`, 'It is no longer on your list.');
    }, true);
  });
  PM51.on('skills-diagnostics', () => PM51.check({ title: 'Skill diagnostics', steps: [
    { title: 'Skill folders readable', desc: 'Project and profile folders opened' },
    { title: 'Instructions parsed', desc: `${skills().length} skills read without errors`, status: 'Example', tone: 'info' },
    { title: 'Catalog reachable', desc: 'Checked through your network', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('skills-reset', () => PM51.confirm('Reset skill settings?', 'Your skills list goes back to its defaults. The skill settings below the list keep their values; use Details to reset one.', 'Reset', () => {
    PM51.s().skills = clone(DATA.skills); delete PM51.s().skillsPrefs; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Skills reset', 'Defaults are back.');
  }));
  PM51.on('skills-help', () => PM51.panel({
    title: 'How skills work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A skill is a short set of instructions the assistant follows for one kind of job, like writing release notes. Skills stay out of the way until they fit what you are doing.</p>')
      + PM51.panelSection('Where they come from', PM51.kv([['Bundled with PM', 'Included with Puppet Master. Always available.'], ['Catalog', 'Reviewed skills you can add in one step.'], ['GitHub', 'Skills shared by other people. Check what they ask for.'], ['Disk', 'Folders on this computer, including ones you wrote.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">A skill only gets the permissions it asks for, and you can take them back by removing the skill.</p>')
  }));
})();
