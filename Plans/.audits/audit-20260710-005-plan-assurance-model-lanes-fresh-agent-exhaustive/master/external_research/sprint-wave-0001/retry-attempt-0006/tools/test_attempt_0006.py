#!/usr/bin/env python3
"""Deterministic negative tests for attempt-0006 preparation and postrun contracts."""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
from typing import Any

import common
import generate_activation_transaction as activation
import validate_postrun as postrun


def valid_independent_report() -> dict[str, Any]:
    return {
        "status": "pass", "gate_passed": True, "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID, "assignment_ids": common.RECOVERY_IDS,
        "assignment_count": 2, "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT, "fork_turns": "none", "fresh_direct_leaves": 2,
        "semantic_transaction_cap": 2, "concurrency_policy_v9_sha256": common.V9_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "preserved_cumulative_floor_count": 6, "outputs_empty": True, "receipts": 0, "results": 0,
        "native_capture_rows": 0, "activation_transaction_files": 0, "coverage_credit": 0, "research_credit": 0,
        "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
        "required_positive_receipt_schema_version": common.POSITIVE_RECEIPT_SCHEMA_VERSION, "errors": [],
    }


def synthetic_transaction() -> tuple[dict[str, Any], dict[str, dict[str, Any]], dict[str, Any], dict[str, dict[str, Any]]]:
    report_path = Path("/future/independent-prelaunch.json")
    core = activation.build_core(report_path, "a" * 64); core_sha = common.digest(core)
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    auths = {aid: activation.build_authorization(aid, assignments[aid], core, core_sha) for aid in common.RECOVERY_IDS}
    envelope = activation.build_envelope(core, core_sha, auths)
    return core, auths, envelope, assignments


def valid_result(aid: str, assignment: dict[str, Any], core: dict[str, Any], auth: dict[str, Any]) -> dict[str, Any]:
    packet = common.load(common.packet_path(aid))
    urls = ["https://example.org/source-%02d" % i for i in range(8)]
    sources = [{"url": url, "title": "Official source %02d" % i, "publisher": "Example Standards", "published_date": None, "access_date": "2026-07-11", "source_tier": "official", "material_relevance": "Direct evidence for the assigned recovery question."} for i, url in enumerate(urls)]
    rows = {
        "findings": [{"finding_id": "F-1", "claim": "Supported finding.", "evidence_class": "supported_claim", "source_urls": [urls[0]], "confidence": 0.9, "notes": "Direct support."}],
        "competitor_standard_patterns": [{"pattern_id": "P-1", "pattern": "Pattern.", "evidence_class": "inference", "source_urls": [urls[1]], "implication": "Use the pattern carefully."}],
        "failure_modes": [{"failure_id": "FM-1", "failure_mode": "Failure.", "evidence_class": "supported_claim", "source_urls": [urls[2]], "mitigation_or_gap": "Mitigate it."}],
        "implications": [{"implication_id": "I-1", "implication": "Implication.", "evidence_class": "inference", "source_urls": [urls[3]], "rationale": "Derived carefully."}],
        "novel_ideas": [{"idea_id": "N-1", "idea": "Idea.", "evidence_class": "inference", "source_urls": [urls[4]], "rationale": "Derived carefully."}],
        "unresolved_questions": [{"question_id": "U-1", "question": "Still unknown.", "evidence_class": "no_evidence", "source_urls": []}],
    }
    attestation = {key: True for key in common.load(common.NAMESPACE / "leaf_initial_task_contract.json")["required_self_attestations"]}
    value = {
        "audit_id": common.AUDIT_ID, "schema_version": common.RESULT_SCHEMA_VERSION, "phase": "external_research_current_web_research",
        "assignment_id": aid, "attempt_id": common.ATTEMPT_ID, "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"], "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT,
        "status": "completed", "activation_transaction_id": core["activation_transaction_id"],
        "activation_core_sha256": common.digest(core), "leaf_dispatch_authorization_sha256": common.digest(auth),
        "topic": packet["topic"], "owner_domains": packet["owner_domains"], "feature_refs": packet["feature_refs"],
        "research_questions": packet["research_questions"], "question_coverage": [{"question_index": i, "question": question, "coverage_state": "covered", "evidence_refs": ["F-1"]} for i, question in enumerate(packet["research_questions"])],
        "source_availability": "available", "unavailable_evidence": [], "sources": sources, "self_attestation": attestation,
    }
    value.update(rows)
    return value


def valid_receipt(aid: str, assignment: dict[str, Any], result: dict[str, Any], core: dict[str, Any], auth: dict[str, Any], envelope: dict[str, Any], thread: str) -> dict[str, Any]:
    contract = common.load(common.NAMESPACE / "receipt_contract_v6.json")
    value = dict(contract["exact_values"])
    value.update({
        "assignment_id": aid, "agent_path": assignment["canonical_agent_path"], "task_thread_id": thread,
        "native_child_thread_id": thread, "packet_id": assignment["packet_id"], "packet_path": str(common.packet_path(aid)),
        "packet_sha256": common.sha(common.packet_path(aid)), "dispatch_intent_path": str(common.intent_path(aid)),
        "dispatch_intent_sha256": common.sha(common.intent_path(aid)), "activation_transaction_id": core["activation_transaction_id"],
        "authorization_transaction_id": auth["authorization_transaction_id"], "activation_core_path": str(common.core_path()),
        "activation_core_sha256": common.digest(core), "leaf_dispatch_authorization_path": str(common.authorization_path(aid)),
        "leaf_dispatch_authorization_sha256": common.digest(auth), "activation_envelope_path": str(common.envelope_path()),
        "activation_envelope_sha256": common.digest(envelope), "output_directory": str(common.output_dir(aid)),
        "result_path": str(common.result_path(aid)), "result_sha256": common.digest(result), "output_sha256": common.digest(result),
    })
    assert set(value) == set(contract["required_fields"])
    return value


def main() -> None:
    tests: dict[str, bool] = {}
    schema = common.load(common.NAMESPACE / "schema/external_research_result_v6.schema.json")
    core, auths, envelope, assignments = synthetic_transaction()
    results = {aid: valid_result(aid, assignments[aid], core, auths[aid]) for aid in common.RECOVERY_IDS}
    receipts = {aid: valid_receipt(aid, assignments[aid], results[aid], core, auths[aid], envelope, "thread-%s" % aid) for aid in common.RECOVERY_IDS}
    capture = {"schema_version": "external-research-native-capture-v6", "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID, "assignment_count": 2, "leaves": []}
    for index, aid in enumerate(common.RECOVERY_IDS):
        capture["leaves"].append({"assignment_id": aid, "agent_path": common.expected_agent_path(aid), "native_child_thread_id": receipts[aid]["task_thread_id"], "native_child_turn_id": "turn-%d" % index, "native_child_turn_status": "completed", "terminal_response_exact": "PMR1", "result_present_before_pmr1": True, "result_sha256": common.digest(results[aid]), "receipt_sha256": common.digest(receipts[aid])})
    prior = {"identities": set(), "paths": set(), "files": 0}
    valid = postrun.validate_snapshot(core, auths, envelope, results, receipts, capture, {aid: ["result.json"] for aid in common.RECOVERY_IDS}, prior)
    tests["full_valid_two_leaf_fixture"] = valid["status"] == "pass" and valid["cumulative_eligible_count"] == 8 and valid["cumulative_research_credit"] == 8
    for aid in common.RECOVERY_IDS:
        tests["valid_result:%s" % aid] = common.result_errors(results[aid], assignments[aid], schema, common.digest(core), common.digest(auths[aid]), core["activation_transaction_id"]) == []
        tests["valid_receipt:%s" % aid] = common.receipt_errors(receipts[aid], assignments[aid], common.digest(results[aid]), core, common.digest(core), auths[aid], common.digest(auths[aid]), common.digest(envelope)) == []

    contract = common.load(common.NAMESPACE / "receipt_contract_v6.json")
    tests["contract_document_label_exact"] = contract["schema_version"] == common.CONTRACT_SCHEMA_VERSION
    tests["positive_receipt_label_exact"] = contract["required_positive_receipt_schema_version"] == common.POSITIVE_RECEIPT_SCHEMA_VERSION
    tests["labels_are_distinct"] = common.CONTRACT_SCHEMA_VERSION != common.POSITIVE_RECEIPT_SCHEMA_VERSION
    for aid in common.RECOVERY_IDS:
        base = receipts[aid]
        copied = copy.deepcopy(base); copied["schema_version"] = common.CONTRACT_SCHEMA_VERSION
        tests["attempt5_reproduction:contract-label-copied:%s" % aid] = any("contract-label-copied" in e for e in common.receipt_errors(copied, assignments[aid], common.digest(results[aid]), core, common.digest(core), auths[aid], common.digest(auths[aid]), common.digest(envelope)))
        for key in contract["required_fields"]:
            missing = copy.deepcopy(base); missing.pop(key)
            tests["receipt:%s:missing:%s" % (aid, key)] = bool(common.receipt_errors(missing, assignments[aid], common.digest(results[aid]), core, common.digest(core), auths[aid], common.digest(auths[aid]), common.digest(envelope)))
            wrong = copy.deepcopy(base)
            value = wrong[key]
            if isinstance(value, bool): wrong[key] = not value
            elif isinstance(value, int): wrong[key] = value + 1
            else: wrong[key] = "wrong"
            tests["receipt:%s:wrong:%s" % (aid, key)] = bool(common.receipt_errors(wrong, assignments[aid], common.digest(results[aid]), core, common.digest(core), auths[aid], common.digest(auths[aid]), common.digest(envelope)))
        extra = copy.deepcopy(base); extra["extra"] = True
        tests["receipt:%s:extra-key" % aid] = bool(common.receipt_errors(extra, assignments[aid], common.digest(results[aid]), core, common.digest(core), auths[aid], common.digest(auths[aid]), common.digest(envelope)))

    reference_variants = ["source_urls", "citation_ids", "source_claim_ids", "citations", "source_refs", "claim_refs", "evidence_refs"]
    for section in common.SECTIONS:
        for key in reference_variants:
            candidate = copy.deepcopy(results["ER-0008"])
            candidate[section][0]["evidence_class"] = "no_evidence"
            candidate[section][0]["source_urls"] = []
            candidate[section][0][key] = ["https://example.org/evidence"]
            tests["no_evidence:%s:%s" % (section, key)] = any("no_evidence_with_references" in e for e in common.semantic_errors(candidate, common.load(common.packet_path("ER-0008"))))
    attempt5 = copy.deepcopy(results["ER-0008"]); attempt5["unresolved_questions"][0]["source_urls"] = [attempt5["sources"][0]["url"]]
    tests["attempt5_reproduction:no_evidence-with-source"] = any("no_evidence_with_references" in e for e in common.semantic_errors(attempt5, common.load(common.packet_path("ER-0008"))))

    semantic_mutations = {
        "duplicate_source_registry": lambda x: x["sources"].append(copy.deepcopy(x["sources"][0])),
        "non_https_source": lambda x: x["sources"][0].update(url="http://example.org"),
        "search_source": lambda x: x["sources"][0].update(url="https://google.com/search?q=x"),
        "unregistered_claim_source": lambda x: x["findings"][0].update(source_urls=["https://example.org/foreign"]),
        "supported_without_source": lambda x: x["findings"][0].update(source_urls=[]),
        "cited_unknown_class": lambda x: x["findings"][0].update(evidence_class="unknown"),
        "question_list_drift": lambda x: x["research_questions"].append("foreign"),
        "question_coverage_missing": lambda x: x["question_coverage"].pop(),
        "question_index_order": lambda x: x["question_coverage"][0].update(question_index=1),
        "question_text_drift": lambda x: x["question_coverage"][0].update(question="wrong"),
        "question_state": lambda x: x["question_coverage"][0].update(coverage_state="blocked"),
        "question_evidence_empty": lambda x: x["question_coverage"][0].update(evidence_refs=[]),
        "question_evidence_foreign": lambda x: x["question_coverage"][0].update(evidence_refs=["FOREIGN"]),
        "available_source_underfill": lambda x: x.update(sources=x["sources"][:1]),
    }
    packet3 = common.load(common.packet_path("ER-0003"))
    for name, mutate in semantic_mutations.items():
        candidate = copy.deepcopy(results["ER-0003"]); mutate(candidate)
        tests["semantic:%s" % name] = bool(common.semantic_errors(candidate, packet3))

    schema_mutations = {
        "missing_question_coverage": lambda x: x.pop("question_coverage"), "extra_top": lambda x: x.update(extra=True),
        "wrong_schema_version": lambda x: x.update(schema_version="v5"), "wrong_attempt": lambda x: x.update(attempt_id="attempt-0005"),
        "wrong_model": lambda x: x.update(model="gpt-5.6-sol"), "wrong_effort": lambda x: x.update(reasoning_effort="xhigh"),
        "wrong_agent_path": lambda x: x.update(agent_path="relative"), "duplicate_question_ref": lambda x: x["question_coverage"][0].update(evidence_refs=["F-1", "F-1"]),
        "question_index_out_of_range": lambda x: x["question_coverage"][0].update(question_index=9),
    }
    for name, mutate in schema_mutations.items():
        candidate = copy.deepcopy(results["ER-0003"]); mutate(candidate)
        tests["schema:%s" % name] = bool(common.schema_errors(candidate, schema))

    report = valid_independent_report()
    tests["independent_report_valid_shape"] = activation.report_errors(report, Path("/missing"), "a" * 64) == ["independent-report:hash"]
    for key in sorted(report):
        if key == "errors": continue
        changed = copy.deepcopy(report)
        value = changed[key]
        if isinstance(value, bool): changed[key] = not value
        elif isinstance(value, int): changed[key] = value + 1
        elif isinstance(value, list): changed[key] = value + ["foreign"]
        elif isinstance(value, str): changed[key] = value + "-wrong"
        tests["independent-report:wrong:%s" % key] = any(key in error for error in activation.report_errors(changed, Path("/missing"), "a" * 64))
    changed = copy.deepcopy(report); changed["errors"] = ["bad"]
    tests["independent-report:errors-nonempty"] = any("errors" in error for error in activation.report_errors(changed, Path("/missing"), "a" * 64))
    changed = copy.deepcopy(report); changed["preserved_cumulative_floor_digest"] = "0" * 64
    tests["malformed-floor-rejected"] = any("preserved_cumulative_floor_digest" in e for e in activation.report_errors(changed, Path("/missing"), "a" * 64))

    report_path = Path("/future/independent-prelaunch.json")
    for key in sorted(core):
        changed = copy.deepcopy(core); changed[key] = False if isinstance(changed[key], bool) else "wrong"
        tests["activation-core:wrong:%s" % key] = bool(activation.core_errors(changed, report_path, "a" * 64))
    for aid in common.RECOVERY_IDS:
        for key in sorted(auths[aid]):
            changed = copy.deepcopy(auths[aid]); changed[key] = False if isinstance(changed[key], bool) else "wrong"
            tests["authorization:%s:wrong:%s" % (aid, key)] = bool(activation.authorization_errors(changed, aid, assignments[aid], core, common.digest(core)))
    for key in sorted(envelope):
        changed = copy.deepcopy(envelope); changed[key] = False if isinstance(changed[key], bool) else "wrong"
        tests["envelope:wrong:%s" % key] = bool(activation.envelope_errors(changed, core, common.digest(core), auths))
    generator_source = (common.NAMESPACE / "tools/generate_activation_transaction.py").read_text(encoding="utf-8")
    tests["generator-replay-exclusive-create"] = "os.O_EXCL" in generator_source
    tests["generator-emission-order-core-first"] = generator_source.index("write_exclusive(common.core_path()") < generator_source.index("write_exclusive(common.authorization_path") < generator_source.index("write_exclusive(common.envelope_path()")
    tests["generator-not-invoked-prelaunch"] = common.zero_state_errors() == []

    nonempty = postrun.validate_snapshot(core, auths, envelope, results, receipts, capture, {"ER-0003": ["result.json", "extra.json"], "ER-0008": ["result.json"]}, prior)
    tests["extra-output-veto"] = nonempty["status"] == "fail_closed" and "ER-0003" in nonempty["rejected_attempt_0006_ids"]
    reused = {"identities": {receipts["ER-0003"]["task_thread_id"]}, "paths": set(), "files": 1}
    identity = postrun.validate_snapshot(core, auths, envelope, results, receipts, capture, {aid: ["result.json"] for aid in common.RECOVERY_IDS}, reused)
    tests["identity-reuse-veto"] = identity["status"] == "fail_closed"
    tests["current-zero-state"] = common.zero_state_errors() == []
    tests["v9-live-hash"] = common.sha(common.ROOT / "master/coordination/CONCURRENCY_POLICY_V9.json") == common.V9_SHA256
    tests["attempt5-capture-live-hash"] = common.sha(common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005/runtime/native_capture.json") == common.ATTEMPT5_CAPTURE_SHA256
    tests["attempt5-primary-live-hash"] = common.sha(common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005/validation/primary-cumulative-postrun.json") == common.ATTEMPT5_PRIMARY_SHA256
    tests["preserved-floor-live-digest"] = common.digest(common.FLOOR_IDS) == common.FLOOR_DIGEST

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    output = {"schema_version": "external-research-recovery-attempt-0006-tests-v1", "status": "pass" if not failures and len(tests) >= 150 else "fail", "counts": {"passed": len(tests) - len(failures), "total": len(tests), "failed": len(failures)}, "errors": failures, "test_digest": hashlib.sha256(json.dumps(tests, sort_keys=True, separators=(",", ":")).encode()).hexdigest(), "tests": tests}
    print(json.dumps(output, indent=2, sort_keys=True)); raise SystemExit(0 if output["status"] == "pass" else 1)


if __name__ == "__main__": main()
