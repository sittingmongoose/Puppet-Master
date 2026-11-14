"""Regression checks for refusal attribution and current-resource custody."""
import json
from pathlib import Path
import sys
import unittest

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_pnc019_s4o1 as cells
import pm_pnc019_retained_snapshot as retained
import pm_pnc019_s4o1_atomic as atomic
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time, format_checker
from pm_event_numbers import Refusal


class OracleAttribution(unittest.TestCase):
    def test_unrelated_keyword_or_occurrence_is_not_a_kill(self):
        schema = {'type': 'object', 'required': ['wanted'], 'properties': {'other': {'type': 'integer'}}}
        found = list(Draft202012Validator(schema).iter_errors({'wanted': 1, 'other': 'bad'}))
        self.assertFalse(cells.exact_refusal(found, 'required', (), (), 'wanted'))
        self.assertFalse(cells.exact_refusal(found, 'type', ('properties', 'wanted'), ('wanted',)))
        self.assertTrue(cells.exact_refusal(found, 'type', ('properties', 'other'), ('other',)))

    def test_required_members_cannot_borrow_each_others_refusal(self):
        found = list(Draft202012Validator({'required': ['first', 'second']}).iter_errors({'first': 1}))
        self.assertFalse(cells.exact_refusal(found, 'required', (), (), 'first'))
        self.assertTrue(cells.exact_refusal(found, 'required', (), (), 'second'))

    def test_branch_error_keeps_its_full_occurrence(self):
        schema = {'oneOf': [{'properties': {'x': {'const': 'yes'}}}, {'properties': {'x': {'type': 'integer'}}}]}
        found = list(Draft202012Validator(schema).iter_errors({'x': None}))
        self.assertTrue(cells.exact_refusal(found, 'const', ('oneOf', 0, 'properties', 'x'), ('x',)))
        self.assertFalse(cells.exact_refusal(found, 'const', ('oneOf', 1, 'properties', 'x'), ('x',)))

    def test_exception_is_propagated_instead_of_killed(self):
        class Broken:
            def iter_errors(self, candidate):
                raise RuntimeError('infrastructure failure')
        with self.assertRaisesRegex(RuntimeError, 'infrastructure failure'):
            cells.errors(Broken(), {})

    def test_current_integer_boundary_does_not_crash_on_4400_digits(self):
        validator = cells.CurrentValidator({'type': 'integer'})
        for candidate in (True, 1.0):
            self.assertFalse(validator.is_valid(candidate))
        self.assertTrue(validator.is_valid(1))
        self.assertTrue(validator.is_valid(10 ** 4399))
        self.assertFalse(cells.CurrentValidator({'type': 'integer', 'maximum': 10}).is_valid(10 ** 4399))

    def test_acknowledgement_uses_eventrecord_profile(self):
        value = '2026-11-14t12:00:00+01:00'
        self.assertEqual(date_time(value, profile=EVENT_RECORD), value)
        with self.assertRaises(Refusal):
            date_time(value, profile=STORAGE_UTC_Z)
        validator = cells.CurrentValidator({'format': 'date-time'}, format_checker=format_checker(profile=EVENT_RECORD))
        self.assertTrue(validator.is_valid(value))
        self.assertFalse(validator.is_valid('2026-11-14T24:00:00Z'))

    def test_current_resource_cannot_be_overwritten_by_retained_snapshot(self):
        _, documents = cells.registry()
        for path in ('Plans/execution_unit_context.schema.json', 'Plans/source_control_contracts.schema.json'):
            document = json.loads((ROOT/path).read_text())
            self.assertEqual(documents[document['$id']], document)

    def test_exact_94_family_split(self):
        manifest = json.loads(cells.MANIFEST.read_text())
        rows = manifest['rows']
        self.assertEqual([r['position'] for r in rows], list(range(1, 95)))
        names = [r['event_type'] for r in rows]
        self.assertEqual(names, sorted(set(names)))
        self.assertEqual(names[0], 'alert.acknowledged')
        self.assertEqual(names[-1], 'gate.evaluation_started')

    def test_store_snapshot_detects_read_time_mutation(self):
        class Owner:
            def __init__(self):
                self.records={'original':b'sealed'}
            def authenticated_original(self, reference):
                return self.records[reference]
        owner=Owner()
        before=retained.snapshot(owner)[0]
        owner.authenticated_original('original')
        self.assertEqual(retained.snapshot(owner)[0],before)
        owner.records['created_while_reading']=b'forbidden'
        self.assertNotEqual(retained.snapshot(owner)[0],before)

    def test_snapshot_preserves_float_bits_and_large_integers(self):
        class Owner:
            value=-0.0
            def authenticated_original(self,ref):
                return self.value
        owner=Owner();owner.value=-0.0
        before=retained.snapshot(owner)[0]
        owner.value=0.0
        self.assertNotEqual(retained.snapshot(owner)[0],before)
        owner.value=10**4399
        self.assertEqual(len(retained.snapshot(owner)[0]),64)

    def test_unsupported_snapshot_is_never_an_unchanged_store(self):
        class Opaque:
            def __reduce__(self):
                raise AssertionError('custom serialization must not execute')
        with self.assertRaisesRegex(TypeError,'unsupported'):
            retained.supported_store({'opaque':Opaque()})

    def test_forged_upstream_flip_cannot_hide_another_owner_refusal(self):
        schema={'properties':{'x':{'type':'string','minLength':1,'pattern':'.+'}}}
        case={'keyword':'minLength','schema_path':'/properties/x/minLength','instance_path':'/x',
              'replacement':'','member':None,'single_clause_flip':True,'restored':True}
        self.assertFalse(atomic.reproduce_cut(schema,Draft202012Validator(schema),{'x':'ok'},case,Draft202012Validator))
        del schema['properties']['x']['pattern']
        self.assertTrue(atomic.reproduce_cut(schema,Draft202012Validator(schema),{'x':'ok'},case,Draft202012Validator))

    def test_array_and_branch_occurrences_keep_integer_indices(self):
        schema={'allOf':[{'properties':{'x':{'type':'array','items':{'type':'string','minLength':1}}}}]}
        case={'keyword':'minLength','schema_path':'/allOf/0/properties/x/items/minLength',
              'instance_path':'/x/0','replacement':'','member':None}
        self.assertTrue(atomic.reproduce_cut(schema,Draft202012Validator(schema),{'x':['ok']},case,Draft202012Validator))


if __name__ == '__main__':
    unittest.main()
