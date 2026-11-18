"""PERF-R5 exceptions accept only main's restored tags under the approved carriers."""
import copy
import json
from pathlib import Path
import unittest
import invalidation_sets as lint

RULES = json.loads(Path(__file__).with_name('active_descendant_rules.json').read_text())

# main's restored tags, pinned here as well as in the lint, so widening any rule's list fails this test (R26 F1)
PINNED_TAGS = {
    0: 'b br circle div ellipse g i line path polygon polyline rect small span strong svg',
    1: 'b circle g line mask path polygon polyline rect span svg',
    2: 'circle defs desc ellipse feComposite feDisplacementMap feGaussianBlur feImage filter g line '
       'linearGradient mask path polygon polyline rect stop svg text title use',
    6: 'b br circle div g i line path polygon polyline rect small span strong svg',
}


class CursorRestoreGuard(unittest.TestCase):
    def test_approved_tags_are_known(self):
        for r in RULES['rules']:
            if r['rule'] not in (0, 1, 2, 6):
                continue
            prefix = r['replacement'].rsplit(':where(', 1)[0]
            with self.subTest(rule=r['rule']):
                self.assertEqual(lint.published_problems('<style>' + prefix + ':where(svg){color:inherit}</style>'), [])
                # A newly introduced tag under that same carrier must not slip through the exception. PM7PERF-LINT-RULE0-NEWTAG
                # (R26 F1): rule 0 was skipped here on the premise that its cursor token is outside GUARDED, but its
                # carriers hold .page-tab:not(.active) and .pm-segtab-item:not(.active), which the lint keys under .active.
                for tag in ('video', 'img', 'em', '*'):
                    self.assertTrue(lint.published_problems('<style>' + prefix + ':where(' + tag + '){color:inherit}</style>'), tag)

    def test_restored_tag_lists_are_pinned(self):
        self.assertEqual(lint._RESTORED_CURSOR_TAGS, PINNED_TAGS)

    def test_changed_carrier_gets_no_exception(self):
        # PM7PERF-LINT-CARRIERS-FROM-JSON (R26 F5): a carrier added to the JSON's prefix must not move the exception with it
        for rid in (0, 1, 2, 6):
            with self.subTest(rule=rid):
                mutated = copy.deepcopy(RULES)
                r = next(x for x in mutated['rules'] if x['rule'] == rid)
                prefix, arms = r['replacement'].rsplit(':where(', 1)
                widened = prefix.replace(':is(', ':is(.lane-q-added-carrier, ', 1) if ':is(' in prefix else '.lane-q-added-carrier ' + prefix
                r['replacement'] = widened + ':where(' + arms
                before = len(lint.CARRIER_DRIFT)
                known = lint.restored_cursor_known(mutated)
                self.assertFalse(any(k.startswith(widened) for k in known), 'no exception under the changed carrier')
                self.assertEqual(len(lint.CARRIER_DRIFT), before + 1, 'and the drift is named')
                self.assertTrue(lint.published_problems('<style>' + widened + ':where(svg){color:inherit}</style>'))
                del lint.CARRIER_DRIFT[before:]
        self.assertEqual(lint.restored_cursor_known(RULES).keys(), {k for k, v in lint.KNOWN.items() if 'PERF-R5' in v})

    def test_unrelated_carrier_still_fails(self):
        self.assertTrue(lint.published_problems('<style>.unrelated:hover :where(svg){color:inherit}</style>'))


if __name__ == '__main__':
    unittest.main()
