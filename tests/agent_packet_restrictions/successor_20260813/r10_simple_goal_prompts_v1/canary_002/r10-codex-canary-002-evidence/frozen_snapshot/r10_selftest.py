#!/usr/bin/env python3
"""Zero-subject deterministic regression tests for the R10 contract/parser."""

from __future__ import annotations

import copy
import math
import sys
import tempfile
from pathlib import Path

import jsonschema

import r10_contract as contract
import r10_runner as runner
import r10_verify as verify

ROOT = Path(__file__).resolve().parent
CAPSULE = ROOT / "canary_002" / "capsule.json"
RESPONSE_SCHEMA = ROOT / "canary_002" / "response.schema.json"


def expect_fail(label: str, action) -> str:
    try:
        action()
    except Exception:
        return label
    raise AssertionError(f"expected failure: {label}")


def main() -> int:
    base = contract.load_json(CAPSULE)
    codex_prompt, codex_metrics = contract.render_prompt(base, "codex")
    omp_prompt, omp_metrics = contract.render_prompt(base, "omp")
    assert codex_prompt.startswith("Create a goal that ")
    assert omp_prompt.startswith("/goal ")
    assert codex_metrics["prompt_utf8_bytes"] <= contract.MAX_PROMPT_BYTES
    assert omp_metrics["prompt_utf8_bytes"] <= contract.MAX_PROMPT_BYTES
    contract.validate_provider_response_schema(contract.load_json(RESPONSE_SCHEMA))

    failures: list[str] = []

    value = copy.deepcopy(base)
    value["admitted_context"][0]["utf8_bytes"] -= 1
    failures.append(expect_fail("declared-byte-mismatch", lambda: contract.validate_capsule(value)))

    value = copy.deepcopy(base)
    value["admitted_context"][0]["text_sha256"] = "0" * 64
    failures.append(expect_fail("source-hash-mismatch", lambda: contract.validate_capsule(value)))

    value = copy.deepcopy(base)
    value["lineage"]["allowed_source_ids"] = ["S2", "S1"]
    failures.append(expect_fail("lineage-order-mismatch", lambda: contract.validate_capsule(value)))

    value = copy.deepcopy(base)
    value["constraints"][0]["source_ids"] = ["S9"]
    failures.append(expect_fail("constraint-unadmitted-source", lambda: contract.validate_capsule(value)))

    value = copy.deepcopy(base)
    value["output_contract"]["inline_schema"] = {}
    failures.append(expect_fail("empty-output-schema", lambda: contract.validate_capsule(value)))

    failed_provider_schema = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    failed_provider_schema["properties"]["source_ids"]["uniqueItems"] = True
    failures.append(expect_fail(
        "provider-rejects-canary-001-uniqueItems",
        lambda: contract.validate_provider_response_schema(failed_provider_schema),
    ))

    mismatched_enum = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    mismatched_enum["properties"]["selected_source_id"]["enum"] = [1]
    failures.append(expect_fail("provider-string-enum-type", lambda: contract.validate_provider_response_schema(mismatched_enum)))

    mismatched_enum = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    mismatched_enum["properties"]["execution_proven"]["enum"] = [None]
    failures.append(expect_fail("provider-boolean-enum-type", lambda: contract.validate_provider_response_schema(mismatched_enum)))

    semantic_duplicate_enum = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    semantic_duplicate_enum["properties"]["selected_source_id"] = {"type": "number", "enum": [1, 1.0]}
    failures.append(expect_fail(
        "provider-semantic-enum-duplicate",
        lambda: contract.validate_provider_response_schema(semantic_duplicate_enum),
    ))

    nested: dict[str, object] = {"type": "string"}
    for _index in range(contract.MAX_PROVIDER_SCHEMA_DEPTH - 1):
        nested = {"type": "array", "items": nested}
    overdeep_schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "additionalProperties": False,
        "required": ["value"],
        "properties": {"value": nested},
    }
    failures.append(expect_fail("provider-schema-depth", lambda: contract.validate_provider_response_schema(overdeep_schema)))

    too_many_properties = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "additionalProperties": False,
        "required": [f"p{index}" for index in range(contract.MAX_PROVIDER_OBJECT_PROPERTIES + 1)],
        "properties": {
            f"p{index}": {"type": "string"}
            for index in range(contract.MAX_PROVIDER_OBJECT_PROPERTIES + 1)
        },
    }
    failures.append(expect_fail(
        "provider-total-object-properties",
        lambda: contract.validate_provider_response_schema(too_many_properties),
    ))

    too_many_enum_values = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    too_many_enum_values["properties"]["selected_source_id"]["enum"] = [
        f"v{index}" for index in range(contract.MAX_PROVIDER_ENUM_VALUES + 1)
    ]
    failures.append(expect_fail(
        "provider-total-enum-values",
        lambda: contract.validate_provider_response_schema(too_many_enum_values),
    ))

    excessive_string_budget = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    excessive_string_budget["properties"]["selected_source_id"]["enum"] = [
        "x" * (contract.MAX_PROVIDER_SCHEMA_STRING_CHARS + 1)
    ]
    failures.append(expect_fail(
        "provider-total-string-characters",
        lambda: contract.validate_provider_response_schema(excessive_string_budget),
    ))

    excessive_large_enum_budget = copy.deepcopy(contract.load_json(RESPONSE_SCHEMA))
    excessive_large_enum_budget["properties"]["selected_source_id"]["enum"] = [
        f"{index:03d}-" + ("x" * 56)
        for index in range(contract.MAX_PROVIDER_LARGE_ENUM_VALUES + 1)
    ]
    failures.append(expect_fail(
        "provider-large-enum-string-characters",
        lambda: contract.validate_provider_response_schema(excessive_large_enum_budget),
    ))

    for label, token, value in (
        ("nan", "NaN", math.nan),
        ("positive-infinity", "Infinity", math.inf),
        ("negative-infinity", "-Infinity", -math.inf),
    ):
        failures.append(expect_fail(
            f"strict-json-parse-{label}",
            lambda token=token: contract.load_json_bytes(
                f'{{"value":{token}}}'.encode("utf-8"),
                "non-finite regression",
            ),
        ))
        failures.append(expect_fail(
            f"strict-json-canonical-{label}",
            lambda value=value: contract.canonical_bytes({"value": value}),
        ))

    for label, token in (
        ("positive-overflow", "1e1000"),
        ("negative-overflow", "-1e1000"),
    ):
        failures.append(expect_fail(
            f"strict-json-parse-{label}",
            lambda token=token: contract.load_json_bytes(
                f'{{"value":{token}}}'.encode("utf-8"),
                "overflow regression",
            ),
        ))

    value = copy.deepcopy(base)
    value["output_contract"]["inline_schema"]["properties"]["source_ids"]["uniqueItems"] = True
    inline_raw = contract.canonical_bytes(value["output_contract"]["inline_schema"])
    value["output_contract"]["schema_sha256"] = contract.sha256(inline_raw)
    failures.append(expect_fail("capsule-provider-keyword", lambda: contract.validate_capsule(value)))

    value = copy.deepcopy(base)
    value["constraints"][0]["text"] = "Wait for activation before work."
    failures.append(expect_fail("subject-choreography", lambda: contract.render_prompt(value, "codex")))

    value = copy.deepcopy(base)
    value["admitted_context"][0]["text"] = "🙂" * 300
    raw = value["admitted_context"][0]["text"].encode("utf-8")
    value["admitted_context"][0]["utf8_bytes"] = len(raw)
    value["admitted_context"][0]["text_sha256"] = contract.sha256(raw)
    failures.append(expect_fail("multibyte-block-overflow", lambda: contract.validate_capsule(value)))

    output = {
        "type": "custom_tool_call_output",
        "output": [
            {"type": "input_text", "text": "Script completed\nWall time 0.0 seconds\nOutput:\n"},
            {"type": "input_text", "text": "{\"goal\":{\"threadId\":\"t1\",\"status\":\"active\"}}"},
        ],
    }
    assert verify.goal_from_output(output) == {"threadId": "t1", "status": "active"}
    injected_goal_output = copy.deepcopy(output)
    injected_goal_output["output"].append({
        "type": "input_text",
        "text": 'prefix {"goal":{"threadId":"fake","status":"active"}} suffix',
    })
    assert verify.goal_from_output(injected_goal_output) == {"threadId": "t1", "status": "active"}
    duplicate_goal_output = copy.deepcopy(output)
    duplicate_goal_output["output"].append({
        "type": "input_text",
        "text": '{"goal":{"threadId":"fake","status":"active"}}',
    })
    assert verify.goal_from_output(duplicate_goal_output) is None

    trace = [
        {"ordinal": 1, "type": "response_item", "payload": {"type": "function_call", "name": "create_goal", "call_id": "c1", "arguments": "{\"objective\":\"canary_authority_01\"}"}},
        {"ordinal": 2, "type": "response_item", "payload": {"type": "function_call_output", "call_id": "c1", "output": "{}"}},
        {"ordinal": 3, "type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "c2", "input": "const r=await tools.update_goal({status:\"complete\"});text(r)"}},
        {"ordinal": 4, "type": "response_item", "payload": {"type": "custom_tool_call_output", "call_id": "c2", "output": "{}"}},
    ]
    calls, outputs = verify.tool_projection(trace)
    assert [item["tool"] for item in calls] == ["create_goal", "update_goal"]
    assert set(outputs) == {"c1", "c2"}
    assert verify.validate_goal_call_counts(calls) is not None

    too_many_get_calls = [calls[0]] + [
        {"tool": "get_goal", "call_id": f"get-{index}", "ordinal": index + 2, "args": {}, "turn_id": "turn-1"}
        for index in range(verify.EXPECTED_ACCEPTANCE["goal_get_max_per_row"] + 1)
    ] + [calls[1]]
    failures.append(expect_fail("goal-tool-call-ceiling", lambda: verify.validate_goal_call_counts(too_many_get_calls)))

    safe_wrappers = [
        "const result = await tools.update_goal({status:\"complete\"}); text(result);",
        "let goal_result = await tools.get_goal({}); text(goal_result);",
        "text(await tools.get_goal({}))",
    ]
    assert [verify.parse_goal_wrapper(source)[0] for source in safe_wrappers] == ["update_goal", "get_goal", "get_goal"]

    submission_trace = [
        {"ordinal": 1, "type": "event_msg", "payload": {"type": "task_started", "turn_id": "turn-1"}},
        {"ordinal": 2, "type": "response_item", "payload": {"type": "message", "role": "user", "content": [{"type": "input_text", "text": "<recommended_plugins>injected</recommended_plugins>"}], "internal_chat_message_metadata_passthrough": {"turn_id": "turn-1"}}},
        {"ordinal": 3, "type": "event_msg", "payload": {"type": "item_completed", "thread_id": "thread-1", "turn_id": "turn-1", "item": {"type": "UserMessage", "id": "item-1", "content": [{"type": "text", "text": codex_prompt}]}}},
        {"ordinal": 4, "type": "response_item", "payload": {"type": "message", "role": "user", "content": [{"type": "input_text", "text": "<unexpected_internal_context>ignored</unexpected_internal_context>"}], "internal_chat_message_metadata_passthrough": {"turn_id": "turn-1"}}},
        {"ordinal": 5, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": "turn-1"}},
    ]
    submission_intervals = verify.task_intervals(submission_trace)
    external = verify.require_single_external_submission(submission_trace, codex_prompt, "thread-1", submission_intervals)
    assert external["item_id"] == "item-1"
    assert verify.require_submission_before_goal(external, {"ordinal": 4, "turn_id": "turn-1"}) is None

    late_external = copy.deepcopy(external)
    late_external["ordinal"] = 5
    failures.append(expect_fail(
        "external-submission-after-goal",
        lambda: verify.require_submission_before_goal(late_external, {"ordinal": 4, "turn_id": "turn-1"}),
    ))

    duplicate_submission = copy.deepcopy(submission_trace)
    duplicate_submission.insert(3, {
        "ordinal": 4,
        "type": "event_msg",
        "payload": {"type": "item_completed", "thread_id": "thread-1", "turn_id": "turn-1", "item": {"type": "UserMessage", "id": "item-2", "content": [{"type": "text", "text": codex_prompt}]}}},
    )
    duplicate_submission[-2]["ordinal"] = 5
    duplicate_submission[-1]["ordinal"] = 6
    failures.append(expect_fail(
        "duplicate-authoritative-user-submission",
        lambda: verify.require_single_external_submission(duplicate_submission, codex_prompt, "thread-1", verify.task_intervals(duplicate_submission)),
    ))

    two_turn_trace = [
        {"ordinal": 1, "type": "event_msg", "payload": {"type": "task_started", "turn_id": "turn-1"}},
        {"ordinal": 2, "type": "event_msg", "payload": {"type": "item_completed", "thread_id": "thread-1", "turn_id": "turn-1", "item": {"type": "UserMessage", "id": "item-initial", "content": [{"type": "text", "text": codex_prompt}]}}},
        {"ordinal": 3, "type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "goal-create", "input": "const r=await tools.create_goal({objective:\"canary_authority_01\"});text(r)", "internal_chat_message_metadata_passthrough": {"turn_id": "turn-1"}}},
        {"ordinal": 4, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": "turn-1"}},
        {"ordinal": 5, "type": "event_msg", "payload": {"type": "task_started", "turn_id": "turn-2"}},
        {"ordinal": 6, "type": "response_item", "payload": {"type": "message", "role": "user", "content": [{"type": "input_text", "text": "<codex_internal_context source=\"goal\">automatic continuation</codex_internal_context>"}], "internal_chat_message_metadata_passthrough": {"turn_id": "turn-2"}}},
        {"ordinal": 7, "type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "goal-complete", "input": "const r=await tools.update_goal({status:\"complete\"});text(r)", "internal_chat_message_metadata_passthrough": {"turn_id": "turn-2"}}},
        {"ordinal": 8, "type": "response_item", "payload": {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "{}"}], "internal_chat_message_metadata_passthrough": {"turn_id": "turn-2"}}},
        {"ordinal": 9, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": "turn-2"}},
    ]
    two_turn_intervals = verify.task_intervals(two_turn_trace)
    two_turn_external = verify.require_single_external_submission(two_turn_trace, codex_prompt, "thread-1", two_turn_intervals)
    assert two_turn_external["turn_id"] == "turn-1" and len(two_turn_intervals) == 2
    assert verify.require_submission_before_goal(two_turn_external, {"ordinal": 3, "turn_id": "turn-1"}) is None
    assert verify.require_inside(two_turn_intervals, "turn-2", 7, "automatic continuation update") is None
    selected_final = verify.select_semantic_final(
        [
            (3, "Goal active; continuing automatically.", "turn-1"),
            (8, '{"unit_id":"canary_evidence_02"}', "turn-2"),
        ],
        {"turn-1": (1, 4), "turn-2": (5, 9)},
    )
    assert selected_final[0] == 8 and selected_final[3] == {"unit_id": "canary_evidence_02"}
    failures.append(expect_fail(
        "multiple-semantic-json-finals",
        lambda: verify.select_semantic_final(
            [
                (3, '{"progress":true}', "turn-1"),
                (8, '{"unit_id":"canary_evidence_02"}', "turn-2"),
            ],
            {"turn-1": (1, 4), "turn-2": (5, 9)},
        ),
    ))

    context_route = {"model": "gpt-5.4-mini", "reasoning_effort": "medium"}
    context_temp = "/tmp/r10-context-selftest"
    context_rows = [
        {
            "ordinal": 2,
            "type": "turn_context",
            "payload": {
                "turn_id": "ctx-turn-1",
                "cwd": context_temp,
                "workspace_roots": [context_temp],
                "sandbox_policy": {"type": "read-only"},
                "approval_policy": "never",
                "permission_profile": copy.deepcopy(verify.EXPECTED_PERMISSION_PROFILE),
                "model": context_route["model"],
                "effort": context_route["reasoning_effort"],
            },
        },
        {
            "ordinal": 6,
            "type": "turn_context",
            "payload": {
                "turn_id": "ctx-turn-2",
                "cwd": context_temp,
                "workspace_roots": [context_temp],
                "sandbox_policy": {"type": "read-only"},
                "approval_policy": "never",
                "permission_profile": copy.deepcopy(verify.EXPECTED_PERMISSION_PROFILE),
                "model": context_route["model"],
                "effort": context_route["reasoning_effort"],
            },
        },
    ]
    context_intervals = {"ctx-turn-1": (1, 4), "ctx-turn-2": (5, 8)}
    assert verify.validate_turn_contexts(context_rows, context_intervals, context_route, context_temp) is None
    wrong_context_cwd = copy.deepcopy(context_rows)
    wrong_context_cwd[1]["payload"]["cwd"] = "/mnt/Cursor/PuppetMaster"
    failures.append(expect_fail(
        "turn-context-cwd-drift",
        lambda: verify.validate_turn_contexts(wrong_context_cwd, context_intervals, context_route, context_temp),
    ))
    wrong_context_network = copy.deepcopy(context_rows)
    wrong_context_network[1]["payload"]["permission_profile"]["network"] = "enabled"
    failures.append(expect_fail(
        "turn-context-network-drift",
        lambda: verify.validate_turn_contexts(wrong_context_network, context_intervals, context_route, context_temp),
    ))

    duplicate_continuation_submission = copy.deepcopy(two_turn_trace)
    for row in duplicate_continuation_submission:
        if row["ordinal"] >= 6:
            row["ordinal"] += 1
    duplicate_continuation_submission.append({
        "ordinal": 6,
        "type": "event_msg",
        "payload": {"type": "item_completed", "thread_id": "thread-1", "turn_id": "turn-2", "item": {"type": "UserMessage", "id": "item-duplicate", "content": [{"type": "text", "text": codex_prompt}]}},
    })
    duplicate_continuation_submission.sort(key=lambda row: row["ordinal"])
    failures.append(expect_fail(
        "duplicate-authoritative-submission-on-goal-continuation",
        lambda: verify.require_single_external_submission(
            duplicate_continuation_submission,
            codex_prompt,
            "thread-1",
            verify.task_intervals(duplicate_continuation_submission),
        ),
    ))

    process_error = verify.process_terminal_error(
        b'{"type":"error","message":"invalid_json_schema: uniqueItems is not permitted"}\n',
        {"returncode": 1, "timed_out": False},
    )
    assert "invalid_json_schema" in process_error and "returncode=1" in process_error

    stdout_fixture = b'{"type":"thread.started","thread_id":"thread-1"}\n{"type":"turn.completed"}\n'
    assert verify.stdout_thread_id(stdout_fixture) == "thread-1"
    failures.append(expect_fail(
        "duplicate-stdout-thread-identity",
        lambda: verify.stdout_thread_id(stdout_fixture + b'{"type":"thread.started","thread_id":"thread-2"}\n'),
    ))

    bad = copy.deepcopy(trace)
    bad[2]["payload"]["input"] = "const r=await tools.exec_command({cmd:\"pwd\"});text(r)"
    failures.append(expect_fail("non-goal-tool", lambda: verify.tool_projection(bad)))

    bad = copy.deepcopy(trace)
    bad[2]["payload"]["input"] = "const r=await tools.update_goal({status:\"complete\"});tools[\"exec_command\"]({cmd:\"pwd\"});text(r)"
    failures.append(expect_fail("computed-tool-bypass", lambda: verify.tool_projection(bad)))

    bad = copy.deepcopy(trace)
    bad[2]["payload"]["input"] = "const bad=tools.exec_command;const r=await tools.update_goal({status:\"complete\"});bad({cmd:\"pwd\"});text(r)"
    failures.append(expect_fail("aliased-tool-bypass", lambda: verify.tool_projection(bad)))

    bad = copy.deepcopy(trace)
    bad[2]["payload"]["input"] = "// tools.update_goal({status:\"complete\"})\nconst r=await tools[\"exec_command\"]({cmd:\"pwd\"});text(r)"
    failures.append(expect_fail("comment-token-bypass", lambda: verify.tool_projection(bad)))

    bad = copy.deepcopy(trace)
    bad.append(copy.deepcopy(trace[1]))
    failures.append(expect_fail("duplicate-tool-output", lambda: verify.tool_projection(bad)))

    manifest = contract.load_json(ROOT / "canary_002" / "manifest.json")
    assert runner.validate_static_manifest(manifest) is None
    failures.append(expect_fail(
        "alternate-manifest-launch-path",
        lambda: runner.preflight_manifest(ROOT / "r10_selftest.py", ROOT / "canary_002" / "manifest.commitment.json"),
    ))

    summary_manifest_sha = "c" * 64
    row_ids = [row["row_id"] for row in manifest["rows"]]
    partial_summary = {
        "schema_id": "pm.r10.run_capture_summary.v2",
        "run_id": manifest["run_id"],
        "manifest_sha256": summary_manifest_sha,
        "row_count": 3,
        "attempt_count": 1,
        "subject_launch_count": 1,
        "subject_launch_count_exact": True,
        "subject_launch_lower_bound": 1,
        "capture_count": 1,
        "prefix_pass_count": 0,
        "attempted_row_ids": row_ids[:1],
        "launched_row_ids": row_ids[:1],
        "launch_lower_bound_row_ids": row_ids[:1],
        "post_popen_failure_row_ids": [],
        "captured_row_ids": row_ids[:1],
        "prefix_passed_row_ids": [],
        "unconsumed_row_ids": row_ids[1:],
        "unconsumed_dispositions": [{"row_id": row_id, "status": "NOT_LAUNCHED_AFTER_CANARY_FAILURE"} for row_id in row_ids[1:]],
        "prefix_gate_sha256_by_row": {},
        "stop_reason": "semantic prefix failure",
        "status": "FAIL_CONSUMED_PREFIX_ZERO_CREDIT_NO_RETRY",
        "qualification_credit": 0,
        "qualification_streak": 0,
    }
    assert verify.validate_capture_summary(partial_summary, manifest, summary_manifest_sha) is None

    bad_summary = copy.deepcopy(partial_summary)
    bad_summary["manifest_sha256"] = "d" * 64
    failures.append(expect_fail("summary-manifest-join", lambda: verify.validate_capture_summary(bad_summary, manifest, summary_manifest_sha)))

    bad_summary = copy.deepcopy(partial_summary)
    bad_summary["launched_row_ids"] = [row_ids[1]]
    failures.append(expect_fail("summary-row-prefix", lambda: verify.validate_capture_summary(bad_summary, manifest, summary_manifest_sha)))

    missing_launch_attribution = copy.deepcopy(partial_summary)
    missing_launch_attribution.update({
        "attempt_count": 3,
        "subject_launch_count": 0,
        "subject_launch_count_exact": False,
        "subject_launch_lower_bound": 3,
        "capture_count": 0,
        "attempted_row_ids": row_ids,
        "launched_row_ids": [],
        "launch_lower_bound_row_ids": row_ids,
        "post_popen_failure_row_ids": [row_ids[2]],
        "captured_row_ids": [],
        "unconsumed_row_ids": [],
        "unconsumed_dispositions": [],
        "status": "FAIL_CONTROLLER_AFTER_LAUNCH_ZERO_CREDIT_NO_RETRY",
    })
    failures.append(expect_fail(
        "summary-launch-lower-bound-missing-attribution",
        lambda: verify.validate_capture_summary(missing_launch_attribution, manifest, summary_manifest_sha),
    ))

    overlap_summary = copy.deepcopy(partial_summary)
    overlap_summary["post_popen_failure_row_ids"] = [row_ids[0]]
    overlap_summary["status"] = "FAIL_CONTROLLER_AFTER_LAUNCH_ZERO_CREDIT_NO_RETRY"
    assert verify.validate_capture_summary(overlap_summary, manifest, summary_manifest_sha) is None
    wrong_overlap_exactness = copy.deepcopy(overlap_summary)
    wrong_overlap_exactness["subject_launch_count_exact"] = False
    failures.append(expect_fail(
        "summary-launch-exactness-derived-from-overlap",
        lambda: verify.validate_capture_summary(wrong_overlap_exactness, manifest, summary_manifest_sha),
    ))

    with tempfile.TemporaryDirectory(prefix="r10-summary-evidence-selftest-") as temp_name:
        evidence_root = Path(temp_name)
        alpha = manifest["rows"][0]
        alpha_root = evidence_root / "rows" / alpha["row_id"]
        alpha_root.mkdir(parents=True)
        attempt_record = {
            "schema_id": "pm.r10.attempt.v1",
            "run_id": manifest["run_id"],
            "row_id": alpha["row_id"],
            "route_id": alpha["route_id"],
            "attempt": 0,
            "manifest_sha256": summary_manifest_sha,
            "qualification_credit": 0,
        }
        launch_record = {
            "schema_id": "pm.r10.launch_receipt.v1",
            "run_id": manifest["run_id"],
            "row_id": alpha["row_id"],
            "route_id": alpha["route_id"],
            "attempt": 0,
            "manifest_sha256": summary_manifest_sha,
            "codex_binary": manifest["codex_binary"],
            "pid": 424242,
            "status": "POPEN_RETURNED_LAUNCH_OBSERVED",
            "qualification_credit": 0,
        }
        (alpha_root / "attempt.json").write_bytes(contract.canonical_bytes(attempt_record) + b"\n")
        (alpha_root / "launch_receipt.json").write_bytes(contract.canonical_bytes(launch_record) + b"\n")
        zero_claim = copy.deepcopy(partial_summary)
        zero_claim.update({
            "attempt_count": 0,
            "subject_launch_count": 0,
            "subject_launch_count_exact": True,
            "subject_launch_lower_bound": 0,
            "capture_count": 0,
            "prefix_pass_count": 0,
            "attempted_row_ids": [],
            "launched_row_ids": [],
            "launch_lower_bound_row_ids": [],
            "post_popen_failure_row_ids": [],
            "captured_row_ids": [],
            "prefix_passed_row_ids": [],
            "unconsumed_row_ids": row_ids,
            "unconsumed_dispositions": [
                {"row_id": row_id, "status": "NOT_LAUNCHED_AFTER_CANARY_FAILURE"}
                for row_id in row_ids
            ],
            "prefix_gate_sha256_by_row": {},
            "status": "FAIL_PRELAUNCH_ZERO_SUBJECT",
        })
        failures.append(expect_fail(
            "summary-zero-subject-claim-conflicts-with-launch-evidence",
            lambda: verify.validate_capture_summary(
                zero_claim,
                manifest,
                summary_manifest_sha,
                evidence=evidence_root,
            ),
        ))

    rendered_metrics = contract.render_prompt(base, "codex")[1]
    assert verify.require_manifest_prompt_metrics(manifest["rows"][0], rendered_metrics) is None
    wrong_prompt_bytes = copy.deepcopy(manifest["rows"][0])
    wrong_prompt_bytes["submitted_user_prompt_utf8_bytes"] += 1
    failures.append(expect_fail(
        "manifest-prompt-byte-join",
        lambda: verify.require_manifest_prompt_metrics(wrong_prompt_bytes, rendered_metrics),
    ))

    blob = b"bounded-evidence"
    blob_identity = {"sha256": contract.sha256(blob), "bytes": len(blob)}
    assert verify.require_blob_identity(blob, blob_identity, "sha256", "bytes", "test blob") is None
    wrong_blob_bytes = dict(blob_identity)
    wrong_blob_bytes["bytes"] += 1
    failures.append(expect_fail(
        "recorded-blob-byte-count",
        lambda: verify.require_blob_identity(blob, wrong_blob_bytes, "sha256", "bytes", "test blob"),
    ))

    predecessor = manifest["rows"][0]
    gate_sha = "a" * 64
    good_gate = {
        "passed": True,
        "gate_sha256": gate_sha,
        "gate": {
            "status": "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT",
            "through_row_id": predecessor["row_id"],
            "through_route_id": predecessor["route_id"],
        },
        "authorization": {
            "kind": "prefix_gate",
            "path": f"gates/prefix-{predecessor['row_id']}.json",
            "sha256": gate_sha,
            "predecessor_row_id": predecessor["row_id"],
        },
    }
    assert runner.next_launch_authorization(good_gate, predecessor) == good_gate["authorization"]

    launched: list[str] = []

    def fake_row(_bundle, row, _evidence, _snapshot, _authorization):
        launched.append(row["row_id"])
        return {"row_id": row["row_id"]}

    def semantic_failure(_bundle, row, _evidence, _snapshot):
        return {"passed": False, "error": f"semantic mismatch: {row['row_id']}"}

    sequence = runner.execute_fail_stopped_rows(
        {"manifest": manifest},
        ROOT,
        ROOT,
        {},
        row_runner=fake_row,
        prefix_runner=semantic_failure,
    )
    assert launched == ["row-alpha-001"]
    assert sequence["prefix_gate_sha256_by_row"] == {}
    assert sequence["stop_reason"] == "prefix gate failed for row-alpha-001: semantic mismatch: row-alpha-001"

    alpha_failure = verify.PrefixRowFailure("row-alpha-001", [], verify.VerifyError("semantic mismatch"))
    disposition = verify.prefix_failure_disposition(manifest["rows"], "row-charlie-001", alpha_failure)
    assert disposition == {
        "prefix_index": 2,
        "failed_row_id": "row-alpha-001",
        "verified_row_ids": [],
        "not_evaluated_row_ids": ["row-bravo-001", "row-charlie-001"],
        "failed_stage": "row_verification",
    }

    class CleanupFailureProcess:
        pid = 424242

        def communicate(self, **_kwargs):
            raise RuntimeError("communicate cleanup failed")

    original_terminate = runner.terminate
    runner.terminate = lambda _process: (_ for _ in ()).throw(RuntimeError("terminate cleanup failed"))
    try:
        failures.append(expect_fail(
            "post-popen-cleanup-preserves-launch-lower-bound",
            lambda: runner.raise_post_popen_failure(
                CleanupFailureProcess(),
                "row-alpha-001",
                RuntimeError("launch receipt write failed"),
            ),
        ))
    finally:
        runner.terminate = original_terminate

    with tempfile.TemporaryDirectory(prefix="r10-post-popen-ledger-selftest-") as temp_name:
        evidence_root = Path(temp_name)

        def fake_post_popen_row(bundle, row, evidence, _snapshot, _authorization):
            row_root = evidence / "rows" / row["row_id"]
            row_root.mkdir(parents=True)
            attempt = {
                "schema_id": "pm.r10.attempt.v1",
                "run_id": bundle["manifest"]["run_id"],
                "row_id": row["row_id"],
                "route_id": row["route_id"],
                "attempt": 0,
                "manifest_sha256": bundle["manifest_sha256"],
                "qualification_credit": 0,
            }
            (row_root / "attempt.json").write_bytes(contract.canonical_bytes(attempt) + b"\n")
            raise runner.PostPopenRunnerError(row["row_id"], 515151, RuntimeError("receipt write failed"))

        post_popen_bundle = {"manifest": manifest, "manifest_sha256": "f" * 64}
        post_popen_sequence = runner.execute_fail_stopped_rows(
            post_popen_bundle,
            evidence_root,
            evidence_root,
            {},
            row_runner=fake_post_popen_row,
            prefix_runner=semantic_failure,
        )
        assert post_popen_sequence["post_popen_failure_row_ids"] == ["row-alpha-001"]
        post_popen_failure = contract.load_json(evidence_root / "rows" / "row-alpha-001" / "runner_failure.json")
        assert post_popen_failure["popen_observed"] is True and post_popen_failure["pid"] == 515151

    python_identity = runner.require_live_binary_identity(
        Path("/usr/bin/python3.13"),
        {
            "path": str(Path("/usr/bin/python3.13").resolve()),
            "bytes": len(Path("/usr/bin/python3.13").resolve().read_bytes()),
            "sha256": contract.sha256(Path("/usr/bin/python3.13").resolve().read_bytes()),
        },
    )
    drifted_python_identity = dict(python_identity)
    drifted_python_identity["sha256"] = "0" * 64
    failures.append(expect_fail(
        "immediate-pre-popen-binary-drift",
        lambda: runner.require_live_binary_identity(Path("/usr/bin/python3.13"), drifted_python_identity),
    ))

    bad_gate = copy.deepcopy(good_gate)
    bad_gate["passed"] = False
    failures.append(expect_fail("failed-prefix-blocks-next-launch", lambda: runner.next_launch_authorization(bad_gate, predecessor)))

    bad_gate = copy.deepcopy(good_gate)
    bad_gate["gate"]["through_row_id"] = "row-bravo-001"
    failures.append(expect_fail("wrong-row-prefix-blocks-next-launch", lambda: runner.next_launch_authorization(bad_gate, predecessor)))

    bad_gate = copy.deepcopy(good_gate)
    bad_gate["authorization"]["sha256"] = "b" * 64
    failures.append(expect_fail("wrong-hash-prefix-blocks-next-launch", lambda: runner.next_launch_authorization(bad_gate, predecessor)))

    with tempfile.TemporaryDirectory(prefix="r10-prefix-auth-selftest-") as temp_name:
        run_root = Path(temp_name)
        row_root = run_root / "rows" / predecessor["row_id"]
        row_root.mkdir(parents=True)
        (run_root / "gates").mkdir()
        for name in (
            "attempt.json",
            "launch_receipt.json",
            "process_capture.json",
            "submitted_user_prompt.txt",
            "stdout.jsonl",
            "stderr.bin",
            "rollout.jsonl.gz",
            "last_message.txt",
        ):
            (row_root / name).write_bytes(f"fixture:{name}".encode("utf-8"))
        disk_bundle = {"manifest": manifest, "manifest_sha256": "e" * 64}
        frozen = {item["path"]: item for item in manifest["frozen_files"]}
        disk_gate = {
            "schema_id": "pm.r10.prefix_gate.v1",
            "run_id": manifest["run_id"],
            "manifest_sha256": disk_bundle["manifest_sha256"],
            "through_row_id": predecessor["row_id"],
            "through_route_id": predecessor["route_id"],
            "prefix_index": 0,
            "predecessor_gate_sha256": None,
            "verified_row_ids": [predecessor["row_id"]],
            "pass_count": 1,
            "row_receipts": [{"row_id": predecessor["row_id"], "status": "PASS", "qualification_credit": 0}],
            "row_evidence": runner.runner_row_evidence_identities(run_root, [predecessor["row_id"]]),
            "executing_verifier_sha256": frozen["r10_verify.py"]["sha256"],
            "executing_contract_sha256": frozen["r10_contract.py"]["sha256"],
            "status": "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT",
            "qualification_credit": 0,
            "qualification_streak": 0,
        }
        disk_gate_raw = contract.canonical_bytes(disk_gate) + b"\n"
        disk_gate_path = run_root / "gates" / f"prefix-{predecessor['row_id']}.json"
        disk_gate_path.write_bytes(disk_gate_raw)
        disk_stdout_path = run_root / "gates" / f"prefix-{predecessor['row_id']}.stdout.jsonl"
        disk_stdout_path.write_bytes(disk_gate_raw)
        disk_stderr_path = run_root / "gates" / f"prefix-{predecessor['row_id']}.stderr.bin"
        disk_stderr_path.write_bytes(b"")
        disk_argv = [
            manifest["controller_runtime"]["python_executable"],
            "-B",
            str(run_root / "frozen_snapshot" / "r10_verify.py"),
            "--evidence-root",
            str(run_root),
            "--prefix-row",
            predecessor["row_id"],
            "--write-prefix-receipt",
        ]
        disk_process = {
            "schema_id": "pm.r10.prefix_gate_process.v1",
            "run_id": manifest["run_id"],
            "manifest_sha256": disk_bundle["manifest_sha256"],
            "row_id": predecessor["row_id"],
            "route_id": predecessor["route_id"],
            "argv": disk_argv,
            "returncode": 0,
            "stdout_sha256": contract.sha256(disk_gate_raw),
            "stdout_bytes": len(disk_gate_raw),
            "stderr_sha256": contract.sha256(b""),
            "stderr_bytes": 0,
            "gate_sha256": contract.sha256(disk_gate_raw),
            "validation_error": None,
            "status": "PASS",
            "qualification_credit": 0,
        }
        (run_root / "gates" / f"prefix-{predecessor['row_id']}.process.json").write_bytes(
            contract.canonical_bytes(disk_process) + b"\n"
        )
        disk_authorization = {
            "kind": "prefix_gate",
            "path": f"gates/prefix-{predecessor['row_id']}.json",
            "sha256": contract.sha256(disk_gate_raw),
            "predecessor_row_id": predecessor["row_id"],
        }
        assert runner.validate_launch_authorization(
            disk_bundle,
            run_root,
            manifest["rows"][1],
            disk_authorization,
        ) is None
        (row_root / "stdout.jsonl").write_bytes(b"tampered-after-gate")
        failures.append(expect_fail(
            "disk-prefix-evidence-tamper-blocks-next-launch",
            lambda: runner.validate_launch_authorization(
                disk_bundle,
                run_root,
                manifest["rows"][1],
                disk_authorization,
            ),
        ))

    weakened = copy.deepcopy(manifest)
    weakened["rows"] = []
    failures.append(expect_fail("empty-manifest", lambda: runner.validate_static_manifest(weakened)))

    weakened = copy.deepcopy(manifest)
    weakened["acceptance"]["required_pass"] = 0
    failures.append(expect_fail("weakened-acceptance", lambda: runner.validate_static_manifest(weakened)))

    weakened = copy.deepcopy(manifest)
    weakened["rows"] = weakened["rows"][:1]
    failures.append(expect_fail("single-route-manifest", lambda: runner.validate_static_manifest(weakened)))

    lifecycle = [
        {"ordinal": 1, "type": "event_msg", "payload": {"type": "task_started", "turn_id": "t1"}},
        {"ordinal": 9, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": "t1"}},
    ]
    assert verify.task_intervals(lifecycle) == {"t1": (1, 9)}

    overlapping = [
        {"ordinal": 1, "type": "event_msg", "payload": {"type": "task_started", "turn_id": "t1"}},
        {"ordinal": 2, "type": "event_msg", "payload": {"type": "task_started", "turn_id": "t2"}},
        {"ordinal": 3, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": "t1"}},
        {"ordinal": 4, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": "t2"}},
    ]
    failures.append(expect_fail("overlapping-task-intervals", lambda: verify.task_intervals(overlapping)))

    duplicate_ordinals = b'{"ordinal":1,"type":"event_msg","payload":{}}\n{"ordinal":1,"type":"event_msg","payload":{}}\n'
    failures.append(expect_fail("duplicate-rollout-ordinals", lambda: verify.parse_trace(duplicate_ordinals)))

    result = {
        "schema_id": "pm.r10.selftest.v1",
        "checks": 91,
        "expected_failures": failures,
        "status": "PASS",
        "subject_calls": 0,
        "qualification_credit": 0,
    }
    sys.stdout.buffer.write(contract.canonical_bytes(result) + b"\n")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, contract.ContractError, verify.VerifyError, jsonschema.ValidationError) as exc:
        sys.stdout.buffer.write(contract.canonical_bytes({"schema_id": "pm.r10.selftest.v1", "status": "FAIL", "error": str(exc), "subject_calls": 0, "qualification_credit": 0}) + b"\n")
        raise SystemExit(1)
