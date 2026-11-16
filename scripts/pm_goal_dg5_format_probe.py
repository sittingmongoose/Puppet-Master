#!/usr/bin/env python3
"""DG5: compare a genuine Goal update read with its owner format assertions.

The mutation keeps the complete physical wrapper and every body/control
commitment coherent. It changes only the current body's updated_at value.
Nothing patches a source owner, schema, validator, recipe or private custody.
This is a TEST_ONLY conformance probe, never a native execution claim.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import tempfile

import pm_goal_dg_u_owners as owner
import pm_goal_dg_u_oracles as suite
import pm_goal_test_owner_adapters as adapters

EXPECTED_REFUSAL = 'dgu/physical/logical/schema/record/updated_at'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def snapshot(storage):
    value = storage.snapshot()
    # A transient id is freshly issued for every observation; it is not store
    # state and is never persisted in a checkpoint or a retained snapshot.
    value.pop('snapshot_id')
    return value


def invalid_current_body(work):
    """One defect, with the physical wrapper and all commitments coherent."""
    selection, bad = suite.verify_selection()
    if bad:
        raise ValueError({'selection_pin_mismatch': bad})
    w = owner.World(work / 'world')
    goal = owner.birth_goal(w)
    scope = goal['scope']
    w.body.read_private(scope, 'dg5/control')
    body_key = owner.body_key(scope['project_id'], scope['goal_id'])
    ctl_key = owner.control_key(scope['project_id'], scope['goal_id'])
    before = snapshot(w.storage)

    def body_edit(wrapper):
        record = dict(wrapper['record'], updated_at='not-a-date')
        record['currentness_hash'] = owner.currentness(record)
        return dict(wrapper, record=record)

    body_wrapper = suite.rewrite(w, w.body, owner.T_BODY, body_key, body_edit,
                                logical_root=w.body.ROOTS[owner.T_BODY])
    body = body_wrapper['record']
    suite.rewrite(w, w.body, owner.T_CONTROL, ctl_key,
                  lambda wrapper: dict(wrapper, record=dict(
                      wrapper['record'], currentness_hash=body['currentness_hash'],
                      body_sha256=owner.body_bytes_sha(body))),
                  logical_root=w.body.ROOTS[owner.T_CONTROL])
    mutated = snapshot(w.storage)
    return w, scope, before, mutated, body_wrapper


def run(work):
    selection, bad = suite.verify_selection()
    if bad:
        raise ValueError({'selection_pin_mismatch': bad})
    w, scope, before, mutated, body_wrapper = invalid_current_body(work)
    errors = w.update_bank.errors(w.body.ROOTS[owner.T_BODY], body_wrapper)
    format_errors = [dict(path=list(e.absolute_path), keyword=e.validator,
                          cause=adapters.refusal_code(e.cause)) for e in errors
                     if e.validator == 'format']
    try:
        read = w.body.read_private(scope, 'dg5/format')
    except (owner.Refusal, adapters.AdapterRefusal) as error:
        result = dict(accepted=False, refusal=adapters.refusal_code(error))
    else:
        result = dict(accepted=True, observed_updated_at=read['body']['updated_at'])
    result.update(
        qualification='TEST_ONLY', native_execution='NOT_RUN',
        family='goal.updated', case='coherent_current_body_invalid_updated_at',
        declared_target='GoalBodyRecordV2/properties/updated_at/format',
        selection=selection['compatibility_selection'],
        selection_path=str(suite.SELECTION.relative_to(owner.ROOT)),
        selection_sha256=sha(suite.SELECTION.read_bytes()),
        read_store_unchanged=snapshot(w.storage) == mutated,
        expected_refusal=EXPECTED_REFUSAL,
        format_errors=format_errors,
        baseline_store_sha256=adapters.observation_digest(before),
        mutated_store_sha256=adapters.observation_digest(mutated),
        body_wrapper=body_wrapper,
    )
    return result


def selftest(s, work):
    """Standing negative plus owner-bound comparisons to the pinned call."""
    w, scope, _before, mutated, wrapper = invalid_current_body(work / 'dg5')
    errors = w.update_bank.errors(w.body.ROOTS[owner.T_BODY], wrapper)
    def exact_format():
        assert len(errors) == 1
        error = errors[0]
        assert list(error.absolute_path) == ['record', 'updated_at']
        assert error.validator == 'format' and error.cause.reason == 'date_time_syntax'
    s.positive('formats', 'dg5_exact_updated_at_format', exact_format)
    s.negative('formats', 'dg5_coherent_current_body_invalid_updated_at',
               lambda: w.body.read_private(scope, 'dg5/format'), EXPECTED_REFUSAL)
    s.positive('formats', 'dg5_refusal_preserves_store', lambda: _equal(snapshot(w.storage), mutated))

    nr = owner.NR
    bank = w.update_bank
    corpus = json.loads((owner.ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    event = corpus['inventory_datetime_resources']['storage-node-002']['baseline']
    event_root = owner.EVENT_URI
    bank.validate(event_root, event)
    approvals = owner.World(work / 'approval-world')
    goal = owner.birth_goal(approvals)
    _request, approval = owner.agent_request(approvals, goal, 'Format profile control')
    approval_state = approvals.approvals.state(approval['approval_id'])
    request_root = owner.CONTRACTS_URI + '#/$defs/ApprovalRequest'
    resolution_root = owner.CONTRACTS_URI + '#/$defs/ApprovalResolution'
    bank.validate(request_root, approval_state['request'])
    bank.validate(resolution_root, approval_state['resolution'])
    targets = [
        ('updated_at', owner.BODY_URI + '#/$defs/body/properties/updated_at', None, nr.DT.EVENT_RECORD),
        ('acknowledged_at_utc', 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0'
         + '#/$defs/AppendReceipt/properties/acknowledged_at_utc', None, nr.DT.EVENT_RECORD),
        ('occurred_at_utc', event_root, event, nr.DT.EVENT_RECORD),
        ('observed_at_utc', event_root, event, nr.DT.STORAGE_UTC_Z),
        ('persisted_at_utc', event_root, event, nr.DT.STORAGE_UTC_Z),
        ('created_at_utc', request_root, approval_state['request'], nr.DT.COORDINATION_UTC_Z),
        ('expires_at_utc', request_root, approval_state['request'], nr.DT.COORDINATION_UTC_Z),
        ('decided_at_utc', resolution_root, approval_state['resolution'], nr.DT.COORDINATION_UTC_Z),
    ]
    import copy
    for row in corpus['cases']:
        if row.get('op') != 'datetime':
            continue
        for field, root, base, profile in targets:
            value = row['value']
            try:
                nr.DT.date_time(value, profile=profile)
                accepted = True
            except nr.NumRefusal:
                accepted = field == 'expires_at_utc' and value is None
            subject = value if base is None else dict(copy.deepcopy(base), **{field: value})
            def compare(root=root, subject=subject, accepted=accepted):
                _equal(not bank.errors(root, subject), accepted)
            s.positive('formats', row['id'] + '/' + field + '/' + profile, compare)


def _equal(actual, expected):
    assert actual == expected, (actual, expected)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--work', type=Path, required=True)
    args = parser.parse_args()
    args.work.mkdir(parents=True, exist_ok=True)
    import shutil
    work = Path(tempfile.mkdtemp(prefix='format-', dir=args.work))
    try:
        result = run(work)
        args.out.write_text(json.dumps(result, indent=2, ensure_ascii=True) + '\n')
        print(json.dumps({k: v for k, v in result.items() if k != 'body_wrapper'}))
        return int(result['accepted'] or result.get('refusal') != EXPECTED_REFUSAL
                   or not result['read_store_unchanged']
                   or result['format_errors'] != [dict(path=['record', 'updated_at'], keyword='format',
                                                      cause='date_time_syntax')])
    finally:
        shutil.rmtree(work)


if __name__ == '__main__':
    raise SystemExit(main())
