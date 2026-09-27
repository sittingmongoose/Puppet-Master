"""BRS-030 semantic checks for cmd.backup.verify depth/plan/admission joins.

JSON Schema enforces the structural branches (one selection form, snapshot and
admission bindings, requested/performed mapping, drill-command restriction,
admission/receipt coherence). This script checks what schema cannot: owner-side
resolution of the verification admission bundle, the verification plan
registry, and request/receipt joins against them.

Deterministic expectations: a case in the `valid` fixture list carries an
optional case-level `semantic_expect` giving the exact set of violation codes
the joins must produce for that case (a string or a list of strings). Cases
without the field must produce no violations. The central contract gate
ignores the field; only this script evaluates it.

Violation codes:
  admission_unknown, wrong_backup, substituted_snapshot, currentness_mismatch,
  permission_mismatch, stale_plan, plan_revision_mismatch, depth_mismatch,
  scope_mismatch, cost_mismatch, manifest_mismatch, expired_admission,
  admission_invalid.

No runtime, provider, storage, or network operation is performed here.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_REL = Path("Plans/backup_restore_system_contracts.schema.json")
FIXTURES_REL = Path("Plans/backup_restore_system_contract_fixtures.json")

DEPTH_TO_SCOPE = {
    "structural": "structural",
    "sampled_data": "sampled_data_read",
    "full_data": "full_data_read",
}
DEPTH_TO_READ_SCOPE = {
    "structural": "manifest_metadata_only",
    "sampled_data": "sampled_object_bytes",
    "full_data": "full_object_bytes",
}
EXPECTED_COMMAND_COUNT = 41
VERIFY_DEFINITIONS = {
    "backup_restore_command_request",
    "backup_verification_receipt",
    "backup_verification_admission",
}


def load_json(rel: Path) -> dict:
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def parse_timestamp(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00" if value.endswith("Z") else value)
    except ValueError:
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return None
    return parsed.astimezone(timezone.utc)


def expected_violations(case: dict) -> set[str]:
    expect = case.get("semantic_expect", [])
    if isinstance(expect, str):
        return {expect}
    if isinstance(expect, list) and all(isinstance(code, str) for code in expect):
        return set(expect)
    raise ValueError(f"invalid_semantic_expect:{case.get('name')}")


def plan_registries(fixtures: dict) -> tuple[dict[str, dict[int, dict]], dict[str, dict]]:
    plans: dict[str, dict[int, dict]] = {}
    admissions: dict[str, dict] = {}
    for case in fixtures["valid"]:
        value = case.get("value", {})
        if case.get("definition") == "backup_verification_plan":
            plans.setdefault(value["verification_plan_id"], {})[value["plan_revision"]] = value
        elif case.get("definition") == "backup_verification_admission":
            admissions[value["verification_admission_id"]] = value
    return plans, admissions


def plan_currency(plan_id: Any, revision: Any, sha: Any, plans: dict[str, dict[int, dict]]) -> bool:
    revisions = plans.get(plan_id, {})
    if not revisions or not isinstance(revision, int):
        return False
    current = max(revisions)
    return revision == current and sha == revisions[current].get("plan_currentness_sha256")


def admission_violations(value: dict) -> set[str]:
    violations: set[str] = set()
    issued = parse_timestamp(value.get("issued_at_utc"))
    expires = parse_timestamp(value.get("expires_at_utc"))
    if issued is None or expires is None or not issued < expires:
        violations.add("admission_invalid")
    if DEPTH_TO_READ_SCOPE.get(value.get("admitted_depth")) != value.get("admitted_read_scope"):
        violations.add("scope_mismatch")
    if (value.get("admitted_plan_ref") is None) != (value.get("admitted_plan_revision") is None):
        violations.add("plan_revision_mismatch")
    return violations


def request_violations(
    value: dict, plans: dict[str, dict[int, dict]], admissions: dict[str, dict]
) -> set[str]:
    violations: set[str] = set()
    has_depth = "verification_depth" in value
    plan_fields = (
        "verification_plan_ref",
        "verification_plan_revision",
        "verification_plan_currentness_sha256",
    )
    has_plan = any(field in value for field in plan_fields)
    if has_depth == has_plan:
        violations.add("depth_mismatch")
    if "snapshot_id" not in value or "verification_admission_ref" not in value:
        violations.add("admission_unknown")
        return violations
    admission = admissions.get(value.get("verification_admission_ref"))
    if admission is None:
        violations.add("admission_unknown")
        return violations
    if value.get("backup_id") != admission.get("backup_id"):
        violations.add("wrong_backup")
    if value.get("snapshot_id") != admission.get("snapshot_id"):
        violations.add("substituted_snapshot")
    if (
        value.get("expected_currentness_ref") != admission.get("target_currentness_ref")
        or value.get("expected_currentness_sha256") != admission.get("target_currentness_sha256")
    ):
        violations.add("currentness_mismatch")
    if value.get("permission_snapshot_ref") != admission.get("permission_snapshot_ref"):
        violations.add("permission_mismatch")
    if has_plan and not has_depth:
        current = plan_currency(
            value.get("verification_plan_ref"),
            value.get("verification_plan_revision"),
            value.get("verification_plan_currentness_sha256"),
            plans,
        )
        if not current:
            violations.add("stale_plan")
        if (
            value.get("verification_plan_ref") != admission.get("admitted_plan_ref")
            or value.get("verification_plan_revision") != admission.get("admitted_plan_revision")
        ):
            violations.add("plan_revision_mismatch")
        if current:
            plan = plans[value["verification_plan_ref"]][value["verification_plan_revision"]]
            if plan.get("resolves_depth") != admission.get("admitted_depth"):
                violations.add("depth_mismatch")
            if plan.get("read_scope") != admission.get("admitted_read_scope"):
                violations.add("scope_mismatch")
            if plan.get("cost_class") != admission.get("admitted_cost_class"):
                violations.add("cost_mismatch")
    elif has_depth and not has_plan:
        if admission.get("admitted_plan_ref") is not None:
            violations.add("plan_revision_mismatch")
        if value.get("verification_depth") != admission.get("admitted_depth"):
            violations.add("depth_mismatch")
        if DEPTH_TO_READ_SCOPE.get(value.get("verification_depth")) != admission.get("admitted_read_scope"):
            violations.add("scope_mismatch")
    return violations


def receipt_violations(
    value: dict, plans: dict[str, dict[int, dict]], admissions: dict[str, dict]
) -> set[str]:
    violations: set[str] = set()
    requested = value.get("requested_verification_depth")
    performed = value.get("verification_scope")
    if value.get("status") == "passed" and performed in DEPTH_TO_SCOPE.values():
        expected_depth = next(depth for depth, scope in DEPTH_TO_SCOPE.items() if scope == performed)
        if requested != expected_depth:
            violations.add("depth_mismatch")
    if performed == "isolated_restore_drill":
        if value.get("command_id") != "cmd.backup.test_restore":
            violations.add("depth_mismatch")
        return violations
    if "snapshot_id" not in value:
        violations.add("substituted_snapshot")
    admission = admissions.get(value.get("approved_verification_admission_ref"))
    if admission is None:
        violations.add("admission_unknown")
        return violations
    if value.get("backup_id") != admission.get("backup_id"):
        violations.add("wrong_backup")
    if value.get("snapshot_id") != admission.get("snapshot_id"):
        violations.add("substituted_snapshot")
    if value.get("manifest_id") != admission.get("manifest_id"):
        violations.add("manifest_mismatch")
    if requested != admission.get("admitted_depth"):
        violations.add("depth_mismatch")
    if DEPTH_TO_READ_SCOPE.get(requested) != admission.get("admitted_read_scope"):
        violations.add("scope_mismatch")
    if value.get("approved_cost_class") != admission.get("admitted_cost_class"):
        violations.add("cost_mismatch")
    if (
        value.get("resolved_verification_plan_ref") != admission.get("admitted_plan_ref")
        or value.get("resolved_verification_plan_revision") != admission.get("admitted_plan_revision")
    ):
        violations.add("plan_revision_mismatch")
    started = parse_timestamp(value.get("started_at_utc"))
    completed = parse_timestamp(value.get("completed_at_utc"))
    issued = parse_timestamp(admission.get("issued_at_utc"))
    expires = parse_timestamp(admission.get("expires_at_utc"))
    if (
        started is None
        or completed is None
        or issued is None
        or expires is None
        or not issued <= started <= completed < expires
    ):
        violations.add("expired_admission")
    return violations


def check(fixtures: dict, schema: dict) -> list[str]:
    failures: list[str] = []
    plans, admissions = plan_registries(fixtures)
    if not plans:
        failures.append("verification_plan_registry_empty")
    if not admissions:
        failures.append("verification_admission_registry_empty")

    for case in fixtures["valid"]:
        definition = case.get("definition")
        if definition not in VERIFY_DEFINITIONS:
            continue
        value = case.get("value", {})
        if definition == "backup_restore_command_request" and value.get("command_id") != "cmd.backup.verify":
            continue
        try:
            expected = expected_violations(case)
        except ValueError as exc:
            failures.append(str(exc))
            continue
        if definition == "backup_restore_command_request":
            actual = request_violations(value, plans, admissions)
        elif definition == "backup_verification_receipt":
            actual = receipt_violations(value, plans, admissions)
        else:
            actual = admission_violations(value)
        if actual != expected:
            failures.append(
                f"{case['name']}: expected={sorted(expected) or ['current']} actual={sorted(actual) or ['current']}"
            )

    try:
        command_ids = schema["$defs"]["backup_restore_command_id"]["enum"]
    except KeyError:
        failures.append("schema_backup_restore_command_id_missing")
    else:
        if len(command_ids) != EXPECTED_COMMAND_COUNT or len(set(command_ids)) != EXPECTED_COMMAND_COUNT:
            failures.append("command_id_count_changed")
        if "cmd.backup.verify" not in command_ids:
            failures.append("cmd_backup_verify_missing")
    try:
        error_codes = schema["$defs"]["backup_restore_command_error"]["properties"]["error_code"]["enum"]
    except KeyError:
        failures.append("schema_command_error_codes_missing")
    else:
        for code in ("verification_plan_stale", "verification_target_substituted"):
            if code not in error_codes:
                failures.append(f"error_code_missing_{code}")
    policy = schema["$defs"]["backup_policy"]["properties"].get("verification_policy", {})
    if set(policy.get("enum", [])) != {"required", "best_effort_with_unverified_terminal"}:
        failures.append("verification_policy_not_terminal_handling_only")
    return sorted(set(failures))


def main(argv: list[str]) -> int:
    schema = load_json(SCHEMA_REL)
    fixtures = load_json(FIXTURES_REL)
    failures = check(fixtures, schema)
    if "--json" in argv:
        print(json.dumps({"failures": failures, "failure_count": len(failures)}, indent=2))
    else:
        if failures:
            print("pm_backup_verify_depth: FAIL")
            for failure in failures:
                print(f"  - {failure}")
        else:
            print("pm_backup_verify_depth: PASS")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
