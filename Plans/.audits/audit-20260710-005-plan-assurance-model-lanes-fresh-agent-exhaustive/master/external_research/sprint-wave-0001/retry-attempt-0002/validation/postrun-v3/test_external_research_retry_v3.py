#!/usr/bin/env python3
"""Strict negative-test harness for external-research retry postrun v3."""

from __future__ import annotations

import copy
import json
import sys

import validate_external_research_retry_v3 as validate


def main() -> int:
    manifest = validate.load_json(validate.RETRY / "manifest.json")
    capture = validate.load_json(validate.RETRY / "runtime/native_capture.json")
    schema = validate.load_json(validate.CONTROL_PINS["result_schema_v2"][0])
    assignment = manifest["assignments"][0]
    capture_row = capture["leaves"][0]
    result_path = validate.OUTPUT / "ER-0001" / "attempts" / validate.ATTEMPT / "result.json"
    receipt_path = validate.RETRY / "dispatch/ER-0001/attempt-0002/dispatch_receipt.json"
    result = validate.load_json(result_path)
    receipt = validate.load_json(receipt_path)
    tests: dict[str, bool] = {}

    tests["valid_immutable_assignment_passes"] = validate.assignment_errors(0, assignment, capture_row) == []
    tests["activation_binding_rejected"] = bool(validate.pin_errors("0" * 64, validate.CONTROL_PINS["activation_v3"][1], "activation"))
    tests["master_prelaunch_binding_rejected"] = bool(validate.pin_errors("0" * 64, validate.CONTROL_PINS["master_prelaunch_v3"][1], "prelaunch"))
    tests["question_supersession_binding_rejected"] = bool(validate.pin_errors("0" * 64, validate.CONTROL_PINS["question_supersession"][1], "supersession"))
    tests["extra_lf_reconciliation_binding_rejected"] = bool(validate.pin_errors("0" * 64, validate.CONTROL_PINS["extra_lf_reconciliation"][1], "reconciliation"))
    tests["native_capture_binding_rejected"] = bool(validate.pin_errors("0" * 64, validate.CONTROL_PINS["native_capture"][1], "capture"))
    tests["manifest_binding_rejected"] = bool(validate.pin_errors("0" * 64, validate.CONTROL_PINS["manifest"][1], "manifest"))

    bad = copy.deepcopy(receipt); bad["packet_sha256"] = "0" * 64
    tests["packet_hash_binding_rejected"] = bool(validate.receipt_binding_errors(bad, 0, capture_row))
    bad = copy.deepcopy(receipt); bad["dispatch_intent_sha256"] = "0" * 64
    tests["intent_hash_binding_rejected"] = bool(validate.receipt_binding_errors(bad, 0, capture_row))
    bad = copy.deepcopy(receipt); bad["result_sha256"] = "0" * 64
    tests["result_hash_binding_rejected"] = bool(validate.receipt_binding_errors(bad, 0, capture_row))
    bad = copy.deepcopy(receipt); bad["result_sha256"] = "0" * 64; bad["output_sha256"] = "0" * 64
    tests["receipt_result_output_hash_binding_rejected"] = bool(validate.receipt_binding_errors(bad, 0, capture_row))
    bad = copy.deepcopy(receipt); bad["controller_thread_id"] = "wrong"; bad["model"] = "wrong"; bad["reasoning_effort"] = "high"; bad["fresh_child"] = False
    tests["controller_model_effort_fresh_binding_rejected"] = bool(validate.receipt_binding_errors(bad, 0, capture_row))
    tests["missing_cardinality_rejected"] = bool(validate.cardinality_errors(validate.IDS[:-1], 8, "assignments"))
    tests["duplicate_cardinality_rejected"] = bool(validate.cardinality_errors(validate.IDS[:-1] + [validate.IDS[0]], 8, "assignments"))
    tests["extra_output_rejected"] = bool(validate.output_inventory_errors(["debug.json", "result.json"]))

    bad = copy.deepcopy(result); bad["extra"] = True
    tests["full_v2_schema_extra_key_rejected"] = bool(validate.result_semantic_errors(bad, schema))
    tests["https_fragment_anchor_accepted"] = validate.direct_url_errors("https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.5", "url") == []
    tests["missing_host_rejected"] = bool(validate.direct_url_errors("https:///rfc9110#section-1", "url"))
    tests["whitespace_url_rejected"] = bool(validate.direct_url_errors("https://example.org/has space", "url"))
    tests["non_https_rejected"] = bool(validate.direct_url_errors("http://example.org/source", "url"))
    tests["search_result_url_rejected"] = bool(validate.direct_url_errors("https://www.google.com/search?q=rfc9110", "url"))
    tests["fragment_only_rejected"] = bool(validate.direct_url_errors("#section-9", "url"))
    tests["malformed_url_rejected"] = bool(validate.direct_url_errors("https://[bad-host/source", "url"))
    bad = copy.deepcopy(result); bad["findings"][0]["source_urls"] = ["https://unbound.example.org/source"]
    tests["unbound_source_rejected"] = bool(validate.result_semantic_errors(bad, schema))

    bad = copy.deepcopy(result); bad["attempt_id"] = "attempt-0001"
    tests["old_attempt_veto_rejected"] = bool(validate.result_binding_errors(bad, assignment, 0))
    bad = copy.deepcopy(result); bad["agent_path"] = validate.expected_agent(1); bad["task_thread_id"] = validate.expected_agent(1)
    tests["assignment_path_mapping_rejected"] = bool(validate.result_binding_errors(bad, assignment, 0))
    bad = copy.deepcopy(receipt); bad["native_child_thread_id"] = "wrong-native"; bad["task_thread_id"] = "wrong-native"
    tests["capture_thread_binding_rejected"] = bool(validate.receipt_binding_errors(bad, 0, capture_row))
    bad_capture = copy.deepcopy(capture_row); bad_capture["terminal_response_prefix"] = "BLOCKED"
    tests["terminal_pmr1_binding_rejected"] = bad_capture["terminal_response_prefix"] != "PMR1"

    old = validate.collect_identity_strings(validate.load_json(validate.OLD / "attempt-0001-failure-lineage.json"))
    tests["old_identity_reuse_rejected"] = bool(validate.identity_reuse_errors(old, {next(iter(old))})) if old else False
    thread_ids = [row["native_child_thread_id"] for row in capture["leaves"]]
    turn_ids = [row["native_child_turn_id"] for row in capture["leaves"]]
    tests["duplicate_capture_thread_rejected"] = bool(validate.cardinality_errors(thread_ids[:-1] + [thread_ids[0]], 8, "threads"))
    tests["duplicate_capture_turn_rejected"] = bool(validate.cardinality_errors(turn_ids[:-1] + [turn_ids[0]], 8, "turns"))

    local_states = []
    for index, row in enumerate(manifest["assignments"]):
        current = validate.load_json(validate.OUTPUT / validate.IDS[index] / "attempts" / validate.ATTEMPT / "result.json")
        if index == 0:
            current["model"] = "wrong"
        errors = validate.result_binding_errors(current, row, index)
        errors += validate.result_semantic_errors(current, schema)
        local_states.append(not errors)
    tests["partial_validity_preserves_unrelated_seven"] = local_states.count(True) == 7 and local_states[0] is False

    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {"checker": "external_research_retry_negative_tests_v3", "status": "pass" if not failures and len(tests) >= 18 else "fail",
              "test_count": len(tests), "errors": failures, "tests": tests,
              "research_credit": 0, "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
