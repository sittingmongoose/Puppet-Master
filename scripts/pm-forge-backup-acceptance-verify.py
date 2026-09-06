#!/usr/bin/env python3
"""Validate exact Forge/Backup/tsnet acceptance custody without executing it."""

from __future__ import annotations

import argparse
from datetime import datetime
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "Plans/forge_backup_tsnet_acceptance.json"
SCHEMA_PATH = ROOT / "Plans/forge_backup_tsnet_acceptance.schema.json"
PACKET_DIRNAME = "PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01"

SOURCE_HASHES = {
    "acceptance_scenarios": "51fcea0739ddbb9eb7a2357e15beab8250b25b4b02f3d295082622e01a799e3f",
    "requirement_test_mapping": "3ef66fe1320e7c17cb9f6fb20cb44b537933ab270d7b05780f23fc5c4ad2027b",
    "requirements": "baff2a614eb4ac96543c6a3e0c3ad5f6e3961f7315557147f8bc82f3575e50cd",
    "live_requirement_disposition": "9ac5c5678ef83ec85c954d28cec7a1299dddc9c12ae06ffbb3c0d1766516c2f8",
}
BODY_HASHES = {
    "requirements": "bac7ccf3a5200feb196dc6e10d8c6fb0d2a28d34d62f8ee10812248eb8acae44",
    "scenarios": "e28e818db3449bc1c8b073a3499c60ade5cef927c18ee2b9578592473e41b0e7",
    "requirement_joins": "2ede616bd0e0c8b67c3c81a6cb2832c2b2d44f65fab64a477f3c7863763a7d11",
}
EXPECTED_BASE_RANGES = {
    "TSN": 20, "AUTH": 8, "SCM": 9, "FORGE": 9, "GUI": 8,
    "MAT": 4, "SAUTH": 4, "BKP": 10, "CLOUD": 8, "KEY": 7,
    "REST": 9, "AUTO": 6, "BGUI": 5, "TSX": 5, "CMDX": 4,
    "OWN": 5, "TEST": 3, "PROC": 3,
}
# The packet appends these later additions; regrouping them changes source order.
EXPECTED_ADDITIONS = ["BKP-011", "SAUTH-005", "MAT-005", "BKP-012", "OWN-006"]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def body_hash(value: Any) -> str:
    body = json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(body.encode("utf-8")).hexdigest()


def expected_requirement_ids() -> list[str]:
    return [
        f"{prefix}-{number:03d}"
        for prefix, count in EXPECTED_BASE_RANGES.items()
        for number in range(1, count + 1)
    ] + EXPECTED_ADDITIONS


def add(failures: list[dict[str, Any]], code: str, detail: str, **extra: Any) -> None:
    failures.append({"code": code, "detail": detail, **extra})


def validate_schema(data: Any, schema: Any, failures: list[dict[str, Any]]) -> None:
    try:
        import jsonschema
    except ImportError:
        add(failures, "jsonschema_unavailable", "Draft 2020-12 validation dependency is unavailable")
        return
    try:
        jsonschema.Draft202012Validator.check_schema(schema)
    except Exception as error:  # pragma: no cover - fail-closed diagnostic
        add(failures, "schema_meta_invalid", str(error))
        return
    validator = jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker())
    for error in sorted(validator.iter_errors(data), key=lambda item: str(list(item.absolute_path))):
        path = "/".join(str(item) for item in error.absolute_path) or "$"
        add(failures, "instance_schema_invalid", error.message, path=path)
    # Minimal installations omit jsonschema's optional RFC3339 dependency and
    # silently accept unknown formats. Keep this required timestamp fail-closed.
    timestamp = data.get("created_at") if isinstance(data, dict) else None
    try:
        if not isinstance(timestamp, str) or re.fullmatch(
            r"\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})",
            timestamp,
        ) is None:
            raise ValueError("created_at must be an RFC3339 timestamp with timezone")
        datetime.fromisoformat(timestamp.upper().replace("Z", "+00:00"))
    except ValueError as error:
        add(failures, "instance_schema_invalid", str(error), path="created_at")


def validate_owner_ref(ref: Any, failures: list[dict[str, Any]]) -> None:
    if not isinstance(ref, str) or not re.fullmatch(r"Plans/[^#]+\.md#[A-Z0-9]+-[0-9]{3}", ref):
        add(failures, "owner_ref_invalid", "Owner reference is not a Plans path plus PlanUnit ID", ref=ref)
        return
    relative, plan_unit_id = ref.split("#", 1)
    path = (ROOT / relative).resolve()
    if not path.is_relative_to((ROOT / "Plans").resolve()):
        add(failures, "owner_ref_outside_plans", "Owner reference escapes canonical Plans", ref=ref)
        return
    if not path.is_file():
        add(failures, "owner_doc_missing", "Owner document does not exist", ref=ref)
        return
    text = path.read_text(encoding="utf-8")
    if re.search(rf"(?m)^plan_unit_id:\s*{re.escape(plan_unit_id)}\s*$", text) is None:
        add(failures, "owner_plan_unit_missing", "Referenced PlanUnit is not declared in owner document", ref=ref)


def source_paths(source_root: Path) -> dict[str, Path]:
    packet = source_root / PACKET_DIRNAME
    integration_root = source_root
    if source_root.name == PACKET_DIRNAME:
        packet = source_root
        integration_root = source_root.parent
    return {
        "acceptance_scenarios": packet / "machine/acceptance_scenarios.json",
        "requirement_test_mapping": packet / "machine/requirement_test_mapping.json",
        "requirements": packet / "machine/requirements.json",
        "live_requirement_disposition": integration_root / "agent_reports/live_requirement_disposition.json",
    }


def compare_optional_source(data: dict[str, Any], source_root: Path,
                            failures: list[dict[str, Any]]) -> None:
    paths = source_paths(source_root.resolve())
    loaded: dict[str, Any] = {}
    for name, path in paths.items():
        if not path.is_file():
            add(failures, "optional_source_missing", "Requested source comparison file is absent", source=name, path=str(path))
            continue
        actual_hash = file_hash(path)
        if actual_hash != SOURCE_HASHES[name]:
            add(failures, "optional_source_hash_mismatch", "Packet/source report bytes differ from the pinned source", source=name, expected=SOURCE_HASHES[name], actual=actual_hash)
        try:
            loaded[name] = load_json(path)
        except Exception as error:
            add(failures, "optional_source_json_invalid", str(error), source=name)
    if "acceptance_scenarios" in loaded and loaded["acceptance_scenarios"].get("scenarios") != data.get("scenarios"):
        add(failures, "optional_scenario_body_mismatch", "Canonical scenarios differ from the packet source")
    if "requirements" in loaded and loaded["requirements"].get("requirements") != data.get("requirements"):
        add(failures, "optional_requirement_body_mismatch", "Canonical requirements differ from the packet source")
    if "requirement_test_mapping" in loaded and "live_requirement_disposition" in loaded:
        dispositions = {
            row.get("source_qualified_id", "").rsplit("::", 1)[-1]: row
            for row in loaded["live_requirement_disposition"].get("rows", [])
        }
        expected_joins = []
        for mapping in loaded["requirement_test_mapping"].get("rows", []):
            disposition = dispositions.get(mapping.get("requirement_id"))
            if disposition is None:
                continue
            expected_joins.append({
                **mapping,
                "source_qualified_id": disposition.get("source_qualified_id"),
                "current_owner_plan_units": disposition.get("current_owner_plan_units"),
                "live_disposition": disposition.get("disposition"),
                "residual_evidence_boundary": disposition.get("residual_evidence_boundary"),
            })
        if expected_joins != data.get("requirement_joins"):
            add(failures, "optional_requirement_join_mismatch", "Canonical joins differ from packet mappings plus reviewed live dispositions")


def validate(data: dict[str, Any], schema: dict[str, Any], source_root: Path | None) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    validate_schema(data, schema, failures)

    for name, expected in SOURCE_HASHES.items():
        actual = data.get("source_files", {}).get(name, {}).get("sha256")
        if actual != expected:
            add(failures, "declared_source_hash_mismatch", "Declared source hash is not pinned", source=name, expected=expected, actual=actual)
    for name, expected in BODY_HASHES.items():
        actual = body_hash(data.get(name))
        declared = data.get("integrity", {}).get(f"{name}_body_sha256")
        if actual != expected or declared != expected:
            add(failures, "canonical_body_hash_mismatch", "Preserved canonical body changed", body=name, expected=expected, actual=actual, declared=declared)

    scenarios = data.get("scenarios", [])
    requirements = data.get("requirements", [])
    joins = data.get("requirement_joins", [])
    scenario_ids = [row.get("scenario_id") for row in scenarios if isinstance(row, dict)]
    requirement_ids = [row.get("id") for row in requirements if isinstance(row, dict)]
    join_ids = [row.get("requirement_id") for row in joins if isinstance(row, dict)]
    expected_scenarios = [f"E2E-{number:03d}" for number in range(1, 68)]
    expected_requirements = expected_requirement_ids()
    if scenario_ids != expected_scenarios:
        add(failures, "scenario_id_set_or_order_mismatch", "Scenario IDs must be exactly ordered E2E-001 through E2E-067")
    if len(set(scenario_ids)) != len(scenario_ids):
        add(failures, "duplicate_scenario_id", "Scenario IDs are not unique")
    if requirement_ids != expected_requirements:
        add(failures, "requirement_id_set_or_order_mismatch", "Requirement IDs differ from the exact 132-row packet order")
    if join_ids != expected_requirements or len(set(join_ids)) != len(join_ids):
        add(failures, "requirement_join_set_or_order_mismatch", "Requirement joins must cover each exact requirement once in source order")

    requirements_by_id = {row.get("id"): row for row in requirements if isinstance(row, dict)}
    joins_by_id = {row.get("requirement_id"): row for row in joins if isinstance(row, dict)}
    scenario_edge_set: set[tuple[str, str]] = set()
    evidence_count = 0
    for scenario in scenarios:
        if not isinstance(scenario, dict):
            continue
        scenario_id = scenario.get("scenario_id")
        evidence = scenario.get("evidence")
        if scenario.get("execution_status") != "NOT_RUN" or evidence != []:
            add(failures, "false_execution_claim", "Scenario must remain NOT_RUN with empty evidence", scenario_id=scenario_id)
        if isinstance(evidence, list):
            evidence_count += len(evidence)
        for requirement_id in scenario.get("requirement_refs", []):
            if requirement_id not in requirements_by_id:
                add(failures, "scenario_requirement_missing", "Scenario requirement is absent from retained requirements", scenario_id=scenario_id, requirement_id=requirement_id)
            scenario_edge_set.add((requirement_id, scenario_id))

    join_edge_set: set[tuple[str, str]] = set()
    empty_join_count = 0
    owner_refs: set[str] = set()
    for join in joins:
        if not isinstance(join, dict):
            continue
        requirement_id = join.get("requirement_id")
        requirement = requirements_by_id.get(requirement_id)
        if requirement and join.get("specification_acceptance") != requirement.get("acceptance"):
            add(failures, "acceptance_text_mismatch", "Join does not preserve the requirement acceptance text", requirement_id=requirement_id)
        if join.get("runtime_status") != "NOT_RUN":
            add(failures, "false_requirement_execution_claim", "Requirement join must remain NOT_RUN", requirement_id=requirement_id)
        scenario_refs = join.get("scenario_ids", [])
        if scenario_refs == []:
            empty_join_count += 1
        if not join.get("additional_test_owner_requirement"):
            add(failures, "additional_owner_test_obligation_missing", "Requirement join dropped its additional owner-test obligation", requirement_id=requirement_id)
        for scenario_id in scenario_refs:
            if scenario_id not in set(scenario_ids):
                add(failures, "join_scenario_missing", "Join references an unknown scenario", requirement_id=requirement_id, scenario_id=scenario_id)
            join_edge_set.add((requirement_id, scenario_id))
        for ref in join.get("current_owner_plan_units", []):
            owner_refs.add(ref)
    if join_edge_set != scenario_edge_set:
        add(failures, "bidirectional_join_mismatch", "Scenario requirement_refs and requirement scenario_ids are not exact reciprocals", scenario_only=len(scenario_edge_set - join_edge_set), join_only=len(join_edge_set - scenario_edge_set))
    for ref in sorted(owner_refs):
        validate_owner_ref(ref, failures)

    counts = data.get("counts", {})
    actual_counts = {
        "scenario_count": len(scenarios),
        "requirement_count": len(requirements),
        "requirement_join_count": len(joins),
        "scenario_join_edge_count": len(join_edge_set),
        "empty_scenario_join_count": empty_join_count,
    }
    for name, actual in actual_counts.items():
        if counts.get(name) != actual:
            add(failures, "declared_count_mismatch", "Declared count differs from content", count=name, declared=counts.get(name), actual=actual)
    if source_root is not None:
        compare_optional_source(data, source_root, failures)

    return {
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "metrics": {
            **actual_counts,
            "unique_scenario_count": len(set(scenario_ids)),
            "unique_requirement_count": len(set(requirement_ids)),
            "unique_requirement_join_count": len(set(join_ids)),
            "owner_plan_unit_ref_count": len(owner_refs),
            "executed_scenario_count": sum(row.get("execution_status") != "NOT_RUN" for row in scenarios if isinstance(row, dict)),
            "scenario_evidence_count": evidence_count,
            "static_custody_only": data.get("execution_state", {}).get("static_custody_only") is True,
            "all_scenarios_not_run": all(row.get("execution_status") == "NOT_RUN" for row in scenarios if isinstance(row, dict)),
            "all_requirement_joins_not_run": all(row.get("runtime_status") == "NOT_RUN" for row in joins if isinstance(row, dict)),
            "optional_source_comparison": "checked" if source_root is not None else "not_requested",
        },
        "claim_boundary": "A pass proves only exact static custody, joins, and owner-reference resolution. It does not prove scenario execution or product behavior."
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, help="Optionally compare with the retained integration root or packet directory")
    args = parser.parse_args()
    try:
        data = load_json(DATA_PATH)
        schema = load_json(SCHEMA_PATH)
        result = validate(data, schema, args.source_root)
    except Exception as error:  # fail closed and preserve machine-readable output
        result = {
            "status": "fail",
            "failures": [{"code": "validator_exception", "detail": str(error)}],
            "metrics": {"static_custody_only": True, "optional_source_comparison": "not_completed"},
            "claim_boundary": "Validation did not complete; no custody or execution claim is available."
        }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
