"""PERF-R5 exceptions accept only main's restored tags under the approved carriers."""
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

    def test_unrelated_carrier_still_fails(self):
        self.assertTrue(lint.published_problems('<style>.unrelated:hover :where(svg){color:inherit}</style>'))


if __name__ == '__main__':
    unittest.main()
