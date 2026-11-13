"""W3G family spec for the phase-2 oracles (stream E, wave 3; ATS-1260..1263).

Each of the 19 W3G families (APR-1500..1506, ERS-1507..1511, GRS-1512..1513, WN-1514..1518) gets:

- ``facts``: the synthetic native owner facts an authentic original carries (never a native result:
  native execution stays NOT_RUN). ``derive`` recomputes every deterministic copy and hash from the
  base facts, so a negative that changes one base fact stays coherent everywhere else.
- ``payload``: payload field -> fact path. The checker builds the payload from the facts, and the
  per-field join rows compare a stored payload with these paths.
- ``domain``: the family's own owner predicates from Plans/event_authority_w3g/oracle_plan.json
  (guard ids ``<family>:<suffix>``), each a typed relation over the facts, with the plan's refusal
  code, the boundaries it applies to and its single-defect negative (one base-fact override, built
  from the named valid variant).
- ``variants``: owner-defined valid branches (positives) for the family.

Relation kinds (all compare exact types: True is never 1, 1.0 is never 1):
  is (a == literal), eq (a == b), succ (b == a + 1, both exact int), inn (a in literal list),
  imp (a == va implies b == vb), impin (a in list implies b == vb), alltrue (every value of a
  mapping/list is exactly True), alleq (every item of a list equals the first), allin (every
  item of list a is in literal list), notin (literal not in list a), sub (every item of list a is
  in list b), le (int a <= literal), len (len(list a) == int b), lt (int a < int b),
  noneoreq (a is None or a == b), mapeq (map a[key b] == c), edge ((a, b) in literal pairs),
  jcs_sha (b == sha256(CV-317 RFC 8785 bytes of a), the shared qualified_jcs route).
"""
import copy
import hashlib
import json

CURRENT = ('append', 'retry')
ALL = ('append', 'retry', 'history')


def H(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def _get(facts, path):
    node = facts
    for part in path.split('.'):
        node = node[part]
    return node


def _set(facts, path, value):
    node = facts
    parts = path.split('.')
    for part in parts[:-1]:
        node = node[part]
    node[parts[-1]] = value


# ----------------------------------------------------------------------------------------------
# Native facts per family (base values; derive() fills the computed ones).

def _plan_base(version=3):
    return dict(plan=dict(assistant_plan_id='plan-1', version=version, hash=H(f'plan-1@{version}'), aggregate_revision=7,
                          owner='AssistantPlanRuntime', runtime_input='input-1', permission_snapshot='perm-snap-1',
                          computer='computer-1', root='root-1', currentness_hash=None))


FACTS = {}
FACTS['assistant_plan.build_started'] = lambda: dict(
    _plan_base(),
    run=dict(plan_run_id='run-1', frozen_plan_id='plan-1', frozen_version=3, frozen_hash=H('plan-1@3'),
             frozen_runtime_input='input-1', frozen_permission_snapshot='perm-snap-1', frozen_computer='computer-1',
             frozen_root='root-1', resumed_existing=False),
    admission=dict(todo_participation=True, crew_required=True, crew_complete=True, goal_required=False, goal_complete=None),
    binding=dict(binding_ref='binding-1', todo_binding_ref='todo-binding-1'), control=dict(state='building'))
FACTS['assistant_plan.cancelled'] = lambda: dict(
    _plan_base(),
    run=dict(exists=True, plan_run_id='run-1', epoch=4),
    settle=dict(safe_stop=True, run_state='cancelled', schedules_invalidated=True, quota_invalidated=True, cancel_epoch=4,
                run_ref='run-1', receipt_ref='cancel-rcpt-1'),
    callbacks=dict(epochs=[4, 4]), control=dict(state='canceled'))
FACTS['assistant_plan.completed'] = lambda: dict(
    _plan_base(),
    run=dict(plan_run_id='run-1', state='completed'),
    completion=dict(admitted_work=True, todo=True, approved_step=True, scoped_bundle=True, issuer='AssistantPlanRuntime',
                    evidence_refs=['evidence-1', 'evidence-2']),
    control=dict(state='completed'))
FACTS['assistant_plan.created'] = lambda: dict(
    _plan_base(version=1),
    birth=dict(version=1, receipt_ref='creation-rcpt-1'),
    slot=dict(competing_unfinished=False, replacement=False, predecessor_cancel_settled=None),
    owner=dict(admitted_strategies=['quick', 'standard', 'thorough'], backend_map=dict(quick='direct', standard='direct',
                                                                                     thorough='ledger_bound')),
    strategy=dict(selected='standard', backend='direct'))
FACTS['assistant_plan.exported'] = lambda: dict(
    _plan_base(),
    export=dict(status='succeeded', artifact_available=True, receipt_ref='export-rcpt-1', artifact_ref='artifact-1',
                format='markdown', receipt_version=3, receipt_hash=H('plan-1@3'), source_revision_before='rev-3',
                source_revision_after='rev-3', build_control_before='idle', build_control_after='idle'),
    run=dict(plan_run_id=None))
FACTS['assistant_plan.version_created'] = lambda: dict(
    _plan_base(version=4),
    lineage=dict(previous_version=3, parent_plan_id='plan-1', parent_revision_ref='docrev-3', actual_parent_ref='docrev-3',
                 parent_hash=H('plan-1@3'), actual_parent_hash=H('plan-1@3'), thread_before='thread-1',
                 thread_after='thread-1', creation_before='creation-1', creation_after='creation-1', strategy_before='standard',
                 strategy_after='standard', backend_before='direct', backend_after='direct', approved_bytes_changed=False,
                 inflight_quiesced=True, schedules_invalidated=True, document_revision_ref='docrev-4'),
    run=dict(plan_run_id=None))
FACTS['assistant_plan.wizard_handoff_created'] = lambda: dict(
    _plan_base(),
    intake=dict(handoff_id='handoff-1', named_project='proj-dest', actual_project='proj-dest', accepted=True,
                fresh_permission=True, actor='user:alice', authorized_user='user:alice', started_execution=False,
                explicit_request=True, receipt_ref='intake-rcpt-1'),
    run=dict(plan_run_id=None))
FACTS['external_research.budget_denied'] = lambda: dict(
    topic=dict(topic_id='topic-1', job_id='job-1', arm_id='arm-a'),
    receipt=dict(ref='budget-rcpt-1', decision='denied', captured=12.5, allowance=3.0, unresolved=1.25, cap=15.0),
    expect=dict(captured=12.5, allowance=3.0, unresolved=1.25, cap=15.0),
    average=dict(jobs_reconciled=[True, True], job_arms=['arm-a', 'arm-a'], job_stages=['discovery', 'discovery']),
    denial=dict(next_request_admitted=False, unresolved_before=1.25, unresolved_after=1.25, responses_before=9,
                responses_after=9))
FACTS['external_research.finding_classified'] = lambda: dict(
    topic=dict(topic_id='topic-1'),
    finding=dict(finding_id='finding-1', union_id='union-1', finding_class='capability', credit_state='credited',
                 ref='finding-rec-1'),
    credit=dict(delivered=True, proposition_match=True, passage_present=True, awarded=True),
    candidate=dict(rejection_check=None),
    union=dict(member=True, changed_by='union-owner', owner='union-owner'))
FACTS['external_research.job_terminal'] = lambda: dict(
    topic=dict(topic_id='topic-1'),
    job=dict(job_id='job-1', stage='discovery', terminal_state='budget', bound_by='budget_cap', responses_admitted=6,
             record_ref='job-rec-1'),
    runtime=dict(bound_by='budget_cap', reconciled=False),
    meter=dict(bound_by='budget_cap', distinct_requests=6, unresolved_retained=True),
    terminal=dict(replacement_started=False))
FACTS['external_research.packet_delivered'] = lambda: dict(
    topic=dict(topic_id='topic-1'),
    packet=dict(packet_id='packet-1', card_refs=['card-1', 'card-2'], artifact='artifact-p1', ref='packet-rec-1'),
    cards=dict(finding_classes=['capability', 'product_choice'], derived_from_union=[True, True]),
    delivery=dict(thread_id='thread-1', confirmed_thread='thread-1', receipt_ref='delivery-rcpt-1', recorded_approval=False,
                  artifact='artifact-p1'))
FACTS['external_research.topic_started'] = lambda: dict(
    topic=dict(topic_id='topic-1', brief_ref='brief-1', manifest_ref='manifest-1', snapshot_sha256=H('snapshot-1')),
    inputs=dict(exist=dict(project=True, snapshot=True, brief=True), contains_decision=False, contains_answer=False,
                contains_packet=False),
    freeze=dict(before_jobs=True, runtime_binary='bin-1', project='proj-alpha', snapshot=H('snapshot-1'), brief='brief-1',
                protocol='protocol-1'),
    actual=dict(project='proj-alpha', snapshot=H('snapshot-1'), brief='brief-1', protocol='protocol-1'),
    runtime=dict(binary='bin-1'),
    stages=dict(discovery=['product_brief'], study=['product_brief', 'own_arm_artifact'],
                reconcile=['product_brief', 'own_arm_artifact', 'frozen_snapshot', 'declared_other_arm_artifact'],
                compare=['product_brief', 'own_arm_artifact', 'frozen_snapshot', 'declared_other_arm_artifact']))


def _goal_base(action, family):
    before_state, after_state = ('active', 'paused') if action == 'pause' else ('paused', 'active')
    return dict(
        goal=dict(goal_id='goal-1', thread_id='thread-1'),
        before=dict(state=before_state, objective_sha=H('objective-1'), history_head='hist-5', blocker=None),
        after=dict(state=after_state, objective_sha=H('objective-1'), history_head='hist-5', blocker=None),
        receipt=dict(ref='body-rcpt-1', before_revision=3, after_revision=4, active_run_ref=None, accepted_history_head='hist-5',
                     origin_key='origin-1', body_key='body-1', operation_id=f'op:{family}:1', pause_epoch=2),
        expect=dict(before_revision=None, after_revision=None, before_currentness_hash=None, after_currentness_hash=None,
                    active_run_ref=None, accepted_history_head=None, origin_key=None, body_key=None, operation_id=None),
        control=dict(edition='v2', install_evidence='v2', cancellation_pending=None, cancellation_receipt_ref=None,
                     pending_owner=None, body_sha256=None, epoch=11, cas_epoch=11),
        stop=dict(epoch=2, latched_epoch=2, latched_seq=40, manual_active=False, scope_pause_active=False),
        dispatch=dict(next_continuation_seq=41),
        effects=dict(workflow_cancelled=False),
        actor=dict(ref='user:alice', authorized_user='user:alice', explicit_request=True, authority_ref='resume-auth-1'),
        blocker=dict(cleared=None, clearance_ref=None))


FACTS['goal.paused'] = lambda: _goal_base('pause', 'goal.paused')
FACTS['goal.resumed'] = lambda: _goal_base('resume', 'goal.resumed')


def _nb_base():
    return dict(nb=dict(notebook_id='nb-1', thread_id='thread-1', computer_ref='computer-1', scope_kind='thread'))


FACTS['notebook.checkpoint_committed'] = lambda: dict(
    _nb_base(),
    checkpoint=dict(checkpoint_id='cp-1', commit_receipt_ref='cp-rcpt-1', ref='cp-rec-1'),
    required=dict(entry_revisions=['entry-1@2', 'entry-2@5'], workflow_checkpoints=['wf-cp-1'], capsules=['capsule-1'],
                  issuer='notebook-required-set-owner', owner='notebook-required-set-owner'),
    supplied=dict(entry_revisions=['entry-1@2', 'entry-2@5'], workflow_checkpoints=['wf-cp-1'], capsules=['capsule-1']),
    barrier=dict(full_flush_before_publish=True, readable=dict(entries=True, workflow=True, capsule=True),
                 substitutes_tool_receipt=False),
    capsule=dict(bytes_text='capsule-bytes-1', hash=None, actual_hash=None),
    derived=dict(required_revisions_sha256=None))
FACTS['notebook.checkpoint_failed'] = lambda: dict(
    _nb_base(),
    checkpoint=dict(checkpoint_id='cp-2', failure_result_ref='cp-fail-1', required_capture=True),
    disposition=dict(state='failed', reason='notebook_checkpoint_failed', typed_reason='notebook_checkpoint_failed'),
    failure=dict(source_preserved=True, transition_deferred=True),
    retry=dict(automatic_count=0, identity='cp-2', original_identity='cp-2'))
FACTS['notebook.entry_committed'] = lambda: dict(
    _nb_base(),
    entry=dict(entry_id='entry-1', expected_revision=1, revision=2, body_sha256=H('entry-body-2'), ref='entry-1@2',
               birth=False, restrictions=['no_export'], directly_readable=True),
    cas=dict(expected_prior=1, actual_preimage=1),
    source=dict(restrictions=['no_export']),
    read=dict(enforces_inherited=True))
FACTS['notebook.entry_superseded'] = lambda: dict(
    _nb_base(),
    entry=dict(entry_id='entry-1', old_revision=2, new_revision=3, successor_entry_id='entry-1', old_ref='entry-1@2',
               new_ref='entry-1@3'),
    link=dict(old_revision=2, successor=3, retained=dict(old=True, new=True)),
    cas=dict(expected_active=2, actual_active=2),
    inflight=dict(sent_revision=2, receipt_revision=2))
TRANSITION_EDGES = (('requested', 'preparing'), ('preparing', 'checkpointed'), ('checkpointed', 'admitted'),
                    ('admitted', 'activated'), ('requested', 'deferred'), ('requested', 'denied'), ('preparing', 'failed'),
                    ('checkpointed', 'failed'), ('admitted', 'failed'), ('requested', 'cancelled'), ('preparing', 'cancelled'),
                    ('failed', 'recovered_resumed'), ('deferred', 'preparing'))
FACTS['notebook.transition_state_changed'] = lambda: dict(
    _nb_base(),
    transition=dict(transition_id='tr-1', from_state='checkpointed', to_state='admitted', reason='proactive_before_overflow',
                    record_ref='tr-rec-1'),
    owner_result=dict(reason='proactive_before_overflow'),
    activation=dict(runtime_observed=None),
    admission=dict(authentic=True, bytes=H('request-bytes-1'), route='route-1', account='acct-1', stop_epoch=2, source_generation=5,
                   consumed_by_other=False),
    request=dict(bytes=H('request-bytes-1'), route='route-1', account='acct-1', stop_epoch=2, source_generation=5),
    checkpoint=dict(complete=True),
    stop=dict(owner_stopped=False))


def derive(family, facts):
    """Recompute every deterministic copy/hash from the base facts (never from a stored event)."""
    if family.startswith('assistant_plan.'):
        p = facts['plan']
        p['currentness_hash'] = H(f"{p['assistant_plan_id']}|{p['version']}|{p['hash']}|{p['aggregate_revision']}")
    if family.startswith('goal.'):
        r = facts['receipt']
        facts['before']['revision'] = r['before_revision']
        facts['after']['revision'] = r['after_revision']
        for side in ('before', 'after'):
            b = facts[side]
            b['body_sha256'] = H(json.dumps([b['state'], b['objective_sha'], b['history_head'], b['blocker'], b['revision']]))
            b['currentness_hash'] = H(f"goal-1|{b['revision']}|{b['body_sha256']}")
        r['before_currentness_hash'] = facts['before']['currentness_hash']
        r['after_currentness_hash'] = facts['after']['currentness_hash']
        facts['control']['body_sha256'] = facts['after']['body_sha256']
        for k in facts['expect']:
            facts['expect'][k] = r[k]
    if family == 'notebook.checkpoint_committed':
        from pm_event_numbers import qualified_jcs  # CV-317 RFC 8785 bytes (shared NUMRULE route)
        facts['capsule']['actual_hash'] = H(facts['capsule']['bytes_text'])
        if facts['capsule']['hash'] is None:
            facts['capsule']['hash'] = facts['capsule']['actual_hash']
        facts['derived']['required_revisions_sha256'] = hashlib.sha256(
            qualified_jcs(facts['required']['entry_revisions'])).hexdigest()
    return facts


# ----------------------------------------------------------------------------------------------
# Payload maps: field -> fact path (Project and application selectors share family fields).

_PLAN_COMMON = dict(assistant_plan_id='plan.assistant_plan_id', thread_id='@thread', plan_version='plan.version',
                    plan_hash='plan.hash', aggregate_revision='plan.aggregate_revision',
                    currentness_hash='plan.currentness_hash')
PAYLOAD = {
    'assistant_plan.build_started': dict(_PLAN_COMMON, plan_run_id='run.plan_run_id', binding_ref='binding.binding_ref',
                                         todo_binding_ref='binding.todo_binding_ref', control_state='control.state'),
    'assistant_plan.cancelled': dict(_PLAN_COMMON, plan_run_id='settle.run_ref', cancel_receipt_ref='settle.receipt_ref',
                                     control_state='control.state', plan_run_epoch='run.epoch'),
    'assistant_plan.completed': dict(_PLAN_COMMON, plan_run_id='run.plan_run_id',
                                     completion_evidence_refs='completion.evidence_refs', run_state='run.state',
                                     control_state='control.state'),
    'assistant_plan.created': dict(_PLAN_COMMON, plan_run_id='@null', creation_receipt_ref='birth.receipt_ref',
                                   strategy='strategy.selected', backend='strategy.backend'),
    'assistant_plan.exported': dict(_PLAN_COMMON, plan_run_id='run.plan_run_id', export_receipt_ref='export.receipt_ref',
                                    artifact_ref='export.artifact_ref', format='export.format'),
    'assistant_plan.version_created': dict(_PLAN_COMMON, plan_run_id='run.plan_run_id',
                                           previous_version='lineage.previous_version',
                                           parent_revision_ref='lineage.parent_revision_ref',
                                           document_revision_ref='lineage.document_revision_ref'),
    'assistant_plan.wizard_handoff_created': dict(_PLAN_COMMON, plan_run_id='run.plan_run_id',
                                                  wizard_handoff_id='intake.handoff_id',
                                                  destination_project_id='intake.named_project',
                                                  intake_receipt_ref='intake.receipt_ref'),
    'external_research.budget_denied': dict(topic_id='topic.topic_id', research_job_id='topic.job_id', arm_id='topic.arm_id',
                                            budget_receipt_ref='receipt.ref', captured='receipt.captured',
                                            allowance='receipt.allowance', unresolved='receipt.unresolved', cap='receipt.cap'),
    'external_research.finding_classified': dict(topic_id='topic.topic_id', finding_id='finding.finding_id',
                                                 union_id='finding.union_id', finding_class='finding.finding_class',
                                                 credit_state='finding.credit_state', finding_ref='finding.ref'),
    'external_research.job_terminal': dict(topic_id='topic.topic_id', research_job_id='job.job_id', stage='job.stage',
                                           terminal_state='job.terminal_state', bound_by='job.bound_by',
                                           responses_admitted='job.responses_admitted', job_record_ref='job.record_ref'),
    'external_research.packet_delivered': dict(topic_id='topic.topic_id', decision_packet_id='packet.packet_id',
                                               card_count='@card_count', packet_ref='packet.ref',
                                               delivery_thread_id='delivery.thread_id',
                                               delivery_receipt_ref='delivery.receipt_ref'),
    'external_research.topic_started': dict(topic_id='topic.topic_id', frozen_snapshot_sha256='topic.snapshot_sha256',
                                            brief_ref='topic.brief_ref', run_manifest_ref='topic.manifest_ref'),
    'goal.paused': dict(goal_id='goal.goal_id', thread_id='@thread', expected_revision='receipt.before_revision',
                        goal_revision='receipt.after_revision', before_currentness_hash='receipt.before_currentness_hash',
                        currentness_hash='receipt.after_currentness_hash', user_stop_epoch='stop.epoch',
                        active_run_ref='receipt.active_run_ref', body_receipt_ref='receipt.ref',
                        before_state='before.state', after_state='after.state'),
    'notebook.checkpoint_committed': dict(notebook_id='nb.notebook_id', thread_id='@thread', computer_ref='nb.computer_ref',
                                          notebook_scope_kind='nb.scope_kind', checkpoint_id='checkpoint.checkpoint_id',
                                          required_revisions_sha256='derived.required_revisions_sha256',
                                          commit_receipt_ref='checkpoint.commit_receipt_ref', checkpoint_ref='checkpoint.ref'),
    'notebook.checkpoint_failed': dict(notebook_id='nb.notebook_id', thread_id='@thread', computer_ref='nb.computer_ref',
                                       notebook_scope_kind='nb.scope_kind', checkpoint_id='checkpoint.checkpoint_id',
                                       failure_reason='disposition.reason', failure_result_ref='checkpoint.failure_result_ref',
                                       required_capture='checkpoint.required_capture'),
    'notebook.entry_committed': dict(notebook_id='nb.notebook_id', thread_id='@thread', computer_ref='nb.computer_ref',
                                     notebook_scope_kind='nb.scope_kind', entry_id='entry.entry_id',
                                     expected_revision='entry.expected_revision', revision='entry.revision',
                                     body_sha256='entry.body_sha256', entry_revision_ref='entry.ref'),
    'notebook.entry_superseded': dict(notebook_id='nb.notebook_id', thread_id='@thread', computer_ref='nb.computer_ref',
                                      notebook_scope_kind='nb.scope_kind', entry_id='entry.entry_id',
                                      old_revision='entry.old_revision', new_revision='entry.new_revision',
                                      successor_entry_id='entry.successor_entry_id', old_revision_ref='entry.old_ref',
                                      new_revision_ref='entry.new_ref'),
    'notebook.transition_state_changed': dict(notebook_id='nb.notebook_id', thread_id='@thread',
                                              computer_ref='nb.computer_ref', notebook_scope_kind='nb.scope_kind',
                                              transition_id='transition.transition_id', from_state='transition.from_state',
                                              to_state='transition.to_state', reason='transition.reason',
                                              transition_record_ref='transition.record_ref'),
}
PAYLOAD['goal.resumed'] = dict(PAYLOAD['goal.paused'], resume_authority_ref='actor.authority_ref',
                               blocker_clearance_ref='blocker.clearance_ref')


def payload_value(facts, path, thread):
    if path == '@thread':
        return thread
    if path == '@null':
        return None
    if path == '@card_count':
        return len(facts['packet']['card_refs'])
    return copy.deepcopy(_get(facts, path))


# ----------------------------------------------------------------------------------------------
# Domain rows: (suffix, kind, args, code, applies, negative)
# negative: (variant, {fact path: value}) applied to the base facts before derive().

def R(suffix, kind, args, code, neg, applies=CURRENT, variant='base', entailed=None):
    """neg: {path: value} (base-fact override before derive), ('post', {...}) (after derive: an independent
    expectation only), ('payload', {field: value}) (the stored payload field only) or ('payload_jcs', {field: list})
    (the stored payload digest becomes the CV-317 digest of another valid list)."""
    if type(neg) is dict:
        neg = ('pre', neg)
    return dict(suffix=suffix, kind=kind, args=args, code=code, applies=applies, neg=(variant,) + neg, entailed=entailed)


def _state_proof(field, path, keyword):
    return (f'Always refused first by the payload {keyword} row of {field} or its join row. The payload field {field} is '
            f'built from the same native fact {path} (pm_w3g_spec.PAYLOAD), the join row FJ<n>_{field} requires the stored '
            f'payload to equal that fact exactly, and the closed selector pins {field} by {keyword} '
            f'(Plans/event_authority_w3g/payloads/<family>.schema.json, ProjectPayloadV1 and ApplicationPayloadV1 '
            f'properties.{field}). A fact outside the {keyword} either reaches the payload (the py {keyword} row refuses) or '
            f'not (the join row refuses), so this row is never the first refusal.')


GOAL_SHARED = [
    R('control_edition', 'is', ('control.edition', 'v2'), 'current_control_edition_required',
      {'control.edition': 'v1', 'control.install_evidence': 'v1'}),
    R('cancellation_pending', 'is', ('control.cancellation_pending', None), 'cancellation_pending',
      {'control.cancellation_pending': 'cancel-op-9'}),
    R('cancellation_receipt', 'is', ('control.cancellation_receipt_ref', None), 'cancelled',
      {'control.cancellation_receipt_ref': 'cancel-rcpt-9'}),
    R('ordinary_pending', 'noneoreq', ('control.pending_owner', 'receipt.operation_id'), 'pending_conflict',
      {'control.pending_owner': 'foreign-op-7'}),
    R('control_body', 'eq', ('control.body_sha256', 'after.body_sha256'), 'control_mismatch',
      ('post', {'control.body_sha256': H('stale-body')})),
    R('control_epoch', 'eq', ('control.cas_epoch', 'control.epoch'), 'cas_conflict', {'control.cas_epoch': 10}),
    R('history_decoder', 'imp', ('control.edition', 'v1', 'control.install_evidence', 'v1'), 'invalid_history_edition',
      {'control.install_evidence': 'v2'}, applies=('history',), variant='v1_history'),
    # B1-R1: the successor relation itself (GRS-1512/1513 "advances ... from expected_revision to expected_revision+1").
    R('revision_successor', 'succ', ('receipt.before_revision', 'receipt.after_revision'), 'pause_state_refused',
      {'receipt.after_revision': 5}),
] + [R(f'join_{k}', 'eq', (f'expect.{k}', f'receipt.{k}'), 'source_join_mismatch', ('post', {f'expect.{k}': v}))
     for k, v in (('before_revision', 2), ('after_revision', 5), ('before_currentness_hash', H('stale-before')),
                  ('after_currentness_hash', H('stale-after')), ('active_run_ref', 'run-9'), ('accepted_history_head', 'hist-4'),
                  ('origin_key', 'origin-2'), ('body_key', 'body-2'), ('operation_id', 'op:other:1'))]

DOMAIN = {
    'assistant_plan.build_started': [
        R('build_freeze', 'eq', ('run.frozen_plan_id', 'plan.assistant_plan_id'), 'build_freeze_refused', {'run.frozen_plan_id': 'plan-2'}),
        R('build_freeze_version', 'eq', ('run.frozen_version', 'plan.version'), 'build_freeze_refused', {'run.frozen_version': 2}),
        R('build_freeze_hash', 'eq', ('run.frozen_hash', 'plan.hash'), 'build_freeze_refused', {'run.frozen_hash': H('plan-1@2')}),
        R('build_freeze_runtime input', 'eq', ('run.frozen_runtime_input', 'plan.runtime_input'), 'build_freeze_refused',
          {'run.frozen_runtime_input': 'input-0'}),
        R('build_freeze_permission snapshot', 'eq', ('run.frozen_permission_snapshot', 'plan.permission_snapshot'),
          'build_freeze_refused', {'run.frozen_permission_snapshot': 'perm-snap-0'}),
        R('build_freeze_Computer', 'eq', ('run.frozen_computer', 'plan.computer'), 'build_freeze_refused',
          {'run.frozen_computer': 'computer-2'}),
        R('build_freeze_root', 'eq', ('run.frozen_root', 'plan.root'), 'build_freeze_refused', {'run.frozen_root': 'root-2'}),
        R('build_atomicity', 'is', ('admission.todo_participation', True), 'build_atomicity_refused',
          {'admission.todo_participation': False}),
        R('build_atomicity_Crew', 'imp', ('admission.crew_required', True, 'admission.crew_complete', True),
          'build_atomicity_refused', {'admission.crew_complete': False}),
        R('build_atomicity_Goal association', 'imp', ('admission.goal_required', True, 'admission.goal_complete', True),
          'build_atomicity_refused', {'admission.goal_complete': False}, variant='goal'),
        R('new_run', 'is', ('run.resumed_existing', False), 'build_freeze_refused', {'run.resumed_existing': True}),
    ],
    'assistant_plan.cancelled': [
        R('cancel_settlement', 'is', ('settle.safe_stop', True), 'cancel_settlement_refused', {'settle.safe_stop': False}),
        R('cancel_settlement_run cancelled state', 'imp', ('run.exists', True, 'settle.run_state', 'cancelled'),
          'cancel_settlement_refused', {'settle.run_state': 'running'}),
        R('cancel_settlement_schedule invalidation', 'is', ('settle.schedules_invalidated', True), 'cancel_settlement_refused',
          {'settle.schedules_invalidated': False}),
        R('cancel_settlement_quota invalidation', 'is', ('settle.quota_invalidated', True), 'cancel_settlement_refused',
          {'settle.quota_invalidated': False}),
        R('cancel_epoch', 'alleq', ('callbacks.epochs', 'settle.cancel_epoch'), 'cancel_epoch_refused', {'callbacks.epochs': [4, 3]}),
        R('prebuild_no_run', 'imp', ('run.exists', False, 'settle.run_ref', None), 'cancel_settlement_refused',
          {'settle.run_ref': 'run-invented'}, variant='prebuild'),
    ],
    'assistant_plan.completed': [
        R('completion_predicate', 'is', ('completion.admitted_work', True), 'completion_predicate_refused',
          {'completion.admitted_work': False}),
        R('completion_predicate_To-Do', 'is', ('completion.todo', True), 'completion_predicate_refused', {'completion.todo': False}),
        R('completion_predicate_approved step', 'is', ('completion.approved_step', True), 'completion_predicate_refused',
          {'completion.approved_step': False}),
        R('completion_predicate_scoped bundle', 'is', ('completion.scoped_bundle', True), 'completion_predicate_refused',
          {'completion.scoped_bundle': False}),
        R('completion_authority', 'eq', ('completion.issuer', 'plan.owner'), 'completion_authority_refused',
          {'completion.issuer': 'Orchestrator'}),
    ],
    'assistant_plan.created': [
        R('creation_version', 'is', ('birth.version', 1), 'creation_version_refused', {'birth.version': 2}),
        R('current_slot', 'is', ('slot.competing_unfinished', False), 'current_slot_refused', {'slot.competing_unfinished': True}),
        R('current_slot_replacement', 'imp', ('slot.replacement', True, 'slot.predecessor_cancel_settled', True),
          'current_slot_refused', {'slot.predecessor_cancel_settled': False}, variant='replacement'),
        R('strategy_backend', 'inlist', ('strategy.selected', 'owner.admitted_strategies'), 'strategy_backend_refused',
          {'owner.admitted_strategies': ['quick', 'thorough']}),
        R('strategy_backend_backend', 'mapeq', ('owner.backend_map', 'strategy.selected', 'strategy.backend'),
          'strategy_backend_refused', {'strategy.backend': 'ledger_bound'}),
    ],
    'assistant_plan.exported': [
        R('export_result', 'is', ('export.status', 'succeeded'), 'export_result_refused', {'export.status': 'opened_print_flow'}),
        R('export_result_artifact', 'is', ('export.artifact_available', True), 'export_result_refused',
          {'export.artifact_available': False}),
        R('export_version', 'eq', ('export.receipt_version', 'plan.version'), 'export_version_refused', {'export.receipt_version': 2}),
        R('export_version_hash', 'eq', ('export.receipt_hash', 'plan.hash'), 'export_version_refused',
          {'export.receipt_hash': H('plan-1@2')}),
        R('source revision', 'eq', ('export.source_revision_after', 'export.source_revision_before'), 'export_result_refused',
          {'export.source_revision_after': 'rev-4'}),
        R('Build control', 'eq', ('export.build_control_after', 'export.build_control_before'), 'export_result_refused',
          {'export.build_control_after': 'building'}),
    ],
    'assistant_plan.version_created': [
        R('revision_lineage', 'succ', ('lineage.previous_version', 'plan.version'), 'revision_lineage_refused',
          {'lineage.previous_version': 2}),
        R('revision_lineage_Plan identity', 'eq', ('lineage.parent_plan_id', 'plan.assistant_plan_id'), 'revision_lineage_refused',
          {'lineage.parent_plan_id': 'plan-0'}),
        R('revision_lineage_parent revision', 'eq', ('lineage.parent_revision_ref', 'lineage.actual_parent_ref'),
          'revision_lineage_refused', {'lineage.actual_parent_ref': 'docrev-2'}),
        R('revision_lineage_parent hash', 'eq', ('lineage.parent_hash', 'lineage.actual_parent_hash'), 'revision_lineage_refused',
          {'lineage.parent_hash': H('plan-1@2')}),
        R('revision_lineage_thread identity', 'eq', ('lineage.thread_after', 'lineage.thread_before'), 'revision_lineage_refused',
          {'lineage.thread_after': 'thread-2'}),
        R('revision_lineage_creation identity', 'eq', ('lineage.creation_after', 'lineage.creation_before'),
          'revision_lineage_refused', {'lineage.creation_after': 'creation-2'}),
        R('revision_lineage_strategy', 'eq', ('lineage.strategy_after', 'lineage.strategy_before'), 'revision_lineage_refused',
          {'lineage.strategy_after': 'quick'}),
        R('revision_lineage_backend', 'eq', ('lineage.backend_after', 'lineage.backend_before'), 'revision_lineage_refused',
          {'lineage.backend_after': 'ledger_bound'}),
        R('approved_immutable', 'is', ('lineage.approved_bytes_changed', False), 'approved_immutable_refused',
          {'lineage.approved_bytes_changed': True}),
        R('revision_safe_stop', 'is', ('lineage.inflight_quiesced', True), 'revision_safe_stop_refused',
          {'lineage.inflight_quiesced': False}),
        R('revision_schedule', 'is', ('lineage.schedules_invalidated', True), 'revision_safe_stop_refused',
          {'lineage.schedules_invalidated': False}),
    ],
    'assistant_plan.wizard_handoff_created': [
        R('wizard_intake', 'eq', ('intake.named_project', 'intake.actual_project'), 'wizard_intake_refused',
          {'intake.actual_project': 'proj-other'}),
        R('wizard_intake_accepted', 'is', ('intake.accepted', True), 'wizard_intake_refused', {'intake.accepted': False}),
        R('wizard_intake_permission', 'is', ('intake.fresh_permission', True), 'wizard_intake_refused',
          {'intake.fresh_permission': False}),
        R('wizard_explicit', 'eq', ('intake.actor', 'intake.authorized_user'), 'wizard_explicit_refused',
          {'intake.actor': 'user:mallory'}),
        R('wizard_no_execution', 'is', ('intake.started_execution', False), 'wizard_no_execution_refused',
          {'intake.started_execution': True}),
        R('explicit_user_intent', 'is', ('intake.explicit_request', True), 'explicit_user_request_required',
          {'intake.explicit_request': False}),
    ],
    'external_research.budget_denied': [
        R('budget_denied', 'is', ('receipt.decision', 'denied'), 'budget_denied_refused', {'receipt.decision': 'admitted'}),
        R('budget_meter', 'eq', ('expect.captured', 'receipt.captured'), 'budget_meter_refused', {'expect.captured': 12.0}),
        R('budget_meter_in-flight allowance', 'eq', ('expect.allowance', 'receipt.allowance'), 'budget_meter_refused',
          {'expect.allowance': 2.5}),
        R('budget_meter_unresolved usage', 'eq', ('expect.unresolved', 'receipt.unresolved'), 'budget_meter_refused',
          {'expect.unresolved': 1.0}),
        R('budget_meter_lifetime cap', 'eq', ('expect.cap', 'receipt.cap'), 'budget_meter_refused', {'expect.cap': 20.0}),
        R('budget_average', 'alltrue', ('average.jobs_reconciled',), 'budget_average_refused',
          {'average.jobs_reconciled': [True, False]}),
        R('budget_average_arm', 'alleq', ('average.job_arms', None), 'budget_average_refused',
          {'average.job_arms': ['arm-a', 'arm-b']}),
        R('budget_average_stage', 'alleq', ('average.job_stages', None), 'budget_average_refused',
          {'average.job_stages': ['discovery', 'study']}),
        R('denial_before_request', 'is', ('denial.next_request_admitted', False), 'budget_meter_refused',
          {'denial.next_request_admitted': True}),
        R('denial_retains_charge', 'eq', ('denial.unresolved_after', 'denial.unresolved_before'), 'budget_meter_refused',
          {'denial.unresolved_after': 0.0}),
        R('denial_count', 'eq', ('denial.responses_after', 'denial.responses_before'), 'budget_meter_refused',
          {'denial.responses_after': 10}),
    ],
    'external_research.finding_classified': [
        R('finding_credit', 'imp', ('finding.credit_state', 'credited', 'credit.delivered', True), 'finding_credit_refused',
          {'credit.delivered': False}),
        R('finding_candidate', 'imp', ('finding.credit_state', 'candidate', 'union.member', False), 'finding_candidate_refused',
          {'union.member': True}, variant='candidate'),
        R('finding_candidate_rejection', 'imp', ('finding.credit_state', 'candidate', 'candidate.rejection_check', True),
          'finding_candidate_refused', {'candidate.rejection_check': False}, variant='candidate'),
        R('finding_authority', 'eq', ('union.changed_by', 'union.owner'), 'finding_authority_refused',
          {'union.changed_by': 'research-job'}),
        R('credit_proposition', 'imp', ('finding.credit_state', 'credited', 'credit.proposition_match', True),
          'finding_candidate_refused', {'credit.proposition_match': False}),
        R('credit_passage', 'imp', ('finding.credit_state', 'credited', 'credit.passage_present', True),
          'finding_candidate_refused', {'credit.passage_present': False}),
        R('partial_no_credit', 'imp', ('finding.credit_state', 'partial', 'credit.awarded', False), 'finding_candidate_refused',
          {'credit.awarded': True}, variant='partial'),
    ],
    'external_research.job_terminal': [
        R('job_bound', 'eq', ('meter.bound_by', 'runtime.bound_by'), 'job_bound_refused', {'meter.bound_by': 'response_ceiling'}),
        R('job_count', 'eq', ('job.responses_admitted', 'meter.distinct_requests'), 'job_count_refused',
          {'meter.distinct_requests': 9}),
        R('job_usage', 'imp', ('runtime.reconciled', False, 'meter.unresolved_retained', True), 'job_usage_refused',
          {'meter.unresolved_retained': False}),
        R('terminal_reason', 'eq', ('job.bound_by', 'runtime.bound_by'), 'job_count_refused', {'runtime.bound_by': 'job_time_limit',
                                                                                             'meter.bound_by': 'job_time_limit'}),
        R('terminal_no_restart', 'is', ('terminal.replacement_started', False), 'reader_effect_forbidden',
          {'terminal.replacement_started': True}),
    ],
    'external_research.packet_delivered': [
        R('packet_classes', 'allin', ('cards.finding_classes', ['capability', 'product_choice']), 'packet_classes_refused',
          {'cards.finding_classes': ['capability', 'correction']}),
        R('packet_delivered', 'eq', ('delivery.confirmed_thread', 'delivery.thread_id'), 'packet_delivered_refused',
          {'delivery.confirmed_thread': 'thread-9'}),
        R('packet_no_decision', 'is', ('delivery.recorded_approval', False), 'packet_no_decision_refused',
          {'delivery.recorded_approval': True}),
        R('packet_artifact', 'eq', ('delivery.artifact', 'packet.artifact'), 'packet_delivered_refused',
          {'delivery.artifact': 'artifact-p0'}),
        R('packet_cards', 'len', ('packet.card_refs', '@payload.card_count'), 'packet_delivered_refused', ('payload', {'card_count': 3})),
        R('packet_finding', 'alltrue', ('cards.derived_from_union',), 'packet_delivered_refused',
          {'cards.derived_from_union': [True, False]}),
    ],
    'external_research.topic_started': [
        R('topic_inputs', 'alltrue', ('inputs.exist',), 'topic_inputs_refused',
          {'inputs.exist': dict(project=True, snapshot=True, brief=False)}),
        R('research_leakage', 'is', ('inputs.contains_decision', False), 'research_leakage_refused', {'inputs.contains_decision': True}),
        R('research_leakage_answer', 'is', ('inputs.contains_answer', False), 'research_leakage_refused',
          {'inputs.contains_answer': True}),
        R('research_leakage_packet', 'is', ('inputs.contains_packet', False), 'research_leakage_refused',
          {'inputs.contains_packet': True}),
        R('research_freeze', 'is', ('freeze.before_jobs', True), 'research_freeze_refused', {'freeze.before_jobs': False}),
        R('research_freeze_binary', 'eq', ('freeze.runtime_binary', 'runtime.binary'), 'research_freeze_refused',
          {'runtime.binary': 'bin-2'}),
        R('Project', 'eq', ('freeze.project', 'actual.project'), 'research_freeze_refused', {'freeze.project': 'proj-beta'}),
        R('snapshot', 'eq', ('freeze.snapshot', 'actual.snapshot'), 'research_freeze_refused', {'freeze.snapshot': H('snapshot-0')}),
        R('brief', 'eq', ('freeze.brief', 'actual.brief'), 'research_freeze_refused', {'freeze.brief': 'brief-0'}),
        R('protocol', 'eq', ('freeze.protocol', 'actual.protocol'), 'research_freeze_refused', {'freeze.protocol': 'protocol-0'}),
        # B1-R2: ERS-003 / ERS-1511 stage gates. The frozen snapshot and a declared other-arm artifact enter no earlier
        # than reconcile; a discovery or study stage admits neither. Valid hashed inputs, wrong stage.
        R('stage_snapshot_discovery', 'notin', ('stages.discovery', 'frozen_snapshot'), 'research_leakage_refused',
          {'stages.discovery': ['product_brief', 'frozen_snapshot']}),
        R('stage_snapshot_study', 'notin', ('stages.study', 'frozen_snapshot'), 'research_leakage_refused',
          {'stages.study': ['product_brief', 'own_arm_artifact', 'frozen_snapshot']}),
        R('stage_other_arm_discovery', 'notin', ('stages.discovery', 'declared_other_arm_artifact'), 'research_leakage_refused',
          {'stages.discovery': ['product_brief', 'declared_other_arm_artifact']}),
        R('stage_other_arm_study', 'notin', ('stages.study', 'declared_other_arm_artifact'), 'research_leakage_refused',
          {'stages.study': ['product_brief', 'own_arm_artifact', 'declared_other_arm_artifact']}),
    ],
    'goal.paused': [
        R('pause_state', 'inn', ('before.state', ['active', 'blocked']), 'pause_state_refused', {'before.state': 'paused'},
          entailed=_state_proof('before_state', 'before.state', 'enum')),
        R('pause_state_after', 'is', ('after.state', 'paused'), 'pause_state_refused', {'after.state': 'blocked'},
          entailed=_state_proof('after_state', 'after.state', 'const')),
        R('pause_stop', 'eq', ('stop.latched_epoch', 'receipt.pause_epoch'), 'pause_stop_refused', {'stop.latched_epoch': 1}),
        R('pause_body', 'eq', ('after.objective_sha', 'before.objective_sha'), 'pause_body_refused',
          {'after.objective_sha': H('objective-2')}),
        R('pause_body_history', 'eq', ('after.history_head', 'before.history_head'), 'pause_body_refused',
          {'after.history_head': 'hist-6'}),
        R('pause_blocker', 'eq', ('after.blocker', 'before.blocker'), 'pause_body_refused', {'after.blocker': 'blocker-x'}),
        R('pause_workflow', 'is', ('effects.workflow_cancelled', False), 'pause_body_refused', {'effects.workflow_cancelled': True}),
        R('pause_stop_order', 'lt', ('stop.latched_seq', 'dispatch.next_continuation_seq'), 'pause_stop_refused',
          {'stop.latched_seq': 41}),
    ] + GOAL_SHARED,
    'goal.resumed': [
        R('resume_user', 'eq', ('actor.ref', 'actor.authorized_user'), 'resume_user_refused', {'actor.ref': 'user:mallory'}),
        R('resume_stop', 'is', ('stop.manual_active', False), 'resume_stop_refused', {'stop.manual_active': True}),
        R('resume_stop_scope', 'is', ('stop.scope_pause_active', False), 'resume_stop_refused', {'stop.scope_pause_active': True}),
        R('resume_blocker', 'imp', ('before.state', 'blocked', 'blocker.cleared', True), 'resume_blocker_refused',
          {'blocker.cleared': False}, variant='blocked'),
        R('resume_state_before', 'inn', ('before.state', ['paused', 'blocked']), 'resume_blocker_refused',
          {'before.state': 'active'}, entailed=_state_proof('before_state', 'before.state', 'enum')),
        R('resume_state_after', 'is', ('after.state', 'active'), 'resume_blocker_refused', {'after.state': 'paused'},
          entailed=_state_proof('after_state', 'after.state', 'const')),
        R('explicit_user_intent', 'is', ('actor.explicit_request', True), 'explicit_user_request_required',
          {'actor.explicit_request': False}),
        # B1-R1: resume preserves objective bytes and accepted objective history (GRS-1513).
        R('resume_body', 'eq', ('after.objective_sha', 'before.objective_sha'), 'resume_blocker_refused',
          {'after.objective_sha': H('objective-2')}),
        R('resume_body_history', 'eq', ('after.history_head', 'before.history_head'), 'resume_blocker_refused',
          {'after.history_head': 'hist-6'}),
    ] + [dict(r, code='resume_blocker_refused') if r['suffix'] == 'revision_successor' else r for r in GOAL_SHARED],
    'notebook.checkpoint_committed': [
        R('checkpoint_required_set', 'sub', ('required.entry_revisions', 'supplied.entry_revisions'),
          'checkpoint_required_set_refused', {'supplied.entry_revisions': ['entry-1@2']}),
        R('checkpoint_required_set_workflow checkpoint', 'sub', ('required.workflow_checkpoints', 'supplied.workflow_checkpoints'),
          'checkpoint_required_set_refused', {'supplied.workflow_checkpoints': []}),
        R('checkpoint_required_set_capsule', 'sub', ('required.capsules', 'supplied.capsules'), 'checkpoint_required_set_refused',
          {'supplied.capsules': []}),
        R('checkpoint_barrier', 'is', ('barrier.full_flush_before_publish', True), 'checkpoint_barrier_refused',
          {'barrier.full_flush_before_publish': False}),
        R('checkpoint_barrier_readable', 'alltrue', ('barrier.readable',), 'checkpoint_barrier_refused',
          {'barrier.readable': dict(entries=True, workflow=False, capsule=True)}),
        R('checkpoint_capsule', 'eq', ('capsule.hash', 'capsule.actual_hash'), 'checkpoint_capsule_refused',
          {'capsule.hash': H('capsule-bytes-0')}),
        R('required_set_owner', 'eq', ('required.issuer', 'required.owner'), 'checkpoint_required_set_refused',
          {'required.issuer': 'notebook-writer'}),
        R('checkpoint_not_tool', 'is', ('barrier.substitutes_tool_receipt', False), 'checkpoint_barrier_refused',
          {'barrier.substitutes_tool_receipt': True}),
    ],
    'notebook.checkpoint_failed': [
        R('checkpoint_failure', 'is', ('disposition.state', 'failed'), 'checkpoint_failure_refused', {'disposition.state': 'committed'}),
        R('checkpoint_failure_reason', 'eq', ('disposition.reason', 'disposition.typed_reason'), 'checkpoint_failure_refused',
          {'disposition.typed_reason': 'notebook_limit_exceeded'}),
        R('failure_preserves_source', 'imp', ('checkpoint.required_capture', True, 'failure.source_preserved', True),
          'failure_preserves_source_refused', {'failure.source_preserved': False}),
        R('failure_preserves_source_deferred', 'imp', ('checkpoint.required_capture', True, 'failure.transition_deferred', True),
          'failure_preserves_source_refused', {'failure.transition_deferred': False}),
        R('optional_retry', 'implet', ('checkpoint.required_capture', False, 'retry.automatic_count', 1), 'optional_retry_refused',
          {'retry.automatic_count': 2}, variant='optional'),
        R('optional_retry_identity', 'eq', ('retry.identity', 'retry.original_identity'), 'optional_retry_refused',
          {'retry.identity': 'cp-3'}, variant='optional'),
    ],
    'notebook.entry_committed': [
        R('entry_cas', 'eq', ('cas.expected_prior', 'cas.actual_preimage'), 'entry_cas_refused', {'cas.actual_preimage': 2}),
        R('entry_revision', 'succ', ('entry.expected_revision', 'entry.revision'), 'entry_revision_refused', {'entry.revision': 3}),
        R('entry_restrictions', 'sub', ('source.restrictions', 'entry.restrictions'), 'entry_restrictions_refused',
          {'entry.restrictions': []}),
        R('entry_restrictions_read', 'is', ('read.enforces_inherited', True), 'entry_restrictions_refused',
          {'read.enforces_inherited': False}),
        R('entry_birth', 'imp', ('entry.birth', True, 'entry.expected_revision', 0), 'entry_revision_refused',
          {'entry.expected_revision': 1, 'entry.revision': 2, 'cas.expected_prior': 1, 'cas.actual_preimage': 1}, variant='birth'),
        R('entry_readable', 'is', ('entry.directly_readable', True), 'entry_cas_refused', {'entry.directly_readable': False}),
    ],
    'notebook.entry_superseded': [
        R('supersession_link', 'eq', ('link.old_revision', 'entry.old_revision'), 'supersession_link_refused',
          {'link.old_revision': 1}),
        R('supersession_link_successor', 'eq', ('link.successor', 'entry.new_revision'), 'supersession_link_refused',
          {'link.successor': 4}),
        R('supersession_link_retained', 'alltrue', ('link.retained',), 'supersession_link_refused',
          {'link.retained': dict(old=False, new=True)}),
        R('supersession_cas', 'eq', ('cas.expected_active', 'cas.actual_active'), 'supersession_cas_refused',
          {'cas.actual_active': 3}),
        R('inflight_immutable', 'eq', ('inflight.sent_revision', 'inflight.receipt_revision'), 'inflight_immutable_refused',
          {'inflight.receipt_revision': 3}),
    ],
    'notebook.transition_state_changed': [
        R('transition_edge', 'edge', ('transition.from_state', 'transition.to_state', TRANSITION_EDGES), 'transition_edge_refused',
          {'transition.from_state': 'requested'}),
        R('transition_activation', 'imp', ('transition.to_state', 'activated', 'activation.runtime_observed', True),
          'transition_activation_refused', {'activation.runtime_observed': False}, variant='activated'),
        R('transition_admission', 'is', ('admission.authentic', True), 'transition_admission_refused', {'admission.authentic': False}),
        R('transition_admission_bytes', 'eq', ('admission.bytes', 'request.bytes'), 'transition_admission_refused',
          {'request.bytes': H('request-bytes-2')}),
        R('transition_admission_route', 'eq', ('admission.route', 'request.route'), 'transition_admission_refused',
          {'request.route': 'route-2'}),
        R('transition_admission_account', 'eq', ('admission.account', 'request.account'), 'transition_admission_refused',
          {'request.account': 'acct-2'}),
        R('transition_admission_Stop epoch', 'eq', ('admission.stop_epoch', 'request.stop_epoch'), 'transition_admission_refused',
          {'request.stop_epoch': 3}),
        R('transition_admission_source generation', 'eq', ('admission.source_generation', 'request.source_generation'),
          'transition_admission_refused', {'request.source_generation': 6}),
        R('transition_admission_unused', 'is', ('admission.consumed_by_other', False), 'transition_admission_refused',
          {'admission.consumed_by_other': True}),
        R('transition_reason', 'eq', ('owner_result.reason', 'transition.reason'), 'transition_edge_refused',
          {'owner_result.reason': 'pressure_rising'}),
        R('transition_checkpoint', 'impin', ('transition.to_state', ['checkpointed', 'admitted'], 'checkpoint.complete', True),
          'transition_admission_refused', {'checkpoint.complete': False}),
        R('transition_recovery_stop', 'imp', ('transition.to_state', 'recovered_resumed', 'stop.owner_stopped', False),
          'transition_admission_refused', {'stop.owner_stopped': True}, variant='recovered'),
    ],
}

# B1-R3: notebook.checkpoint_committed binds required_revisions_sha256 to SHA-256 of the CV-317 RFC 8785 bytes of the
# complete original ordered required_entry_revisions array (contracts.json field_join_recipe). The negative keeps the
# native array, issuance and capsule intact and substitutes a well-formed digest of another valid ordered array.
DOMAIN['notebook.checkpoint_committed'].append(
    R('required_set_digest', 'jcs_sha', ('required.entry_revisions', '@payload.required_revisions_sha256'),
      'checkpoint_required_set_refused', ('payload_jcs', {'required_revisions_sha256': ['entry-2@5', 'entry-1@2']})))

# Variants: owner-defined valid branches (positives); each is a fact-override set on the base facts.
VARIANTS = {f: {'base': {}} for f in FACTS}
VARIANTS['assistant_plan.build_started']['goal'] = {'admission.goal_required': True, 'admission.goal_complete': True}
VARIANTS['assistant_plan.build_started']['no_crew'] = {'admission.crew_required': False, 'admission.crew_complete': None}
VARIANTS['assistant_plan.cancelled']['prebuild'] = {'run.exists': False, 'settle.run_ref': None, 'settle.run_state': None,
                                                    'run.epoch': None, 'callbacks.epochs': []}
VARIANTS['assistant_plan.created']['replacement'] = {'slot.replacement': True, 'slot.predecessor_cancel_settled': True}
VARIANTS['external_research.finding_classified']['candidate'] = {
    'finding.credit_state': 'candidate', 'union.member': False, 'candidate.rejection_check': True, 'credit.delivered': False,
    'credit.proposition_match': False, 'credit.passage_present': False, 'credit.awarded': False}
VARIANTS['external_research.finding_classified']['partial'] = {
    'finding.credit_state': 'partial', 'credit.awarded': False, 'credit.proposition_match': False}
VARIANTS['goal.paused']['blocked'] = {'before.state': 'blocked', 'before.blocker': 'blocker-1', 'after.blocker': 'blocker-1'}
VARIANTS['goal.paused']['v1_history'] = {'control.edition': 'v1', 'control.install_evidence': 'v1'}
VARIANTS['goal.paused']['with_run'] = {'receipt.active_run_ref': 'run-7'}
VARIANTS['goal.paused']['staged'] = {'control.pending_owner': 'op:goal.paused:1'}
VARIANTS['goal.resumed']['blocked'] = {'before.state': 'blocked', 'blocker.cleared': True, 'blocker.clearance_ref': 'clear-1'}
VARIANTS['goal.resumed']['v1_history'] = {'control.edition': 'v1', 'control.install_evidence': 'v1'}
VARIANTS['notebook.checkpoint_failed']['optional'] = {'checkpoint.required_capture': False, 'retry.automatic_count': 1,
                                                      'failure.source_preserved': None, 'failure.transition_deferred': None}
VARIANTS['notebook.entry_committed']['birth'] = {'entry.birth': True, 'entry.expected_revision': 0, 'entry.revision': 1,
                                                 'entry.ref': 'entry-1@1', 'cas.expected_prior': 0, 'cas.actual_preimage': 0}
VARIANTS['notebook.transition_state_changed']['activated'] = {'transition.from_state': 'admitted',
                                                              'transition.to_state': 'activated',
                                                              'activation.runtime_observed': True}
VARIANTS['notebook.transition_state_changed']['recovered'] = {'transition.from_state': 'failed',
                                                              'transition.to_state': 'recovered_resumed',
                                                              'transition.reason': 'recovery_reconstruction',
                                                              'owner_result.reason': 'recovery_reconstruction'}
# A history-only variant (V1 control) is never a current-write positive: GRS-064 makes V1 decoder-only.
HISTORY_ONLY_VARIANTS = {('goal.paused', 'v1_history'), ('goal.resumed', 'v1_history')}


def facts_for(family, variant='base', overrides=None):
    facts = FACTS[family]()
    for path, value in VARIANTS[family][variant].items():
        _set(facts, path, copy.deepcopy(value))
    for path, value in (overrides or {}).items():
        _set(facts, path, copy.deepcopy(value))
    return derive(family, facts)


# Writer-side Stop policy per family: Pause and Cancel keep their owner's permitted control behaviour under an
# effective Stop; every other family is fenced (plan rows <family>:writer_stop_blocked, 17 families).
STOP_PERMITTED = frozenset({'assistant_plan.cancelled', 'goal.paused'})
