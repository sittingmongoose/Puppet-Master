#!/usr/bin/env python3
"""Deterministic, synthetic-only collaboration protocol fixtures for R9.

This module performs no dispatch, provider, collaboration, process, network,
filesystem, external-state, or persistence operation.  It only validates an
already formed synthetic spawn request and returns data objects for simulator input.
The production controller does not import this module.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from copy import deepcopy
from typing import Any

sys.dont_write_bytecode = True

SPAWN_REQUEST_SCHEMA_ID = "pw-r9-subagent-spawn-request-v1"
SPAWN_RECEIPT_SCHEMA_ID = "pw-r9-subagent-spawn-receipt-event-v1"
TERMINAL_DELIVERY_SCHEMA_ID = "pw-r9-subagent-terminal-delivery-event-v1"
TRANSPORT_FAILURE_SCHEMA_ID = "pw-r9-subagent-transport-failure-event-v1"
SCENARIO_SCHEMA_ID = "pw-r9-synthetic-collaboration-scenario-v1"

TRANSPORT_INSTRUCTION_UTF8 = (
    "TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your "
    "first final response. Do not use tools, files, browsing, network, memory, "
    "delegation, or other agents.\n\n"
)
TRANSPORT_INSTRUCTION_SHA256 = (
    "0c04a3327ef979fbd6a562399250ee26a213d4eb50de764a53bf07f14ab5997c"
)
TRANSPORT_INSTRUCTION_BYTES = 174
OBSERVATION_BASIS = "ROOT_VISIBLE_COLLABORATION_DELIVERIES"

ROUTES = {
    "slot-alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "slot-bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "slot-charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}

SPAWN_REQUEST_FIELDS = frozenset({
    "schema_id", "run_id", "run_kind", "mode", "slot", "cell", "index",
    "ordinal", "nonce", "invocation_id", "task_name",
    "expected_canonical_task_path", "agent_type", "fork_turns", "model",
    "reasoning_effort", "packet_sha256", "packet_bytes", "message_utf8",
    "message_sha256", "message_bytes", "attempt_sha256", "attempt_bytes",
})
SPAWN_RECEIPT_FIELDS = frozenset({
    "schema_id", "invocation_id", "spawn_request_sha256", "tool_result",
    "returned_identity_kind", "returned_canonical_task_path",
})
TERMINAL_DELIVERY_FIELDS = frozenset({
    "schema_id", "invocation_id", "returned_canonical_task_path",
    "message_type", "final_utf8", "observed_activity", "terminal_status",
})
TRANSPORT_FAILURE_FIELDS = frozenset({
    "schema_id", "invocation_id", "phase", "failure_type", "detail",
})
OBSERVED_ACTIVITY_FIELDS = frozenset({
    "tool_calls", "file_accesses", "browsing", "network_accesses",
    "delegations", "memory_accesses", "followup_turns",
    "nonterminal_messages", "observation_basis",
})
NONTERMINAL_MESSAGE_FIELDS = frozenset({
    "sequence", "message_type", "utf8", "sha256", "bytes",
})
ACTIVITY_COUNTERS = (
    "tool_calls", "file_accesses", "browsing", "network_accesses",
    "delegations", "memory_accesses", "followup_turns",
)
FAILURE_PHASES = frozenset({"SPAWN_ATTEMPT", "TERMINAL_DRAIN"})
HEX64 = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$")
FAILURE_TYPE = re.compile(r"^[A-Z][A-Z0-9_]{0,127}$")

SCENARIOS = (
    "clean",
    "observed_tool",
    "observed_file",
    "observed_browse",
    "observed_network",
    "observed_delegation",
    "observed_memory",
    "observed_followup",
    "observed_nonterminal",
    "missing_spawn",
    "failed_spawn",
    "wrong_path",
    "wrong_sender",
    "wrong_type",
    "malformed_output",
    "partial_output",
    "missing_output",
    "delayed_multi_poll",
)

__all__ = [
    "SyntheticFixtureError",
    "SCENARIOS",
    "canonical_json_bytes",
    "canonical_json_line",
    "sha256_hex",
    "validate_spawn_request",
    "spawn_request_sha256",
    "clean_observed_activity",
    "make_nonterminal_message",
    "make_spawn_receipt",
    "make_terminal_delivery",
    "make_transport_failure",
    "make_spawn_failure",
    "make_terminal_failure",
    "with_observed_activity",
    "with_wrong_receipt_path",
    "with_wrong_terminal_sender",
    "with_wrong_message_type",
    "with_final_utf8",
    "delayed_poll_events",
    "scenario_polls",
    "scenario_events",
    "build_scenario",
    "self_test",
]


class SyntheticFixtureError(ValueError):
    """The supplied fixture input violates the synthetic protocol contract."""


def canonical_json_bytes(value: Any) -> bytes:
    """Return canonical sorted, minified UTF-8 JSON without a terminal LF."""
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise SyntheticFixtureError("value is not canonical JSON data") from exc


def canonical_json_line(value: Any) -> bytes:
    """Return one canonical JSON line for a simulator protocol stream."""
    return canonical_json_bytes(value) + b"\n"


def sha256_hex(data: bytes) -> str:
    if not isinstance(data, bytes):
        raise SyntheticFixtureError("sha256 input must be bytes")
    return hashlib.sha256(data).hexdigest()


def _utf8(value: Any, name: str) -> bytes:
    if not isinstance(value, str):
        raise SyntheticFixtureError(f"{name} must be text")
    try:
        return value.encode("utf-8")
    except UnicodeEncodeError as exc:
        raise SyntheticFixtureError(f"{name} is not valid UTF-8 text") from exc


def _non_bool_int(value: Any, name: str, *, minimum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise SyntheticFixtureError(f"{name} must be an integer >= {minimum}")
    return value


def _exact_fields(value: dict[str, Any], fields: frozenset[str], name: str) -> None:
    if set(value) != fields:
        missing = sorted(fields - set(value))
        extra = sorted(set(value) - fields)
        raise SyntheticFixtureError(
            f"{name} fields differ: missing={missing}, extra={extra}"
        )


def validate_spawn_request(request: Any) -> dict[str, Any]:
    """Validate and return an exact synthetic spawn-request object.

    The packet bytes are reconstructed from the message suffix plus the one
    terminal LF omitted from the spawn message, so both packet and message
    identities are checked without any file access.
    """
    if not isinstance(request, dict):
        raise SyntheticFixtureError("spawn request must be an object")
    _exact_fields(request, SPAWN_REQUEST_FIELDS, "spawn request")
    if request["schema_id"] != SPAWN_REQUEST_SCHEMA_ID:
        raise SyntheticFixtureError("spawn request schema_id mismatch")
    if request["mode"] != "synthetic" or request["run_kind"] != "simulate":
        raise SyntheticFixtureError("synthetic fixtures require mode=synthetic")

    for name in ("run_id", "run_kind", "cell", "invocation_id"):
        if not _utf8(request[name], name):
            raise SyntheticFixtureError(f"{name} must not be empty")
    for name in ("slot", "task_name"):
        if not isinstance(request[name], str) or not TOKEN.fullmatch(request[name]):
            raise SyntheticFixtureError(f"invalid {name}")
    _non_bool_int(request["index"], "index", minimum=0)
    _non_bool_int(request["ordinal"], "ordinal", minimum=0)

    if not isinstance(request["nonce"], str) or not HEX64.fullmatch(request["nonce"]):
        raise SyntheticFixtureError("nonce must be lowercase SHA-256 text")
    expected_invocation_id = f"r9-invocation:{request['nonce']}"
    expected_task_name = f"r9_{request['nonce']}"
    if request["invocation_id"] != expected_invocation_id:
        raise SyntheticFixtureError("invocation_id is not nonce-derived")
    if request["task_name"] != expected_task_name:
        raise SyntheticFixtureError("task_name is not nonce-derived")
    expected_path = f"/root/{expected_task_name}"
    if request["expected_canonical_task_path"] != expected_path:
        raise SyntheticFixtureError("expected canonical task path mismatch")
    if request["agent_type"] != "default" or request["fork_turns"] != "none":
        raise SyntheticFixtureError("spawn request must use default fork-none isolation")

    route = ROUTES.get(request["slot"])
    if route is None:
        raise SyntheticFixtureError("unknown frozen slot")
    if request["model"] != route["model"]:
        raise SyntheticFixtureError("requested model differs from frozen route")
    if request["reasoning_effort"] != route["reasoning_effort"]:
        raise SyntheticFixtureError("requested reasoning effort differs from frozen route")

    message = _utf8(request["message_utf8"], "message_utf8")
    instruction = TRANSPORT_INSTRUCTION_UTF8.encode("utf-8")
    if (
        sha256_hex(instruction) != TRANSPORT_INSTRUCTION_SHA256
        or len(instruction) != TRANSPORT_INSTRUCTION_BYTES
    ):
        raise SyntheticFixtureError("embedded transport instruction identity drift")
    if not message.startswith(instruction):
        raise SyntheticFixtureError("message does not begin with exact transport instruction")
    if request["message_sha256"] != sha256_hex(message):
        raise SyntheticFixtureError("message SHA-256 mismatch")
    if request["message_bytes"] != len(message):
        raise SyntheticFixtureError("message byte count mismatch")

    packet_payload = message[len(instruction):]
    packet = packet_payload + b"\n"
    if not packet_payload or packet_payload.endswith(b"\n") or b"\r" in packet:
        raise SyntheticFixtureError(
            "packet storage must have one terminal LF, no CR, and nonempty payload"
        )
    if request["packet_sha256"] != sha256_hex(packet):
        raise SyntheticFixtureError("packet SHA-256 mismatch")
    if request["packet_bytes"] != len(packet):
        raise SyntheticFixtureError("packet byte count mismatch")
    for name in ("packet_bytes", "message_bytes", "attempt_bytes"):
        _non_bool_int(request[name], name, minimum=1)
    if not isinstance(request["attempt_sha256"], str) or not HEX64.fullmatch(
        request["attempt_sha256"]
    ):
        raise SyntheticFixtureError("attempt_sha256 must be lowercase SHA-256 text")
    return request


def spawn_request_sha256(request: Any) -> str:
    """Hash the exact canonical request bytes, with no terminal LF."""
    checked = validate_spawn_request(request)
    return sha256_hex(canonical_json_bytes(checked))


def clean_observed_activity() -> dict[str, Any]:
    return {
        "tool_calls": 0,
        "file_accesses": 0,
        "browsing": 0,
        "network_accesses": 0,
        "delegations": 0,
        "memory_accesses": 0,
        "followup_turns": 0,
        "nonterminal_messages": [],
        "observation_basis": OBSERVATION_BASIS,
    }


def make_nonterminal_message(
    utf8: str = "synthetic nonterminal message", *, sequence: int = 1
) -> dict[str, Any]:
    data = _utf8(utf8, "nonterminal message utf8")
    _non_bool_int(sequence, "sequence", minimum=1)
    return {
        "sequence": sequence,
        "message_type": "MESSAGE",
        "utf8": utf8,
        "sha256": sha256_hex(data),
        "bytes": len(data),
    }


def make_spawn_receipt(request: Any) -> dict[str, Any]:
    checked = validate_spawn_request(request)
    path = checked["expected_canonical_task_path"]
    return {
        "schema_id": SPAWN_RECEIPT_SCHEMA_ID,
        "invocation_id": checked["invocation_id"],
        "spawn_request_sha256": spawn_request_sha256(checked),
        "tool_result": {"task_name": path},
        "returned_identity_kind": "canonical_task_path",
        "returned_canonical_task_path": path,
    }


def make_terminal_delivery(request: Any, final_utf8: str) -> dict[str, Any]:
    checked = validate_spawn_request(request)
    _utf8(final_utf8, "final_utf8")
    return {
        "schema_id": TERMINAL_DELIVERY_SCHEMA_ID,
        "invocation_id": checked["invocation_id"],
        "returned_canonical_task_path": checked["expected_canonical_task_path"],
        "message_type": "FINAL_ANSWER",
        "final_utf8": final_utf8,
        "observed_activity": clean_observed_activity(),
        "terminal_status": "FINAL_RETURNED",
    }


def make_transport_failure(
    request: Any, phase: str, failure_type: str, detail: str
) -> dict[str, Any]:
    checked = validate_spawn_request(request)
    if phase not in FAILURE_PHASES:
        raise SyntheticFixtureError("failure phase must be SPAWN_ATTEMPT or TERMINAL_DRAIN")
    if not isinstance(failure_type, str) or not FAILURE_TYPE.fullmatch(failure_type):
        raise SyntheticFixtureError("failure_type must be an uppercase typed token")
    if not _utf8(detail, "failure detail"):
        raise SyntheticFixtureError("failure detail must not be empty")
    return {
        "schema_id": TRANSPORT_FAILURE_SCHEMA_ID,
        "invocation_id": checked["invocation_id"],
        "phase": phase,
        "failure_type": failure_type,
        "detail": detail,
    }


def make_spawn_failure(
    request: Any, failure_type: str = "SPAWN_FAILED",
    detail: str = "synthetic spawn failure",
) -> dict[str, Any]:
    return make_transport_failure(request, "SPAWN_ATTEMPT", failure_type, detail)


def make_terminal_failure(
    request: Any, failure_type: str = "TERMINAL_DELIVERY_MISSING",
    detail: str = "synthetic terminal delivery missing",
) -> dict[str, Any]:
    return make_transport_failure(request, "TERMINAL_DRAIN", failure_type, detail)


def _delivery_copy(delivery: Any) -> dict[str, Any]:
    if not isinstance(delivery, dict):
        raise SyntheticFixtureError("terminal delivery must be an object")
    _exact_fields(delivery, TERMINAL_DELIVERY_FIELDS, "terminal delivery")
    return deepcopy(delivery)


def with_observed_activity(
    delivery: Any, activity: str, *, count: int = 1,
    message_utf8: str = "synthetic nonterminal message",
) -> dict[str, Any]:
    """Return a delivery with one deterministic root-visible activity mutation."""
    mutated = _delivery_copy(delivery)
    observed = mutated.get("observed_activity")
    if not isinstance(observed, dict):
        raise SyntheticFixtureError("observed_activity must be an object")
    _exact_fields(observed, OBSERVED_ACTIVITY_FIELDS, "observed activity")
    if activity == "nonterminal_messages":
        if count != 1:
            raise SyntheticFixtureError("nonterminal message mutation count must be 1")
        observed[activity] = [make_nonterminal_message(message_utf8)]
    elif activity in ACTIVITY_COUNTERS:
        observed[activity] = _non_bool_int(count, "activity count", minimum=1)
    else:
        raise SyntheticFixtureError("unknown observed activity field")
    return mutated


def with_wrong_receipt_path(receipt: Any) -> dict[str, Any]:
    if not isinstance(receipt, dict):
        raise SyntheticFixtureError("spawn receipt must be an object")
    _exact_fields(receipt, SPAWN_RECEIPT_FIELDS, "spawn receipt")
    mutated = deepcopy(receipt)
    mutated["returned_canonical_task_path"] = "/root/synthetic-wrong-path"
    return mutated


def with_wrong_terminal_sender(delivery: Any) -> dict[str, Any]:
    mutated = _delivery_copy(delivery)
    mutated["returned_canonical_task_path"] = "/root/synthetic-wrong-sender"
    return mutated


def with_wrong_message_type(delivery: Any) -> dict[str, Any]:
    mutated = _delivery_copy(delivery)
    mutated["message_type"] = "MESSAGE"
    return mutated


def with_final_utf8(delivery: Any, final_utf8: str) -> dict[str, Any]:
    mutated = _delivery_copy(delivery)
    _utf8(final_utf8, "final_utf8")
    mutated["final_utf8"] = final_utf8
    return mutated


def delayed_poll_events(
    request: Any, final_utf8: str, *, empty_poll_count: int = 2
) -> tuple[tuple[dict[str, Any], ...], ...]:
    """Model passive drain: receipt, empty polls, then the first final delivery."""
    _non_bool_int(empty_poll_count, "empty_poll_count", minimum=1)
    return (
        (make_spawn_receipt(request),),
        *(tuple() for _ in range(empty_poll_count)),
        (make_terminal_delivery(request, final_utf8),),
    )


def scenario_polls(
    request: Any, scenario: str, final_utf8: str = '{"selected_choice":"synthetic"}'
) -> tuple[tuple[dict[str, Any], ...], ...]:
    """Build deterministic event polls for one declared simulator scenario."""
    validate_spawn_request(request)
    if scenario not in SCENARIOS:
        raise SyntheticFixtureError("unknown synthetic scenario")

    if scenario == "missing_spawn":
        return ((make_spawn_failure(
            request, "SPAWN_MISSING", "synthetic spawn result was not returned"
        ),),)
    if scenario == "failed_spawn":
        return ((make_spawn_failure(request),),)

    receipt = make_spawn_receipt(request)
    if scenario == "missing_output":
        return (
            (receipt,),
            (make_terminal_failure(request),),
        )
    if scenario == "delayed_multi_poll":
        return delayed_poll_events(request, final_utf8)

    delivery = make_terminal_delivery(request, final_utf8)
    activity_by_scenario = {
        "observed_tool": "tool_calls",
        "observed_file": "file_accesses",
        "observed_browse": "browsing",
        "observed_network": "network_accesses",
        "observed_delegation": "delegations",
        "observed_memory": "memory_accesses",
        "observed_followup": "followup_turns",
        "observed_nonterminal": "nonterminal_messages",
    }
    if scenario in activity_by_scenario:
        delivery = with_observed_activity(delivery, activity_by_scenario[scenario])
    elif scenario == "wrong_path":
        receipt = with_wrong_receipt_path(receipt)
    elif scenario == "wrong_sender":
        delivery = with_wrong_terminal_sender(delivery)
    elif scenario == "wrong_type":
        delivery = with_wrong_message_type(delivery)
    elif scenario == "malformed_output":
        delivery = with_final_utf8(delivery, "{malformed-output")
    elif scenario == "partial_output":
        delivery = with_final_utf8(
            delivery,
            final_utf8[:max(1, len(final_utf8) // 2)] if final_utf8 else "partial",
        )
    return ((receipt, delivery),)


def scenario_events(
    request: Any, scenario: str, final_utf8: str = '{"selected_choice":"synthetic"}'
) -> tuple[dict[str, Any], ...]:
    """Flatten one scenario into its ordered root-event sequence."""
    return tuple(
        event
        for poll in scenario_polls(request, scenario, final_utf8)
        for event in poll
    )


def build_scenario(
    request: Any, scenario: str, final_utf8: str = '{"selected_choice":"synthetic"}'
) -> dict[str, Any]:
    """Return a JSON-able data-only scenario envelope; it executes nothing."""
    polls = scenario_polls(request, scenario, final_utf8)
    return {
        "schema_id": SCENARIO_SCHEMA_ID,
        "scenario": scenario,
        "polls": [list(poll) for poll in polls],
        "actual_invocations": 0,
        "empirical_subject_invocations": 0,
        "subject_calls": 0,
        "collaboration_calls": 0,
        "provider_calls": 0,
        "network_calls": 0,
        "writes": 0,
    }


def _self_test_request() -> dict[str, Any]:
    packet = b"frozen packet\n"
    message = TRANSPORT_INSTRUCTION_UTF8.encode("utf-8") + packet[:-1]
    return {
        "schema_id": SPAWN_REQUEST_SCHEMA_ID,
        "run_id": "synthetic-self-test",
        "run_kind": "simulate",
        "mode": "synthetic",
        "slot": "slot-alpha",
        "cell": "S10A_DECISION_A01",
        "index": 0,
        "ordinal": 1,
        "nonce": "1" * 64,
        "invocation_id": f"r9-invocation:{'1' * 64}",
        "task_name": f"r9_{'1' * 64}",
        "expected_canonical_task_path": f"/root/r9_{'1' * 64}",
        "agent_type": "default",
        "fork_turns": "none",
        "model": "gpt-5.4-mini",
        "reasoning_effort": "xhigh",
        "packet_sha256": sha256_hex(packet),
        "packet_bytes": len(packet),
        "message_utf8": message.decode("utf-8"),
        "message_sha256": sha256_hex(message),
        "message_bytes": len(message),
        "attempt_sha256": "2" * 64,
        "attempt_bytes": 321,
    }


def self_test() -> dict[str, Any]:
    request = _self_test_request()
    validate_spawn_request(request)
    request_hash = spawn_request_sha256(request)
    receipt = make_spawn_receipt(request)
    delivery = make_terminal_delivery(request, "synthetic final")

    if set(receipt) != SPAWN_RECEIPT_FIELDS:
        raise SyntheticFixtureError("spawn receipt exact shape drift")
    if receipt["tool_result"] != {
        "task_name": request["expected_canonical_task_path"]
    }:
        raise SyntheticFixtureError("spawn receipt exact tool_result drift")
    if receipt["returned_identity_kind"] != "canonical_task_path":
        raise SyntheticFixtureError("spawn receipt identity kind drift")
    if receipt["spawn_request_sha256"] != request_hash:
        raise SyntheticFixtureError("spawn receipt request binding drift")
    if set(delivery) != TERMINAL_DELIVERY_FIELDS:
        raise SyntheticFixtureError("terminal delivery exact shape drift")
    if set(delivery["observed_activity"]) != OBSERVED_ACTIVITY_FIELDS:
        raise SyntheticFixtureError("observed activity exact shape drift")
    if delivery["observed_activity"] != clean_observed_activity():
        raise SyntheticFixtureError("clean observed activity drift")
    if (
        delivery["message_type"] != "FINAL_ANSWER"
        or delivery["terminal_status"] != "FINAL_RETURNED"
        or delivery["final_utf8"] != "synthetic final"
    ):
        raise SyntheticFixtureError("terminal delivery value drift")

    mutated_nonce = "3" * 64
    mutated_request = dict(
        request,
        nonce=mutated_nonce,
        invocation_id=f"r9-invocation:{mutated_nonce}",
        task_name=f"r9_{mutated_nonce}",
        expected_canonical_task_path=f"/root/r9_{mutated_nonce}",
    )
    if spawn_request_sha256(mutated_request) == request_hash:
        raise SyntheticFixtureError("spawn request hash is not request-bound")
    if make_spawn_receipt(request) != make_spawn_receipt(request):
        raise SyntheticFixtureError("spawn receipt is not deterministic")
    if make_terminal_delivery(request, "synthetic final") != make_terminal_delivery(
        request, "synthetic final"
    ):
        raise SyntheticFixtureError("terminal delivery is not deterministic")

    spawn_failure = make_spawn_failure(request)
    terminal_failure = make_terminal_failure(request)
    for failure, phase in (
        (spawn_failure, "SPAWN_ATTEMPT"),
        (terminal_failure, "TERMINAL_DRAIN"),
    ):
        if set(failure) != TRANSPORT_FAILURE_FIELDS or failure["phase"] != phase:
            raise SyntheticFixtureError("typed failure exact shape drift")

    scenario_summary: dict[str, dict[str, int]] = {}
    for scenario in SCENARIOS:
        first = build_scenario(request, scenario, "synthetic final")
        second = build_scenario(request, scenario, "synthetic final")
        if canonical_json_bytes(first) != canonical_json_bytes(second):
            raise SyntheticFixtureError(f"scenario is not deterministic: {scenario}")
        if any(first[name] != 0 for name in (
            "actual_invocations", "empirical_subject_invocations",
            "subject_calls", "collaboration_calls", "provider_calls",
            "network_calls", "writes",
        )):
            raise SyntheticFixtureError(f"scenario call accounting drift: {scenario}")
        scenario_summary[scenario] = {
            "polls": len(first["polls"]),
            "events": sum(len(poll) for poll in first["polls"]),
        }

    nonterminal = with_observed_activity(delivery, "nonterminal_messages")[
        "observed_activity"
    ]["nonterminal_messages"][0]
    if set(nonterminal) != NONTERMINAL_MESSAGE_FIELDS:
        raise SyntheticFixtureError("nonterminal message exact shape drift")
    if (
        nonterminal["message_type"] != "MESSAGE"
        or nonterminal["sha256"] != sha256_hex(nonterminal["utf8"].encode("utf-8"))
        or nonterminal["bytes"] != len(nonterminal["utf8"].encode("utf-8"))
    ):
        raise SyntheticFixtureError("nonterminal message identity drift")

    canonical_probe = canonical_json_bytes({"z": 1, "a": "é"})
    if canonical_probe != b'{"a":"\xc3\xa9","z":1}':
        raise SyntheticFixtureError("canonical sorted minified UTF-8 drift")
    return {
        "schema_id": "pw-r9-synthetic-backend-self-test-v1",
        "status": "PASS",
        "request_sha256": request_hash,
        "spawn_receipt_shape_exact": True,
        "terminal_delivery_shape_exact": True,
        "request_hash_binding": True,
        "deterministic_repeat": True,
        "scenario_coverage": list(SCENARIOS),
        "scenario_count": len(SCENARIOS),
        "scenarios": scenario_summary,
        "actual_invocations": 0,
        "empirical_subject_invocations": 0,
        "subject_calls": 0,
        "collaboration_calls": 0,
        "provider_calls": 0,
        "network_calls": 0,
        "writes": 0,
    }


if __name__ == "__main__":
    if sys.argv[1:] != ["self-test"]:
        raise SystemExit("usage: backend.py self-test")
    sys.stdout.buffer.write(canonical_json_line(self_test()))
