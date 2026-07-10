#!/usr/bin/env python3
"""Build, independently verify, and freeze Audit 005's zero-credit launch packet.

This generator reuses only hash-pinned structural windowing functions from the
failed Audit 004 lineage. It never reads prior results, receipts, reports, or
findings. All substantive work for Audit 005 starts from zero.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable


AUDIT_ROOT = Path(__file__).resolve().parent
REPO = AUDIT_ROOT.parents[2]
PLANS = REPO / "Plans"
AUDIT_ID = AUDIT_ROOT.name
EPOCH_ID = os.environ.get("AUDIT005_EPOCH")
if not EPOCH_ID:
    raise SystemExit("AUDIT005_EPOCH is required; refusing to guess or overwrite a frozen epoch")
EPOCH_NUMBER = int(EPOCH_ID.rsplit("-", 1)[1])
ATTEMPT_ID = f"attempt-{EPOCH_NUMBER:04d}"
LANE_SUBAGENT_MODE = EPOCH_NUMBER >= 3
GLOBAL_SEMANTIC_CONCURRENCY_MAX = 48 if EPOCH_NUMBER >= 13 else (24 if EPOCH_NUMBER >= 9 else 8)
CONCURRENT_WAVE_COHORT_MAX = 6 if EPOCH_NUMBER >= 13 else (3 if EPOCH_NUMBER >= 9 else 1)
COHORT_WAVE_SIZE = 8
STAGING = AUDIT_ROOT / "master" / "staging" / EPOCH_ID
FROZEN = AUDIT_ROOT / "master" / "frozen" / EPOCH_ID
STRUCTURAL_SOURCE = (
    PLANS
    / ".audits"
    / "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
    / "build_launch.py"
)
VERIFY_SCRIPT = AUDIT_ROOT / "verify_prelaunch.py"
MAX_LINES = 400
MAX_TOKENS = 12_000
MAX_CHARS = 36_000
MAX_CAPSULE_PACKAGE_BYTES = 65_536
DEFAULT_OVERLAP_LINES = 12

ROLES = {
    "exact": {
        "role": "exact_behavior",
        "dimensions": [
            "behavior",
            "capabilities",
            "inputs_outputs",
            "contracts",
            "states_transitions",
            "authority",
            "ownership",
            "consumers",
            "gui_truth",
            "failures_recovery",
            "security_privacy",
            "propagation",
            "operations",
            "scale_performance",
            "compatibility_migration",
            "acceptance_oracles",
            "builder_discretion",
            "ambiguity_unknowns",
        ],
        "instructions": (
            "Review every authoritative core line. Extract exact behaviors, capabilities, inputs, outputs, "
            "contracts, states, authorities, owners, consumers, GUI truth, failures, recovery, validation "
            "oracles, and consequential builder discretion. Identify under-specification only with exact "
            "source evidence. Do not consult prior audits, peer results, unrelated windows, or the web."
        ),
    },
    "adversarial": {
        "role": "adversarial_negative_space",
        "dimensions": [
            "missing_callers_consumers",
            "invalid_states_transitions",
            "concurrency_races",
            "partial_failure",
            "recovery_rollback",
            "authority_boundaries",
            "privacy_data_lifecycle",
            "untrusted_inputs",
            "gui_misleading_states",
            "offline_network_loss",
            "scale_limits",
            "accessibility",
            "localization",
            "compatibility_migration",
            "observability_support",
            "destructive_actions",
            "cross_document_seams",
            "test_falsifiability",
            "unknown_unknowns",
        ],
        "instructions": (
            "Attack the negative space in every authoritative core line. Seek missing callers, states, "
            "transitions, authority, failure and recovery, security and privacy boundaries, misleading GUI "
            "truth, propagation, operations, scale, accessibility, compatibility, migration, and test "
            "oracles. Record explicit non-gaps as well as gaps. Do not consult prior audits, peer results, "
            "unrelated windows, or the web."
        ),
    },
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows)
    path.write_text(payload + ("\n" if payload else ""), encoding="utf-8")


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def root_hash(paths: list[Path], base: Path) -> str:
    records = [
        f"{path.relative_to(base).as_posix()}\0{sha(path.read_bytes())}\0{path.stat().st_size}\n"
        for path in sorted(paths)
    ]
    return sha("".join(records).encode())


def rel_epoch(path: Path) -> str:
    return path.relative_to(STAGING).as_posix()


def load_windowing_module():
    if not STRUCTURAL_SOURCE.is_file():
        raise RuntimeError(f"missing structural source: {STRUCTURAL_SOURCE}")
    spec = importlib.util.spec_from_file_location("audit005_structural_windowing", STRUCTURAL_SOURCE)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load structural windowing module")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    module.AUDIT_ID = AUDIT_ID
    module.REPO = REPO
    module.PLANS = PLANS
    module.PLAN_INDEX = PLANS / ".plan_index" / "plan_units.jsonl"
    module.MAX_LINES = MAX_LINES
    module.MAX_TOKENS = MAX_TOKENS
    module.MAX_CHARS = MAX_CHARS
    module.MAX_CAPSULE_PACKAGE_BYTES = MAX_CAPSULE_PACKAGE_BYTES
    module.DEFAULT_OVERLAP_LINES = DEFAULT_OVERLAP_LINES
    module.ROLES = {key: value["role"] for key, value in ROLES.items()}
    return module


def strict_object(required: list[str], properties: dict[str, Any]) -> dict[str, Any]:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "required": required,
        "properties": properties,
        "additionalProperties": False,
    }


def schema_documents() -> dict[str, dict[str, Any]]:
    string = {"type": "string", "minLength": 1}
    sha256 = {"type": "string", "pattern": "^[0-9a-f]{64}$"}
    evidence = strict_object(
        ["path", "line_start", "line_end", "exact_quote", "source_sha256"],
        {
            "path": string,
            "line_start": {"type": "integer", "minimum": 1},
            "line_end": {"type": "integer", "minimum": 1},
            "exact_quote": string,
            "source_sha256": sha256,
        },
    )
    item = strict_object(
        ["item_id", "item_type", "title", "statement", "severity", "confidence", "evidence"],
        {
            "item_id": string,
            "item_type": {
                "enum": [
                    "behavior",
                    "capability",
                    "contract",
                    "state_transition",
                    "authority",
                    "consumer",
                    "gui_truth",
                    "failure_recovery",
                    "acceptance_oracle",
                    "gap",
                    "unknown",
                    "explicit_non_gap",
                ]
            },
            "title": string,
            "statement": string,
            "severity": {"enum": ["none", "low", "medium", "high", "critical"]},
            "confidence": {"enum": ["low", "medium", "high"]},
            "gap_kind": {"type": "string"},
            "impact": {"type": "string"},
            "builder_discretion": {"type": "string"},
            "feature_keys": {"type": "array", "items": string, "uniqueItems": True},
            "evidence": {"type": "array", "items": evidence, "minItems": 1},
        },
    )
    dimension = strict_object(
        ["dimension", "status", "summary", "evidence_item_ids"],
        {
            "dimension": string,
            "status": {"enum": ["addressed", "gap_found", "unknown", "not_applicable"]},
            "summary": string,
            "evidence_item_ids": {"type": "array", "items": string, "uniqueItems": True},
        },
    )
    result = strict_object(
        [
            "audit_id",
            "schema_version",
            "phase",
            "assignment_id",
            "attempt_id",
            "task_thread_id",
            "model",
            "reasoning_effort",
            "role",
            "status",
            "source_binding",
            "coverage",
            "items",
            "dimension_assessments",
            "self_attestation",
        ],
        {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "assignment-result-v1"},
            "phase": {"const": "blind_document_window_review"},
            "assignment_id": string,
            "attempt_id": string,
            "task_thread_id": string,
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "role": {"enum": ["exact_behavior", "adversarial_negative_space"]},
            "status": {"enum": ["completed", "blocked"]},
            "source_binding": strict_object(
                ["document_path", "source_sha256", "core_sha256", "core_range"],
                {
                    "document_path": string,
                    "source_sha256": sha256,
                    "core_sha256": sha256,
                    "core_range": {
                        "type": "array",
                        "prefixItems": [
                            {"type": "integer", "minimum": 1},
                            {"type": "integer", "minimum": 1},
                        ],
                        "minItems": 2,
                        "maxItems": 2,
                    },
                },
            ),
            "coverage": strict_object(
                ["all_core_lines_reviewed", "dimensions_checked"],
                {
                    "all_core_lines_reviewed": {"const": True},
                    "dimensions_checked": {"type": "array", "items": string, "minItems": 1, "uniqueItems": True},
                },
            ),
            "items": {"type": "array", "items": item},
            "dimension_assessments": {"type": "array", "items": dimension, "minItems": 1},
            "self_attestation": strict_object(
                [
                    "no_prior_audit_access",
                    "no_peer_result_access",
                    "no_unrelated_source_access",
                    "no_canonical_writes",
                    "terminal_after_submission",
                ],
                {
                    "no_prior_audit_access": {"const": True},
                    "no_peer_result_access": {"const": True},
                    "no_unrelated_source_access": {"const": True},
                    "no_canonical_writes": {"const": True},
                    "terminal_after_submission": {"const": True},
                },
            ),
        },
    )
    terminal = strict_object(
        [
            "audit_id",
            "schema_version",
            "assignment_id",
            "attempt_id",
            "task_thread_id",
            "dispatch_receipt_sha256",
            "result_sha256",
            "result_bytes",
            "status",
        ],
        {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "terminal-seal-v1"},
            "assignment_id": string,
            "attempt_id": string,
            "task_thread_id": string,
            "dispatch_receipt_sha256": sha256,
            "result_sha256": sha256,
            "result_bytes": {"type": "integer", "minimum": 1},
            "status": {"enum": ["completed", "blocked"]},
        },
    )
    dispatch_required = [
            "audit_id",
            "schema_version",
            "assignment_id",
            "attempt_id",
            "task_thread_id",
            "model",
            "reasoning_effort",
            "assignment_sha256",
            "capsule_ref",
            "capsule_sha256",
            "result_schema_ref",
            "terminal_schema_ref",
            "protocol_root_sha256",
            "output_directory",
    ]
    dispatch_properties = {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "dispatch-receipt-v1"},
            "assignment_id": string,
            "attempt_id": string,
            "task_thread_id": string,
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "assignment_sha256": sha256,
            "capsule_ref": string,
            "capsule_sha256": sha256,
            "result_schema_ref": string,
            "terminal_schema_ref": string,
            "protocol_root_sha256": sha256,
            "output_directory": string,
    }
    if LANE_SUBAGENT_MODE:
        dispatch_required += ["lane_thread_id", "agent_path", "fresh_lane_subagent"]
        dispatch_properties.update(
            {
                "lane_thread_id": string,
                "agent_path": string,
                "fresh_lane_subagent": {"const": True},
            }
        )
    else:
        dispatch_required += ["fresh_top_level_thread"]
        dispatch_properties["fresh_top_level_thread"] = {"const": True}
    dispatch = strict_object(dispatch_required, dispatch_properties)
    validation = strict_object(
        ["audit_id", "schema_version", "assignment_id", "attempt_id", "status", "error_codes", "result_sha256"],
        {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "validation-receipt-v1"},
            "assignment_id": string,
            "attempt_id": string,
            "status": {"enum": ["accepted", "quarantined"]},
            "error_codes": {"type": "array", "items": string, "uniqueItems": True},
            "result_sha256": sha256,
        },
    )
    coverage = strict_object(
        [
            "audit_id",
            "schema_version",
            "complete",
            "substantive_coverage_credit",
            "accepted_assignments",
            "pending_assignments",
            "blocked_assignments",
            "current_phase",
        ],
        {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "coverage-state-v1"},
            "complete": {"type": "boolean"},
            "substantive_coverage_credit": {"type": "integer", "minimum": 0},
            "accepted_assignments": {"type": "integer", "minimum": 0},
            "pending_assignments": {"type": "integer", "minimum": 0},
            "blocked_assignments": {"type": "integer", "minimum": 0},
            "current_phase": string,
        },
    )
    return {
        "evidence_ref.schema.json": evidence,
        "assignment_result.schema.json": result,
        "terminal_seal.schema.json": terminal,
        "dispatch_receipt.schema.json": dispatch,
        "validation_receipt.schema.json": validation,
        "coverage_state.schema.json": coverage,
    }


def source_root(rows: list[dict[str, Any]]) -> str:
    records = [
        f"{row['path']}\0{row['source_sha256']}\0{row['byte_count']}\n"
        for row in sorted(rows, key=lambda row: row["path"])
        if row["disposition"] != "retired_lineage_only"
    ]
    return sha("".join(records).encode())


def numbered_source_excerpt(
    window: dict[str, Any], lines: list[str], overlap: int
) -> tuple[str, list[list[int]]]:
    start, end = window["core_line_start"], window["core_line_end"]
    before_start = max(1, start - overlap)
    after_end = min(len(lines), end + overlap)
    context_ranges: list[list[int]] = []
    pieces: list[str] = []

    def segment(label: str, seg_start: int, seg_end: int) -> str:
        body = [f"<<< {label} canonical_document_lines={seg_start}-{seg_end} >>>\n"]
        for line_no in range(seg_start, seg_end + 1):
            source_line = lines[line_no - 1]
            body.append(f"L{line_no:08d}\t{source_line}")
            if not source_line.endswith("\n"):
                body.append("\n")
        return "".join(body)

    if before_start < start:
        context_ranges.append([before_start, start - 1])
        pieces.append(segment("CONTEXT_BEFORE", before_start, start - 1))
    pieces.append(segment("AUTHORITATIVE_CORE", start, end))
    if end < after_end:
        context_ranges.append([end + 1, after_end])
        pieces.append(segment("CONTEXT_AFTER", end + 1, after_end))
    return "\n".join(pieces), context_ranges


def primary_validate(epoch: Path) -> dict[str, Any]:
    errors: list[str] = []
    scopes = load_jsonl(epoch / "manifests" / "source_scope.jsonl")
    windows = load_jsonl(epoch / "manifests" / "window_manifest.jsonl")
    capsules = load_jsonl(epoch / "manifests" / "capsule_registry.jsonl")
    assignments = load_jsonl(epoch / "manifests" / "assignment_manifest.jsonl")
    pilot = load_jsonl(epoch / "manifests" / "pilot_assignment_manifest.jsonl")
    dispositions = Counter(row["disposition"] for row in scopes)
    if dispositions != Counter({"blind_initial": 131, "post_candidate_freeze": 2, "retired_lineage_only": 2}):
        errors.append(f"scope disposition mismatch: {dict(dispositions)}")
    if len(assignments) != len(windows) * 2:
        errors.append("assignment/window cardinality mismatch")
    if len(capsules) != len(assignments):
        errors.append("capsule/assignment cardinality mismatch")
    if not 8 <= len(pilot) <= 12:
        errors.append("pilot size outside 8-12")
    role_counts: dict[str, Counter[str]] = defaultdict(Counter)
    for row in assignments:
        role_counts[row["window_id"]][row["role"]] += 1
        if row["required_model"] != "gpt-5.6-sol" or row["required_thinking"] != "xhigh":
            errors.append(f"{row['assignment_id']}: wrong model binding")
    expected_roles = Counter({"exact_behavior": 1, "adversarial_negative_space": 1})
    for window_id, counts in role_counts.items():
        if counts != expected_roles:
            errors.append(f"{window_id}: wrong role cardinality")
    for row in capsules:
        capsule = epoch / row["capsule_ref"]
        excerpt = epoch / row["source_excerpt_ref"]
        if not capsule.is_file() or sha(capsule.read_bytes()) != row["capsule_sha256"]:
            errors.append(f"{row['assignment_id']}: capsule integrity failure")
        if not excerpt.is_file() or sha(excerpt.read_bytes()) != row["source_excerpt_sha256"]:
            errors.append(f"{row['assignment_id']}: excerpt integrity failure")
        if row["capsule_package_bytes"] > MAX_CAPSULE_PACKAGE_BYTES:
            errors.append(f"{row['assignment_id']}: capsule package too large")
    return {
        "audit_id": AUDIT_ID,
        "validator": "primary_prelaunch_v1",
        "status": "pass" if not errors else "fail",
        "error_count": len(errors),
        "errors": errors[:200],
        "counts": {
            "scope_rows": len(scopes),
            "windows": len(windows),
            "assignments": len(assignments),
            "capsules": len(capsules),
            "pilot_assignments": len(pilot),
        },
    }


def run_crosscheck(epoch: Path, require_seal: bool = False) -> dict[str, Any]:
    command = [sys.executable, str(VERIFY_SCRIPT), "--epoch", str(epoch)]
    if require_seal:
        command.append("--require-seal")
    proc = subprocess.run(command, cwd=REPO, text=True, capture_output=True, check=False)
    try:
        result = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"crosscheck emitted invalid JSON: {exc}; stderr={proc.stderr[:2000]}")
    if proc.returncode != 0 or result.get("status") != "pass":
        raise RuntimeError(f"independent crosscheck failed: {json.dumps(result, sort_keys=True)[:4000]}")
    return result


def freeze_permissions(root: Path) -> None:
    for path in sorted(root.rglob("*"), reverse=True):
        if path.is_file():
            path.chmod(0o444)
        elif path.is_dir():
            path.chmod(0o555)
    root.chmod(0o555)


def build() -> dict[str, Any]:
    if FROZEN.exists():
        raise RuntimeError(f"frozen epoch already exists; refusing overwrite: {FROZEN}")
    if STAGING.exists():
        raise RuntimeError(f"staging epoch already exists; refusing implicit cleanup: {STAGING}")
    if not VERIFY_SCRIPT.is_file():
        raise RuntimeError("independent verification script is missing")
    STAGING.mkdir(parents=True)

    windowing = load_windowing_module()
    plan_rows, by_doc = windowing.load_planunits()
    active_sources, blind_sources = windowing.active_sources(by_doc)
    retired_sources = sorted(windowing.RETIRED)

    scope_rows: list[dict[str, Any]] = []
    windows: list[dict[str, Any]] = []
    for path_rel in active_sources:
        path = REPO / path_rel
        data = path.read_bytes()
        text = data.decode("utf-8")
        lines = text.splitlines(keepends=True)
        disposition = "blind_initial" if path_rel in blind_sources else "post_candidate_freeze"
        doc_id = "DOC-" + sha(path_rel.encode())[:12].upper()
        scope = {
            "audit_id": AUDIT_ID,
            "source_id": doc_id,
            "path": path_rel,
            "authority": "canonical_live_plans",
            "disposition": disposition,
            "source_sha256": sha(data),
            "byte_count": len(data),
            "line_count": len(text.splitlines()),
            "plan_unit_count": sum(1 for row in by_doc.get(path_rel, []) if row.get("status") != "retired"),
        }
        if disposition == "blind_initial":
            if path.suffix == ".md":
                atoms = windowing.markdown_atoms(path_rel, lines, by_doc.get(path_rel, []))
            else:
                atoms = windowing.json_atoms(path_rel, lines, text)
            doc_windows = windowing.pack_windows(path_rel, doc_id, lines, atoms, sha(data))
            for row in doc_windows:
                row["core_range"] = [row["core_line_start"], row["core_line_end"]]
                row["review_state"] = "sealed_unassigned"
                row["required_roles"] = ["exact_behavior", "adversarial_negative_space"]
            windows.extend(doc_windows)
            scope["window_ids"] = [row["window_id"] for row in doc_windows]
        else:
            scope["window_ids"] = []
        scope_rows.append(scope)

    for path_rel in retired_sources:
        path = REPO / path_rel
        data = path.read_bytes()
        scope_rows.append(
            {
                "audit_id": AUDIT_ID,
                "source_id": "DOC-" + sha(path_rel.encode())[:12].upper(),
                "path": path_rel,
                "authority": "source_lineage_only",
                "disposition": "retired_lineage_only",
                "source_sha256": sha(data),
                "byte_count": len(data),
                "line_count": len(data.decode("utf-8").splitlines()),
                "plan_unit_count": 0,
                "window_ids": [],
            }
        )

    exclusions = [
        {"path_prefix": "Plans/.audits/", "disposition": "excluded", "reason": "audit outputs are not canonical product prose"},
        {"path_prefix": "Plans/ledgers/", "disposition": "excluded", "reason": "source lineage memory only"},
        {"path_prefix": "Plans/_shards/", "disposition": "excluded", "reason": "generated shards"},
        {"path_prefix": "Plans/.evidence/", "disposition": "excluded", "reason": "generated governance evidence"},
        {"path_prefix": "Plans/.plan_index/", "disposition": "structural_input_only", "reason": "generated index used only for semantic boundaries"},
        {"path_prefix": "Plans/Spec_Lock.json", "disposition": "excluded", "reason": "governance lock artifact"},
        {"path_prefix": "Plans/auto_decisions.jsonl", "disposition": "excluded", "reason": "generated decision artifact"},
    ]

    for name, schema in schema_documents().items():
        write_json(STAGING / "schemas" / name, schema)
    write_json(STAGING / "protocols" / "role_cards.json", ROLES)
    write_json(
        STAGING / "protocols" / "wave_policy.json",
        ({
            "pilot_min": 8,
            "pilot_max": 8,
            "normal_wave_min": COHORT_WAVE_SIZE,
            "normal_wave_max": COHORT_WAVE_SIZE,
            "global_semantic_concurrency_max": GLOBAL_SEMANTIC_CONCURRENCY_MAX,
            "checkpoint_before_next_wave": True,
            "fresh_child_subagent_per_assignment": True,
            "retry_attempt_cap": 8,
            "retry_requires_new_child_subagent_identity": True,
        } | ({
            "concurrent_wave_cohort_max": CONCURRENT_WAVE_COHORT_MAX,
            "cohort_wave_size": COHORT_WAVE_SIZE,
            "checkpoint_each_cohort_independently": True,
            "fresh_cohort_dispatcher_per_concurrent_wave": True,
        } if EPOCH_NUMBER >= 9 else {})),
    )
    write_json(
        STAGING / "protocols" / "model_lane_policy.json",
        {
            "mechanical": {"model": "gpt-5.6-luna", "thinking": "max"},
            "semantic": {"model": "gpt-5.6-sol", "thinking": "xhigh"},
            "subagent_model_inheritance": "not_assumed_or_credited",
            "semantic_dispatch_surface": (
                "fresh_subagent_from_explicit_model_lane"
                if LANE_SUBAGENT_MODE
                else "fresh_top_level_codex_thread"
            ),
        },
    )
    write_json(
        STAGING / "protocols" / "external_research_policy.json",
        {
            "mandatory_for_every_synthesized_feature": True,
            "default_model": "gpt-5.6-sol",
            "default_thinking": "xhigh",
            "fresh_child_subagent_per_assignment": True,
            "primary_or_authoritative_sources_preferred": True,
            "negative_search_evidence_required": True,
            "research_occurs_after_blind_window_freeze": True,
        },
    )
    write_json(
        STAGING / "protocols" / "leaf_execution_policy.json",
        {
            "blind_window_authorized_reads": [
                "dispatch_receipt",
                "assigned_capsule",
                "single_source_excerpt_referenced_by_assigned_capsule",
                "assigned_result_schema",
                "assigned_terminal_schema",
            ],
            "capsule_excerpt_resolution": "resolve source_excerpt_ref relative to frozen epoch root",
            "all_other_reads_forbidden": True,
            "external_research_in_blind_window_phase": False,
            "write_scope": "one assigned attempt directory only",
            "terminal_seal_written_last": True,
            "evidence_line_number_rule": (
                "Use the numeric value in each L######## prefix as canonical line_start/line_end; "
                "exact_quote must exclude the prefix and tab and copy only source text"
            ),
        },
    )

    assignments: list[dict[str, Any]] = []
    capsule_registry: list[dict[str, Any]] = []
    seq = 0
    for window in sorted(windows, key=lambda row: row["window_id"]):
        source_path = REPO / window["document_path"]
        lines = source_path.read_text(encoding="utf-8").splitlines(keepends=True)
        overlap = DEFAULT_OVERLAP_LINES
        while True:
            excerpt, context_ranges = numbered_source_excerpt(window, lines, overlap)
            excerpt_bytes = excerpt.encode()
            provisional_sizes = []
            for role_key, role_data in ROLES.items():
                provisional = {
                    "audit_id": AUDIT_ID,
                    "role": role_data["role"],
                    "role_instructions": role_data["instructions"],
                    "required_dimensions": role_data["dimensions"],
                    "window_id": window["window_id"],
                    "document_path": window["document_path"],
                    "core_range": window["core_range"],
                    "context_ranges": context_ranges,
                    "source_sha256": window["source_sha256"],
                    "core_sha256": window["core_sha256"],
                }
                provisional_sizes.append(len(excerpt_bytes) + len(json.dumps(provisional, sort_keys=True).encode()))
            if max(provisional_sizes) <= MAX_CAPSULE_PACKAGE_BYTES:
                break
            if overlap == 0:
                raise RuntimeError(f"window cannot fit capsule limit: {window['window_id']}")
            overlap //= 2
        excerpt_hash = sha(excerpt_bytes)
        excerpt_path = STAGING / "capsules" / "source" / excerpt_hash[:2] / f"{excerpt_hash}.txt"
        if not excerpt_path.exists():
            excerpt_path.parent.mkdir(parents=True, exist_ok=True)
            excerpt_path.write_bytes(excerpt_bytes)
        for role_key in ("exact", "adversarial"):
            seq += 1
            role_data = ROLES[role_key]
            assignment_id = f"A005-{seq:06d}-{role_key.upper()}-{window['window_id']}"
            attempt_id = ATTEMPT_ID
            capsule = {
                "audit_id": AUDIT_ID,
                "schema_version": "context-capsule-v1",
                "assignment_id": assignment_id,
                "attempt_id": attempt_id,
                "phase": "blind_document_window_review",
                "role": role_data["role"],
                "role_instructions": role_data["instructions"],
                "required_dimensions": role_data["dimensions"],
                "window_id": window["window_id"],
                "document_path": window["document_path"],
                "core_range": window["core_range"],
                "context_ranges": context_ranges,
                "source_sha256": window["source_sha256"],
                "core_sha256": window["core_sha256"],
                "source_excerpt_ref": rel_epoch(excerpt_path),
                "source_excerpt_sha256": excerpt_hash,
                "source_excerpt_line_format": (
                    "L######## followed by a tab and source text; evidence uses the canonical number "
                    "and exact_quote excludes the prefix"
                ),
                "blindness": {
                    "prior_audits": "forbidden",
                    "peer_results": "forbidden",
                    "unrelated_sources": "forbidden",
                    "external_research": "deferred_to_later_feature_phase",
                },
                "output_schema_ref": "schemas/assignment_result.schema.json",
            }
            capsule_path = STAGING / "capsules" / "metadata" / assignment_id[:12] / f"{assignment_id}.json"
            write_json(capsule_path, capsule)
            capsule_bytes = capsule_path.read_bytes()
            package_bytes = len(capsule_bytes) + len(excerpt_bytes)
            if package_bytes > MAX_CAPSULE_PACKAGE_BYTES:
                raise RuntimeError(f"capsule package overflow: {assignment_id} {package_bytes}")
            registry_row = {
                "assignment_id": assignment_id,
                "window_id": window["window_id"],
                "role": role_data["role"],
                "capsule_ref": rel_epoch(capsule_path),
                "capsule_sha256": sha(capsule_bytes),
                "capsule_bytes": len(capsule_bytes),
                "source_excerpt_ref": rel_epoch(excerpt_path),
                "source_excerpt_sha256": excerpt_hash,
                "source_excerpt_bytes": len(excerpt_bytes),
                "capsule_package_bytes": package_bytes,
            }
            capsule_registry.append(registry_row)
            assignments.append(
                {
                    "audit_id": AUDIT_ID,
                    "assignment_id": assignment_id,
                    "assignment_seq": seq,
                    "attempt_id": attempt_id,
                    "phase": "blind_document_window_review",
                    "window_id": window["window_id"],
                    "document_path": window["document_path"],
                    "core_range": window["core_range"],
                    "source_sha256": window["source_sha256"],
                    "core_sha256": window["core_sha256"],
                    "role": role_data["role"],
                    "required_dimensions": role_data["dimensions"],
                    "required_model": "gpt-5.6-sol",
                    "required_thinking": "xhigh",
                    **(
                        {"fresh_lane_subagent_required": True}
                        if LANE_SUBAGENT_MODE
                        else {"fresh_top_level_thread_required": True}
                    ),
                    "forked_context_forbidden": True,
                    "followup_reuse_forbidden": True,
                    "terminal_after_submission": True,
                    "capsule_ref": registry_row["capsule_ref"],
                    "capsule_sha256": registry_row["capsule_sha256"],
                    "output_directory": f"assignments/{assignment_id}/attempts/{attempt_id}",
                    "state": "sealed_unassigned",
                }
            )

    selected_windows: list[str] = []
    selected_docs: set[str] = set()
    for window in sorted(windows, key=lambda row: (-row["token_estimate"], row["window_id"])):
        if window["document_path"] in selected_docs:
            continue
        selected_windows.append(window["window_id"])
        selected_docs.add(window["document_path"])
        if len(selected_windows) == 4:
            break
    pilot = [row for row in assignments if row["window_id"] in set(selected_windows)]

    write_jsonl(STAGING / "manifests" / "source_scope.jsonl", scope_rows)
    write_jsonl(STAGING / "manifests" / "exclusion_manifest.jsonl", exclusions)
    write_jsonl(STAGING / "manifests" / "window_manifest.jsonl", windows)
    write_jsonl(STAGING / "manifests" / "capsule_registry.jsonl", capsule_registry)
    write_jsonl(STAGING / "manifests" / "assignment_manifest.jsonl", assignments)
    write_jsonl(STAGING / "manifests" / "pilot_assignment_manifest.jsonl", pilot)

    structural_hash = sha(STRUCTURAL_SOURCE.read_bytes())
    schema_paths = sorted((STAGING / "schemas").glob("*.json"))
    protocol_paths = sorted((STAGING / "protocols").glob("*.json"))
    manifest_paths = sorted((STAGING / "manifests").glob("*.jsonl"))
    architecture = {
        "audit_id": AUDIT_ID,
        "epoch_id": EPOCH_ID,
        "supersedes_epoch": (
            f"epoch-{EPOCH_NUMBER - 1:04d}" if EPOCH_NUMBER > 1 else None
        ),
        "supersession_reason": (
            None
            if EPOCH_NUMBER == 1
            else (
                "dispatch receipt lacked explicit capsule and schema paths; all affected attempts remain zero-credit"
                if EPOCH_NUMBER == 2
                else (
                    "semantic assignments move to fresh subagents spawned by explicit-model lane controllers"
                    if EPOCH_NUMBER == 3
                    else (
                        "leaf execution policy explicitly authorizes the single excerpt referenced by the assigned capsule"
                        if EPOCH_NUMBER == 4
                        else (
                            "source excerpts carry canonical line-number prefixes to remove physical-row ambiguity"
                            if EPOCH_NUMBER == 5
                            else (
                                "failed child attempt remains immutable zero-credit; refresh attempt bindings while preserving numbered evidence and the two-controller lane architecture"
                                if EPOCH_NUMBER == 6
                                else "refresh immutable attempt bindings without changing canonical source scope"
                            )
                        )
                    )
                )
            )
        ),
        "status": "PRELAUNCH_FROZEN_NO_COVERAGE",
        "audit_only": True,
        "canonical_repairs_authorized": False,
        "prior_audit_substantive_credit": 0,
        "substantive_prior_audit_artifacts_read": 0,
        "structural_reference": {
            "path": STRUCTURAL_SOURCE.relative_to(REPO).as_posix(),
            "sha256": structural_hash,
            "allowed_use": "pure PlanUnit and JSON structural window boundaries only",
        },
        "active_authority_sources": 133,
        "blind_initial_sources": 131,
        "post_candidate_freeze_sources": 2,
        "retired_lineage_sources": 2,
        "active_markdown_plan_documents": sum(
            1 for row in scope_rows if row["disposition"] != "retired_lineage_only" and row["path"].endswith(".md")
        ),
        "window_count": len(windows),
        "assignment_count": len(assignments),
        "pilot_assignment_count": len(pilot),
        "dispatch_surface": (
            "fresh_subagent_from_explicit_model_lane"
            if LANE_SUBAGENT_MODE
            else "fresh_top_level_codex_thread"
        ),
        "global_semantic_concurrency_max": GLOBAL_SEMANTIC_CONCURRENCY_MAX,
        "concurrent_wave_cohort_max": CONCURRENT_WAVE_COHORT_MAX,
        "cohort_wave_size": COHORT_WAVE_SIZE,
        "model_lanes": {
            "mechanical": "gpt-5.6-luna/max",
            "semantic": "gpt-5.6-sol/xhigh",
        },
        "later_fresh_phases": [
            "document_integration",
            "feature_inventory",
            "external_research_per_feature",
            "cross_document_synthesis",
            "scenario_falsification",
            "shadow_specification",
            "independent_certification",
        ],
    }
    write_json(STAGING / "architecture.json", architecture)
    write_json(
        STAGING / "coverage_state.json",
        {
            "audit_id": AUDIT_ID,
            "schema_version": "coverage-state-v1",
            "complete": False,
            "substantive_coverage_credit": 0,
            "accepted_assignments": 0,
            "pending_assignments": len(assignments),
            "blocked_assignments": 0,
            "current_phase": "prelaunch_frozen_no_reviewer_authority",
        },
    )
    (STAGING / "AUDIT_CHARTER.md").write_text(
        "# Audit 005 Charter\n\n"
        "This is a fresh, exhaustive, audit-only assurance run over live canonical Plans. "
        "All prior audits provide zero substantive coverage. Every semantic assignment uses one fresh terminal "
        "child subagent spawned by the reusable explicit-model Sol controller, with one immutable attempt directory. "
        "Mechanical packet work and validation use the reusable Luna controller with fresh bounded children. The blind window "
        "phase precedes universal external research so source extraction is not anchored by prior art. "
        "External research is mandatory for essentially every synthesized feature in a later fresh phase. "
        "No canonical Plan repair, product implementation, Git commit, or push is authorized.\n",
        encoding="utf-8",
    )

    primary = primary_validate(STAGING)
    if primary["status"] != "pass":
        raise RuntimeError(f"primary prelaunch validation failed: {primary}")
    write_json(STAGING / "validation" / "primary_prelaunch.json", primary)
    cross = run_crosscheck(STAGING)
    write_json(STAGING / "validation" / "independent_prelaunch.json", cross)

    manifest_root = root_hash(manifest_paths, STAGING)
    schema_root = root_hash(schema_paths, STAGING)
    protocol_root = root_hash(protocol_paths, STAGING)
    payload_paths = (
        manifest_paths
        + schema_paths
        + protocol_paths
        + [
            STAGING / "architecture.json",
            STAGING / "coverage_state.json",
            STAGING / "AUDIT_CHARTER.md",
            STAGING / "validation" / "primary_prelaunch.json",
            STAGING / "validation" / "independent_prelaunch.json",
        ]
    )
    seal = {
        "audit_id": AUDIT_ID,
        "epoch_id": EPOCH_ID,
        "status": "PRELAUNCH_FROZEN_NO_COVERAGE",
        "substantive_coverage_credit": 0,
        "source_root_sha256": source_root(scope_rows),
        "manifest_root_sha256": manifest_root,
        "schema_root_sha256": schema_root,
        "protocol_root_sha256": protocol_root,
        "payload_root_sha256": root_hash(payload_paths, STAGING),
        "builder_sha256": sha(Path(__file__).read_bytes()),
        "independent_checker_sha256": sha(VERIFY_SCRIPT.read_bytes()),
        "structural_reference_sha256": structural_hash,
        "counts": {
            "sources": len(scope_rows),
            "windows": len(windows),
            "assignments": len(assignments),
            "pilot_assignments": len(pilot),
        },
        "reviewer_dispatch_authorized": False,
    }
    write_json(STAGING / "launch_seal.json", seal)
    run_crosscheck(STAGING, require_seal=True)

    FROZEN.parent.mkdir(parents=True, exist_ok=True)
    os.replace(STAGING, FROZEN)
    postpublish = run_crosscheck(FROZEN, require_seal=True)
    freeze_permissions(FROZEN)
    return {
        "audit_id": AUDIT_ID,
        "epoch": str(FROZEN),
        "status": "PRELAUNCH_FROZEN_NO_COVERAGE",
        "counts": seal["counts"],
        "source_root_sha256": seal["source_root_sha256"],
        "manifest_root_sha256": manifest_root,
        "schema_root_sha256": schema_root,
        "protocol_root_sha256": protocol_root,
        "payload_root_sha256": seal["payload_root_sha256"],
        "postpublish_crosscheck": postpublish["status"],
        "reviewer_dispatch_authorized": False,
    }


def main() -> None:
    try:
        result = build()
    except Exception as exc:
        print(json.dumps({"audit_id": AUDIT_ID, "status": "fail", "error": f"{type(exc).__name__}: {exc}"}, indent=2))
        raise SystemExit(1)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
