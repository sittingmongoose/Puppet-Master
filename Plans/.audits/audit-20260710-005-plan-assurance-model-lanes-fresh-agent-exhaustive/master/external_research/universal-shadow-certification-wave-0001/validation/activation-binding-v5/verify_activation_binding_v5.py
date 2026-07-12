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
AUTHORITY = BASE / "authority-v5.json"
HIST = BASE / "historical-byte-manifest-v5.jsonl"
CAND = BASE / "current-candidate-byte-manifest-v5.jsonl"
V3_FAIL = WAVE / "validation/activation-binding-v3/luna-independent-prelaunch-v3.json"
V4_FAIL = WAVE / "validation/activation-binding-v4/luna-independent-prelaunch-v4.json"
HEX = set("0123456789abcdef")


class BindingError(RuntimeError):
    pass


def require(value, message):
    if not value:
        raise BindingError(message)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def safe_relative(value):
    if not isinstance(value, str) or not value or value.startswith("/") or "\\" in value:
        return False
    p = Path(value)
    return not p.is_absolute() and ".." not in p.parts


def validate_manifest_rows(rows, expected_count, scope, check_files=True):
    require(isinstance(rows, list) and len(rows) == expected_count, f"{scope}-count")
    seen = set()
    for row in rows:
        require(isinstance(row, dict) and set(row) == {"path", "sha256", "size"}, f"{scope}-keys")
        rel = row["path"]
        require(safe_relative(rel) and rel not in seen, f"{scope}-path")
        seen.add(rel)
        require(isinstance(row["sha256"], str) and len(row["sha256"]) == 64 and set(row["sha256"]) <= HEX, f"{scope}-sha")
        require(isinstance(row["size"], int) and row["size"] >= 0, f"{scope}-size")
        if check_files:
            path = AUDIT / rel
            require(path.is_file() and not path.is_symlink(), f"{scope}-file:{rel}")
            require(path.stat().st_size == row["size"] and sha(path) == row["sha256"], f"{scope}-bytes:{rel}")


def scoped_historical_paths():
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


def validate_authority_data(data):
    require(data.get("schema_version") == "universal-shadow-certification-activation-binding-authority-v5", "authority-schema")
    require(data.get("status") == "BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH_V5", "authority-status")
    require(data.get("activation_authorized") is False and data.get("certification_credit") == 0, "authority-credit")
    hist = data.get("historical_scope", {})
    require(hist.get("file_count") == 53 and hist.get("legacy_root_sha256") == "c46e6b6ce110c4fec3743380af606f958b622b05be87d13e8e96ae3a5ebd871f", "historical-root")
    require(hist.get("byte_sorted_root_sha256") == "d7fb0f2306d0ba2893f4fd4dc3e849b2d3521d43c39cf9f1075b716e289b9003", "historical-byte-root")
    require(hist.get("excluded_append_only_namespaces") == ["validation/activation-binding-v3/", "validation/activation-binding-v4/", "validation/activation-binding-v5/"], "historical-exclusions")
    require(hist.get("additional_exclusions_permitted") is False, "historical-extra-exclusions")
    cand = data.get("current_candidate_scope", {})
    require(cand.get("file_count") == 33 and cand.get("packet_count") == cand.get("intent_count") == 16 and cand.get("schema_count") == 1, "candidate-count")
    require(cand.get("assignments") == 16 and cand.get("features") == 3888 and cand.get("features_per_assignment") == 243, "candidate-topology")
    require(cand.get("packet_root_sha256") == "2ef4c307455eae300ade6c487a2816469c2551e9e8afc76014c700c2a8e29926", "packet-root")
    require(cand.get("intent_root_sha256") == "e9e009c14c3e0fb9c1ced388a3300c030822c5d7984b86923e65661e85db42fe", "intent-root")
    require(cand.get("result_schema_sha256") == "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1", "schema")
    lineage = data.get("failure_lineage", {})
    require(lineage.get("v3_independent_failure_sha256") == "c6da2d69cb2950ec2ed1cfbcfa80900af3c317daae0e660f2b4dd6c4868dddb5" and lineage.get("v3_failure_reinterpreted") is False, "v3-lineage")
    require(lineage.get("v4_independent_failure_sha256") == "9c3927dd6d36e8552209a74fbb0adf085f302aef2c0486b4ab2cc7caea28ca82" and lineage.get("v4_failure_suppressed") is False, "v4-lineage")
    require(data.get("zero_state_required") == {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "all_credits": 0}, "zero-state-contract")
    tools = data.get("tool_hashes", {})
    require(tools.get("builder_sha256") == sha(BASE / "build_activation_binding_v5.py"), "builder-hash")
    require(tools.get("verifier_sha256") == sha(BASE / "verify_activation_binding_v5.py"), "verifier-hash")
    require(tools.get("tests_sha256") == sha(BASE / "test_activation_binding_v5.py"), "tests-hash")


def validate_preparation():
    errors = []
    try:
        authority = json.loads(AUTHORITY.read_text())
        validate_authority_data(authority)
        hist_rows, cand_rows = read_jsonl(HIST), read_jsonl(CAND)
        validate_manifest_rows(hist_rows, 53, "historical")
        validate_manifest_rows(cand_rows, 33, "candidate")
        require(sha(HIST) == authority["historical_scope"]["manifest_sha256"], "historical-manifest-hash")
        require(sha(CAND) == authority["current_candidate_scope"]["manifest_sha256"], "candidate-manifest-hash")
        require([str(p.relative_to(AUDIT)) for p in scoped_historical_paths()] == [row["path"] for row in hist_rows], "historical-scope-closure")
        require(sha(V3_FAIL) == "c6da2d69cb2950ec2ed1cfbcfa80900af3c317daae0e660f2b4dd6c4868dddb5", "v3-fail-bytes")
        require(sha(V4_FAIL) == "9c3927dd6d36e8552209a74fbb0adf085f302aef2c0486b4ab2cc7caea28ca82", "v4-fail-bytes")
        v4 = json.loads(V4_FAIL.read_text())
        require(v4.get("status") == "fail_closed" and len(v4.get("errors", [])) == 1, "v4-fail-status")
        manifest = read_jsonl(WAVE / "batch_manifest.jsonl")
        require(len(manifest) == 16, "assignment-count")
        output_dirs = [Path(row["output_directory"]) for row in manifest]
        require(all(p.is_dir() and not any(p.iterdir()) for p in output_dirs), "outputs-not-empty")
        intents = [json.loads(Path(row["dispatch_intent_path"]).read_text()) for row in manifest]
        require(not any(Path(intent["dispatch_receipt_ref"]).exists() for intent in intents), "receipt-present")
        require(not any((WAVE / name).exists() for name in ("activation.json", "activation-v2.json", "activation-v3.json", "activation-v4.json", "activation-v5.json")), "activation-present")
    except Exception as exc:
        errors.append(f"{type(exc).__name__}: {exc}")
    return {"schema_version": "activation-binding-v5-verifier-report", "status": "pass" if not errors else "fail", "errors": errors, "historical_files": 53, "candidate_files": 33, "assignments": 16, "features": 3888, "outputs": 16, "output_files": 0, "activation_authorized": False, "certification_credit": 0}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(); parser.add_argument("--write-report")
    args = parser.parse_args(); result = validate_preparation(); raw = json.dumps(result, indent=2, sort_keys=True).encode() + b"\n"
    if args.write_report:
        path = Path(args.write_report)
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
        with os.fdopen(fd, "wb") as stream: stream.write(raw)
    print(raw.decode(), end="")
    raise SystemExit(0 if result["status"] == "pass" else 1)
