#!/usr/bin/env python3
"""Independent frozen-rollout and mutation check for the V20 Goal harness."""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any, Callable


sys.dont_write_bytecode = True
BASE = Path(__file__).resolve().parent
V20 = BASE / "goal_mode_empirical_harness_v20"
V19_EVIDENCE = BASE / "goal_mode_v19_three_turn_canary_001_evidence"
V19_INPUTS = BASE / "goal_mode_v19_three_turn_canary_001_inputs"
V17_INPUTS = BASE / "goal_mode_v17_three_turn_canary_001_inputs"
CODEX_HOME = Path("/home/sittingmongoose/.codex")
EXPECTED = {
    "goal_mode_contract.json": (2850, "58f3152f6ddc4915058dbfe25d455fb903ea770a3c6e46b6e7c8aaa376380ead"),
    "goal_mode_harness.py": (16368, "63658633c918df0fb4490f500a099fa3faf7eb8c3bb1fe731a77c85f77bcc49e"),
    "goal_mode_three_turn_attestor.py": (9643, "a42fd3f3eaae7774e25a77f84c8bf0215f6fef01f055543a19c357b64b9e962c"),
}
ACTION_TYPES = {"custom_tool_call", "function_call", "image_generation_call", "local_shell_call", "tool_search_call", "web_search_call"}
QUERY = "goal tools direct exposed get_goal create_goal update_goal"


class CheckFailure(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise CheckFailure(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in items:
        require(key not in value, f"duplicate key:{key}")
        value[key] = item
    return value


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load_json(path: Path) -> dict[str, Any]:
    raw = read_regular(path, 16_000_000)
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(CheckFailure(f"nonfinite:{item}")))
    require(isinstance(value, dict), f"JSON object:{path}")
    require(raw == json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n", f"canonical JSON:{path}")
    return value


def records(path: Path) -> tuple[list[dict[str, Any]], bytes]:
    raw = read_regular(path)
    require(raw.endswith(b"\n") and b"\r" not in raw, "rollout framing")
    out: list[dict[str, Any]] = []
    for line_no, line in enumerate(raw.splitlines(), 1):
        require(line, f"empty rollout line:{line_no}")
        value = json.loads(line, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(CheckFailure(f"nonfinite:{item}")))
        require(isinstance(value, dict), f"rollout object:{line_no}")
        out.append({"line": line_no, "record": value})
    return out, raw


def payload(entry: dict[str, Any]) -> dict[str, Any]:
    value = entry["record"].get("payload")
    return value if isinstance(value, dict) else {}


def turn_id(entry: dict[str, Any]) -> str | None:
    value = payload(entry).get("internal_chat_message_metadata_passthrough")
    return value.get("turn_id") if isinstance(value, dict) and isinstance(value.get("turn_id"), str) else None


def message_text(entry: dict[str, Any], role: str) -> str | None:
    item = payload(entry)
    if item.get("type") != "message" or item.get("role") != role:
        return None
    content = item.get("content")
    if not isinstance(content, list) or len(content) != 1 or not isinstance(content[0], dict) or content[0].get("type") not in {"input_text", "output_text"}:
        return None
    text = content[0].get("text")
    return text if isinstance(text, str) else None


def output_object(item: dict[str, Any]) -> dict[str, Any]:
    raw = item.get("output")
    require(isinstance(raw, str), "function output text")
    value = json.loads(raw, object_pairs_hook=pairs)
    require(isinstance(value, dict), "function output object")
    return value


def independent_v19_oracle(items: list[dict[str, Any]], prompt: str, objective: str) -> dict[str, Any]:
    prompt_entries = [entry for entry in items if message_text(entry, "user") == prompt]
    require(len(prompt_entries) == 1, "bootstrap prompt cardinality")
    prompt_entry = prompt_entries[0]
    active_turn = turn_id(prompt_entry)
    require(isinstance(active_turn, str), "bootstrap turn id")
    actions = [entry for entry in items if entry["line"] > prompt_entry["line"] and payload(entry).get("type") in ACTION_TYPES and turn_id(entry) == active_turn]
    require([payload(entry).get("type") for entry in actions] == ["tool_search_call", "function_call", "function_call", "function_call"], "independent action sequence")
    search = payload(actions[0])
    require(search.get("arguments") == {"limit": 5, "query": QUERY} and search.get("execution") == "client" and search.get("status") == "completed", "independent search call")
    search_outputs = [entry for entry in items if payload(entry).get("type") == "tool_search_output" and payload(entry).get("call_id") == search.get("call_id")]
    require(len(search_outputs) == 1 and actions[0]["line"] < search_outputs[0]["line"] < actions[1]["line"], "independent search output")
    found = payload(search_outputs[0]).get("tools")
    require(isinstance(found, list) and len(found) <= 5, "independent search tools")
    names = [tool.get("name") for tool in found if isinstance(tool, dict)]
    require(len(names) == len(found) and all(isinstance(name, str) and name for name in names) and len(names) == len(set(names)), "independent search identities")
    calls = [payload(entry) for entry in actions[1:]]
    require([call.get("name") for call in calls] == ["get_goal", "create_goal", "get_goal"], "independent Goal calls")
    require(json.loads(calls[0]["arguments"]) == {} and json.loads(calls[1]["arguments"]) == {"objective": objective} and json.loads(calls[2]["arguments"]) == {}, "independent Goal arguments")
    outputs: list[dict[str, Any]] = []
    for action in actions[1:]:
        call = payload(action)
        matches = [entry for entry in items if payload(entry).get("type") == "function_call_output" and payload(entry).get("call_id") == call.get("call_id")]
        require(len(matches) == 1 and matches[0]["line"] > action["line"], "independent Goal output")
        outputs.append(output_object(payload(matches[0])))
    require(outputs[0].get("goal") is None, "independent initial Goal absence")
    created = outputs[1].get("goal")
    reopened = outputs[2].get("goal")
    require(isinstance(created, dict) and created == reopened and created.get("objective") == objective and created.get("status") == "active", "independent active Goal identity")
    require(not any(call.get("name") in names for call in calls), "returned tool invoked")
    return {"action_types": [payload(entry)["type"] for entry in actions], "goal_status": created["status"], "returned_namespace_names": names, "turn_id": active_turn}


def import_candidate() -> tuple[Any, Any]:
    sys.path.insert(0, str(V20))
    import goal_mode_three_turn_attestor as ga
    spec = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v20_for_independent_check", V20 / "goal_mode_harness.py")
    require(spec is not None and spec.loader is not None, "harness import spec")
    harness = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = harness
    spec.loader.exec_module(harness)
    return ga, harness


def expect_reject(ga: Any, label: str, source: list[dict[str, Any]], prompt_line: int, objective: str, mutate: Callable[[list[dict[str, Any]]], None]) -> None:
    fixture = copy.deepcopy(source)
    mutate(fixture)
    try:
        ga._goal_calls(fixture, prompt_line, ["get_goal", "create_goal", "get_goal"], objective)
    except ga.Invalid:
        return
    raise CheckFailure(f"mutation accepted:{label}")


def main(argv: list[str]) -> int:
    require(argv == ["--check"], "CLI must be --check")
    before = {path.name: (len(read_regular(path)), hashlib.sha256(read_regular(path)).hexdigest(), stat.S_IMODE(os.lstat(path).st_mode)) for path in sorted(V20.iterdir()) if path.is_file()}
    require(set(EXPECTED).issubset(before), "candidate files")
    for name, (size, digest) in EXPECTED.items():
        require(before[name] == (size, digest, 0o644), f"candidate identity:{name}")
    ga, harness = import_candidate()
    require(ga.runtime_api_contract()["missing"] == [], "candidate runtime API")
    rollout = next((CODEX_HOME / "sessions/2026/08/22").glob("*01a029e0*.jsonl"))
    items, raw_rollout = records(rollout)
    prompt_raw = read_regular(V19_EVIDENCE / "rows/row-000/bootstrap_prompt.txt", 4_000_000)
    prompt = prompt_raw.decode()
    row = load_json(V19_INPUTS / "row-000.row.json")
    subject = read_regular(V19_INPUTS / "row-000.subject.txt", 2_000_000)
    require(subject not in prompt_raw and subject[: min(32, len(subject))] not in prompt_raw, "frozen V19 subject absent")
    oracle = independent_v19_oracle(items, prompt, row["objective"])
    prompt_line = next(entry["line"] for entry in items if message_text(entry, "user") == prompt)
    calls, parsed_turn = ga._goal_calls(items, prompt_line, ["get_goal", "create_goal", "get_goal"], row["objective"])
    require(parsed_turn == oracle["turn_id"] and calls[0]["representation"] == ga.GOAL_SEARCH_PREFIX + ga.DIRECT_NATIVE, "candidate frozen positive")
    no_search = [entry for entry in copy.deepcopy(items) if payload(entry).get("type") not in {"tool_search_call", "tool_search_output"}]
    calls_without, _ = ga._goal_calls(no_search, prompt_line, ["get_goal", "create_goal", "get_goal"], row["objective"])
    require(calls_without[0]["representation"] == ga.DIRECT_NATIVE, "zero-search positive")
    mutations: list[tuple[str, Callable[[list[dict[str, Any]]], None]]] = []
    mutations.append(("wrong_query", lambda values: payload(next(entry for entry in values if payload(entry).get("type") == "tool_search_call"))["arguments"].__setitem__("query", "all tools")))
    mutations.append(("wrong_limit", lambda values: payload(next(entry for entry in values if payload(entry).get("type") == "tool_search_call"))["arguments"].__setitem__("limit", 10)))
    mutations.append(("missing_search_output", lambda values: values.__setitem__(slice(None), [entry for entry in values if payload(entry).get("type") != "tool_search_output"])))
    mutations.append(("search_after_goal", lambda values: next(entry for entry in values if payload(entry).get("type") == "tool_search_call").__setitem__("line", 18)))
    def duplicate_search(values: list[dict[str, Any]]) -> None:
        source = next(entry for entry in values if payload(entry).get("type") == "tool_search_call")
        clone = copy.deepcopy(source)
        clone["line"] = 13
        clone["record"]["payload"]["call_id"] = "duplicate-search"
        values.insert(values.index(source) + 2, clone)
    mutations.append(("duplicate_search", duplicate_search))
    def returned_tool_call(values: list[dict[str, Any]]) -> None:
        source = next(entry for entry in values if payload(entry).get("type") == "function_call")
        clone = copy.deepcopy(source)
        clone["line"] = 14
        clone["record"]["payload"].update({"arguments": "{}", "call_id": "returned-tool-call", "name": "mcp__codex_apps__sites"})
        values.insert(values.index(source), clone)
    mutations.append(("returned_tool_invoked", returned_tool_call))
    mutations.append(("search_not_completed", lambda values: payload(next(entry for entry in values if payload(entry).get("type") == "tool_search_call")).__setitem__("status", "in_progress")))
    for label, mutate in mutations:
        expect_reject(ga, label, items, prompt_line, row["objective"], mutate)
    generated = harness._bootstrap_prompt(row)
    require(generated.count(ga.GOAL_SEARCH_QUERY.encode()) == 1 and subject not in generated and subject[: min(32, len(subject))] not in generated, "V20 prompt subject boundary")
    contract = load_json(V20 / "goal_mode_contract.json")
    require(contract["architecture"]["activation_control"]["search_query"] == QUERY and contract["authority"]["canary_launch"] is False, "V20 contract")
    after = {path.name: (len(read_regular(path)), hashlib.sha256(read_regular(path)).hexdigest(), stat.S_IMODE(os.lstat(path).st_mode)) for path in sorted(V20.iterdir()) if path.is_file()}
    require(before == after and not (V20 / "__pycache__").exists(), "workspace mutation")
    result = {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "candidate_identities": {name: {"bytes": value[0], "mode": f"{value[2]:04o}", "sha256": value[1]} for name, value in before.items()},
        "first_mismatch": None,
        "mutation_count": len(mutations),
        "positive_fixtures": ["FROZEN_V19_EXACT_TOOL_SEARCH_THEN_DIRECT_GOAL", "ZERO_TOOL_SEARCH_THEN_DIRECT_GOAL"],
        "rollout": {"bytes": len(raw_rollout), "sha256": hashlib.sha256(raw_rollout).hexdigest()},
        "schema_id": "pw-r9-goal-mode-v20-harness-independent-check-v1",
        "status": "PASS_INDEPENDENT_V20_PHASE_OWNED_ACTIVATION_CONTROL_FROZEN_ROLLOUT_AND_MUTATIONS_ZERO_CREDIT_NO_LAUNCH",
        "workspace_writes": 0,
    }
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except (CheckFailure, OSError, UnicodeError, json.JSONDecodeError) as exc:
        sys.stdout.buffer.write(json.dumps({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-v20-harness-independent-check-v1", "status": "FAIL", "workspace_writes": 0}, sort_keys=True, separators=(",", ":")).encode() + b"\n")
        raise SystemExit(1)
