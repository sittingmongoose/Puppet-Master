#!/usr/bin/env python3
"""Independent strict tests for the append-only validator-v2 dependency binding."""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import inspect
import json
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("binding_wrapper", HERE / "run_validator_v2_isolated.py")
assert SPEC and SPEC.loader
wrapper = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(wrapper)


def main() -> None:
    tests: dict[str, bool] = {}
    state = wrapper.capture_state()
    tests["valid_binding_state"] = wrapper.validate_state(state) == []

    # Every captured immutable file and wheel independently fails on wrong and missing hashes.
    for section in ("file_hashes", "wheel_hashes"):
        for key in sorted(state[section]):
            changed = copy.deepcopy(state)
            changed[section][key] = "0" * 64
            tests[f"{section}:{key}:wrong_rejected"] = bool(wrapper.validate_state(changed))
            missing = copy.deepcopy(state)
            missing[section].pop(key)
            tests[f"{section}:{key}:missing_rejected"] = bool(wrapper.validate_state(missing))
    extra = copy.deepcopy(state)
    extra["wheel_hashes"]["undeclared.whl"] = "0" * 64
    tests["undeclared_wheel_rejected"] = bool(wrapper.validate_state(extra))

    # Tree, cardinality, interpreter, and runtime compatibility drift.
    for key in ("bundle_tree_sha256", "site_tree_sha256", "python_sha256"):
        changed = copy.deepcopy(state); changed[key] = "f" * 64
        tests[f"{key}:wrong_rejected"] = bool(wrapper.validate_state(changed))
        missing = copy.deepcopy(state); missing.pop(key)
        tests[f"{key}:missing_rejected"] = bool(wrapper.validate_state(missing))
    for key in ("bundle_file_count", "site_file_count"):
        changed = copy.deepcopy(state); changed[key] += 1
        tests[f"{key}:wrong_rejected"] = bool(wrapper.validate_state(changed))
        missing = copy.deepcopy(state); missing.pop(key)
        tests[f"{key}:missing_rejected"] = bool(wrapper.validate_state(missing))

    engine_fields = {
        "available": False,
        "distribution": "wrong",
        "library_version": "0.0.0",
        "validator_class": "wrong.Validator",
        "format_checker": "wrong.Checker",
        "meta_schema_id": "wrong",
        "jsonschema_path": "/tmp/global/jsonschema.py",
        "python_version": "3.11.0",
        "implementation": "PyPy",
        "machine": "x86_64",
        "sysconfig_platform": "macosx-10.9-x86_64",
        "sys_path": ["/tmp/global"],
    }
    for key, value in engine_fields.items():
        changed = copy.deepcopy(state); changed["engine"][key] = value
        tests[f"engine:{key}:wrong_rejected"] = bool(wrapper.validate_state(changed))
        missing = copy.deepcopy(state); missing["engine"].pop(key, None)
        tests[f"engine:{key}:missing_rejected"] = bool(wrapper.validate_state(missing))

    # The real wrapper must execute both paths under the isolated interpreter.
    for mode in ("probe", "tests", "validator"):
        completed = subprocess.run([sys.executable, "-B", str(HERE / "run_validator_v2_isolated.py"), "--mode", mode], capture_output=True, text=True, check=False)
        try:
            report = json.loads(completed.stdout)
        except Exception:
            report = {}
        tests[f"wrapper:{mode}:exit"] = completed.returncode == 0
        tests[f"wrapper:{mode}:status"] = report.get("status") == "pass"
        tests[f"wrapper:{mode}:toctou"] = report.get("toctou_stable") is True
        tests[f"wrapper:{mode}:offline"] = report.get("network_required") is False and report.get("global_install_performed") is False
    tests_report = json.loads(subprocess.run([sys.executable, "-B", str(HERE / "run_validator_v2_isolated.py"), "--mode", "tests"], capture_output=True, text=True, check=True).stdout)
    tests["real_engine_437_of_437"] = tests_report["execution"]["counts"] == {"failed": 0, "new_v2_tests": 138, "passed": 437, "total": 437}
    tests["real_engine_12_of_12_bypasses"] = tests_report["execution"]["bypasses_rejected"] == 12
    tests["real_engine_100_of_100_fuzz"] = tests_report["execution"]["schema_fuzz_rejected"] == 100
    tests["real_engine_exact_version"] = tests_report["execution"]["schema_engine"]["library_version"] == "4.26.0"
    validator_report = json.loads(subprocess.run([sys.executable, "-B", str(HERE / "run_validator_v2_isolated.py"), "--mode", "validator"], capture_output=True, text=True, check=True).stdout)
    tests["zero_state_16_assignments"] = validator_report["execution"]["counts"]["assignments"] == 16
    tests["zero_state_3888_features"] = validator_report["execution"]["counts"]["features"] == validator_report["execution"]["counts"]["unique_features"] == 3888
    tests["zero_state_no_results_receipts_capture"] = all(validator_report["execution"]["counts"][key] == 0 for key in ("results", "receipts", "native_capture_rows", "eligible"))
    tests["zero_state_credit_zero"] = validator_report["execution"]["certification_credit"] == 0
    tests["zero_state_validator_fail_closed_not_pass"] = validator_report["execution"]["status"] == "fail_closed"

    # Validation execution must not contain network clients or activation-generator calls.
    scanned = [
        wrapper.V2 / "validate_universal_shadow_certification_postrun_v2.py",
        wrapper.V2 / "test_universal_shadow_certification_postrun_v2.py",
        HERE / "run_validator_v2_isolated.py",
    ]
    forbidden = ("urllib.request", "requests.", "http.client", "urlopen(", "socket.connect")
    for path in scanned:
        text = path.read_text(encoding="utf-8")
        for token in forbidden:
            tests[f"offline_scan:{path.name}:{token}"] = token not in text
    tests["activation_generator_not_an_execution_target"] = "activation-generator-v2" not in inspect.getsource(wrapper.execute)

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    report = {
        "schema_version": "universal-shadow-certification-validator-v2-dependency-binding-tests-v1",
        "status": "pass" if not failures and len(tests) >= 100 else "fail",
        "counts": {"passed": len(tests) - len(failures), "total": len(tests), "failed": len(failures)},
        "errors": failures,
        "test_digest": hashlib.sha256(json.dumps(tests, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "tests": tests,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
