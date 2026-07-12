#!/usr/bin/env python3
"""Generate cohort-0001 activation only after an exact cumulative research checkpoint."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[6]
WAVE = ROOT / "master/scenario_adversarial/wave-0001"
COHORT = WAVE / "cohorts/cohort-0001"
PREP = COHORT / "activation-preparation-v1"
OUTPUT_ROOT = ROOT / "scenario_adversarial_v1"
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "wave-0001"
COHORT_ID = "cohort-0001"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(1, 9)]
AGENT_PATHS = [f"/root/a005_scenario_adversarial_{index:04d}_attempt_0001_terminal" for index in range(1, 9)]
RESEARCH_IDS = [f"ER-{index:04d}" for index in range(1, 9)]
RESEARCH_ELIGIBLE_DIGEST = "6309d3442ac7aca5d6faeffa47cd982aafa257c11ebae029102837e331e1dbcc"
FEATURE_COUNT = 823
FEATURE_DIGEST = "aead114c4e46d8bea5bf27623902f0a052d1ba969b7e1c3aad5181537e6183b5"
FULL_LUNA_SHA = "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"
READINESS_GATE_SHA = "4bdd9677c47710b505d596ffbef150a333efc9695ebc8ffafba435b6c236c29b"
V5_SHA = "a87927157be59c448801bbd4cec157670609c4502fb18baa0afbe8d516fdb439"
COHORT_MANIFEST_SHA = "7cef85ea13b20c39ce9071fc75a70a786248e4d7eecd27b250560c5017721860"
COHORT_AUTHORITY_SHA = "f963c3499987446426861d446b09632e2faf7eabe0bbfe3262d25814e94a77a0"
COHORT_SEAL_SHA = "6f3dcfe7adc9dc301238f60f1bb347d6d6e102851b663f58dc98abb7b220a310"
PACKET_ROOT_SHA = "f94e4e0060179f8786b9de20139a74f9e3752987aa4f3ed549c90d923535163b"
INTENT_ROOT_SHA = "1daaecd28d57905f3ba7a71a02b4b984a88950a9664cc14e75e7b0448fa3c779"
RESULT_SCHEMA_SHA = "190a5e612bdbe7b2de4f3659fdbe7b9f2621ee2f194a25051f2bf39df4ac3db8"
RECEIPT_CONTRACT_SHA = "9d5059d83f31780ad14958d6526ed54e1fb6402210d6060856afb0b9799c65cf"
LEAF_PROMPT_SHA = "104e1f1126e76a3d6f0e01e041e67ac7666ccbfebe7bb84ceccd17fafb5304bf"


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest_strings(values: list[str]) -> str:
    return hashlib.sha256(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict): raise ValueError(f"not_object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def fixed_hashes() -> dict[str, str]:
    return {
        "full_wave_luna_prelaunch_sha256": FULL_LUNA_SHA, "cohort_conditional_readiness_sha256": READINESS_GATE_SHA,
        "concurrency_policy_v5_sha256": V5_SHA, "cohort_manifest_sha256": COHORT_MANIFEST_SHA,
        "cohort_authority_sha256": COHORT_AUTHORITY_SHA, "cohort_launch_seal_sha256": COHORT_SEAL_SHA,
        "packet_root_sha256": PACKET_ROOT_SHA, "intent_root_sha256": INTENT_ROOT_SHA,
        "feature_refs_digest_sha256": FEATURE_DIGEST, "result_schema_sha256": RESULT_SCHEMA_SHA,
        "receipt_contract_sha256": RECEIPT_CONTRACT_SHA, "leaf_prompt_sha256": LEAF_PROMPT_SHA,
    }


def zero_state_inventory_errors(output_files: list[str], receipt_ids: list[str], activated_cohort_ids: list[str]) -> list[str]:
    errors: list[str] = []
    if output_files: errors.append("zero_state:nonempty_outputs")
    if receipt_ids: errors.append("zero_state:receipts_present")
    if activated_cohort_ids: errors.append("zero_state:cross_cohort_or_existing_activation")
    return errors


def snapshot_errors() -> tuple[list[str], list[dict[str, Any]]]:
    errors: list[str] = []
    paths = {
        WAVE / "validation/luna-prelaunch.json": FULL_LUNA_SHA,
        WAVE / "validation/cohort-0001-preactivation-readiness.json": READINESS_GATE_SHA,
        ROOT / "master/coordination/CONCURRENCY_POLICY_V5.json": V5_SHA,
        COHORT / "cohort_manifest.jsonl": COHORT_MANIFEST_SHA,
        COHORT / "cohort_authority.json": COHORT_AUTHORITY_SHA,
        COHORT / "cohort_launch_seal.json": COHORT_SEAL_SHA,
        WAVE / "schemas/scenario_adversarial_result.schema.json": RESULT_SCHEMA_SHA,
        WAVE / "receipt_contract.json": RECEIPT_CONTRACT_SHA,
        WAVE / "leaf_prompt.json": LEAF_PROMPT_SHA,
    }
    for path, expected in paths.items():
        if not path.is_file() or sha(path) != expected: errors.append(f"fixed_hash:{path.name}")
    manifest = load_jsonl(COHORT / "cohort_manifest.jsonl") if (COHORT / "cohort_manifest.jsonl").is_file() else []
    if len(manifest) != 8 or [row.get("assignment_id") for row in manifest] != ASSIGNMENT_IDS: errors.append("cohort_manifest:assignment_set")
    refs = [ref for row in manifest for ref in row.get("feature_refs", [])]
    if len(refs) != FEATURE_COUNT or len(set(refs)) != FEATURE_COUNT or digest_strings(refs) != FEATURE_DIGEST: errors.append("cohort_manifest:feature_closure")
    packet_rows: list[dict[str, Any]] = []
    for index, row in enumerate(manifest, 1):
        aid = ASSIGNMENT_IDS[index - 1]
        packet = WAVE / row.get("packet_ref", "")
        intent = WAVE / "dispatch" / aid / "attempt-0001/dispatch_intent.json"
        output = ROOT / row.get("output_directory", "")
        receipt = intent.with_name("dispatch_receipt.json")
        if not packet.is_file() or sha(packet) != row.get("packet_sha256"): errors.append(f"{aid}:packet_hash")
        if not intent.is_file(): errors.append(f"{aid}:intent_missing"); continue
        intent_obj = load_obj(intent)
        if intent_obj.get("assignment_id") != aid or intent_obj.get("cohort_id") != COHORT_ID or intent_obj.get("model") != MODEL or intent_obj.get("reasoning_effort") != EFFORT or intent_obj.get("prospective_agent_path") != AGENT_PATHS[index - 1]: errors.append(f"{aid}:intent_binding")
        if intent_obj.get("packet_sha256") != row.get("packet_sha256") or intent_obj.get("output_directory") != str(output): errors.append(f"{aid}:intent_packet_output")
        if not output.is_dir() or any(output.iterdir()): errors.append(f"{aid}:output_nonempty")
        if receipt.exists(): errors.append(f"{aid}:receipt_present")
        packet_rows.append({"assignment_id": aid, "packet_sha256": row.get("packet_sha256"), "intent_sha256": sha(intent), "agent_path": AGENT_PATHS[index - 1]})
    if (COHORT / "activation.json").exists(): errors.append("activation_present")
    for other in range(2, 5):
        other_dir = WAVE / "cohorts" / f"cohort-{other:04d}"
        if (other_dir / "activation.json").exists(): errors.append("cross_cohort_activation_leakage")
    return sorted(set(errors)), packet_rows


def checkpoint_errors(checkpoint: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = {
        "status": "pass", "gate_passed": True, "eligible_assignment_ids": RESEARCH_IDS,
        "eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST, "rejected_assignment_ids": [],
        "unresolved_research_rejections": [], "cumulative_research_credit": 8,
    }
    for key, value in expected.items():
        if checkpoint.get(key) != value: errors.append(f"checkpoint:{key}")
    counts = checkpoint.get("counts", {})
    if counts.get("eligible") != 8 or counts.get("rejected") != 0 or counts.get("unresolved_research_rejections") != 0: errors.append("checkpoint:counts")
    if checkpoint.get("independent") is not True: errors.append("checkpoint:independent")
    return errors


def activation_template() -> dict[str, Any]:
    return {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-cohort-activation-v1", "wave_id": WAVE_ID,
        "cohort_id": COHORT_ID, "status": "BLOCKED_AWAITING_CUMULATIVE_RESEARCH_CHECKPOINT",
        "activation_granted": False, "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS,
        "feature_count": FEATURE_COUNT, "feature_refs_digest_sha256": FEATURE_DIGEST,
        "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
        "agent_paths": AGENT_PATHS, "fixed_hashes": fixed_hashes(),
        "research_checkpoint_input": {
            "status": "UNRESOLVED_REQUIRED_FUTURE_INPUT",
            "contract": {"path": "absolute path supplied at generation time", "sha256": "caller-supplied exact SHA-256",
                         "required_status": "pass", "independent": True, "eligible_assignment_ids": RESEARCH_IDS,
                         "eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST, "eligible": 8, "rejected": 0,
                         "unresolved_research_rejections": 0, "cumulative_research_credit": 8},
        },
        "coverage_credit_before_activation": 0, "certification_credit_before_activation": 0,
    }


def build_activation(checkpoint_path: Path, checkpoint_sha: str) -> tuple[dict[str, Any], list[str]]:
    errors, packet_rows = snapshot_errors()
    if not checkpoint_path.is_file(): return {}, errors + ["checkpoint:missing"]
    if sha(checkpoint_path) != checkpoint_sha: errors.append("checkpoint:sha256")
    try: checkpoint = load_obj(checkpoint_path)
    except Exception as exc: return {}, errors + [f"checkpoint:parse:{type(exc).__name__}"]
    errors.extend(checkpoint_errors(checkpoint))
    activation = {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-cohort-activation-v1", "wave_id": WAVE_ID,
        "cohort_id": COHORT_ID, "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES",
        "activation_granted": True, "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS,
        "feature_count": FEATURE_COUNT, "feature_refs_digest_sha256": FEATURE_DIGEST,
        "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
        "agent_paths": AGENT_PATHS, "fixed_hashes": fixed_hashes(), "assignment_bindings": packet_rows,
        "research_checkpoint_path": str(checkpoint_path.resolve()), "research_checkpoint_sha256": checkpoint_sha,
        "research_eligible_assignment_ids": RESEARCH_IDS, "research_eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
        "research_rejected_assignment_ids": [], "unresolved_research_rejections": [],
        "concurrency_policy_v5_sha256": V5_SHA, "semantic_leaf_cap": 8,
        "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0,
    }
    errors.extend(activation_errors(activation))
    return activation, sorted(set(errors))


def activation_errors(activation: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": COHORT_ID,
                "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
                "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "feature_count": FEATURE_COUNT,
                "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL, "reasoning_effort": EFFORT,
                "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS,
                "concurrency_policy_v5_sha256": V5_SHA, "semantic_leaf_cap": 8,
                "research_eligible_assignment_ids": RESEARCH_IDS,
                "research_eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
                "research_rejected_assignment_ids": [], "unresolved_research_rejections": []}
    errors = [f"activation:{key}" for key, value in expected.items() if activation.get(key) != value]
    if activation.get("fixed_hashes") != fixed_hashes(): errors.append("activation:fixed_hashes")
    bindings = activation.get("assignment_bindings", [])
    if len(bindings) != 8 or [row.get("assignment_id") for row in bindings] != ASSIGNMENT_IDS or [row.get("agent_path") for row in bindings] != AGENT_PATHS: errors.append("activation:assignment_bindings")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--research-checkpoint", required=True, type=Path)
    parser.add_argument("--research-checkpoint-sha", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    allowed_output = COHORT / "activation.json"
    if args.output.resolve() != allowed_output.resolve(): raise SystemExit("output must be the exact cohort-0001 activation.json path")
    if args.output.exists(): raise SystemExit("refusing to overwrite activation")
    activation, errors = build_activation(args.research_checkpoint, args.research_checkpoint_sha)
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2, sort_keys=True)); raise SystemExit(1)
    args.output.write_bytes(canonical(activation))
    print(json.dumps({"status": "activated", "activation_path": str(args.output), "activation_sha256": sha(args.output)}, indent=2, sort_keys=True))


if __name__ == "__main__": main()
