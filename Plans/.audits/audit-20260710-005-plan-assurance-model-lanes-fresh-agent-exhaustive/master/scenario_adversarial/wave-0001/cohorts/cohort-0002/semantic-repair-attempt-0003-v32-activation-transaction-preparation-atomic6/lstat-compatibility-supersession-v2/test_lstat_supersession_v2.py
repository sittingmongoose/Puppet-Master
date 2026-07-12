#!/usr/bin/env python3
"""Exactly 512 lightweight positive and fail-closed tests for lstat supersession v2."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable

sys.dont_write_bytecode = True
import verify_lstat_supersession_v2 as gate

CaseFn = Callable[[], bool]
CASES: list[tuple[str, str, str, CaseFn]] = []
AUTHORITY: dict[str, Any]
MATRIX: dict[str, Any]
SEAL: dict[str, Any]


def add(category: str, polarity: str, name: str, function: CaseFn) -> None:
    CASES.append((category, polarity, f"{category}:{polarity}:{name}", function))


def synthetic_document(file_path: str = "attempt3_common.py") -> dict[str, Any]:
    rows = [
        {"path": file_path, "kind": "regular", "raw_sha256": "a" * 64, "dev": 1, "ino": 2, "mode": "0o444", "nlink": 1, "size": 10, "mtime_ns": 20, "ctime_ns": 30, "atime_ns": 40},
        {"path": "validation", "kind": "directory", "dev": 1, "ino": 3, "mode": "0o755", "nlink": 2, "size": 64, "mtime_ns": 21, "ctime_ns": 31, "atime_ns": 41},
    ]
    membership = [{"path": row["path"], "kind": row["kind"]} for row in rows]
    content = [{"path": rows[0]["path"], "size": rows[0]["size"], "raw_sha256": rows[0]["raw_sha256"]}]
    stable = [{key: value for key, value in row.items() if not (row["kind"] == "regular" and key == "atime_ns")} for row in rows]
    return {
        "schema_version": "lstat-rich-inventory-v2", "root": "/synthetic", "path_exclusions": [], "rows": rows,
        "member_count": 2, "regular_count": 1, "directory_count": 1,
        "membership_sha256": gate.canonical_sha(membership), "content_sha256": gate.canonical_sha(content),
        "observed_rich_sha256": gate.canonical_sha(rows), "stable_identity_sha256": gate.canonical_sha(stable), "errors": [],
    }


def register_live_positive() -> None:
    checks: list[tuple[str, CaseFn]] = [
        ("authority-clean", lambda: gate.authority_errors(copy.deepcopy(AUTHORITY)) == []),
        ("runtime-clean", lambda: gate.runtime_errors(gate.runtime_snapshot()) == []),
        ("legacy-rich-exact", lambda: gate.legacy_localization()["rich_sha256"] == gate.LEGACY_RICH),
        ("legacy-lean-exact", lambda: gate.legacy_localization()["lean_sha256"] == gate.LEGACY_LEAN),
        ("legacy-no-stat-drift", lambda: gate.legacy_localization()["changing_stat_fields"] == [] and gate.legacy_localization()["changing_paths"] == []),
        ("lineage-pins", lambda: all(gate.file_binding(path)["raw_sha256"] == digest for path, digest in gate.LINEAGE_PINS.items())),
        ("branch-base-pins", lambda: all(gate.file_binding(gate.BRANCH_B / relative)["raw_sha256"] == digest for relative, digest in gate.BRANCH_BASE_PINS.items())),
        ("branch-base-inventory", lambda: gate.content_inventory(gate.BRANCH_B, gate.BRANCH_BASE_FILES) == gate.BRANCH_BASE_INVENTORY),
        ("attempt3-base-inventory", lambda: gate.content_inventory(gate.ATTEMPT3, gate.attempt3_base_relative_files()) == gate.ATTEMPT3_BASE_INVENTORY),
        ("outputs-empty", lambda: gate.output_errors() == []),
        ("dedup-reconciled", lambda: gate.dedup_reconciliation()["status"] == "pass"),
        ("target-absent", lambda: gate.lexical_state(gate.TARGET_TRANSACTION) == "absent"),
        ("shared-rich-encoder", lambda: gate.encode_inventory(gate.BRANCH_B, gate.BRANCH_BASE_MEMBERS)["errors"] == []),
        ("two-pass-clean", lambda: gate.compare_inventories(synthetic_document(), copy.deepcopy(synthetic_document()), gate.ALLOWED_ATTEMPT3_ATIME)["errors"] == []),
        ("exact-atime-allowlist", lambda: len(gate.ALLOWED_ATTEMPT3_ATIME) == 16),
        ("zero-state", lambda: AUTHORITY["zero_state"] == gate.ZERO_STATE),
    ]
    for name, function in checks:
        add("live_positive", "positive", name, function)


def register_legacy_asymmetry() -> None:
    for index in range(16):
        def run(index=index) -> bool:
            before = synthetic_document()
            after = copy.deepcopy(before)
            after["rows"][0].pop("raw_sha256")
            if index % 2:
                after["rows"][0].pop("ctime_ns")
            return gate.compare_inventories(before, after, gate.ALLOWED_ATTEMPT3_ATIME)["errors"] != []
        add("legacy_schema_asymmetry", "negative", f"lean-row-{index:02d}", run)
    for index in range(16):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            root = candidate["root_cause"]
            variants = ["classification", "changing_stat_fields", "changing_paths", "branch_b_legacy_rich_sha256", "branch_b_legacy_lean_sha256"]
            key = variants[index % len(variants)]
            root[key] = "mutated" if key not in {"changing_stat_fields", "changing_paths"} else ["mode"]
            return gate.authority_errors(candidate) != []
        add("legacy_schema_asymmetry", "negative", f"authority-{index:02d}", run)


def register_regular_mutations() -> None:
    fields = list(gate.REGULAR_STABLE_FIELDS)
    assert len(fields) == 10
    for field in fields:
        for index in range(16):
            def run(field=field, index=index) -> bool:
                before = synthetic_document()
                after = copy.deepcopy(before)
                row = after["rows"][0]
                if field == "path": row[field] = f"foreign-{index}.json"
                elif field == "kind": row[field] = "directory"
                elif field in {"raw_sha256", "mode"}: row[field] = str(row[field]) + "-drift"
                else: row[field] += index + 1
                return gate.compare_inventories(before, after, gate.ALLOWED_ATTEMPT3_ATIME)["errors"] != []
            add("regular_required_field_mutations", "negative", f"{field}-{index:02d}", run)


def register_atime_policy() -> None:
    for index, path in enumerate(sorted(gate.ALLOWED_ATTEMPT3_ATIME)):
        def run(path=path, index=index) -> bool:
            before = synthetic_document(path)
            after = copy.deepcopy(before)
            after["rows"][0]["atime_ns"] += index + 1
            result = gate.compare_inventories(before, after, gate.ALLOWED_ATTEMPT3_ATIME)
            return result["errors"] == [] and result["atime_deltas"] == [{"path": path, "before": 40, "after": 41 + index}]
        add("atime_policy", "positive", f"allowed-{index:02d}", run)
    for index in range(16):
        def run(index=index) -> bool:
            path = f"unproven/{index:02d}.json"
            before = synthetic_document(path)
            after = copy.deepcopy(before)
            after["rows"][0]["atime_ns"] += 1
            return any("unproven-atime" in error for error in gate.compare_inventories(before, after, gate.ALLOWED_ATTEMPT3_ATIME)["errors"])
        add("atime_policy", "negative", f"unproven-{index:02d}", run)


def register_directory_mutations() -> None:
    fields = list(gate.DIRECTORY_STABLE_FIELDS)
    for index in range(96):
        field = fields[index % len(fields)]
        def run(field=field, index=index) -> bool:
            before = synthetic_document()
            after = copy.deepcopy(before)
            row = after["rows"][1]
            if field == "path": row[field] = f"foreign-dir-{index}"
            elif field in {"kind", "mode"}: row[field] = str(row[field]) + "-drift"
            else: row[field] += index + 1
            return gate.compare_inventories(before, after, gate.ALLOWED_ATTEMPT3_ATIME)["errors"] != []
        add("directory_required_field_mutations", "negative", f"{field}-{index:02d}", run)


def fixture_rejected(kind: str, index: int) -> bool:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        if kind == "broken-symlink":
            (root / f"broken-{index}.json").symlink_to(root / "missing")
        elif kind == "live-symlink":
            target = root / "target.json"
            target.write_text("{}\n", encoding="utf-8")
            (root / f"link-{index}.json").symlink_to(target)
        elif kind == "fifo":
            os.mkfifo(root / f"fifo-{index}")
        else:
            source = root / "source.json"
            source.write_text("{}\n", encoding="utf-8")
            os.link(source, root / f"hard-{index}.json")
        return gate.encode_inventory(root)["errors"] != []


def register_membership_nonregular() -> None:
    for index in range(16):
        def run(index=index) -> bool:
            before = synthetic_document()
            after = copy.deepcopy(before)
            after["rows"].pop(index % 2)
            return "membership" in gate.compare_inventories(before, after, gate.ALLOWED_ATTEMPT3_ATIME)["errors"]
        add("membership_nonregular_hardlink", "negative", f"missing-{index:02d}", run)
    for kind in ("broken-symlink", "live-symlink", "fifo", "hardlink"):
        for index in range(12):
            add("membership_nonregular_hardlink", "negative", f"{kind}-{index:02d}", lambda kind=kind, index=index: fixture_rejected(kind, index))


def mutate_lineage(candidate: dict[str, Any], index: int) -> None:
    variant = index % 16
    if variant == 0: candidate["immutable_lineage_inputs"]["failed_luna_report"]["raw_sha256"] = "0" * 64
    elif variant == 1: candidate["immutable_lineage_inputs"]["failed_luna_report"]["path"] += "-foreign"
    elif variant == 2: candidate["immutable_lineage_inputs"]["failed_luna_report"]["status"] = "pass"
    elif variant == 3: candidate["immutable_lineage_inputs"]["failed_luna_report"]["credit"] = 1
    elif variant == 4: candidate["immutable_lineage_inputs"]["controller_capture"]["raw_sha256"] = "0" * 64
    elif variant == 5: candidate["immutable_lineage_inputs"]["controller_capture"]["path"] += "-foreign"
    elif variant == 6: candidate["attempt3_original_base"]["file_count"] = 36
    elif variant == 7: candidate["attempt3_original_base"]["byte_count"] += 1
    elif variant == 8: candidate["attempt3_original_base"]["content_inventory_sha256"] = "0" * 64
    elif variant == 9: candidate["attempt3_original_base"]["tests"]["passed"] = 1023
    elif variant == 10: candidate["branch_b_original_base"]["file_count"] = 9
    elif variant == 11: candidate["branch_b_original_base"]["content_inventory_sha256"] = "0" * 64
    elif variant == 12: candidate["stale_v1_positive_reconciliation"]["exact_count"] = 1
    elif variant == 13: candidate["stale_v1_positive_reconciliation"]["case_ids"] = []
    elif variant == 14: candidate["future_transaction"]["exact_assignment_count"] = 5
    else: candidate["zero_state"]["credit"] = 1


def register_lineage_dedup_zero() -> None:
    for index in range(64):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            mutate_lineage(candidate, index)
            return gate.authority_errors(candidate) != []
        add("lineage_dedup_output_zero", "negative", f"authority-{index:02d}", run)


def mutate_seal(candidate: dict[str, Any], index: int) -> None:
    variant = index % 16
    if variant == 0: candidate["schema_version"] = "foreign"
    elif variant == 1: candidate["status"] = "authorized"
    elif variant in {2, 3, 4, 5}:
        label = ("authority", "matrix", "verifier", "tests")[variant - 2]
        candidate["bindings"][label]["raw_sha256"] = "0" * 64
    elif variant == 6: candidate["legacy_reproduction"]["rich_sha256"] = "0" * 64
    elif variant == 7: candidate["legacy_reproduction"]["lean_sha256"] = "0" * 64
    elif variant == 8: candidate["legacy_reproduction"]["changing_paths"] = ["foreign"]
    elif variant == 9: candidate["runtime"]["python_version"] = "3.13.0"
    elif variant == 10: candidate["zero_state"]["production"] = 1
    elif variant == 11: candidate["zero_state"]["activation"] = True
    elif variant == 12: candidate["zero_state"]["generator_invoked"] = True
    elif variant == 13: candidate["zero_state"]["reviewer_children"] = 1
    elif variant == 14: candidate["zero_state"]["results"] = 1
    else: candidate["zero_state"]["credit"] = 1


def register_runtime_authority_seal() -> None:
    runtime_keys = list(gate.RUNTIME)
    for index in range(16):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            key = runtime_keys[index % len(runtime_keys)]
            value = candidate["runtime"][key]
            candidate["runtime"][key] = (not value) if isinstance(value, bool) else str(value) + "-drift"
            return gate.authority_errors(candidate) != []
        add("runtime_authority_seal", "negative", f"runtime-{index:02d}", run)
    for index in range(32):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(SEAL)
            mutate_seal(candidate, index)
            return gate.source_seal_errors(candidate) != []
        add("runtime_authority_seal", "negative", f"seal-{index:02d}", run)


def main() -> None:
    global AUTHORITY, MATRIX, SEAL
    AUTHORITY = gate.load(gate.AUTHORITY)
    MATRIX = gate.load(gate.MATRIX)
    SEAL = gate.load(gate.SOURCE_SEAL)
    register_live_positive()
    register_legacy_asymmetry()
    register_regular_mutations()
    register_atime_policy()
    register_directory_mutations()
    register_membership_nonregular()
    register_lineage_dedup_zero()
    register_runtime_authority_seal()
    expected = {row["category"]: {"positive": row["positive"], "negative": row["negative"], "total": row["total"]} for row in MATRIX["categories"]}
    observed: dict[str, dict[str, int]] = {}
    for category, polarity, _, _ in CASES:
        row = observed.setdefault(category, {"positive": 0, "negative": 0, "total": 0})
        row[polarity] += 1
        row["total"] += 1
    failures: list[dict[str, str]] = []
    case_ids = [case_id for _, _, case_id, _ in CASES]
    if len(CASES) != 512 or len(set(case_ids)) != 512 or observed != expected:
        failures.append({"case_id": "registration", "error": "count-identity-or-matrix"})
    observed_digest = hashlib.sha256("\n".join(case_ids).encode("utf-8")).hexdigest()
    if observed_digest != MATRIX.get("expected_case_id_digest") or observed != MATRIX.get("expected_category_counts"):
        failures.append({"case_id": "registration", "error": "deterministic-closure"})
    for _, _, case_id, function in CASES:
        try:
            if function() is not True:
                failures.append({"case_id": case_id, "error": "returned-false"})
        except Exception as error:
            failures.append({"case_id": case_id, "error": type(error).__name__ + ":" + str(error)})
    report = {
        "schema_version": "scenario-c2-lstat-supersession-v2-lightweight-tests-v1",
        "status": "pass" if not failures else "fail", "passed": 512 - len([row for row in failures if row["case_id"] != "registration"]),
        "total": 512, "failed": len(failures), "positive": 32, "negative": 480,
        "case_id_digest": observed_digest, "category_counts": observed, "runtime": gate.runtime_snapshot(),
        "bindings": {
            "authority_sha256": gate.file_binding(gate.AUTHORITY)["raw_sha256"], "matrix_sha256": gate.file_binding(gate.MATRIX)["raw_sha256"],
            "verifier_sha256": gate.file_binding(gate.VERIFY_SOURCE)["raw_sha256"], "tests_sha256": gate.file_binding(gate.TEST_SOURCE)["raw_sha256"],
            "source_seal_sha256": gate.file_binding(gate.SOURCE_SEAL)["raw_sha256"],
        },
        "failures": failures,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
