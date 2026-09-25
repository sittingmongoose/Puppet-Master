/* Chapter 3 (end) — Review [review_setup_plan], Creating [automatic_preparation] and Finish protecting your work.
   Review re-checks the draft read-only, shows every choice with Edit, and says exactly what the one click will do.
   Creating is the single reviewed commit: an idempotency key, truthful phases, one receipt per owner, and recovery that
   never leaves a half-made Project (Try again resumes the failed phase with the same key). */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const P = () => O55.project;
  const forgeName = (d) => O55.safe.forgeName(d.forge, d.forge_provider_variant);
  const FLOW = ['where', 'begin', 'name', 'like', 'safe', 'away', 'review'];

  /* Edit from Review: the edited screen's own Continue comes straight back to Review once nothing is missing. */
  const baseGo = O55.ui.go;
  O55.ui.go = function go(id, opts) {
    const S = O55.S, rt = S.sess && S.sess.ui.returnTo;
    if (rt && !(opts && opts.dir === 'back') && FLOW.includes(id) && FLOW.indexOf(id) > FLOW.indexOf(rt.from) && !O55.draft.missing(md(S)).length) {
      S.sess.ui.returnTo = null; S.save();
      return baseGo('review', opts);
    }
    return baseGo(id, opts);
  };

  function beginsAs(S) {
    const d = md(S);
    if (d.project_mode === 'existing_local') return d.project_transport !== 'local' ? T(d.project_transport === 'puppet_master' ? 'review.begins.devicePaired' : 'review.begins.device', { device: (S.sess.nas && S.sess.nas.folderLabel) || d.project_source_ref }) : T('review.begins.existing_local', { path: d.local_location });
    if (d.project_mode === 'existing_online') return T('review.begins.existing_online', { repo: d.repository_ref.replace(/^[a-z_]+:/, ''), service: forgeName(d) });
    if (d.project_mode === 'restore') return T('review.begins.restore', { project: d.project_name });
    return T('review.begins.new');
  }
  function filesAt(S) {
    const d = md(S);
    if (d.project_mode === 'existing_local') return d.project_transport === 'local' ? d.local_location : (S.sess.nas && S.sess.nas.folderLabel) || d.project_source_ref;
    if (d.storage_mode === 'with_server') return T('name.withServer', { name: P().serverName(S) });
    if (d.storage_mode === 'network_location') return d.storage_location.replace(/^[a-z]+:/, '');
    if (d.local_location_mode === 'custom' && d.local_location) return d.local_location;
    return P().docsPath(S, d.project_name);
  }
  const whereWork = (S) => (md(S).server_mode === 'this_device' ? T('where.this.title') : P().serverName(S));
  /* a new Server's access away from home needs setting up unless it stays on the home network */
  const needsRemote = (d) => d.server_mode === 'new_server' && d.remote_mode !== 'local_or_vpn' && d.remote_mode !== 'none';
  const remoteLabel = (d) => (d.remote_mode === 'local_or_vpn' ? T('away.home.title') : d.remote_mode === 'tailscale' ? 'Tailscale' : d.remote_mode === 'reverse_proxy' ? d.proxy_hostname : T('away.link.title'));
  const buttonLabel = (d) => (d.project_mode === 'later' ? T('review.finish') : d.project_mode === 'new' ? T('review.create') : d.project_mode === 'restore' ? T('review.restoreBtn') : T('review.add'));
  function routeParams(S) {
    const d = md(S), start = { new: ['seed', T('art.labels.start')], existing_local: ['folder', T('art.labels.files')], existing_online: ['cloud', forgeName(d)], restore: ['rewind', T('art.labels.start')], later: ['seed', T('art.labels.start')] }[d.project_mode];
    const nodes = [{ icon: start[0], label: start[1], sub: d.project_name ? d.project_name.toLowerCase().slice(0, 18) : '' }];
    if (d.project_mode !== 'later') nodes.push({ icon: 'folder', label: T('art.labels.files'), sub: d.storage_mode === 'with_server' ? P().serverName(S).toLowerCase() : T('art.labels.documents') });
    nodes.push({ icon: d.server_mode === 'this_device' ? 'computer' : 'server', label: T('art.labels.worksHere'), sub: whereWork(S).toLowerCase().slice(0, 18) });
    nodes.push({ icon: 'person', label: T('art.labels.you'), sub: T('art.labels.thisDevice') });
    return { nodes, online: d.online_mode === 'new' ? forgeName(d) : null, backup: S.sess.backup.dest ? O55.backup.label(S, S.sess.backup.dest) : null, inherit: d.settings_transfer.mode === 'copy_from_project' ? (S.sess.like && S.sess.like.name) || '' : null };
  }

  /* ------------------------------------------------------------------ review */
  def('review', {
    chapter: 'project', stage: 'review_setup_plan',
    scene: (S) => ({ id: 'route', beat: 'default', params: routeParams(S) }),
    eyebrow: () => T('review.eyebrow'),
    title(S) { const d = md(S); return d.project_mode === 'later' ? T('review.titleLater') : T(d.project_mode === 'new' ? 'review.titleNew' : d.project_mode === 'restore' ? 'review.titleRestore' : 'review.titleAdd', { name: d.project_name }); },
    lead: (S) => (md(S).project_mode === 'later' ? (needsRemote(md(S)) ? T('review.leadLaterAccess', { name: P().serverName(S) }) : T('review.leadLater')) : T('review.lead')),
    /* a backup to the NAS the Project's files now live on is no backup: it is dropped here, with the reason */
    enter(S) { S.sess.ui.returnTo = null; if (S.sess.backup.dest === 'nas' && O55.backup.filesOnNas(S)) { S.sess.backup.dest = null; S.sess.ui.backupDropped = true; } else S.sess.ui.backupDropped = false; },
    body(S) {
      const d = md(S), row = (k, v, edit) => `<div class="o55-revrow" data-key="rv-${k}"><span class="o55-revk">${U.esc(T('review.rows.' + k))}</span><span class="o55-revv">${U.esc(v)}</span>${edit ? C.link(T('review.edit'), 'edit', edit) : ''}</div>`;
      const st = F.state(S, 'recheck:' + d.project_draft_revision);
      let out = st && st.state === 'done' ? `<p class="o55-hint" data-key="checked">${C.small('check', 12)}${U.esc(T('review.checked'))}</p>` : F.phases(S, 'recheck:' + d.project_draft_revision, ['check'], { check: T('chrome.working') });
      if (d.project_mode === 'later') {
        out += C.group(T('review.groups.computer'), row('where', whereWork(S), 'where'));
        if (d.server_mode === 'new_server') out += C.group(T('review.groups.access'), row('remote', remoteLabel(d), 'away'));
        const willLater = [['seed', T('review.will.noProject')]].concat(needsRemote(d) ? [['globe', T('review.will.remote')]] : []);
        out += C.group(T('review.willTitle', { button: buttonLabel(d) }), `<ul class="o55-will">${willLater.map(([g, t]) => `<li>${C.small(g, 14)}<span>${U.esc(t)}</span></li>`).join('')}</ul>`);
        return out;
      }
      const notSet = [];
      let proj = row('name', d.project_name, 'name') + row('begins', beginsAs(S), 'begin');
      if (O55.like.eligible(S) || d.settings_transfer.mode === 'copy_from_project') proj += row('like', d.settings_transfer.mode === 'copy_from_project' ? T('review.copied', { project: (S.sess.like && S.sess.like.name) || '' }) : T('review.fresh'), 'like');
      out += C.group(T('review.groups.project'), proj);
      out += C.group(T('review.groups.computer'), row('where', whereWork(S), 'where') + row('files', filesAt(S), d.project_mode === 'existing_local' ? 'begin' : 'name'));
      const fi = d.project_mode === 'existing_local' ? S.sess.folderInfo : null, kind = d.history_backend === 'jujutsu' ? 'Jujutsu' : 'Git';
      let safe = row('history', (fi && fi.history ? T('review.savedExisting', { kind: fi.history === 'jujutsu' ? 'Jujutsu' : 'Git' }) : T('review.saved', { kind })) + (d.filesafe ? ' · FileSafe' : ''), 'safe');
      if (d.online_mode !== 'none') safe += row('online', d.project_mode === 'existing_online' ? forgeName(d) + ' · ' + d.repository_ref.replace(/^[a-z_]+:/, '') : forgeName(d) + ' · ' + (d.repository_container || S.sess.forgeAccounts[d.forge] || '') + '/' + d.repository_name, 'safe');
      else if (fi && fi.online) safe += row('online', O55.safe.forgeName(fi.online.forge) + ' · ' + fi.online.repo + ' · ' + T('safe.online.linked'), 'begin');
      else notSet.push(T('safe.online.title').toLowerCase());
      if (S.sess.backup.dest) safe += row('backup', O55.backup.label(S, S.sess.backup.dest), 'safe'); else notSet.push(T('safe.backup.title').toLowerCase());
      if (S.sess.ui.backupDropped) safe += C.note(T('review.backupDropped', { name: O55.backup.label(S, 'nas') }), 'warn', 'vault');
      out += C.group(T('review.groups.safe'), safe);
      if (d.server_mode === 'new_server') out += C.group(T('review.groups.access'), row('remote', remoteLabel(d), 'away'));
      if (notSet.length) out += `<p class="o55-hint" data-key="notset">${U.esc(T('review.notSet', { list: notSet.join(', ') }))}</p>`;
      /* what the one click does */
      const will = [];
      if (d.project_mode === 'new') will.push(['folder', T('review.will.folder', { path: filesAt(S) })]);
      if (d.project_mode === 'existing_local') will.push(['folder', T('review.will.useFolder', { path: filesAt(S) })]);
      if (d.project_mode === 'existing_online') will.push(['cloud', T('review.will.clone', { service: forgeName(d) })]);
      if (d.project_mode === 'restore') will.push(['rewind', T('review.will.restore')]);
      will.push(['history', T('review.will.history')]);
      if (d.online_mode === 'new') will.push(['cloud', T('review.will.online', { service: forgeName(d) })]);
      if (d.settings_transfer.mode === 'copy_from_project') will.push(['stack', T('review.will.settings', { project: (S.sess.like && S.sess.like.name) || '' })]);
      if (d.server_mode === 'new_server' && d.remote_mode !== 'local_or_vpn') will.push(['globe', T('review.will.remote')]);
      if (d.server_mode !== 'this_device') will.push(['server', T('review.will.server', { server: P().serverName(S) })]);
      out += C.group(T('review.willTitle', { button: buttonLabel(d) }), `<ul class="o55-will">${will.map(([g, t]) => `<li>${C.small(g, 14)}<span>${U.esc(t)}</span></li>`).join('')}</ul>`);
      return out;
    },
    mounted(S) {
      const d = md(S);
      F.op(S, 'recheck:' + d.project_draft_revision, 'cmd.project.refresh', [{ key: 'check', ms: 650 }], { payload: { draft: d.project_draft_ref, revision: d.project_draft_revision } });
    },
    foot(S) {
      const d = md(S), miss = O55.draft.missing(d)[0], st = F.state(S, 'recheck:' + d.project_draft_revision);
      const reason = miss ? T(miss.key) : !(st && st.state === 'done') ? T('chrome.working') : '';
      return { primary: { label: buttonLabel(d), do: 'commit', disabled: !!reason, reason } };
    },
    do: {
      edit(S, target) { S.sess.ui.returnTo = { screen: 'review', from: target }; S.save(); O55.ui.go(target === 'safe' ? 'safe' : target); },
      commit(S) {
        const d = md(S);
        /* a deferred Project: nothing is created, but a new Server's access away from home is prepared now */
        if (d.project_mode === 'later') {
          O55.draft.set(d, { review_confirmed: true });
          if (!needsRemote(d)) { S.sess.commit = { state: 'later' }; S.save(); return O55.ui.go('ready'); }
          if (!S.sess.commit || S.sess.commit.state === 'none' || S.sess.commit.state === 'later') S.sess.commit = { state: 'running', later: true, key: 'prepare:' + d.project_draft_ref, attempt: 1, revision: d.project_draft_revision };
          S.save(); return O55.ui.go('creating');
        }
        /* one reviewed commit per draft: a second click (or a retry) reuses the same idempotency key */
        if (!S.sess.commit || S.sess.commit.state === 'none') { O55.draft.set(d, { review_confirmed: true }); S.sess.commit = { state: 'running', key: 'commit:' + d.project_draft_ref, attempt: 1, revision: d.project_draft_revision }; S.save(); }
        O55.sound.play('commit');
        O55.ui.go('creating');
      }
    }
  });

  /* ------------------------------------------------------------------ creating (the one commit) */
  function phasesFor(S) {
    const d = md(S), cm = S.sess.commit, list = [];
    if (d.project_mode === 'later') return (needsRemote(d) ? ['remote'] : []).concat(['check']);
    if (d.project_mode === 'new') list.push('folder');
    if (d.project_mode === 'existing_local' && d.project_transport !== 'local') list.push('device');
    if (d.project_mode === 'existing_online') list.push('folder', 'clone');
    if (d.project_mode === 'restore') list.push('restore');
    const hasHistory = d.project_mode === 'existing_local' && S.sess.folderInfo && S.sess.folderInfo.history;
    if (!hasHistory) list.push(S.env.here.git ? 'history' : 'historyInstall');
    if (d.online_mode === 'new' && !cm.skipOnline) list.push('online');
    if (d.settings_transfer.mode === 'copy_from_project') list.push('settings');
    if (d.server_mode === 'new_server' && d.remote_mode !== 'local_or_vpn') list.push('remote');
    list.push('check');
    return list;
  }
  const PH_MS = { folder: 700, device: 900, clone: 1400, restore: 1500, history: 700, historyInstall: 1600, online: 1300, settings: 900, remote: 1100, check: 900 };
  const CHILD = { history: 'cmd.source_control.backend.select', historyInstall: 'cmd.source_control.backend.select', online: 'cmd.source_control.repository.bind', settings: 'cmd.settings.transaction.apply', remote: null };
  function remoteCmd(d) { return d.remote_mode === 'tailscale' ? 'cmd.remote_access.tailscale.setup.start' : d.remote_mode === 'reverse_proxy' ? 'cmd.remote_access.proxy.generate' : 'cmd.remote_access.remote_link.setup'; }

  /* Shell effects of the commit, each idempotent: the Project record (menu item, selection), the settings copy through
     the real Settings owner, receipts. */
  function ensureProject(S) {
    const d = md(S), id = 'p-' + U.slug(d.project_name).slice(0, 40), cm = S.sess.commit;
    cm.projectId = id;
    const menu = document.getElementById('projectMenu');
    if (menu && !menu.querySelector(`[data-project="${id}"]`)) {
      const proto = menu.querySelector('[data-project]');
      const item = proto ? proto.cloneNode(true) : document.createElement('button');
      item.setAttribute('data-project', id); item.dataset.projectTitle = 'Active project: ' + d.project_name;
      item.classList.remove('is-selected'); item.textContent = d.project_name;
      (proto ? proto.parentNode : menu).insertBefore(item, proto || null);
    }
    menu && menu.querySelectorAll('[data-project]').forEach((n) => n.classList.toggle('is-selected', n.getAttribute('data-project') === id));
    window.PM_ACTIVE_PROJECT_ID = id;
    cm.receipts = cm.receipts || {}; cm.receipts.project = cm.receipts.project || ('receipt:project:' + id);
    /* the new Project starts with the look chosen here: Settings loads a new Project's own settings as it is selected
       (after this task), so the look is saved into it once that load has run */
    O55.motion.after(0, () => { if (O55.shell && O55.shell.commitLook) O55.shell.commitLook(S); });
    return id;
  }
  function applySettings(S) {
    const d = md(S), cm = S.sess.commit, st = window.PM12_KIMI && window.PM12_KIMI.o55SettingsTransfer;
    if (!st) return 'settings_owner_missing';
    if (cm.receipts && cm.receipts.settings) return null;
    const cats = (S.sess.like && S.sess.like.categories) || st.categories();
    const res = st.apply(d.settings_transfer.source_project_id, cats, { credentials: 'Keep existing destination credential ownership', conflicts: 'Preview every changed value', rollback: true });
    cm.receipts = cm.receipts || {};
    if (res && res.ok) { cm.receipts.settings = res.receiptId; cm.settingsCount = res.count; return null; }
    if (res && /No canonical transferable values differ/i.test(res.reason || '')) { cm.receipts.settings = 'no-change'; cm.settingsCount = 0; return null; }
    cm.settingsError = res ? res.reason : 'unknown';
    return 'settings_rejected';
  }
  function runCommit(S) {
    const d = md(S), cm = S.sess.commit; if (!cm || cm.state === 'done' || cm.state === 'failed') return;
    const order = phasesFor(S);
    if (d.project_mode === 'later') {
      /* no Project record, folder, history or copy: only the new Server's access, then a check */
      F.op(S, cm.key, remoteCmd(d), order.map((k) => ({ key: k, ms: PH_MS[k] })), {
        payload: { idempotency_key: cm.key, draft: d.project_draft_ref },
        onFail: (S2, st) => { cm.state = 'failed'; cm.code = st.code; S.save(); },
        onDone: () => { cm.state = 'done'; cm.code = null; S.save(); O55.sound.play('success'); O55.ui.refresh(); }
      });
      return;
    }
    const phases = order.map((k) => ({ key: k, ms: PH_MS[k], fail: () => {
      if (k === 'folder' || (k === 'device' && !cm.projectId) || (k === 'restore' && !cm.projectId) || (k === 'clone' && !cm.projectId)) ensureProject(S);
      if (CHILD[k]) O55.owners.dispatch(CHILD[k], { draft: d.project_draft_ref }, S.ctx(), () => ({ ok: true }));
      if (k === 'remote') O55.owners.dispatch(remoteCmd(d), { draft: d.project_draft_ref }, S.ctx(), () => ({ ok: true }));
      if (k === 'online') {
        const f = S.env.failures.online_copy;
        if (f === 'name_taken' && !cm.renamed) return 'name_taken';
        if (f === 'network' && !cm.networkRetried) { cm.networkRetried = true; S.save(); return 'network'; }
        cm.receipts = cm.receipts || {}; cm.receipts.online = 'receipt:online-copy:' + d.forge + ':' + d.repository_name;
      }
      if (k === 'settings') return applySettings(S);
      if (k === 'check') { ensureProject(S); if (d.storage_mode === 'network_location' || d.project_transport === 'ssh' || d.project_transport === 'puppet_master') cm.writeTest = 'ok'; }
      return null;
    } }));
    if (!cm.projectId && order[0] !== 'folder') ensureProject(S);
    const cmd = d.project_mode === 'new' ? 'cmd.project.new_local' : 'cmd.project.add_existing';
    F.op(S, cm.key, cmd, phases, {
      payload: { idempotency_key: cm.key, draft: d.project_draft_ref, revision: d.project_draft_revision },
      onFail: (S2, st) => { cm.state = 'failed'; cm.code = st.code; S.save(); },
      onDone: () => {
        cm.state = 'done'; cm.code = null; S.save();
        window.dispatchEvent(new CustomEvent('o55:project-created', { detail: { id: cm.projectId, name: d.project_name, receipts: cm.receipts } }));
        O55.sound.play('commit');
        /* the Project is made: the troupe celebrates (after the scene has taken its bow beat) */
        O55.motion.after(650, () => { if (O55.art.celebrate && S.open) O55.art.celebrate(S.root.querySelector('.o55-stage'), { big: true }); });
        O55.ui.refresh();
      }
    });
  }
  def('creating', {
    chapter: 'project', stage: 'automatic_preparation',
    scene: (S) => { const st = F.state(S, (S.sess.commit || {}).key); const done = st ? (st.phases || []).filter((p) => p.status === 'done').length : 0; return { id: 'creating', beat: S.sess.commit && S.sess.commit.state === 'done' ? 'done' : 'build', params: { step: done, total: phasesFor(S).length } }; },
    eyebrow: () => T('creating.eyebrow'),
    title: (S) => { const cm = S.sess.commit || {}, later = md(S).project_mode === 'later', nm = later ? P().serverName(S) : md(S).project_name; return cm.state === 'done' ? T(later ? 'creating.doneTitleLater' : 'creating.doneTitle', { name: nm }) : cm.state === 'failed' ? T('creating.failTitle') : T(later ? 'creating.titleLater' : 'creating.title', { name: nm }); },
    lead: (S) => { const cm = S.sess.commit || {}, later = md(S).project_mode === 'later'; return cm.state === 'done' ? T(later ? 'creating.doneLeadLater' : 'creating.doneLead') : cm.state === 'failed' ? T('creating.failLead') : T('creating.lead'); },
    body(S) {
      const d = md(S), cm = S.sess.commit || {}, svc = forgeName(d);
      const labels = { folder: T('creating.phases.folder'), device: T('creating.phases.device', { device: (S.sess.nas && S.sess.nas.folderLabel) || P().serverName(S) }), clone: T('creating.phases.clone', { service: svc }), restore: T('creating.phases.restore'),
        history: T('creating.phases.history'), historyInstall: T('creating.phases.historyInstall'), online: T('creating.phases.online', { service: svc }), settings: T('creating.phases.settings', { project: (S.sess.like && S.sess.like.name) || '' }), remote: T('creating.phases.remote'), check: T('creating.phases.check') };
      let out = F.phases(S, cm.key, phasesFor(S), labels, cm.settingsCount != null ? { settings: cm.settingsCount ? cm.settingsCount + ' settings' : '' } : null);
      if (cm.state === 'failed') {
        const msg = cm.code === 'name_taken' ? T('creating.taken', { service: svc, repo: d.repository_name }) : cm.code === 'network' ? T('creating.network', { service: svc }) : cm.code === 'settings_rejected' ? (cm.settingsError || '') : cm.code || '';
        out += `<div class="o55-banner o55-banner-warn" data-key="fail">${C.small('cloud', 18)}<span>${U.esc(msg)}</span></div>`;
        const acts = [O55.ui.btn({ label: T('creating.retry'), do: 'retry', cls: 'o55-small' }, 'o55-secondary')];
        if (cm.code === 'name_taken') acts.push(O55.ui.btn({ label: T('creating.rename', { service: svc }), do: 'rename', cls: 'o55-small' }, 'o55-secondary'));
        if (cm.code === 'name_taken' || cm.code === 'network') acts.push(cm.confirmSkip ? `<span class="o55-confirm">${U.esc(T('creating.skipConfirm'))} ${O55.ui.btn({ label: T('creating.skipOnline'), do: 'skipOnline', cls: 'o55-small' }, 'o55-primary')}</span>` : O55.ui.btn({ label: T('creating.skipOnline'), do: 'askSkip', cls: 'o55-small' }, 'o55-ghost'));
        out += `<div class="o55-actions" data-key="recover">${acts.join('')}</div>`;
      }
      if (cm.state === 'done') out += C.details(S, 'receipts', T('creating.receipts'), C.kv(Object.entries(cm.receipts || {}).map(([k, v]) => [k, v]).concat([['idempotency key', cm.key]])));
      return out;
    },
    mounted(S) { runCommit(S); },
    foot(S) {
      const cm = S.sess.commit || {};
      if (cm.state === 'done') return { back: false, primary: { label: T('creating.continue'), do: 'next' } };
      return { back: false, primary: { label: T('creating.continue'), do: 'next', disabled: true, reason: cm.state === 'failed' ? T('creating.failTitle') : T('chrome.working') } };
    },
    do: {
      retry(S) { const cm = S.sess.commit; cm.state = 'running'; cm.attempt = (cm.attempt || 1) + 1; S.save(); O55.ui.refresh(); runCommit(S); },
      rename(S) { S.sess.ui.returnTo = null; S.sess.commit.renaming = true; S.save(); O55.ui.go('online-details'); },
      askSkip(S) { S.sess.commit.confirmSkip = true; S.save(); O55.ui.refresh(); },
      skipOnline(S) { const cm = S.sess.commit; cm.skipOnline = true; cm.confirmSkip = false; cm.state = 'running'; O55.draft.set(md(S), { online_mode: 'none' }); S.save(); O55.ui.refresh(); runCommit(S); },
      next(S) { O55.ui.go(md(S).project_mode === 'later' ? 'ready' : S.sess.backup.dest ? 'protect' : 'ai'); }
    },
    onBack: () => false
  });
  /* After "Change the name on GitHub" the details screen returns to Creating, which resumes the failed phase. */
  const od = O55.screens.defs['online-details'];
  if (od) {
    const orig = od.do.next;
    od.do.next = function (S) {
      if (S.sess.commit && S.sess.commit.renaming) { const cm = S.sess.commit; cm.renaming = false; cm.renamed = true; cm.state = 'running'; S.save(); return O55.ui.go('creating', { dir: 'back' }); }
      return orig(S);
    };
  }

  /* ------------------------------------------------------------------ finish protecting your work (after commit) */
  const STEPS = ['signin', 'test', 'kit', 'kitTest', 'policy'];
  const NAS_PATH = '/volume1/backups/puppet-master';
  const ACCESSED = (dest) => dest === 's3' || dest === 'sftp';
  const signinStep = (dest) => (dest === 'nas' ? 'connect' : ACCESSED(dest) ? 'access' : 'signin');
  const acc = (S) => (S.sess.backup.access = S.sess.backup.access || {});
  /* a working SSH connection to the backup NAS already exists (set up for it here, or earlier in this run) */
  const nasReady = (S) => { const n = S.sess.nas || {}, nas = O55.backup.nas(S); return !!(nas && n.device === nas.id && n.installed); };
  const kitWords = (S) => { const w = ['river', 'candle', 'orbit', 'maple', 'quiet', 'lantern', 'harbor', 'cedar', 'violet', 'pebble', 'ember', 'falcon'], r = U.rng('kit:' + md(S).project_name); return [0, 1, 2, 3, 4, 5].map(() => w[Math.floor(r() * w.length)]); };
  def('protect', {
    chapter: 'project', stage: 'automatic_preparation',
    scene: (S) => ({ id: 'safe', beat: 'protect', params: { backup: true, online: md(S).online_mode !== 'none' } }),
    eyebrow: () => T('protect.eyebrow'),
    title: () => T('protect.title'),
    lead: (S) => T(S.sess.backup.dest === 'nas' ? 'protect.leadNas' : ACCESSED(S.sess.backup.dest) ? 'protect.leadAccess' : 'protect.lead', { where: O55.backup.label(S, S.sess.backup.dest) }),
    body(S) {
      const b = S.sess.backup, where = O55.backup.label(S, b.dest), done = b.done || [];
      const next = STEPS.find((s) => !done.includes(s));
      let out = `<ol class="o55-steplist" data-key="steps">` + STEPS.map((s) => {
        const state = done.includes(s) ? 'done' : s === next ? 'active' : 'waiting';
        return `<li class="o55-step o55-step-${state}" data-key="st-${s}"><span class="o55-phmark" aria-hidden="true">${state === 'done' ? C.small('check', 13) : ''}</span><span>${U.esc(T('protect.steps.' + (s === 'signin' ? signinStep(b.dest) : s), { where }))}</span></li>`;
      }).join('') + '</ol>';
      /* connecting, by kind of place: the NAS over SSH with a key, a bucket or a server with its access details, a
         cloud drive through its own sign-in page */
      if (next === 'signin' && b.dest === 'nas') {
        /* a NAS that runs Puppet Master is paired with, not given a key (PWIZ-029) */
        const nas = O55.backup.nas(S), paired = nasReady(S) ? !!(S.sess.nas || {}).viaPm : !!(nas && nas.pm && !(S.sess.nas || {}).useSsh);
        out += C.note(T('protect.' + (nasReady(S) ? 'nasReuse' : 'nasFlow') + (paired ? 'Paired' : ''), { name: where }), 'info', paired ? 'link' : 'key');
        out += `<p class="o55-hint" data-key="naspath">${U.esc(T('protect.nasPath', { name: where, path: NAS_PATH.split('/').filter(Boolean).join(' › ') }))}</p>`;
      }
      if (next === 'signin' && ACCESSED(b.dest)) out += O55.backup.accessFields(S, b.dest, acc(S));
      if (next === 'kit') out += C.note(T('protect.kitWhy'), 'info', 'key');
      if (done.includes('kit') && !done.includes('kitTest')) {
        out += `<div class="o55-kit" data-key="kit"><span class="o55-hint">${U.esc(T('protect.saved'))} · Recovery Kit – ${U.esc(md(S).project_name)}.pdf</span><span class="o55-kitwords">${kitWords(S).map((w, i) => `<span><i>${i + 1}</i>${U.esc(w)}</span>`).join('')}</span></div>`;
        out += C.field({ bind: 'word', label: T('protect.checkLabel', { n: 4 }), value: '', error: b.wordBad ? T('protect.checkBad', { n: 4 }) : '', invalid: !!b.wordBad });
      }
      if (!next) out += C.note(T('protect.done'), 'ok', 'check');
      const st = next && F.state(S, 'backup:' + next);
      if (st && st.state === 'running') out += `<p class="o55-hint" data-key="work"><span class="o55-spin"></span> ${U.esc(T('chrome.working'))}</p>`;
      return out;
    },
    foot(S) {
      const b = S.sess.backup, done = b.done || [], next = STEPS.find((s) => !done.includes(s));
      if (!next) return { back: false, primary: { label: T('chrome.continue'), do: 'finish' } };
      const label = { signin: b.dest === 'nas' || ACCESSED(b.dest) ? T('protect.connect') : T('online.signin.signIn'), test: T('protect.steps.test'), kit: T('protect.save'), kitTest: T('ai.verify'), policy: T('protect.steps.policy') }[next];
      const waiting = next === 'signin' && ACCESSED(b.dest) && !O55.backup.accessReady(b.dest, acc(S));
      return { back: false, secondary: [{ label: T('protect.later'), do: 'later', cls: 'o55-ghost' }], primary: { label, do: 'step', disabled: waiting, reason: T('protect.accessMissing') } };
    },
    /* back from the NAS's SSH steps, the connection is finished here; fields for a secret are empty when drawn afresh */
    mounted(S, layer, fresh) {
      const b = S.sess.backup, next = STEPS.find((s) => !(b.done || []).includes(s));
      if (fresh && b.access) { O55.backup.accessReset(b.access); }
      if (next === 'signin' && b.dest === 'nas' && nasReady(S) && !F.state(S, 'backup:signin')) this.do.step(S);
    },
    do: {
      step(S) {
        const b = S.sess.backup, done = b.done = b.done || [], next = STEPS.find((s) => !done.includes(s));
        const cmd = { signin: 'cmd.backup.destination.add', test: 'cmd.backup.destination.test', kit: 'cmd.backup.recovery_key.export', kitTest: 'cmd.backup.recovery_key.test', policy: 'cmd.backup.policy.update' }[next];
        if (next === 'kitTest') {
          const i = S.root.querySelector('#o55f-word'), v = i ? i.value.trim().toLowerCase() : '';
          if (v !== kitWords(S)[3]) { b.wordBad = true; S.save(); O55.sound.play('error'); O55.ui.refresh(); return O55.ui.shake('word'); }
          b.wordBad = false;
        }
        if (next === 'signin' && b.dest === 'nas' && !nasReady(S)) {
          /* the same SSH steps as files on a NAS: its identity before trust, a key, one sign-in; then back here */
          S.sess.nas = { purpose: 'dest', method: 'ssh', device: O55.backup.nas(S).id, trusted: false, installed: false, key: null };
          S.save(); return O55.ui.go(O55.nas.entry(S));
        }
        if (next === 'signin' && ACCESSED(b.dest) && !O55.backup.accessTake(S, b.dest, acc(S))) { O55.sound.play('error'); O55.ui.refresh(); return; }
        if (next === 'signin' && (b.dest === 'gdrive' || b.dest === 'onedrive')) O55.official.open(S, { name: O55.backup.label(S, b.dest), url: O55.fixtures.OFFICIAL.backup[b.dest] || null });
        F.op(S, 'backup:' + next, cmd, [{ key: next, ms: next === 'test' ? 1200 : next === 'signin' ? 1800 : 700 }], { payload: { destination: b.dest, transport: b.dest === 'nas' ? O55.nas.transport(S) : b.dest, path: b.dest === 'nas' ? NAS_PATH : null, credential_ref: ACCESSED(b.dest) ? 'credential:backup:' + b.dest : null }, onDone: () => { if (!done.includes(next)) done.push(next); b.state = done.length === STEPS.length ? 'done' : 'partial'; S.save(); O55.ui.refresh(); } });
      },
      later(S) { S.sess.backup.state = 'later'; S.save(); O55.ui.go('ai'); },
      finish(S) { O55.ui.go('ai'); }
    },
    /* the kit word is read on submit; the access fields keep what is not secret, and only whether a secret was typed */
    bind: Object.assign(O55.backup.accessBinds((S) => [S.sess.backup.dest, acc(S)]), { word() {} }),
    onBack: () => false
  });

  O55.review = { routeParams, beginsAs, filesAt, whereWork };
})();
