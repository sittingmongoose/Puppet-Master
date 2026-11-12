#!/usr/bin/env python3
"""Build the DF fix-round-1 fixture cases (Opus recheck of sweep part 2B: DF-1, DF-N1, DF-N2, DF-N3).

Usage: python3 scripts/pm-filesafe-fix1-cases.py [--write | --check]

Every case is built from a named valid seed with the p2a builder's rebuild()
(scripts/pm-filesafe-p2a-cases.py): one fact changes and every copy that is not
the defect moves with it (source commitment, selected-source bank copy, bodies,
custody digests, issued and retained-boundary copies).

Plans/filesafe_event_contract_fixtures.json
  DF-1   filesafe.destructive_override_granted: the Project positive with the
         application positive's authorized_scope (semantic layer, refused by OS01 alone).
  DF-N1  per family: positive_payloads[1] with ts 0000-02-01T10:00:00Z, accepted
         (the nine former *.sweep1.format.year_zero schema negatives).
Plans/filesafe_event_authority_fixtures.json (appended, so existing indices hold)
  DF-N1  <family>.p2bfix1.format.year_zero: positive 1 with observed_at_utc
         0000-02-01T10:00:00Z (the former materialization and .issued negatives);
         every positive is checked on materialization, issued and the retained boundary.
  DF-N2  <family>.p2bfix1.format.offset_ts (Project seed, +01:00) and
         <family>.p2bfix1.format.lowercase_ts (application seed, lowercase t and z):
         ts, occurred_at_utc, the source ts and every copy of that instant carry
         the same spelling.
  DF-N3  <family>.p2bfix1.format.persisted_offset (materialization, +00:00) and
         <family>.p2bfix1.format.persisted_lowercase.issued (issued layer, lowercase t and z):
         persisted_at_utc refused by date_time_storage.
--check exits 1 when a fixture is stale or a case no longer has its outcome.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_filesafe_event_authority as A  # noqa: E402
import pm_filesafe_event_contracts as C  # noqa: E402
import pm_filesafe_tables as tables  # noqa: E402

_spec = importlib.util.spec_from_file_location('pm_filesafe_p2a_builder', ROOT / 'scripts/pm-filesafe-p2a-cases.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)

CONTRACT = ROOT / 'Plans/filesafe_event_contract_fixtures.json'
AUTHORITY = ROOT / 'Plans/filesafe_event_authority_fixtures.json'
YEAR_ZERO = '0000-02-01T10:00:00Z'
SEED_TS = '2026-11-04T12:00:00Z'
OFFSET_TS = '2026-11-04T13:00:00+01:00'
LOWER_TS = '2026-11-04t12:00:00z'
PERSISTED_OFFSET = '2026-11-04T12:00:02+00:00'
PERSISTED_LOWER = '2026-11-04t12:00:02z'
OS01_CASE = 'filesafe.destructive_override_granted.p2bfix1.override-scope-kind'
STORAGE = ('observed_at_utc', 'persisted_at_utc')


def dump(value):
    return json.dumps(value, indent=2, ensure_ascii=False) + '\n'


def slug(family):
    return family.replace('.', '_')


# ----------------------------------------------------------------- contract fixture
def contract_cases(pack):
    pack = copy.deepcopy(pack)
    for row in pack['families']:
        family = row['event_type']
        row['negative_payloads'] = [c for c in row['negative_payloads'] if c['case_id'] != OS01_CASE]
        if family == 'filesafe.destructive_override_granted':
            payload = copy.deepcopy(row['positive_payloads'][0])
            payload['authorized_scope'] = copy.deepcopy(row['positive_payloads'][1]['authorized_scope'])
            row['negative_payloads'].append({'case_id': OS01_CASE, 'layer': 'semantic', 'payload': payload})
        year_zero = dict(copy.deepcopy(row['positive_payloads'][1]), ts=YEAR_ZERO)
        row['positive_payloads'] = [p for p in row['positive_payloads'] if p.get('ts') != YEAR_ZERO] + [year_zero]
    return pack


def contract_failures(pack):
    """Every new case has its outcome through the contract CLI boundary."""
    failures = []
    for row in pack['families']:
        family = row['event_type']
        validator = C.payload_validator(family)
        for payload in row['positive_payloads']:
            if payload.get('ts') == YEAR_ZERO and C.payload_failures(family, payload, 'semantic', validator):
                failures.append(f'{family}:year_zero_positive_refused')
        for case in row['negative_payloads']:
            if case['case_id'] != OS01_CASE:
                continue
            previous = tables.RECORDER
            tables.RECORDER = records = []
            try:
                outcome = C.payload_failures(family, case['payload'], case['layer'], validator)
            finally:
                tables.RECORDER = previous
            refused = [(r[0], [n for n, _ in r[2]]) for r in records if r[2]]
            if outcome != ['payload_semantics'] or refused != [('override_scope_kind', ['OS01_kind'])]:
                failures.append(f'{case["case_id"]}:not_OS01_alone:{outcome}:{refused}')
    return failures


# ----------------------------------------------------------------- authority fixture
def respell(candidate, old, new):
    """Every copy of one instant takes the new spelling; Storage-assigned fields are not copies."""
    def walk(node):
        if isinstance(node, dict):
            for key, value in node.items():
                if isinstance(value, str) and value == old and key not in STORAGE:
                    node[key] = new
                else:
                    walk(value)
        elif isinstance(node, list):
            for index, value in enumerate(node):
                if isinstance(value, str) and value == old:
                    node[index] = new
                else:
                    walk(value)
    walk(candidate['source'])
    walk(candidate['event'])


def built(family, seed, change):
    index = B.seeds(family)[seed]
    base = B.P.seed(family, index)
    candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
    change(candidate, bank)
    B.rebuild(family, candidate, bank)
    return index, base, candidate, bank


def authority_cases(pack):
    pack = copy.deepcopy(pack)
    for row in pack['families']:
        family = row['event_type']
        name = slug(family)
        row['positive'] = [c for c in row['positive'] if '.p2bfix1.' not in c['id']]
        row['negative'] = [c for c in row['negative'] if '.p2bfix1.' not in c['id']]
        B.P._PACK['pack'] = {'families': [dict(r, positive=[c for c in r['positive'] if '.p2bfix1.' not in c['id']])
                                          for r in pack['families']]}
        positives = []

        def year_zero(c, b):
            c['event']['observed_at_utc'] = YEAR_ZERO
        _, _, candidate, bank = built(family, 'original_application_1', year_zero)
        positives.append({'id': f'{name}.p2bfix1.format.year_zero', 'candidate': candidate, 'bank': bank})
        _, _, candidate, bank = built(family, 'original_project_0', lambda c, b: respell(c, SEED_TS, OFFSET_TS))
        positives.append({'id': f'{name}.p2bfix1.format.offset_ts', 'candidate': candidate, 'bank': bank})
        _, _, candidate, bank = built(family, 'original_application_1', lambda c, b: respell(c, SEED_TS, LOWER_TS))
        positives.append({'id': f'{name}.p2bfix1.format.lowercase_ts', 'candidate': candidate, 'bank': bank})
        row['positive'] += positives
        for seed, value, layer, tag in (('original_project_0', PERSISTED_OFFSET, None, 'persisted_offset'),
                                        ('original_application_1', PERSISTED_LOWER, 'issued', 'persisted_lowercase.issued')):
            def persisted(c, b, value=value):
                c['event']['persisted_at_utc'] = value
            index, base, candidate, bank = built(family, seed, persisted)
            case = {'id': f'{name}.p2bfix1.format.{tag}', 'positive_index': index,
                    'edits': B.edits_between(base['candidate'], candidate, 'candidate') + B.edits_between(base['bank'], bank, 'bank'),
                    'expected_error': 'date_time_storage'}
            if layer:
                case['layer'] = layer
            row['negative'].append(case)
    B.P._PACK.clear()
    return pack


def authority_failures(pack):
    failures = []
    for row in pack['families']:
        family = row['event_type']
        for case in row['positive']:
            if '.p2bfix1.' not in case['id']:
                continue
            found = A.materialization_failures(family, case['candidate'], case['bank'])
            expected = {k: case['candidate'][k] for k in ('event', 'custody')}
            for stored in ('issued', 'retained_boundary'):
                found += A.issued_failures(family, case['bank'][stored].get(expected['event']['event_id']), expected, case['bank'])
            if found:
                failures.append(f'{case["id"]}:positive_refused:{found}')
        for case in row['negative']:
            if '.p2bfix1.' not in case['id']:
                continue
            base = row['positive'][case['positive_index']]
            candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
            for edit in case['edits']:
                A.mutate(candidate if edit['target'] == 'candidate' else bank, edit['path'], edit.get('value'), edit.get('remove', False))
            previous = tables.RECORDER
            tables.RECORDER = records = []
            try:
                if case.get('layer') == 'issued':
                    expected = {k: candidate[k] for k in ('event', 'custody')}
                    found = A.issued_failures(family, bank['issued'].get(candidate['event']['event_id']), expected, bank)
                else:
                    found = A.materialization_failures(family, candidate, bank)
            finally:
                tables.RECORDER = previous
            refused = [(r[0], [n for n, _ in r[2]]) for r in records if r[2]]
            if found != ['date_time_storage'] or refused != [('date_time_storage', ['DT02_storage'])]:
                failures.append(f'{case["id"]}:not_DT02_alone:{found}:{refused}')
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale, failures = [], []
    contract = contract_cases(json.loads(CONTRACT.read_text()))
    authority = authority_cases(json.loads(AUTHORITY.read_text()))
    for path, value in ((CONTRACT, contract), (AUTHORITY, authority)):
        if dump(value) != path.read_text():
            stale.append(str(path.relative_to(ROOT)))
            if args.write:
                path.write_text(dump(value))
    failures += contract_failures(contract) + authority_failures(authority)
    for failure in failures:
        print('FAIL', failure)
    counts = {row['event_type']: {'contract_positive': len(row['positive_payloads'])} for row in contract['families']}
    for row in authority['families']:
        counts[row['event_type']].update(positive=len(row['positive']), negative=len(row['negative']))
    print(json.dumps({'stale': stale, 'failures': len(failures), 'counts': counts}, indent=1))
    if args.check:
        return 1 if stale or failures else 0
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
