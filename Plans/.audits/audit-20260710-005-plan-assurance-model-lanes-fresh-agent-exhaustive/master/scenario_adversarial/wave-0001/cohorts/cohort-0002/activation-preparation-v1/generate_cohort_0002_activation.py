#!/usr/bin/env python3
"""Generate only the cohort-0002 activation after an exact independent research checkpoint."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[6]
WAVE = ROOT / "master/scenario_adversarial/wave-0001"
COHORT = WAVE / "cohorts/cohort-0002"
PREP = COHORT / "activation-preparation-v1"
OUTPUT_ROOT = ROOT / "scenario_adversarial_v1"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "wave-0001"
COHORT_ID = "cohort-0002"
ATTEMPT_ID = "attempt-0001"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(9, 17)]
AGENT_PATHS = [f"/root/a005_scenario_adversarial_{index:04d}_attempt_0001_terminal" for index in range(9, 17)]
RESEARCH_IDS = [f"ER-{index:04d}" for index in range(1, 9)]
RESEARCH_ELIGIBLE_DIGEST = "6309d3442ac7aca5d6faeffa47cd982aafa257c11ebae029102837e331e1dbcc"
FEATURE_COUNT = 817
FEATURE_DIGEST = "99163803098a19f4db61c85836f773a0c7a226c313acec0a177a8c1692f93f93"
FULL_LUNA_SHA = "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"
V6_SHA = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
COHORT_MANIFEST_SHA = "641d1af2ad7a5238f2c15f787fb046e299eb3480d6cfd18301b472e14e006592"
COHORT_AUTHORITY_SHA = "44b0dfd2a61d050f33e95818874a2762695eb653be3f901a93b545a244310bd9"
COHORT_SEAL_SHA = "2422de024eb8543bdc8efa121e537e1fe89c069368fde57ba6ca13238080badf"
PACKET_ROOT_SHA = "1dcb71e51130fcacda8489ba17667dd67bca7240861efc6059bfdb2091e8230a"
INTENT_ROOT_SHA = "dd11006cbc9089d0146a635bf1432327047c9f148874875465506b8e04b39adf"
RESULT_SCHEMA_SHA = "190a5e612bdbe7b2de4f3659fdbe7b9f2621ee2f194a25051f2bf39df4ac3db8"
RECEIPT_CONTRACT_SHA = "9d5059d83f31780ad14958d6526ed54e1fb6402210d6060856afb0b9799c65cf"
LEAF_PROMPT_SHA = "104e1f1126e76a3d6f0e01e041e67ac7666ccbfebe7bb84ceccd17fafb5304bf"
BLOCKED_STATUS = "BLOCKED_AWAITING_CUMULATIVE_RESEARCH_CHECKPOINT"


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_strings(values: list[str]) -> str:
    return sha_bytes(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode())


def root_hash(paths: Iterable[Path], base: Path) -> str:
    records = []
    for path in sorted(paths):
        records.append(f"{path.relative_to(base).as_posix()}\0{sha(path)}\0{path.stat().st_size}\n")
    return sha_bytes("".join(records).encode())


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict): raise ValueError(f"not_object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def fixed_hashes() -> dict[str, str]:
    return {
        "full_wave_luna_prelaunch_sha256": FULL_LUNA_SHA,
        "concurrency_policy_v6_sha256": V6_SHA,
        "cohort_manifest_sha256": COHORT_MANIFEST_SHA,
        "cohort_authority_sha256": COHORT_AUTHORITY_SHA,
        "cohort_launch_seal_sha256": COHORT_SEAL_SHA,
        "packet_root_sha256": PACKET_ROOT_SHA,
        "intent_root_sha256": INTENT_ROOT_SHA,
        "feature_refs_digest_sha256": FEATURE_DIGEST,
        "result_schema_sha256": RESULT_SCHEMA_SHA,
        "receipt_contract_sha256": RECEIPT_CONTRACT_SHA,
        "leaf_prompt_sha256": LEAF_PROMPT_SHA,
    }


def zero_state_inventory_errors(
    output_files: dict[str, list[str]], receipt_ids: list[str], result_ids: list[str], activation_present: bool
) -> list[str]:
    errors: list[str] = []
    if set(output_files) != set(ASSIGNMENT_IDS): errors.append("zero_state:assignment_set")
    if any(output_files.get(aid, []) for aid in ASSIGNMENT_IDS): errors.append("zero_state:nonempty_outputs")
    if receipt_ids: errors.append("zero_state:receipts_present")
    if result_ids: errors.append("zero_state:results_present")
    if activation_present: errors.append("zero_state:activation_present")
    return errors


def snapshot_errors() -> tuple[list[str], list[dict[str, Any]]]:
    errors: list[str] = []
    pinned = {
        WAVE / "validation/luna-prelaunch.json": FULL_LUNA_SHA,
        ROOT / "master/coordination/CONCURRENCY_POLICY_V6.json": V6_SHA,
        COHORT / "cohort_manifest.jsonl": COHORT_MANIFEST_SHA,
        COHORT / "cohort_authority.json": COHORT_AUTHORITY_SHA,
        COHORT / "cohort_launch_seal.json": COHORT_SEAL_SHA,
        WAVE / "schemas/scenario_adversarial_result.schema.json": RESULT_SCHEMA_SHA,
        WAVE / "receipt_contract.json": RECEIPT_CONTRACT_SHA,
        WAVE / "leaf_prompt.json": LEAF_PROMPT_SHA,
    }
    for path, expected in pinned.items():
        if not path.is_file() or sha(path) != expected: errors.append(f"fixed_hash:{path.name}")
    manifest = load_jsonl(COHORT / "cohort_manifest.jsonl") if (COHORT / "cohort_manifest.jsonl").is_file() else []
    if len(manifest) != 8 or [row.get("assignment_id") for row in manifest] != ASSIGNMENT_IDS:
        errors.append("cohort_manifest:assignment_set")
    refs = [ref for row in manifest for ref in row.get("feature_refs", [])]
    if len(refs) != FEATURE_COUNT or len(set(refs)) != FEATURE_COUNT or digest_strings(refs) != FEATURE_DIGEST:
        errors.append("cohort_manifest:feature_closure")
    packet_paths = [WAVE / row.get("packet_ref", "") for row in manifest]
    intent_paths = [WAVE / "dispatch" / row.get("assignment_id", "") / ATTEMPT_ID / "dispatch_intent.json" for row in manifest]
    if len(packet_paths) == 8 and all(path.is_file() for path in packet_paths):
        if root_hash(packet_paths, WAVE) != PACKET_ROOT_SHA: errors.append("packet_root:drift")
    else: errors.append("packet_root:missing")
    if len(intent_paths) == 8 and all(path.is_file() for path in intent_paths):
        if root_hash(intent_paths, WAVE) != INTENT_ROOT_SHA: errors.append("intent_root:drift")
    else: errors.append("intent_root:missing")
    bindings: list[dict[str, Any]] = []
    output_files: dict[str, list[str]] = {}; receipt_ids: list[str] = []; result_ids: list[str] = []
    for index, row in enumerate(manifest):
        if index >= len(ASSIGNMENT_IDS): break
        aid = ASSIGNMENT_IDS[index]; packet = packet_paths[index]; intent_path = intent_paths[index]
        expected_agent = AGENT_PATHS[index]
        if row.get("cohort_id") != COHORT_ID or row.get("cohort_sequence") != index + 1:
            errors.append(f"{aid}:manifest_cohort_binding")
        if not packet.is_file() or sha(packet) != row.get("packet_sha256"): errors.append(f"{aid}:packet_hash")
        if not intent_path.is_file(): errors.append(f"{aid}:intent_missing"); continue
        intent = load_obj(intent_path)
        expected = {
            "assignment_id": aid, "cohort_id": COHORT_ID, "cohort_sequence": index + 1,
            "attempt_id": ATTEMPT_ID, "model": MODEL, "reasoning_effort": EFFORT,
            "prospective_agent_path": expected_agent, "packet_sha256": row.get("packet_sha256"),
            "fork_turns": "none", "fresh_child_required": True, "descendants_forbidden": True,
            "followup_messages_forbidden": True, "retries_forbidden": True,
        }
        for key, value in expected.items():
            if intent.get(key) != value: errors.append(f"{aid}:intent:{key}")
        output = ROOT / row.get("output_directory", "")
        if intent.get("output_directory") != str(output): errors.append(f"{aid}:intent_output")
        files = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
        output_files[aid] = files
        receipt_path = Path(intent.get("receipt_ref", ""));
        if receipt_path.is_file(): receipt_ids.append(aid)
        if (output / "result.json").is_file(): result_ids.append(aid)
        if receipt_path != intent_path.with_name("dispatch_receipt.json"): errors.append(f"{aid}:receipt_path")
        bindings.append({"assignment_id": aid, "packet_id": row.get("packet_id"), "packet_sha256": row.get("packet_sha256"),
                         "intent_sha256": sha(intent_path), "output_directory": str(output), "agent_path": expected_agent})
    errors.extend(zero_state_inventory_errors(output_files, receipt_ids, result_ids, (COHORT / "activation.json").exists()))
    return sorted(set(errors)), bindings


def checkpoint_errors(checkpoint: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = {
        "audit_id": AUDIT_ID,
        "target_wave_id": WAVE_ID,
        "target_cohort_id": COHORT_ID,
        "scenario_assignment_ids": ASSIGNMENT_IDS,
        "status": "pass",
        "gate_passed": True,
        "independent": True,
        "eligible_assignment_ids": RESEARCH_IDS,
        "eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
        "rejected_assignment_ids": [],
        "unresolved_research_rejections": [],
        "cumulative_research_credit": 8,
        "concurrency_policy_v6_sha256": V6_SHA,
    }
    for key, value in expected.items():
        if checkpoint.get(key) != value: errors.append(f"checkpoint:{key}")
    counts = checkpoint.get("counts", {})
    if counts.get("eligible") != 8 or counts.get("rejected") != 0 or counts.get("unresolved_research_rejections") != 0:
        errors.append("checkpoint:counts")
    return sorted(set(errors))


def activation_template() -> dict[str, Any]:
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "scenario-adversarial-cohort-activation-v1",
        "wave_id": WAVE_ID,
        "cohort_id": COHORT_ID,
        "status": BLOCKED_STATUS,
        "activation_granted": False,
        "assignment_count": 8,
        "assignment_ids": ASSIGNMENT_IDS,
        "feature_count": FEATURE_COUNT,
        "feature_refs_digest_sha256": FEATURE_DIGEST,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER,
        "agent_paths": AGENT_PATHS,
        "concurrency_policy_v6_sha256": V6_SHA,
        "fixed_hashes": fixed_hashes(),
        "research_checkpoint_input": {
            "status": "UNRESOLVED_REQUIRED_FUTURE_INPUT",
            "contract": {
                "path": "absolute path supplied at generation time",
                "sha256": "caller-supplied exact SHA-256",
                "required_status": "pass",
                "independent": True,
                "target_wave_id": WAVE_ID,
                "target_cohort_id": COHORT_ID,
                "scenario_assignment_ids": ASSIGNMENT_IDS,
                "eligible_assignment_ids": RESEARCH_IDS,
                "eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
                "eligible": 8,
                "rejected": 0,
                "unresolved_research_rejections": 0,
                "cumulative_research_credit": 8,
                "concurrency_policy_v6_sha256": V6_SHA,
            },
        },
        "coverage_credit_before_activation": 0,
        "certification_credit_before_activation": 0,
    }


def build_activation(
    checkpoint: dict[str, Any], checkpoint_path: Path, supplied_sha: str, actual_sha: str,
    snapshot: list[str] | None = None,
) -> tuple[dict[str, Any], list[str]]:
    errors = list(snapshot or [])
    if supplied_sha != actual_sha: errors.append("checkpoint:sha256")
    errors.extend(checkpoint_errors(checkpoint))
    bindings = snapshot_errors()[1] if snapshot is None else []
    activation = {
        "audit_id": AUDIT_ID,
        "schema_version": "scenario-adversarial-cohort-activation-v1",
        "wave_id": WAVE_ID,
        "cohort_id": COHORT_ID,
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES",
        "activation_granted": True,
        "assignment_count": 8,
        "assignment_ids": ASSIGNMENT_IDS,
        "feature_count": FEATURE_COUNT,
        "feature_refs_digest_sha256": FEATURE_DIGEST,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER,
        "agent_paths": AGENT_PATHS,
        "assignment_bindings": bindings,
        "research_checkpoint_path": str(checkpoint_path.resolve()),
        "research_checkpoint_sha256": supplied_sha,
        "research_eligible_assignment_ids": RESEARCH_IDS,
        "research_eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
        "research_rejected_assignment_ids": [],
        "unresolved_research_rejections": [],
        "concurrency_policy_v6_sha256": V6_SHA,
        "semantic_leaf_cap": 8,
        "coverage_credit_before_postrun": 0,
        "certification_credit_before_postrun": 0,
    }
    errors.extend(activation_errors(activation, require_bindings=False))
    return activation, sorted(set(errors))


def activation_errors(activation: dict[str, Any], require_bindings: bool = True) -> list[str]:
    expected = {
        "audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": COHORT_ID,
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
        "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "feature_count": FEATURE_COUNT,
        "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL, "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS,
        "concurrency_policy_v6_sha256": V6_SHA, "semantic_leaf_cap": 8,
        "research_eligible_assignment_ids": RESEARCH_IDS,
        "research_eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
        "research_rejected_assignment_ids": [], "unresolved_research_rejections": [],
        "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0,
    }
    errors = [f"activation:{key}" for key, value in expected.items() if activation.get(key) != value]
    bindings = activation.get("assignment_bindings", [])
    if require_bindings and (len(bindings) != 8 or [row.get("assignment_id") for row in bindings] != ASSIGNMENT_IDS or [row.get("agent_path") for row in bindings] != AGENT_PATHS):
        errors.append("activation:assignment_bindings")
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--research-checkpoint", required=True, type=Path)
    parser.add_argument("--research-checkpoint-sha", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    allowed_output = COHORT / "activation.json"
    if args.output.resolve() != allowed_output.resolve(): raise SystemExit("output must be exact cohort-0002 activation.json")
    if args.output.exists(): raise SystemExit("refusing to overwrite activation.json")
    try: args.research_checkpoint.resolve().relative_to(ROOT.resolve())
    except ValueError: raise SystemExit("research checkpoint must be under the Audit 005 root")
    if not args.research_checkpoint.is_file(): raise SystemExit("research checkpoint is missing")
    checkpoint = load_obj(args.research_checkpoint)
    snapshot, bindings = snapshot_errors()
    activation, errors = build_activation(checkpoint, args.research_checkpoint, args.research_checkpoint_sha,
                                          sha(args.research_checkpoint), snapshot)
    activation["assignment_bindings"] = bindings
    errors.extend(activation_errors(activation))
    if errors:
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2, sort_keys=True)); raise SystemExit(1)
    args.output.write_bytes(canonical(activation))
    print(json.dumps({"status": "activated", "activation_path": str(args.output),
                      "activation_sha256": sha(args.output)}, indent=2, sort_keys=True))


if __name__ == "__main__": main()
