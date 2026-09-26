"""Finite static census tests. No fixture or callback claims native execution."""
import copy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(os.environ.get("PM_CANON_ROOT", str(Path(__file__).resolve().parents[1])))
ARTIFACT_ROOT = Path(os.environ.get("PM_DOCTOR_COVERAGE_ROOT", str(Path(__file__).resolve().parents[1])))
sys.path.insert(0, str(ARTIFACT_ROOT / "scripts"))
import pm_doctor_source_coverage as coverage


class DoctorSourceCoverage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((ARTIFACT_ROOT / "Plans/doctor_source_coverage.json").read_text())
        cls.schema = json.loads((ARTIFACT_ROOT / "Plans/doctor_source_coverage.schema.json").read_text())

    def check(self, value):
        return coverage.validate_coverage(value, repo_root=ROOT, schema=self.schema)

    def test_full_census_and_real_existing_leaf(self):
        self.assertEqual([], self.check(self.catalog))
        self.assertEqual(52, len(self.catalog["occurrences"]))
        self.assertEqual(51, len({r["source_label"] for r in self.catalog["occurrences"]}))
        self.assertEqual("incomplete", self.catalog["leaf_binding_status"])
        bound = [r for r in self.catalog["occurrences"] if r["full_dimension_query_binding"] != "unbound"]
        self.assertEqual(["sep03-doctor-008", "sep03-doctor-043"], [r["occurrence_id"] for r in bound])
        self.assertEqual(50, sum(1 for r in self.catalog["occurrences"]
                                 if r["full_dimension_query_binding"] == "unbound"))
        self.assertEqual(1, len({json.dumps(r["full_dimension_query_binding"], sort_keys=True) for r in bound}))
        self.assertEqual("bound_to_typed_owner_read", bound[0]["full_dimension_query_binding"]["state"])
        self.assertEqual("none", bound[0]["full_dimension_query_binding"]["native_claim"])
        self.assertEqual([35, 37, 41], [i + 1 for i, r in enumerate(self.catalog["occurrences"]) if r["bounded_leaf"]])

    def test_only_missing_sibling_artifacts_are_unresolved_in_a_selected_file_copy(self):
        """The strict census above needs the whole canonical tree.

        In a selected-file copy the only permitted failures are unresolved sibling
        artifacts. Any binding, census or claim failure is still fatal here.
        """

        unresolved_prefixes = (
            "owner_unresolved",
            "schema_unresolved",
            "descriptor_unresolved",
            "descriptor_owner_unresolved",
            "leaf_request_unresolved",
            "leaf_result_unresolved",
        )
        failures = self.check(self.catalog)
        self.assertEqual([], [failure for failure in failures
                              if not failure.startswith(unresolved_prefixes)])

    def test_binding_is_scoped_to_the_two_app_update_occurrences(self):
        binding = self.catalog["occurrences"][7]["full_dimension_query_binding"]
        self.assertEqual(binding, self.catalog["occurrences"][42]["full_dimension_query_binding"])
        self.assertEqual(["sep03-doctor-008", "sep03-doctor-043"], binding["bound_occurrences"])
        self.assertEqual("application_update", binding["fact_key"])
        self.assertEqual("static_typed_contract_join_only", binding["evidence_level"])
        for index in (7, 42):
            bad = copy.deepcopy(self.catalog)
            bad["occurrences"][index]["full_dimension_query_binding"] = "unbound"
            with self.subTest(occurrence=bad["occurrences"][index]["occurrence_id"]):
                self.assertTrue(self.check(bad))
        bad = copy.deepcopy(self.catalog)
        bad["occurrences"][6]["full_dimension_query_binding"] = copy.deepcopy(binding)
        self.assertTrue(self.check(bad))
        for path, value in (("native_claim", "native_issuer"), ("state", "unsupported"),
                            ("descriptor_check_id", "doctor.other"), ("descriptor_revision", 2),
                            ("server_protocol_join_ref", "Plans/server_system_contracts.schema.json#/$defs/server_record")):
            bad = copy.deepcopy(self.catalog)
            bad["occurrences"][42]["full_dimension_query_binding"][path] = value
            with self.subTest(binding_field=path):
                self.assertTrue(self.check(bad))

    def test_binding_follows_the_actual_descriptor_and_typed_artifacts(self):
        descriptor_ref = "Plans/doctor_application_update_owner_read_contract_fixtures.json#/valid/0/value"
        original = coverage.resolve_local_ref
        for field, value in (("request_schema_ref", "schema:opaque:v1"),
                             ("result_schema_ref", "schema:opaque:v1"),
                             ("check_id", "doctor.other"),
                             ("owner_doc_ref", "Plans/newtools.md"),
                             ("target_kinds", ["server"]),
                             ("side_effect_policy", "mutating")):
            def mutated(root, ref, field=field, value=value):
                result = original(root, ref)
                if ref == descriptor_ref:
                    result = copy.deepcopy(result)
                    result[field] = value
                return result
            with patch.object(coverage, "resolve_local_ref", mutated):
                failures = self.check(self.catalog)
            with self.subTest(descriptor_field=field):
                self.assertTrue(failures)

    def test_binding_without_the_typed_companion_fails_closed(self):
        original = coverage.resolve_local_ref

        def hidden(root, ref):
            if ref.startswith("Plans/doctor_application_update_owner_read_contracts.schema.json"):
                raise FileNotFoundError(ref)
            return original(root, ref)

        with patch.object(coverage, "resolve_local_ref", hidden):
            failures = self.check(self.catalog)
        self.assertIn("binding_owner_read_unresolved:Plans/doctor_application_update_owner_read_contracts.schema.json",
                      failures)

    def test_every_other_occurrence_stays_unbound_or_unchanged(self):
        for index, row in enumerate(self.catalog["occurrences"]):
            if index in (7, 42):
                continue
            with self.subTest(occurrence=row["occurrence_id"]):
                self.assertEqual("unbound", row["full_dimension_query_binding"])

    def test_pinned_source_census_is_unchanged(self):
        rows = self.catalog["occurrences"]
        self.assertEqual(52, len(rows))
        self.assertEqual(51, len({row["source_label"] for row in rows}))
        self.assertEqual(52, len({row["source_pointer"] for row in rows}))
        self.assertEqual(159, sum(len(row["required_dimensions"]) for row in rows))
        self.assertEqual(145, len({dimension for row in rows for dimension in row["required_dimensions"]}))
        self.assertEqual("all_source_occurrences_catalogued", self.catalog["coverage_status"])
        self.assertEqual("none", self.catalog["runtime_authority"])
        for index in (7, 42):
            self.assertEqual(["Plans/Release_Supply_Chain.md", "Plans/Server_System.md"],
                             rows[index]["owner_refs"])
            self.assertEqual(
                ["Plans/application_update_check_contracts.schema.json#/$defs/ApplicationCheckState",
                 "Plans/application_update_check_contracts.schema.json#/$defs/ApplicationSourceResult",
                 "Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandOutput"],
                rows[index]["schema_refs"],
            )

    def test_missing_duplicate_and_reordered_occurrences(self):
        for mode in ("missing", "duplicate", "reordered"):
            bad = copy.deepcopy(self.catalog)
            if mode == "missing":
                bad["occurrences"].pop()
            elif mode == "duplicate":
                bad["occurrences"][1] = copy.deepcopy(bad["occurrences"][0])
            else:
                bad["occurrences"][0], bad["occurrences"][1] = bad["occurrences"][1], bad["occurrences"][0]
            with self.subTest(mode=mode):
                self.assertTrue(self.check(bad))

    def test_every_exact_dimension_is_preserved(self):
        for i, row in enumerate(self.catalog["occurrences"]):
            for dimension in row["required_dimensions"]:
                bad = copy.deepcopy(self.catalog)
                bad["occurrences"][i]["required_dimensions"].remove(dimension)
                with self.subTest(occurrence=row["occurrence_id"], dimension=dimension):
                    self.assertTrue(self.check(bad))

    def test_both_app_update_occurrences_not_collapsed_or_independent(self):
        for i in (7, 42):
            bad = copy.deepcopy(self.catalog)
            bad["occurrences"][i]["shared_fact_key"] = None
            self.assertTrue(self.check(bad))
            bad = copy.deepcopy(self.catalog)
            bad["occurrences"][i]["source_label"] = "new_update_probe"
            self.assertTrue(self.check(bad))

    def test_no_runtime_authority_or_fabricated_support(self):
        for key, value in (("runtime_authority", "admitted"), ("leaf_binding_status", "complete")):
            bad = copy.deepcopy(self.catalog)
            bad[key] = value
            self.assertTrue(self.check(bad))
        for key, value in (("full_dimension_query_binding", "unsupported"),
                           ("command_id", "cmd.installation.repair"),
                           ("health", "healthy")):
            bad = copy.deepcopy(self.catalog)
            bad["occurrences"][0][key] = value
            self.assertTrue(self.check(bad))

    def test_source_identity_and_owner_are_closed(self):
        for path in ("source", "owner"):
            bad = copy.deepcopy(self.catalog)
            if path == "source":
                bad["source"]["document_sha256"] = "0" * 64
            else:
                bad["occurrences"][0]["owner_refs"] = ["Plans/newtools.md"]
            self.assertTrue(self.check(bad))

    def test_unresolved_schema_and_remote_ref_fail_closed(self):
        for reference in ("Plans/server_system_contracts.schema.json#/$defs/no_such_definition",
                          "https://example.com/schema.json", "Plans/../secret.json"):
            bad = copy.deepcopy(self.catalog)
            bad["occurrences"][0]["schema_refs"] = [reference]
            self.assertTrue(self.check(bad))

    def test_established_schema_credit_cannot_be_dropped(self):
        bad = copy.deepcopy(self.catalog)
        bad["occurrences"][0]["schema_refs"] = []
        self.assertTrue(self.check(bad))

    def test_actual_descriptor_cannot_be_mutating_or_wrong_route(self):
        original = coverage.resolve_local_ref
        for field, value in (("side_effect_policy", "mutating"),
                             ("request_schema_ref", "schema:opaque:v1"),
                             ("result_schema_ref", "schema:opaque:v1"),
                             ("check_id", "doctor.other"),
                             ("owner_doc_ref", "Plans/newtools.md")):
            def mutated(root, ref, field=field, value=value):
                result = original(root, ref)
                if ref == coverage.DESCRIPTOR_REF:
                    result = copy.deepcopy(result)
                    result[field] = value
                return result
            with patch.object(coverage, "resolve_local_ref", mutated):
                self.assertIn("bounded_leaf_descriptor_mismatch", self.check(self.catalog))

    def test_missing_native_binding_is_not_converted_to_unavailable(self):
        self.assertFalse(any(r["full_dimension_query_binding"] == "unsupported"
                             for r in self.catalog["occurrences"]))
        bad = copy.deepcopy(self.catalog)
        bad["occurrences"][34]["bounded_leaf"]["coverage"] = "complete"
        self.assertTrue(self.check(bad))

    def test_missing_actual_source_fails_closed(self):
        with patch.object(coverage, "resolve_local_ref", side_effect=FileNotFoundError):
            self.assertTrue(self.check(self.catalog))

    def test_central_gate_preserves_static_catalog_failures(self):
        spec = importlib.util.spec_from_file_location('doctor_catalog_gate',
            ROOT / 'scripts/pm-new-contracts-verify.py')
        gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gate)
        failures, counts = gate.validate_doctor_source_catalog()
        self.assertEqual(failures, [])
        self.assertEqual(counts['doctor_source_catalogs_valid'], 1)
        original = gate.load_json
        broken = copy.deepcopy(self.catalog)
        broken['occurrences'].pop()
        with patch.object(gate, 'load_json', side_effect=lambda path:
                broken if path.name == 'doctor_source_coverage.json' else original(path)):
            failures, counts = gate.validate_doctor_source_catalog()
        self.assertTrue(failures)
        self.assertEqual(counts['doctor_source_catalogs_valid'], 0)
        self.assertTrue(all(row['code'] == 'doctor_source_coverage_invalid' for row in failures))


if __name__ == "__main__":
    unittest.main()
