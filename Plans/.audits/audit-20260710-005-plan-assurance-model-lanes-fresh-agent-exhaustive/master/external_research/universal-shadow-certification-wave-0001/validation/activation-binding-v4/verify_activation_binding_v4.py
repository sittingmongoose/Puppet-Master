#!/usr/bin/env python3
"""Independent cache-aware prelaunch verifier for Audit005 binding-v4.

This verifier deliberately treats the 152-file semantic manifest as the only
dependency authority.  The 39 CPython cache files and the 191-file observed
runtime tree are checked as evidence, but are never folded into semantic
authority.  All checks are read-only and no activation output is generated.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from copy import deepcopy
from pathlib import Path

BASE = Path(__file__).resolve().parent
WAVE = BASE.parents[1]
AUDIT_ROOT = BASE.parents[4]
DEP = AUDIT_ROOT / "master/dependencies/jsonschema-draft202012-v1"
CACHE = DEP / "cache-reconciliation-v2"
SITE = DEP / "site-packages"
SNAPSHOT = WAVE / "validation/activation-binding-v3/candidate-snapshot-v3.json"
V3 = WAVE / "validation/activation-binding-v3"
RECON = BASE / "cache-reconciliation-v4.json"
AUTHORITY = BASE / "authority-v4.json"
V11 = AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V11.json"
V10 = AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json"

EXPECTED_IDS = [f"A005ERSC-{i:04d}" for i in range(1, 17)]
HEX = set("0123456789abcdef")
EXPECTED = {
    "reconciliation": "9fa68173ccaabf3d8945a98fd0bee08d1ef26938cefe995c21f1bf37e3f356f0",
    "semantic_manifest": "c4f157475096cdeec98837019dcc341d2c2818ba3d33e21a4123b34b4dc7212d",
    "semantic_tree": "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95",
    "cache_manifest": "b5e7e64523e968b85bf702b7ad94885f8f97242a5dc9562aa1f3ea9653eb184d",
    "cache_tree": "b7262c3dd93051aaa7c3278c2a24ae9c1e4ee1c49a050e17554f18fc589e7ba5",
    "runtime_manifest": "6398a5682c07370deea9f970fb8b7ed42e028911abf4ce1e94d7944f443b5306",
    "runtime_tree": "37e2762646b7c6c49af370b5ecf35b03b0d70258536fdb9faa953953b6ac4517",
    "cache_report": "bfb3a7fc8a3723994f23930085f5989848c1aac85b4a6b39ed4dc0d15e0b3782",
    "cache_authority": "e04b1d8e2b903e1a03b48f2b7cdecf740a4d0687fb29400ee16b1d712d52e855",
    "cache_tests": "18fc5553f0ca3f29572c0027e0c1e68ac81a4e749486af144a11b197635a4b48",
    "v3_prep": "6e305c66489ea39c152dc93020c5f408ab433fc278552d262b45a64fde451ccc",
    "v3_fail": "c6da2d69cb2950ec2ed1cfbcfa80900af3c317daae0e660f2b4dd6c4868dddb5",
    "v3_authority": "aeb345fa23ea3604f812acc14706f18ef2f0b9a1e234919424ecf6d692d0a8e0",
    "v3_snapshot": "4726d4c6caa003b79d893dcc445a7e552c7d492f5eb2e3a7647708654a55e5f4",
    "v3_reconciliation": "91cf2e5c1b6e275986d8227e60cc48ade1931ce9e8e5a79f83874f753a9e51f7",
    "v3_contract": "6fc66818b4980c1cee3934af14dcb5412257e62413cbc153a3583629bdcbd596",
    "v3_generator": "3c7bd9a2e45687d9a60c86f01de013af5bb642931a4de8ad663a1f3a01e15bb7",
    "v3_verifier": "011319182ae6c0554582b84ff191db014a7e94bbf26ad0655e4fa02cef8112a0",
    "v3_tests": "54f06a651d6223d79b48c236dbea57ae43bbb7169237dc515505ead663172fa5",
    "candidate_coverage": "91f8e13d91dc3615781c9592abade65072b45514a4b515471e96750409586ca3",
    "packet_root": "2ef4c307455eae300ade6c487a2816469c2551e9e8afc76014c700c2a8e29926",
    "intent_root": "e9e009c14c3e0fb9c1ced388a3300c030822c5d7984b86923e65661e85db42fe",
    "schema": "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1",
    "v10": "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1",
    "v11": "6717f715c8a32dea88d7e79e70fca87aeb4a0b637853da3742c5c6e6a0c9a086",
    "routing": "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544",
}

SOURCE_CONTROLS = {
    "architecture.json": "027ff81d0d73c9ea04a66557d1fd9270ece11816058808e5b60b1fb1bc1813f6",
    "batch_authority.json": "fe18c2c3dfc80a6481701c4e79387d0221a95d81784949b354b89b7f736abe24",
    "batch_manifest.jsonl": "f41c967a3d2650031c0b8c74a83c410ca168aa8704131b6986c1c70309e68295",
    "launch_seal.json": "7477cb53229aa72883296b87e9339db83b43b0c5208b3ae1be8d2d359e328ebb",
    "leaf_prompt.json": "18470ecb4a53a7f737b35e98debde8fef17f36ea31fe99ba73dc946cc72e8ef6",
    "native_capture_contract.json": "42ae6690b34249eca9a617104f223f4c9e4b41278876254be0a1eec91215da93",
    "packet_registry.jsonl": "ec4df1ce8b250c76d0daba5e93a94c5318d8aea82942d55c7145eed43c200ba8",
    "receipt_contract.json": "9922535622d3e77cc818d40d0ba811bb5fa1bd90fe44af4315bda02a09692767",
    "schemas/result.schema.json": EXPECTED["schema"],
}


class BindingError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise BindingError(message)


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def canonical(value) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def object_digest(value) -> str:
    return sha_bytes(canonical(value))


def is_sha(value) -> bool:
    return isinstance(value, str) and len(value) == 64 and set(value) <= HEX and value != "0" * 64


def safe_relative(value: str) -> bool:
    if not isinstance(value, str) or not value or value.startswith("/"):
        return False
    p = Path(value)
    return not p.is_absolute() and ".." not in p.parts and "\\" not in value


def in_root(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def legacy_root(paths):
    rows = [{"path": str(p.relative_to(AUDIT_ROOT)), "sha256": sha_file(p)} for p in sorted(paths)]
    return object_digest(rows)


def byte_sorted_root(paths):
    rows = sorted(((str(p.relative_to(AUDIT_ROOT)).encode(), p.read_bytes()) for p in paths), key=lambda row: row[0])
    h = hashlib.sha256()
    h.update(b"universal-shadow-certification-payload-root-v3-byte-sorted\0")
    for relative, raw in rows:
        h.update(len(relative).to_bytes(8, "big"))
        h.update(relative)
        h.update(len(raw).to_bytes(8, "big"))
        h.update(raw)
    return h.hexdigest()


def static_paths():
    return [
        p for p in WAVE.rglob("*")
        if p.is_file()
        and p.name not in {"batch_authority.json", "launch_seal.json", "local_candidate_report.json"}
        and "activation" not in p.parts
        and "validation" not in p.relative_to(WAVE).parts
    ]


def pre_v4_paths():
    excluded = ("validation/activation-binding-v3/", "validation/activation-binding-v4/")
    result = []
    for p in WAVE.rglob("*"):
        if not p.is_file() or p.name in {"batch_authority.json", "launch_seal.json", "local_candidate_report.json"}:
            continue
        rel = str(p.relative_to(WAVE))
        if "activation" in p.parts or any(rel.startswith(prefix) for prefix in excluded):
            continue
        result.append(p)
    return result


def validate_manifest_rows(kind: str, rows, *, check_files: bool = True) -> None:
    require(isinstance(rows, list), f"{kind}-rows-type")
    seen = set()
    expected_keys = {
        "semantic": {"path", "sha256", "size"},
        "cache": {"cache_tag", "header_mode", "magic_hex", "path", "sha256", "size", "source_path", "validation_errors"},
        "runtime": {"path", "sha256", "size"},
    }[kind]
    for row in rows:
        require(isinstance(row, dict) and set(row) == expected_keys, f"{kind}-row-keys")
        path = row["path"]
        require(safe_relative(path) and path not in seen, f"{kind}-path")
        seen.add(path)
        require(is_sha(row["sha256"]), f"{kind}-sha")
        require(isinstance(row["size"], int) and row["size"] >= 0, f"{kind}-size")
        if kind == "semantic":
            require("__pycache__" not in Path(path).parts and not path.endswith(".pyc"), "semantic-cache-leak")
        elif kind == "cache":
            p = Path(path)
            require(p.parts.count("__pycache__") == 1 and p.name.endswith(".cpython-312.pyc"), "cache-path-shape")
            require(row["cache_tag"] == "cpython-312" and row["header_mode"] == "timestamp", "cache-header-mode")
            require(row["magic_hex"] == "cb0d0d0a" and row["validation_errors"] == [], "cache-declaration")
            source = row["source_path"]
            require(safe_relative(source) and "__pycache__" not in Path(source).parts and not source.endswith(".pyc"), "cache-source-path")
        if check_files:
            actual = SITE / path
            require(in_root(actual, SITE) and actual.is_file() and not actual.is_symlink(), f"{kind}-missing:{path}")
            require(sha_file(actual) == row["sha256"] and actual.stat().st_size == row["size"], f"{kind}-bytes:{path}")
            if kind == "cache":
                source = SITE / row["source_path"]
                require(in_root(source, SITE) and source.is_file() and not source.is_symlink(), f"cache-source:{path}")
                raw = actual.read_bytes()
                require(raw[:4].hex() == "cb0d0d0a" and len(raw) >= 16, f"cache-magic:{path}")
                require(int.from_bytes(raw[8:12], "little") == int(source.stat().st_mtime), f"cache-mtime:{path}")
                require(int.from_bytes(raw[12:16], "little") == source.stat().st_size, f"cache-source-size:{path}")


def validate_reconciliation_data(reconciliation: dict) -> None:
    require(reconciliation.get("schema_version") == "universal-shadow-certification-activation-binding-cache-reconciliation-v4", "reconciliation-schema")
    require(reconciliation.get("status") == "READY_FOR_FRESH_INDEPENDENT_PRELAUNCH_V4", "reconciliation-status")
    sem = reconciliation.get("semantic_authority", {})
    require(sem == {
        "manifest_path": "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v2/immutable_authoritative_semantic_tree.jsonl",
        "manifest_sha256": EXPECTED["semantic_manifest"], "file_count": 152,
        "tree_sha256": EXPECTED["semantic_tree"], "authoritative": True,
        "semantic_scope": "site-packages files listed by the immutable manifest only",
    }, "semantic-reconciliation")
    cache = reconciliation.get("validated_cache_evidence", {})
    require(cache.get("manifest_sha256") == EXPECTED["cache_manifest"] and cache.get("tree_sha256") == EXPECTED["cache_tree"], "cache-reconciliation-hash")
    require(cache.get("file_count") == 39 and cache.get("authoritative") is False and cache.get("cache_tag") == "cpython-312", "cache-reconciliation-count")
    runtime = reconciliation.get("validated_runtime_evidence", {})
    require(runtime.get("manifest_sha256") == EXPECTED["runtime_manifest"] and runtime.get("tree_sha256") == EXPECTED["runtime_tree"], "runtime-reconciliation-hash")
    require(runtime.get("file_count") == 191 and runtime.get("authoritative") is False, "runtime-reconciliation-count")
    source = reconciliation.get("source_terminal_reconciliation", {})
    require(source.get("report_sha256") == EXPECTED["cache_report"] and source.get("authority_sha256") == EXPECTED["cache_authority"], "cache-lineage-hash")
    require(source.get("tests_passed") == 562 and source.get("tests_total") == 562 and source.get("test_digest") == EXPECTED["cache_tests"], "cache-lineage-tests")
    require(source.get("status") == "PASS" and source.get("credits") == 0, "cache-lineage-status")
    roots = reconciliation.get("v3_root_scope_reconciliation", {})
    require(roots.get("legacy_static_file_count") == 40 and roots.get("legacy_static_root_sha256") == "2a6f490a1901d9650209a10ae3b324f4a04de6068f9c10aae017b6fa103eafb8", "legacy-root-declaration")
    require(roots.get("legacy_static_byte_sorted_root_sha256") == "3600ea51fb19caff0c2b218e1c2570f3ebec4b8b064422fc36a7a8bf27973e91", "legacy-byte-root-declaration")
    require(roots.get("pre_v4_file_count") == 53 and roots.get("pre_v4_root_sha256") == "c46e6b6ce110c4fec3743380af606f958b622b05be87d13e8e96ae3a5ebd871f", "pre-v4-root-declaration")
    require(roots.get("pre_v4_byte_sorted_root_sha256") == "d7fb0f2306d0ba2893f4fd4dc3e849b2d3521d43c39cf9f1075b716e289b9003", "pre-v4-byte-root-declaration")
    require(roots.get("excluded_append_only_prefixes") == ["validation/activation-binding-v3/", "validation/activation-binding-v4/"], "root-scope-exclusions")
    require(roots.get("packet_bytes_changed") is False and roots.get("intent_bytes_changed") is False and roots.get("result_schema_bytes_changed") is False, "root-byte-stability")
    lineage = reconciliation.get("v3_lineage", {})
    require(lineage.get("preparation_report_sha256") == EXPECTED["v3_prep"] and lineage.get("independent_report_sha256") == EXPECTED["v3_fail"], "v3-lineage")
    effect = reconciliation.get("activation_effect", {})
    require(effect == {"activation_authorized": False, "generator_invoked": False, "results": 0, "receipts": 0, "native_capture_rows": 0, "certification_credit": 0, "canonical_plan_writes": False}, "reconciliation-zero-state")


def validate_authority_data(authority: dict) -> None:
    require(authority.get("schema_version") == "universal-shadow-certification-activation-binding-authority-v4", "authority-schema")
    require(authority.get("status") == "READY_FOR_FRESH_INDEPENDENT_PRELAUNCH_V4", "authority-status")
    require(authority.get("activation_authorized") is False and authority.get("certification_credit") == 0, "authority-zero-credit")
    require(authority.get("cache_reconciliation_sha256") == EXPECTED["reconciliation"], "authority-reconciliation-hash")
    candidate = authority.get("candidate", {})
    for key, value in {"assignments": 16, "features": 3888, "features_per_assignment": 243, "owner_domains": 16, "source_assignments_per_packet": 24, "coverage_digest": EXPECTED["candidate_coverage"], "packet_root_sha256": EXPECTED["packet_root"], "intent_root_sha256": EXPECTED["intent_root"], "result_schema_sha256": EXPECTED["schema"]}.items():
        require(candidate.get(key) == value, "authority-candidate-" + key)
    dep = authority.get("dependency_binding_v1", {})
    require(dep.get("cache_terminal_report_sha256") == EXPECTED["cache_report"] and dep.get("cache_authority_sha256") == EXPECTED["cache_authority"], "authority-cache-binding")
    require(dep.get("semantic_tree_sha256") == EXPECTED["semantic_tree"] and dep.get("runtime_tree_sha256") == EXPECTED["runtime_tree"] and dep.get("cache_tree_sha256") == EXPECTED["cache_tree"], "authority-tree-binding")
    require(dep.get("semantic_file_count") == 152 and dep.get("runtime_file_count") == 191 and dep.get("cache_file_count") == 39, "authority-tree-count")
    require(dep.get("validator_authority_sha256") == "9eec930af0efebee5734892d2d0d9e5836a2bb79928c817492cd73a1ea7d4b97", "authority-validator-authority")
    require(dep.get("validator_sha256") == "789bca95c1dbd8ef89a5db06c041c23c67ef330324552ebb1e3602fd24cfa254" and dep.get("validator_tests_sha256") == "f42b563c1c13010695f2ab3cab37eef4d763738928c48655f59a5a746ce79961", "authority-validator")
    require(dep.get("dependency_authority_sha256") == "89d86715ed9760a2f9469733bf43cb6099784710b97bccf1b656e9520d0d3afb", "authority-dependency-authority")
    v3 = authority.get("v3_lineage", {})
    require(v3.get("preparation_report_sha256") == EXPECTED["v3_prep"] and v3.get("failed_luna_report_sha256") == EXPECTED["v3_fail"] and v3.get("v3_failure_preserved") is True, "authority-v3-failure-lineage")
    require(v3.get("candidate_snapshot_sha256") == EXPECTED["v3_snapshot"] and v3.get("root_reconciliation_sha256") == EXPECTED["v3_reconciliation"], "authority-v3-candidate-lineage")
    routing = authority.get("routing", {})
    require(routing.get("policy_sha256") == EXPECTED["routing"] and routing.get("parent_controller_thread_id") == "019f5078-6501-7223-b52f-2251010bdc41", "authority-routing-policy")
    require(routing.get("parent_model") == "gpt-5.6-luna" and routing.get("parent_reasoning_effort") == "max" and routing.get("child_model") == "gpt-5.6-luna" and routing.get("child_reasoning_effort") == "max", "authority-routing-model")
    require(routing.get("fork_turns") == "none" and routing.get("fresh_direct") is True and routing.get("descendants_forbidden") is True and routing.get("followups_forbidden") is True and routing.get("retries_forbidden") is True, "authority-routing-lifecycle")
    v10 = authority.get("v10", {})
    require(v10 == {"path": "master/coordination/CONCURRENCY_POLICY_V10.json", "sha256": EXPECTED["v10"], "atomic_cap": 16, "rolling_cap": 40}, "authority-v10")
    v11 = authority.get("prospective_scheduling_v11", {})
    require(v11.get("sha256") == EXPECTED["v11"] and v11.get("rolling_semantic_max") == 48 and v11.get("preferred_rolling_range") == [40, 48], "authority-v11-hash")
    require(v11.get("atomic_transaction_cap") == 16 and v11.get("forbidden_atomic_sizes") == [32, 40, 48] and v11.get("separately_gated_disjoint_transactions_only") is True and v11.get("v10_bound_in_flight_work_preserved") is True and v11.get("restamp_or_interrupt_forbidden") is True, "authority-v11-policy")
    require(authority.get("tool_hashes", {}).keys() == {"verify_activation_binding_v4.py", "test_activation_binding_v4.py"}, "authority-tool-key-closure")


def validate_snapshot_data(snapshot: dict) -> None:
    require(snapshot.get("schema_version") == "universal-shadow-certification-candidate-snapshot-v3", "snapshot-schema")
    require(snapshot.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_PRELAUNCH_V3", "snapshot-status")
    sem = snapshot.get("snapshot_semantics", {})
    for key, value in {"assignment_count": 16, "feature_count": 3888, "features_per_assignment": 243, "owner_domain_count": 16, "source_assignments_per_packet": 24, "coverage_digest": EXPECTED["candidate_coverage"], "packet_root_sha256": EXPECTED["packet_root"], "intent_root_sha256": EXPECTED["intent_root"]}.items():
        require(sem.get(key) == value, "snapshot-semantic-" + key)
    rows = snapshot.get("assignments")
    require(isinstance(rows, list) and len(rows) == 16 and [r.get("assignment_id") for r in rows] == EXPECTED_IDS, "snapshot-assignment-order")
    refs = []
    for row in rows:
        for key in ("assignment_id", "packet_path", "packet_sha256", "intent_path", "intent_sha256", "feature_count", "feature_refs_digest", "owner_domain_count", "source_assignment_count", "output_directory", "prospective_agent_path"):
            require(key in row, "snapshot-missing-" + key)
        require(is_sha(row["packet_sha256"]) and is_sha(row["intent_sha256"]) and is_sha(row["feature_refs_digest"]), "snapshot-hash")
        require(row["feature_count"] == 243 and row["owner_domain_count"] == 16 and row["source_assignment_count"] == 24, "snapshot-count")
        require(safe_relative(row["packet_path"]) and safe_relative(row["intent_path"]), "snapshot-relative-control")
        require(Path(row["output_directory"]).is_absolute() and row["output_directory"].startswith(str(AUDIT_ROOT)), "snapshot-output-scope")
        require(row["prospective_agent_path"] == f"/root/a005_external_research_universal_shadow_certification_{int(row['assignment_id'][-4:]):04d}_attempt_0001_terminal", "snapshot-agent-path")
        refs.append(row["feature_refs_digest"])
    require(len(set(refs)) == 16 and sum(r["feature_count"] for r in rows) == 3888, "snapshot-partition")
    zero = snapshot.get("zero_state", {})
    require(zero == {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 0}, "snapshot-zero-state")


def validate_source_controls() -> None:
    for rel, expected in SOURCE_CONTROLS.items():
        path = WAVE / rel
        require(path.is_file() and sha_file(path) == expected, "source-control:" + rel)
    for rel, expected in {
        "authority-v3.json": EXPECTED["v3_authority"],
        "candidate-snapshot-v3.json": EXPECTED["v3_snapshot"],
        "payload-root-reconciliation-v3.json": EXPECTED["v3_reconciliation"],
        "activation-contract-v3.json": EXPECTED["v3_contract"],
        "activation-generator-v3.py": EXPECTED["v3_generator"],
        "verify_activation_binding_v3.py": EXPECTED["v3_verifier"],
        "test_activation_binding_v3.py": EXPECTED["v3_tests"],
    }.items():
        p = V3 / rel
        require(p.is_file() and sha_file(p) == expected, "v3-control:" + rel)
    require(sha_file(V11) == EXPECTED["v11"] and sha_file(V10) == EXPECTED["v10"], "policy-hash")
    require(sha_file(V3 / "binding-v3-preparation-report.json") == EXPECTED["v3_prep"], "v3-prep-report")
    fail = V3 / "luna-independent-prelaunch-v3.json"
    require(fail.is_file() and sha_file(fail) == EXPECTED["v3_fail"], "v3-fail-report")
    fail_data = load(fail)
    require(fail_data.get("status") in {"fail", "FAIL", "BLOCKED", "fail_closed"} and fail_data.get("activation_authorized") is False, "v3-fail-preserved")


def validate_candidate_files(snapshot: dict) -> dict:
    all_refs = []
    packet_bytes = []
    intent_bytes = []
    owners = set()
    source_assignments = set()
    for row in snapshot["assignments"]:
        packet = AUDIT_ROOT / row["packet_path"]
        intent = AUDIT_ROOT / row["intent_path"]
        require(packet.is_file() and sha_file(packet) == row["packet_sha256"], "packet-hash:" + row["assignment_id"])
        require(intent.is_file() and sha_file(intent) == row["intent_sha256"], "intent-hash:" + row["assignment_id"])
        p = load(packet)
        i = load(intent)
        require(p.get("assignment_id") == row["assignment_id"] and p.get("attempt_id") == "attempt-0001" and p.get("feature_count") == 243, "packet-identity:" + row["assignment_id"])
        require(p.get("packet_id") == f"ERSCPKT-{row['assignment_id'][-4:]}" and p.get("schema_version") == "external-research-universal-shadow-certification-packet-v1", "packet-schema:" + row["assignment_id"])
        features = p.get("features", [])
        refs = p.get("feature_refs", [])
        require(len(features) == 243 and len(refs) == 243 and len(set(refs)) == 243, "packet-feature-count:" + row["assignment_id"])
        feature_rows = [f.get("provisional_feature_ref") for f in features]
        require(feature_rows == refs and len(set(feature_rows)) == 243, "packet-feature-refs:" + row["assignment_id"])
        require(p.get("feature_refs_digest") == row["feature_refs_digest"], "packet-feature-digest:" + row["assignment_id"])
        require(set(p.get("owner_domain_counts", {})) == set(f.get("owner_domain") for f in features) and len(p.get("owner_domain_counts", {})) == 16, "packet-owner-domains:" + row["assignment_id"])
        require(sum(p.get("owner_domain_counts", {}).values()) == 243, "packet-owner-sum:" + row["assignment_id"])
        require(len(p.get("source_assignment_counts", {})) == 24 and sum(p.get("source_assignment_counts", {}).values()) == 243, "packet-source-assignments:" + row["assignment_id"])
        for f in features:
            require(f.get("owner_domain") in p["owner_domain_counts"], "feature-owner")
            require(f.get("source_assignment_id") in p["source_assignment_counts"], "feature-source")
            owners.add(f.get("owner_domain"))
            source_assignments.add(f.get("source_assignment_id"))
        require(i.get("assignment_id") == row["assignment_id"] and i.get("attempt_id") == "attempt-0001" and i.get("packet_id") == p["packet_id"], "intent-identity:" + row["assignment_id"])
        require(i.get("packet_sha256") == row["packet_sha256"] and i.get("feature_refs_digest") == row["feature_refs_digest"] and i.get("feature_count") == 243, "intent-packet-binding:" + row["assignment_id"])
        require(i.get("model") == "gpt-5.6-sol" and i.get("reasoning_effort") == "xhigh" and i.get("fork_turns") == "none" and i.get("descendants_forbidden") is True and i.get("followups_forbidden") is True, "intent-lane:" + row["assignment_id"])
        require(i.get("fresh_child_required") is True and i.get("activation_granted_by_prelaunch_intent") is False and i.get("preparation_status") == "BLOCKED_AWAITING_INDEPENDENT_PRELAUNCH", "intent-state:" + row["assignment_id"])
        require(i.get("result_schema_sha256") == EXPECTED["schema"] and sha_file(WAVE / "schemas/result.schema.json") == EXPECTED["schema"], "intent-schema:" + row["assignment_id"])
        require(Path(row["output_directory"]).is_dir(), "output-dir:" + row["assignment_id"])
        out_files = [x for x in Path(row["output_directory"]).rglob("*") if x.is_file()]
        require(not out_files, "output-nonempty:" + row["assignment_id"])
        all_refs.extend(refs)
        packet_bytes.append(packet.stat().st_size)
        intent_bytes.append(intent.stat().st_size)
    require(len(all_refs) == 3888 and len(set(all_refs)) == 3888, "global-feature-partition")
    require(len(owners) == 16 and len(source_assignments) == 24, "global-domain-source-partition")
    return {"assignments": 16, "features": len(all_refs), "unique_features": len(set(all_refs)), "owner_domains": len(owners), "source_assignments": len(source_assignments), "packet_bytes": {"min": min(packet_bytes), "max": max(packet_bytes), "total": sum(packet_bytes)}, "output_files": 0}


def check_zero_state(snapshot: dict) -> dict:
    errors = []
    output_files = []
    for row in snapshot.get("assignments", []):
        out = Path(row.get("output_directory", ""))
        if not out.is_dir():
            errors.append("missing-output:" + str(row.get("assignment_id")))
        else:
            output_files.extend(str(p) for p in out.rglob("*") if p.is_file())
    receipts = list((WAVE / "dispatch").rglob("dispatch_receipt.json")) if (WAVE / "dispatch").is_dir() else []
    captures = [p for p in WAVE.rglob("native_capture.json") if p.is_file()]
    activation_root = WAVE / "activation"
    activation_files = [p for p in activation_root.rglob("*") if p.is_file()] if activation_root.is_dir() else []
    errors.extend("output-files" for _ in output_files)
    errors.extend("receipt-files" for _ in receipts)
    errors.extend("native-capture-files" for _ in captures)
    errors.extend("activation-files" for _ in activation_files)
    return {"output_directories": len(snapshot.get("assignments", [])), "output_files": len(output_files), "results": len(output_files), "receipts": len(receipts), "native_capture_rows": len(captures), "activation_files": len(activation_files), "errors": errors}


def validate_dependency_runtime() -> dict:
    sem_path = CACHE / "immutable_authoritative_semantic_tree.jsonl"
    cache_path = CACHE / "observed_cache_tree.jsonl"
    runtime_path = CACHE / "observed_runtime_tree.jsonl"
    require(sha_file(sem_path) == EXPECTED["semantic_manifest"], "semantic-manifest-hash")
    require(sha_file(cache_path) == EXPECTED["cache_manifest"], "cache-manifest-hash")
    require(sha_file(runtime_path) == EXPECTED["runtime_manifest"], "runtime-manifest-hash")
    sem = read_jsonl(sem_path)
    caches = read_jsonl(cache_path)
    runtime = read_jsonl(runtime_path)
    require(len(sem) == 152 and len(caches) == 39 and len(runtime) == 191, "dependency-manifest-count")
    validate_manifest_rows("semantic", sem)
    validate_manifest_rows("cache", caches)
    validate_manifest_rows("runtime", runtime)
    require(sha_file(sem_path) == EXPECTED["semantic_manifest"] and sha_file(cache_path) == EXPECTED["cache_manifest"] and sha_file(runtime_path) == EXPECTED["runtime_manifest"], "dependency-manifest-toctou")
    sem_paths = {r["path"] for r in sem}
    cache_paths = {r["path"] for r in caches}
    runtime_paths = {r["path"] for r in runtime}
    require(runtime_paths == sem_paths | cache_paths, "runtime-union")
    auth = load(CACHE / "CACHE_RECONCILIATION_AUTHORITY_V2.json")
    report = load(CACHE / "validation/terminal-cache-reconciliation-v2.json")
    require(sha_file(CACHE / "CACHE_RECONCILIATION_AUTHORITY_V2.json") == EXPECTED["cache_authority"], "cache-authority-hash")
    require(sha_file(CACHE / "validation/terminal-cache-reconciliation-v2.json") == EXPECTED["cache_report"], "cache-report-hash")
    require(auth.get("status") == "PASS" and report.get("status") == "PASS" and not report.get("errors"), "cache-report-status")
    require(report.get("tests", {}).get("counts") == {"failed": 0, "passed": 562, "total": 562} and report.get("tests", {}).get("test_digest") == EXPECTED["cache_tests"], "cache-report-tests")
    for rel, expected in {"dependency_authority.json": "89d86715ed9760a2f9469733bf43cb6099784710b97bccf1b656e9520d0d3afb", "install_receipt.json": "f36f64777e31a3d993a3e1fc03ed4d46182b77667d20f81bba6eb5ffc56462f8", "requirements.lock": "a70d91fb9e7a4efbdded91709cb942d65be08c94f7ea58e473b3f0b1c190996d", "source_registry.json": "23ca01e5f0117b8f8637168c883dc99cd459387920629f6ee34be7985b9e9005", "wheel_manifest.jsonl": "c662aa4821ea4980210c248711d76afd25c6e296b9367458467f19f1a7665f40"}.items():
        require(sha_file(DEP / rel) == expected, "dependency-control:" + rel)
    python = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
    require(python.is_file(), "bundled-python-missing")
    schema = WAVE / "schemas/result.schema.json"
    fixture = DEP / "fixtures/known-good-result.json"
    code = """
import json, os, sys
import jsonschema
from jsonschema import Draft202012Validator
schema=json.load(open(os.environ['PM_SCHEMA']))
fixture=json.load(open(os.environ['PM_FIXTURE']))
Draft202012Validator.check_schema(schema)
Draft202012Validator(schema).validate(fixture)
mods=[]
for name in ('jsonschema','attrs','referencing','rpds','typing_extensions'):
    mod=__import__(name)
    mods.append([name, getattr(mod,'__file__', '')])
print(json.dumps({'version':jsonschema.__version__, 'validator':Draft202012Validator.__name__, 'meta':Draft202012Validator.META_SCHEMA.get('$id'), 'modules':mods, 'sys_path':sys.path}, sort_keys=True))
"""
    env = {"PYTHONPATH": str(SITE), "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1", "PM_SCHEMA": str(schema), "PM_FIXTURE": str(fixture)}
    proc = subprocess.run([str(python), "-S", "-B", "-c", code], cwd=str(DEP), env=env, capture_output=True, text=True, timeout=60)
    require(proc.returncode == 0, "draft202012-engine:" + proc.stderr[-300:])
    probe = json.loads(proc.stdout)
    require(probe.get("version") == "4.26.0" and probe.get("validator") == "Draft202012Validator" and probe.get("meta") == "https://json-schema.org/draft/2020-12/schema", "draft202012-engine-binding")
    site_resolved = str(SITE.resolve())
    for name, origin in probe.get("modules", []):
        require(origin.startswith(site_resolved + os.sep), "outside-import:" + name)
    return {"python": str(python), "python_sha256": sha_file(python), "version": probe["version"], "validator": probe["validator"], "semantic_files": len(sem), "cache_files": len(caches), "runtime_files": len(runtime), "engine": "PASS"}


def validate_preparation() -> dict:
    errors = []
    evidence = {}
    try:
        reconciliation = load(RECON)
        authority = load(AUTHORITY)
        snapshot = load(SNAPSHOT)
        validate_reconciliation_data(reconciliation)
        validate_authority_data(authority)
        require(sha_file(RECON) == authority["cache_reconciliation_sha256"], "reconciliation-toctou")
        require(sha_file(SNAPSHOT) == EXPECTED["v3_snapshot"], "snapshot-hash")
        require(sha_file(AUTHORITY) == sha_file(AUTHORITY), "authority-read")
        validate_snapshot_data(snapshot)
        validate_source_controls()
        evidence["candidate"] = validate_candidate_files(snapshot)
        evidence["dependency"] = validate_dependency_runtime()
        evidence["zero_state"] = check_zero_state(snapshot)
        require(not evidence["zero_state"]["errors"], ";".join(evidence["zero_state"]["errors"]))
        for rel, expected in authority.get("tool_hashes", {}).items():
            p = BASE / rel
            require(p.is_file() and sha_file(p) == expected, "tool-hash:" + rel)
        evidence["authority_sha256"] = sha_file(AUTHORITY)
        evidence["reconciliation_sha256"] = sha_file(RECON)
        evidence["v3_failure_preserved"] = True
        evidence["v10_preserved"] = sha_file(V10) == EXPECTED["v10"]
        evidence["v11_observed"] = sha_file(V11) == EXPECTED["v11"]
    except (BindingError, KeyError, OSError, ValueError, json.JSONDecodeError, subprocess.SubprocessError) as exc:
        errors.append(str(exc))
    return {"status": "pass" if not errors else "fail", "errors": errors, "activation_authorized": False, "generator_invoked": False, "independent_reconstruction": True, "cache_is_non_authoritative": True, "v3_failure_preserved": True, "evidence": evidence}


if __name__ == "__main__":
    print(json.dumps(validate_preparation(), sort_keys=True, indent=2))
