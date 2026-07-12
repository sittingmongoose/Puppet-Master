#!/usr/bin/env python3
"""Executable mutation suite for the append-only 0002 source-scope binding."""
from __future__ import annotations

import copy
import hashlib
import json
import pathlib
import sys

sys.dont_write_bytecode = True
import verify_source_scope_binding as verifier


def clone(bundle):
    return copy.deepcopy(bundle)


def main() -> None:
    base = verifier.load_bundle()
    outcomes: dict[str, bool] = {}
    categories: dict[str, int] = {}

    def record(category: str, name: str, passed: bool) -> None:
        outcomes[f"{category}:{name}"] = bool(passed)
        categories[category] = categories.get(category, 0) + 1

    def has(bundle, prefix: str) -> bool:
        return any(error == prefix or error.startswith(prefix) for error in verifier.validation_errors(bundle))

    record("positive", "valid-binding", verifier.validation_errors(base) == [])
    gate = verifier.future_prewrite_gate(base, mkdir=lambda *_: (_ for _ in ()).throw(AssertionError("mkdir called")), write=lambda *_: (_ for _ in ()).throw(AssertionError("write called")))
    record("positive", "blocked-prewrite-no-callback", gate["binding_valid"] and not gate["prewrite_authorized"] and gate["mkdir_calls"] == gate["write_calls"] == 0)
    observed = verifier.metrics(base["raw_by_ref"][base["binding"]["source_scope"]["ref"]])
    record("positive", "exact-135", observed["row_count"] == observed["unique_path_count"] == observed["unique_source_id_count"] == 135)
    record("positive", "old-failure-preserved", base["binding"]["supersedes_binding_only"]["preserved_failure"] == "source-scope-drift")

    source_ref = base["binding"]["source_scope"]["ref"]
    original = base["raw_by_ref"][source_ref]
    mutable_positions = [index for index, byte in enumerate(original) if byte not in (10, 13)]
    for index in range(32):
        bundle = clone(base)
        data = bytearray(original)
        position = mutable_positions[index * len(mutable_positions) // 32]
        data[position] = 65 if data[position] != 65 else 66
        bundle["raw_by_ref"][source_ref] = bytes(data)
        record("byte-drift", f"{index:02d}", has(bundle, "source-byte-drift"))

    lines = original.splitlines(keepends=True)
    for index in range(16):
        bundle = clone(base)
        bundle["raw_by_ref"][source_ref] = b"".join(lines[:index] + lines[index + 1:])
        record("row-drop", f"{index:02d}", has(bundle, "source-metric:row_count"))
        bundle = clone(base)
        bundle["raw_by_ref"][source_ref] = b"".join(lines[:index] + [lines[index], lines[index]] + lines[index + 1:])
        record("row-duplicate", f"{index:02d}", has(bundle, "source-metric:row_count"))

    for index in range(16):
        bundle = clone(base)
        reordered = list(lines)
        left = index * 2
        reordered[left], reordered[left + 1] = reordered[left + 1], reordered[left]
        bundle["raw_by_ref"][source_ref] = b"".join(reordered)
        errors = verifier.validation_errors(bundle)
        record("order-drift", f"{index:02d}", "source-byte-drift" in errors and not any(error.startswith("source-path-sorted-drift") for error in errors))

    lf_mutations = [original[:-1], original.replace(b"\n", b"\r\n", 1), original.replace(b"\n", b"", 1)]
    for index, data in enumerate(lf_mutations):
        bundle = clone(base)
        bundle["raw_by_ref"][source_ref] = data
        record("lf-drift", f"{index:02d}", has(bundle, "source-jsonl") or has(bundle, "source-metric:terminal_lf") or has(bundle, "source-metric:carriage_return_count"))

    for index in range(12):
        bundle = clone(base)
        row = json.loads(lines[index])
        row["path"] = row["path"] + f".mutated-{index}"
        changed = verifier.canonical_row(row)
        bundle["raw_by_ref"][source_ref] = b"".join(lines[:index] + [changed] + lines[index + 1:])
        record("path-drift", f"{index:02d}", has(bundle, "source-path-sorted-drift") and has(bundle, "source-path-row-drift"))

    for field in ("raw_sha256", "canonical_lines_sha256"):
        bundle = clone(base)
        bundle["binding"]["source_scope"][field] = verifier.OLD_SHA
        record("old-pin-substitution", field, has(bundle, "old-pin-substitution"))
    for index in range(17):
        bundle = clone(base)
        ref = bundle["binding"]["stable_copy_refs"][index]
        data = bytearray(bundle["raw_by_ref"][ref])
        data[index] = 65 if data[index] != 65 else 66
        bundle["raw_by_ref"][ref] = bytes(data)
        record("stable-copy-drift", f"{index:02d}", has(bundle, "stable-copy-byte-drift"))

    for key in verifier.ZERO:
        bundle = clone(base)
        bundle["binding"]["zero_state"][key] = 1
        record("state-leak", "binding-" + key, has(bundle, "binding-zero-state"))
        bundle = clone(base)
        bundle["receipt"]["zero_state"][key] = 1
        record("state-leak", "receipt-" + key, has(bundle, "receipt-zero-state"))
    for key in base["binding"]["future_preparation"]:
        if key == "mode":
            continue
        bundle = clone(base)
        bundle["binding"]["future_preparation"][key] = True
        record("authorization-leak", key, has(bundle, "authorization-leak"))

    bundle = clone(base)
    bundle["symlink_flags"][source_ref] = True
    record("symlink", "source", has(bundle, "symlink-input"))
    bundle = clone(base)
    bundle["binding"]["source_scope"]["ref"] = "Plans/Planning_Wizard.md"
    record("ref-drift", "canonical-source-ref", has(bundle, "source-ref"))

    canonical_refs = [
        "Plans/Planning_Wizard.md",
        "Plans/PRD_Builder.md",
        "Plans/FinalGUISpec.md",
        "Plans/00-plans-index.md",
        "Plans/bootstrap/Bootstrap_Planning_Workflow.md",
        str(verifier.REPO / "Plans/Planning_Wizard.md"),
        (verifier.AUDIT_REL / "../../Planning_Wizard.md").as_posix(),
    ]
    for index, ref in enumerate(canonical_refs):
        reached_reader = False
        def forbidden_reader(_path: pathlib.Path) -> bytes:
            nonlocal reached_reader
            reached_reader = True
            return b""
        try:
            verifier.guarded_read(ref, {ref}, reader=forbidden_reader)
            rejected = False
        except verifier.AccessPolicyViolation:
            rejected = True
        record("canonical-access-prohibition", f"{index:02d}", rejected and not reached_reader)

    for index, ref in enumerate(base["binding"]["protected_parent_files"]):
        bundle = clone(base)
        data = bytearray(bundle["raw_by_ref"][ref])
        data[index] = 65 if data[index] != 65 else 66
        bundle["raw_by_ref"][ref] = bytes(data)
        record("protected-parent", f"{index:02d}", has(bundle, "protected-parent-drift"))

    failed = sorted(name for name, passed in outcomes.items() if not passed)
    report = {
        "status": "pass" if not failed else "fail_closed",
        "control_status": verifier.STATUS,
        "total": len(outcomes),
        "passed": sum(outcomes.values()),
        "failed": failed,
        "categories": categories,
        "test_digest": hashlib.sha256(json.dumps(outcomes, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "future_prewrite_authorized": False,
        "zero_state": verifier.ZERO,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failed else 1)


if __name__ == "__main__":
    main()
