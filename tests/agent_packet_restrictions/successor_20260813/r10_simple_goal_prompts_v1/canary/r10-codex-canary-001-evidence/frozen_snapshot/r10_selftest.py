#!/usr/bin/env python3
"""Zero-subject deterministic regression tests for the R10 contract/parser."""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

import jsonschema

import r10_contract as contract
import r10_runner as runner
import r10_verify as verify

ROOT = Path(__file__).resolve().parent
CAPSULE = ROOT / "canary" / "capsule.json"


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
        "output": [{"type": "input_text", "text": "Output:\n{\"goal\":{\"threadId\":\"t1\",\"status\":\"active\"}}"}],
    }
    assert verify.goal_from_output(output) == {"threadId": "t1", "status": "active"}

    trace = [
        {"ordinal": 1, "type": "response_item", "payload": {"type": "function_call", "name": "create_goal", "call_id": "c1", "arguments": "{\"objective\":\"canary_authority_01\"}"}},
        {"ordinal": 2, "type": "response_item", "payload": {"type": "function_call_output", "call_id": "c1", "output": "{}"}},
        {"ordinal": 3, "type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "c2", "input": "const r=await tools.update_goal({status:\"complete\"});text(r)"}},
        {"ordinal": 4, "type": "response_item", "payload": {"type": "custom_tool_call_output", "call_id": "c2", "output": "{}"}},
    ]
    calls, outputs = verify.tool_projection(trace)
    assert [item["tool"] for item in calls] == ["create_goal", "update_goal"]
    assert set(outputs) == {"c1", "c2"}

    safe_wrappers = [
        "const result = await tools.update_goal({status:\"complete\"}); text(result);",
        "let goal_result = await tools.get_goal({}); text(goal_result);",
        "text(await tools.get_goal({}))",
    ]
    assert [verify.parse_goal_wrapper(source)[0] for source in safe_wrappers] == ["update_goal", "get_goal", "get_goal"]

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

    manifest = contract.load_json(ROOT / "canary" / "manifest.json")
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
        "checks": 25,
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
    except (AssertionError, contract.ContractError, verify.VerifyError, jsonschema.ValidationError, json.JSONDecodeError) as exc:
        sys.stdout.buffer.write(contract.canonical_bytes({"schema_id": "pm.r10.selftest.v1", "status": "FAIL", "error": str(exc), "subject_calls": 0, "qualification_credit": 0}) + b"\n")
        raise SystemExit(1)
