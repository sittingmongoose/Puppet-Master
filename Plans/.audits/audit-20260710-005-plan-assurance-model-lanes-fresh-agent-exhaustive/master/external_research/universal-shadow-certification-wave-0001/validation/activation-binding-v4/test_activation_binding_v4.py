#!/usr/bin/env python3
"""Strict in-memory negative suite for binding-v4.

The suite never writes candidate, dependency, activation, result, receipt, or
capture files.  It exercises the verifier's structural rejection boundaries
with one baseline and more than 400 deterministic mutation probes.
"""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("binding_v4_verifier", BASE / "verify_activation_binding_v4.py")
V = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(V)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def expect_failure(fn):
    try:
        fn()
    except (V.BindingError, KeyError, ValueError, TypeError):
        return True
    raise AssertionError("mutation was accepted")


tests = []


def test(name, fn):
    tests.append((name, fn))


def baseline():
    result = V.validate_preparation()
    assert result["status"] == "pass", result
    assert result["errors"] == []
    assert result["activation_authorized"] is False
    assert result["generator_invoked"] is False
    assert result["cache_is_non_authoritative"] is True


test("valid_current_state", baseline)

sem_path = V.CACHE / "immutable_authoritative_semantic_tree.jsonl"
cache_path = V.CACHE / "observed_cache_tree.jsonl"
runtime_path = V.CACHE / "observed_runtime_tree.jsonl"
sem_rows = V.read_jsonl(sem_path)
cache_rows = V.read_jsonl(cache_path)
runtime_rows = V.read_jsonl(runtime_path)

for i in range(len(sem_rows)):
    def probe(i=i):
        rows = copy.deepcopy(sem_rows)
        rows[i]["sha256"] = "0" * 64
        return expect_failure(lambda: V.validate_manifest_rows("semantic", rows, check_files=False))
    test(f"semantic_manifest_hash_mutation_{i:03d}", probe)

for i in range(len(cache_rows)):
    def probe(i=i):
        rows = copy.deepcopy(cache_rows)
        rows[i]["path"] = "../escape.cpython-312.pyc"
        return expect_failure(lambda: V.validate_manifest_rows("cache", rows, check_files=False))
    test(f"cache_path_escape_mutation_{i:03d}", probe)

for i in range(len(runtime_rows)):
    def probe(i=i):
        rows = copy.deepcopy(runtime_rows)
        rows[i]["sha256"] = "not-a-sha"
        return expect_failure(lambda: V.validate_manifest_rows("runtime", rows, check_files=False))
    test(f"runtime_hash_mutation_{i:03d}", probe)

snapshot_path = V.SNAPSHOT
snapshot = load_json(snapshot_path)
for i in range(16):
    def probe(i=i):
        value = copy.deepcopy(snapshot)
        value["assignments"][i]["assignment_id"] = value["assignments"][(i + 1) % 16]["assignment_id"]
        return expect_failure(lambda: V.validate_snapshot_data(value))
    test(f"duplicate_assignment_{i:02d}", probe)

for i, (key, value) in enumerate([
    ("status", "BROKEN"),
    ("semantic_authority.file_count", 151),
    ("validated_cache_evidence.authoritative", True),
    ("validated_runtime_evidence.file_count", 190),
    ("source_terminal_reconciliation.tests_passed", 561),
    ("v3_root_scope_reconciliation.pre_v4_file_count", 52),
    ("v3_root_scope_reconciliation.packet_bytes_changed", True),
    ("v3_lineage.independent_report_sha256", "0" * 64),
    ("activation_effect.certification_credit", 1),
    ("activation_effect.canonical_plan_writes", True),
]):
    def probe(key=key, value=value):
        data = load_json(V.RECON)
        obj = data
        parts = key.split(".")
        for part in parts[:-1]:
            obj = obj[part]
        obj[parts[-1]] = value
        return expect_failure(lambda: V.validate_reconciliation_data(data))
    test(f"reconciliation_mutation_{i:02d}", probe)

authority_mutations = [
    ("status", "BROKEN"),
    ("activation_authorized", True),
    ("certification_credit", 1),
    ("cache_reconciliation_sha256", "0" * 64),
    ("candidate.assignments", 15),
    ("candidate.features", 3887),
    ("candidate.coverage_digest", "0" * 64),
    ("dependency_binding_v1.semantic_file_count", 151),
    ("dependency_binding_v1.runtime_tree_sha256", "0" * 64),
    ("v3_lineage.v3_failure_preserved", False),
    ("routing.policy_sha256", "0" * 64),
    ("routing.parent_model", "gpt-5.6-sol"),
    ("routing.fork_turns", "1"),
    ("v10.atomic_cap", 32),
    ("prospective_scheduling_v11.sha256", "0" * 64),
    ("prospective_scheduling_v11.rolling_semantic_max", 40),
    ("prospective_scheduling_v11.atomic_transaction_cap", 48),
    ("prospective_scheduling_v11.separately_gated_disjoint_transactions_only", False),
    ("tool_hashes", {"extra.py": "0" * 64}),
    ("tool_hashes", {"verify_activation_binding_v4.py": "0" * 64}),
]

for key, value in authority_mutations:
    def authority_probe(key, value):
        data = load_json(V.AUTHORITY)
        obj = data
        if key == "tool_hashes":
            obj[key] = value
        else:
            parts = key.split(".")
            for part in parts[:-1]:
                obj = obj[part]
            obj[parts[-1]] = value
        return expect_failure(lambda: V.validate_authority_data(data))
    test("authority_mutation_" + key.replace(".", "_"), lambda key=key, value=value: authority_probe(key, value))

for i, value in enumerate([
    {"output_directories": 15, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 0},
    {"output_directories": 16, "output_files": 1, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 0},
    {"output_directories": 16, "output_files": 0, "results": 1, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 0},
    {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 1, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 0},
    {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 1, "activation_files": 0, "certification_credit": 0},
    {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 1, "certification_credit": 0},
    {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 1},
]):
    def probe(value=value):
        data = copy.deepcopy(snapshot)
        data["zero_state"] = value
        return expect_failure(lambda: V.validate_snapshot_data(data))
    test(f"snapshot_zero_state_mutation_{i:02d}", probe)

for i, path in enumerate(["/absolute", "../x", "a\\b", "", "..", "./../x", "a/../../x", "a/../b"]):
    test(f"unsafe_relative_path_{i:02d}", lambda path=path: (_ for _ in ()).throw(AssertionError("unsafe path accepted")) if V.safe_relative(path) else True)

for i in range(20):
    def probe(i=i):
        rows = copy.deepcopy(runtime_rows)
        rows[i]["path"] = rows[(i + 1) % len(rows)]["path"]
        return expect_failure(lambda: V.validate_manifest_rows("runtime", rows, check_files=False))
    test(f"duplicate_runtime_path_{i:02d}", probe)

for i in range(20):
    def probe(i=i):
        rows = copy.deepcopy(cache_rows)
        rows[i]["magic_hex"] = "00000000"
        return expect_failure(lambda: V.validate_manifest_rows("cache", rows, check_files=False))
    test(f"cache_magic_mutation_{i:02d}", probe)

for i in range(20):
    def probe(i=i):
        rows = copy.deepcopy(sem_rows)
        rows[i]["path"] = "__pycache__/bad.pyc"
        return expect_failure(lambda: V.validate_manifest_rows("semantic", rows, check_files=False))
    test(f"semantic_cache_injection_{i:02d}", probe)

failures = []
for name, fn in tests:
    try:
        fn()
    except Exception as exc:  # pragma: no cover - reported deterministically
        failures.append({"name": name, "error": f"{type(exc).__name__}: {exc}"})

names = [name for name, _ in tests]
digest = hashlib.sha256(("\n".join(names) + "\n").encode()).hexdigest()
result = {"status": "pass" if not failures else "fail", "passed": len(tests) - len(failures), "total": len(tests), "failed": len(failures), "test_digest": digest, "failures": failures}
print(json.dumps(result, sort_keys=True, indent=2))
raise SystemExit(0 if not failures else 1)
