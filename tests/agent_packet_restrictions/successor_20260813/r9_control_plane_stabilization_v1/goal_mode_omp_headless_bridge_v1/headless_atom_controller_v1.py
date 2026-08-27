#!/usr/bin/env python3
"""One-process, one-session, one-native-Goal OMP ACP atom controller."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import queue
import re
import signal
import stat
import subprocess
import sys
import threading
import time
from typing import Any, BinaryIO


BASE = Path(__file__).resolve().parent
CONTRACT_PATH = BASE / "headless_atom_controller_contract_v1.json"
CONTRACT_SHA256 = "5688562aa35055808b82c49fd5ab99f41ba37d0732898b0ce1fb27f064bf70cb"
CONTRACT_BYTES = 4645
EXECUTABLE_SHA256 = "124c3b65b09c3bf34d5a0864b5815997360e7cc4f0f639aabd2189118ed01f93"
EXECUTABLE_BYTES = 157_500_928
ADMISSION_SCHEMA = "pw-r9-goal-mode-omp-headless-atom-controller-admission-v1"
ADMISSION_STATUS = "PASS_EXACT_ONE_ZERO_CREDIT_ATOM_LAUNCH_ADMISSION"
QUIESCENCE_SCHEMA = "pw-r9-goal-mode-omp-windows-owner-quiescence-check-003-quiescent-receipt-v1"
QUIESCENCE_MAX_AGE_NS = 300_000_000_000
CONTROL_SCHEMA = "pw-r9-goal-mode-omp-headless-atom-control-v1"
ACTIVATION_SCHEMA = "pw-r9-omp-native-atomic-goal-activation-v1"
TERMINAL_SCHEMA = "pw-r9-omp-native-atomic-goal-terminal-v1"
ACTIVATE_METHOD = "_omp/r9/goal/activate-atom-v1"
SETTLE_METHOD = "_omp/r9/goal/settle-atom-v1"
MAX_JSON = 64_000_000
MAX_LINE = 8_388_608
OWNER_TASK = "019fbb7d-29ac-7e82-93b3-fff057d7a561"
OWNER_HOST = "remote-ssh-discovered:pm-dev"
EXPECTED_AUTHORITY = {
    "canary_launch": False,
    "matrix_launch": False,
    "qualification": False,
    "release": False,
    "retry": False,
    "run_atom": True,
}
EXPECTED_QUALIFICATION = {"credit": 0, "current_streak": 0, "required_streak": 2}
REF_KEYS = {"bytes", "path", "sha256"}
ADMISSION_KEYS = {
    "atom",
    "authority",
    "bindings",
    "capture",
    "launch",
    "owner",
    "qualification",
    "route",
    "schema_id",
    "status",
}
CAPTURE_FILES = (
    "00_admission.json",
    "01_preflight.json",
    "02_protocol_to_omp.ndjson",
    "03_protocol_from_omp.ndjson",
    "04_stderr.bin",
    "05_process.json",
    "06_terminal.json",
)
SECRET_PATTERNS = (
    re.compile(rb"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(rb"(?i)(api[_-]?key|access[_-]?token|refresh[_-]?token|password|authorization)[\"' ]*[:=][\"' ]*[^\s\"']{8,}"),
)


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = MAX_JSON) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe regular file:{path}")
    require(0 <= before.st_size <= limit, f"file size outside limit:{path}")
    with path.open("rb") as handle:
        raw = handle.read(limit + 1)
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns),
        f"changing file:{path}",
    )
    require(len(raw) == before.st_size, f"short or oversized read:{path}")
    return raw


def load_json_bytes(raw: bytes, label: str, canonical: bool = True) -> Any:
    require(raw.endswith(b"\n") and raw[:-1].count(b"\n") == 0 and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{label}")
    try:
        value = json.loads(
            raw,
            object_pairs_hook=pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(Invalid(f"nonfinite JSON:{label}:{token}")),
        )
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise Invalid(f"JSON parse:{label}:{exc}") from exc
    if canonical:
        require(raw == canon(value), f"noncanonical JSON:{label}")
    return value


def load_json(path: Path, limit: int = MAX_JSON) -> Any:
    return load_json_bytes(read_regular(path, limit), str(path))


def identity(path: Path) -> dict[str, Any]:
    raw = read_regular(path, 512_000_000)
    return {"bytes": len(raw), "path": str(path), "sha256": digest(raw)}


def validate_ref(ref: Any, label: str) -> Path:
    require(isinstance(ref, dict) and set(ref) == REF_KEYS, f"reference fields:{label}")
    require(isinstance(ref["path"], str) and ref["path"], f"reference path:{label}")
    require(isinstance(ref["bytes"], int) and ref["bytes"] >= 0, f"reference bytes:{label}")
    require(isinstance(ref["sha256"], str) and re.fullmatch(r"[0-9a-f]{64}", ref["sha256"]) is not None, f"reference sha256:{label}")
    path = Path(ref["path"])
    observed = identity(path)
    require(observed == ref, f"reference identity:{label}")
    return path


def fsync_dir(path: Path) -> None:
    if os.name == "nt":
        return
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def write_new(path: Path, raw: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
    try:
        try:
            os.fchmod(fd, 0o600)
        except OSError:
            if os.name != "nt":
                raise
        offset = 0
        while offset < len(raw):
            count = os.write(fd, raw[offset:])
            require(count > 0, f"short write:{path}")
            offset += count
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(path.parent)
    require(read_regular(path, max(1, len(raw))) == raw, f"write reopen:{path}")


def write_json_new(path: Path, value: Any) -> None:
    write_new(path, canon(value))


def open_capture_fd(path: Path) -> int:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
    try:
        os.fchmod(fd, 0o600)
    except OSError:
        if os.name != "nt":
            os.close(fd)
            raise
    fsync_dir(path.parent)
    return fd


def append_durable(fd: int, raw: bytes) -> None:
    offset = 0
    while offset < len(raw):
        count = os.write(fd, raw[offset:])
        require(count > 0, "short capture write")
        offset += count
    os.fsync(fd)


def contract_check() -> dict[str, Any]:
    raw = read_regular(CONTRACT_PATH)
    require(len(raw) == CONTRACT_BYTES and digest(raw) == CONTRACT_SHA256, "controller contract identity")
    contract = load_json_bytes(raw, str(CONTRACT_PATH))
    require(contract.get("schema_id") == "pw-r9-goal-mode-omp-headless-atom-controller-contract-v1", "controller contract schema")
    for ref in contract.get("bindings", []):
        require(set(ref) == {"bytes", "mode", "path", "sha256"}, "contract binding fields")
        path = (BASE / ref["path"]).resolve()
        observed = read_regular(path, 512_000_000)
        require(len(observed) == ref["bytes"] and digest(observed) == ref["sha256"], f"contract binding identity:{ref['path']}")
        require(f"{stat.S_IMODE(os.stat(path).st_mode):04o}" == ref["mode"], f"contract binding mode:{ref['path']}")
    return contract


def exact_utf8(value: Any, expected_bytes: Any, expected_sha: Any, limit: int, label: str) -> bytes:
    require(isinstance(value, str), f"{label} text")
    raw = value.encode("utf-8")
    require(1 <= len(raw) <= limit, f"{label} byte limit")
    require(expected_bytes == len(raw) and expected_sha == digest(raw), f"{label} identity")
    return raw


def find_atom(manifest: Any, atom_id: str) -> dict[str, Any]:
    require(isinstance(manifest, dict) and isinstance(manifest.get("atoms"), list), "atom manifest shape")
    matches = [value for value in manifest["atoms"] if isinstance(value, dict) and value.get("atom_id") == atom_id]
    require(len(matches) == 1, "atom identity cardinality")
    atom = matches[0]
    require(atom.get("atom_count") == 1, "atom count")
    exact_utf8(atom.get("goal_objective_utf8"), atom.get("goal_objective_utf8_bytes"), atom.get("goal_objective_utf8_sha256"), 256, "goal objective")
    exact_utf8(atom.get("prompt_utf8"), atom.get("prompt_utf8_bytes"), atom.get("prompt_utf8_sha256"), 512, "subject")
    exact_utf8(atom.get("evidence_slice_utf8"), atom.get("evidence_slice_utf8_bytes"), atom.get("evidence_slice_utf8_sha256"), 256, "evidence slice")
    require(isinstance(atom.get("acceptance_criterion"), str) and 1 <= len(atom["acceptance_criterion"].encode("utf-8")) <= 256, "acceptance criterion")
    require(isinstance(atom.get("expected_output_schema"), str) and 1 <= len(atom["expected_output_schema"].encode("utf-8")) <= 128, "output contract")
    exact_utf8(atom.get("expected_output_utf8"), atom.get("expected_output_utf8_bytes"), atom.get("expected_output_utf8_sha256"), 4096, "expected output")
    return atom


def validate_control(control: Any, atom: dict[str, Any], admission: dict[str, Any]) -> None:
    expected = {
        "atom_id",
        "expected_output_utf8",
        "expected_output_utf8_bytes",
        "expected_output_utf8_sha256",
        "model_config_value",
        "row_id",
        "schema_id",
        "thinking_config_value",
    }
    require(isinstance(control, dict) and set(control) == expected, "control fields")
    require(control["schema_id"] == CONTROL_SCHEMA, "control schema")
    require(control["atom_id"] == admission["atom"]["atom_id"] == atom["atom_id"], "control atom")
    require(control["row_id"] == admission["atom"]["row_id"], "control row")
    require(control["model_config_value"] == admission["route"]["model_config_value"], "control model")
    require(control["thinking_config_value"] == admission["route"]["thinking_config_value"], "control thinking")
    require(
        control["expected_output_utf8"] == atom["expected_output_utf8"]
        and control["expected_output_utf8_bytes"] == atom["expected_output_utf8_bytes"]
        and control["expected_output_utf8_sha256"] == atom["expected_output_utf8_sha256"],
        "control expected output",
    )


def validate_quiescence(value: Any) -> None:
    require(isinstance(value, dict), "quiescence receipt object")
    require(value.get("schema_id") == QUIESCENCE_SCHEMA, "quiescence schema")
    require(value.get("status") == "QUIESCENT_ORIGINAL_WINDOWS_OMP_PID_ABSENT_LOCK_UNHELD", "quiescence status")
    require(value.get("owner") == {"controlling_task_id": OWNER_TASK, "host_id": OWNER_HOST}, "quiescence owner")
    require(value.get("state") == {"lock_held": False, "original_pid": 14520, "pid_live": False}, "quiescence state")
    require(value.get("authority", {}).get("headless_omp_launch") is False, "quiescence does not itself launch")
    observed_at = value.get("observed_at_unix_ns")
    require(isinstance(observed_at, int) and observed_at > 0, "quiescence observation time")
    age = time.time_ns() - observed_at
    require(0 <= age <= QUIESCENCE_MAX_AGE_NS, "stale or future quiescence receipt")


def load_admission(path: Path) -> tuple[dict[str, Any], bytes, dict[str, Any], dict[str, Any], dict[str, Any]]:
    raw = read_regular(path)
    admission = load_json_bytes(raw, str(path))
    require(isinstance(admission, dict) and set(admission) == ADMISSION_KEYS, "admission fields")
    require(admission["schema_id"] == ADMISSION_SCHEMA and admission["status"] == ADMISSION_STATUS, "admission schema/status")
    require(admission["authority"] == EXPECTED_AUTHORITY, "admission authority")
    require(admission["owner"] == {"controlling_task_id": OWNER_TASK, "host_id": OWNER_HOST}, "admission owner")
    require(admission["qualification"] == EXPECTED_QUALIFICATION, "admission qualification")
    require(isinstance(admission["bindings"], dict) and set(admission["bindings"]) == {"contract", "control", "executable", "manifest", "quiescence"}, "admission bindings")
    contract_path = validate_ref(admission["bindings"]["contract"], "contract")
    contract_raw = read_regular(contract_path)
    require(len(contract_raw) == CONTRACT_BYTES and digest(contract_raw) == CONTRACT_SHA256, "admission contract pin")
    executable_path = validate_ref(admission["bindings"]["executable"], "executable")
    require(
        admission["bindings"]["executable"]["bytes"] == EXECUTABLE_BYTES
        and admission["bindings"]["executable"]["sha256"] == EXECUTABLE_SHA256,
        "reviewed reproducible executable pin",
    )
    require(executable_path.name.lower() == "omp-windows-x64.exe", "reviewed executable filename")
    manifest_path = validate_ref(admission["bindings"]["manifest"], "manifest")
    control_path = validate_ref(admission["bindings"]["control"], "control")
    quiescence_path = validate_ref(admission["bindings"]["quiescence"], "quiescence")
    require(admission["launch"] == {"argv": ["omp", "--cwd", "P:\\", "acp"], "cwd": "P:\\", "environment": {"PW_R9_OMP_GOAL_BRIDGE_V2": "1"}, "timeout_seconds": admission["launch"].get("timeout_seconds")}, "launch contract")
    require(isinstance(admission["launch"]["timeout_seconds"], int) and 1 <= admission["launch"]["timeout_seconds"] <= 1800, "launch timeout")
    require(admission["atom"].keys() == {"atom_id", "row_id"}, "admission atom")
    require(isinstance(admission["atom"]["atom_id"], str) and isinstance(admission["atom"]["row_id"], str), "admission atom values")
    require(re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,127}", admission["atom"]["row_id"]) is not None, "row id")
    require(admission["route"].keys() == {"model_config_value", "thinking_config_value"}, "route fields")
    require(all(isinstance(admission["route"][key], str) and admission["route"][key] for key in admission["route"]), "route values")
    require(admission["capture"].keys() == {"root"} and isinstance(admission["capture"]["root"], str), "capture fields")
    capture_root = Path(admission["capture"]["root"])
    require(capture_root.is_absolute() and not capture_root.exists(), "fresh absolute capture root")
    require(str(executable_path) == admission["bindings"]["executable"]["path"], "executable lexical identity")
    manifest = load_json(manifest_path)
    atom = find_atom(manifest, admission["atom"]["atom_id"])
    control = load_json(control_path)
    validate_control(control, atom, admission)
    validate_quiescence(load_json(quiescence_path))
    return admission, raw, atom, control, {"capture_root": capture_root, "executable_path": executable_path}


def windows_omp_snapshot() -> dict[str, Any]:
    require(os.name == "nt", "Windows platform required")
    command = (
        "$ErrorActionPreference='Stop';"
        "$x=@(Get-CimInstance Win32_Process | Where-Object { $_.Name -ieq 'omp.exe' -or $_.Name -ieq 'omp-windows-x64.exe' } | "
        "Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine);"
        "Write-Output (ConvertTo-Json -Compress -InputObject $x)"
    )
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=30,
        check=False,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    require(result.returncode == 0 and result.stderr == b"", "Windows OMP process snapshot")
    try:
        parsed = json.loads(result.stdout.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"Windows OMP snapshot parse:{exc}") from exc
    if isinstance(parsed, dict):
        rows = [parsed]
    else:
        require(isinstance(parsed, list), "Windows OMP snapshot shape")
        rows = parsed
    return {
        "command_kind": "WINDOWS_CIM_OMP_PROCESS_SNAPSHOT",
        "processes": rows,
        "return_code": result.returncode,
        "stderr": {"bytes": len(result.stderr), "sha256": digest(result.stderr)},
        "stdout": {"bytes": len(result.stdout), "sha256": digest(result.stdout)},
    }


class DurableLineReader(threading.Thread):
    def __init__(self, stream: BinaryIO, capture_fd: int) -> None:
        super().__init__(daemon=True)
        self.stream = stream
        self.capture_fd = capture_fd
        self.items: queue.Queue[bytes | BaseException | None] = queue.Queue()

    def run(self) -> None:
        try:
            while True:
                raw = self.stream.readline(MAX_LINE + 2)
                if raw == b"":
                    self.items.put(None)
                    return
                if len(raw) > MAX_LINE + 1 or not raw.endswith(b"\n") or b"\r" in raw or b"\x00" in raw:
                    raise Invalid("ACP stdout line framing")
                append_durable(self.capture_fd, raw)
                self.items.put(raw)
        except BaseException as exc:
            self.items.put(exc)


class RpcPeer:
    def __init__(self, process: subprocess.Popen[bytes], outgoing_fd: int, incoming_fd: int, deadline: float) -> None:
        require(process.stdin is not None and process.stdout is not None, "ACP pipes")
        self.process = process
        self.stdin = process.stdin
        self.outgoing_fd = outgoing_fd
        self.reader = DurableLineReader(process.stdout, incoming_fd)
        self.reader.start()
        self.deadline = deadline
        self.next_id = 1
        self.notifications: list[dict[str, Any]] = []
        self.permission_requests = 0
        self.frames_in = 0
        self.frames_out = 0

    def _remaining(self) -> float:
        remaining = self.deadline - time.monotonic()
        require(remaining > 0, "ACP deadline")
        return remaining

    def _send(self, value: dict[str, Any]) -> None:
        raw = canon(value)
        require(len(raw) <= MAX_LINE + 1, "ACP outgoing line limit")
        append_durable(self.outgoing_fd, raw)
        self.stdin.write(raw)
        self.stdin.flush()
        self.frames_out += 1

    def request(self, method: str, params: dict[str, Any]) -> Any:
        request_id = self.next_id
        self.next_id += 1
        self._send({"id": request_id, "jsonrpc": "2.0", "method": method, "params": params})
        while True:
            try:
                item = self.reader.items.get(timeout=self._remaining())
            except queue.Empty as exc:
                raise Invalid("ACP response timeout") from exc
            if item is None:
                raise Invalid("ACP EOF before response")
            if isinstance(item, BaseException):
                raise Invalid(f"ACP reader:{type(item).__name__}:{item}") from item
            self.frames_in += 1
            try:
                value = json.loads(
                    item,
                    object_pairs_hook=pairs,
                    parse_constant=lambda token: (_ for _ in ()).throw(Invalid(f"ACP nonfinite:{token}")),
                )
            except (json.JSONDecodeError, UnicodeDecodeError) as exc:
                raise Invalid(f"ACP JSON:{exc}") from exc
            require(isinstance(value, dict) and value.get("jsonrpc") == "2.0", "ACP frame envelope")
            if "method" in value:
                method_name = value.get("method")
                if "id" not in value:
                    require(method_name == "session/update" and set(value) == {"jsonrpc", "method", "params"}, "ACP notification")
                    require(isinstance(value.get("params"), dict), "ACP notification params")
                    self.notifications.append(value)
                    continue
                if method_name == "session/request_permission":
                    self.permission_requests += 1
                    self._send({"id": value["id"], "jsonrpc": "2.0", "result": {"outcome": {"outcome": "cancelled"}}})
                    continue
                self._send({"error": {"code": -32601, "message": "unsupported client request"}, "id": value["id"], "jsonrpc": "2.0"})
                raise Invalid(f"unexpected ACP client request:{method_name}")
            require(value.get("id") == request_id, "ACP response id")
            require(set(value) in ({"id", "jsonrpc", "result"}, {"error", "id", "jsonrpc"}), "ACP response fields")
            if "error" in value:
                raise Invalid(f"ACP error response:{canon(value['error'], False).decode('utf-8')}")
            require(self.permission_requests == 0, "unexpected ACP permission request")
            return value["result"]

    def require_clean_eof(self) -> None:
        require(not self.reader.is_alive(), "ACP reader still active at EOF check")
        eof_count = 0
        while True:
            try:
                item = self.reader.items.get_nowait()
            except queue.Empty:
                break
            if item is None:
                eof_count += 1
                continue
            if isinstance(item, BaseException):
                raise Invalid(f"ACP reader terminal:{type(item).__name__}:{item}") from item
            self.frames_in += 1
            raise Invalid("ACP trailing output after session close")
        require(eof_count == 1, "ACP terminal EOF cardinality")


def config_option(response: Any, config_id: str) -> dict[str, Any]:
    require(isinstance(response, dict) and isinstance(response.get("configOptions"), list), f"ACP config response:{config_id}")
    matches = [item for item in response["configOptions"] if isinstance(item, dict) and item.get("id") == config_id]
    require(len(matches) == 1, f"ACP config cardinality:{config_id}")
    return matches[0]


def validate_activation(response: Any, params: dict[str, Any]) -> tuple[str, str]:
    expected = {
        "acceptanceCriterion",
        "acceptanceCriterionBytes",
        "acceptanceCriterionSha256",
        "activation",
        "atomId",
        "atomManifestSha256",
        "baseline",
        "controlSha256",
        "goal",
        "objective",
        "objectiveBytes",
        "objectiveSha256",
        "outputContract",
        "outputContractBytes",
        "outputContractSha256",
        "phase",
        "rowId",
        "schemaId",
        "sessionId",
        "subjectUtf8Bytes",
        "subjectUtf8Sha256",
    }
    require(isinstance(response, dict) and set(response) == expected, "activation response fields")
    require(response["schemaId"] == ACTIVATION_SCHEMA and response["phase"] == "ACTIVE", "activation response state")
    require(response["baseline"] == {"goal": None, "messageCount": 0, "phase": "FRESH"}, "activation baseline")
    require(isinstance(response["activation"], dict), "activation receipt")
    require(response["activation"].get("activeTools") == ["goal"] and response["activation"].get("nativeMode") == "goal", "activation native mode")
    require(isinstance(response["activation"].get("entryId"), str) and response["activation"]["entryId"], "activation entry id")
    require(isinstance(response["goal"], dict) and response["goal"].get("status") == "active", "active Goal")
    require(isinstance(response["goal"].get("id"), str) and response["goal"]["id"], "active Goal id")
    mapping = {
        "acceptanceCriterion": "acceptanceCriterionUtf8",
        "acceptanceCriterionBytes": "acceptanceCriterionUtf8Bytes",
        "acceptanceCriterionSha256": "acceptanceCriterionUtf8Sha256",
        "atomId": "atomId",
        "atomManifestSha256": "atomManifestSha256",
        "controlSha256": "controlSha256",
        "objective": "goalObjectiveUtf8",
        "objectiveBytes": "goalObjectiveUtf8Bytes",
        "objectiveSha256": "goalObjectiveUtf8Sha256",
        "outputContract": "outputContractUtf8",
        "outputContractBytes": "outputContractUtf8Bytes",
        "outputContractSha256": "outputContractUtf8Sha256",
        "rowId": "rowId",
        "sessionId": "sessionId",
        "subjectUtf8Bytes": "subjectUtf8Bytes",
        "subjectUtf8Sha256": "subjectUtf8Sha256",
    }
    for response_key, request_key in mapping.items():
        require(response[response_key] == params[request_key], f"activation binding:{response_key}")
    require(response["goal"].get("objective") == params["goalObjectiveUtf8"], "Goal objective")
    return response["goal"]["id"], response["activation"].get("entryId")


def validate_terminal(response: Any, activation: dict[str, Any], session_id: str) -> None:
    expected = {
        "acceptanceCriterion",
        "acceptanceCriterionBytes",
        "acceptanceCriterionSha256",
        "atomId",
        "atomManifestSha256",
        "controlSha256",
        "goal",
        "goalCompletedRecord",
        "modeChange",
        "outputContract",
        "outputContractBytes",
        "outputContractSha256",
        "phase",
        "rowId",
        "schemaId",
        "sessionId",
        "subjectUtf8Bytes",
        "subjectUtf8Sha256",
    }
    require(isinstance(response, dict) and set(response) == expected, "terminal response fields")
    require(response["schemaId"] == TERMINAL_SCHEMA and response["phase"] == "SETTLED", "terminal response state")
    require(response["sessionId"] == session_id, "terminal session")
    require(isinstance(response["goal"], dict) and response["goal"].get("status") == "complete", "terminal Goal complete")
    require(response["goal"].get("id") == activation["goal"]["id"] and response["goal"].get("objective") == activation["goal"]["objective"], "terminal Goal identity")
    require(isinstance(response["modeChange"], dict) and response["modeChange"].get("mode") == "none", "terminal mode none")
    require(isinstance(response["modeChange"].get("entryId"), str) and response["modeChange"]["entryId"], "terminal mode entry")
    require(isinstance(response["goalCompletedRecord"], dict) and response["goalCompletedRecord"].get("type") == "goal-completed", "goal completed record")
    require(isinstance(response["goalCompletedRecord"].get("entryId"), str) and response["goalCompletedRecord"]["entryId"], "goal completed entry")
    completed_data = response["goalCompletedRecord"].get("data")
    require(
        completed_data
        == {
            "objective": response["goal"].get("objective"),
            "timeUsedSeconds": response["goal"].get("timeUsedSeconds"),
            "tokenBudget": response["goal"].get("tokenBudget"),
            "tokensUsed": response["goal"].get("tokensUsed"),
        },
        "goal completed data",
    )
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
    ):
        require(response[key] == activation[key], f"terminal binding:{key}")


def agent_text(notifications: list[dict[str, Any]], session_id: str) -> bytes:
    chunks: list[str] = []
    for frame in notifications:
        params = frame.get("params")
        require(isinstance(params, dict) and params.get("sessionId") == session_id, "session notification identity")
        update = params.get("update")
        require(isinstance(update, dict) and isinstance(update.get("sessionUpdate"), str), "session update shape")
        if update["sessionUpdate"] == "agent_message_chunk":
            content = update.get("content")
            require(isinstance(content, dict) and content.get("type") == "text" and isinstance(content.get("text"), str), "agent text chunk")
            chunks.append(content["text"])
    require(chunks, "missing agent output")
    return "".join(chunks).encode("utf-8")


def terminate_process(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    try:
        if os.name == "nt":
            process.terminate()
        else:
            os.killpg(process.pid, signal.SIGKILL)
        process.wait(timeout=15)
    except (OSError, subprocess.TimeoutExpired):
        try:
            process.kill()
        except OSError:
            pass
        try:
            process.wait(timeout=15)
        except (OSError, subprocess.TimeoutExpired):
            pass


def scan_secret(paths: list[Path]) -> bool:
    for path in paths:
        raw = read_regular(path, 512_000_000)
        if any(pattern.search(raw) for pattern in SECRET_PATTERNS):
            return True
    return False


def run_atom(admission_path: Path) -> tuple[dict[str, Any], int]:
    contract_check()
    admission, admission_raw, atom, control, paths = load_admission(admission_path)
    require(os.name == "nt", "run-atom is Windows-only")
    require(Path("P:\\").is_dir(), "P drive unavailable")
    before = windows_omp_snapshot()
    require(before["processes"] == [], "existing OMP process blocks launch")
    capture_root: Path = paths["capture_root"]
    os.mkdir(capture_root, 0o700)
    try:
        os.chmod(capture_root, 0o700)
    except OSError:
        if os.name != "nt":
            raise
    fsync_dir(capture_root.parent)
    write_new(capture_root / CAPTURE_FILES[0], admission_raw)
    preflight = {
        "admission": {"bytes": len(admission_raw), "sha256": digest(admission_raw)},
        "atom_id": admission["atom"]["atom_id"],
        "authority": {"qualification_credit": 0},
        "capture_root": str(capture_root),
        "controller_contract": {"bytes": CONTRACT_BYTES, "sha256": CONTRACT_SHA256},
        "process_snapshot_before": before,
        "row_id": admission["atom"]["row_id"],
        "schema_id": "pw-r9-goal-mode-omp-headless-atom-controller-preflight-v1",
        "status": "PASS_PRELAUNCH_ORIGINAL_OMP_ABSENT_ZERO_CREDIT",
    }
    write_json_new(capture_root / CAPTURE_FILES[1], preflight)
    outgoing_fd = open_capture_fd(capture_root / CAPTURE_FILES[2])
    incoming_fd = open_capture_fd(capture_root / CAPTURE_FILES[3])
    stderr_fd = open_capture_fd(capture_root / CAPTURE_FILES[4])
    process: subprocess.Popen[bytes] | None = None
    peer: RpcPeer | None = None
    started = time.time_ns()
    error: BaseException | None = None
    prompt_response: Any = None
    activation: Any = None
    terminal_response: Any = None
    session_id: str | None = None
    observed_output = b""
    post_snapshot: dict[str, Any] | None = None
    try:
        environment = os.environ.copy()
        environment.update(admission["launch"]["environment"])
        creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
        process = subprocess.Popen(
            [str(paths["executable_path"]), "--cwd", "P:\\", "acp"],
            cwd="P:\\",
            env=environment,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=stderr_fd,
            shell=False,
            creationflags=creationflags,
        )
        deadline = time.monotonic() + admission["launch"]["timeout_seconds"]
        peer = RpcPeer(process, outgoing_fd, incoming_fd, deadline)
        initialized = peer.request(
            "initialize",
            {"clientCapabilities": {}, "clientInfo": {"name": "pw-r9-goal-mode-omp-headless-atom-controller", "version": "1"}, "protocolVersion": 1},
        )
        require(isinstance(initialized, dict) and initialized.get("protocolVersion") == 1, "ACP initialize response")
        require(initialized.get("agentInfo", {}).get("name") == "oh-my-pi", "ACP agent identity")
        require(
            initialized.get("agentCapabilities")
            == {
                "loadSession": False,
                "mcpCapabilities": {},
                "promptCapabilities": {"embeddedContext": False, "image": False},
                "sessionCapabilities": {"close": {}},
            },
            "ACP restricted Goal bridge capabilities",
        )
        created = peer.request("session/new", {"cwd": "P:\\", "mcpServers": []})
        require(isinstance(created, dict) and isinstance(created.get("sessionId"), str) and created["sessionId"], "fresh session response")
        session_id = created["sessionId"]
        model_option = config_option(created, "model")
        thinking_option = config_option(created, "thinking")
        require(admission["route"]["model_config_value"] in [item.get("value") for item in model_option.get("options", []) if isinstance(item, dict)], "requested model unavailable")
        require(admission["route"]["thinking_config_value"] in [item.get("value") for item in thinking_option.get("options", []) if isinstance(item, dict)], "requested thinking unavailable")
        configured_model = peer.request(
            "session/set_config_option",
            {"configId": "model", "sessionId": session_id, "value": admission["route"]["model_config_value"]},
        )
        require(config_option(configured_model, "model").get("currentValue") == admission["route"]["model_config_value"], "model route not frozen")
        configured_thinking = peer.request(
            "session/set_config_option",
            {"configId": "thinking", "sessionId": session_id, "value": admission["route"]["thinking_config_value"]},
        )
        require(config_option(configured_thinking, "thinking").get("currentValue") == admission["route"]["thinking_config_value"], "thinking route not frozen")
        objective = atom["goal_objective_utf8"]
        criterion = atom["acceptance_criterion"]
        output_contract = atom["expected_output_schema"]
        subject = atom["prompt_utf8"]
        manifest_raw = read_regular(Path(admission["bindings"]["manifest"]["path"]))
        control_raw = read_regular(Path(admission["bindings"]["control"]["path"]))
        activation_params = {
            "acceptanceCriterionUtf8": criterion,
            "acceptanceCriterionUtf8Bytes": len(criterion.encode("utf-8")),
            "acceptanceCriterionUtf8Sha256": digest(criterion.encode("utf-8")),
            "atomId": admission["atom"]["atom_id"],
            "atomManifestSha256": digest(manifest_raw),
            "controlSha256": digest(control_raw),
            "goalObjectiveUtf8": objective,
            "goalObjectiveUtf8Bytes": len(objective.encode("utf-8")),
            "goalObjectiveUtf8Sha256": digest(objective.encode("utf-8")),
            "outputContractUtf8": output_contract,
            "outputContractUtf8Bytes": len(output_contract.encode("utf-8")),
            "outputContractUtf8Sha256": digest(output_contract.encode("utf-8")),
            "rowId": admission["atom"]["row_id"],
            "sessionId": session_id,
            "subjectUtf8Bytes": len(subject.encode("utf-8")),
            "subjectUtf8Sha256": digest(subject.encode("utf-8")),
        }
        activation = peer.request(ACTIVATE_METHOD, activation_params)
        validate_activation(activation, activation_params)
        notification_start = len(peer.notifications)
        prompt_response = peer.request("session/prompt", {"prompt": [{"text": subject, "type": "text"}], "sessionId": session_id})
        require(isinstance(prompt_response, dict) and prompt_response.get("stopReason") == "end_turn", "prompt terminal response")
        observed_output = agent_text(peer.notifications[notification_start:], session_id)
        require(observed_output == control["expected_output_utf8"].encode("utf-8"), "scored output mismatch")
        terminal_response = peer.request(SETTLE_METHOD, {"sessionId": session_id})
        validate_terminal(terminal_response, activation, session_id)
        closed = peer.request("session/close", {"sessionId": session_id})
        require(closed == {}, "session close response")
        require(process.stdin is not None, "ACP stdin")
        process.stdin.close()
        remaining = max(0.1, peer.deadline - time.monotonic())
        process.wait(timeout=remaining)
        require(process.returncode == 0, "OMP process return code")
        peer.reader.join(timeout=5)
        peer.require_clean_eof()
        post_snapshot = windows_omp_snapshot()
        require(post_snapshot["processes"] == [], "OMP process remains after row")
    except BaseException as exc:
        error = exc
        if process is not None:
            terminate_process(process)
        try:
            post_snapshot = windows_omp_snapshot()
        except BaseException:
            post_snapshot = None
    finally:
        for fd in (outgoing_fd, incoming_fd, stderr_fd):
            try:
                os.fsync(fd)
            except OSError:
                pass
            try:
                os.close(fd)
            except OSError:
                pass
    ended = time.time_ns()
    process_receipt = {
        "ended_unix_ns": ended,
        "frames_from_omp": peer.frames_in if peer else 0,
        "frames_to_omp": peer.frames_out if peer else 0,
        "launch_count": 1 if process is not None else 0,
        "pid": process.pid if process else None,
        "process_snapshot_after": post_snapshot,
        "return_code": process.returncode if process else None,
        "schema_id": "pw-r9-goal-mode-omp-headless-atom-process-receipt-v1",
        "started_unix_ns": started,
    }
    write_json_new(capture_root / CAPTURE_FILES[5], process_receipt)
    secret_observed = scan_secret([capture_root / CAPTURE_FILES[2], capture_root / CAPTURE_FILES[3], capture_root / CAPTURE_FILES[4]])
    success = error is None and not secret_observed
    terminal = {
        "answer": {"bytes": len(observed_output), "sha256": digest(observed_output)},
        "atom_id": admission["atom"]["atom_id"],
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "release": False},
        "error": None if error is None else {"message": str(error), "type": type(error).__name__},
        "external_gate_eligible": success,
        "goal": None if terminal_response is None else {"id": terminal_response.get("goal", {}).get("id"), "status": terminal_response.get("goal", {}).get("status")},
        "process": {"return_code": process.returncode if process else None},
        "row_id": admission["atom"]["row_id"],
        "schema_id": "pw-r9-goal-mode-omp-headless-atom-controller-terminal-v1",
        "secret_material_observed": secret_observed,
        "session_id": session_id,
        "status": "PASS_ZERO_CREDIT_EXTERNAL_GATE_ELIGIBLE" if success else "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY",
    }
    write_json_new(capture_root / CAPTURE_FILES[6], terminal)
    return terminal, 0 if success else 2


def check() -> dict[str, Any]:
    contract = contract_check()
    source = read_regular(Path(__file__).resolve(), 2_000_000).decode("utf-8")
    tree = ast.parse(source)
    popen_calls = [node for node in ast.walk(tree) if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(len(popen_calls) == 1, "controller Popen cardinality")
    require("shell=False" in source and "PW_R9_OMP_GOAL_BRIDGE_V2" in source, "controller launch constants")
    rpc_methods = {
        node.args[0].value
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "request"
        and node.args
        and isinstance(node.args[0], ast.Constant)
        and isinstance(node.args[0].value, str)
    }
    forbidden_rpc_methods = {"session/" + suffix for suffix in ("load", "resume", "fork")}
    require(rpc_methods.isdisjoint(forbidden_rpc_methods), "forbidden session reuse methods")
    return {
        "authority": contract["authority"],
        "checks": {
            "capture_file_count": len(CAPTURE_FILES),
            "contract_bindings": len(contract["bindings"]),
            "one_popen_site": len(popen_calls),
            "one_process_one_session_one_goal_one_subject": True,
            "platform_run_gate": "WINDOWS_ONLY",
            "qualification_credit": 0,
        },
        "first_mismatch": None,
        "schema_id": "pw-r9-goal-mode-omp-headless-atom-controller-check-v1",
        "status": "PASS_STATIC_CONTROLLER_CHECK_ZERO_CREDIT_NO_LAUNCH",
        "workspace_writes": 0,
    }


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser()
    sub = value.add_subparsers(dest="command", required=True)
    sub.add_parser("check")
    run = sub.add_parser("run-atom")
    run.add_argument("--admission", type=Path, required=True)
    return value


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "check":
            result, rc = check(), 0
        else:
            result, rc = run_atom(args.admission)
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, subprocess.SubprocessError) as exc:
        result = {
            "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "release": False},
            "error": str(exc),
            "error_type": type(exc).__name__,
            "schema_id": "pw-r9-goal-mode-omp-headless-atom-controller-error-v1",
            "status": "FAIL_CLOSED_ZERO_CREDIT_NO_LAUNCH",
        }
        rc = 2
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
