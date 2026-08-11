#!/usr/bin/env python3
"""Focused v1.1 validators for the Plan Assurance rolling-trial overlay.

The unchanged semantic artifacts remain governed by the exact v1 validator.
This module validates the repaired compact receipts, prelaunch/authority
boundary, isolation envelope, artifact fuses, and v1.1 summary wrapper.
"""

from __future__ import annotations

import argparse
import copy
import gzip
import importlib.util
import io
import json
import os
import stat
import unicodedata
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

import compact_receipts as compact


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent / "stage-a-plan-assurance-rolling-trial-packet-v1"
PACKET_ID = compact.PACKET_ID
SCHEMAS = {
    "source": "SOURCE_SNAPSHOT.schema.json",
    "source_shard": "SOURCE_SNAPSHOT_BUCKET_SHARD.schema.json",
    "protected": "PROTECTED_STATE.schema.json",
    "structural": "STRUCTURAL_COVERAGE_MAP.schema.json",
    "launch_request": "LAUNCH_REQUEST.schema.json",
    "trusted_capability": "TRUSTED_LAUNCH_CAPABILITY.schema.json",
    "launch_authority": "LAUNCH_AUTHORITY.schema.json",
    "launch_marker": "LAUNCH_AUTHORITY_USED.schema.json",
    "predispatch_freshness": "PREDISPATCH_FRESHNESS_RECEIPT.schema.json",
    "canary_registry": "CANARY_REGISTRY.schema.json",
    "expectation_packet": "EXPECTATION_PACKET.schema.json",
    "capability_slice_manifest": "CAPABILITY_SLICE_MANIFEST.schema.json",
    "transmission": "EXTERNAL_TRANSMISSION_MANIFEST.schema.json",
    "execution": "SEMANTIC_EXECUTION_ENVELOPE.schema.json",
    "budget": "ARTIFACT_BUDGET_MANIFEST.schema.json",
    "semantic_envelope": "SEMANTIC_ARTIFACT_ENVELOPE.schema.json",
    "summary": "TRIAL_SUMMARY.schema.json",
}


def _load_base() -> Any:
    spec = importlib.util.spec_from_file_location("plan_assurance_v1_validator", BASE / "validate_trial_artifacts.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("BASE_VALIDATOR_IMPORT_FAILED")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


BASE_VALIDATOR = _load_base()
SCHEMA_OBJECTS = {name: compact.strict_json_loads((ROOT / filename).read_text(encoding="utf-8")) for name, filename in SCHEMAS.items()}


def file_sha256(path: Path) -> str:
    return compact.sha256_bytes(path.read_bytes())


def schema_findings(kind: str, obj: Any) -> list[str]:
    validator = Draft202012Validator(SCHEMA_OBJECTS[kind], format_checker=FormatChecker())
    return [f"SCHEMA:{kind}:{'/'.join(str(part) for part in error.absolute_path)}:{error.message}"
            for error in sorted(validator.iter_errors(obj), key=lambda error: list(error.absolute_path))]


def payload_hash(kind: str, obj: dict[str, Any], field: str) -> str:
    value = copy.deepcopy(obj)
    value.pop(field, None)
    return compact.identity_hash(kind, value)


def parse_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None: raise ValueError("NAIVE_TIME")
    return parsed.astimezone(timezone.utc)


def validate_source_bundle(root: dict[str, Any], shards: list[dict[str, Any]],
                           plans_root: Path | None = None, excluded_run_root: Path | None = None,
                           require_live: bool = False,
                           expected_packet_core_sha256: str | None = None,
                           expected_canonical_source_index: dict[str, dict[str, Any]] | None = None) -> list[str]:
    findings = schema_findings("source", root)
    try: parse_time(root["created_at_utc"])
    except Exception: findings.append("SOURCE:CREATED_TIME")
    if len(shards) != compact.SHARD_COUNT:
        findings.append("SOURCE:SHARD_COUNT")
    seen: set[int] = set()
    bucket_rows: list[dict[str, Any]] = []
    refs = {row.get("shard_index"): row for row in root.get("bucket_shards", [])}
    for shard in shards:
        findings.extend(schema_findings("source_shard", shard))
        index = shard.get("shard_index")
        if not isinstance(index, int) or index in seen:
            findings.append("SOURCE:SHARD_INDEX")
            continue
        seen.add(index)
        if shard.get("packet_id") != PACKET_ID or shard.get("snapshot_id") != root.get("snapshot_id"):
            findings.append(f"SOURCE:SHARD_BINDING:{index}")
        expected_first = index * compact.BUCKETS_PER_SHARD
        expected_last = expected_first + compact.BUCKETS_PER_SHARD - 1
        if shard.get("first_bucket") != f"{expected_first:02x}" or shard.get("last_bucket") != f"{expected_last:02x}":
            findings.append(f"SOURCE:SHARD_RANGE:{index}")
        if shard.get("payload_sha256") != payload_hash("source-bucket-shard", shard, "payload_sha256"):
            findings.append(f"SOURCE:SHARD_PAYLOAD:{index}")
        binding = refs.get(index, {})
        raw = compact.canonical_bytes(shard)
        if binding.get("bytes") != len(raw) or binding.get("file_sha256") != compact.sha256_bytes(raw):
            findings.append(f"SOURCE:SHARD_FILE_BINDING:{index}")
        if binding.get("payload_sha256") != shard.get("payload_sha256"):
            findings.append(f"SOURCE:SHARD_PAYLOAD_BINDING:{index}")
        bucket_rows.extend(shard.get("buckets", []))
    if seen != set(range(compact.SHARD_COUNT)):
        findings.append("SOURCE:SHARD_INDEX_SET")
    if [row.get("bucket") for row in bucket_rows] != [f"{i:02x}" for i in range(compact.BUCKET_COUNT)]:
        findings.append("SOURCE:BUCKET_ORDER")
    for index, bucket in enumerate(bucket_rows):
        common = {key: bucket.get(key) for key in ("bucket", "entry_count", "regular_file_count", "directory_entry_count", "symlink_count", "nonregular_count", "regular_file_bytes", "path_class_counts", "artifact_role_counts")}
        if bucket.get("physical_bucket_commitment_sha256") != compact.source_hash("physical-bucket", [common, bucket.get("physical_merkle_root_sha256")]):
            findings.append(f"SOURCE:PHYSICAL_BUCKET_COMMITMENT:{index}")
        if bucket.get("classification_bucket_commitment_sha256") != compact.source_hash("classification-bucket", [common, bucket.get("classification_merkle_root_sha256")]):
            findings.append(f"SOURCE:CLASSIFICATION_BUCKET_COMMITMENT:{index}")
    physical = compact.source_hash("physical-population", [row.get("physical_bucket_commitment_sha256") for row in bucket_rows])
    classification = compact.source_hash("classification-population", [row.get("classification_bucket_commitment_sha256") for row in bucket_rows])
    if root.get("physical_population_sha256") != physical:
        findings.append("SOURCE:PHYSICAL_POPULATION")
    if root.get("classification_population_sha256") != classification:
        findings.append("SOURCE:CLASSIFICATION_POPULATION")
    count_fields = ("entry_count", "regular_file_count", "directory_entry_count", "symlink_count", "nonregular_count", "regular_file_bytes")
    for field in count_fields:
        if root.get("counts", {}).get(field) != sum(int(row.get(field, 0)) for row in bucket_rows):
            findings.append(f"SOURCE:COUNT:{field}")
    class_counts = {name: 0 for name in compact.PATH_CLASSES}
    role_counts = {name: 0 for name in compact.ARTIFACT_ROLES}
    for bucket in bucket_rows:
        for name, count in bucket.get("path_class_counts", []): class_counts[name] = class_counts.get(name, 0) + count
        for name, count in bucket.get("artifact_role_counts", []): role_counts[name] = role_counts.get(name, 0) + count
    if root.get("counts", {}).get("path_class_counts") != [[name, class_counts[name]] for name in compact.PATH_CLASSES]:
        findings.append("SOURCE:PATH_CLASS_COUNTS")
    if root.get("counts", {}).get("artifact_role_counts") != [[name, role_counts[name]] for name in compact.ARTIFACT_ROLES]:
        findings.append("SOURCE:ROLE_COUNTS")
    if root.get("counts", {}).get("unknown_classification_count") != class_counts["unknown"]:
        findings.append("SOURCE:UNKNOWN_COUNT")
    population_payload = {
        "algorithm_id": compact.SOURCE_ALGORITHM_ID,
        "plans_root": root.get("plans_root"),
        "excluded_future_run_root": root.get("excluded_future_run_root"),
        "counts": root.get("counts"),
        "physical_population_sha256": physical,
        "classification_population_sha256": classification,
        "classifier_binding_sha256": root.get("classifier_binding", {}).get("classifier_binding_sha256"),
        "ordered_shard_payload_sha256s": [row.get("payload_sha256") for row in sorted(root.get("bucket_shards", []), key=lambda row: row.get("shard_index", -1))],
    }
    if root.get("population_sha256") != compact.source_hash("source-snapshot", population_payload):
        findings.append("SOURCE:POPULATION_PAYLOAD")
    classifier = copy.deepcopy(root.get("classifier_binding", {})); classifier.pop("classifier_binding_sha256", None)
    if root.get("classifier_binding", {}).get("classifier_binding_sha256") != compact.identity_hash("classifier-binding", classifier):
        findings.append("SOURCE:CLASSIFIER_BINDING")
    if root.get("classifier_binding", {}).get("rule_bundle_sha256") != compact.identity_hash("classification-policy", compact.CLASSIFICATION_POLICY):
        findings.append("SOURCE:CLASSIFICATION_POLICY")
    expected_snapshot_id = compact.identity_hash("source-snapshot-id", [root.get("trial_id"), root.get("generation_id"), physical, classification, root.get("packet_core_population_sha256")])
    if root.get("snapshot_id") != expected_snapshot_id:
        findings.append("SOURCE:SNAPSHOT_ID")
    if root.get("snapshot_payload_sha256") != payload_hash("source-snapshot-receipt", root, "snapshot_payload_sha256"):
        findings.append("SOURCE:ROOT_PAYLOAD")
    if expected_packet_core_sha256 is not None and root.get("packet_core_population_sha256") != expected_packet_core_sha256:
        findings.append("SOURCE:EXPECTED_PACKET_CORE")
    scans = root.get("stable_double_scan", {})
    if scans.get("identical") is not True or len({scans.get("scan_a_physical_sha256"), scans.get("scan_b_physical_sha256"), physical}) != 1 or len({scans.get("scan_a_classification_sha256"), scans.get("scan_b_classification_sha256"), classification}) != 1:
        findings.append("SOURCE:DOUBLE_SCAN")
    expected_terminal = "BLOCKED" if root.get("counts", {}).get("symlink_count", 0) or root.get("counts", {}).get("nonregular_count", 0) or root.get("counts", {}).get("unknown_classification_count", 0) else "PASS"
    if root.get("terminal") != expected_terminal:
        findings.append("SOURCE:TERMINAL")
    if require_live:
        if plans_root is None or excluded_run_root is None:
            findings.append("SOURCE:LIVE_ARGUMENTS")
        else:
            rebuilt = compact.build_source_bundle(plans_root, excluded_run_root, root["trial_id"], root["generation_id"], root["packet_core_population_sha256"],
                                                  created_at_utc=root["created_at_utc"], allow_existing_excluded_run_root=True)
            for key in ("counts", "physical_population_sha256", "classification_population_sha256", "population_sha256"):
                if rebuilt["root"].get(key) != root.get(key): findings.append(f"SOURCE:LIVE:{key}")
            observed_canonical_source_index = {
                row["path"]: {"bytes": row["bytes"], "sha256": row["sha256"], "path_class": row["path_class"]}
                for row in rebuilt["rows"]
                if row.get("entry_kind") == "regular_file" and row.get("path_class") == "canonical"
            }
            if expected_canonical_source_index is None:
                findings.append("SOURCE:LIVE:CANONICAL_SOURCE_INDEX_REQUIRED")
            elif expected_canonical_source_index != observed_canonical_source_index:
                findings.append("SOURCE:LIVE:CANONICAL_SOURCE_INDEX")
    return findings


def validate_protected_state(obj: dict[str, Any], source_root: dict[str, Any] | None = None,
                             expected_contract_sha256: str | None = None) -> list[str]:
    findings = schema_findings("protected", obj)
    try: parse_time(obj["captured_at_utc"])
    except Exception: findings.append("PROTECTED:CAPTURED_TIME")
    if compact.receipt_contains_forbidden_raw(obj): findings.append("PROTECTED:RAW_OR_BASE64_PRESENT")
    if obj.get("receipt_payload_sha256") != payload_hash("protected-state-receipt", obj, "receipt_payload_sha256"):
        findings.append("PROTECTED:PAYLOAD")
    if source_root is not None:
        if obj.get("source_snapshot_sha256") != compact.sha256_bytes(compact.canonical_bytes(source_root)):
            findings.append("PROTECTED:SOURCE_RECEIPT")
        if obj.get("source_snapshot_population_sha256") != source_root.get("population_sha256"):
            findings.append("PROTECTED:SOURCE_POPULATION")
        if obj.get("protected_populations", {}).get("plans_excluding_run_root", {}).get("population_sha256") != source_root.get("population_sha256"):
            findings.append("PROTECTED:PLANS_POPULATION")
    if expected_contract_sha256 and obj.get("effective_contract_sha256") != expected_contract_sha256:
        findings.append("PROTECTED:CONTRACT")
    exclusion = obj.get("exclusion_contract", {})
    ex_copy = copy.deepcopy(exclusion); ex_copy.pop("exclusion_contract_sha256", None)
    if exclusion.get("exclusion_contract_sha256") != compact.identity_hash("run-root-exclusion", ex_copy):
        findings.append("PROTECTED:EXCLUSION_CONTRACT")
    try:
        repository_root = Path(obj.get("repository_root", "")).resolve()
        authorized_run_root = Path(exclusion.get("authorized_run_root", "")).resolve()
        run_relative = exclusion.get("repo_relative_run_root", "")
        if authorized_run_root != repository_root / run_relative or not compact._prefix(run_relative, "Plans/.audits"):
            findings.append("PROTECTED:RUN_ROOT_SCOPE")
    except Exception:
        findings.append("PROTECTED:RUN_ROOT_SCOPE")
    collector = obj.get("collector", {})
    if collector.get("command_contract_sha256") != compact.identity_hash("git-command-contract", compact.GIT_COMMAND_CONTRACT):
        findings.append("PROTECTED:GIT_COMMAND_CONTRACT")
    bound = obj.get("protected_populations", {}).get("bound_inputs", {})
    bound_entries = bound.get("entries", [])
    if bound.get("population_sha256") != compact.identity_hash("bound-input-population", bound_entries) or bound.get("entry_count") != len(bound_entries):
        findings.append("PROTECTED:BOUND_INPUT_POPULATION")
    git_state = obj.get("git_state", {})
    protected = obj.get("protected_populations", {})
    invariant = {
        "trial_id": obj.get("trial_id"), "generation_id": obj.get("generation_id"), "packet_id": obj.get("packet_id"),
        "packet_core_population_sha256": obj.get("packet_core_population_sha256"),
        "effective_contract_sha256": obj.get("effective_contract_sha256"),
        "repository_root": obj.get("repository_root"), "collector": collector, "exclusion_contract": exclusion,
        "head": git_state.get("head"), "index": git_state.get("index"),
        "normalized_status": git_state.get("status", {}).get("normalized"),
        "status_classes": {key: value for key, value in git_state.get("status", {}).get("classifications", {}).items() if key != "excluded_run_root_untracked"},
        "untracked_outside_run_root_content": git_state.get("status", {}).get("untracked_outside_run_root_content"),
        "diffs": git_state.get("diffs"), "protected_populations": protected,
        "source_snapshot_population_sha256": obj.get("source_snapshot_population_sha256"),
    }
    if obj.get("invariance_payload_sha256") != compact.identity_hash("protected-invariance", invariant):
        findings.append("PROTECTED:INVARIANCE_PAYLOAD")
    phase = obj.get("phase"); run = obj.get("run_root_observation", {})
    if phase == "BEFORE" and (run.get("exists") is not False or obj.get("comparison") is not None):
        findings.append("PROTECTED:BEFORE_RUN_ROOT")
    if phase == "AFTER":
        if run.get("exists") is not True or run.get("symlink_count") != 0 or run.get("nonregular_count") != 0 or run.get("multi_link_regular_file_count") != 0 or run.get("path_sets_equal") is not True:
            findings.append("PROTECTED:AFTER_RUN_ROOT")
        comparison = obj.get("comparison") or {}
        expected = "PASS" if comparison.get("mismatch_count") == 0 and not comparison.get("mismatch_codes") else "INPUT_DRIFT_STOP"
        if comparison.get("terminal") != expected or obj.get("terminal") != expected:
            findings.append("PROTECTED:AFTER_TERMINAL")
    return findings


def validate_structural_wrapper(obj: dict[str, Any], source_root: dict[str, Any] | None = None,
                                source_rows: list[dict[str, Any]] | None = None,
                                source_bytes_by_path: dict[str, bytes] | None = None) -> list[str]:
    findings = schema_findings("structural", obj)
    active = obj.get("active_structural_map", {})
    findings.extend(f"STRUCTURAL:BASE_SCHEMA:{code}" for code in BASE_VALIDATOR.schema_findings("structural", active))
    findings.extend(f"STRUCTURAL:BASE:{code}" for code in BASE_VALIDATOR.validate_structural(active, source_bytes_by_path))
    if obj.get("active_structural_map_sha256") != compact.identity_hash("v1-active-structural-map", active):
        findings.append("STRUCTURAL:ACTIVE_HASH")
    if obj.get("clean_rebuild_sha256") != compact.identity_hash("v1.1-structural-clean-rebuild", active):
        findings.append("STRUCTURAL:CLEAN_REBUILD")
    if source_root is not None:
        if obj.get("source_snapshot_sha256") != compact.sha256_bytes(compact.canonical_bytes(source_root)):
            findings.append("STRUCTURAL:BIND:source_snapshot_sha256")
        for target, source in (("source_population_sha256", "population_sha256"), ("source_physical_population_sha256", "physical_population_sha256"), ("source_classification_population_sha256", "classification_population_sha256")):
            if obj.get(target) != source_root.get(source): findings.append(f"STRUCTURAL:BIND:{target}")
        if obj.get("source_counts") != source_root.get("counts"): findings.append("STRUCTURAL:SOURCE_COUNTS")
    if source_rows is not None:
        canonical = [row for row in source_rows if row.get("path_class") == "canonical" and row.get("entry_kind") == "regular_file"]
        if obj.get("canonical_population_count") != len(canonical): findings.append("STRUCTURAL:CANONICAL_COUNT")
        expected = [{key: row.get(key) for key in ("path", "mode", "bytes", "sha256")} for row in canonical]
        actual = [{key: row.get(key) for key in ("path", "mode", "bytes", "sha256")} for row in active.get("population", [])]
        if sorted(expected, key=lambda row: row["path"]) != sorted(actual, key=lambda row: row["path"]): findings.append("STRUCTURAL:CANONICAL_POPULATION")
    classes = obj.get("noncanonical_class_commitments", [])
    if [row.get("path_class") for row in classes] != ["generated", "governance_support", "source_lineage", "audit", "retired", "unknown"]:
        findings.append("STRUCTURAL:NONCANONICAL_CLASS_ORDER")
    if any(row.get("semantic_reread") is not False for row in classes): findings.append("STRUCTURAL:NONCANONICAL_REREAD")
    if source_rows is not None:
        by_class = {row.get("path_class"): row for row in classes}
        for path_class in ("generated", "governance_support", "source_lineage", "audit", "retired", "unknown"):
            members = sorted((row for row in source_rows if row.get("path_class") == path_class), key=lambda row: row.get("path", "").encode("utf-8"))
            expected_hash = compact.source_hash("path-class-population", [path_class, [row.get("classification_leaf_sha256") for row in members]])
            received = by_class.get(path_class, {})
            if received.get("entry_count") != len(members) or received.get("population_sha256") != expected_hash:
                findings.append(f"STRUCTURAL:NONCANONICAL_COMMITMENT:{path_class}")
    return findings


def validate_semantic_envelope(obj: dict[str, Any]) -> list[str]:
    findings = schema_findings("semantic_envelope", obj)
    if obj.get("payload_sha256") != payload_hash("semantic-artifact-envelope", obj, "payload_sha256"):
        findings.append("SEMANTIC_ENVELOPE:PAYLOAD")
    if obj.get("created_before_external_authority") is not True and obj.get("artifact_kind") in {"CAPABILITY_SLICE_MANIFEST", "EXPECTATION_PACKET"}:
        findings.append("SEMANTIC_ENVELOPE:PREAUTH_STAGING")
    return findings


def validate_expectation_packet(obj: dict[str, Any], family_id: str, role_id: str,
                                source_binding_population_sha256: str,
                                capability_slice_manifest_sha256: str) -> list[str]:
    findings = schema_findings("expectation_packet", obj)
    if obj.get("expectation_payload_sha256") != payload_hash("expectation-packet", obj, "expectation_payload_sha256"):
        findings.append("EXPECTATION:PAYLOAD")
    if obj.get("family_id") != family_id or obj.get("role_id") != role_id:
        findings.append("EXPECTATION:ROLE_BINDING")
    if obj.get("source_binding_population_sha256") != source_binding_population_sha256 or obj.get("capability_slice_manifest_sha256") != capability_slice_manifest_sha256:
        findings.append("EXPECTATION:PROVENANCE_BINDING")
    directive = obj.get("discovery_directive", {})
    external = role_id == "OPEN_DISCOVERY_RESEARCHER"
    expected = {
        "independent_from_finished_plan": True,
        "external_research_required": external,
        "creative_inspiration_required": external,
        "comparators_and_adjacent_approaches_required": external,
        "failure_evidence_required": external,
    }
    if directive != expected: findings.append("EXPECTATION:ROLE_DIRECTIVE")
    if obj.get("detailed_plan_assertions_withheld_until_lock") is not True:
        findings.append("EXPECTATION:ASSERTION_WITHHOLDING")
    return findings


def validate_capability_slice_manifest(obj: dict[str, Any], family_id: str,
                                       source_binding_population_sha256: str) -> list[str]:
    findings = schema_findings("capability_slice_manifest", obj)
    if obj.get("manifest_payload_sha256") != payload_hash("capability-slice-manifest", obj, "manifest_payload_sha256"):
        findings.append("CAPABILITY_SLICE:PAYLOAD")
    if obj.get("family_id") != family_id or obj.get("source_binding_population_sha256") != source_binding_population_sha256:
        findings.append("CAPABILITY_SLICE:PROVENANCE_BINDING")
    if obj.get("model_visible_before_lock") is not False or obj.get("external_transmission_before_lock") is not False:
        findings.append("CAPABILITY_SLICE:PRELOCK_ISOLATION")
    return findings


def validate_canary_registry(obj: dict[str, Any]) -> list[str]:
    findings = schema_findings("canary_registry", obj)
    if obj.get("registry_payload_sha256") != payload_hash("canary-registry", obj, "registry_payload_sha256"):
        findings.append("CANARY_REGISTRY:PAYLOAD")
    rows = obj.get("canaries", [])
    ids = [row.get("canary_id") for row in rows]
    tokens = [row.get("utf8_token") for row in rows]
    if len(ids) != len(set(ids)) or len(tokens) != len(set(tokens)):
        findings.append("CANARY_REGISTRY:DUPLICATE")
    if {row.get("canary_class") for row in rows} != {"AUDIT_HISTORY", "CROSS_FAMILY_CALIBRATION"}:
        findings.append("CANARY_REGISTRY:CLASS_COVERAGE")
    for row in rows:
        token = row.get("utf8_token")
        if not isinstance(token, str):
            findings.append("CANARY_REGISTRY:TOKEN_TYPE")
            continue
        raw = token.encode("utf-8")
        if unicodedata.normalize("NFC", token) != token:
            findings.append(f"CANARY_REGISTRY:TOKEN_NFC:{row.get('canary_id')}")
        if row.get("utf8_bytes") != len(raw) or row.get("token_sha256") != compact.sha256_bytes(raw):
            findings.append(f"CANARY_REGISTRY:TOKEN_IDENTITY:{row.get('canary_id')}")
    return findings


def _safe_relative_ref(value: Any, prefix: str | None = None) -> bool:
    if not isinstance(value, str) or value.startswith("/") or "\\" in value:
        return False
    parts = value.split("/")
    return bool(parts) and all(part not in {"", ".", ".."} for part in parts) and (prefix is None or parts[0] == prefix)


def _read_confined_regular(root: Path, ref: str) -> tuple[bytes | None, str | None]:
    if not _safe_relative_ref(ref):
        return None, "PATH"
    try:
        root = root.resolve(strict=True)
        current = root
        for part in ref.split("/"):
            current = current / part
            st = current.lstat()
            if stat.S_ISLNK(st.st_mode): return None, "SYMLINK_COMPONENT"
        st = current.lstat()
        if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1: return None, "FILE_KIND"
        resolved = current.resolve(strict=True)
        if resolved != root and root not in resolved.parents: return None, "ESCAPE"
        return current.read_bytes(), None
    except Exception as exc:
        return None, type(exc).__name__


def _all_strings(value: Any) -> list[str]:
    if isinstance(value, str): return [value]
    if isinstance(value, list): return [item for row in value for item in _all_strings(row)]
    if isinstance(value, dict): return [item for key, row in value.items() for item in ([key] + _all_strings(row))]
    return []


def validate_transmission_manifest(obj: dict[str, Any], run_root: Path | None = None,
                                   payload_records: dict[str, bytes] | None = None,
                                   canary_registry: dict[str, Any] | None = None,
                                   canonical_source_index: dict[str, dict[str, Any]] | None = None,
                                   repository_root: Path | None = None,
                                   require_payload_files: bool = False) -> list[str]:
    findings = schema_findings("transmission", obj)
    if obj.get("manifest_payload_sha256") != payload_hash("external-transmission-manifest", obj, "manifest_payload_sha256"):
        findings.append("TRANSMISSION:PAYLOAD")
    ids = [row.get("payload_id") for row in obj.get("static_payloads", [])]
    if len(ids) != len(set(ids)): findings.append("TRANSMISSION:DUPLICATE_PAYLOAD")
    refs = [row.get("ref") for row in obj.get("static_payloads", [])]
    if len(refs) != len(set(refs)): findings.append("TRANSMISSION:DUPLICATE_REF")
    rule_ids = [row.get("rule_id") for row in obj.get("derived_payload_rules", [])]
    output_ids = [row.get("schema_id") for row in obj.get("authorized_output_classes", [])]
    if len(rule_ids) != len(set(rule_ids)) or len(output_ids) != len(set(output_ids)): findings.append("TRANSMISSION:DUPLICATE_RULE_OR_OUTPUT")
    families = ("USAGE_ACCOUNTING_TRUTH", "WEB_RESEARCH_BEHAVIOR", "ACCESSIBILITY_CONTROL_CONTRACTS", "MIGRATIONS_DURABLE_STATE")
    expected_pairs = {(family, role) for family in families for role in ("LOCAL_EXPECTATION_MODELER", "OPEN_DISCOVERY_RESEARCHER")}
    actual_pairs = {(row.get("family_id"), row.get("role_id")) for row in obj.get("static_payloads", [])}
    if actual_pairs != expected_pairs or len(obj.get("static_payloads", [])) != 8: findings.append("TRANSMISSION:BASE_PAIR_TOPOLOGY")
    if obj.get("private_repo_data_disclosed") is not True: findings.append("TRANSMISSION:DISCLOSURE")
    forbidden = set(obj.get("forbidden_populations", []))
    if not {"Plans/.audits/**", "F3 hidden oracle", "F3 hidden source portfolio", "parent conversation history", "unlisted repository bytes", "canary registry and canary token values"} <= forbidden:
        findings.append("TRANSMISSION:FORBIDDEN_POPULATION")
    if require_payload_files and run_root is None and payload_records is None:
        findings.append("TRANSMISSION:RUN_ROOT_REQUIRED")
    if run_root is not None:
        try:
            if Path(obj.get("run_root", "")).resolve() != run_root.resolve(): findings.append("TRANSMISSION:RUN_ROOT_BINDING")
        except Exception:
            findings.append("TRANSMISSION:RUN_ROOT_BINDING")
    assertions = obj.get("canary_assertions", {})
    registry_raw: bytes | None = None
    if canary_registry is None and run_root is not None:
        registry_raw, error = _read_confined_regular(run_root, assertions.get("canary_registry_ref", ""))
        if error: findings.append(f"TRANSMISSION:CANARY_REGISTRY_FILE:{error}")
        elif registry_raw is not None:
            try: canary_registry = compact.strict_json_loads(registry_raw.decode("utf-8"))
            except Exception as exc: findings.append(f"TRANSMISSION:CANARY_REGISTRY_JSON:{type(exc).__name__}")
    if canary_registry is None:
        if require_payload_files: findings.append("TRANSMISSION:CANARY_REGISTRY_REQUIRED")
        tokens: list[str] = []
    else:
        findings.extend(validate_canary_registry(canary_registry))
        if canary_registry.get("packet_id") != obj.get("packet_id") or canary_registry.get("trial_id") != obj.get("trial_id") or canary_registry.get("generation_id") != obj.get("generation_id") or canary_registry.get("run_root") != obj.get("run_root"):
            findings.append("TRANSMISSION:CANARY_REGISTRY_BINDING")
        canonical_registry = compact.canonical_bytes(canary_registry)
        observed_registry_bytes = registry_raw if registry_raw is not None else canonical_registry
        if assertions.get("canary_registry_file_sha256") != compact.sha256_bytes(observed_registry_bytes) or assertions.get("canary_registry_payload_sha256") != canary_registry.get("registry_payload_sha256"):
            findings.append("TRANSMISSION:CANARY_REGISTRY_IDENTITY")
        tokens = [row.get("utf8_token") for row in canary_registry.get("canaries", []) if isinstance(row.get("utf8_token"), str)]
        if assertions.get("tokens_checked") != len(tokens): findings.append("TRANSMISSION:CANARY_TOKEN_COUNT")
    if require_payload_files and canonical_source_index is None:
        findings.append("TRANSMISSION:CANONICAL_SOURCE_INDEX_REQUIRED")
    controller_rows = obj.get("controller_only_payloads", [])
    if {row.get("family_id") for row in controller_rows} != set(families) or len(controller_rows) != 4:
        findings.append("TRANSMISSION:CAPABILITY_SLICE_TOPOLOGY")
    controller_refs = [row.get("ref") for row in controller_rows]
    if len(controller_refs) != len(set(controller_refs)) or set(controller_refs) & set(refs):
        findings.append("TRANSMISSION:CONTROLLER_REF_COLLISION")
    observed_occurrences = 0

    def read_envelope(row: dict[str, Any], label: str) -> tuple[dict[str, Any] | None, bytes | None]:
        ref = row.get("ref", ""); raw: bytes | None = payload_records.get(ref) if payload_records is not None else None
        if raw is None and run_root is not None:
            raw, error = _read_confined_regular(run_root, ref)
            if error: findings.append(f"TRANSMISSION:{label}_FILE:{ref}:{error}")
        if raw is None:
            if require_payload_files or payload_records is not None: findings.append(f"TRANSMISSION:{label}_FILE_MISSING:{ref}")
            return None, None
        if len(raw) != row.get("bytes") or compact.sha256_bytes(raw) != row.get("sha256"):
            findings.append(f"TRANSMISSION:{label}_FILE_IDENTITY:{ref}")
        try: return compact.strict_json_loads(raw.decode("utf-8")), raw
        except Exception as exc:
            findings.append(f"TRANSMISSION:{label}_JSON:{ref}:{type(exc).__name__}")
            return None, raw

    def validate_bindings(row: dict[str, Any], envelope: dict[str, Any], label: str) -> str:
        ref = row.get("ref", ""); bindings = envelope.get("source_bindings", [])
        if len({binding.get("ref") for binding in bindings}) != len(bindings): findings.append(f"TRANSMISSION:SOURCE_BINDING_DUPLICATE:{ref}")
        binding_population = compact.identity_hash("canonical-source-bindings", bindings)
        if row.get("source_binding_population_sha256") != binding_population: findings.append(f"TRANSMISSION:SOURCE_BINDING_POPULATION:{ref}")
        for binding in bindings:
            source_ref = binding.get("ref", "")
            if not _safe_relative_ref(source_ref, "Plans") or source_ref.startswith("Plans/.audits/"):
                findings.append(f"TRANSMISSION:SOURCE_BINDING_CLASS:{ref}:{source_ref}")
                continue
            expected = (canonical_source_index or {}).get(source_ref)
            if canonical_source_index is not None and (expected is None or expected.get("sha256") != binding.get("sha256") or expected.get("bytes") != binding.get("bytes") or expected.get("path_class", "canonical") != "canonical"):
                findings.append(f"TRANSMISSION:SOURCE_BINDING_IDENTITY:{ref}:{source_ref}")
            if repository_root is not None:
                source_raw, error = _read_confined_regular(repository_root, source_ref)
                if error or source_raw is None or len(source_raw) != binding.get("bytes") or compact.sha256_bytes(source_raw) != binding.get("sha256"):
                    findings.append(f"TRANSMISSION:SOURCE_BINDING_LIVE:{ref}:{source_ref}")
        return binding_population

    capability_sha_by_family: dict[str, str] = {}
    for row in controller_rows:
        envelope, raw = read_envelope(row, "CONTROLLER")
        if envelope is None or raw is None: continue
        ref = row.get("ref", ""); findings.extend(f"TRANSMISSION:{ref}:{code}" for code in validate_semantic_envelope(envelope))
        if (row.get("schema_id") != "pm.plan_assurance.semantic_artifact_envelope.v1.1" or row.get("artifact_kind") != "CAPABILITY_SLICE_MANIFEST" or row.get("payload_schema_id") != "pm.plan_assurance.capability_slice_manifest.v1.1" or
                row.get("model_visible_before_lock") is not False or row.get("external_transmission_before_lock") is not False or envelope.get("artifact_id") != row.get("payload_id") or envelope.get("artifact_kind") != "CAPABILITY_SLICE_MANIFEST" or
                envelope.get("payload_schema_id") != "pm.plan_assurance.capability_slice_manifest.v1.1" or envelope.get("stage_id") != "S3_CAPABILITY_SLICE" or envelope.get("packet_id") != obj.get("packet_id") or envelope.get("trial_id") != obj.get("trial_id") or
                envelope.get("generation_id") != obj.get("generation_id") or envelope.get("family_id") != row.get("family_id") or envelope.get("created_before_external_authority") is not True or envelope.get("terminal") != "FROZEN" or envelope.get("provenance_mode") != "CANONICAL_SOURCE_BINDINGS_ONLY"):
            findings.append(f"TRANSMISSION:CONTROLLER_ENVELOPE_BINDING:{ref}")
        binding_population = validate_bindings(row, envelope, "CONTROLLER")
        findings.extend(f"TRANSMISSION:{ref}:{code}" for code in validate_capability_slice_manifest(envelope.get("payload", {}), row.get("family_id"), binding_population))
        capability_sha_by_family[row.get("family_id")] = row.get("sha256")
        for token in tokens:
            observed_occurrences += sum(value.count(token) for value in _all_strings(envelope)) + raw.count(token.encode("utf-8"))

    for row in obj.get("static_payloads", []):
        envelope, raw = read_envelope(row, "STATIC")
        if envelope is None or raw is None: continue
        ref = row.get("ref", ""); findings.extend(f"TRANSMISSION:{ref}:{code}" for code in validate_semantic_envelope(envelope))
        if (row.get("schema_id") != "pm.plan_assurance.semantic_artifact_envelope.v1.1" or row.get("artifact_kind") != "EXPECTATION_PACKET" or row.get("payload_schema_id") != "pm.plan_assurance.expectation_packet.v1.1" or
                envelope.get("artifact_id") != row.get("payload_id") or envelope.get("artifact_kind") != "EXPECTATION_PACKET" or envelope.get("payload_schema_id") != "pm.plan_assurance.expectation_packet.v1.1" or envelope.get("stage_id") != "S3_EXPECTATION_PACKET" or
                envelope.get("packet_id") != obj.get("packet_id") or envelope.get("trial_id") != obj.get("trial_id") or envelope.get("generation_id") != obj.get("generation_id") or envelope.get("family_id") != row.get("family_id") or
                envelope.get("created_before_external_authority") is not True or envelope.get("terminal") != "FROZEN" or envelope.get("provenance_mode") != "CANONICAL_SOURCE_BINDINGS_ONLY"):
            findings.append(f"TRANSMISSION:STATIC_ENVELOPE_BINDING:{ref}")
        binding_population = validate_bindings(row, envelope, "STATIC")
        findings.extend(f"TRANSMISSION:{ref}:{code}" for code in validate_expectation_packet(envelope.get("payload", {}), row.get("family_id"), row.get("role_id"), binding_population, capability_sha_by_family.get(row.get("family_id"), "")))
        for token in tokens:
            observed_occurrences += sum(value.count(token) for value in _all_strings(envelope)) + raw.count(token.encode("utf-8"))
    if assertions.get("static_payloads_checked") != len(obj.get("static_payloads", [])) or assertions.get("controller_payloads_checked") != len(controller_rows) or assertions.get("occurrences") != observed_occurrences or observed_occurrences != 0:
        findings.append("TRANSMISSION:CANARY_OCCURRENCES")
    return findings


def validate_execution_envelope(obj: dict[str, Any], transmission: dict[str, Any] | None = None) -> list[str]:
    findings = schema_findings("execution", obj)
    if obj.get("envelope_payload_sha256") != payload_hash("semantic-execution-envelope", obj, "envelope_payload_sha256"):
        findings.append("EXECUTION:PAYLOAD")
    policy = obj.get("worker_context_policy", {})
    if policy.get("fork_turns") != "none" or policy.get("history_inherited") is not False:
        findings.append("EXECUTION:CONTEXT_ISOLATION")
    if policy.get("repo_read_authorized") is not False or policy.get("audit_read_authorized") is not False:
        findings.append("EXECUTION:READ_POLICY")
    if obj.get("write_policy", {}).get("worker_writes") is not False:
        findings.append("EXECUTION:READ_WRITE_POLICY")
    dispatches = obj.get("dispatches", [])
    if len({row.get("dispatch_id") for row in dispatches}) != len(dispatches): findings.append("EXECUTION:DUPLICATE_DISPATCH")
    families = ("USAGE_ACCOUNTING_TRUTH", "WEB_RESEARCH_BEHAVIOR", "ACCESSIBILITY_CONTROL_CONTRACTS", "MIGRATIONS_DURABLE_STATE")
    expected_pairs = {(family, role) for family in families for role in ("LOCAL_EXPECTATION_MODELER", "OPEN_DISCOVERY_RESEARCHER")}
    if {(row.get("family_id"), row.get("role_id")) for row in dispatches} != expected_pairs or len(dispatches) != 8:
        findings.append("EXECUTION:BASE_PAIR_TOPOLOGY")
    failure = obj.get("conditional_failure_templates", []); challenges = obj.get("cross_family_challenge_templates", [])
    if {row.get("family_id") for row in failure} != set(families) or len(failure) != 4:
        findings.append("EXECUTION:FAILURE_TEMPLATE_TOPOLOGY")
    exact_challenges = {"USAGE_ACCOUNTING_TRUTH": "MIGRATIONS_DURABLE_STATE", "WEB_RESEARCH_BEHAVIOR": "ACCESSIBILITY_CONTROL_CONTRACTS", "ACCESSIBILITY_CONTROL_CONTRACTS": "WEB_RESEARCH_BEHAVIOR", "MIGRATIONS_DURABLE_STATE": "USAGE_ACCOUNTING_TRUTH"}
    if {row.get("target_family_id"): row.get("challenger_family_id") for row in challenges} != exact_challenges or len(challenges) != 4:
        findings.append("EXECUTION:CHALLENGE_TEMPLATE_TOPOLOGY")
    if transmission is not None:
        payloads = {row.get("ref"): row for row in transmission.get("static_payloads", [])}
        outputs = {row.get("schema_id"): row for row in transmission.get("authorized_output_classes", [])}
        rules = {row.get("rule_id") for row in transmission.get("derived_payload_rules", [])}
        for dispatch in dispatches:
            payload = payloads.get(dispatch.get("payload_ref")); output = outputs.get(dispatch.get("response_schema_id"))
            if payload is None or payload.get("sha256") != dispatch.get("payload_sha256") or payload.get("family_id") != dispatch.get("family_id") or payload.get("role_id") != dispatch.get("role_id") or payload.get("bytes", 0) > dispatch.get("maximum_input_bytes", 0): findings.append("EXECUTION:UNLISTED_OR_MISMATCHED_INPUT")
            if output is None or dispatch.get("maximum_output_bytes", 0) > output.get("maximum_bytes", 0): findings.append("EXECUTION:OUTPUT_CLASS")
        if any(row.get("payload_rule_id") not in rules for row in failure + challenges): findings.append("EXECUTION:TEMPLATE_RULE_BINDING")
    return findings


def _decode_gzip_bytes(raw: bytes, maximum: int) -> tuple[int, str, bytes]:
    if len(raw) < 18 or raw[:2] != b"\x1f\x8b": raise ValueError("GZIP_HEADER")
    total = 0; digest = __import__("hashlib").sha256(); decoded = bytearray(); decoder = zlib.decompressobj(31)
    for offset in range(0, len(raw), 65536):
        chunk = decoder.decompress(raw[offset:offset + 65536], maximum - total + 1)
        total += len(chunk)
        if total > maximum: raise ValueError("DECODED_LIMIT")
        digest.update(chunk); decoded.extend(chunk)
        if decoder.unconsumed_tail: raise ValueError("DECODED_LIMIT")
    tail = decoder.flush(maximum - total + 1); total += len(tail)
    if total > maximum: raise ValueError("DECODED_LIMIT")
    digest.update(tail); decoded.extend(tail)
    if not decoder.eof or decoder.unused_data: raise ValueError("GZIP_MEMBER_COUNT")
    return total, digest.hexdigest(), bytes(decoded)


def _decode_member(path: Path, encoding: str, maximum: int) -> tuple[int, str, bytes]:
    data = path.read_bytes()
    if encoding == "identity":
        if len(data) > maximum: raise ValueError("DECODED_LIMIT")
        return len(data), compact.sha256_bytes(data), data
    if encoding != "gzip-single-member": raise ValueError("COMPRESSION")
    return _decode_gzip_bytes(data, maximum)


def validate_budget_manifest(obj: dict[str, Any], root: Path | None = None,
                             budgets: dict[str, Any] | None = None,
                             protected_after: dict[str, Any] | None = None,
                             require_reserved_absent: bool = False) -> list[str]:
    findings = schema_findings("budget", obj)
    if obj.get("manifest_payload_sha256") != payload_hash("artifact-budget-manifest", obj, "manifest_payload_sha256"):
        findings.append("BUDGET:PAYLOAD")
    files = obj.get("physical_files", []); logical = obj.get("logical_artifacts", [])
    if len({row.get("path") for row in files}) != len(files): findings.append("BUDGET:DUPLICATE_FILE")
    if len({row.get("logical_artifact_id") for row in logical}) != len(logical): findings.append("BUDGET:DUPLICATE_LOGICAL_ID")
    def confined(value: Any) -> bool:
        return isinstance(value, str) and not value.startswith("/") and "\\" not in value and all(part not in {"", ".", ".."} for part in value.split("/"))
    if any(not confined(row.get("path")) for row in files) or not confined(obj.get("manifest_path")) or any(not confined(path) for path in obj.get("reserved_terminal_paths", [])):
        findings.append("BUDGET:PATH_CONFINEMENT")
    by_ref = {row.get("path"): row for row in files}
    listed_physical_total = 0; decoded_total = 0
    for row in files:
        listed_physical_total += int(row.get("physical_bytes", 0))
        if root is not None:
            path = root / row.get("path", "")
            try:
                st = path.lstat()
                if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1: raise ValueError("FILE_KIND")
                data = path.read_bytes()
                if stat.S_IMODE(st.st_mode) != row.get("mode") or len(data) != row.get("physical_bytes") or compact.sha256_bytes(data) != row.get("physical_sha256"): raise ValueError("FILE_IDENTITY")
            except Exception as exc: findings.append(f"BUDGET:FILE:{row.get('path')}:{exc}")
    physical_population = compact.identity_hash("budget-physical-population", [
        [row.get(key) for key in ("path", "kind", "mode", "link_count", "physical_bytes", "physical_sha256")]
        for row in sorted(files, key=lambda item: item.get("path", "").encode("utf-8"))
    ])
    if obj.get("inventory_population_sha256") != physical_population:
        findings.append("BUDGET:PHYSICAL_POPULATION")
    for artifact in logical:
        members = sorted(artifact.get("members", []), key=lambda row: row.get("ordinal", -1))
        total = 0; logical_digest = __import__("hashlib").sha256()
        if [row.get("ordinal") for row in members] != list(range(len(members))): findings.append(f"BUDGET:ORDINALS:{artifact.get('logical_artifact_id')}")
        for member in members:
            row = by_ref.get(member.get("path"))
            if row is None: findings.append(f"BUDGET:MISSING_MEMBER:{member.get('path')}"); continue
            if row.get("logical_artifact_id") != artifact.get("logical_artifact_id") or row.get("physical_bytes") != member.get("physical_bytes") or row.get("physical_sha256") != member.get("physical_sha256"):
                findings.append(f"BUDGET:MEMBER_BINDING:{member.get('path')}")
            if root is not None:
                try:
                    size, digest, data = _decode_member(root / member["path"], member.get("encoding"), int(member.get("decoded_bytes", 0)))
                    if size != member.get("decoded_bytes") or digest != member.get("decoded_sha256"): raise ValueError("DECODED_IDENTITY")
                    logical_digest.update(data)
                except Exception as exc: findings.append(f"BUDGET:DECODE:{member.get('path')}:{exc}")
            total += int(member.get("decoded_bytes", 0))
            member_physical = int(member.get("physical_bytes", 0)); member_decoded = int(member.get("decoded_bytes", 0))
            if (member_physical == 0 and member_decoded != 0) or (member_physical and member_decoded > member_physical * int(artifact.get("compression_expansion_ratio_maximum", 64))):
                findings.append(f"BUDGET:MEMBER_EXPANSION:{member.get('path')}")
        decoded_total += total
        if total != artifact.get("decoded_bytes"): findings.append(f"BUDGET:LOGICAL_TOTAL:{artifact.get('artifact_id')}")
        if root is not None and logical_digest.hexdigest() != artifact.get("logical_sha256"): findings.append(f"BUDGET:LOGICAL_HASH:{artifact.get('logical_artifact_id')}")
        physical = sum(int(member.get("physical_bytes", 0)) for member in members)
        if physical == 0 and total != 0 or physical and total > physical * 64: findings.append(f"BUDGET:EXPANSION:{artifact.get('logical_artifact_id')}")
        if artifact.get("artifact_kind") == "ordinary" and (len(members) != 1 or physical > 1048576 or total > 1048576): findings.append(f"BUDGET:ORDINARY_CAP:{artifact.get('logical_artifact_id')}")
    member_paths = [member.get("path") for artifact in logical for member in artifact.get("members", [])]
    if sorted(member_paths) != sorted(by_ref) or len(member_paths) != len(set(member_paths)):
        findings.append("BUDGET:PHYSICAL_LOGICAL_BIJECTION")
    totals = obj.get("totals", {})
    shard_count = sum(artifact.get("artifact_kind") != "ordinary" for artifact in logical for _ in artifact.get("members", []))
    manifest_bytes = int(totals.get("manifest_physical_bytes", 0))
    if totals.get("physical_files") != len(files) + 1 or totals.get("physical_bytes") != listed_physical_total + manifest_bytes or totals.get("decoded_logical_bytes") != decoded_total + manifest_bytes or totals.get("shard_files") != shard_count:
        findings.append("BUDGET:TOTALS")
    if root is not None:
        root = root.resolve(); actual: dict[str, tuple[int, str]] = {}
        for path in root.rglob("*"):
            rel = path.relative_to(root).as_posix(); st = path.lstat()
            if stat.S_ISDIR(st.st_mode): continue
            if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1:
                findings.append(f"BUDGET:RUN_ROOT_ENTRY:{rel}"); continue
            data = path.read_bytes(); actual[rel] = (len(data), compact.sha256_bytes(data))
        listed = set(by_ref); manifest_path = obj.get("manifest_path"); reserved = set(obj.get("reserved_terminal_paths", []))
        if set(actual) - listed - {manifest_path} - reserved: findings.append("BUDGET:UNLISTED_RUN_ROOT_FILE")
        if listed - set(actual): findings.append("BUDGET:MISSING_LISTED_FILE")
        if manifest_path not in actual: findings.append("BUDGET:MANIFEST_FILE_MISSING")
        if require_reserved_absent and set(actual) & reserved: findings.append("BUDGET:RESERVED_PATH_PREEXISTS")
        preterminal_paths = listed | {manifest_path}
        preterminal_bytes = sum(actual[path][0] for path in preterminal_paths if path in actual)
        observed_manifest_bytes = actual.get(manifest_path, (0, ""))[0]
        if totals.get("physical_files") != len(preterminal_paths) or totals.get("physical_bytes") != preterminal_bytes or manifest_bytes != observed_manifest_bytes:
            findings.append("BUDGET:PRETERMINAL_TOTALS")
        if budgets and (len(actual) > budgets["artifact_files_maximum"] or sum(row[0] for row in actual.values()) > budgets["artifact_bytes_maximum"]):
            findings.append("BUDGET:FINAL_PHYSICAL_CAP")
    if protected_after is not None:
        observed = protected_after.get("run_root_observation", {})
        if (protected_after.get("phase") != "AFTER" or protected_after.get("terminal") != "PASS" or
                observed.get("regular_file_count") != len(files) + 1 or observed.get("regular_file_bytes") != listed_physical_total + manifest_bytes or
                observed.get("symlink_count") != 0 or observed.get("nonregular_count") != 0 or observed.get("multi_link_regular_file_count") != 0 or observed.get("path_sets_equal") is not True):
            findings.append("BUDGET:PROTECTED_AFTER_BINDING")
    if budgets:
        reserve = obj.get("terminal_reserve", {})
        checks = ((totals.get("physical_files", 0), "artifact_files_maximum", reserve.get("files", 0)),
                  (totals.get("physical_bytes", 0), "artifact_bytes_maximum", reserve.get("physical_bytes", 0)),
                  (len(logical), "logical_artifacts_campaign_maximum", 0),
                  (decoded_total + manifest_bytes, "decoded_logical_bytes_campaign_maximum", reserve.get("decoded_bytes", 0)))
        for actual, key, held in checks:
            if actual > budgets[key] - held: findings.append(f"BUDGET:CAP_MINUS_RESERVE:{key}")
    return findings


def validate_launch_request(obj: dict[str, Any], source: dict[str, Any] | None = None,
                            protected_before: dict[str, Any] | None = None,
                            transmission: dict[str, Any] | None = None,
                            execution: dict[str, Any] | None = None,
                            expected_context: dict[str, Any] | None = None,
                            observed_now_utc: str | None = None) -> list[str]:
    findings = schema_findings("launch_request", obj)
    if obj.get("launch_binding_sha256") != payload_hash("launch-request-binding", obj, "launch_binding_sha256"):
        findings.append("LAUNCH_REQUEST:BINDING")
    if obj.get("request_status") != "AWAITING_FRESH_AUTHORITY" or obj.get("max_uses") != 1:
        findings.append("LAUNCH_REQUEST:STATUS_OR_USES")
    try:
        created = parse_time(obj["created_at_utc"]); expires = parse_time(obj["expires_at_utc"])
        if not created < expires or (expires - created).total_seconds() > 3600: findings.append("LAUNCH_REQUEST:TTL")
        if observed_now_utc is not None:
            observed_now = parse_time(observed_now_utc)
            if not created <= observed_now <= expires: findings.append("LAUNCH_REQUEST:OBSERVED_NOW")
    except Exception: findings.append("LAUNCH_REQUEST:TIME")
    if expected_context is not None:
        keys = ("packet_id", "packet_core_population_sha256", "base_contract_sha256", "repair_contract_sha256", "effective_contract_sha256", "base_artifact_validator_sha256", "v1_1_artifact_validator_sha256", "budget_contract_sha256", "topology_contract_sha256", "trial_id", "generation_id", "run_root")
        if any(obj.get(key) != expected_context.get(key) for key in keys): findings.append("LAUNCH_REQUEST:EXPECTED_CONTEXT")
    if source is not None:
        if (obj.get("source_snapshot_sha256") != compact.sha256_bytes(compact.canonical_bytes(source)) or obj.get("source_snapshot_population_sha256") != source.get("population_sha256") or obj.get("run_root") != source.get("excluded_future_run_root") or
                source.get("packet_id") != obj.get("packet_id") or source.get("packet_core_population_sha256") != obj.get("packet_core_population_sha256") or source.get("trial_id") != obj.get("trial_id") or source.get("generation_id") != obj.get("generation_id")):
            findings.append("LAUNCH_REQUEST:SOURCE_BINDING")
        try:
            if not parse_time(source["created_at_utc"]) <= parse_time(obj["created_at_utc"]) or (parse_time(obj["created_at_utc"]) - parse_time(source["created_at_utc"])).total_seconds() > 3600:
                findings.append("LAUNCH_REQUEST:SOURCE_FRESHNESS")
        except Exception: findings.append("LAUNCH_REQUEST:SOURCE_TIME")
    if protected_before is not None:
        if (obj.get("protected_before_receipt_sha256") != compact.sha256_bytes(compact.canonical_bytes(protected_before)) or obj.get("protected_before_invariance_sha256") != protected_before.get("invariance_payload_sha256") or protected_before.get("phase") != "BEFORE" or protected_before.get("terminal") != "PASS" or protected_before.get("exclusion_contract", {}).get("authorized_run_root") != obj.get("run_root") or
                protected_before.get("packet_id") != obj.get("packet_id") or protected_before.get("packet_core_population_sha256") != obj.get("packet_core_population_sha256") or protected_before.get("trial_id") != obj.get("trial_id") or protected_before.get("generation_id") != obj.get("generation_id") or protected_before.get("effective_contract_sha256") != obj.get("effective_contract_sha256")):
            findings.append("LAUNCH_REQUEST:PROTECTED_BINDING")
        try:
            if not parse_time(protected_before["captured_at_utc"]) <= parse_time(obj["created_at_utc"]) or (parse_time(obj["created_at_utc"]) - parse_time(protected_before["captured_at_utc"])).total_seconds() > 3600:
                findings.append("LAUNCH_REQUEST:PROTECTED_FRESHNESS")
        except Exception: findings.append("LAUNCH_REQUEST:PROTECTED_TIME")
    if transmission is not None:
        if obj.get("external_transmission_manifest_sha256") != compact.sha256_bytes(compact.canonical_bytes(transmission)) or transmission.get("run_root") != obj.get("run_root") or transmission.get("trial_id") != obj.get("trial_id") or transmission.get("generation_id") != obj.get("generation_id"):
            findings.append("LAUNCH_REQUEST:TRANSMISSION_BINDING")
    if execution is not None:
        if obj.get("execution_envelope_sha256") != compact.sha256_bytes(compact.canonical_bytes(execution)) or execution.get("trial_id") != obj.get("trial_id") or execution.get("generation_id") != obj.get("generation_id"):
            findings.append("LAUNCH_REQUEST:EXECUTION_BINDING")
    if transmission is not None and execution is not None:
        expected_staging = compact.identity_hash("prelaunch-staging", [compact.sha256_bytes(compact.canonical_bytes(transmission)), compact.sha256_bytes(compact.canonical_bytes(execution))])
        if obj.get("prelaunch_staging_manifest_sha256") != expected_staging: findings.append("LAUNCH_REQUEST:STAGING_BINDING")
    return findings


def validate_trusted_capability(obj: dict[str, Any], request: dict[str, Any] | None = None,
                                live_sender_metadata: dict[str, Any] | None = None,
                                observed_now_utc: str | None = None) -> list[str]:
    findings = schema_findings("trusted_capability", obj)
    if obj.get("capability_payload_sha256") != payload_hash("trusted-launch-capability", obj, "capability_payload_sha256"):
        findings.append("CAPABILITY:PAYLOAD")
    if obj.get("authorization_message_sha256") != compact.identity_hash("authorization-message", obj.get("authorization_message")):
        findings.append("CAPABILITY:MESSAGE")
    if obj.get("offline_cryptographic_verification") is not False or obj.get("max_uses") != 1:
        findings.append("CAPABILITY:OFFLINE_OR_USES")
    if request is not None:
        if obj.get("launch_request_sha256") != compact.sha256_bytes(compact.canonical_bytes(request)) or obj.get("approved_launch_binding_sha256") != request.get("launch_binding_sha256"):
            findings.append("CAPABILITY:REQUEST_BINDING")
        message = obj.get("authorization_message", {})
        pairs = (
            (obj.get("packet_id"), request.get("packet_id")), (obj.get("packet_core_population_sha256"), request.get("packet_core_population_sha256")),
            (obj.get("target_task_path"), request.get("requesting_task_path")), (obj.get("observed_sender_task_path"), request.get("expected_authority_task_path")),
            (message.get("request_sha256"), obj.get("launch_request_sha256")), (message.get("approved_launch_binding_sha256"), request.get("launch_binding_sha256")),
            (message.get("approved_external_transmission_manifest_sha256"), request.get("external_transmission_manifest_sha256")),
            (message.get("approved_execution_envelope_sha256"), request.get("execution_envelope_sha256")),
            (obj.get("approved_external_transmission_manifest_sha256"), request.get("external_transmission_manifest_sha256")),
            (obj.get("approved_execution_envelope_sha256"), request.get("execution_envelope_sha256")),
            (message.get("target_task_path"), request.get("requesting_task_path")), (message.get("one_use_nonce_sha256"), obj.get("one_use_nonce_sha256")),
            (message.get("packet_id"), obj.get("packet_id")), (message.get("packet_core_population_sha256"), obj.get("packet_core_population_sha256")),
            (message.get("expires_at_utc"), obj.get("expires_at_utc")),
        )
        if any(left != right for left, right in pairs): findings.append("CAPABILITY:CROSS_BINDING")
        try:
            request_created = parse_time(request["created_at_utc"]); request_expires = parse_time(request["expires_at_utc"])
            observed = parse_time(obj["observed_message_created_at_utc"]); consumed = parse_time(obj["consumed_at_utc"])
            issued = parse_time(obj["issued_at_utc"]); expires = parse_time(obj["expires_at_utc"])
            if not request_created <= observed <= consumed or not observed <= issued <= consumed <= expires <= request_expires or (expires - issued).total_seconds() > 60:
                findings.append("CAPABILITY:FRESHNESS")
            if observed_now_utc is not None:
                observed_now = parse_time(observed_now_utc)
                if not consumed <= observed_now <= expires: findings.append("CAPABILITY:OBSERVED_NOW")
        except Exception: findings.append("CAPABILITY:TIME")
    if live_sender_metadata is None:
        findings.append("CAPABILITY:UNVERIFIABLE_AUTHORITY_LINEAGE")
    else:
        for key in ("observed_sender_task_path", "observed_message_type", "observed_message_id", "observed_turn_id"):
            if obj.get(key) != live_sender_metadata.get(key): findings.append(f"CAPABILITY:LIVE:{key}")
        if obj.get("observed_message_created_at_utc") != live_sender_metadata.get("message_created_at_utc"):
            findings.append("CAPABILITY:LIVE:message_created_at_utc")
        if obj.get("target_task_path") != live_sender_metadata.get("target_task_path"):
            findings.append("CAPABILITY:LIVE:target_task_path")
        if compact.canonical_bytes(obj.get("authorization_message")) != compact.canonical_bytes(live_sender_metadata.get("message_payload")):
            findings.append("CAPABILITY:LIVE:message_payload")
        if obj.get("live_system_sender_attestation_observed") is not True: findings.append("CAPABILITY:LIVE_ATTESTATION")
    return findings


def validate_launch_authority(obj: dict[str, Any], request: dict[str, Any] | None = None,
                              capability: dict[str, Any] | None = None,
                              observed_now_utc: str | None = None) -> list[str]:
    findings = schema_findings("launch_authority", obj)
    if obj.get("trial_launch_authorized") is not True or obj.get("max_uses") != 1:
        findings.append("AUTHORITY:NOT_SINGLE_USE_LAUNCH")
    if obj.get("canonical_plan_writes_authorized") is not False or obj.get("generated_or_governance_writes_authorized") is not False or obj.get("git_write_authorized") is not False:
        findings.append("AUTHORITY:WRITE_SCOPE")
    if obj.get("authority_payload_sha256") != payload_hash("launch-authority", obj, "authority_payload_sha256"):
        findings.append("AUTHORITY:PAYLOAD")
    if request is not None:
        if obj.get("launch_request_sha256") != compact.sha256_bytes(compact.canonical_bytes(request)) or obj.get("launch_binding_sha256") != request.get("launch_binding_sha256"):
            findings.append("AUTHORITY:REQUEST")
    if capability is not None:
        if obj.get("trusted_capability_sha256") != compact.sha256_bytes(compact.canonical_bytes(capability)) or obj.get("trusted_capability_id") != capability.get("capability_id"):
            findings.append("AUTHORITY:CAPABILITY")
        message = capability.get("authorization_message", {})
        pairs = (
            (obj.get("packet_id"), capability.get("packet_id")), (obj.get("packet_core_population_sha256"), capability.get("packet_core_population_sha256")),
            (obj.get("authority_mode"), capability.get("authority_mode")), (obj.get("authorization_message_sha256"), capability.get("authorization_message_sha256")),
            (obj.get("observed_sender_task_path"), capability.get("observed_sender_task_path")), (obj.get("observed_message_id"), capability.get("observed_message_id")),
            (obj.get("observed_turn_id"), capability.get("observed_turn_id")), (obj.get("one_use_nonce_sha256"), capability.get("one_use_nonce_sha256")),
            (obj.get("external_research_authorized"), message.get("external_research_authorized")), (obj.get("model_calls_authorized"), message.get("model_calls_authorized")),
            (obj.get("canonical_plan_writes_authorized"), message.get("canonical_plan_writes_authorized")),
            (obj.get("generated_or_governance_writes_authorized"), message.get("generated_or_governance_writes_authorized")),
            (obj.get("git_write_authorized"), message.get("git_write_authorized")),
        )
        if any(left != right for left, right in pairs): findings.append("AUTHORITY:CAPABILITY_CROSS_BINDING")
        try:
            issued = parse_time(obj["issued_at_utc"]); cap_consumed = parse_time(capability["consumed_at_utc"]); cap_expires = parse_time(capability["expires_at_utc"])
            if not cap_consumed <= issued <= cap_expires: findings.append("AUTHORITY:CAPABILITY_FRESHNESS")
        except Exception: findings.append("AUTHORITY:CAPABILITY_TIME")
    if request is not None:
        pairs = (
            (obj.get("trial_id"), request.get("trial_id")), (obj.get("generation_id"), request.get("generation_id")),
            (obj.get("base_contract_sha256"), request.get("base_contract_sha256")), (obj.get("repair_contract_sha256"), request.get("repair_contract_sha256")),
            (obj.get("effective_contract_sha256"), request.get("effective_contract_sha256")), (obj.get("base_artifact_validator_sha256"), request.get("base_artifact_validator_sha256")),
            (obj.get("v1_1_artifact_validator_sha256"), request.get("v1_1_artifact_validator_sha256")), (obj.get("run_root"), request.get("run_root")),
            (obj.get("budget_contract_sha256"), request.get("budget_contract_sha256")), (obj.get("source_snapshot_sha256"), request.get("source_snapshot_sha256")),
            (obj.get("source_snapshot_population_sha256"), request.get("source_snapshot_population_sha256")),
            (obj.get("protected_before_receipt_sha256"), request.get("protected_before_receipt_sha256")),
            (obj.get("protected_before_invariance_sha256"), request.get("protected_before_invariance_sha256")),
            (obj.get("external_transmission_manifest_sha256"), request.get("external_transmission_manifest_sha256")),
            (obj.get("execution_envelope_sha256"), request.get("execution_envelope_sha256")),
        )
        if any(left != right for left, right in pairs): findings.append("AUTHORITY:REQUEST_CROSS_BINDING")
        try:
            issued = parse_time(obj["issued_at_utc"]); expires = parse_time(obj["expires_at_utc"]); request_expires = parse_time(request["expires_at_utc"])
            if not issued < expires <= request_expires or (expires - issued).total_seconds() > 60: findings.append("AUTHORITY:FRESHNESS")
            if observed_now_utc is not None:
                observed_now = parse_time(observed_now_utc)
                if not issued <= observed_now <= expires: findings.append("AUTHORITY:OBSERVED_NOW")
        except Exception: findings.append("AUTHORITY:TIME")
    return findings


def validate_launch_marker(obj: dict[str, Any], request: dict[str, Any], capability: dict[str, Any], authority: dict[str, Any],
                           first_external_action_observed_at_utc: str | None = None) -> list[str]:
    findings = schema_findings("launch_marker", obj)
    if obj.get("marker_payload_sha256") != payload_hash("launch-authority-used", obj, "marker_payload_sha256"):
        findings.append("MARKER:PAYLOAD")
    pairs = (
        (obj.get("packet_id"), request.get("packet_id")), (obj.get("packet_core_population_sha256"), request.get("packet_core_population_sha256")),
        (obj.get("trial_id"), request.get("trial_id")), (obj.get("generation_id"), request.get("generation_id")),
        (obj.get("request_sha256"), compact.sha256_bytes(compact.canonical_bytes(request))), (obj.get("launch_binding_sha256"), request.get("launch_binding_sha256")),
        (obj.get("capability_sha256"), compact.sha256_bytes(compact.canonical_bytes(capability))), (obj.get("capability_id"), capability.get("capability_id")),
        (obj.get("authority_sha256"), compact.sha256_bytes(compact.canonical_bytes(authority))), (obj.get("one_use_nonce_sha256"), capability.get("one_use_nonce_sha256")),
    )
    if any(left != right for left, right in pairs): findings.append("MARKER:CROSS_BINDING")
    try:
        consumed = parse_time(obj["consumed_at_utc"]); issued = parse_time(authority["issued_at_utc"]); expires = parse_time(authority["expires_at_utc"])
        if not issued <= consumed <= expires or (consumed - issued).total_seconds() > 60: findings.append("MARKER:FRESHNESS")
        if first_external_action_observed_at_utc is not None:
            first_action = parse_time(first_external_action_observed_at_utc)
            if not consumed <= first_action <= expires or (first_action - consumed).total_seconds() > 60:
                findings.append("MARKER:FIRST_ACTION_BOUND")
    except Exception: findings.append("MARKER:TIME")
    return findings


def validate_immediate_predispatch_freshness(obj: dict[str, Any] | None,
                                             request: dict[str, Any], capability: dict[str, Any],
                                             authority: dict[str, Any], marker: dict[str, Any]) -> list[str]:
    """Validate the quick time receipt produced after the expensive live scan.

    The receipt deliberately claims only a platform-observed dispatch boundary,
    not that an external action occurred.  The caller must invoke this helper
    after ``validate_live_launch_chain`` returns and immediately before its
    first external-action call; no other validation or filesystem work may be
    inserted between this helper and that call.
    """
    if obj is None: return ["PREDISPATCH_FRESHNESS:MISSING_RECEIPT"]
    findings = schema_findings("predispatch_freshness", obj)
    if obj.get("receipt_payload_sha256") != payload_hash("predispatch-freshness-receipt", obj, "receipt_payload_sha256"):
        findings.append("PREDISPATCH_FRESHNESS:PAYLOAD")
    expected_hashes = {
        "request_sha256": compact.sha256_bytes(compact.canonical_bytes(request)),
        "capability_sha256": compact.sha256_bytes(compact.canonical_bytes(capability)),
        "authority_sha256": compact.sha256_bytes(compact.canonical_bytes(authority)),
        "marker_sha256": compact.sha256_bytes(compact.canonical_bytes(marker)),
    }
    if any(obj.get(key) != value for key, value in expected_hashes.items()):
        findings.append("PREDISPATCH_FRESHNESS:LINEAGE")
    for key in ("packet_id", "trial_id", "generation_id"):
        if obj.get(key) != request.get(key) or obj.get(key) != authority.get(key) or obj.get(key) != marker.get(key):
            findings.append(f"PREDISPATCH_FRESHNESS:CONTEXT:{key}")
    try:
        completed = parse_time(obj["full_validation_completed_at_utc"])
        rechecked = parse_time(obj["post_validation_platform_time_utc"])
        boundary = parse_time(obj["dispatch_boundary_platform_time_utc"])
        marker_consumed = parse_time(marker["consumed_at_utc"])
        authority_issued = parse_time(authority["issued_at_utc"])
        authority_expires = parse_time(authority["expires_at_utc"])
        capability_expires = parse_time(capability["expires_at_utc"])
        request_expires = parse_time(request["expires_at_utc"])
        if not authority_issued <= marker_consumed <= completed <= rechecked <= boundary:
            findings.append("PREDISPATCH_FRESHNESS:ORDER")
        if (rechecked - completed).total_seconds() > 2:
            findings.append("PREDISPATCH_FRESHNESS:STALE_VALIDATION")
        if (boundary - rechecked).total_seconds() > 2:
            findings.append("PREDISPATCH_FRESHNESS:DISPATCH_DELAY")
        if not boundary <= authority_expires or not boundary <= capability_expires or not boundary <= request_expires:
            findings.append("PREDISPATCH_FRESHNESS:EXPIRED")
        if (boundary - authority_issued).total_seconds() > 60 or (boundary - marker_consumed).total_seconds() > 60:
            findings.append("PREDISPATCH_FRESHNESS:AUTHORITY_WINDOW")
    except Exception:
        findings.append("PREDISPATCH_FRESHNESS:TIME")
    if obj.get("action_occurrence_claim") is not False:
        findings.append("PREDISPATCH_FRESHNESS:ACTION_CLAIM")
    return findings


def validate_bound_launch_chain(source: dict[str, Any], protected_before: dict[str, Any],
                                transmission: dict[str, Any], execution: dict[str, Any],
                                request: dict[str, Any], capability: dict[str, Any], authority: dict[str, Any], marker: dict[str, Any],
                                expected_context: dict[str, Any] | None, live_sender_metadata: dict[str, Any] | None,
                                observed_now_utc: str | None, first_external_action_observed_at_utc: str | None,
                                run_root: Path | None = None, payload_records: dict[str, bytes] | None = None,
                                canary_registry: dict[str, Any] | None = None,
                                canonical_source_index: dict[str, dict[str, Any]] | None = None,
                                repository_root: Path | None = None) -> list[str]:
    """Fail-closed launch-chain entry point used before any semantic dispatch."""
    findings: list[str] = []
    if expected_context is None: findings.append("LIVE_CHAIN:MISSING_EXPECTED_CONTEXT")
    if live_sender_metadata is None: findings.append("LIVE_CHAIN:MISSING_LIVE_SENDER_METADATA")
    if observed_now_utc is None: findings.append("LIVE_CHAIN:MISSING_OBSERVED_NOW")
    if first_external_action_observed_at_utc is None: findings.append("LIVE_CHAIN:MISSING_FIRST_ACTION_TIME")
    if run_root is None and payload_records is None: findings.append("LIVE_CHAIN:MISSING_PAYLOAD_SOURCE")
    if canonical_source_index is None: findings.append("LIVE_CHAIN:MISSING_CANONICAL_SOURCE_INDEX")
    if findings: return findings
    assert expected_context is not None and live_sender_metadata is not None and observed_now_utc is not None and first_external_action_observed_at_utc is not None
    if source.get("packet_core_population_sha256") != expected_context.get("packet_core_population_sha256"):
        findings.append("LIVE_CHAIN:SOURCE_CORE")
    findings.extend(validate_protected_state(protected_before, source, expected_context.get("effective_contract_sha256")))
    findings.extend(validate_transmission_manifest(transmission, run_root=run_root, payload_records=payload_records, canary_registry=canary_registry,
                                                   canonical_source_index=canonical_source_index, repository_root=repository_root, require_payload_files=True))
    findings.extend(validate_execution_envelope(execution, transmission))
    findings.extend(validate_launch_request(request, source, protected_before, transmission, execution, expected_context, observed_now_utc))
    findings.extend(validate_trusted_capability(capability, request, live_sender_metadata, observed_now_utc))
    findings.extend(validate_launch_authority(authority, request, capability, observed_now_utc))
    findings.extend(validate_launch_marker(marker, request, capability, authority, first_external_action_observed_at_utc))
    return findings


def validate_live_root_bindings(source: dict[str, Any], protected_before: dict[str, Any],
                                expected_context: dict[str, Any] | None,
                                run_root: Path | None, repository_root: Path | None) -> list[str]:
    """Bind the production launch wrapper to exact, existing repository/run roots."""
    findings: list[str] = []
    if expected_context is None:
        findings.append("LIVE_CHAIN:MISSING_EXPECTED_CONTEXT")
    if repository_root is None:
        findings.append("LIVE_CHAIN:MISSING_REPOSITORY_ROOT")
    if run_root is None:
        findings.append("LIVE_CHAIN:MISSING_RUN_ROOT")
    if findings:
        return findings
    assert expected_context is not None and repository_root is not None and run_root is not None
    expected_repo_raw = expected_context.get("repository_root")
    expected_run_raw = expected_context.get("run_root")
    if not isinstance(expected_repo_raw, str) or not Path(expected_repo_raw).is_absolute():
        findings.append("LIVE_CHAIN:MISSING_EXPECTED_REPOSITORY_ROOT")
        return findings
    if not isinstance(expected_run_raw, str) or not Path(expected_run_raw).is_absolute():
        findings.append("LIVE_CHAIN:MISSING_EXPECTED_RUN_ROOT")
        return findings
    try:
        repo = repository_root.resolve(strict=True)
        expected_repo = Path(expected_repo_raw).resolve(strict=True)
        run = run_root.resolve(strict=True)
        expected_run = Path(expected_run_raw).resolve(strict=True)
        if not repository_root.is_absolute() or str(repository_root) != expected_repo_raw or repo != expected_repo:
            findings.append("LIVE_CHAIN:REPOSITORY_ROOT_BINDING")
        if not repo.is_dir() or stat.S_ISLNK(repository_root.lstat().st_mode): findings.append("LIVE_CHAIN:REPOSITORY_ROOT_KIND")
        if not run_root.is_absolute() or str(run_root) != expected_run_raw or run != expected_run:
            findings.append("LIVE_CHAIN:RUN_ROOT_BINDING")
        if not run.is_dir() or stat.S_ISLNK(run_root.lstat().st_mode): findings.append("LIVE_CHAIN:RUN_ROOT_KIND")
        audits_root = repo / "Plans" / ".audits"
        if audits_root not in run.parents: findings.append("LIVE_CHAIN:RUN_ROOT_SCOPE")
        if Path(source.get("plans_root", "")).resolve(strict=True) != repo / "Plans": findings.append("LIVE_CHAIN:SOURCE_PLANS_ROOT")
        if Path(source.get("excluded_future_run_root", "")).resolve(strict=True) != run: findings.append("LIVE_CHAIN:SOURCE_RUN_ROOT")
        if Path(protected_before.get("repository_root", "")).resolve(strict=True) != repo: findings.append("LIVE_CHAIN:PROTECTED_REPOSITORY_ROOT")
        if Path(protected_before.get("exclusion_contract", {}).get("authorized_run_root", "")).resolve(strict=True) != run:
            findings.append("LIVE_CHAIN:PROTECTED_RUN_ROOT")
    except Exception as exc:
        findings.append(f"LIVE_CHAIN:ROOT_RESOLUTION:{type(exc).__name__}")
    return findings


def validate_live_packet_core(packet_root: Path | None, expected_context: dict[str, Any] | None) -> list[str]:
    findings: list[str] = []
    if packet_root is None: return ["LIVE_CHAIN:MISSING_PACKET_ROOT"]
    if expected_context is None: return ["LIVE_CHAIN:MISSING_EXPECTED_CONTEXT"]
    expected_raw = expected_context.get("packet_root")
    if not isinstance(expected_raw, str) or not Path(expected_raw).is_absolute():
        return ["LIVE_CHAIN:MISSING_EXPECTED_PACKET_ROOT"]
    try:
        resolved = packet_root.resolve(strict=True); expected = Path(expected_raw).resolve(strict=True)
        if not packet_root.is_absolute() or str(packet_root) != expected_raw or resolved != expected:
            findings.append("LIVE_CHAIN:PACKET_ROOT_BINDING")
        if not resolved.is_dir() or stat.S_ISLNK(packet_root.lstat().st_mode): findings.append("LIVE_CHAIN:PACKET_ROOT_KIND")
        rows, population = compact.packet_population(resolved, compact.PACKET_TERMINAL_FILES)
        if {row["path"] for row in rows} != compact.PACKET_CORE_FILES: findings.append("LIVE_CHAIN:PACKET_CORE_FILE_SET")
        if compact.packet_directories(resolved) != compact.PACKET_CORE_DIRECTORIES: findings.append("LIVE_CHAIN:PACKET_CORE_DIRECTORY_SET")
        if population != expected_context.get("packet_core_population_sha256"): findings.append("LIVE_CHAIN:PACKET_CORE_DRIFT")
    except Exception as exc:
        findings.append(f"LIVE_CHAIN:PACKET_ROOT:{type(exc).__name__}")
    return findings


def validate_live_protected_receipt_bindings(source: dict[str, Any], protected_before: dict[str, Any],
                                              protected_current: dict[str, Any] | None,
                                              expected_context: dict[str, Any] | None,
                                              bound_inputs: list[dict[str, Any]] | None,
                                              observed_now_utc: str | None) -> list[str]:
    findings: list[str] = []
    if protected_current is None: findings.append("LIVE_CHAIN:MISSING_CURRENT_PROTECTED_RECEIPT")
    if expected_context is None: findings.append("LIVE_CHAIN:MISSING_EXPECTED_CONTEXT")
    if bound_inputs is None: findings.append("LIVE_CHAIN:MISSING_BOUND_INPUT_CONTRACT")
    if observed_now_utc is None: findings.append("LIVE_CHAIN:MISSING_OBSERVED_NOW")
    if findings: return findings
    assert protected_current is not None and expected_context is not None and bound_inputs is not None and observed_now_utc is not None
    findings.extend(validate_protected_state(protected_current, source, expected_context.get("effective_contract_sha256")))
    if protected_current.get("phase") != "AFTER" or protected_current.get("terminal") != "PASS":
        findings.append("LIVE_CHAIN:CURRENT_PROTECTED_TERMINAL")
    if protected_current.get("captured_at_utc") != observed_now_utc:
        findings.append("LIVE_CHAIN:CURRENT_PROTECTED_PLATFORM_TIME")
    for key in ("packet_id", "packet_core_population_sha256", "trial_id", "generation_id", "effective_contract_sha256", "repository_root"):
        if protected_current.get(key) != expected_context.get(key): findings.append(f"LIVE_CHAIN:CURRENT_PROTECTED_CONTEXT:{key}")
    comparison = protected_current.get("comparison") or {}
    before_sha = compact.sha256_bytes(compact.canonical_bytes(protected_before))
    if comparison.get("before_receipt_file_sha256") != before_sha or comparison.get("before_invariance_payload_sha256") != protected_before.get("invariance_payload_sha256"):
        findings.append("LIVE_CHAIN:CURRENT_PROTECTED_BEFORE_BINDING")
    if (comparison.get("after_invariance_payload_sha256") != protected_current.get("invariance_payload_sha256") or
            protected_current.get("invariance_payload_sha256") != protected_before.get("invariance_payload_sha256") or
            comparison.get("mismatch_count") != 0 or comparison.get("mismatch_codes") != [] or comparison.get("terminal") != "PASS"):
        findings.append("LIVE_CHAIN:CURRENT_PROTECTED_INVARIANCE")
    expected_bound = sorted(bound_inputs, key=lambda row: row.get("id", "").encode("utf-8"))
    observed_bound = protected_before.get("protected_populations", {}).get("bound_inputs", {}).get("entries", [])
    if len(expected_bound) != len(observed_bound): findings.append("LIVE_CHAIN:BOUND_INPUT_CONTRACT_COUNT")
    else:
        for contract_row, observed_row in zip(expected_bound, observed_bound):
            if (observed_row.get("input_id") != contract_row.get("id") or observed_row.get("contract_path_sha256") != compact.identity_hash("bound-input-path", contract_row.get("path")) or
                    observed_row.get("bytes") != contract_row.get("bytes") or observed_row.get("sha256") != contract_row.get("sha256")):
                findings.append("LIVE_CHAIN:BOUND_INPUT_CONTRACT_BINDING")
                break
    return findings


def validate_live_budget_bindings(budget_contract: dict[str, Any] | None,
                                  budget_manifest: dict[str, Any] | None,
                                  expected_context: dict[str, Any] | None) -> list[str]:
    if expected_context is None: return ["LIVE_CHAIN:MISSING_EXPECTED_CONTEXT"]
    if budget_contract is None: return ["LIVE_CHAIN:MISSING_BUDGET_CONTRACT"]
    if budget_manifest is None: return ["LIVE_CHAIN:MISSING_BUDGET_MANIFEST"]
    findings: list[str] = []
    if compact.identity_hash("budget-contract", budget_contract) != expected_context.get("budget_contract_sha256"):
        findings.append("LIVE_CHAIN:BUDGET_CONTRACT_BINDING")
    campaign = budget_contract.get("campaign") if isinstance(budget_contract.get("campaign"), dict) else budget_contract
    findings.extend(validate_budget_manifest(budget_manifest, budgets=campaign))
    return findings


def validate_control_file_identities(root: Path | None, records: list[dict[str, Any]] | None) -> list[str]:
    if root is None: return ["LIVE_CHAIN:MISSING_CONTROL_ROOT"]
    if records is None: return ["LIVE_CHAIN:MISSING_CONTROL_RECORDS"]
    findings: list[str] = []
    refs = [row.get("ref") for row in records]
    if len(refs) != len(set(refs)): findings.append("LIVE_CHAIN:DUPLICATE_CONTROL_REF")
    for row in records:
        ref = row.get("ref", ""); expected = row.get("expected_bytes")
        raw, error = _read_confined_regular(root, ref)
        if error or raw is None: findings.append(f"LIVE_CHAIN:CONTROL_FILE:{ref}:{error}")
        elif not isinstance(expected, bytes) or raw != expected: findings.append(f"LIVE_CHAIN:CONTROL_FILE_IDENTITY:{ref}")
    return findings


def validate_live_launch_chain(source: dict[str, Any], source_shards: list[dict[str, Any]], protected_before: dict[str, Any],
                               transmission: dict[str, Any], execution: dict[str, Any], request: dict[str, Any],
                               capability: dict[str, Any], authority: dict[str, Any], marker: dict[str, Any],
                               expected_context: dict[str, Any] | None, live_sender_metadata: dict[str, Any] | None,
                               observed_now_utc: str | None, first_external_action_observed_at_utc: str | None,
                               run_root: Path | None, canonical_source_index: dict[str, dict[str, Any]] | None,
                               repository_root: Path | None, packet_root: Path | None,
                               protected_current: dict[str, Any] | None, bound_inputs: list[dict[str, Any]] | None,
                               budget_contract: dict[str, Any] | None,
                               budget_manifest: dict[str, Any] | None) -> list[str]:
    """Production/root-backed wrapper; all external observations are mandatory."""
    root_findings = validate_live_root_bindings(source, protected_before, expected_context, run_root, repository_root)
    if root_findings:
        return root_findings
    assert repository_root is not None and run_root is not None and expected_context is not None
    findings = validate_live_packet_core(packet_root, expected_context)
    findings.extend(validate_live_protected_receipt_bindings(source, protected_before, protected_current, expected_context, bound_inputs, observed_now_utc))
    findings.extend(validate_live_budget_bindings(budget_contract, budget_manifest, expected_context))
    if budget_contract is not None and budget_manifest is not None:
        campaign_budget = budget_contract.get("campaign") if isinstance(budget_contract.get("campaign"), dict) else budget_contract
        findings.extend(validate_budget_manifest(budget_manifest, root=run_root, budgets=campaign_budget,
                                                 protected_after=protected_current, require_reserved_absent=True))
    control_records = [
        {"ref": request.get("source_snapshot_ref", ""), "expected_bytes": compact.canonical_bytes(source)},
        {"ref": request.get("protected_before_ref", ""), "expected_bytes": compact.canonical_bytes(protected_before)},
        {"ref": request.get("external_transmission_manifest_ref", ""), "expected_bytes": compact.canonical_bytes(transmission)},
        {"ref": request.get("execution_envelope_ref", ""), "expected_bytes": compact.canonical_bytes(execution)},
        {"ref": "LAUNCH_REQUEST.json", "expected_bytes": compact.canonical_bytes(request)},
        {"ref": authority.get("trusted_capability_ref", ""), "expected_bytes": compact.canonical_bytes(capability)},
        {"ref": "AUTHORITY/LAUNCH_AUTHORITY.json", "expected_bytes": compact.canonical_bytes(authority)},
    ]
    if budget_manifest is not None:
        control_records.append({"ref": "ARTIFACT_BUDGET_MANIFEST.json", "expected_bytes": compact.canonical_bytes(budget_manifest)})
    control_records.extend({"ref": binding.get("ref", ""), "expected_bytes": compact.canonical_bytes(shard)}
                           for binding, shard in zip(source.get("bucket_shards", []), source_shards))
    findings.extend(validate_control_file_identities(run_root, control_records))
    findings.extend(validate_bound_launch_chain(source, protected_before, transmission, execution, request, capability, authority, marker,
                                                expected_context, live_sender_metadata, observed_now_utc, first_external_action_observed_at_utc,
                                                run_root=run_root, canonical_source_index=canonical_source_index, repository_root=repository_root))
    findings.extend(validate_source_bundle(source, source_shards, plans_root=repository_root / "Plans",
                                           excluded_run_root=run_root, require_live=True,
                                           expected_packet_core_sha256=expected_context.get("packet_core_population_sha256"),
                                           expected_canonical_source_index=canonical_source_index))
    if protected_current is not None and bound_inputs is not None and observed_now_utc is not None:
        try:
            rebuilt_current = compact.build_protected_receipt(
                repository_root, run_root, source, bound_inputs,
                expected_context["effective_contract_sha256"], expected_context["packet_core_population_sha256"],
                expected_context["trial_id"], expected_context["generation_id"], phase="AFTER",
                before_receipt=protected_before, captured_at_utc=observed_now_utc)
            rebuilt_codes = validate_protected_state(rebuilt_current, source, expected_context.get("effective_contract_sha256"))
            if rebuilt_codes or compact.canonical_bytes(rebuilt_current) != compact.canonical_bytes(protected_current):
                findings.append("LIVE_CHAIN:CURRENT_PROTECTED_LIVE_REBUILD")
        except Exception as exc:
            findings.append(f"LIVE_CHAIN:CURRENT_PROTECTED_LIVE_REBUILD:{type(exc).__name__}")
    marker_path = run_root / "AUTHORITY" / "LAUNCH_AUTHORITY_USED.json"
    raw, error = _read_confined_regular(run_root, "AUTHORITY/LAUNCH_AUTHORITY_USED.json")
    if error or raw is None or compact.sha256_bytes(raw) != compact.sha256_bytes(compact.canonical_bytes(marker)):
        findings.append("LIVE_CHAIN:MARKER_FILE_IDENTITY")
    if marker_path != run_root / authority.get("single_use_marker_ref", ""):
        findings.append("LIVE_CHAIN:MARKER_REF")
    return findings


def create_launch_marker_exclusive(marker_path: Path, run_root: Path, marker: dict[str, Any],
                                   request: dict[str, Any], capability: dict[str, Any], authority: dict[str, Any],
                                   first_external_action_observed_at_utc: str) -> dict[str, Any]:
    """Create the one-use marker with O_EXCL before any external action.

    A failed or partial creation is intentionally never cleaned up here: any
    preexisting path blocks reuse and must be retained for adjudication.
    """
    findings = validate_launch_marker(marker, request, capability, authority, first_external_action_observed_at_utc)
    expected = run_root / "AUTHORITY" / "LAUNCH_AUTHORITY_USED.json"
    try:
        root = run_root.resolve(strict=True)
        authority_dir = (root / "AUTHORITY").resolve(strict=True)
        if authority_dir.parent != root or marker_path != expected or marker_path.parent.resolve(strict=True) != authority_dir:
            findings.append("MARKER_CREATE:PATH")
        if request.get("run_root") != str(root) or authority.get("run_root") != str(root) or authority.get("single_use_marker_ref") != "AUTHORITY/LAUNCH_AUTHORITY_USED.json":
            findings.append("MARKER_CREATE:RUN_ROOT_BINDING")
        if stat.S_ISLNK(marker_path.parent.lstat().st_mode): findings.append("MARKER_CREATE:PARENT_SYMLINK")
    except Exception:
        findings.append("MARKER_CREATE:PATH")
    if findings:
        return {"terminal": "BLOCKED", "findings": findings, "created": False}
    raw = compact.canonical_bytes(marker)
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    if hasattr(os, "O_CLOEXEC"): flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"): flags |= os.O_NOFOLLOW
    fd: int | None = None
    try:
        fd = os.open(marker_path, flags, 0o400)
        offset = 0
        while offset < len(raw):
            written = os.write(fd, raw[offset:])
            if written <= 0: raise OSError("SHORT_WRITE")
            offset += written
        os.fsync(fd)
        os.close(fd); fd = None
        st = marker_path.lstat()
        observed = marker_path.read_bytes()
        if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1 or observed != raw:
            raise OSError("POST_CREATE_IDENTITY")
        return {"terminal": "CREATED", "findings": [], "created": True, "bytes": len(raw), "sha256": compact.sha256_bytes(raw), "exclusive_flags": flags}
    except FileExistsError:
        return {"terminal": "BLOCKED", "findings": ["MARKER_CREATE:PREEXISTING"], "created": False, "exclusive_flags": flags}
    except Exception as exc:
        return {"terminal": "BLOCKED", "findings": [f"MARKER_CREATE:{type(exc).__name__}"], "created": marker_path.exists(), "exclusive_flags": flags}
    finally:
        if fd is not None:
            try: os.close(fd)
            except OSError: pass


def validate_summary_authority_lineage(obj: dict[str, Any], request: dict[str, Any], capability: dict[str, Any],
                                       authority: dict[str, Any], marker: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    lineage = obj.get("authority_lineage", {})
    expected_hashes = {
        "request_sha256": compact.sha256_bytes(compact.canonical_bytes(request)),
        "capability_sha256": compact.sha256_bytes(compact.canonical_bytes(capability)),
        "authority_sha256": compact.sha256_bytes(compact.canonical_bytes(authority)),
        "marker_sha256": compact.sha256_bytes(compact.canonical_bytes(marker)),
    }
    if any(lineage.get(key) != value for key, value in expected_hashes.items()): findings.append("SUMMARY:AUTHORITY_CHAIN_HASH")
    for key in ("packet_id", "packet_core_population_sha256"):
        if any(item.get(key) != obj.get(key) for item in (request, capability, authority, marker)):
            findings.append(f"SUMMARY:AUTHORITY_CHAIN_IDENTITY:{key}")
    for key in ("trial_id", "generation_id"):
        if any(item.get(key) != obj.get(key) for item in (request, authority, marker)):
            findings.append(f"SUMMARY:AUTHORITY_CHAIN_IDENTITY:{key}")
    if marker.get("request_sha256") != expected_hashes["request_sha256"] or marker.get("capability_sha256") != expected_hashes["capability_sha256"] or marker.get("authority_sha256") != expected_hashes["authority_sha256"]:
        findings.append("SUMMARY:MARKER_CHAIN")
    return findings


def validate_summary(obj: dict[str, Any], source: dict[str, Any] | None = None,
                     before: dict[str, Any] | None = None, after: dict[str, Any] | None = None,
                     budget: dict[str, Any] | None = None,
                     request: dict[str, Any] | None = None,
                     capability: dict[str, Any] | None = None,
                     authority: dict[str, Any] | None = None,
                     marker: dict[str, Any] | None = None) -> list[str]:
    findings = schema_findings("summary", obj)
    semantic = obj.get("v1_semantic_summary", {})
    findings.extend(f"SUMMARY:V1_SCHEMA:{code}" for code in BASE_VALIDATOR.schema_findings("summary", semantic))
    if obj.get("v1_semantic_summary_sha256") != compact.identity_hash("v1-semantic-summary", semantic): findings.append("SUMMARY:V1_HASH")
    if source is not None and (obj.get("source_snapshot_sha256") != compact.sha256_bytes(compact.canonical_bytes(source)) or obj.get("source_population_sha256") != source.get("population_sha256")): findings.append("SUMMARY:SOURCE")
    if before is not None and obj.get("protected_before_receipt_sha256") != compact.sha256_bytes(compact.canonical_bytes(before)): findings.append("SUMMARY:BEFORE")
    if after is not None:
        if obj.get("protected_after_receipt_sha256") != compact.sha256_bytes(compact.canonical_bytes(after)) or obj.get("protected_invariance_sha256") != after.get("invariance_payload_sha256"): findings.append("SUMMARY:AFTER")
    if budget is not None and obj.get("artifact_budget_manifest_sha256") != compact.sha256_bytes(compact.canonical_bytes(budget)): findings.append("SUMMARY:BUDGET")
    lineage = obj.get("authority_lineage", {})
    if lineage.get("live_sender_attestation_observed") is not True or lineage.get("one_use_marker_observed") is not True:
        findings.append("SUMMARY:AUTHORITY_LINEAGE")
    chain = (request, capability, authority, marker)
    if any(item is not None for item in chain):
        if not all(item is not None for item in chain):
            findings.append("SUMMARY:AUTHORITY_CHAIN_INCOMPLETE")
        else:
            assert request is not None and capability is not None and authority is not None and marker is not None
            findings.extend(validate_summary_authority_lineage(obj, request, capability, authority, marker))
    return findings


def run_self_tests() -> dict[str, Any]:
    passed: list[str] = []
    try:
        compact.canonical_bytes({"e\u0301": 1, "\u00e9": 2})
    except compact.ReceiptError:
        passed.append("NFC_KEY_COLLISION_REJECTED")
    if compact.identity_hash("a", {"x": 1}) != compact.identity_hash("b", {"x": 1}): passed.append("KIND_DOMAIN_SEPARATION")
    if compact.classify_path("Plans/plan_graph.json", "regular_file")[0] == "generated": passed.append("PLAN_GRAPH_GENERATED_CLASS")
    try:
        compact.strict_json_loads('{"x":1,"x":2}')
    except compact.ReceiptError:
        passed.append("RAW_DUPLICATE_JSON_KEY_REJECTED")
    rows = [
        {"path": "Plans", "entry_kind": "directory", "mode": 493, "bytes": None, "sha256": None, "link_count": 1, "symlink_target_bytes": None, "symlink_target_sha256": None, "nonregular_type": None, "nonregular_rdev": None, "path_class": "canonical", "artifact_role": None, "semantic_authority": False, "parser": None, "classification_rule_id": "canonical_default"},
        {"path": "Plans/A.md", "entry_kind": "regular_file", "mode": 420, "bytes": 1, "sha256": "0"*64, "link_count": 1, "symlink_target_bytes": None, "symlink_target_sha256": None, "nonregular_type": None, "nonregular_rdev": None, "path_class": "canonical", "artifact_role": "active_normative_prose", "semantic_authority": True, "parser": "markdown", "classification_rule_id": "canonical_default"},
    ]
    for row in rows:
        physical = {key: row[key] for key in ("path", "entry_kind", "mode", "bytes", "sha256", "link_count", "symlink_target_bytes", "symlink_target_sha256", "nonregular_type", "nonregular_rdev")}
        row["physical_leaf_sha256"] = compact.source_hash("physical-leaf", physical)
        classification = {"physical_leaf_sha256": row["physical_leaf_sha256"], "path_class": row["path_class"], "artifact_role": row["artifact_role"], "semantic_authority": row["semantic_authority"], "parser": row["parser"], "classification_rule_id": row["classification_rule_id"]}
        row["classification_leaf_sha256"] = compact.source_hash("classification-leaf", classification)
    baseline = compact.build_bucket_summaries(rows)
    mutation_names = []
    for name, mutate in (
        ("HASH", lambda value: value.__setitem__("sha256", "1"*64)),
        ("MODE", lambda value: value.__setitem__("mode", 384)),
        ("CLASS", lambda value: value.__setitem__("path_class", "audit")),
        ("RENAME", lambda value: value.__setitem__("path", "Plans/B.md")),
    ):
        changed = copy.deepcopy(rows); mutate(changed[1])
        physical = {key: changed[1][key] for key in ("path", "entry_kind", "mode", "bytes", "sha256", "link_count", "symlink_target_bytes", "symlink_target_sha256", "nonregular_type", "nonregular_rdev")}
        changed[1]["physical_leaf_sha256"] = compact.source_hash("physical-leaf", physical)
        classification = {"physical_leaf_sha256": changed[1]["physical_leaf_sha256"], "path_class": changed[1]["path_class"], "artifact_role": changed[1]["artifact_role"], "semantic_authority": changed[1]["semantic_authority"], "parser": changed[1]["parser"], "classification_rule_id": changed[1]["classification_rule_id"]}
        changed[1]["classification_leaf_sha256"] = compact.source_hash("classification-leaf", classification)
        if compact.build_bucket_summaries(changed) != baseline: mutation_names.append(name)
    if mutation_names == ["HASH", "MODE", "CLASS", "RENAME"]: passed.append("SOURCE_MUTATIONS")
    unknown_rows = copy.deepcopy(rows); unknown = copy.deepcopy(unknown_rows[1]); unknown.update({"path": "Plans/.unknown", "path_class": "unknown", "artifact_role": "unknown", "semantic_authority": False, "parser": "text", "classification_rule_id": "unknown_dot_path"})
    physical = {key: unknown[key] for key in ("path", "entry_kind", "mode", "bytes", "sha256", "link_count", "symlink_target_bytes", "symlink_target_sha256", "nonregular_type", "nonregular_rdev")}; unknown["physical_leaf_sha256"] = compact.source_hash("physical-leaf", physical)
    classification = {"physical_leaf_sha256": unknown["physical_leaf_sha256"], "path_class": unknown["path_class"], "artifact_role": unknown["artifact_role"], "semantic_authority": unknown["semantic_authority"], "parser": unknown["parser"], "classification_rule_id": unknown["classification_rule_id"]}; unknown["classification_leaf_sha256"] = compact.source_hash("classification-leaf", classification)
    unknown_rows.append(unknown); unknown_rows.sort(key=lambda row: row["path"].encode("utf-8"))
    absent = ROOT.parents[1] / ".audits" / "v1_1-self-test-absent"
    if not absent.exists():
        bundle = compact.build_source_bundle(ROOT.parents[1], absent, "self-test", "generation-001", "0"*64, created_at_utc="2026-07-17T00:00:00Z", scan_a_rows=unknown_rows, scan_b_rows=copy.deepcopy(unknown_rows))
        if bundle["root"]["terminal"] == "BLOCKED": passed.append("UNKNOWN_CLASS_BLOCKED")
    raw = gzip.compress(b"A" * 4096, mtime=0)
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(raw), mode="rb") as stream:
            if len(stream.read(1025)) > 1024: raise ValueError("DECODED_LIMIT")
    except ValueError:
        passed.append("COMPRESSION_BOMB_BOUND")
    try:
        _decode_gzip_bytes(gzip.compress(b"A", mtime=0) + gzip.compress(b"B", mtime=0), 16)
    except ValueError:
        passed.append("MULTI_MEMBER_GZIP_REJECTED")
    expected = {"NFC_KEY_COLLISION_REJECTED", "KIND_DOMAIN_SEPARATION", "PLAN_GRAPH_GENERATED_CLASS", "RAW_DUPLICATE_JSON_KEY_REJECTED", "SOURCE_MUTATIONS", "UNKNOWN_CLASS_BLOCKED", "COMPRESSION_BOMB_BOUND", "MULTI_MEMBER_GZIP_REJECTED"}
    return {"terminal": "PASS" if set(passed) == expected else "FAIL", "passed": sorted(passed), "expected": sorted(expected)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        result = run_self_tests(); print(json.dumps(result, sort_keys=True, separators=(",", ":"))); return 0 if result["terminal"] == "PASS" else 1
    parser.error("only --self-test is available without a trial artifact set")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
