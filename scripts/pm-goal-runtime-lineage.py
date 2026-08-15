#!/usr/bin/env python3
"""Validate durable Goal/Plan/thread/agent lineage contracts pre-build."""

from __future__ import annotations

import argparse
import copy
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans/goal_runtime_lineage.schema.json"
FIXTURE_PATH = ROOT / "Plans/goal_runtime_lineage_fixtures.json"
TERMINAL = {"completed", "failed", "cancelled", "recovery_required"}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def validator_for(schema: dict[str, Any], definition: str) -> Draft202012Validator:
    return Draft202012Validator(
        {**schema["$defs"][definition], "$defs": schema["$defs"]},
        format_checker=FormatChecker(),
    )


def record_failures(value: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    failures = [error.message for error in validator_for(schema, "goal_runtime_lineage_record").iter_errors(value)]
    if failures:
        return failures
    threads = value["threads"]
    agents = value["agents"]
    thread_ids = [item["thread_id"] for item in threads]
    agent_ids = [item["agent_id"] for item in agents]
    if len(thread_ids) != len(set(thread_ids)):
        failures.append("thread_id_not_unique")
    if len(agent_ids) != len(set(agent_ids)):
        failures.append("agent_id_not_unique")
    if value["primary_thread_id"] not in thread_ids:
        failures.append("primary_thread_missing_from_lineage")
    for agent in agents:
        if agent["thread_id"] not in thread_ids:
            failures.append("agent_thread_missing_from_lineage")
        if agent["owner_epoch"] > value["owner_epoch"]:
            failures.append("agent_owner_epoch_ahead_of_goal_owner_epoch")
    if timestamp(value["updated_at_utc"]) < timestamp(value["created_at_utc"]):
        failures.append("goal_updated_before_created")
    terminal_at = value["terminal_at_utc"]
    if value["state"] in TERMINAL and terminal_at is not None:
        if timestamp(terminal_at) < timestamp(value["updated_at_utc"]):
            failures.append("goal_terminal_before_updated")
    return failures


def transition_failures(value: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    failures = [error.message for error in validator_for(schema, "goal_runtime_lineage_transition").iter_errors(value)]
    if failures:
        return failures
    previous = value["previous"]
    current = value["current"]
    for key in ("project_id", "goal_id", "root_goal_id"):
        if current[key] != previous[key]:
            failures.append(f"immutable_{key}_changed")
    for key in ("lineage_epoch", "owner_epoch", "server_claim_epoch"):
        if current[key] < previous[key]:
            failures.append(f"{key}_regressed")
    if current["owner_id"] != previous["owner_id"] and current["owner_epoch"] <= previous["owner_epoch"]:
        failures.append("owner_changed_without_epoch_increment")
    if current["project_home_server_id"] != previous["project_home_server_id"] and current["server_claim_epoch"] <= previous["server_claim_epoch"]:
        failures.append("server_claim_changed_without_epoch_increment")
    return failures


def self_test() -> dict[str, Any]:
    schema = read_json(SCHEMA_PATH)
    fixtures = read_json(FIXTURE_PATH)
    Draft202012Validator.check_schema(schema)
    valid = fixtures["valid"][0]["value"]
    checks: dict[str, bool] = {
        fixtures["valid"][0]["name"]: not record_failures(valid, schema)
    }
    for fixture in fixtures["invalid"]:
        candidate = copy.deepcopy(valid)
        candidate.update(fixture["patch"])
        checks[fixture["name"]] = bool(record_failures(candidate, schema))
    good_next = copy.deepcopy(valid)
    good_next["lineage_epoch"] += 1
    good_next["owner_epoch"] += 1
    good_next["owner_id"] = "owner:agent:2"
    good_next["updated_at_utc"] = "2026-08-14T00:02:00Z"
    good_transition = {
        "schema_id": "pm.goal_runtime_lineage_transition.v1",
        "schema_version": "1.0.0",
        "previous": valid,
        "current": good_next,
    }
    checks["owner_handoff_with_epoch_increment"] = not transition_failures(good_transition, schema)
    bad_transition = copy.deepcopy(good_transition)
    bad_transition["current"]["owner_epoch"] = valid["owner_epoch"]
    checks["owner_handoff_without_epoch_increment_rejected"] = bool(transition_failures(bad_transition, schema))
    failures = sorted(name for name, passed in checks.items() if not passed)
    return {"checks": checks, "failures": failures, "status": "pass" if not failures else "fail"}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if not args.self_test:
        parser.error("--self-test is required")
    report = self_test()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
