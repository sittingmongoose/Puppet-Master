#!/usr/bin/env python3
"""Zero-subject regressions for the simple Codex Desktop Goal adapter."""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path
from typing import Any, Callable
from unittest import mock

import r10_app_probe as probe
import r10_contract as contract

THREAD = "01a034ca-1111-7222-8333-444455556666"
TURN1 = "01a034ca-aaaa-7111-8222-333344445555"
TURN2 = "01a034ca-bbbb-7222-8333-444455556666"
HEAD = "a" * 40
PROMPT = "Create a goal that completes bounded PromptCapsule canary_evidence_04 and returns only one JSON object."
OBJECTIVE = "Complete bounded PromptCapsule canary_evidence_04 and return only one typed JSON result."
RESULT = {
    "unit_id": "canary_evidence_04",
    "selected_source_id": "S5",
    "execution_proven": False,
    "source_ids": ["S5"],
}
SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "additionalProperties": False,
    "required": ["unit_id", "selected_source_id", "execution_proven", "source_ids"],
    "properties": {
        "unit_id": {"type": "string", "const": "canary_evidence_04"},
        "selected_source_id": {"type": "string", "enum": ["S5", "S6"]},
        "execution_proven": {"type": "boolean"},
        "source_ids": {
            "type": "array",
            "minItems": 1,
            "maxItems": 2,
            "items": {"type": "string", "enum": ["S5", "S6"]},
        },
    },
}


def manifest() -> dict[str, Any]:
    return {
        "run_id": "r10-codex-app-canary-004",
        "project": {"project_id": probe.EXPECTED_PROJECT_ID},
        "launcher": {"title": "R10-C4-test"},
        "row": {
            "row_id": "row-alpha-004",
            "route_id": "alpha",
            "model": "gpt-5.4-mini",
            "reasoning_effort": "xhigh",
        },
        "runtime_expected": {
            "originator": "Codex Desktop",
            "source": "vscode",
            "thread_source": "user",
            "model_provider": "openai",
            "cwd": probe.EXPECTED_PROJECT,
            "sandbox_policy": {"type": "danger-full-access"},
            "approval_policy": "never",
            "permission_profile": {"type": "disabled"},
        },
        "acceptance": {
            "app_wait_event_max": 8,
            "goal_objective_max_utf8_bytes": 512,
            "goal_objective_allowed_prefixes": [
                ["complete", "bounded", "promptcapsule", "canary_evidence_04"],
                ["complete", "the", "bounded", "promptcapsule", "canary_evidence_04"],
                ["completes", "bounded", "promptcapsule", "canary_evidence_04"],
                ["completes", "the", "bounded", "promptcapsule", "canary_evidence_04"],
            ],
            "goal_objective_allowed_suffix_terms": [
                "and", "below", "json", "matching", "object", "one", "only",
                "output_contract.inline_schema", "produce", "produces", "required", "result",
                "return", "returns", "schema", "the", "typed",
            ],
        },
    }


def meta(turn: str) -> dict[str, Any]:
    return {"internal_chat_message_metadata_passthrough": {"turn_id": turn}}


def event(ordinal: int, kind: str, turn: str, **extra: Any) -> dict[str, Any]:
    return {
        "ordinal": ordinal,
        "type": "event_msg",
        "payload": {"type": kind, "thread_id": THREAD, "turn_id": turn, **extra},
    }


def context(ordinal: int, turn: str) -> dict[str, Any]:
    return {
        "ordinal": ordinal,
        "type": "turn_context",
        "payload": {
            "turn_id": turn,
            "cwd": probe.EXPECTED_PROJECT,
            "workspace_roots": [
                probe.EXPECTED_PROJECT,
                f"/home/sittingmongoose/.codex/visualizations/2026/08/24/{THREAD}",
            ],
            "approval_policy": "never",
            "sandbox_policy": {"type": "danger-full-access"},
            "permission_profile": {"type": "disabled"},
            "model": "gpt-5.4-mini",
            "effort": "xhigh",
        },
    }


def message(ordinal: int, role: str, text: str, turn: str | None, phase: str | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "type": "message",
        "role": role,
        "content": [{"type": "output_text" if role == "assistant" else "input_text", "text": text}],
    }
    if turn is not None:
        payload.update(meta(turn))
    if phase is not None:
        payload["phase"] = phase
    return {"ordinal": ordinal, "type": "response_item", "payload": payload}


def wrapper_call(ordinal: int, turn: str, call_id: str, tool: str) -> dict[str, Any]:
    if tool == "create_goal":
        source = f'const result = await tools.create_goal({{objective: {json.dumps(OBJECTIVE)}}});\ntext(result);\n'
    elif tool == "update_goal":
        source = 'const result = await tools.update_goal({status: "complete"});\ntext(result);\n'
    else:
        source = "const result = await tools.get_goal({});\ntext(result);\n"
    return {
        "ordinal": ordinal,
        "type": "response_item",
        "payload": {"type": "custom_tool_call", "name": "exec", "call_id": call_id, "input": source, **meta(turn)},
    }


def wrapper_output(ordinal: int, turn: str, call_id: str, status: str) -> dict[str, Any]:
    goal = {
        "threadId": THREAD,
        "objective": OBJECTIVE,
        "status": status,
        "tokensUsed": 0 if status == "active" else 100,
        "timeUsedSeconds": 0 if status == "active" else 2,
        "createdAt": 1000,
        "updatedAt": 1000 if status == "active" else 1002,
    }
    return {
        "ordinal": ordinal,
        "type": "response_item",
        "payload": {
            "type": "custom_tool_call_output",
            "call_id": call_id,
            "output": [{"type": "input_text", "text": contract.canonical_bytes({"goal": goal}).decode()}],
            **meta(turn),
        },
    }


def session() -> dict[str, Any]:
    return {
        "ordinal": 1,
        "type": "session_meta",
        "payload": {
            "id": THREAD,
            "session_id": THREAD,
            "originator": "Codex Desktop",
            "source": "vscode",
            "thread_source": "user",
            "model_provider": "openai",
            "cwd": probe.EXPECTED_PROJECT,
            "git": {"commit_hash": HEAD},
        },
    }


def one_turn_trace() -> list[dict[str, Any]]:
    user_item = {"type": "UserMessage", "id": "user-1", "content": [{"type": "text", "text": PROMPT}]}
    return [
        session(),
        message(2, "user", "<recommended_plugins>platform bootstrap</recommended_plugins>", None),
        event(3, "task_started", TURN1),
        context(4, TURN1),
        message(5, "user", PROMPT, TURN1),
        event(6, "item_completed", TURN1, item=user_item),
        wrapper_call(7, TURN1, "create-1", "create_goal"),
        wrapper_output(8, TURN1, "create-1", "active"),
        wrapper_call(9, TURN1, "update-1", "update_goal"),
        wrapper_output(10, TURN1, "update-1", "complete"),
        message(11, "assistant", contract.canonical_bytes(RESULT).decode(), TURN1, "final_answer"),
        event(12, "task_complete", TURN1),
    ]


def two_turn_trace() -> list[dict[str, Any]]:
    rows = one_turn_trace()[:8]
    rows.extend(
        [
            message(9, "assistant", "Continuing bounded capsule work.", TURN1, "final_answer"),
            event(10, "task_complete", TURN1),
            event(11, "task_started", TURN2),
            context(12, TURN2),
            message(13, "user", '<codex_internal_context source="goal">automatic continuation</codex_internal_context>', TURN2),
            wrapper_call(14, TURN2, "update-1", "update_goal"),
            wrapper_output(15, TURN2, "update-1", "complete"),
            message(16, "assistant", contract.canonical_bytes(RESULT).decode(), TURN2, "final_answer"),
            event(17, "task_complete", TURN2),
        ]
    )
    return rows


def verify(rows: list[dict[str, Any]]) -> dict[str, Any]:
    return probe.verify_trace(manifest(), PROMPT, rows, {"canary_evidence_04": RESULT}, SCHEMA, THREAD, HEAD)


def terminal_response(turns: int = 1) -> dict[str, Any]:
    first = {
        "id": TURN1,
        "status": "completed",
        "error": None,
        "startedAt": 1,
        "completedAt": 2,
        "durationMs": 1000,
        "items": [
            {"type": "userMessage", "id": "user-1", "content": [{"type": "text", "text": PROMPT}]},
            {"type": "agentMessage", "id": "agent-1", "text": contract.canonical_bytes(RESULT).decode()},
        ],
    }
    turn_rows = [first]
    if turns == 2:
        first["items"][-1]["text"] = "Continuing bounded capsule work."
        turn_rows.insert(
            0,
            {
                "id": TURN2,
                "status": "completed",
                "error": None,
                "startedAt": 3,
                "completedAt": 4,
                "durationMs": 1000,
                "items": [{"type": "agentMessage", "id": "agent-2", "text": contract.canonical_bytes(RESULT).decode()}],
            },
        )
    return {
        "schemaVersion": 1,
        "thread": {
            "id": THREAD,
            "kind": "codex",
            "hostId": probe.EXPECTED_HOST_ID,
            "title": "R10-C4-test",
            "cwd": probe.EXPECTED_PROJECT,
            "status": {"type": "idle", "activeFlags": []},
        },
        "page": {"order": "newest_first", "limit": 16, "nextCursor": None, "hasMore": False},
        "turns": turn_rows,
    }


def parent_session() -> dict[str, Any]:
    return {
        "ordinal": 1,
        "type": "session_meta",
        "payload": {
            "id": probe.EXPECTED_PARENT_THREAD,
            "session_id": probe.EXPECTED_PARENT_THREAD,
            "originator": "Codex Desktop",
            "source": "vscode",
            "thread_source": "user",
            "model_provider": "openai",
        },
    }


def app_event(ordinal: int, tool: str, arguments: dict[str, Any], result: dict[str, Any] | str | None) -> dict[str, Any]:
    content = [] if result is None else [{
        "type": "inputText",
        "text": result if isinstance(result, str) else contract.canonical_bytes(result).decode(),
    }]
    return {
        "ordinal": ordinal,
        "type": "event_msg",
        "payload": {
            "type": "item_completed",
            "thread_id": probe.EXPECTED_PARENT_THREAD,
            "item": {
                "type": "DynamicToolCall",
                "id": f"event-{ordinal}",
                "namespace": "codex_app",
                "tool": tool,
                "arguments": arguments,
                "status": "completed",
                "success": True,
                "content_items": content,
            },
        },
    }


def raw_rows(rows: list[dict[str, Any]]) -> bytes:
    return b"".join(contract.canonical_bytes(row) + b"\n" for row in rows)


def parent_fixture(wait_count: int = 0, turns: int = 1) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    test_manifest = manifest()
    request = probe.launch_request(test_manifest, PROMPT)
    prefix = raw_rows([parent_session()])
    reservation = {
        "parent_rollout_prefix_bytes": len(prefix),
        "parent_rollout_prefix_sha256": probe.sha256(prefix),
        "parent_rollout_last_ordinal": 1,
    }
    rows = [parent_session(), app_event(2, "create_thread", request, {"threadId": THREAD, "hostId": probe.EXPECTED_HOST_ID})]
    for index in range(wait_count):
        rows.append(
            app_event(
                3 + index,
                "wait_threads",
                {"targets": [{"threadId": THREAD, "hostId": probe.EXPECTED_HOST_ID}], "timeoutMs": 30000},
                None,
            )
        )
    rows.append(app_event(3 + wait_count, "read_thread", probe.read_request(THREAD), terminal_response(turns)))
    return rows, {"manifest": test_manifest, "request": request}, reservation


def renumber(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for index, row in enumerate(rows, 1):
        row["ordinal"] = index
    return rows


def expect_fail(name: str, operation: Callable[[], Any]) -> str:
    try:
        operation()
    except (probe.AppProbeError, contract.ContractError, ValueError, OSError):
        return name
    raise AssertionError(f"expected rejection: {name}")


def main() -> int:
    checks = 0
    rejected: list[str] = []

    probe.require(verify(one_turn_trace())["task_turn_count"] == 1, "one-turn positive")
    probe.require(verify(two_turn_trace())["task_turn_count"] == 2, "two-turn positive")
    checks += 2
    benign_world = copy.deepcopy(one_turn_trace())
    benign_world.insert(2, {"ordinal": 3, "type": "world_state", "payload": {"full": True, "state": {"apps_instructions": True}}})
    probe.require(verify(renumber(benign_world))["task_turn_count"] == 1, "world_state positive")
    checks += 1

    rows, bundle, reservation = parent_fixture(0)
    projection = probe.parent_event_projection(raw_rows(rows), bundle, reservation)
    probe.require(projection["thread_id"] == THREAD and projection["wait_event_count"] == 0, "zero-wait parent positive")
    probe.validate_terminal_response(projection["terminal_response"], manifest(), THREAD, PROMPT, RESULT, [TURN1], TURN1)
    checks += 2
    rows, bundle, reservation = parent_fixture(2, 2)
    projection = probe.parent_event_projection(raw_rows(rows), bundle, reservation)
    probe.require(projection["wait_event_count"] == 2, "two-wait parent positive")
    probe.validate_terminal_response(projection["terminal_response"], manifest(), THREAD, PROMPT, RESULT, [TURN1, TURN2], TURN2)
    checks += 2
    ignored_wait_failure = copy.deepcopy(rows)
    ignored_wait_failure[2]["payload"]["item"].update(
        {"status": "failed", "success": False, "isError": True, "content_items": [{"type": "inputText", "text": "malformed"}]}
    )
    probe.require(
        probe.parent_event_projection(raw_rows(ignored_wait_failure), bundle, reservation)["wait_event_count"] == 2,
        "ignored wait result positive",
    )
    checks += 1

    duplicate_submission = copy.deepcopy(one_turn_trace())
    duplicate_submission.insert(7, copy.deepcopy(duplicate_submission[5]))
    rejected.append(expect_fail("duplicate-external-submission", lambda: verify(renumber(duplicate_submission))))
    unexpected_user = copy.deepcopy(one_turn_trace())
    unexpected_user.insert(7, message(7, "user", "second message", TURN1))
    rejected.append(expect_fail("unexpected-user-message", lambda: verify(renumber(unexpected_user))))
    wrong_model = copy.deepcopy(one_turn_trace())
    wrong_model[3]["payload"]["model"] = "gpt-5.6-sol"
    rejected.append(expect_fail("effective-model-drift", lambda: verify(wrong_model)))
    missing_create = [row for row in copy.deepcopy(one_turn_trace()) if row.get("payload", {}).get("call_id") != "create-1"]
    rejected.append(expect_fail("missing-create", lambda: verify(renumber(missing_create))))
    missing_update = [row for row in copy.deepcopy(one_turn_trace()) if row.get("payload", {}).get("call_id") != "update-1"]
    rejected.append(expect_fail("missing-update", lambda: verify(renumber(missing_update))))
    trivial_goal = copy.deepcopy(one_turn_trace())
    trivial = "Return canary_evidence_04."
    trivial_goal[6]["payload"]["input"] = f'const result = await tools.create_goal({{objective: {json.dumps(trivial)}}});\ntext(result);\n'
    for index in (7, 9):
        value = contract.load_json_text(trivial_goal[index]["payload"]["output"][0]["text"])
        value["goal"]["objective"] = trivial
        trivial_goal[index]["payload"]["output"][0]["text"] = contract.canonical_bytes(value).decode()
    rejected.append(expect_fail("trivial-goal-objective", lambda: verify(trivial_goal)))
    wrong_oracle = copy.deepcopy(one_turn_trace())
    wrong = dict(RESULT, selected_source_id="S6", source_ids=["S6"])
    wrong_oracle[10] = message(11, "assistant", contract.canonical_bytes(wrong).decode(), TURN1, "final_answer")
    rejected.append(expect_fail("wrong-oracle", lambda: verify(wrong_oracle)))
    active_terminal = copy.deepcopy(one_turn_trace())
    active_terminal[9] = wrapper_output(10, TURN1, "update-1", "active")
    rejected.append(expect_fail("active-terminal-goal", lambda: verify(active_terminal)))
    continuation_submission = copy.deepcopy(two_turn_trace())
    continuation_submission.insert(14, event(14, "item_completed", TURN2, item={"type": "UserMessage", "id": "user-2", "content": [{"type": "text", "text": "duplicate"}]}))
    rejected.append(expect_fail("continuation-external-submission", lambda: verify(renumber(continuation_submission))))
    for event_type, item_type in (("command_execution", "CommandExecution"), ("file_change", "FileChange")):
        action_event = copy.deepcopy(one_turn_trace())
        action_event.insert(7, event(7, event_type, TURN1, item={"type": item_type, "id": f"{event_type}-1"}))
        rejected.append(expect_fail(f"child-{event_type}-event", lambda rows=renumber(action_event): verify(rows)))
    for response_type in ("file_change", "fileChange", "command_execution", "commandExecution"):
        action_response = copy.deepcopy(one_turn_trace())
        action_response.insert(7, {"ordinal": 7, "type": "response_item", "payload": {"type": response_type, **meta(TURN1)}})
        rejected.append(expect_fail(f"child-{response_type}-response", lambda rows=renumber(action_response): verify(rows)))
    action_world = copy.deepcopy(one_turn_trace())
    action_world.insert(7, {"ordinal": 7, "type": "world_state", "payload": {"type": "command_execution", "command": "touch forbidden"}})
    rejected.append(expect_fail("child-action-world-state", lambda: verify(renumber(action_world))))

    rows, bundle, reservation = parent_fixture()
    duplicate_id = copy.deepcopy(rows)
    duplicate_id[-1]["payload"]["item"]["id"] = duplicate_id[1]["payload"]["item"]["id"]
    rejected.append(expect_fail("duplicate-app-event-id", lambda: probe.parent_event_projection(raw_rows(duplicate_id), bundle, reservation)))
    wrong_create = copy.deepcopy(rows)
    wrong_create[1]["payload"]["item"]["arguments"]["thinking"] = "medium"
    rejected.append(expect_fail("create-arguments-drift", lambda: probe.parent_event_projection(raw_rows(wrong_create), bundle, reservation)))
    wrong_tool = copy.deepcopy(rows)
    wrong_tool.insert(-1, app_event(3, "send_message_to_thread", {"threadId": THREAD, "message": "x"}, {}))
    rejected.append(expect_fail("other-app-event", lambda: probe.parent_event_projection(raw_rows(renumber(wrong_tool)), bundle, reservation)))
    missing_create_result = copy.deepcopy(rows)
    missing_create_result[1]["payload"]["item"]["content_items"] = []
    rejected.append(expect_fail("missing-create-result", lambda: probe.parent_event_projection(raw_rows(missing_create_result), bundle, reservation)))
    malformed_read = copy.deepcopy(rows)
    malformed_read[-1]["payload"]["item"]["content_items"][0]["text"] = "not json"
    rejected.append(expect_fail("malformed-read-result", lambda: probe.parent_event_projection(raw_rows(malformed_read), bundle, reservation)))
    wait_rows, wait_bundle, wait_reservation = parent_fixture(1)
    wait_rows[2]["payload"]["item"]["arguments"]["targets"][0]["threadId"] = probe.EXPECTED_PARENT_THREAD
    rejected.append(expect_fail("wait-target-drift", lambda: probe.parent_event_projection(raw_rows(wait_rows), wait_bundle, wait_reservation)))
    too_many, many_bundle, many_reservation = parent_fixture(9)
    rejected.append(expect_fail("wait-ceiling", lambda: probe.parent_event_projection(raw_rows(too_many), many_bundle, many_reservation)))
    drift_reservation = dict(reservation, parent_rollout_prefix_sha256="0" * 64)
    rejected.append(expect_fail("parent-prefix-drift", lambda: probe.parent_event_projection(raw_rows(rows), bundle, drift_reservation)))
    active_response = terminal_response()
    active_response["thread"]["status"]["type"] = "active"
    rejected.append(expect_fail("terminal-not-idle", lambda: probe.validate_terminal_response(active_response, manifest(), THREAD, PROMPT, RESULT, [TURN1])))
    wrong_turns = terminal_response()
    wrong_turns["turns"][0]["id"] = TURN2
    rejected.append(expect_fail("terminal-turn-drift", lambda: probe.validate_terminal_response(wrong_turns, manifest(), THREAD, PROMPT, RESULT, [TURN1])))
    with tempfile.TemporaryDirectory() as temporary:
        evidence = Path(temporary) / "canary_004" / Path(probe.EXPECTED_EVIDENCE).name
        evidence.mkdir(parents=True)
        (evidence / "verification.json").write_bytes(b"{}\n")
        rejected.append(expect_fail("terminal-verification-reuse", lambda: probe.verify_evidence(evidence)))
    with tempfile.TemporaryDirectory() as temporary:
        test_root = Path(temporary)
        evidence = test_root / "canary_004" / "capture-evidence"
        evidence.mkdir(parents=True)
        capture_bundle = {
            "manifest": {
                "run_id": "r10-codex-app-canary-004",
                "row": {"row_id": "row-alpha-004"},
                "evidence_root": "canary_004/capture-evidence",
            }
        }
        with mock.patch.object(probe, "ROOT", test_root):
            rejected.append(expect_fail("capture-precheck-failure", lambda: probe.capture(capture_bundle)))
            failure_raw = (evidence / "capture_failure.json").read_bytes()
            rejected.append(expect_fail("capture-failure-sticky", lambda: probe.capture(capture_bundle)))
            probe.require((evidence / "capture_failure.json").read_bytes() == failure_raw, "capture failure receipt changed")
            checks += 1

    checks += len(rejected)
    print(
        contract.canonical_bytes(
            {
                "schema_id": "pm.r10.app_selftest.v2",
                "checks": checks,
                "expected_rejections": rejected,
                "subject_calls": 0,
                "qualification_credit": 0,
                "status": "PASS",
            }
        ).decode()
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
