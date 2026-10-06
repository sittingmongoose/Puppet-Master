#!/usr/bin/env python3
"""Zero-inference byte/contract checks; no native calls, Goals or source judgments."""
import copy
import hashlib
import io
import json
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parents[2]
PAIRS = ("D-V02-A", "D-V07-A")
ARMS = ("control", "treatment")


def read(p):
    return json.loads(Path(p).read_text())


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def expected_delta(pair, body):
    # Independent literal expectations, not the builder's transformation helper.
    if pair == "D-V02-A":
        old, new = b" Candidate binds source/type/unit/domain before choosing examples.", b""
    else:
        old = b"Candidate identifies consequence order; no evaluator risk ranking is supplied."
        new = b"No evaluator risk ranking is supplied."
    if body.count(old) != 1:
        raise AssertionError("Expected exactly one original procedural clause")
    return body.replace(old, new)


def original(pair, arm):
    return LAB / "dev/diagnostic-runner/seed-recovery/prepared" / pair / f"{pair}-{arm}-diagnostic-a001"


def version(pair):
    return ROOT / "versions/neutral-r1" / pair


def stage_root(pair, arm):
    return version(pair) / f"{pair}-{arm}-diagnostic-a001-resource-v13-neutral-r1-a003"


def inputs(ws):
    return {p.relative_to(ws / "inputs").as_posix(): p.read_bytes()
            for p in (ws / "inputs").rglob("*") if p.is_file()}


class Contracts(unittest.TestCase):
    def test_01_immutable_source_inventory_and_16_methods(self):
        pins = read(ROOT / "SOURCE_PINS.json")
        self.assertEqual((pins["original_design_methods"], pins["original_design_domains"]), (16, 2))
        indexed = {r["path"]: r["sha256"] for r in pins["files"]}
        for r in pins["files"]:
            self.assertEqual(sha(r["path"]), r["sha256"], r["path"])
        for method in range(1, 17):
            for domain in ("A", "B"):
                for suffix in (".json", "-TASK.md", "-CONTROL.md", "-TREATMENT.md", "-coverage.json"):
                    self.assertIn(str(LAB / f"cases/diagnostics/D-V{method:02}-{domain}{suffix}"), indexed)

    def test_02_both_arm_positive_zero_start_receipt(self):
        zero = read(LAB / "ops/dispatcher/NEUTRAL_PAIR_REPAIR_ZERO_START_CONFIRMATION.json")
        self.assertTrue(zero["no_native_starts"])
        self.assertEqual(len(zero["rows"]), 4)
        self.assertEqual({r["job_id"] for r in zero["rows"]},
                         {f"{p}-{a}-diagnostic-a001-resource-v13-a002" for p in PAIRS for a in ARMS})
        for r in zero["rows"]:
            self.assertEqual(r["native_goal_starts"], 0)
            self.assertEqual(r["status"], "HELD_PROSPECTIVE_NEUTRAL_PAIR_REPAIR")
            self.assertIsNone(r["activation_observed"])
            self.assertIsNone(r["unit"])
            self.assertIsNone(r["start_utc"])
            for name in ("card", "prepared_stage", "stage"):
                self.assertEqual(sha(r[name + "_path" if name == "card" else name + "_json"]), r[name + "_sha256"])

    def test_03_exact_neutral_and_runtime_prompt_delta(self):
        for pair in PAIRS:
            before = (LAB / f"cases/diagnostics/{pair}-TASK.md").read_bytes()
            self.assertEqual((version(pair) / "NEUTRAL_TASK.md").read_bytes(), expected_delta(pair, before))
            for arm in ARMS:
                old_ws = original(pair, arm) / "workspace"
                new_ws = stage_root(pair, arm) / "workspace"
                for name in ("TASK.md", "inputs/diagnostic_task.md"):
                    self.assertEqual((new_ws / name).read_bytes(), expected_delta(pair, (old_ws / name).read_bytes()))
                runtime = LAB / f"ops/dispatcher/runs/{pair}-{arm}-diagnostic-a001-resource-v13-a002/workspace"
                self.assertEqual((runtime / "TASK.md").read_bytes(), (old_ws / "TASK.md").read_bytes())

    def test_04_whole_input_inventory_unchanged_except_neutral(self):
        for pair in PAIRS:
            for arm in ARMS:
                before = inputs(original(pair, arm) / "workspace")
                after = inputs(stage_root(pair, arm) / "workspace")
                self.assertEqual(set(before), set(after))
                self.assertEqual(sum(name.startswith("source_context/") and name.endswith(".body") for name in after), 33)
                for name, body in before.items():
                    expected = expected_delta(pair, body) if name == "diagnostic_task.md" else body
                    self.assertEqual(after[name], expected, name)
                self.assertFalse(any(p.is_file() for p in (stage_root(pair, arm) / "workspace/out").rglob("*")))

    def test_05_matched_pair_outside_arm_modifier(self):
        for pair in PAIRS:
            control = inputs(stage_root(pair, "control") / "workspace")
            treatment = inputs(stage_root(pair, "treatment") / "workspace")
            self.assertNotEqual(control.pop("arm_instruction.md"), treatment.pop("arm_instruction.md"))
            self.assertEqual(control, treatment)
            rendered = []
            for arm in ARMS:
                ws = stage_root(pair, arm) / "workspace"
                modifier = (ws / "inputs/arm_instruction.md").read_bytes()
                task = (ws / "TASK.md").read_bytes()
                self.assertEqual(task.count(modifier), 1)
                rendered.append(task.replace(modifier, b"<DECLARED_ARM_MODIFIER>"))
            self.assertEqual(*rendered)

    def test_06_actual_criteria_12_obligations_and_role_retained(self):
        self.assertEqual(sha(LAB / "cases/common_criteria.json"), "344135779883060be49d7e389f9dd160e30267247d90269710cb283877602f44")
        coverage = read(LAB / "cases/coverage/development-A.json")
        self.assertEqual([o["id"] for o in coverage["obligations"]], [f"A{x:02}" for x in range(1, 13)])
        self.assertTrue(all(o["required"] for o in coverage["obligations"]))
        metadata = {"card_version", "case_id", "neutral_task_prompt_path", "setup_version", "prospective_setup_lineage", "task"}
        for pair in PAIRS:
            before = read(LAB / f"cases/diagnostics/{pair}.json")
            after = read(version(pair) / "card.json")
            self.assertEqual(after["task"].encode(), expected_delta(pair, before["task"].encode()))
            self.assertEqual({k:v for k,v in before.items() if k not in metadata},
                             {k:v for k,v in after.items() if k not in metadata})
            self.assertEqual(after["setup_version"], "neutral-r1")
            self.assertEqual(len(after["important_checks"]), 3)
            old_freeze = read(original(pair, "control").parent / "PAIR_SOURCE_FREEZE.json")
            new_freeze = read(version(pair) / "PAIR_SOURCE_FREEZE.json")
            changed = {"card_ref", "setup_version", "neutral_task_ref", "prospective_setup_lineage", "created_utc"}
            self.assertEqual({k:v for k,v in old_freeze.items() if k not in changed},
                             {k:v for k,v in new_freeze.items() if k not in changed})

    def test_07_prepared_stage_semantics_and_pins(self):
        allowed = {"job_id", "workspace", "prompt_file", "prompt_sha256", "out", "input_pins", "pair_freeze", "freeze_out"}
        stages = []
        for pair in PAIRS:
            for arm in ARMS:
                before = read(original(pair, arm) / "prepared-stage.json")
                after = read(stage_root(pair, arm) / "prepared-stage.json")
                self.assertEqual({k:v for k,v in before.items() if k not in allowed},
                                 {k:v for k,v in after.items() if k not in allowed})
                for path, digest in after["input_pins"].items():
                    self.assertEqual(sha(path), digest)
                self.assertEqual(sha(after["prompt_file"]), after["prompt_sha256"])
                self.assertEqual(sha(after["pair_freeze"]["path"]), after["pair_freeze"]["sha256"])
                self.assertEqual(after["max_seconds"], 600)
                self.assertIsNone(after["max_responses"])
                stages.append({k:v for k,v in after.items() if k not in allowed | {"arm", "pair_id"}})
        self.assertTrue(all(s == stages[0] for s in stages))

    def test_08_model_tools_resource_budget_pin_parity_not_old_family_claim(self):
        expectations = read(ROOT / "RUNTIME_EXPECTATIONS.json")
        ready_ref = expectations["runtime_binding_ready"]
        self.assertEqual(sha(ready_ref["path"]), ready_ref["sha256"])
        ready = read(ready_ref["path"])
        self.assertTrue(ready["stage_runner"].endswith("/versions/v1.3/dynamic_stage_runner.py"))
        self.assertTrue(ready["worker_path"].endswith("/luna_worker_v5.py"))
        self.assertTrue(ready["tools_config_builder"].endswith("/tools/versions/v1.3/config.py"))
        self.assertEqual(sha(ready["resource_definition"]["path"]), ready["resource_definition"]["sha256"])
        comparisons = []
        for arm in expectations["arms"]:
            source = read(arm["predecessor_stage"]["path"])
            self.assertEqual(sha(arm["predecessor_stage"]["path"]), arm["predecessor_stage"]["sha256"])
            self.assertEqual(source["luna_runtime"], arm["luna_runtime"])
            self.assertEqual(arm["luna_runtime"]["source_pins"], ready["source_pins"])
            self.assertEqual(arm["luna_runtime"]["stage_runner"], ready["stage_runner"])
            comparisons.append({k:v for k,v in arm.items() if k not in {"pair_id", "arm", "predecessor_job_id", "new_job_id", "predecessor_stage"}})
        self.assertTrue(all(c == comparisons[0] for c in comparisons))
        # Preserved expectations require ops' fresh binding; no new observation of model uptake is asserted.
        self.assertEqual(expectations["native_Goals"], 0)

    def test_09_registration_whole_pair_and_exact_lineage(self):
        all_ids = []
        for pair in PAIRS:
            box = read(version(pair) / "REGISTRATION_OUTBOX.json")
            self.assertEqual(len(box["requests"]), 2)
            self.assertEqual(box["new_native_starts"], 0)
            self.assertTrue(box["fresh_runtime_seal_required"])
            for pointer in box["requests"]:
                self.assertEqual(sha(pointer["path"]), pointer["sha256"])
                request = read(pointer["path"])
                self.assertEqual(request["schema"], "er9.dispatch-registration.v1")
                self.assertEqual((request["pair_id"], request["source_slot"], request["setup_version"]), (pair, pair, "neutral-r1"))
                self.assertEqual((request["family"], request["requested_model"], request["requested_effort"]), ("L", "GPT-6 Luna", "Max"))
                self.assertEqual(sha(request["card_path"]), request["card_sha256"])
                self.assertEqual(len(request["stage_jobs"]), 1)
                job = request["stage_jobs"][0]
                self.assertEqual(sha(job["stage_json"]), job["stage_sha256"])
                self.assertEqual(job["predecessor_job_id"], f"{pair}-{job['arm']}-diagnostic-a001-resource-v13-a002")
                self.assertEqual(job["prerequisite_job_ids"], [])
                self.assertTrue(job["public_get"] and job["execution_enabled"])
                for path, digest in job["additional_prelaunch_pins"].items():
                    self.assertEqual(sha(path), digest)
                all_ids.append(job["job_id"])
        self.assertEqual(len(set(all_ids)), 4)


if __name__ == "__main__":
    output = io.StringIO()
    result = unittest.TextTestRunner(stream=output, verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Contracts))
    print(output.getvalue(), end="")
    report = {"schema": "er9.contrast-repair-zero-inference-verification.v1",
              "recorded_utc": datetime.now(timezone.utc).isoformat(), "tests": result.testsRun,
              "failures": len(result.failures), "errors": len(result.errors),
              "status": "PASS" if result.wasSuccessful() else "FAIL", "native_Goals": 0, "model_calls": 0,
              "source_answers_or_evaluator_feedback_authored": False,
              "test_source": {"path": str(Path(__file__).resolve()), "sha256": sha(__file__)},
              "source_pins": {"path": str(ROOT / "SOURCE_PINS.json"), "sha256": sha(ROOT / "SOURCE_PINS.json")},
              "test_output": output.getvalue(),
              "scientific_limit": "Byte/contract isolation proof only. Actual method uptake, source suitability, quality and effect remain unassessed."}
    report_path = ROOT / "VERIFICATION.json"
    if report_path.exists():
        raise SystemExit("Preserve frozen verification; use unittest for a read-only rerun.")
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    raise SystemExit(0 if result.wasSuccessful() else 1)
