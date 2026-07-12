#!/usr/bin/env python3
"""Fail-closed verifier for the isolated Draft 2020-12 dependency bundle."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import sysconfig
import zipfile
from pathlib import Path
from typing import Any

BUNDLE = Path(__file__).resolve().parents[1]
AUDIT_ROOT = BUNDLE.parents[2]
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = BUNDLE / "site-packages"
WHEELS = BUNDLE / "wheels"
FIXTURE = BUNDLE / "fixtures/known-good-result.json"
SCHEMA = AUDIT_ROOT / "master/external_research/universal-shadow-certification-wave-0001/schemas/result.schema.json"
FAIL_REPORT = AUDIT_ROOT / "master/external_research/universal-shadow-certification-wave-0001/validation/sol-fresh-independent-prelaunch.json"
AUTHORITY = BUNDLE / "dependency_authority.json"
SOURCE_REGISTRY = BUNDLE / "source_registry.json"
WHEEL_MANIFEST = BUNDLE / "wheel_manifest.jsonl"
REQUIREMENTS = BUNDLE / "requirements.lock"
INSTALL_RECEIPT = BUNDLE / "install_receipt.json"
TESTS = BUNDLE / "tests/test_dependency_bundle.py"

EXPECTED_WHEELS = {
    "attrs-26.1.0-py3-none-any.whl": {"name": "attrs", "version": "26.1.0", "sha256": "c647aa4a12dfbad9333ca4e71fe62ddc36f4e63b2d260a37a8b83d2f043ac309", "size": 67548},
    "jsonschema-4.26.0-py3-none-any.whl": {"name": "jsonschema", "version": "4.26.0", "sha256": "d489f15263b8d200f8387e64b4c3a75f06629559fb73deb8fdfb525f2dab50ce", "size": 90630},
    "jsonschema_specifications-2025.9.1-py3-none-any.whl": {"name": "jsonschema-specifications", "version": "2025.9.1", "sha256": "98802fee3a11ee76ecaca44429fda8a41bff98b00a0f2838151b113f210cc6fe", "size": 18437},
    "referencing-0.37.0-py3-none-any.whl": {"name": "referencing", "version": "0.37.0", "sha256": "381329a9f99628c9069361716891d34ad94af76e461dcb0335825aecc7692231", "size": 26766},
    "rpds_py-2026.6.3-cp312-cp312-macosx_11_0_arm64.whl": {"name": "rpds-py", "version": "2026.6.3", "sha256": "538949e262e46caa31ac01bdb3c1e8f642622922cacbabbae6a8445d9dc33eaf", "size": 338542},
    "typing_extensions-4.16.0-py3-none-any.whl": {"name": "typing-extensions", "version": "4.16.0", "sha256": "481caa481374e813c1b176ada14e97f1f67a4539ce9cfeb3f350d78d6370c2e8", "size": 45571},
}
EXPECTED_REQUIREMENTS_SHA = "a70d91fb9e7a4efbdded91709cb942d65be08c94f7ea58e473b3f0b1c190996d"
EXPECTED_SCHEMA_SHA = "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1"
EXPECTED_FAIL_REPORT_SHA = "7a5c0302d37af6e5901f59dbf0fb561049fc70d16a06751996580a5b47a264bf"
EXPECTED_FIXTURE_SHA = "56bd9ea8beb1d1134398bff30c96f92c4ef3cd652b0670b061b92561e4d45885"
EXPECTED_PACKAGES = {
    "attrs": ("26.1.0", "MIT"),
    "jsonschema": ("4.26.0", "MIT"),
    "jsonschema-specifications": ("2025.9.1", "MIT"),
    "referencing": ("0.37.0", "MIT"),
    "rpds-py": ("2026.6.3", "MIT"),
    "typing-extensions": ("4.16.0", "PSF-2.0"),
}


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha_path(path: Path) -> str | None:
    try:
        return sha_bytes(path.read_bytes())
    except OSError:
        return None


def canonical_digest(value: Any) -> str:
    return sha_bytes(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def tree_snapshot(root: Path) -> tuple[str, list[dict[str, Any]]]:
    rows: list[dict[str, Any]] = []
    if root.is_dir():
        for path in sorted(root.rglob("*"), key=lambda item: str(item)):
            if path.is_file():
                raw = path.read_bytes()
                rows.append({"path": str(path.relative_to(root)), "size": len(raw), "sha256": sha_bytes(raw)})
    return canonical_digest(rows), rows


def isolated_env() -> dict[str, str]:
    return {
        "PYTHONPATH": str(SITE.resolve()),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "PATH": os.environ.get("PATH", ""),
    }


def run_isolated(code: str) -> tuple[int, Any, str, str]:
    result = subprocess.run([str(PYTHON), "-S", "-B", "-c", code], env=isolated_env(), capture_output=True, text=True, check=False)
    try:
        value = json.loads(result.stdout)
    except Exception:
        value = {"unparseable_stdout": result.stdout[-4000:]}
    return result.returncode, value, result.stdout, result.stderr


def run_strict_tests() -> tuple[int, dict[str, Any], str, str]:
    result = subprocess.run([str(PYTHON), "-S", "-B", str(TESTS.resolve())], env=isolated_env(), capture_output=True, text=True, check=False)
    try:
        value = json.loads(result.stdout)
    except Exception:
        value = {"status": "unparseable", "stdout": result.stdout[-4000:], "stderr": result.stderr[-4000:]}
    return result.returncode, value, result.stdout, result.stderr


def wheel_manifest_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with WHEEL_MANIFEST.open(encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def metadata_from_wheel(path: Path) -> dict[str, Any]:
    metadata: dict[str, Any] = {"Requires-Dist": []}
    with zipfile.ZipFile(path) as archive:
        metadata_name = next(item for item in archive.namelist() if item.endswith(".dist-info/METADATA"))
        for line in archive.read(metadata_name).decode("utf-8").splitlines():
            if line.startswith("Name: "):
                metadata["Name"] = line[6:]
            elif line.startswith("Version: "):
                metadata["Version"] = line[9:]
            elif line.startswith("Requires-Python: "):
                metadata["Requires-Python"] = line[18:]
            elif line.startswith("License-Expression: "):
                metadata["License-Expression"] = line[20:]
            elif line.startswith("Requires-Dist: "):
                metadata["Requires-Dist"].append(line[16:])
    return metadata


def static_checks() -> tuple[list[str], dict[str, Any]]:
    errors: list[str] = []
    evidence: dict[str, Any] = {}
    required = (PYTHON, SITE, WHEELS, FIXTURE, SCHEMA, FAIL_REPORT, AUTHORITY, SOURCE_REGISTRY, WHEEL_MANIFEST, REQUIREMENTS, TESTS)
    for path in required:
        if not path.exists():
            errors.append(f"missing:{path}")
    evidence["runtime"] = {"path": str(PYTHON), "version": "3.12.13", "platform": "macosx-11.0-arm64"}
    evidence["requirements_sha256"] = sha_path(REQUIREMENTS)
    if evidence["requirements_sha256"] != EXPECTED_REQUIREMENTS_SHA:
        errors.append("requirements:hash")
    if sha_path(SCHEMA) != EXPECTED_SCHEMA_SHA:
        errors.append("immutable-result-schema:hash")
    if sha_path(FAIL_REPORT) != EXPECTED_FAIL_REPORT_SHA:
        errors.append("independent-fail-report:hash")
    if sha_path(FIXTURE) != EXPECTED_FIXTURE_SHA:
        errors.append("known-good-fixture:hash")

    actual_wheel_names = sorted(path.name for path in WHEELS.glob("*.whl")) if WHEELS.is_dir() else []
    if actual_wheel_names != sorted(EXPECTED_WHEELS):
        errors.append("wheels:exact-set")
    rows = wheel_manifest_rows() if WHEEL_MANIFEST.is_file() else []
    evidence["wheel_manifest_sha256"] = sha_path(WHEEL_MANIFEST)
    if len(rows) != len(EXPECTED_WHEELS):
        errors.append("wheel-manifest:count")
    row_by_filename = {row.get("filename"): row for row in rows}
    for filename, expected in EXPECTED_WHEELS.items():
        path = WHEELS / filename
        actual_sha = sha_path(path)
        actual_size = path.stat().st_size if path.is_file() else None
        if actual_sha != expected["sha256"] or actual_size != expected["size"]:
            errors.append(f"wheel:{filename}:bytes")
        row = row_by_filename.get(filename, {})
        for key in ("name", "version", "sha256", "size"):
            if row.get(key) != expected[key]:
                errors.append(f"wheel-manifest:{filename}:{key}")
        url = row.get("url", "")
        if not url.startswith("https://files.pythonhosted.org/"):
            errors.append(f"wheel-manifest:{filename}:official-url")
        metadata = metadata_from_wheel(path) if path.is_file() else {}
        metadata_name = str(metadata.get("Name", "")).replace("_", "-").lower()
        expected_name = expected["name"].replace("_", "-").lower()
        if metadata_name != expected_name or metadata.get("Version") != expected["version"]:
            errors.append(f"wheel-metadata:{filename}:identity")
        if metadata.get("License-Expression") != EXPECTED_PACKAGES[expected["name"]][1]:
            errors.append(f"wheel-metadata:{filename}:license")
        evidence.setdefault("wheel_metadata", {})[filename] = metadata

    registry = load_json(SOURCE_REGISTRY) if SOURCE_REGISTRY.is_file() else {}
    packages = registry.get("packages", []) if isinstance(registry, dict) else []
    by_name = {row.get("name"): row for row in packages if isinstance(row, dict)}
    if registry.get("official_source_restriction") is not True or registry.get("non_official_sources_used") != []:
        errors.append("source-registry:official-only")
    if set(by_name) != set(EXPECTED_PACKAGES):
        errors.append("source-registry:package-set")
    for name, (version, license_expression) in EXPECTED_PACKAGES.items():
        row = by_name.get(name, {})
        if row.get("version") != version or row.get("license_expression") != license_expression:
            errors.append(f"source-registry:{name}:identity")
        for key in ("pypi_project_url", "pypi_json_url", "pypi_release_url", "file_url", "source_url"):
            if not isinstance(row.get(key), str) or not row[key].startswith("https://"):
                errors.append(f"source-registry:{name}:{key}")
        if "pypi.org" not in row.get("pypi_project_url", "") or "files.pythonhosted.org" not in row.get("file_url", ""):
            errors.append(f"source-registry:{name}:host")
    evidence["source_registry_sha256"] = sha_path(SOURCE_REGISTRY)

    authority = load_json(AUTHORITY) if AUTHORITY.is_file() else {}
    if authority.get("status") != "ISOLATED_OFFLINE_BUNDLE":
        errors.append("authority:status")
    if authority.get("runtime", {}).get("python_executable") != str(PYTHON):
        errors.append("authority:runtime")
    contract = authority.get("validator_contract", {})
    if contract.get("validator_class") != "jsonschema.Draft202012Validator":
        errors.append("authority:validator-class")
    if contract.get("meta_schema_id") != "https://json-schema.org/draft/2020-12/schema":
        errors.append("authority:meta-schema")
    if contract.get("immutable_result_schema_sha256") != EXPECTED_SCHEMA_SHA:
        errors.append("authority:schema-binding")
    if contract.get("independent_fail_report_sha256") != EXPECTED_FAIL_REPORT_SHA:
        errors.append("authority:fail-report-binding")
    offline = authority.get("offline_install", {})
    if offline.get("no_index") is not True or offline.get("require_hashes") is not True or offline.get("global_install_forbidden") is not True:
        errors.append("authority:offline-contract")
    evidence["authority_sha256"] = sha_path(AUTHORITY)

    lock_text = REQUIREMENTS.read_text(encoding="utf-8") if REQUIREMENTS.is_file() else ""
    for expected in EXPECTED_WHEELS.values():
        if f"{expected['name']}=={expected['version']}" not in lock_text or f"--hash=sha256:{expected['sha256']}" not in lock_text:
            errors.append(f"requirements:{expected['name']}")
    evidence["site_tree_sha256"], evidence["site_tree_files"] = tree_snapshot(SITE)
    evidence["site_tree_has_pyc"] = any(row["path"].endswith(".pyc") or "__pycache__" in row["path"] for row in evidence["site_tree_files"])
    if evidence["site_tree_has_pyc"]:
        errors.append("site-tree:unexpected-pyc")
    return sorted(set(errors)), evidence


def isolated_probe() -> tuple[list[str], dict[str, Any]]:
    code = f'''import json, sys, sysconfig
from pathlib import Path
SITE = Path({str(SITE.resolve())!r})
SCHEMA = Path({str(SCHEMA.resolve())!r})
FIXTURE = Path({str(FIXTURE.resolve())!r})
import attrs, jsonschema, jsonschema_specifications, referencing, rpds, typing_extensions
from jsonschema import Draft202012Validator, FormatChecker
schema = json.loads(SCHEMA.read_text())
fixture = json.loads(FIXTURE.read_text())
Draft202012Validator.check_schema(Draft202012Validator.META_SCHEMA)
Draft202012Validator.check_schema(schema)
validator = Draft202012Validator(schema, format_checker=FormatChecker())
schema_errors = list(validator.iter_errors(fixture))
stdlib = [Path(sysconfig.get_paths()[key]).resolve() for key in ("stdlib", "platstdlib") if sysconfig.get_paths().get(key)]
def allowed(path):
    p = Path(path).resolve()
    return any(p == SITE or SITE in p.parents or p == root or root in p.parents for root in stdlib)
module_files = {{name: str(Path(module.__file__).resolve()) for name, module in [("jsonschema", jsonschema), ("attrs", attrs), ("jsonschema_specifications", jsonschema_specifications), ("referencing", referencing), ("rpds", rpds), ("typing_extensions", typing_extensions)]}}
outside = []
for name, module in sorted(sys.modules.items()):
    path = getattr(module, "__file__", None)
    if path and not allowed(path):
        outside.append({{"module": name, "path": str(Path(path).resolve())}})
print(json.dumps({{"jsonschema_version": jsonschema.__version__, "jsonschema_path": module_files["jsonschema"], "module_files": module_files, "outside_imports": outside, "draft_validator": Draft202012Validator.__name__, "meta_schema_id": Draft202012Validator.META_SCHEMA.get("$id"), "format_checker": FormatChecker.__name__, "schema_error_count": len(schema_errors), "schema_check_passed": True, "fixture_valid": not schema_errors, "sys_path": sys.path}}, sort_keys=True))
'''
    code_rc, value, stdout, stderr = run_isolated(code)
    errors: list[str] = []
    if code_rc != 0:
        errors.append(f"isolated-probe:exit:{code_rc}")
    if not isinstance(value, dict):
        errors.append("isolated-probe:unparseable")
    if value.get("jsonschema_version") != "4.26.0":
        errors.append("isolated-probe:version")
    if not value.get("jsonschema_path", "").startswith(str(SITE.resolve())):
        errors.append("isolated-probe:jsonschema-path")
    if value.get("draft_validator") != "Draft202012Validator":
        errors.append("isolated-probe:validator")
    if value.get("meta_schema_id") != "https://json-schema.org/draft/2020-12/schema":
        errors.append("isolated-probe:meta-schema")
    if value.get("format_checker") != "FormatChecker":
        errors.append("isolated-probe:format-checker")
    if value.get("schema_check_passed") is not True or value.get("schema_error_count") != 0:
        errors.append("isolated-probe:schema-check")
    if value.get("fixture_valid") is not True:
        errors.append("isolated-probe:fixture")
    if value.get("outside_imports") != []:
        errors.append("isolated-probe:outside-import")
    return sorted(set(errors)), value


def main() -> None:
    allow_missing_receipt = "--allow-missing-receipt" in sys.argv
    errors, evidence = static_checks()
    probe_errors, probe = isolated_probe()
    errors.extend(probe_errors)
    test_rc, test_report, test_stdout, test_stderr = run_strict_tests()
    if test_rc != 0 or test_report.get("status") != "pass":
        errors.append("strict-tests:status")
    if test_report.get("counts", {}).get("failed") != 0 or test_report.get("counts", {}).get("total", 0) < 100:
        errors.append("strict-tests:count")
    if test_report.get("bypass_reproductions", {}).get("rejected") != 12 or test_report.get("bypass_reproductions", {}).get("total") != 12:
        errors.append("strict-tests:bypass-closure")
    if test_report.get("validator") != "jsonschema.Draft202012Validator" or test_report.get("format_checker") != "jsonschema.FormatChecker":
        errors.append("strict-tests:engine")
    evidence["strict_tests"] = test_report

    receipt = load_json(INSTALL_RECEIPT) if INSTALL_RECEIPT.is_file() else {}
    evidence["install_receipt_sha256"] = sha_path(INSTALL_RECEIPT)
    if not INSTALL_RECEIPT.is_file() and not allow_missing_receipt:
        errors.append("install-receipt:missing")
    if INSTALL_RECEIPT.is_file():
        if receipt.get("status") != "installed_offline":
            errors.append("install-receipt:status")
        if receipt.get("site_tree_sha256") != evidence.get("site_tree_sha256"):
            errors.append("install-receipt:site-tree")
        if receipt.get("wheel_manifest_sha256") != evidence.get("wheel_manifest_sha256"):
            errors.append("install-receipt:wheel-manifest")
        if receipt.get("requirements_lock_sha256") != evidence.get("requirements_sha256"):
            errors.append("install-receipt:requirements")
        if receipt.get("strict_tests", {}).get("test_digest") != test_report.get("test_digest"):
            errors.append("install-receipt:test-digest")
        if receipt.get("strict_tests", {}).get("counts") != test_report.get("counts"):
            errors.append("install-receipt:test-counts")
        if receipt.get("import_probe", {}).get("jsonschema_version") != probe.get("jsonschema_version"):
            errors.append("install-receipt:probe-version")

    report = {
        "schema_version": "audit005-jsonschema-draft202012-dependency-verification-v1",
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "bundle": "master/dependencies/jsonschema-draft202012-v1",
        "status": "READY_FOR_VALIDATOR_V2_BINDING" if not errors else "FAIL_CLOSED",
        "errors": sorted(set(errors)),
        "runtime": evidence.get("runtime"),
        "isolated_invocation": "PYTHONNOUSERSITE=1 PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=<bundle>/site-packages <bundled-python> -S -B",
        "network_dependency_after_install": False,
        "packages": {name: {"version": values[0], "license_expression": values[1]} for name, values in EXPECTED_PACKAGES.items()},
        "wheel_manifest_sha256": evidence.get("wheel_manifest_sha256"),
        "requirements_lock_sha256": evidence.get("requirements_sha256"),
        "source_registry_sha256": evidence.get("source_registry_sha256"),
        "dependency_authority_sha256": evidence.get("authority_sha256"),
        "install_receipt_sha256": evidence.get("install_receipt_sha256"),
        "installed_site_tree_sha256": evidence.get("site_tree_sha256"),
        "installed_site_tree_file_count": len(evidence.get("site_tree_files", [])),
        "immutable_inputs": {"result_schema_sha256": EXPECTED_SCHEMA_SHA, "independent_fail_report_sha256": EXPECTED_FAIL_REPORT_SHA, "known_good_fixture_sha256": EXPECTED_FIXTURE_SHA},
        "engine": probe,
        "strict_tests": {"status": test_report.get("status"), "counts": test_report.get("counts"), "test_digest": test_report.get("test_digest"), "bypass_reproductions": test_report.get("bypass_reproductions"), "errors": test_report.get("errors", [])},
        "official_source_registry": str(SOURCE_REGISTRY.resolve()),
        "offline_install_receipt": str(INSTALL_RECEIPT.resolve()),
        "activation_unchanged": {"activation_authorized": False, "launch_authorized": False, "certification_credit": 0, "validator_candidate_files_modified": False},
    }
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    raise SystemExit(0 if report["status"] == "READY_FOR_VALIDATOR_V2_BINDING" else 1)


if __name__ == "__main__":
    main()
