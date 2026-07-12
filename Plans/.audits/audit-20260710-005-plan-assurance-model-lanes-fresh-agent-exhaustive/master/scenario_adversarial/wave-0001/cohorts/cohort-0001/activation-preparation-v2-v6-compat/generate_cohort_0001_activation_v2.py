#!/usr/bin/env python3
"""Generate only cohort-0001's V6 activation after two independent gates."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[6]
WAVE = ROOT / "master/scenario_adversarial/wave-0001"
COHORT = WAVE / "cohorts/cohort-0001"
PREP = COHORT / "activation-preparation-v2-v6-compat"
V1 = COHORT / "activation-preparation-v1"
OUTPUT_ROOT = ROOT / "scenario_adversarial_v1"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "wave-0001"
COHORT_ID = "cohort-0001"
STATUS = "BLOCKED_AWAITING_RESEARCH_CHECKPOINT_AND_INDEPENDENT_COHORT_AUTHORIZATION"
ACTIVE_STATUS = "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(1, 9)]
AGENT_PATHS = [f"/root/a005_scenario_adversarial_{index:04d}_attempt_0001_terminal" for index in range(1, 9)]
RESEARCH_IDS = [f"ER-{index:04d}" for index in range(1, 9)]
RESEARCH_DIGEST = "6309d3442ac7aca5d6faeffa47cd982aafa257c11ebae029102837e331e1dbcc"
FEATURE_COUNT = 823
FEATURE_DIGEST = "aead114c4e46d8bea5bf27623902f0a052d1ba969b7e1c3aad5181537e6183b5"
ASSIGNMENT_DIGEST = "ca884ed4e3e0d56cf590c7043d667acf316102ceb4d678d10b722ce3ef4118e6"
PATH_DIGEST = "85f121653142cfecf3465f1dd6cbe425388e2e9f778317a3c73b992f24004112"
PACKET_BINDING_DIGEST = "59da34ab58af6ae649c83e88f08fb90bd993f6a148e5e809ac0663bbcd9a4782"
INTENT_BINDING_DIGEST = "862755f67c2c20916e4e34ae8f5806a391ac6bc0ee7e0740fa5920e303520702"
FULL_LUNA_SHA = "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"
V6_SHA = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
V7_SHA = "4641936981927f732851267d66d7e90b0dc5eb2aa7898eea9e3d7895c1b292ed"
COHORT_MANIFEST_SHA = "7cef85ea13b20c39ce9071fc75a70a786248e4d7eecd27b250560c5017721860"
COHORT_AUTHORITY_SHA = "f963c3499987446426861d446b09632e2faf7eabe0bbfe3262d25814e94a77a0"
COHORT_SEAL_SHA = "6f3dcfe7adc9dc301238f60f1bb347d6d6e102851b663f58dc98abb7b220a310"
SOURCE_PACKET_ROOT_SHA = "f94e4e0060179f8786b9de20139a74f9e3752987aa4f3ed549c90d923535163b"
SOURCE_INTENT_ROOT_SHA = "1daaecd28d57905f3ba7a71a02b4b984a88950a9664cc14e75e7b0448fa3c779"
RESULT_SCHEMA_SHA = "190a5e612bdbe7b2de4f3659fdbe7b9f2621ee2f194a25051f2bf39df4ac3db8"
RECEIPT_CONTRACT_SHA = "9d5059d83f31780ad14958d6526ed54e1fb6402210d6060856afb0b9799c65cf"
LEAF_PROMPT_SHA = "104e1f1126e76a3d6f0e01e041e67ac7666ccbfebe7bb84ceccd17fafb5304bf"
V1_HASHES = {
    "cohort_0001_activation_preparation_v1_authority_sha256": "cade2a9b9822b5f897c47bf188a9e4045ac3c8dbb796d0c514aef8a5287eb694",
    "cohort_0001_activation_preparation_v1_readiness_sha256": "8d31bfce2bb1dc6b33e38926448a3155af77ab5706677710fe28e3770c2ab3f4",
    "cohort_0001_activation_preparation_v1_template_sha256": "465e01ccf047e7f865b32d1c8b57732ef715361d045d4e9ae19a4e1682d5ac4b",
    "cohort_0001_activation_preparation_v1_generator_sha256": "5cd2f3651ff95687b8192ead44895fc2bde0b9fbc9bc8399c68cf45b02b24bbf",
    "cohort_0001_activation_preparation_v1_verifier_sha256": "fb425dbdfc95a5e4b485bdd7f35da3404100d8654eb7f57a846fe95a7b7c734d",
    "cohort_0001_activation_preparation_v1_tests_sha256": "8abc096c7caf172dfeb0a78eeaa5534a31d90007c2c216728ec64a369d44581b",
}


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


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
        "full_wave_luna_prelaunch_sha256": FULL_LUNA_SHA,
        "concurrency_policy_v6_semantic_sha256": V6_SHA,
        "concurrency_policy_v7_scheduling_only_sha256": V7_SHA,
        "cohort_manifest_sha256": COHORT_MANIFEST_SHA,
        "cohort_authority_sha256": COHORT_AUTHORITY_SHA,
        "cohort_launch_seal_sha256": COHORT_SEAL_SHA,
        "source_packet_root_sha256": SOURCE_PACKET_ROOT_SHA,
        "source_intent_root_sha256": SOURCE_INTENT_ROOT_SHA,
        "derived_packet_binding_digest_sha256": PACKET_BINDING_DIGEST,
        "derived_intent_binding_digest_sha256": INTENT_BINDING_DIGEST,
        "assignment_digest_sha256": ASSIGNMENT_DIGEST,
        "agent_path_digest_sha256": PATH_DIGEST,
        "feature_refs_digest_sha256": FEATURE_DIGEST,
        "result_schema_sha256": RESULT_SCHEMA_SHA,
        "receipt_contract_sha256": RECEIPT_CONTRACT_SHA,
        "leaf_prompt_sha256": LEAF_PROMPT_SHA,
        **V1_HASHES,
    }


def source_paths() -> dict[Path, str]:
    return {
        WAVE / "validation/luna-prelaunch.json": FULL_LUNA_SHA,
        ROOT / "master/coordination/CONCURRENCY_POLICY_V6.json": V6_SHA,
        ROOT / "master/coordination/CONCURRENCY_POLICY_V7.json": V7_SHA,
        COHORT / "cohort_manifest.jsonl": COHORT_MANIFEST_SHA,
        COHORT / "cohort_authority.json": COHORT_AUTHORITY_SHA,
        COHORT / "cohort_launch_seal.json": COHORT_SEAL_SHA,
        WAVE / "schemas/scenario_adversarial_result.schema.json": RESULT_SCHEMA_SHA,
        WAVE / "receipt_contract.json": RECEIPT_CONTRACT_SHA,
        WAVE / "leaf_prompt.json": LEAF_PROMPT_SHA,
        V1 / "CANDIDATE_AUTHORITY.json": V1_HASHES["cohort_0001_activation_preparation_v1_authority_sha256"],
        V1 / "readiness.json": V1_HASHES["cohort_0001_activation_preparation_v1_readiness_sha256"],
        V1 / "activation.template.json": V1_HASHES["cohort_0001_activation_preparation_v1_template_sha256"],
        V1 / "generate_cohort_0001_activation.py": V1_HASHES["cohort_0001_activation_preparation_v1_generator_sha256"],
        V1 / "verify_cohort_0001_activation_preparation.py": V1_HASHES["cohort_0001_activation_preparation_v1_verifier_sha256"],
        V1 / "test_cohort_0001_activation.py": V1_HASHES["cohort_0001_activation_preparation_v1_tests_sha256"],
    }


def zero_inventory_errors(output_files: dict[str, list[str]], receipts: list[str], results: list[str], activations: list[str]) -> list[str]:
    errors: list[str] = []
    if set(output_files) != set(ASSIGNMENT_IDS) or any(output_files.get(aid) for aid in ASSIGNMENT_IDS): errors.append("zero_state:outputs")
    if receipts: errors.append("zero_state:receipts")
    if results: errors.append("zero_state:results")
    if activations: errors.append("zero_state:activations")
    return errors


def snapshot_errors() -> tuple[list[str], list[dict[str, Any]], dict[str, Any]]:
    errors: list[str] = []
    for path, expected in source_paths().items():
        if not path.is_file() or sha(path) != expected: errors.append(f"fixed_hash:{path}")
    rows = load_jsonl(COHORT / "cohort_manifest.jsonl") if (COHORT / "cohort_manifest.jsonl").is_file() else []
    ids = [row.get("assignment_id") for row in rows]
    paths = [row.get("prospective_agent_path") for row in rows]
    refs = [ref for row in rows for ref in row.get("feature_refs", [])]
    if ids != ASSIGNMENT_IDS or len(set(ids)) != 8 or digest_strings(ids) != ASSIGNMENT_DIGEST: errors.append("scope:assignment_set")
    if paths != AGENT_PATHS or len(set(paths)) != 8 or digest_strings(paths) != PATH_DIGEST: errors.append("scope:agent_paths")
    if len(refs) != FEATURE_COUNT or len(set(refs)) != FEATURE_COUNT or digest_strings(refs) != FEATURE_DIGEST: errors.append("scope:feature_closure")
    bindings: list[dict[str, Any]] = []; packet_map: dict[str, str] = {}; intent_map: dict[str, str] = {}
    output_files: dict[str, list[str]] = {}; receipts: list[str] = []; results: list[str] = []
    for index, row in enumerate(rows):
        aid = ASSIGNMENT_IDS[index]
        packet = WAVE / row.get("packet_ref", "")
        intent = WAVE / "dispatch" / aid / "attempt-0001/dispatch_intent.json"
        output = ROOT / row.get("output_directory", "")
        receipt = intent.with_name("dispatch_receipt.json")
        if not packet.is_file() or sha(packet) != row.get("packet_sha256"): errors.append(f"{aid}:packet")
        if not intent.is_file(): errors.append(f"{aid}:intent_missing"); continue
        intent_obj = load_obj(intent); intent_hash = sha(intent)
        expected = {"assignment_id": aid, "cohort_id": COHORT_ID, "model": MODEL, "reasoning_effort": EFFORT,
                    "prospective_agent_path": AGENT_PATHS[index], "packet_sha256": row.get("packet_sha256"),
                    "output_directory": str(output)}
        for key, value in expected.items():
            if intent_obj.get(key) != value: errors.append(f"{aid}:intent:{key}")
        packet_map[aid] = row.get("packet_sha256"); intent_map[aid] = intent_hash
        output_files[aid] = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
        if receipt.is_file(): receipts.append(aid)
        if (output / "result.json").is_file(): results.append(aid)
        bindings.append({"assignment_id": aid, "packet_id": row.get("packet_id"), "packet_sha256": row.get("packet_sha256"),
                         "intent_sha256": intent_hash, "agent_path": AGENT_PATHS[index], "output_directory": str(output)})
    if digest(packet_map) != PACKET_BINDING_DIGEST: errors.append("scope:packet_binding_digest")
    if digest(intent_map) != INTENT_BINDING_DIGEST: errors.append("scope:intent_binding_digest")
    activations = sorted(str(path) for path in (WAVE / "cohorts").glob("cohort-*/activation.json") if path.is_file())
    errors.extend(zero_inventory_errors(output_files, receipts, results, activations))
    state = {"outputs": len(output_files), "output_files": sum(len(value) for value in output_files.values()),
             "receipts": len(receipts), "results": len(results), "activations": len(activations),
             "packet_binding_digest_sha256": digest(packet_map), "intent_binding_digest_sha256": digest(intent_map)}
    return sorted(set(errors)), bindings, state


def checkpoint_errors(value: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
                "eligible_assignment_ids": RESEARCH_IDS, "eligible_assignment_digest": RESEARCH_DIGEST,
                "rejected_assignment_ids": [], "unresolved_research_rejections": [],
                "cumulative_research_credit": 8, "concurrency_policy_v6_sha256": V6_SHA}
    errors = [f"checkpoint:{key}" for key, item in expected.items() if value.get(key) != item]
    if value.get("counts") != {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}: errors.append("checkpoint:counts")
    return sorted(set(errors))


def preparation_hashes() -> dict[str, str | None]:
    refs = {"candidate_authority_sha256": PREP / "CANDIDATE_AUTHORITY.json", "readiness_sha256": PREP / "readiness.json",
            "activation_template_sha256": PREP / "activation.template.json", "generator_sha256": PREP / "generate_cohort_0001_activation_v2.py",
            "verifier_sha256": PREP / "verify_cohort_0001_activation_v2.py", "tests_sha256": PREP / "test_cohort_0001_activation_v2.py"}
    return {key: sha(path) if path.is_file() else None for key, path in refs.items()}


def expected_authorization(checkpoint_path: Path, checkpoint_sha: str) -> dict[str, Any]:
    return {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": COHORT_ID,
            "status": "pass", "gate_passed": True, "independent": True, "activation_authorized": True,
            "research_checkpoint_path": str(checkpoint_path.resolve()), "research_checkpoint_sha256": checkpoint_sha,
            "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "agent_paths": AGENT_PATHS,
            "feature_count": FEATURE_COUNT, "feature_refs_digest_sha256": FEATURE_DIGEST,
            "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
            "concurrency_policy_v6_semantic_sha256": V6_SHA,
            "concurrency_policy_v7_scheduling_only_sha256": V7_SHA,
            "v7_changes_semantics": False, "semantic_leaf_cap": 8,
            "preparation_hashes": preparation_hashes(), "source_v1_hashes": V1_HASHES,
            "current_zero_state_verified": True, "coverage_credit": 0, "certification_credit": 0, "errors": []}


def authorization_errors(value: dict[str, Any], checkpoint_path: Path, checkpoint_sha: str) -> list[str]:
    expected = expected_authorization(checkpoint_path, checkpoint_sha)
    errors = [f"authorization:{key}" for key, item in expected.items() if value.get(key) != item]
    if set(value) != set(expected): errors.append("authorization:key_set")
    if "concurrency_policy_v5_sha256" in value: errors.append("authorization:v5_replay")
    if any(aid not in ASSIGNMENT_IDS for aid in value.get("assignment_ids", [])): errors.append("authorization:foreign_scope")
    return sorted(set(errors))


def build_activation(checkpoint_path: Path, checkpoint_sha: str, authorization_path: Path, authorization_sha: str) -> tuple[dict[str, Any], list[str]]:
    errors, bindings, _ = snapshot_errors()
    if not checkpoint_path.is_file(): errors.append("checkpoint:missing")
    else:
        if sha(checkpoint_path) != checkpoint_sha: errors.append("checkpoint:sha256")
        try: errors.extend(checkpoint_errors(load_obj(checkpoint_path)))
        except Exception as exc: errors.append(f"checkpoint:parse:{type(exc).__name__}")
    if not authorization_path.is_file(): errors.append("authorization:missing")
    else:
        if sha(authorization_path) != authorization_sha: errors.append("authorization:sha256")
        try: errors.extend(authorization_errors(load_obj(authorization_path), checkpoint_path, checkpoint_sha))
        except Exception as exc: errors.append(f"authorization:parse:{type(exc).__name__}")
    activation = {"audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-cohort-activation-v2-v6",
        "wave_id": WAVE_ID, "cohort_id": COHORT_ID, "status": ACTIVE_STATUS, "activation_granted": True,
        "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "feature_count": FEATURE_COUNT,
        "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL, "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS, "assignment_bindings": bindings,
        "fixed_hashes": fixed_hashes(), "research_checkpoint_path": str(checkpoint_path.resolve()),
        "research_checkpoint_sha256": checkpoint_sha, "cohort_authorization_path": str(authorization_path.resolve()),
        "cohort_authorization_sha256": authorization_sha, "research_eligible_assignment_ids": RESEARCH_IDS,
        "research_eligible_assignment_digest": RESEARCH_DIGEST, "concurrency_policy_v6_semantic_sha256": V6_SHA,
        "concurrency_policy_v7_scheduling_only_sha256": V7_SHA, "v7_changes_semantics": False,
        "semantic_leaf_cap": 8, "fresh_direct_leaves": 8, "fork_turns": "none",
        "descendants_forbidden": True, "followups_forbidden": True, "zero_prevalidation_credit": True,
        "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    errors.extend(activation_errors(activation))
    return activation, sorted(set(errors))


def activation_errors(value: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-cohort-activation-v2-v6",
                "wave_id": WAVE_ID, "cohort_id": COHORT_ID, "status": ACTIVE_STATUS, "activation_granted": True,
                "assignment_count": 8, "assignment_ids": ASSIGNMENT_IDS, "feature_count": FEATURE_COUNT,
                "feature_refs_digest_sha256": FEATURE_DIGEST, "model": MODEL, "reasoning_effort": EFFORT,
                "controller_thread_id": CONTROLLER, "agent_paths": AGENT_PATHS, "fixed_hashes": fixed_hashes(),
                "research_eligible_assignment_ids": RESEARCH_IDS, "research_eligible_assignment_digest": RESEARCH_DIGEST,
                "concurrency_policy_v6_semantic_sha256": V6_SHA,
                "concurrency_policy_v7_scheduling_only_sha256": V7_SHA, "v7_changes_semantics": False,
                "semantic_leaf_cap": 8, "fresh_direct_leaves": 8, "fork_turns": "none",
                "descendants_forbidden": True, "followups_forbidden": True, "zero_prevalidation_credit": True,
                "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    errors = [f"activation:{key}" for key, item in expected.items() if value.get(key) != item]
    _, expected_bindings, _ = snapshot_errors()
    bindings = value.get("assignment_bindings", [])
    if bindings != expected_bindings: errors.append("activation:assignment_bindings")
    expected_keys = set(expected) | {"assignment_bindings", "research_checkpoint_path", "research_checkpoint_sha256", "cohort_authorization_path", "cohort_authorization_sha256"}
    if set(value) != expected_keys: errors.append("activation:key_set")
    for path_key, sha_key in (("research_checkpoint_path", "research_checkpoint_sha256"), ("cohort_authorization_path", "cohort_authorization_sha256")):
        path_value, sha_value = value.get(path_key), value.get(sha_key)
        if not isinstance(path_value, str) or not Path(path_value).is_absolute(): errors.append(f"activation:{path_key}")
        if not isinstance(sha_value, str) or len(sha_value) != 64 or any(char not in "0123456789abcdef" for char in sha_value): errors.append(f"activation:{sha_key}")
    if "concurrency_policy_v5_sha256" in value: errors.append("activation:v5_replay")
    if len(value.get("assignment_ids", [])) in {16, 32}: errors.append("activation:expanded_scope")
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--research-checkpoint", required=True, type=Path)
    parser.add_argument("--research-checkpoint-sha", required=True)
    parser.add_argument("--cohort-authorization", required=True, type=Path)
    parser.add_argument("--cohort-authorization-sha", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    allowed = COHORT / "activation.json"
    if args.output.resolve() != allowed.resolve(): raise SystemExit("output must be exact cohort-0001 activation.json")
    if args.output.exists(): raise SystemExit("refusing to overwrite activation")
    for path in (args.research_checkpoint, args.cohort_authorization):
        try: path.resolve().relative_to(ROOT.resolve())
        except ValueError: raise SystemExit("gate inputs must be under the Audit 005 root")
    activation, errors = build_activation(args.research_checkpoint, args.research_checkpoint_sha,
                                          args.cohort_authorization, args.cohort_authorization_sha)
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2, sort_keys=True)); raise SystemExit(1)
    with args.output.open("xb") as handle: handle.write(canonical(activation))
    print(json.dumps({"status": "activated", "activation_path": str(args.output),
                      "activation_sha256": sha(args.output)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
