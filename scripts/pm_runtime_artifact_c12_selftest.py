#!/usr/bin/env python3
"""Self-tests of the DR C12 accounting: each must refuse credit it could wrongly give.

They run the real checker on one family (default document). Each test builds a
case the C12 rules must NOT credit (wrong row, unisolated error, ineffective
cut, failed restoration, a read that mutates its store or creates a receipt)
and asserts the accounting refuses it, plus one control the rules do credit.
"""
import argparse
import copy
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_runtime_artifact_c12 as c12  # noqa: E402

dr = c12.dr


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', default='runtime_artifact.document')
    args = parser.parse_args()
    fixtures = dr.load('Plans/runtime_artifact_event_drafts.fixtures.json')
    row = next(r for r in dr.load('Plans/runtime_artifact_event_drafts.json')['rows'] if r['event_type'] == args.family)
    full = copy.deepcopy(fixtures['positive_events'][args.family])
    payload = full['payload']
    tv = dr.validator(dr.load(row['payload_schema_ref']))
    root = dr.load(row['payload_schema_ref'])
    results = []

    def test(name, passed):
        results.append(dict(test=name, passed=bool(passed)))

    def route(instance):
        event = copy.deepcopy(full)
        event['payload'] = instance
        return lambda: dr.decode(row, event, {})

    # 1. Control: a missing required member is credited at S07, isolated to 'required'.
    missing = dict(payload)
    del missing['artifact_id']
    ok, _ = c12.isolated(tv, missing, 'required', 'S07_structural', (), root)
    test('control_required_isolated_and_exact', ok and tv.refusal(missing) == ('schema.case', 'S07_structural', 'schema_structural'))
    # 2. Two simultaneous defects are never isolated.
    double = dict(missing, c12_unexpected=True)
    ok, count = c12.isolated(tv, double, 'required', 'S07_structural', (), root)
    test('two_defects_not_isolated', not ok and count == 2)
    # 3. The right refusal at the wrong declared row earns nothing (date-time declared, structural observed).
    test('wrong_row_not_credited', tv.refusal(missing) != ('schema.case', 'S08_date_time', 'schema_date_time'))
    # 4. A date-time defect is S08 alone: S07 isolation of it must fail (no stock date-time format).
    bad_time = dict(payload, created_at_utc='2026-07-02T24:00:00Z')
    ok, count = c12.isolated(tv, bad_time, 'format', 'S07_structural', ('created_at_utc',), root)
    test('datetime_not_structural', not ok)
    # 5. A complete route refused first by the declared row, accepted with that row cut, then restored.
    expected = ['schema.case', 'S07_structural', 'schema_structural']
    result, first, _ = c12.run_route(route(missing))
    cut, restored = c12.cut_and_restore(route(missing), 'schema.case', 'S07_structural', expected)
    test('boundary_first_refusal_exact', first == expected and not c12.accepted_result(result))
    test('boundary_cut_is_reported_not_credited_when_later_refusal', cut != 'accepted' or restored)
    # 6. An ineffective cut (a row that is not the first refusal) cannot restore to an exact kill.
    cut, restored = c12.cut_and_restore(route(missing), 'schema.case', 'S08_date_time', expected)
    test('ineffective_cut_not_a_kill', cut != 'accepted')
    # 7. A failed restoration is detected: compare against a refusal the restored route does not give.
    _, restored = c12.cut_and_restore(route(missing), 'schema.case', 'S07_structural', ['schema.case', 'S02_identifier_fullmatch', 'x'])
    test('failed_restoration_detected', restored is False)
    # 8. Store snapshot detects any byte change, including bytes/float/int representation.
    store = dict(original=copy.deepcopy(full), packs={'d': dict(body=b'x', durable=True)})
    before = c12.store_digest(store)
    store['packs']['d']['body'] = b'y'
    test('store_snapshot_detects_pack_change', c12.store_digest(store) != before)
    a, b = dict(v=1), dict(v=1.0)
    test('store_snapshot_separates_int_and_float', c12.store_digest(a) != c12.store_digest(b))
    # 9. Receipt creation during a read is detected.
    store = dict(original=dict(result={}))
    count = c12.receipt_count(store)
    store['original']['result']['first_append_receipt'] = {}
    test('receipt_creation_detected', c12.receipt_count(store) == count + 1)
    # 10. Proposals are named before evaluation: each carries its target keyword and expected row.
    proposals = c12.proposals('required', {'required': ['artifact_id']}, payload)
    test('proposal_declares_target_and_row', proposals and proposals[0][0] == 'required' and proposals[0][2] == 'S07_structural')
    # 11. A historical edition has no integer-slot row: an integral float there is not an N01 kill.
    hist = dr.validator(dr.load(row['payload_schema_ref']), validation=dr.HISTORICAL_V1)
    test('historical_edition_has_no_integer_slot_rule', hist.integer_slot is None)
    status = 'pass' if all(r['passed'] for r in results) else 'fail'
    print(json.dumps(dict(status=status, family=args.family, tests=results), indent=1))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
