"""Finite DL-475 contract oracle; static fixtures are not native Memory evidence."""

from __future__ import annotations

import json
from pathlib import Path


def evaluate(rule: str, record: dict):
    if rule == "read":
        if not record["enabled"] or not record["source_allowed"]:
            return False
        scope = record["scope"]
        if scope == "project":
            return record["note_project"] == record["run_project"]
        if scope == "user":
            return record["note_user"] == record["run_user"]
        if scope == "app_thread":
            return (record["actor"] == "assistant"
                    and record["note_thread"] == record["run_thread"])
        raise ValueError("unknown memory scope")
    if rule == "mutate":
        return (record["actor"] in {"user", "assistant"}
                and record["authorized"] and record["current_revision"])
    if rule == "capture":
        return (record["enabled"] and record["useful_reusable_content"]
                and record["source_allowed"] and not record["contains_secret"]
                and (not record["deleted_origin"] or record["new_explicit_user_save"]))
    if rule == "support":
        if record["claim_kind"] == "user_statement":
            return "user_statement_only" if record["actual_user_input"] else "ineligible"
        return "world_fact" if record["current_scoped_evidence"] else "ineligible"
    if rule == "acknowledgment":
        return ("Saved to memory · View"
                if record["durable_save"] and not record["no_op"] else None)
    if rule == "edit_invalidation":
        return not record["changed"] or not any(record["old_derived_eligible"].values())
    if rule == "decay":
        effective_half_life = record["half_life_days"] * (0.5 if record["done"] else 1)
        return 0.5 ** (record["age_days"] / effective_half_life)
    if rule == "upkeep":
        if record["hold_pending"]:
            return "unavailable"
        return "preserve" if record["pinned"] else "archive_preserving_original"
    if rule == "reply":
        forbidden = {"used_memory_chip", "used_memory_count", "next_message_preview",
                     "ranking", "pin", "source", "verified_badge", "rule_receipt"}
        return not (set(record["decorations"]) & forbidden)
    raise ValueError("unknown quiet Memory predicate: " + rule)


def check(root: Path):
    pack = json.loads((root / "Plans/assistant_memory_contract_fixtures.json").read_text())
    cases = pack["quiet_memory_cases"]
    failures = []
    seen = set()
    for case in cases:
        name = case["case_id"]
        if name in seen:
            failures.append({"code": "quiet_memory_duplicate_case", "case": name})
        seen.add(name)
        try:
            actual = evaluate(case["rule"], case["record"])
            expected = case["expected"]
            if type(actual) is not type(expected) or actual != expected:
                failures.append({"code": "quiet_memory_contract_mismatch", "case": name,
                                 "actual": actual, "expected": expected})
        except (KeyError, TypeError, ValueError, ZeroDivisionError) as exc:
            failures.append({"code": "quiet_memory_invalid_case", "case": name, "detail": str(exc)})
    required = {"read", "mutate", "capture", "support", "acknowledgment", "edit_invalidation",
                "decay", "upkeep", "reply"}
    if {case["rule"] for case in cases} != required:
        failures.append({"code": "quiet_memory_predicate_coverage"})
    inventory = json.loads((root / "Plans/settings_inventory.json").read_text())
    live = {row["id"] for row in inventory["settings"]}
    retired = set(inventory["retired_input_ids"])
    expected_live = {"memory.assembly.app-rules", "memory.assembly.project-rules",
                     "memory.retention.enabled", "memory.retention.history-retention",
                     "memory.limits.run-token-budget", "memory.limits.goal-token-budget",
                     "memory.limits.max-context-ktokens", "memory.limits.manual-compact"}
    if {key for key in live if key.startswith("memory.")} != expected_live:
        failures.append({"code": "quiet_memory_live_inventory"})
    if len({key for key in retired if key.startswith("memory.")}) != 43 or live & retired:
        failures.append({"code": "quiet_memory_retired_inventory"})
    return failures, {"quiet_memory_cases": len(cases)}
