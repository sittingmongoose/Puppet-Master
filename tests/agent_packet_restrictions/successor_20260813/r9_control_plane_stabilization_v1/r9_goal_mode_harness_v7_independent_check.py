#!/usr/bin/env python3
"""Independent read-only checker for the closed Goal/CLI message-phase harness."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
V7 = BASE / "goal_mode_empirical_harness_v7"
EVIDENCE = BASE / "goal_mode_v6_route_canary_001_evidence"
FILES = (
    ("goal_mode_empirical_harness_v7/goal_mode_contract.json", V7 / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v7/goal_mode_harness.py", V7 / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v7/goal_mode_single_process_attestor.py", V7 / "goal_mode_single_process_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
)
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def loads(raw: bytes, label: str) -> Any:
    try:
        return json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"{label} JSON:{exc}") from exc


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==before.st_size, f"changing file:{path}")
    return raw


def load_canonical(path: Path) -> Any:
    raw = read_regular(path)
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    value = loads(raw, str(path))
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(label: str, path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":hashlib.sha256(raw).hexdigest()}


def rollout(path: Path) -> list[dict[str, Any]]:
    raw = read_regular(path, 64_000_000)
    require(raw.endswith(b"\n") and b"\r" not in raw, "rollout framing")
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(raw.splitlines(), 1):
        require(line, f"empty rollout line:{line_no}")
        value = loads(line, f"rollout:{line_no}")
        require(isinstance(value, dict), f"rollout object:{line_no}")
        rows.append({"line":line_no,"record":value})
    return rows


def payload(entry: dict[str, Any]) -> dict[str, Any]:
    value = entry["record"].get("payload")
    return value if isinstance(value, dict) else {}


def assistant_projection(rows: list[dict[str, Any]], expected: str) -> tuple[str, list[dict[str, str]]]:
    current: str | None = None
    projected: list[dict[str, str]] = []
    turn_ids: set[str] = set()
    for entry in rows:
        record = entry["record"]
        if record.get("type") == "turn_context":
            candidate = record.get("turn_id")
            if candidate is None and isinstance(record.get("payload"), dict):
                candidate = record["payload"].get("turn_id")
            require(isinstance(candidate, str) and candidate, "turn_context")
            current = candidate
        item = payload(entry)
        if item.get("type") != "message" or item.get("role") != "assistant":
            continue
        text = "".join(part.get("text", "") for part in item.get("content", []) if isinstance(part, dict) and part.get("type") in {"input_text","output_text"})
        require(isinstance(current, str), "assistant message without turn")
        turn_ids.add(current)
        projected.append({"phase":item.get("phase"),"text":text})
    require(len(turn_ids) == 1, "assistant message turn cardinality")
    require(projected and projected[-1] == {"phase":"final_answer","text":expected}, "terminal final projection")
    require(all(item["phase"] == "commentary" for item in projected[:-1]), "pre-final phase")
    require(sum(item["text"] == expected for item in projected) == 1, "exact answer cardinality")
    return next(iter(turn_ids)), projected


def stdout_projection(path: Path, task_id: str) -> list[str]:
    raw = read_regular(path, 64_000_000)
    require(raw.endswith(b"\n") and b"\r" not in raw, "stdout framing")
    events: list[dict[str, Any]] = []
    for line_no, line in enumerate(raw.splitlines(), 1):
        require(line, f"empty stdout line:{line_no}")
        value = loads(line, f"stdout:{line_no}")
        require(isinstance(value, dict) and isinstance(value.get("type"), str), f"stdout object:{line_no}")
        events.append(value)
    require(events and events[0] == {"thread_id":task_id,"type":"thread.started"} and UUID_RE.fullmatch(task_id), "stdout thread")
    require(sum(event.get("type") == "thread.started" for event in events) == 1, "thread cardinality")
    state = "BETWEEN"
    starts = completes = 0
    messages: list[str] = []
    for event in events[1:]:
        kind = event.get("type")
        if kind == "turn.started":
            require(state == "BETWEEN", "nested turn")
            state = "IN"; starts += 1
        elif kind == "turn.completed":
            require(state == "IN", "completion without turn")
            state = "BETWEEN"; completes += 1
        else:
            require(kind in {"item.started","item.completed"} and state == "IN", "item outside turn or unknown event")
            item = event.get("item")
            if kind == "item.completed" and isinstance(item, dict) and item.get("type") == "agent_message":
                require(isinstance(item.get("text"), str), "agent message text")
                messages.append(item["text"])
    require(starts == 1 and completes == 1 and state == "BETWEEN" and events[-1].get("type") == "turn.completed", "stdout lifecycle")
    require(not any(event.get("type") in {"turn.failed","error"} for event in events), "stdout failure")
    return messages


def expect_reject(callable_value: Any, label: str) -> None:
    try:
        callable_value()
    except Invalid:
        return
    raise Invalid(f"mutation accepted:{label}")


def check(args: argparse.Namespace) -> dict[str, Any]:
    bindings = [identity(label,path) for label,path in FILES]
    require(all(item["mode"] == "0644" for item in bindings), "source mode")
    contract = load_canonical(V7 / "goal_mode_contract.json")
    require(contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v7", "contract schema")
    require(contract["authority"] == {"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False}, "contract authority")
    architecture = contract["architecture"]
    require(architecture["adapter"] == "CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_V3", "adapter")
    require(architecture["goal_hierarchy"] == "ONE_FRESH_TEST_TAKER_TASK_WITH_ITS_OWN_NATIVE_GOAL", "Goal hierarchy")
    require(architecture["message_projection"] == "ORDERED_ROLLOUT_COMMENTARY_STAR_THEN_ONE_FINAL_BOUND_TO_CLI_AGENT_MESSAGES", "message projection")
    require(contract["omp_lane"] == {"duplicate_spawn":False,"external_controller":"WINDOWS_HOST","launch_argv":["omp","--cwd","P:\\"],"linux_process_absence_is_not_evidence":True,"native_goal_required_per_fresh_omp_test_taker":True,"status":"EXISTING_EXTERNALLY_ARRANGED_LANE_UNTOUCHED"}, "OMP boundary")
    require(contract["qualification"] == {"canary_credit":0,"matrix_launch_frozen":True,"required_consecutive_clean_full_goal_mode_matrices":2,"streak":0}, "qualification freeze")
    v6_ref = contract["lineage"]["v6_route_canary_failure"]
    failure_path = BASE / v6_ref["path"]
    require(identity(v6_ref["path"], failure_path) == {key:v6_ref[key] for key in ("bytes","mode","path","sha256")}, "V6 failure identity")
    failure = load_canonical(failure_path)
    require(failure["status"] == "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY" and failure["failure"]["normalized_family"] == "GOAL_MODE_OUTPUT_LIFECYCLE_COMMENTARY_PROJECTION_UNDERCOVERAGE", "V6 failure lineage")
    require(failure["accounting"]["consumed_rows"] == 3 and failure["accounting"]["passed_rows"] == 0 and failure["accounting"]["qualification_credit"] == 0 and failure["accounting"]["retries"] == 0, "V6 failure accounting")

    harness = read_regular(V7 / "goal_mode_harness.py").decode()
    attestor = read_regular(V7 / "goal_mode_single_process_attestor.py").decode()
    ast.parse(harness, filename="goal_mode_harness.py")
    tree = ast.parse(attestor, filename="goal_mode_single_process_attestor.py")
    functions = {node.name for node in ast.walk(tree) if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))}
    require({"_native_goal_calls","_exact_goal_invocation","_reader_call","_reader_result","attest_release","attest_final"} <= functions, "attestor functions")
    for token in ("assistant_messages[:-1]","phase\"] == \"final_answer\"","stdout/rollout message binding","message_projection_sha256","DIRECT_NATIVE_FUNCTION","NESTED_CODE_MODE_EXEC"):
        require(token in attestor, f"attestor token:{token}")
    require('lifecycle["messages"] == [expected]' not in attestor, "singleton terminal assumption survived")
    require("resume" not in {node.value for node in ast.walk(ast.parse(harness)) if isinstance(node,ast.Constant) and isinstance(node.value,str) and node.value in {"resume","exec resume"}}, "resume surface")

    replay: list[dict[str, Any]] = []
    for consumed in failure["consumed_rows"]:
        task_id = consumed["task_id"]
        candidates = sorted((args.codex_home / "sessions").rglob(f"*{task_id}.jsonl"))
        require(len(candidates) == 1, f"rollout path:{consumed['row_id']}")
        raw = read_regular(candidates[0], 64_000_000)
        require(len(raw) == consumed["rollout"]["bytes"] and hashlib.sha256(raw).hexdigest() == consumed["rollout"]["sha256"], f"rollout identity:{consumed['row_id']}")
        turn_id, messages = assistant_projection(rollout(candidates[0]), consumed["answer"])
        require(turn_id == consumed["turn_id"] and [item["phase"] for item in messages] == consumed["message_phases"], f"rollout phases:{consumed['row_id']}")
        stdout_messages = stdout_projection(EVIDENCE / "rows" / consumed["row_id"] / "stdout.jsonl", task_id)
        require(stdout_messages == [item["text"] for item in messages], f"stdout/rollout binding:{consumed['row_id']}")
        last = read_regular(EVIDENCE / "rows" / consumed["row_id"] / "output_last_message.txt", 8_000_000).decode()
        require(last == consumed["answer"], f"output-last-message:{consumed['row_id']}")
        replay.append({"commentary_count":len(messages)-1,"message_count":len(messages),"row_id":consumed["row_id"],"task_id":task_id})
    require([item["commentary_count"] for item in replay] == [2,3,1], "V6 commentary witness")

    expect_reject(lambda: assistant_projection([{"line":1,"record":{"type":"turn_context","turn_id":"turn"}},{"line":2,"record":{"type":"response_item","payload":{"type":"message","role":"assistant","phase":"commentary","content":[{"type":"output_text","text":"x"}]}}}], "x"), "missing final")
    expect_reject(lambda: assistant_projection([{"line":1,"record":{"type":"turn_context","turn_id":"turn"}},{"line":2,"record":{"type":"response_item","payload":{"type":"message","role":"assistant","phase":"final_answer","content":[{"type":"output_text","text":"x"}]}}},{"line":3,"record":{"type":"response_item","payload":{"type":"message","role":"assistant","phase":"commentary","content":[{"type":"output_text","text":"after"}]}}}], "x"), "message after final")

    version = subprocess.run([str(args.codex),"--version"],stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,timeout=10)
    require(version.returncode == 0 and version.stderr == b"" and version.stdout == b"codex-cli 0.148.0\n", "Codex version")
    return {"authority":{"canary_admission_eligible":True,"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"bindings":bindings,"checks":{"closed_phase_mutations_rejected":2,"goal_action_projection":"PASS_BOTH_CLOSED_REPRESENTATIONS_STATIC","message_phase_replay":replay,"omp_boundary":"PASS_EXISTING_WINDOWS_HOST_OMP_CWD_P_DRIVE_UNTOUCHED","source_ast":"PASS","v6_failure_preserved":"PASS_PERMANENT_ZERO_CREDIT"},"first_mismatch":None,"schema_id":"pw-r9-goal-mode-harness-v7-independent-check-v1","status":"PASS_INDEPENDENT_STATIC_CLOSED_MESSAGE_PHASE_CHECK_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", required=True)
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = check(args)
        rc = 0
    except (Invalid,OSError,subprocess.SubprocessError) as exc:
        result = {"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-harness-v7-independent-check-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())

