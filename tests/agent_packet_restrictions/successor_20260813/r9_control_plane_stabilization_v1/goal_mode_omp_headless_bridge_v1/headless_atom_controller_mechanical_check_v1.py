#!/usr/bin/env python3
"""Data-only mechanical checks for the one-atom headless OMP controller."""

from __future__ import annotations

import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import queue
import stat
import sys
import tempfile
import time
from types import ModuleType
from typing import Any, Callable


BASE = Path(__file__).resolve().parent
CONTROLLER = BASE / "headless_atom_controller_v1.py"
CONTROLLER_SHA256 = "6113abc67757e48df563d21aad7c93d2377e2bff6bfd125084ac22ae363ca3ee"
CONTROLLER_BYTES = 41_303
EXECUTABLE = BASE / "staged_windows_build_v4_reproducible" / "omp-windows-x64.exe"
SCHEMA_ID = "pw-r9-goal-mode-omp-headless-atom-controller-mechanical-check-v1"


class CheckFailure(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise CheckFailure(message)


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def read_regular(path: Path, limit: int) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe file:{path}")
    require(0 <= before.st_size <= limit, f"file size:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns),
        f"changing file:{path}",
    )
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load_controller() -> tuple[ModuleType, bytes]:
    raw = read_regular(CONTROLLER, 2_000_000)
    require(len(raw) == CONTROLLER_BYTES and digest(raw) == CONTROLLER_SHA256, "controller identity")
    require(f"{stat.S_IMODE(os.stat(CONTROLLER).st_mode):04o}" == "0644", "controller mode")
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("pw_r9_headless_atom_controller_v1", CONTROLLER)
    require(spec is not None and spec.loader is not None, "controller import spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module, raw


def expect_invalid(module: ModuleType, operation: Callable[[], Any], label: str) -> None:
    try:
        operation()
    except module.Invalid:
        return
    raise CheckFailure(f"accepted invalid case:{label}")


def reference(module: ModuleType, path: Path) -> dict[str, Any]:
    raw = read_regular(path, 512_000_000)
    return {"bytes": len(raw), "path": str(path), "sha256": module.digest(raw)}


def text_identity(module: ModuleType, value: str) -> tuple[int, str]:
    raw = value.encode("utf-8")
    return len(raw), module.digest(raw)


def static_checks(module: ModuleType, source: bytes) -> list[str]:
    tree = ast.parse(source.decode("utf-8"))
    calls = [node for node in ast.walk(tree) if isinstance(node, ast.Call)]
    popen = [node for node in calls if isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(len(popen) == 1, "Popen site count")
    request_args: list[str] = []
    for node in calls:
        if not (isinstance(node.func, ast.Attribute) and node.func.attr == "request" and node.args):
            continue
        first = node.args[0]
        if isinstance(first, ast.Constant) and isinstance(first.value, str):
            request_args.append(first.value)
        elif isinstance(first, ast.Name):
            request_args.append(first.id)
        else:
            raise CheckFailure("dynamic RPC method")
    expected = {
        "ACTIVATE_METHOD": 1,
        "SETTLE_METHOD": 1,
        "initialize": 1,
        "session/close": 1,
        "session/new": 1,
        "session/prompt": 1,
        "session/set_config_option": 2,
    }
    observed = {value: request_args.count(value) for value in sorted(set(request_args))}
    require(observed == expected, "RPC call-site grammar")
    require(all(value not in request_args for value in ("session/load", "session/resume", "session/fork")), "session reuse RPC")
    result = module.check()
    require(result["status"] == "PASS_STATIC_CONTROLLER_CHECK_ZERO_CREDIT_NO_LAUNCH", "embedded check status")
    require(result["authority"]["omp_process_launch"] is False and result["authority"]["qualification_credit"] == 0, "embedded check authority")
    return ["controller_identity", "controller_mode", "ast_rpc_grammar", "embedded_static_check"]


def admission_fixture(module: ModuleType, root: Path) -> tuple[dict[str, Any], Path, dict[str, Any], dict[str, Any]]:
    objective = "Verify one atomic fact."
    subject = "Return only PASS, then mark the active Goal complete."
    evidence = '{"fact":true}'
    criterion = "PASS only if fact is true."
    output_contract = '"PASS"'
    expected_output = "PASS"
    objective_bytes, objective_sha = text_identity(module, objective)
    subject_bytes, subject_sha = text_identity(module, subject)
    evidence_bytes, evidence_sha = text_identity(module, evidence)
    expected_bytes, expected_sha = text_identity(module, expected_output)
    atom = {
        "acceptance_criterion": criterion,
        "atom_count": 1,
        "atom_id": "mechanical:atom-000",
        "evidence_slice_utf8": evidence,
        "evidence_slice_utf8_bytes": evidence_bytes,
        "evidence_slice_utf8_sha256": evidence_sha,
        "expected_output_schema": output_contract,
        "expected_output_utf8": expected_output,
        "expected_output_utf8_bytes": expected_bytes,
        "expected_output_utf8_sha256": expected_sha,
        "goal_objective_utf8": objective,
        "goal_objective_utf8_bytes": objective_bytes,
        "goal_objective_utf8_sha256": objective_sha,
        "prompt_utf8": subject,
        "prompt_utf8_bytes": subject_bytes,
        "prompt_utf8_sha256": subject_sha,
    }
    manifest_path = root / "manifest.json"
    manifest_path.write_bytes(module.canon({"atoms": [atom]}))
    control = {
        "atom_id": atom["atom_id"],
        "expected_output_utf8": expected_output,
        "expected_output_utf8_bytes": expected_bytes,
        "expected_output_utf8_sha256": expected_sha,
        "model_config_value": "provider/model",
        "row_id": "row-000",
        "schema_id": module.CONTROL_SCHEMA,
        "thinking_config_value": "medium",
    }
    control_path = root / "control.json"
    control_path.write_bytes(module.canon(control))
    quiescence = {
        "authority": {"headless_omp_launch": False},
        "observed_at_unix_ns": time.time_ns(),
        "owner": {"controlling_task_id": module.OWNER_TASK, "host_id": module.OWNER_HOST},
        "schema_id": module.QUIESCENCE_SCHEMA,
        "state": {"lock_held": False, "original_pid": 14520, "pid_live": False},
        "status": "QUIESCENT_ORIGINAL_WINDOWS_OMP_PID_ABSENT_LOCK_UNHELD",
    }
    quiescence_path = root / "quiescence.json"
    quiescence_path.write_bytes(module.canon(quiescence))
    admission = {
        "atom": {"atom_id": atom["atom_id"], "row_id": "row-000"},
        "authority": module.EXPECTED_AUTHORITY,
        "bindings": {
            "contract": reference(module, module.CONTRACT_PATH),
            "control": reference(module, control_path),
            "executable": reference(module, EXECUTABLE),
            "manifest": reference(module, manifest_path),
            "quiescence": reference(module, quiescence_path),
        },
        "capture": {"root": str(root / "capture")},
        "launch": {
            "argv": ["omp", "--cwd", "P:\\", "acp"],
            "cwd": "P:\\",
            "environment": {"PW_R9_OMP_GOAL_BRIDGE_V2": "1"},
            "timeout_seconds": 60,
        },
        "owner": {"controlling_task_id": module.OWNER_TASK, "host_id": module.OWNER_HOST},
        "qualification": module.EXPECTED_QUALIFICATION,
        "route": {"model_config_value": "provider/model", "thinking_config_value": "medium"},
        "schema_id": module.ADMISSION_SCHEMA,
        "status": module.ADMISSION_STATUS,
    }
    admission_path = root / "admission.json"
    admission_path.write_bytes(module.canon(admission))
    return admission, admission_path, atom, control


def lifecycle_fixture(module: ModuleType, atom: dict[str, Any], control: dict[str, Any], manifest_path: Path, control_path: Path) -> list[str]:
    objective = atom["goal_objective_utf8"]
    criterion = atom["acceptance_criterion"]
    output_contract = atom["expected_output_schema"]
    params = {
        "acceptanceCriterionUtf8": criterion,
        "acceptanceCriterionUtf8Bytes": len(criterion.encode("utf-8")),
        "acceptanceCriterionUtf8Sha256": module.digest(criterion.encode("utf-8")),
        "atomId": atom["atom_id"],
        "atomManifestSha256": module.digest(manifest_path.read_bytes()),
        "controlSha256": module.digest(control_path.read_bytes()),
        "goalObjectiveUtf8": objective,
        "goalObjectiveUtf8Bytes": atom["goal_objective_utf8_bytes"],
        "goalObjectiveUtf8Sha256": atom["goal_objective_utf8_sha256"],
        "outputContractUtf8": output_contract,
        "outputContractUtf8Bytes": len(output_contract.encode("utf-8")),
        "outputContractUtf8Sha256": module.digest(output_contract.encode("utf-8")),
        "rowId": "row-000",
        "sessionId": "session-1",
        "subjectUtf8Bytes": atom["prompt_utf8_bytes"],
        "subjectUtf8Sha256": atom["prompt_utf8_sha256"],
    }
    goal = {"id": "goal-1", "objective": objective, "status": "active", "timeUsedSeconds": 0, "tokenBudget": None, "tokensUsed": 0}
    activation = {
        "acceptanceCriterion": criterion,
        "acceptanceCriterionBytes": params["acceptanceCriterionUtf8Bytes"],
        "acceptanceCriterionSha256": params["acceptanceCriterionUtf8Sha256"],
        "activation": {"activeTools": ["goal"], "entryId": "entry-1", "nativeMode": "goal"},
        "atomId": atom["atom_id"],
        "atomManifestSha256": params["atomManifestSha256"],
        "baseline": {"goal": None, "messageCount": 0, "phase": "FRESH"},
        "controlSha256": params["controlSha256"],
        "goal": goal,
        "objective": objective,
        "objectiveBytes": params["goalObjectiveUtf8Bytes"],
        "objectiveSha256": params["goalObjectiveUtf8Sha256"],
        "outputContract": output_contract,
        "outputContractBytes": params["outputContractUtf8Bytes"],
        "outputContractSha256": params["outputContractUtf8Sha256"],
        "phase": "ACTIVE",
        "rowId": "row-000",
        "schemaId": module.ACTIVATION_SCHEMA,
        "sessionId": "session-1",
        "subjectUtf8Bytes": params["subjectUtf8Bytes"],
        "subjectUtf8Sha256": params["subjectUtf8Sha256"],
    }
    module.validate_activation(activation, params)
    completed_goal = dict(goal, status="complete", timeUsedSeconds=1, tokensUsed=10)
    completed_data = {"objective": objective, "timeUsedSeconds": 1, "tokenBudget": None, "tokensUsed": 10}
    terminal = {
        key: activation[key]
        for key in (
            "acceptanceCriterion",
            "acceptanceCriterionBytes",
            "acceptanceCriterionSha256",
            "atomId",
            "atomManifestSha256",
            "controlSha256",
            "outputContract",
            "outputContractBytes",
            "outputContractSha256",
            "rowId",
            "subjectUtf8Bytes",
            "subjectUtf8Sha256",
        )
    }
    terminal.update(
        {
            "goal": completed_goal,
            "goalCompletedRecord": {"data": completed_data, "entryId": "entry-3", "type": "goal-completed"},
            "modeChange": {"entryId": "entry-2", "mode": "none"},
            "phase": "SETTLED",
            "schemaId": module.TERMINAL_SCHEMA,
            "sessionId": "session-1",
        }
    )
    module.validate_terminal(terminal, activation, "session-1")
    wrong = json.loads(json.dumps(terminal))
    wrong["goal"]["id"] = "goal-2"
    expect_invalid(module, lambda: module.validate_terminal(wrong, activation, "session-1"), "terminal Goal mismatch")
    note = {
        "jsonrpc": "2.0",
        "method": "session/update",
        "params": {
            "sessionId": "session-1",
            "update": {"content": {"text": control["expected_output_utf8"], "type": "text"}, "sessionUpdate": "agent_message_chunk"},
        },
    }
    require(module.agent_text([note], "session-1") == b"PASS", "agent output reconstruction")
    expect_invalid(module, lambda: module.agent_text([note], "session-2"), "notification session mismatch")
    return ["activation_positive", "terminal_positive", "terminal_goal_mismatch_negative", "agent_output_positive", "notification_session_negative"]


class FakeReader:
    def __init__(self, items: list[Any]) -> None:
        self.items: queue.Queue[Any] = queue.Queue()
        for item in items:
            self.items.put(item)

    def is_alive(self) -> bool:
        return False


def eof_checks(module: ModuleType) -> list[str]:
    clean = object.__new__(module.RpcPeer)
    clean.reader = FakeReader([None])
    clean.frames_in = 0
    clean.require_clean_eof()
    trailing = object.__new__(module.RpcPeer)
    trailing.reader = FakeReader([b"{}\n", None])
    trailing.frames_in = 0
    expect_invalid(module, trailing.require_clean_eof, "trailing output")
    return ["clean_eof_positive", "trailing_output_negative"]


def run() -> dict[str, Any]:
    module, source = load_controller()
    checks = static_checks(module, source)
    with tempfile.TemporaryDirectory(prefix="pw-r9-headless-controller-check-") as temp:
        root = Path(temp)
        admission, admission_path, atom, control = admission_fixture(module, root)
        module.load_admission(admission_path)
        checks.append("admission_positive")
        stale_quiescence = json.loads((root / "quiescence.json").read_text(encoding="utf-8"))
        stale_quiescence["observed_at_unix_ns"] = time.time_ns() - module.QUIESCENCE_MAX_AGE_NS - 1_000_000_000
        stale_quiescence_path = root / "stale-quiescence.json"
        stale_quiescence_path.write_bytes(module.canon(stale_quiescence))
        stale = dict(admission)
        stale["bindings"] = dict(admission["bindings"])
        stale["bindings"]["quiescence"] = reference(module, stale_quiescence_path)
        stale_path = root / "stale-admission.json"
        stale_path.write_bytes(module.canon(stale))
        expect_invalid(module, lambda: module.load_admission(stale_path), "stale quiescence")
        checks.append("stale_quiescence_negative")
        wrong = dict(admission)
        wrong["bindings"] = dict(admission["bindings"])
        wrong["bindings"]["executable"] = reference(module, root / "control.json")
        wrong_path = root / "wrong-admission.json"
        wrong_path.write_bytes(module.canon(wrong))
        expect_invalid(module, lambda: module.load_admission(wrong_path), "reviewed executable pin")
        checks.append("executable_pin_negative")
        oversized = dict(atom)
        oversized["prompt_utf8"] = "x" * 513
        oversized["prompt_utf8_bytes"] = 513
        oversized["prompt_utf8_sha256"] = module.digest(b"x" * 513)
        expect_invalid(module, lambda: module.find_atom({"atoms": [oversized]}, oversized["atom_id"]), "subject ceiling")
        checks.append("subject_ceiling_negative")
        checks.extend(lifecycle_fixture(module, atom, control, root / "manifest.json", root / "control.json"))
        checks.extend(eof_checks(module))
        duplicate = b'{"a":1,"a":2}\n'
        expect_invalid(module, lambda: module.load_json_bytes(duplicate, "duplicate"), "duplicate JSON key")
        checks.append("duplicate_json_negative")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "release": False},
        "check_count": len(checks),
        "checks": checks,
        "controller": {"bytes": CONTROLLER_BYTES, "sha256": CONTROLLER_SHA256},
        "first_mismatch": None,
        "schema_id": SCHEMA_ID,
        "status": "PASS_DATA_ONLY_MECHANICAL_ZERO_CREDIT_NO_OMP_LAUNCH",
        "temp_fixture_cleaned_on_exit": True,
        "workspace_writes": 0,
    }


def main() -> int:
    try:
        result = run()
        rc = 0
    except BaseException as exc:
        result = {
            "authority": {"canary_launch": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "release": False},
            "error": str(exc),
            "error_type": type(exc).__name__,
            "schema_id": SCHEMA_ID,
            "status": "FAIL_DATA_ONLY_MECHANICAL_ZERO_CREDIT_NO_OMP_LAUNCH",
            "workspace_writes": 0,
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
