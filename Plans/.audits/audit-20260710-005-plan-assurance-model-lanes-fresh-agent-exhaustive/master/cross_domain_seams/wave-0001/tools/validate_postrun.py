#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[4]
NS = ROOT / "master/cross_domain_seams/wave-0001"
BUNDLE = ROOT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
if BUNDLE.is_dir(): sys.path.insert(0, str(BUNDLE))
import jsonschema


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


SCHEMA = json.loads((NS / "schema/cross_domain_seam_result.schema.json").read_text())
VALIDATOR = jsonschema.Draft202012Validator(SCHEMA, format_checker=jsonschema.FormatChecker())


def validate_result_document(doc: dict, packet: dict) -> list[str]:
    errors = ["schema:" + "/".join(map(str, e.absolute_path)) + ":" + e.message for e in sorted(VALIDATOR.iter_errors(doc), key=lambda e: (list(e.absolute_path), e.message))]
    expected = [x["normalized_edge_id"] for x in packet["seams"]]
    coverage = doc.get("coverage", {})
    decisions = doc.get("decisions", [])
    coverage_ids = coverage.get("normalized_edge_ids", [])
    decision_ids = [x.get("normalized_edge_id") for x in decisions if isinstance(x, dict)]
    if coverage.get("edge_count") != len(expected): errors.append("coverage_count")
    if coverage_ids != expected: errors.append("coverage_membership_or_order")
    if decision_ids != expected: errors.append("decision_membership_or_order")
    if len(set(decision_ids)) != len(decision_ids): errors.append("duplicate_decision")
    binding = doc.get("input_binding", {})
    packet_path = NS / f"packets/{packet['packet_id']}.json"
    if binding.get("packet_id") != packet["packet_id"]: errors.append("packet_id")
    if binding.get("packet_sha256") != sha(packet_path): errors.append("packet_sha256")
    if binding.get("edge_membership_digest") != packet["edge_membership_digest"]: errors.append("edge_membership_digest")
    for decision in decisions:
        if not isinstance(decision, dict): continue
        research = decision.get("external_research", {})
        state = research.get("state")
        sources = research.get("sources", [])
        claims = research.get("claims", [])
        registered = {x.get("url") for x in sources if isinstance(x, dict)}
        if state == "sufficient_for_judgment":
            if research.get("live_web_research_performed") is not True: errors.append(f"research_not_live:{decision.get('normalized_edge_id')}")
            if not sources or not claims: errors.append(f"research_underfilled:{decision.get('normalized_edge_id')}")
            if decision.get("unresolved_reason") is not None: errors.append(f"resolved_has_unresolved_reason:{decision.get('normalized_edge_id')}")
        elif state == "insufficient_unresolved":
            if decision.get("decision") != "uncertain_requires_targeted_research": errors.append(f"insufficient_not_uncertain:{decision.get('normalized_edge_id')}")
            if not decision.get("unresolved_reason"): errors.append(f"insufficient_missing_reason:{decision.get('normalized_edge_id')}")
        for source in sources:
            url = source.get("url") if isinstance(source, dict) else None
            parsed = urlparse(url or "")
            if parsed.scheme != "https" or not parsed.netloc or any(c.isspace() for c in (url or "")): errors.append(f"invalid_source_url:{decision.get('normalized_edge_id')}")
        for claim in claims:
            for url in claim.get("source_urls", []) if isinstance(claim, dict) else []:
                if url not in registered: errors.append(f"unregistered_claim_source:{decision.get('normalized_edge_id')}")
        if decision.get("promotion_performed") is not False: errors.append(f"promotion_veto:{decision.get('normalized_edge_id')}")
        if decision.get("decision") == "conflict_requires_plan_revision" and not decision.get("proposed_plan_revision"): errors.append(f"missing_plan_revision:{decision.get('normalized_edge_id')}")
    return sorted(set(errors))


def validate_postrun() -> dict:
    manifest = jsonl(NS / "manifest.jsonl")
    activation_path = NS / "activation.v1.json"
    capture_path = NS / "runtime/native_capture.json"
    errors = []
    reports = []
    if not activation_path.is_file(): errors.append("missing_activation")
    if not capture_path.is_file(): errors.append("missing_native_capture")
    capture = json.loads(capture_path.read_text()) if capture_path.is_file() else {"rows": []}
    capture_rows = {x.get("assignment_id"): x for x in capture.get("rows", [])}
    seen_paths = set(); seen_threads = set(); seen_turns = set()
    for row in manifest:
        assignment = row["assignment_id"]
        packet = json.loads(Path(row["packet_path"]).read_text())
        result_path = Path(row["output_directory"]) / "result.json"
        receipt_path = NS / f"dispatch/{assignment}/attempt-0001/dispatch_receipt.json"
        row_errors = []
        output_files = list(Path(row["output_directory"]).iterdir())
        if [p.name for p in output_files] != ["result.json"]: row_errors.append("output_confinement")
        if not result_path.is_file(): row_errors.append("missing_result")
        if not receipt_path.is_file(): row_errors.append("missing_receipt")
        if result_path.is_file():
            try: row_errors.extend(validate_result_document(json.loads(result_path.read_text()), packet))
            except Exception as exc: row_errors.append(f"result_parse:{exc}")
        if receipt_path.is_file():
            receipt = json.loads(receipt_path.read_text())
            if receipt.get("schema_version") != "cross-domain-seam-dispatch-receipt-v1": row_errors.append("receipt_schema_version")
            if receipt.get("assignment_id") != assignment: row_errors.append("receipt_assignment")
            if receipt.get("packet_sha256") != row["packet_sha256"]: row_errors.append("receipt_packet_hash")
            if receipt.get("dispatch_intent_sha256") != row["dispatch_intent_sha256"]: row_errors.append("receipt_intent_hash")
            if result_path.is_file() and receipt.get("result_sha256") != sha(result_path): row_errors.append("receipt_result_hash")
            if receipt.get("model") != "gpt-5.6-sol" or receipt.get("reasoning_effort") != "xhigh": row_errors.append("receipt_model_effort")
            for field, seen in (("agent_path", seen_paths), ("native_child_thread_id", seen_threads), ("native_turn_id", seen_turns)):
                value = receipt.get(field)
                if not value or value in seen: row_errors.append(f"receipt_identity:{field}")
                seen.add(value)
            cap = capture_rows.get(assignment)
            if not cap: row_errors.append("capture_missing_assignment")
            elif any(cap.get(k) != receipt.get(k) for k in ("agent_path", "native_child_thread_id", "native_turn_id")): row_errors.append("capture_receipt_identity")
        reports.append({"assignment_id": assignment, "eligible": not row_errors, "errors": sorted(set(row_errors))})
    if len(capture_rows) != 8: errors.append("capture_cardinality")
    eligible = [x["assignment_id"] for x in reports if x["eligible"]]
    # Candidate adjudication stays zero-credit until a later independent semantic postrun.
    return {"schema_version": "cross-domain-seam-primary-postrun-v1", "status": "pass_candidate_only" if len(eligible) == 8 and not errors else "fail", "errors": errors, "assignments": reports, "eligible_assignment_ids": eligible, "counts": {"eligible": len(eligible), "rejected": 8-len(eligible)}, "credits": {"coverage": 0, "research": 0, "spec": 0, "merge": 0, "promotion": 0}}


if __name__ == "__main__":
    report = validate_postrun()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_candidate_only" else 1)
