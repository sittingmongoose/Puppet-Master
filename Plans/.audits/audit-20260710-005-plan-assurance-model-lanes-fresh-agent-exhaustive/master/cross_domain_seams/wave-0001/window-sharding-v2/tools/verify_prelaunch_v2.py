#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import importlib.metadata
import json
import sys
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
V1 = ROOT / "master/cross_domain_seams/wave-0001"
NS = V1 / "window-sharding-v2"
V10_SHA = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
V1_TERMINAL_SHA = "75b070ecdb20667ac46fc948ee575e6f33d1319f8bd15bbd679b6d51d29b8a98"
V1_EDGE_SHA = "6ebfdbd97df06dc4060421f8845d32de4fc3edc81d57a1765144986193a2925b"
V1_SOURCE_SHA = "f28db2680cde7985d4ca09405e4bc5923e3f587677d67d0140bccd0a42e9d0b0"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def verify() -> dict:
    errors = []
    for path, expected in {
        V1 / "validation/terminal-sol-preparation-report.json": V1_TERMINAL_SHA,
        V1 / "normalized_edge_ledger.jsonl": V1_EDGE_SHA,
        V1 / "source_inventory.json": V1_SOURCE_SHA,
        ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json": V10_SHA,
    }.items():
        if not path.is_file() or sha(path) != expected: errors.append(f"immutable_pin:{path.name}")
    required = ["authority.json", "architecture.json", "lineage.json", "source_capsule.json", "manifest.jsonl", "packet_registry.jsonl", "leaf_prompt.json", "receipt_contract.json", "native_capture_contract.json", "schema/result.schema.json", "launch_seal.json", "validation/VALIDATOR_AUTHORITY_V2.json", "validation/local-prelaunch-candidate.json"]
    for rel in required:
        if not (NS/rel).is_file(): errors.append(f"missing:{rel}")
    if errors: return {"status":"fail","errors":errors}
    authority=json.loads((NS/"authority.json").read_text()); arch=json.loads((NS/"architecture.json").read_text()); lineage=json.loads((NS/"lineage.json").read_text()); capsule=json.loads((NS/"source_capsule.json").read_text()); seal=json.loads((NS/"launch_seal.json").read_text()); local=json.loads((NS/"validation/local-prelaunch-candidate.json").read_text())
    manifest=jsonl(NS/"manifest.jsonl"); registry=jsonl(NS/"packet_registry.jsonl"); v1_edges=jsonl(V1/"normalized_edge_ledger.jsonl")
    v1_features={}
    for p in sorted((V1/"packets").glob("CDSPKT-*.json")):
        for f in json.loads(p.read_text())["feature_records"]:
            compact={k:f[k] for k in ["provisional_feature_ref","source_row_sha256","owner_assignment_id","owner_domain","title","summary","gap_summary","spec_state","risk_level","feature_kinds","local_feature_refs","source_documents","source_unit_refs","owner_membership"]}
            r=f["universal_research"]
            compact["universal_research"]={"evidence_state":r["evidence_state"],"source_assignment_id":r.get("source_assignment_id"),"result_path":r.get("result_path"),"result_sha256":r.get("result_sha256"),"source_row_sha256":r.get("source_row_sha256"),"research_state":r.get("research_state"),"insufficient_evidence_reason":r.get("insufficient_evidence_reason"),"sources":r.get("sources",[]),"supported_claims":r.get("supported_claims",[])}
            ref=f["provisional_feature_ref"]
            if ref in v1_features and v1_features[ref]!=compact: errors.append(f"v1_feature_repeat_drift:{ref}")
            v1_features[ref]=compact
    expected_status="BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V2"
    for key,value in {"status":expected_status,"activation_granted":False,"assignment_count":64,"cohort_count":4,"cohort_size":16,"edge_count":9365,"feature_count":2495,"pair_count":11,"conflict_count":178,"quarantine_count":10,"concurrency_policy_v10_sha256":V10_SHA,"rolling_max":40,"preferred_min":32,"preferred_max":40,"atomic_cap":16,"cohort_transaction_cap":16,"empty_outputs":64,"activation_files":0,"results":0,"receipts":0,"native_capture_rows":0,"coverage_credit":0,"research_credit":0,"spec_credit":0,"merge_credit":0,"promotion_credit":0}.items():
        if authority.get(key)!=value: errors.append(f"authority:{key}")
    if authority.get("disposition_counts")!={"merge_candidate":45,"related_but_distinct":9138,"uncertain":177,"unsupported":5}: errors.append("authority:dispositions")
    if lineage.get("v1_artifacts_mutated") is not False or lineage.get("v1_launch_forbidden") is not True: errors.append("lineage")
    if capsule.get("v1_terminal_report_sha256")!=V1_TERMINAL_SHA or capsule.get("v1_edge_ledger_sha256")!=V1_EDGE_SHA or capsule.get("v1_source_inventory_sha256")!=V1_SOURCE_SHA: errors.append("source_capsule")
    if arch.get("window_count")!=64 or arch.get("cohort_count")!=4 or arch.get("cohort_size")!=16 or arch.get("target_packet_ceiling")!=750000 or arch.get("hard_packet_ceiling")!=900000: errors.append("architecture")
    if local.get("gate_passed") is not False or local.get("activation_granted") is not False: errors.append("local_gate")
    live_tool_paths={"preparation":NS/"tools/prepare_window_sharding_v2.py","prelaunch_verifier":NS/"tools/verify_prelaunch_v2.py","postrun_validator":NS/"tools/validate_postrun_v2.py","activation_generator":NS/"tools/generate_cohort_activation_v2.py","test_harness":NS/"tools/test_window_sharding_v2.py"}
    if authority.get("tool_hashes")!={k:sha(v) for k,v in live_tool_paths.items()}: errors.append("tool_hashes")
    bindings={"architecture_sha256":"architecture.json","lineage_sha256":"lineage.json","source_capsule_sha256":"source_capsule.json","manifest_sha256":"manifest.jsonl","packet_registry_sha256":"packet_registry.jsonl","result_schema_sha256":"schema/result.schema.json","leaf_prompt_sha256":"leaf_prompt.json","receipt_contract_sha256":"receipt_contract.json","native_capture_contract_sha256":"native_capture_contract.json"}
    for field,rel in bindings.items():
        if authority.get(field)!=sha(NS/rel): errors.append(f"authority_hash:{field}")
    if seal.get("authority_sha256")!=sha(NS/"authority.json") or seal.get("validator_authority_sha256")!=sha(NS/"validation/VALIDATOR_AUTHORITY_V2.json"): errors.append("seal_hash")
    if len(manifest)!=64 or len(registry)!=64: errors.append("global_cardinality")
    expected_assignments=[f"A005CDSV2-{i:04d}" for i in range(1,65)]
    if [x["assignment_id"] for x in manifest]!=expected_assignments: errors.append("assignment_order")
    if len({x["prospective_agent_path"] for x in manifest})!=64: errors.append("agent_path_uniqueness")
    v1_by_id={x["normalized_edge_id"]:x for x in v1_edges}; packet_ids=[]; packet_sizes=[]; feature_refs=set(); conflict=quarantine=0; disposition=Counter(); cohort_assignment_union=[]; research_hash_cache={}
    for cohort_num in range(1,5):
        cid=f"cohort-{cohort_num:04d}"; cpath=NS/f"cohorts/{cid}/manifest.jsonl"; tpath=NS/f"cohorts/{cid}/activation.template.json"
        if not cpath.is_file() or not tpath.is_file(): errors.append(f"cohort_missing:{cid}"); continue
        rows=jsonl(cpath); template=json.loads(tpath.read_text()); cohort_assignment_union += [x["assignment_id"] for x in rows]
        if len(rows)!=16 or any(x["cohort_id"]!=cid for x in rows): errors.append(f"cohort_cardinality:{cid}")
        if template.get("assignment_count")!=16 or template.get("assignment_ids")!=[x["assignment_id"] for x in rows] or template.get("activation_granted") is not False or template.get("semantic_transaction_cap")!=16: errors.append(f"cohort_template:{cid}")
        if Path(str(tpath).replace("activation.template.json","activation.v2.json")).exists(): errors.append(f"live_activation:{cid}")
        if authority.get("cohort_manifest_sha256",{}).get(cid)!=sha(cpath) or authority.get("cohort_activation_template_sha256",{}).get(cid)!=sha(tpath): errors.append(f"cohort_hash:{cid}")
    if cohort_assignment_union!=expected_assignments or len(set(cohort_assignment_union))!=64: errors.append("cohort_partition")
    for row in manifest:
        pp=Path(row["packet_path"]); ip=Path(row["dispatch_intent_path"])
        if not pp.is_file() or sha(pp)!=row["packet_sha256"]: errors.append(f"packet_hash:{row['assignment_id']}"); continue
        if not ip.is_file() or sha(ip)!=row["dispatch_intent_sha256"]: errors.append(f"intent_hash:{row['assignment_id']}"); continue
        packet=json.loads(pp.read_text()); intent=json.loads(ip.read_text()); packet_sizes.append(pp.stat().st_size)
        if pp.stat().st_size>750000 or pp.stat().st_size>900000: errors.append(f"packet_ceiling:{row['assignment_id']}")
        edges=packet.get("seams",[]); ids=[x["normalized_edge_id"] for x in edges]; packet_ids += ids
        if len(ids)!=row["edge_count"] or len(ids)!=len(set(ids)) or digest(ids)!=row["edge_membership_digest"]: errors.append(f"packet_membership:{row['assignment_id']}")
        if any(v1_by_id.get(x["normalized_edge_id"])!=x for x in edges): errors.append(f"v1_edge_equivalence:{row['assignment_id']}")
        refs=sorted({r for e in edges for r in e["endpoint_refs"]}); feature_refs.update(refs)
        if refs!=sorted(x["provisional_feature_ref"] for x in packet.get("feature_records",[])): errors.append(f"feature_closure:{row['assignment_id']}")
        for f in packet.get("feature_records",[]):
            if v1_features.get(f.get("provisional_feature_ref"))!=f: errors.append(f"v1_feature_equivalence:{f.get('provisional_feature_ref')}")
            if not f.get("owner_membership"): errors.append(f"membership_missing:{f.get('provisional_feature_ref')}")
            research=f.get("universal_research",{})
            if research.get("evidence_state") not in {"available_candidate_evidence","explicitly_missing"}: errors.append(f"research_state:{f.get('provisional_feature_ref')}")
            if research.get("evidence_state")=="available_candidate_evidence" and (not research.get("result_sha256") or not research.get("sources") or not research.get("supported_claims")): errors.append(f"research_evidence:{f.get('provisional_feature_ref')}")
            if research.get("evidence_state")=="available_candidate_evidence":
                rp=ROOT/research["result_path"]
                if rp not in research_hash_cache: research_hash_cache[rp]=sha(rp) if rp.is_file() else None
                if research_hash_cache[rp]!=research["result_sha256"]: errors.append(f"research_result_hash:{f.get('provisional_feature_ref')}")
        conflict += sum(int(x["candidate_related_conflict"]) for x in edges); quarantine += sum(int(x["quarantined"]) for x in edges); disposition.update(x["preserved_disposition"] for x in edges)
        if intent.get("activation_granted") is not False or intent.get("status")!=expected_status or intent.get("cohort_id")!=row["cohort_id"]: errors.append(f"intent_gate:{row['assignment_id']}")
        out=Path(row["output_directory"])
        if not out.is_dir() or any(out.iterdir()): errors.append(f"output_state:{row['assignment_id']}")
        if Path(intent["dispatch_receipt_ref"]).exists(): errors.append(f"receipt_exists:{row['assignment_id']}")
    expected_ids=[x["normalized_edge_id"] for x in v1_edges]
    if len(packet_ids)!=9365 or len(set(packet_ids))!=9365 or set(packet_ids)!=set(expected_ids): errors.append("exact_packet_union")
    if len(feature_refs)!=2495 or conflict!=178 or quarantine!=10: errors.append("semantic_count_preservation")
    if dict(sorted(disposition.items()))!={"merge_candidate":45,"related_but_distinct":9138,"uncertain":177,"unsupported":5}: errors.append("disposition_preservation")
    if authority.get("edge_digest")!=digest([x["normalized_edge_key"] for x in v1_edges]) or authority.get("edge_id_digest")!=digest(expected_ids) or authority.get("feature_digest")!=digest(sorted(feature_refs)): errors.append("global_digests")
    if authority.get("packet_root")!=digest([x["packet_sha256"] for x in registry]) or authority.get("intent_root")!=digest([x["dispatch_intent_sha256"] for x in manifest]): errors.append("roots")
    if packet_sizes and (min(packet_sizes)!=authority["packet_bytes_min"] or max(packet_sizes)!=authority["packet_bytes_max"] or sum(packet_sizes)!=authority["packet_bytes_total"]): errors.append("packet_size_summary")
    expected_output_dirs={Path(x["output_directory"]).resolve() for x in manifest}
    actual_output_dirs={p.resolve() for p in (ROOT/"cross_domain_seams_window_v2").glob("A005CDSV2-*/attempts/attempt-0001") if p.is_dir()}
    if expected_output_dirs!=actual_output_dirs: errors.append("output_directory_inventory")
    prefix="/root/a005_cross_domain_seam_v2_"
    scan=subprocess.run(["rg","-l","--fixed-strings",prefix,str(ROOT)],text=True,capture_output=True)
    outside=[]
    for line in scan.stdout.splitlines():
        p=Path(line).resolve()
        try:p.relative_to(NS.resolve())
        except ValueError:outside.append(str(p))
    if outside: errors.append("prospective_identity_reuse:"+",".join(sorted(outside)))
    live=[]
    for p in NS.rglob("*"):
        if p.is_file() and (p.name in {"activation.v2.json","result.json","dispatch_receipt.json","native_capture.json"}): live.append(str(p))
    if live: errors.append("forbidden_live_artifacts")
    bundle=ROOT/"master/dependencies/jsonschema-draft202012-v1/site-packages"; sys.path.insert(0,str(bundle))
    try:
        import jsonschema
        jsonschema.Draft202012Validator.check_schema(json.loads((NS/"schema/result.schema.json").read_text()))
        engine=f"jsonschema-{importlib.metadata.version('jsonschema')}"
    except Exception as exc:
        errors.append(f"schema_engine:{exc}"); engine="unavailable"
    return {"schema_version":"cross-domain-seam-window-v2-prelaunch-verification-v1","status":"pass" if not errors else "fail","errors":errors,"counts":{"assignments":64,"cohorts":4,"cohort_size":16,"edges":len(packet_ids),"unique_edges":len(set(packet_ids)),"features":len(feature_refs),"pairs":11,"conflicts":conflict,"quarantines":quarantine,"empty_outputs":64,"activation_files":0,"results":0,"receipts":0,"native_capture_rows":0},"packet_bytes":{"min":min(packet_sizes),"max":max(packet_sizes),"total":sum(packet_sizes),"target":750000,"hard":900000},"schema_engine":engine,"v10_sha256":V10_SHA,"credits":{"coverage":0,"research":0,"spec":0,"merge":0,"promotion":0}}


if __name__=="__main__":
    r=verify(); print(json.dumps(r,indent=2,sort_keys=True)); raise SystemExit(0 if r["status"]=="pass" else 1)
