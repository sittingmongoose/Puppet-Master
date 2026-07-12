#!/usr/bin/env python3
"""Fail-closed V6 activation generator for one late scenario cohort."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Iterable

CFG = {'cohort_number': 3, 'assignment_start': 17, 'feature_count': 1400, 'feature_digest': 'c422bd01c9a0bb5c3ae2c581424c5d06cdc436b5e59a688f5ab34c7ab6e53281', 'cohort_manifest_sha': 'e6bd2d8fef65e9efbf2938858b2448f916f1ee45b55c4927f6763be7d39fc0f4', 'cohort_authority_sha': 'c13de0acd1026722fa43c22b68ec423020f50255f2f9a268206f7051356b3570', 'cohort_seal_sha': '01705699edae38dd794040f253f3c4473db92db2aba6107ab12e2d2d0e55836e', 'packet_root_sha': '99299d14ca2671bd0583832bc66f4bd8180fca943129c09c812fdc830db7feff', 'intent_root_sha': 'cb222f14b1318da55063e59c2fae200a6590982125058c965606b509632c517f'}
ROOT = Path(__file__).resolve().parents[6]
WAVE = ROOT / "master/scenario_adversarial/wave-0001"
COHORT_NUMBER = CFG["cohort_number"]
COHORT_ID = f"cohort-{COHORT_NUMBER:04d}"
COHORT = WAVE / "cohorts" / COHORT_ID
PREP = COHORT / "activation-preparation-v1"
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "wave-0001"
ATTEMPT_ID = "attempt-0001"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(CFG["assignment_start"], CFG["assignment_start"] + 8)]
AGENT_PATHS = [f"/root/a005_scenario_adversarial_{index:04d}_attempt_0001_terminal" for index in range(CFG["assignment_start"], CFG["assignment_start"] + 8)]
FEATURE_COUNT = CFG["feature_count"]
FEATURE_DIGEST = CFG["feature_digest"]
RESEARCH_IDS = [f"ER-{index:04d}" for index in range(1, 9)]
RESEARCH_ELIGIBLE_DIGEST = "6309d3442ac7aca5d6faeffa47cd982aafa257c11ebae029102837e331e1dbcc"
PRIOR_COHORT_IDS = ["cohort-0001", "cohort-0002"]
PRIOR_ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(1, 17)]
OVERLAP_COHORT_IDS = ["cohort-0003", "cohort-0004"]
PER_COHORT_CAP = 8
MAX_ACTIVE_SEMANTIC_CAP = 16
FULL_LUNA_SHA = "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"
V6_SHA = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
COHORT_MANIFEST_SHA = CFG["cohort_manifest_sha"]
COHORT_AUTHORITY_SHA = CFG["cohort_authority_sha"]
COHORT_SEAL_SHA = CFG["cohort_seal_sha"]
PACKET_ROOT_SHA = CFG["packet_root_sha"]
INTENT_ROOT_SHA = CFG["intent_root_sha"]
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


PRIOR_ASSIGNMENT_DIGEST = digest_strings(PRIOR_ASSIGNMENT_IDS)


def root_hash(paths: Iterable[Path], base: Path) -> str:
    records = [f"{path.relative_to(base).as_posix()}\0{sha(path)}\0{path.stat().st_size}\n" for path in sorted(paths)]
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


def zero_state_inventory_errors(output_files: dict[str, list[str]], receipt_ids: list[str], result_ids: list[str], activation_present: bool) -> list[str]:
    errors = []
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
    if len(manifest) != 8 or [row.get("assignment_id") for row in manifest] != ASSIGNMENT_IDS: errors.append("manifest:assignment_set")
    refs = [ref for row in manifest for ref in row.get("feature_refs", [])]
    if len(refs) != FEATURE_COUNT or len(set(refs)) != FEATURE_COUNT or digest_strings(refs) != FEATURE_DIGEST: errors.append("manifest:feature_closure")
    packet_paths = [WAVE / row.get("packet_ref", "") for row in manifest]
    intent_paths = [WAVE / "dispatch" / row.get("assignment_id", "") / ATTEMPT_ID / "dispatch_intent.json" for row in manifest]
    if len(packet_paths) != 8 or not all(path.is_file() for path in packet_paths) or root_hash(packet_paths, WAVE) != PACKET_ROOT_SHA: errors.append("packet_root:drift")
    if len(intent_paths) != 8 or not all(path.is_file() for path in intent_paths) or root_hash(intent_paths, WAVE) != INTENT_ROOT_SHA: errors.append("intent_root:drift")
    bindings = []
    output_files: dict[str, list[str]] = {}; receipts: list[str] = []; results: list[str] = []
    for index, row in enumerate(manifest[:8]):
        aid = ASSIGNMENT_IDS[index]; packet = packet_paths[index]; intent_path = intent_paths[index]; expected_agent = AGENT_PATHS[index]
        if row.get("cohort_id") != COHORT_ID or row.get("cohort_sequence") != index + 1: errors.append(f"{aid}:manifest_cohort")
        if not packet.is_file() or sha(packet) != row.get("packet_sha256"): errors.append(f"{aid}:packet_hash")
        if not intent_path.is_file(): errors.append(f"{aid}:intent_missing"); continue
        intent = load_obj(intent_path)
        expected = {"assignment_id": aid, "cohort_id": COHORT_ID, "cohort_sequence": index + 1, "attempt_id": ATTEMPT_ID,
                    "model": MODEL, "reasoning_effort": EFFORT, "prospective_agent_path": expected_agent,
                    "packet_sha256": row.get("packet_sha256"), "fork_turns": "none", "fresh_child_required": True,
                    "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True}
        for key, value in expected.items():
            if intent.get(key) != value: errors.append(f"{aid}:intent:{key}")
        output = ROOT / row.get("output_directory", "")
        if intent.get("output_directory") != str(output): errors.append(f"{aid}:intent_output")
        files = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
        output_files[aid] = files
        receipt = Path(intent.get("receipt_ref", ""))
        if receipt != intent_path.with_name("dispatch_receipt.json"): errors.append(f"{aid}:receipt_path")
        if receipt.is_file(): receipts.append(aid)
        if (output / "result.json").is_file(): results.append(aid)
        bindings.append({"assignment_id": aid, "packet_id": row.get("packet_id"), "packet_sha256": row.get("packet_sha256"),
                         "intent_sha256": sha(intent_path), "output_directory": str(output), "agent_path": expected_agent})
    errors.extend(zero_state_inventory_errors(output_files, receipts, results, (COHORT / "activation.json").exists()))
    return sorted(set(errors)), bindings


def research_checkpoint_errors(value: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
                "eligible_assignment_ids": RESEARCH_IDS, "eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST,
                "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
                "concurrency_policy_v6_sha256": V6_SHA}
    errors = [f"research:{key}" for key, item in expected.items() if value.get(key) != item]
    counts = value.get("counts", {})
    if counts.get("eligible") != 8 or counts.get("rejected") != 0 or counts.get("unresolved_research_rejections") != 0: errors.append("research:counts")
    return sorted(set(errors))


def prior_terminal_checkpoint_errors(value: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
                "completed_cohort_ids": PRIOR_COHORT_IDS, "terminal_assignment_ids": PRIOR_ASSIGNMENT_IDS,
                "terminal_assignment_digest": PRIOR_ASSIGNMENT_DIGEST, "unresolved_terminal_failures": [],
                "concurrency_policy_v6_sha256": V6_SHA}
    errors = [f"terminal:{key}" for key, item in expected.items() if value.get(key) != item]
    counts = value.get("counts", {})
    expected_counts = {"cohorts": 2, "assignments": 16, "completed": 16, "receipts": 16, "results": 16, "unresolved": 0}
    if counts != expected_counts: errors.append("terminal:counts")
    return sorted(set(errors))


def cohort_authorization_errors(value: dict[str, Any], research_sha: str, terminal_sha: str) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "status": "authorized", "authorization_granted": True, "independent": True,
                "wave_id": WAVE_ID, "cohort_id": COHORT_ID, "assignment_ids": ASSIGNMENT_IDS,
                "feature_count": FEATURE_COUNT, "feature_refs_digest_sha256": FEATURE_DIGEST,
                "agent_paths": AGENT_PATHS, "model": MODEL, "reasoning_effort": EFFORT,
                "concurrency_policy_v6_sha256": V6_SHA, "semantic_leaf_cap": PER_COHORT_CAP,
                "maximum_active_semantic_cap": MAX_ACTIVE_SEMANTIC_CAP, "authorized_overlap_cohort_ids": OVERLAP_COHORT_IDS,
                "prior_terminal_cohort_ids": PRIOR_COHORT_IDS, "global_research_checkpoint_sha256": research_sha,
                "prior_cohorts_terminal_checkpoint_sha256": terminal_sha, "fixed_hashes": fixed_hashes()}
    return sorted(f"authorization:{key}" for key, item in expected.items() if value.get(key) != item)


def activation_template() -> dict[str, Any]:
    return {"audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-late-cohort-activation-v1", "wave_id": WAVE_ID,
            "cohort_id": COHORT_ID, "status": BLOCKED_STATUS, "activation_granted": False,
            "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "feature_count": FEATURE_COUNT,
            "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL, "reasoning_effort": EFFORT,
            "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS, "fixed_hashes": fixed_hashes(),
            "concurrency_policy_v6_sha256": V6_SHA, "semantic_leaf_cap": 8, "maximum_active_semantic_cap": 16,
            "authorized_overlap_cohort_ids": OVERLAP_COHORT_IDS,
            "global_research_checkpoint": {"status": "UNRESOLVED_GLOBAL_RESEARCH_CHECKPOINT",
                "contract": {"independent": True, "eligible_assignment_ids": RESEARCH_IDS,
                    "eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST, "eligible": 8, "rejected": 0,
                    "unresolved_research_rejections": 0, "cumulative_research_credit": 8, "concurrency_policy_v6_sha256": V6_SHA}},
            "prior_cohorts_terminal_checkpoint": {"status": "UNRESOLVED_PRIOR_COHORTS_TERMINAL_CHECKPOINT",
                "contract": {"independent": True, "completed_cohort_ids": PRIOR_COHORT_IDS,
                    "terminal_assignment_ids": PRIOR_ASSIGNMENT_IDS, "terminal_assignment_digest": PRIOR_ASSIGNMENT_DIGEST,
                    "completed": 16, "receipts": 16, "results": 16, "unresolved": 0, "concurrency_policy_v6_sha256": V6_SHA}},
            "cohort_specific_authorization": {"status": "UNRESOLVED_COHORT_SPECIFIC_AUTHORIZATION",
                "contract": {"cohort_id": COHORT_ID, "assignment_ids": ASSIGNMENT_IDS, "agent_paths": AGENT_PATHS,
                    "model": MODEL, "reasoning_effort": EFFORT, "semantic_leaf_cap": 8,
                    "maximum_active_semantic_cap": 16, "authorized_overlap_cohort_ids": OVERLAP_COHORT_IDS,
                    "fixed_hashes": fixed_hashes()}},
            "launch_credit": 0, "coverage_credit": 0, "certification_credit": 0}


def build_activation(research: dict[str, Any], terminal: dict[str, Any], authorization: dict[str, Any],
                     research_path: Path, research_sha: str, research_actual_sha: str,
                     terminal_path: Path, terminal_sha: str, terminal_actual_sha: str,
                     authorization_path: Path, authorization_sha: str, authorization_actual_sha: str,
                     snapshot: list[str] | None = None) -> tuple[dict[str, Any], list[str]]:
    errors = list(snapshot or [])
    if research_sha != research_actual_sha: errors.append("research:sha256")
    if terminal_sha != terminal_actual_sha: errors.append("terminal:sha256")
    if authorization_sha != authorization_actual_sha: errors.append("authorization:sha256")
    errors.extend(research_checkpoint_errors(research)); errors.extend(prior_terminal_checkpoint_errors(terminal))
    errors.extend(cohort_authorization_errors(authorization, research_sha, terminal_sha))
    activation = {"audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-late-cohort-activation-v1",
        "wave_id": WAVE_ID, "cohort_id": COHORT_ID, "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES",
        "activation_granted": True, "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS,
        "feature_count": FEATURE_COUNT, "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL,
        "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS,
        "assignment_bindings": [], "research_checkpoint_path": str(research_path.resolve()),
        "research_checkpoint_sha256": research_sha, "prior_cohorts_terminal_checkpoint_path": str(terminal_path.resolve()),
        "prior_cohorts_terminal_checkpoint_sha256": terminal_sha, "cohort_authorization_path": str(authorization_path.resolve()),
        "cohort_authorization_sha256": authorization_sha, "research_eligible_assignment_ids": RESEARCH_IDS,
        "research_eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST, "prior_terminal_cohort_ids": PRIOR_COHORT_IDS,
        "prior_terminal_assignment_ids": PRIOR_ASSIGNMENT_IDS, "concurrency_policy_v6_sha256": V6_SHA,
        "semantic_leaf_cap": 8, "maximum_active_semantic_cap": 16, "authorized_overlap_cohort_ids": OVERLAP_COHORT_IDS,
        "launch_credit": 0, "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    errors.extend(activation_errors(activation, require_bindings=False))
    return activation, sorted(set(errors))


def activation_errors(value: dict[str, Any], require_bindings: bool = True) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": COHORT_ID,
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
        "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "feature_count": FEATURE_COUNT,
        "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL, "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS, "research_eligible_assignment_ids": RESEARCH_IDS,
        "research_eligible_assignment_digest": RESEARCH_ELIGIBLE_DIGEST, "prior_terminal_cohort_ids": PRIOR_COHORT_IDS,
        "prior_terminal_assignment_ids": PRIOR_ASSIGNMENT_IDS, "concurrency_policy_v6_sha256": V6_SHA,
        "semantic_leaf_cap": 8, "maximum_active_semantic_cap": 16, "authorized_overlap_cohort_ids": OVERLAP_COHORT_IDS,
        "launch_credit": 0, "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    errors = [f"activation:{key}" for key, item in expected.items() if value.get(key) != item]
    bindings = value.get("assignment_bindings", [])
    if require_bindings and (len(bindings) != 8 or [row.get("assignment_id") for row in bindings] != ASSIGNMENT_IDS or [row.get("agent_path") for row in bindings] != AGENT_PATHS): errors.append("activation:assignment_bindings")
    return sorted(set(errors))


def read_bound_input(path: Path, supplied_sha: str, label: str) -> tuple[dict[str, Any], str]:
    try: path.resolve().relative_to(ROOT.resolve())
    except ValueError: raise SystemExit(f"{label} must be under the Audit 005 root")
    if not path.is_file(): raise SystemExit(f"{label} is missing")
    actual = sha(path)
    return load_obj(path), actual


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--research-checkpoint", required=True, type=Path); parser.add_argument("--research-checkpoint-sha", required=True)
    parser.add_argument("--prior-cohorts-terminal-checkpoint", required=True, type=Path); parser.add_argument("--prior-cohorts-terminal-checkpoint-sha", required=True)
    parser.add_argument("--cohort-authorization", required=True, type=Path); parser.add_argument("--cohort-authorization-sha", required=True)
    parser.add_argument("--output", required=True, type=Path); args = parser.parse_args()
    allowed = COHORT / "activation.json"
    if args.output.resolve() != allowed.resolve(): raise SystemExit(f"output must be exact {COHORT_ID} activation.json")
    if args.output.exists(): raise SystemExit("refusing to overwrite activation.json")
    research, research_actual = read_bound_input(args.research_checkpoint, args.research_checkpoint_sha, "research checkpoint")
    terminal, terminal_actual = read_bound_input(args.prior_cohorts_terminal_checkpoint, args.prior_cohorts_terminal_checkpoint_sha, "prior terminal checkpoint")
    authorization, authorization_actual = read_bound_input(args.cohort_authorization, args.cohort_authorization_sha, "cohort authorization")
    snapshot, bindings = snapshot_errors()
    activation, errors = build_activation(research, terminal, authorization,
        args.research_checkpoint, args.research_checkpoint_sha, research_actual,
        args.prior_cohorts_terminal_checkpoint, args.prior_cohorts_terminal_checkpoint_sha, terminal_actual,
        args.cohort_authorization, args.cohort_authorization_sha, authorization_actual, snapshot)
    activation["assignment_bindings"] = bindings; errors.extend(activation_errors(activation))
    if errors:
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2, sort_keys=True)); raise SystemExit(1)
    args.output.write_bytes(canonical(activation))
    print(json.dumps({"status": "activated", "activation_path": str(args.output), "activation_sha256": sha(args.output)}, indent=2, sort_keys=True))


if __name__ == "__main__": main()
