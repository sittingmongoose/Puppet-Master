/* Server & Project Location — where the workspace lives, where work runs, which devices reach it.
   Setting things up is guided (PM51.wizard), the way onboarding does it (src/js 66-68, copy.json nas/server/away):
   - Add a server: what kind of computer, how to reach it, how Puppet Master signs in (its setup code when it already
     runs Puppet Master, or an SSH key), putting the key there, a connection check, a name, a recap.
   - SSH keys are one list (Servers tab). A key is made new, taken from a key file, or pasted as a public key; only the
     public half is ever read. Anywhere an SSH connection is shown (a server, an SSH computer, and Git sign-in in
     Source Control through PM51.sysSsh) a key can be attached: pick it, put the public half there (with the exact
     line to copy, or with a password used once), then Check connection.
   - Away from home: the canonical ways in (Plans/Remote_Access_System.md RAS-002, RAS-006): Tailscale (hosted or a
     Headscale server), a VPN you already run, your own web address through a reverse proxy (the one that needs port
     forwarding on your router), and Puppet Master Remote Link (no account, domain or router change).
   - Move & Copy: move, copy, or bring in a project from an SSH computer; what goes along, where to, what happens to
     history, a check before anything moves, and a recap. Nothing moves in this preview; the result is recorded. */
(function () {
  const ID = 'servers';
  const KEY = 'servers-hosts-environments';
  const KEYS = 'code.execution.ssh-keys';
  const TAB_UI = 'ui.settings.server_tab.select';
  const TABS = [
    { id: 'home', label: 'Home & Location', ui: TAB_UI },
    { id: 'servers', label: 'Servers', ui: TAB_UI },
    { id: 'devices', label: 'Devices', ui: TAB_UI },
    { id: 'away', label: 'Away From Home', ui: TAB_UI },
    { id: 'move', label: 'Move & Copy', ui: TAB_UI }
  ];
  const FILE_KINDS = ['Server folder', 'Another computer or NAS', 'Existing checkout', 'Clone from a code service', 'Folder on an SSH computer', 'Restored backup'];
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
    for (const s of sp().servers) if (isClaimed(s) && s.runsWork !== false) opts.push([s.id, s.role === 'This computer' ? `${s.name} (WSL)` : s.name]);
    for (const d of sp().devices) if (/runs work/i.test(d.role) && !opts.some(o => o[1].startsWith(d.name))) opts.push(['device:' + d.id, d.name]);
    return opts;
  };
  /* SSH computers are the inventory's "Remote machines (SSH)" list; the old separate SSH folders list is its seed. */
  const SSH = 'code.execution.ssh-remotes';
  function sshRemotes() {
    let v = PM51.value(SSH);
    if ((!Array.isArray(v) || !v.length) && (sp().sshFolders || []).length && !PM51.s().o55SshSeeded) {
      v = sp().sshFolders.map(f => { const [user, host] = String(f.address).includes('@') ? String(f.address).split('@') : ['', f.address]; return { name: f.name, address: host, user, folder: f.folder || '', auth: 'SSH key' }; });
      PM51.s().o55SshSeeded = true; if (commitSettingValue(SSH, v)) saveState();
    }
    let list = (Array.isArray(v) ? v : []).map(x => typeof x === 'string' ? { name: x, address: x, user: '', folder: '', auth: 'SSH key' } : x);
    /* entries saved before keys were a list sign in with the key that was in the agent; they name it once */
    if (list.some(x => x.keyId === undefined) && keys().length) {
      const first = (keys().find(k => !k.old) || keys()[0]).id;
      list = list.map(x => x.keyId === undefined ? Object.assign({}, x, { keyId: /key/i.test(x.auth || 'SSH key') ? first : '' }) : x);
      if (commitSettingValue(SSH, list)) saveState();
    }
    return list;
  }
  const saveSsh = list => { if (commitSettingValue(SSH, list)) { saveState(); o55Notify(SSH, list); } refresh(); };
  function sshSection() {
    const list = sshRemotes();
    const body = list.length ? PM51.list(list.map((f, i) => {
      const k = keyById(f.keyId);
      return {
        title: f.name, meta: `${f.user ? f.user + '@' : ''}${f.address}${f.port && String(f.port) !== '22' ? ':' + f.port : ''}${f.folder ? ' · ' + f.folder : ''}`, avatar: icon('terminal'),
        sub: k ? `Signs in with ${k.name}` : f.auth && !/key/i.test(f.auth) ? `Signs in with ${f.auth}` : '',
        note: !k && (!f.auth || /key/i.test(f.auth)) ? 'No key attached yet, so it cannot sign in.' : '',
        end: (k || (f.auth && !/key/i.test(f.auth)) ? PM51.btn({ label: 'Test', small: true, icon: 'test', callback: () => PM51.check({ title: `Check ${f.name}`, steps: [{ title: 'Address answers', desc: f.address, status: 'Example', tone: 'info' }, { title: k ? `Signs in with ${k.name}` : `Signs in with ${f.auth}`, desc: 'No password needed; the private half never leaves where it is kept', status: 'Example', tone: 'info' }, { title: 'Folder is there', desc: f.folder || 'Home folder', status: 'Example', tone: 'info' }] }) })
          : PM51.btn({ label: 'Attach a key', small: true, primary: true, icon: 'key', action: 'pm51-servers-ssh-key', data: { index: i } }))
          + PM51.iconBtn({ icon: 'more', label: `More for ${f.name}`, callback: el => PM51.menu(el, [
            { label: k ? 'Attach a different key…' : 'Attach a key…', icon: 'key', onClick: () => attachSshKey(i) },
            { label: 'Edit', icon: 'edit', onClick: () => sshDialog(i) },
            { separator: true },
            { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${f.name}?`, 'Nothing on that computer is touched. Only the entry here is removed.', 'Remove', () => { const next = list.slice(); next.splice(i, 1); saveSsh(next); }, true) }
          ], f.name) })
      };
    })) : PM51.empty('No SSH computers', 'Add another computer you reach over SSH, for files or for running work.', { label: 'Add SSH computer', action: 'pm51-servers-ssh-add' });
    return PM51.section({ title: 'SSH computers', help: 'Other computers you reach over SSH, each with the key it signs in with.', action: { label: 'Add SSH computer', icon: 'plus', small: true, action: 'pm51-servers-ssh-add' }, body: PM51.home(SSH, body) });
  }
  function attachSshKey(i) {
    const list = sshRemotes(), f = list[i]; if (!f) return;
    keyWizard({ target: { kind: 'ssh', name: f.name, user: f.user, address: f.address, port: f.port || '22', folder: f.folder }, keyId: f.keyId, onDone: id => { const next = sshRemotes().slice(); next[i] = Object.assign({}, next[i], { keyId: id, auth: 'SSH key' }); if (commitSettingValue(SSH, next)) { saveState(); o55Notify(SSH, next); } } });
  }
  function keysSection() {
    const K = keys();
    return PM51.section({ title: 'SSH keys', help: 'Keys Puppet Master signs in with. Only the public half is ever read.', cls: 'o55-srv-keys', action: { label: 'Add a key', icon: 'plus', small: true, action: 'pm51-servers-key-add' },
      body: `<span class="o55-alias" data-setting-id="${KEYS}"></span>` + (K.length ? PM51.list(K.map(k => {
        const uses = keyUses(k.id);
        return {
          title: k.name, meta: `${k.type} · ${k.where} on ${k.on}`, sub: uses.length ? `Used by ${uses.join(', ')}` : 'Not attached anywhere yet', note: k.old ? 'Older key type. A new Ed25519 key is safer; attach it where this one is used.' : '', avatar: icon('key'),
          end: PM51.btn({ label: 'Copy public key', small: true, icon: 'copy', action: 'pm51-servers-copy-text', data: { text: k.public, what: 'Public key' } })
            + PM51.iconBtn({ icon: 'more', label: `More for ${k.name}`, callback: el => PM51.menu(el, [
              { label: 'Details', icon: 'info', onClick: () => keyPanel(k.id) },
              { label: 'Rename', icon: 'edit', onClick: () => openDialog({ title: `Rename ${k.name}`, body: PM51.form([{ label: 'Name', name: 'name', value: k.name, autofocus: true }]), saveLabel: 'Save', onSave: data => { const n = String(data.name || '').trim(); if (!n) return false; k.name = n; refresh(); } }) },
              { separator: true },
              { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${k.name}?`, `${uses.length ? `${uses.join(', ')} will need another key. ` : ''}The key itself stays on ${k.on}; only Puppet Master forgets it.`, 'Remove', () => removeKey(k.id), true) }
            ], k.name) })
        };
      })) : PM51.empty('No SSH keys yet', 'Add one to sign in to other computers without a password.', { label: 'Add a key', action: 'pm51-servers-key-add' })) });
  }
  function keyPanel(id) {
    const k = keyById(id); if (!k) return;
    PM51.panel({ title: k.name, subtitle: `${k.type} · ${k.where}`, icon: 'key',
      body: PM51.panelSection('Public half', copyBox(k.public, 'Public key'), 'Safe to share. Give it to any computer or service that should let you in.', { icon: 'key' })
        + PM51.panelSection('Details', PM51.kv([['Kept on', k.on], ['File', k.path || 'Not a file'], ['Fingerprint', k.fingerprint || keyFp(k.public)], ['Added', k.added || 'Today'], ['Used by', keyUses(k.id).join(', ') || 'Nothing yet']])) });
  }
  function removeKey(id) {
    const left = keys().filter(k => k.id !== id); if (commitSettingValue(KEYS, left)) o55Notify(KEYS, left);
    const list = sshRemotes().map(f => f.keyId === id ? Object.assign({}, f, { keyId: '' }) : f);
    if (commitSettingValue(SSH, list)) o55Notify(SSH, list);
    S.servers.forEach(s => { if (s.signIn && s.signIn.keyId === id) { delete s.signIn.keyId; if (s.signIn.method === 'ssh') s.state = 'Needs attention'; } });
    ((state.sourceControl || {}).forges || []).forEach(f => { if (f.pushKeyId === id) { f.pushKeyId = ''; f.pushAccess = 'Not set up'; } });
    refresh(); PM51.toast('Key removed', 'Anything that used it needs another key.', 'info');
  }
  const runLabel = () => { const o = runOptions().find(x => x[0] === sp().executionHost); return o ? o[1] : 'Automatic (Home server)'; };

  /* ---------- SSH keys: one list, attachable wherever an SSH connection is shown ---------------------------------- */
  /* A key is { id, name, type, where, on, path, public, fingerprint, added }. Only the public half is ever held here. */
  /* The key list is the inventory row code.execution.ssh-keys (admitted 2026-09-28): the manager edits the stored list,
     so search, Details, All Settings and transfer see the same keys. The example keys seed it once on this device; a
     key entry holds its name, type, where the private half is kept and the public half, never the private half. */
  function keys() {
    let v = state.settings[KEYS];
    if (!Array.isArray(v) || (!v.length && !state.changed[KEYS])) { const S = sp(); v = state.settings[KEYS] = clone(Array.isArray(S.sshKeys) ? S.sshKeys : (PM51_DATA.serverProject || {}).sshKeys || []); delete S.sshKeys; }
    return v;
  }
  const keyById = id => keys().find(k => k.id === id);
  const thisComputer = () => { const S = sp(); const d = S.devices.find(x => x.current || x.thisDevice) || S.devices.find(x => x.name === 'Windows Workstation') || S.devices[0]; return d ? d.name : 'this computer'; };
  const slugHost = n => String(n || 'server').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'server';
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const fakeB64 = (seed, n) => { let x = 2166136261; for (const c of String(seed)) x = Math.imul(x ^ c.charCodeAt(0), 16777619) >>> 0; let out = ''; for (let i = 0; i < n; i++) { x = (Math.imul(x ^ (x >>> 13), 1103515245) + 12345) >>> 0; out += B64[(x >>> 7) % 64]; } return out; };
  const makePublic = (type, seed, comment) => /rsa/i.test(type) ? `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ${fakeB64(seed, 60)} ${comment}` : `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI${fakeB64(seed, 43)} ${comment}`;
  const keyFp = pub => `SHA256:${fakeB64('fp' + pub, 10)}…${fakeB64('tail' + pub, 4)}`;
  function keyUses(id) {
    const out = [];
    sshRemotes().forEach(f => { if (f.keyId === id) out.push(f.name); });
    sp().servers.forEach(s => { if (s.signIn && s.signIn.keyId === id) out.push(s.name); });
    ((state.sourceControl || {}).forges || []).forEach(f => { if (f.pushKeyId === id) out.push(`${f.name} (Git)`); });
    return out;
  }
  function copyText(text, what) { const done = () => PM51.toast(`${what} copied`, text.length > 90 ? text.slice(0, 88) + '…' : text); try { navigator.clipboard.writeText(text).then(done, done); } catch (_e) { done(); } }
  const copyBox = (text, what) => `<div class="o55-key-line"><code class="o55-key-code">${h(text)}</code>${PM51.btn({ label: 'Copy', small: true, icon: 'copy', action: 'pm51-servers-copy-text', data: { text, what: what || 'Text' } })}</div>`;
  const NAS_SSH = { Synology: 'Control Panel › Terminal & SNMP › Terminal › Enable SSH service', TrueNAS: 'System Settings › Services › SSH', QNAP: 'Control Panel › Network & File Services › Telnet / SSH', Unraid: 'Settings › Management Access' };
  const FORGE_KEYS = { GitHub: 'Settings › SSH and GPG keys › New SSH key', 'GitHub Enterprise': 'Settings › SSH and GPG keys › New SSH key', 'GitLab.com': 'Preferences › SSH Keys › Add new key', 'GitLab Self-Managed': 'Preferences › SSH Keys › Add new key', Bitbucket: 'Personal settings › SSH keys › Add key', 'Azure DevOps': 'User settings › SSH public keys › New key', Forgejo: 'Settings › SSH / GPG Keys › Add key', Gitea: 'Settings › SSH / GPG Keys › Add key' };
  /* the key step: keys already here, a new one, a key file, or a pasted public key */
  function keyPick(d) {
    const home = homeServer().name;
    const cards = (d.noExisting ? [] : keys().map(k => { const uses = keyUses(k.id); return { title: k.name, text: `${k.type} · ${k.where} on ${k.on}`, meta: k.old ? 'Older key type; a new key is safer' : uses.length ? `Already used by ${uses.join(', ')}` : 'Not used yet', icon: 'key', selected: d.keyMode === 'existing' && d.keyId === k.id, data: { mode: 'existing', key: k.id } }; }))
      .concat([
        { title: 'Make a new key just for Puppet Master', text: `Made on ${home}, where the work runs. Easy to remove later; your other keys are not touched.`, meta: 'Recommended', icon: 'plus', selected: d.keyMode === 'new', data: { mode: 'new' } },
        { title: 'Use a key file', text: 'A key you already have, such as ~/.ssh/id_ed25519.', icon: 'file', selected: d.keyMode === 'file', data: { mode: 'file' } },
        { title: 'Paste a public key', text: 'For a key kept in a password manager or on a security key.', icon: 'copy', selected: d.keyMode === 'paste', data: { mode: 'paste' } }
      ]);
    const f = PM51.field;
    const extra = d.keyMode === 'new' ? f('Key name', `<input class="text-control o55-key-name o55-setup-mono" value="${a(d.newName || '')}" autocomplete="off" spellcheck="false"/>`, 'Shown in lists so you can tell keys apart.') + f('Kind of key', PM51.select(d.newType || 'Ed25519', [['Ed25519', 'Ed25519 (recommended)'], ['RSA 4096', 'RSA 4096 (for older computers)']], { cls: 'o55-key-type', label: 'Kind of key' }))
      : d.keyMode === 'file' ? f('Key file', `<input class="text-control o55-key-path o55-setup-mono" value="${a(d.filePath || '~/.ssh/id_ed25519')}" autocomplete="off" spellcheck="false"/>`, 'Only the public half next to it (the .pub file) is read. The private key never leaves this computer.')
      : d.keyMode === 'paste' ? f('Public key', `<textarea class="form-textarea o55-key-paste o55-setup-mono" rows="3" spellcheck="false" placeholder="ssh-ed25519 AAAA… you@laptop">${h(d.pasted || '')}</textarea>`, 'One line that starts with ssh-ed25519, ssh-rsa or ecdsa-sha2. The private half stays where it is.')
      : '';
    return PM51.tiles(cards, { action: 'pm51-servers-key-mode', cls: 'o55-key-cards' }) + (extra ? `<div class="o55-setup-fields o55-key-extra">${extra}</div>` : '')
      + PM51.note('Only the public half of a key is read. Private keys are never read, copied or stored.', 'info');
  }
  function keyCollect(w, d) {
    const v = s => { const el = w && w.querySelector(s); return el ? String(el.value || '').trim() : null; };
    const n = v('.o55-key-name'), t = v('.o55-key-type'), p = v('.o55-key-path'), x = v('.o55-key-paste');
    if (n != null) d.newName = n; if (t) d.newType = t; if (p != null) d.filePath = p; if (x != null) d.pasted = x.replace(/\s+/g, ' ');
  }
  const PUB_RE = /^(ssh-(ed25519|rsa|dss)|ecdsa-sha2-[\w-]+|sk-(ssh-ed25519|ecdsa-sha2-[\w-]+)@openssh\.com)\s+[A-Za-z0-9+/=]{16,}/;
  function keyCheck(d) {
    if (!d.keyMode) return 'Pick a key, or make a new one.';
    if (d.keyMode === 'existing' && !keyById(d.keyId)) return 'Pick a key.';
    if (d.keyMode === 'new' && !d.newName) return 'Give the new key a name.';
    if (d.keyMode === 'new' && keys().some(k => k.name.toLowerCase() === d.newName.toLowerCase())) return `There is already a key called ${d.newName}.`;
    if (d.keyMode === 'file' && !/^(~|\/|[A-Za-z]:\\)\S*[^/\\]$/.test(d.filePath || '')) return 'Enter the key file, for example ~/.ssh/id_ed25519.';
    if (d.keyMode === 'paste' && !PUB_RE.test(d.pasted || '')) return 'That does not look like a public key. It starts with ssh-ed25519, ssh-rsa or ecdsa-sha2.';
    return '';
  }
  function pubOf(d) {
    if (d.keyMode === 'existing') return (keyById(d.keyId) || {}).public || '';
    if (d.keyMode === 'new') return makePublic(d.newType, d.newName, `puppet-master@${slugHost(homeServer().name)}`);
    if (d.keyMode === 'file') return makePublic(/rsa/i.test(d.filePath) ? 'RSA 4096' : 'Ed25519', d.filePath, `you@${slugHost(thisComputer())}`);
    return d.pasted || '';
  }
  const keyLabel = d => d.keyMode === 'existing' ? ((keyById(d.keyId) || {}).name || 'your key') : d.keyMode === 'new' ? d.newName : d.keyMode === 'file' ? String(d.filePath || '').split(/[\\/]/).pop() : 'the pasted key';
  function commitKey(d) {
    if (d.keyMode === 'existing') return d.keyId;
    const pub = pubOf(d), found = keys().find(k => k.public === pub); if (found) return found.id;
    const name = d.keyMode === 'paste' ? (pub.split(/\s+/)[2] || 'Pasted key') : keyLabel(d);
    const k = { id: uid('sshkey', name), name, type: d.keyMode === 'new' ? (d.newType || 'Ed25519') : /^ssh-rsa/.test(pub) ? 'RSA' : /ecdsa/.test(pub) ? 'ECDSA' : 'Ed25519',
      where: d.keyMode === 'new' ? 'Made by Puppet Master' : d.keyMode === 'file' ? 'Key file' : 'Pasted public key', on: d.keyMode === 'new' ? homeServer().name : thisComputer(),
      path: d.keyMode === 'file' ? d.filePath : d.keyMode === 'new' ? `~/.ssh/${slugHost(name)}` : '', public: pub, fingerprint: keyFp(pub), added: 'Today' };
    keys().push(k); return k.id;
  }
  /* putting the public half where it is needed: a line to copy, or a password used once, or the code service does it */
  function placeStep(d) {
    const t = d.target || {}, pub = pubOf(d);
    if (t.kind === 'git') {
      const tiles = t.canAdd ? PM51.tiles([{ title: `Add it to my ${t.name} account for me`, text: `Uses your ${t.name} sign-in (${t.account}) once to add it.`, icon: 'link', selected: d.place === 'auto', data: { place: 'auto' } }, { title: 'I’ll add it myself', text: 'Copy the key and paste it on the website.', icon: 'copy', selected: d.place === 'self', data: { place: 'self' } }], { action: 'pm51-servers-key-place' }) : '';
      const self = !t.canAdd || d.place === 'self' ? PM51.panelSection(`On ${t.name}`, `<p class="pm51-ps-text">${h(`Open ${FORGE_KEYS[t.name] || 'your account settings › SSH keys'}, give it a title such as “Puppet Master”, and paste this line:`)}</p>` + copyBox(pub, 'Public key'), '', { icon: 'key' }) : '';
      return tiles + self;
    }
    const name = t.name || 'the other computer', user = t.user || 'you';
    const tiles = PM51.tiles([{ title: 'Add it for me', text: `Sign in to ${name} once with your password. It is used once and never saved.`, icon: 'lock', selected: d.place === 'password', data: { place: 'password' } }, { title: 'I’ll add it myself', text: `Copy one line into a file on ${name}.`, icon: 'copy', selected: d.place === 'self', data: { place: 'self' } }], { action: 'pm51-servers-key-place' });
    const body = d.place === 'password' ? `<div class="o55-setup-fields">${PM51.field('Username', `<input class="text-control o55-key-user o55-setup-mono" value="${a(user)}" autocomplete="off" spellcheck="false"/>`, t.brand ? `The name you use for ${name}’s web page.` : '')}${PM51.field('Password', '<input class="text-control o55-key-pass" type="password" autocomplete="off" placeholder="Used once to add your key"/>', 'Used once to add your key. Never saved.')}</div>`
      : d.place === 'self' ? PM51.panelSection(`Add your key to ${name} yourself`, `<p class="pm51-ps-text">${h(`Add this line to ~/.ssh/authorized_keys for the user ${user} on ${name}. It is the public half of ${keyLabel(d)}.`)}</p>` + copyBox(pub, 'Public key') + `<p class="pm51-ps-text o55-key-or">${h('Already in a terminal on that computer? This does the same:')}</p>` + copyBox(`mkdir -p ~/.ssh && echo '${pub}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`, 'Command'), '', { icon: 'key' }) : '';
    const tip = t.brand && NAS_SSH[t.brand] ? PM51.note(`SSH has to be on for this. On ${t.brand}: ${NAS_SSH[t.brand]}.`, 'info') : '';
    return tiles + body + tip;
  }
  function placeCollect(w, d) { const u = w.querySelector('.o55-key-user'), p = w.querySelector('.o55-key-pass'); if (u && d.target) d.target.user = String(u.value || '').trim() || d.target.user; if (p) d.pwGiven = !!String(p.value || '').trim(); }
  function placeCheck(d) { if (!d.place) return 'Choose how the key gets there.'; if (d.place === 'password' && !d.pwGiven) return 'Enter the password once, or add the key yourself.'; return ''; }
  /* one connection check, pressed on purpose; the result stays until something above it changes */
  function checkResults(d) {
    const t = d.target || {};
    if (t.kind === 'git') return [{ title: `Reached ${t.host || t.name}`, desc: `${t.host || t.name} on port 22` }, { title: `Signed in with ${keyLabel(d)}`, desc: t.account && t.account !== 'None' ? `As ${t.account}; no password` : 'No password needed' }, { title: 'Can fetch and push', desc: 'A test push was refused on purpose, so nothing changed' }];
    const out = [];
    if (t.method !== 'local') out.push({ title: 'Address answers', desc: `${t.address || '—'}${t.port && String(t.port) !== '22' ? ':' + t.port : ''}` }, { title: 'It is the computer you expect', desc: `Its ID was saved: ${keyFp('host' + (t.address || ''))}` });
    if (t.kind === 'ssh' || t.method === 'ssh') out.push({ title: `Signed in with ${keyLabel(d)}`, desc: `As ${t.user || 'you'}; no password needed` });
    if (t.method === 'pair') out.push({ title: 'Setup code accepted', desc: 'Only devices you approve can use it' });
    if (t.method === 'local') out.push({ title: 'Puppet Master can run as a server here', desc: `On ${thisComputer()}; your other devices find it on your network` });
    if (t.folder) out.push({ title: 'Folder can be read', desc: t.folder });
    if (t.kind === 'server') out.push({ title: t.method === 'ssh' ? 'Puppet Master can be installed' : 'Puppet Master answers', desc: t.method === 'ssh' ? 'Enough space, and Docker or Linux found' : 'Version 0.8.0' });
    return out;
  }
  function checkStep(d) {
    const t = d.target || {};
    if (!d.checked) return PM51.note(t.kind === 'git' ? `Puppet Master signs in to ${t.name} with the key and makes sure it can fetch and push.` : t.method === 'local' ? 'Puppet Master makes sure it can run as a server on this computer.' : `Puppet Master connects to ${t.name || 'the computer'} and makes sure it is the one you expect. Nothing is changed.`, 'info')
      + `<div class="pm51-perm-actions">${PM51.btn({ label: 'Check connection', primary: true, icon: 'test', action: 'pm51-servers-key-check' })}</div>`;
    return PM51.steps(checkResults(d).map(s => Object.assign({ status: 'Example', tone: 'info', done: true }, s)))
      + PM51.note('Example data only. In the app these checks run for real.', 'info')
      + `<div class="pm51-perm-actions">${PM51.btn({ label: 'Check again', small: true, icon: 'refresh', action: 'pm51-servers-key-check' })}</div>`;
  }
  /* A step that does not apply to this answer steps aside in the direction you were going. */
  const track = (wrap, d, api) => { d._last = api.step(); };
  const skipFor = pred => (wrap, d, api) => { const here = api.step(), back = d._last != null && d._last > here; d._last = here; if (pred(d)) window.setTimeout(() => { if (api.step() === here) api.go(back ? here - 1 : here + 1); }, 0); };
  function keyWizard({ target, keyId, onDone, refreshWith } = {}) {
    const draft = { target: target || null, noExisting: !target, keyMode: keyId && keyById(keyId) ? 'existing' : '', keyId: keyId || '', newName: target ? `puppet-master-${slugHost(target.name)}` : 'puppet-master', newType: 'Ed25519', filePath: '~/.ssh/id_ed25519', pasted: '', place: target && target.canAdd ? 'auto' : '', checked: false };
    const steps = [{ label: 'Key', icon: 'key', title: target ? `Which key should sign in to ${target.name}?` : 'Which key do you want to add?', lead: target ? 'A key lets Puppet Master connect without a password.' : 'Make a new one, or add one you already have.', render: keyPick, collect: keyCollect, check: keyCheck, recap: keyLabel }];
    if (target) {
      steps.push({ label: 'Put it there', icon: 'copy', title: target.kind === 'git' ? `Add the key to ${target.name}` : `Put the key on ${target.name}`, lead: target.kind === 'git' ? `${target.name} needs the public half so it knows it is you.` : `${target.name} needs the public half once. After that, no password is needed.`, render: placeStep, collect: placeCollect, check: placeCheck, recap: d => d.place === 'auto' ? 'Added for me' : d.place === 'password' ? 'With my password' : 'Added myself' });
      steps.push({ label: 'Check', icon: 'test', title: 'Does it work?', lead: 'A quick sign-in with the key, and nothing else.', render: checkStep, check: d => d.checked ? '' : 'Run Check connection first.', recap: () => 'Works' });
    } else steps.push({ label: 'Recap', icon: 'check', title: 'Here is its public half', lead: 'Give this line to any computer or service that should let you in. It is safe to share.', render: d => copyBox(pubOf(d), 'Public key') + PM51.kv([['Name', keyLabel(d)], ['Kind', d.keyMode === 'new' ? d.newType : d.keyMode === 'file' ? 'From a key file' : 'Pasted'], ['Fingerprint', keyFp(pubOf(d))]]) });
    PM51.wizard({ title: target ? `Attach a key to ${target.name}` : 'Add an SSH key', subtitle: 'An SSH key is a pair: a private half that stays where it is made, and a public half you give to the computers and services that should let you in.', eyebrow: 'SSH key', icon: 'key', steps, draft, finishLabel: target ? 'Use this key' : 'Add key',
      onFinish: d => { const id = commitKey(d); if (onDone) onDone(id, d); saveState(); (refreshWith || refresh)(); const k = keyById(id) || { name: 'The key' }; PM51.toast(target ? `${target.name} signs in with ${k.name}` : `${k.name} added`, target ? 'Example only: nothing was changed on the other side.' : 'Copy its public half from SSH keys whenever you need it.', target ? 'info' : 'success'); } });
  }
  /* ---------- Add a server, step by step ------------------------------------------------------------------------- */
  const SERVER_KINDS = [
    { id: 'this', title: 'This computer', text: 'Puppet Master runs as a server right here. It works while this computer is on.', icon: 'system', role: 'This computer' },
    { id: 'network', title: 'A computer on my network', text: 'A Windows, Mac or Linux computer at home or in the office that stays on.', icon: 'network', role: 'Computer on your network' },
    { id: 'nas', title: 'A NAS or home server', text: 'Synology, TrueNAS, Unraid or QNAP.', icon: 'database', role: 'NAS' },
    { id: 'cloud', title: 'A cloud computer', text: 'A server you rent online.', icon: 'cloud', role: 'Cloud computer' }
  ];
  const SUGGEST = { nas: ['Home NAS', 'Home server', 'Studio NAS'], cloud: ['Cloud server', 'Rented server', 'Studio cloud'], network: ['Studio PC', 'Office computer', 'Home server'] };
  function nearby() { const S = sp(); if (!Array.isArray(S.nearby)) S.nearby = clone((PM51_DATA.serverProject || {}).nearby || []); return S.nearby; }
  const whoName = d => d.name || d.found || d.address || 'the new server';
  const serverTarget = d => ({ kind: 'server', method: d.kind === 'this' ? 'local' : d.method, name: whoName(d), address: d.kind === 'this' ? 'localhost' : d.address, user: d.user, port: d.port, brand: d.brand });
  function reachStep(d) {
    const list = nearby().filter(n => n.kind === d.kind), hit = nearby().find(n => n.id === d.foundId);
    const found = d.kind === 'cloud' || !list.length ? '' : `<p class="o55-quiet-line">Found on your network</p>` + PM51.tiles(list.map(n => ({ title: n.name, text: `${n.address} · ${n.detail}`, icon: d.kind === 'nas' ? 'database' : 'system', selected: d.foundId === n.id, data: { found: n.id } })), { action: 'pm51-servers-w-found' });
    const tip = hit && hit.sshOff ? PM51.note(`SSH is off on ${hit.name}. Turn it on in ${hit.brand}’s settings: ${NAS_SSH[hit.brand] || 'look for SSH'}. Or pick “It already runs Puppet Master” next if it does.`, 'attention') : '';
    return found + tip + `<div class="o55-setup-fields">${d.kind === 'cloud' ? '' : '<p class="o55-quiet-line">Or type its address</p>'}${PM51.field('Address', `<input class="text-control o55-srv-addr o55-setup-mono" value="${a(d.address)}" placeholder="${d.kind === 'cloud' ? '203.0.113.10 or my-server.example.com' : 'For example 192.168.1.20 or nas.local'}" autocomplete="off" spellcheck="false"/>`)}<div class="o55-srv-pair">${PM51.field('Username on it', `<input class="text-control o55-srv-user o55-setup-mono" value="${a(d.user)}" placeholder="${d.kind === 'cloud' ? 'root or ubuntu' : 'you'}" autocomplete="off" spellcheck="false"/>`, 'Needed when it signs in with a key.')}${PM51.field('Port', `<input class="text-control o55-srv-port o55-setup-mono" value="${a(d.port)}" inputmode="numeric" autocomplete="off"/>`, 'Usually 22.')}</div>${d.kind === 'nas' ? PM51.field('Which NAS', PM51.select(d.brand || 'Synology', ['Synology', 'TrueNAS', 'Unraid', 'QNAP'], { cls: 'o55-srv-brand', label: 'Which NAS' })) : ''}</div>`;
  }
  function reachCollect(w, d) {
    const v = s => { const el = w.querySelector(s); return el ? String(el.value || '').trim() : null; };
    const ad = v('.o55-srv-addr'), us = v('.o55-srv-user'), po = v('.o55-srv-port'), br = v('.o55-srv-brand');
    if (ad != null) { d.address = ad; const hit = nearby().find(n => n.id === d.foundId); if (hit && hit.address !== ad && hit.name !== ad) { d.foundId = ''; d.found = ''; } }
    if (us != null) d.user = us; if (po != null) d.port = po || '22'; if (br) d.brand = br;
  }
  const reachCheck = d => !d.address ? (d.kind === 'cloud' ? 'Enter its address.' : 'Pick one that was found, or type its address.') : /\s/.test(d.address) ? 'Addresses have no spaces.' : !(Number(d.port) >= 1 && Number(d.port) <= 65535) ? 'The port is a number from 1 to 65535.' : '';
  function signStep(d) {
    const tiles = PM51.tiles([
      { title: 'It already runs Puppet Master', text: 'Approve it once with the setup code it shows. No key or password.', icon: 'link', key: 'pair' },
      { title: 'Sign in with an SSH key', text: 'Puppet Master signs in over SSH and installs itself there.', icon: 'key', key: 'ssh', meta: 'For a computer without Puppet Master yet' }
    ].map(t => ({ title: t.title, text: t.text, icon: t.icon, meta: t.meta, selected: d.method === t.key, data: { method: t.key } })), { action: 'pm51-servers-w-method' });
    if (d.method === 'pair') return tiles + `<div class="o55-setup-fields">${PM51.field('Setup code', `<input class="text-control o55-srv-code o55-setup-mono" value="${a(d.setupCode)}" placeholder="482 913" inputmode="numeric" autocomplete="off"/>`, `Shown on ${whoName(d)}’s setup page.`)}</div>`;
    if (d.method === 'ssh') return tiles + `<p class="o55-quiet-line o55-key-which">Which key should it use?</p>` + keyPick(d);
    return tiles;
  }
  const signCheck = d => !d.method ? 'Choose how it signs in.' : d.method === 'pair' ? (/^\d{3}\s?\d{3}$/.test(d.setupCode || '') ? '' : 'Enter the six-digit setup code.') : !d.user ? 'Go back and enter the username on it.' : keyCheck(d);
  function nameStep(d) {
    if (!d.name) d.name = d.kind === 'this' ? thisComputer() : (d.foundId && (nearby().find(n => n.id === d.foundId) || {}).brand ? `Home ${(nearby().find(n => n.id === d.foundId) || {}).brand}` : (SUGGEST[d.kind] || ['New server'])[0]);
    return `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-srv-name" value="${a(d.name)}" autocomplete="off"/>`)}${(SUGGEST[d.kind] || []).length ? `<div class="pm51-perm-actions o55-srv-suggest">${SUGGEST[d.kind].map(s => PM51.btn({ label: s, small: true, action: 'pm51-servers-w-suggest', data: { name: s } })).join('')}</div>` : ''}</div>`
      + PM51.rows([
        { label: 'Let it run work', help: 'Goals and tasks can run on it.', control: PM51.toggle(!!d.runsWork, { action: 'pm51-servers-w-flag', data: { key: 'runsWork' }, label: 'Let it run work' }) },
        { label: 'Default for new workspaces', help: 'New workspaces live on it unless you pick another.', control: PM51.toggle(!!d.makeDefault, { action: 'pm51-servers-w-flag', data: { key: 'makeDefault' }, label: 'Default for new workspaces' }) }
      ]);
  }
  function serverRecap(d) {
    const K = SERVER_KINDS.find(k => k.id === d.kind) || {};
    return PM51.panelSection(d.name, PM51.kv([
      ['Kind', K.title || '—'],
      ['Address', d.kind === 'this' ? 'This computer (localhost)' : `${d.address}${d.port && d.port !== '22' ? ':' + d.port : ''}`],
      ['Signs in', d.kind === 'this' ? 'Nothing needed' : d.method === 'pair' ? 'Approved with its setup code; no key' : `SSH key ${keyLabel(d)}, as ${d.user}`],
      ['Runs work', d.runsWork ? 'Yes' : 'No'],
      ['Default for new workspaces', d.makeDefault ? 'Yes' : 'No'],
      ['Next', d.kind !== 'this' && d.method === 'ssh' ? 'Puppet Master installs itself there, then pairs this device' : 'This device is paired with it']
    ]), '', { icon: 'server' }) + PM51.note('Only devices you approve can use it.', 'info');
  }
  function serverWizard() {
    const draft = { kind: '', foundId: '', found: '', address: '', user: '', port: '22', brand: '', method: '', setupCode: '', keyMode: '', keyId: '', newName: '', newType: 'Ed25519', filePath: '~/.ssh/id_ed25519', pasted: '', place: '', checked: false, name: '', runsWork: true, makeDefault: false };
    const steps = [
      { label: 'Kind', icon: 'server', title: 'What kind of computer will it be?', lead: 'Puppet Master runs on it and does the work, even when this device sleeps.', onShow: track,
        render: d => PM51.tiles(SERVER_KINDS.map(k => ({ title: k.title, text: k.text, icon: k.icon, selected: d.kind === k.id, done: k.id === 'this' && sp().servers.some(s => s.role === 'This computer'), doneMeta: 'Already one of your servers', doneReason: 'This computer is already on your list.', data: { kind: k.id } })), { action: 'pm51-servers-w-kind' }),
        check: d => d.kind ? '' : 'Pick what kind of computer it is.' },
      { label: 'Reach', icon: 'network', title: d => d.kind === 'cloud' ? 'What is its address?' : 'Which one is it?', lead: d => d.kind === 'cloud' ? 'A cloud computer doesn’t show up on your home network. Enter the address its provider shows.' : 'Puppet Master looks on your network. Nothing is changed.',
        render: reachStep, collect: reachCollect, check: d => d.kind === 'this' ? '' : reachCheck(d), onShow: skipFor(d => d.kind === 'this'), recap: d => d.kind === 'this' ? '' : d.found || d.address },
      { label: 'Sign in', icon: 'key', title: d => `How should Puppet Master sign in to ${whoName(d)}?`, lead: 'Only once. After that it connects on its own.',
        render: signStep, collect: (w, d) => { keyCollect(w, d); const c = w.querySelector('.o55-srv-code'); if (c) d.setupCode = String(c.value || '').trim(); }, check: d => d.kind === 'this' ? '' : signCheck(d), onShow: skipFor(d => d.kind === 'this'), recap: d => d.kind === 'this' ? '' : d.method === 'pair' ? 'Setup code' : `Key ${keyLabel(d)}` },
      { label: 'Key', icon: 'copy', title: d => `Put the key on ${whoName(d)}`, lead: 'It needs the public half once. After that, no password is needed.',
        render: d => { d.target = serverTarget(d); return placeStep(d); }, collect: placeCollect, check: d => d.kind === 'this' || d.method !== 'ssh' ? '' : placeCheck(d), onShow: skipFor(d => d.kind === 'this' || d.method !== 'ssh'), recap: d => d.kind !== 'this' && d.method === 'ssh' ? (d.place === 'password' ? 'With my password' : 'Added myself') : '' },
      { label: 'Check', icon: 'test', title: 'Check the connection', lead: 'Puppet Master makes sure it can reach it and sign in. Nothing is installed yet.',
        render: d => { d.target = serverTarget(d); return checkStep(d); }, check: d => d.checked ? '' : 'Run Check connection first.', onShow: track, recap: () => 'Works' },
      { label: 'Name', icon: 'edit', title: 'What should we call it?', lead: 'A name you’ll recognise on every device.', onShow: track,
        render: nameStep, collect: (w, d) => { const n = w.querySelector('.o55-srv-name'); if (n) d.name = String(n.value || '').trim(); },
        check: d => !d.name ? 'Give it a name.' : sp().servers.some(s => s.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a server called ${d.name}.` : '', recap: d => d.name },
      { label: 'Recap', icon: 'check', title: d => `Add ${d.name}?`, lead: 'Check it over, then add it.', render: serverRecap, onShow: track }
    ];
    PM51.wizard({ title: 'Add a server', subtitle: 'A server keeps your workspace and does the work. Your devices connect to it.', eyebrow: 'New server', icon: 'server', steps, draft, finishLabel: 'Add server', onFinish: d => {
      const S = sp(), K = SERVER_KINDS.find(k => k.id === d.kind) || SERVER_KINDS[1], id = uid('server', d.name);
      const keyId = d.kind !== 'this' && d.method === 'ssh' ? commitKey(d) : '';
      S.servers.push({ id, name: d.name, role: K.role, address: d.kind === 'this' ? 'localhost' : d.address, state: 'Connected', version: '0.8.0', updateReady: false, runsWork: !!d.runsWork, default: false, lastCheck: 'Just now',
        deployment: d.kind === 'this' ? 'Native app' : d.method === 'ssh' ? (d.kind === 'nas' ? 'Container (installed over SSH)' : 'Installed over SSH') : 'Already running Puppet Master', environments: d.kind === 'nas' ? ['Linux container · server'] : d.kind === 'cloud' ? ['Linux · server'] : [],
        claimed: true, claimSteps: { identity: true, claim: true }, signIn: d.kind === 'this' ? { method: 'local' } : d.method === 'ssh' ? { method: 'ssh', keyId, user: d.user, port: d.port } : { method: 'pair', user: d.user, port: d.port } });
      if (d.makeDefault) S.servers.forEach(x => { x.default = x.id === id; });
      PM51.setSel(ID, id); PM51.setTab(ID, 'servers'); refresh();
      PM51.toast(`${d.name} added`, 'Example only: nothing was installed or paired in this preview.', 'info');
    } });
  }
  const signInText = s => { const si = s.signIn || { method: s.role === 'This computer' ? 'local' : 'pair' }, k = keyById(si.keyId); if (si.method === 'local') return 'Nothing needed: it is this computer'; if (si.method === 'ssh') return k ? `SSH key ${k.name}, as ${si.user || 'you'}` : 'SSH, but no key is attached'; return `Paired with Puppet Master${k ? ` · SSH key ${k.name} for files and repairs` : '; no key needed'}`; };
  function attachServerKey(srv) {
    const si = srv.signIn || {};
    keyWizard({ target: { kind: 'ssh', name: srv.name, user: si.user || (/nas/i.test(srv.role) ? 'admin' : 'you'), address: srv.address, port: si.port || '22' }, keyId: si.keyId, onDone: id => { srv.signIn = Object.assign({ method: srv.role === 'This computer' ? 'local' : 'pair' }, si, { keyId: id }); if (srv.signIn.method === 'ssh' && srv.state === 'Needs attention') srv.state = 'Connected'; } });
  }

  /* ---------- Away from home, step by step ------------------------------------------------------------------------ */
  const WAYS = [
    { kind: 'tailscale', title: 'Tailscale', text: 'A private network between your devices. Sign in once; nothing is opened to the internet.', meta: 'Recommended', icon: 'network' },
    { kind: 'vpn', title: 'A VPN I already use', text: 'WireGuard, OpenVPN or another VPN you run. Puppet Master only uses it.', icon: 'shield' },
    { kind: 'domain', title: 'My own web address', text: 'An address like pm.example.com through a reverse proxy. Needs port forwarding on your router.', icon: 'browser' },
    { kind: 'remote-link', title: 'Puppet Master Remote Link', text: 'No account, domain or router change. Direct when possible, relayed otherwise.', icon: 'link' }
  ];
  const PROXIES = [['Caddy', 'Caddy (free certificate, simplest)'], ['NGINX', 'NGINX'], ['Traefik', 'Traefik'], ['Nginx Proxy Manager', 'Nginx Proxy Manager']];
  const wayName = d => (WAYS.find(w => w.kind === d.kind) || {}).title || 'this way in';
  const tailName = () => `${slugHost(homeServer().name)}.example-tailnet.ts.net`;
  function awayConfig(d) {
    const up = `${homeServer().address}:8443`;
    if (d.proxy === 'Traefik' || d.proxy === 'NGINX') return proxyConfig(d.domain, d.proxy);
    if (d.proxy === 'Nginx Proxy Manager') return `# Nginx Proxy Manager › Proxy Hosts › Add (example)\nDomain names: ${d.domain}\nScheme: http   Forward host: ${homeServer().address}   Port: 8443\nWebsockets support: on\nSSL: Request a new certificate, Force SSL`;
    return `# Caddyfile (example)\n${d.domain} {\n  reverse_proxy ${up}\n}`;
  }
  function awayDetails(d) {
    const home = homeServer();
    if (d.kind === 'tailscale') return PM51.field('Which Tailscale', PM51.segmented(d.flavor, [['hosted', 'A Tailscale account'], ['headscale', 'My own Headscale server']], { action: 'pm51-servers-w-flavor', label: 'Which Tailscale' }))
      + (d.flavor === 'headscale' ? `<div class="o55-setup-fields">${PM51.field('Headscale address', `<input class="text-control o55-aw-hs o55-setup-mono" value="${a(d.hsAddress)}" placeholder="https://headscale.example.net" autocomplete="off" spellcheck="false"/>`)}${PM51.field('How devices join', PM51.select(d.hsReg, [['Automatic', 'Automatically'], ['Ask administrator', 'An administrator approves each one'], ['One-time key', 'With a one-time key']], { cls: 'o55-aw-hsreg', label: 'How devices join' }))}${d.hsReg === 'One-time key' ? PM51.field('One-time key', '<input class="text-control o55-aw-hskey" type="password" autocomplete="off" placeholder="' + (d.hsKey ? 'Saved. Paste a new one to replace it' : 'Paste it here') + '"/>', 'From your Headscale server. Kept in the keychain, never shown again.') : ''}</div>` : PM51.note('On the next step you sign in with Google, Microsoft, GitHub or Apple. Nothing extra to install.', 'info'));
    if (d.kind === 'vpn') return `<div class="o55-setup-fields">${PM51.field('Which VPN', PM51.select(d.vpnKind, ['WireGuard', 'OpenVPN', 'Other'], { cls: 'o55-aw-vpnkind', label: 'Which VPN' }))}${PM51.field(`${home.name}’s address on the VPN`, `<input class="text-control o55-aw-vpnaddr o55-setup-mono" value="${a(d.vpnAddress)}" placeholder="10.8.0.2 or truenas.vpn" autocomplete="off" spellcheck="false"/>`, 'Ask whoever set up the VPN if you are not sure.')}</div>` + PM51.note('Puppet Master never changes your VPN. It only uses the address you give it.', 'info');
    if (d.kind === 'domain') return `<div class="o55-setup-fields">${PM51.field('Web address', `<input class="text-control o55-aw-dom o55-setup-mono" value="${a(d.domain)}" placeholder="pm.example.com" autocomplete="off" spellcheck="false"/>`)}${PM51.field('Who runs the proxy', PM51.select(d.hosting, [['pm', 'Puppet Master sets it up (Caddy)'], ['file', 'Only make the settings file'], ['existing', 'I already have one']], { cls: 'o55-aw-host', label: 'Who runs the proxy' }))}${d.hosting === 'pm' ? '' : PM51.field('Which proxy', PM51.select(d.proxy, PROXIES, { cls: 'o55-aw-proxy', label: 'Which proxy' }))}</div>`
      + PM51.panelSection('Port forwarding on your router', `<p class="pm51-ps-text">${h(`Your router has to send web traffic (port 443) to ${home.name} at ${home.address}. This is called port forwarding; look for it in your router’s settings. Puppet Master can’t change your router.`)}</p>` + PM51.rows([{ label: `My router forwards port 443 to ${home.name}`, control: PM51.toggle(!!d.forwarded, { action: 'pm51-servers-w-aflag', data: { key: 'forwarded' }, label: 'My router forwards port 443' }) }]), '', { icon: 'route' })
      + PM51.note('This is a public address, so sign-in is still required. Tailscale or Remote Link keep the server private.', 'attention');
    return PM51.note('Nothing to fill in: no account, domain or router change. The server dials out, and traffic stays encrypted end to end.', 'info') + PM51.rows([{ label: 'Use the relay when a direct connection isn’t possible', help: 'Slower, still encrypted. Off means some networks cannot reach it.', control: PM51.toggle(!!d.relay, { action: 'pm51-servers-w-aflag', data: { key: 'relay' }, label: 'Use the relay' }) }]);
  }
  function awayCollect(w, d) {
    const v = s => { const el = w.querySelector(s); return el ? String(el.value || '').trim() : null; };
    const hs = v('.o55-aw-hs'), reg = v('.o55-aw-hsreg'), key = v('.o55-aw-hskey'), vk = v('.o55-aw-vpnkind'), va = v('.o55-aw-vpnaddr'), dom = v('.o55-aw-dom'), host = v('.o55-aw-host'), px = v('.o55-aw-proxy');
    if (hs != null) d.hsAddress = hs; if (reg) d.hsReg = reg; if (key) d.hsKey = true; if (vk) d.vpnKind = vk; if (va != null) d.vpnAddress = va;
    if (dom != null) d.domain = dom.replace(/^https?:\/\//, '').replace(/\/.*$/, ''); if (host) { d.hosting = host; if (host === 'pm') d.proxy = 'Caddy'; } if (px) d.proxy = px;
  }
  function awayDetailsCheck(d) {
    if (d.kind === 'tailscale' && d.flavor === 'headscale') return !/^https:\/\/\S+\.\S+/.test(d.hsAddress) ? 'Enter the Headscale address, starting with https://.' : d.hsReg === 'One-time key' && !d.hsKey ? 'Paste the one-time key.' : '';
    if (d.kind === 'vpn') return d.vpnAddress && !/\s/.test(d.vpnAddress) ? '' : 'Enter the server’s address on the VPN.';
    if (d.kind === 'domain') return !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(d.domain) ? 'Enter a web address like pm.example.com.' : !d.forwarded ? 'Set up port forwarding on your router first, then switch it on here.' : '';
    return '';
  }
  function awayConnect(d) {
    const home = homeServer(), btn = (label, act, ic) => `<div class="pm51-perm-actions">${PM51.btn({ label, primary: true, icon: ic, action: act })}</div>`;
    if (d.kind === 'tailscale' && d.flavor === 'headscale') return d.signedIn ? PM51.panelSection('Registered', PM51.kv([['Headscale', d.hsAddress], ['Private name', `${slugHost(home.name)}.headscale.internal · example`], ['Who can connect', 'Only devices your Headscale knows']]), '', { icon: 'network' }) : PM51.note(`${home.name} joins your Headscale network${d.hsReg === 'Ask administrator' ? ' once an administrator approves it' : ''}.`, 'info') + btn('Register with Headscale', 'pm51-servers-w-signin', 'network');
    if (d.kind === 'tailscale') return d.signedIn ? PM51.panelSection('Signed in', PM51.kv([['Signed in as', 'you@example.com · example'], ['Private name', `${tailName()} · example`], ['Who can connect', 'Only your signed-in devices']]), '', { icon: 'network' }) : PM51.steps([{ title: 'Sign in', desc: 'Google, Microsoft, GitHub or Apple, in your browser.' }, { title: 'Approve this device', desc: 'If your Tailscale asks for it, in its admin page.' }, { title: 'A private name', desc: `${home.name} gets a name that works from anywhere, only for your devices.` }]) + btn('Sign in to Tailscale', 'pm51-servers-w-signin', 'link');
    if (d.kind === 'vpn') return PM51.note(`Connect this device to your ${d.vpnKind} VPN the way you usually do, then switch this on.`, 'info') + PM51.rows([{ label: 'This device is on the VPN now', control: PM51.toggle(!!d.vpnOn, { action: 'pm51-servers-w-aflag', data: { key: 'vpnOn' }, label: 'This device is on the VPN now' }) }]);
    if (d.kind === 'domain') return PM51.panelSection('1. Point the address home', `<p class="pm51-ps-text">${h(`At the company where you bought ${d.domain}, add an A record that points it at your home’s public address (203.0.113.24 here, as an example).`)}</p>`, '', { icon: 'globe' })
      + PM51.panelSection(d.hosting === 'pm' ? '2. Puppet Master sets up Caddy' : d.hosting === 'file' ? '2. The settings file for your proxy' : '2. Add this to your proxy', (d.hosting === 'pm' ? `<p class="pm51-ps-text">${h(`Caddy runs next to Puppet Master on ${home.name} and gets a free certificate by itself. This is what it uses:`)}</p>` : '') + copyBox(awayConfig(d), 'Proxy settings'), '', { icon: 'file' });
    return d.link ? PM51.panelSection('Your link', copyBox(d.link, 'Remote Link') + PM51.kv([['Relay', d.relay ? 'Only when a direct connection is not possible' : 'Off'], ['Pairing', 'Your other devices use the same pairing code as at home']]), 'On another device choose Connect this device, then paste this link.', { icon: 'link' }) : PM51.note(`${home.name} gets a link only your devices know. Nothing is opened on your router.`, 'info') + btn('Create link', 'pm51-servers-w-link', 'link');
  }
  const awayConnectCheck = d => (d.kind === 'tailscale' && !d.signedIn) ? (d.flavor === 'headscale' ? 'Register with Headscale first.' : 'Sign in to Tailscale first.') : d.kind === 'remote-link' && !d.link ? 'Create the link first.' : d.kind === 'vpn' && !d.vpnOn ? 'Connect this device to the VPN first, then switch it on.' : '';
  const awayVia = d => d.kind === 'tailscale' ? (d.flavor === 'headscale' ? `Headscale at ${d.hsAddress}` : 'Private Tailscale name') : d.kind === 'vpn' ? `${d.vpnKind} at ${d.vpnAddress}` : d.kind === 'domain' ? `${d.hosting === 'pm' ? 'Caddy' : d.proxy} at ${d.domain}` : 'Remote Link, direct or relayed';
  function awayCheck(d) {
    if (!d.checked) return PM51.note('Puppet Master tries to reach your server through the new way in, from this device.', 'info') + `<div class="pm51-perm-actions">${PM51.btn({ label: 'Check route', primary: true, icon: 'test', action: 'pm51-servers-key-check' })}</div>`;
    return PM51.steps([{ title: 'Route is set up', desc: awayVia(d) }, { title: 'Server reachable through it', desc: 'From this device' }, { title: 'It is your server', desc: fingerprint(homeServer()) }, { title: 'Sign-in page answers', desc: 'Only paired devices get further' }].map(s => Object.assign({ status: 'Example', tone: 'info', done: true }, s)))
      + PM51.note('Example data only. In the app the live connector proves this.', 'info') + `<div class="pm51-perm-actions">${PM51.btn({ label: 'Check again', small: true, icon: 'refresh', action: 'pm51-servers-key-check' })}</div>`;
  }
  function awayWizard(kind) {
    const R = ra(), hs = R.headscale || {}, v = R.vpn || {}, dom = R.domain || {};
    const draft = { kind: kind || '', flavor: hs.address ? 'headscale' : 'hosted', hsAddress: hs.address || '', hsReg: hs.registration || 'Automatic', hsKey: !!hs.keySaved, vpnKind: v.kind || 'WireGuard', vpnAddress: v.address || '', domain: dom.name || '', proxy: dom.proxy || 'Caddy', hosting: dom.hosting || 'pm', forwarded: !!dom.forwarded, relay: true, signedIn: false, link: (R.remoteLink || {}).link || '', vpnOn: false, checked: false, useIt: true };
    const steps = [];
    if (!kind) steps.push({ label: 'Way', icon: 'route', title: `How should your devices reach ${homeServer().name} away from home?`, lead: 'At home everything already works. Pick one way in for when you are out; you can add more later.',
      render: d => PM51.tiles(WAYS.map(w => { const r = routeById(w.kind); return { title: w.title, text: w.text, meta: r && routeConfigured(r) ? 'Already set up; this sets it up again' : w.meta, icon: w.icon, selected: d.kind === w.kind, data: { kind: w.kind } }; }), { action: 'pm51-servers-w-way' }), check: d => d.kind ? '' : 'Pick one way in.' });
    steps.push({ label: 'Details', icon: 'sliders', title: d => ({ tailscale: 'Which Tailscale?', vpn: 'Which VPN, and where is the server on it?', domain: 'Which address, and who runs the proxy?', 'remote-link': 'Nothing to fill in' })[d.kind] || 'Details', lead: d => d.kind === 'domain' ? 'Your own address goes through a reverse proxy in front of Puppet Master.' : d.kind === 'remote-link' ? 'Remote Link needs no account, domain or router change.' : 'Only what Puppet Master needs to find your server.',
      render: awayDetails, collect: awayCollect, check: awayDetailsCheck, recap: d => d.kind === 'tailscale' ? (d.flavor === 'headscale' ? 'Headscale' : 'Tailscale account') : d.kind === 'vpn' ? d.vpnKind : d.kind === 'domain' ? d.domain : 'Nothing needed' });
    steps.push({ label: 'Connect', icon: 'link', title: d => d.kind === 'tailscale' ? (d.flavor === 'headscale' ? 'Register with your Headscale' : 'Sign in to Tailscale once') : d.kind === 'vpn' ? 'Connect this device to the VPN' : d.kind === 'domain' ? 'Point the address and set up the proxy' : 'Create your link', lead: d => d.kind === 'domain' ? 'Two things outside Puppet Master, done once.' : 'Done once; after that it connects on its own.',
      render: awayConnect, check: awayConnectCheck, recap: d => d.kind === 'tailscale' ? 'Signed in' : d.kind === 'remote-link' ? 'Link made' : d.kind === 'domain' ? 'Proxy ready' : 'On the VPN' });
    steps.push({ label: 'Check', icon: 'test', title: 'Does it work from here?', lead: 'Puppet Master tries the new way in from this device.', render: awayCheck, check: d => d.checked ? '' : 'Run Check route first.', recap: () => 'Works' });
    steps.push({ label: 'Recap', icon: 'check', title: d => `Save ${wayName(d)}?`, lead: 'Check it over. You can turn it off or remove it later.',
      render: d => { const r = routeById(d.kind); return PM51.panelSection(wayName(d), PM51.kv([['Goes through', awayVia(d)], ['Private', d.kind === 'domain' ? 'No: a public address with sign-in' : 'Yes: only your devices'], ['Tried', r ? `${ordinal(routePosition(r))}, after the routes above it` : '—']]), '', { icon: 'route' }) + PM51.rows([{ label: 'Use it when away', help: 'Off keeps the setup but skips it.', control: PM51.toggle(!!d.useIt, { action: 'pm51-servers-w-aflag', data: { key: 'useIt' }, label: 'Use it when away' }) }]); } });
    PM51.wizard({ title: kind ? `Set up ${(routeById(kind) || {}).name || 'a way in'}` : 'Set up a way in from anywhere', subtitle: 'How your devices reach your server when you are not at home.', eyebrow: 'Away from home', icon: 'route', steps, draft, finishLabel: 'Save', onFinish: d => {
      const R2 = ra(), r = routeById(d.kind); if (!r) return;
      if (d.kind === 'tailscale') R2.headscale = d.flavor === 'headscale' ? { address: d.hsAddress, registration: d.hsReg, keySaved: !!d.hsKey } : null;
      if (d.kind === 'vpn') R2.vpn = { kind: d.vpnKind, address: d.vpnAddress };
      if (d.kind === 'domain') R2.domain = { name: d.domain, proxy: d.hosting === 'pm' ? 'Caddy' : d.proxy, hosting: d.hosting, forwarded: true, generated: true };
      if (d.kind === 'remote-link') R2.remoteLink = { link: d.link, created: `Today · ${nowLabel()}`, relay: !!d.relay };
      r.status = d.useIt ? 'ready' : 'off'; r.enabled = !!d.useIt; r.lastCheck = 'Just now';
      PM51.setTab(ID, 'away'); refresh();
      PM51.toast(`${r.name} is set up`, `${d.useIt ? `Tried ${ordinal(routePosition(r))} when you are away. ` : 'Turned off for now. '}Example only: nothing outside this preview changed.`, 'info');
    } });
  }

  /* ---------- Move & Copy, step by step ---------------------------------------------------------------------------- */
  const MOVE_TASKS = [
    { id: 'move', title: 'Move this workspace', text: 'It lives on another server from now on. Work pauses while it moves.', icon: 'arrowRight' },
    { id: 'copy', title: 'Make a copy', text: 'An independent copy on a server you pick. The original stays.', icon: 'copy' },
    { id: 'import', title: 'Bring in a project from an SSH computer', text: 'A folder on another computer becomes a new workspace here.', icon: 'download' }
  ];
  const moveItems = () => (PM51_DATA.serverProject || {}).moveItems || [];
  const HISTORY_CHOICES = {
    move: [['keep30', 'Keep the old copy for 30 days', 'Read-only, so you can go back. Then it is removed.', 'history'], ['remove', 'Remove the old copy once it has moved', 'Frees the space right away.', 'trash']],
    copy: [['with', 'Bring the history so far', 'Every saved change comes along. From now on the two grow apart.', 'history'], ['fresh', 'Start with a clean history', 'The copy begins with one saved change of today’s files.', 'spark']],
    import: [['with', 'Bring its version history', 'Every saved change on that computer comes along.', 'history'], ['fresh', 'Start with a clean history', 'Only today’s files; its old history stays on that computer.', 'spark']]
  };
  const taskOf = d => MOVE_TASKS.find(t => t.id === d.task) || MOVE_TASKS[0];
  const destLabel = d => d.task === 'import' ? homeServer().name : d.dest === 'other' ? (d.destAddress || 'another server') : (serverById(d.dest) || {}).name || '';
  function moveWhat(d) {
    if (d.task === 'import') {
      const list = sshRemotes();
      return list.length ? PM51.tiles(list.map((f, i) => ({ title: f.name, text: `${f.user ? f.user + '@' : ''}${f.address}`, meta: keyById(f.keyId) ? `Signs in with ${keyById(f.keyId).name}` : 'No key attached yet', icon: 'terminal', selected: d.from === String(i), data: { from: String(i) } })), { action: 'pm51-servers-w-from' })
        + `<div class="o55-setup-fields">${PM51.field('Folder on it', `<input class="text-control o55-mv-folder o55-setup-mono" value="${a(d.folder)}" placeholder="/home/ubuntu/projects/my-app" autocomplete="off" spellcheck="false"/>`)}</div>`
        : PM51.note('Add an SSH computer on the Servers tab first; then it shows up here.', 'attention');
    }
    return PM51.tiles(moveItems().map(it => ({ title: it.title, text: it.text, icon: it.icon, selected: it.locked || d.items.includes(it.id), done: !!it.locked, doneMeta: 'Always goes', doneReason: 'The files always go.', data: { item: it.id } })), { action: 'pm51-servers-w-item', multi: true })
      + PM51.note('Secrets and device pairings stay behind; you sign in again where needed.', 'info');
  }
  function moveTo(d) {
    if (d.task === 'import') return `<div class="o55-setup-fields">${PM51.field('Name of the new workspace', `<input class="text-control o55-mv-name" value="${a(d.newName)}" autocomplete="off"/>`)}</div>` + PM51.panelSection('It will live on', PM51.kv([['Server', homeServer().name], ['Folder', `/mnt/data/projects/${slugHost(d.newName || 'imported')}`]]), '', { icon: 'server' });
    const S = sp(), list = S.servers.filter(s => isClaimed(s) && (d.task === 'copy' || s.id !== S.homeServer));
    return PM51.tiles(list.map(s => ({ title: s.name, text: `${s.role} · ${s.address}`, meta: s.id === S.homeServer ? 'Where it lives now' : '', icon: 'server', selected: d.dest === s.id, data: { dest: s.id } })).concat([{ title: 'Another server', text: 'Type its address.', icon: 'plus', selected: d.dest === 'other', data: { dest: 'other' } }]), { action: 'pm51-servers-w-dest' })
      + `<div class="o55-setup-fields">${d.dest === 'other' ? PM51.field('Its address', `<input class="text-control o55-mv-addr o55-setup-mono" value="${a(d.destAddress)}" placeholder="nas.local" autocomplete="off" spellcheck="false"/>`) : ''}${d.task === 'copy' ? PM51.field('Name of the copy', `<input class="text-control o55-mv-name" value="${a(d.newName)}" autocomplete="off"/>`) : ''}${PM51.field('Folder there', `<input class="text-control o55-mv-dfolder o55-setup-mono" value="${a(d.destFolder)}" autocomplete="off" spellcheck="false"/>`)}</div>`;
  }
  function moveCollect(w, d) {
    const v = s => { const el = w.querySelector(s); return el ? String(el.value || '').trim() : null; };
    const f = v('.o55-mv-folder'), n = v('.o55-mv-name'), ad = v('.o55-mv-addr'), df = v('.o55-mv-dfolder');
    if (f != null) d.folder = f; if (n != null) d.newName = n; if (ad != null) d.destAddress = ad; if (df != null) d.destFolder = df;
  }
  const moveHistoryStep = d => PM51.tiles(HISTORY_CHOICES[d.task].map(([k, t, x, ic]) => ({ title: t, text: x, icon: ic, selected: d.hist === k, data: { hist: k } })), { action: 'pm51-servers-w-hist' });
  function moveCheck(d) {
    if (!d.checked) return PM51.note(d.task === 'import' ? 'Puppet Master reads the folder and its history. Nothing is copied yet.' : `Puppet Master checks ${destLabel(d)} and this workspace. Nothing moves yet.`, 'info') + `<div class="pm51-perm-actions">${PM51.btn({ label: d.task === 'move' ? 'Check before moving' : 'Check first', primary: true, icon: 'test', action: 'pm51-servers-key-check' })}</div>`;
    const S = sp(), f = sshRemotes()[Number(d.from)] || {};
    const rows = d.task === 'import' ? [{ title: `${f.name || 'The computer'} answers`, desc: f.address }, { title: 'Folder can be read', desc: d.folder }, { title: 'Version history found', desc: d.hist === 'with' ? '1,204 saved changes · example' : 'Not brought along' }, { title: 'Enough space here', desc: homeServer().name }]
      : [{ title: 'Destination reachable', desc: destLabel(d) }, { title: 'Enough free space', desc: 'Files, history and what you chose' }, { title: 'No open conflicts', desc: `${S.conflicts.open || 0} open` }, { title: 'Unsaved work parked', desc: d.task === 'move' ? 'Editors, terminals and running Goals pause safely' : 'Nothing pauses for a copy' }];
    return PM51.steps(rows.map(s => Object.assign({ status: 'Example', tone: 'info', done: true }, s))) + PM51.note('Example data only; nothing moved.', 'info');
  }
  function moveWizard(task) {
    const home = homeServer(), proj = (typeof projectDisplayName === 'function' ? projectDisplayName() : '') || 'workspace';
    const draft = { task: task || '', items: moveItems().filter(i => i.id !== 'artifacts').map(i => i.id), from: '', folder: '', dest: '', destAddress: '', destFolder: `/mnt/data/projects/${slugHost(proj)}`, newName: task === 'import' ? 'Imported workspace' : `${proj} (copy)`, hist: task === 'move' ? 'keep30' : 'with', checked: false };
    const steps = [];
    if (!task) steps.push({ label: 'Task', icon: 'layers', title: 'What would you like to do?', lead: 'Each one checks first and asks before anything moves.', render: d => PM51.tiles(MOVE_TASKS.map(t => ({ title: t.title, text: t.text, icon: t.icon, selected: d.task === t.id, data: { task: t.id } })), { action: 'pm51-servers-w-task' }), check: d => d.task ? '' : 'Pick one to go on.' });
    steps.push({ label: 'What', icon: 'folder', title: d => d.task === 'import' ? 'Which computer, and which folder?' : 'What goes with it?', lead: d => d.task === 'import' ? 'The project is read from there. Nothing on that computer changes.' : 'The files always go. Pick what else should come along.',
      render: moveWhat, collect: moveCollect, check: d => d.task === 'import' ? (!sshRemotes().length ? 'Add an SSH computer first.' : d.from === '' ? 'Pick the computer.' : !/^(~|\/)/.test(d.folder) ? 'Enter the folder, starting with / or ~.' : '') : '',
      recap: d => d.task === 'import' ? `${(sshRemotes()[Number(d.from)] || {}).name || ''}` : `${d.items.length + 1} kinds` });
    steps.push({ label: 'Where to', icon: 'server', title: d => d.task === 'import' ? 'What should the new workspace be called?' : d.task === 'copy' ? 'Where should the copy go?' : 'Where should it move to?', lead: d => d.task === 'move' ? `It lives on ${home.name} now.` : d.task === 'copy' ? 'Any of your servers, including this one.' : `It lives on ${home.name}, your home server.`,
      render: moveTo, collect: moveCollect, check: d => d.task === 'import' ? (d.newName ? '' : 'Give it a name.') : !d.dest ? 'Pick where it goes.' : d.dest === 'other' && !d.destAddress ? 'Type the other server’s address.' : !/^(~|\/)/.test(d.destFolder || '') ? 'Enter the folder there, starting with / or ~.' : d.task === 'copy' && !d.newName ? 'Give the copy a name.' : '',
      recap: d => d.task === 'import' ? d.newName : destLabel(d) });
    steps.push({ label: 'History', icon: 'history', title: d => d.task === 'move' ? 'What happens to the old copy?' : 'What about its version history?', lead: d => d.task === 'move' ? 'Version history always moves with the workspace.' : 'Saved changes can come along, or it can start fresh.', render: moveHistoryStep, check: d => d.hist ? '' : 'Pick one.' });
    steps.push({ label: 'Check', icon: 'test', title: 'Check first', lead: 'Space, reachability, open conflicts and unsaved work.', render: moveCheck, check: d => d.checked ? '' : 'Run the check first.', recap: () => 'Ready' });
    steps.push({ label: 'Recap', icon: 'check', title: d => d.task === 'move' ? `Move to ${destLabel(d)}?` : d.task === 'copy' ? `Copy to ${destLabel(d)}?` : `Bring in ${d.newName}?`, lead: d => d.task === 'move' ? 'Work pauses while it moves and resumes afterwards. You can move it back.' : 'Check it over, then go ahead.',
      render: d => { const it = moveItems().filter(i => i.locked || d.items.includes(i.id)).map(i => i.title); const hc = (HISTORY_CHOICES[d.task].find(x => x[0] === d.hist) || [])[1]; return PM51.panelSection(taskOf(d).title, PM51.kv([['From', d.task === 'import' ? `${(sshRemotes()[Number(d.from)] || {}).name} · ${d.folder}` : home.name], ['To', d.task === 'import' ? `${home.name} · ${d.newName}` : `${destLabel(d)} · ${d.destFolder}`], ['Takes along', d.task === 'import' ? 'The folder' : it.join(', ')], ['History', hc || '—']]), '', { icon: taskOf(d).icon }); } });
    PM51.wizard({ title: task ? taskOf({ task }).title : 'Move or copy', subtitle: 'Move this workspace, copy it, or bring one in from another computer.', eyebrow: 'Move & Copy', icon: 'copy', steps, draft, finishLabel: 'Go ahead', onFinish: d => {
      const S = sp(), it = moveItems().filter(i => i.locked || d.items.includes(i.id)).map(i => i.title), hc = (HISTORY_CHOICES[d.task].find(x => x[0] === d.hist) || [])[1];
      const kind = d.task === 'import' ? 'Import' : d.task === 'copy' ? 'Copy' : 'Move';
      S.move.history.unshift({ time: `Today · ${nowLabel()}`, kind, from: d.task === 'import' ? `${(sshRemotes()[Number(d.from)] || {}).name} · ${d.folder}` : home.name, destination: d.task === 'import' ? `${home.name} · ${d.newName}` : d.task === 'copy' ? `${destLabel(d)} · ${d.newName}` : destLabel(d), items: d.task === 'import' ? 'The folder' : it.join(', '), historyNote: hc, result: 'Preview only · example data' });
      if (d.task === 'move') { S.move.destination = destLabel(d); S.move.preflight = { at: nowLabel(), outcome: 'Checked · example data' }; }
      PM51.setTab(ID, 'move'); refresh();
      PM51.toast(`${kind} recorded`, 'Example only: nothing moved or was copied in this preview.', 'info');
    } });
  }

  /* Source Control's Git sign-in uses the same keys and steps. */
  PM51.sysSsh = { keys, keyById, keyUses, keyPick, keyCollect, keyCheck, pubOf, keyLabel, commitKey, placeStep, placeCollect, placeCheck, checkStep, keyWizard, copyBox, keyFp };

  /* ---------- Home & Location -------------------------------------------- */
  function renderHome() {
    const S = sp(), home = homeServer(), connected = S.devices.filter(d => d.state === 'Connected').length;
    const thisDevice = S.devices.find(d => d.current || d.thisDevice) || S.devices.find(d => d.name === 'Windows Workstation') || S.devices[0];
    const exec = runLabel();
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
        { label: 'Sync mode', value: P.syncMode || 'Continuous metadata + on-demand artifacts' }
      ]),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Server identity', fingerprint(home)], ['Home server address', home.address], ['Project path', S.sourceLocation.path], ['Diagnostics', 'Reachability, identity, file authority, continuity']]) + `<div class="pm51-servers-actions" style="margin-top:10px">${pm7ConsumerButton('local', 'ui.project.open_details', 'Project details')}${pm7ConsumerButton('local', 'ui.project.source_location.open_details', 'Where the files are')}</div>` })
    ].join(''));
    return workspace + status + advanced;
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
          { label: 'Role', value: srv.id === S.homeServer && srv.role !== 'Home server' ? `${srv.role} · Home server` : srv.role },
          { label: 'Address', value: srv.address },
          { label: 'Version', value: srv.version, pill: srv.updateReady ? PM51.status('Update ready') : '', action: srv.updateReady ? { label: 'App Updates', action: 'pm51-go', data: { domain: 'system', workspace: 'updates' }, icon: 'arrowRight' } : null },
          { label: 'Runs work', help: 'Allow Goals and tasks to run on this server.', control: PM51.toggle(!!srv.runsWork, { action: 'pm51-servers-runs', data: { id: srv.id }, label: 'Runs work' }) },
          { label: 'Default for new workspaces', control: PM51.toggle(!!srv.default, { action: 'pm51-servers-default', data: { id: srv.id }, label: 'Default for new workspaces' }) },
          { label: 'Signs in with', data: { 'setting-id': 'code.execution.server-sign-in' }, value: signInText(srv), action: srv.role === 'This computer' ? null : { label: srv.signIn && srv.signIn.keyId ? 'Change key' : 'Attach a key', icon: 'key', action: 'pm51-servers-attach-key', data: { id: srv.id } } },
          { label: 'Connection', value: `Checked ${srv.lastCheck}`, action: { label: 'Test connection', icon: 'test', action: 'pm51-servers-test', data: { id: srv.id, 'command-id': 'cmd.execution_host.test' } } }
        ])
      });
    }
    const advanced = PM51.advanced([
      PM51.section({ title: 'Claim and bootstrap', body: PM51.kv([['Claimed', isClaimed(srv) ? 'Yes · identity confirmed' : 'Not yet'], ['Identity', fingerprint(srv)], ['Trust', isClaimed(srv) ? 'Owner' : 'None until claimed'], ['Bootstrap', srv.role === 'This computer' ? 'Installed with the app' : 'Claimed from an existing install']]) + `<div class="pm51-servers-actions" style="margin-top:10px">${PM51.btn({ label: 'Claim this server', small: true, icon: 'lock', action: 'pm51-servers-claim', data: { id: srv.id }, disabled: isClaimed(srv), reason: 'This server is already yours.' })}${PM51.btn({ label: 'Set up a new server', small: true, icon: 'plus', action: 'pm51-servers-add' })}</div>` }),
      PM51.section({ title: 'Deployment', body: PM51.kv([['How it runs', srv.deployment || 'Unknown'], ['Image', /container/i.test(srv.deployment || '') ? 'puppetmaster/server:0.8.0' : 'Not a container'], ['Environments', (srv.environments || []).join(' · ') || 'None reported']]) }),
      PM51.section({ title: 'Full server backup', help: 'Backs up everything on this server, not just this workspace.', body: PM51.rows([{ label: 'Whole-server backup', help: 'Set up and run from Backup & Restore.', action: { label: 'Open Backup & Restore', action: 'pm51-go', data: { domain: 'system', workspace: 'backup' }, icon: 'arrowRight' } }]) }),
      PM51.section({ title: 'Host and environment details', body: `<div class="pm51-servers-actions">${PM51.btn({ label: 'Check this server', small: true, icon: 'test', action: 'pm51-servers-test', data: { id: srv.id } })}${PM51.btn({ label: 'Add another server', small: true, icon: 'plus', action: 'pm51-servers-add' })}</div>` }),
      PM51.section({ title: 'Topology diagnostics', body: PM51.kv([['Servers', String(S.servers.length)], ['Devices', String(S.devices.length)], ['Routes ready', String(readyRoutes().length)]]) + `<div style="margin-top:10px"></div>` })
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
      PM51.section({ title: 'Danger zone', body: PM51.rows([{ label: 'Revoke all devices', help: 'Every device must pair again, including this one.', action: { label: 'Revoke all devices', danger: true, action: 'pm51-servers-revoke-all' } }]) + `<div style="margin-top:10px"></div>` })
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
    if (!r.locked && routeConfigured(r)) parts.push(PM51.iconBtn({ icon: 'more', label: `More for ${r.name}`, callback: el => PM51.menu(el, [
      { label: 'Details', icon: 'info', onClick: () => remotePanel(r.id) },
      { label: 'Set it up again', icon: 'refresh', onClick: () => awayWizard(r.kind) },
      { separator: true },
      { label: 'Remove this way in', icon: 'trash', danger: true, onClick: () => removeRoute(r) }
    ], r.name) }));
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
      action: { label: 'Set up a way in', icon: 'plus', small: true, action: 'pm51-servers-away-new' },
      body: PM51.rows([
        { label: 'Right now', help: 'The route your devices are using at this moment.', control: `<span class="pm51-row-value">${h(actual.status === 'active' ? `Connected · ${actual.name}` : actual.name)}</span>${routeToken(actual)}` },
        { label: 'Preferred when away', help: 'The first route that is set up and turned on.', control: preferred ? `<span class="pm51-row-value">${h(preferred.name)}</span>${routeToken(preferred)}` : `<span class="pm51-row-value is-muted">None set up yet — set one up below</span>` }
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
        { label: 'Registration', control: PM51.dropdown(hs.registration || 'Automatic', ['Automatic', 'Ask administrator', 'One-time key'], { action: 'pm51-servers-headscale-reg', label: 'Registration' }) },
        hs.registration === 'One-time key' ? { label: 'One-time key', help: 'From your Headscale server. Kept in the keychain and never shown again.', action: { label: hs.keySaved ? 'Replace key' : 'Add key', icon: 'key', action: 'pm51-servers-headscale-key' } } : null
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
      ]) + `<div class="pm51-servers-subhead">Route lifecycle names</div>` + PM51.kv(sorted.map(r => [r.name, `${r.status} → ${routeLifecycle(r)}`])) + `<div style="margin-top:10px"></div>` })
    ].join(''));
    return overview + routes + advanced;
  }

  /* ---------- Move & Copy ------------------------------------------------- */
  function renderMove() {
    const S = sp(), M = S.move;
    const start = PM51.section({
      title: 'Move or copy this workspace', help: `It lives on ${homeServer().name} now. Each one checks first and asks before anything moves.`,
      body: PM51.rows([
        { label: 'Move to another server', help: 'It lives there from now on. Work pauses safely while it moves.', action: { label: 'Move…', icon: 'arrowRight', action: 'pm51-servers-move-start', data: { 'command-id': 'cmd.project.move.start' } } },
        { label: 'Make a copy', help: 'An independent copy. The original stays where it is.', action: { label: 'Copy…', icon: 'copy', action: 'pm51-servers-copy', data: { 'command-id': 'cmd.project.duplicate_with_history' } } },
        { label: 'Bring in a project from an SSH computer', help: 'A folder on another computer becomes a new workspace here.', action: { label: 'Import…', icon: 'download', action: 'pm51-servers-ssh-import', ui: 'ui.settings.project_sync.remote.preview_import' } }
      ])
    });
    const hist = PM51.section({ title: 'Moves and copies', help: M.history.length ? 'What you started here. Nothing moves in this preview.' : '', cls: 'o55-move-hist',
      body: M.history.length ? PM51.list(M.history.map((x, i) => ({
        title: `${x.kind || 'Move'} · ${x.destination}`, meta: `${x.time} · ${x.result}`, sub: x.items ? `Took: ${x.items}` : '', avatar: icon(x.kind === 'Copy' ? 'copy' : x.kind === 'Import' ? 'download' : 'arrowRight'),
        end: PM51.iconBtn({ icon: 'more', label: `More for ${x.kind || 'Move'}`, callback: el => PM51.menu(el, [
          { label: 'Details', icon: 'info', onClick: () => PM51.panel({ title: `${x.kind || 'Move'} · ${x.destination}`, subtitle: x.time, icon: 'history', body: PM51.panelSection('What was asked for', PM51.kv([['From', x.from || homeServer().name], ['To', x.destination], ['Took along', x.items || 'Files'], ['History', x.historyNote || '—'], ['Result', x.result]])) }) },
          { label: 'Do it again…', icon: 'refresh', onClick: () => moveWizard((x.kind || 'Move').toLowerCase()) },
          { separator: true },
          { label: 'Remove from list', icon: 'trash', danger: true, onClick: () => PM51.confirm('Remove this entry?', 'Only the entry is removed. Nothing on any server changes.', 'Remove', () => { M.history.splice(i, 1); refresh(); }, true) }
        ], x.kind || 'Move') })
      }))) : PM51.empty('No moves or copies yet', 'Moves, copies and imports you start show up here.') });
    const conflicts = PM51.section({
      title: 'Conflicts',
      body: PM51.rows([
        { label: 'When both sides changed', help: 'The same file changed on two devices.', control: PM51.dropdown(S.conflicts.policy, (CONFLICT_POLICIES.includes(S.conflicts.policy) ? CONFLICT_POLICIES : [S.conflicts.policy, ...CONFLICT_POLICIES]).map(x => ({ value: x, label: x })), { action: 'pm51-servers-conflict-set', label: 'When both sides changed' }) },
        { label: 'Open conflicts', value: String(S.conflicts.open || 0), action: { label: 'View', action: 'pm51-servers-conflicts-view' } }
      ])
    });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Technical details', body: PM51.kv([['Last check before moving', M.preflight ? `${M.preflight.at} · ${M.preflight.outcome}` : 'Not run yet'], ['Last destination', M.destination || 'None'], ['Commands', 'cmd.project.move.preflight · cmd.project.move.start · cmd.project.duplicate_with_history']]) })
    ].join(''));
    return start + hist + conflicts + advanced;
  }

  function render() {
    const tab = PM51.tab(ID, 'home');
    const body = tab === 'servers' ? renderServers() + sshSection() + keysSection() : tab === 'devices' ? renderDevices() : tab === 'away' ? renderAway() : tab === 'move' ? renderMove() : renderHome();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Check server and devices', action: 'pm51-servers-diagnostics', data: { scope: tab } },
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
  /* Adding an SSH computer is guided (where it is, its key, putting the key there, a check); editing is one form. */
  function sshWizard() {
    const draft = { name: '', address: '', user: '', port: '22', folder: '', keyMode: '', keyId: '', newName: '', newType: 'Ed25519', filePath: '~/.ssh/id_ed25519', pasted: '', place: '', checked: false };
    const tgt = d => ({ kind: 'ssh', name: d.name || d.address, user: d.user, address: d.address, port: d.port, folder: d.folder });
    PM51.wizard({ title: 'Add an SSH computer', subtitle: 'Another computer you reach over SSH, for files or for running work.', eyebrow: 'SSH computer', icon: 'terminal', draft, finishLabel: 'Add computer', steps: [
      { label: 'Computer', icon: 'system', title: 'Which computer?', lead: 'Its address, the user you sign in as, and the folder to use.',
        render: d => `<div class="o55-setup-fields">${PM51.field('Nickname', `<input class="text-control o55-ssh-name" value="${a(d.name)}" placeholder="Ubuntu VM" autocomplete="off"/>`)}${PM51.field('Address', `<input class="text-control o55-ssh-addr o55-setup-mono" value="${a(d.address)}" placeholder="192.168.50.200 or host.example.com" autocomplete="off" spellcheck="false"/>`)}<div class="o55-srv-pair">${PM51.field('User', `<input class="text-control o55-ssh-user o55-setup-mono" value="${a(d.user)}" placeholder="ubuntu" autocomplete="off" spellcheck="false"/>`)}${PM51.field('Port', `<input class="text-control o55-ssh-port o55-setup-mono" value="${a(d.port)}" inputmode="numeric" autocomplete="off"/>`, 'Usually 22.')}</div>${PM51.field('Folder (optional)', `<input class="text-control o55-ssh-folder o55-setup-mono" value="${a(d.folder)}" placeholder="/home/ubuntu/projects" autocomplete="off" spellcheck="false"/>`)}</div>`,
        collect: (w, d) => { const v = s => String((w.querySelector(s) || {}).value || '').trim(); d.name = v('.o55-ssh-name'); d.address = v('.o55-ssh-addr'); d.user = v('.o55-ssh-user'); d.port = v('.o55-ssh-port') || '22'; d.folder = v('.o55-ssh-folder'); d.target = tgt(d); if (!d.newName) d.newName = `puppet-master-${slugHost(d.name || d.address)}`; },
        check: d => !d.name ? 'Give it a nickname.' : !d.address || /\s/.test(d.address) ? 'Enter its address.' : !d.user ? 'Enter the user you sign in as.' : sshRemotes().some(x => x.name.toLowerCase() === d.name.toLowerCase()) ? `There is already an SSH computer called ${d.name}.` : '', recap: d => d.name },
      { label: 'Key', icon: 'key', title: d => `Which key should sign in to ${d.name}?`, lead: 'A key lets Puppet Master connect without a password.', render: keyPick, collect: keyCollect, check: keyCheck, recap: keyLabel },
      { label: 'Put it there', icon: 'copy', title: d => `Put the key on ${d.name}`, lead: d => `${d.name} needs the public half once. After that, no password is needed.`, render: d => { d.target = tgt(d); return placeStep(d); }, collect: placeCollect, check: placeCheck, recap: d => d.place === 'password' ? 'With my password' : 'Added myself' },
      { label: 'Check', icon: 'test', title: 'Does it work?', lead: 'A quick sign-in with the key, and a look at the folder.', render: d => { d.target = tgt(d); return checkStep(d); }, check: d => d.checked ? '' : 'Run Check connection first.', recap: () => 'Works' }
    ], onFinish: d => {
      const keyId = commitKey(d);
      saveSsh(sshRemotes().concat([{ name: d.name, address: d.address, user: d.user, port: d.port, folder: d.folder, auth: 'SSH key', keyId }]));
      PM51.toast(`${d.name} added`, `Signs in with ${(keyById(keyId) || {}).name || 'your key'}. Example only: nothing was changed on ${d.name}.`, 'info');
    } });
  }
  function sshDialog(index) {
    const list = sshRemotes(), f = index != null && index >= 0 ? list[index] : null;
    if (!f) { sshWizard(); return; }
    const keyChoices = keys().map(k => ({ value: k.id, label: `SSH key ${k.name}`, meta: `${k.type} · ${k.where}` })).concat([{ value: 'agent', label: 'Any key in my SSH agent' }, { value: 'security', label: 'A security key (touch to sign in)' }]);
    const cur = f.keyId || (/agent/i.test(f.auth || '') ? 'agent' : /security/i.test(f.auth || '') ? 'security' : (keyChoices[0] || {}).value);
    openDialog({ title: `Edit ${f.name}`, subtitle: 'Only the public half of a key is used here. Passwords are never stored.', body: PM51.form([
      { label: 'Nickname', name: 'name', value: f.name, autofocus: true, placeholder: 'Ubuntu VM' },
      { label: 'Address', name: 'address', value: f.address, placeholder: '192.168.50.200 or host.example.com' },
      { label: 'User', name: 'user', value: f.user, placeholder: 'ubuntu' },
      { label: 'Port', name: 'port', value: f.port || '22' },
      { label: 'Folder', name: 'folder', value: f.folder, placeholder: '/home/ubuntu/projects' },
      { label: 'Signs in with', name: 'key', value: cur, type: 'select', choices: keyChoices, help: 'To add a new key, use Attach a key on the computer.' }
    ]), saveLabel: 'Save', onSave: data => {
      const name = String(data.name || '').trim(), address = String(data.address || '').trim(); if (!name || !address) { PM51.toast('Nickname and address are needed', 'Fill in both to continue.', 'warning'); return false; }
      const k = String(data.key || ''), isKey = !!keyById(k);
      const entry = { name, address, user: String(data.user || '').trim(), port: String(data.port || '22').trim() || '22', folder: String(data.folder || '').trim(), auth: isKey ? 'SSH key' : k === 'agent' ? 'SSH agent' : 'Security key', keyId: isKey ? k : '' };
      const next = list.slice(); next[index] = entry; saveSsh(next);
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
      body: spec.body + (r.locked || !routeConfigured(r) ? '' : PM51.panelSection('Change or remove', `<div class="pm51-servers-actions">${PM51.btn({ label: 'Set it up again', small: true, icon: 'refresh', action: 'pm51-servers-route-redo', data: { id: r.id } })}${PM51.btn({ label: 'Remove this way in', small: true, danger: true, icon: 'trash', action: 'pm51-servers-route-remove', data: { id: r.id } })}</div>`, 'Setting it up again walks through the same steps with your answers filled in.', { icon: 'sliders' })),
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
      move: [{ title: 'Destination reachable', desc: S.move.destination || 'No destination chosen' }, { title: 'Open conflicts', desc: String(S.conflicts.open || 0) }, { title: 'SSH computers reachable', desc: `${sshRemotes().length} saved`, status: 'Example', tone: 'info' }]
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
  PM51.on('servers-add', () => serverWizard());
  PM51.on('servers-attach-key', el => { const s = serverById(ds(el, 'id')); if (s) attachServerKey(s); });
  PM51.on('servers-ssh-key', el => attachSshKey(Number(ds(el, 'index'))));
  PM51.on('servers-key-add', () => keyWizard({}));
  PM51.on('servers-copy-text', el => copyText(ds(el, 'text'), ds(el, 'what') || 'Text'));
  /* wizard answers: a card picks and moves on, or redraws its step when it reveals more to fill in */
  const redraw = w => { const at = w.step(); window.setTimeout(() => { if (w.step() === at) w.go(at); }, 0); };
  PM51.on('servers-key-mode', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft; keyCollect(el.closest('.drawer-wrap'), d);
    d.keyMode = ds(el, 'mode'); d.checked = false;
    if (d.keyMode === 'existing') { d.keyId = ds(el, 'key'); if (!el.closest('.o55g-main').querySelector('[data-action="pm51-servers-w-method"]')) { w.next(); return; } }
    redraw(w);
  });
  PM51.on('servers-key-place', el => { const w = PM51.wizardOf(el); if (!w) return; placeCollect(el.closest('.drawer-wrap'), w.draft); w.draft.place = ds(el, 'place'); w.draft.checked = false; if (w.draft.place === 'auto') { w.next(); return; } redraw(w); });
  PM51.on('servers-key-check', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.checked = true; w.go(w.step()); });
  PM51.on('servers-w-kind', el => { const w = PM51.wizardOf(el); if (!w) return; const d = w.draft; if (d.kind !== ds(el, 'kind')) { d.foundId = ''; d.found = ''; d.address = ''; d.brand = ''; d.name = ''; d.checked = false; } d.kind = ds(el, 'kind'); w.next(); });
  PM51.on('servers-w-found', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, n = nearby().find(x => x.id === ds(el, 'found')); if (!n) return;
    Object.assign(d, { foundId: n.id, found: n.name, address: n.address, user: d.user || n.user || '', brand: n.brand || d.brand, checked: false });
    const main = el.closest('.o55g-main'), put = (s, v) => { const x = main && main.querySelector(s); if (x) x.value = v; };
    put('.o55-srv-addr', d.address); put('.o55-srv-user', d.user); if (d.brand) put('.o55-srv-brand', d.brand);
    if (n.sshOff) redraw(w); else w.next();
  });
  PM51.on('servers-w-method', el => { const w = PM51.wizardOf(el); if (!w) return; keyCollect(el.closest('.drawer-wrap'), w.draft); w.draft.method = ds(el, 'method'); w.draft.checked = false; if (w.draft.method === 'ssh' && !w.draft.newName) w.draft.newName = `puppet-master-${slugHost(whoName(w.draft))}`; redraw(w); });
  PM51.on('servers-w-suggest', el => { const w = PM51.wizardOf(el); if (!w) return; const inp = el.closest('.o55g-main').querySelector('.o55-srv-name'); if (inp) inp.value = ds(el, 'name'); w.draft.name = ds(el, 'name'); });
  PM51.on('servers-w-flag', el => { const w = PM51.wizardOf(el); if (!w) return; const k = ds(el, 'key'); w.draft[k] = !w.draft[k]; el.classList.toggle('on', !!w.draft[k]); el.setAttribute('aria-checked', String(!!w.draft[k])); });
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
  PM51.on('servers-remote', el => { const r = routeById(ds(el, 'id')); if (!r) return; if (r.kind !== 'lan' && (r.status === 'not-set-up' || r.status === 'needs-sign-in')) awayWizard(r.kind); else remotePanel(r.id); });
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
  PM51.onChange('servers-headscale-reg', el => { const R = ra(); R.headscale = Object.assign({}, R.headscale || {}, { registration: el.value }); refresh(); });
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
  PM51.on('servers-move-dest', () => moveWizard('move'));
  PM51.on('servers-move-check', () => moveWizard('move'));
  PM51.on('servers-move-start', () => moveWizard('move'));
  PM51.on('servers-copy', () => moveWizard('copy'));
  PM51.on('servers-conflicts-view', () => {
    const S = sp();
    PM51.panel({ title: 'Open conflicts', subtitle: 'Files changed on two sides at once.', status: { label: String(S.conflicts.open || 0) + ' open', tone: S.conflicts.open ? 'attention' : 'ready' }, body: S.conflicts.open ? PM51.panelSection('Conflicts', PM51.kv([['Waiting for you', String(S.conflicts.open)]])) : PM51.empty('No open conflicts', 'When both sides change the same file, it shows up here with a three-way comparison.') });
  });
  PM51.on('servers-ssh-add', () => sshDialog(-1));
  PM51.on('servers-headscale-key', () => {
    const R = ra(); R.headscale = R.headscale || {};
    PM51.panel({ title: 'Headscale one-time key', subtitle: 'Registers this server with your own Headscale', icon: 'key',
      body: PM51.panelSection('Key', PM51.field('Key', '<input class="text-control o55-keyinput" type="password" autocomplete="off" placeholder="Paste it here" aria-label="Key"/>', 'Used once to join. Kept in the keychain, never shown again or copied into settings.')),
      primaryLabel: 'Save key', onPrimary: w => { if (!w.querySelector('.o55-keyinput')?.value.trim()) { PM51.toast('Paste the key first', 'Your Headscale administrator gives you one.', 'info'); return false; } R.headscale.keySaved = true; refresh(); PM51.toast('Key saved', 'Example only: nothing was stored or sent in this preview.', 'info'); } });
  });
  PM51.onChange('servers-conflict-set', el => { const S = sp(); S.conflicts.policy = el.value; if (state.projectSync) state.projectSync.conflictPolicy = el.value; saveState(); PM51.toast('Saved', `When both sides changed: ${el.value}.`); });
  PM51.on('servers-ssh-import', () => moveWizard('import'));
  PM51.on('servers-w-task', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.task = ds(el, 'task'); w.draft.hist = w.draft.task === 'move' ? 'keep30' : 'with'; w.draft.checked = false; w.next(); });
  PM51.on('servers-w-item', el => { const w = PM51.wizardOf(el); if (!w) return; const k = ds(el, 'item'), S = new Set(w.draft.items); S.has(k) ? S.delete(k) : S.add(k); w.draft.items = [...S]; const on = S.has(k); el.classList.toggle('is-on', on); el.setAttribute('aria-checked', String(on)); w.draft.checked = false; });
  PM51.on('servers-w-from', el => { const w = PM51.wizardOf(el); if (!w) return; moveCollect(el.closest('.drawer-wrap'), w.draft); w.draft.from = ds(el, 'from'); const f = sshRemotes()[Number(w.draft.from)]; if (f && !w.draft.folder) { w.draft.folder = f.folder || ''; const x = el.closest('.o55g-main').querySelector('.o55-mv-folder'); if (x) x.value = w.draft.folder; } w.draft.checked = false; });
  PM51.on('servers-w-dest', el => { const w = PM51.wizardOf(el); if (!w) return; moveCollect(el.closest('.drawer-wrap'), w.draft); const was = w.draft.dest; w.draft.dest = ds(el, 'dest'); w.draft.checked = false; if (w.draft.dest === 'other' || was === 'other') redraw(w); });
  PM51.on('servers-w-hist', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.hist = ds(el, 'hist'); w.next(); });
  PM51.on('servers-away-new', () => awayWizard());
  PM51.on('servers-w-way', el => { const w = PM51.wizardOf(el); if (!w) return; if (w.draft.kind !== ds(el, 'kind')) { w.draft.checked = false; w.draft.signedIn = false; } w.draft.kind = ds(el, 'kind'); w.next(); });
  PM51.on('servers-w-flavor', el => { const w = PM51.wizardOf(el); if (!w) return; awayCollect(el.closest('.drawer-wrap'), w.draft); w.draft.flavor = ds(el, 'value'); w.draft.signedIn = false; w.draft.checked = false; redraw(w); });
  PM51.on('servers-w-aflag', el => { const w = PM51.wizardOf(el); if (!w) return; const k = ds(el, 'key'); w.draft[k] = !w.draft[k]; el.classList.toggle('on', !!w.draft[k]); el.setAttribute('aria-checked', String(!!w.draft[k])); });
  PM51.on('servers-w-signin', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.signedIn = true; w.go(w.step()); PM51.toast(w.draft.flavor === 'headscale' ? 'Registered' : 'Signed in', 'Example only: no sign-in window opened in this preview.', 'info'); });
  PM51.on('servers-w-link', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.link = `pm-link://${homeServer().id}-${newCode().toLowerCase()}`; w.go(w.step()); });
  PM51.on('servers-route-redo', el => { const r = routeById(ds(el, 'id')); if (!r) return; closeOverlay(); awayWizard(r.kind); });
  PM51.on('servers-route-remove', el => { const r = routeById(ds(el, 'id')); if (r) removeRoute(r); });
  function removeRoute(r) {
    const R = ra(); if (!r || r.locked) return;
    PM51.confirm(`Remove ${r.name}?`, 'Your devices stop using it away from home. Nothing on your router, VPN or accounts is changed.', 'Remove', () => {
      r.status = 'not-set-up'; r.enabled = false; r.lastCheck = 'Never';
      if (r.kind === 'vpn') R.vpn = null; if (r.kind === 'domain') { R.domain = null; if (R.funnel) R.funnel.enabled = false; } if (r.kind === 'remote-link') R.remoteLink = null; if (r.kind === 'tailscale') R.headscale = null;
      if (R.actual === r.id) R.actual = 'lan';
      closeOverlay(); refresh(); PM51.toast(`${r.name} removed`, 'Set it up again any time.', 'info');
    }, true);
  }
  /* The key list and each server's sign-in are inventory rows drawn here: search and Details land on the Servers tab,
     and Details lists how each server signs in. */
  PM51.owner(ID, id => { if (id === KEYS || id === 'code.execution.server-sign-in') PM51.setTab(ID, 'servers'); });
  PM51.perValues('code.execution.server-sign-in', () => (sp().servers || []).map(srv => ({ name: srv.name, value: signInText(srv) })));
})();
