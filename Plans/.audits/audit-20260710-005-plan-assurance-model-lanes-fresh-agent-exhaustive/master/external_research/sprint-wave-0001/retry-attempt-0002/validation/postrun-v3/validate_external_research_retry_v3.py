#!/usr/bin/env python3
"""Postrun-aware Audit 005 external-research retry validator v3."""

from __future__ import annotations

import copy
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[6]
SPRINT = "sprint-wave-0001"
RETRY_NAME = "retry-attempt-0002"
ATTEMPT = "attempt-0002"
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"
MODEL = "gpt-5.6-luna"
EFFORT = "max"
RETRY = ROOT / "master/external_research" / SPRINT / RETRY_NAME
VALIDATION = RETRY / "validation/postrun-v3"
OUTPUT = ROOT / "external_research_v1"
OLD = ROOT / "master/external_research" / SPRINT
IDS = [f"ER-{index:04d}" for index in range(1, 9)]

CONTROL_PINS = {
    "activation_v3": (RETRY / "activation-v3.json", "558cb87311f8fe65122307f2ce3f97e52477b815dbb35a06a3ce32099db0d4b1"),
    "master_prelaunch_v3": (RETRY / "master-independent-prelaunch-v3.json", "c01fd5e82c964af44f0a4065d8e28c194678f0611a4b14a0977cf7b5eecbe3da"),
    "question_supersession": (RETRY / "manifest-question-binding-supersession-v3.json", "bbb180743a9cc818be5fb28ac779c8ac276630765c014ad6460f3631bd917d55"),
    "extra_lf_reconciliation": (OLD / "attempt-0001-manifest-whitespace-reconciliation.json", "1f47763be7381ee4dea3eb9930833da8e960867744d57b9ed39996e7777dd8b0"),
    "native_capture": (RETRY / "runtime/native_capture.json", "92c58fd52680694eeadf63999dff99edc14103aa88d8eac866d232c2cfce52bc"),
    "manifest": (RETRY / "manifest.json", "60799e4897738803765e13e2520c2aecc0f836e9aa8e61976eab0a33d85d0afc"),
    "result_schema_v2": (RETRY / "schema/external_research_result_v2.schema.json", "1c43b12f87d2270bc30cd2afb11b56b23fd086dd2369a4c373c6d3a6c0d0bf67"),
    "receipt_contract_v2": (RETRY / "receipt_contract.json", "82fb07ee87f7692a7ee9f43b2e20e6e43771de829b823ee5056a3aadae358777"),
    "attempt_0001_failure_lineage": (OLD / "attempt-0001-failure-lineage.json", "adcfd5ac6bb79a6cfbd1f4f57f72c341d83b1373008f80e1f8dc4f43512d76f5"),
    "frozen_v2_validator": (ROOT / "validate_external_research_retry_v2.py", "731cb7fb9fb17128353680c7b5421c4f594d95ae7a6a31824469bde71e335882"),
}

RECEIPT_KEYS = {
    "schema_version", "audit_id", "sprint_id", "retry_namespace", "assignment_id", "attempt_id",
    "controller_thread_id", "agent_path", "task_thread_id", "native_child_thread_id", "model",
    "reasoning_effort", "fresh_child", "fork_turns", "descendants_forbidden",
    "followup_messages_forbidden", "retries_forbidden", "packet_id", "packet_path", "packet_sha256",
    "dispatch_intent_path", "dispatch_intent_sha256", "output_directory", "result_path", "result_sha256",
    "output_sha256", "terminal_turn_status", "terminal_response_prefix", "receipt_written_after_terminal",
    "receipt_content_inspected_by_controller", "activation_v3_sha256", "receipt_contract_v2_sha256",
    "coverage_credit", "research_credit", "promotion_credit",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"not_object:{path}")
    return value


def digest_rows(rows: Any) -> str:
    return hashlib.sha256(json.dumps(rows, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def type_ok(value: Any, expected: Any) -> bool:
    if isinstance(expected, list):
        return any(type_ok(value, item) for item in expected)
    return {
        "object": isinstance(value, dict), "array": isinstance(value, list), "string": isinstance(value, str),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool),
        "integer": isinstance(value, int) and not isinstance(value, bool), "boolean": isinstance(value, bool),
        "null": value is None,
    }.get(expected, True)


def schema_errors(value: Any, schema: dict[str, Any], path: str = "$") -> list[str]:
    errors: list[str] = []
    if "const" in schema and value != schema["const"]:
        errors.append(f"{path}:const")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}:enum")
    if "type" in schema and not type_ok(value, schema["type"]):
        return errors + [f"{path}:type"]
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                errors.append(f"{path}.{key}:required")
        if schema.get("additionalProperties") is False:
            allowed = set(schema.get("properties", {}))
            errors.extend(f"{path}.{key}:additional" for key in value if key not in allowed)
        for key, subschema in schema.get("properties", {}).items():
            if key in value:
                errors.extend(schema_errors(value[key], subschema, f"{path}.{key}"))
    elif isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errors.append(f"{path}:minItems")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            errors.append(f"{path}:maxItems")
        if schema.get("uniqueItems"):
            normalized = [json.dumps(item, sort_keys=True, separators=(",", ":")) for item in value]
            if len(normalized) != len(set(normalized)):
                errors.append(f"{path}:uniqueItems")
        for index, item in enumerate(value):
            if "items" in schema:
                errors.extend(schema_errors(item, schema["items"], f"{path}[{index}]"))
    elif isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            errors.append(f"{path}:minLength")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errors.append(f"{path}:pattern")
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append(f"{path}:minimum")
        if "maximum" in schema and value > schema["maximum"]:
            errors.append(f"{path}:maximum")
    return errors


def corrected_v2_schema(schema: dict[str, Any]) -> dict[str, Any]:
    value = copy.deepcopy(schema)
    value["properties"]["agent_path"]["pattern"] = r"^/root/a005_external_research_sprint_0001_attempt_000[2-9]_terminal$"
    return value


def direct_url_errors(url: Any, path: str) -> list[str]:
    if not isinstance(url, str) or not url or any(character.isspace() for character in url):
        return [f"{path}:non_direct_url"]
    if url.startswith("#") or not url.startswith("https://"):
        return [f"{path}:non_direct_url"]
    try:
        parsed = urlparse(url)
        host = parsed.hostname
        port = parsed.port
        _ = port
    except (ValueError, UnicodeError):
        return [f"{path}:malformed_url"]
    if parsed.scheme != "https" or not parsed.netloc or not host:
        return [f"{path}:non_direct_url"]
    lowered = url.lower()
    search_markers = ("google.com/search", "bing.com/search", "duckduckgo.com/?q", "search.yahoo", "/search?", "search-result")
    if any(marker in lowered for marker in search_markers):
        return [f"{path}:search_result_url"]
    return []


def result_semantic_errors(result: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    errors = schema_errors(result, corrected_v2_schema(schema))
    source_items = result.get("sources", []) if isinstance(result, dict) else []
    source_urls: set[str] = set()
    for index, source in enumerate(source_items):
        if not isinstance(source, dict):
            continue
        url = source.get("url")
        errors.extend(direct_url_errors(url, f"$.sources[{index}].url"))
        if isinstance(url, str):
            if url in source_urls:
                errors.append(f"$.sources[{index}].url:duplicate")
            source_urls.add(url)
        if source.get("access_date") != "2026-07-11":
            errors.append(f"$.sources[{index}].access_date")
    availability = result.get("source_availability")
    if availability == "available" and len(source_items) < 8:
        errors.append("$.sources:insufficient_without_unavailable_evidence")
    if availability in {"limited", "unavailable"} and len(source_items) < 8 and not result.get("unavailable_evidence"):
        errors.append("$.unavailable_evidence:required_for_underfill")
    if len(source_items) > 12:
        errors.append("$.sources:too_many")
    if source_items and source_items[0].get("source_tier") not in {"official", "primary", "standard"}:
        errors.append("$.sources:official_or_primary_not_first")
    for bucket in ("findings", "competitor_standard_patterns", "failure_modes", "implications", "novel_ideas", "unresolved_questions"):
        for index, item in enumerate(result.get(bucket, [])):
            if not isinstance(item, dict):
                continue
            for url in item.get("source_urls", []):
                if url not in source_urls:
                    errors.append(f"$.{bucket}[{index}].source_urls:unknown_source")
                errors.extend(direct_url_errors(url, f"$.{bucket}[{index}].source_urls"))
            if item.get("evidence_class") == "supported_claim" and not item.get("source_urls"):
                errors.append(f"$.{bucket}[{index}]:supported_claim_without_source")
    return sorted(set(errors))


def expected_agent(index: int) -> str:
    return f"/root/a005_external_research_sprint_0001_attempt_{index + 2:04d}_terminal"


def collect_identity_strings(value: Any) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"native_child_thread_id", "native_child_turn_id", "task_thread_id", "agent_path", "canonical_agent_path"} and isinstance(item, str):
                found.add(item)
            found.update(collect_identity_strings(item))
    elif isinstance(value, list):
        for item in value:
            found.update(collect_identity_strings(item))
    return found


def identity_reuse_errors(old_identities: set[str], new_identities: set[str]) -> list[str]:
    return [f"identity_reuse:{value}" for value in sorted(old_identities.intersection(new_identities))]


def inventory_errors(actual: list[str], expected: list[str], label: str) -> list[str]:
    errors = [f"{label}:missing:{item}" for item in sorted(set(expected) - set(actual))]
    errors += [f"{label}:extra:{item}" for item in sorted(set(actual) - set(expected))]
    if len(actual) != len(set(actual)):
        errors.append(f"{label}:duplicate")
    return errors


def pin_errors(actual: str, expected: str, label: str) -> list[str]:
    return [] if actual == expected else [f"{label}:hash"]


def cardinality_errors(values: list[Any], expected_count: int, label: str) -> list[str]:
    errors: list[str] = []
    if len(values) != expected_count:
        errors.append(f"{label}:cardinality")
    normalized = [json.dumps(value, sort_keys=True, separators=(",", ":")) for value in values]
    if len(normalized) != len(set(normalized)):
        errors.append(f"{label}:duplicate")
    return errors


def output_inventory_errors(files: list[str]) -> list[str]:
    return [] if files == ["result.json"] else ["output:exact_result_only"]


def result_binding_errors(result: dict[str, Any], assignment: dict[str, Any], index: int) -> list[str]:
    aid = IDS[index]
    expected_path = expected_agent(index)
    expected = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-result-v2",
        "phase": "external_research_current_web_research", "assignment_id": aid, "attempt_id": ATTEMPT,
        "controller_thread_id": CONTROLLER, "agent_path": expected_path,
        "model": MODEL, "reasoning_effort": EFFORT, "status": "completed", "topic": assignment.get("topic"),
        "owner_domains": assignment.get("owner_domains"), "feature_refs": assignment.get("feature_refs"),
    }
    errors = [f"{aid}:result:{key}" for key, value in expected.items() if result.get(key) != value]
    if not isinstance(result.get("task_thread_id"), str) or not result["task_thread_id"].strip():
        errors.append(f"{aid}:result:task_thread_id")
    return errors


def receipt_binding_errors(receipt: dict[str, Any], index: int, capture_row: dict[str, Any]) -> list[str]:
    aid = IDS[index]
    packet_path = RETRY / "packets" / f"{aid}.json"
    intent_path = RETRY / "dispatch" / aid / ATTEMPT / "dispatch_intent.json"
    output_dir = OUTPUT / aid / "attempts" / ATTEMPT
    result_path = output_dir / "result.json"
    expected = {
        "schema_version": "external-research-dispatch-receipt-v2", "audit_id": AUDIT_ID, "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "assignment_id": aid, "attempt_id": ATTEMPT,
        "controller_thread_id": CONTROLLER, "agent_path": expected_agent(index),
        "task_thread_id": capture_row.get("native_child_thread_id"), "native_child_thread_id": capture_row.get("native_child_thread_id"),
        "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none",
        "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True,
        "packet_id": f"ER2PKT-{index + 1:04d}", "packet_path": str(packet_path), "packet_sha256": sha256(packet_path),
        "dispatch_intent_path": str(intent_path), "dispatch_intent_sha256": sha256(intent_path),
        "output_directory": str(output_dir), "result_path": str(result_path), "result_sha256": sha256(result_path),
        "output_sha256": sha256(result_path), "terminal_turn_status": "completed", "terminal_response_prefix": "PMR1",
        "receipt_written_after_terminal": True, "receipt_content_inspected_by_controller": False,
        "activation_v3_sha256": CONTROL_PINS["activation_v3"][1],
        "receipt_contract_v2_sha256": CONTROL_PINS["receipt_contract_v2"][1],
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0,
    }
    errors = [f"{aid}:receipt:keys"] if set(receipt) != RECEIPT_KEYS else []
    errors.extend(f"{aid}:receipt:{key}" for key, value in expected.items() if receipt.get(key) != value)
    return errors


def transaction_inputs() -> dict[str, Any]:
    manifest = load_json(RETRY / "manifest.json")
    rows: dict[str, Any] = {}
    for aid in IDS:
        packet = RETRY / "packets" / f"{aid}.json"
        intent = RETRY / "dispatch" / aid / ATTEMPT / "dispatch_intent.json"
        receipt = intent.with_name("dispatch_receipt.json")
        result = OUTPUT / aid / "attempts" / ATTEMPT / "result.json"
        rows[aid] = {"packet_sha256": sha256(packet), "intent_sha256": sha256(intent),
                     "receipt_sha256": sha256(receipt), "result_sha256": sha256(result)}
    return {
        "controls": {name: expected for name, (_, expected) in CONTROL_PINS.items()},
        "assignments": rows, "assignment_set_digest": digest_rows(rows),
        "manifest_assignment_order": [row["assignment_id"] for row in manifest["assignments"]],
    }


def global_snapshot_errors(authority_required: bool = True) -> tuple[list[str], dict[str, Any], dict[str, Any], set[str]]:
    errors: list[str] = []
    for name, (path, expected) in CONTROL_PINS.items():
        if not path.is_file() or sha256(path) != expected:
            errors.append(f"control:{name}:hash")
    manifest = load_json(RETRY / "manifest.json")
    capture = load_json(RETRY / "runtime/native_capture.json")
    if manifest.get("assignment_count") != 8 or [row.get("assignment_id") for row in manifest.get("assignments", [])] != IDS:
        errors.append("manifest:exact_eight_order")
    if capture.get("attempt_id") != ATTEMPT or capture.get("controller_thread_id") != CONTROLLER or capture.get("controller_turn_status") != "completed" or capture.get("controller_turn_error") is not None:
        errors.append("capture:controller_binding")
    leaves = capture.get("leaves", [])
    if len(leaves) != 8 or [row.get("assignment_id") for row in leaves] != IDS:
        errors.append("capture:exact_eight_order")
    expected_counts = {"leaves": 8, "unique_native_child_threads": 8, "unique_native_child_turns": 8, "completed_turns": 8, "pmr1_terminals": 8}
    if capture.get("counts") != expected_counts:
        errors.append("capture:counts")
    paths = [row.get("agent_path") for row in leaves]
    threads = [row.get("native_child_thread_id") for row in leaves]
    turns = [row.get("native_child_turn_id") for row in leaves]
    if len(set(paths)) != 8 or len(set(threads)) != 8 or len(set(turns)) != 8 or None in paths + threads + turns:
        errors.append("capture:identity_uniqueness")
    for index, row in enumerate(leaves):
        if row.get("agent_path") != expected_agent(index) or row.get("native_child_turn_status") != "completed" or row.get("native_child_turn_error") is not None or row.get("terminal_response_prefix") != "PMR1":
            errors.append(f"{IDS[index]}:capture:terminal_or_path")
    old_lineage = load_json(OLD / "attempt-0001-failure-lineage.json")
    reconciliation = load_json(OLD / "attempt-0001-manifest-whitespace-reconciliation.json")
    if old_lineage.get("global_disposition") != "zero_credit_fresh_attempt_required" or old_lineage.get("counts", {}).get("coverage_credit") != 0 or old_lineage.get("counts", {}).get("results") != 0 or old_lineage.get("counts", {}).get("receipts") != 0:
        errors.append("attempt_0001:zero_credit_veto")
    if reconciliation.get("attempt_0001_credit") != 0 or reconciliation.get("semantic_difference") is not False:
        errors.append("attempt_0001:reconciliation")
    old_identities = collect_identity_strings(old_lineage)
    result_task_ids: list[str] = []
    for aid in IDS:
        result_path = OUTPUT / aid / "attempts" / ATTEMPT / "result.json"
        if result_path.is_file():
            result_task_ids.append(load_json(result_path).get("task_thread_id"))
    if len(result_task_ids) != 8 or len(set(result_task_ids)) != 8 or any(not isinstance(value, str) or not value for value in result_task_ids):
        errors.append("results:task_thread_identity_uniqueness")
    if identity_reuse_errors(old_identities, set(paths + threads + turns + result_task_ids)):
        errors.append("attempt_0001:identity_reuse")
    if authority_required:
        authority_path = VALIDATION / "VALIDATOR_AUTHORITY_V3.json"
        if not authority_path.is_file():
            errors.append("authority_v3:missing")
        else:
            authority = load_json(authority_path)
            if authority.get("status") != "ACTIVE_ONLY_FOR_BOUND_POSTRUN_VALIDATION" or authority.get("transaction_inputs") != transaction_inputs():
                errors.append("authority_v3:transaction_binding")
            validator_path = VALIDATION / "validate_external_research_retry_v3.py"
            test_path = VALIDATION / "test_external_research_retry_v3.py"
            if authority.get("validator_sha256") != sha256(validator_path) or authority.get("negative_test_sha256") != sha256(test_path):
                errors.append("authority_v3:script_binding")
    return sorted(set(errors)), manifest, capture, old_identities


def assignment_errors(index: int, assignment: dict[str, Any], capture_row: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    aid = IDS[index]
    packet_path = RETRY / "packets" / f"{aid}.json"
    intent_path = RETRY / "dispatch" / aid / ATTEMPT / "dispatch_intent.json"
    receipt_path = intent_path.with_name("dispatch_receipt.json")
    output_dir = OUTPUT / aid / "attempts" / ATTEMPT
    result_path = output_dir / "result.json"
    try:
        packet, intent, receipt, result = map(load_json, (packet_path, intent_path, receipt_path, result_path))
    except Exception as exc:
        return [f"{aid}:load:{type(exc).__name__}:{exc}"]
    expected_path = expected_agent(index)
    if assignment.get("canonical_agent_path") != expected_path or assignment.get("attempt_id") != ATTEMPT:
        errors.append(f"{aid}:manifest:path_or_attempt")
    if assignment.get("packet_sha256") != sha256(packet_path) or assignment.get("dispatch_intent_sha256") != sha256(intent_path):
        errors.append(f"{aid}:manifest:packet_or_intent_hash")
    for key, value in {"assignment_id": aid, "attempt_id": ATTEMPT, "topic": assignment.get("topic"),
                       "owner_domains": assignment.get("owner_domains"), "feature_refs": assignment.get("feature_refs"),
                       "canonical_agent_path": expected_path, "controller_thread_id": CONTROLLER, "model": MODEL,
                       "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none"}.items():
        if packet.get(key) != value:
            errors.append(f"{aid}:packet:{key}")
    for key, value in {"assignment_id": aid, "attempt_id": ATTEMPT, "packet_sha256": sha256(packet_path),
                       "agent_path": expected_path, "controller_thread_id": CONTROLLER, "model": MODEL,
                       "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none",
                       "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True}.items():
        if intent.get(key) != value:
            errors.append(f"{aid}:intent:{key}")
    errors.extend(receipt_binding_errors(receipt, index, capture_row))
    errors.extend(result_binding_errors(result, assignment, index))
    errors.extend(f"{aid}:result:{error}" for error in result_semantic_errors(result, load_json(CONTROL_PINS["result_schema_v2"][0])))
    if capture_row.get("assignment_id") != aid or capture_row.get("agent_path") != expected_path or capture_row.get("native_child_thread_id") != receipt.get("native_child_thread_id") or capture_row.get("native_child_turn_status") != "completed" or capture_row.get("native_child_turn_error") is not None or capture_row.get("terminal_response_prefix") != "PMR1":
        errors.append(f"{aid}:capture:binding")
    files = sorted(path.name for path in output_dir.iterdir() if path.is_file()) if output_dir.is_dir() else []
    errors.extend(f"{aid}:{error}" for error in output_inventory_errors(files))
    return sorted(set(errors))


def build_report(authority_required: bool = True) -> dict[str, Any]:
    global_errors, manifest, capture, _ = global_snapshot_errors(authority_required)
    assignments = manifest.get("assignments", [])
    leaves = capture.get("leaves", [])
    results: list[dict[str, Any]] = []
    eligible: list[str] = []
    for index, aid in enumerate(IDS):
        errors = assignment_errors(index, assignments[index], leaves[index]) if index < len(assignments) and index < len(leaves) else [f"{aid}:missing_manifest_or_capture_row"]
        state = "eligible" if not errors else "rejected"
        if state == "eligible":
            eligible.append(aid)
        results.append({"assignment_id": aid, "state": state, "errors": errors})
    rejected = [row["assignment_id"] for row in results if row["state"] == "rejected"]
    clean = not global_errors and len(eligible) == 8
    report = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-retry-primary-postrun-v3",
        "checker": "external_research_retry_postrun_validator_v3", "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "pass" if clean else "fail",
        "global_errors": global_errors, "counts": {"assignments": 8, "eligible": len(eligible), "rejected": len(rejected),
                                                     "results": sum((OUTPUT / aid / "attempts" / ATTEMPT / "result.json").is_file() for aid in IDS),
                                                     "receipts": sum((RETRY / "dispatch" / aid / ATTEMPT / "dispatch_receipt.json").is_file() for aid in IDS),
                                                     "native_capture_rows": len(leaves)},
        "eligible_assignment_ids": eligible, "eligible_assignment_digest": digest_rows(eligible),
        "rejected_assignment_ids": rejected, "assignment_results": results,
        "transaction_inputs": transaction_inputs(),
        "bounded_corrections": [
            "assignment_mapped_canonical_agent_paths_use_suffixes_0002_through_0009",
            "absolute_direct_https_urls_may_contain_fragment_anchors",
        ],
        "superseded_v2": {"status": "superseded_zero_credit_evidence", "validator_sha256": CONTROL_PINS["frozen_v2_validator"][1],
                          "observed_failure_count": 24, "observed_failure_digest": "ac2a7be03669399815167932110f80996a9e25a1cf91f7ffce62f22ce74a17c9"},
        "attempt_0001": {"disposition": "immutable_zero_credit", "identity_reuse": False},
        "research_credit": 8 if clean else 0, "coverage_credit": 0, "promotion_credit": 0,
        "spec_credit": 0, "merge_credit": 0,
    }
    if authority_required and (VALIDATION / "VALIDATOR_AUTHORITY_V3.json").is_file():
        report["validator_authority_v3_sha256"] = sha256(VALIDATION / "VALIDATOR_AUTHORITY_V3.json")
        report["validator_sha256"] = sha256(VALIDATION / "validate_external_research_retry_v3.py")
        report["negative_test_sha256"] = sha256(VALIDATION / "test_external_research_retry_v3.py")
        report["transaction_input_digest"] = digest_rows(report["transaction_inputs"])
    return report


def main() -> int:
    report = build_report(authority_required=True)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
