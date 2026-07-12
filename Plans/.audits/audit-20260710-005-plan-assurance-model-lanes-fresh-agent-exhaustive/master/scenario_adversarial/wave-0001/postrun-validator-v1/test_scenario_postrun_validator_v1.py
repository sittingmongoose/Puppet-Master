#!/usr/bin/env python3
"""Deterministic mutation suite for scenario postrun validation."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent


def import_file(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = import_file("a005_scenario_postrun", BASE / "validate_scenario_postrun_v1.py")
schema = validator.load(validator.SCHEMA_PATH)


def dimension() -> dict[str, Any]:
    return {
        "disposition": "certified",
        "rationale": "The scenario and oracle establish the required behavior.",
        "scenarios": ["Exercise the normal and nearest boundary behavior."],
        "acceptance_criteria": [{
            "criterion": "The observable state transition is deterministic.",
            "observables": ["state transition"],
            "evidence_artifacts": ["trace.json"],
            "oracle": {"pass": "expected transition occurs", "fail": "transition is absent or incorrect"},
        }],
        "spec_deltas": [],
    }


def certification() -> dict[str, Any]:
    return {
        "provisional_feature_ref": "PF-1",
        "source_row_sha256": "1" * 64,
        "research_result_file_sha256": "2" * 64,
        "research_record_sha256": "3" * 64,
        "certification_disposition": "certified",
        "disposition_rationale": "All dimensions have executable evidence.",
        "research_applicability": {
            "state": "applicable", "rationale": "The source directly applies.", "browsing_performed": True,
            "claims_used": [{"claim_id": "C-1", "claim": "A supported claim", "source_urls": ["https://example.org/spec#section"], "evidence_label": "section anchor"}],
        },
        "dimensions": {name: dimension() for name in validator.DIMENSIONS},
        "overall_spec_deltas": [],
        "newly_discovered_candidates": [],
    }


def synthetic_row() -> dict[str, Any]:
    return {
        "assignment_id": "A005SA-0001", "cohort_id": "cohort-0001", "prospective_agent_path": "/root/a005_scenario_adversarial_0001_attempt_0001_terminal",
        "packet_id": "SAPKT-0001", "packet_sha256": "4" * 64, "feature_refs_digest": "5" * 64,
        "candidate_evidence_label": "mechanically_valid_candidate_evidence_not_final_semantic_authority",
        "feature_count": 1, "feature_refs": ["PF-1"], "source_row_sha256_by_feature": {"PF-1": "1" * 64},
        "research_binding_by_feature": {"PF-1": {"result_file_sha256": "2" * 64, "research_record_sha256": "3" * 64}},
    }


def valid_result() -> dict[str, Any]:
    row = synthetic_row()
    return {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "schema_version": "scenario-adversarial-result-v1", "phase": "scenario_adversarial_certification",
        "cohort_id": row["cohort_id"], "assignment_id": row["assignment_id"], "attempt_id": "attempt-0001",
        "task_thread_id": row["prospective_agent_path"], "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "status": "completed",
        "input_binding": {"packet_id": row["packet_id"], "packet_sha256": row["packet_sha256"], "feature_refs_digest": row["feature_refs_digest"], "candidate_evidence_label": row["candidate_evidence_label"]},
        "coverage": {"feature_count": 1, "feature_refs": ["PF-1"]},
        "feature_certifications": [certification()],
        "self_attestation": {
            "independent_reasoning_completed": True, "candidate_research_not_treated_as_proof": True,
            "every_feature_certified_once": True, "every_dimension_completed": True,
            "all_claims_source_mapped": True, "plans_not_edited": True, "no_descendants_or_followups": True,
        },
    }


def valid_receipt(row: dict[str, Any], result_path: Path) -> dict[str, Any]:
    intent_path = validator.WAVE / f"dispatch/{row['assignment_id']}/attempt-0001/dispatch_intent.json"
    return {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "schema_version": "scenario-adversarial-dispatch-receipt-v1", "wave_id": "wave-0001", "cohort_id": row["cohort_id"],
        "assignment_id": row["assignment_id"], "attempt_id": "attempt-0001", "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "agent_path": row["prospective_agent_path"], "task_thread_id": row["prospective_agent_path"],
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child": True, "fork_turns": "none",
        "dispatch_intent_sha256": validator.sha(intent_path), "packet_sha256": row["packet_sha256"], "output_directory": row["output_directory"],
        "native_child_thread_id": "thread-1", "native_turn_id": "turn-1", "result_path": str(result_path), "result_sha256": validator.sha(result_path),
        "terminal_status": "completed", "terminal_response": "PMR1", "activation_path": "/tmp/activation.json", "activation_sha256": "6" * 64,
    }


def mutate_result(value: dict[str, Any], family: int, index: int) -> None:
    cert = value["feature_certifications"][0]
    dim = cert["dimensions"][validator.DIMENSIONS[0]]
    mutations = {
        0: lambda: value.pop("assignment_id"),
        1: lambda: value.__setitem__("extra", index),
        2: lambda: value.__setitem__("assignment_id", "A005SA-9999"),
        3: lambda: value.__setitem__("cohort_id", "cohort-0002"),
        4: lambda: value.__setitem__("task_thread_id", "/root/reused"),
        5: lambda: value.__setitem__("model", "gpt-5.6-luna"),
        6: lambda: value.__setitem__("reasoning_effort", "max"),
        7: lambda: value["input_binding"].__setitem__("packet_sha256", "0" * 64),
        8: lambda: value["input_binding"].__setitem__("feature_refs_digest", "0" * 64),
        9: lambda: value["coverage"].__setitem__("feature_count", 2),
        10: lambda: value["coverage"].__setitem__("feature_refs", ["FOREIGN"]),
        11: lambda: value["feature_certifications"].append(copy.deepcopy(cert)),
        12: lambda: cert.__setitem__("provisional_feature_ref", "FOREIGN"),
        13: lambda: cert.__setitem__("source_row_sha256", "0" * 64),
        14: lambda: cert.__setitem__("research_result_file_sha256", "0" * 64),
        15: lambda: cert.__setitem__("research_record_sha256", "0" * 64),
        16: lambda: (cert.__setitem__("certification_disposition", "gap_confirmed"), cert.__setitem__("overall_spec_deltas", [])),
        17: lambda: cert["research_applicability"].__setitem__("state", "weak"),
        18: lambda: cert["research_applicability"]["claims_used"][0].__setitem__("source_urls", ["http://example.org"]),
        19: lambda: cert["research_applicability"]["claims_used"].append(copy.deepcopy(cert["research_applicability"]["claims_used"][0])),
        20: lambda: cert["dimensions"].pop(validator.DIMENSIONS[0]),
        21: lambda: dim.__setitem__("scenarios", []),
        22: lambda: dim.__setitem__("acceptance_criteria", []),
        23: lambda: (dim.__setitem__("disposition", "gap_confirmed"), dim.__setitem__("spec_deltas", [])),
        24: lambda: dim["acceptance_criteria"][0]["oracle"].__setitem__("fail", dim["acceptance_criteria"][0]["oracle"]["pass"]),
        25: lambda: dim["acceptance_criteria"][0].__setitem__("observables", []),
        26: lambda: dim["acceptance_criteria"][0].__setitem__("evidence_artifacts", []),
        27: lambda: value["self_attestation"].__setitem__("every_dimension_completed", False),
        28: lambda: value.__setitem__("status", "partial"),
        29: lambda: value.__setitem__("phase", "other"),
        30: lambda: value.__setitem__("schema_version", "v2"),
        31: lambda: cert.__setitem__("extra", index),
    }
    mutations[family]()


def mutate_receipt(value: dict[str, Any], family: int) -> None:
    mutations = {
        32: lambda: value.pop("native_child_thread_id"),
        33: lambda: value.__setitem__("task_thread_id", "/root/reused"),
        34: lambda: value.__setitem__("result_sha256", "0" * 64),
        35: lambda: value.__setitem__("packet_sha256", "0" * 64),
        36: lambda: value.__setitem__("dispatch_intent_sha256", "0" * 64),
        37: lambda: value.__setitem__("terminal_response", "ERROR"),
        38: lambda: value.__setitem__("output_directory", "/tmp/foreign"),
        39: lambda: value.pop("activation_sha256"),
    }
    mutations[family]()


def main() -> None:
    failures: list[str] = []
    names: list[str] = []
    original_questions = validator.packet_question_counts
    validator.packet_question_counts = lambda row: {"PF-1": 1}
    try:
        row = synthetic_row()
        valid = valid_result()
        errors = validator.result_errors(valid, row, schema)
        names.append("valid-result-flow")
        if errors:
            failures.append("valid-result-flow:" + ",".join(errors))
        actual_row = validator.jsonl(validator.COHORT_MANIFESTS["cohort-0001"])[0]
        with tempfile.TemporaryDirectory(prefix="a005-scenario-postrun-tests-") as temporary:
            result_path = Path(temporary) / "result.json"
            result_path.write_text("{}\n", encoding="utf-8")
            receipt = valid_receipt(actual_row, result_path)
            names.append("valid-receipt-flow")
            receipt_errors = validator.receipt_errors(receipt, actual_row, result_path)
            if receipt_errors:
                failures.append("valid-receipt-flow:" + ",".join(receipt_errors))
            for index in range(640):
                family = index % 40
                name = f"fail-closed-{index:04d}-family-{family:02d}"
                names.append(name)
                if family < 32:
                    value = valid_result()
                    mutate_result(value, family, index)
                    accepted = not validator.result_errors(value, row, schema)
                else:
                    value = valid_receipt(actual_row, result_path)
                    mutate_receipt(value, family)
                    accepted = not validator.receipt_errors(value, actual_row, result_path)
                if accepted:
                    failures.append(name + ":accepted")
    finally:
        validator.packet_question_counts = original_questions
    report = {
        "status": "pass" if not failures else "fail",
        "passed": len(names) - len(failures), "failed": len(failures), "total": len(names),
        "negative_tests": 640, "valid_synthetic_flows": 2,
        "test_digest": hashlib.sha256("\n".join(names).encode("utf-8")).hexdigest(),
        "failures": failures, "scenario_results_read": 0, "activation_written": False, "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
