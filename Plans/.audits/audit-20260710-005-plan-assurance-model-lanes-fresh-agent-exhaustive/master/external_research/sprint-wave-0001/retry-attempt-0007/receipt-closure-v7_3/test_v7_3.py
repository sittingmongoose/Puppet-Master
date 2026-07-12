#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import importlib.metadata
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
NS = BASE.parent
V72 = NS / "validation/receipt-closure-v7_2"
sys.path.insert(0, str(NS / "tools"))
sys.path.insert(0, str(BASE))

import canonical_json  # noqa: E402
import closure_validator_v7_3 as CV  # noqa: E402
import common  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402

FIXTURE_ROOT = BASE / "fixture-sandbox/full-real"
NATIVE_STATE = NS / "runtime/native-state-v7_1.json"
tests: list[tuple[str, bool, str]] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    tests.append((name, bool(condition), detail))


def run(command: list[str], env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, text=True, capture_output=True, env=env, check=False)


def main() -> None:
    shutil.rmtree(BASE / "fixture-sandbox", ignore_errors=True)
    FIXTURE_ROOT.mkdir(parents=True)
    check("runtime-python", sys.version.split()[0] == "3.12.13", sys.version)
    check("runtime-machine", platform.machine() == "arm64", platform.machine())
    check("runtime-jsonschema", importlib.metadata.version("jsonschema") == "4.26.0")
    check("runtime-rpds", importlib.metadata.version("rpds-py") == "2026.6.3")
    for schema_path in (CV.RECEIPT_SCHEMA, CV.CAPTURE_SCHEMA, NS / "schema/external_research_result_v7.schema.json"):
        try:
            schema = common.load(schema_path)
            Draft202012Validator.check_schema(schema)
            CV._required_arrays_unique(schema, "$")
            check("schema-valid-" + schema_path.name, True)
        except Exception as exc:
            check("schema-valid-" + schema_path.name, False, repr(exc))
    v72_receipt_schema = common.load(V72 / "external_research_dispatch_receipt_v7_2.schema.json")
    try:
        Draft202012Validator.check_schema(v72_receipt_schema)
        check("reproduce-v72-duplicate-required", False, "v7.2 schema unexpectedly passed")
    except Exception as exc:
        check("reproduce-v72-duplicate-required", "uniqueItems" in str(exc) or "non-unique" in str(exc), str(exc))
    env = dict(os.environ)
    env["AUDIT005_V7_3_FIXTURE_MODE"] = "1"
    env["PYTHONNOUSERSITE"] = "1"
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    receipts: dict[str, dict] = {}
    receipt_raw: dict[str, bytes] = {}
    state = common.load(NATIVE_STATE)
    natives = {row["assignment_id"]: row for row in state["leaves"]}
    for aid in CV.RECOVERY_IDS:
        proof = NS / "runtime/terminal-proofs" / f"{aid}.json"
        command = [
            sys.executable, "-S", "-B", str(BASE / "write_positive_receipt_v7_3.py"),
            "--assignment-id", aid, "--terminal-proof", str(proof),
            "--terminal-proof-sha256", common.sha(proof), "--fixture-root", str(FIXTURE_ROOT),
        ]
        result = run(command, env)
        output = FIXTURE_ROOT / f"{aid}-dispatch_receipt.json"
        check("writer-pass-" + aid, result.returncode == 0 and output.is_file(), result.stderr + result.stdout)
        if output.is_file():
            receipt_raw[aid] = output.read_bytes()
            receipts[aid] = common.parse_standard_exact(receipt_raw[aid])
    capture_run = run([
        sys.executable, "-S", "-B", str(BASE / "write_native_capture_v7_3.py"),
        "--native-state", str(NATIVE_STATE), "--sha256", common.sha(NATIVE_STATE),
        "--fixture-root", str(FIXTURE_ROOT),
    ], env)
    capture_path = FIXTURE_ROOT / "native_capture.json"
    check("capture-writer-pass", capture_run.returncode == 0 and capture_path.is_file(), capture_run.stderr + capture_run.stdout)
    capture = common.load(capture_path) if capture_path.is_file() else {}
    check("capture-two-rows", len(capture.get("leaves", [])) == 2)
    check("capture-exact-assignments", [r.get("assignment_id") for r in capture.get("leaves", [])] == CV.RECOVERY_IDS)
    check("capture-valid", not CV.capture_errors(capture), str(CV.capture_errors(capture)))
    for aid in CV.RECOVERY_IDS:
        if aid not in receipts:
            continue
        raw_result = common.result_path(aid).read_bytes()
        tree = common.output_tree_sha256(common.output_dir(aid))
        check(
            "receipt-valid-" + aid,
            not CV.receipt_errors(
                receipts[aid], aid=aid, native=natives[aid], result_raw=raw_result,
                receipt_raw=receipt_raw[aid], output_tree_sha256=tree,
            ),
        )
        check("receipt-result-raw-" + aid, receipts[aid]["result_file_sha256"] == common.sha_bytes(raw_result))
        check(
            "receipt-result-canonical-" + aid,
            receipts[aid]["result_canonical_sha256"] == canonical_json.canonical_sha256_from_buffer(raw_result),
        )
        check("receipt-tree-" + aid, receipts[aid]["output_tree_sha256"] == tree)
    # Prove v7.2 accepted a duplicate-assignment capture shape that v7.3 rejects.
    if capture.get("leaves"):
        legacy = {
            "schema_version": "external-research-native-capture-v7.2",
            "attempt_id": capture["attempt_id"], "controller_thread_id": capture["controller_thread_id"],
            "assignment_count": 2, "native_state_path": capture["native_state_path"],
            "native_state_file_sha256": capture["native_state_file_sha256"],
            "digest_semantics_version": "raw-file-and-canonical-object-explicit-v7.2",
            "leaves": [copy.deepcopy(capture["leaves"][0]), copy.deepcopy(capture["leaves"][0])],
            "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
        }
        legacy_errors = common.draft_errors(legacy, common.load(V72 / "external_research_native_capture_v7_2.schema.json"))
        check("reproduce-v72-duplicate-capture-accepted", not legacy_errors, str(legacy_errors))
        bad_v73 = copy.deepcopy(capture)
        bad_v73["leaves"][1] = copy.deepcopy(bad_v73["leaves"][0])
        check("v73-duplicate-capture-rejected", bool(CV.capture_errors(bad_v73)))
    v72_capture_text = (V72 / "write_native_capture_v7_2.py").read_text()
    v73_capture_text = (BASE / "write_native_capture_v7_3.py").read_text()
    check("reproduce-v72-no-toctou", "TOCTOU" not in v72_capture_text)
    check("v73-has-toctou", "TOCTOU prewrite" in v73_capture_text and "TOCTOU postwrite" in v73_capture_text)
    check("v73-validates-receipts", "CV.receipt_errors" in v73_capture_text)
    check("v73-validates-native-state", "CV.native_state_errors" in v73_capture_text)

    receipt_mutations = [
        lambda v: v.pop("schema_version"),
        lambda v: v.__setitem__("extra", 1),
        lambda v: v.__setitem__("assignment_id", "ER-9999"),
        lambda v: v.__setitem__("result_file_sha256", "0" * 64),
        lambda v: v.__setitem__("result_canonical_sha256", "1" * 64),
        lambda v: v.__setitem__("output_tree_sha256", "2" * 64),
        lambda v: v.__setitem__("task_thread_id", "0" * 36),
        lambda v: v.__setitem__("native_child_thread_id", "1" * 36),
        lambda v: v.__setitem__("native_child_turn_id", "2" * 36),
        lambda v: v.__setitem__("model", "gpt-5.6-sol"),
        lambda v: v.__setitem__("reasoning_effort", "xhigh"),
        lambda v: v.__setitem__("coverage_credit", 1),
        lambda v: v.__setitem__("single_result_buffer_used", False),
        lambda v: v.__setitem__("atomic_exclusive_write", False),
        lambda v: v.__setitem__("toctou_recheck_passed_before_write", False),
        lambda v: v.__setitem__("toctou_recheck_passed_after_write", False),
        lambda v: v.__setitem__("activation_core_file_sha256", v["activation_core_object_canonical_sha256"]),
        lambda v: v.__setitem__("leaf_dispatch_authorization_file_sha256", v["leaf_dispatch_authorization_object_canonical_sha256"]),
        lambda v: v.__setitem__("result_buffer_byte_count", v["result_buffer_byte_count"] + 1),
        lambda v: v.__setitem__("terminal_response_exact", "not-pmr1"),
    ]
    for index in range(600):
        aid = CV.RECOVERY_IDS[index % 2]
        value = copy.deepcopy(receipts[aid])
        receipt_mutations[index % len(receipt_mutations)](value)
        raw_result = common.result_path(aid).read_bytes()
        errors = CV.receipt_errors(
            value, aid=aid, native=natives[aid], result_raw=raw_result,
            output_tree_sha256=common.output_tree_sha256(common.output_dir(aid)),
        )
        check(f"receipt-negative-{index:04d}", bool(errors), str(errors[:2]))

    capture_mutations = [
        lambda v: v.pop("schema_version"),
        lambda v: v.__setitem__("extra", 1),
        lambda v: v.__setitem__("assignment_count", 3),
        lambda v: v.__setitem__("controller_thread_id", "wrong"),
        lambda v: v.__setitem__("digest_semantics_version", "wrong"),
        lambda v: v.__setitem__("coverage_credit", 1),
        lambda v: v.__setitem__("native_identity_uniqueness_verified", False),
        lambda v: v.__setitem__("receipt_result_tree_joins_verified", False),
        lambda v: v.__setitem__("single_buffers_used", False),
        lambda v: v.__setitem__("toctou_recheck_passed_before_write", False),
        lambda v: v.__setitem__("toctou_recheck_passed_after_write", False),
        lambda v: v.__setitem__("atomic_exclusive_write", False),
        lambda v: v.__setitem__("leaves", v["leaves"][:1]),
        lambda v: v["leaves"].reverse(),
        lambda v: v["leaves"].__setitem__(1, copy.deepcopy(v["leaves"][0])),
        lambda v: v["leaves"][1].__setitem__("native_child_thread_id", v["leaves"][0]["native_child_thread_id"]),
        lambda v: v["leaves"][1].__setitem__("native_child_turn_id", v["leaves"][0]["native_child_turn_id"]),
        lambda v: v["leaves"][1].__setitem__("agent_path", v["leaves"][0]["agent_path"]),
        lambda v: v["leaves"][0].__setitem__("result_file_sha256", "0" * 64),
        lambda v: v["leaves"][0].__setitem__("extra", 1),
    ]
    for index in range(400):
        value = copy.deepcopy(capture)
        capture_mutations[index % len(capture_mutations)](value)
        errors = CV.capture_errors(value)
        check(f"capture-negative-{index:04d}", bool(errors), str(errors[:2]))

    check("production-receipts-zero", not any(common.receipt_path(aid).exists() for aid in CV.RECOVERY_IDS))
    check("production-capture-zero", not common.capture_path().exists())
    check("fixture-files-before-cleanup", sorted(p.name for p in FIXTURE_ROOT.iterdir()) == [
        "ER-0003-dispatch_receipt.json", "ER-0008-dispatch_receipt.json", "native_capture.json"
    ])
    fixture_hashes = {p.name: common.sha(p) for p in sorted(FIXTURE_ROOT.iterdir())}
    shutil.rmtree(BASE / "fixture-sandbox", ignore_errors=True)
    check("fixture-cleaned", not (BASE / "fixture-sandbox").exists())
    failures = [{"name": name, "detail": detail} for name, passed, detail in tests if not passed]
    names = [name for name, _, _ in tests]
    report = {
        "status": "pass" if not failures else "fail",
        "passed": len(tests) - len(failures), "failed": len(failures), "total": len(tests),
        "test_digest": hashlib.sha256(("\n".join(names) + "\n").encode()).hexdigest(),
        "fixture_receipts": 2, "fixture_capture_rows": 2,
        "fixture_hashes": fixture_hashes, "fixture_cleaned": not (BASE / "fixture-sandbox").exists(),
        "production_receipts": 0, "production_capture_rows": 0, "failures": failures,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failures and len(tests) >= 800 else 1)


if __name__ == "__main__":
    main()
