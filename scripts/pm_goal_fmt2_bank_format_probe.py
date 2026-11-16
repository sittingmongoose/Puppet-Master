#!/usr/bin/env python3
"""T251 standing OriginalBank/DiagnosticBank date-time controls (TEST_ONLY)."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path

import pm_goal_dg_s_world as W
import pm_goal_test_numrule as NR
from pm_goal_own_c_roots import OriginalBank
from pm_goal_own_c_oracles import Validator, FORMAT


def error_shape(error):
    return dict(path=list(error.absolute_path), schema_path=list(error.absolute_schema_path),
                keyword=error.validator, value=error.validator_value, message=error.message,
                context=[error_shape(child) for child in error.context])


def shared_accepts(value, profile):
    try:
        NR.DT.date_time(value, profile=profile)
    except NR.NumRefusal:
        return False
    return True


class Checks:
    def __init__(self):
        self.rows = []

    def add(self, name, run):
        try:
            detail = run()
            self.rows.append(dict(id=name, status='pass', detail=detail))
        except Exception as error:
            self.rows.append(dict(id=name, status='fail', error=type(error).__name__ + ': ' + str(error)))


def compare(bank, root, control, field, value, profile, nullable=False):
    subject = dict(copy.deepcopy(control), **{field: value})
    expected = (nullable and value is None) or shared_accepts(value, profile)
    errors = bank.errors(root, subject)
    assert (not errors) == expected, dict(expected=expected, actual=[error_shape(e) for e in errors])
    if not expected:
        assert all(list(e.absolute_path) == [field] for e in errors), [error_shape(e) for e in errors]
    return dict(expected_accepts=expected, errors=[error_shape(e) for e in errors])


def synthetic_bank(work, dialect):
    uri = 'https://puppetmaster.local/test-only/fmt2/' + dialect
    schema = {
        '$schema': {'draft4': 'http://json-schema.org/draft-04/schema#',
                    'draft7': 'http://json-schema.org/draft-07/schema#',
                    'draft2020': 'https://json-schema.org/draft/2020-12/schema'}[dialect],
        '$id': uri, 'definitions': {
            'Event': {'type': 'object', 'required': ['event_type', 'payload_schema_id', 'replay_policy'],
                      'properties': {'event_type': {'type': 'string'}, 'payload_schema_id': {'type': 'string'},
                                     'replay_policy': {'type': 'string'},
                                     **{name: {'type': 'string', 'format': 'date-time'} for name in
                                        ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc', 'acknowledged_at_utc')}}},
            'Approval': {'type': 'object', 'properties': {
                'schema_id': {'const': 'pm.goal.update.approval_request.v1'},
                'created_at_utc': {'type': 'string', 'format': 'date-time'},
                'expires_at_utc': {'anyOf': [{'type': 'null'}, {'type': 'string', 'format': 'date-time'}]}}},
            'Resolution': {'type': 'object',
                           'required': ['approval_id', 'request_sha256', 'decided_at_utc', 'protected_person_decision_ref'],
                           'properties': {**{name: {'type': 'string'} for name in
                                              ('approval_id', 'request_sha256', 'protected_person_decision_ref')},
                                          'decided_at_utc': {'type': 'string', 'format': 'date-time'}}},
            'Pattern': {'type': 'string', 'pattern': 'a'},
            'Uuid': {'type': 'string', 'format': 'uuid'},
            'UnknownFormat': {'type': 'string', 'format': 'uri'},
            'Length': {'type': 'string', 'maxLength': 2},
        },
    }
    # Put the role in a different declared dialect from the root wrapper.
    schema['$ref'] = '#/definitions/Event'
    unformatted = copy.deepcopy(schema['definitions']['Event'])
    for name in ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc'):
        unformatted['properties'][name].pop('format')
    schema['definitions']['Unformatted'] = unformatted
    approval = {'$schema': schema['$schema'], '$id': uri + '/approval',
                '$ref': uri + '#/definitions/Approval'}
    resolution = {'$schema': schema['$schema'], '$id': uri + '/resolution',
                  '$ref': uri + '#/definitions/Resolution'}
    outer = {'$schema': 'https://json-schema.org/draft/2020-12/schema', '$id': uri + '/outer',
             'definitions': {name: {'$ref': uri + '#/definitions/' + name} for name in schema['definitions']}}
    outer['definitions']['Event'] = {'$ref': uri}
    outer['definitions']['Approval'] = {'$ref': uri + '/approval'}
    outer['definitions']['Resolution'] = {'$ref': uri + '/resolution'}
    entries = []
    for name, document in [('resource', schema), ('approval', approval), ('resolution', resolution), ('outer', outer)]:
        path = work / (dialect + '-' + name + '.json')
        raw = json.dumps(document, indent=1).encode() + b'\n'
        path.write_bytes(raw)
        entries.append(dict(path=str(path), sha256=hashlib.sha256(raw).hexdigest(), retrieval_uri=document['$id']))
    return OriginalBank(dict(resources=entries), {}), uri + '/outer#/definitions/'


def run(work):
    checks = Checks()
    edition = W.v3_edition()
    root = edition.custody + '#/$defs/TypedProducerSubmission'
    control = W.skeleton(edition.bank, root)
    assert not edition.bank.errors(root, control)
    bank = edition.bank.original
    assert type(bank).__name__ == 'DiagnosticBank'
    spellings = ['2026-01-01T00:00:00Z', '2026-01-01t00:00:00z',
                 '2026-01-01T05:30:00+05:30', '2025-12-31T17:00:00-07:00',
                 'not-a-date', '2026-02-30T00:00:00Z', '2026-01-01 00:00:00Z',
                 '2026-01-01T00:00:00Z\n', '2026-01-01T00:00:00+24:00',
                 '2026-01-01T00:00:60Z', '2026-01-01T00:00:00']
    for index, value in enumerate(spellings):
        def actual(value=value):
            result = compare(bank, root, control, 'occurred_at_utc', value, NR.DT.EVENT_RECORD)
            subject = dict(copy.deepcopy(control), occurred_at_utc=value)
            try:
                edition.bank.validate(root, subject, 'start/producer')
            except W.A.AdapterRefusal as error:
                assert not result['expected_accepts']
                assert error.code == 'start/producer/schema/occurred_at_utc:format', error.code
            else:
                assert result['expected_accepts']
            return result
        checks.add('diagnostic/producer/' + str(index), actual)

    def exposed():
        validator = bank.validator(root)
        expected = [error_shape(e) for e in bank.errors(root, dict(control, occurred_at_utc='not-a-date'))]
        assert [error_shape(e) for e in validator.iter_errors(dict(control, occurred_at_utc='not-a-date'))] == expected
        return 'exact validator factory matches bank.errors'
    checks.add('diagnostic/factory_exposed', exposed)

    corpus = json.loads((W.ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    rows = [row for row in corpus['cases'] if row.get('op') == 'datetime']
    for dialect in ('draft4', 'draft7', 'draft2020'):
        original, prefix = synthetic_bank(work, dialect)
        event = dict(event_type='test', payload_schema_id='test', replay_policy='test',
                     occurred_at_utc='2026-01-01T00:00:00Z', observed_at_utc='2026-01-01T00:00:00Z',
                     persisted_at_utc='2026-01-01T00:00:00Z', acknowledged_at_utc='2026-01-01T00:00:00Z')
        assert not original.errors(prefix + 'Event', event)
        for field, profile in [('occurred_at_utc', NR.DT.EVENT_RECORD),
                               ('observed_at_utc', NR.DT.STORAGE_UTC_Z),
                               ('persisted_at_utc', NR.DT.STORAGE_UTC_Z),
                               ('acknowledged_at_utc', NR.DT.EVENT_RECORD)]:
            for row in rows:
                checks.add(dialect + '/' + field + '/' + row['id'],
                           lambda field=field, profile=profile, row=row: compare(
                               original, prefix + 'Event', event, field, row['value'], profile))
        approval = dict(schema_id='pm.goal.update.approval_request.v1',
                        created_at_utc='2026-01-01T00:00:00Z', expires_at_utc=None)
        for field in ('created_at_utc', 'expires_at_utc'):
            for row in rows:
                checks.add(dialect + '/' + field + '/' + row['id'],
                           lambda field=field, row=row: compare(original, prefix + 'Approval', approval,
                               field, row['value'], NR.DT.COORDINATION_UTC_Z, nullable=field == 'expires_at_utc'))
        resolution = dict(approval_id='approval', request_sha256='digest', protected_person_decision_ref='decision',
                          decided_at_utc='2026-01-01T00:00:00Z')
        for row in rows:
            checks.add(dialect + '/decided_at_utc/' + row['id'],
                       lambda row=row: compare(original, prefix + 'Resolution', resolution, 'decided_at_utc',
                                               row['value'], NR.DT.COORDINATION_UTC_Z))
        for field, value, profile in [('occurred_at_utc', '2026-01-01t00:00:00z', NR.DT.EVENT_RECORD),
                                       ('occurred_at_utc', 'not-a-date', NR.DT.EVENT_RECORD),
                                       ('observed_at_utc', 'not-a-date', NR.DT.STORAGE_UTC_Z),
                                       ('observed_at_utc', '2026-01-01T00:00:00+05:30', NR.DT.STORAGE_UTC_Z)]:
            checks.add(dialect + '/unformatted/' + field + '/' + value,
                       lambda field=field, value=value, profile=profile: compare(
                           original, prefix + 'Unformatted', event, field, value, profile))
        for name, value, accepted in [('Pattern', 'cat', False), ('Pattern', 'a', True), ('Uuid', 'a' * 32, False),
                                      ('Uuid', 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', True),
                                      ('UnknownFormat', 'not a uri', True), ('Length', 'abcd', False)]:
            def unchanged(name=name, value=value, accepted=accepted):
                errors = original.errors(prefix + name, value)
                legacy = list(Validator({'$ref': prefix + name}, registry=original.registry,
                                        format_checker=FORMAT).iter_errors(value))
                assert [error_shape(e) for e in errors] == [error_shape(e) for e in legacy]
                assert (not errors) == accepted, [error_shape(e) for e in errors]
                return [error_shape(e) for e in errors]
            checks.add(dialect + '/other_keyword/' + name + '/' + str(accepted), unchanged)
    return dict(qualification='TEST_ONLY', native_execution='NOT_RUN', cases=checks.rows,
                status='pass' if all(row['status'] == 'pass' for row in checks.rows) else 'fail')


def selftest(suite, work):
    work.mkdir(parents=True, exist_ok=True)
    result = run(work)
    for row in result['cases']:
        def check(row=row):
            assert row['status'] == 'pass', row
        suite.positive('original_bank_formats', row['id'], check)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.work.mkdir(parents=True, exist_ok=True)
    result = run(args.work)
    args.out.write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(dict(status=result['status'], cases=len(result['cases']),
                          failures=[row for row in result['cases'] if row['status'] != 'pass'])))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
