/* Chapter 3 — Project [first_project -> server_storage_client]: how the Project begins, an existing folder, the name
   and where its files live, and "Start like another Project?" (the real Settings Transfer owner's preview). Nothing
   here creates anything: it all lands in the draft and only the reviewed commit acts on it. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const onServer = (S) => md(S).server_mode !== 'this_device';
  const serverName = (S) => {
    const d = md(S);
    if (d.server_mode === 'new_server') return S.sess.server.displayName || 'Home NAS';
    const s = O55.connect && O55.connect.allServers(S).find((x) => x.id === d.server_ref);
    return s ? s.name : 'Home NAS';
  };
  const serverProjects = (S) => { const d = md(S); const s = d.server_mode === 'existing_server' && O55.connect ? O55.connect.allServers(S).find((x) => x.id === d.server_ref) : null; return s ? s.projects : []; };
  const pretty = (s) => String(s || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());
  const docsPath = (S, name) => S.env.here.projectsRoot + ' › ' + (name || T('name.placeholder'));

  /* ------------------------------------------------------------------ how should your Project begin? */
  const choiceOf = (S) => {
    const d = md(S), ui = S.sess.ui;
    if (ui.begin) return ui.begin;
    return { new: 'new', existing_local: 'existing', existing_online: 'existing', restore: 'restore', later: 'new' }[d.project_mode] || 'new';
  };
  def('begin', {
    chapter: 'project', stage: 'first_project', charmSlot: 'begin',
    scene: (S) => ({ id: 'begin', beat: choiceOf(S) === 'existing' ? (S.sess.ui.beginSub || 'folder') : choiceOf(S) }),
    enter(S) { S.sess.active = 'main'; },
    eyebrow: () => T('begin.eyebrow'),
    title: () => T('begin.title'),
    lead: () => T('begin.lead'),
    body(S) {
      const sel = choiceOf(S), sub = S.sess.ui.beginSub;
      let out = '';
      if (onServer(S)) out += `<div class="o55-banner o55-banner-soft" data-key="server">${C.small('server', 18)}<span>${U.esc(T('begin.server', { name: serverName(S) }))}</span></div>`;
      out += C.cards('pick', [
        { v: 'new', glyph: 'seed', title: T('begin.new.title'), sub: T('begin.new.sub'), tag: T('chrome.recommended') },
        { v: 'existing', glyph: 'folder', title: T('begin.existing.title'), sub: T('begin.existing.sub') },
        { v: 'restore', glyph: 'rewind', title: T('begin.restore.title'), sub: T('begin.restore.sub') }
      ], sel, { label: T('begin.title') });
      if (sel === 'existing') {
        out += `<div class="o55-subchoices" data-key="sub">` + C.cards('sub', [
          { v: 'folder', glyph: 'folder', title: onServer(S) ? T('begin.folderOn.title', { name: serverName(S) }) : T('begin.folder.title'), sub: onServer(S) ? T('begin.folderOn.sub', { name: serverName(S) }) : T('begin.folder.sub'), quiet: true },
          { v: 'online', glyph: 'cloud', title: T('begin.online.title'), sub: T('begin.online.sub'), quiet: true },
          { v: 'device', glyph: 'server', title: T('begin.device.title'), sub: T('begin.device.sub'), quiet: true }
        ], sub, { cls: 'o55-choices-quiet', label: T('begin.existing.title') }) + '</div>';
      }
      out += `<div class="o55-sublinks" data-key="later">${C.link(T('begin.later'), 'later')}</div>`;
      return out;
    },
    foot(S) {
      const need = choiceOf(S) === 'existing' && !S.sess.ui.beginSub;
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: need, reason: T('begin.existing.sub') } };
    },
    do: {
      pick(S, v, el) {
        S.sess.ui.begin = v; if (v !== 'existing') S.sess.ui.beginSub = null;
        O55.draft.set(md(S), { source_more: v === 'existing' }); S.save(); O55.ui.refresh();
        O55.ui.charm(el, T('begin.' + v + '.title').split(' ').slice(0, 3).join(' '), { new: 'seed', existing: 'folder', restore: 'rewind' }[v]);
      },
      sub(S, v) { S.sess.ui.beginSub = v; S.save(); O55.ui.refresh(); },
      /* a Project can wait, but a new Server is being set up now: its access away from home is still asked (canon
         skips only the provider phases for a deferred Project) */
      later(S) { O55.draft.set(md(S), { project_mode: 'later', source_more: false, online_mode: 'none' }); S.sess.ui.begin = null; S.save(); O55.ui.go(md(S).server_mode === 'new_server' ? 'away' : 'review'); },
      next(S) {
        const d = md(S), sel = choiceOf(S), sub = S.sess.ui.beginSub;
        const clearOnline = d.project_mode === 'existing_online' ? { online_mode: 'none', repository_ref: '' } : {};
        if (sel === 'new') { O55.draft.set(d, Object.assign({ project_mode: 'new', project_transport: 'local', project_source_ref: '', source_more: false }, clearOnline)); S.save(); return O55.ui.go('name'); }
        if (sel === 'restore') { S.sess.restore = { scope: 'project' }; S.save(); return O55.ui.go('r-source'); }
        if (sub === 'folder') { O55.draft.set(d, Object.assign({ project_mode: 'existing_local', project_transport: 'local', source_more: true }, clearOnline)); S.save(); return O55.ui.go('ex-folder'); }
        if (sub === 'online') { O55.draft.set(d, { project_mode: 'existing_online', online_mode: 'existing', source_more: true }); S.sess.online = Object.assign(S.sess.online || {}, { purpose: 'source' }); S.save(); return O55.ui.go('online-service'); }
        O55.draft.set(d, Object.assign({ project_mode: 'existing_local', project_transport: 'ssh', source_more: true }, clearOnline));
        S.sess.nas = Object.assign(S.sess.nas || {}, { purpose: 'source' }); S.save();
        return O55.ui.go('nas-find');
      }
    }
  });

  /* ------------------------------------------------------------------ an existing folder on this computer */
  const TREE = {
    '~': ['Documents', 'Desktop', 'Code', 'Downloads'], '~/Documents': ['recipe-app', 'Taxes 2025', 'Book club'], '~/Desktop': ['garden notes'],
    '~/Code': ['budget-tracker', 'dotfiles'], '~/Downloads': []
  };
  /* the folders the work computer has: this computer's, or on a Server the Server's own */
  const recent = (S) => (onServer(S) ? S.env.serverFolders : S.env.here.recentFolders);
  const treeOf = (S) => (onServer(S) ? S.env.serverTree : TREE);
  const treeRoot = (S) => (onServer(S) ? '/mnt/tank' : '~');
  function folderInfo(S, path) {
    const r = recent(S).find((f) => f.path === path);
    return r || { path, name: path.split('/').pop(), history: /budget|dotfiles/.test(path) ? 'git' : null, online: null };
  }
  def('ex-folder', {
    chapter: 'project', stage: 'first_project',
    scene: () => ({ id: 'begin', beat: 'folder' }),
    eyebrow: () => T('folder.eyebrow'),
    title: (S) => (onServer(S) ? T('folder.titleOn', { name: serverName(S) }) : T('folder.title')),
    lead: (S) => (onServer(S) ? T('folder.leadOn', { name: serverName(S) }) : T('folder.lead')),
    body(S) {
      const f = S.sess.folder || {}, sheet = S.sess.ui.sheet === 'tree', rs = recent(S), tree = treeOf(S), root = treeRoot(S);
      let out = C.group(T('folder.recent'), C.cards('pick', rs.map((r) => ({ v: r.path, glyph: 'folder', title: r.name, sub: r.path }))
        .concat(f.path && !rs.some((r) => r.path === f.path) ? [{ v: f.path, glyph: 'folder', title: f.path.split('/').pop(), sub: f.path }] : []), f.path, { label: T('folder.recent') }));
      out += `<div class="o55-sublinks" data-key="browse">${C.link(T('folder.browse'), 'browse')}</div>`;
      if (sheet) {
        const at = S.sess.ui.treeAt || root, kids = tree[at] || [];
        const crumbs = at.split('/').map((part, i, arr) => ({ part, path: arr.slice(0, i + 1).join('/') })).filter((c) => c.path && (c.path === root || c.path.startsWith(root)))
          .map((c) => C.link(c.path === root ? (root === '~' ? T('folder.tree.home') : serverName(S)) : c.part, 'treeGo', c.path)).join(' <span aria-hidden="true">›</span> ');
        const body = `<div class="o55-crumbs" data-key="crumbs">${crumbs}</div><div class="o55-treelist" role="listbox" aria-label="${U.esc(T('folder.picker'))}">`
          + kids.map((k) => `<button type="button" class="o55-treeitem" role="option" data-o55-do="treeGo" data-arg="${U.esc(at + '/' + k)}" data-pm-hover-exempt="true" data-key="ti-${U.esc(U.slug(k))}">${C.small('folder', 16)}<span>${U.esc(k)}</span></button>`).join('') + '</div>';
        out += C.sheet(S, 'tree', T('folder.picker'), body, O55.ui.btn({ label: T('folder.open'), do: 'treePick', disabled: at === root, reason: T('missing.folder') }, 'o55-primary'));
      }
      if (f.path) {
        const st = F.state(S, 'folder:' + f.path);
        out += F.phases(S, 'folder:' + f.path, ['read'], { read: T('folder.checking') });
        if (st && st.state === 'done') {
          const info = folderInfo(S, f.path);
          out += `<ul class="o55-will" data-key="finfo"><li>${C.small('history', 14)}<span>${U.esc(info.history ? T('folder.hasHistory', { kind: info.history === 'jujutsu' ? 'Jujutsu' : 'Git' }) : T('folder.noHistory'))}</span></li>`
            + (info.online ? `<li>${C.small('cloud', 14)}<span>${U.esc(T('folder.online', { service: O55.fixtures.forge(info.online.forge).name }) + ' · ' + info.online.repo)}</span></li>` : '') + '</ul>';
        }
      }
      return out;
    },
    foot(S) {
      const f = S.sess.folder || {}, st = f.path && F.state(S, 'folder:' + f.path);
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !(st && st.state === 'done'), reason: T('missing.folder') } };
    },
    do: {
      pick(S, path) { S.sess.folder = { path }; S.save(); F.op(S, 'folder:' + path, 'cmd.project.source_location.test', [{ key: 'read', ms: 700 }], { payload: { path } }); O55.ui.refresh(); },
      browse(S) { S.sess.ui.sheet = 'tree'; S.sess.ui.treeAt = treeRoot(S); S.save(); O55.ui.refresh(); },
      treeGo(S, path) { const tree = treeOf(S); S.sess.ui.treeAt = path; if (!tree[path]) tree[path] = []; S.save(); O55.ui.refresh(); },
      treePick(S) { const path = S.sess.ui.treeAt; S.sess.ui.sheet = null; S.save(); O55.screens.defs['ex-folder'].do.pick(S, path); },
      next(S) {
        const path = S.sess.folder.path, info = folderInfo(S, path), d = md(S);
        O55.draft.set(d, { project_source_ref: 'folder:' + path.replace(/^~\//, 'home/').replace(/\s+/g, '-'), local_location_mode: 'custom', local_location: path, history_backend: info.history === 'jujutsu' ? 'jujutsu' : d.history_backend, project_name: d.project_name || pretty(info.name), preflight_result_refs: Array.from(new Set(d.preflight_result_refs.concat(['preflight:folder:' + U.slug(path)]))).slice(0, 32) });
        S.sess.folderInfo = info; S.save();
        O55.ui.go('name');
      }
    }
  });

  /* ------------------------------------------------------------------ name + where its files live */
  function nameProblem(S, name) {
    const v = String(name || '').trim();
    if (!v) return T('name.empty');
    if (v.length > 60) return T('name.long');
    const taken = S.env.here.projects.concat(serverProjects(S)).find((p) => p.name.toLowerCase() === v.toLowerCase());
    if (taken) return T('name.exists', { name: taken.name });
    return '';
  }
  def('name', {
    chapter: 'project', stage: 'first_project', charmSlot: 'name',
    scene: (S) => ({ id: 'name', beat: 'type', params: { name: md(S).project_name || '' } }),
    eyebrow: () => T('name.eyebrow'),
    title: () => T('name.title'),
    lead: () => T('name.lead'),
    body(S) {
      const d = md(S), prob = nameProblem(S, d.project_name), touched = S.sess.ui.nameTouched;
      let out = C.field({ bind: 'name', label: T('name.label'), value: d.project_name, placeholder: T('name.placeholder'), hint: prob ? '' : (d.project_name ? T('name.ok') : ''), error: touched && prob ? prob : '', valid: !prob, invalid: touched && !!prob, autocomplete: 'off' });
      if (d.project_mode === 'new') out += F.chips('suggest', O55.tx('name.suggest'), d.project_name);
      /* where its files live: an existing folder stays where it is (also on a Server); a new or copied Project on a
         Server offers the Server, this device or a network drive */
      if (d.project_mode === 'existing_local') {
        const path = d.project_transport === 'ssh' ? (S.sess.nas && S.sess.nas.folderLabel) || d.project_source_ref : d.local_location;
        out += `<p class="o55-locline" data-key="loc">${C.small('folder', 16)}<span>${U.esc(onServer(S) && d.project_transport === 'local' ? T('name.keptOn', { path, name: serverName(S) }) : T('name.kept', { path }))}</span></p>`;
      } else if (onServer(S)) {
        const nm = serverName(S);
        out += C.group(T('name.serverTitle'), C.cards('storage', [
          { v: 'with_server', glyph: 'server', title: T('name.withServer', { name: nm }), sub: T('name.withServerSub'), tag: T('chrome.recommended') },
          { v: 'this_device', glyph: 'computer', title: T('name.onDevice'), sub: T('name.onDeviceSub', { name: nm }) },
          { v: 'network_location', glyph: 'folder', title: T('name.networkDrive'), sub: d.storage_location ? d.storage_location.replace(/^[a-z]+:/, '') : T('name.networkDriveSub') }
        ], d.storage_mode, { label: T('name.serverTitle') }));
      } else {
        const path = d.local_location_mode === 'custom' && d.local_location ? d.local_location : d.storage_mode === 'network_location' ? d.storage_location.replace(/^[a-z]+:/, '') : docsPath(S, d.project_name);
        out += `<p class="o55-locline" data-key="loc">${C.small('folder', 16)}<span>${U.esc(T('name.kept', { path }))}</span>${C.link(T('name.change'), 'change')}</p>`;
        if (S.sess.ui.sheet === 'loc') {
          const cur = d.storage_mode === 'network_location' ? 'network' : d.local_location_mode === 'custom' ? 'custom' : 'auto';
          let body = C.cards('loc', [
            { v: 'auto', glyph: 'computer', title: T('name.thisComputer'), sub: docsPath(S, d.project_name) },
            { v: 'custom', glyph: 'folder', title: T('name.otherFolder') },
            { v: 'network', glyph: 'server', title: T('name.network'), sub: T('name.networkSub') }
          ], cur, { cls: 'o55-choices-quiet' });
          if (cur === 'custom') body += C.field({ bind: 'custom', label: T('folder.picker'), value: d.local_location || '~/Documents/', placeholder: '~/Documents/Clubs' });
          out += C.sheet(S, 'loc', T('name.changeTitle'), body, O55.ui.btn({ label: T('chrome.done'), do: 'sheet-close' }, 'o55-primary'));
        }
      }
      return out;
    },
    foot(S) {
      const d = md(S), prob = nameProblem(S, d.project_name), miss = O55.draft.missing(d).find((m) => m.field === 'storage_location');
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!prob || !!miss, reason: prob || (miss ? T(miss.key) : '') } };
    },
    do: {
      suggest(S, v, el) { S.sess.ui.nameTouched = true; O55.draft.set(md(S), { project_name: v }); S.save(); O55.ui.refresh(); },
      storage(S, v) {
        O55.draft.set(md(S), { storage_mode: v });
        S.save();
        if (v === 'network_location' && !md(S).storage_location) { S.sess.nas = Object.assign(S.sess.nas || {}, { purpose: 'storage' }); S.save(); return O55.ui.go('nas-find'); }
        O55.ui.refresh();
      },
      change(S) { S.sess.ui.sheet = 'loc'; S.save(); O55.ui.refresh(); },
      loc(S, v) {
        const d = md(S);
        if (v === 'auto') O55.draft.set(d, { local_location_mode: 'automatic', local_location: '', storage_mode: 'this_device' });
        if (v === 'custom') O55.draft.set(d, { local_location_mode: 'custom', local_location: d.local_location || '~/Documents/' + (d.project_name || 'Project'), storage_mode: 'this_device' });
        if (v === 'network') { S.sess.ui.sheet = null; S.sess.nas = Object.assign(S.sess.nas || {}, { purpose: 'storage' }); O55.draft.set(d, { storage_mode: 'network_location', storage_transport: 'ssh' }); S.save(); return O55.ui.go('nas-find'); }
        S.save(); O55.ui.refresh();
      },
      next(S) {
        const d = md(S);
        if (!d.repository_name || d.online_mode === 'none') O55.draft.set(d, { repository_name: U.slug(d.project_name) });
        S.save();
        O55.ui.charm(S.root.querySelector('#o55f-name'), d.project_name, 'seed');
        O55.ui.go(O55.like.eligible(S) ? 'like' : 'safe');
      }
    },
    bind: {
      name(S, v) { S.sess.ui.nameTouched = true; O55.draft.set(md(S), { project_name: v }); S.save(); O55.ui.refresh(); },
      custom(S, v) { O55.draft.set(md(S), { local_location: v }); S.save(); }
    },
    leave(S) { if (S.sess.ui.sheet === 'loc') { S.sess.ui.sheet = null; S.save(); } }
  });

  /* ------------------------------------------------------------------ Start like another Project? */
  const ST = () => window.PM12_KIMI && window.PM12_KIMI.o55SettingsTransfer;
  /* Owner-read snapshots for the demo Projects: in the concept the Settings owner has none until a Project has been
     opened, so the returning-user world seeds each known Project's projection from the current settings with a few
     real differences per owner category (a stated concept limitation). */
  function seed(S, projects) {
    const st = ST(), tome = window.PM7_SETTINGS_TOME; if (!st || !tome) return;
    const snaps = window.PM_SETTINGS_PROJECT_SNAPSHOTS = window.PM_SETTINGS_PROJECT_SNAPSHOTS || {};
    const rows = Object.values((window.PM12_REFERENCE && window.PM12_REFERENCE.byCat) || {}).flatMap((c) => c.settings || []);
    const live = window.PM12_KIMI && window.PM12_KIMI.getState ? window.PM12_KIMI.getState() : null;
    const base = { settings: (live && live.settings) || Object.fromEntries(rows.map((r) => [r.id, r.default])) };
    projects.forEach((p, pi) => {
      if (snaps[p.id] || tome.projectSnapshot(p.id)) return;
      const settings = JSON.parse(JSON.stringify(base.settings));
      st.categories().forEach((cat) => {
        rows.filter((r) => r.type === 'toggle' && st.categoryFor(r.id) === cat).slice(pi % 2, (pi % 2) + 2).forEach((r) => { settings[r.id] = !(settings[r.id] != null ? settings[r.id] : r.default); });
      });
      snaps[p.id] = { label: p.name, settings, revision: 3 + pi };
    });
  }
  O55.like = {
    sources(S) {
      const known = S.env.here.projects.concat(serverProjects(S));
      if (!ST() || !known.length) return [];
      seed(S, known);
      return known.filter((p) => window.PM7_SETTINGS_TOME.projectSnapshot(p.id));
    },
    eligible(S) { const d = md(S); return d.journey === 'new_or_local' && d.project_mode === 'new' && O55.like.sources(S).length > 0 && ST().categories().length > 0; },
    preview(S, id) { const st = ST(); if (!st) return null; const cats = (S.sess.like && S.sess.like.categories) || null; return st.draftPreview(id, cats); }
  };
  async function sha256(text) {
    try { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''); }
    catch (_) { let h = ''; for (let i = 0; i < 8; i++) h += U.hash(text + i).toString(16).padStart(8, '0'); return h; }
  }
  def('like', {
    chapter: 'project', stage: 'first_project', charmSlot: 'like',
    scene: (S) => ({ id: 'like', beat: md(S).settings_transfer.mode === 'copy_from_project' ? 'copy' : 'fresh' }),
    eyebrow: () => T('like.eyebrow'),
    title: () => T('like.title'),
    lead: () => T('like.lead'),
    body(S) {
      const d = md(S), sel = d.settings_transfer.mode === 'copy_from_project' ? d.settings_transfer.source_project_id : 'fresh';
      const sources = O55.like.sources(S);
      let out = C.cards('pick', [{ v: 'fresh', glyph: 'seed', title: T('like.fresh'), sub: T('like.freshSub') }].concat(sources.map((p) => ({ v: p.id, glyph: 'stack', title: p.name, sub: T('like.updated', { when: p.updated || '' }) }))), sel, { label: T('like.title') });
      if (sel !== 'fresh') {
        const pv = O55.like.preview(S, sel), p = sources.find((x) => x.id === sel) || { name: sel };
        if (pv && pv.ok) {
          const names = Object.keys(pv.groups).map((g) => O55.tx('like.groups')[g] || g.toLowerCase());
          const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' ' + T('like.and') + ' ' + names[names.length - 1] : names[0] || '';
          let inner = `<p class="o55-previewtext">${U.esc(T('like.preview', { groups: list }))}</p>` + C.note(T('like.never'), 'info', 'lock');
          const unavailable = (p.providers || []).filter((pid) => { const pr = S.env.here.providers[pid]; return !(pr && pr.signedIn); });
          if (unavailable.length) inner += C.note(T('like.unavailable', { project: p.name }), 'warn', 'spark');
          inner += `<div class="o55-sublinks" data-key="choose">${C.link(T('like.choose'), 'choose')}</div>`;
          out += C.group(T('like.previewTitle'), inner, { cls: 'o55-preview' });
          if (S.sess.ui.sheet === 'cats') {
            const all = ST().categories(), on = new Set((S.sess.like && S.sess.like.categories) || all);
            out += C.sheet(S, 'cats', T('like.chooseTitle'), all.map((cat) => C.toggle({ do: 'cat', arg: cat, on: on.has(cat), label: cat, sub: T('like.count', { n: (pv.groups[cat] || []).length }) })).join(''), O55.ui.btn({ label: T('chrome.done'), do: 'sheet-close' }, 'o55-primary'));
          }
        } else if (pv) out += C.note(pv.reason || '', 'warn');
      }
      return out;
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      async pick(S, v, el) {
        const d = md(S);
        if (v === 'fresh') { O55.draft.set(d, { settings_transfer: { mode: 'start_fresh', source_project_id: null, source_revision: null, draft_preview_ref: null, draft_preview_sha256: null, explicit_choice_setting_ids: [], settings_applied: false } }); S.save(); O55.ui.refresh(); O55.ui.charm(el, T('like.fresh'), 'seed'); return; }
        O55.owners.dispatch('cmd.settings.transaction.preview', { source: v }, S.ctx(), () => ({ ok: true }));
        const pv = O55.like.preview(S, v), snap = window.PM7_SETTINGS_TOME.projectSnapshot(v) || {};
        const p = O55.like.sources(S).find((x) => x.id === v) || { name: v };
        O55.draft.set(d, { settings_transfer: { mode: 'copy_from_project', source_project_id: v, source_revision: Math.max(1, Number(snap.revision) || 1), draft_preview_ref: 'settings-preview:' + v, draft_preview_sha256: null, explicit_choice_setting_ids: [], settings_applied: false } });
        S.sess.like = Object.assign(S.sess.like || {}, { name: p.name });
        S.save(); O55.ui.refresh(); O55.ui.charm(el, p.name, 'stack');
        const hash = await sha256(JSON.stringify(pv || {}));
        if (md(S).settings_transfer.source_project_id === v) { md(S).settings_transfer.draft_preview_sha256 = hash; S.save(); }
      },
      choose(S) { S.sess.ui.sheet = 'cats'; S.save(); O55.ui.refresh(); },
      cat(S, cat) {
        const all = ST().categories(), cur = new Set((S.sess.like && S.sess.like.categories) || all);
        if (cur.has(cat)) cur.delete(cat); else cur.add(cat);
        S.sess.like = Object.assign(S.sess.like || {}, { categories: all.filter((c) => cur.has(c)) });
        S.save(); O55.ui.refresh();
      },
      next(S) { O55.ui.go('safe'); }
    },
    leave(S) { if (S.sess.ui.sheet === 'cats') { S.sess.ui.sheet = null; S.save(); } }
  });

  O55.project = { serverName, onServer, docsPath, nameProblem, pretty };
})();
