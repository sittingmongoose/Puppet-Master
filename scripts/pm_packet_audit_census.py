"""Versioned source-census validation, never implementation review judgments.

V1 workbooks retain their historical fixed denominator. V2 snapshots describe
the exact row-by-dimension product and packet groups; current-source checks
additionally compare them with a freshly extracted custody manifest.
"""

from __future__ import annotations

import hashlib
import json
import re
from typing import Any

LEGACY_SCHEMA = "pm.integration_packet_audit_manifest.v1"
CURRENT_SCHEMA = "pm.integration_packet_audit_manifest.v2"
LEGACY_CASE_COUNT = 8_252
TOUCH_GROUP = "touch_closure_dimensions"


def _hash_values(values) -> str:
    return hashlib.sha256("\n".join(sorted(values)).encode()).hexdigest()


def _names(value: Any) -> bool:
    return (isinstance(value, list) and bool(value)
            and all(isinstance(item, str) and item.strip() for item in value)
            and len(value) == len(set(value)))


def _sha(value: Any) -> bool:
    return isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value) is not None


def build_census_contract(groups: list[dict[str, Any]], spec_sha256: str) -> dict[str, Any]:
    """Summarize already extracted cases; the validator checks their product."""
    touch = next(group for group in groups if group["group_id"] == TOUCH_GROUP)
    source = touch["source"]
    packet_groups = [{
        "group_id": group["group_id"],
        "suite": group["suite"],
        "case_count": len(group["cases"]),
        "identifier_set_sha256": group["identifier_set_sha256"],
        "case_content_sha256": group["case_content_sha256"],
        "source_sha256": group["source"]["source_sha256"],
    } for group in groups if group["group_id"] != TOUCH_GROUP]
    packet_count = sum(group["case_count"] for group in packet_groups)
    touch_count = len(source["touch_ids"]) * len(source["dimensions"])
    return {
        "schema_id": "pm.integration_packet_audit_census.v1",
        "schema_version": "1.0.0",
        "spec_sha256": spec_sha256,
        "packet_groups": packet_groups,
        "touch_source": {
            "path": source["path"], "sha256": source["sha256"],
            "touch_ids": source["touch_ids"], "dimensions": source["dimensions"],
        },
        "packet_case_count": packet_count,
        "touch_row_count": len(source["touch_ids"]),
        "dimension_count": len(source["dimensions"]),
        "touch_case_count": touch_count,
        "total_case_count": packet_count + touch_count,
    }


def validate_manifest_census(manifest: dict[str, Any]) -> list[str]:
    """Validate a stored snapshot without relabelling historical V1 evidence."""
    schema = manifest.get("schema_id")
    if schema == LEGACY_SCHEMA and manifest.get("schema_version") == "1.0.0":
        return ([] if manifest.get("case_count") == LEGACY_CASE_COUNT else
                [f"manifest must contain exactly {LEGACY_CASE_COUNT} cases; found {manifest.get('case_count')}"])
    if schema != CURRENT_SCHEMA or manifest.get("schema_version") != "2.0.0":
        return ["unsupported packet audit manifest schema/version"]
    failures = []
    if type(manifest.get("case_count")) is not int or type(manifest.get("group_count")) is not int:
        failures.append("census counts must be integers, not booleans or coercible values")
    groups = manifest.get("groups")
    if not isinstance(groups, list) or any(not isinstance(group, dict) for group in groups):
        return ["census groups must be an array of objects"]
    ids = [group.get("group_id") for group in groups]
    if not _names(ids) or ids.count(TOUCH_GROUP) != 1:
        return ["census requires unique packet groups and exactly one Touch Closure group"]
    if not _sha(manifest.get("spec_sha256")):
        failures.append("census extraction spec hash is missing or invalid")
    for group in groups:
        cases = group.get("cases")
        if not isinstance(cases, list) or any(not isinstance(case, dict) for case in cases):
            return failures + [f"census {group['group_id']}: invalid case array"]
        case_ids = [case.get("case_id") for case in cases]
        if not _names(case_ids):
            return failures + [f"census {group['group_id']}: empty, missing, or duplicate case identities"]
        identifiers = case_ids if group["group_id"] == TOUCH_GROUP else [case.get("source_identifier") for case in cases]
        if not _names(identifiers):
            return failures + [f"census {group['group_id']}: invalid source identifiers"]
        if type(group.get("actual_count")) is not int or group.get("actual_count") != len(cases):
            failures.append(f"census {group['group_id']}: actual count mismatch")
        if group.get("identifier_set_sha256") != _hash_values(identifiers):
            failures.append(f"census {group['group_id']}: identifier hash mismatch")
        content_hash = _hash_values(json.dumps(case, sort_keys=True, separators=(",", ":")) for case in cases)
        if group.get("case_content_sha256") != content_hash:
            failures.append(f"census {group['group_id']}: case content hash mismatch")
        source = group.get("source")
        if not isinstance(source, dict) or not _sha(source.get("sha256" if group["group_id"] == TOUCH_GROUP else "source_sha256")):
            return failures + [f"census {group['group_id']}: source hash missing or invalid"]
    touch = next(group for group in groups if group["group_id"] == TOUCH_GROUP)
    source = touch["source"]
    names, dimensions = source.get("touch_ids"), source.get("dimensions")
    if not _names(names) or not _names(dimensions):
        return failures + ["census touch IDs and dimensions must be nonempty unique string arrays"]
    if source.get("path") != "Plans/touch_closure.json":
        failures.append("census Touch Closure source path drift")
    product = {f"{name}/{dimension}": (name, dimension) for name in names for dimension in dimensions}
    if set(product) != {case["case_id"] for case in touch["cases"]}:
        failures.append("census Touch Closure cases are not the exact row-by-dimension product")
    for case in touch["cases"]:
        pair = product.get(case["case_id"])
        if pair and (case.get("source_identifier") != pair[0]
                     or case.get("metadata") != {"dimension": pair[1]}
                     or case.get("source_ref") != f"Plans/touch_closure.json#{pair[0]}"):
            failures.append(f"census {case['case_id']}: row/dimension identity mismatch")
    for key, expected in (("row_count", len(names)), ("dimension_count", len(dimensions)), ("case_count", len(product))):
        if type(source.get(key)) is not int or source.get(key) != expected:
            failures.append(f"census Touch Closure {key} mismatch")
    expected = build_census_contract(groups, manifest.get("spec_sha256", ""))
    if json.dumps(manifest.get("census_contract"), sort_keys=True) != json.dumps(expected, sort_keys=True):
        failures.append("census contract does not match the exact source groups and Touch Closure product")
    actual_count = sum(len(group["cases"]) for group in groups)
    if manifest.get("case_count") != expected["total_case_count"] or actual_count != expected["total_case_count"]:
        failures.append("census total does not equal packet cases plus the exact Touch Closure product")
    return failures


def validate_source_freeze(stored: dict[str, Any], current: dict[str, Any]) -> list[str]:
    """Compare to independently re-extracted custody, not self-repinned totals."""
    failures = []
    if current.get("source_census_valid") is not True:
        failures.append("current source census is invalid")
        failures.extend(current.get("source_census_failures", []))
    if stored.get("spec_sha256") != current.get("spec_sha256"):
        failures.append("audit extraction/adaptation spec drift")
    if stored.get("required_suite_verdicts") != current.get("required_suite_verdicts"):
        failures.append("required suite verdict set/order drift from current source freeze")
    left = {group["group_id"]: group for group in stored.get("groups", []) if isinstance(group, dict) and isinstance(group.get("group_id"), str)}
    right = {group["group_id"]: group for group in current.get("groups", []) if isinstance(group, dict) and isinstance(group.get("group_id"), str)}
    if set(left) != set(right):
        failures.append("audit group set drifted from current source/Touch Closure freeze")
    for group_id in sorted(set(left).intersection(right)):
        for field in ("suite", "extractor", "expected_count", "minimum_count", "actual_count", "identifier_set_sha256", "case_content_sha256", "source"):
            if left[group_id].get(field) != right[group_id].get(field):
                failures.append(f"{group_id}: {field} drift from current source freeze")
    if stored.get("schema_id") == CURRENT_SCHEMA and stored.get("census_contract") != current.get("census_contract"):
        failures.append("versioned census contract drift from current source freeze")
    return failures
