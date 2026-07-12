#!/usr/bin/env python3
"""Deterministic fail-closed tests for the certification atomic8 supersession."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path
from typing import Any, Callable

BASE = Path(__file__).resolve().parent


def import_file(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


gen = import_file("a005_cert_atomic8_generator", BASE / "activation-generator-v7-atomic8.py")
authority = json.loads((BASE / "authority-v7-atomic8.json").read_text(encoding="utf-8"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def valid_v6() -> dict[str, Any]:
    return {
        "status": "PASS", "errors": [], "assignment_count": 16, "feature_count": 3888,
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh",
        "binding_v6_terminal_report_sha256": gen.V6_TERMINAL_SHA,
        "atomic16_generator_confirmed_incompatible_with_atomic8": True,
        "outputs_empty": 16, "results": 0, "receipts": 0, "activation_transactions": 0,
        "credit": 0, "tests_passed": 1064, "tests_total": 1064,
    }


def valid_atomic8() -> dict[str, Any]:
    return {
        "status": "PASS", "errors": [],
        "authority_v7_atomic8_sha256": sha(BASE / "authority-v7-atomic8.json"),
        "schema_v7_atomic8_sha256": sha(BASE / "activation-transaction-v7-atomic8.schema.json"),
        "generator_v7_atomic8_sha256": sha(BASE / "activation-generator-v7-atomic8.py"),
        "terminal_preparation_report_v7_atomic8_sha256": sha(gen.TERMINAL_REPORT_PATH),
        "policy_v25_sha256": gen.POLICY_SHA,
        "binding_v6_terminal_report_sha256": gen.V6_TERMINAL_SHA,
        "assignment_count": 16, "feature_count": 3888, "cohort_count": 2, "atomic_cap": 8,
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh",
        "outputs_empty": 16, "results": 0, "receipts": 0, "activation_transactions": 0,
        "credit": 0,
        "cohorts": {
            "cohort-0001": authority["cohorts"]["cohort-0001"]["assignment_ids"],
            "cohort-0002": authority["cohorts"]["cohort-0002"]["assignment_ids"],
        },
        "cross_cohort_overlap": 0,
    }


def set_value(target: dict[str, Any], key: str, value: Any) -> None:
    target[key] = value


def negative_case(index: int, v6: dict[str, Any], atomic: dict[str, Any], docs: tuple[Any, Any, Any]) -> bool:
    family = index % 40
    token = f"bad-{index:04d}"
    gate_mutations: list[tuple[str, str, Any]] = [
        ("v6", "status", token), ("v6", "errors", [token]),
        ("v6", "assignment_count", 15), ("v6", "feature_count", 3887),
        ("v6", "model", "gpt-5.6-luna"), ("v6", "reasoning_effort", "max"),
        ("v6", "binding_v6_terminal_report_sha256", "0" * 64),
        ("v6", "atomic16_generator_confirmed_incompatible_with_atomic8", False),
        ("v6", "outputs_empty", 15), ("v6", "results", 1),
        ("v6", "receipts", 1), ("v6", "activation_transactions", 1),
        ("v6", "credit", 1), ("v6", "tests_passed", 1063),
        ("atomic", "status", token), ("atomic", "errors", [token]),
        ("atomic", "authority_v7_atomic8_sha256", "0" * 64),
        ("atomic", "schema_v7_atomic8_sha256", "0" * 64),
        ("atomic", "generator_v7_atomic8_sha256", "0" * 64),
        ("atomic", "terminal_preparation_report_v7_atomic8_sha256", "0" * 64),
        ("atomic", "policy_v25_sha256", "0" * 64),
        ("atomic", "binding_v6_terminal_report_sha256", "0" * 64),
        ("atomic", "assignment_count", 8), ("atomic", "feature_count", 1944),
        ("atomic", "cohort_count", 1), ("atomic", "atomic_cap", 16),
        ("atomic", "model", "gpt-5.6-luna"), ("atomic", "reasoning_effort", "max"),
        ("atomic", "outputs_empty", 15), ("atomic", "results", 1),
        ("atomic", "receipts", 1), ("atomic", "activation_transactions", 1),
        ("atomic", "credit", 1),
        ("atomic", "cohorts", {"cohort-0001": authority["cohorts"]["cohort-0001"]["assignment_ids"]}),
        ("atomic", "cross_cohort_overlap", 1),
    ]
    if family < len(gate_mutations):
        target_name, key, value = gate_mutations[family]
        set_value(v6 if target_name == "v6" else atomic, key, value)
        return bool(gen.validate_gate_payloads(v6, atomic, authority))

    core, authorizations, envelope = docs
    if family == 35:
        core["assignment_ids"][1] = core["assignment_ids"][0]
    elif family == 36:
        core["feature_count"] = 1943
    elif family == 37:
        authorizations.pop(next(iter(authorizations)))
    elif family == 38:
        authorizations[next(iter(authorizations))]["activation_core_sha256"] = "0" * 64
    elif family == 39:
        envelope["authorization_sha256_by_assignment"].pop(next(iter(envelope["authorization_sha256_by_assignment"])))
    return bool(gen.document_consistency_errors(core, authorizations, envelope, "cohort-0001"))


def main() -> None:
    names: list[str] = []
    failures: list[str] = []
    with tempfile.TemporaryDirectory(prefix="a005-cert-atomic8-tests-") as temporary:
        temporary_report = Path(temporary) / "terminal.json"
        temporary_report.write_text('{"status":"synthetic-terminal"}\n', encoding="utf-8")
        original_report = gen.TERMINAL_REPORT_PATH
        gen.TERMINAL_REPORT_PATH = temporary_report
        try:
            manifest = gen.manifest_rows()
            by_id = {row["assignment_id"]: row for row in manifest}
            for cohort_id in ("cohort-0001", "cohort-0002"):
                name = f"valid-synthetic-flow-{cohort_id}"
                names.append(name)
                v6, atomic = valid_v6(), valid_atomic8()
                rows = [by_id[aid] for aid in gen.expected_ids(cohort_id)]
                docs = gen.build_documents(cohort_id, rows, authority, "1" * 64, "2" * 64, Path(temporary) / cohort_id)
                errors = gen.validate_gate_payloads(v6, atomic, authority)
                errors.extend(gen.document_consistency_errors(*docs, cohort_id))
                try:
                    gen.schema_validate([docs[0], *docs[1].values(), docs[2]])
                except Exception as exc:
                    errors.append("schema:" + str(exc))
                if errors:
                    failures.append(name + ":" + ",".join(errors))

            base_rows = [by_id[aid] for aid in gen.expected_ids("cohort-0001")]
            for index in range(640):
                name = f"fail-closed-{index:04d}-family-{index % 40:02d}"
                names.append(name)
                v6, atomic = valid_v6(), valid_atomic8()
                docs = gen.build_documents("cohort-0001", base_rows, authority, "1" * 64, "2" * 64, Path(temporary) / "cohort-0001")
                if not negative_case(index, copy.deepcopy(v6), copy.deepcopy(atomic), copy.deepcopy(docs)):
                    failures.append(name + ":accepted")
        finally:
            gen.TERMINAL_REPORT_PATH = original_report

    report = {
        "status": "pass" if not failures else "fail",
        "passed": len(names) - len(failures),
        "failed": len(failures),
        "total": len(names),
        "negative_tests": 640,
        "valid_synthetic_flows": 2,
        "failures": failures,
        "test_digest": hashlib.sha256("\n".join(names).encode("utf-8")).hexdigest(),
        "activation_written": False,
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
