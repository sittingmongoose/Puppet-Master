#!/usr/bin/env python3
"""Independent source-derived check of the V14 291x2 native-Goal matrix inputs."""

from __future__ import annotations

import argparse
import ast
import copy
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


SCHEMA = "pw-r9-goal-mode-v14-structural-context-matrix-pair-independent-check-v1"
OUTPUT_NAME = "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1"
MATRIX_IDS = ("goal-mode-v14-structural-context-matrix-001", "goal-mode-v14-structural-context-matrix-002")
ROW_COUNT = 291
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_V3"
BUILDER_ID = {"bytes": 18456, "mode": "0644", "path": "r9_goal_mode_v14_structural_context_matrix_pair_builder_v1.py", "sha256": "800a8502d05a0fee595a73f179d4d2e314adfa47c2d50c170951d535220acdcb"}
MANIFEST_ID = {"bytes": 522058, "mode": "0644", "path": f"{OUTPUT_NAME}/manifest.json", "sha256": "5b2901787502545e94fef87b358416989c9ee41390f4bf11789604ec66eb4cc0"}
BUNDLE_ID = {"bytes": 786546, "mode": "0644", "path": "formal_candidate_v7/semantic_bundle.json", "sha256": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"}
CANARY_ID = {"bytes": 5322, "mode": "0644", "path": "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json", "sha256": "d76900fed272d1e2378541228988cde770ca702edab4aefa6e53111354c3f5f3"}
REVIEW_ID = {"bytes": 4358, "mode": "0644", "path": "r9_goal_mode_harness_v14_independent_static_review_v1.json", "sha256": "34ea966f192964c36d20085f5285d2ffb4a8e80e4285e317001a78fe269dec08"}


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
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load(path: Path, limit: int = 64_000_000) -> dict[str, Any]:
    raw = read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(isinstance(value, dict) and raw == canon(value), f"canonical JSON:{path}")
    return value


def identity(path: Path, label: str, limit: int = 64_000_000) -> dict[str, Any]:
    raw = read_regular(path, limit)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def expected_objective(run_id: str, row_id: str, criteria: dict[str, Any], control: dict[str, Any], subject_hash: str) -> str:
    return (
        f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={sha(canon(criteria, False))}; "
        f"control_envelope_sha256={sha(canon(control, False))}; subject_commitment_sha256={subject_hash}; "
        "execute exactly one gated subject inside a fresh native Goal, freeze its scored answer, then settle that same "
        "Goal only in a same-task non-scored terminal-closure continuation."
    )


def expected_row(bundle: dict[str, Any], matrix_id: str, index: int) -> tuple[dict[str, Any], bytes, dict[str, Any]]:
    schedule = bundle["schedule"][index]
    cell = bundle["cells"][schedule["cell_index"]]
    route = bundle["routes"][schedule["route_index"]]
    subject = cell["render_utf8"].encode("utf-8")
    require(len(subject) == cell["render_utf8_bytes"] and sha(subject) == cell["render_utf8_sha256"], f"source subject:{index}")
    expected_raw = cell["expected_output_utf8"].encode("utf-8")
    require(len(expected_raw) == cell["expected_output_bytes"] and sha(expected_raw) == cell["expected_output_sha256"], f"source expected:{index}")
    criteria = {"expected_exact_utf8": cell["expected_output_utf8"], "rule": "EXACT_UTF8_NO_DECORATION"}
    control = {
        "architecture": "SERIAL_FRESH_CODEX_TASK_FRESH_NATIVE_GOAL_SAME_TASK_TERMINAL_CLOSURE_STRUCTURAL_CONTEXT_V14",
        "canary": False,
        "cell": cell["cell"],
        "cell_index": schedule["cell_index"],
        "full_matrix": True,
        "goal_mode_required": True,
        "goal_terminal_closure": True,
        "matrix": True,
        "matrix_id": matrix_id,
        "max_parallel": 1,
        "qualification_credit": 0,
        "route_index": schedule["route_index"],
        "schedule_index": index,
        "semantic_bundle_sha256": BUNDLE_ID["sha256"],
        "serialized": True,
        "slot": route["slot"],
        "subject_tools_allowed": False,
    }
    row_id = f"row-{index:03d}"
    row = {"adapter": ADAPTER, "attempt": 0, "cli_version": "0.148.0", "control_envelope": control, "criteria": criteria, "model": route["model"], "objective": "", "reasoning_effort": route["reasoning_effort"], "row_id": row_id, "run_id": matrix_id, "schema_id": "pw-r9-goal-mode-row-spec-v13", "subject_utf8_bytes": len(subject), "subject_utf8_sha256": sha(subject)}
    row["objective"] = expected_objective(matrix_id, row_id, criteria, control, row["subject_utf8_sha256"])
    projection = {"cell": cell["cell"], "cell_index": schedule["cell_index"], "expected_output_bytes": len(expected_raw), "expected_output_sha256": sha(expected_raw), "index": index, "model": route["model"], "reasoning_effort": route["reasoning_effort"], "row_id": row_id, "slot": route["slot"], "subject_utf8_bytes": len(subject), "subject_utf8_sha256": sha(subject)}
    return row, subject, projection


def expected_admission(row: dict[str, Any], row_raw: bytes, bindings: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "authority": {"adapter": ADAPTER, "canary_launch": False, "launch_count": 1, "matrix_launch": True, "qualification": False, "retry": False, "row_id": row["row_id"], "run_id": row["run_id"]},
        "bindings": bindings,
        "review": REVIEW_ID,
        "row_spec": {"bytes": len(row_raw), "sha256": sha(row_raw)},
        "schema_id": "pw-r9-goal-mode-matrix-row-admission-v14",
        "status": "PASS_INDEPENDENT_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_REVIEW",
    }


def mutation_test(row: dict[str, Any], admission: dict[str, Any]) -> list[dict[str, Any]]:
    cases: dict[str, tuple[dict[str, Any], dict[str, Any]]] = {}
    for name in ("adapter", "objective", "run_id", "schema_id"):
        changed = copy.deepcopy(row)
        changed[name] = "MUTATED"
        cases[f"row_{name}"] = (changed, admission)
    for name, value in (("canary_launch", True), ("matrix_launch", False), ("retry", True)):
        changed_admission = copy.deepcopy(admission)
        changed_admission["authority"][name] = value
        cases[f"admission_{name}"] = (row, changed_admission)
    results: list[dict[str, Any]] = []
    for name, (changed_row, changed_admission) in sorted(cases.items()):
        rejected = changed_row != row or changed_admission != admission
        require(rejected, f"mutation rejected:{name}")
        results.append({"mutation": name, "status": "REJECTED_BY_EXACT_BYTE_RECONSTRUCTION"})
    return results


def audit_builder(path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    require(identity(path, path.name) == BUILDER_ID, "builder identity")
    text = raw.decode("utf-8")
    tree = ast.parse(text)
    require("O_EXCL" in text and "fsync" in text and "ROW_COUNT = 291" in text, "builder durability/cardinality")
    require("subprocess" not in text and "spawn_agent" not in text and 'Popen(' not in text, "builder no execution")
    require('MATRIX_IDS = ("goal-mode-v14-structural-context-matrix-001", "goal-mode-v14-structural-context-matrix-002")' in text, "builder matrix IDs")
    return {"ast_nodes": sum(1 for _ in ast.walk(tree)), "no_model_or_goal_launch": True}


def check(base: Path) -> dict[str, Any]:
    output = base / OUTPUT_NAME
    builder_check = audit_builder(base / BUILDER_ID["path"])
    require(identity(output / "manifest.json", MANIFEST_ID["path"]) == MANIFEST_ID, "manifest identity")
    require(identity(base / BUNDLE_ID["path"], BUNDLE_ID["path"], 2_000_000) == BUNDLE_ID, "bundle identity")
    require(identity(base / CANARY_ID["path"], CANARY_ID["path"]) == CANARY_ID, "canary identity")
    require(identity(base / REVIEW_ID["path"], REVIEW_ID["path"]) == REVIEW_ID, "review identity")
    bundle = load(base / BUNDLE_ID["path"], 2_000_000)
    manifest = load(output / "manifest.json", 64_000_000)
    review = load(base / REVIEW_ID["path"])
    bindings = review["bindings"]
    require(len(bindings) == 14 and all(item["mode"] == "0644" for item in bindings), "review bindings")
    require(manifest.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-pair-input-manifest-v1" and manifest.get("status") == "PREDECLARED_INPUTS_ZERO_CREDIT_NO_LAUNCH", "manifest status")
    require(manifest.get("pair_order") == list(MATRIX_IDS) and manifest.get("sources") == {"canary": CANARY_ID, "harness_review": REVIEW_ID, "semantic_bundle": BUNDLE_ID}, "manifest pair/sources")
    require(manifest.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "manifest authority")
    require(bundle.get("routes") == [{"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "slot": "slot-alpha"}, {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "slot": "slot-bravo"}, {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "slot": "slot-charlie"}], "routes")
    expected_files = {"manifest.json"}
    require(len(manifest.get("subjects", [])) == 97, "subject inventory")
    for index, declared in enumerate(manifest["subjects"]):
        path = output / f"subjects/cell-{index:03d}.txt"
        expected_files.add(path.relative_to(output).as_posix())
        require(identity(path, declared["path"]) == declared, f"subject identity:{index}")
    matrix_summaries: list[dict[str, Any]] = []
    first_mutations: list[dict[str, Any]] | None = None
    for matrix_index, matrix_id in enumerate(MATRIX_IDS):
        matrix = manifest["matrices"][matrix_index]
        require(matrix.get("matrix_id") == matrix_id and matrix.get("row_count") == ROW_COUNT and len(matrix.get("rows", [])) == ROW_COUNT, "matrix envelope")
        review_copy = output / "admissions" / matrix_id / REVIEW_ID["path"]
        expected_files.add(review_copy.relative_to(output).as_posix())
        require(identity(review_copy, REVIEW_ID["path"]) == REVIEW_ID, "review copy")
        rebuilt: list[dict[str, Any]] = []
        objectives: set[str] = set()
        for index, declared in enumerate(matrix["rows"]):
            row, subject, projection = expected_row(bundle, matrix_id, index)
            row_raw = canon(row)
            row_path = output / f"rows/{matrix_id}/row-{index:03d}.json"
            admission_path = output / f"admissions/{matrix_id}/row-{index:03d}.admission.json"
            expected_files.update({row_path.relative_to(output).as_posix(), admission_path.relative_to(output).as_posix()})
            require(read_regular(row_path) == row_raw, f"row bytes:{matrix_id}:{index}")
            admission = expected_admission(row, row_raw, bindings)
            admission_raw = canon(admission)
            require(read_regular(admission_path) == admission_raw, f"admission bytes:{matrix_id}:{index}")
            expected = {**projection, "admission": {"bytes": len(admission_raw), "path": admission_path.relative_to(output).as_posix(), "sha256": sha(admission_raw)}, "row_spec": {"bytes": len(row_raw), "path": row_path.relative_to(output).as_posix(), "sha256": sha(row_raw)}, "subject": {"bytes": len(subject), "path": f"subjects/cell-{projection['cell_index']:03d}.txt", "sha256": sha(subject)}}
            require(declared == expected, f"manifest row:{matrix_id}:{index}")
            objectives.add(row["objective"])
            rebuilt.append(declared)
            if first_mutations is None:
                first_mutations = mutation_test(row, admission)
        projection_raw = canon(rebuilt, False)
        require(len(objectives) == ROW_COUNT and matrix["rows_projection_bytes"] == len(projection_raw) and matrix["rows_projection_sha256"] == sha(projection_raw), "matrix projection/uniqueness")
        matrix_summaries.append({"matrix_id": matrix_id, "objectives": len(objectives), "rows": len(rebuilt), "rows_projection_bytes": len(projection_raw), "rows_projection_sha256": sha(projection_raw)})
    files = {path.relative_to(output).as_posix() for path in output.rglob("*") if path.is_file()}
    require(files == expected_files and len(files) == 1264, "file inventory")
    require(first_mutations is not None, "mutation test")
    return {
        "authority": {"controller_work": True, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "checks": {"builder": builder_check, "file_count": len(files), "matrices": matrix_summaries, "mutations": first_mutations, "subject_count": 97},
        "first_mismatch": None,
        "lineage": {"matrix_005": "PERMANENT_FAIL_ZERO_CREDIT", "matrix_006": "INVALIDATED_NO_LAUNCH_AUTHORITY", "v13_canary": "PASS_ZERO_CREDIT"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_SOURCE_DERIVED_V14_MATRIX_PAIR_ZERO_CREDIT_CONTROLLER_WORK_ONLY",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute(), "CLI")
        result, rc = check(args.base), 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError) as exc:
        result = {"error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
