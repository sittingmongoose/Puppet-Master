"""DG5 supplement negatives for goal.updated (lead decision 1116061157-ad82, condition 4).

One authored single-defect negative for each owner or shared site that no DG-U case targets. Each
case declares its target here, before it runs: one site, or a duplicate set whose members check the
same field with the same predicate (the reason is written beside it). The judge credits a set only
when its joint cut accepts and each member, with the others cut, still refuses alone.
"""
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
