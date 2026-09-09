"""ATS-041 inventory and ATS-048 requirement-local static proof only."""

import importlib
import importlib.util
import json
import re
import unittest
from collections import Counter, defaultdict
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry


ROOT = Path(__file__).resolve().parents[1]
OWNER = ROOT / "Plans/Automated_Testing_System.md"
SCHEMA_REL = "Plans/egolite_retained_requirement_contracts.schema.json"
FIXTURE_REL = "Plans/egolite_retained_requirement_contract_fixtures.json"
REQUIREMENTS = (
    "HBU-005", "HBU-013", "BRW-010", "BRW-011", "SCM-005", "SCM-019",
    "ORI-002", "ORI-020", "IRT-008", "IRT-009", "IRT-010", "IRT-011",
    "SEC-003", "SEC-007", "SEC-008",
)
ROOT_NEGATIVES = {
    "root_missing_schema_id", "root_wrong_schema_id", "root_additional_property",
    "root_only_fourteen_contracts", "root_sixteen_contracts",
    "root_duplicate_requirement_loses_sec_008",
}
EXPECTED_NEGATIVE_COUNTS = dict(zip(REQUIREMENTS, (
    152, 97, 81, 155, 183, 165, 97, 177, 122, 158, 176, 125, 107, 88, 67,
)))
REUSED_SUITES = {
    "ORI-020": ["tests.test_pm_origin_retained_routes"],
    "IRT-008": ["tests.test_pm_installation_update_preferences"],
    "IRT-011": ["tests.test_pm_credential_attachment_lifetime"],
}


def load_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def yaml_block(text, first_line):
    matches = re.findall(
        r"```yaml\n(" + re.escape(first_line) + r"\n.*?)\n```", text, re.DOTALL
    )
    if len(matches) != 1:
        raise ValueError(f"expected one canonical block: {first_line}")
    return yaml.safe_load(matches[0])


spec = importlib.util.spec_from_file_location(
    "pm_retained_test_contract_verifier", ROOT / "scripts/pm-new-contracts-verify.py"
)
VERIFY = importlib.util.module_from_spec(spec)
spec.loader.exec_module(VERIFY)


class TestInventoryContracts(unittest.TestCase):
    def test_authored_corpus_counts_match_ats_041(self):
        # Reuse the gate's envelope readers, not a glob or an ignored report.
        pairs = VERIFY.CONTRACT_PAIRS
        self.assertEqual(len(pairs), 24)
        self.assertEqual(len(set(pairs)), 24)
        self.assertEqual(VERIFY.EXPECTED_CONTRACT_PAIR_COUNT, 24)
        counts = Counter()
        for schema_rel, fixture_rel in pairs:
            fixtures = load_json(fixture_rel)
            config = VERIFY.AUTHORED_COMMAND_PAIR_CONTRACTS.get(schema_rel)
            if config is None:
                positives = VERIFY.legacy_positive_cases(fixtures)
                negatives = [
                    case for key in ("invalid", "negative", "negative_cases", "pairwise_invalid")
                    for case in fixtures.get(key, [])
                ]
            else:
                positives = VERIFY.authored_positive_cases(
                    fixtures, request_mode=config["request_mode"]
                )
                negatives = VERIFY.authored_invalid_cases(fixtures)
            counts["positive"] += len(positives)
            counts["negative"] += len(negatives) + len(fixtures.get("negative_mutations", []))
        self.assertEqual(counts, {"positive": 923, "negative": 3110})
        unit = yaml_block(OWNER.read_text(encoding="utf-8"), "plan_unit_id: ATS-041")
        self.assertIn("24-pair", unit["canonical_text"])
        criteria = "\n".join(unit["acceptance_criteria"])
        for phrase in ("exactly 24 authored", "923 positive fixtures", "3110 negative fixtures"):
            self.assertIn(phrase, criteria)
        self.assertIn("2026-09-09", criteria)
        self.assertIn("static", unit["canonical_text"])

    def test_expansion_inventory_uses_exact_record_categories(self):
        pack = load_json(VERIFY.EXPANSION_FIXTURE_REL)
        fields = ("request", "result", "error", "availability", "disabled_reason", "permission")
        command_count = sum(len(set(fields) & set(case)) for case in pack["command_cases"])
        compatible_count = sum(
            len(set(fields) & set(case)) for case in pack["command_cases"]
            if case["schema_family"] in {"integration_credential", "execution_topology", "project_topology"}
        )
        local_count = sum(len({"request", "result"} & set(case)) for case in pack["local_action_cases"])
        actual = (command_count, compatible_count, local_count, len(pack["alias_cases"]), len(pack["negative_fixtures"]))
        self.assertEqual(actual, (264, 240, 28, 36, 21))
        # This separately executes only the verifier's twelve internal checks.
        self_tests, failures = VERIFY.run_internal_self_tests()
        self.assertEqual(self_tests, 12)
        self.assertEqual(failures, [])
        unit = yaml_block(OWNER.read_text(encoding="utf-8"), "plan_unit_id: ATS-041")
        criteria = "\n".join(unit["acceptance_criteria"])
        for phrase in (
            "264 expansion command records", "240 owner-compatibility command records",
            "28 expansion local records", "28 owner-local records", "36 expansion alias records",
            "21 expansion negative records", "12 internal negative tests",
        ):
            self.assertIn(phrase, criteria)


class EgoliteRetainedRequirementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.owner_text = OWNER.read_text(encoding="utf-8")
        cls.matrix = yaml_block(cls.owner_text, "matrix_id: ERT-15")
        cls.schema = load_json(SCHEMA_REL)
        cls.fixtures = load_json(FIXTURE_REL)
        cls.positives = VERIFY.legacy_positive_cases(cls.fixtures)
        cls.positive_by_name = {
            case["name"]: case.get("instance", case.get("record", case.get("value")))
            for case in cls.positives
        }
        if len(cls.positive_by_name) != len(cls.positives):
            raise ValueError("duplicate positive fixture names")
        names = [case["name"] for case in cls.fixtures["invalid"]]
        if len(set(names)) != len(names):
            raise ValueError("duplicate negative fixture names")
        cls.rows = {row["requirement_id"]: row for row in cls.matrix["rows"]}
        cls.validators = {
            requirement: VERIFY.validator_for(
                cls.schema, cls.schema["$defs"][requirement.lower().replace("-", "_")], Registry()
            ) for requirement in REQUIREMENTS
        }
        cls.owned_negatives = defaultdict(list)
        cls.aggregate_negatives = []
        for case in cls.fixtures["invalid"]:
            if case["name"] in ROOT_NEGATIVES:
                cls.aggregate_negatives.append(case)
                continue
            requirement, index = cls.negative_target(case)
            cls.owned_negatives[requirement].append((case, index))

    @classmethod
    def negative_target(cls, case):
        base = cls.positive_by_name[case["base_valid"]]
        if "contracts" not in base:
            requirement = base["requirement_id"]
            expected = requirement.lower().replace("-", "_")
            if case.get("definition") != expected:
                raise ValueError(f"wrong direct definition: {case['name']}")
            return requirement, None
        paths = list(case.get("patch", {})) + case.get("remove", [])
        matches = [re.fullmatch(r"contracts\.(\d+)\..+", path) for path in paths]
        if not paths or not all(matches):
            raise ValueError(f"unassigned/nonlocal recipe: {case['name']}")
        indices = {int(match.group(1)) for match in matches}
        if len(indices) != 1 or case.get("definition") not in (None, "<root>"):
            raise ValueError(f"ambiguous aggregate target: {case['name']}")
        index = indices.pop()
        return base["contracts"][index]["requirement_id"], index

    def test_matrix_covers_exact_owners_definitions_and_callable_tests(self):
        unit = yaml_block(self.owner_text, "plan_unit_id: ATS-048")
        self.assertIn("ERT-<requirement_id>-STATIC", unit["canonical_text"])
        self.assertIn("ERT-<requirement_id>-RUNTIME", unit["canonical_text"])
        self.assertIn("NOT_RUN", unit["canonical_text"])
        self.assertEqual(unit["node_compile_hint"]["create_worknodes"], False)
        self.assertEqual(unit["node_compile_hint"]["create_nodeseeds"], False)
        self.assertEqual(set(self.matrix), {"matrix_id", "runtime_status", "rows"})
        self.assertEqual(self.matrix["runtime_status"], "NOT_RUN")
        self.assertEqual(len(self.matrix["rows"]), 15)
        self.assertEqual(set(self.rows), set(REQUIREMENTS))
        self.assertEqual(set(self.schema["$defs"]["contract_identity"]["properties"]["requirement_id"]["enum"]), set(REQUIREMENTS))
        discovered = set(unittest.defaultTestLoader.getTestCaseNames(type(self)))
        static_ids, runtime_ids = set(), set()
        for requirement, row in self.rows.items():
            with self.subTest(requirement=requirement):
                expected_keys = {"requirement_id", "owner_ref", "definition", "gui_related", "static_method", "runtime_positive", "runtime_negative"}
                if requirement in REUSED_SUITES:
                    expected_keys.add("reused_tests")
                self.assertEqual(set(row), expected_keys)
                definition = requirement.lower().replace("-", "_")
                self.assertEqual(row["definition"], definition)
                # These identities live in allOf, whereas the aggregate gate's
                # discriminator fingerprint intentionally reads only root props.
                identity = {}
                for key in ("requirement_id", "owner_doc", "plan_unit_id"):
                    values = [
                        branch["properties"][key]["const"]
                        for branch in self.schema["$defs"][definition]["allOf"]
                        if "const" in branch.get("properties", {}).get(key, {})
                    ]
                    self.assertEqual(len(values), 1)
                    identity[key] = values[0]
                fingerprint = identity
                self.assertEqual(fingerprint["requirement_id"], requirement)
                owner_ref = fingerprint["owner_doc"] + "#" + fingerprint["plan_unit_id"]
                self.assertEqual(row["owner_ref"], owner_ref)
                product = yaml_block((ROOT / fingerprint["owner_doc"]).read_text(encoding="utf-8"), "plan_unit_id: " + fingerprint["plan_unit_id"])
                self.assertIsInstance(row["gui_related"], bool)
                self.assertEqual(row["gui_related"], product["gui_related"])
                self.assertEqual(row["static_method"], "test_" + definition)
                self.assertIn(row["static_method"], discovered)
                self.assertTrue(callable(getattr(self, row["static_method"])))
                for field in ("runtime_positive", "runtime_negative"):
                    self.assertIsInstance(row[field], str)
                    self.assertGreater(len(row[field].strip()), 80)
                self.assertEqual(row.get("reused_tests", []), REUSED_SUITES.get(requirement, []))
                for module_name in row.get("reused_tests", []):
                    suite = unittest.defaultTestLoader.loadTestsFromModule(importlib.import_module(module_name))
                    self.assertGreater(suite.countTestCases(), 0)
                static_ids.add(f"ERT-{requirement}-STATIC")
                runtime_ids.add(f"ERT-{requirement}-RUNTIME")
        self.assertEqual(len(static_ids), 15)
        self.assertEqual(len(runtime_ids), 15)
        self.assertFalse(static_ids & runtime_ids)

    def test_every_negative_has_one_reviewed_owner_or_root_control(self):
        self.assertEqual({case["name"] for case in self.aggregate_negatives}, ROOT_NEGATIVES)
        counts = {requirement: len(cases) for requirement, cases in self.owned_negatives.items()}
        self.assertEqual(counts, EXPECTED_NEGATIVE_COUNTS)
        self.assertEqual(sum(counts.values()) + len(self.aggregate_negatives), len(self.fixtures["invalid"]))
        self.assertEqual(len(self.fixtures["invalid"]), 1956)

    def test_aggregate_membership_and_identity_controls(self):
        self.assertEqual(set(self.positive_by_name), {
            "aggregate_all_15", "aggregate_all_15_reordered",
            "irt008_notify_only", "irt008_disabled_quiet", "irt008_one_operation_consent",
            "irt008_delegated_maintenance", "irt008_pm_managed_auto", "irt008_auto_requested_without_grant",
        })
        Draft202012Validator.check_schema(self.schema)
        validator = Draft202012Validator(self.schema)
        for case in self.positives:
            value = self.positive_by_name[case["name"]]
            if "contracts" in value:
                with self.subTest(positive=case["name"]):
                    validator.validate(value)
                    self.assertEqual(VERIFY.egolite_semantic_failures("<root>", value), [])
                    self.assertEqual(Counter(record["requirement_id"] for record in value["contracts"]), Counter(REQUIREMENTS))
        for case in self.aggregate_negatives:
            with self.subTest(negative=case["name"]):
                self.assertFalse(validator.is_valid(VERIFY.materialize_invalid(case, self.positive_by_name)))

    def test_negative_target_rejects_ambiguous_or_unassigned_recipes(self):
        invalid_recipes = (
            {"name": "two_targets", "base_valid": "aggregate_all_15", "patch": {"contracts.0.pinned": False, "contracts.1.label_safe": False}},
            {"name": "hidden_root_target", "base_valid": "aggregate_all_15", "patch": {"schema_id": "wrong"}},
            {"name": "empty_recipe", "base_valid": "aggregate_all_15", "patch": {}},
            {"name": "wrong_direct_definition", "base_valid": "irt008_notify_only", "definition": "hbu_005", "patch": {"management_source": "unknown"}},
        )
        for case in invalid_recipes:
            with self.subTest(case=case["name"]):
                with self.assertRaises(ValueError):
                    self.negative_target(case)

    def check_requirement(self, requirement):
        validator = self.validators[requirement]
        definition = self.rows[requirement]["definition"]
        positives = 0
        for case in self.positives:
            value = self.positive_by_name[case["name"]]
            records = value.get("contracts", [value])
            for record in records:
                if record.get("requirement_id") != requirement:
                    continue
                with self.subTest(requirement=requirement, positive=case["name"]):
                    validator.validate(record)
                    self.assertEqual(VERIFY.egolite_semantic_failures(definition, record), [])
                    self.assertEqual(record["proof_boundary"]["source_static_closed"], True)
                    self.assertTrue(all(value is False for key, value in record["proof_boundary"].items() if key != "source_static_closed"))
                positives += 1
        self.assertEqual(positives, 8 if requirement == "IRT-008" else 2)
        cases = self.owned_negatives[requirement]
        self.assertEqual(len(cases), EXPECTED_NEGATIVE_COUNTS[requirement])
        for case, index in cases:
            with self.subTest(requirement=requirement, negative=case["name"]):
                base = self.positive_by_name[case["base_valid"]]
                mutated = VERIFY.materialize_invalid(case, self.positive_by_name)
                if index is None:
                    record = mutated
                    original = base
                else:
                    self.assertEqual(set(mutated), set(base))
                    self.assertEqual(len(mutated["contracts"]), len(base["contracts"]))
                    self.assertEqual(
                        [item for offset, item in enumerate(mutated["contracts"]) if offset != index],
                        [item for offset, item in enumerate(base["contracts"]) if offset != index],
                    )
                    self.assertEqual(mutated["schema_id"], base["schema_id"])
                    record, original = mutated["contracts"][index], base["contracts"][index]
                self.assertNotEqual(record, original)
                accepted = validator.is_valid(record)
                if "semantic_rule" in case:
                    self.assertTrue(accepted, "semantic rejection must not borrow a structural failure")
                    self.assertEqual(case["semantic_rule"], "credential_attachment_lifetime_not_positive")
                    self.assertEqual(VERIFY.egolite_semantic_failures(definition, record), [case["semantic_rule"]])
                else:
                    self.assertFalse(accepted, "the exact target definition must reject, not a sibling/root")

    def test_hbu_005(self):
        self.check_requirement("HBU-005")

    def test_hbu_013(self):
        self.check_requirement("HBU-013")

    def test_brw_010(self):
        self.check_requirement("BRW-010")

    def test_brw_011(self):
        self.check_requirement("BRW-011")

    def test_scm_005(self):
        self.check_requirement("SCM-005")

    def test_scm_019(self):
        self.check_requirement("SCM-019")

    def test_ori_002(self):
        self.check_requirement("ORI-002")

    def test_ori_020(self):
        self.check_requirement("ORI-020")

    def test_irt_008(self):
        self.check_requirement("IRT-008")

    def test_irt_009(self):
        self.check_requirement("IRT-009")

    def test_irt_010(self):
        self.check_requirement("IRT-010")

    def test_irt_011(self):
        self.check_requirement("IRT-011")

    def test_sec_003(self):
        self.check_requirement("SEC-003")

    def test_sec_007(self):
        self.check_requirement("SEC-007")

    def test_sec_008(self):
        self.check_requirement("SEC-008")


if __name__ == "__main__":
    unittest.main()
