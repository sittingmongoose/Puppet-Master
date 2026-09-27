/* Browser & SCM — the built-in browser and what it relies on. No tabs (settings audit, 2026-09-27).
   - One screenshot switch: this page owns it and Testing shows it; the old per-page switch and Testing's copy were
     two answers to the same question.
   - How long captures are kept is Testing's evidence retention and what is hidden before saving is Permissions'
     screenshot redaction; both are shown here with a way to change them, not kept a second time.
   - "Point at things to share with chat" (you sending) sits next to "Helpers may see screenshots" (agents seeing),
     so the two sharing questions read as different ones. */
(function () {
  const ID = 'browser-scm';
  const KEY = 'browser-policy';
  const SHOTS = [['On failure', 'When something fails'], ['Always', 'Always'], ['Never', 'Never']];
  const RETAIN = 'branching.worktrees.evidence-retention-days', REDACT = 'safety.protection.screenshot-redaction';

  const b = () => { const x = PM51.s().browser; delete x.keepDays; delete x.capture; if (!x.share) x.share = 'Ask'; return x; };
  /* the screenshot choice is kept where Testing reads it */
  const shots = () => { const s = PM51.s(); if (!s.testing) s.testing = clone(DATA.testing); if (!s.testing.browser) s.testing.browser = {}; return s.testing.browser.screenshots || 'On failure'; };
  const setShots = v => { PM51.s().testing.browser.screenshots = v; };
  const txt = id => { const st = PM51.setting(id); return st ? PM51.valueText(st, PM51.value(id)) : 'Not set'; };
  const forges = () => (state.sourceControl || {}).forges || [];
  const tools = () => (state.sourceControl || {}).tools || [];
  const host = () => (((PM51.s().serverProject || {}).servers || []).find(s => s.default) || {}).name || 'Home TrueNAS';
  const refresh = () => PM51.refresh(ID, { swap: false });

  function render() {
    const x = b(); const ready = x.state === 'Ready';
    const gh = forges().find(f => f.status === 'active');
    const origin = forges().find(f => f.id === 'cursor-origin');
    const git = tools().find(t => t.id === 'git');
    const scSummary = `${gh ? `${gh.name} connected` : 'No code service connected'} · ${git && git.status === 'ready' ? 'Git ready' : 'Git not installed'}`;
    const body = [
      PM51.section({
        title: 'Built-in browser', help: 'The assistant opens it to look at pages, try interfaces, and collect evidence of what it saw.',
        body: PM51.rows([
          { label: 'Status', pill: PM51.pill(ready ? 'Ready' : 'Unavailable'), help: ready ? `Opens on demand on ${host()}. Nothing is running right now.` : `The browser could not start on ${host()}.`, action: { label: 'Check browser', icon: 'test', action: 'pm51-browser-check' } },
          { label: 'Screenshots for evidence', help: 'Kept with the run or chat that took them. Testing & Debug uses the same choice.', control: PM51.select(shots(), SHOTS, { action: 'pm51-browser-shots', label: 'Screenshots for evidence' }) },
          { label: 'Kept for', help: 'Set with the rest of the saved proof in Testing & Debug.', value: txt(RETAIN), action: { label: 'Change', icon: 'arrowRight', action: 'pm51-browser-reveal', data: { setting: RETAIN } } },
          { label: 'Hidden before saving', help: 'Set in Permissions, for every screenshot.', value: txt(REDACT), action: { label: 'Change', icon: 'arrowRight', action: 'pm51-browser-reveal', data: { setting: REDACT } } }
        ]) + PM51.bound.rows(['general.interaction.browser-capture']) + PM51.rows([
          { label: 'Helpers may see screenshots', help: 'Ask means you approve each time a helper wants to see one.', control: PM51.segmented(x.share, ['Ask', 'Never'], { action: 'pm51-browser-share', label: 'Helpers may see screenshots' }) }
        ])
      }),
      PM51.section({
        title: 'Depends on', help: 'Other parts of Puppet Master the browser works with.',
        body: PM51.rows([
          { label: 'Source Control', help: 'Where the browser finds the code it is testing.', value: scSummary, action: { label: 'Open Source Control', icon: 'arrowRight', action: 'pm51-go', data: { domain: 'source', workspace: 'source-manager' } } },
          { label: 'Cursor Origin', help: 'Optional. Lets the browser read and write Origin repositories.', value: origin && origin.status === 'active' ? `Connected as ${origin.defaultAccount}` : 'Not connected', muted: !(origin && origin.status === 'active'), action: { label: 'Open Source Control', icon: 'arrowRight', action: 'pm51-go', data: { domain: 'source', workspace: 'source-manager' } } },
          { label: 'Named Plans', help: 'The browser follows the plan it is verifying.', value: 'Managed in Planning Wizard', action: { label: 'Open Planning Wizard', icon: 'map', action: 'pm51-browser-wizard' } }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Capture policy', body: PM51.kv([['What is captured', 'Screenshots and short clips of pages the assistant opened'], ['Never captured', 'Sign-in pages, password fields, and anything you mark private'], ['Where they live', 'With the Goal or thread that made them'], ['Before saving', txt(REDACT)], ['Kept for', txt(RETAIN)]]) }),
        PM51.section({ title: 'Cursor Origin preview', body: PM51.kv([['What it adds', 'Read and write to Origin repositories from the browser flow'], ['Mirroring', 'Can mirror a GitHub repository'], ['Sign-in', 'Origin CLI in your own browser; the assistant never signs in for you'], ['Rollback', 'Every change is reversible']]) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Runtime state', ready ? 'Idle' : 'Unavailable'], ['Surface', 'Ordinary browser only; no native runtime'], ['Session', 'Ephemeral; not recorded'], ['Automation', 'Unavailable'], ['Runs on', host()], ['Slow pages', 'Captured once the page settles'], ['Low-resource mode', 'Stills only']]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-browser-diagnostics' }) + '</div>' })
      ].join(''))
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset browser defaults', action: 'pm51-browser-reset' }, { label: 'How the browser is used', action: 'pm51-browser-help' }] });
  }
  PM51.manager('browserScm', { render });

  PM51.on('browser-check', () => { const ready = b().state === 'Ready'; PM51.check({
    title: 'Check browser', subtitle: `On ${host()}. Example data only.`,
    steps: ready ? [
      { title: 'Browser engine present', desc: `Found on ${host()}` },
      { title: 'Opens a blank page', desc: 'Opens and closes in under a second', status: 'Example', tone: 'info' },
      { title: 'Capture folder writable', desc: 'Evidence can be saved', status: 'Example', tone: 'info' }
    ] : [{ title: 'Browser engine present', desc: `Not found on ${host()}`, status: 'Unavailable', tone: 'blocked' }],
    outcome: ready ? 'Checked · example data' : 'Unavailable', tone: ready ? 'info' : 'blocked'
  }); });
  PM51.onChange('browser-shots', el => { setShots(el.value); saveState(); PM51.toast('Saved', `Screenshots for evidence: ${(SHOTS.find(x => x[0] === el.value) || [0, el.value])[1]}.`); });
  PM51.on('browser-reveal', el => { if (PM51.revealSetting) PM51.revealSetting(ds(el, 'setting')); });
  [RETAIN, REDACT].forEach(id => PM51.watch(id, () => refresh()));
  PM51.on('browser-share', el => { b().share = ds(el, 'value'); saveState(); refresh(); });
  PM51.on('browser-wizard', () => { const tab = document.getElementById('tab-wizard'); if (tab) tab.click(); else PM51.unavailable('Open Planning Wizard', 'The Planning Wizard is not part of this preview.'); });
  PM51.on('browser-diagnostics', () => PM51.check({ title: 'Browser diagnostics', steps: [
    { title: 'Runtime state', desc: b().state === 'Ready' ? 'Idle, ready to open on demand' : 'Unavailable' },
    { title: 'Capture policy', desc: `Screenshots: ${(SHOTS.find(x => x[0] === shots()) || [0, shots()])[1].toLowerCase()} · helpers: ${String(b().share).toLowerCase()}` },
    { title: 'Source Control link', desc: `${forges().filter(f => f.status === 'active').length} code service connected`, status: 'Checked', tone: 'ready' },
  ] }));
  PM51.on('browser-reset', () => PM51.confirm('Reset browser defaults?', 'Screenshots and helper sharing go back to their defaults.', 'Reset', () => { PM51.s().browser = clone(DATA.browser); setShots('On failure'); saveState(); refresh(); PM51.toast('Browser defaults reset', 'Defaults are back.'); }));
  PM51.on('browser-help', () => PM51.panel({
    title: 'How the browser is used',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Puppet Master has a browser of its own. The assistant uses it to open pages, click through interfaces, and take screenshots as proof of what it saw. It never signs in on your behalf.</p>')
      + PM51.panelSection('Evidence', PM51.kv([['Screenshots', 'Kept with the work that produced them, for as long as Testing & Debug keeps proof.'], ['Sharing', 'Helpers only see captures when you allow it; you can point at things to send to chat.'], ['Privacy', 'Sign-in pages and password fields are never captured.']]))
      + PM51.panelSection('Works with', '<p class="pm51-ps-text">Source Control tells it which code to test, and the Planning Wizard tells it what the finished work should look like.</p>')
  }));
})();
