#!/usr/bin/env python3
"""Independent data-only checker for the V18 Goal harness."""

from __future__ import annotations

import argparse
import ast
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
from typing import Any


SCHEMA = "pw-r9-goal-mode-v18-harness-independent-check-v1"
HARNESS = ("goal_mode_empirical_harness_v18/goal_mode_harness.py", 14459, "2de9c58b90be2a7ad470913f6c8727a622b8c9e1399f35b7806cc6d5f252f0f7")
ATTESTOR = ("goal_mode_empirical_harness_v18/goal_mode_three_turn_attestor.py", 22940, "23f134b8c41667fcb320cdf208ac6212964f0f0bde70f59b9a24be5a4ba7a0b5")
CONTRACT = ("goal_mode_empirical_harness_v18/goal_mode_contract.json", 2121, "f90214de469eed5063782d7ac261a58d24fa19ba162e5a5650bf20521a500388")
DESIGN = ("r9_goal_mode_v18_exact_ordered_goal_batch_and_pure_reopen_successor_design_v1.json", 3008, "e8518ec73bf3f1d2eb6a6cfdbc3bcabcafb0f4be14065388cac1015d1dd74f77")
V17_FAILURE = ("r9_goal_mode_v17_three_turn_canary_001_runtime_failure_receipt_v1.json", 5681, "9f9d985e5ac801ad989685c0424938153141f16d8f8ba36df86b927bf713e4ad")
ROW_002_THREAD = "01a029b1-91e3-78f2-8f61-f8596276e262"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in items:
        require(key not in value, f"duplicate JSON key:{key}")
        value[key] = item
    return value


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode()
    return raw + (b"\n" if newline else b"")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def identity(base: Path, row: tuple[str, int, str]) -> dict[str, Any]:
    relative, size, digest = row
    path = base / relative
    raw = read_regular(path)
    result = {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": relative, "sha256": sha(raw)}
    require(result == {"bytes": size, "mode": "0644", "path": relative, "sha256": digest}, f"identity:{relative}")
    return result


def inventory(root: Path) -> dict[str, Any]:
    rows = []
    directories = 0
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        info = os.lstat(path)
        require(not stat.S_ISLNK(info.st_mode), f"symlink:{path}")
        if stat.S_ISDIR(info.st_mode):
            directories += 1
        elif stat.S_ISREG(info.st_mode):
            raw = read_regular(path)
            rows.append({"bytes": len(raw), "mode": f"{stat.S_IMODE(info.st_mode):04o}", "path": path.relative_to(root).as_posix(), "sha256": sha(raw)})
        else:
            raise Invalid(f"nonregular:{path}")
    projection = canon(rows, newline=False)
    return {"aggregate_file_bytes": sum(row["bytes"] for row in rows), "directories": directories, "files": len(rows), "projection_bytes": len(projection), "projection_sha256": sha(projection)}


def load_attestor(base: Path) -> Any:
    path = base / ATTESTOR[0]
    spec = importlib.util.spec_from_file_location("_r9_v18_independent_check_attestor", path)
    require(spec is not None and spec.loader is not None, "attestor loader")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    sys.path.insert(0, str(path.parent))
    spec.loader.exec_module(module)
    return module


def goal_records(module: Any, base: Path, row_name: str, evidence_name: str, thread_id: str) -> tuple[dict[str, Any], list[dict[str, Any]], int, bytes]:
    row = module.load_json(base / "goal_mode_v17_three_turn_canary_001_inputs" / row_name)
    capture = base / "goal_mode_v17_three_turn_canary_001_evidence" / "rows" / evidence_name
    prompt = module._read_regular(capture / "bootstrap_prompt.txt").decode()
    _, records, rollout, _ = module.v15._thread_goal(row, Path("/home/sittingmongoose/.codex"), thread_id)
    prompt_lines = module.base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "fixture prompt line")
    return row, records, prompt_lines[0], rollout


def projection_check(module: Any, records: list[dict[str, Any]], prompt_line: int, row: dict[str, Any], thread_id: str) -> dict[str, Any]:
    calls, turn_id = module._goal_calls(records, prompt_line, ["get_goal", "create_goal", "get_goal"], row["objective"])
    require(module.base._goal_projection(calls[0]["output"]) is None, "fixture initial Goal")
    created = module.base._goal_projection(calls[1]["output"])
    reopened = module.base._goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "fixture Goal projections")
    module._assert_native_goal_projection(created, thread_id, row["objective"], "active", "fixture created")
    module._assert_native_goal_projection(reopened, thread_id, row["objective"], "active", "fixture reopened")
    require(created == reopened, "fixture projection equality")
    return {"methods": [call["method"] for call in calls], "representation": calls[0]["representation"], "turn_id": turn_id}


def find_batch_payload(module: Any, records: list[dict[str, Any]], kind: str) -> dict[str, Any]:
    matches = [module.base._payload(entry) for entry in records if module.base._payload(entry).get("type") == kind]
    require(len(matches) == 1, f"batch payload:{kind}")
    return matches[0]


def mutate_records(module: Any, records: list[dict[str, Any]], mutation: str) -> list[dict[str, Any]]:
    mutated = copy.deepcopy(records)
    if mutation in {"method_reorder", "extra_goal_method", "non_goal_method"}:
        payload = find_batch_payload(module, mutated, "custom_tool_call")
        code = payload["input"]
        if mutation == "method_reorder":
            code = code.replace("const r1 = await tools.get_goal({});", "const r1 = await tools.create_goal({objective:\"drift\"});", 1)
        elif mutation == "extra_goal_method":
            code += "\nconst r4 = await tools.get_goal({});\ntext(r4);"
        else:
            code += "\nconst r4 = await tools.exec_command({cmd:\"true\"});\ntext(r4);"
        payload["input"] = code
    elif mutation in {"missing_projection", "thread_id_drift"}:
        payload = find_batch_payload(module, mutated, "custom_tool_call_output")
        output = payload["output"]
        require(isinstance(output, list), "mutant output")
        if mutation == "missing_projection":
            output.pop()
        else:
            projection = json.loads(output[2]["text"], object_pairs_hook=pairs)
            projection["goal"]["threadId"] = "00000000-0000-0000-0000-000000000000"
            output[2]["text"] = json.dumps(projection, ensure_ascii=False, separators=(",", ":"))
    else:
        raise Invalid(f"unknown mutation:{mutation}")
    return mutated


def batch_mutations(module: Any, row: dict[str, Any], records: list[dict[str, Any]], prompt_line: int) -> list[dict[str, str]]:
    results = []
    for name in ("extra_goal_method", "method_reorder", "missing_projection", "non_goal_method", "thread_id_drift"):
        rejected = False
        try:
            projection_check(module, mutate_records(module, records, name), prompt_line, row, ROW_002_THREAD)
        except (Invalid, module.Invalid, json.JSONDecodeError, KeyError):
            rejected = True
        require(rejected, f"batch mutation survived:{name}")
        results.append({"mutation": name, "status": "REJECTED"})
    rejected_objective = False
    try:
        drifted = dict(row)
        drifted["objective"] += " drift"
        projection_check(module, records, prompt_line, drifted, ROW_002_THREAD)
    except (Invalid, module.Invalid):
        rejected_objective = True
    require(rejected_objective, "objective drift survived")
    results.append({"mutation": "objective_drift", "status": "REJECTED"})
    return sorted(results, key=lambda item: item["mutation"])


def patch_v17_compat(module: Any) -> None:
    mapping = {
        "ADAPTER": "CODEX_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_THEN_SCORED_RESUME_THEN_TERMINAL_CLOSURE_DB_IDENTITY_PHASE_AWARE_V3",
        "ROW_SCHEMA": "pw-r9-goal-mode-row-spec-v17",
        "BOOTSTRAP_LAUNCH_SCHEMA": "pw-r9-goal-mode-bootstrap-launch-receipt-v17",
        "BOOTSTRAP_PROCESS_SCHEMA": "pw-r9-goal-mode-bootstrap-process-receipt-v17",
        "BOOTSTRAP_ATTESTATION_SCHEMA": "pw-r9-goal-mode-bootstrap-attestation-v17",
        "SCORED_LAUNCH_SCHEMA": "pw-r9-goal-mode-three-turn-scored-launch-receipt-v17",
        "SCORED_PROCESS_SCHEMA": "pw-r9-goal-mode-three-turn-scored-process-receipt-v17",
        "RELEASE_SCHEMA": "pw-r9-goal-mode-three-turn-subject-release-gate-v17",
        "DELIVERY_SCHEMA": "pw-r9-goal-mode-three-turn-subject-delivery-v17",
        "SCORED_ATTESTATION_SCHEMA": "pw-r9-goal-mode-three-turn-scored-attestation-v17",
        "CLOSURE_LAUNCH_SCHEMA": "pw-r9-goal-mode-three-turn-closure-launch-receipt-v17",
        "CLOSURE_PROCESS_SCHEMA": "pw-r9-goal-mode-three-turn-closure-process-receipt-v17",
        "FINAL_ATTESTATION_SCHEMA": "pw-r9-goal-mode-three-turn-final-attestation-v17",
        "BOOTSTRAP_MARKER": "GOAL_ACTIVE_SUBJECT_NOT_SEEN_V17",
        "CLOSURE_MARKER": "GOAL_TERMINAL_CLOSURE_COMPLETE_NO_SUBJECT_REPLAY",
    }
    for name, value in mapping.items():
        setattr(module, name, value)
        setattr(module.v15, name, value)
        setattr(module.v17, name, value)
    module.BOOTSTRAP_ATTESTATION_STATUS = "PASS_SUBJECT_FREE_FRESH_NATIVE_GOAL_ACTIVATION_PROJECTION_DB_CROSS_BOUND_ZERO_CREDIT"


def sealed_reopen_fixture(module: Any, base: Path) -> dict[str, Any]:
    patch_v17_compat(module)
    source = base / "goal_mode_v17_three_turn_canary_001_evidence" / "rows" / "row-000"
    row_path = base / "goal_mode_v17_three_turn_canary_001_inputs" / "row-000.row.json"
    before = inventory(source)
    result = module.reopen_final(row_path, source, Path("/home/sittingmongoose/.codex"))
    require(result == module.load_json(source / "goal_mode_attestation.json") and inventory(source) == before, "sealed reopen result/inventory")
    mutations = []
    with tempfile.TemporaryDirectory(prefix="r9-v18-reopen-") as temporary:
        fixture = Path(temporary) / "row-000"
        shutil.copytree(source, fixture)
        (fixture / "goal_mode_attestation.json").unlink()
        (fixture / "stderr_classification.json").unlink()
        rejected = False
        try:
            module.reopen_final(row_path, fixture, Path("/home/sittingmongoose/.codex"))
        except (module.Invalid, OSError):
            rejected = True
        require(rejected, "pre-final-only reopen survived")
        mutations.append({"mutation": "pre_final_only_reopen", "status": "REJECTED"})
    with tempfile.TemporaryDirectory(prefix="r9-v18-reopen-") as temporary:
        fixture = Path(temporary) / "row-000"
        shutil.copytree(source, fixture)
        attestation_path = fixture / "goal_mode_attestation.json"
        value = module.load_json(attestation_path)
        value["authority"]["qualification_credit"] = 1
        attestation_path.write_bytes(module.canon(value))
        os.chmod(attestation_path, 0o600)
        rejected = False
        try:
            module.reopen_final(row_path, fixture, Path("/home/sittingmongoose/.codex"))
        except (module.Invalid, OSError):
            rejected = True
        require(rejected, "sealed attestation drift survived")
        mutations.append({"mutation": "sealed_final_file_drift", "status": "REJECTED"})
    return {
        "goal_id": result["goal"]["goal_id"],
        "inventory": before,
        "mutations": mutations,
        "status": "PASS_PURE_SEALED_REOPEN_NO_SOURCE_EVIDENCE_WRITE",
        "transport": result["bootstrap"]["goal"]["goal_action_transport"],
    }


def audit_source(base: Path) -> dict[str, Any]:
    attestor_text = read_regular(base / ATTESTOR[0]).decode()
    harness_text = read_regular(base / HARNESS[0]).decode()
    attestor_tree = ast.parse(attestor_text)
    harness_tree = ast.parse(harness_text)
    require("NESTED_CODE_EXACT_ORDERED_BATCH" in attestor_text and "def reopen_final(" in attestor_text, "V18 source surfaces")
    require("Do not mix representations." in harness_text and "v15._bootstrap_prompt = _bootstrap_prompt" in harness_text, "V18 prompt binding")
    require(not any(isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"Popen", "run"} for node in ast.walk(attestor_tree)), "attestor process call")
    forbidden = []
    for node in ast.walk(harness_tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute) or node.func.attr not in {"Popen", "run"} or not node.args:
            continue
        first = node.args[0]
        if isinstance(first, (ast.List, ast.Tuple)) and first.elts and isinstance(first.elts[0], ast.Constant) and first.elts[0].value in {"omp", "ps"}:
            forbidden.append(first.elts[0].value)
    require(not forbidden, "OMP/ps invocation")
    return {"attestor_process_calls": 0, "forbidden_host_process_calls": forbidden}


def run_harness_check(base: Path, codex: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(base / HARNESS[0]), "check", "--codex", str(codex)],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=base,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        timeout=60,
        check=False,
    )
    require(process.returncode == 0 and process.stderr == b"", "harness check process")
    value = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(value) and value.get("status") == "PASS_STATIC_V18_EXACT_ORDERED_GOAL_BATCH_PURE_SEALED_REOPEN_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT", "harness check result")
    return {"rc": 0, "stderr": {"bytes": 0, "sha256": sha(b"")}, "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)}}


def check(args: argparse.Namespace) -> dict[str, Any]:
    bindings = [identity(args.base, row) for row in (CONTRACT, HARNESS, ATTESTOR, DESIGN, V17_FAILURE)]
    before = inventory(args.base / "goal_mode_v17_three_turn_canary_001_evidence")
    require(before == {"aggregate_file_bytes": 423441, "directories": 5, "files": 69, "projection_bytes": 10423, "projection_sha256": "627480c063fe9dfa2b416b397b38628b67b4c80ef92b7043fe7fb4ba0d521184"}, "V17 evidence identity")
    module = load_attestor(args.base)
    row2, batch_records, batch_prompt, batch_rollout = goal_records(module, args.base, "row-002.row.json", "row-002", ROW_002_THREAD)
    require(len(batch_rollout) == 80741 and sha(batch_rollout) == "1ebd0b047f445ff4d29579bab374144c1a2a05cfd799c920956831877e6e6580", "batch rollout identity")
    batch = projection_check(module, batch_records, batch_prompt, row2, ROW_002_THREAD)
    require(batch["representation"] == module.NESTED_BATCH, "batch representation")
    mutations = batch_mutations(module, row2, batch_records, batch_prompt)
    row0_attestation = module.load_json(args.base / "goal_mode_v17_three_turn_canary_001_evidence" / "rows" / "row-000" / "goal_mode_attestation.json")
    row0, direct_records, direct_prompt, _ = goal_records(module, args.base, "row-000.row.json", "row-000", row0_attestation["goal"]["thread_id"])
    direct = projection_check(module, direct_records, direct_prompt, row0, row0_attestation["goal"]["thread_id"])
    require(direct["representation"] == module.DIRECT_NATIVE, "direct representation")
    sealed = sealed_reopen_fixture(module, args.base)
    require(inventory(args.base / "goal_mode_v17_three_turn_canary_001_evidence") == before, "source evidence drift")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {
            "batch_mutations": mutations,
            "direct_positive_fixture": direct,
            "harness_process": run_harness_check(args.base, args.codex),
            "nested_batch_positive_fixture": batch,
            "sealed_reopen_fixture": sealed,
            "source": audit_source(args.base),
            "temporary_fixture_writes": "DISPOSABLE_TEMP_ONLY_CLEANED",
            "v17_evidence_inventory": before,
        },
        "first_mismatch": None,
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_V18_EXACT_ORDERED_GOAL_BATCH_PURE_SEALED_REOPEN_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute() and args.codex.is_absolute(), "CLI")
        result, rc = check(args), 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, subprocess.SubprocessError) as exc:
        result = {"authority": {"qualification_credit": 0}, "error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
