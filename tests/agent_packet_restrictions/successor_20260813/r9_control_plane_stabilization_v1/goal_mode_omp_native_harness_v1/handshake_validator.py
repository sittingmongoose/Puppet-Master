#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import stat
import sys
import tempfile
from pathlib import Path
from typing import Any


class Invalid(Exception):
    pass


ROOT = Path(__file__).resolve().parent
CONTRACT_PATH = ROOT / "handshake_contract.json"
MAX_JSON_BYTES = 1_000_000


def _pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in items:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def _canonical(value: Any) -> bytes:
    try:
        return (
            json.dumps(value, sort_keys=True, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
            + "\n"
        ).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise Invalid(f"non-canonical JSON value: {exc}") from exc


def _read_regular(path: Path, limit: int = MAX_JSON_BYTES) -> bytes:
    try:
        info = path.lstat()
    except OSError as exc:
        raise Invalid(f"cannot stat {path}: {exc}") from exc
    if not stat.S_ISREG(info.st_mode) or path.is_symlink():
        raise Invalid(f"not a regular nonlink file: {path}")
    if info.st_size > limit:
        raise Invalid(f"file exceeds byte limit: {path}")
    try:
        data = path.read_bytes()
    except OSError as exc:
        raise Invalid(f"cannot read {path}: {exc}") from exc
    if len(data) != info.st_size:
        raise Invalid(f"size drift while reading: {path}")
    return data


def _load_canonical(path: Path) -> tuple[dict[str, Any], bytes]:
    data = _read_regular(path)
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data:
        raise Invalid(f"JSON must end in exactly one LF with no CR: {path}")
    try:
        value = json.loads(data.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=lambda x: (_ for _ in ()).throw(Invalid(f"nonfinite JSON: {x}")))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"invalid UTF-8 JSON at {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise Invalid(f"top-level JSON must be an object: {path}")
    if _canonical(value) != data:
        raise Invalid(f"JSON is not recursively sorted canonical minified one-LF bytes: {path}")
    return value, data


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _exact_keys(value: dict[str, Any], expected: list[str], where: str) -> None:
    actual = sorted(value)
    wanted = sorted(expected)
    if actual != wanted:
        raise Invalid(f"{where} keys mismatch: expected {wanted}, got {actual}")


def _nonempty_string(value: Any, where: str) -> str:
    if not isinstance(value, str) or not value or any(ch in value for ch in ("\x00", "\r", "\n")):
        raise Invalid(f"{where} must be a nonempty single-line string")
    return value


def _bool(value: Any, where: str) -> bool:
    if type(value) is not bool:
        raise Invalid(f"{where} must be boolean")
    return value


def _uint(value: Any, where: str, *, positive: bool = False) -> int:
    if type(value) is not int or value < (1 if positive else 0):
        qualifier = "positive" if positive else "nonnegative"
        raise Invalid(f"{where} must be a {qualifier} integer")
    return value


def _sha256(value: Any, regex: re.Pattern[str], where: str) -> str:
    if not isinstance(value, str) or not regex.fullmatch(value):
        raise Invalid(f"{where} must be lowercase SHA-256 hex")
    return value


def _string_list(value: Any, where: str) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(item, str) or not item for item in value):
        raise Invalid(f"{where} must be an array of nonempty strings")
    if len(value) != len(set(value)):
        raise Invalid(f"{where} must contain unique values")
    return value


def _write_create_only(path: Path, data: bytes) -> None:
    if not path.is_absolute():
        raise Invalid("output path must be absolute")
    parent = path.parent
    try:
        parent_info = parent.lstat()
    except OSError as exc:
        raise Invalid(f"output parent unavailable: {exc}") from exc
    if not stat.S_ISDIR(parent_info.st_mode) or parent.is_symlink():
        raise Invalid("output parent must be an existing regular nonlink directory")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        fd = os.open(path, flags, 0o644)
        try:
            offset = 0
            while offset < len(data):
                written = os.write(fd, data[offset:])
                if written <= 0:
                    raise Invalid("short output write")
                offset += written
            os.fsync(fd)
        finally:
            os.close(fd)
        dir_fd = os.open(parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
        try:
            os.fsync(dir_fd)
        finally:
            os.close(dir_fd)
    except FileExistsError as exc:
        raise Invalid(f"output already exists: {path}") from exc
    except OSError as exc:
        raise Invalid(f"output write failed: {exc}") from exc
    if _read_regular(path, max(len(data), 1)) != data:
        raise Invalid("output reopen mismatch")


def _validate_contract(contract: dict[str, Any], raw: bytes) -> None:
    _exact_keys(
        contract,
        ["artifact_id", "authority", "bindings", "request", "response", "schema_id", "status", "validation"],
        "contract",
    )
    if contract["schema_id"] != "pw-r9-omp-goal-mode-lane-handshake-contract-v1":
        raise Invalid("contract schema_id mismatch")
    if _canonical(contract) != raw:
        raise Invalid("contract canonical bytes mismatch")
    if contract["authority"] != {
        "canary_launch": False,
        "matrix_launch": False,
        "omp_process_launch": False,
        "qualification_credit": 0,
        "qualification_streak_clean_matrices": 0,
        "subject_launch": False,
    }:
        raise Invalid("contract authority mismatch")
    seen: set[Path] = set()
    for index, row in enumerate(contract["bindings"]):
        _exact_keys(row, ["bytes", "mode", "path", "sha256"], f"bindings[{index}]")
        path = (ROOT / _nonempty_string(row["path"], f"bindings[{index}].path")).resolve()
        if path in seen:
            raise Invalid("duplicate binding path")
        seen.add(path)
        data = _read_regular(path)
        if len(data) != _uint(row["bytes"], f"bindings[{index}].bytes", positive=True):
            raise Invalid(f"binding byte mismatch: {path}")
        if _sha(data) != row["sha256"]:
            raise Invalid(f"binding hash mismatch: {path}")
        mode = stat.S_IMODE(path.stat().st_mode)
        if f"{mode:04o}" != row["mode"]:
            raise Invalid(f"binding mode mismatch: {path}")


def _load_contract() -> tuple[dict[str, Any], bytes]:
    contract, raw = _load_canonical(CONTRACT_PATH)
    _validate_contract(contract, raw)
    return contract, raw


def _request_for(contract: dict[str, Any], request_id: str) -> dict[str, Any]:
    regex = re.compile(contract["request"]["request_id_regex"])
    if not regex.fullmatch(request_id):
        raise Invalid("request_id does not match the frozen contract")
    return {
        "authority": {
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "subject_launch": False,
        },
        "launch_boundary": copy.deepcopy(contract["request"]["launch_boundary"]),
        "request_id": request_id,
        "required_capabilities": {field: True for field in contract["response"]["capability_fields"]},
        "required_response_schema_id": contract["response"]["schema_id"],
        "schema_id": contract["request"]["schema_id"],
        "source_bindings": copy.deepcopy(contract["bindings"]),
    }


def _validate_request(contract: dict[str, Any], request: dict[str, Any]) -> None:
    _exact_keys(request, contract["request"]["exact_top_level_fields"], "request")
    request_id = _nonempty_string(request["request_id"], "request.request_id")
    if request != _request_for(contract, request_id):
        raise Invalid("request does not exactly rederive from the contract")


def _validate_response_obj(contract: dict[str, Any], request: dict[str, Any], response: dict[str, Any]) -> None:
    spec = contract["response"]
    _exact_keys(response, spec["exact_top_level_fields"], "response")
    if response["schema_id"] != spec["schema_id"]:
        raise Invalid("response schema_id mismatch")
    if response["request_id"] != request["request_id"]:
        raise Invalid("response request_id mismatch")
    if not re.fullmatch(spec["timestamp_regex"], _nonempty_string(response["observed_at_utc"], "observed_at_utc")):
        raise Invalid("observed_at_utc format mismatch")
    _nonempty_string(response["windows_host_identity_nonsecret"], "windows_host_identity_nonsecret")
    sha_re = re.compile(spec["sha256_regex"])

    if response["authority"] != spec["exact_authority"]:
        raise Invalid("response authority must be exact zero-authority")

    calls = response["calls"]
    if not isinstance(calls, dict):
        raise Invalid("calls must be object")
    _exact_keys(calls, spec["exact_call_fields"], "calls")
    for field in spec["exact_call_fields"]:
        if _uint(calls[field], f"calls.{field}") != 0:
            raise Invalid(f"calls.{field} must be zero during handshake")

    capabilities = response["capabilities"]
    if not isinstance(capabilities, dict):
        raise Invalid("capabilities must be object")
    _exact_keys(capabilities, spec["capability_fields"], "capabilities")
    for field in spec["capability_fields"]:
        if _bool(capabilities[field], f"capabilities.{field}") is not True:
            raise Invalid(f"required capability unavailable: {field}")

    controller = response["controller"]
    if not isinstance(controller, dict):
        raise Invalid("controller must be object")
    _exact_keys(controller, spec["exact_controller_fields"], "controller")
    _nonempty_string(controller["controller_id"], "controller.controller_id")
    _nonempty_string(controller["version"], "controller.version")
    _sha256(controller["identity_sha256"], sha_re, "controller.identity_sha256")

    launch = response["launch"]
    if not isinstance(launch, dict):
        raise Invalid("launch must be object")
    _exact_keys(launch, spec["exact_launch_fields"], "launch")
    expected_launch = contract["request"]["launch_boundary"]
    if launch["argv"] != expected_launch["argv"] or launch["cwd"] != expected_launch["cwd"]:
        raise Invalid("launch argv/cwd mismatch")
    if launch["host"] != "WINDOWS" or launch["nas_mount"] != "P:\\":
        raise Invalid("launch host or NAS mount mismatch")
    if _bool(launch["existing_process_reused"], "launch.existing_process_reused") is not True:
        raise Invalid("existing Windows OMP process was not reused")
    if _bool(launch["duplicate_process_spawned"], "launch.duplicate_process_spawned") is not False:
        raise Invalid("duplicate OMP process was spawned")

    omp = response["omp"]
    if not isinstance(omp, dict):
        raise Invalid("omp must be object")
    _exact_keys(omp, spec["exact_omp_fields"], "omp")
    _nonempty_string(omp["executable_path_nonsecret"], "omp.executable_path_nonsecret")
    _sha256(omp["executable_sha256"], sha_re, "omp.executable_sha256")
    _uint(omp["executable_bytes"], "omp.executable_bytes", positive=True)
    _nonempty_string(omp["version"], "omp.version")
    if omp["build_or_commit"] is not None:
        _nonempty_string(omp["build_or_commit"], "omp.build_or_commit")
    if _bool(omp["binary_reopened"], "omp.binary_reopened") is not True:
        raise Invalid("OMP binary was not reopened for the declared identity")

    config = response["config"]
    if not isinstance(config, dict):
        raise Invalid("config must be object")
    _exact_keys(config, spec["exact_config_fields"], "config")
    _sha256(config["aggregate_sha256"], sha_re, "config.aggregate_sha256")
    layers = config["layers"]
    if not isinstance(layers, list) or not layers:
        raise Invalid("config.layers must be nonempty")
    layer_kinds: set[str] = set()
    for index, layer in enumerate(layers):
        if not isinstance(layer, dict):
            raise Invalid(f"config.layers[{index}] must be object")
        _exact_keys(layer, spec["config_layer_fields"], f"config.layers[{index}]")
        kind = _nonempty_string(layer["kind"], f"config.layers[{index}].kind")
        if kind in layer_kinds:
            raise Invalid("duplicate config layer kind")
        layer_kinds.add(kind)
        _nonempty_string(layer["path_nonsecret"], f"config.layers[{index}].path_nonsecret")
        present = _bool(layer["present"], f"config.layers[{index}].present")
        if present:
            _uint(layer["bytes"], f"config.layers[{index}].bytes", positive=True)
            _sha256(layer["sha256"], sha_re, f"config.layers[{index}].sha256")
        elif layer["bytes"] != 0 or layer["sha256"] is not None:
            raise Invalid("absent config layer must have bytes=0 and sha256=null")

    goal = response["goal"]
    if not isinstance(goal, dict):
        raise Invalid("goal must be object")
    _exact_keys(goal, spec["exact_goal_fields"], "goal")
    if goal["activation_surface"] not in spec["activation_surfaces"]:
        raise Invalid("unsupported native Goal activation surface")
    if _bool(goal["effective_goal_enabled"], "goal.effective_goal_enabled") is not True:
        raise Invalid("native Goal Mode is not enabled")
    continuation_modes = _string_list(goal["effective_goal_continuation_modes"], "goal.effective_goal_continuation_modes")
    if "interactive" in continuation_modes:
        raise Invalid("interactive Goal auto-continuation is not barred")
    tools = _string_list(goal["available_tool_ceiling"], "goal.available_tool_ceiling")
    if spec["goal_tool_required"] and "goal" not in tools:
        raise Invalid("native goal tool is unavailable")
    _sha256(goal["native_goal_mode_record_shape_sha256"], sha_re, "goal.native_goal_mode_record_shape_sha256")
    _sha256(
        goal["native_goal_completed_record_shape_sha256"],
        sha_re,
        "goal.native_goal_completed_record_shape_sha256",
    )
    route = goal["requested_effective_route_observation"]
    if not isinstance(route, dict):
        raise Invalid("requested_effective_route_observation must be object")
    _exact_keys(route, spec["exact_route_observation_fields"], "requested_effective_route_observation")
    for field in spec["exact_route_observation_fields"]:
        _bool(route[field], f"requested_effective_route_observation.{field}")
    for field in ("requested_provider", "requested_model", "requested_effort"):
        if route[field] is not True:
            raise Invalid(f"required requested route observation unavailable: {field}")

    session = response["session"]
    if not isinstance(session, dict):
        raise Invalid("session must be object")
    _exact_keys(session, spec["exact_session_fields"], "session")
    for field in spec["exact_session_fields"]:
        _nonempty_string(session[field], f"session.{field}")

    exchange = response["exchange"]
    if not isinstance(exchange, dict):
        raise Invalid("exchange must be object")
    _exact_keys(exchange, spec["exact_exchange_fields"], "exchange")
    if exchange != {
        "linux_relative_root": "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/omp_goal_mode_exchange_v1",
        "windows_root": "P:\\tests\\agent_packet_restrictions\\successor_20260813\\r9_control_plane_stabilization_v1\\omp_goal_mode_exchange_v1",
    }:
        raise Invalid("shared exchange root mismatch")


def _check_result(request_raw: bytes, response_raw: bytes) -> dict[str, Any]:
    return {
        "authority": {
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "subject_launch": False,
        },
        "first_mismatch": None,
        "request": {"bytes": len(request_raw), "sha256": _sha(request_raw)},
        "response": {"bytes": len(response_raw), "sha256": _sha(response_raw)},
        "schema_id": "pw-r9-omp-goal-mode-lane-handshake-check-v1",
        "status": "STRUCTURALLY_VALID_EXTERNAL_ATTESTATION_UNCORROBORATED_ZERO_CREDIT_NO_LAUNCH",
        "unresolved": [
            "Windows binary bytes are declared by the external controller and are not reopened by this Linux validator.",
            "Real lane admission requires a separate independent external-custody review.",
        ],
    }


def _valid_synthetic_response(contract: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    z = "0" * 64
    return {
        "authority": copy.deepcopy(contract["response"]["exact_authority"]),
        "calls": {field: 0 for field in contract["response"]["exact_call_fields"]},
        "capabilities": {field: True for field in contract["response"]["capability_fields"]},
        "config": {
            "aggregate_sha256": z,
            "layers": [
                {"bytes": 1, "kind": "synthetic", "path_nonsecret": "synthetic", "present": True, "sha256": z}
            ],
        },
        "controller": {"controller_id": "synthetic", "identity_sha256": z, "version": "synthetic"},
        "exchange": {
            "linux_relative_root": "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/omp_goal_mode_exchange_v1",
            "windows_root": "P:\\tests\\agent_packet_restrictions\\successor_20260813\\r9_control_plane_stabilization_v1\\omp_goal_mode_exchange_v1",
        },
        "goal": {
            "activation_surface": "TUI_NATIVE_GOAL",
            "available_tool_ceiling": ["goal"],
            "effective_goal_continuation_modes": [],
            "effective_goal_enabled": True,
            "native_goal_completed_record_shape_sha256": z,
            "native_goal_mode_record_shape_sha256": z,
            "requested_effective_route_observation": {
                "effective_effort": False,
                "effective_model": False,
                "effective_provider": False,
                "requested_effort": True,
                "requested_model": True,
                "requested_provider": True,
            },
        },
        "launch": {
            "argv": ["omp", "--cwd", "P:\\"],
            "cwd": "P:\\",
            "duplicate_process_spawned": False,
            "existing_process_reused": True,
            "host": "WINDOWS",
            "nas_mount": "P:\\",
        },
        "observed_at_utc": "2026-08-22T00:00:00Z",
        "omp": {
            "binary_reopened": True,
            "build_or_commit": None,
            "executable_bytes": 1,
            "executable_path_nonsecret": "synthetic",
            "executable_sha256": z,
            "version": "synthetic",
        },
        "request_id": request["request_id"],
        "schema_id": contract["response"]["schema_id"],
        "session": {
            "fresh_session_surface": "synthetic",
            "native_session_schema_version": "synthetic",
            "native_session_store_root_nonsecret": "synthetic",
        },
        "windows_host_identity_nonsecret": "synthetic",
    }


def _mutation_self_test(contract: dict[str, Any]) -> dict[str, Any]:
    request = _request_for(contract, "r9-omp-lane-handshake-999")
    valid = _valid_synthetic_response(contract, request)
    _validate_response_obj(contract, request, valid)
    mutations: list[tuple[str, Any]] = [
        ("duplicate_process", lambda x: x["launch"].__setitem__("duplicate_process_spawned", True)),
        ("new_process_call", lambda x: x["calls"].__setitem__("new_omp_processes", 1)),
        ("subject_call", lambda x: x["calls"].__setitem__("subject_calls", 1)),
        ("goal_disabled", lambda x: x["goal"].__setitem__("effective_goal_enabled", False)),
        ("interactive_continuation", lambda x: x["goal"].__setitem__("effective_goal_continuation_modes", ["interactive"])),
        ("missing_goal_tool", lambda x: x["goal"].__setitem__("available_tool_ceiling", [])),
        ("capability_false", lambda x: x["capabilities"].__setitem__("read_native_session_id", False)),
        ("wrong_launch", lambda x: x["launch"].__setitem__("cwd", "C:\\")),
        ("wrong_request", lambda x: x.__setitem__("request_id", "r9-omp-lane-handshake-998")),
        ("missing_requested_model", lambda x: x["goal"]["requested_effective_route_observation"].__setitem__("requested_model", False)),
        ("absent_layer_with_hash", lambda x: x["config"]["layers"][0].update({"present": False, "bytes": 0})),
        ("extra_field", lambda x: x.__setitem__("unexpected", True)),
    ]
    rejected: list[str] = []
    for name, mutate in mutations:
        candidate = copy.deepcopy(valid)
        mutate(candidate)
        try:
            _validate_response_obj(contract, request, candidate)
        except Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"mutation was accepted: {name}")
    return {
        "authority": {"canary_launch": False, "qualification_credit": 0, "subject_launch": False},
        "mutations_rejected": rejected,
        "schema_id": "pw-r9-omp-goal-mode-lane-handshake-mutation-self-test-v1",
        "status": "PASS_SYNTHETIC_ONLY_ZERO_CREDIT_NO_LANE_AUTHORITY",
        "workspace_writes": 0,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check-contract")
    emit = sub.add_parser("emit-request")
    emit.add_argument("--request-id", required=True)
    emit.add_argument("--output", required=True)
    check = sub.add_parser("check-response")
    check.add_argument("--request", required=True)
    check.add_argument("--response", required=True)
    check.add_argument("--receipt")
    sub.add_parser("mutation-self-test")
    args = parser.parse_args(argv)

    try:
        contract, contract_raw = _load_contract()
        if args.command == "check-contract":
            result = {
                "authority": {"canary_launch": False, "qualification_credit": 0, "subject_launch": False},
                "bindings": len(contract["bindings"]),
                "contract": {"bytes": len(contract_raw), "sha256": _sha(contract_raw)},
                "schema_id": "pw-r9-omp-goal-mode-lane-handshake-contract-check-v1",
                "status": "PASS_NO_SUBJECT_ZERO_CREDIT_NO_LAUNCH",
                "workspace_writes": 0,
            }
        elif args.command == "emit-request":
            request = _request_for(contract, args.request_id)
            data = _canonical(request)
            _write_create_only(Path(args.output), data)
            result = {
                "authority": {"canary_launch": False, "qualification_credit": 0, "subject_launch": False},
                "output": {"bytes": len(data), "path": str(Path(args.output)), "sha256": _sha(data)},
                "schema_id": "pw-r9-omp-goal-mode-lane-handshake-request-emission-v1",
                "status": "REQUEST_CREATED_NO_SUBJECT_ZERO_CREDIT_NO_LAUNCH",
                "workspace_writes": 1,
            }
        elif args.command == "check-response":
            request, request_raw = _load_canonical(Path(args.request))
            response, response_raw = _load_canonical(Path(args.response))
            _validate_request(contract, request)
            _validate_response_obj(contract, request, response)
            result = _check_result(request_raw, response_raw)
            if args.receipt:
                receipt_data = _canonical(result)
                _write_create_only(Path(args.receipt), receipt_data)
                result = {**result, "receipt": {"bytes": len(receipt_data), "sha256": _sha(receipt_data)}}
        else:
            result = _mutation_self_test(contract)
    except Invalid as exc:
        result = {
            "authority": {"canary_launch": False, "qualification_credit": 0, "subject_launch": False},
            "first_mismatch": str(exc),
            "schema_id": "pw-r9-omp-goal-mode-lane-handshake-check-v1",
            "status": "FAIL_CLOSED_ZERO_CREDIT_NO_LAUNCH",
        }
        sys.stdout.buffer.write(_canonical(result))
        return 1
    sys.stdout.buffer.write(_canonical(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
