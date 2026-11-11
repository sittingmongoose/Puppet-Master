/* Settings managers, rethought (Fable 5.2): the chapter "Computers & remote access".
   Today this is System › Server & Project Location (five tabs), with related rows on App & Input, Containers and
   elsewhere. Here it is a chapter of its own. Its pages answer the questions a newcomer has, one each: what do I have,
   which devices can use it, how do I get in from outside, which computer does the work, where is my project kept.
   Every button calls PMConcept7's own action, so the guided flows, side panels and checks are the ones it has today. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h;
  const kit = () => W.PM51;
  const SRV = { domain: 'system', ws: 'servers', manager: 'servers' };

  /* ------------------------------------------------------------------ readers */
  const sp = (st) => d.sp(st);
  const sshList = (st) => {
    let v = SMX.val('code.execution.ssh-remotes');
    if (!Array.isArray(v) || !v.length) v = (sp(st).sshFolders || []).map((f) => { const [user, host] = String(f.address).includes('@') ? String(f.address).split('@') : ['', f.address]; return { name: f.name, address: host, user, folder: f.folder || '', auth: 'SSH key' }; });
    return (Array.isArray(v) ? v : []).map((x) => (typeof x === 'string' ? { name: x, address: x, user: '', folder: '' } : x));
  };
  const keyUses = (st, id) => {
    const real = d.sshKeyUses(st, id); if (real) return real;
    const out = [];
    sshList(st).forEach((f) => { if (f.keyId === id) out.push(f.name); });
    sp(st).servers.forEach((s) => { if (s.signIn && s.signIn.keyId === id) out.push(s.name); });
    (((st.sourceControl || {}).forges) || []).forEach((f) => { if (f.pushKeyId === id) out.push(`${f.name} (Git)`); });
    return out;
  };
  const tone = (state) => (/connected|ready|in use/i.test(state) ? 'ready' : /offline|unreach|fail/i.test(state) ? 'blocked' : 'attention');
  /* the identity PMConcept7 shows for a computer (its own formula, so the two agree) */
  const fingerprint = (s) => { let x = 0; for (const c of String(s.id + s.address)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return 'SHA256:' + x.toString(16).padStart(8, '0').toUpperCase() + '…' + (x * 7 >>> 0).toString(16).slice(0, 6).toUpperCase(); };
  const KIND_WORD = { lan: 'LAN', tailscale: 'private Tailscale', vpn: 'existing VPN', domain: 'custom domain/proxy', 'remote-link': 'Remote Link direct, then Remote Link relay' };
  const roleLine = (st, s) => {
    const S = sp(st); const bits = [];
    if (s.id === S.homeServer) bits.push('Keeps your projects');
    if (s.role === 'This computer') bits.push('This computer');
    if (s.runsWork !== false) bits.push(s.id === S.homeServer ? 'does the work' : 'can do the work');
    return bits.join(' · ') || s.role;
  };
  const awayWord = (st) => { const r = d.routeAway(st); return r ? `through ${r.name}` : 'isn’t set up yet'; };
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ the picture of the setup */
  function map(st) {
    const S = sp(st); const home = d.homeServer(st); const here = d.thisComputer(st);
    const now = d.routeNow(st); const away = d.routeAway(st);
    const others = S.devices.filter((x) => !here || x.name !== here.name).map((x) => x.name).concat(sshList(st).map((x) => `${x.name} (over SSH)`));
    const node = (cls, icon, name, role, status, go, extra) => `<button type="button" class="smx-map-node ${cls}" data-smx-go="${h(go)}"><span class="smx-map-icon">${SMX.icon(icon)}</span><span class="smx-map-name">${h(name)}</span><span class="smx-map-role">${h(role)}</span>${status ? `<span class="smx-map-status">${status}</span>` : ''}${extra || ''}</button>`;
    const link = (t, how) => `<div class="smx-map-link tone-${t}" aria-hidden="true"><span class="smx-map-line"></span><span class="smx-map-how">${h(how)}</span><span class="smx-map-line"></span></div>`;
    return `<section class="smx-map" aria-label="A picture of your setup">
      ${node('is-here', 'laptop', here ? here.name : 'This device', 'You are here', ui.status('Connected', 'ready'), 'computers/devices')}
      ${link('ready', now ? now.name : 'Local network')}
      ${node('is-home', 'nas', home ? home.name : 'No Server yet', 'Keeps your projects and does the work', home ? ui.status(home.state, tone(home.state)) : '', home ? `computers/list/${encodeURIComponent(home.id)}` : 'computers/list')}
      ${link(away ? 'ready' : 'off', away ? away.name : 'Not set up')}
      ${node('is-away', 'globe', 'Away from home', away ? 'Your devices get in from anywhere' : 'Reach it from anywhere', away ? ui.status('Ready', 'ready') : ui.status('Not set up', 'off'), 'computers/away')}
    </section>${others.length ? `<p class="smx-map-also">Also connected: ${others.map(h).join(' · ')}</p>` : ''}`;
  }

  /* ------------------------------------------------------------------ Overview */
  SMX.page({
    id: 'computers', chapter: 'computers', icon: 'computer', noPagesList: true,
    title: 'Computers & remote access',
    purpose: 'Where your projects are kept, which computers do the work, which devices can use Puppet Master, and how you get in when you are out.',
    legacy: [['system', 'servers', 'home', 'servers']],
    keywords: ['server', 'servers', 'nas', 'home server', 'device', 'devices', 'remote', 'ssh', 'computer'],
    lead: (ctx) => {
      const st = ctx.st, S = sp(st), home = d.homeServer(st);
      const upd = S.servers.filter((s) => s.updateReady);
      const down = S.servers.filter((s) => !/connected/i.test(s.state));
      return [
        { key: 'summary', html: ui.summary({ icon: 'computer', tone: down.length ? 'attention' : 'ready', lines: [
          `Your projects are kept on ${ui.word(home ? home.name : 'no computer yet', { go: 'computers/projects' })}, and work runs ${ui.word(S.executionHost === 'Automatic' ? 'wherever is best' : 'on ' + d.runLabel(st), { go: 'computers/work' })}.`,
          `${ui.word(d.plural(S.devices.length, 'device'), { go: 'computers/devices' })} can use Puppet Master. Away from home ${ui.word(awayWord(st), { go: 'computers/away' })}.`
        ], side: ui.btn({ label: 'Check everything', icon: 'test', action: 'pm51-servers-diagnostics', data: { scope: 'home' } }) }) },
        { key: 'map', html: map(st) },
        { key: 'needs', html: ui.needs([
          ...down.map((s) => ({ tone: 'blocked', title: `${s.name} is not answering`, detail: 'Work that needs it waits until it is back.', fix: { label: 'Check it', action: 'pm51-servers-test', data: { id: s.id } } })),
          ...S.pending.map((p) => ({ title: `${p.name} is asking to join`, detail: 'Approve it only if this is your device.', fix: { label: 'Review', go: 'computers/devices' } })),
          ...upd.map((s) => ({ tone: 'info', title: `${s.name} has an update ready`, detail: `It runs version ${s.version}.`, fix: { label: 'See the update', go: 'system/updates' } }))
        ]) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'phone', title: 'Use it on another device', sub: 'Pair a phone, a tablet or another computer', action: 'pm51-servers-pair' },
          { icon: 'globe', title: 'Reach it away from home', sub: d.routeAway(st) ? 'Add or change a way in' : 'Set up a private way in', action: 'pm51-servers-away-new' },
          { icon: 'nas', title: 'Add a computer', sub: 'A NAS, a spare PC or a cloud computer to do the work', action: 'pm51-servers-add' },
          { icon: 'swap', title: 'Move or copy a project', sub: 'To another computer, or bring one in', go: 'computers/projects', anchor: 'move' }
        ], { title: 'What do you want to do?' }) },
        { key: 'pages', html: ui.pages('computers', ctx, { title: 'Everything in this chapter' }) },
        { key: 'links', html: ui.links([{ label: 'How computers and devices work', action: 'pm51-servers-help' }, { label: 'Run a full checkup', go: 'system/health' }]) }
      ];
    },
    changes: [
      { was: 'Servers, devices, remote access and project location are one page of five tabs inside “System”, the last chapter. It opens on two dropdowns, “Home server” and “Runs on”.', now: 'They are a chapter of their own, second in the list. It opens on two sentences that say what is set up, a picture of it, and the four things people come here to do.' },
      { was: 'The same machine is listed twice: “Windows Workstation” is a server on the Servers tab (“This computer”) and a device on the Devices tab (“Client + runs work”), with nothing saying they are the same thing.', now: 'One picture shows where you are, where the projects live and how the two connect; the lists underneath use one name for one machine.' },
      { was: '“Away from home” is shown as a status row on Home & Location, again on the Away From Home tab, and the same three links (“Check server and devices”, “Open Readiness & Doctor”, “How servers and devices work”) repeat under all five tabs.', now: 'Each fact appears once. “Check everything” and the two help links appear once, here.' },
      { was: 'Updates for a server, the pairing code that expired and devices waiting to join are reported in other managers (App Updates, Doctor).', now: 'Anything about your computers that needs you is listed here, each with one button.' }
    ]
  });

  /* ------------------------------------------------------------------ Computers */
  const computerThings = (st) => {
    const S = sp(st);
    return [
      ...S.servers.map((s) => ({ icon: s.role === 'This computer' ? 'laptop' : 'nas', name: s.name, tag: s.id === S.homeServer ? 'Your Server' : '', sub: roleLine(st, s), sub2: `${s.address}${s.updateReady ? ' · an update is ready' : ''}`, status: { text: s.state, tone: tone(s.state) }, go: `computers/list/${encodeURIComponent(s.id)}` })),
      ...sshList(st).map((f, i) => ({ icon: 'terminal', name: f.name, tag: 'Over SSH', sub: `${f.user ? f.user + '@' : ''}${f.address}${f.folder ? ' · ' + f.folder : ''}`, status: { text: 'Ready', tone: 'ready' }, go: `computers/list/ssh-${i}` }))
    ];
  };
  const keysCard = (st) => {
    const keys = d.sshKeys(st);
    return ui.things({ title: 'Keys these computers sign in with', help: 'A key lets Puppet Master sign in to a computer or a code service without a password. Only the public half is ever read.', add: { label: 'Add a key', action: 'pm51-servers-key-add' },
      items: keys.map((k) => { const uses = keyUses(st, k.id); return { icon: 'key', name: k.name, tag: k.old ? 'Older kind' : '', sub: `${k.type} · ${k.where} on ${k.on}`, sub2: uses.length ? `Used by ${uses.join(', ')}` : 'Not used anywhere yet', side: ui.btn({ label: 'Copy public key', icon: 'copy', action: 'pm51-servers-copy-text', data: { text: k.public, what: 'Public key' } }) + ui.btn({ icon: 'more', label2: `More for ${k.name}`, do: 'computers-key-more', data: { key: k.name }, ghost: true }) }; }),
      empty: { icon: 'key', title: 'No keys yet', text: 'You only need one when a computer or a code service asks for an SSH key. The guided steps make one for you.' } });
  };
  SMX.lends('computers-key-more', (el) => (Object.assign({}, SRV, { tab: 'servers', find: (b) => [...b.querySelectorAll('button[aria-label]')].find((x) => x.getAttribute('aria-label') === `More for ${el.getAttribute('data-key')}`) })));
  SMX.page({
    id: 'computers/list', chapter: 'computers', nav: 'Computers', icon: 'nas',
    title: 'Computers',
    purpose: 'The computers that keep your projects or do the work. One of them is your Server: it stays on and holds everything.',
    blurb: (ctx) => { const n = computerThings(ctx.st).length; return `${d.plural(n, 'computer')} · add a NAS, a spare PC, a cloud computer or one you reach over SSH`; },
    status: (ctx) => { const bad = sp(ctx.st).servers.filter((s) => !/connected/i.test(s.state)).length; return bad ? { text: `${bad} not answering`, tone: 'blocked' } : { text: 'All connected', tone: 'ready' }; },
    legacy: [['system', 'servers', 'servers', 'servers']],
    keywords: ['server', 'ssh', 'nas', 'add server', 'claim'],
    lead: (ctx) => [
      { key: 'things', html: ui.things({ title: 'Your computers', items: computerThings(ctx.st), add: { label: 'Add a computer', action: 'pm51-servers-add' } }) },
      { key: 'ssh', html: ui.links([{ label: 'Add a computer you reach over SSH instead', action: 'pm51-servers-ssh-add' }, { label: 'Check every computer', action: 'pm51-servers-diagnostics', data: { scope: 'servers' } }]) }
    ],
    sections: [{ key: 'tools', title: 'Getting a computer ready', help: 'What Puppet Master may install on a computer that is about to do work.', ids: ['system.health.capability-provisioning'] }],
    more: [{ key: 'keys', html: (ctx) => keysCard(ctx.st), count: 0 }],
    moreLabel: 'Sign-in keys', moreHelp: 'For computers and code services that ask for an SSH key',
    expert: [{ key: 'topology', html: (ctx) => { const S = sp(ctx.st); return ui.card({ title: 'Counts', body: ui.facts([['Computers running Puppet Master', S.servers.length], ['Computers reached over SSH', sshList(ctx.st).length], ['Paired devices', S.devices.length], ['Ways in that are ready', d.routes(ctx.st).filter((r) => r.status === 'active' || r.status === 'ready').length]]) }); } }],
    covers: { 'code.execution.server-sign-in': 'On each computer’s own page: “Signs in with”.', 'code.execution.ssh-remotes': 'The computers tagged “Over SSH” in the list.', 'code.execution.ssh-keys': 'Sign-in keys, under this page’s fold.' },
    changes: [
      { was: 'The Servers tab is a list beside a detail pane, with SSH computers, SSH keys and a tools policy stacked underneath. “Add a server” appears three times (“Add a server”, “Set up a new server”, “Add another server”) and “Test connection” twice (“Test connection”, “Check this server”).', now: 'One list of every computer, whether it runs Puppet Master or is reached over SSH. One “Add a computer”. Opening a computer shows everything about that one computer.' },
      { was: 'SSH keys sit on the Servers tab although Git services use the same keys; Source Control has its own “SSH key Git uses” row.', now: 'Keys are folded under “Sign-in keys” here, their one home; each key says everything that uses it, and Source control links to this place.' },
      { was: 'Jargon on the first screen: “Claim and bootstrap”, “Topology diagnostics”, “Deployment”, identity fingerprints.', now: 'Those facts are kept, on the computer’s own page under “For experts”.' }
    ]
  });

  SMX.lends('computers-move-more', (el) => Object.assign({}, SRV, { tab: 'move', find: (b) => [...b.querySelectorAll('.pm51-item button[aria-label^="More for "]')][Number(el.getAttribute('data-n')) || 0] || null }));

  /* ------------------------------------------------------------------ one computer */
  SMX.lends('computers-server-more', (el) => (Object.assign({}, SRV, { tab: 'servers', select: { action: 'pm51-select', data: { manager: 'servers', id: el.getAttribute('data-id') } }, find: (b) => [...b.querySelectorAll('.pm51-detail button, .manager-detail button, button')].find((x) => /^More actions$/.test((x.getAttribute('aria-label') || x.textContent || '').trim())) })));
  SMX.lends('computers-ssh-more', (el) => (Object.assign({}, SRV, { tab: 'servers', find: (b) => [...b.querySelectorAll('button[aria-label]')].find((x) => x.getAttribute('aria-label') === `More for ${el.getAttribute('data-name')}`) })));
  SMX.lends('computers-ssh-test', (el) => (Object.assign({}, SRV, { tab: 'servers', mode: 'click', find: (b) => { const items = [...b.querySelectorAll('.pm51-item')].filter((x) => x.textContent.includes(el.getAttribute('data-name'))); for (const it of items) { const t = [...it.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Test'); if (t) return t; } return null; } })));
  SMX.page({
    id: 'computers/list/:id', chapter: 'computers', parent: 'computers/list',
    title: (ctx) => { const o = one(ctx); return o ? o.name : 'Computer'; },
    nav: (ctx) => { const o = one(ctx); return o ? o.name : 'Computer'; },
    purpose: (ctx) => { const o = one(ctx); if (!o) return ''; return o.ssh ? 'A computer Puppet Master reaches over SSH. It can hold project folders and do work.' : roleLine(ctx.st, o.s) + '.'; },
    legacy: [['system', 'servers', 'servers', 'servers']],
    headSide: (ctx) => { const o = one(ctx); if (!o) return ''; return o.ssh ? ui.btn({ label: 'Test', icon: 'test', do: 'computers-ssh-test', data: { name: o.name } }) + ui.btn({ icon: 'more', label2: `More for ${o.name}`, do: 'computers-ssh-more', data: { name: o.name } }) : ui.btn({ label: 'Open its web page', icon: 'external', action: 'pm51-servers-webui', data: { id: o.s.id } }) + ui.btn({ icon: 'more', label2: 'More actions', do: 'computers-server-more', data: { id: o.s.id } }); },
    lead: (ctx) => {
      const o = one(ctx); const st = ctx.st, S = sp(st);
      if (!o) return [{ key: 'gone', html: ui.card({ title: 'This computer is no longer in the list', body: ui.btn({ label: 'Back to Computers', go: 'computers/list' }) }) }];
      if (o.ssh) {
        const f = o.f; const key = d.sshKeys(ctx.st).find((k) => k.id === f.keyId);
        return [{ key: 'facts', html: ui.card({ title: 'About this computer', body: ui.rows([
          { label: 'Address', value: `${f.user ? f.user + '@' : ''}${f.address}` },
          { label: 'Folder for projects', value: f.folder || 'Not chosen' },
          { label: 'Signs in with', value: key ? key.name : (f.auth || 'SSH key'), help: 'The key that lets Puppet Master in without a password.' }
        ]) }) },
        { key: 'use', html: ui.tasks([{ icon: 'download', title: 'Bring in a project from this computer', sub: 'A folder there becomes a project here', action: 'pm51-servers-ssh-import' }], { title: 'Use it' }) }];
      }
      const s = o.s; const isHome = s.id === S.homeServer;
      return [
        { key: 'status', html: ui.summary({ icon: s.role === 'This computer' ? 'laptop' : 'nas', tone: tone(s.state), lines: [`${ui.b(s.name)} is ${h(String(s.state).toLowerCase())}${isHome ? ' and keeps your projects' : ''}.`, `Last checked ${h(String(s.lastCheck).toLowerCase())}.`], side: ui.btn({ label: 'Test the connection', icon: 'test', action: 'pm51-servers-test', data: { id: s.id } }) }) },
        { key: 'needs', html: ui.needs(s.updateReady ? [{ tone: 'info', title: 'An update is ready for this computer', detail: `It runs version ${s.version}.`, fix: { label: 'See the update', go: 'system/updates' } }] : []) },
        // a computer that answers but is not yours yet: PMConcept7's own four steps, with its own actions
        { key: 'claim', html: s.claimed === false ? (() => { const cs = s.claimSteps || {}; let steps = ''; try { steps = kit().steps([
          { title: 'Found', desc: `${s.address} answered`, done: true },
          { title: 'Check it is the right one', desc: cs.identity ? `The two fingerprints match · ${fingerprint(s)}` : 'Compare the fingerprint shown on that computer with the one here.', done: !!cs.identity, action: cs.identity ? null : { label: 'Compare fingerprints', action: 'pm51-servers-claim-identity', data: { id: s.id } } },
          { title: 'Make it yours', desc: cs.claim ? 'It belongs to your account' : 'Ties the computer to your account, so your devices can use it.', done: !!cs.claim, action: cs.claim ? null : { label: 'Make it mine', primary: true, action: 'pm51-servers-claim', data: { id: s.id, 'command-id': 'cmd.server.claim' }, disabled: !cs.identity, reason: 'Check the fingerprint first.' } },
          { title: 'Pair your devices', desc: 'Let your other devices reach this computer.', action: { label: 'Pair a device', action: 'pm51-servers-pair', disabled: !cs.claim, reason: 'Make the computer yours first.' } }
        ]); } catch (e) { steps = ''; } return ui.card({ title: 'This computer is not yours yet', help: 'It answered, but nobody owns it. Four short steps make it yours.', body: steps }); })() : '' },
        { key: 'does', html: ui.card({ title: 'What it does', body: ui.rows([
          { label: 'Keeps your projects', help: isHome ? 'This is your Server. To change that, move the project.' : 'Your projects are kept on another computer.', control: ui.status(isHome ? 'Yes' : 'No', isHome ? 'ready' : 'off') + ui.btn({ label: isHome ? 'Move the project…' : 'Where projects are kept', go: 'computers/projects' }) },
          { label: 'Does the work', help: 'Lets the assistant build, test and run things on this computer.', control: toggle(s.runsWork !== false, { action: 'pm51-servers-runs', data: { id: s.id }, label: 'Does the work' }) },
          { label: 'New projects start here', help: 'A new project is kept on this computer unless you choose another.', control: toggle(!!s.default, { action: 'pm51-servers-default', data: { id: s.id }, label: 'New projects start here' }) }
        ]) }) },
        { key: 'signin', html: ui.card({ title: 'Getting in', body: ui.rows([
          { label: 'Address', value: s.address },
          { label: 'Signs in with', covers: 'code.execution.server-sign-in', value: s.signIn && s.signIn.keyId ? (d.sshKeys(ctx.st).find((k) => k.id === s.signIn.keyId) || {}).name || 'A key' : 'Paired with Puppet Master; no key needed', control: s.role === 'This computer' ? '' : ui.btn({ label: 'Attach a key', icon: 'key', action: 'pm51-servers-attach-key', data: { id: s.id } }) },
          { label: 'Version', value: s.version, status: s.updateReady ? ui.status('Update ready', 'attention') : '' }
        ]) }) }
      ];
    },
    expert: [{ key: 'tech', html: (ctx) => { const o = one(ctx); if (!o || o.ssh) return ''; const s = o.s; const mine = s.claimed !== false; return ui.card({ title: 'How it was set up', body: ui.facts([['Set up as', s.deployment || 'Unknown'], ['Image', /container/i.test(s.deployment || '') ? 'puppetmaster/server:0.8.0' : 'Not a container'], ['Environments', (s.environments || []).join(' · ') || 'None reported'], ['Yours since', mine ? 'Claimed · identity confirmed' : 'Not claimed yet'], ['Identity', fingerprint(s)], ['Trust', mine ? 'Owner' : 'None until claimed'], ['How it got here', s.role === 'This computer' ? 'Installed with the app' : 'Claimed from an existing install']]) + ui.links([{ label: 'Back up this whole computer', go: 'keeping', anchor: 'server' }, { label: 'Set up another computer like this one', action: 'pm51-servers-add' }]) }); }, count: 0 }],
    changes: [
      { was: 'A server’s details share the tab with the list, the SSH computers, the keys and a tools policy; “Runs work” and “Default for new workspaces” are two unexplained switches.', now: 'A computer has its own page: what it does (keeps projects, does the work, takes new projects), how it signs in, and its facts. Each switch says what it changes.' },
      { was: '“Claim this server” is a button that is always disabled once the server is yours (“This server is already yours”), next to the fingerprint under “Claim and bootstrap”.', now: 'A computer that is not yours yet opens with the four steps that make it yours (the same actions). Once it is yours the page just says so, and keeps the fingerprint under “For experts”.' }
    ]
  });
  function one(ctx) {
    const id = (ctx.params || {}).id || '', st = ctx.st;
    if (/^ssh-\d+$/.test(id)) { const f = sshList(st)[Number(id.slice(4))]; return f ? { ssh: true, f, name: f.name } : null; }
    const s = sp(st).servers.find((x) => x.id === id); return s ? { s, name: s.name } : null;
  }

  /* ------------------------------------------------------------------ Paired devices */
  SMX.page({
    id: 'computers/devices', chapter: 'computers', nav: 'Paired devices', icon: 'phone',
    title: 'Paired devices',
    purpose: 'The phones, tablets, computers and browsers that may open your Puppet Master. A device gets in only after you approve it once.',
    blurb: (ctx) => { const S = sp(ctx.st); return `${d.plural(S.devices.length, 'device')} can open Puppet Master${S.pending.length ? ` · ${S.pending.length} waiting to join` : ''}`; },
    status: (ctx) => { const S = sp(ctx.st); return S.pending.length ? { text: `${S.pending.length} waiting`, tone: 'attention' } : { text: `${S.devices.filter((x) => /connected/i.test(x.state)).length} connected`, tone: 'ready' }; },
    legacy: [['system', 'servers', 'devices', 'servers']],
    keywords: ['pair', 'phone', 'tablet', 'browser', 'revoke', 'pairing code'],
    lead: (ctx) => {
      const st = ctx.st, S = sp(st);
      const icon = (p) => (/web|browser/i.test(p) ? 'browser' : /ios|android|phone/i.test(p) ? 'phone' : 'laptop');
      return [
        { key: 'pending', html: S.pending.length ? ui.card({ title: 'Waiting to join', help: 'Approve a device only if it is yours and it shows the same words as your Server.', body: `<div class="smx-things">${S.pending.map((p) => `<div class="smx-thing"><span class="smx-thing-avatar">${SMX.icon(icon(p.platform || ''))}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(p.name)}</span><span class="smx-thing-sub">${h(p.platform || '')}</span></span><span class="smx-thing-end">${ui.btn({ label: 'Approve', primary: true, action: 'pm51-servers-approve', data: { id: p.id } })}${ui.btn({ label: 'Turn down', action: 'pm51-servers-reject', data: { id: p.id } })}</span></div>`).join('')}</div>` }) : '' },
        { key: 'devices', html: ui.things({ title: 'Devices that can open Puppet Master', add: { label: 'Pair a device', action: 'pm51-servers-pair' },
          items: S.devices.map((x) => ({ icon: icon(x.platform), name: x.name, tag: x.trust === 'Owner' ? 'Can change everything' : 'Can use it', sub: `${x.platform}${/runs work/i.test(x.role) ? ' · can also do work' : ''}`, sub2: `Last seen ${String(x.lastSeen).toLowerCase()}`, status: { text: x.state, tone: tone(x.state) }, action: 'pm51-servers-device', data: { id: x.id } })),
          empty: { icon: 'phone', title: 'No device is paired', text: 'Pair this one first; then the others can be approved from it.', fix: { label: 'Pair a device', action: 'pm51-servers-pair' } } }) },
        { key: 'nopending', html: S.pending.length ? '' : `<p class="smx-quiet-line">No device is waiting to join. A request shows up here when a device enters your pairing code.</p>` },
        { key: 'carry', html: ui.card({ title: 'Carry on where you left off', help: 'When you pick up another device, these come with you.', body: ui.rows(Object.entries(S.continuity || {}).map(([k, v]) => ({ label: k, help: CONT_HELP[k] || '', control: toggle(!!v, { action: 'pm51-servers-cont', data: { key: k }, label: k }) }))) }) }
      ];
    },
    more: [
      { key: 'roles', html: (ctx) => { const S = sp(ctx.st); return ui.card({ title: 'Who can do what', help: 'Change a device’s level by opening it in the list above.', body: ui.facts([['Can change everything (Owner)', 'Change computers, pair and remove devices, restore backups.'], ['Can use it (Member)', 'Open projects and run work.'], ...S.devices.map((x) => [x.name, x.trust === 'Owner' ? 'Can change everything' : 'Can use it'])]) }); } },
      { key: 'pairing', html: (ctx) => { const S = sp(ctx.st); return ui.card({ title: 'Pairing code', help: 'A short code a new device types in. It stops working after ten minutes.', side: ui.btn({ label: 'Show the code', action: 'pm51-servers-pair' }), body: ui.facts([['Current code', S.pairing && S.pairing.code ? `Stops working in ${S.pairing.expiresIn}` : 'None; pairing makes a new one'], ['Codes made so far', String((S.pairing && S.pairing.issued) || 4)], ['Last device paired', (S.devices[S.devices.length - 1] || {}).name || 'None']]) + ui.links([{ label: 'Check the Server and the paired devices', action: 'pm51-servers-diagnostics', data: { scope: 'devices' } }]) }); } }
    ],
    moreLabel: 'Access levels and the pairing code',
    expert: [{ key: 'danger', html: () => ui.card({ title: 'Start over with devices', help: 'Removes every device at once, this one included. Each must pair again with a new code.', body: ui.btn({ label: 'Remove every device…', danger: true, action: 'pm51-servers-revoke-all' }) }) }],
    expertLabel: 'Remove every device', expertHelp: 'For when a device is lost and you want a clean start',
    changes: [
      { was: 'Devices are a tab of “Server & Project Location”. A device’s access level is named “Trust roles” and is read-only text under More options; “Pending requests” takes a third of the page while empty.', now: 'Each device says in words what it may do. Waiting devices appear at the top only when there are any, with Approve and Turn down on the row.' },
      { was: '“Continue on another device” is five bare switches (Goals, Chats, Terminals, Unsaved editors, Debug sessions).', now: 'The same five switches, each with a line saying what comes with you.' },
      { was: '“Revoke all devices” sits in a “Danger zone” beside pairing statistics.', now: 'It is folded away on its own, worded as what it does: “Remove every device”.' }
    ]
  });
  const CONT_HELP = { Goals: 'Long-running work shows up on the next device and keeps going.', Chats: 'Your conversations, right where you stopped.', Terminals: 'Running terminals reattach on the next device.', 'Unsaved editors': 'Edits you had not saved yet.', 'Debug sessions': 'A paused debugger picks up on the next device.' };

  /* ------------------------------------------------------------------ Away from home */
  const routeWord = (r) => (d.ROUTE_STATUS[r.status] || d.ROUTE_STATUS['not-set-up']);
  const ROUTE_PLAIN = {
    lan: ['home', 'Local network', 'At home: your devices reach your Server directly, over your own network. Always tried first.'],
    tailscale: ['network', 'Tailscale', 'Built into Puppet Master. A private network between your devices: sign in once, and nothing is opened to the internet.'],
    vpn: ['shield', 'A VPN I already use', 'WireGuard, OpenVPN or another VPN you run. Puppet Master only uses it.'],
    domain: ['browser', 'My own web address', 'An address like pm.example.com. Needs a domain name and changes on your router.'],
    'remote-link': ['link', 'Puppet Master Remote Link', 'No account and no domain. A link you paste on the other device.']
  };
  SMX.page({
    id: 'computers/away', chapter: 'computers', nav: 'Away from home', icon: 'globe',
    title: 'Away from home',
    purpose: 'How your devices reach your Puppet Master when you are not on your home network. You only need one way in.',
    blurb: (ctx) => { const r = d.routeAway(ctx.st); return r ? `Your devices get in through ${r.name}` : 'Not set up yet: pick one way in and follow the steps'; },
    status: (ctx) => { const r = d.routeAway(ctx.st); return r ? { text: 'Ready', tone: 'ready' } : { text: 'Not set up', tone: 'off' }; },
    legacy: [['system', 'servers', 'away', 'servers']],
    keywords: ['remote', 'tailscale', 'vpn', 'domain', 'remote link', 'public', 'funnel', 'headscale', 'internet'],
    lead: (ctx) => {
      const st = ctx.st, R = sp(st).remoteAccess, routes = d.routes(st), now = d.routeNow(st), away = d.routeAway(st);
      const custom = R.order === 'custom';
      const row = (r, i) => {
        const [icon, name, text] = ROUTE_PLAIN[r.kind] || ['link', r.name, r.description];
        const [word, t] = routeWord(r);
        const setUp = r.status !== 'not-set-up' && r.status !== 'needs-sign-in';
        const first = i === 0 || routes[i - 1].locked, last = i === routes.length - 1;
        const arrows = r.locked ? '' : `<span class="smx-order">${ui.btn({ icon: 'up', label2: `Try ${name} earlier`, action: 'pm51-servers-route-move', data: { id: r.id, dir: 'up' }, ghost: true, disabled: first, reason: 'Local network is always tried first.' })}${ui.btn({ icon: 'down', label2: `Try ${name} later`, action: 'pm51-servers-route-move', data: { id: r.id, dir: 'down' }, ghost: true, disabled: last, reason: 'It is already last.' })}</span>`;
        // once a way in is set up: a switch to skip it without removing it, and a check that it still works
        const use = setUp && !r.locked ? `<span class="smx-route-use">${toggle(!!r.enabled, { action: 'pm51-servers-route-toggle', data: { id: r.id }, label: `Use ${name} when away` })}<span>${r.enabled ? 'In use' : 'Skipped'}</span></span>` : '';
        const check = ['ready', 'needs-attention', 'offline', 'testing'].includes(r.status) ? ui.btn({ label: r.status === 'testing' ? 'Checking…' : 'Check', icon: 'test', action: 'pm51-servers-route-check', data: { id: r.id }, disabled: r.status === 'testing', reason: 'A check is already running.' }) : '';
        return `<div class="smx-thing smx-route"><span class="smx-route-n">${r.locked ? SMX.icon('lock') : i + 1}</span><span class="smx-thing-avatar">${SMX.icon(icon)}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(name)}${r.recommended ? ' <span class="smx-thing-tag">Recommended</span>' : ''}</span><span class="smx-thing-sub">${h(text)}</span></span><span class="smx-thing-end">${ui.status(word, t)}${use}${arrows}${check}${ui.btn({ label: r.kind === 'lan' || setUp ? 'Manage' : 'Set up', primary: !setUp && r.recommended && !away, action: 'pm51-servers-remote', data: { id: r.id } })}</span></div>`;
      };
      return [
        { key: 'summary', html: ui.summary({ icon: 'globe', tone: away ? 'ready' : 'info', lines: [
          away ? `Away from home, your devices get in through ${ui.b(away.name)}.` : 'Away from home isn’t set up yet. At home everything already works.',
          `Right now this device is connected through ${ui.b(now ? now.kind === 'lan' ? 'your home network' : now.name : 'your home network')}.`
        ], side: ui.btn({ label: away ? 'Add another way in' : 'Set up a way in', icon: 'plus', primary: !away, small: false, action: 'pm51-servers-away-new' }) }) },
        { key: 'routes', html: ui.card({ title: 'Ways in, in the order they are tried', help: 'Puppet Master tries the first one that is set up, then the next. Private ways come first. “Manage” opens a way in: its details, setting it up again, removing it.', side: custom ? ui.btn({ label: 'Put back the recommended order', action: 'pm51-servers-order-reset' }) : '<span class="smx-quiet-line">Recommended order</span>', body: `<div class="smx-things">${routes.map(row).join('')}</div>` }) },
        { key: 'check', html: ui.links([{ label: 'Check every way in', action: 'pm51-servers-diagnostics', data: { scope: 'away' } }]) }
      ];
    },
    more: [
      { key: 'public', html: (ctx) => { const R = sp(ctx.st).remoteAccess; const pub = !!(R.funnel && R.funnel.enabled); const hs = R.headscale || {}; const hsOn = !!String(hs.address || '').trim(); return ui.card({ title: 'Public internet', help: 'Lets anyone who has the address reach the sign-in page. A private way in is safer; turn this on only if you need a browser on a computer you cannot pair.', body: ui.rows([{ label: 'Anyone with the address can reach the sign-in page', help: pub ? 'On, through Tailscale Funnel.' : 'Off. Your Server cannot be reached from the open internet.', control: ui.status(pub ? 'On' : 'Off', pub ? 'attention' : 'off') + ui.btn({ label: pub ? 'Turn off' : 'Turn on…', danger: !pub, action: 'pm51-servers-public', disabled: !pub && hsOn, reason: 'Not available with your own Tailscale server.' }) }]) }); } },
      { key: 'headscale', html: (ctx) => { const hs = sp(ctx.st).remoteAccess.headscale || {}; let input = ''; try { input = kit().input(hs.address || '', { action: 'pm51-servers-headscale', placeholder: 'https://headscale.example.net', label: 'Headscale address' }); } catch (e) { input = ''; } return ui.card({ title: 'Your own Tailscale server (Headscale)', help: 'Only if you run the coordination server yourself. Leave empty to use Tailscale’s.', body: ui.rows([{ label: 'Its address', control: input }, { label: 'How devices register', control: select(hs.registration || 'Automatic', ['Automatic', 'Ask administrator', 'One-time key'], { action: 'pm51-servers-headscale-reg', label: 'Registration' }) }, hs.registration === 'One-time key' ? { label: 'One-time key', help: 'From your Headscale server. Kept in the keychain and never shown again.', control: ui.btn({ label: hs.keySaved ? 'Replace key' : 'Add key', icon: 'key', action: 'pm51-servers-headscale-key' }) } : null]) }); } }
    ],
    moreLabel: 'Public access and your own Tailscale server',
    expert: [{ key: 'tech', html: (ctx) => { const st = ctx.st, R = sp(st).remoteAccess, routes = d.routes(st), now = d.routeNow(st); return ui.card({ title: 'Technical details', body: ui.facts([['Order', routes.map((r) => r.id).join(' → ')], ['Order mode', R.order === 'custom' ? 'Custom: you changed the order' : 'Recommended: private and local first'], ['In use now', now ? `${now.id} · ${now.name}` : '—'], ['Public access', R.funnel && R.funnel.enabled ? 'On (Funnel)' : 'Off'], ['Proxy in front', R.domain && R.domain.name ? `${R.domain.proxy} at ${R.domain.name}` : 'None'], ['Kinds, in their fixed order', routes.map((r) => KIND_WORD[r.kind] || r.kind).join(' → ')], ['Connector identity', d.homeServer(st) ? fingerprint(d.homeServer(st)) : '—'], ...routes.map((r) => [r.name, `${r.status} · last checked ${String(r.lastCheck).toLowerCase()}`])]) }); } }],
    changes: [
      { was: 'The tab opens with two status rows that restate what the list below shows, then five routes with four different verbs on their buttons: Manage, Set Up, Connect, Configure.', now: 'One sentence says whether away-from-home works and how you are connected now. Every way in has the same button: “Set up” until it works, “Manage” after.' },
      { was: 'Each route is named for its technology (“Existing VPN”, “Custom domain”) and described with terms like “reverse proxy such as Caddy or NGINX”.', now: 'Each uses the name the guided setup already uses (“A VPN I already use”, “My own web address”) and says what it needs from you. The recommended one is marked and its button stands out until one way in works.' },
      { was: 'Two chevrons reorder a route, next to a third control; “Move Tailscale up” is disabled with no reason shown.', now: 'Two arrow buttons with their own labels (“Try earlier”, “Try later”); a disabled one says why.' },
      { was: 'Public browser access, which opens the server to the internet, is a row inside “More options” next to Headscale and a list of lifecycle names.', now: 'It is its own card, “Public internet” (the Plans’ label for it), with a plain warning, and its button is marked as risky. Lifecycle names moved to “For experts”.' }
    ]
  });

  /* ------------------------------------------------------------------ Where work runs */
  const LEVELS = [['prefer', 'Prefer'], ['normal', 'Normal'], ['less', 'Less often'], ['manual', 'Only when I choose it']];
  const PRESETS = [['balanced', 'Balanced'], ['fastest', 'Fastest'], ['keep-free', 'Keep my computer free']];
  const levelOf = (id) => (SMX.local.flags['level:' + id] || 'normal');
  const allowed = (id) => SMX.local.flags['allow:' + id] !== false;
  SMX.act('computers-level', (el) => { const sel = el.querySelector('select'); if (sel) SMX.local.flags['level:' + el.getAttribute('data-id')] = sel.value; });
  SMX.act('computers-preset', (el) => { const sel = el.querySelector('select'); if (sel) SMX.local.flags.preset = sel.value; });
  SMX.act('computers-default', (el) => { const sel = el.querySelector('select'); if (sel) SMX.local.flags.defaultComputer = sel.value; });
  SMX.act('computers-allow', (el) => { const id = el.getAttribute('data-id'); SMX.local.flags['allow:' + id] = !allowed(id); });
  SMX.act('computers-inuse', () => { SMX.local.flags.inUseOff = !SMX.local.flags.inUseOff; });
  SMX.act('computers-why', () => { SMX.local.flags.why = !SMX.local.flags.why; });
  const PRESET_HELP = { balanced: 'Weighs free processor and memory, free disk space, and how much work is already waiting.', fastest: 'Picks the computer that will finish soonest, even if someone is using it.', 'keep-free': 'Keeps work off the computer you are sitting at whenever another one can do it.' };
  SMX.page({
    id: 'computers/work', chapter: 'computers', nav: 'Where work runs', icon: 'play',
    title: 'Where work runs',
    purpose: 'Which computer does the work when the assistant builds, tests or runs something. On Auto, Puppet Master picks the best one each time and tells you why.',
    blurb: (ctx) => (sp(ctx.st).executionHost === 'Automatic' ? 'Auto: the best computer is picked each time' : `Chosen: always ${d.runLabel(ctx.st)}`),
    status: (ctx) => ({ text: sp(ctx.st).executionHost === 'Automatic' ? 'Auto' : 'Chosen by you', tone: 'ready' }),
    legacy: [['system', 'servers', 'home', 'servers']],
    keywords: ['runs on', 'execution', 'auto', 'automatic', 'which computer', 'why this computer', 'prefer', 'less often'],
    lead: (ctx) => {
      const st = ctx.st, S = sp(st), home = d.homeServer(st); const auto = S.executionHost === 'Automatic';
      const runners = [...S.servers.filter((s) => s.runsWork !== false).map((s) => ({ id: s.id, name: s.name, note: s.id === S.homeServer ? 'Keeps the project’s records' : s.role === 'This computer' ? 'You are using it now' : '', here: s.role === 'This computer' })), ...S.devices.filter((x) => /runs work/i.test(x.role) && !S.servers.some((s) => s.name === x.name)).map((x) => ({ id: 'device:' + x.id, name: x.name, note: 'A paired computer' }))];
      const preset = SMX.local.flags.preset || 'balanced'; const inUse = !SMX.local.flags.inUseOff;
      const pick = runners.find((r) => allowed(r.id) && levelOf(r.id) !== 'manual' && !(r.here && inUse)) || runners[0];
      const chosen = runners.find((r) => r.id === S.executionHost);
      const why = SMX.local.flags.why ? `<div class="smx-why">${ui.facts([[pick ? pick.name : '—', 'Chosen: it is answering, it has the project’s files, it has the most free memory, and nothing is waiting on it.'], ...runners.filter((r) => !pick || r.id !== pick.id).map((r) => [r.name, !allowed(r.id) ? 'Left out: this project may not use it.' : levelOf(r.id) === 'manual' ? 'Left out: it is set to “Only when I choose it”.' : r.here && inUse ? 'Counted as “Less often”: you are using it.' : 'Passed every check, but had less free memory.']), ['How fresh this is', 'Measured 20 seconds ago']])}</div>` : '';
      const wrap = (act, id, html) => `<span data-smx-do-change="${act}"${id ? ` data-id="${h(id)}"` : ''}>${html}</span>`;
      return [
        { key: 'choice', html: ui.card({ title: `Work for ${d.project(st)}`, body: ui.sentence(`<span>Runs on</span>${select(S.executionHost, d.runOptions(st), { action: 'pm51-servers-exec', label: 'Runs on' })}`) + `<p class="smx-sentence-note">${auto ? `Auto → ${ui.b(pick ? pick.name : (home ? home.name : 'your Server'))} right now. ` : `Chosen: ${ui.b(chosen ? chosen.name : d.runLabel(st))}, by you. If it is off, work waits for it; Auto never takes over a choice you made. `}${ui.link({ label: SMX.local.flags.why ? 'Hide the reasons' : 'Why this computer', do: 'computers-why' })}</p>${why}` }) },
        { key: 'auto', html: ui.card({ title: 'How Auto chooses', help: 'The same for every project, unless a project is given its own.', body: ui.rows([
          { label: 'Auto aims for', help: PRESET_HELP[preset], control: wrap('computers-preset', '', select(preset, PRESETS, { action: 'pm51-noop', label: 'Auto aims for' })) },
          { label: 'Go easy on a computer someone is using', help: 'While a person is at it, it counts as “Less often”.', control: `<span data-smx-do="computers-inuse">${toggle(inUse, { action: 'pm51-noop', label: 'Go easy on a computer someone is using' })}</span>` }
        ]) }) },
        { key: 'levels', html: ui.card({ title: 'How much each computer is used', help: 'Auto prefers the ones marked “Prefer” and never picks “Only when I choose it”.', body: ui.rows(runners.map((r) => ({ label: r.name, help: r.note, control: wrap('computers-level', r.id, select(levelOf(r.id), LEVELS, { action: 'pm51-noop', label: `How much ${r.name} is used` })) }))) }) },
        { key: 'allowed', html: ui.card({ title: `Computers ${d.project(st)} may use`, help: 'Work for this project is only ever sent to these. A new computer is never added without asking you.', body: ui.rows([...runners.map((r) => ({ label: r.name, control: `<span data-smx-do="computers-allow" data-id="${h(r.id)}">${toggle(allowed(r.id), { action: 'pm51-noop', label: `${d.project(st)} may use ${r.name}` })}</span>` })), { label: 'When two are equally good, use', help: 'A tie-breaker, not a fixed choice.', control: wrap('computers-default', '', select(SMX.local.flags.defaultComputer || (home ? home.id : ''), runners.filter((r) => allowed(r.id)).map((r) => [r.id, r.name]), { action: 'pm51-noop', label: 'Tie-breaker computer' })) }]) + `<p class="smx-new-note">${SMX.icon('info')}<span>New on this page: “How Auto chooses”, the level of each computer, the computers a project may use and “Why this computer” come from the plan approved on 2026-11-09 (Auto by default). PMConcept7 does not have them yet, so here they are the concept’s own examples and are not saved.</span></p>` }) }
      ];
    },
    sections: [
      { key: 'noproject', title: 'Chats that have no project', help: 'A chat you start outside any project stays on the computer you are on. Auto is only for project work.', ids: ['general.interaction.no-project-default-computer'] }
    ],
    more: [{ key: 'env', html: (ctx) => { const S = sp(ctx.st); return ui.card({ title: 'What each computer can run', help: 'The kinds of environment work can start in. Containers are set up under Code & tools.', side: ui.btn({ label: 'Containers', go: 'code/containers' }), body: ui.facts(S.servers.map((s) => [s.name, (s.environments || []).join(' · ') || '—'])) }); } }],
    moreLabel: 'Environments',
    changes: [
      { was: '“Runs on — Where work runs.” is the second dropdown on the Home & Location tab. Its first choice reads “Automatic (Home server)”, which says the home server does the work; the approved plan says the opposite (Auto picks any allowed computer).', now: 'It has a page. The choice reads as a sentence, says “Auto → Home TrueNAS” or “Chosen: … by you”, and “Why this computer” lists why the winner won and why each other computer was left out.' },
      { was: 'The plan approved on 2026-11-09 has no place in Settings: Auto presets (Balanced, Fastest, Keep my computer free), a level per computer (Prefer, Normal, Less often, Only when I choose it), the computers a project may use, and treating a computer in use as “Less often”.', now: 'Each has a card here, in the plan’s own words. They are marked as new because PMConcept7 has no such settings yet.' },
      { was: '“Computer for chats with no project” lives in General › App & Input under “Sending messages”.', now: 'It is here, with a line saying Auto does not apply to it.' }
    ]
  });

  /* ------------------------------------------------------------------ Where projects are kept */
  SMX.page({
    id: 'computers/projects', chapter: 'computers', nav: 'Where projects are kept', icon: 'folder',
    title: 'Where projects are kept',
    purpose: 'The computer and folder this project lives in, and the guided steps for moving it, copying it or bringing one in.',
    blurb: (ctx) => { const st = ctx.st, home = d.homeServer(st); return `${d.project(st)} is kept on ${home ? home.name : 'no computer yet'}`; },
    status: (ctx) => { const n = (sp(ctx.st).conflicts || {}).open || 0; return n ? { text: `${n} to sort out`, tone: 'attention' } : { text: 'In step', tone: 'ready' }; },
    legacy: [['system', 'servers', 'move', 'servers']],
    keywords: ['move', 'copy', 'import', 'location', 'folder', 'conflict', 'sync'],
    lead: (ctx) => {
      const st = ctx.st, S = sp(st), home = d.homeServer(st);
      const hist = (S.move && S.move.history) || [];
      return [
        { key: 'where', html: ui.card({ title: `${d.project(st)} lives here`, body: ui.rows([
          { label: 'Kept on', help: 'The computer that holds the project. It should be one that stays on.', control: select(S.homeServer, S.servers.filter((s) => s.claimed !== false).map((s) => [s.id, s.name]), { action: 'pm51-servers-home', label: 'Kept on' }) },
          { label: 'Folder', value: `${S.sourceLocation.path || '—'}`, control: ui.btn({ label: 'Change…', action: 'pm51-servers-files' }) },
          { label: 'In step with your devices', help: 'Goals, chats and editors from your last session.', status: ui.status(S.status.work || 'Up to date', 'info'), value: `Last change ${String(S.status.lastChange || '').toLowerCase()}` }
        ]) }) },
        { key: 'move', html: ui.tasks([
          { icon: 'swap', title: 'Move it to another computer', sub: 'It lives there from now on. Work pauses safely while it moves.', action: 'pm51-servers-move-start' },
          { icon: 'copy', title: 'Make a copy', sub: 'A separate copy. The original stays where it is.', action: 'pm51-servers-copy' },
          { icon: 'download', title: 'Bring in a project over SSH', sub: 'A folder on another computer becomes a project here.', action: 'pm51-servers-ssh-import' }
        ], { title: 'Move, copy or bring in', anchor: 'move', cols: 3 }) },
        { key: 'history', html: ui.things({ title: 'Moves and copies', items: hist.map((x, i) => ({ icon: 'history', name: x.title || x.kind || 'Move', sub: [x.when || x.time, x.destination, x.result].filter(Boolean).join(' · '), side: ui.btn({ icon: 'more', label2: `More for ${x.kind || 'Move'}`, do: 'computers-move-more', data: { n: i }, ghost: true }) })), empty: { icon: 'history', title: 'No moves or copies yet', text: 'The ones you start show up here, with what happened. Each can be opened, done again or taken off the list.' } }) },
        { key: 'conflicts', html: ui.card({ title: 'If the same file changes in two places', body: ui.rows([
          { label: 'What Puppet Master does', help: 'For example when you edit a file on your laptop while the Server changes it too.', control: select(S.conflicts.policy, CONFLICT.includes(S.conflicts.policy) ? CONFLICT : [S.conflicts.policy, ...CONFLICT], { action: 'pm51-servers-conflict-set', label: 'When both sides changed' }) },
          { label: 'Files waiting for you to choose', value: String(S.conflicts.open || 0), control: ui.btn({ label: 'Show them', action: 'pm51-servers-conflicts-view' }) }
        ]) }) }
      ];
    },
    sections: [{ key: 'folders', title: 'Folders for new work', help: 'Where a new project, or a chat that has no project, puts its files.', ids: ['code.execution.projects-folder', 'code.execution.no-project-chats-folder'] }],
    expert: [{ key: 'tech', html: (ctx) => { const st = ctx.st, S = sp(st), home = d.homeServer(st), ps = st.projectSync || {}; return ui.card({ title: 'Technical details', body: ui.facts([['Which copy wins', ps.fileAuthority || 'Server host'], ['How devices stay in step', ps.syncMode || '—'], ['Server address', home ? home.address : '—'], ['Project path', S.sourceLocation.path || '—'], ['Last check before a move', (S.move && S.move.preflight) || 'Not run yet'], ['Last destination', (S.move && S.move.destination) || 'None'], ['Commands', 'cmd.project.move.preflight · cmd.project.move.start · cmd.project.duplicate_with_history']]) + ui.links([{ label: 'Check the Server and devices', action: 'pm51-servers-diagnostics', data: { scope: 'home' } }, { label: 'Check that a move would work', action: 'pm51-servers-diagnostics', data: { scope: 'move' } }]) }); } }],
    changes: [
      { was: 'Where the project lives is split: “Home server” and “Files” on the Home & Location tab; Move, Copy, Import and conflicts on the Move & Copy tab.', now: 'One page: where it lives, then the three guided ways to move, copy or bring in, then what happens on a conflict.' },
      { was: '“Projects folder” and “Folder for chats with no project” are in Code & Tools › Containers under “Building & publishing images”.', now: 'They are here, under “Folders for new work”.' },
      { was: 'The conflict choice is one long sentence per option (“Preserve both, pause affected work, and show a three-way comparison”), with “File authority” and “Sync mode” shown as bare facts.', now: 'The row says when a conflict happens, with an example; the two bare facts are under “For experts”.' }
    ]
  });
  const CONFLICT = ['Preserve both, pause affected work, and show a three-way comparison', 'Keep the server copy and save this device’s copy beside it', 'Keep this device’s copy and save the server copy beside it'];

  /* search: computers, devices and ways in, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => {
    const S = sp(st);
    return [
      ...S.servers.map((s) => ({ title: s.name, sub: 'Computers & remote access › Computers', route: `computers/list/${encodeURIComponent(s.id)}` })),
      ...sshList(st).map((f, i) => ({ title: f.name, sub: 'Computers & remote access › Computers · over SSH', route: `computers/list/ssh-${i}` })),
      ...S.devices.map((x) => ({ title: x.name, sub: 'Computers & remote access › Paired devices', route: 'computers/devices' })),
      ...d.routes(st).map((r) => ({ title: (ROUTE_PLAIN[r.kind] || [0, r.name])[1], sub: 'Computers & remote access › Away from home', route: 'computers/away' }))
    ];
  });
})(window);
