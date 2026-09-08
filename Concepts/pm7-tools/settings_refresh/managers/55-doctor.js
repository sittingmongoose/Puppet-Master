/* Readiness & Doctor — is everything ready? See what needs attention and fix it. */
(function () {
  const ID = 'doctor';
  const KEY = 'doctor';
  const STATES = ['Ready', 'Needs attention', 'Not set up', 'Unavailable'];
  const h = PM51.h, a = PM51.a;

  PM51.style(`
#panel-settings .pm51-doctor-row.is-focus { background: rgba(var(--accent-primary-rgb), .08); border-radius: 8px; margin: 0 -8px; padding-left: 8px; padding-right: 8px; }
#panel-settings .pm51-doctor-checked { font-size: 11.5px; color: var(--k3-text-3); white-space: nowrap; }
#panel-settings .pm51-doctor-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-doctor-evidence { margin-top: 10px; }
`);

  const groups = () => PM51.s().doctor.groups;
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const allFindings = () => groups().flatMap(g => g.findings.map(f => Object.assign({ group: g }, f)));
  const findFinding = (gid, fid) => { const g = groups().find(x => x.id === gid); const f = g && g.findings.find(x => x.id === fid); return f ? { g, f } : null; };
  const counts = () => { const c = { 'Ready': 0, 'Needs attention': 0, 'Not set up': 0, 'Unavailable': 0, 'Checking': 0 }; allFindings().forEach(f => { c[f.state] = (c[f.state] || 0) + 1; }); return c; };
  const tone = st => st === 'Ready' ? 'ready' : st === 'Needs attention' ? 'attention' : st === 'Unavailable' ? 'blocked' : st === 'Checking' ? 'info' : 'off';

  /* Where each fix goes. Returning to Doctor afterwards re-checks the same finding and keeps its place. */
  const FIX_ROUTES = {
    'devices:pairing': { domain: 'system', workspace: 'servers', tab: 'devices', open: 'pm51-servers-pair' },
    'devices:tailscale': { domain: 'system', workspace: 'servers', tab: 'away' },
    'ai:antigravity': { domain: 'ai', workspace: 'providers', provider: 'antigravity' },
    'code:push': { domain: 'source', workspace: 'source-manager' },
    'backups:kit': { domain: 'system', workspace: 'backup', tab: 'backup' },
    'updates:app': { domain: 'system', workspace: 'updates' },
    'optional:containers': { panel: 'containers' }
  };

  function recheck(gid, fid, done) {
    const hit = findFinding(gid, fid); if (!hit) return;
    const prior = hit.f.state; hit.f.state = 'Checking'; refresh();
    setTimeout(() => { const again = findFinding(gid, fid); if (!again) return; again.f.state = prior; again.f.checked = 'just now'; refresh(); if (done) done(again.f); }, 700);
  }
  function recheckGroup(gid, done) {
    const g = groups().find(x => x.id === gid); if (!g || g.checking) return;
    g.checking = true; const prior = g.findings.map(f => f.state); g.findings.forEach(f => { f.state = 'Checking'; }); refresh();
    setTimeout(() => { const again = groups().find(x => x.id === gid); if (!again) return; again.findings.forEach((f, i) => { f.state = prior[i]; f.checked = 'just now'; }); again.checking = false; PM51.s().doctorLastCheck = `${nowLabel()} · ${again.title}`; refresh(); if (done) done(); }, 700);
  }

  function findingRow(g, f) {
    const focus = !!(PM51.s().doctorReturn && PM51.s().doctorReturn.gid === g.id && PM51.s().doctorReturn.fid === f.id && returnArmed);
    const fix = f.fix && f.state !== 'Checking' && f.state !== 'Ready' ? PM51.btn({ label: f.fix, small: true, action: 'pm51-doctor-fix', data: { gid: g.id, fid: f.id } }) : (f.fix && f.state === 'Ready' && g.id === 'updates' ? PM51.btn({ label: f.fix, small: true, action: 'pm51-doctor-fix', data: { gid: g.id, fid: f.id } }) : '');
    return { label: f.title, pill: PM51.pill(f.state, tone(f.state)), id: `${g.id}:${f.id}`, cls: `pm51-doctor-row${focus ? ' is-focus' : ''}`, control: `<span class="pm51-doctor-checked">checked ${h(f.checked)}</span>${fix}${PM51.iconBtn({ icon: 'chevron', label: `Open ${f.title}`, action: 'pm51-doctor-open', data: { gid: g.id, fid: f.id } })}` };
  }

  function render() {
    const c = counts();
    const stats = PM51.stats([
      { label: 'Ready', value: String(c.Ready), tone: 'ready' },
      { label: 'Needs attention', value: String(c['Needs attention']), tone: c['Needs attention'] ? 'attention' : undefined },
      { label: 'Not set up', value: String(c['Not set up']) },
      { label: 'Unavailable', value: String(c.Unavailable), tone: c.Unavailable ? 'blocked' : undefined }
    ]);
    const sections = groups().map(g => PM51.section({
      title: g.title, help: g.help,
      action: { label: g.checking ? 'Checking…' : 'Check Again', icon: 'refresh', small: true, action: 'pm51-doctor-check', data: { gid: g.id }, disabled: !!g.checking, reason: 'A check is already running for this group.' },
      body: PM51.rows(g.findings.map(f => findingRow(g, f)))
    })).join('');
    const S = PM51.s();
    const advanced = PM51.advanced([
      PM51.section({ title: 'Run All Checks', help: 'Checks every group in turn. Takes a moment and never changes anything on its own.', body: `<div class="pm51-doctor-actions">${PM51.btn({ label: 'Run All Checks', small: true, icon: 'refresh', action: 'pm51-doctor-check-all', disabled: groups().some(g => g.checking), reason: 'A check is already running.' })}${PM51.btn({ label: 'Export redacted report', small: true, icon: 'download', action: 'pm51-doctor-export' })}${PM51.btn({ label: 'Copy diagnostics', small: true, icon: 'copy', action: 'pm51-doctor-copy' })}</div>` }),
      PM51.section({ title: 'Cached summary', body: PM51.kv([['Last check', S.doctorLastCheck || 'Loaded from cache · 2 min ago'], ['Findings cached', String(allFindings().length)], ['Oldest result', '2 h ago (Code & Version History)'], ['Cache age limit', 'Results older than a day are marked for a re-check']]) }),
      PM51.section({ title: 'Technical evidence', help: 'Details, logs, and receipts open on demand from each finding.', body: PM51.kv(allFindings().map(f => [`${f.group.title} · ${f.title}`, `${f.state} · checked ${f.checked}`])) })
    ].join(''));
    scheduleReturn();
    return PM51.page({ id: ID, key: KEY, body: stats + sections + advanced, quiet: [
      { label: 'Replay setup', action: 'replay-onboarding', data: { 'ui-action-id': 'settings.onboarding.run_again', 'source-surface': 'settings_rerun' } },
      { label: 'Guided Tour', action: 'start-guided-tour', data: { 'ui-action-id': 'settings.guided_tour.replay' } },
      { label: 'Export report', action: 'pm51-doctor-export' }
    ] });
  }
  PM51.manager('doctor', { render });

  /* After a fix returns here, re-check the same finding and keep focus and scroll on it.
     Same-domain navigation only scrolls (no re-render), so the return is also caught on navigate(). */
  let returnArmed = null;
  function scheduleReturn() {
    const S = PM51.s(); const ret = S.doctorReturn; if (!ret) return;
    if (state.domain !== 'system' || state.workspace !== 'doctor') return;
    const key = ret.gid + ':' + ret.fid; if (returnArmed === key) return; returnArmed = key;
    setTimeout(() => {
      const row = root.querySelector(`[data-pm51-manager="doctor"] [data-row="${cssEscape(key)}"]`);
      if (row) { try { row.scrollIntoView({ block: 'center' }); } catch (_e) {} const btn = row.querySelector('button'); if (btn) btn.focus(); }
      recheck(ret.gid, ret.fid, () => { const s = PM51.s(); if (s.doctorReturn && s.doctorReturn.gid === ret.gid && s.doctorReturn.fid === ret.fid) { s.doctorReturn = null; saveState(); } returnArmed = null; });
    }, 160);
  }
  const doctorOriginalNavigate = navigate;
  navigate = function (domainId, workspaceId, options = {}) {
    const result = doctorOriginalNavigate(domainId, workspaceId, options);
    if (workspaceId === 'doctor' && PM51.s().doctorReturn) setTimeout(scheduleReturn, 250);
    return result;
  };

  function findingPanel(gid, fid) {
    const hit = findFinding(gid, fid); if (!hit) return; const { g, f } = hit;
    const summary = f.state === 'Ready' ? `${f.title}. Nothing to do.` : f.impact || 'Needs a look.';
    const evidence = kind => kind === 'details' ? PM51.kv([['Group', g.title], ['Finding', f.title], ['State', f.state], ['Checked', f.checked], ['How it is checked', g.id === 'server' ? 'The app calls the server and compares its identity with the saved one.' : g.id === 'devices' ? 'Pairing codes and routes are read from the server.' : g.id === 'ai' ? 'Each service is asked for its sign-in state.' : g.id === 'code' ? 'Git, Jujutsu, and the code service are asked what they can do.' : g.id === 'backups' ? 'The latest backup receipt and the Recovery Kit record are read.' : g.id === 'updates' ? 'The release list is compared with the installed version.' : 'The app asks the operating system what is available.']])
      : kind === 'logs' ? `<div class="pm51-servers-conf">${h(`[${f.checked}] check ${g.id}/${f.id}\n[${f.checked}] result: ${f.state}\n[${f.checked}] ${f.impact || 'no action needed'}\n(redacted example log)`)}</div>`
      : PM51.kv([['Receipt', `doctor-${g.id}-${f.id}`], ['Issued', f.checked], ['Result', f.state], ['Signed by', 'Home TrueNAS']]);
    const evidenceButtons = `<div class="pm51-doctor-actions">${['details', 'logs', 'receipt'].map(k => PM51.btn({ label: k === 'details' ? 'Details' : k === 'logs' ? 'Logs' : 'Receipt', small: true, action: 'pm51-doctor-evidence', data: { gid, fid, kind: k } })).join('')}</div><div class="pm51-doctor-evidence" data-doctor-evidence></div>`;
    const wrap = PM51.panel({
      title: f.title, subtitle: `${g.title} · checked ${f.checked}`, pill: PM51.pill(f.state, tone(f.state)),
      body: PM51.panelSection('Summary', `<p class="pm51-ps-text">${h(summary)}</p>`)
        + (f.state !== 'Ready' || f.todo ? PM51.panelSection('What to do', `<p class="pm51-ps-text">${h(f.todo || 'Nothing. This is working.')}</p>`) : '')
        + PM51.panelSection('On demand', evidenceButtons),
      primaryLabel: f.fix && f.state !== 'Ready' ? f.fix : (f.fix && g.id === 'updates' ? f.fix : ''),
      onPrimary: f.fix && (f.state !== 'Ready' || g.id === 'updates') ? () => { runFix(gid, fid); } : null,
      secondaryLabel: 'Check this again', onSecondary: () => { recheck(gid, fid); return true; }
    });
    wrap._pmEvidence = { gid, fid, evidence };
  }

  function runFix(gid, fid) {
    const route = FIX_ROUTES[`${gid}:${fid}`]; const hit = findFinding(gid, fid); if (!hit) return;
    const S = PM51.s();
    if (!route) { PM51.unavailable(hit.f.fix || 'This fix', 'There is no owner for this fix in the preview yet.'); return; }
    if (route.panel === 'containers') {
      PM51.panel({ title: 'Set up a container engine', subtitle: 'Optional. Lets container-based work run on this computer instead of the server.', body: PM51.panelSection('Steps', PM51.steps([{ title: 'Install Docker Desktop or Podman', desc: 'From their official download pages.' }, { title: 'Start it once', desc: 'So it can finish its own setup.' }, { title: 'Check again here', desc: 'Doctor notices it on the next check.' }])) + PM51.note('Until then, container work runs on your home server. Nothing is broken.', 'info'), primaryLabel: 'Check again', onPrimary: () => recheck(gid, fid) });
      return;
    }
    S.doctorReturn = { gid, fid }; returnArmed = null; saveState();
    if (route.tab) PM51.setTab(route.workspace, route.tab);
    if (route.provider && typeof selectProviderView === 'function') { try { selectProviderView(route.provider, undefined, true); } catch (_e) { PM51.go(route.domain, route.workspace); } }
    else PM51.go(route.domain, route.workspace);
    if (route.open) setTimeout(() => { try { dispatchAction(route.open, null, null); } catch (_e) {} }, 350);
    PM51.toast('Come back to Doctor when done', `${hit.f.title} is re-checked when you return.`, 'info');
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('doctor-check', el => recheckGroup(ds(el, 'gid')));
  PM51.on('doctor-check-all', () => {
    const ids = groups().map(g => g.id); let i = 0;
    const next = () => { if (i >= ids.length) { PM51.s().doctorLastCheck = `${nowLabel()} · all groups`; refresh(); PM51.toast('All checks finished', 'Example data only. Every group was re-read from the cache.', 'info'); return; } recheckGroup(ids[i++], next); };
    next();
  });
  PM51.on('doctor-open', el => findingPanel(ds(el, 'gid'), ds(el, 'fid')));
  PM51.on('doctor-fix', el => runFix(ds(el, 'gid'), ds(el, 'fid')));
  PM51.on('doctor-evidence', el => {
    const wrap = el.closest('.pm51-drawer-wrap'); const ev = wrap && wrap._pmEvidence; if (!ev) return;
    const holder = wrap.querySelector('[data-doctor-evidence]'); if (holder) holder.innerHTML = ev.evidence(ds(el, 'kind'));
  });
  PM51.on('doctor-export', () => PM51.toast('Report prepared', 'Example data only. A redacted readiness report would be saved as a file.', 'info'));
  PM51.on('doctor-copy', () => {
    const text = groups().map(g => `${g.title}\n` + g.findings.map(f => `  - ${f.title}: ${f.state} (checked ${f.checked})`).join('\n')).join('\n');
    try { const p = navigator.clipboard && navigator.clipboard.writeText(text); if (p && p.catch) p.catch(() => {}); } catch (_e) {}
    PM51.toast('Diagnostics copied', 'A short, secret-free summary is on your clipboard.', 'info');
  });
})();
