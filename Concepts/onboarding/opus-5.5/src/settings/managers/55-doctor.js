/* Readiness & Doctor — is everything ready? See what needs attention and fix it. */
(function () {
  const ID = 'doctor';
  const KEY = 'doctor';
  const STATES = ['Ready', 'Needs attention', 'Not set up', 'Unavailable'];
  const h = PM51.h, a = PM51.a;

  PM51.style(`
#panel-settings .pm51-doctor-row.is-focus { background: rgba(var(--accent-primary-rgb), .08); border-radius: 8px; margin: 0 -8px; padding-left: 8px; padding-right: 8px; }
#panel-settings .pm51-doctor-checked { font-size: 11.5px; color: var(--k3-text-3); white-space: nowrap; }
#panel-settings .pm51-doctor-wait { display: inline-flex; align-items: center; }
#panel-settings .pm51-doctor-wait > .pml-ld { --pml-size: 14px; }
#panel-settings .pm51-doctor-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-doctor-evidence { margin-top: 10px; }
`);

  /* S6/R12: a finding about something another page owns reads that page's state each time, so Doctor and the page
     can never disagree (the saved list said "Antigravity CLI signed out" and "GitHub push access missing" while the
     provider list and Source Control said Ready). A finding being re-checked keeps its Checking state. */
  const provider = ids => (state.providers || []).find(p => ids.includes(p.id));
  const svcName = p => PM51.serviceName ? PM51.serviceName(p.name) : p.name;
  const providerFinding = p => {
    if (!p) return null;
    const n = svcName(p);
    if (p.status === 'active') return { title: `${n} ready`, state: 'Ready', fix: null, todo: null, impact: null };
    if (p.status === 'disabled') return { title: `${n} turned off`, state: 'Not set up', fix: 'Open', todo: `Turn ${n} on under Providers & Accounts if you want it.`, impact: `Work does not go to ${n} while it is off.` };
    if (p.status === 'not-installed') return { title: `${n} not installed`, state: 'Not set up', fix: 'Open', todo: `Install ${n} from Providers & Accounts.`, impact: `Work routed to ${n} falls back to another service.` };
    /* the step Providers itself names (window.O55ProviderAttention: a seat, a sign-in, an account or a model to turn on),
       so Doctor and the service's page say the same thing */
    let kind = '';
    try { const rows = typeof window.O55ProviderAttention === 'function' ? window.O55ProviderAttention() : []; kind = ((rows || []).find(r => (r.ids || []).includes(p.id)) || {}).kind || ''; } catch (_e) { kind = ''; }
    if (kind === 'seat') return { title: `${n} has no active seat`, state: 'Needs attention', fix: 'Open', todo: `Give its account a seat, or use another account, under Providers & Accounts.`, impact: `Work routed to ${n} falls back to another service.` };
    if (kind === 'account') return { title: `${n} has no account in use`, state: 'Needs attention', fix: 'Open', todo: `Turn on one of its accounts under Providers & Accounts.`, impact: `Work routed to ${n} falls back to another service.` };
    if (kind === 'models') return { title: `${n} has no model turned on`, state: 'Needs attention', fix: 'Open', todo: `Turn on at least one of its models under Providers & Accounts.`, impact: `Work routed to ${n} falls back to another service.` };
    if (kind === 'signin' || !p.signedIn) return { title: `${n} signed out`, state: 'Needs attention', fix: 'Sign In Again', todo: `Sign in to ${n} from Providers & Accounts.`, impact: `Work routed to ${n} falls back to another service.` };
    return { title: `${n} needs attention`, state: 'Needs attention', fix: 'Open', todo: `Open ${n} under Providers & Accounts to see what it needs.`, impact: `Work routed to ${n} may fall back to another service.` };
  };
  const OWNED = {
    'ai:antigravity': () => providerFinding(provider(['antigravity'])),
    'ai:claude': () => providerFinding(provider(['claude-code', 'claude'])),
    'code:push': () => {
      const f = ((state.sourceControl || {}).forges || []).find(x => x.id === 'github'); if (!f) return null;
      if (f.status !== 'active') return { title: 'GitHub not connected', state: 'Not set up', fix: 'Connect GitHub', todo: 'Connect GitHub from Source Control.', impact: 'Changes cannot be sent to GitHub.' };
      if (f.pushAccess === 'Ready') return { title: 'GitHub push access ready', state: 'Ready', fix: null, todo: null, impact: null };
      return { title: 'GitHub push access missing', state: 'Needs attention', fix: 'Set Up Push Access', todo: 'Set up push access from Source Control.', impact: 'Changes can be read from GitHub but not pushed.' };
    },
    'backups:kit': () => {
      const B = PM51.s().backup, k = B && B.recoveryKit; if (!k) return null;
      if (k.tested) return { title: 'Recovery Kit tested', state: 'Ready', fix: null, todo: null, impact: null };
      if (k.saved) return { title: 'Recovery Kit not tested', state: 'Needs attention', fix: 'Test Recovery Kit', todo: 'Run the Recovery Kit test from Backup & Restore.', impact: 'You have a kit, but it has never been proven to unlock a backup.' };
      return { title: 'Recovery Kit not saved', state: 'Not set up', fix: 'Save Recovery Kit', todo: 'Save the Recovery Kit from Backup & Restore.', impact: 'Without the kit, a lost server means lost backups.' };
    }
  };
  /* FO-162 (Jared, card Q5 B): the checkup is grouped in the five areas "What is checked" lists
     (system.health.check-scope: AI providers, Storage, Sign-ins, Performance, Dependencies), named by that row's own
     labels. A check keeps its permanent id (`check`, N2-151: check IDs are permanent identities) wherever its area is;
     the row key, the fix route, the owner read and the return after a fix all use it. */
  const SCOPE = 'system.health.check-scope';
  const AREA_IDS = ['ai', 'storage', 'signins', 'performance', 'dependencies'];
  const checkOf = (g, f) => f.check || `${g.id}:${f.id}`;
  const areaTitle = g => (g.area && PM51.valueLabel ? PM51.valueLabel(SCOPE, g.area) : g.area) || g.title || g.id;

  /* Performance holds only what this computer really measures. The GPU is read from this window's own graphics
     driver: the desktop app draws with Skia on the GPU, or on the processor without one (DL-139), and local media
     generation needs one. A software renderer (SwiftShader, llvmpipe, Microsoft Basic Render) means no GPU in use. */
  let gpuRead = null;
  const SOFT_GPU = /swiftshader|llvmpipe|softpipe|lavapipe|software|basic render|microsoft basic/i;
  const gpuName = raw => {
    let s = String(raw || '').trim(); const m = /^ANGLE \((.*)\)$/.exec(s);
    if (m) { const parts = m[1].split(', '); s = parts.length > 1 ? parts[1] : parts[0]; }
    return s.replace(/^ANGLE \w+ Renderer:\s*/i, '').replace(/\s*\(0x[0-9a-f]+\)/ig, '').replace(/\s+(?:Direct3D|OpenGL|Vulkan|Metal).*$/i, '').replace(/,.*$/, '').trim();
  };
  function probeGpu() {
    let raw = '';
    try {
      const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        raw = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
        const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
      }
    } catch (_e) { raw = ''; }
    const soft = SOFT_GPU.exec(raw);
    gpuRead = { raw, name: soft ? soft[0] : gpuName(raw), ok: !!raw && !soft, at: Date.now() };
    return gpuRead;
  }
  const ago = at => { const m = Math.floor((Date.now() - at) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`; };
  const PROBES = {
    gpu: () => {
      const r = gpuRead || probeGpu();
      return r.ok
        ? { title: 'GPU ready', state: 'Ready', checked: ago(r.at), measured: r.name || 'A graphics card', fix: null, todo: null, impact: null }
        : { title: 'No GPU in use', state: 'Unavailable', checked: ago(r.at), measured: r.raw ? `${r.name} (software drawing)` : 'No graphics driver answered', fix: null, todo: 'No action needed.', impact: 'The app draws with the processor, and local media generation uses the server.' };
    }
  };
  const runProbe = f => { if (f && f.probe === 'gpu') probeGpu(); };

  /* A save from before FO-162 holds the seven old groups: each check keeps its own result and moves to its area. */
  function fiveAreas() {
    const D = PM51.s().doctor;
    if (Array.isArray(D.groups) && D.groups.map(g => g.id).join() === AREA_IDS.join()) return D.groups;
    const saved = {};
    (D.groups || []).forEach(g => (g.findings || []).forEach(f => { saved[checkOf(g, f)] = f; }));
    D.groups = clone(DATA.doctor.groups);
    D.groups.forEach(g => g.findings.forEach(f => {
      const old = saved[f.check]; if (!old || f.probe) return;
      ['title', 'state', 'checked'].forEach(k => { if (old[k] != null && !(k === 'state' && old[k] === 'Checking')) f[k] = old[k]; });
    }));
    return D.groups;
  }
  const syncOwned = G => {
    (G || []).forEach(g => {
      g.title = areaTitle(g);
      (g.findings || []).forEach(f => {
        const read = f.probe ? PROBES[f.probe] : OWNED[checkOf(g, f)]; if (!read || f.state === 'Checking') return;
        let now = null; try { now = read(); } catch (_e) { now = null; }
        if (now) Object.assign(f, now);
      });
    });
    return G;
  };
  const groups = () => syncOwned(fiveAreas());
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const allFindings = () => groups().flatMap(g => g.findings.map(f => Object.assign({ group: g }, f)));
  const findFinding = check => { for (const g of groups()) { const f = g.findings.find(x => checkOf(g, x) === check); if (f) return { g, f }; } return null; };
  /* Only the App Updates finding offers its button while Ready (an optional update is not a problem). */
  const FIX_WHEN_READY = new Set(['updates:app']);
  const offersFix = (g, f) => !!f.fix && f.state !== 'Checking' && (f.state !== 'Ready' || FIX_WHEN_READY.has(checkOf(g, f)));
  const HOW = {
    server: 'The app calls the server and compares its identity with the saved one.',
    devices: 'Pairing codes and routes are read from the server.',
    ai: 'Each service is asked for its sign-in state.',
    code: 'Git, Jujutsu, and the code service are asked what they can do.',
    backups: 'The latest backup receipt and the Recovery Kit record are read.',
    updates: 'The release list is compared with the installed version.',
    optional: 'The app asks the operating system what is available.'
  };
  const howChecked = (g, f) => f.probe === 'gpu' ? 'This window asks its graphics driver which card draws it, on this computer, each time it is checked.' : HOW[checkOf(g, f).split(':')[0]] || HOW.optional;
  const counts = () => { const c = { 'Ready': 0, 'Needs attention': 0, 'Not set up': 0, 'Unavailable': 0, 'Checking': 0 }; allFindings().forEach(f => { c[f.state] = (c[f.state] || 0) + 1; }); return c; };
  const tone = st => st === 'Ready' ? 'ready' : st === 'Needs attention' ? 'attention' : st === 'Unavailable' ? 'blocked' : st === 'Checking' ? 'info' : 'off';

  /* Where each fix goes. Returning to Doctor afterwards re-checks the same finding and keeps its place. */
  const FIX_ROUTES = {
    'devices:pairing': { domain: 'system', workspace: 'servers', tab: 'devices', open: 'pm51-servers-pair' },
    'devices:tailscale': { domain: 'system', workspace: 'servers', tab: 'away' },
    'ai:antigravity': { domain: 'ai', workspace: 'providers', provider: 'antigravity' },
    'ai:claude': { domain: 'ai', workspace: 'providers', provider: 'claude-code' },
    'code:push': { domain: 'source', workspace: 'source-manager' },
    'backups:kit': { domain: 'system', workspace: 'backup', tab: 'backup' },
    'updates:app': { domain: 'system', workspace: 'updates' },
    'optional:containers': { panel: 'containers' }
  };

  /* Example findings come back as they were; a measured one (Performance) is measured again. */
  function recheck(check, done) {
    const hit = findFinding(check); if (!hit) return;
    const prior = hit.f.state; hit.f.state = 'Checking'; refresh();
    setTimeout(() => { const again = findFinding(check); if (!again) return; again.f.state = prior; again.f.checked = 'just now'; runProbe(again.f); refresh(); if (done) done(again.f); }, 700);
  }
  function recheckGroup(gid, done) {
    const g = groups().find(x => x.id === gid); if (!g || g.checking) return;
    g.checking = true; const prior = g.findings.map(f => f.state); g.findings.forEach(f => { f.state = 'Checking'; }); refresh();
    setTimeout(() => { const again = groups().find(x => x.id === gid); if (!again) return; again.findings.forEach((f, i) => { f.state = prior[i]; f.checked = 'just now'; runProbe(f); }); again.checking = false; PM51.s().doctorLastCheck = `${nowLabel()} · ${again.title}`; refresh(); if (done) done(); }, 700);
  }

  /* Waiting (W5): one loader per wait, on what started it. A group's check is its busy Check Again button; Check
     everything is its own busy button and the groups it walks read Checking without a loader of their own; a finding
     re-checked by itself (the return from a fix) holds the loader where its Fix button stands. A finding's status word
     and mark stay its state. */
  let checkingAll = false;
  const waitMark = () => window.PM_PIP_LOADER ? `<span class="pm51-doctor-wait" aria-hidden="true">${window.PM_PIP_LOADER.html({ motion: 'swing', px: 14 })}</span>` : '';
  const returnKey = ret => ret ? (ret.check || (ret.gid && ret.fid ? `${ret.gid}:${ret.fid}` : '')) : '';
  function findingRow(g, f) {
    const check = checkOf(g, f);
    const focus = !!(returnKey(PM51.s().doctorReturn) === check && returnArmed);
    const fix = offersFix(g, f) ? PM51.btn({ label: f.fix, small: true, action: 'pm51-doctor-fix', data: { check } }) : '';
    const wait = f.state === 'Checking' && !g.checking ? waitMark() : '';
    return { label: PM51.serviceText(f.title), pill: PM51.pill(f.state, tone(f.state)), id: check, data: f.probe ? { measured: 'here' } : null, busy: !!wait, cls: `pm51-doctor-row${focus ? ' is-focus' : ''}`, control: `<span class="pm51-doctor-checked">checked ${h(f.checked)}</span>${wait}${fix}${PM51.iconBtn({ icon: 'chevron', label: `Open ${f.title}`, action: 'pm51-doctor-open', data: { check } })}` };
  }

  function render() {
    const c = counts();
    const stats = PM51.stats([
      { label: 'Ready', value: String(c.Ready), tone: 'ready' },
      { label: 'Needs attention', value: String(c['Needs attention']), tone: c['Needs attention'] ? 'attention' : undefined },
      { label: 'Not set up', value: String(c['Not set up']) },
      { label: 'Unavailable', value: String(c.Unavailable), tone: c.Unavailable ? 'blocked' : undefined }
    ]);
    /* An area with nothing it can really check says so (Performance, if this computer could not be measured). */
    const sections = groups().map(g => PM51.section({
      title: g.title, help: g.help, cls: 'pm51-doctor-area', data: { area: g.id },
      action: { label: g.checking ? 'Checking…' : 'Check Again', icon: 'refresh', small: true, action: 'pm51-doctor-check', data: { gid: g.id }, disabled: !!g.checking || checkingAll || !g.findings.length, busy: !!g.checking && !checkingAll, reason: checkingAll ? 'Check everything is running.' : !g.findings.length ? 'Nothing in this area can be checked yet.' : 'A check is already running for this area.' },
      body: g.findings.length ? PM51.rows(g.findings.map(f => findingRow(g, f))) : `<div class="pm51-doctor-none">${PM51.empty('Nothing checked yet', 'No check in this area runs on this computer yet.')}</div>`
    })).join('');
    const S = PM51.s();
    const oldest = [...new Set(allFindings().filter(f => f.checked === '2 h ago').map(f => f.group.title))];
    const advanced = PM51.advanced([
      PM51.section({ title: 'Cached summary', body: PM51.kv([['Last check', S.doctorLastCheck || 'Loaded from cache · 2 min ago'], ['Findings cached', String(allFindings().length)], ['Oldest result', oldest.length ? `2 h ago (${oldest.join(', ')})` : 'From the last check'], ['Cache age limit', 'Results older than a day are marked for a re-check']]) + `<div class="pm51-doctor-actions" style="margin-top:10px">${PM51.btn({ label: 'Copy checkup summary', small: true, icon: 'copy', action: 'pm51-doctor-copy' })}</div>` })
    ].join(''));
    /* The last checkup is a dated snapshot, not a promise; "Check everything" is the inventory's own action. */
    const summary = `<div class="o55-toolbar o55-doctor-summary">${PM51.home('system.health.doctor-summary', `<span class="o55-doctor-last">${PM51.status(`Last checkup: ${c.Unavailable && !c.Ready ? 'Blocked' : c['Needs attention'] || c.Unavailable ? 'Ready with warnings' : 'Ready'}`, c['Needs attention'] || c.Unavailable ? 'attention' : 'ready')}<small>${h(S.doctorLastCheck || '2 min ago')}</small></span>`, 'span')}<span class="o55-toolbar-spacer"></span>${PM51.bound.action('system.health.run-doctor', { label: checkingAll ? 'Checking…' : 'Check everything', icon: 'refresh', busy: checkingAll, reason: 'Every area is being checked.' })}</div>`;
    scheduleReturn();
    return PM51.page({ id: ID, key: KEY, body: summary + stats + sections + advanced, quiet: [
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
    const key = returnKey(ret); if (!key || returnArmed === key) return; returnArmed = key;
    setTimeout(() => {
      const row = root.querySelector(`[data-pm51-manager="doctor"] [data-row="${cssEscape(key)}"]`);
      if (row) { try { row.scrollIntoView({ block: 'center' }); } catch (_e) {} const btn = row.querySelector('button'); if (btn) btn.focus(); }
      recheck(key, () => { const s = PM51.s(); if (returnKey(s.doctorReturn) === key) { s.doctorReturn = null; saveState(); } returnArmed = null; });
    }, 160);
  }
  const doctorOriginalNavigate = navigate;
  navigate = function (domainId, workspaceId, options = {}) {
    const result = doctorOriginalNavigate(domainId, workspaceId, options);
    if (workspaceId === 'doctor' && PM51.s().doctorReturn) setTimeout(scheduleReturn, 250);
    return result;
  };

  function findingPanel(check) {
    const hit = findFinding(check); if (!hit) return; const { g, f } = hit;
    const summary = f.measured ? `${f.state === 'Ready' ? `${f.title}: ${f.measured} draws this window.` : `${f.measured}. ${f.impact || ''}`}`.trim() : f.state === 'Ready' ? `${f.title}. Nothing to do.` : f.impact || 'Needs a look.';
    const fix = !!f.fix && (f.state !== 'Ready' || FIX_WHEN_READY.has(check));
    const evidence = kind => kind === 'details' ? PM51.kv([['Area', g.title], ['Finding', f.title], ['State', f.state], ['Checked', f.checked], ['How it is checked', howChecked(g, f)]].concat(f.measured ? [['Measured', f.measured]] : []))
      : kind === 'logs' ? `<div class="pm51-servers-conf">${h(`[${f.checked}] check ${check}\n[${f.checked}] result: ${f.state}\n[${f.checked}] ${f.impact || 'no action needed'}\n${f.measured ? '(measured on this computer)' : '(redacted example log)'}`)}</div>`
      : PM51.kv([['Receipt', `doctor-${check.replace(':', '-')}`], ['Issued', f.checked], ['Result', f.state], ['Signed by', f.measured ? 'This computer' : 'Home TrueNAS']]);
    const evidenceButtons = `<div class="pm51-doctor-actions">${['details', 'logs', 'receipt'].map(k => PM51.btn({ label: k === 'details' ? 'Details' : k === 'logs' ? 'Logs' : 'Receipt', small: true, action: 'pm51-doctor-evidence', data: { check, kind: k } })).join('')}</div><div class="pm51-doctor-evidence" data-doctor-evidence></div>`;
    const wrap = PM51.panel({
      title: f.title, subtitle: `${g.title} · checked ${f.checked}`, pill: PM51.pill(f.state, tone(f.state)),
      body: PM51.panelSection('Summary', `<p class="pm51-ps-text">${h(summary)}</p>`)
        + (f.state !== 'Ready' || f.todo ? PM51.panelSection('What to do', `<p class="pm51-ps-text">${h(f.todo || 'Nothing. This is working.')}</p>`) : '')
        + PM51.panelSection('On demand', evidenceButtons),
      primaryLabel: fix ? f.fix : '',
      onPrimary: fix ? () => { runFix(check); } : null,
      secondaryLabel: 'Check this again', onSecondary: () => { recheck(check); return true; }
    });
    wrap._pmEvidence = { check, evidence };
  }

  function runFix(check) {
    const route = FIX_ROUTES[check]; const hit = findFinding(check); if (!hit) return;
    const S = PM51.s();
    if (!route) { PM51.unavailable(hit.f.fix || 'This fix', 'There is no owner for this fix in the preview yet.'); return; }
    if (route.panel === 'containers') {
      PM51.panel({ title: 'Set up a container engine', subtitle: 'Optional. Lets container-based work run on this computer instead of the server.', body: PM51.panelSection('Steps', PM51.steps([{ title: 'Install Docker Desktop or Podman', desc: 'From their official download pages.' }, { title: 'Start it once', desc: 'So it can finish its own setup.' }, { title: 'Check again here', desc: 'Doctor notices it on the next check.' }])) + PM51.note('Until then, container work runs on your home server. Nothing is broken.', 'info'), primaryLabel: 'Check again', onPrimary: () => recheck(check) });
      return;
    }
    S.doctorReturn = { check }; returnArmed = null; saveState();
    if (route.tab) PM51.setTab(route.workspace, route.tab);
    if (route.provider && typeof selectProviderView === 'function') { try { selectProviderView(route.provider, undefined, true); } catch (_e) { PM51.go(route.domain, route.workspace); } }
    else PM51.go(route.domain, route.workspace);
    if (route.open) setTimeout(() => { try { dispatchAction(route.open, null, null); } catch (_e) {} }, 350);
    PM51.toast('Come back to Doctor when done', `${hit.f.title} is re-checked when you return.`, 'info');
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('doctor-check', el => recheckGroup(ds(el, 'gid')));
  PM51.on('doctor-check-all', () => {
    if (checkingAll) return;
    const ids = groups().filter(g => g.findings.length).map(g => g.id); let i = 0;
    checkingAll = true;
    const next = () => { if (i >= ids.length) { checkingAll = false; PM51.s().doctorLastCheck = `${nowLabel()} · all areas`; refresh(); PM51.toast('All checks finished', 'Performance was measured on this computer. The other areas are example data, re-read from the cache.', 'info'); return; } recheckGroup(ids[i++], next); };
    next();
  });
  PM51.on('doctor-open', el => findingPanel(ds(el, 'check')));
  PM51.on('doctor-fix', el => runFix(ds(el, 'check')));
  PM51.on('doctor-evidence', el => {
    const wrap = el.closest('.pm51-drawer-wrap'); const ev = wrap && wrap._pmEvidence; if (!ev) return;
    const holder = wrap.querySelector('[data-doctor-evidence]'); if (holder) holder.innerHTML = ev.evidence(ds(el, 'kind'));
  });
  PM51.on('doctor-export', () => PM51.toast('Report prepared', 'Example data only. A redacted readiness report would be saved as a file.', 'info'));
  PM51.on('doctor-copy', () => {
    const text = groups().map(g => `${g.title}\n` + (g.findings.length ? g.findings.map(f => `  - ${f.title}: ${f.state} (checked ${f.checked})`).join('\n') : '  - Nothing checked yet')).join('\n');
    try { const p = navigator.clipboard && navigator.clipboard.writeText(text); if (p && p.catch) p.catch(() => {}); } catch (_e) {}
    PM51.toast('Checkup summary copied', 'Every finding and its state, with nothing secret in it.', 'info');
  });
  /* S5: "Collect support details" (system.health.platform-diagnostics, canon "Collects detailed info about your computer
     and app install") is its own thing, not a second Copy of the checkup summary: it lists what it gathers, then copies it. */
  const supportDetails = () => {
    const env = (window.O55 && O55.S && O55.S.env) || null, client = (env && env.client) || {};
    const ver = (findFinding('updates:app') || {}).f;
    return [
      ['Computer', [client.name, client.os].filter(Boolean).join(' · ') || 'This computer'],
      ['Browser engine', String(navigator.userAgent || '').replace(/^.*?(Chrome|Firefox|Safari)\/([\d.]+).*$/, '$1 $2') || 'Unknown'],
      ['Screen', `${screen.width} × ${screen.height}`],
      ['Puppet Master', ver && /available/i.test(ver.title) ? `0.8.0 · ${ver.title}` : '0.8.0'],
      ['Server', ['server:reach', 'server:identity'].map(c => (findFinding(c) || {}).f).filter(Boolean).map(f => f.title).join(' · ') || 'Not checked'],
      ['Left out', 'Passwords, keys, tokens and file contents']
    ];
  };
  PM51.on('doctor-diagnostics', () => {
    const rows = supportDetails();
    PM51.panel({ title: 'Support details', subtitle: 'Computer and app install details, with secrets removed. Copy them when support asks.', body: PM51.panelSection('What is collected', PM51.kv(rows)) + PM51.note('Nothing is sent anywhere. Copy puts this list on your clipboard for you to paste.', 'info'),
      primaryLabel: 'Copy support details', onPrimary: () => {
        const text = rows.map(r => `${r[0]}: ${r[1]}`).join('\n');
        try { const p = navigator.clipboard && navigator.clipboard.writeText(text); if (p && p.catch) p.catch(() => {}); } catch (_e) {}
        PM51.toast('Support details copied', 'Computer and app install details, with secrets removed.', 'info');
      } });
  });
})();
