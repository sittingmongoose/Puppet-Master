#!/usr/bin/env python3
"""Strong fail-closed mutation tests for final aggregate closure preparation."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import pathlib
from typing import Any, Callable

from jsonschema import Draft202012Validator

import verify_final_aggregate_closure_prep as verifier


HERE = pathlib.Path(__file__).resolve().parent


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def set_nested(obj: dict[str, Any], path: tuple[str, ...], value: Any) -> None:
    cursor = obj
    for key in path[:-1]:
        cursor = cursor[key]
    cursor[path[-1]] = value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", action="store_true")
    args = parser.parse_args()
    bundle = verifier.load_bundle()
    base = bundle["manifest"]
    checks: dict[str, bool] = {
        "valid:static-bundle": not verifier.static_errors(bundle),
        "valid:blocked-candidate": not verifier.manifest_errors(base, bundle),
    }

    def mutate_path(path: tuple[str, ...], factory: Callable[[int], Any]) -> Callable[[dict[str, Any], int], None]:
        return lambda item, n: set_nested(item, path, factory(n))

    mutations: list[Callable[[dict[str, Any], int], None]] = [
        mutate_path(("audit_id",), lambda n: f"foreign-{n}"),
        mutate_path(("manifest_kind",), lambda n: "terminal_audit_closure"),
        mutate_path(("status",), lambda n: "PASS_CERTIFIED"),
        mutate_path(("closure_authorized",), lambda n: True),
        mutate_path(("issued",), lambda n: True),
        mutate_path(("authority", "ref"), lambda n: f"foreign/{n}.json"),
        mutate_path(("authority", "sha256"), lambda n: f"{n % 16:x}" * 64),
        mutate_path(("pointer_taxonomy", "legacy", "authority_type"), lambda n: f"foreign-{n}"),
        mutate_path(("pointer_taxonomy", "legacy", "disposition"), lambda n: f"current-{n}"),
        mutate_path(("pointer_taxonomy", "legacy", "credited_assignments"), lambda n: 64 + n),
        mutate_path(("pointer_taxonomy", "legacy", "assignment_total"), lambda n: 2539 + n),
        mutate_path(("pointer_taxonomy", "legacy", "pending_assignments"), lambda n: 2474 - n),
        mutate_path(("pointer_taxonomy", "legacy", "mutated"), lambda n: True),
        mutate_path(("pointer_taxonomy", "legacy", "ref"), lambda n: f"foreign/legacy-{n}.json"),
        mutate_path(("pointer_taxonomy", "legacy", "sha256"), lambda n: "0" * 64),
        mutate_path(("pointer_taxonomy", "frozen_macro", "status"), lambda n: f"incomplete-{n}"),
        mutate_path(("pointer_taxonomy", "frozen_macro", "covered_micro_windows"), lambda n: 1268 - n),
        mutate_path(("pointer_taxonomy", "frozen_macro", "micro_window_total"), lambda n: 1270 + n),
        mutate_path(("pointer_taxonomy", "frozen_macro", "credited_macro_assignments"), lambda n: 255 - n),
        mutate_path(("pointer_taxonomy", "frozen_macro", "active_sha256"), lambda n: "1" * 64),
        mutate_path(("pointer_taxonomy", "frozen_macro", "coverage_sha256"), lambda n: "2" * 64),
        mutate_path(("pointer_taxonomy", "frozen_macro", "source_scope_sha256"), lambda n: "3" * 64),
        mutate_path(("pointer_taxonomy", "current_live_head", "status"), lambda n: "delta_certified"),
        mutate_path(("pointer_taxonomy", "current_live_head", "source_scope_rows"), lambda n: 134 - n),
        mutate_path(("pointer_taxonomy", "current_live_head", "changed_canonical_count"), lambda n: 4 + n),
        mutate_path(("pointer_taxonomy", "current_live_head", "derived_integrity_count"), lambda n: 11 - n),
        mutate_path(("pointer_taxonomy", "current_live_head", "observation_ref"), lambda n: f"foreign/live-{n}.json"),
        mutate_path(("pointer_taxonomy", "current_live_head", "observation_sha256"), lambda n: "4" * 64),
        lambda item, n: item["pointer_taxonomy"]["current_live_head"]["changed_canonical_paths"].pop(n % 3),
        lambda item, n: item["pointer_taxonomy"]["current_live_head"]["changed_canonical_paths"].__setitem__(n % 3, f"Plans/Foreign-{n}.md"),
        lambda item, n: item["lane_checkpoints"].pop(n % len(item["lane_checkpoints"])),
        lambda item, n: item["lane_checkpoints"].append(copy.deepcopy(item["lane_checkpoints"][n % len(item["lane_checkpoints"])])),
        lambda item, n: item["lane_checkpoints"][n % len(item["lane_checkpoints"])].update(lane_id=f"foreign_lane_{n}"),
        lambda item, n: item["lane_checkpoints"][n % len(item["lane_checkpoints"])].update(status="satisfied" if item["lane_checkpoints"][n % len(item["lane_checkpoints"])]["status"] == "blocking" else "blocking"),
        lambda item, n: item["lane_checkpoints"][n % len(item["lane_checkpoints"])].update(aggregate_credit_granted=n + 1),
        lambda item, n: item["lane_checkpoints"][n % len(item["lane_checkpoints"])]["evidence"][0].update(sha256="5" * 64),
        mutate_path(("unresolved", "count"), lambda n: 8 + n),
        lambda item, n: item["unresolved"]["blocker_ids"].pop(n % len(item["unresolved"]["blocker_ids"])),
        lambda item, n: item["unresolved"]["blocker_ids"].append(item["unresolved"]["blocker_ids"][0]),
        lambda item, n: item["unresolved"]["blocker_ids"].__setitem__(n % len(item["unresolved"]["blocker_ids"]), f"FOREIGN-{n}"),
        mutate_path(("unresolved", "inventory_ref"), lambda n: f"foreign/unresolved-{n}.json"),
        mutate_path(("unresolved", "inventory_sha256"), lambda n: "6" * 64),
        mutate_path(("no_canonical_write", "attested"), lambda n: False),
        mutate_path(("no_canonical_write", "canonical_plan_writes"), lambda n: n + 1),
        mutate_path(("no_canonical_write", "attestation_ref"), lambda n: f"foreign/write-{n}.json"),
        mutate_path(("no_canonical_write", "attestation_sha256"), lambda n: "7" * 64),
        mutate_path(("independent_checkpoint", "present"), lambda n: True),
        mutate_path(("independent_checkpoint", "checkpoint"), lambda n: {"ref": f"fake/{n}", "sha256": "8" * 64}),
        mutate_path(("independent_checkpoint", "status"), lambda n: "PASS"),
        mutate_path(("independent_checkpoint", "fresh_direct"), lambda n: True),
        mutate_path(("independent_checkpoint", "model"), lambda n: "gpt-5.6-luna"),
        mutate_path(("independent_checkpoint", "reasoning_effort"), lambda n: "max"),
        lambda item, n: item["preparation_only_lineage"][n % 2].update(sha256="9" * 64),
        lambda item, n: item["preparation_only_lineage"][n % 2].update(classification=f"closure-{n}"),
        mutate_path(("current_pacing_policy", "current", "sha256"), lambda n: "a" * 64),
        mutate_path(("current_pacing_policy", "prior_lineage", "sha256"), lambda n: "b" * 64),
        mutate_path(("current_pacing_policy", "sealed"), lambda n: True),
        mutate_path(("current_pacing_policy", "seal_evidence"), lambda n: {"ref": f"fake/seal-{n}", "sha256": "c" * 64}),
        mutate_path(("current_pacing_policy", "prior_lineage_mutated"), lambda n: True),
        mutate_path(("durable_hash_bundle", "bundle_root_sha256"), lambda n: "d" * 64),
        lambda item, n: item["zero_state"].__setitem__(list(item["zero_state"])[n % len(item["zero_state"])], n + 1),
        lambda item, n: item.update(extra_field=f"forbidden-{n}"),
        lambda item, n: item.pop(list(item)[n % len(item)]),
    ]

    for mutation_index, mutation in enumerate(mutations):
        for variant in range(32):
            instance = copy.deepcopy(base)
            mutation(instance, variant)
            checks[f"negative:{mutation_index:02d}:{variant:02d}"] = bool(verifier.manifest_errors(instance, bundle))

    terminal = copy.deepcopy(base)
    terminal.update(manifest_kind="terminal_audit_closure", status="PASS_CERTIFIED", closure_authorized=True, issued=True)
    terminal["unresolved"] = {**terminal["unresolved"], "count": 0, "blocker_ids": []}
    terminal["pointer_taxonomy"]["current_live_head"].update(status="delta_certified", delta_certification={"ref": "future/delta.json", "sha256": "e" * 64})
    terminal["independent_checkpoint"] = {"present": True, "checkpoint": {"ref": "future/checkpoint.json", "sha256": "f" * 64}, "status": "PASS", "fresh_direct": True, "model": "gpt-5.6-luna", "reasoning_effort": "max"}
    terminal["current_pacing_policy"].update(sealed=True, seal_evidence={"ref": "future/v32-seal.json", "sha256": "1" * 64})
    terminal["durable_hash_bundle"]["bundle_root_sha256"] = "2" * 64
    for lane in terminal["lane_checkpoints"]:
        if lane["closure_gate"]:
            lane["status"] = "satisfied"
    checks["valid-schema:future-terminal-shape"] = not list(Draft202012Validator(verifier.load("closure_manifest.schema.json")).iter_errors(terminal))

    checkpoint = {
        "schema_version": "audit005-final-aggregate-independent-checkpoint-v1",
        "audit_id": verifier.AUDIT_ID,
        "status": "PASS",
        "reviewer": {"reviewer_id": "future-luna", "agent_path": "/root/future_luna_terminal", "native_thread_id": "future-thread", "model": "gpt-5.6-luna", "reasoning_effort": "max", "fresh_direct": True, "fork_turns": "none", "descendants": 0, "followups": 0, "retries": 0},
        "manifest": {"ref": "future/closure.json", "sha256": "3" * 64},
        "hash_bundle": {"ref": "future/hashes.json", "raw_sha256": "4" * 64, "bundle_root_sha256": "5" * 64},
        "recomputed": {"legacy_supersession_valid": True, "frozen_macro_complete": True, "current_live_head_delta_certified": True, "all_closure_gates_satisfied": True, "current_pacing_policy_sealed": True, "unresolved_count": 0, "blocker_ids": [], "hash_errors": [], "schema_errors": []},
        "side_effects": {"launches": 0, "activations": 0, "result_writes": 0, "receipt_writes": 0, "native_capture_writes": 0, "credit_side_effects": 0, "canonical_plan_writes": 0},
    }
    checkpoint_validator = Draft202012Validator(verifier.load("aggregate_checkpoint.schema.json"))
    checks["valid-schema:future-independent-checkpoint"] = not list(checkpoint_validator.iter_errors(checkpoint))
    for index, key in enumerate(checkpoint["recomputed"]):
        bad = copy.deepcopy(checkpoint)
        if isinstance(bad["recomputed"][key], bool):
            bad["recomputed"][key] = False
        elif isinstance(bad["recomputed"][key], int):
            bad["recomputed"][key] = 1
        else:
            bad["recomputed"][key] = [f"failure-{index}"]
        checks[f"checkpoint-negative:{index:02d}"] = bool(list(checkpoint_validator.iter_errors(bad)))

    failures = sorted(key for key, passed in checks.items() if not passed)
    report = {
        "schema_version": "audit005-final-aggregate-prep-test-report-v1",
        "status": "pass" if not failures else "fail_closed",
        "passed": sum(checks.values()),
        "failed": len(failures),
        "failures": failures,
        "total": len(checks),
        "mutation_classes": len(mutations),
        "mutation_variants_per_class": 32,
        "negative_manifest_tests": len(mutations) * 32,
        "checkpoint_negative_tests": len(checkpoint["recomputed"]),
        "valid_tests": 4,
        "test_digest": hashlib.sha256(canonical_bytes(checks)).hexdigest(),
        "closure_authorized": False,
        "launches": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "credit": 0,
        "canonical_plan_writes": 0,
    }
    if args.write_report:
        target = HERE / "test_report.json"
        if target.exists():
            raise SystemExit("refusing overwrite: test_report.json")
        target.write_bytes(canonical_bytes(report))
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
