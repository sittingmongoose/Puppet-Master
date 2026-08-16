#!/usr/bin/env python3
"""Trusted, sequential R9 experiment controller."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import secrets
import stat
import sys
import time
from typing import Any

from backend import invoke
from verifier import verify

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parents[1]
REPO = ROOT.parents[4]
ARCHITECTURE = ROOT / "architecture_contract.json"
SEMANTIC = ROOT / "semantic_manifest.json"
OPERATING = SUCCESSOR / "r9_goal_operating_contract_v1.json"
EVIDENCE = ROOT / "evidence"
OPERATING_ID = ("764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd", 7024)
CHECKPOINT = "d1d139e01d99a612319148c43b6d9e43b0cb8a0e"
SAFE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
NONCE = re.compile(r"[0-9a-f]{64}\Z")
STOP = False


class Invalid(RuntimeError):
    pass


def _canon(value: Any) -> bytes:
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                          separators=(",", ":")).encode()
    except (TypeError, ValueError) as exc:
        raise Invalid(f"not canonical-JSON-able: {exc}") from exc


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise Invalid(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def _regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(info.st_mode):
        raise Invalid(f"{label}: not a regular nonlink")
    return path.read_bytes()


def _json(path: Path, label: str, exact: bool = True) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise Invalid(f"{label}: not one-LF JSON storage")
    try:
        value = json.loads(storage[:-1].decode(), object_pairs_hook=_pairs,
                           parse_constant=lambda value: (_ for _ in ()).throw(Invalid(value)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or (exact and storage != _canon(value) + b"\n"):
        raise Invalid(f"{label}: not a canonical object")
    return storage, value


def _dir(path: Path, label: str) -> None:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISDIR(info.st_mode):
        raise Invalid(f"{label}: not a directory nonlink")


def _sync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _mkdir(path: Path) -> None:
    try:
        os.mkdir(path, 0o755)
    except FileExistsError as exc:
        raise Invalid(f"create-only directory exists: {path}") from exc
    _dir(path, str(path))
    _sync_dir(path.parent)


def _write(path: Path, storage: bytes) -> tuple[str, int]:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise Invalid(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _sync_dir(path.parent)
    if _regular(path, f"reopened {path.name}") != storage:
        raise Invalid(f"reopen mismatch: {path}")
    return _sha(storage), len(storage)


def _write_json(path: Path, value: dict[str, Any]) -> tuple[str, int]:
    return _write(path, _canon(value) + b"\n")


def _binding(path: Path, storage: bytes) -> dict[str, Any]:
    return {"path": str(path.relative_to(REPO)), "sha256": _sha(storage), "bytes": len(storage)}


def _name(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SAFE.fullmatch(value):
        raise Invalid(f"{label}: unsafe name")
    return value


def _controls() -> dict[str, Any]:
    operating_bytes, operating = _json(OPERATING, "operating contract", False)
    if (_sha(operating_bytes), len(operating_bytes)) != OPERATING_ID or operating.get("schema_id") != "pw-r9-goal-operating-contract-v1":
        raise Invalid("operating-contract identity mismatch")
    architecture_bytes, architecture = _json(ARCHITECTURE, "architecture contract", False)
    lineage = architecture.get("lineage")
    if architecture.get("schema_id") != "pw-r9-minimal-controller-architecture-v1" or not isinstance(lineage, dict):
        raise Invalid("architecture-contract identity mismatch")
    declared = lineage.get("operating_contract")
    if lineage.get("required_checkpoint") != CHECKPOINT or not isinstance(declared, dict) or (declared.get("sha256"), declared.get("bytes")) != OPERATING_ID:
        raise Invalid("architecture lineage mismatch")
    semantic_bytes, semantic = _json(SEMANTIC, "semantic manifest", False)
    routes, schedule, cells, files = (semantic.get(key) for key in ("routes", "schedule", "cells", "files"))
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v1":
        raise Invalid("semantic-manifest identity mismatch")
    if not isinstance(routes, list) or len(routes) != 3:
        raise Invalid("exactly three routes required")
    slots: list[str] = []
    for route in routes:
        if not isinstance(route, dict) or set(route) != {"slot", "model", "thinking"}:
            raise Invalid("route shape mismatch")
        slots.append(_name(route.get("slot"), "route slot"))
        if not all(isinstance(route.get(key), str) and route[key] for key in ("model", "thinking")):
            raise Invalid("route identity absent")
    if len(set(slots)) != 3:
        raise Invalid("route slots not unique")
    if not isinstance(schedule, list) or len(schedule) != 97:
        raise Invalid("exact 97-cell schedule required")
    schedule = [_name(cell, "cell") for cell in schedule]
    if len(set(schedule)) != 97 or not isinstance(cells, list) or len(cells) != 97:
        raise Invalid("schedule/cell cardinality mismatch")
    for index, cell in enumerate(cells):
        if not isinstance(cell, dict) or not {"index", "cell", "render_utf8", "expected_output"}.issubset(cell):
            raise Invalid("cell shape mismatch")
        render = cell.get("render_utf8")
        if cell.get("index") != index or cell.get("cell") != schedule[index] or not isinstance(render, str):
            raise Invalid("cell order or render mismatch")
        raw = render.encode()
        if not raw.endswith(b"\n") or raw.endswith(b"\n\n") or b"\r" in raw:
            raise Invalid("render is not exact one-LF UTF-8")
        _canon(cell.get("expected_output"))
    if not isinstance(files, list):
        raise Invalid("semantic file inventory absent")
    paths: list[str] = []
    for item in files:
        if not isinstance(item, dict) or set(item) != {"path", "sha256", "bytes"}:
            raise Invalid("semantic file binding shape mismatch")
        rel = Path(item.get("path", ""))
        if rel.is_absolute() or ".." in rel.parts:
            raise Invalid("semantic source path is unsafe")
        resolved = (SUCCESSOR / rel).resolve()
        try:
            resolved.relative_to(SUCCESSOR)
        except ValueError as exc:
            raise Invalid("semantic source escapes successor root") from exc
        data = _regular(resolved, f"semantic source {rel}")
        if (item.get("sha256"), item.get("bytes")) != (_sha(data), len(data)):
            raise Invalid(f"semantic file drift: {rel}")
        paths.append(str(rel))
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("semantic file inventory not sorted unique")
    canary = semantic.get("canary_cell", schedule[0])
    if canary not in schedule:
        raise Invalid("canary cell absent from schedule")
    return {"operating": operating_bytes, "architecture": architecture_bytes,
            "semantic_bytes": semantic_bytes, "semantic": semantic,
            "routes": routes, "schedule": schedule, "cells": cells, "canary": canary}


def _run_root(text: str, create: bool) -> Path:
    if not text:
        raise Invalid("--run-root required")
    if create and not EVIDENCE.exists():
        _mkdir(EVIDENCE)
    else:
        _dir(EVIDENCE, "evidence root")
    path = Path(text)
    if not path.is_absolute() and len(path.parts) == 1:
        path = EVIDENCE / path
    path = path.resolve()
    if path.parent != EVIDENCE.resolve():
        raise Invalid("run root must be a direct child of iteration_001/evidence")
    _name(path.name, "run id")
    if create:
        if path.exists() or path.is_symlink():
            raise Invalid("run exists; resume and relaunch are forbidden")
        _mkdir(path)
        _mkdir(path / "cells")
        _mkdir(path / "terminals")
    else:
        _dir(path, "run root")
    return path


def _rows(command: str, controls: dict[str, Any]) -> list[dict[str, Any]]:
    cells = controls["cells"]
    if command == "run-canary":
        cells = [cells[controls["schedule"].index(controls["canary"])]]
    rows = [{"ordinal": ordinal, "slot": route["slot"], "route": route,
             "index": cell["index"], "cell": cell["cell"],
             "nonce": secrets.token_hex(32)}
            for ordinal, (route, cell) in enumerate(
                (route, cell) for route in controls["routes"] for cell in cells)]
    if len(rows) != (3 if command == "run-canary" else 291):
        raise Invalid("selected row count mismatch")
    return rows


def _used_values() -> set[str]:
    used: set[str] = set()
    if not EVIDENCE.exists():
        return used
    for run_root in sorted(EVIDENCE.iterdir(), key=lambda item: item.name):
        _dir(run_root, f"prior run {run_root.name}")
        if (run_root / "run.json").exists():
            _, run = _json(run_root / "run.json", "prior run")
            for row in run.get("rows", []):
                nonce = row.get("nonce") if isinstance(row, dict) else None
                if not isinstance(nonce, str) or not NONCE.fullmatch(nonce) or nonce in used:
                    raise Invalid("prior nonce absent or duplicated")
                used.add(nonce)
        cells = run_root / "cells"
        for path in sorted(cells.glob("*/*/raw_result.json")) if cells.is_dir() else []:
            _, raw = _json(path, "prior raw result")
            result = raw.get("backend_result")
            if not isinstance(result, dict):
                raise Invalid("prior backend result malformed")
            for key in ("task_id", "thread_id", "turn_id"):
                value = result.get(key)
                if not isinstance(value, str) or not value or value in used:
                    raise Invalid("prior task/thread/turn absent or duplicated")
                used.add(value)
    return used


def _row_path(root: Path, row: dict[str, Any]) -> Path:
    return root / "cells" / row["slot"] / f"{row['index']:03d}_{row['cell']}"


def _request(run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any], attempt_id: tuple[str, int]) -> dict[str, Any]:
    storage = cell["render_utf8"].encode()
    provider = storage[:-1]
    request = {"schema_id": "pw-r9-backend-request-v1", "mode": run["mode"],
               "run_id": run["run_id"], "slot": row["slot"], "cell": row["cell"],
               "index": row["index"], "route": row["route"], "nonce": row["nonce"],
               "provider_input_utf8": provider.decode(), "provider_input_sha256": _sha(provider),
               "provider_input_bytes": len(provider), "attempt_sha256": attempt_id[0],
               "attempt_bytes": attempt_id[1]}
    if run["mode"] == "synthetic":
        request.update(scenario=run["scenario"],
                       synthetic_expected_output_utf8=(_canon(cell["expected_output"]) + b"\n").decode())
    return request


def _result(result: Any, request: dict[str, Any], used: set[str] | None) -> dict[str, Any]:
    required = {"schema_id", "mode", "terminal", "nonce", "resolved_route",
                "provider_input_sha256", "provider_input_bytes", "task_id", "thread_id",
                "turn_id", "returncode", "stdout_utf8", "stderr_utf8", "process",
                "dispatch_count", "retry_count", "best_of", "replacement_result"}
    if not isinstance(result, dict) or not required.issubset(result):
        raise Invalid("backend result shape mismatch")
    if (result["schema_id"], result["mode"], result["terminal"], result["nonce"],
        result["resolved_route"], result["provider_input_sha256"], result["provider_input_bytes"]) != (
        "pw-r9-backend-result-v1", request["mode"], True, request["nonce"], request["route"],
        request["provider_input_sha256"], request["provider_input_bytes"]):
        raise Invalid("backend terminal/request binding mismatch")
    for key in ("task_id", "thread_id", "turn_id"):
        identity = result[key]
        if not isinstance(identity, str) or not identity or (used is not None and identity in used):
            raise Invalid(f"backend {key} absent or not globally fresh")
        if used is not None:
            used.add(identity)
    if isinstance(result["returncode"], bool) or not isinstance(result["returncode"], int):
        raise Invalid("backend returncode invalid")
    if not isinstance(result["stdout_utf8"], str) or not isinstance(result["stderr_utf8"], str):
        raise Invalid("backend output capture invalid")
    process = result["process"]
    if not isinstance(process, dict) or not {"kind", "pid", "started_utc", "ended_utc", "terminal_reason"}.issubset(process):
        raise Invalid("backend process metadata incomplete")
    if not all(isinstance(process[key], str) and process[key] for key in ("kind", "started_utc", "ended_utc", "terminal_reason")):
        raise Invalid("backend process metadata invalid")
    if process["pid"] is not None and (isinstance(process["pid"], bool) or not isinstance(process["pid"], int)):
        raise Invalid("backend pid invalid")
    if (result["dispatch_count"], result["retry_count"], result["best_of"], result["replacement_result"]) != (1, 0, False, False):
        raise Invalid("backend dispatch/retry/best-of/replacement mismatch")
    _canon(result)
    return result


def _score(result: dict[str, Any], expected: Any) -> dict[str, Any]:
    wanted, actual = _canon(expected) + b"\n", result["stdout_utf8"].encode()
    if result["returncode"] != 0:
        verdict, reason = "FAIL", "NONZERO_EXIT"
    elif actual != wanted:
        verdict, reason = "FAIL", "EXACT_OUTPUT_MISMATCH"
    else:
        verdict, reason = "PASS", "EXACT_CANONICAL_OUTPUT_MATCH"
    return {"rule": "EXACT_CANONICAL_JSON_PLUS_ONE_LF", "verdict": verdict, "reason": reason,
            "expected_sha256": _sha(wanted), "expected_bytes": len(wanted),
            "actual_sha256": _sha(actual), "actual_bytes": len(actual),
            "returncode": result["returncode"]}


def _reopen_row(root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any]) -> dict[str, Any]:
    path = _row_path(root, row)
    _dir(path, "row directory")
    if sorted(item.name for item in path.iterdir()) != ["attempt.json", "completion.json", "provider_input.txt", "raw_result.json"]:
        raise Invalid("row file inventory mismatch")
    render = _regular(path / "provider_input.txt", "provider input")
    if render != cell["render_utf8"].encode():
        raise Invalid("render drift")
    attempt_bytes, attempt = _json(path / "attempt.json", "attempt")
    raw_bytes, raw = _json(path / "raw_result.json", "raw result")
    _, completion = _json(path / "completion.json", "completion")
    provider = render[:-1]
    expected_attempt = {"schema_id": "pw-r9-attempt-v1", "run_id": root.name, "slot": row["slot"],
                        "cell": row["cell"], "index": row["index"], "route": row["route"],
                        "nonce": row["nonce"], "render_storage_sha256": _sha(render),
                        "render_storage_bytes": len(render), "provider_input_sha256": _sha(provider),
                        "provider_input_bytes": len(provider), "attempt": 1, "retry_count": 0,
                        "best_of": False, "replacement_result": False, "no_retry": True,
                        "no_relaunch": True}
    if attempt != expected_attempt or (raw.get("attempt_sha256"), raw.get("attempt_bytes")) != (_sha(attempt_bytes), len(attempt_bytes)):
        raise Invalid("attempt/raw binding mismatch")
    request = _request(run, row, cell, (_sha(attempt_bytes), len(attempt_bytes)))
    result = _result(raw.get("backend_result"), request, None)
    score = _score(result, cell["expected_output"])
    expected_completion = {"schema_id": "pw-r9-completion-v1", "run_id": root.name,
                           "slot": row["slot"], "cell": row["cell"], "index": row["index"],
                           "route": row["route"], "nonce": row["nonce"],
                           "task_id": result["task_id"], "thread_id": result["thread_id"],
                           "turn_id": result["turn_id"], "render_storage_sha256": _sha(render),
                           "render_storage_bytes": len(render), "provider_input_sha256": _sha(provider),
                           "provider_input_bytes": len(provider), "attempt_sha256": _sha(attempt_bytes),
                           "attempt_bytes": len(attempt_bytes), "raw_result_sha256": _sha(raw_bytes),
                           "raw_result_bytes": len(raw_bytes), "score": score, "status": score["verdict"],
                           "attempt": 1, "retry_count": 0, "best_of": False,
                           "replacement_result": False, "completion_is_last_row_write": True}
    if completion != expected_completion:
        raise Invalid("completion binding mismatch")
    complete_storage = _canon(completion) + b"\n"
    return {"ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
            "index": row["index"], "status": score["verdict"], "nonce": row["nonce"],
            "task_id": result["task_id"], "thread_id": result["thread_id"],
            "turn_id": result["turn_id"], "completion_sha256": _sha(complete_storage),
            "completion_bytes": len(complete_storage)}


def _seal(root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any], used: set[str]) -> None:
    slot = root / "cells" / row["slot"]
    if not slot.exists():
        _mkdir(slot)
    path = _row_path(root, row)
    _mkdir(path)
    render = cell["render_utf8"].encode()
    render_id = _write(path / "provider_input.txt", render)
    provider = render[:-1]
    attempt = {"schema_id": "pw-r9-attempt-v1", "run_id": root.name, "slot": row["slot"],
               "cell": row["cell"], "index": row["index"], "route": row["route"],
               "nonce": row["nonce"], "render_storage_sha256": render_id[0],
               "render_storage_bytes": render_id[1], "provider_input_sha256": _sha(provider),
               "provider_input_bytes": len(provider), "attempt": 1, "retry_count": 0,
               "best_of": False, "replacement_result": False, "no_retry": True, "no_relaunch": True}
    attempt_id = _write_json(path / "attempt.json", attempt)
    request = _request(run, row, cell, attempt_id)
    started = time.monotonic_ns()
    returned = invoke(request)
    ended = time.monotonic_ns()
    raw = {"schema_id": "pw-r9-raw-result-v1", "run_id": root.name, "slot": row["slot"],
           "cell": row["cell"], "index": row["index"], "attempt_sha256": attempt_id[0],
           "attempt_bytes": attempt_id[1], "dispatch_started_monotonic_ns": started,
           "dispatch_ended_monotonic_ns": ended, "backend_result": returned}
    raw_id = _write_json(path / "raw_result.json", raw)
    result = _result(returned, request, used)
    if _regular(path / "provider_input.txt", "post-terminal provider input") != render:
        raise Invalid("render mutated after admission")
    score = _score(result, cell["expected_output"])
    completion = {"schema_id": "pw-r9-completion-v1", "run_id": root.name, "slot": row["slot"],
                  "cell": row["cell"], "index": row["index"], "route": row["route"],
                  "nonce": row["nonce"], "task_id": result["task_id"],
                  "thread_id": result["thread_id"], "turn_id": result["turn_id"],
                  "render_storage_sha256": render_id[0], "render_storage_bytes": render_id[1],
                  "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
                  "attempt_sha256": attempt_id[0], "attempt_bytes": attempt_id[1],
                  "raw_result_sha256": raw_id[0], "raw_result_bytes": raw_id[1], "score": score,
                  "status": score["verdict"], "attempt": 1, "retry_count": 0,
                  "best_of": False, "replacement_result": False, "completion_is_last_row_write": True}
    _write_json(path / "completion.json", completion)
    _reopen_row(root, run, row, cell)


def _terminalize(root: Path, run: dict[str, Any], controls: dict[str, Any], cause: str | None) -> None:
    path_records, path_ids = [], []
    for route in controls["routes"]:
        slot = route["slot"]
        scheduled = [row for row in run["rows"] if row["slot"] == slot]
        complete, invalid, unstarted = [], [], []
        for row in scheduled:
            path = _row_path(root, row)
            if not path.exists() and not path.is_symlink():
                unstarted.append(row["ordinal"])
                continue
            try:
                complete.append(_reopen_row(root, run, row, controls["cells"][row["index"]]))
            except Invalid as exc:
                invalid.append({"ordinal": row["ordinal"], "reason": str(exc)})
        passed = sum(item["status"] == "PASS" for item in complete)
        failed = sum(item["status"] == "FAIL" for item in complete)
        status = "CONTROLLER_INVALID" if invalid else "INCOMPLETE" if len(complete) != len(scheduled) else "VALID_SUBJECT_FAIL" if failed else "PASS"
        inventory = _canon(complete)
        record = {"schema_id": "pw-r9-path-terminal-v1", "run_id": root.name, "slot": slot,
                  "status": status, "scheduled_rows": len(scheduled), "completed_rows": len(complete),
                  "pass_rows": passed, "subject_fail_rows": failed, "invalid_rows": invalid,
                  "unstarted_ordinals": unstarted, "completion_inventory_sha256": _sha(inventory),
                  "completion_inventory_bytes": len(inventory)}
        path_records.append(record)
        identity = _write_json(root / "terminals" / f"{slot}.json", record)
        path_ids.append({"slot": slot, "sha256": identity[0], "bytes": identity[1]})
    scheduled = sum(item["scheduled_rows"] for item in path_records)
    completed = sum(item["completed_rows"] for item in path_records)
    passed = sum(item["pass_rows"] for item in path_records)
    failed = sum(item["subject_fail_rows"] for item in path_records)
    invalid = sum(len(item["invalid_rows"]) for item in path_records)
    status = "CONTROLLER_INVALID" if cause or invalid or completed != scheduled else "VALID_SUBJECT_FAIL" if failed else "PASS"
    matrix = {"schema_id": "pw-r9-matrix-terminal-v1", "run_id": root.name, "status": status,
              "cause": cause, "scheduled_rows": scheduled, "completed_rows": completed,
              "pass_rows": passed, "subject_fail_rows": failed, "invalid_rows": invalid,
              "path_terminals": path_ids, "retry_count": 0, "best_of": False,
              "replacement_result": False}
    matrix_id = _write_json(root / "matrix_terminal.json", matrix)
    attempts = len(list((root / "cells").glob("*/*/attempt.json")))
    raw = len(list((root / "cells").glob("*/*/raw_result.json")))
    completions = len(list((root / "cells").glob("*/*/completion.json")))
    _write_json(root / "accounting.json", {"schema_id": "pw-r9-accounting-v1",
        "run_id": root.name, "status": status, "matrix_terminal_sha256": matrix_id[0],
        "matrix_terminal_bytes": matrix_id[1], "scheduled_rows": scheduled, "attempts": attempts,
        "captured_raw_results": raw, "valid_completions": completions,
        "unknown_or_uncaptured_dispatches": attempts - raw, "retry_count": 0,
        "best_of": False, "replacement_result": False})


def _reopen(root: Path, controls: dict[str, Any]) -> dict[str, Any]:
    run_bytes, run = _json(root / "run.json", "run")
    if run.get("schema_id") != "pw-r9-run-v1" or run.get("run_id") != root.name:
        raise Invalid("run identity mismatch")
    expected_bindings = (_binding(OPERATING, controls["operating"]),
                         _binding(ARCHITECTURE, controls["architecture"]),
                         _binding(SEMANTIC, controls["semantic_bytes"]))
    if (run.get("operating_contract"), run.get("architecture_contract"), run.get("semantic_manifest")) != expected_bindings:
        raise Invalid("run control binding mismatch")
    matrix_bytes, matrix = _json(root / "matrix_terminal.json", "matrix terminal")
    _, accounting = _json(root / "accounting.json", "accounting")
    if (accounting.get("matrix_terminal_sha256"), accounting.get("matrix_terminal_bytes")) != (_sha(matrix_bytes), len(matrix_bytes)):
        raise Invalid("matrix/accounting binding mismatch")
    expected = {"schema_id": "pw-r9-verifier-expectation-v1", "run_id": root.name,
                "command": run.get("command"), "scheduled_rows": run.get("scheduled_rows"),
                "evidence_root": str(EVIDENCE), "operating_contract": expected_bindings[0],
                "architecture_contract": expected_bindings[1], "semantic_manifest": expected_bindings[2]}
    report = verify(root, expected)
    if not isinstance(report, dict) or not isinstance(report.get("valid"), bool):
        raise Invalid("offline verifier report shape mismatch")
    status = matrix.get("status") if report["valid"] else "CONTROLLER_INVALID"
    return {"schema_id": "pw-r9-reopen-result-v1", "run_id": root.name,
            "run_sha256": _sha(run_bytes), "run_bytes": len(run_bytes), "status": status,
            "matrix_status": matrix.get("status"), "offline_verifier": report}


def _stop(_signum: int, _frame: Any) -> None:
    global STOP
    STOP = True


def _execute(command: str, name: str, scenario: str) -> dict[str, Any]:
    global STOP
    controls, used = _controls(), _used_values()
    root, rows = _run_root(name, True), _rows(command, controls)
    nonces = [row["nonce"] for row in rows]
    if len(set(nonces)) != len(nonces) or any(value in used for value in nonces):
        raise Invalid("nonce plan not globally fresh")
    used.update(nonces)
    mode = "synthetic" if command == "simulate" else "actual"
    run = {"schema_id": "pw-r9-run-v1", "run_id": root.name, "command": command, "mode": mode,
           "scenario": scenario if mode == "synthetic" else None,
           "qualification_credit": 0 if command != "run-matrix" else "EXTERNAL_ADJUDICATION_ONLY",
           "operating_contract": _binding(OPERATING, controls["operating"]),
           "architecture_contract": _binding(ARCHITECTURE, controls["architecture"]),
           "semantic_manifest": _binding(SEMANTIC, controls["semantic_bytes"]),
           "required_checkpoint": CHECKPOINT, "ordering": "slot-major", "rows": rows,
           "scheduled_rows": len(rows), "attempts_per_row": 1, "retry_count": 0,
           "best_of": False, "replacement_result": False, "resume": False}
    _write_json(root / "run.json", run)
    cause = None
    STOP = False
    old_int, old_term = signal.signal(signal.SIGINT, _stop), signal.signal(signal.SIGTERM, _stop)
    try:
        for row in rows:
            if STOP:
                cause = "STOP_REQUESTED_AFTER_DRAIN"
                break
            try:
                _seal(root, run, row, controls["cells"][row["index"]], used)
            except Exception as exc:
                cause = f"ROW_{row['ordinal']}_INVALID:{type(exc).__name__}:{exc}"
                break
            if STOP:
                cause = "STOP_REQUESTED_AFTER_DRAIN"
                break
    finally:
        signal.signal(signal.SIGINT, old_int)
        signal.signal(signal.SIGTERM, old_term)
    _terminalize(root, run, controls, cause)
    return _reopen(root, controls)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="R9 trusted sequential controller; internal iteration, zero credit.")
    commands = parser.add_subparsers(dest="command", required=True)
    simulate = commands.add_parser("simulate", help="synthetic 291-row traversal")
    simulate.add_argument("--run-root", help="new direct child of iteration_001/evidence")
    simulate.add_argument("--scenario", default="pass", help="synthetic backend scenario")
    simulate.add_argument("--check-only", action="store_true", help="validate controls with zero evidence/backend calls")
    canary = commands.add_parser("run-canary", help="one actual call per route")
    canary.add_argument("--run-root", required=True)
    matrix = commands.add_parser("run-matrix", help="actual slot-major 291-row matrix")
    matrix.add_argument("--run-root", required=True)
    reopen = commands.add_parser("reopen", help="offline exact-chain reopen")
    reopen.add_argument("--run-root", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "simulate" and args.check_only:
            controls = _controls()
            result = {"schema_id": "pw-r9-control-check-v1", "status": "PASS",
                      "backend_invocations": 0, "evidence_writes": 0,
                      "routes": len(controls["routes"]), "cells": len(controls["cells"]),
                      "matrix_rows": len(controls["routes"]) * len(controls["cells"])}
        elif args.command == "simulate":
            result = _execute("simulate", args.run_root, args.scenario)
        elif args.command in {"run-canary", "run-matrix"}:
            result = _execute(args.command, args.run_root, "actual")
        else:
            result = _reopen(_run_root(args.run_root, False), _controls())
        sys.stdout.buffer.write(_canon(result) + b"\n")
        return 0 if result.get("status") == "PASS" else 1 if result.get("status") == "VALID_SUBJECT_FAIL" else 2
    except Exception as exc:
        sys.stdout.buffer.write(_canon({"schema_id": "pw-r9-controller-error-v1",
            "status": "CONTROLLER_INVALID", "error_type": type(exc).__name__, "error": str(exc)}) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
