#!/usr/bin/env python3
"""Zero-provider deterministic simulator for the public R9 control boundary.

The simulator never imports controller.py, backend.py, or verifier.py.  It
materializes their exact current bytes in a disposable repository-shaped
sandbox and drives only controller.py's public ``simulate`` and ``reopen``
commands.  Synthetic artifacts and receipts have zero empirical or
qualification credit.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import stat
import subprocess
import sys
import time
from typing import Any, Callable

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parent
STABILIZATION = ROOT.parent
SUCCESSOR = ROOT.parents[1]
REPO = ROOT.parents[4]
RUNS = STABILIZATION / "simulator_runs"
OPERATING = SUCCESSOR / "r9_goal_operating_contract_v1.json"
ARCHITECTURE = ROOT / "architecture_contract.json"
SEMANTIC = ROOT / "semantic_manifest.json"
SCHEDULE = ROOT / "schedule.json"
ROUTES = ROOT / "routes.json"
SEMANTIC_RECEIPT = ROOT / "semantic_inventory_receipt.json"
CATALOG = ROOT / "regression_catalog.json"
CONTRACT = ROOT / "simulator_contract.json"
FAULTS = ROOT / "fault_scenarios.json"
CONTROLLER = ROOT / "controller.py"
BACKEND = ROOT / "backend.py"
VERIFIER = ROOT / "verifier.py"
SIMULATOR = ROOT / "simulator.py"
SAFE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
HEX64 = re.compile(r"[0-9a-f]{64}\Z")
FORBIDDEN_CANDIDATE_IMPORT = re.compile(
    r"(?:model_retest_r8_candidate_v|r8_candidate_v)(?:1[2-9]|20|21)(?:\.|/|\b)"
)


class SimulationError(RuntimeError):
    """A fail-closed simulator assertion."""


def _canon(value: Any) -> bytes:
    try:
        return json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise SimulationError(f"not canonical-JSON-able: {exc}") from exc


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _identity(data: bytes) -> dict[str, Any]:
    return {"sha256": _sha(data), "bytes": len(data)}


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise SimulationError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def _regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise SimulationError(f"{label}: absent: {path}") from exc
    if not stat.S_ISREG(info.st_mode):
        raise SimulationError(f"{label}: not a regular nonlink: {path}")
    try:
        return path.read_bytes()
    except OSError as exc:
        raise SimulationError(f"{label}: read failed: {exc}") from exc


def _directory(path: Path, label: str) -> None:
    try:
        info = os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise SimulationError(f"{label}: absent: {path}") from exc
    if not stat.S_ISDIR(info.st_mode):
        raise SimulationError(f"{label}: not a directory nonlink: {path}")


def _json(path: Path, label: str, canonical: bool = False) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise SimulationError(f"{label}: exactly one terminal LF and no CR required")
    try:
        value = json.loads(
            storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(
                SimulationError(f"nonfinite JSON value: {token}")
            ),
        )
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SimulationError(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise SimulationError(f"{label}: JSON object required")
    if canonical and storage != _canon(value) + b"\n":
        raise SimulationError(f"{label}: noncanonical JSON storage")
    return storage, value


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
        raise SimulationError(f"create-only directory exists: {path}") from exc
    _directory(path, "created directory")
    _sync_dir(path.parent)


def _ensure_dir(path: Path, boundary: Path) -> None:
    boundary = boundary.resolve()
    missing: list[Path] = []
    current = path
    while not current.exists():
        try:
            current.resolve(strict=False).relative_to(boundary)
        except ValueError as exc:
            raise SimulationError(f"directory escapes boundary: {path}") from exc
        missing.append(current)
        current = current.parent
    _directory(current, "existing ancestor")
    for item in reversed(missing):
        _mkdir(item)


def _write(path: Path, storage: bytes) -> dict[str, Any]:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _sync_dir(path.parent)
    if _regular(path, "reopened write") != storage:
        raise SimulationError(f"reopen mismatch: {path}")
    return _identity(storage)


def _write_json(path: Path, value: dict[str, Any]) -> dict[str, Any]:
    return _write(path, _canon(value) + b"\n")


def _relative(path: Path) -> str:
    try:
        return path.relative_to(REPO).as_posix()
    except ValueError as exc:
        raise SimulationError(f"source outside repository: {path}") from exc


def _source_inventory() -> list[Path]:
    _, semantic = _json(SEMANTIC, "semantic manifest")
    files = semantic.get("files")
    if not isinstance(files, list):
        raise SimulationError("semantic manifest files missing")
    sources = [
        OPERATING, ARCHITECTURE, SEMANTIC, SCHEDULE, ROUTES,
        SEMANTIC_RECEIPT, CONTROLLER, BACKEND, VERIFIER,
    ]
    for index, item in enumerate(files):
        if not isinstance(item, dict) or set(item) != {"path", "sha256", "bytes"}:
            raise SimulationError(f"semantic file row {index}: shape mismatch")
        text = item.get("path")
        if not isinstance(text, str):
            raise SimulationError(f"semantic file row {index}: path absent")
        rel = Path(text)
        if rel.is_absolute() or ".." in rel.parts:
            raise SimulationError(f"semantic file row {index}: unsafe path")
        source = SUCCESSOR / rel
        data = _regular(source, f"semantic file {text}")
        if _identity(data) != {"sha256": item.get("sha256"), "bytes": item.get("bytes")}:
            raise SimulationError(f"semantic file row {index}: identity drift: {text}")
        sources.append(source)
    unique = {path.resolve(): path for path in sources}
    return sorted(unique.values(), key=_relative)


def _trusted_snapshot() -> dict[str, dict[str, Any]]:
    paths = _source_inventory() + [SIMULATOR, CONTRACT, FAULTS, CATALOG]
    result: dict[str, dict[str, Any]] = {}
    for path in sorted({item.resolve(): item for item in paths}.values(), key=_relative):
        result[_relative(path)] = _identity(_regular(path, "trusted byte"))
    return result


def _json_transform(field: str, value: Any) -> Callable[[bytes], bytes]:
    def transform(storage: bytes) -> bytes:
        try:
            parsed = json.loads(storage.decode("utf-8"), object_pairs_hook=_pairs)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise SimulationError(f"tamper source JSON invalid: {exc}") from exc
        if not isinstance(parsed, dict):
            raise SimulationError("tamper source is not an object")
        parsed[field] = value
        return _canon(parsed) + b"\n"
    return transform


def _suite_root(text: str) -> Path:
    if not text:
        raise SimulationError("--run-root required")
    if not RUNS.exists():
        _mkdir(RUNS)
    else:
        _directory(RUNS, "simulator runs root")
    supplied = Path(text)
    path = (RUNS / supplied) if not supplied.is_absolute() and len(supplied.parts) == 1 else supplied
    path = path.resolve(strict=False)
    if path.parent != RUNS.resolve():
        raise SimulationError(f"run root must be a direct child of {RUNS}")
    if not SAFE.fullmatch(path.name):
        raise SimulationError("unsafe run-root name")
    if path.exists() or path.is_symlink():
        raise SimulationError("run root already exists; reuse is forbidden")
    _mkdir(path)
    _mkdir(path / "sandboxes")
    return path


def _sandbox_iteration(sandbox: Path) -> Path:
    return sandbox / ROOT.relative_to(REPO)


def _materialize(suite: Path, name: str, tamper: str | None = None) -> tuple[Path, dict[str, Any]]:
    if not SAFE.fullmatch(name):
        raise SimulationError(f"unsafe sandbox name: {name}")
    sandbox = suite / "sandboxes" / name
    _mkdir(sandbox)
    repo = sandbox / "repo"
    _mkdir(repo)
    sources = _source_inventory()
    _, semantic = _json(SEMANTIC, "semantic manifest")
    manifest_sources = [SUCCESSOR / Path(item["path"]) for item in semantic["files"]]
    omitted = manifest_sources[0] if tamper == "omit_declared_semantic_source" else None
    nonregular = manifest_sources[0] if tamper == "declared_source_as_directory" else None
    drifted = manifest_sources[0] if tamper == "change_declared_source_byte_on_copy" else None
    copied: list[dict[str, Any]] = []
    for source in sources:
        target = repo / source.relative_to(REPO)
        _ensure_dir(target.parent, repo)
        if source == omitted:
            continue
        if source == nonregular:
            _mkdir(target)
            copied.append({"path": _relative(source), "kind": "directory"})
            continue
        transform: Callable[[bytes], bytes] | None = None
        if source == drifted:
            transform = lambda data: (bytes([data[0] ^ 1]) + data[1:]) if data else b"x"
        elif source == SEMANTIC and tamper == "change_semantic_manifest_byte_on_copy":
            transform = _json_transform("schema_id", "pw-r9-semantic-manifest-tampered")
        elif source == OPERATING and tamper == "change_operating_contract_byte_on_copy":
            transform = _json_transform("schema_id", "pw-r9-goal-operating-contract-tampered")
        elif source == ARCHITECTURE and tamper == "change_architecture_checkpoint_on_copy":
            def architecture_checkpoint(data: bytes) -> bytes:
                value = json.loads(data)
                value["lineage"]["required_checkpoint"] = "0" * 40
                return _canon(value) + b"\n"
            transform = architecture_checkpoint
        elif source == ARCHITECTURE and tamper == "change_architecture_schema_on_copy":
            transform = _json_transform("schema_id", "pw-r9-minimal-controller-architecture-tampered")
        data = _regular(source, "materialization source")
        if transform is not None:
            data = transform(data)
        identity = _write(target, data)
        copied.append({"path": _relative(source), "kind": "file", **identity})
    if tamper == "add_undeclared_control_member":
        target = _sandbox_iteration(repo) / "undeclared-control-member.json"
        _ensure_dir(target.parent, repo)
        _write_json(target, {"schema_id": "pw-r9-undeclared-member-v1"})
    return repo, {"tamper": tamper, "copied": copied}


def _clone_sandbox(suite: Path, source_repo: Path, name: str) -> Path:
    sandbox = suite / "sandboxes" / name
    _mkdir(sandbox)
    target_repo = sandbox / "repo"
    _mkdir(target_repo)
    for current, dirs, files in os.walk(source_repo):
        current_path = Path(current)
        dirs.sort()
        files.sort()
        for directory in dirs:
            source_dir = current_path / directory
            info = os.lstat(source_dir)
            if not stat.S_ISDIR(info.st_mode):
                raise SimulationError(f"clone source directory is not nonlink: {source_dir}")
            target_dir = target_repo / source_dir.relative_to(source_repo)
            if not target_dir.exists():
                _ensure_dir(target_dir.parent, target_repo)
                _mkdir(target_dir)
        for filename in files:
            source_file = current_path / filename
            target_file = target_repo / source_file.relative_to(source_repo)
            _ensure_dir(target_file.parent, target_repo)
            _write(target_file, _regular(source_file, "clone source"))
    return target_repo


def _parse_stdout(stdout: bytes) -> dict[str, Any] | None:
    lines = [line for line in stdout.splitlines() if line.strip()]
    if not lines:
        return None
    try:
        value = json.loads(lines[-1])
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def _invoke(repo: Path, args: list[str], timeout: float = 300.0) -> dict[str, Any]:
    if not args or args[0] not in {"simulate", "reopen"}:
        raise SimulationError("simulator may invoke only public simulate or reopen")
    iteration = _sandbox_iteration(repo)
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["R9_SIMULATOR_ZERO_PROVIDER"] = "1"
    started = time.monotonic_ns()
    try:
        completed = subprocess.run(
            [sys.executable, "controller.py", *args], cwd=iteration, env=env,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise SimulationError(f"controller timed out: {args}") from exc
    ended = time.monotonic_ns()
    return {
        "args": args,
        "rc": completed.returncode,
        "stdout": completed.stdout.decode("utf-8", "replace"),
        "stderr": completed.stderr.decode("utf-8", "replace"),
        "result": _parse_stdout(completed.stdout),
        "elapsed_monotonic_ns": ended - started,
    }


def _supervised(repo: Path, run_id: str, scenario: str, fault: str, timeout: float = 30.0) -> dict[str, Any]:
    iteration = _sandbox_iteration(repo)
    evidence = iteration / "evidence" / run_id
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["R9_SIMULATOR_ZERO_PROVIDER"] = "1"
    command = [sys.executable, "controller.py", "simulate", "--run-root", run_id, "--scenario", scenario]
    process = subprocess.Popen(
        command, cwd=iteration, env=env, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, start_new_session=True,
    )
    patterns = {
        "sigkill_after_attempt": "cells/*/*/attempt.json",
        "sigterm_after_first_attempt": "cells/*/*/attempt.json",
        "sigkill_after_raw_result": "cells/*/*/raw_result.json",
        "sigterm_after_raw_result": "cells/*/*/raw_result.json",
        "sigkill_after_completion": "cells/*/*/completion.json",
        "sigterm_after_first_completion": "cells/*/*/completion.json",
    }
    if fault not in patterns:
        process.kill()
        process.communicate()
        raise SimulationError(f"unknown supervisor fault: {fault}")
    deadline = time.monotonic() + timeout
    observed: Path | None = None
    while time.monotonic() < deadline and process.poll() is None:
        matches = sorted(evidence.glob(patterns[fault])) if evidence.exists() else []
        if matches:
            observed = matches[0]
            break
        time.sleep(0.0005)
    if observed is None:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGKILL)
        stdout, stderr = process.communicate()
        return {
            "args": command[2:], "rc": process.returncode,
            "stdout": stdout.decode("utf-8", "replace"),
            "stderr": stderr.decode("utf-8", "replace"),
            "result": _parse_stdout(stdout), "fault": fault,
            "fault_observed": False,
        }
    sent = signal.SIGTERM if fault.startswith("sigterm") else signal.SIGKILL
    os.kill(process.pid, sent)
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGKILL)
        stdout, stderr = process.communicate()
    return {
        "args": command[2:], "rc": process.returncode,
        "stdout": stdout.decode("utf-8", "replace"),
        "stderr": stderr.decode("utf-8", "replace"),
        "result": _parse_stdout(stdout), "fault": fault,
        "fault_observed": True,
        "observed_path": observed.relative_to(repo).as_posix(),
        "signal": signal.Signals(sent).name,
    }


def _row_files(run_root: Path) -> list[Path]:
    return sorted(run_root.glob("cells/*/*"), key=lambda path: path.as_posix())


def _evidence_summary(repo: Path, run_id: str) -> dict[str, Any]:
    run_root = _sandbox_iteration(repo) / "evidence" / run_id
    _directory(run_root, "controller run root")
    rows = _row_files(run_root)
    identities = {"nonce": [], "task_id": [], "thread_id": [], "turn_id": []}
    poll_counts: list[int] = []
    terminal_statuses: set[str] = set()
    returncodes: set[int] = set()
    output_statuses: set[str] = set()
    stdout_sizes: list[int] = []
    backend_scenarios: set[str] = set()
    pass_count = fail_count = invalid_chain_count = 0
    one_lf = True
    row_records: list[dict[str, Any]] = []
    _, run = _json(run_root / "run.json", "run manifest", True)
    for row in run.get("rows", []):
        if isinstance(row, dict) and isinstance(row.get("nonce"), str):
            identities["nonce"].append(row["nonce"])
    for row_path in rows:
        names = sorted(item.name for item in row_path.iterdir())
        if names != ["attempt.json", "completion.json", "provider_input.txt", "raw_result.json"]:
            invalid_chain_count += 1
            row_records.append({"path": row_path.relative_to(run_root).as_posix(), "files": names})
            continue
        render = _regular(row_path / "provider_input.txt", "provider input")
        one_lf = one_lf and render.endswith(b"\n") and not render.endswith(b"\n\n") and b"\r" not in render
        _, raw = _json(row_path / "raw_result.json", "raw result", True)
        _, completion = _json(row_path / "completion.json", "completion", True)
        result = raw.get("backend_result")
        if not isinstance(result, dict):
            invalid_chain_count += 1
            continue
        for key in ("task_id", "thread_id", "turn_id"):
            if isinstance(result.get(key), str):
                identities[key].append(result[key])
        process = result.get("process")
        if isinstance(process, dict) and isinstance(process.get("poll_count"), int):
            poll_counts.append(process["poll_count"])
        if isinstance(process, dict) and isinstance(process.get("scenario"), str):
            backend_scenarios.add(process["scenario"])
        if isinstance(result.get("terminal_status"), str):
            terminal_statuses.add(result["terminal_status"])
        if isinstance(result.get("returncode"), int) and not isinstance(result.get("returncode"), bool):
            returncodes.add(result["returncode"])
        output = result.get("output_capture")
        if isinstance(output, dict) and isinstance(output.get("status"), str):
            output_statuses.add(output["status"])
        stdout = result.get("stdout_utf8")
        if isinstance(stdout, str):
            stdout_sizes.append(len(stdout.encode("utf-8")))
        status = completion.get("status")
        pass_count += status == "PASS"
        fail_count += status == "FAIL"
    files = {}
    for name in ("run.json", "matrix_terminal.json", "accounting.json"):
        path = run_root / name
        if path.is_file():
            files[name] = _identity(_regular(path, name))
    return {
        "run_id": run_id,
        "row_directory_count": len(rows),
        "pass_count": pass_count,
        "subject_fail_count": fail_count,
        "invalid_chain_count": invalid_chain_count,
        "all_renders_one_lf": one_lf,
        "minimum_poll_count": min(poll_counts) if poll_counts else None,
        "maximum_poll_count": max(poll_counts) if poll_counts else None,
        "backend_observation": {
            "scenarios": sorted(backend_scenarios),
            "terminal_statuses": sorted(terminal_statuses),
            "returncodes": sorted(returncodes),
            "output_statuses": sorted(output_statuses),
            "minimum_stdout_bytes": min(stdout_sizes) if stdout_sizes else None,
            "maximum_stdout_bytes": max(stdout_sizes) if stdout_sizes else None,
        },
        "identities": identities,
        "terminal_files": files,
        "row_inventory_anomalies": row_records,
    }


def _assert_backend_scenario(summary: dict[str, Any], scenario: str) -> None:
    observed = summary["backend_observation"]
    expected: dict[str, tuple[Any, ...]] = {
        "immediate": (("immediate",), ("TASK_COMPLETE",), (0,), ("PRESENT",)),
        "yielded_multi_poll": (("yielded_multi_poll",), ("TASK_COMPLETE",), (0,), ("PRESENT",)),
        "nonzero_exit": (("nonzero_exit",), ("PROCESS_EXIT_NONZERO",), (17,), ("PRESENT",)),
        "missing_output": (("missing_output",), ("TASK_COMPLETE",), (0,), ("MISSING",)),
        "lf_only_output": (("lf_only_output",), ("TASK_COMPLETE",), (0,), ("PRESENT",)),
        "partial_output": (("partial_output",), ("TASK_COMPLETE",), (0,), ("PRESENT",)),
        "malformed_output": (("malformed_output",), ("TASK_COMPLETE",), (0,), ("PRESENT",)),
        "abrupt_stop_before_task_complete": (
            ("abrupt_stop_before_task_complete",), ("PROCESS_EXIT_BEFORE_TASK_COMPLETE",), (-15,), ("MISSING",),
        ),
        "abrupt_stop_after_task_complete": (
            ("abrupt_stop_after_task_complete",), ("TASK_COMPLETE",), (-15,), ("PRESENT",),
        ),
    }
    if scenario not in expected:
        return
    actual = (
        tuple(observed["scenarios"]), tuple(observed["terminal_statuses"]),
        tuple(observed["returncodes"]), tuple(observed["output_statuses"]),
    )
    if actual != expected[scenario]:
        raise SimulationError(f"backend scenario {scenario} observation mismatch: {actual}")
    if scenario == "missing_output" and observed["maximum_stdout_bytes"] != 0:
        raise SimulationError("missing_output preserved nonempty stdout")
    if scenario == "lf_only_output" and (
        observed["minimum_stdout_bytes"], observed["maximum_stdout_bytes"]
    ) != (1, 1):
        raise SimulationError("lf_only_output did not preserve exactly one LF byte")
    if scenario == "malformed_output" and (
        observed["minimum_stdout_bytes"], observed["maximum_stdout_bytes"]
    ) != (18, 18):
        raise SimulationError("malformed_output bytes differ from frozen malformed fixture")


def _assert_invocation(invocation: dict[str, Any], rc: int, status: str) -> None:
    if invocation["rc"] != rc:
        raise SimulationError(f"controller rc {invocation['rc']} != {rc}: {invocation['stdout']}")
    result = invocation.get("result")
    actual = result.get("status") if isinstance(result, dict) else None
    if actual != status:
        raise SimulationError(f"controller status {actual!r} != {status!r}")


def _run_clean(repo: Path, run_id: str, scenario: str = "immediate") -> dict[str, Any]:
    invocation = _invoke(repo, ["simulate", "--run-root", run_id, "--scenario", scenario])
    _assert_invocation(invocation, 0, "PASS")
    summary = _evidence_summary(repo, run_id)
    _assert_backend_scenario(summary, scenario)
    if (
        summary["row_directory_count"], summary["pass_count"],
        summary["subject_fail_count"], summary["invalid_chain_count"],
        summary["all_renders_one_lf"],
    ) != (291, 291, 0, 0, True):
        raise SimulationError(f"clean matrix evidence mismatch: {summary}")
    reopen_a = _invoke(repo, ["reopen", "--run-root", run_id])
    reopen_b = _invoke(repo, ["reopen", "--run-root", run_id])
    _assert_invocation(reopen_a, 0, "PASS")
    _assert_invocation(reopen_b, 0, "PASS")
    if reopen_a.get("result") != reopen_b.get("result"):
        raise SimulationError("repeated reopen reports differ")
    return {
        "result": "PASS", "qualification_credit": 0,
        "controller": invocation, "summary": summary,
        "reopen_a": reopen_a, "reopen_b": reopen_b,
    }


def _run_clean_pair(suite: Path) -> tuple[dict[str, Any], Path]:
    repo, materialization = _materialize(suite, "clean-pair")
    before = _trusted_snapshot()
    first = _run_clean(repo, "synthetic-clean-001")
    middle = _trusted_snapshot()
    second = _run_clean(repo, "synthetic-clean-002")
    after = _trusted_snapshot()
    if before != middle or middle != after:
        raise SimulationError("trusted byte set changed during clean pair")
    sets: dict[str, list[str]] = {key: [] for key in ("nonce", "task_id", "thread_id", "turn_id")}
    for run in (first, second):
        for key in sets:
            sets[key].extend(run["summary"]["identities"][key])
    uniqueness = {}
    for key, values in sets.items():
        uniqueness[key] = {"count": len(values), "unique": len(set(values))}
        if len(values) != 582 or len(set(values)) != 582:
            raise SimulationError(f"clean-pair {key} uniqueness mismatch")
    return ({
        "result": "PASS", "qualification_credit": 0,
        "unchanged_trusted_bytes": True, "materialization": materialization,
        "runs": [first, second], "identity_uniqueness": uniqueness,
    }, repo)


def _history() -> list[dict[str, Any]]:
    _, catalog = _json(CATALOG, "regression catalog")
    result = []
    for family in catalog.get("families", []):
        if not isinstance(family, dict):
            raise SimulationError("regression family is not an object")
        evidence = []
        for ref in family.get("evidence_refs", []):
            path = REPO / ref["path"]
            data = _regular(path, f"predecessor {ref['path']}")
            actual = _identity(data)
            expected = {"sha256": ref.get("sha256"), "bytes": ref.get("bytes")}
            if actual != expected:
                raise SimulationError(f"predecessor evidence drift: {ref['path']}")
            evidence.append({"path": ref["path"], "role": ref.get("role"), **actual})
        result.append({
            "regression_id": family.get("regression_id"),
            "scenario_id": family.get("stabilized_simulator_scenario", {}).get("scenario_id"),
            "predecessor_result": "FAIL",
            "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
            "evidence": evidence,
        })
    return result


def _controller_commands() -> list[str]:
    tree = ast.parse(_regular(CONTROLLER, "controller source").decode("utf-8"), filename=str(CONTROLLER))
    commands = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        if node.func.attr != "add_parser" or not node.args:
            continue
        first = node.args[0]
        if isinstance(first, ast.Constant) and isinstance(first.value, str):
            commands.add(first.value)
    return sorted(commands)


def _candidate_imports() -> list[str]:
    findings = []
    for path in (CONTROLLER, BACKEND, VERIFIER, SIMULATOR):
        source = _regular(path, "Python source").decode("utf-8")
        tree = ast.parse(source, filename=str(path))
        for node in ast.walk(tree):
            names: list[str] = []
            if isinstance(node, ast.Import):
                names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom):
                names = [node.module or ""]
            for name in names:
                if FORBIDDEN_CANDIDATE_IMPORT.search(name):
                    findings.append(f"{path.name}:{getattr(node, 'lineno', 0)}:{name}")
    return findings


def _static_check() -> dict[str, Any]:
    _, contract = _json(CONTRACT, "simulator contract")
    _, faults = _json(FAULTS, "fault scenarios")
    _, catalog = _json(CATALOG, "regression catalog")
    if contract.get("schema_id") != "pw-r9-simulator-contract-v1":
        raise SimulationError("simulator contract schema mismatch")
    if faults.get("schema_id") != "pw-r9-fault-scenarios-v1":
        raise SimulationError("fault scenarios schema mismatch")
    catalog_rows = catalog.get("families")
    scenario_rows = faults.get("scenarios")
    if not isinstance(catalog_rows, list) or not isinstance(scenario_rows, list):
        raise SimulationError("catalog/scenario row list absent")
    catalog_map = {
        row["regression_id"]: row["stabilized_simulator_scenario"]["scenario_id"]
        for row in catalog_rows
    }
    scenario_map = {row["regression_id"]: row["scenario_id"] for row in scenario_rows}
    if len(scenario_map) != len(scenario_rows) or scenario_map != catalog_map:
        raise SimulationError("normalized regression/scenario coverage mismatch")
    required_faults = set(contract.get("required_faults", []))
    declared_faults: set[str] = set()
    for row in scenario_rows + faults.get("global_fault_cases", []):
        for variant in row.get("variants", [row]):
            declared_faults.update(variant.get("fault_labels", []))
            declared_faults.update(variant.get("requires_fault_labels", []))
    missing_faults = sorted(required_faults - declared_faults)
    if missing_faults:
        raise SimulationError(f"required fault labels missing: {missing_faults}")
    commands = _controller_commands()
    expected_commands = sorted(contract["controller_public_surface"])
    if commands != expected_commands:
        raise SimulationError(f"controller command surface drift: {commands}")
    imports = _candidate_imports()
    if imports:
        raise SimulationError(f"forbidden candidate runtime imports: {imports}")
    history = _history()
    return {
        "schema_id": "pw-r9-simulator-check-v1", "status": "PASS",
        "qualification_credit": 0,
        "calls": {"subject": 0, "provider": 0, "network": 0, "controller": 0},
        "regression_count": len(catalog_map),
        "scenario_count": len(scenario_map),
        "fault_label_count": len(declared_faults),
        "controller_commands": commands,
        "candidate_v12_v21_runtime_imports": imports,
        "trusted_byte_set": _trusted_snapshot(),
        "historical_predecessors": history,
    }


def _mutate_storage(path: Path, storage: bytes, label: str) -> dict[str, Any]:
    before = _regular(path, f"{label} before")
    if before == storage:
        raise SimulationError(f"{label}: mutation made no change")
    fd = os.open(path, os.O_WRONLY | os.O_TRUNC)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError(f"{label}: short mutation write")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _sync_dir(path.parent)
    after = _regular(path, f"{label} after")
    return {"path": path.as_posix(), "before": _identity(before), "after": _identity(after)}


def _mutate_json(path: Path, change: Callable[[dict[str, Any]], None], label: str) -> dict[str, Any]:
    _, value = _json(path, label, True)
    change(value)
    return _mutate_storage(path, _canon(value) + b"\n", label)


def _first_rows(repo: Path, run_id: str, count: int = 2) -> list[Path]:
    rows = _row_files(_sandbox_iteration(repo) / "evidence" / run_id)
    if len(rows) < count:
        raise SimulationError(f"need {count} completed rows, found {len(rows)}")
    return rows[:count]


def _rebind_identity_collision(repo: Path, run_id: str, rows: list[Path]) -> list[dict[str, Any]]:
    """Create a hash-consistent copied chain whose only defect is identity reuse."""
    run_root = _sandbox_iteration(repo) / "evidence" / run_id
    first_raw = rows[0] / "raw_result.json"
    second_raw = rows[1] / "raw_result.json"
    _, first = _json(first_raw, "first raw", True)
    first_result = first.get("backend_result")
    if not isinstance(first_result, dict):
        raise SimulationError("first backend result absent")
    receipts: list[dict[str, Any]] = []

    def collide(value: dict[str, Any]) -> None:
        result = value.get("backend_result")
        if not isinstance(result, dict):
            raise SimulationError("second backend result absent")
        for key in ("task_id", "thread_id", "turn_id"):
            result[key] = first_result[key]
        process = result.get("process")
        rollout = result.get("rollout")
        if isinstance(process, dict) and isinstance(process.get("task_terminal"), dict):
            process["task_terminal"]["turn_id"] = first_result["turn_id"]
        if isinstance(rollout, dict):
            for event_name in ("task_started", "task_complete"):
                event = rollout.get(event_name)
                if isinstance(event, dict):
                    event["turn_id"] = first_result["turn_id"]

    receipts.append(_mutate_json(second_raw, collide, "identity collision raw"))
    raw_storage = _regular(second_raw, "collided raw")
    second_completion = rows[1] / "completion.json"

    def completion_change(value: dict[str, Any]) -> None:
        for key in ("task_id", "thread_id", "turn_id"):
            value[key] = first_result[key]
        value["raw_result_sha256"] = _sha(raw_storage)
        value["raw_result_bytes"] = len(raw_storage)

    receipts.append(_mutate_json(second_completion, completion_change, "identity collision completion"))
    _, run = _json(run_root / "run.json", "identity collision run", True)
    run_rows = run.get("rows")
    if not isinstance(run_rows, list):
        raise SimulationError("identity collision run rows absent")
    row_by_path = {
        (row["slot"], f"{row['index']:03d}_{row['cell']}"): row
        for row in run_rows if isinstance(row, dict)
    }
    affected_slot = row_by_path[(rows[1].parent.name, rows[1].name)]["slot"]
    completed: list[dict[str, Any]] = []
    for row_path in _row_files(run_root):
        row = row_by_path[(row_path.parent.name, row_path.name)]
        completion_storage, completion = _json(row_path / "completion.json", "completion inventory", True)
        completed.append({
            "ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
            "index": row["index"], "status": completion["status"], "nonce": row["nonce"],
            "task_id": completion["task_id"], "thread_id": completion["thread_id"],
            "turn_id": completion["turn_id"], "completion_sha256": _sha(completion_storage),
            "completion_bytes": len(completion_storage),
        })
    completed.sort(key=lambda item: item["ordinal"])
    slot_complete = [item for item in completed if item["slot"] == affected_slot]
    path_terminal = run_root / "terminals" / f"{affected_slot}.json"

    def path_change(value: dict[str, Any]) -> None:
        inventory = _canon(slot_complete)
        value["completion_inventory_sha256"] = _sha(inventory)
        value["completion_inventory_bytes"] = len(inventory)

    receipts.append(_mutate_json(path_terminal, path_change, "identity collision path terminal"))
    path_storage = _regular(path_terminal, "collided path terminal")
    matrix_path = run_root / "matrix_terminal.json"

    def matrix_change(value: dict[str, Any]) -> None:
        refs = value.get("path_terminals")
        if not isinstance(refs, list):
            raise SimulationError("matrix path refs absent")
        for ref in refs:
            if isinstance(ref, dict) and ref.get("slot") == affected_slot:
                ref["sha256"] = _sha(path_storage)
                ref["bytes"] = len(path_storage)

    receipts.append(_mutate_json(matrix_path, matrix_change, "identity collision matrix terminal"))
    matrix_storage = _regular(matrix_path, "collided matrix terminal")
    accounting_path = run_root / "accounting.json"

    def accounting_change(value: dict[str, Any]) -> None:
        value["matrix_terminal_sha256"] = _sha(matrix_storage)
        value["matrix_terminal_bytes"] = len(matrix_storage)

    receipts.append(_mutate_json(accounting_path, accounting_change, "identity collision accounting"))
    return receipts


def _tamper_evidence(repo: Path, run_id: str, tamper: str) -> list[dict[str, Any]]:
    run_root = _sandbox_iteration(repo) / "evidence" / run_id
    rows = _first_rows(repo, run_id)
    receipts: list[dict[str, Any]] = []
    if tamper == "create_wrong_render_directory_member":
        wrong = run_root / "renders"
        _mkdir(wrong)
        receipts.append({"path": wrong.relative_to(repo).as_posix(), "created_kind": "directory"})
    elif tamper == "append_lf_to_render":
        path = rows[0] / "provider_input.txt"
        receipts.append(_mutate_storage(path, _regular(path, "render") + b"\n", tamper))
    elif tamper == "change_render_byte":
        path = rows[0] / "provider_input.txt"
        data = _regular(path, "render")
        receipts.append(_mutate_storage(path, bytes([data[0] ^ 1]) + data[1:], tamper))
    elif tamper in {"change_raw_result_byte", "change_raw_result_schema"}:
        path = rows[0] / "raw_result.json"
        receipts.append(_mutate_json(
            path, lambda value: value.__setitem__("schema_id", "pw-r9-raw-result-tampered"), tamper,
        ))
    elif tamper == "change_embedded_score":
        path = rows[0] / "completion.json"
        def change(value: dict[str, Any]) -> None:
            score = value.get("score")
            if not isinstance(score, dict):
                raise SimulationError("completion score absent")
            score["actual_bytes"] = int(score.get("actual_bytes", 0)) + 1
        receipts.append(_mutate_json(path, change, tamper))
    elif tamper == "plant_future_attempt":
        future = run_root / "cells" / "slot-alpha" / "999_future"
        _mkdir(future)
        receipts.append({"path": (future / "attempt.json").relative_to(repo).as_posix(), **_write_json(
            future / "attempt.json", {"schema_id": "pw-r9-illegal-future-attempt-v1"},
        )})
    elif tamper == "plant_future_completion":
        future = run_root / "cells" / "slot-alpha" / "999_future"
        _mkdir(future)
        receipts.append({"path": (future / "completion.json").relative_to(repo).as_posix(), **_write_json(
            future / "completion.json", {"schema_id": "pw-r9-illegal-future-completion-v1"},
        )})
    elif tamper == "change_matrix_terminal_byte":
        path = run_root / "matrix_terminal.json"
        receipts.append(_mutate_json(
            path, lambda value: value.__setitem__("pass_rows", int(value.get("pass_rows", 0)) - 1), tamper,
        ))
    elif tamper == "change_accounting_count":
        path = run_root / "accounting.json"
        receipts.append(_mutate_json(
            path, lambda value: value.__setitem__("valid_completions", int(value.get("valid_completions", 0)) - 1), tamper,
        ))
    elif tamper == "duplicate_run_nonce":
        path = run_root / "run.json"
        def duplicate(value: dict[str, Any]) -> None:
            rows_value = value.get("rows")
            if not isinstance(rows_value, list) or len(rows_value) < 2:
                raise SimulationError("run rows absent")
            rows_value[1]["nonce"] = rows_value[0]["nonce"]
        receipts.append(_mutate_json(path, duplicate, tamper))
    elif tamper == "reuse_prior_backend_identities":
        receipts.extend(_rebind_identity_collision(repo, run_id, rows))
    else:
        raise SimulationError(f"unsupported evidence tamper: {tamper}")
    for receipt in receipts:
        text = receipt.get("path")
        if isinstance(text, str):
            path = Path(text)
            if path.is_absolute():
                receipt["path"] = path.relative_to(repo).as_posix()
    return receipts


def _control_inventory(repo: Path) -> dict[str, Any]:
    expected = {path.relative_to(REPO).as_posix() for path in _source_inventory()}
    actual = set()
    for current, dirs, files in os.walk(repo):
        dirs[:] = sorted(name for name in dirs if name != "evidence")
        for filename in sorted(files):
            path = Path(current) / filename
            actual.add(path.relative_to(repo).as_posix())
    return {"missing": sorted(expected - actual), "extra": sorted(actual - expected)}


def _run_variant(
    suite: Path, template_repo: Path, scenario: dict[str, Any], variant: dict[str, Any], sequence: int,
) -> dict[str, Any]:
    regression_id = scenario.get("regression_id")
    scenario_id = scenario.get("scenario_id")
    variant_id = variant.get("variant_id")
    name = f"fault-{sequence:03d}-{regression_id.lower()}-{variant_id}"[:127]
    strategy = scenario.get("strategy")
    tamper = variant.get("tamper")
    record: dict[str, Any] = {
        "regression_id": regression_id, "scenario_id": scenario_id,
        "variant_id": variant_id, "strategy": strategy,
        "predecessor_result": "FAIL",
        "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
        "current_credit": "SIMULATION_ONLY_ZERO_EMPIRICAL_OR_QUALIFICATION_CREDIT",
    }
    if tamper is None and strategy == "evidence_fault_then_reopen":
        repo, materialization = _materialize(suite, name)
        clean = _run_clean(repo, "fault-run", variant.get("backend_scenario", "immediate"))
        record.update(current_result="PASS", materialization=materialization, clean=clean)
        return record
    if strategy in {"evidence_fault_then_reopen", "materialized_run_tamper"} or tamper in {
        "change_raw_result_schema", "reuse_prior_backend_identities",
    }:
        repo = _clone_sandbox(suite, template_repo, name)
        changes = _tamper_evidence(repo, "baseline", tamper)
        invocation = _invoke(repo, ["reopen", "--run-root", "baseline"])
        if invocation["rc"] != int(variant.get("expect", {}).get("rc", 2)):
            raise SimulationError(f"{scenario_id}/{variant_id}: tamper reopen did not fail closed")
        record.update(current_result="PASS", tamper_receipt=changes, controller=invocation)
        return record
    if strategy in {"materialized_control_tamper", "control_constructibility"} and tamper:
        repo, materialization = _materialize(suite, name, tamper)
        inventory = _control_inventory(repo)
        if tamper == "add_undeclared_control_member":
            if not inventory["extra"]:
                raise SimulationError("extra control member not detected")
            invocation = None
        elif tamper in {"omit_declared_semantic_source", "declared_source_as_directory"}:
            invocation = _invoke(repo, ["simulate", "--check-only"])
            if invocation["rc"] != 2:
                raise SimulationError(f"{tamper}: controller did not reject")
        else:
            invocation = _invoke(repo, ["simulate", "--check-only"])
            if invocation["rc"] != 2:
                raise SimulationError(f"{tamper}: controller did not reject")
        record.update(current_result="PASS", materialization=materialization,
                      inventory=inventory, controller=invocation)
        return record
    if variant.get("supervisor_fault"):
        repo, materialization = _materialize(suite, name)
        run_id = "fault-run"
        invocation = _supervised(repo, run_id, variant.get("backend_scenario", "immediate"), variant["supervisor_fault"])
        if not invocation.get("fault_observed"):
            raise SimulationError(f"{scenario_id}/{variant_id}: supervisor stage not observed")
        reopen = _invoke(repo, ["reopen", "--run-root", run_id])
        if reopen["rc"] != 2:
            raise SimulationError(f"{scenario_id}/{variant_id}: crash reopen did not fail closed")
        run_root = _sandbox_iteration(repo) / "evidence" / run_id
        counts = {
            "attempts": len(list(run_root.glob("cells/*/*/attempt.json"))),
            "raw_results": len(list(run_root.glob("cells/*/*/raw_result.json"))),
            "completions": len(list(run_root.glob("cells/*/*/completion.json"))),
        }
        expected = variant.get("expect", {})
        wanted_completions = expected.get("completion_count", expected.get("completed_rows"))
        if isinstance(wanted_completions, int) and counts["completions"] != wanted_completions:
            raise SimulationError(
                f"{scenario_id}/{variant_id}: completions {counts['completions']} != {wanted_completions}"
            )
        wanted_attempts = expected.get("attempt_count")
        if isinstance(wanted_attempts, int) and counts["attempts"] != wanted_attempts:
            raise SimulationError(
                f"{scenario_id}/{variant_id}: attempts {counts['attempts']} != {wanted_attempts}"
            )
        record.update(current_result="PASS", materialization=materialization,
                      controller=invocation, reopen=reopen, evidence_counts=counts)
        return record
    if scenario_id == "durable-attempt-once-only" and variant_id == "same-root-reinvoke":
        repo, materialization = _materialize(suite, name)
        first = _run_clean(repo, "fault-run", variant.get("backend_scenario", "immediate"))
        before = _evidence_summary(repo, "fault-run")
        second = _invoke(repo, [
            "simulate", "--run-root", "fault-run", "--scenario",
            variant.get("backend_scenario", "immediate"),
        ])
        after = _evidence_summary(repo, "fault-run")
        if second["rc"] != variant.get("expect", {}).get("second_rc", 2):
            raise SimulationError("same-root reinvocation did not reject")
        if before != after:
            raise SimulationError("same-root reinvocation changed evidence")
        record.update(current_result="PASS", materialization=materialization,
                      first=first, second=second, evidence_unchanged=True)
        return record
    if strategy in {"controller_synthetic", "controller_synthetic_lifecycle_fault"}:
        repo, materialization = _materialize(suite, name)
        backend_scenario = variant.get("backend_scenario", "immediate")
        invocation = _invoke(repo, ["simulate", "--run-root", "fault-run", "--scenario", backend_scenario])
        expected = variant.get("expect", {})
        if invocation["rc"] != expected.get("rc"):
            raise SimulationError(
                f"{scenario_id}/{variant_id}: rc {invocation['rc']} != {expected.get('rc')}"
            )
        actual_status = invocation.get("result", {}).get("status") if isinstance(invocation.get("result"), dict) else None
        if actual_status != expected.get("status"):
            raise SimulationError(
                f"{scenario_id}/{variant_id}: status {actual_status} != {expected.get('status')}"
            )
        summary = _evidence_summary(repo, "fault-run")
        _assert_backend_scenario(summary, backend_scenario)
        wanted_rows = expected.get("rows")
        if isinstance(wanted_rows, int) and summary["row_directory_count"] != wanted_rows:
            raise SimulationError(
                f"{scenario_id}/{variant_id}: rows {summary['row_directory_count']} != {wanted_rows}"
            )
        if expected.get("status") == "VALID_SUBJECT_FAIL" and summary["subject_fail_count"] != summary["row_directory_count"]:
            raise SimulationError(f"{scenario_id}/{variant_id}: not every completed row is a typed subject FAIL")
        minimum = expected.get("minimum_poll_count")
        if isinstance(minimum, int) and (summary["minimum_poll_count"] or 0) < minimum:
            raise SimulationError(f"{scenario_id}/{variant_id}: poll count below {minimum}")
        record.update(current_result="PASS", materialization=materialization,
                      controller=invocation, summary=summary)
        return record
    if strategy in {
        "static_cli_surface", "static_data_boundary", "static_history_and_import_boundary",
        "static_and_materialized_closure", "control_constructibility",
    }:
        check = _static_check()
        if strategy == "static_data_boundary":
            repo, materialization = _materialize(suite, name)
            invocation = _invoke(repo, ["simulate", "--check-only"])
            _assert_invocation(invocation, 0, "PASS")
            record.update(materialization=materialization, controller=invocation)
        if strategy == "control_constructibility":
            repo, materialization = _materialize(suite, name)
            invocation = _invoke(repo, ["simulate", "--check-only"])
            _assert_invocation(invocation, 0, "PASS")
            record.update(materialization=materialization, controller=invocation)
        record.update(current_result="PASS", static_check={
            "controller_commands": check["controller_commands"],
            "candidate_v12_v21_runtime_imports": check["candidate_v12_v21_runtime_imports"],
        })
        return record
    if strategy == "coverage_meta_assertion":
        record.update(current_result="DEFERRED_META")
        return record
    raise SimulationError(f"unsupported strategy: {strategy}")


def _global_case(suite: Path, template_repo: Path, case: dict[str, Any], sequence: int) -> dict[str, Any]:
    case_id = case.get("case_id")
    name = f"global-{sequence:03d}-{str(case_id).lower()}"[:127]
    strategy = case.get("strategy")
    record: dict[str, Any] = {
        "case_id": case_id, "strategy": strategy,
        "qualification_credit": 0,
    }
    if strategy == "repeat_public_reopen":
        first = _invoke(template_repo, ["reopen", "--run-root", "baseline"])
        second = _invoke(template_repo, ["reopen", "--run-root", "baseline"])
        _assert_invocation(first, 0, "PASS")
        _assert_invocation(second, 0, "PASS")
        if first.get("result") != second.get("result"):
            raise SimulationError("global repeated reopen differs")
        record.update(current_result="PASS", first=first, second=second)
        return record
    if strategy in {"evidence_fault_then_reopen", "materialized_run_tamper"}:
        repo = _clone_sandbox(suite, template_repo, name)
        changes = _tamper_evidence(repo, "baseline", case["tamper"])
        invocation = _invoke(repo, ["reopen", "--run-root", "baseline"])
        if invocation["rc"] != case.get("expect", {}).get("rc", 2):
            raise SimulationError(f"{case_id}: tamper reopen did not fail closed")
        record.update(current_result="PASS", tamper_receipt=changes, controller=invocation)
        return record
    if strategy == "controller_synthetic":
        repo, materialization = _materialize(suite, name)
        invocation = _invoke(repo, [
            "simulate", "--run-root", "fault-run", "--scenario", case.get("backend_scenario", "immediate"),
        ])
        expected = case.get("expect", {})
        if invocation["rc"] != expected.get("rc"):
            raise SimulationError(f"{case_id}: unexpected controller rc")
        actual_status = invocation.get("result", {}).get("status") if isinstance(invocation.get("result"), dict) else None
        if actual_status != expected.get("status"):
            raise SimulationError(f"{case_id}: unexpected controller status {actual_status}")
        summary = _evidence_summary(repo, "fault-run")
        _assert_backend_scenario(summary, case.get("backend_scenario", "immediate"))
        record.update(current_result="PASS", materialization=materialization,
                      controller=invocation, summary=summary)
        return record
    raise SimulationError(f"unsupported global strategy: {strategy}")


def _run_regressions(suite: Path) -> dict[str, Any]:
    _, faults = _json(FAULTS, "fault scenarios")
    template_repo, template_materialization = _materialize(suite, "fault-template")
    baseline = _run_clean(template_repo, "baseline")
    records: list[dict[str, Any]] = []
    sequence = 0
    for scenario in faults.get("scenarios", []):
        for variant in scenario.get("variants", []):
            sequence += 1
            try:
                records.append(_run_variant(suite, template_repo, scenario, variant, sequence))
            except Exception as exc:
                records.append({
                    "regression_id": scenario.get("regression_id"),
                    "scenario_id": scenario.get("scenario_id"),
                    "variant_id": variant.get("variant_id"),
                    "predecessor_result": "FAIL",
                    "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
                    "current_result": "FAIL", "error_type": type(exc).__name__,
                    "error": str(exc),
                    "current_credit": "SIMULATION_ONLY_ZERO_EMPIRICAL_OR_QUALIFICATION_CREDIT",
                })
    globals_: list[dict[str, Any]] = []
    for case in faults.get("global_fault_cases", []):
        sequence += 1
        try:
            globals_.append(_global_case(suite, template_repo, case, sequence))
        except Exception as exc:
            globals_.append({
                "case_id": case.get("case_id"), "current_result": "FAIL",
                "error_type": type(exc).__name__, "error": str(exc),
                "qualification_credit": 0,
            })
    dependency_passes = all(
        row.get("current_result") == "PASS"
        for row in records if row.get("scenario_id") != "complete-live-recovery-suite"
    ) and all(row.get("current_result") == "PASS" for row in globals_)
    for row in records:
        if row.get("scenario_id") == "complete-live-recovery-suite":
            row["current_result"] = "PASS" if dependency_passes else "FAIL"
            row["dependency_variants_pass"] = dependency_passes
    status = "PASS" if all(row.get("current_result") == "PASS" for row in records + globals_) else "FAIL"
    return {
        "result": status, "qualification_credit": 0,
        "template_materialization": template_materialization,
        "baseline": baseline, "scenarios": records, "global_cases": globals_,
    }


def _receipt(suite: Path, command: str, before: dict[str, Any], clean: dict[str, Any] | None,
             regressions: dict[str, Any] | None, error: Exception | None) -> dict[str, Any]:
    after = _trusted_snapshot()
    status = "PASS"
    if error is not None or before != after:
        status = "FAIL"
    if clean is not None and clean.get("result") != "PASS":
        status = "FAIL"
    if regressions is not None and regressions.get("result") != "PASS":
        status = "FAIL"
    return {
        "schema_id": "pw-r9-simulator-suite-receipt-v1",
        "status": status,
        "command": command,
        "qualification_credit": 0,
        "calls": {"subject": 0, "provider": 0, "network": 0},
        "trusted_byte_set_before": before,
        "trusted_byte_set_after": after,
        "trusted_bytes_unchanged": before == after,
        "clean_pair": clean,
        "regressions": regressions,
        "historical_predecessors": _history(),
        "stabilization_exit": {
            "status": "FAIL",
            "open_blockers": [{
                "blocker_id": "OPEN_PIPELINE_BLOCKER_NO_CAUSAL_STAGE_FINALIZER_EXECUTION",
                "meaning": (
                    "Iteration 001 does not execute the causal stage/finalizer pipeline; "
                    "synthetic traversal and offline reopen cannot close this blocker."
                ),
            }],
        },
        "error": None if error is None else {"type": type(error).__name__, "message": str(error)},
        "residual_risks": [
            "malicious trusted-controller fabrication", "host or OS compromise",
            "arbitrary in-process Python callers invoking private helpers", "capability tokens",
            "recursive or self-hosting verifier authority", "callback confinement",
            "reflection resistance", "production FileSafe or read-isolation proof",
        ],
        "nonclaims": [
            "Synthetic runs earn zero empirical or qualification credit.",
            "This receipt is not candidate, freeze, canary, qualification, readiness, or release evidence.",
        ],
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="R9 zero-provider deterministic simulator")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("check", help="zero-write static contract/history/import check")
    for name, help_text in (
        ("run-clean-pair", "two clean synthetic 291-row matrices on unchanged bytes"),
        ("run-regressions", "all normalized regression and global fault cases"),
        ("self-test", "clean pair plus all normalized regression and global fault cases"),
    ):
        command = commands.add_parser(name, help=help_text)
        command.add_argument("--run-root", required=True, help=f"new direct child of {RUNS}")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        check = _static_check()
        if args.command == "check":
            sys.stdout.buffer.write(_canon(check) + b"\n")
            return 0
        suite = _suite_root(args.run_root)
        before = _trusted_snapshot()
        clean = regressions = None
        error: Exception | None = None
        try:
            if args.command in {"run-clean-pair", "self-test"}:
                clean, _ = _run_clean_pair(suite)
            if args.command in {"run-regressions", "self-test"}:
                regressions = _run_regressions(suite)
        except Exception as exc:
            error = exc
        receipt = _receipt(suite, args.command, before, clean, regressions, error)
        _write_json(suite / "simulator_receipt.json", receipt)
        sys.stdout.buffer.write(_canon(receipt) + b"\n")
        return 0 if receipt["status"] == "PASS" else 2
    except Exception as exc:
        result = {
            "schema_id": "pw-r9-simulator-error-v1", "status": "FAIL",
            "qualification_credit": 0,
            "calls": {"subject": 0, "provider": 0, "network": 0},
            "error_type": type(exc).__name__, "error": str(exc),
        }
        sys.stdout.buffer.write(_canon(result) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
