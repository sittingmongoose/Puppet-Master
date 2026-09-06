#!/usr/bin/env python3
"""Prepare, inspect, and merge parallel integration-packet audit review work.

The helper never evaluates implementation evidence and never infers a pass.  It
only partitions the retained manifest, validates independently authored result
files, and copies complete supplied results into a new completed report.

Workflow and fixed paths below ``--dir``::

  prepare --dir AUDIT_DIR --max-cases N
      creates review-work/chunks/chunk-XXXXX.json and the empty directory
      review-work/results/.  Existing review-work is never overwritten.

  Reviewers write the exact ``result_relative_path`` named by each chunk.  A
  chunk result is a JSON object with exactly these top-level fields:

      chunk_id, manifest_sha256, reviewer, checked_at, review_method,
      review_receipt_ref, case_results

  Each case result contains exactly:

      case_ref, case_id, source_identifier, source_ref, source_line, suite,
      applicability, status, evidence_refs, findings, residual_risk, reviewer,
      checked_at

  ``status`` must be one of pass, partial, fail, blocked, or not_applicable.
  Reviewer and checked_at must be non-empty and must match the file-level
  values.  checked_at is an ISO-8601 timestamp with a timezone.  The file also
  declares review_method=case_by_case_direct_evidence and a unique non-empty
  review_receipt_ref.  Pass and not_applicable require at least one non-empty,
  non-placeholder evidence reference.  Partial/fail/blocked retain their
  literal status and require a named finding and residual risk.

  Before merge, write review-work/results/audit_report.metadata.json with:

      manifest_sha256, implementation_freeze_ref, suite_verdicts,
      aggregate_verdict, blockers, unresolved_findings, reviewers

  Suite keys must exactly match the manifest.  Verdicts are pass, fail, or
  blocked; pass verdicts require evidence.  Aggregate pass is accepted only
  when every supplied suite verdict passes and every case is pass or
  not_applicable.  Other aggregate outcomes are retained as supplied.

  status --dir AUDIT_DIR
      reports expected/result/missing/duplicate chunk and case counts.  It does
      not turn incomplete work into a success claim.

  merge --dir AUDIT_DIR
      requires every exact result file and the metadata file, validates all
      shapes and case-ref sets, then writes audit_report.completed.json from
      audit_report.template.json.  Neither the template nor an existing
      completed report is ever overwritten.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

# Also support the existing importlib-based harness entry point.
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_packet_audit_verdicts import validate_suite_case_verdicts
from pm_packet_audit_census import (
    CURRENT_SCHEMA, LEGACY_CASE_COUNT, validate_manifest_census, validate_source_freeze,
)

WORK_DIR = "review-work"
CHUNKS_DIR = "chunks"
RESULTS_DIR = "results"
METADATA_NAME = "audit_report.metadata.json"
COMPLETED_NAME = "audit_report.completed.json"
EXPECTED_CASE_COUNT = LEGACY_CASE_COUNT  # Historical V1 harness compatibility only.
REVIEW_METHOD = "case_by_case_direct_evidence"
TERMINAL_STATUSES = {"pass", "partial", "fail", "blocked", "not_applicable"}
TERMINAL_VERDICTS = {"pass", "fail", "blocked"}
RESULT_KEYS = {
    "case_ref", "case_id", "source_identifier", "source_ref", "source_line",
    "suite", "applicability", "status", "evidence_refs", "findings",
    "residual_risk", "reviewer", "checked_at",
}
RESULT_FILE_KEYS = {
    "chunk_id", "manifest_sha256", "reviewer", "checked_at", "review_method",
    "review_receipt_ref", "case_results",
}
METADATA_KEYS = {
    "manifest_sha256", "implementation_freeze_ref", "suite_verdicts",
    "aggregate_verdict", "blockers", "unresolved_findings", "reviewers",
}
CASE_IDENTITY_KEYS = ("case_id", "source_identifier", "source_ref", "source_line")
BASE_REPORT_KEYS = {
    "schema_id", "schema_version", "created_at", "manifest_sha256",
    "implementation_freeze_ref", "claim_boundary", "suite_verdicts", "case_results",
    "aggregate_verdict", "blockers", "unresolved_findings", "reviewers",
}
PLACEHOLDER_REVIEWERS = {"unknown", "none", "n/a", "na", "tbd", "unassigned", "reviewer"}
PLACEHOLDER_EVIDENCE_PREFIXES = (
    "bulk:", "inferred:", "placeholder:", "same-as-above", "template:", "todo:", "tbd:",
)


class WorkError(RuntimeError):
    """A fail-closed input or retained-output error."""


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise WorkError(f"cannot load JSON {path}: {error}") from error


def write_json_new(path: Path, value: Any) -> None:
    if path.exists():
        raise WorkError(f"refusing to overwrite retained output: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with path.open("x", encoding="utf-8") as handle:
            json.dump(value, handle, indent=2, sort_keys=True)
            handle.write("\n")
    except OSError as error:
        raise WorkError(f"cannot write {path}: {error}") from error


def sha256_file(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError as error:
        raise WorkError(f"cannot hash {path}: {error}") from error


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def is_nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_timestamp(value: Any) -> bool:
    if not is_nonempty_string(value):
        return False
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = dt.datetime.fromisoformat(normalized)
    except ValueError:
        return False
    return parsed.tzinfo is not None and parsed.utcoffset() is not None


def is_reviewer(value: Any) -> bool:
    return is_nonempty_string(value) and value.strip().lower() not in PLACEHOLDER_REVIEWERS


def valid_source_line(value: Any) -> bool:
    return value is None or (
        isinstance(value, int) and not isinstance(value, bool) and value > 0
    )


def is_placeholder_evidence(value: str) -> bool:
    normalized = value.strip().lower()
    return normalized in {"none", "n/a", "na", "tbd", "todo", "same as above"} or any(
        normalized.startswith(prefix) for prefix in PLACEHOLDER_EVIDENCE_PREFIXES
    )


def string_list(value: Any, field: str, failures: list[str], *, nonempty: bool = False) -> list[str]:
    if not isinstance(value, list) or any(not is_nonempty_string(item) for item in value):
        failures.append(f"{field} must be an array of non-empty strings")
        return []
    if nonempty and not value:
        failures.append(f"{field} must not be empty")
    return value


def current_source_manifest() -> dict[str, Any]:
    """Use the authoritative extractor, never a second packet interpretation."""
    path = Path(__file__).with_name("pm-integration-packet-audit.py")
    spec = importlib.util.spec_from_file_location("pm_packet_audit_source_census", path)
    if spec is None or spec.loader is None:
        raise WorkError("cannot load packet source-census validator")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    try:
        return module.build_manifest()
    except (module.AuditError, OSError, ValueError, KeyError) as error:
        raise WorkError(f"cannot revalidate current packet source census: {error}") from error


def load_manifest(directory: Path) -> tuple[dict[str, Any], str]:
    path = directory / "audit_manifest.json"
    manifest = read_json(path)
    if not isinstance(manifest, dict) or not isinstance(manifest.get("groups"), list):
        raise WorkError("audit_manifest.json must be an object with a groups array")
    if manifest.get("source_census_valid") is not True:
        raise WorkError("audit_manifest.json source_census_valid must be true")
    required_suites = manifest.get("required_suite_verdicts")
    if (
        not isinstance(required_suites, list)
        or any(not is_nonempty_string(suite) for suite in required_suites)
        or len(required_suites) != len(set(required_suites))
    ):
        raise WorkError("audit_manifest.json required_suite_verdicts must be unique non-empty strings")
    expected: set[str] = set()
    seen_groups: set[str] = set()
    actual_count = 0
    for group_index, group in enumerate(manifest["groups"]):
        if not isinstance(group, dict):
            raise WorkError(f"manifest group {group_index} must be an object")
        group_id, suite, cases = group.get("group_id"), group.get("suite"), group.get("cases")
        if not is_nonempty_string(group_id) or not is_nonempty_string(suite) or not isinstance(cases, list):
            raise WorkError(f"manifest group {group_index} has invalid group_id, suite, or cases")
        if group_id in seen_groups:
            raise WorkError(f"duplicate manifest group_id: {group_id}")
        seen_groups.add(group_id)
        if group.get("actual_count") != len(cases):
            raise WorkError(f"manifest group {group_id} actual_count does not match cases")
        for case_index, case in enumerate(cases):
            if not isinstance(case, dict) or not is_nonempty_string(case.get("case_id")):
                raise WorkError(f"manifest group {group_id} case {case_index} has invalid case_id")
            if not is_nonempty_string(case.get("source_identifier")):
                raise WorkError(f"manifest case {group_id}/{case['case_id']} has invalid source_identifier")
            if not is_nonempty_string(case.get("source_ref")):
                raise WorkError(f"manifest case {group_id}/{case['case_id']} has invalid source_ref")
            if not valid_source_line(case.get("source_line")):
                raise WorkError(f"manifest case {group_id}/{case['case_id']} has invalid source_line")
            if not is_nonempty_string(case.get("applicability")):
                raise WorkError(f"manifest case {group_id}/{case['case_id']} has invalid applicability")
            case_ref = f"{group_id}/{case['case_id']}"
            if case_ref in expected:
                raise WorkError(f"duplicate manifest case_ref: {case_ref}")
            expected.add(case_ref)
            actual_count += 1
    if manifest.get("case_count") != actual_count:
        raise WorkError(
            f"manifest case_count {manifest.get('case_count')!r} does not match {actual_count} cases"
        )
    failures = validate_manifest_census(manifest)
    if not failures and manifest.get("schema_id") == CURRENT_SCHEMA:
        failures.extend(validate_source_freeze(manifest, current_source_manifest()))
    if failures:
        raise WorkError("; ".join(failures))
    if manifest.get("group_count") != len(manifest["groups"]):
        raise WorkError("manifest group_count does not match groups array")
    return manifest, sha256_file(path)


def prepare(directory: Path, max_cases: int) -> dict[str, Any]:
    if max_cases < 1:
        raise WorkError("--max-cases must be a positive integer")
    manifest, manifest_sha = load_manifest(directory)
    work = directory / WORK_DIR
    if work.exists():
        raise WorkError(f"refusing to overwrite existing review workspace: {work}")

    pieces: list[tuple[dict[str, Any], int, int, list[dict[str, Any]]]] = []
    for group in manifest["groups"]:
        cases = group["cases"]
        part_count = max(1, (len(cases) + max_cases - 1) // max_cases)
        for part_index, start in enumerate(range(0, len(cases), max_cases), start=1):
            pieces.append((group, part_index, part_count, cases[start:start + max_cases]))

    chunks: list[dict[str, Any]] = []
    assigned: list[str] = []
    chunk_count = len(pieces)
    for index, (group, part_index, part_count, cases) in enumerate(pieces, start=1):
        chunk_id = f"chunk-{index:05d}"
        chunk_cases = []
        for case in cases:
            case_copy = dict(case)
            case_copy["case_ref"] = f"{group['group_id']}/{case['case_id']}"
            chunk_cases.append(case_copy)
            assigned.append(case_copy["case_ref"])
        group_metadata = {key: value for key, value in group.items() if key != "cases"}
        chunk = {
            "schema_id": "pm.integration_packet_audit_review_chunk.v1",
            "schema_version": "1.0.0",
            "chunk_id": chunk_id,
            "chunk_index": index,
            "chunk_count": chunk_count,
            "manifest_sha256": manifest_sha,
            "max_cases": max_cases,
            "group_id": group["group_id"],
            "suite": group["suite"],
            "group_part_index": part_index,
            "group_part_count": part_count,
            "group_metadata": group_metadata,
            "case_count": len(chunk_cases),
            "cases": chunk_cases,
            "result_relative_path": f"{WORK_DIR}/{RESULTS_DIR}/{chunk_id}.result.json",
            "aggregate_metadata_relative_path": f"{WORK_DIR}/{RESULTS_DIR}/{METADATA_NAME}",
        }
        chunks.append(chunk)

    if len(assigned) != manifest["case_count"] or len(set(assigned)) != len(assigned):
        raise WorkError("internal partition check failed: cases were omitted or duplicated")

    (work / CHUNKS_DIR).mkdir(parents=True)
    (work / RESULTS_DIR).mkdir()
    for chunk in chunks:
        write_json_new(work / CHUNKS_DIR / f"{chunk['chunk_id']}.json", chunk)
    index = {
        "schema_id": "pm.integration_packet_audit_review_index.v1",
        "schema_version": "1.0.0",
        "manifest_sha256": manifest_sha,
        "max_cases": max_cases,
        "chunk_count": len(chunks),
        "case_count": len(assigned),
        "chunks": [
            {
                "chunk_id": chunk["chunk_id"],
                "chunk_relative_path": f"{WORK_DIR}/{CHUNKS_DIR}/{chunk['chunk_id']}.json",
                "result_relative_path": chunk["result_relative_path"],
                "group_id": chunk["group_id"],
                "suite": chunk["suite"],
                "case_count": chunk["case_count"],
            }
            for chunk in chunks
        ],
        "aggregate_metadata_relative_path": f"{WORK_DIR}/{RESULTS_DIR}/{METADATA_NAME}",
        "completed_report_relative_path": COMPLETED_NAME,
    }
    write_json_new(work / "index.json", index)
    return {
        "schema_id": "pm.integration_packet_audit_review_prepare_result.v1",
        "manifest_sha256": manifest_sha,
        "chunk_count": len(chunks),
        "case_count": len(assigned),
        "max_cases": max_cases,
        "index": str(work / "index.json"),
        "results_directory": str(work / RESULTS_DIR),
        "implementation_verdict": "not_run",
    }


def load_index(directory: Path, manifest_sha: str, expected_case_count: int) -> dict[str, Any]:
    index = read_json(directory / WORK_DIR / "index.json")
    if not isinstance(index, dict) or index.get("manifest_sha256") != manifest_sha:
        raise WorkError("review index is missing, malformed, or bound to a different manifest")
    rows = index.get("chunks")
    if not isinstance(rows, list) or index.get("chunk_count") != len(rows):
        raise WorkError("review index chunk_count does not match chunks array")
    if index.get("case_count") != expected_case_count:
        raise WorkError(
            f"review index must cover exactly {expected_case_count} source-bound cases"
        )
    if index.get("aggregate_metadata_relative_path") != f"{WORK_DIR}/{RESULTS_DIR}/{METADATA_NAME}":
        raise WorkError("review index has non-canonical aggregate metadata path")
    if index.get("completed_report_relative_path") != COMPLETED_NAME:
        raise WorkError("review index has non-canonical completed report path")
    return index


def load_chunks(directory: Path, index: dict[str, Any], manifest: dict[str, Any],
                manifest_sha: str) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    seen_chunks: set[str] = set()
    seen_cases: set[str] = set()
    manifest_cases: dict[str, tuple[str, dict[str, Any]]] = {}
    for group in manifest["groups"]:
        for case in group["cases"]:
            manifest_cases[f"{group['group_id']}/{case['case_id']}"] = (group["suite"], case)
    chunks_root = directory / WORK_DIR / CHUNKS_DIR
    expected_chunk_names = {f"chunk-{index_number:05d}.json" for index_number in range(1, len(index["chunks"]) + 1)}
    actual_chunk_names = {path.name for path in chunks_root.glob("*.json")} if chunks_root.is_dir() else set()
    if actual_chunk_names != expected_chunk_names:
        raise WorkError(
            "chunk file set mismatch: "
            f"missing={len(expected_chunk_names - actual_chunk_names)} "
            f"unexpected={len(actual_chunk_names - expected_chunk_names)}"
        )
    for position, row in enumerate(index["chunks"], start=1):
        if not isinstance(row, dict) or not is_nonempty_string(row.get("chunk_id")):
            raise WorkError("review index contains an invalid chunk entry")
        chunk_id = row["chunk_id"]
        expected_chunk_id = f"chunk-{position:05d}"
        if chunk_id != expected_chunk_id:
            raise WorkError(f"review index chunk {position} must be {expected_chunk_id}")
        if chunk_id in seen_chunks:
            raise WorkError(f"duplicate chunk_id in review index: {chunk_id}")
        seen_chunks.add(chunk_id)
        expected_path = f"{WORK_DIR}/{CHUNKS_DIR}/{chunk_id}.json"
        if row.get("chunk_relative_path") != expected_path:
            raise WorkError(f"{chunk_id}: non-canonical chunk_relative_path")
        chunk = read_json(directory / expected_path)
        if not isinstance(chunk, dict) or chunk.get("chunk_id") != chunk_id:
            raise WorkError(f"{chunk_id}: chunk file identity mismatch")
        if chunk.get("manifest_sha256") != manifest_sha:
            raise WorkError(f"{chunk_id}: manifest_sha256 mismatch")
        if chunk.get("chunk_index") != position or chunk.get("chunk_count") != len(index["chunks"]):
            raise WorkError(f"{chunk_id}: chunk_index/chunk_count mismatch")
        if chunk.get("group_id") != row.get("group_id") or chunk.get("suite") != row.get("suite"):
            raise WorkError(f"{chunk_id}: group_id/suite drift from review index")
        cases = chunk.get("cases")
        if not isinstance(cases, list) or chunk.get("case_count") != len(cases):
            raise WorkError(f"{chunk_id}: invalid cases or case_count")
        if row.get("case_count") != len(cases):
            raise WorkError(f"{chunk_id}: review index case_count mismatch")
        for case in cases:
            ref = case.get("case_ref") if isinstance(case, dict) else None
            if not is_nonempty_string(ref):
                raise WorkError(f"{chunk_id}: case is missing case_ref")
            if ref in seen_cases:
                raise WorkError(f"duplicate case_ref across chunks: {ref}")
            expected_case = manifest_cases.get(ref)
            if expected_case is None:
                raise WorkError(f"{chunk_id}: case_ref is absent from manifest: {ref}")
            expected_suite, manifest_case = expected_case
            if chunk.get("suite") != expected_suite:
                raise WorkError(f"{chunk_id}: {ref}: suite drift from manifest")
            expected_value = dict(manifest_case)
            expected_value["case_ref"] = ref
            if case != expected_value:
                raise WorkError(f"{chunk_id}: {ref}: case identity/source content drift")
            seen_cases.add(ref)
        expected_result = f"{WORK_DIR}/{RESULTS_DIR}/{chunk_id}.result.json"
        if chunk.get("result_relative_path") != expected_result or row.get("result_relative_path") != expected_result:
            raise WorkError(f"{chunk_id}: non-canonical result_relative_path")
        chunks.append(chunk)
    if seen_cases != set(manifest_cases) or len(seen_cases) != manifest["case_count"]:
        raise WorkError("chunk case union does not exactly match the source-bound manifest")
    return chunks


def validate_result_file(chunk: dict[str, Any], value: Any, manifest_sha: str) -> tuple[list[str], list[dict[str, Any]]]:
    failures: list[str] = []
    label = chunk["chunk_id"]
    if not isinstance(value, dict):
        return [f"{label}: result file must be a JSON object"], []
    if set(value) != RESULT_FILE_KEYS:
        failures.append(f"{label}: result top-level keys must be exactly {sorted(RESULT_FILE_KEYS)}")
    if value.get("chunk_id") != label:
        failures.append(f"{label}: result chunk_id mismatch")
    if value.get("manifest_sha256") != manifest_sha:
        failures.append(f"{label}: result manifest_sha256 mismatch")
    reviewer, checked_at = value.get("reviewer"), value.get("checked_at")
    if not is_reviewer(reviewer):
        failures.append(f"{label}: reviewer must be a non-placeholder identity")
    if not is_timestamp(checked_at):
        failures.append(f"{label}: checked_at must be an ISO-8601 timestamp with timezone")
    if value.get("review_method") != REVIEW_METHOD:
        failures.append(f"{label}: review_method must be {REVIEW_METHOD!r}; bulk/inferred review is rejected")
    if not is_nonempty_string(value.get("review_receipt_ref")):
        failures.append(f"{label}: review_receipt_ref must be a non-empty string")
    elif is_placeholder_evidence(value["review_receipt_ref"]):
        failures.append(f"{label}: placeholder/bulk/inferred review_receipt_ref is rejected")
    rows = value.get("case_results")
    if not isinstance(rows, list):
        return failures + [f"{label}: case_results must be an array"], []

    expected = {case["case_ref"]: case for case in chunk["cases"]}
    actual: dict[str, dict[str, Any]] = {}
    for position, row in enumerate(rows):
        if not isinstance(row, dict):
            failures.append(f"{label}: case_results[{position}] must be an object")
            continue
        if set(row) != RESULT_KEYS:
            failures.append(
                f"{label}: case_results[{position}] keys must be exactly {sorted(RESULT_KEYS)}"
            )
        ref = row.get("case_ref")
        if not is_nonempty_string(ref):
            failures.append(f"{label}: case_results[{position}] has invalid case_ref")
            continue
        if ref in actual:
            failures.append(f"{label}: duplicate case_ref {ref}")
        actual[ref] = row
    missing, extra = set(expected) - set(actual), set(actual) - set(expected)
    if missing or extra:
        failures.append(f"{label}: exact case_ref set mismatch: missing={len(missing)} extra={len(extra)}")

    for ref in sorted(set(expected).intersection(actual)):
        row, case = actual[ref], expected[ref]
        for field in CASE_IDENTITY_KEYS:
            if row.get(field) != case.get(field):
                failures.append(f"{label}: {ref}: {field} drift")
        if row.get("suite") != chunk["suite"] or row.get("applicability") != case.get("applicability"):
            failures.append(f"{label}: {ref}: suite/applicability drift")
        status = row.get("status")
        if status not in TERMINAL_STATUSES:
            failures.append(f"{label}: {ref}: invalid or non-terminal status {status!r}")
        if status == "not_applicable" and case.get("applicability") not in {
            "retired_bakeoff_process_only", "superseded",
        }:
            failures.append(f"{label}: {ref}: retained/adapted case cannot be not_applicable")
        evidence = string_list(
            row.get("evidence_refs"), f"{label}: {ref}: evidence_refs", failures,
            nonempty=status in {"pass", "not_applicable"},
        )
        if any(is_placeholder_evidence(item) for item in evidence):
            failures.append(f"{label}: {ref}: placeholder/bulk/inferred evidence is rejected")
        findings = string_list(row.get("findings"), f"{label}: {ref}: findings", failures)
        if status in {"partial", "fail", "blocked"} and not findings:
            failures.append(f"{label}: {ref}: {status} requires at least one named finding")
        if not is_nonempty_string(row.get("residual_risk")):
            failures.append(f"{label}: {ref}: residual_risk must be a non-empty string")
        if row.get("reviewer") != reviewer or not is_reviewer(row.get("reviewer")):
            failures.append(f"{label}: {ref}: reviewer must match the file reviewer")
        if row.get("checked_at") != checked_at or not is_timestamp(row.get("checked_at")):
            failures.append(f"{label}: {ref}: checked_at must match the valid file timestamp")
        if status == "not_applicable" and not evidence:
            pass  # The precise evidence failure is already recorded above.
    ordered = [actual[case["case_ref"]] for case in chunk["cases"] if case["case_ref"] in actual]
    return failures, ordered


def collect(directory: Path) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any]]:
    manifest, manifest_sha = load_manifest(directory)
    index = load_index(directory, manifest_sha, manifest["case_count"])
    chunks = load_chunks(directory, index, manifest, manifest_sha)
    results_root = directory / WORK_DIR / RESULTS_DIR
    expected_names = {f"{chunk['chunk_id']}.result.json" for chunk in chunks}
    actual_paths = sorted(results_root.glob("*.result.json")) if results_root.is_dir() else []
    actual_names = {path.name for path in actual_paths}
    missing_names = expected_names - actual_names
    extra_names = actual_names - expected_names
    failures: list[str] = [f"unexpected result file: {name}" for name in sorted(extra_names)]
    if results_root.is_dir():
        allowed_names = expected_names | {METADATA_NAME}
        for path in sorted(results_root.iterdir()):
            if path.name not in allowed_names:
                failures.append(f"unexpected review-work/results entry: {path.name}")
            if path.is_symlink():
                failures.append(f"symlinked review result/metadata is rejected: {path.name}")
    all_rows: list[dict[str, Any]] = []
    raw_ref_counts: dict[str, int] = {}
    raw_result_row_count = 0
    valid_file_count = 0
    receipt_counts: dict[str, int] = {}
    for chunk in chunks:
        path = results_root / f"{chunk['chunk_id']}.result.json"
        if not path.is_file():
            continue
        value = read_json(path)
        if isinstance(value, dict) and is_nonempty_string(value.get("review_receipt_ref")):
            receipt = value["review_receipt_ref"]
            receipt_counts[receipt] = receipt_counts.get(receipt, 0) + 1
        if isinstance(value, dict) and isinstance(value.get("case_results"), list):
            raw_result_row_count += len(value["case_results"])
            for row in value["case_results"]:
                if isinstance(row, dict) and is_nonempty_string(row.get("case_ref")):
                    ref = row["case_ref"]
                    raw_ref_counts[ref] = raw_ref_counts.get(ref, 0) + 1
        file_failures, rows = validate_result_file(chunk, value, manifest_sha)
        failures.extend(file_failures)
        if not file_failures:
            valid_file_count += 1
        all_rows.extend(rows)
    for receipt, count in sorted(receipt_counts.items()):
        if count > 1:
            failures.append(f"duplicate review_receipt_ref across {count} chunks: {receipt}")
    expected_case_count = index["case_count"]
    expected_refs = {case["case_ref"] for chunk in chunks for case in chunk["cases"]}
    raw_refs = set(raw_ref_counts)
    missing_case_count = len(expected_refs - raw_refs)
    duplicate_count = sum(count - 1 for count in raw_ref_counts.values() if count > 1)
    summary = {
        "schema_id": "pm.integration_packet_audit_review_status.v1",
        "manifest_sha256": manifest_sha,
        "expected_chunk_count": len(chunks),
        "result_file_count": len(actual_paths),
        "valid_result_file_count": valid_file_count,
        "missing_result_count": len(missing_names),
        "unexpected_result_count": len(extra_names),
        "expected_case_count": expected_case_count,
        "result_case_count": raw_result_row_count,
        "missing_case_count": missing_case_count,
        "duplicate_case_count": duplicate_count,
        "expected_count": expected_case_count,
        "result_count": raw_result_row_count,
        "missing_count": missing_case_count,
        "duplicate_count": duplicate_count,
        "validation_failure_count": len(failures),
        "complete": (
            not missing_names and not extra_names and not failures
            and not (raw_refs - expected_refs) and missing_case_count == 0 and duplicate_count == 0
            and raw_result_row_count == expected_case_count and len(all_rows) == expected_case_count
        ),
        "missing_results": sorted(missing_names),
        "failures": failures,
        "implementation_verdict": "not_inferred",
    }
    return manifest, all_rows, summary


def validate_metadata(directory: Path, manifest: dict[str, Any], manifest_sha: str,
                      rows: list[dict[str, Any]]) -> tuple[dict[str, Any], list[str]]:
    path = directory / WORK_DIR / RESULTS_DIR / METADATA_NAME
    value = read_json(path)
    failures: list[str] = []
    if not isinstance(value, dict):
        return {}, [f"{METADATA_NAME} must be a JSON object"]
    if set(value) != METADATA_KEYS:
        failures.append(f"{METADATA_NAME} keys must be exactly {sorted(METADATA_KEYS)}")
    if value.get("manifest_sha256") != manifest_sha:
        failures.append(f"{METADATA_NAME}: manifest_sha256 mismatch")
    if not is_nonempty_string(value.get("implementation_freeze_ref")):
        failures.append(f"{METADATA_NAME}: implementation_freeze_ref must be a non-empty string")
    elif is_placeholder_evidence(value["implementation_freeze_ref"]):
        failures.append(f"{METADATA_NAME}: placeholder implementation_freeze_ref is rejected")
    required_suites = set(manifest.get("required_suite_verdicts", []))
    verdicts = value.get("suite_verdicts")
    if not isinstance(verdicts, dict) or set(verdicts) != required_suites:
        failures.append(f"{METADATA_NAME}: suite_verdict keys must exactly match the manifest")
        verdicts = verdicts if isinstance(verdicts, dict) else {}
    failures.extend(validate_suite_case_verdicts(manifest, rows, verdicts))
    for suite, item in verdicts.items():
        if not isinstance(item, dict) or set(item) != {"verdict", "evidence_refs", "residual_risk"}:
            failures.append(f"suite {suite}: metadata keys must be verdict, evidence_refs, residual_risk")
            continue
        verdict = item.get("verdict")
        if verdict not in TERMINAL_VERDICTS:
            failures.append(f"suite {suite}: invalid or non-terminal verdict {verdict!r}")
        suite_evidence = string_list(
            item.get("evidence_refs"), f"suite {suite}: evidence_refs", failures,
            nonempty=verdict == "pass",
        )
        if any(is_placeholder_evidence(ref) for ref in suite_evidence):
            failures.append(f"suite {suite}: placeholder/bulk/inferred evidence is rejected")
        if not is_nonempty_string(item.get("residual_risk")):
            failures.append(f"suite {suite}: residual_risk must be a non-empty string")
    aggregate = value.get("aggregate_verdict")
    if aggregate not in TERMINAL_VERDICTS:
        failures.append(f"invalid or non-terminal aggregate_verdict {aggregate!r}")
    if aggregate == "pass":
        if any(not isinstance(item, dict) or item.get("verdict") != "pass" for item in verdicts.values()):
            failures.append("aggregate pass requires every supplied suite verdict to pass")
        if any(row.get("status") not in {"pass", "not_applicable"} for row in rows):
            failures.append("aggregate pass conflicts with non-pass case results")
    blockers = string_list(value.get("blockers"), f"{METADATA_NAME}: blockers", failures)
    unresolved = string_list(
        value.get("unresolved_findings"), f"{METADATA_NAME}: unresolved_findings", failures
    )
    if aggregate == "pass" and (blockers or unresolved):
        failures.append("aggregate pass requires empty blockers and unresolved_findings")
    if aggregate == "blocked" and not blockers:
        failures.append("aggregate blocked requires at least one named blocker")
    if aggregate == "fail" and not (blockers or unresolved):
        failures.append("aggregate fail requires a named blocker or unresolved finding")
    reviewers = string_list(
        value.get("reviewers"), f"{METADATA_NAME}: reviewers", failures, nonempty=True
    )
    case_reviewers = {
        row.get("reviewer") for row in rows if is_nonempty_string(row.get("reviewer"))
    }
    if len(reviewers) != len(set(reviewers)):
        failures.append(f"{METADATA_NAME}: reviewers must not contain duplicates")
    if any(not is_reviewer(reviewer) for reviewer in reviewers):
        failures.append(f"{METADATA_NAME}: reviewers contains a placeholder identity")
    if set(reviewers) != case_reviewers:
        failures.append(f"{METADATA_NAME}: reviewers must exactly equal the case reviewer set")
    return value, failures


def merge(directory: Path) -> dict[str, Any]:
    manifest, rows, status = collect(directory)
    if not status["complete"]:
        raise WorkError(
            "review results are incomplete or invalid: "
            f"missing={status['missing_result_count']} duplicates={status['duplicate_case_count']} "
            f"failures={status['validation_failure_count']}"
        )
    manifest_sha = status["manifest_sha256"]
    metadata, failures = validate_metadata(directory, manifest, manifest_sha, rows)
    if failures:
        raise WorkError("aggregate metadata is invalid: " + "; ".join(failures))

    template_path = directory / "audit_report.template.json"
    template = read_json(template_path)
    if not isinstance(template, dict) or template.get("manifest_sha256") != manifest_sha:
        raise WorkError("audit_report.template.json is malformed or bound to a different manifest")
    allowed_template_keys = BASE_REPORT_KEYS | {"report_kind", "case_count"}
    if frozenset(template) not in {frozenset(BASE_REPORT_KEYS), frozenset(allowed_template_keys)}:
        raise WorkError("audit_report.template.json has an unexpected top-level shape")
    if (
        template.get("schema_id") != "pm.integration_packet_audit_report.v1"
        or template.get("schema_version") != "1.0.0"
        or template.get("aggregate_verdict") != "not_run"
        or template.get("report_kind") not in {None, "template"}
        or template.get("case_count", manifest["case_count"]) != manifest["case_count"]
    ):
        raise WorkError("audit_report.template.json is not an untouched report template")
    report = {key: template[key] for key in BASE_REPORT_KEYS}
    report["created_at"] = utc_now()
    report["implementation_freeze_ref"] = metadata["implementation_freeze_ref"]
    report["suite_verdicts"] = metadata["suite_verdicts"]
    report["case_results"] = rows
    report["aggregate_verdict"] = metadata["aggregate_verdict"]
    report["blockers"] = metadata["blockers"]
    report["unresolved_findings"] = metadata["unresolved_findings"]
    report["reviewers"] = metadata["reviewers"]
    report["report_kind"] = "completed"
    report["case_count"] = manifest["case_count"]
    output = directory / COMPLETED_NAME
    write_json_new(output, report)
    return {
        "schema_id": "pm.integration_packet_audit_review_merge_result.v1",
        "completed_report": str(output),
        "manifest_sha256": manifest_sha,
        "case_count": len(rows),
        "aggregate_verdict": metadata["aggregate_verdict"],
        "template_overwritten": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)
    prepare_parser = subparsers.add_parser(
        "prepare", help="create deterministic, non-overlapping review chunks without overwriting"
    )
    prepare_parser.add_argument("--dir", type=Path, required=True, help="audit workbook directory")
    prepare_parser.add_argument(
        "--max-cases", type=int, required=True, help="maximum cases in each mechanically split group chunk"
    )
    status_parser = subparsers.add_parser(
        "status", help="report expected, result, missing, duplicate, and validation counts"
    )
    status_parser.add_argument("--dir", type=Path, required=True, help="audit workbook directory")
    merge_parser = subparsers.add_parser(
        "merge", help=f"validate complete supplied results and create {COMPLETED_NAME}"
    )
    merge_parser.add_argument("--dir", type=Path, required=True, help="audit workbook directory")
    args = parser.parse_args()
    directory = args.dir.resolve()
    try:
        if args.command == "prepare":
            result = prepare(directory, args.max_cases)
        elif args.command == "status":
            _, _, result = collect(directory)
        else:
            result = merge(directory)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except WorkError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
