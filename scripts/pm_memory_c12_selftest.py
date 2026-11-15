#!/usr/bin/env python3
"""Negative tests of the DMEM C12 proof adapter on a real authored payload.

Wrong rows/codes, unrelated exceptions, ineffective cuts and failed restoration
must never earn mutation credit. No frozen guard or NUMRULE source is edited.
"""
from copy import deepcopy
from datetime import datetime, timedelta
from decimal import Decimal
import argparse
import json
from pathlib import Path

import pm_memory_c12 as audit
import pm_memory_c12_entailments as implications


def run(out):
    m = audit.suites.load(audit.ROOT / 'scripts/pm_memory_maintenance_events.py', '_dmem_c12_selftest')
    event = 'memory.dedup_sweep.completed'
    control = next(c['payload'] for c in m.load('Plans/memory_maintenance_event_fixtures.json')['cases']
                   if c['event_type'] == event and c['accepted'])
    validator = m.validator(audit.PAYLOAD, event.replace('.', '_'))
    original_roots, original_controls = audit.roots, audit.candidate_controls
    original_proposals, original_locations, original_outcome = audit.proposals, audit.locations, audit.row_outcome
    audit.roots = lambda *args: [(audit.PAYLOAD, event.replace('.', '_'), ('bd_schema', 'payload_valid', {}))]
    audit.candidate_controls = lambda *args: (validator, [(deepcopy(control), 'real-authored-control')])
    audit.locations = lambda value: [((), value)]
    audit.proposals = lambda value: [('extra-property', {**value, '__c12_unknown__': True}),
                                     ('valid-other-project', {**value, 'project_id': 'other-project'})]
    results = []
    try:
        for defect in ('control', 'wrong-code', 'wrong-row', 'wrong-phase', 'unrelated-error', 'ineffective-cut', 'failed-restoration'):
            calls = [0]
            def outcome(*args):
                actual = original_outcome(*args)
                if '__c12_unknown__' not in args[-1]:
                    return actual
                calls[0] += 1
                if calls[0] == 1:
                    if defect == 'wrong-code':
                        return [actual[0], actual[1], 'unrelated_refusal']
                    if defect == 'wrong-row':
                        return [actual[0], 'unrelated_row', actual[2]]
                    if defect == 'wrong-phase':
                        return ['unrelated_phase', actual[1], actual[2]]
                    if defect == 'unrelated-error':
                        return ['ERROR', 'KeyError', 'unrelated']
                if calls[0] == 2 and defect == 'ineffective-cut':
                    return ['bd_schema', 'BD01_payload_schema', 'invalid_payload']
                if calls[0] == 3 and defect == 'failed-restoration':
                    return ['accepted']
                return actual
            audit.row_outcome = outcome
            folder = out / defect; folder.mkdir(parents=True, exist_ok=True)
            try:
                result = audit.schema_audit(m, event, [], folder, {})
            except AssertionError:
                assert defect != 'control', 'valid proof refused'
                results.append({'case': defect, 'result': 'refused_no_credit'})
            else:
                assert defect == 'control', (defect, 'false mutation credit')
                assert result['exact_kills'] == 1 and result['invalid_proposals'] == 1
                results.append({'case': defect, 'result': 'one_exact_kill_one_invalid'})
            assert m.CUT_ROWS == frozenset(), 'cut leaked after restoration/failure'
    finally:
        audit.roots, audit.candidate_controls = original_roots, original_controls
        audit.proposals, audit.locations, audit.row_outcome = original_proposals, original_locations, original_outcome
    # The singleton adapter preserves the original exact set-of-fields contract.
    m.require('ef_access', permission=True, withdrawn=False)
    try:
        m.require('ef_access', permission=True, withdrawn=False, unexpected=True)
    except KeyError:
        results.append({'case': 'split-extra-field', 'result': 'refused'})
    else:
        raise AssertionError('split accepted undeclared observation')
    # An enlarged closed selector must invalidate the implication bound.
    load = implications.m.load
    def enlarged(path):
        doc = deepcopy(load(path))
        if path == audit.TARGET:
            doc['$defs']['lexical_selector']['properties']['target']['properties']['artifacts']['maxItems'] = 33
        return doc
    try:
        implications.m.load = enlarged
        try:
            implications.ledger()
        except AssertionError:
            results.append({'case': 'stale-selector-cap-implication', 'result': 'refused'})
        else:
            raise AssertionError('enlarged selector kept an invalid cap implication')
    finally:
        implications.m.load = load
    fixtures = m.load('Plans/memory_maintenance_event_fixtures.json')
    m.compose_custody(fixtures['writer_families'], fixtures['checkpoint_families'])
    before = next(f['states']['before'] for f in fixtures['writer_families'] if f['event_type'] == event)
    value = m.canonical_value(before['operation'], 'completed')
    value['sequence_id'] = 10 ** 4399
    try:
        m.append_current(deepcopy(before), value, event)
    except m.TableRefusal as error:
        assert (error.phase, error.row, error.code) == ('ap_uint64', 'AP01_storage_uint64', 'invalid_storage_uint64')
        results.append({'case': '4400-digit-integer-at-complete-writer', 'result': 'exact_storage_uint64_refusal'})
    else:
        raise AssertionError('out-of-u64 sequence accepted')
    archive = audit.suites.load(audit.ROOT / 'scripts/pm_memory_archive_events.py', '_dmem_c12_time_selftest')
    core, policy = archive.core, archive.POLICY
    policy_fixtures = core.load('Plans/memory_card6_policy_fixtures.json')['cases']
    for job, (days, score, _) in policy.CUTOFFS.items():
        good = next(c for c in policy_fixtures if c['job'] == job and 'refusal' not in c and
                    not c.get('candidate_refusal') and 'after' not in c and not c.get('before_edits') and not c.get('after_edits'))
        snapshot = deepcopy(good['before'])
        captured = datetime(2026, 8, 7)
        anchor = (captured - timedelta(days=days)).strftime('%Y-%m-%dT00:00:00')
        snapshot['captured_at'] = '2026-08-07T00:00:00Z'
        for key in snapshot['selected_ids']:
            snapshot['memories'][key].update(created_at=anchor + 'Z', updated_at=anchor + 'Z',
                                             last_access_at=anchor + 'Z', usefulness_score=score - Decimal('0.0001'))
        archive.archive_candidate(deepcopy(snapshot), job)
        results.append({'case': job + '-exact-idle-threshold', 'result': 'accepted'})
        younger = deepcopy(snapshot)
        # This remains a valid owner timestamp and has no precision cap. It is
        # one exact rational tick too recent, even beyond 4,400 fraction digits.
        key = younger['selected_ids'][0]
        younger['memories'][key]['last_access_at'] = anchor + '.' + '0' * 4400 + '1Z'
        try:
            archive.archive_candidate(younger, job)
        except core.TableRefusal as error:
            assert (error.phase, error.row, error.code) == ('ps_age', 'PS05_age', 'selection_age')
            results.append({'case': job + '-4401-digit-fraction-one-tick-young', 'result': 'exact_selection_age_refusal'})
        else:
            raise AssertionError('policy instant precision lost')
        score_edge = deepcopy(snapshot)
        score_edge['memories'][key]['usefulness_score'] = score
        try:
            archive.archive_candidate(score_edge, job)
        except core.TableRefusal as error:
            assert (error.phase, error.row, error.code) == ('ps_score', 'PS07_score', 'selection_score')
            results.append({'case': job + '-exact-score-threshold', 'result': 'exact_selection_score_refusal'})
        else:
            raise AssertionError('exclusive score cutoff weakened')
    return {'status': 'pass', 'cases': results}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args(); args.out.mkdir(parents=True, exist_ok=True)
    result = run(args.out)
    (args.out / 'summary.json').write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
