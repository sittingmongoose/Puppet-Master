"""The action census must inspect emitted source, never retired controllers."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = load_module("touch_closure", ROOT / "scripts/pm-touch-closure-verify.py")
SOURCE = ROOT / "Concepts/pm7-tools/guided_tour_source.py"


class EffectiveGuidedTourSourceTests(unittest.TestCase):
    def test_current_composition_matches_emitted_bands_exactly(self) -> None:
        actual = validator.effective_guided_tour_bands(SOURCE.read_text(encoding="utf-8"))
        with mock.patch.object(sys, "path", [str(SOURCE.parent), *sys.path]):
            authored = load_module("guided_tour_authored", SOURCE)
        self.assertEqual(actual, (authored.GUIDED_TOUR_MARKUP, authored.GUIDED_TOUR_STYLE, authored.GUIDED_TOUR_SCRIPT))
        self.assertIn("ui.guided_tour.show_me", actual[2])
        self.assertNotIn("cmd.panel.redock", actual[2])
        self.assertNotIn("cmd.widget.remove", actual[2])
        self.assertIn("createGuidedPlanningPractice", actual[2])
        self.assertIn("cmd.chat.send", actual[2])
        self.assertNotIn("ui.assistant_chat.", actual[2])

    def test_only_reviewed_literal_helper_is_read_without_execution(self) -> None:
        source = '''
from guided_tour_practice_source import PLANNING_PRACTICE_SCRIPT
GUIDED_TOUR_MARKUP = "markup"
GUIDED_TOUR_STYLE = "style"
GUIDED_TOUR_SCRIPT = PLANNING_PRACTICE_SCRIPT
'''
        with mock.patch.object(validator, "read", return_value='raise RuntimeError("not executed")\nPLANNING_PRACTICE_SCRIPT = "literal"'):
            self.assertEqual(validator.effective_guided_tour_bands(source), ("markup", "style", "literal"))
        for helper in (
            'PLANNING_PRACTICE_SCRIPT = str("computed")',
            'PLANNING_PRACTICE_SCRIPT = "first"\nPLANNING_PRACTICE_SCRIPT = "second"',
            'PLANNING_PRACTICE_SCRIPT = "first"\nif True:\n    PLANNING_PRACTICE_SCRIPT = "hidden"',
        ):
            with self.subTest(helper=helper), mock.patch.object(validator, "read", return_value=helper):
                with self.assertRaises(ValueError):
                    validator.effective_guided_tour_bands(source)
        for changed in (source.replace("guided_tour_practice_source", "unreviewed_helper"),
                        source.replace("import PLANNING_PRACTICE_SCRIPT", "import PLANNING_PRACTICE_SCRIPT as other")):
            with self.assertRaises(ValueError):
                validator.effective_guided_tour_bands(changed)

    def test_composed_fixture_retains_only_bounded_live_fragment(self) -> None:
        source = '''
GUIDED_TOUR_MARKUP = "markup"
GUIDED_TOUR_STYLE = "style"
legacy = "retired<start>live<end>retired"
begin = legacy.index("<start>")
end = legacy.index("<end>")
fragment = legacy[begin:end]
GUIDED_TOUR_SCRIPT = "before:" + fragment + ":after"
'''
        self.assertEqual(validator.effective_guided_tour_bands(source), ("markup", "style", "before:<start>live:after"))
        for changed in (
            source.replace('index("<end>")', 'index("missing")'),
            source.replace('"before:" + fragment + ":after"', '"".join([fragment])'),
            source + '\nGUIDED_TOUR_SCRIPT = "duplicate"\n',
            source.replace("legacy[begin:end]", "legacy[end:begin:-1]"),
            source.replace("legacy[begin:end]", "legacy[begin:end:2]"),
            source.replace("legacy[begin:end]", "legacy[:]"),
            source.replace("legacy[begin:end]", "legacy[begin:999999]"),
            source.replace('"before:" + fragment + ":after"', '"before:" + 7'),
            source.replace('"before:" + fragment + ":after"', 'GUIDED_TOUR_SCRIPT'),
            source + '\nif True:\n    GUIDED_TOUR_SCRIPT = "hidden overwrite"\n',
            source + '\nGUIDED_TOUR_SCRIPT += "hidden append"\n',
            source + '\nfragment, extra = "different", "other"\n',
            source + '\ndel GUIDED_TOUR_SCRIPT\n',
        ):
            with self.subTest(source=changed):
                with self.assertRaises(ValueError):
                    validator.effective_guided_tour_bands(changed)

    def test_source_resolution_does_not_execute_module_code(self) -> None:
        source = '''
raise RuntimeError("must not execute")
GUIDED_TOUR_MARKUP = "markup"
GUIDED_TOUR_STYLE = "style"
GUIDED_TOUR_SCRIPT = "script"
'''
        self.assertEqual(validator.effective_guided_tour_bands(source), ("markup", "style", "script"))


if __name__ == "__main__":
    unittest.main()
