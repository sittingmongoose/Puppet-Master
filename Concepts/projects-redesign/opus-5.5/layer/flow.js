/* Projects concepts (Opus 5.5): the New Project flow, window.PJX.flow.

   One flow for every way a Project can begin, asking what onboarding's Project chapter asks
   (Concepts/onboarding/opus-5.5/src/js/69-72) in its words, without its stage, puppets, scenes, sounds or look changes.
   Every concept draws these same steps; only the frame differs (A a stepped window, B one scrolling sheet, C a launcher).

   Ways in (Project_System §3.1, §9; the owner command each one ends in):
     new      Start a new Project: empty or a template      cmd.project.new_local / cmd.project_template.create_project
     folder   A folder on this computer                    cmd.project.source_location.test -> cmd.project.add_existing
     online   A Project stored online (clone, or fork)     cmd.source_control.repository.clone | cmd.jujutsu.git.clone
                                                           (cmd.forge.repository.fork first) -> cmd.project.add_existing
     device   Files on another computer or a NAS           cmd.project.source_location.test -> cmd.project.add_existing {ssh_remote}
     restore  Restore from a backup, as a new Project      cmd.restore.preview -> cmd.restore.project_as_new -> cmd.project.add_existing
   Not yet a way in (shown, unavailable, with the reason): importing another app's workspace (no owner command).
   Steps after the source: name and place; "Start like another Project?" (settings only, SSYS-036); Keep it safe
   (history Git / Jujutsu / none, online copy, backup); Review; Creating; Done or Setup didn't finish
   (cmd.project.resume_creation).

   API:
     PJX.flow.WAYS, PJX.flow.MORE                      the ways in, for a concept's own way picker
     PJX.flow.start({ way?, like?, text? }) -> s        a session: s.draft, s.step, s.steps(), s.go(id), s.next(), s.back()
     s.on(fn)                                           called whenever the draft or step changes (re-render)
     PJX.flow.step(s, id) -> def                         { id, label, title, lead, body(s) -> Node, problem(s) -> '' | why }
     PJX.flow.render(s, container, { only?, all? })     draws one step (default: s.step) or every step after 'way' as sections
     PJX.flow.review(s) -> [{ label, rows: [[k, v]] }]  the Review groups
     PJX.flow.commit(s, { onPhase, fail }) -> Promise   runs the creation; resolves { ok, project }
     PJX.flow.detect(text) -> { way, ... } | null        a pasted link, path, address or Recovery Kit, recognised */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.flow) return;
  const { h, esc, icon, mark, tip, ENV } = PJX;

  const WAYS = [
    { id: 'new', glyph: 'seed', title: 'Start a new Project', sub: 'An empty folder, or a starter to build on', tag: 'Most common' },
    { id: 'folder', glyph: 'folder', title: 'A folder on this computer', sub: 'Work that is already here, with or without history' },
    { id: 'online', glyph: 'cloud', title: 'A Project stored online', sub: 'Copy it from GitHub, GitLab or any Git address' },
    { id: 'device', glyph: 'server', title: 'Files on another computer or a NAS', sub: 'Work on them where they are, over a secure connection' },
    { id: 'restore', glyph: 'history', title: 'Restore from a backup', sub: 'Bring a backed-up Project back as a new one' }
  ];
  const MORE = [
    { id: 'import', glyph: 'download', title: 'Import from another app', sub: 'Not available yet: Puppet Master can’t read another app’s chats and settings. Add its folder instead.', disabled: true }
  ];
  const pretty = (s) => String(s || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const slug = (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  /* ------------------------------------------------------------------ session */
  function start(opts) {
    opts = opts || {};
    const listeners = [];
    const s = {
      id: PJX.uid('flow'),
      draft: {
        way: null, template: 'empty', folder: null, folderInfo: null,
        service: null, repo: '', repoPicked: null, fork: false, cloneAs: 'git',
        device: null, devicePath: null,
        backupFrom: null, unlocked: false, phrase: '', restorePick: null,
        name: '', nameTouched: false, place: '', placeTouched: false, runsOn: 'this',
        like: opts.like || null,
        history: 'git', online: 'none', onlineName: '', privacy: 'private', backup: 'later'
      },
      ui: { treeAt: null, browsing: false, checking: null, signingIn: false, existingSub: null },
      step: 'way',
      on(fn) { listeners.push(fn); return s; },
      changed() { listeners.slice().forEach((fn) => { try { fn(s); } catch (e) { console.error('[pjx flow]', e); } }); },
      steps() { return stepsFor(s.draft.way); },
      index() { return Math.max(0, s.steps().indexOf(s.step)); },
      go(id) { if (s.steps().indexOf(id) >= 0) { s.step = id; s.changed(); } },
      next() { const st = s.steps(), i = st.indexOf(s.step); const p = problem(s, s.step); if (p) return p; if (i < st.length - 1) { s.step = st[i + 1]; s.changed(); } return ''; },
      back() { const st = s.steps(), i = st.indexOf(s.step); if (i > 0) { s.step = st[i - 1]; s.changed(); } },
      set(patch) { Object.assign(s.draft, patch); s.changed(); }
    };
    if (opts.like) { const p = PJX.get(opts.like); if (p) s.draft.like = p.id; }
    if (opts.text) { const d = detect(opts.text); if (d) applyDetected(s, d); }
    if (opts.way) chooseWay(s, opts.way, true);
    return s;
  }
  function stepsFor(way) {
    switch (way) {
      case 'new': return ['way', 'template', 'name', 'like', 'safe', 'review'];
      case 'folder': return ['way', 'folder', 'name', 'like', 'safe', 'review'];
      case 'online': return ['way', 'online', 'name', 'like', 'safe', 'review'];
      case 'device': return ['way', 'device', 'name', 'like', 'safe', 'review'];
      case 'restore': return ['way', 'backup', 'name', 'review'];
      default: return ['way', 'source', 'name', 'like', 'safe', 'review'];
    }
  }
  /* switching how the Project begins drops what the abandoned beginning filled in (onboarding's resetBeginning) */
  function chooseWay(s, way, quiet) {
    const d = s.draft;
    if (d.way && d.way !== way) {
      Object.assign(d, { folder: null, folderInfo: null, service: null, repo: '', repoPicked: null, fork: false, device: null, devicePath: null, backupFrom: null, unlocked: false, phrase: '', restorePick: null, online: 'none', history: 'git' });
      if (!d.nameTouched) d.name = '';
      if (!d.placeTouched) d.place = '';
    }
    d.way = way;
    if (way === 'online') { d.online = 'keep'; }
    if (!quiet) s.changed();
  }
  const placeFor = (s) => s.draft.placeTouched && s.draft.place ? s.draft.place : (ENV.projectsRoot + '/' + (slug(s.draft.name) || 'new-project'));

  /* ------------------------------------------------------------------ detection: a link, a path, an address, a kit */
  function detect(text) {
    const t = String(text || '').trim();
    if (!t) return null;
    let m;
    if ((m = /github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(t))) return { way: 'online', service: 'github', repo: m[1], say: 'A GitHub repository: ' + m[1] };
    if ((m = /gitlab\.[\w.]+[/:]([\w.-]+\/[\w./-]+?)(?:\.git)?\/?$/i.exec(t))) return { way: 'online', service: 'gitlab', repo: m[1], say: 'A GitLab repository: ' + m[1] };
    if ((m = /bitbucket\.org[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(t))) return { way: 'online', service: 'bitbucket', repo: m[1], say: 'A Bitbucket repository: ' + m[1] };
    if (/^(https?:\/\/|git:\/\/).+\.git$/i.test(t) || /^git@[\w.-]+:.+\.git$/i.test(t)) return { way: 'online', service: 'git', repo: t, say: 'A Git address' };
    if ((m = /^(?:ssh:\/\/)?([\w.-]+)@([\w.-]+)(?::|\/)(.+)$/.exec(t))) return { way: 'device', host: m[2], user: m[1], path: m[3].startsWith('/') || m[3].startsWith('~') ? m[3] : '/' + m[3], say: 'A folder on ' + m[2] + ' (secure connection)' };
    if (/\.pmkit$/i.test(t) || /recovery[ -]?kit/i.test(t)) return { way: 'restore', from: 'kit', say: 'A Recovery Kit file' };
    if (/^(~|\/|[a-z]:\\)/i.test(t)) return { way: 'folder', path: t.replace(/\/+$/, ''), say: 'A folder on this computer' };
    return null;
  }
  function applyDetected(s, d) {
    chooseWay(s, d.way, true);
    const dr = s.draft;
    if (d.way === 'online') { dr.service = d.service; dr.repo = d.repo; dr.repoPicked = d.repo; if (!dr.nameTouched) dr.name = pretty(String(d.repo).split('/').pop().replace(/\.git$/, '')).replace(/\s+/g, '-'); s.step = 'online'; }
    else if (d.way === 'device') { const dev = ENV.devices.find((x) => x.address.split('.')[0] === d.host.split('.')[0]) || null; dr.device = dev ? dev.id : null; dr.devicePath = d.path; if (!dr.nameTouched) dr.name = String(d.path).split('/').pop(); s.step = 'device'; }
    else if (d.way === 'folder') { dr.folder = d.path; s.step = 'folder'; s.ui.checking = d.path; checkFolder(s, d.path); }
    else if (d.way === 'restore') { dr.backupFrom = d.from; s.step = 'backup'; }
  }

  /* ------------------------------------------------------------------ shared pieces */
  function choices(items, selected, onPick, opts) {
    opts = opts || {};
    const box = h('div', { class: ['pjx-choices', opts.cls], role: opts.multi ? 'group' : 'radiogroup', 'aria-label': opts.label || null });
    items.forEach((it) => {
      const on = it.id === selected;
      const b = h('button', { type: 'button', class: ['pjx-choice', on && 'is-on', it.disabled && 'is-off', it.quiet && 'is-quiet'], 'data-pm-hover-visual-suppressed': it.disabled ? null : 'true', role: opts.multi ? null : 'radio', 'aria-checked': opts.multi ? null : String(on), 'aria-disabled': it.disabled ? 'true' : null, 'data-v': it.id },
        it.glyph ? h('span.pjx-choice-ico', { html: icon(it.glyph, 20), 'aria-hidden': 'true' }) : null,
        h('span.pjx-choice-text', null, h('span.pjx-choice-title', { text: it.title }), it.sub ? h('span.pjx-choice-sub', { text: it.sub }) : null),
        it.tag ? h('span.pjx-choice-tag', { text: it.tag }) : null,
        it.meta ? h('span.pjx-choice-meta', { html: it.meta }) : null);
      if (it.disabled) tip(b, it.title, typeof it.disabled === 'string' ? it.disabled : it.sub);
      b.addEventListener('click', () => { if (!it.disabled) onPick(it.id); });
      box.appendChild(b);
    });
    // arrow keys move between the choices of one group, the way a radio group does
    box.addEventListener('keydown', (e) => {
      if (!/^Arrow(Up|Down|Left|Right)$/.test(e.key)) return;
      const bs = Array.from(box.querySelectorAll('.pjx-choice:not(.is-off)')); const i = bs.indexOf(D().activeElement); if (i < 0) return;
      e.preventDefault(); const n = bs[(i + (/Down|Right/.test(e.key) ? 1 : bs.length - 1)) % bs.length]; n.focus();
    });
    return box;
  }
  const D = () => W.document;
  function field(label, input, hint, problem) {
    const id = PJX.uid('f');
    input.id = id;
    const wrap = h('div', { class: ['pjx-field', problem && 'has-problem'] }, h('label.pjx-field-label', { for: id, text: label }), input);
    if (problem) { const p = h('div.pjx-field-problem', { role: 'alert', html: mark('warning', 13) + '<span>' + esc(problem) + '</span>' }); wrap.appendChild(p); input.setAttribute('aria-invalid', 'true'); }
    else if (hint) wrap.appendChild(h('div.pjx-field-hint', { text: hint }));
    return wrap;
  }
  function group(label, ...kids) { return h('section.pjx-group', null, label ? h('h3.pjx-group-label', { text: label }) : null, ...kids); }
  function facts(rows) {
    return h('ul.pjx-facts', null, ...rows.filter(Boolean).map((r) => h('li', { class: ['pjx-fact', r.key && 'is-' + r.key] }, h('span.pjx-fact-mark', { html: r.key ? (r.key === 'working' ? mark(r.key, 14) : PJX.calm(r.key, 14)) : icon(r.icon || 'info', 14), 'aria-hidden': 'true' }), h('span.pjx-fact-text', { html: r.html || esc(r.text) }))));
  }
  function seg(items, value, onPick, label) {
    const box = h('div.pjx-seg', { role: 'radiogroup', 'aria-label': label });
    items.forEach((it) => {
      const b = h('button', { type: 'button', class: ['pjx-seg-btn', it.id === value && 'is-on'], role: 'radio', 'aria-checked': String(it.id === value), text: it.title });
      if (it.sub) tip(b, it.title, it.sub);
      b.addEventListener('click', () => onPick(it.id));
      box.appendChild(b);
    });
    return box;
  }
  function textInput(value, placeholder, onInput, attrs) {
    const i = h('input', Object.assign({ type: 'text', class: 'pjx-input', value: value || '', placeholder: placeholder || '', autocomplete: 'off', spellcheck: 'false' }, attrs || {}));
    i.value = value || '';
    i.addEventListener('input', () => onInput(i.value));
    return i;
  }
  /* re-render without losing the caret: concepts call render on every change, so text inputs keep focus by key */
  function keyed(el, key) { el.setAttribute('data-pjx-key', key); return el; }

  /* ------------------------------------------------------------------ the folder check (read-only) */
  function folderInfo(path) {
    const r = ENV.recentFolders.find((f) => f.path === path);
    if (r) return r;
    const name = String(path).split('/').pop();
    const known = PJX.all().find((p) => p.where.path === path);
    return { path, name, history: /code|projects/i.test(path) ? 'git' : null, online: null, stack: [], known: known ? known.id : null };
  }
  function checkFolder(s, path) {
    s.ui.checking = path; s.changed();
    setTimeout(() => {
      if (s.ui.checking !== path) return;
      s.ui.checking = null; s.draft.folderInfo = folderInfo(path);
      const info = s.draft.folderInfo;
      if (!s.draft.nameTouched) s.draft.name = slug(info.name) || info.name;
      s.draft.history = info.history ? 'keep' : 'git';
      s.draft.online = info.online ? 'keep' : 'none';
      s.changed();
    }, PJX.reduced() ? 150 : 650);
  }

  /* ------------------------------------------------------------------ steps */
  const STEPS = {
    way: {
      label: 'Begin', title: () => 'How should this Project begin?', lead: () => 'A Project keeps one thing you are making: its files, plans, chats and history.',
      body(s) {
        const box = h('div.pjx-step-way');
        box.appendChild(choices(WAYS, s.draft.way, (v) => { chooseWay(s, v); if (s.autoNext) s.next(); }, { label: 'How it begins', cls: 'pjx-choices-ways' }));
        box.appendChild(h('div.pjx-more-ways', null, h('div.pjx-more-label', { text: 'Not here yet' }), choices(MORE, null, () => {}, { cls: 'pjx-choices-quiet', label: 'Not available yet' })));
        return box;
      },
      problem: (s) => (s.draft.way ? '' : 'Choose how it begins')
    },
    template: {
      label: 'Start with', title: () => 'What should it start with?', lead: () => 'Puppet Master makes the folder. A starter adds a working skeleton you can plan from.',
      body(s) { return choices(ENV.templates, s.draft.template, (v) => s.set({ template: v }), { label: 'Starter', cls: 'pjx-choices-grid' }); },
      problem: () => ''
    },
    folder: {
      label: 'Folder', title: () => 'Which folder?', lead: () => 'Puppet Master reads it but changes nothing until you add it.',
      body(s) {
        const d = s.draft, box = h('div.pjx-step-folder');
        const rs = ENV.recentFolders.map((r) => ({ id: r.path, glyph: 'folder', title: r.name, sub: r.path }));
        if (d.folder && !rs.some((r) => r.id === d.folder)) rs.push({ id: d.folder, glyph: 'folder', title: d.folder.split('/').pop(), sub: d.folder });
        box.appendChild(group('Recent folders', choices(rs, d.folder, (v) => { d.folder = v; checkFolder(s, v); }, { label: 'Recent folders', cls: 'pjx-choices-list' })));
        const browse = h('button.pjx-btn.is-quiet', { type: 'button', html: icon('folder-search', 15) + '<span>Browse…</span>' });
        browse.addEventListener('click', () => { s.ui.browsing = !s.ui.browsing; s.ui.treeAt = s.ui.treeAt || '~'; s.changed(); });
        box.appendChild(h('div.pjx-row', null, browse));
        if (s.ui.browsing) box.appendChild(picker(s, (path) => { s.ui.browsing = false; d.folder = path; checkFolder(s, path); }));
        if (s.ui.checking) box.appendChild(h('div.pjx-checking', { role: 'status', html: mark('working', 14) + '<span>Looking inside ' + esc(s.ui.checking) + '…</span>' }));
        else if (d.folderInfo) {
          const i = d.folderInfo;
          box.appendChild(group('What’s in it', facts([
            { key: i.history ? 'complete' : 'off', text: i.history ? 'Has its own history (' + (i.history === 'jujutsu' ? 'Jujutsu' : 'Git') + '). Puppet Master keeps using it.' : 'No history yet. You can turn it on in the next steps.' },
            i.online ? { key: 'complete', text: 'Online copy on ' + i.online.service + ' · ' + i.online.repo } : { key: 'off', text: 'No online copy' },
            i.stack && i.stack.length ? { icon: 'code', text: 'Looks like ' + i.stack.join(' · ') } : null,
            i.known ? { key: 'warning', text: 'Already in your Projects as ' + i.known + '. Opening it instead is suggested.' } : null
          ])));
        }
        return box;
      },
      problem: (s) => (s.ui.checking ? 'Still looking inside the folder' : !s.draft.folderInfo ? 'Choose a folder' : '')
    },
    online: {
      label: 'Online', title: () => 'Where is it stored online?', lead: () => 'Puppet Master copies it to this computer. It only asks the service for the Project you choose.',
      body(s) {
        const d = s.draft, box = h('div.pjx-step-online');
        const svc = ENV.services.map((x) => ({ id: x.id, glyph: x.id === 'git' ? 'link' : 'cloud', title: x.name, sub: x.connected && x.account ? 'Signed in as ' + x.account : x.id === 'git' ? 'Paste an address' : 'Sign in to choose', quiet: true }));
        box.appendChild(group('Service', choices(svc, d.service, (v) => { d.service = v; d.repoPicked = null; s.changed(); }, { label: 'Service', cls: 'pjx-choices-tiles' })));
        if (d.service) {
          const sv = ENV.services.find((x) => x.id === d.service);
          if (sv && !sv.connected) {
            const b = h('button.pjx-btn.is-primary', { type: 'button', html: icon('key', 15) + '<span>Sign in to ' + esc(sv.name) + '</span>' });
            b.addEventListener('click', () => { s.ui.signingIn = true; s.changed(); setTimeout(() => { sv.connected = true; sv.account = sv.account || 'jared'; s.ui.signingIn = false; s.changed(); }, PJX.reduced() ? 200 : 1200); });
            box.appendChild(group('Sign in', s.ui.signingIn ? h('div.pjx-checking', { role: 'status', html: mark('working', 14) + '<span>Waiting for you in your browser…</span>' }) : h('div.pjx-row', null, b, h('span.pjx-hint', { text: 'Puppet Master only asks ' + sv.name + ' for the Project you choose.' }))));
          } else if (d.service === 'git' || (sv && sv.connected)) {
            const repos = (ENV.repos[d.service] || []).map((r) => ({ id: r.repo, glyph: 'branch', title: r.repo, sub: r.sub + ' · ' + r.privacy }));
            if (repos.length) box.appendChild(group('Your repositories', choices(repos, d.repoPicked, (v) => { d.repoPicked = v; d.repo = v; d.fork = /^acme\//.test(v) ? d.fork : false; if (!d.nameTouched) d.name = v.split('/').pop(); s.changed(); }, { label: 'Repositories', cls: 'pjx-choices-list' })));
            const inp = keyed(textInput(d.repo, d.service === 'git' ? 'https://git.example.com/team/project.git' : 'Or paste an address', (v) => { d.repo = v; d.repoPicked = null; const dt = detect(v); if (dt && dt.way === 'online' && !d.nameTouched) d.name = String(dt.repo).split('/').pop().replace(/\.git$/, ''); s.changed(); }), 'repo');
            box.appendChild(field(d.service === 'git' ? 'Git address' : 'Or paste its address', inp, 'HTTPS or SSH both work.'));
            if (d.repo) {
              const notMine = /^acme\//.test(d.repo);
              box.appendChild(group('Keep versions with', seg([{ id: 'git', title: 'Git', sub: 'The most common way. Works with every service.' }, { id: 'jujutsu', title: 'Jujutsu', sub: 'Built on Git. Mistakes are easier to undo.' }], d.cloneAs, (v) => s.set({ cloneAs: v }), 'Keep versions with'),
                h('div.pjx-hint', { text: d.cloneAs === 'jujutsu' ? 'Copied with Jujutsu. It still works with ' + (sv ? sv.name : 'the service') + '.' : 'Copied with Git.' })));
              if (notMine) {
                const fk = h('label.pjx-check', null, h('input', { type: 'checkbox', checked: d.fork ? true : null }), h('span', { text: 'Make my own copy on ' + (sv ? sv.name : 'the service') + ' first (fork)' }));
                fk.querySelector('input').addEventListener('change', (e) => s.set({ fork: e.target.checked }));
                box.appendChild(group('It belongs to Acme', fk, h('div.pjx-hint', { text: 'A fork keeps your changes in your account and remembers where it came from.' })));
              }
            }
          }
        }
        return box;
      },
      problem: (s) => (!s.draft.service ? 'Choose where it is stored' : s.ui.signingIn ? 'Finish signing in' : !s.draft.repo ? 'Choose or paste a repository' : '')
    },
    device: {
      label: 'Device', title: () => 'Which computer or NAS?', lead: () => 'Puppet Master works on the files right where they are, over a secure connection (SSH).',
      body(s) {
        const d = s.draft, box = h('div.pjx-step-device');
        const devs = ENV.devices.map((x) => ({ id: x.id, glyph: x.id === 'nas' ? 'server' : 'desktop', title: x.name, sub: x.online ? x.user + '@' + x.address + ' · connected' : x.address + ' · not answering right now', meta: x.online ? mark('complete', 13) : mark('offline', 13) }));
        devs.push({ id: 'add', glyph: 'plus', title: 'Another computer…', sub: 'Its address, then a key from Settings › Connections', quiet: true });
        box.appendChild(group('Devices', choices(devs, d.device, (v) => {
          if (v === 'add') { PJX.toast('Add a device', 'Opens Settings › Connections to add its address and key. Setting up keys has its own screen there.', 'info'); return; }
          d.device = v; d.devicePath = null; s.changed();
        }, { label: 'Devices', cls: 'pjx-choices-list' })));
        const dev = ENV.devices.find((x) => x.id === d.device);
        if (dev && !dev.online) box.appendChild(facts([{ key: 'offline', text: dev.name + ' isn’t answering. Turn it on or check its network, then try again.' }]));
        if (dev && dev.online) {
          box.appendChild(group('Folders on ' + dev.name, choices(dev.folders.map((f) => ({ id: f, glyph: 'folder', title: f.split('/').pop(), sub: f })), d.devicePath, (v) => { d.devicePath = v; if (!d.nameTouched) d.name = v.split('/').pop(); s.changed(); }, { label: 'Folders', cls: 'pjx-choices-list' })));
          if (d.devicePath) box.appendChild(facts([{ key: 'complete', text: 'Has its own history (Git). The files stay on ' + dev.name + '; Puppet Master keeps no second copy.' }]));
        }
        return box;
      },
      problem: (s) => { const dev = ENV.devices.find((x) => x.id === s.draft.device); return !dev ? 'Choose a device' : !dev.online ? dev.name + ' isn’t answering' : !s.draft.devicePath ? 'Choose a folder' : ''; }
    },
    backup: {
      label: 'Backup', title: () => 'Where is the backup?', lead: () => 'Nothing on this computer is replaced. The Project comes back as a new one beside the others.',
      body(s) {
        const d = s.draft, box = h('div.pjx-step-backup');
        box.appendChild(group('Backups', choices(ENV.backups.map((b) => ({ id: b.id, glyph: b.kind === 'cloud' ? 'cloud' : b.kind === 'kit' ? 'key' : b.kind === 'folder' ? 'folder' : 'server', title: b.where, sub: b.sub + (b.latest ? ' · latest ' + b.latest : '') })), d.backupFrom, (v) => { d.backupFrom = v; d.unlocked = v === 'nas' || v === 'gdrive'; d.restorePick = null; s.changed(); }, { label: 'Backups', cls: 'pjx-choices-list' })));
        const src = ENV.backups.find((b) => b.id === d.backupFrom);
        if (src && !d.unlocked) {
          const inp = keyed(textInput(d.phrase, 'six words from your Recovery Kit', (v) => { d.phrase = v; }), 'phrase');
          const go = h('button.pjx-btn.is-primary', { type: 'button', text: 'Unlock' });
          go.addEventListener('click', () => { if (d.phrase.trim().split(/\s+/).length >= 6) { d.unlocked = true; s.ui.phraseBad = false; } else s.ui.phraseBad = true; s.changed(); });
          box.appendChild(group('Unlock the backup', field('Recovery phrase', inp, 'It is used once and never saved.', s.ui.phraseBad ? 'That phrase doesn’t unlock this backup. It has six words.' : ''), h('div.pjx-row', null, go)));
        }
        if (src && d.unlocked) {
          const projs = (src.projects.length ? src.projects : ['photo-sorter', 'tastebook']).map((n) => ({ id: n, glyph: 'box', title: n, sub: 'Latest ' + (src.latest || 'Oct 28') + ' · ' + (PJX.get(n) ? 'also in your list now' : 'not in your list') }));
          box.appendChild(group('Choose what to bring back', choices(projs, d.restorePick, (v) => { d.restorePick = v; if (!d.nameTouched) d.name = PJX.get(v) ? v + '-restored' : v; s.changed(); }, { label: 'Projects in this backup', cls: 'pjx-choices-list' })));
          if (d.restorePick) box.appendChild(group('What comes back', facts([
            { key: 'complete', text: 'Its files with their full history' }, { key: 'complete', text: 'Its plans, chats, notes and settings' },
            { key: 'info', text: 'Passwords and keys never come back from a backup. You sign in again where needed.' },
            PJX.get(d.restorePick) ? { key: 'info', text: d.restorePick + ' in your list stays as it is. This one is new, with its own name.' } : null
          ])));
        }
        return box;
      },
      problem: (s) => (!s.draft.backupFrom ? 'Choose where the backup is' : !s.draft.unlocked ? 'Unlock the backup' : !s.draft.restorePick ? 'Choose what to bring back' : '')
    },
    name: {
      label: 'Name', title: (s) => (s.draft.way === 'restore' ? 'Name the restored Project' : 'Name it'), lead: (s) => (s.draft.way === 'folder' ? 'The folder stays where it is.' : s.draft.way === 'device' ? 'Its files stay on the device.' : 'And choose where its files live.'),
      body(s) {
        const d = s.draft, box = h('div.pjx-step-name');
        const pr = nameProblem(s);
        box.appendChild(field('Name', keyed(textInput(d.name, 'my-next-app', (v) => { d.name = v; d.nameTouched = true; s.changed(); }, { autofocus: true }), 'name'), 'Only the name you see. You can rename it any time.', d.name ? pr : ''));
        if (d.way === 'new' || d.way === 'online' || d.way === 'restore') {
          box.appendChild(field('Folder', keyed(textInput(placeFor(s), '~/Projects/my-next-app', (v) => { d.place = v; d.placeTouched = true; s.changed(); }), 'place'), d.way === 'online' ? 'Where the copy goes. The folder must be empty or new.' : 'A new folder is made here.'));
        } else {
          const dev = ENV.devices.find((x) => x.id === d.device);
          const where = d.way === 'folder' ? d.folder : dev && d.devicePath ? dev.name + ' · ' + d.devicePath : null;
          if (where) box.appendChild(facts([{ icon: d.way === 'device' ? 'server' : 'folder', text: where }]));
        }
        if (d.way !== 'device') box.appendChild(group('Work happens on', seg([{ id: 'this', title: 'This computer' }, { id: 'server', title: ENV.serverName, sub: 'Your Puppet Master server. Work keeps going when this computer sleeps.' }], d.runsOn, (v) => s.set({ runsOn: v }), 'Work happens on')));
        return box;
      },
      problem: (s) => nameProblem(s)
    },
    like: {
      label: 'Settings', title: () => 'Start like another Project?', lead: () => 'Reuse the setup you already trust, or begin fresh.',
      body(s) {
        const d = s.draft, box = h('div.pjx-step-like');
        const opts = [{ id: null, glyph: 'sparkles', title: 'Start fresh', sub: 'Puppet Master’s standard settings' }].concat(PJX.listed().filter((p) => p.lifecycle === 'listed').slice(0, 4).map((p) => ({ id: p.id, glyph: p.glyph, title: 'Like ' + p.name, sub: 'Used ' + String(p.opened).toLowerCase() })));
        box.appendChild(choices(opts.map((o) => Object.assign({}, o, { id: o.id || 'fresh' })), d.like || 'fresh', (v) => s.set({ like: v === 'fresh' ? null : v }), { label: 'Settings', cls: 'pjx-choices-list' }));
        if (d.like) {
          const p = PJX.get(d.like);
          box.appendChild(group('What comes along', facts([
            { key: 'complete', text: 'The same look, AI accounts, model choices, permissions, personas and testing defaults as ' + (p ? p.name : d.like) + '.' },
            { key: 'info', text: 'Never copied: sign-ins and keys, files, history, Goals and Plans.' }
          ])));
        }
        return box;
      },
      problem: () => ''
    },
    safe: {
      label: 'Keep safe', title: () => 'Keep it safe', lead: () => 'Every version can be kept on this computer. An online copy and a backup are optional.',
      body(s) {
        const d = s.draft, box = h('div.pjx-step-safe'), info = d.folderInfo;
        const keeps = (d.way === 'folder' && info && info.history) || d.way === 'online' || d.way === 'device';
        const histKind = d.way === 'online' ? (d.cloneAs === 'jujutsu' ? 'Jujutsu' : 'Git') : info && info.history === 'jujutsu' ? 'Jujutsu' : 'Git';
        box.appendChild(group('Every version, on this computer', keeps
          ? facts([{ key: 'complete', text: 'Keeps its own history (' + histKind + ').' }])
          : choices([
            { id: 'git', glyph: 'branch', title: 'Git', sub: 'The most common way to keep versions. Works with GitHub and every other service.', tag: 'Recommended' },
            { id: 'jujutsu', glyph: 'history', title: 'Jujutsu', sub: 'Built on Git. Mistakes are easier to undo. Not a website or an account.' },
            { id: 'none', glyph: 'slash-circle', title: 'No history', sub: 'Only FileSafe’s copies before big changes. Not for code.' }
          ], d.history, (v) => s.set({ history: v }), { label: 'Keep versions with', cls: 'pjx-choices-list' })));
        if (d.way === 'online' || (info && info.online)) box.appendChild(group('Online copy', facts([{ key: 'complete', text: 'Already online: ' + (d.way === 'online' ? (ENV.services.find((x) => x.id === d.service) || {}).name + ' · ' + d.repo : info.online.service + ' · ' + info.online.repo) + (d.fork ? ' (your fork)' : '') }])));
        else {
          const onl = [{ id: 'none', title: 'Not now' }, { id: 'github', title: 'GitHub', sub: 'Signed in as jared' }, { id: 'gitlab', title: 'GitLab' }, { id: 'other', title: 'Other…', sub: 'Bitbucket, Azure DevOps, Gitea, Forgejo' }];
          const g = group('Online copy', seg(onl, d.online, (v) => s.set({ online: v, onlineName: d.onlineName || slug(d.name) }), 'Online copy'));
          if (d.history === 'none' && d.online !== 'none') g.appendChild(h('div.pjx-hint', { text: 'An online copy needs history. Git is turned on with it.' }));
          if (d.online === 'github') g.appendChild(h('div.pjx-row', null, field('Name on GitHub', keyed(textInput(d.onlineName || slug(d.name), slug(d.name), (v) => { d.onlineName = v; }), 'onlineName'), 'jared/' + (d.onlineName || slug(d.name)) + ' · available'),
            seg([{ id: 'private', title: 'Only you' }, { id: 'public', title: 'Everyone' }], d.privacy, (v) => s.set({ privacy: v }), 'Who can see it')));
          box.appendChild(g);
        }
        const dests = [{ id: 'later', title: 'Later' }, { id: 'nas', title: 'Home NAS', sub: 'Over your home network' }, { id: 'gdrive', title: 'Google Drive' }, { id: 'onedrive', title: 'OneDrive' }, { id: 's3', title: 'S3 or B2', sub: 'A cloud storage bucket' }, { id: 'sftp', title: 'Another server', sub: 'SFTP or WebDAV' }];
        const bg = group('Backup', seg(dests, d.backup, (v) => s.set({ backup: v }), 'Backup'));
        if (d.way === 'device' && d.device === 'nas' && d.backup === 'nas') bg.appendChild(facts([{ key: 'warning', text: 'Its files are on Home NAS, so a backup there would not survive losing it. Choose another place.' }]));
        else bg.appendChild(h('div.pjx-hint', { text: d.backup === 'later' ? 'An online copy keeps files and history, not plans, chats and settings. A backup keeps everything.' : 'Every night, and checked after each one. You can change this in Project settings.' }));
        box.appendChild(bg);
        box.appendChild(h('div.pjx-hint.pjx-sync', { html: icon('swap', 13) + '<span>Your other Puppet Master devices see this Project automatically.</span>' }));
        return box;
      },
      problem: (s) => (s.draft.way === 'device' && s.draft.device === 'nas' && s.draft.backup === 'nas' ? 'Choose another place for the backup' : '')
    },
    review: {
      label: 'Review', title: (s) => ({ new: 'Ready to create ', folder: 'Ready to add ', online: 'Ready to copy ', device: 'Ready to add ', restore: 'Ready to restore ' }[s.draft.way] || 'Ready to create ') + (s.draft.name || 'it'),
      lead: () => 'Nothing has been made yet. Check it, then do it in one step.',
      body(s) {
        const box = h('div.pjx-step-review');
        review(s).forEach((g) => {
          const sec = h('section.pjx-review-group', null, h('div.pjx-review-head', null, h('h3.pjx-group-label', { text: g.label }), g.step ? editLink(s, g.step) : null));
          const dl = h('dl.pjx-review-rows');
          g.rows.forEach(([k, v]) => { dl.appendChild(h('dt', { text: k })); dl.appendChild(h('dd', { text: v })); });
          sec.appendChild(dl); box.appendChild(sec);
        });
        return box;
      },
      problem: () => ''
    },
    source: { label: 'Source', title: () => 'Where it comes from', lead: () => 'Choose how it begins first.', body: () => h('div.pjx-hint', { text: 'Choose how it begins first.' }), problem: () => 'Choose how it begins' }
  };
  function editLink(s, step) {
    const b = h('button.pjx-link', { type: 'button', text: 'Change' });
    b.addEventListener('click', () => s.go(step));
    return b;
  }
  function nameProblem(s) {
    const v = String(s.draft.name || '').trim();
    if (!v) return 'Give it a name';
    if (v.length > 60) return 'Use 60 characters or fewer';
    const taken = PJX.all().find((p) => p.name.toLowerCase() === v.toLowerCase());
    if (taken) return taken.name + ' is already a Project. Choose another name.';
    return '';
  }
  function problem(s, id) { const st = STEPS[id]; return st && st.problem ? st.problem(s) : ''; }

  /* the review: what will be made, reused, copied or uploaded, grouped as onboarding's review is */
  function review(s) {
    const d = s.draft, way = d.way, info = d.folderInfo;
    const svc = ENV.services.find((x) => x.id === d.service);
    const tpl = ENV.templates.find((t) => t.id === d.template);
    // a review shown live (B, C) must never print fragments: anything not chosen yet says so
    const NOT = 'Not chosen yet';
    const begins = { new: tpl && tpl.id !== 'empty' ? 'New, from the ' + tpl.title + ' starter' : 'New and empty', folder: 'An existing folder', online: d.repo ? 'A copy of ' + d.repo + (d.fork ? ' (forked to your account first)' : '') : 'A copy of a project stored online', device: 'Files on ' + ((ENV.devices.find((x) => x.id === d.device) || {}).name || 'a device'), restore: 'Restored from ' + ((ENV.backups.find((b) => b.id === d.backupFrom) || {}).where || 'a backup') }[way] || NOT;
    const dev = ENV.devices.find((x) => x.id === d.device);
    const where = way === 'folder' ? (d.folder || NOT) : way === 'device' ? (dev ? dev.name + ' · ' + (d.devicePath || 'folder not chosen yet') : NOT) : (d.name || d.placeTouched ? placeFor(s) : 'Named after the Project');
    const groups = [{ label: 'Project', step: 'name', rows: [['Name', d.name || '—'], ['Begins as', begins], ['Files', where], way === 'device' ? null : ['Work happens on', d.runsOn === 'server' ? ENV.serverName : 'This computer']].filter(Boolean) }];
    if (way !== 'restore') groups.push({ label: 'Settings', step: 'like', rows: [['Settings', d.like ? 'Like ' + d.like + ' (sign-ins, files, history, Goals and Plans are never copied)' : 'Standard settings']] });
    if (way !== 'restore') {
      const hist = way === 'online' ? (d.cloneAs === 'jujutsu' ? 'Jujutsu (copied with it)' : 'Git (copied with it)') : way === 'device' ? 'Its own Git history' : info && info.history ? 'Its own ' + (info.history === 'jujutsu' ? 'Jujutsu' : 'Git') + ' history' : d.history === 'none' ? (d.online !== 'none' ? 'Git (needed for the online copy)' : 'No history') : d.history === 'jujutsu' ? 'Jujutsu' : 'Git';
      const onl = way === 'online' ? (svc && d.repo ? svc.name + ' · ' + d.repo : NOT) : info && info.online ? info.online.service + ' · ' + info.online.repo : d.online === 'none' ? 'Not now' : d.online === 'github' ? 'New on GitHub: jared/' + (d.onlineName || slug(d.name)) + ' · ' + (d.privacy === 'public' ? 'Everyone' : 'Only you') : d.online === 'gitlab' ? 'New on GitLab' : 'Another service';
      const bk = { later: 'Later', nas: 'Home NAS · every night', gdrive: 'Google Drive · every night', onedrive: 'OneDrive · every night', s3: 'S3 or B2 · every night', sftp: 'Another server · every night' }[d.backup];
      groups.push({ label: 'Keeping it safe', step: 'safe', rows: [['Versions', hist], ['Online copy', onl], ['Backup', bk]] });
    } else {
      groups.push({ label: 'From the backup', step: 'backup', rows: [['Brings back', (d.restorePick || '—') + ': files with history, plans, chats, notes and settings'], ['Never brings back', 'Passwords and keys']] });
    }
    return groups;
  }

  /* the steps the creation will run, each with the owner command it stands for (shown in Details only) */
  function phases(s) {
    const d = s.draft, name = d.name, svc = ENV.services.find((x) => x.id === d.service), info = d.folderInfo;
    const out = [];
    const tpl = ENV.templates.find((t) => t.id === d.template);
    // starting files have no owner yet: cmd.project_template.* is a saved settings template (PJCT-003), not files
    if (d.way === 'new') { out.push({ label: 'Making the folder ' + placeFor(s), cmd: 'cmd.project.new_local' }); if (tpl && tpl.id !== 'empty') out.push({ label: 'Adding the ' + tpl.title + ' starter', cmd: 'no owner yet (starting files)' }); }
    if (d.way === 'folder') out.push({ label: 'Checking ' + d.folder + ' again', cmd: 'cmd.project.source_location.test' });
    if (d.way === 'device') out.push({ label: 'Connecting to ' + ((ENV.devices.find((x) => x.id === d.device) || {}).name || 'the device'), cmd: 'cmd.project.source_location.test' });
    if (d.way === 'online') { if (d.fork) out.push({ label: 'Making your fork on ' + svc.name, cmd: 'cmd.forge.repository.fork', remote: true }); out.push({ label: 'Copying ' + d.repo + ' with ' + (d.cloneAs === 'jujutsu' ? 'Jujutsu' : 'Git'), cmd: d.cloneAs === 'jujutsu' ? 'cmd.jujutsu.git.clone' : 'cmd.source_control.repository.clone', clone: true }); }
    if (d.way === 'restore') { out.push({ label: 'Getting the backup', cmd: 'cmd.restore.preview' }); out.push({ label: 'Checking it is complete', cmd: 'cmd.restore.preview' }); out.push({ label: 'Putting ' + d.restorePick + ' back as ' + name, cmd: 'cmd.restore.project_as_new' }); }
    const needsHist = (d.way === 'new' || (d.way === 'folder' && !(info && info.history))) && (d.history !== 'none' || d.online !== 'none');
    if (needsHist) out.push({ label: 'Turning on ' + (d.history === 'jujutsu' ? 'Jujutsu' : 'Git') + ' history', cmd: 'cmd.source_control.backend.select' });
    if (d.like) out.push({ label: 'Copying settings from ' + d.like, cmd: 'cmd.settings.transaction.preview' });
    if (d.way !== 'restore' && d.way !== 'online' && !(info && info.online) && d.online === 'github') out.push({ label: 'Creating jared/' + (d.onlineName || slug(name)) + ' on GitHub', cmd: 'cmd.project.new_github_repo', remote: true }, { label: 'Sending the first version', cmd: 'cmd.source_control.remote.publish', clone: true });
    if (d.way !== 'restore' && d.backup !== 'later') out.push({ label: 'Turning on backups to ' + ({ nas: 'Home NAS', gdrive: 'Google Drive', onedrive: 'OneDrive', s3: 'S3 or B2', sftp: 'another server' }[d.backup]), cmd: 'cmd.backup.project.create' });
    out.push({ label: 'Adding it to your Projects', cmd: 'cmd.project.add_existing' });
    return out;
  }

  /* run the creation. fail: true makes the copy step fail after a remote was made (the recovery demo) */
  async function commit(s, opts) {
    opts = opts || {};
    // nothing is made from an incomplete draft: the first step with a problem stops it (onboarding's missing())
    const open = s.steps().find((id) => problem(s, id));
    if (open) return { ok: false, project: null, said: problem(s, open), step: open };
    const d = s.draft, list = phases(s), name = d.name.trim();
    const failAt = opts.fail ? list.findIndex((p) => p.clone) : -1;
    const madeRemote = [];
    for (let i = 0; i < list.length; i++) {
      if (opts.onPhase) opts.onPhase(i, list, 'working');
      await PJX.wait(PJX.reduced() ? 180 : (list[i].remote || list[i].clone ? 1100 : 650));
      if (i === failAt) {
        if (opts.onPhase) opts.onPhase(i, list, 'failed');
        if (!madeRemote.length && list.slice(0, i).every((p) => !p.remote)) {
          return { ok: false, project: null, said: 'Copying failed: the network dropped. Nothing was made. Try again when you are back online.' };
        }
        const p = project(s, 'recovery');
        p.recovery = { settled: madeRemote.map((r) => ({ label: r.label.replace(/^Creating (.+) on (\S+)$/, 'Made $1 on $2').replace(/^Making your fork on/, 'Made your fork on'), ref: null })), remaining: list.slice(i).map((x) => ({ label: x.label, cmd: x.cmd })) };
        p.attention = [{ code: 'setup_unfinished', key: 'waiting', title: 'Setup didn’t finish', text: madeRemote.map((r) => r.label.replace(/^Creating /, '')).join(', ') + ' was made, then copying failed (the network dropped). Nothing else was made.', actions: ['resume', 'open_online', 'remove'] }];
        p.activity = { key: 'waiting', word: 'Setup didn’t finish', text: 'Stopped at step ' + (i + 1) + ' of ' + list.length, at: 'just now' };
        PJX.ACT.add(p);
        return { ok: false, project: p };
      }
      if (list[i].remote) madeRemote.push(list[i]);
      if (opts.onPhase) opts.onPhase(i, list, 'complete');
    }
    const p = project(s, 'listed');
    PJX.ACT.add(p);
    return { ok: true, project: p };
  }
  /* the Project the reviewed draft becomes */
  function project(s, lifecycle) {
    const d = s.draft, info = d.folderInfo, name = d.name.trim();
    const svc = ENV.services.find((x) => x.id === d.service);
    const tpl = ENV.templates.find((t) => t.id === d.template);
    const dev = ENV.devices.find((x) => x.id === d.device);
    const histBackend = d.way === 'online' ? d.cloneAs : d.way === 'device' ? 'git' : info && info.history ? info.history : d.history === 'none' ? (d.online !== 'none' ? 'git' : 'none') : d.history;
    const online = d.way === 'online' ? { service: svc ? svc.name : 'Git', repo: d.repo, state: 'complete', ahead: 0, behind: 0, privacy: 'Only you', note: d.fork ? 'Your fork' : 'Up to date' }
      : info && info.online ? { service: info.online.service, repo: info.online.repo, state: 'complete', ahead: 0, behind: 0, privacy: 'Only you' }
        : d.online === 'github' ? { service: 'GitHub', repo: 'jared/' + (d.onlineName || slug(name)), state: lifecycle === 'listed' ? 'complete' : 'complete', ahead: 0, behind: 0, privacy: d.privacy === 'public' ? 'Everyone' : 'Only you', note: lifecycle === 'listed' ? 'Up to date' : 'Created on GitHub' }
          : { service: null, repo: null, state: 'off' };
    const dests = { nas: 'Home NAS', gdrive: 'Google Drive', onedrive: 'OneDrive', s3: 'S3 or B2', sftp: 'Another server' };
    const backup = d.way === 'restore' ? { dest: null, state: 'off', versions: 0 } : d.backup === 'later' ? { dest: null, state: 'off', versions: 0 } : { dest: dests[d.backup], schedule: 'Every night', last: lifecycle === 'listed' ? 'just now' : null, state: lifecycle === 'listed' ? 'complete' : 'pending', versions: lifecycle === 'listed' ? 1 : 0, note: lifecycle === 'listed' ? null : 'Starts after setup' };
    return {
      id: slug(name) + '-' + PJX.uid('n').split('-').pop(), name, glyph: d.way === 'online' ? 'cloud' : d.way === 'device' ? 'server' : d.way === 'restore' ? 'history' : tpl && tpl.glyph !== 'folder' ? tpl.glyph : 'seed',
      active: false, lifecycle, order: PJX.all().length,
      stack: d.way === 'new' ? ({ web: ['SvelteKit'], api: ['Rust · Axum'], fullstack: ['SvelteKit', 'Axum', 'Postgres', 'Docker'], desktop: ['Rust', 'Slint'], script: ['Python'] }[d.template] || []) : info && info.stack ? info.stack : [],
      where: d.way === 'device' ? { kind: 'device', label: dev.name, path: d.devicePath, device: dev.name, via: 'SSH' } : { kind: 'local', label: 'This computer', path: d.way === 'folder' ? d.folder : placeFor(s), pending: lifecycle !== 'listed' },
      opened: 'Just added', openedRank: -0.5,
      activity: lifecycle === 'listed' ? { key: 'idle', word: 'Ready', text: d.way === 'restore' ? 'Restored from a backup · plan or open it' : 'Ready to plan in the Planning Wizard', at: 'just now', runs: 0 } : { key: 'waiting', word: 'Setup didn’t finish', text: '', at: 'just now', runs: 0 },
      history: { backend: histBackend === 'none' ? 'none' : histBackend, branch: 'main', worktrees: lifecycle === 'listed' ? 1 : 0, changed: 0 },
      online, backup, sync: { devices: lifecycle === 'listed' ? 2 : 0, state: lifecycle === 'listed' ? 'complete' : 'pending' },
      attention: lifecycle === 'listed' && backup.dest == null && d.way !== 'restore' ? [] : [],
      fresh: true
    };
  }

  /* ------------------------------------------------------------------ the folder picker sheet */
  function picker(s, onPick) {
    const at = s.ui.treeAt || '~', kids = ENV.tree[at] || [];
    const crumbs = h('div.pjx-crumbs');
    at.split('/').reduce((acc, part, i) => { const p = i ? acc + '/' + part : part; const b = h('button.pjx-link', { type: 'button', text: i ? part : 'Home' }); b.addEventListener('click', () => { s.ui.treeAt = p; s.changed(); }); if (i) crumbs.appendChild(h('span.pjx-crumb-sep', { 'aria-hidden': 'true', html: icon('chevron-right', 12) })); crumbs.appendChild(b); return p; }, '');
    const list = h('div.pjx-tree', { role: 'listbox', 'aria-label': 'Choose a folder' });
    kids.forEach((k) => {
      const path = at + '/' + k;
      const b = h('button.pjx-tree-item', { type: 'button', role: 'option', html: icon('folder', 15) + '<span>' + esc(k) + '</span>' + (ENV.tree[path] ? icon('chevron-right', 13) : '') });
      b.addEventListener('click', () => { if (ENV.tree[path]) { s.ui.treeAt = path; s.changed(); } else onPick(path); });
      list.appendChild(b);
    });
    if (!kids.length) list.appendChild(h('div.pjx-hint', { text: 'No folders inside' }));
    const use = h('button.pjx-btn', { type: 'button', disabled: at === '~' ? true : null, text: 'Choose this folder' });
    use.addEventListener('click', () => onPick(at));
    return h('div.pjx-picker', null, crumbs, list, h('div.pjx-row', null, use));
  }

  /* ------------------------------------------------------------------ rendering */
  function stepHead(s, id) {
    const st = STEPS[id];
    return h('header.pjx-q', null, h('h2.pjx-q-title', { text: st.title(s) }), st.lead ? h('p.pjx-q-lead', { text: st.lead(s) }) : null);
  }
  /* draw a step into container; keeps the focused text field (by key) and its caret across re-renders */
  function render(s, container, opts) {
    opts = opts || {};
    const act = W.document.activeElement, key = act && act.getAttribute && act.getAttribute('data-pjx-key');
    const caret = key && act.selectionStart != null ? [act.selectionStart, act.selectionEnd] : null;
    const scroll = container.scrollTop;
    container.innerHTML = '';
    const ids = opts.all ? s.steps().filter((x) => x !== 'way' && x !== 'review' && (x !== 'source')) : [opts.only || s.step];
    ids.forEach((id) => {
      const st = STEPS[id]; if (!st) return;
      const sec = h('section', { class: ['pjx-step', 'pjx-step-' + id], 'data-step': id });
      if (!opts.noHead) sec.appendChild(stepHead(s, id));
      sec.appendChild(st.body(s));
      container.appendChild(sec);
    });
    if (key) {
      const el = container.querySelector('[data-pjx-key="' + key + '"]');
      if (el) { el.focus({ preventScroll: true }); if (caret) try { el.setSelectionRange(caret[0], caret[1]); } catch (e) { /* not a text field */ } }
    }
    container.scrollTop = scroll;
    return container;
  }
  /* the creating list: one row per phase with its mark */
  function phaseList(list, states) {
    return h('ol.pjx-phases', null, ...list.map((p, i) => {
      const st = states[i] || 'pending';
      return h('li', { class: ['pjx-phase', 'is-' + st] }, h('span.pjx-phase-mark', { html: mark(st === 'complete' ? 'complete' : st === 'failed' ? 'failed' : st === 'working' ? 'working' : 'pending', 14), 'aria-hidden': 'true' }), h('span.pjx-phase-label', { text: p.label }));
    }));
  }

  PJX.flow = { WAYS, MORE, STEPS, start, detect, applyDetected, chooseWay, step: (s, id) => STEPS[id], problem, render, stepHead, review, phases, commit, phaseList, choices, field, group, facts, seg, textInput, keyed, picker, placeFor, nameProblem, slug };
})(window);
