#!/usr/bin/env python3
"""DG-CF2 TEST_ONLY native participants: whole Standard, native result/origin and D01 lineage values.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Builders used by pm_goal_dg_cf2_world. Every stored value below is the whole
original wrapper root from the coordinator package's isolated `native` and
`standard` realms, validated before it is written, and built from the actual
issued state of this TEST_ONLY execution:

* Standard capture (Phase 0): `goal_receipt.v2` (current_standard_certification_
  custody_v2) and `workflow_standard_capture_origin.v4`, together the whole
  DurableStandardRead, issued in one Storage transaction;
* native Standard result/origin (`workflow_standard_result.v4`,
  `workflow_standard_origin.v4`) for every native publication;
* D01 lineage (`executor_workflow_workflow_update.v8`, immutable
  `executor_workflow_workflow_head.v8` per revision, `executor_workflow_
  lineage_origin.v8`) and the mutable `executor_workflow_current_pointer.v2`.

The native Workflow body/control and native birth records stay compact
TEST_ONLY values: their whole roots belong to the native current source graph
(CurrentWorkflowSource/GateSources/FinalDecisionResult) that CF-02/CF-03
(lane DG-CF1) and S1 (lane DG-S) compose. Selectors name their families; the
values are not claimed as whole v1 body/control roots.
"""
from __future__ import annotations

import copy

import pm_goal_test_owner_adapters as A

QUALIFICATION = 'TEST_ONLY'
V4 = 'https://puppetmaster.local/proposals/workflow_standard_current_source.v4.schema.json#/$defs/'
S6 = 'https://puppetmaster.local/proposals/executor_workflow_original_start.v6.schema.json#/$defs/'
A4 = 'https://puppetmaster.local/proposals/workflow_standard_certification_argument.v4.schema.json#/$defs/'
T_BODY = 'workflow_goal_run_body.v1'
T_CONTROL = 'workflow_goal_run_control.v1'
T_BIRTH = 'executor_workflow_workflow_birth.v8'
T_RESULT = 'workflow_standard_result.v1'
T_ORIGIN = 'workflow_standard_origin.v1'
T_UPDATE = 'executor_workflow_workflow_update.v8'
T_HEAD = 'executor_workflow_workflow_head.v8'
T_MUTATION = 'executor_workflow_lineage_origin.v8'
T_POINTER = 'executor_workflow_current_pointer.v2'
T_RECEIPT = 'goal_receipt.v2'
T_CAPTURE = 'workflow_standard_capture_origin.v1'
FAMILY = {
    T_BODY: ('workflow_goal_run_body', 'pm.storage_value.workflow_goal_run_body.v1', '1.0.0'),
    T_CONTROL: ('workflow_goal_run_control', 'pm.storage_value.workflow_goal_run_control.v1', '1.0.0'),
    T_BIRTH: ('executor_workflow_workflow_birth', 'pm.storage_value.executor_workflow_workflow_birth.v8', '8.0.0'),
    T_RESULT: ('workflow_standard_result', 'pm.storage_value.workflow_standard_result.v4', '4.0.0'),
    T_ORIGIN: ('workflow_standard_origin', 'pm.storage_value.workflow_standard_origin.v4', '4.0.0'),
    T_UPDATE: ('executor_workflow_workflow_update', 'pm.storage_value.executor_workflow_workflow_update.v8', '8.0.0'),
    T_HEAD: ('executor_workflow_workflow_head', 'pm.storage_value.executor_workflow_workflow_head.v8', '8.0.0'),
    T_MUTATION: ('executor_workflow_lineage_origin', 'pm.storage_value.executor_workflow_lineage_origin.v8', '8.0.0'),
    T_POINTER: ('executor_workflow_current_pointer', 'pm.storage_value.executor_workflow_current_pointer.v2', '2.0.0'),
    T_RECEIPT: ('goal_receipt', 'pm.storage_value.goal_receipt.v2', '2.0.0'),
    T_CAPTURE: ('workflow_standard_capture_origin', 'pm.storage_value.workflow_standard_capture_origin.v4', '4.0.0'),
}
KINDS = dict(
    progress=dict(rule='original_execution_progress', cause='owner_status', operation='execution_progress',
                  writer='owner.workflow.standard.publish_execution.v1'),
    provisional=dict(rule='original_provisional_success', cause='owner_status', operation='provisional_success',
                     writer='owner.workflow.standard.publish_provisional_success.v1'),
    certification=dict(rule='original_standard_certification', cause='completion_certification',
                       operation='standard_certification', writer='owner.workflow.standard.publish_certified_joint.v1'),
)
require = A.require


def _w():
    import pm_goal_dg_cf2_world as W
    return W


def run_scope(scope):
    return dict(storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                goal_id=scope['goal_id'], goal_run_id=scope['goal_run_id'])


def owner_identity(storage):
    return dict(owner_ref='TEST_ONLY:workflow-owner', owner_epoch=1,
                server_id='TEST_ONLY:server:' + storage.storage_instance_id, server_claim_epoch=1)


def selof(storage, table, key, value):
    W = _w()
    family, schema_id, version = FAMILY[table]
    return dict(storage_instance_id=storage.storage_instance_id, family_id=family, physical_key=key, schema_id=schema_id,
                schema_version=version, physical_value_sha256=W.sha(W.mp(value)))


def lineage_key(scope, revision):
    return _w().native_key(scope) + ':%d' % revision


def op_key(prefix, scope, operation_id):
    W = _w()
    return '%s:%s:%s:%s' % (prefix, W.hexk(scope['project_id']), W.hexk(scope['goal_run_id']), W.hexk(operation_id))


def receipt_key(scope):
    W = _w()
    return 'goal_receipt.v2:%s:%s' % (W.hexk(scope['project_id']), W.hexk(scope['goal_run_id']))


def capture_key(scope):
    W = _w()
    return 'workflow_standard_capture_origin.v1:%s:%s' % (W.hexk(scope['project_id']), W.hexk(scope['goal_run_id']))


def validate(realm, root, value, code):
    _w().realm_bank().validate(realm, root, value, code)
    return value


def current_lineage(storage, scope):
    """The current native pointer, the head it selects, body and control."""
    W = _w()
    nk = W.native_key(scope)
    pointer = storage.cell(T_POINTER, nk)
    if pointer is None:
        return None
    head_key = pointer['value']['record']['workflow_head']['physical_key']
    head = storage.cell(T_HEAD, head_key)
    return dict(pointer=pointer, head=head, head_key=head_key, body=storage.cell(T_BODY, nk),
                control=storage.cell(T_CONTROL, nk))


def birth_writes(world, scope, *, tx, issued_at, native_birth, body, control, op):
    """activation_begin lineage revision 1 coissued with the native birth."""
    W = _w()
    st = world.storage
    nk = W.native_key(scope)
    rs = run_scope(scope)
    owner = owner_identity(st)
    birth_sel = selof(st, T_BIRTH, nk, native_birth)
    after = W.body_commitment(st.storage_instance_id, nk, body, control)
    update = dict(schema_id=FAMILY[T_UPDATE][1], schema_version='8.0.0', record=dict(
        scope=rs, operation_id=op, transaction_id=tx, revision=1, previous_head=None, before_body=None,
        before_control=None, after_body=selof(st, T_BODY, nk, body), after_control=selof(st, T_CONTROL, nk, control),
        cause='activation', original_owner_result=birth_sel, original_owner_origin=birth_sel,
        transition=dict(rule='activation_begin', before=None, after=after,
                        original_writer_method='owner.workflow.activation.begin.v1',
                        original_owner_result=birth_sel, original_owner_origin=birth_sel)))
    ukey = lineage_key(scope, 1)
    head = dict(schema_id=FAMILY[T_HEAD][1], schema_version='8.0.0', record=dict(
        scope=rs, revision=1, activation_body=selof(st, T_BODY, nk, body), activation_origin=birth_sel,
        current_body=selof(st, T_BODY, nk, body), current_control=selof(st, T_CONTROL, nk, control),
        previous_head=None, last_update=selof(st, T_UPDATE, ukey, update), workflow_owner_ref=body['workflow_owner_ref'],
        workflow_owner_epoch=body['workflow_owner_epoch'], pending_operation_id=None))
    pointer = dict(schema_id=FAMILY[T_POINTER][1], schema_version='2.0.0', record=dict(
        scope=rs, revision=1, workflow_head=selof(st, T_HEAD, ukey, head), inventory_head=None, scheduler_control=None,
        last_origin_operation_id=op, pending_operation_id=None))
    mutation = dict(schema_id=FAMILY[T_MUTATION][1], schema_version='8.0.0', record=dict(
        scope=rs, method='owner.executor.workflow_source.enroll_workflow_birth.v3', operation_id=op, transaction_id=tx,
        owner=owner, causation=birth_sel, preimages=[],
        afterimages=dict(workflow_birth=birth_sel, workflow_update=selof(st, T_UPDATE, ukey, update),
                         workflow_head=selof(st, T_HEAD, ukey, head), pointer=selof(st, T_POINTER, nk, pointer)),
        issued_at_utc=issued_at))
    for root, value in (('StorageWorkflowUpdate', update), ('StorageWorkflowHead', head),
                        ('StorageWorkflowMutationOrigin', mutation), ('StorageCurrentPointer', pointer)):
        validate('native', S6 + root, value, 'native_birth/' + root)
    return [dict(table=T_UPDATE, key=ukey, expected=None, value=update),
            dict(table=T_HEAD, key=ukey, expected=None, value=head),
            dict(table=T_MUTATION, key=ukey, expected=None, value=mutation),
            dict(table=T_POINTER, key=nk, expected=None, value=pointer)]


def publication(world, scope, *, kind, op, tx, issued_at, lineage, after_body, after_control, source_sha, goal_sha,
                standard=None):
    """One native publication: result, origin, D01 update, new head, mutation origin, pointer."""
    W = _w()
    st = world.storage
    nk = W.native_key(scope)
    rs = run_scope(scope)
    owner = owner_identity(st)
    k = KINDS[kind]
    body, control, head, pointer = lineage['body'], lineage['control'], lineage['head'], lineage['pointer']
    before_body_sel = selof(st, T_BODY, nk, body['value'])
    before_control_sel = selof(st, T_CONTROL, nk, control['value'])
    after_body_sel = selof(st, T_BODY, nk, after_body)
    after_control_sel = selof(st, T_CONTROL, nk, after_control)
    rkey, okey = op_key('workflow_standard_result.v1', scope, op), op_key('workflow_standard_origin.v1', scope, op)
    binding = None
    if standard is not None:
        binding = dict(source=selof(st, T_RECEIPT, standard['receipt_key'], standard['receipt']),
                       origin=selof(st, T_CAPTURE, standard['capture_key'], standard['capture']))
    result = dict(schema_id=FAMILY[T_RESULT][1], schema_version='4.0.0', storage_instance_id=st.storage_instance_id,
                  physical_key=rkey, record=dict(
                      scope=rs, operation_id=op, transaction_id=tx, owner=owner, operation=k['operation'],
                      before=before_body_sel, after=after_body_sel, original_source_argument_sha256=source_sha,
                      original_goal_argument_sha256=goal_sha, workflow_receipt=None, standard_receipt=binding,
                      issued_at_utc=issued_at))
    origin = dict(schema_id=FAMILY[T_ORIGIN][1], schema_version='4.0.0', storage_instance_id=st.storage_instance_id,
                  physical_key=okey, record=dict(
                      scope=rs, owner=owner, issuer_method=k['writer'], operation_id=op, transaction_id=tx,
                      result=selof(st, T_RESULT, rkey, result), original_source_argument_sha256=source_sha,
                      original_goal_argument_sha256=goal_sha, issued_at_utc=issued_at))
    rev = head['value']['record']['revision'] + 1
    ukey = lineage_key(scope, rev)
    result_sel, origin_sel = selof(st, T_RESULT, rkey, result), selof(st, T_ORIGIN, okey, origin)
    head_sel = selof(st, T_HEAD, lineage['head_key'], head['value'])
    update = dict(schema_id=FAMILY[T_UPDATE][1], schema_version='8.0.0', record=dict(
        scope=rs, operation_id=op, transaction_id=tx, revision=rev, previous_head=head_sel,
        before_body=before_body_sel, before_control=before_control_sel, after_body=after_body_sel,
        after_control=after_control_sel, cause=k['cause'], original_owner_result=result_sel,
        original_owner_origin=origin_sel,
        transition=dict(rule=k['rule'], before=W.body_commitment(st.storage_instance_id, nk, body['value'], control['value']),
                        after=W.body_commitment(st.storage_instance_id, nk, after_body, after_control),
                        original_writer_method=k['writer'], original_owner_result=result_sel,
                        original_owner_origin=origin_sel)))
    prev = head['value']['record']
    new_head = dict(schema_id=FAMILY[T_HEAD][1], schema_version='8.0.0', record=dict(
        scope=rs, revision=rev, activation_body=copy.deepcopy(prev['activation_body']),
        activation_origin=copy.deepcopy(prev['activation_origin']), current_body=after_body_sel,
        current_control=after_control_sel, previous_head=head_sel, last_update=selof(st, T_UPDATE, ukey, update),
        workflow_owner_ref=after_body['workflow_owner_ref'], workflow_owner_epoch=after_body['workflow_owner_epoch'],
        pending_operation_id=None))
    new_pointer = dict(schema_id=FAMILY[T_POINTER][1], schema_version='2.0.0', record=dict(
        scope=rs, revision=pointer['value']['record']['revision'] + 1, workflow_head=selof(st, T_HEAD, ukey, new_head),
        inventory_head=None, scheduler_control=None, last_origin_operation_id=op, pending_operation_id=None))
    mutation = dict(schema_id=FAMILY[T_MUTATION][1], schema_version='8.0.0', record=dict(
        scope=rs, method='owner.executor.workflow_source.update_workflow.v3', operation_id=op, transaction_id=tx,
        owner=owner, causation=origin_sel,
        preimages=[before_body_sel, before_control_sel, head_sel, selof(st, T_POINTER, nk, pointer['value'])],
        afterimages=dict(workflow_update=selof(st, T_UPDATE, ukey, update), workflow_head=selof(st, T_HEAD, ukey, new_head),
                         pointer=selof(st, T_POINTER, nk, new_pointer)),
        issued_at_utc=issued_at))
    validate('native', V4 + 'StorageWorkflowResult', result, 'native_publication/result')
    validate('native', V4 + 'StorageWorkflowOrigin', origin, 'native_publication/origin')
    for root, value in (('StorageWorkflowUpdate', update), ('StorageWorkflowHead', new_head),
                        ('StorageWorkflowMutationOrigin', mutation), ('StorageCurrentPointer', new_pointer)):
        validate('native', S6 + root, value, 'native_publication/' + root)
    values = dict(native_after_body=after_body, native_after_control=after_control, native_result=result,
                  native_origin=origin, d01_update=update, d01_head=new_head, d01_origin=mutation, d01_pointer=new_pointer)
    keys = dict(native_after_body=(T_BODY, nk), native_after_control=(T_CONTROL, nk), native_result=(T_RESULT, rkey),
                native_origin=(T_ORIGIN, okey), d01_update=(T_UPDATE, ukey), d01_head=(T_HEAD, ukey),
                d01_origin=(T_MUTATION, ukey), d01_pointer=(T_POINTER, nk))
    writes = [dict(table=T_BODY, key=nk, expected=body['version'], value=after_body),
              dict(table=T_CONTROL, key=nk, expected=control['version'], value=after_control),
              dict(table=T_RESULT, key=rkey, expected=None, value=result),
              dict(table=T_ORIGIN, key=okey, expected=None, value=origin),
              dict(table=T_UPDATE, key=ukey, expected=None, value=update),
              dict(table=T_HEAD, key=ukey, expected=None, value=new_head),
              dict(table=T_MUTATION, key=ukey, expected=None, value=mutation),
              dict(table=T_POINTER, key=nk, expected=pointer['version'], value=new_pointer)]
    return dict(values=values, keys=keys, writes=writes)


def standard_values(world, scope, *, tx, issued_at, values, native_source, goal, body):
    """Whole current Standard receipt and capture origin (Phase 0)."""
    W = _w()
    st = world.storage
    run = scope['goal_run_id']
    receipt_id = 'TEST_ONLY:standard-certification:' + W.hexk(run)
    ident = body['identity']
    native = values['native']
    original = dict(
        schema_version='1.0.0', receipt_id=receipt_id, project_id=scope['project_id'], goal_id=scope['goal_id'],
        goal_run_id=run, certification_tier='standard', source_workflow_ref=W.native_key(scope),
        source_workflow_sha256=W.sha(W.mp(body)),
        source_schema_ref='Plans/plans_to_code_handoff.schema.json#/$defs/goal_completion_receipt',
        certifier_ref=values['assignment']['actor_ref'], issued_at_utc=issued_at, workgraph_ref=ident['workgraph_ref'],
        workgraph_revision=ident['workgraph_revision'], workgraph_sha256=ident['workgraph_sha256'],
        acceptance_criteria_disposition=[dict(criterion_ref='TEST_ONLY:criterion:1', disposition='satisfied',
                                              evidence_refs=list(native['evidence_refs']))],
        changed_artifact_refs=list(native['artifact_refs']),
        validator_outputs=copy.deepcopy(native['validator_outputs']),
        validator_source_bindings=[dict(validator_id=v['validator_id'], source_ref='TEST_ONLY:validator-source:1',
                                        source_sha256=W.sha(W.mp(v))) for v in native['validator_outputs']],
        child_receipt_refs=[], worknode_receipt_refs=list(native['worknode_receipt_refs']),
        required_worknode_receipt_refs=list(native['worknode_receipt_refs']),
        authority_checks=[dict(authority_ref='TEST_ONLY:authority:certifier', authority_sha256=W.sha(b'TEST_ONLY:authority'),
                               target_ref=W.native_key(scope), certifier_ref=values['assignment']['actor_ref'],
                               decision='authorized')],
        unresolved_risk_refs=[], approval_refs=[], final_certifier_decision='certified', truthful_result_label='certified')
    legacy = dict(schema_id='pm.storage_value.goal_receipt.v1', schema_version='1.0.0', project_id=scope['project_id'],
                  receipt_id=receipt_id, goal_id=scope['goal_id'], receipt_kind='goal_run_certification',
                  certification_tier='standard',
                  validator_outputs=['%s:%s' % (v['validator_id'], v['outcome']) for v in native['validator_outputs']],
                  child_receipt_refs=[], worknode_receipt_refs=list(native['worknode_receipt_refs']), unresolved_risks=[],
                  final_certifier_decision='accepted', evidence_refs=list(native['evidence_refs']),
                  created_at_utc=issued_at, redaction_profile='no_secrets', goal_run_id=run)
    rkey, ckey = receipt_key(scope), capture_key(scope)
    receipt = dict(schema_id='pm.storage_value.goal_receipt.v2', schema_version='2.0.0',
                   storage_instance_id=st.storage_instance_id, physical_key=rkey, legacy_goal_receipt=legacy,
                   original_certification=original)
    capture = dict(schema_id='pm.storage_value.workflow_standard_capture_origin.v4', schema_version='4.0.0',
                   storage_instance_id=st.storage_instance_id, physical_key=ckey, record=dict(
                       storage_instance_id=st.storage_instance_id, physical_key=rkey,
                       original_operation_id='TEST_ONLY:operation:standard-capture', original_transaction_id=tx,
                       original_owner_ref='TEST_ONLY:owner:standard-storage', original_owner_epoch=1,
                       original_source_argument_sha256=W.sha(W.sj(native_source)),
                       original_goal_argument_sha256=W.sha(W.sj(goal)),
                       original_standard_argument_sha256=W.sha(W.sj(original)), physical_sha256=W.sha(W.mp(receipt)),
                       source_semantic_sha256=W.sha(W.sj(original)), issued_at_utc=issued_at))
    durable = dict(physical_receipt=receipt, original_issuance=capture)
    validate('standard', A4 + 'DurableStandardRead', durable, 'standard/durable_read')
    return dict(receipt=receipt, capture=capture, durable=durable, receipt_key=rkey, capture_key=ckey,
                receipt_id=receipt_id)
