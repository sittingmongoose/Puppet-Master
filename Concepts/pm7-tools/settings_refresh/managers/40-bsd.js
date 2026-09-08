/* Back Seat Driver — own manager, built with the kit over the eight canonical settings. */
(function () {
  const ID = 'bsd';
  const KEY = 'back-seat-driver';
  const SID = k => 'safety.approvals.bsd-' + k;
  const found = k => findSettingGlobal(SID(k));
  const control = k => { const f = found(k); return f ? renderControl(f.setting, settingValue(f.setting)) : PM51.pill('Unavailable'); };
  const value = k => { const f = found(k); return f ? settingValue(f.setting) : undefined; };
  const setValue = (k, v) => { if (!commitSettingValue(SID(k), v)) return false; saveState(); return true; };
  const STAGE_MODES = ['Inherit', 'Off', 'Auto', 'On'];

  function stageSummary() {
    const st = PM51.s().bsd.stages || [];
    const on = st.filter(s => s[2] === 'Auto' || s[2] === 'On').length;
    return `${on} of ${st.length} on`;
  }

  function render() {
    const b = PM51.s().bsd;
    const mode = String(value('mode') || 'Auto');
    const body = [
      PM51.section({
        title: 'Back Seat Driver', help: 'It only advises. It never blocks your work.',
        body: PM51.rows([
          { label: 'Mode', help: 'Auto is recommended. It checks in at key moments.', control: PM51.segmented(mode, ['Off', 'Auto', 'On'], { action: 'pm51-bsd-mode', label: 'Back Seat Driver mode' }) },
          { label: 'Status', value: mode === 'Off' ? 'Off' : `${b.status} · checked ${b.lastCheck}`, pill: PM51.pill(mode === 'Off' ? 'Off' : b.status, mode === 'Off' ? 'off' : 'ready') }
        ])
      }),
      PM51.section({
        title: 'Who advises', help: 'Changing these starts a fresh advisor session.',
        body: PM51.rows([
          { label: 'Model', control: control('model') },
          { label: 'Persona', control: control('persona') }
        ])
      }),
      PM51.section({
        title: 'When to advise',
        body: PM51.rows([
          { label: 'Sensitivity', help: 'Quiet waits for clear problems. Proactive speaks up more often.', control: control('trigger-sensitivity') },
          { label: 'Catch-up delay', help: 'How long it waits before reading recent work.', control: control('catch-up-seconds') },
          { label: 'Cooldown', help: 'Turns to stay quiet after giving advice.', control: control('cooldown-turns') }
        ])
      }),
      PM51.section({
        title: 'Where it watches', help: 'Stages where the advisor may join in.',
        action: { label: 'Choose stages', action: 'pm51-bsd-stages', icon: 'sliders' },
        body: PM51.rows([{ label: 'Stages', value: stageSummary() }])
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Keep advisor transcript', help: 'Keeps what the advisor read and said, for review.', control: control('retain-transcript') },
          { label: 'Compact advisor memory when full', help: 'Fraction of its memory that triggers a tidy-up.', control: control('self-compact-threshold') },
          { label: 'Usage boundary', value: state.bsd.usageBoundary || 'Use included plans only' },
          { label: 'Fallback model', help: 'Used only when the chosen model is not available.', value: state.bsd.fallbackModel || 'Codex coding model', action: { label: 'Change', action: 'pm51-bsd-fallback' } }
        ]),
        PM51.section({ title: 'Recent findings', body: PM51.kv([['Held for you', String(b.findings.held)], ['Advice delivered', String(b.findings.delivered)], ['Severity scale', 'nit · concern · critical']]) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Setting keys', 'safety.approvals.bsd-mode · bsd-model · bsd-persona · bsd-trigger-sensitivity · bsd-catch-up-seconds · bsd-cooldown-turns · bsd-retain-transcript · bsd-self-compact-threshold'], ['Advisor session', 'Starts a new session when model, account, or persona changes'], ['Command', 'cmd.bsd.set (registered) · other cmd.bsd.* not yet registered']]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-bsd-diagnostics' }) + '</div>' })
      ].join(''))
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset Back Seat Driver defaults', action: 'pm51-bsd-reset' }, { label: 'How Back Seat Driver works', action: 'pm51-bsd-help' }] });
  }

  PM51.manager('bsd', { render });

  PM51.on('bsd-mode', el => { if (setValue('mode', ds(el, 'value'))) PM51.refresh(ID, { swap: false }); });
  PM51.on('bsd-stages', () => {
    const b = PM51.s().bsd;
    const rows = b.stages.map(([key, label, mode]) => ({ label, control: PM51.select(mode, STAGE_MODES, { action: 'pm51-bsd-stage', data: { key }, label }) }));
    PM51.panel({
      title: 'Where the advisor watches', subtitle: 'Inherit follows the mode above. Off, Auto, and On override it for that stage.',
      body: PM51.panelSection('Stages', PM51.rows(rows)),
      primaryLabel: 'Done', onPrimary: () => { PM51.refresh(ID, { swap: false }); }
    });
  });
  PM51.onChange('bsd-stage', el => {
    const b = PM51.s().bsd; const key = ds(el, 'key'); const stage = b.stages.find(s => s[0] === key); if (!stage) return;
    stage[2] = el.value;
    const bound = b.stages.filter(s => s[2] === 'Auto' || s[2] === 'On').map(s => s[0]);
    if (found('stage-bindings')) commitSettingValue(SID('stage-bindings'), bound);
    saveState();
  });
  PM51.on('bsd-fallback', el => {
    const choices = state.providers.filter(p => p.installed && p.signedIn && p.id !== 'free-models').flatMap(p => p.models.filter(m => m.enabled).map(m => m.name));
    PM51.panel({
      title: 'Fallback model', subtitle: 'Used only when the chosen advisor model is unavailable.',
      body: PM51.panelSection('Model', PM51.field('Fallback model', PM51.select(state.bsd.fallbackModel, choices.length ? choices : [state.bsd.fallbackModel], { action: 'pm51-bsd-fallback-pick' }))),
      primaryLabel: 'Save', onPrimary: wrap => { const sel = wrap.querySelector('select'); if (sel) state.bsd.fallbackModel = sel.value; PM51.refresh(ID, { swap: false }); }
    });
  });
  PM51.on('bsd-diagnostics', () => PM51.check({ title: 'Back Seat Driver diagnostics', steps: [
    { title: 'Settings readable', desc: 'All eight advisor settings resolved for this project' },
    { title: 'Advisor model reachable', desc: 'Checked through Providers & Accounts', status: 'Example', tone: 'info' },
    { title: 'Session epoch', desc: 'A fresh session starts when model, account, or persona changes', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('bsd-reset', () => PM51.confirm('Reset Back Seat Driver defaults?', 'Mode returns to Auto, the advisor to the default model and the Critical Advisor persona.', 'Reset', () => {
    ['mode', 'model', 'persona', 'trigger-sensitivity', 'catch-up-seconds', 'cooldown-turns', 'retain-transcript', 'self-compact-threshold'].forEach(k => { const f = found(k); if (f) restoreSettingDefault(f.setting.id); });
    PM51.s().bsd.stages.forEach(s => { s[2] = ['code', 'verify', 'gate', 'audit', 'certify'].includes(s[0]) ? 'Auto' : 'Inherit'; });
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Back Seat Driver reset', 'Defaults are back.');
  }));
  PM51.on('bsd-help', () => PM51.panel({
    title: 'How Back Seat Driver works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A second AI watches your work and speaks up when something looks off. It never edits, approves, or blocks anything by itself.</p>')
      + PM51.panelSection('Modes', PM51.kv([['Off', 'Never watches.'], ['Auto', 'Checks in at key moments, such as before risky steps or when it looks done.'], ['On', 'Checks in more often. It still cannot do anything on its own.']]))
      + PM51.panelSection('What you will see', '<p class="pm51-ps-text">Short findings in the chat, marked nit, concern, or critical. You decide what to do with them.</p>')
  }));
})();
