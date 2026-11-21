"""Read-only regression for family evidence carried by the revision writer."""

import importlib.util
import io
import json
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "registered_revision_writer", ROOT / "scripts/pm-ea-registered-revision-writer.py"
)
WRITER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(WRITER)

EVENT = "goal.blocked"
ASSESSMENT = "reports/event-authority-20261116/admission-merge-2/revisions/goal.blocked.json"


class RegisteredRevisionSubjectTests(unittest.TestCase):
    def check_revision(self, wrong_subject, *, activate=False):
        registry = WRITER.load(WRITER.w.REGISTRY)
        _, row = WRITER.w.find_by_event(registry["families"], EVENT)
        assessment = WRITER.load(ASSESSMENT)["rows"][0]
        correct = next(item for item in assessment["cells"]["owner_doc"]["evidence"]
                       if item["unit"] == "GRS-203")
        wrong, = (item for item in assessment["cells"]["redaction_custody"]["evidence"]
                  if item["unit"] == "SP-271")
        cells = {field: dict(status="PASS", finding="Test fixture", evidence=[correct])
                 for field in WRITER.w.EVIDENCE_FIELDS}
        grade = {"rows": [dict(event_type=EVENT, cells=cells)]}
        item = dict(event_type=EVENT, registry_row=row, before_row_sha256=WRITER.w.canonical_sha256(row),
                    grade_source=dict(path=ASSESSMENT, sha256=WRITER.w.sha256_file(ROOT / ASSESSMENT)))
        citation = wrong if wrong_subject else correct
        if activate:
            item["activate"] = {"scope_identity": dict(
                predicate="exact_successor_selector", payload_schema_ref=row["payload_schema_ref"],
                identity_json_pointers=row["legacy"]["identity_json_pointers"],
                finding="Test fixture", evidence=[citation],
            )}
        else:
            cells["redaction_custody"]["evidence"] = [citation]

        manifest = "test-only-revision-manifest.json"
        fixtures = {manifest: {"revisions": [item]}, ASSESSMENT: grade}
        load = WRITER.load
        sha256_file = WRITER.w.sha256_file
        exists = Path.exists
        args = ["revision-writer", "--manifest", manifest, "--sha256", "test-only",
                "--dl-start", "999999", "--revision-date", registry["registry_revision"].split(".")[0],
                "--check-only"]
        with (
            patch.object(sys, "argv", args),
            patch.object(WRITER, "load", side_effect=lambda path: fixtures[path] if path in fixtures else load(path)),
            patch.object(WRITER.w, "sha256_file", side_effect=lambda path: (
                "test-only" if path == ROOT / manifest else sha256_file(path))),
            patch.object(WRITER.w, "git", return_value=""),
            patch.object(WRITER.w, "load_module", return_value=SimpleNamespace(
                event_family_registry_data_failures=lambda *args, **kwargs: [])),
            patch.object(Path, "exists", lambda path: path != ROOT / ASSESSMENT and exists(path)),
            redirect_stdout(io.StringIO()) as output,
        ):
            self.assertEqual(WRITER.main(), 0)
            self.assertTrue(json.loads(output.getvalue())["validated_only"])

    def test_wrong_subject_refuses_in_carried_and_activated_evidence(self):
        for activate in (False, True):
            with self.subTest(activate=activate):
                self.check_revision(False, activate=activate)
                with self.assertRaisesRegex(WRITER.w.Gap, r"Markdown evidence subject.*goal\.child_status_changed"):
                    self.check_revision(True, activate=activate)


if __name__ == "__main__":
    unittest.main()
