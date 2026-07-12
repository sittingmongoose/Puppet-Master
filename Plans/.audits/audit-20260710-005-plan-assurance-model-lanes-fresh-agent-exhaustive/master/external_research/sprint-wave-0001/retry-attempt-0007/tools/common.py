#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import importlib.metadata
import json
import os
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

NAMESPACE = Path(__file__).resolve().parents[1]
ROOT = NAMESPACE.parents[3]
OUTPUT_ROOT = ROOT / "external_research_v1"
DEPENDENCY_SITE = ROOT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
if str(DEPENDENCY_SITE) not in sys.path:
    sys.path.insert(0, str(DEPENDENCY_SITE))
from jsonschema import Draft202012Validator, FormatChecker  # type: ignore  # noqa:E402

import canonical_json  # noqa:E402

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
SPRINT_ID = "sprint-wave-0001"
RETRY_NAMESPACE = "retry-attempt-0007"
ATTEMPT_ID = "attempt-0007"
RECOVERY_IDS = ["ER-0003", "ER-0008"]
FLOOR_IDS = ["ER-0001", "ER-0002", "ER-0004", "ER-0005", "ER-0006", "ER-0007"]
FLOOR_DIGEST = "111135d1d44849d95577071398351634e899cf0689340919c6b855c239e859b6"
MODEL = "gpt-5.6-luna"
REASONING_EFFORT = "max"
CONTROLLER_THREAD_ID = "019f5078-6501-7223-b52f-2251010bdc41"
V10_SHA256 = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
V11_SHA256 = "6717f715c8a32dea88d7e79e70fca87aeb4a0b637853da3742c5c6e6a0c9a086"
ROUTING_V2_SHA256 = "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544"
ATTEMPT6_CAPTURE_SHA256 = "3ca11e7678e2af2ebc6c604d2429142cc734e43ce825c0138fa69b7a4c416b05"
ATTEMPT6_PRIMARY_SHA256 = "c05e08ff7e726d352ab57eaa26e9de9039512d00f4f7f3be2680394d86bcea7c"
RESULT_SCHEMA_VERSION = "external-research-result-v7"
RECEIPT_SCHEMA_VERSION = "external-research-dispatch-receipt-v7"
RECEIPT_CONTRACT_VERSION = "external-research-receipt-contract-v7"
CAPTURE_SCHEMA_VERSION = "external-research-native-capture-v7"
CANONICALIZATION_ALGORITHM_ID = canonical_json.ALGORITHM_ID
SECTIONS = ["findings", "competitor_standard_patterns", "failure_modes", "implications", "novel_ideas", "unresolved_questions"]
REFERENCE_KEYS = {
    "source_urls", "citation_ids", "source_claim_ids", "citations", "source_refs", "claim_refs", "evidence_refs",
}


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False, allow_nan=False) + "\n").encode("utf-8")


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("not-object:" + str(path))
    return value


def canonical_sha(value: Any) -> str:
    return canonical_json.canonical_sha256(value)


def expected_agent_path(aid: str) -> str:
    if aid not in RECOVERY_IDS:
        raise ValueError("foreign-assignment:" + aid)
    return f"/root/a005_external_research_recovery_er_{aid[-4:].lower()}_attempt_0007_terminal"


def packet_path(aid: str) -> Path:
    return NAMESPACE / "packets" / f"{aid}.json"


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
    return NAMESPACE / "activation-transaction/leaf-dispatch-authorizations" / f"{aid}.json"


def envelope_path() -> Path:
    return NAMESPACE / "activation-transaction/activation-envelope.json"


def capture_path() -> Path:
    return NAMESPACE / "runtime/native_capture.json"


def schema_engine() -> dict[str, str]:
    return {
        "library": "jsonschema",
        "version": importlib.metadata.version("jsonschema"),
        "validator": Draft202012Validator.__name__,
        "draft": "2020-12",
    }


def draft_errors(value: Any, schema: dict[str, Any]) -> list[str]:
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = []
    for error in validator.iter_errors(value):
        path = "$" + "".join(f"[{item}]" if isinstance(item, int) else f".{item}" for item in error.absolute_path)
        errors.append(f"{path}:{error.validator}:{error.message}")
    return sorted(errors)


def parse_standard_exact(raw: bytes) -> dict[str, Any]:
    # Canonical parser first enforces duplicate-key and finite-number closure.
    canonical_json.parse_exact(raw)
    value = json.loads(raw.decode("utf-8"), parse_constant=lambda token: (_ for _ in ()).throw(ValueError(token)))
    if not isinstance(value, dict):
        raise ValueError("result-not-object")
    return value


def output_tree_inventory(directory: Path) -> list[dict[str, Any]]:
    if not directory.is_dir():
        raise ValueError("output-directory-missing")
    rows = []
    for path in sorted(directory.rglob("*"), key=lambda p: p.relative_to(directory).as_posix()):
        rel = path.relative_to(directory).as_posix()
        if path.is_symlink():
            raise ValueError("output-symlink:" + rel)
        if path.is_dir():
            continue
        if not path.is_file():
            raise ValueError("output-nonregular:" + rel)
        raw = path.read_bytes()
        rows.append({"relative_path": rel, "byte_count": len(raw), "file_sha256": sha_bytes(raw)})
    return rows


def output_tree_sha256(directory: Path) -> str:
    return canonical_sha(output_tree_inventory(directory))


def direct_url_errors(value: Any, label: str) -> list[str]:
    if not isinstance(value, str) or not value or any(ch.isspace() for ch in value):
        return [label + ":invalid"]
    parsed = urlsplit(value)
    errors = []
    if parsed.scheme != "https":
        errors.append(label + ":non-https")
    if not parsed.hostname or not parsed.netloc:
        errors.append(label + ":nonabsolute")
    host = (parsed.hostname or "").lower()
    if parsed.path.lower().startswith("/search") or host in {"google.com", "www.google.com", "bing.com", "www.bing.com"}:
        errors.append(label + ":search-result")
    return errors


def evidence_id(row: dict[str, Any]) -> str | None:
    for key in ("finding_id", "pattern_id", "failure_id", "implication_id", "idea_id", "question_id"):
        if isinstance(row.get(key), str):
            return row[key]
    return None


def forbidden_identity_errors(value: Any, at: str = "$") -> list[str]:
    forbidden = {"task_thread_id", "native_child_thread_id", "native_child_turn_id", "native_thread_id", "native_turn_id"}
    errors: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key in forbidden:
                errors.append(f"{at}.{key}:forbidden")
            errors.extend(forbidden_identity_errors(child, f"{at}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            errors.extend(forbidden_identity_errors(child, f"{at}[{index}]"))
    return errors


def semantic_errors(result: dict[str, Any], packet: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    sources = result.get("sources", [])
    if not isinstance(sources, list):
        return ["sources:not-array"]
    urls = [row.get("url") for row in sources if isinstance(row, dict)]
    for index, url in enumerate(urls):
        errors.extend(direct_url_errors(url, f"sources[{index}].url"))
    if len(urls) != len(set(urls)):
        errors.append("sources:url-not-unique")
    registry = set(urls)
    ids: set[str] = set()
    for section in SECTIONS:
        rows = result.get(section, [])
        if not isinstance(rows, list):
            continue
        for index, row in enumerate(rows):
            if not isinstance(row, dict):
                continue
            item_id = evidence_id(row)
            if item_id:
                if item_id in ids:
                    errors.append("evidence-id:duplicate:" + item_id)
                ids.add(item_id)
            evidence_class = row.get("evidence_class")
            nonempty = [key for key in REFERENCE_KEYS if row.get(key) not in (None, [], {}, "")]
            if evidence_class == "no_evidence" and nonempty:
                errors.append(f"{section}[{index}]:no_evidence_with_references:{','.join(sorted(nonempty))}")
            source_urls = row.get("source_urls", [])
            if source_urls and evidence_class not in {"supported_claim", "inference"}:
                errors.append(f"{section}[{index}]:cited_class_invalid")
            if evidence_class == "supported_claim" and not source_urls:
                errors.append(f"{section}[{index}]:supported_claim_without_source")
            if isinstance(source_urls, list):
                for offset, url in enumerate(source_urls):
                    errors.extend(direct_url_errors(url, f"{section}[{index}].source_urls[{offset}]"))
                    if url not in registry:
                        errors.append(f"{section}[{index}].source_urls[{offset}]:unregistered")
                    if urls.count(url) != 1:
                        errors.append(f"{section}[{index}].source_urls[{offset}]:registry-not-exactly-once")
    questions = packet.get("research_questions", [])
    if result.get("research_questions") != questions:
        errors.append("questions:exact-list-drift")
    coverage = result.get("question_coverage", [])
    if not isinstance(coverage, list) or len(coverage) != len(questions):
        errors.append("questions:coverage-cardinality")
    else:
        if [row.get("question_index") for row in coverage if isinstance(row, dict)] != list(range(len(questions))):
            errors.append("questions:index-order")
        for index, row in enumerate(coverage):
            if not isinstance(row, dict):
                continue
            if row.get("question") != questions[index]:
                errors.append(f"questions[{index}]:text")
            if row.get("coverage_state") != "covered":
                errors.append(f"questions[{index}]:state")
            refs = row.get("evidence_refs", [])
            if not refs:
                errors.append(f"questions[{index}]:evidence-empty")
            for ref in refs:
                if ref not in ids:
                    errors.append(f"questions[{index}]:foreign-evidence:{ref}")
    if result.get("source_availability") == "available" and not 8 <= len(sources) <= 12:
        errors.append("sources:available-requires-8-to-12")
    if result.get("source_availability") in {"limited", "unavailable"} and not result.get("unavailable_evidence"):
        errors.append("sources:underfill-requires-explanation")
    return sorted(set(errors))


def result_errors(value: dict[str, Any], assignment: dict[str, Any], core: dict[str, Any], authorization: dict[str, Any]) -> list[str]:
    schema = load(NAMESPACE / "schema/external_research_result_v7.schema.json")
    packet = load(packet_path(assignment["assignment_id"]))
    errors = draft_errors(value, schema)
    expected = {
        "audit_id": AUDIT_ID,
        "schema_version": RESULT_SCHEMA_VERSION,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": ATTEMPT_ID,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"],
        "model": MODEL,
        "reasoning_effort": REASONING_EFFORT,
        "status": "completed",
        "activation_transaction_id": core.get("activation_transaction_id"),
        "activation_core_sha256": canonical_sha(core),
        "leaf_dispatch_authorization_sha256": canonical_sha(authorization),
        "topic": packet["topic"],
        "owner_domains": packet["owner_domains"],
        "feature_refs": packet["feature_refs"],
        "research_questions": packet["research_questions"],
    }
    for key, expected_value in expected.items():
        if value.get(key) != expected_value:
            errors.append("binding:" + key)
    errors.extend(forbidden_identity_errors(value))
    attestations = load(NAMESPACE / "leaf_initial_task_contract.json")["required_self_attestations"]
    for key in attestations:
        if value.get("self_attestation", {}).get(key) is not True:
            errors.append("self-attestation:" + key)
    errors.extend(semantic_errors(value, packet))
    return sorted(set(errors))


def validate_result_buffer(raw: bytes, assignment: dict[str, Any], core: dict[str, Any], authorization: dict[str, Any]) -> tuple[dict[str, Any] | None, str, str, list[str]]:
    file_sha = sha_bytes(raw)
    try:
        canonical = canonical_json.canonical_sha256_from_buffer(raw)
        value = parse_standard_exact(raw)
    except Exception as exc:
        return None, file_sha, "", ["result-json:" + type(exc).__name__ + ":" + str(exc)]
    return value, file_sha, canonical, result_errors(value, assignment, core, authorization)


def zero_state_errors() -> list[str]:
    errors = []
    for aid in RECOVERY_IDS:
        directory = output_dir(aid)
        if not directory.is_dir():
            errors.append(aid + ":output-directory-missing")
        elif list(directory.iterdir()):
            errors.append(aid + ":output-not-empty")
        if receipt_path(aid).exists():
            errors.append(aid + ":receipt-present")
    if capture_path().exists():
        errors.append("native-capture-present")
    transaction = NAMESPACE / "activation-transaction"
    if transaction.exists() and any(path.is_file() for path in transaction.rglob("*")):
        errors.append("activation-transaction-present")
    return sorted(errors)


def write_exclusive(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    fd = os.open(path, flags, 0o644)
    try:
        os.write(fd, json_bytes(value))
        os.fsync(fd)
    finally:
        os.close(fd)


def prior_identity_inventory() -> dict[str, set[str]]:
    identities: set[str] = set()
    paths: set[str] = set()
    sprint = ROOT / "master/external_research/sprint-wave-0001"
    for attempt in sorted(sprint.glob("*attempt-000[1-6]")) + sorted(sprint.glob("retry-attempt-000[1-6]")):
        for candidate in [attempt / "runtime/native_capture.json", attempt / "manifest.json"]:
            if not candidate.is_file():
                continue
            try:
                value = json.loads(candidate.read_text())
            except Exception:
                continue
            stack = [value]
            while stack:
                item = stack.pop()
                if isinstance(item, dict):
                    for key, child in item.items():
                        if key in {"native_child_thread_id", "native_child_turn_id", "task_thread_id"} and isinstance(child, str):
                            identities.add(child)
                        if key in {"agent_path", "canonical_agent_path", "prospective_agent_path"} and isinstance(child, str):
                            paths.add(child)
                        stack.append(child)
                elif isinstance(item, list):
                    stack.extend(item)
    return {"identities": identities, "paths": paths}
