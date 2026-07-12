#!/usr/bin/env python3
"""Fail-closed, non-semantic source-scope binding and future pre-write guard."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import pathlib
import sys
from typing import Any, Callable

sys.dont_write_bytecode = True

REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster").resolve()
AUDIT_REL = pathlib.Path("Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
AUDIT = (REPO / AUDIT_REL).resolve()
HERE = pathlib.Path(__file__).resolve().parent
TX_REL = AUDIT_REL / "master/final_live_head_delta/final-live-head-delta-0002"
BINDING_REF = (TX_REL / "source_scope_binding.json").as_posix()
RECEIPT_REF = (TX_REL / "source_scope_binding_receipt.json").as_posix()
VERIFIER_REF = (TX_REL / "verify_source_scope_binding.py").as_posix()
TEST_REF = (TX_REL / "test_source_scope_binding.py").as_posix()
STATUS = "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH"
LIVE_SHA = "963911b952c3909c9012ed25a35151719b4f3f18b173cc6fffc8bbc1036e4e46"
OLD_SHA = "25027060861687c5a8e45024844d9de9e6c0a38f68a9470f2a84cb1774b86015"
PATH_SORTED_SHA = "2022f9fc0ca1d037f0d1ca0ba869a63a3867ecb8a8ad7690111aa6f69cbee798"
PATH_ROW_SHA = "1b9c9eaee9eeed160c5592feb071c0ca034f2815db09e4b390934332a7199655"
ZERO = {"activation": 0, "results": 0, "receipts": 0, "capture": 0, "credit": 0, "semantic_packets": 0, "launches": 0}
EXPECTED_ENTRIES = {"source_scope_binding.json", "source_scope_binding_receipt.json", "verify_source_scope_binding.py", "test_source_scope_binding.py"}


class AccessPolicyViolation(RuntimeError):
    pass


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical_row(row: dict[str, Any]) -> bytes:
    return (json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def normalize_audit_ref(ref: str) -> tuple[str, pathlib.Path]:
    candidate = pathlib.Path(ref)
    lexical = pathlib.Path(os.path.abspath(candidate if candidate.is_absolute() else REPO / candidate))
    try:
        rel_audit = lexical.relative_to(AUDIT)
        rel_repo = lexical.relative_to(REPO)
    except ValueError as exc:
        raise AccessPolicyViolation("canonical-or-outside-audit-access-prohibited:" + ref) from exc
    cursor = AUDIT
    if AUDIT.is_symlink():
        raise AccessPolicyViolation("symlink-component:" + AUDIT_REL.as_posix())
    for part in rel_audit.parts:
        cursor = cursor / part
        if cursor.is_symlink():
            raise AccessPolicyViolation("symlink-component:" + rel_repo.as_posix())
    resolved = lexical.resolve(strict=False)
    try:
        resolved.relative_to(AUDIT)
    except ValueError as exc:
        raise AccessPolicyViolation("symlink-escape:" + ref) from exc
    return rel_repo.as_posix(), lexical


def guarded_read(ref: str, declared_refs: set[str], reader: Callable[[pathlib.Path], bytes] | None = None) -> bytes:
    normalized, path = normalize_audit_ref(ref)
    if normalized not in declared_refs:
        raise AccessPolicyViolation("undeclared-audit-read:" + normalized)
    return path.read_bytes() if reader is None else reader(path)


def metrics(raw: bytes) -> dict[str, Any]:
    lines = raw.splitlines(keepends=True)
    parse_error = None
    rows: list[dict[str, Any]] = []
    try:
        if not raw.endswith(b"\n") or b"\r" in raw or any(not line.endswith(b"\n") for line in lines):
            raise ValueError("lf-contract")
        rows = [json.loads(line[:-1]) for line in lines]
        if any(not isinstance(row, dict) for row in rows):
            raise ValueError("row-not-object")
    except Exception as exc:  # fail closed and keep mutation diagnostics executable
        parse_error = type(exc).__name__ + ":" + str(exc)
    canonical = b"".join(canonical_row(row) for row in rows) if parse_error is None else b""
    paths = [row.get("path") for row in rows]
    source_ids = [row.get("source_id") for row in rows]
    sorted_rows = sorted(rows, key=lambda row: row["path"]) if parse_error is None else []
    path_sorted = b"".join(canonical_row(row) for row in sorted_rows)
    path_row = b"".join(
        row["path"].encode() + b"\0" + sha_bytes(canonical_row(row)).encode() + b"\n"
        for row in sorted_rows
    )
    baseline = [
        {
            "ordinal": index,
            "path": row.get("path"),
            "source_id": row.get("source_id"),
            "source_sha256": row.get("source_sha256"),
            "canonical_row_with_lf_sha256": sha_bytes(canonical_row(row)),
        }
        for index, row in enumerate(rows[:3], 1)
    ]
    return {
        "parse_error": parse_error,
        "raw_sha256": sha_bytes(raw),
        "canonical_lines_sha256": sha_bytes(canonical) if parse_error is None else None,
        "canonical_lines_equal_raw": canonical == raw if parse_error is None else False,
        "byte_count": len(raw),
        "row_count": len(rows) if parse_error is None else len(lines),
        "unique_path_count": len(set(paths)) if parse_error is None else 0,
        "unique_source_id_count": len(set(source_ids)) if parse_error is None else 0,
        "duplicate_path_count": len(paths) - len(set(paths)) if parse_error is None else 0,
        "duplicate_source_id_count": len(source_ids) - len(set(source_ids)) if parse_error is None else 0,
        "terminal_lf": raw.endswith(b"\n"),
        "carriage_return_count": raw.count(b"\r"),
        "path_sorted_rows_sha256": sha_bytes(path_sorted) if parse_error is None else None,
        "path_plus_row_sha256_digest": sha_bytes(path_row) if parse_error is None else None,
        "baseline_rows": baseline,
    }


def expected_declared_refs(binding: dict[str, Any]) -> set[str]:
    return {
        BINDING_REF,
        RECEIPT_REF,
        *binding.get("stable_copy_refs", []),
        *binding.get("protected_parent_files", {}).keys(),
        *binding.get("logic_files", {}).keys(),
    }


def load_bundle() -> dict[str, Any]:
    binding_raw = guarded_read(BINDING_REF, {BINDING_REF})
    binding = json.loads(binding_raw)
    declared = expected_declared_refs(binding)
    raw_by_ref = {ref: guarded_read(ref, declared) for ref in sorted(declared)}
    receipt = json.loads(raw_by_ref[RECEIPT_REF])
    discovered = sorted(
        normalize_audit_ref(path.as_posix())[0]
        for path in AUDIT.rglob("source_scope.jsonl")
    )
    symlinks = {}
    for ref in declared:
        try:
            normalize_audit_ref(ref)
            symlinks[ref] = False
        except AccessPolicyViolation:
            symlinks[ref] = True
    return {
        "binding": binding,
        "binding_raw": binding_raw,
        "receipt": receipt,
        "raw_by_ref": raw_by_ref,
        "discovered_refs": discovered,
        "symlink_flags": symlinks,
        "namespace_entries": sorted(path.name for path in HERE.iterdir()),
    }


def validation_errors(bundle: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    binding = bundle["binding"]
    receipt = bundle["receipt"]
    raw_by_ref = bundle["raw_by_ref"]
    source = binding.get("source_scope", {})
    source_ref = source.get("ref")
    if binding.get("schema_version") != "final-live-head-delta-source-scope-binding-v2": errors.append("binding-schema")
    if binding.get("transaction_id") != "final-live-head-delta-0002": errors.append("transaction")
    if binding.get("status") != STATUS: errors.append("binding-status")
    if source_ref not in raw_by_ref:
        errors.append("source-ref")
        observed = {}
    else:
        observed = metrics(raw_by_ref[source_ref])
        keys = [
            "raw_sha256", "canonical_lines_sha256", "canonical_lines_equal_raw", "byte_count", "row_count",
            "unique_path_count", "unique_source_id_count", "duplicate_path_count", "duplicate_source_id_count",
            "terminal_lf", "carriage_return_count", "path_sorted_rows_sha256", "path_plus_row_sha256_digest",
        ]
        for key in keys:
            if source.get(key) != observed.get(key): errors.append("source-metric:" + key)
        if observed.get("parse_error"): errors.append("source-jsonl:" + str(observed["parse_error"]))
        if observed.get("raw_sha256") != LIVE_SHA: errors.append("source-byte-drift")
        if observed.get("path_sorted_rows_sha256") != PATH_SORTED_SHA: errors.append("source-path-sorted-drift")
        if observed.get("path_plus_row_sha256_digest") != PATH_ROW_SHA: errors.append("source-path-row-drift")
        if binding.get("baseline_rows") != observed.get("baseline_rows"): errors.append("baseline-row-drift")
    if source.get("raw_sha256") == OLD_SHA or source.get("canonical_lines_sha256") == OLD_SHA:
        errors.append("old-pin-substitution")
    if source.get("raw_sha256") != LIVE_SHA or source.get("canonical_lines_sha256") != LIVE_SHA:
        errors.append("active-pin")
    stable_refs = binding.get("stable_copy_refs", [])
    if stable_refs != bundle.get("discovered_refs"): errors.append("stable-copy-discovery-set")
    if len(stable_refs) != 17 or binding.get("stable_copy_count") != 17: errors.append("stable-copy-count")
    if source_ref in raw_by_ref:
        primary = raw_by_ref[source_ref]
        for ref in stable_refs:
            if ref not in raw_by_ref: errors.append("stable-copy-missing:" + ref)
            elif raw_by_ref[ref] != primary: errors.append("stable-copy-byte-drift:" + ref)
        if sum(sha_bytes(raw_by_ref[ref]) == OLD_SHA for ref in stable_refs if ref in raw_by_ref) != 0:
            errors.append("unsupported-literal-observed")
    epoch = binding.get("epoch_0013_equality", {})
    epoch_ref = epoch.get("ref")
    if epoch_ref not in raw_by_ref or source_ref not in raw_by_ref:
        errors.append("epoch-0013-ref")
    else:
        epoch_metrics = metrics(raw_by_ref[epoch_ref])
        if raw_by_ref[epoch_ref] != raw_by_ref[source_ref]: errors.append("epoch-0013-inequality")
        for key in ("raw_sha256", "byte_count", "row_count"):
            if epoch.get(key) != epoch_metrics.get(key): errors.append("epoch-0013-metric:" + key)
        if epoch.get("raw_bytes_equal_epoch_0016") is not True: errors.append("epoch-0013-claim")
    predecessor = binding.get("supersedes_binding_only", {})
    if predecessor.get("unsupported_expected_literal") != OLD_SHA: errors.append("unsupported-literal")
    if predecessor.get("preserved_failure") != "source-scope-drift": errors.append("old-failure-label")
    for key in ("old_prepare_modified", "old_prepare_executed", "predecessor_artifacts_modified", "predecessor_failure_reclassified"):
        if predecessor.get(key) is not False: errors.append("predecessor-leak:" + key)
    protected = binding.get("protected_parent_files", {})
    for ref, expected_sha in protected.items():
        if ref not in raw_by_ref or sha_bytes(raw_by_ref[ref]) != expected_sha: errors.append("protected-parent-drift:" + ref)
    old_ref = predecessor.get("old_prepare_ref")
    if old_ref not in raw_by_ref:
        errors.append("old-prepare-ref")
    else:
        old_text = raw_by_ref[old_ref].decode("utf-8", errors="replace")
        if f'SOURCE_SCOPE_SHA="{OLD_SHA}"' not in old_text or 'SystemExit("source-scope-drift")' not in old_text:
            errors.append("old-failure-contract")
        if f'SOURCE_SCOPE_SHA="{LIVE_SHA}"' in old_text: errors.append("old-script-patched")
    if binding.get("zero_state") != ZERO: errors.append("binding-zero-state")
    future = binding.get("future_preparation", {})
    if future.get("mode") != "future_only_prewrite_guard": errors.append("future-mode")
    for key, value in future.items():
        if key != "mode" and value is not False: errors.append("authorization-leak:" + key)
    policy = binding.get("read_policy", {})
    if policy != {"scope": "exact_declared_audit_artifacts_only", "canonical_prose_access_authorized": False, "canonical_prose_access_count": 0, "outside_audit_access_authorized": False}:
        errors.append("read-policy")
    if any(bundle.get("symlink_flags", {}).values()): errors.append("symlink-input")
    if set(bundle.get("namespace_entries", [])) != EXPECTED_ENTRIES: errors.append("namespace-entries")
    if receipt.get("receipt_kind") != "independent_non_activation_binding_receipt": errors.append("receipt-kind")
    if receipt.get("status") != STATUS or receipt.get("transaction_id") != "final-live-head-delta-0002": errors.append("receipt-status")
    if receipt.get("binding_ref") != BINDING_REF or receipt.get("binding_sha256") != sha_bytes(bundle["binding_raw"]): errors.append("receipt-binding")
    if receipt.get("observed_source_scope_sha256") != LIVE_SHA or receipt.get("observed_source_scope_bytes") != 81724 or receipt.get("observed_source_scope_rows") != 135: errors.append("receipt-source")
    if receipt.get("stable_copy_count") != 17 or receipt.get("old_failure_preserved") is not True: errors.append("receipt-localization")
    if receipt.get("unsupported_expected_literal") != OLD_SHA: errors.append("receipt-old-literal")
    if receipt.get("zero_state") != ZERO: errors.append("receipt-zero-state")
    if receipt.get("launch_authorized") is not False or receipt.get("activation_receipt") is not False or receipt.get("semantic_packet_receipt") is not False: errors.append("receipt-activation-leak")
    logic = binding.get("logic_files", {})
    for ref, expected_sha in logic.items():
        if ref not in raw_by_ref or sha_bytes(raw_by_ref[ref]) != expected_sha: errors.append("logic-drift:" + ref)
    if receipt.get("logic_sha256") != {"verifier": logic.get(VERIFIER_REF), "tests": logic.get(TEST_REF)}: errors.append("receipt-logic")
    observation = receipt.get("controller_live_pin_observation", {})
    if observation != {"observed_at_utc": "2026-07-12T07:41:53Z", "matching_live_pins": 15, "total_live_pins": 15, "role": "non_authoritative_observation_only", "mtime_binding": False}:
        errors.append("controller-observation")
    if binding.get("mtime_role") != "observational_only_not_bound" or receipt.get("mtime_role") != "observational_only_not_bound": errors.append("mtime-policy")
    return sorted(set(errors))


def future_prewrite_gate(bundle: dict[str, Any] | None = None, mkdir: Callable[..., Any] | None = None, write: Callable[..., Any] | None = None) -> dict[str, Any]:
    candidate = load_bundle() if bundle is None else bundle
    errors = validation_errors(candidate)
    # Current authority never calls either callback. A later independent Luna
    # prelaunch must issue a new append-only authority before any mkdir/write.
    return {
        "binding_valid": not errors,
        "prewrite_authorized": False,
        "blocker": STATUS,
        "errors": errors,
        "mkdir_calls": 0,
        "write_calls": 0,
        "callbacks_supplied": int(mkdir is not None) + int(write is not None),
    }


def main() -> None:
    try:
        bundle = load_bundle()
        errors = validation_errors(bundle)
        source_metrics = metrics(bundle["raw_by_ref"][bundle["binding"]["source_scope"]["ref"]])
    except Exception as exc:
        errors = [type(exc).__name__ + ":" + str(exc)]
        source_metrics = {}
    report = {
        "verification_status": "pass" if not errors else "fail_closed",
        "control_status": STATUS,
        "errors": errors,
        "source_scope": {key: source_metrics.get(key) for key in ("raw_sha256", "byte_count", "row_count", "unique_path_count", "unique_source_id_count", "path_sorted_rows_sha256", "path_plus_row_sha256_digest")},
        "stable_copy_count": 17 if not errors else None,
        "old_failure": "source-scope-drift",
        "future_prewrite_authorized": False,
        "canonical_prose_access_count": 0,
        "zero_state": ZERO,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
