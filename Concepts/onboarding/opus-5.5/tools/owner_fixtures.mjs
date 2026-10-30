/* Deliberate test-only owner results for the September 26 consumer contracts. Nothing installs a native
 * handler or supplies automatic success: each scenario first observes the pending gate, then injects
 * a result bound to the current request. These fixtures prove browser adoption, not native authority. */
import { createHash } from 'node:crypto';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export async function injectOwnerResult(d, section, key, overrides = {}) {
  const { req, draft, projectId } = await d.page.evaluate((section, key) => {
    const S = window.O55.S;
    return { req: S.sess[section][key], draft: S.sess.drafts.main, projectId: S.sess.commit.fixtureProjectId };
  }, section, key);
  if (!req) throw new Error(`owner fixture needs ${section}.${key}`);
  const ref = 'fixture:' + req.id;
  const res = { ...req, id: ref + ':result', requestId: req.id, outcome: 'ok',
    postcondition: { ok: true, evidence: ref + ':postcondition' } };
  if (req.operation === 'cmd.client.pair.start') {
    res.pairing_run = { id: ref + ':pairing-run', state: 'waiting', server: req.server,
      candidate: req.candidate, generation: req.generation, expires_at: Date.now() + 120000 };
    res.identity = { words: 'river candle orbit' };
  } else if (req.operation === 'cmd.client.pair.approve') {
    res.trust = { id: ref + ':trust', server: req.server, client: req.client,
      candidate: req.candidate, run_id: req.run_id };
  } else if (req.operation === 'cmd.project.new_github_repo') {
    const failed = !!overrides.failure_reason;
    Object.assign(res, { remote_effect: failed ? 'failed_before_effect' : 'verified_created',
      recovery_id: ref + ':recovery', reviewed_setup_binding: {
        project_draft_ref: draft.project_draft_ref, project_draft_revision: draft.project_draft_revision },
      terminal_result_ref: ref + ':terminal', terminal_result_sha256: digest({ request: req, failed }),
      composition_revision: 1, composition_sha256: digest({ request: req, composition: 1 }),
      settled_effects: {} });
    if (!failed) {
      Object.assign(res, { accepted: true, listed_project_id: projectId,
        forge_create_result_ref: ref + ':forge-result', forge_create_receipt_ref: ref + ':forge-receipt',
        repository_binding: { provider: 'github', normalized_host: 'github.com',
          account_id: 'fixture:account', provider_repository_id: ref + ':repository' } });
      for (const effect of ['remote_repository_create', 'source_preparation', 'clone_connect', 'history_init',
        'settings_rebind_apply', 'registry_publication']) {
        res.settled_effects[effect] = effect === 'remote_repository_create'
          ? { result_ref: res.forge_create_result_ref, receipt_ref: res.forge_create_receipt_ref }
          : { result_ref: ref + ':' + effect + ':result', receipt_ref: ref + ':' + effect + ':receipt' };
      }
    }
  } else if (req.operation.startsWith('cmd.backup.recovery_key.')) {
    const now = Date.now();
    res.stepup = { outcome: 'verified', request_id: req.id, nonce: req.nonce, client: req.client,
      server: req.server, project: req.project, recovery_set_id: req.recovery_set_id,
      recovery_generation: req.recovery_generation, audience: 'initiating_human_client', one_time: true,
      evidence_ref: ref + ':stepup', issued_at: now, expires_at: now + 60000 };
    Object.assign(res.postcondition, req.operation.endsWith('.export')
      ? { delivery: 'verified', savedAck: true } : { unlock: 'verified', scratch: 'verified' });
  } else if (req.operation === 'cmd.backup.policy.update') res.postcondition.policy = 'on';
  Object.assign(res, overrides);
  await d.page.evaluate(res => window.O55.ownerResults.inject(res), res);
  d.log.push({ fixture: req.operation, requestId: req.id });
  return res;
}

export async function assertPublishedProject(d, A) {
  const p = await d.state(() => {
    const cm = window.O55.S.sess.commit;
    const rows = [...document.querySelectorAll('#projectMenu [data-project]')].filter(e => e.dataset.project === cm.projectId);
    return { id: cm.projectId, count: rows.length, selected: rows.length === 1 && rows[0].classList.contains('is-selected') };
  });
  A.ok(!!p.id, 'terminal commit supplies the Project identity');
  A.eq(p.count, 1, 'exactly one row for the published Project');
  A.ok(p.selected, 'published Project selected in the title bar');
  return p.id;
}

/* Claim, bootstrap and a waiting pairing result confer no trust. The person must confirm the identity
 * by real input, then an independently supplied approval result must carry the matching trust record. */
export async function finishServerSetup(d, A) {
  const wait = (fn, what) => d.until(fn, { what, timeout: 8000 });
  await wait(() => window.O55.S.sess.server.orClaimErr === 'pending_no_result', 'claim awaiting owner');
  A.ok(await d.state(() => !window.O55.S.sess.server.claimed && !window.O55.S.sess.drafts.main.server_trust_confirmed), 'claim transport alone grants no trust');
  await injectOwnerResult(d, 'server', 'orClaimReq', { server: 'fixture:wrong-server' }); await d.act('retry');
  A.eq(await d.state(() => window.O55.S.sess.server.orClaimErr), 'wrong_target', 'wrong Server claim refused');
  A.ok(await d.state(() => !window.O55.S.sess.server.orBootReq), 'refused claim starts no bootstrap');
  await injectOwnerResult(d, 'server', 'orClaimReq'); await d.act('retry');
  await wait(() => window.O55.S.sess.server.orBootErr === 'pending_no_result', 'bootstrap awaiting owner');
  A.ok(await d.state(() => !window.O55.S.sess.server.claimed), 'adopted claim alone grants no trust');
  await injectOwnerResult(d, 'server', 'orBootReq'); await d.act('retry');
  await wait(() => window.O55.S.sess.server.orRunErr === 'pending_no_result', 'pairing awaiting owner');
  await injectOwnerResult(d, 'server', 'orRunReq'); await d.act('retry');
  A.ok(await d.state(() => window.O55.S.sess.server.orRunOk && !window.O55.S.sess.server.selfConfirmed && !window.O55.S.sess.server.claimed), 'waiting pairing needs human identity confirmation');
  A.ok((await d.primaryInfo()).disabled, 'approval waits for identity confirmation');
  await d.act('selfMatch'); await d.primary();
  await wait(() => window.O55.S.sess.server.orApproveErr === 'pending_no_result', 'approval awaiting owner');
  A.ok(await d.state(() => !window.O55.S.sess.server.claimed), 'human confirmation alone grants no trust');
  await injectOwnerResult(d, 'server', 'orApproveReq'); await d.primary();
  await d.untilScreen('s-ready', 8000);
  A.ok(await d.state(() => !!window.O55.S.sess.server.selfTrustId && window.O55.S.sess.drafts.main.server_trust_confirmed), 'matching owner trust result completes setup');
}

export async function finishBackupProtection(d, A) {
  await d.primary();
  await d.until(() => window.O55.S.sess.backup.done.includes('test'), { what: 'destination test', timeout: 8000 });
  // This context is deliberate fixture input, held only in this isolated browser. No kit bytes are supplied.
  await d.state(() => {
    const S = window.O55.S, project = S.sess.commit.projectId;
    window.__O55_OWNER_CONTEXT__ = { project, client: S.env.client.id,
      server: S.sess.drafts.main.server_ref || 'fixture:server:this-device',
      recovery_set_id: 'fixture:recovery-set:' + project, recovery_generation: 1 };
  });
  for (const step of ['kit', 'kitTest', 'policy']) {
    if (step !== 'policy') {
      await d.primary();
      A.ok(await d.page.evaluate(step => !(window.O55.S.sess.backup.done || []).includes(step), step), step + ': confirmation request alone does not complete the handoff');
    }
    await d.primary();
    await d.until(new Function(`return window.O55.S.sess.backup.orErr_${step} === 'pending_no_result'`), { what: step + ' awaiting owner', timeout: 8000 });
    A.ok(await d.state(() => !document.querySelector('.o55-kitwords') && !window.O55.S.sess.backup.stepUp), 'no recovery words or persisted step-up proof');
    if (step === 'kit') {
      await injectOwnerResult(d, 'backup', 'or_kit', { stepup: null }); await d.act('retry');
      A.eq(await d.state(() => window.O55.S.sess.backup.orErr_kit), 'current_stepup_required', 'kit result without current protected proof refused');
      A.ok(await d.state(() => !window.O55.S.sess.backup.done.includes('kit')), 'refused proof completes no kit');
    }
    await injectOwnerResult(d, 'backup', 'or_' + step); await d.act('retry');
    A.ok(await d.page.evaluate(step => window.O55.S.sess.backup.done.includes(step), step), step + ': matching owner postcondition adopted');
  }
  A.eq(await d.state(() => window.O55.S.sess.backup.state), 'done', 'backups are on after the policy result');
  A.ok(await d.state(() => /Backups are on/.test(document.body.textContent)), 'backups are on');
}
