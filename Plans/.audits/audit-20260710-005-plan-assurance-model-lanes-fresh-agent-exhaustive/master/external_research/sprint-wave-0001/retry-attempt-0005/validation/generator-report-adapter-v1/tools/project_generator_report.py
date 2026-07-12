#!/usr/bin/env python3
"""Fail-closed projection of the nested Luna gate into frozen-generator aliases.

This module never invokes the activation generator and never writes a file.  The
CLI reads the pinned Luna report bytes once, verifies the bound immutable
controls and live zero state, and emits a deterministic projection bundle.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

ADAPTER_ROOT = Path(__file__).resolve().parents[1]
RETRY_ROOT = Path(__file__).resolve().parents[3]
AUDIT_ROOT = Path(__file__).resolve().parents[7]
REPO_ROOT = AUDIT_ROOT.parents[2]

SOURCE_REPORT = (RETRY_ROOT / "validation/luna-prelaunch.json").resolve()
SOURCE_REPORT_SHA256 = "b9fa0acea81bc77c26f624bb96793c69a84adf6cfb7b0a8e11bf011bacaf8218"
GENERATOR_SHA256 = "dc17b3d8580fb035beead86dcd2f42ab511dc6e58f3eeaa372af3919b360101a"
LOCAL_REPORT_SHA256 = "325d398e176a25bee424b24263d110e641e068a735527ad8d06ec845593cf9e3"
V6_SHA256 = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
V7_SHA256 = "4641936981927f732851267d66d7e90b0dc5eb2aa7898eea9e3d7895c1b292ed"
FLOOR_IDS = ["ER-0002", "ER-0001", "ER-0004", "ER-0005", "ER-0006", "ER-0007"]
FLOOR_DIGEST = "111135d1d44849d95577071398351634e899cf0689340919c6b855c239e859b6"
ATTEMPT4_FAILURE_SHA256 = "87ef882450567912176fb9248ed04b365a6354a0f6b2835c2572aa9962a8009d"
CONTROLLER_THREAD_ID = "019f5078-6501-7223-b52f-2251010bdc41"
MODEL = "gpt-5.6-luna"
EFFORT = "max"
ASSIGNMENT_IDS = ["ER-0003", "ER-0008"]
AGENT_PATHS = [
    "/root/a005_external_research_recovery_er_0003_attempt_0005_terminal",
    "/root/a005_external_research_recovery_er_0008_attempt_0005_terminal",
]

EXPECTED_REPORT_HASHES: dict[str, Any] = {
    "authority_sha256": "06cafe94c8ea4c02b3836eec77069e2fbd87433a3e2f4ca0eac173fba77c4081",
    "launch_seal_sha256": "8b658790bb247ada5edd31b44d246117050133a685aa7278a69acee8f737cac8",
    "manifest_sha256": "3c73119348a18f41069e41ae6f04be7e94bce54e90285aa1ad595829917fd483",
    "architecture_sha256": "880882ce9ec525bd0cc2c5717545fe0a838725367c9d8eb27c6fccf9f7048677",
    "lineage_sha256": "2755d29236fbb3776615c2bdeb00f9ac480950002dbe6ee8f596b115a8df398e",
    "activation_template_sha256": "e0b4652296fc31227c0d8e8daa3a5b7e92f6dfd29fbcd9fed0088e41bca58f7f",
    "leaf_prompt_sha256": "826fdd2867f8eeeb12ef183602f07cba9ab42284d9ff0de6e5be75f0cbf720fc",
    "initial_task_contract_sha256": "cbd7bd839f2021b3b5890bbc05da1df81c6884465af81dd8a4126eff5c35125d",
    "result_schema_sha256": "2be5b7638104cc71d4e72baea1834fcf249e0cbba2f2872259741c0b660d0bb8",
    "receipt_contract_sha256": "8ad9443dd92b09a8226eaa7d6d4366ce003d5b93168b9ec2e9d8452c3f0183a6",
    "native_capture_contract_sha256": "eefa29599b89db30ad7a0bbffdffd015d6f2c04c0ae3a7b38cfa1ea991cb4693",
    "validator_authority_sha256": "a430eb6f7b2babb135f51171162fb0ad7c9486984450a90b95a9f718e9be31a2",
    "activation_generator_sha256": GENERATOR_SHA256,
    "prelaunch_verifier_sha256": "b69bd64bb2a54af3adccd6e03eaff24e90c5aa56142dac33674da7426fcdd0b6",
    "postrun_validator_sha256": "b55fb55060a2076b6570efaed96e310f8133b4e7383ca022a29f4a7840d11a2c",
    "test_harness_sha256": "1bd80a5042e386f8cc55db1d5cf5d386165d93e230573beb505850b24ca940e9",
    "local_prelaunch_report_sha256": LOCAL_REPORT_SHA256,
    "packet_sha256": {
        "ER-0003": "1743eaa3a775cf18d113d56a54bbfd86cdc47a2034678d708d61aa25b28fad59",
        "ER-0008": "08254ebfe8df7d1e9c7354cb772b1f492132583040deab3eb3ad197aa8d9932f",
    },
    "intent_sha256": {
        "ER-0003": "41c093b4ca54e56e80964bfb935e6105ab9d7bcb6caf291269d3c4b0d818129e",
        "ER-0008": "829ef615d9853b92197487f8ade9c01fd0dec747f38fedf91158d507ca712821",
    },
    "attempt_0004_activation_sha256": "1a3b430d41d6b8507615fbb229df972bb5aa07dcd7ee5937a344df29f4e31301",
    "attempt_0004_failure_lineage_sha256": ATTEMPT4_FAILURE_SHA256,
    "concurrency_policy_v6_sha256": V6_SHA256,
    "concurrency_policy_v7_sha256": V7_SHA256,
}

REQUIRED_FIELDS = [
    "audit_id", "sprint_id", "retry_namespace", "attempt_id", "status", "gate_passed", "independent",
    "activation_transaction_authorized", "assignment_count", "assignment_ids", "agent_paths",
    "controller_thread_id", "model", "reasoning_effort", "fresh_direct_leaves", "fork_turns",
    "descendants_forbidden", "followups_forbidden", "retries_forbidden", "concurrency_policy_v6_sha256",
    "preserved_cumulative_floor_ids", "preserved_cumulative_floor_digest", "cumulative_floor_count",
    "attempt_0004_failure_lineage_sha256", "attempt_0004_outputs_empty", "attempt_0004_receipts",
    "attempt_0004_results", "attempt_0004_credit", "attempt_0005_outputs_empty", "attempt_0005_receipts",
    "attempt_0005_results", "attempt_0005_native_capture_rows", "attempt_0005_activation_transaction_files",
    "payload_hashes", "errors", "coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit",
]

BOUND = {
    "authority": RETRY_ROOT / "authority.json",
    "manifest": RETRY_ROOT / "manifest.json",
    "lineage": RETRY_ROOT / "lineage.json",
    "launch_seal": RETRY_ROOT / "launch_seal.json",
    "local_report": RETRY_ROOT / "validation/local-prelaunch-candidate.json",
    "attempt4_failure": RETRY_ROOT.parent / "retry-attempt-0004/validation/attempt-0004-failure-lineage.json",
    "v6": AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V6.json",
    "v7": AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V7.json",
}

LEGACY_TOP_LEVEL_ALIASES = set(REQUIRED_FIELDS) - {
    "audit_id", "status", "gate_passed", "controller_thread_id", "model", "reasoning_effort", "errors"
}


def canonical(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_path(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def read_json(path: Path) -> tuple[bytes, dict[str, Any], str]:
    raw = path.read_bytes()
    value = json.loads(raw.decode("utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"not_object:{path}")
    return raw, value, sha_bytes(raw)


def get_path(value: Any, path: str) -> Any:
    if not path.startswith("$." ):
        raise KeyError(path)
    current = value
    for token in path[2:].split("."):
        if not isinstance(current, dict) or token not in current:
            raise KeyError(path)
        current = current[token]
    return current


def source_ref(artifact: str, path: str, operator: str = "exact_copy", bound_sha256: str | None = None) -> dict[str, Any]:
    result = {"source_artifact": artifact, "source_path": path, "operator": operator}
    if bound_sha256 is not None:
        result["bound_sha256"] = bound_sha256
    return result


def current_output_dir(assignment_id: str) -> Path:
    return AUDIT_ROOT / "external_research_v1" / assignment_id / "attempts/attempt-0005"


def prior_output_dir(assignment_id: str) -> Path:
    return AUDIT_ROOT / "external_research_v1" / assignment_id / "attempts/attempt-0004"


def expected_payload_hashes(report: dict[str, Any], authority: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    candidate = report["candidate_hashes"]
    mapping: dict[str, Any] = {}

    direct = {
        "authority.json": ("luna_report", "$.candidate_hashes.authority_sha256"),
        "launch_seal.json": ("luna_report", "$.candidate_hashes.launch_seal_sha256"),
        "manifest.json": ("luna_report", "$.candidate_hashes.manifest_sha256"),
        "leaf_prompt.json": ("luna_report", "$.candidate_hashes.leaf_prompt_sha256"),
        "receipt_contract_v5.json": ("luna_report", "$.candidate_hashes.receipt_contract_sha256"),
        "native_capture_contract_v5.json": ("luna_report", "$.candidate_hashes.native_capture_contract_sha256"),
        "leaf_initial_task_contract.json": ("luna_report", "$.candidate_hashes.initial_task_contract_sha256"),
        "activation_transaction.template.json": ("luna_report", "$.candidate_hashes.activation_template_sha256"),
        "schema/external_research_result_v5.schema.json": ("luna_report", "$.candidate_hashes.result_schema_sha256"),
        "validation/VALIDATOR_AUTHORITY_V5.json": ("luna_report", "$.candidate_hashes.validator_authority_sha256"),
        "tools/generate_activation_transaction.py": ("luna_report", "$.candidate_hashes.activation_generator_sha256"),
        "tools/verify_prelaunch.py": ("luna_report", "$.candidate_hashes.prelaunch_verifier_sha256"),
        "tools/validate_postrun.py": ("luna_report", "$.candidate_hashes.postrun_validator_sha256"),
        "tools/test_attempt_0005.py": ("luna_report", "$.candidate_hashes.test_harness_sha256"),
        "validation/local-prelaunch-candidate.json": ("luna_report", "$.candidate_hashes.local_prelaunch_report_sha256"),
    }
    for target, (artifact, path) in direct.items():
        mapping[target] = source_ref(artifact, path)
    mapping["tools/common.py"] = source_ref("authority.json", "$.payload_hashes.tools/common.py", bound_sha256=sha_path(BOUND["authority"]))
    mapping["packets"] = source_ref("luna_report", "$.candidate_hashes.packet_sha256", bound_sha256=SOURCE_REPORT_SHA256)
    mapping["intents"] = source_ref("luna_report", "$.candidate_hashes.intent_sha256", bound_sha256=SOURCE_REPORT_SHA256)

    payload = {
        "authority.json": candidate["authority_sha256"],
        "launch_seal.json": candidate["launch_seal_sha256"],
        "manifest.json": candidate["manifest_sha256"],
        "leaf_prompt.json": candidate["leaf_prompt_sha256"],
        "receipt_contract_v5.json": candidate["receipt_contract_sha256"],
        "native_capture_contract_v5.json": candidate["native_capture_contract_sha256"],
        "leaf_initial_task_contract.json": candidate["initial_task_contract_sha256"],
        "activation_transaction.template.json": candidate["activation_template_sha256"],
        "schema/external_research_result_v5.schema.json": candidate["result_schema_sha256"],
        "validation/VALIDATOR_AUTHORITY_V5.json": candidate["validator_authority_sha256"],
        "tools/common.py": authority["payload_hashes"]["tools/common.py"],
        "tools/generate_activation_transaction.py": candidate["activation_generator_sha256"],
        "tools/verify_prelaunch.py": candidate["prelaunch_verifier_sha256"],
        "tools/validate_postrun.py": candidate["postrun_validator_sha256"],
        "tools/test_attempt_0005.py": candidate["test_harness_sha256"],
        "validation/local-prelaunch-candidate.json": candidate["local_prelaunch_report_sha256"],
        "packets": copy.deepcopy(candidate["packet_sha256"]),
        "intents": copy.deepcopy(candidate["intent_sha256"]),
    }
    return payload, mapping


def actual_payload_paths() -> dict[str, Any]:
    result: dict[str, Any] = {}
    for rel in [
        "authority.json", "launch_seal.json", "manifest.json", "leaf_prompt.json", "receipt_contract_v5.json",
        "native_capture_contract_v5.json", "leaf_initial_task_contract.json", "activation_transaction.template.json",
        "schema/external_research_result_v5.schema.json", "validation/VALIDATOR_AUTHORITY_V5.json", "tools/common.py",
        "tools/generate_activation_transaction.py", "tools/verify_prelaunch.py", "tools/validate_postrun.py", "tools/test_attempt_0005.py", "validation/local-prelaunch-candidate.json",
    ]:
        result[rel] = sha_path(RETRY_ROOT / rel)
    result["packets"] = {aid: sha_path(RETRY_ROOT / f"packets/{aid}.json") for aid in ASSIGNMENT_IDS}
    result["intents"] = {aid: sha_path(RETRY_ROOT / f"dispatch/{aid}/attempt-0005/dispatch_intent.json") for aid in ASSIGNMENT_IDS}
    return result


def zero_state_errors() -> list[str]:
    errors: list[str] = []
    tx = RETRY_ROOT / "activation-transaction"
    if tx.exists() and any(path.is_file() for path in tx.rglob("*")):
        errors.append("zero_state:activation_transaction_files")
    if (RETRY_ROOT / "activation.json").exists():
        errors.append("zero_state:activation_json")
    if (RETRY_ROOT / "runtime/native_capture.json").exists():
        errors.append("zero_state:native_capture")
    for aid in ASSIGNMENT_IDS:
        output = current_output_dir(aid)
        if not output.is_dir():
            errors.append(f"zero_state:{aid}:missing_output_directory")
        elif any(path.is_file() or path.is_dir() for path in output.iterdir()):
            errors.append(f"zero_state:{aid}:nonempty_output")
        if (RETRY_ROOT / f"dispatch/{aid}/attempt-0005/dispatch_receipt.json").exists():
            errors.append(f"zero_state:{aid}:receipt")
        if (output / "result.json").exists():
            errors.append(f"zero_state:{aid}:result")
    return sorted(set(errors))


def validate_bound_controls(report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    candidate = report["candidate_hashes"]
    actual_hashes = {
        "authority_sha256": sha_path(BOUND["authority"]),
        "launch_seal_sha256": sha_path(BOUND["launch_seal"]),
        "manifest_sha256": sha_path(BOUND["manifest"]),
        "lineage_sha256": sha_path(BOUND["lineage"]),
        "local_prelaunch_report_sha256": sha_path(BOUND["local_report"]),
        "attempt_0004_failure_lineage_sha256": sha_path(BOUND["attempt4_failure"]),
        "concurrency_policy_v6_sha256": sha_path(BOUND["v6"]),
        "concurrency_policy_v7_sha256": sha_path(BOUND["v7"]),
    }
    for key, value in actual_hashes.items():
        if candidate.get(key) != value:
            errors.append(f"bound_hash:{key}")
    try:
        _, authority, authority_sha = read_json(BOUND["authority"])
        _, manifest, manifest_sha = read_json(BOUND["manifest"])
        _, lineage, lineage_sha = read_json(BOUND["lineage"])
        _, local, local_sha = read_json(BOUND["local_report"])
        _, failure, failure_sha = read_json(BOUND["attempt4_failure"])
    except Exception as exc:
        return [f"bound_control_parse:{exc}"]
    if authority_sha != candidate["authority_sha256"] or manifest_sha != candidate["manifest_sha256"] or lineage_sha != candidate["lineage_sha256"] or local_sha != candidate["local_prelaunch_report_sha256"] or failure_sha != candidate["attempt_0004_failure_lineage_sha256"]:
        errors.append("bound_control_hash_closure")
    if authority.get("assignment_count") != 2 or authority.get("assignment_ids") != ASSIGNMENT_IDS or authority.get("agent_paths") != AGENT_PATHS:
        errors.append("authority:scope")
    if authority.get("model") != MODEL or authority.get("reasoning_effort") != EFFORT or authority.get("fresh_direct_leaves") != 2 or authority.get("fork_turns") != "none" or authority.get("descendants_forbidden") is not True or authority.get("followup_messages_forbidden") is not True or authority.get("retries_forbidden") is not True:
        errors.append("authority:lane")
    if authority.get("concurrency_policy_v6_sha256") != V6_SHA256 or authority.get("preserved_cumulative_floor_ids") != FLOOR_IDS or authority.get("preserved_cumulative_floor_digest") != FLOOR_DIGEST or authority.get("preserved_cumulative_floor_count") != 6:
        errors.append("authority:lineage")
    if authority.get("attempt_0004_result_count") != 0 or authority.get("attempt_0004_receipt_count") != 0 or authority.get("attempt_0004_credit") != 0:
        errors.append("authority:attempt4_zero")
    if authority.get("counts") != {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "output_files": 0, "receipts": 0, "results": 0, "native_capture_rows": 0, "activation_transaction_files": 0}:
        errors.append("authority:current_zero")
    if any(authority.get(key) != 0 for key in ["coverage_credit", "cumulative_research_credit", "promotion_credit", "spec_credit", "merge_credit"]):
        errors.append("authority:credit")
    if manifest.get("assignment_count") != 2 or manifest.get("assignment_ids") != ASSIGNMENT_IDS or manifest.get("preserved_cumulative_floor_count") != 6 or manifest.get("attempt_0004_failure_lineage_sha256") != ATTEMPT4_FAILURE_SHA256:
        errors.append("manifest:binding")
    if lineage.get("attempt_0004_result_count") != 0 or lineage.get("attempt_0004_receipt_count") != 0 or lineage.get("attempt_0004_credit") != 0 or lineage.get("preserved_cumulative_floor_ids") != FLOOR_IDS or lineage.get("preserved_cumulative_floor_digest") != FLOOR_DIGEST:
        errors.append("lineage:binding")
    if local.get("counts") != authority.get("counts") or local.get("errors") != []:
        errors.append("local:zero")
    if failure.get("status") != "TERMINAL_ZERO_CREDIT" or [row.get("assignment_id") for row in failure.get("assignments", [])] != ASSIGNMENT_IDS:
        errors.append("attempt4:lineage")
    for row in failure.get("assignments", []):
        if row.get("result_present") is not False or row.get("receipt_present") is not False or row.get("coverage_credit") != 0 or row.get("research_credit") != 0:
            errors.append(f"attempt4:{row.get('assignment_id')}:nonzero")
    for aid in ASSIGNMENT_IDS:
        old = prior_output_dir(aid)
        if not old.is_dir() or any(path.is_file() or path.is_dir() for path in old.iterdir()):
            errors.append(f"attempt4:{aid}:output")
    errors.extend(zero_state_errors())
    return sorted(set(errors))


def validate_source_report(report: dict[str, Any], supplied_sha256: str, source_path: Path) -> list[str]:
    errors: list[str] = []
    if source_path.resolve() != SOURCE_REPORT:
        errors.append("source:path")
    if supplied_sha256 != SOURCE_REPORT_SHA256:
        errors.append("source:sha_pin")
    if report.get("status") != "pass" or report.get("errors") != [] or report.get("gate_passed") is not True:
        errors.append("source:gate")
    strict = report.get("strict_tests", {})
    if strict.get("test_count") != 114 or strict.get("passed") != 114 or strict.get("failed") != 0 or strict.get("all_true") is not True or strict.get("test_digest") != "0bb6e2a985fd273aedf4fc12930d5f7071ec27face30c7f5d21852f5d97ab0d5":
        errors.append("source:strict_tests")
    independent = report.get("independent_comparison", {})
    if independent.get("independent_structural_check_count") != 117 or independent.get("independent_structural_checks_passed") != 117 or independent.get("independent_structural_errors") != []:
        errors.append("source:independent_checks")
    scope = report.get("scope", {})
    if scope.get("sprint_id") != "sprint-wave-0001" or scope.get("retry_namespace") != "retry-attempt-0005" or scope.get("attempt_id") != "attempt-0005" or scope.get("assignment_ids") != ASSIGNMENT_IDS or scope.get("assignment_count") != 2 or scope.get("model") != MODEL or scope.get("reasoning_effort") != EFFORT or scope.get("fresh_direct_leaf_count") != 2 or scope.get("fork_turns") != "none" or scope.get("descendants_forbidden") is not True or scope.get("followups_forbidden") is not True or scope.get("retries_forbidden") is not True:
        errors.append("source:scope")
    lineage = report.get("lineage_and_policy", {})
    if lineage.get("concurrency_policy_v6_sha256") != V6_SHA256 or lineage.get("preserved_cumulative_floor_ids") != FLOOR_IDS or lineage.get("preserved_cumulative_floor_digest") != FLOOR_DIGEST or lineage.get("v7_binding") != "scheduling-only; V6 remains the immutable semantic binding inside attempt-0005 preparation":
        errors.append("source:lineage")
    if report.get("controller_thread_id") != CONTROLLER_THREAD_ID or report.get("model") != MODEL or report.get("reasoning_effort") != EFFORT:
        errors.append("source:controller")
    candidate = report.get("candidate_hashes")
    if candidate != EXPECTED_REPORT_HASHES:
        errors.append("source:candidate_hashes")
    zero = report.get("zero_state", {})
    expected_zero = {
        "activation_transaction_files": 0, "activation_transaction_paths": [], "activation_json_present": False, "empty_output_directories": 2,
        "output_files": 0, "result_files": 0, "receipt_files": 0, "native_capture_rows": 0,
        "output_inventory": {"ER-0003": [], "ER-0008": []}, "activation_granted": False,
        "launch_authorized": False, "prevalidation_credit": 0,
    }
    if zero != expected_zero:
        errors.append("source:zero_state")
    tx = report.get("transaction_contract", {})
    if tx.get("current_activation_granted") is not False or tx.get("current_launch_authorized") is not False or tx.get("live_transaction_files") != 0 or tx.get("no_circular_hash_dependency") is not True:
        errors.append("source:transaction_state")
    credits = report.get("credits", {})
    if credits != {"coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0}:
        errors.append("source:credits")
    if report.get("canonical_plan_changes") is not False:
        errors.append("source:canonical_changes")
    if report.get("activation", {}).get("independent_prelaunch_path") != str(SOURCE_REPORT) or report.get("activation", {}).get("independent_prelaunch_sha256_required_at_invocation") is not True:
        errors.append("source:activation_binding")
    if any(key in report for key in LEGACY_TOP_LEVEL_ALIASES):
        errors.append("source:ambiguous_legacy_alias")
    return sorted(set(errors))


def schema_errors(payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if set(payload) != set(REQUIRED_FIELDS):
        errors.append("projection:exact_key_set")
    if payload.get("status") != "pass" or payload.get("errors") != []:
        errors.append("projection:status")
    if payload.get("assignment_ids") != ASSIGNMENT_IDS or payload.get("agent_paths") != AGENT_PATHS:
        errors.append("projection:scope")
    if payload.get("model") != MODEL or payload.get("reasoning_effort") != EFFORT or payload.get("concurrency_policy_v6_sha256") != V6_SHA256:
        errors.append("projection:lane")
    if payload.get("coverage_credit") != 0 or payload.get("research_credit") != 0 or payload.get("promotion_credit") != 0 or payload.get("spec_credit") != 0 or payload.get("merge_credit") != 0:
        errors.append("projection:credit")
    if not isinstance(payload.get("payload_hashes"), dict) or set(payload.get("payload_hashes", {})) != {
        "authority.json", "launch_seal.json", "manifest.json", "leaf_prompt.json", "receipt_contract_v5.json",
        "native_capture_contract_v5.json", "leaf_initial_task_contract.json", "activation_transaction.template.json",
        "schema/external_research_result_v5.schema.json", "validation/VALIDATOR_AUTHORITY_V5.json", "tools/common.py",
        "tools/generate_activation_transaction.py", "tools/verify_prelaunch.py", "tools/validate_postrun.py", "tools/test_attempt_0005.py", "validation/local-prelaunch-candidate.json",
        "packets", "intents",
    }:
        errors.append("projection:payload_hash_set")
    return sorted(set(errors))


def build_payload(report: dict[str, Any], authority: dict[str, Any], manifest: dict[str, Any], lineage: dict[str, Any], bound_payload_hashes: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    scope = report["scope"]
    zero = report["zero_state"]
    tx = report["transaction_contract"]
    core = tx["activation_core_contract"]
    payload = {
        "audit_id": report["audit_id"],
        "sprint_id": scope["sprint_id"],
        "retry_namespace": scope["retry_namespace"],
        "attempt_id": scope["attempt_id"],
        "status": report["status"],
        "gate_passed": report["gate_passed"],
        "independent": report["gate_passed"],
        "activation_transaction_authorized": core["activation_granted"],
        "assignment_count": scope["assignment_count"],
        "assignment_ids": copy.deepcopy(scope["assignment_ids"]),
        "agent_paths": copy.deepcopy(report["identity_separation"]["current_agent_paths"]),
        "controller_thread_id": report["controller_thread_id"],
        "model": report["model"],
        "reasoning_effort": report["reasoning_effort"],
        "fresh_direct_leaves": scope["fresh_direct_leaf_count"],
        "fork_turns": scope["fork_turns"],
        "descendants_forbidden": scope["descendants_forbidden"],
        "followups_forbidden": scope["followups_forbidden"],
        "retries_forbidden": scope["retries_forbidden"],
        "concurrency_policy_v6_sha256": report["lineage_and_policy"]["concurrency_policy_v6_sha256"],
        "preserved_cumulative_floor_ids": copy.deepcopy(report["lineage_and_policy"]["preserved_cumulative_floor_ids"]),
        "preserved_cumulative_floor_digest": report["lineage_and_policy"]["preserved_cumulative_floor_digest"],
        "cumulative_floor_count": manifest["preserved_cumulative_floor_count"],
        "attempt_0004_failure_lineage_sha256": report["lineage_and_policy"]["attempt_0004_failure_lineage_sha256"],
        "attempt_0004_outputs_empty": True,
        "attempt_0004_receipts": authority["attempt_0004_receipt_count"],
        "attempt_0004_results": authority["attempt_0004_result_count"],
        "attempt_0004_credit": authority["attempt_0004_credit"],
        "attempt_0005_outputs_empty": True,
        "attempt_0005_receipts": zero["receipt_files"],
        "attempt_0005_results": zero["result_files"],
        "attempt_0005_native_capture_rows": zero["native_capture_rows"],
        "attempt_0005_activation_transaction_files": zero["activation_transaction_files"],
        "payload_hashes": copy.deepcopy(bound_payload_hashes),
        "errors": copy.deepcopy(report["errors"]),
        "coverage_credit": report["credits"]["coverage_credit"],
        "research_credit": report["credits"]["research_credit"],
        "promotion_credit": report["credits"]["promotion_credit"],
        "spec_credit": report["credits"]["spec_credit"],
        "merge_credit": report["credits"]["merge_credit"],
    }
    projection_map: dict[str, Any] = {
        "audit_id": source_ref("luna_report", "$.audit_id"),
        "sprint_id": source_ref("luna_report", "$.scope.sprint_id"),
        "retry_namespace": source_ref("luna_report", "$.scope.retry_namespace"),
        "attempt_id": source_ref("luna_report", "$.scope.attempt_id"),
        "status": source_ref("luna_report", "$.status"),
        "gate_passed": source_ref("luna_report", "$.gate_passed"),
        "independent": source_ref("luna_report", "$.gate_passed", "exact_alias_of_independent_gate_pass"),
        "activation_transaction_authorized": source_ref("luna_report", "$.transaction_contract.activation_core_contract.activation_granted"),
        "assignment_count": source_ref("luna_report", "$.scope.assignment_count"),
        "assignment_ids": source_ref("luna_report", "$.scope.assignment_ids"),
        "agent_paths": source_ref("luna_report", "$.identity_separation.current_agent_paths"),
        "controller_thread_id": source_ref("luna_report", "$.controller_thread_id"),
        "model": source_ref("luna_report", "$.model"),
        "reasoning_effort": source_ref("luna_report", "$.reasoning_effort"),
        "fresh_direct_leaves": source_ref("luna_report", "$.scope.fresh_direct_leaf_count"),
        "fork_turns": source_ref("luna_report", "$.scope.fork_turns"),
        "descendants_forbidden": source_ref("luna_report", "$.scope.descendants_forbidden"),
        "followups_forbidden": source_ref("luna_report", "$.scope.followups_forbidden"),
        "retries_forbidden": source_ref("luna_report", "$.scope.retries_forbidden"),
        "concurrency_policy_v6_sha256": source_ref("luna_report", "$.lineage_and_policy.concurrency_policy_v6_sha256"),
        "preserved_cumulative_floor_ids": source_ref("luna_report", "$.lineage_and_policy.preserved_cumulative_floor_ids"),
        "preserved_cumulative_floor_digest": source_ref("luna_report", "$.lineage_and_policy.preserved_cumulative_floor_digest"),
        "cumulative_floor_count": source_ref("manifest.json", "$.preserved_cumulative_floor_count", "exact_bound_control_copy", sha_path(BOUND["manifest"])),
        "attempt_0004_failure_lineage_sha256": source_ref("luna_report", "$.lineage_and_policy.attempt_0004_failure_lineage_sha256"),
        "attempt_0004_outputs_empty": source_ref("attempt-0004-failure-lineage.json + filesystem", "$.assignments[*].result_present/receipt_present + attempt-0004 output inventories", "verified_zero_state_alias", sha_path(BOUND["attempt4_failure"])),
        "attempt_0004_receipts": source_ref("authority.json", "$.attempt_0004_receipt_count", "exact_bound_control_copy", sha_path(BOUND["authority"])),
        "attempt_0004_results": source_ref("authority.json", "$.attempt_0004_result_count", "exact_bound_control_copy", sha_path(BOUND["authority"])),
        "attempt_0004_credit": source_ref("authority.json", "$.attempt_0004_credit", "exact_bound_control_copy", sha_path(BOUND["authority"])),
        "attempt_0005_outputs_empty": source_ref("luna_report + filesystem", "$.zero_state.output_inventory + attempt-0005 output inventories", "verified_zero_state_alias", SOURCE_REPORT_SHA256),
        "attempt_0005_receipts": source_ref("luna_report", "$.zero_state.receipt_files"),
        "attempt_0005_results": source_ref("luna_report", "$.zero_state.result_files"),
        "attempt_0005_native_capture_rows": source_ref("luna_report", "$.zero_state.native_capture_rows"),
        "attempt_0005_activation_transaction_files": source_ref("luna_report", "$.zero_state.activation_transaction_files"),
        "payload_hashes": source_ref("luna_report + authority.json", "$.candidate_hashes + $.payload_hashes.tools/common.py", "bound_hash_rekey", sha_path(BOUND["authority"])),
        "errors": source_ref("luna_report", "$.errors"),
        "coverage_credit": source_ref("luna_report", "$.credits.coverage_credit"),
        "research_credit": source_ref("luna_report", "$.credits.research_credit"),
        "promotion_credit": source_ref("luna_report", "$.credits.promotion_credit"),
        "spec_credit": source_ref("luna_report", "$.credits.spec_credit"),
        "merge_credit": source_ref("luna_report", "$.credits.merge_credit"),
    }
    return payload, projection_map


def project_from_captured(raw: bytes, supplied_sha256: str, source_path: Path) -> dict[str, Any]:
    actual_sha256 = sha_bytes(raw)
    if actual_sha256 != supplied_sha256:
        raise ValueError("source:captured_sha_mismatch")
    report = json.loads(raw.decode("utf-8"))
    if not isinstance(report, dict):
        raise ValueError("source:not_object")
    errors = validate_source_report(report, supplied_sha256, source_path)
    errors.extend(validate_bound_controls(report))
    if errors:
        raise ValueError(";".join(sorted(set(errors))))
    _, authority, _ = read_json(BOUND["authority"])
    _, manifest, _ = read_json(BOUND["manifest"])
    _, lineage, _ = read_json(BOUND["lineage"])
    bound_payload_hashes, _ = expected_payload_hashes(report, authority)
    expected_actual = actual_payload_paths()
    if bound_payload_hashes != expected_actual:
        raise ValueError("payload:bound_hash_closure")
    payload, projection_map = build_payload(report, authority, manifest, lineage, bound_payload_hashes)
    errors = schema_errors(payload)
    if errors:
        raise ValueError(";".join(errors))
    payload_sha256 = sha_bytes(canonical(payload))
    bundle = {
        "schema_version": "external-research-generator-report-adapter-projection-v1",
        "source_report_path": str(SOURCE_REPORT),
        "source_report_sha256": supplied_sha256,
        "projection_payload": payload,
        "projection_payload_sha256": payload_sha256,
        "projection_map": projection_map,
        "state": {
            "status": "READY_FOR_INDEPENDENT_ADAPTER_VALIDATION",
            "source_report_passed": True,
            "bound_controls_hash_verified": True,
            "zero_state_verified": True,
            "generator_invocation_performed": False,
            "activation_granted": False,
            "launch_authorized": False,
            "cannot_authorize_different_assignment": True,
            "cannot_authorize_different_model_or_effort": True,
            "cannot_authorize_different_policy": True,
            "cannot_authorize_different_path": True,
            "cannot_authorize_nonzero_state": True,
            "coverage_credit": 0,
            "research_credit": 0,
            "promotion_credit": 0,
            "spec_credit": 0,
            "merge_credit": 0,
        },
    }
    return bundle


def exact_payload(bundle: dict[str, Any]) -> dict[str, Any]:
    payload = bundle.get("projection_payload")
    if not isinstance(payload, dict):
        raise ValueError("projection:missing_payload")
    if bundle.get("projection_payload_sha256") != sha_bytes(canonical(payload)):
        raise ValueError("projection:payload_digest")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-report", required=True, type=Path)
    parser.add_argument("--source-report-sha256", required=True)
    args = parser.parse_args()
    source_path = args.source_report.resolve()
    try:
        raw = source_path.read_bytes()
        bundle = project_from_captured(raw, args.source_report_sha256, source_path)
        exact_payload(bundle)
    except Exception as exc:
        print(json.dumps({"status": "fail_closed", "errors": [str(exc)]}, sort_keys=True))
        raise SystemExit(1)
    print(json.dumps(bundle, ensure_ascii=False, sort_keys=True, indent=2))


if __name__ == "__main__":
    main()
