#!/usr/bin/env python3
"""Pinned fail-closed verifier for inert Branch B atomic-six preparation."""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any, Callable

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
COHORT_METADATA_SCOPE = HERE.parent
ATTEMPT3 = HERE.parent / "semantic-repair-attempt-0003-v32"
AUTHORITY = HERE / "FUTURE_ATOMIC6_AUTHORITY.json"
TOOL_SEAL = HERE / "FUTURE_TOOL_SEAL.json"
MATRIX = HERE / "test_matrix.json"
TEST_SOURCE = HERE / "test_branch_b_preparation.py"
VERIFY_SOURCE = HERE / "verify_branch_b_preparation.py"
TEST_REPORT = HERE / "validation/test-report.json"
TERMINAL_EVIDENCE = HERE / "validation/terminal-evidence.json"
READINESS = HERE / "readiness.json"
TARGET_TRANSACTION = HERE.parent / "semantic-repair-attempt-0003-v32-activation-transaction-atomic6"
LUNA = ATTEMPT3 / "validation/fresh-luna-prelaunch.json"
CAPTURE = ATTEMPT3 / "validation/controller-parent-native-capture.json"

ASSIGNMENTS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
ATTEMPT3_PINS = {
    "attempt3_authority": (ATTEMPT3 / "IMMUTABLE_AUTHORITY.json", "1e189816fd44c7a56331e8921743d724a58727abb1b67116c6385a7bda4398e0"),
    "attempt3_readiness": (ATTEMPT3 / "readiness.json", "33b0a8cca0068d08e9b8731a9ae1ec8bd6449315582f7627903b7550c5963351"),
    "attempt3_test_report": (ATTEMPT3 / "validation/test-report.json", "f22168e35381f720eb45266e015f1be48fab949bdcfe22a565b6684fd86092ef"),
    "attempt3_verifier": (ATTEMPT3 / "verify_attempt3_v32.py", "b94d02993e64b17b98a27327a3ff15b168a1b52ca5d2a14c280cc601be87f177"),
}
ATTEMPT3_INVENTORY = {"path": str(ATTEMPT3), "file_count": 35, "byte_count": 19834332, "inventory_sha256": "ad42d5077e6125accd83aecfa9e670f81702de79eddfaa92b37d0a2f4ecdc850"}
RUNTIME = {
    "python": "/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
    "python_version": "3.12.13",
    "pythonpath": "/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/dependencies/jsonschema-draft202012-v1/site-packages",
    "jsonschema_version": "4.26.0",
    "validator_class": "jsonschema.validators.Draft202012Validator",
    "no_site": True,
    "no_user_site": True,
    "dont_write_bytecode": True,
}
ZERO_STATE = {"activation": False, "launch": False, "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0, "spawned_children": 0, "tool_executions": 0}
EXPECTED_CASE_ID_DIGEST = "86ba5165ab7797198293438801665a1503c40a0dc3afc93a9bbf747f8f8f6db7"
EXPECTED_CATEGORY_COUNTS = {
    "live_positive": {"positive": 20, "negative": 0, "total": 20},
    "upstream_pin_mutations": {"positive": 0, "negative": 320, "total": 320},
    "atomic6_set_mutations": {"positive": 0, "negative": 150, "total": 150},
    "feature_obligation_count_mutations": {"positive": 0, "negative": 100, "total": 100},
    "prerequisite_identity_mutations": {"positive": 0, "negative": 110, "total": 110},
    "runtime_drift_mutations": {"positive": 0, "negative": 80, "total": 80},
    "filesystem_symlink_toctou": {"positive": 0, "negative": 40, "total": 40},
    "foreign_equivalent_dedup": {"positive": 0, "negative": 30, "total": 30},
    "authority_credit_leakage": {"positive": 0, "negative": 50, "total": 50},
}
EXPECTED_TEST_CLOSURE = {"case_id_digest": EXPECTED_CASE_ID_DIGEST, "category_counts": EXPECTED_CATEGORY_COUNTS}
DEDUP_EXPECTED = {
    "checkpoint": "parent_precreation_deduplicate_first",
    "search_scope": str(COHORT_METADATA_SCOPE),
    "scope_kind": "audit_metadata_only",
    "metadata_extensions": [".json", ".jsonl"],
    "own_preparation_namespace_excluded": str(HERE),
    "exact_target_namespace": str(TARGET_TRANSACTION),
    "exact_target_namespace_count": 0,
    "equivalent_terminal_or_activation_prep_namespace_count": 0,
    "matches": [],
    "result": "no_foreign_equivalent_terminal_or_activation_prep_namespace",
    "live_recheck_required": True,
}


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical_sha(value: Any) -> str:
    return sha_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def stable_read(path: Path, post_read_hook: Callable[[Path], None] | None = None) -> bytes:
    before_path = path.lstat()
    if stat.S_ISLNK(before_path.st_mode) or not stat.S_ISREG(before_path.st_mode):
        raise ValueError("not-regular")
    if before_path.st_nlink != 1:
        raise ValueError("multiply-linked")
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(descriptor)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(descriptor, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        if post_read_hook is not None:
            post_read_hook(path)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    identity = lambda value: (value.st_dev, value.st_ino, value.st_mode, value.st_nlink, value.st_size, value.st_mtime_ns, value.st_ctime_ns)
    if identity(before) != identity(after) or identity(after) != identity(path.lstat()):
        raise ValueError("toctou")
    raw = b"".join(chunks)
    if len(raw) != after.st_size:
        raise ValueError("short-read")
    return raw


def load(path: Path) -> Any:
    return json.loads(stable_read(path).decode("utf-8"))


def file_binding(path: Path) -> dict[str, Any]:
    raw = stable_read(path)
    value = {"path": str(path), "byte_count": len(raw), "raw_sha256": sha_bytes(raw)}
    if path.suffix == ".json":
        value["canonical_sha256"] = canonical_sha(json.loads(raw))
    return value


def tree_inventory(path: Path) -> dict[str, Any]:
    rows = []
    for item in sorted(path.rglob("*"), key=lambda value: value.as_posix()):
        observed = item.lstat()
        if stat.S_ISDIR(observed.st_mode):
            continue
        if stat.S_ISLNK(observed.st_mode) or not stat.S_ISREG(observed.st_mode):
            raise ValueError("inventory-nonregular:" + item.relative_to(path).as_posix())
        raw = stable_read(item)
        rows.append({"path": item.relative_to(path).as_posix(), "byte_count": len(raw), "sha256": sha_bytes(raw)})
    return {"path": str(path), "file_count": len(rows), "byte_count": sum(row["byte_count"] for row in rows), "inventory_sha256": canonical_sha(rows)}


def lexical_namespace_inventory(path: Path, expected_directories: set[Path] | None = None) -> dict[str, Any]:
    expected_dirs = expected_directories or set()
    files: set[Path] = set()
    directories: set[Path] = set()
    violations: list[str] = []
    try:
        entries = sorted(path.rglob("*"), key=lambda value: value.as_posix())
    except OSError as error:
        return {"files": files, "directories": directories, "violations": ["walk:" + type(error).__name__]}
    for entry in entries:
        relative = entry.relative_to(path).as_posix()
        try:
            observed = entry.lstat()
        except OSError as error:
            violations.append(relative + ":lstat:" + type(error).__name__)
            continue
        if stat.S_ISREG(observed.st_mode):
            files.add(entry)
        elif stat.S_ISDIR(observed.st_mode):
            directories.add(entry)
            if entry not in expected_dirs:
                violations.append(relative + ":unexpected-directory")
        elif stat.S_ISLNK(observed.st_mode):
            violations.append(relative + ":symlink")
        else:
            violations.append(relative + ":nonregular")
    missing_dirs = sorted(str(value.relative_to(path)) for value in expected_dirs - directories)
    violations.extend("missing-directory:" + value for value in missing_dirs)
    return {"files": files, "directories": directories, "violations": sorted(set(violations))}


def lexical_path_state(path: Path) -> str:
    """Return a lexical state; broken symlinks are present, never absent."""
    try:
        observed = path.lstat()
    except FileNotFoundError:
        return "absent"
    except OSError as error:
        return "lstat_error:" + type(error).__name__
    if stat.S_ISLNK(observed.st_mode):
        try:
            path.stat()
        except FileNotFoundError:
            return "present_broken_symlink"
        except OSError as error:
            return "present_symlink_stat_error:" + type(error).__name__
        return "present_live_symlink"
    if stat.S_ISDIR(observed.st_mode):
        return "present_directory"
    if stat.S_ISREG(observed.st_mode):
        return "present_regular_file"
    return "present_other"


def live_absence_errors(paths: dict[str, Path] | None = None) -> list[str]:
    observed_paths = paths or {
        "prerequisite:luna-must-remain-absent": LUNA,
        "prerequisite:capture-must-remain-absent": CAPTURE,
        "target-transaction-must-remain-absent": TARGET_TRANSACTION,
    }
    errors = []
    for label, path in observed_paths.items():
        state = lexical_path_state(path)
        if state != "absent":
            errors.append(label + ":" + state)
    return errors


def equivalent_namespace_name(value: str, exact_target_name: str | None = None) -> bool:
    lowered = value.lower()
    if lowered == (exact_target_name or TARGET_TRANSACTION.name).lower():
        return True
    normalized = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    attempt3 = re.search(r"(?:^|-)attempt-?0*3(?:-|$)", normalized) is not None
    v32 = re.search(r"(?:^|-)v-?32(?:-|$)", normalized) is not None
    exact6 = re.search(r"(?:^|-)(?:atomic|exact)-?6(?:-|$)", normalized) is not None
    terminal_or_prep = any(token in normalized.split("-") for token in ("activation", "transaction", "preparation", "prep", "terminal"))
    return attempt3 and v32 and exact6 and terminal_or_prep


def _metadata_semantically_equivalent(raw: bytes, exact_target: Path) -> tuple[bool, bool]:
    lowered = raw.lower()
    exact = str(exact_target).encode("utf-8").lower() in lowered or exact_target.name.encode("utf-8").lower() in lowered
    pin = ATTEMPT3_PINS["attempt3_authority"][1].encode("ascii") in lowered
    all_assignments = all(assignment.encode("ascii").lower() in lowered for assignment in ASSIGNMENTS)
    terminal_or_prep = any(token in lowered for token in (b"activation", b"preparation", b"terminal"))
    exact6 = any(token in lowered for token in (b"atomic6", b"atomic-6", b"exact6", b"exact-6", b'"exact_assignment_count": 6', b'"exact_assignment_count":6'))
    return exact, exact or (pin and all_assignments and terminal_or_prep and exact6)


def dedup_search(
    scope: Path = COHORT_METADATA_SCOPE,
    own_namespace: Path = HERE,
    exact_target: Path = TARGET_TRANSACTION,
) -> dict[str, Any]:
    """Search audit metadata only and fail closed on unreadable/symlink metadata."""
    matches: set[tuple[str, str]] = set()
    exact_sources: set[tuple[str, str]] = set()
    scan_errors: list[str] = []
    metadata_files_scanned = 0
    metadata_bytes_scanned = 0
    try:
        candidates = sorted(scope.rglob("*"), key=lambda path: path.as_posix())
    except OSError as error:
        candidates = []
        scan_errors.append("scope-walk:" + type(error).__name__)
    for path in candidates:
        try:
            relative = path.relative_to(scope)
        except ValueError:
            scan_errors.append("outside-scope:" + str(path))
            continue
        if path == own_namespace or own_namespace in path.parents:
            continue
        try:
            lexical = path.lstat()
        except OSError as error:
            scan_errors.append(relative.as_posix() + ":lstat:" + type(error).__name__)
            continue
        if stat.S_ISDIR(lexical.st_mode) or stat.S_ISLNK(lexical.st_mode):
            if equivalent_namespace_name(path.name, exact_target.name):
                entry = ("namespace_path", str(path))
                matches.add(entry)
                if path.name.lower() == exact_target.name.lower() or str(path) == str(exact_target):
                    exact_sources.add(entry)
        if path.suffix.lower() not in {".json", ".jsonl"}:
            continue
        if stat.S_ISLNK(lexical.st_mode) or not stat.S_ISREG(lexical.st_mode):
            scan_errors.append(relative.as_posix() + ":metadata-not-regular")
            continue
        try:
            raw = stable_read(path)
        except (OSError, ValueError) as error:
            scan_errors.append(relative.as_posix() + ":read:" + type(error).__name__)
            continue
        metadata_files_scanned += 1
        metadata_bytes_scanned += len(raw)
        exact, equivalent = _metadata_semantically_equivalent(raw, exact_target)
        if equivalent:
            entry = ("metadata_reference", str(path))
            matches.add(entry)
            if exact:
                exact_sources.add(entry)
    rows = [{"kind": kind, "path": path} for kind, path in sorted(matches)]
    return {
        "search_scope": str(scope),
        "scope_kind": "audit_metadata_only",
        "metadata_extensions": [".json", ".jsonl"],
        "own_preparation_namespace_excluded": str(own_namespace),
        "exact_target_namespace": str(exact_target),
        "exact_target_namespace_count": len(exact_sources),
        "equivalent_terminal_or_activation_prep_namespace_count": len(matches),
        "matches": rows,
        "scan_errors": sorted(set(scan_errors)),
        "metadata_files_scanned": metadata_files_scanned,
        "metadata_bytes_scanned": metadata_bytes_scanned,
    }


def dedup_result_errors(result: dict[str, Any]) -> list[str]:
    errors = []
    if result.get("scan_errors"):
        errors.extend("dedup:scan:" + str(value) for value in result["scan_errors"])
    if result.get("exact_target_namespace_count") != 0:
        errors.append("dedup:exact-target-count")
    if result.get("equivalent_terminal_or_activation_prep_namespace_count") != 0 or result.get("matches") != []:
        errors.append("dedup:foreign-equivalent-terminal-or-activation-prep")
    return sorted(set(errors))


def runtime_snapshot() -> dict[str, Any]:
    return {
        "python": sys.executable,
        "python_version": ".".join(str(value) for value in sys.version_info[:3]),
        "pythonpath": os.environ.get("PYTHONPATH"),
        "jsonschema_version": importlib.metadata.version("jsonschema"),
        "validator_class": f"{Draft202012Validator.__module__}.{Draft202012Validator.__name__}",
        "no_site": bool(sys.flags.no_site), "no_user_site": bool(sys.flags.no_user_site), "dont_write_bytecode": bool(sys.flags.dont_write_bytecode),
    }


def runtime_contract_errors(runtime: dict[str, Any]) -> list[str]:
    return ["runtime:" + key for key, expected in RUNTIME.items() if runtime.get(key) != expected]


def contract_errors(authority: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if authority.get("schema_version") != "scenario-adversarial-attempt3-future-atomic6-preparation-authority-v1" or authority.get("status") != "prepared_blocked_inert" or authority.get("preparation_only") is not True:
        errors.append("authority:identity-status")
    upstream = authority.get("upstream", {})
    for label, (path, expected_sha) in ATTEMPT3_PINS.items():
        binding = upstream.get(label, {})
        if binding.get("path") != str(path) or binding.get("raw_sha256") != expected_sha:
            errors.append("upstream:" + label)
    if upstream.get("attempt3_inventory") != ATTEMPT3_INVENTORY:
        errors.append("upstream:attempt3_inventory")
    test_binding = upstream.get("attempt3_test_report", {})
    if test_binding.get("passed") != 1024 or test_binding.get("total") != 1024 or test_binding.get("failed") != 0 or test_binding.get("case_id_digest") != "cdc4f913993857653d21b1a6cfc21a5ecd29b1bcaebee09c6cfabda4d6d11a84":
        errors.append("upstream:attempt3_test_closure")
    transaction = authority.get("future_transaction", {})
    expected_target = str(TARGET_TRANSACTION)
    if transaction.get("kind") != "separate_future_atomic6_transaction" or transaction.get("target_namespace") != expected_target or transaction.get("target_namespace_state") != "required_absent":
        errors.append("transaction:identity-or-target")
    if transaction.get("assignment_ids") != ASSIGNMENTS or transaction.get("exact_assignment_count") != 6:
        errors.append("transaction:exact-atomic6-set")
    if transaction.get("feature_count") != 687 or transaction.get("question_obligation_count") != 713:
        errors.append("transaction:feature-obligation-count")
    for key in ("all_or_nothing", "partial_cohort_forbidden", "larger_cohort_forbidden", "atomic_commit_required"):
        if transaction.get(key) is not True:
            errors.append("transaction:" + key)
    if transaction.get("transaction_authorized") is not False or transaction.get("tool_execution_authorized") is not False:
        errors.append("transaction:authority-leakage")
    if authority.get("pre_creation_dedup_result") != DEDUP_EXPECTED:
        errors.append("dedup:authority-result")
    prerequisites = authority.get("prerequisites", {})
    luna = prerequisites.get("fresh_luna_prelaunch", {})
    if luna.get("required") is not True or luna.get("state") != "required_absent" or luna.get("path") != str(LUNA) or luna.get("model") != "gpt-5.6-luna" or luna.get("reasoning_effort") != "max" or luna.get("fresh_direct_required") is not True or luna.get("controller_identity_authority") is not False:
        errors.append("prerequisite:fresh-luna")
    capture = prerequisites.get("controller_parent_native_capture", {})
    if (
        capture.get("required") is not True
        or capture.get("state") != "required_absent"
        or capture.get("path") != str(CAPTURE)
        or capture.get("authored_by_role") != "controller_parent"
        or capture.get("must_bind_fresh_luna_native_identity_and_report") is not True
        or capture.get("must_bind_exact_six_reserved_unallocated_sol_slots_and_paths") is not True
        or capture.get("must_observe_sol_native_child_ids_null") is not True
        or capture.get("must_not_claim_launched_sol_native_identities") is not True
        or capture.get("later_activation_runtime_capture_owns_actual_six_sol_native_ids") is not True
        or "must_bind_six_native_sol_identities" in capture
    ):
        errors.append("prerequisite:controller-capture")
    identities = authority.get("future_sol_identities", [])
    if not isinstance(identities, list) or len(identities) != 6 or [row.get("assignment_id") for row in identities] != ASSIGNMENTS:
        errors.append("identity:exact-set")
    else:
        paths = [row.get("canonical_agent_path") for row in identities]
        if len(paths) != len(set(paths)) or any(not isinstance(path, str) or "semantic_repair_attempt_0003_ultra_v32" not in path or path == "/root/sol_controller_v29" for path in paths):
            errors.append("identity:path-freshness")
        for row in identities:
            if row.get("model") != "gpt-5.6-sol" or row.get("reasoning_effort") != "ultra" or row.get("fork_turns") != "none" or row.get("fresh_direct_required") is not True or row.get("state") != "future_unallocated" or row.get("native_child_thread_id") is not None:
                errors.append("identity:" + str(row.get("assignment_id")))
    errors.extend(runtime_contract_errors(authority.get("audit_runtime", {})))
    forbidden = authority.get("forbidden_artifact_counts", {})
    if set(forbidden) != {"activation_files", "authorizations", "results", "receipts", "capture_artifacts", "checkpoints", "children", "reviewer_artifacts", "controller_artifacts", "tool_executions"} or any(value != 0 for value in forbidden.values()):
        errors.append("authority:forbidden-artifact-leakage")
    if authority.get("zero_state") != ZERO_STATE:
        errors.append("authority:zero-state")
    return sorted(set(errors))


def tool_seal_errors(seal: dict[str, Any]) -> list[str]:
    errors = []
    if seal.get("schema_version") != "scenario-adversarial-future-atomic6-tool-seal-v1" or seal.get("status") != "sealed_inert_preparation_only":
        errors.append("tool-seal:status")
    if seal.get("preparation_authority_sha256") != file_binding(AUTHORITY)["raw_sha256"]:
        errors.append("tool-seal:authority-binding")
    if seal.get("target_namespace") != str(TARGET_TRANSACTION) or seal.get("target_namespace_state") != "required_absent":
        errors.append("tool-seal:target")
    if seal.get("attempt3_authority_sha256") != ATTEMPT3_PINS["attempt3_authority"][1]:
        errors.append("tool-seal:attempt3-authority")
    if seal.get("pre_creation_dedup_result") != DEDUP_EXPECTED:
        errors.append("tool-seal:dedup")
    if seal.get("audit_runtime") != RUNTIME:
        errors.append("tool-seal:runtime")
    for label, path in (("verifier", VERIFY_SOURCE), ("tests", TEST_SOURCE), ("test_matrix", MATRIX)):
        if not binding_matches(seal.get("source_bindings", {}).get(label), path):
            errors.append("tool-seal:source-binding:" + label)
    if seal.get("assignment_ids") != ASSIGNMENTS or seal.get("exact_assignment_count") != 6 or seal.get("feature_count") != 687 or seal.get("question_obligation_count") != 713:
        errors.append("tool-seal:exact-set-counts")
    if seal.get("expected_case_id_digest") != EXPECTED_CASE_ID_DIGEST or seal.get("expected_category_counts") != EXPECTED_CATEGORY_COUNTS:
        errors.append("tool-seal:test-closure")
    for key in ("transaction_authorized", "tool_execution_authorized", "activation", "launch", "generator_present", "generator_invoked"):
        if seal.get(key) is not False:
            errors.append("tool-seal:" + key)
    for key in ("tool_execution_count", "generator_execution_count", "created_activation_files", "created_authorizations", "created_results", "created_receipts", "created_capture_artifacts", "created_checkpoints", "created_children", "credit"):
        if seal.get(key) != 0:
            errors.append("tool-seal:" + key)
    if seal.get("future_preconditions") != ["fresh_luna_max_prelaunch_valid", "controller_parent_prelaunch_capture_of_fresh_luna_and_reserved_unallocated_sol_slots_valid", "attempt3_inventory_still_exact", "six_outputs_still_empty", "separate_future_atomic6_transaction"]:
        errors.append("tool-seal:future-preconditions")
    if seal.get("actual_six_sol_native_ids_deferred_to_later_activation_runtime_capture") is not True:
        errors.append("tool-seal:sol-native-id-ordering")
    return sorted(set(errors))


def binding_matches(binding: Any, path: Path) -> bool:
    if not isinstance(binding, dict):
        return False
    observed = file_binding(path)
    return binding.get("path") == str(path) and binding.get("raw_sha256") == observed["raw_sha256"] and binding.get("byte_count") == observed["byte_count"]


def expected_files(require_terminal: bool) -> set[Path]:
    files = {AUTHORITY, TOOL_SEAL, MATRIX, TEST_SOURCE, VERIFY_SOURCE, TEST_REPORT}
    if require_terminal:
        files.update({TERMINAL_EVIDENCE, READINESS})
    return files


def verify(require_terminal: bool = True) -> dict[str, Any]:
    errors = runtime_contract_errors(runtime_snapshot())
    required = expected_files(require_terminal)
    namespace_inventory = lexical_namespace_inventory(HERE, {HERE / "validation"})
    actual = namespace_inventory["files"]
    errors.extend("namespace:lexical:" + value for value in namespace_inventory["violations"])
    missing = sorted(str(path.relative_to(HERE)) for path in required - actual)
    foreign = sorted(str(path.relative_to(HERE)) for path in actual - required)
    if missing:
        errors.append("namespace:missing:" + ",".join(missing))
    if foreign:
        errors.append("namespace:foreign:" + ",".join(foreign))
    if errors:
        return {"status": "fail_closed", "errors": sorted(set(errors)), "activation": False, "launch": False}
    authority = load(AUTHORITY)
    seal = load(TOOL_SEAL)
    matrix = load(MATRIX)
    report = load(TEST_REPORT)
    errors.extend(contract_errors(authority))
    errors.extend(tool_seal_errors(seal))
    if matrix.get("expected_total") != 900 or matrix.get("expected_case_id_digest") != EXPECTED_CASE_ID_DIGEST or matrix.get("expected_category_counts") != EXPECTED_CATEGORY_COUNTS:
        errors.append("test-matrix:closure")
    for label, (path, expected_sha) in ATTEMPT3_PINS.items():
        observed = file_binding(path)["raw_sha256"]
        if observed != expected_sha:
            errors.append("live-pin:" + label)
    try:
        observed_attempt3_inventory = tree_inventory(ATTEMPT3)
    except (OSError, ValueError) as error:
        observed_attempt3_inventory = None
        errors.append("live-pin:attempt3-inventory-lexical:" + str(error))
    if observed_attempt3_inventory != ATTEMPT3_INVENTORY:
        errors.append("live-pin:attempt3-inventory")
    empty_outputs = 0
    for assignment_id in ASSIGNMENTS:
        output = ATTEMPT3 / f"outputs/{assignment_id}/attempt-0003"
        if not output.is_dir() or any(output.rglob("*")):
            errors.append("output-not-empty:" + assignment_id)
        else:
            empty_outputs += 1
    errors.extend(live_absence_errors())
    live_dedup = dedup_search()
    errors.extend(dedup_result_errors(live_dedup))
    forbidden_names = ("activation_envelope.json", "authorization", "result.json", "receipt", "capture", "checkpoint")
    for path in actual:
        relative = path.relative_to(HERE).as_posix().lower()
        if any(token in relative for token in forbidden_names):
            errors.append("namespace:forbidden-artifact:" + relative)
    if report.get("status") != "pass" or report.get("passed") != 900 or report.get("total") != 900 or report.get("failed") != 0 or report.get("positive") != 20 or report.get("negative") != 880:
        errors.append("test-report:counts")
    if report.get("case_id_digest") != EXPECTED_CASE_ID_DIGEST or report.get("category_counts") != EXPECTED_CATEGORY_COUNTS:
        errors.append("test-report:deterministic-closure")
    if report.get("runtime") != runtime_snapshot():
        errors.append("test-report:runtime")
    if report.get("bindings", {}).get("authority_sha256") != file_binding(AUTHORITY)["raw_sha256"] or report.get("bindings", {}).get("tool_seal_sha256") != file_binding(TOOL_SEAL)["raw_sha256"] or report.get("bindings", {}).get("test_source_sha256") != file_binding(TEST_SOURCE)["raw_sha256"] or report.get("bindings", {}).get("verifier_source_sha256") != file_binding(VERIFY_SOURCE)["raw_sha256"]:
        errors.append("test-report:bindings")
    if require_terminal:
        terminal = load(TERMINAL_EVIDENCE)
        readiness = load(READINESS)
        if terminal.get("status") != "pass_blocked" or terminal.get("errors") != [] or terminal.get("activation") is not False or terminal.get("launch") is not False:
            errors.append("terminal-evidence:status")
        if terminal.get("test_closure") != EXPECTED_TEST_CLOSURE:
            errors.append("terminal-evidence:test-closure")
        if terminal.get("pre_creation_dedup_result") != DEDUP_EXPECTED:
            errors.append("terminal-evidence:dedup")
        for label, path in (("authority", AUTHORITY), ("tool_seal", TOOL_SEAL), ("test_report", TEST_REPORT), ("verifier", VERIFY_SOURCE)):
            if not binding_matches(terminal.get("bindings", {}).get(label), path):
                errors.append("terminal-evidence:binding:" + label)
        if terminal.get("attempt3_inventory") != ATTEMPT3_INVENTORY or terminal.get("counts") != {"assignments": 6, "features": 687, "question_obligations": 713, "empty_outputs": 6, "tests": 900, "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0, "children": 0, "tool_executions": 0}:
            errors.append("terminal-evidence:counts-or-inventory")
        if readiness.get("status") != "pass_blocked" or readiness.get("errors") != [] or readiness.get("zero_state") != ZERO_STATE:
            errors.append("readiness:status-or-zero-state")
        if readiness.get("test_closure") != EXPECTED_TEST_CLOSURE:
            errors.append("readiness:test-closure")
        if readiness.get("pre_creation_dedup_result") != DEDUP_EXPECTED:
            errors.append("readiness:dedup")
        for label, path in (("authority", AUTHORITY), ("tool_seal", TOOL_SEAL), ("test_report", TEST_REPORT), ("terminal_evidence", TERMINAL_EVIDENCE), ("verifier", VERIFY_SOURCE)):
            if not binding_matches(readiness.get("bindings", {}).get(label), path):
                errors.append("readiness:binding:" + label)
        if readiness.get("runtime") != runtime_snapshot():
            errors.append("readiness:runtime")
        for path in (AUTHORITY, TOOL_SEAL, MATRIX, TEST_REPORT, TERMINAL_EVIDENCE, READINESS):
            if stat.S_IMODE(path.stat().st_mode) != 0o444:
                errors.append("immutability:" + str(path.relative_to(HERE)))
    status = "pass_blocked" if not errors else "fail_closed"
    return {
        "schema_version": "scenario-adversarial-branch-b-preparation-terminal-verification-v1",
        "status": status,
        "errors": sorted(set(errors)),
        "blocking_reasons": ["fresh_luna_max_prelaunch_absent", "controller_parent_native_capture_absent", "separate_future_atomic6_transaction_absent", "activation_false", "launch_false"],
        "counts": {"assignments": 6, "features": 687, "question_obligations": 713, "empty_outputs": empty_outputs, "tests": report.get("total", 0), "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0, "children": 0, "tool_executions": 0},
        "attempt3_inventory": ATTEMPT3_INVENTORY,
        "pre_creation_dedup_result": DEDUP_EXPECTED,
        "live_dedup_recheck": live_dedup,
        "runtime": runtime_snapshot(),
        "activation": False, "activation_authorized": False, "launch": False, "launch_authorized": False,
        "target_transaction": "required_absent", "fresh_luna_prelaunch": "required_absent", "controller_parent_native_capture": "required_absent"
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preseal", action="store_true")
    args = parser.parse_args()
    report = verify(require_terminal=not args.preseal)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
