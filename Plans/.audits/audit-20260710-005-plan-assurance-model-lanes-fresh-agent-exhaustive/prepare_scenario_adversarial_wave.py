#!/usr/bin/env python3
"""Deterministically prepare Audit 005 scenario/adversarial wave 0001."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import Any

from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha


WAVE_ID = "wave-0001"
ATTEMPT_ID = "attempt-0001"
ASSIGNMENT_COUNT = 32
FEATURE_COUNT = 3888
NAMESPACE = ROOT / "master/scenario_adversarial" / WAVE_ID
OUTPUT_ROOT = ROOT / "scenario_adversarial_v1"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
POLICY_REF = "master/coordination/CONCURRENCY_POLICY_V4.json"
POLICY_SHA256 = "36a4cdcc5b876538c4197096d60febffc5e6ec3ab132e93529755e6daae0ad7f"
PRIOR_POLICY_REF = "master/coordination/CONCURRENCY_POLICY_V3.json"
PRIOR_POLICY_SHA256 = "5d08356b2877734aa4a6e964675fc32abae6f57d83ede5dc11f38e9cea4a7bb3"
COHORT_COUNT = 4
COHORT_SIZE = 8
TARGET_PACKET_MIN = 250_000
TARGET_PACKET_MAX = 450_000
MAX_PACKET_BYTES = 650_000

OWNER_LEDGER_REF = "master/owner_merge/transactions/owner-merge-batch-0001/provisional_feature_ledger.jsonl"
OWNER_LEDGER_SHA256 = "a53e72afb5f52e7e95797f2179c7fd8da14ebf6e148efd544781614784113267"
RESEARCH_ROOT_REF = "external_research_universal_v1"
RESEARCH_ACTIVATION_REF = "master/external_research/universal-wave-0001/validation/activation.json"
RESEARCH_ACTIVATION_SHA256 = "c8c8d83e19a8ec82d869bc74528053d887a042b545afe4293f08ccf964758e3e"
RESEARCH_NATIVE_CAPTURE_REF = "master/external_research/universal-wave-0001/runtime/native_capture.json"
RESEARCH_NATIVE_CAPTURE_SHA256 = "70eeaf93092a05ffe36f4b5f17356bba751646b23d65eebcb567b38d051e45ee"
RESEARCH_POSTRUN_REF = "master/external_research/universal-wave-0001/validation/primary-postrun.json"
RESEARCH_POSTRUN_SHA256 = "1256add17ed50ffc38d2e6dfaf013fb11843e194edba0f9e0bc35b1d2593ee02"

OWNER_FIELDS = [
    "provisional_feature_ref", "owner_domain", "title", "summary", "gap_summary", "spec_state",
    "risk_level", "feature_kinds", "research_questions", "scenario_requirements", "source_documents",
    "source_unit_refs", "cross_domain_terms", "local_feature_refs", "research_obligation_count",
    "scenario_obligation_count",
]
RESEARCH_FIELDS = [
    "research_state", "external_baseline_summary", "confirmed_gaps", "underspecifications",
    "contradictions", "missed_failure_modes", "conclusion_changed", "conclusion_change_summary",
    "proposed_spec_deltas", "scenario_implications", "adversarial_implications",
]
FEATURE_FIELD_ORDER = (
    OWNER_FIELDS[:1] + ["source_row_sha256"] + OWNER_FIELDS[1:] + ["research_binding"]
    + RESEARCH_FIELDS + ["direct_sources", "supported_claims"]
)
STRING_LIST_FIELDS = {
    "feature_kinds", "research_questions", "scenario_requirements", "source_documents", "source_unit_refs",
    "cross_domain_terms", "local_feature_refs", "confirmed_gaps", "underspecifications", "contradictions",
    "missed_failure_modes", "proposed_spec_deltas", "scenario_implications", "adversarial_implications",
}
DIMENSIONS = [
    "normal_happy_path", "boundary_invalid_input", "failure_partial_failure",
    "cancellation_retry_idempotency_stale_recovery", "concurrency_race_ordering",
    "permission_security_privacy_credentials", "persistence_restart_offline_upgrade_migration",
    "scale_quota_backpressure_observability", "accessibility_i18n_user_comprehension",
    "cross_component_authority_ownership_integration",
]
DISPOSITIONS = [
    "certified", "gap_confirmed", "contradiction", "blocked_insufficient_evidence", "not_applicable_dimension",
]


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def digest_strings(values: list[str]) -> str:
    return sha(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode())


def write_obj(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"".join(canonical_json(row) for row in rows))


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def ledger_rows_with_hashes(path: Path) -> list[tuple[dict[str, Any], str]]:
    rows: list[tuple[dict[str, Any], str]] = []
    for number, raw in enumerate(path.read_bytes().splitlines(keepends=True), 1):
        if not raw.strip():
            raise RuntimeError(f"blank ledger line:{number}")
        row = json.loads(raw)
        if not isinstance(row, dict):
            raise RuntimeError(f"non-object ledger line:{number}")
        rows.append((row, sha(raw)))
    return rows


def bound_research_records() -> tuple[dict[str, tuple[dict[str, Any], str, str]], list[dict[str, Any]]]:
    result_paths = sorted((ROOT / RESEARCH_ROOT_REF).glob("A005ERU-*/attempts/attempt-0001/result.json"))
    if len(result_paths) != 24:
        raise RuntimeError("universal research result count is not exactly 24")
    records: dict[str, tuple[dict[str, Any], str, str]] = {}
    metadata: list[dict[str, Any]] = []
    for path in result_paths:
        raw = path.read_bytes()
        result_sha = sha(raw)
        result = json.loads(raw)
        features = result.get("feature_results")
        if not isinstance(features, list):
            raise RuntimeError(f"research result missing feature_results:{path}")
        metadata.append({
            "assignment_id": result.get("assignment_id"), "result_ref": path.relative_to(ROOT).as_posix(),
            "result_sha256": result_sha, "feature_count": len(features),
        })
        for feature in features:
            ref = feature.get("provisional_feature_ref")
            if not isinstance(ref, str) or ref in records:
                raise RuntimeError(f"duplicate or invalid research feature:{ref}")
            records[ref] = (feature, result_sha, sha(canonical_json(feature)))
    if len(records) != FEATURE_COUNT:
        raise RuntimeError("universal research coverage is not exactly 3888 unique features")
    return records, metadata


def project_feature(row: dict[str, Any], row_sha: str, research: tuple[dict[str, Any], str, str]) -> dict[str, Any]:
    feature, result_sha, record_sha = research
    if any(key not in row for key in OWNER_FIELDS):
        raise RuntimeError(f"owner row missing required field:{row.get('provisional_feature_ref')}")
    if any(key not in feature for key in RESEARCH_FIELDS + ["sources", "supported_claims", "source_row_sha256"]):
        raise RuntimeError(f"research row missing required field:{row.get('provisional_feature_ref')}")
    if feature["source_row_sha256"] != row_sha:
        raise RuntimeError(f"research/owner source-row binding mismatch:{row['provisional_feature_ref']}")
    value = {key: row[key] for key in OWNER_FIELDS}
    value["source_row_sha256"] = row_sha
    value["research_binding"] = [result_sha, record_sha]
    for key in RESEARCH_FIELDS:
        value[key] = feature[key]
    value["direct_sources"] = [[source["source_id"], source["url"]] for source in feature["sources"]]
    value["supported_claims"] = [
        [claim["claim_id"], claim["claim"], claim["source_ids"], claim["applicability"]]
        for claim in feature["supported_claims"]
    ]
    return value


def encode_packet_features(features: list[dict[str, Any]]) -> tuple[list[str], list[list[Any]]]:
    strings: list[str] = []
    indexes: dict[str, int] = {}

    def intern(value: str) -> int:
        if value not in indexes:
            indexes[value] = len(strings)
            strings.append(value)
        return indexes[value]

    def intern_list(values: list[str]) -> list[int]:
        return [intern(value) for value in values]

    encoded: list[list[Any]] = []
    for feature in features:
        values: list[Any] = []
        for key in FEATURE_FIELD_ORDER:
            value = feature[key]
            if key in {"research_obligation_count", "scenario_obligation_count", "conclusion_changed"}:
                values.append(value)
            elif key == "research_binding":
                values.append(intern_list(value))
            elif key in STRING_LIST_FIELDS:
                values.append(intern_list(value))
            elif key == "direct_sources":
                values.append([[intern(source_id), intern(url)] for source_id, url in value])
            elif key == "supported_claims":
                values.append([
                    [intern(claim_id), intern(claim), intern_list(source_ids), intern(applicability)]
                    for claim_id, claim, source_ids, applicability in value
                ])
            else:
                values.append(intern(value))
        encoded.append(values)
    return strings, encoded


def decode_packet_features(packet: dict[str, Any]) -> list[dict[str, Any]]:
    strings = packet["string_table"]
    rows = packet["features"]

    def text(index: int) -> str:
        return strings[index]

    def texts(indexes: list[int]) -> list[str]:
        return [text(index) for index in indexes]

    decoded: list[dict[str, Any]] = []
    for row in rows:
        feature: dict[str, Any] = {}
        for key, value in zip(FEATURE_FIELD_ORDER, row):
            if key in {"research_obligation_count", "scenario_obligation_count", "conclusion_changed"}:
                feature[key] = value
            elif key == "research_binding":
                feature[key] = texts(value)
            elif key in STRING_LIST_FIELDS:
                feature[key] = texts(value)
            elif key == "direct_sources":
                feature[key] = [[text(source_id), text(url)] for source_id, url in value]
            elif key == "supported_claims":
                feature[key] = [[text(claim_id), text(claim), texts(source_ids), text(applicability)] for claim_id, claim, source_ids, applicability in value]
            else:
                feature[key] = text(value)
        decoded.append(feature)
    return decoded


def packet_object(domain: str, features: list[dict[str, Any]], *, sequence: int = 0, slice_index: int = 0, slice_count: int = 0) -> dict[str, Any]:
    strings, encoded = encode_packet_features(features)
    refs = [feature["provisional_feature_ref"] for feature in features]
    return {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-packet-v1", "wave_id": WAVE_ID,
        "packet_id": f"SAPKT-{sequence:04d}" if sequence else "SAPKT-MEASURE",
        "assignment_id": f"A005SA-{sequence:04d}" if sequence else "A005SA-MEASURE",
        "attempt_id": ATTEMPT_ID, "owner_domain": domain, "domain_slice_index": slice_index,
        "domain_slice_count": slice_count, "feature_count": len(features), "feature_refs": refs,
        "feature_refs_digest": digest_strings(refs),
        "compact_encoding": {
            "kind": "lossless_string_table_v1", "feature_field_order": FEATURE_FIELD_ORDER,
            "research_binding_tuple": ["result_file_sha256", "research_record_sha256"],
            "direct_sources_tuple": ["source_id", "url"],
            "supported_claims_tuple": ["claim_id", "claim", "source_ids", "applicability"],
            "claim": "Every required semantic value is losslessly reconstructable; only unrequested repetitive source metadata and evidence snippets are omitted.",
        },
        "string_table": strings, "features": encoded,
        "candidate_evidence_label": "mechanically_valid_candidate_evidence_not_final_semantic_authority",
        "certification_contract": {
            "independence": "Reason independently; prior scenario/adversarial implications are candidate input, not proof.",
            "coverage": "Certify every assigned feature exactly once across all required dimensions.",
            "research": "Check applicability and mark weak, misapplied, or insufficient evidence; browse only to verify uncertainty.",
            "output": "Write exactly one strict result.json and return PMR1.",
        },
    }


def encoded_size(domain: str, features: list[dict[str, Any]]) -> int:
    return len(canonical_json(packet_object(domain, features)))


def partition_by_encoded_bytes(rows: list[dict[str, Any]], count: int, domain: str) -> list[list[dict[str, Any]]]:
    if count < 1 or len(rows) < count:
        raise RuntimeError("invalid encoded partition count")
    parts: list[list[dict[str, Any]]] = []
    start = 0
    for part_index in range(count):
        remaining_parts = count - part_index
        if remaining_parts == 1:
            parts.append(rows[start:])
            break
        max_cut = len(rows) - (remaining_parts - 1)
        target = encoded_size(domain, rows[start:]) / remaining_parts
        low, high = start + 1, max_cut
        best, best_difference = low, float("inf")
        while low <= high:
            cut = (low + high) // 2
            size = encoded_size(domain, rows[start:cut])
            difference = abs(size - target)
            if difference < best_difference:
                best, best_difference = cut, difference
            if size < target:
                low = cut + 1
            else:
                high = cut - 1
        parts.append(rows[start:best])
        start = best
    if len(parts) != count or sum(map(len, parts)) != len(rows):
        raise RuntimeError("encoded partition closure failure")
    return parts


def allocate_domain_splits(by_domain: dict[str, list[dict[str, Any]]]) -> dict[str, int]:
    counts = {domain: 1 for domain in by_domain}
    while sum(counts.values()) < ASSIGNMENT_COUNT:
        def current_max(domain: str) -> int:
            return max(encoded_size(domain, part) for part in partition_by_encoded_bytes(by_domain[domain], counts[domain], domain))
        domain = max(sorted(by_domain), key=current_max)
        counts[domain] += 1
    return counts


def result_schema() -> dict[str, Any]:
    strings = {"type": "array", "items": {"type": "string", "minLength": 1}}
    oracle = {
        "type": "object", "additionalProperties": False, "required": ["pass", "fail"],
        "properties": {"pass": {"type": "string", "minLength": 1}, "fail": {"type": "string", "minLength": 1}},
    }
    criterion = {
        "type": "object", "additionalProperties": False,
        "required": ["criterion", "observables", "evidence_artifacts", "oracle"],
        "properties": {"criterion": {"type": "string", "minLength": 1}, "observables": {**strings, "minItems": 1},
                       "evidence_artifacts": {**strings, "minItems": 1}, "oracle": oracle},
    }
    dimension = {
        "type": "object", "additionalProperties": False,
        "required": ["disposition", "rationale", "scenarios", "acceptance_criteria", "spec_deltas"],
        "properties": {"disposition": {"enum": DISPOSITIONS}, "rationale": {"type": "string", "minLength": 1},
                       "scenarios": strings, "acceptance_criteria": {"type": "array", "items": criterion},
                       "spec_deltas": strings},
    }
    claim = {
        "type": "object", "additionalProperties": False,
        "required": ["claim_id", "claim", "source_urls", "evidence_label"],
        "properties": {"claim_id": {"type": "string", "minLength": 1}, "claim": {"type": "string", "minLength": 1},
                       "source_urls": {**strings, "minItems": 1}, "evidence_label": {"type": "string", "minLength": 1}},
    }
    candidate = {
        "type": "object", "additionalProperties": False,
        "required": ["candidate_type", "title", "rationale", "owner_domain_hint"],
        "properties": {"candidate_type": {"enum": ["missing_feature", "missing_tool", "missing_system"]},
                       "title": {"type": "string", "minLength": 1}, "rationale": {"type": "string", "minLength": 1},
                       "owner_domain_hint": {"type": ["string", "null"]}},
    }
    feature = {
        "type": "object", "additionalProperties": False,
        "required": ["provisional_feature_ref", "source_row_sha256", "research_result_file_sha256",
                     "research_record_sha256", "certification_disposition", "disposition_rationale",
                     "research_applicability", "dimensions", "overall_spec_deltas", "newly_discovered_candidates"],
        "properties": {
            "provisional_feature_ref": {"type": "string", "minLength": 1},
            "source_row_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "research_result_file_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "research_record_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "certification_disposition": {"enum": DISPOSITIONS}, "disposition_rationale": {"type": "string", "minLength": 1},
            "research_applicability": {"type": "object", "additionalProperties": False,
                "required": ["state", "rationale", "browsing_performed", "claims_used"],
                "properties": {"state": {"enum": ["applicable", "weak", "misapplied", "insufficient", "not_applicable"]},
                               "rationale": {"type": "string", "minLength": 1}, "browsing_performed": {"type": "boolean"},
                               "claims_used": {"type": "array", "items": claim}}},
            "dimensions": {"type": "object", "additionalProperties": False, "required": DIMENSIONS,
                           "properties": {key: dimension for key in DIMENSIONS}},
            "overall_spec_deltas": strings, "newly_discovered_candidates": {"type": "array", "items": candidate},
        },
    }
    attestations = ["independent_reasoning_completed", "candidate_research_not_treated_as_proof", "every_feature_certified_once",
                    "every_dimension_completed", "all_claims_source_mapped", "plans_not_edited", "no_descendants_or_followups"]
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "additionalProperties": False,
        "required": ["audit_id", "schema_version", "phase", "cohort_id", "assignment_id", "attempt_id", "task_thread_id", "model",
                     "reasoning_effort", "status", "input_binding", "coverage", "feature_certifications", "self_attestation"],
        "properties": {
            "audit_id": {"const": AUDIT_ID}, "schema_version": {"const": "scenario-adversarial-result-v1"},
            "phase": {"const": "scenario_adversarial_certification"}, "assignment_id": {"type": "string", "pattern": "^A005SA-[0-9]{4}$"},
            "cohort_id": {"type": "string", "pattern": "^cohort-000[1-4]$"},
            "attempt_id": {"const": ATTEMPT_ID}, "task_thread_id": {"type": "string", "minLength": 1},
            "model": {"const": MODEL}, "reasoning_effort": {"const": EFFORT}, "status": {"const": "completed"},
            "input_binding": {"type": "object", "additionalProperties": False,
                "required": ["packet_id", "packet_sha256", "feature_refs_digest", "candidate_evidence_label"],
                "properties": {"packet_id": {"type": "string", "pattern": "^SAPKT-[0-9]{4}$"},
                               "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                               "feature_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                               "candidate_evidence_label": {"const": "mechanically_valid_candidate_evidence_not_final_semantic_authority"}}},
            "coverage": {"type": "object", "additionalProperties": False, "required": ["feature_count", "feature_refs"],
                         "properties": {"feature_count": {"type": "integer", "minimum": 1}, "feature_refs": strings}},
            "feature_certifications": {"type": "array", "minItems": 1, "items": feature},
            "self_attestation": {"type": "object", "additionalProperties": False, "required": attestations,
                                 "properties": {key: {"const": True} for key in attestations}},
        },
    }


def leaf_prompt() -> dict[str, Any]:
    return {
        "schema_version": "scenario-adversarial-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 scenario and adversarial certification intent. Read only the absolute dispatch intent, "
            "its one immutable compact packet, and the strict result schema. Verify every hash and your fresh canonical identity. Decode "
            "the packet losslessly using compact_encoding.feature_field_order and string_table. Treat universal external research as "
            "mechanically valid candidate evidence, never final semantic authority or proof. Reason independently; do not copy prior "
            "scenario_implications or adversarial_implications. Certify every assigned feature exactly once and complete every required "
            "dimension: normal path; boundary and invalid input; failure and partial failure; cancellation, retry, idempotency, stale state, "
            "and recovery; concurrency, race, and ordering; permission, security, privacy, and credentials; persistence, restart, offline, "
            "upgrade, and migration; scale, quota, backpressure, and observability; accessibility, i18n, and user comprehension; and "
            "cross-component authority, ownership, and integration seams. Use explicit not_applicable_dimension with a concrete rationale "
            "only when a dimension truly does not apply. Supply executable acceptance criteria, observables, evidence artifacts, and "
            "falsifiable pass/fail oracles for every applicable dimension. Check research applicability and identify weak, misapplied, or "
            "insufficient evidence. Browsing is permitted only to verify uncertain external evidence; every external claim used must retain "
            "a direct URL and evidence label. For every gap_confirmed, contradiction, or blocked_insufficient_evidence disposition, provide "
            "concrete spec deltas without editing Plans. Record newly discovered missing feature, tool, or system candidates. Read no peer "
            "results, prior certification outputs, unrelated audit artifacts, or canonical Plans. Spawn no descendants, accept no follow-up "
            "or retry, write exactly one result.json in output_directory, use your canonical path as task_thread_id, and return exactly PMR1."
        ),
    }


def main() -> None:
    if NAMESPACE.exists() or OUTPUT_ROOT.exists():
        raise RuntimeError("refusing to overwrite scenario/adversarial namespace")
    exact_inputs = {
        OWNER_LEDGER_REF: OWNER_LEDGER_SHA256,
        RESEARCH_ACTIVATION_REF: RESEARCH_ACTIVATION_SHA256,
        RESEARCH_NATIVE_CAPTURE_REF: RESEARCH_NATIVE_CAPTURE_SHA256,
        RESEARCH_POSTRUN_REF: RESEARCH_POSTRUN_SHA256,
        POLICY_REF: POLICY_SHA256,
        PRIOR_POLICY_REF: PRIOR_POLICY_SHA256,
    }
    for ref, expected in exact_inputs.items():
        path = ROOT / ref
        if not path.is_file() or sha(path.read_bytes()) != expected:
            raise RuntimeError(f"bound input mismatch:{ref}")
    postrun = load_obj(ROOT / RESEARCH_POSTRUN_REF)
    if postrun.get("status") != "pass" or postrun.get("counts") != {"assignments": 24, "eligible": 24, "rejected": 0}:
        raise RuntimeError("universal research postrun is not exact 24/24 eligible")
    test = subprocess.run(["python3", "-B", "test_scenario_adversarial_validator.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if test.returncode or json.loads(test.stdout).get("status") != "pass":
        raise RuntimeError(f"scenario validator negative tests failed:{test.stdout}:{test.stderr}")

    ledger = ledger_rows_with_hashes(ROOT / OWNER_LEDGER_REF)
    research_by_ref, research_files = bound_research_records()
    if len(ledger) != FEATURE_COUNT:
        raise RuntimeError("owner ledger is not exactly 3888 rows")
    ledger_refs = [row[0]["provisional_feature_ref"] for row in ledger]
    if len(set(ledger_refs)) != FEATURE_COUNT or set(ledger_refs) != set(research_by_ref):
        raise RuntimeError("owner/research feature coverage mismatch")
    projected = [project_feature(row, row_sha, research_by_ref[row["provisional_feature_ref"]]) for row, row_sha in ledger]
    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for feature in projected:
        by_domain[feature["owner_domain"]].append(feature)
    if len(by_domain) != 16:
        raise RuntimeError("owner domain count is not 16")
    for features in by_domain.values():
        features.sort(key=lambda item: item["provisional_feature_ref"])
    split_counts = allocate_domain_splits(by_domain)
    if sum(split_counts.values()) != ASSIGNMENT_COUNT:
        raise RuntimeError("domain split count is not exactly 32")

    packet_specs: list[tuple[str, int, int, list[dict[str, Any]]]] = []
    for domain in sorted(by_domain):
        parts = partition_by_encoded_bytes(by_domain[domain], split_counts[domain], domain)
        for index, features in enumerate(parts, 1):
            packet_specs.append((domain, index, len(parts), features))
    if len(packet_specs) != ASSIGNMENT_COUNT:
        raise RuntimeError("packet count is not exactly 32")

    NAMESPACE.mkdir(parents=True)
    OUTPUT_ROOT.mkdir(parents=True)
    assignments: list[dict[str, Any]] = []
    registry: list[dict[str, Any]] = []
    expanded_semantic_bytes = 0
    packet_bytes_total = 0
    for sequence, (domain, slice_index, slice_count, features) in enumerate(packet_specs, 1):
        assignment_id = f"A005SA-{sequence:04d}"
        packet_id = f"SAPKT-{sequence:04d}"
        packet = packet_object(domain, features, sequence=sequence, slice_index=slice_index, slice_count=slice_count)
        packet_path = NAMESPACE / "packets" / f"{packet_id}.json"
        write_obj(packet_path, packet)
        packet_bytes = len(packet_path.read_bytes())
        if packet_bytes > MAX_PACKET_BYTES:
            raise RuntimeError(f"packet over ceiling:{assignment_id}:{packet_bytes}")
        if decode_packet_features(packet) != features:
            raise RuntimeError(f"lossless packet roundtrip failed:{assignment_id}")
        refs = [feature["provisional_feature_ref"] for feature in features]
        source_hashes = {feature["provisional_feature_ref"]: feature["source_row_sha256"] for feature in features}
        research_bindings = {feature["provisional_feature_ref"]: feature["research_binding"] for feature in features}
        output = OUTPUT_ROOT / assignment_id / "attempts" / ATTEMPT_ID
        output.mkdir(parents=True)
        cohort_id = f"cohort-{((sequence - 1) // COHORT_SIZE) + 1:04d}"
        assignment = {
            "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-assignment-v1", "wave_id": WAVE_ID,
            "assignment_id": assignment_id, "attempt_id": ATTEMPT_ID, "packet_id": packet_id,
            "packet_ref": f"packets/{packet_id}.json", "packet_sha256": sha(packet_path.read_bytes()),
            "packet_bytes": packet_bytes, "cohort_id": cohort_id,
            "cohort_sequence": ((sequence - 1) % COHORT_SIZE) + 1,
            "owner_domain": domain, "domain_slice_index": slice_index,
            "domain_slice_count": slice_count, "feature_count": len(features), "feature_refs": refs,
            "feature_refs_digest": digest_strings(refs), "source_row_sha256_by_feature": source_hashes,
            "research_binding_by_feature": research_bindings,
            "result_schema_ref": "schemas/scenario_adversarial_result.schema.json",
            "output_directory": output.relative_to(ROOT).as_posix(), "model": MODEL, "reasoning_effort": EFFORT,
            "fresh_child_required": True, "fork_turns": "none", "descendants_forbidden": True,
            "followup_messages_forbidden": True, "retries_forbidden": True,
            "prospective_agent_path": f"/root/a005_scenario_adversarial_{sequence:04d}_attempt_0001_terminal",
            "candidate_evidence_label": "mechanically_valid_candidate_evidence_not_final_semantic_authority",
            "coverage_credit_before_validation": 0, "certification_credit_before_validation": 0,
        }
        assignments.append(assignment)
        registry.append({key: assignment[key] for key in ["assignment_id", "cohort_id", "cohort_sequence", "packet_id", "packet_ref", "packet_sha256", "packet_bytes", "owner_domain", "feature_count", "feature_refs_digest"]})
        intent = {
            "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-dispatch-intent-v1", "wave_id": WAVE_ID,
            "assignment_id": assignment_id, "cohort_id": cohort_id,
            "cohort_sequence": assignment["cohort_sequence"], "attempt_id": ATTEMPT_ID,
            "assignment_record_sha256": sha(canonical_json(assignment)), "packet_ref": str(packet_path),
            "packet_sha256": assignment["packet_sha256"], "result_schema_ref": str(NAMESPACE / assignment["result_schema_ref"]),
            "output_directory": str(output), "prospective_agent_path": assignment["prospective_agent_path"],
            "model": MODEL, "reasoning_effort": EFFORT, "fresh_child_required": True, "fork_turns": "none",
            "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True,
            "candidate_evidence_label": assignment["candidate_evidence_label"],
            "result_contract": "write exactly one strict result.json in output_directory",
            "terminal_contract": "return exactly PMR1 after result.json; write no other file",
            "receipt_ref": str(NAMESPACE / "dispatch" / assignment_id / ATTEMPT_ID / "dispatch_receipt.json"),
            "coverage_credit_before_validation": 0, "certification_credit_before_validation": 0,
        }
        write_obj(NAMESPACE / "dispatch" / assignment_id / ATTEMPT_ID / "dispatch_intent.json", intent)
        expanded_semantic_bytes += sum(len(canonical_json(feature)) for feature in features)
        packet_bytes_total += packet_bytes

    covered = [ref for assignment in assignments for ref in assignment["feature_refs"]]
    if len(covered) != FEATURE_COUNT or len(set(covered)) != FEATURE_COUNT or set(covered) != set(ledger_refs):
        raise RuntimeError("scenario/adversarial feature partition mismatch")
    write_jsonl(NAMESPACE / "batch_manifest.jsonl", assignments)
    write_jsonl(NAMESPACE / "packet_registry.jsonl", registry)
    write_obj(NAMESPACE / "schemas/scenario_adversarial_result.schema.json", result_schema())
    write_obj(NAMESPACE / "leaf_prompt.json", leaf_prompt())
    write_obj(NAMESPACE / "receipt_contract.json", {
        "schema_version": "scenario-adversarial-receipt-contract-v1",
        "required_keys": ["audit_id", "schema_version", "wave_id", "cohort_id", "assignment_id", "attempt_id", "controller_thread_id",
                          "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns",
                          "dispatch_intent_sha256", "packet_sha256", "output_directory"],
        "constants": {"audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-dispatch-receipt-v1",
                      "wave_id": WAVE_ID, "controller_thread_id": CONTROLLER, "model": MODEL,
                      "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none"},
        "identity_rule": "agent_path and task_thread_id must equal the unique assignment prospective_agent_path",
        "cohort_rule": "cohort_id must equal the immutable cohort in the assignment and intent; receipts may be created only for an independently activated cohort",
    })
    write_obj(NAMESPACE / "lineage.json", {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-lineage-v1",
        "owner_provisional_ledger_ref": OWNER_LEDGER_REF, "owner_provisional_ledger_sha256": OWNER_LEDGER_SHA256,
        "research_activation_ref": RESEARCH_ACTIVATION_REF, "research_activation_sha256": RESEARCH_ACTIVATION_SHA256,
        "research_native_capture_ref": RESEARCH_NATIVE_CAPTURE_REF, "research_native_capture_sha256": RESEARCH_NATIVE_CAPTURE_SHA256,
        "research_primary_postrun_ref": RESEARCH_POSTRUN_REF, "research_primary_postrun_sha256": RESEARCH_POSTRUN_SHA256,
        "research_result_files": research_files, "research_result_count": 24,
        "prior_concurrency_policy_ref": PRIOR_POLICY_REF, "prior_concurrency_policy_sha256": PRIOR_POLICY_SHA256,
        "prospective_concurrency_policy_ref": POLICY_REF, "prospective_concurrency_policy_sha256": POLICY_SHA256,
        "candidate_evidence_label": "mechanically_valid_candidate_evidence_not_final_semantic_authority",
    })
    source_drop_bytes = {"source_metadata_without_url_or_id": 0, "source_evidence_snippets": 0, "research_workflow_metadata_not_requested": 0}
    for feature, _, _ in research_by_ref.values():
        for source in feature["sources"]:
            source_drop_bytes["source_metadata_without_url_or_id"] += len(canonical_json({key: source[key] for key in ["title", "publisher", "source_type", "accessed_date", "section_anchor", "applicability"]}))
            source_drop_bytes["source_evidence_snippets"] += len(source["evidence_snippet"].encode())
        source_drop_bytes["research_workflow_metadata_not_requested"] += len(canonical_json({key: feature[key] for key in ["research_group_id", "search_attempts", "insufficient_evidence_reason"]}))
    write_obj(NAMESPACE / "architecture.json", {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-architecture-v1", "assignment_count": 32,
        "feature_count": FEATURE_COUNT, "owner_domain_count": 16, "domain_split_counts": split_counts,
        "allocation_rule": "one slice per owner domain, then split the domain with the largest current encoded packet; contiguous feature-ref order and encoded-byte balancing",
        "compact_encoding": "lossless_string_table_v1", "expanded_retained_semantic_bytes": expanded_semantic_bytes,
        "compact_packet_bytes": packet_bytes_total, "dropped_category_bytes": source_drop_bytes,
        "dropped_categories": ["repetitive_source_metadata_except_source_id_and_url", "source_evidence_snippets", "unrequested_research_workflow_metadata"],
        "retained_categories": OWNER_FIELDS + RESEARCH_FIELDS + ["source_row_sha256", "research_result_file_sha256", "research_record_sha256", "direct_source_ids_and_urls", "supported_claim_id_text_source_mapping_and_applicability"],
        "packet_target_bytes": [TARGET_PACKET_MIN, TARGET_PACKET_MAX], "packet_hard_ceiling_bytes": MAX_PACKET_BYTES,
        "concurrency_policy_ref": POLICY_REF, "concurrency_policy_sha256": POLICY_SHA256,
        "prior_concurrency_policy_ref": PRIOR_POLICY_REF, "prior_concurrency_policy_sha256": PRIOR_POLICY_SHA256,
        "semantic_cap": 32, "cohort_count": COHORT_COUNT, "cohort_size": COHORT_SIZE,
        "cohort_dispatch_rule": "Each immutable eight-assignment cohort is separately gateable, dispatchable, receiptable, terminally capturable, and independently validatable; all-32 atomic spawn is not a prerequisite.",
        "luna_retry_terminal_checkpoint_required_before_first_cohort_launch": True,
        "coverage_credit_before_validation": 0, "certification_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    })
    cohort_bindings: list[dict[str, Any]] = []
    for cohort_number in range(1, COHORT_COUNT + 1):
        cohort_id = f"cohort-{cohort_number:04d}"
        cohort_assignments = [row for row in assignments if row["cohort_id"] == cohort_id]
        if len(cohort_assignments) != COHORT_SIZE:
            raise RuntimeError(f"cohort is not exactly eight assignments:{cohort_id}")
        cohort_dir = NAMESPACE / "cohorts" / cohort_id
        write_jsonl(cohort_dir / "cohort_manifest.jsonl", cohort_assignments)
        cohort_intents = [NAMESPACE / "dispatch" / row["assignment_id"] / ATTEMPT_ID / "dispatch_intent.json" for row in cohort_assignments]
        cohort_packets = [NAMESPACE / row["packet_ref"] for row in cohort_assignments]
        cohort_authority = {
            "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-cohort-authority-v1", "wave_id": WAVE_ID,
            "cohort_id": cohort_id, "status": "PREPARED_UNBOUND_ZERO_CREDIT_AWAITING_INDEPENDENT_GATE",
            "assignment_count": COHORT_SIZE, "assignment_ids": [row["assignment_id"] for row in cohort_assignments],
            "feature_count": sum(row["feature_count"] for row in cohort_assignments),
            "feature_refs_digest": digest_strings([ref for row in cohort_assignments for ref in row["feature_refs"]]),
            "cohort_manifest_sha256": sha((cohort_dir / "cohort_manifest.jsonl").read_bytes()),
            "intent_root_sha256": root_hash(cohort_intents, NAMESPACE), "packet_root_sha256": root_hash(cohort_packets, NAMESPACE),
            "receipt_contract_sha256": sha((NAMESPACE / "receipt_contract.json").read_bytes()),
            "result_schema_sha256": sha((NAMESPACE / "schemas/scenario_adversarial_result.schema.json").read_bytes()),
            "concurrency_policy_v4_sha256": POLICY_SHA256, "atomic_all_32_spawn_required": False,
            "separate_activation_required": True, "separate_terminal_capture_required": True,
            "separate_postrun_validation_required": True, "coverage_credit": 0, "certification_credit": 0,
        }
        write_obj(cohort_dir / "cohort_authority.json", cohort_authority)
        write_obj(cohort_dir / "cohort_launch_seal.json", {
            "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-cohort-launch-seal-v1", "wave_id": WAVE_ID,
            "cohort_id": cohort_id, "status": "CANDIDATE_AWAITING_INDEPENDENT_COHORT_GATE",
            "assignment_count": COHORT_SIZE, "assignment_ids": cohort_authority["assignment_ids"],
            "cohort_authority_sha256": sha((cohort_dir / "cohort_authority.json").read_bytes()),
            "activation_authorized": False, "coverage_credit": 0, "certification_credit": 0,
        })
        cohort_bindings.append({
            "cohort_id": cohort_id, "assignment_ids": cohort_authority["assignment_ids"],
            "cohort_manifest_sha256": cohort_authority["cohort_manifest_sha256"],
            "cohort_authority_sha256": sha((cohort_dir / "cohort_authority.json").read_bytes()),
            "cohort_launch_seal_sha256": sha((cohort_dir / "cohort_launch_seal.json").read_bytes()),
        })
    payload_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file())
    authority = {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-batch-authority-v1", "wave_id": WAVE_ID,
        "status": "PREPARED_UNBOUND_ZERO_COVERAGE_ZERO_CERTIFICATION_CREDIT", "assignment_count": 32,
        "cohort_count": COHORT_COUNT, "cohort_size": COHORT_SIZE, "cohort_bindings": cohort_bindings,
        "feature_count": FEATURE_COUNT, "owner_domain_count": 16, "assignment_ids": [row["assignment_id"] for row in assignments],
        "coverage_digest": digest_strings(ledger_refs), "batch_manifest_sha256": sha((NAMESPACE / "batch_manifest.jsonl").read_bytes()),
        "packet_registry_sha256": sha((NAMESPACE / "packet_registry.jsonl").read_bytes()),
        "leaf_prompt_sha256": sha((NAMESPACE / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((NAMESPACE / "receipt_contract.json").read_bytes()),
        "result_schema_sha256": sha((NAMESPACE / "schemas/scenario_adversarial_result.schema.json").read_bytes()),
        "lineage_sha256": sha((NAMESPACE / "lineage.json").read_bytes()),
        "architecture_sha256": sha((NAMESPACE / "architecture.json").read_bytes()),
        "payload_root_sha256": root_hash(payload_files, NAMESPACE),
        "preparation_script_sha256": sha((ROOT / "prepare_scenario_adversarial_wave.py").read_bytes()),
        "verifier_script_sha256": sha((ROOT / "verify_scenario_adversarial_wave.py").read_bytes()),
        "validator_script_sha256": sha((ROOT / "validate_scenario_adversarial_batch.py").read_bytes()),
        "test_script_sha256": sha((ROOT / "test_scenario_adversarial_validator.py").read_bytes()),
        "concurrency_policy_sha256": POLICY_SHA256, "prior_concurrency_policy_sha256": PRIOR_POLICY_SHA256,
        "atomic_all_32_spawn_required": False, "controller_thread_id": CONTROLLER, "model": MODEL,
        "reasoning_effort": EFFORT, "fork_turns": "none", "coverage_credit_before_validation": 0,
        "certification_credit_before_validation": 0, "activation_authorized": False,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(NAMESPACE / "batch_authority.json", authority)
    seal_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file())
    write_obj(NAMESPACE / "launch_seal.json", {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-launch-seal-v1", "wave_id": WAVE_ID,
        "status": "CANDIDATE_AWAITING_INDEPENDENT_GATING_AND_LUNA_RETRY_CHECKPOINT",
        "batch_authority_sha256": sha((NAMESPACE / "batch_authority.json").read_bytes()),
        "sealed_payload_root_sha256": root_hash(seal_files, NAMESPACE), "assignment_count": 32,
        "cohort_count": COHORT_COUNT, "cohort_size": COHORT_SIZE, "cohort_bindings": cohort_bindings,
        "semantic_cap": 32, "atomic_all_32_spawn_required": False, "coverage_credit": 0,
        "certification_credit": 0, "activation_authorized": False,
    })
    verify = subprocess.run(["python3", "-B", "verify_scenario_adversarial_wave.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if verify.returncode or not verify.stdout.strip():
        raise RuntimeError(f"scenario verifier failed:{verify.stdout}:{verify.stderr}")
    report = json.loads(verify.stdout)
    if report.get("status") != "pass" or report.get("errors"):
        raise RuntimeError(f"scenario verification failed:{report}")
    write_obj(NAMESPACE / "validation/local-prelaunch-candidate.json", report)
    print(json.dumps({
        "status": "prepared_unbound_zero_coverage_zero_certification_credit", "wave_id": WAVE_ID,
        "assignments": len(assignments), "features": len(covered), "domains": len(by_domain),
        "packet_bytes_min": min(row["packet_bytes"] for row in assignments),
        "packet_bytes_max": max(row["packet_bytes"] for row in assignments),
        "packet_bytes_total": sum(row["packet_bytes"] for row in assignments),
        "coverage_digest": digest_strings(ledger_refs), "domain_split_counts": split_counts,
        "expanded_retained_semantic_bytes": expanded_semantic_bytes, "compact_packet_bytes": packet_bytes_total,
        "dropped_category_bytes": source_drop_bytes,
        "batch_authority_sha256": sha((NAMESPACE / "batch_authority.json").read_bytes()),
        "launch_seal_sha256": sha((NAMESPACE / "launch_seal.json").read_bytes()),
        "local_prelaunch_candidate_sha256": sha((NAMESPACE / "validation/local-prelaunch-candidate.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
