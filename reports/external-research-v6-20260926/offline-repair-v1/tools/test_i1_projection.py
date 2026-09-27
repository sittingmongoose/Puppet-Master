"""Synthetic development checks for I1 current-view projection and staging only."""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import delivery
import stage_i1


SENTINEL = "SUPERSEDED_ONLY_SYNTHETIC_SENTINEL"
TOOL = Path(__file__).with_name("delivery.py")


def draft():
    return {
        "schema": delivery.SCHEMA_DRAFT,
        "findings": [{
            "id": "F-001", "title": "Synthetic current finding",
            "parts": [
                {"id": "P-001", "type": "assertion", "text": "The current synthetic index lists entries.",
                 "evidence": [{"kind": "source_text", "source": "SYN-001", "locator": "line 2", "quote": "Current synthetic source line."}]},
                {"id": "P-002", "type": "condition", "text": "When the current index is selected."},
                {"id": "P-003", "type": "implication", "text": "The current entry name is shown."},
                {"id": "P-004", "type": "validation_proposal", "text": "Compare a synthetic fixture; this is a proposed check."},
                {"id": "P-005", "type": "uncertainty", "text": "The ordering rule remains unknown."},
                {"id": "P-006", "type": "source_fit", "text": "The cited sample line concerns local entries."},
                {"id": "P-007", "type": "plan_fit", "text": "The synthetic Plan names an entry list."},
            ],
        }],
        "revision_history": [{"snapshot": "synthetic-prior", "text": SENTINEL}],
    }


class I1ProjectionTests(unittest.TestCase):
    def test_current_projection_has_all_current_parts_but_no_history(self):
        raw = draft()
        current = delivery.project_current(raw)
        text = delivery.render_current(current)
        self.assertEqual(current["schema"], delivery.SCHEMA_CURRENT)
        self.assertEqual([part["type"] for part in current["findings"][0]["parts"]],
                         ["assertion", "condition", "implication", "validation_proposal", "uncertainty", "source_fit", "plan_fit"])
        self.assertNotIn(SENTINEL, text + json.dumps(current))
        self.assertNotIn("revision_history", text + json.dumps(current))
        self.assertNotIn("Auditable history", text)
        self.assertIn("P-005 · uncertainty", text)
        self.assertIn("UNEXECUTED PROPOSAL", text)
        self.assertIn("SYN-001 [source_text] line 2", text)
        self.assertIn(SENTINEL, delivery.render(delivery.assemble(raw)))

    def test_cli_writes_separate_current_history_and_raw(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            source = root / "draft.json"
            source.write_text(json.dumps(draft()), encoding="utf-8")
            names = {key: root / name for key, name in (
                ("current_md", "current.md"), ("current_json", "current.json"),
                ("history_md", "history.md"), ("history_json", "history.json"),
                ("raw", "raw-draft.json"),
            )}
            process = subprocess.run([
                sys.executable, str(TOOL), "render-current", "--draft", str(source),
                "--out-md", str(names["current_md"]), "--out-json", str(names["current_json"]),
                "--history-md", str(names["history_md"]), "--history-json", str(names["history_json"]),
                "--raw-draft-out", str(names["raw"]),
            ], capture_output=True, text=True)
            self.assertEqual(process.returncode, 0, process.stderr)
            self.assertNotIn(SENTINEL, names["current_md"].read_text() + names["current_json"].read_text())
            self.assertIn(SENTINEL, names["history_md"].read_text())
            self.assertIn(SENTINEL, names["history_json"].read_text())
            self.assertEqual(source.read_bytes(), names["raw"].read_bytes())

    def test_invalid_carrier_current_has_no_raw_history_payload(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            source = root / "draft.json"
            malformed = draft()
            malformed[SENTINEL] = "Historical-only text in an unsupported carrier field."
            source.write_text(json.dumps(malformed), encoding="utf-8")
            current_md, current_json = root / "current.md", root / "current.json"
            history_md, history_json, raw = root / "history.md", root / "history.json", root / "raw.json"
            process = subprocess.run([
                sys.executable, str(TOOL), "render-current", "--draft", str(source),
                "--out-md", str(current_md), "--out-json", str(current_json),
                "--history-md", str(history_md), "--history-json", str(history_json),
                "--raw-draft-out", str(raw),
            ], capture_output=True, text=True)
            self.assertEqual(process.returncode, 2)
            self.assertNotIn(SENTINEL, current_md.read_text() + current_json.read_text())
            self.assertIn("CARRIER INVALID", current_md.read_text())
            self.assertIn(SENTINEL, history_md.read_text() + history_json.read_text() + raw.read_text())

    def test_stage_current_only_first_view_and_acquisition_inventory(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            workspace = root / "reviewer"
            (workspace / "first_view/case").mkdir(parents=True)
            (workspace / "first_view/key").mkdir(parents=True)
            x1 = root / "control-current.md"
            x2 = root / "maintained-current.md"
            control_history = root / "control-history.md"
            maintained_history = root / "maintained-history.md"
            snapshot = root / "prior-snapshot.md"
            x1.write_text("# Synthetic authored control current\n", encoding="utf-8")
            x2.write_text(delivery.render_current(delivery.project_current(draft())), encoding="utf-8")
            for path in (control_history, maintained_history, snapshot):
                path.write_text(SENTINEL, encoding="utf-8")
            inventory = stage_i1.stage(
                workspace, x1, x2,
                [(control_history, Path("history.md")), (snapshot, Path("snapshots/prior.md"))],
                [(maintained_history, Path("history.md")),
                 (maintained_history, Path("archive/first_view/history.md"))],
            )
            self.assertEqual((workspace / "first_view/results/X1/current.md").read_bytes(), x1.read_bytes())
            self.assertEqual((workspace / "first_view/results/X2/current.md").read_bytes(), x2.read_bytes())
            first_view_text = "\n".join(p.read_text() for p in (workspace / "first_view").rglob("*.md"))
            self.assertNotIn(SENTINEL, first_view_text)
            self.assertIn(SENTINEL, (workspace / "deferred/X1/snapshots/prior.md").read_text())
            self.assertEqual(inventory["gate"], "prompt_only_same_readable_workspace")
            self.assertEqual(len(inventory["first_view"]), 2)
            self.assertEqual(len(inventory["deferred"]), 4)
            self.assertIn("deferred/X2/archive/first_view/history.md",
                          [item["path"] for item in inventory["deferred"]])
            self.assertTrue((workspace / "deferred/INVENTORY.json").is_file())
            with self.assertRaisesRegex(ValueError, "must start empty"):
                stage_i1.stage(workspace, x1, x2,
                               [(control_history, Path("history.md"))],
                               [(maintained_history, Path("history.md"))])
            with self.assertRaisesRegex(ValueError, "explicit deferred acquisition inventory"):
                stage_i1.stage(root / "other-reviewer", x1, x2, [], [])
            with self.assertRaisesRegex(ValueError, "unsafe deferred destination"):
                stage_i1.stage(root / "traversal-reviewer", x1, x2,
                               [(control_history, Path("../../first_view/history.md"))],
                               [(maintained_history, Path("history.md"))])
            self.assertFalse((root / "traversal-reviewer/first_view/history.md").exists())
            stale = root / "stale-reviewer/first_view"
            stale.mkdir(parents=True)
            (stale / "history.md").write_text(SENTINEL, encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "unexpected first_view paths"):
                stage_i1.stage(root / "stale-reviewer", x1, x2,
                               [(control_history, Path("history.md"))],
                               [(maintained_history, Path("history.md"))])


if __name__ == "__main__":
    unittest.main()
