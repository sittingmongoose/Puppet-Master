"""DG5 supplement negatives for goal.updated (lead decision 1116061157-ad82, condition 4).

One authored single-defect negative for each owner or shared site that no DG-U case targets. Each
case declares its target here, before it runs: one site, or a duplicate set whose members check the
same field with the same predicate (the reason is written beside it). The judge credits a set only
when its joint cut accepts and each member, with the others cut, still refuses alone.
"""
import copy

import pm_goal_dg_u_oracles as U

O = U.O
SUPPLEMENT = []
SITE = 'dg5/site/pm_goal_dg_u_owners.py:'


def case(cid, expected, target, why):
    def deco(fn):
        SUPPLEMENT.append(dict(group='U-DG5', id=cid, kind='negative', expected=expected, fn=fn,
                               dg5_target=target, dg5_why=why))
        return fn
    return deco


@case('U-DG5/N/stale_revision_only', 'dgu/source/capture/stale_goal_revision', SITE + '1512',
      'U2/N/stale_revision_coherent stales revision and currentness together, so with 1505 cut the currentness '
      'check (1506) refuses; this single defect keeps the current currentness_hash and stales only the revision.')
def stale_revision_only(d):
    w = U.world(d)
    g = O.birth_goal(w)
    old = w.body.read_private(g['scope'], 'o')['body']
    U.run_direct(w, g, 'moved on')
    cur = w.body.read_private(g['scope'], 'o')['body']
    req = O.direct_request(w, g, 'late', expected=(old['revision'], cur['currentness_hash']))
    return w, U.admitted(w, req)


@case('U-DG5/N/direct_admission_source_message', 'dgu/source/capture/acceptance/direct_nulls',
      (SITE + '1953', 'dg5/dgu/source/capture/input/schema'),
      "Single defect after admission (the authored U5/G/acceptance_* pattern): the stored SIR admission's direct-route "
      'request gains a source_message_id. Direct Save acceptance (:1953) requires source_message_id null, and the '
      'captured input schema embeds GoalUpdateRequestV2, whose if change_source=user_direct then source_message_id '
      'type null bounds the same field by the same predicate.')
def direct_admission_source_message(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    w.sir.admit(req)
    key = O.hexk(req['command_instance_id'])
    state = w.sir.state(key)
    w.sir.put(key, dict(state, request=dict(state['request'], source_message_id='message:TEST_ONLY:dg5')))
    return w, lambda: w.command.run(req)


def _approval_out_of_enum(d):
    # Lead decision 1116073727-d098 condition 2: reach :1046 alone with an out-of-enum decision. ApprovalOwner
    # cells are read back through _decode_cell, which checks value_sha256 only (no ApprovalResolution schema),
    # so a coherently re-put stored resolution (the authored w.sir.put pattern) skips the :1025 schema check.
    w = U.world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'x', decide='approved')
    state = w.approvals.state(req['approval_id'])
    w.approvals.put(req['approval_id'], dict(state, resolution=dict(state['resolution'], decision='withheld')))
    return w, U.admitted(w, req)


case('U-DG5/N/approval_decision_out_of_enum', 'dgu/source/capture/acceptance/approval_decision', SITE + '1046',
     "ApprovalResolution.decision 'withheld' (outside {approved, denied, expired}) passes :1044 and :1045 and is "
     'refused by :1046 alone; reached through a stored resolution that the owner reads without its schema.')(
    _approval_out_of_enum)


@case('U-DG5/N/approval_request_bytes_created_at', 'dgu/source/capture/acceptance/approval_request_bytes', SITE + '1040',
      "Single defect: the stored approval request's created_at_utc changes (still a valid date-time) while its "
      'request_sha256 stays, so only the request-bytes commitment (:1040) refuses. The authored '
      'U5/G/acceptance_approval_request_bytes changes instruction_message_id, which later checks also read.')
def approval_request_bytes_created_at(d):
    w, g = U._goal(d)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    w.approvals.put(ag['approval_id'], dict(cur, request=dict(cur['request'], created_at_utc='2026-01-01T00:00:00.000Z')))
    return w, U.admitted(w, req)


@case('U-DG5/N/approval_expired_at_read', 'dgu/source/capture/acceptance/approval_expired', SITE + '1049',
      'Single defect: the stored approval request expires in the past, with its request_sha256 recomputed in '
      'both the cell and the resolution, so the request-bytes (:1040) and request-commitment (:1043) checks '
      'hold and only the expiry-at-read check (:1049) refuses. No authored case sets expires_at_utc.')
def approval_expired_at_read(d):
    w, g = U._goal(d)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    new_request = dict(cur['request'], expires_at_utc='2020-01-01T00:00:00.000Z')
    digest = O.sha(O.msgpack(new_request))
    w.approvals.put(ag['approval_id'], dict(cur, request=new_request, request_sha256=digest,
                                            resolution=dict(cur['resolution'], request_sha256=digest)))
    return w, U.admitted(w, req)


@case('U-DG5/N/installation_graph_substituted', 'dgu/oracle/installation_graph', SITE + '503',
      'Single defect: the installed installation cell carries a foreign resource-graph digest while its '
      'state stays installed, so require_installed passes its presence check (:502) and only the graph '
      'commitment (:503) refuses.')
def installation_graph_substituted(d):
    w, g = U._goal(d)
    cur = w.installation.current()
    w.installation.put('current', dict(cur, installed_resource_graph_sha256='0' * 64))
    return w, lambda: w.installation.require_installed('dgu/oracle')


@case('U-DG5/N/publication_event_substituted', 'dgu/inspect/publication_event', SITE + '1892',
      'Single defect: every progress snapshot is coherently re-sealed with only its publication event_id '
      'changed, so the frozen producer join (:1891) still holds and only the publication-to-event join '
      '(:1892) refuses. The authored frozen-id case edits producer_input, which later joins also read.')
def publication_event_substituted(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    U.rewrite_progress_all(w, g, U.op_of(adm), lambda rec: dict(
        rec, publication=dict(rec['publication'], event_id='goal.updated.v1:' + 'a' * 64))
        if rec['publication'] else rec)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_unknown_event', 'dgu/inspect/event_unavailable', SITE + '1868',
      'The authored U4/N/unknown_event makes exactly this call, but its expected code maps by literal '
      'template to request_for (:1842), so the inspect refusal at :1868 was recorded as another refusal '
      'and never judged. This case declares :1868 itself.')
def inspect_unknown_event(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    r['event_id'] = 'goal.updated.v1:' + '0' * 64
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/history_without_first_revision', 'dgu/reader/body/missing_history', SITE + '1158',
      'Single defect: a two-revision history loses revision 1 (and its origin) while revision 2 is coherently '
      're-sealed with no prior and the control head names it, so the chain (:1151), origin join and accepted head '
      '(:1159) all hold and only the first-revision check (:1158) refuses. The authored U5/G/reader_missing_history '
      'empties the history, which the accepted-head check also refuses.')
def history_without_first_revision(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    sc = g['scope']
    project, goal = sc['project_id'], sc['goal_id']
    U.delete_cell(w, O.T_REV, O.rev_key(project, goal, 1))
    U.delete_cell(w, O.T_ORIGIN, O.origin_key(project, goal, 1))
    resealed = U.rbody(w, O.T_REV, O.rev_key(project, goal, 2), lambda r: (lambda x: dict(
        x, revision_hash=O.revision_hash(x)))(dict(r, prior_revision_hash=None)))['record']
    U.rbody(w, O.T_CONTROL, U.ctl_key(g), lambda c: dict(c, latest_revision_hash=resealed['revision_hash']))
    return w, U.body_read(w, g)


@case('U-DG5/N/owner_identity_substituted', 'dgu/physical/owner_identity', SITE + '681',
      'Single defect: only the stored body row owner_identity_sha256 changes; the record, its value_sha256 '
      'and every semantic join stay valid, so only the owner-identity commitment (:681) refuses. The authored '
      'row_copied_to_other_key also breaks the history joins the copied record carries.')
def owner_identity_substituted(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    U.rewrite_raw(w, O.T_BODY, bkey, lambda row: dict(row, owner_identity_sha256='0' * 64))
    return w, U.body_read(w, g)


@case('U-DG5/N/value_sha_substituted', 'dgu/physical/value_sha256', SITE + '688',
      'Single defect: only the stored body row value_sha256 changes; the inline record bytes are untouched, '
      'so with :688 cut the same record decodes and every later join holds. The authored incoherent-tamper '
      'case edits the record, which the currentness and objective joins also refuse.')
def value_sha_substituted(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    U.rewrite_raw(w, O.T_BODY, bkey, lambda row: dict(row, value_sha256='0' * 64))
    return w, U.body_read(w, g)


@case('U-DG5/N/logical_schema_extra_record_field', 'dgu/physical/logical/schema/record',
      'dg5/dgu/physical/logical/schema',
      'Single defect: the stored body record gains one field no owner schema defines, with its '
      'currentness hash recomputed and the control body-bytes/currentness copies rewired to match, '
      'so the physical row, value_sha256, currentness and every read join hold and only the whole-root '
      'logical schema (additionalProperties at the record) refuses. Prototype for the whole-root schema '
      'rows the write-time row() validations can never fail on owner-built records.')
def logical_schema_extra_record_field(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    sc = g['scope']
    bkey = O.body_key(sc['project_id'], sc['goal_id'])
    new = U.rbody(w, O.T_BODY, bkey, lambda r: (lambda x: dict(
        x, currentness_hash=O.currentness(x)))(dict(r, dg5_schemaless_field=1)))['record']
    U.rbody(w, O.T_CONTROL, U.ctl_key(g), lambda c: dict(
        c, body_sha256=O.body_bytes_sha(new), currentness_hash=new['currentness_hash']))
    return w, U.body_read(w, g)


@case('U-DG5/N/body_control_schema_empty_storage', 'dgu/body/goal_body_control/schema/record/storage_instance_id',
      ('dg5/dgu/body/goal_body_control/schema', 'dg5/dgu/body/goal_body_mutation_receipt/schema'),
      'Single defect at the start entry: the caller scope carries an empty storage_instance_id. '
      'No earlier row() in start reads that field (body, revision and origin records have none); '
      'the owner-built control and mutation receipt copy the same scope field, and both whole-root '
      'schemas bound it by the same predicate (string minLength 1), so the two schema rows are a '
      'declared duplicate set for this input.')
def body_control_schema_empty_storage(d):
    w = U.world(d)
    scope = dict(storage_instance_id='', project_id='TEST_ONLY-project-dg5ctl',
                 thread_id='thr_TEST_ONLY_dg5ctl', goal_id='goal:TEST_ONLY:dg5ctl')
    return w, lambda: w.body.start(scope, 'x', 'message:TEST_ONLY:dg5ctl',
                                   'TEST_ONLY:creation-authority:dg5ctl', 'context:TEST_ONLY:dg5ctl')


@case('U-DG5/N/body_origin_schema_empty_message_ref', 'dgu/body/goal_objective_origin/schema/record/source_message_refs/0',
      'dg5/dgu/body/goal_objective_origin/schema',
      'Single defect at the start entry: the caller creation_message_id is empty. The body and '
      'revision rows built before the origin row do not carry it, so the first schema to refuse '
      'is the whole-root origin validation (row dg5/dgu/body/goal_objective_origin/schema).')
def body_origin_schema_empty_message_ref(d):
    w = U.world(d)
    scope = dict(storage_instance_id=w.storage.storage_instance_id, project_id='TEST_ONLY-project-dg5org',
                 thread_id='thr_TEST_ONLY_dg5org', goal_id='goal:TEST_ONLY:dg5org')
    return w, lambda: w.body.start(scope, 'x', '', 'TEST_ONLY:creation-authority:dg5org',
                                   'context:TEST_ONLY:dg5org')


@case('U-DG5/N/body_record_schema_empty_thread', 'dgu/body/goal_body_record/schema/record/thread_id',
      ('dg5/dgu/body/goal_body_record/schema', 'dg5/dgu/body/goal_body_control/schema',
       'dg5/dgu/body/goal_body_mutation_receipt/schema'),
      'Single defect at the start entry: the caller scope carries an empty thread_id (project/goal '
      'ids feed the row keys first, so they cannot isolate a schema). The owner-built body, control '
      'and mutation receipt records copy the same scope field, and all three whole-root schemas '
      'bound it by the same predicate (string minLength 1), so the three schema rows are a '
      'declared duplicate set for this input.')
def body_record_schema_empty_thread(d):
    w = U.world(d)
    scope = dict(storage_instance_id=w.storage.storage_instance_id, project_id='TEST_ONLY-project-dg5rec',
                 thread_id='', goal_id='goal:TEST_ONLY:dg5rec')
    return w, lambda: w.body.start(scope, 'x', 'message:TEST_ONLY:dg5rec',
                                   'TEST_ONLY:creation-authority:dg5rec', 'context:TEST_ONLY:dg5rec')


@case('U-DG5/N/audit_request_schema_extra_field', 'dgu/reader/audit/request/schema/',
      ('dg5/dgu/reader/audit/request/schema', 'dg5/dgu/reader/audit/result/schema'),
      'Single defect: the caller audit request gains one field no reader schema defines. The '
      'request validation is the first statement of read_audit, and the identical request object '
      'is embedded verbatim in the validated result, so the request and result whole-root schemas '
      'bound the same object by the same predicate (additionalProperties) as a declared set.')
def audit_request_schema_extra_field(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = dict(U._audit_req(g, U.op_of(adm)), dg5_schemaless_field=1)
    return w, lambda: w.source.read_audit(r, g['user'], g['user_permission'])


@case('U-DG5/N/input_request_schema_extra_field', 'dgu/reader/input/request/schema/',
      ('dg5/dgu/reader/input/request/schema', 'dg5/dgu/reader/input/result/schema'),
      'Single defect: the caller input request gains one field no reader schema defines. The '
      'request validation is the first statement of read_input_content, and the identical request '
      'object is embedded verbatim in the validated result, so the request and result whole-root '
      'schemas bound the same object by the same predicate (additionalProperties) as a declared set.')
def input_request_schema_extra_field(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = dict(reader_binding='reader.goal.update_input@1.0.0', operation_id=U.op_of(adm),
             dg5_schemaless_field=1, **g['scope'])
    return w, lambda: w.source.read_input_content(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_request_schema_extra_field', 'dgu/inspect/request/schema/',
      ('dg5/dgu/inspect/request/schema', 'dg5/dgu/inspect/witness/schema'),
      'Single defect: the caller inspect request gains one field no consumer schema defines. The '
      'request validation is the first statement of inspect, and the identical request object is '
      'embedded verbatim in the validated witness, so the request and witness whole-root schemas '
      'bound the same object by the same predicate (additionalProperties) as a declared set.')
def inspect_request_schema_extra_field(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = dict(w.inspector.request_for(g['scope'], U.event_of(w, g, adm)), dg5_schemaless_field=1)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/hitl_resolution_schema_request_sha', 'dgu/hitl/resolution/schema/request_sha256',
      'dg5/dgu/hitl/resolution/schema',
      'Single defect: the stored approval carries a non-hex request_sha256 (cells are read back '
      'through _decode_cell with no schema), so decide copies it into the owner-built resolution '
      'and only the whole-root ApprovalResolution validation refuses; the decision enum check and '
      'person permission check never read that field.')
def hitl_resolution_schema_request_sha(d):
    w, g = U._goal(d)
    req, ag = O.agent_request(w, g, 'x', decide=None)
    cur = w.approvals.state(ag['approval_id'])
    w.approvals.put(ag['approval_id'], dict(cur, request_sha256='not-hex'))
    return w, lambda: w.approvals.decide(ag['approval_id'], 'approved', ag['approver_permission'],
                                         ag['approver'])


@case('U-DG5/N/hitl_request_schema_proposal_sha', 'dgu/hitl/request/schema/proposal_request_sha256',
      'dg5/dgu/hitl/request/schema',
      'Single defect: the stored SIR proposal dispatch carries a non-hex proposal_sha256 (dispatch '
      'cells are read back with no schema), so capture copies it into the owner-built approval '
      'request and only the whole-root ApprovalRequest validation refuses; every earlier capture '
      'check reads the proposal target, messages and scope, never that digest.')
def hitl_request_schema_proposal_sha(d):
    w, g, prop, ap = U._proposal(d)
    key = 'proposal:' + O.hexk(prop['command_instance_id'])
    w.sir.put(key, dict(w.sir.state(key), proposal_sha256='not-hex'))
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U-DG5/N/metadata_intent_schema_blocked_ref_type', 'dgu/body/metadata/intent/schema/after_record/blocked_reason_ref',
      ('dg5/dgu/body/metadata/intent/schema', 'dg5/dgu/body/goal_body_record/schema'),
      'Single defect: the lifecycle change carries an integer blocked_reason_ref. The state and '
      'blocked-reason presence checks read only its presence, so the first schema to refuse is '
      'the metadata intent whole-root pending validation over the after_record; with it cut, '
      'the body row validation refuses the identical field by the identical type predicate, '
      'so the two schema rows are a declared duplicate set for this input.')
def metadata_intent_schema_blocked_ref_type(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    return w, lambda: w.lifecycle.change(g['scope'], 'blocked', 1)


@case('U-DG5/N/receipt_request_schema_extra_field', 'dgu/reader/receipt/receipt_request/schema/',
      ('dg5/dgu/reader/receipt/receipt_request/schema', 'dg5/dgu/reader/receipt/final/receipt_request/schema'),
      'Single defect: the caller receipt request gains one field no reader schema defines. '
      'read_receipt_private validates the identical request object at entry and again at the '
      'final boundary, so the two whole-root schema rows bound the same object by the same '
      'predicate (additionalProperties) as a declared duplicate set.')
def receipt_request_schema_extra_field(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    rr = dict(U.progress(w, g, U.op_of(adm))['body_commit']['receipt_request'], dg5_schemaless_field=1)
    return w, lambda: w.body.read_receipt(rr, g['user'], g['user_permission'])


@case('U-DG5/N/terminal_result_schema_bogus_status', 'dgu/sir/terminal/result/schema/status',
      ('dg5/dgu/sir/terminal/result/schema', 'dg5/dgu/sir/terminal/schema'),
      'Single defect: terminalize is called for a no-effect progress with a status outside the '
      'result enum. No earlier check reads status (phase, receipt-absence and event-absence all '
      'hold), so the first schema to refuse is the whole-root NoEffectResult validation; the '
      'identical result object is embedded verbatim in the StorageTerminal validation, so the '
      'two schema rows are a declared duplicate set for this input.')
def terminal_result_schema_bogus_status(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    p = U.progress(w, g, U.op_of(adm))
    w.source.advance(g['scope'], U.op_of(adm), dict(p, progress_epoch=1, phase='no_effect'),
                     expected_phase=('source_admitted',), where='o')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'no_effect', status='bogus',
                                         error_code='manual_stop_latched')


@case('U-DG5/N/progress_schema_bogus_phase', 'dgu/progress/schema/',
      'dg5/dgu/progress/schema',
      'Single defect: advance is asked to write the next progress epoch with a phase outside '
      'the Progress oneOf shapes. The phase/epoch edge checks read only the stored snapshot '
      'phase and the new epoch number, so the first check to refuse is the whole-root Progress '
      'validation in progress_writes.')
def progress_schema_bogus_phase(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    p = U.progress(w, g, U.op_of(adm))
    return w, lambda: w.source.advance(g['scope'], U.op_of(adm),
                                       dict(p, progress_epoch=p['progress_epoch'] + 1, phase='bogus'),
                                       expected_phase=('source_admitted',), where='o')


@case('U-DG5/N/reserve_pending_schema_blocked_ref_type', 'dgu/body/reserve/pending/schema/after_record/blocked_reason_ref',
      ('dg5/dgu/body/reserve/pending/schema', 'dg5/dgu/body/goal_body_control/schema'),
      'Single defect: the genuine pending intent carries an integer blocked_reason_ref in its '
      'after_record, with intent_sha256 recomputed so the intent and stale checks hold. The '
      'first schema to refuse is the reserve pending whole-root validation; with it cut, the '
      'control row validation refuses the identical embedded pending by the identical type '
      'predicate, so the two schema rows are a declared duplicate set for this input.')
def reserve_pending_schema_blocked_ref_type(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    sc = g['scope']
    src = w.source.read_source(sc, U.op_of(adm), 'o')
    cur = w.body.read_private(sc, 'o')
    pending = w.command._pending(adm, src, cur, 'o')
    pending['after_record'] = dict(pending['after_record'], blocked_reason_ref=1)
    pending['intent_sha256'] = O.intent_sha(pending)
    return w, lambda: w.body.reserve(sc, pending, lambda new_control: [])


@case('U-DG5/N/inspect_source_defect', 'dgu/inspect/source_defect', SITE + '1867',
      'Single defect in the acquired source snapshot: first custody group_digest is substituted, so '
      'GenericSource halts before that event (a custody defect at its position) and the inspected event '
      'has no row. Only :1867 selects the source_defect code for that state; see the written proof in '
      'pm_goal_dg5_proofs_u.py (with :1867 cut, :1868 still refuses).')
def inspect_source_defect(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    ev = U.event_of(w, g, adm)
    r = w.inspector.request_for(g['scope'], ev)
    snap = w.storage.acquire_source()
    snap['custody'][ev] = dict(snap['custody'][ev], group_digest='0' * 64)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'], snapshot=snap)


@case('U-DG5/N/inspect_custody_pending_issued', 'dgu/inspect/original_custody_unavailable', SITE + '1873',
      'Single defect: the acquired snapshot carries no first custody for an issued event (pending custody), '
      'so the progress is event_issued and only the custody presence check (:1873) refuses. The authored '
      'pending_first_custody case stops before publication, so the not-issued refusal (:1889) also applies.')
def inspect_custody_pending_issued(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    ev = U.event_of(w, g, adm)
    r = w.inspector.request_for(g['scope'], ev)
    snap = w.storage.acquire_source()
    del snap['custody'][ev]
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'], snapshot=snap)


FOREIGN = '11111111-1111-4111-8111-111111111111'


def _foreign_copy(w, g, op, with_input=False, **scope_override):
    """A coherent copy of the operation's source (and input) and head progress rows under a
    foreign storage scope: same owner physical() rebuild at the foreign keys, snapshot and head
    commitments rewired to the copied source wrapper."""
    sc = g['scope']
    fsc = dict(sc, **{'storage_instance_id': FOREIGN, **scope_override})
    owner = w.source
    writes = []

    def copied(family, key, fkey, edit):
        cell = w.storage.cell(family, key)
        wrapper = owner.unwrap_row(family, key, cell['value'], owner.ROOTS[family])
        new = edit(copy.deepcopy(wrapper))
        writes.append(dict(table=family, key=fkey, expected=None,
                           value=owner.physical(family, fkey, new, cell['value']['source_lifetime'])))
        return new

    src = copied(O.T_SOURCE, O.upd_key(O.T_SOURCE, sc, op), O.upd_key(O.T_SOURCE, fsc, op),
                 lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=fsc['storage_instance_id'], thread_id=fsc['thread_id'])))
    src_sha = O.wrapper_sha(src)
    if with_input:
        copied(O.T_INPUT, O.upd_key(O.T_INPUT, sc, op), O.upd_key(O.T_INPUT, fsc, op),
               lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=fsc['storage_instance_id'], thread_id=fsc['thread_id'],
                                               source_audit_sha256=src_sha)))
    head_cell = w.storage.cell(O.T_PROGRESS, O.head_key(sc, op))
    head = owner.unwrap_row(O.T_PROGRESS, O.head_key(sc, op), head_cell['value'], owner.ROOTS[O.T_PROGRESS])
    epoch = head['record']['progress_epoch']
    snap = copied(O.T_PROGRESS, O.epoch_key(sc, op, epoch), O.epoch_key(fsc, op, epoch),
                  lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=fsc['storage_instance_id'], thread_id=fsc['thread_id'],
                                                  source_audit_sha256=src_sha)))
    snap_sha = O.wrapper_sha(snap)
    copied(O.T_PROGRESS, O.head_key(sc, op), O.head_key(fsc, op),
           lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=fsc['storage_instance_id'], thread_id=fsc['thread_id'],
                                           snapshot_sha256=snap_sha)))
    w.storage.transact(writes)
    return fsc


@case('U-DG5/N/audit_foreign_coherent', 'dgu/reader/audit/foreign_storage', SITE + '1640',
      'Single defect: the audit request names a foreign storage whose keys hold a coherent copy of the '
      'operation (source, head and last snapshot rewired), so only the foreign-storage check (:1640) '
      'refuses; the authored case names a foreign storage with no rows, so the source lookup also refuses.')
def audit_foreign_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm))
    r = dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=U.op_of(adm),
             selection=dict(kind='current_progress'), **fsc)
    return w, lambda: w.source.read_audit(r, g['user'], g['user_permission'])


@case('U-DG5/N/input_foreign_coherent', 'dgu/reader/input/foreign_storage', SITE + '1692',
      'Single defect: as audit_foreign_coherent, with the input row copied too, for the input reader '
      'foreign-storage check (:1692).')
def input_foreign_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm), with_input=True)
    r = dict(reader_binding='reader.goal.update_input@1.0.0', operation_id=U.op_of(adm), **fsc)
    return w, lambda: w.source.read_input_content(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_foreign_coherent', 'dgu/inspect/foreign_storage', SITE + '1858',
      'Single defect: the inspect request is built for a foreign storage holding the coherent copy, '
      'so only the inspector foreign-storage check (:1858) refuses; the authored case has no foreign rows.')
def inspect_foreign_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm))
    r = w.inspector.request_for(fsc, U.event_of(w, g, adm))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_progress_not_issued_coherent', 'dgu/inspect/original_custody_unavailable', SITE + '1889',
      'Single defect: the issued progress snapshot is coherently re-sealed back to event_ready with no '
      'publication, while the event and its first custody stay in the source, so custody is present '
      '(:1873 holds) and only the not-issued refusal (:1889) fires.')
def inspect_progress_not_issued_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    U.rewrite_progress_all(w, g, U.op_of(adm), lambda rec: dict(
        rec, phase='event_ready', publication=None) if rec['phase'] == 'event_issued' else rec)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


def _latch_only(w, g):
    goal_id = g['scope']['goal_id']
    cur = w.stops.current(goal_id)
    w.stops.put(O.hexk(goal_id), dict(cur, stop_latched=True))


@case('U-DG5/N/body_currentness_only', 'dgu/reader/body/body_currentness', SITE + '1138',
      'Single defect: body objective_text changes with every other commitment rewired (control '
      'body_sha256, last revision text and hash, control latest hash), leaving currentness_hash stale, '
      'so only :1138 refuses. The authored coherent-tamper case rewires none of them.')
def body_currentness_only(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    sc = g['scope']
    project, goal = sc['project_id'], sc['goal_id']
    new_body = U.rbody(w, O.T_BODY, O.body_key(project, goal),
                       lambda b: dict(b, objective_text='substituted'))['record']
    new_rev = U.rbody(w, O.T_REV, O.rev_key(project, goal, 2), lambda r: (lambda x: dict(
        x, revision_hash=O.revision_hash(x)))(dict(r, objective_text='substituted')))['record']
    U.rbody(w, O.T_CONTROL, U.ctl_key(g), lambda c: dict(
        c, body_sha256=O.body_bytes_sha(new_body), latest_revision_hash=new_rev['revision_hash']))
    return w, U.body_read(w, g)


@case('U-DG5/N/history_chain_prior_only', 'dgu/reader/body/history_chain', SITE + '1151',
      'Single defect: revision 2 prior_revision_hash is substituted and its revision_hash resealed, '
      'with the control latest hash rewired to the resealed hash, so the accepted-head check (:1159) '
      'holds and only the chain link (:1151) refuses. The authored case leaves the control hash stale.')
def history_chain_prior_only(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    sc = g['scope']
    new_rev = U.rbody(w, O.T_REV, O.rev_key(sc['project_id'], sc['goal_id'], 2), lambda r: (lambda x: dict(
        x, revision_hash=O.revision_hash(x)))(dict(r, prior_revision_hash='c' * 64)))['record']
    U.rbody(w, O.T_CONTROL, U.ctl_key(g), lambda c: dict(c, latest_revision_hash=new_rev['revision_hash']))
    return w, U.body_read(w, g)


@case('U-DG5/N/audit_source_scope_only', 'dgu/reader/audit/source_scope', SITE + '1439',
      'Single defect: the source record thread_id is substituted and every progress snapshot is '
      'rewired to the substituted source wrapper sha, so the source join (:1660) holds and only the '
      'source scope check (:1439) refuses.')
def audit_source_scope_only(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    op = U.op_of(adm)
    key = O.upd_key(O.T_SOURCE, g['scope'], op)
    new = U.rsrc(w, O.T_SOURCE, key, lambda s: dict(s, thread_id='thr_other'))
    sha = O.wrapper_sha(new)
    U.rewrite_progress_all(w, g, op, lambda r: dict(r, source_audit_sha256=sha))
    return w, U._audit_call(w, g, adm)


@case('U-DG5/N/audit_snapshot_op_only', 'dgu/reader/audit/snapshot_record', SITE + '1461',
      'Single defect: progress snapshots carry a foreign operation_id, coherently resealed with the '
      'head rewired by rewrite_progress_all, so the head commitment (:1464) holds and only the '
      'snapshot record check (:1461) refuses.')
def audit_snapshot_op_only(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    U.rewrite_progress_all(w, g, U.op_of(adm),
                           lambda r: dict(r, operation_id='goal-operation:TEST_ONLY:other'))
    return w, U._audit_call(w, g, adm)


@case('U-DG5/N/reserve_final_stop_latch_only', 'dgu/body/reserve/final_stop', SITE + '1191',
      'Single defect at the body.reserve after:read_private boundary: the host stop is latched '
      'without its epoch advancing (a direct cell put, not HostStopOwner.stop), so the reserve '
      'final stop-epoch check (:1192) holds and only :1191 refuses. The fault-matrix stop mutation '
      'latches through HostStopOwner.stop, which also advances the epoch.')
def reserve_final_stop_latch_only(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    holder = {}
    U.inject(w, 'body.reserve', 'after:read_private', lambda w_, ctx: _latch_only(w_, g), holder)
    return w, lambda: w.command.reserve(adm), holder


@case('U-DG5/N/commit_stop_latch_only', 'dgu/body/commit/manual_stop_latched', SITE + '2062',
      'Single defect: as reserve_final_stop_latch_only, after reserve, for the commit final-check '
      'stop site (:2062); the authored stop_before_commit latches through HostStopOwner.stop, which '
      'also advances the epoch (:2063).')
def commit_stop_latch_only(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='reserve')
    _latch_only(w, g)
    return w, lambda: w.command.commit(adm)


@case('U-DG5/N/command_reservation_missing_only', 'dgu/command/commit/reservation_missing', SITE + '2094',
      'Single defect: the reservation is released (pending cleared) and the progress '
      'reserved_control_sha256 is rewired to the released control wrapper, so the commitment check '
      '(:2096) holds and only :2094 refuses. The authored case leaves the commitment stale.')
def command_reservation_missing_only(d):
    w, g, req, adm, ag = U._upto(d, 'reserve')
    w.body.release(g['scope'], w.body.read_private(g['scope'], 'o')['control'], lambda c: [])
    control = w.body.read_private(g['scope'], 'o')['control']
    sha = O.wrapper_sha(w.body.wrap(O.T_CONTROL, control))
    U.rewrite_progress_all(w, g, U.op_of(adm), lambda r: dict(r, reserved_control_sha256=sha)
                           if r['phase'] == 'body_reserved' else r)
    return w, lambda: w.command.commit(adm)


@case('U-DG5/N/release_receipt_present', 'dgu/body/release/body_committed', SITE + '1271',
      'Single defect: a body-mutation receipt cell exists under the reserved operation receipt key '
      '(copied from a committed operation) while the control is still the exact reserved control, '
      'so the reserved-control joins (:1274/:1279) hold and only :1271 refuses. The authored '
      'release_after_commit case has a committed control, which those joins also refuse.')
def release_receipt_present(d):
    w, g = U._goal(d)
    req1, adm1 = U.run_direct(w, g)
    req2 = O.direct_request(w, g, 'second')
    adm2 = w.command.run(req2, stop_after='reserve')
    sc = g['scope']
    p, goal = sc['project_id'], sc['goal_id']
    prior = w.storage.cell(O.T_RECEIPT, O.receipt_key(p, goal, U.op_of(adm1)))
    w.storage.transact([dict(table=O.T_RECEIPT, key=O.receipt_key(p, goal, U.op_of(adm2)),
                             expected=None, value=copy.deepcopy(prior['value']))])
    control = w.body.read_private(sc, 'o')['control']
    return w, lambda: w.body.release(sc, control, lambda c: [])


@case('U-DG5/N/inspect_event_scope_only', 'dgu/inspect/event_scope', SITE + '1878',
      'Single defect: the inspect request scope names another thread whose keys hold the coherent '
      'copy (with an audit permission granted for that thread), while the event itself stays the '
      'genuine one, so the frozen-producer and custody joins hold and only event_scope (:1878) '
      'refuses. The authored case edits the raw event payload, which the producer join also refuses.')
def inspect_event_scope_only(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm), storage_instance_id=g['scope']['storage_instance_id'],
                        thread_id='thr_TEST_ONLY_other')
    ref = w.permissions.grant(g['user'], fsc, ['audit_goal'])
    r = w.inspector.request_for(fsc, U.event_of(w, g, adm))
    return w, lambda: w.inspector.inspect(r, g['user'], ref)


@case('U-DG5/N/inspect_source_action_only', 'dgu/inspect/source_action', SITE + '1883',
      'Single defect: the source record normalized identity request_ref is substituted and the '
      'progress snapshots rewired to its wrapper sha, so the source join (:1897) and producer join '
      '(:1891) hold and only source_action (:1883) refuses.')
def inspect_source_action_only(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    op = U.op_of(adm)
    key = O.upd_key(O.T_SOURCE, g['scope'], op)
    new = U.rsrc(w, O.T_SOURCE, key, lambda s: dict(
        s, normalized_identity=dict(s['normalized_identity'], request_ref='request:TEST_ONLY:substituted')))
    U.rewrite_progress_all(w, g, op, lambda r: dict(r, source_audit_sha256=O.wrapper_sha(new)))
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_frozen_producer_only', 'dgu/inspect/frozen_producer', SITE + '1891',
      'Single defect: the frozen producer_input payload before_revision is substituted in every '
      'progress snapshot that carries it, so publication and custody joins (:1892/:1893/:1895) hold '
      'and only the frozen-producer join (:1891) refuses.')
def inspect_frozen_producer_only(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    U.rewrite_progress_all(w, g, U.op_of(adm), lambda r: dict(
        r, producer_input=dict(r['producer_input'],
                               payload=dict(r['producer_input']['payload'], before_revision=99)))
        if r['producer_input'] else r)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/freeze_final_head_only', 'dgu/producer/freeze/final_head', SITE + '1776',
      'Single defect at the producer.freeze before_release boundary: the body_committed snapshot '
      'pending_intent_sha256 is substituted (head rewired), so the phase and epoch edges of the '
      'outer advance (:1488/:1489) and its CAS still hold and only final_head (:1776) refuses. The '
      'fault-matrix progress mutation runs a nested freeze, which also breaks those edges.')
def freeze_final_head_only(d):
    w, g, req, adm, ag = U._upto(d, 'commit')
    holder = {}

    def mut(w_, ctx):
        U.rewrite_progress_all(w_, g, U.op_of(adm), lambda r: dict(
            r, pending_intent_sha256='0' * 64) if r['phase'] == 'body_committed' else r)

    U.inject(w, 'producer.freeze', 'before_release', mut, holder)
    return w, lambda: w.producer.freeze(g['scope'], U.op_of(adm)), holder


@case('U-DG5/N/admission_objective_nonstring', 'dgu/text/type', SITE + '204',
      'Single defect after admission: the stored SIR admission request objective_text becomes a '
      'non-string (owner cells are digest-checked only), so capture reaches text_sha (:1537) and '
      'only :204 refuses. The admit-time call (:725) sits behind the request schema.')
def admission_objective_nonstring(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    w.sir.admit(req)
    key = O.hexk(req['command_instance_id'])
    state = w.sir.state(key)
    w.sir.put(key, dict(state, request=dict(state['request'], objective_text=123)))
    return w, lambda: w.command.run(req)


@case('U-DG5/N/key_type_nonstring', 'dgu/key/type', SITE + '196',
      'Single defect: ThreadOwner.birth is called with a non-string project id, so hexk refuses at '
      ':196 before any state read. No authored case passes a non-string key component.')
def key_type_nonstring(d):
    w, g = U._goal(d)
    return w, lambda: w.threads.birth(123, 'thr_TEST_ONLY_other')


@case('U-DG5/N/inspect_sequence_float', 'dgu/inspect/sequence_id/numrule/integer_type',
      'dg5/dgu/inspect/sequence_id/number',
      'Single defect: the inspect request sequence_id is an integral float, which the request '
      'schema integer type admits, so only the exact-integer primitive at :1855 refuses.')
def inspect_sequence_float(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    r['sequence_id'] = float(r['sequence_id'])
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/progress_epoch_float', 'dgu/key/epoch/numrule/integer_type', 'dg5/dgu/key/epoch/number',
      'Single defect: the progress head progress_epoch is resealed as an integral float (the head '
      'schema integer type admits it), so only epoch_key exact integer refuses on the audit read.')
def progress_epoch_float(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    U.rsrc(w, O.T_PROGRESS, O.head_key(g['scope'], U.op_of(adm)),
           lambda rec: dict(rec, progress_epoch=float(rec['progress_epoch'])))
    return w, U._audit_call(w, g, adm)


@case('U-DG5/N/receipt_revision_float', 'dgu/key/revision/numrule/integer_type',
      'dg5/dgu/key/revision/number',
      'Single defect: the body receipt accepted_objective_revision is resealed as an integral '
      'float and the progress body_commit receipt sha rewired to it, so the receipt join holds '
      'and only rev_key exact integer refuses at freeze.')
def receipt_revision_float(d):
    w, g, req, adm, ag = U._upto(d, 'commit')
    sc, op = g['scope'], U.op_of(adm)
    rk = O.receipt_key(sc['project_id'], sc['goal_id'], op)
    new = U.rbody(w, O.T_RECEIPT, rk, lambda r: dict(
        r, accepted_objective_revision=float(r['accepted_objective_revision'])))
    U.rewrite_progress_all(w, g, op, lambda r: dict(
        r, body_commit=dict(r['body_commit'], receipt_sha256=O.wrapper_sha(new))) if r['body_commit'] else r)
    return w, lambda: w.producer.freeze(sc, op)


@case('U-DG5/N/inspect_final_custody', 'dgu/inspect/final_custody', SITE + '1927',
      'Single defect: the acquired snapshot custody schema_version is substituted - a field the '
      'GenericSource custody-defect check does not bind - so every custody join holds and only the '
      'final live-custody equality (:1927) refuses.')
def inspect_final_custody(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    ev = U.event_of(w, g, adm)
    r = w.inspector.request_for(g['scope'], ev)
    snap = w.storage.acquire_source()
    snap['custody'][ev] = dict(snap['custody'][ev], schema_version='9.9.9')
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'], snapshot=snap)


@case('U-DG5/N/no_effect_phase_only', 'dgu/sir/terminal/no_effect_phase', SITE + '843',
      'Single defect: terminalize(no_effect) at source_admitted, where no body receipt and no event '
      'exist yet, so the no-effect receipt/event checks (:844/:846) hold and only :843 refuses. The '
      'authored case publishes first, so all three refuse.')
def no_effect_phase_only(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    w.command.admit_and_capture(req)
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'no_effect')


@case('U-DG5/N/unknown_kind_at_unknown_phase', 'dgu/sir/terminal/unknown_kind',
      (SITE + '862', 'dg5/dgu/sir/terminal/schema'),
      'At a body_unknown progress the unknown-phase check (:863) holds, leaving the kind check '
      '(:862 kind == unknown) and the StorageTerminal schema kind const (unknown branch) as the '
      'same field with the same predicate over one bogus kind. The authored case runs at '
      'event_issued, so :863 also refuses.')
def unknown_kind_at_unknown_phase(d):
    w, g, req, adm, ag = U._upto(d, 'reserve')
    p = U.progress(w, g, U.op_of(adm))
    rec = dict(p, progress_epoch=p['progress_epoch'] + 1, phase='body_unknown')
    w.source.advance(g['scope'], U.op_of(adm), rec, expected_phase=('body_reserved',), where='dg5/probe')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'partially_succeeded')


@case('U-DG5/N/hitl_agent_actor_only', 'dgu/hitl/capture/agent_actor', SITE + '962',
      'Single defect: the proposal points at an agent message posted by another agent actor (same '
      'body), so the proposal actor permission check (:534 through permissions.check on the '
      'proposal actor) holds and only :962 refuses. The authored case changes the proposal actor, '
      'which the permission check also refuses.')
def hitl_agent_actor_only(d):
    def edit(w, g, p):
        am = w.chat.post(g['scope'], 'agent', 'actor:TEST_ONLY:other-agent',
                         dict(kind='goal_update_proposal_message', goal_id=g['scope']['goal_id'],
                              replacement_text=p['target']['objective_text']))
        return dict(p, source_message_id=am)
    return U._prop_variant(d, edit)


@case('U-DG5/N/hitl_foreign_storage_only', 'dgu/hitl/capture/foreign_storage', SITE + '970',
      'Single defect: the proposal target scope storage id is case-folded (well-formed, so :969 '
      'holds) and the stored control storage id is rewired to the same spelling, so the '
      'read_private control-scope join (:1140) holds and only :970 refuses.')
def hitl_foreign_storage_only(d):
    w, g, prop, ap = U._proposal(d, target_storage=lambda sid: sid.upper())
    U.rbody(w, O.T_CONTROL, U.ctl_key(g),
            lambda c: dict(c, storage_instance_id=c['storage_instance_id'].upper()))
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


def _tamper_approval_target(d, edit):
    w, g = U._goal(d)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    new_request = dict(cur['request'], target=edit(dict(cur['request']['target'])))
    digest = O.sha(O.msgpack(new_request))
    w.approvals.put(ag['approval_id'], dict(cur, request=new_request, request_sha256=digest,
                                            resolution=dict(cur['resolution'], request_sha256=digest)))
    return w, U.admitted(w, req)


@case('U-DG5/N/approval_target_scope_only', 'dgu/source/capture/acceptance/approval_target_scope',
      SITE + '1964',
      'Single defect: only the stored approval request target scope goal changes (request sha '
      'rewired), so the instruction attestation (:1973) still matches the update request and only '
      ':1964 refuses.')
def approval_target_scope_only(d):
    return _tamper_approval_target(d, lambda t: dict(t, scope=dict(t['scope'], goal_id='goal:TEST_ONLY:other')))


@case('U-DG5/N/approval_target_text_only', 'dgu/source/capture/acceptance/approval_target_text',
      SITE + '1968',
      'Single defect: only the stored approval request target objective text changes (request sha '
      'rewired), so :1973 still holds and only :1968 refuses.')
def approval_target_text_only(d):
    return _tamper_approval_target(d, lambda t: dict(t, objective_text='other text'))


@case('U-DG5/N/reserve_cancellation_pending_only', 'dgu/body/reserve/cancellation_associated',
      SITE + '1176',
      'Single defect: the control gains a schema-valid cancellation_pending with '
      'cancellation_receipt_ref still null, so the reserved control schema admits the new pending '
      'row and only :1176 refuses. The authored case sets the receipt ref, which the schema then '
      'forbids beside a pending reservation.')
def reserve_cancellation_pending_only(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    sc = g['scope']
    cur = w.body.read_private(sc, 'o')
    body, control = cur['body'], cur['control']
    cp = dict(schema_id='pm.goal.cancel.reservation.v1', schema_version='1.0.0',
              storage_instance_id=sc['storage_instance_id'], project_id=sc['project_id'],
              thread_id=sc['thread_id'], goal_id=sc['goal_id'],
              operation_id='goal-operation:TEST_ONLY:cancel',
              source_audit_sha256='a' * 64, stop_intent_sha256='b' * 64, accepted_user_stop_epoch=0,
              accepted_continuation_epoch=0, expected_revision=body['revision'],
              expected_currentness_hash=body['currentness_hash'], expected_body_semantic_sha256='c' * 64,
              expected_latest_objective_revision=control['latest_objective_revision'],
              expected_latest_revision_hash=control['latest_revision_hash'], original_goal_owner_epoch=0,
              original_sir_source_ref='TEST_ONLY:sir-source',
              original_cancel_authority_ref='TEST_ONLY:cancel-authority')
    U.rbody(w, O.T_CONTROL, U.ctl_key(g), lambda c: dict(c, cancellation_pending=cp))
    return w, lambda: w.command.reserve(adm)


@case('U-DG5/N/reserve_stale_revision_only', 'dgu/body/reserve/stale_goal_revision', SITE + '1179',
      'Single defect: a direct pending with only expected_revision stale (intent resealed, '
      'expected_currentness current), so :1180 holds and only :1179 refuses at body.reserve.')
def reserve_stale_revision_only(d):
    w, g = U._goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)

    def edit(p):
        p = dict(p, expected_revision=p['expected_revision'] + 9)
        p['intent_sha256'] = O.intent_sha(p)
        return p

    p = U._direct_pending(w, g, adm, edit)
    return w, lambda: w.body.reserve(g['scope'], p, lambda c: [])


@case('U-DG5/N/commit_after_currentness_only', 'dgu/body/commit/after_currentness', SITE + '1225',
      'Single defect: the pending after and accepted texts are substituted together (accepted '
      'hash and intent resealed) leaving only after currentness stale, so accepted_text (:1226) '
      'and accepted_hash (:1229) hold and only :1225 refuses.')
def commit_after_currentness_only(d):
    w, g, req, adm, ag = U._upto(d, 'reserve')

    def edit(p):
        p = U._after(lambda a: dict(a, objective_text='substituted'), recompute=False)(p)
        return U._accepted(lambda r: dict(r, objective_text='substituted'))(p)

    U.tamper_pending(w, g, adm, edit)
    return w, lambda: w.command.commit(adm)


@case('U-DG5/N/cancel_after_unknown_terminal', 'dgu/command/cancel/body_effect_exists', SITE + '2185',
      'Single defect: an event_unknown progress with its unknown terminal already published. The '
      'cancel else-branch refuse (:2185) is the only refusal: with it cut, the existing terminal '
      'replays, while the authored after-commit case also breaks the no-effect phase and receipt '
      'checks inside terminalize (:843/:844).')
def cancel_after_unknown_terminal(d):
    w, g, req, adm, ag = U._upto(d, 'freeze')
    w.command.mark_unknown(req['command_instance_id'])
    return w, lambda: w.command.cancel_before_body(req['command_instance_id'])
