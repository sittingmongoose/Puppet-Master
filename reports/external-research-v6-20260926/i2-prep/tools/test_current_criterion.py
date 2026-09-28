"""Bounded artificial regressions; no D1 evidence or provider calls."""
import copy
import json
import tempfile
import unittest
from pathlib import Path

import current_criterion as criterion

FIXTURE = criterion.load_json((Path(__file__).resolve().parents[1] / "fixtures/criterion-task.json").read_bytes())


class CurrentCriterionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        # Store writes are confined to disposable artificial fixtures. Assessment
        # below never instantiates Store and must never repair the archive.
        self.store = criterion.frozen.Store(self.root / "workspace", self.root / "archive")
        self.archive = self.root / "archive"

    def submit(self, request, raw):
        (self.store.payloads / (request + ".md")).write_text(raw)
        (self.store.requests / request).write_bytes(b"submit\n")
        self.store.poll()

    def normal(self, current=None):
        self.submit("new--alpha", FIXTURE["payloads"]["old_alpha"])
        self.submit("new--red", FIXTURE["payloads"]["independent"])
        self.submit("F0001--update", current or FIXTURE["payloads"]["current_alpha"])
        self.store.close()

    def check(self):
        before = {str(p.relative_to(self.archive)): p.read_bytes() for p in self.archive.rglob("*") if p.is_file()}
        result = criterion.check_archive(self.archive, FIXTURE)
        after = {str(p.relative_to(self.archive)): p.read_bytes() for p in self.archive.rglob("*") if p.is_file()}
        self.assertEqual(before, after, "criterion must not rewrite evidence")
        return result

    def rewrite_current(self, change):
        path = self.archive / "current.json"
        current = json.loads(path.read_text())
        change(current)
        path.write_text(json.dumps(current))

    def test_legitimate_old_source_citation_retained_exactly(self):
        self.normal()
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertTrue(result["structurally_complete"])
        self.assertTrue(result["synthetic_task_assertions"]["passed"])
        self.assertIn("ALPHA_V1/ALPHA_V2", (self.archive / "current.md").read_text())

    def test_true_stale_fallback(self):
        self.normal()
        old = self.store.state["attempts"][0]["finding"]
        self.rewrite_current(lambda cur: cur["findings"].__setitem__(0, old))
        result = self.check()
        self.assertFalse(result["projection_fidelity"])
        self.assertFalse(result["synthetic_task_assertions"]["passed"])

    def test_wrong_current_value_without_old_marker(self):
        raw = FIXTURE["payloads"]["current_alpha"].replace("Alpha reports 3 units", "Alpha reports 2 units")
        self.assertNotIn("ALPHA_V1", raw)
        self.normal(raw)
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertFalse(result["synthetic_task_assertions"]["checks"]["designated_assertion"])

    def test_required_condition_loss(self):
        self.normal(FIXTURE["payloads"]["current_alpha"].replace("Applies only in blue mode.", "Applies in every mode."))
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertFalse(result["synthetic_task_assertions"]["checks"]["required_condition"])

    def test_stale_rule_in_source_fit_or_condition_is_not_exempt(self):
        for field in ("source_fit", "condition"):
            with self.subTest(field=field):
                current = copy.deepcopy({"findings": FIXTURE["findings"]})
                part = next(p for p in current["findings"][0]["parts"] if p["type"] == field)
                part["text"] += "Current rule remains 2 units under ALPHA_V1.\n"
                self.assertFalse(criterion.synthetic_assertions(current, FIXTURE)["passed"])

    def test_stale_source_fit_candidate_can_be_structurally_faithful(self):
        raw = FIXTURE["payloads"]["current_alpha"].replace("## source_fit\n", "## source_fit\nCurrent rule remains 2 units under ALPHA_V1.\n")
        self.normal(raw)
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertFalse(result["synthetic_task_assertions"]["passed"])

    def test_stale_condition_candidate_can_be_structurally_faithful(self):
        raw = FIXTURE["payloads"]["current_alpha"].replace("## condition\n", "## condition\nCurrent rule remains 2 units under ALPHA_V1.\n")
        self.normal(raw)
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertFalse(result["synthetic_task_assertions"]["passed"])

    def test_invalid_latest_with_independent_record(self):
        self.normal(FIXTURE["payloads"]["current_alpha"].replace("## condition\n", "## unknown\n"))
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertFalse(result["structurally_complete"])
        current = json.loads((self.archive / "current.json").read_text())
        self.assertEqual(current["findings"], [FIXTURE["findings"][1]])
        self.assertEqual(result["latest_states"]["F0001"], {"status": "INVALID", "latest_attempt": 3})

    def test_invalid_latest_cannot_fall_back(self):
        self.normal(FIXTURE["payloads"]["current_alpha"].replace("## condition\n", "## unknown\n"))
        old = self.store.state["attempts"][0]["finding"]
        self.rewrite_current(lambda cur: cur["findings"].insert(0, old))
        self.assertFalse(self.check()["passed"])

    def test_exact_source_quotes_and_all_fields(self):
        self.normal()
        expected = FIXTURE["findings"]
        self.assertEqual(json.loads((self.archive / "current.json").read_text())["findings"], expected)
        for field in ("title", "id", "parts"):
            with self.subTest(field=field):
                current = copy.deepcopy(expected)
                if field == "parts":
                    current[1][field][2]["text"] = "Paraphrased old source quote.\n"
                else:
                    current[1][field] += " changed"
                self.assertFalse(criterion.synthetic_assertions({"findings": current}, FIXTURE)["passed"])

    def test_missing_old_snapshot_is_incomplete(self):
        self.normal()
        (self.archive / "snapshots/0001.md").unlink()
        result = self.check()
        self.assertFalse(result["temporal_integrity"])
        self.assertFalse(result["structurally_complete"])

    def test_missing_latest_snapshot_withholds_identity(self):
        self.normal()
        (self.archive / "snapshots/0003.md").unlink()
        result = self.check()
        self.assertFalse(result["passed"])
        self.assertEqual(result["latest_states"]["F0001"]["status"], "INCOMPLETE_SNAPSHOT")

    def test_corrupt_raw_or_marker_snapshot(self):
        self.normal()
        for name in ("snapshots/0003.md", "snapshots/0003.request"):
            path = self.archive / name
            raw = path.read_bytes()
            path.chmod(0o644)  # Deliberate corruption of disposable synthetic bytes.
            path.write_bytes(raw + b"corrupt")
            self.assertFalse(self.check()["temporal_integrity"])
            path.write_bytes(raw)

    def test_unknown_current_fields_at_every_level(self):
        self.normal()
        path = self.archive / "current.json"
        raw = path.read_bytes()
        for level in ("root", "finding", "part"):
            with self.subTest(level=level):
                path.write_bytes(raw)
                def change(cur):
                    target = cur if level == "root" else cur["findings"][0] if level == "finding" else cur["findings"][0]["parts"][0]
                    target["extra"] = "unexpected"
                self.rewrite_current(change)
                self.assertFalse(self.check()["current_json_exact"])

    def test_field_order_and_markdown_changes_fail(self):
        self.normal()
        self.rewrite_current(lambda cur: cur["findings"][0]["parts"].reverse())
        self.assertFalse(self.check()["projection_fidelity"])
        (self.archive / "current.md").write_text("current-looking fabricated report\n")
        self.assertFalse(self.check()["current_markdown_exact"])

    def test_state_finding_and_raw_identity_are_checked(self):
        self.normal()
        path = self.archive / "state.json"
        raw = path.read_bytes()
        for field in ("finding_id", "finding", "status"):
            with self.subTest(field=field):
                state = json.loads(raw)
                state["attempts"][2][field] = "fabricated"
                path.write_text(json.dumps(state))
                self.assertFalse(self.check()["temporal_integrity"])

    def test_history_cannot_drop_rejected_or_old_attempts(self):
        self.normal()
        path = self.archive / "history.json"
        history = json.loads(path.read_text())
        history["attempts"].pop(0)
        path.write_text(json.dumps(history))
        self.assertFalse(self.check()["history_fidelity"])

    def test_json_type_fidelity_and_duplicate_keys(self):
        self.assertFalse(criterion.exact({"latest_attempt": True}, {"latest_attempt": 1}))
        self.normal()
        path = self.archive / "current.json"
        raw = path.read_bytes()
        path.write_bytes(raw.replace(b'"schema":', b'"schema": "duplicate", "schema":', 1))
        self.assertFalse(self.check()["passed"])

    def test_nonclosed_or_truthy_closed_archive_refuses_without_writes(self):
        self.normal()
        path = self.archive / "state.json"
        state = json.loads(path.read_text())
        for closed in (False, None, 1, "true", "absent"):
            with self.subTest(closed=closed):
                if closed == "absent":
                    state.pop("closed", None)
                else:
                    state["closed"] = closed
                path.write_text(json.dumps(state))
                result = self.check()
                self.assertFalse(result["passed"])
                self.assertFalse(result["structurally_complete"])
                self.assertIn("state.closed must be strictly true", result["errors"][-1])

    def test_closed_unsubmitted_payload_is_incomplete(self):
        self.submit("new--alpha", FIXTURE["payloads"]["old_alpha"])
        (self.store.payloads / "new--orphan.md").write_text(FIXTURE["payloads"]["independent"])
        self.store.close()
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertFalse(result["structurally_complete"])

    def test_i2_32KiB_payload_parser_compatibility(self):
        raw = FIXTURE["payloads"]["old_alpha"]
        raw += " " * (32768 - len(raw.encode("utf-8")))
        self.submit("new--alpha", raw)
        self.store.close()
        result = self.check()
        self.assertTrue(result["passed"])
        self.assertTrue(result["structurally_complete"])

    def capacity(self, offered):
        self.submit("new--alpha", FIXTURE["payloads"]["old_alpha"])
        for revision in range(1, offered):
            self.submit(f"F0001--revision{revision:02d}", FIXTURE["payloads"]["current_alpha"])
        self.store.close()
        self.assertEqual(len(self.store.state["attempts"]), 64)
        return self.check()

    def test_i2_64_attempt_lineage_compatibility(self):
        result = self.capacity(64)
        self.assertTrue(result["passed"])
        self.assertTrue(result["structurally_complete"])
        self.assertEqual(result["latest_states"]["F0001"]["latest_attempt"], 64)

    def test_closed_65th_attempt_cap_error_is_incomplete(self):
        result = self.capacity(65)
        self.assertTrue(result["passed"])
        self.assertFalse(result["structurally_complete"])
        self.assertTrue(self.store.state["protocol_errors"])


if __name__ == "__main__":
    unittest.main()
