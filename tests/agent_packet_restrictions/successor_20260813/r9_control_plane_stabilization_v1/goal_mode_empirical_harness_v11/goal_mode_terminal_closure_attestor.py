#!/usr/bin/env python3
"""Prefix-aware successor attestor for same-task Goal terminal closure."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V10_PATH = BASE / "goal_mode_empirical_harness_v10" / "goal_mode_terminal_closure_attestor.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_terminal_closure_attestor_v10", V10_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V10 attestor loader unavailable")
v10 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v10
SPEC.loader.exec_module(v10)


ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_V2"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v11"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-scored-active-goal-attestation-v2"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-same-task-terminal-closure-attestation-v2"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-scored-process-launch-receipt-v2"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-closure-process-launch-receipt-v2"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-scored-process-receipt-v2"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-closure-process-receipt-v2"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-terminal-closure-prelaunch-snapshot-v2"
RELEASE_SCHEMA = "pw-r9-goal-mode-terminal-closure-active-goal-release-gate-v2"
DELIVERY_SCHEMA = "pw-r9-goal-mode-terminal-closure-subject-delivery-v2"
CLOSURE_MARKER = v10.CLOSURE_MARKER
DIRECT_NATIVE = v10.DIRECT_NATIVE
NESTED_CODE = v10.NESTED_CODE
Invalid = v10.Invalid
require = v10.require
canon = v10.canon
sha256 = v10.sha256
load_json = v10.load_json
base = v10.base
prior = v10.prior
get_goal_code = v10.get_goal_code
create_goal_code = v10.create_goal_code
update_goal_code = v10.update_goal_code
reader_code = v10.reader_code
reader_command = v10.reader_command


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
    setattr(v10, name, value)


_original_attest_scored = v10._attest_scored


def _prefix_aware_attest_scored(
    row_path: Path,
    capture: Path,
    codex_home: Path,
    expected_current_goal_status: str,
) -> dict[str, Any]:
    result = _original_attest_scored(row_path, capture, codex_home, expected_current_goal_status)
    result["schema_id"] = SCORED_ATTESTATION_SCHEMA
    result["status"] = "PASS_SCORED_ANSWER_DURABLE_GOAL_ACTIVE_PREFIX_BOUND_CLOSURE_ELIGIBLE_ZERO_CREDIT"
    if expected_current_goal_status == "active":
        return result
    require(expected_current_goal_status == "complete", "prefix-aware scored status selector")
    stored = load_json(capture / "scored_phase_attestation.json", 16_000_000)
    require(isinstance(stored, dict) and stored.get("schema_id") == SCORED_ATTESTATION_SCHEMA, "stored scored attestation schema")
    historical = stored.get("rollout")
    require(isinstance(historical, dict), "stored historical rollout")
    base._exact_keys(historical, {"bytes", "logical_path", "sha256"}, "stored historical rollout")
    current = result.get("rollout")
    require(isinstance(current, dict), "current scored rollout")
    prefix_bytes = base._assert_rollout_prefix(codex_home, historical, "historical scored")
    require(
        historical["logical_path"] == current.get("logical_path")
        and prefix_bytes < current.get("bytes", 0),
        "historical scored rollout is not a strict same-task prefix",
    )
    result["rollout"] = historical
    return result


v10._attest_scored = _prefix_aware_attest_scored


def load_row(path: Path) -> dict[str, Any]:
    return v10.load_row(path)


def _expected_objective(row: dict[str, Any]) -> str:
    return v10._expected_objective(row)


def attest_release(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return v10.attest_release(row_path, capture, codex_home)


def attest_scored(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return v10.attest_scored(row_path, capture, codex_home)


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    result = v10.attest_final(row_path, capture, codex_home)
    historical = result["scored"]["rollout"]
    final = result["rollout"]
    require(
        historical["logical_path"] == final["logical_path"]
        and historical["bytes"] < final["bytes"],
        "final historical prefix projection",
    )
    result["historical_scored_rollout"] = {
        "bytes": historical["bytes"],
        "final_bytes": final["bytes"],
        "logical_path": historical["logical_path"],
        "sha256": historical["sha256"],
        "strict_prefix": True,
    }
    result["schema_id"] = FINAL_ATTESTATION_SCHEMA
    result["status"] = "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT"
    return result


__all__ = (
    "ADAPTER",
    "CLOSURE_LAUNCH_SCHEMA",
    "CLOSURE_MARKER",
    "CLOSURE_PROCESS_SCHEMA",
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
