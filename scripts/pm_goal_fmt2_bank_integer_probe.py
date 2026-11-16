#!/usr/bin/env python3
"""Standing whole-bank integer diagnostic controls (TEST_ONLY)."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

import jsonschema
import pm_goal_test_owner_adapters as A
from pm_goal_own_c_roots import OriginalBank
from pm_goal_own_c3_w34_oracles import DiagnosticBank
from pm_goal_fmt2_bank_format_probe import Checks, error_shape


def run(work):
    checks = Checks()
    limit = sys.get_int_max_str_digits()
    huge = 10 ** 4400 - 1
    for dialect, base in [('draft4', jsonschema.Draft4Validator),
                           ('draft7', jsonschema.Draft7Validator),
                           ('draft2020', jsonschema.Draft202012Validator)]:
        uri = 'https://puppetmaster.local/test-only/bank-integers/' + dialect
        definitions = dict(Maximum={'type': 'integer', 'maximum': 2 ** 64 - 1},
                           Minimum={'type': 'integer', 'minimum': 0},
                           WrongType={'type': 'string'}, Unbounded={'type': 'integer'})
        definitions.update(AnyOf={'anyOf': [{'type': 'integer', 'maximum': 9}, {'type': 'null'}]},
                           OneOf={'oneOf': [{'type': 'integer', 'maximum': 9}, {'type': 'null'}]},
                           WrongClock={'type': 'string', 'format': 'date-time'})
        if dialect == 'draft4':
            definitions.update(ExclusiveMinimum={'minimum': 0, 'exclusiveMinimum': True},
                               ExclusiveMaximum={'maximum': 9, 'exclusiveMaximum': True})
        else:
            definitions.update(ExclusiveMinimum={'exclusiveMinimum': 0},
                               ExclusiveMaximum={'exclusiveMaximum': 9})
        schema = {'$schema': base.META_SCHEMA['id' if dialect == 'draft4' else '$id'],
                  '$id': uri, 'definitions': {name: {'type': 'object', 'required': ['sequence_id'],
                    'properties': {'sequence_id': constraint}} for name, constraint in definitions.items()}}
        bounded_object = {'type': 'object', 'properties': {'sequence_id': {'maximum': 9}}}
        schema['definitions'].update(
            NestedAnyOf={'anyOf': [bounded_object, {'type': 'null'}]},
            NestedOneOf={'oneOf': [bounded_object, {'type': 'null'}]},
            AmbiguousOneOf={'oneOf': [{'type': 'object'}, {'type': 'object'}]},
            NotObject={'not': {'type': 'object'}})
        all_names = list(schema['definitions'])
        outer = {'$schema': 'https://json-schema.org/draft/2020-12/schema', '$id': uri + '/outer',
                 'definitions': {name: {'$ref': uri + '/' + name} for name in all_names}}
        entries = []
        documents = [('inner', schema), ('outer', outer)] + [(name, {
            '$schema': schema['$schema'], '$id': uri + '/' + name,
            '$ref': uri + '#/definitions/' + name}) for name in all_names]
        for name, document in documents:
            path = work / (dialect + '-' + name + '.json')
            raw = json.dumps(document).encode()
            path.write_bytes(raw)
            entries.append(dict(path=str(path), sha256=hashlib.sha256(raw).hexdigest(),
                                retrieval_uri=document['$id']))
        for kind, bank in [('root', A.RootBank(entries)),
                           ('original', OriginalBank(dict(resources=entries), {})),
                           ('diagnostic', DiagnosticBank(dict(resources=entries)))]:
            for name in definitions:
                root = uri + '/outer#/definitions/' + name
                for label, value in [('negative_huge', -huge), ('positive_huge', huge),
                                      ('large_displayable', 10 ** 4000 - 1),
                                      ('at_decimal_cap', 10 ** 4300 - 1),
                                      ('negative', -1), ('zero', 0), ('limit', 2 ** 64 - 1),
                                      ('overflow', 2 ** 64), ('boolean', True), ('float', 1.5)]:
                    def check(bank=bank, root=root, name=name, value=value, base=base):
                        subject = {'sequence_id': value}
                        errors = bank.errors(root, subject)
                        factory = list(bank.validator(root).iter_errors(subject))
                        assert [error_shape(e) for e in errors] == [error_shape(e) for e in factory]
                        if type(value) is not int or abs(value) < 10 ** 4300:
                            legacy = list(base({'$ref': root}, registry=bank.registry).iter_errors(subject))
                            assert [error_shape(e) for e in errors] == [error_shape(e) for e in legacy]
                        else:
                            keyword = ('type' if name in ('WrongType', 'WrongClock') else
                                       'anyOf' if name == 'AnyOf' and value > 0 else
                                       'oneOf' if name == 'OneOf' and value > 0 else
                                       'maximum' if name == 'Maximum' and value > 0 else
                                       'minimum' if name == 'Minimum' and value < 0 else
                                       ('minimum' if dialect == 'draft4' else 'exclusiveMinimum')
                                       if name == 'ExclusiveMinimum' and value < 0 else
                                       ('maximum' if dialect == 'draft4' else 'exclusiveMaximum')
                                       if name == 'ExclusiveMaximum' and value > 0 else None)
                            assert len(errors) == int(keyword is not None)
                            if errors:
                                assert errors[0].validator == keyword
                                assert list(errors[0].absolute_path) == ['sequence_id']
                                assert errors[0].instance is value
                        return [error_shape(e) for e in errors]
                    checks.add('/'.join((dialect, kind, name, label)), check)
            for name, keyword in [('NestedAnyOf', 'anyOf'), ('NestedOneOf', 'oneOf'),
                                  ('AmbiguousOneOf', 'oneOf'), ('NotObject', 'not')]:
                def nested(bank=bank, name=name, keyword=keyword, uri=uri):
                    subject = {'sequence_id': huge}
                    root = uri + '/outer#/definitions/' + name
                    errors = bank.errors(root, subject)
                    assert len(errors) == 1 and errors[0].validator == keyword
                    assert errors[0].instance is subject and list(errors[0].absolute_path) == []
                    assert [error_shape(e) for e in bank.validator(root).iter_errors(subject)] == [
                        error_shape(e) for e in errors]
                    if name.startswith('Nested'):
                        assert any(e.validator == 'maximum' and e.instance is huge and
                                   list(e.absolute_path) == ['sequence_id'] for e in errors[0].context)
                    return [error_shape(e) for e in errors]
                checks.add('/'.join((dialect, kind, name, 'huge_container')), nested)

    def inspector():
        import pm_goal_dg_u_oracles as U
        w = U.world(work / 'actual-inspector')
        g = U.O.birth_goal(w)
        req, adm = U.run_direct(w, g)
        event = U.event_of(w, g, adm)
        request = w.inspector.request_for(g['scope'], event)
        w.inspector.inspect(request, g['user'], g['user_permission'])
        generation = w.storage.commit_generation
        codes = []
        for value in (huge, -huge):
            subject = dict(request, sequence_id=value)
            errors = w.consumer_bank.errors(U.O.CONSUMER_URI + '#/$defs/EventReadRequest', subject)
            assert [(list(e.absolute_path), e.validator) for e in errors] == [
                (['sequence_id'], 'maximum' if value > 0 else 'minimum')]
            try:
                w.inspector.inspect(subject, g['user'], g['user_permission'])
            except A.AdapterRefusal as error:
                assert error.code == 'dgu/inspect/request/schema/sequence_id', error.code
                codes.append(error.code)
            else:
                raise AssertionError('oversize sequence accepted')
        assert w.storage.commit_generation == generation
        assert sys.get_int_max_str_digits() == limit
        return dict(refusals=codes, integer_bit_length=huge.bit_length(), decimal_limit=limit)
    checks.add('actual/EventInspector.inspect/sequence_id_4400_digits', inspector)
    return dict(qualification='TEST_ONLY', native_execution='NOT_RUN', cases=checks.rows,
                status='pass' if all(row['status'] == 'pass' for row in checks.rows) else 'fail')


def selftest(suite, work):
    work.mkdir(parents=True, exist_ok=True)
    result = run(work)
    for row in result['cases']:
        def check(row=row):
            assert row['status'] == 'pass', row
        suite.positive('bank_integer_diagnostics', row['id'], check)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.work.mkdir(parents=True, exist_ok=True)
    result = run(args.work)
    args.out.write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(dict(status=result['status'], cases=len(result['cases']),
                         failures=[r for r in result['cases'] if r['status'] != 'pass'])))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
