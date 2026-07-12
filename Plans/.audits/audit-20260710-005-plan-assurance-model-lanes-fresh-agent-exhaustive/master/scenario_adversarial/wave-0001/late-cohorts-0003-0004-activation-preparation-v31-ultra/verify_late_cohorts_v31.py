#!/usr/bin/env python3
"""Fail-closed verifier for both zero-launch V31 late-cohort preparations."""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import stat
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/scenario_adversarial/wave-0001"
HERE = Path(__file__).resolve().parent
AUTHORITY = HERE / "IMMUTABLE_AUTHORITY.json"
READINESS = HERE / "readiness.json"
LINEAGE = HERE / "protected_lineage_inventory.jsonl"
ZERO = HERE / "zero_state_inventory.json"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
CONTROLLER = "/root/sol_controller_v29"
CONTROLLER_THREAD = "019f551e-5c00-7a73-afa3-7b57d8f0f442"
EMPTY_TREE_SHA = hashlib.sha256(b"").hexdigest()
POLICY_V31_SHA = "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5"
COHORT2_PRIMARY_SHA = "a3d998309ba2b5be3127329dcbf7168c04fad8dd860246cbe5e11a2f064c87f8"

COHORTS = {
    "cohort-0003": {
        "ids": [f"A005SA-{number:04d}" for number in range(17, 25)],
        "features": 1400,
        "feature_digest": "c422bd01c9a0bb5c3ae2c581424c5d06cdc436b5e59a688f5ab34c7ab6e53281",
    },
    "cohort-0004": {
        "ids": [f"A005SA-{number:04d}" for number in range(25, 33)],
        "features": 848,
        "feature_digest": "70094f795ab0f727f3cf4bcacd82e3f25c7283bdbe23de91599295dc78723542",
    },
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def tx_root(cohort_id: str) -> Path:
    return WAVE / f"cohorts/{cohort_id}/activation-transaction-v31-ultra-atomic8-preparation"


def expected_agent_path(assignment_id: str) -> str:
    return f"{CONTROLLER}/a005_scenario_adversarial_{assignment_id[-4:]}_attempt_0001_ultra_v31"


def exact_fields(value: Any, expected: dict[str, Any], label: str) -> list[str]:
    if not isinstance(value, dict):
        return [f"{label}:not-object"]
    return [f"{label}:{key}" for key, wanted in expected.items() if value.get(key) != wanted]


def binding_errors(binding: Any, label: str) -> list[str]:
    if not isinstance(binding, dict) or set(binding) != {"path", "sha256"}:
        return [f"{label}:shape"]
    path = Path(binding["path"])
    if not path.is_file() or path.is_symlink():
        return [f"{label}:missing-or-symlink"]
    return [] if sha(path) == binding["sha256"] else [f"{label}:sha256"]


def intent_contract_errors(intent: Any, row: dict[str, Any]) -> list[str]:
    expected = {
        "status": "prepared_reserved_unallocated",
        "cohort_id": row["cohort_id"],
        "assignment_id": row["assignment_id"],
        "attempt_id": "attempt-0001",
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "spawn_count": 0,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_agent_path": CONTROLLER,
        "controller_thread_id": CONTROLLER_THREAD,
        "prospective_agent_path": row["agent_path"],
        "fresh_identity_state": "reserved_unallocated",
        "native_child_thread_id": None,
        "native_turn_id": None,
        "fork_turns": "none",
        "fresh_direct_leaf_required": True,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "original_intent_path": row["original_intent_path"],
        "original_intent_sha256": row["original_intent_sha256"],
        "original_xhigh_intent_mutated": False,
        "packet_path": row["packet_path"],
        "packet_sha256": row["packet_sha256"],
        "feature_count": row["feature_count"],
        "feature_refs_digest_sha256": row["feature_refs_digest_sha256"],
        "output_directory": row["output_directory"],
        "output_tree_sha256": EMPTY_TREE_SHA,
        "future_result_path": str(Path(row["output_directory"]) / "result.json"),
        "candidate_credit": 0,
    }
    errors = exact_fields(intent, expected, f"intent:{row['assignment_id']}")
    if isinstance(intent, dict):
        if intent.get("future_receipt_path") == intent.get("future_result_path"):
            errors.append(f"intent:{row['assignment_id']}:receipt-result-collision")
        for key in ("result_schema_path", "prompt_path"):
            path = Path(intent.get(key, ""))
            digest_key = key.replace("_path", "_sha256")
            if not path.is_file() or sha(path) != intent.get(digest_key):
                errors.append(f"intent:{row['assignment_id']}:{key}-binding")
    return errors


def authorization_contract_errors(auth: Any, row: dict[str, Any]) -> list[str]:
    expected = {
        "status": "prepared_not_authorized",
        "cohort_id": row["cohort_id"],
        "assignment_id": row["assignment_id"],
        "attempt_id": "attempt-0001",
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "spawn_count": 0,
        "agent_path": row["agent_path"],
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "intent_path": row["intent_path"],
        "intent_sha256": row["intent_sha256"],
        "packet_path": row["packet_path"],
        "packet_sha256": row["packet_sha256"],
        "output_directory": row["output_directory"],
        "fresh_luna_prelaunch_required": True,
        "fresh_luna_prelaunch_present": False,
        "prior_cohorts_cumulative_terminal_checkpoint_required": True,
        "prior_cohorts_cumulative_terminal_checkpoint_present": False,
        "candidate_credit": 0,
    }
    return exact_fields(auth, expected, f"authorization:{row['assignment_id']}")


def expected_transaction_files(cohort_id: str) -> set[Path]:
    root = tx_root(cohort_id)
    files = {
        root / "IMMUTABLE_AUTHORITY.json",
        root / "readiness.json",
        root / "transaction_manifest.jsonl",
        root / "schema/result.schema.json",
        root / "prompt/leaf_prompt.json",
        root / "receipt_contract.json",
    }
    for assignment_id in COHORTS[cohort_id]["ids"]:
        files.add(root / f"intents/{assignment_id}.json")
        files.add(root / f"prospective_authorizations/{assignment_id}.json")
    return files


def verify_preparation() -> dict[str, Any]:
    errors: list[str] = []
    for path in (AUTHORITY, READINESS, LINEAGE, ZERO):
        if not path.is_file() or path.is_symlink():
            errors.append(f"shared:missing:{path.name}")
    if errors:
        return {"status": "fail_closed", "errors": errors, "activation": False}

    authority = load(AUTHORITY)
    readiness = load(READINESS)
    errors.extend(exact_fields(authority, {
        "status": "prepared_blocked_zero_launch",
        "policy_v31_sha256": POLICY_V31_SHA,
        "controller_agent_path": CONTROLLER,
        "controller_thread_id": CONTROLLER_THREAD,
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
        "fresh_luna_max_prelaunch_required_per_cohort": True,
        "prior_cohorts_cumulative_terminal_checkpoint_required": True,
        "current_cohort0002_primary_sha256": COHORT2_PRIMARY_SHA,
        "current_cohort0002_rejected_count": 6,
    }, "aggregate-authority"))
    errors.extend(exact_fields(readiness, {
        "status": "pass_blocked",
        "authority_sha256": sha(AUTHORITY),
        "cohort_count": 2,
        "atomic_transactions": 2,
        "atomic_size_each": 8,
        "assignments": 16,
        "features": 2248,
        "activation": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
    }, "aggregate-readiness"))
    if authority.get("tool_hashes", {}) != {name: sha(HERE / name) for name in authority.get("tool_hashes", {}) if (HERE / name).is_file()}:
        errors.append("aggregate-authority:tool-hashes")
    for key, path in (("protected_lineage_inventory", LINEAGE), ("zero_state_inventory", ZERO)):
        binding = authority.get(key, {})
        errors.extend(binding_errors({"path": binding.get("path"), "sha256": binding.get("sha256")}, f"aggregate:{key}"))
        if Path(binding.get("path", "")) != path:
            errors.append(f"aggregate:{key}:path")
    if stat.S_IMODE(AUTHORITY.stat().st_mode) != 0o444 or stat.S_IMODE(READINESS.stat().st_mode) != 0o444:
        errors.append("aggregate:authority-readiness-mode")

    lineage = jsonl(LINEAGE)
    if len(lineage) != len({row.get("relative_path") for row in lineage}):
        errors.append("lineage:duplicate-path")
    for row in lineage:
        path = AUDIT / row.get("relative_path", "")
        if not path.is_file() or path.is_symlink() or path.stat().st_size != row.get("byte_count") or sha(path) != row.get("sha256"):
            errors.append(f"lineage:{row.get('relative_path')}")

    zero = load(ZERO)
    errors.extend(exact_fields(zero, {
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
    }, "zero-inventory"))
    if len(zero.get("rows", [])) != 16:
        errors.append("zero-inventory:rows")

    all_ids: list[str] = []
    all_paths: list[str] = []
    all_outputs: list[str] = []
    features = 0
    empty_outputs = 0
    for cohort_id, cfg in COHORTS.items():
        root = tx_root(cohort_id)
        expected_files = expected_transaction_files(cohort_id)
        actual_files = {path for path in root.rglob("*") if path.is_file()} if root.is_dir() else set()
        if actual_files != expected_files:
            missing = sorted(str(path.relative_to(root)) for path in expected_files - actual_files)
            foreign = sorted(str(path.relative_to(root)) for path in actual_files - expected_files)
            errors.append(f"{cohort_id}:namespace:missing={missing}:foreign={foreign}")
            continue
        if any(path.is_symlink() for path in root.rglob("*")):
            errors.append(f"{cohort_id}:namespace:symlink")
        for forbidden in ("activation_core.json", "activation_envelope.json", "activation.json", "native_capture.json"):
            if any(path.name == forbidden for path in root.rglob("*")):
                errors.append(f"{cohort_id}:forbidden:{forbidden}")
        cohort_authority_path = root / "IMMUTABLE_AUTHORITY.json"
        cohort_readiness_path = root / "readiness.json"
        cohort_authority = load(cohort_authority_path)
        cohort_readiness = load(cohort_readiness_path)
        manifest_path = root / "transaction_manifest.jsonl"
        manifest = jsonl(manifest_path)
        errors.extend(exact_fields(cohort_authority, {
            "status": "prepared_blocked",
            "cohort_id": cohort_id,
            "atomic_size": 8,
            "atomic16_forbidden": True,
            "co_launch_with_other_cohort_forbidden": True,
            "assignment_ids": cfg["ids"],
            "assignment_count": 8,
            "feature_count": cfg["features"],
            "feature_refs_digest_sha256": cfg["feature_digest"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "controller_agent_path": CONTROLLER,
            "controller_thread_id": CONTROLLER_THREAD,
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
            "manifest_sha256": sha(manifest_path),
        }, f"{cohort_id}:authority"))
        errors.extend(exact_fields(cohort_readiness, {
            "status": "pass_blocked",
            "cohort_id": cohort_id,
            "authority_sha256": sha(cohort_authority_path),
            "manifest_sha256": sha(manifest_path),
            "assignment_count": 8,
            "feature_count": cfg["features"],
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
        }, f"{cohort_id}:readiness"))
        if [row.get("assignment_id") for row in manifest] != cfg["ids"]:
            errors.append(f"{cohort_id}:manifest:ids")
        if sum(int(row.get("feature_count", 0)) for row in manifest) != cfg["features"]:
            errors.append(f"{cohort_id}:manifest:features")
        schema_path = root / "schema/result.schema.json"
        schema = load(schema_path)
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as exc:
            errors.append(f"{cohort_id}:schema:{type(exc).__name__}")
        if schema.get("properties", {}).get("assignment_id", {}).get("enum") != cfg["ids"]:
            errors.append(f"{cohort_id}:schema:assignment-enum")
        if schema.get("properties", {}).get("task_thread_id", {}).get("enum") != [expected_agent_path(value) for value in cfg["ids"]]:
            errors.append(f"{cohort_id}:schema:path-enum")
        if schema.get("properties", {}).get("reasoning_effort") != {"const": EFFORT}:
            errors.append(f"{cohort_id}:schema:effort")
        if len(schema.get("allOf", [{}])[0].get("oneOf", [])) != 8:
            errors.append(f"{cohort_id}:schema:bijection")
        for row in manifest:
            assignment_id = row["assignment_id"]
            all_ids.append(assignment_id)
            all_paths.append(row.get("agent_path"))
            all_outputs.append(row.get("output_directory"))
            features += int(row.get("feature_count", 0))
            if row.get("cohort_id") != cohort_id or row.get("agent_path") != expected_agent_path(assignment_id):
                errors.append(f"{assignment_id}:manifest:cohort-path")
            packet = Path(row.get("packet_path", ""))
            original = Path(row.get("original_intent_path", ""))
            intent_path = Path(row.get("intent_path", ""))
            auth_path = Path(row.get("authorization_path", ""))
            for label, path, digest in (
                ("packet", packet, row.get("packet_sha256")),
                ("original-intent", original, row.get("original_intent_sha256")),
                ("intent", intent_path, row.get("intent_sha256")),
                ("authorization", auth_path, row.get("authorization_sha256")),
            ):
                if not path.is_file() or path.is_symlink() or sha(path) != digest:
                    errors.append(f"{assignment_id}:{label}:binding")
            if intent_path.is_file():
                errors.extend(intent_contract_errors(load(intent_path), row))
            if auth_path.is_file():
                errors.extend(authorization_contract_errors(load(auth_path), row))
            output = Path(row.get("output_directory", ""))
            if output.is_dir() and not output.is_symlink() and not any(output.iterdir()):
                empty_outputs += 1
            else:
                errors.append(f"{assignment_id}:output:not-empty-regular-directory")
            if (output / "result.json").exists() or Path(load(intent_path).get("future_receipt_path", "")).exists():
                errors.append(f"{assignment_id}:runtime-state-present")
            if row.get("result_present") is not False or row.get("receipt_present") is not False or row.get("native_capture_rows") != 0 or row.get("activation") is not False or row.get("credit") != 0:
                errors.append(f"{assignment_id}:manifest:zero-state")
        for path in expected_files:
            if path.suffix in {".json", ".jsonl"} and stat.S_IMODE(path.stat().st_mode) != 0o444:
                errors.append(f"{cohort_id}:mode:{path.relative_to(root)}")

    if all_ids != COHORTS["cohort-0003"]["ids"] + COHORTS["cohort-0004"]["ids"] or len(set(all_ids)) != 16:
        errors.append("aggregate:assignment-bijection")
    if len(set(all_paths)) != 16 or len(set(all_outputs)) != 16:
        errors.append("aggregate:path-output-uniqueness")
    if features != 2248 or empty_outputs != 16:
        errors.append("aggregate:feature-or-empty-output-count")
    primary = load(WAVE / "postrun-validator-v29-ultra/primary-execution/cohort-0002-primary-postrun.json")
    if sha(WAVE / "postrun-validator-v29-ultra/primary-execution/cohort-0002-primary-postrun.json") != COHORT2_PRIMARY_SHA or primary.get("eligible_count") != 2 or primary.get("rejected_count") != 6:
        errors.append("blocker:cohort0002-live-outcome")
    if any((WAVE / f"cohorts/{cohort_id}/activation.json").exists() for cohort_id in COHORTS):
        errors.append("aggregate:legacy-activation-present")

    status = "pass_blocked" if not errors else "fail_closed"
    return {
        "schema_version": "scenario-late-cohorts-v31-ultra-verification-v1",
        "status": status,
        "errors": sorted(set(errors)),
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "counts": {
            "cohorts": 2,
            "atomic_transactions": 2,
            "atomic_size_each": 8,
            "assignments": len(all_ids),
            "features": features,
            "reserved_unallocated_identities": len(set(all_paths)),
            "empty_output_directories": empty_outputs,
            "results": 0,
            "receipts": 0,
            "native_capture_rows": 0,
            "activation_transactions": 0,
            "credit": 0,
        },
        "runtime": {
            "python": sys.version.split()[0],
            "jsonschema": importlib.metadata.version("jsonschema"),
            "validator": "Draft202012Validator",
        },
        "blockers": readiness.get("blockers", []),
        "protected_lineage_rows": len(lineage),
        "protected_lineage_sha256": sha(LINEAGE),
        "zero_state_inventory_sha256": sha(ZERO),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    _ = parser.parse_args()
    report = verify_preparation()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
