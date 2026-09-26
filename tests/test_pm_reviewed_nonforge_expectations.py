"""The historical expectation update is bounded, immutable and not a waiver."""
import copy
import json
import subprocess
import unittest

from pm_reviewed_nonforge_expectations import (
    ROOT, WIRING_KEYS, PROFILE_IDS, with_reviewed_nonforge_successors,
)

BASE = "64a63133a2266ee38d894f2494208027e364cfb9"


def historical(path):
    return json.loads(subprocess.check_output(
        ["git", "show", BASE + ":" + path], cwd=ROOT, text=True))


class ReviewedNonForgeExpectationsTests(unittest.TestCase):
    def test_only_explicit_wiring_rows_advance_without_mutating_input(self):
        path = "Plans/Wiring_Matrix.production.json"
        before = historical(path)
        preserved = copy.deepcopy(before)
        after = with_reviewed_nonforge_successors(path, before)
        self.assertEqual(preserved, before)
        self.assertEqual(set(before["entries"]), set(after["entries"]))
        self.assertEqual(WIRING_KEYS, {
            key for key in before["entries"]
            if before["entries"][key] != after["entries"][key]})
        self.assertFalse(any("forge" in key for key in WIRING_KEYS))
        self.assertEqual(before["entries"]["catalog.forge_review_create"],
                         after["entries"]["catalog.forge_review_create"])

    def test_only_seven_profiles_and_24_existing_touch_rows_advance(self):
        path = "Plans/touch_closure.json"
        before = historical(path)
        after = with_reviewed_nonforge_successors(path, before)
        self.assertEqual([r[0] for r in before["rows"]], [r[0] for r in after["rows"]])
        changed = [(a, b) for a, b in zip(before["rows"], after["rows"]) if a != b]
        self.assertEqual(24, len(changed))
        for a, b in changed:
            self.assertEqual(a[2:4], b[2:4])
            self.assertFalse(a[3].startswith("cmd.forge."))
        self.assertEqual(PROFILE_IDS, {
            a["profile_id"] for a, b in zip(before["profiles"], after["profiles"])
            if a != b})
        for key in before.keys() - {"rows", "profiles"}:
            self.assertEqual(before[key], after[key])

    def test_unrecognized_and_changed_approved_rows_still_diverge(self):
        path = "Plans/Wiring_Matrix.production.json"
        expected = with_reviewed_nonforge_successors(path, historical(path))["entries"]
        for key in ("catalog.forge_review_create", "catalog.server_bootstrap_start"):
            changed = copy.deepcopy(expected)
            changed[key]["handler_location"] = "handlers::wrong::target"
            self.assertEqual({key}, {k for k in expected if expected[k] != changed[k]})

    def test_other_documents_are_unchanged_and_results_do_not_alias_cache(self):
        value = {"retained": [1, 2]}
        self.assertEqual(value, with_reviewed_nonforge_successors("Plans/unrelated.json", value))
        path = "Plans/Wiring_Matrix.production.json"
        before = historical(path)
        first = with_reviewed_nonforge_successors(path, before)
        first["entries"]["catalog.server_bootstrap_start"]["handler_location"] = "wrong"
        second = with_reviewed_nonforge_successors(path, before)
        self.assertNotEqual(first, second)


if __name__ == "__main__":
    unittest.main()
