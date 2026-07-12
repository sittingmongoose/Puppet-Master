#!/usr/bin/env python3
"""Verify the append-only v8 validator/runtime supersession without launching."""
from __future__ import annotations

import hashlib
import json
import os
import pathlib
import subprocess
import sys
from typing import Any

ROOT = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = ROOT / "master/external_research/universal-shadow-certification-wave-0001"
HERE = WAVE / "validation/activation-binding-v8-validator-runtime-supersession"
V2 = WAVE / "validation/postrun-validator-v2"
PYTHON = pathlib.Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = ROOT / "master/dependencies/jsonschema-draft202012-v1/site-packages"

EXPECTED = {
    "authority": (HERE / "AUTHORITY_V8.json", "f36db3670c6d33f4c3bac0832ac9f788ea6193d5dacf5b4f9f608bbb1d51258c"),
    "v6_fail": (WAVE / "validation/activation-binding-v6/luna-independent-prelaunch-v6.json", "03897db27ebe3be42a55939dd513146a2aea05d5a9ee171937960b085316bb1a"),
    "v7_atomic8": (WAVE / "validation/activation-binding-v7-atomic8/terminal-preparation-report-v7-atomic8.json", "6a31474c4e6943e812776739cf87a7efeeba6cda1937bc0a94d645cf145839e1"),
    "validator_v2": (V2 / "validate_universal_shadow_certification_postrun_v2.py", "789bca95c1dbd8ef89a5db06c041c23c67ef330324552ebb1e3602fd24cfa254"),
    "tests_v2": (V2 / "test_universal_shadow_certification_postrun_v2.py", "f42b563c1c13010695f2ab3cab37eef4d763738928c48655f59a5a746ce79961"),
    "authority_v2": (V2 / "VALIDATOR_AUTHORITY_V2.json", "9eec930af0efebee5734892d2d0d9e5836a2bb79928c817492cd73a1ea7d4b97"),
    "result_schema": (WAVE / "schemas/result.schema.json", "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1"),
    "dependency_binding": (V2 / "dependency-binding-v1/terminal-independent-binding-report.json", "f5cb2e7cc0bb51153c606a37f2808df33a4f815270712cd1f92b427707347b37"),
    "cache_v3_authority": (ROOT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/authority.json", "f82c8796be8802ac3735c4e24c74b48b54efe2752e0a294c2844d7f98b2a03bc"),
    "cache_v3_report": (ROOT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/terminal-cache-reconciliation-v3.json", "1b7b88edbcba737e81a02fc81e0b87600c58e3be300f91429c9d61dec653e88e"),
    "manifest": (WAVE / "batch_manifest.jsonl", "f41c967a3d2650031c0b8c74a83c410ca168aa8704131b6986c1c70309e68295"),
    "v25": (ROOT / "master/coordination/CONCURRENCY_POLICY_V25.json", "f2e0cd20f5612b8d6fa1d1946ee03f15b3f26138a38189a410926f4f69f0f63b"),
    "v26": (ROOT / "master/coordination/CONCURRENCY_POLICY_V26.json", "dc8b6856705325223b70822d31f28abe0ef32e6153f57d4fea924b4eaf0dba68"),
    "frozen_source": (ROOT / "master/coordination/CONCURRENT_CANONICAL_CHANGE_POLICY_V1.json", "b227f14a04aae9ddce62440002af2c76528a1433c4e440df613490865f9f444e"),
    "routing_v2": (ROOT / "master/coordination/MODEL_LANE_ROUTING_POLICY_V2.json", "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544"),
}

def sha(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path: pathlib.Path) -> Any:
    return json.loads(path.read_text())

def rows(path: pathlib.Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]

def resolved(value: str, base: pathlib.Path = ROOT) -> pathlib.Path:
    path = pathlib.Path(value)
    return path if path.is_absolute() else base / path

def isolated_env() -> dict[str, str]:
    return {
        "PATH": str(PYTHON.parent) + os.pathsep + os.environ.get("PATH", ""),
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
    }

def run_v2_suite() -> tuple[dict[str, Any], int, str]:
    proc = subprocess.run(
        [str(PYTHON), "-S", "-B", str(V2 / "test_universal_shadow_certification_postrun_v2.py")],
        cwd=ROOT, env=isolated_env(), capture_output=True, text=True, check=False,
    )
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    return report, proc.returncode, proc.stderr[-2000:]

def engine_probe() -> tuple[dict[str, Any], int]:
    code = '''import importlib.metadata,json,pathlib,platform,jsonschema\nfrom jsonschema import Draft202012Validator,FormatChecker\nDraft202012Validator.check_schema(Draft202012Validator.META_SCHEMA)\nprint(json.dumps({"version":importlib.metadata.version("jsonschema"),"validator":"jsonschema.Draft202012Validator","format_checker":"jsonschema.FormatChecker","meta_schema":Draft202012Validator.META_SCHEMA.get("$id"),"path":str(pathlib.Path(jsonschema.__file__).resolve()),"python":platform.python_version()},sort_keys=True))'''
    proc = subprocess.run([str(PYTHON), "-S", "-B", "-c", code], cwd=ROOT, env=isolated_env(), capture_output=True, text=True, check=False)
    try: value = json.loads(proc.stdout)
    except Exception: value = {"error": proc.stderr[-2000:]}
    return value, proc.returncode

def main() -> None:
    checks: dict[str, bool] = {}
    initial = {name: sha(path) for name, (path, _) in EXPECTED.items()}
    for name, (_, expected) in EXPECTED.items():
        checks[f"hash:{name}"] = initial[name] == expected

    fail = load(EXPECTED["v6_fail"][0])
    checks["v6:status_fail_closed"] = fail.get("status") == "FAIL_CLOSED"
    checks["v6:exact_errors"] = fail.get("errors") == ["VALIDATOR_SEMANTIC_SCHEMA_BYPASS_UNRESOLVED", "COMMON_MODE_V6_TEST_HARNESS_SYNTHETIC_COUNTER"]
    checks["v6:activation_forbidden"] = fail.get("decision", {}).get("activation_authorized") is False
    checks["v6:credits_zero"] = all(value == 0 for value in fail.get("credits", {}).values())

    cache = load(EXPECTED["cache_v3_report"][0])
    checks["cache:pass"] = cache.get("status") == "PASS"
    checks["cache:semantic_152"] = cache.get("semantic_file_count") == 152
    checks["cache:semantic_root"] = cache.get("semantic_tree_sha256") == "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95"
    checks["cache:non_authoritative"] = cache.get("runtime_caches_authoritative") is False

    engine, engine_rc = engine_probe()
    checks["engine:rc"] = engine_rc == 0
    checks["engine:version"] = engine.get("version") == "4.26.0"
    checks["engine:validator"] = engine.get("validator") == "jsonschema.Draft202012Validator"
    checks["engine:format_checker"] = engine.get("format_checker") == "jsonschema.FormatChecker"
    checks["engine:meta_schema"] = engine.get("meta_schema") == "https://json-schema.org/draft/2020-12/schema"
    checks["engine:python"] = engine.get("python") == "3.12.13"
    checks["engine:isolated_path"] = str(engine.get("path", "")).startswith(str(SITE.resolve()))

    manifest = rows(WAVE / "batch_manifest.jsonl")
    checks["topology:assignment_count"] = len(manifest) == 16
    checks["topology:ordered_ids"] = [r.get("assignment_id") for r in manifest] == [f"A005ERSC-{i:04d}" for i in range(1, 17)]
    all_features: list[str] = []
    for row in manifest:
        aid = row["assignment_id"]
        output = pathlib.Path(row["output_directory"])
        packet = resolved(row["packet_ref"], WAVE)
        intent = resolved(row["intent_ref"], WAVE)
        local = {
            "feature_count": row.get("feature_count") == 243 and len(row.get("feature_refs", [])) == 243,
            "feature_unique": len(set(row.get("feature_refs", []))) == 243,
            "model": row.get("model") == "gpt-5.6-sol",
            "effort": row.get("reasoning_effort") == "xhigh",
            "fork_none": row.get("fork_turns") == "none",
            "fresh": row.get("fresh_child_required") is True,
            "packet_hash": packet.is_file() and sha(packet) == row.get("packet_sha256"),
            "intent_exists": intent.is_file(),
            "output_empty": output.is_dir() and not any(output.iterdir()),
            "source_domain_balance": len(row.get("owner_domain_counts", {})) == 16 and len(row.get("source_assignment_ids", [])) == 24,
        }
        for key, value in local.items(): checks[f"assignment:{aid}:{key}"] = value
        all_features.extend(row.get("feature_refs", []))
    checks["topology:feature_total"] = len(all_features) == 3888
    checks["topology:feature_unique"] = len(set(all_features)) == 3888

    suite, suite_rc, suite_stderr = run_v2_suite()
    counts = suite.get("counts", {})
    checks["suite:rc"] = suite_rc == 0
    checks["suite:status"] = suite.get("status") == "pass_fail_closed"
    checks["suite:437"] = counts.get("passed") == counts.get("total") == 437 and counts.get("failed") == 0
    checks["suite:12_bypasses"] = suite.get("bypass_reproductions", {}).get("rejected") == suite.get("bypass_reproductions", {}).get("total") == 12
    checks["suite:100_fuzz"] = suite.get("generic_schema_fuzz", {}).get("rejected") == suite.get("generic_schema_fuzz", {}).get("total") == 100
    checks["suite:real_engine"] = suite.get("schema_engine", {}).get("library_version") == "4.26.0" and suite.get("schema_specific_execution_available") is True

    closing = {name: sha(path) for name, (path, _) in EXPECTED.items()}
    checks["toctou:all_inputs_stable"] = closing == initial
    local_total = len(checks)
    local_passed = sum(checks.values())
    total = 437 + local_total
    passed = 437 + local_passed if checks.get("suite:437") else local_passed
    errors = sorted(name for name, ok in checks.items() if not ok)
    report = {
        "schema_version": "universal-shadow-certification-validator-runtime-supersession-verifier-v8",
        "status": "pass" if not errors else "fail_closed",
        "errors": errors,
        "tests": {"passed": passed, "failed": total - passed, "total": total, "substantive_v2_cases": 437, "local_live_checks": local_total},
        "checks": checks,
        "schema_engine": engine,
        "v2_suite": {"status": suite.get("status"), "counts": counts, "bypasses": suite.get("bypass_reproductions"), "schema_fuzz": suite.get("generic_schema_fuzz"), "stderr": suite_stderr},
        "topology": {"assignments": len(manifest), "features": len(all_features), "unique_features": len(set(all_features)), "empty_outputs": sum(1 for r in manifest if pathlib.Path(r["output_directory"]).is_dir() and not any(pathlib.Path(r["output_directory"]).iterdir()))},
        "zero_state": {"results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
        "activation_authorized": False,
        "launch_authorized": False,
        "fresh_luna_validation_required": True,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)

if __name__ == "__main__":
    main()
