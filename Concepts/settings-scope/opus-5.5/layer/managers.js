/* Settings that apply everywhere (Opus 5.5): managers (BUILD-SPEC section 9; SETTINGS-PROPOSAL section 4).

   Ordinary rows inside a manager already behave like rows anywhere (rows.js). Things a manager holds (an MCP server, an
   AI account) never get a value per level; each has a home, where it's available, a few switches per project, a version
   for one project when it must really differ, and a state on each computer (SETTINGS-PROPOSAL 4.1, NEW CANON SSYS-061).
   The layer adds those parts beside each manager's own, idempotently, after every re-render:
     Providers & Accounts (providers)   each account: where it's signed in and where it's available; its open body gains
                                        On each computer and Where it's available (the accounts open in place here,
                                        not in a side panel)
     MCP servers (mcp)                  each list row: its reach in words; a server's own side panel gains Where it's
                                        available, In this project, On each computer and Make a version for tastebook
     Servers (servers)                  Home NAS keeps your settings; each card lists recent setting changes; its More
                                        menu offers Keep your settings on another computer… (moment 11.5)
   Everything a button does is simulated through PSX.run with the command it stands for. [Demo only] states. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.managers) return;
  const { D, esc, mark, icon, placeName, list, COMPUTERS, PROJECTS } = PSX;
  const S = PSX.S;
  const things = () => PSX.W.things;
  const comps = () => Object.keys(COMPUTERS);
  const CHEV = '<svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ------------------------------------------------------------------ readiness words (status mark plus word) */
  const ACC_STATE = {
    ready: ['complete', 'Ready'], checked: ['complete', 'Ready, checked there'], missing: ['off', 'Claude Code isn’t installed'],
    signin: ['waiting', 'Not signed in'], expired: ['warning', 'Expired']
  };
  const MCP_STATE = { ready: ['complete', 'Ready'], signin: ['waiting', 'Waiting · Sign in on {c}'], missing: ['off', 'Not installed'] };
  function signedSummary(a) {
    const on = comps().filter((k) => a.on[k] === 'ready' || a.on[k] === 'checked').map((k) => placeName('computer', k));
    const off = comps().filter((k) => !(a.on[k] === 'ready' || a.on[k] === 'checked')).map((k) => placeName('computer', k));
    return `${a.kind === 'key' ? 'Key on' : 'Signed in on'} ${list(on) || 'no computer yet'}${off.length ? ' · Not on ' + list(off) : ''}`;
  }
  const reachText = (t) => (t.reach === 'every' ? 'Every project' : `Only ${list(t.projects || [])}`);

  /* ------------------------------------------------------------------ Providers & Accounts */
  const ACC_MAP = { 'work-claude': 'work-claude', 'personal-claude': 'personal-claude', jared: 'codex' };
  function providers(mgr) {
    mgr.querySelectorAll('.pm51-acc-item[data-account]').forEach((item) => {
      const key = ACC_MAP[item.dataset.account]; const a = key && things().accounts[key]; if (!a) return;
      const sig = JSON.stringify([PSX.W.rev, a]);
      if (item.dataset.psxDone === sig && item.querySelector('[data-psx-acc]')) return;
      item.dataset.psxDone = sig;
      item.querySelectorAll('[data-psx-acc]').forEach((n) => n.remove());
      const copy = item.querySelector(':scope > .pm51-acc-head .pm51-acc-copy');
      if (copy) {
        const meta = copy.querySelector('.pm51-acc-meta');
        const line = D.createElement('div'); line.className = 'psx-acc-line'; line.setAttribute('data-psx-acc', 'line'); line.setAttribute('data-o55-foreign', '');
        const any = comps().some((k) => a.on[k] === 'ready' || a.on[k] === 'checked');
        line.innerHTML = `${PSX.st(any ? 'complete' : 'off', signedSummary(a))}<span class="psx-acc-use">Use in: ${esc(reachText(a))}</span>`;
        if (meta) meta.after(line); else copy.appendChild(line);
      }
      const inner = item.querySelector(':scope > .pm51-acc-body > .pm51-acc-inner');
      if (inner) inner.insertBefore(accountParts(key, a), inner.firstChild);
    });
  }
  function accountParts(key, a) {
    const box = D.createElement('div'); box.className = 'psx-acc-parts'; box.setAttribute('data-psx-acc', 'parts'); box.setAttribute('data-o55-foreign', '');
    const rows = comps().map((k) => {
      const s = a.on[k] || (a.kind === 'key' ? 'signin' : 'signin');
      const [mk, word] = ACC_STATE[s] || ACC_STATE.signin;
      const w2 = s === 'signin' && a.kind === 'key' ? 'No key here' : word;
      let act = '';
      if (s === 'missing') act = `<button type="button" class="psx-tb" data-psx-acc-act="install" data-k="${k}" data-a="${key}">Install on ${esc(placeName('computer', k))}</button>`;
      else if (s === 'signin') act = `<button type="button" class="psx-tb" data-psx-acc-act="signin" data-k="${k}" data-a="${key}">${a.kind === 'key' ? 'Add the key on' : 'Sign in on'} ${esc(placeName('computer', k))}</button>`;
      return `<li class="psx-li"><span class="psx-li-name">${esc(placeName('computer', k))}</span><span class="psx-li-end">${PSX.st(mk, w2)}${act}</span></li>`;
    }).join('');
    box.innerHTML = `<div class="psx-acc-group"><div class="psx-h">On each computer</div><ul class="psx-list">${rows}</ul><p class="psx-p psx-muted">Sign-ins open here on this device, and are kept on the computer that does the work.</p></div>`
      + `<div class="psx-acc-group"><div class="psx-h">Where it’s available</div><div class="psx-li-end" style="justify-content:flex-start"><button type="button" class="psx-tb is-primary" data-psx-acc-act="reach" data-a="${key}" aria-haspopup="menu">${esc(reachText(a))}${CHEV}</button></div><p class="psx-p">Being signed in on a computer doesn’t let a project use this account unless it’s chosen there or in your usual settings.</p></div>`;
    return box;
  }
  function accountAct(b) {
    const key = b.dataset.a, a = things().accounts[key], k = b.dataset.k;
    if (b.dataset.psxAccAct === 'install') {
      PSX.run('cmd.provider.install', [600, 700], () => { a.on[k] = 'signin'; PSX.W.rev++; PSX.note({ title: `Claude Code is installed on ${placeName('computer', k)}`, body: `Next: Sign in on ${placeName('computer', k)}. Sign-ins open here on this device, and are kept on ${placeName('computer', k)}.`, mark: 'complete', actions: [{ label: `Sign in on ${placeName('computer', k)}`, primary: true, run: () => signIn(key, k) }] }); decorate(true); });
      PSX.note({ title: `Installing Claude Code on ${placeName('computer', k)}…`, body: `This takes a minute. Nothing else on ${placeName('computer', k)} changes.`, mark: 'working', sticky: true });
    } else if (b.dataset.psxAccAct === 'signin') signIn(key, k);
    else if (b.dataset.psxAccAct === 'reach') reachMenu(b, a, () => decorate(true), 'ai.accounts.account-enabled');
  }
  function signIn(key, k) {
    const a = things().accounts[key];
    PSX.sheet({
      title: `${a.kind === 'key' ? 'Add the key on' : 'Sign in on'} ${placeName('computer', k)}`, kicker: `${a.service} · ${a.name}`,
      body: `<p class="psx-p">${a.kind === 'key' ? 'You paste the key here, on the device in front of you.' : 'The service’s own sign-in opens here, on the device in front of you.'} It is kept on ${esc(placeName('computer', k))}, in its own secure store, and never copied to another computer.</p><p class="psx-p psx-muted">Then ${esc(placeName('computer', k))} checks it before the first job.</p>`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: a.kind === 'key' ? 'Add the key' : 'Open the sign-in', primary: true, run: (s) => { s.close(); PSX.run('cmd.provider_binding.resolve_on_destination', [700], () => { a.on[k] = 'checked'; PSX.W.rev++; decorate(true); PSX.note({ title: `${a.service} · ${a.name} is ready on ${placeName('computer', k)}`, body: 'Checked there before its first job.', mark: 'complete' }); }); } }]
    });
  }
  /* "Every project" or "Only these projects", one checklist; written as the levels of the thing's own switch */
  function reachMenu(anchor, t, done, settingId) {
    PSX.menu(anchor, [
      { label: 'Every project', meta: 'and chats with no project', run: () => { const was = { reach: t.reach, projects: t.projects }; t.reach = 'every'; t.projects = []; PSX.W.rev++; done(); PSX.note({ title: `${t.name} is available in every project.`, body: 'And in chats with no project.', mark: 'complete', actions: [{ label: 'Undo', run: () => { Object.assign(t, was); PSX.W.rev++; done(); } }] }); } },
      { label: 'Only these projects…', meta: t.reach === 'only' ? list(t.projects || [], 2) : 'choose', run: () => pickProjects(t, done, settingId) }
    ], { label: 'Where it’s available', width: 280 });
  }
  function pickProjects(t, done, settingId) {
    const cur = new Set(t.reach === 'only' ? t.projects || [] : []);
    const body = `<p class="psx-p">${esc(t.name)} can be used in the projects you tick, and nowhere else.</p>` + PROJECTS.map((p) => `<label class="psx-check"><input type="checkbox" value="${p.id}"${cur.has(p.id) ? ' checked' : ''}><span>${esc(p.id)}<small>works on ${esc(placeName('computer', p.home))}</small></span></label>`).join('');
    PSX.sheet({
      title: `Where ${t.name} is available`, kicker: 'Only these projects', body,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Save', primary: true, run: (s) => {
        const picked = [...s.body.querySelectorAll('input:checked')].map((x) => x.value);
        const was = { reach: t.reach, projects: t.projects };
        t.reach = 'only'; t.projects = picked; PSX.W.rev++; s.close(); done();
        PSX.note({ title: `${t.name}: only ${list(picked) || 'no project'}.`, body: 'Every other project and chat leaves it alone.', mark: 'complete', actions: [{ label: 'Undo', run: () => { Object.assign(t, was); PSX.W.rev++; done(); } }] });
      } }]
    });
  }

  /* ------------------------------------------------------------------ MCP servers */
  const MCP_IDS = { 'github-mcp': 'github-mcp', 'filesystem-mcp': 'filesystem-mcp', 'linear-mcp': 'linear-mcp' };
  function mcpReach(t) {
    if (t.home === 'external') return 'Managed by another app';
    if (t.home !== 'library') return `Only ${t.home}`;
    const adj = Object.keys(t.inProject || {});
    const parts = adj.map((p) => (t.inProject[p].on === false ? `off in ${p}` : `${String(t.inProject[p].may || 'adjusted').toLowerCase()} in ${p}`));
    const ready = comps().filter((k) => t.computers[k] === 'ready').length;
    return `${reachText(t)}${parts.length ? ' · ' + parts.join(', ') : ''} · Ready on ${ready} of ${comps().length} computers`;
  }
  function mcp(mgr) {
    mgr.querySelectorAll('.pm51-item[data-id]').forEach((item) => {
      if (item.getAttribute('data-action') !== 'pm51-mcp-open') return;
      const t = things().mcp[MCP_IDS[item.dataset.id]]; if (!t) return;
      const txt = mcpReach(t);
      let el = item.querySelector('[data-psx-reach]');
      if (el && el.textContent === txt) return;
      if (!el) { el = D.createElement('div'); el.className = 'pm51-item-meta psx-reach'; el.setAttribute('data-psx-reach', ''); el.setAttribute('data-o55-foreign', ''); const copy = item.querySelector('.pm51-item-copy'); if (copy) copy.appendChild(el); }
      el.textContent = txt;
    });
    // the add-server set-up's "Where it can be used" reads "Where it's available: Only this project / Every project"
    D.querySelectorAll('#pm-settings-portals .o55-mcp-scope, #pm-settings-root .o55-mcp-scope').forEach((sel) => relabelScope(sel));
  }
  function relabelScope(el) {
    const field = el.closest('.pm51-field'); if (!field || field.dataset.psxDone) return;
    field.dataset.psxDone = '1';
    const lab = field.querySelector('.pm51-field-label'); if (lab) lab.textContent = 'Where it’s available';
    const map = { 'This project only': 'Only this project', 'Every project': 'Every project' };
    field.querySelectorAll('option').forEach((o) => { if (map[o.textContent]) o.textContent = map[o.textContent]; });
    const v = field.querySelector('.pm51-dd-value'); if (v && map[v.textContent]) v.textContent = map[v.textContent];
  }
  /* a server's own side panel (the manager's drawer) gains the parts of SETTINGS-PROPOSAL 4.3 */
  function mcpDrawer(wrap) {
    const aside = wrap.querySelector('aside.drawer'); if (!aside) return;
    const name = aside.getAttribute('aria-label');
    const id = Object.keys(things().mcp).find((k) => things().mcp[k].name === name); if (!id) return;
    const t = things().mcp[id];
    const body = aside.querySelector('.pm51-panel-body'); if (!body) return;
    const c = PSX.ctxFull(S.ctx), proj = S.mcpProject || c.project || 'tastebook';
    const sig = JSON.stringify([PSX.W.rev, t, proj]);
    if (body.dataset.psxDone === sig && body.querySelector('[data-psx-mcp]')) return;
    const act = D.activeElement, keep = act && body.contains(act) && act.closest('[data-psx-key]') ? act.closest('[data-psx-key]').dataset.psxKey : null;
    body.dataset.psxDone = sig;
    body.querySelectorAll('[data-psx-mcp]').forEach((n) => n.remove());
    const sec = (title, inner, help) => `<section class="pm51-panel-card pm51-panel-section psx-mcp-sec" data-psx-mcp="1"><div class="pm51-pc-head"><div class="pm51-ps-title">${esc(title)}</div></div>${help ? `<p class="pm51-ps-help">${esc(help)}</p>` : ''}<div class="pm51-pc-body">${inner}</div></section>`;
    const ext = t.home === 'external';
    const adj = Object.keys(t.inProject || {});
    const reachLine = ext ? 'Managed by another app. It decides where it can be used.' : t.reach === 'every' ? 'In every project, and in chats with no project.' : `Only in ${list(t.projects || [])}.`;
    const adjLine = adj.length ? adj.map((p) => (t.inProject[p].on === false ? `${p} turns it off` : `${p} adjusts it`)).join(' · ') + '.' : '';
    const where = `<div class="psx-mcp-row"><div><div class="psx-p" style="margin:0">${esc(reachLine)}</div>${adjLine ? `<div class="psx-li-sub">${esc(adjLine)}</div>` : ''}</div>${ext ? '' : `<button type="button" class="psx-tb is-primary" data-psx-mcp-act="reach" data-psx-key="mcp-reach" aria-haspopup="menu">${esc(reachText(t))}${CHEV}</button>`}</div>`;
    const ip = (t.inProject || {})[proj] || {};
    const onTxt = ip.on === undefined ? 'Same as everywhere · On' : ip.on ? 'On' : 'Off';
    const mayTxt = ip.may === undefined ? 'Same as everywhere · Ask before it changes things' : ip.may;
    const available = t.home === 'library' ? (t.reach === 'every' || (t.projects || []).includes(proj)) : t.home === proj;
    const inProject = ext ? '' : sec(`In this project`, `<div class="psx-mcp-row"><span class="psx-li-sub">Project</span><button type="button" class="psx-tb" data-psx-mcp-act="proj" data-psx-key="mcp-proj" aria-haspopup="menu" aria-label="Project: ${esc(proj)}. Choose another project">${esc(proj)}${CHEV}</button></div>`
      + (available ? `<div class="psx-mcp-row"><span>On or off</span><button type="button" class="psx-tb" data-psx-mcp-act="on" data-psx-key="mcp-on" aria-haspopup="menu" aria-label="On or off in ${esc(proj)}: ${esc(onTxt)}">${esc(onTxt)}${CHEV}</button></div><div class="psx-mcp-row"><span>What it may do</span><button type="button" class="psx-tb" data-psx-mcp-act="may" data-psx-key="mcp-may" aria-haspopup="menu" aria-label="What it may do in ${esc(proj)}: ${esc(mayTxt)}">${esc(mayTxt)}${CHEV}</button></div>`
        : `<p class="psx-p">${mark('off')} Not available in ${esc(proj)}. Add it under Where it’s available.</p>`), 'A project can turn it off or make it more careful; everything else stays the same everywhere.');
    const rows = comps().map((k) => {
      const s = t.computers[k] || 'missing';
      const [mk, w] = MCP_STATE[s];
      const word = w.replace('{c}', placeName('computer', k));
      const btn = s === 'signin' ? `<button type="button" class="psx-tb" data-psx-mcp-act="signin" data-k="${k}" data-psx-key="mcp-signin-${k}">Sign in</button>` : s === 'missing' ? `<button type="button" class="psx-tb" data-psx-mcp-act="setup" data-k="${k}" data-psx-key="mcp-setup-${k}">Set up on ${esc(placeName('computer', k))}</button>` : '';
      return `<li class="psx-li"><span class="psx-li-name">${esc(placeName('computer', k))}</span><span class="psx-li-end">${PSX.st(mk, word)}${btn}</span></li>`;
    }).join('');
    const onEach = sec('On each computer', `<ul class="psx-list">${rows}</ul>`, 'How it starts and its sign-in are kept on each computer; secrets never move.');
    const version = ext || t.home !== 'library' ? '' : `<div class="psx-mcp-version" data-psx-mcp="1"><button type="button" class="btn" data-psx-mcp-act="version" data-psx-key="mcp-version">Make a version for ${esc(proj)}</button><p class="pm51-ps-help">When ${esc(proj)} needs another address or another sign-in, it gets its own copy, used only there.</p></div>`;
    body.insertAdjacentHTML('beforeend', sec('Where it’s available', where) + inProject + onEach + version);
    body.querySelectorAll('[data-psx-mcp-act]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); mcpAct(b, id, wrap); }));
    if (keep) { const f = body.querySelector(`[data-psx-key="${CSS.escape(keep)}"]`); if (f) f.focus({ preventScroll: true }); }
  }
  function mcpAct(b, id, wrap) {
    const t = things().mcp[id], c = PSX.ctxFull(S.ctx), proj = S.mcpProject || c.project || 'tastebook';
    const redo = () => { PSX.W.rev++; mcpDrawer(wrap); decorate(true); };
    const a = b.dataset.psxMcpAct;
    const setIp = (patch, label2) => { t.inProject = t.inProject || {}; const was = PSX.clone(t.inProject[proj]); const next = Object.assign({}, t.inProject[proj] || {}, patch); Object.keys(next).forEach((k) => { if (next[k] === undefined) delete next[k]; }); if (Object.keys(next).length) t.inProject[proj] = next; else delete t.inProject[proj]; redo(); PSX.note({ title: `Saved for ${proj}.`, body: `${t.name}: ${label2}.`, actions: [{ label: 'Undo', run: () => { if (was) t.inProject[proj] = was; else delete t.inProject[proj]; redo(); } }] }); };
    if (a === 'reach') reachMenu(b, t, redo);
    else if (a === 'proj') PSX.menu(b, PROJECTS.map((p) => ({ label: p.id, meta: `works on ${placeName('computer', p.home)}`, run: () => { S.mcpProject = p.id; redo(); } })), { label: 'Choose a project', search: true, width: 260 });
    else if (a === 'on') PSX.menu(b, [{ label: 'Same as everywhere · On', run: () => setIp({ on: undefined }, 'same as everywhere') }, { label: 'On', run: () => setIp({ on: true }, 'on') }, { label: 'Off', run: () => setIp({ on: false }, 'off') }], { label: 'On or off', width: 260 });
    else if (a === 'may') PSX.menu(b, [{ label: 'Same as everywhere · Ask before it changes things', run: () => setIp({ may: undefined }, 'same as everywhere') }, { label: 'Ask before it changes things', run: () => setIp({ may: 'Ask before it changes things' }, 'ask before it changes things') }, { label: 'Read only', run: () => setIp({ may: 'Read only' }, 'read only') }, { label: 'Protected files only', run: () => setIp({ may: 'Protected files only' }, 'protected files only') }], { label: 'What it may do', width: 300 });
    else if (a === 'signin') { const k = b.dataset.k; PSX.run('cmd.mcp.server.sign_in', [700], () => { t.computers[k] = 'ready'; redo(); PSX.note({ title: `${t.name} is signed in on ${placeName('computer', k)}`, body: 'The sign-in is kept on that computer.', mark: 'complete' }); }); }
    else if (a === 'setup') { const k = b.dataset.k; PSX.run('cmd.mcp.server.install', [600, 600], () => { t.computers[k] = 'signin'; redo(); PSX.note({ title: `${t.name} is set up on ${placeName('computer', k)}`, body: `Next: sign in on ${placeName('computer', k)}.`, mark: 'complete' }); }); }
    else if (a === 'version') {
      PSX.sheet({
        title: `Make a version of ${t.name} for ${proj}?`, kicker: 'Its own copy',
        body: `<p class="psx-p">${esc(proj)} gets its own copy of ${esc(t.name)}, used only there, in place of your library one. Change its address or sign-in afterwards; every other project keeps using the library one.</p><p class="psx-p psx-muted">Go back to the library version at any time. Its secrets are set again on the computer that does ${esc(proj)}’s work.</p>`,
        actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: `Make ${proj}’s version`, primary: true, run: (s) => { s.close(); PSX.run('cmd.mcp.server.copy_to_project', [700], () => { const nid = id + '-' + proj; things().mcp[nid] = { name: `${t.name} (${proj})`, home: proj, reach: 'only', projects: [proj], computers: PSX.clone(t.computers) }; PSX.W.rev++; PSX.note({ title: `${proj} has its own version of ${t.name}.`, body: 'Every other project keeps the library one.', mark: 'complete', actions: [{ label: 'Undo', run: () => { delete things().mcp[nid]; PSX.W.rev++; } }] }); }); } }]
      });
    }
  }

  /* ------------------------------------------------------------------ Servers */
  const SRV_MAP = { truenas: 'homenas', this: 'here', studio: 'studio' };
  function renameServers() {
    const sp = W.PM51 && W.PM51.s && W.PM51.s().serverProject; if (!sp || sp.__psx || !Array.isArray(sp.servers)) return;
    sp.__psx = true;
    // the Servers manager draws the demo world's computers (a manager drawing a thing, through its own state)
    const nas = sp.servers.find((s) => s.id === 'truenas'); if (nas) { nas.name = 'Home NAS'; nas.address = 'homenas.local'; }
    const me = sp.servers.find((s) => s.id === 'this'); if (me) me.name = 'MacBook Pro';
    if (me && !sp.servers.find((s) => s.id === 'studio')) sp.servers.push(Object.assign(PSX.clone(me), { id: 'studio', name: 'Studio Mac', address: 'studio-mac.local', role: 'Server', state: 'Connected' }));
    try { W.PM51.refresh('servers', { swap: false }); } catch (e) { /* not on screen */ }
  }
  function servers(mgr) {
    const detail = mgr.querySelector('.resource-detail'); if (!detail) return;
    const sel = mgr.querySelector('.resource-row.active[data-id]');
    const comp = sel && SRV_MAP[sel.dataset.id]; if (!comp) return;
    const sig = JSON.stringify([PSX.W.rev, comp, PSX.W.up]);
    if (detail.dataset.psxDone === sig && detail.querySelector('.psx-srv-sec')) return;
    detail.dataset.psxDone = sig;
    // a soft re-render can morph the layer's nodes into the engine's while keeping the attribute: only remove ours
    detail.querySelectorAll('[data-psx-srv]').forEach((n) => { if (n.matches('.psx-srv-sec, .psx-keeps')) n.remove(); else n.removeAttribute('data-psx-srv'); });
    const sub = detail.querySelector('.pm51-detail-sub');
    if (sub && comp === 'homenas') sub.insertAdjacentHTML('afterend', `<div class="psx-keeps" data-psx-srv="1" data-o55-foreign>${PSX.st('complete', 'Keeps your settings')}<span class="psx-li-sub">Every other computer follows it.</span></div>`);
    if (sub && comp === 'studio' && !PSX.W.studioJoined) sub.insertAdjacentHTML('afterend', `<div class="psx-keeps" data-psx-srv="1" data-o55-foreign>${PSX.st('info', 'Not joined yet · keeps its own settings')}<button type="button" class="psx-tb" data-psx-srv-act="join">Use one set of settings…</button></div>`);
    if (sub && comp === 'studio' && PSX.W.studioJoined) sub.insertAdjacentHTML('afterend', `<div class="psx-keeps" data-psx-srv="1" data-o55-foreign>${PSX.st('complete', 'Follows Home NAS')}</div>`);
    const content = detail.querySelector('.resource-content'); if (!content) return;
    const items = PSX.W.history.filter((e) => e.from === comp || (e.level === 'computer' && e.key === comp)).slice(0, 2);
    const lines = items.length ? items.map((e) => `<li class="psx-li"><span class="psx-li-name">${esc(e.text || (PSX.label(e.sid) + ': ' + (e.before === undefined ? 'set to ' + PSX.vt(e.sid, e.after) : PSX.vt(e.sid, e.before) + ' to ' + PSX.vt(e.sid, e.after))))}</span><span class="psx-li-end psx-muted">${esc(e.when)}${e.level ? ' · ' + esc(e.level === 'everywhere' ? 'Everywhere' : placeName(e.level, e.key)) : ''}</span></li>`).join('') : `<li class="psx-li"><span class="psx-li-sub">No changes made from this computer yet.</span></li>`;
    content.insertAdjacentHTML('afterbegin', `<section class="panel-card pm51-section psx-srv-sec" data-psx-srv="1" data-o55-foreign><div class="pm51-section-head"><div class="pm51-section-copy"><h3 class="pm51-section-title">Recent setting changes on this computer</h3><p class="pm51-section-help">${comp === 'homenas' ? 'Home NAS keeps your settings, so every change is recorded here first.' : 'Made from this computer, wherever they apply.'}</p></div><button type="button" class="psx-tb" data-psx-srv-act="history">See all changes</button></div><div class="pm51-section-body"><ul class="psx-list">${lines}</ul></div></section>`);
    detail.querySelectorAll('[data-psx-srv-act]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); if (b.dataset.psxSrvAct === 'history') PSX.history.open(); else if (PSX.moments) PSX.moments.run('11.6'); }));
  }
  /* the server's More menu (the kit's popout on document.body, titled with the server's name) gains one item */
  function moreMenu(pop) {
    if (pop.dataset.psxDone) return;
    const title = ((pop.querySelector('.pm51-popout-title, .popover-title') || {}).textContent || '').trim();
    if (title !== 'Home NAS') return;
    pop.dataset.psxDone = '1';
    const b = D.createElement('button');
    b.type = 'button'; b.className = 'pm51-popout-item pm51-menu-item psx-menu-item'; b.setAttribute('role', 'menuitem'); b.setAttribute('tabindex', '-1');
    b.innerHTML = `${icon('network')}<span>Keep your settings on another computer…</span>`;
    b.addEventListener('click', (e) => { e.stopPropagation(); try { W.PM51.closePopouts(); } catch (x) { pop.remove(); } if (PSX.moments) PSX.moments.run('11.5'); });
    const sep = pop.querySelector('.pm51-popout-sep, .menu-sep');
    if (sep) pop.insertBefore(b, sep); else pop.appendChild(b);
  }

  /* ------------------------------------------------------------------ wiring */
  function decorate(force) {
    const rootEl = PSX.root(); if (!rootEl) return;
    if (force) rootEl.querySelectorAll('[data-psx-done]').forEach((n) => { if (n.matches('.pm51-acc-item, .resource-detail')) delete n.dataset.psxDone; });
    renameServers();
    rootEl.querySelectorAll('.manager-page.pm51-mgr').forEach((mgr) => {
      const k = mgr.dataset.pm51Manager;
      try {
        if (k === 'providers') providers(mgr);
        else if (k === 'mcp') mcp(mgr);
        else if (k === 'servers') servers(mgr);
        else if (k === 'settings-transfer' && PSX.copy) PSX.copy.decorate(mgr);
      } catch (e) { console.error('[psx managers]', k, e); }
    });
    const portal = PSX.portal();
    portal.querySelectorAll('.pm51-drawer-wrap').forEach((w) => { try { mcpDrawer(w); } catch (e) { console.error('[psx mcp drawer]', e); } });
    D.querySelectorAll('body > .pm51-popout.pm51-menu, .popover[role="menu"]').forEach((p) => moreMenu(p));
    portal.querySelectorAll('.o55-mcp-scope').forEach((sel) => relabelScope(sel));
  }
  function install() {
    const portal = PSX.portal();
    if (portal && !portal.__psxMgrObs) {
      let raf = 0;
      portal.__psxMgrObs = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; decorate(); }); });
      portal.__psxMgrObs.observe(portal, { childList: true, subtree: true });
    }
    if (!D.body.__psxPopObs) {
      D.body.__psxPopObs = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1 && n.matches && n.matches('.pm51-popout.pm51-menu')) moreMenu(n); })));
      D.body.__psxPopObs.observe(D.body, { childList: true });
    }
    if (!D.__psxAccWired) {
      D.__psxAccWired = true;
      D.addEventListener('click', (e) => {
        const b = e.target.closest && e.target.closest('[data-psx-acc-act]');
        if (b) { e.preventDefault(); e.stopPropagation(); accountAct(b); }
      }, true);
    }
  }
  PSX.on('world', () => decorate(true));
  PSX.managers = { decorate, install, mcpReach, signedSummary, reachText };
})(window);
