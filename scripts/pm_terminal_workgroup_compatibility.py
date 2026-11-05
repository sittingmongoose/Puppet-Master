#!/usr/bin/env python3
"""DL-449 static retained-data/withdrawal controls; no runtime reader or view."""
from __future__ import annotations
import argparse
import copy
import json
from pathlib import Path
from pm_home_layout_v2_slot_receipt import Home4Validator, Registry, Resource, ref_closure, refuse_remote
from pm_ds_resources import memory_floor

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = 'Plans/event_payloads/terminal_workgroup_moved.schema.json'
FIXTURES = 'Plans/terminal_workgroup_compatibility_fixtures.json'
EVENT = 'terminal.workgroup_moved'
POLICY = 'RP-AUTHORITY-INDEFINITE@1.0.0'


def payload_validator(schema):
    Home4Validator.check_schema(schema)
    registry = Registry(retrieve=refuse_remote).with_resource(schema['$id'], Resource.from_contents(schema))
    _, _, unresolved = ref_closure(registry, schema['$id'])
    if unresolved:
        raise ValueError('unresolved retained schema reference: ' + repr(unresolved))
    return Home4Validator(schema, registry=registry)


def retained_errors(value, validator):
    """Compare synthetic before/after saved bytes, without publishing their content."""
    errors = []
    if value['payload_schema_id'] != validator.schema['$id']:
        errors.append('selected_schema_unknown')
    try:
        original = bytes.fromhex(value['original_bytes_hex'])
        retained = bytes.fromhex(value['retained_bytes_hex'])
        payload = json.loads(original)
    except (ValueError, UnicodeDecodeError):
        return errors + ['saved_bytes_invalid']
    if retained != original:
        errors.append('retained_bytes_changed')
    if value['retention_policy'] != POLICY:
        errors.append('retention_changed')
    if not validator.is_valid(payload):
        errors.append('saved_payload_schema')
    elif payload['source_terminal_section_id'] == payload['target_terminal_section_id']:
        errors.append('saved_move_sections_not_distinct')
    return errors


def withdrawal_errors(value):
    """Check proposed contract observations; this does not execute a terminal move."""
    errors = []
    if EVENT in value['emitted_event_types']:
        errors.append('withdrawn_event_emitted')
    if value['dedicated_consumer'] is not None:
        errors.append('dedicated_consumer_operates')
    if value['family_projector'] is not None:
        errors.append('family_projector_operates')
    if value['family_checkpoint'] != 'none_required':
        errors.append('family_checkpoint_created')
    if value['view_required'] is not False:
        errors.append('new_view_required')
    if value['view_result_required'] is not False:
        errors.append('view_result_required')
    if value['original_move_result_custody_required'] is not False:
        errors.append('original_move_result_custody_required')
    if value['obsolete_move_tests_required'] is not False:
        errors.append('obsolete_move_tests_required')
    return errors


def run(fixtures, schema):
    validator = payload_validator(schema)
    rows = []
    for case in fixtures['cases']:
        memory_floor()
        errors = (retained_errors(case['value'], validator) if case['kind'] == 'retained'
                  else withdrawal_errors(case['value']))
        # An exact refusal list exposes an accidentally introduced second defect.
        rows.append({'id': case['id'], 'errors': errors, 'expected_errors': case['expected_errors'],
                     'pass': errors == case['expected_errors']})
    return {'schema_id': 'pm.terminal_workgroup_compatibility.check.v1',
            'status': 'pass' if all(r['pass'] for r in rows) else 'fail',
            'positive_count': sum(not r['expected_errors'] for r in rows),
            'negative_count': sum(bool(r['expected_errors']) for r in rows), 'rows': rows,
            'guard_isolation': 'PARTIAL; shared guard-table adoption is part 2',
            'native_execution': 'NOT_RUN',
            'boundary': 'Synthetic contract observations only; no history view, saved result or original move is implemented.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    fixtures = json.loads((ROOT / FIXTURES).read_text())
    schema = json.loads((ROOT / SCHEMA).read_text())
    result = run(fixtures, schema)
    if args.self_test:
        bad = copy.deepcopy(fixtures)
        bad['cases'][0]['value']['retention_policy'] = 'RP-CONFIG-CURRENT@1.0.0'
        assert run(bad, schema)['status'] == 'fail', 'invalid positive must fail the full checker'
        from contextlib import redirect_stdout
        from unittest.mock import patch
        import io
        import sys
        original_read = Path.read_text
        def bad_fixture_read(path, *args, **kwargs):
            return json.dumps(bad) if path == ROOT / FIXTURES else original_read(path, *args, **kwargs)
        with patch.object(Path, 'read_text', bad_fixture_read), patch.object(sys, 'argv', [__file__]), redirect_stdout(io.StringIO()):
            assert main() == 1, 'invalid-positive CLI must exit 1'
        result['invalid_positive_cli_exit_code'] = 1
        bad = copy.deepcopy(fixtures)
        negative = next(c for c in bad['cases'] if c['expected_errors'])
        negative['expected_errors'] = []
        assert run(bad, schema)['status'] == 'fail', 'misdeclared negative must fail'
        broken = copy.deepcopy(schema)
        broken['$defs'] = {'unused': {'$ref': 'https://puppetmaster.local/missing-terminal-schema'}}
        try:
            payload_validator(broken)
        except ValueError as exc:
            assert str(exc), 'missing reference must report failure'
        else:
            raise AssertionError('dormant reference must fail eagerly')
        result['self_test'] = 'pass'
    if args.output:
        args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'rows'}, indent=2))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
