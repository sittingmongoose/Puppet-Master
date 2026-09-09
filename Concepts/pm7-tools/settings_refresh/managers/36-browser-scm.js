/* Browser & SCM — the built-in browser and what it relies on. No tabs. */
(function () {
  const ID = 'browser-scm';
  const KEY = 'browser-policy';
  const KEEP = [['7', '7 days'], ['30', '30 days'], ['90', '90 days'], ['0', 'Until I delete them']];

  const b = () => { const x = PM51.s().browser; if (x.keepDays == null) x.keepDays = 30; if (!x.share) x.share = 'Ask'; return x; };
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
          { label: 'Capture screenshots for evidence', help: 'Saved with the work that produced them.', control: PM51.toggle(!!x.capture, { action: 'pm51-browser-capture', label: 'Capture screenshots for evidence' }) },
          { label: 'Keep captures for', help: 'Older captures are deleted on their own.', control: PM51.select(String(x.keepDays), KEEP, { action: 'pm51-browser-keep', label: 'Keep captures for' }) },
          { label: 'Share captures with agents', help: 'Ask means you approve each time a helper wants to see one.', control: PM51.segmented(x.share, ['Ask', 'Never'], { action: 'pm51-browser-share', label: 'Share captures with agents' }) }
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
        PM51.section({ title: 'Capture policy', body: PM51.kv([['What is captured', 'Screenshots and short clips of pages the assistant opened'], ['Never captured', 'Sign-in pages, password fields, and anything you mark private'], ['Where they live', 'With the Goal or thread that made them'], ['Before saving', 'Secrets are blurred'], ['Kept for', x.keepDays === 0 || x.keepDays === '0' ? 'Until you delete them' : `${x.keepDays} days`]]) }),
        PM51.section({ title: 'Cursor Origin preview', body: PM51.kv([['What it adds', 'Read and write to Origin repositories from the browser flow'], ['Mirroring', 'Can mirror a GitHub repository'], ['Sign-in', 'Origin CLI in your own browser; the assistant never signs in for you'], ['Rollback', 'Every change is reversible']]) }),
        PM51.section({ title: 'Performance notes', body: PM51.kv([['Frame pacing', '16.7 ms per frame at 60 frames per second'], ['Slow pages', 'The assistant waits for the page to settle before capturing'], ['Low-resource mode', 'Captures drop to stills only'], ['Reporting', 'Typical, slow, and slowest frames, plus any delayed ones']]) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Runtime state', ready ? 'Idle' : 'Unavailable'], ['Surface', 'Ordinary browser only; no native runtime'], ['Session', 'Ephemeral; not recorded'], ['Automation', 'Unavailable'], ['Runs on', host()]]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-browser-diagnostics' }) + '</div>' })
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
  PM51.on('browser-capture', () => { const x = b(); x.capture = !x.capture; saveState(); refresh(); });
  PM51.onChange('browser-keep', el => { b().keepDays = Number(el.value); saveState(); refresh(); });
  PM51.on('browser-share', el => { b().share = ds(el, 'value'); saveState(); refresh(); });
  PM51.on('browser-wizard', () => { const tab = document.getElementById('tab-wizard'); if (tab) tab.click(); else PM51.unavailable('Open Planning Wizard', 'The Planning Wizard is not part of this preview.'); });
  PM51.on('browser-diagnostics', () => PM51.check({ title: 'Browser diagnostics', steps: [
    { title: 'Runtime state', desc: b().state === 'Ready' ? 'Idle, ready to open on demand' : 'Unavailable' },
    { title: 'Capture policy', desc: `${b().capture ? 'Capturing' : 'Not capturing'} · shared with agents: ${String(b().share).toLowerCase()}` },
    { title: 'Source Control link', desc: `${forges().filter(f => f.status === 'active').length} code service connected`, status: 'Checked', tone: 'ready' },
    { title: 'Frame pacing', desc: 'Measured when the browser next opens', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('browser-reset', () => PM51.confirm('Reset browser defaults?', 'Capture, retention, and sharing go back to their defaults.', 'Reset', () => { PM51.s().browser = clone(DATA.browser); saveState(); refresh(); PM51.toast('Browser defaults reset', 'Defaults are back.'); }));
  PM51.on('browser-help', () => PM51.panel({
    title: 'How the browser is used',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Puppet Master has a browser of its own. The assistant uses it to open pages, click through interfaces, and take screenshots as proof of what it saw. It never signs in on your behalf.</p>')
      + PM51.panelSection('Evidence', PM51.kv([['Screenshots', 'Kept with the work that produced them, for as long as you choose.'], ['Sharing', 'Helpers only see captures when you allow it.'], ['Privacy', 'Sign-in pages and password fields are never captured.']]))
      + PM51.panelSection('Works with', '<p class="pm51-ps-text">Source Control tells it which code to test, and the Planning Wizard tells it what the finished work should look like.</p>')
  }));
})();
