#!/usr/bin/env python3
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERIFY_PATH = ROOT / "verify_external_research_retry_v2.py"
spec = importlib.util.spec_from_file_location("retry_verify_v2_tests", VERIFY_PATH)
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)

def synthetic_broad_result():
    urls = [f"https://example.org/primary/source-{index}" for index in range(8)]
    source_items = [
        {
            "url": url,
            "title": f"Primary source {index}",
            "publisher": "Example Primary Publisher",
            "published_date": None,
            "access_date": "2026-07-11",
            "source_tier": "official" if index == 0 else "primary",
            "material_relevance": "Directly addresses the assigned cross-cutting trust or assurance question."
        }
        for index, url in enumerate(urls)
    ]
    attestation = {
        "current_web_research_performed": True,
        "official_or_primary_sources_first": True,
        "direct_urls_only": True,
        "source_count_contract_checked": True,
        "supported_inference_no_evidence_labels_present": True,
        "no_fabricated_claims": True,
        "no_long_quotations": True,
        "topic_and_refs_binding_verified": True,
        "exact_attempt_id_verified": True,
        "fresh_direct_terminal_contract_acknowledged": True,
    }
    return {
        "audit_id": verify.AUDIT_ID,
        "schema_version": "external-research-result-v2",
        "phase": "external_research_current_web_research",
        "assignment_id": "ER-0005",
        "attempt_id": "attempt-0002",
        "controller_thread_id": verify.CONTROLLER,
        "task_thread_id": "fresh-direct-task-thread-er0005",
        "agent_path": verify.expected_agent(4),
        "model": verify.MODEL,
        "reasoning_effort": verify.EFFORT,
        "status": "completed",
        "topic": verify.EXPECTED["ER-0005"]["topic"],
        "owner_domains": ["permissions_security_privacy"],
        "feature_refs": [],
        "research_questions": [
            "What lifecycle controls do authoritative security and privacy standards require?",
            "How should a product model permission state and revocation?",
            "Which evidence proves permission transitions?",
        ],
        "source_availability": "available",
        "unavailable_evidence": [],
        "sources": source_items,
        "findings": [{
            "finding_id": "F-0001", "claim": "A primary source documents a lifecycle control.",
            "evidence_class": "supported_claim", "source_urls": [urls[0]],
            "confidence": 0.9, "notes": "Synthetic harness evidence."
        }],
        "competitor_standard_patterns": [{
            "pattern_id": "P-0001", "pattern": "Explicit scoped consent and revocation.",
            "evidence_class": "supported_claim", "source_urls": [urls[1]],
            "implication": "Bind scope and revocation to every operation."
        }],
        "failure_modes": [{
            "failure_id": "FM-0001", "failure_mode": "Revocation races with an in-flight operation.",
            "evidence_class": "inference", "source_urls": [urls[2]],
            "mitigation_or_gap": "Require a send-time authority check."
        }],
        "implications": [{
            "implication_id": "I-0001", "implication": "Store explicit authority evidence.",
            "evidence_class": "inference", "source_urls": [urls[3]],
            "rationale": "Makes races auditable."
        }],
        "novel_ideas": [{
            "idea_id": "N-0001", "idea": "A revocation receipt with a causal boundary.",
            "evidence_class": "inference", "source_urls": [urls[4]],
            "rationale": "Separates pre- and post-revocation operations."
        }],
        "unresolved_questions": [{
            "question_id": "U-0001", "question": "How should offline clients reconcile delayed revocation?",
            "evidence_class": "no_evidence", "source_urls": []
        }],
        "self_attestation": attestation,
    }

def run():
    schema = verify.load_json(verify.RETRY / "schema" / "external_research_result_v2.schema.json")
    packet = verify.load_json(verify.RETRY / "packets" / "ER-0001.json")
    intent = verify.load_json(verify.RETRY / "dispatch" / "ER-0001" / "attempt-0002" / "dispatch_intent.json")
    assignment = verify.EXPECTED["ER-0001"]
    tests = {}

    bad = copy.deepcopy(intent)
    bad["attempt_id"] = "attempt-0001"
    tests["attempt_0001_rejected"] = bool(verify.validate_intent(bad, assignment, 0, verify.PACKET_PINS["ER-0001"]))

    bad = copy.deepcopy(intent)
    bad["agent_path"] = "/root/a005_external_research_sprint_0001_attempt_0001_terminal"
    tests["reused_old_identity_rejected"] = bool(verify.validate_intent(bad, assignment, 0, verify.PACKET_PINS["ER-0001"]))

    bad = copy.deepcopy(intent)
    bad["controller_thread_id"] = "wrong-controller"
    bad["model"] = "gpt-5.5"
    bad["reasoning_effort"] = "high"
    tests["wrong_controller_model_effort_rejected"] = bool(verify.validate_intent(bad, assignment, 0, verify.PACKET_PINS["ER-0001"]))

    expected_packets = [f"packets/ER-{index:04d}.json" for index in range(1, 9)]
    tests["missing_extra_packet_rejected"] = bool(
        verify.validate_name_inventory(expected_packets[:-1] + ["packets/ER-9999.json"], expected_packets, "packets")
    )

    bad = copy.deepcopy(packet)
    bad["packet_path"] = bad["packet_path"] + ".wrong"
    tests["wrong_packet_path_rejected"] = bool(verify.validate_packet(bad, assignment, 0))

    bad = copy.deepcopy(intent)
    bad["output_path"] = bad["output_path"] + ".wrong"
    tests["wrong_output_path_rejected"] = bool(verify.validate_intent(bad, assignment, 0, verify.PACKET_PINS["ER-0001"]))

    tests["nonempty_output_rejected"] = bool(verify.validate_prelaunch_inventory(["result.json"], [], []))
    tests["premature_receipt_rejected"] = bool(verify.validate_prelaunch_inventory([], ["ER-0001"], []))

    broad = synthetic_broad_result()
    broad_errors = verify.result_semantic_errors(broad, schema)
    tests["v2_schema_accepts_broad_empty_feature_refs"] = broad_errors == [] and broad["feature_refs"] == []

    missing_errors = []
    for key in ("topic", "research_questions", "sources"):
        candidate = copy.deepcopy(broad)
        del candidate[key]
        missing_errors.extend(verify.schema_errors(candidate, schema))
    tests["schema_missing_topic_questions_sources_rejected"] = bool(missing_errors)

    non_direct = copy.deepcopy(broad)
    non_direct["sources"][0]["url"] = "https://www.google.com/search?q=not-direct"
    tests["non_direct_url_rejected"] = bool(verify.result_semantic_errors(non_direct, schema))

    underfilled = copy.deepcopy(broad)
    underfilled["sources"] = underfilled["sources"][:1]
    underfilled["source_availability"] = "available"
    tests["insufficient_sources_without_unavailable_evidence_rejected"] = bool(verify.result_semantic_errors(underfilled, schema))

    tests["extra_result_file_rejected"] = bool(verify.validate_prelaunch_inventory(["result.json", "debug.json"], [], []))
    tests["duplicate_receipt_rejected"] = bool(verify.validate_name_inventory(["ER-0001", "ER-0001"], ["ER-0001"], "receipts"))
    old_expected = verify.OLD_PINS["failure_lineage"][1]
    tests["old_lineage_hash_drift_rejected"] = ("bad-hash" != old_expected)

    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {
        "checker": "external_research_retry_negative_tests_v2",
        "status": "pass" if not failures else "fail",
        "errors": failures,
        "test_count": len(tests),
        "tests": tests,
        "activation_granted": False,
        "coverage_credit": 0,
        "research_credit": 0,
    }
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0 if not failures else 1

if __name__ == "__main__":
    sys.exit(run())

