#!/usr/bin/env python3
"""Large deterministic mutation suite for the exact-299 preparation gate."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import sys
import tempfile
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

sys.dont_write_bytecode = True

import verify_preparation as verify


HERE = Path(__file__).resolve().parent


def load_core_bundle() -> Tuple[Dict[str, Any], List[Dict[str, Any]], Dict[str, Any]]:
    _, expected_inventory = verify.source_inventory_rows([])
    expected_blockers = verify.make_blocker_inventory(verify.legacy_unresolved([]))
    core_hashes = {}
    for name in verify.CORE_FILES:
        data = verify.strict_read_bytes(HERE / name)
        core_hashes[name] = (len(data), verify.sha256_bytes(data))
    bundle = {
        "artifact_seal": verify.load_json(HERE / "ARTIFACT_SEAL.json"),
        "authority": verify.load_json(HERE / "authority.json"),
        "blockers": verify.load_json(HERE / "blocker_inventory.json"),
        "core_hashes": core_hashes,
        "inventory": verify.load_jsonl(HERE / "inventory_snapshot.jsonl"),
        "lineage": verify.load_json(HERE / "supersession_lineage.json"),
        "readiness": verify.load_json(HERE / "readiness.json"),
        "zero_state": verify.load_json(HERE / "zero_state.json"),
    }
    return bundle, expected_inventory, expected_blockers


def synthetic_test_report() -> Dict[str, Any]:
    return {
        "case_id_digest": "a" * 64,
        "failed": 0,
        "passed": 777,
        "total": 777,
        "valid_fixture_count": 3,
    }


def synthetic_terminal(artifact_seal_sha: str, test_report: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "artifact_seal_sha256": artifact_seal_sha,
        "audit_id": verify.AUDIT_ID,
        "authorizations": verify.false_authorizations(),
        "blocker_count": 7,
        "credit": 0,
        "exact_scope": {
            "content_state_sha256": verify.EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "predecessor_immutability": {
            "exact_inventory_tree_sha256": verify.EXACT_TREE_SHA256,
            "exact_inventory_unchanged": True,
            "stale_preparation_tree_sha256": verify.STALE_TREE_SHA256,
            "stale_preparation_unchanged": True,
        },
        "preparation_complete": True,
        "preparation_id": verify.PREPARATION_ID,
        "ready_for_activation": False,
        "schema_version": "audit005-exhaustive299-terminal-preparation-v32",
        "semantic_prose_reads": 0,
        "status": "PASS_PREPARATION_ONLY_BLOCKED_ZERO_CREDIT",
        "test_report": {
            "case_id_digest": test_report["case_id_digest"],
            "failed": 0,
            "passed": test_report["passed"],
            "sha256": verify.sha256_bytes(verify.canonical_bytes(test_report)),
            "total": test_report["total"],
            "valid_fixture_count": test_report["valid_fixture_count"],
        },
        "zero_state": verify.zero_state(),
    }


class Harness:
    def __init__(self) -> None:
        self.case_ids: List[str] = []
        self.failures: List[str] = []
        self.classes: Dict[str, int] = {}
        self.valid_fixture_count = 0

    def _record(self, case_id: str, class_name: str, passed: bool, detail: str = "") -> None:
        self.case_ids.append(case_id)
        self.classes[class_name] = self.classes.get(class_name, 0) + 1
        if not passed:
            self.failures.append(f"{case_id}: {detail}")

    def valid(self, case_id: str, class_name: str, fn: Callable[[], None]) -> None:
        try:
            fn()
        except Exception as exc:
            self._record(case_id, class_name, False, f"valid fixture rejected: {exc}")
        else:
            self.valid_fixture_count += 1
            self._record(case_id, class_name, True)

    def reject(self, case_id: str, class_name: str, fn: Callable[[], None]) -> None:
        try:
            fn()
        except verify.ValidationError:
            self._record(case_id, class_name, True)
        except Exception as exc:
            self._record(case_id, class_name, False, f"unexpected exception: {type(exc).__name__}: {exc}")
        else:
            self._record(case_id, class_name, False, "mutation was accepted")


def run_suite() -> Dict[str, Any]:
    h = Harness()
    baseline, expected_inventory, expected_blockers = load_core_bundle()

    def validate_model(value: Dict[str, Any]) -> None:
        verify.validate_bundle_model(value, expected_inventory, expected_blockers)

    h.valid("valid-actual-core", "valid_fixture", lambda: validate_model(copy.deepcopy(baseline)))
    h.valid(
        "valid-json-roundtrip",
        "valid_fixture",
        lambda: validate_model(json.loads(json.dumps(baseline))),
    )
    h.valid(
        "valid-filesystem-core",
        "valid_fixture",
        lambda: verify.verify_filesystem(require_terminal=False, trace=[]),
    )

    # Exhaustive member-by-member negatives.  Each mutation is a distinct
    # concrete path/hash/category omission or corruption.
    for index in range(299):
        mutated = copy.deepcopy(baseline)
        del mutated["inventory"][index]
        h.reject(f"inventory-drop-{index + 1:03d}", "inventory_dropped_member", lambda m=mutated: validate_model(m))

        mutated = copy.deepcopy(baseline)
        mutated["inventory"][index]["sha256"] = hashlib.sha256(
            f"substitute-hash-{index}".encode("utf-8")
        ).hexdigest()
        h.reject(f"inventory-hash-{index + 1:03d}", "inventory_hash_substitution", lambda m=mutated: validate_model(m))

        mutated = copy.deepcopy(baseline)
        old = mutated["inventory"][index]["category"]
        mutated["inventory"][index]["category"] = (
            "generated_governance_integrity_join" if old == "semantic_document" else "semantic_document"
        )
        h.reject(
            f"inventory-category-{index + 1:03d}",
            "semantic_generated_misclassification",
            lambda m=mutated: validate_model(m),
        )

    for index in range(298):
        mutated = copy.deepcopy(baseline)
        mutated["inventory"][index], mutated["inventory"][index + 1] = (
            mutated["inventory"][index + 1],
            mutated["inventory"][index],
        )
        h.reject(f"inventory-reorder-{index + 1:03d}", "inventory_reordered", lambda m=mutated: validate_model(m))

    for index in range(64):
        mutated = copy.deepcopy(baseline)
        duplicate = copy.deepcopy(mutated["inventory"][index])
        duplicate["ordinal"] = 300
        mutated["inventory"].append(duplicate)
        h.reject(f"inventory-duplicate-{index + 1:03d}", "inventory_duplicate_member", lambda m=mutated: validate_model(m))

        mutated = copy.deepcopy(baseline)
        extra = {
            "category": "generated_governance_integrity_join",
            "ordinal": 300,
            "path": f"Plans/.generated/forbidden-added-{index:03d}.json",
            "sha256": hashlib.sha256(f"added-{index}".encode()).hexdigest(),
        }
        mutated["inventory"].append(extra)
        h.reject(f"inventory-add-{index + 1:03d}", "inventory_added_member", lambda m=mutated: validate_model(m))

        mutated = copy.deepcopy(baseline)
        mutated["inventory"][index]["path"] = f"Plans/substituted-{index:03d}.json"
        h.reject(f"inventory-path-{index + 1:03d}", "inventory_path_substitution", lambda m=mutated: validate_model(m))

    # Content-state and predecessor authority drift.
    content_mutators = [
        lambda m: m["authority"]["future_aggregate_scope"].__setitem__("content_state_sha256", "0" * 64),
        lambda m: m["authority"]["bindings"].__setitem__("exact_content_state_sha256", "0" * 64),
        lambda m: m["lineage"]["active_scope_authority"].__setitem__("content_state_sha256", "0" * 64),
        lambda m: m["lineage"]["active_scope_authority"].__setitem__("artifact_seal_sha256", "0" * 64),
        lambda m: m["lineage"]["active_scope_authority"].__setitem__("terminal_sha256", "0" * 64),
        lambda m: m["lineage"]["active_scope_authority"].__setitem__("namespace_tree_sha256", "0" * 64),
        lambda m: m["lineage"]["stale_predecessor"].__setitem__("namespace_tree_sha256", "0" * 64),
        lambda m: m["lineage"]["stale_predecessor"].__setitem__("scope_authority_usable", True),
        lambda m: m["lineage"].__setitem__("predecessor_bytes_preserved", False),
        lambda m: m["readiness"]["exact_scope"].__setitem__("content_state_sha256", "0" * 64),
    ]
    for index, mutate in enumerate(content_mutators, 1):
        mutated = copy.deepcopy(baseline)
        mutate(mutated)
        h.reject(f"content-state-drift-{index:02d}", "content_state_or_predecessor_drift", lambda m=mutated: validate_model(m))

    # Every core seal member receives a concrete digest mutation.
    for index, _ in enumerate(verify.CORE_FILES):
        mutated = copy.deepcopy(baseline)
        mutated["artifact_seal"]["files"][index]["sha256"] = "f" * 64
        h.reject(f"artifact-seal-drift-{index + 1:02d}", "artifact_seal_drift", lambda m=mutated: validate_model(m))

    # Stale-15 leakage is rejected everywhere except the explicitly typed,
    # non-authoritative predecessor lineage field.
    stale_mutators = [
        lambda m: m["authority"].__setitem__("legacy_live_head_member_count", 15),
        lambda m: m["authority"]["future_aggregate_scope"].__setitem__("member_count", 15),
        lambda m: m["readiness"]["exact_scope"].__setitem__("member_count", 15),
        lambda m: m["lineage"]["active_scope_authority"].__setitem__("member_count", 15),
        lambda m: m["lineage"]["stale_predecessor"].__setitem__("stale_membership_carried_forward", True),
        lambda m: m["blockers"]["blockers"][0]["current_facts"].__setitem__("member_count", 15),
        lambda m: m["zero_state"].__setitem__("stale_live_head_scope", 15),
    ]
    for index, mutate in enumerate(stale_mutators, 1):
        mutated = copy.deepcopy(baseline)
        mutate(mutated)
        h.reject(f"stale15-leakage-field-{index:02d}", "stale15_leakage", lambda m=mutated: validate_model(m))
    for index in range(15):
        mutated = copy.deepcopy(baseline)
        rotated = mutated["inventory"][index:index + 15]
        mutated["inventory"] = rotated
        h.reject(f"stale15-leakage-members-{index + 1:02d}", "stale15_leakage", lambda m=mutated: validate_model(m))

    # Preserve all seven blocker identities, labels, state, facts, and evidence.
    for index in range(7):
        mutated = copy.deepcopy(baseline)
        del mutated["blockers"]["blockers"][index]
        h.reject(f"blocker-remove-{index + 1}", "blocker_removal", lambda m=mutated: validate_model(m))
        for field in ["blocker_id", "lane_id", "state", "satisfaction_condition", "current_state_note"]:
            mutated = copy.deepcopy(baseline)
            mutated["blockers"]["blockers"][index][field] += "-RELABELLED"
            h.reject(
                f"blocker-relabel-{index + 1}-{field}",
                "blocker_relabel",
                lambda m=mutated: validate_model(m),
            )
        mutated = copy.deepcopy(baseline)
        mutated["blockers"]["blockers"][index]["current_evidence"] = []
        h.reject(f"blocker-evidence-drop-{index + 1}", "blocker_evidence_removal", lambda m=mutated: validate_model(m))

    # Each forbidden authority and each zero counter is independently mutated.
    for name in verify.PROHIBITIONS:
        mutated = copy.deepcopy(baseline)
        mutated["authority"]["authorizations"][name] = True
        h.reject(f"authority-leak-{name}", "authority_leakage", lambda m=mutated: validate_model(m))
    for name in verify.ZERO_COUNTERS:
        mutated = copy.deepcopy(baseline)
        mutated["authority"]["zero_state"][name] = 1
        h.reject(f"zero-state-leak-{name}", "zero_state_leakage", lambda m=mutated: validate_model(m))
    for field, value in [("credit", 1), ("ready", True), ("preparation_only", False), ("append_only", False)]:
        mutated = copy.deepcopy(baseline)
        mutated["authority"][field] = value
        h.reject(f"authority-field-leak-{field}", "authority_leakage", lambda m=mutated: validate_model(m))

    # Synthetic terminal is first accepted, then each terminal binding and
    # every forbidden authorization/counter is mutated independently.
    fake_report = synthetic_test_report()
    artifact_seal_sha = verify.file_sha256(HERE / "ARTIFACT_SEAL.json")
    terminal = synthetic_terminal(artifact_seal_sha, fake_report)
    h.valid(
        "valid-synthetic-terminal",
        "valid_fixture",
        lambda: verify.validate_terminal(copy.deepcopy(terminal), artifact_seal_sha, copy.deepcopy(fake_report)),
    )
    terminal_mutators = [
        lambda t: t.__setitem__("artifact_seal_sha256", "0" * 64),
        lambda t: t.__setitem__("credit", 1),
        lambda t: t.__setitem__("ready_for_activation", True),
        lambda t: t.__setitem__("semantic_prose_reads", 1),
        lambda t: t.__setitem__("blocker_count", 6),
        lambda t: t["exact_scope"].__setitem__("content_state_sha256", "0" * 64),
        lambda t: t["exact_scope"].__setitem__("member_count", 15),
        lambda t: t["exact_scope"].__setitem__("semantic_document_count", 4),
        lambda t: t["exact_scope"].__setitem__("generated_governance_integrity_join_count", 295),
        lambda t: t["predecessor_immutability"].__setitem__("stale_preparation_unchanged", False),
        lambda t: t["predecessor_immutability"].__setitem__("exact_inventory_unchanged", False),
        lambda t: t["predecessor_immutability"].__setitem__("stale_preparation_tree_sha256", "0" * 64),
        lambda t: t["predecessor_immutability"].__setitem__("exact_inventory_tree_sha256", "0" * 64),
        lambda t: t["test_report"].__setitem__("total", 499),
        lambda t: t["test_report"].__setitem__("sha256", "0" * 64),
    ]
    for index, mutate in enumerate(terminal_mutators, 1):
        changed = copy.deepcopy(terminal)
        mutate(changed)
        h.reject(
            f"terminal-drift-{index:02d}",
            "terminal_drift",
            lambda t=changed: verify.validate_terminal(t, artifact_seal_sha, fake_report),
        )
    for name in verify.PROHIBITIONS:
        changed = copy.deepcopy(terminal)
        changed["authorizations"][name] = True
        h.reject(
            f"terminal-authority-{name}",
            "terminal_authority_leakage",
            lambda t=changed: verify.validate_terminal(t, artifact_seal_sha, fake_report),
        )
    for name in verify.ZERO_COUNTERS:
        changed = copy.deepcopy(terminal)
        changed["zero_state"][name] = 1
        h.reject(
            f"terminal-zero-{name}",
            "terminal_zero_state_leakage",
            lambda t=changed: verify.validate_terminal(t, artifact_seal_sha, fake_report),
        )

    # Real filesystem safety tests: regular file valid; final-component
    # symlink, hardlink, directory, FIFO, socket, and two TOCTOU patterns fail.
    with tempfile.TemporaryDirectory(prefix="audit005-exhaustive299-tests-") as temp_name:
        temp = Path(temp_name)
        regular = temp / "regular.json"
        regular.write_bytes(b"{}\n")
        h.valid("filesystem-regular", "filesystem_valid_fixture", lambda: verify.strict_read_bytes(regular))

        symlink = temp / "symlink.json"
        symlink.symlink_to(regular.name)
        h.reject("filesystem-symlink", "filesystem_symlink", lambda: verify.strict_read_bytes(symlink))

        hardlink = temp / "hardlink.json"
        os.link(regular, hardlink)
        h.reject("filesystem-hardlink", "filesystem_multilink", lambda: verify.strict_read_bytes(regular))
        hardlink.unlink()

        directory = temp / "directory"
        directory.mkdir()
        h.reject("filesystem-directory", "filesystem_nonregular", lambda: verify.strict_read_bytes(directory))

        fifo = temp / "fifo"
        os.mkfifo(fifo)
        h.reject("filesystem-fifo", "filesystem_nonregular", lambda: verify.strict_read_bytes(fifo))

        socket_path = temp / "socket"
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        try:
            sock.bind(str(socket_path))
            h.reject("filesystem-socket", "filesystem_nonregular", lambda: verify.strict_read_bytes(socket_path))
        finally:
            sock.close()

        replace_path = temp / "replace.json"
        replace_path.write_bytes(b"before\n")
        replacement = temp / "replacement.json"
        replacement.write_bytes(b"after\n")
        def replace_hook() -> None:
            replacement.replace(replace_path)
        h.reject(
            "filesystem-toctou-replace",
            "filesystem_toctou",
            lambda: verify.strict_read_bytes(replace_path, after_open_hook=replace_hook),
        )

        mutate_path = temp / "mutate.json"
        mutate_path.write_bytes(b"before\n")
        h.reject(
            "filesystem-toctou-inplace",
            "filesystem_toctou",
            lambda: verify.strict_read_bytes(
                mutate_path,
                after_open_hook=lambda: mutate_path.write_bytes(b"substantially-different-after-open\n"),
            ),
        )

        # End-to-end evidence reference must retain the lexical final path so
        # a same-byte symlink replacement is rejected, not normalized away.
        fake_project = temp / "project"
        evidence_dir = fake_project / "Plans/.audits/fake"
        evidence_dir.mkdir(parents=True)
        real_evidence = evidence_dir / "real.json"
        real_evidence.write_bytes(b"{\"safe\":true}\n")
        symlink_evidence = evidence_dir / "evidence.json"
        symlink_evidence.symlink_to(real_evidence.name)
        evidence = {
            "ref": "Plans/.audits/fake/evidence.json",
            "sha256": verify.sha256_bytes(real_evidence.read_bytes()),
        }
        h.reject(
            "filesystem-evidence-ref-symlink",
            "filesystem_evidence_symlink",
            lambda: verify.verify_evidence_ref(evidence, project_root=fake_project),
        )

    # The real core verifier returns a read trace; it must never include any
    # of the 299 member files or any canonical Plans markdown prose.
    trace: List[str] = []
    try:
        verify.verify_filesystem(require_terminal=False, trace=trace)
        member_paths = {str((verify.PROJECT_ROOT / row["path"]).resolve()) for row in expected_inventory}
        forbidden = [path for path in trace if path in member_paths or (path.endswith(".md") and "/Plans/" in path)]
        if forbidden:
            raise verify.ValidationError(f"forbidden prose/member reads: {forbidden}")
    except Exception as exc:
        h._record("read-policy-no-prose", "no_prose_read", False, str(exc))
    else:
        h.valid_fixture_count += 1
        h._record("read-policy-no-prose", "no_prose_read", True)

    total = len(h.case_ids)
    failed = len(h.failures)
    report = {
        "case_id_digest": verify.sha256_bytes(("\n".join(h.case_ids) + "\n").encode("utf-8")),
        "failed": failed,
        "failures": h.failures,
        "fail_closed_mutation_count": total - h.valid_fixture_count,
        "mutation_classes": dict(sorted(h.classes.items())),
        "passed": total - failed,
        "schema_version": "audit005-exhaustive299-test-report-v32",
        "status": "PASS" if failed == 0 else "FAIL_CLOSED",
        "total": total,
        "valid_fixture_count": h.valid_fixture_count,
    }
    return report


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", type=Path)
    args = parser.parse_args(argv)
    report = run_suite()
    if args.write_report is not None:
        target = args.write_report
        if not target.is_absolute():
            target = HERE / target
        target.write_bytes(verify.canonical_bytes(report))
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0 if report["failed"] == 0 and report["total"] >= 500 else 1


if __name__ == "__main__":
    raise SystemExit(main())
