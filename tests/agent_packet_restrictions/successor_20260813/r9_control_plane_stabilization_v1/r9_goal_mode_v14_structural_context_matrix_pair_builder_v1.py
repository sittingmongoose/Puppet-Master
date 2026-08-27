#!/usr/bin/env python3
"""Create/check the fresh V14 structural-context native-Goal matrix pair."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
BUNDLE = BASE / "formal_candidate_v7" / "semantic_bundle.json"
CANARY = BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json"
HARNESS_REVIEW = BASE / "r9_goal_mode_harness_v14_independent_static_review_v1.json"
HARNESS_PATH = BASE / "goal_mode_empirical_harness_v14" / "goal_mode_harness.py"
OUTPUT_NAME = "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1"
MATRIX_IDS = ("goal-mode-v14-structural-context-matrix-001", "goal-mode-v14-structural-context-matrix-002")
ROW_COUNT = 291
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_V3"
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


def load_json(path: Path, limit: int = 64_000_000) -> dict[str, Any]:
    raw = read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(isinstance(value, dict) and raw == canon(value), f"canonical JSON:{path}")
    return value


def identity(path: Path, label: str, limit: int = 64_000_000) -> dict[str, Any]:
    raw = read_regular(path, limit)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def write_exclusive(path: Path, raw: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o644)
    try:
        os.fchmod(fd, 0o644)
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    require(read_regular(path, max(len(raw), 1)) == raw and stat.S_IMODE(os.lstat(path).st_mode) == 0o644, f"write reopen:{path}")


def fsync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def load_harness() -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v14_matrix_pair_builder_harness", HARNESS_PATH)
    require(spec is not None and spec.loader is not None, "harness loader")
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(HARNESS_PATH.parent))
    spec.loader.exec_module(module)
    return module


def source() -> tuple[dict[str, Any], Any, list[dict[str, Any]]]:
    require(identity(BUNDLE, BUNDLE_ID["path"], 2_000_000) == BUNDLE_ID, "semantic bundle identity")
    require(identity(CANARY, CANARY_ID["path"]) == CANARY_ID, "canary identity")
    require(identity(HARNESS_REVIEW, REVIEW_ID["path"]) == REVIEW_ID, "harness review identity")
    bundle = load_json(BUNDLE, 2_000_000)
    require(bundle.get("schema_id") == "pw-r9-immutable-semantic-bundle-v1", "bundle schema")
    routes = bundle.get("routes")
    schedule = bundle.get("schedule")
    cells = bundle.get("cells")
    require(isinstance(cells, list) and len(cells) == 97, "cell count")
    require(routes == [{"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "slot": "slot-alpha"}, {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "slot": "slot-bravo"}, {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "slot": "slot-charlie"}], "routes")
    require(isinstance(schedule, list) and len(schedule) == ROW_COUNT, "schedule count")
    for index, item in enumerate(schedule):
        require(item == {"cell_index": index % 97, "cell_ref": f"/cells/{index % 97}", "index": index, "route_index": index // 97, "route_ref": f"/routes/{index // 97}"}, f"schedule:{index}")
    canary = load_json(CANARY)
    require(canary.get("status") == "PASS_V13_THREE_ROUTE_NATIVE_GOAL_STRUCTURAL_CONTEXT_CANARY_ZERO_CREDIT_MATRIX_HARNESS_WORK_ONLY" and canary.get("authority", {}).get("matrix_harness_work") is True and canary.get("authority", {}).get("matrix_launch") is False, "canary authority")
    review = load_json(HARNESS_REVIEW)
    require(review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and review.get("authority", {}).get("matrix_launch") is False, "review authority")
    harness = load_harness()
    bindings = harness._bindings()
    require(review.get("bindings") == bindings and len(bindings) == 14, "harness bindings")
    return bundle, harness, bindings


def expected_objective(run_id: str, row_id: str, criteria: dict[str, Any], control: dict[str, Any], subject_hash: str) -> str:
    return (
        f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={sha(canon(criteria, False))}; "
        f"control_envelope_sha256={sha(canon(control, False))}; subject_commitment_sha256={subject_hash}; "
        "execute exactly one gated subject inside a fresh native Goal, freeze its scored answer, then settle that same "
        "Goal only in a same-task non-scored terminal-closure continuation."
    )


def row_payload(bundle: dict[str, Any], matrix_id: str, index: int) -> tuple[dict[str, Any], bytes, dict[str, Any]]:
    item = bundle["schedule"][index]
    cell = bundle["cells"][item["cell_index"]]
    route = bundle["routes"][item["route_index"]]
    subject = cell["render_utf8"].encode("utf-8")
    require(len(subject) == cell["render_utf8_bytes"] and sha(subject) == cell["render_utf8_sha256"], f"subject:{index}")
    expected = cell["expected_output_utf8"]
    expected_raw = expected.encode("utf-8")
    require(len(expected_raw) == cell["expected_output_bytes"] and sha(expected_raw) == cell["expected_output_sha256"], f"expected:{index}")
    criteria = {"expected_exact_utf8": expected, "rule": "EXACT_UTF8_NO_DECORATION"}
    control = {
        "architecture": "SERIAL_FRESH_CODEX_TASK_FRESH_NATIVE_GOAL_SAME_TASK_TERMINAL_CLOSURE_STRUCTURAL_CONTEXT_V14",
        "canary": False,
        "cell": cell["cell"],
        "cell_index": item["cell_index"],
        "full_matrix": True,
        "goal_mode_required": True,
        "goal_terminal_closure": True,
        "matrix": True,
        "matrix_id": matrix_id,
        "max_parallel": 1,
        "qualification_credit": 0,
        "route_index": item["route_index"],
        "schedule_index": index,
        "semantic_bundle_sha256": BUNDLE_ID["sha256"],
        "serialized": True,
        "slot": route["slot"],
        "subject_tools_allowed": False,
    }
    row_id = f"row-{index:03d}"
    row = {"adapter": ADAPTER, "attempt": 0, "cli_version": "0.148.0", "control_envelope": control, "criteria": criteria, "model": route["model"], "objective": "", "reasoning_effort": route["reasoning_effort"], "row_id": row_id, "run_id": matrix_id, "schema_id": "pw-r9-goal-mode-row-spec-v13", "subject_utf8_bytes": len(subject), "subject_utf8_sha256": sha(subject)}
    row["objective"] = expected_objective(matrix_id, row_id, criteria, control, row["subject_utf8_sha256"])
    projection = {"cell": cell["cell"], "cell_index": item["cell_index"], "expected_output_bytes": len(expected_raw), "expected_output_sha256": sha(expected_raw), "index": index, "model": route["model"], "reasoning_effort": route["reasoning_effort"], "row_id": row_id, "slot": route["slot"], "subject_utf8_bytes": len(subject), "subject_utf8_sha256": sha(subject)}
    return row, subject, projection


def admission(row: dict[str, Any], row_raw: bytes, bindings: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "authority": {"adapter": ADAPTER, "canary_launch": False, "launch_count": 1, "matrix_launch": True, "qualification": False, "retry": False, "row_id": row["row_id"], "run_id": row["run_id"]},
        "bindings": bindings,
        "review": REVIEW_ID,
        "row_spec": {"bytes": len(row_raw), "sha256": sha(row_raw)},
        "schema_id": "pw-r9-goal-mode-matrix-row-admission-v14",
        "status": "PASS_INDEPENDENT_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_REVIEW",
    }


def build(output: Path) -> dict[str, Any]:
    require(output.name == OUTPUT_NAME and output.parent == BASE and not output.exists(), "output exact absent root")
    bundle, _, bindings = source()
    output.mkdir(mode=0o755)
    os.chmod(output, 0o755)
    subjects = output / "subjects"
    rows_root = output / "rows"
    admissions_root = output / "admissions"
    for path in (subjects, rows_root, admissions_root):
        path.mkdir(mode=0o755)
        os.chmod(path, 0o755)
    subject_ids: list[dict[str, Any]] = []
    for cell_index, cell in enumerate(bundle["cells"]):
        raw = cell["render_utf8"].encode("utf-8")
        path = subjects / f"cell-{cell_index:03d}.txt"
        write_exclusive(path, raw)
        subject_ids.append(identity(path, f"subjects/{path.name}"))
    review_raw = read_regular(HARNESS_REVIEW)
    matrices: list[dict[str, Any]] = []
    for matrix_id in MATRIX_IDS:
        matrix_rows = rows_root / matrix_id
        matrix_admissions = admissions_root / matrix_id
        matrix_rows.mkdir(mode=0o755)
        matrix_admissions.mkdir(mode=0o755)
        os.chmod(matrix_rows, 0o755)
        os.chmod(matrix_admissions, 0o755)
        write_exclusive(matrix_admissions / REVIEW_ID["path"], review_raw)
        manifest_rows: list[dict[str, Any]] = []
        for index in range(ROW_COUNT):
            row, subject, projection = row_payload(bundle, matrix_id, index)
            row_raw = canon(row)
            row_path = matrix_rows / f"row-{index:03d}.json"
            admission_path = matrix_admissions / f"row-{index:03d}.admission.json"
            write_exclusive(row_path, row_raw)
            admission_raw = canon(admission(row, row_raw, bindings))
            write_exclusive(admission_path, admission_raw)
            require(subject_ids[projection["cell_index"]]["sha256"] == sha(subject), "subject inventory")
            manifest_rows.append({**projection, "admission": {"bytes": len(admission_raw), "path": admission_path.relative_to(output).as_posix(), "sha256": sha(admission_raw)}, "row_spec": {"bytes": len(row_raw), "path": row_path.relative_to(output).as_posix(), "sha256": sha(row_raw)}, "subject": {"bytes": len(subject), "path": f"subjects/cell-{projection['cell_index']:03d}.txt", "sha256": sha(subject)}})
        fsync_dir(matrix_rows)
        fsync_dir(matrix_admissions)
        projection_raw = canon(manifest_rows, False)
        matrices.append({"matrix_id": matrix_id, "row_count": ROW_COUNT, "rows": manifest_rows, "rows_projection_bytes": len(projection_raw), "rows_projection_sha256": sha(projection_raw)})
    manifest = {
        "architecture": "V14_SERIAL_FRESH_TASK_FRESH_NATIVE_GOAL_SAME_TASK_TERMINAL_CLOSURE_STRUCTURAL_CONTEXT",
        "authority": {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "matrices": matrices,
        "pair_order": list(MATRIX_IDS),
        "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-pair-input-manifest-v1",
        "sources": {"canary": CANARY_ID, "harness_review": REVIEW_ID, "semantic_bundle": BUNDLE_ID},
        "status": "PREDECLARED_INPUTS_ZERO_CREDIT_NO_LAUNCH",
        "subjects": subject_ids,
    }
    manifest_raw = canon(manifest)
    write_exclusive(output / "manifest.json", manifest_raw)
    for path in (subjects, rows_root, admissions_root, output):
        fsync_dir(path)
    fsync_dir(output.parent)
    return {"file_count": 1264, "manifest": {"bytes": len(manifest_raw), "path": f"{OUTPUT_NAME}/manifest.json", "sha256": sha(manifest_raw)}, "matrix_count": 2, "row_count": 582, "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-pair-build-result-v1", "status": "BUILD_COMPLETE_ZERO_CREDIT_NO_LAUNCH", "subject_count": 97}


def check(output: Path) -> dict[str, Any]:
    bundle, harness, bindings = source()
    require(output.name == OUTPUT_NAME and output.parent == BASE and output.is_dir() and not output.is_symlink(), "output root")
    manifest = load_json(output / "manifest.json", 64_000_000)
    require(manifest.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-pair-input-manifest-v1" and manifest.get("pair_order") == list(MATRIX_IDS), "manifest schema/order")
    require(manifest.get("sources") == {"canary": CANARY_ID, "harness_review": REVIEW_ID, "semantic_bundle": BUNDLE_ID} and manifest.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "manifest sources/authority")
    expected_files = {"manifest.json"}
    require(len(manifest.get("subjects", [])) == 97 and len(manifest.get("matrices", [])) == 2, "manifest counts")
    for cell_index, item in enumerate(manifest["subjects"]):
        path = output / f"subjects/cell-{cell_index:03d}.txt"
        expected_files.add(path.relative_to(output).as_posix())
        require(identity(path, item["path"]) == item, "subject identity")
    for matrix_number, matrix_id in enumerate(MATRIX_IDS):
        matrix = manifest["matrices"][matrix_number]
        require(matrix["matrix_id"] == matrix_id and matrix["row_count"] == ROW_COUNT and len(matrix["rows"]) == ROW_COUNT, "matrix envelope")
        review_copy = output / "admissions" / matrix_id / REVIEW_ID["path"]
        expected_files.add(review_copy.relative_to(output).as_posix())
        require(identity(review_copy, REVIEW_ID["path"]) == REVIEW_ID, "review copy")
        rebuilt: list[dict[str, Any]] = []
        for index, item in enumerate(matrix["rows"]):
            row, subject, projection = row_payload(bundle, matrix_id, index)
            row_raw = canon(row)
            row_path = output / f"rows/{matrix_id}/row-{index:03d}.json"
            admission_path = output / f"admissions/{matrix_id}/row-{index:03d}.admission.json"
            expected_files.update({row_path.relative_to(output).as_posix(), admission_path.relative_to(output).as_posix()})
            require(read_regular(row_path) == row_raw, "row bytes")
            admission_raw = canon(admission(row, row_raw, bindings))
            require(read_regular(admission_path) == admission_raw, "admission bytes")
            harness._load_admission(admission_path, row_path, row)
            expected = {**projection, "admission": {"bytes": len(admission_raw), "path": admission_path.relative_to(output).as_posix(), "sha256": sha(admission_raw)}, "row_spec": {"bytes": len(row_raw), "path": row_path.relative_to(output).as_posix(), "sha256": sha(row_raw)}, "subject": {"bytes": len(subject), "path": f"subjects/cell-{projection['cell_index']:03d}.txt", "sha256": sha(subject)}}
            require(item == expected, f"manifest row:{matrix_id}:{index}")
            rebuilt.append(item)
        projection_raw = canon(rebuilt, False)
        require(matrix["rows_projection_bytes"] == len(projection_raw) and matrix["rows_projection_sha256"] == sha(projection_raw), "matrix projection")
    actual_files = {path.relative_to(output).as_posix() for path in output.rglob("*") if path.is_file()}
    require(actual_files == expected_files and len(actual_files) == 1264, f"file inventory:{len(actual_files)}")
    manifest_raw = read_regular(output / "manifest.json", 64_000_000)
    return {"file_count": len(actual_files), "manifest": {"bytes": len(manifest_raw), "path": f"{OUTPUT_NAME}/manifest.json", "sha256": sha(manifest_raw)}, "matrix_count": 2, "row_count": 582, "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-pair-check-result-v1", "status": "PASS_EXACT_PAIR_INPUTS_ZERO_CREDIT_NO_LAUNCH", "subject_count": 97, "workspace_writes": 0}


def main() -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--build", action="store_true")
    group.add_argument("--check", action="store_true")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve(strict=False)
    result = build(output) if args.build else check(output)
    sys.stdout.buffer.write(canon(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError) as exc:
        sys.stdout.buffer.write(canon({"error": str(exc), "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-pair-builder-failure-v1", "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}))
        raise SystemExit(1)
