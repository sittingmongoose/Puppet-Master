#!/usr/bin/env python3
"""Fail-closed local verifier for scenario/adversarial wave preparation."""

from __future__ import annotations

import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha
from prepare_scenario_adversarial_wave import (
    ASSIGNMENT_COUNT, ATTEMPT_ID, COHORT_COUNT, COHORT_SIZE, EFFORT, FEATURE_COUNT, FEATURE_FIELD_ORDER,
    MAX_PACKET_BYTES, MODEL, NAMESPACE, OUTPUT_ROOT, OWNER_LEDGER_REF, OWNER_LEDGER_SHA256, POLICY_REF,
    POLICY_SHA256, PRIOR_POLICY_REF, PRIOR_POLICY_SHA256, RESEARCH_ACTIVATION_REF, RESEARCH_ACTIVATION_SHA256,
    RESEARCH_NATIVE_CAPTURE_REF, RESEARCH_NATIVE_CAPTURE_SHA256, RESEARCH_POSTRUN_REF, RESEARCH_POSTRUN_SHA256,
    TARGET_PACKET_MAX, TARGET_PACKET_MIN, WAVE_ID, allocate_domain_splits, bound_research_records, canonical_json,
    decode_packet_features, digest_strings, leaf_prompt, ledger_rows_with_hashes, partition_by_encoded_bytes,
    project_feature, result_schema,
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
        contract = load_obj(NAMESPACE / "receipt_contract.json")
        schema = load_obj(NAMESPACE / "schemas/scenario_adversarial_result.schema.json")
        ledger = ledger_rows_with_hashes(ROOT / OWNER_LEDGER_REF)
        research, _ = bound_research_records()
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)

    exact_inputs = {
        OWNER_LEDGER_REF: OWNER_LEDGER_SHA256, RESEARCH_ACTIVATION_REF: RESEARCH_ACTIVATION_SHA256,
        RESEARCH_NATIVE_CAPTURE_REF: RESEARCH_NATIVE_CAPTURE_SHA256, RESEARCH_POSTRUN_REF: RESEARCH_POSTRUN_SHA256,
        POLICY_REF: POLICY_SHA256, PRIOR_POLICY_REF: PRIOR_POLICY_SHA256,
    }
    for ref, expected in exact_inputs.items():
        path = ROOT / ref
        if not path.is_file() or sha(path.read_bytes()) != expected:
            errors.append(f"bound input mismatch:{ref}")
    postrun = load_obj(ROOT / RESEARCH_POSTRUN_REF)
    if postrun.get("status") != "pass" or postrun.get("counts") != {"assignments": 24, "eligible": 24, "rejected": 0}:
        errors.append("research postrun is not exact 24/24 eligible")
    if authority.get("status") != "PREPARED_UNBOUND_ZERO_COVERAGE_ZERO_CERTIFICATION_CREDIT" or authority.get("activation_authorized") is not False:
        errors.append("authority state mismatch")
    if authority.get("coverage_credit_before_validation") != 0 or authority.get("certification_credit_before_validation") != 0:
        errors.append("authority premature credit")
    if seal.get("status") != "CANDIDATE_AWAITING_INDEPENDENT_GATING_AND_LUNA_RETRY_CHECKPOINT" or seal.get("activation_authorized") is not False or seal.get("coverage_credit") != 0 or seal.get("certification_credit") != 0:
        errors.append("launch seal state mismatch")
    if seal.get("batch_authority_sha256") != sha((NAMESPACE / "batch_authority.json").read_bytes()):
        errors.append("launch seal authority hash mismatch")
    payload_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file() and path.name not in {"batch_authority.json", "launch_seal.json"} and "validation" not in path.parts)
    if authority.get("payload_root_sha256") != root_hash(payload_files, NAMESPACE):
        errors.append("payload root mismatch")
    seal_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file() and path.name != "launch_seal.json" and "validation" not in path.parts)
    if seal.get("sealed_payload_root_sha256") != root_hash(seal_files, NAMESPACE):
        errors.append("sealed payload root mismatch")

    if len(ledger) != FEATURE_COUNT or len(research) != FEATURE_COUNT:
        errors.append("source count mismatch")
    projected = [project_feature(row, row_sha, research[row["provisional_feature_ref"]]) for row, row_sha in ledger]
    by_domain: dict[str, list[dict]] = defaultdict(list)
    for feature in projected:
        by_domain[feature["owner_domain"]].append(feature)
    for features in by_domain.values():
        features.sort(key=lambda item: item["provisional_feature_ref"])
    splits = allocate_domain_splits(by_domain)
    expected_parts: list[tuple[str, int, int, list[dict]]] = []
    for domain in sorted(by_domain):
        parts = partition_by_encoded_bytes(by_domain[domain], splits[domain], domain)
        for index, features in enumerate(parts, 1):
            expected_parts.append((domain, index, len(parts), features))
    expected_ids = [f"A005SA-{index:04d}" for index in range(1, ASSIGNMENT_COUNT + 1)]
    if len(manifest) != ASSIGNMENT_COUNT or [row.get("assignment_id") for row in manifest] != expected_ids or authority.get("assignment_ids") != expected_ids:
        errors.append("manifest assignment identity/order mismatch")
    if len(registry) != ASSIGNMENT_COUNT or len({row.get("assignment_id") for row in registry}) != ASSIGNMENT_COUNT:
        errors.append("packet registry count/uniqueness mismatch")
    registry_by_id = {row["assignment_id"]: row for row in registry}
    covered: list[str] = []
    packet_sizes: list[int] = []
    domain_counts: Counter[str] = Counter()
    cohort_counts: Counter[str] = Counter()
    cohort_features: Counter[str] = Counter()
    intent_count = receipt_count = output_files = 0
    expanded_bytes = 0
    for sequence, (assignment, expected) in enumerate(zip(manifest, expected_parts), 1):
        domain, slice_index, slice_count, features = expected
        aid, packet_id = f"A005SA-{sequence:04d}", f"SAPKT-{sequence:04d}"
        cohort_id = f"cohort-{((sequence - 1) // COHORT_SIZE) + 1:04d}"
        refs = [feature["provisional_feature_ref"] for feature in features]
        if assignment.get("assignment_id") != aid or assignment.get("packet_id") != packet_id or assignment.get("cohort_id") != cohort_id or assignment.get("cohort_sequence") != ((sequence - 1) % COHORT_SIZE) + 1:
            errors.append(f"assignment/cohort identity mismatch:{aid}")
        if assignment.get("owner_domain") != domain or assignment.get("domain_slice_index") != slice_index or assignment.get("domain_slice_count") != slice_count:
            errors.append(f"assignment partition mismatch:{aid}")
        if assignment.get("feature_refs") != refs or assignment.get("feature_refs_digest") != digest_strings(refs):
            errors.append(f"assignment coverage mismatch:{aid}")
        if assignment.get("prospective_agent_path") != f"/root/a005_scenario_adversarial_{sequence:04d}_attempt_0001_terminal" or assignment.get("model") != MODEL or assignment.get("reasoning_effort") != EFFORT or assignment.get("fork_turns") != "none":
            errors.append(f"assignment identity/model mismatch:{aid}")
        packet_path = NAMESPACE / assignment["packet_ref"]
        if not packet_path.is_file():
            errors.append(f"packet missing:{aid}")
            continue
        raw = packet_path.read_bytes()
        packet_sizes.append(len(raw))
        packet = json.loads(raw)
        try:
            decoded = decode_packet_features(packet)
        except Exception as exc:
            errors.append(f"packet decode:{aid}:{type(exc).__name__}")
            continue
        if decoded != features or any(set(row) != set(FEATURE_FIELD_ORDER) for row in decoded):
            errors.append(f"packet lossless projection mismatch:{aid}")
        if packet.get("owner_domain") != domain or any(row["owner_domain"] != domain for row in decoded):
            errors.append(f"packet crosses owner domains:{aid}")
        if len(raw) != assignment.get("packet_bytes") or len(raw) > MAX_PACKET_BYTES or sha(raw) != assignment.get("packet_sha256"):
            errors.append(f"packet byte/hash/ceiling mismatch:{aid}")
        if registry_by_id.get(aid, {}).get("packet_sha256") != assignment.get("packet_sha256") or registry_by_id.get(aid, {}).get("cohort_id") != cohort_id:
            errors.append(f"registry binding mismatch:{aid}")
        intent_path = NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_intent.json"
        if not intent_path.is_file():
            errors.append(f"intent missing:{aid}")
        else:
            intent_count += 1
            intent = load_obj(intent_path)
            if intent.get("cohort_id") != cohort_id or intent.get("packet_sha256") != assignment["packet_sha256"] or intent.get("prospective_agent_path") != assignment["prospective_agent_path"] or intent.get("model") != MODEL or intent.get("reasoning_effort") != EFFORT or intent.get("fork_turns") != "none" or intent.get("descendants_forbidden") is not True or intent.get("followup_messages_forbidden") is not True or intent.get("retries_forbidden") is not True:
                errors.append(f"intent binding/isolation mismatch:{aid}")
            output = Path(intent["output_directory"])
            if not output.is_dir() or any(output.iterdir()):
                errors.append(f"output not empty directory:{aid}")
            output_files += len([path for path in output.iterdir() if path.is_file()]) if output.is_dir() else 0
            if Path(intent["receipt_ref"]).exists():
                receipt_count += 1
                errors.append(f"receipt exists prelaunch:{aid}")
        covered.extend(refs)
        expanded_bytes += sum(len(canonical_json(feature)) for feature in features)
        domain_counts[domain] += 1
        cohort_counts[cohort_id] += 1
        cohort_features[cohort_id] += len(refs)

    source_refs = [row[0]["provisional_feature_ref"] for row in ledger]
    if len(covered) != FEATURE_COUNT or len(set(covered)) != FEATURE_COUNT or set(covered) != set(source_refs):
        errors.append("3888 feature coverage partition mismatch")
    coverage_digest = digest_strings(covered)
    if authority.get("coverage_digest") != coverage_digest:
        errors.append("coverage digest mismatch")
    if dict(sorted(domain_counts.items())) != splits or architecture.get("domain_split_counts") != splits:
        errors.append("domain split mismatch")
    if dict(cohort_counts) != {f"cohort-{index:04d}": COHORT_SIZE for index in range(1, COHORT_COUNT + 1)}:
        errors.append("cohort assignment counts mismatch")
    cohort_bindings = authority.get("cohort_bindings")
    if not isinstance(cohort_bindings, list) or len(cohort_bindings) != COHORT_COUNT or seal.get("cohort_bindings") != cohort_bindings:
        errors.append("top-level cohort bindings mismatch")
    for cohort_number in range(1, COHORT_COUNT + 1):
        cohort_id = f"cohort-{cohort_number:04d}"
        cohort_dir = NAMESPACE / "cohorts" / cohort_id
        try:
            cohort_manifest = load_jsonl(cohort_dir / "cohort_manifest.jsonl")
            cohort_authority = load_obj(cohort_dir / "cohort_authority.json")
            cohort_seal = load_obj(cohort_dir / "cohort_launch_seal.json")
        except Exception as exc:
            errors.append(f"cohort controls missing:{cohort_id}:{type(exc).__name__}")
            continue
        cohort_ids = expected_ids[(cohort_number - 1) * COHORT_SIZE:cohort_number * COHORT_SIZE]
        if [row.get("assignment_id") for row in cohort_manifest] != cohort_ids or cohort_authority.get("assignment_ids") != cohort_ids or cohort_seal.get("assignment_ids") != cohort_ids:
            errors.append(f"cohort manifest/order mismatch:{cohort_id}")
        if cohort_authority.get("assignment_count") != COHORT_SIZE or cohort_authority.get("feature_count") != cohort_features[cohort_id] or cohort_authority.get("atomic_all_32_spawn_required") is not False or cohort_authority.get("separate_activation_required") is not True or cohort_authority.get("separate_terminal_capture_required") is not True or cohort_authority.get("separate_postrun_validation_required") is not True:
            errors.append(f"cohort authority capability mismatch:{cohort_id}")
        if cohort_authority.get("cohort_manifest_sha256") != sha((cohort_dir / "cohort_manifest.jsonl").read_bytes()) or cohort_seal.get("cohort_authority_sha256") != sha((cohort_dir / "cohort_authority.json").read_bytes()) or cohort_seal.get("activation_authorized") is not False:
            errors.append(f"cohort hash/state mismatch:{cohort_id}")

    if schema != result_schema() or prompt != leaf_prompt():
        errors.append("published schema or prompt differs from executable contract")
    required_receipt_keys = {"audit_id", "schema_version", "wave_id", "cohort_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"}
    if set(contract.get("required_keys", [])) != required_receipt_keys:
        errors.append("receipt contract keys mismatch")
    if architecture.get("concurrency_policy_sha256") != POLICY_SHA256 or architecture.get("prior_concurrency_policy_sha256") != PRIOR_POLICY_SHA256 or architecture.get("cohort_count") != COHORT_COUNT or architecture.get("cohort_size") != COHORT_SIZE:
        errors.append("V4/cohort architecture mismatch")
    if authority.get("concurrency_policy_sha256") != POLICY_SHA256 or authority.get("prior_concurrency_policy_sha256") != PRIOR_POLICY_SHA256 or authority.get("atomic_all_32_spawn_required") is not False:
        errors.append("V4 authority binding mismatch")
    if architecture.get("expanded_retained_semantic_bytes") != expanded_bytes or architecture.get("compact_packet_bytes") != sum(packet_sizes):
        errors.append("retained/compact byte accounting mismatch")
    script_bindings = {
        "preparation_script_sha256": ROOT / "prepare_scenario_adversarial_wave.py",
        "verifier_script_sha256": ROOT / "verify_scenario_adversarial_wave.py",
        "validator_script_sha256": ROOT / "validate_scenario_adversarial_batch.py",
        "test_script_sha256": ROOT / "test_scenario_adversarial_validator.py",
    }
    for key, path in script_bindings.items():
        if not path.is_file() or authority.get(key) != sha(path.read_bytes()):
            errors.append(f"script binding mismatch:{key}")
    test = subprocess.run(["python3", "-B", "test_scenario_adversarial_validator.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    try:
        test_report = json.loads(test.stdout)
    except Exception:
        test_report = {"status": "fail", "strict_tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("strict_test_count", 0) < 18 or any(value is not True for value in test_report.get("strict_tests", {}).values()):
        errors.append("strict negative-test harness failed")
    forbidden = list(NAMESPACE.glob("**/activation*.json")) + list(NAMESPACE.glob("**/dispatch_receipt.json")) + list(NAMESPACE.glob("**/native_capture*.json"))
    if forbidden:
        errors.append("forbidden activation/receipt/native-capture artifact exists")
    report = {
        "audit_id": AUDIT_ID, "checker": "scenario_adversarial_prelaunch_v1", "wave_id": WAVE_ID,
        "status": "pass" if not errors else "fail", "errors": sorted(set(errors)),
        "counts": {"assignments": len(manifest), "cohorts": len(cohort_counts), "cohort_size": COHORT_SIZE,
                   "packets": len(packet_sizes), "intents": intent_count, "features_covered": len(covered),
                   "unique_features_covered": len(set(covered)), "owner_domains": len(domain_counts),
                   "receipts": receipt_count, "output_files": output_files},
        "packet_bytes": {"min": min(packet_sizes) if packet_sizes else 0, "max": max(packet_sizes) if packet_sizes else 0, "total": sum(packet_sizes)},
        "packet_target_bytes": {"min": TARGET_PACKET_MIN, "max": TARGET_PACKET_MAX, "hard_ceiling": MAX_PACKET_BYTES},
        "domain_split_counts": dict(sorted(domain_counts.items())), "cohort_assignment_counts": dict(sorted(cohort_counts.items())),
        "cohort_feature_counts": dict(sorted(cohort_features.items())), "coverage_digest": coverage_digest,
        "expanded_retained_semantic_bytes": expanded_bytes, "compact_packet_bytes": sum(packet_sizes),
        "dropped_category_bytes": architecture.get("dropped_category_bytes"), "dropped_categories": architecture.get("dropped_categories"),
        "owner_provisional_ledger_sha256": sha((ROOT / OWNER_LEDGER_REF).read_bytes()),
        "research_activation_sha256": sha((ROOT / RESEARCH_ACTIVATION_REF).read_bytes()),
        "research_native_capture_sha256": sha((ROOT / RESEARCH_NATIVE_CAPTURE_REF).read_bytes()),
        "research_primary_postrun_sha256": sha((ROOT / RESEARCH_POSTRUN_REF).read_bytes()),
        "concurrency_policy_v4_sha256": sha((ROOT / POLICY_REF).read_bytes()),
        "prior_concurrency_policy_v3_sha256": sha((ROOT / PRIOR_POLICY_REF).read_bytes()),
        "batch_authority_sha256": sha((NAMESPACE / "batch_authority.json").read_bytes()),
        "launch_seal_sha256": sha((NAMESPACE / "launch_seal.json").read_bytes()),
        "batch_manifest_sha256": sha((NAMESPACE / "batch_manifest.jsonl").read_bytes()),
        "packet_registry_sha256": sha((NAMESPACE / "packet_registry.jsonl").read_bytes()),
        "leaf_prompt_sha256": sha((NAMESPACE / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((NAMESPACE / "receipt_contract.json").read_bytes()),
        "result_schema_sha256": sha((NAMESPACE / "schemas/scenario_adversarial_result.schema.json").read_bytes()),
        "preparation_script_sha256": sha((ROOT / "prepare_scenario_adversarial_wave.py").read_bytes()),
        "verifier_script_sha256": sha((ROOT / "verify_scenario_adversarial_wave.py").read_bytes()),
        "validator_script_sha256": sha((ROOT / "validate_scenario_adversarial_batch.py").read_bytes()),
        "test_script_sha256": sha((ROOT / "test_scenario_adversarial_validator.py").read_bytes()),
        "strict_tests": test_report.get("strict_tests", {}), "coverage_credit": 0, "certification_credit": 0,
        "remaining_prelaunch_conditions": [
            "all_eight_luna_cross_cutting_research_retry_leaves_must_be_terminal_and_independently_checkpointed_before_first_cohort_activation",
            "independent_master_and_luna_candidate_validation_must_hash_pin_the_full_wave_and_each_immutable_cohort",
            "each_cohort_requires_its_own_explicit_activation_before_its_eight_direct_fresh_sol_xhigh_leaves_are_dispatched",
            "each_cohort_requires_separate_receipt_set_terminal_capture_and_independent_postrun_validation",
            "coverage_and_certification_credit_remain_zero_until all_four_cohorts_are_independently_eligible_and_full_3888_closure_is_revalidated",
        ],
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
