/* Chapter 3 (end) — Review [review_setup_plan], Creating [automatic_preparation] and Finish protecting your work.
   Review re-checks the draft read-only, shows every choice with Edit, and says exactly what the one click will do.
   Creating is the single reviewed commit: an idempotency key, truthful phases, one receipt per owner, and recovery that
   never leaves a half-made Project. Local journeys keep their fixture choreography (tagged as a concept fixture);
   the exact GitHub remote-create chain (PJCT-007/PJCT-008, PWIZ-021) adopts only injected owner-shaped results:
   original-key replay re-observes without new effect, a verified remote advances only through a fresh fenced
   resume attempt, failure before any remote effect offers reviewed safe-new-attempt choices, and an unknown
   outcome is reconciliation-only. Nothing is listed, selected, or bound before the terminal result. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const PR = () => O55.projectRecovery;
  const md = (S) => S.sess.drafts.main;
  const P = () => O55.project;
  const forgeName = (d) => O55.safe.forgeName(d.forge, d.forge_provider_variant);
  const FLOW = ['where', 'begin', 'name', 'like', 'safe', 'away', 'review'];
  /* No numeric priority: O55.sound ranks coinciding events itself. The reviewed
     commit is one designed moment: Create sounds `commit` and carries the change to Creating (go silent); the Project
     made sounds `save` (the transport's own done sound is off) and the troupe's celebration follows (NieR: the Created
     act, hero spec H4a). */
  const SND = { success: { intensity: 0.7 }, create: { intensity: 0.8 }, prepare: { intensity: 0.6 }, made: { intensity: 1 } };
  const RECHECK_PHASES = [{ key: 'check', ms: 650 }];
  const RECHECK_QUIET = { done: false };
  /* results arrive later: they sound only while the screen that shows them is still the one on screen */
  const showing = (id) => O55.S.open && O55.S.sess.screen === id;
  /* The made moment is shown once the app beneath has settled (films M4). Publication selects the new Project:
     Settings loads it and repaints the app's theme from it, then the look is saved into it (publishProject) and
     repainted again, and each time the app's own theme listeners re-measure the whole page, the better part of a
     second on a slow computer. All of that runs while the screen still shows its last check done; the made moment
     (its sound, the title, the saved line, the troupe) follows on the first idle frame after, so it never freezes.
     The outcome is the truth at once (saved as done); only the moment waits (S.settling, never saved: a reopened
     window shows it made). By then the speaker is bound to the new Project's own setting, which Settings can read once
     the look has been written into it (selecting it rebinds the speaker, silent until then: fail closed), so the made
     moment's sound plays with its picture. */
  const shownDone = (S) => { const cm = S.sess.commit || {}; return cm.state === 'done' && O55.S.settling !== cm.key; };
  function reveal(S, cm) {
    S.settling = cm.key;
    let shown = false;
    const show = () => {
      if (shown) return; shown = true;
      if (S.settling !== cm.key) return;
      S.settling = null; cm.doneAt = Date.now(); S.save();
      if (showing('creating')) O55.sound.play('save', SND.made);
      O55.ui.refresh();
      made(S);
    };
    /* after the look's write (queued by publishProject before this): the first two frames in a row under 34 ms each
       (at most 1.6 s), so the moment starts on a frame of its own, never at the tail of the app's re-measuring */
    const R = O55.motion.real;
    R.setTimeout(() => {
      const t0 = performance.now(); let last = 0, n = 0, calm = 0;
      const step = (t) => { if (last) calm = t - last < 34 ? calm + 1 : 0; last = t; n++; if ((n >= 3 && calm >= 2) || performance.now() - t0 > 1600) show(); else R.raf(step); };
      R.raf(step);
    }, 0);
    R.setTimeout(show, 2400); /* a hidden page draws no frames */
  }

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
      if (d.online_mode !== 'none') safe += row('online', d.project_mode === 'existing_online' ? forgeName(d) + ' · ' + d.repository_ref.replace(/^[a-z_]+:/, '') : forgeName(d) + ' · ' + (d.repository_container || O55.official.accountFor(S, d.forge) || '') + '/' + d.repository_name, 'safe');
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
      const d = md(S), key = 'recheck:' + d.project_draft_revision;
      const st = F.state(S, key);
      if (st && st.state === 'done') return;
      F.op(S, key, 'cmd.project.refresh', RECHECK_PHASES, { payload: { draft: d.project_draft_ref, revision: d.project_draft_revision }, sound: RECHECK_QUIET });
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
          S.save(); O55.sound.play('commit', SND.prepare); return O55.ui.go('creating', { silent: true });
        }
        /* one reviewed commit per draft revision: a second click reuses the same idempotency key, while a
           fresh review (new revision) starts a new original attempt. The destination stays a private
           reservation until the terminal result publishes it. */
        if (!S.sess.commit || S.sess.commit.state === 'none') {
          O55.draft.set(d, { review_confirmed: true });
          const cm = S.sess.commit = { state: 'running', key: 'commit:' + d.project_draft_ref + ':r' + d.project_draft_revision, attempt: 1, revision: d.project_draft_revision };
          PR().resetRecovery(cm);
          PR().beginOriginal(cm, d);
          cm.pendingProjectId = PR().reserveDestinationId(d);
          cm.fixtureProjectId = 'p-' + U.slug(d.project_name).slice(0, 24) + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
          S.save();
        }
        O55.sound.play('commit', SND.create);
        O55.ui.go('creating', { silent: true });
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
    /* the tool the person chose (Git or Jujutsu) is installed first when this computer lacks it */
    if (!hasHistory) list.push((d.history_backend === 'jujutsu' ? S.env.here.jj : S.env.here.git) ? 'history' : 'historyInstall');
    if (d.online_mode === 'new' && !cm.skipOnline) list.push('online');
    if (d.settings_transfer.mode === 'copy_from_project') list.push('settings');
    if (d.server_mode === 'new_server' && d.remote_mode !== 'local_or_vpn') list.push('remote');
    list.push('check');
    return list;
  }
  const PH_MS = { folder: 700, device: 900, clone: 1400, restore: 1500, history: 700, historyInstall: 1600, online: 1300, settings: 900, remote: 1100, check: 900 };
  const CHILD = { history: 'cmd.source_control.backend.select', historyInstall: 'cmd.source_control.backend.select', online: 'cmd.source_control.repository.bind', settings: 'cmd.settings.transaction.apply', remote: null };
  function remoteCmd(d) { return d.remote_mode === 'tailscale' ? 'cmd.remote_access.tailscale.setup.start' : d.remote_mode === 'reverse_proxy' ? 'cmd.remote_access.proxy.generate' : 'cmd.remote_access.remote_link.setup'; }

  /* Terminal publication is the single gate that lists, selects, or binds a Project: one menu row, the
     selection, the staged Settings snapshot, the look, and the project-created event. It runs only for
     the terminal listed/persisted result (owner-adopted on the GitHub chain, fixture-tagged locally). */
  function publishProject(S, id, via) {
    const d = md(S), cm = S.sess.commit;
    const st = window.PM12_KIMI && window.PM12_KIMI.o55SettingsTransfer;
    if (d.settings_transfer.mode === 'copy_from_project' && !cm.stagedSettings) {
      cm.settingsPublishError = 'The required Settings preview is missing.'; return null;
    }
    const pub = PR().publishStagedSettings(st, cm, id, d);
    if (!pub.ok) { cm.settingsPublishError = pub.reason; return null; }
    cm.projectId = id; cm.publishedVia = via;
    cm.receipts = cm.receipts || {};
    cm.receipts.project = via === 'fixture' ? 'fixture:project:' + id : cm.recovery.settled_effects.registry_publication.receipt_ref;
    if (O55.shell && O55.shell.selectProject) O55.shell.selectProject(id, d.project_name);
    /* the new Project starts with the look chosen here: Settings loads a new Project's own settings as it is selected
       (after this task), so the look is saved into it once that load has run (its first write also makes the Project's
       own sound setting readable: the speaker stays silent until then) */
    O55.motion.after(0, () => { if (O55.shell && O55.shell.commitLook) O55.shell.commitLook(S); });
    window.dispatchEvent(new CustomEvent('o55:project-created', { detail: { id, name: d.project_name, receipts: cm.receipts, fixture: via === 'fixture' } }));
    return id;
  }
  /* Settings are staged against the private destination reservation, never the selected Project: the
     existing selected-destination helper cannot be called before publication. */
  function stageSettings(S) {
    const d = md(S), cm = S.sess.commit, st = window.PM12_KIMI && window.PM12_KIMI.o55SettingsTransfer;
    if (!st) return 'settings_owner_missing';
    if (cm.stagedSettings) return null;
    const cats = (S.sess.like && S.sess.like.categories) || (st.categories ? st.categories() : []);
    const res = PR().stagePendingSettings(st, cm, d, d.settings_transfer.source_project_id, cats, { credentials: 'Keep existing destination credential ownership', conflicts: 'Preview every changed value', rollback: true, excludedSettings: ['general.visual.theme', 'general.visual.theme-mode', 'general.visual.nier-mode', 'general.visual.nier-parts', 'general.visual.nier-background'] });
    if (res.ok) { cm.receipts = cm.receipts || {}; cm.receipts.settings = cm.stagedSettings.receipt; cm.settingsCount = cm.stagedSettings.count; cm.settingsFixture = cm.stagedSettings.fixture; return null; }
    if (/No canonical transferable values differ/i.test(res.reason || '')) { cm.receipts = cm.receipts || {}; cm.receipts.settings = 'no-change'; cm.settingsCount = 0; return null; }
    cm.settingsError = res.reason || 'unknown';
    return 'settings_rejected';
  }
  function discardStaged(S) {
    const cm = S.sess.commit, st = window.PM12_KIMI && window.PM12_KIMI.o55SettingsTransfer;
    PR().discardStagedSettings(st, cm);
  }
  /* GitHub-chain adoption: transport timers never confer a remote outcome; only an adopted owner-shaped
     result does. Without a current result the concept fails closed (pending), never success. */
  function adoptCreatePhase(S) {
    const d = md(S), cm = S.sess.commit, OR = O55.ownerResults;
    if (cm.recovery && cm.recovery.remote_effect_state === 'verified_created') { PR().replayOriginal(cm); return adoptResumePhase(S); }
    if (cm.recovery && cm.recovery.remote_effect_state === 'failed_before_effect') { PR().replayOriginal(cm); S.save(); O55.ui.refresh(); return; }
    PR().beginCreateRequest(OR, cm, d);
    const v = PR().adoptCreateResult(OR, cm, d, OR.take(cm.or_create.id));
    if (!v.ok) { cm.state = cm.recovery?.remote_effect_state === 'unknown' ? 'unknown' : 'pending'; cm.code = v.reason; S.save(); O55.ui.refresh(); return; }
    if (cm.publishable) return publishAccepted(S);
    cm.state = v.state === 'verified_created' ? 'recovery' : v.state === 'unknown' ? 'unknown' : 'failed';
    cm.code = v.state === 'failed_before_effect' ? (cm.recovery.failure_reason || 'create_failed') : v.state;
    if (v.state === 'verified_created') { if (showing('creating')) O55.sound.play('error'); PR().armResumeRequest(OR, cm, d); }
    else if (v.state === 'failed_before_effect' && showing('creating')) O55.sound.play('error');
    S.save(); O55.ui.refresh();
  }
  function adoptResumePhase(S) {
    const d = md(S), cm = S.sess.commit, OR = O55.ownerResults;
    const arm = PR().armResumeRequest(OR, cm, d);
    if (!arm.ok) { cm.code = arm.reason; S.save(); O55.ui.refresh(); return; }
    const v = PR().adoptResumeResult(OR, cm, d, OR.take(cm.or_resume.id));
    if (!v.ok) { cm.code = v.reason; S.save(); O55.ui.refresh(); return; }
    if (cm.publishable) return publishAccepted(S);
    cm.code = null; S.save(); if (showing('creating')) O55.sound.play('success', SND.success); O55.ui.refresh();
  }
  function publishAccepted(S) {
    const d = md(S), cm = S.sess.commit;
    cm.receipts = cm.receipts || {};
    cm.receipts.original_terminal = cm.recovery.original_terminal_result_ref;
    cm.receipts.recovery = 'recovery:' + cm.recovery.recovery_id;
    if (!publishProject(S, cm.publishable.project_id, 'owner')) { cm.state = 'recovery'; cm.code = 'settings_rejected'; S.save(); O55.ui.refresh(); return; }
    cm.state = 'done'; cm.code = null; S.save();
    reveal(S, cm);
  }
  /* The Project is made (hero spec H4a). Under NieR's art the stage performs the Created act in the same task as the
     refresh that turns its scene to done: the units land and bow, the name sign the person lettered comes back down
     and is stamped, and the run's one confetti bursts from it with the celebration (O55.art.createdAct plays its own
     land and celebrate). In the looks the troupe celebrates once the scene has taken its bow beat, as before. */
  function made(S) {
    const stage = S.root && S.root.querySelector('.o55-stage');
    if (O55.theme().art === 'nier' && O55.art.createdAct) { if (stage && S.open && showing('creating')) O55.art.createdAct(stage, { name: md(S).project_name }); return; }
    O55.motion.after(650, () => { if (O55.art.celebrate && S.open) O55.art.celebrate(S.root.querySelector('.o55-stage'), { big: true }); });
  }
  /* NieR's saved line under the meter (H4a): "Saved · 8 Oct 2026 · 10:42" in the person's own date and time format */
  function savedLine(S, cm) {
    if (!shownDone(S) || !O55.theme().nier || md(S).project_mode === 'later') return '';
    const at = new Date(cm.doneAt || Date.now());
    let date = '', time = '';
    try {
      date = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(at);
      time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(at);
    } catch (_) { date = at.toDateString(); }
    return `<p class="o55nw-saved" data-key="saved">${U.esc(T('nierWindow.saved', { date, time }))}</p>`;
  }
  function repoDisplay(S) {
    const d = md(S), owner = d.repository_container || O55.official.accountFor(S, d.forge) || '';
    return (owner ? owner + '/' : '') + (d.repository_name || d.project_name);
  }
  function runCommit(S) {
    const d = md(S), cm = S.sess.commit; if (!cm || cm.state === 'done') return;
    if (d.project_mode === 'later') {
      const order = phasesFor(S);
      /* no Project record, folder, history or copy: only the new Server's access, then a check */
      F.op(S, cm.key, remoteCmd(d), order.map((k) => ({ key: k, ms: PH_MS[k] })), {
        payload: { idempotency_key: cm.key, draft: d.project_draft_ref },
        onFail: (S2, st) => { cm.state = 'failed'; cm.code = st.code; S.save(); },
        sound: { intensity: 0.8 },
        onDone: () => { cm.state = 'done'; cm.code = null; cm.doneAt = Date.now(); S.save(); O55.ui.refresh(); }
      });
      return;
    }
    if (PR().isGithubRemoteChain(d)) return runGithubCommit(S);
    return runLocalCommit(S);
  }
  /* Local and non-GitHub journeys: fixture choreography, explicitly tagged, published only at the
     terminal step. A retry resumes the failed phase with the same key; no remote effect is claimed. */
  function runLocalCommit(S) {
    const d = md(S), cm = S.sess.commit;
    if (cm.state === 'failed') return;
    const order = phasesFor(S);
    const phases = order.map((k) => ({ key: k, ms: PH_MS[k], fail: () => {
      if (CHILD[k]) O55.owners.dispatch(CHILD[k], Object.assign({ draft: d.project_draft_ref }, CHILD[k] === 'cmd.source_control.backend.select' ? { backend: d.history_backend, install: k === 'historyInstall' } : {}), S.ctx(), () => ({ ok: true }));
      if (k === 'remote') O55.owners.dispatch(remoteCmd(d), { draft: d.project_draft_ref }, S.ctx(), () => ({ ok: true }));
      if (k === 'online') {
        const f = S.env.failures.online_copy;
        if (f === 'name_taken' && !cm.renamed) return 'name_taken';
        if (f === 'network' && !cm.networkRetried) { cm.networkRetried = true; S.save(); return 'network'; }
        cm.receipts = cm.receipts || {}; cm.receipts.online = 'fixture:online-copy:' + d.forge + ':' + d.repository_name;
      }
      if (k === 'settings') return stageSettings(S);
      if (k === 'check' && (d.storage_mode === 'network_location' || d.project_transport === 'ssh' || d.project_transport === 'puppet_master')) cm.writeTest = 'ok';
      return null;
    } }));
    const cmd = d.project_mode === 'new' ? 'cmd.project.new_local' : 'cmd.project.add_existing';
    F.op(S, cm.key, cmd, phases, {
      payload: { idempotency_key: cm.key, draft: d.project_draft_ref, revision: d.project_draft_revision }, sound: { done: false },
      onFail: (S2, st) => { cm.state = 'failed'; cm.code = st.code; discardStaged(S); S.save(); },
      onDone: () => {
        if (!publishProject(S, cm.fixtureProjectId, 'fixture')) { cm.state = 'failed'; cm.code = 'settings_rejected'; S.save(); O55.ui.refresh(); if (showing('creating')) O55.sound.play('error'); return; }
        cm.state = 'done'; cm.code = null; S.save();
        /* the Project is made: once the app beneath has settled, its sound and the troupe's celebration (NieR: the
           Created act) */
        reveal(S, cm);
      }
    });
  }
  /* GitHub remote-create chain: transport phases are display only (no owner dispatch, no fabricated
     outcome); the terminal truth arrives only through adoptCreatePhase. The command table registers the owner routes but refuses native dispatch because no handler is present.
     This transport is explicitly a display-only fixture; it grants no dispatch authority. */
  function runGithubCommit(S) {
    const d = md(S), cm = S.sess.commit, OR = O55.ownerResults;
    if (cm.state === 'failed' && !cm.resumeTransport) return;
    cm.resumeTransport = false;
    PR().beginCreateRequest(OR, cm, d);
    if (cm.transportDone) return adoptCreatePhase(S);
    if (cm.transportRunning) return;
    cm.transportRunning = true;
    const order = phasesFor(S);
    const phases = order.map((k) => ({ key: k, ms: PH_MS[k], fail: () => {
      if (k === 'settings') return stageSettings(S);
      if (k === 'check' && (d.storage_mode === 'network_location' || d.project_transport === 'ssh' || d.project_transport === 'puppet_master')) cm.writeTest = 'ok';
      return null;
    } }));
    /* an operation belongs to the run that started it: after Run Onboarding Again its late reports are dropped */
    const epoch = S.epoch || 0;
    S.sess.ops = S.sess.ops || {};
    S.sess.ops[cm.key] = { state: 'running', phases: phases.map((p) => ({ key: p.key, status: 'waiting' })), code: null };
    S.save(); O55.ui.refresh();
    let shown = -1; /* the phase list's tick as each phase starts (the first starts with the press, so it is quiet) */
    O55.owners.operation(cm.key, phases, (st) => {
      if ((S.epoch || 0) !== epoch || S.sess.commit !== cm) return;
      S.sess.ops[cm.key] = { state: st.state, phases: st.phases, code: st.code, failedAt: st.failedAt };
      S.save();
      if (st.state === 'done') { cm.transportRunning = false; cm.transportDone = true; S.save(); adoptCreatePhase(S); return; }
      if (st.state === 'failed') { cm.transportRunning = false; cm.transportDone = true; cm.localFailure = st.code; S.save(); adoptCreatePhase(S); return; }
      O55.ui.refresh();
      const i = phases.findIndex((p) => p.key === st.current);
      if (shown >= 0 && i > shown && showing('creating')) O55.sound.play('phase', { step: i, intensity: 0.3 + 0.5 * i / Math.max(1, phases.length - 1) });
      if (i > shown) shown = i;
    });
  }
  /* A failed GitHub attempt never retries in place: a fresh review (new draft revision) starts a new
     original attempt with a new idempotency key. */
  function reviewFresh(S) {
    discardStaged(S);
    O55.draft.set(md(S), { review_confirmed: false });
    S.sess.commit = { state: 'none' };
    S.save(); O55.ui.go('review');
  }
  const REASON_COPY = { central_dispatch_unavailable: 'waitingHost', concurrent_resume_active: 'claimBusy', forge_owner_gated: 'deleteGated', no_verified_binding: 'noBinding', remote_unknown_reconcile_only: 'unknownOnly', no_verified_remote_identity: 'noRemote', no_verified_recovery: 'noRemote', stale_setup_binding: 'stale', stale_generation: 'stale', stale_nonce: 'mismatch', stale_composition: 'stale', recovery_mismatch: 'mismatch', pending_no_result: 'pending', resume_armed: 'armed', delete_adopted: 'deleted', delete_not_confirmed: 'confirmFirst', open_unavailable: 'openUnavailable', unknown_command: 'openUnavailable', needs_review_confirmation: 'openUnavailable' };
  function reasonCopy(code) { return T('creating.recovery.reasons.' + (REASON_COPY[code] || 'other')); }
  /* Plain recovery status; technical IDs live only in the details disclosure below it. */
  function githubStatus(S) {
    const d = md(S), cm = S.sess.commit, svc = forgeName(d), R = 'creating.recovery.';
    const btn = (label, action, dis, reason) => O55.ui.btn({ label, do: action, cls: 'o55-small', disabled: !!dis, reason: reason || '' }, dis ? 'o55-ghost' : 'o55-secondary');
    const note = cm.routeNote ? `<p class="o55-hint" data-key="routenote">${U.esc(reasonCopy(cm.routeNote))}</p>` : '';
    const again = btn(T(R + 'checkAgain'), 'checkAgain');
    if (cm.state === 'running' && !cm.transportDone && !cm.code) return '';
    if (cm.state === 'pending' || (cm.state === 'running' && cm.transportDone)) {
      const mismatch = cm.code && cm.code !== 'pending_no_result';
      return `<div class="o55-banner o55-banner-info" data-key="pending">${C.small('cloud', 18)}<span>${U.esc(T(R + (mismatch ? 'mismatch' : 'pending'), { service: svc }))}</span></div>`
        + `<div class="o55-actions" data-key="recheck">${again}</div>` + note;
    }
    if (cm.state === 'unknown') {
      return `<div class="o55-banner o55-banner-info" data-key="unknown">${C.small('cloud', 18)}<span>${U.esc(T(R + 'unknown', { service: svc }))}</span></div>`
        + `<p class="o55-hint" data-key="unknownonly">${U.esc(T(R + 'unknownOnly'))}</p>`
        + `<div class="o55-actions" data-key="recheck">${again}</div>` + note;
    }
    if (cm.state === 'failed') {
      if (!cm.recovery) {
        const msg = cm.code === 'settings_rejected' ? (cm.settingsError || '') : T(R + 'mismatch');
        return `<div class="o55-banner o55-banner-warn" data-key="fail">${C.small('cloud', 18)}<span>${U.esc(msg)}</span></div>`
          + `<div class="o55-actions" data-key="recheck">${again}</div>` + note;
      }
      const msg = cm.code === 'name_taken' ? T('creating.taken', { service: svc, repo: d.repository_name }) : cm.code === 'network' ? T('creating.network', { service: svc }) : T(R + 'failedLead');
      return `<div class="o55-banner o55-banner-warn" data-key="fail">${C.small('cloud', 18)}<span>${U.esc(msg)}</span></div>`
        + `<p class="o55-hint" data-key="freshattempt">${U.esc(T(R + 'freshAttempt'))}</p>`
        + `<div class="o55-actions" data-key="safechoices">${O55.ui.btn({ label: T(R + 'reviewAgain'), do: 'reviewAgain', cls: 'o55-small' }, 'o55-secondary')}</div>` + note;
    }
    if (cm.state === 'recovery') {
      const r = cm.recovery, repo = repoDisplay(S);
      const gC = PR().effectiveContinue(O55.ownerResults, cm, d), gO = PR().effectiveOpen(cm), gD = PR().effectiveDelete(cm);
      let out = `<div class="o55-banner o55-banner-warn" data-key="recovery">${C.small('cloud', 18)}<span>${U.esc(T(R + 'notice', { repo, service: svc }))}</span></div>`;
      if (cm.settingsPublishError) out += C.note('Your project result is kept. Settings must finish before the project can open. Check again retries only that final handoff; it does not create another repository or repeat completed work.', 'warn', 'stack');
      out += `<div class="o55-actions" data-key="routes">${btn(T(R + 'continue'), 'continueSetup', !gC.available, reasonCopy(gC.reason))}`
        + `${btn(T(R + 'open'), 'openRepo', !gO.available, reasonCopy(gO.reason))}${btn(T(R + 'delete'), 'deleteRepo', !gD.available, reasonCopy(gD.reason))}</div>`;
      out += `<p class="o55-hint" data-key="routereasons">${U.esc(reasonCopy(gC.reason))} · ${U.esc(reasonCopy(gD.reason))}</p>`;
      if (cm.deleteConfirm) {
        out += `<div class="o55-confirm" data-key="deleteconfirm"><span>${U.esc(T(R + 'deleteConfirm', { repo, service: svc }))}</span>`
          + `<span class="o55-hint">${U.esc(T(R + 'deleteWarn'))}</span> `
          + `${O55.ui.btn({ label: T(R + 'deleteYes'), do: 'confirmDelete', cls: 'o55-small' }, 'o55-primary')} `
          + `${O55.ui.btn({ label: T(R + 'deleteNo'), do: 'cancelDelete', cls: 'o55-small' }, 'o55-ghost')}</div>`;
      }
      if (cm.deleteReceipt) out += `<p class="o55-hint" data-key="deleted">${U.esc(T(R + 'reasons.deleted'))}</p>`;
      out += `<div class="o55-actions" data-key="recheck">${again}</div>` + note;
      const rows = [['original command', r.original_command_id], ['original instance', r.original_command_instance_id],
        ['original key', r.original_idempotency_key], ['terminal result', r.original_terminal_result_ref],
        ['terminal digest', r.original_terminal_result_sha256], ['recovery', r.recovery_id],
        ['composition', r.composition_revision + ' · ' + r.composition_sha256],
        ['settled', Object.keys(r.settled_effects).join(', ')], ['remaining', r.remaining_effects.join(', ')]];
      if (r.active_resume_claim) rows.push(['resume claim', r.active_resume_claim.attempt_command_instance_id]);
      if (cm.resumeAttempt) rows.push(['resume attempt', cm.resumeAttempt.instance + ' · seq ' + cm.resumeAttempt.sequence]);
      if (cm.deleteReceipt) rows.push(['delete receipt', cm.deleteReceipt.receipt_ref]);
      out += C.details(S, 'recovery', T('creating.receipts'), C.kv(rows));
      return out;
    }
    return note;
  }
  def('creating', {
    chapter: 'project', stage: 'automatic_preparation',
    /* (under NieR's art the scene carries the Project's name: its sign comes back with it, stamped) */
    scene: (S) => { const st = F.state(S, (S.sess.commit || {}).key); const done = st ? (st.phases || []).filter((p) => p.status === 'done').length : 0; return { id: 'creating', beat: shownDone(S) ? 'done' : 'build', params: Object.assign({ step: done, total: phasesFor(S).length }, O55.theme().art === 'nier' ? { name: md(S).project_name || '' } : {}) }; },
    eyebrow: () => T('creating.eyebrow'),
    title: (S) => { const cm = S.sess.commit || {}, later = md(S).project_mode === 'later', nm = later ? P().serverName(S) : md(S).project_name; return shownDone(S) ? T(later ? 'creating.doneTitleLater' : 'creating.doneTitle', { name: nm }) : cm.state === 'failed' ? T('creating.failTitle') : T(later ? 'creating.titleLater' : 'creating.title', { name: nm }); },
    lead: (S) => { const cm = S.sess.commit || {}, later = md(S).project_mode === 'later'; return shownDone(S) ? T(later ? 'creating.doneLeadLater' : 'creating.doneLead') : cm.state === 'failed' && PR().isGithubRemoteChain(md(S)) ? T('creating.recovery.failedLead') : cm.state === 'failed' ? T('creating.failLead') : T('creating.lead'); },
    body(S) {
      const d = md(S), cm = S.sess.commit || {}, svc = forgeName(d), github = PR().isGithubRemoteChain(d);
      const labels = { folder: T('creating.phases.folder'), device: T('creating.phases.device', { device: (S.sess.nas && S.sess.nas.folderLabel) || P().serverName(S) }), clone: T('creating.phases.clone', { service: svc }), restore: T('creating.phases.restore'),
        history: T('creating.phases.history', { kind: d.history_backend === 'jujutsu' ? 'Jujutsu' : 'Git' }), historyInstall: T('creating.phases.historyInstall', { kind: d.history_backend === 'jujutsu' ? 'Jujutsu' : 'Git' }), online: T('creating.phases.online', { service: svc }), settings: T('creating.phases.settings', { project: (S.sess.like && S.sess.like.name) || '' }), remote: T('creating.phases.remote'), check: T('creating.phases.check') };
      let out = F.phases(S, cm.key, phasesFor(S), labels, cm.settingsCount != null ? { settings: cm.settingsCount ? cm.settingsCount + ' settings' : '' } : null) + savedLine(S, cm);
      if (github) {
        out += githubStatus(S);
        if (shownDone(S)) out += C.details(S, 'receipts', T('creating.receipts'), C.kv(Object.entries(cm.receipts || {}).map(([k, v]) => [k, v]).concat([['idempotency key', cm.key]])));
        return out;
      }
      if (cm.state === 'failed') {
        const msg = cm.code === 'name_taken' ? T('creating.taken', { service: svc, repo: d.repository_name }) : cm.code === 'network' ? T('creating.network', { service: svc }) : cm.code === 'settings_rejected' ? (cm.settingsError || '') : cm.code || '';
        out += `<div class="o55-banner o55-banner-warn" data-key="fail">${C.small('cloud', 18)}<span>${U.esc(msg)}</span></div>`;
        const acts = [O55.ui.btn({ label: T('creating.retry'), do: 'retry', cls: 'o55-small' }, 'o55-secondary')];
        if (cm.code === 'name_taken') acts.push(O55.ui.btn({ label: T('creating.rename', { service: svc }), do: 'rename', cls: 'o55-small' }, 'o55-secondary'));
        if (cm.code === 'name_taken' || cm.code === 'network') acts.push(cm.confirmSkip ? `<span class="o55-confirm">${U.esc(T('creating.skipConfirm'))} ${O55.ui.btn({ label: T('creating.skipOnline'), do: 'skipOnline', cls: 'o55-small' }, 'o55-primary')}</span>` : O55.ui.btn({ label: T('creating.skipOnline'), do: 'askSkip', cls: 'o55-small' }, 'o55-ghost'));
        out += `<div class="o55-actions" data-key="recover">${acts.join('')}</div>`;
      }
      if (shownDone(S)) out += C.details(S, 'receipts', T('creating.receipts'), C.kv(Object.entries(cm.receipts || {}).map(([k, v]) => [k, v]).concat([['idempotency key', cm.key], ['concept fixture', 'this preview acts out the steps']])));
      return out;
    },
    mounted(S) {
      const cm = S.sess.commit;
      // Re-rendering retained results must not trigger adoption and another render.
      // Result polling belongs only to the explicit Check Again action.
      if (cm && cm.state === 'running' && !cm.recovery && !cm.transportDone) runCommit(S);
    },
    foot(S) {
      const cm = S.sess.commit || {};
      if (shownDone(S)) return { back: false, primary: { label: T('creating.continue'), do: 'next' } };
      const reason = cm.state === 'failed' ? T('creating.failTitle') : cm.state === 'running' || cm.state === 'done' ? T('chrome.working') : T('creating.recovery.waiting');
      return { back: false, primary: { label: T('creating.continue'), do: 'next', disabled: true, reason } };
    },
    do: {
      retry(S) {
        const cm = S.sess.commit;
        if (PR().isGithubRemoteChain(md(S))) {
          if (cm.state === 'done') return;
          cm.state = 'running'; cm.resumeTransport = !cm.transportDone; cm.attempt = (cm.attempt || 1) + 1; S.save(); O55.ui.refresh();
          return runGithubCommit(S);
        }
        cm.state = 'running'; cm.attempt = (cm.attempt || 1) + 1; S.save(); O55.ui.refresh(); runCommit(S);
      },
      checkAgain(S) {
        const cm = S.sess.commit; cm.routeNote = null;
        if (cm.publishable) return publishAccepted(S);
        if (cm.recovery && cm.recovery.remote_effect_state === 'verified_created') return adoptResumePhase(S);
        if (cm.recovery && cm.recovery.remote_effect_state === 'failed_before_effect') { PR().replayOriginal(cm); S.save(); return O55.ui.refresh(); }
        cm.state = 'running'; cm.resumeTransport = !cm.transportDone; S.save(); O55.ui.refresh(); return runGithubCommit(S);
      },
      reviewAgain(S) { reviewFresh(S); },
      continueSetup(S) {
        const cm = S.sess.commit, gate = PR().effectiveContinue(O55.ownerResults, cm, md(S));
        if (!gate.available) { cm.routeNote = gate.reason; S.save(); O55.ui.refresh(); return; }
        const arm = PR().armResumeRequest(O55.ownerResults, cm, md(S));
        if (!arm.ok) { cm.routeNote = arm.reason; S.save(); O55.ui.refresh(); return; }
        const g = PR().effectiveContinue(O55.ownerResults, cm, md(S));
        cm.routeNote = g.available ? 'resume_armed' : g.reason;
        S.save(); O55.ui.refresh();
      },
      openRepo(S) {
        const cm = S.sess.commit, g = PR().effectiveOpen(cm);
        cm.routeNote = g.reason; S.save(); O55.ui.refresh();
      },
      deleteRepo(S) {
        const cm = S.sess.commit, g = PR().effectiveDelete(cm);
        if (!g.available) { cm.routeNote = g.reason; S.save(); O55.ui.refresh(); return; }
        cm.deleteConfirm = true; cm.routeNote = null; S.save(); O55.ui.refresh();
      },
      cancelDelete(S) { const cm = S.sess.commit; cm.deleteConfirm = false; S.save(); O55.ui.refresh(); },
      confirmDelete(S) {
        const d = md(S), cm = S.sess.commit, OR = O55.ownerResults, b = PR().beginDeleteRequest(OR, cm, d);
        if (!b.ok) { cm.routeNote = b.reason; S.save(); O55.ui.refresh(); return; }
        const v = PR().adoptDeleteResult(OR, cm, d, OR.take(cm.or_delete.id));
        if (!v.ok) { cm.routeNote = v.reason; S.save(); O55.ui.refresh(); return; }
        cm.deleteConfirm = false; cm.routeNote = 'delete_adopted'; S.save(); O55.sound.play('success', SND.success); O55.ui.refresh();
      },
      rename(S) {
        if (PR().isGithubRemoteChain(md(S))) return reviewFresh(S);
        S.sess.ui.returnTo = null; S.sess.commit.renaming = true; S.save(); O55.ui.go('online-details');
      },
      askSkip(S) { if (S.sess.commit.recovery) return; S.sess.commit.confirmSkip = true; S.save(); O55.ui.refresh(); },
      skipOnline(S) { if (S.sess.commit.recovery) return; const cm = S.sess.commit; cm.skipOnline = true; cm.confirmSkip = false; cm.state = 'running'; O55.draft.set(md(S), { online_mode: 'none' }); S.save(); O55.ui.refresh(); O55.sound.play('tap'); runCommit(S); },
      next(S) { O55.ui.go(md(S).project_mode === 'later' ? 'ready' : S.sess.backup.dest ? 'protect' : 'ai'); }
    },
    onBack: () => false
  });
  /* After "Change the name on GitHub" the details screen returns to Creating, which resumes the failed phase. */
  const od = O55.screens.defs['online-details'];
  if (od) {
    const orig = od.do.next;
    od.do.next = function (S) {
      if (S.sess.commit && S.sess.commit.renaming) {
        if (PR().isGithubRemoteChain(md(S))) return reviewFresh(S);
        const cm = S.sess.commit; cm.renaming = false; cm.renamed = true; cm.state = 'running'; S.save(); return O55.ui.go('creating', { dir: 'back' });
      }
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
  /* the kit's own words are the person's copy, outside this computer: the protected handoff shows them once and
     nothing of the kit is rendered, stored, or copied here (BRS-012 / F3-528) */
  const kitFile = (name) => 'Recovery Kit – ' + name + '.pdf';
  /* Owner-gated kit/policy steps (BRS-012/BRS-017): transport never marks done; only an adopted owner result with
     its separately evidenced postcondition does. Default host-unavailable stays pending with retry. */
  const KIT_CMD = { kit: 'cmd.backup.recovery_key.export', kitTest: 'cmd.backup.recovery_key.test', policy: 'cmd.backup.policy.update' };
  const kitGated = (next) => next === 'kit' || next === 'kitTest' || next === 'policy';
  const kitProject = (S) => (S.sess.commit && S.sess.commit.projectId) || null;
  const kitRequests = new WeakMap();
  const kitRequested = (S, next) => !!(kitRequests.get(S) || {})[next];
  function requestKitIdentity(S, next) {
    const requests = kitRequests.get(S) || {}; requests[next] = true; kitRequests.set(S, requests);
    // An ephemeral user request, never authentication or persisted step-up proof.
    if (S.sess.backup.stepUp) delete S.sess.backup.stepUp;
    O55.ui.refresh();
  }
  const kitNeedsStepUp = (next) => next === 'kit' || next === 'kitTest';
  const kitWarn = () => { if (showing('protect')) O55.sound.play('warn'); };
  function kitAdopt(S, next) {
    const b = S.sess.backup, OR = O55.ownerResults;
    const req = b['or_' + next];
    if (!req || !OR) { b['orErr_' + next] = 'host_unavailable'; S.save(); O55.ui.refresh(); return; }
    /* a pending owner is an info note (quiet); every other refusal below shows a warning note and warns with it */
    const current = kitNeedsStepUp(next) ? OR.protectedContext(kitProject(S)) : { project: kitProject(S) };
    if (!current || (kitNeedsStepUp(next) ? ['project', 'server', 'client', 'recovery_set_id', 'recovery_generation'] : ['project']).some(k => current[k] !== req[k])) {
      b['orErr_' + next] = 'stale_protected_context'; S.save(); O55.ui.refresh(); kitWarn(); return;
    }
    const res = OR.take(req.id);
    const pc = (res && res.postcondition) || {};
    const extra = next === 'kit' ? (pc.delivery === 'verified' && pc.savedAck === true)
      : next === 'kitTest' ? (pc.unlock === 'verified' && pc.scratch === 'verified')
      : (pc.policy === 'on');
    if (res && !extra) { b['orErr_' + next] = 'postcondition_missing'; S.save(); O55.ui.refresh(); kitWarn(); return; }
    const v = OR.adopt(req, res, {});
    if (!v.ok) {
      b['orErr_' + next] = v.reason;
      if (next === 'kitTest' && (v.reason === 'kit_mismatch' || v.reason === 'failed' || v.reason === 'refused')) b.kitBad = true;
      S.save(); O55.ui.refresh(); if (v.reason !== 'host_unavailable' && v.reason !== 'pending_no_result') kitWarn(); return;
    }
    if (!extra) { b['orErr_' + next] = 'postcondition_missing'; if (next === 'kitTest') b.kitBad = true; S.save(); O55.ui.refresh(); kitWarn(); return; }
    b['orErr_' + next] = null; b.kitBad = false;
    const done = b.done = b.done || [];
    if (next === 'kitTest' && res.identity && res.identity.words) { /* words never touch DOM/storage; discarded */ }
    if (!done.includes(next)) done.push(next);
    b.state = done.length === STEPS.length ? 'done' : 'partial';
    S.save(); O55.ui.refresh();
    stepDone(S, done.length);
  }
  /* a step ticked off: the music climbs with the list, and the last step lands a little bigger */
  function stepDone(S, n) {
    if (!showing('protect')) return;
    O55.sound.setContext({ step: S.sess.history.length + n });
    O55.sound.play('success', { step: n, intensity: n === STEPS.length ? 0.9 : 0.45 + 0.08 * n });
  }
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
      if (kitGated(next) && kitNeedsStepUp(next) && !kitRequested(S, next)) out += C.note(T('protect.stepUpHint'), 'info', 'key');
      if (done.includes('kit') && !done.includes('kitTest')) {
        /* masked, secret-free saved-kit card: the handoff showed the kit once, for the person to keep */
        out += `<div class="o55-kit" data-key="kit"><span class="o55-hint">${U.esc(T('protect.saved'))} · ${U.esc(kitFile(md(S).project_name))}</span><span class="o55-hint">${U.esc(T('protect.kitOnce'))}</span></div>`;
      }
      if (next === 'kitTest' && b.kitBad) out += C.note(T('protect.testFailed'), 'warn', 'key');
      if (kitGated(next) && b['orErr_' + next]) {
        const r = b['orErr_' + next];
        out += C.note(r === 'host_unavailable' || r === 'pending_no_result' ? T('protect.pendingHost') : T('protect.ownerFail'), r === 'host_unavailable' || r === 'pending_no_result' ? 'info' : 'warn', 'key');
      }
      if (!next) out += C.note(T('protect.done'), 'ok', 'check');
      const st = next && F.state(S, 'backup:' + next);
      if (st && st.state === 'running') out += `<p class="o55-hint" data-key="work"><span class="o55-spin"></span> ${U.esc(T('chrome.working'))}</p>`;
      return out;
    },
    foot(S) {
      const b = S.sess.backup, done = b.done || [], next = STEPS.find((s) => !done.includes(s));
      if (!next) return { back: false, primary: { label: T('chrome.continue'), do: 'finish' } };
      const st = F.state(S, 'backup:' + next);
      if (st && st.state === 'running') return { back: false, secondary: [{ label: T('protect.later'), do: 'later', cls: 'o55-ghost' }], primary: { label: T('chrome.working'), do: 'noop', disabled: true, reason: T('chrome.working') } };
      if (kitGated(next) && kitNeedsStepUp(next) && !kitRequested(S, next)) return { back: false, secondary: [{ label: T('protect.later'), do: 'later', cls: 'o55-ghost' }], primary: { label: T('protect.stepUp'), do: 'stepUp' } };
      if (kitGated(next) && st && st.state === 'done' && b['orErr_' + next]) return { back: false, secondary: [{ label: T('protect.later'), do: 'later', cls: 'o55-ghost' }], primary: { label: T('protect.retry'), do: 'retry' } };
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
      noop() {},
      stepUp(S) {
        const b = S.sess.backup, done = b.done || [], next = STEPS.find((s) => !done.includes(s));
        if (!kitGated(next) || !kitNeedsStepUp(next)) return;
        O55.sound.play('tap');
        requestKitIdentity(S, next);
      },
      retry(S) {
        const b = S.sess.backup, done = b.done || [], next = STEPS.find((s) => !done.includes(s));
        if (!kitGated(next)) return;
        kitAdopt(S, next);
      },
      /* el is the pressed button; mounted() also starts the NAS step on arrival, and that arrival already sounded */
      step(S, arg, el) {
        const b = S.sess.backup, done = b.done = b.done || [], next = STEPS.find((s) => !done.includes(s));
        if (!next) return;
        const press = () => { if (el) O55.sound.play('tap'); };
        if (kitGated(next)) {
          /* protected handoff: current step-up first, then transport, then adoption — never timer success */
          if (kitNeedsStepUp(next) && !kitRequested(S, next)) { press(); requestKitIdentity(S, next); return; }
          if (!b['or_' + next]) {
            const subject = kitNeedsStepUp(next) ? O55.ownerResults.protectedContext(kitProject(S)) : (kitProject(S) ? { project: kitProject(S) } : null);
            if (!subject) { b['orErr_' + next] = 'host_unavailable'; S.save(); O55.ui.refresh(); return; }
            b['or_' + next] = O55.ownerResults.begin(KIT_CMD[next], subject);
          }
          b['orErr_' + next] = null;
          if (next === 'kitTest') b.kitBad = false;
          S.save();
          const phases = next === 'kit' ? [{ key: 'handoff', ms: 900 }]
            : next === 'kitTest' ? [{ key: 'handoff', ms: 600 }, { key: 'unlock', ms: 800 }, { key: 'scratch', ms: 600 }]
            : [{ key: 'policy', ms: 700 }];
          F.reset(S, 'backup:' + next);
          press();
          F.op(S, 'backup:' + next, KIT_CMD[next], phases, {
            payload: { project: kitProject(S), destination: b.dest }, sound: { done: false }, /* sounds when adopted (kitAdopt) */
            onDone: () => { kitAdopt(S, next); }
          });
          return;
        }
        const cmd = { signin: 'cmd.backup.destination.add', test: 'cmd.backup.destination.test' }[next];
        const phases = [{ key: next, ms: next === 'test' ? 1200 : 1800 }];
        if (next === 'signin' && b.dest === 'nas' && !nasReady(S)) {
          /* the same SSH steps as files on a NAS: its identity before trust, a key, one sign-in; then back here */
          S.sess.nas = { purpose: 'dest', method: 'ssh', device: O55.backup.nas(S).id, trusted: false, installed: false, key: null };
          S.save(); return O55.ui.go(O55.nas.entry(S));
        }
        if (next === 'signin' && ACCESSED(b.dest) && !O55.backup.accessTake(S, b.dest, acc(S))) { O55.sound.play('warn'); O55.ui.refresh(); return; } /* the secret field was empty */
        press();
        if (next === 'signin' && (b.dest === 'gdrive' || b.dest === 'onedrive')) O55.official.open(S, { name: O55.backup.label(S, b.dest), url: O55.fixtures.OFFICIAL.backup[b.dest] || null });
        F.op(S, 'backup:' + next, cmd, phases, {
          payload: { destination: b.dest, transport: b.dest === 'nas' ? O55.nas.transport(S) : b.dest, path: b.dest === 'nas' ? NAS_PATH : null, credential_ref: ACCESSED(b.dest) ? 'credential:backup:' + b.dest : null },
          sound: { done: false }, /* stepDone sounds the tick-off */
          onDone: () => { if (!done.includes(next)) done.push(next); b.state = done.length === STEPS.length ? 'done' : 'partial'; S.save(); O55.ui.refresh(); stepDone(S, done.length); }
        });
      },
      later(S) { S.sess.backup.state = 'later'; S.save(); O55.ui.go('ai'); },
      finish(S) { O55.ui.go('ai'); }
    },
    /* the access fields keep what is not secret, and only whether a secret was typed */
    bind: O55.backup.accessBinds((S) => [S.sess.backup.dest, acc(S)]),
    onBack: () => false
  });

  O55.review = { routeParams, beginsAs, filesAt, whereWork, shownDone };
})();
