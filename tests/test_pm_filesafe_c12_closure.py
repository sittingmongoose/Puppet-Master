"""Adversarial checks for DF closure evidence attribution and observer purity."""
import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import pm_filesafe_c12_closure as X


class ClosureEvidenceTests(unittest.TestCase):
    def test_unrelated_error_does_not_earn_target_credit(self):
        node = {'type': 'string', 'minLength': 2}
        validator = X.SG.SlotValidator(node)
        found = X.errors(validator, '')
        self.assertFalse(X.expected_error(found, node, 'type', ()))
        self.assertTrue(X.expected_error(found, node, 'minLength', ()))

    def test_alternative_branch_error_does_not_earn_complete_refusal(self):
        node = {'anyOf': [{'type': 'string'}, {'type': 'null'}]}
        self.assertEqual(X.errors(X.SG.SlotValidator(node), None), [])
        self.assertFalse(X.expected_error([], node['anyOf'][0], 'type', ()))

    def test_direct_schema_probe_does_not_leak_integer_slots(self):
        before = list(X.SG._SLOTS)
        X.errors(X.SG.SlotValidator({'type': 'integer'}), 2)
        self.assertEqual(X.SG._SLOTS, before)

    def test_observer_restores_original_functions_after_exception(self):
        original = (X.SG.split_errors, X.SG.SlotValidator.descend, X.T.refusals)
        keywords = dict(X.SG.SlotValidator.VALIDATORS)
        with self.assertRaisesRegex(RuntimeError, 'test interruption'):
            with X.Trace('filesafe.command_denied').installed():
                raise RuntimeError('test interruption')
        self.assertEqual(original, (X.SG.split_errors, X.SG.SlotValidator.descend, X.T.refusals))
        self.assertEqual(keywords, X.SG.SlotValidator.VALIDATORS)

    def test_mutation_does_not_change_control(self):
        original = {'payload': {'ts': '2026-01-01T00:00:00Z'}}
        before = copy.deepcopy(original)
        changed = X.replaced(original, ('payload', 'ts'), 'invalid')
        self.assertEqual(original, before)
        self.assertEqual(changed['payload']['ts'], 'invalid')

    def test_event_record_profile_keeps_owner_spellings(self):
        validator = X.SG.SlotValidator({'type': 'string', 'format': 'date-time'},
                                       format_checker=X.SG.format_checker())
        for value in ('0000-01-01T00:00:00Z', '2016-12-31T23:59:60Z',
                      '2026-01-01t00:00:00z', '2026-01-01T00:00:00+01:00'):
            self.assertEqual(X.errors(validator, value), [])
        self.assertTrue(X.errors(validator, '2026-01-01T00:00:00Z\n'))


if __name__ == '__main__':
    unittest.main()
