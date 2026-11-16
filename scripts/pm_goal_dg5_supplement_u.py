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


@case('U-DG5/N/stale_revision_only', 'dgu/source/capture/stale_goal_revision', SITE + '1505',
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
      (SITE + '1946', 'dg5/dgu/source/capture/input/schema'),
      "Single defect after admission (the authored U5/G/acceptance_* pattern): the stored SIR admission's direct-route "
      'request gains a source_message_id. Direct Save acceptance (:1946) requires source_message_id null, and the '
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
    # Lead decision 1116073727-d098 condition 2: reach :1039 alone with an out-of-enum decision. ApprovalOwner
    # cells are read back through _decode_cell, which checks value_sha256 only (no ApprovalResolution schema),
    # so a coherently re-put stored resolution (the authored w.sir.put pattern) skips the :1018 schema check.
    w = U.world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'x', decide='approved')
    state = w.approvals.state(req['approval_id'])
    w.approvals.put(req['approval_id'], dict(state, resolution=dict(state['resolution'], decision='withheld')))
    return w, U.admitted(w, req)


case('U-DG5/N/approval_decision_out_of_enum', 'dgu/source/capture/acceptance/approval_decision', SITE + '1039',
     "ApprovalResolution.decision 'withheld' (outside {approved, denied, expired}) passes :1037 and :1038 and is "
     'refused by :1039 alone; reached through a stored resolution that the owner reads without its schema.')(
    _approval_out_of_enum)


@case('U-DG5/N/approval_request_bytes_created_at', 'dgu/source/capture/acceptance/approval_request_bytes', SITE + '1033',
      "Single defect: the stored approval request's created_at_utc changes (still a valid date-time) while its "
      'request_sha256 stays, so only the request-bytes commitment (:1033) refuses. The authored '
      'U5/G/acceptance_approval_request_bytes changes instruction_message_id, which later checks also read.')
def approval_request_bytes_created_at(d):
    w, g = U._goal(d)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    w.approvals.put(ag['approval_id'], dict(cur, request=dict(cur['request'], created_at_utc='2026-01-01T00:00:00.000Z')))
    return w, U.admitted(w, req)


@case('U-DG5/N/approval_expired_at_read', 'dgu/source/capture/acceptance/approval_expired', SITE + '1042',
      'Single defect: the stored approval request expires in the past, with its request_sha256 recomputed in '
      'both the cell and the resolution, so the request-bytes (:1033) and request-commitment (:1036) checks '
      'hold and only the expiry-at-read check (:1042) refuses. No authored case sets expires_at_utc.')
def approval_expired_at_read(d):
    w, g = U._goal(d)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    new_request = dict(cur['request'], expires_at_utc='2020-01-01T00:00:00.000Z')
    digest = O.sha(O.msgpack(new_request))
    w.approvals.put(ag['approval_id'], dict(cur, request=new_request, request_sha256=digest,
                                            resolution=dict(cur['resolution'], request_sha256=digest)))
    return w, U.admitted(w, req)


@case('U-DG5/N/installation_graph_substituted', 'dgu/oracle/installation_graph', SITE + '496',
      'Single defect: the installed installation cell carries a foreign resource-graph digest while its '
      'state stays installed, so require_installed passes its presence check (:495) and only the graph '
      'commitment (:496) refuses.')
def installation_graph_substituted(d):
    w, g = U._goal(d)
    cur = w.installation.current()
    w.installation.put('current', dict(cur, installed_resource_graph_sha256='0' * 64))
    return w, lambda: w.installation.require_installed('dgu/oracle')


@case('U-DG5/N/publication_event_substituted', 'dgu/inspect/publication_event', SITE + '1885',
      'Single defect: every progress snapshot is coherently re-sealed with only its publication event_id '
      'changed, so the frozen producer join (:1884) still holds and only the publication-to-event join '
      '(:1885) refuses. The authored frozen-id case edits producer_input, which later joins also read.')
def publication_event_substituted(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    U.rewrite_progress_all(w, g, U.op_of(adm), lambda rec: dict(
        rec, publication=dict(rec['publication'], event_id='goal.updated.v1:' + 'a' * 64))
        if rec['publication'] else rec)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_unknown_event', 'dgu/inspect/event_unavailable', SITE + '1861',
      'The authored U4/N/unknown_event makes exactly this call, but its expected code maps by literal '
      'template to request_for (:1835), so the inspect refusal at :1861 was recorded as another refusal '
      'and never judged. This case declares :1861 itself.')
def inspect_unknown_event(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    r['event_id'] = 'goal.updated.v1:' + '0' * 64
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/history_without_first_revision', 'dgu/reader/body/missing_history', SITE + '1151',
      'Single defect: a two-revision history loses revision 1 (and its origin) while revision 2 is coherently '
      're-sealed with no prior and the control head names it, so the chain (:1144), origin join and accepted head '
      '(:1152) all hold and only the first-revision check (:1151) refuses. The authored U5/G/reader_missing_history '
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


@case('U-DG5/N/owner_identity_substituted', 'dgu/physical/owner_identity', SITE + '674',
      'Single defect: only the stored body row owner_identity_sha256 changes; the record, its value_sha256 '
      'and every semantic join stay valid, so only the owner-identity commitment (:674) refuses. The authored '
      'row_copied_to_other_key also breaks the history joins the copied record carries.')
def owner_identity_substituted(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    U.rewrite_raw(w, O.T_BODY, bkey, lambda row: dict(row, owner_identity_sha256='0' * 64))
    return w, U.body_read(w, g)


@case('U-DG5/N/value_sha_substituted', 'dgu/physical/value_sha256', SITE + '681',
      'Single defect: only the stored body row value_sha256 changes; the inline record bytes are untouched, '
      'so with :681 cut the same record decodes and every later join holds. The authored incoherent-tamper '
      'case edits the record, which the currentness and objective joins also refuse.')
def value_sha_substituted(d):
    w, g = U._goal(d)
    U.run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    U.rewrite_raw(w, O.T_BODY, bkey, lambda row: dict(row, value_sha256='0' * 64))
    return w, U.body_read(w, g)


@case('U-DG5/N/inspect_source_defect', 'dgu/inspect/source_defect', SITE + '1860',
      'Single defect in the acquired source snapshot: first custody group_digest is substituted, so '
      'GenericSource halts before that event (a custody defect at its position) and the inspected event '
      'has no row. Only :1860 selects the source_defect code for that state; see the written proof in '
      'pm_goal_dg5_proofs_u.py (with :1860 cut, :1861 still refuses).')
def inspect_source_defect(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    ev = U.event_of(w, g, adm)
    r = w.inspector.request_for(g['scope'], ev)
    snap = w.storage.acquire_source()
    snap['custody'][ev] = dict(snap['custody'][ev], group_digest='0' * 64)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'], snapshot=snap)


@case('U-DG5/N/inspect_custody_pending_issued', 'dgu/inspect/original_custody_unavailable', SITE + '1866',
      'Single defect: the acquired snapshot carries no first custody for an issued event (pending custody), '
      'so the progress is event_issued and only the custody presence check (:1866) refuses. The authored '
      'pending_first_custody case stops before publication, so the not-issued refusal (:1882) also applies.')
def inspect_custody_pending_issued(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    ev = U.event_of(w, g, adm)
    r = w.inspector.request_for(g['scope'], ev)
    snap = w.storage.acquire_source()
    del snap['custody'][ev]
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'], snapshot=snap)


FOREIGN = '11111111-1111-4111-8111-111111111111'


def _foreign_copy(w, g, op, with_input=False):
    """A coherent copy of the operation's source (and input) and head progress rows under a
    foreign storage scope: same owner physical() rebuild at the foreign keys, snapshot and head
    commitments rewired to the copied source wrapper."""
    sc = g['scope']
    fsc = dict(sc, storage_instance_id=FOREIGN)
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
                 lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=FOREIGN)))
    src_sha = O.wrapper_sha(src)
    if with_input:
        copied(O.T_INPUT, O.upd_key(O.T_INPUT, sc, op), O.upd_key(O.T_INPUT, fsc, op),
               lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=FOREIGN,
                                               source_audit_sha256=src_sha)))
    head_cell = w.storage.cell(O.T_PROGRESS, O.head_key(sc, op))
    head = owner.unwrap_row(O.T_PROGRESS, O.head_key(sc, op), head_cell['value'], owner.ROOTS[O.T_PROGRESS])
    epoch = head['record']['progress_epoch']
    snap = copied(O.T_PROGRESS, O.epoch_key(sc, op, epoch), O.epoch_key(fsc, op, epoch),
                  lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=FOREIGN,
                                                  source_audit_sha256=src_sha)))
    snap_sha = O.wrapper_sha(snap)
    copied(O.T_PROGRESS, O.head_key(sc, op), O.head_key(fsc, op),
           lambda wr: dict(wr, record=dict(wr['record'], storage_instance_id=FOREIGN,
                                           snapshot_sha256=snap_sha)))
    w.storage.transact(writes)
    return fsc


@case('U-DG5/N/audit_foreign_coherent', 'dgu/reader/audit/foreign_storage', SITE + '1633',
      'Single defect: the audit request names a foreign storage whose keys hold a coherent copy of the '
      'operation (source, head and last snapshot rewired), so only the foreign-storage check (:1633) '
      'refuses; the authored case names a foreign storage with no rows, so the source lookup also refuses.')
def audit_foreign_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm))
    r = dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=U.op_of(adm),
             selection=dict(kind='current_progress'), **fsc)
    return w, lambda: w.source.read_audit(r, g['user'], g['user_permission'])


@case('U-DG5/N/input_foreign_coherent', 'dgu/reader/input/foreign_storage', SITE + '1685',
      'Single defect: as audit_foreign_coherent, with the input row copied too, for the input reader '
      'foreign-storage check (:1685).')
def input_foreign_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm), with_input=True)
    r = dict(reader_binding='reader.goal.update_input@1.0.0', operation_id=U.op_of(adm), **fsc)
    return w, lambda: w.source.read_input_content(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_foreign_coherent', 'dgu/inspect/foreign_storage', SITE + '1851',
      'Single defect: the inspect request is built for a foreign storage holding the coherent copy, '
      'so only the inspector foreign-storage check (:1851) refuses; the authored case has no foreign rows.')
def inspect_foreign_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    fsc = _foreign_copy(w, g, U.op_of(adm))
    r = w.inspector.request_for(fsc, U.event_of(w, g, adm))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U-DG5/N/inspect_progress_not_issued_coherent', 'dgu/inspect/original_custody_unavailable', SITE + '1882',
      'Single defect: the issued progress snapshot is coherently re-sealed back to event_ready with no '
      'publication, while the event and its first custody stay in the source, so custody is present '
      '(:1866 holds) and only the not-issued refusal (:1882) fires.')
def inspect_progress_not_issued_coherent(d):
    w, g = U._goal(d)
    req, adm = U.run_direct(w, g)
    r = w.inspector.request_for(g['scope'], U.event_of(w, g, adm))
    U.rewrite_progress_all(w, g, U.op_of(adm), lambda rec: dict(
        rec, phase='event_ready', publication=None) if rec['phase'] == 'event_issued' else rec)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])
