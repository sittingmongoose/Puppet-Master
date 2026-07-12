#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import sys
import importlib.metadata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
NS = ROOT / "master/cross_domain_seams/wave-0001"
V10_SHA = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def verify() -> dict:
    errors = []
    required = [
        "authority.json", "architecture.json", "source_inventory.json", "launch_seal.json",
        "manifest.jsonl", "packet_registry.jsonl", "normalized_edge_ledger.jsonl",
        "leaf_prompt.json", "receipt_contract.json", "activation.template.json",
        "schema/cross_domain_seam_result.schema.json", "validation/local-prelaunch-candidate.json",
    ]
    for rel in required:
        if not (NS / rel).is_file(): errors.append(f"missing:{rel}")
    if errors:
        return {"status": "fail", "errors": errors}
    authority = json.loads((NS / "authority.json").read_text())
    seal = json.loads((NS / "launch_seal.json").read_text())
    local = json.loads((NS / "validation/local-prelaunch-candidate.json").read_text())
    architecture = json.loads((NS / "architecture.json").read_text())
    inventory = json.loads((NS / "source_inventory.json").read_text())
    manifest = jsonl(NS / "manifest.jsonl")
    registry = jsonl(NS / "packet_registry.jsonl")
    edges = jsonl(NS / "normalized_edge_ledger.jsonl")

    v10 = ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json"
    if sha(v10) != V10_SHA: errors.append("v10_hash")
    for key, expected in {
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH",
        "activation_granted": False, "assignment_count": 8,
        "semantic_transaction_cap": 8, "normalized_edge_count": 9365,
        "feature_count": 2495, "concurrency_policy_v10_sha256": V10_SHA,
        "rolling_max": 40, "preferred_min": 32, "preferred_max": 40, "atomic_cap": 16,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0,
        "merge_credit": 0, "promotion_credit": 0,
    }.items():
        if authority.get(key) != expected: errors.append(f"authority:{key}")
    if architecture.get("pair_count") != 11: errors.append("pair_count")
    if architecture.get("candidate_related_conflicts") != 178: errors.append("conflict_count")
    if architecture.get("primary_quarantine_count") != 5: errors.append("primary_quarantine_count")
    if architecture.get("reverse_shadow_quarantine_count") != 5: errors.append("shadow_quarantine_count")
    if local.get("activation_files") != 0 or local.get("gate_passed") is not False: errors.append("local_gate")

    hash_bindings = {
        "source_inventory_sha256": "source_inventory.json",
        "architecture_sha256": "architecture.json",
        "manifest_sha256": "manifest.jsonl",
        "packet_registry_sha256": "packet_registry.jsonl",
        "normalized_edge_ledger_sha256": "normalized_edge_ledger.jsonl",
        "result_schema_sha256": "schema/cross_domain_seam_result.schema.json",
        "leaf_prompt_sha256": "leaf_prompt.json",
        "receipt_contract_sha256": "receipt_contract.json",
        "activation_template_sha256": "activation.template.json",
    }
    for field, rel in hash_bindings.items():
        if authority.get(field) != sha(NS / rel): errors.append(f"authority_hash:{field}")
    if seal.get("authority_sha256") != sha(NS / "authority.json"): errors.append("seal_authority_hash")
    for field, rel in {k: v for k, v in hash_bindings.items() if k != "source_inventory_sha256" and k != "architecture_sha256"}.items():
        if seal.get(field) != sha(NS / rel): errors.append(f"seal_hash:{field}")

    for rel, expected in inventory["source_hashes"].items():
        path = ROOT / rel
        if not path.is_file() or sha(path) != expected: errors.append(f"source_hash:{rel}")
    if inventory.get("primary_candidate_rows") != 217 or inventory.get("primary_related_rows") != 5323: errors.append("primary_source_counts")
    if inventory.get("reverse_shadow_candidate_rows") != 46 or inventory.get("reverse_shadow_related_rows") != 6131: errors.append("shadow_source_counts")
    if inventory.get("primary_quarantine_findings") != 5 or inventory.get("reverse_shadow_quarantine_findings") != 5: errors.append("quarantine_source_counts")

    ids = [x["normalized_edge_id"] for x in edges]
    keys = [x["normalized_edge_key"] for x in edges]
    if len(edges) != 9365 or len(set(ids)) != 9365 or len(set(keys)) != 9365: errors.append("edge_union")
    if ids != [f"A005CDS-EDGE-{i:05d}" for i in range(1, 9366)]: errors.append("edge_id_sequence")
    if authority.get("normalized_edge_digest") != digest(keys): errors.append("edge_digest")
    all_features = sorted({ref for row in edges for ref in row["endpoint_refs"]})
    if len(all_features) != 2495 or authority.get("feature_digest") != digest(all_features): errors.append("feature_union")
    if sum(bool(x["candidate_related_conflict"]) for x in edges) != 178: errors.append("conflict_preservation")
    if sum(bool(x["quarantined"]) for x in edges) != 10: errors.append("quarantine_union")
    if sum(any(p["orientation"] == "primary" and p["source_quarantined"] for p in x["provenance"]) for x in edges) != 5: errors.append("primary_quarantine_preservation")
    if sum(any(p["orientation"] == "reverse_shadow" and p["source_quarantined"] for p in x["provenance"]) for x in edges) != 5: errors.append("shadow_quarantine_preservation")
    disp = Counter(x["preserved_disposition"] for x in edges)
    if dict(sorted(disp.items())) != architecture.get("disposition_counts"): errors.append("disposition_counts")

    if len(manifest) != 8 or len(registry) != 8: errors.append("assignment_cardinality")
    expected_assignments = [f"A005CDS-{i:04d}" for i in range(1, 9)]
    if [x["assignment_id"] for x in manifest] != expected_assignments: errors.append("assignment_order")
    packet_edge_ids = []
    prospective_paths = []
    pair_keys = []
    packet_sizes = []
    for row in manifest:
        packet_path = Path(row["packet_path"])
        intent_path = Path(row["dispatch_intent_path"])
        if not packet_path.is_file() or sha(packet_path) != row["packet_sha256"]: errors.append(f"packet_hash:{row['assignment_id']}"); continue
        if not intent_path.is_file() or sha(intent_path) != row["dispatch_intent_sha256"]: errors.append(f"intent_hash:{row['assignment_id']}"); continue
        packet = json.loads(packet_path.read_text())
        intent = json.loads(intent_path.read_text())
        edge_ids = [x["normalized_edge_id"] for x in packet["seams"]]
        packet_edge_ids.extend(edge_ids)
        pair_keys.extend(packet["owner_pair_keys"])
        packet_sizes.append(packet_path.stat().st_size)
        prospective_paths.append(row["prospective_agent_path"])
        if packet["assignment_id"] != row["assignment_id"] or packet["packet_id"] != row["packet_id"]: errors.append(f"packet_identity:{row['assignment_id']}")
        if packet["edge_count"] != len(edge_ids) or len(set(edge_ids)) != len(edge_ids): errors.append(f"packet_coverage:{row['assignment_id']}")
        if packet["edge_membership_digest"] != digest(edge_ids) or row["edge_membership_digest"] != digest(edge_ids): errors.append(f"packet_digest:{row['assignment_id']}")
        feature_refs = sorted({r for x in packet["seams"] for r in x["endpoint_refs"]})
        if feature_refs != sorted(x["provisional_feature_ref"] for x in packet["feature_records"]): errors.append(f"packet_features:{row['assignment_id']}")
        for feature in packet["feature_records"]:
            if not feature["owner_membership"]: errors.append(f"missing_membership:{feature['provisional_feature_ref']}")
            research = feature["universal_research"]
            if research["evidence_state"] == "available_candidate_evidence":
                rp = ROOT / research["result_path"]
                if not rp.is_file() or sha(rp) != research["result_sha256"]: errors.append(f"research_hash:{feature['provisional_feature_ref']}")
        if packet_path.stat().st_size > architecture["packet_ceiling_bytes"]: errors.append(f"packet_ceiling:{row['assignment_id']}")
        if intent["activation_granted"] is not False or intent["status"] != "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH": errors.append(f"intent_gate:{row['assignment_id']}")
        out = Path(intent["output_directory"])
        if not out.is_dir() or any(out.iterdir()): errors.append(f"output_not_empty:{row['assignment_id']}")
        if Path(intent["dispatch_receipt_ref"]).exists(): errors.append(f"receipt_exists:{row['assignment_id']}")
    if len(packet_edge_ids) != 9365 or set(packet_edge_ids) != set(ids) or len(set(packet_edge_ids)) != 9365: errors.append("packet_union")
    if len(set(pair_keys)) != 11 or len(pair_keys) != 11: errors.append("pair_partition")
    if len(set(prospective_paths)) != 8: errors.append("agent_path_uniqueness")
    if authority.get("packet_root") != digest([x["packet_sha256"] for x in registry]): errors.append("packet_root")
    if authority.get("intent_root") != digest([x["dispatch_intent_sha256"] for x in manifest]): errors.append("intent_root")
    if packet_sizes and (min(packet_sizes) != authority["packet_bytes_min"] or max(packet_sizes) != authority["packet_bytes_max"] or sum(packet_sizes) != authority["packet_bytes_total"]): errors.append("packet_size_summary")

    # Fail closed on any live preparation-forbidden artifact.
    forbidden_names = {"activation.json", "activation.v1.json", "native_capture.json", "result.json", "dispatch_receipt.json"}
    forbidden = [str(p) for p in NS.rglob("*") if p.is_file() and p.name in forbidden_names]
    if forbidden: errors.append("forbidden_live_artifacts:" + ",".join(forbidden))

    # Full Draft 2020-12 schema check through the sealed offline dependency.
    bundle = ROOT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
    if bundle.is_dir(): sys.path.insert(0, str(bundle))
    try:
        import jsonschema
        jsonschema.Draft202012Validator.check_schema(json.loads((NS / "schema/cross_domain_seam_result.schema.json").read_text()))
        schema_engine = f"jsonschema-{importlib.metadata.version('jsonschema')}"
    except Exception as exc:
        errors.append(f"schema_engine:{exc}")
        schema_engine = "unavailable"
    return {
        "schema_version": "cross-domain-seam-prelaunch-verification-v1",
        "status": "pass" if not errors else "fail",
        "errors": errors,
        "counts": {"assignments": len(manifest), "packets": len(registry), "edges": len(edges), "features": len(all_features), "pairs": len(set(pair_keys)), "conflicts": 178, "quarantines": 10, "empty_outputs": 8, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0},
        "packet_bytes": {"min": min(packet_sizes), "max": max(packet_sizes), "total": sum(packet_sizes)},
        "schema_engine": schema_engine,
        "concurrency_policy_v10_sha256": V10_SHA,
        "credits": {"coverage": 0, "research": 0, "spec": 0, "merge": 0, "promotion": 0},
    }


if __name__ == "__main__":
    report = verify()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)
