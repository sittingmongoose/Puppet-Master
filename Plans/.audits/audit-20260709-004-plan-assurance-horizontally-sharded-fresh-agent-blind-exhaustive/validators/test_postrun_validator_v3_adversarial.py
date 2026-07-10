#!/usr/bin/env python3
"""Adversarial smoke tests for the frozen-candidate V3 validator pair."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable


HERE = Path(__file__).resolve()
ROOT = HERE.parents[1]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(ids: list[str]) -> str:
    ordered = sorted(ids)
    return hashlib.sha256(
        ("\n".join(ordered) + ("\n" if ordered else "")).encode("utf-8")
    ).hexdigest()


def run_cross(cross: Path, primary: Path, snapshot: Path, output: Path | None = None) -> subprocess.CompletedProcess[str]:
    command = [
        sys.executable,
        str(cross),
        "--snapshot",
        str(snapshot),
        "--validator",
        str(primary),
    ]
    if output is not None:
        command.extend(["--output", str(output)])
    return subprocess.run(command, text=True, capture_output=True, check=False)


def load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot import validator module: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--primary", type=Path, required=True)
    parser.add_argument("--crosscheck", type=Path, required=True)
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--crosscheck-snapshot", type=Path, required=True)
    args = parser.parse_args()

    primary = args.primary.resolve()
    cross = args.crosscheck.resolve()
    snapshot_path = args.snapshot.resolve()
    cross_snapshot_path = args.crosscheck_snapshot.resolve()
    failures: list[str] = []

    baseline = run_cross(cross, primary, snapshot_path)
    if baseline.returncode != 0:
        failures.append("authentic snapshot did not pass independent cross-check")

    base = json.loads(snapshot_path.read_text(encoding="utf-8"))

    primary_module = load_module(primary, "a004_v3_primary_under_test")
    cross_module = load_module(cross, "a004_v3_cross_under_test")
    invalid_json_forms = {
        "duplicate object key": '{"a":1,"a":2}',
        "NaN": '{"a":NaN}',
        "Infinity": '{"a":Infinity}',
        "negative Infinity": '{"a":-Infinity}',
        "overflowing finite-syntax decimal": '{"a":1e9999}',
        "underflowing finite-syntax decimal": '{"a":1e-9999}',
        "escaped lone surrogate": '{"a":"\\ud800"}',
    }
    strict_json_parsers = (
        ("primary", primary_module.strict_json_loads),
        ("cross-check", cross_module.x_json_loads),
    )
    for invalid_label, invalid_json in invalid_json_forms.items():
        for parser_label, json_parser in strict_json_parsers:
            try:
                json_parser(invalid_json)
            except (TypeError, ValueError, json.JSONDecodeError):
                continue
            failures.append(f"{parser_label} accepted {invalid_label} JSON")
    custom_tool_programs = [
        'await tools["exec_command"]({cmd:"cat runners/runner-02/raw_results/secret.json"})',
        'const {exec_command}=tools; await exec_command({cmd:"cat runners/runner-02/raw_results/secret.json"})',
        'const allowed="Plans/.audits/assigned-capsule.json"; await tools.exec_command({cmd:"cat runners/runner-02/raw_results/*"})',
        'await tools.exec_command({cmd:"cat coordination/*"})',
        'await tools.exec_command({cmd:"while read x; do true; done < runners/runner-02/result_manifest.jsonl"})',
        'await tools.exec_command({cmd:"awk 1 runners/runner-02/raw_results/*"})',
        'await tools.exec_command({cmd:"cat $(rg --files runners/runner-02/raw_results | head -1)"})',
        'await tools.exec_command({cmd:"cat Plans/.audits/assigned-capsule.json"})',
    ]
    for index, program in enumerate(custom_tool_programs, 1):
        custom_row = {
            "type": "response_item",
            "payload": {
                "type": "custom_tool_call",
                "name": "exec",
                "input": program,
            },
        }
        if not primary_module.strict_custom_tool_issues([custom_row]):
            failures.append(f"primary accepted forbidden custom-tool program {index}")
        if not cross_module.x_custom_tool_issues([custom_row]):
            failures.append(f"cross-check accepted forbidden custom-tool program {index}")
    orphan_output = {
        "type": "response_item",
        "payload": {
            "type": "custom_tool_call_output",
            "call_id": "orphan",
            "output": "opaque",
        },
    }
    if not primary_module.strict_custom_tool_issues([orphan_output]):
        failures.append("primary accepted an orphan custom-tool output")
    if not cross_module.x_custom_tool_issues([orphan_output]):
        failures.append("cross-check accepted an orphan custom-tool output")

    actionable_transcript_rows = [
        {
            "type": "response_item",
            "payload": {
                "type": "web_search_call",
                "action": {"type": "open_page", "url": "https://example.invalid/prior-audit"},
            },
        },
        {
            "type": "response_item",
            "payload": {"type": "tool_search_call", "query": "prior audit"},
        },
        {
            "type": "response_item",
            "payload": {"type": "tool_search_call_output", "output": "opaque"},
        },
        {
            "type": "response_item",
            "payload": {
                "type": "function_call_output",
                "call_id": "orphan",
                "output": "",
                "internal_chat_message_metadata_passthrough": {"turn_id": "t"},
            },
        },
        {"type": "future_action_event", "payload": {"type": "opaque"}},
    ]
    for index, action_row in enumerate(actionable_transcript_rows, 1):
        if not primary_module.strict_transcript_event_issues([action_row]):
            failures.append(f"primary accepted actionable transcript row {index}")
        if not cross_module.x_transcript_action_issues([action_row]):
            failures.append(f"cross-check accepted actionable transcript row {index}")

    sealed_call_id = "call_sealed_metadata"
    sealed_turn_id = "turn_sealed_metadata"
    sealed_timestamp = "2026-07-10T00:00:00.000Z"

    def transcript_row(outer_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "timestamp": sealed_timestamp,
            "type": outer_type,
            "payload": payload,
        }

    sealed_function_pair = [
        transcript_row(
            "response_item",
            {
                "type": "function_call",
                "id": "fc_sealed",
                "call_id": sealed_call_id,
                "namespace": "collaboration",
                "name": "send_message",
                "arguments": json.dumps(
                    {"target": "/root", "message": "gAAAAAsealed"},
                    separators=(",", ":"),
                ),
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": sealed_turn_id
                },
            },
        ),
        transcript_row(
            "response_item",
            {
                "type": "function_call_output",
                "call_id": sealed_call_id,
                "output": "",
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": sealed_turn_id
                },
            },
        ),
    ]
    sealed_transcript_prefix = [
        transcript_row(
            "session_meta",
            {
                "session_id": "runner-root", "id": "reviewer-session",
                "parent_thread_id": "runner-root", "timestamp": sealed_timestamp,
                "cwd": str(ROOT.parents[4]), "originator": "Codex Desktop",
                "cli_version": "test", "source": {}, "thread_source": "subagent",
                "agent_nickname": "Verifier", "agent_path": "/root/verifier",
                "model_provider": "openai", "base_instructions": {},
                "history_mode": "legacy", "multi_agent_version": "v2",
                "context_window": {}, "git": {},
            },
        ),
        transcript_row(
            "world_state",
            {"full": True, "state": {"agents_md": {}, "environments": {}}},
        ),
        transcript_row(
            "turn_context",
            {
                "turn_id": sealed_turn_id, "cwd": str(ROOT.parents[4]),
                "workspace_roots": [str(ROOT.parents[4])],
                "current_date": "2026-07-10", "timezone": "UTC",
                "approval_policy": "never", "approvals_reviewer": "user",
                "sandbox_policy": {}, "permission_profile": {},
                "model": "gpt-5.6-sol", "comp_hash": "test",
                "personality": "friendly", "collaboration_mode": {},
                "multi_agent_version": "v2", "multi_agent_mode": "proactive",
                "realtime_active": False, "effort": "ultra", "summary": "auto",
            },
        ),
        transcript_row(
            "inter_agent_communication_metadata", {"trigger_turn": True}
        ),
        transcript_row(
            "event_msg",
            {
                "type": "task_started", "collaboration_mode_kind": "default",
                "model_context_window": 1000, "started_at": sealed_timestamp,
                "turn_id": sealed_turn_id,
            },
        ),
    ]
    sealed_task_complete = transcript_row(
        "event_msg",
        {
            "type": "task_complete", "completed_at": sealed_timestamp,
            "duration_ms": 1, "last_agent_message": "{}",
            "time_to_first_token_ms": 1, "turn_id": sealed_turn_id,
        },
    )
    sealed_transcript = [
        *sealed_transcript_prefix,
        *sealed_function_pair,
        sealed_task_complete,
    ]
    if primary_module.strict_transcript_event_issues(sealed_transcript):
        failures.append("primary rejected the sealed metadata send pair")
    if cross_module.x_transcript_action_issues(sealed_transcript):
        failures.append("cross-check rejected the sealed metadata send pair")

    wrong_turn_transcript = copy.deepcopy(sealed_transcript)
    for row in wrong_turn_transcript:
        payload = row.get("payload", {})
        if payload.get("type") in {"function_call", "function_call_output"}:
            payload["internal_chat_message_metadata_passthrough"]["turn_id"] = "wrong-turn"
    if not primary_module.strict_transcript_event_issues(wrong_turn_transcript):
        failures.append("primary accepted a sealed function pair on the wrong turn")
    if not cross_module.x_transcript_action_issues(wrong_turn_transcript):
        failures.append("cross-check accepted a sealed function pair on the wrong turn")

    wrapped_action_transcripts = []
    wrapped_world = copy.deepcopy(sealed_transcript)
    wrapped_world[1]["payload"] = {"type": "web_search_call"}
    wrapped_action_transcripts.append(("world_state", wrapped_world))
    wrapped_iac = copy.deepcopy(sealed_transcript)
    wrapped_iac[3]["payload"] = {"type": "tool_search_call"}
    wrapped_action_transcripts.append(("inter-agent metadata", wrapped_iac))
    duplicate_meta = copy.deepcopy(sealed_transcript)
    duplicate_meta.insert(1, copy.deepcopy(duplicate_meta[0]))
    duplicate_meta[1]["payload"]["id"] = "second-session"
    wrapped_action_transcripts.append(("second session_meta", duplicate_meta))
    nested_action = copy.deepcopy(sealed_transcript)
    nested_action.insert(
        -1,
        transcript_row(
            "response_item",
            {
                "type": "message", "role": "assistant",
                "content": [{"type": "web_search_call", "text": "hidden"}],
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": sealed_turn_id
                },
            },
        ),
    )
    wrapped_action_transcripts.append(("nested message action", nested_action))
    for label, candidate_rows in wrapped_action_transcripts:
        if not primary_module.strict_transcript_event_issues(candidate_rows):
            failures.append(f"primary accepted {label}")
        if not cross_module.x_transcript_action_issues(candidate_rows):
            failures.append(f"cross-check accepted {label}")

    floor = {
        "assignment_id": "A004-floor", "attempt": 1,
        "agent_instance_id": "floor-instance", "agent_path": "/root/floor",
        "agent_thread_id": "floor-thread", "result_sha256": "a" * 64,
        "result_ref": "floor.json",
    }
    manifest = dict(floor)
    same_attempt_other_identity = {
        "assignment_id": "A004-floor", "attempt": 1,
        "agent_instance_id": "other-instance", "agent_path": "/root/other",
        "agent_thread_id": "other-thread", "result_sha256": "b" * 64,
        "result_ref": "other.json",
    }
    later_attempt = {**same_attempt_other_identity, "attempt": 2}
    if not primary_module.strict_floor_veto_matches(
        floor, manifest, same_attempt_other_identity
    ):
        failures.append("primary allowed identity disagreement to defeat same-attempt floor veto")
    if not cross_module.x_floor_veto_matches(
        floor, manifest, same_attempt_other_identity
    ):
        failures.append("cross-check allowed identity disagreement to defeat floor veto")
    if primary_module.strict_floor_veto_matches(floor, manifest, later_attempt):
        failures.append("primary let a later attempt veto the floor attempt")
    if cross_module.x_floor_veto_matches(floor, manifest, later_attempt):
        failures.append("cross-check let a later attempt veto the floor attempt")

    localized_state = cross_module.x_localized_session_credit_state(
        {
            "A004-floor-a": {"assignment_id": "A004-floor-a"},
            "A004-floor-b": {"assignment_id": "A004-floor-b"},
        },
        [
            {"assignment_id": "A004-new-a"},
            {"assignment_id": "A004-new-b"},
        ],
        {"A004-floor-a"},
        {"A004-new-a"},
    )
    if (
        set(localized_state[0]) != {"A004-floor-b"}
        or {row["assignment_id"] for row in localized_state[1]}
        != {"A004-new-b"}
        or localized_state[2] != {"A004-new-b"}
        or localized_state[3] != {"A004-floor-b"}
        or localized_state[4] != {"A004-new-b"}
        or localized_state[5] != {"A004-floor-b", "A004-new-b"}
    ):
        failures.append("cross-check localized session failure erased unrelated credit")

    if cross_module.x_global_transaction_failure_state(
        [], {"runner-01": {"valid": True, "issues": []}}
    ) is not None:
        failures.append("cross-check suppressed credit without a global transaction error")
    global_state = cross_module.x_global_transaction_failure_state(
        ["required input changed"],
        {"runner-01": {"valid": True, "issues": []}},
    )
    if (
        global_state is None
        or global_state[:5] != (False, False, set(), set(), set())
        or global_state[5]["runner-01"].get("valid") is not False
        or global_state[6] != 0
    ):
        failures.append("cross-check global transaction failure retained credit")

    synthetic_agent_path = "/root/a004_synthetic_isolation_probe"
    initial_delivery = {
        "type": "response_item",
        "payload": {
            "type": "agent_message",
            "author": "/root",
            "recipient": synthetic_agent_path,
            "content": [
                {
                    "type": "input_text",
                    "text": (
                        "Message Type: NEW_TASK\n"
                        f"Task name: {synthetic_agent_path}\n"
                        "Sender: /root\nPayload:\n"
                    ),
                },
                {"type": "encrypted_content", "encrypted_content": "gAAAAAsealed"},
            ],
            "internal_chat_message_metadata_passthrough": {"turn_id": "sealed-turn"},
        },
    }
    agent_rows = [
        {
            "type": "response_item",
            "payload": {"type": "message", "role": "user", "content": []},
        },
        {"type": "turn_context", "payload": {"turn_id": "sealed-turn"}},
        initial_delivery,
    ]
    if primary_module.strict_agent_message_issues(agent_rows, synthetic_agent_path):
        failures.append("primary rejected one authorized NEW_TASK delivery")
    if cross_module.x_agent_message_issues(agent_rows, synthetic_agent_path):
        failures.append("cross-check rejected one authorized NEW_TASK delivery")
    followup_rows = [*agent_rows, copy.deepcopy(initial_delivery)]
    followup_rows[-1]["payload"]["content"][0]["text"] = (
        "Message Type: MESSAGE\n"
        f"Task name: {synthetic_agent_path}\n"
        "Sender: /root\nPayload:\n"
    )
    if not primary_module.strict_agent_message_issues(
        followup_rows, synthetic_agent_path
    ):
        failures.append("primary accepted a later inbound agent message")
    if not cross_module.x_agent_message_issues(followup_rows, synthetic_agent_path):
        failures.append("cross-check accepted a later inbound agent message")

    terminal_result_text = '{"ok":true}'
    terminal_result_bytes = terminal_result_text.encode("utf-8")
    state_machine_rows = [
        copy.deepcopy(sealed_transcript_prefix[0]),
        copy.deepcopy(sealed_transcript_prefix[4]),
        transcript_row(
            "response_item",
            {"type": "message", "role": "user", "content": []},
        ),
        copy.deepcopy(sealed_transcript_prefix[1]),
        copy.deepcopy(sealed_transcript_prefix[2]),
        copy.deepcopy(sealed_transcript_prefix[3]),
        transcript_row("response_item", copy.deepcopy(initial_delivery["payload"])),
        transcript_row(
            "event_msg",
            {
                "type": "agent_message",
                "message": terminal_result_text,
                "phase": "final_answer",
            },
        ),
        transcript_row(
            "response_item",
            {
                "type": "message",
                "role": "assistant",
                "content": [
                    {"type": "output_text", "text": terminal_result_text}
                ],
                "phase": "final_answer",
            },
        ),
        transcript_row(
            "event_msg",
            {
                "type": "task_complete",
                "last_agent_message": terminal_result_text,
            },
        ),
    ]
    state_helpers = (
        ("primary", primary_module.strict_session_state_issues),
        ("cross-check", cross_module.x_session_state_issues),
    )
    for label, helper in state_helpers:
        if helper(state_machine_rows, terminal_result_bytes):
            failures.append(f"{label} rejected the canonical session state machine")

    def state_row_index(
        rows: list[dict[str, Any]],
        outer_type: str,
        payload_type: str | None = None,
        role: str | None = None,
    ) -> int:
        for index, row in enumerate(rows):
            payload = row.get("payload", {})
            if (
                row.get("type") == outer_type
                and (payload_type is None or payload.get("type") == payload_type)
                and (role is None or payload.get("role") == role)
            ):
                return index
        raise AssertionError((outer_type, payload_type, role))

    state_mutations: list[tuple[str, list[dict[str, Any]]]] = []

    moved_assistant = copy.deepcopy(state_machine_rows)
    moved = moved_assistant.pop(
        state_row_index(moved_assistant, "response_item", "message", "assistant")
    )
    moved_assistant.insert(
        state_row_index(moved_assistant, "response_item", "agent_message"), moved
    )
    state_mutations.append(("assistant output before NEW_TASK", moved_assistant))

    moved_event = copy.deepcopy(state_machine_rows)
    moved = moved_event.pop(
        state_row_index(moved_event, "event_msg", "agent_message")
    )
    moved_event.insert(
        state_row_index(moved_event, "response_item", "agent_message"), moved
    )
    state_mutations.append(("terminal event before NEW_TASK", moved_event))

    pretask_function = copy.deepcopy(state_machine_rows)
    delivery_index = state_row_index(
        pretask_function, "response_item", "agent_message"
    )
    pretask_function[delivery_index:delivery_index] = copy.deepcopy(
        sealed_function_pair
    )
    state_mutations.append(("function execution before NEW_TASK", pretask_function))

    moved_start = copy.deepcopy(state_machine_rows)
    moved = moved_start.pop(state_row_index(moved_start, "event_msg", "task_started"))
    moved_start.insert(
        state_row_index(moved_start, "response_item", "agent_message") + 1, moved
    )
    state_mutations.append(("task_started after NEW_TASK", moved_start))

    moved_world = copy.deepcopy(state_machine_rows)
    moved = moved_world.pop(state_row_index(moved_world, "world_state"))
    moved_world.insert(
        state_row_index(moved_world, "response_item", "agent_message") + 1, moved
    )
    state_mutations.append(("world state after NEW_TASK", moved_world))

    moved_iac = copy.deepcopy(state_machine_rows)
    moved = moved_iac.pop(
        state_row_index(moved_iac, "inter_agent_communication_metadata")
    )
    moved_iac.insert(
        state_row_index(moved_iac, "response_item", "agent_message") + 1, moved
    )
    state_mutations.append(("inter-agent setup after NEW_TASK", moved_iac))

    no_assistant = copy.deepcopy(state_machine_rows)
    no_assistant.pop(
        state_row_index(no_assistant, "response_item", "message", "assistant")
    )
    state_mutations.append(("missing final assistant response", no_assistant))

    duplicate_assistant = copy.deepcopy(state_machine_rows)
    assistant_index = state_row_index(
        duplicate_assistant, "response_item", "message", "assistant"
    )
    duplicate_assistant.insert(
        assistant_index + 1, copy.deepcopy(duplicate_assistant[assistant_index])
    )
    state_mutations.append(("duplicate final assistant response", duplicate_assistant))

    mismatched_assistant = copy.deepcopy(state_machine_rows)
    assistant_index = state_row_index(
        mismatched_assistant, "response_item", "message", "assistant"
    )
    mismatched_assistant[assistant_index]["payload"]["content"][0]["text"] = "different"
    state_mutations.append(("assistant response differs from result", mismatched_assistant))

    mismatched_event = copy.deepcopy(state_machine_rows)
    event_index = state_row_index(mismatched_event, "event_msg", "agent_message")
    mismatched_event[event_index]["payload"]["message"] = "different"
    state_mutations.append(("terminal event differs from result", mismatched_event))

    post_output_action = copy.deepcopy(state_machine_rows)
    assistant_index = state_row_index(
        post_output_action, "response_item", "message", "assistant"
    )
    post_output_action.insert(
        assistant_index + 1,
        transcript_row(
            "response_item",
            {
                "type": "function_call",
                "id": "fc_after_output",
                "call_id": "call_after_output",
            },
        ),
    )
    state_mutations.append(("action after final assistant response", post_output_action))

    for mutation_label, candidate_rows in state_mutations:
        for helper_label, helper in state_helpers:
            if not helper(candidate_rows, terminal_result_bytes):
                failures.append(f"{helper_label} accepted {mutation_label}")

    raw_byte_mismatches = {
        "leading space": b" " + terminal_result_bytes,
        "trailing space": terminal_result_bytes + b" ",
        "leading newline": b"\n" + terminal_result_bytes,
        "trailing tab and newline": terminal_result_bytes + b"\t\n",
    }
    for mismatch_label, mismatch_bytes in raw_byte_mismatches.items():
        for helper_label, helper in state_helpers:
            if not helper(state_machine_rows, mismatch_bytes):
                failures.append(
                    f"{helper_label} normalized {mismatch_label} in raw result bytes"
                )
    surrogate_state_rows = copy.deepcopy(state_machine_rows)
    surrogate_state_rows[-3]["payload"]["message"] = "\ud800"
    surrogate_state_rows[-2]["payload"]["content"][0]["text"] = "\ud800"
    surrogate_state_rows[-1]["payload"]["last_agent_message"] = "\ud800"
    for helper_label, helper in state_helpers:
        try:
            surrogate_issues = helper(surrogate_state_rows, terminal_result_bytes)
        except UnicodeError:
            failures.append(f"{helper_label} crashed on a lone-surrogate terminal string")
            continue
        if not surrogate_issues:
            failures.append(f"{helper_label} accepted a lone-surrogate terminal string")

    full_turn_id = "turn-full-session"
    full_session_id = "019f0000-0000-7000-8000-000000000001"
    full_runner_thread_id = "019f0000-0000-7000-8000-000000000002"
    full_agent_path = "/root/a004_full_session_probe"
    full_assignment_id = "A004-999999-FULL-SESSION-PROBE"
    full_session_rows = [
        transcript_row(
            "session_meta",
            {
                "session_id": full_runner_thread_id,
                "id": full_session_id,
                "parent_thread_id": full_runner_thread_id,
                "timestamp": sealed_timestamp,
                "cwd": str(ROOT),
                "originator": "Codex Desktop",
                "cli_version": "test",
                "source": {},
                "thread_source": "subagent",
                "agent_nickname": "Verifier",
                "agent_path": full_agent_path,
                "model_provider": "openai",
                "base_instructions": {},
                "history_mode": "legacy",
                "multi_agent_version": "v2",
                "context_window": {},
                "git": {},
            },
        ),
        transcript_row(
            "event_msg",
            {
                "type": "task_started",
                "collaboration_mode_kind": "default",
                "model_context_window": 1000,
                "started_at": sealed_timestamp,
                "turn_id": full_turn_id,
            },
        ),
        transcript_row(
            "response_item",
            {
                "type": "message",
                "role": "developer",
                "content": [{"type": "input_text", "text": "sealed instructions"}],
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": full_turn_id
                },
            },
        ),
        transcript_row(
            "response_item",
            {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": full_assignment_id}],
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": full_turn_id
                },
            },
        ),
        transcript_row(
            "world_state",
            {"full": True, "state": {"agents_md": {}, "environments": {}}},
        ),
        transcript_row(
            "turn_context",
            {
                "turn_id": full_turn_id,
                "cwd": str(ROOT),
                "workspace_roots": [str(ROOT)],
                "current_date": "2026-07-10",
                "timezone": "UTC",
                "approval_policy": "never",
                "approvals_reviewer": "user",
                "sandbox_policy": {},
                "permission_profile": {},
                "model": "gpt-5.6-sol",
                "comp_hash": "test",
                "personality": "friendly",
                "collaboration_mode": {},
                "multi_agent_version": "v2",
                "multi_agent_mode": "proactive",
                "realtime_active": False,
                "effort": "ultra",
                "summary": "auto",
            },
        ),
        transcript_row(
            "inter_agent_communication_metadata", {"trigger_turn": True}
        ),
        transcript_row(
            "response_item",
            {
                "type": "agent_message",
                "author": "/root",
                "recipient": full_agent_path,
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Message Type: NEW_TASK\n"
                            f"Task name: {full_agent_path}\n"
                            "Sender: /root\nPayload:\n"
                        ),
                    },
                    {
                        "type": "encrypted_content",
                        "encrypted_content": "gAAAAAsealed",
                    },
                ],
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": full_turn_id
                },
            },
        ),
        transcript_row(
            "event_msg",
            {
                "type": "agent_message",
                "message": terminal_result_text,
                "phase": "final_answer",
                "memory_citation": None,
            },
        ),
        transcript_row(
            "response_item",
            {
                "type": "message",
                "role": "assistant",
                "content": [
                    {"type": "output_text", "text": terminal_result_text}
                ],
                "id": "assistant-full-session",
                "phase": "final_answer",
                "internal_chat_message_metadata_passthrough": {
                    "turn_id": full_turn_id
                },
            },
        ),
        transcript_row(
            "event_msg",
            {
                "type": "task_complete",
                "completed_at": sealed_timestamp,
                "duration_ms": 1,
                "last_agent_message": terminal_result_text,
                "time_to_first_token_ms": 1,
                "turn_id": full_turn_id,
            },
        ),
    ]
    full_session_body = (
        "\n".join(
            json.dumps(row, separators=(",", ":")) for row in full_session_rows
        )
        + "\n"
    ).encode("utf-8")
    full_record = {
        "agent_path": full_agent_path,
        "agent_thread_id": full_session_id,
    }
    full_assignment = {
        "assignment_id": full_assignment_id,
        "runner_id": "runner-99",
        "required_model": "gpt-5.6-sol",
        "required_reasoning_effort": "ultra",
    }
    with tempfile.TemporaryDirectory(prefix="a004-v3-full-session-") as full_temp:
        full_session_path = Path(full_temp) / "session.jsonl"

        def bind_full_session(body: bytes) -> dict[str, Any]:
            full_session_path.write_bytes(body)
            full_stat = full_session_path.stat()
            return {
                "prefix_bytes": len(body),
                "prefix_sha256": hashlib.sha256(body).hexdigest(),
                "device": full_stat.st_dev,
                "inode": full_stat.st_ino,
                "runner_id": "runner-99",
                "parent_thread_id": full_runner_thread_id,
                "agent_path": full_agent_path,
            }

        full_session_row = bind_full_session(full_session_body)
        full_helpers = (
            ("primary", primary_module.strict_native_session_proof),
            ("cross-check", cross_module.x_native_session_issues),
        )
        for helper_label, helper in full_helpers:
            exact_issues = helper(
                full_session_id,
                full_session_row,
                full_session_path,
                full_record,
                full_assignment,
                terminal_result_bytes,
                full_runner_thread_id,
            )[0]
            if exact_issues:
                failures.append(
                    f"{helper_label} rejected the canonical full native session"
                )
            for mismatch_label, mismatch_bytes in raw_byte_mismatches.items():
                mismatch_issues = helper(
                    full_session_id,
                    full_session_row,
                    full_session_path,
                    full_record,
                    full_assignment,
                    mismatch_bytes,
                    full_runner_thread_id,
                )[0]
                if not mismatch_issues:
                    failures.append(
                        f"{helper_label} full proof normalized {mismatch_label} "
                        "in raw result bytes"
                    )

        full_lines = full_session_body.decode("utf-8").splitlines()
        duplicate_key_lines = list(full_lines)
        duplicate_key_lines[0] = duplicate_key_lines[0].replace(
            '"type":"session_meta"',
            '"type":"custom_tool_call","type":"session_meta"',
            1,
        )
        nan_lines = list(full_lines)
        nan_lines[0] = nan_lines[0].replace(
            f'"timestamp":"{sealed_timestamp}"', '"timestamp":NaN', 1
        )
        infinity_lines = list(full_lines)
        infinity_lines[-1] = infinity_lines[-1].replace(
            '"duration_ms":1', '"duration_ms":Infinity', 1
        )
        overflow_lines = list(full_lines)
        overflow_lines[-1] = overflow_lines[-1].replace(
            '"duration_ms":1', '"duration_ms":1e9999', 1
        )
        underflow_lines = list(full_lines)
        underflow_lines[-1] = underflow_lines[-1].replace(
            '"duration_ms":1', '"duration_ms":1e-9999', 1
        )
        mismatched_session_rows = copy.deepcopy(full_session_rows)
        mismatched_session_rows[0]["payload"]["session_id"] = (
            "019f0000-0000-7000-8000-000000000099"
        )
        surrogate_session_rows = copy.deepcopy(full_session_rows)
        surrogate_session_rows[-3]["payload"]["message"] = "\ud800"
        surrogate_session_rows[-2]["payload"]["content"][0]["text"] = "\ud800"
        surrogate_session_rows[-1]["payload"]["last_agent_message"] = "\ud800"
        full_session_mutations = {
            "duplicate transcript object key": (
                "\n".join(duplicate_key_lines) + "\n"
            ).encode("utf-8"),
            "non-standard NaN transcript value": (
                "\n".join(nan_lines) + "\n"
            ).encode("utf-8"),
            "non-standard Infinity transcript value": (
                "\n".join(infinity_lines) + "\n"
            ).encode("utf-8"),
            "overflowing finite-syntax transcript decimal": (
                "\n".join(overflow_lines) + "\n"
            ).encode("utf-8"),
            "underflowing finite-syntax transcript decimal": (
                "\n".join(underflow_lines) + "\n"
            ).encode("utf-8"),
            "contradictory session_meta.session_id": (
                "\n".join(
                    json.dumps(row, separators=(",", ":"))
                    for row in mismatched_session_rows
                )
                + "\n"
            ).encode("utf-8"),
            "escaped lone-surrogate transcript string": (
                "\n".join(
                    json.dumps(row, separators=(",", ":"))
                    for row in surrogate_session_rows
                )
                + "\n"
            ).encode("utf-8"),
        }
        for mutation_label, mutated_body in full_session_mutations.items():
            mutated_session_row = bind_full_session(mutated_body)
            for helper_label, helper in full_helpers:
                mutation_issues = helper(
                    full_session_id,
                    mutated_session_row,
                    full_session_path,
                    full_record,
                    full_assignment,
                    terminal_result_bytes,
                    full_runner_thread_id,
                )[0]
                if not mutation_issues:
                    failures.append(
                        f"{helper_label} accepted {mutation_label}"
                    )

    with tempfile.TemporaryDirectory(prefix="a004-v3-session-seal-") as session_temp:
        session_path = Path(session_temp) / "session.jsonl"
        sealed_body = b'{"type":"session_meta"}\n'
        session_path.write_bytes(sealed_body)
        session_stat = session_path.stat()
        session_row = {
            "prefix_bytes": len(sealed_body),
            "prefix_sha256": hashlib.sha256(sealed_body).hexdigest(),
            "device": session_stat.st_dev,
            "inode": session_stat.st_ino,
        }
        primary_body, primary_seal_issues = (
            primary_module.strict_read_closed_native_session(
                session_path, session_row
            )
        )
        cross_body, cross_seal_issues = cross_module.x_read_closed_native_session(
            session_path, session_row
        )
        if primary_seal_issues or primary_body != sealed_body:
            failures.append("primary rejected an exactly sealed native session")
        if cross_seal_issues or cross_body != sealed_body:
            failures.append("cross-check rejected an exactly sealed native session")
        with session_path.open("ab") as handle:
            handle.write(b'{"type":"turn_context"}\n')
        if not primary_module.strict_read_closed_native_session(
            session_path, session_row
        )[1]:
            failures.append("primary ignored native-session suffix growth")
        if not cross_module.x_read_closed_native_session(session_path, session_row)[1]:
            failures.append("cross-check ignored native-session suffix growth")

    def add_forged_credit(doc: dict[str, Any]) -> None:
        fake = "A004-999999-FORGED-WIN-000000000000-0000"
        ids = list(doc["credited_assignment_ids"]) + [fake]
        doc["credited_assignment_ids"] = sorted(ids)
        doc["credited_assignment_ids_sha256"] = digest(ids)
        doc["counts"]["credited_assignments"] = len(ids)
        forged = copy.deepcopy(doc["credited_result_receipts"][0])
        forged["assignment_id"] = fake
        doc["credited_result_receipts"].append(forged)

    def remove_real_credit(doc: dict[str, Any]) -> None:
        removed = doc["credited_assignment_ids"][0]
        ids = [value for value in doc["credited_assignment_ids"] if value != removed]
        doc["credited_assignment_ids"] = ids
        doc["credited_assignment_ids_sha256"] = digest(ids)
        doc["counts"]["credited_assignments"] = len(ids)
        doc["credited_result_receipts"] = [
            row for row in doc["credited_result_receipts"] if row.get("assignment_id") != removed
        ]

    def forge_eligible(doc: dict[str, Any]) -> None:
        fake = "A004-999998-FORGED-WIN-000000000000-0000"
        doc["mechanically_eligible_assignment_ids"] = [fake]
        doc["validated_assignment_ids_sha256"] = digest([fake])
        doc["counts"]["mechanically_eligible_assignments"] = 1
        doc["counts"]["validated_results"] = 1
        forged = copy.deepcopy(doc["credited_result_receipts"][0])
        forged["assignment_id"] = fake
        doc["mechanically_eligible_result_receipts"] = [forged]

    def alter_structural_adjudication(doc: dict[str, Any]) -> None:
        doc["superseded_v2_structural_rejections"][0]["coverage_credit"] = 1

    def add_unknown_top_key(doc: dict[str, Any]) -> None:
        doc["forged_unknown_authority"] = True

    def flip_floor_gate(doc: dict[str, Any]) -> None:
        doc["v2_floor_authority_integrity_passed"] = False

    def forge_preserved_floor(doc: dict[str, Any]) -> None:
        doc["preserved_v2_floor_assignment_ids"] = []
        doc["preserved_v2_floor_assignment_ids_sha256"] = digest([])

    def forge_new_v3(doc: dict[str, Any]) -> None:
        fake = "A004-999997-FORGED-NEW-V3"
        doc["new_v3_credited_assignment_ids"] = [fake]
        doc["new_v3_credited_assignment_ids_sha256"] = digest([fake])

    def erase_malformed(doc: dict[str, Any]) -> None:
        doc["malformed_runner_receipts"] = []

    def erase_transaction_inventory(doc: dict[str, Any]) -> None:
        doc["transaction_input_file_sha256"] = {}

    def forge_identity_summary(doc: dict[str, Any]) -> None:
        doc["identity_uniqueness"] = {}

    def forge_policy(doc: dict[str, Any]) -> None:
        doc["coverage_policy"] = "forged permissive policy"

    def forge_authority(doc: dict[str, Any]) -> None:
        doc["authority"] = "forged authority"

    def forge_suppression(doc: dict[str, Any]) -> None:
        doc["credit_suppression_reasons"] = ["fabricated suppression"]

    def forge_unreceipted(doc: dict[str, Any]) -> None:
        doc["unreceipted_native_sessions"] = ["forged-session"]

    def forge_floor_discrepancy(doc: dict[str, Any]) -> None:
        doc["preserved_v2_floor_assurance_discrepancies"] = [
            {"assignment_id": "A004-FORGED", "reasons": ["forged"]}
        ]

    def forge_timestamp(doc: dict[str, Any]) -> None:
        doc["observed_at"] = "not-utc"

    mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("self-consistent forged credit", add_forged_credit),
        ("self-consistent omitted credit", remove_real_credit),
        ("forged eligible assignment", forge_eligible),
        ("altered structural supersession", alter_structural_adjudication),
        ("unknown authority field", add_unknown_top_key),
        ("false V2 floor gate", flip_floor_gate),
        ("forged preserved floor", forge_preserved_floor),
        ("forged new V3 set", forge_new_v3),
        ("erased malformed receipts", erase_malformed),
        ("erased transaction inventory", erase_transaction_inventory),
        ("forged identity summary", forge_identity_summary),
        ("forged policy", forge_policy),
        ("forged authority", forge_authority),
        ("forged suppression reasons", forge_suppression),
        ("forged unreceipted sessions", forge_unreceipted),
        ("forged floor discrepancy", forge_floor_discrepancy),
        ("malformed observation timestamp", forge_timestamp),
    ]

    with tempfile.TemporaryDirectory(prefix="a004-v3-adversarial-") as temporary:
        temp = Path(temporary)
        for index, (name, mutate) in enumerate(mutations, 1):
            candidate = copy.deepcopy(base)
            mutate(candidate)
            path = temp / f"tampered-{index}.json"
            path.write_text(json.dumps(candidate, indent=2, sort_keys=True) + "\n", encoding="utf-8")
            result = run_cross(cross, primary, path)
            if result.returncode == 0:
                failures.append(f"cross-check accepted {name}")

    protected_runner = ROOT / "runners/runner-07/fresh_agent_assignment_registry.jsonl"
    runner_before = protected_runner.read_bytes()
    runner_inode_before = protected_runner.stat().st_ino
    output_attack = subprocess.run(
        [sys.executable, str(primary), "--output", str(protected_runner)],
        text=True,
        capture_output=True,
        check=False,
    )
    runner_after = protected_runner.read_bytes()
    if (
        output_attack.returncode == 0
        or "--output must name a new, non-symlink evidence file"
        not in output_attack.stderr
        or protected_runner.stat().st_ino != runner_inode_before
        or not runner_after.startswith(runner_before)
    ):
        failures.append("primary output-path guard did not protect runner namespace")

    snapshot_before = sha256(snapshot_path)
    overwrite_attack = subprocess.run(
        [sys.executable, str(primary), "--output", str(snapshot_path)],
        text=True,
        capture_output=True,
        check=False,
    )
    if overwrite_attack.returncode == 0 or sha256(snapshot_path) != snapshot_before:
        failures.append("primary output-path guard allowed evidence overwrite")

    cross_before = sha256(cross_snapshot_path)
    cross_overwrite = run_cross(
        cross, primary, snapshot_path, output=cross_snapshot_path
    )
    if cross_overwrite.returncode == 0 or sha256(cross_snapshot_path) != cross_before:
        failures.append("cross-check output-path guard allowed evidence overwrite")

    invalid_primary_checkpoint = subprocess.run(
        [
            sys.executable,
            str(primary),
            "--lineage-checkpoint",
            str(snapshot_path),
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if (
        invalid_primary_checkpoint.returncode == 0
        or "compile-time pinned bootstrap" not in invalid_primary_checkpoint.stderr
    ):
        failures.append("primary accepted an unpromoted lineage checkpoint")
    invalid_cross_checkpoint = subprocess.run(
        [
            sys.executable,
            str(cross),
            "--snapshot",
            str(snapshot_path),
            "--validator",
            str(primary),
            "--lineage-checkpoint",
            str(snapshot_path),
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if (
        invalid_cross_checkpoint.returncode == 0
        or "compile-time pinned" not in invalid_cross_checkpoint.stderr
    ):
        failures.append("cross-check accepted an unpromoted lineage checkpoint")

    report = {
        "status": "pass" if not failures else "fail",
        "tests": (
            1
            + len(mutations)
            + 3
            + (2 * len(custom_tool_programs))
            + 2
            + 4
            + 4
            + 2
            + (2 * len(actionable_transcript_rows))
            + 2
            + 14
            + 2
            + (2 * len(state_mutations))
            + (2 * len(raw_byte_mismatches))
            + 2
            + (2 * len(raw_byte_mismatches))
            + 3
            + (2 * len(invalid_json_forms))
            + (2 * len(full_session_mutations))
            + 2
        ),
        "failures": failures,
        "primary_sha256": sha256(primary),
        "crosscheck_sha256": sha256(cross),
        "snapshot_sha256": sha256(snapshot_path),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
