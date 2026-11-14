"""PERF-R5 exceptions accept only main's restored tags under the approved carriers."""
import json
from pathlib import Path
import unittest
import invalidation_sets as lint


class CursorRestoreGuard(unittest.TestCase):
    def test_approved_tags_are_known(self):
        rules = json.loads(Path(__file__).with_name('active_descendant_rules.json').read_text())['rules']
        for r in rules:
            if r['rule'] not in (0, 1, 2, 6):
                continue
            prefix = r['replacement'].rsplit(':where(', 1)[0]
            with self.subTest(rule=r['rule']):
                self.assertEqual(lint.published_problems('<style>' + prefix + ':where(svg){color:inherit}</style>'), [])
                # A newly introduced tag under that same carrier must not slip through the exception.
                if r['rule'] != 0:  # rule 0's direct cursor token is outside GUARDED; its .active arm is covered separately.
                    self.assertTrue(lint.published_problems('<style>' + prefix + ':where(video){color:inherit}</style>'))

    def test_unrelated_carrier_still_fails(self):
        self.assertTrue(lint.published_problems('<style>.unrelated:hover :where(svg){color:inherit}</style>'))


if __name__ == '__main__':
    unittest.main()
