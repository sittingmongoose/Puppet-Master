#!/usr/bin/env python3
"""settings_layer.check_retire_ids: a placement `retire_ids` entry must be an active reference id or an id the canonical
inventory lists at its root as `retired_input_ids` (migration-only, Q22). Unknown ids are still refused.
Run: python3 tools/settings_layer_retire.test.py"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import settings_layer  # noqa: E402


class Refused(Exception):
    pass


def need(cond, msg):
    if not cond:
        raise Refused(msg)


ACTIVE = {'general.visual.theme', 'general.visual.nier-parts'}
ROW = {'id': 'general.visual.theme'}


class RetireIds(unittest.TestCase):
    def test_active_id_today(self):
        # integration today: the row is still active and the inventory has no root key
        settings_layer.check_retire_ids({'general.visual.nier-mode'}, ACTIVE | {'general.visual.nier-mode'},
                                        {'settings': [ROW, {'id': 'general.visual.nier-mode'}]}, set(), need)

    def test_retired_input_after_plans(self):
        # plans 58f1061b6e: the row left settings[] and the id is listed at the root
        settings_layer.check_retire_ids({'general.visual.nier-mode'}, ACTIVE,
                                        {'settings': [ROW], 'retired_input_ids': ['general.visual.nier-mode']}, set(), need)

    def test_unknown_id_refused(self):
        with self.assertRaisesRegex(Refused, 'retire_ids names unknown id general.visual.no-such-row'):
            settings_layer.check_retire_ids({'general.visual.no-such-row'}, ACTIVE,
                                            {'settings': [ROW], 'retired_input_ids': ['general.visual.nier-mode']}, set(), need)

    def test_unknown_id_refused_without_root_key(self):
        with self.assertRaisesRegex(Refused, 'unknown id general.visual.nier-mode'):
            settings_layer.check_retire_ids({'general.visual.nier-mode'}, ACTIVE, {'settings': [ROW]}, set(), need)

    def test_retired_input_must_not_be_active_in_canon(self):
        with self.assertRaisesRegex(Refused, 'still an active inventory row'):
            settings_layer.check_retire_ids({'general.visual.nier-mode'}, ACTIVE,
                                            {'settings': [ROW, {'id': 'general.visual.nier-mode'}],
                                             'retired_input_ids': ['general.visual.nier-mode']}, set(), need)

    def test_retired_input_must_have_no_row_decision(self):
        with self.assertRaisesRegex(Refused, 'still has a row decision'):
            settings_layer.check_retire_ids({'general.visual.nier-mode'}, ACTIVE,
                                            {'settings': [ROW], 'retired_input_ids': ['general.visual.nier-mode']},
                                            {'general.visual.nier-mode'}, need)


if __name__ == '__main__':
    unittest.main(verbosity=2)
