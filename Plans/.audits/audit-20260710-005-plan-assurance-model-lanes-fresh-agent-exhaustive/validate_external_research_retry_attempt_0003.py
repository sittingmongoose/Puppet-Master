#!/usr/bin/env python3
"""Cumulative postrun validator for external-research recovery attempt-0003."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from prepare_external_research_retry_attempt_0003 import (
    ATTEMPT, ATTEMPT2, AUDIT_ID, CONTROLLER, EFFORT, FLOOR_ID, MODEL, NAMESPACE, OUTPUT_ROOT,
    RECOVERY_IDS, RETRY_NAME, ROOT, SPRINT, canonical_json, digest, expected_agent, load_obj, sha,
)


def type_ok(value: Any, expected: Any) -> bool:
    if isinstance(expected, list):
        return any(type_ok(value, item) for item in expected)
    return {"object": isinstance(value, dict), "array": isinstance(value, list), "string": isinstance(value, str),
            "number": isinstance(value, (int, float)) and not isinstance(value, bool),
            "integer": isinstance(value, int) and not isinstance(value, bool), "boolean": isinstance(value, bool),
            "null": value is None}.get(expected, True)


def schema_errors(value: Any, schema: dict[str, Any], path: str = "$") -> list[str]:
    errors: list[str] = []
    if "const" in schema and value != schema["const"]: errors.append(f"{path}:const")
    if "enum" in schema and value not in schema["enum"]: errors.append(f"{path}:enum")
    if "type" in schema and not type_ok(value, schema["type"]): return errors + [f"{path}:type"]
    if isinstance(value, dict):
        errors.extend(f"{path}.{key}:required" for key in schema.get("required", []) if key not in value)
        if schema.get("additionalProperties") is False:
            allowed = set(schema.get("properties", {})); errors.extend(f"{path}.{key}:additional" for key in value if key not in allowed)
        for key, subschema in schema.get("properties", {}).items():
            if key in value: errors.extend(schema_errors(value[key], subschema, f"{path}.{key}"))
    elif isinstance(value, list):
        if len(value) < schema.get("minItems", 0): errors.append(f"{path}:minItems")
        if "maxItems" in schema and len(value) > schema["maxItems"]: errors.append(f"{path}:maxItems")
        if schema.get("uniqueItems"):
            rows = [json.dumps(item, sort_keys=True, separators=(",", ":")) for item in value]
            if len(rows) != len(set(rows)): errors.append(f"{path}:uniqueItems")
        if "items" in schema:
            for index, item in enumerate(value): errors.extend(schema_errors(item, schema["items"], f"{path}[{index}]"))
    elif isinstance(value, str):
        if len(value) < schema.get("minLength", 0): errors.append(f"{path}:minLength")
        if "pattern" in schema and not re.search(schema["pattern"], value): errors.append(f"{path}:pattern")
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]: errors.append(f"{path}:minimum")
        if "maximum" in schema and value > schema["maximum"]: errors.append(f"{path}:maximum")
    return errors


def direct_url_errors(url: Any, label: str) -> list[str]:
    if not isinstance(url, str) or not url.startswith("https://") or any(char.isspace() for char in url) or url.startswith("#"):
        return [f"{label}:non_direct_url"]
    try:
        parsed = urlparse(url); host = parsed.hostname; _ = parsed.port
    except (ValueError, UnicodeError):
        return [f"{label}:malformed_url"]
    if parsed.scheme != "https" or not parsed.netloc or not host: return [f"{label}:non_direct_url"]
    lowered = url.lower()
    if any(marker in lowered for marker in ("google.com/search", "bing.com/search", "duckduckgo.com/?q", "search.yahoo", "/search?", "search-result")):
        return [f"{label}:search_result_url"]
    return []


def hash_binding_errors(actual: str, expected: str, label: str) -> list[str]:
    return [] if actual == expected else [f"{label}:hash"]


def exact_set_errors(actual: list[str], expected: list[str], label: str) -> list[str]:
    errors: list[str] = []
    if actual != expected: errors.append(f"{label}:exact_order")
    if len(actual) != len(set(actual)): errors.append(f"{label}:duplicate")
    return errors


def output_files_errors(files: list[str]) -> list[str]:
    return [] if files == ["result.json"] else ["output:exact_result_only"]


def receipt_identity_errors(receipt: dict[str, Any], aid: str, agent_path: str, native_id: str) -> list[str]:
    expected = {"assignment_id": aid, "agent_path": agent_path, "task_thread_id": native_id,
                "native_child_thread_id": native_id, "model": MODEL, "reasoning_effort": EFFORT,
                "fresh_child": True, "fork_turns": "none"}
    return [f"{aid}:receipt:{key}" for key, value in expected.items() if receipt.get(key) != value]


def cumulative_credit(eligible_attempt3: list[str], global_errors: list[str]) -> int:
    return 8 if not global_errors and eligible_attempt3 == RECOVERY_IDS else 0


def semantic_errors(result: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    errors = schema_errors(result, schema)
    if "task_thread_id" in result: errors.append("$.task_thread_id:forbidden_leaf_unknown_identity")
    sources = result.get("sources", [])
    urls: set[str] = set()
    for index, source in enumerate(sources):
        if not isinstance(source, dict): continue
        url = source.get("url"); errors.extend(direct_url_errors(url, f"$.sources[{index}].url"))
        if isinstance(url, str):
            if url in urls: errors.append(f"$.sources[{index}].url:duplicate")
            urls.add(url)
        if source.get("access_date") != "2026-07-11": errors.append(f"$.sources[{index}].access_date")
    availability = result.get("source_availability")
    if availability == "available" and len(sources) < 8: errors.append("$.sources:insufficient")
    if availability in {"limited", "unavailable"} and len(sources) < 8 and not result.get("unavailable_evidence"): errors.append("$.unavailable_evidence:required")
    if sources and sources[0].get("source_tier") not in {"official", "primary", "standard"}: errors.append("$.sources:priority")
    for bucket in ("findings", "competitor_standard_patterns", "failure_modes", "implications", "novel_ideas", "unresolved_questions"):
        for index, item in enumerate(result.get(bucket, [])):
            if not isinstance(item, dict): continue
            for url in item.get("source_urls", []):
                if url not in urls: errors.append(f"$.{bucket}[{index}].source_urls:unknown_source")
                errors.extend(direct_url_errors(url, f"$.{bucket}[{index}].source_urls"))
            if item.get("evidence_class") == "supported_claim" and not item.get("source_urls"): errors.append(f"$.{bucket}[{index}]:unsupported_claim")
    return sorted(set(errors))


def result_errors(result: dict[str, Any], assignment: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    aid = assignment["assignment_id"]
    expected = {"audit_id": AUDIT_ID, "schema_version": "external-research-result-v3",
                "phase": "external_research_current_web_research", "assignment_id": aid, "attempt_id": ATTEMPT,
                "controller_thread_id": CONTROLLER, "agent_path": assignment["canonical_agent_path"],
                "model": MODEL, "reasoning_effort": EFFORT, "status": "completed", "topic": assignment["topic"],
                "owner_domains": assignment["owner_domains"], "feature_refs": assignment["feature_refs"],
                "research_questions": assignment["research_questions"]}
    errors = [f"{aid}:result:{key}" for key, value in expected.items() if result.get(key) != value]
    errors.extend(f"{aid}:result:{error}" for error in semantic_errors(result, schema))
    return sorted(set(errors))


def receipt_errors(receipt: dict[str, Any], assignment: dict[str, Any], capture: dict[str, Any], contract: dict[str, Any]) -> list[str]:
    aid = assignment["assignment_id"]
    intent_path = Path(assignment["dispatch_intent_ref"]); packet_path = Path(assignment["packet_ref"])
    result_path = Path(assignment["output_path"])
    expected = {"schema_version": "external-research-dispatch-receipt-v3", "audit_id": AUDIT_ID, "sprint_id": SPRINT,
                "retry_namespace": RETRY_NAME, "assignment_id": aid, "attempt_id": ATTEMPT,
                "controller_thread_id": CONTROLLER, "agent_path": assignment["canonical_agent_path"],
                "task_thread_id": capture.get("native_child_thread_id"), "native_child_thread_id": capture.get("native_child_thread_id"),
                "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none",
                "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True,
                "packet_sha256": sha(packet_path), "dispatch_intent_sha256": sha(intent_path),
                "result_sha256": sha(result_path), "output_sha256": sha(result_path),
                "terminal_turn_status": "completed", "terminal_response_prefix": "PMR1",
                "receipt_written_after_spawn_and_terminal": True, "result_contains_task_thread_id": False,
                "native_capture_binding_deferred": True, "coverage_credit": 0, "research_credit": 0,
                "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0}
    errors = [f"{aid}:receipt:keys"] if set(receipt) != set(contract["required_fields"]) else []
    errors.extend(f"{aid}:receipt:{key}" for key, value in expected.items() if receipt.get(key) != value)
    for key, value in {"packet_path": str(packet_path), "dispatch_intent_path": str(intent_path),
                       "output_directory": assignment["output_directory"], "result_path": str(result_path)}.items():
        if receipt.get(key) != value: errors.append(f"{aid}:receipt:{key}")
    return sorted(set(errors))


def capture_set_errors(capture: dict[str, Any], receipts: dict[str, dict[str, Any]], prior_ids: set[str]) -> list[str]:
    errors: list[str] = []
    leaves = capture.get("leaves", [])
    if capture.get("attempt_id") != ATTEMPT or len(leaves) != 7 or [row.get("assignment_id") for row in leaves] != RECOVERY_IDS:
        errors.append("capture:attempt_cardinality_order")
    paths = [row.get("agent_path") for row in leaves]; threads = [row.get("native_child_thread_id") for row in leaves]; turns = [row.get("native_child_turn_id") for row in leaves]
    for label, values in (("paths", paths), ("threads", threads), ("turns", turns)):
        if len(values) != 7 or len(set(values)) != 7 or None in values: errors.append(f"capture:{label}:unique")
    if prior_ids.intersection(set(paths + threads + turns)): errors.append("capture:identity_reuse")
    for index, row in enumerate(leaves):
        aid = RECOVERY_IDS[index]; receipt = receipts.get(aid, {})
        if row.get("agent_path") != expected_agent(aid) or row.get("native_child_turn_status") != "completed" or row.get("native_child_turn_error") is not None or row.get("terminal_response_prefix") != "PMR1": errors.append(f"{aid}:capture:terminal")
        if receipt and (row.get("native_child_thread_id") != receipt.get("native_child_thread_id") or row.get("native_child_thread_id") != receipt.get("task_thread_id")): errors.append(f"{aid}:capture:receipt_identity")
    return sorted(set(errors))


def prior_identity_set() -> set[str]:
    found: set[str] = set()
    for path in (ROOT / "master/external_research" / SPRINT / "attempt-0001-failure-lineage.json", ATTEMPT2 / "runtime/native_capture.json"):
        value = load_obj(path)
        def walk(item: Any) -> None:
            if isinstance(item, dict):
                for key, value in item.items():
                    if key in {"native_child_thread_id", "native_child_turn_id", "agent_path", "task_thread_id"} and isinstance(value, str): found.add(value)
                    walk(value)
            elif isinstance(item, list):
                for value in item: walk(value)
        walk(value)
    return found


def validate_postrun() -> dict[str, Any]:
    manifest = load_obj(NAMESPACE / "manifest.json"); schema = load_obj(NAMESPACE / "schema/external_research_result_v3.schema.json")
    contract = load_obj(NAMESPACE / "receipt_contract_v3.json"); assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    capture_path = NAMESPACE / "runtime/native_capture.json"; capture = load_obj(capture_path) if capture_path.is_file() else {"leaves": []}
    capture_by_id = {row.get("assignment_id"): row for row in capture.get("leaves", [])}
    receipts: dict[str, dict[str, Any]] = {}
    rows: list[dict[str, Any]] = []
    for aid in RECOVERY_IDS:
        assignment = assignments[aid]; errors: list[str] = []
        result_path = Path(assignment["output_path"]); receipt_path = Path(assignment["receipt_path"])
        files = sorted(path.name for path in Path(assignment["output_directory"]).iterdir() if path.is_file())
        errors.extend(f"{aid}:{error}" for error in output_files_errors(files))
        if not result_path.is_file(): errors.append(f"{aid}:result:missing")
        else:
            try: errors.extend(result_errors(load_obj(result_path), assignment, schema))
            except Exception as exc: errors.append(f"{aid}:result:parse:{type(exc).__name__}")
        if not receipt_path.is_file(): errors.append(f"{aid}:receipt:missing")
        else:
            try:
                receipt = load_obj(receipt_path); receipts[aid] = receipt
                errors.extend(receipt_errors(receipt, assignment, capture_by_id.get(aid, {}), contract))
            except Exception as exc: errors.append(f"{aid}:receipt:parse:{type(exc).__name__}")
        if aid not in capture_by_id: errors.append(f"{aid}:capture:missing")
        rows.append({"assignment_id": aid, "state": "eligible" if not errors else "rejected", "errors": sorted(set(errors))})
    global_errors = capture_set_errors(capture, receipts, prior_identity_set()) if capture_path.is_file() else ["capture:missing"]
    attempt3_eligible = [row["assignment_id"] for row in rows if row["state"] == "eligible"]
    cumulative = [FLOOR_ID] + attempt3_eligible
    clean = not global_errors and attempt3_eligible == RECOVERY_IDS
    return {"audit_id": AUDIT_ID, "schema_version": "external-research-recovery-postrun-v3", "sprint_id": SPRINT,
            "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "pass" if clean else "fail",
            "global_errors": global_errors, "assignment_results": rows,
            "attempt_0003_eligible_ids": attempt3_eligible, "attempt_0003_rejected_ids": [aid for aid in RECOVERY_IDS if aid not in attempt3_eligible],
            "preserved_floor_eligible_ids": [FLOOR_ID], "cumulative_eligible_ids": cumulative,
            "cumulative_eligible_digest": digest(cumulative), "counts": {"attempt_0003_assignments": 7,
                "attempt_0003_eligible": len(attempt3_eligible), "attempt_0003_rejected": 7-len(attempt3_eligible),
                "cumulative_eligible": len(cumulative), "receipts": len(receipts), "native_capture_rows": len(capture.get("leaves", []))},
            "cumulative_research_credit": cumulative_credit(attempt3_eligible, global_errors), "coverage_credit": 0, "promotion_credit": 0,
            "spec_credit": 0, "merge_credit": 0}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--allow-incomplete", action="store_true"); args = parser.parse_args()
    report = validate_postrun(); print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" or args.allow_incomplete else 1)


if __name__ == "__main__": main()
