#!/usr/bin/env python3
"""Prepare, but never activate, the V30 attempt-0002 certification retry."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001"
HERE = Path(__file__).resolve().parents[1]
TOOLS = HERE / "tools"
V8 = WAVE / "validation/activation-binding-v8-validator-runtime-supersession"
V29 = V8 / "activation-transactions-v29-ultra"
OUTPUT_ROOT = AUDIT / "external_research_universal_shadow_certification_v1"
BASE_SCHEMA = WAVE / "schemas/result.schema.json"
MANIFEST_V1 = WAVE / "batch_manifest.jsonl"
ATTEMPT = "attempt-0002"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
CONTROLLER_PATH = "/root/sol_controller_v29"
SOURCE_TRANSACTION_DIGEST = "c4ce218e0aa044d850b1b026fe10b98766138748b585e2680916fb80964cc70f"
POLICY_V30_SHA = "f56d5680c33e81f0c4ac6232d3edbce8a1a1d2617518b0901f62674e7782af79"
PRIMARY_SHAS = {
    "cohort-0001": "45bec51e3bedc80f9ca2af7bb10d0fdecf581021a803eae723bc0d699084f214",
    "cohort-0002": "c756c049c3ae93c518b155d69c64b595e05c2ae04b62f82226c4dd7d89c60454",
}
V8_PINS = {
    "authority_v8": (V8 / "AUTHORITY_V8.json", "f36db3670c6d33f4c3bac0832ac9f788ea6193d5dacf5b4f9f608bbb1d51258c"),
    "verify_binding_v8": (V8 / "verify_binding_v8.py", "50ce0b82787b9b5a6ae70820a2c4dfaba723bc626ef3fdf316ee554c0a4e1c9c"),
    "test_binding_v8": (V8 / "test_binding_v8.py", "7e92eac72fc39506234b7ba6a4fac22da0d0118ca9fe6683a4b2e65d87d7652a"),
    "validator_v2": (WAVE / "validation/postrun-validator-v2/validate_universal_shadow_certification_postrun_v2.py", "789bca95c1dbd8ef89a5db06c041c23c67ef330324552ebb1e3602fd24cfa254"),
    "tests_v2": (WAVE / "validation/postrun-validator-v2/test_universal_shadow_certification_postrun_v2.py", "f42b563c1c13010695f2ab3cab37eef4d763738928c48655f59a5a746ce79961"),
    "validator_authority_v2": (WAVE / "validation/postrun-validator-v2/VALIDATOR_AUTHORITY_V2.json", "9eec930af0efebee5734892d2d0d9e5836a2bb79928c817492cd73a1ea7d4b97"),
    "base_result_schema": (BASE_SCHEMA, "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1"),
    "dependency_binding": (WAVE / "validation/postrun-validator-v2/dependency-binding-v1/terminal-independent-binding-report.json", "f5cb2e7cc0bb51153c606a37f2808df33a4f815270712cd1f92b427707347b37"),
    "cache_authority": (AUDIT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/authority.json", "f82c8796be8802ac3735c4e24c74b48b54efe2752e0a294c2844d7f98b2a03bc"),
    "cache_report": (AUDIT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/terminal-cache-reconciliation-v3.json", "1b7b88edbcba737e81a02fc81e0b87600c58e3be300f91429c9d61dec653e88e"),
}
TOOL_NAMES = (
    "prepare_retry_attempt_0002_v30.py",
    "verify_retry_attempt_0002_v30.py",
    "test_retry_attempt_0002_v30.py",
)


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def digest_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def object_sha(value: Any) -> str:
    return digest_bytes(canonical(value))


def write_once(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, canonical(value))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def write_jsonl_once(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = b"".join(canonical(row) for row in rows)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, raw)
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def ids_for(cohort_id: str) -> list[str]:
    start = 1 if cohort_id == "cohort-0001" else 9
    return [f"A005ERSC-{number:04d}" for number in range(start, start + 8)]


def agent_path(assignment_id: str) -> str:
    return f"{CONTROLLER_PATH}/a005_ersc_{int(assignment_id[-4:]):04d}_attempt_0002_ultra_v30"


def output_dir(assignment_id: str) -> Path:
    return OUTPUT_ROOT / assignment_id / "attempts/attempt-0002"


def prior_result(assignment_id: str) -> Path:
    return OUTPUT_ROOT / assignment_id / "attempts/attempt-0001/result.json"


def prior_receipt(assignment_id: str) -> Path:
    return WAVE / f"dispatch/{assignment_id}/attempt-0001/dispatch_receipt.json"


def relative(path: Path) -> str:
    return str(path.resolve().relative_to(AUDIT.resolve()))


def assert_inputs(rows: list[dict[str, Any]]) -> None:
    errors: list[str] = []
    expected_ids = [f"A005ERSC-{number:04d}" for number in range(1, 17)]
    if [row.get("assignment_id") for row in rows] != expected_ids:
        errors.append("manifest:ordered-assignment-set")
    for name, (path, expected) in V8_PINS.items():
        if not path.is_file() or sha(path) != expected:
            errors.append(f"v8-pin:{name}")
    policy = AUDIT / "master/coordination/CONCURRENCY_POLICY_V30.json"
    if not policy.is_file() or sha(policy) != POLICY_V30_SHA:
        errors.append("policy-v30")
    existing_payload_files = [
        path.relative_to(HERE).as_posix()
        for path in HERE.rglob("*")
        if path.is_file() and path.parent != TOOLS
    ]
    if existing_payload_files:
        errors.append("namespace:not-new:" + ",".join(sorted(existing_payload_files)))
    if sorted(path.name for path in TOOLS.iterdir() if path.is_file()) != sorted(TOOL_NAMES):
        errors.append("tools:incomplete")
    all_refs: list[str] = []
    for row in rows:
        aid = row["assignment_id"]
        packet = WAVE / row["packet_ref"]
        result = prior_result(aid)
        receipt = prior_receipt(aid)
        if row.get("feature_count") != 243 or len(row.get("feature_refs", [])) != 243:
            errors.append(f"{aid}:feature-count")
        if not packet.is_file() or sha(packet) != row.get("packet_sha256"):
            errors.append(f"{aid}:packet")
        if not result.is_file() or not receipt.is_file():
            errors.append(f"{aid}:attempt1-artifacts")
        if output_dir(aid).exists():
            errors.append(f"{aid}:attempt2-output-exists")
        all_refs.extend(row.get("feature_refs", []))
    if len(all_refs) != 3888 or len(set(all_refs)) != 3888:
        errors.append("coverage:3888-unique")
    for cohort_id, expected_sha in PRIMARY_SHAS.items():
        path = V29 / cohort_id / "postrun/primary_postrun.json"
        if not path.is_file() or sha(path) != expected_sha:
            errors.append(f"{cohort_id}:primary-sha")
            continue
        report = load(path)
        ids = ids_for(cohort_id)
        statuses = report.get("assignment_statuses", {})
        if report.get("rejected_count") != 8 or report.get("eligible_count") != 0:
            errors.append(f"{cohort_id}:exact-rejected8-eligible0")
        if report.get("rejected_ids") != ids or report.get("eligible_ids") != []:
            errors.append(f"{cohort_id}:exact-rejected-set")
        for aid in ids:
            item = statuses.get(aid, {})
            item_errors = item.get("errors", [])
            if item.get("status") != "rejected" or len(item_errors) != 2:
                errors.append(f"{aid}:rejection-shape")
            if "input-binding:source_transaction_digest" not in item_errors:
                errors.append(f"{aid}:digest-rejection")
            if not any(error.startswith("schema:agent_path:") for error in item_errors):
                errors.append(f"{aid}:path-rejection")
    if errors:
        raise RuntimeError(";".join(sorted(set(errors))))


def build_schema(cohort_id: str, selected: list[dict[str, Any]]) -> dict[str, Any]:
    schema = copy.deepcopy(load(BASE_SCHEMA))
    ids = [row["assignment_id"] for row in selected]
    paths = [agent_path(aid) for aid in ids]
    properties = schema["properties"]
    properties["assignment_id"] = {"type": "string", "enum": ids}
    properties["attempt_id"] = {"const": ATTEMPT}
    properties["agent_path"] = {"type": "string", "enum": paths}
    properties["model"] = {"const": MODEL}
    properties["reasoning_effort"] = {"const": EFFORT}
    properties["input_binding"]["properties"]["source_transaction_digest"] = {
        "type": "string", "const": SOURCE_TRANSACTION_DIGEST
    }
    branches: list[dict[str, Any]] = []
    for row in selected:
        aid = row["assignment_id"]
        branches.append({
            "type": "object",
            "required": ["assignment_id", "agent_path", "input_binding"],
            "properties": {
                "assignment_id": {"const": aid},
                "agent_path": {"const": agent_path(aid)},
                "input_binding": {
                    "type": "object",
                    "required": ["packet_id", "packet_sha256", "feature_refs_digest", "source_transaction_digest"],
                    "properties": {
                        "packet_id": {"const": row["packet_id"]},
                        "packet_sha256": {"const": row["packet_sha256"]},
                        "feature_refs_digest": {"const": row["feature_refs_digest"]},
                        "source_transaction_digest": {"const": SOURCE_TRANSACTION_DIGEST},
                    },
                },
            },
        })
    schema["allOf"] = [{"oneOf": branches}]
    schema["$id"] = f"urn:puppetmaster:audit005:universal-shadow-certification:{ATTEMPT}:{cohort_id}:v30"
    schema["x-a005-retry-attempt-0002-v30"] = {
        "cohort_id": cohort_id,
        "base_schema_sha256": V8_PINS["base_result_schema"][1],
        "source_transaction_digest_const": SOURCE_TRANSACTION_DIGEST,
        "exact_agent_path_pairing": True,
        "schema_checks_removed": 0,
        "semantic_checks_removed": 0,
    }
    Draft202012Validator.check_schema(schema)
    return schema


def corrected_result(row: dict[str, Any]) -> dict[str, Any]:
    value = copy.deepcopy(load(prior_result(row["assignment_id"])))
    value["attempt_id"] = ATTEMPT
    value["agent_path"] = agent_path(row["assignment_id"])
    value["input_binding"]["source_transaction_digest"] = SOURCE_TRANSACTION_DIGEST
    return value


def build_inventory(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    paths = {path.resolve() for path in V29.rglob("*") if path.is_file()}
    for row in rows:
        paths.add(prior_result(row["assignment_id"]).resolve())
        paths.add(prior_receipt(row["assignment_id"]).resolve())
    inventory: list[dict[str, Any]] = []
    for path in sorted(paths, key=lambda item: relative(item)):
        rel = relative(path)
        if rel.endswith("/result.json") and "/attempt-0001/" in rel:
            role = "attempt_0001_result"
        elif rel.endswith("/dispatch_receipt.json") and "/attempt-0001/" in rel:
            role = "attempt_0001_receipt"
        elif rel.endswith("/runtime/native_capture.json"):
            role = "attempt_0001_native_capture"
        elif rel.endswith("/postrun/primary_postrun.json"):
            role = "attempt_0001_primary_postrun"
        else:
            role = "attempt_0001_v29_control"
        inventory.append({"relative_path": rel, "sha256": sha(path), "byte_count": path.stat().st_size, "role": role})
    return inventory


def emit(rows: list[dict[str, Any]]) -> dict[str, Any]:
    inventory = build_inventory(rows)
    inventory_path = HERE / "lineage/attempt-0001-artifact-inventory.jsonl"
    write_jsonl_once(inventory_path, inventory)
    role_counts = {role: sum(1 for item in inventory if item["role"] == role) for role in sorted({item["role"] for item in inventory})}
    lineage = {
        "schema_version": "universal-shadow-certification-retry-lineage-v30-attempt-0002",
        "audit_id": AUDIT.name,
        "wave_id": "universal-shadow-certification-wave-0001",
        "attempt_id": ATTEMPT,
        "status": "IMMUTABLE_ATTEMPT_0001_FAILURE_PRESERVED_ZERO_CREDIT",
        "primary_postruns": {
            cohort_id: {
                "path": relative(V29 / cohort_id / "postrun/primary_postrun.json"),
                "sha256": PRIMARY_SHAS[cohort_id],
                "rejected_count": 8,
                "eligible_count": 0,
                "rejection_causes_exactly": ["input-binding:source_transaction_digest", "schema:agent_path:old-regex"],
            }
            for cohort_id in PRIMARY_SHAS
        },
        "inventory_path": relative(inventory_path),
        "inventory_sha256": sha(inventory_path),
        "inventory_file_count": len(inventory),
        "role_counts": role_counts,
        "attempt_0001_outputs_receipts_captures_mutated": False,
        "attempt_0001_credit": 0,
    }
    lineage_path = HERE / "lineage/attempt-0001-lineage.json"
    write_once(lineage_path, lineage)

    row_by_id = {row["assignment_id"]: row for row in rows}
    cohort_records: dict[str, dict[str, Any]] = {}
    for cohort_id in ("cohort-0001", "cohort-0002"):
        ids = ids_for(cohort_id)
        selected = [row_by_id[aid] for aid in ids]
        cohort_root = HERE / cohort_id
        schema = build_schema(cohort_id, selected)
        schema_path = cohort_root / "schema/result.schema.json"
        write_once(schema_path, schema)
        schema_sha = sha(schema_path)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        for row in selected:
            errors = list(validator.iter_errors(corrected_result(row)))
            if errors:
                raise RuntimeError(f"corrected-positive-rejected:{row['assignment_id']}:{errors[0].message}")

        prompt = {
            "schema_version": "universal-shadow-certification-leaf-prompt-v30-attempt-0002",
            "status": "FROZEN_FOR_FUTURE_ACTIVATION_ONLY",
            "cohort_id": cohort_id,
            "attempt_id": ATTEMPT,
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "source_transaction_digest": SOURCE_TRANSACTION_DIGEST,
            "activation_authorized": False,
            "launch_authorized": False,
            "spawn": "none",
            "descendants_forbidden": True,
            "allowed_reads_after_activation": ["own intent", "own authorization", "own packet", "own result schema", "this prompt", "live public web sources"],
            "forbidden_reads": ["attempt-0001 result bodies", "peer outputs", "canonical Plans", "unbound audit artifacts"],
            "prompt_text": (
                f"Audit005 universal-shadow-certification {ATTEMPT} V30 {cohort_id}. This artifact is inactive: do not launch or work until two fresh independent Luna gates for this cohort pass and a later atomic8 activation binds their hashes. After activation, use only your exact authorization and agent path, model gpt-5.6-sol, reasoning ultra, fork_turns none, and spawn no descendants. Independently redo the assigned 243-feature certification from the packet and live public sources; do not read attempt-0001 or peer result bodies. The result must set input_binding.source_transaction_digest exactly {SOURCE_TRANSACTION_DIGEST}, use the exact authorization agent_path, satisfy the complete Draft 2020-12 schema, write exactly one result.json in the assigned {ATTEMPT} output directory, and return exactly PMR1 only after the result exists."
            ),
            "terminal_response": "PMR1",
            "candidate_credit": 0,
        }
        prompt_path = cohort_root / "prompt/leaf_prompt.json"
        write_once(prompt_path, prompt)
        prompt_sha = sha(prompt_path)

        intent_hashes: dict[str, str] = {}
        auth_hashes: dict[str, str] = {}
        assignment_entries: list[dict[str, Any]] = []
        for row in selected:
            aid = row["assignment_id"]
            new_output = output_dir(aid)
            new_output.mkdir(parents=True, exist_ok=False)
            result_path = new_output / "result.json"
            receipt_path = cohort_root / f"runtime/receipts/{aid}/dispatch_receipt.json"
            intent = {
                "schema_version": "universal-shadow-certification-dispatch-intent-v30-attempt-0002",
                "status": "PREPARED_INACTIVE_AWAITING_TWO_FRESH_LUNA_GATES",
                "audit_id": AUDIT.name,
                "wave_id": "universal-shadow-certification-wave-0001",
                "cohort_id": cohort_id,
                "assignment_id": aid,
                "attempt_id": ATTEMPT,
                "activation_authorized": False,
                "launch_authorized": False,
                "spawn": "none",
                "spawn_count": 0,
                "prospective_agent_path": agent_path(aid),
                "model": MODEL,
                "reasoning_effort": EFFORT,
                "fork_turns": "none",
                "fresh_identity_required": True,
                "descendants_forbidden": True,
                "followups_forbidden": True,
                "packet_ref": str((WAVE / row["packet_ref"]).resolve()),
                "packet_sha256": row["packet_sha256"],
                "feature_count": 243,
                "feature_refs_digest": row["feature_refs_digest"],
                "source_transaction_digest": SOURCE_TRANSACTION_DIGEST,
                "result_schema_ref": str(schema_path.resolve()),
                "result_schema_sha256": schema_sha,
                "prompt_ref": str(prompt_path.resolve()),
                "prompt_sha256": prompt_sha,
                "output_directory": str(new_output.resolve()),
                "result_ref": str(result_path.resolve()),
                "receipt_ref": str(receipt_path.resolve()),
                "return_exactly": "PMR1",
                "attempt_0001_result_ref": str(prior_result(aid).resolve()),
                "attempt_0001_result_sha256": sha(prior_result(aid)),
                "attempt_0001_body_read_forbidden": True,
                "candidate_credit": 0,
            }
            intent_path = cohort_root / f"intents/{aid}.json"
            write_once(intent_path, intent)
            intent_hashes[aid] = sha(intent_path)
            authorization = {
                "schema_version": "universal-shadow-certification-prospective-authorization-v30-attempt-0002",
                "status": "BLOCKED_NOT_AUTHORIZED",
                "cohort_id": cohort_id,
                "assignment_id": aid,
                "attempt_id": ATTEMPT,
                "activation_authorized": False,
                "launch_authorized": False,
                "spawn": "none",
                "spawn_count": 0,
                "agent_path": agent_path(aid),
                "model": MODEL,
                "reasoning_effort": EFFORT,
                "atomic_size": 8,
                "atomic16_forbidden": True,
                "intent_ref": str(intent_path.resolve()),
                "intent_sha256": intent_hashes[aid],
                "packet_ref": intent["packet_ref"],
                "packet_sha256": row["packet_sha256"],
                "result_schema_ref": str(schema_path.resolve()),
                "result_schema_sha256": schema_sha,
                "expected_source_transaction_digest": SOURCE_TRANSACTION_DIGEST,
                "output_directory": str(new_output.resolve()),
                "result_ref": str(result_path.resolve()),
                "receipt_ref": str(receipt_path.resolve()),
                "fresh_luna_primary_rejected_set_validation_required": True,
                "fresh_luna_atomic8_prelaunch_required": True,
                "candidate_credit": 0,
            }
            auth_path = cohort_root / f"prospective_authorizations/{aid}.json"
            write_once(auth_path, authorization)
            auth_hashes[aid] = sha(auth_path)
            assignment_entries.append({
                "assignment_id": aid,
                "agent_path": agent_path(aid),
                "packet_ref": intent["packet_ref"],
                "packet_sha256": row["packet_sha256"],
                "feature_count": 243,
                "feature_refs_digest": row["feature_refs_digest"],
                "intent_ref": str(intent_path.resolve()),
                "intent_sha256": intent_hashes[aid],
                "authorization_ref": str(auth_path.resolve()),
                "authorization_sha256": auth_hashes[aid],
                "output_directory": str(new_output.resolve()),
                "result_ref": str(result_path.resolve()),
                "receipt_ref": str(receipt_path.resolve()),
                "activation_authorized": False,
            })

        manifest = {
            "schema_version": "universal-shadow-certification-atomic8-manifest-v30-attempt-0002",
            "status": "PREPARED_INACTIVE",
            "cohort_id": cohort_id,
            "attempt_id": ATTEMPT,
            "atomic_size": 8,
            "assignment_count": 8,
            "assignment_ids": ids,
            "feature_count": 1944,
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "atomic16_forbidden": True,
            "separate_activation_required": True,
            "activation_authorized": False,
            "launch_authorized": False,
            "spawn": "none",
            "source_transaction_digest": SOURCE_TRANSACTION_DIGEST,
            "schema_ref": str(schema_path.resolve()),
            "schema_sha256": schema_sha,
            "prompt_ref": str(prompt_path.resolve()),
            "prompt_sha256": prompt_sha,
            "assignments": assignment_entries,
            "zero_state": {"empty_output_directories": 8, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
        }
        manifest_path = cohort_root / "manifest.json"
        write_once(manifest_path, manifest)
        manifest_sha = sha(manifest_path)
        gate_paths = {
            "primary_rejected_set": cohort_root / "independent-validation/luna-primary-rejected-set.json",
            "atomic8_prelaunch": cohort_root / "independent-validation/luna-atomic8-prelaunch.json",
        }
        authority = {
            "schema_version": "universal-shadow-certification-cohort-authority-v30-attempt-0002",
            "status": "BLOCKED_AWAITING_FRESH_LUNA_PRIMARY_REJECTED_SET_AND_ATOMIC8_PRELAUNCH",
            "audit_id": AUDIT.name,
            "wave_id": "universal-shadow-certification-wave-0001",
            "cohort_id": cohort_id,
            "attempt_id": ATTEMPT,
            "primary_attempt_0001": {"path": relative(V29 / cohort_id / "postrun/primary_postrun.json"), "sha256": PRIMARY_SHAS[cohort_id], "rejected_count": 8, "eligible_count": 0, "credit": 0},
            "manifest_ref": str(manifest_path.resolve()),
            "manifest_sha256": manifest_sha,
            "schema_ref": str(schema_path.resolve()),
            "schema_sha256": schema_sha,
            "prompt_ref": str(prompt_path.resolve()),
            "prompt_sha256": prompt_sha,
            "policy_v30_sha256": POLICY_V30_SHA,
            "v8_draft202012_semantic_runtime_pins": {name: {"path": relative(path), "sha256": expected} for name, (path, expected) in V8_PINS.items()},
            "v8_checks_removed": 0,
            "schema_checks_removed": 0,
            "semantic_checks_removed": 0,
            "required_fresh_luna_gates": {name: str(path.resolve()) for name, path in gate_paths.items()},
            "gates_must_be_separate": True,
            "activation_authorized": False,
            "launch_authorized": False,
            "spawn": "none",
            "spawn_count": 0,
            "atomic_size": 8,
            "atomic16_forbidden": True,
            "credits": {"certification": 0, "promotion": 0, "spec": 0, "merge": 0},
        }
        authority_path = cohort_root / "AUTHORITY.json"
        write_once(authority_path, authority)
        authority_sha = sha(authority_path)
        readiness = {
            "schema_version": "universal-shadow-certification-cohort-readiness-v30-attempt-0002",
            "status": "BLOCKED_AWAITING_TWO_FRESH_INDEPENDENT_LUNA_GATES",
            "cohort_id": cohort_id,
            "attempt_id": ATTEMPT,
            "preparation_complete": True,
            "ready_for_activation": False,
            "activation_authorized": False,
            "launch_authorized": False,
            "spawn": "none",
            "authority_ref": str(authority_path.resolve()),
            "authority_sha256": authority_sha,
            "manifest_ref": str(manifest_path.resolve()),
            "manifest_sha256": manifest_sha,
            "primary_attempt_0001_sha256": PRIMARY_SHAS[cohort_id],
            "primary_rejected_count": 8,
            "primary_eligible_count": 0,
            "gates": {
                "fresh_luna_primary_rejected_set": {"path": str(gate_paths["primary_rejected_set"].resolve()), "status": "ABSENT_REQUIRED"},
                "fresh_luna_atomic8_prelaunch": {"path": str(gate_paths["atomic8_prelaunch"].resolve()), "status": "ABSENT_REQUIRED"},
            },
            "zero_state": {"empty_output_directories": 8, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
            "next_action": "A fresh independent Luna reviewer must validate the immutable rejected set, then a separate fresh Luna prelaunch gate must validate this corrected atomic8. A later append-only activation may bind both gate hashes; this preparation cannot activate.",
        }
        readiness_path = cohort_root / "readiness.json"
        write_once(readiness_path, readiness)
        cohort_records[cohort_id] = {
            "authority_path": relative(authority_path), "authority_sha256": sha(authority_path),
            "readiness_path": relative(readiness_path), "readiness_sha256": sha(readiness_path),
            "manifest_path": relative(manifest_path), "manifest_sha256": manifest_sha,
            "schema_path": relative(schema_path), "schema_sha256": schema_sha,
            "prompt_path": relative(prompt_path), "prompt_sha256": prompt_sha,
            "assignment_count": 8, "feature_count": 1944,
            "primary_attempt_0001_sha256": PRIMARY_SHAS[cohort_id],
            "rejected_count": 8, "eligible_count": 0,
        }

    tool_hashes = {name: sha(TOOLS / name) for name in TOOL_NAMES}
    root_authority = {
        "schema_version": "universal-shadow-certification-retry-authority-v30-attempt-0002",
        "status": "PREPARED_BLOCKED_AWAITING_FOUR_FRESH_LUNA_GATES",
        "audit_id": AUDIT.name,
        "wave_id": "universal-shadow-certification-wave-0001",
        "retry_namespace": "retry-attempt-0002-v30",
        "attempt_id": ATTEMPT,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "source_transaction_digest": SOURCE_TRANSACTION_DIGEST,
        "cohort_count": 2,
        "atomic_size": 8,
        "assignment_count": 16,
        "feature_count": 3888,
        "atomic16_forbidden": True,
        "separate_activation_per_cohort_required": True,
        "cohorts": cohort_records,
        "lineage_ref": relative(lineage_path),
        "lineage_sha256": sha(lineage_path),
        "inventory_ref": relative(inventory_path),
        "inventory_sha256": sha(inventory_path),
        "tool_hashes": tool_hashes,
        "policy_v30_sha256": POLICY_V30_SHA,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "spawn_count": 0,
        "fresh_luna_primary_rejected_set_validations_required": 2,
        "fresh_luna_atomic8_prelaunch_gates_required": 2,
        "zero_state": {"empty_output_directories": 16, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
        "credits": {"certification": 0, "promotion": 0, "spec": 0, "merge": 0},
    }
    root_path = HERE / "AUTHORITY_V30_ATTEMPT_0002.json"
    write_once(root_path, root_authority)
    report = {
        "schema_version": "universal-shadow-certification-retry-preparation-report-v30-attempt-0002",
        "status": "PASS_PREPARATION_ONLY_BLOCKED_NO_ACTIVATION",
        "authority_path": relative(root_path),
        "authority_sha256": sha(root_path),
        "lineage_sha256": sha(lineage_path),
        "inventory_sha256": sha(inventory_path),
        "cohorts": cohort_records,
        "counts": {"cohorts": 2, "atomic8_manifests": 2, "assignments": 16, "features": 3888, "intents": 16, "prospective_authorizations": 16, "empty_output_directories": 16, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
        "primary_attempt_0001_shas": PRIMARY_SHAS,
        "source_transaction_digest": SOURCE_TRANSACTION_DIGEST,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "next_gate": "Two fresh Luna rejected-set validations and two separate fresh Luna atomic8 prelaunch gates are required before any later activation.",
    }
    report_path = HERE / "terminal-preparation-report.json"
    write_once(report_path, report)
    return {"status": report["status"], "authority_sha256": sha(root_path), "terminal_report_sha256": sha(report_path), "inventory_sha256": sha(inventory_path), "counts": report["counts"], "cohorts": cohort_records}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preflight", action="store_true")
    args = parser.parse_args()
    rows = load_jsonl(MANIFEST_V1)
    assert_inputs(rows)
    schemas = {}
    row_by_id = {row["assignment_id"]: row for row in rows}
    for cohort_id in ("cohort-0001", "cohort-0002"):
        selected = [row_by_id[aid] for aid in ids_for(cohort_id)]
        schema = build_schema(cohort_id, selected)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        for row in selected:
            found = list(validator.iter_errors(corrected_result(row)))
            if found:
                raise RuntimeError(f"preflight-corrected-positive:{row['assignment_id']}:{found[0].message}")
        schemas[cohort_id] = object_sha(schema)
    if args.preflight:
        print(json.dumps({"status": "preflight_pass", "activation_authorized": False, "spawn": "none", "schema_sha256_by_cohort": schemas, "source_transaction_digest": SOURCE_TRANSACTION_DIGEST}, indent=2, sort_keys=True))
        return
    print(json.dumps(emit(rows), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
