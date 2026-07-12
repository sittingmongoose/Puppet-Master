#!/usr/bin/env python3
"""Fail-closed primary postrun eligibility verifier with optional exclusive report write."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
COHORT = HERE.parent
A3 = COHORT / "semantic-repair-attempt-0003-v32"
AUTHORITY = HERE / "PRIMARY_POSTRUN_AUTHORITY.json"
POSTRUN_SCHEMA = HERE / "schemas/primary_postrun.schema.json"
RESULT_SCHEMA = A3 / "schema/result.schema.json"
RECEIPT_SCHEMA = HERE / "schemas/terminal_receipt.schema.json"
SEMANTIC_VALIDATOR = A3 / "preflight_attempt3_v32.py"
SEMANTIC_VALIDATOR_SHA256 = "882568bba4f626a9589d4526b18458508d6fe8f6251399fa42a8ec79ba6ab340"
CAPTURE = HERE / "runtime/native_identity_capture.json"
TARGET = HERE / "runtime/primary_postrun.json"
SEAL = HERE / "ACTIVATION_SEAL.json"
IDS = ("A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
PRIMARY_PATH = "/root/sol_controller_v29/a005_scenario_repair_c2_attempt3_primary_v32_sol"
_SEMANTIC_MODULE: Any | None = None


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def stable_read(path: Path) -> bytes:
    lexical = path.lstat()
    if stat.S_ISLNK(lexical.st_mode) or not stat.S_ISREG(lexical.st_mode) or lexical.st_nlink != 1:
        raise ValueError(f"unsafe-regular:{path}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(fd)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    now = path.lstat()
    identity = lambda v: (v.st_dev, v.st_ino, v.st_mode, v.st_nlink, v.st_size, v.st_mtime_ns, v.st_ctime_ns)
    if identity(before) != identity(after) or identity(after) != identity(now):
        raise ValueError(f"toctou:{path}")
    raw = b"".join(chunks)
    if len(raw) != after.st_size:
        raise ValueError(f"short-read:{path}")
    return raw


def load(path: Path) -> Any:
    return json.loads(stable_read(path))


def semantic_module() -> Any:
    global _SEMANTIC_MODULE
    if _SEMANTIC_MODULE is not None:
        return _SEMANTIC_MODULE
    if sha(stable_read(SEMANTIC_VALIDATOR)) != SEMANTIC_VALIDATOR_SHA256:
        raise ValueError("semantic-validator-hash")
    source_root = str(A3)
    if source_root not in sys.path:
        sys.path.insert(0, source_root)
    spec = importlib.util.spec_from_file_location("attempt3_exact_semantic_preflight_for_primary", SEMANTIC_VALIDATOR)
    if spec is None or spec.loader is None:
        raise ValueError("semantic-validator-import")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    _SEMANTIC_MODULE = module
    return module


def lexical_state(path: Path) -> str:
    try:
        observed = path.lstat()
    except FileNotFoundError:
        return "absent"
    if stat.S_ISLNK(observed.st_mode):
        return "symlink"
    if stat.S_ISREG(observed.st_mode):
        return "regular"
    if stat.S_ISDIR(observed.st_mode):
        return "directory"
    return "other"


def exclusive_write(path: Path, raw: bytes) -> None:
    if lexical_state(path) != "absent":
        raise FileExistsError("primary-target-present")
    parent = path.parent
    observed = parent.lstat()
    if stat.S_ISLNK(observed.st_mode) or not stat.S_ISDIR(observed.st_mode):
        raise ValueError("unsafe-runtime-directory")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o444)
    try:
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
        os.fchmod(fd, 0o444)
    except BaseException:
        os.close(fd)
        try:
            path.unlink()
        except OSError:
            pass
        raise
    else:
        os.close(fd)


def equivalent_dispatch_name(name: str) -> bool:
    normalized = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return (
        "attempt-0003" in normalized
        and "v32" in normalized
        and ("atomic6" in normalized or "atomic-6" in normalized)
        and ("activation" in normalized or "dispatch" in normalized or "transaction" in normalized)
    )


def second_dispatch_matches() -> list[str]:
    allowed = {
        HERE.name,
        "semantic-repair-attempt-0003-v32-activation-transaction-preparation-atomic6",
    }
    matches = []
    for entry in sorted(COHORT.iterdir(), key=lambda p: p.name):
        if entry.name in allowed:
            continue
        try:
            observed = entry.lstat()
        except OSError:
            matches.append(entry.name + ":lstat-error")
            continue
        if equivalent_dispatch_name(entry.name):
            matches.append(entry.name)
        if stat.S_ISLNK(observed.st_mode):
            matches.append(entry.name + ":symlink")
    return sorted(set(matches))


def duplicates(values: list[str]) -> int:
    return len(values) - len(set(values))


def verify(candidate_path: Path) -> tuple[list[str], dict[str, Any]]:
    errors: list[str] = []
    authority = load(AUTHORITY)
    candidate = load(candidate_path)
    schema = load(POSTRUN_SCHEMA)
    schema_errors = sorted(Draft202012Validator(schema).iter_errors(candidate), key=lambda e: list(e.absolute_path))
    errors.extend("candidate-schema:" + "/".join(map(str, e.absolute_path)) + ":" + e.message for e in schema_errors)

    if authority.get("authority_kind") != "sole_primary_postrun_validation_eligibility_authority":
        errors.append("authority-kind")
    if authority.get("eligibility_and_credit_boundary", {}).get("credit_must_remain") != 0:
        errors.append("authority-credit-boundary")
    if candidate.get("credit") != 0:
        errors.append("candidate-credit-nonzero")
    reviewer = candidate.get("native_reviewer_identity", {})
    expected_reviewer = {
        "canonical_agent_path": PRIMARY_PATH,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "fork_turns": "none",
        "fresh_direct": True,
        "descendants": 0,
        "followups": 0,
        "retries": 0,
    }
    for key, value in expected_reviewer.items():
        if reviewer.get(key) != value:
            errors.append("reviewer-identity:" + key)
    if not UUID_RE.fullmatch(str(reviewer.get("native_reviewer_thread_id", ""))):
        errors.append("reviewer-native-thread-id")
    if "luna" in json.dumps(reviewer).lower():
        errors.append("luna-postrun-forbidden")

    seal_raw = stable_read(SEAL)
    if candidate.get("source_seal_sha256") != sha(seal_raw):
        errors.append("source-seal-binding")
    if load(SEAL).get("status") != "sealed_static_sources":
        errors.append("source-seal-status")

    capture = load(CAPTURE)
    capture_rows = capture.get("rows", [])
    if capture.get("assignment_ids") != list(IDS) or capture.get("row_count") != 6 or len(capture_rows) != 6:
        errors.append("capture-membership")
    if capture.get("credit") != 0:
        errors.append("capture-credit")
    capture_by_id = {row.get("assignment_id"): row for row in capture_rows}
    if set(capture_by_id) != set(IDS):
        errors.append("capture-id-set")

    auth_leaves = authority.get("leaves", [])
    if [row.get("assignment_id") for row in auth_leaves] != list(IDS):
        errors.append("authority-leaf-order")
    outcomes: list[dict[str, Any]] = []
    canonical_paths: list[str] = []
    native_ids: list[str] = []
    result_paths: list[str] = []
    receipt_paths: list[str] = []
    result_hashes: list[str] = []
    receipt_hashes: list[str] = []
    rejected: list[str] = []
    result_schema = load(RESULT_SCHEMA)
    receipt_schema = load(RECEIPT_SCHEMA)
    for leaf in auth_leaves:
        assignment_id = leaf.get("assignment_id")
        leaf_errors: list[str] = []
        result_path = Path(str(leaf.get("result_path")))
        receipt_path = Path(str(leaf.get("receipt_path")))
        try:
            result_raw = stable_read(result_path)
            receipt_raw = stable_read(receipt_path)
            result = json.loads(result_raw)
            receipt = json.loads(receipt_raw)
        except Exception as exc:
            errors.append(f"leaf-read:{assignment_id}:{type(exc).__name__}")
            rejected.append(str(assignment_id))
            continue
        result_validation = list(Draft202012Validator(result_schema).iter_errors(result))
        receipt_validation = list(Draft202012Validator(receipt_schema).iter_errors(receipt))
        if result_validation:
            leaf_errors.append(f"result-schema:{len(result_validation)}")
        if receipt_validation:
            leaf_errors.append(f"receipt-schema:{len(receipt_validation)}")
        semantic_errors = semantic_module().result_errors(result, str(assignment_id))
        if semantic_errors:
            leaf_errors.append(f"result-semantic:{len(semantic_errors)}")
        if result.get("assignment_id") != assignment_id or receipt.get("assignment_id") != assignment_id:
            leaf_errors.append("assignment-identity")
        if receipt.get("result", {}).get("path") != str(result_path) or receipt.get("result", {}).get("raw_sha256") != sha(result_raw):
            leaf_errors.append("receipt-result-binding")
        if receipt.get("authorization_sha256") != leaf.get("authorization_sha256"):
            leaf_errors.append("receipt-authorization-binding")
        if receipt.get("credit") != 0:
            leaf_errors.append("receipt-credit")
        capture_row = capture_by_id.get(assignment_id, {})
        if capture_row.get("native_child_thread_id") != receipt.get("native_child_thread_id"):
            leaf_errors.append("capture-native-binding")
        if capture_row.get("canonical_agent_path") != receipt.get("canonical_agent_path"):
            leaf_errors.append("capture-path-binding")
        if leaf_errors:
            errors.extend(f"leaf:{assignment_id}:{value}" for value in leaf_errors)
            rejected.append(str(assignment_id))
            continue
        canonical_paths.append(receipt["canonical_agent_path"])
        native_ids.append(receipt["native_child_thread_id"])
        result_paths.append(str(result_path))
        receipt_paths.append(str(receipt_path))
        result_hashes.append(sha(result_raw))
        receipt_hashes.append(sha(receipt_raw))
        outcomes.append({
            "assignment_id": assignment_id,
            "result_sha256": sha(result_raw),
            "receipt_sha256": sha(receipt_raw),
            "native_child_thread_id": receipt["native_child_thread_id"],
            "status": "pass",
            "credit": 0,
        })

    dedup = {
        "scope": str(COHORT),
        "exact_primary_report_count_before_create": 0 if lexical_state(TARGET) == "absent" else 1,
        "equivalent_primary_report_count": 0,
        "primary_report_matches": [],
        "second_or_equivalent_dispatch_count": len(second_dispatch_matches()),
        "dispatch_matches": second_dispatch_matches(),
        "assignment_id_duplicate_count": duplicates([row["assignment_id"] for row in outcomes]),
        "canonical_agent_path_duplicate_count": duplicates(canonical_paths),
        "native_child_thread_id_duplicate_count": duplicates(native_ids),
        "result_path_duplicate_count": duplicates(result_paths),
        "receipt_path_duplicate_count": duplicates(receipt_paths),
        "result_hash_duplicate_count": duplicates(result_hashes),
        "receipt_hash_duplicate_count": duplicates(receipt_hashes),
        "outcome": "pass_exact_six_unique_and_no_existing_or_equivalent_primary_or_dispatch",
    }
    runtime = HERE / "runtime"
    if lexical_state(runtime) == "directory":
        unexpected_primary = sorted(str(p) for p in runtime.iterdir() if p.name != "native_identity_capture.json")
        if unexpected_primary:
            dedup["equivalent_primary_report_count"] = len(unexpected_primary)
            dedup["primary_report_matches"] = unexpected_primary
    if candidate_path == TARGET:
        # Terminal replay after the exclusive write treats the bound target as the one expected report.
        dedup["exact_primary_report_count_before_create"] = candidate.get("dedup", {}).get("exact_primary_report_count_before_create", 1)
        dedup["equivalent_primary_report_count"] = 0
        dedup["primary_report_matches"] = []

    if candidate.get("assignment_ids") != list(IDS):
        errors.append("candidate-assignment-order")
    if candidate.get("eligible_assignment_ids") != list(IDS):
        errors.append("candidate-eligible-order")
    if candidate.get("rejected_assignment_ids") != []:
        errors.append("candidate-rejected-not-empty")
    if rejected:
        errors.append("rejected-leaves:" + ",".join(rejected))
    if [row.get("assignment_id") for row in candidate.get("leaf_outcomes", [])] != list(IDS):
        errors.append("candidate-outcome-order")
    if candidate.get("leaf_outcomes") != outcomes:
        errors.append("candidate-outcome-bindings")
    if candidate.get("dedup") != dedup:
        errors.append("candidate-dedup")
    if any(value != 0 for key, value in dedup.items() if key.endswith("_count")):
        errors.append("dedup-nonzero")
    if candidate.get("eligibility_conclusion") != "PASS_ALL_SIX_ELIGIBLE_CREDIT_ZERO_PENDING_INDEPENDENT_CHECKPOINT":
        errors.append("eligibility-conclusion")
    return sorted(set(errors)), dedup


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--exclusive-write", action="store_true")
    args = parser.parse_args()
    candidate_path = Path(args.candidate).resolve()
    if args.exclusive_write and candidate_path == TARGET.resolve():
        raise ValueError("candidate-must-be-outside-target")
    errors, dedup = verify(candidate_path)
    report = {
        "schema_version": "audit005-scenario-c2-attempt3-primary-postrun-verification-v1",
        "status": "pass_all_six_eligible_credit_zero" if not errors else "fail_closed",
        "errors": errors,
        "eligible_assignment_ids": list(IDS) if not errors else [],
        "rejected_assignment_ids": [] if not errors else list(IDS),
        "dedup": dedup,
        "credit": 0,
        "write_performed": False,
    }
    if errors:
        print(json.dumps(report, sort_keys=True))
        return 1
    if args.exclusive_write:
        candidate = load(candidate_path)
        raw = (json.dumps(candidate, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
        exclusive_write(TARGET, raw)
        reread = stable_read(TARGET)
        if reread != raw:
            raise ValueError("primary-reread-bytes")
        terminal_errors, _ = verify(TARGET)
        if terminal_errors:
            raise ValueError("primary-reread-semantic:" + ",".join(terminal_errors))
        report["write_performed"] = True
        report["target"] = str(TARGET)
        report["target_raw_sha256"] = sha(raw)
    print(json.dumps(report, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
