"""Synthetic offline corruption, identity and containment contract fixtures."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import verify_public as checker

HERE = Path(__file__).resolve().parent

def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data))

def fixture(root):
    cohort = root / "cohort"
    cohort.mkdir()
    payload = cohort / "public/evidence.bin"
    payload.parent.mkdir()
    payload.write_bytes(b"synthetic public evidence\n")
    export = {"artifacts": [{"public_path": "public/evidence.bin", "public_sha256": hashlib.sha256(payload.read_bytes()).hexdigest()}]}
    write(cohort / "PUBLIC_EXPORT.json", export)
    cases = {}
    for pair in range(6):
        for arm in ("control", "treatment"):
            case_id, pair_id = f"SYN-{pair}-{arm}", f"SYN-{pair}"
            rel = f"cases/{case_id}/manifest.json"
            cases[case_id] = {"manifest": "LAB_ROOT/" + rel, "pair_id": pair_id, "arm": arm}
            caps = {"research_proposal_seconds": 1200, "candidate_critic_seconds": 1200,
                    "final_correction_seconds": 900, "summed_stage_hard_seconds": 3300,
                    "host_overhead_hard_seconds": 300, "case_occupied_hard_seconds": 5400,
                    "case_wall_hard_seconds": 3600,
                    "research_response_cap": 160, "critic_response_cap": 160, "correction_response_cap": 160}
            stages = [{"reservation_id": case_id + "-" + role, "seconds": seconds} for role, seconds in (("research-proposal", 1200), ("independent-candidate-critic", 1200), ("final-correction", 900))]
            write(cohort / rel, {"case_id": case_id, "pair_id": pair_id, "pair_arm": arm, "stages": stages, "caps": caps})
    mapping = {"schema": "synthetic-schema", "cases": cases}
    write(cohort / checker.MAP_PATH, mapping)
    return cohort, export, mapping

class Contracts(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="fixture-", dir=HERE)
        self.root = Path(self.temp.name)
        self.cohort, self.export, self.mapping = fixture(self.root)
        self.case = next(iter(self.mapping["cases"]))
        self.manifest_path = self.cohort / self.mapping["cases"][self.case]["manifest"][9:]

    def tearDown(self):
        self.temp.cleanup()

    def reject(self):
        with self.assertRaises((checker.CheckError, OSError)):
            checker.verify(self.cohort)

    def mutate_manifest(self, mutate):
        manifest = json.loads(self.manifest_path.read_text())
        mutate(manifest)
        write(self.manifest_path, manifest)

    def test_actual_nested_dict_twelve_paired_positive(self):
        result = checker.verify(self.cohort)
        self.assertEqual(result["verified_artifacts"], 1)
        self.assertTrue(result["timing_declarations_present_and_valid"])
        self.assertFalse(result["native_replay_verified"])
        self.assertFalse(result["model_quality_assessed"])

    def test_missing_optional_map_is_hash_only(self):
        (self.cohort / checker.MAP_PATH).unlink()
        self.assertFalse(checker.verify(self.cohort)["timing_declarations_present_and_valid"])

    def test_file_corruption(self):
        (self.cohort / "public/evidence.bin").write_bytes(b"tampered")
        self.reject()

    def test_invalid_hash_syntax(self):
        self.export["artifacts"][0]["public_sha256"] = "g" * 64
        write(self.cohort / "PUBLIC_EXPORT.json", self.export)
        self.reject()

    def test_artifact_parent_and_absolute_paths(self):
        for path in ("../outside.bin", str(self.root / "outside.bin")):
            with self.subTest(path=path):
                self.export["artifacts"][0]["public_path"] = path
                write(self.cohort / "PUBLIC_EXPORT.json", self.export)
                self.reject()

    def test_manifest_parent_and_absolute_paths(self):
        for path in ("LAB_ROOT/../manifest.json", str(self.manifest_path), "LAB_ROOT/" + str(self.manifest_path)):
            with self.subTest(path=path):
                self.mapping["cases"][self.case]["manifest"] = path
                write(self.cohort / checker.MAP_PATH, self.mapping)
                self.reject()

    def test_export_metadata_symlink(self):
        p = self.cohort / "PUBLIC_EXPORT.json"
        target = self.root / "outside-export.json"
        p.rename(target)
        p.symlink_to(target)
        self.reject()

    def test_input_map_metadata_symlink(self):
        p = self.cohort / checker.MAP_PATH
        target = self.root / "outside-map.json"
        p.rename(target)
        p.symlink_to(target)
        self.reject()

    def test_dangling_optional_map_symlink_is_not_absent(self):
        p = self.cohort / checker.MAP_PATH
        p.unlink()
        p.symlink_to(self.root / "missing.json")
        self.reject()

    def test_manifest_metadata_symlink(self):
        target = self.root / "outside-manifest.json"
        self.manifest_path.rename(target)
        self.manifest_path.symlink_to(target)
        self.reject()

    def test_artifact_parent_directory_symlink(self):
        p = self.cohort / "public"
        target = self.root / "outside-public"
        p.rename(target)
        p.symlink_to(target, target_is_directory=True)
        self.reject()

    def test_cohort_symlink(self):
        alias = self.root / "alias"
        alias.symlink_to(self.cohort, target_is_directory=True)
        with self.assertRaises(checker.CheckError):
            checker.verify(alias)

    def test_inconsistent_declared_stage_caps(self):
        self.mutate_manifest(lambda m: m["caps"].update(candidate_critic_seconds=600))
        self.reject()

    def test_stage_seconds_wrong_even_if_other_caps_right(self):
        self.mutate_manifest(lambda m: m["stages"][1].update(seconds=600))
        self.reject()

    def test_duplicate_arms_fail_before_overwrite(self):
        assignment = self.mapping["cases"]["SYN-0-treatment"]
        assignment["arm"] = "control"
        p = self.cohort / assignment["manifest"][9:]
        m = json.loads(p.read_text())
        m["pair_arm"] = "control"
        write(p, m)
        write(self.cohort / checker.MAP_PATH, self.mapping)
        self.reject()

    def test_case_pair_arm_identity_mismatches(self):
        original = json.loads(self.manifest_path.read_text())
        for key, value in (("case_id", "OTHER"), ("pair_id", "OTHER"), ("pair_arm", "treatment")):
            with self.subTest(key=key):
                m = copy.deepcopy(original)
                m[key] = value
                write(self.manifest_path, m)
                self.reject()

    def test_assignment_id_mismatch(self):
        self.mapping["cases"][self.case]["case_id"] = "OTHER"
        write(self.cohort / checker.MAP_PATH, self.mapping)
        self.reject()

    def test_wrong_case_reservation_same_role_suffix(self):
        self.mutate_manifest(lambda m: m["stages"][1].update(reservation_id="OTHER-independent-candidate-critic"))
        self.reject()

    def test_response_cap_missing(self):
        self.mutate_manifest(lambda m: m["caps"].pop("critic_response_cap"))
        self.reject()

    def test_conflicting_wall_elapsed_caps(self):
        self.mutate_manifest(lambda m: m["caps"].update(case_elapsed_hard_seconds=3700))
        self.reject()

    def test_duplicate_json_keys(self):
        (self.cohort / checker.MAP_PATH).write_text('{"cases":{},"cases":{}}')
        self.reject()

    def test_non_dict_cases_schema(self):
        write(self.cohort / checker.MAP_PATH, {"schema": "synthetic", "cases": list(self.mapping["cases"].values())})
        self.reject()

    def test_duplicate_artifact_entry(self):
        self.export["artifacts"].append(copy.deepcopy(self.export["artifacts"][0]))
        write(self.cohort / "PUBLIC_EXPORT.json", self.export)
        self.reject()

    def test_pairwise_extra_cap_declaration_mismatch(self):
        self.mutate_manifest(lambda m: m["caps"].update(additional_declared_limit=12))
        self.reject()

    def test_duplicate_manifest_reference(self):
        self.mapping["cases"]["SYN-0-treatment"]["manifest"] = self.mapping["cases"][self.case]["manifest"]
        write(self.cohort / checker.MAP_PATH, self.mapping)
        self.reject()

if __name__ == "__main__":
    unittest.main(verbosity=2)
