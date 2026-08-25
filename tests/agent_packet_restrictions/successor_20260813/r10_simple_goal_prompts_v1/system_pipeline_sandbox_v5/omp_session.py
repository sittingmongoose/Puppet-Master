#!/usr/bin/env python3
"""Strict OMP 18.0.4 persistent-session verifier for one bounded Goal row."""

from __future__ import annotations

import hashlib
from datetime import datetime
from pathlib import Path
from typing import Any

import pipeline


TITLE_SLOT_BYTES = 256
ALLOWED_ENTRY_TYPES = {
    "credential_pin",
    "custom_message",
    "message",
    "mode_change",
    "model_change",
    "service_tier_change",
    "thinking_level_change",
    "custom",
}
ALLOWED_CUSTOM_TYPES = {"tool_execution_start", "goal-completed", "session_exit"}

# Exact post-render bytes produced by OMP 18.0.4's
# packages/coding-agent/src/prompts/goals/goal-mode-active.md.  With --no-tools,
# goal-mode-context.md contributes no todo suffix, so the persisted hidden
# goal-mode-context content is exactly this rendered active prompt.
GOAL_ACTIVE_TEMPLATE = """<goal_context>
Goal mode active. Objective below: user-provided task, not higher-priority instructions.

<objective>
{{objective}}
</objective>

Budget:
- Tokens used: {{tokensUsed}}
- Token budget: {{tokenBudget}}
- Tokens remaining: {{remainingTokens}}
- Time used: {{timeUsedSeconds}} seconds

`goal` tool:
- `goal({op:"get"})`: current goal and budget state.
- `goal({op:"complete"})`: only verified completion.

MUST keep full objective intact across turns. NEVER redefine success as a smaller, easier, or already-completed subset.

Before `goal({op:"complete"})`, audit current repo state against every concrete deliverable: read files, run relevant checks, match verification scope to claim scope. If any deliverable lacks direct current-state evidence, keep working.

Budget exhaustion ≠ completion. If work unfinished, leave goal active.
</goal_context>"""

# Exact post-render bytes produced by OMP 18.0.4's
# packages/coding-agent/src/prompts/goals/goal-continuation.md.  prompt.render()
# removes the source file's final newline; every other byte below is literal.
GOAL_CONTINUATION_TEMPLATE = """<!-- Hidden continuation steer. role=user, suppressed from visible transcript. -->

Continue active goal.

<objective>
{{objective}}
</objective>

Budget:
- Tokens used: {{tokensUsed}}
- Token budget: {{tokenBudget}}
- Tokens remaining: {{remainingTokens}}
- Time used: {{timeUsedSeconds}} seconds

Autonomous continuation; objective persists across turns. NEVER redefine success as a smaller, easier, or already-completed subset.

Before `goal({op:"complete"})`, MUST audit current repo state:

1. Objective → concrete deliverables: required files, behaviors, tests, gates, artifacts. Record in todo or reasoning.
2. Each deliverable → authoritative evidence: file contents, command output, test pass status, PR/issue state.
3. Inspect actual current state: read files; run commands/tests. NEVER rely on earlier-session memory — repo may have changed.
4. Verification scope = claim scope. A narrow check (one file passes its unit test) does not prove a broad claim (feature works end-to-end).
5. Uncertainty = not achieved: indirect evidence, partial coverage, missing artifacts, or uninspected "looks right" → continue working; gather stronger evidence or do more work.
6. Budget exhaustion ≠ completion. NEVER call complete merely because tokens are nearly out. Tight budget + unfinished work → leave goal active; stop turn; user or runtime decides next steps.

Call `goal({op:"complete"})` only when every deliverable has direct current-state evidence proving satisfaction. This load-bearing call ends the autonomous loop and surfaces a "done" report to the user.

Unfinished: keep working. NEVER narrate continuation — execute."""


class OmpSessionError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise OmpSessionError(message)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def escape_xml_text(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def render_goal_prompt(template: str, objective: str, goal: dict[str, Any]) -> str:
    token_budget = goal.get("tokenBudget")
    remaining = "unbounded" if token_budget is None else str(max(0, token_budget - goal["tokensUsed"]))
    replacements = {
        "{{objective}}": escape_xml_text(objective),
        "{{tokensUsed}}": str(goal["tokensUsed"]),
        "{{tokenBudget}}": "none" if token_budget is None else str(token_budget),
        "{{remainingTokens}}": remaining,
        "{{timeUsedSeconds}}": str(goal["timeUsedSeconds"]),
    }
    rendered = template
    for source, target in replacements.items():
        rendered = rendered.replace(source, target)
    require("{{" not in rendered and "}}" not in rendered, "OMP native continuation rendering complete")
    return rendered


def render_goal_active(objective: str, goal: dict[str, Any]) -> str:
    return render_goal_prompt(GOAL_ACTIVE_TEMPLATE, objective, goal)


def render_goal_continuation(objective: str, goal: dict[str, Any]) -> str:
    return render_goal_prompt(GOAL_CONTINUATION_TEMPLATE, objective, goal)


def classify_custom_messages(
    entries: list[dict[str, Any]], label: str
) -> tuple[list[tuple[int, dict[str, Any]]], list[tuple[int, dict[str, Any]]]]:
    goal_context_rows: list[tuple[int, dict[str, Any]]] = []
    continuation_rows: list[tuple[int, dict[str, Any]]] = []
    for index, entry in enumerate(entries):
        if entry.get("type") != "custom_message":
            continue
        custom_type = entry.get("customType")
        if custom_type == "goal-mode-context":
            goal_context_rows.append((index, entry))
        elif custom_type == "goal-continuation":
            continuation_rows.append((index, entry))
        else:
            raise OmpSessionError(f"{label} unexpected custom message type: {custom_type}")
    return goal_context_rows, continuation_rows


def validate_goal_context(
    row: tuple[int, dict[str, Any]], *, objective: str, active_goal: dict[str, Any], label: str
) -> int:
    index, entry = row
    require(entry.get("display") is False, f"{label} Goal context hidden")
    require(entry.get("attribution") == "agent", f"{label} Goal context attribution")
    require(isinstance(entry.get("content"), str), f"{label} Goal context text")
    require(
        entry["content"] == render_goal_active(objective, active_goal),
        f"{label} exact Goal context template",
    )
    return index


def parse_utc(value: Any, label: str) -> datetime:
    require(isinstance(value, str) and value.endswith("Z"), f"{label} UTC timestamp")
    try:
        return datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as exc:
        raise OmpSessionError(f"{label} UTC timestamp") from exc


def exact_text_content(content: Any, label: str) -> str:
    if isinstance(content, str):
        return content
    require(isinstance(content, list) and len(content) == 1, f"{label} one text content block")
    block = content[0]
    require(isinstance(block, dict) and block.get("type") == "text", f"{label} text content block")
    require(isinstance(block.get("text"), str), f"{label} text value")
    return block["text"]


def assistant_text(message: dict[str, Any], label: str) -> str:
    content = message.get("content")
    require(isinstance(content, list), f"{label} assistant content")
    text_blocks = [block for block in content if isinstance(block, dict) and block.get("type") == "text"]
    require(text_blocks and all(isinstance(block.get("text"), str) for block in text_blocks), f"{label} text blocks")
    allowed = {"text", "thinking", "redactedThinking"}
    require(
        all(isinstance(block, dict) and block.get("type") in allowed for block in content),
        f"{label} assistant final content types",
    )
    return "".join(block["text"] for block in text_blocks)


def validate_goal(goal: Any, *, status: str, objective: str, goal_id: str | None = None) -> dict[str, Any]:
    require(isinstance(goal, dict), f"Goal {status} object")
    required = {"id", "objective", "status", "tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"}
    require(required.issubset(goal), f"Goal {status} required fields")
    require(isinstance(goal.get("id"), str) and goal["id"], f"Goal {status} id")
    if goal_id is not None:
        require(goal["id"] == goal_id, f"Goal {status} id join")
    require(goal.get("objective") == objective, f"Goal {status} objective join")
    require(goal.get("status") == status, f"Goal {status} status")
    for field in ("tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"):
        value = goal.get(field)
        require(isinstance(value, int) and not isinstance(value, bool), f"Goal {status} {field} integer")
        require(value >= 0, f"Goal {status} {field} nonnegative")
    require(goal["updatedAt"] >= goal["createdAt"], f"Goal {status} timestamp order")
    token_budget = goal.get("tokenBudget")
    require(
        token_budget is None or (isinstance(token_budget, int) and not isinstance(token_budget, bool) and token_budget > 0),
        f"Goal {status} token budget",
    )
    return goal


def load_physical_session(path: Path) -> tuple[dict[str, Any], dict[str, Any], list[dict[str, Any]], bytes]:
    require(path.is_file() and not path.is_symlink(), "OMP session file absent or unsafe")
    raw = path.read_bytes()
    require(len(raw) > TITLE_SLOT_BYTES, "OMP session file too short")
    slot_raw = raw[:TITLE_SLOT_BYTES]
    require(slot_raw.endswith(b"\n"), "OMP title slot newline")
    try:
        slot_text = slot_raw[:-1].decode("utf-8")
        body_text = raw[TITLE_SLOT_BYTES:].decode("utf-8")
    except UnicodeDecodeError as exc:
        raise OmpSessionError("OMP session UTF-8") from exc
    slot = pipeline.strict_loads(slot_text)
    require(isinstance(slot, dict), "OMP title slot object")
    require(slot.get("type") == "title" and slot.get("v") == 1, "OMP title slot schema")
    require(slot.get("title") == "", "OMP --no-title blank title")
    require(slot.get("source") in (None, "auto", "user"), "OMP title source")
    require(isinstance(slot.get("pad"), str), "OMP title slot padding")
    parse_utc(slot.get("updatedAt"), "OMP title slot")
    lines = body_text.splitlines()
    require(lines and all(line.strip() for line in lines), "OMP session nonblank JSONL")
    rows = [pipeline.strict_loads(line) for line in lines]
    require(all(isinstance(row, dict) for row in rows), "OMP session JSON objects")
    header = rows[0]
    entries = rows[1:]
    require(header.get("type") == "session" and header.get("version") == 3, "OMP session v3 header")
    require(isinstance(header.get("id"), str) and header["id"], "OMP session header id")
    parse_utc(header.get("timestamp"), "OMP session header")
    return slot, header, entries, raw


def verify_submission_prefix(
    path: Path,
    *,
    expected_cwd: str,
    expected_objective: str,
    expected_selector: str,
    expected_thinking: str,
) -> dict[str, Any]:
    """Prove that one composer draft became one persisted native Goal submission."""
    _slot, header, entries, raw = load_physical_session(path)
    require(header.get("cwd") == expected_cwd, "OMP submission session cwd")
    require(header.get("parentSession") is None, "OMP submission fresh session lineage")
    require(header.get("additionalDirectories") in (None, []), "OMP submission additional directories absent")
    require(entries, "OMP submission entries")

    ids: set[str] = set()
    previous_id: str | None = None
    previous_time = parse_utc(header["timestamp"], "OMP submission header")
    for entry in entries:
        require(entry.get("type") in ALLOWED_ENTRY_TYPES, f"OMP submission unexpected entry type: {entry.get('type')}")
        entry_id = entry.get("id")
        require(isinstance(entry_id, str) and entry_id and entry_id not in ids, "OMP submission unique entry id")
        ids.add(entry_id)
        require(entry.get("parentId") == previous_id, "OMP submission one linear chain")
        timestamp = parse_utc(entry.get("timestamp"), "OMP submission entry")
        require(timestamp >= previous_time, "OMP submission timestamp order")
        previous_time = timestamp
        previous_id = entry_id

    user_rows: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    for index, entry in enumerate(entries):
        if entry["type"] != "message":
            continue
        message = entry.get("message")
        require(isinstance(message, dict), "OMP submission message object")
        if message.get("role") == "user":
            user_rows.append((index, entry, message))
    require(len(user_rows) == 1, "OMP submission exactly one external user message")
    user_index, user_entry, user_message = user_rows[0]
    require(user_message.get("synthetic") in (None, False), "OMP submission user not synthetic")
    require(user_message.get("steering") in (None, False), "OMP submission user not steering")
    require(user_message.get("attribution") in (None, "user"), "OMP submission user attribution")
    require(exact_text_content(user_message.get("content"), "OMP submission user") == expected_objective, "OMP submission exact objective")

    goal_rows: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    for index, entry in enumerate(entries):
        if entry["type"] != "mode_change" or entry.get("mode") != "goal":
            continue
        data = entry.get("data")
        require(isinstance(data, dict), "OMP submission Goal mode data")
        goal = data.get("goal")
        if isinstance(goal, dict) and goal.get("status") == "active":
            goal_rows.append((index, entry, validate_goal(goal, status="active", objective=expected_objective)))
    require(goal_rows, "OMP submission active Goal state")
    active_index, active_entry, active_goal = goal_rows[0]

    goal_context_rows, continuation_rows = classify_custom_messages(entries, "OMP submission")
    require(len(continuation_rows) <= 1, "OMP submission at most one native Goal continuation")
    require(
        len(goal_context_rows) == 1 + len(continuation_rows),
        "OMP submission one Goal context per native inference",
    )
    goal_context_index = validate_goal_context(
        goal_context_rows[0],
        objective=expected_objective,
        active_goal=active_goal,
        label="OMP submission",
    )
    if continuation_rows:
        continuation_index, continuation_entry = continuation_rows[0]
        prior_goal_rows = [(index, goal) for index, _entry, goal in goal_rows if index < continuation_index]
        require(prior_goal_rows, "OMP submission continuation prior Goal state")
        continuation_goal_index, continuation_goal = prior_goal_rows[-1]
        continuation_context_index = validate_goal_context(
            goal_context_rows[1],
            objective=expected_objective,
            active_goal=continuation_goal,
            label="OMP submission continuation",
        )
        require(
            continuation_goal_index < continuation_context_index
            and continuation_context_index + 1 == continuation_index,
            "OMP submission continuation context order",
        )
        require(continuation_entry.get("display") is False, "OMP submission continuation hidden")
        require(continuation_entry.get("attribution") == "agent", "OMP submission continuation attribution")
        require(
            continuation_entry.get("content") == render_goal_continuation(expected_objective, continuation_goal),
            "OMP submission exact continuation template",
        )

    model_rows = [(index, entry) for index, entry in enumerate(entries) if entry["type"] == "model_change"]
    require(model_rows and all(entry.get("model") == expected_selector for _, entry in model_rows), "OMP submission selector")
    thinking_rows = [(index, entry) for index, entry in enumerate(entries) if entry["type"] == "thinking_level_change"]
    require(thinking_rows, "OMP submission thinking receipt")
    if expected_thinking == "auto":
        require(all(entry.get("configured") == "auto" for _, entry in thinking_rows), "OMP submission configured auto")
    else:
        require(all(entry.get("thinkingLevel") == expected_thinking for _, entry in thinking_rows), "OMP submission thinking effort")
        require(
            all(entry.get("configured") in (None, expected_thinking) for _, entry in thinking_rows),
            "OMP submission configured effort",
        )
    require(
        model_rows[0][0] < active_index < goal_context_index < user_index,
        "OMP submission selector/Goal/context/user order",
    )
    require(thinking_rows[0][0] < active_index, "OMP submission effort precedes Goal")

    return {
        "session_id": header["id"],
        "session_started_at_utc": header["timestamp"],
        "session_prefix_bytes": len(raw),
        "session_prefix_sha256": sha256_bytes(raw),
        "logical_entry_count": 1 + len(entries),
        "goal_id": active_goal["id"],
        "goal_active_entry_id": active_entry["id"],
        "goal_context_entry_ids": [entry["id"] for _index, entry in goal_context_rows],
        "user_entry_id": user_entry["id"],
        "selector": expected_selector,
        "thinking": expected_thinking,
        "external_user_message_count": 1,
        "goal_context_count": len(goal_context_rows),
        "native_continuation_count": len(continuation_rows),
    }


def verify_session(
    path: Path,
    *,
    expected_cwd: str,
    expected_objective: str,
    expected_provider: str,
    expected_model: str,
    expected_selector: str,
    expected_thinking: str,
    require_exit: bool = True,
) -> dict[str, Any]:
    _slot, header, entries, raw = load_physical_session(path)
    require(header.get("cwd") == expected_cwd, "OMP session cwd")
    require(header.get("parentSession") is None, "OMP fresh session lineage")
    require(header.get("additionalDirectories") in (None, []), "OMP additional directories absent")
    require(entries, "OMP session entries")

    ids: set[str] = set()
    previous_id: str | None = None
    previous_time = parse_utc(header["timestamp"], "OMP session header")
    for entry in entries:
        require(entry.get("type") in ALLOWED_ENTRY_TYPES, f"OMP unexpected entry type: {entry.get('type')}")
        entry_id = entry.get("id")
        require(isinstance(entry_id, str) and entry_id and entry_id not in ids, "OMP unique entry id")
        ids.add(entry_id)
        require(entry.get("parentId") == previous_id, "OMP one linear active chain")
        timestamp = parse_utc(entry.get("timestamp"), "OMP entry")
        require(timestamp >= previous_time, "OMP entry timestamp order")
        previous_time = timestamp
        previous_id = entry_id
        if entry.get("type") == "custom":
            require(entry.get("customType") in ALLOWED_CUSTOM_TYPES, f"OMP unexpected custom type: {entry.get('customType')}")

    all_modes = [(index, entry) for index, entry in enumerate(entries) if entry["type"] == "mode_change"]
    require(
        all_modes and all(entry.get("mode") in {"goal", "none"} for _, entry in all_modes),
        "OMP only Goal lifecycle modes",
    )

    model_changes = [entry for entry in entries if entry["type"] == "model_change"]
    require(model_changes, "OMP model change evidence")
    require(all(entry.get("model") == expected_selector for entry in model_changes), "OMP effective selector")
    thinking_changes = [entry for entry in entries if entry["type"] == "thinking_level_change"]
    require(thinking_changes, "OMP thinking change evidence")
    if expected_thinking == "auto":
        require(all(entry.get("configured") == "auto" for entry in thinking_changes), "OMP configured auto effort")
    else:
        require(
            all(entry.get("thinkingLevel") == expected_thinking for entry in thinking_changes),
            "OMP effective thinking effort",
        )
        require(
            all(entry.get("configured") in (None, expected_thinking) for entry in thinking_changes),
            "OMP configured thinking effort",
        )

    user_rows: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    assistant_rows: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    tool_results: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    goal_context_rows, continuation_rows = classify_custom_messages(entries, "OMP")
    for index, entry in enumerate(entries):
        if entry["type"] == "custom_message":
            continue
        if entry["type"] != "message":
            continue
        message = entry.get("message")
        require(isinstance(message, dict), "OMP message object")
        role = message.get("role")
        if role == "user":
            user_rows.append((index, entry, message))
        elif role == "assistant":
            assistant_rows.append((index, entry, message))
        elif role == "toolResult":
            tool_results.append((index, entry, message))
        else:
            raise OmpSessionError(f"OMP unexpected message role: {role}")

    require(len(user_rows) == 1, "OMP exactly one external user message")
    user_index, user_entry, user_message = user_rows[0]
    require(user_message.get("synthetic") in (None, False), "OMP external user not synthetic")
    require(user_message.get("steering") in (None, False), "OMP external user not steering")
    require(user_message.get("attribution") in (None, "user"), "OMP external user attribution")
    require(exact_text_content(user_message.get("content"), "OMP user") == expected_objective, "OMP exact objective")

    goal_modes: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    for index, entry in enumerate(entries):
        if entry["type"] != "mode_change" or entry.get("mode") != "goal":
            continue
        data = entry.get("data")
        require(isinstance(data, dict), "OMP Goal mode data")
        goal_modes.append((index, entry, data.get("goal")))
    require(len(goal_modes) >= 2, "OMP active and complete Goal states")
    active_index, active_entry, active_raw = goal_modes[0]
    active = validate_goal(active_raw, status="active", objective=expected_objective)
    goal_id = active["id"]
    require(len(goal_context_rows) == 1 + len(continuation_rows), "OMP one Goal context per native inference")
    goal_context_index = validate_goal_context(
        goal_context_rows[0],
        objective=expected_objective,
        active_goal=active,
        label="OMP",
    )
    require(active_index < goal_context_index < user_index, "OMP Goal/context/objective order")
    complete_states = []
    validated_goal_modes: list[tuple[int, dict[str, Any]]] = [(active_index, active)]
    previous_goal = active
    for index, entry, goal_raw in goal_modes[1:]:
        require(isinstance(goal_raw, dict), "OMP later Goal state")
        status = goal_raw.get("status")
        require(status in {"active", "complete"}, "OMP Goal state status")
        validated = validate_goal(goal_raw, status=status, objective=expected_objective, goal_id=goal_id)
        require(validated["createdAt"] == active["createdAt"], "OMP Goal createdAt identity")
        require(validated.get("tokenBudget") == active.get("tokenBudget"), "OMP Goal token budget identity")
        require(validated["updatedAt"] >= previous_goal["updatedAt"], "OMP Goal updatedAt monotonic")
        require(validated["tokensUsed"] >= previous_goal["tokensUsed"], "OMP Goal tokens monotonic")
        require(validated["timeUsedSeconds"] >= previous_goal["timeUsedSeconds"], "OMP Goal time monotonic")
        validated_goal_modes.append((index, validated))
        previous_goal = validated
        if status == "complete":
            complete_states.append((index, entry, goal_raw))
    require(len(complete_states) == 1, "OMP exactly one complete Goal state")
    complete_index, complete_entry, complete_raw = complete_states[0]
    require(goal_modes[-1][0] == complete_index, "OMP complete state is terminal Goal state")
    completed = validate_goal(complete_raw, status="complete", objective=expected_objective, goal_id=goal_id)
    require(completed["createdAt"] == active["createdAt"], "OMP Goal createdAt identity")
    require(completed["updatedAt"] >= active["updatedAt"], "OMP Goal update order")

    require(len(continuation_rows) <= 1, "OMP at most one native Goal continuation")
    expected_assistant_count = 2 + len(continuation_rows)
    require(len(assistant_rows) == expected_assistant_count, "OMP bounded Goal assistant-turn count")
    intermediate: tuple[int, dict[str, Any], dict[str, Any]] | None = None
    if continuation_rows:
        intermediate = assistant_rows[0]
        call_index, call_entry, call_message = assistant_rows[1]
        final_index, final_entry, final_message = assistant_rows[2]
        continuation_index, continuation_message = continuation_rows[0]
        intermediate_index, _intermediate_entry, intermediate_message = intermediate
        require(intermediate_message.get("stopReason") == "stop", "OMP continuation-source assistant stop")
        intermediate_content = intermediate_message.get("content")
        require(isinstance(intermediate_content, list) and intermediate_content, "OMP continuation-source content")
        require(
            all(
                isinstance(block, dict) and block.get("type") in {"text", "thinking", "redactedThinking"}
                for block in intermediate_content
            ),
            "OMP continuation-source has no tool call",
        )
        require(continuation_message.get("customType") == "goal-continuation", "OMP native continuation type")
        require(continuation_message.get("display") is False, "OMP native continuation hidden")
        require(continuation_message.get("attribution") in (None, "agent"), "OMP native continuation attribution")
        continuation_content = continuation_message.get("content")
        require(isinstance(continuation_content, str), "OMP native continuation text")
        prior_goal_states = [(index, goal) for index, goal in validated_goal_modes if index < continuation_index]
        require(prior_goal_states, "OMP native continuation prior Goal state")
        continuation_goal = prior_goal_states[-1][1]
        continuation_context_index = validate_goal_context(
            goal_context_rows[1],
            objective=expected_objective,
            active_goal=continuation_goal,
            label="OMP continuation",
        )
        require(
            continuation_content == render_goal_continuation(expected_objective, continuation_goal),
            "OMP exact native continuation template",
        )
        continuation_goal_index = prior_goal_states[-1][0]
        require(
            user_index
            < intermediate_index
            < continuation_goal_index
            < continuation_context_index
            and continuation_context_index + 1 == continuation_index
            < call_index,
            "OMP native continuation order",
        )
    else:
        call_index, call_entry, call_message = assistant_rows[0]
        final_index, final_entry, final_message = assistant_rows[1]
    first_inference_index = intermediate[0] if intermediate else call_index
    require(
        any(index < first_inference_index for index, entry in enumerate(entries) if entry["type"] == "model_change"),
        "OMP model selection precedes inference",
    )
    require(
        any(index < first_inference_index for index, entry in enumerate(entries) if entry["type"] == "thinking_level_change"),
        "OMP thinking selection precedes inference",
    )
    for message in [*( [intermediate[2]] if intermediate else []), call_message, final_message]:
        require(message.get("provider") == expected_provider, "OMP assistant provider")
        require(message.get("model") == expected_model, "OMP assistant model")
        require(message.get("retryRecovery") is None, "OMP no recovered retry")

    call_content = call_message.get("content")
    require(isinstance(call_content, list), "OMP Goal-call assistant content")
    tool_calls = [block for block in call_content if isinstance(block, dict) and block.get("type") == "toolCall"]
    require(len(tool_calls) == 1, "OMP exactly one Goal tool call")
    require(
        all(isinstance(block, dict) and block.get("type") in {"thinking", "redactedThinking", "toolCall"} for block in call_content),
        "OMP Goal-call assistant has no prose or ordinary content",
    )
    goal_call = tool_calls[0]
    require(goal_call.get("name") == "goal", "OMP only native Goal tool")
    require(goal_call.get("arguments") == {"op": "complete"}, "OMP exact Goal completion operation")
    call_id = goal_call.get("id")
    require(isinstance(call_id, str) and call_id, "OMP Goal tool call id")
    require(call_message.get("stopReason") == "toolUse", "OMP Goal-call stop reason")

    starts = [
        (index, entry)
        for index, entry in enumerate(entries)
        if entry["type"] == "custom" and entry.get("customType") == "tool_execution_start"
    ]
    require(len(starts) == 1, "OMP one tool execution start")
    start_index, start_entry = starts[0]
    start_data = start_entry.get("data")
    require(isinstance(start_data, dict), "OMP tool execution start data")
    require(start_data.get("toolCallId") == call_id and start_data.get("toolName") == "goal", "OMP Goal tool start join")

    require(len(tool_results) == 1, "OMP exactly one tool result")
    result_index, result_entry, result_message = tool_results[0]
    require(result_message.get("toolCallId") == call_id and result_message.get("toolName") == "goal", "OMP Goal result join")
    require(result_message.get("isError") is False, "OMP Goal result success")
    details = result_message.get("details")
    require(isinstance(details, dict) and details.get("op") == "complete", "OMP Goal result operation")
    result_goal = validate_goal(
        details.get("goal"), status="complete", objective=expected_objective, goal_id=goal_id
    )
    require(result_goal["createdAt"] == completed["createdAt"], "OMP Goal result createdAt identity")

    require(
        active_index < user_index < call_index < start_index < complete_index < result_index < final_index,
        "OMP native Goal lifecycle order",
    )
    require(final_message.get("stopReason") == "stop", "OMP final assistant stop")
    final_text = assistant_text(final_message, "OMP final")

    none_modes = [
        (index, entry)
        for index, entry in enumerate(entries)
        if entry["type"] == "mode_change" and entry.get("mode") == "none"
    ]
    require(len(none_modes) == 1 and none_modes[0][0] > final_index, "OMP Goal exit mode")
    require(all_modes[-1][0] == none_modes[0][0], "OMP none is terminal mode state")
    completed_events = [
        (index, entry)
        for index, entry in enumerate(entries)
        if entry["type"] == "custom" and entry.get("customType") == "goal-completed"
    ]
    require(len(completed_events) == 1 and completed_events[0][0] > none_modes[0][0], "OMP Goal completed event")
    completed_data = completed_events[0][1].get("data")
    require(isinstance(completed_data, dict) and completed_data.get("objective") == expected_objective, "OMP Goal completed objective")

    exits = [
        (index, entry)
        for index, entry in enumerate(entries)
        if entry["type"] == "custom" and entry.get("customType") == "session_exit"
    ]
    if require_exit:
        require(len(exits) == 1 and exits[0][0] > completed_events[0][0], "OMP one terminal session exit")
        exit_data = exits[0][1].get("data")
        require(isinstance(exit_data, dict), "OMP session exit data")
        require(exit_data.get("kind") == "normal", "OMP normal session exit")
        require(exit_data.get("pendingToolCalls") in (None, []), "OMP no pending tool calls")
    else:
        require(len(exits) <= 1, "OMP at most one pre-exit session record")
    expected_tail = [none_modes[0][0], completed_events[0][0], *([exits[0][0]] if exits else [])]
    require(
        list(range(final_index + 1, len(entries))) == expected_tail,
        "OMP terminal Goal/session tail is exact",
    )

    return {
        "session_id": header["id"],
        "session_started_at_utc": header["timestamp"],
        "session_file_bytes": len(raw),
        "session_file_sha256": sha256_bytes(raw),
        "title_slot_bytes": TITLE_SLOT_BYTES,
        "logical_entry_count": 1 + len(entries),
        "leaf_id": entries[-1]["id"],
        "goal_id": goal_id,
        "goal_tool_call_id": call_id,
        "provider": expected_provider,
        "model": expected_model,
        "selector": expected_selector,
        "thinking": expected_thinking,
        "goal_context_count": len(goal_context_rows),
        "native_continuation_count": len(continuation_rows),
        "assistant_message_count": len(assistant_rows),
        "final_text": final_text,
        "final_text_sha256": sha256_bytes(final_text.encode("utf-8")),
        "ordinary_tool_calls": 0,
        "entry_ids": {
            "goal_active": active_entry["id"],
            "goal_contexts": [entry["id"] for _index, entry in goal_context_rows],
            "user": user_entry["id"],
            "native_continuation": continuation_rows[0][1]["id"] if continuation_rows else None,
            "goal_call_assistant": call_entry["id"],
            "goal_tool_start": start_entry["id"],
            "goal_complete_mode": complete_entry["id"],
            "goal_result": result_entry["id"],
            "final_assistant": final_entry["id"],
            "goal_exit": none_modes[0][1]["id"],
            "goal_completed": completed_events[0][1]["id"],
            "session_exit": exits[0][1]["id"] if exits else None,
        },
    }
