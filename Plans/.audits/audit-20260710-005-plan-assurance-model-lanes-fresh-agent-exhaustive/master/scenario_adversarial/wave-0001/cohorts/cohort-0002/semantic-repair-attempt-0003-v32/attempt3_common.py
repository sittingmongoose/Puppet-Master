#!/usr/bin/env python3
"""Deterministic contracts and builders for Audit005 cohort-0002 attempt-0003."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import re
import stat
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
COHORT = HERE.parent
WAVE = HERE.parents[2]
MASTER = WAVE.parents[1]
AUDIT_PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
JSONSCHEMA_SITE = MASTER / "dependencies/jsonschema-draft202012-v1/site-packages"
V30 = COHORT / "semantic-repair-attempt-0002-preparation-v30"
GATE = COHORT / "semantic-repair-attempt-0002-gate-v31"
ACTIVATION = COHORT / "semantic-repair-attempt-0002-activation-v32-exact6"
PRIMARY = ACTIVATION / "validation/primary-postrun-v32.json"
CAPTURE = ACTIVATION / "runtime/native_capture.json"
ACTIVATION_ENVELOPE = ACTIVATION / "activation_envelope.json"
FROZEN_VALIDATOR = GATE / "verify_gate_v31_1.py"
FROZEN_RESULT_SCHEMA = GATE / "schema/result.schema.json"
POLICY_V32 = MASTER / "coordination/CONCURRENCY_POLICY_V32.json"
SOURCE_MANIFEST = COHORT / "cohort_manifest.jsonl"
BASE_SCHEMA = WAVE / "schemas/scenario_adversarial_result.schema.json"
BASE_VALIDATOR = WAVE / "postrun-validator-v1/validate_scenario_postrun_v1.py"

AUTHORITY = HERE / "IMMUTABLE_AUTHORITY.json"
RESULT_SCHEMA = HERE / "schema/result.schema.json"
TEMPLATE = HERE / "templates/feature-certification.template.json"
PROMPT = HERE / "leaf_prompt.json"
ERROR_FAMILIES = HERE / "observed_error_families.json"
ERROR_LOCALIZATION = HERE / "observed_error_localization.jsonl"
VALIDATOR_ROWS = HERE / "validator_rows.jsonl"
MANIFEST = HERE / "attempt3_manifest.jsonl"
TEST_MATRIX = HERE / "test_matrix.json"
TEST_REPORT = HERE / "validation/test-report.json"
READINESS = HERE / "readiness.json"
FUTURE_LUNA = HERE / "validation/fresh-luna-prelaunch.json"
FUTURE_CAPTURE = HERE / "validation/controller-parent-native-capture.json"
FUTURE_ACTIVATION = HERE / "activation/activation-envelope.json"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
ATTEMPT_ID = "attempt-0003"
GATE_ID = "SCENARIO-COHORT-0002-SEMANTIC-REPAIR-ATTEMPT-0003-V32"
ASSIGNMENTS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
DIMENSIONS = [
    "normal_happy_path",
    "boundary_invalid_input",
    "failure_partial_failure",
    "cancellation_retry_idempotency_stale_recovery",
    "concurrency_race_ordering",
    "permission_security_privacy_credentials",
    "persistence_restart_offline_upgrade_migration",
    "scale_quota_backpressure_observability",
    "accessibility_i18n_user_comprehension",
    "cross_component_authority_ownership_integration",
]
SELF_ATTESTATION_KEYS = [
    "independent_reasoning_completed",
    "candidate_research_not_treated_as_proof",
    "every_feature_certified_once",
    "every_dimension_completed",
    "all_claims_source_mapped",
    "plans_not_edited",
    "no_descendants_or_followups",
]
ZERO_STATE = {
    "activation": False,
    "launch": False,
    "results": 0,
    "receipts": 0,
    "capture_rows": 0,
    "credit": 0,
    "spawned_children": 0,
}
PINNED_COMMAND_PREFIX = f"PYTHONPATH={JSONSCHEMA_SITE} PYTHONNOUSERSITE=1 PYTHONDONTWRITEBYTECODE=1 {AUDIT_PYTHON} -S -B"

PRIMARY_SHA = "b44f7748b5092b190b41340c6094b7c3670b0c3d06d9aabdfdc9df65ca1b221b"
ACTIVATION_SHA = "4a6ddbddfb45812831b44124e224b9adcfaec13e77714523675b27584181932c"
CAPTURE_SHA = "365dd86277e2be1f5c7068604f496b7112aeb1e884c82456e203bb2a823b2eb3"
FROZEN_VALIDATOR_SHA = "8f5ada680fb86dbd96e3d5e12ca84f59d7ab58d528b640891a1975e01cbd723a"
POLICY_V32_SHA = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"
EMPTY_TREE_SHA = hashlib.sha256(b"[]").hexdigest()
LOCALIZATION_DIGEST = "6707a06175c83330fadc64f1505b0b26805ab20f20863bc5eac34fca0d16bac3"
QUESTION_COUNTS = {"A005SA-0009": 145, "A005SA-0010": 133, "A005SA-0012": 92, "A005SA-0013": 92, "A005SA-0014": 147, "A005SA-0016": 104}

TREE_BASELINES = {
    "attempt2_preparation_v30": {
        "path": str(V30), "file_count": 14, "byte_count": 95018,
        "inventory_sha256": "3e548336e750f3317a8e8624aebcd60d7b39dcbbfe9cbdef432849088312af9a",
    },
    "attempt2_gate_v31": {
        "path": str(GATE), "file_count": 45, "byte_count": 9676336,
        "inventory_sha256": "047aea19dd7fde11110825aee407f5201ebaf4686e2fb28282a23d547718ab73",
    },
    "attempt2_activation_v32": {
        "path": str(ACTIVATION), "file_count": 22, "byte_count": 123456,
        "inventory_sha256": "3b1c606fd49b65b3a203e767e45afcce3d66b6ebb3198f8ccdb7e8cf6350c146",
    },
}

ATTEMPT2_ARTIFACTS = {
    "A005SA-0009": {"result": "f77ca2e5efa3a1d222cbf8cd99603d2d56ba7de7258e02fed85ffb8809dc5cbb", "receipt": "6f2cacb4b709fc008c5e77cd22aa670a8c3198ea71055cfdb8604e81d454dad5"},
    "A005SA-0010": {"result": "e58405fc9580ceaf9d19052b7b8dad5d7f362d67510762cb2ac6dd21cca0b0fb", "receipt": "6e4900896a3703ba326bdbe68a26b344014400a3bf9d96f551ed11744e991c29"},
    "A005SA-0012": {"result": "f802c30346c534f8cf284881cc1e1d4382f6ed21d55b5cb8d1d9e606734854fa", "receipt": "8aac006b8c0627a7c47d042a38295a0589d5f2e08a092499b37ae7124c49767d"},
    "A005SA-0013": {"result": "17a9507822607cb623f9b4ed55f0ee79440946b7827c0e41594debfb589db471", "receipt": "e944c381341e5cfce3535b55ff0257fe2d7c144ae0ea6701693aa1a61f23be5b"},
    "A005SA-0014": {"result": "907dd89d7a0fce19a23afc6560350f439d29473ca6354e78dea5144e2d029721", "receipt": "0bc4bbf4be99e91e8212783505d9aa99d780809b02ffb38fe33bba1518ed9a80"},
    "A005SA-0016": {"result": "b379ab13feaaae705b902bbca1e1ed8ecd1f2bff8b2160095b38259faec86d45", "receipt": "9396e892ae22d43b8d3175835af1471400f0853f681ac2ffb196ae2a0a8e5e1b"},
}

ERROR_TOTALS = {
    "A005SA-0009": {"count": 2934, "digest": "3a71337d23a22b7732892c3facf32f886ddc62d4b78695e73d94404c35fe8d87"},
    "A005SA-0010": {"count": 2907, "digest": "bccb234db430edc91f23aad817aab5ef82568791b389fd3a8d8bed26a2e48aa1"},
    "A005SA-0012": {"count": 2346, "digest": "25fc89465c27456c76b4ca4629c722a9e12db928f09acde29b6cfa570da09605"},
    "A005SA-0013": {"count": 2112, "digest": "30d0dd04054e95d5740a02e4ae9be3d1aa011ac5f93d1cab9f8e94eb26ccc168"},
    "A005SA-0014": {"count": 3272, "digest": "26463fc483a410b449ed9ca29fee9c94c98fbc55c75cfb00283ca485f27ac395"},
    "A005SA-0016": {"count": 2260, "digest": "efb5b7dc66bfa889fd964987b4fb4c93759bbbc2c8ca90423e7425d44b2e0d33"},
}


class DuplicateKey(ValueError):
    pass


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise DuplicateKey(key)
        value[key] = item
    return value


def parse_json(raw: bytes) -> Any:
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs)


def json_bytes(value: Any, pretty: bool = True) -> bytes:
    if pretty:
        return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical_sha(value: Any) -> str:
    return sha_bytes(json_bytes(value, pretty=False))


def stable_read(path: Path) -> bytes:
    before_path = path.lstat()
    if stat.S_ISLNK(before_path.st_mode) or not stat.S_ISREG(before_path.st_mode):
        raise ValueError("not-regular:" + str(path))
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(descriptor)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(descriptor, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    identity = lambda value: (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns, value.st_ctime_ns)
    if identity(before) != identity(after) or identity(after) != identity(path.lstat()):
        raise ValueError("toctou:" + str(path))
    raw = b"".join(chunks)
    if len(raw) != after.st_size:
        raise ValueError("short-read:" + str(path))
    return raw


def load(path: Path) -> Any:
    return parse_json(stable_read(path))


def rows(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line, object_pairs_hook=_pairs) for line in stable_read(path).decode("utf-8").splitlines() if line.strip()]


def file_binding(path: Path) -> dict[str, Any]:
    raw = stable_read(path)
    binding = {"path": str(path), "byte_count": len(raw), "raw_sha256": sha_bytes(raw)}
    if path.suffix == ".json":
        binding["canonical_sha256"] = canonical_sha(parse_json(raw))
    return binding


def write_exclusive(path: Path, raw: bytes, mode: int = 0o444) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    try:
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            view = view[written:]
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def write_json(path: Path, value: Any, mode: int = 0o444) -> None:
    write_exclusive(path, json_bytes(value), mode)


def write_jsonl(path: Path, values: list[dict[str, Any]], mode: int = 0o444) -> None:
    raw = b"".join(json_bytes(value, pretty=False) + b"\n" for value in values)
    write_exclusive(path, raw, mode)


def tree_inventory(path: Path) -> dict[str, Any]:
    files = sorted(item for item in path.rglob("*") if item.is_file())
    rows_value = []
    for item in files:
        raw = stable_read(item)
        rows_value.append({"path": item.relative_to(path).as_posix(), "byte_count": len(raw), "sha256": sha_bytes(raw)})
    return {
        "path": str(path),
        "file_count": len(rows_value),
        "byte_count": sum(row["byte_count"] for row in rows_value),
        "inventory_sha256": canonical_sha(rows_value),
    }


def output_inventory(path: Path) -> list[dict[str, Any]]:
    info = path.lstat()
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
        raise ValueError("output-not-directory")
    items: list[dict[str, Any]] = []
    for item in sorted(path.rglob("*"), key=lambda value: value.relative_to(path).as_posix()):
        current = item.lstat()
        relative = item.relative_to(path).as_posix()
        if stat.S_ISLNK(current.st_mode):
            raise ValueError("output-symlink:" + relative)
        if stat.S_ISDIR(current.st_mode):
            items.append({"path": relative + "/", "kind": "directory"})
        elif stat.S_ISREG(current.st_mode) and current.st_nlink == 1:
            raw = stable_read(item)
            items.append({"path": relative, "kind": "file", "byte_count": len(raw), "sha256": sha_bytes(raw)})
        else:
            raise ValueError("output-nonregular:" + relative)
    return items


def attempt3_agent_path(assignment_id: str) -> str:
    return f"/root/sol_controller_v29/a005_scenario_adversarial_{assignment_id[-4:]}_semantic_repair_attempt_0003_ultra_v32"


def output_directory(assignment_id: str) -> Path:
    return HERE / f"outputs/{assignment_id}/attempt-0003"


def packet_path(assignment_id: str) -> Path:
    return WAVE / f"packets/SAPKT-{assignment_id[-4:]}.json"


def fixture_path(assignment_id: str) -> Path:
    return HERE / f"fixtures/validator-clean/{assignment_id}.json"


def obligation_packet_path(assignment_id: str) -> Path:
    return HERE / f"packets/{assignment_id}.json"


def intent_path(assignment_id: str) -> Path:
    return HERE / f"intents/{assignment_id}.json"


def source_rows() -> dict[str, dict[str, Any]]:
    return {row["assignment_id"]: row for row in rows(SOURCE_MANIFEST) if row.get("assignment_id") in ASSIGNMENTS}


def attempt3_row(assignment_id: str) -> dict[str, Any]:
    row = copy.deepcopy(source_rows()[assignment_id])
    row["attempt_id"] = ATTEMPT_ID
    row["prospective_agent_path"] = attempt3_agent_path(assignment_id)
    row["output_directory"] = str(output_directory(assignment_id))
    row["model"] = "gpt-5.6-sol"
    row["reasoning_effort"] = "ultra"
    row["result_schema_ref"] = str(RESULT_SCHEMA)
    row["research_binding_by_feature"] = {
        ref: ({"result_file_sha256": value[0], "research_record_sha256": value[1]} if isinstance(value, list) else value)
        for ref, value in row["research_binding_by_feature"].items()
    }
    return row


def packet_question_counts(assignment_id: str) -> dict[str, int]:
    packet = load(packet_path(assignment_id))
    table = packet["string_table"]
    return {table[feature[0]]: len(feature[9]) for feature in packet["features"]}


def packet_questions(assignment_id: str) -> dict[str, list[str]]:
    packet = load(packet_path(assignment_id))
    table = packet["string_table"]
    result = {table[feature[0]]: [table[index] for index in feature[9]] for feature in packet["features"]}
    if sum(len(value) for value in result.values()) != QUESTION_COUNTS[assignment_id]:
        raise ValueError("question-count:" + assignment_id)
    return result


def question_obligations(assignment_id: str) -> dict[str, list[dict[str, Any]]]:
    row = attempt3_row(assignment_id)
    questions = packet_questions(assignment_id)
    result: dict[str, list[dict[str, Any]]] = {}
    for feature_index, feature_ref in enumerate(row["feature_refs"], 1):
        mapped = []
        for question_index, question in enumerate(questions[feature_ref], 1):
            dimension = DIMENSIONS[(question_index - 1) % len(DIMENSIONS)]
            question_id = f"Q-{assignment_id[-4:]}-{feature_index:04d}-{question_index:03d}"
            mapped.append({
                "question_id": question_id,
                "question": question,
                "required_dimension": dimension,
                "required_scenario_prefix": f"[{question_id}] {question} ::",
            })
        result[feature_ref] = mapped
    return result


def build_result_schema() -> dict[str, Any]:
    schema = copy.deepcopy(load(FROZEN_RESULT_SCHEMA))
    schema["$id"] = "https://puppetmaster.local/audit005/scenario/cohort-0002/semantic-repair-attempt-0003-v32.schema.json"
    schema["title"] = "Audit005 cohort-0002 semantic repair attempt-0003 V32 validator-driven result"
    schema["properties"]["schema_version"] = {"const": "scenario-adversarial-semantic-repair-result-v32-v1"}
    schema["properties"]["attempt_id"] = {"const": ATTEMPT_ID}
    schema["properties"]["task_thread_id"] = {
        "type": "string",
        "pattern": "^/root/sol_controller_v29/a005_scenario_adversarial_(0009|0010|0012|0013|0014|0016)_semantic_repair_attempt_0003_ultra_v32$",
    }
    schema.pop("x-v31-live-research", None)
    schema["x-v32-attempt3-contract"] = {
        "frozen_result_errors_sha256": FROZEN_VALIDATOR_SHA,
        "compatibility_projection_fields": ["schema_version", "attempt_id", "task_thread_id"],
        "attempt3_identity_validated_before_projection": True,
        "all_nonbinding_fields_byte-semantically-preserved": True,
        "required_dimensions": DIMENSIONS,
        "question_scenario_coverage_required": True,
        "registrable_domain_and_authority_id_uniqueness_required": True,
        "no_evidence_requires_two_distinct_attempts_and_blocked_disposition": True,
        "concrete_unequal_oracles_required": True,
        "exclusive_write_only_after_zero_errors": True,
    }
    return schema


def make_dimension(feature_ref: str, name: str, mapped_questions: list[dict[str, Any]], certified: bool) -> dict[str, Any]:
    scenarios = [f"Exercise the baseline {name} scenario for {feature_ref} with explicit observable state."]
    scenarios.extend(
        item["required_scenario_prefix"] + f" validate this exact packet question within {name} for {feature_ref}."
        for item in mapped_questions if item["required_dimension"] == name
    )
    disposition = "certified" if certified else "blocked_insufficient_evidence"
    return {
        "disposition": disposition,
        "rationale": f"This {name} dimension records a concrete, independently checkable disposition for {feature_ref}.",
        "scenarios": scenarios,
        "acceptance_criteria": [{
            "criterion": f"Validate the {name} behavior for {feature_ref} against the recorded evidence boundary.",
            "observables": [f"The {name} state transition and terminal outcome are recorded for {feature_ref}."],
            "evidence_artifacts": [f"A validator report covering {name} for {feature_ref}."],
            "oracle": {
                "pass": f"Pass when every required {name} observable matches the expected state for {feature_ref}.",
                "fail": f"Fail when any required {name} observable diverges from the expected state for {feature_ref}.",
            },
        }],
        "spec_deltas": [] if certified else [f"Specify the missing {name} authority evidence and executable behavior for {feature_ref}."],
    }


def make_certification(row: dict[str, Any], feature_ref: str, mapped_questions: list[dict[str, Any]], certified: bool) -> dict[str, Any]:
    research_binding = row["research_binding_by_feature"][feature_ref]
    dimensions = {name: make_dimension(feature_ref, name, mapped_questions, certified) for name in DIMENSIONS}
    if certified:
        sources = [
            {
                "source_id": "SRC-W3C", "url": "https://www.w3.org/TR/WCAG22/", "canonical_url": "https://www.w3.org/TR/WCAG22/",
                "registrable_domain": "w3.org", "title": "Web Content Accessibility Guidelines 2.2", "publisher": "W3C",
                "authority_id": "W3C-WCAG22", "authority_class": "official_standard", "accessed_at": "2026-07-12T10:00:00Z",
                "retrieval": {"status": "read", "final_url": "https://www.w3.org/TR/WCAG22/", "http_status": 200, "content_sha256": "1" * 64, "receipt_sha256": "2" * 64, "resolved_ips": ["8.8.8.8"], "redirect_chain": []},
            },
            {
                "source_id": "SRC-NIST", "url": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final", "canonical_url": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
                "registrable_domain": "nist.gov", "title": "NIST Special Publication 800-53 Revision 5", "publisher": "NIST",
                "authority_id": "NIST-SP800-53", "authority_class": "official_government", "accessed_at": "2026-07-12T10:00:00Z",
                "retrieval": {"status": "read", "final_url": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final", "http_status": 200, "content_sha256": "3" * 64, "receipt_sha256": "4" * 64, "resolved_ips": ["1.1.1.1"], "redirect_chain": []},
            },
        ]
        mappings = [
            {"claim_id": "CLM-W3C", "claim": "The W3C authority directly supports this synthetic validator fixture claim.", "evidence_class": "supported_claim", "source_ids": ["SRC-W3C"], "evidence_label": "direct-w3c-authority"},
            {"claim_id": "CLM-NIST", "claim": "The NIST authority independently supports this synthetic validator fixture claim.", "evidence_class": "supported_claim", "source_ids": ["SRC-NIST"], "evidence_label": "direct-nist-authority"},
        ]
        claims = [
            {"claim_id": mapping["claim_id"], "claim": mapping["claim"], "source_urls": [sources[index]["url"]], "evidence_label": mapping["evidence_label"]}
            for index, mapping in enumerate(mappings)
        ]
        evidence_state = "applicable"
        research_state = "applicable"
        disposition = "certified"
        overall_deltas: list[str] = []
    else:
        sources = []
        mappings = []
        claims = []
        evidence_state = "no_evidence"
        research_state = "insufficient"
        disposition = "blocked_insufficient_evidence"
        overall_deltas = [f"Specify the missing live independent authority evidence and executable contract for {feature_ref}."]
    return {
        "provisional_feature_ref": feature_ref,
        "source_row_sha256": row["source_row_sha256_by_feature"][feature_ref],
        "research_result_file_sha256": research_binding["result_file_sha256"],
        "research_record_sha256": research_binding["research_record_sha256"],
        "certification_disposition": disposition,
        "disposition_rationale": f"This synthetic validator fixture records a complete {disposition} disposition for {feature_ref}.",
        "research_applicability": {"state": research_state, "rationale": f"Live research applicability is explicitly recorded for {feature_ref}.", "browsing_performed": True, "claims_used": claims},
        "live_research": {
            "performed": True, "evidence_state": evidence_state, "session_id": f"synthetic-validator-fixture-{feature_ref}",
            "started_at": "2026-07-12T10:00:00Z", "completed_at": "2026-07-12T10:01:00Z",
            "attempts": [
                {"query": f"Official authority requirements for {feature_ref}", "method": "public_web", "outcome": f"Completed a direct authority search for {feature_ref}."},
                {"query": f"Independent standards evidence for {feature_ref}", "method": "public_web", "outcome": f"Completed a second independent evidence search for {feature_ref}."},
            ],
        },
        "source_registry": sources,
        "claim_support": mappings,
        "dimensions": dimensions,
        "overall_spec_deltas": overall_deltas,
        "newly_discovered_candidates": [],
    }


def build_fixture(assignment_id: str) -> dict[str, Any]:
    row = attempt3_row(assignment_id)
    mappings = question_obligations(assignment_id)
    certifications = [make_certification(row, ref, mappings[ref], index == 0) for index, ref in enumerate(row["feature_refs"])]
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "scenario-adversarial-semantic-repair-result-v32-v1",
        "phase": "scenario_adversarial_certification",
        "cohort_id": "cohort-0002",
        "assignment_id": assignment_id,
        "attempt_id": ATTEMPT_ID,
        "task_thread_id": attempt3_agent_path(assignment_id),
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "status": "completed",
        "input_binding": {
            "packet_id": row["packet_id"], "packet_sha256": row["packet_sha256"],
            "feature_refs_digest": row["feature_refs_digest"], "candidate_evidence_label": row["candidate_evidence_label"],
        },
        "coverage": {"feature_count": row["feature_count"], "feature_refs": row["feature_refs"]},
        "feature_certifications": certifications,
        "self_attestation": {key: True for key in SELF_ATTESTATION_KEYS},
    }


def observed_families_document() -> dict[str, Any]:
    shared: list[dict[str, Any]] = [
        {"family": "base:coverage", "count": 6},
        {"family": "base:feature:<feature>:insufficient-question-scenario-coverage", "count": 687},
    ]
    shared.extend({"family": f"base:feature:<feature>:missing-dimension:{name}", "count": 687} for name in DIMENSIONS)
    shared.extend([
        {"family": "base:input-binding:candidate_evidence_label", "count": 6},
        {"family": "base:input-binding:packet_sha256", "count": 6},
        {"family": "base:schema:coverage:missing:feature_count", "count": 6},
        {"family": "base:schema:coverage:missing:feature_refs", "count": 6},
        {"family": "base:schema:coverage:additional-properties", "count": 6},
    ])
    shared.extend({"family": f"base:schema:feature:<feature>:dimensions:missing:{name}", "count": 687} for name in DIMENSIONS)
    shared.extend([
        {"family": "base:schema:feature:<feature>:dimensions:additional-properties", "count": 687},
        {"family": "base:schema:input_binding:missing:candidate_evidence_label", "count": 6},
        {"family": "base:schema:input_binding:missing:packet_sha256", "count": 6},
        {"family": "base:schema:input_binding:additional-properties", "count": 6},
    ])
    shared.extend({"family": f"base:schema:self_attestation:missing:{key}", "count": 6} for key in SELF_ATTESTATION_KEYS)
    shared.extend([
        {"family": "base:schema:self_attestation:additional-properties", "count": 6},
        {"family": "feature:<feature>:duplicate-registrable-domain", "count": 54, "by_assignment": {"A005SA-0009": 23, "A005SA-0010": 2, "A005SA-0012": 4, "A005SA-0013": 2, "A005SA-0014": 9, "A005SA-0016": 14}},
        {"family": "feature:<feature>:source:<source>:canonical-url", "count": 36, "by_assignment": {"A005SA-0009": 1, "A005SA-0010": 4, "A005SA-0012": 10, "A005SA-0013": 1, "A005SA-0014": 3, "A005SA-0016": 17}},
    ])
    specific = [
        {"family": "base:input-binding:feature_refs_digest", "count": 2, "assignments": ["A005SA-0012", "A005SA-0016"]},
        {"family": "base:schema:input_binding:missing:feature_refs_digest", "count": 2, "assignments": ["A005SA-0012", "A005SA-0016"]},
        {"family": "base:input-binding:packet_id", "count": 2, "assignments": ["A005SA-0012", "A005SA-0016"]},
        {"family": "base:schema:input_binding:missing:packet_id", "count": 2, "assignments": ["A005SA-0012", "A005SA-0016"]},
        {"family": "feature:<feature>:base-claim-projection", "count": 92, "by_assignment": {"A005SA-0012": 92}},
        {"family": "feature:<feature>:certified-below-live-independent-authority-threshold", "count": 11, "by_assignment": {"A005SA-0012": 11}},
        {"family": "feature:<feature>:duplicate-authority-id", "count": 18, "by_assignment": {"A005SA-0012": 1, "A005SA-0014": 9, "A005SA-0016": 8}},
        {"family": "feature:<feature>:insufficient-evidence-must-block", "count": 93, "by_assignment": {"A005SA-0010": 2, "A005SA-0012": 91}},
        {"family": "feature:<feature>:missing-concrete-blocked-dimension", "count": 301, "by_assignment": {"A005SA-0009": 53, "A005SA-0010": 88, "A005SA-0012": 92, "A005SA-0013": 68}},
        {"family": "feature:<feature>:source:<source>:registrable-domain", "count": 2, "by_assignment": {"A005SA-0009": 2}},
    ]
    assert len(shared) == 41 and len(specific) == 10
    assert sum(row["count"] for row in shared) == 15306
    assert sum(row["count"] for row in specific) == 525
    return {
        "schema_version": "scenario-adversarial-attempt3-observed-error-families-v32-v1",
        "normalization": "feature and source indexes stripped; compact semantic families only",
        "source_primary_report": {"path": str(PRIMARY), "raw_sha256": PRIMARY_SHA},
        "complete_localization": {"path": str(ERROR_LOCALIZATION), "row_count": 15831, "aggregate_assignment_tab_error_digest_sha256": LOCALIZATION_DIGEST},
        "aggregate": {"shared_family_count": 41, "shared_error_count": 15306, "assignment_specific_family_count": 10, "assignment_specific_error_count": 525, "family_count": 51, "error_count": 15831},
        "assignment_totals": ERROR_TOTALS,
        "assignment_partition": {
            "A005SA-0009": {"shared": 2879, "assignment_specific": 55}, "A005SA-0010": {"shared": 2817, "assignment_specific": 90},
            "A005SA-0012": {"shared": 2055, "assignment_specific": 291}, "A005SA-0013": {"shared": 2044, "assignment_specific": 68},
            "A005SA-0014": {"shared": 3263, "assignment_specific": 9}, "A005SA-0016": {"shared": 2248, "assignment_specific": 12},
        },
        "shared": shared,
        "assignment_specific": specific,
    }


def build_obligation_packet(assignment_id: str) -> dict[str, Any]:
    row = attempt3_row(assignment_id)
    questions = question_obligations(assignment_id)
    prior = ATTEMPT2_ARTIFACTS[assignment_id]
    features = []
    for ref in row["feature_refs"]:
        features.append({
            "provisional_feature_ref": ref,
            "question_count": len(questions[ref]),
            "question_to_scenario_mapping": questions[ref],
            "minimum_total_scenarios": len(DIMENSIONS) + len(questions[ref]),
            "source_row_sha256": row["source_row_sha256_by_feature"][ref],
            "research_binding": row["research_binding_by_feature"][ref],
            "required_dimensions": DIMENSIONS,
            "obligations": {
                "question_scenario_coverage": "every exact packet question ID and text must occur in its mapped dimension scenario; count-only coverage is insufficient",
                "dimension_completeness": "every required dimension must include disposition rationale scenarios acceptance criteria and spec deltas",
                "live_evidence": "certified requires live public-web evidence from at least two unique qualifying registrable domains and authority IDs",
                "source_integrity": "HTTPS nonplaceholder canonical URLs, public resolved IPs, successful retrieval, and mapped claims are mandatory",
                "no_evidence": "two distinct concrete searches, no references, insufficient state, blocked disposition, and concrete deltas are mandatory",
                "oracle": "every acceptance criterion requires concrete nonempty observables and evidence artifacts with unequal pass and fail text",
            },
        })
    return {
        "schema_version": "scenario-adversarial-attempt3-obligation-packet-v32-v1",
        "audit_id": AUDIT_ID, "wave_id": "wave-0001", "cohort_id": "cohort-0002", "assignment_id": assignment_id, "attempt_id": ATTEMPT_ID,
        "source_packet": file_binding(packet_path(assignment_id)),
        "attempt2_rejected_result": {"path": str(GATE / f"outputs/{assignment_id}/attempt-0002/result.json"), "raw_sha256": prior["result"]},
        "attempt2_terminal_receipt": {"path": str(GATE / f"outputs/{assignment_id}/attempt-0002/terminal_receipt.json"), "raw_sha256": prior["receipt"]},
        "attempt2_error_closure": ERROR_TOTALS[assignment_id],
        "feature_count": row["feature_count"], "feature_refs_digest": row["feature_refs_digest"], "features": features,
        "question_count": QUESTION_COUNTS[assignment_id],
        "fresh_future_identity": {"agent_path": attempt3_agent_path(assignment_id), "model": "gpt-5.6-sol", "reasoning_effort": "ultra", "fork_turns": "none", "state": "reserved_unallocated", "native_child_thread_id": None},
        "output": {"path": str(output_directory(assignment_id)), "expected_file_count": 0, "inventory_sha256": EMPTY_TREE_SHA},
        "activation": False, "launch": False, "credit": 0,
    }


def build_template() -> dict[str, Any]:
    return {
        "schema_version": "scenario-adversarial-attempt3-feature-template-v32-v1",
        "not_a_result": True,
        "warning": "This template is structural guidance only. Never submit synthetic fixture evidence or unresolved template tokens.",
        "top_level_required": ["audit_id", "schema_version", "phase", "cohort_id", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "feature_certifications", "self_attestation"],
        "feature_required": ["provisional_feature_ref", "source_row_sha256", "research_result_file_sha256", "research_record_sha256", "certification_disposition", "disposition_rationale", "research_applicability", "live_research", "source_registry", "claim_support", "dimensions", "overall_spec_deltas", "newly_discovered_candidates"],
        "required_dimensions": DIMENSIONS,
        "certified_branch": {"minimum_sources": 2, "minimum_registrable_domains": 2, "minimum_authority_ids": 2, "live_public_web": True, "claim_mapping": "exact and complete"},
        "no_evidence_branch": {"minimum_distinct_queries": 2, "source_registry": [], "claim_support": [], "claims_used": [], "research_state": "insufficient", "certification_disposition": "blocked_insufficient_evidence", "concrete_deltas": True},
        "oracle_contract": {"pass": "concrete nonplaceholder text", "fail": "concrete nonplaceholder text unequal to pass", "observables": "nonempty concrete list", "evidence_artifacts": "nonempty concrete list"},
        "question_mapping_contract": {"source": "exact decoded packet features[*][9] through string_table", "stable_question_ids": True, "exact_question_text_in_mapped_scenario": True, "count_only_coverage_forbidden": True},
        "compatibility_projection": {"validated_first": "true attempt3 schema and identity", "changed_fields_only": ["schema_version", "attempt_id", "task_thread_id"], "semantic_payload_preserved": True, "frozen_function": "result_errors"},
    }


def build_prompt() -> dict[str, Any]:
    return {
        "schema_version": "scenario-adversarial-attempt3-leaf-prompt-v32-v1",
        "gate_id": GATE_ID,
        "role": "future fresh direct Sol ultra semantic-repair leaf",
        "instructions": [
            "Read only your attempt3 obligation packet, source packet, result schema, template, and frozen-validator preflight wrapper.",
            "Perform independent live public-web research for every feature; test fixtures are synthetic and forbidden as result evidence.",
            "Cover every packet question with at least one scenario across the ten exact required dimensions, including accessibility_i18n_user_comprehension.",
            "Preserve every stable question ID and exact decoded question text in the mapped dimension scenario; aggregate scenario counts do not satisfy this contract.",
            "Certified claims require at least two unique qualifying registrable domains and two unique authority IDs with exact source and claim mappings.",
            "No-evidence findings require two distinct concrete searches, no source or claim references, blocked disposition, and concrete executable deltas.",
            "Every criterion must contain concrete observables and evidence artifacts plus unequal concrete pass and fail oracles.",
            "Write a candidate outside the output directory. Run the exact leaf preflight with --exclusive-write; it invokes frozen result_errors and refuses any nonzero error set.",
            "The preflight validates true attempt3 identity first, then changes only schema_version, attempt_id, and task_thread_id in an in-memory compatibility projection; every semantic field remains unchanged for frozen validation.",
            "Only after the exclusive write succeeds may the terminal response be exactly PMR1. Do not write receipts, capture, activation, or any other output file.",
        ],
        "preflight_command_template": PINNED_COMMAND_PREFIX + " preflight_attempt3_v32.py --assignment-id {ASSIGNMENT_ID} --candidate {ABSOLUTE_CANDIDATE_JSON} --exclusive-write",
        "audit_runtime": {"python": str(AUDIT_PYTHON), "python_version": "3.12.13", "pythonpath": str(JSONSCHEMA_SITE), "jsonschema_version": "4.26.0", "validator_class": "jsonschema.validators.Draft202012Validator", "flags": ["PYTHONNOUSERSITE=1", "PYTHONDONTWRITEBYTECODE=1", "-S", "-B"]},
        "terminal_response_after_success": "PMR1",
        "forbidden": ["subagents", "followups", "retries", "controller calls", "plan edits", "activation", "receipt writes", "fixture evidence", "write before zero errors"],
    }


def build_test_matrix() -> dict[str, Any]:
    return {
        "schema_version": "scenario-adversarial-attempt3-test-matrix-v32-v1",
        "minimum_required": 900,
        "expected_total": 1024,
        "categories": [
            {"category": "validator_clean_packet_shapes", "positive": 6, "negative": 0, "total": 6},
            {"category": "per_feature_required_dimension_fail_closed", "positive": 0, "negative": 687, "total": 687},
            {"category": "question_scenario_coverage_fail_closed", "positive": 0, "negative": 200, "total": 200},
            {"category": "observed_and_contract_family_mutations", "positive": 0, "negative": 131, "total": 131},
        ],
        "observed_family_partition": {"families": 51, "errors": 15831, "shared_families": 41, "shared_errors": 15306, "specific_families": 10, "specific_errors": 525},
        "question_mapping": {"decoded_questions": 713, "by_assignment": QUESTION_COUNTS, "negative_mapping_cases_required": True},
    }


def normalize_observed_error(error: str) -> str:
    if error == "base:coverage":
        return error
    for name in DIMENSIONS:
        if re.fullmatch(rf"base:feature:.+:missing-dimension:{re.escape(name)}", error):
            return f"base:feature:<feature>:missing-dimension:{name}"
        if re.fullmatch(rf"base:schema:feature_certifications/\d+/dimensions:'{re.escape(name)}' is a required property", error):
            return f"base:schema:feature:<feature>:dimensions:missing:{name}"
    if re.fullmatch(r"base:feature:.+:insufficient-question-scenario-coverage", error):
        return "base:feature:<feature>:insufficient-question-scenario-coverage"
    if error in {"base:input-binding:candidate_evidence_label", "base:input-binding:feature_refs_digest", "base:input-binding:packet_id", "base:input-binding:packet_sha256"}:
        return error
    required_patterns = {
        "base:schema:coverage:'feature_count' is a required property": "base:schema:coverage:missing:feature_count",
        "base:schema:coverage:'feature_refs' is a required property": "base:schema:coverage:missing:feature_refs",
        "base:schema:input_binding:'candidate_evidence_label' is a required property": "base:schema:input_binding:missing:candidate_evidence_label",
        "base:schema:input_binding:'feature_refs_digest' is a required property": "base:schema:input_binding:missing:feature_refs_digest",
        "base:schema:input_binding:'packet_id' is a required property": "base:schema:input_binding:missing:packet_id",
        "base:schema:input_binding:'packet_sha256' is a required property": "base:schema:input_binding:missing:packet_sha256",
    }
    if error in required_patterns:
        return required_patterns[error]
    if error.startswith("base:schema:coverage:Additional properties are not allowed"):
        return "base:schema:coverage:additional-properties"
    if error.startswith("base:schema:input_binding:Additional properties are not allowed"):
        return "base:schema:input_binding:additional-properties"
    if re.match(r"base:schema:feature_certifications/\d+/dimensions:Additional properties are not allowed", error):
        return "base:schema:feature:<feature>:dimensions:additional-properties"
    for key in SELF_ATTESTATION_KEYS:
        if error == f"base:schema:self_attestation:'{key}' is a required property":
            return f"base:schema:self_attestation:missing:{key}"
    if error.startswith("base:schema:self_attestation:Additional properties are not allowed"):
        return "base:schema:self_attestation:additional-properties"
    suffixes = {
        "base-claim-projection", "certified-below-live-independent-authority-threshold", "duplicate-authority-id",
        "duplicate-registrable-domain", "insufficient-evidence-must-block", "missing-concrete-blocked-dimension",
    }
    for suffix in suffixes:
        if re.fullmatch(rf"feature:.+:{re.escape(suffix)}", error):
            return f"feature:<feature>:{suffix}"
    if re.fullmatch(r"feature:.+:source:\d+:canonical-url", error):
        return "feature:<feature>:source:<source>:canonical-url"
    if re.fullmatch(r"feature:.+:source:\d+:registrable-domain", error):
        return "feature:<feature>:source:<source>:registrable-domain"
    raise ValueError("unmapped-observed-error:" + error)
