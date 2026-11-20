"""Finite DL-475 contract oracle; static fixtures are not native Memory evidence."""

from __future__ import annotations

import json
from pathlib import Path


RETIRED_MEMORY_COMMANDS = frozenset(
    "cmd.chat.memory." + action for action in (
        "verify", "pin", "discard", "toggle_auto_save_unverified", "preview_capsule",
        "rebuild_lexical_index", "rebuild_semantic_index", "verification_sweep",
        "dedup_sweep", "summarize_monthly", "prune_archive",
    )
)
INTERNAL_ONLY_COMMANDS = RETIRED_MEMORY_COMMANDS | {"cmd.chat.teach.set_lock"}


def producer_failures(production: dict, bindings: dict, fixtures: dict, touch: dict):
    """Inspect producer contracts, not handler availability or legacy identity enums."""
    failures = []
    entries = production["entries"]
    for command in RETIRED_MEMORY_COMMANDS:
        rows = [row for row in entries.values() if row.get("ui_command_id") == command]
        if len(rows) != 1:
            failures.append({"code": "quiet_memory_internal_owner", "command": command})
    for key, row in entries.items():
        if row.get("ui_command_id") in INTERNAL_ONLY_COMMANDS:
            if row.get("ui_disposition") != "internal_support_only":
                failures.append({"code": "quiet_memory_live_production", "row": key})

    def walk(value, path):
        if isinstance(value, dict):
            if value.get("command_id") == "cmd.chat.teach.open_memory" and "gui_consumers" in value:
                if set(value["gui_consumers"]) != {"wand", "chat_header", "memory_save_receipt"}:
                    failures.append({"code": "quiet_memory_open_producers", "path": path})
            if value.get("command_id") == "cmd.review.send_findings_to_agent" and "gui_consumers" in value:
                if set(value["gui_consumers"]) != {"review_card", "review_panel"}:
                    failures.append({"code": "quiet_memory_review_producers", "path": path})
            if value.get("command_id") in INTERNAL_ONLY_COMMANDS and "gui_consumers" in value:
                if value.get("ui_disposition") != "internal_support_only" or value["gui_consumers"]:
                    failures.append({"code": "quiet_memory_live_binding", "path": path,
                                     "command": value["command_id"]})
            for key, child in value.items():
                walk(child, path + "/" + key)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, path + "/" + str(index))

    walk(bindings, "bindings")
    walk(fixtures, "fixtures")
    profiles = set()
    for profile in touch["profiles"]:
        commands = set(profile.get("command_ids", []))
        if "cmd.chat.teach.open_memory" in commands:
            if set(profile.get("gui_triggers", [])) != {"wand", "chat_header", "memory_save_receipt"}:
                failures.append({"code": "quiet_memory_open_touch_producers",
                                 "profile": profile["profile_id"]})
        if commands & INTERNAL_ONLY_COMMANDS:
            profiles.add(profile["profile_id"])
            if (commands - INTERNAL_ONLY_COMMANDS or profile.get("gui_triggers")
                    or profile.get("ui_disposition") != "internal_support_only"):
                failures.append({"code": "quiet_memory_live_touch_profile",
                                 "profile": profile["profile_id"]})
    for row in touch["rows"]:
        if row[3] in INTERNAL_ONLY_COMMANDS and row[1] not in profiles:
            failures.append({"code": "quiet_memory_missing_internal_profile", "row": row[0]})
    return failures


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
    def read(name):
        return json.loads((root / "Plans" / name).read_text())
    failures.extend(producer_failures(
        read("Wiring_Matrix.production.json"), read("projects_refresh_command_bindings.json"),
        read("projects_refresh_command_bindings.fixtures.json"), read("touch_closure.json"),
    ))
    return failures, {"quiet_memory_cases": len(cases),
                      "quiet_memory_retired_commands": len(RETIRED_MEMORY_COMMANDS)}
