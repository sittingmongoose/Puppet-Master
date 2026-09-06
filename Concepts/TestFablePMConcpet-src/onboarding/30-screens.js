/* PMF Product Onboarding — screens. One decision per screen. Primary copy is
   plain language; product terms follow the plain explanation. Nothing is created
   before the review's explicit Create / Add / Restore action. */
(function () {
  'use strict';
  var PMF = window.PMF_ONBOARDING, U = PMF.util, h = U.h, raw = U.raw, str = U.str, I = PMF.icon, D = PMF.data, OWN = PMF.owners;
  var SC = PMF.screens = PMF.screens || {}, A = PMF.actions = PMF.actions || {};

  // ---- components -----------------------------------------------------------------
  function opt(o) {
    return h`<button type="button" class="pmf-opt ${o.compact ? 'is-compact' : ''}" role="radio" aria-checked="${o.checked ? 'true' : 'false'}" data-act="pick" data-group="${o.group}" data-arg="${o.value}">
      <span class="pmf-opt-ico">${I(o.icon)}</span>
      <span class="pmf-opt-text"><span class="pmf-opt-name">${o.name}${o.badge ? raw('<span class="pmf-badge">' + U.esc(o.badge) + '</span>') : ''}</span>${o.desc ? raw('<span class="pmf-opt-desc">' + U.esc(o.desc) + '</span>') : ''}</span>
      <span class="pmf-opt-check">${I('check')}</span></button>`;
  }
  function heading(kicker, title, sub) { return h`<div class="pmf-heading">${kicker ? raw('<div class="pmf-kicker">' + U.esc(kicker) + '</div>') : ''}<h2 class="pmf-title" id="pmf-title">${title}</h2>${sub ? raw('<p class="pmf-sub">' + str(sub) + '</p>') : ''}</div>`; }
  function toggle(o) { return h`<button type="button" class="pmf-toggle" role="switch" aria-checked="${o.on ? 'true' : 'false'}" data-act="${o.act}" data-arg="${o.value || ''}"><span class="pmf-opt-text"><span class="pmf-opt-name">${o.name}${o.badge ? raw('<span class="pmf-badge">' + U.esc(o.badge) + '</span>') : ''}</span><span class="pmf-opt-desc">${o.desc}</span></span><span class="pmf-switch"></span></button>`; }
  function row(o) { return h`<button type="button" class="pmf-row ${o.static ? 'is-static' : ''}" role="${o.static ? 'listitem' : 'radio'}" aria-checked="${o.checked ? 'true' : 'false'}" data-act="${o.act || 'pick'}" data-group="${o.group || ''}" data-arg="${o.value}"><span class="pmf-row-ico">${I(o.icon)}</span><span class="pmf-row-text"><span class="pmf-row-name">${o.name}</span><span class="pmf-row-meta">${o.meta || ''}</span></span><span class="pmf-row-end">${o.end ? raw(str(o.end)) : ''}${o.static ? '' : raw('<span class="pmf-opt-check">' + PMF.icons.check + '</span>')}</span></button>`; }
  function wait(o) { return h`<div class="pmf-wait" data-state="${o.state || 'busy'}" id="${o.id || ''}">${o.state === 'ok' ? raw('<span class="pmf-wait-ico">' + PMF.icons.check + '</span>') : o.state === 'err' ? raw('<span class="pmf-wait-ico">' + PMF.icons.warn + '</span>') : raw('<span class="pmf-spinner"></span>')}<span class="pmf-wait-text"><span>${o.text}</span>${o.sub ? raw('<small>' + U.esc(o.sub) + '</small>') : ''}</span></div>`; }
  function mono(p) { return h`<span class="pmf-mono" style="--pmf-mono-bg:${p.color}">${p.mono}</span>`; }
  function phases(list, id) { return h`<div class="pmf-phases" id="${id}">${raw(list.map(function (ph, i) { return '<div class="pmf-phase" data-state="todo" data-i="' + i + '"><span class="pmf-phase-dot">' + PMF.icons.check + '</span><span class="pmf-phase-label">' + U.esc(ph.label) + '</span><span class="pmf-phase-meta"></span></div>'; }).join(''))}</div>`; }
  function setPhase(hostId, i, state, msg) { var host = document.getElementById(hostId); if (!host) return; var el = host.querySelector('[data-i="' + i + '"]'); if (!el) return; el.setAttribute('data-state', state); var m = el.querySelector('.pmf-phase-meta'); if (m) m.textContent = state === 'failed' ? (msg || 'Failed') : state === 'done' ? 'Done' : state === 'running' ? 'Working' : state === 'skipped' ? 'Skipped' : ''; if (state === 'failed') { var dot = el.querySelector('.pmf-phase-dot'); if (dot) dot.innerHTML = PMF.icons.x; } }
  function serverName(d) { return d.where === 'remote' && d.server ? d.server.name : 'this computer'; }
  function projectsAvailable() { return (PMF.scenario().projects || []).map(function (id) { return D.projects[id]; }).filter(Boolean); }
  function suggestPath(d) { var base = d.where === 'remote' && d.server ? (d.server.name + ':~/Puppet Master/') : '~/Puppet Master/'; return base + (d.name || 'New Project'); }

  // generic pick: the current screen decides what the group means
  A.pick = function (el) { var def = SC[PMF.state.screen]; var group = el.getAttribute('data-group'), value = el.getAttribute('data-arg'); PMF.state.tmp.justPicked = group + ':' + value; if (def && def.onPick) def.onPick(group, value, el); try { PMF.art.nudge(.8); } catch (e) {} };
  // after a re-render, the freshly chosen control gets a one-shot pulse
  document.addEventListener('pmf.onboarding.rendered', function () { var jp = PMF.state.tmp.justPicked; if (!jp) return; PMF.state.tmp.justPicked = null; var i = jp.indexOf(':'); var el = document.querySelector('#pmf-onboarding [data-group="' + jp.slice(0, i) + '"][data-arg="' + jp.slice(i + 1).replace(/"/g, '\\"') + '"]'); if (el) { el.classList.add('is-just-picked'); setTimeout(function () { el.classList.remove('is-just-picked'); }, 700); } });

  // =============================================================================
  // 1. Welcome
  // =============================================================================
  var FAMS = [['friendly', 'Friendly', '#F07A55'], ['glass', 'Glass', '#9D82F0'], ['retro', 'Retro', '#86c46a'], ['basic', 'Basic', '#0056B3']];
  SC.welcome = {
    chapter: null, scene: 'welcome',
    caption: function () { return [{ text: 'A plan you can read, before any work starts.', primary: true }]; },
    render: function (d) {
      var fam = U.family(), mode = U.mode();
      return h`${heading('Welcome', 'Turn an idea into a plan. Then let the work happen.', 'Puppet Master writes the plan first. You check it. Then it coordinates the work for you.')}
      <p class="pmf-note">Setup takes about two minutes. Nothing is created until you say so.</p>
      <div class="pmf-look"><span class="pmf-look-label">Pick a look</span>${raw(FAMS.map(function (f) { return '<button type="button" class="pmf-swatch" role="radio" aria-checked="' + (fam === f[0]) + '" data-act="look-family" data-arg="' + f[0] + '" title="' + f[1] + '" style="--sw:' + f[2] + '"><i></i></button>'; }).join(''))}
        <div class="pmf-seg" data-index="${mode === 'dark' ? 1 : 0}"><button type="button" role="radio" aria-checked="${mode === 'light'}" data-act="look-mode" data-arg="light">Light</button><button type="button" role="radio" aria-checked="${mode === 'dark'}" data-act="look-mode" data-arg="dark">Dark</button></div></div>`;
    },
    foot: function () { return { back: false, primary: { label: 'Get started', act: 'next' } }; },
    next: function () { return 'where'; }
  };
  A['look-family'] = function (el) { try { window.PM_THEME.setFamily(el.getAttribute('data-arg')); } catch (e) { document.documentElement.setAttribute('data-theme', el.getAttribute('data-arg') + '-' + U.mode()); } U.$$('.pmf-swatch', el.parentNode).forEach(function (b) { b.setAttribute('aria-checked', b === el ? 'true' : 'false'); }); };
  A['look-mode'] = function (el) { var m = el.getAttribute('data-arg'); try { window.PM_THEME.setMode(m); } catch (e) { document.documentElement.setAttribute('data-theme', U.family() + '-' + m); } var seg = el.closest('.pmf-seg'); seg.setAttribute('data-index', m === 'dark' ? 1 : 0); U.$$('button', seg).forEach(function (b) { b.setAttribute('aria-checked', b === el ? 'true' : 'false'); }); };

  // =============================================================================
  // 2. Where the work runs
  // =============================================================================
  SC.where = {
    chapter: 'where', scene: function (d) { return ['where', d]; },
    caption: function (d) { return [{ text: d.where === 'remote' ? 'This device connects to a Puppet Master you already have.' : d.where === 'server' ? 'Another computer becomes your Puppet Master Server.' : 'This computer does the work.', primary: true }]; },
    render: function (d, tmp) {
      return h`${heading('Where', 'Where should the work run?', 'Puppet Master needs one computer to do the heavy lifting. We call it the Server.')}
      <div class="pmf-options" role="radiogroup">
        ${opt({ group: 'where', value: 'local', icon: 'laptop', name: 'This computer', desc: 'Simplest. Everything stays here.', badge: 'Recommended', checked: d.where === 'local' })}
        ${opt({ group: 'where', value: 'remote', icon: 'server', name: 'A Puppet Master I already set up', desc: 'Connect this device to it and use its Projects.', checked: d.where === 'remote' })}
        ${opt({ group: 'where', value: 'server', icon: 'box', name: 'Another computer', desc: 'Set it up as a Server, or restore one from a backup.', checked: d.where === 'server' })}
      </div>
      <div id="pmf-preflight">${d.where === 'local' ? wait(tmp.preflight ? { state: 'ok', text: 'This computer is ready to run work.', sub: tmp.preflight.checks.map(function (c) { return c.label; }).join(' · ') } : { text: 'Checking this computer', sub: 'Free space, permissions, and version. Read-only.' }) : ''}</div>`;
    },
    onEnter: function (sec, d, tmp) { if (d.where === 'local' && !tmp.preflight) OWN.preflightLocal().then(function (r) { tmp.preflight = r; if (PMF.state.screen === 'where' && d.where === 'local') PMF.patch('#pmf-preflight', wait({ state: 'ok', text: 'This computer is ready to run work.', sub: r.checks.map(function (c) { return c.label; }).join(' · ') })); }); },
    onPick: function (g, v) { var d = PMF.draft(); d.where = v; if (v !== 'remote') { d.server = null; d.paired = false; } PMF.rerender(); },
    foot: function (d) { return { primary: { label: d.where === 'local' ? 'Continue' : d.where === 'remote' ? 'Find my Puppet Master' : 'Continue' } }; },
    next: function (d) { return d.where === 'remote' ? 'connect' : d.where === 'server' ? 'server' : 'begin'; }
  };

  // ---- 2a. connect this device to an existing Puppet Master -----------------------
  SC.connect = {
    chapter: 'where', scene: 'connect',
    caption: function (d) { return [{ text: 'Looking on your network. Nothing is changed by looking.', primary: true }]; },
    render: function (d, tmp) {
      var found = tmp.found;
      var list = '';
      if (!found) list = str(wait({ text: 'Looking for Puppet Masters on your network', sub: 'Takes a few seconds. You can also enter a pairing code.' }));
      else if (!found.length) list = str(h`<div class="pmf-wait" data-state="err">${raw('<span class="pmf-wait-ico">' + PMF.icons.warn + '</span>')}<span class="pmf-wait-text"><span>None found on this network.</span><small>Make sure it is awake and on the same Wi-Fi, or enter a pairing code.</small></span></div>`);
      else list = '<div class="pmf-rows" role="radiogroup">' + found.map(function (s) { return str(row({ group: 'server', value: s.id, icon: s.kind === 'mac' ? 'laptop' : 'server', name: s.name, meta: s.addr + ' · ' + s.projects.length + ' Project' + (s.projects.length === 1 ? '' : 's') + (s.state === 'sleeping' ? ' · asleep' : ''), checked: d.server && d.server.id === s.id, end: s.state === 'ready' ? '<span class="pmf-badge is-ok">Ready</span>' : '<span class="pmf-badge is-muted">Asleep</span>' })); }).join('') + '</div>';
      return h`${heading('Where', 'Find your Puppet Master', 'Pick the one you set up before. This device will connect to it.')}
        ${raw(list)}
        <div class="pmf-actions"><button type="button" class="pmf-link" data-act="pair-code">Enter a pairing code instead</button><span class="pmf-note">·</span><button type="button" class="pmf-link" data-act="rescan">Look again</button></div>`;
    },
    onEnter: function (sec, d, tmp) { if (!tmp.found) OWN.discoverServers().then(function (r) { tmp.found = r.found; if (PMF.state.screen === 'connect') PMF.rerender(); }); },
    onPick: function (g, v) { var d = PMF.draft(); d.server = U.clone(D.servers[v]); d.paired = false; PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Connect', disabled: !d.server } }; },
    next: function () { return 'pair'; }
  };
  A.rescan = function () { PMF.state.tmp.found = null; PMF.rerender(); };
  A['pair-code'] = function () {
    PMF.sheet({ id: 'pair-code', kicker: 'Pairing code',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Enter the code shown on your Puppet Master</h3><p class="pmf-sub">On that computer, open Settings, then Devices, then Pair a device.</p></div><div class="pmf-field"><input class="pmf-input is-code" id="pmf-paircode" inputmode="numeric" maxlength="7" placeholder="000 000" autocomplete="one-time-code"></div><p class="pmf-hint">Or scan the QR code it shows with this device's camera.</p>`,
      foot: h`<span></span><button type="button" class="pmf-btn is-primary" data-act="pair-code-go">Connect</button>`,
      onMount: function (root) { var inp = U.$('#pmf-paircode', root); inp.addEventListener('input', function () { var v = inp.value.replace(/\D/g, '').slice(0, 6); inp.value = v.length > 3 ? v.slice(0, 3) + ' ' + v.slice(3) : v; }); }
    });
  };
  A['pair-code-go'] = function () { var v = (U.$('#pmf-paircode') || {}).value || ''; if (v.replace(/\D/g, '').length < 6) { var i = U.$('#pmf-paircode'); i.focus(); return; } var d = PMF.draft(); d.server = U.clone(D.servers.studio); d.server.via = 'code'; PMF.sheetClose(true); PMF.go('pair', 'fwd'); };

  SC.pair = {
    chapter: 'where', scene: 'connect',
    caption: function (d) { return [{ text: 'Trust is granted on ' + (d.server ? d.server.name : 'the Server') + ', not here.', primary: true }]; },
    render: function (d, tmp) {
      var s = d.server;
      if (tmp.pairDone) return h`${heading('Where', 'Connected to ' + s.name, 'This device can now use it. You can disconnect anytime from Settings.')}${wait({ state: 'ok', text: 'Paired and trusted', sub: s.addr + ' · Puppet Master ' + s.version })}`;
      return h`${heading('Where', 'Approve this device on ' + s.name, 'A code is showing there. Confirm it matches this one.')}
        <div class="pmf-code" id="pmf-pair-code">${tmp.pair ? tmp.pair.code : '···  ···'}</div>
        ${wait({ text: 'Waiting for approval on ' + s.name, sub: 'Nothing is shared until it approves.', id: 'pmf-pair-wait' })}`;
    },
    onEnter: function (sec, d, tmp) {
      if (tmp.pairDone) { return; }
      var p = OWN.pair(d.server); tmp.pair = p; var c = document.getElementById('pmf-pair-code'); if (c) c.textContent = p.code;
      PMF.setPrimary({ disabled: true });
      p.done.then(function () { if (PMF.state.screen !== 'pair') return; tmp.pairDone = true; d.paired = true; PMF.rerender(); PMF.announce('Connected to ' + d.server.name); });
    },
    foot: function (d, tmp) { return { primary: { label: 'Continue', disabled: !tmp.pairDone } }; },
    next: function () { return 'ready'; }
  };

  SC.ready = {
    chapter: 'where', scene: 'ready',
    caption: function (d) { return [{ text: (d.server ? d.server.name : 'Your Server') + ' does the work. This device is the remote.', primary: true }]; },
    render: function (d) {
      var s = d.server, projs = (s.projects || []).map(function (id) { return D.projects[id]; }).filter(Boolean);
      return h`${heading('Where', 'This device is ready to meet your Puppet Master', s.name + ' has ' + projs.length + ' Project' + (projs.length === 1 ? '' : 's') + '. Open one, or start something new there.')}
        <div class="pmf-rows">${raw(projs.map(function (p) { return str(row({ act: 'open-existing-project', value: p.id, icon: 'folder', name: p.name, meta: p.used + ' · ' + p.stack, static: true, end: '<span class="pmf-badge is-muted">Open</span>' })); }).join(''))}</div>
        <div class="pmf-options">${opt({ group: 'ready', value: 'new', icon: 'plus', name: 'Create a new Project on ' + s.name, desc: 'You will name it and choose how it begins.', checked: true })}</div>`;
    },
    onPick: function () { PMF.next(); },
    foot: function () { return { primary: { label: 'Create a Project' }, skip: { label: 'No Project for now', act: 'finish-no-project' } }; },
    next: function () { return 'begin'; }
  };
  A['open-existing-project'] = function (el) { var id = el.getAttribute('data-arg'); PMF.command('cmd.project.open', { project_id: id, host: (PMF.draft().server || {}).id }); PMF.receipt('project.open', 'ok', { project_id: id }); var d = PMF.draft(); d.committed = { project_id: id, opened: true }; PMF.go('power', 'fwd'); };
  A['finish-no-project'] = function () { var saved = PMF.store.read() || {}; saved.completed = true; saved.provider_done = true; PMF.store.write(saved); PMF.close('complete_no_project'); };

  // ---- 2b. set up another computer -----------------------------------------------------------
  SC.server = {
    chapter: 'where', scene: function (d) { return ['where', d]; },
    caption: function () { return [{ text: 'Install there first, then connect from here.', primary: true }]; },
    render: function (d) {
      return h`${heading('Where', 'Set up another computer', 'Puppet Master runs best on a computer that stays on. Two short steps.')}
        <div class="pmf-rows">
          ${row({ static: true, value: '1', icon: 'download', name: '1. Install Puppet Master on that computer', meta: 'Same installer you used here. Takes about a minute.', end: '<button type="button" class="pmf-btn is-small" data-act="copy-link">Copy install link</button>' })}
          ${row({ static: true, value: '2', icon: 'wifi', name: '2. Come back here and choose "A Puppet Master I already set up"', meta: 'This device will find it on your network.' })}
        </div>
        <div class="pmf-options">${opt({ group: 'server', value: 'restore', icon: 'shield', name: 'Restore a Server from a backup', desc: 'Bring back a Puppet Master you had before, with its Projects and settings.', compact: true, checked: false })}</div>`;
    },
    onPick: function (g, v) { if (v === 'restore') A['restore-server'](); },
    foot: function () { return { primary: { label: 'Use this computer for now', act: 'server-use-local' } }; }
  };
  A['copy-link'] = function (el) { try { navigator.clipboard && navigator.clipboard.writeText('https://puppetmaster.app/get'); } catch (e) {} el.textContent = 'Copied'; setTimeout(function () { el.textContent = 'Copy install link'; }, 1400); };
  A['server-use-local'] = function () { var d = PMF.draft(); d.where = 'local'; PMF.state.tmp.preflight = null; PMF.go('begin', 'fwd'); };
  A['restore-server'] = function () {
    PMF.sheet({ id: 'restore-server', kicker: 'Restore a Server',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Choose the backup to restore</h3><p class="pmf-sub">Restoring a Server happens on that computer after you install Puppet Master there. Pick the backup now so it is ready.</p></div>
        <div class="pmf-rows" role="radiogroup">${raw(D.backups.map(function (b) { return str(row({ act: 'restore-server-pick', value: b.id, icon: 'shield', name: b.name + ' · Server backup', meta: b.when + ' · ' + b.size + ' · from ' + b.from })); }).join(''))}</div>`,
      foot: h`<span class="pmf-note">The backup is only read, never changed.</span><span></span>`
    });
  };
  A['restore-server-pick'] = function (el) { U.$$('.pmf-row', el.parentNode).forEach(function (r) { r.setAttribute('aria-checked', r === el ? 'true' : 'false'); }); PMF.sheetFoot(h`<span class="pmf-note">Selected. Finish this on the other computer after installing.</span><button type="button" class="pmf-btn is-primary" data-act="sheet-close">Done</button>`); };

  // =============================================================================
  // 3. How the Project begins
  // =============================================================================
  SC.begin = {
    chapter: 'project', scene: function (d) { return [d.mode === 'existing' ? 'existing' : d.mode === 'restore' ? 'restore' : 'begin', d]; },
    caption: function (d) { return [{ text: 'A Project keeps one body of work together: files, plans, history.', primary: true }, { text: 'Work runs on ' + serverName(d) + '.' }]; },
    render: function (d) {
      return h`${heading('Project', 'How does your Project begin?', 'A Project is one workspace for one thing you are making.')}
      <div class="pmf-options" role="radiogroup">
        ${opt({ group: 'mode', value: 'new', icon: 'plus', name: 'Start something new', desc: 'An empty Project, ready for your first idea.', checked: d.mode === 'new' })}
        ${opt({ group: 'mode', value: 'existing', icon: 'folder', name: 'Use work that already exists', desc: 'A folder here, files stored online, or on another device.', checked: d.mode === 'existing' })}
        ${opt({ group: 'mode', value: 'restore', icon: 'shield', name: 'Restore a Project', desc: 'Bring back a Project from a backup.', checked: d.mode === 'restore' })}
      </div>`;
    },
    onPick: function (g, v) { var d = PMF.draft(); d.mode = v; if (v !== 'existing') d.source = null; PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Continue', disabled: !d.mode } }; },
    next: function (d) { return d.mode === 'new' ? 'name' : d.mode === 'existing' ? 'existing' : 'restore'; }
  };

  // ---- 3a. new: name + location -----------------------------------------------------------------
  SC.name = {
    chapter: 'project', scene: function (d) { return ['name', d]; },
    caption: function (d) { return [{ text: (d.name || 'Your Project') + ' will live on ' + serverName(d) + '.', primary: true }]; },
    render: function (d) {
      var path = d.path || suggestPath({ where: d.where, server: d.server, name: d.name || 'New Project' });
      return h`${heading('Project', 'Name your Project', 'Something you will recognize later. You can rename it anytime.')}
        <div class="pmf-field"><label class="pmf-label" for="pmf-name">Project name</label><input class="pmf-input" id="pmf-name" value="${d.name}" placeholder="Book club website" autocomplete="off" data-on-input="name-input" maxlength="60"><span class="pmf-hint" id="pmf-name-hint">${d.name ? '' : 'Try the thing you want to make, like "Book club website".'}</span></div>
        <div class="pmf-field"><span class="pmf-label">Where its files will live</span><div class="pmf-actions"><span class="pmf-path" id="pmf-path">${I('folder')}<code>${path}</code></span><button type="button" class="pmf-link" data-act="change-path">Change</button></div><span class="pmf-hint">Created only when you press Create Project at the end.</span></div>`;
    },
    foot: function (d) { return { primary: { label: 'Continue', disabled: !(d.name && d.name.trim().length >= 2) } }; },
    next: function (d) { var eligible = projectsAvailable().length > 0; return eligible ? 'like' : 'history'; }
  };
  A['name-input'] = function (el) { var d = PMF.draft(); d.name = el.value.slice(0, 60); if (!d.path_custom) { d.path = suggestPath(d); var p = U.$('#pmf-path code'); if (p) p.textContent = d.path; } var hint = U.$('#pmf-name-hint'); if (hint) hint.textContent = d.name.trim().length && d.name.trim().length < 2 ? 'A little longer, please.' : ''; PMF.setPrimary({ disabled: !(d.name.trim().length >= 2) }); PMF.persist(); };
  A['change-path'] = function () {
    var d = PMF.draft(); var choices = [suggestPath(d), '~/Documents/' + (d.name || 'New Project'), '~/Desktop/' + (d.name || 'New Project')];
    PMF.sheet({ id: 'path', kicker: 'Folder',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Where should the files live?</h3><p class="pmf-sub">A new folder with the Project's name will be created inside the place you pick.</p></div>
        <div class="pmf-rows" role="radiogroup">${raw(choices.map(function (c) { return str(row({ act: 'path-pick', value: c, icon: 'folder', name: c.replace(/^.*\//, ''), meta: c, checked: c === (d.path || choices[0]) })); }).join(''))}</div>`,
      foot: h`<span class="pmf-note">Nothing is created yet.</span><button type="button" class="pmf-btn is-primary" data-act="sheet-close">Use this folder</button>`
    });
  };
  A['path-pick'] = function (el) { var d = PMF.draft(); d.path = el.getAttribute('data-arg'); d.path_custom = d.path !== suggestPath(d); U.$$('.pmf-row', el.parentNode).forEach(function (r) { r.setAttribute('aria-checked', r === el ? 'true' : 'false'); }); var p = U.$('#pmf-path code'); if (p) p.textContent = d.path; PMF.persist(); };

  // ---- 3b. start like another Project (Settings Transfer) -------------------------------------
  SC.like = {
    chapter: 'project', scene: function (d) { return ['like', d]; },
    caption: function (d) { return [{ text: d.inherit ? 'Settings come from ' + D.projects[d.inherit].name + '. Files stay separate.' : 'A fresh start with Puppet Master defaults.', primary: true }]; },
    render: function (d, tmp) {
      var projs = projectsAvailable();
      return h`${heading('Project', 'Start like another Project?', 'Reuse a setup you already trust, or begin fresh.')}
        <div class="pmf-rows" role="radiogroup">
          ${row({ group: 'inherit', value: '', icon: 'sparkles', name: 'Start fresh', meta: 'Sensible defaults. Change anything later in Settings.', checked: !d.inherit, end: '<span class="pmf-badge">Default</span>' })}
          ${raw(projs.map(function (p) { return str(row({ group: 'inherit', value: p.id, icon: 'folder', name: 'Like ' + p.name, meta: p.used + ' · ' + p.stack, checked: d.inherit === p.id })); }).join(''))}
        </div>
        <div class="pmf-reveal" data-open="${d.inherit ? 'true' : 'false'}"><div><div class="pmf-plan" id="pmf-inherit-preview">${d.inherit && tmp.preview ? raw('<div class="pmf-plan-title">What carries over</div><p class="pmf-note" style="color:var(--text-primary)">' + U.esc(tmp.preview.summary) + '</p><div class="pmf-actions"><button type="button" class="pmf-link" data-act="choose-groups">Choose settings</button></div>') : raw('<div class="pmf-plan-title">Checking what can carry over</div>')}</div></div></div>`;
    },
    onEnter: function (sec, d, tmp) { if (d.inherit && !tmp.preview) loadPreview(d, tmp); },
    onPick: function (g, v) { var d = PMF.draft(), tmp = PMF.state.tmp; d.inherit = v || null; d.inherit_groups = null; tmp.preview = null; PMF.rerender(); if (d.inherit) loadPreview(d, tmp); },
    foot: function () { return { primary: { label: 'Continue' } }; },
    next: function () { return 'history'; }
  };
  function loadPreview(d, tmp) { OWN.transferPreview(d.inherit).then(function (r) { tmp.preview = r; if (PMF.state.screen === 'like' && d.inherit) PMF.rerender(); }); }
  A['choose-groups'] = function () {
    var d = PMF.draft(), groups = d.inherit_groups || U.clone(D.transfer_groups);
    PMF.sheet({ id: 'groups', kicker: 'Settings to reuse',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Which settings should carry over?</h3><p class="pmf-sub">From ${D.projects[d.inherit].name}. Your new Project's own choices always win over these.</p></div>
        <div class="pmf-options" id="pmf-groups">${raw(groups.map(function (g) { return str(toggle({ act: 'group-toggle', value: g.id, on: g.on, name: g.name, desc: g.id === 'providers' ? 'Which AI accounts do the work. Sign-ins are never copied, only the choice.' : g.id === 'permissions' ? 'What the work may change without asking you.' : g.id === 'planning' ? 'How detailed plans are and when to ask you.' : g.id === 'appearance' ? 'Theme and layout. Usually personal, so off by default.' : 'Defaults for this area.' })); }).join(''))}</div>`,
      foot: h`<span></span><button type="button" class="pmf-btn is-primary" data-act="sheet-close">Done</button>`
    });
    d.inherit_groups = groups;
  };
  A['group-toggle'] = function (el) { var d = PMF.draft(); var id = el.getAttribute('data-arg'); var g = (d.inherit_groups || []).filter(function (x) { return x.id === id; })[0]; if (!g) return; g.on = !g.on; el.setAttribute('aria-checked', g.on ? 'true' : 'false'); PMF.persist(); };

  // ---- 3c. history + online copy ------------------------------------------------------------------
  SC.history = {
    chapter: 'project', scene: function (d) { return ['history', d]; },
    caption: function (d) { var c = [{ text: d.history ? 'Every version is kept, so you can go back.' : 'No history. Changes cannot be undone later.', primary: true }]; if (d.online) c.push({ text: 'A copy stays on ' + PMF.hostName(d.online_host) + (d.online_account ? ' as ' + d.online_account : '') + '.' }); return c; },
    render: function (d, tmp) {
      var host = D.hosts.filter(function (x) { return x.id === d.online_host; })[0] || D.hosts[0];
      return h`${heading('Project', 'Keep a history of changes?', 'Puppet Master remembers each version of your files, so you can always go back.')}
        <div class="pmf-options">
          ${toggle({ act: 'history-toggle', on: d.history, name: 'Keep history on ' + serverName(d), badge: 'Recommended', desc: 'Uses a little disk space. Nothing leaves your computer.' })}
          ${toggle({ act: 'online-toggle', on: d.online, name: 'Also keep a copy online', desc: 'Handy for sharing or working from another computer. Optional.' })}
        </div>
        <div class="pmf-reveal" data-open="${d.online ? 'true' : 'false'}"><div><div class="pmf-plan">
          <div class="pmf-plan-title">Where the online copy lives</div>
          <div class="pmf-actions">${raw(D.hosts.filter(function (x) { return x.popular; }).map(function (x) { return '<button type="button" class="pmf-btn is-small ' + (x.id === d.online_host ? 'is-primary' : '') + '" data-act="host-pick" data-arg="' + x.id + '">' + U.esc(x.name) + '</button>'; }).join(''))}<button type="button" class="pmf-link" data-act="host-more">More services</button></div>
          <div id="pmf-online-auth">${d.online_account ? wait({ state: 'ok', text: 'Signed in to ' + host.name + ' as ' + d.online_account, sub: 'The online copy is created only at the end, when you press Create Project.' }) : raw('<div class="pmf-actions"><button type="button" class="pmf-btn" data-act="host-signin">' + PMF.icons.external + '<span>Sign in to ' + U.esc(host.name) + '</span></button><button type="button" class="pmf-link" data-act="host-create">I need an account</button></div><p class="pmf-note">' + U.esc(host.name) + ' is a free service that stores copies of Projects online.</p>')}</div>
        </div></div></div>`;
    },
    foot: function (d) { return { primary: { label: 'Review', disabled: d.online && !d.online_account } }; },
    next: function () { return 'review'; }
  };
  A['history-toggle'] = function () { var d = PMF.draft(); d.history = !d.history; if (!d.history) { d.online = false; } PMF.rerender(); };
  A['online-toggle'] = function () { var d = PMF.draft(); d.online = !d.online; if (d.online) d.history = true; PMF.rerender(); };
  A['host-pick'] = function (el) { var d = PMF.draft(); var v = el.getAttribute('data-arg'); if (d.online_host !== v) { d.online_host = v; d.online_account = null; } PMF.sheetClose(true); PMF.rerender(); };
  A['host-more'] = function () { PMF.sheet({ id: 'hosts', kicker: 'Online services', body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Choose a service</h3><p class="pmf-sub">All of these store a copy of your files online and track changes.</p></div><div class="pmf-rows">${raw(D.hosts.map(function (x) { return str(row({ act: 'host-pick', value: x.id, icon: 'globe', name: x.name, meta: x.url, checked: x.id === PMF.draft().online_host })); }).join(''))}</div>` }); };
  A['host-create'] = function () { var d = PMF.draft(); var host = D.hosts.filter(function (x) { return x.id === d.online_host; })[0]; PMF.sheet({ id: 'host-create', kicker: 'New account', body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Create a ${host.name} account</h3><p class="pmf-sub">Your browser opens ${host.url}. Make the account there, then come back here and sign in. It takes about a minute.</p></div><div class="pmf-rows">${row({ static: true, value: '', icon: 'external', name: 'Open ' + host.url + ' in your browser', meta: 'Choose the free plan. You only need a username and password.' })}${row({ static: true, value: '', icon: 'back', name: 'Come back to Puppet Master', meta: 'Then press Sign in. Puppet Master never sees your password.' })}</div>`, foot: h`<span></span><button type="button" class="pmf-btn is-primary" data-act="host-signin">${I('external')}<span>I made one, sign in</span></button>` }); };
  A['host-signin'] = function () { signInHost(function () { PMF.rerender(); }); };
  function signInHost(done) {
    var d = PMF.draft(); var host = D.hosts.filter(function (x) { return x.id === d.online_host; })[0] || D.hosts[0];
    var op = OWN.signInHost(host);
    PMF.sheet({ id: 'signin', kicker: 'Sign in',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Finish signing in to ${host.name}</h3><p class="pmf-sub">Your browser opened ${host.url}. Approve Puppet Master there and this page will continue by itself.</p></div>
        ${wait({ id: 'pmf-signin-wait', text: 'Waiting for ' + host.name, sub: 'Puppet Master never sees your password. Only permission to read and create your Projects.' })}
        <div class="pmf-plan"><div class="pmf-plan-title">Browser did not open?</div><div class="pmf-actions"><button type="button" class="pmf-btn is-small" data-act="noop">${I('external')}<span>Open it again</span></button><span class="pmf-note">or enter this code at ${host.url}/login/device:</span><span class="pmf-badge is-muted" style="font-family:ui-monospace,monospace;letter-spacing:.1em">${op.device_code}</span></div></div>`,
      foot: h`<span class="pmf-note">You can close this and sign in later.</span><span></span>`
    });
    op.done.then(function (r) { if (!PMF.state.open) return; d.online_account = r.account; PMF.sheetBody(h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Signed in as ${r.account}</h3><p class="pmf-sub">Puppet Master can now create the online copy when you press Create Project.</p></div>${wait({ state: 'ok', text: 'Connected to ' + host.name, sub: 'Sign-in is kept safely by your computer, not in Puppet Master settings.' })}`); PMF.sheetFoot(h`<span></span><button type="button" class="pmf-btn is-primary" data-act="signin-done">Continue</button>`); PMF.state.tmp.afterSignin = done; });
  }
  A['signin-done'] = function () { var f = PMF.state.tmp.afterSignin; PMF.sheetClose(true); if (f) f(); };
  A.noop = function () {};

  // ---- 3d. existing work --------------------------------------------------------------------------
  SC.existing = {
    chapter: 'project', scene: function (d) { return ['existing', d]; },
    caption: function (d) { return [{ text: d.source === 'nas' ? 'Files stay on the device. Puppet Master works with them there.' : d.source === 'online' ? 'Files come from the online copy. It stays the source of truth.' : 'Files stay where they are. Puppet Master works alongside them.', primary: true }]; },
    render: function (d) {
      return h`${heading('Project', 'Where is the work now?', 'Puppet Master will use it in place. Nothing is moved.')}
        <div class="pmf-options" role="radiogroup">
          ${opt({ group: 'source', value: 'folder', icon: 'folder', name: 'In a folder on ' + serverName(d), desc: 'Pick the folder. We check for an existing history.', checked: d.source === 'folder' })}
          ${opt({ group: 'source', value: 'online', icon: 'cloud', name: 'Stored online', desc: 'GitHub, GitLab, and similar services. You will sign in.', checked: d.source === 'online' })}
          ${opt({ group: 'source', value: 'nas', icon: 'server', name: 'On another computer or storage device', desc: 'A NAS, a home server, or a shared drive.', checked: d.source === 'nas' })}
        </div>`;
    },
    onPick: function (g, v) { var d = PMF.draft(); d.source = v; PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Continue', disabled: !d.source } }; },
    next: function (d) { return d.source === 'folder' ? 'existing-folder' : d.source === 'online' ? 'existing-online' : 'existing-nas'; }
  };

  SC['existing-folder'] = {
    chapter: 'project', scene: function (d) { return ['existing', d]; },
    caption: function (d) { return [{ text: d.folder ? d.folder.path : 'Pick the folder that holds the work.', primary: true }]; },
    render: function (d) {
      return h`${heading('Project', 'Pick the folder', 'Recent folders on ' + serverName(d) + '. Or browse for another one.')}
        <div class="pmf-rows" role="radiogroup">${raw(D.folders.map(function (f) { return str(row({ group: 'folder', value: f.path, icon: 'folder', name: f.path.replace(/^.*\//, ''), meta: f.path + ' · ' + f.meta, checked: d.folder && d.folder.path === f.path, end: f.history ? '<span class="pmf-badge is-ok">Has history</span>' : '' })); }).join(''))}</div>
        <div class="pmf-actions"><button type="button" class="pmf-link" data-act="browse-folder">Browse for a folder</button></div>
        ${d.folder ? wait({ state: 'ok', text: d.folder.history ? 'This folder already has a change history. Puppet Master will continue it.' : 'No history yet. Puppet Master will start one when you add the Project.', sub: d.folder.meta }) : ''}`;
    },
    onPick: function (g, v) { var d = PMF.draft(); d.folder = U.clone(D.folders.filter(function (f) { return f.path === v; })[0]); d.has_history = !!(d.folder && d.folder.history); d.name = d.folder.path.replace(/^.*\//, ''); d.path = d.folder.path; PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Review', disabled: !d.folder } }; },
    next: function () { return 'review'; }
  };
  A['browse-folder'] = function () { PMF.sheet({ id: 'browse', kicker: 'Browse', body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Choose a folder</h3><p class="pmf-sub">Your system's folder picker opens here in the real app.</p></div><div class="pmf-rows">${raw(['~/Documents', '~/Desktop', '~/dev', '~/projects'].map(function (p) { return str(row({ act: 'browse-pick', value: p + '/Book Club Site', icon: 'folder', name: p, meta: 'Open' })); }).join(''))}</div>` }); };
  A['browse-pick'] = function (el) { var d = PMF.draft(); var p = el.getAttribute('data-arg'); d.folder = { path: p, meta: '32 files · no history yet', history: false }; d.has_history = false; d.name = p.replace(/^.*\//, ''); d.path = p; PMF.sheetClose(true); PMF.rerender(); };

  SC['existing-online'] = {
    chapter: 'project', scene: function (d) { return ['existing', d]; },
    caption: function (d) { return [{ text: d.repo ? d.repo.name + ' from ' + PMF.hostName(d.online_host) : 'Sign in, then pick the Project.', primary: true }]; },
    render: function (d, tmp) {
      var host = D.hosts.filter(function (x) { return x.id === d.online_host; })[0] || D.hosts[0];
      var body;
      if (!d.online_account) body = h`<div class="pmf-plan"><div class="pmf-plan-title">Which service holds it?</div><div class="pmf-actions">${raw(D.hosts.map(function (x) { return '<button type="button" class="pmf-btn is-small ' + (x.id === d.online_host ? 'is-primary' : '') + '" data-act="host-pick" data-arg="' + x.id + '">' + U.esc(x.name) + '</button>'; }).join(''))}</div></div>
        <div class="pmf-actions"><button type="button" class="pmf-btn" data-act="host-signin-repos">${I('external')}<span>Sign in to ${host.name}</span></button><button type="button" class="pmf-link" data-act="host-create">I need an account</button></div><p class="pmf-note">Signing in only lets Puppet Master see your list of Projects. It does not open the AI provider setup. That comes later.</p>`;
      else if (!tmp.repos) body = wait({ text: 'Reading your Projects on ' + host.name, sub: 'Signed in as ' + d.online_account });
      else body = h`<div class="pmf-rows" role="radiogroup">${raw(tmp.repos.map(function (r) { return str(row({ group: 'repo', value: r.id, icon: 'cloud', name: r.name, meta: r.meta + ' · ' + r.files + ' files', checked: d.repo && d.repo.id === r.id })); }).join(''))}</div><p class="pmf-note">Signed in to ${host.name} as ${d.online_account}. A copy of the files is made on ${serverName(d)} when you add the Project.</p>`;
      return h`${heading('Project', 'Bring in a Project stored online', 'Pick the one to use. The online copy keeps tracking changes.')}${body}`;
    },
    onEnter: function (sec, d, tmp) { if (d.online_account && !tmp.repos) OWN.listRepos(D.hosts.filter(function (x) { return x.id === d.online_host; })[0]).then(function (r) { tmp.repos = r.repos; if (PMF.state.screen === 'existing-online') PMF.rerender(); }); },
    onPick: function (g, v) { var d = PMF.draft(), tmp = PMF.state.tmp; d.repo = U.clone((tmp.repos || []).filter(function (r) { return r.id === v; })[0]); d.has_history = true; d.name = d.repo.name; d.path = suggestPath(d); d.online = true; PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Review', disabled: !d.repo } }; },
    next: function () { return 'review'; }
  };
  A['host-signin-repos'] = function () { signInHost(function () { PMF.state.tmp.repos = null; PMF.rerender(); }); };

  SC['existing-nas'] = {
    chapter: 'project', scene: function (d) { return ['existing', d]; },
    caption: function (d) { return [{ text: d.nas_device ? d.nas_device.name + (d.nas_connected ? ' · connected, no password needed' : '') : 'SSH is the safest way to reach another device.', primary: true }]; },
    render: function (d, tmp) {
      var step;
      if (!d.nas_device) {
        var found = tmp.nas;
        step = h`<div class="pmf-plan"><div class="pmf-plan-title">How to connect</div><div class="pmf-rows" role="radiogroup">${raw(D.nas_methods.map(function (m) { return str(row({ group: 'nas_method', value: m.id, icon: m.id === 'ssh' ? 'lock' : 'server', name: m.name, meta: m.desc, checked: d.nas_method === m.id, end: m.rec ? '<span class="pmf-badge">Recommended</span>' : '' })); }).join(''))}</div></div>
          <div class="pmf-plan"><div class="pmf-plan-title">Which device</div>${found ? raw('<div class="pmf-rows" role="radiogroup">' + found.map(function (n) { return str(row({ group: 'nas_device', value: n.id, icon: 'server', name: n.name, meta: n.kind + ' · ' + n.addr, checked: false })); }).join('') + '</div>') : wait({ text: 'Looking for devices on your network', sub: 'Devices only show up if they allow it. You can always type an address.' })}<div class="pmf-actions"><button type="button" class="pmf-link" data-act="nas-address">Type its name or address</button></div></div>`;
      } else if (!d.nas_connected) {
        step = h`<div class="pmf-plan"><div class="pmf-plan-title">Connect securely to ${d.nas_device.name}</div><p class="pmf-note" style="color:var(--text-primary)">Puppet Master creates a secure key for this computer and installs it on ${d.nas_device.name}. You enter the device's password once. After that, no passwords.</p>
          <div class="pmf-field"><label class="pmf-label" for="pmf-nas-pass">Password for ${d.nas_device.user} on ${d.nas_device.name}</label><input class="pmf-input" id="pmf-nas-pass" type="password" autocomplete="current-password" placeholder="Used once, never stored"></div>
          <div class="pmf-actions"><button type="button" class="pmf-btn is-primary" data-act="nas-connect">${I('lock')}<span>Connect</span></button><button type="button" class="pmf-link" data-act="nas-change">Different device</button></div>
          <div id="pmf-nas-phases"></div></div>`;
      } else {
        step = h`${wait({ state: 'ok', text: 'Connected to ' + d.nas_device.name + '. No password needed from now on.', sub: 'Device ID ' + (tmp.fingerprint || d.nas_fingerprint || '') + '. Compare it with the device if you want to be sure.' })}
          <div class="pmf-plan"><div class="pmf-plan-title">Which folder holds the work</div><div class="pmf-rows" role="radiogroup">${raw(D.nas_folders.map(function (f) { return str(row({ group: 'nas_folder', value: f.path, icon: 'folder', name: f.path.replace(/^.*\//, ''), meta: f.path + ' · ' + f.meta, checked: d.nas_folder && d.nas_folder.path === f.path })); }).join(''))}</div></div>`;
      }
      return h`${heading('Project', 'Use files on another device', 'For a NAS, a home server, or a shared drive. Files stay there.')}${step}`;
    },
    onEnter: function (sec, d, tmp) { if (!d.nas_device && !tmp.nas) OWN.discoverNas().then(function (r) { tmp.nas = r.found; if (PMF.state.screen === 'existing-nas') PMF.rerender(); }); },
    onPick: function (g, v) { var d = PMF.draft(); if (g === 'nas_method') d.nas_method = v; if (g === 'nas_device') { d.nas_device = U.clone(D.nas_devices.filter(function (n) { return n.id === v; })[0]); d.nas_connected = false; } if (g === 'nas_folder') { d.nas_folder = U.clone(D.nas_folders.filter(function (f) { return f.path === v; })[0]); d.has_history = /history/.test(d.nas_folder.meta) && !/no history/.test(d.nas_folder.meta); d.name = d.nas_folder.path.replace(/^.*\//, ''); d.path = d.nas_device.name + ':' + d.nas_folder.path; } PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Review', disabled: !(d.nas_connected && d.nas_folder) } }; },
    next: function () { return 'review'; }
  };
  A['nas-address'] = function () { PMF.sheet({ id: 'nas-addr', kicker: 'Device address', body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Type the device's name or address</h3><p class="pmf-sub">Usually shown in the device's own settings, like <strong>mynas.local</strong> or <strong>192.168.1.40</strong>.</p></div><div class="pmf-field"><input class="pmf-input" id="pmf-nas-addr" placeholder="mynas.local" autocomplete="off"></div><div class="pmf-field"><label class="pmf-label" for="pmf-nas-user">User name on the device</label><input class="pmf-input" id="pmf-nas-user" placeholder="admin" autocomplete="off"></div>`, foot: h`<span></span><button type="button" class="pmf-btn is-primary" data-act="nas-address-go">Continue</button>` }); };
  A['nas-address-go'] = function () { var a = (U.$('#pmf-nas-addr') || {}).value || '', u = (U.$('#pmf-nas-user') || {}).value || 'admin'; if (!a.trim()) { U.$('#pmf-nas-addr').focus(); return; } var d = PMF.draft(); d.nas_device = { id: 'manual', name: a.trim().replace(/\..*$/, ''), addr: a.trim(), kind: 'Device', user: u.trim() || 'admin' }; d.nas_connected = false; PMF.sheetClose(true); PMF.rerender(); };
  A['nas-change'] = function () { var d = PMF.draft(); d.nas_device = null; d.nas_connected = false; PMF.state.tmp.nas = null; PMF.rerender(); };
  A['nas-connect'] = function (el) {
    var d = PMF.draft(), tmp = PMF.state.tmp; var pass = (U.$('#pmf-nas-pass') || {}).value || '';
    var op = OWN.sshConnect(d.nas_device, pass);
    PMF.patch('#pmf-nas-phases', phases(op.phases, 'pmf-ssh-phases')); el.setAttribute('aria-disabled', 'true');
    op.run(function (i, s, msg) { setPhase('pmf-ssh-phases', i, s, msg); }).then(function (r) { d.nas_connected = true; d.nas_fingerprint = r.fingerprint; tmp.fingerprint = r.fingerprint; var inp = U.$('#pmf-nas-pass'); if (inp) inp.value = ''; setTimeout(function () { PMF.rerender(); }, 500); }, function () { el.setAttribute('aria-disabled', 'false'); var host = document.getElementById('pmf-ssh-phases'); if (host) host.insertAdjacentHTML('beforeend', '<p class="pmf-hint is-err">Check the password and try again. Nothing was changed on ' + U.esc(d.nas_device.name) + '.</p>'); });
  };

  // ---- 3e. restore ---------------------------------------------------------------------------------
  SC.restore = {
    chapter: 'project', scene: function (d) { return ['restore', d]; },
    caption: function (d) { return [{ text: d.backup ? d.backup.name + ' from ' + d.backup.when : 'Backups are only read. The original stays untouched.', primary: true }]; },
    render: function (d) {
      return h`${heading('Project', 'Restore a Project', 'Pick the backup to bring back. The backup itself is never changed.')}
        <div class="pmf-rows" role="radiogroup">${raw(D.backups.map(function (b) { return str(row({ group: 'backup', value: b.id, icon: 'shield', name: b.name, meta: b.when + ' · ' + b.size + ' · from ' + b.from, checked: d.backup && d.backup.id === b.id })); }).join(''))}</div>
        <div class="pmf-actions"><button type="button" class="pmf-link" data-act="browse-backup">Choose a backup file</button></div>`;
    },
    onPick: function (g, v) { var d = PMF.draft(); d.backup = U.clone(D.backups.filter(function (b) { return b.id === v; })[0]); d.name = d.backup.name; d.path = suggestPath(d); d.history = true; PMF.rerender(); },
    foot: function (d) { return { primary: { label: 'Review', disabled: !d.backup } }; },
    next: function () { return 'review'; }
  };
  A['browse-backup'] = A['browse-folder'];

  // =============================================================================
  // 4. Review, then the one commit
  // =============================================================================
  function commitLabel(d) { return d.mode === 'restore' ? 'Restore Project' : d.mode === 'existing' ? 'Add Project' : 'Create Project'; }
  SC.review = {
    chapter: 'review', scene: function (d) { return ['review', d]; },
    caption: function (d) { return [{ text: 'Nothing has been created yet.', primary: true }, { text: 'Press ' + commitLabel(d) + ' to make it real.' }]; },
    render: function (d) {
      var rows = [];
      rows.push(['Name', d.name || '(no name yet)', 'name']);
      rows.push(['Files', d.mode === 'existing' && d.source === 'online' ? ('Copied from ' + PMF.hostName(d.online_host) + ' into ' + (d.path || suggestPath(d))) : (d.path || suggestPath(d)), d.mode === 'new' ? 'name' : d.mode === 'existing' ? (d.source === 'folder' ? 'existing-folder' : d.source === 'online' ? 'existing-online' : 'existing-nas') : 'restore']);
      rows.push(['Work runs on', serverName(d) + (d.where === 'remote' ? ' (your Puppet Master)' : ''), 'where']);
      if (d.mode === 'new') rows.push(['Starts', d.inherit ? 'Like ' + D.projects[d.inherit].name + ' (settings only)' : 'Fresh, with defaults', projectsAvailable().length ? 'like' : null]);
      if (d.mode === 'new') rows.push(['History', d.history ? ('Kept on ' + serverName(d) + (d.online ? ', plus a copy on ' + PMF.hostName(d.online_host) + ' as ' + d.online_account : '')) : 'Not kept', 'history']);
      if (d.mode === 'existing') rows.push(['History', d.has_history ? 'Continues the existing history' : 'Starts a new history', null]);
      if (d.mode === 'restore') rows.push(['From backup', d.backup.when + ' · ' + d.backup.from, 'restore']);
      var plan = [];
      if (d.mode === 'new') { plan.push('Create the folder ' + (d.path || suggestPath(d))); if (d.history) plan.push('Start a change history in it'); if (d.inherit) plan.push('Copy the chosen settings from ' + D.projects[d.inherit].name); if (d.online) plan.push('Create the online copy on ' + PMF.hostName(d.online_host)); }
      if (d.mode === 'existing') { if (d.source === 'online') plan.push('Copy the files from ' + PMF.hostName(d.online_host) + ' to ' + serverName(d)); if (d.source === 'nas') plan.push('Connect the folder on ' + d.nas_device.name); if (d.source === 'folder') plan.push('Read the folder. Files are not moved.'); if (!d.has_history) plan.push('Start a change history'); }
      if (d.mode === 'restore') { plan.push('Read the backup from ' + d.backup.from); plan.push('Restore files and settings to ' + (d.path || suggestPath(d))); }
      plan.push('Add the Project to Puppet Master');
      return h`${heading('Review', 'Here is your Project', 'Check it over. Nothing is created until you press ' + commitLabel(d) + '.')}
        <div class="pmf-review">${raw(rows.map(function (r) { return '<div class="pmf-review-row"><span class="pmf-review-k">' + U.esc(r[0]) + '</span><span class="pmf-review-v">' + U.esc(r[1]) + '</span>' + (r[2] ? '<button type="button" class="pmf-link pmf-review-edit" data-act="goto" data-arg="' + r[2] + '">Edit</button>' : '<span></span>') + '</div>'; }).join(''))}</div>
        <div class="pmf-plan"><div class="pmf-plan-title">When you press ${commitLabel(d)}</div><ol>${raw(plan.map(function (p) { return '<li>' + U.esc(p) + '</li>'; }).join(''))}</ol></div>`;
    },
    foot: function (d) { return { primary: { label: commitLabel(d), act: 'commit', icon: 'check' } }; }
  };
  A.commit = function () { PMF.go('commit', 'fwd'); };

  SC.commit = {
    chapter: 'review', scene: function (d) { return ['commit', d]; },
    caption: function (d) { return [{ text: d.committed ? 'Your Project exists.' : 'Creating. Each step is real and reported as it happens.', primary: true }]; },
    render: function (d, tmp) {
      if (d.committed) return h`${heading('Review', d.name + ' is ready', 'Your Project exists. Next, choose what powers the work.')}
        <div class="pmf-success">${raw('<span class="pmf-success-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10.5"/><path d="M7 12.5l3.2 3.2L17 9"/></svg></span>')}<div class="pmf-success-text"><b>${commitLabel(d).replace(' Project', 'd') + ' on ' + serverName(d)}</b><span>${d.mode === 'new' ? 'Folder, history' + (d.online && !d.online_skipped ? ', online copy' : '') + (d.inherit ? ', copied settings' : '') + ' and Project record are in place.' : d.mode === 'existing' ? 'Your files are untouched. Puppet Master now works alongside them.' : 'Files and settings are back where they were.'}</span><span class="pmf-receipt">Receipt ${d.committed.receipt_id}</span></div></div>
        <div id="pmf-commit-phases"></div>`;
      return h`${heading('Review', (d.mode === 'restore' ? 'Restoring ' : d.mode === 'existing' ? 'Adding ' : 'Creating ') + (d.name || 'your Project'), 'A few steps. This is the only time anything is created.')}<div id="pmf-commit-host"></div><div id="pmf-commit-msg"></div>`;
    },
    onEnter: function (sec, d, tmp) {
      if (d.committed) { PMF.art.setDim(0); return; }
      d.commit_attempts += 1;
      var op = OWN.commitProject(d, d.commit_attempts);
      PMF.patch('#pmf-commit-host', phases(op.phases, 'pmf-commit-phases'));
      PMF.setPrimary({ disabled: true });
      PMF.art.setDim(.55);
      op.run(function (i, s, msg) { setPhase('pmf-commit-phases', i, s, msg); if (s === 'failed') PMF.art.setDim(.3); }).then(function (r) {
        d.committed = { project_id: r.project_id, receipt_id: r.receipt.receipt_id, at: r.receipt.at }; d.provider_done = false;
        try { window.PM_ACTIVE_PROJECT_ID = r.project_id; } catch (e) {}
        PMF.persist(); PMF.announce(d.name + ' created');
        var host = document.getElementById('pmf-commit-phases'); if (host) host.classList.add('is-settled');
        PMF.art.celebrate();
        setTimeout(function () { if (PMF.state.screen === 'commit') PMF.rerender(); }, 900);
      }, function (err) {
        var msg = document.getElementById('pmf-commit-msg'); if (msg) msg.innerHTML = '<p class="pmf-hint is-err">The step "' + U.esc(op.phases[err.index].label) + '" did not finish. Everything before it is done and kept. Nothing is half-made.</p>';
        PMF.state.tmp.failedPhase = err.phase;
        renderRetryFoot();
      });
    },
    foot: function (d) { return d.committed ? { back: false, primary: { label: 'Continue' } } : { back: false, primary: { label: 'Working', disabled: true, icon: false } }; },
    next: function () { return 'power'; }
  };
  function renderRetryFoot() { var f = U.$('#pmf-foot .pmf-foot-right'); if (f) f.innerHTML = '<button type="button" class="pmf-btn" data-act="commit-skip-part">Skip this part</button><button type="button" class="pmf-btn is-primary" data-act="commit-retry">' + PMF.icons.refresh + '<span class="pmf-btn-label">Try again</span></button>'; var l = U.$('#pmf-foot .pmf-foot-left'); if (l) l.innerHTML = '<button type="button" class="pmf-btn is-ghost" data-act="back">' + PMF.icons.back + '<span>Back</span></button>'; }
  A['commit-retry'] = function () { PMF.rerender(); };
  A['commit-skip-part'] = function () { var d = PMF.draft(); if (PMF.state.tmp.failedPhase === 'remote') { d.online = false; d.online_skipped = true; } PMF.rerender(); };

  // =============================================================================
  // 5. Power: choose an AI account
  // =============================================================================
  SC.power = {
    chapter: 'power', scene: function (d) { return ['power', d]; },
    caption: function (d) { var n = Object.keys(d.providers).filter(function (k) { return d.providers[k].state === 'ready'; }).length; return [{ text: n ? n + ' account' + (n === 1 ? '' : 's') + ' ready to power the work.' : 'One account is enough to start. Add more later.', primary: true }]; },
    render: function (d, tmp) {
      if (!tmp.detected) return h`${heading('Power', 'Choose what powers Puppet Master', 'Use an AI subscription or API account you already have. You can add more later.')}${wait({ text: 'Checking for accounts already on ' + serverName(d), sub: 'Only likely products are checked, and results are remembered.' })}`;
      var ready = D.providers.filter(function (p) { return (d.providers[p.id] || {}).state === 'ready'; });
      var rest = D.providers.filter(function (p) { return (d.providers[p.id] || {}).state !== 'ready'; });
      var likely = rest.filter(function (p) { return p.likely || (tmp.states[p.id] || {}).state === 'signed_out'; });
      var more = rest.filter(function (p) { return likely.indexOf(p) < 0; });
      var showAll = tmp.showAll;
      var tile = function (p) {
        var st = d.providers[p.id] || tmp.states[p.id] || { state: 'signed_out' };
        var act = '', meta = st.detail || p.bill;
        if (st.state === 'ready') act = '<span class="pmf-badge is-ok">Ready</span>';
        else if (st.state === 'busy') act = '<span class="pmf-spinner" style="border-color:var(--border);border-top-color:var(--accent-primary)"></span>';
        else if (st.state === 'missing_cli') act = '<button type="button" class="pmf-btn is-small" data-act="prov-install" data-arg="' + p.id + '">' + PMF.icons.download + '<span>Install</span></button>';
        else if (p.kind === 'key') act = '<button type="button" class="pmf-btn is-small" data-act="prov-key" data-arg="' + p.id + '">' + PMF.icons.key + '<span>Enter API key</span></button>';
        else act = '<button type="button" class="pmf-btn is-small" data-act="prov-signin" data-arg="' + p.id + '">' + PMF.icons.external + '<span>Sign in</span></button>';
        return '<div class="pmf-tile" data-state="' + st.state + '" data-provider="' + p.id + '">' + str(mono(p)) + '<span class="pmf-tile-name">' + U.esc(p.name) + '</span><span class="pmf-tile-meta">' + U.esc(meta) + '</span><div class="pmf-tile-act"><span class="pmf-tile-bill">' + U.esc(st.state === 'ready' ? p.bill : (p.family ? 'Separate from ' + (D.providers.filter(function (x) { return x.id === p.family; })[0] || {}).name : '')) + '</span>' + act + '</div></div>';
      };
      return h`${heading('Power', ready.length ? 'Ready to go' : 'Choose what powers Puppet Master', ready.length ? 'These accounts were found on ' + serverName(d) + ' and are ready. Add another if you like.' : 'Use an AI subscription or API account you already have. You can add more later.')}
        ${ready.length ? raw('<div class="pmf-tiles">' + ready.map(tile).join('') + '</div>') : ''}
        ${ready.length ? raw('<div class="pmf-plan-title">' + (showAll ? 'All providers' : 'Add another account') + '</div>') : ''}
        <div class="pmf-tiles" id="pmf-tiles">${raw((showAll ? rest : likely).map(tile).join(''))}</div>
        ${!showAll && more.length ? raw('<div class="pmf-actions"><button type="button" class="pmf-link" data-act="prov-all">See all providers (' + more.length + ' more)</button></div>') : ''}
        <p class="pmf-note">A subscription and an API account from the same company are listed separately because they bill differently. Puppet Master never sees your passwords.</p>`;
    },
    onEnter: function (sec, d, tmp) { if (!tmp.detected) OWN.detectProviders(d.where === 'remote' && d.server ? d.server.id : 'local').then(function (r) { tmp.detected = true; tmp.states = r.states; Object.keys(r.states).forEach(function (k) { if (r.states[k].state === 'ready' && !d.providers[k]) d.providers[k] = { state: 'ready', detail: r.states[k].detail, auto: true }; }); d.power_ready = Object.keys(d.providers).some(function (k) { return d.providers[k].state === 'ready'; }); if (PMF.state.screen === 'power') PMF.rerender(); }); },
    foot: function (d, tmp) { var ready = Object.keys(d.providers).some(function (k) { return d.providers[k].state === 'ready'; }); return { back: false, primary: { label: 'Continue', disabled: !tmp.detected }, skip: ready ? null : { label: 'Skip for now', act: 'power-skip' } }; },
    next: function () { return 'free'; }
  };
  A['power-skip'] = function () { PMF.command('ui.onboarding.skip_provider', {}); PMF.go('free', 'fwd'); };
  A['prov-all'] = function () { PMF.state.tmp.showAll = true; PMF.rerender(); };
  function prov(id) { return D.providers.filter(function (p) { return p.id === id; })[0]; }
  function setProv(id, st) { var d = PMF.draft(); d.providers[id] = st; d.power_ready = Object.keys(d.providers).some(function (k) { return d.providers[k].state === 'ready'; }); PMF.persist(); }
  A['prov-signin'] = function (el) {
    var p = prov(el.getAttribute('data-arg')), d = PMF.draft();
    PMF.sheet({ id: 'prov-signin', kicker: 'Sign in',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Sign in to ${p.name}</h3><p class="pmf-sub">Your browser opened the ${p.name} sign-in page. Approve Puppet Master there and this page continues by itself.</p></div>${wait({ id: 'pmf-prov-wait', text: 'Waiting for ' + p.name, sub: (d.where === 'remote' ? 'Signing in on ' + serverName(d) + ', through this device.' : 'Puppet Master never sees your password.') })}<div class="pmf-plan"><div class="pmf-plan-title">Browser did not open?</div><div class="pmf-actions"><button type="button" class="pmf-btn is-small" data-act="noop">${I('external')}<span>Open it again</span></button></div></div>`,
      foot: h`<span class="pmf-note">${p.bill}.</span><span></span>`
    });
    setProv(p.id, { state: 'busy' }); PMF.rerender();
    OWN.signInProvider(p, d.where === 'remote' && d.server ? d.server.id : 'local').then(function (r) { setProv(p.id, { state: 'ready', detail: 'Signed in as ' + r.account }); PMF.sheetBody(h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">${p.name} is ready</h3><p class="pmf-sub">Signed in as ${r.account}. ${p.bill}.</p></div>${wait({ state: 'ok', text: 'Connected automatically', sub: 'Verified sign-in. No extra step needed.' })}`); PMF.sheetFoot(h`<span></span><button type="button" class="pmf-btn is-primary" data-act="prov-done">Continue</button>`); });
  };
  A['prov-done'] = function () { PMF.sheetClose(true); PMF.rerender(); };
  A['prov-key'] = function (el) {
    var p = prov(el.getAttribute('data-arg'));
    PMF.sheet({ id: 'prov-key', kicker: 'API key',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Paste your ${p.name} key</h3><p class="pmf-sub">A key works like a password that lets Puppet Master use your account. You get one from your ${p.name} account page.</p></div><div class="pmf-field"><input class="pmf-input" id="pmf-key" type="password" placeholder="Paste the key here" autocomplete="off" spellcheck="false"><span class="pmf-hint" id="pmf-key-hint">Kept safely by your computer, not in Puppet Master settings.</span></div>`,
      foot: h`<span class="pmf-note">${p.bill}.</span><button type="button" class="pmf-btn is-primary" data-act="prov-key-go" data-arg="${p.id}">Save and check</button>`
    });
  };
  A['prov-key-go'] = function (el) {
    var p = prov(el.getAttribute('data-arg')); var inp = U.$('#pmf-key'); var v = inp ? inp.value : '';
    el.setAttribute('aria-disabled', 'true'); el.innerHTML = '<span class="pmf-spinner"></span><span>Checking</span>';
    OWN.verifyKey(p, v).then(function (r) { if (!r.ok) { el.setAttribute('aria-disabled', 'false'); el.textContent = 'Save and check'; var hint = U.$('#pmf-key-hint'); if (hint) { hint.textContent = r.message; hint.className = 'pmf-hint is-err'; } return; } setProv(p.id, { state: 'ready', detail: 'API key verified' }); PMF.sheetBody(h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">${p.name} is ready</h3><p class="pmf-sub">The key works. ${p.bill}.</p></div>${wait({ state: 'ok', text: 'Key verified and stored safely', sub: 'You can replace it anytime in Settings.' })}`); PMF.sheetFoot(h`<span></span><button type="button" class="pmf-btn is-primary" data-act="prov-done">Continue</button>`); });
  };
  A['prov-install'] = function (el) {
    var p = prov(el.getAttribute('data-arg')), d = PMF.draft(); var host = d.where === 'remote' && d.server ? d.server.id : 'local';
    PMF.sheet({ id: 'prov-install', kicker: 'Install',
      body: h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">Install ${p.name.replace(' subscription', '')} on ${serverName(d)}</h3><p class="pmf-sub">${p.name} needs its own small program, called ${p.bin}. It comes straight from the maker, and only when you press Install.</p></div><div class="pmf-cmd">${p.install}</div><div id="pmf-install-phases"></div>`,
      foot: h`<span class="pmf-note">About a minute.</span><button type="button" class="pmf-btn is-primary" data-act="prov-install-go" data-arg="${p.id}">${I('download')}<span>Install</span></button>`
    });
  };
  A['prov-install-go'] = function (el) {
    var p = prov(el.getAttribute('data-arg')), d = PMF.draft(); var host = d.where === 'remote' && d.server ? d.server.id : 'local';
    var op = OWN.installCli(p, host); el.setAttribute('aria-disabled', 'true');
    PMF.patch('#pmf-install-phases', phases(op.phases, 'pmf-inst-phases'));
    setProv(p.id, { state: 'busy' }); PMF.rerender();
    op.run(function (i, s) { setPhase('pmf-inst-phases', i, s); }).then(function (r) { setProv(p.id, { state: 'signed_out', detail: p.bin + ' ' + r.version + ' installed · not signed in' }); PMF.sheetBody(h`<div class="pmf-heading"><h3 class="pmf-title" style="font-size:22px">${p.bin} is installed</h3><p class="pmf-sub">One more step: sign in so ${p.name} can be used.</p></div>${wait({ state: 'ok', text: p.bin + ' ' + r.version + ' installed on ' + serverName(d), sub: 'Verified before sign-in.' })}`); PMF.sheetFoot(h`<span></span><button type="button" class="pmf-btn is-primary" data-act="prov-signin" data-arg="${p.id}">${I('external')}<span>Sign in</span></button>`); });
  };

  // ---- 5b. free models ------------------------------------------------------------------------------
  SC.free = {
    chapter: 'power', scene: function (d) { return ['free', d]; },
    caption: function (d) { return [{ text: 'Free options for small tasks. Limits can vary.', primary: true }]; },
    render: function (d) {
      var list = d.free || U.clone(D.free_models); d.free = list;
      return h`${heading('Power', 'Set up free models?', 'Free options for suitable tasks. Availability and limits can vary. Optional.')}
        <div class="pmf-options">${raw(list.map(function (m) { return str(toggle({ act: 'free-toggle', value: m.id, on: m.on, name: m.name, desc: m.desc })); }).join(''))}</div>
        <p class="pmf-note">Puppet Master picks a free model only for tasks where it is a good fit. Your main account handles the rest.</p>`;
    },
    foot: function () { return { back: false, primary: { label: 'Finish setup', act: 'free-done' }, skip: { label: 'Skip', act: 'free-skip' } }; }
  };
  A['free-toggle'] = function (el) { var d = PMF.draft(); var id = el.getAttribute('data-arg'); var m = (d.free || []).filter(function (x) { return x.id === id; })[0]; if (!m) return; m.on = !m.on; el.setAttribute('aria-checked', m.on ? 'true' : 'false'); PMF.persist(); };
  A['free-done'] = function () { var d = PMF.draft(); PMF.command('cmd.provider.free_models.enable', { models: (d.free || []).filter(function (m) { return m.on; }).map(function (m) { return m.id; }) }); PMF.receipt('provider.free_models', 'ok', {}); d.provider_done = true; PMF.go('done', 'fwd'); };
  A['free-skip'] = function () { var d = PMF.draft(); (d.free || []).forEach(function (m) { m.on = false; }); d.provider_done = true; PMF.go('done', 'fwd'); };

  // =============================================================================
  // 6. Done
  // =============================================================================
  SC.done = {
    chapter: 'ready', scene: function (d) { return ['done', d]; },
    caption: function (d) { return [{ text: (d.name || 'Your Project') + ' is ready on ' + serverName(d) + '.', primary: true }]; },
    render: function (d) {
      var ready = Object.keys(d.providers).filter(function (k) { return d.providers[k].state === 'ready'; }).length;
      return h`${heading('Ready', 'You are set', 'Want a quick look around? It takes about three minutes and uses none of your AI plan.')}
        <div class="pmf-options">
          ${opt({ group: 'tour', value: 'tour', icon: 'tour', name: 'Show me around', desc: 'Try a few real actions, then plan something in the Planning Wizard.', badge: 'About 3 minutes', checked: d.tour_choice !== 'wizard' })}
          ${opt({ group: 'tour', value: 'wizard', icon: 'wand', name: 'Go straight to the Planning Wizard', desc: 'Start with one sentence about what you want to make.', checked: d.tour_choice === 'wizard' })}
        </div>
        <p class="pmf-note">${ready ? ready + ' AI account' + (ready === 1 ? '' : 's') + ' ready. ' : 'No AI account yet. Add one anytime in Settings. '}You can replay this setup or the tour from Settings.</p>`;
    },
    onPick: function (g, v) { var d = PMF.draft(); d.tour_choice = v; PMF.rerender(); },
    foot: function (d) { return { back: false, primary: { label: d.tour_choice === 'wizard' ? 'Open Planning Wizard' : 'Start the tour', act: 'finish', icon: d.tour_choice === 'wizard' ? 'wand' : 'play' }, skip: { label: 'Close', act: 'finish-close' } }; }
  };
  A.finish = function () { var d = PMF.draft(); PMF.finish(d.tour_choice === 'wizard' ? 'wizard' : 'tour'); };
  A['finish-close'] = function () { PMF.finish('close'); };
})();
