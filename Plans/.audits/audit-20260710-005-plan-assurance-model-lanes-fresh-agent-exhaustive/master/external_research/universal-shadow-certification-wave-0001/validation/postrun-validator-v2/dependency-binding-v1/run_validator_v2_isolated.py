#!/usr/bin/env python3
"""Deterministic offline binding wrapper for validator-v2 and the isolated bundle."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import subprocess
import sys
from typing import Any

ROOT = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
BUNDLE = ROOT / "master/dependencies/jsonschema-draft202012-v1"
V2 = ROOT / "master/external_research/universal-shadow-certification-wave-0001/validation/postrun-validator-v2"
PYTHON = pathlib.Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = BUNDLE / "site-packages"

EXPECTED_FILE_HASHES = {
    "bundle_authority": (BUNDLE / "dependency_authority.json", "89d86715ed9760a2f9469733bf43cb6099784710b97bccf1b656e9520d0d3afb"),
    "bundle_install_receipt": (BUNDLE / "install_receipt.json", "f36f64777e31a3d993a3e1fc03ed4d46182b77667d20f81bba6eb5ffc56462f8"),
    "bundle_source_registry": (BUNDLE / "source_registry.json", "23ca01e5f0117b8f8637168c883dc99cd459387920629f6ee34be7985b9e9005"),
    "bundle_wheel_manifest": (BUNDLE / "wheel_manifest.jsonl", "c662aa4821ea4980210c248711d76afd25c6e296b9367458467f19f1a7665f40"),
    "bundle_requirements_lock": (BUNDLE / "requirements.lock", "a70d91fb9e7a4efbdded91709cb942d65be08c94f7ea58e473b3f0b1c190996d"),
    "bundle_verifier": (BUNDLE / "tools/verify_dependency.py", "5d1e1042a91cae9751e02fe162381c5bf88fd4bfaa11ae9452dc3e790828a7af"),
    "bundle_tests": (BUNDLE / "tests/test_dependency_bundle.py", "df8f330e29a6b72b8dc9c551f9653fbbd9d81dff0484200058f0d5fa5025a2ee"),
    "bundle_fixture": (BUNDLE / "fixtures/known-good-result.json", "56bd9ea8beb1d1134398bff30c96f92c4ef3cd652b0670b061b92561e4d45885"),
    "validator_v2": (V2 / "validate_universal_shadow_certification_postrun_v2.py", "789bca95c1dbd8ef89a5db06c041c23c67ef330324552ebb1e3602fd24cfa254"),
    "validator_v2_tests": (V2 / "test_universal_shadow_certification_postrun_v2.py", "f42b563c1c13010695f2ab3cab37eef4d763738928c48655f59a5a746ce79961"),
    "validator_v2_authority": (V2 / "VALIDATOR_AUTHORITY_V2.json", "9eec930af0efebee5734892d2d0d9e5836a2bb79928c817492cd73a1ea7d4b97"),
    "activation_contract_v2": (V2 / "activation-contract-supersession-v2.json", "c06a674aabe43c3f4732e1c51043c082dcf13a07757b0260380b2904030e2048"),
    "activation_generator_v2": (V2 / "activation-generator-v2.py", "6d3dfd17c25a1d7ec63b3be50f5912f5800a801260f53525fa230b7137a450bf"),
    "independent_v1_fail_report": (V2.parent / "sol-fresh-independent-prelaunch.json", "7a5c0302d37af6e5901f59dbf0fb561049fc70d16a06751996580a5b47a264bf"),
    "result_schema": (ROOT / "master/external_research/universal-shadow-certification-wave-0001/schemas/result.schema.json", "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1"),
}
EXPECTED_WHEELS = {
    "attrs-26.1.0-py3-none-any.whl": "c647aa4a12dfbad9333ca4e71fe62ddc36f4e63b2d260a37a8b83d2f043ac309",
    "jsonschema-4.26.0-py3-none-any.whl": "d489f15263b8d200f8387e64b4c3a75f06629559fb73deb8fdfb525f2dab50ce",
    "jsonschema_specifications-2025.9.1-py3-none-any.whl": "98802fee3a11ee76ecaca44429fda8a41bff98b00a0f2838151b113f210cc6fe",
    "referencing-0.37.0-py3-none-any.whl": "381329a9f99628c9069361716891d34ad94af76e461dcb0335825aecc7692231",
    "rpds_py-2026.6.3-cp312-cp312-macosx_11_0_arm64.whl": "538949e262e46caa31ac01bdb3c1e8f642622922cacbabbae6a8445d9dc33eaf",
    "typing_extensions-4.16.0-py3-none-any.whl": "481caa481374e813c1b176ada14e97f1f67a4539ce9cfeb3f350d78d6370c2e8",
}
EXPECTED_BUNDLE_TREE = "c6443f668a744e37689ddcbdab5ffa8bee957ff18df2bf41863e8e4dc49d82bb"
EXPECTED_BUNDLE_FILES = 167
EXPECTED_SITE_TREE = "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95"
EXPECTED_SITE_FILES = 152
EXPECTED_PYTHON_SHA = "eb9d74b9c7cfdfb2c9b91614edb2c3607360ba46c5aa7fc4557b3a4a23e97cff"
EXPECTED_ENGINE = {
    "available": True,
    "distribution": "jsonschema",
    "library_version": "4.26.0",
    "validator_class": "jsonschema.Draft202012Validator",
    "format_checker": "jsonschema.FormatChecker",
    "meta_schema_id": "https://json-schema.org/draft/2020-12/schema",
}


def sha(path: pathlib.Path) -> str | None:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        return None


def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def tree(root: pathlib.Path) -> tuple[str, int]:
    rows = []
    if root.is_dir():
        for path in sorted((item for item in root.rglob("*") if item.is_file()), key=lambda item: str(item)):
            raw = path.read_bytes()
            rows.append({"path": str(path.relative_to(root)), "size": len(raw), "sha256": hashlib.sha256(raw).hexdigest()})
    return digest(rows), len(rows)


def isolated_env() -> dict[str, str]:
    return {
        "PATH": os.environ.get("PATH", ""),
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
    }


def run_json(command: list[str]) -> tuple[int, dict[str, Any], str]:
    completed = subprocess.run(command, cwd=ROOT, env=isolated_env(), capture_output=True, text=True, check=False)
    try:
        parsed = json.loads(completed.stdout)
    except Exception:
        parsed = {"status": "unparseable", "stdout": completed.stdout[-2000:], "stderr": completed.stderr[-2000:]}
    return completed.returncode, parsed, completed.stderr


def engine_probe() -> dict[str, Any]:
    code = '''import importlib.metadata, json, pathlib, platform, sys, sysconfig
import jsonschema
from jsonschema import Draft202012Validator, FormatChecker
Draft202012Validator.check_schema(Draft202012Validator.META_SCHEMA)
print(json.dumps({"available": True, "distribution": "jsonschema", "library_version": importlib.metadata.version("jsonschema"), "validator_class": "jsonschema.Draft202012Validator", "format_checker": "jsonschema.FormatChecker", "meta_schema_id": Draft202012Validator.META_SCHEMA.get("$id"), "jsonschema_path": str(pathlib.Path(jsonschema.__file__).resolve()), "python_version": platform.python_version(), "implementation": platform.python_implementation(), "machine": platform.machine(), "sysconfig_platform": sysconfig.get_platform(), "sys_path": sys.path}, sort_keys=True))'''
    rc, value, stderr = run_json([str(PYTHON), "-S", "-B", "-c", code])
    if rc != 0:
        return {"available": False, "error": stderr[-2000:], "returncode": rc}
    return value


def capture_state() -> dict[str, Any]:
    bundle_tree, bundle_files = tree(BUNDLE)
    site_tree, site_files = tree(SITE)
    return {
        "file_hashes": {name: sha(path) for name, (path, _) in EXPECTED_FILE_HASHES.items()},
        "wheel_hashes": {name: sha(BUNDLE / "wheels" / name) for name in EXPECTED_WHEELS},
        "bundle_tree_sha256": bundle_tree,
        "bundle_file_count": bundle_files,
        "site_tree_sha256": site_tree,
        "site_file_count": site_files,
        "python_sha256": sha(PYTHON),
        "engine": engine_probe(),
    }


def validate_state(state: dict[str, Any]) -> list[str]:
    errors = []
    for name, (_, expected) in EXPECTED_FILE_HASHES.items():
        if state.get("file_hashes", {}).get(name) != expected:
            errors.append("file-hash:" + name)
    if state.get("wheel_hashes") != EXPECTED_WHEELS:
        for name, expected in EXPECTED_WHEELS.items():
            if state.get("wheel_hashes", {}).get(name) != expected:
                errors.append("wheel-hash:" + name)
        if set(state.get("wheel_hashes", {})) != set(EXPECTED_WHEELS):
            errors.append("wheel-set")
    for key, expected in {
        "bundle_tree_sha256": EXPECTED_BUNDLE_TREE,
        "bundle_file_count": EXPECTED_BUNDLE_FILES,
        "site_tree_sha256": EXPECTED_SITE_TREE,
        "site_file_count": EXPECTED_SITE_FILES,
        "python_sha256": EXPECTED_PYTHON_SHA,
    }.items():
        if state.get(key) != expected:
            errors.append("binding:" + key)
    engine = state.get("engine", {})
    for key, expected in EXPECTED_ENGINE.items():
        if engine.get(key) != expected:
            errors.append("engine:" + key)
    if not str(engine.get("jsonschema_path", "")).startswith(str(SITE.resolve())):
        errors.append("engine:path")
    if engine.get("python_version") != "3.12.13" or engine.get("implementation") != "CPython":
        errors.append("engine:python")
    if engine.get("machine") != "arm64" or engine.get("sysconfig_platform") != "macosx-11.0-arm64":
        errors.append("engine:platform")
    allowed = {"", str(SITE), "/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/lib/python312.zip", "/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/lib/python3.12", "/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/lib/python3.12/lib-dynload"}
    if set(engine.get("sys_path", [])) != allowed:
        errors.append("engine:sys-path")
    return sorted(set(errors))


def execute(mode: str) -> tuple[bool, dict[str, Any]]:
    if mode == "tests":
        rc, report, stderr = run_json([str(PYTHON), "-S", "-B", str(V2 / "test_universal_shadow_certification_postrun_v2.py")])
        counts = report.get("counts", {})
        good = rc == 0 and report.get("status") == "pass_fail_closed" and counts == {"failed": 0, "new_v2_tests": 138, "passed": 437, "total": 437} and report.get("bypass_reproductions", {}).get("rejected") == 12 and report.get("generic_schema_fuzz", {}).get("rejected") == 100 and report.get("schema_engine", {}).get("library_version") == "4.26.0" and report.get("schema_specific_execution_available") is True
        return good, {"returncode": rc, "status": report.get("status"), "counts": counts, "bypasses_rejected": report.get("bypass_reproductions", {}).get("rejected"), "schema_fuzz_rejected": report.get("generic_schema_fuzz", {}).get("rejected"), "schema_engine": report.get("schema_engine"), "stderr": stderr[-1000:]}
    rc, report, stderr = run_json([str(PYTHON), "-S", "-B", str(V2 / "validate_universal_shadow_certification_postrun_v2.py"), "--expected-jsonschema-version", "4.26.0"])
    counts = report.get("counts", {})
    good = rc == 1 and report.get("status") == "fail_closed" and report.get("schema_engine", {}).get("available") is True and report.get("schema_engine", {}).get("library_version") == "4.26.0" and counts == {"assignments": 16, "eligible": 0, "features": 3888, "native_capture_rows": 0, "receipts": 0, "rejected": 16, "results": 0, "unique_features": 3888} and report.get("certification_credit") == 0
    return good, {"returncode": rc, "status": report.get("status"), "counts": counts, "schema_engine": report.get("schema_engine"), "global_errors": report.get("global_errors"), "certification_credit": report.get("certification_credit"), "stderr": stderr[-1000:]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("tests", "validator", "probe"), default="tests")
    args = parser.parse_args()
    initial = capture_state()
    errors = validate_state(initial)
    execution_good, execution = (True, {"mode": "probe"}) if args.mode == "probe" else execute(args.mode)
    if not execution_good:
        errors.append("execution:" + args.mode)
    closing = capture_state()
    if closing != initial:
        errors.append("toctou:bundle-or-runtime-drift")
    report = {
        "schema_version": "universal-shadow-certification-validator-v2-isolated-wrapper-v1",
        "status": "pass" if not errors else "fail_closed",
        "mode": args.mode,
        "errors": sorted(set(errors)),
        "state": initial,
        "execution": execution,
        "toctou_stable": closing == initial,
        "network_required": False,
        "global_install_performed": False,
        "activation_generator_invoked": False,
        "credit_granted": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
