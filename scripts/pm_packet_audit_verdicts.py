"""Shared, source-identity-based coverage for packet suite verdicts.

The combined Onboarding/Doctor packet has one case suite but three product
verdicts. Its explicit product areas select the respective verdict; cross-cutting
areas constrain all three conservatively. No result-row label can narrow scope.
This validates supplied verdicts; it never manufactures review judgments.
"""

from __future__ import annotations

from typing import Any


PRODUCT_AREAS = {"onboarding": "onboarding", "tour": "guided_tour", "doctor": "doctor"}
SHARED_AREAS = {"shared", "impact", "testing", "performance", "remote_access", "server_discovery"}
PRODUCT_VERDICTS = set(PRODUCT_AREAS.values())
COMBINED_SUITE = "onboarding_doctor"
COMBINED_VERDICT = "onboarding_doctor_overall"


def suite_case_scopes(manifest: dict[str, Any]) -> tuple[dict[str, set[str]], list[str]]:
    """Resolve every manifest case to its required verdicts, failing closed."""
    failures: list[str] = []
    required = manifest.get("required_suite_verdicts", [])
    if not isinstance(required, list) or any(not isinstance(item, str) or not item for item in required):
        return {}, ["suite scope: required_suite_verdicts must be non-empty strings"]
    scopes: dict[str, set[str]] = {suite: set() for suite in required}
    groups = manifest.get("groups", [])
    if not isinstance(groups, list):
        return scopes, ["suite scope: manifest groups must be an array"]
    for group in groups:
        if not isinstance(group, dict) or not isinstance(group.get("cases"), list):
            failures.append("suite scope: malformed manifest group")
            continue
        suite = group.get("suite")
        for case in group["cases"]:
            if not isinstance(case, dict) or not case.get("case_id") or not group.get("group_id"):
                failures.append("suite scope: case identity is missing")
                continue
            ref = f"{group['group_id']}/{case['case_id']}"
            targets = {"overall"}
            if suite == COMBINED_SUITE:
                targets.add(COMBINED_VERDICT)
                metadata = case.get("metadata", {})
                area = metadata.get("area") if isinstance(metadata, dict) else None
                if isinstance(area, str) and area in PRODUCT_AREAS:
                    targets.add(PRODUCT_AREAS[area])
                elif isinstance(area, str) and area in SHARED_AREAS:
                    targets.update(PRODUCT_VERDICTS)
                else:
                    failures.append(f"suite scope: {ref} has unknown Onboarding/Doctor area {area!r}")
            elif isinstance(suite, str):
                targets.add(suite)
            else:
                failures.append(f"suite scope: {ref} has no source suite")
            for target in targets:
                if target not in scopes:
                    failures.append(f"suite scope: {ref} has no required verdict {target!r}")
                else:
                    scopes[target].add(ref)
    for suite, refs in scopes.items():
        if not refs:
            failures.append(f"suite {suite}: verdict has no source case coverage")
    return scopes, failures


def validate_suite_case_verdicts(
    manifest: dict[str, Any], rows: list[dict[str, Any]], verdicts: dict[str, Any],
) -> list[str]:
    """Reject pass with missing, duplicate, mislabelled, or non-pass source rows."""
    scopes, failures = suite_case_scopes(manifest)
    expected_suites = {
        f"{group['group_id']}/{case['case_id']}": group["suite"]
        for group in manifest.get("groups", []) if isinstance(group, dict)
        for case in group.get("cases", []) if isinstance(case, dict)
        if "group_id" in group and "suite" in group and "case_id" in case
    }
    actual: dict[str, dict[str, Any]] = {}
    duplicate_refs: set[str] = set()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get("case_ref"), str):
            continue  # The report/result shape validator diagnoses malformed rows.
        ref = row["case_ref"]
        if ref in actual:
            duplicate_refs.add(ref)
        actual[ref] = row
    for suite, item in verdicts.items():
        if not isinstance(item, dict) or item.get("verdict") != "pass":
            continue
        relevant = scopes.get(suite, set())
        if not relevant:
            failures.append(f"suite {suite}: pass requires nonempty source case coverage")
            continue
        missing = relevant - actual.keys()
        if missing:
            failures.append(f"suite {suite}: pass with {len(missing)} missing source case results")
        if relevant & duplicate_refs:
            failures.append(f"suite {suite}: pass with duplicate source case results")
        present = relevant & actual.keys()
        if any(actual[ref].get("suite") != expected_suites[ref] for ref in present):
            failures.append(f"suite {suite}: pass with source suite identity drift")
        if any(actual[ref].get("status") not in {"pass", "not_applicable"} for ref in present):
            failures.append(f"suite {suite}: pass with incomplete/failing source case results")
    return failures
