#!/usr/bin/env python3
"""Create two append-only, zero-launch V31 late-cohort preparations."""
from __future__ import annotations

import copy
import hashlib
import json
import os
from pathlib import Path
from typing import Any

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/scenario_adversarial/wave-0001"
HERE = Path(__file__).resolve().parent
CONTROLLER_PATH = "/root/sol_controller_v29"
CONTROLLER_THREAD_ID = "019f551e-5c00-7a73-afa3-7b57d8f0f442"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
EMPTY_TREE_SHA = hashlib.sha256(b"").hexdigest()

COHORTS = {
    "cohort-0003": {
        "numbers": range(17, 25),
        "feature_count": 1400,
        "feature_digest": "c422bd01c9a0bb5c3ae2c581424c5d06cdc436b5e59a688f5ab34c7ab6e53281",
        "source_manifest_sha": "e6bd2d8fef65e9efbf2938858b2448f916f1ee45b55c4927f6763be7d39fc0f4",
        "source_authority_sha": "c13de0acd1026722fa43c22b68ec423020f50255f2f9a268206f7051356b3570",
        "source_seal_sha": "01705699edae38dd794040f253f3c4473db92db2aba6107ab12e2d2d0e55836e",
    },
    "cohort-0004": {
        "numbers": range(25, 33),
        "feature_count": 848,
        "feature_digest": "70094f795ab0f727f3cf4bcacd82e3f25c7283bdbe23de91599295dc78723542",
        "source_manifest_sha": "363d7aa521b6396edaafd166f39cf2dc4093709fa451915463c02fdb4ddbc0bd",
        "source_authority_sha": "64e09754f64e73a978848602ed7a492a7ae3c4011248269c07ea8e714225258e",
        "source_seal_sha": "195f739f14ea81a8607627cc8a67e4a9c252d8f122a3113cae6a9d51ef71f3d7",
    },
}

PINS = {
    "policy_v6": (AUDIT / "master/coordination/CONCURRENCY_POLICY_V6.json", "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"),
    "policy_v29": (AUDIT / "master/coordination/CONCURRENCY_POLICY_V29.json", "ebf5b20bc85a2bf41aee25b6d1c5a04934c7e936168fd04c8645f8a7c7c3bba8"),
    "policy_v30": (AUDIT / "master/coordination/CONCURRENCY_POLICY_V30.json", "f56d5680c33e81f0c4ac6232d3edbce8a1a1d2617518b0901f62674e7782af79"),
    "policy_v31": (AUDIT / "master/coordination/CONCURRENCY_POLICY_V31.json", "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5"),
    "research_checkpoint": (AUDIT / "master/external_research/sprint-wave-0001/checkpoints/research-checkpoint-0001.json", "94475c6e25c0559df5cb568b855678fa1c096b1f553ad682ae444b17e4732a4d"),
    "seam_checkpoint": (AUDIT / "master/cross_domain_seams/wave-0001/window-sharding-v2/validation/postrun-v1/aggregate-seam-checkpoint-after-repair-v2.json", "f6d3fd1087c8dec7e35cfae26374605d31b342df3b945603986194598f9ee809"),
    "full_wave_authority": (WAVE / "batch_authority.json", "1ef11e1e312cc0ba7d863f81d518ce3c9cd284f0f88d417ccd44aace4fed825f"),
    "full_wave_manifest": (WAVE / "batch_manifest.jsonl", "0877e754342216bbd6a92e2d0e8fed941c9a478727fb0461775ec7da797f9863"),
    "full_wave_luna_lineage": (WAVE / "validation/luna-prelaunch.json", "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"),
    "postresearch_luna_lineage": (WAVE / "launch-readiness-v16/validation/luna-independent-prelaunch-after-research-v22.json", "9c6a6b6be157c538061c508ed92569fd7dbfca67df41bbfe1e350467130464cb"),
    "base_schema": (WAVE / "schemas/scenario_adversarial_result.schema.json", "190a5e612bdbe7b2de4f3659fdbe7b9f2621ee2f194a25051f2bf39df4ac3db8"),
    "base_prompt": (WAVE / "leaf_prompt.json", "104e1f1126e76a3d6f0e01e041e67ac7666ccbfebe7bb84ceccd17fafb5304bf"),
    "base_receipt_contract": (WAVE / "receipt_contract.json", "9d5059d83f31780ad14958d6526ed54e1fb6402210d6060856afb0b9799c65cf"),
    "cohort0001_primary": (WAVE / "postrun-validator-v1/primary-execution-v1_2/cohort-0001-primary-postrun.json", "8c6b89cf0686ac50ecaa78053a2a472df375e24a22afae8efe99f094dfbfa6ff"),
    "cohort0002_primary": (WAVE / "postrun-validator-v29-ultra/primary-execution/cohort-0002-primary-postrun.json", "a3d998309ba2b5be3127329dcbf7168c04fad8dd860246cbe5e11a2f064c87f8"),
}


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_once(path: Path, value: Any, *, json_lines: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if json_lines:
        payload = b"".join(canonical(row) for row in value)
    else:
        payload = canonical(value)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(fd, payload)
        os.fsync(fd)
    finally:
        os.close(fd)


def aid(number: int) -> str:
    return f"A005SA-{number:04d}"


def agent_path(number: int) -> str:
    return f"{CONTROLLER_PATH}/a005_scenario_adversarial_{number:04d}_attempt_0001_ultra_v31"


def tx_root(cohort_id: str) -> Path:
    return WAVE / f"cohorts/{cohort_id}/activation-transaction-v31-ultra-atomic8-preparation"


def inventory_paths() -> list[Path]:
    paths = [path for path, _ in PINS.values()]
    for cohort_id in ("cohort-0001", "cohort-0002", "cohort-0003", "cohort-0004"):
        root = WAVE / f"cohorts/{cohort_id}"
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if "activation-transaction-v31-ultra-atomic8-preparation" in path.parts:
                continue
            paths.append(path)
    for number in range(17, 33):
        paths.extend((
            WAVE / f"packets/SAPKT-{number:04d}.json",
            WAVE / f"dispatch/{aid(number)}/attempt-0001/dispatch_intent.json",
        ))
    return sorted(set(paths), key=str)


def build_lineage_inventory() -> Path:
    rows: list[dict[str, Any]] = []
    for path in inventory_paths():
        if not path.is_file():
            raise SystemExit(f"missing-lineage:{path}")
        rows.append({
            "relative_path": str(path.relative_to(AUDIT)),
            "byte_count": path.stat().st_size,
            "sha256": sha(path),
        })
    out = HERE / "protected_lineage_inventory.jsonl"
    write_once(out, rows, json_lines=True)
    return out


def source_rows(cohort_id: str) -> list[dict[str, Any]]:
    return jsonl(WAVE / f"cohorts/{cohort_id}/cohort_manifest.jsonl")


def build_zero_state() -> Path:
    rows: list[dict[str, Any]] = []
    for cohort_id, cfg in COHORTS.items():
        source = source_rows(cohort_id)
        if len(source) != len(cfg["numbers"]):
            raise SystemExit(f"source-cardinality:{cohort_id}")
        for number, row in zip(cfg["numbers"], source):
            assignment_id = aid(number)
            intent_path = WAVE / f"dispatch/{assignment_id}/attempt-0001/dispatch_intent.json"
            intent = load(intent_path)
            output = Path(intent["output_directory"])
            receipt = Path(intent["receipt_ref"])
            packet = Path(intent["packet_ref"])
            entries = sorted(str(path.relative_to(output)) for path in output.rglob("*") if path.exists()) if output.is_dir() else ["<missing>"]
            rows.append({
                "cohort_id": cohort_id,
                "assignment_id": assignment_id,
                "attempt_id": "attempt-0001",
                "feature_count": row["feature_count"],
                "packet_path": str(packet),
                "packet_sha256": sha(packet),
                "original_intent_path": str(intent_path),
                "original_intent_sha256": sha(intent_path),
                "reserved_v31_agent_path": agent_path(number),
                "native_identity_allocated": False,
                "native_child_thread_id": None,
                "native_turn_id": None,
                "output_directory": str(output),
                "output_entries": entries,
                "output_tree_sha256": EMPTY_TREE_SHA if not entries else None,
                "result_present": (output / "result.json").exists(),
                "receipt_path": str(receipt),
                "receipt_present": receipt.exists(),
            })
    if any(row["output_entries"] or row["result_present"] or row["receipt_present"] for row in rows):
        raise SystemExit("late-cohort-runtime-not-zero")
    value = {
        "schema_version": "scenario-late-cohorts-v31-zero-state-v1",
        "observed_at": "2026-07-12T08:17:59Z",
        "assignment_count": 16,
        "feature_count": 2248,
        "actual_native_semantic_identities": 0,
        "activation_transactions": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "followups": 0,
        "retries": 0,
        "descendants": 0,
        "credit": 0,
        "collaboration_registry_observation": {
            "controller_agent_path": CONTROLLER_PATH,
            "matching_children_for_assignments_0017_0032": 0,
            "reserved_strings_are_not_native_identities": True,
        },
        "rows": rows,
    }
    out = HERE / "zero_state_inventory.json"
    write_once(out, value)
    return out


def build_schema(cohort_id: str, rows: list[dict[str, Any]], out: Path) -> None:
    schema = copy.deepcopy(load(PINS["base_schema"][0]))
    ids = [row["assignment_id"] for row in rows]
    paths = [agent_path(int(value[-4:])) for value in ids]
    schema["properties"]["cohort_id"] = {"const": cohort_id}
    schema["properties"]["assignment_id"] = {"enum": ids}
    schema["properties"]["task_thread_id"] = {"enum": paths}
    schema["properties"]["reasoning_effort"] = {"const": EFFORT}
    schema["allOf"] = [{"oneOf": [{
        "properties": {
            "assignment_id": {"const": row["assignment_id"]},
            "task_thread_id": {"const": agent_path(int(row["assignment_id"][-4:]))},
            "input_binding": {"properties": {
                "packet_id": {"const": row["packet_id"]},
                "packet_sha256": {"const": row["packet_sha256"]},
                "feature_refs_digest": {"const": row["feature_refs_digest"]},
            }},
            "coverage": {"properties": {"feature_count": {"const": row["feature_count"]}}},
        }
    } for row in rows]}]
    schema["x-v31-prospective-ultra-preparation"] = {
        "activation": False,
        "policy_v31_sha256": PINS["policy_v31"][1],
        "base_schema_sha256": PINS["base_schema"][1],
        "semantic_checks_removed": 0,
    }
    write_once(out, schema)


def build_cohort(cohort_id: str, cfg: dict[str, Any], lineage: Path, zero: Path) -> dict[str, Any]:
    root = tx_root(cohort_id)
    rows = source_rows(cohort_id)
    ids = [aid(number) for number in cfg["numbers"]]
    if [row["assignment_id"] for row in rows] != ids or sum(row["feature_count"] for row in rows) != cfg["feature_count"]:
        raise SystemExit(f"source-scope:{cohort_id}")
    schema_path = root / "schema/result.schema.json"
    build_schema(cohort_id, rows, schema_path)
    prompt_path = root / "prompt/leaf_prompt.json"
    prompt = {
        "schema_version": "scenario-adversarial-leaf-prompt-v31-ultra-preparation-v1",
        "source_prompt_path": str(PINS["base_prompt"][0]),
        "source_prompt_sha256": PINS["base_prompt"][1],
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "attempt_id": "attempt-0001",
        "activation_authorized": False,
        "prompt": load(PINS["base_prompt"][0])["prompt"] + "\nV31 prospective override: use the exact bound task path, Sol ultra, no descendants/followups/retries, and do not start without a later write-once activation transaction plus a fresh independent Luna/max prelaunch gate.",
    }
    write_once(prompt_path, prompt)
    receipt_path = root / "receipt_contract.json"
    receipt = {
        "schema_version": "scenario-adversarial-future-receipt-contract-v31-ultra-v1",
        "source_contract_path": str(PINS["base_receipt_contract"][0]),
        "source_contract_sha256": PINS["base_receipt_contract"][1],
        "cohort_id": cohort_id,
        "attempt_id": "attempt-0001",
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_agent_path": CONTROLLER_PATH,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "fork_turns": "none",
        "fresh_child": True,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "terminal_response": "PMR1",
        "candidate_credit": 0,
        "receipt_present_during_preparation": False,
    }
    write_once(receipt_path, receipt)
    intent_hashes: dict[str, str] = {}
    auth_hashes: dict[str, str] = {}
    manifest_rows: list[dict[str, Any]] = []
    for row in rows:
        assignment_id = row["assignment_id"]
        number = int(assignment_id[-4:])
        old_intent_path = WAVE / f"dispatch/{assignment_id}/attempt-0001/dispatch_intent.json"
        old_intent = load(old_intent_path)
        output = Path(old_intent["output_directory"])
        packet = Path(old_intent["packet_ref"])
        future_result = output / "result.json"
        future_receipt = Path(old_intent["receipt_ref"])
        intent = {
            "schema_version": "scenario-adversarial-dispatch-intent-v31-ultra-preparation-v1",
            "status": "prepared_reserved_unallocated",
            "transaction_id": f"SCENARIO-V31-{cohort_id.upper()}-ULTRA-ATOMIC8-PREPARATION",
            "audit_id": AUDIT.name,
            "wave_id": "wave-0001",
            "cohort_id": cohort_id,
            "assignment_id": assignment_id,
            "attempt_id": "attempt-0001",
            "activation": False,
            "activation_authorized": False,
            "launch_authorized": False,
            "spawn": "none",
            "spawn_count": 0,
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "controller_agent_path": CONTROLLER_PATH,
            "controller_thread_id": CONTROLLER_THREAD_ID,
            "prospective_agent_path": agent_path(number),
            "fresh_identity_state": "reserved_unallocated",
            "native_child_thread_id": None,
            "native_turn_id": None,
            "fork_turns": "none",
            "fresh_direct_leaf_required": True,
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "retries_forbidden": True,
            "original_intent_path": str(old_intent_path),
            "original_intent_sha256": sha(old_intent_path),
            "original_xhigh_intent_mutated": False,
            "packet_path": str(packet),
            "packet_sha256": sha(packet),
            "packet_bytes": packet.stat().st_size,
            "feature_count": row["feature_count"],
            "feature_refs_digest_sha256": row["feature_refs_digest"],
            "result_schema_path": str(schema_path),
            "result_schema_sha256": sha(schema_path),
            "prompt_path": str(prompt_path),
            "prompt_sha256": sha(prompt_path),
            "output_directory": str(output),
            "output_tree_sha256": EMPTY_TREE_SHA,
            "future_result_path": str(future_result),
            "future_receipt_path": str(future_receipt),
            "candidate_credit": 0,
        }
        intent_path = root / f"intents/{assignment_id}.json"
        write_once(intent_path, intent)
        intent_hashes[assignment_id] = sha(intent_path)
        auth = {
            "schema_version": "scenario-adversarial-prospective-authorization-v31-ultra-preparation-v1",
            "status": "prepared_not_authorized",
            "transaction_id": intent["transaction_id"],
            "cohort_id": cohort_id,
            "assignment_id": assignment_id,
            "attempt_id": "attempt-0001",
            "activation": False,
            "activation_authorized": False,
            "launch_authorized": False,
            "spawn": "none",
            "spawn_count": 0,
            "agent_path": agent_path(number),
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fork_turns": "none",
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "retries_forbidden": True,
            "intent_path": str(intent_path),
            "intent_sha256": intent_hashes[assignment_id],
            "packet_path": str(packet),
            "packet_sha256": sha(packet),
            "output_directory": str(output),
            "future_result_path": str(future_result),
            "future_receipt_path": str(future_receipt),
            "fresh_luna_prelaunch_required": True,
            "fresh_luna_prelaunch_present": False,
            "prior_cohorts_cumulative_terminal_checkpoint_required": True,
            "prior_cohorts_cumulative_terminal_checkpoint_present": False,
            "candidate_credit": 0,
        }
        auth_path = root / f"prospective_authorizations/{assignment_id}.json"
        write_once(auth_path, auth)
        auth_hashes[assignment_id] = sha(auth_path)
        manifest_rows.append({
            "assignment_id": assignment_id,
            "attempt_id": "attempt-0001",
            "cohort_id": cohort_id,
            "agent_path": agent_path(number),
            "fresh_identity_state": "reserved_unallocated",
            "feature_count": row["feature_count"],
            "feature_refs_digest_sha256": row["feature_refs_digest"],
            "packet_id": row["packet_id"],
            "packet_path": str(packet),
            "packet_sha256": sha(packet),
            "original_intent_path": str(old_intent_path),
            "original_intent_sha256": sha(old_intent_path),
            "intent_path": str(intent_path),
            "intent_sha256": intent_hashes[assignment_id],
            "authorization_path": str(auth_path),
            "authorization_sha256": auth_hashes[assignment_id],
            "output_directory": str(output),
            "output_tree_sha256": EMPTY_TREE_SHA,
            "result_present": False,
            "receipt_present": False,
            "native_capture_rows": 0,
            "activation": False,
            "credit": 0,
        })
    manifest_path = root / "transaction_manifest.jsonl"
    write_once(manifest_path, manifest_rows, json_lines=True)
    authority = {
        "schema_version": "scenario-late-cohort-activation-preparation-v31-ultra-v1",
        "status": "prepared_blocked",
        "namespace_policy": "new_append_only_no_overwrite",
        "audit_id": AUDIT.name,
        "wave_id": "wave-0001",
        "cohort_id": cohort_id,
        "transaction_id": f"SCENARIO-V31-{cohort_id.upper()}-ULTRA-ATOMIC8-PREPARATION",
        "atomic_size": 8,
        "atomic16_forbidden": True,
        "co_launch_with_other_cohort_forbidden": True,
        "assignment_ids": ids,
        "assignment_count": 8,
        "feature_count": cfg["feature_count"],
        "feature_refs_digest_sha256": cfg["feature_digest"],
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_agent_path": CONTROLLER_PATH,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "spawn_count": 0,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "candidate_credit": 0,
        "launch_credit": 0,
        "coverage_credit": 0,
        "certification_credit": 0,
        "schema_checks_removed": 0,
        "semantic_checks_removed": 0,
        "manifest_path": str(manifest_path),
        "manifest_sha256": sha(manifest_path),
        "schema_path": str(schema_path),
        "schema_sha256": sha(schema_path),
        "prompt_path": str(prompt_path),
        "prompt_sha256": sha(prompt_path),
        "receipt_contract_path": str(receipt_path),
        "receipt_contract_sha256": sha(receipt_path),
        "protected_lineage_inventory_path": str(lineage),
        "protected_lineage_inventory_sha256": sha(lineage),
        "zero_state_inventory_path": str(zero),
        "zero_state_inventory_sha256": sha(zero),
        "pins": {name: {"path": str(path), "sha256": expected} for name, (path, expected) in PINS.items()},
        "source_cohort": {
            "manifest_sha256": cfg["source_manifest_sha"],
            "authority_sha256": cfg["source_authority_sha"],
            "launch_seal_sha256": cfg["source_seal_sha"],
        },
        "blockers": [
            "cohort-0002-repair-and-terminal-closure-absent",
            "fresh-independent-cumulative-terminal-checkpoint-for-cohorts-0001-0002-absent",
            f"fresh-independent-luna-max-prelaunch-for-{cohort_id}-absent",
            "cohort-specific-activation-authorization-absent",
            "native-identities-unallocated",
            "future-write-once-activation-transaction-not-created",
        ],
        "zero_state": {
            "assignments": 8,
            "empty_output_directories": 8,
            "results": 0,
            "receipts": 0,
            "native_capture_rows": 0,
            "spawned_children": 0,
            "credit": 0,
        },
    }
    authority_path = root / "IMMUTABLE_AUTHORITY.json"
    write_once(authority_path, authority)
    readiness = {
        "schema_version": "scenario-late-cohort-readiness-v31-ultra-v1",
        "status": "pass_blocked",
        "cohort_id": cohort_id,
        "authority_path": str(authority_path),
        "authority_sha256": sha(authority_path),
        "manifest_sha256": sha(manifest_path),
        "assignment_count": 8,
        "feature_count": cfg["feature_count"],
        "structural_ready": True,
        "ready_for_activation": False,
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "candidate_credit": 0,
        "old_full_wave_luna_report_is_lineage_only": True,
        "old_postresearch_luna_report_is_lineage_only": True,
        "fresh_luna_max_prelaunch_required": True,
        "fresh_luna_max_prelaunch_present": False,
        "prior_cohorts_cumulative_terminal_checkpoint_required": True,
        "prior_cohorts_cumulative_terminal_checkpoint_present": False,
        "blockers": authority["blockers"],
        "zero_state": authority["zero_state"],
    }
    readiness_path = root / "readiness.json"
    write_once(readiness_path, readiness)
    return {
        "cohort_id": cohort_id,
        "root": str(root),
        "authority_sha256": sha(authority_path),
        "readiness_sha256": sha(readiness_path),
        "manifest_sha256": sha(manifest_path),
        "schema_sha256": sha(schema_path),
        "prompt_sha256": sha(prompt_path),
        "receipt_contract_sha256": sha(receipt_path),
        "assignment_count": 8,
        "feature_count": cfg["feature_count"],
    }


def main() -> None:
    for name, (path, expected) in PINS.items():
        if not path.is_file() or sha(path) != expected:
            raise SystemExit(f"pin:{name}")
    for cohort_id in COHORTS:
        if tx_root(cohort_id).exists():
            raise SystemExit(f"namespace-exists:{cohort_id}")
    for name in ("zero_state_inventory.json", "IMMUTABLE_AUTHORITY.json", "readiness.json"):
        if (HERE / name).exists():
            raise SystemExit(f"shared-artifact-exists:{name}")
    lineage = HERE / "protected_lineage_inventory.jsonl"
    if not lineage.exists():
        lineage = build_lineage_inventory()
    elif not jsonl(lineage):
        raise SystemExit("partial-lineage-inventory-empty")
    zero = build_zero_state()
    cohorts = [build_cohort(cohort_id, cfg, lineage, zero) for cohort_id, cfg in COHORTS.items()]
    tool_names = ("prepare_late_cohorts_v31.py", "verify_late_cohorts_v31.py", "test_late_cohorts_v31.py", "finalize_late_cohorts_v31.py")
    authority = {
        "schema_version": "scenario-late-cohorts-v31-ultra-aggregate-authority-v1",
        "status": "prepared_blocked_zero_launch",
        "audit_id": AUDIT.name,
        "wave_id": "wave-0001",
        "policy_v31_sha256": PINS["policy_v31"][1],
        "controller_agent_path": CONTROLLER_PATH,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "cohort_count": 2,
        "atomic_size": 8,
        "combined_atomic16_forbidden": True,
        "assignments": 16,
        "features": 2248,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
        "cohorts": cohorts,
        "protected_lineage_inventory": {"path": str(lineage), "sha256": sha(lineage), "rows": len(jsonl(lineage))},
        "zero_state_inventory": {"path": str(zero), "sha256": sha(zero), "rows": 16},
        "tool_hashes": {name: sha(HERE / name) for name in tool_names},
        "fresh_luna_max_prelaunch_required_per_cohort": True,
        "prior_cohorts_cumulative_terminal_checkpoint_required": True,
        "current_cohort0002_primary_sha256": PINS["cohort0002_primary"][1],
        "current_cohort0002_rejected_count": 6,
        "zero_state": {"results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "spawned_children": 0, "credit": 0},
    }
    authority_path = HERE / "IMMUTABLE_AUTHORITY.json"
    write_once(authority_path, authority)
    readiness = {
        "schema_version": "scenario-late-cohorts-v31-ultra-aggregate-readiness-v1",
        "status": "pass_blocked",
        "authority_sha256": sha(authority_path),
        "cohort_count": 2,
        "atomic_transactions": 2,
        "atomic_size_each": 8,
        "assignments": 16,
        "features": 2248,
        "activation": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
        "blockers": [
            "cohort-0002-repair-and-terminal-closure-absent",
            "fresh-independent-cumulative-terminal-checkpoint-for-cohorts-0001-0002-absent",
            "fresh-independent-luna-max-prelaunch-for-cohort-0003-absent",
            "fresh-independent-luna-max-prelaunch-for-cohort-0004-absent",
            "two-future-separate-write-once-activation-transactions-not-created",
        ],
        "zero_state": authority["zero_state"],
    }
    readiness_path = HERE / "readiness.json"
    write_once(readiness_path, readiness)
    print(json.dumps({
        "status": "prepared_blocked_zero_launch",
        "authority_sha256": sha(authority_path),
        "readiness_sha256": sha(readiness_path),
        "protected_lineage_inventory_sha256": sha(lineage),
        "zero_state_inventory_sha256": sha(zero),
        "cohorts": cohorts,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
