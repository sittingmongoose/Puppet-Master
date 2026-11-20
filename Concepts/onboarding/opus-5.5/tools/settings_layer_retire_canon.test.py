#!/usr/bin/env python3
"""settings_layer.apply_retire_with_canon: a `retire_with_canon` id stays placed while the canonical inventory lists it
as an active row, and is retired (added to retire_ids, stripped from rules, its emptied `until_canon` section dropped)
from the build where the inventory drops it from `settings` or lists it in `retired_input_ids` (FO-167, 2026-11-12).
Run: python3 tools/settings_layer_retire_canon.test.py"""
import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import settings_layer  # noqa: E402

A, B, C = 'memory.retention.retrieval-mode', 'memory.retention.gist-review-filter', 'memory.retention.enabled'


def merged():
    return {
        'retire_ids': ['general.visual.nier-mode'],
        'retire_with_canon': [A, B],
        'overrides': [
            {'section': 'memory-pending', 'ids': [A, B]},
            {'section': 'memory-home', 'ids': [C]},
            {'section': 'elsewhere', 'glob': 'memory.limits.*'},
        ],
        'sections': {
            'memory-pending': {'to': 'advanced', 'until_canon': True},
            'memory-home': {'to': 'context-memory'},
        },
    }


class RetireWithCanon(unittest.TestCase):
    def test_active_rows_stay_placed(self):
        inv = {'settings': [{'id': A}, {'id': B}, {'id': C}]}
        m = settings_layer.apply_retire_with_canon(merged(), inv)
        self.assertEqual(m['retire_with_canon_now'], [])
        self.assertEqual(m['retire_ids'], ['general.visual.nier-mode'])
        self.assertEqual(m['overrides'], merged()['overrides'])
        self.assertIn('memory-pending', m['sections'])

    def test_rows_gone_from_settings_retire(self):
        inv = {'settings': [{'id': C}]}
        m = settings_layer.apply_retire_with_canon(merged(), inv)
        self.assertEqual(m['retire_with_canon_now'], [A, B])
        self.assertEqual(m['retire_ids'], ['general.visual.nier-mode', A, B])
        self.assertEqual([r['section'] for r in m['overrides']], ['memory-home', 'elsewhere'])
        self.assertNotIn('memory-pending', m['sections'])
        self.assertIn('memory-home', m['sections'])

    def test_retired_input_ids_retire(self):
        inv = {'settings': [{'id': A}, {'id': B}, {'id': C}], 'retired_input_ids': [B]}
        m = settings_layer.apply_retire_with_canon(merged(), inv)
        self.assertEqual(m['retire_with_canon_now'], [B])
        self.assertEqual(m['overrides'][0], {'section': 'memory-pending', 'ids': [A]})
        self.assertIn('memory-pending', m['sections'])

    def test_unreadable_inventory_retires_nothing(self):
        m = settings_layer.apply_retire_with_canon(merged(), {})
        self.assertEqual(m['retire_with_canon_now'], [])
        self.assertIn('memory-pending', m['sections'])

    def test_input_not_mutated(self):
        base = merged()
        keep = copy.deepcopy(base)
        settings_layer.apply_retire_with_canon(copy.deepcopy(base), {'settings': []})
        self.assertEqual(base, keep)


if __name__ == '__main__':
    unittest.main(verbosity=2)
