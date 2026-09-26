/* Back Seat Driver — a read-only advisor that watches your work and speaks up when something looks off.
   Composed over the nine canonical safety.approvals.bsd-* settings: Overview renders the engine's own
   rows through PM51.settingRows (Details buttons, engine change handlers, T49 pickers), Stages owns
   bsd-stage-bindings, Findings shows held / delivered / cleared advice exactly as
   Plans/Back_Seat_Driver.md §8 allows: a held finding is never surfaced as current advice.
   - Overview is one group: whether it watches, how readily it speaks, how long it stays quiet, how it talks, its
     model and whether it keeps its conversation. The model and persona are pickers (signed-in models, your
     personas), not text boxes. Catch-up and compaction are expert pacing under More options.
   - Stages stores what Plans/Back_Seat_Driver.md §23 says a binding is: each of the ten stages as
     inherit | off | auto | on ("code:auto"), not the older five-name list, so the list and the store agree.
   - planning.verification.back-seat-driver-mode is the same switch as the advisor's mode; it follows it. */
(function () {
  const ID = 'bsd';
  const KEY = 'back-seat-driver';
  const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'stages', label: 'Stages' }, { id: 'findings', label: 'Findings' }];
  const PREFIX = 'safety.approvals.bsd-';
  const SID = k => PREFIX + k;
  const KEYS = ['mode', 'model', 'persona', 'trigger-sensitivity', 'catch-up-seconds', 'cooldown-turns', 'retain-transcript', 'self-compact-threshold'];
  const found = k => findSettingGlobal(SID(k));
  const value = k => { const f = found(k); return f ? settingValue(f.setting) : undefined; };
  const OVERRIDES = { [SID('mode')]: { control: 'segmented' } };
  const STAGE_MODES = ['Inherit', 'Off', 'Auto', 'On'];
  const MODE_LABEL = { Off: 'Off', Auto: 'Auto', On: 'Always watching' };
  const stageOptions = mode => [{ value: 'Inherit', label: 'Same as Overview', meta: `Now ${MODE_LABEL[mode] || mode}` }, { value: 'Off', label: 'Off' }, { value: 'Auto', label: 'Auto', meta: 'At key moments' }, { value: 'On', label: 'Always watching' }];
  const TWIN = 'planning.verification.back-seat-driver-mode';
  const DEFAULT_AUTO = ['code', 'verify', 'gate', 'audit', 'certify'];
  const BOUNDARIES = [['Use included plans only', 'Only what my plans include'], ['Allow metered usage', 'May use pay-as-you-go'], ['Ask each time', 'Ask me each time']];
  const FIXTURE_BSD = () => (typeof D !== 'undefined' && D.bsd) || {};
  const MODE_HELP = { Off: 'Not watching', Auto: 'Checks in at key moments', On: 'Watches all the time' };
  const SEVERITY = {
    critical: { label: 'Critical', icon: 'alert' },
    concern: { label: 'Concern', icon: 'info' },
    nit: { label: 'Nit', icon: 'edit' }
  };
  const STATES = {
    held: { label: 'Held', tone: 'attention' },
    emitted: { label: 'Delivered', tone: 'ready' },
    cleared: { label: 'Cleared', tone: 'off' },
    closed: { label: 'Dismissed', tone: 'off' }
  };
  const FILTERS = [['all', 'All'], ['held', 'Held'], ['delivered', 'Delivered'], ['cleared', 'Cleared']];
  const FILTER_STATES = { all: null, held: ['held'], delivered: ['emitted'], cleared: ['cleared', 'closed'] };
  const EMPTY = {
    all: ['No findings yet', 'The advisor has not raised anything for this project.'],
    held: ['Nothing held', 'Held findings wait here until the advisor checks them against newer work.'],
    delivered: ['Nothing delivered', 'Advice the advisor confirmed and sent to chat appears here.'],
    cleared: ['Nothing cleared', 'Findings the advisor let go, or you dismissed, appear here.']
  };

  /* ---------- state shape: fixture, migration from the pass-1 shape ------ */
  const fixture = () => DATA.bsd || { status: 'Idle', lastCheck: 'just now', stages: [], findings: [] };
  function migrate(s) {
    const fx = fixture();
    if (!s.bsd || typeof s.bsd !== 'object' || Array.isArray(s.bsd)) s.bsd = clone(fx);
    const b = s.bsd;
    const stale = !Array.isArray(b.stages) || b.stages.length !== (fx.stages || []).length
      || b.stages.some(x => !x || Array.isArray(x) || typeof x.key !== 'string' || typeof x.desc !== 'string');
    if (stale) {
      const old = Array.isArray(b.stages) ? b.stages : [];
      const modeOf = key => { const prev = old.find(x => Array.isArray(x) ? x[0] === key : (x && x.key === key)); const m = prev ? (Array.isArray(prev) ? prev[2] : prev.mode) : null; return STAGE_MODES.includes(m) ? m : null; };
      b.stages = (fx.stages || []).map(st => Object.assign({}, st, { mode: modeOf(st.key) || st.mode }));
    }
    if (!Array.isArray(b.findings)) b.findings = clone(fx.findings || []);   // pass 1 stored {held, delivered} counts
    b.findings = b.findings.filter(f => f && typeof f === 'object' && f.id);
    b.findings.forEach(f => { if (!STATES[f.state]) f.state = 'closed'; if (!SEVERITY[f.severity]) f.severity = 'concern'; if (!Array.isArray(f.evidence)) f.evidence = []; });
    if (typeof b.status !== 'string') b.status = fx.status;
    if (typeof b.lastCheck !== 'string') b.lastCheck = fx.lastCheck;
    return b;
  }
  const data = () => migrate(PM51.s());
  const bsdOriginalEnsureStateShape = ensureStateShape;
  ensureStateShape = function () { bsdOriginalEnsureStateShape(); migrate(PM51.s()); };
  migrate(PM51.s());

  /* ---------- derived facts ---------------------------------------------- */
  const modeValue = () => { const m = String(value('mode') || 'Auto'); return MODE_HELP[m] ? m : 'Auto'; };
  const stageLabel = key => { const st = data().stages.find(s => s.key === key); return st ? st.label : humanize(key || ''); };
  /* a stage watches when its own choice, or Overview's for "Same as Overview", is not Off */
  const effective = s => s.mode === 'Inherit' ? modeValue() : s.mode;
  /* Off on Overview turns the whole advisor off ("Off disables it"); stage choices apply again when it is back on */
  const stagesOn = b => modeValue() === 'Off' ? 0 : b.stages.filter(s => effective(s) !== 'Off').length;
  const bindingList = b => b.stages.map(s => `${s.key}:${s.mode.toLowerCase()}`);
  function readBindings() {
    const v = value('stage-bindings'); if (!Array.isArray(v)) return null;
    const map = {}; v.forEach(x => { const m = /^([a-z]+):(inherit|off|auto|on)$/.exec(String(x)); if (m) map[m[1]] = m[2][0].toUpperCase() + m[2].slice(1); });
    return Object.keys(map).length ? map : null;
  }
  /* the store is the truth once it holds stage bindings; an older five-name list is replaced once by the stages shown */
  function syncBindings() {
    if (!found('stage-bindings')) return;
    const b = data(); const map = readBindings();
    if (map) { b.stages.forEach(s => { if (map[s.key]) s.mode = map[s.key]; }); return; }
    if (commitSettingValue(SID('stage-bindings'), bindingList(b))) saveState();
  }
  const modelLabel = () => { const v = value('model'); return typeof assistantRouteLabel === 'function' ? assistantRouteLabel(v) : (v && v !== 'Default' ? String(v) : 'Default model'); };
  const personaLabel = () => String(value('persona') || 'Critical Advisor');
  PM51.moreChoices(SID('model'), () => (PM51.readyModels ? PM51.readyModels() : []));
  PM51.moreChoices(SID('persona'), () => (state.personas || []).map(p => ({ value: p.name, label: p.name, meta: p.tone || '' })));
  PM51.moreChoices(SID('stage-bindings'), () => data().stages.flatMap(s => ['inherit', 'off', 'auto', 'on'].map(m => ({ value: `${s.key}:${m}`, label: `${s.label}: ${m === 'inherit' ? 'same as Overview' : m === 'on' ? 'always watching' : m}` }))));
  const findingsIn = (b, filter) => { const states = FILTER_STATES[filter] || null; return b.findings.filter(f => !states || states.includes(f.state)); };
  function commitBindings(b) { if (found('stage-bindings') && commitSettingValue(SID('stage-bindings'), bindingList(b))) o55Notify(SID('stage-bindings'), bindingList(b)); }
  function refresh() {
    const host = root.querySelector(`[data-continuous-workspace-body="${ID}"]`);
    const open = host ? [...host.querySelectorAll('details.pm51-advanced')].map(d => d.open) : [];
    PM51.refresh(ID, { swap: false });
    const again = root.querySelector(`[data-continuous-workspace-body="${ID}"]`);
    if (again) again.querySelectorAll('details.pm51-advanced').forEach((d, i) => { if (open[i]) d.open = true; });
  }

  PM51.style(`
#panel-settings .pm51-bsd .pm51-item-avatar .pm51-bsd-sev.is-critical { color: var(--k3-red); }
#panel-settings .pm51-bsd .pm51-item-avatar .pm51-bsd-sev.is-concern { color: var(--k3-amber); }
#panel-settings .pm51-bsd .pm51-item-avatar .pm51-bsd-sev.is-nit { color: var(--k3-text-3); }
#panel-settings .pm51-bsd .pm51-bsd-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-bsd .pm51-section-head > .pm51-seg { flex: 0 0 auto; }
#panel-settings .pm51-bsd-evidence { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
#panel-settings .pm51-bsd-evidence .pm51-tech { display: inline-block; max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
#panel-settings .pm51-bsd-sheet .pm51-kv { margin-top: 10px; }
`);

  /* ---------- stats strip (synced in place after engine row changes) ------ */
  function statsHtml() {
    const b = data(); const mode = modeValue(); const off = mode === 'Off';
    const held = b.findings.filter(f => f.state === 'held').length;
    const delivered = b.findings.filter(f => f.state === 'emitted').length;
    const on = stagesOn(b), inherit = b.stages.filter(s => s.mode === 'Inherit').length;
    return PM51.stats([
      { label: 'Status', value: off ? 'Off' : `${b.status} · checked ${b.lastCheck}`, tone: off ? 'off' : 'ready', help: off ? 'Not watching' : `${MODE_HELP[mode]} · ${personaLabel()}` },
      { label: 'Findings', value: `${held} held · ${delivered} delivered`, help: held ? 'Held waits for a fresh check' : 'Nothing waiting' },
      { label: 'Stages watched', value: `${on} of ${b.stages.length}`, help: off ? 'The advisor is off' : inherit ? `${inherit} follow Overview` : 'Each set on its own' }
    ]);
  }
  function syncStats() { const host = root.querySelector(`[data-pm51-manager="${ID}"] .pm51-bsd-stats`); if (host) host.innerHTML = statsHtml(); }

  /* Engine row refreshes (segmented mode, toggle) would re-render the canonical row without the
     presentation override and leave the stats stale; route bsd rows through the kit renderer. */
  const bsdOriginalRefreshSettingRow = refreshSettingRow;
  refreshSettingRow = function (id) {
    if (String(id).startsWith(PREFIX) && !(state.detailSetting === id || detailInspectorVisible)) {
      const el = root.querySelector(`#setting-${cssEscape(id)}`);
      if (el && el.closest(`[data-pm51-manager="${ID}"]`)) {
        saveState();
        const tpl = document.createElement('template'); tpl.innerHTML = PM51.settingRows([id], { overrides: OVERRIDES });
        const next = tpl.content.querySelector('.setting-row');
        if (next) el.replaceWith(next);
        syncStats();
        return;
      }
    }
    return bsdOriginalRefreshSettingRow(id);
  };

  /* ---------- Overview ---------------------------------------------------- */
  function fallbackOptions() {
    const b = state.bsd || {};
    /* the same signed-in models the advisor's own model picker offers */
    const opts = (state.providers || []).filter(p => p.installed && p.signedIn && p.id !== 'free-models')
      .flatMap(p => (p.models || []).filter(m => m.enabled).map(m => ({ value: `${p.id}::${m.id || m.name}`, label: m.name, group: p.name, icon: 'brain' })));
    let current = opts.find(o => o.label === b.fallbackModel && (!b.fallbackProvider || o.group === b.fallbackProvider)) || opts.find(o => o.label === b.fallbackModel);
    if (!current && b.fallbackModel) { current = { value: 'current::' + b.fallbackModel, label: b.fallbackModel, group: b.fallbackProvider || 'Current', icon: 'brain' }; opts.unshift(current); }
    if (!opts.length) opts.push({ value: 'none', label: 'No model available' });
    return { options: opts, value: current ? current.value : opts[0].value };
  }
  function renderOverview() {
    const b = state.bsd || {};
    const fb = fallbackOptions();
    const own = orow => `<div class="setting-row o55-row o55-scoped"><div class="setting-copy"><div class="setting-label">${h(orow.label)}</div><div class="setting-description">${h(orow.help)}</div></div><div class="setting-control">${orow.control}</div><span></span></div>`;
    const boundary = BOUNDARIES.some(x => x[0] === b.usageBoundary) ? b.usageBoundary : BOUNDARIES[0][0];
    return [
      /* the older planning copy of the same switch follows the mode row, so search for it lands here */
      PM51.home(TWIN, PM51.settingRows([SID('mode'), SID('trigger-sensitivity'), SID('cooldown-turns'), SID('persona'), SID('model'), SID('retain-transcript')], {
        title: 'Advisor', help: 'It only advises. It never blocks or changes your work. A new model or way of talking starts a fresh advisor conversation.', overrides: OVERRIDES
      })),
      PM51.advanced(PM51.settingRows([SID('catch-up-seconds'), SID('self-compact-threshold')])
        + `<div class="setting-list o55-bound-rows">${own({ label: 'Spending', help: 'How far the advisor may spend before it asks you.', control: PM51.dropdown(boundary, BOUNDARIES, { action: 'pm51-bsd-boundary', label: 'Spending' }) })}${own({ label: 'If its model is not available', help: 'Used only while the advisor\'s own model is down.', control: PM51.dropdown(fb.value, fb.options, { action: 'pm51-bsd-fallback-model', label: 'If its model is not available', search: fb.options.length > 12, width: 240 }) })}</div>`)
    ].join('');
  }

  /* ---------- Stages ------------------------------------------------------ */
  function renderStages() {
    const b = data(); const mode = modeValue();
    const rows = b.stages.map(st => ({
      label: st.label, help: st.desc, data: { stage: st.key },
      control: PM51.dropdown(st.mode, stageOptions(mode), { action: 'pm51-bsd-stage', data: { key: st.key }, label: `${st.label}: advisor` })
    }));
    return PM51.section({
      title: 'Where the advisor watches', help: `Each stage follows Overview (now ${MODE_LABEL[mode] || mode}) unless you choose something else for it.`,
      action: PM51.btn({ label: 'Reset stages', small: true, icon: 'restore', action: 'pm51-bsd-stages-reset' }),
      body: (mode === 'Off' ? PM51.note('The advisor is off on Overview, so no stage is watched. These choices apply again when you turn it back on.', 'info') : '') + PM51.home(SID('stage-bindings'), PM51.rows(rows))
    });
  }

  /* ---------- Findings ---------------------------------------------------- */
  function renderFindings() {
    const b = data(); const filter = FILTER_STATES[PM51.s().bsdFilter] !== undefined ? PM51.s().bsdFilter : 'all';
    const items = findingsIn(b, filter).map(f => {
      const sev = SEVERITY[f.severity] || SEVERITY.concern, st = STATES[f.state] || STATES.closed;
      return {
        title: f.title, meta: `${sev.label} · ${stageLabel(f.stage)} · ${f.raised || ''}`,
        avatar: icon(sev.icon, 'pm51-bsd-sev is-' + f.severity),
        end: PM51.status(st.label, st.tone) + icon('chevron'),
        action: 'pm51-bsd-finding', data: { id: f.id }
      };
    });
    const empty = EMPTY[filter] || EMPTY.all;
    return PM51.section({
      title: 'Findings', help: 'Held findings wait until the advisor checks them against newer work. Only reconfirmed advice is delivered to chat.',
      action: PM51.segmented(filter, FILTERS, { action: 'pm51-bsd-findings-filter', label: 'Show findings' }),
      body: items.length ? PM51.list(items) : PM51.empty(empty[0], empty[1])
    });
  }
  function nextCopy(f) {
    if (f.state === 'held') return 'It waits here. At the advisor’s next review it is checked against the newest work: if the advisor restates it, it is delivered to chat; if the advisor stays silent, it is cleared. You never see a held finding as current advice.';
    if (f.state === 'emitted') return `It was delivered to chat as advice${f.frozen ? ' at a stopped boundary, so no reconfirmation was needed' : ' after the advisor reconfirmed it against newer work'}. It stays here for reference. You decide what to do with it; the advisor cannot act on its own.`;
    if (f.state === 'cleared') return 'The advisor checked it against newer work and did not restate it, so it was cleared without being shown. Silence is the clearing signal.';
    return `${f.closedReason || 'Closed'}. It stays closed while the evidence is unchanged; new evidence may reopen it as a new finding.`;
  }
  function openFinding(id) {
    const f = data().findings.find(x => x.id === id); if (!f) return;
    const sev = SEVERITY[f.severity] || SEVERITY.concern, st = STATES[f.state] || STATES.closed;
    const n = Number(f.reconfirmations) || 0;
    const evidence = f.evidence.length ? `<ul class="pm51-bsd-evidence">${f.evidence.map(e => `<li>${PM51.tech(e)}</li>`).join('')}</ul>` : '<p class="pm51-ps-text">No evidence references were recorded.</p>';
    const history = PM51.kv([
      ['Raised', `${f.raised || '—'} · generation ${f.generation || '—'}`],
      f.delivered ? ['Delivered', f.delivered] : null,
      f.cleared ? ['Cleared', f.cleared] : null,
      f.closed ? ['Closed', `${f.closed} · ${f.closedReason || 'Closed'}`] : null,
      ['Reconfirmed', n === 1 ? 'Once' : `${n} times`],
      ['Finding id', f.id]
    ]);
    const opts = {
      title: f.title, eyebrow: 'Back Seat Driver finding', icon: sev.icon, cls: 'pm51-bsd-sheet',
      status: { label: st.label, tone: st.tone }, summary: f.claim,
      facts: [{ label: 'Severity', value: sev.label }, { label: 'Stage', value: stageLabel(f.stage) }, { label: 'Raised against', value: `Generation ${f.generation || '—'} · ${f.raised || ''}` }, { label: 'Reconfirmed', value: `${n}×` }],
      body: PM51.panelSection('Evidence', evidence, 'What the advisor pointed at when it raised this.', { icon: 'file' })
        + PM51.panelSection('What happens next', `<p class="pm51-ps-text">${h(nextCopy(f))}</p>` + history, '', { icon: 'clock' })
    };
    if (f.state === 'held') {
      opts.primaryLabel = 'Reconfirm now';
      opts.onPrimary = () => { PM51.toast('Reconfirmation requested', 'The advisor checks this against the newest work at its next review. It stays held until then. Example only: no advisor runs in this preview.', 'info'); return false; };
      opts.secondaryLabel = 'Dismiss';
      opts.onSecondary = () => { confirmDismiss(f.id); return true; };
    } else if (f.state === 'emitted') {
      opts.primaryLabel = 'Open in chat';
      opts.onPrimary = () => { PM51.unavailable('Open in chat', 'cmd.bsd.finding.open is not registered yet, so this preview cannot jump to the advice card.'); return false; };
      opts.secondaryLabel = 'Dismiss';
      opts.onSecondary = () => { confirmDismiss(f.id); return true; };
    }
    PM51.panel(opts);
  }
  function confirmDismiss(id) {
    PM51.confirm('Dismiss this finding?', 'It closes for you and stays closed unless the evidence changes. The advisor is not told it was wrong.', 'Dismiss', () => {
      const f = data().findings.find(x => x.id === id); if (!f) return;
      f.state = 'closed'; f.closedReason = 'Dismissed by you'; f.closed = 'Just now';
      saveState(); refresh(); PM51.toast('Finding dismissed', `${f.title} is closed.`);
    });
  }

  /* ---------- page -------------------------------------------------------- */
  function render() {
    const tab = PM51.tab(ID, 'overview');
    syncBindings(); syncTwin();
    const body = `<div class="pm51-bsd-stats">${statsHtml()}</div>` + (tab === 'stages' ? renderStages() : tab === 'findings' ? renderFindings() : renderOverview());
    const quiet = [{ label: 'How Back Seat Driver works', action: 'pm51-bsd-help' }, { label: 'Check the advisor', action: 'pm51-bsd-diagnostics' }, tab === 'overview' ? { label: 'Reset Back Seat Driver defaults', action: 'pm51-bsd-reset' } : null];
    /* data-pm51-placed="manual": this page composes its canonical rows itself, so the automatic
       inline-placement pass must not add them a second time. */
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet, cls: 'pm51-bsd pm51-placed-manual' })
      .replace('<div class="manager-page pm51-mgr', '<div data-pm51-placed="manual" class="manager-page pm51-mgr');
  }
  PM51.manager('bsd', { render });

  /* ---------- actions ----------------------------------------------------- */
  PM51.onChange('bsd-boundary', el => { state.bsd.usageBoundary = BOUNDARIES.some(x => x[0] === el.value) ? el.value : BOUNDARIES[0][0]; saveState(); PM51.toast('Saved', `Spending: ${BOUNDARIES.find(x => x[0] === state.bsd.usageBoundary)[1]}.`, 'success'); });
  /* one switch: the planning copy follows the advisor's mode (and the other way round when it is changed from Details) */
  function syncTwin() { const m = value('mode'); if (PM51.setting(TWIN) && PM51.value(TWIN) !== m && commitSettingValue(TWIN, m)) saveState(); }
  PM51.watch(SID('mode'), () => { syncTwin(); refresh(); });
  PM51.watch(TWIN, v => { if (MODE_HELP[v] && value('mode') !== v && commitSettingValue(SID('mode'), v)) { saveState(); refresh(); } });
  PM51.watch(SID('stage-bindings'), () => { syncBindings(); refresh(); });
  PM51.onChange('bsd-fallback-model', el => {
    const [pid, mid] = String(el.value || '').split('::');
    const p = (state.providers || []).find(x => x.id === pid); const m = p && (p.models || []).find(x => (x.id || x.name) === mid);
    if (m) { state.bsd.fallbackModel = m.name; state.bsd.fallbackProvider = p.name; saveState(); }
  });
  PM51.onChange('bsd-stage', el => {
    const b = data(); const st = b.stages.find(s => s.key === ds(el, 'key')); if (!st) return;
    st.mode = STAGE_MODES.includes(el.value) ? el.value : 'Inherit';
    commitBindings(b); saveState(); refresh();
  });
  PM51.on('bsd-stages-reset', () => {
    const b = data(); b.stages.forEach(s => { s.mode = DEFAULT_AUTO.includes(s.key) ? 'Auto' : 'Inherit'; });
    commitBindings(b); saveState(); refresh();
    PM51.toast('Stages reset', 'Code, verify, gate, audit, and certify are back on Auto. The rest follow Overview.');
  });
  PM51.on('bsd-findings-filter', el => { const f = ds(el, 'value'); PM51.s().bsdFilter = FILTER_STATES[f] !== undefined ? f : 'all'; refresh(); });
  PM51.on('bsd-finding', el => openFinding(ds(el, 'id')));
  PM51.on('bsd-diagnostics', () => PM51.check({ title: 'Back Seat Driver check', steps: [
    { title: 'Settings readable', desc: 'All nine advisor settings resolved for this project' },
    { title: 'Stages', desc: `${stagesOn(data())} of ${data().stages.length} watched · stored as ${bindingList(data()).slice(0, 3).join(', ')}…` },
    { title: 'Advisor model reachable', desc: 'Checked through Providers & Accounts', status: 'Example', tone: 'info' },
    { title: 'Session epoch', desc: 'A fresh session starts when model, account, or persona changes', status: 'Example', tone: 'info' },
    { title: 'Held findings kept outside the transcript', desc: 'They survive advisor compaction and restart', status: 'Example', tone: 'info' },
    { title: 'Commands', desc: 'cmd.bsd.set is registered; opening a finding in chat and the advisor transcript are not yet', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('bsd-reset', () => PM51.confirm('Reset Back Seat Driver defaults?', 'Mode returns to Auto, the advisor to the automatic model and the Critical Advisor persona, spending and its backup model to the example, and the stages to their defaults. Findings are kept.', 'Reset', () => {
    KEYS.forEach(k => { const f = found(k); if (f) restoreSettingDefault(f.setting.id); });
    const fx = FIXTURE_BSD(); ['usageBoundary', 'fallbackModel', 'fallbackProvider'].forEach(k => { if (fx[k] !== undefined) state.bsd[k] = fx[k]; });
    const b = data(); b.stages.forEach(s => { s.mode = DEFAULT_AUTO.includes(s.key) ? 'Auto' : 'Inherit'; });
    commitBindings(b); saveState(); refresh(); PM51.toast('Back Seat Driver reset', 'Defaults are back.');
  }));
  PM51.on('bsd-help', () => PM51.panel({
    title: 'How Back Seat Driver works', icon: 'eye', eyebrow: 'Back Seat Driver',
    summary: 'A second AI watches your work and speaks up when something looks off. It never edits, approves, or blocks anything by itself.',
    body: PM51.panelSection('Modes', PM51.kv([['Off', 'Never watches.'], ['Auto', 'Checks in at key moments, such as before risky steps or when work looks done.'], ['Always watching', 'Checks in all the time. It still cannot do anything on its own.']]), '', { icon: 'sliders' })
      + PM51.panelSection('Held, delivered, cleared', PM51.kv([['Held', 'Raised about work that may already have moved on. It waits for the advisor to check it against newer work.'], ['Delivered', 'Confirmed against current work and sent to chat as a short note marked nit, concern, or critical.'], ['Cleared', 'The advisor looked again and stayed silent, so you were never shown it.']]), 'A stale warning is never shown as current advice.', { icon: 'clock' })
      + PM51.panelSection('What you decide', '<p class="pm51-ps-text">Findings are suggestions. You choose what to do with them, and you can dismiss any of them.</p>', '', { icon: 'user' })
  }));
})();
