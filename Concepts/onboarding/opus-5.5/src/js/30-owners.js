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
    /* Server preflow (own confirmation) */
    'cmd.server.claim': { owner: 'Server', phase: 'server_setup' },
    'cmd.client.pair.start': { owner: 'Server', phase: 'server_setup' },
    'cmd.restore.preview': { owner: 'Backup', phase: 'read_only_preflight' },
    'cmd.restore.apply': { owner: 'Backup', phase: 'restore_preflow', canonical: false },
    /* the one reviewed commit and its child owners */
    'cmd.project.new_local': { owner: 'Project', phase: 'project_commit' },
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
    if (row.phase === 'server_setup') return s.serverConfirmed ? { ok: true } : { ok: false, reason: 'needs_server_confirmation' };
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
  function resetOps() { Object.keys(OPS).forEach((k) => { OPS[k].cancelled = true; delete OPS[k]; }); }

  O55.owners = { TABLE, log, dispatch, operation, opState, resetOps, allowed, on(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
})();
