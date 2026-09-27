#!/usr/bin/env python3
"""Focused static platform assurance contract checks; never native execution proof."""

from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timedelta
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]


def load(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text())


def errors_for_definition(schema: dict, definition: str, value: dict, *, store: dict | None = None) -> list[str]:
    wrapper = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": schema["$id"],
        "$defs": schema["$defs"],
        "$ref": f"#/$defs/{definition}",
    }
    registry = Registry()
    for uri, external_schema in (store or {}).items():
        registry = registry.with_resource(uri, Resource.from_contents(external_schema))
    return [error.message for error in Draft202012Validator(wrapper, registry=registry).iter_errors(value)]


def assurance_case_valid(case: dict, handoff: dict, testing: dict, shared: dict) -> tuple[bool, list[str]]:
    issues: list[str] = []
    for name, value, schema, definition in (
        ("requirement", case["requirement"], handoff, "test_assurance_requirement"),
        ("capability", case["capability"], handoff, "test_target_proof_capability"),
        ("result", case["result"], handoff, "test_assurance_result"),
        ("selection", case["selection"], testing, "EvidenceSelection"),
    ):
        store = {shared["$id"]: shared} if name == "selection" else None
        issues += [f"{name}: {message}" for message in errors_for_definition(schema, definition, value, store=store)]

    requirement, capability, result, selection = (case[key] for key in ("requirement", "capability", "result", "selection"))
    apple = requirement["proof_kind"] in {"genuine_safari", "macos_ui_system", "apple_native_signing", "xcode_simulator"}
    actually_meets = (
        result["requirement_ref"] == requirement["requirement_id"]
        and result["actual_mode"] in requirement["accepted_actual_modes"]
        and result["actual_platform"] == requirement["target_platform"]
        and result["proof_kind"] == requirement["proof_kind"] == capability["proof_kind"]
        and result["capability_receipt_ref"] == capability["capability_receipt_ref"]
        and capability["available"]
        and (not apple or (capability["suitable_mac_host"] and result["actual_mode"] == "native_authoritative" and result["actual_platform"] == "macos" and bool(result.get("suitable_mac_proof_ref"))))
        and (requirement["proof_kind"] != "genuine_safari" or (result["browser_runtime"] == "safari" and capability.get("browser_runtime") == "safari"))
    )
    if result["requirement_met"] != actually_meets:
        issues.append("actual requirement comparison differs from declared result")
    if case["receipt_result"] == "pass" and not actually_meets:
        issues.append("passing receipt has insufficient actual assurance")
    if selection["actual_assurance_mode"] != result["actual_mode"] or selection["assurance_requirement_met"] != result["requirement_met"]:
        issues.append("evidence selection changes actual assurance or comparison")
    if selection["assurance_requirement_ref"] != result["requirement_ref"]:
        issues.append("evidence selection loses requirement identity")
    return not issues, issues


def check_wsl() -> list[str]:
    schema = load("Plans/wsl_execution_contracts.schema.json")
    pack = load("Plans/wsl_execution_contract_fixtures.json")
    failures: list[str] = []
    positives = {case["name"]: case for case in pack["valid"]}
    for case in pack["valid"]:
        errors = errors_for_definition(schema, case["definition"], case["value"])
        if errors:
            failures.append(f"WSL positive {case['name']} rejected: {errors[0]}")
    for case in pack["invalid"]:
        if case["base_valid"] not in positives:
            failures.append(f"WSL negative {case['name']} has no base")
            continue
        base = positives[case["base_valid"]]
        value = deepcopy(base["value"])
        for path, replacement in case["patch"].items():
            parent = value
            segments = path.split(".")
            for segment in segments[:-1]:
                parent = parent[segment]
            parent[segments[-1]] = replacement
        if not errors_for_definition(schema, case["definition"], value):
            failures.append(f"WSL negative {case['name']} accepted")
    required = {"attach_user_owned_compatible_distro", "install_pm_managed_signed_distro", "host_wsl_off_is_healthy"}
    if not required <= positives.keys():
        failures.append(f"WSL missing required positives: {sorted(required - positives.keys())}")
    return failures


def check_assurance_strategy_policy(handoff: dict, valid_requirement: dict) -> list[str]:
    strategy = {
        "strategy_id": "strategy:platform-policy",
        "source_plan_unit_ids": [], "test_cases": [], "required_capabilities": [],
        "gap_blockers": [], "test_level": "contract", "generated_test_ids": [],
        "browser_session_required": False, "visual_evidence_required": False,
        "oracles": [], "reused_test_ids": [], "platform_dependent": False,
    }
    issues: list[str] = []
    if errors_for_definition(handoff, "test_strategy", strategy):
        issues.append("non-platform strategy was forced to fabricate assurance")
    strategy["platform_dependent"] = True
    if not errors_for_definition(handoff, "test_strategy", strategy):
        issues.append("platform-dependent strategy accepted without required assurance")
    strategy["required_assurance"] = valid_requirement
    if errors_for_definition(handoff, "test_strategy", strategy):
        issues.append("platform-dependent strategy rejected valid assurance requirement")
    return issues


def _utc(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def schedule_transition_failures(advance: dict) -> list[str]:
    """Compare one typed before/after transition; no caller success flag is trusted."""
    issues: list[str] = []
    fresh_success = advance["check_execution_kind"] == "fresh_network_check" and advance["check_result_status"] in {"succeeded", "no_change"}
    reused = advance["check_execution_kind"] in {"cache_reuse", "coalesced_join", "not_executed"}
    offline = advance["failure_class"] == "offline"
    jitter = advance["jitter_applied_seconds"]
    backoff = advance["backoff_seconds_applied"]
    if isinstance(jitter, int) and not 0 <= jitter <= advance["policy_jitter_max_seconds"]:
        issues.append("sampled jitter exceeds current internal policy bound")
    if isinstance(backoff, int) and not 0 <= backoff <= advance["policy_backoff_max_seconds"]:
        issues.append("offline backoff exceeds current internal policy bound")
    if advance["successful_check_basis_advanced"] != fresh_success:
        issues.append("successful-check advancement differs from fresh settled success")
    if fresh_success:
        if not advance["jitter_sample_ref"]:
            issues.append("fresh successful check lacks a jitter sample receipt")
        if advance["prior_successful_check_receipt_ref"] == advance["check_operation_receipt_ref"]:
            issues.append("duplicate check receipt advanced again")
        if advance["resulting_successful_check_receipt_ref"] != advance["check_operation_receipt_ref"]:
            issues.append("successful-check receipt was not retained")
        if advance["resulting_successful_check_completed_at_utc"] != advance["check_result_completed_at_utc"]:
            issues.append("successful-check timestamp did not come from completed operation")
        interval, jitter = advance["cadence_interval_seconds"], advance["jitter_applied_seconds"]
        if not isinstance(interval, int) or not isinstance(jitter, int) or interval < 0 or jitter < 0:
            issues.append("successful check lacks nonnegative interval and sampled jitter")
        elif advance["resulting_next_cadence_due_at_utc"] is None or _utc(advance["resulting_next_cadence_due_at_utc"]) != _utc(advance["check_result_completed_at_utc"]) + timedelta(seconds=interval + jitter):
            issues.append("cadence due is not successful completion plus interval and jitter")
        if advance["resulting_next_offline_retry_at_utc"] is not None:
            issues.append("successful check retained offline retry")
        if advance["resulting_next_automatic_check_not_before_utc"] != advance["resulting_next_cadence_due_at_utc"]:
            issues.append("effective due differs from successful cadence due")
    else:
        for stem in ("successful_check_completed_at_utc", "successful_check_receipt_ref", "next_cadence_due_at_utc"):
            if advance[f"prior_{stem}"] != advance[f"resulting_{stem}"]:
                issues.append(f"non-successful check moved {stem}")
    if reused:
        if advance["jitter_sample_ref"] is not None:
            issues.append("cached or joined check sampled a new jitter")
        for stem in ("next_offline_retry_at_utc", "next_automatic_check_not_before_utc"):
            if advance[f"prior_{stem}"] != advance[f"resulting_{stem}"]:
                issues.append(f"cached or joined check moved {stem}")
        if advance["resulting_state_generation"] != advance["prior_state_generation"]:
            issues.append("cached or joined check mutated durable generation")
    elif advance["resulting_state_generation"] != advance["prior_state_generation"] + 1:
        issues.append("state mutation did not compare-and-advance one generation")
    if offline:
        if not advance["jitter_sample_ref"]:
            issues.append("offline retry lacks a jitter sample receipt")
        if advance["check_result_status"] != "failed" or advance["check_execution_kind"] != "fresh_network_check":
            issues.append("offline backoff lacks a fresh failed check")
        backoff, jitter = advance["backoff_seconds_applied"], advance["jitter_applied_seconds"]
        if not isinstance(backoff, int) or not isinstance(jitter, int) or backoff < 0 or jitter < 0:
            issues.append("offline retry lacks bounded backoff and sampled jitter")
        elif advance["resulting_next_offline_retry_at_utc"] is None or _utc(advance["resulting_next_offline_retry_at_utc"]) != _utc(advance["check_result_completed_at_utc"]) + timedelta(seconds=backoff + jitter):
            issues.append("offline retry is not failure completion plus backoff and jitter")
        if advance["resulting_next_automatic_check_not_before_utc"] != advance["resulting_next_offline_retry_at_utc"]:
            issues.append("effective retry differs from persisted offline retry")
    elif not fresh_success and not reused and advance["resulting_next_offline_retry_at_utc"] != advance["prior_next_offline_retry_at_utc"]:
        issues.append("non-offline failure changed offline retry")
    return issues


def schedule_state_link_failures(advance: dict, state: dict, side: str) -> list[str]:
    issues: list[str] = []
    for key in ("home_server_id", "application_id", "channel_id"):
        if advance[key] != state[key]:
            issues.append(f"wrong {key} for state")
    if advance["policy_snapshot_ref"] != state["policy_snapshot_ref"] or advance["expected_policy_generation"] != state["policy_generation"]:
        issues.append("transition used a stale or substituted internal policy")
    for state_key, suffix in (("state_generation", "state_generation"), ("last_successful_check_completed_at_utc", "successful_check_completed_at_utc"), ("last_successful_check_receipt_ref", "successful_check_receipt_ref"), ("next_cadence_due_at_utc", "next_cadence_due_at_utc"), ("next_offline_retry_at_utc", "next_offline_retry_at_utc"), ("next_automatic_check_not_before_utc", "next_automatic_check_not_before_utc")):
        if state[state_key] != advance[f"{side}_{suffix}"]:
            issues.append(f"{side} {suffix} differs from persisted state")
    return issues


def check_update_schedule() -> list[str]:
    schema = load("Plans/release_update_contracts.schema.json")
    pack = load("Plans/release_update_contract_fixtures.json")
    failures: list[str] = []
    scheduler_names = {"ApplicationUpdateCheckScheduleState", "ApplicationUpdateSchedulingAdvancement"}
    cases = {case["name"]: case for case in pack["valid"] if case["definition"] in scheduler_names}
    for case in cases.values():
        errors = errors_for_definition(schema, case["definition"], case["value"])
        if errors:
            failures.append(f"update positive {case['name']} rejected: {errors[0]}")
        if case["definition"] == "ApplicationUpdateSchedulingAdvancement":
            failures += [f"update {case['name']}: {issue}" for issue in schedule_transition_failures(case["value"])]
    for case in pack["invalid"]:
        if case["definition"] in scheduler_names and not errors_for_definition(schema, case["definition"], case["value"]):
            failures.append(f"update negative {case['name']} accepted by schema")
    pairings = (
        ("positive.scheduling.advancement.success_advances_basis", "positive.scheduling.state.successful_check_basis", "resulting"),
        ("positive.scheduling.advancement.offline_failure_retains_backoff", "positive.scheduling.state.offline_backoff_basis", "resulting"),
        ("positive.scheduling.advancement.manual_success_creates_basis", "positive.scheduling.state.never_checked_basis", "prior"),
        ("positive.scheduling.advancement.cache_reuse_preserves_basis", "positive.scheduling.state.successful_check_basis", "resulting"),
    )
    for advance_name, state_name, side in pairings:
        if advance_name not in cases or state_name not in cases:
            failures.append(f"missing scheduling pair: {advance_name} / {state_name}")
            continue
        advance, state = cases[advance_name]["value"], cases[state_name]["value"]
        failures += [f"{advance_name}: {issue}" for issue in schedule_state_link_failures(advance, state, side)]
    # Mutations prove the checker rejects races and substitutions independently
    # of fixture expected-valid labels or schema-only structural negatives.
    if "positive.scheduling.advancement.success_advances_basis" in cases:
        success = cases["positive.scheduling.advancement.success_advances_basis"]["value"]
        state = cases["positive.scheduling.state.successful_check_basis"]["value"]
        for label, patch in (
            ("duplicate_receipt", {"prior_successful_check_receipt_ref": success["check_operation_receipt_ref"]}),
            ("stale_generation", {"resulting_state_generation": success["prior_state_generation"]}),
            ("wrong_due_arithmetic", {"resulting_next_cadence_due_at_utc": "2026-09-27T09:47:32Z"}),
            ("cache_promoted_to_success", {"check_execution_kind": "cache_reuse"}),
            ("jitter_over_policy", {"jitter_applied_seconds": success["policy_jitter_max_seconds"] + 1}),
        ):
            mutated = {**success, **patch}
            if not schedule_transition_failures(mutated):
                failures.append(f"update generated negative {label} was accepted")
        for key, wrong in (("home_server_id", "server:other"), ("channel_id", "channel:canary")):
            mutated = {**success, key: wrong}
            if not schedule_state_link_failures(mutated, state, "resulting"):
                failures.append(f"update generated wrong-{key} transition joined another state")
    if "positive.scheduling.advancement.offline_failure_retains_backoff" in cases:
        failed = cases["positive.scheduling.advancement.offline_failure_retains_backoff"]["value"]
        for label, patch in (
            ("failure_moves_success_time", {"resulting_successful_check_completed_at_utc": failed["check_result_completed_at_utc"]}),
            ("failure_moves_cadence_due", {"resulting_next_cadence_due_at_utc": "2026-09-27T04:17:44Z"}),
            ("failure_advances_basis", {"successful_check_basis_advanced": True}),
            ("backoff_over_policy", {"backoff_seconds_applied": failed["policy_backoff_max_seconds"] + 1}),
        ):
            mutated = {**failed, **patch}
            if not schedule_transition_failures(mutated):
                failures.append(f"update generated negative {label} was accepted")
    return failures


def check_all() -> list[str]:
    handoff = load("Plans/plans_to_code_handoff.schema.json")
    testing = load("Plans/testing_session_command_contracts.schema.json")
    shared = load("Plans/shared_runtime_command_contracts.schema.json")
    pack = load("Plans/platform_assurance_contract_fixtures.json")
    failures: list[str] = []
    names: set[str] = set()
    for case in pack["cases"]:
        if case["name"] in names:
            failures.append(f"duplicate case {case['name']}")
        names.add(case["name"])
        actual, issues = assurance_case_valid(case, handoff, testing, shared)
        if actual != case["expected_valid"]:
            failures.append(f"{case['name']}: expected_valid={case['expected_valid']} actual={actual}: {issues}")
    required_cases = {"genuine_safari_on_suitable_mac", "pm_browser_cannot_claim_safari", "cross_target_cannot_satisfy_native_windows", "unavailable_apple_runner_blocks", "virtualized_windows_explicitly_accepted", "selection_cannot_upgrade_result"}
    if not required_cases <= names:
        failures.append(f"missing required cases: {sorted(required_cases - names)}")
    if pack["cases"]:
        failures.extend(check_assurance_strategy_policy(handoff, pack["cases"][0]["requirement"]))
    # Generated counterexamples do not trust fixture expected_valid flags. The
    # host/target remain identical so an assurance-mode downgrade alone fails.
    positive = next((case for case in pack["cases"] if case["name"] == "genuine_safari_on_suitable_mac"), None)
    if positive is not None:
        for weaker_mode in ("compatibility", "cross_target", "simulated_or_mocked", "unavailable"):
            weakened = deepcopy(positive)
            weakened["result"]["actual_mode"] = weaker_mode
            weakened["selection"]["actual_assurance_mode"] = weaker_mode
            valid, _ = assurance_case_valid(weakened, handoff, testing, shared)
            if valid:
                failures.append(f"same-platform {weaker_mode} was promoted to native Safari proof")
        substituted = deepcopy(positive)
        substituted["result"]["browser_runtime"] = "pm_builtin_browser"
        valid, _ = assurance_case_valid(substituted, handoff, testing, shared)
        if valid:
            failures.append("PM browser was promoted to genuine Safari proof")
        wrong_requirement = deepcopy(positive)
        wrong_requirement["result"]["requirement_ref"] = "requirement:another-test"
        wrong_requirement["selection"]["assurance_requirement_ref"] = "requirement:another-test"
        valid, _ = assurance_case_valid(wrong_requirement, handoff, testing, shared)
        if valid:
            failures.append("a result was accepted against another test's assurance requirement")
    failures.extend(check_wsl())
    failures.extend(check_update_schedule())
    return failures


def main() -> int:
    failures = check_all()
    for failure in failures:
        print(f"FAIL {failure}")
    if failures:
        return 1
    print("PASS platform execution policy: WSL, assurance, and application update schedule cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
