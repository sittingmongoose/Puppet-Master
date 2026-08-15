#!/usr/bin/env python3
"""Candidate-10 run verifier facade with process-completion admission.

Candidate-9 remains the semantic/run-verification baseline.  This facade
rebinds candidate custody and inserts one generic pre-receipt gate: every
completed receipt must have a canonical invocation-completion observation.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path
import stat
import sys
from types import ModuleType
from typing import Any

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v10"
BASE_PATH = SUCCESSOR / "model_retest_r8_candidate_v9/r8_run_verifier.py"
PROCESS_PATH = ROOT / "r8_process_controller.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-10"
CANDIDATE_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "counterfactual_holdouts.json", "deterministic_preflight_report.json",
    "independent_preseal_audit.json", "process_completion_contract.json",
    "r8_harness.py", "r8_process_controller.py", "r8_run_verifier.py",
    "r8_subject_task_driver.py", "revision_lineage.json", "verifier_contract.json",
)


def _module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"module import unavailable: {path.name}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


BASE = _module(BASE_PATH, "pw_r8_candidate_v9_run_verifier_for_v10")
PROCESS = _module(PROCESS_PATH, "pw_r8_candidate_v10_process_for_verifier")

# Candidate/run/dispatch custody bindings only.  Semantic packet, oracle,
# scorer, routes, and response acceptance stay in the immutable v9 baseline.
BASE.ROOT = ROOT
BASE.HARNESS = ROOT / "r8_harness.py"
BASE.CANDIDATE_ID = CANDIDATE_ID
BASE.FREEZE_MANIFEST_REL = "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v10_freeze_manifest.json"
BASE.FREEZE_MANIFEST = REPO / BASE.FREEZE_MANIFEST_REL
BASE.CANDIDATE_ROOT_REL = "model_retest_r8_candidate_v10"
BASE.CANDIDATE_REQUIRED_FILES = CANDIDATE_FILES
BASE.CANDIDATE_NON_AUDIT_FILES = tuple(name for name in CANDIDATE_FILES if name != "independent_preseal_audit.json")

# The v9 validator names its audit generation in one literal.  Candidate-10
# retains the audit shape and uses the unavoidable candidate-local schema id.
_original_validate_audit = BASE.validate_audit


def _validate_audit(path: Path, binding: dict[str, Any], current_bundle: dict[str, Any]) -> dict[str, Any]:
    data = BASE.regular(path, "independent preseal audit")
    audit = BASE.strict_object(data, "independent preseal audit", canonical=False)
    schema = audit.get("schema_id")
    if schema != "pw-r8-candidate-v10-independent-preseal-audit-v1":
        raise BASE.Invalid("independent preseal audit schema is not candidate-v10")
    adapted = dict(audit)
    adapted["schema_id"] = "pw-r8-candidate-v9-independent-preseal-audit-v1"
    original_strict = BASE.strict_object

    def strict_override(blob: bytes, label: str, canonical: bool = True):
        if label == "independent preseal audit" and blob == data:
            return adapted
        return original_strict(blob, label, canonical=canonical)

    BASE.strict_object = strict_override
    try:
        result = _original_validate_audit(path, {**binding, "schema_id": adapted["schema_id"]}, current_bundle)
    finally:
        BASE.strict_object = original_strict
    result["schema_id"] = schema
    return result


BASE.validate_audit = _validate_audit


def _validate_layout(root: Path, cells: tuple[str, ...]) -> None:
    root_names = {"run_contract.json","dispatch_schedule.json","ordered_schedule.json","subject_call_accounting.json","validation_report.json","artifact_manifest.json","matrix_terminal.json"}
    cell_set, stage_set = set(cells), set(BASE.STAGES)
    for path in root.rglob("*"):
        info = path.lstat(); parts = path.relative_to(root).parts
        if stat.S_ISDIR(info.st_mode):
            allowed = (
                (len(parts) == 1 and parts[0] in {*BASE.SLOTS,"direct_appserver_receipts","invocation_completions","controller_invalid","path_terminals"})
                or (len(parts) == 2 and ((parts[0] in BASE.SLOTS and parts[1] in {"rendered","captures","scores","artifacts"}) or (parts[0] == "controller_invalid" and parts[1] in BASE.SLOTS)))
                or (len(parts) == 3 and parts[0] == "controller_invalid" and parts[1] in BASE.SLOTS and parts[2] in cell_set)
            )
            if not allowed:
                raise BASE.Invalid(f"directory outside closed-world run layout: {path.relative_to(root)}")
            continue
        if not stat.S_ISREG(info.st_mode):
            raise BASE.Invalid(f"nonregular evidence entry: {path}")
        allowed = False
        if len(parts) == 1 and parts[0] in root_names:
            allowed = True
        elif len(parts) == 2 and parts[0] in {"direct_appserver_receipts","invocation_completions"} and any(parts[1] == f"{slot}_{cell}.json" for slot in BASE.SLOTS for cell in cells):
            allowed = True
        elif len(parts) == 2 and parts[0] == "path_terminals" and parts[1] in {f"{slot}.json" for slot in BASE.SLOTS}:
            allowed = True
        elif len(parts) == 4 and parts[0] == "controller_invalid" and parts[1] in BASE.SLOTS and parts[2] in cell_set and BASE.re.fullmatch(r"attempt-[0-9]{4}\.json", parts[3]):
            allowed = True
        elif len(parts) == 3 and parts[0] in BASE.SLOTS:
            if parts[1] in ("captures","scores") and parts[2].endswith(".json") and parts[2][:-5] in cell_set:
                allowed = True
            elif parts[1] == "rendered" and parts[2].endswith(".txt") and parts[2][:-4] in cell_set:
                allowed = True
            elif parts[1] == "artifacts" and parts[2].endswith(".json") and parts[2][:-5] in stage_set:
                allowed = True
        if not allowed:
            raise BASE.Invalid(f"file outside closed-world run layout: {path.relative_to(root)}")


BASE.validate_layout = _validate_layout
_original_completed_receipt = BASE.completed_receipt


def _completed_receipt(root: Path, slot: str, cell: str):
    storage, receipt, binding = _original_completed_receipt(root, slot, cell)
    try:
        observation = PROCESS.validate_persisted_completion(root, slot, cell, receipt_storage=storage)
    except PROCESS.ProcessCompletionError as exc:
        raise BASE.Invalid(f"process completion admission failed: {exc}") from exc
    binding = {**binding, "invocation_completion_observation": {
        "schema_id": observation["schema_id"],
        "status": observation["status"],
        "outer_exec_terminal_observed": observation["outer_exec_terminal_observed"],
        "outer_exec_exit_code": observation["outer_exec_exit_code"],
        "receipt_storage_sha256": observation["receipt_storage_sha256"],
        "receipt_storage_bytes": observation["receipt_storage_bytes"],
    }}
    return storage, receipt, binding


BASE.completed_receipt = _completed_receipt
_original_adversarial = BASE.adversarial_in_memory_proofs


def _adversarial_in_memory_proofs() -> dict[str, Any]:
    result = _original_adversarial()
    holdouts = PROCESS.process_completion_holdouts()
    result.update({
        "schema_id": "pw-r8-candidate-v10-adversarial-in-memory-proofs-v1",
        "candidate_id": CANDIDATE_ID,
        "process_completion_proof_count": holdouts["cases"],
        "process_completion_proofs": holdouts["results"],
        "process_completion_answer_cell_model_specific_logic": False,
    })
    return result


BASE.adversarial_in_memory_proofs = _adversarial_in_memory_proofs


def main() -> int:
    return BASE.main()


if __name__ == "__main__":
    raise SystemExit(main())
