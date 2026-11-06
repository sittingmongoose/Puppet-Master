/* O55.branch — which steps the person's current answers lead through (canon FO-22; Sol's FO22-A2/A3 and Astra's AST-2..4
   at e9b704975a). Every step that is not on the main path says here, from the current answers alone (the plan's draft and
   the answers the session keeps: how the Project begins, which computer, whether Safe wants an online copy, the NAS's
   purpose and method, the restore, the attempt), whether it applies. Nothing is recorded at navigation time, so a history
   written by any build, a Review Edit or a straight jump is judged the same way.
   60-ui-core uses it: Back and the rail pass every step that does not apply, such a step is never drawn (what would show
   it shows the last step that does), and its actions, fields and hooks are refused, so no Continue can write from it.
   reconcile() clears, in one place, what a picker kept for an answer that no longer applies (its pick, its completed
   checks, the references they wrote), so choosing that kind again starts with nothing chosen. Settled work outside the
   plan stays: a sign-in already made, a key already installed, a host already trusted, a Server already set up. */
(function () {
  'use strict';
  const O55 = window.O55;
  const md = (S) => S.sess.drafts.main;
  /* the computer answer as committed (Continue on the Computer screen), never the card picked before it (lead's ruling
     1103040758 rule 3; Sol: Computer > This computer > Back left the Server's steps off the path). A session from before
     the answer was recorded reads it from the plan */
  const where = (S) => { const u = S.sess.ui || {}, d = md(S); if (u.whereAt) return u.whereAt;
    return d.server_mode === 'new_server' ? 'server' : d.server_mode === 'existing_server' || S.sess.active === 'connect' ? 'connect' : 'this'; };
  /* how the Project begins: the plan says (an existing online or local Project, a restore, later); while a restore is
     still being chosen the plan is not yet a restore, and the beginning's Continue has recorded it (69) */
  function began(S) {
    const d = md(S), b = S.sess.ui && S.sess.ui.beganAs;
    switch (d.project_mode) {
      case 'later': return 'later';
      case 'existing_online': return 'existing:online';
      case 'existing_local': return d.project_transport === 'local' ? 'existing:folder' : 'existing:device';
      case 'restore': return 'restore';
      default: return b === 'restore' || (!b && S.sess.restore && S.sess.restore.scope === 'project') ? 'restore' : 'new';
    }
  }
  const attempt = (S) => !!(S.sess.commit && S.sess.commit.state && S.sess.commit.state !== 'none');
  const restoring = (S) => { const r = S.sess.restore; return !!(r && r.scope) && (r.scope !== 'project' || began(S) === 'restore'); };
  /* the restore's place is ready for its backups to be listed: a kit chosen, or the drive, NAS or bucket reached (Muse MU-1:
     the backups of a place left are never offered) */
  /* (where the backup is: a kit names its place, as the restore flow reads it, O55.restore.placeOf; Muse delta minor 4) */
  const place = (S) => { const r = S.sess.restore || {}; try { return O55.restore && O55.restore.placeOf ? O55.restore.placeOf(S) : r.source; } catch (_) { return r.source; } };
  /* (a drive, NAS or bucket reached counts only for the place chosen now: another service's or device's reach does not,
     Muse delta minor 4) */
  const reachedHere = (S) => { const r = S.sess.restore; if (!r || !r.reachedFor) return false; try { return !O55.restore || !O55.restore.reachKey || r.reachedFor === O55.restore.reachKey(S); } catch (_) { return true; } };
  const placeReady = (S) => { const r = S.sess.restore || {}, pl = place(S); return pl === 'cloud' || pl === 'nas' ? reachedHere(S) : pl === 's3' ? !!r.reachedFor : r.source === 'kit' ? !!r.kit : !!r.source; };
  /* the online source of an existing Project; Safe's online copy: chosen (the plan's copy is new) or being chosen (Add one
     or Change pressed, not given up since: Not now, Skip the online copy, Later) */
  const source = (S) => began(S) === 'existing:online';
  const copy = (S) => !source(S) && (md(S).online_mode === 'new' || !!(S.sess.online && S.sess.online.wanted));
  const resolves = (S) => !O55.draft || !O55.draft.sourceIdentity || O55.draft.sourceIdentity(S).ok;
  /* the NAS: its purpose is a current answer, and its method picks the steps */
  function nasFor(S) {
    const n = S.sess.nas; if (!n) return false;
    switch (n.purpose || 'source') {
      case 'source': return began(S) === 'existing:device';
      case 'storage': return md(S).storage_mode === 'network_location';
      case 'backup': return restoring(S) && place(S) === 'nas';
      case 'dest': return attempt(S);
      default: return true;
    }
  }
  const method = (S) => (S.sess.nas && S.sess.nas.method) || 'ssh';
  const nasBy = (m) => (S) => nasFor(S) && method(S) === m;
  /* the SSH steps follow the current device's own progress: trusted before its key steps, its access verified (a key
     installed, or paired) before its folders (Astra AST-D1: another device chosen never inherits the first one's) */
  const nasN = (S) => S.sess.nas || {};
  const verified = (S) => !!(nasN(S).installed || nasN(S).paired);
  /* the way in to a device that runs Puppet Master is pairing, unless the person chose SSH instead (70's entry); its
     identity step is SSH's, so it applies only on the SSH way, and pairing only on the pairing way (reader-795-f: Back
     after the owned chain was rebuilt showed pairing for a NAS reached over SSH) */
  const byPm = (S) => { const n = nasN(S), d = (S.env.devices || []).find((x) => x.id === n.device); return !!(d && d.pm) && !n.useSsh; };
  /* (the key, sign-in and install steps are SSH's too: a device reached by pairing never has them, whatever a record says
     of its trust; Muse's P2 note) */
  const sshAt = (step) => (S) => nasBy('ssh')(S) && !!nasN(S).device && (step === 'identity' ? !byPm(S) : step === 'pmpair' ? byPm(S) : step === 'folder' ? verified(S) : !byPm(S) && !!nasN(S).trusted);
  /* a Project being set up now: Later sets none up, so its name, settings and safety steps are not on the way (final-onb
     FO22-Later: Back after Later walked the abandoned Project's Safe and Name) */
  const project = (S) => began(S) !== 'later';
  const RULES = {
    'name': project, 'like': project, 'safe': project,
    'ex-folder': (S) => began(S) === 'existing:folder',
    'online-service': (S) => source(S) || copy(S),
    'online-signin': (S) => { const si = S.sess.signin || {}; if (si.kind && si.kind !== 'forge') return !!S.sess.restore || attempt(S);
      return source(S) ? md(S).online_mode === 'existing' : copy(S) && md(S).online_mode === 'new'; },
    'online-details': (S) => copy(S) && md(S).online_mode === 'new' && resolves(S),
    'ex-repos': (S) => source(S) && resolves(S),
    'nas-find': nasFor,
    'nas-identity': sshAt('identity'), 'nas-key': sshAt('key'), 'nas-signin': sshAt('signin'), 'nas-install': sshAt('install'), 'nas-pmpair': sshAt('pmpair'), 'nas-folder': sshAt('folder'),
    'nas-smb': nasBy('smb'), 'nas-nfs': nasBy('nfs'), 'nas-mounted': nasBy('mounted'),
    'r-source': restoring, 'r-unlock': (S) => restoring(S) && placeReady(S), 'r-pick': (S) => restoring(S) && placeReady(S),
    'r-preview': (S) => restoring(S) && !!S.sess.restore.pick, 'r-done': restoring,
    'c-route': (S) => where(S) === 'connect', 'c-review': (S) => where(S) === 'connect', 'c-pair': (S) => where(S) === 'connect', 'c-ready': (S) => where(S) === 'connect',
    's-kind': (S) => where(S) === 'server', 's-wait': (S) => where(S) === 'server', 's-confirm': (S) => where(S) === 'server', 's-ready': (S) => where(S) === 'server',
    /* access from away is asked, and set up, only for a new Server: This computer or an existing Server has nothing to reach
       from away (Sol's Basic Light 6sr: Back reached the old Server's away step after Computer › This computer) */
    'away': (S) => md(S).server_mode === 'new_server',
    'away-setup': (S) => !!S.sess.awaySetup && md(S).server_mode === 'new_server',
    'creating': attempt, 'protect': attempt, 'ai': attempt, 'ai-all': attempt, 'ai-none': attempt, 'free': attempt, 'ready': attempt
  };
  function applies(id, S) {
    const rule = RULES[id];
    if (!rule || !S || !S.sess) return true;
    try { return !!rule(S); } catch (_) { return true; }
  }
  /* the step a step sits inside: each screen owns the chain of steps its answer opens, and Back from after them walks
     them, in order, before the step ahead of their owner; the owner reached again after only its own chain does not cut
     them from the path (lead's Back ruling 1103011909; Astra at 41d: Back from Review skipped a files place's NAS steps).
     Safe owns its online copy's steps; Name owns the NAS steps of a files place on the NAS; Begins as owns a source's
     steps (a folder, an online repository, a NAS source) and a Project restore's; Computer owns a Server's setup, a
     connection's steps, and a whole-computer or Server restore's */
  function within(id, S) {
    if (!S || !S.sess) return null;
    try {
      const r = S.sess.restore, rOwner = () => (r && r.scope && r.scope !== 'project' ? 'where' : 'begin');
      if (/^nas-/.test(id)) { const p = (S.sess.nas && S.sess.nas.purpose) || 'source'; return p === 'storage' ? 'name' : p === 'source' ? 'begin' : p === 'backup' ? rOwner() : null; }
      if (/^(s|c)-/.test(id)) return 'where';
      if (/^r-/.test(id)) return rOwner();
      if (id === 'ex-folder' || id === 'ex-repos') return 'begin';
      if (id === 'online-service' || id === 'online-details') return copy(S) ? 'safe' : source(S) ? 'begin' : null;
      if (id === 'online-signin') { const si = S.sess.signin || {}; if (si.kind && si.kind !== 'forge') return restoring(S) ? rOwner() : null; return copy(S) ? 'safe' : source(S) ? 'begin' : null; }
    } catch (_) {}
    return null;
  }
  /* a chain that hands back to its owner (Safe's online copy, Name's files place on a NAS): entering it is not the owner's
     Continue, so a step Review's Edit opened is still that Edit's until the owner's own Continue (60-ui-core go) */
  const hub = (id, S) => { const w = within(id, S); return w === 'safe' || w === 'name' ? w : null; };
  /* what a picker kept for an answer that no longer applies goes: run on every screen change and on resume */
  const F = () => O55.flow;
  const dropOps = (S, re) => Object.keys(S.sess.ops || {}).forEach((k) => { if (re.test(k)) F().reset(S, k); });
  const keepRefs = (list, re) => (list || []).filter((r) => !re.test(r));
  function reconcile(S) {
    if (!S || !S.sess || !S.sess.drafts) return false;
    const d = md(S), b = began(S); let changed = false;
    if (b !== 'existing:folder') {
      if (S.sess.folder || S.sess.folderInfo) { S.sess.folder = null; S.sess.folderInfo = null; changed = true; }
      if (Object.keys(S.sess.ops || {}).some((k) => /^folder:/.test(k))) { dropOps(S, /^folder:/); changed = true; }
      if ((d.preflight_result_refs || []).some((r) => /^preflight:folder:/.test(r))) { O55.draft.set(d, { preflight_result_refs: keepRefs(d.preflight_result_refs, /^preflight:folder:/) }); changed = true; }
    }
    if (S.sess.nas && O55.nas && O55.nas.remember) O55.nas.remember(S);
    /* The plan's NAS references describe the device, method and source chosen now, exactly (Astra AST-D1, Sol FO22-N2):
       an SSH profile's access and preflight only while that device's access is verified over SSH, a pairing's only
       while paired, the source (or files place) only while it names the current profile, pairing, share or volume.
       References for a device, method or source replaced go; settled keys and hosts stay outside the plan (70). */
    const nn = S.sess.nas, np = nn && (nn.purpose || 'source');
    if (nn && (np === 'source' ? b === 'existing:device' : np === 'storage')) {
      const m = method(S), paired = !!(nn.paired || nn.viaPm), p = nn.profile || '', ok = verified(S);
      const dv = (S.env.devices || []).find((x) => x.id === nn.device), slug = dv && O55.util ? O55.util.slug(dv.name) : '';
      const sh = nn.share === 'manual' ? nn.manualShare : (S.env.shares || []).find((x) => x.id === nn.share), shp = sh ? String(sh.path || '').replace(/^\/\//, '') : '';
      const okAuth = (r) => (/^ssh-key:/.test(r) ? m === 'ssh' && !paired && ok && !!p && r.indexOf('ssh-key:' + p + ':') === 0 : /^pairing:/.test(r) ? paired && r.indexOf('pairing:' + slug + ':') === 0 : true);
      const okPre = (r) => (/^preflight:ssh:/.test(r) ? m === 'ssh' && !paired && ok && r === 'preflight:ssh:' + p : /^preflight:paired-source:/.test(r) ? paired && r === 'preflight:paired-source:' + slug : true);
      const field = np === 'storage' ? 'storage_location' : 'project_source_ref', ref = d[field] || '';
      const okRef = !ref || (paired ? ref.indexOf('pm:') === 0 : m === 'ssh' ? ok && !!p && ref.indexOf('ssh:' + p) === 0
        : m === 'mounted' ? ref === 'mounted:' + nn.volume : ref.indexOf(m + ':') === 0 && !!shp && ref.indexOf(shp) >= 0);
      const auth = d.source_access_authorization_refs || [], pre = d.preflight_result_refs || [], na = auth.filter(okAuth), npf = pre.filter(okPre);
      if (na.length !== auth.length || npf.length !== pre.length || !okRef) { O55.draft.set(d, Object.assign({ source_access_authorization_refs: na, preflight_result_refs: npf }, okRef ? {} : { [field]: '' })); changed = true; }
      if (m === 'ssh' && !paired && !ok && (nn.at || nn.profile)) { delete nn.at; delete nn.folderLabel; delete nn.profile; changed = true; }
    }
    if (S.sess.nas && !nasFor(S)) {
      if ((S.sess.nas.purpose || 'source') === 'source' || S.sess.nas.purpose === 'storage') {
        S.sess.nas = null; dropOps(S, /^(mounted|smb|nfs):/); changed = true;
        if ((d.source_access_authorization_refs || []).length || (d.preflight_result_refs || []).some((r) => /^preflight:paired-source:/.test(r))) {
          O55.draft.set(d, { source_access_authorization_refs: keepRefs(d.source_access_authorization_refs, /^(ssh-key|pairing):/), preflight_result_refs: keepRefs(d.preflight_result_refs, /^preflight:paired-source:/) });
        }
      }
    }
    /* the files place on a NAS, and the NAS access behind any answer, describe the current answers as the source does: a
       files place no longer on the NAS goes, and the access and preflight of a NAS no current answer uses go with it (Astra
       AST-D6: This computer chosen for the files kept the NAS place and its key) */
    if (d.storage_mode !== 'network_location' && (d.storage_location || d.storage_transport !== 'mounted')) { O55.draft.set(d, { storage_location: '', storage_transport: 'mounted' }); changed = true; }
    const nasUsed = b === 'existing:device' || d.storage_mode === 'network_location' || (restoring(S) && place(S) === 'nas') || !!(S.sess.nas && S.sess.nas.purpose === 'dest' && attempt(S));
    if (!nasUsed && ((d.source_access_authorization_refs || []).some((r) => /^(ssh-key|pairing):/.test(r)) || (d.preflight_result_refs || []).some((r) => /^preflight:(ssh|paired-source):/.test(r)))) {
      O55.draft.set(d, { source_access_authorization_refs: keepRefs(d.source_access_authorization_refs, /^(ssh-key|pairing):/), preflight_result_refs: keepRefs(d.preflight_result_refs, /^preflight:(ssh|paired-source):/) }); changed = true;
    }
    if (S.sess.restore && S.sess.restore.scope === 'project' && b !== 'restore') { S.sess.restore = null; changed = true; }
    /* a Project restore whose backup is no longer the one picked (its source or place changed, or the restore was started
       again): the plan's backup, its transport and the backup place the restore suggested go, and Review asks for a pick */
    if (b === 'restore' && d.backup_source_ref && !(S.sess.restore && S.sess.restore.pick)) {
      O55.draft.set(d, Object.assign({ backup_source_ref: '', backup_transport: 'local' }, S.sess.ui && S.sess.ui.nameTouched ? {} : { project_name: '' })); /* (nor its borrowed name) */
      if (S.sess.backup && S.sess.backup.fromRestore) { S.sess.backup.dest = null; S.sess.backup.fromRestore = false; }
      changed = true;
    }
    if (!source(S) && d.online_mode === 'existing') {
      O55.draft.set(d, { online_mode: 'none', forge: 'none', forge_provider_variant: null, forge_instance_url: '', forge_instance_profile: null, forge_account_ref: '', forge_account_action: null, repository_ref: '', repository_name: '' });
      S.sess.online = Object.assign({}, S.sess.online, { forge: null, variant: null, unchosen: true, wanted: false }); changed = true;
    }
    if (!copy(S) && !source(S) && S.sess.online && (S.sess.online.forge || S.sess.online.variant)) { S.sess.online.forge = null; S.sess.online.variant = null; S.sess.online.unchosen = true; changed = true; }
    return changed;
  }
  O55.branch = { applies, within, hub, reconcile, began, copy, source };
})();
