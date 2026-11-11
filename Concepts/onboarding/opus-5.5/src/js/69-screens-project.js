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
  const NO_PROJECTS = [];
  const serverProjects = (S) => { const d = md(S); const s = d.server_mode === 'existing_server' && O55.connect ? O55.connect.allServers(S).find((x) => x.id === d.server_ref) : null; return s ? s.projects : NO_PROJECTS; };
  const pretty = (s) => String(s || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());
  /* (with no name yet the path stops at the folder that will hold it: it used to end in the placeholder, which is also
     the first suggestion, so "Kept in … › Book club website" read as chosen before anything was typed; GLM's review) */
  const named = (name) => !!String(name || '').trim();
  const docsPath = (S, name) => S.env.here.projectsRoot + (named(name) ? ' › ' + name : '');
  /* No numeric priority. Coinciding events are ranked by O55.sound. */
  const SND = { warn: { intensity: 0.4 } };
  /* A folder step is a click, so the generic tap (rank 30) is queued in the same moment. Move's own rank is 20 and
     would be dropped. Copy's rank (34) sits just above tap and under every outcome, so the step is the one sound. */
  const MOVE_OVER_TAP = 34;
  let namedHere = null, namedSrv = null, namedList = null;
  function knownNames(S) {
    const here = S.env.here.projects, srv = serverProjects(S);
    if (here !== namedHere || srv !== namedSrv) { namedHere = here; namedSrv = srv; namedList = here.concat(srv); }
    return namedList;
  }
  /* The sheet is drawn at the end of the pane. Bring it into view in this same turn, then sound it. */
  function seeSheet(S) {
    const layer = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
    const sheet = layer && layer.querySelector('.o55-sheet[data-open="true"]');
    if (sheet) sheet.scrollIntoView({ block: 'nearest', behavior: O55.motion.reduced() ? 'auto' : 'smooth' });
    O55.sound.play('sheet');
  }

  /* ------------------------------------------------------------------ how should your Project begin? */
  const choiceOf = (S) => {
    const d = md(S), ui = S.sess.ui;
    if (ui.begin) return ui.begin;
    return { new: 'new', existing_local: 'existing', existing_online: 'existing', restore: 'restore', later: 'new' }[d.project_mode] || 'new';
  };
  /* A folder's place, its history and online copy, a backup's source and the destination it suggested, a NAS folder,
     and a name taken from any of them (never one the person typed) belong to the beginning that filled them in: they
     were carried into a new Project planned inside the old folder, and into a NAS folder's history (logic crawl).
     Facts about the person's devices (a trusted NAS, a key added to it) stay. */
  /* A beginning given up (canon FO-22, Sol's FO22-A2 and A3 at e9b704975a): everything derived from it goes here, once,
     before Continue takes any branch, so no branch's early return can keep a piece of it. Its picker's choice and
     completed check (the folder, the NAS device and mounted volume), the preflight and source-access references they
     wrote, the restore, and for an online source its service, server, account, repository and name, with the service
     picker choosing nothing; picking the same kind again starts empty with Continue off. Settled work outside the plan
     stays (a sign-in already made, a key already installed on the NAS, a host already trusted). */
  function resetBeginning(S, d, was) {
    /* (only the abandoned beginning's own references go: a files place on the NAS keeps its own, Muse delta minor 1) */
    const nasRef = (r) => /^(ssh-key|pairing):|^preflight:(ssh|paired-source):/.test(r), mine = (r) => /^preflight:folder:/.test(r) || (was === 'existing:device' && nasRef(r)) || (was === 'existing:online' && !nasRef(r) && !/^preflight:/.test(r));
    O55.draft.set(d, Object.assign({ project_mode: 'new', project_transport: 'local', local_location_mode: 'automatic', local_location: '', project_source_ref: '', backup_source_ref: '', backup_transport: 'local',
      preflight_result_refs: (d.preflight_result_refs || []).filter((r) => !mine(r)), source_access_authorization_refs: (d.source_access_authorization_refs || []).filter((r) => !mine(r)) }, S.sess.ui.nameTouched ? {} : { project_name: '' }));
    S.sess.folderInfo = null; S.sess.folder = null;
    Object.keys(S.sess.ops || {}).forEach((k) => { if (/^(folder|mounted|smb|nfs):/.test(k)) F.reset(S, k); });
    if (S.sess.nas && O55.nas && O55.nas.remember) O55.nas.remember(S); /* (its settled host and keys stay, 70) */
    /* (the NAS of the abandoned beginning goes; a files place on the NAS is the files answer's, not the beginning's, and
       keeps its folder and label, Muse delta2 minor 1 remainder; a restore's backup NAS goes with its restore) */
    if (S.sess.nas) { const p = S.sess.nas.purpose || 'source'; if (p === 'source' || p === 'backup') S.sess.nas = null; }
    if (S.sess.backup && S.sess.backup.fromRestore) { S.sess.backup.dest = null; S.sess.backup.fromRestore = false; }
    S.sess.restore = null;
    if (was === 'existing:online' || d.project_mode === 'existing_online') {
      O55.draft.set(d, { online_mode: 'none', forge: 'none', forge_provider_variant: null, forge_instance_url: '', forge_instance_profile: null, forge_account_ref: '', forge_account_action: null,
        repository_ref: '', repository_name: '', repository_owner_scope: 'personal', repository_container: '', repository_project: '', repository_visibility: null });
      d.forge_auth_method = null; S.sess.azureProjects = null; S.sess.online = { purpose: 'copy', unchosen: true };
    }
  }
  /* a new beginning is hung on the string: the sign swings with it and its icon pops in */
  const stage = (S) => S.root.querySelector('.o55-stage');
  function swapBeginning(S, dir) { if (O55.art.poke) O55.art.poke(stage(S), 'hero', { amp: 1.5, dir, pop: true }); }
  def('begin', {
    chapter: 'project', stage: 'first_project', charmSlot: 'begin',
    scene: (S) => ({ id: 'begin', beat: choiceOf(S) === 'existing' ? (S.sess.ui.beginSub || 'folder') : choiceOf(S) }),
    /* (the card shown is the beginning the plan holds: a record whose stored pick disagrees with its plan, a constructed or
       older one, shows the committed beginning, the lead's ruling 1103074359 and Sol reader-b's K9a case 6) */
    enter(S) {
      S.sess.active = 'main';
      const d = md(S), b = O55.branch && O55.branch.began ? O55.branch.began(S) : null;
      if (b && (S.sess.ui.beganAs || d.project_mode !== 'new')) {
        const [sel, sub] = b === 'later' ? ['new', null] : b.indexOf('existing:') === 0 ? ['existing', b.slice(9)] : [b, null];
        if (S.sess.ui.begin !== sel || (sel === 'existing' && S.sess.ui.beginSub !== sub)) { S.sess.ui.begin = sel; S.sess.ui.beginSub = sub; }
      }
    },
    eyebrow: () => T('begin.eyebrow'),
    title: () => T('begin.title'),
    lead: () => T('begin.lead'),
    body(S) {
      const sel = choiceOf(S), sub = S.sess.ui.beginSub;
      let out = '';
      if (onServer(S)) out += `<div class="o55-banner o55-banner-soft" data-key="server">${C.small('server', 18)}<span>${U.esc(T('begin.server', { name: serverName(S) }))}</span></div>`;
      /* where the existing work is: under its own card, above Restore (QA round 2, Q7; QA2 hunter H2) */
      const where = sel === 'existing' ? C.cards('sub', [
        { v: 'folder', glyph: 'folder', title: onServer(S) ? T('begin.folderOn.title', { name: serverName(S) }) : T('begin.folder.title'), sub: onServer(S) ? T('begin.folderOn.sub', { name: serverName(S) }) : T('begin.folder.sub'), quiet: true },
        { v: 'online', glyph: 'cloud', title: T('begin.online.title'), sub: T('begin.online.sub'), quiet: true },
        { v: 'device', glyph: 'server', title: T('begin.device.title'), sub: T('begin.device.sub'), quiet: true }
      ], sub, { cls: 'o55-choices-quiet', label: T('begin.existing.title') }) : '';
      out += C.cards('pick', [
        { v: 'new', glyph: 'seed', title: T('begin.new.title'), sub: T('begin.new.sub'), tag: T('chrome.recommended') },
        { v: 'existing', glyph: 'folder', title: T('begin.existing.title'), sub: T('begin.existing.sub'), under: where },
        { v: 'restore', glyph: 'rewind', title: T('begin.restore.title'), sub: T('begin.restore.sub') }
      ], sel, { label: T('begin.title') });
      out += `<div class="o55-sublinks" data-key="later">${C.link(T('begin.later'), 'later')}</div>`;
      return out;
    },
    foot(S) {
      const need = choiceOf(S) === 'existing' && !S.sess.ui.beginSub;
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: need, reason: T('begin.existing.sub') } };
    },
    do: {
      pick(S, v, el) {
        const was = S.sess.ui.begin;
        S.sess.ui.begin = v; if (v !== 'existing') S.sess.ui.beginSub = null;
        O55.draft.set(md(S), { source_more: v === 'existing' }); S.save(); O55.ui.refresh();
        if (was !== v) swapBeginning(S, v === 'new' ? -1 : 1);
        O55.ui.charm(el, T('begin.' + v + '.title').split(' ').slice(0, 3).join(' '), { new: 'seed', existing: 'folder', restore: 'rewind' }[v]);
      },
      sub(S, v) { const was = S.sess.ui.beginSub; S.sess.ui.beginSub = v; S.save(); O55.ui.refresh(); if (was !== v) swapBeginning(S, 1); },
      /* a Project can wait, but a new Server is being set up now: its access away from home is still asked (canon
         skips only the provider phases for a deferred Project) */
      /* (Later gives up the beginning chosen before: its repository goes, and choosing any beginning again starts it
         clean, so going on never brings the old source back: canon FO-22) */
      later(S) { if (S.sess.ui.beganAs && S.sess.ui.beganAs !== 'later') resetBeginning(S, md(S), S.sess.ui.beganAs);
        O55.draft.set(md(S), { project_mode: 'later', source_more: false, online_mode: 'none', repository_ref: '' }); if (S.sess.online) S.sess.online.wanted = false; S.sess.ui.begin = null; S.sess.ui.beganAs = 'later'; S.save(); O55.ui.go(md(S).server_mode === 'new_server' ? 'away' : 'review'); },
      next(S) {
        const d = md(S), sel = choiceOf(S), sub = S.sess.ui.beginSub;
        /* switching how the Project begins drops what the abandoned beginning filled in */
        const began = sel === 'existing' ? 'existing:' + sub : sel;
        /* (the same beginning chosen again keeps everything it holds: an unchanged answer clears nothing) */
        const kept = S.sess.ui.beganAs === began;
        if (S.sess.ui.beganAs && !kept) resetBeginning(S, d, S.sess.ui.beganAs);
        S.sess.ui.beganAs = began;
        const clearOnline = d.project_mode === 'existing_online' ? { online_mode: 'none', repository_ref: '' } : {};
        if (sel === 'new') { O55.draft.set(d, Object.assign({ project_mode: 'new', project_transport: 'local', project_source_ref: '', source_more: false }, clearOnline)); S.save(); return O55.ui.go('name'); }
        /* (Restore kept as it was keeps its source, place and pick: an unchanged answer clears nothing, Sol FO22-N1) */
        if (sel === 'restore') { if (!(kept && S.sess.restore && S.sess.restore.scope === 'project')) S.sess.restore = { scope: 'project' }; S.save(); return O55.ui.go('r-source'); }
        if (sub === 'folder') { O55.draft.set(d, Object.assign({ project_mode: 'existing_local', project_transport: 'local', source_more: true }, clearOnline)); S.save(); return O55.ui.go('ex-folder'); }
        if (sub === 'online') { O55.draft.set(d, { project_mode: 'existing_online', online_mode: 'existing', source_more: true }); S.sess.online = Object.assign(S.sess.online || {}, { purpose: 'source' }); S.save(); return O55.ui.go('online-service'); }
        /* (a NAS source kept keeps its way in: a shared folder or a mounted volume is not turned back into SSH) */
        O55.draft.set(d, Object.assign({ project_mode: 'existing_local', project_transport: kept && d.project_transport && d.project_transport !== 'local' ? d.project_transport : 'ssh', source_more: true }, clearOnline));
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
        const body = `<div class="o55-crumbs" data-key="crumbs">${crumbs}${O55.tips.q('group:treeGo')}</div>${O55.tips.explainer('group:treeGo')}<div class="o55-treelist" role="listbox" aria-label="${U.esc(T('folder.picker'))}">`
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
      /* the read-only look at a folder finds what it holds (its history, its online copy) */
      pick(S, path) { S.sess.folder = { path }; S.save(); F.op(S, 'folder:' + path, 'cmd.project.source_location.test', [{ key: 'read', ms: 700 }], { payload: { path }, sound: { done: 'found', intensity: 0.5 } }); O55.ui.refresh(); },
      browse(S) { S.sess.ui.sheet = 'tree'; S.sess.ui.treeAt = treeRoot(S); S.save(); O55.ui.refresh(); seeSheet(S); },
      /* each level deeper sounds a step higher, as the crumbs grow */
      treeGo(S, path) { const tree = treeOf(S); S.sess.ui.treeAt = path; if (!tree[path]) tree[path] = []; S.save(); O55.ui.refresh(); O55.sound.play('move', { step: path.split('/').length - 1, priority: MOVE_OVER_TAP }); },
      treePick(S) { const path = S.sess.ui.treeAt; S.sess.ui.sheet = null; S.save(); O55.sound.play('tap'); O55.screens.defs['ex-folder'].do.pick(S, path); },
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
    const taken = knownNames(S).find((p) => p.name.toLowerCase() === v.toLowerCase());
    if (taken) return T('name.exists', { name: taken.name });
    return '';
  }
  /* each letter lands on the sign: it swings (alternately left and right), a fleck of ink leaves the word, and a helper
     cheers the moment the name becomes one that can be used */
  function lettered(S, v, grew, wasOk) {
    /* the sign sings the name (hero spec H6): each letter plucks its string on the next chord tone up, deleting walks
       back down, panned the way the sign swings; it stands for the typing tick on this field (def.typing below).
       Reduced Motion shows no swing, so the field keeps its plain typing tick there */
    O55.sound.play(O55.motion.reduced() ? 'type' : 'string', { step: v.length, pan: v.length % 2 ? 0.12 : -0.12 });
    if (!O55.art.poke) return;
    O55.art.poke(stage(S), 'sign', { amp: grew ? 1 : 0.55, dir: v.length % 2 ? 1 : -1, fleck: grew });
    /* (Pip watches the field in wonder while it is typed into: its line says the name is good; no cheer over it) */
  }
  def('name', {
    chapter: 'project', stage: 'first_project', charmSlot: 'name',
    scene: (S) => ({ id: 'name', beat: 'type', params: { name: md(S).project_name || '' } }),
    typing: (S, key) => key === 'name',
    eyebrow: () => T('name.eyebrow'),
    title: () => T('name.title'),
    lead: () => T('name.lead'),
    body(S) {
      const d = md(S), prob = nameProblem(S, d.project_name), touched = S.sess.ui.nameTouched;
      let out = C.field({ bind: 'name', cls: 'o55-namefield', reserve: true, label: T('name.label'), value: d.project_name, placeholder: T('name.placeholder'), hint: prob ? '' : (d.project_name ? T('name.ok') : ''), error: touched && prob ? prob : '', valid: !prob, invalid: touched && !!prob, autocomplete: 'off' });
      if (d.project_mode === 'new') out += F.chips('suggest', O55.tx('name.suggest'), d.project_name);
      /* where its files live: an existing folder stays where it is (also on a Server); a new or copied Project on a
         Server offers the Server, this device or a network drive */
      if (d.project_mode === 'existing_local') {
        /* (work on a shared folder, an NFS share or a mounted drive is where it was found, as on another device: it
           read only "Kept in" with no path, QA2 hunter H8) */
        const away = d.project_transport === 'ssh' || d.project_transport === 'puppet_master' || d.project_transport === 'mounted';
        const path = away ? (O55.nas && O55.nas.placeLabel ? O55.nas.placeLabel(S, d.project_source_ref) : String(d.project_source_ref || '').replace(/^[a-z]+:/, '')) : d.local_location;
        out += `<p class="o55-locline" data-key="loc">${C.small('folder', 16)}<span>${U.esc(onServer(S) && d.project_transport === 'local' ? T('name.keptOn', { path, name: serverName(S) }) : T('name.kept', { path }))}</span></p>`;
      } else if (onServer(S)) {
        const nm = serverName(S);
        out += C.group(T('name.serverTitle'), C.cards('storage', [
          { v: 'with_server', glyph: 'server', title: T('name.withServer', { name: nm }), sub: T('name.withServerSub'), tag: T('chrome.recommended') },
          { v: 'this_device', glyph: 'computer', title: T('name.onDevice'), sub: T('name.onDeviceSub', { name: nm }) },
          { v: 'network_location', glyph: 'folder', title: T('name.networkDrive'), sub: d.storage_location ? (O55.nas && O55.nas.placeLabel ? O55.nas.placeLabel(S, d.storage_location) : d.storage_location.replace(/^[a-z]+:/, '')) : T('name.networkDriveSub') }
        ], d.storage_mode, { label: T('name.serverTitle') }));
      } else {
        const path = d.local_location_mode === 'custom' && d.local_location ? d.local_location : d.storage_mode === 'network_location' ? (O55.nas && O55.nas.placeLabel ? O55.nas.placeLabel(S, d.storage_location) : d.storage_location.replace(/^[a-z]+:/, '')) : docsPath(S, d.project_name);
        const auto = !(d.local_location_mode === 'custom' && d.local_location) && d.storage_mode !== 'network_location';
        out += `<p class="o55-locline" data-key="loc">${C.small('folder', 16)}<span>${U.esc(T(auto && !named(d.project_name) ? 'name.keptUnnamed' : 'name.kept', { path }))}</span>${C.link(T('name.change'), 'change')}</p>`;
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
      suggest(S, v, el) { const was = !nameProblem(S, md(S).project_name) && F.nonEmpty(md(S).project_name); S.sess.ui.nameTouched = true; O55.draft.set(md(S), { project_name: v }); S.save(); O55.ui.refresh(); lettered(S, v, true, was); },
      storage(S, v) {
        O55.draft.set(md(S), { storage_mode: v });
        S.save();
        if (v === 'network_location' && !md(S).storage_location) { S.sess.nas = Object.assign(S.sess.nas || {}, { purpose: 'storage' }); S.save(); return O55.ui.go('nas-find'); }
        O55.ui.refresh();
      },
      change(S) { S.sess.ui.sheet = 'loc'; S.save(); O55.ui.refresh(); seeSheet(S); },
      loc(S, v) {
        const d = md(S);
        /* (files on the NAS given up: its device, folder, checks and the access it was given go when the Name step's
           Continue commits it, 76-branch.js reconcile (Astra AST-D6); until then Back takes the pick back, lead's ruling
           1103040758) */
        if (v === 'auto') O55.draft.set(d, { local_location_mode: 'automatic', local_location: '', storage_mode: 'this_device' });
        if (v === 'custom') O55.draft.set(d, { local_location_mode: 'custom', local_location: d.local_location || '~/Documents/' + (d.project_name || 'Project'), storage_mode: 'this_device' });
        /* (the NAS kept as the files place keeps its way in until a folder is used again) */
        if (v === 'network') { S.sess.ui.sheet = null; S.sess.nas = Object.assign(S.sess.nas || {}, { purpose: 'storage' }); if (d.storage_mode !== 'network_location') O55.draft.set(d, { storage_mode: 'network_location', storage_transport: 'ssh' }); S.save(); return O55.ui.go('nas-find'); }
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
      name(S, v) {
        const d = md(S), old = d.project_name || '';
        const before = S.sess.ui.nameFor === old && S.sess.ui.nameProb != null ? S.sess.ui.nameProb : (F.nonEmpty(old) ? nameProblem(S, old) : '');
        const was = !before && F.nonEmpty(old), grew = v.length > old.length;
        S.sess.ui.nameTouched = true; O55.draft.set(d, { project_name: v });
        const now = F.nonEmpty(v) ? (v === old ? before : nameProblem(S, v)) : '';
        S.sess.ui.nameFor = v; S.sess.ui.nameProb = now;
        S.save(); O55.ui.refresh(); lettered(S, v, grew, was);
        /* a name that becomes one that cannot be used (taken, too long) warns softly with the hint that says why */
        if (now && now !== before) O55.sound.play('warn', SND.warn);
      },
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
  /* FO-133 (GUIDED-FLOWS-CHECK rows 3.02, 3.04, 3.17; Plans/Settings_System.md SSYS-062 and the selector sets SSYS-007):
     - Copy is offered whenever setup creates a new registry Project, including one that registers content nobody had
       registered yet (an existing folder here or on a NAS, a Project kept online); never when the folder is already a
       Project Puppet Master knows, never for a restore, Later or connect-only.
     - Your usual settings is the default, and says what it is: the settings every Project shares.
     - Advanced chooses by kind (the owner's disjoint eleven sets: ten kinds plus About its own files, which is off by
       default), by setting (the source's own values, each its own switch), by thing (what the source Project owns, each
       previewed with what it becomes here) and by account (Use the same AI accounts and models: the account choices, never
       the sign-ins, each with its readiness on the computer that does the work). The engine applies exactly the settings
       left picked: the kinds' engine categories, less every value switched off (stageSettings, 72-screens-review.js). */
  const KINDS = ['appearance_workspace', 'assistant_chat', 'providers_accounts_models_routing', 'planning_goal', 'orchestrator_automation', 'tools_integrations', 'testing_browser_devices', 'permissions_security', 'memory_retention_history', 'notifications_usage_budgets', 'project_only_rows'];
  const AI_KIND = 'providers_accounts_models_routing', FILES_KIND = 'project_only_rows';
  /* (the look chosen in onboarding is the new Project's own; it is never copied over) */
  const LOOK_IDS = ['general.visual.theme', 'general.visual.theme-mode', 'general.visual.nier-mode', 'general.visual.nier-parts', 'general.visual.nier-background'];
  /* each setting belongs to exactly one set: the engine's Project & sync rows are about the Project's own files and paths */
  function kindOf(id) {
    const st = ST(); if (st && st.categoryFor(id) === 'Project & sync') return FILES_KIND;
    if (/^general\.visual\.|^general\.startup\./.test(id)) return 'appearance_workspace';
    if (/^general\.interaction\.|^chat\./.test(id)) return 'assistant_chat';
    if (/^ai\.(models|accounts|routing)\./.test(id)) return AI_KIND;
    if (/^planning\.testing\.|^browser\./.test(id)) return 'testing_browser_devices';
    if (/^planning\.|^goals\./.test(id)) return 'planning_goal';
    if (/^branching\.subagents\.|^orchestrator\.|^automation\./.test(id)) return 'orchestrator_automation';
    if (/^safety\./.test(id)) return 'permissions_security';
    if (/^memory\./.test(id)) return 'memory_retention_history';
    if (/^notifications\.|^ai\.usage\./.test(id)) return 'notifications_usage_budgets';
    return 'tools_integrations';
  }
  const shown = (v) => (v === true ? T('like.on') : v === false ? T('like.off') : v == null || v === '' ? '—' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v)).slice(0, 48);
  /* the source's own values: what it has that differs from the settings every Project starts with */
  const OWN = new Map();
  function ownValues(S, id) {
    const st = ST(), tome = window.PM7_SETTINGS_TOME; if (!st || !tome) return [];
    const snap = tome.projectSnapshot(id); if (!snap || !snap.settings) return [];
    const key = id + '@' + (snap.revision || 0); if (OWN.has(key)) return OWN.get(key);
    const canon = new Map(Object.values((window.PM12_REFERENCE && window.PM12_REFERENCE.byCat) || {}).flatMap((c) => c.settings || []).map((r) => [r.id, r]));
    /* (your usual settings are the ones in use now, which a new Project starts on: a value equal to them is not its own) */
    const live = (window.PM12_KIMI && window.PM12_KIMI.getState && (window.PM12_KIMI.getState() || {}).settings) || {};
    const usualOf = (sid, row) => (Object.prototype.hasOwnProperty.call(live, sid) ? live[sid] : row.default);
    const pv = st.draftPreview(id, null), out = [];
    if (pv && pv.ok) Object.values(pv.groups).forEach((list) => list.forEach((x) => {
      const row = canon.get(x.id); if (!row || LOOK_IDS.includes(x.id)) return;
      const usual = usualOf(x.id, row); if (JSON.stringify(x.value) === JSON.stringify(usual)) return;
      out.push({ id: x.id, label: row.label || x.id, value: x.value, usual, kind: kindOf(x.id), cat: st.categoryFor(x.id) });
    }));
    OWN.set(key, out); return out;
  }
  const sourceOf = (S, id) => O55.like.sources(S).find((x) => x.id === id) || null;
  /* the computer that does the work, where a chosen account must be signed in */
  const workComputer = (S) => (onServer(S) ? serverName(S) : T('like.thisComputer'));
  function accountState(S, pid) {
    const pr = S.env.here.providers[pid], name = (O55.fixtures.provider && O55.fixtures.provider(pid) || {}).name || pr && pr.name || pid.charAt(0).toUpperCase() + pid.slice(1), comp = workComputer(S);
    if (!onServer(S)) return pr && pr.signedIn ? { pid, name, state: 'ready_here', text: T('like.acct.ready', { computer: comp }) } : pr && pr.installed === false ? { pid, name, state: 'not_installed', text: T('like.acct.install', { computer: comp }) } : { pid, name, state: 'sign_in_there', text: T('like.acct.signin', { computer: comp }) };
    const srv = O55.connect && O55.connect.allServers(S).find((x) => x.id === md(S).server_ref), there = srv && (srv.accounts || []).find((a) => a.provider === pid && a.ready);
    return there ? { pid, name, state: 'check_there', text: T('like.acct.checked', { computer: comp }) } : { pid, name, state: 'sign_in_there', text: T('like.acct.signin', { computer: comp }) };
  }
  /* what the person picked under Advanced, per source (a new source starts from its defaults) */
  function pick(S, id) {
    const L = S.sess.like = S.sess.like || {};
    if (!L.pick || L.pick.src !== id) L.pick = { src: id, kinds: KINDS.filter((k) => k !== FILES_KIND), off: [], things: {}, accounts: true, q: '' };
    return L.pick;
  }
  function plan(S, id) {
    const p = pick(S, id), own = ownValues(S, id), src = sourceOf(S, id) || {};
    const rows = own.filter((x) => p.kinds.includes(x.kind) && !p.off.includes(x.id) && (p.accounts || x.kind !== AI_KIND));
    const things = (src.things || []).filter((x) => p.things[x.id] !== false);
    const accounts = p.accounts ? (src.providers || []).map((pid) => accountState(S, pid)) : [];
    return { rows, things, accounts, own };
  }
  O55.like = {
    sources(S) {
      const known = S.env.here.projects.concat(serverProjects(S));
      if (!ST() || !known.length) return [];
      seed(S, known);
      return known.filter((p) => window.PM7_SETTINGS_TOME.projectSnapshot(p.id));
    },
    /* a new registry Project: new, or content registered now (a folder here or on a NAS, a Project kept online); opening a
       Project that is already registered is the connect journey, and a restore or Later creates none */
    registers(S) { const d = md(S); return d.journey === 'new_or_local' && ['new', 'existing_local', 'existing_online'].includes(d.project_mode); },
    eligible(S) { return O55.like.registers(S) && O55.like.sources(S).length > 0 && ST().categories().length > 0; },
    preview(S, id) { const st = ST(); if (!st) return null; const cats = (S.sess.like && S.sess.like.categories) || null; return st.draftPreview(id, cats); },
    /* what the engine is asked to copy: the engine categories of the picked values, less every value of theirs not picked */
    selection(S) {
      const d = md(S), id = d.settings_transfer.source_project_id; if (!id) return { cats: [], excluded: LOOK_IDS.slice(), count: 0 };
      const st = ST(), P = plan(S, id), keep = new Set(P.rows.map((x) => x.id)), cats = [...new Set(P.rows.map((x) => x.cat).filter(Boolean))];
      const pv = cats.length ? st.draftPreview(id, cats) : null, excluded = new Set(LOOK_IDS);
      if (pv && pv.ok) Object.values(pv.groups).forEach((list) => list.forEach((x) => { if (!keep.has(x.id)) excluded.add(x.id); }));
      return { cats, excluded: [...excluded], count: keep.size, things: P.things.map((x) => x.id), accounts: P.accounts.map((x) => x.pid) };
    },
    plan, kindOf, KINDS
  };
  async function sha256(text) {
    try { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''); }
    catch (_) { let h = ''; for (let i = 0; i < 8; i++) h += U.hash(text + i).toString(16).padStart(8, '0'); return h; }
  }
  const listWords = (names) => (names.length > 1 ? names.slice(0, -1).join(', ') + ' ' + T('like.and') + ' ' + names[names.length - 1] : names[0] || '');
  const kindWord = (k) => (O55.tx('like.kinds')[k] || {}).word || k;
  const kindTitle = (k) => (O55.tx('like.kinds')[k] || {}).title || k;
  /* the preview under the chosen Project: what comes along, as the plan has it now */
  function comesAlong(S, sel) {
    const P = plan(S, sel), p = sourceOf(S, sel) || { name: sel };
    const kinds = KINDS.filter((k) => P.rows.some((x) => x.kind === k)).map(kindWord);
    let inner = P.rows.length ? `<p class="o55-previewtext" data-key="like-diffs">${U.esc(T('like.diffs', { n: P.rows.length, kinds: listWords(kinds) }))}</p>` : `<p class="o55-previewtext" data-key="like-diffs">${U.esc(T('like.diffsNone'))}</p>`;
    if (P.things.length) inner += `<p class="o55-previewtext" data-key="like-things">${U.esc(T('like.things', { things: listWords(P.things.map((x) => x.name)) }))}</p>`;
    if (P.accounts.length) inner += `<p class="o55-previewtext" data-key="like-accounts">${U.esc(T('like.accounts', { accounts: listWords(P.accounts.map((x) => x.name)) }))}</p>`;
    inner += C.note(T('like.never'), 'info', 'lock') + `<p class="o55-hint" data-key="like-separate">${U.esc(T('like.separate'))}</p>`;
    if (P.accounts.some((x) => x.state !== 'ready_here' && x.state !== 'check_there')) inner += C.note(T('like.unavailable', { project: p.name, computer: workComputer(S) }), 'warn', 'spark');
    inner += `<div class="o55-sublinks" data-key="choose">${C.link(T('like.choose'), 'choose')}</div>`;
    return C.group(T('like.previewTitle'), inner, { cls: 'o55-preview' });
  }
  /* Advanced: kinds, single settings (find one), things, accounts */
  function advanced(S, sel) {
    const p = pick(S, sel), own = ownValues(S, sel), src = sourceOf(S, sel) || { name: sel }, n = (k) => own.filter((x) => x.kind === k).length;
    const kinds = KINDS.map((k) => C.toggle({ do: 'cat', arg: k, on: p.kinds.includes(k), label: kindTitle(k), sub: n(k) ? T('like.kindCount', { n: n(k) }) : T('like.kindNone') })).join('');
    const q = String(p.q || '').trim().toLowerCase();
    const rows = own.filter((x) => p.kinds.includes(x.kind) && (p.accounts || x.kind !== AI_KIND) && (!q || x.label.toLowerCase().includes(q) || x.id.includes(q)));
    const single = C.field({ bind: 'likeFind', label: T('like.singleFind'), value: p.q || '', placeholder: T('like.singlePlaceholder') })
      + (rows.length ? rows.map((x) => C.toggle({ do: 'pickrow', arg: x.id, on: !p.off.includes(x.id), label: x.label, sub: T('like.singleRow', { usual: shown(x.usual), project: src.name, value: shown(x.value) }) })).join('') : `<p class="o55-hint" data-key="like-nosingle">${U.esc(T(q ? 'like.singleNoMatch' : 'like.singleNone'))}</p>`);
    const things = (src.things || []).length ? src.things.map((x) => C.toggle({ do: 'thing', arg: x.id, on: p.things[x.id] !== false, label: T('like.thingRow', { thing: x.name, kind: x.kind }), sub: x.outcome })).join('') : `<p class="o55-hint" data-key="like-nothings">${U.esc(T('like.thingNone', { project: src.name }))}</p>`;
    const names = src.providers || [];
    const accts = C.toggle({ do: 'accts', on: !!p.accounts, label: T('like.acctSwitch'), sub: T('like.acctSwitchSub') })
      + (p.accounts ? names.map((pid) => { const a = accountState(S, pid); return C.row({ key: 'acct-' + pid, title: a.name, meta: a.text, state: [a.state === 'ready_here' ? 'ready' : 'wait', T('like.acct.state.' + a.state)] }); }).join('') : `<p class="o55-hint" data-key="like-acctoff">${U.esc(T('like.acctOff'))}</p>`);
    return C.group(T('like.kindsTitle'), kinds, { cls: 'o55-like-kinds' }) + C.group(T('like.singleTitle'), single, { cls: 'o55-like-single' })
      + C.group(T('like.thingsTitle'), things, { cls: 'o55-like-things' }) + C.group(T('like.acctTitle'), accts, { cls: 'o55-like-accts' });
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
      /* what would be copied from the chosen Project: under that Project's card (QA round 2, Q7) */
      let under = '', sheet = '';
      if (sel !== 'fresh') {
        const pv = O55.like.preview(S, sel);
        if (pv && pv.ok) {
          under = comesAlong(S, sel);
          if (S.sess.ui.sheet === 'cats') sheet = C.sheet(S, 'cats', T('like.chooseTitle'), advanced(S, sel), O55.ui.btn({ label: T('chrome.done'), do: 'sheet-close' }, 'o55-primary'));
        } else if (pv) under = C.note(pv.reason || '', 'warn');
      }
      const out = C.cards('pick', [{ v: 'fresh', glyph: 'seed', title: T('like.fresh'), sub: T('like.freshSub') }].concat(sources.map((p) => ({ v: p.id, glyph: 'stack', title: p.name, sub: T('like.updated', { when: p.updated || '' }), under: p.id === sel ? under : '' }))), sel, { label: T('like.title') }) + sheet;
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
        pick(S, v);
        S.save(); O55.ui.refresh(); O55.ui.charm(el, p.name, 'stack');
        const hash = await sha256(JSON.stringify(pv || {}));
        if (md(S).settings_transfer.source_project_id === v) { md(S).settings_transfer.draft_preview_sha256 = hash; S.save(); }
      },
      choose(S) { S.sess.ui.sheet = 'cats'; S.save(); O55.ui.refresh(); seeSheet(S); },
      /* a kind on or off (About its own files starts off) */
      cat(S, k) {
        const id = md(S).settings_transfer.source_project_id; if (!id || !KINDS.includes(k)) return;
        const p = pick(S, id), on = !p.kinds.includes(k);
        p.kinds = KINDS.filter((x) => (x === k ? on : p.kinds.includes(x)));
        S.save(); O55.ui.refresh(); O55.sound.play(on ? 'toggleOn' : 'toggleOff');
      },
      /* one of the source's own values on or off */
      pickrow(S, sid) {
        const id = md(S).settings_transfer.source_project_id; if (!id) return;
        const p = pick(S, id), off = p.off.includes(sid);
        p.off = off ? p.off.filter((x) => x !== sid) : p.off.concat(sid);
        S.save(); O55.ui.refresh(); O55.sound.play(off ? 'toggleOn' : 'toggleOff');
      },
      thing(S, tid) {
        const id = md(S).settings_transfer.source_project_id; if (!id) return;
        const p = pick(S, id), on = p.things[tid] === false;
        p.things = Object.assign({}, p.things, { [tid]: on });
        S.save(); O55.ui.refresh(); O55.sound.play(on ? 'toggleOn' : 'toggleOff');
      },
      accts(S) {
        const id = md(S).settings_transfer.source_project_id; if (!id) return;
        const p = pick(S, id); p.accounts = !p.accounts;
        S.save(); O55.ui.refresh(); O55.sound.play(p.accounts ? 'toggleOn' : 'toggleOff');
      },
      next(S) { O55.ui.go('safe'); }
    },
    bind: {
      likeFind(S, v) { const id = md(S).settings_transfer.source_project_id; if (!id) return; pick(S, id).q = v; S.save(); O55.ui.refresh(); }
    },
    leave(S) { if (S.sess.ui.sheet === 'cats') { S.sess.ui.sheet = null; S.save(); } }
  });

  O55.project = { serverName, onServer, docsPath, nameProblem, pretty };
})();
