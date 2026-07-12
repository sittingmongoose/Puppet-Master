#!/usr/bin/env python3
"""Prepare the seven-leaf Audit 005 external-research recovery attempt-0003."""

from __future__ import annotations

import copy
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
SPRINT = "sprint-wave-0001"
RETRY_NAME = "retry-attempt-0003"
ATTEMPT = "attempt-0003"
CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"
MODEL = "gpt-5.6-luna"
EFFORT = "max"
RECOVERY_IDS = ["ER-0001", "ER-0003", "ER-0004", "ER-0005", "ER-0006", "ER-0007", "ER-0008"]
FLOOR_ID = "ER-0002"
NAMESPACE = ROOT / "master/external_research" / SPRINT / RETRY_NAME
OUTPUT_ROOT = ROOT / "external_research_v1"
ATTEMPT2 = ROOT / "master/external_research" / SPRINT / "retry-attempt-0002"
LUNA_REF = "master/external_research/sprint-wave-0001/retry-attempt-0002/validation/postrun-v3/luna-postrun-v3.json"
LUNA_SHA256 = "3f5fff2bbec66aa50bd9ae73facc4f5ae61658da4277259d8638954626161913"
PRIMARY_REF = "master/external_research/sprint-wave-0001/retry-attempt-0002/validation/postrun-v3/primary-postrun-v3.json"
PRIMARY_SHA256 = "44e5f6dd544a0a5c73c757c65a8ce7b42b8f421b7e6bedc93077d992f46408f6"
QUESTION_REF = "master/external_research/sprint-wave-0001/retry-attempt-0002/manifest-question-binding-supersession-v3.json"
QUESTION_SHA256 = "bbb180743a9cc818be5fb28ac779c8ac276630765c014ad6460f3631bd917d55"
POLICY_REF = "master/coordination/CONCURRENCY_POLICY_V5.json"
POLICY_SHA256 = "a87927157be59c448801bbd4cec157670609c4502fb18baa0afbe8d516fdb439"
PRIOR_POLICY_REF = "master/coordination/CONCURRENCY_POLICY_V4.json"
PRIOR_POLICY_SHA256 = "36a4cdcc5b876538c4197096d60febffc5e6ec3ab132e93529755e6daae0ad7f"


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def digest(value: Any) -> str:
    return sha_bytes(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not object:{path}")
    return value


def write_obj(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value))


def expected_agent(aid: str) -> str:
    return f"/root/a005_external_research_recovery_er_{aid[-4:]}_attempt_0003_terminal"


def result_schema_v3() -> dict[str, Any]:
    schema = copy.deepcopy(load_obj(ATTEMPT2 / "schema/external_research_result_v2.schema.json"))
    schema["$id"] = "external-research-result-v3"
    schema["title"] = "Audit 005 external research recovery result v3"
    schema["required"].remove("task_thread_id")
    schema["properties"].pop("task_thread_id")
    schema["properties"]["schema_version"]["const"] = "external-research-result-v3"
    schema["properties"]["attempt_id"]["const"] = ATTEMPT
    schema["properties"]["assignment_id"]["pattern"] = r"^ER-000[1345678]$"
    schema["properties"]["agent_path"]["pattern"] = r"^/root/a005_external_research_recovery_er_000[1345678]_attempt_0003_terminal$"
    attestation = schema["properties"]["self_attestation"]
    for key in ("fresh_current_public_web_research_redone", "attempt_0002_results_and_peer_outputs_not_read", "canonical_agent_path_is_only_leaf_known_identity", "native_identity_deferred_to_controller_receipt_and_capture"):
        attestation["required"].append(key)
        attestation["properties"][key] = {"type": "boolean", "const": True}
    return schema


def leaf_prompt() -> dict[str, Any]:
    return {
        "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-leaf-prompt-v3", "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "controller_thread_id": CONTROLLER,
        "model": MODEL, "reasoning_effort": EFFORT,
        "prompt": (
            "Execute only the assigned Audit 005 external-research recovery attempt-0003. Read only your dispatch intent, its one packet, "
            "the result schema v3, and live public-web sources. Do not read attempt-0002 results, peer outputs, prior semantic findings, "
            "or unrelated audit artifacts. Independently redo current public-web research for the exact topic and every packet question. "
            "Prefer official standards, official product documentation, primary research, and mature open-source documentation. Use direct "
            "absolute HTTPS URLs, explicit evidence classes, bound source URLs, failure modes, implications, novel ideas, and unresolved "
            "questions. Do not copy prior semantic output. Your result must contain the canonical agent_path from the intent and must not "
            "contain task_thread_id or any native thread/turn identifier: a leaf cannot know those Codex-native identities. The controller "
            "alone writes a receipt after spawn identity and terminal result exist; later native capture independently binds native thread "
            "and turn IDs. Write exactly one result.json, spawn no descendants, accept no follow-up or retry, and return exactly PMR1."
        ),
    }


def receipt_contract() -> dict[str, Any]:
    required = [
        "schema_version", "audit_id", "sprint_id", "retry_namespace", "assignment_id", "attempt_id",
        "controller_thread_id", "agent_path", "task_thread_id", "native_child_thread_id", "model",
        "reasoning_effort", "fresh_child", "fork_turns", "descendants_forbidden", "followup_messages_forbidden",
        "retries_forbidden", "packet_id", "packet_path", "packet_sha256", "dispatch_intent_path",
        "dispatch_intent_sha256", "output_directory", "result_path", "result_sha256", "output_sha256",
        "terminal_turn_status", "terminal_response_prefix", "receipt_written_after_spawn_and_terminal",
        "result_contains_task_thread_id", "native_capture_binding_deferred", "coverage_credit", "research_credit",
        "promotion_credit", "spec_credit", "merge_credit",
    ]
    return {
        "audit_id": AUDIT_ID, "schema_version": "external-research-receipt-contract-v3", "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "prepared_zero_receipts",
        "required_fields": required,
        "exact_values": {"controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT,
                         "fresh_child": True, "fork_turns": "none", "descendants_forbidden": True,
                         "followup_messages_forbidden": True, "retries_forbidden": True,
                         "terminal_turn_status": "completed", "terminal_response_prefix": "PMR1",
                         "receipt_written_after_spawn_and_terminal": True, "result_contains_task_thread_id": False,
                         "native_capture_binding_deferred": True},
        "identity_separation": {
            "result": "agent_path only; task_thread_id and all native IDs are forbidden result keys",
            "receipt": "controller binds task_thread_id and native_child_thread_id to the spawned native child identity after terminal result exists",
            "native_capture": "independent capture binds native child thread and turn IDs from Codex thread state",
            "postrun_join": "result.agent_path plus receipt native identity plus native capture must agree per assignment",
        },
        "receipt_written_only_after": "spawn identity exists, result.json exists and hashes, terminal status is completed, and terminal token is PMR1",
        "duplicate_receipts_forbidden": True, "current_receipt_count": 0, "current_result_count": 0,
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }


def main() -> None:
    if NAMESPACE.exists():
        raise RuntimeError("refusing to overwrite retry-attempt-0003 namespace")
    for aid in RECOVERY_IDS:
        if (OUTPUT_ROOT / aid / "attempts" / ATTEMPT).exists():
            raise RuntimeError(f"refusing to overwrite attempt-0003 output:{aid}")
    pins = {LUNA_REF: LUNA_SHA256, PRIMARY_REF: PRIMARY_SHA256, QUESTION_REF: QUESTION_SHA256,
            POLICY_REF: POLICY_SHA256, PRIOR_POLICY_REF: PRIOR_POLICY_SHA256}
    for ref, expected in pins.items():
        path = ROOT / ref
        if not path.is_file() or sha(path) != expected:
            raise RuntimeError(f"input hash mismatch:{ref}")
    luna = load_obj(ROOT / LUNA_REF)
    independent = luna.get("independent_derivation", {})
    if luna.get("status") != "fail_closed" or independent.get("eligible_assignment_ids") != [FLOOR_ID] or independent.get("rejected_assignment_ids") != RECOVERY_IDS:
        raise RuntimeError("Luna recovery-set authority mismatch")
    luna_credit = luna.get("credit_contract", {})
    if any(luna_credit.get(key) != 0 for key in ("research_credit", "coverage_credit", "promotion_credit", "spec_credit", "merge_credit")):
        raise RuntimeError("Luna report does not preserve zero credit")
    primary = load_obj(ROOT / PRIMARY_REF)
    source_manifest = load_obj(ATTEMPT2 / "manifest.json")
    source_assignments = {row["assignment_id"]: row for row in source_manifest["assignments"]}

    NAMESPACE.mkdir(parents=True)
    (NAMESPACE / "schema").mkdir()
    (NAMESPACE / "packets").mkdir()
    write_obj(NAMESPACE / "schema/external_research_result_v3.schema.json", result_schema_v3())
    write_obj(NAMESPACE / "leaf_prompt.json", leaf_prompt())
    write_obj(NAMESPACE / "receipt_contract_v3.json", receipt_contract())
    assignments: list[dict[str, Any]] = []
    for sequence, aid in enumerate(RECOVERY_IDS, 1):
        original_packet_path = ATTEMPT2 / "packets" / f"{aid}.json"
        original = load_obj(original_packet_path)
        source = source_assignments[aid]
        output = OUTPUT_ROOT / aid / "attempts" / ATTEMPT
        output.mkdir(parents=True)
        packet_id = f"ER3PKT-{sequence:04d}"
        packet_path = NAMESPACE / "packets" / f"{aid}.json"
        intent_path = NAMESPACE / "dispatch" / aid / ATTEMPT / "dispatch_intent.json"
        agent_path = expected_agent(aid)
        packet = {
            "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-packet-v3", "sprint_id": SPRINT,
            "retry_namespace": RETRY_NAME, "assignment_id": aid, "attempt_id": ATTEMPT, "packet_id": packet_id,
            "topic": original["topic"], "owner_domains": original["owner_domains"], "feature_refs": original["feature_refs"],
            "broad_cross_cutting": original["broad_cross_cutting"], "research_questions": original["research_questions"],
            "research_focus": original["research_focus"], "source_policy": original["source_policy"],
            "original_packet_ref": str(original_packet_path), "original_packet_sha256": sha(original_packet_path),
            "packet_path": str(packet_path), "schema_path": str(NAMESPACE / "schema/external_research_result_v3.schema.json"),
            "leaf_prompt_path": str(NAMESPACE / "leaf_prompt.json"), "output_directory": str(output),
            "output_path": str(output / "result.json"), "dispatch_intent_path": str(intent_path),
            "canonical_agent_path": agent_path, "controller_thread_id": CONTROLLER, "model": MODEL,
            "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none", "descendants_forbidden": True,
            "followup_messages_forbidden": True, "retries_forbidden": True,
            "identity_separation": "result has canonical agent_path only; native identities are controller receipt and independent capture data",
            "forbidden_inputs": ["attempt-0002 results", "peer outputs", "prior semantic findings"],
            "prevalidation_credit": 0, "research_credit": 0, "activation_granted": False,
        }
        write_obj(packet_path, packet)
        assignment = {
            "assignment_id": aid, "recovery_sequence": sequence, "attempt_id": ATTEMPT, "topic": packet["topic"],
            "owner_domains": packet["owner_domains"], "feature_refs": packet["feature_refs"],
            "research_questions": packet["research_questions"], "packet_ref": str(packet_path),
            "packet_sha256": sha(packet_path), "dispatch_intent_ref": str(intent_path),
            "output_directory": str(output), "output_path": str(output / "result.json"),
            "receipt_path": str(intent_path.with_name("dispatch_receipt.json")), "canonical_agent_path": agent_path,
            "model": MODEL, "reasoning_effort": EFFORT, "task_thread_id": None, "native_child_thread_id": None,
            "native_child_turn_id": None, "prevalidation_credit": 0, "research_credit": 0,
        }
        intent = {
            "audit_id": AUDIT_ID, "schema_version": "external-research-dispatch-intent-v3", "sprint_id": SPRINT,
            "retry_namespace": RETRY_NAME, "assignment_id": aid, "attempt_id": ATTEMPT, "packet_id": packet_id,
            "packet_path": str(packet_path), "packet_sha256": assignment["packet_sha256"],
            "schema_path": str(NAMESPACE / "schema/external_research_result_v3.schema.json"),
            "leaf_prompt_path": str(NAMESPACE / "leaf_prompt.json"), "receipt_contract_path": str(NAMESPACE / "receipt_contract_v3.json"),
            "output_directory": str(output), "output_path": str(output / "result.json"),
            "receipt_path": assignment["receipt_path"], "controller_thread_id": CONTROLLER, "agent_path": agent_path,
            "task_thread_id": None, "native_child_thread_id": None, "native_child_turn_id": None,
            "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none",
            "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True,
            "result_identity_rule": "result must contain agent_path and must omit task_thread_id and every native identity",
            "receipt_identity_rule": "controller receipt later binds task_thread_id/native_child_thread_id after spawn and terminal result",
            "capture_identity_rule": "independent native capture later binds native child thread and turn IDs",
            "launch_state": "NOT_LAUNCHED", "activation_granted": False, "prevalidation_credit": 0, "research_credit": 0,
        }
        write_obj(intent_path, intent)
        assignment["dispatch_intent_sha256"] = sha(intent_path)
        assignments.append(assignment)

    write_obj(NAMESPACE / "manifest.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-manifest-v3", "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "PREPARED_NOT_LAUNCHED",
        "assignment_count": 7, "assignment_ids": RECOVERY_IDS, "preserved_floor_assignment_id": FLOOR_ID,
        "assignments": assignments, "controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT,
        "active_semantic_cap": 7, "concurrency_policy_v5_sha256": POLICY_SHA256,
        "prior_concurrency_policy_v4_sha256": PRIOR_POLICY_SHA256,
        "cumulative_credit_before_postrun": 0,
    })
    write_obj(NAMESPACE / "lineage.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-lineage-v3", "sprint_id": SPRINT,
        "authoritative_luna_report_ref": LUNA_REF, "authoritative_luna_report_sha256": LUNA_SHA256,
        "contradicted_primary_report_ref": PRIMARY_REF, "contradicted_primary_report_sha256": PRIMARY_SHA256,
        "contradicted_primary_disposition": "preserved_lineage_not_credit_authority",
        "question_binding_ref": QUESTION_REF, "question_binding_sha256": QUESTION_SHA256,
        "attempt_0001_disposition": "immutable_zero_credit", "attempt_0002_preserved_floor": FLOOR_ID,
        "recovery_assignment_ids": RECOVERY_IDS, "attempt_0002_results_forbidden_to_leaves": True,
    })
    write_obj(NAMESPACE / "architecture.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-architecture-v3",
        "identity_separation": {
            "leaf_result": "canonical agent_path only; task_thread_id/native IDs are forbidden and unknowable",
            "controller_receipt": "sole authority for task_thread_id/native_child_thread_id after spawn and terminal result",
            "independent_capture": "binds native child thread and turn IDs from Codex thread state",
            "postrun_join": "result.agent_path + receipt task/native identity + native capture must agree per assignment",
        },
        "assignment_count": 7, "active_semantic_cap": 7, "concurrency_policy_v5_ref": POLICY_REF,
        "concurrency_policy_v5_sha256": POLICY_SHA256, "prior_concurrency_policy_v4_ref": PRIOR_POLICY_REF,
        "prior_concurrency_policy_v4_sha256": PRIOR_POLICY_SHA256, "preserved_floor_assignment_id": FLOOR_ID,
        "cumulative_exact_eligibility_target": 8, "cumulative_credit_before_independent_postrun": 0,
    })
    test = subprocess.run(["python3", "-B", "test_external_research_retry_attempt_0003.py"], cwd=ROOT, capture_output=True, text=True)
    if test.returncode or json.loads(test.stdout).get("status") != "pass":
        raise RuntimeError(f"negative tests failed:{test.stdout}:{test.stderr}")
    payload_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file())
    authority = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-authority-v3", "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "PREPARED_ZERO_LAUNCH_ZERO_CREDIT",
        "assignment_count": 7, "assignment_ids": RECOVERY_IDS, "preserved_floor_assignment_id": FLOOR_ID,
        "active_semantic_cap": 7, "concurrency_policy_v5_sha256": POLICY_SHA256,
        "prior_concurrency_policy_v4_sha256": PRIOR_POLICY_SHA256,
        "authoritative_luna_report_sha256": LUNA_SHA256, "contradicted_primary_report_sha256": PRIMARY_SHA256,
        "manifest_sha256": sha(NAMESPACE / "manifest.json"), "lineage_sha256": sha(NAMESPACE / "lineage.json"),
        "architecture_sha256": sha(NAMESPACE / "architecture.json"), "leaf_prompt_sha256": sha(NAMESPACE / "leaf_prompt.json"),
        "result_schema_v3_sha256": sha(NAMESPACE / "schema/external_research_result_v3.schema.json"),
        "receipt_contract_v3_sha256": sha(NAMESPACE / "receipt_contract_v3.json"),
        "packet_set_digest": digest({row["assignment_id"]: row["packet_sha256"] for row in assignments}),
        "intent_set_digest": digest({row["assignment_id"]: row["dispatch_intent_sha256"] for row in assignments}),
        "payload_file_digest": digest({str(path.relative_to(NAMESPACE)): sha(path) for path in payload_files}),
        "preparation_script_sha256": sha(ROOT / "prepare_external_research_retry_attempt_0003.py"),
        "verifier_script_sha256": sha(ROOT / "verify_external_research_retry_attempt_0003.py"),
        "validator_script_sha256": sha(ROOT / "validate_external_research_retry_attempt_0003.py"),
        "test_script_sha256": sha(ROOT / "test_external_research_retry_attempt_0003.py"),
        "identity_contract": "result agent_path only; controller receipt owns native thread identity; independent capture owns native turn evidence",
        "activation_granted": False, "receipts": 0, "results": 0, "native_capture_rows": 0,
        "cumulative_research_credit": 0, "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    write_obj(NAMESPACE / "authority.json", authority)
    seal_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file())
    write_obj(NAMESPACE / "launch_seal.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-recovery-launch-seal-v3", "sprint_id": SPRINT,
        "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "CANDIDATE_AWAITING_INDEPENDENT_PRELAUNCH",
        "authority_sha256": sha(NAMESPACE / "authority.json"),
        "sealed_payload_digest": digest({str(path.relative_to(NAMESPACE)): sha(path) for path in seal_files}),
        "assignment_count": 7, "active_semantic_cap": 7, "activation_granted": False,
        "receipts": 0, "results": 0, "native_capture_rows": 0, "cumulative_research_credit": 0,
    })
    verify = subprocess.run(["python3", "-B", "verify_external_research_retry_attempt_0003.py"], cwd=ROOT, capture_output=True, text=True)
    report = json.loads(verify.stdout) if verify.stdout else {"status": "fail", "errors": [verify.stderr]}
    if verify.returncode or report.get("status") != "pass":
        raise RuntimeError(f"prelaunch verifier failed:{report}")
    write_obj(NAMESPACE / "validation/local-prelaunch-candidate.json", report)
    print(json.dumps({"status": "prepared_zero_launch_zero_credit", "assignments": 7,
                      "mapping": {row["assignment_id"]: row["canonical_agent_path"] for row in assignments},
                      "authority_sha256": sha(NAMESPACE / "authority.json"), "launch_seal_sha256": sha(NAMESPACE / "launch_seal.json"),
                      "local_prelaunch_sha256": sha(NAMESPACE / "validation/local-prelaunch-candidate.json")}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
