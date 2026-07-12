#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
NS = ROOT / "master/cross_domain_seams/wave-0001"

from verify_prelaunch import verify
from validate_postrun import validate_result_document
from generate_activation import validate_independent_report


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def valid_decision(edge_id: str) -> dict:
    return {
        "normalized_edge_id": edge_id,
        "decision": "shared_subsystem_distinct",
        "rationale": "Independent authority and lifecycle analysis preserves these as distinct product features.",
        "authority_lifecycle_outcome_state_failure_analysis": "Authority, lifecycle, user outcome, state boundary, and failure semantics were independently compared and are not identical.",
        "supporting_evidence": ["Packet primary and reverse provenance plus current external source evidence."],
        "counterevidence": ["Name and vocabulary similarity were considered but are not merge proof."],
        "external_research": {
            "state": "sufficient_for_judgment",
            "live_web_research_performed": True,
            "sources": [{"url": "https://example.org/standard", "title": "Standard", "publisher": "Example Standards Body", "accessed_date": "2026-07-11"}],
            "claims": [{"claim": "The external authority distinguishes the two lifecycle contracts.", "source_urls": ["https://example.org/standard"], "applicability": "Directly constrains the authority and failure boundary of this seam."}],
        },
        "unresolved_reason": None,
        "promotion_performed": False,
        "proposed_plan_revision": None,
    }


def valid_result(packet: dict) -> dict:
    ids = [x["normalized_edge_id"] for x in packet["seams"]]
    return {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "schema_version": "cross-domain-seam-adjudication-result-v1",
        "phase": "cross_domain_seam_candidate_adjudication",
        "assignment_id": packet["assignment_id"],
        "attempt_id": "attempt-0001",
        "agent_path": f"/root/a005_cross_domain_seam_{int(packet['assignment_id'][-4:]):04d}_attempt_0001_terminal",
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "status": "completed",
        "input_binding": {"packet_id": packet["packet_id"], "packet_sha256": sha(NS / f"packets/{packet['packet_id']}.json"), "edge_membership_digest": packet["edge_membership_digest"], "activation_transaction_id": "A005-CDS-WAVE-0001-V10-EXACT8"},
        "coverage": {"edge_count": len(ids), "normalized_edge_ids": ids},
        "decisions": [valid_decision(x) for x in ids],
        "self_attestation": {k: True for k in ["all_edges_reviewed", "no_merge_by_name_similarity", "no_silent_domain_collapse", "no_final_promotion", "external_research_used_for_each_final_judgment", "no_descendants", "no_peer_outputs"]},
    }


def main() -> None:
    tests = {}
    def check(name, condition): tests[name] = bool(condition)

    pre = verify()
    check("prelaunch-verifier-pass", pre["status"] == "pass")
    edges = jsonl(NS / "normalized_edge_ledger.jsonl")
    manifest = jsonl(NS / "manifest.jsonl")
    authority = json.loads((NS / "authority.json").read_text())
    inventory = json.loads((NS / "source_inventory.json").read_text())
    conflicts = [x for x in edges if x["candidate_related_conflict"]]
    quarantines = [x for x in edges if x["quarantined"]]
    check("exact-edge-union", len(edges) == len({x["normalized_edge_key"] for x in edges}) == 9365)
    check("exact-feature-union", len({r for x in edges for r in x["endpoint_refs"]}) == 2495)
    check("exact-conflict-count", len(conflicts) == 178)
    check("exact-quarantine-count", len(quarantines) == 10)
    check("exact-assignment-count", len(manifest) == 8)
    check("v10-atomic8", authority["semantic_transaction_cap"] == 8 and authority["atomic_cap"] == 16)
    check("zero-state", all(v == 0 for v in [authority["results"], authority["receipts"], authority["native_capture_rows"], authority["coverage_credit"], authority["research_credit"], authority["spec_credit"], authority["merge_credit"], authority["promotion_credit"]]))

    # Individual preservation probes make source-status loss or normalization
    # suppression local and deterministic rather than a single aggregate test.
    for row in conflicts:
        check("conflict-preserved:" + row["normalized_edge_id"], "related_but_distinct" in row["observed_dispositions"] and any(x in row["observed_dispositions"] for x in ["merge_candidate", "unsupported", "uncertain"]))
    for row in quarantines:
        check("quarantine-preserved:" + row["normalized_edge_id"], bool(row["quarantine_observations"]) and any(x["source_quarantined"] for x in row["provenance"]))
    for row in edges[:100]:
        check("edge-identity:" + row["normalized_edge_id"], row["normalized_edge_key"] == "\0".join(sorted(row["endpoint_refs"])) and len(row["provenance"]) >= 1)
    for rel, expected in inventory["source_hashes"].items():
        check("source-hash:" + rel, (ROOT / rel).is_file() and sha(ROOT / rel) == expected)

    packet_union = []
    pair_union = []
    for row in manifest:
        packet = json.loads(Path(row["packet_path"]).read_text())
        ids = [x["normalized_edge_id"] for x in packet["seams"]]
        packet_union += ids
        pair_union += packet["owner_pair_keys"]
        check("packet-membership:" + row["assignment_id"], len(ids) == row["edge_count"] and digest(ids) == row["edge_membership_digest"])
        check("packet-feature-closure:" + row["assignment_id"], sorted({r for x in packet["seams"] for r in x["endpoint_refs"]}) == sorted(x["provisional_feature_ref"] for x in packet["feature_records"]))
        check("packet-ceiling:" + row["assignment_id"], Path(row["packet_path"]).stat().st_size <= 8_000_000)
        result = valid_result(packet)
        check("valid-result:" + row["assignment_id"], validate_result_document(result, packet) == [])
    check("packet-exact-partition", len(packet_union) == len(set(packet_union)) == 9365)
    check("pair-exact-partition", len(pair_union) == len(set(pair_union)) == 11)

    # Complete-result negative probes use the first packet and cover schema,
    # cardinality, source/claim closure, research sufficiency, and promotion.
    packet = json.loads(Path(manifest[0]["packet_path"]).read_text())
    base = valid_result(packet)
    mutations = []
    def add(name, fn):
        d = copy.deepcopy(base); fn(d); mutations.append((name, d))
    add("extra-top-key", lambda d: d.__setitem__("extra", True))
    add("wrong-model", lambda d: d.__setitem__("model", "gpt-5.6-luna"))
    add("wrong-effort", lambda d: d.__setitem__("reasoning_effort", "max"))
    add("wrong-path", lambda d: d.__setitem__("agent_path", "/root/reused"))
    add("missing-edge", lambda d: (d["coverage"]["normalized_edge_ids"].pop(), d["decisions"].pop(), d["coverage"].__setitem__("edge_count", d["coverage"]["edge_count"]-1)))
    add("duplicate-edge", lambda d: d["coverage"]["normalized_edge_ids"].__setitem__(-1, d["coverage"]["normalized_edge_ids"][0]))
    add("foreign-edge", lambda d: d["decisions"][0].__setitem__("normalized_edge_id", "A005CDS-EDGE-99999"))
    add("wrong-packet-hash", lambda d: d["input_binding"].__setitem__("packet_sha256", "0"*64))
    add("wrong-membership-digest", lambda d: d["input_binding"].__setitem__("edge_membership_digest", "0"*64))
    add("no-live-research", lambda d: d["decisions"][0]["external_research"].__setitem__("live_web_research_performed", False))
    add("no-sources", lambda d: d["decisions"][0]["external_research"].__setitem__("sources", []))
    add("no-claims", lambda d: d["decisions"][0]["external_research"].__setitem__("claims", []))
    add("unregistered-claim-source", lambda d: d["decisions"][0]["external_research"]["claims"][0].__setitem__("source_urls", ["https://foreign.example/x"]))
    add("non-https-source", lambda d: d["decisions"][0]["external_research"]["sources"][0].__setitem__("url", "http://example.org/x"))
    add("promotion-performed", lambda d: d["decisions"][0].__setitem__("promotion_performed", True))
    add("insufficient-not-uncertain", lambda d: d["decisions"][0]["external_research"].__setitem__("state", "insufficient_unresolved"))
    add("missing-attestation", lambda d: d["self_attestation"].pop("no_final_promotion"))
    add("wrong-status", lambda d: d.__setitem__("status", "partial"))
    add("wrong-attempt", lambda d: d.__setitem__("attempt_id", "attempt-0002"))
    for name, doc in mutations:
        check("result-negative:" + name, bool(validate_result_document(doc, packet)))

    # Generator-compatible independent report closure and negative mutations.
    report = {
        "status": "pass", "gate_passed": True,
        "audit_id": authority["audit_id"], "wave_id": authority["wave_id"],
        "assignment_count": 8, "assignment_ids": [x["assignment_id"] for x in manifest],
        "agent_paths": [x["prospective_agent_path"] for x in manifest],
        "normalized_edge_count": 9365, "normalized_edge_digest": authority["normalized_edge_digest"],
        "feature_count": 2495, "feature_digest": authority["feature_digest"],
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "concurrency_policy_v10_sha256": "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1",
        "authority_sha256": sha(NS / "authority.json"), "launch_seal_sha256": sha(NS / "launch_seal.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"), "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "normalized_edge_ledger_sha256": sha(NS / "normalized_edge_ledger.jsonl"),
        "outputs_empty": 8, "receipts": 0, "results": 0, "native_capture_rows": 0, "activation_files": 0,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0, "merge_credit": 0, "promotion_credit": 0,
        "errors": [],
    }
    with tempfile.TemporaryDirectory() as td:
        p = Path(td)/"report.json"; p.write_text(json.dumps(report,sort_keys=True))
        check("activation-report-valid", validate_independent_report(report,p,sha(p)) == [])
        for key in ["status", "gate_passed", "assignment_count", "assignment_ids", "agent_paths", "normalized_edge_count", "normalized_edge_digest", "feature_count", "feature_digest", "model", "reasoning_effort", "controller_thread_id", "concurrency_policy_v10_sha256", "authority_sha256", "launch_seal_sha256", "outputs_empty", "receipts", "results", "native_capture_rows", "activation_files", "coverage_credit", "research_credit", "spec_credit", "merge_credit", "promotion_credit"]:
            altered = copy.deepcopy(report)
            value = altered[key]
            altered[key] = (not value) if isinstance(value,bool) else (value+1 if isinstance(value,int) else (value+["x"] if isinstance(value,list) else "wrong"))
            q=Path(td)/(key+".json"); q.write_text(json.dumps(altered,sort_keys=True))
            check("activation-negative:"+key, bool(validate_independent_report(altered,q,sha(q))))
        check("activation-report-hash-drift", bool(validate_independent_report(report,p,"0"*64)))

    failed = sorted(k for k,v in tests.items() if not v)
    report_out = {"schema_version": "cross-domain-seam-tests-v1", "status": "pass" if not failed else "fail", "counts": {"total": len(tests), "passed": len(tests)-len(failed), "failed": len(failed)}, "failed_tests": failed, "test_digest": digest(tests)}
    print(json.dumps(report_out, indent=2, sort_keys=True))
    raise SystemExit(0 if not failed else 1)


if __name__ == "__main__": main()
