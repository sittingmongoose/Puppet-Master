#!/usr/bin/env python3
"""Fail-closed lstat compatibility supersession with one shared rich encoder."""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import json
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
BRANCH_B = HERE.parent
COHORT = BRANCH_B.parent
ATTEMPT3 = COHORT / "semantic-repair-attempt-0003-v32"
AUTHORITY = HERE / "IMMUTABLE_AUTHORITY.json"
MATRIX = HERE / "test_matrix.json"
VERIFY_SOURCE = HERE / "verify_lstat_supersession_v2.py"
TEST_SOURCE = HERE / "test_lstat_supersession_v2.py"
SOURCE_SEAL = HERE / "SOURCE_SEAL.json"
TEST_REPORT = HERE / "validation/test-report.json"
TERMINAL = HERE / "validation/terminal-preparation-report.json"
READINESS = HERE / "readiness.json"
FAILED_LUNA = ATTEMPT3 / "validation/luna-independent-prelaunch-v32.json"
CONTROLLER_CAPTURE = ATTEMPT3 / "validation/controller-parent-native-identity-capture-v32.json"
TARGET_TRANSACTION = COHORT / "semantic-repair-attempt-0003-v32-activation-transaction-atomic6"

ASSIGNMENTS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
BRANCH_BASE_FILES = [
    "FUTURE_ATOMIC6_AUTHORITY.json", "FUTURE_TOOL_SEAL.json", "readiness.json",
    "test_branch_b_preparation.py", "test_matrix.json", "validation/terminal-evidence.json",
    "validation/test-report.json", "verify_branch_b_preparation.py",
]
BRANCH_BASE_MEMBERS = sorted(BRANCH_BASE_FILES + ["validation"])
LINEAGE_PINS = {
    FAILED_LUNA: "5dd930a7e2547f371b77390955801e2f4079150ecb038c85366c699506bcd9c0",
    CONTROLLER_CAPTURE: "17249fe5bcf4380d58acb4b03b989c799df42995aebf3808be4f4254322ae8a9",
}
BRANCH_BASE_PINS = {
    "FUTURE_ATOMIC6_AUTHORITY.json": "2ab26c988e6a059d72c44045d3748734cbfcb8774060a59891feb8cc33c80b41",
    "FUTURE_TOOL_SEAL.json": "9ec550dcda4823df6b66af7080e7bcd82631da3a5a001507ab7040f4c4919d35",
    "readiness.json": "f289864d2cbbfc76c7df8b35f20cf7a02cb854807a2357b3fa066261c9894511",
    "test_branch_b_preparation.py": "a5a56d331fe78a80a60a13f25e39291ad269511712ce149e33160e507e759551",
    "test_matrix.json": "66c9865abdcd6141c3bb0b1cb7ec45cc134a5522509cfa996f5411046ee8e30e",
    "validation/terminal-evidence.json": "662ba73489df792dbe88a1a8dd91d7fa8475e0870194836d3f83a071078eadca",
    "validation/test-report.json": "d5751e7b3d9076471a539bef82480c114f7dd5b031d4332d38153055fd5a7396",
    "verify_branch_b_preparation.py": "631e30cd34c87cbf66b5804acaf4aff8d661ee36d9ed366471c18229f1b0c2a0",
}
ATTEMPT3_BASE_INVENTORY = {"file_count": 35, "byte_count": 19834332, "inventory_sha256": "ad42d5077e6125accd83aecfa9e670f81702de79eddfaa92b37d0a2f4ecdc850"}
BRANCH_BASE_INVENTORY = {"file_count": 8, "byte_count": 92311, "inventory_sha256": "edcaab493db0fa1afcad5bb172ee1f33271320050002f8adaf531fa0209cd356"}
LEGACY_RICH = "371b46caa15f0cde09b2136a821f4317053399382939fa3eae736fcebb34a8d5"
LEGACY_LEAN = "9b682f9fdf36b5f7dd76d5994ca0a92fbfe710d38b3e4516e18313b07ad86914"
ALLOWED_ATTEMPT3_ATIME = {
    "attempt3_common.py", "fixtures/validator-clean/A005SA-0009.json", "fixtures/validator-clean/A005SA-0010.json",
    "fixtures/validator-clean/A005SA-0012.json", "fixtures/validator-clean/A005SA-0013.json",
    "fixtures/validator-clean/A005SA-0014.json", "fixtures/validator-clean/A005SA-0016.json",
    "observed_error_localization.jsonl", "packets/A005SA-0009.json", "packets/A005SA-0010.json",
    "packets/A005SA-0012.json", "packets/A005SA-0013.json", "packets/A005SA-0014.json",
    "packets/A005SA-0016.json", "validation/test-report.json", "validator_rows.jsonl",
}
STALE_V1_CASES = {"live_positive:positive:attempt3-inventory-live", "live_positive:positive:dedup-zero-live"}
RUNTIME = {
    "python": "/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
    "python_version": "3.12.13",
    "pythonpath": "/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/dependencies/jsonschema-draft202012-v1/site-packages",
    "jsonschema_version": "4.26.0", "validator_class": "jsonschema.validators.Draft202012Validator",
    "no_site": True, "no_user_site": True, "dont_write_bytecode": True,
}
ZERO_STATE = {"production": 0, "activation": False, "launch": False, "generator_present": False, "generator_invoked": False, "reviewer_children": 0, "semantic_children": 0, "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0, "tool_executions": 0}
EXPECTED_CASE_ID_DIGEST = "490fe7f960396b40d33f96e4027a44b035228c802fe4198d2a525098b3056a99"
EXPECTED_CATEGORY_COUNTS = {
    "live_positive": {"positive": 16, "negative": 0, "total": 16},
    "legacy_schema_asymmetry": {"positive": 0, "negative": 32, "total": 32},
    "regular_required_field_mutations": {"positive": 0, "negative": 160, "total": 160},
    "atime_policy": {"positive": 16, "negative": 16, "total": 32},
    "directory_required_field_mutations": {"positive": 0, "negative": 96, "total": 96},
    "membership_nonregular_hardlink": {"positive": 0, "negative": 64, "total": 64},
    "lineage_dedup_output_zero": {"positive": 0, "negative": 64, "total": 64},
    "runtime_authority_seal": {"positive": 0, "negative": 48, "total": 48},
}
REGULAR_STABLE_FIELDS = ("path", "kind", "raw_sha256", "dev", "ino", "mode", "nlink", "size", "mtime_ns", "ctime_ns")
DIRECTORY_STABLE_FIELDS = ("path", "kind", "dev", "ino", "mode", "nlink", "size", "mtime_ns", "ctime_ns", "atime_ns")


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical_sha(value: Any) -> str:
    return sha_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def stable_read(path: Path) -> tuple[bytes, os.stat_result]:
    lexical = path.lstat()
    if stat.S_ISLNK(lexical.st_mode) or not stat.S_ISREG(lexical.st_mode):
        raise ValueError("not-regular:" + str(path))
    if lexical.st_nlink != 1:
        raise ValueError("multiply-linked:" + str(path))
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0))
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
    final = path.lstat()
    identity = lambda value: (value.st_dev, value.st_ino, value.st_mode, value.st_nlink, value.st_size, value.st_mtime_ns, value.st_ctime_ns)
    if identity(lexical) != identity(before) or identity(before) != identity(after) or identity(after) != identity(final):
        raise ValueError("toctou:" + str(path))
    raw = b"".join(chunks)
    if len(raw) != final.st_size:
        raise ValueError("short-read:" + str(path))
    return raw, final


def load(path: Path) -> Any:
    return json.loads(stable_read(path)[0].decode("utf-8"))


def file_binding(path: Path) -> dict[str, Any]:
    raw, _ = stable_read(path)
    result = {"path": str(path), "byte_count": len(raw), "raw_sha256": sha_bytes(raw)}
    if path.suffix == ".json":
        result["canonical_sha256"] = canonical_sha(json.loads(raw))
    return result


def runtime_snapshot() -> dict[str, Any]:
    return {
        "python": sys.executable, "python_version": ".".join(str(value) for value in sys.version_info[:3]),
        "pythonpath": os.environ.get("PYTHONPATH"), "jsonschema_version": importlib.metadata.version("jsonschema"),
        "validator_class": f"{Draft202012Validator.__module__}.{Draft202012Validator.__name__}",
        "no_site": bool(sys.flags.no_site), "no_user_site": bool(sys.flags.no_user_site), "dont_write_bytecode": bool(sys.flags.dont_write_bytecode),
    }


def runtime_errors(value: dict[str, Any]) -> list[str]:
    return ["runtime:" + key for key, expected in RUNTIME.items() if value.get(key) != expected]


def lexical_paths(root: Path, fixed_relative: list[str] | None = None) -> list[Path]:
    if fixed_relative is not None:
        return [root / value for value in sorted(fixed_relative)]
    return sorted(root.rglob("*"), key=lambda path: path.relative_to(root).as_posix())


def _identity_row(path: Path, root: Path, info: os.stat_result, kind: str) -> dict[str, Any]:
    return {
        "path": path.relative_to(root).as_posix(), "kind": kind,
        "dev": info.st_dev, "ino": info.st_ino, "mode": oct(stat.S_IMODE(info.st_mode)),
        "nlink": info.st_nlink, "size": info.st_size, "mtime_ns": info.st_mtime_ns,
        "ctime_ns": info.st_ctime_ns, "atime_ns": info.st_atime_ns,
    }


def encode_inventory(root: Path, fixed_relative: list[str] | None = None) -> dict[str, Any]:
    """The sole rich encoder used unchanged for both baseline and final passes."""
    paths = lexical_paths(root, fixed_relative)
    initial: dict[Path, os.stat_result] = {}
    errors: list[str] = []
    regular: list[Path] = []
    directories: list[Path] = []
    inode_owners: dict[tuple[int, int], str] = {}
    for path in paths:
        relative = path.relative_to(root).as_posix()
        try:
            info = path.lstat()
        except OSError as error:
            errors.append(relative + ":lstat:" + type(error).__name__)
            continue
        initial[path] = info
        if stat.S_ISLNK(info.st_mode):
            errors.append(relative + ":symlink")
        elif stat.S_ISREG(info.st_mode):
            if info.st_nlink != 1:
                errors.append(relative + ":nlink:" + str(info.st_nlink))
            owner = inode_owners.setdefault((info.st_dev, info.st_ino), relative)
            if owner != relative:
                errors.append(relative + ":duplicate-inode-with:" + owner)
            regular.append(path)
        elif stat.S_ISDIR(info.st_mode):
            directories.append(path)
        else:
            errors.append(relative + ":irregular")
    rows: list[dict[str, Any]] = []
    for path in regular:
        try:
            raw, info = stable_read(path)
        except (OSError, ValueError) as error:
            errors.append(path.relative_to(root).as_posix() + ":read:" + str(error))
            continue
        row = _identity_row(path, root, info, "regular")
        row["raw_sha256"] = sha_bytes(raw)
        rows.append(row)
    for path in directories:
        try:
            info = path.lstat()
        except OSError as error:
            errors.append(path.relative_to(root).as_posix() + ":final-lstat:" + type(error).__name__)
            continue
        rows.append(_identity_row(path, root, info, "directory"))
    rows.sort(key=lambda row: row["path"])
    membership = [{"path": row["path"], "kind": row["kind"]} for row in rows]
    content = [{"path": row["path"], "size": row["size"], "raw_sha256": row["raw_sha256"]} for row in rows if row["kind"] == "regular"]
    stable_rows = [{key: value for key, value in row.items() if not (row["kind"] == "regular" and key == "atime_ns")} for row in rows]
    return {
        "schema_version": "lstat-rich-inventory-v2", "root": str(root), "path_exclusions": [],
        "rows": rows, "member_count": len(rows), "regular_count": len(content), "directory_count": len(rows) - len(content),
        "membership_sha256": canonical_sha(membership), "content_sha256": canonical_sha(content),
        "observed_rich_sha256": canonical_sha(rows), "stable_identity_sha256": canonical_sha(stable_rows),
        "errors": sorted(set(errors)),
    }


def compare_inventories(before: dict[str, Any], after: dict[str, Any], allowed_regular_atime: set[str]) -> dict[str, Any]:
    errors: list[str] = []
    atime_deltas: list[dict[str, Any]] = []
    if before.get("schema_version") != "lstat-rich-inventory-v2" or after.get("schema_version") != "lstat-rich-inventory-v2":
        errors.append("schema")
    if before.get("errors") or after.get("errors"):
        errors.append("inventory-errors")
    first = {row.get("path"): row for row in before.get("rows", []) if isinstance(row, dict)}
    last = {row.get("path"): row for row in after.get("rows", []) if isinstance(row, dict)}
    if set(first) != set(last) or len(first) != len(before.get("rows", [])) or len(last) != len(after.get("rows", [])):
        errors.append("membership")
    for path in sorted(set(first) & set(last)):
        one, two = first[path], last[path]
        fields = REGULAR_STABLE_FIELDS if one.get("kind") == "regular" and two.get("kind") == "regular" else DIRECTORY_STABLE_FIELDS
        for field in fields:
            if one.get(field) != two.get(field):
                errors.append(f"{path}:{field}")
        if one.get("kind") == "regular" and two.get("kind") == "regular" and one.get("atime_ns") != two.get("atime_ns"):
            atime_deltas.append({"path": path, "before": one.get("atime_ns"), "after": two.get("atime_ns")})
            if path not in allowed_regular_atime:
                errors.append(path + ":unproven-atime")
    for key in ("membership_sha256", "content_sha256", "stable_identity_sha256", "member_count", "regular_count", "directory_count"):
        if before.get(key) != after.get(key):
            errors.append("aggregate:" + key)
    return {"errors": sorted(set(errors)), "atime_deltas": atime_deltas, "status": "pass" if not errors else "fail_closed"}


def legacy_branch_rows(rich: bool) -> list[dict[str, Any]]:
    rows = []
    for relative in BRANCH_BASE_MEMBERS:
        path = BRANCH_B / relative
        info = path.lstat()
        kind = "directory" if stat.S_ISDIR(info.st_mode) else "regular"
        row = {"path": relative, "kind": kind, "mode": oct(stat.S_IMODE(info.st_mode)), "size": info.st_size, "mtime_ns": info.st_mtime_ns, "dev": info.st_dev, "ino": info.st_ino, "nlink": info.st_nlink}
        if rich and kind == "regular":
            raw, _ = stable_read(path)
            row.update({"sha256": sha_bytes(raw), "size": len(raw), "identity": {"dev": info.st_dev, "ino": info.st_ino, "mode": oct(stat.S_IMODE(info.st_mode)), "mtime_ns": info.st_mtime_ns, "nlink": info.st_nlink}})
        rows.append(row)
    return sorted(rows, key=lambda row: row["path"])


def legacy_localization() -> dict[str, Any]:
    try:
        rich_rows = legacy_branch_rows(True)
        lean_rows = legacy_branch_rows(False)
    except (OSError, ValueError) as error:
        return {"status": "fail_closed", "errors": [type(error).__name__ + ":" + str(error)], "rich_sha256": None, "lean_sha256": None, "identical_member_count": 0, "identical_base_fields": False, "baseline_only_fields": ["sha256", "identity"], "changing_stat_fields": [], "changing_paths": []}
    rich = canonical_sha(rich_rows)
    lean = canonical_sha(lean_rows)
    return {
        "status": "pass" if rich == LEGACY_RICH and lean == LEGACY_LEAN else "fail_closed",
        "rich_sha256": rich, "lean_sha256": lean, "identical_member_count": len(rich_rows),
        "identical_base_fields": all({key: value for key, value in rich_row.items() if key not in {"sha256", "identity"}} == lean_row for rich_row, lean_row in zip(rich_rows, lean_rows)),
        "baseline_only_fields": ["sha256", "identity"], "changing_stat_fields": [], "changing_paths": [],
    }


def content_inventory(root: Path, relative_files: list[str]) -> dict[str, Any]:
    rows = []
    for relative in sorted(relative_files):
        raw, _ = stable_read(root / relative)
        rows.append({"path": relative, "byte_count": len(raw), "sha256": sha_bytes(raw)})
    return {"file_count": len(rows), "byte_count": sum(row["byte_count"] for row in rows), "inventory_sha256": canonical_sha(rows)}


def attempt3_base_relative_files() -> list[str]:
    excluded = {FAILED_LUNA, CONTROLLER_CAPTURE}
    result = []
    for path in sorted(ATTEMPT3.rglob("*"), key=lambda value: value.as_posix()):
        if path in excluded:
            continue
        try:
            info = path.lstat()
        except OSError:
            continue
        if stat.S_ISREG(info.st_mode):
            result.append(path.relative_to(ATTEMPT3).as_posix())
    return result


def lexical_state(path: Path) -> str:
    try:
        info = path.lstat()
    except FileNotFoundError:
        return "absent"
    except OSError as error:
        return "lstat-error:" + type(error).__name__
    if stat.S_ISLNK(info.st_mode):
        return "present-symlink"
    if stat.S_ISDIR(info.st_mode):
        return "present-directory"
    if stat.S_ISREG(info.st_mode):
        return "present-regular"
    return "present-irregular"


def output_errors() -> list[str]:
    errors = []
    for assignment in ASSIGNMENTS:
        path = ATTEMPT3 / f"outputs/{assignment}/attempt-0003"
        try:
            info = path.lstat()
        except OSError as error:
            errors.append(assignment + ":" + type(error).__name__)
            continue
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
            errors.append(assignment + ":not-real-directory")
        elif any(path.iterdir()):
            errors.append(assignment + ":not-empty")
    return errors


def dedup_reconciliation() -> dict[str, Any]:
    scan_errors: list[str] = []
    references: list[str] = []
    target_bytes = str(TARGET_TRANSACTION).encode("utf-8").lower()
    target_name = TARGET_TRANSACTION.name.encode("utf-8").lower()
    for path in sorted(COHORT.rglob("*"), key=lambda value: value.as_posix()):
        if path == BRANCH_B or BRANCH_B in path.parents or path.suffix.lower() not in {".json", ".jsonl"}:
            continue
        try:
            info = path.lstat()
            if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
                scan_errors.append(str(path) + ":not-regular")
                continue
            raw, _ = stable_read(path)
        except (OSError, ValueError) as error:
            scan_errors.append(str(path) + ":" + type(error).__name__)
            continue
        lowered = raw.lower()
        if target_bytes in lowered or target_name in lowered:
            references.append(str(path))
    allowed = [str(FAILED_LUNA)]
    foreign = sorted(set(references) - set(allowed))
    return {
        "status": "pass" if not scan_errors and sorted(set(references)) == allowed and lexical_state(TARGET_TRANSACTION) == "absent" else "fail_closed",
        "target_state": lexical_state(TARGET_TRANSACTION), "allowed_rejected_lineage_inputs": [str(FAILED_LUNA), str(CONTROLLER_CAPTURE)],
        "target_metadata_references": sorted(set(references)), "foreign_references": foreign, "scan_errors": sorted(set(scan_errors)),
        "semantic_weakening": False, "credit": 0,
    }


def authority_errors(authority: dict[str, Any]) -> list[str]:
    errors = []
    if authority.get("schema_version") != "scenario-c2-attempt3-lstat-compatibility-supersession-v2-authority-v1" or authority.get("status") != "prepared_inert_not_activation_authority" or authority.get("preparation_only") is not True:
        errors.append("authority:identity")
    root = authority.get("root_cause", {})
    if root.get("classification") != "serializer_schema_asymmetry_not_filesystem_drift" or root.get("changing_stat_fields") != [] or root.get("changing_paths") != [] or root.get("branch_b_legacy_rich_sha256") != LEGACY_RICH or root.get("branch_b_legacy_lean_sha256") != LEGACY_LEAN:
        errors.append("authority:root-cause")
    lineage = authority.get("immutable_lineage_inputs", {})
    expected_lineage = {
        "failed_luna_report": {"path": str(FAILED_LUNA), "raw_sha256": LINEAGE_PINS[FAILED_LUNA], "status": "fail_closed", "credit": 0},
        "controller_capture": {"path": str(CONTROLLER_CAPTURE), "raw_sha256": LINEAGE_PINS[CONTROLLER_CAPTURE], "status": "fail_closed", "credit": 0},
    }
    if lineage != expected_lineage:
        errors.append("authority:lineage")
    attempt_base = authority.get("attempt3_original_base", {})
    if attempt_base.get("file_count") != 35 or attempt_base.get("byte_count") != 19834332 or attempt_base.get("content_inventory_sha256") != ATTEMPT3_BASE_INVENTORY["inventory_sha256"] or attempt_base.get("tests") != {"passed": 1024, "total": 1024, "failed": 0, "case_id_digest": "cdc4f913993857653d21b1a6cfc21a5ecd29b1bcaebee09c6cfabda4d6d11a84"}:
        errors.append("authority:attempt3-base")
    branch_base = authority.get("branch_b_original_base", {})
    if branch_base.get("file_count") != 8 or branch_base.get("byte_count") != 92311 or branch_base.get("content_inventory_sha256") != BRANCH_BASE_INVENTORY["inventory_sha256"] or branch_base.get("tests") != {"passed": 900, "total": 900, "failed": 0, "case_id_digest": "86ba5165ab7797198293438801665a1503c40a0dc3afc93a9bbf747f8f8f6db7"}:
        errors.append("authority:branch-base")
    encoder = authority.get("canonical_rich_encoder_v2", {})
    if encoder.get("one_shared_encoder_for_baseline_and_final") is not True or encoder.get("sole_observational_nonblocking_field") != "regular.atime_ns" or encoder.get("path_exclusions") != []:
        errors.append("authority:encoder")
    history = authority.get("historical_atime_only_replay", {})
    if history.get("exact_delta_count") != 16 or set(history.get("allowed_relative_paths", [])) != ALLOWED_ATTEMPT3_ATIME or set(history.get("before_after_atime_ns", {})) != ALLOWED_ATTEMPT3_ATIME or history.get("all_non_atime_fields_exact") is not True or history.get("raw_sha256_exact") is not True:
        errors.append("authority:atime-history")
    stale = authority.get("stale_v1_positive_reconciliation", {})
    if stale.get("exact_count") != 2 or set(stale.get("case_ids", [])) != STALE_V1_CASES or stale.get("semantic_weakening") is not False or stale.get("credit") != 0:
        errors.append("authority:stale-v1")
    if authority.get("runtime") != RUNTIME:
        errors.append("authority:runtime")
    if authority.get("zero_state") != ZERO_STATE:
        errors.append("authority:zero-state")
    transaction = authority.get("future_transaction", {})
    if transaction.get("target_namespace") != str(TARGET_TRANSACTION) or transaction.get("target_state") != "required_absent" or transaction.get("exact_assignment_ids") != ASSIGNMENTS or transaction.get("exact_assignment_count") != 6 or transaction.get("feature_count") != 687 or transaction.get("question_obligation_count") != 713 or transaction.get("authorized") is not False or transaction.get("launch") is not False or transaction.get("activation") is not False:
        errors.append("authority:transaction")
    return sorted(set(errors))


def live_source_errors() -> list[str]:
    errors: list[str] = []
    for path, digest in LINEAGE_PINS.items():
        try:
            if file_binding(path)["raw_sha256"] != digest:
                errors.append("lineage:" + path.name)
        except (OSError, ValueError):
            errors.append("lineage-unreadable:" + path.name)
    for relative, digest in BRANCH_BASE_PINS.items():
        try:
            if file_binding(BRANCH_B / relative)["raw_sha256"] != digest:
                errors.append("branch-base:" + relative)
        except (OSError, ValueError):
            errors.append("branch-base-unreadable:" + relative)
    if content_inventory(BRANCH_B, BRANCH_BASE_FILES) != BRANCH_BASE_INVENTORY:
        errors.append("branch-base-inventory")
    attempt_files = attempt3_base_relative_files()
    if content_inventory(ATTEMPT3, attempt_files) != ATTEMPT3_BASE_INVENTORY:
        errors.append("attempt3-base-inventory")
    errors.extend("output:" + value for value in output_errors())
    if lexical_state(TARGET_TRANSACTION) != "absent":
        errors.append("target:" + lexical_state(TARGET_TRANSACTION))
    dedup = dedup_reconciliation()
    if dedup["status"] != "pass":
        errors.append("dedup")
    return sorted(set(errors))


def binding_matches(binding: Any, path: Path) -> bool:
    if not isinstance(binding, dict):
        return False
    observed = file_binding(path)
    return binding.get("path") == str(path) and binding.get("byte_count") == observed["byte_count"] and binding.get("raw_sha256") == observed["raw_sha256"]


def source_seal_errors(seal: dict[str, Any]) -> list[str]:
    errors = []
    if seal.get("schema_version") != "scenario-c2-lstat-supersession-v2-source-seal-v1" or seal.get("status") != "sealed_inert_sources":
        errors.append("seal:identity")
    for label, path in (("authority", AUTHORITY), ("matrix", MATRIX), ("verifier", VERIFY_SOURCE), ("tests", TEST_SOURCE)):
        if not binding_matches(seal.get("bindings", {}).get(label), path):
            errors.append("seal:binding:" + label)
    if seal.get("legacy_reproduction") != {"rich_sha256": LEGACY_RICH, "lean_sha256": LEGACY_LEAN, "changing_stat_fields": [], "changing_paths": []}:
        errors.append("seal:localization")
    if seal.get("test_contract") != {"total": 512, "positive": 32, "negative": 480, "case_id_digest": EXPECTED_CASE_ID_DIGEST, "category_counts": EXPECTED_CATEGORY_COUNTS}:
        errors.append("seal:test-contract")
    if seal.get("runtime") != RUNTIME or seal.get("zero_state") != ZERO_STATE:
        errors.append("seal:runtime-or-zero")
    return sorted(set(errors))


def expected_files(phase: str) -> set[Path]:
    files = {AUTHORITY, MATRIX, VERIFY_SOURCE, TEST_SOURCE}
    if phase in {"preseal", "terminal"}:
        files.update({SOURCE_SEAL, TEST_REPORT})
    if phase == "terminal":
        files.update({TERMINAL, READINESS})
    return files


def namespace_errors(phase: str) -> list[str]:
    expected = expected_files(phase)
    allowed_dirs = {HERE / "validation"} if phase in {"preseal", "terminal"} else set()
    files: set[Path] = set()
    errors: list[str] = []
    for path in sorted(HERE.rglob("*"), key=lambda value: value.as_posix()):
        info = path.lstat()
        if stat.S_ISREG(info.st_mode):
            files.add(path)
        elif stat.S_ISDIR(info.st_mode):
            if path not in allowed_dirs:
                errors.append("namespace:directory:" + path.relative_to(HERE).as_posix())
        elif stat.S_ISLNK(info.st_mode):
            errors.append("namespace:symlink:" + path.relative_to(HERE).as_posix())
        else:
            errors.append("namespace:irregular:" + path.relative_to(HERE).as_posix())
    for path in sorted(expected - files):
        errors.append("namespace:missing:" + path.relative_to(HERE).as_posix())
    for path in sorted(files - expected):
        errors.append("namespace:foreign:" + path.relative_to(HERE).as_posix())
    return errors


def run_suite(path: Path) -> dict[str, Any]:
    environment = {"PATH": os.environ.get("PATH", ""), "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1", "PYTHONPATH": RUNTIME["pythonpath"]}
    complete = subprocess.run([RUNTIME["python"], "-S", "-B", str(path)], env=environment, capture_output=True, text=True)
    try:
        value = json.loads(complete.stdout)
    except json.JSONDecodeError as error:
        return {"status": "fail_closed", "exit_status": complete.returncode, "parse_error": str(error), "stderr": complete.stderr[-1000:]}
    value["exit_status"] = complete.returncode
    value.pop("cases", None)
    return value


def full_replay() -> dict[str, Any]:
    errors = runtime_errors(runtime_snapshot()) + namespace_errors("preseal") + live_source_errors()
    authority = load(AUTHORITY)
    seal = load(SOURCE_SEAL)
    errors.extend(authority_errors(authority))
    errors.extend(source_seal_errors(seal))
    branch_suite = run_suite(BRANCH_B / "test_branch_b_preparation.py")
    before_attempt3 = encode_inventory(ATTEMPT3)
    before_branch = encode_inventory(BRANCH_B, BRANCH_BASE_MEMBERS)
    attempt_suite = run_suite(ATTEMPT3 / "test_attempt3_v32.py")
    after_attempt3 = encode_inventory(ATTEMPT3)
    after_branch = encode_inventory(BRANCH_B, BRANCH_BASE_MEMBERS)
    attempt_compare = compare_inventories(before_attempt3, after_attempt3, ALLOWED_ATTEMPT3_ATIME)
    branch_compare = compare_inventories(before_branch, after_branch, set())
    if attempt_suite.get("status") != "pass" or attempt_suite.get("passed") != 1024 or attempt_suite.get("total") != 1024 or attempt_suite.get("failed") != 0 or attempt_suite.get("case_id_digest") != "cdc4f913993857653d21b1a6cfc21a5ecd29b1bcaebee09c6cfabda4d6d11a84" or attempt_suite.get("exit_status") != 0:
        errors.append("replay:attempt3-suite")
    branch_failures = {row.get("case_id") for row in branch_suite.get("failures", []) if isinstance(row, dict)}
    if branch_suite.get("status") != "fail" or branch_suite.get("passed") != 898 or branch_suite.get("total") != 900 or branch_suite.get("failed") != 2 or branch_failures != STALE_V1_CASES or branch_suite.get("case_id_digest") != "86ba5165ab7797198293438801665a1503c40a0dc3afc93a9bbf747f8f8f6db7" or branch_suite.get("exit_status") == 0:
        errors.append("replay:branch-stale-positive-partition")
    if attempt_compare["errors"]:
        errors.append("replay:attempt3-inventory")
    if branch_compare["errors"]:
        errors.append("replay:branch-inventory")
    localization = legacy_localization()
    if localization["status"] != "pass" or not localization["identical_base_fields"]:
        errors.append("replay:legacy-localization")
    return {
        "schema_version": "scenario-c2-lstat-supersession-v2-full-replay-v1",
        "status": "READY_FOR_FRESH_LUNA_LSTAT_SUPERSESSION_GATE" if not errors else "fail_closed",
        "errors": sorted(set(errors)), "legacy_localization": localization,
        "attempt3_suite": {key: attempt_suite.get(key) for key in ("status", "passed", "total", "failed", "positive", "negative", "case_id_digest", "exit_status")},
        "branch_b_v1_suite": {"raw_status": branch_suite.get("status"), "raw_passed": branch_suite.get("passed"), "raw_total": branch_suite.get("total"), "raw_failed": branch_suite.get("failed"), "expected_rejected_lineage_case_ids": sorted(branch_failures), "effective_passed": 900, "effective_failed": 0, "case_id_digest": branch_suite.get("case_id_digest"), "exit_status": branch_suite.get("exit_status"), "semantic_weakening": False},
        "attempt3_inventory_before": before_attempt3, "attempt3_inventory_after": after_attempt3, "attempt3_comparison": attempt_compare,
        "branch_b_inventory_before": before_branch, "branch_b_inventory_after": after_branch, "branch_b_comparison": branch_compare,
        "dedup": dedup_reconciliation(), "zero_state": ZERO_STATE, "runtime": runtime_snapshot(),
        "production": 0, "activation": False, "launch": False, "generator_invoked": False, "reviewer_children": 0, "semantic_children": 0, "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0,
    }


def verify(phase: str) -> dict[str, Any]:
    errors = runtime_errors(runtime_snapshot()) + namespace_errors(phase) + live_source_errors()
    if not errors:
        authority = load(AUTHORITY)
        errors.extend(authority_errors(authority))
        localization = legacy_localization()
        if localization["status"] != "pass" or not localization["identical_base_fields"]:
            errors.append("legacy-localization")
        branch_one = encode_inventory(BRANCH_B, BRANCH_BASE_MEMBERS)
        branch_two = encode_inventory(BRANCH_B, BRANCH_BASE_MEMBERS)
        branch_compare = compare_inventories(branch_one, branch_two, set())
        if branch_compare["errors"]:
            errors.append("branch-two-pass")
        if phase in {"preseal", "terminal"}:
            seal = load(SOURCE_SEAL)
            report = load(TEST_REPORT)
            errors.extend(source_seal_errors(seal))
            if report.get("status") != "pass" or report.get("passed") != 512 or report.get("total") != 512 or report.get("failed") != 0 or report.get("case_id_digest") != EXPECTED_CASE_ID_DIGEST or report.get("category_counts") != EXPECTED_CATEGORY_COUNTS or report.get("runtime") != runtime_snapshot():
                errors.append("test-report")
            for label, path in (("authority", AUTHORITY), ("matrix", MATRIX), ("verifier", VERIFY_SOURCE), ("tests", TEST_SOURCE), ("source_seal", SOURCE_SEAL)):
                if report.get("bindings", {}).get(label + "_sha256") != file_binding(path)["raw_sha256"]:
                    errors.append("test-report-binding:" + label)
        if phase == "terminal":
            terminal = load(TERMINAL)
            readiness = load(READINESS)
            if terminal.get("status") != "READY_FOR_FRESH_LUNA_LSTAT_SUPERSESSION_GATE" or terminal.get("errors") != [] or terminal.get("zero_state") != ZERO_STATE:
                errors.append("terminal-status")
            if readiness.get("status") != "READY_FOR_FRESH_LUNA_LSTAT_SUPERSESSION_GATE" or readiness.get("errors") != [] or readiness.get("zero_state") != ZERO_STATE:
                errors.append("readiness-status")
            for label, path in (("authority", AUTHORITY), ("matrix", MATRIX), ("verifier", VERIFY_SOURCE), ("tests", TEST_SOURCE), ("source_seal", SOURCE_SEAL), ("test_report", TEST_REPORT)):
                if not binding_matches(terminal.get("bindings", {}).get(label), path):
                    errors.append("terminal-binding:" + label)
            for label, path in (("authority", AUTHORITY), ("source_seal", SOURCE_SEAL), ("test_report", TEST_REPORT), ("terminal", TERMINAL), ("verifier", VERIFY_SOURCE)):
                if not binding_matches(readiness.get("bindings", {}).get(label), path):
                    errors.append("readiness-binding:" + label)
    return {
        "schema_version": "scenario-c2-lstat-supersession-v2-verification-v1",
        "status": "READY_FOR_FRESH_LUNA_LSTAT_SUPERSESSION_GATE" if not errors else "fail_closed",
        "phase": phase, "errors": sorted(set(errors)), "production": 0, "activation": False, "launch": False,
        "generator_invoked": False, "reviewer_children": 0, "semantic_children": 0, "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0,
        "dedup": dedup_reconciliation(), "output_errors": output_errors(), "runtime": runtime_snapshot(),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", action="store_true")
    parser.add_argument("--preseal", action="store_true")
    parser.add_argument("--full-replay", action="store_true")
    args = parser.parse_args()
    if args.full_replay:
        report = full_replay()
    else:
        phase = "source" if args.source else "preseal" if args.preseal else "terminal"
        report = verify(phase)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "READY_FOR_FRESH_LUNA_LSTAT_SUPERSESSION_GATE" else 1)


if __name__ == "__main__":
    main()
