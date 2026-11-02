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
  /* how the Project begins: its Continue records it (69); Later and a seeded straight open read from the plan */
  function began(S) {
    const d = md(S), b = S.sess.ui && S.sess.ui.beganAs;
    if (d.project_mode === 'later') return 'later';
    if (b) return b;
    if (d.project_mode === 'existing_online') return 'existing:online';
    if (d.project_mode === 'existing_local') return d.project_transport === 'local' ? 'existing:folder' : 'existing:device';
    return S.sess.restore && S.sess.restore.scope === 'project' ? 'restore' : 'new';
  }
  const attempt = (S) => !!(S.sess.commit && S.sess.commit.state && S.sess.commit.state !== 'none');
  const restoring = (S) => { const r = S.sess.restore; return !!(r && r.scope) && (r.scope !== 'project' || began(S) === 'restore'); };
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
    'online-signin': (S) => { const si = S.sess.signin || {}; if (si.kind && si.kind !== 'forge') return restoring(S) || attempt(S);
      return source(S) ? md(S).online_mode === 'existing' : copy(S) && md(S).online_mode === 'new'; },
    'online-details': (S) => copy(S) && md(S).online_mode === 'new' && resolves(S),
    'ex-repos': (S) => source(S) && resolves(S),
    'nas-find': nasFor,
    'nas-identity': nasBy('ssh'), 'nas-key': nasBy('ssh'), 'nas-signin': nasBy('ssh'), 'nas-install': nasBy('ssh'), 'nas-pmpair': nasBy('ssh'), 'nas-folder': nasBy('ssh'),
    'nas-smb': nasBy('smb'), 'nas-nfs': nasBy('nfs'), 'nas-mounted': nasBy('mounted'),
    'r-source': restoring, 'r-unlock': restoring, 'r-pick': restoring, 'r-preview': restoring, 'r-done': restoring,
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
    if (!source(S) && d.online_mode === 'existing') {
      O55.draft.set(d, { online_mode: 'none', forge: 'none', forge_provider_variant: null, forge_instance_url: '', forge_instance_profile: null, forge_account_ref: '', forge_account_action: null, repository_ref: '', repository_name: '' });
      S.sess.online = Object.assign({}, S.sess.online, { forge: null, variant: null, unchosen: true, wanted: false }); changed = true;
    }
    if (!copy(S) && !source(S) && S.sess.online && (S.sess.online.forge || S.sess.online.variant)) { S.sess.online.forge = null; S.sess.online.variant = null; S.sess.online.unchosen = true; changed = true; }
    return changed;
  }
  O55.branch = { applies, reconcile, began, copy, source };
})();
