#!/usr/bin/env python3
"""Standalone offline verifier for the R9 iteration-010 evidence contract.

The experiment-facing surface is deliberately one pure, read-only function:
``verify(run_root: pathlib.Path, expected: dict) -> dict``.  This module never
imports a controller, transport producer, simulator, or predecessor candidate.
"""
from __future__ import annotations

import hashlib as _hashlib
import json as _json
import os as _os
from pathlib import Path as _Path
from pathlib import PurePosixPath as _PurePosixPath
import re as _re
import stat as _stat
import subprocess as _subprocess
import sys as _sys
from typing import Any as _Any

_sys.dont_write_bytecode = True
__all__ = ["verify"]

_ROOT = _Path(__file__).resolve().parent
_SUCCESSOR = _ROOT.parents[1]
_REPO = _ROOT.parents[4]
_OPERATING = _SUCCESSOR / "r9_goal_operating_contract_v1.json"
_SUBJECT_TRANSPORT_ADDENDUM = _SUCCESSOR / "r9_subject_transport_addendum_subagent_invocations_v1.json"
_ROUTE_CAPABILITY_RECEIPT = _SUCCESSOR / "r9_subject_transport_subagent_route_capability_receipt_v1.json"
_ARCHITECTURE = _ROOT / "architecture_contract.json"
_SEMANTIC = _ROOT / "semantic_manifest.json"
_PIPELINE = _ROOT / "pipeline_contract.json"
_ROUTES = _ROOT / "routes.json"
_SCHEDULE = _ROOT / "schedule.json"
_SEMANTIC_RECEIPT = _ROOT / "semantic_inventory_receipt.json"
_RULE = "pw-r9-exact-input-frozen-artifact-v1"
_STAGES = (
    "S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A",
    "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C",
    "S60K", "S70", "S80", "S90",
)
_SAFE_NAME = _re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
_HEX64 = _re.compile(r"[0-9a-f]{64}\Z")
_TASK_NAME = _re.compile(r"[a-z][a-z0-9_]{0,127}\Z")
_FAILURE_TYPE = _re.compile(r"[A-Z][A-Z0-9_]{0,127}\Z")
_TRANSPORT_INSTRUCTION = (
    b"TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your first final response. "
    b"Do not use tools, files, browsing, network, memory, delegation, or other agents.\n\n"
)
_CELL_KEYS = {
    "index", "cell", "render_utf8", "render_utf8_sha256",
    "render_utf8_bytes", "expected_output", "expected_output_sha256",
    "expected_output_bytes", "dependency_gate",
    "expected_output_storage_sha256", "expected_output_storage_bytes",
}
_STAGE_KEYS = {
    "index", "stage", "rule", "predecessor_stages",
    "direct_subject_cells", "finalization_boundary", "expected_artifact",
    "expected_artifact_sha256", "expected_artifact_bytes",
    "expected_artifact_storage_sha256", "expected_artifact_storage_bytes",
}
_RUN_KEYS = {
    "schema_id", "operating_contract", "run_id", "run_kind", "mode",
    "scenario", "created_utc", "git_head", "custody_mode", "bundle",
    "semantic_manifest", "pipeline_contract", "subject_transport_addendum",
    "route_capability_receipt", "routes", "schedule",
    "route_count", "cells_per_route", "planned_call_count", "stage_count",
    "retry_count", "best_of", "replacement_count",
}
_ROW_KEYS = {
    "ordinal", "slot", "route", "index", "cell", "nonce", "invocation_id",
    "task_name", "expected_canonical_task_path",
}
_REF_KEYS = {"kind", "id", "path", "sha256", "bytes"}
_BINDING_KEYS = {"path", "sha256", "bytes"}
_CHECKS = (
    "expected_interface", "semantic_pipeline_bundle", "run_manifest",
    "custody", "exact_inventory", "causal_dependency_gates",
    "row_chains", "provider_bytes", "collaboration_terminals",
    "deterministic_scores", "stage_artifacts", "schedule_and_stop_rules",
    "path_terminals", "matrix_terminal", "accounting",
    "global_identity_and_nonce_freshness",
)

_SPAWN_REQUEST_FIELDS = {
    "schema_id", "run_id", "run_kind", "mode", "slot", "cell", "index", "ordinal",
    "nonce", "invocation_id", "task_name", "expected_canonical_task_path", "agent_type",
    "fork_turns", "model", "reasoning_effort", "packet_sha256", "packet_bytes",
    "message_utf8", "message_sha256", "message_bytes", "attempt_sha256", "attempt_bytes",
}
_SPAWN_RECEIPT_FIELDS = {
    "schema_id", "invocation_id", "spawn_request_sha256", "tool_result",
    "returned_identity_kind", "returned_canonical_task_path",
}
_TERMINAL_DELIVERY_FIELDS = {
    "schema_id", "invocation_id", "returned_canonical_task_path", "message_type",
    "final_utf8", "observed_activity", "terminal_status",
}
_FAILURE_EVENT_FIELDS = {"schema_id", "invocation_id", "phase", "failure_type", "detail"}
_ACTIVITY_FIELDS = {
    "tool_calls", "file_accesses", "browsing", "network_accesses", "delegations",
    "memory_accesses", "followup_turns", "nonterminal_messages", "observation_basis",
}


class _Invalid(RuntimeError):
    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail


def _fail(code: str, detail: str) -> None:
    raise _Invalid(code, detail)


def _canon(value: _Any) -> bytes:
    try:
        return _json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        _fail("NOT_CANONICAL_JSONABLE", str(exc))
    raise AssertionError("unreachable")


def _ordered(value: _Any) -> bytes:
    """Canonical minified bytes where the declared semantic key order matters."""
    try:
        return _json.dumps(
            value, ensure_ascii=False, allow_nan=False, separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        _fail("NOT_ORDERED_JSONABLE", str(exc))
    raise AssertionError("unreachable")


def _sha(data: bytes) -> str:
    return _hashlib.sha256(data).hexdigest()


def _pairs(pairs: list[tuple[str, _Any]]) -> dict[str, _Any]:
    result: dict[str, _Any] = {}
    for key, value in pairs:
        if key in result:
            _fail("DUPLICATE_JSON_KEY", key)
        result[key] = value
    return result


def _constant(value: str) -> _Any:
    _fail("NONFINITE_JSON_NUMBER", value)


def _integer(value: _Any, label: str, minimum: int | None = None) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        _fail("INTEGER_REQUIRED", label)
    if minimum is not None and value < minimum:
        _fail("INTEGER_RANGE", label)
    return value


def _boolean(value: _Any, label: str) -> bool:
    if not isinstance(value, bool):
        _fail("BOOLEAN_REQUIRED", label)
    return value


def _string(value: _Any, label: str, nonempty: bool = True) -> str:
    if not isinstance(value, str) or (nonempty and not value):
        _fail("STRING_REQUIRED", label)
    return value


def _name(value: _Any, label: str) -> str:
    text = _string(value, label)
    if not _SAFE_NAME.fullmatch(text):
        _fail("UNSAFE_NAME", label)
    return text


def _utf8(value: _Any, label: str) -> bytes:
    text = _string(value, label, False)
    try:
        return text.encode("utf-8")
    except UnicodeEncodeError as exc:
        _fail("INVALID_UTF8_STRING", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _exact_keys(value: _Any, keys: set[str], label: str) -> dict[str, _Any]:
    if not isinstance(value, dict):
        _fail("OBJECT_REQUIRED", label)
    if set(value) != keys:
        _fail(
            "OBJECT_SHAPE_MISMATCH",
            f"{label}: missing={sorted(keys - set(value))}, extra={sorted(set(value) - keys)}",
        )
    return value


def _safe_relative(value: _Any, label: str) -> _PurePosixPath:
    text = _string(value, label)
    if "\\" in text:
        _fail("UNSAFE_RELATIVE_PATH", label)
    pure = _PurePosixPath(text)
    if pure.is_absolute() or pure.as_posix() != text or any(
        part in {"", ".", ".."} for part in pure.parts
    ):
        _fail("UNSAFE_RELATIVE_PATH", label)
    return pure


def _lstat(path: _Path, label: str) -> _os.stat_result:
    try:
        return _os.lstat(path)
    except (FileNotFoundError, NotADirectoryError):
        _fail("MISSING_PATH", f"{label}: {path}")
    except OSError as exc:
        _fail("PATH_READ_ERROR", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _regular(path: _Path, label: str) -> bytes:
    info = _lstat(path, label)
    if not _stat.S_ISREG(info.st_mode):
        _fail("NOT_REGULAR_NONLINK", f"{label}: {path}")
    try:
        return path.read_bytes()
    except OSError as exc:
        _fail("FILE_READ_ERROR", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _directory(path: _Path, label: str) -> None:
    if not _stat.S_ISDIR(_lstat(path, label).st_mode):
        _fail("NOT_DIRECTORY_NONLINK", f"{label}: {path}")


def _entries(path: _Path, label: str) -> dict[str, bool]:
    _directory(path, label)
    result: dict[str, bool] = {}
    try:
        entries = list(_os.scandir(path))
    except OSError as exc:
        _fail("DIRECTORY_READ_ERROR", f"{label}: {exc}")
    for entry in entries:
        if entry.name in result:
            _fail("DUPLICATE_DIRECTORY_ENTRY", f"{label}: {entry.name}")
        try:
            if entry.is_symlink():
                _fail("SYMLINK_FORBIDDEN", f"{label}: {entry.name}")
            if entry.is_dir(follow_symlinks=False):
                result[entry.name] = True
            elif entry.is_file(follow_symlinks=False):
                result[entry.name] = False
            else:
                _fail("SPECIAL_PATH_FORBIDDEN", f"{label}: {entry.name}")
        except OSError as exc:
            _fail("PATH_READ_ERROR", f"{label}/{entry.name}: {exc}")
    return result


def _json_object(
    path: _Path, label: str, *, canonical: bool,
) -> tuple[bytes, dict[str, _Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        _fail("JSON_STORAGE_FORMAT", f"{label}: one terminal LF and no CR required")
    try:
        value = _json.loads(
            storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=_constant,
        )
    except (UnicodeDecodeError, _json.JSONDecodeError) as exc:
        _fail("INVALID_JSON", f"{label}: {exc}")
    if not isinstance(value, dict):
        _fail("JSON_OBJECT_REQUIRED", label)
    if canonical and storage != _canon(value) + b"\n":
        _fail("NONCANONICAL_JSON", label)
    return storage, value


def _binding(path: _Path, storage: bytes, base: _Path = _SUCCESSOR) -> dict[str, _Any]:
    try:
        relative = path.relative_to(base).as_posix()
    except ValueError:
        _fail("BINDING_OUTSIDE_BASE", str(path))
    return {"path": relative, "sha256": _sha(storage), "bytes": len(storage)}


def _binding_shape(value: _Any, label: str) -> dict[str, _Any]:
    result = _exact_keys(value, _BINDING_KEYS, label)
    _safe_relative(result.get("path"), f"{label}.path")
    digest = _string(result.get("sha256"), f"{label}.sha256")
    if not _HEX64.fullmatch(digest):
        _fail("BINDING_HASH_FORMAT", label)
    _integer(result.get("bytes"), f"{label}.bytes", 0)
    return result


def _manifest_source(pure: _PurePosixPath) -> bytes:
    path = _SUCCESSOR
    for part in pure.parts[:-1]:
        path = path / part
        _directory(path, f"semantic source parent {pure}")
    return _regular(_SUCCESSOR.joinpath(*pure.parts), f"semantic source {pure}")


def _validate_route(value: _Any, label: str) -> dict[str, str]:
    route = _exact_keys(value, {"slot", "model", "thinking"}, label)
    return {
        "slot": _name(route.get("slot"), f"{label}.slot"),
        "model": _name(route.get("model"), f"{label}.model"),
        "thinking": _name(route.get("thinking"), f"{label}.thinking"),
    }


def _load_semantic() -> dict[str, _Any]:
    operating_bytes, operating = _json_object(_OPERATING, "operating contract", canonical=False)
    if operating.get("schema_id") != "pw-r9-goal-operating-contract-v1":
        _fail("OPERATING_SCHEMA_MISMATCH", str(operating.get("schema_id")))

    architecture_bytes, architecture = _json_object(
        _ARCHITECTURE, "architecture contract", canonical=False,
    )
    addendum_bytes, addendum = _json_object(
        _SUBJECT_TRANSPORT_ADDENDUM, "subject transport addendum", canonical=False,
    )
    capability_bytes, capability = _json_object(
        _ROUTE_CAPABILITY_RECEIPT, "route capability receipt", canonical=False,
    )
    if architecture.get("schema_id") != "pw-r9-minimal-controller-architecture-v2":
        _fail("ARCHITECTURE_SCHEMA_MISMATCH", str(architecture.get("schema_id")))
    if addendum.get("schema_id") != "pw-r9-subject-transport-addendum-v1":
        _fail("SUBJECT_TRANSPORT_ADDENDUM_SCHEMA_MISMATCH", str(addendum.get("schema_id")))
    if capability.get("schema_id") != "pw-r9-subagent-route-capability-receipt-v1":
        _fail("ROUTE_CAPABILITY_SCHEMA_MISMATCH", str(capability.get("schema_id")))
    lineage = architecture.get("lineage")
    if not isinstance(lineage, dict) or lineage.get("prior_controller_runtime_imported") is not False:
        _fail("ARCHITECTURE_LINEAGE_MISMATCH", "lineage/prior runtime import")
    lineage_targets = {
        "operating_contract": (_OPERATING, operating_bytes),
        "subject_transport_addendum": (_SUBJECT_TRANSPORT_ADDENDUM, addendum_bytes),
        "subagent_route_capability": (_ROUTE_CAPABILITY_RECEIPT, capability_bytes),
    }
    for key, (path, storage) in lineage_targets.items():
        raw_binding = lineage.get(key)
        if key == "subagent_route_capability":
            binding = _exact_keys(
                raw_binding,
                _BINDING_KEYS | {"empirical_subject_invocations", "qualification_credit"},
                f"architecture.lineage.{key}",
            )
            if (
                _integer(binding.get("empirical_subject_invocations"),
                         f"architecture.lineage.{key}.empirical_subject_invocations", 0),
                _integer(binding.get("qualification_credit"),
                         f"architecture.lineage.{key}.qualification_credit", 0),
            ) != (0, 0):
                _fail("ARCHITECTURE_CAPABILITY_CREDIT_NONZERO", key)
            _safe_relative(binding.get("path"), f"architecture.lineage.{key}.path")
            if not _HEX64.fullmatch(
                _string(binding.get("sha256"), f"architecture.lineage.{key}.sha256")
            ):
                _fail("BINDING_HASH_FORMAT", f"architecture.lineage.{key}")
            _integer(binding.get("bytes"), f"architecture.lineage.{key}.bytes", 0)
        else:
            binding = _binding_shape(raw_binding, f"architecture.lineage.{key}")
        wanted = _binding(path, storage, _REPO)
        if (binding["path"], binding["sha256"], binding["bytes"]) != (
            wanted["path"], wanted["sha256"], wanted["bytes"],
        ):
            _fail("ARCHITECTURE_TRANSPORT_LINEAGE_DRIFT", key)

    transport = architecture.get("subject_transport")
    if not isinstance(transport, dict) or (
        transport.get("schema_id"), transport.get("authority"),
        transport.get("public_controller_commands"),
    ) != (
        "pw-r9-collaboration-subagent-transport-contract-v1",
        _SUBJECT_TRANSPORT_ADDENDUM.relative_to(_REPO).as_posix(),
        ["simulate", "run-canary", "run-matrix", "reopen"],
    ):
        _fail("ARCHITECTURE_SUBAGENT_TRANSPORT_MISMATCH", "public transport")
    dispatcher = transport.get("dispatcher")
    if not isinstance(dispatcher, dict) or (
        dispatcher.get("tool"), dispatcher.get("agent_type"), dispatcher.get("fork_turns"),
        dispatcher.get("one_new_subagent_per_row"),
        dispatcher.get("exact_model_and_reasoning_effort_from_frozen_route"),
        dispatcher.get("retry_count"), dispatcher.get("best_of"),
        dispatcher.get("replacement_count"),
    ) != ("collaboration.spawn_agent", "default", "none", True, True, 0, False, 0):
        _fail("ARCHITECTURE_DISPATCHER_MISMATCH", "dispatcher")
    for key in ("followup_task", "send_message", "reuse", "interrupt_and_replace"):
        if dispatcher.get(key) is not False:
            _fail("ARCHITECTURE_DISPATCHER_MISMATCH", key)
    provider_message = transport.get("provider_message")
    instruction_text = _TRANSPORT_INSTRUCTION.decode("utf-8")
    if not isinstance(provider_message, dict) or (
        provider_message.get("instruction_utf8"), provider_message.get("instruction_sha256"),
        provider_message.get("instruction_bytes"), len(_TRANSPORT_INSTRUCTION),
    ) != (instruction_text, _sha(_TRANSPORT_INSTRUCTION), len(_TRANSPORT_INSTRUCTION), 174):
        _fail("ARCHITECTURE_TRANSPORT_INSTRUCTION_MISMATCH", "provider_message")
    spawn_contract = transport.get("spawn_request")
    root_events = transport.get("root_events")
    if not isinstance(spawn_contract, dict) or (
        spawn_contract.get("schema_id") != "pw-r9-subagent-spawn-request-v1"
        or set(spawn_contract.get("exact_fields", [])) != _SPAWN_REQUEST_FIELDS
    ):
        _fail("ARCHITECTURE_SPAWN_REQUEST_CONTRACT_MISMATCH", "spawn_request")
    if not isinstance(root_events, dict) or (
        root_events.get("spawn_receipt_schema") != "pw-r9-subagent-spawn-receipt-event-v1"
        or root_events.get("terminal_delivery_schema") != "pw-r9-subagent-terminal-delivery-event-v1"
        or root_events.get("failure_schema") != "pw-r9-subagent-transport-failure-event-v1"
        or set(root_events.get("spawn_receipt_required_fields", [])) != _SPAWN_RECEIPT_FIELDS
        or set(root_events.get("terminal_delivery_required_fields", [])) != _TERMINAL_DELIVERY_FIELDS
        or set(root_events.get("observed_activity_exact_fields", [])) != _ACTIVITY_FIELDS
        or root_events.get("accepted_message_type") != "FINAL_ANSWER"
        or root_events.get("accepted_terminal_status") != "FINAL_RETURNED"
    ):
        _fail("ARCHITECTURE_ROOT_EVENT_CONTRACT_MISMATCH", "root_events")
    addendum_transport = addendum.get("subject_transport")
    if not isinstance(addendum_transport, dict) or (
        addendum_transport.get("kind"), addendum_transport.get("fork_turns"),
        addendum_transport.get("reuse_or_followup"),
        addendum_transport.get("minimal_transport_instruction_utf8"),
        addendum_transport.get("minimal_transport_instruction_sha256"),
        addendum_transport.get("minimal_transport_instruction_bytes"),
    ) != (
        "COLLABORATION_SUBAGENT_INVOCATION", "none", False, instruction_text,
        _sha(_TRANSPORT_INSTRUCTION), len(_TRANSPORT_INSTRUCTION),
    ):
        _fail("SUBJECT_TRANSPORT_ADDENDUM_MISMATCH", "subject_transport")
    capability_addendum = _binding_shape(
        capability.get("transport_addendum"), "route capability transport_addendum",
    )
    wanted_capability_addendum = _binding(
        _SUBJECT_TRANSPORT_ADDENDUM, addendum_bytes, _REPO,
    )
    if capability_addendum != wanted_capability_addendum:
        _fail("ROUTE_CAPABILITY_ADDENDUM_BINDING_DRIFT", "transport_addendum")
    if capability.get("status") != (
        "PASS_REQUESTED_COLLABORATION_ROUTE_OVERRIDES_ACCEPTED_"
        "NON_EMPIRICAL_ZERO_CREDIT"
    ):
        _fail("ROUTE_CAPABILITY_STATUS_MISMATCH", str(capability.get("status")))
    if capability.get("adjudication") != {
        "exact_roster_requestable": True,
        "silent_substitution_used": False,
        "gpt_5_4_mini_xhigh_request_accepted": True,
        "gpt_5_4_mini_medium_request_accepted": True,
        "gpt_5_6_luna_medium_request_accepted": True,
        "effective_provider_model_or_effort_independently_attested": False,
        "effective_provider_attestation_disposition":
            "NAMED_TRUSTED_COLLABORATION_PLATFORM_RESIDUAL",
        "capability_blocker_closed": True,
        "subject_launch_authorized": False,
    }:
        _fail("ROUTE_CAPABILITY_ADJUDICATION_MISMATCH", "adjudication")
    if capability.get("calls") != {
        "non_empirical_helper_model_invocations": 3,
        "empirical_subject_invocations": 0,
        "frozen_test_packets_presented": 0,
        "qualification_credit": 0,
    }:
        _fail("ROUTE_CAPABILITY_ZERO_CREDIT_MISMATCH", "calls")

    semantic_bytes, semantic = _json_object(_SEMANTIC, "semantic manifest", canonical=False)
    if semantic_bytes != _ordered(semantic) + b"\n":
        _fail("NONCANONICAL_ORDERED_JSON", "semantic manifest")
    _exact_keys(
        semantic,
        {"schema_id", "routes", "schedule", "canary_cell", "stage_order",
         "cells", "deterministic_stages", "files"},
        "semantic manifest",
    )
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v2":
        _fail("SEMANTIC_SCHEMA_MISMATCH", str(semantic.get("schema_id")))

    raw_routes = semantic.get("routes")
    if not isinstance(raw_routes, list) or len(raw_routes) != 3:
        _fail("ROUTE_COUNT_MISMATCH", "exactly three routes required")
    routes = [_validate_route(value, f"routes[{index}]") for index, value in enumerate(raw_routes)]
    slots = [route["slot"] for route in routes]
    if len(set(slots)) != 3:
        _fail("DUPLICATE_ROUTE_SLOT", str(slots))
    expected_roster = [
        {"slot": route["slot"], "model": route["model"],
         "reasoning_effort": route["thinking"]}
        for route in routes
    ]
    if addendum.get("frozen_roster") != expected_roster:
        _fail("SUBJECT_TRANSPORT_ROUTE_ROSTER_DRIFT", "frozen_roster")
    invocations = capability.get("invocations")
    if not isinstance(invocations, list) or len(invocations) != len(routes):
        _fail("ROUTE_CAPABILITY_INVOCATION_COUNT", "invocations")
    capability_names: set[str] = set()
    for sequence, (invocation, route) in enumerate(zip(invocations, routes), 1):
        invocation = _exact_keys(invocation, {
            "sequence", "task_name", "canonical_task_path", "agent_type",
            "fork_turns", "requested_model", "requested_reasoning_effort",
            "request_message_sha256", "request_message_bytes",
            "terminal_message_type", "terminal_utf8", "terminal_sha256",
            "terminal_bytes", "result",
        }, f"capability invocation {sequence}")
        _integer(
            invocation.get("sequence"),
            f"capability invocation {sequence}.sequence", 1,
        )
        if (
            invocation.get("sequence"), invocation.get("agent_type"),
            invocation.get("fork_turns"), invocation.get("requested_model"),
            invocation.get("requested_reasoning_effort"),
            invocation.get("terminal_message_type"), invocation.get("result"),
        ) != (
            sequence, "default", "none", route["model"], route["thinking"],
            "FINAL_ANSWER", "PASS_REQUEST_ACCEPTED_AND_TERMINAL_RETURNED",
        ):
            _fail("ROUTE_CAPABILITY_ROSTER_DRIFT", str(sequence))
        task_name = _string(invocation.get("task_name"), f"capability invocation {sequence}.task_name")
        terminal_utf8 = _utf8(
            invocation.get("terminal_utf8"),
            f"capability invocation {sequence}.terminal_utf8",
        )
        request_digest = _string(
            invocation.get("request_message_sha256"),
            f"capability invocation {sequence}.request_message_sha256",
        )
        if (
            not _TASK_NAME.fullmatch(task_name)
            or task_name in capability_names
            or invocation.get("canonical_task_path") != f"/root/{task_name}"
            or not _HEX64.fullmatch(request_digest)
            or _integer(
                invocation.get("request_message_bytes"),
                f"capability invocation {sequence}.request_message_bytes", 1,
            ) != invocation["request_message_bytes"]
            or invocation.get("terminal_sha256") != _sha(terminal_utf8)
            or _integer(
                invocation.get("terminal_bytes"),
                f"capability invocation {sequence}.terminal_bytes", 1,
            ) != len(terminal_utf8)
        ):
            _fail("ROUTE_CAPABILITY_INVOCATION_BINDING_DRIFT", str(sequence))
        capability_names.add(task_name)

    raw_schedule = semantic.get("schedule")
    if not isinstance(raw_schedule, list) or len(raw_schedule) != 97:
        _fail("SEMANTIC_SCHEDULE_COUNT", "exactly 97 cells required")
    schedule = [_name(value, f"schedule[{index}]") for index, value in enumerate(raw_schedule)]
    if len(set(schedule)) != 97:
        _fail("DUPLICATE_CELL", "semantic schedule")
    canary = _name(semantic.get("canary_cell"), "canary_cell")
    if canary not in schedule:
        _fail("CANARY_CELL_MISSING", canary)

    raw_stage_order = semantic.get("stage_order")
    if raw_stage_order != list(_STAGES):
        _fail("STAGE_ORDER_MISMATCH", str(raw_stage_order))

    raw_cells = semantic.get("cells")
    if not isinstance(raw_cells, list) or len(raw_cells) != 97:
        _fail("CELL_COUNT_MISMATCH", "semantic cells")
    cells: list[dict[str, _Any]] = []
    cells_by_name: dict[str, dict[str, _Any]] = {}
    for index, raw in enumerate(raw_cells):
        cell = _exact_keys(raw, _CELL_KEYS, f"cells[{index}]")
        if (cell.get("index"), cell.get("cell")) != (index, schedule[index]):
            _fail("CELL_ORDER_MISMATCH", str(index))
        render = _utf8(cell.get("render_utf8"), f"cells[{index}].render_utf8")
        if not render.endswith(b"\n") or render.endswith(b"\n\n") or b"\r" in render:
            _fail("RENDER_STORAGE_FORMAT", str(index))
        payload = render[:-1]
        expected_payload = _ordered(cell.get("expected_output"))
        expected_storage = expected_payload + b"\n"
        if (
            cell.get("render_utf8_sha256"), cell.get("render_utf8_bytes"),
            cell.get("expected_output_sha256"), cell.get("expected_output_bytes"),
            cell.get("expected_output_storage_sha256"),
            cell.get("expected_output_storage_bytes"),
        ) != (
            _sha(render), len(render), _sha(expected_payload), len(expected_payload),
            _sha(expected_storage), len(expected_storage),
        ):
            _fail("CELL_BYTE_BINDING_DRIFT", str(index))
        gate = _exact_keys(
            cell.get("dependency_gate"),
            {"rule", "required_pass_cells", "required_stage_artifacts"},
            f"cells[{index}].dependency_gate",
        )
        if gate.get("rule") != _RULE:
            _fail("CELL_GATE_RULE_MISMATCH", str(index))
        for key in ("required_pass_cells", "required_stage_artifacts"):
            if not isinstance(gate.get(key), list):
                _fail("CELL_GATE_LIST_REQUIRED", f"{index}:{key}")
            if len(gate[key]) != len(set(gate[key])):
                _fail("CELL_GATE_DUPLICATE_REF", f"{index}:{key}")
        cells.append(cell)
        cells_by_name[cell["cell"]] = cell

    raw_stages = semantic.get("deterministic_stages")
    if not isinstance(raw_stages, list) or len(raw_stages) != 18:
        _fail("DETERMINISTIC_STAGE_COUNT", "exactly 18 required")
    stages: list[dict[str, _Any]] = []
    stages_by_name: dict[str, dict[str, _Any]] = {}
    for index, raw in enumerate(raw_stages):
        stage = _exact_keys(raw, _STAGE_KEYS, f"deterministic_stages[{index}]")
        if (stage.get("index"), stage.get("stage"), stage.get("rule")) != (
            index, _STAGES[index], _RULE,
        ):
            _fail("STAGE_IDENTITY_MISMATCH", str(index))
        predecessors = stage.get("predecessor_stages")
        direct = stage.get("direct_subject_cells")
        if not isinstance(predecessors, list) or not isinstance(direct, list):
            _fail("STAGE_INPUT_LIST_REQUIRED", str(index))
        if len(predecessors) != len(set(predecessors)) or len(direct) != len(set(direct)):
            _fail("STAGE_DUPLICATE_INPUT", str(index))
        if any(value not in _STAGES[:index] for value in predecessors):
            _fail("STAGE_PREDECESSOR_ORDER", str(index))
        if any(value not in cells_by_name for value in direct):
            _fail("STAGE_UNKNOWN_DIRECT_CELL", str(index))
        boundary = _exact_keys(
            stage.get("finalization_boundary"),
            {"after_cell_index", "after_cell", "stage_order_index"},
            f"stage[{index}].finalization_boundary",
        )
        boundary_index = _integer(boundary.get("after_cell_index"), f"stage[{index}].boundary", 0)
        if (
            boundary_index >= len(cells)
            or boundary.get("after_cell") != schedule[boundary_index]
            or boundary.get("stage_order_index") != index
            or any(cells_by_name[value]["index"] > boundary_index for value in direct)
        ):
            _fail("STAGE_BOUNDARY_MISMATCH", str(index))
        payload = _ordered(stage.get("expected_artifact"))
        storage = payload + b"\n"
        if (
            stage.get("expected_artifact_sha256"), stage.get("expected_artifact_bytes"),
            stage.get("expected_artifact_storage_sha256"),
            stage.get("expected_artifact_storage_bytes"),
        ) != (_sha(payload), len(payload), _sha(storage), len(storage)):
            _fail("STAGE_ARTIFACT_BINDING_DRIFT", str(index))
        stages.append(stage)
        stages_by_name[stage["stage"]] = stage

    for cell in cells:
        gate = cell["dependency_gate"]
        index = cell["index"]
        if any(value not in cells_by_name or cells_by_name[value]["index"] >= index
               for value in gate["required_pass_cells"]):
            _fail("CELL_GATE_NONPRIOR_CELL", cell["cell"])
        for stage_name in gate["required_stage_artifacts"]:
            stage = stages_by_name.get(stage_name)
            if stage is None or stage["finalization_boundary"]["after_cell_index"] >= index:
                _fail("CELL_GATE_INELIGIBLE_STAGE", f"{cell['cell']}:{stage_name}")

    files = semantic.get("files")
    if not isinstance(files, list) or not files:
        _fail("SEMANTIC_FILE_INVENTORY_MISSING", "files")
    paths: list[str] = []
    for index, raw in enumerate(files):
        binding = _binding_shape(raw, f"semantic files[{index}]")
        pure = _safe_relative(binding["path"], f"semantic files[{index}].path")
        lowered = pure.as_posix().lower()
        if (
            pure.parts[0] == "Plans"
            or "__pycache__" in pure.parts
            or lowered.endswith((".pyc", ".pyo"))
            or _re.search(r"candidate_v(?:1[2-9]|2[01])(?:/|$)", lowered)
        ):
            _fail("FORBIDDEN_SEMANTIC_SOURCE", pure.as_posix())
        data = _manifest_source(pure)
        if (binding["sha256"], binding["bytes"]) != (_sha(data), len(data)):
            _fail("SEMANTIC_SOURCE_BINDING_DRIFT", pure.as_posix())
        paths.append(pure.as_posix())
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        _fail("SEMANTIC_SOURCE_ORDER", "paths must be sorted and unique")

    routes_bytes, routes_file = _json_object(_ROUTES, "routes artifact", canonical=False)
    if routes_bytes != _ordered(routes_file) + b"\n":
        _fail("NONCANONICAL_ORDERED_JSON", "routes artifact")
    if routes_file != {"schema_id": "pw-r9-routes-v1", "routes": routes}:
        _fail("ROUTES_CONTENT_MISMATCH", "routes.json")
    schedule_bytes, schedule_file = _json_object(_SCHEDULE, "schedule artifact", canonical=False)
    if schedule_bytes != _ordered(schedule_file) + b"\n":
        _fail("NONCANONICAL_ORDERED_JSON", "schedule artifact")
    exact_entries = [
        {"index": ordinal, "slot_index": slot_index, "cell_index": cell_index,
         "slot": route["slot"], "model": route["model"],
         "thinking": route["thinking"], "cell": schedule[cell_index]}
        for ordinal, (slot_index, route, cell_index) in enumerate(
            (slot_index, route, cell_index)
            for slot_index, route in enumerate(routes)
            for cell_index in range(len(schedule))
        )
    ]
    if (
        schedule_file.get("schema_id"), schedule_file.get("order"),
        schedule_file.get("route_count"), schedule_file.get("cells_per_route"),
        schedule_file.get("entry_count"), schedule_file.get("entries"),
    ) != ("pw-r9-slot-major-schedule-v1", "slot-major", 3, 97, 291, exact_entries):
        _fail("SCHEDULE_CONTENT_MISMATCH", "schedule.json")
    nonce_rule = schedule_file.get("run_specific_nonce_rule")
    if not isinstance(nonce_rule, dict) or (
        nonce_rule.get("predeclared_in_run_manifest"),
        nonce_rule.get("semantic_manifest_contains_run_specific_nonce"),
    ) != (True, False):
        _fail("SCHEDULE_NONCE_RULE_MISMATCH", "schedule.json")

    pipeline_bytes, pipeline = _json_object(_PIPELINE, "pipeline contract", canonical=False)
    if pipeline.get("schema_id") != "pw-r9-semantic-pipeline-contract-v1":
        _fail("PIPELINE_SCHEMA_MISMATCH", str(pipeline.get("schema_id")))
    if pipeline.get("rule", {}).get("id") != _RULE:
        _fail("PIPELINE_RULE_MISMATCH", "rule.id")
    contract = pipeline.get("manifest_contract")
    if not isinstance(contract, dict) or (
        contract.get("schema_id"), contract.get("route_count"),
        contract.get("cell_count"), contract.get("schedule_entry_count"),
        contract.get("deterministic_stage_count"),
        contract.get("route_local_stage_artifact_count"),
        contract.get("stage_order_is_total"), contract.get("canary_cell"),
        contract.get("canary_dependency_gate_is_empty"),
        contract.get("render_bytes_are_frozen_not_runtime_interpolated"),
        contract.get("expected_outputs_are_exact_closed_oracles"),
        contract.get("runtime_prior_control_imports"),
    ) != (
        "pw-r9-semantic-manifest-v2", 3, 97, 291, 18, 54, True, canary,
        True, True, True, 0,
    ):
        _fail("PIPELINE_MANIFEST_CONTRACT_MISMATCH", "manifest_contract")
    execution_requirements = pipeline.get("execution_requirements")
    if not isinstance(execution_requirements, dict):
        _fail("PIPELINE_EXECUTION_REQUIREMENTS_MISSING", "execution_requirements")
    exact_execution_fields = {
        "schedule_order",
        "one_fresh_isolated_subagent_invocation_per_subject_row",
        "predeclared_unique_nonce_per_schedule_row",
        "attempt_created_before_dispatch", "raw_result_persisted_before_score",
        "completion_written_last", "stage_artifact_written_only_after_input_reopen",
        "independent_reopen_replays_all_cell_and_stage_gates",
        "no_post_fail_same_slot_dispatch", "no_post_invalid_dispatch",
        "frozen_route_mapping",
    }
    route_mapping = {
        "frozen_route_key": "thinking",
        "collaboration_request_key": "reasoning_effort",
        "rule": (
            "For every frozen routes.json row, pass thinking unchanged as "
            "collaboration.spawn_agent reasoning_effort; no substitution or "
            "fabricated identity is allowed."
        ),
    }
    if (
        set(execution_requirements) != exact_execution_fields
        or execution_requirements.get(
            "one_fresh_isolated_subagent_invocation_per_subject_row"
        ) is not True
        or execution_requirements.get("schedule_order")
        != "exact slot-major schedule.json order"
        or execution_requirements.get("frozen_route_mapping") != route_mapping
        or any(
            execution_requirements.get(key) is not True
            for key in exact_execution_fields - {"schedule_order", "frozen_route_mapping"}
        )
    ):
        _fail("PIPELINE_SUBAGENT_FRESHNESS_RULE_MISMATCH", "execution_requirements")
    if execution_requirements.get("no_post_fail_same_slot_dispatch") is not True:
        _fail("PIPELINE_STOP_RULE_MISSING", "no_post_fail_same_slot_dispatch")
    if execution_requirements.get("no_post_invalid_dispatch") is not True:
        _fail("PIPELINE_STOP_RULE_MISSING", "no_post_invalid_dispatch")
    pipeline_bindings = pipeline.get("bindings")
    if not isinstance(pipeline_bindings, dict):
        _fail("PIPELINE_BINDINGS_MISSING", "bindings")
    binding_targets = {
        "r9_goal_operating_contract": (_OPERATING, _OPERATING.relative_to(_REPO).as_posix()),
        "parent_progress_assessment": (
            _ROOT.parent / "iteration_001" / "progress_assessment.json",
            (_ROOT.parent / "iteration_001" / "progress_assessment.json").relative_to(_REPO).as_posix(),
        ),
        "causal_pipeline_diagnosis": (
            _ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json",
            (_ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json").relative_to(_REPO).as_posix(),
        ),
        "semantic_manifest": (_SEMANTIC, "semantic_manifest.json"),
        "schedule": (_SCHEDULE, "schedule.json"),
        "routes": (_ROUTES, "routes.json"),
    }
    if set(pipeline_bindings) != set(binding_targets):
        _fail("PIPELINE_BINDING_SET_MISMATCH", str(sorted(pipeline_bindings)))
    for key, (path, expected_path) in binding_targets.items():
        data = _regular(path, f"pipeline binding {key}")
        binding = _binding_shape(pipeline_bindings[key], f"pipeline.bindings.{key}")
        if (
            binding["path"], binding["sha256"], binding["bytes"]
        ) != (expected_path, _sha(data), len(data)):
            _fail("PIPELINE_BINDING_DRIFT", key)

    receipt_bytes, receipt = _json_object(
        _SEMANTIC_RECEIPT, "semantic inventory receipt", canonical=False,
    )
    if receipt.get("schema_id") != "pw-r9-semantic-inventory-receipt-v3":
        _fail("SEMANTIC_RECEIPT_SCHEMA_MISMATCH", str(receipt.get("schema_id")))
    if receipt.get("status") != "DATA_ONLY_CONCRETE_PROJECTIONS_NO_RESULT_AUTHORITY":
        _fail("SEMANTIC_RECEIPT_AUTHORITY_MISMATCH", str(receipt.get("status")))
    receipt_calls = _exact_keys(
        receipt.get("calls"), {"model", "network", "provider", "subject"},
        "semantic inventory receipt calls",
    )
    for key in sorted(receipt_calls):
        if _integer(receipt_calls[key], f"semantic inventory receipt calls.{key}") != 0:
            _fail("SEMANTIC_RECEIPT_CALLS_NONZERO", key)
    receipt_verification = receipt.get("verification")
    if not isinstance(receipt_verification, dict):
        _fail("SEMANTIC_RECEIPT_VERIFICATION_MISSING", "verification")
    if receipt_verification.get("empirical_evidence_claimed") is not False:
        _fail("SEMANTIC_RECEIPT_EMPIRICAL_AUTHORITY", "empirical_evidence_claimed")
    if receipt_verification.get("counterfactual_evaluator_external_to_receipt") is not True:
        _fail("SEMANTIC_RECEIPT_EVALUATOR_AUTHORITY", "counterfactual_evaluator_external_to_receipt")
    for key in (
        "independent_observed_results_stored_in_receipt",
        "receipt_authored_counterfactual_pass_checks",
    ):
        if _integer(receipt_verification.get(key), f"semantic inventory receipt verification.{key}") != 0:
            _fail("SEMANTIC_RECEIPT_RESULT_AUTHORITY", key)
    for key in ("model_calls", "network_calls", "provider_calls", "subject_calls"):
        if _integer(receipt_verification.get(key), f"semantic inventory receipt verification.{key}") != 0:
            _fail("SEMANTIC_RECEIPT_CALLS_NONZERO", key)
    artifacts = receipt.get("artifacts")
    if not isinstance(artifacts, dict):
        _fail("SEMANTIC_RECEIPT_ARTIFACTS_MISSING", "artifacts")
    expected_artifacts = {
        "semantic_manifest.json": {"path": "semantic_manifest.json", "sha256": _sha(semantic_bytes), "bytes": len(semantic_bytes)},
        "pipeline_contract.json": {"path": "pipeline_contract.json", "sha256": _sha(pipeline_bytes), "bytes": len(pipeline_bytes)},
        "schedule.json": {"path": "schedule.json", "sha256": _sha(schedule_bytes), "bytes": len(schedule_bytes)},
        "routes.json": {"path": "routes.json", "sha256": _sha(routes_bytes), "bytes": len(routes_bytes)},
    }
    if artifacts != expected_artifacts:
        _fail("SEMANTIC_RECEIPT_ARTIFACT_DRIFT", "semantic controls")
    if receipt.get("unresolved_semantic_dependencies") != []:
        _fail("UNRESOLVED_SEMANTIC_DEPENDENCY", "semantic inventory receipt")

    return {
        "operating_bytes": operating_bytes,
        "architecture_bytes": architecture_bytes,
        "subject_transport_addendum_bytes": addendum_bytes,
        "route_capability_receipt_bytes": capability_bytes,
        "semantic_bytes": semantic_bytes,
        "pipeline_bytes": pipeline_bytes,
        "routes_bytes": routes_bytes,
        "schedule_bytes": schedule_bytes,
        "semantic_receipt_bytes": receipt_bytes,
        "routes": routes,
        "slots": slots,
        "schedule": schedule,
        "cells": cells,
        "cells_by_name": cells_by_name,
        "stages": stages,
        "stages_by_name": stages_by_name,
        "canary": canary,
        "source_file_count": len(files),
        "bindings": {
            "operating_contract": _binding(_OPERATING, operating_bytes, _REPO),
            "semantic_manifest": _binding(_SEMANTIC, semantic_bytes),
            "pipeline_contract": _binding(_PIPELINE, pipeline_bytes),
            "subject_transport_addendum": _binding(
                _SUBJECT_TRANSPORT_ADDENDUM, addendum_bytes,
            ),
            "route_capability_receipt": _binding(
                _ROUTE_CAPABILITY_RECEIPT, capability_bytes,
            ),
        },
    }


def _component_paths() -> tuple[_PurePosixPath, ...]:
    iteration = _ROOT.relative_to(_SUCCESSOR).as_posix()
    values = (
        "r9_goal_operating_contract_v1.json",
        "r9_subject_transport_addendum_subagent_invocations_v1.json",
        "r9_subject_transport_subagent_route_capability_receipt_v1.json",
        f"{iteration}/architecture_contract.json",
        f"{iteration}/backend.py",
        f"{iteration}/backend_contract.json",
        f"{iteration}/controller.py",
        f"{iteration}/fault_scenarios.json",
        f"{iteration}/pipeline_contract.json",
        f"{iteration}/regression_catalog.json",
        f"{iteration}/regression_inventory_receipt.json",
        f"{iteration}/routes.json",
        f"{iteration}/schedule.json",
        f"{iteration}/semantic_inventory_receipt.json",
        f"{iteration}/semantic_manifest.json",
        f"{iteration}/simulator_contract.json",
        f"{iteration}/verifier.py",
        f"{iteration}/verifier_contract.json",
    )
    return tuple(_PurePosixPath(value) for value in sorted(values))


def _component_bundle() -> tuple[dict[str, _Any], dict[str, bytes]]:
    rows: list[dict[str, _Any]] = []
    storages: dict[str, bytes] = {}
    for pure in _component_paths():
        path = _SUCCESSOR.joinpath(*pure.parts)
        storage = _regular(path, f"component bundle {pure}")
        row = {"path": pure.as_posix(), "sha256": _sha(storage), "bytes": len(storage)}
        rows.append(row)
        storages[pure.as_posix()] = storage
    if len(rows) != 18:
        _fail("COMPONENT_BUNDLE_COUNT_MISMATCH", str(len(rows)))
    row_bytes = _canon(rows)
    return {
        "file_count": len(rows),
        "aggregate_file_bytes": sum(row["bytes"] for row in rows),
        "rows_sha256": _sha(row_bytes),
        "rows_bytes": len(row_bytes),
        "files": rows,
    }, storages


def _git(*arguments: str) -> bytes:
    try:
        completed = _subprocess.run(
            ["git", "-C", str(_REPO), *arguments],
            stdin=_subprocess.DEVNULL, stdout=_subprocess.PIPE,
            stderr=_subprocess.PIPE, check=False,
        )
    except OSError as exc:
        _fail("GIT_EXECUTION_ERROR", str(exc))
    if completed.returncode != 0:
        detail = completed.stderr.decode("utf-8", errors="replace").strip()
        _fail("GIT_COMMAND_FAILED", f"{' '.join(arguments)}: {detail}")
    return completed.stdout


def _validate_custody(
    run: dict[str, _Any], bundle: dict[str, _Any], storages: dict[str, bytes],
) -> dict[str, _Any]:
    recorded_head = run["git_head"]
    if run["mode"] == "synthetic":
        if run.get("custody_mode") != "WORKTREE_EXACT_BUNDLE":
            _fail("SYNTHETIC_CUSTODY_MODE", str(run.get("custody_mode")))
        return {
            "mode": "WORKTREE_EXACT_BUNDLE",
            "recorded_git_head": recorded_head,
            "current_head_equality_required": False,
            "exact_live_bundle_reopened": True,
            "recorded_commit_blobs_reopened": False,
            "historical_head_reopen": "PASS",
        }
    if run.get("custody_mode") != "GIT_HEAD_PINNED":
        _fail("ACTUAL_CUSTODY_MODE", str(run.get("custody_mode")))
    _git("cat-file", "-e", f"{recorded_head}^{{commit}}")
    successor_repo = _SUCCESSOR.relative_to(_REPO)
    for row in bundle["files"]:
        repo_path = (successor_repo / _Path(row["path"])).as_posix()
        blob = _git("show", f"{recorded_head}:{repo_path}")
        if blob != storages[row["path"]]:
            _fail("GIT_BUNDLE_BLOB_DRIFT", row["path"])
    return {
        "mode": "GIT_HEAD_PINNED",
        "recorded_git_head": recorded_head,
        "current_head_equality_required": False,
        "exact_live_bundle_reopened": True,
        "recorded_commit_blobs_reopened": True,
        "historical_head_reopen": "PASS",
    }


def _validate_expected(
    run_root: _Path, expected: _Any, controls: dict[str, _Any],
    bundle: dict[str, _Any],
) -> dict[str, _Any]:
    keys = {
        "schema_id", "run_id", "run_kind", "planned_call_count",
        "evidence_root", "operating_contract", "bundle",
        "semantic_manifest", "pipeline_contract", "subject_transport_addendum",
        "route_capability_receipt",
    }
    value = _exact_keys(expected, keys, "expected")
    if value.get("schema_id") != "pw-r9-verifier-expectation-v3":
        _fail("EXPECTED_SCHEMA_MISMATCH", str(value.get("schema_id")))
    run_id = _name(value.get("run_id"), "expected.run_id")
    run_kind = value.get("run_kind")
    if run_kind not in {"simulate", "run-canary", "run-matrix"}:
        _fail("EXPECTED_RUN_KIND", str(run_kind))
    planned = _integer(value.get("planned_call_count"), "expected.planned_call_count", 0)
    wanted = 3 if run_kind == "run-canary" else 291
    if planned != wanted:
        _fail("EXPECTED_CALL_COUNT", f"{planned} != {wanted}")
    if not isinstance(run_root, _Path) or not run_root.is_absolute():
        _fail("RUN_ROOT_ABSOLUTE_PATH_REQUIRED", str(run_root))
    _directory(run_root, "run root")
    evidence_text = _string(value.get("evidence_root"), "expected.evidence_root")
    evidence_root = _Path(evidence_text)
    if not evidence_root.is_absolute():
        _fail("EVIDENCE_ROOT_ABSOLUTE_REQUIRED", evidence_text)
    _directory(evidence_root, "evidence root")
    try:
        resolved_evidence = evidence_root.resolve(strict=True)
        resolved_run = run_root.resolve(strict=True)
    except OSError as exc:
        _fail("PATH_RESOLUTION_ERROR", str(exc))
    if resolved_run != run_root or resolved_run.parent != resolved_evidence:
        _fail("RUN_ROOT_PARENT_OR_SYMLINK_MISMATCH", str(run_root))
    if run_root.name != run_id:
        _fail("RUN_ID_PATH_MISMATCH", f"{run_root.name} != {run_id}")
    wanted_bindings = controls["bindings"]
    for key in (
        "operating_contract", "semantic_manifest", "pipeline_contract",
        "subject_transport_addendum", "route_capability_receipt",
    ):
        _binding_shape(value.get(key), f"expected.{key}")
        if value[key] != wanted_bindings[key]:
            _fail("EXPECTED_CONTROL_BINDING_DRIFT", key)
    if value.get("bundle") != bundle:
        _fail("EXPECTED_COMPONENT_BUNDLE_DRIFT", "bundle")
    _canon(value)
    return {
        "run_id": run_id, "run_kind": run_kind, "planned_call_count": planned,
        "evidence_root": resolved_evidence,
    }


def _selected_schedule(run_kind: str, controls: dict[str, _Any]) -> list[dict[str, _Any]]:
    cells = controls["cells"]
    if run_kind == "run-canary":
        cells = [controls["cells_by_name"][controls["canary"]]]
    return [
        {"ordinal": ordinal, "slot": route["slot"], "route": route,
         "index": cell["index"], "cell": cell["cell"]}
        for ordinal, (route, cell) in enumerate(
            (route, cell) for route in controls["routes"] for cell in cells
        )
    ]


def _load_run(
    run_root: _Path, expectation: dict[str, _Any], controls: dict[str, _Any],
    bundle: dict[str, _Any],
) -> tuple[bytes, dict[str, _Any], list[dict[str, _Any]]]:
    storage, run = _json_object(run_root / "run.json", "run manifest", canonical=True)
    _exact_keys(run, _RUN_KEYS, "run manifest")
    run_kind = expectation["run_kind"]
    mode = "synthetic" if run_kind == "simulate" else "actual"
    scenario = run.get("scenario")
    if mode == "synthetic":
        _string(scenario, "run.scenario")
    elif scenario is not None:
        _fail("ACTUAL_SCENARIO_FORBIDDEN", str(scenario))
    _string(run.get("created_utc"), "run.created_utc")
    head = _string(run.get("git_head"), "run.git_head")
    if not _re.fullmatch(r"[0-9a-f]{40,64}", head):
        _fail("RUN_GIT_HEAD_FORMAT", head)
    for key, minimum in (
        ("route_count", 1), ("cells_per_route", 1),
        ("planned_call_count", 1), ("stage_count", 1),
        ("retry_count", 0), ("replacement_count", 0),
    ):
        _integer(run.get(key), f"run.{key}", minimum)
    _boolean(run.get("best_of"), "run.best_of")
    cells_per_route = 1 if run_kind == "run-canary" else 97
    if (
        run.get("schema_id"), run.get("operating_contract"), run.get("run_id"),
        run.get("run_kind"), run.get("mode"), run.get("bundle"),
        run.get("semantic_manifest"), run.get("pipeline_contract"),
        run.get("subject_transport_addendum"), run.get("route_capability_receipt"),
        run.get("routes"), run.get("route_count"), run.get("cells_per_route"),
        run.get("planned_call_count"), run.get("stage_count"),
        run.get("retry_count"), run.get("best_of"), run.get("replacement_count"),
    ) != (
        "pw-r9-run-v3", controls["bindings"]["operating_contract"],
        expectation["run_id"], run_kind, mode, bundle,
        controls["bindings"]["semantic_manifest"],
        controls["bindings"]["pipeline_contract"],
        controls["bindings"]["subject_transport_addendum"],
        controls["bindings"]["route_capability_receipt"], controls["routes"], 3,
        cells_per_route, expectation["planned_call_count"], 18, 0, False, 0,
    ):
        _fail("RUN_MANIFEST_CONTRACT_MISMATCH", "fixed fields")
    rows = run.get("schedule")
    selected = _selected_schedule(run_kind, controls)
    if not isinstance(rows, list) or len(rows) != len(selected):
        _fail("RUN_SCHEDULE_COUNT", str(type(rows).__name__))
    normalized: list[dict[str, _Any]] = []
    identities: set[str] = set()
    for index, (row, base) in enumerate(zip(rows, selected)):
        current = _exact_keys(row, _ROW_KEYS, f"run.schedule[{index}]")
        _integer(current.get("ordinal"), f"run.schedule[{index}].ordinal", 0)
        _integer(current.get("index"), f"run.schedule[{index}].index", 0)
        nonce = _string(current.get("nonce"), f"run.schedule[{index}].nonce")
        invocation_id = current.get("invocation_id")
        task_name = current.get("task_name")
        expected_path = current.get("expected_canonical_task_path")
        if (
            not _HEX64.fullmatch(nonce)
            or invocation_id != f"r9-invocation:{nonce}"
            or task_name != f"r9_{nonce}"
            or not isinstance(task_name, str) or not _TASK_NAME.fullmatch(task_name)
            or expected_path != f"/root/{task_name}"
            or any(value in identities for value in (nonce, invocation_id, expected_path))
        ):
            _fail("RUN_NONCE_FORMAT_OR_DUPLICATE", str(index))
        if current.get("ordinal") != index or any(
            current.get(key) != base[key] for key in ("slot", "route", "index", "cell")
        ):
            _fail("RUN_SCHEDULE_ORDER_MISMATCH", str(index))
        identities.update((nonce, invocation_id, expected_path))
        normalized.append(current)
    return storage, run, normalized


def _row_path(run_root: _Path, row: dict[str, _Any]) -> _Path:
    return run_root / "cells" / row["slot"] / f"{row['index']:03d}_{row['cell']}"


def _artifact_path(run_root: _Path, slot: str, stage: str) -> _Path:
    return run_root / "artifacts" / slot / f"{stage}.json"


def _reference(
    run_root: _Path, path: _Path, storage: bytes, kind: str, identity: str,
) -> dict[str, _Any]:
    try:
        relative = path.relative_to(run_root).as_posix()
    except ValueError:
        _fail("CAUSAL_REFERENCE_ESCAPE", str(path))
    return {
        "kind": kind, "id": identity, "path": relative,
        "sha256": _sha(storage), "bytes": len(storage),
    }


def _score(result: dict[str, _Any], cell: dict[str, _Any]) -> dict[str, _Any]:
    wanted = _ordered(cell["expected_output"]) + b"\n"
    actual = _utf8(result.get("stdout_utf8"), "subagent_result.stdout_utf8")
    if result["returncode"] != 0:
        verdict, reason = "FAIL", "PROHIBITED_ACTIVITY_AFTER_FINAL"
    elif actual != wanted:
        verdict, reason = "FAIL", "EXACT_OUTPUT_MISMATCH"
    else:
        verdict, reason = "PASS", "EXACT_CANONICAL_OUTPUT_MATCH"
    return {
        "rule": "EXACT_CANONICAL_JSON_PLUS_ONE_LF", "verdict": verdict,
        "reason": reason, "expected_sha256": _sha(wanted),
        "expected_bytes": len(wanted), "actual_sha256": _sha(actual),
        "actual_bytes": len(actual), "returncode": result["returncode"],
    }


def _spawn_request(
    run: dict[str, _Any], row: dict[str, _Any], packet: bytes, message: bytes,
    attempt_sha256: str, attempt_bytes: int,
) -> dict[str, _Any]:
    request = {
        "schema_id": "pw-r9-subagent-spawn-request-v1",
        "run_id": run["run_id"], "run_kind": run["run_kind"], "mode": run["mode"],
        "slot": row["slot"], "cell": row["cell"], "index": row["index"],
        "ordinal": row["ordinal"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"], "task_name": row["task_name"],
        "expected_canonical_task_path": row["expected_canonical_task_path"],
        "agent_type": "default", "fork_turns": "none",
        "model": row["route"]["model"],
        "reasoning_effort": row["route"]["thinking"],
        "packet_sha256": _sha(packet), "packet_bytes": len(packet),
        "message_utf8": message.decode("utf-8"),
        "message_sha256": _sha(message), "message_bytes": len(message),
        "attempt_sha256": attempt_sha256, "attempt_bytes": attempt_bytes,
    }
    _exact_keys(request, _SPAWN_REQUEST_FIELDS, "spawn request")
    return request


def _validate_failure_event(
    value: _Any, invocation_id: str, phase: str, label: str,
) -> bool:
    if not isinstance(value, dict) or value.get("schema_id") != (
        "pw-r9-subagent-transport-failure-event-v1"
    ):
        return False
    event = _exact_keys(value, _FAILURE_EVENT_FIELDS, label)
    failure_type = _string(event.get("failure_type"), f"{label}.failure_type")
    detail = _string(event.get("detail"), f"{label}.detail")
    _utf8(failure_type, f"{label}.failure_type")
    _utf8(detail, f"{label}.detail")
    if (
        event.get("invocation_id") != invocation_id
        or event.get("phase") != phase
        or not _FAILURE_TYPE.fullmatch(failure_type)
    ):
        _fail("TRANSPORT_FAILURE_EVENT_MISMATCH", label)
    return True


def _validate_spawn_receipt(
    value: _Any, request: dict[str, _Any],
) -> dict[str, _Any]:
    event = _exact_keys(value, _SPAWN_RECEIPT_FIELDS, "spawn receipt")
    expected_path = request["expected_canonical_task_path"]
    if (
        event.get("schema_id") != "pw-r9-subagent-spawn-receipt-event-v1"
        or event.get("invocation_id") != request["invocation_id"]
        or event.get("spawn_request_sha256") != _sha(_canon(request))
        or event.get("tool_result") != {"task_name": expected_path}
        or event.get("returned_identity_kind") != "canonical_task_path"
        or event.get("returned_canonical_task_path") != expected_path
    ):
        _fail("SPAWN_RECEIPT_BINDING_MISMATCH", str(request["ordinal"]))
    return event


def _validate_activity(value: _Any, ordinal: int) -> bool:
    activity = _exact_keys(value, _ACTIVITY_FIELDS, f"row {ordinal} observed activity")
    count_fields = (
        "tool_calls", "file_accesses", "browsing", "network_accesses",
        "delegations", "memory_accesses", "followup_turns",
    )
    counts = [
        _integer(activity.get(key), f"row {ordinal} observed activity.{key}", 0)
        for key in count_fields
    ]
    messages = activity.get("nonterminal_messages")
    if not isinstance(messages, list):
        _fail("NONTERMINAL_MESSAGES_LIST_REQUIRED", str(ordinal))
    for sequence, raw in enumerate(messages, 1):
        message = _exact_keys(
            raw, {"sequence", "message_type", "utf8", "sha256", "bytes"},
            f"row {ordinal} nonterminal message {sequence}",
        )
        storage = _utf8(message.get("utf8"), f"row {ordinal} nonterminal utf8")
        if (
            _integer(message.get("sequence"), f"row {ordinal} nonterminal sequence", 1)
            != sequence
            or message.get("message_type") != "MESSAGE"
            or message.get("sha256") != _sha(storage)
            or _integer(message.get("bytes"), f"row {ordinal} nonterminal bytes", 0)
            != len(storage)
        ):
            _fail("NONTERMINAL_MESSAGE_BINDING_MISMATCH", f"{ordinal}:{sequence}")
    if activity.get("observation_basis") != "ROOT_VISIBLE_COLLABORATION_DELIVERIES":
        _fail("ACTIVITY_OBSERVATION_BASIS_MISMATCH", str(ordinal))
    return any(counts) or bool(messages)


def _transport_result(
    receipt: dict[str, _Any], delivery: _Any, request: dict[str, _Any],
) -> dict[str, _Any]:
    if _validate_failure_event(
        receipt, request["invocation_id"], "SPAWN_ATTEMPT", "spawn receipt",
    ):
        _fail(
            "SPAWN_TRANSPORT_FAILURE",
            f"{receipt['failure_type']}:{receipt['detail']}",
        )
    _validate_spawn_receipt(receipt, request)
    if _validate_failure_event(
        delivery, request["invocation_id"], "TERMINAL_DRAIN", "terminal delivery",
    ):
        _fail(
            "TERMINAL_TRANSPORT_FAILURE",
            f"{delivery['failure_type']}:{delivery['detail']}",
        )
    event = _exact_keys(delivery, _TERMINAL_DELIVERY_FIELDS, "terminal delivery")
    if (
        event.get("schema_id") != "pw-r9-subagent-terminal-delivery-event-v1"
        or event.get("invocation_id") != request["invocation_id"]
        or event.get("returned_canonical_task_path")
        != request["expected_canonical_task_path"]
        or event.get("message_type") != "FINAL_ANSWER"
        or event.get("terminal_status") != "FINAL_RETURNED"
    ):
        _fail("TERMINAL_DELIVERY_BINDING_MISMATCH", str(request["ordinal"]))
    raw_final = _utf8(event.get("final_utf8"), "terminal delivery.final_utf8")
    prohibited = _validate_activity(event.get("observed_activity"), request["ordinal"])
    admitted = raw_final if raw_final.endswith(b"\n") else raw_final + b"\n"
    normalization = (
        "UNCHANGED_TERMINAL_LF_PRESENT"
        if raw_final.endswith(b"\n") else "APPENDED_ONE_TERMINAL_LF"
    )
    return {
        "schema_id": "pw-r9-subagent-result-v1",
        "invocation_id": request["invocation_id"],
        "canonical_task_path": request["expected_canonical_task_path"],
        "terminal_status": "FINAL_RETURNED", "message_type": "FINAL_ANSWER",
        "stdout_utf8": admitted.decode("utf-8"),
        "returncode": 86 if prohibited else 0,
        "prohibited_activity": prohibited,
        "output_capture": {
            "status": "PROHIBITED_ACTIVITY" if prohibited else "COMPLETE_SINGLE_TEXT",
            "normalization": normalization,
            "raw_text_sha256": _sha(raw_final), "raw_text_bytes": len(raw_final),
            "sha256": _sha(admitted), "bytes": len(admitted),
        },
    }


def _load_artifacts(
    run_root: _Path, controls: dict[str, _Any],
) -> tuple[dict[tuple[str, str], dict[str, _Any]], dict[str, list[str]]]:
    inventory = _entries(run_root / "artifacts", "artifacts root")
    slots = set(controls["slots"])
    references: dict[tuple[str, str], dict[str, _Any]] = {}
    by_slot: dict[str, list[str]] = {slot: [] for slot in controls["slots"]}
    for slot, is_dir in inventory.items():
        if not is_dir or slot not in slots:
            _fail("UNEXPECTED_ARTIFACT_SLOT", slot)
        children = _entries(run_root / "artifacts" / slot, f"artifact slot {slot}")
        for name, child_is_dir in children.items():
            if child_is_dir or not name.endswith(".json"):
                _fail("UNEXPECTED_ARTIFACT_PATH", f"{slot}/{name}")
            stage_name = name[:-5]
            stage = controls["stages_by_name"].get(stage_name)
            if stage is None:
                _fail("UNDECLARED_STAGE_ARTIFACT", f"{slot}/{name}")
            path = _artifact_path(run_root, slot, stage_name)
            storage, value = _json_object(path, f"stage artifact {slot}/{stage_name}", canonical=False)
            wanted = _ordered(stage["expected_artifact"]) + b"\n"
            if storage != wanted or value != stage["expected_artifact"]:
                _fail("STAGE_ARTIFACT_PAYLOAD_DRIFT", f"{slot}/{stage_name}")
            if (
                stage["expected_artifact_storage_sha256"],
                stage["expected_artifact_storage_bytes"],
            ) != (_sha(storage), len(storage)):
                _fail("STAGE_ARTIFACT_MANIFEST_BINDING", f"{slot}/{stage_name}")
            references[(slot, stage_name)] = _reference(
                run_root, path, storage, "STAGE_ARTIFACT", stage_name,
            )
            by_slot[slot].append(stage_name)
    for slot in by_slot:
        by_slot[slot].sort(key=_STAGES.index)
    return references, by_slot


def _causal_references(
    run_root: _Path, row: dict[str, _Any], cell: dict[str, _Any],
    records: dict[tuple[str, str], dict[str, _Any]],
    artifacts: dict[tuple[str, str], dict[str, _Any]],
) -> list[dict[str, _Any]]:
    refs: list[dict[str, _Any]] = []
    gate = cell["dependency_gate"]
    for cell_name in gate["required_pass_cells"]:
        dependency = records.get((row["slot"], cell_name))
        if dependency is None or dependency["status"] != "PASS":
            _fail("CAUSAL_PASS_CELL_NOT_PASS", f"{row['slot']}:{row['cell']}:{cell_name}")
        refs.append(_reference(
            run_root, dependency["completion_path"], dependency["completion_storage"],
            "PASS_CELL", cell_name,
        ))
    for stage_name in gate["required_stage_artifacts"]:
        reference = artifacts.get((row["slot"], stage_name))
        if reference is None:
            _fail("CAUSAL_STAGE_ARTIFACT_MISSING", f"{row['slot']}:{row['cell']}:{stage_name}")
        refs.append(reference)
    refs.sort(key=lambda item: (item["kind"], item["id"], item["path"]))
    return refs


def _validate_row(
    run_root: _Path, run: dict[str, _Any], row: dict[str, _Any],
    cell: dict[str, _Any], records: dict[tuple[str, str], dict[str, _Any]],
    artifacts: dict[tuple[str, str], dict[str, _Any]],
) -> dict[str, _Any]:
    path = _row_path(run_root, row)
    inventory = _entries(path, f"row {row['ordinal']}")
    full_inventory = {
        "provider_input.txt": False, "spawn_message.txt": False,
        "attempt.json": False, "spawn_receipt.json": False,
        "raw_result.json": False, "completion.json": False,
    }
    spawn_failure_inventory = {
        "provider_input.txt": False, "spawn_message.txt": False,
        "attempt.json": False, "spawn_receipt.json": False,
    }
    terminal_failure_inventory = {
        "provider_input.txt": False, "spawn_message.txt": False,
        "attempt.json": False, "spawn_receipt.json": False,
        "raw_result.json": False,
    }
    if inventory not in (
        full_inventory, spawn_failure_inventory, terminal_failure_inventory,
    ):
        _fail("ROW_FILE_INVENTORY_MISMATCH", str(row["ordinal"]))

    packet = _regular(path / "provider_input.txt", f"row {row['ordinal']} provider input")
    expected_packet = _utf8(cell["render_utf8"], f"cell {row['cell']} render")
    if (
        packet != expected_packet
        or not packet.endswith(b"\n")
        or packet.endswith(b"\n\n")
        or b"\r" in packet
    ):
        _fail("PROVIDER_PACKET_DRIFT", str(row["ordinal"]))
    message = _regular(path / "spawn_message.txt", f"row {row['ordinal']} spawn message")
    if message != _TRANSPORT_INSTRUCTION + packet[:-1]:
        _fail("SPAWN_MESSAGE_BINDING_MISMATCH", str(row["ordinal"]))

    causal_inputs = _causal_references(run_root, row, cell, records, artifacts)
    attempt_storage, attempt = _json_object(
        path / "attempt.json", f"row {row['ordinal']} attempt", canonical=True,
    )
    for key, minimum in (
        ("index", 0), ("ordinal", 0), ("packet_bytes", 0),
        ("message_bytes", 0), ("attempt", 1), ("retry_count", 0),
    ):
        _integer(attempt.get(key), f"row {row['ordinal']} attempt.{key}", minimum)
    for key in ("best_of", "replacement_result", "no_retry", "no_relaunch"):
        _boolean(attempt.get(key), f"row {row['ordinal']} attempt.{key}")
    expected_attempt = {
        "schema_id": "pw-r9-attempt-v3", "run_id": run_root.name,
        "run_kind": run["run_kind"], "mode": run["mode"], "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
        "route": row["route"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"], "task_name": row["task_name"],
        "expected_canonical_task_path": row["expected_canonical_task_path"],
        "agent_type": "default", "fork_turns": "none",
        "model": row["route"]["model"],
        "reasoning_effort": row["route"]["thinking"],
        "causal_inputs": causal_inputs,
        "packet_sha256": _sha(packet), "packet_bytes": len(packet),
        "message_sha256": _sha(message), "message_bytes": len(message),
        "attempt": 1, "retry_count": 0, "best_of": False,
        "replacement_result": False, "no_retry": True, "no_relaunch": True,
    }
    if attempt != expected_attempt:
        _fail("ATTEMPT_BINDING_MISMATCH", str(row["ordinal"]))
    for index, reference in enumerate(attempt["causal_inputs"]):
        _exact_keys(reference, _REF_KEYS, f"row {row['ordinal']} causal_inputs[{index}]")

    attempt_sha256 = _sha(attempt_storage)
    attempt_bytes = len(attempt_storage)
    request = _spawn_request(
        run, row, packet, message, attempt_sha256, attempt_bytes,
    )
    request_payload = _canon(request)
    receipt_storage, receipt = _json_object(
        path / "spawn_receipt.json", f"row {row['ordinal']} spawn receipt",
        canonical=True,
    )
    base_record = {
        "ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
        "index": row["index"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"],
        "canonical_task_path": row["expected_canonical_task_path"],
        "attempt_present": True,
    }
    spawn_failed = _validate_failure_event(
        receipt, row["invocation_id"], "SPAWN_ATTEMPT",
        f"row {row['ordinal']} spawn receipt",
    )
    if spawn_failed:
        if inventory != spawn_failure_inventory:
            _fail("SPAWN_FAILURE_PREFIX_INVENTORY_MISMATCH", str(row["ordinal"]))
        return {
            **base_record, "kind": "invalid", "raw_present": False,
            "invalid_reason": (
                f"spawn transport failure:{receipt['failure_type']}:{receipt['detail']}"
            ),
        }
    _validate_spawn_receipt(receipt, request)
    if inventory == spawn_failure_inventory:
        _fail("UNTYPED_SPAWN_FAILURE_PREFIX", str(row["ordinal"]))

    raw_storage, raw = _json_object(
        path / "raw_result.json", f"row {row['ordinal']} raw result", canonical=True,
    )
    raw_keys = {
        "schema_id", "run_id", "slot", "cell", "index", "ordinal",
        "invocation_id", "attempt_sha256", "attempt_bytes",
        "spawn_request_sha256", "spawn_request_bytes",
        "spawn_receipt_sha256", "spawn_receipt_bytes", "terminal_delivery",
    }
    _exact_keys(raw, raw_keys, f"row {row['ordinal']} raw result")
    for key, minimum in (
        ("index", 0), ("ordinal", 0), ("attempt_bytes", 0),
        ("spawn_request_bytes", 0), ("spawn_receipt_bytes", 0),
    ):
        _integer(raw.get(key), f"row {row['ordinal']} raw result.{key}", minimum)
    if (
        raw.get("schema_id"), raw.get("run_id"), raw.get("slot"),
        raw.get("cell"), raw.get("index"), raw.get("ordinal"),
        raw.get("invocation_id"), raw.get("attempt_sha256"),
        raw.get("attempt_bytes"), raw.get("spawn_request_sha256"),
        raw.get("spawn_request_bytes"), raw.get("spawn_receipt_sha256"),
        raw.get("spawn_receipt_bytes"),
    ) != (
        "pw-r9-raw-result-v3", run_root.name, row["slot"], row["cell"],
        row["index"], row["ordinal"], row["invocation_id"],
        attempt_sha256, attempt_bytes, _sha(request_payload),
        len(request_payload), _sha(receipt_storage), len(receipt_storage),
    ):
        _fail("RAW_RESULT_BINDING_MISMATCH", str(row["ordinal"]))
    delivery = raw.get("terminal_delivery")
    terminal_failed = _validate_failure_event(
        delivery, row["invocation_id"], "TERMINAL_DRAIN",
        f"row {row['ordinal']} terminal delivery",
    )
    if terminal_failed:
        if inventory != terminal_failure_inventory:
            _fail("TERMINAL_FAILURE_PREFIX_INVENTORY_MISMATCH", str(row["ordinal"]))
        return {
            **base_record, "kind": "invalid", "raw_present": True,
            "invalid_reason": (
                f"terminal transport failure:{delivery['failure_type']}:{delivery['detail']}"
            ),
        }
    if inventory != full_inventory:
        _fail("UNTYPED_TERMINAL_FAILURE_PREFIX", str(row["ordinal"]))

    result = _transport_result(receipt, delivery, request)
    score = _score(result, cell)
    transport_summary = {
        "terminal_status": result["terminal_status"],
        "message_type": result["message_type"],
        "canonical_task_path": result["canonical_task_path"],
        "returncode": result["returncode"],
        "prohibited_activity": result["prohibited_activity"],
        "output_capture": result["output_capture"],
    }
    completion_path = path / "completion.json"
    completion_storage, completion = _json_object(
        completion_path, f"row {row['ordinal']} completion", canonical=True,
    )
    for key, minimum in (
        ("index", 0), ("ordinal", 0), ("packet_bytes", 0),
        ("message_bytes", 0), ("attempt_bytes", 0),
        ("spawn_request_bytes", 0), ("spawn_receipt_bytes", 0),
        ("raw_result_bytes", 0), ("attempt", 1), ("retry_count", 0),
    ):
        _integer(completion.get(key), f"row {row['ordinal']} completion.{key}", minimum)
    for key in ("best_of", "replacement_result", "completion_is_last_row_write"):
        _boolean(completion.get(key), f"row {row['ordinal']} completion.{key}")
    stored_transport = _exact_keys(
        completion.get("transport"), {
            "terminal_status", "message_type", "canonical_task_path",
            "returncode", "prohibited_activity", "output_capture",
        }, f"row {row['ordinal']} completion.transport",
    )
    _integer(
        stored_transport.get("returncode"),
        f"row {row['ordinal']} completion.transport.returncode", 0,
    )
    _boolean(
        stored_transport.get("prohibited_activity"),
        f"row {row['ordinal']} completion.transport.prohibited_activity",
    )
    capture = _exact_keys(
        stored_transport.get("output_capture"), {
            "status", "normalization", "raw_text_sha256", "raw_text_bytes",
            "sha256", "bytes",
        }, f"row {row['ordinal']} completion.transport.output_capture",
    )
    for key in ("raw_text_bytes", "bytes"):
        _integer(
            capture.get(key),
            f"row {row['ordinal']} completion.transport.output_capture.{key}", 0,
        )
    stored_score = _exact_keys(
        completion.get("score"), {
            "rule", "verdict", "reason", "expected_sha256", "expected_bytes",
            "actual_sha256", "actual_bytes", "returncode",
        }, f"row {row['ordinal']} completion.score",
    )
    for key in ("expected_bytes", "actual_bytes", "returncode"):
        _integer(
            stored_score.get(key),
            f"row {row['ordinal']} completion.score.{key}", 0,
        )
    expected_completion = {
        "schema_id": "pw-r9-completion-v3", "run_id": run_root.name,
        "slot": row["slot"], "cell": row["cell"], "index": row["index"],
        "ordinal": row["ordinal"], "route": row["route"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"], "task_name": row["task_name"],
        "canonical_task_path": row["expected_canonical_task_path"],
        "packet_sha256": _sha(packet), "packet_bytes": len(packet),
        "message_sha256": _sha(message), "message_bytes": len(message),
        "attempt_sha256": attempt_sha256, "attempt_bytes": attempt_bytes,
        "spawn_request_sha256": _sha(request_payload),
        "spawn_request_bytes": len(request_payload),
        "spawn_receipt_sha256": _sha(receipt_storage),
        "spawn_receipt_bytes": len(receipt_storage),
        "raw_result_sha256": _sha(raw_storage),
        "raw_result_bytes": len(raw_storage),
        "transport": transport_summary, "score": score,
        "status": score["verdict"], "attempt": 1, "retry_count": 0,
        "best_of": False, "replacement_result": False,
        "completion_is_last_row_write": True,
    }
    if completion != expected_completion:
        _fail("COMPLETION_BINDING_MISMATCH", str(row["ordinal"]))
    return {
        **base_record, "kind": "complete", "raw_present": True,
        "status": score["verdict"],
        "completion_sha256": _sha(completion_storage),
        "completion_bytes": len(completion_storage),
        "completion_path": completion_path,
        "completion_storage": completion_storage,
    }


def _load_rows(
    run_root: _Path, run: dict[str, _Any], rows: list[dict[str, _Any]],
    controls: dict[str, _Any], artifacts: dict[tuple[str, str], dict[str, _Any]],
) -> tuple[
    list[dict[str, _Any]], dict[tuple[str, str], dict[str, _Any]],
    dict[int, dict[str, _Any]], set[int],
]:
    inventory = _entries(run_root / "cells", "cells root")
    expected_paths = {
        (row["slot"], f"{row['index']:03d}_{row['cell']}"): row for row in rows
    }
    present: set[int] = set()
    for slot, is_dir in inventory.items():
        if not is_dir or slot not in controls["slots"]:
            _fail("UNEXPECTED_CELL_SLOT", slot)
        children = _entries(run_root / "cells" / slot, f"cell slot {slot}")
        if not children:
            _fail("EMPTY_CELL_SLOT_DIRECTORY", slot)
        for name, child_is_dir in children.items():
            base = expected_paths.get((slot, name))
            if not child_is_dir or base is None:
                _fail("UNEXPECTED_ROW_PATH", f"{slot}/{name}")
            if base["ordinal"] in present:
                _fail("DUPLICATE_ROW_PATH", str(base["ordinal"]))
            present.add(base["ordinal"])
    completed: list[dict[str, _Any]] = []
    records: dict[tuple[str, str], dict[str, _Any]] = {}
    invalid: dict[int, dict[str, _Any]] = {}
    for row in rows:
        if row["ordinal"] not in present:
            continue
        record = _validate_row(
            run_root, run, row, controls["cells_by_name"][row["cell"]],
            records, artifacts,
        )
        if record["kind"] == "invalid":
            invalid[row["ordinal"]] = record
        else:
            completed.append(record)
            records[(row["slot"], row["cell"])] = record
    return completed, records, invalid, present


def _root_cause(
    run_root: _Path, root_inventory: dict[str, bool], matrix: dict[str, _Any],
) -> dict[str, str] | None:
    cause = matrix.get("cause")
    if cause is not None:
        value = _exact_keys(cause, {"kind", "detail"}, "matrix cause")
        if value.get("kind") not in {"CONTROLLER_INVALID", "STOPPED_AFTER_DRAIN"}:
            _fail("MATRIX_CAUSE_KIND", str(value.get("kind")))
        _string(value.get("detail"), "matrix cause.detail")
    invalid_present = "controller_invalid.json" in root_inventory
    if invalid_present != (isinstance(cause, dict) and cause.get("kind") == "CONTROLLER_INVALID"):
        _fail("CONTROLLER_INVALID_RECEIPT_CARDINALITY", str(invalid_present))
    if invalid_present:
        _, receipt = _json_object(
            run_root / "controller_invalid.json", "controller invalid", canonical=True,
        )
        expected = {
            "schema_id": "pw-r9-controller-invalid-v2", "run_id": run_root.name,
            "kind": cause["kind"], "detail": cause["detail"],
        }
        if receipt != expected:
            _fail("CONTROLLER_INVALID_RECEIPT_MISMATCH", "controller_invalid.json")
    return cause


def _replay_schedule(
    rows: list[dict[str, _Any]], records: dict[tuple[str, str], dict[str, _Any]],
    invalid: dict[int, dict[str, _Any]], present: set[int],
    cause: dict[str, str] | None,
) -> tuple[dict[str, int], int | None]:
    if len(invalid) > 1:
        _fail("MULTIPLE_TYPED_TRANSPORT_FAILURES", str(sorted(invalid)))
    if invalid and (
        cause is None
        or cause.get("kind") != "CONTROLLER_INVALID"
        or cause.get("detail") != next(iter(invalid.values()))["invalid_reason"]
    ):
        _fail("TYPED_FAILURE_CAUSE_MISMATCH", str(sorted(invalid)))
    failed_slots: dict[str, int] = {}
    halt_ordinal: int | None = None
    for row in rows:
        ordinal = row["ordinal"]
        if row["slot"] in failed_slots:
            if ordinal in present:
                _fail("POST_FIRST_FAIL_SAME_SLOT_DISPATCH", str(ordinal))
            continue
        if halt_ordinal is not None:
            if ordinal in present:
                _fail("POST_GLOBAL_HALT_DISPATCH", str(ordinal))
            continue
        if ordinal not in present:
            if cause is None:
                _fail("UNDECLARED_UNSTARTED_ROW", str(ordinal))
            halt_ordinal = ordinal
            continue
        if ordinal in invalid:
            halt_ordinal = ordinal
            continue
        record = records.get((row["slot"], row["cell"]))
        if record is None:
            _fail("PRESENT_ROW_RECORD_MISSING", str(ordinal))
        if record["status"] == "FAIL":
            failed_slots[row["slot"]] = ordinal
    return failed_slots, halt_ordinal


def _expected_artifacts(
    controls: dict[str, _Any], records: dict[tuple[str, str], dict[str, _Any]],
) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for slot in controls["slots"]:
        eligible: list[str] = []
        eligible_set: set[str] = set()
        for stage in controls["stages"]:
            boundary_cell = stage["finalization_boundary"]["after_cell"]
            boundary = records.get((slot, boundary_cell))
            direct = [records.get((slot, cell)) for cell in stage["direct_subject_cells"]]
            is_eligible = (
                boundary is not None and boundary["status"] == "PASS"
                and all(item is not None and item["status"] == "PASS" for item in direct)
                and all(item in eligible_set for item in stage["predecessor_stages"])
            )
            if is_eligible:
                eligible.append(stage["stage"])
                eligible_set.add(stage["stage"])
        result[slot] = eligible
    return result


def _public_completion(record: dict[str, _Any]) -> dict[str, _Any]:
    return {
        key: record[key] for key in (
            "ordinal", "slot", "cell", "index", "status", "nonce",
            "invocation_id", "canonical_task_path", "completion_sha256",
            "completion_bytes",
        )
    }


def _validate_terminals(
    run_root: _Path, run: dict[str, _Any], rows: list[dict[str, _Any]],
    controls: dict[str, _Any], completed: list[dict[str, _Any]],
    records: dict[tuple[str, str], dict[str, _Any]],
    invalid: dict[int, dict[str, _Any]], present: set[int],
    artifacts: dict[tuple[str, str], dict[str, _Any]],
    artifacts_by_slot: dict[str, list[str]], root_inventory: dict[str, bool],
) -> tuple[dict[str, _Any], dict[str, _Any]]:
    matrix_bytes, matrix = _json_object(
        run_root / "matrix_terminal.json", "matrix terminal", canonical=True,
    )
    matrix_keys = {
        "schema_id", "run_id", "status", "cause", "scheduled_rows",
        "completed_rows", "pass_rows", "subject_fail_rows", "invalid_rows",
        "ineligible_rows", "stopped_rows", "controller_aborted_rows",
        "missing_rows", "stage_artifact_count", "required_clean_stage_artifacts",
        "clean_matrix", "path_terminals", "retry_count", "best_of",
        "replacement_count",
    }
    _exact_keys(matrix, matrix_keys, "matrix terminal")
    for key in (
        "scheduled_rows", "completed_rows", "pass_rows", "subject_fail_rows",
        "invalid_rows", "ineligible_rows", "stopped_rows",
        "controller_aborted_rows", "missing_rows", "stage_artifact_count",
        "required_clean_stage_artifacts", "retry_count", "replacement_count",
    ):
        _integer(matrix.get(key), f"matrix terminal.{key}", 0)
    _boolean(matrix.get("clean_matrix"), "matrix terminal.clean_matrix")
    _boolean(matrix.get("best_of"), "matrix terminal.best_of")
    cause = _root_cause(run_root, root_inventory, matrix)
    failed_slots, _ = _replay_schedule(rows, records, invalid, present, cause)

    expected_artifacts = _expected_artifacts(controls, records)
    for slot in controls["slots"]:
        if artifacts_by_slot[slot] != expected_artifacts[slot]:
            extra = sorted(set(artifacts_by_slot[slot]) - set(expected_artifacts[slot]))
            missing = sorted(set(expected_artifacts[slot]) - set(artifacts_by_slot[slot]))
            _fail(
                "STAGE_ELIGIBILITY_INVENTORY_MISMATCH",
                f"{slot}: extra={extra}, missing={missing}",
            )
        failed = failed_slots.get(slot)
        if failed is not None:
            failed_row = rows[failed]
            for stage_name in artifacts_by_slot[slot]:
                boundary = controls["stages_by_name"][stage_name][
                    "finalization_boundary"
                ]["after_cell_index"]
                if boundary >= failed_row["index"]:
                    _fail(
                        "POST_FIRST_FAIL_SAME_SLOT_ARTIFACT",
                        f"{slot}:{stage_name}",
                    )

    terminal_inventory = _entries(run_root / "terminals", "terminals root")
    wanted_terminal_inventory = {f"{slot}.json": False for slot in controls["slots"]}
    if terminal_inventory != wanted_terminal_inventory:
        _fail("PATH_TERMINAL_INVENTORY_MISMATCH", str(sorted(terminal_inventory)))
    completed_by_ordinal = {record["ordinal"]: record for record in completed}
    path_records: list[dict[str, _Any]] = []
    path_ids: list[dict[str, _Any]] = []
    path_terminal_keys = {
        "schema_id", "run_id", "slot", "status", "scheduled_rows",
        "completed_rows", "pass_rows", "subject_fail_rows", "invalid_rows",
        "ineligible_after_subject_fail_ordinals", "stopped_after_signal_ordinals",
        "controller_aborted_ordinals", "missing_ordinals", "stage_artifacts",
        "stage_artifact_count", "eligible_stage_count", "missing_stage_artifacts",
        "invalid_stage_artifacts", "completion_inventory_sha256",
        "completion_inventory_bytes",
    }
    for route in controls["routes"]:
        slot = route["slot"]
        scheduled = [row for row in rows if row["slot"] == slot]
        slot_completed = [
            completed_by_ordinal[row["ordinal"]]
            for row in scheduled if row["ordinal"] in completed_by_ordinal
        ]
        public_completed = [_public_completion(record) for record in slot_completed]
        slot_invalid = [
            {"ordinal": ordinal, "reason": "row file inventory mismatch"}
            for ordinal in sorted(invalid)
            if invalid[ordinal]["slot"] == slot
        ]
        first_fail = next(
            (
                record["ordinal"] for record in slot_completed
                if record["status"] == "FAIL"
            ),
            None,
        )
        ineligible: list[int] = []
        stopped: list[int] = []
        aborted: list[int] = []
        missing: list[int] = []
        for row in scheduled:
            ordinal = row["ordinal"]
            if ordinal in completed_by_ordinal or ordinal in invalid:
                continue
            if first_fail is not None and ordinal > first_fail:
                ineligible.append(ordinal)
            elif cause is not None and cause["kind"] == "STOPPED_AFTER_DRAIN":
                stopped.append(ordinal)
            elif cause is not None and cause["kind"] == "CONTROLLER_INVALID":
                aborted.append(ordinal)
            else:
                missing.append(ordinal)
        if missing:
            _fail("UNDECLARED_MISSING_ROWS", f"{slot}:{missing}")
        pass_rows = sum(record["status"] == "PASS" for record in slot_completed)
        fail_rows = sum(record["status"] == "FAIL" for record in slot_completed)
        if fail_rows > 1:
            _fail("MULTIPLE_SUBJECT_FAILS_IN_SLOT", slot)
        if slot_invalid:
            status = "CONTROLLER_INVALID"
        elif aborted:
            status = "CONTROLLER_ABORTED"
        elif stopped:
            status = "STOPPED_AFTER_DRAIN"
        elif fail_rows:
            status = "VALID_SUBJECT_FAIL"
        elif len(slot_completed) == len(scheduled):
            status = "PASS"
        else:
            _fail("PATH_TERMINAL_UNCLASSIFIED", slot)
        artifact_rows = []
        for stage_name in expected_artifacts[slot]:
            reference = artifacts[(slot, stage_name)]
            artifact_rows.append({
                "stage": stage_name, "path": reference["path"],
                "sha256": reference["sha256"], "bytes": reference["bytes"],
            })
        completion_inventory = _canon(public_completed)
        expected_path = {
            "schema_id": "pw-r9-path-terminal-v2", "run_id": run_root.name,
            "slot": slot, "status": status, "scheduled_rows": len(scheduled),
            "completed_rows": len(slot_completed), "pass_rows": pass_rows,
            "subject_fail_rows": fail_rows, "invalid_rows": slot_invalid,
            "ineligible_after_subject_fail_ordinals": ineligible,
            "stopped_after_signal_ordinals": stopped,
            "controller_aborted_ordinals": aborted, "missing_ordinals": [],
            "stage_artifacts": artifact_rows,
            "stage_artifact_count": len(artifact_rows),
            "eligible_stage_count": len(expected_artifacts[slot]),
            "missing_stage_artifacts": [], "invalid_stage_artifacts": [],
            "completion_inventory_sha256": _sha(completion_inventory),
            "completion_inventory_bytes": len(completion_inventory),
        }
        path = run_root / "terminals" / f"{slot}.json"
        path_bytes, actual_path = _json_object(
            path, f"path terminal {slot}", canonical=True,
        )
        _exact_keys(actual_path, path_terminal_keys, f"path terminal {slot}")
        for key in (
            "scheduled_rows", "completed_rows", "pass_rows", "subject_fail_rows",
            "stage_artifact_count", "eligible_stage_count",
            "completion_inventory_bytes",
        ):
            _integer(actual_path.get(key), f"path terminal {slot}.{key}", 0)
        if actual_path != expected_path:
            _fail("PATH_TERMINAL_MISMATCH", slot)
        path_records.append(expected_path)
        path_ids.append({
            "slot": slot, "sha256": _sha(path_bytes), "bytes": len(path_bytes),
        })

    scheduled_count = len(rows)
    completed_count = len(completed)
    passed_count = sum(record["status"] == "PASS" for record in completed)
    failed_count = sum(record["status"] == "FAIL" for record in completed)
    invalid_count = len(invalid)
    ineligible_count = sum(
        len(record["ineligible_after_subject_fail_ordinals"])
        for record in path_records
    )
    stopped_count = sum(
        len(record["stopped_after_signal_ordinals"]) for record in path_records
    )
    aborted_count = sum(
        len(record["controller_aborted_ordinals"]) for record in path_records
    )
    artifact_count = sum(record["stage_artifact_count"] for record in path_records)
    full_matrix = run["planned_call_count"] == 291
    clean_matrix = (
        full_matrix and passed_count == 291 and failed_count == 0
        and invalid_count == 0 and ineligible_count == 0 and stopped_count == 0
        and aborted_count == 0 and completed_count == 291 and artifact_count == 54
    )
    if (
        cause is not None and cause["kind"] == "CONTROLLER_INVALID"
    ) or invalid_count:
        matrix_status = "CONTROLLER_INVALID"
    elif cause is not None and cause["kind"] == "STOPPED_AFTER_DRAIN":
        matrix_status = "STOPPED_AFTER_DRAIN"
    elif failed_count:
        matrix_status = "VALID_SUBJECT_FAIL"
    elif full_matrix and clean_matrix:
        matrix_status = "PASS"
    elif (
        not full_matrix
        and completed_count == scheduled_count
        and passed_count == scheduled_count
    ):
        matrix_status = "PASS"
    else:
        _fail("MATRIX_OUTCOME_UNCLASSIFIED", run_root.name)
    expected_matrix = {
        "schema_id": "pw-r9-matrix-terminal-v2", "run_id": run_root.name,
        "status": matrix_status, "cause": cause,
        "scheduled_rows": scheduled_count, "completed_rows": completed_count,
        "pass_rows": passed_count, "subject_fail_rows": failed_count,
        "invalid_rows": invalid_count, "ineligible_rows": ineligible_count,
        "stopped_rows": stopped_count, "controller_aborted_rows": aborted_count,
        "missing_rows": 0, "stage_artifact_count": artifact_count,
        "required_clean_stage_artifacts": 54 if full_matrix else 0,
        "clean_matrix": clean_matrix, "path_terminals": path_ids,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    if matrix != expected_matrix:
        _fail("MATRIX_TERMINAL_MISMATCH", "matrix_terminal.json")

    accounting_keys = {
        "schema_id", "run_id", "status", "matrix_terminal_sha256",
        "matrix_terminal_bytes", "planned_calls", "attempts",
        "captured_raw_results", "valid_completions", "pass_rows",
        "subject_fail_rows", "ineligible_rows", "stopped_rows",
        "controller_aborted_rows", "invalid_rows", "missing_rows",
        "stage_artifact_count", "unknown_or_uncaptured_dispatches",
        "retry_count", "best_of", "replacement_count",
    }
    _, accounting = _json_object(
        run_root / "accounting.json", "accounting", canonical=True,
    )
    _exact_keys(accounting, accounting_keys, "accounting")
    for key in (
        "matrix_terminal_bytes", "planned_calls", "attempts",
        "captured_raw_results", "valid_completions", "pass_rows",
        "subject_fail_rows", "ineligible_rows", "stopped_rows",
        "controller_aborted_rows", "invalid_rows", "missing_rows",
        "stage_artifact_count", "unknown_or_uncaptured_dispatches",
        "retry_count", "replacement_count",
    ):
        _integer(accounting.get(key), f"accounting.{key}", 0)
    _boolean(accounting.get("best_of"), "accounting.best_of")
    attempts = len(present)
    captured_raw_results = completed_count + sum(
        bool(record["raw_present"]) for record in invalid.values()
    )
    expected_accounting = {
        "schema_id": "pw-r9-accounting-v2", "run_id": run_root.name,
        "status": matrix_status, "matrix_terminal_sha256": _sha(matrix_bytes),
        "matrix_terminal_bytes": len(matrix_bytes),
        "planned_calls": scheduled_count, "attempts": attempts,
        "captured_raw_results": captured_raw_results,
        "valid_completions": completed_count, "pass_rows": passed_count,
        "subject_fail_rows": failed_count, "ineligible_rows": ineligible_count,
        "stopped_rows": stopped_count, "controller_aborted_rows": aborted_count,
        "invalid_rows": invalid_count, "missing_rows": 0,
        "stage_artifact_count": artifact_count,
        "unknown_or_uncaptured_dispatches": attempts - captured_raw_results,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    if accounting != expected_accounting:
        _fail("ACCOUNTING_MISMATCH", "accounting.json")
    return matrix, accounting


def _global_freshness(evidence_root: _Path) -> tuple[int, int]:
    inventory = _entries(evidence_root, "evidence root")
    seen: dict[str, str] = {}
    run_count = 0

    def add(value: _Any, location: str) -> None:
        if not isinstance(value, str) or not value:
            _fail("GLOBAL_IDENTITY_MISSING", location)
        prior = seen.get(value)
        if prior is not None:
            _fail(
                "GLOBAL_IDENTITY_OR_NONCE_COLLISION",
                f"{value}: {prior} and {location}",
            )
        seen[value] = location

    for run_name, is_dir in sorted(inventory.items()):
        if not is_dir or not _SAFE_NAME.fullmatch(run_name):
            _fail("EVIDENCE_ROOT_ENTRY_INVALID", run_name)
        sibling = evidence_root / run_name
        _, run = _json_object(
            sibling / "run.json", f"global run {run_name}", canonical=True,
        )
        if (
            run.get("schema_id") != "pw-r9-run-v3"
            or run.get("run_id") != run_name
            or set(run) != _RUN_KEYS
        ):
            _fail("GLOBAL_RUN_IDENTITY_MISMATCH", run_name)
        schedule = run.get("schedule")
        if not isinstance(schedule, list):
            _fail("GLOBAL_RUN_SCHEDULE_MISSING", run_name)
        for index, raw in enumerate(schedule):
            row = _exact_keys(
                raw, _ROW_KEYS, f"global run {run_name} row {index}",
            )
            nonce = row.get("nonce")
            invocation_id = row.get("invocation_id")
            task_name = row.get("task_name")
            canonical_path = row.get("expected_canonical_task_path")
            if (
                not isinstance(nonce, str) or not _HEX64.fullmatch(nonce)
                or invocation_id != f"r9-invocation:{nonce}"
                or task_name != f"r9_{nonce}"
                or not isinstance(task_name, str)
                or not _TASK_NAME.fullmatch(task_name)
                or canonical_path != f"/root/{task_name}"
            ):
                _fail("GLOBAL_RUN_ROW_IDENTITY_MISMATCH", f"{run_name}:{index}")
            add(nonce, f"{run_name}:nonce:{index}")
            add(invocation_id, f"{run_name}:invocation_id:{index}")
            add(canonical_path, f"{run_name}:canonical_task_path:{index}")
        run_count += 1
    return run_count, len(seen)


def verify(run_root: _Path, expected: dict[str, _Any]) -> dict[str, _Any]:
    """Independently verify one terminal iteration-010 run without persistence."""
    completed_checks: list[str] = []
    run_id = expected.get("run_id") if isinstance(expected, dict) and isinstance(expected.get("run_id"), str) else None
    run_kind = expected.get("run_kind") if isinstance(expected, dict) and isinstance(expected.get("run_kind"), str) else None
    try:
        controls = _load_semantic()
        bundle, bundle_storages = _component_bundle()
        completed_checks.append("semantic_pipeline_bundle")
        expectation = _validate_expected(run_root, expected, controls, bundle)
        completed_checks.append("expected_interface")
        _, run, rows = _load_run(run_root, expectation, controls, bundle)
        completed_checks.append("run_manifest")
        custody = _validate_custody(run, bundle, bundle_storages)
        completed_checks.append("custody")

        root_inventory = _entries(run_root, "run root")
        base_root = {
            "run.json": False, "cells": True, "artifacts": True,
            "terminals": True, "matrix_terminal.json": False,
            "accounting.json": False,
        }
        if root_inventory not in (base_root, {**base_root, "controller_invalid.json": False}):
            _fail("RUN_ROOT_INVENTORY_MISMATCH", str(sorted(root_inventory)))
        artifacts, artifacts_by_slot = _load_artifacts(run_root, controls)
        completed, records, invalid, present = _load_rows(
            run_root, run, rows, controls, artifacts,
        )
        completed_checks.extend((
            "exact_inventory", "causal_dependency_gates", "row_chains",
            "provider_bytes", "collaboration_terminals", "deterministic_scores",
        ))
        matrix, accounting = _validate_terminals(
            run_root, run, rows, controls, completed, records, invalid, present,
            artifacts, artifacts_by_slot, root_inventory,
        )
        completed_checks.extend((
            "stage_artifacts", "schedule_and_stop_rules", "path_terminals",
            "matrix_terminal", "accounting",
        ))
        run_count, unique_values = _global_freshness(expectation["evidence_root"])
        completed_checks.append("global_identity_and_nonce_freshness")
        qualification_credit = int(
            run_kind == "run-matrix" and run["mode"] == "actual"
            and matrix["status"] == "PASS" and matrix["clean_matrix"] is True
        )
        report = {
            "schema_id": "pw-r9-offline-verifier-report-v3", "valid": True,
            "run_id": expectation["run_id"], "run_kind": expectation["run_kind"],
            "matrix_status": matrix["status"], "error": None,
            "checks": {key: True for key in _CHECKS},
            "counts": {
                "planned_calls": accounting["planned_calls"],
                "completed_rows": matrix["completed_rows"],
                "pass_rows": matrix["pass_rows"],
                "subject_fail_rows": matrix["subject_fail_rows"],
                "ineligible_rows": matrix["ineligible_rows"],
                "stopped_rows": matrix["stopped_rows"],
                "controller_aborted_rows": matrix["controller_aborted_rows"],
                "stage_artifacts": matrix["stage_artifact_count"],
                "evidence_runs_scanned": run_count,
                "globally_unique_identity_and_nonce_values": unique_values,
            },
            "credit": {
                "qualification_clean_run_credit": qualification_credit,
                "synthetic_credit": 0,
                "controller_invalid_credit": 0,
            },
            "bundle": bundle, "custody": custody,
            "calls": {
                "model": 0, "collaboration": 0, "provider": 0,
                "subject": 0, "network": 0,
            },
            "residuals": [
                "Final bytes and exact causal chains are verified; historical O_EXCL and fsync calls are trusted-controller obligations not reconstructable from a filesystem snapshot.",
                "Requested collaboration route fields and returned canonical task path are retained; effective provider routing and unexposed internal activity remain trusted-platform residuals.",
                "No recursive verifier authority, callback confinement, reflection resistance, or hostile in-process caller resistance is claimed.",
            ],
        }
        _canon(report)
        return report
    except _Invalid as exc:
        return {
            "schema_id": "pw-r9-offline-verifier-report-v3", "valid": False,
            "run_id": run_id, "run_kind": run_kind,
            "matrix_status": "CONTROLLER_INVALID",
            "error": {"code": exc.code, "detail": exc.detail},
            "checks": {key: key in completed_checks for key in _CHECKS},
            "counts": None, "credit": {
                "qualification_clean_run_credit": 0, "synthetic_credit": 0,
                "controller_invalid_credit": 0,
            },
            "bundle": None, "custody": None,
            "calls": {
                "model": 0, "collaboration": 0, "provider": 0,
                "subject": 0, "network": 0,
            },
            "residuals": [
                "No recursive verifier authority or private-helper threat chasing is claimed.",
            ],
        }
    except Exception as exc:  # fail closed without traceback or evidence mutation
        return {
            "schema_id": "pw-r9-offline-verifier-report-v3", "valid": False,
            "run_id": run_id, "run_kind": run_kind,
            "matrix_status": "CONTROLLER_INVALID",
            "error": {"code": "UNEXPECTED_VERIFIER_ERROR", "detail": f"{type(exc).__name__}: {exc}"},
            "checks": {key: key in completed_checks for key in _CHECKS},
            "counts": None, "credit": {
                "qualification_clean_run_credit": 0, "synthetic_credit": 0,
                "controller_invalid_credit": 0,
            },
            "bundle": None, "custody": None,
            "calls": {
                "model": 0, "collaboration": 0, "provider": 0,
                "subject": 0, "network": 0,
            },
            "residuals": ["Unexpected verifier error; evidence receives no credit."],
        }
