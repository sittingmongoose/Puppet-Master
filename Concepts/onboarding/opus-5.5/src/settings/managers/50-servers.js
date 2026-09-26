/* Server & Project Location — where the workspace lives, where work runs, which devices reach it. */
(function () {
  const ID = 'servers';
  const KEY = 'servers-hosts-environments';
  const TAB_UI = 'ui.settings.server_tab.select';
  const TABS = [
    { id: 'home', label: 'Home & Location', ui: TAB_UI },
    { id: 'servers', label: 'Servers', ui: TAB_UI },
    { id: 'devices', label: 'Devices', ui: TAB_UI },
    { id: 'away', label: 'Away From Home', ui: TAB_UI },
    { id: 'move', label: 'Move & Copy', ui: TAB_UI }
  ];
  const FILE_KINDS = ['Server folder', 'Another computer or NAS', 'Existing checkout', 'Clone from a code service', 'Folder on an SSH computer', 'Restored backup'];
  const ADD_HOW = ['Find nearby', 'Enter address', 'Claim a new server', 'Use this computer as a server'];
  const CONFLICT_POLICIES = ['Preserve both, pause affected work, and show a three-way comparison', 'Keep the server copy and save this device’s copy beside it', 'Keep this device’s copy and save the server copy beside it'];
  const h = PM51.h, a = PM51.a;

  PM51.style(`
#panel-settings .pm51-servers-pair { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 16px; align-items: start; }
#panel-settings .pm51-servers-qr { width: 132px; height: 132px; padding: 8px; border: 1px solid var(--k3-line); border-radius: var(--k3-radius-md); background: #fff; }
#panel-settings .pm51-servers-qr svg { width: 100%; height: 100%; display: block; }
#panel-settings .pm51-servers-pair-code { font-size: 22px; font-weight: 720; letter-spacing: .08em; color: var(--k3-text-1); font-family: var(--mono-font, ui-monospace, monospace); }
#panel-settings .pm51-servers-pair-meta { margin-top: 4px; font-size: 12px; color: var(--k3-text-3); }
#panel-settings .pm51-servers-pair-link { margin-top: 10px; font-size: 12px; color: var(--k3-text-2); overflow-wrap: anywhere; }
#panel-settings .pm51-servers-pair-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
#panel-settings .pm51-servers-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-servers-fp { display: block; margin-top: 6px; }
#panel-settings .pm51-servers-conf { padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.55; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
`);

  const sp = () => PM51.s().serverProject;
  const serverById = id => sp().servers.find(s => s.id === id);
  const homeServer = () => serverById(sp().homeServer) || sp().servers[0];
  const isClaimed = s => s.claimed !== false;
  /* ---------- Away From Home: route model (Plans/Remote_Access_System.md RAS-002) ---------- */
  /* Routes are tried in a private-first order; the user may reorder within policy (Local network is
     always first) and the route actually in use is always shown. Plain status words below; Advanced
     maps them to the RAS lifecycle names. */
  const ROUTE_STATUS = {
    'active': { label: 'In use', tone: 'ready', lifecycle: 'active' },
    'ready': { label: 'Ready', tone: 'ready', lifecycle: 'ready' },
    'not-set-up': { label: 'Not set up', tone: 'off', lifecycle: 'no route record yet' },
    'needs-sign-in': { label: 'Needs sign-in', tone: 'attention', lifecycle: 'waiting_for_auth' },
    'needs-attention': { label: 'Needs attention', tone: 'attention', lifecycle: 'degraded' },
    'testing': { label: 'Testing', tone: 'info', lifecycle: 'testing' },
    'offline': { label: 'Offline', tone: 'blocked', lifecycle: 'offline' },
    'off': { label: 'Off', tone: 'off', lifecycle: 'disabled' }
  };
  const ROUTE_KINDS = {
    'lan': { icon: 'home', canonical: 'LAN' },
    'tailscale': { icon: 'network', canonical: 'private Tailscale' },
    'vpn': { icon: 'shield', canonical: 'existing VPN' },
    'domain': { icon: 'browser', canonical: 'custom domain/proxy' },
    'remote-link': { icon: 'link', canonical: 'Remote Link direct, then Remote Link relay' }
  };
  const DEFAULT_ROUTE_ORDER = ['lan', 'tailscale', 'vpn', 'domain', 'remote-link'];
  const OLD_ROUTE_NAMES = { 'local network': 'lan', 'tailscale': 'tailscale', 'vpn': 'vpn', 'existing vpn': 'vpn', 'i already use a vpn': 'vpn', 'use my domain': 'domain', 'custom domain': 'domain', 'puppet master remote link': 'remote-link' };
  const OLD_ROUTE_STATUS = { 'ready': 'ready', 'in use': 'active', 'active': 'active', 'not set up': 'not-set-up', 'needs sign-in': 'needs-sign-in', 'needs attention': 'needs-attention', 'testing': 'testing', 'offline': 'offline', 'off': 'off' };
  const routeFixture = () => clone(PM51_DATA.serverProject.remoteAccess);
  /* Shape migration: pass-1 persisted routes as [name, status] tuples with options[] and publicAccess.
     Rebuild the route objects from the fixture, carry statuses over by name, fold publicAccess into
     funnel.enabled, and drop the retired keys. Runs at module load and inside ensureStateShape. */
  function normalizeRemoteAccess(S) {
    if (!S || typeof S !== 'object') return;
    const fixture = routeFixture();
    let R = S.remoteAccess;
    if (!R || typeof R !== 'object' || Array.isArray(R)) R = S.remoteAccess = fixture;
    const tuples = Array.isArray(R.routes) && R.routes.length > 0 && Array.isArray(R.routes[0]);
    if (tuples || !Array.isArray(R.routes) || !R.routes.length || typeof R.routes[0] !== 'object') {
      const old = Array.isArray(R.routes) ? R.routes : [];
      const routes = fixture.routes;
      for (const t of old) {
        if (!Array.isArray(t)) continue;
        const r = routes.find(x => x.id === OLD_ROUTE_NAMES[String(t[0] || '').toLowerCase()]); if (!r) continue;
        const st = OLD_ROUTE_STATUS[String(t[1] || '').toLowerCase()]; if (!st) continue;
        r.status = r.locked && st === 'ready' ? 'active' : st;
        r.enabled = r.locked || st === 'ready' || st === 'active';
      }
      R.routes = routes;
    } else {
      for (const f of fixture.routes) {
        const r = R.routes.find(x => x.id === f.id);
        if (!r) { R.routes.push(f); continue; }
        for (const k of Object.keys(f)) if (r[k] === undefined) r[k] = f[k];
      }
    }
    if (!R.funnel || typeof R.funnel !== 'object') R.funnel = { enabled: !!R.publicAccess };
    delete R.publicAccess; delete R.options;
    if (R.order !== 'custom' && R.order !== 'recommended') R.order = 'recommended';
    if (!R.routes.some(r => r.id === R.actual)) R.actual = 'lan';
    for (const k of ['headscale', 'domain', 'vpn', 'remoteLink']) if (R[k] === undefined) R[k] = null;
    if (R.order === 'recommended') DEFAULT_ROUTE_ORDER.forEach((id, i) => { const r = R.routes.find(x => x.id === id); if (r) r.priority = i + 1; });
  }
  const pm51ServersOriginalEnsureStateShape = ensureStateShape;
  ensureStateShape = function () { const out = pm51ServersOriginalEnsureStateShape.apply(this, arguments); try { normalizeRemoteAccess(PM51.s().serverProject); } catch (_e) { /* shape only */ } return out; };
  try { normalizeRemoteAccess(PM51.s().serverProject); } catch (_e) { /* shape only */ }

  const ra = () => sp().remoteAccess;
  const routeById = id => ra().routes.find(r => r.id === id);
  const routesSorted = () => ra().routes.slice().sort((x, y) => (x.priority - y.priority) || (DEFAULT_ROUTE_ORDER.indexOf(x.id) - DEFAULT_ROUTE_ORDER.indexOf(y.id)));
  const routeConfigured = r => r.status !== 'not-set-up' && r.status !== 'needs-sign-in';
  const routeReady = r => r.status === 'ready' || r.status === 'active';
  const readyRoutes = () => routesSorted().filter(routeReady);
  const actualRoute = () => routeById(ra().actual) || routeById('lan') || routesSorted()[0];
  const preferredRoute = () => routesSorted().find(r => r.id !== 'lan' && r.enabled && routeConfigured(r) && r.status !== 'off') || null;
  const routeInfo = r => ROUTE_STATUS[r.status] || ROUTE_STATUS['not-set-up'];
  const routeLabel = r => r.kind === 'remote-link' && r.status === 'needs-sign-in' ? 'Needs pairing' : routeInfo(r).label;
  const routeToken = r => PM51.status(routeLabel(r), routeInfo(r).tone);
  const routeLifecycle = r => r.kind === 'remote-link' && r.status === 'needs-sign-in' ? 'waiting_for_pairing' : (r.status === 'needs-attention' && (!r.lastCheck || r.lastCheck === 'Never') ? 'configured' : routeInfo(r).lifecycle);
  const ordinal = n => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th')}`;
  const routePosition = r => routesSorted().findIndex(x => x.id === r.id) + 1;
  const recommendedOrder = () => routesSorted().every((r, i) => r.id === DEFAULT_ROUTE_ORDER[i]);
  const awayValue = () => { const p = preferredRoute(); return `<span class="pm51-row-value${p ? '' : ' is-muted'}">${h(p ? p.name : 'None set up yet')}</span>${p ? routeToken(p) : ''}`; };

  PM51.style(`
#panel-settings .pm51-servers-routes .pm51-item-avatar { width: auto; height: auto; border: 0; background: none; }
#panel-settings .pm51-servers-routes .pm51-item-end { flex-wrap: wrap; justify-content: flex-end; gap: 6px 8px; }
#panel-settings .pm51-servers-routes .pm51-item-end > .pm51-status { margin-right: 2px; }
#panel-settings .pm51-servers-move { display: inline-flex; align-items: center; gap: 2px; }
#panel-settings .pm51-servers-move-btn[aria-disabled="true"] { opacity: .38; cursor: not-allowed; }
#panel-settings .pm51-servers-route.is-funnel .pm51-item-title { color: var(--k3-text-2); }
#panel-settings .pm51-servers-order-mode { flex: 0 0 auto; margin-top: 3px; font-size: 11.5px; color: var(--k3-text-3); white-space: nowrap; }
#panel-settings .pm51-section-head > .pm51-servers-order-reset { flex: 0 0 auto; margin-top: 3px; white-space: nowrap; }
#panel-settings .pm51-servers-subhead { margin: 12px 0 4px; font-size: 11px; font-weight: 600; color: var(--k3-text-3); }
@container settings-host (max-width: 760px) {
  #panel-settings .pm51-servers-routes .pm51-item { flex-wrap: wrap; }
  #panel-settings .pm51-servers-routes .pm51-item-copy { flex: 1 1 calc(100% - 44px); }
  #panel-settings .pm51-servers-routes .pm51-item-end { flex: 1 1 100%; justify-content: flex-start; padding-left: 36px; }
}
`);
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const fingerprint = s => { let x = 0; for (const c of String(s.id + s.address)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return 'SHA256:' + x.toString(16).padStart(8, '0').toUpperCase() + '…' + (x * 7 >>> 0).toString(16).slice(0, 6).toUpperCase(); };
  const runOptions = () => {
    const opts = [['Automatic', 'Automatic (Home server)']];
    for (const s of sp().servers) if (isClaimed(s)) opts.push([s.id, s.role === 'This computer' ? `${s.name} (WSL)` : s.name]);
    for (const d of sp().devices) if (/runs work/i.test(d.role) && !opts.some(o => o[1].startsWith(d.name))) opts.push(['device:' + d.id, d.name]);
    return opts;
  };
  const runLabel = () => { const o = runOptions().find(x => x[0] === sp().executionHost); return o ? o[1] : 'Automatic (Home server)'; };

  /* ---------- Home & Location -------------------------------------------- */
  function renderHome() {
    const S = sp(), home = homeServer(), connected = S.devices.filter(d => d.state === 'Connected').length;
    const thisDevice = S.devices.find(d => d.name === 'Windows Workstation') || S.devices[0];
    const exec = runLabel();
    const stats = PM51.stats([
      { label: 'Home server', value: home.name, help: home.state, tone: home.state === 'Connected' ? 'ready' : 'attention' },
      { label: 'Runs on', value: S.executionHost === 'Automatic' ? 'Automatic' : exec, help: S.executionHost === 'Automatic' ? `Currently ${home.name}` : 'Chosen by you' },
      { label: 'Files', value: S.sourceLocation.kind, help: S.sourceLocation.path },
      { label: 'Devices', value: `${connected} connected`, help: `${S.devices.length} paired` }
    ]);
    const workspace = PM51.section({
      title: 'Your workspace',
      body: PM51.rows([
        { label: 'Home server', help: 'Where your workspace lives.', control: PM51.select(S.homeServer, S.servers.filter(isClaimed).map(s => [s.id, s.name]), { action: 'pm51-servers-home', label: 'Home server' }) },
        { label: 'Runs on', help: 'Where work runs.', control: PM51.select(S.executionHost, runOptions(), { action: 'pm51-servers-exec', label: 'Runs on' }) },
        { label: 'Files', value: `${S.sourceLocation.kind} · ${S.sourceLocation.path}`, action: { label: 'Change…', action: 'pm51-servers-files', data: { 'command-id': 'cmd.project.source_location.update' } } },
        { label: 'This device', value: thisDevice ? thisDevice.name : 'Unknown', pill: thisDevice ? PM51.status(thisDevice.state) : '' }
      ])
    });
    const status = PM51.section({
      title: 'Status',
      body: PM51.rows([
        { label: 'Connection', help: 'The route your devices are using right now.', control: `<span class="pm51-row-value">${h(`Connected · ${actualRoute().name}`)}</span>${routeToken(actualRoute())}` },
        { label: 'Away from home', help: 'The first route that is set up and turned on for when you are not at home.', control: awayValue(), action: { label: preferredRoute() ? 'Manage routes' : 'Set up a route', action: 'pm51-tab', data: { manager: ID, tab: 'away' } } },
        { label: 'Work in progress', help: 'Goals, chats, and editors saved from your last session.', value: S.status.work ? 'Saved from this device' : 'None', pill: S.status.work ? PM51.status(S.status.work) : '' },
        { label: 'Last change', value: S.status.lastChange }
      ])
    });
    const P = state.projectSync || {};
    const advanced = PM51.advanced([
      PM51.rows([
        { label: 'Execution environments', help: 'Runtimes available where work runs.', value: [...new Set(S.servers.flatMap(s => s.environments || []))].join(' · ') || P.executionEnvironment || 'WSL2 · Ubuntu' },
        { label: 'File authority', help: 'Which copy of the files wins when they differ.', value: P.fileAuthority || 'Server host' },
        { label: 'Conflict policy', value: S.conflicts.policy, action: { label: 'Change', action: 'pm51-servers-conflict-policy' } },
        { label: 'Sync mode', value: P.syncMode || 'Continuous metadata + on-demand artifacts' }
      ]),
      PM51.section({ title: 'Continuity items', help: 'What can resume on another device. Change these under Devices.', body: PM51.kv(Object.entries(S.continuity).map(([k, v]) => [k, v ? 'On' : 'Off'])) }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Server identity', fingerprint(home)], ['Home server address', home.address], ['Project path', S.sourceLocation.path], ['Diagnostics', 'Reachability, identity, file authority, continuity']]) + `<div class="pm51-servers-actions" style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-servers-diagnostics', data: { scope: 'home' } })}${pm7ConsumerButton('local', 'ui.project.open_details', 'Project details')}${pm7ConsumerButton('local', 'ui.project.source_location.open_details', 'Source location details')}${pm7ConsumerButton('local', 'ui.project_template.open_details', 'Project template details')}${pm7ConsumerButton('local', 'ui.project.restore_archived', 'Restore archived Project')}</div>` })
    ].join(''));
    return stats + workspace + status + advanced;
  }

  /* ---------- Servers ----------------------------------------------------- */
  function renderServers() {
    const S = sp();
    const selId = PM51.sel(ID, S.homeServer);
    const srv = serverById(selId) || S.servers[0];
    const items = S.servers.map(s => ({ id: s.id, title: s.name, meta: `${s.role} · ${s.state}`, tone: PM51.tone(s.state), selected: s.id === srv.id }));
    let body;
    if (!isClaimed(srv)) {
      const cs = srv.claimSteps || {};
      body = PM51.section({
        title: 'Claim this server', help: 'Claiming ties the server to your account so your devices can use it.',
        body: PM51.steps([
          { title: 'Find', desc: `${srv.address} answered`, done: true },
          { title: 'Confirm identity', desc: cs.identity ? `Fingerprint confirmed · ${fingerprint(srv)}` : 'Compare the fingerprint shown on the server with the one here.', done: !!cs.identity, action: cs.identity ? null : { label: 'Confirm identity', action: 'pm51-servers-claim-identity', data: { id: srv.id } } },
          { title: 'Claim', desc: cs.claim ? 'Claimed for your account' : 'Ties the server to your account.', done: !!cs.claim, action: cs.claim ? null : { label: 'Claim', primary: true, action: 'pm51-servers-claim', data: { id: srv.id, 'command-id': 'cmd.server.claim' }, disabled: !cs.identity, reason: 'Confirm the identity first.' } },
          { title: 'Pair devices', desc: 'Let your other devices reach this server.', action: { label: 'Pair a device', action: 'pm51-servers-pair', disabled: !cs.claim, reason: 'Claim the server first.' } }
        ])
      });
    } else {
      body = PM51.section({
        title: 'Details',
        body: PM51.rows([
          { label: 'Role', value: srv.role, pill: srv.id === S.homeServer ? PM51.tag('Home server') : '' },
          { label: 'Address', value: srv.address },
          { label: 'Version', value: srv.version, pill: srv.updateReady ? PM51.status('Update ready') : '', action: srv.updateReady ? { label: 'App Updates', action: 'pm51-go', data: { domain: 'system', workspace: 'updates' }, icon: 'arrowRight' } : null },
          { label: 'Runs work', help: 'Allow Goals and tasks to run on this server.', control: PM51.toggle(!!srv.runsWork, { action: 'pm51-servers-runs', data: { id: srv.id }, label: 'Runs work' }) },
          { label: 'Default for new workspaces', control: PM51.toggle(!!srv.default, { action: 'pm51-servers-default', data: { id: srv.id }, label: 'Default for new workspaces' }) },
          { label: 'Connection', value: `Checked ${srv.lastCheck}`, action: { label: 'Test connection', icon: 'test', action: 'pm51-servers-test', data: { id: srv.id, 'command-id': 'cmd.execution_host.test' } } }
        ])
      });
    }
    const advanced = PM51.advanced([
      PM51.section({ title: 'Claim and bootstrap', body: PM51.kv([['Claimed', isClaimed(srv) ? 'Yes · identity confirmed' : 'Not yet'], ['Identity', fingerprint(srv)], ['Trust', isClaimed(srv) ? 'Owner' : 'None until claimed'], ['Bootstrap', srv.role === 'This computer' ? 'Installed with the app' : 'Claimed from an existing install']]) + `<div class="pm51-servers-actions" style="margin-top:10px">${pm7ConsumerButton('command', 'cmd.server.claim', 'Claim (command)')}${pm7ConsumerButton('command', 'cmd.server.bootstrap.start', 'Bootstrap (command)')}</div>` }),
      PM51.section({ title: 'Deployment', body: PM51.kv([['How it runs', srv.deployment || 'Unknown'], ['Image', /container/i.test(srv.deployment || '') ? 'puppetmaster/server:0.8.0' : 'Not a container'], ['Environments', (srv.environments || []).join(' · ') || 'None reported']]) }),
      PM51.section({ title: 'Full server backup', help: 'Backs up everything on this server, not just this workspace.', body: PM51.rows([{ label: 'Whole-server backup', help: 'Set up and run from Backup & Restore.', action: { label: 'Open Backup & Restore', action: 'pm51-go', data: { domain: 'system', workspace: 'backup' }, icon: 'arrowRight' } }]) }),
      PM51.section({ title: 'Host and environment details', body: `<div class="pm51-servers-actions">${pm7ConsumerButton('local', 'ui.execution_host.open_details', 'Host details')}${pm7ConsumerButton('local', 'ui.execution_environment.open_details', 'Environment details')}${pm7ConsumerButton('local', 'ui.execution_environment.open_logs', 'Environment logs')}${pm7ConsumerButton('command', 'cmd.execution_host.capabilities.refresh', 'Refresh capabilities')}${pm7ConsumerButton('command', 'cmd.execution_host.register', 'Add host (command)')}</div>` }),
      PM51.section({ title: 'Topology diagnostics', body: PM51.kv([['Servers', String(S.servers.length)], ['Devices', String(S.devices.length)], ['Routes ready', String(readyRoutes().length)]]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-servers-diagnostics', data: { scope: 'servers' } })}</div>` })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Servers', count: S.servers.length,
      add: { action: 'pm51-servers-add', label: 'Add a server', data: { 'command-id': 'cmd.server.claim' } },
      items,
      detail: {
        title: srv.name, subtitle: `${srv.role} · ${srv.address}`, pill: PM51.status(srv.state),
        primary: { label: 'Open web UI', icon: 'external', action: 'pm51-servers-webui', data: { id: srv.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Connect', icon: 'network', disabled: srv.state === 'Connected', meta: srv.state === 'Connected' ? 'Already connected' : '', onClick: () => { srv.state = 'Checking'; refresh(); setTimeout(() => { srv.state = 'Needs attention'; srv.lastCheck = 'Just now'; refresh(); PM51.toast('Could not confirm the connection', 'Example data only. Run Test connection to see what was checked.', 'info'); }, 600); } },
          { label: 'Rename', icon: 'edit', onClick: () => renameServer(srv) },
          { label: 'Restart', icon: 'refresh', onClick: () => PM51.confirm(`Restart ${srv.name}?`, 'Running work pauses and resumes after the restart. Devices reconnect on their own.', 'Restart', () => PM51.toast('Restart not sent', 'Example data only. Nothing restarted in this preview.', 'info')) },
          { label: 'Update…', icon: 'download', meta: srv.updateReady ? '0.8.1 ready' : 'Up to date', disabled: !srv.updateReady, onClick: () => PM51.go('system', 'updates') },
          { separator: true },
          { label: 'Remove', icon: 'trash', danger: true, disabled: srv.id === S.homeServer, meta: srv.id === S.homeServer ? 'This is your home server' : '', onClick: () => PM51.confirm(`Remove ${srv.name}?`, 'Your devices stop using this server. Nothing on the server itself is deleted.', 'Remove', () => { S.servers = S.servers.filter(s => s.id !== srv.id); PM51.setSel(ID, S.homeServer); refresh(); }, true) }
        ], srv.name),
        body: body + advanced
      }
    });
  }

  /* ---------- Devices ----------------------------------------------------- */
  function renderDevices() {
    const S = sp();
    const devices = PM51.section({
      title: 'Paired devices', help: 'Devices that can open this workspace.',
      action: { label: 'Pair Another Device', icon: 'plus', action: 'pm51-servers-pair', data: { 'command-id': 'cmd.client.pair.start' } },
      body: S.devices.length ? PM51.list(S.devices.map(d => ({
        title: d.name, meta: `${d.platform} · ${d.role}`, avatar: icon(d.platform === 'Web' ? 'browser' : 'system'),
        pill: PM51.status(d.state), end: `<span class="pm51-row-value is-muted">${h(d.lastSeen)}</span>${icon('chevron')}`,
        action: 'pm51-servers-device', data: { id: d.id }
      }))) : PM51.empty('No devices paired yet', 'Pair a device to open this workspace from it.', { label: 'Pair Another Device', action: 'pm51-servers-pair' })
    });
    const pending = PM51.section({
      title: 'Pending requests', help: 'Devices asking to join.',
      body: S.pending.length ? PM51.list(S.pending.map(p => ({
        title: p.name, meta: `${p.platform} · asked ${p.when}`, avatar: icon('user'),
        end: PM51.btn({ label: 'Approve', small: true, primary: true, action: 'pm51-servers-approve', data: { id: p.id } }) + PM51.btn({ label: 'Reject', small: true, action: 'pm51-servers-reject', data: { id: p.id } })
      }))) : PM51.empty('No devices waiting.', 'Requests show up here when a device enters your pairing code.')
    });
    const continuity = PM51.section({
      title: 'Continue on another device', help: 'What picks up where you left off when you switch devices.',
      body: PM51.rows(Object.entries(S.continuity).map(([key, on]) => ({ label: key, control: PM51.toggle(!!on, { action: 'pm51-servers-cont', data: { key, 'ui-action-id': 'ui.settings.project_sync.continuity.preview_edit' }, label: key }) })))
    });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Trust roles', body: PM51.kv([['Owner', 'Can change servers, pair and revoke devices, and restore backups.'], ['Member', 'Can open the workspace and run work.'], ...S.devices.map(d => [d.name, d.trust || 'Member'])]) }),
      PM51.section({ title: 'Pairing history', body: PM51.kv([['Last pairing', 'Browser session · today'], ['Codes issued', '4'], ['Current code', S.pairing.code ? `Expires in ${S.pairing.expiresIn}` : 'None']]) }),
      PM51.section({ title: 'Danger zone', body: PM51.rows([{ label: 'Revoke all devices', help: 'Every device must pair again, including this one.', action: { label: 'Revoke all devices', danger: true, action: 'pm51-servers-revoke-all' } }]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-servers-diagnostics', data: { scope: 'devices' } })}</div>` })
    ].join(''));
    return devices + pending + continuity + advanced;
  }

  /* ---------- Away From Home ---------------------------------------------- */
  const moveBtn = (r, dir, off, reason) => `<button type="button" class="icon-btn pm51-icon-btn pm51-servers-move-btn" data-action="${off ? 'pm51-disabled' : 'pm51-servers-route-move'}" data-id="${a(r.id)}" data-dir="${dir}" aria-label="${a(`Move ${r.name} ${dir}`)}" data-pm-hover-label="${a(dir === 'up' ? 'Try earlier' : 'Try later')}"${off ? ` aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${a(reason)}" data-pm-hover-detail="${a(reason)}"` : ''}>${icon(dir)}</button>`;
  /* Exactly one primary per state; the row owns the check for ready / needs-attention routes and the
     sheet owns it for active / off routes, so each route has one Check control across row + sheet. */
  function routePrimary(r) {
    const data = { id: r.id };
    if (r.status === 'not-set-up') return PM51.btn({ label: r.setupLabel || 'Set Up', small: true, primary: !!r.recommended, action: 'pm51-servers-remote', data });
    if (r.status === 'needs-sign-in') return PM51.btn({ label: r.kind === 'remote-link' ? 'Continue pairing' : 'Continue sign-in', small: true, primary: true, action: 'pm51-servers-remote', data });
    if (r.status === 'testing') return PM51.btn({ label: 'Check route', small: true, icon: 'test', action: 'pm51-servers-route-check', data, disabled: true, reason: 'A check is already running.' });
    if (r.status === 'ready' || r.status === 'needs-attention' || r.status === 'offline') return PM51.btn({ label: 'Check route', small: true, icon: 'test', action: 'pm51-servers-route-check', data });
    return PM51.btn({ label: 'Manage', small: true, action: 'pm51-servers-remote', data });
  }
  function routeRowEnd(r, i, sorted) {
    const parts = [routeToken(r)];
    if (!r.locked) {
      const prev = sorted[i - 1], next = sorted[i + 1];
      parts.push(`<span class="pm51-servers-move">${moveBtn(r, 'up', !prev || !!prev.locked, prev && prev.locked ? 'Local network is always first' : 'Already first')}${moveBtn(r, 'down', !next, 'Already last')}</span>`);
      if (routeConfigured(r)) parts.push(PM51.toggle(!!r.enabled, { action: 'pm51-servers-route-toggle', data: { id: r.id }, label: `Use ${r.name} when away` }));
    }
    parts.push(routePrimary(r));
    return parts.join('');
  }
  function routeItems(sorted) {
    const R = ra(), items = [];
    sorted.forEach((r, i) => {
      items.push({
        title: r.name, pill: r.recommended ? PM51.tag('Recommended') : '',
        meta: r.locked ? `Always first · ${r.description}` : r.description,
        avatar: PM51.order(i + 1, { locked: !!r.locked }),
        end: routeRowEnd(r, i, sorted), cls: 'pm51-servers-route', data: { route: r.id, status: r.status }
      });
      if (r.kind === 'domain' && R.funnel && R.funnel.enabled) items.push({
        title: 'Public browser access', pill: PM51.tag('Funnel'), meta: 'Anyone with the address can reach the sign-in page. Turn it off under Advanced.',
        avatar: `<span class="pm51-order is-locked" aria-label="Public route">${icon('external')}</span>`,
        end: PM51.status('On', 'attention'), cls: 'pm51-servers-route is-funnel', data: { 'public-route': 'funnel' }
      });
    });
    return items;
  }
  function renderAway() {
    const R = ra(), sorted = routesSorted(), actual = actualRoute(), preferred = preferredRoute();
    const overview = PM51.section({
      title: 'Away from home', help: 'Puppet Master tries these in order, private and local first. You can change the order.',
      body: PM51.rows([
        { label: 'Right now', help: 'The route your devices are using at this moment.', control: `<span class="pm51-row-value">${h(actual.status === 'active' ? `Connected · ${actual.name}` : actual.name)}</span>${routeToken(actual)}` },
        { label: 'Preferred when away', help: 'The first route that is set up and turned on.', control: preferred ? `<span class="pm51-row-value">${h(preferred.name)}</span>${routeToken(preferred)}` : `<span class="pm51-row-value is-muted">None set up yet — set one up below</span>${PM51.status('Not set up', 'attention')}` }
      ])
    });
    const routes = PM51.section({
      title: 'Routes, in the order they are tried', help: 'Local network stays first. Move the others to choose what is tried next when you are away.',
      action: R.order === 'custom' ? PM51.link({ label: 'Use recommended order', action: 'pm51-servers-order-reset', cls: 'pm51-servers-order-reset' }) : `<span class="pm51-servers-order-mode">Recommended order</span>`,
      body: PM51.list(routeItems(sorted), { cls: 'pm51-servers-routes' })
    });
    const hs = R.headscale || {}, pub = !!(R.funnel && R.funnel.enabled), headscaleOn = !!String(hs.address || '').trim();
    const advanced = PM51.advanced([
      PM51.section({ title: 'Other Tailscale setup', help: 'For people who run their own coordination server (Headscale).', body: PM51.rows([
        { label: 'Self-hosted Headscale address', control: PM51.input(hs.address || '', { action: 'pm51-servers-headscale', placeholder: 'https://headscale.example.net', label: 'Headscale address' }) },
        { label: 'Registration', control: PM51.dropdown(hs.registration || 'Automatic', ['Automatic', 'Ask administrator', 'One-time key'], { action: 'pm51-servers-headscale-reg', label: 'Registration' }) }
      ]) }),
      PM51.section({ title: 'Browser access from anywhere', help: 'Lets anyone with the address reach the sign-in page. Prefer Tailscale, your VPN, or Remote Link.', body: PM51.rows([
        { label: 'Public browser access', help: pub ? 'On through Tailscale Funnel. It also shows in the route list above.' : 'Off. Your server is not reachable from the open internet.', control: PM51.status(pub ? 'On' : 'Off', pub ? 'attention' : 'off'), action: { label: pub ? 'Turn Off' : 'Turn On', action: 'pm51-servers-public', danger: !pub, disabled: !pub && headscaleOn, reason: 'Funnel is not available with a self-hosted Headscale.' } }
      ]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv([
        ['Trusted proxy', R.domain && R.domain.name ? `${R.domain.proxy} at ${R.domain.name}` : 'None'],
        ['Connector identity', fingerprint(homeServer())],
        ['Route order', sorted.map(r => r.id).join(' → ')],
        ['Canonical kinds', sorted.flatMap(r => [ROUTE_KINDS[r.kind] ? ROUTE_KINDS[r.kind].canonical : r.kind].concat(r.kind === 'domain' && pub ? ['Funnel'] : [])).join(' → ')],
        ['Preference mode', R.order === 'custom' ? 'Custom · you changed the order' : 'Recommended · private and local first'],
        ['Actual route', `${actual.id} · ${actual.name}`],
        ['Public access', pub ? 'On · Funnel' : 'Off']
      ]) + `<div class="pm51-servers-subhead">Route lifecycle names</div>` + PM51.kv(sorted.map(r => [r.name, `${r.status} → ${routeLifecycle(r)}`])) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-servers-diagnostics', data: { scope: 'away' } })}</div>` })
    ].join(''));
    return overview + routes + advanced;
  }

  /* ---------- Move & Copy ------------------------------------------------- */
  function renderMove() {
    const S = sp(), M = S.move;
    const dest = M.destination;
    const move = PM51.section({
      title: 'Move this workspace to another server', help: 'Nothing moves until you confirm. Work pauses safely while it happens.',
      body: PM51.steps([
        { title: 'Choose destination', desc: dest ? dest : 'No destination chosen yet.', done: !!dest, action: { label: dest ? 'Change' : 'Choose…', action: 'pm51-servers-move-dest' } },
        { title: 'Check before moving', desc: M.preflight ? `Checked ${M.preflight.at} · example data` : 'Space, reachability, open conflicts, and unsaved work.', done: !!M.preflight, action: { label: 'Check before moving', icon: 'test', action: 'pm51-servers-move-check', disabled: !dest, reason: 'Choose a destination first.', data: { 'command-id': 'cmd.project.move.preflight' } } },
        { title: 'Move workspace', desc: 'Asks for confirmation. Never automatic.', action: { label: 'Move workspace', primary: true, action: 'pm51-servers-move-start', disabled: !M.preflight, reason: 'Run the check first.', data: { 'command-id': 'cmd.project.move.start' } } }
      ])
    });
    const copy = PM51.section({
      title: 'Copy',
      body: PM51.rows([{ label: 'Copy workspace to…', help: 'Makes an independent copy. The original stays where it is.', action: { label: 'Copy…', icon: 'copy', action: 'pm51-servers-copy', data: { 'command-id': 'cmd.project.duplicate_with_history' } } }])
    });
    const conflicts = PM51.section({
      title: 'Conflicts',
      body: PM51.rows([
        { label: 'When both sides changed', value: S.conflicts.policy, action: { label: 'Change', action: 'pm51-servers-conflict-policy' } },
        { label: 'Open conflicts', value: String(S.conflicts.open || 0), action: { label: 'View', action: 'pm51-servers-conflicts-view' } }
      ])
    });
    const sshList = S.sshFolders.length ? PM51.list(S.sshFolders.map(f => ({
      title: f.name, meta: `${f.address} · ${f.folder}`, avatar: icon('terminal'),
      end: PM51.iconBtn({ icon: 'more', label: `More for ${f.name}`, callback: el => PM51.menu(el, [
        { label: 'Edit', icon: 'edit', onClick: () => sshDialog(f) },
        { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${f.name}?`, 'The folder on the SSH computer is not touched. Only the shortcut here is removed.', 'Remove', () => { S.sshFolders = S.sshFolders.filter(x => x.id !== f.id); refresh(); }, true) }
      ], f.name), ui: 'ui.settings.project_sync.remote.preview_edit' })
    }))) : PM51.empty('No SSH folders', 'Add a folder on another computer you reach over SSH.');
    const advanced = PM51.advanced([
      PM51.section({ title: 'SSH folders', help: 'Folders on other computers, reached over SSH.', action: { label: 'Add SSH folder', icon: 'plus', small: true, action: 'pm51-servers-ssh-add', ui: 'ui.settings.project_sync.remote.preview_add' }, body: sshList + `<div style="margin-top:10px">${PM51.btn({ label: 'Import from an SSH folder', small: true, icon: 'download', action: 'pm51-servers-ssh-import', ui: 'ui.settings.project_sync.remote.preview_import' })}</div>` }),
      PM51.section({ title: 'Move history', body: M.history.length ? PM51.kv(M.history.map(x => [`${x.time} · ${x.kind || 'Move'}`, `${x.destination} · ${x.result}`])) : PM51.empty('No moves yet', 'Moves and copies you start show up here.') }),
      PM51.section({ title: 'Technical details', body: `<div class="pm51-servers-actions">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-servers-diagnostics', data: { scope: 'move' } })}${pm7ConsumerButton('local', 'ui.project.move.open_details', 'Move details')}${pm7ConsumerButton('command', 'cmd.project.move.preflight', 'Preflight move')}${pm7ConsumerButton('command', 'cmd.project.move.start', 'Start move')}${pm7ConsumerButton('command', 'cmd.project.duplicate_configuration', 'Copy configuration')}${pm7ConsumerButton('command', 'cmd.project.duplicate_with_history', 'Copy with history')}</div>` })
    ].join(''));
    return move + copy + conflicts + advanced;
  }

  function render() {
    const tab = PM51.tab(ID, 'home');
    const body = tab === 'servers' ? renderServers() : tab === 'devices' ? renderDevices() : tab === 'away' ? renderAway() : tab === 'move' ? renderMove() : renderHome();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Open Readiness & Doctor', action: 'pm51-go', data: { domain: 'system', workspace: 'doctor' } },
      { label: 'How servers and devices work', action: 'pm51-servers-help' }
    ] });
  }
  PM51.manager('serverLocation', { render });

  /* ---------- dialogs & panels -------------------------------------------- */
  function qrSvg(seed) {
    let x = 7; for (const c of String(seed)) x = (x * 33 + c.charCodeAt(0)) >>> 0;
    const n = 21, cells = [];
    const finder = (ox, oy) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { const edge = i === 0 || j === 0 || i === 6 || j === 6, core = i >= 2 && i <= 4 && j >= 2 && j <= 4; if (edge || core) cells.push([ox + j, oy + i]); } };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const inFinder = (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8); if (inFinder) continue;
      x = (x * 1103515245 + 12345) >>> 0; if ((x >>> 16) & 1) cells.push([j, i]);
    }
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true">${cells.map(([cx, cy]) => `<rect x="${cx}" y="${cy}" width="1" height="1" fill="#111"/>`).join('')}</svg>`;
  }
  function newCode() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; const pick = () => A[Math.floor(Math.random() * A.length)]; return `${pick()}${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}${pick()}`; }
  function pairingBody() {
    const P = sp().pairing;
    return `<div class="pm51-servers-pair"><div class="pm51-servers-qr">${qrSvg(P.code)}</div><div><div class="pm51-servers-pair-code" data-pair-code>Pairing code: ${h(P.code)}</div><div class="pm51-servers-pair-meta" data-pair-expires>Expires in ${h(P.expiresIn)}</div><div class="pm51-servers-pair-link">Local link: ${h(P.link)}</div><div class="pm51-servers-pair-actions">${PM51.btn({ label: 'Copy Link', small: true, icon: 'copy', action: 'pm51-servers-pair-copy' })}${PM51.btn({ label: 'New Code', small: true, icon: 'refresh', action: 'pm51-servers-pair-new' })}</div></div></div>${PM51.note('On the other device, open Puppet Master and enter this code, or scan the QR code with your phone.', 'info')}`;
  }
  function openPairing() {
    const S = sp();
    if (!S.pairing.code) { S.pairing.code = newCode(); S.pairing.expiresIn = '10:00'; }
    openDialog({ title: 'Pair Another Device', subtitle: `Works on your home network. Away from home, set up a route first.`, body: `<div data-pairing-dialog>${pairingBody()}</div>`, cancelLabel: 'Cancel Code', onOpen: overlay => {
      const cancel = overlay.querySelector('.dialog-footer .btn[data-action="close-overlay"]');
      if (cancel) cancel.addEventListener('click', () => { S.pairing.code = ''; S.pairing.expiresIn = ''; saveState(); PM51.toast('Pairing code cancelled', 'This code no longer works. Make a new one when you need it.', 'info'); });
    } });
  }
  function renameServer(srv) {
    openDialog({ title: `Rename ${srv.name}`, body: PM51.form([{ label: 'Name', name: 'name', value: srv.name, autofocus: true }]), saveLabel: 'Save', onSave: data => { const name = String(data.name || '').trim(); if (!name) return false; srv.name = name; refresh(); } });
  }
  function sshDialog(f) {
    const creating = !f;
    openDialog({ title: creating ? 'Add SSH folder' : `Edit ${f.name}`, subtitle: 'Puppet Master uses your existing SSH keys. Passwords are never stored here.', body: PM51.form([
      { label: 'Name', name: 'name', value: f ? f.name : '', autofocus: true, placeholder: 'Ubuntu VM' },
      { label: 'Address', name: 'address', value: f ? f.address : '', placeholder: 'user@host' },
      { label: 'Folder', name: 'folder', value: f ? f.folder : '', placeholder: '/home/user/projects' }
    ]), saveLabel: creating ? 'Add folder' : 'Save', onSave: data => {
      const name = String(data.name || '').trim(), address = String(data.address || '').trim(); if (!name || !address) { PM51.toast('Name and address are needed', 'Fill in both to continue.', 'warning'); return false; }
      if (creating) sp().sshFolders.push({ id: uid('ssh', name), name, address, folder: String(data.folder || '') }); else Object.assign(f, { name, address, folder: String(data.folder || '') });
      refresh();
    } });
  }
  function conflictPolicyDialog() {
    const S = sp();
    openDialog({ title: 'When both sides changed', subtitle: 'What happens when the same file changed on two devices.', body: PM51.form([{ label: 'Policy', name: 'policy', value: S.conflicts.policy, type: 'select', choices: CONFLICT_POLICIES.includes(S.conflicts.policy) ? CONFLICT_POLICIES : [S.conflicts.policy, ...CONFLICT_POLICIES], full: true }]), saveLabel: 'Save', onSave: data => { S.conflicts.policy = String(data.policy || S.conflicts.policy); if (state.projectSync) state.projectSync.conflictPolicy = S.conflicts.policy; refresh(); } });
  }
  function devicePanel(id) {
    const S = sp(), d = S.devices.find(x => x.id === id); if (!d) return;
    PM51.panel({
      title: d.name, subtitle: `${d.platform} · ${d.role}`, icon: d.platform === 'Web' ? 'browser' : 'system', status: d.state, facts: [{ label: 'Trust', value: d.trust || 'Member' }, { label: 'Last seen', value: d.lastSeen }, { label: 'Role', value: d.role }],
      body: PM51.panelSection('Device', PM51.kv([['Platform', d.platform], ['Role', d.role], ['Trust', d.trust || 'Member'], ['Last seen', d.lastSeen], ['Connection', d.state]]))
        + PM51.panelSection('Actions', `<div class="pm51-servers-actions">${PM51.btn({ label: 'Rename Device', small: true, icon: 'edit', action: 'pm51-servers-device-rename', data: { id } })}${PM51.btn({ label: 'Review Access', small: true, icon: 'shield', action: 'pm51-servers-device-access', data: { id } })}${PM51.btn({ label: 'Check device', small: true, icon: 'test', action: 'pm51-servers-device-check', data: { id } })}${PM51.btn({ label: 'Revoke Device', small: true, danger: true, icon: 'trash', action: 'pm51-servers-device-revoke', data: { id } })}</div>`),
      primaryLabel: 'Done', onPrimary: () => {}
    });
  }
  function railSteps(steps, doneCount, inProgress) {
    const items = steps.map((s, i) => Object.assign({}, s, i < doneCount ? { done: true } : i === doneCount ? { tone: inProgress ? 'attention' : 'info', status: inProgress ? 'In progress' : 'Next' } : {}));
    return PM51.steps(items).replace('class="pm51-steps"', 'class="pm51-steps pm51-rail"');
  }
  const useRouteCard = r => PM51.panelSection('Use this route', PM51.rows([{ label: 'Try this route when away', help: 'Off keeps the setup but skips this route.', control: PM51.toggle(!!r.enabled, { action: 'pm51-servers-route-toggle', data: { id: r.id }, label: `Use ${r.name} when away` }) }]), '', { icon: 'route' });
  const fieldValue = (wrap, selector) => String((wrap && wrap.querySelector(selector) || {}).value || '').trim();
  /* Per-kind sheet content: summary, body cards (steps rail first) and the state's primary action. */
  function routeSheet(r) {
    const R = ra(), home = homeServer(), configured = routeConfigured(r), settled = routeReady(r) || r.status === 'off' || r.status === 'testing';
    if (r.kind === 'lan') return {
      summary: 'Your devices reach the server directly on your home network. Always tried first, nothing to set up.',
      body: PM51.panelSection('At home', PM51.kv([['Address', home.address], ['Identity', fingerprint(home)], ['Fast path', 'No relay needed at home'], ['Devices connected', String(sp().devices.filter(d => d.state === 'Connected').length)]]), '', { icon: 'home' })
        + PM51.note('Away from home, the routes below Local network are tried in order.', 'info'),
      primary: null
    };
    if (r.kind === 'tailscale') {
      const steps = [
        { title: 'Sign in', desc: 'Use Google, Microsoft, GitHub, or Apple. Nothing extra to install.' },
        { title: 'Approve device', desc: 'Confirm this device in your Tailscale admin page.' },
        { title: 'Private address', desc: 'Your server gets a private name that works from anywhere.' },
        { title: 'Test', desc: 'Puppet Master checks the new route from this device.' }
      ];
      return {
        summary: 'Built into Puppet Master. A private network between your devices, with nothing opened to the public internet.',
        body: PM51.panelSection('Steps', railSteps(steps, settled ? 4 : configured ? 3 : 0, r.status === 'needs-sign-in'), '', { icon: 'route' })
          + (configured ? PM51.panelSection('Details', PM51.kv([['Private address', 'home-truenas.example-tailnet.ts.net · example'], ['Signed in with', 'Google · example'], ['Who can connect', 'Only your signed-in devices']]), '', { icon: 'network' }) + useRouteCard(r) : '')
          + PM51.note('Nothing is opened to the public internet. Only your signed-in devices can connect.', 'info'),
        primary: r.status === 'not-set-up' ? { label: 'Start sign-in', run: () => { r.status = 'needs-sign-in'; refresh(); PM51.toast('Tailscale sign-in started', 'Example data only. In the real app a sign-in window opens next.', 'info'); } }
          : r.status === 'needs-sign-in' ? { label: 'Continue sign-in', run: () => { r.status = 'needs-attention'; r.lastCheck = 'Never'; refresh(); PM51.toast('Tailscale is set up', 'Example data only. Run Check route to make sure it works from here.', 'info'); } }
          : null
      };
    }
    if (r.kind === 'vpn') {
      const v = R.vpn || { kind: 'WireGuard', address: '' };
      const steps = [{ title: 'Enter address', desc: 'The server’s address inside your VPN.' }, { title: 'Test', desc: 'Puppet Master checks the route while you are connected to the VPN.' }];
      return {
        summary: 'A VPN you already run. Puppet Master never changes it; it only uses the address you give it.',
        body: PM51.panelSection('Steps', railSteps(steps, settled ? 2 : configured ? 1 : 0, false), '', { icon: 'route' })
          + PM51.panelSection('Your VPN', PM51.field('VPN', PM51.dropdown(v.kind || 'WireGuard', ['WireGuard', 'OpenVPN', 'Other'], { action: 'pm51-servers-vpn-kind', label: 'VPN' })) + PM51.field('Server address on the VPN', PM51.input(v.address || '', { action: 'pm51-servers-vpn-address', placeholder: '10.8.0.2 or truenas.vpn', label: 'Server address on the VPN' }), 'Ask whoever set up the VPN if you are not sure.'), '', { icon: 'shield' })
          + (configured ? useRouteCard(r) : '')
          + PM51.note('Puppet Master never changes your VPN. It only uses the address you give it.', 'info'),
        primary: !configured ? { label: 'Save', run: wrap => {
          const address = fieldValue(wrap, 'input[data-action="pm51-servers-vpn-address"]'), kind = fieldValue(wrap, 'select[data-action="pm51-servers-vpn-kind"]') || 'WireGuard';
          if (!address) { PM51.toast('Address needed', 'Enter the server’s address on the VPN.', 'warning'); return false; }
          R.vpn = { kind, address }; r.status = 'needs-attention'; r.lastCheck = 'Never'; refresh(); PM51.toast('VPN route saved', 'Example data only. Run Check route while connected to your VPN.', 'info');
        } } : null
      };
    }
    if (r.kind === 'domain') {
      const dom = R.domain || { name: '', proxy: 'NGINX' };
      const steps = [{ title: 'Point your domain', desc: 'Point the name at your home IP address.' }, { title: 'Generate proxy setup', desc: 'Copy the NGINX or Traefik block into your proxy.' }, { title: 'Test', desc: 'Puppet Master checks the address from this device.' }];
      return {
        summary: 'Your own address through NGINX or Traefik. It is a public address, so sign-in is still required.',
        body: PM51.panelSection('Steps', railSteps(steps, settled ? 3 : configured ? (dom.generated ? 2 : 1) : 0, false), '', { icon: 'route' })
          + PM51.panelSection('Your domain', PM51.field('Domain', PM51.input(dom.name || '', { action: 'pm51-servers-domain-name', placeholder: 'pm.example.com', label: 'Domain' }), 'Point this name at your home IP address.') + PM51.field('Proxy', PM51.dropdown(dom.proxy || 'NGINX', ['NGINX', 'Traefik'], { action: 'pm51-servers-domain-proxy', label: 'Proxy' })), '', { icon: 'browser' })
          + PM51.panelSection('Proxy setup', `<div class="pm51-servers-actions">${PM51.btn({ label: 'Generate Setup', small: true, icon: 'file', action: 'pm51-servers-domain-generate' })}</div><div data-domain-config style="margin-top:10px">${dom.generated && dom.name ? `<div class="pm51-servers-conf">${h(proxyConfig(dom.name, dom.proxy))}</div>` : ''}</div>`, 'An example block for your proxy. Paste it and reload the proxy.', { icon: 'file' })
          + (configured ? useRouteCard(r) : '')
          + PM51.note('A domain is a public address. Prefer Tailscale, your VPN, or Remote Link when you can.', 'info'),
        primary: !configured ? { label: 'Save', run: wrap => {
          const name = fieldValue(wrap, 'input[data-action="pm51-servers-domain-name"]'), proxy = fieldValue(wrap, 'select[data-action="pm51-servers-domain-proxy"]') || 'NGINX';
          if (!name) { PM51.toast('Enter a domain first', 'The route needs a name like pm.example.com.', 'warning'); return false; }
          R.domain = { name, proxy, generated: !!(R.domain && R.domain.generated && R.domain.name === name) }; r.status = 'needs-attention'; r.lastCheck = 'Never'; refresh(); PM51.toast('Domain saved', 'Run Check route once your DNS points at home.', 'info');
        } } : null
      };
    }
    const link = R.remoteLink || null;
    const steps = [{ title: 'Create link', desc: 'Your server gets a link only your devices know.' }, { title: 'Pair this device', desc: 'Uses the same pairing code as on your home network.' }, { title: 'Test', desc: 'Puppet Master checks the link from this device.' }];
    return {
      summary: 'No account or domain needed. Direct when possible, relayed otherwise, and encrypted end to end either way.',
      body: PM51.panelSection('Steps', railSteps(steps, settled ? 3 : configured ? 2 : link ? 1 : 0, false), '', { icon: 'route' })
        + (link ? PM51.panelSection('Your link', PM51.kv([['Link', link.link], ['Created', link.created], ['Relay', 'Only when a direct connection is not possible']]), '', { icon: 'link' }) : '')
        + (configured ? useRouteCard(r) : '')
        + PM51.note('Traffic stays encrypted end to end. The relay only passes it along.', 'info'),
      primary: r.status === 'not-set-up' ? { label: 'Create link', run: () => { R.remoteLink = { link: `pm-link://${home.id}-${newCode().toLowerCase()}`, created: `Today · ${nowLabel()}` }; r.status = 'needs-sign-in'; refresh(); PM51.toast('Remote Link created', 'Example data only. Pair this device next.', 'info'); } }
        : r.status === 'needs-sign-in' ? { label: 'Pair this device', run: () => { r.status = 'needs-attention'; r.lastCheck = 'Never'; refresh(); PM51.toast('Device paired', 'Example data only. Run Check route to make sure the link works from here.', 'info'); } }
        : null
    };
  }
  function remotePanel(id) {
    const r = routeById(id); if (!r) return;
    const K = ROUTE_KINDS[r.kind] || {}, info = routeInfo(r), spec = routeSheet(r);
    const primary = spec.primary || ((r.status === 'active' || r.status === 'off') ? { label: 'Check route', run: () => runRouteCheck(r) } : null);
    PM51.panel({
      title: r.name, eyebrow: r.recommended ? 'Recommended route' : r.locked ? 'Always first' : 'Route', icon: K.icon || 'network',
      summary: spec.summary, status: { label: routeLabel(r), tone: info.tone }, tone: info.tone === 'ready' || info.tone === 'attention' || info.tone === 'blocked' ? info.tone : '',
      facts: [{ label: 'Order', value: `Tried ${ordinal(routePosition(r))}` }, { label: 'Privacy', value: r.private ? 'Private' : 'Public address' }, { label: 'Last check', value: r.lastCheck || 'Never' }],
      body: spec.body,
      primaryLabel: primary ? primary.label : '', onPrimary: primary ? wrap => primary.run(wrap) : null
    });
  }
  function proxyConfig(name, proxy) {
    return proxy === 'Traefik'
      ? `# Traefik dynamic config (example)\nhttp:\n  routers:\n    puppet-master:\n      rule: "Host(\`${name}\`)"\n      service: puppet-master\n      tls:\n        certResolver: letsencrypt\n  services:\n    puppet-master:\n      loadBalancer:\n        servers:\n          - url: "http://${homeServer().address}:8443"`
      : `# NGINX server block (example)\nserver {\n  server_name ${name};\n  listen 443 ssl http2;\n  location / {\n    proxy_pass http://${homeServer().address}:8443;\n    proxy_set_header Host $host;\n    proxy_set_header Upgrade $http_upgrade;\n    proxy_set_header Connection "upgrade";\n  }\n}`;
  }
  function checkSteps(r) {
    const R = ra(), home = homeServer();
    if (r.kind === 'lan') return [
      { title: 'Server found on this network', desc: home.address },
      { title: 'Identity matches', desc: fingerprint(home) },
      { title: 'Fast path in use', desc: 'No relay needed at home' }
    ];
    const via = r.kind === 'tailscale' ? 'Private Tailscale address' : r.kind === 'vpn' ? `VPN address ${(R.vpn || {}).address || ''}`.trim() : r.kind === 'domain' ? `${(R.domain || {}).proxy || 'Proxy'} at ${(R.domain || {}).name || 'your domain'}` : 'Remote Link, direct or relayed';
    return [
      { title: 'Route is set up', desc: via },
      { title: 'Server reachable through the route', desc: 'Example data · the live connector proves this in the real app' },
      { title: 'Identity matches', desc: fingerprint(home) },
      { title: 'Sign-in page answers', desc: 'Example data' }
    ];
  }
  /* The one check per route. A configured route that passes becomes Ready and is turned on
     (reaching ready sets enabled = true); a route the user turned off keeps its Off state. */
  function runRouteCheck(r) {
    if (r.status === 'testing') return;
    const wasOff = r.status === 'off', settles = r.kind !== 'lan' && r.status !== 'active';
    if (settles) { r.status = 'testing'; refresh(); }
    PM51.check({ title: `Check route · ${r.name}`, steps: checkSteps(r), outcome: 'Checked · example data' });
    window.setTimeout(() => {
      const cur = routeById(r.id); if (!cur) return;
      cur.lastCheck = 'Just now';
      if (settles && cur.status === 'testing') { cur.status = wasOff ? 'off' : 'ready'; if (!wasOff) cur.enabled = true; }
      refresh();
    }, settles ? 700 : 0);
  }
  function syncRouteSheet(r, el) {
    const panel = el && el.closest ? el.closest('.pm51-panel') : null; if (!panel) return;
    const st = panel.querySelector('.pm51-hero-status'); if (st) st.innerHTML = routeToken(r);
    panel.querySelectorAll(`.pm51-toggle[data-action="pm51-servers-route-toggle"][data-id="${r.id}"]`).forEach(t => { t.classList.toggle('on', !!r.enabled); t.setAttribute('aria-checked', r.enabled ? 'true' : 'false'); });
  }
  function diagnostics(scope) {
    const S = sp(), home = homeServer();
    const steps = {
      home: [{ title: 'Home server reachable', desc: home.address }, { title: 'Files where expected', desc: S.sourceLocation.path }, { title: 'Work can run', desc: runLabel() }, { title: 'Continuity items stored', desc: `${Object.values(S.continuity).filter(Boolean).length} of ${Object.keys(S.continuity).length} on` }],
      servers: [{ title: 'Every server answers', desc: S.servers.map(s => s.name).join(', ') }, { title: 'Identities match', desc: 'Saved fingerprints' }, { title: 'Versions compatible', desc: [...new Set(S.servers.map(s => s.version))].join(', ') }],
      devices: [{ title: 'Paired devices reachable', desc: `${S.devices.length} devices` }, { title: 'Trust roles valid', desc: 'Owner and Member' }, { title: 'Pairing code state', desc: S.pairing.code ? 'Active' : 'None active' }],
      away: (() => { const R = ra(), sorted = routesSorted(), actual = actualRoute(), ready = sorted.filter(r => r.id !== 'lan' && r.enabled && routeReady(r)); return [
        { title: 'Route in use', desc: `${actual.name} · ${routeLabel(actual)}` },
        { title: 'Routes ready for away', desc: ready.length ? ready.map(r => r.name).join(', ') : 'None set up yet', tone: ready.length ? 'ready' : 'attention', status: ready.length ? 'Checked' : 'Set one up' },
        { title: 'Order tried', desc: `${sorted.map(r => r.name).join(' → ')} · ${R.order === 'custom' ? 'your order' : 'recommended'}` },
        { title: 'Public access', desc: R.funnel && R.funnel.enabled ? 'On · Funnel' : 'Off', tone: R.funnel && R.funnel.enabled ? 'attention' : 'ready' }
      ]; })(),
      move: [{ title: 'Destination reachable', desc: S.move.destination || 'No destination chosen' }, { title: 'Open conflicts', desc: String(S.conflicts.open || 0) }, { title: 'SSH folders reachable', desc: S.sshFolders.map(f => f.name).join(', ') || 'None' }]
    }[scope] || [];
    PM51.check({ title: 'Server & Project Location diagnostics', steps });
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.onChange('servers-home', el => { sp().homeServer = el.value; PM51.setSel(ID, el.value); refresh(); });
  PM51.onChange('servers-exec', el => { sp().executionHost = el.value; refresh(); });
  PM51.on('servers-files', () => {
    const S = sp();
    openDialog({ title: 'Change files location', subtitle: 'Where this workspace’s files live. The current files stay until you move them.', body: PM51.form([
      { label: 'Kind', name: 'kind', value: S.sourceLocation.kind, type: 'select', choices: FILE_KINDS, full: true },
      { label: 'Path or address', name: 'path', value: S.sourceLocation.path, autofocus: true, full: true, help: 'For a code service or SSH computer, paste the address.' }
    ]), saveLabel: 'Use this location', onSave: data => { const path = String(data.path || '').trim(); if (!path) return false; S.sourceLocation = { kind: String(data.kind), path }; if (state.projectSync) state.projectSync.location = path; refresh(); } });
  });
  PM51.on('servers-conflict-policy', conflictPolicyDialog);
  PM51.on('servers-diagnostics', el => diagnostics(ds(el, 'scope') || 'home'));
  PM51.on('servers-help', () => PM51.panel({
    title: 'How servers and devices work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Your workspace lives on one home server. Your devices connect to it, and work can run on the server or on a device you choose.</p>')
      + PM51.panelSection('Words used here', PM51.kv([['Home server', 'Where the workspace and its files live.'], ['Runs on', 'Where Goals and tasks actually execute.'], ['Device', 'A computer or browser you have paired with the server.'], ['Route', 'A way for a device to reach the server: your local network, Tailscale, a VPN you already run, your own domain, or Puppet Master Remote Link.']]))
      + PM51.panelSection('Away from home', '<p class="pm51-ps-text">On your home network everything just works. Away from home, Puppet Master tries your routes in order, private and local first. Tailscale is the easiest and keeps your server private; you can change the order under Away From Home.</p>')
  }));

  /* servers roster */
  PM51.on('servers-add', () => {
    const S = sp();
    openDialog({ title: 'Add a server', subtitle: 'Find one on your network, enter an address, or turn this computer into a server.', body: PM51.form([
      { label: 'How', name: 'how', value: 'Find nearby', type: 'select', choices: ADD_HOW, full: true },
      { label: 'Name', name: 'name', value: '', placeholder: 'Office NAS', autofocus: true },
      { label: 'Address', name: 'address', value: '', placeholder: 'nas.local or 192.168.1.20', help: 'Leave empty when finding nearby.' }
    ]), saveLabel: 'Add server', onSave: data => {
      const how = String(data.how), name = String(data.name || '').trim() || (how === 'Use this computer as a server' ? 'This computer' : 'New server');
      const address = String(data.address || '').trim() || (how === 'Use this computer as a server' ? 'localhost' : how === 'Find nearby' ? 'Searching…' : '');
      if (!address) { PM51.toast('Address needed', 'Enter the server’s address to continue.', 'warning'); return false; }
      const id = uid('server', name);
      S.servers.push({ id, name, role: how === 'Use this computer as a server' ? 'This computer' : 'Server', address, state: 'Waiting for host', version: '—', updateReady: false, runsWork: false, default: false, lastCheck: 'Not checked yet', deployment: how === 'Claim a new server' ? 'Not installed yet' : 'Unknown', environments: [], claimed: false, claimSteps: {} });
      PM51.setSel(ID, id); refresh();
    } });
  });
  PM51.on('servers-webui', el => { const s = serverById(ds(el, 'id')); if (s) PM51.toast('Opens in your browser', `Example data only. The real app opens https://${s.address} in a new window.`, 'info'); });
  PM51.on('servers-runs', el => { const s = serverById(ds(el, 'id')); if (s) { s.runsWork = !s.runsWork; refresh(); } });
  PM51.on('servers-default', el => {
    const S = sp(), s = serverById(ds(el, 'id')); if (!s) return;
    if (s.default) { PM51.toast('One server must be the default', 'Turn this on for another server instead.', 'info'); return; }
    S.servers.forEach(x => { x.default = x.id === s.id; }); refresh();
  });
  PM51.on('servers-test', el => {
    const s = serverById(ds(el, 'id')); if (!s) return;
    PM51.check({ title: `Test connection · ${s.name}`, steps: [
      { title: 'Address resolves', desc: s.address },
      { title: 'Server answers', desc: 'Puppet Master service' },
      { title: 'Identity matches', desc: fingerprint(s) },
      { title: 'Version compatible', desc: s.version === '—' ? 'Unknown until claimed' : s.version, tone: s.version === '—' ? 'attention' : 'ready', status: s.version === '—' ? 'Unknown' : 'Checked' }
    ] });
  });
  PM51.on('servers-claim-identity', el => {
    const s = serverById(ds(el, 'id')); if (!s) return;
    openDialog({ title: 'Confirm identity', subtitle: `Compare this fingerprint with the one shown on ${s.name}. They must match exactly.`, body: `<div class="pm51-servers-conf">${h(fingerprint(s))}</div>`, saveLabel: 'They match', onSave: () => { s.claimSteps = Object.assign({}, s.claimSteps, { identity: true }); refresh(); } });
  });
  PM51.on('servers-claim', el => {
    const s = serverById(ds(el, 'id')); if (!s) return;
    PM51.confirm(`Claim ${s.name}?`, 'The server is tied to your account. Only your devices can use it afterwards.', 'Claim', () => { s.claimSteps = Object.assign({}, s.claimSteps, { claim: true }); s.claimed = true; s.state = 'Needs attention'; s.lastCheck = 'Not checked yet'; refresh(); PM51.toast('Server claimed', 'Example data only. Run Test connection to check it.', 'info'); });
  });

  /* devices */
  PM51.on('servers-pair', openPairing);
  PM51.on('servers-pair-copy', () => { const link = sp().pairing.link; try { const p = navigator.clipboard && navigator.clipboard.writeText(link); if (p && p.catch) p.catch(() => {}); } catch (_e) {} PM51.toast('Link copied', link, 'info'); });
  PM51.on('servers-pair-new', () => { const S = sp(); S.pairing.code = newCode(); S.pairing.expiresIn = '10:00'; saveState(); const holder = portalRoot().querySelector('[data-pairing-dialog]'); if (holder) holder.innerHTML = pairingBody(); });
  PM51.on('servers-device', el => devicePanel(ds(el, 'id')));
  PM51.on('servers-device-rename', el => {
    const d = sp().devices.find(x => x.id === ds(el, 'id')); if (!d) return;
    openDialog({ title: `Rename ${d.name}`, body: PM51.form([{ label: 'Name', name: 'name', value: d.name, autofocus: true }]), saveLabel: 'Save', onSave: data => { const name = String(data.name || '').trim(); if (!name) return false; d.name = name; refresh(); } });
  });
  PM51.on('servers-device-access', el => {
    const d = sp().devices.find(x => x.id === ds(el, 'id')); if (!d) return;
    const owner = d.trust === 'Owner';
    PM51.panel({ title: `Access · ${d.name}`, subtitle: 'What this device is allowed to do.', icon: 'shield', eyebrow: (d.trust || 'Member') + ' role',
      body: PM51.panelSection('Allowed', PM51.kv([['Open this workspace', 'Yes'], ['Run work', /runs work/i.test(d.role) ? 'Yes' : 'No'], ['Change servers', owner ? 'Yes' : 'No'], ['Pair or revoke devices', owner ? 'Yes' : 'No'], ['Restore backups', owner ? 'Yes' : 'No']]))
        + PM51.panelSection('Role', PM51.field('Trust role', PM51.select(d.trust || 'Member', ['Owner', 'Member'], { action: 'pm51-servers-device-trust', data: { id: d.id }, label: 'Trust role' }), 'Owners can manage servers and other devices.')),
      primaryLabel: 'Done', onPrimary: () => refresh() });
  });
  PM51.onChange('servers-device-trust', el => { const d = sp().devices.find(x => x.id === ds(el, 'id')); if (d) { d.trust = el.value; saveState(); } });
  PM51.on('servers-device-check', el => {
    const d = sp().devices.find(x => x.id === ds(el, 'id')); if (!d) return;
    PM51.check({ title: `Check device · ${d.name}`, steps: [{ title: 'Device reachable', desc: `Last seen ${d.lastSeen}` }, { title: 'Pairing still valid', desc: `Trust: ${d.trust || 'Member'}` }, { title: 'App version compatible', desc: d.platform }] });
  });
  PM51.on('servers-device-revoke', el => {
    const S = sp(), d = S.devices.find(x => x.id === ds(el, 'id')); if (!d) return;
    PM51.confirm(`Revoke ${d.name}?`, 'The device loses access right away. It can pair again later with a new code.', 'Revoke Device', () => { S.devices = S.devices.filter(x => x.id !== d.id); closeOverlay(); refresh(); }, true);
  });
  PM51.on('servers-revoke-all', () => PM51.confirm('Revoke all devices?', 'Every device, including this one, must pair again with a new code.', 'Revoke all devices', () => { const S = sp(); S.devices = []; S.pairing.code = ''; refresh(); }, true));
  PM51.on('servers-approve', el => { const S = sp(), p = S.pending.find(x => x.id === ds(el, 'id')); if (!p) return; S.pending = S.pending.filter(x => x.id !== p.id); S.devices.push({ id: p.id, name: p.name, platform: p.platform, role: 'Client', state: 'Connected', lastSeen: 'Now', trust: 'Member' }); refresh(); });
  PM51.on('servers-reject', el => { const S = sp(); S.pending = S.pending.filter(x => x.id !== ds(el, 'id')); refresh(); });
  PM51.on('servers-cont', el => { const S = sp(), key = ds(el, 'key'); if (key in S.continuity) { S.continuity[key] = !S.continuity[key]; refresh(); } });

  /* away from home */
  PM51.on('servers-remote', el => remotePanel(ds(el, 'id')));
  PM51.on('servers-route-check', el => { const r = routeById(ds(el, 'id')); if (r) runRouteCheck(r); });
  /* Reorder swaps priorities between two unlocked neighbours; Local network never moves. */
  PM51.on('servers-route-move', el => {
    const R = ra(), sorted = routesSorted(), i = sorted.findIndex(r => r.id === ds(el, 'id')); if (i < 0) return;
    const j = ds(el, 'dir') === 'up' ? i - 1 : i + 1, me = sorted[i], other = sorted[j];
    if (!other || me.locked || other.locked) return;
    const p = me.priority; me.priority = other.priority; other.priority = p;
    R.order = recommendedOrder() ? 'recommended' : 'custom'; refresh();
  });
  PM51.on('servers-order-reset', () => { const R = ra(); DEFAULT_ROUTE_ORDER.forEach((id, i) => { const r = routeById(id); if (r) r.priority = i + 1; }); R.order = 'recommended'; refresh(); });
  /* Turning a route off keeps its setup. Turning off the route in use falls back to the first
     enabled ready route, else Local network. */
  PM51.on('servers-route-toggle', el => {
    const R = ra(), r = routeById(ds(el, 'id')); if (!r || r.locked || !routeConfigured(r)) return;
    if (r.enabled) {
      r.enabled = false; r.status = 'off';
      if (R.actual === r.id) { const fb = routesSorted().find(x => x.id !== r.id && x.enabled && routeReady(x)); R.actual = fb ? fb.id : 'lan'; if (fb) fb.status = 'active'; }
    } else { r.enabled = true; r.status = r.lastCheck && r.lastCheck !== 'Never' ? 'ready' : 'needs-attention'; }
    refresh(); syncRouteSheet(r, el);
  });
  PM51.onInput('servers-headscale', el => { const R = ra(); R.headscale = Object.assign({}, R.headscale || {}, { address: el.value }); saveState(); });
  PM51.onChange('servers-headscale-reg', el => { const R = ra(); R.headscale = Object.assign({}, R.headscale || {}, { registration: el.value }); saveState(); });
  PM51.on('servers-public', () => {
    const R = ra();
    if (R.funnel && R.funnel.enabled) { R.funnel.enabled = false; refresh(); return; }
    PM51.confirm('Allow browser access from anywhere?', 'This opens your sign-in page to the public internet through Tailscale Funnel. Anyone with the address can try to sign in. Prefer Tailscale, your VPN, or Remote Link when you can.', 'Turn On anyway', () => { R.funnel = { enabled: true }; refresh(); }, true);
  });
  PM51.onInput('servers-domain-name', () => {});
  PM51.onChange('servers-domain-proxy', () => {});
  PM51.onInput('servers-vpn-address', () => {});
  PM51.onChange('servers-vpn-kind', () => {});
  PM51.on('servers-domain-generate', el => {
    const R = ra(), wrap = el.closest('.pm51-panel') || portalRoot();
    const name = fieldValue(wrap, 'input[data-action="pm51-servers-domain-name"]') || 'pm.example.com', proxy = fieldValue(wrap, 'select[data-action="pm51-servers-domain-proxy"]') || 'NGINX';
    R.domain = Object.assign({}, R.domain || {}, { name, proxy, generated: true }); saveState();
    const holder = wrap.querySelector('[data-domain-config]'); if (holder) holder.innerHTML = `<div class="pm51-servers-conf">${h(proxyConfig(name, proxy))}</div>`;
    const step = wrap.querySelectorAll('.pm51-steps.pm51-rail .pm51-step')[1]; if (step && !step.classList.contains('is-done')) { step.classList.add('is-done'); const n = step.querySelector('.pm51-step-n'); if (n) n.innerHTML = icon('check'); const end = step.querySelector('.pm51-step-end'); if (end) end.innerHTML = ''; }
  });

  /* move & copy */
  PM51.on('servers-move-dest', () => {
    const S = sp();
    const choices = S.servers.filter(s => s.id !== S.homeServer && isClaimed(s)).map(s => s.name).concat(['Another server (enter address)']);
    openDialog({ title: 'Choose destination', subtitle: 'Where the workspace should live next.', body: PM51.form([
      { label: 'Destination', name: 'dest', value: S.move.destination && choices.includes(S.move.destination) ? S.move.destination : choices[0], type: 'select', choices, full: true },
      { label: 'Address (if another server)', name: 'address', value: '', placeholder: 'nas.local' }
    ]), saveLabel: 'Use this destination', onSave: data => {
      let dest = String(data.dest);
      if (dest === 'Another server (enter address)') { const address = String(data.address || '').trim(); if (!address) { PM51.toast('Address needed', 'Enter the other server’s address.', 'warning'); return false; } dest = address; }
      S.move.destination = dest; S.move.preflight = null; refresh();
    } });
  });
  PM51.on('servers-move-check', () => {
    const S = sp(); if (!S.move.destination) return;
    S.move.preflight = { at: nowLabel(), outcome: 'Checked · example data' }; refresh();
    PM51.check({ title: 'Check before moving', subtitle: `To ${S.move.destination}. Example data only; nothing moved.`, steps: [
      { title: 'Destination reachable', desc: S.move.destination },
      { title: 'Enough free space', desc: 'Files, history, and artifacts' },
      { title: 'No open conflicts', desc: `${S.conflicts.open || 0} open` },
      { title: 'Unsaved work parked', desc: 'Editors, terminals, and running Goals pause safely' }
    ] });
  });
  PM51.on('servers-move-start', () => {
    const S = sp(); if (!S.move.preflight || !S.move.destination) return;
    PM51.confirm('Move workspace?', `The workspace moves from ${homeServer().name} to ${S.move.destination}. Work pauses while it moves and resumes afterwards. You can move it back.`, 'Move workspace', () => {
      S.move.history.unshift({ time: `Today · ${nowLabel()}`, kind: 'Move', destination: S.move.destination, result: 'Preview only · example data' });
      S.move.preflight = null; refresh();
      PM51.panel({ title: 'Move workspace', subtitle: 'Concept preview. Nothing moved.', status: { label: 'Preview', tone: 'info' }, body: PM51.panelSection('What would happen', PM51.steps([
        { title: 'Pause work', desc: 'Goals, chats, and terminals park safely', status: 'Example', tone: 'info' },
        { title: 'Copy files and history', desc: `To ${S.move.destination}`, status: 'Example', tone: 'info' },
        { title: 'Switch the home server', desc: 'Devices reconnect on their own', status: 'Example', tone: 'info' },
        { title: 'Resume work', desc: 'Right where you left off', status: 'Example', tone: 'info' }
      ])) + PM51.note('This is a concept preview. Nothing was moved or changed.', 'info') });
    });
  });
  PM51.on('servers-copy', () => {
    const S = sp();
    const choices = S.servers.filter(isClaimed).map(s => s.name);
    openDialog({ title: 'Copy workspace', subtitle: 'The copy is independent. Settings and history go with it; the original stays where it is.', body: PM51.form([
      { label: 'New name', name: 'name', value: 'Puppet Master (copy)', autofocus: true },
      { label: 'Destination', name: 'dest', value: choices[0], type: 'select', choices },
      { label: 'Include history and artifacts', name: 'history', value: true, type: 'checkbox', full: true }
    ]), saveLabel: 'Copy workspace', onSave: data => {
      S.move.history.unshift({ time: `Today · ${nowLabel()}`, kind: 'Copy', destination: `${data.dest} · ${data.name}`, result: 'Preview only · example data' });
      refresh(); PM51.toast('Copy previewed', 'Example data only. No workspace was copied in this preview.', 'info');
    } });
  });
  PM51.on('servers-conflicts-view', () => {
    const S = sp();
    PM51.panel({ title: 'Open conflicts', subtitle: 'Files changed on two sides at once.', status: { label: String(S.conflicts.open || 0) + ' open', tone: S.conflicts.open ? 'attention' : 'ready' }, body: S.conflicts.open ? PM51.panelSection('Conflicts', PM51.kv([['Waiting for you', String(S.conflicts.open)]])) : PM51.empty('No open conflicts', 'When both sides change the same file, it shows up here with a three-way comparison.') });
  });
  PM51.on('servers-ssh-add', () => sshDialog(null));
  PM51.on('servers-ssh-import', () => {
    const S = sp(); const choices = S.sshFolders.map(f => `${f.name} · ${f.folder}`);
    if (!choices.length) { PM51.toast('Add an SSH folder first', 'Import needs a folder on another computer to read from.', 'info'); return; }
    openDialog({ title: 'Import from an SSH folder', subtitle: 'Brings a project from another computer into a new workspace.', body: PM51.form([{ label: 'Folder', name: 'folder', value: choices[0], type: 'select', choices, full: true }, { label: 'Workspace name', name: 'name', value: 'Imported workspace', autofocus: true }]), saveLabel: 'Import', onSave: data => { PM51.toast('Import previewed', `Example data only. ${data.name} was not created in this preview.`, 'info'); } });
  });
})();
