/* O55.owners — the command table and fixture owner operations. Every control dispatches exactly one command id; each
   row carries the owner phase in which it may run. Before the reviewed commit only bounded read-only preflight and
   selected-source sign-in may dispatch (PWIZ-021); Server setup runs only after its own confirmation; everything else
   runs after the Create/Add/Restore click. Refused dispatches are logged, never silently executed.
   Operations report truthful phases (no percentages), carry an idempotency key, and return a receipt. */
(function () {
  'use strict';
  const O55 = window.O55;
  const M = () => O55.motion;

  const TABLE = {
    /* bounded read-only preflight */
    'cmd.server.discovery.refresh': { owner: 'Server', phase: 'read_only_preflight' },
    'cmd.project.refresh': { owner: 'Project', phase: 'read_only_preflight' },
    'cmd.project.source_location.test': { owner: 'Project', phase: 'read_only_preflight' },
    'cmd.source_control.backend.detect': { owner: 'SourceControl', phase: 'read_only_preflight' },
    'cmd.forge.repository.list': { owner: 'Forge', phase: 'read_only_preflight' },
    'cmd.settings.transaction.preview': { owner: 'Settings', phase: 'read_only_preflight' },
    'cmd.ssh_connection.keys.discover': { owner: 'SSH', phase: 'read_only_preflight', canonical: false },
    'cmd.ssh_connection.device.probe': { owner: 'SSH', phase: 'read_only_preflight', canonical: false },
    'cmd.integration.connection.detect': { owner: 'Providers', phase: 'postcommit_provider', canonical: false },
    /* selected-source authentication (just in time; never broad provider work) */
    'cmd.auth_profile.sign_in': { owner: 'Auth', phase: 'selected_source_auth' },
    'cmd.auth_profile.open_official_page': { owner: 'Auth', phase: 'selected_source_auth' },
    'cmd.ssh_connection.key.install': { owner: 'SSH', phase: 'selected_source_auth', canonical: false },
    'cmd.storage.share.mount_check': { owner: 'Storage', phase: 'selected_source_auth', canonical: false },
    /* Server preflow (own confirmation). Claim, durable bootstrap and pairing are separate owner results
       (Server_System SRV-004/SRV-005 §4.2); a claim never confers trust by itself. */
    'cmd.server.claim': { owner: 'Server', phase: 'server_setup' },
    'cmd.server.bootstrap.start': { owner: 'Server', phase: 'server_setup' },
    /* also consented selected-source pairing (PWIZ-029): the person's Pair click on a device that runs Puppet Master */
    'cmd.client.pair.start': { owner: 'Server', phase: 'server_setup', selectedSource: true },
    'cmd.client.pair.approve': { owner: 'Server', phase: 'server_setup', selectedSource: true },
    'cmd.client.pair.reject': { owner: 'Server', phase: 'server_setup', selectedSource: true },
    'cmd.client.pair.cancel': { owner: 'Server', phase: 'server_setup', selectedSource: true },
    'cmd.restore.preview': { owner: 'Backup', phase: 'read_only_preflight' },
    'cmd.restore.apply': { owner: 'Backup', phase: 'restore_preflow', canonical: false },
    /* the one reviewed commit and its child owners */
    'cmd.project.new_local': { owner: 'Project', phase: 'project_commit' },
    // Contracted owner routes; this HTML has no native implementation.
    'cmd.project.new_github_repo': { owner: 'Project', phase: 'project_commit', ownerResultOnly: true },
    'cmd.project.resume_creation': { owner: 'Project', phase: 'project_commit', ownerResultOnly: true },
    'cmd.forge.repository.open_in_browser': { owner: 'Forge', phase: 'project_commit', ownerResultOnly: true },
    'cmd.forge.repository.delete': { owner: 'Forge', phase: 'project_commit', ownerResultOnly: true },
    'cmd.project.add_existing': { owner: 'Project', phase: 'project_commit' },
    'cmd.source_control.backend.select': { owner: 'SourceControl', phase: 'project_commit' },
    'cmd.source_control.repository.bind': { owner: 'Forge', phase: 'project_commit' },
    'cmd.settings.transaction.apply': { owner: 'Settings', phase: 'project_commit' },
    'cmd.remote_access.tailscale.setup.start': { owner: 'RemoteAccess', phase: 'project_commit' },
    'cmd.remote_access.proxy.generate': { owner: 'RemoteAccess', phase: 'project_commit' },
    'cmd.remote_access.remote_link.setup': { owner: 'RemoteAccess', phase: 'project_commit' },
    /* after commit */
    'cmd.backup.destination.add': { owner: 'Backup', phase: 'postcommit_backup' },
    'cmd.backup.destination.test': { owner: 'Backup', phase: 'postcommit_backup' },
    'cmd.backup.recovery_key.export': { owner: 'Backup', phase: 'postcommit_backup' },
    'cmd.backup.recovery_key.test': { owner: 'Backup', phase: 'postcommit_backup' },
    'cmd.backup.policy.update': { owner: 'Backup', phase: 'postcommit_backup' },
    'cmd.tool_product.install': { owner: 'Providers', phase: 'postcommit_provider', canonical: false },
    'cmd.integration.connection.add': { owner: 'Providers', phase: 'postcommit_provider' },
    'cmd.integration.connection.test': { owner: 'Providers', phase: 'postcommit_provider' },
    'cmd.free_models.route.enable': { owner: 'Models', phase: 'postcommit_free_models', canonical: false },
    /* shell and tour (local UI) */
    'cmd.panel.switch': { owner: 'Shell', phase: 'tour_local' }, 'cmd.persona.select': { owner: 'Chat', phase: 'tour_local' },
    'cmd.chat.send': { owner: 'Chat', phase: 'tour_local' }, 'cmd.chat.eli5.set': { owner: 'Chat', phase: 'tour_local' },
    'cmd.chat.eli5.explain_reply': { owner: 'Chat', phase: 'tour_local' },
    'cmd.widget.add': { owner: 'Dashboard', phase: 'tour_local' }, 'cmd.workspace.layout.restore': { owner: 'Workspace', phase: 'tour_local' }
  };
  const PRECOMMIT = new Set(['read_only_preflight', 'selected_source_auth']);

  const log = [];
  const listeners = new Set();
  const emit = (ev) => { listeners.forEach((fn) => { try { fn(ev); } catch (_) {} }); };

  function allowed(id, ctx) {
    const row = TABLE[id]; if (!row) return { ok: false, reason: 'unknown_command' };
    const s = ctx || {};
    if (row.phase === 'tour_local' || PRECOMMIT.has(row.phase)) return { ok: true };
    if (row.phase === 'server_setup') return s.serverConfirmed || (row.selectedSource && s.sourcePairConfirmed) ? { ok: true } : { ok: false, reason: 'needs_server_confirmation' };
    if (row.phase === 'restore_preflow') return s.restoreConfirmed ? { ok: true } : { ok: false, reason: 'needs_restore_confirmation' };
    if (row.phase === 'project_commit') return s.reviewConfirmed ? { ok: true } : { ok: false, reason: 'needs_review_confirmation' };
    if (row.phase.startsWith('postcommit')) return s.committed ? { ok: true } : { ok: false, reason: 'needs_committed_project' };
    return { ok: false, reason: 'unknown_phase' };
  }

  /* dispatch(id, payload, ctx) -> Promise<result>. `run` is the fixture implementation for that command. */
  async function dispatch(id, payload, ctx, run) {
    const row = TABLE[id] || { owner: '?', phase: '?' };
    const gate = allowed(id, ctx);
    const entry = { t: Math.round(performance.now()), id, owner: row.owner, phase: row.phase, canonical: row.canonical !== false, ok: gate.ok, reason: gate.reason || null };
    log.push(entry); if (log.length > 500) log.shift();
    if (!gate.ok) { emit({ type: 'refused', entry }); return { ok: false, refused: true, reason: gate.reason }; }
    // Never turn a fixture callback or default return into a contracted owner effect.
    // Deliberately injected owner-result fixtures use the separate adoption seam below.
    if (row.ownerResultOnly) { entry.ok = false; entry.reason = 'handler_unavailable'; emit({ type: 'refused', entry }); return { ok: false, refused: true, reason: entry.reason }; }
    emit({ type: 'dispatch', entry });
    const result = run ? await run(payload || {}) : { ok: true };
    entry.result = result && result.ok === false ? 'failed' : 'ok';
    if (result && result.receipt) entry.receipt = result.receipt;
    return result;
  }

  /* Phased owner operation: phases = [{key, ms, fail?:()=>code}] ; onPhase(state) is called on each change.
     Returns {ok, failedAt?, code?, receipt}. Idempotent: the same key resumes after the last finished phase. */
  const OPS = {};
  async function operation(key, phases, onPhase) {
    const op = OPS[key] || (OPS[key] = { key, done: [], state: 'running', receipt: 'receipt:' + key.replace(/[^A-Za-z0-9._:/#-]/g, '-') });
    op.state = 'running'; op.failedAt = null; op.code = null;
    for (const ph of phases) {
      if (op.done.includes(ph.key)) continue;
      op.current = ph.key; onPhase && onPhase(snapshot(op, phases));
      await M().delay(ph.ms || 700);
      /* starting onboarding over cancels what the old run left running, at the next phase boundary */
      if (op.cancelled) return { ok: false, cancelled: true, receipt: op.receipt };
      const code = ph.fail ? ph.fail() : null;
      if (code) { op.state = 'failed'; op.failedAt = ph.key; op.code = code; op.current = null; onPhase && onPhase(snapshot(op, phases)); return { ok: false, failedAt: ph.key, code, receipt: op.receipt }; }
      op.done.push(ph.key);
    }
    op.state = 'done'; op.current = null; onPhase && onPhase(snapshot(op, phases));
    return { ok: true, receipt: op.receipt };
  }
  function snapshot(op, phases) {
    return { key: op.key, state: op.state, current: op.current, failedAt: op.failedAt, code: op.code,
      phases: phases.map((p) => ({ key: p.key, status: op.done.includes(p.key) ? 'done' : op.current === p.key ? 'active' : op.failedAt === p.key ? 'failed' : 'waiting' })) };
  }
  function opState(key) { return OPS[key] || null; }
  /* stop one operation at its next phase boundary (a pairing the person turned away from) */
  function cancelOp(key) { const o = OPS[key]; if (o) { o.cancelled = true; delete OPS[key]; } }
  function resetOps() { Object.keys(OPS).forEach((k) => { OPS[k].cancelled = true; delete OPS[k]; }); }

  /* Explicit owner-result adapter seam (Server/Kit, SRV-004/SRV-005 §4.2, BRS-012/BRS-017).
     Default browser without a host cannot mint success: adopt() rejects unless a real host
     is present or a deliberate test-only injected fixture matches. Timers/transport never
     confer completion; only an adopted owner-shaped result does. Matching covers operation,
     selected server/client/candidate/project, current generation, request nonce, owner outcome,
     and a separately evidenced postcondition. Stale/wrong-target/duplicate/replayed results
     are rejected. Reusable by Server and Kit surfaces (Settings reuses window.O55.ownerResults). */
  const ownerResults = (() => {
    const adoptedIds = {};
    const fixtures = {};
    let seq = 0;
    function hostAvailable() {
      try { if (typeof window !== 'undefined' && window.__O55_OWNER_HOST__) return true; } catch (_) {}
      return false;
    }
    function begin(operation, sel) {
      sel = sel || {};
      seq += 1;
      return { id: 'orq:' + Date.now().toString(36) + ':' + seq + ':' + Math.floor(Math.random() * 1e6),
        operation: operation, server: sel.server != null ? sel.server : null,
        client: sel.client != null ? sel.client : null, candidate: sel.candidate != null ? sel.candidate : null,
        project: sel.project != null ? sel.project : null,
        generation: sel.generation != null ? sel.generation : null, run_id: sel.run_id || null,
        recovery_set_id: sel.recovery_set_id || null, recovery_generation: sel.recovery_generation != null ? sel.recovery_generation : null,
        nonce: sel.nonce || ('n' + seq + '-' + Math.floor(Math.random() * 1e9)), at: Date.now() };
    }
    /* Test-only injection: stores an owner-shaped fixture for one request id. UI never calls this. */
    function inject(res) {
      if (!res || !res.requestId) return false;
      res.fixture = true; res.injected = true;
      fixtures[res.requestId] = res;
      return true;
    }
    function take(requestId) { return (requestId && fixtures[requestId]) || null; }
    function adopt(req, res, cur) {
      cur = cur || {};
      if (!req || !res) return { ok: false, reason: 'pending_no_result' };
      if (res.fixture && !res.injected) return { ok: false, reason: 'fixture_not_injected' };
      if (!hostAvailable() && !(res.fixture && res.injected)) return { ok: false, reason: 'host_unavailable' };
      if (typeof res.id !== 'string' || !res.id.trim()) return { ok: false, reason: 'result_identity_missing' };
      if (res.id && adoptedIds[res.id]) return { ok: false, reason: 'duplicate_replay' };
      if (res.operation !== req.operation) return { ok: false, reason: 'wrong_operation' };
      if (req.server != null && res.server !== req.server) return { ok: false, reason: 'wrong_target' };
      if (req.client != null && res.client !== req.client) return { ok: false, reason: 'wrong_target' };
      if (req.candidate != null && res.candidate !== req.candidate) return { ok: false, reason: 'wrong_target' };
      if (req.project != null && res.project !== req.project) return { ok: false, reason: 'wrong_target' };
      if (req.generation != null && res.generation !== req.generation) return { ok: false, reason: 'stale_generation' };
      if (cur.generation != null && res.generation !== cur.generation) return { ok: false, reason: 'stale_generation' };
      if (req.run_id != null && res.run_id !== req.run_id) return { ok: false, reason: 'wrong_pairing_run' };
      if (res.nonce !== req.nonce || res.requestId !== req.id) return { ok: false, reason: 'stale_nonce' };
      if (res.outcome !== 'ok' && res.outcome !== 'verified') return { ok: false, reason: String(res.outcome || 'not_ok') };
      const pc = res.postcondition;
      if (!pc || pc.ok !== true || !pc.evidence) return { ok: false, reason: 'postcondition_missing' };
      if (res.id && pc.evidence === res.id) return { ok: false, reason: 'postcondition_not_separate' };
      if (req.operation === 'cmd.client.pair.start') {
        const run = res.pairing_run, words = res.identity && res.identity.words;
        if (!run || typeof run.id !== 'string' || !run.id || run.state !== 'waiting' ||
            run.server !== req.server || run.candidate !== req.candidate || run.generation !== req.generation ||
            !(Number(run.expires_at) > Date.now()) || typeof words !== 'string' || !words.trim())
          return { ok: false, reason: 'waiting_pairing_identity_missing' };
      }
      if (req.operation === 'cmd.client.pair.approve') {
        const trust = res.trust;
        if (!req.run_id || !trust || typeof trust.id !== 'string' || !trust.id.trim() ||
            trust.server !== req.server || trust.client !== req.client || trust.candidate !== req.candidate ||
            trust.run_id !== req.run_id) return { ok: false, reason: 'trust_record_missing' };
      }
      if (req.operation.startsWith('cmd.backup.recovery_key.')) {
        const proof = res.stepup, now = Date.now();
        if (!req.client || !req.server || !req.project || !req.recovery_set_id || req.recovery_generation == null ||
            res.recovery_set_id !== req.recovery_set_id || res.recovery_generation !== req.recovery_generation || !proof || proof.outcome !== 'verified' ||
            proof.request_id !== req.id || proof.nonce !== req.nonce || proof.client !== req.client ||
            proof.server !== req.server || proof.project !== req.project ||
            proof.recovery_set_id !== req.recovery_set_id || proof.recovery_generation !== req.recovery_generation || proof.audience !== 'initiating_human_client' ||
            proof.one_time !== true || typeof proof.evidence_ref !== 'string' || !proof.evidence_ref ||
            !Number.isFinite(proof.issued_at) || !Number.isFinite(proof.expires_at) ||
            proof.issued_at > now || proof.issued_at < req.at || proof.expires_at <= now ||
            proof.expires_at - proof.issued_at > 300000) return { ok: false, reason: 'current_stepup_required' };
      }
      if (res.id) adoptedIds[res.id] = true;
      return { ok: true };
    }
    function reset() { Object.keys(adoptedIds).forEach((k) => { delete adoptedIds[k]; }); Object.keys(fixtures).forEach((k) => { delete fixtures[k]; }); seq = 0; }
    function protectedContext(project) {
      const c = window.__O55_OWNER_CONTEXT__;
      if (!c || c.project !== project || !c.client || !c.server || !c.recovery_set_id || !Number.isInteger(c.recovery_generation)) return null;
      return { project, client: c.client, server: c.server, recovery_set_id: c.recovery_set_id, recovery_generation: c.recovery_generation };
    }
    return { begin, inject, take, adopt, reset, hostAvailable, protectedContext };
  })();

  /* Ephemeral memory-only store for pairing invite codes and candidate identity words. Never persisted:
     nothing here is written to the O55 session, localStorage, DOM storage, or logs. A reload loses the
     code/words by design; the UI then asks for a new code/request instead of claiming durability. */
  const ephemeral = (() => {
    const invites = {}, words = {};
    return {
      setInvite: (gen, code) => { invites[String(gen)] = String(code || ''); },
      getInvite: (gen) => (gen != null && invites[String(gen)]) || '',
      clearInvite: (gen) => { delete invites[String(gen)]; },
      setWords: (id, w) => { words[String(id)] = String(w || ''); },
      getWords: (id) => words[String(id)] || '',
      clearWords: (id) => { delete words[String(id)]; },
      reset: () => { Object.keys(invites).forEach((k) => { delete invites[k]; }); Object.keys(words).forEach((k) => { delete words[k]; }); }
    };
  })();

  O55.owners = { TABLE, log, dispatch, operation, opState, cancelOp, resetOps, allowed, on(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  O55.ownerResults = ownerResults;
  O55.ephemeral = ephemeral;
})();
