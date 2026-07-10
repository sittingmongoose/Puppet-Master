#!/usr/bin/env python3
"""Independent fail-closed verification for Audit 005 prelaunch epochs."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


AUDIT_ROOT = Path(__file__).resolve().parent
REPO = AUDIT_ROOT.parents[2]
AUDIT_ID = AUDIT_ROOT.name
EXPECTED_SCHEMAS = {
    "assignment_result.schema.json",
    "coverage_state.schema.json",
    "dispatch_receipt.schema.json",
    "evidence_ref.schema.json",
    "terminal_seal.schema.json",
    "validation_receipt.schema.json",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path}: expected JSON object")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"{path}:{line_no}: expected JSON object")
        rows.append(value)
    return rows


def safe_ref(epoch: Path, ref: str) -> Path:
    path = (epoch / ref).resolve()
    path.relative_to(epoch.resolve())
    return path


def root_hash(paths: list[Path], base: Path) -> str:
    lines = []
    for path in sorted(paths):
        lines.append(f"{path.relative_to(base).as_posix()}\0{sha(path.read_bytes())}\0{path.stat().st_size}\n")
    return sha("".join(lines).encode())


def verify(epoch: Path, require_seal: bool) -> dict[str, Any]:
    errors: list[str] = []
    epoch_number = int(epoch.name.rsplit("-", 1)[1])
    lane_subagent_mode = epoch_number >= 3

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    try:
        architecture = load_json(epoch / "architecture.json")
        coverage = load_json(epoch / "coverage_state.json")
        scopes = load_jsonl(epoch / "manifests" / "source_scope.jsonl")
        windows = load_jsonl(epoch / "manifests" / "window_manifest.jsonl")
        capsules = load_jsonl(epoch / "manifests" / "capsule_registry.jsonl")
        assignments = load_jsonl(epoch / "manifests" / "assignment_manifest.jsonl")
        pilot = load_jsonl(epoch / "manifests" / "pilot_assignment_manifest.jsonl")
        exclusions = load_jsonl(epoch / "manifests" / "exclusion_manifest.jsonl")
        wave_policy = load_json(epoch / "protocols" / "wave_policy.json")
        model_lane_policy = load_json(epoch / "protocols" / "model_lane_policy.json")
        external_research_policy = load_json(epoch / "protocols" / "external_research_policy.json")
    except Exception as exc:
        return {
            "audit_id": AUDIT_ID,
            "checker": "independent_prelaunch_v1",
            "status": "fail",
            "error_count": 1,
            "errors": [f"load failure: {type(exc).__name__}: {exc}"],
        }

    check(architecture.get("audit_id") == AUDIT_ID, "architecture audit_id mismatch")
    check(
        architecture.get("status") == "PRELAUNCH_FROZEN_NO_COVERAGE",
        "architecture status mismatch",
    )
    check(coverage.get("audit_id") == AUDIT_ID, "coverage audit_id mismatch")
    check(coverage.get("substantive_coverage_credit") == 0, "prelaunch substantive credit must be zero")
    check(coverage.get("complete") is False, "prelaunch cannot be complete")
    check(architecture.get("prior_audit_substantive_credit") == 0, "prior audit credit must be zero")
    expected_dispatch_surface = (
        "fresh_subagent_from_explicit_model_lane"
        if lane_subagent_mode
        else "fresh_top_level_codex_thread"
    )
    check(architecture.get("dispatch_surface") == expected_dispatch_surface, "wrong dispatch surface")
    check(architecture.get("global_semantic_concurrency_max") == 8, "wrong global concurrency cap")
    check(
        architecture.get("model_lanes")
        == {
            "mechanical": "gpt-5.6-luna/max",
            "semantic": "gpt-5.6-sol/xhigh",
        },
        "wrong model lane set",
    )
    check(
        wave_policy
        == {
            "pilot_min": 8,
            "pilot_max": 8,
            "normal_wave_min": 8,
            "normal_wave_max": 8,
            "global_semantic_concurrency_max": 8,
            "checkpoint_before_next_wave": True,
            "fresh_child_subagent_per_assignment": True,
            "retry_attempt_cap": 8,
            "retry_requires_new_child_subagent_identity": True,
        },
        "wave policy mismatch",
    )
    check(
        model_lane_policy.get("mechanical") == {"model": "gpt-5.6-luna", "thinking": "max"}
        and model_lane_policy.get("semantic") == {"model": "gpt-5.6-sol", "thinking": "xhigh"}
        and "certification" not in model_lane_policy,
        "model lane policy mismatch",
    )
    check(
        external_research_policy.get("mandatory_for_every_synthesized_feature") is True
        and external_research_policy.get("fresh_child_subagent_per_assignment") is True
        and "fresh_top_level_thread_per_assignment" not in external_research_policy,
        "external research policy mismatch",
    )

    schema_paths = sorted((epoch / "schemas").glob("*.json"))
    check({path.name for path in schema_paths} == EXPECTED_SCHEMAS, "schema file set mismatch")
    for path in schema_paths:
        try:
            schema = load_json(path)
            check(schema.get("type") == "object", f"{path.name}: root type must be object")
            check(schema.get("additionalProperties") is False, f"{path.name}: root must reject extra fields")
        except Exception as exc:
            errors.append(f"{path.name}: schema load failure: {exc}")

    scope_ids = [row.get("source_id") for row in scopes]
    scope_paths = [row.get("path") for row in scopes]
    check(len(scope_ids) == len(set(scope_ids)), "duplicate source_id")
    check(len(scope_paths) == len(set(scope_paths)), "duplicate source path")
    dispositions = Counter(row.get("disposition") for row in scopes)
    check(dispositions["blind_initial"] == 131, "expected 131 blind-initial sources")
    check(dispositions["post_candidate_freeze"] == 2, "expected 2 deferred sources")
    check(dispositions["retired_lineage_only"] == 2, "expected 2 retired lineage sources")
    check(len(exclusions) >= 6, "exclusion policy is incomplete")

    scope_by_path = {row["path"]: row for row in scopes}
    for row in scopes:
        path = REPO / row["path"]
        check(path.is_file(), f"missing source: {row['path']}")
        if not path.is_file():
            continue
        data = path.read_bytes()
        check(sha(data) == row.get("source_sha256"), f"source hash mismatch: {row['path']}")
        check(len(data) == row.get("byte_count"), f"source byte count mismatch: {row['path']}")
        line_count = len(data.decode("utf-8").splitlines())
        check(line_count == row.get("line_count"), f"source line count mismatch: {row['path']}")

    window_ids = [row.get("window_id") for row in windows]
    check(len(window_ids) == len(set(window_ids)), "duplicate window_id")
    by_document: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in windows:
        by_document[row.get("document_path")].append(row)
        check(row.get("audit_id") == AUDIT_ID, f"{row.get('window_id')}: audit_id mismatch")
        check(isinstance(row.get("core_range"), list) and len(row["core_range"]) == 2,
              f"{row.get('window_id')}: invalid core range")
        start, end = row.get("core_range", [0, -1])
        check(end >= start >= 1, f"{row.get('window_id')}: invalid core range values")
        check(row.get("core_line_count") == end - start + 1, f"{row.get('window_id')}: line count mismatch")
        check(row.get("core_line_count", 10**9) <= 400, f"{row.get('window_id')}: line limit exceeded")
        check(row.get("token_estimate", 10**9) <= 12000, f"{row.get('window_id')}: token limit exceeded")
        source = REPO / row.get("document_path", "")
        if source.is_file() and end >= start >= 1:
            lines = source.read_text(encoding="utf-8").splitlines(keepends=True)
            core = "".join(lines[start - 1:end]).encode()
            check(sha(core) == row.get("core_sha256"), f"{row.get('window_id')}: core hash mismatch")
            check(sha(source.read_bytes()) == row.get("source_sha256"),
                  f"{row.get('window_id')}: source binding mismatch")

    blind_paths = {row["path"] for row in scopes if row.get("disposition") == "blind_initial"}
    check(set(by_document) == blind_paths, "windowed document set differs from blind source set")
    for path in sorted(blind_paths):
        expected_end = scope_by_path[path]["line_count"]
        ordered = sorted(by_document[path], key=lambda row: row["core_range"][0])
        cursor = 1
        for row in ordered:
            start, end = row["core_range"]
            check(start == cursor, f"{path}: gap or overlap before {row['window_id']}")
            cursor = end + 1
        check(cursor == expected_end + 1, f"{path}: final coverage mismatch")

    assignment_ids = [row.get("assignment_id") for row in assignments]
    check(len(assignment_ids) == len(set(assignment_ids)), "duplicate assignment_id")
    check(len(assignments) == len(windows) * 2, "assignment count must equal two per window")
    roles_by_window: dict[str, list[str]] = defaultdict(list)
    for row in assignments:
        roles_by_window[row.get("window_id")].append(row.get("role"))
        check(row.get("required_model") == "gpt-5.6-sol", f"{row.get('assignment_id')}: wrong model")
        check(row.get("required_thinking") == "xhigh", f"{row.get('assignment_id')}: wrong effort")
        if lane_subagent_mode:
            check(row.get("fresh_lane_subagent_required") is True,
                  f"{row.get('assignment_id')}: lane-subagent freshness requirement missing")
            check("fresh_top_level_thread_required" not in row,
                  f"{row.get('assignment_id')}: obsolete top-level dispatch field present")
        else:
            check(row.get("fresh_top_level_thread_required") is True,
                  f"{row.get('assignment_id')}: freshness requirement missing")
        check(row.get("followup_reuse_forbidden") is True,
              f"{row.get('assignment_id')}: follow-up reuse must be forbidden")
        check(row.get("state") == "sealed_unassigned", f"{row.get('assignment_id')}: wrong state")
        check("runner_id" not in row and "runner_thread_id" not in row,
              f"{row.get('assignment_id')}: legacy runner binding present")
    for window_id in window_ids:
        check(sorted(roles_by_window[window_id]) == ["adversarial_negative_space", "exact_behavior"],
              f"{window_id}: role pair mismatch")

    capsule_by_assignment = {row.get("assignment_id"): row for row in capsules}
    check(len(capsule_by_assignment) == len(capsules), "duplicate capsule assignment")
    check(set(capsule_by_assignment) == set(assignment_ids), "capsule/assignment set mismatch")
    for row in capsules:
        assignment_id = row.get("assignment_id")
        try:
            capsule_path = safe_ref(epoch, row["capsule_ref"])
            excerpt_path = safe_ref(epoch, row["source_excerpt_ref"])
            check(capsule_path.is_file(), f"{assignment_id}: missing capsule")
            check(excerpt_path.is_file(), f"{assignment_id}: missing excerpt")
            if capsule_path.is_file():
                check(sha(capsule_path.read_bytes()) == row.get("capsule_sha256"),
                      f"{assignment_id}: capsule hash mismatch")
            if excerpt_path.is_file():
                check(sha(excerpt_path.read_bytes()) == row.get("source_excerpt_sha256"),
                      f"{assignment_id}: excerpt hash mismatch")
            check(row.get("capsule_package_bytes", 10**9) <= 65536,
                  f"{assignment_id}: capsule package exceeds limit")
        except Exception as exc:
            errors.append(f"{assignment_id}: unsafe or invalid capsule ref: {exc}")

    check(len(pilot) == 8, "pilot must contain exactly 8 assignments")
    check(set(row.get("assignment_id") for row in pilot).issubset(set(assignment_ids)),
          "pilot contains unknown assignment")

    manifest_paths = [
        epoch / "manifests" / name
        for name in (
            "source_scope.jsonl",
            "window_manifest.jsonl",
            "capsule_registry.jsonl",
            "assignment_manifest.jsonl",
            "pilot_assignment_manifest.jsonl",
            "exclusion_manifest.jsonl",
        )
    ]
    computed_manifest_root = root_hash(manifest_paths, epoch)
    computed_schema_root = root_hash(schema_paths, epoch)
    if require_seal:
        try:
            seal = load_json(epoch / "launch_seal.json")
            check(seal.get("audit_id") == AUDIT_ID, "seal audit_id mismatch")
            check(seal.get("status") == "PRELAUNCH_FROZEN_NO_COVERAGE", "seal status mismatch")
            check(seal.get("manifest_root_sha256") == computed_manifest_root, "seal manifest root mismatch")
            check(seal.get("schema_root_sha256") == computed_schema_root, "seal schema root mismatch")
            check(seal.get("substantive_coverage_credit") == 0, "seal must grant zero credit")
        except Exception as exc:
            errors.append(f"launch seal failure: {exc}")

    return {
        "audit_id": AUDIT_ID,
        "checker": "independent_prelaunch_v1",
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
        "manifest_root_sha256": computed_manifest_root,
        "schema_root_sha256": computed_schema_root,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", required=True, type=Path)
    parser.add_argument("--require-seal", action="store_true")
    args = parser.parse_args()
    result = verify(args.epoch.resolve(), args.require_seal)
    print(json.dumps(result, indent=2, sort_keys=True))
    raise SystemExit(0 if result["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
