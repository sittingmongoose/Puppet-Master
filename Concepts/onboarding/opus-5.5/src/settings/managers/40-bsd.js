/* Back Seat Driver — a read-only advisor that watches your work and speaks up when something looks off.
   Composed over the nine canonical safety.approvals.bsd-* settings: Overview renders the engine's own
   rows through PM51.settingRows (Details buttons, engine change handlers, T49 pickers), Stages owns
   bsd-stage-bindings, Findings shows held / delivered / cleared advice exactly as
   Plans/Back_Seat_Driver.md §8 allows: a held finding is never surfaced as current advice. */
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
  const STAGE_OPTIONS = [{ value: 'Inherit', label: 'Inherit', meta: 'Follows Overview' }, 'Off', 'Auto', 'On'];
  const DEFAULT_AUTO = ['code', 'verify', 'gate', 'audit', 'certify'];
  const BOUNDARIES = ['Use included plans only', 'Allow metered usage', 'Ask each time'];
  const MODE_HELP = { Off: 'Not watching', Auto: 'Checks in at key moments', On: 'Watches continuously' };
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
  const stagesOn = b => b.stages.filter(s => s.mode === 'Auto' || s.mode === 'On').length;
  const boundKeys = b => b.stages.filter(s => s.mode === 'Auto' || s.mode === 'On').map(s => s.key);
  const modelLabel = () => { const v = value('model'); return typeof assistantRouteLabel === 'function' ? assistantRouteLabel(v) : (v && v !== 'Default' ? String(v) : 'Default model'); };
  const personaLabel = () => String(value('persona') || 'Critical Advisor');
  const findingsIn = (b, filter) => { const states = FILTER_STATES[filter] || null; return b.findings.filter(f => !states || states.includes(f.state)); };
  function commitBindings(b) { if (found('stage-bindings')) commitSettingValue(SID('stage-bindings'), boundKeys(b)); }
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
      { label: 'Mode', value: mode, help: MODE_HELP[mode] },
      { label: 'Status', value: off ? 'Off' : `${b.status} · checked ${b.lastCheck}`, tone: off ? 'off' : 'ready', help: off ? 'Not watching' : `${modelLabel()} · ${personaLabel()}` },
      { label: 'Findings', value: `${held} held · ${delivered} delivered`, help: held ? 'Held waits for a fresh check' : 'Nothing waiting' },
      { label: 'Stages on', value: `${on} of ${b.stages.length}`, help: inherit ? `${inherit} follow Overview` : 'Set per stage' }
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
    return [
      PM51.settingRows([SID('mode'), SID('model'), SID('persona')], {
        title: 'Advisor', help: 'It only advises. It never blocks your work. Changing the model or persona starts a fresh advisor session.', overrides: OVERRIDES
      }),
      PM51.settingRows([SID('trigger-sensitivity'), SID('catch-up-seconds'), SID('cooldown-turns')], {
        title: 'Timing', help: 'How readily it speaks up, how long it may catch up on recent work, and how long it stays quiet after advice.'
      }),
      PM51.settingRows([SID('retain-transcript'), SID('self-compact-threshold')], {
        title: 'Memory', help: 'What the advisor keeps of its own conversation. It never touches yours.'
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Usage boundary', help: 'How far the advisor may spend before it asks you.', control: PM51.dropdown(b.usageBoundary || BOUNDARIES[0], BOUNDARIES, { action: 'pm51-bsd-boundary', label: 'Usage boundary' }) },
          { label: 'Fallback model', help: 'Used only when the chosen advisor model is not available.', control: PM51.dropdown(fb.value, fb.options, { action: 'pm51-bsd-fallback-model', label: 'Fallback model', search: fb.options.length > 12, width: 240 }) }
        ]),
        PM51.section({
          title: 'Technical details',
          body: PM51.kv([
            ['Setting keys', 'safety.approvals.bsd-mode · bsd-model · bsd-persona · bsd-trigger-sensitivity · bsd-catch-up-seconds · bsd-cooldown-turns · bsd-retain-transcript · bsd-self-compact-threshold · bsd-stage-bindings'],
            ['Advisor session', 'A new session epoch starts when the model, account, or persona changes. Held findings are re-presented to the new session, never carried over as current advice.'],
            ['Severity scale', 'nit · concern · critical'],
            ['Finding states', 'held · emitted · cleared · closed'],
            ['Registered command', 'cmd.bsd.set'],
            ['Not yet registered', 'cmd.bsd.configure · cmd.bsd.finding.open · cmd.bsd.open_transcript']
          ]) + `<div class="pm51-bsd-actions">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-bsd-diagnostics' })}</div>`
        })
      ].join(''))
    ].join('');
  }

  /* ---------- Stages ------------------------------------------------------ */
  function renderStages() {
    const b = data(); const mode = modeValue();
    const rows = b.stages.map(st => ({
      label: st.label, help: st.desc, data: { stage: st.key },
      control: PM51.dropdown(st.mode, STAGE_OPTIONS, { action: 'pm51-bsd-stage', data: { key: st.key }, label: `${st.label} advisor mode` })
    }));
    const bound = boundKeys(b);
    return [
      PM51.section({ title: 'Where the advisor watches', help: 'Inherit follows the mode on Overview. Off, Auto, and On override it for that stage.', body: PM51.rows(rows) }),
      PM51.advanced(PM51.section({
        title: 'Stage bindings', help: 'What is stored under safety.approvals.bsd-stage-bindings. Inherit shows the mode it currently follows.',
        body: PM51.kv(b.stages.map(st => [st.label, st.mode === 'Inherit' ? `Inherit (${mode})` : st.mode]).concat([['Bound stages', bound.length ? bound.join(' · ') : 'None']]))
          + `<div class="pm51-bsd-actions">${PM51.btn({ label: 'Reset stages to default', small: true, icon: 'restore', action: 'pm51-bsd-stages-reset' })}</div>`
      }))
    ].join('');
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
    const body = `<div class="pm51-bsd-stats">${statsHtml()}</div>` + (tab === 'stages' ? renderStages() : tab === 'findings' ? renderFindings() : renderOverview());
    const quiet = [tab === 'overview' ? { label: 'Reset Back Seat Driver defaults', action: 'pm51-bsd-reset' } : null, { label: 'How Back Seat Driver works', action: 'pm51-bsd-help' }];
    /* data-pm51-placed="manual": this page composes its canonical rows itself, so the automatic
       inline-placement pass must not add them a second time. */
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet, cls: 'pm51-bsd pm51-placed-manual' })
      .replace('<div class="manager-page pm51-mgr', '<div data-pm51-placed="manual" class="manager-page pm51-mgr');
  }
  PM51.manager('bsd', { render });

  /* ---------- actions ----------------------------------------------------- */
  PM51.onChange('bsd-boundary', el => { state.bsd.usageBoundary = BOUNDARIES.includes(el.value) ? el.value : BOUNDARIES[0]; saveState(); });
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
  PM51.on('bsd-diagnostics', () => PM51.check({ title: 'Back Seat Driver diagnostics', steps: [
    { title: 'Settings readable', desc: 'All nine advisor settings resolved for this project' },
    { title: 'Advisor model reachable', desc: 'Checked through Providers & Accounts', status: 'Example', tone: 'info' },
    { title: 'Session epoch', desc: 'A fresh session starts when model, account, or persona changes', status: 'Example', tone: 'info' },
    { title: 'Held findings kept outside the transcript', desc: 'They survive advisor compaction and restart', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('bsd-reset', () => PM51.confirm('Reset Back Seat Driver defaults?', 'Mode returns to Auto, the advisor to the default model and the Critical Advisor persona, and the stages to their defaults. Findings are kept.', 'Reset', () => {
    KEYS.forEach(k => { const f = found(k); if (f) restoreSettingDefault(f.setting.id); });
    const b = data(); b.stages.forEach(s => { s.mode = DEFAULT_AUTO.includes(s.key) ? 'Auto' : 'Inherit'; });
    commitBindings(b); saveState(); refresh(); PM51.toast('Back Seat Driver reset', 'Defaults are back.');
  }));
  PM51.on('bsd-help', () => PM51.panel({
    title: 'How Back Seat Driver works', icon: 'eye', eyebrow: 'Back Seat Driver',
    summary: 'A second AI watches your work and speaks up when something looks off. It never edits, approves, or blocks anything by itself.',
    body: PM51.panelSection('Modes', PM51.kv([['Off', 'Never watches.'], ['Auto', 'Checks in at key moments, such as before risky steps or when work looks done.'], ['On', 'Checks in more often. It still cannot do anything on its own.']]), '', { icon: 'sliders' })
      + PM51.panelSection('Held, delivered, cleared', PM51.kv([['Held', 'Raised about work that may already have moved on. It waits for the advisor to check it against newer work.'], ['Delivered', 'Confirmed against current work and sent to chat as a short note marked nit, concern, or critical.'], ['Cleared', 'The advisor looked again and stayed silent, so you were never shown it.']]), 'A stale warning is never shown as current advice.', { icon: 'clock' })
      + PM51.panelSection('What you decide', '<p class="pm51-ps-text">Findings are suggestions. You choose what to do with them, and you can dismiss any of them.</p>', '', { icon: 'user' })
  }));
})();
