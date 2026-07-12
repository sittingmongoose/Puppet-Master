#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

BASE = Path(__file__).resolve().parent
WAVE = BASE.parents[1]
AUDIT = BASE.parents[4]
V3 = WAVE / "validation/activation-binding-v3"
V4 = WAVE / "validation/activation-binding-v4"

EXPECTED_PRE_V4_ROOT = "c46e6b6ce110c4fec3743380af606f958b622b05be87d13e8e96ae3a5ebd871f"
EXPECTED_PRE_V4_BYTE_ROOT = "d7fb0f2306d0ba2893f4fd4dc3e849b2d3521d43c39cf9f1075b716e289b9003"
EXPECTED_V3_FAIL = "c6da2d69cb2950ec2ed1cfbcfa80900af3c317daae0e660f2b4dd6c4868dddb5"
EXPECTED_V4_FAIL = "9c3927dd6d36e8552209a74fbb0adf085f302aef2c0486b4ab2cc7caea28ca82"
EXPECTED_PACKET_ROOT = "2ef4c307455eae300ade6c487a2816469c2551e9e8afc76014c700c2a8e29926"
EXPECTED_INTENT_ROOT = "e9e009c14c3e0fb9c1ced388a3300c030822c5d7984b86923e65661e85db42fe"
EXPECTED_SCHEMA = "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def object_digest(value) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def legacy_root(paths) -> str:
    rows = [{"path": str(p.relative_to(AUDIT)), "sha256": sha(p)} for p in sorted(paths)]
    return object_digest(rows)


def byte_sorted_root(paths) -> str:
    rows = sorted(((str(p.relative_to(AUDIT)).encode(), p.read_bytes()) for p in paths), key=lambda x: x[0])
    h = hashlib.sha256()
    h.update(b"universal-shadow-certification-payload-root-v3-byte-sorted\0")
    for rel, raw in rows:
        h.update(len(rel).to_bytes(8, "big")); h.update(rel)
        h.update(len(raw).to_bytes(8, "big")); h.update(raw)
    return h.hexdigest()


def historical_paths():
    excluded = ("validation/activation-binding-v3/", "validation/activation-binding-v4/", "validation/activation-binding-v5/")
    result = []
    for p in WAVE.rglob("*"):
        if not p.is_file() or p.is_symlink() or p.name in {"batch_authority.json", "launch_seal.json", "local_candidate_report.json"}:
            continue
        rel = str(p.relative_to(WAVE))
        if "activation" in p.parts or any(rel.startswith(prefix) for prefix in excluded):
            continue
        result.append(p)
    return sorted(result)


def candidate_paths():
    packets = sorted((WAVE / "packets").glob("*.json"))
    intents = sorted((WAVE / "dispatch").glob("*/attempt-0001/dispatch_intent.json"))
    schema = [WAVE / "schemas/result.schema.json"]
    if len(packets) != 16 or len(intents) != 16:
        raise RuntimeError("candidate cardinality")
    return packets + intents + schema


def manifest(paths):
    return [{"path": str(p.relative_to(AUDIT)), "sha256": sha(p), "size": p.stat().st_size} for p in paths]


def write_new(path: Path, raw: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    with os.fdopen(fd, "wb") as stream:
        stream.write(raw)


def prepare():
    hist = historical_paths()
    if len(hist) != 53 or legacy_root(hist) != EXPECTED_PRE_V4_ROOT or byte_sorted_root(hist) != EXPECTED_PRE_V4_BYTE_ROOT:
        raise RuntimeError("historical root mismatch")
    cand = candidate_paths()
    if sha(WAVE / "schemas/result.schema.json") != EXPECTED_SCHEMA:
        raise RuntimeError("schema drift")
    hist_rows, cand_rows = manifest(hist), manifest(cand)
    write_new(BASE / "historical-byte-manifest-v5.jsonl", b"".join(canonical(row) for row in hist_rows))
    write_new(BASE / "current-candidate-byte-manifest-v5.jsonl", b"".join(canonical(row) for row in cand_rows))
    authority = {
        "schema_version": "universal-shadow-certification-activation-binding-authority-v5",
        "status": "BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH_V5",
        "activation_authorized": False,
        "certification_credit": 0,
        "historical_scope": {
            "definition": "exact immutable pre-v3/pre-v4 byte set; later append-only activation-binding namespaces are never recursively admitted",
            "manifest_path": str(BASE / "historical-byte-manifest-v5.jsonl"),
            "manifest_sha256": sha(BASE / "historical-byte-manifest-v5.jsonl"),
            "file_count": 53,
            "legacy_root_sha256": EXPECTED_PRE_V4_ROOT,
            "byte_sorted_root_sha256": EXPECTED_PRE_V4_BYTE_ROOT,
            "excluded_append_only_namespaces": [
                "validation/activation-binding-v3/",
                "validation/activation-binding-v4/",
                "validation/activation-binding-v5/",
            ],
            "additional_exclusions_permitted": False,
        },
        "current_candidate_scope": {
            "manifest_path": str(BASE / "current-candidate-byte-manifest-v5.jsonl"),
            "manifest_sha256": sha(BASE / "current-candidate-byte-manifest-v5.jsonl"),
            "file_count": 33,
            "packet_count": 16,
            "intent_count": 16,
            "schema_count": 1,
            "packet_root_sha256": EXPECTED_PACKET_ROOT,
            "intent_root_sha256": EXPECTED_INTENT_ROOT,
            "result_schema_sha256": EXPECTED_SCHEMA,
            "assignments": 16,
            "features": 3888,
            "features_per_assignment": 243,
        },
        "failure_lineage": {
            "v3_independent_failure_path": str(V3 / "luna-independent-prelaunch-v3.json"),
            "v3_independent_failure_sha256": EXPECTED_V3_FAIL,
            "v3_failure_reinterpreted": False,
            "v4_independent_failure_path": str(V4 / "luna-independent-prelaunch-v4.json"),
            "v4_independent_failure_sha256": EXPECTED_V4_FAIL,
            "v4_failure_suppressed": False,
            "v4_solo_failure": "V3_FROZEN_SUITE_NOT_352_OF_352",
            "v4_substantive_passes": {"v4_strict": "504/504", "independent_probes": "1453/1453", "cache_reconciliation": "562/562"},
        },
        "dependency_binding": {
            "cache_reconciliation_report_path": str(AUDIT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v2/terminal-independent-report.json"),
            "cache_reconciliation_report_sha256": "bfb3a7fc8a3723994f23930085f5989848c1aac85b4a6b39ed4dc0d15e0b3782",
            "semantic_tree_sha256": "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95",
            "semantic_file_count": 152,
            "runtime_cache_files": 39,
            "runtime_files": 191,
            "cache_is_non_authoritative": True,
        },
        "zero_state_required": {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "all_credits": 0},
        "tool_hashes": {
            "builder_sha256": sha(BASE / "build_activation_binding_v5.py"),
            "verifier_sha256": sha(BASE / "verify_activation_binding_v5.py"),
            "tests_sha256": sha(BASE / "test_activation_binding_v5.py"),
        },
    }
    write_new(BASE / "authority-v5.json", json.dumps(authority, indent=2, sort_keys=True).encode() + b"\n")
    return {"historical_files": len(hist), "candidate_files": len(cand), "authority_sha256": sha(BASE / "authority-v5.json")}


def terminal(verifier_report: Path, test_report: Path):
    verifier = json.loads(verifier_report.read_text())
    tests = json.loads(test_report.read_text())
    if verifier.get("status") != "pass" or verifier.get("errors") != []:
        raise RuntimeError("verifier not clean")
    if tests.get("status") != "pass" or tests.get("passed") != tests.get("total") or tests.get("total", 0) < 600:
        raise RuntimeError("tests not clean")
    report = {
        "schema_version": "universal-shadow-certification-activation-binding-v5-terminal-preparation-report",
        "status": "BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH_V5",
        "activation_authorized": False,
        "activation_files": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "certification_credit": 0,
        "authority_path": str(BASE / "authority-v5.json"),
        "authority_sha256": sha(BASE / "authority-v5.json"),
        "historical_manifest_sha256": sha(BASE / "historical-byte-manifest-v5.jsonl"),
        "candidate_manifest_sha256": sha(BASE / "current-candidate-byte-manifest-v5.jsonl"),
        "verifier_path": str(BASE / "verify_activation_binding_v5.py"),
        "verifier_sha256": sha(BASE / "verify_activation_binding_v5.py"),
        "verifier_report_sha256": sha(verifier_report),
        "tests_path": str(BASE / "test_activation_binding_v5.py"),
        "tests_sha256": sha(BASE / "test_activation_binding_v5.py"),
        "test_report_sha256": sha(test_report),
        "tests_passed": tests["passed"],
        "tests_total": tests["total"],
        "test_digest": tests["test_digest"],
        "historical_files": 53,
        "current_candidate_files": 33,
        "assignments": 16,
        "features": 3888,
        "features_per_assignment": 243,
        "v3_failure_preserved": True,
        "v4_failure_preserved": True,
        "next_gate": "one fresh independent Luna prelaunch-v5 review; no activation before unqualified pass",
    }
    write_new(BASE / "terminal-preparation-report-v5.json", json.dumps(report, indent=2, sort_keys=True).encode() + b"\n")
    return {"terminal_report_sha256": sha(BASE / "terminal-preparation-report-v5.json"), "tests": tests["total"]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--terminal", action="store_true")
    parser.add_argument("--verifier-report")
    parser.add_argument("--test-report")
    args = parser.parse_args()
    result = terminal(Path(args.verifier_report), Path(args.test_report)) if args.terminal else prepare()
    print(json.dumps(result, indent=2, sort_keys=True))
