#!/usr/bin/env python3
"""Run the frozen 1576-case V1 suite plus audit-runtime negatives."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
from types import ModuleType
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

sys.dont_write_bytecode = True

import verify_runtime_compatibility_v2 as verify


HERE = Path(__file__).resolve().parent


def load_v1_test_module(v1_verify: ModuleType) -> ModuleType:
    module_name = "audit005_exhaustive299_v1_tests_frozen"
    if module_name in sys.modules:
        return sys.modules[module_name]
    spec = importlib.util.spec_from_file_location(module_name, verify.V1_ROOT / "test_preparation.py")
    if spec is None or spec.loader is None:
        raise verify.ValidationError("unable to load frozen V1 test suite")
    module = importlib.util.module_from_spec(spec)
    old = sys.modules.get("verify_preparation")
    sys.modules["verify_preparation"] = v1_verify
    try:
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
    finally:
        if old is None:
            sys.modules.pop("verify_preparation", None)
        else:
            sys.modules["verify_preparation"] = old
    return module


def run_v1_baseline() -> Dict[str, Any]:
    v1_verify = verify.load_v1_verifier()
    v1_test = load_v1_test_module(v1_verify)
    report = v1_test.run_suite()
    expected = {
        "case_id_digest": verify.V1_BASELINE_CASE_DIGEST,
        "failed": 0,
        "passed": verify.V1_BASELINE_TOTAL,
        "total": verify.V1_BASELINE_TOTAL,
    }
    actual = {key: report.get(key) for key in expected}
    if actual != expected:
        raise verify.ValidationError(f"frozen V1 test baseline drift: {actual!r}")
    if report.get("fail_closed_mutation_count") != 1570 or report.get("valid_fixture_count") != 6:
        raise verify.ValidationError("frozen V1 mutation/fixture framing drift")
    return report


def mutated_runtime_snapshots(base: Dict[str, Any]) -> List[Tuple[str, Dict[str, Any]]]:
    cases: List[Tuple[str, Dict[str, Any]]] = []

    def add(name: str, mutate: Callable[[Dict[str, Any]], None]) -> None:
        value = copy.deepcopy(base)
        mutate(value)
        cases.append((name, value))

    add("python-version-old", lambda v: v.__setitem__("python_version", "3.11.9"))
    add("python-version-new", lambda v: v.__setitem__("python_version", "3.13.0"))
    add("python-executable", lambda v: v.__setitem__("python_executable", "/usr/bin/python3"))
    add("jsonschema-version-old", lambda v: v.__setitem__("jsonschema_version", "4.25.1"))
    add("jsonschema-version-new", lambda v: v.__setitem__("jsonschema_version", "5.0.0"))
    add("jsonschema-module-path", lambda v: v.__setitem__("jsonschema_module_file", "/tmp/jsonschema/__init__.py"))
    add("pythonpath-missing", lambda v: v["environment"].__setitem__("PYTHONPATH", None))
    add("pythonpath-extra", lambda v: v["environment"].__setitem__("PYTHONPATH", str(verify.SITE_PACKAGES) + ":/tmp"))
    add("nousersite-missing", lambda v: v["environment"].__setitem__("PYTHONNOUSERSITE", None))
    add("nousersite-wrong", lambda v: v["environment"].__setitem__("PYTHONNOUSERSITE", "0"))
    add("dontwrite-missing", lambda v: v["environment"].__setitem__("PYTHONDONTWRITEBYTECODE", None))
    add("dontwrite-wrong", lambda v: v["environment"].__setitem__("PYTHONDONTWRITEBYTECODE", "0"))
    add("hashseed-missing", lambda v: v["environment"].__setitem__("PYTHONHASHSEED", None))
    add("hashseed-wrong", lambda v: v["environment"].__setitem__("PYTHONHASHSEED", "1"))
    add("flag-no-site", lambda v: v["flags"].__setitem__("no_site", 0))
    add("flag-no-user-site", lambda v: v["flags"].__setitem__("no_user_site", 0))
    add("flag-dont-write", lambda v: v["flags"].__setitem__("dont_write_bytecode", 0))
    add("flag-hash-randomization", lambda v: v["flags"].__setitem__("hash_randomization", 1))
    add("flag-optimize", lambda v: v["flags"].__setitem__("optimize", 1))
    add("site-imported", lambda v: v.__setitem__("site_imported", True))
    add("site-path-missing", lambda v: v.__setitem__("site_package_paths", []))
    add("site-path-extra", lambda v: v.__setitem__("site_package_paths", [str(verify.SITE_PACKAGES), "/tmp/site-packages"]))
    add("snapshot-field-missing", lambda v: v.pop("flags"))
    add("snapshot-field-added", lambda v: v.__setitem__("unexpected", True))
    return cases


def subprocess_negative_cases() -> List[Tuple[str, List[str], Dict[str, str]]]:
    base_env = dict(os.environ)
    verifier = str(HERE / "verify_runtime_compatibility_v2.py")
    cases: List[Tuple[str, List[str], Dict[str, str]]] = []

    cases.append(
        (
            "process-missing-S",
            [str(verify.RUNTIME_EXE), "-B", verifier, "--core-only"],
            dict(base_env),
        )
    )
    no_user = dict(base_env)
    no_user.pop("PYTHONNOUSERSITE", None)
    cases.append(
        (
            "process-missing-nousersite",
            [str(verify.RUNTIME_EXE), "-S", "-B", verifier, "--core-only"],
            no_user,
        )
    )
    wrong_path = dict(base_env)
    wrong_path["PYTHONPATH"] = "/tmp/nonexistent-audit-runtime-site-packages"
    cases.append(
        (
            "process-wrong-pythonpath",
            [str(verify.RUNTIME_EXE), "-S", "-B", verifier, "--core-only"],
            wrong_path,
        )
    )
    wrong_hash = dict(base_env)
    wrong_hash["PYTHONHASHSEED"] = "1"
    cases.append(
        (
            "process-wrong-hashseed",
            [str(verify.RUNTIME_EXE), "-S", "-B", verifier, "--core-only"],
            wrong_hash,
        )
    )
    no_bytecode = dict(base_env)
    no_bytecode.pop("PYTHONDONTWRITEBYTECODE", None)
    cases.append(
        (
            "process-missing-B-and-env",
            [str(verify.RUNTIME_EXE), "-S", verifier, "--core-only"],
            no_bytecode,
        )
    )
    if Path("/usr/bin/python3").exists():
        cases.append(
            (
                "process-wrong-python",
                ["/usr/bin/python3", "-S", "-B", verifier, "--core-only"],
                dict(base_env),
            )
        )
    return cases


def run_suite() -> Dict[str, Any]:
    verify.enforce_runtime()
    failures: List[str] = []
    case_ids: List[str] = []

    # Two positive V2 validations: the complete frozen V1 chain and the V2
    # core itself under the hard-pinned runtime.
    valid_count = 0
    for case_id, fn in [
        ("valid-frozen-v1-full", lambda: verify.verify_frozen_v1([])),
        ("valid-v2-core", lambda: verify.verify_filesystem(require_terminal=False, trace=[])),
    ]:
        case_ids.append(case_id)
        try:
            fn()
        except Exception as exc:
            failures.append(f"{case_id}: {exc}")
        else:
            valid_count += 1

    try:
        v1_report = run_v1_baseline()
    except Exception as exc:
        failures.append(f"v1-baseline: {exc}")
        v1_summary = {
            "case_id_digest": verify.V1_BASELINE_CASE_DIGEST,
            "failed": verify.V1_BASELINE_TOTAL,
            "passed": 0,
            "total": verify.V1_BASELINE_TOTAL,
        }
    else:
        v1_summary = {
            "case_id_digest": v1_report["case_id_digest"],
            "failed": v1_report["failed"],
            "passed": v1_report["passed"],
            "total": v1_report["total"],
        }

    base = verify.runtime_snapshot()
    negative_passed = 0
    for case_id, snapshot in mutated_runtime_snapshots(base):
        case_ids.append(case_id)
        if verify.runtime_errors(snapshot):
            negative_passed += 1
        else:
            failures.append(f"{case_id}: mutated runtime snapshot accepted")

    for case_id, command, env in subprocess_negative_cases():
        case_ids.append(case_id)
        try:
            result = subprocess.run(
                command,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=30,
                check=False,
            )
        except Exception as exc:
            failures.append(f"{case_id}: subprocess failed unexpectedly: {exc}")
            continue
        if result.returncode == 1 and "FAIL_CLOSED" in result.stdout:
            negative_passed += 1
        else:
            failures.append(
                f"{case_id}: wrong invocation not fail-closed rc={result.returncode} "
                f"stdout={result.stdout[:200]!r} stderr={result.stderr[:200]!r}"
            )

    negative_total = len(mutated_runtime_snapshots(base)) + len(subprocess_negative_cases())
    aggregate_total = verify.V1_BASELINE_TOTAL + negative_total + 2
    aggregate_failed = len(failures) + v1_summary["failed"] + (2 - valid_count) + (negative_total - negative_passed)
    # The category failures above are already represented in `failures`; use a
    # direct success predicate to avoid double-counting while preserving exact
    # aggregate totals.
    success = not failures and v1_summary["failed"] == 0 and valid_count == 2 and negative_passed == negative_total
    aggregate_failed = 0 if success else max(1, aggregate_failed)
    report = {
        "case_id_digest": verify.sha256_bytes(("\n".join(case_ids) + "\n").encode("utf-8")),
        "failed": aggregate_failed,
        "failures": failures,
        "passed": aggregate_total - aggregate_failed,
        "runtime_negative": {
            "case_id_digest": verify.sha256_bytes(
                ("\n".join(case_ids[2:]) + "\n").encode("utf-8")
            ),
            "failed": negative_total - negative_passed,
            "passed": negative_passed,
            "total": negative_total,
        },
        "schema_version": "audit005-exhaustive299-runtime-compatibility-test-report-v2",
        "status": "PASS" if success else "FAIL_CLOSED",
        "total": aggregate_total,
        "v1_baseline": v1_summary,
        "v2_valid_fixture_count": valid_count,
    }
    return report


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", type=Path)
    args = parser.parse_args(argv)
    try:
        report = run_suite()
    except verify.ValidationError as exc:
        report = {
            "failed": 1,
            "failures": [str(exc)],
            "passed": 0,
            "status": "FAIL_CLOSED",
            "total": 1,
        }
    if args.write_report is not None:
        target = args.write_report if args.write_report.is_absolute() else HERE / args.write_report
        target.write_bytes(verify.canonical_bytes(report))
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0 if report.get("status") == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
