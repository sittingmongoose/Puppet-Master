"""DL-039 no-admission boundaries, separate from candidate shape validation."""

import copy
import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


TESTING = module("emit_only_testing", "pm-testing-session-event-admission.py")
GITHUB = module("emit_only_github", "pm-github-project-integration.py")
SHARED = module("emit_only_shared", "pm_emit_only_event_contract.py")
EVENTS = set(TESTING.EVENTS) | set(GITHUB.EVENTS)
DENIAL = "event_not_admitted_dl039"
PREFIX_SHA256 = "4f701c9598003d7c01a405f18f7991b373379eca8b182cf6222540a4746d1756"


def failures(gate, case, *, candidate=False):
    check = gate.candidate_failures if candidate else gate.event_failures
    if gate is TESTING:
        return check(case["event"], case["producer"], case["request"], case["snapshot"])
    return check(case)


class EmitOnlyEventBoundaryTests(unittest.TestCase):
    def test_malformed_candidate_roots_and_event_types_return_failures(self):
        for gate in (TESTING, GITHUB):
            for value in (None, [], {}, 3):
                with self.subTest(gate=gate.__name__, root=value):
                    if gate is TESTING:
                        self.assertIn("envelope_schema" if not isinstance(value, dict) else "event_type_shape",
                                      gate.candidate_failures(value, None, None, {}))
                        self.assertTrue(gate.event_failures(value, None, None, {}))
                    else:
                        self.assertTrue(gate.candidate_failures(value))
                        self.assertTrue(gate.event_failures(value))
            for value in (None, [], {}, 3):
                with self.subTest(gate=gate.__name__, event_type=value):
                    case = next(gate.fixture_cases())
                    case["event"]["event_type"] = value
                    self.assertEqual(failures(gate, case, candidate=True), ["event_type_shape"])
                    self.assertEqual(failures(gate, case), ["event_type_shape"])
                    self.assertEqual(SHARED.deny_admission([], value, gate.EVENTS), ["event_type_shape"])

    def test_malformed_migration_retains_candidate_error_and_admission_denial(self):
        for gate in (TESTING, GITHUB):
            for value in (None, [], "invalid"):
                with self.subTest(gate=gate.__name__, migration=value):
                    case = next(gate.fixture_cases())
                    case["event"]["migration"] = value
                    expected = "event_migration_shape" if gate is TESTING else "event_schema"
                    self.assertIn(expected, failures(gate, case, candidate=True))
                    self.assertIn(expected, failures(gate, case))
                    self.assertIn(DENIAL, failures(gate, case))

    def test_malformed_manifests_and_registry_shapes_fail_before_traversal(self):
        for gate, path in ((TESTING, "Plans/testing_session_event_admission.json"),
                           (GITHUB, "Plans/github_project_event_admission.json")):
            original_load = gate.load
            manifest = original_load(path)
            registry_path = "Plans/event_family_registry.json"
            registry = original_load(registry_path)
            changes = [
                (path, None, "manifest_root"),
                (path, [], "manifest_root"),
                (path, {**manifest, "rows": None}, "manifest_rows"),
                (path, {**manifest, "rows": [None]}, "manifest_row:0"),
                (path, {**manifest, "rows": [{}]}, "manifest_row_field:0:event_type"),
                (path, {**manifest, "rows": [{**manifest["rows"][0], "event_type": []}]}, "manifest_row_field:0:event_type"),
                (path, {**manifest, "preexisting_family_prefix_sha256": None}, "manifest_prefix_shape"),
                (registry_path, None, "registry_root"),
                (registry_path, {"families": None}, "registry_families"),
                (registry_path, {"families": [None]}, "registry_family:0"),
                (registry_path, {"families": [{"event_type": []}]}, "registry_family:0"),
            ]
            for target, value, expected in changes:
                with self.subTest(gate=gate.__name__, expected=expected, value=value if value is None else type(value).__name__):
                    proposed_manifest = value if target == path else manifest
                    proposed_registry = value if target == registry_path else registry
                    self.assertIn(expected, SHARED.disposition_failures(proposed_manifest, proposed_registry, gate.EVENTS))
                    with patch.object(gate, "load", side_effect=lambda requested: value if requested == target else original_load(requested)):
                        report = gate.validate()
                    self.assertEqual(report["status"], "fail")
                    self.assertIn(expected, report["failures"])
                    self.assertEqual(report["admitted_events"], 0)
                    self.assertFalse(report["event_persistence_authorized"])
                    self.assertNotIn("positive_cases", report)
                    self.assertNotIn("positive_events", report)

    def test_unknown_manifest_event_fails_census_without_row_lookup(self):
        for gate, path, expected in (
                (TESTING, "Plans/testing_session_event_admission.json", "exact_event_census"),
                (GITHUB, "Plans/github_project_event_admission.json", "event_census")):
            original_load = gate.load
            manifest = copy.deepcopy(original_load(path))
            manifest["rows"][0]["event_type"] = "event:invented"
            with patch.object(gate, "load", side_effect=lambda requested: manifest if requested == path else original_load(requested)):
                self.assertIn(expected, gate.validate()["failures"])

    def test_each_github_manifest_row_requires_exact_owner_command(self):
        path = "Plans/github_project_event_admission.json"
        original_load = GITHUB.load
        for index in range(2):
            manifest = copy.deepcopy(original_load(path))
            event_type = manifest["rows"][index]["event_type"]
            manifest["rows"][index]["command_id"] = "cmd.unrelated"
            with self.subTest(event=event_type):
                with patch.object(GITHUB, "load", side_effect=lambda requested: manifest if requested == path else original_load(requested)):
                    self.assertIn("candidate_command_binding:" + event_type, GITHUB.validate()["failures"])

    def test_exact_six_absent_and_preexisting_forty_unchanged(self):
        rows = TESTING.load("Plans/event_family_registry.json")["families"]
        self.assertEqual(len(EVENTS), 6)
        self.assertEqual(EVENTS & {row["event_type"] for row in rows}, set())
        self.assertGreaterEqual(len(rows), 40)
        self.assertEqual(len({row["family_id"] for row in rows[:40]}), 40)
        self.assertEqual(TESTING.digest(rows[:40]), PREFIX_SHA256)

    def test_valid_candidates_are_not_event_admission(self):
        for gate in (TESTING, GITHUB):
            for case in gate.fixture_cases():
                with self.subTest(event=case["event"]["event_type"]):
                    self.assertEqual(failures(gate, case, candidate=True), [])
                    self.assertEqual(failures(gate, case), [DENIAL])

    def test_repeated_alias_and_restart_inputs_never_consume_state(self):
        for gate in (TESTING, GITHUB):
            for case in gate.fixture_cases():
                with self.subTest(event=case["event"]["event_type"]):
                    alias = copy.deepcopy(case)
                    alias["event"].update(event_id="event:emit-only:alias", sequence_id=999)
                    for _ in range(2):
                        oracle = gate.ReplayOracle()
                        before = copy.deepcopy(vars(oracle))
                        for delivery in (case, case, alias):
                            self.assertEqual(oracle.consume(delivery), "quarantined_without_checkpoint_advance")
                            self.assertEqual(vars(oracle), before)

    def test_existing_checkpoint_and_identity_state_is_not_advanced(self):
        for gate in (TESTING, GITHUB):
            oracle = gate.ReplayOracle()
            oracle.checkpoint = 40
            oracle.transitions["retained:before-correction"] = "unchanged"
            before = copy.deepcopy(vars(oracle))
            for case in gate.fixture_cases():
                self.assertEqual(oracle.consume(case), "quarantined_without_checkpoint_advance")
                self.assertEqual(vars(oracle), before)

    def test_bad_candidate_payload_is_rejected_independently_of_quarantine(self):
        for gate in (TESTING, GITHUB):
            for case in gate.fixture_cases():
                with self.subTest(event=case["event"]["event_type"]):
                    case["event"]["payload"]["raw_secret"] = "synthetic-forbidden-value"
                    self.assertIn("payload_schema", failures(gate, case, candidate=True))
                    self.assertIn("payload_schema", failures(gate, case))
                    self.assertIn(DENIAL, failures(gate, case))

    def test_each_unauthorized_registry_addition_fails_the_scoped_gate(self):
        for gate in (TESTING, GITHUB):
            original_load = gate.load
            for event_type in gate.EVENTS:
                with self.subTest(event=event_type):
                    central = copy.deepcopy(original_load("Plans/event_family_registry.json"))
                    candidate = copy.deepcopy(central["families"][0])
                    candidate.update(event_type=event_type, family_id="event-family-forbidden-candidate")
                    central["families"].append(candidate)
                    with patch.object(gate, "load", side_effect=lambda path: central if path == "Plans/event_family_registry.json" else original_load(path)):
                        self.assertIn("event_registry_admission_forbidden:" + event_type, gate.validate()["failures"])

    def test_static_reports_keep_all_negative_fixture_checks_and_zero_admissions(self):
        for gate, expected in ((TESTING, 124), (GITHUB, 74)):
            report = gate.validate()
            self.assertEqual(report["failures"], [])
            self.assertEqual(report["negative_cases"], expected)
            self.assertEqual(report["admitted_events"], 0)
            self.assertEqual(report["event_disposition"], "quarantined_not_admitted")
            self.assertFalse(report["event_persistence_authorized"])

    def test_manifest_cannot_reclassify_or_enable_event_authority(self):
        for gate, path in ((TESTING, "Plans/testing_session_event_admission.json"),
                           (GITHUB, "Plans/github_project_event_admission.json")):
            original_load = gate.load
            for field, value in (("admission_status", "admitted_static_contract"),
                                 ("event_persistence_authorized", True),
                                 ("event_projection_authorized", True),
                                 ("event_persistence_authorized", 0)):
                with self.subTest(manifest=path, field=field, value=value):
                    manifest = copy.deepcopy(original_load(path))
                    manifest[field] = value
                    with patch.object(gate, "load", side_effect=lambda requested: manifest if requested == path else original_load(requested)):
                        self.assertIn("admission_disposition", gate.validate()["failures"])


if __name__ == "__main__":
    unittest.main()
