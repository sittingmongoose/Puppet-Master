#!/usr/bin/env python3
"""Route-local owned-GLM projection over the unchanged V7 session verifier."""

from __future__ import annotations

import copy
import sys
import tempfile
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
V7 = HERE.parent / "system_pipeline_sandbox_v7"
sys.path.insert(0, str(V7))

import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline  # type: ignore[import-not-found]  # noqa: E402
ORIGINAL_VERIFY_SESSION = omp_session.verify_session
ASCII_WS = "\t\n\r "
OBSERVATION = "<observation>"


class ProjectionError(RuntimeError):
    pass
def require(condition: bool, message: str) -> None:
    if not condition:
        raise ProjectionError(message)


def ascii_ws(value: str) -> bool:
    return all(character in ASCII_WS for character in value)


def parse_glm_call(call: dict[str, Any]) -> dict[str, Any]:
    require(call.get("name") == "goal", "owned GLM canonical Goal name")
    require(call.get("arguments") == {"op": "complete"}, "owned GLM canonical Goal arguments")
    raw = call.get("rawBlock")
    require(isinstance(raw, str) and raw, "owned GLM nonempty rawBlock")
    tokens = ("<tool_call>", "</tool_call>", "<arg_key>", "</arg_key>", "<arg_value>", "</arg_value>")
    require(all(raw.count(token) == 1 for token in tokens), "owned GLM sole grammar tokens")
    require(raw.startswith(tokens[0]) and raw.endswith(tokens[1]), "owned GLM call envelope")
    body = raw[len(tokens[0]) : -len(tokens[1])]
    key_open = body.find(tokens[2])
    require(key_open >= 0, "owned GLM key opener")
    name = body[:key_open]
    require(name.strip(ASCII_WS) == "goal" and ascii_ws(name.replace("goal", "", 1)), "owned GLM raw name")
    key_start = key_open + len(tokens[2])
    key_close = body.find(tokens[3], key_start)
    require(key_close >= key_start, "owned GLM key closer")
    key = body[key_start:key_close]
    require(key.strip(ASCII_WS) == "op" and ascii_ws(key.replace("op", "", 1)), "owned GLM raw key")
    value_open = body.find(tokens[4], key_close + len(tokens[3]))
    require(value_open >= 0 and ascii_ws(body[key_close + len(tokens[3]) : value_open]), "owned GLM key/value order")
    value_start = value_open + len(tokens[4])
    value_close = body.find(tokens[5], value_start)
    require(value_close >= value_start, "owned GLM value closer")
    value = body[value_start:value_close]
    require(
        value.strip(ASCII_WS) == "complete" and ascii_ws(value.replace("complete", "", 1)),
        "owned GLM raw value",
    )
    require(ascii_ws(body[value_close + len(tokens[5]) :]), "owned GLM trailing call whitespace")
    encoded = raw.encode("utf-8")
    return {"present": True, "bytes": len(encoded), "sha256": pipeline.sha256_bytes(encoded)}


def framing(text: str) -> str:
    require(text != "", "owned GLM framing nonempty")
    if ascii_ws(text):
        return "ascii_whitespace"
    require(text.count(OBSERVATION) == 1, "owned GLM one observation opener")
    before, after = text.split(OBSERVATION)
    require(ascii_ws(before) and ascii_ws(after), "owned GLM closed observation framing")
    return "observation_open"


def pending(path: Path, entries: list[dict[str, Any]], expected: dict[str, Any]) -> None:
    forbidden = [
        entry
        for entry in entries
        if (entry.get("type") == "message" and entry.get("message", {}).get("role") == "toolResult")
        or (entry.get("type") == "custom" and entry.get("customType") in {"tool_execution_start", "goal-completed", "session_exit"})
        or (entry.get("type") == "mode_change" and entry.get("mode") == "none")
    ]
    require(not forbidden, "zero-call trace has terminal/tool evidence")
    try:
        prefix = omp_session.verify_submission_prefix(
            path,
            expected_cwd=expected["expected_cwd"],
            expected_objective=expected["expected_objective"],
            expected_selector=expected["expected_selector"],
            expected_thinking=expected["expected_thinking"],
        )
    except (omp_session.OmpSessionError, KeyError, TypeError) as exc:
        raise ProjectionError(f"zero-call submission mismatch: {exc}") from exc
    goals = [entry.get("data", {}).get("goal") for entry in entries if entry.get("type") == "mode_change" and entry.get("mode") == "goal"]
    require(bool(goals), "zero-call active Goal absent")
    first: dict[str, Any] | None = None
    previous: dict[str, Any] | None = None
    for raw_goal in goals:
        try:
            goal = omp_session.validate_goal(raw_goal, status="active", objective=expected["expected_objective"], goal_id=first["id"] if first else None)
        except omp_session.OmpSessionError as exc:
            raise ProjectionError(f"zero-call active Goal mismatch: {exc}") from exc
        require(first is None or (goal["createdAt"] == first["createdAt"] and goal.get("tokenBudget") == first.get("tokenBudget")), "zero-call Goal creation/budget identity")
        require(previous is None or (goal["updatedAt"] >= previous["updatedAt"] and goal["tokensUsed"] >= previous["tokensUsed"] and goal["timeUsedSeconds"] >= previous["timeUsedSeconds"]), "zero-call Goal accounting monotonic")
        first = first or goal
        previous = goal
    require(first is not None and prefix["goal_id"] == first["id"], "zero-call prefix Goal join")
    assistants = [
        entry["message"]
        for entry in entries
        if entry.get("type") == "message"
        and isinstance(entry.get("message"), dict)
        and entry["message"].get("role") == "assistant"
    ]
    continuations = prefix["native_continuation_count"]
    require(len(assistants) in {continuations, continuations + 1}, "zero-call inference accounting")
    for message in assistants:
        require(
            message.get("provider") == expected["expected_provider"]
            and message.get("model") == expected["expected_model"]
            and message.get("stopReason") == "stop"
            and message.get("retryRecovery") is None,
            "zero-call assistant identity",
        )
        content = message.get("content")
        require(isinstance(content, list) and content, "zero-call assistant content")
        require(
            all(isinstance(block, dict) and ((block.get("type") == "text" and isinstance(block.get("text"), str)) or (block.get("type") == "thinking" and isinstance(block.get("thinking"), str))) for block in content),
            "zero-call assistant contains only typed text/thinking",
        )
    raise omp_session.OmpSessionError(f"owned GLM pending active Goal {first['id']}")


def verify_session(path: Path, **kwargs: Any) -> dict[str, Any]:
    _slot, header, entries, source = omp_session.load_physical_session(path)
    calls: list[tuple[int, int, dict[str, Any], list[dict[str, Any]]]] = []
    for entry_index, entry in enumerate(entries):
        message = entry.get("message") if entry.get("type") == "message" else None
        content = message.get("content") if isinstance(message, dict) and message.get("role") == "assistant" else None
        if isinstance(content, list):
            calls.extend(
                (entry_index, block_index, block, content)
                for block_index, block in enumerate(content)
                if isinstance(block, dict) and block.get("type") == "toolCall"
            )
    if not calls:
        pending(path, entries, kwargs)
    require(len(calls) == 1, "owned GLM exactly one total tool call")
    entry_index, call_index, call, content = calls[0]
    call_receipt = parse_glm_call(call)
    after = content[call_index + 1 :]
    require(len(after) in {0, 1}, "owned GLM zero or one post-call block")
    frame = {"present": False, "kind": "none", "bytes": 0}
    projected = source
    if after:
        block = after[0]
        require(isinstance(block, dict) and set(block) == {"type", "text"} and block["type"] == "text", "owned GLM framing block")
        kind = framing(block["text"])
        encoded = block["text"].encode("utf-8")
        frame = {"present": True, "kind": kind, "bytes": len(encoded), "sha256": pipeline.sha256_bytes(encoded)}
        sanitized = copy.deepcopy(entries)
        sanitized[entry_index]["message"]["content"] = sanitized[entry_index]["message"]["content"][: call_index + 1]
        projected = source[: omp_session.TITLE_SLOT_BYTES] + pipeline.jsonl_bytes([header, *sanitized])
    if projected == source:
        result = ORIGINAL_VERIFY_SESSION(path, **kwargs)
    else:
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-projection-") as temporary:
            projected_path = Path(temporary) / "session.jsonl"
            projected_path.write_bytes(projected)
            result = ORIGINAL_VERIFY_SESSION(projected_path, **kwargs)
    result["session_file_bytes"] = len(source)
    result["session_file_sha256"] = pipeline.sha256_bytes(source)
    result["owned_glm_goal_call"] = call_receipt
    result["owned_glm_post_call_framing"] = frame
    return result
