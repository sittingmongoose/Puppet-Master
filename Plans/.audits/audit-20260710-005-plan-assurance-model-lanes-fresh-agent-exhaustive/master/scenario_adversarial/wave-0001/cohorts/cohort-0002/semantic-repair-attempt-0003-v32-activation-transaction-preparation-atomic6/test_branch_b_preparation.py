#!/usr/bin/env python3
"""Exactly 900 static positive and fail-closed tests for inert Branch B preparation."""
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

import verify_branch_b_preparation as gate

CaseFn = Callable[[], bool]
CASES: list[tuple[str, str, str, CaseFn]] = []
AUTHORITY: dict[str, Any]
SEAL: dict[str, Any]
MATRIX: dict[str, Any]


def add(category: str, polarity: str, name: str, function: CaseFn) -> None:
    CASES.append((category, polarity, f"{category}:{polarity}:{name}", function))


def changed_hex(value: str, index: int) -> str:
    replacement = "0" if value[index] != "0" else "1"
    return value[:index] + replacement + value[index + 1:]


def authority_rejects(candidate: dict[str, Any]) -> bool:
    return gate.contract_errors(candidate) != []


def seal_rejects(candidate: dict[str, Any]) -> bool:
    return gate.tool_seal_errors(candidate) != []


def register_positive() -> None:
    checks: list[tuple[str, CaseFn]] = [
        ("authority-contract-clean", lambda: gate.contract_errors(copy.deepcopy(AUTHORITY)) == []),
        ("tool-seal-clean", lambda: gate.tool_seal_errors(copy.deepcopy(SEAL)) == []),
        ("runtime-clean", lambda: gate.runtime_contract_errors(gate.runtime_snapshot()) == []),
        ("matrix-total-900", lambda: sum(row["total"] for row in MATRIX["categories"]) == 900),
        ("matrix-minimum-800", lambda: MATRIX["minimum_required"] == 800 and MATRIX["expected_total"] == 900),
        ("attempt3-pins-live", lambda: all(gate.file_binding(path)["raw_sha256"] == digest for path, digest in gate.ATTEMPT3_PINS.values())),
        ("attempt3-inventory-live", lambda: gate.tree_inventory(gate.ATTEMPT3) == gate.ATTEMPT3_INVENTORY),
        ("six-outputs-empty", lambda: all((gate.ATTEMPT3 / f"outputs/{assignment}/attempt-0003").is_dir() and not any((gate.ATTEMPT3 / f"outputs/{assignment}/attempt-0003").rglob("*")) for assignment in gate.ASSIGNMENTS)),
        ("exact-assignment-set", lambda: AUTHORITY["future_transaction"]["assignment_ids"] == gate.ASSIGNMENTS and len(set(gate.ASSIGNMENTS)) == 6),
        ("feature-count", lambda: AUTHORITY["future_transaction"]["feature_count"] == 687),
        ("question-obligation-count", lambda: AUTHORITY["future_transaction"]["question_obligation_count"] == 713),
        ("atomic-all-or-nothing", lambda: all(AUTHORITY["future_transaction"][key] is True for key in ("all_or_nothing", "partial_cohort_forbidden", "larger_cohort_forbidden", "atomic_commit_required"))),
        ("no-transaction-authority", lambda: AUTHORITY["future_transaction"]["transaction_authorized"] is False and AUTHORITY["future_transaction"]["tool_execution_authorized"] is False),
        ("three-live-absence-gates", lambda: gate.live_absence_errors() == []),
        ("luna-contract-absent", lambda: AUTHORITY["prerequisites"]["fresh_luna_prelaunch"]["path"] == str(gate.LUNA) and gate.lexical_path_state(gate.LUNA) == "absent"),
        ("capture-contract-absent", lambda: AUTHORITY["prerequisites"]["controller_parent_native_capture"]["path"] == str(gate.CAPTURE) and gate.lexical_path_state(gate.CAPTURE) == "absent"),
        ("future-identities-unallocated", lambda: len(AUTHORITY["future_sol_identities"]) == 6 and all(row["state"] == "future_unallocated" and row["native_child_thread_id"] is None for row in AUTHORITY["future_sol_identities"])),
        ("zero-state-exact", lambda: AUTHORITY["zero_state"] == gate.ZERO_STATE),
        ("forbidden-counts-zero", lambda: all(value == 0 for value in AUTHORITY["forbidden_artifact_counts"].values())),
        ("dedup-zero-live", lambda: AUTHORITY["pre_creation_dedup_result"] == gate.DEDUP_EXPECTED and gate.dedup_result_errors(gate.dedup_search()) == []),
    ]
    assert len(checks) == 20
    for name, function in checks:
        add("live_positive", "positive", name, function)


def register_upstream_pin_mutations() -> None:
    bindings = [
        ("attempt3_authority", "raw_sha256"),
        ("attempt3_readiness", "raw_sha256"),
        ("attempt3_inventory", "inventory_sha256"),
        ("attempt3_test_report", "raw_sha256"),
        ("attempt3_verifier", "raw_sha256"),
    ]
    for label, key in bindings:
        for offset in range(64):
            def run(label=label, key=key, offset=offset) -> bool:
                candidate = copy.deepcopy(AUTHORITY)
                candidate["upstream"][label][key] = changed_hex(candidate["upstream"][label][key], offset)
                return authority_rejects(candidate)
            add("upstream_pin_mutations", "negative", f"{label}:{key}:{offset:02d}", run)


def mutate_atomic_special(candidate: dict[str, Any], index: int) -> None:
    transaction = candidate["future_transaction"]
    if index == 0:
        transaction["kind"] = "embedded_activation"
    elif index == 1:
        transaction["target_namespace"] += "-foreign"
    elif index == 2:
        transaction["target_namespace_state"] = "present"
    elif index == 3:
        transaction["exact_assignment_count"] = 5
    elif index == 4:
        transaction["exact_assignment_count"] = 7
    elif index == 5:
        transaction["exact_assignment_count"] = 0
    elif index == 6:
        transaction["all_or_nothing"] = False
    elif index == 7:
        transaction["partial_cohort_forbidden"] = False
    elif index == 8:
        transaction["larger_cohort_forbidden"] = False
    elif index == 9:
        transaction["atomic_commit_required"] = False
    elif index == 10:
        transaction["transaction_authorized"] = True
    elif index == 11:
        transaction["tool_execution_authorized"] = True
    elif index == 12:
        del transaction["assignment_ids"]
    elif index == 13:
        transaction["assignment_ids"] = "|".join(gate.ASSIGNMENTS)
    elif index == 14:
        transaction["assignment_ids"][0] += " "
    elif index == 15:
        transaction["assignment_ids"][0] = transaction["assignment_ids"][0].lower()
    elif index == 16:
        transaction["assignment_ids"][0] = "A005SA-9999"
    elif index == 17:
        transaction["assignment_ids"][-1] = transaction["assignment_ids"][0]
    elif index == 18:
        transaction["target_namespace"] = str(gate.HERE)
    else:
        transaction["kind"] = None


def register_atomic6_set_mutations() -> None:
    for mask in range(63):
        def run(mask=mask) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            candidate["future_transaction"]["assignment_ids"] = [value for index, value in enumerate(gate.ASSIGNMENTS) if mask & (1 << index)]
            return authority_rejects(candidate)
        add("atomic6_set_mutations", "negative", f"subset-mask-{mask:02d}", run)
    add("atomic6_set_mutations", "negative", "reverse-order", lambda: authority_rejects({**copy.deepcopy(AUTHORITY), "future_transaction": {**copy.deepcopy(AUTHORITY["future_transaction"]), "assignment_ids": list(reversed(gate.ASSIGNMENTS))}}))
    for index in range(30):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            candidate["future_transaction"]["assignment_ids"].append(f"A005SA-X{index:04d}")
            candidate["future_transaction"]["exact_assignment_count"] = 7
            return authority_rejects(candidate)
        add("atomic6_set_mutations", "negative", f"larger-{index:02d}", run)
    for index in range(30):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            position = index % 6
            candidate["future_transaction"]["assignment_ids"][position] = gate.ASSIGNMENTS[(position + 1) % 6]
            return authority_rejects(candidate)
        add("atomic6_set_mutations", "negative", f"duplicate-{index:02d}", run)
    for rotation in range(1, 7):
        def run(rotation=rotation) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            values = candidate["future_transaction"]["assignment_ids"]
            candidate["future_transaction"]["assignment_ids"] = values[rotation:] + values[:rotation]
            if rotation == 6:
                candidate["future_transaction"]["assignment_ids"] = values + ["A005SA-0016"]
            return authority_rejects(candidate)
        add("atomic6_set_mutations", "negative", f"rotation-{rotation}", run)
    for index in range(20):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            mutate_atomic_special(candidate, index)
            return authority_rejects(candidate)
        add("atomic6_set_mutations", "negative", f"contract-{index:02d}", run)
    assert sum(1 for category, _, _, _ in CASES if category == "atomic6_set_mutations") == 150


def register_feature_obligation_mutations() -> None:
    for index in range(50):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            candidate["future_transaction"]["feature_count"] = index
            return authority_rejects(candidate)
        add("feature_obligation_count_mutations", "negative", f"features-{index:02d}", run)
    for index in range(50):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            candidate["future_transaction"]["question_obligation_count"] = index
            return authority_rejects(candidate)
        add("feature_obligation_count_mutations", "negative", f"obligations-{index:02d}", run)


PREREQUISITE_VARIANTS = [
    "luna_required", "luna_state", "luna_path", "luna_model", "luna_effort", "luna_fresh", "luna_controller",
    "capture_required", "capture_state", "capture_path", "capture_author", "capture_bind_luna", "capture_bind_slots",
    "capture_null_ids", "capture_no_launch_claim", "capture_later_runtime_owner",
    "identities_missing", "identity_id", "identity_duplicate_path", "identity_model", "identity_effort", "identity_fork",
    "identity_fresh", "identity_state", "identity_thread", "identity_stale_path", "identity_order",
]


def mutate_prerequisite(candidate: dict[str, Any], variant: str, serial: int) -> None:
    luna = candidate["prerequisites"]["fresh_luna_prelaunch"]
    capture = candidate["prerequisites"]["controller_parent_native_capture"]
    row = candidate["future_sol_identities"][serial % 6]
    if variant == "luna_required": luna["required"] = False
    elif variant == "luna_state": luna["state"] = "present"
    elif variant == "luna_path": luna["path"] += ".foreign"
    elif variant == "luna_model": luna["model"] = "gpt-5.6-sol"
    elif variant == "luna_effort": luna["reasoning_effort"] = "high"
    elif variant == "luna_fresh": luna["fresh_direct_required"] = False
    elif variant == "luna_controller": luna["controller_identity_authority"] = True
    elif variant == "capture_required": capture["required"] = False
    elif variant == "capture_state": capture["state"] = "present"
    elif variant == "capture_path": capture["path"] += ".foreign"
    elif variant == "capture_author": capture["authored_by_role"] = "worker"
    elif variant == "capture_bind_luna": capture["must_bind_fresh_luna_native_identity_and_report"] = False
    elif variant == "capture_bind_slots": capture["must_bind_exact_six_reserved_unallocated_sol_slots_and_paths"] = False
    elif variant == "capture_null_ids": capture["must_observe_sol_native_child_ids_null"] = False
    elif variant == "capture_no_launch_claim": capture["must_not_claim_launched_sol_native_identities"] = False
    elif variant == "capture_later_runtime_owner": capture["later_activation_runtime_capture_owns_actual_six_sol_native_ids"] = False
    elif variant == "identities_missing": candidate["future_sol_identities"] = candidate["future_sol_identities"][:-1]
    elif variant == "identity_id": row["assignment_id"] = "A005SA-9999"
    elif variant == "identity_duplicate_path": row["canonical_agent_path"] = candidate["future_sol_identities"][(serial + 1) % 6]["canonical_agent_path"]
    elif variant == "identity_model": row["model"] = "gpt-5.6-luna"
    elif variant == "identity_effort": row["reasoning_effort"] = "max"
    elif variant == "identity_fork": row["fork_turns"] = "all"
    elif variant == "identity_fresh": row["fresh_direct_required"] = False
    elif variant == "identity_state": row["state"] = "allocated"
    elif variant == "identity_thread": row["native_child_thread_id"] = "019d-foreign"
    elif variant == "identity_stale_path": row["canonical_agent_path"] = "/root/sol_controller_v29"
    else: candidate["future_sol_identities"] = list(reversed(candidate["future_sol_identities"]))


def register_prerequisite_identity_mutations() -> None:
    for index in range(110):
        variant = PREREQUISITE_VARIANTS[index % len(PREREQUISITE_VARIANTS)]
        def run(index=index, variant=variant) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            mutate_prerequisite(candidate, variant, index)
            return authority_rejects(candidate)
        add("prerequisite_identity_mutations", "negative", f"{variant}-{index:03d}", run)


def register_runtime_mutations() -> None:
    keys = list(gate.RUNTIME)
    assert len(keys) == 8
    for key in keys:
        for index in range(10):
            def run(key=key, index=index) -> bool:
                candidate = copy.deepcopy(AUTHORITY)
                value = candidate["audit_runtime"][key]
                candidate["audit_runtime"][key] = (not value) if isinstance(value, bool) else f"{value}-drift-{index}"
                return authority_rejects(candidate)
            add("runtime_drift_mutations", "negative", f"{key}-{index:02d}", run)


def stable_symlink_case(live: bool) -> bool:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        target = root / "target.json"
        if live:
            target.write_text("{}\n", encoding="utf-8")
        link = root / "link.json"
        link.symlink_to(target)
        try:
            gate.stable_read(link)
        except (OSError, ValueError):
            return True
        return False


def stable_toctou_case(index: int) -> bool:
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / f"toctou-{index}.json"
        path.write_text('{"state":"before"}\n', encoding="utf-8")
        def mutate(target: Path) -> None:
            with target.open("ab") as handle:
                handle.write(b" ")
        try:
            gate.stable_read(path, mutate)
        except (OSError, ValueError):
            return True
        return False


def absence_injection_case(role: int, live: bool) -> bool:
    labels = ["prerequisite:luna-must-remain-absent", "prerequisite:capture-must-remain-absent", "target-transaction-must-remain-absent"]
    names = [gate.LUNA.name, gate.CAPTURE.name, gate.TARGET_TRANSACTION.name]
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        target = root / f"target-{role}"
        if live:
            target.write_text("present\n", encoding="utf-8")
        injected = root / names[role]
        injected.symlink_to(target)
        errors = gate.live_absence_errors({labels[role]: injected})
        state = "present_live_symlink" if live else "present_broken_symlink"
        return errors == [labels[role] + ":" + state]


def namespace_injection_case(kind: str, index: int) -> bool:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        validation = root / "validation"
        validation.mkdir()
        if kind == "broken_symlink":
            (root / f"foreign-{index}.json").symlink_to(root / "missing")
        elif kind == "directory":
            (root / f"foreign-dir-{index}").mkdir()
        elif kind == "fifo":
            os.mkfifo(root / f"foreign-fifo-{index}")
        else:
            (root / f"foreign-live-{index}").symlink_to(validation)
        result = gate.lexical_namespace_inventory(root, {validation})
        return result["violations"] != []


def hardlink_case() -> bool:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        source = root / "source.json"
        linked = root / "linked.json"
        source.write_text("{}\n", encoding="utf-8")
        os.link(source, linked)
        try:
            gate.stable_read(source)
        except ValueError as error:
            return str(error) == "multiply-linked"
        return False


def tree_nonregular_case(kind: str) -> bool:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        target = root / "target.json"
        if kind == "live_symlink":
            target.write_text("{}\n", encoding="utf-8")
            (root / "injected.json").symlink_to(target)
        elif kind == "broken_symlink":
            (root / "injected.json").symlink_to(target)
        else:
            os.mkfifo(root / "injected.json")
        try:
            gate.tree_inventory(root)
        except ValueError as error:
            return "inventory-nonregular:injected.json" in str(error)
        return False


def register_filesystem_mutations() -> None:
    for index in range(5):
        add("filesystem_symlink_toctou", "negative", f"stable-live-symlink-{index}", lambda: stable_symlink_case(True))
        add("filesystem_symlink_toctou", "negative", f"stable-broken-symlink-{index}", lambda: stable_symlink_case(False))
    for index in range(10):
        add("filesystem_symlink_toctou", "negative", f"toctou-{index}", lambda index=index: stable_toctou_case(index))
    for role, label in enumerate(("luna", "capture", "target")):
        add("filesystem_symlink_toctou", "negative", f"exact-{label}-live-symlink", lambda role=role: absence_injection_case(role, True))
        add("filesystem_symlink_toctou", "negative", f"exact-{label}-broken-symlink", lambda role=role: absence_injection_case(role, False))
    for index in range(4):
        add("filesystem_symlink_toctou", "negative", f"namespace-broken-symlink-{index}", lambda index=index: namespace_injection_case("broken_symlink", index))
    for index in range(4):
        add("filesystem_symlink_toctou", "negative", f"namespace-directory-{index}", lambda index=index: namespace_injection_case("directory", index))
    add("filesystem_symlink_toctou", "negative", "namespace-fifo", lambda: namespace_injection_case("fifo", 0))
    add("filesystem_symlink_toctou", "negative", "namespace-live-symlink", lambda: namespace_injection_case("live_symlink", 0))
    add("filesystem_symlink_toctou", "negative", "stable-hardlink", hardlink_case)
    add("filesystem_symlink_toctou", "negative", "tree-broken-symlink", lambda: tree_nonregular_case("broken_symlink"))
    add("filesystem_symlink_toctou", "negative", "tree-live-symlink", lambda: tree_nonregular_case("live_symlink"))
    add("filesystem_symlink_toctou", "negative", "tree-fifo", lambda: tree_nonregular_case("fifo"))
    assert sum(1 for category, _, _, _ in CASES if category == "filesystem_symlink_toctou") == 40


def foreign_dedup_case(index: int) -> bool:
    with tempfile.TemporaryDirectory() as directory:
        scope = Path(directory) / "cohort-0002"
        scope.mkdir()
        own = scope / gate.HERE.name
        own.mkdir()
        exact_target = scope / gate.TARGET_TRANSACTION.name
        if index == 0:
            exact_target.mkdir()
        elif index == 1:
            exact_target.symlink_to(scope / "missing")
        elif index == 2:
            backing = scope / "backing"
            backing.mkdir()
            exact_target.symlink_to(backing)
        elif index == 3:
            (scope / "foreign.json").write_text(json.dumps({"target_namespace": str(exact_target)}), encoding="utf-8")
        elif index == 4:
            (scope / "foreign.jsonl").write_text(json.dumps({"target_namespace": str(exact_target)}) + "\n", encoding="utf-8")
        elif 5 <= index < 15:
            (scope / f"attempt-0003-v32-terminal-exact6-{index}").mkdir()
        elif 15 <= index < 20:
            (scope / f"attempt-0003-v32-activation-prep-atomic6-{index}").symlink_to(scope / "missing")
        elif 20 <= index < 25:
            payload = {
                "status": "terminal_activation_preparation",
                "attempt3_authority_sha256": gate.ATTEMPT3_PINS["attempt3_authority"][1],
                "assignment_ids": gate.ASSIGNMENTS,
                "exact_assignment_count": 6,
            }
            (scope / f"semantic-{index}.json").write_text(json.dumps(payload), encoding="utf-8")
        else:
            (scope / f"untrusted-{index}.json").symlink_to(scope / "missing")
        result = gate.dedup_search(scope, own, exact_target)
        return gate.dedup_result_errors(result) != []


def register_dedup_mutations() -> None:
    for index in range(30):
        add("foreign_equivalent_dedup", "negative", f"foreign-{index:02d}", lambda index=index: foreign_dedup_case(index))


def mutate_leakage_authority(candidate: dict[str, Any], index: int) -> None:
    if index == 0:
        candidate["future_transaction"]["transaction_authorized"] = True
    elif index == 1:
        candidate["future_transaction"]["tool_execution_authorized"] = True
    elif index < 10:
        key = list(gate.ZERO_STATE)[index - 2]
        candidate["zero_state"][key] = True if isinstance(candidate["zero_state"][key], bool) else 1
    else:
        key = list(candidate["forbidden_artifact_counts"])[index - 10]
        candidate["forbidden_artifact_counts"][key] = 1


def mutate_leakage_seal(candidate: dict[str, Any], index: int) -> None:
    if index == 0: candidate["schema_version"] = "foreign"
    elif index == 1: candidate["status"] = "authorized"
    elif index == 2: candidate["preparation_authority_sha256"] = "0" * 64
    elif index == 3: candidate["target_namespace"] += "-foreign"
    elif index == 4: candidate["target_namespace_state"] = "present"
    elif index == 5: candidate["attempt3_authority_sha256"] = "0" * 64
    elif index == 6: candidate["pre_creation_dedup_result"]["equivalent_terminal_or_activation_prep_namespace_count"] = 1
    elif index == 7: candidate["audit_runtime"]["python_version"] = "3.13.0"
    elif index == 8: candidate["assignment_ids"] = candidate["assignment_ids"][:-1]
    elif index == 9: candidate["exact_assignment_count"] = 5
    elif index == 10: candidate["feature_count"] = 688
    elif index == 11: candidate["question_obligation_count"] = 714
    elif index == 12: candidate["transaction_authorized"] = True
    elif index == 13: candidate["tool_execution_authorized"] = True
    elif index == 14: candidate["activation"] = True
    elif index == 15: candidate["launch"] = True
    elif index == 16: candidate["tool_execution_count"] = 1
    elif index == 17: candidate["created_activation_files"] = 1
    elif index == 18: candidate["created_authorizations"] = 1
    elif index == 19: candidate["created_results"] = 1
    elif index == 20: candidate["created_receipts"] = 1
    elif index == 21: candidate["created_capture_artifacts"] = 1
    elif index == 22: candidate["created_checkpoints"] = 1
    elif index == 23: candidate["created_children"] = 1
    elif index == 24: candidate["credit"] = 1
    elif index == 25: candidate["future_preconditions"] = candidate["future_preconditions"][:-1]
    elif index == 26: candidate["source_bindings"]["verifier"]["raw_sha256"] = "0" * 64
    elif index == 27: candidate["source_bindings"]["tests"]["raw_sha256"] = "0" * 64
    elif index == 28: candidate["source_bindings"]["test_matrix"]["raw_sha256"] = "0" * 64
    else: candidate["actual_six_sol_native_ids_deferred_to_later_activation_runtime_capture"] = False


def register_authority_credit_leakage() -> None:
    for index in range(20):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(AUTHORITY)
            mutate_leakage_authority(candidate, index)
            return authority_rejects(candidate)
        add("authority_credit_leakage", "negative", f"authority-{index:02d}", run)
    for index in range(30):
        def run(index=index) -> bool:
            candidate = copy.deepcopy(SEAL)
            mutate_leakage_seal(candidate, index)
            return seal_rejects(candidate)
        add("authority_credit_leakage", "negative", f"tool-seal-{index:02d}", run)


def main() -> None:
    global AUTHORITY, SEAL, MATRIX
    AUTHORITY = gate.load(gate.AUTHORITY)
    SEAL = gate.load(gate.TOOL_SEAL)
    MATRIX = gate.load(gate.MATRIX)
    register_positive()
    register_upstream_pin_mutations()
    register_atomic6_set_mutations()
    register_feature_obligation_mutations()
    register_prerequisite_identity_mutations()
    register_runtime_mutations()
    register_filesystem_mutations()
    register_dedup_mutations()
    register_authority_credit_leakage()
    expected = {row["category"]: {"positive": row["positive"], "negative": row["negative"], "total": row["total"]} for row in MATRIX["categories"]}
    observed: dict[str, dict[str, int]] = {}
    for category, polarity, _, _ in CASES:
        row = observed.setdefault(category, {"positive": 0, "negative": 0, "total": 0})
        row[polarity] += 1
        row["total"] += 1
    registration_errors = []
    if len(CASES) != 900:
        registration_errors.append(f"registered:{len(CASES)}")
    if observed != expected:
        registration_errors.append("category-matrix-mismatch")
    case_ids = [case_id for _, _, case_id, _ in CASES]
    if len(case_ids) != len(set(case_ids)):
        registration_errors.append("duplicate-case-id")
    observed_digest = hashlib.sha256("\n".join(case_ids).encode("utf-8")).hexdigest()
    if observed_digest != MATRIX.get("expected_case_id_digest"):
        registration_errors.append("case-id-digest-mismatch")
    if observed != MATRIX.get("expected_category_counts"):
        registration_errors.append("expected-category-counts-mismatch")
    failures: list[dict[str, str]] = []
    for _, _, case_id, function in CASES:
        try:
            if function() is not True:
                failures.append({"case_id": case_id, "error": "returned-false"})
        except Exception as error:
            failures.append({"case_id": case_id, "error": type(error).__name__ + ":" + str(error)})
    failures.extend({"case_id": "registration", "error": error} for error in registration_errors)
    passed = len(CASES) - len([row for row in failures if row["case_id"] != "registration"])
    report = {
        "schema_version": "scenario-adversarial-branch-b-preparation-test-run-v1",
        "status": "pass" if not failures else "fail",
        "passed": passed,
        "total": len(CASES),
        "failed": len(failures),
        "positive": sum(1 for _, polarity, _, _ in CASES if polarity == "positive"),
        "negative": sum(1 for _, polarity, _, _ in CASES if polarity == "negative"),
        "case_id_digest": observed_digest,
        "category_counts": observed,
        "runtime": gate.runtime_snapshot(),
        "failures": failures,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
