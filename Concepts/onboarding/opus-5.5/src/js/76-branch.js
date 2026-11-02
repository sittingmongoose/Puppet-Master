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
  const where = (S) => (S.sess.ui && S.sess.ui.where) || 'this';
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
  const placeReady = (S) => { const r = S.sess.restore || {}; return r.source === 'kit' ? !!r.kit : ['cloud', 'nas', 's3'].includes(r.source) ? !!r.reachedFor : !!r.source; };
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
      case 'backup': return restoring(S) && S.sess.restore.source === 'nas';
      case 'dest': return attempt(S);
      default: return true;
    }
  }
  const method = (S) => (S.sess.nas && S.sess.nas.method) || 'ssh';
  const nasBy = (m) => (S) => nasFor(S) && method(S) === m;
  const RULES = {
    'ex-folder': (S) => began(S) === 'existing:folder',
    'online-service': (S) => source(S) || copy(S),
    'online-signin': (S) => { const si = S.sess.signin || {}; if (si.kind && si.kind !== 'forge') return !!S.sess.restore || attempt(S);
      return source(S) ? md(S).online_mode === 'existing' : copy(S) && md(S).online_mode === 'new'; },
    'online-details': (S) => copy(S) && md(S).online_mode === 'new' && resolves(S),
    'ex-repos': (S) => source(S) && resolves(S),
    'nas-find': nasFor,
    'nas-identity': nasBy('ssh'), 'nas-key': nasBy('ssh'), 'nas-signin': nasBy('ssh'), 'nas-install': nasBy('ssh'), 'nas-pmpair': nasBy('ssh'), 'nas-folder': nasBy('ssh'),
    'nas-smb': nasBy('smb'), 'nas-nfs': nasBy('nfs'), 'nas-mounted': nasBy('mounted'),
    'r-source': restoring, 'r-unlock': (S) => restoring(S) && placeReady(S), 'r-pick': (S) => restoring(S) && placeReady(S),
    'r-preview': (S) => restoring(S) && !!S.sess.restore.pick, 'r-done': restoring,
    'c-route': (S) => where(S) === 'connect', 'c-review': (S) => where(S) === 'connect', 'c-pair': (S) => where(S) === 'connect', 'c-ready': (S) => where(S) === 'connect',
    's-kind': (S) => where(S) === 'server', 's-wait': (S) => where(S) === 'server', 's-confirm': (S) => where(S) === 'server', 's-ready': (S) => where(S) === 'server',
    'creating': attempt, 'protect': attempt, 'ai': attempt, 'ai-all': attempt, 'ai-none': attempt, 'free': attempt, 'ready': attempt
  };
  function applies(id, S) {
    const rule = RULES[id];
    if (!rule || !S || !S.sess) return true;
    try { return !!rule(S); } catch (_) { return true; }
  }
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
    if (S.sess.nas && !nasFor(S)) {
      if ((S.sess.nas.purpose || 'source') === 'source' || S.sess.nas.purpose === 'storage') {
        S.sess.nas = null; dropOps(S, /^(mounted|smb|nfs):/); changed = true;
        if ((d.source_access_authorization_refs || []).length || (d.preflight_result_refs || []).some((r) => /^preflight:paired-source:/.test(r))) {
          O55.draft.set(d, { source_access_authorization_refs: keepRefs(d.source_access_authorization_refs, /^(ssh-key|pairing):/), preflight_result_refs: keepRefs(d.preflight_result_refs, /^preflight:paired-source:/) });
        }
      }
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
  O55.branch = { applies, reconcile, began, copy, source };
})();
