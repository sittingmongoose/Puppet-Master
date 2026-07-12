#!/usr/bin/env python3
"""Strict negative tests for external-research recovery attempt-0003."""

from __future__ import annotations

import copy
import json

import validate_external_research_retry_attempt_0003 as validate
from prepare_external_research_retry_attempt_0003 import (
    ATTEMPT, AUDIT_ID, CONTROLLER, EFFORT, MODEL, NAMESPACE, RECOVERY_IDS, expected_agent, load_obj,
)


def synthetic_result(aid: str = "ER-0001"):
    assignment = next(row for row in load_obj(NAMESPACE / "manifest.json")["assignments"] if row["assignment_id"] == aid)
    urls = [f"https://example.org/primary/source-{index}#section" for index in range(8)]
    sources = [{"url": url, "title": f"Source {index}", "publisher": "Primary Publisher", "published_date": None,
                "access_date": "2026-07-11", "source_tier": "official" if index == 0 else "primary",
                "material_relevance": "Directly supports the assigned current-web research question."} for index, url in enumerate(urls)]
    tagged = lambda prefix, key, text, url, extra: {f"{prefix}_id": f"{prefix.upper()}-1", key: text,
        "evidence_class": "supported_claim", "source_urls": [url], **extra}
    result = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-result-v3", "phase": "external_research_current_web_research",
        "assignment_id": aid, "attempt_id": ATTEMPT, "controller_thread_id": CONTROLLER,
        "agent_path": assignment["canonical_agent_path"], "model": MODEL, "reasoning_effort": EFFORT,
        "status": "completed", "topic": assignment["topic"], "owner_domains": assignment["owner_domains"],
        "feature_refs": assignment["feature_refs"], "research_questions": assignment["research_questions"],
        "source_availability": "available", "unavailable_evidence": [], "sources": sources,
        "findings": [tagged("finding", "claim", "Supported claim.", urls[0], {"confidence": .9, "notes": "Evidence bound."})],
        "competitor_standard_patterns": [tagged("pattern", "pattern", "Observed pattern.", urls[1], {"implication": "Adopt explicit boundaries."})],
        "failure_modes": [tagged("failure", "failure_mode", "Failure mode.", urls[2], {"mitigation_or_gap": "Mitigate explicitly."})],
        "implications": [tagged("implication", "implication", "Implication.", urls[3], {"rationale": "Evidence supports it."})],
        "novel_ideas": [tagged("idea", "idea", "Novel idea.", urls[4], {"rationale": "Derived independently."})],
        "unresolved_questions": [{"question_id": "Q-1", "question": "What remains unresolved?", "evidence_class": "no_evidence", "source_urls": []}],
        "self_attestation": {"current_web_research_performed": True, "official_or_primary_sources_first": True,
            "direct_urls_only": True, "source_count_contract_checked": True,
            "supported_inference_no_evidence_labels_present": True, "no_fabricated_claims": True,
            "no_long_quotations": True, "topic_and_refs_binding_verified": True, "exact_attempt_id_verified": True,
            "fresh_direct_terminal_contract_acknowledged": True, "fresh_current_public_web_research_redone": True,
            "attempt_0002_results_and_peer_outputs_not_read": True, "canonical_agent_path_is_only_leaf_known_identity": True,
            "native_identity_deferred_to_controller_receipt_and_capture": True},
    }
    return assignment, result


def main() -> None:
    schema = load_obj(NAMESPACE / "schema/external_research_result_v3.schema.json")
    assignment, valid = synthetic_result()
    rejected = lambda value: bool(validate.result_errors(value, assignment, schema))
    tests = {"valid_synthetic_pass": validate.result_errors(valid, assignment, schema) == []}
    bad = copy.deepcopy(valid); bad["task_thread_id"] = "native-id"
    tests["forbidden_result_task_thread_id_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["native_child_thread_id"] = "native-id"
    tests["forbidden_result_native_id_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["attempt_id"] = "attempt-0002"
    tests["wrong_attempt_mapping_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["assignment_id"] = "ER-0002"
    tests["floor_assignment_rerun_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["agent_path"] = "/root/reused"
    tests["wrong_agent_path_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["controller_thread_id"] = "wrong"
    tests["wrong_controller_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["model"] = "gpt-5.6-sol"
    tests["wrong_model_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["reasoning_effort"] = "xhigh"
    tests["wrong_effort_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"]["attempt_0002_results_and_peer_outputs_not_read"] = False
    tests["isolation_attestation_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["research_questions"] = bad["research_questions"][:-1]
    tests["full_question_binding_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["feature_refs"] = []
    tests["feature_binding_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["owner_domains"] = ["wrong"]
    tests["owner_binding_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["topic"] = "wrong"
    tests["topic_binding_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["extra"] = True
    tests["extra_result_key_rejected"] = rejected(bad)
    tests["https_fragment_allowed"] = validate.direct_url_errors("https://example.org/doc#section", "url") == []
    tests["non_https_rejected"] = bool(validate.direct_url_errors("http://example.org/doc", "url"))
    tests["search_result_rejected"] = bool(validate.direct_url_errors("https://google.com/search?q=x", "url"))
    bad = copy.deepcopy(valid); bad["findings"][0]["source_urls"] = ["https://unbound.example.org/doc"]
    tests["unbound_source_rejected"] = rejected(bad)
    tests["exact_seven_set_rejected"] = bool(validate.exact_set_errors(RECOVERY_IDS[:-1], RECOVERY_IDS, "recovery"))
    paths = [expected_agent(aid) for aid in RECOVERY_IDS]
    tests["fresh_unique_paths_pass"] = len(paths) == len(set(paths)) == 7
    tests["duplicate_fresh_path_rejected"] = len(paths[:-1] + [paths[0]]) != len(set(paths[:-1] + [paths[0]]))
    prior = validate.prior_identity_set()
    tests["no_real_identity_reuse_pass"] = prior.isdisjoint(paths)
    tests["synthetic_identity_reuse_rejected"] = bool(prior.intersection({next(iter(prior))}))
    tests["extra_output_rejected"] = bool(validate.output_files_errors(["result.json", "debug.json"]))
    tests["packet_hash_rejected"] = bool(validate.hash_binding_errors("0" * 64, assignment["packet_sha256"], "packet"))
    tests["intent_hash_rejected"] = bool(validate.hash_binding_errors("0" * 64, assignment["dispatch_intent_sha256"], "intent"))
    receipt = {"assignment_id": assignment["assignment_id"], "agent_path": assignment["canonical_agent_path"],
               "task_thread_id": "native-1", "native_child_thread_id": "native-1", "model": MODEL,
               "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none"}
    tests["receipt_identity_valid_synthetic"] = validate.receipt_identity_errors(receipt, assignment["assignment_id"], assignment["canonical_agent_path"], "native-1") == []
    bad_receipt = copy.deepcopy(receipt); bad_receipt["native_child_thread_id"] = "native-2"
    tests["receipt_native_mismatch_rejected"] = bool(validate.receipt_identity_errors(bad_receipt, assignment["assignment_id"], assignment["canonical_agent_path"], "native-1"))
    capture = {"attempt_id": ATTEMPT, "leaves": []}
    for index, aid in enumerate(RECOVERY_IDS):
        capture["leaves"].append({"assignment_id": aid, "agent_path": expected_agent(aid),
            "native_child_thread_id": f"native-{index}", "native_child_turn_id": f"turn-{index}",
            "native_child_turn_status": "completed", "native_child_turn_error": None, "terminal_response_prefix": "PMR1"})
    receipts = {aid: {"task_thread_id": f"native-{index}", "native_child_thread_id": f"native-{index}"} for index, aid in enumerate(RECOVERY_IDS)}
    tests["native_capture_valid_synthetic"] = validate.capture_set_errors(capture, receipts, set()) == []
    bad_capture = copy.deepcopy(capture); bad_capture["leaves"][1]["native_child_thread_id"] = "native-0"
    tests["native_capture_duplicate_rejected"] = bool(validate.capture_set_errors(bad_capture, receipts, set()))
    bad_capture = copy.deepcopy(capture); bad_capture["leaves"][0]["native_child_turn_status"] = "failed"
    tests["native_capture_terminal_rejected"] = bool(validate.capture_set_errors(bad_capture, receipts, set()))
    tests["partial_failure_zero_credit"] = validate.cumulative_credit(RECOVERY_IDS[:-1], []) == 0
    tests["global_failure_zero_credit"] = validate.cumulative_credit(RECOVERY_IDS, ["capture:error"]) == 0
    tests["cumulative_exact_eight_credit"] = validate.cumulative_credit(RECOVERY_IDS, []) == 8
    tests["partial_validity_does_not_suppress_rows"] = len([aid for aid in RECOVERY_IDS if aid != "ER-0004"]) == 6
    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {"checker": "external_research_recovery_negative_tests_v3", "status": "pass" if not failures and len(tests) >= 22 else "fail",
              "test_count": len(tests), "errors": failures, "tests": tests, "activation_granted": False,
              "receipts": 0, "results": 0, "native_capture_rows": 0, "cumulative_research_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()
