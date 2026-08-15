#!/usr/bin/env python3
"""Small trusted outer controller for the R8 stabilization experiment.

The authored controller has two executable surfaces: run-matrix and
reopen-matrix.  It imports no semantic or prior controller code.  Frozen
provider inputs and oracles are data in semantic_manifest.json.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import time
from typing import Any

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parent
LANE = ROOT.parent
SUCCESSOR = LANE.parent
REPO = ROOT.parents[4]
EVIDENCE_ROOT = ROOT / "simulation_evidence"
CONTRACT_PATH = ROOT / "experiment_contract.json"
SEMANTIC_PATH = ROOT / "semantic_manifest.json"
SIMULATOR_PATH = ROOT / "simulator.py"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
FULL_SCENARIO = "full_pass"
SCENARIOS = (
    FULL_SCENARIO, "nonzero_exit", "missing_stdout", "partial_stdout",
    "safe_stop", "render_two_lf", "post_start_render_mutation",
    "metadata_retention", "delayed_live",
)

RUN_KEYS = (
    "schema_id", "run_id", "run_kind", "scenario", "qualification_credit",
    "controller_source_path", "controller_checkpoint_commit",
    "stabilization_base_checkpoint", "experiment_contract", "semantic_manifest",
    "routes", "schedule_sha256", "schedule_bytes", "fresh_task_thread_per_cell",
    "retry_count", "best_of", "replacement_result",
)
RAW_KEYS = (
    "schema_id", "run_id", "slot", "cell", "ordered_index", "scenario",
    "task_id", "thread_id", "turn_id", "rollout_id", "render_sha256_before",
    "render_bytes_before", "process_pid", "poll_count", "live_session_observed",
    "returncode", "started_monotonic_ns", "ended_monotonic_ns", "duration_ns",
    "stdout_utf8", "stdout_sha256", "stdout_bytes", "stderr_utf8",
    "stderr_sha256", "stderr_bytes", "render_sha256_after", "render_bytes_after",
    "terminal_metadata_complete",
)
SCORE_KEYS = (
    "schema_id", "run_id", "slot", "cell", "ordered_index", "verdict", "reason",
    "expected_output_sha256", "expected_output_bytes", "actual_output_sha256",
    "actual_output_bytes", "raw_result_sha256", "raw_result_bytes",
    "render_immutable_through_terminal", "deterministic",
)
COMPLETION_KEYS = (
    "schema_id", "run_id", "slot", "cell", "ordered_index", "status", "task_id",
    "thread_id", "turn_id", "rollout_id", "render_sha256", "render_bytes",
    "raw_result_sha256", "raw_result_bytes", "score_sha256", "score_bytes",
    "retry_count", "best_of", "replacement_result", "sealed_after_terminal_metadata",
)
PATH_KEYS = (
    "schema_id", "run_id", "slot", "status", "scheduled_cells", "sealed_cells",
    "pass_cells", "completion_inventory_sha256", "completion_inventory_bytes",
    "unique_task_ids", "unique_thread_ids", "unique_turn_ids", "unique_rollout_ids",
)
MATRIX_KEYS = (
    "schema_id", "run_id", "status", "scheduled_cells", "sealed_cells", "pass_cells",
    "path_terminal_inventory_sha256", "path_terminal_inventory_bytes",
    "zero_subject_provider_network_calls", "qualification_credit",
)
ACCOUNTING_KEYS = (
    "schema_id", "run_id", "status", "matrix_terminal_sha256",
    "matrix_terminal_bytes", "raw_processes", "subject_calls", "provider_calls",
    "network_calls", "retry_count", "best_of", "replacement_result", "fresh_task_ids",
    "fresh_thread_ids", "fresh_turn_ids", "fresh_rollout_ids",
)


class Invalid(RuntimeError):
    pass


def _canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def _regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(info.st_mode):
        raise Invalid(f"{label}: not a regular nonlink")
    with path.open("rb") as handle:
        return handle.read()


def _strict(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise Invalid(f"{label}: storage is not canonical one-LF JSON")
    try:
        value = json.loads(storage[:-1].decode("utf-8"), object_pairs_hook=_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or _canonical(value) + b"\n" != storage:
        raise Invalid(f"{label}: noncanonical object")
    return storage, value


def _mkdir(path: Path) -> None:
    try:
        os.mkdir(path, 0o755)
    except FileExistsError as exc:
        raise Invalid(f"create-only directory already exists: {path}") from exc


def _fsync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _exclusive_bytes(path: Path, storage: bytes) -> None:
    """Create a render with O_EXCL and make its bytes durable before dispatch."""
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            written = os.write(fd, view)
            if written <= 0:
                raise Invalid(f"short durable write: {path}")
            view = view[written:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _fsync_dir(path.parent)


def _atomic_exclusive(path: Path, storage: bytes) -> None:
    """Publish complete storage atomically and create-only via a hard link."""
    temp = path.with_name("." + path.name + ".pending")
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            written = os.write(fd, view)
            if written <= 0:
                raise Invalid(f"short atomic write: {path}")
            view = view[written:]
        os.fsync(fd)
    finally:
        os.close(fd)
    try:
        os.link(temp, path)
        _fsync_dir(path.parent)
    except FileExistsError as exc:
        raise Invalid(f"create-only evidence already exists: {path}") from exc
    finally:
        try:
            os.unlink(temp)
        except FileNotFoundError:
            pass
    _fsync_dir(path.parent)


def _persist(path: Path, value: dict[str, Any]) -> tuple[bytes, str, int]:
    storage = _canonical(value) + b"\n"
    _atomic_exclusive(path, storage)
    reopened = _regular(path, f"reopened {path.name}")
    if reopened != storage:
        raise Invalid(f"create-only reopen mismatch: {path}")
    return storage, _sha(storage), len(storage)


def _binding(path: Path, storage: bytes) -> dict[str, Any]:
    return {"path": str(path.relative_to(REPO)), "sha256": _sha(storage), "bytes": len(storage)}


def _load_controls() -> tuple[bytes, dict[str, Any], bytes, dict[str, Any]]:
    contract_storage, contract = _strict(CONTRACT_PATH, "experiment contract")
    semantic_storage, semantic = _strict(SEMANTIC_PATH, "semantic manifest")
    if contract.get("schema_id") != "pw-r8-control-plane-stabilization-experiment-v1":
        raise Invalid("experiment contract schema mismatch")
    declared = contract.get("semantic_manifest")
    if not isinstance(declared, dict) or (declared.get("sha256"), declared.get("bytes")) != (_sha(semantic_storage), len(semantic_storage)):
        raise Invalid("semantic manifest binding mismatch")
    if semantic.get("schema_id") != "pw-r8-stabilization-semantic-manifest-v1":
        raise Invalid("semantic manifest schema mismatch")
    schedule = semantic.get("schedule")
    routes = semantic.get("routes")
    cells = semantic.get("cells")
    if not isinstance(schedule, list) or len(schedule) != 97 or len(set(schedule)) != 97:
        raise Invalid("semantic schedule is not exact 97 unique cells")
    if routes != contract.get("routes") or [row.get("slot") for row in routes] != list(SLOTS):
        raise Invalid("three-route binding mismatch")
    if not isinstance(cells, list) or len(cells) != 97 or [row.get("cell") for row in cells] != schedule:
        raise Invalid("semantic cell rows differ from schedule")
    for index, row in enumerate(cells):
        if row.get("ordered_index") != index:
            raise Invalid("semantic ordered index mismatch")
        render = row.get("render_storage_utf8")
        if not isinstance(render, str):
            raise Invalid("semantic render bytes absent")
        render_bytes = render.encode("utf-8")
        if (not render_bytes.endswith(b"\n") or render_bytes.endswith(b"\n\n") or b"\r" in render_bytes or
                (row.get("render_storage_sha256"), row.get("render_storage_bytes")) != (_sha(render_bytes), len(render_bytes))):
            raise Invalid("semantic render one-LF/hash binding mismatch")
        provider = render_bytes[:-1]
        if (row.get("provider_input_sha256"), row.get("provider_input_bytes")) != (_sha(provider), len(provider)):
            raise Invalid("semantic provider input binding mismatch")
        expected = _canonical(row.get("expected_output")) + b"\n"
        if (row.get("expected_output_storage_sha256"), row.get("expected_output_storage_bytes")) != (_sha(expected), len(expected)):
            raise Invalid("semantic oracle binding mismatch")
    sources = semantic.get("source_files")
    if not isinstance(sources, list) or len(sources) != 54:
        raise Invalid("semantic source inventory count mismatch")
    paths = [row.get("path") for row in sources]
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("semantic source inventory is not sorted unique")
    for row in sources:
        rel = row.get("path")
        if not isinstance(rel, str) or Path(rel).is_absolute() or ".." in Path(rel).parts:
            raise Invalid("semantic source path invalid")
        data = _regular(SUCCESSOR / rel, f"semantic source {rel}")
        if (row.get("sha256"), row.get("bytes")) != (_sha(data), len(data)):
            raise Invalid(f"semantic source drift: {rel}")
    inventory = _canonical(sources)
    expected_inventory = semantic.get("source_inventory")
    if not isinstance(expected_inventory, dict) or (expected_inventory.get("canonical_sha256"), expected_inventory.get("canonical_bytes")) != (_sha(inventory), len(inventory)):
        raise Invalid("semantic source inventory digest mismatch")
    return contract_storage, contract, semantic_storage, semantic


def _identity(kind: str, run_id: str, slot: str, cell: str) -> str:
    digest = _sha(_canonical([kind, run_id, slot, cell]))
    return f"synthetic-{kind}-{digest[:32]}"


def _cell_dir(run_root: Path, slot: str, index: int, cell: str) -> Path:
    return run_root / "cells" / slot / f"{index:03d}_{cell}"


def _new_run_root(path_text: str) -> Path:
    path = Path(path_text)
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    else:
        path = path.resolve()
    if path.parent != EVIDENCE_ROOT.resolve():
        raise Invalid("run root must be a direct child of the iteration simulation_evidence directory")
    if path.exists() or path.is_symlink():
        raise Invalid("run root must be absent for create-only execution")
    _mkdir(path)
    _mkdir(path / "cells")
    _mkdir(path / "terminals")
    for slot in SLOTS:
        _mkdir(path / "cells" / slot)
    return path


def _open_run_root(path_text: str) -> Path:
    path = Path(path_text).resolve()
    if path.parent != EVIDENCE_ROOT.resolve() or not path.is_dir() or path.is_symlink():
        raise Invalid("invalid simulation run root")
    return path


def _run_contract(run_id: str, scenario: str, contract_storage: bytes,
                  contract: dict[str, Any], semantic_storage: bytes,
                  semantic: dict[str, Any]) -> dict[str, Any]:
    schedule_bytes = _canonical(semantic["schedule"])
    return {
        "schema_id": "pw-r8-stabilization-run-contract-v1", "run_id": run_id,
        "run_kind": "SYNTHETIC_ZERO_CREDIT_MATRIX", "scenario": scenario,
        "qualification_credit": 0,
        "controller_source_path": contract["controller_custody"]["source_path"],
        "controller_checkpoint_commit": contract["controller_custody"]["required_git_commit"],
        "stabilization_base_checkpoint": contract["lineage"]["stabilization_base_checkpoint"],
        "experiment_contract": _binding(CONTRACT_PATH, contract_storage),
        "semantic_manifest": _binding(SEMANTIC_PATH, semantic_storage),
        "routes": semantic["routes"], "schedule_sha256": _sha(schedule_bytes),
        "schedule_bytes": len(schedule_bytes), "fresh_task_thread_per_cell": True,
        "retry_count": 0, "best_of": False, "replacement_result": False,
    }


def _invoke_backend(request: dict[str, Any]) -> tuple[bytes, bytes, dict[str, Any]]:
    request_storage = _canonical(request) + b"\n"
    started = time.monotonic_ns()
    process = subprocess.Popen(
        ["/usr/bin/python3", str(SIMULATOR_PATH)], stdin=subprocess.PIPE,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=REPO,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    if process.stdin is None:
        raise Invalid("backend stdin unavailable")
    process.stdin.write(request_storage)
    process.stdin.close()
    process.stdin = None
    polls = 0
    while process.poll() is None:
        polls += 1
        if polls > 5000:
            process.kill()
            process.wait()
            raise Invalid("backend failed to reach terminal")
        time.sleep(0.001)
    stdout, stderr = process.communicate()
    ended = time.monotonic_ns()
    metadata = {
        "process_pid": process.pid, "poll_count": polls,
        "live_session_observed": polls >= 2, "returncode": process.returncode,
        "started_monotonic_ns": started, "ended_monotonic_ns": ended,
        "duration_ns": ended - started,
    }
    return stdout, stderr, metadata


def _raw_result(run_id: str, slot: str, cell: str, index: int, scenario: str,
                identities: dict[str, str], render_before: bytes,
                render_after: bytes, stdout: bytes, stderr: bytes,
                metadata: dict[str, Any]) -> dict[str, Any]:
    try:
        stdout_text = stdout.decode("utf-8")
        stderr_text = stderr.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid("synthetic backend emitted non-UTF-8 stream") from exc
    return {
        "schema_id": "pw-r8-stabilization-raw-result-v1", "run_id": run_id,
        "slot": slot, "cell": cell, "ordered_index": index, "scenario": scenario,
        "task_id": identities["task"], "thread_id": identities["thread"],
        "turn_id": identities["turn"], "rollout_id": identities["rollout"],
        "render_sha256_before": _sha(render_before), "render_bytes_before": len(render_before),
        "process_pid": metadata["process_pid"], "poll_count": metadata["poll_count"],
        "live_session_observed": metadata["live_session_observed"],
        "returncode": metadata["returncode"],
        "started_monotonic_ns": metadata["started_monotonic_ns"],
        "ended_monotonic_ns": metadata["ended_monotonic_ns"],
        "duration_ns": metadata["duration_ns"], "stdout_utf8": stdout_text,
        "stdout_sha256": _sha(stdout), "stdout_bytes": len(stdout),
        "stderr_utf8": stderr_text, "stderr_sha256": _sha(stderr),
        "stderr_bytes": len(stderr), "render_sha256_after": _sha(render_after),
        "render_bytes_after": len(render_after), "terminal_metadata_complete": True,
    }


def _score(run_id: str, slot: str, cell_row: dict[str, Any], raw: dict[str, Any],
           raw_storage: bytes) -> dict[str, Any]:
    expected = _canonical(cell_row["expected_output"]) + b"\n"
    stdout = raw["stdout_utf8"].encode("utf-8")
    immutable = (raw["render_sha256_before"], raw["render_bytes_before"]) == (
        raw["render_sha256_after"], raw["render_bytes_after"])
    reason = "PASS"
    if not immutable:
        reason = "RENDER_MUTATED_AFTER_DISPATCH"
    elif raw["returncode"] != 0:
        reason = "PROCESS_NONZERO_EXIT"
    elif not stdout:
        reason = "MISSING_STDOUT"
    elif not stdout.endswith(b"\n") or stdout.endswith(b"\n\n") or b"\r" in stdout:
        reason = "PARTIAL_OR_NONCANONICAL_STDOUT"
    else:
        try:
            parsed = json.loads(stdout[:-1].decode("utf-8"), object_pairs_hook=_duplicates)
        except (UnicodeDecodeError, json.JSONDecodeError, Invalid):
            parsed = None
        if parsed is None or _canonical(parsed) + b"\n" != stdout:
            reason = "INVALID_OUTPUT_JSON"
        elif stdout != expected:
            reason = "SEMANTIC_MISMATCH"
    verdict = "PASS" if reason == "PASS" else "FAIL"
    return {
        "schema_id": "pw-r8-stabilization-score-v1", "run_id": run_id,
        "slot": slot, "cell": cell_row["cell"], "ordered_index": cell_row["ordered_index"],
        "verdict": verdict, "reason": reason,
        "expected_output_sha256": _sha(expected), "expected_output_bytes": len(expected),
        "actual_output_sha256": _sha(stdout) if stdout else None,
        "actual_output_bytes": len(stdout), "raw_result_sha256": _sha(raw_storage),
        "raw_result_bytes": len(raw_storage), "render_immutable_through_terminal": immutable,
        "deterministic": True,
    }


def _completion(run_id: str, slot: str, cell_row: dict[str, Any], identities: dict[str, str],
                render: bytes, raw_storage: bytes, score_storage: bytes,
                score: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-stabilization-cell-completion-v1", "run_id": run_id,
        "slot": slot, "cell": cell_row["cell"], "ordered_index": cell_row["ordered_index"],
        "status": "SEALED_PASS" if score["verdict"] == "PASS" else "SEALED_FAIL",
        "task_id": identities["task"], "thread_id": identities["thread"],
        "turn_id": identities["turn"], "rollout_id": identities["rollout"],
        "render_sha256": _sha(render), "render_bytes": len(render),
        "raw_result_sha256": _sha(raw_storage), "raw_result_bytes": len(raw_storage),
        "score_sha256": _sha(score_storage), "score_bytes": len(score_storage),
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "sealed_after_terminal_metadata": True,
    }


def _path_terminal(run_id: str, slot: str, completions: list[tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    rows = [{"cell": value["cell"], "sha256": _sha(storage), "bytes": len(storage),
             "status": value["status"]} for storage, value in completions]
    inventory = _canonical(rows)
    values = [value for _, value in completions]
    return {
        "schema_id": "pw-r8-stabilization-path-terminal-v1", "run_id": run_id,
        "slot": slot, "status": "PASS" if len(values) == 97 and all(v["status"] == "SEALED_PASS" for v in values) else "FAIL",
        "scheduled_cells": 97, "sealed_cells": len(values),
        "pass_cells": sum(v["status"] == "SEALED_PASS" for v in values),
        "completion_inventory_sha256": _sha(inventory),
        "completion_inventory_bytes": len(inventory),
        "unique_task_ids": len({v["task_id"] for v in values}),
        "unique_thread_ids": len({v["thread_id"] for v in values}),
        "unique_turn_ids": len({v["turn_id"] for v in values}),
        "unique_rollout_ids": len({v["rollout_id"] for v in values}),
    }


def _stop_terminal(run_id: str, scenario: str, slot: str, cell: str,
                   status: str, sealed_cells: int, reason: str) -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-stabilization-stop-terminal-v1", "run_id": run_id,
        "scenario": scenario, "slot": slot, "cell": cell, "status": status,
        "sealed_started_cells": sealed_cells, "no_schedule_advance_after_stop": True,
        "reason": reason, "qualification_credit": 0,
    }


def _run_matrix(run_root_text: str, run_id: str, scenario: str) -> dict[str, Any]:
    if scenario not in SCENARIOS:
        raise Invalid("unsupported fixed simulation scenario")
    if not run_id or any(ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-" for ch in run_id):
        raise Invalid("invalid run id")
    contract_storage, contract, semantic_storage, semantic = _load_controls()
    root = _new_run_root(run_root_text)
    run_contract = _run_contract(run_id, scenario, contract_storage, contract, semantic_storage, semantic)
    if tuple(run_contract) != RUN_KEYS:
        raise Invalid("internal run contract key order drift")
    _persist(root / "run_contract.json", run_contract)
    if scenario == "render_two_lf":
        cell_row = semantic["cells"][0]
        invalid_render = cell_row["render_storage_utf8"].encode("utf-8") + b"\n"
        if invalid_render.endswith(b"\n\n"):
            stop = _stop_terminal(run_id, scenario, SLOTS[0], cell_row["cell"],
                                  "REJECTED_BEFORE_DISPATCH", 0, "TWO_TERMINAL_LF")
            _persist(root / "terminals" / "stop.json", stop)
            return stop
        raise Invalid("two-LF fault did not materialize")

    all_completions: list[tuple[bytes, dict[str, Any]]] = []
    path_bindings: list[dict[str, Any]] = []
    raw_processes = 0
    single_case = scenario != FULL_SCENARIO
    for slot in SLOTS:
        slot_completions: list[tuple[bytes, dict[str, Any]]] = []
        for cell_row in semantic["cells"]:
            index = cell_row["ordered_index"]
            cell = cell_row["cell"]
            directory = _cell_dir(root, slot, index, cell)
            _mkdir(directory)
            render = cell_row["render_storage_utf8"].encode("utf-8")
            if not render.endswith(b"\n") or render.endswith(b"\n\n"):
                raise Invalid("render rejected before dispatch")
            render_path = directory / "render.txt"
            _exclusive_bytes(render_path, render)
            reopened_render = _regular(render_path, "pre-dispatch render reopen")
            if reopened_render != render:
                raise Invalid("pre-dispatch render storage mismatch")
            identities = {kind: _identity(kind, run_id, slot, cell)
                          for kind in ("task", "thread", "turn", "rollout")}
            backend_scenario = scenario
            if scenario == FULL_SCENARIO:
                backend_scenario = "delayed_live" if (len(all_completions) % 29 == 0) else "immediate"
            request = {
                "schema_id": "pw-r8-synthetic-backend-request-v1", "scenario": backend_scenario,
                "run_id": run_id, "slot": slot, "cell": cell, "ordered_index": index,
                "task_id": identities["task"], "thread_id": identities["thread"],
                "turn_id": identities["turn"], "rollout_id": identities["rollout"],
                "render_path": str(render_path), "expected_output": cell_row["expected_output"],
            }
            stdout, stderr, metadata = _invoke_backend(request)
            raw_processes += 1
            render_after = _regular(render_path, "post-terminal render reopen")
            raw = _raw_result(run_id, slot, cell, index, backend_scenario, identities,
                              render, render_after, stdout, stderr, metadata)
            if tuple(raw) != RAW_KEYS:
                raise Invalid("internal raw result key order drift")
            raw_storage, _, _ = _persist(directory / "raw_result.json", raw)
            score = _score(run_id, slot, cell_row, raw, raw_storage)
            if tuple(score) != SCORE_KEYS:
                raise Invalid("internal score key order drift")
            score_storage, _, _ = _persist(directory / "score.json", score)
            completion = _completion(run_id, slot, cell_row, identities, render,
                                     raw_storage, score_storage, score)
            if tuple(completion) != COMPLETION_KEYS:
                raise Invalid("internal completion key order drift")
            completion_storage, _, _ = _persist(directory / "completion.json", completion)
            slot_completions.append((completion_storage, completion))
            all_completions.append((completion_storage, completion))
            if single_case:
                status = "SCENARIO_PASS" if score["verdict"] == "PASS" else "SCENARIO_TYPED_FAIL"
                stop = _stop_terminal(run_id, scenario, slot, cell, status, 1, score["reason"])
                _persist(root / "terminals" / "stop.json", stop)
                return stop
            if score["verdict"] != "PASS":
                stop = _stop_terminal(run_id, scenario, slot, cell, "SAFE_STOP_SEALED", 1, score["reason"])
                _persist(root / "terminals" / "stop.json", stop)
                return stop
        terminal = _path_terminal(run_id, slot, slot_completions)
        if tuple(terminal) != PATH_KEYS or terminal["status"] != "PASS":
            raise Invalid("path terminal failed")
        path_storage, path_sha, path_bytes = _persist(root / "terminals" / f"path_{slot}.json", terminal)
        path_bindings.append({"slot": slot, "sha256": path_sha, "bytes": path_bytes})
    path_inventory = _canonical(path_bindings)
    matrix = {
        "schema_id": "pw-r8-stabilization-matrix-terminal-v1", "run_id": run_id,
        "status": "PASS", "scheduled_cells": 291, "sealed_cells": len(all_completions),
        "pass_cells": sum(value["status"] == "SEALED_PASS" for _, value in all_completions),
        "path_terminal_inventory_sha256": _sha(path_inventory),
        "path_terminal_inventory_bytes": len(path_inventory),
        "zero_subject_provider_network_calls": True, "qualification_credit": 0,
    }
    if tuple(matrix) != MATRIX_KEYS or matrix["sealed_cells"] != 291 or matrix["pass_cells"] != 291:
        raise Invalid("matrix terminal failed")
    matrix_storage, matrix_sha, matrix_bytes = _persist(root / "terminals" / "matrix.json", matrix)
    values = [value for _, value in all_completions]
    accounting = {
        "schema_id": "pw-r8-stabilization-accounting-terminal-v1", "run_id": run_id,
        "status": "PASS", "matrix_terminal_sha256": matrix_sha,
        "matrix_terminal_bytes": matrix_bytes, "raw_processes": raw_processes,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "fresh_task_ids": len({v["task_id"] for v in values}),
        "fresh_thread_ids": len({v["thread_id"] for v in values}),
        "fresh_turn_ids": len({v["turn_id"] for v in values}),
        "fresh_rollout_ids": len({v["rollout_id"] for v in values}),
    }
    if tuple(accounting) != ACCOUNTING_KEYS or any(accounting[key] != 291 for key in (
            "raw_processes", "fresh_task_ids", "fresh_thread_ids", "fresh_turn_ids", "fresh_rollout_ids")):
        raise Invalid("accounting terminal failed")
    _persist(root / "terminals" / "accounting.json", accounting)
    return matrix


def _all_regular_files(root: Path) -> set[str]:
    files: set[str] = set()
    for base, directories, names in os.walk(root, followlinks=False):
        base_path = Path(base)
        for directory in directories:
            info = os.lstat(base_path / directory)
            if not stat.S_ISDIR(info.st_mode):
                raise Invalid("run root contains symlink/non-directory")
        for name in names:
            path = base_path / name
            info = os.lstat(path)
            if not stat.S_ISREG(info.st_mode):
                raise Invalid("run root contains nonregular evidence")
            files.add(path.relative_to(root).as_posix())
    return files


def _reopen_matrix(run_root_text: str) -> dict[str, Any]:
    contract_storage, contract, semantic_storage, semantic = _load_controls()
    root = _open_run_root(run_root_text)
    run_storage, run = _strict(root / "run_contract.json", "run contract")
    if tuple(run) != RUN_KEYS or run.get("schema_id") != "pw-r8-stabilization-run-contract-v1" or run.get("scenario") != FULL_SCENARIO:
        raise Invalid("reopen requires exact full-pass run contract")
    if run.get("experiment_contract") != _binding(CONTRACT_PATH, contract_storage) or run.get("semantic_manifest") != _binding(SEMANTIC_PATH, semantic_storage):
        raise Invalid("run contract source binding mismatch")
    expected_files = {"run_contract.json", "terminals/matrix.json", "terminals/accounting.json"}
    expected_files.update(f"terminals/path_{slot}.json" for slot in SLOTS)
    all_values: list[dict[str, Any]] = []
    path_bindings: list[dict[str, Any]] = []
    for slot in SLOTS:
        completions: list[tuple[bytes, dict[str, Any]]] = []
        for cell_row in semantic["cells"]:
            directory = _cell_dir(root, slot, cell_row["ordered_index"], cell_row["cell"])
            prefix = directory.relative_to(root).as_posix()
            expected_files.update({f"{prefix}/render.txt", f"{prefix}/raw_result.json",
                                   f"{prefix}/score.json", f"{prefix}/completion.json"})
            render = _regular(directory / "render.txt", "reopen render")
            expected_render = cell_row["render_storage_utf8"].encode("utf-8")
            if render != expected_render:
                raise Invalid("reopen render differs from frozen provider input")
            raw_storage, raw = _strict(directory / "raw_result.json", "reopen raw result")
            score_storage, score = _strict(directory / "score.json", "reopen score")
            completion_storage, completion = _strict(directory / "completion.json", "reopen completion")
            if tuple(raw) != RAW_KEYS or tuple(score) != SCORE_KEYS or tuple(completion) != COMPLETION_KEYS:
                raise Invalid("reopen cell schema mismatch")
            if (raw.get("run_id"), raw.get("slot"), raw.get("cell"), raw.get("ordered_index")) != (run["run_id"], slot, cell_row["cell"], cell_row["ordered_index"]):
                raise Invalid("reopen cell identity mismatch")
            if not raw.get("terminal_metadata_complete") or raw.get("returncode") != 0:
                raise Invalid("reopen terminal process metadata invalid")
            if (raw.get("render_sha256_before"), raw.get("render_bytes_before"),
                    raw.get("render_sha256_after"), raw.get("render_bytes_after")) != (
                    _sha(render), len(render), _sha(render), len(render)):
                raise Invalid("reopen render mutation detected")
            stdout = raw["stdout_utf8"].encode("utf-8")
            if (raw.get("stdout_sha256"), raw.get("stdout_bytes")) != (_sha(stdout), len(stdout)):
                raise Invalid("reopen stdout binding mismatch")
            expected_score = _score(run["run_id"], slot, cell_row, raw, raw_storage)
            if score != expected_score or score.get("verdict") != "PASS":
                raise Invalid("reopen deterministic score mismatch")
            identities = {kind: completion[f"{kind}_id"] for kind in ("task", "thread", "turn", "rollout")}
            expected_completion = _completion(run["run_id"], slot, cell_row, identities,
                                              render, raw_storage, score_storage, score)
            if completion != expected_completion or completion.get("status") != "SEALED_PASS":
                raise Invalid("reopen completion mismatch")
            completions.append((completion_storage, completion))
            all_values.append(completion)
        path_storage, path_terminal = _strict(root / "terminals" / f"path_{slot}.json", "path terminal")
        expected_path = _path_terminal(run["run_id"], slot, completions)
        if tuple(path_terminal) != PATH_KEYS or path_terminal != expected_path:
            raise Invalid("reopen path terminal mismatch")
        path_bindings.append({"slot": slot, "sha256": _sha(path_storage), "bytes": len(path_storage)})
    observed_files = _all_regular_files(root)
    if observed_files != expected_files:
        raise Invalid(f"run root file set mismatch: extra={sorted(observed_files-expected_files)} missing={sorted(expected_files-observed_files)}")
    matrix_storage, matrix = _strict(root / "terminals" / "matrix.json", "matrix terminal")
    path_inventory = _canonical(path_bindings)
    expected_matrix = {
        "schema_id": "pw-r8-stabilization-matrix-terminal-v1", "run_id": run["run_id"],
        "status": "PASS", "scheduled_cells": 291, "sealed_cells": 291, "pass_cells": 291,
        "path_terminal_inventory_sha256": _sha(path_inventory),
        "path_terminal_inventory_bytes": len(path_inventory),
        "zero_subject_provider_network_calls": True, "qualification_credit": 0,
    }
    if tuple(matrix) != MATRIX_KEYS or matrix != expected_matrix:
        raise Invalid("reopen matrix terminal mismatch")
    _, accounting = _strict(root / "terminals" / "accounting.json", "accounting terminal")
    expected_accounting = {
        "schema_id": "pw-r8-stabilization-accounting-terminal-v1", "run_id": run["run_id"],
        "status": "PASS", "matrix_terminal_sha256": _sha(matrix_storage),
        "matrix_terminal_bytes": len(matrix_storage), "raw_processes": 291,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "fresh_task_ids": len({v["task_id"] for v in all_values}),
        "fresh_thread_ids": len({v["thread_id"] for v in all_values}),
        "fresh_turn_ids": len({v["turn_id"] for v in all_values}),
        "fresh_rollout_ids": len({v["rollout_id"] for v in all_values}),
    }
    if tuple(accounting) != ACCOUNTING_KEYS or accounting != expected_accounting:
        raise Invalid("reopen accounting terminal mismatch")
    return {
        "schema_id": "pw-r8-stabilization-reopen-receipt-v1", "run_id": run["run_id"],
        "status": "PASS", "files_reopened": len(expected_files), "cells_reopened": 291,
        "paths_reopened": 3, "matrix_reopened": True, "accounting_reopened": True,
        "fresh_task_ids": expected_accounting["fresh_task_ids"],
        "fresh_thread_ids": expected_accounting["fresh_thread_ids"],
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "qualification_credit": 0,
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="controller.py")
    sub = parser.add_subparsers(dest="command", required=True)
    run = sub.add_parser("run-matrix")
    run.add_argument("--run-root", required=True)
    run.add_argument("--run-id", required=True)
    run.add_argument("--scenario", choices=SCENARIOS, default=FULL_SCENARIO)
    reopen = sub.add_parser("reopen-matrix")
    reopen.add_argument("--run-root", required=True)
    return parser


def main() -> int:
    args = _parser().parse_args()
    try:
        if args.command == "run-matrix":
            result = _run_matrix(args.run_root, args.run_id, args.scenario)
        else:
            result = _reopen_matrix(args.run_root)
    except (Invalid, OSError, subprocess.SubprocessError) as exc:
        sys.stdout.buffer.write(_canonical({"status": "FAIL_CLOSED", "error": str(exc)}) + b"\n")
        return 2
    sys.stdout.buffer.write(_canonical(result) + b"\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
