#!/usr/bin/env python3
"""Fail-closed local verifier for universal external-research preparation."""

from __future__ import annotations

import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha
from prepare_external_research_universal_wave import (
    ASSIGNMENT_COUNT, ATTEMPT_ID, FIELDS, MAX_PACKET_BYTES, NAMESPACE, OUTPUT_ROOT,
    POLICY_REF, POLICY_SHA256, TARGET_PACKET_MAX, TARGET_PACKET_MIN, WAVE_ID,
    allocate_domain_splits, canonical_json, digest_strings, leaf_prompt,
    ledger_rows_with_hashes, partition_by_bytes, project, result_schema,
)


def load_obj(path: Path):
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not object:{path}")
    return value


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def main() -> None:
    errors: list[str] = []
    try:
        authority = load_obj(NAMESPACE / "batch_authority.json")
        seal = load_obj(NAMESPACE / "launch_seal.json")
        lineage = load_obj(NAMESPACE / "lineage.json")
        architecture = load_obj(NAMESPACE / "architecture.json")
        manifest = load_jsonl(NAMESPACE / "batch_manifest.jsonl")
        registry = load_jsonl(NAMESPACE / "packet_registry.jsonl")
        prompt = load_obj(NAMESPACE / "leaf_prompt.json")
        receipt_contract = load_obj(NAMESPACE / "receipt_contract.json")
        schema = load_obj(NAMESPACE / "schemas/external_research_universal_result.schema.json")
        active_path = ROOT / lineage["owner_active_ref"]
        active = load_obj(active_path)
        commit_path = ROOT / lineage["owner_commit_ref"]
        coverage_path = ROOT / lineage["owner_coverage_ref"]
        ledger_path = ROOT / lineage["owner_provisional_ledger_ref"]
        ledger = ledger_rows_with_hashes(ledger_path)
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)

    if authority.get("audit_id") != AUDIT_ID or authority.get("wave_id") != WAVE_ID or authority.get("status") != "PREPARED_UNBOUND_ZERO_CREDIT_ZERO_RESEARCH_CREDIT":
        errors.append("authority identity/status mismatch")
    if authority.get("coverage_credit_before_validation") != 0 or authority.get("research_credit_before_validation") != 0 or authority.get("activation_authorized") is not False:
        errors.append("authority credit/activation mismatch")
    if seal.get("status") != "CANDIDATE_AWAITING_INDEPENDENT_GATING" or seal.get("coverage_credit") != 0 or seal.get("research_credit") != 0 or seal.get("activation_authorized") is not False:
        errors.append("launch seal state mismatch")
    if seal.get("batch_authority_sha256") != sha((NAMESPACE / "batch_authority.json").read_bytes()):
        errors.append("launch seal authority hash mismatch")
    payload_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file() and path.name not in {"batch_authority.json", "launch_seal.json"} and "validation" not in path.parts)
    if authority.get("payload_root_sha256") != root_hash(payload_files, NAMESPACE):
        errors.append("payload root mismatch")
    sealed_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file() and path.name != "launch_seal.json" and "validation" not in path.parts)
    if seal.get("sealed_payload_root_sha256") != root_hash(sealed_files, NAMESPACE):
        errors.append("sealed payload root mismatch")

    if active.get("status") != "ACTIVE_OWNER_SHARDS_COMPLETE" or sha(active_path.read_bytes()) != lineage.get("owner_active_sha256"):
        errors.append("owner ACTIVE lineage mismatch")
    if sha(commit_path.read_bytes()) != lineage.get("owner_commit_sha256") or load_obj(commit_path).get("status") != "pass":
        errors.append("owner commit lineage mismatch")
    if sha(coverage_path.read_bytes()) != lineage.get("owner_coverage_sha256") or load_obj(coverage_path).get("complete") is not True:
        errors.append("owner coverage lineage mismatch")
    if sha(ledger_path.read_bytes()) != lineage.get("owner_provisional_ledger_sha256") or len(ledger) != 3888:
        errors.append("owner ledger lineage/count mismatch")
    policy_path = ROOT / POLICY_REF
    if not policy_path.is_file() or sha(policy_path.read_bytes()) != POLICY_SHA256 or architecture.get("concurrency_policy_sha256") != POLICY_SHA256 or authority.get("concurrency_policy_sha256") != POLICY_SHA256:
        errors.append("CONCURRENCY_POLICY_V3 binding mismatch")
    if architecture.get("sol_leaf_count") != 24 or architecture.get("separately_authorized_luna_research_leaf_count") != 8 or architecture.get("exact_coexistence_cap") != 32 or architecture.get("coexistence_requires_independent_gating") is not True:
        errors.append("24+8 coexistence contract mismatch")

    projected = [project(row, row_hash) for row, row_hash in ledger]
    source_by_ref = {row["provisional_feature_ref"]: row for row in projected}
    if len(source_by_ref) != 3888:
        errors.append("source provisional refs not unique")
    by_domain: dict[str, list[dict]] = defaultdict(list)
    for row in projected:
        by_domain[row["owner_domain"]].append(row)
    for rows in by_domain.values():
        rows.sort(key=lambda row: row["provisional_feature_ref"])
    domain_bytes = {domain: sum(len(canonical_json(row)) for row in rows) for domain, rows in by_domain.items()}
    expected_splits = allocate_domain_splits(domain_bytes)
    if architecture.get("domain_split_counts") != expected_splits or sum(expected_splits.values()) != 24:
        errors.append("domain split allocation mismatch")
    expected_parts: list[tuple[str, int, int, list[dict]]] = []
    for domain in sorted(by_domain):
        parts = partition_by_bytes(by_domain[domain], expected_splits[domain])
        for index, features in enumerate(parts, 1):
            expected_parts.append((domain, index, len(parts), features))

    ids = [f"A005ERU-{index:04d}" for index in range(1, 25)]
    if len(manifest) != ASSIGNMENT_COUNT or [row.get("assignment_id") for row in manifest] != ids or authority.get("assignment_ids") != ids:
        errors.append("manifest assignment identity/order mismatch")
    if len(registry) != 24 or len({row.get("assignment_id") for row in registry}) != 24:
        errors.append("packet registry count/uniqueness mismatch")
    registry_by_id = {row["assignment_id"]: row for row in registry}
    covered_refs: list[str] = []
    packet_sizes: list[int] = []
    domain_packet_counts: Counter[str] = Counter()
    intent_count = 0
    receipt_count = 0
    output_file_count = 0
    for sequence, (assignment, expected_part) in enumerate(zip(manifest, expected_parts), 1):
        domain, slice_index, slice_count, expected_features = expected_part
        aid = f"A005ERU-{sequence:04d}"
        packet_id = f"ERUPKT-{sequence:04d}"
        expected_refs = [row["provisional_feature_ref"] for row in expected_features]
        expected_hashes = {row["provisional_feature_ref"]: row["source_row_sha256"] for row in expected_features}
        if assignment.get("assignment_id") != aid or assignment.get("packet_id") != packet_id or assignment.get("owner_domain") != domain or assignment.get("domain_slice_index") != slice_index or assignment.get("domain_slice_count") != slice_count:
            errors.append(f"assignment partition identity mismatch:{aid}")
        if assignment.get("feature_refs") != expected_refs or assignment.get("source_row_sha256_by_feature") != expected_hashes:
            errors.append(f"assignment feature/source mapping mismatch:{aid}")
        if assignment.get("feature_refs_digest") != digest_strings(expected_refs) or assignment.get("source_rows_digest") != digest_strings(list(expected_hashes.values())):
            errors.append(f"assignment digest mismatch:{aid}")
        if assignment.get("prospective_agent_path") != f"/root/a005_external_research_universal_{sequence:04d}_attempt_0001_terminal" or assignment.get("model") != "gpt-5.6-sol" or assignment.get("reasoning_effort") != "xhigh" or assignment.get("fork_turns") != "none":
            errors.append(f"assignment future identity/model mismatch:{aid}")
        packet_path = NAMESPACE / assignment["packet_ref"]
        if not packet_path.is_file():
            errors.append(f"packet missing:{aid}")
            continue
        raw = packet_path.read_bytes()
        packet_sizes.append(len(raw))
        try:
            packet = json.loads(raw)
        except Exception as exc:
            errors.append(f"packet parse:{aid}:{type(exc).__name__}")
            continue
        if len(raw) != assignment.get("packet_bytes") or len(raw) > MAX_PACKET_BYTES or sha(raw) != assignment.get("packet_sha256"):
            errors.append(f"packet byte/hash ceiling mismatch:{aid}")
        if packet.get("owner_domain") != domain or packet.get("features") != expected_features or packet.get("feature_refs") != expected_refs or packet.get("feature_count") != len(expected_refs):
            errors.append(f"packet projection/domain mismatch:{aid}")
        if set(packet.get("features", [{}])[0] if packet.get("features") else {}) != set(FIELDS) | {"source_row_sha256"}:
            errors.append(f"packet research projection keys mismatch:{aid}")
        if any(row.get("owner_domain") != domain for row in packet.get("features", [])):
            errors.append(f"packet crosses owner domains:{aid}")
        if registry_by_id.get(aid, {}).get("packet_sha256") != assignment.get("packet_sha256") or registry_by_id.get(aid, {}).get("packet_bytes") != len(raw):
            errors.append(f"packet registry binding mismatch:{aid}")
        intent_path = NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_intent.json"
        if not intent_path.is_file():
            errors.append(f"intent missing:{aid}")
        else:
            intent_count += 1
            intent = load_obj(intent_path)
            if intent.get("packet_sha256") != assignment.get("packet_sha256") or intent.get("prospective_agent_path") != assignment.get("prospective_agent_path") or intent.get("model") != "gpt-5.6-sol" or intent.get("reasoning_effort") != "xhigh" or intent.get("fork_turns") != "none" or intent.get("descendants_forbidden") is not True or intent.get("followup_messages_forbidden") is not True:
                errors.append(f"intent binding/isolation mismatch:{aid}")
            output = Path(intent["output_directory"])
            if not output.is_dir():
                errors.append(f"output directory missing:{aid}")
            else:
                files = [path for path in output.iterdir() if path.is_file()]
                output_file_count += len(files)
                if any(output.iterdir()):
                    errors.append(f"output directory not empty:{aid}")
            if Path(intent["receipt_ref"]).exists():
                receipt_count += 1
                errors.append(f"receipt exists prelaunch:{aid}")
        covered_refs.extend(expected_refs)
        domain_packet_counts[domain] += 1

    source_refs = set(source_by_ref)
    if len(covered_refs) != 3888 or len(set(covered_refs)) != 3888 or set(covered_refs) != source_refs:
        errors.append("3888 feature coverage partition mismatch")
    coverage_digest = digest_strings(covered_refs)
    if authority.get("coverage_digest") != coverage_digest:
        errors.append("coverage digest mismatch")
    if dict(sorted(domain_packet_counts.items())) != expected_splits:
        errors.append("per-domain packet count mismatch")
    if schema != result_schema():
        errors.append("published schema differs from executable schema")
    if prompt != leaf_prompt():
        errors.append("frozen leaf prompt differs from executable prompt")
    prompt_text = prompt.get("prompt", "")
    for phrase in ("Browse the live public web", "at least two authoritative sources per feature", "blocked_insufficient_evidence", "Do not merely summarize links", "propose concrete spec deltas without editing Plans", "Write exactly one result.json"):
        if phrase not in prompt_text:
            errors.append("leaf prompt missing universal research obligation")
            break
    required_receipt_keys = {"audit_id", "schema_version", "wave_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"}
    if set(receipt_contract.get("required_keys", [])) != required_receipt_keys:
        errors.append("receipt contract keys mismatch")
    script_bindings = {
        "preparation_script_sha256": ROOT / "prepare_external_research_universal_wave.py",
        "verifier_script_sha256": ROOT / "verify_external_research_universal_wave.py",
        "validator_script_sha256": ROOT / "validate_external_research_universal_batch.py",
        "test_script_sha256": ROOT / "test_external_research_universal_validator.py",
    }
    for key, path in script_bindings.items():
        if not path.is_file() or authority.get(key) != sha(path.read_bytes()):
            errors.append(f"script binding mismatch:{key}")
    test = subprocess.run(["python3", "-B", "test_external_research_universal_validator.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    try:
        test_report = json.loads(test.stdout)
    except Exception:
        test_report = {"status": "fail", "strict_tests": {}}
    if test.returncode != 0 or test_report.get("status") != "pass" or any(value is not True for value in test_report.get("strict_tests", {}).values()):
        errors.append("negative-test harness failed")
    forbidden = list(NAMESPACE.glob("**/activation*.json")) + list(NAMESPACE.glob("**/luna*.json")) + list(NAMESPACE.glob("**/dispatch_receipt.json"))
    if forbidden:
        errors.append("forbidden activation/Luna/receipt artifact exists")

    report = {
        "audit_id": AUDIT_ID, "checker": "external_research_universal_prelaunch_v1",
        "wave_id": WAVE_ID, "status": "pass" if not errors else "fail", "errors": sorted(set(errors)),
        "counts": {"assignments": len(manifest), "packets": len(packet_sizes), "intents": intent_count, "features_covered": len(covered_refs), "unique_features_covered": len(set(covered_refs)), "owner_domains": len(domain_packet_counts), "receipts": receipt_count, "output_files": output_file_count},
        "packet_bytes": {"min": min(packet_sizes) if packet_sizes else 0, "max": max(packet_sizes) if packet_sizes else 0, "total": sum(packet_sizes)},
        "packet_target_bytes": {"min": TARGET_PACKET_MIN, "max": TARGET_PACKET_MAX, "hard_ceiling": MAX_PACKET_BYTES},
        "domain_split_counts": dict(sorted(domain_packet_counts.items())),
        "coverage_digest": coverage_digest,
        "owner_active_sha256": sha(active_path.read_bytes()), "owner_commit_sha256": sha(commit_path.read_bytes()),
        "owner_coverage_sha256": sha(coverage_path.read_bytes()), "owner_provisional_ledger_sha256": sha(ledger_path.read_bytes()),
        "concurrency_policy_v3_sha256": sha(policy_path.read_bytes()),
        "batch_authority_sha256": sha((NAMESPACE / "batch_authority.json").read_bytes()),
        "launch_seal_sha256": sha((NAMESPACE / "launch_seal.json").read_bytes()),
        "batch_manifest_sha256": sha((NAMESPACE / "batch_manifest.jsonl").read_bytes()),
        "packet_registry_sha256": sha((NAMESPACE / "packet_registry.jsonl").read_bytes()),
        "leaf_prompt_sha256": sha((NAMESPACE / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((NAMESPACE / "receipt_contract.json").read_bytes()),
        "result_schema_sha256": sha((NAMESPACE / "schemas/external_research_universal_result.schema.json").read_bytes()),
        "strict_tests": test_report.get("strict_tests", {}),
        "coverage_credit": 0, "research_credit": 0,
        "remaining_prelaunch_conditions": [
            "independent_gate_must_validate_and_hash_pin_this_candidate",
            "explicit_activation_must_authorize_exactly_24_sol_leaves_coexisting_only_with_separately_gated_8_leaf_luna_lane_at_cap_32",
        ],
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
