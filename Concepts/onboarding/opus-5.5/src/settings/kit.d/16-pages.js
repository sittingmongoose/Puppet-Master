/* O55 · plain pages (App & Input, Editor & Terminal, Containers, Planning & Interviews, Advanced) have no manager, so
   the engine drew every placed group open, one after another; a rarely changed group sat between everyday ones and
   `advanced: true` in placement did nothing there. A page now draws its everyday groups first and folds the rest into
   one "More options" at the end, the same disclosure the managers use. A jump from the page index, search or a
   Details link to a row inside it opens it first. */
const o55PageBody = renderContinuousWorkspaceBody;
renderContinuousWorkspaceBody = function (workspace, domain) {
  const page = workspace && PLACEMENT.pages ? PLACEMENT.pages[workspace.id] : null;
  if (!page || workspace.type !== 'settings' || workspace.virtualAllSettings || !Array.isArray(workspace.sections)) return o55PageBody(workspace, domain);
  const all = workspace.sections, more = all.filter(s => s.advanced);
  if (!more.length) return o55PageBody(workspace, domain);
  const draw = list => list.map(s => renderSettingsSection(s, workspace, all.indexOf(s))).join('');
  return draw(all.filter(s => !s.advanced)) + `<div class="o55-page-more">${PM51.advanced(draw(more), { help: page.more || '' })}</div>`;
};
const o55PageScrollTo = scrollToSection;
scrollToSection = function (sectionId, smooth = true) {
  const meta = pm51SectionMeta[sectionId];
  if (meta && meta.page && meta.advanced) {
    if (typeof mountContinuousWorkspace === 'function') mountContinuousWorkspace(meta.workspace);
    pm51OpenAdvancedFor(root.querySelector(`#section-${cssEscape(sectionId)}`));
  }
  return o55PageScrollTo(sectionId, smooth);
};

/* ---------- numbers stay in range, and a limit that follows another setting follows it ---------------------------- */
/* A typed number is checked when you leave the box (not on every key, so 5000 can be typed on the way past 5). Out of
   range, it is brought back to the nearest allowed value and says so. When a setting another row's limit follows
   changes (Most tabs open at once), that row is redrawn and brought inside its new limit. */
const o55Dependents = () => Object.entries(O55R).filter(([, r]) => r && (r.maxFrom || r.minFrom)).map(([id, r]) => ({ id, on: [r.maxFrom, r.minFrom].filter(Boolean).map(f => typeof f === 'string' ? f : f.id) }));
function o55Clamp(id) {
  const f = findSettingGlobal(id), row = O55R[id]; if (!f || !row) return;
  const v = Number(settingValue(f.setting)), scale = Number(row.scale) || 1; if (!Number.isFinite(v)) return;
  const lo = o55Bound(row, f.setting, 'min'), hi = o55Bound(row, f.setting, 'max'), shown = v / scale;
  const next = Number.isFinite(hi) && shown > hi ? hi : Number.isFinite(lo) && shown < lo ? lo : null;
  if (next != null && commitSettingValue(id, scale === 1 ? next : Math.round(next * scale))) showToast(`${PM51.rowLabel(f.setting)} changed to ${next}`, 'It has to stay within its limit.', 'info', 2800);
  refreshSettingRow(id);
}
document.addEventListener('change', e => {
  const el = e.target; if (!el || !el.closest) return;
  const input = el.closest('#panel-settings .o55-num input[type="number"]');
  const id = input ? (input.dataset.setting || (input.closest('[id^="setting-"]') || {}).id?.replace(/^setting-/, '')) : el.dataset && el.dataset.setting;
  if (input && id) {
    const n = Number.parseFloat(input.value), lo = Number.parseFloat(input.min), hi = Number.parseFloat(input.max);
    if (Number.isFinite(n) && ((Number.isFinite(lo) && n < lo) || (Number.isFinite(hi) && n > hi))) {
      input.value = String(Number.isFinite(hi) && n > hi ? hi : lo);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      showToast('Kept within range', Number.isFinite(lo) && Number.isFinite(hi) ? `Between ${lo} and ${hi}.` : Number.isFinite(hi) ? `At most ${hi}.` : `At least ${lo}.`, 'info', 2600);
    }
  }
  if (id) window.setTimeout(() => o55Dependents().filter(d => d.on.includes(id)).forEach(d => o55Clamp(d.id)), 0);
}, true);

/* ---------- a "Custom" choice's own field -------------------------------------------------------------------------- */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest ? e.target.closest('.o55-custom-in') : null; if (!el) return;
  const s = PM51.s(); s.o55Custom = s.o55Custom || {}; s.o55Custom[el.dataset.o55Custom] = el.value; saveState();
});
document.addEventListener('change', e => {
  const el = e.target && e.target.closest ? e.target.closest('.o55-custom-in') : null; if (!el) return;
  const f = findSettingGlobal(el.dataset.o55Custom);
  if (f && el.value.trim()) showToast('Saved', `${PM51.rowLabel(f.setting)}: ${el.value.trim()}.`, 'success', 2200);
});

/* ---------- actions that belong to another part of the app ---------------------------------------------------------- */
/* Dashboard widgets: the Home dashboard has the real picker ("Add widget"); a list of widget names typed here could
   never be valid. Reset the layout: the Home menu's own Reset layout, after one plain question. */
PM51.on('o55-dash-widgets', () => {
  const home = document.getElementById('tab-dashboard');
  if (home) home.click();
  window.setTimeout(() => { const add = document.getElementById('pm6DashAddBtn'); if (add) add.click(); else showToast('Open Home', 'The widget picker is the Add widget button on the Home dashboard.', 'info', 3200); }, 260);
});
PM51.on('o55-home-reset', () => {
  const row = O55R['general.startup.reset-home-layout'] || {};
  confirmDialog('Reset the Home layout?', row.message || 'Panels go back to their default places. Open files, terminals and chats stay.', 'Reset layout', () => {
    const cmd = document.querySelector('[data-pm-home-action="reset-layout"]');
    if (cmd) cmd.click();
    showToast('Home layout reset', 'Everything is back in its default place.', 'success', 2600);
  });
});

/* ---------- Words to always accept: a real word list ------------------------------------------------------------------ */
/* The hand row said "42 words" and its button opened a page that pointed back at the row. It is now a list of the
   words themselves, edited with the same list editor as every other list. */
(function o55SpellingWords() {
  const e = findSettingGlobal('custom-words'); if (!e || !e.setting) return;
  e.setting.control = 'list';
  if (!Array.isArray(e.setting.value)) e.setting.value = ['Tastebook', 'Jujutsu', 'Tauri', 'Kimi', 'Unraid', 'rustfmt', 'Playwright', 'monorepo', 'Supabase', 'SvelteKit', 'PRD', 'Grill Me'];
  if (state && state.settings && !Array.isArray(state.settings['custom-words'])) delete state.settings['custom-words'];
})();

/* ---------- Accent color keeps the theme's own until you pick one ------------------------------------------------ */
/* The hand row defaulted to Violet, drawn as chosen, while each theme paints its own accent (Basic Dark is blue). */
(function o55AccentThemeFirst() {
  const e = findSettingGlobal('accent'); if (!e || !e.setting || !Array.isArray(e.setting.options)) return;
  if (!e.setting.options.includes('Theme')) e.setting.options = ['Theme'].concat(e.setting.options);
  e.setting.value = 'Theme';
})();

/* ---------- choices that come from somewhere else ------------------------------------------------------------------- */
const o55PersonaChoices = () => (Array.isArray(state.personas) ? state.personas : []).map(p => ({ value: p.id, label: p.name, meta: p.locked ? 'Core' : p.group === 'Bundled' ? 'Bundled' : 'Yours' }));
['planning.interview.builder-intake-persona', 'planning.interview.builder-drafting-persona'].forEach(id => PM51.moreChoices(id, o55PersonaChoices));
/* Shell offered PowerShell, which Shells this project may use could not allow; every shell Shell offers can be allowed. */
PM51.moreChoices('code.terminal.allowed-profiles', () => {
  const f = findSettingGlobal('code.terminal.shell'), have = findSettingGlobal('code.terminal.allowed-profiles');
  const own = have ? (have.setting.options || []).map(String) : [];
  return (f ? (f.setting.options || []) : []).map(String).filter(x => !own.includes(x)).map(x => ({ value: x, label: x }));
});
PM51.moreChoices('code.execution.default-registry', () => {
  const list = PM51.value('code.execution.enterprise-registries');
  return (Array.isArray(list) ? list : []).map(x => String(typeof x === 'object' && x ? (x.host || x.name || '') : x)).filter(Boolean).map(x => ({ value: x, label: x, meta: 'Company registry' }));
});

/* ---------- small editors for rows that were a raw box ---------------------------------------------------------------- */
const o55PageToggle = (on, key, label) => `<button type="button" class="toggle ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" data-action="pm51-o55-flow-toggle" data-key="${a(key)}" aria-label="${a(label)}"></button>`;
const o55Commit = (id, value, what) => { const f = findSettingGlobal(id); if (!f || !commitSettingValue(id, value)) return false; saveState(); refreshSettingRow(id); showToast('Saved', `${PM51.rowLabel(f.setting)}: ${what}.`, 'success', 2400); return true; };
/* Reviewers for each round: one helper per review round, picked from the persona library. */
const O55_ROUNDS = [['round-1', 'First review'], ['round-2', 'Second review'], ['round-3', 'Final review']];
PM51.on('o55-review-rounds', () => {
  const id = 'planning.interview.builder-review-personas', cur = PM51.value(id) || {};
  const opts = [['', 'Choose for me']].concat(o55PersonaChoices().map(p => [p.value, p.label]));
  PM51.panel({ title: 'Reviewers for each round', eyebrow: 'Planning & Interviews', icon: 'users', summary: 'Each round of review reads the document again. Leave a round on Choose for me and a fitting reviewer is picked.',
    body: PM51.panelSection('Rounds', `<div class="o55-setup-fields">${O55_ROUNDS.map(([k, l]) => PM51.field(l, PM51.select(cur[k] || '', opts, { cls: 'o55-round', data: { key: k }, label: l }))).join('')}</div>`),
    primaryLabel: 'Save reviewers', onPrimary: w => {
      const v = {}; w.querySelectorAll('.o55-round').forEach(s => { if (s.value) v[s.dataset.key] = s.value; });
      o55Commit(id, v, Object.keys(v).length ? `${Object.keys(v).length} of 3 rounds chosen` : 'chosen for you');
    } });
});
/* Kubernetes logs start: one choice, stored under one key, like the other log streams. */
PM51.on('o55-k8s-logs', () => {
  const id = 'code.execution.k8s-log-defaults', cur = (PM51.value(id) || {}).start || '';
  const opts = [['', 'Same as other live logs'], ['following', 'Scrolling with new lines'], ['paused', 'Paused'], ['history', 'Show earlier lines first']];
  PM51.panel({ title: 'Kubernetes logs start', eyebrow: 'Containers', icon: 'list', size: 'narrow', summary: 'How the log viewer opens for a Kubernetes pod.',
    body: PM51.panelSection('Start', PM51.select(cur, opts, { cls: 'o55-k8slog', label: 'Kubernetes logs start' })),
    primaryLabel: 'Use this', onPrimary: w => { const v = w.querySelector('.o55-k8slog').value; o55Commit(id, v ? { start: v } : {}, (opts.find(o => o[0] === v) || opts[0])[1].toLowerCase()); } });
});
/* What agents may do in each cluster: one entry per cluster (the clusters Kubernetes cluster offers), the namespaces
   they may touch, and four switches. Stored as one readable line per cluster. */
const O55_K8S_ACTS = [['apply', 'Apply changes'], ['exec', 'Open a shell'], ['port-forward', 'Forward ports'], ['logs', 'Read logs']];
PM51.on('o55-k8s-policy', () => {
  const id = 'code.execution.k8s-host-policy', cur = PM51.value(id) || {};
  const ctx = findSettingGlobal('code.execution.k8s-context'), clusters = ctx ? o55Options(ctx.setting).filter(Boolean) : [];
  const parse = line => { const m = /^(.*?)(?: in (.*))?$/.exec(String(line || '')); return { acts: (m[1] || '').split(',').map(x => x.trim()).filter(x => O55_K8S_ACTS.some(a => a[0] === x)), ns: (m[2] || '').trim() }; };
  const block = c => { const p = cur[c] != null ? parse(cur[c]) : { acts: ['logs'], ns: '' };
    return PM51.panelSection(c, `<div class="o55-k8s-cluster" data-cluster="${a(c)}">${PM51.field('Namespaces', `<input class="text-control o55-k8s-ns" type="text" value="${a(p.ns)}" placeholder="All namespaces" autocomplete="off" spellcheck="false">`, 'Separate names with commas; empty means every namespace.')}${PM51.rows(O55_K8S_ACTS.map(([k, l]) => ({ label: l, control: o55PageToggle(p.acts.includes(k), k, `${l} in ${c}`) })))}</div>`); };
  PM51.panel({ title: 'What agents may do in each cluster', eyebrow: 'Containers', icon: 'shield', summary: 'A safety limit: agents cannot go past it, whatever their permissions say.',
    body: clusters.length ? clusters.map(block).join('') : PM51.note('No clusters found yet. Pick a Kubernetes cluster first.', 'info'),
    primaryLabel: clusters.length ? 'Save limits' : '', onPrimary: w => {
      const v = {};
      w.querySelectorAll('.o55-k8s-cluster').forEach(b => { const acts = [...b.querySelectorAll('.toggle.on')].map(t => t.dataset.key); const ns = b.querySelector('.o55-k8s-ns').value.trim(); v[b.dataset.cluster] = (acts.length ? acts.join(', ') : 'nothing') + (ns ? ` in ${ns}` : ''); });
      o55Commit(id, v, `${Object.keys(v).length} clusters`);
    } });
});
/* Setup fields: the ports, folders and options people fill in when they install the app, each with a kind, a name
   and a default. Stored as "Port · Web UI = 8080". */
PM51.on('o55-template-fields', () => {
  const id = 'code.execution.app-template-config-items';
  const list = () => (Array.isArray(PM51.value(id)) ? PM51.value(id) : []).slice();
  const wrap = PM51.panel({ title: 'Setup fields', eyebrow: 'Containers', icon: 'list', summary: 'What people fill in when they install your app from the Unraid store.', body: '', primaryLabel: '' });
  if (!wrap) return;
  const paint = () => {
    const items = list(), body = wrap.querySelector('.pm51-panel-body'); if (!body) return;
    body.innerHTML = PM51.panelSection('Fields', items.length ? PM51.rows(items.map((x, i) => ({ label: String(x).split(' = ')[0], help: String(x).includes(' = ') ? `Default: ${String(x).split(' = ').slice(1).join(' = ')}` : 'No default', control: PM51.iconBtn({ icon: 'trash', label: `Remove ${x}`, action: 'pm51-o55-template-remove', data: { i } }) }))) : PM51.note('No setup fields yet. Ports and folders from your compose file are suggested when you publish.', 'info'))
      + PM51.panelSection('Add a field', `<div class="o55-setup-fields">${PM51.field('Kind', PM51.select('Port', ['Port', 'Folder', 'Variable'], { cls: 'o55-tf-kind', label: 'Kind' }))}${PM51.field('Name', '<input class="text-control o55-tf-name" type="text" placeholder="For example: Web UI" autocomplete="off">')}${PM51.field('Default', '<input class="text-control o55-tf-def" type="text" placeholder="For example: 8080" autocomplete="off">')}</div><div class="pm51-mcp-actions">${PM51.btn({ label: 'Add field', icon: 'plus', small: true, action: 'pm51-o55-template-add' })}</div>`);
  };
  wrap._o55Paint = paint; paint();
});
PM51.on('o55-template-add', el => {
  const w = o55FlowWrapOf(el) || document; const name = (w.querySelector('.o55-tf-name') || {}).value || '';
  if (!name.trim()) { showToast('Name the field first', 'For example: Web UI.', 'info', 2400); return; }
  const id = 'code.execution.app-template-config-items', kind = w.querySelector('.o55-tf-kind').value, def = w.querySelector('.o55-tf-def').value.trim();
  const next = (Array.isArray(PM51.value(id)) ? PM51.value(id) : []).concat(`${kind} · ${name.trim()}${def ? ` = ${def}` : ''}`);
  if (commitSettingValue(id, next)) { saveState(); refreshSettingRow(id); const w2 = o55FlowWrapOf(el); if (w2 && w2._o55Paint) w2._o55Paint(); }
});
PM51.on('o55-template-remove', el => {
  const id = 'code.execution.app-template-config-items', i = Number(el.dataset.i);
  const next = (Array.isArray(PM51.value(id)) ? PM51.value(id) : []).filter((_, n) => n !== i);
  if (commitSettingValue(id, next)) { saveState(); refreshSettingRow(id); const w = o55FlowWrapOf(el); if (w && w._o55Paint) w._o55Paint(); }
});
/* Publisher picture: the stored value is how the picture is given (upload or link); the panel shows both ways. */
PM51.on('o55-publisher-picture', () => {
  const id = 'code.execution.maintainer-icon', how = PM51.value('code.execution.maintainer-icon') || 'Upload Image', s = PM51.s();
  PM51.panel({ title: 'Publisher picture', eyebrow: 'Containers', icon: 'image', size: 'narrow', summary: 'Shown next to your name in the Unraid store. A square picture works best.',
    body: PM51.panelSection('How', PM51.select(how, [['Upload Image', 'Upload a picture'], ['Image URL', 'Link to a picture']], { cls: 'o55-pic-how', label: 'How' }))
      + PM51.panelSection('Picture', PM51.field('Link or file', `<input class="text-control o55-pic-src" type="text" value="${a((s.o55Custom || {})[id] || '')}" placeholder="For example: https://example.com/me.png" autocomplete="off" spellcheck="false">`, 'Uploads are copied into the template repository when you publish.')),
    primaryLabel: 'Use this picture', onPrimary: w => {
      const src = w.querySelector('.o55-pic-src').value.trim(); if (!src) { showToast('Add a picture first', 'Paste a link or a file name.', 'info', 2400); return false; }
      s.o55Custom = s.o55Custom || {}; s.o55Custom[id] = src; o55Commit(id, w.querySelector('.o55-pic-how').value, src);
    } });
});

/* ---------- panels: no generic focus tag over a labelled field ------------------------------------------------------ */
/* Every field in a Settings panel has its label and help line right beside it; the shared hover/focus tag only said
   "Change this setting." and covered the heading above the field (the cluster name, say). Fields in panels are exempt,
   the panel's buttons keep their tags. Panels that repaint their body are covered by the observer. */
const o55ExemptFields = host => host.querySelectorAll('input, select, textarea').forEach(n => { if (!n.hasAttribute('data-pm-hover-exempt')) n.setAttribute('data-pm-hover-exempt', 'labelled-field'); });
const o55PanelOpen = PM51.panel;
PM51.panel = opts => {
  const wrap = o55PanelOpen(opts);
  if (wrap && wrap.querySelectorAll) {
    o55ExemptFields(wrap);
    if (typeof MutationObserver === 'function' && !wrap._o55Exempt) { wrap._o55Exempt = new MutationObserver(() => o55ExemptFields(wrap)); wrap._o55Exempt.observe(wrap, { childList: true, subtree: true }); }
  }
  return wrap;
};

/* ---------- the page index lists only groups that are showing -------------------------------------------------------- */
/* A group whose every row waits on a switch that is off steps aside (New crews start with, while crews are off); its
   page-index entry pointed at nothing. The index leaves it out until the switch is on. */
const o55IndexSections = continuousWorkspaceSections;
continuousWorkspaceSections = function (workspace) {
  const list = o55IndexSections(workspace);
  if (!Array.isArray(list) || typeof PM51.relevant !== 'function') return list;
  return list.filter(s => {
    const sec = pm51SectionObjects.get(s.id) || (workspace.sections || []).find(x => x.id === s.id);
    if (!sec || !Array.isArray(sec.settings) || !sec.settings.length) return true;
    return !sec.settings.every(st => (O55R[st.id] || {}).when && !PM51.relevant(st.id));
  });
};
