#!/usr/bin/env python3
"""V13 prefix-aware attestor with structural native Goal context proof."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V11_PATH = BASE / "goal_mode_empirical_harness_v11" / "goal_mode_terminal_closure_attestor.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_terminal_closure_attestor_v11", V11_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V11 attestor loader unavailable")
v11 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v11
SPEC.loader.exec_module(v11)


ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_V3"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v13"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-scored-active-goal-attestation-v3"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-same-task-terminal-closure-attestation-v3"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-scored-process-launch-receipt-v3"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-closure-process-launch-receipt-v3"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-scored-process-receipt-v3"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-closure-process-receipt-v3"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-terminal-closure-prelaunch-snapshot-v3"
RELEASE_SCHEMA = "pw-r9-goal-mode-terminal-closure-active-goal-release-gate-v3"
DELIVERY_SCHEMA = "pw-r9-goal-mode-terminal-closure-subject-delivery-v3"
CONTEXT_CONTRACT = "STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_NO_PRIOR_WORK_V1"
CONTEXT_SECTIONS = (
    "Continuation behavior:",
    "Budget:",
    "Work from evidence:",
    "Progress visibility:",
    "Fidelity:",
    "Completion audit:",
    "Blocked audit:",
)
CLOSURE_MARKER = v11.CLOSURE_MARKER
DIRECT_NATIVE = v11.DIRECT_NATIVE
NESTED_CODE = v11.NESTED_CODE
Invalid = v11.Invalid
require = v11.require
canon = v11.canon
sha256 = v11.sha256
load_json = v11.load_json
base = v11.base
prior = v11.prior
get_goal_code = v11.get_goal_code
create_goal_code = v11.create_goal_code
update_goal_code = v11.update_goal_code
reader_code = v11.reader_code
reader_command = v11.reader_command


for module in (v11, v11.v10):
    for name, value in {
        "ADAPTER": ADAPTER,
        "ROW_SCHEMA": ROW_SCHEMA,
        "SCORED_ATTESTATION_SCHEMA": SCORED_ATTESTATION_SCHEMA,
        "FINAL_ATTESTATION_SCHEMA": FINAL_ATTESTATION_SCHEMA,
        "SCORED_LAUNCH_SCHEMA": SCORED_LAUNCH_SCHEMA,
        "CLOSURE_LAUNCH_SCHEMA": CLOSURE_LAUNCH_SCHEMA,
        "SCORED_PROCESS_SCHEMA": SCORED_PROCESS_SCHEMA,
        "CLOSURE_PROCESS_SCHEMA": CLOSURE_PROCESS_SCHEMA,
        "SNAPSHOT_SCHEMA": SNAPSHOT_SCHEMA,
        "RELEASE_SCHEMA": RELEASE_SCHEMA,
        "DELIVERY_SCHEMA": DELIVERY_SCHEMA,
    }.items():
        setattr(module, name, value)


def _native_goal_context(
    records: list[dict[str, Any]],
    prompt_line: int,
    turn_id: str,
    objective: str,
) -> dict[str, Any]:
    turns = base._line_turns(records)
    prior_messages = [
        entry
        for entry in records
        if entry["line"] < prompt_line
        and turns.get(entry["line"]) == turn_id
        and base._payload(entry).get("type") == "message"
    ]
    require(len(prior_messages) == 1, "native Goal context cardinality")
    payload = base._payload(prior_messages[0])
    content = payload.get("content")
    require(
        payload.get("role") == "user"
        and isinstance(content, list)
        and len(content) == 1
        and isinstance(content[0], dict)
        and content[0].get("type") == "input_text"
        and isinstance(content[0].get("text"), str),
        "native Goal context envelope",
    )
    text = content[0]["text"]
    require(
        text.startswith('<codex_internal_context source="goal">\nContinue working toward the active thread goal.\n')
        and text.endswith("\n</codex_internal_context>"),
        "native Goal context framing",
    )
    objective_block = f"<objective>\n{objective}\n</objective>"
    require(text.count(objective_block) == 1, "native Goal context objective")
    section_offsets: list[int] = []
    for heading in CONTEXT_SECTIONS:
        marker = f"\n\n{heading}\n"
        require(text.count(marker) == 1, f"native Goal context section:{heading}")
        section_offsets.append(text.index(marker))
    require(section_offsets == sorted(section_offsets) and len(set(section_offsets)) == len(section_offsets), "native Goal context section order")
    prior_reasoning = [
        entry
        for entry in records
        if entry["line"] < prompt_line
        and turns.get(entry["line"]) == turn_id
        and base._payload(entry).get("type") == "reasoning"
    ]
    prior_actions = [entry for entry in base._action_calls(records, 0, prompt_line) if turns.get(entry["line"]) == turn_id]
    require(not prior_reasoning and not prior_actions, "work preceded closure prompt")
    raw = text.encode("utf-8")
    return {
        "bytes": len(raw),
        "contract": CONTEXT_CONTRACT,
        "line": prior_messages[0]["line"],
        "objective_bound": True,
        "section_offsets": [{"heading": heading, "offset": offset} for heading, offset in zip(CONTEXT_SECTIONS, section_offsets)],
        "sha256": sha256(raw),
    }


v11.v10._native_goal_context = _native_goal_context


def load_row(path: Path) -> dict[str, Any]:
    return v11.load_row(path)


def _expected_objective(row: dict[str, Any]) -> str:
    return v11._expected_objective(row)


def attest_release(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return v11.attest_release(row_path, capture, codex_home)


def attest_scored(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return v11.attest_scored(row_path, capture, codex_home)


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    result = v11.attest_final(row_path, capture, codex_home)
    context = result.get("closure", {}).get("native_goal_context")
    require(isinstance(context, dict) and context.get("contract") == CONTEXT_CONTRACT, "V13 structural Goal context")
    result["schema_id"] = FINAL_ATTESTATION_SCHEMA
    result["status"] = "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT"
    return result


__all__ = (
    "ADAPTER",
    "CLOSURE_LAUNCH_SCHEMA",
    "CLOSURE_MARKER",
    "CLOSURE_PROCESS_SCHEMA",
    "CONTEXT_CONTRACT",
    "CONTEXT_SECTIONS",
    "DELIVERY_SCHEMA",
    "DIRECT_NATIVE",
    "FINAL_ATTESTATION_SCHEMA",
    "Invalid",
    "NESTED_CODE",
    "RELEASE_SCHEMA",
    "ROW_SCHEMA",
    "SCORED_ATTESTATION_SCHEMA",
    "SCORED_LAUNCH_SCHEMA",
    "SCORED_PROCESS_SCHEMA",
    "SNAPSHOT_SCHEMA",
    "_expected_objective",
    "_native_goal_context",
    "attest_final",
    "attest_release",
    "attest_scored",
    "base",
    "canon",
    "create_goal_code",
    "get_goal_code",
    "load_json",
    "load_row",
    "prior",
    "reader_code",
    "reader_command",
    "require",
    "sha256",
    "update_goal_code",
)
