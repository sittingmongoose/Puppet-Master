#!/usr/bin/env python3
"""Standalone trusted sequential controller for R9 stabilization iteration 010."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import select
import signal
import stat
import subprocess
import sys
from typing import Any

sys.dont_write_bytecode = True
from verifier import verify

ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parents[1]
REPO = ROOT.parents[4]
ITERATION_REL = ROOT.relative_to(SUCCESSOR)
OPERATING = SUCCESSOR / "r9_goal_operating_contract_v1.json"
SUBJECT_TRANSPORT_ADDENDUM = SUCCESSOR / "r9_subject_transport_addendum_subagent_invocations_v1.json"
ROUTE_CAPABILITY_RECEIPT = SUCCESSOR / "r9_subject_transport_subagent_route_capability_receipt_v1.json"
ARCHITECTURE = ROOT / "architecture_contract.json"
SEMANTIC = ROOT / "semantic_manifest.json"
PIPELINE = ROOT / "pipeline_contract.json"
DEFAULT_EVIDENCE = ROOT / "evidence"
SIMULATOR_EVIDENCE_ENV = "PW_R9_SIMULATOR_EVIDENCE_ROOT"
SAFE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
NONCE = re.compile(r"[0-9a-f]{64}\Z")
TASK_NAME = re.compile(r"[a-z][a-z0-9_]{0,127}\Z")
GIT_HEAD = re.compile(r"[0-9a-f]{40,64}\Z")
FAILURE_TYPE = re.compile(r"[A-Z][A-Z0-9_]{0,127}\Z")
STOP = False
STOP_SIGNALS = {signal.SIGINT, signal.SIGTERM}
TRANSPORT_INSTRUCTION = (
    b"TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your first final response. "
    b"Do not use tools, files, browsing, network, memory, delegation, or other agents.\n\n"
)
SPAWN_REQUEST_FIELDS = {
    "schema_id", "run_id", "run_kind", "mode", "slot", "cell", "index", "ordinal",
    "nonce", "invocation_id", "task_name", "expected_canonical_task_path", "agent_type",
    "fork_turns", "model", "reasoning_effort", "packet_sha256", "packet_bytes",
    "message_utf8", "message_sha256", "message_bytes", "attempt_sha256", "attempt_bytes",
}
SPAWN_RECEIPT_FIELDS = {
    "schema_id", "invocation_id", "spawn_request_sha256", "tool_result",
    "returned_identity_kind", "returned_canonical_task_path",
}
TERMINAL_DELIVERY_FIELDS = {
    "schema_id", "invocation_id", "returned_canonical_task_path", "message_type",
    "final_utf8", "observed_activity", "terminal_status",
}
FAILURE_EVENT_FIELDS = {"schema_id", "invocation_id", "phase", "failure_type", "detail"}
ACTIVITY_FIELDS = {
    "tool_calls", "file_accesses", "browsing", "network_accesses", "delegations",
    "memory_accesses", "followup_turns", "nonterminal_messages", "observation_basis",
}

BUNDLE_RELATIVE_PATHS = (
    Path("r9_goal_operating_contract_v1.json"),
    Path("r9_subject_transport_addendum_subagent_invocations_v1.json"),
    Path("r9_subject_transport_subagent_route_capability_receipt_v1.json"),
    ITERATION_REL / "architecture_contract.json",
    ITERATION_REL / "backend.py",
    ITERATION_REL / "backend_contract.json",
    ITERATION_REL / "controller.py",
    ITERATION_REL / "fault_scenarios.json",
    ITERATION_REL / "pipeline_contract.json",
    ITERATION_REL / "regression_catalog.json",
    ITERATION_REL / "regression_inventory_receipt.json",
    ITERATION_REL / "routes.json",
    ITERATION_REL / "schedule.json",
    ITERATION_REL / "semantic_inventory_receipt.json",
    ITERATION_REL / "semantic_manifest.json",
    ITERATION_REL / "simulator_contract.json",
    ITERATION_REL / "verifier.py",
    ITERATION_REL / "verifier_contract.json",
)


class Invalid(RuntimeError):
    """A controller, transport, custody, or evidence invariant failed."""


def _canon(value: Any) -> bytes:
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                          separators=(",", ":")).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise Invalid(f"not canonical-JSON-able: {exc}") from exc


def _semantic_canon(value: Any) -> bytes:
    """Minify while preserving the frozen manifest's declared object-key order."""
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=False,
                          separators=(",", ":")).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise Invalid(f"not semantic-canonical-JSON-able: {exc}") from exc


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise Invalid(f"duplicate JSON key: {key}")
        value[key] = item
    return value


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
        value = json.loads(storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
                           parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or (exact and storage != _canon(value) + b"\n"):
        raise Invalid(f"{label}: not a canonical object")
    return storage, value


def _semantic_json(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise Invalid(f"{label}: not one-LF JSON storage")
    try:
        value = json.loads(storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
                           parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or storage != _semantic_canon(value) + b"\n":
        raise Invalid(f"{label}: not declared-order canonical object")
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


def _binding(path: Path, storage: bytes, base: Path = SUCCESSOR) -> dict[str, Any]:
    try:
        relative = path.relative_to(base)
    except ValueError as exc:
        raise Invalid(f"binding escapes declared base: {path}") from exc
    return {"path": relative.as_posix(), "sha256": _sha(storage), "bytes": len(storage)}


def _evidence_binding(root: Path, path: Path, storage: bytes, kind: str, identity: str) -> dict[str, Any]:
    try:
        relative = path.relative_to(root).as_posix()
    except ValueError as exc:
        raise Invalid(f"causal input escapes run root: {path}") from exc
    return {"kind": kind, "id": identity, "path": relative,
            "sha256": _sha(storage), "bytes": len(storage)}


def _name(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SAFE.fullmatch(value):
        raise Invalid(f"{label}: unsafe name")
    return value


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _git_head() -> str:
    completed = subprocess.run(
        ["git", "-C", str(REPO), "rev-parse", "HEAD"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    try:
        head = completed.stdout.decode("ascii").strip()
    except UnicodeDecodeError as exc:
        raise Invalid("Git HEAD is not ASCII") from exc
    if completed.returncode != 0 or not GIT_HEAD.fullmatch(head):
        raise Invalid("current Git HEAD unavailable")
    return head


def _bundle() -> tuple[dict[str, Any], dict[str, bytes]]:
    files: list[dict[str, Any]] = []
    storages: dict[str, bytes] = {}
    for relative in sorted(BUNDLE_RELATIVE_PATHS, key=lambda item: item.as_posix()):
        path = SUCCESSOR / relative
        storage = _regular(path, f"bundle file {relative.as_posix()}")
        row = _binding(path, storage)
        files.append(row)
        storages[row["path"]] = storage
    rows = _canon(files)
    bundle = {"file_count": len(files),
              "aggregate_file_bytes": sum(row["bytes"] for row in files),
              "rows_sha256": _sha(rows), "rows_bytes": len(rows), "files": files}
    return bundle, storages


def _require_head_custody(head: str, bundle: dict[str, Any], storages: dict[str, bytes]) -> None:
    for row in bundle["files"]:
        successor_relative = Path(row["path"])
        repo_relative = (SUCCESSOR.relative_to(REPO) / successor_relative).as_posix()
        completed = subprocess.run(
            ["git", "-C", str(REPO), "show", f"{head}:{repo_relative}"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        if completed.returncode != 0 or completed.stdout != storages[row["path"]]:
            raise Invalid(f"actual-run bundle is not pinned to Git HEAD: {row['path']}")


def _identity_matches(binding: Any, storage: bytes) -> bool:
    if not isinstance(binding, dict):
        return False
    digest = binding.get("sha256", binding.get("storage_sha256"))
    count = binding.get("bytes", binding.get("storage_bytes"))
    return (digest, count) == (_sha(storage), len(storage))


def _controls() -> dict[str, Any]:
    operating_bytes, operating = _json(OPERATING, "operating contract", False)
    if operating.get("schema_id") != "pw-r9-goal-operating-contract-v1":
        raise Invalid("operating-contract schema mismatch")
    architecture_bytes, architecture = _json(ARCHITECTURE, "architecture contract", False)
    if architecture.get("schema_id") != "pw-r9-minimal-controller-architecture-v2":
        raise Invalid("architecture-contract schema mismatch")
    lineage = architecture.get("lineage")
    operating_repo_path = OPERATING.relative_to(REPO).as_posix()
    if (not isinstance(lineage, dict)
            or not _identity_matches(lineage.get("operating_contract"), operating_bytes)
            or lineage["operating_contract"].get("path") != operating_repo_path):
        raise Invalid("architecture operating-contract lineage mismatch")
    if lineage.get("prior_controller_runtime_imported") is not False:
        raise Invalid("architecture permits prior-controller runtime import")

    addendum_bytes, addendum = _json(
        SUBJECT_TRANSPORT_ADDENDUM, "subject-transport addendum", False,
    )
    capability_bytes, capability = _json(
        ROUTE_CAPABILITY_RECEIPT, "subject-route capability receipt", False,
    )
    addendum_repo_path = SUBJECT_TRANSPORT_ADDENDUM.relative_to(REPO).as_posix()
    capability_repo_path = ROUTE_CAPABILITY_RECEIPT.relative_to(REPO).as_posix()
    if (
        not _identity_matches(lineage.get("subject_transport_addendum"), addendum_bytes)
        or lineage["subject_transport_addendum"].get("path") != addendum_repo_path
        or not _identity_matches(lineage.get("subagent_route_capability"), capability_bytes)
        or lineage["subagent_route_capability"].get("path") != capability_repo_path
    ):
        raise Invalid("architecture subject-transport lineage mismatch")
    if addendum.get("schema_id") != "pw-r9-subject-transport-addendum-v1":
        raise Invalid("subject-transport addendum schema mismatch")
    if (
        capability.get("schema_id") != "pw-r9-subagent-route-capability-receipt-v1"
        or capability.get("status")
        != "PASS_REQUESTED_COLLABORATION_ROUTE_OVERRIDES_ACCEPTED_NON_EMPIRICAL_ZERO_CREDIT"
        or capability.get("transport_addendum")
        != _binding(SUBJECT_TRANSPORT_ADDENDUM, addendum_bytes, REPO)
        or capability.get("adjudication") != {
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
        }
        or capability.get("calls") != {
            "non_empirical_helper_model_invocations": 3,
            "empirical_subject_invocations": 0,
            "frozen_test_packets_presented": 0,
            "qualification_credit": 0,
        }
    ):
        raise Invalid("subject-route capability receipt adjudication mismatch")
    transport = architecture.get("subject_transport")
    if (
        not isinstance(transport, dict)
        or transport.get("schema_id") != "pw-r9-collaboration-subagent-transport-contract-v1"
        or transport.get("authority") != addendum_repo_path
        or transport.get("public_controller_commands")
        != ["simulate", "run-canary", "run-matrix", "reopen"]
    ):
        raise Invalid("architecture collaboration transport mismatch")
    dispatcher = transport.get("dispatcher")
    if (
        not isinstance(dispatcher, dict)
        or dispatcher.get("tool") != "collaboration.spawn_agent"
        or dispatcher.get("agent_type") != "default"
        or dispatcher.get("fork_turns") != "none"
        or dispatcher.get("one_new_subagent_per_row") is not True
        or dispatcher.get("exact_model_and_reasoning_effort_from_frozen_route") is not True
        or any(dispatcher.get(key) is not False for key in (
            "followup_task", "send_message", "reuse", "interrupt_and_replace",
            "best_of",
        ))
        or any(dispatcher.get(key) != 0 for key in (
            "retry_count", "replacement_count",
        ))
    ):
        raise Invalid("architecture collaboration dispatcher mismatch")
    provider_message = transport.get("provider_message")
    instruction_text = TRANSPORT_INSTRUCTION.decode("utf-8")
    if (
        not isinstance(provider_message, dict)
        or provider_message.get("instruction_utf8") != instruction_text
        or provider_message.get("instruction_sha256") != _sha(TRANSPORT_INSTRUCTION)
        or provider_message.get("instruction_bytes") != len(TRANSPORT_INSTRUCTION)
        or len(TRANSPORT_INSTRUCTION) != 174
    ):
        raise Invalid("architecture transport instruction mismatch")
    addendum_transport = addendum.get("subject_transport")
    if (
        not isinstance(addendum_transport, dict)
        or addendum_transport.get("kind") != "COLLABORATION_SUBAGENT_INVOCATION"
        or addendum_transport.get("fork_turns") != "none"
        or addendum_transport.get("reuse_or_followup") is not False
        or addendum_transport.get("minimal_transport_instruction_utf8") != instruction_text
        or addendum_transport.get("minimal_transport_instruction_sha256")
        != _sha(TRANSPORT_INSTRUCTION)
        or addendum_transport.get("minimal_transport_instruction_bytes")
        != len(TRANSPORT_INSTRUCTION)
    ):
        raise Invalid("binding subject-transport addendum mismatch")
    spawn_contract = transport.get("spawn_request")
    root_events = transport.get("root_events")
    if (
        not isinstance(spawn_contract, dict)
        or spawn_contract.get("schema_id") != "pw-r9-subagent-spawn-request-v1"
        or set(spawn_contract.get("exact_fields", [])) != SPAWN_REQUEST_FIELDS
        or not isinstance(root_events, dict)
        or root_events.get("spawn_receipt_schema")
        != "pw-r9-subagent-spawn-receipt-event-v1"
        or root_events.get("terminal_delivery_schema")
        != "pw-r9-subagent-terminal-delivery-event-v1"
        or root_events.get("failure_schema")
        != "pw-r9-subagent-transport-failure-event-v1"
        or set(root_events.get("spawn_receipt_required_fields", []))
        != SPAWN_RECEIPT_FIELDS
        or set(root_events.get("terminal_delivery_required_fields", []))
        != TERMINAL_DELIVERY_FIELDS
        or set(root_events.get("observed_activity_exact_fields", []))
        != ACTIVITY_FIELDS
        or root_events.get("accepted_message_type") != "FINAL_ANSWER"
        or root_events.get("accepted_terminal_status") != "FINAL_RETURNED"
    ):
        raise Invalid("architecture root-event protocol mismatch")

    semantic_bytes, semantic = _semantic_json(SEMANTIC, "semantic manifest")
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v2":
        raise Invalid("semantic-manifest schema mismatch")
    exact_top = {"schema_id", "routes", "schedule", "stage_order", "cells",
                 "deterministic_stages", "files", "canary_cell"}
    if set(semantic) != exact_top:
        raise Invalid("semantic-manifest top-level shape mismatch")
    pipeline_bytes, pipeline = _semantic_json(PIPELINE, "pipeline contract")
    if pipeline.get("schema_id") != "pw-r9-semantic-pipeline-contract-v1":
        raise Invalid("pipeline-contract schema mismatch")
    if set(pipeline) != {"schema_id", "status", "bindings", "rule", "manifest_contract",
                         "cell_dependency_gate", "stage_finalization", "execution_requirements",
                         "forbidden_dependencies", "calls", "nonclaims"}:
        raise Invalid("pipeline-contract top-level shape mismatch")
    rule = pipeline.get("rule")
    if not isinstance(rule, dict) or rule.get("id") != "pw-r9-exact-input-frozen-artifact-v1":
        raise Invalid("pipeline causal rule mismatch")
    manifest_contract = pipeline.get("manifest_contract")
    required_manifest_claims = {
        "schema_id": "pw-r9-semantic-manifest-v2", "route_count": 3, "cell_count": 97,
        "schedule_entry_count": 291, "deterministic_stage_count": 18,
        "route_local_stage_artifact_count": 54, "stage_order_is_total": True,
        "canary_cell": "S10A_DECISION_A01", "canary_dependency_gate_is_empty": True,
        "render_bytes_are_frozen_not_runtime_interpolated": True,
        "expected_outputs_are_exact_closed_oracles": True, "runtime_prior_control_imports": 0,
    }
    if manifest_contract != required_manifest_claims:
        raise Invalid("pipeline manifest contract mismatch")
    execution = pipeline.get("execution_requirements")
    required_execution = {
        "one_fresh_isolated_subagent_invocation_per_subject_row", "predeclared_unique_nonce_per_schedule_row",
        "attempt_created_before_dispatch", "raw_result_persisted_before_score",
        "completion_written_last", "stage_artifact_written_only_after_input_reopen",
        "independent_reopen_replays_all_cell_and_stage_gates", "no_post_fail_same_slot_dispatch",
        "no_post_invalid_dispatch",
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
    if (not isinstance(execution, dict)
            or set(execution) != required_execution | {"schedule_order", "frozen_route_mapping"}
            or execution.get("schedule_order") != "exact slot-major schedule.json order"
            or execution.get("frozen_route_mapping") != route_mapping
            or any(execution.get(key) is not True for key in required_execution)):
        raise Invalid("pipeline execution requirements mismatch")
    bindings = pipeline.get("bindings")
    if not isinstance(bindings, dict):
        raise Invalid("pipeline bindings absent")
    pipeline_targets = {
        "r9_goal_operating_contract": (OPERATING, operating_repo_path),
        "parent_progress_assessment": (
            ROOT.parent / "iteration_001" / "progress_assessment.json",
            (ROOT.parent / "iteration_001" / "progress_assessment.json").relative_to(REPO).as_posix(),
        ),
        "causal_pipeline_diagnosis": (
            ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json",
            (ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json").relative_to(REPO).as_posix(),
        ),
        "semantic_manifest": (SEMANTIC, "semantic_manifest.json"),
        "schedule": (ROOT / "schedule.json", "schedule.json"),
        "routes": (ROOT / "routes.json", "routes.json"),
    }
    if set(bindings) != set(pipeline_targets):
        raise Invalid("pipeline binding set mismatch")
    for key, (path, declared_path) in pipeline_targets.items():
        storage = _regular(path, f"pipeline binding {key}")
        binding = bindings[key]
        if (not _identity_matches(binding, storage)
                or not isinstance(binding, dict) or binding.get("path") != declared_path):
            raise Invalid(f"pipeline binding mismatch: {key}")

    routes = semantic["routes"]
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
    expected_roster = [
        {"slot": route["slot"], "model": route["model"],
         "reasoning_effort": route["thinking"]}
        for route in routes
    ]
    if addendum.get("frozen_roster") != expected_roster:
        raise Invalid("subject-transport addendum/frozen route mismatch")
    capability_invocations = capability.get("invocations")
    if not isinstance(capability_invocations, list) or len(capability_invocations) != 3:
        raise Invalid("subject-route capability invocation inventory mismatch")
    expected_capability_pairs = [
        (route["model"], route["thinking"]) for route in routes
    ]
    capability_names: set[str] = set()
    for sequence, (invocation, expected_pair) in enumerate(
        zip(capability_invocations, expected_capability_pairs, strict=True), 1,
    ):
        if not isinstance(invocation, dict) or set(invocation) != {
            "sequence", "task_name", "canonical_task_path", "agent_type",
            "fork_turns", "requested_model", "requested_reasoning_effort",
            "request_message_sha256", "request_message_bytes",
            "terminal_message_type", "terminal_utf8", "terminal_sha256",
            "terminal_bytes", "result",
        }:
            raise Invalid("subject-route capability invocation shape mismatch")
        task_name = invocation.get("task_name")
        terminal_utf8 = _result_utf8(
            invocation.get("terminal_utf8"), "capability terminal_utf8",
        )
        if (
            invocation.get("sequence") != sequence
            or isinstance(invocation.get("sequence"), bool)
            or not isinstance(task_name, str) or not TASK_NAME.fullmatch(task_name)
            or task_name in capability_names
            or invocation.get("canonical_task_path") != f"/root/{task_name}"
            or invocation.get("agent_type") != "default"
            or invocation.get("fork_turns") != "none"
            or (
                invocation.get("requested_model"),
                invocation.get("requested_reasoning_effort"),
            ) != expected_pair
            or not isinstance(invocation.get("request_message_sha256"), str)
            or not NONCE.fullmatch(invocation["request_message_sha256"])
            or _result_int(
                invocation.get("request_message_bytes"),
                "capability request_message_bytes", 1,
            ) != invocation["request_message_bytes"]
            or invocation.get("terminal_message_type") != "FINAL_ANSWER"
            or invocation.get("terminal_sha256") != _sha(terminal_utf8)
            or _result_int(
                invocation.get("terminal_bytes"), "capability terminal_bytes", 1,
            ) != len(terminal_utf8)
            or invocation.get("result")
            != "PASS_REQUEST_ACCEPTED_AND_TERMINAL_RETURNED"
        ):
            raise Invalid("subject-route capability invocation binding mismatch")
        capability_names.add(task_name)

    schedule = semantic["schedule"]
    cells = semantic["cells"]
    if not isinstance(schedule, list) or len(schedule) != 97:
        raise Invalid("exact 97-cell schedule required")
    schedule = [_name(item, "cell") for item in schedule]
    if len(set(schedule)) != 97 or not isinstance(cells, list) or len(cells) != 97:
        raise Invalid("schedule/cell cardinality mismatch")
    cell_fields = {
        "index", "cell", "render_utf8", "render_utf8_sha256", "render_utf8_bytes",
        "expected_output", "expected_output_sha256", "expected_output_bytes",
        "expected_output_storage_sha256", "expected_output_storage_bytes", "dependency_gate",
    }
    cell_by_id: dict[str, dict[str, Any]] = {}
    for index, cell in enumerate(cells):
        if not isinstance(cell, dict) or set(cell) != cell_fields:
            raise Invalid("cell shape mismatch")
        name = _name(cell.get("cell"), "cell")
        if cell.get("index") != index or name != schedule[index]:
            raise Invalid("cell order mismatch")
        render = cell.get("render_utf8")
        if not isinstance(render, str):
            raise Invalid("cell render absent")
        render_bytes = render.encode("utf-8")
        if not render_bytes.endswith(b"\n") or render_bytes.endswith(b"\n\n") or b"\r" in render_bytes:
            raise Invalid("render is not exact one-LF UTF-8")
        if (cell.get("render_utf8_sha256"), cell.get("render_utf8_bytes")) != (
                _sha(render_bytes), len(render_bytes)):
            raise Invalid("render identity mismatch")
        expected_payload = _semantic_canon(cell.get("expected_output"))
        expected_storage = expected_payload + b"\n"
        if (cell.get("expected_output_sha256"), cell.get("expected_output_bytes")) != (
                _sha(expected_payload), len(expected_payload)):
            raise Invalid("expected-output payload identity mismatch")
        if (cell.get("expected_output_storage_sha256"), cell.get("expected_output_storage_bytes")) != (
                _sha(expected_storage), len(expected_storage)):
            raise Invalid("expected-output storage identity mismatch")
        gate = cell.get("dependency_gate")
        if not isinstance(gate, dict) or set(gate) != {
                "rule", "required_pass_cells", "required_stage_artifacts"}:
            raise Invalid("cell dependency-gate shape mismatch")
        if gate["rule"] != "pw-r9-exact-input-frozen-artifact-v1":
            raise Invalid("cell dependency-gate rule mismatch")
        for key in ("required_pass_cells", "required_stage_artifacts"):
            if not isinstance(gate[key], list):
                raise Invalid("cell dependency list absent")
            gate[key] = [_name(item, f"{name} dependency") for item in gate[key]]
            if len(gate[key]) != len(set(gate[key])):
                raise Invalid("duplicate cell dependency")
        cell_by_id[name] = cell

    stage_order = semantic["stage_order"]
    stages = semantic["deterministic_stages"]
    if not isinstance(stage_order, list) or len(stage_order) != 18:
        raise Invalid("exact 18-stage order required")
    stage_order = [_name(item, "stage") for item in stage_order]
    if len(set(stage_order)) != 18 or not isinstance(stages, list) or len(stages) != 18:
        raise Invalid("stage cardinality mismatch")
    stage_fields = {
        "index", "stage", "rule", "predecessor_stages", "direct_subject_cells",
        "finalization_boundary", "expected_artifact", "expected_artifact_sha256",
        "expected_artifact_bytes", "expected_artifact_storage_sha256",
        "expected_artifact_storage_bytes",
    }
    stage_by_id: dict[str, dict[str, Any]] = {}
    for index, stage in enumerate(stages):
        if not isinstance(stage, dict) or set(stage) != stage_fields:
            raise Invalid("deterministic-stage shape mismatch")
        name = _name(stage.get("stage"), "stage")
        if stage.get("index") != index or name != stage_order[index]:
            raise Invalid("stage order mismatch")
        if stage.get("rule") != "pw-r9-exact-input-frozen-artifact-v1":
            raise Invalid("stage rule mismatch")
        predecessors = stage.get("predecessor_stages")
        direct = stage.get("direct_subject_cells")
        if not isinstance(predecessors, list) or not isinstance(direct, list):
            raise Invalid("stage dependency lists invalid")
        predecessors = [_name(item, f"{name} predecessor") for item in predecessors]
        direct = [_name(item, f"{name} direct cell") for item in direct]
        if len(predecessors) != len(set(predecessors)) or len(direct) != len(set(direct)):
            raise Invalid("duplicate stage dependency")
        if any(item not in stage_order[:index] for item in predecessors):
            raise Invalid("stage predecessor is not earlier")
        if any(item not in cell_by_id for item in direct):
            raise Invalid("stage direct cell absent")
        if not predecessors and not direct:
            raise Invalid("stage has no causal dependency")
        boundary = stage.get("finalization_boundary")
        if not isinstance(boundary, dict) or set(boundary) != {
                "after_cell_index", "after_cell", "stage_order_index"}:
            raise Invalid("stage finalization-boundary shape mismatch")
        after_index = boundary.get("after_cell_index")
        if (isinstance(after_index, bool) or not isinstance(after_index, int)
                or not 0 <= after_index < 97
                or boundary.get("after_cell") != schedule[after_index]
                or boundary.get("stage_order_index") != index):
            raise Invalid("stage finalization-boundary mismatch")
        if any(cell_by_id[item]["index"] > after_index for item in direct):
            raise Invalid("stage direct cell follows finalization boundary")
        artifact = stage.get("expected_artifact")
        if not isinstance(artifact, dict):
            raise Invalid("expected stage artifact is not an object")
        payload = _semantic_canon(artifact)
        storage = payload + b"\n"
        if (stage.get("expected_artifact_sha256"), stage.get("expected_artifact_bytes")) != (
                _sha(payload), len(payload)):
            raise Invalid("expected artifact payload identity mismatch")
        if (stage.get("expected_artifact_storage_sha256"),
                stage.get("expected_artifact_storage_bytes")) != (_sha(storage), len(storage)):
            raise Invalid("expected artifact storage identity mismatch")
        stage["predecessor_stages"] = predecessors
        stage["direct_subject_cells"] = direct
        stage_by_id[name] = stage

    for cell in cells:
        gate = cell["dependency_gate"]
        if any(item not in cell_by_id or cell_by_id[item]["index"] >= cell["index"]
               for item in gate["required_pass_cells"]):
            raise Invalid("cell PASS dependency is absent or not earlier")
        for name in gate["required_stage_artifacts"]:
            if name not in stage_by_id:
                raise Invalid("cell stage dependency absent")
            boundary = stage_by_id[name]["finalization_boundary"]["after_cell_index"]
            if boundary >= cell["index"]:
                raise Invalid("cell stage dependency is not finalized earlier")

    files = semantic["files"]
    if not isinstance(files, list) or not files:
        raise Invalid("semantic file inventory absent")
    file_paths: list[str] = []
    for item in files:
        if not isinstance(item, dict) or set(item) != {"path", "sha256", "bytes"}:
            raise Invalid("semantic file binding shape mismatch")
        if not isinstance(item.get("path"), str):
            raise Invalid("semantic source path absent")
        relative = Path(item["path"])
        if relative.is_absolute() or ".." in relative.parts or not relative.parts:
            raise Invalid("semantic source path is unsafe")
        if "__pycache__" in relative.parts or relative.suffix in {".pyc", ".pyo"}:
            raise Invalid("runtime cache is forbidden from semantic inventory")
        resolved = (SUCCESSOR / relative).resolve()
        try:
            resolved.relative_to(SUCCESSOR)
        except ValueError as exc:
            raise Invalid("semantic source escapes successor root") from exc
        storage = _regular(resolved, f"semantic source {relative.as_posix()}")
        if (item.get("sha256"), item.get("bytes")) != (_sha(storage), len(storage)):
            raise Invalid(f"semantic file drift: {relative.as_posix()}")
        file_paths.append(relative.as_posix())
    if file_paths != sorted(file_paths) or len(file_paths) != len(set(file_paths)):
        raise Invalid("semantic file inventory is not sorted unique")

    canary = semantic["canary_cell"]
    if canary not in cell_by_id:
        raise Invalid("canary cell absent")
    bundle, bundle_storages = _bundle()
    return {
        "operating_bytes": operating_bytes, "architecture_bytes": architecture_bytes,
        "subject_transport_addendum_bytes": addendum_bytes,
        "route_capability_receipt_bytes": capability_bytes,
        "semantic_bytes": semantic_bytes, "pipeline_bytes": pipeline_bytes,
        "semantic": semantic, "pipeline": pipeline, "routes": routes, "schedule": schedule,
        "cells": cells, "cell_by_id": cell_by_id, "stage_order": stage_order,
        "stages": stages, "stage_by_id": stage_by_id, "canary": canary,
        "bundle": bundle, "bundle_storages": bundle_storages,
    }


def _evidence_root(command: str, create_default: bool) -> Path:
    override = os.environ.get(SIMULATOR_EVIDENCE_ENV) if command in {"simulate", "reopen"} else None
    if override:
        raw = Path(override)
        if not raw.is_absolute():
            raise Invalid(f"{SIMULATOR_EVIDENCE_ENV} must be absolute")
        _dir(raw, "simulator evidence root")
        return raw.resolve()
    if create_default and not DEFAULT_EVIDENCE.exists():
        _mkdir(DEFAULT_EVIDENCE)
    else:
        _dir(DEFAULT_EVIDENCE, "evidence root")
    return DEFAULT_EVIDENCE.resolve()


def _run_root(text: str, create: bool, evidence: Path) -> Path:
    if not text:
        raise Invalid("--run-root required")
    path = Path(text)
    if not path.is_absolute() and len(path.parts) == 1:
        path = evidence / path
    path = path.resolve()
    if path.parent != evidence:
        raise Invalid("run root must be a direct child of the selected evidence root")
    _name(path.name, "run id")
    if create:
        if path.exists() or path.is_symlink():
            raise Invalid("run exists; resume and relaunch are forbidden")
        _mkdir(path)
        for directory in (path / "cells", path / "artifacts", path / "terminals"):
            _mkdir(directory)
    else:
        _dir(path, "run root")
    return path


def _rows(run_kind: str, controls: dict[str, Any]) -> tuple[list[dict[str, Any]], int]:
    cells = controls["cells"]
    if run_kind == "run-canary":
        cells = [controls["cell_by_id"][controls["canary"]]]
    rows: list[dict[str, Any]] = []
    for ordinal, (route, cell) in enumerate(
        (route, cell) for route in controls["routes"] for cell in cells
    ):
        nonce = secrets.token_hex(32)
        invocation_id = f"r9-invocation:{nonce}"
        task_name = f"r9_{nonce}"
        rows.append({
            "ordinal": ordinal, "slot": route["slot"], "route": route,
            "index": cell["index"], "cell": cell["cell"], "nonce": nonce,
            "invocation_id": invocation_id, "task_name": task_name,
            "expected_canonical_task_path": f"/root/{task_name}",
        })
    expected = 3 if run_kind == "run-canary" else 291
    if len(rows) != expected:
        raise Invalid("selected row count mismatch")
    return rows, len(cells)


def _used_values(evidence: Path) -> set[str]:
    used: set[str] = set()
    for run_root in sorted(evidence.iterdir(), key=lambda item: item.name):
        _dir(run_root, f"prior run {run_root.name}")
        if (run_root / "run.json").exists():
            _, run = _json(run_root / "run.json", "prior run")
            for row in run.get("schedule", []):
                if not isinstance(row, dict):
                    raise Invalid("prior schedule row malformed")
                nonce = row.get("nonce")
                invocation_id = row.get("invocation_id")
                task_name = row.get("task_name")
                expected_path = row.get("expected_canonical_task_path")
                if (
                    not isinstance(nonce, str) or not NONCE.fullmatch(nonce)
                    or invocation_id != f"r9-invocation:{nonce}"
                    or task_name != f"r9_{nonce}"
                    or expected_path != f"/root/{task_name}"
                    or any(item in used for item in (nonce, invocation_id, expected_path))
                ):
                    raise Invalid("prior nonce/invocation/task identity absent or duplicated")
                used.update((nonce, invocation_id, expected_path))
    return used


def _row_path(root: Path, row: dict[str, Any]) -> Path:
    return root / "cells" / row["slot"] / f"{row['index']:03d}_{row['cell']}"


def _artifact_path(root: Path, slot: str, stage: str) -> Path:
    return root / "artifacts" / slot / f"{stage}.json"


def _spawn_request(run: dict[str, Any], row: dict[str, Any], packet: bytes,
                   message: bytes, attempt_id: tuple[str, int]) -> dict[str, Any]:
    request = {
        "schema_id": "pw-r9-subagent-spawn-request-v1", "run_id": run["run_id"],
        "run_kind": run["run_kind"], "mode": run["mode"], "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
        "nonce": row["nonce"], "invocation_id": row["invocation_id"],
        "task_name": row["task_name"],
        "expected_canonical_task_path": row["expected_canonical_task_path"],
        "agent_type": "default", "fork_turns": "none", "model": row["route"]["model"],
        "reasoning_effort": row["route"]["thinking"],
        "packet_sha256": _sha(packet), "packet_bytes": len(packet),
        "message_utf8": message.decode("utf-8"), "message_sha256": _sha(message),
        "message_bytes": len(message), "attempt_sha256": attempt_id[0],
        "attempt_bytes": attempt_id[1],
    }
    if set(request) != SPAWN_REQUEST_FIELDS:
        raise Invalid("spawn-request construction drift")
    return request


def _result_int(value: Any, label: str, minimum: int | None = None) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise Invalid(f"{label} must be an integer")
    if minimum is not None and value < minimum:
        raise Invalid(f"{label} must be at least {minimum}")
    return value


def _result_utf8(value: Any, label: str) -> bytes:
    if not isinstance(value, str):
        raise Invalid(f"{label} must be text")
    try:
        return value.encode("utf-8")
    except UnicodeEncodeError as exc:
        raise Invalid(f"{label} is not valid UTF-8 text") from exc


class _ProtocolReader:
    """Unbuffered canonical one-line JSON reader for the root event channel."""

    def __init__(self) -> None:
        try:
            self.fd = sys.stdin.fileno()
        except (AttributeError, OSError) as exc:
            raise Invalid("stdin does not expose the root-event file descriptor") from exc
        self.buffer = bytearray()
        self.eof = False

    def event(self, label: str) -> dict[str, Any]:
        while b"\n" not in self.buffer:
            if self.eof:
                raise Invalid(f"{label}: missing event")
            chunk = os.read(self.fd, 65536)
            if not chunk:
                self.eof = True
                continue
            self.buffer.extend(chunk)
        line, _, remainder = self.buffer.partition(b"\n")
        self.buffer = bytearray(remainder)
        if not line or b"\r" in line:
            raise Invalid(f"{label}: not one canonical JSON line")
        try:
            value = json.loads(
                line.decode("utf-8"), object_pairs_hook=_pairs,
                parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)),
            )
        except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
            raise Invalid(f"{label}: invalid JSON event: {exc}") from exc
        if not isinstance(value, dict) or _canon(value) != line:
            raise Invalid(f"{label}: not a canonical JSON object")
        return value

    def reject_ready_extra_event(self) -> None:
        if self.buffer:
            raise Invalid("duplicate or extra root event after terminal delivery")
        if self.eof:
            return
        ready, _, _ = select.select([self.fd], [], [], 0)
        if ready:
            extra = os.read(self.fd, 1)
            if extra:
                raise Invalid("duplicate or extra root event after terminal delivery")
            self.eof = True


def _validate_failure_event(
    event: dict[str, Any], invocation_id: str, phase: str,
) -> bool:
    if event.get("schema_id") != "pw-r9-subagent-transport-failure-event-v1":
        return False
    if (
        set(event) != FAILURE_EVENT_FIELDS
        or event.get("invocation_id") != invocation_id
        or event.get("phase") != phase
        or not isinstance(event.get("failure_type"), str)
        or not FAILURE_TYPE.fullmatch(event["failure_type"])
        or not isinstance(event.get("detail"), str)
        or not event["detail"]
    ):
        raise Invalid(f"{phase}: malformed transport failure event")
    _result_utf8(event["failure_type"], f"{phase} failure_type")
    _result_utf8(event["detail"], f"{phase} failure detail")
    return True


def _validate_spawn_receipt(
    event: dict[str, Any], request: dict[str, Any],
) -> None:
    expected_path = request["expected_canonical_task_path"]
    if (
        set(event) != SPAWN_RECEIPT_FIELDS
        or event.get("schema_id") != "pw-r9-subagent-spawn-receipt-event-v1"
        or event.get("invocation_id") != request["invocation_id"]
        or event.get("spawn_request_sha256") != _sha(_canon(request))
        or event.get("tool_result") != {"task_name": expected_path}
        or event.get("returned_identity_kind") != "canonical_task_path"
        or event.get("returned_canonical_task_path") != expected_path
    ):
        raise Invalid("spawn receipt/request/canonical-task binding mismatch")


def _validate_activity(value: Any) -> bool:
    if not isinstance(value, dict) or set(value) != ACTIVITY_FIELDS:
        raise Invalid("observed activity shape mismatch")
    count_fields = (
        "tool_calls", "file_accesses", "browsing", "network_accesses",
        "delegations", "memory_accesses", "followup_turns",
    )
    counts = [_result_int(value[key], f"observed activity {key}", 0) for key in count_fields]
    messages = value["nonterminal_messages"]
    if not isinstance(messages, list):
        raise Invalid("observed nonterminal_messages must be a list")
    for sequence, message in enumerate(messages, 1):
        if not isinstance(message, dict) or set(message) != {
            "sequence", "message_type", "utf8", "sha256", "bytes",
        }:
            raise Invalid("observed nonterminal message shape mismatch")
        storage = _result_utf8(message["utf8"], "observed nonterminal message utf8")
        byte_count = _result_int(
            message["bytes"], "observed nonterminal message bytes", 0,
        )
        if (
            message["sequence"] != sequence
            or isinstance(message["sequence"], bool)
            or message["message_type"] != "MESSAGE"
            or message["sha256"] != _sha(storage)
            or byte_count != len(storage)
        ):
            raise Invalid("observed nonterminal message binding mismatch")
    if value["observation_basis"] != "ROOT_VISIBLE_COLLABORATION_DELIVERIES":
        raise Invalid("observed activity basis mismatch")
    return any(counts) or bool(messages)


def _transport_result(
    receipt: dict[str, Any], delivery: dict[str, Any], request: dict[str, Any],
) -> dict[str, Any]:
    receipt_failed = _validate_failure_event(
        receipt, request["invocation_id"], "SPAWN_ATTEMPT",
    )
    delivery_failed = _validate_failure_event(
        delivery, request["invocation_id"], "TERMINAL_DRAIN",
    )
    if receipt_failed:
        raise Invalid(
            f"spawn transport failure:{receipt['failure_type']}:{receipt['detail']}"
        )
    _validate_spawn_receipt(receipt, request)
    if delivery_failed:
        raise Invalid(
            f"terminal transport failure:{delivery['failure_type']}:{delivery['detail']}"
        )
    if (
        set(delivery) != TERMINAL_DELIVERY_FIELDS
        or delivery.get("schema_id") != "pw-r9-subagent-terminal-delivery-event-v1"
        or delivery.get("invocation_id") != request["invocation_id"]
        or delivery.get("returned_canonical_task_path")
        != request["expected_canonical_task_path"]
        or delivery.get("message_type") != "FINAL_ANSWER"
        or delivery.get("terminal_status") != "FINAL_RETURNED"
    ):
        raise Invalid("terminal delivery identity/type/status mismatch")
    raw_final = _result_utf8(delivery.get("final_utf8"), "terminal final_utf8")
    prohibited = _validate_activity(delivery.get("observed_activity"))
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


def _score(result: dict[str, Any], cell: dict[str, Any]) -> dict[str, Any]:
    wanted = _semantic_canon(cell["expected_output"]) + b"\n"
    actual = result["stdout_utf8"].encode("utf-8")
    if result["returncode"] != 0:
        verdict, reason = "FAIL", "PROHIBITED_ACTIVITY_AFTER_FINAL"
    elif actual != wanted:
        verdict, reason = "FAIL", "EXACT_OUTPUT_MISMATCH"
    else:
        verdict, reason = "PASS", "EXACT_CANONICAL_OUTPUT_MATCH"
    return {
        "rule": "EXACT_CANONICAL_JSON_PLUS_ONE_LF", "verdict": verdict, "reason": reason,
        "expected_sha256": _sha(wanted), "expected_bytes": len(wanted),
        "actual_sha256": _sha(actual), "actual_bytes": len(actual),
        "returncode": result["returncode"],
    }


def _reopen_artifact(root: Path, slot: str, stage: dict[str, Any]) -> dict[str, Any]:
    path = _artifact_path(root, slot, stage["stage"])
    storage, value = _semantic_json(path, f"stage artifact {slot}/{stage['stage']}")
    expected_storage = _semantic_canon(stage["expected_artifact"]) + b"\n"
    if storage != expected_storage or value != stage["expected_artifact"]:
        raise Invalid(f"stage artifact drift: {slot}/{stage['stage']}")
    if (stage["expected_artifact_storage_sha256"], stage["expected_artifact_storage_bytes"]) != (
            _sha(storage), len(storage)):
        raise Invalid("stage artifact manifest identity mismatch")
    return _evidence_binding(root, path, storage, "STAGE_ARTIFACT", stage["stage"])


def _causal_inputs(root: Path, run: dict[str, Any], row: dict[str, Any],
                   cell: dict[str, Any], controls: dict[str, Any],
                   memo: dict[tuple[str, str, str], dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    memo = {} if memo is None else memo
    references: list[dict[str, Any]] = []
    for cell_id in cell["dependency_gate"]["required_pass_cells"]:
        dependency_row = next((item for item in run["schedule"]
                               if item["slot"] == row["slot"] and item["cell"] == cell_id), None)
        if dependency_row is None:
            raise Invalid(f"declared PASS-cell dependency was not scheduled: {cell_id}")
        key = (row["slot"], "cell", cell_id)
        dependency = memo.get(key)
        if dependency is None:
            dependency_cell = controls["cell_by_id"][cell_id]
            dependency = _reopen_row(root, run, dependency_row, dependency_cell, controls, memo)
            memo[key] = dependency
        if dependency["status"] != "PASS":
            raise Invalid(f"declared PASS-cell dependency did not PASS: {cell_id}")
        path = _row_path(root, dependency_row) / "completion.json"
        storage = _regular(path, f"dependency completion {cell_id}")
        references.append(_evidence_binding(root, path, storage, "PASS_CELL", cell_id))
    for stage_id in cell["dependency_gate"]["required_stage_artifacts"]:
        key = (row["slot"], "stage", stage_id)
        reference = memo.get(key)
        if reference is None:
            reference = _reopen_artifact(root, row["slot"], controls["stage_by_id"][stage_id])
            memo[key] = reference
        references.append(reference)
    references.sort(key=lambda item: (item["kind"], item["id"], item["path"]))
    return references


def _reopen_row(root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any],
                controls: dict[str, Any],
                memo: dict[tuple[str, str, str], dict[str, Any]] | None = None) -> dict[str, Any]:
    memo = {} if memo is None else memo
    path = _row_path(root, row)
    _dir(path, "row directory")
    if sorted(item.name for item in path.iterdir()) != [
        "attempt.json", "completion.json", "provider_input.txt", "raw_result.json",
        "spawn_message.txt", "spawn_receipt.json",
    ]:
        raise Invalid("row file inventory mismatch")
    packet = _regular(path / "provider_input.txt", "provider input")
    if packet != cell["render_utf8"].encode("utf-8"):
        raise Invalid("provider-input packet drift")
    if not packet.endswith(b"\n") or packet.endswith(b"\n\n") or b"\r" in packet:
        raise Invalid("provider-input packet is not exact one-LF UTF-8")
    message = _regular(path / "spawn_message.txt", "spawn message")
    expected_message = TRANSPORT_INSTRUCTION + packet[:-1]
    if message != expected_message:
        raise Invalid("spawn-message instruction/packet binding mismatch")
    attempt_bytes, attempt = _json(path / "attempt.json", "attempt")
    receipt_bytes, receipt = _json(path / "spawn_receipt.json", "spawn receipt")
    raw_bytes, raw = _json(path / "raw_result.json", "raw result")
    _, completion = _json(path / "completion.json", "completion")
    causal_inputs = _causal_inputs(root, run, row, cell, controls, memo)
    expected_attempt = {
        "schema_id": "pw-r9-attempt-v3", "run_id": root.name, "run_kind": run["run_kind"],
        "mode": run["mode"], "slot": row["slot"], "cell": row["cell"],
        "index": row["index"], "ordinal": row["ordinal"], "route": row["route"],
        "nonce": row["nonce"], "invocation_id": row["invocation_id"],
        "task_name": row["task_name"],
        "expected_canonical_task_path": row["expected_canonical_task_path"],
        "agent_type": "default", "fork_turns": "none",
        "model": row["route"]["model"], "reasoning_effort": row["route"]["thinking"],
        "causal_inputs": causal_inputs,
        "packet_sha256": _sha(packet), "packet_bytes": len(packet),
        "message_sha256": _sha(message), "message_bytes": len(message),
        "attempt": 1, "retry_count": 0, "best_of": False, "replacement_result": False,
        "no_retry": True, "no_relaunch": True,
    }
    if attempt != expected_attempt:
        raise Invalid("attempt binding mismatch")
    attempt_id = (_sha(attempt_bytes), len(attempt_bytes))
    request = _spawn_request(run, row, packet, message, attempt_id)
    request_payload = _canon(request)
    expected_raw = {
        "schema_id": "pw-r9-raw-result-v3", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
        "invocation_id": row["invocation_id"], "attempt_sha256": attempt_id[0],
        "attempt_bytes": attempt_id[1], "spawn_request_sha256": _sha(request_payload),
        "spawn_request_bytes": len(request_payload),
        "spawn_receipt_sha256": _sha(receipt_bytes),
        "spawn_receipt_bytes": len(receipt_bytes),
        "terminal_delivery": raw.get("terminal_delivery"),
    }
    if raw != expected_raw or not isinstance(raw["terminal_delivery"], dict):
        raise Invalid("raw-result attempt/request/receipt binding mismatch")
    result = _transport_result(receipt, raw["terminal_delivery"], request)
    score = _score(result, cell)
    transport_summary = {
        "terminal_status": result["terminal_status"], "message_type": result["message_type"],
        "canonical_task_path": result["canonical_task_path"],
        "returncode": result["returncode"],
        "prohibited_activity": result["prohibited_activity"],
        "output_capture": result["output_capture"],
    }
    expected_completion = {
        "schema_id": "pw-r9-completion-v3", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
        "route": row["route"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"], "task_name": row["task_name"],
        "canonical_task_path": row["expected_canonical_task_path"],
        "packet_sha256": _sha(packet), "packet_bytes": len(packet),
        "message_sha256": _sha(message), "message_bytes": len(message),
        "attempt_sha256": attempt_id[0], "attempt_bytes": attempt_id[1],
        "spawn_request_sha256": _sha(request_payload),
        "spawn_request_bytes": len(request_payload),
        "spawn_receipt_sha256": _sha(receipt_bytes),
        "spawn_receipt_bytes": len(receipt_bytes),
        "raw_result_sha256": _sha(raw_bytes), "raw_result_bytes": len(raw_bytes),
        "transport": transport_summary, "score": score, "status": score["verdict"],
        "attempt": 1, "retry_count": 0, "best_of": False, "replacement_result": False,
        "completion_is_last_row_write": True,
    }
    if completion != expected_completion:
        raise Invalid("completion binding mismatch")
    complete_storage = _canon(completion) + b"\n"
    record = {
        "ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
        "index": row["index"], "status": score["verdict"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"],
        "canonical_task_path": row["expected_canonical_task_path"],
        "completion_sha256": _sha(complete_storage), "completion_bytes": len(complete_storage),
    }
    memo[(row["slot"], "cell", row["cell"])] = record
    return record


def _admit(root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any],
           controls: dict[str, Any]) -> dict[str, Any] | None:
    """Atomically choose no-admit or seal the once-only external spawn admission."""
    causal_inputs = _causal_inputs(root, run, row, cell, controls)
    path = _row_path(root, row)
    packet = cell["render_utf8"].encode("utf-8")
    if not packet.endswith(b"\n") or packet.endswith(b"\n\n") or b"\r" in packet:
        raise Invalid("provider-input packet is not exact one-LF UTF-8")
    message = TRANSPORT_INSTRUCTION + packet[:-1]
    previous_mask = signal.pthread_sigmask(signal.SIG_BLOCK, STOP_SIGNALS)
    try:
        if STOP or STOP_SIGNALS.intersection(signal.sigpending()):
            return None
        slot = root / "cells" / row["slot"]
        if not slot.exists():
            _mkdir(slot)
        _mkdir(path)
        packet_id = _write(path / "provider_input.txt", packet)
        message_id = _write(path / "spawn_message.txt", message)
        attempt = {
            "schema_id": "pw-r9-attempt-v3", "run_id": root.name,
            "run_kind": run["run_kind"], "mode": run["mode"], "slot": row["slot"],
            "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
            "route": row["route"], "nonce": row["nonce"],
            "invocation_id": row["invocation_id"], "task_name": row["task_name"],
            "expected_canonical_task_path": row["expected_canonical_task_path"],
            "agent_type": "default", "fork_turns": "none",
            "model": row["route"]["model"], "reasoning_effort": row["route"]["thinking"],
            "causal_inputs": causal_inputs,
            "packet_sha256": packet_id[0], "packet_bytes": packet_id[1],
            "message_sha256": message_id[0], "message_bytes": message_id[1],
            "attempt": 1, "retry_count": 0, "best_of": False,
            "replacement_result": False, "no_retry": True, "no_relaunch": True,
        }
        attempt_id = _write_json(path / "attempt.json", attempt)
    finally:
        signal.pthread_sigmask(signal.SIG_SETMASK, previous_mask)
    return {
        "path": path, "packet": packet, "message": message,
        "packet_id": packet_id, "message_id": message_id, "attempt_id": attempt_id,
        "causal_inputs": causal_inputs,
    }


def _complete_admitted(
    root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any],
    controls: dict[str, Any], reader: _ProtocolReader, admission: dict[str, Any],
) -> dict[str, Any]:
    path = admission["path"]
    packet = admission["packet"]
    message = admission["message"]
    packet_id = admission["packet_id"]
    message_id = admission["message_id"]
    attempt_id = admission["attempt_id"]
    causal_inputs = admission["causal_inputs"]
    request = _spawn_request(run, row, packet, message, attempt_id)
    request_payload = _canon(request)
    sys.stdout.buffer.write(request_payload + b"\n")
    sys.stdout.buffer.flush()

    receipt = reader.event("spawn receipt")
    receipt_id = _write_json(path / "spawn_receipt.json", receipt)
    if _validate_failure_event(
        receipt, request["invocation_id"], "SPAWN_ATTEMPT",
    ):
        reader.reject_ready_extra_event()
        raise Invalid(
            f"spawn transport failure:{receipt['failure_type']}:{receipt['detail']}"
        )
    _validate_spawn_receipt(receipt, request)
    delivery = reader.event("terminal delivery")
    raw = {
        "schema_id": "pw-r9-raw-result-v3", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
        "invocation_id": row["invocation_id"], "attempt_sha256": attempt_id[0],
        "attempt_bytes": attempt_id[1], "spawn_request_sha256": _sha(request_payload),
        "spawn_request_bytes": len(request_payload),
        "spawn_receipt_sha256": receipt_id[0], "spawn_receipt_bytes": receipt_id[1],
        "terminal_delivery": delivery,
    }
    raw_id = _write_json(path / "raw_result.json", raw)
    reader.reject_ready_extra_event()
    result = _transport_result(receipt, delivery, request)
    if _regular(path / "provider_input.txt", "post-terminal provider input") != packet:
        raise Invalid("provider-input packet mutated after admission")
    if _regular(path / "spawn_message.txt", "post-terminal spawn message") != message:
        raise Invalid("spawn message mutated after admission")
    if _causal_inputs(root, run, row, cell, controls) != causal_inputs:
        raise Invalid("causal inputs mutated after admission")
    score = _score(result, cell)
    completion = {
        "schema_id": "pw-r9-completion-v3", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "ordinal": row["ordinal"],
        "route": row["route"], "nonce": row["nonce"],
        "invocation_id": row["invocation_id"], "task_name": row["task_name"],
        "canonical_task_path": row["expected_canonical_task_path"],
        "packet_sha256": packet_id[0], "packet_bytes": packet_id[1],
        "message_sha256": message_id[0], "message_bytes": message_id[1],
        "attempt_sha256": attempt_id[0], "attempt_bytes": attempt_id[1],
        "spawn_request_sha256": _sha(request_payload),
        "spawn_request_bytes": len(request_payload),
        "spawn_receipt_sha256": receipt_id[0], "spawn_receipt_bytes": receipt_id[1],
        "raw_result_sha256": raw_id[0], "raw_result_bytes": raw_id[1],
        "transport": {
            "terminal_status": result["terminal_status"],
            "message_type": result["message_type"],
            "canonical_task_path": result["canonical_task_path"],
            "returncode": result["returncode"],
            "prohibited_activity": result["prohibited_activity"],
            "output_capture": result["output_capture"],
        },
        "score": score, "status": score["verdict"], "attempt": 1, "retry_count": 0,
        "best_of": False, "replacement_result": False,
        "completion_is_last_row_write": True,
    }
    _write_json(path / "completion.json", completion)
    return _reopen_row(root, run, row, cell, controls)


def _stage_inputs(root: Path, run: dict[str, Any], slot: str, stage: dict[str, Any],
                  controls: dict[str, Any]) -> list[dict[str, Any]] | None:
    references: list[dict[str, Any]] = []
    for cell_id in stage["direct_subject_cells"]:
        row = next((item for item in run["schedule"]
                    if item["slot"] == slot and item["cell"] == cell_id), None)
        if row is None:
            return None
        path = _row_path(root, row)
        if not path.exists() and not path.is_symlink():
            return None
        record = _reopen_row(root, run, row, controls["cell_by_id"][cell_id], controls)
        if record["status"] != "PASS":
            return None
        completion_path = path / "completion.json"
        storage = _regular(completion_path, f"stage direct cell {cell_id}")
        references.append(_evidence_binding(root, completion_path, storage, "PASS_CELL", cell_id))
    for predecessor in stage["predecessor_stages"]:
        path = _artifact_path(root, slot, predecessor)
        if not path.exists() and not path.is_symlink():
            return None
        references.append(_reopen_artifact(root, slot, controls["stage_by_id"][predecessor]))
    references.sort(key=lambda item: (item["kind"], item["id"], item["path"]))
    return references


def _finalize_eligible(root: Path, run: dict[str, Any], slot: str, after_index: int,
                       controls: dict[str, Any]) -> list[str]:
    created: list[str] = []
    slot_root = root / "artifacts" / slot
    if not slot_root.exists():
        _mkdir(slot_root)
    for stage in controls["stages"]:
        path = _artifact_path(root, slot, stage["stage"])
        eligible_boundary = stage["finalization_boundary"]["after_cell_index"] <= after_index
        inputs = _stage_inputs(root, run, slot, stage, controls) if eligible_boundary else None
        exists = path.exists() or path.is_symlink()
        if exists:
            if inputs is None:
                raise Invalid(f"stage artifact exists before eligibility: {slot}/{stage['stage']}")
            _reopen_artifact(root, slot, stage)
            continue
        if inputs is None:
            continue
        storage = _semantic_canon(stage["expected_artifact"]) + b"\n"
        if (_sha(storage), len(storage)) != (
                stage["expected_artifact_storage_sha256"], stage["expected_artifact_storage_bytes"]):
            raise Invalid("stage storage identity drift before finalization")
        _write(path, storage)
        _reopen_artifact(root, slot, stage)
        created.append(stage["stage"])
    return created


def _terminalize(root: Path, run: dict[str, Any], controls: dict[str, Any],
                 cause: dict[str, str] | None, failed_slots: dict[str, int]) -> None:
    if cause and cause["kind"] == "CONTROLLER_INVALID":
        _write_json(root / "controller_invalid.json", {
            "schema_id": "pw-r9-controller-invalid-v2", "run_id": root.name,
            "kind": cause["kind"], "detail": cause["detail"],
        })
    path_records: list[dict[str, Any]] = []
    path_ids: list[dict[str, Any]] = []
    for route in controls["routes"]:
        slot = route["slot"]
        scheduled = [row for row in run["schedule"] if row["slot"] == slot]
        complete: list[dict[str, Any]] = []
        invalid: list[dict[str, Any]] = []
        ineligible: list[int] = []
        stopped: list[int] = []
        aborted: list[int] = []
        missing: list[int] = []
        memo: dict[tuple[str, str, str], dict[str, Any]] = {}
        for row in scheduled:
            path = _row_path(root, row)
            if path.exists() or path.is_symlink():
                try:
                    record = _reopen_row(root, run, row, controls["cell_by_id"][row["cell"]], controls, memo)
                    if slot in failed_slots and row["ordinal"] > failed_slots[slot]:
                        invalid.append({"ordinal": row["ordinal"], "reason": "POST_SUBJECT_FAIL_DISPATCH"})
                    else:
                        complete.append(record)
                except Invalid as exc:
                    invalid.append({"ordinal": row["ordinal"], "reason": str(exc)})
                continue
            if slot in failed_slots and row["ordinal"] > failed_slots[slot]:
                ineligible.append(row["ordinal"])
            elif cause and cause["kind"] == "STOPPED_AFTER_DRAIN":
                stopped.append(row["ordinal"])
            elif cause and cause["kind"] == "CONTROLLER_INVALID":
                aborted.append(row["ordinal"])
            else:
                missing.append(row["ordinal"])
        fail_records = [item for item in complete if item["status"] == "FAIL"]
        if len(fail_records) > 1:
            invalid.append({"ordinal": fail_records[1]["ordinal"], "reason": "MULTIPLE_SUBJECT_FAILS_IN_SLOT"})
        if slot in failed_slots and (not fail_records or fail_records[0]["ordinal"] != failed_slots[slot]):
            invalid.append({"ordinal": failed_slots[slot], "reason": "SUBJECT_FAIL_STOP_BINDING_MISMATCH"})

        artifact_rows: list[dict[str, Any]] = []
        invalid_artifacts: list[dict[str, str]] = []
        missing_artifacts: list[str] = []
        eligible: set[str] = set()
        passed_cells = {item["cell"] for item in complete if item["status"] == "PASS"}
        slot_artifacts = root / "artifacts" / slot
        if slot_artifacts.exists() or slot_artifacts.is_symlink():
            try:
                _dir(slot_artifacts, f"artifact slot {slot}")
            except Invalid as exc:
                invalid_artifacts.append({"stage": "*", "reason": str(exc)})
        for stage in controls["stages"]:
            is_eligible = (all(item in passed_cells for item in stage["direct_subject_cells"])
                           and all(item in eligible for item in stage["predecessor_stages"]))
            if is_eligible:
                eligible.add(stage["stage"])
            path = _artifact_path(root, slot, stage["stage"])
            exists = path.exists() or path.is_symlink()
            if not exists:
                if is_eligible:
                    missing_artifacts.append(stage["stage"])
                continue
            if not is_eligible:
                invalid_artifacts.append({"stage": stage["stage"], "reason": "ARTIFACT_NOT_ELIGIBLE"})
                continue
            try:
                reference = _reopen_artifact(root, slot, stage)
                artifact_rows.append({"stage": stage["stage"], "path": reference["path"],
                                      "sha256": reference["sha256"], "bytes": reference["bytes"]})
            except Invalid as exc:
                invalid_artifacts.append({"stage": stage["stage"], "reason": str(exc)})
        if slot_artifacts.is_dir():
            expected_names = {f"{item}.json" for item in controls["stage_order"]}
            for item in sorted(slot_artifacts.iterdir(), key=lambda path: path.name):
                if item.name not in expected_names:
                    invalid_artifacts.append({"stage": item.name, "reason": "UNDECLARED_ARTIFACT_PATH"})

        passed = sum(item["status"] == "PASS" for item in complete)
        failed = sum(item["status"] == "FAIL" for item in complete)
        if invalid or invalid_artifacts or missing_artifacts or missing:
            status = "CONTROLLER_INVALID"
        elif aborted:
            status = "CONTROLLER_ABORTED"
        elif stopped:
            status = "STOPPED_AFTER_DRAIN"
        elif failed:
            status = "VALID_SUBJECT_FAIL"
        elif len(complete) == len(scheduled):
            status = "PASS"
        else:
            status = "CONTROLLER_INVALID"
        inventory = _canon(complete)
        record = {
            "schema_id": "pw-r9-path-terminal-v2", "run_id": root.name, "slot": slot,
            "status": status, "scheduled_rows": len(scheduled), "completed_rows": len(complete),
            "pass_rows": passed, "subject_fail_rows": failed, "invalid_rows": invalid,
            "ineligible_after_subject_fail_ordinals": ineligible,
            "stopped_after_signal_ordinals": stopped, "controller_aborted_ordinals": aborted,
            "missing_ordinals": missing, "stage_artifacts": artifact_rows,
            "stage_artifact_count": len(artifact_rows), "eligible_stage_count": len(eligible),
            "missing_stage_artifacts": missing_artifacts, "invalid_stage_artifacts": invalid_artifacts,
            "completion_inventory_sha256": _sha(inventory),
            "completion_inventory_bytes": len(inventory),
        }
        path_records.append(record)
        identity = _write_json(root / "terminals" / f"{slot}.json", record)
        path_ids.append({"slot": slot, "sha256": identity[0], "bytes": identity[1]})

    scheduled_count = sum(item["scheduled_rows"] for item in path_records)
    completed_count = sum(item["completed_rows"] for item in path_records)
    passed_count = sum(item["pass_rows"] for item in path_records)
    failed_count = sum(item["subject_fail_rows"] for item in path_records)
    invalid_count = sum(len(item["invalid_rows"]) + len(item["invalid_stage_artifacts"])
                        + len(item["missing_stage_artifacts"]) for item in path_records)
    ineligible_count = sum(len(item["ineligible_after_subject_fail_ordinals"]) for item in path_records)
    stopped_count = sum(len(item["stopped_after_signal_ordinals"]) for item in path_records)
    aborted_count = sum(len(item["controller_aborted_ordinals"]) for item in path_records)
    missing_count = sum(len(item["missing_ordinals"]) for item in path_records)
    artifact_count = sum(item["stage_artifact_count"] for item in path_records)
    full_matrix = run["planned_call_count"] == 291
    clean_matrix = (full_matrix and passed_count == 291 and failed_count == 0
                    and invalid_count == 0 and ineligible_count == 0 and stopped_count == 0
                    and aborted_count == 0 and missing_count == 0 and artifact_count == 54)
    if cause and cause["kind"] == "CONTROLLER_INVALID" or invalid_count or missing_count:
        status = "CONTROLLER_INVALID"
    elif cause and cause["kind"] == "STOPPED_AFTER_DRAIN" or stopped_count:
        status = "STOPPED_AFTER_DRAIN"
    elif failed_count:
        status = "VALID_SUBJECT_FAIL"
    elif full_matrix and clean_matrix:
        status = "PASS"
    elif not full_matrix and completed_count == scheduled_count and passed_count == scheduled_count:
        status = "PASS"
    else:
        status = "CONTROLLER_INVALID"
    matrix = {
        "schema_id": "pw-r9-matrix-terminal-v2", "run_id": root.name, "status": status,
        "cause": cause, "scheduled_rows": scheduled_count, "completed_rows": completed_count,
        "pass_rows": passed_count, "subject_fail_rows": failed_count, "invalid_rows": invalid_count,
        "ineligible_rows": ineligible_count, "stopped_rows": stopped_count,
        "controller_aborted_rows": aborted_count, "missing_rows": missing_count,
        "stage_artifact_count": artifact_count,
        "required_clean_stage_artifacts": 54 if full_matrix else 0,
        "clean_matrix": clean_matrix, "path_terminals": path_ids,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    matrix_id = _write_json(root / "matrix_terminal.json", matrix)
    attempts = len(list((root / "cells").glob("*/*/attempt.json")))
    raw = len(list((root / "cells").glob("*/*/raw_result.json")))
    completions = len(list((root / "cells").glob("*/*/completion.json")))
    _write_json(root / "accounting.json", {
        "schema_id": "pw-r9-accounting-v2", "run_id": root.name, "status": status,
        "matrix_terminal_sha256": matrix_id[0], "matrix_terminal_bytes": matrix_id[1],
        "planned_calls": scheduled_count, "attempts": attempts, "captured_raw_results": raw,
        "valid_completions": completions, "pass_rows": passed_count,
        "subject_fail_rows": failed_count, "ineligible_rows": ineligible_count,
        "stopped_rows": stopped_count, "controller_aborted_rows": aborted_count,
        "invalid_rows": invalid_count, "missing_rows": missing_count,
        "stage_artifact_count": artifact_count, "unknown_or_uncaptured_dispatches": attempts - raw,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    })


RUN_FIELDS = {
    "schema_id", "operating_contract", "run_id", "run_kind", "mode", "scenario",
    "created_utc", "git_head", "custody_mode", "bundle", "semantic_manifest",
    "pipeline_contract", "subject_transport_addendum", "route_capability_receipt",
    "routes", "schedule", "route_count", "cells_per_route", "planned_call_count",
    "stage_count", "retry_count", "best_of", "replacement_count",
}


def _reopen(root: Path, controls: dict[str, Any], evidence: Path) -> dict[str, Any]:
    run_bytes, run = _json(root / "run.json", "run")
    if set(run) != RUN_FIELDS or run.get("schema_id") != "pw-r9-run-v3" or run.get("run_id") != root.name:
        raise Invalid("run identity or shape mismatch")
    operating_binding = _binding(OPERATING, controls["operating_bytes"], REPO)
    addendum_binding = _binding(
        SUBJECT_TRANSPORT_ADDENDUM, controls["subject_transport_addendum_bytes"],
    )
    capability_binding = _binding(
        ROUTE_CAPABILITY_RECEIPT, controls["route_capability_receipt_bytes"],
    )
    semantic_binding = _binding(SEMANTIC, controls["semantic_bytes"])
    pipeline_binding = _binding(PIPELINE, controls["pipeline_bytes"])
    if run["operating_contract"] != operating_binding or run["semantic_manifest"] != semantic_binding:
        raise Invalid("run operating/semantic binding mismatch")
    if run["pipeline_contract"] != pipeline_binding or run["bundle"] != controls["bundle"]:
        raise Invalid("run pipeline/bundle binding mismatch")
    if (
        run["subject_transport_addendum"] != addendum_binding
        or run["route_capability_receipt"] != capability_binding
    ):
        raise Invalid("run subject-transport/capability binding mismatch")
    if run["routes"] != controls["routes"] or run["route_count"] != 3 or run["stage_count"] != 18:
        raise Invalid("run route/stage binding mismatch")
    if not isinstance(run["git_head"], str) or not GIT_HEAD.fullmatch(run["git_head"]):
        raise Invalid("recorded run Git HEAD is invalid")
    if run["mode"] == "actual":
        if run["custody_mode"] != "GIT_HEAD_PINNED":
            raise Invalid("actual run lacks Git custody")
        _require_head_custody(run["git_head"], controls["bundle"], controls["bundle_storages"])
    elif run["mode"] != "synthetic" or run["custody_mode"] != "WORKTREE_EXACT_BUNDLE":
        raise Invalid("run custody mode mismatch")
    schedule = run["schedule"]
    if not isinstance(schedule, list) or len(schedule) != run["planned_call_count"]:
        raise Invalid("run planned schedule mismatch")
    row_fields = {
        "ordinal", "slot", "route", "index", "cell", "nonce", "invocation_id",
        "task_name", "expected_canonical_task_path",
    }
    for ordinal, row in enumerate(schedule):
        if not isinstance(row, dict) or set(row) != row_fields:
            raise Invalid("run schedule row shape mismatch")
        nonce = row["nonce"]
        if (
            row["ordinal"] != ordinal or not isinstance(nonce, str) or not NONCE.fullmatch(nonce)
            or row["invocation_id"] != f"r9-invocation:{nonce}"
            or row["task_name"] != f"r9_{nonce}"
            or not TASK_NAME.fullmatch(row["task_name"])
            or row["expected_canonical_task_path"] != f"/root/{row['task_name']}"
        ):
            raise Invalid("run schedule ordinal/nonce/invocation/task mismatch")
        if row["route"] not in controls["routes"] or row["slot"] != row["route"]["slot"]:
            raise Invalid("run schedule route mismatch")
        cell = controls["cell_by_id"].get(row["cell"])
        if cell is None or row["index"] != cell["index"]:
            raise Invalid("run schedule cell mismatch")
    for key in ("nonce", "invocation_id", "expected_canonical_task_path"):
        if len({row[key] for row in schedule}) != len(schedule):
            raise Invalid(f"run {key} plan is not unique")
    expected_cells = 1 if run["run_kind"] == "run-canary" else 97
    if run["cells_per_route"] != expected_cells or run["planned_call_count"] != 3 * expected_cells:
        raise Invalid("run cardinality mismatch")

    matrix_bytes, matrix = _json(root / "matrix_terminal.json", "matrix terminal")
    _, accounting = _json(root / "accounting.json", "accounting")
    if (accounting.get("matrix_terminal_sha256"), accounting.get("matrix_terminal_bytes")) != (
            _sha(matrix_bytes), len(matrix_bytes)):
        raise Invalid("matrix/accounting binding mismatch")
    expected = {
        "schema_id": "pw-r9-verifier-expectation-v3", "run_id": root.name,
        "run_kind": run["run_kind"], "planned_call_count": run["planned_call_count"],
        "evidence_root": str(evidence), "operating_contract": operating_binding,
        "bundle": controls["bundle"], "semantic_manifest": semantic_binding,
        "pipeline_contract": pipeline_binding,
        "subject_transport_addendum": addendum_binding,
        "route_capability_receipt": capability_binding,
    }
    report = verify(root, expected)
    if not isinstance(report, dict) or not isinstance(report.get("valid"), bool):
        raise Invalid("offline verifier report shape mismatch")
    status = matrix.get("status") if report["valid"] else "CONTROLLER_INVALID"
    return {
        "schema_id": "pw-r9-reopen-result-v3", "run_id": root.name,
        "run_sha256": _sha(run_bytes), "run_bytes": len(run_bytes), "status": status,
        "matrix_status": matrix.get("status"), "offline_verifier": report,
    }


def _stop(_signum: int, _frame: Any) -> None:
    global STOP
    STOP = True


def _execute(run_kind: str, name: str, scenario: str) -> dict[str, Any]:
    global STOP
    controls = _controls()
    evidence = _evidence_root(run_kind, True)
    used = _used_values(evidence)
    root = _run_root(name, True, evidence)
    rows, cells_per_route = _rows(run_kind, controls)
    planned_identities = [
        item for row in rows for item in (
            row["nonce"], row["invocation_id"], row["expected_canonical_task_path"],
        )
    ]
    if len(set(planned_identities)) != len(planned_identities) or any(
        item in used for item in planned_identities
    ):
        raise Invalid("nonce/invocation/canonical-task plan not globally fresh")
    used.update(planned_identities)
    mode = "synthetic" if run_kind == "simulate" else "actual"
    head = _git_head()
    if mode == "actual":
        _require_head_custody(head, controls["bundle"], controls["bundle_storages"])
    run = {
        "schema_id": "pw-r9-run-v3",
        "operating_contract": _binding(OPERATING, controls["operating_bytes"], REPO),
        "run_id": root.name, "run_kind": run_kind, "mode": mode,
        "scenario": scenario if mode == "synthetic" else None, "created_utc": _utc_now(),
        "git_head": head,
        "custody_mode": "WORKTREE_EXACT_BUNDLE" if mode == "synthetic" else "GIT_HEAD_PINNED",
        "bundle": controls["bundle"],
        "semantic_manifest": _binding(SEMANTIC, controls["semantic_bytes"]),
        "pipeline_contract": _binding(PIPELINE, controls["pipeline_bytes"]),
        "subject_transport_addendum": _binding(
            SUBJECT_TRANSPORT_ADDENDUM, controls["subject_transport_addendum_bytes"],
        ),
        "route_capability_receipt": _binding(
            ROUTE_CAPABILITY_RECEIPT, controls["route_capability_receipt_bytes"],
        ),
        "routes": controls["routes"], "schedule": rows, "route_count": 3,
        "cells_per_route": cells_per_route, "planned_call_count": len(rows), "stage_count": 18,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    _write_json(root / "run.json", run)
    cause: dict[str, str] | None = None
    failed_slots: dict[str, int] = {}
    STOP = False
    # This is a one-shot CLI controller.  Keep the idempotent stop handlers
    # installed through terminal accounting, offline reopen, stdout emission,
    # and process exit so a repeated late stop cannot kill a sealed run.
    signal.signal(signal.SIGINT, _stop)
    signal.signal(signal.SIGTERM, _stop)
    reader = _ProtocolReader()
    for row in rows:
        if STOP:
            cause = {"kind": "STOPPED_AFTER_DRAIN", "detail": "signal before next admission"}
            break
        if row["slot"] in failed_slots:
            continue
        try:
            admission = _admit(
                root, run, row, controls["cell_by_id"][row["cell"]], controls,
            )
            if admission is None:
                cause = {"kind": "STOPPED_AFTER_DRAIN",
                         "detail": "signal pending before next admission"}
                break
            record = _complete_admitted(
                root, run, row, controls["cell_by_id"][row["cell"]],
                controls, reader, admission,
            )
            if record["status"] == "PASS":
                _finalize_eligible(root, run, row["slot"], row["index"], controls)
            else:
                failed_slots[row["slot"]] = row["ordinal"]
        except Exception as exc:
            detail = str(exc)
            if not (
                isinstance(exc, Invalid)
                and detail.startswith((
                    "spawn transport failure:",
                    "terminal transport failure:",
                ))
            ):
                detail = f"ROW_{row['ordinal']}_INVALID:{type(exc).__name__}:{detail}"
            cause = {"kind": "CONTROLLER_INVALID", "detail": detail}
            break
        if STOP:
            cause = {"kind": "STOPPED_AFTER_DRAIN",
                     "detail": "signal drained admitted subagent event chain through seal"}
            break
    if cause is None and STOP:
        cause = {"kind": "STOPPED_AFTER_DRAIN",
                 "detail": "signal observed at terminal-decision boundary"}
    _terminalize(root, run, controls, cause, failed_slots)
    return _reopen(root, controls, evidence)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="R9 standalone causal controller; internal iteration, zero credit."
    )
    commands = parser.add_subparsers(dest="command", required=True)
    simulate = commands.add_parser("simulate", help="synthetic slot-major causal traversal")
    simulate.add_argument("--run-root", help="new direct child of the selected evidence root")
    simulate.add_argument("--scenario", default="pass", help="synthetic event scenario")
    simulate.add_argument("--check-only", action="store_true",
                          help="validate controls with zero writes or external events")
    canary = commands.add_parser("run-canary", help="one actual canary call per route")
    canary.add_argument("--run-root", required=True)
    matrix = commands.add_parser("run-matrix", help="actual slot-major 291-row causal matrix")
    matrix.add_argument("--run-root", required=True)
    reopen = commands.add_parser("reopen", help="offline exact-chain reopen")
    reopen.add_argument("--run-root", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "simulate" and args.check_only:
            controls = _controls()
            result = {
                "schema_id": "pw-r9-control-check-v3", "status": "PASS",
                "spawn_requests": 0, "root_events_read": 0, "evidence_writes": 0,
                "routes": len(controls["routes"]), "cells": len(controls["cells"]),
                "matrix_rows": len(controls["routes"]) * len(controls["cells"]),
                "deterministic_stages_per_route": len(controls["stages"]),
                "required_clean_stage_artifacts": 54,
            }
        elif args.command == "simulate":
            result = _execute("simulate", args.run_root, args.scenario)
        elif args.command in {"run-canary", "run-matrix"}:
            result = _execute(args.command, args.run_root, "actual")
        else:
            controls = _controls()
            evidence = _evidence_root("reopen", False)
            result = _reopen(_run_root(args.run_root, False, evidence), controls, evidence)
        sys.stdout.buffer.write(_canon(result) + b"\n")
        if result.get("status") == "PASS":
            return 0
        if result.get("status") == "VALID_SUBJECT_FAIL":
            return 1
        return 2
    except Exception as exc:
        sys.stdout.buffer.write(_canon({
            "schema_id": "pw-r9-controller-error-v3", "status": "CONTROLLER_INVALID",
            "error_type": type(exc).__name__, "error": str(exc),
        }) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
