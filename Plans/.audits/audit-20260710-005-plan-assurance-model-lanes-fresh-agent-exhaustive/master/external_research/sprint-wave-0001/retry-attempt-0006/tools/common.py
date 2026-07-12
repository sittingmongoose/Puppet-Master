#!/usr/bin/env python3
"""Shared immutable contracts for Audit005 external-research attempt-0006."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[5]
NAMESPACE = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "external_research_v1"
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
SPRINT_ID = "sprint-wave-0001"
RETRY_NAMESPACE = "retry-attempt-0006"
ATTEMPT_ID = "attempt-0006"
CONTROLLER_THREAD_ID = "019f5078-6501-7223-b52f-2251010bdc41"
MODEL = "gpt-5.6-luna"
REASONING_EFFORT = "max"
RECOVERY_IDS = ["ER-0003", "ER-0008"]
FLOOR_IDS = ["ER-0002", "ER-0001", "ER-0004", "ER-0005", "ER-0006", "ER-0007"]
FLOOR_DIGEST = "111135d1d44849d95577071398351634e899cf0689340919c6b855c239e859b6"
V9_SHA256 = "0f9dae3c8406be8ab1159f610b6465120049d0057aa81031d6826fb9ba88b592"
ATTEMPT5_CAPTURE_SHA256 = "714463a7494e9cb0b97938f81ac1a1914166c3d84886d0172c1d1eb280164f99"
ATTEMPT5_PRIMARY_SHA256 = "3e5de5018a3e419fe3e3c85d0bf4598c2af92a8479c926dd0778bdf058a8a20d"
BLOCKED_STATUS = "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH"
ACTIVE_STATUS = "ACTIVE_FOR_EXACTLY_2_FRESH_LUNA_MAX_LEAVES"
RESULT_SCHEMA_VERSION = "external-research-result-v6"
CONTRACT_SCHEMA_VERSION = "external-research-receipt-contract-v6"
POSITIVE_RECEIPT_SCHEMA_VERSION = "external-research-dispatch-receipt-v6"
SECTIONS = ["findings", "competitor_standard_patterns", "failure_modes", "implications", "novel_ideas", "unresolved_questions"]
REFERENCE_KEYS = {"source_urls", "citation_ids", "source_claim_ids", "citations", "source_refs", "claim_refs", "evidence_refs"}


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("not-object:%s" % path)
    return value


def expected_agent_path(aid: str) -> str:
    if aid not in RECOVERY_IDS:
        raise ValueError("foreign-assignment:%s" % aid)
    return "/root/a005_external_research_recovery_er_%s_attempt_0006_terminal" % aid[-4:].lower()


def packet_path(aid: str) -> Path:
    return NAMESPACE / "packets" / (aid + ".json")


def intent_path(aid: str) -> Path:
    return NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_intent.json"


def receipt_path(aid: str) -> Path:
    return intent_path(aid).with_name("dispatch_receipt.json")


def output_dir(aid: str) -> Path:
    return OUTPUT_ROOT / aid / "attempts" / ATTEMPT_ID


def result_path(aid: str) -> Path:
    return output_dir(aid) / "result.json"


def core_path() -> Path:
    return NAMESPACE / "activation-transaction/activation-core.json"


def authorization_path(aid: str) -> Path:
    return NAMESPACE / "activation-transaction/leaf-dispatch-authorizations" / (aid + ".json")


def envelope_path() -> Path:
    return NAMESPACE / "activation-transaction/activation-envelope.json"


def capture_path() -> Path:
    return NAMESPACE / "runtime/native_capture.json"


def _type_ok(value: Any, expected: str) -> bool:
    return {
        "object": isinstance(value, dict), "array": isinstance(value, list), "string": isinstance(value, str),
        "boolean": isinstance(value, bool), "integer": isinstance(value, int) and not isinstance(value, bool),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool), "null": value is None,
    }.get(expected, False)


def schema_errors(value: Any, schema: dict[str, Any], at: str = "$") -> list[str]:
    errors: list[str] = []
    expected = schema.get("type")
    if expected is not None:
        choices = expected if isinstance(expected, list) else [expected]
        if not any(_type_ok(value, choice) for choice in choices):
            return [at + ":type"]
    if "const" in schema and value != schema["const"]: errors.append(at + ":const")
    if "enum" in schema and value not in schema["enum"]: errors.append(at + ":enum")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0): errors.append(at + ":minLength")
        if "maxLength" in schema and len(value) > schema["maxLength"]: errors.append(at + ":maxLength")
        if "pattern" in schema and re.fullmatch(schema["pattern"], value) is None: errors.append(at + ":pattern")
        if schema.get("format") == "date" and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value) is None: errors.append(at + ":format-date")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]: errors.append(at + ":minimum")
        if "maximum" in schema and value > schema["maximum"]: errors.append(at + ":maximum")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0): errors.append(at + ":minItems")
        if "maxItems" in schema and len(value) > schema["maxItems"]: errors.append(at + ":maxItems")
        if schema.get("uniqueItems") and len({canonical(item) for item in value}) != len(value): errors.append(at + ":uniqueItems")
        if isinstance(schema.get("items"), dict):
            for index, item in enumerate(value): errors.extend(schema_errors(item, schema["items"], "%s[%d]" % (at, index)))
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value: errors.append("%s.%s:required" % (at, key))
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            for key in value:
                if key not in properties: errors.append("%s.%s:additional" % (at, key))
        for key, child in properties.items():
            if key in value: errors.extend(schema_errors(value[key], child, "%s.%s" % (at, key)))
    for index, child in enumerate(schema.get("allOf", [])):
        condition = child.get("if")
        if condition is None:
            errors.extend(schema_errors(value, child, "%s.allOf[%d]" % (at, index)))
        elif not schema_errors(value, condition, at) and isinstance(child.get("then"), dict):
            errors.extend(schema_errors(value, child["then"], at))
    return sorted(set(errors))


def direct_url_errors(value: Any, label: str) -> list[str]:
    if not isinstance(value, str) or not value or any(ch.isspace() for ch in value):
        return [label + ":invalid"]
    parsed = urlsplit(value)
    errors = []
    if parsed.scheme != "https": errors.append(label + ":non-https")
    if not parsed.hostname or not parsed.netloc: errors.append(label + ":nonabsolute")
    host = (parsed.hostname or "").lower()
    if parsed.path.lower().startswith("/search") or host in {"google.com", "www.google.com", "bing.com", "www.bing.com"}: errors.append(label + ":search-result")
    return errors


def evidence_id(row: dict[str, Any]) -> str | None:
    for key in ("finding_id", "pattern_id", "failure_id", "implication_id", "idea_id", "question_id"):
        if isinstance(row.get(key), str): return row[key]
    return None


def _nonempty_reference_fields(row: dict[str, Any]) -> list[str]:
    nonempty = []
    for key in REFERENCE_KEYS:
        if key in row and row[key] not in (None, [], {}, ""):
            nonempty.append(key)
    return sorted(nonempty)


def semantic_errors(result: dict[str, Any], packet: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    sources = result.get("sources", [])
    if not isinstance(sources, list): return ["sources:not-array"]
    urls = [row.get("url") for row in sources if isinstance(row, dict)]
    for index, url in enumerate(urls): errors.extend(direct_url_errors(url, "sources[%d].url" % index))
    if len(urls) != len(set(urls)): errors.append("sources:url-not-unique")
    registry = set(urls)
    ids: set[str] = set()
    for section in SECTIONS:
        rows = result.get(section, [])
        if not isinstance(rows, list): continue
        for index, row in enumerate(rows):
            if not isinstance(row, dict): continue
            item_id = evidence_id(row)
            if item_id:
                if item_id in ids: errors.append("evidence-id:duplicate:%s" % item_id)
                ids.add(item_id)
            cls = row.get("evidence_class")
            refs = row.get("source_urls", [])
            nonempty = _nonempty_reference_fields(row)
            if cls == "no_evidence" and nonempty:
                errors.append("%s[%d]:no_evidence_with_references:%s" % (section, index, ",".join(nonempty)))
            if refs and cls not in {"supported_claim", "inference"}:
                errors.append("%s[%d]:cited_class_invalid" % (section, index))
            if cls == "supported_claim" and not refs:
                errors.append("%s[%d]:supported_claim_without_source" % (section, index))
            if isinstance(refs, list):
                for offset, url in enumerate(refs):
                    errors.extend(direct_url_errors(url, "%s[%d].source_urls[%d]" % (section, index, offset)))
                    if url not in registry: errors.append("%s[%d].source_urls[%d]:unregistered" % (section, index, offset))
                    if urls.count(url) != 1: errors.append("%s[%d].source_urls[%d]:registry-not-exactly-once" % (section, index, offset))
    questions = packet.get("research_questions", [])
    if result.get("research_questions") != questions: errors.append("questions:exact-list-drift")
    coverage = result.get("question_coverage", [])
    if not isinstance(coverage, list) or len(coverage) != len(questions):
        errors.append("questions:coverage-cardinality")
    else:
        if [row.get("question_index") for row in coverage if isinstance(row, dict)] != list(range(len(questions))): errors.append("questions:index-order")
        for index, row in enumerate(coverage):
            if not isinstance(row, dict): continue
            if row.get("question") != questions[index]: errors.append("questions[%d]:text" % index)
            if row.get("coverage_state") != "covered": errors.append("questions[%d]:state" % index)
            refs = row.get("evidence_refs", [])
            if not refs: errors.append("questions[%d]:evidence-empty" % index)
            for ref in refs:
                if ref not in ids: errors.append("questions[%d]:foreign-evidence:%s" % (index, ref))
    availability = result.get("source_availability")
    if availability == "available" and not 8 <= len(sources) <= 12: errors.append("sources:available-requires-8-to-12")
    if availability in {"limited", "unavailable"} and not result.get("unavailable_evidence"): errors.append("sources:underfill-requires-explanation")
    return sorted(set(errors))


def forbidden_identity_errors(value: Any, at: str = "$") -> list[str]:
    forbidden = {"task_thread_id", "native_child_thread_id", "native_child_turn_id", "native_thread_id", "native_turn_id"}
    errors: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key in forbidden: errors.append("%s.%s:forbidden" % (at, key))
            errors.extend(forbidden_identity_errors(child, "%s.%s" % (at, key)))
    elif isinstance(value, list):
        for index, child in enumerate(value): errors.extend(forbidden_identity_errors(child, "%s[%d]" % (at, index)))
    return errors


def result_errors(result: dict[str, Any], assignment: dict[str, Any], schema: dict[str, Any], core_sha: str, auth_sha: str, transaction_id: str) -> list[str]:
    packet = load(packet_path(assignment["assignment_id"]))
    errors = schema_errors(result, schema)
    expected = {
        "audit_id": AUDIT_ID, "schema_version": RESULT_SCHEMA_VERSION, "assignment_id": assignment["assignment_id"],
        "attempt_id": ATTEMPT_ID, "controller_thread_id": CONTROLLER_THREAD_ID, "agent_path": assignment["canonical_agent_path"],
        "model": MODEL, "reasoning_effort": REASONING_EFFORT, "status": "completed", "activation_transaction_id": transaction_id,
        "activation_core_sha256": core_sha, "leaf_dispatch_authorization_sha256": auth_sha, "topic": packet["topic"],
        "owner_domains": packet["owner_domains"], "feature_refs": packet["feature_refs"], "research_questions": packet["research_questions"],
    }
    for key, value in expected.items():
        if result.get(key) != value: errors.append("binding:%s" % key)
    errors.extend(forbidden_identity_errors(result))
    attestation = result.get("self_attestation", {})
    for key in load(NAMESPACE / "leaf_initial_task_contract.json").get("required_self_attestations", []):
        if attestation.get(key) is not True: errors.append("self-attestation:%s" % key)
    errors.extend(semantic_errors(result, packet))
    return sorted(set(errors))


def receipt_errors(receipt: dict[str, Any], assignment: dict[str, Any], result_sha: str, core: dict[str, Any], core_sha: str, authorization: dict[str, Any], auth_sha: str, envelope_sha: str) -> list[str]:
    aid = assignment["assignment_id"]
    contract = load(NAMESPACE / "receipt_contract_v6.json")
    errors: list[str] = []
    required = set(contract["required_fields"])
    if set(receipt) != required: errors.append("%s:receipt:key-set" % aid)
    if receipt.get("schema_version") == contract.get("contract_document_schema_version"):
        errors.append("%s:receipt:contract-label-copied" % aid)
    if receipt.get("schema_version") != contract.get("required_positive_receipt_schema_version"):
        errors.append("%s:receipt:positive-schema-version" % aid)
    for key, value in contract["exact_values"].items():
        if receipt.get(key) != value: errors.append("%s:receipt:%s" % (aid, key))
    expected = {
        "assignment_id": aid, "agent_path": assignment["canonical_agent_path"], "packet_id": assignment["packet_id"],
        "packet_path": str(packet_path(aid)), "packet_sha256": sha(packet_path(aid)), "dispatch_intent_path": str(intent_path(aid)),
        "dispatch_intent_sha256": sha(intent_path(aid)), "activation_transaction_id": core["activation_transaction_id"],
        "authorization_transaction_id": authorization["authorization_transaction_id"], "activation_core_path": str(core_path()),
        "activation_core_sha256": core_sha, "leaf_dispatch_authorization_path": str(authorization_path(aid)),
        "leaf_dispatch_authorization_sha256": auth_sha, "activation_envelope_path": str(envelope_path()),
        "activation_envelope_sha256": envelope_sha, "output_directory": str(output_dir(aid)), "result_path": str(result_path(aid)),
        "result_sha256": result_sha, "output_sha256": result_sha,
    }
    for key, value in expected.items():
        if receipt.get(key) != value: errors.append("%s:receipt:%s" % (aid, key))
    thread = receipt.get("task_thread_id")
    if not isinstance(thread, str) or not thread: errors.append("%s:receipt:task-thread" % aid)
    if receipt.get("native_child_thread_id") != thread: errors.append("%s:receipt:native-thread" % aid)
    return sorted(set(errors))


def prior_identity_inventory() -> dict[str, Any]:
    identities: set[str] = set(); paths: set[str] = set(); files = 0
    roots = [ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0002", ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0003", ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0004", ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005"]
    def walk(value: Any, key: str = "") -> None:
        if isinstance(value, dict):
            for child_key, child in value.items(): walk(child, child_key)
        elif isinstance(value, list):
            for child in value: walk(child, key)
        elif isinstance(value, str):
            if value.startswith("/root/"): paths.add(value)
            if ("thread_id" in key or "turn_id" in key) and value: identities.add(value)
    for root in roots:
        if not root.is_dir(): continue
        for path in sorted(root.rglob("*.json")):
            if path.name == "result.json": continue
            try: walk(json.loads(path.read_text(encoding="utf-8"))); files += 1
            except Exception: pass
    return {"identities": identities, "paths": paths, "files": files, "identity_digest": digest(sorted(identities)), "path_digest": digest(sorted(paths))}


def zero_state_errors() -> list[str]:
    errors = []
    for aid in RECOVERY_IDS:
        output = output_dir(aid)
        files = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing>"]
        if files: errors.append("zero-state:%s:output" % aid)
        if receipt_path(aid).is_file(): errors.append("zero-state:%s:receipt" % aid)
    if capture_path().is_file(): errors.append("zero-state:capture")
    transaction = NAMESPACE / "activation-transaction"
    if transaction.is_dir() and any(path.is_file() for path in transaction.rglob("*")): errors.append("zero-state:activation")
    return errors
