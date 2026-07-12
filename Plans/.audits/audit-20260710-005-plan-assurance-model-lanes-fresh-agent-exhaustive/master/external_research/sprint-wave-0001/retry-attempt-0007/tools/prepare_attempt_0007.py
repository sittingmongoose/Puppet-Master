#!/usr/bin/env python3
"""Deterministically prepare retry-attempt-0007 without activation or launch."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


NS = Path(__file__).resolve().parents[1]
ROOT = NS.parents[3]
PRIOR = ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0006"
OUTPUT_ROOT = ROOT / "external_research_v1"
IDS = ["ER-0003", "ER-0008"]
FLOOR = ["ER-0001", "ER-0002", "ER-0004", "ER-0005", "ER-0006", "ER-0007"]
FLOOR_DIGEST = "111135d1d44849d95577071398351634e899cf0689340919c6b855c239e859b6"
MODEL = "gpt-5.6-luna"
EFFORT = "max"
CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"
V10 = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
V11 = "6717f715c8a32dea88d7e79e70fca87aeb4a0b637853da3742c5c6e6a0c9a086"
ROUTING = "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544"
CAPTURE6 = "3ca11e7678e2af2ebc6c604d2429142cc734e43ce825c0138fa69b7a4c416b05"
PRIMARY6 = "c05e08ff7e726d352ab57eaa26e9de9039512d00f4f7f3be2680394d86bcea7c"
STATUS = "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V7"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jbytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False, allow_nan=False) + "\n").encode()


def write_frozen(path: Path, value: Any) -> None:
    data = jbytes(value)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != data:
            # The active blocked candidate may be deterministically rebuilt
            # until its terminal Sol preparation report is emitted. Thereafter
            # every byte is immutable.
            if (NS / "validation/terminal-sol-preparation-report.json").exists():
                raise SystemExit("append-only drift after terminal seal:" + str(path))
            path.write_bytes(data)
    else:
        path.write_bytes(data)


def deep_replace(value: Any) -> Any:
    if isinstance(value, str):
        return (
            value.replace("attempt-0006", "attempt-0007")
            .replace("retry-attempt-0006", "retry-attempt-0007")
            .replace("external-research-result-v6", "external-research-result-v7")
            .replace("external_research_result_v6", "external_research_result_v7")
            .replace("A005-ER6-", "A005-ER7-")
            .replace("attempt_0006", "attempt_0007")
        )
    if isinstance(value, list):
        return [deep_replace(item) for item in value]
    if isinstance(value, dict):
        return {key: deep_replace(child) for key, child in value.items()}
    return value


def string_schema(**extra: Any) -> dict[str, Any]:
    return {"type": "string", **extra}


def hash_schema() -> dict[str, Any]:
    return string_schema(pattern="^[0-9a-f]{64}$")


def receipt_schema(required: list[str]) -> dict[str, Any]:
    props: dict[str, Any] = {key: string_schema(minLength=1) for key in required}
    consts = {
        "schema_version": "external-research-dispatch-receipt-v7",
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "sprint_id": "sprint-wave-0001", "retry_namespace": "retry-attempt-0007",
        "attempt_id": "attempt-0007", "controller_thread_id": CONTROLLER,
        "model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none",
        "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
        "terminal_turn_status": "completed", "terminal_response_exact": "PMR1",
    }
    for key, value in consts.items():
        props[key] = {"const": value}
    props["assignment_id"] = {"enum": IDS}
    hash_fields = [
        "packet_sha256", "dispatch_intent_sha256", "activation_core_canonical_sha256",
        "leaf_dispatch_authorization_canonical_sha256", "activation_envelope_canonical_sha256",
        "terminal_proof_file_sha256", "parent_spawn_call_sha256", "parent_spawn_result_sha256",
        "result_file_sha256", "result_canonical_sha256", "output_tree_sha256", "receipt_writer_sha256",
    ]
    for key in hash_fields:
        props[key] = hash_schema()
    for key in ["task_thread_id", "native_child_thread_id", "native_child_turn_id"]:
        props[key] = string_schema(pattern="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
    for key in [
        "fresh_child", "descendants_forbidden", "followup_messages_forbidden", "retries_forbidden",
        "single_result_buffer_used", "toctou_recheck_passed_before_write", "result_present_before_pmr1",
        "result_required_before_pmr1", "receipt_written_after_spawn_and_terminal", "native_capture_binding_deferred",
    ]:
        props[key] = {"const": True}
    props["result_contains_task_thread_id"] = {"const": False}
    for key in ["coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit"]:
        props[key] = {"const": 0}
    props["result_buffer_byte_count"] = {"type": "integer", "minimum": 2}
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "urn:a005:external-research-dispatch-receipt-v7",
        "title": "Audit005 External Research Positive Dispatch Receipt v7",
        "type": "object", "additionalProperties": False, "required": required, "properties": props,
    }


def capture_schema(row_fields: list[str]) -> dict[str, Any]:
    row_props = {key: string_schema(minLength=1) for key in row_fields}
    row_props["assignment_id"] = {"enum": IDS}
    row_props["agent_path"] = {"enum": [f"/root/a005_external_research_recovery_er_{aid[-4:].lower()}_attempt_0007_terminal" for aid in IDS]}
    for key in ["result_file_sha256", "result_canonical_sha256", "output_tree_sha256", "receipt_file_sha256", "receipt_canonical_sha256", "parent_spawn_call_sha256", "parent_spawn_result_sha256"]:
        row_props[key] = hash_schema()
    for key in ["native_child_thread_id", "native_child_turn_id"]:
        row_props[key] = string_schema(pattern="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
    row_props["native_child_turn_status"] = {"const": "completed"}
    row_props["terminal_response_exact"] = {"const": "PMR1"}
    row_props["result_present_before_pmr1"] = {"const": True}
    row_props["canonicalization_algorithm_id"] = {"const": "a005-canonical-json-decimal-v1"}
    top_required = ["schema_version", "audit_id", "sprint_id", "retry_namespace", "attempt_id", "controller_thread_id", "assignment_count", "native_state_path", "native_state_file_sha256", "capture_writer_path", "capture_writer_sha256", "canonicalization_algorithm_id", "leaves", "coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit"]
    props: dict[str, Any] = {
        "schema_version": {"const": "external-research-native-capture-v7"},
        "audit_id": {"const": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"},
        "sprint_id": {"const": "sprint-wave-0001"}, "retry_namespace": {"const": "retry-attempt-0007"},
        "attempt_id": {"const": "attempt-0007"}, "controller_thread_id": {"const": CONTROLLER},
        "assignment_count": {"const": 2}, "native_state_path": string_schema(minLength=1),
        "native_state_file_sha256": hash_schema(), "capture_writer_path": string_schema(minLength=1),
        "capture_writer_sha256": hash_schema(), "canonicalization_algorithm_id": {"const": "a005-canonical-json-decimal-v1"},
        "leaves": {"type": "array", "minItems": 2, "maxItems": 2, "items": {"type": "object", "additionalProperties": False, "required": row_fields, "properties": row_props}},
    }
    for key in ["coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit"]:
        props[key] = {"const": 0}
    return {"$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "urn:a005:external-research-native-capture-v7", "title": "Audit005 External Research Native Capture v7", "type": "object", "additionalProperties": False, "required": top_required, "properties": props}


def main() -> None:
    assert sha(ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json") == V10
    assert sha(ROOT / "master/coordination/CONCURRENCY_POLICY_V11.json") == V11
    assert sha(ROOT / "master/coordination/MODEL_LANE_ROUTING_POLICY_V2.json") == ROUTING
    assert sha(PRIOR / "runtime/native_capture.json") == CAPTURE6
    assert sha(PRIOR / "validation/primary-cumulative-postrun.json") == PRIMARY6

    script_names = [
        "canonical_json.py", "canonical_oracle.py", "common.py", "generate_activation_transaction.py",
        "write_positive_receipt.py", "write_native_capture.py", "validate_postrun.py", "verify_prelaunch.py",
        "test_attempt_0007.py", "prepare_attempt_0007.py", "finalize_prelaunch.py",
    ]
    for name in script_names:
        if not (NS / "tools" / name).is_file():
            raise SystemExit("missing frozen tool:" + name)

    # Immutable control-only lineage inventory. Result bodies are never opened.
    prior_rows = []
    for path in sorted(PRIOR.rglob("*")):
        if path.is_file():
            prior_rows.append({"relative_path": path.relative_to(PRIOR).as_posix(), "byte_count": path.stat().st_size, "sha256": sha(path)})
    inventory_path = NS / "lineage/attempt-0006-control-inventory.jsonl"
    inventory_bytes = b"".join((json.dumps(row, sort_keys=True, separators=(",", ":")) + "\n").encode() for row in prior_rows)
    inventory_path.parent.mkdir(parents=True, exist_ok=True)
    if inventory_path.exists() and inventory_path.read_bytes() != inventory_bytes:
        raise SystemExit("lineage inventory drift")
    inventory_path.write_bytes(inventory_bytes)

    # Preserve the complete v6 schema shape, changing only frozen v7 bindings.
    result_schema = deep_replace(json.loads((PRIOR / "schema/external_research_result_v6.schema.json").read_text()))
    result_schema["$id"] = "urn:a005:external-research-result-v7"
    result_schema["title"] = "Audit005 External Research Recovery Result v7"
    write_frozen(NS / "schema/external_research_result_v7.schema.json", result_schema)

    receipt_fields = [
        "schema_version", "audit_id", "sprint_id", "retry_namespace", "assignment_id", "attempt_id",
        "controller_thread_id", "agent_path", "task_thread_id", "native_child_thread_id", "native_child_turn_id",
        "model", "reasoning_effort", "fresh_child", "fork_turns", "descendants_forbidden",
        "followup_messages_forbidden", "retries_forbidden", "packet_id", "packet_path", "packet_sha256",
        "dispatch_intent_path", "dispatch_intent_sha256", "activation_transaction_id",
        "authorization_transaction_id", "activation_core_path", "activation_core_canonical_sha256",
        "leaf_dispatch_authorization_path", "leaf_dispatch_authorization_canonical_sha256",
        "activation_envelope_path", "activation_envelope_canonical_sha256", "terminal_proof_path",
        "terminal_proof_file_sha256", "parent_spawn_call_sha256", "parent_spawn_result_sha256",
        "output_directory", "result_path", "result_file_sha256", "result_canonical_sha256",
        "result_buffer_byte_count", "output_tree_sha256", "canonicalization_algorithm_id",
        "receipt_writer_path", "receipt_writer_sha256", "receipt_writer_transaction_id",
        "single_result_buffer_used", "toctou_recheck_passed_before_write", "result_present_before_pmr1",
        "result_required_before_pmr1", "terminal_turn_status", "terminal_response_exact",
        "receipt_written_after_spawn_and_terminal", "result_contains_task_thread_id",
        "native_capture_binding_deferred", "coverage_credit", "research_credit", "promotion_credit",
        "spec_credit", "merge_credit",
    ]
    capture_row_fields = [
        "assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id",
        "native_child_turn_status", "terminal_response_exact", "result_present_before_pmr1", "result_path",
        "result_file_sha256", "result_canonical_sha256", "output_tree_sha256", "receipt_path",
        "receipt_file_sha256", "receipt_canonical_sha256", "canonicalization_algorithm_id",
        "parent_spawn_call_sha256", "parent_spawn_result_sha256",
    ]
    write_frozen(NS / "schema/external_research_dispatch_receipt_v7.schema.json", receipt_schema(receipt_fields))
    write_frozen(NS / "schema/external_research_native_capture_v7.schema.json", capture_schema(capture_row_fields))

    receipt_contract = {
        "schema_version": "external-research-receipt-contract-v7", "status": STATUS,
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "sprint_id": "sprint-wave-0001", "retry_namespace": "retry-attempt-0007", "attempt_id": "attempt-0007",
        "required_positive_receipt_schema_version": "external-research-dispatch-receipt-v7",
        "contract_document_label_must_not_be_copied_to_instance": True,
        "manual_receipt_construction_forbidden": True,
        "sealed_receipt_writer_path": str(NS / "tools/write_positive_receipt.py"),
        "sealed_receipt_writer_sha256": sha(NS / "tools/write_positive_receipt.py"),
        "receipt_schema_path": str(NS / "schema/external_research_dispatch_receipt_v7.schema.json"),
        "receipt_schema_sha256": sha(NS / "schema/external_research_dispatch_receipt_v7.schema.json"),
        "required_fields": receipt_fields,
        "digest_contract": {
            "result_file_sha256": "SHA-256 of exact result.json bytes captured once",
            "result_canonical_sha256": "SHA-256 of the same result buffer after a005-canonical-json-decimal-v1 serialization",
            "output_tree_sha256": "canonical digest of sorted relative path, byte count, and raw file SHA rows",
            "ambiguous_result_sha256_forbidden": True, "ambiguous_output_sha256_forbidden": True,
        },
        "writer_order": ["terminal completed and PMR1", "exactly one result.json present", "read one immutable result buffer", "Draft202012 and cross-field validation", "compute raw/canonical/tree digests", "TOCTOU recheck", "exclusive receipt emission", "post-emission result/tree recheck"],
        "credits": {"coverage": 0, "research": 0, "promotion": 0, "spec": 0, "merge": 0},
    }
    capture_contract = {
        "schema_version": "external-research-native-capture-contract-v7", "status": STATUS,
        "attempt_id": "attempt-0007", "assignment_ids": IDS, "required_row_count": 2,
        "sealed_capture_writer_path": str(NS / "tools/write_native_capture.py"),
        "sealed_capture_writer_sha256": sha(NS / "tools/write_native_capture.py"),
        "capture_schema_path": str(NS / "schema/external_research_native_capture_v7.schema.json"),
        "capture_schema_sha256": sha(NS / "schema/external_research_native_capture_v7.schema.json"),
        "required_row_fields": capture_row_fields,
        "identity_separation": "result owns canonical agent_path only; receipt and native capture own thread/turn identity",
        "distinct_digests": ["result_file_sha256", "result_canonical_sha256", "output_tree_sha256", "receipt_file_sha256", "receipt_canonical_sha256"],
        "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
        "credits": {"coverage": 0, "research": 0, "promotion": 0, "spec": 0, "merge": 0},
    }
    write_frozen(NS / "receipt_contract_v7.json", receipt_contract)
    write_frozen(NS / "native_capture_contract_v7.json", capture_contract)

    prompt_text = """Audit005 retry-attempt-0007 leaf. Read only your dispatch intent, assigned packet, result schema, leaf-dispatch authorization, activation core, and live public web sources. Verify activation_granted=true and every hash before work; the blocked prelaunch intent is immutable lineage and cannot veto a valid later authorization. Independently redo current public-web research for every original question. Do not read any prior result body or peer output. Prefer official/primary sources and register every direct HTTPS URL exactly once before any finding, failure, idea, implication, or unresolved question references it. evidence_class=no_evidence requires zero citation, URL, source-claim, or evidence references recursively; cited evidence requires supported_claim or inference. Use only canonical agent_path in the result and never write task/native thread or turn IDs. Validate the complete Draft 2020-12 result schema and cross-field source/question closure locally. Write exactly one result.json, then return exactly PMR1 only after the result exists. Do not write a receipt; only the sealed controller receipt writer may do that. Spawn no descendants; accept no followups or retries."""
    leaf_prompt = {
        "schema_version": "external-research-recovery-leaf-prompt-v7", "status": "FROZEN_FOR_FUTURE_ACTIVATION_ONLY",
        "attempt_id": "attempt-0007", "prompt_text": prompt_text,
        "allowed_reads": ["own dispatch intent", "own packet", "result schema v7", "own later authorization", "activation core", "live public web sources"],
        "forbidden_reads": ["attempts 0001 through 0006 result bodies", "peer outputs", "canonical Plans", "unbound audit artifacts"],
        "writes": ["exactly one result.json in assigned attempt-0007 output directory"],
        "terminal_response": "PMR1", "result_required_before_pmr1": True, "descendants_forbidden": True,
        "followups_forbidden": True, "retries_forbidden": True, "leaf_writes_receipt": False,
    }
    write_frozen(NS / "leaf_prompt.json", leaf_prompt)
    schema_attestations = result_schema["properties"]["self_attestation"]["required"]
    initial_contract = {
        "schema_version": "external-research-leaf-initial-task-contract-v7", "attempt_id": "attempt-0007",
        "assignment_ids": IDS, "initial_task_contains": ["frozen leaf prompt verbatim", "own absolute dispatch intent", "own later authorization path and SHA", "activation core path and SHA", "explicit no descendants/followups/retries"],
        "required_self_attestations": schema_attestations,
        "result_identity": "canonical agent_path only", "parent_spawn_capture_required": True,
        "parent_spawn_must_explicitly_request": {"model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none"},
        "positive_receipt_writer": str(NS / "tools/write_positive_receipt.py"),
    }
    write_frozen(NS / "leaf_initial_task_contract.json", initial_contract)

    packets = {}
    for index, aid in enumerate(IDS, 1):
        old = json.loads((PRIOR / f"packets/{aid}.json").read_text())
        packet = {
            "schema_version": "external-research-recovery-packet-v7", "audit_id": old["audit_id"],
            "sprint_id": old["sprint_id"], "retry_namespace": "retry-attempt-0007", "attempt_id": "attempt-0007",
            "assignment_id": aid, "packet_id": f"ER7PKT-{index:04d}",
            "candidate_status": STATUS, "activation_granted": False,
            "controller_thread_id": CONTROLLER,
            "canonical_agent_path": f"/root/a005_external_research_recovery_er_{aid[-4:].lower()}_attempt_0007_terminal",
            "model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none", "fresh_child": True,
            "topic": old["topic"], "research_questions": old["research_questions"],
            "owner_domains": old["owner_domains"], "feature_refs": old["feature_refs"],
            "source_policies": old["source_policies"], "prior_result_bodies_included": False,
            "prelaunch_intent_is_lineage_only_after_valid_authorization": True,
            "attempt_0007_rules": [
                "independently redo current live public-web research", "do not read any prior result body or peer output",
                "source registry completed before claim emission", "no_evidence means zero references recursively",
                "every original question has explicit question_coverage with extant evidence IDs",
                "result uses canonical agent_path only and forbids native IDs",
                "result passes Draft202012 and cross-field semantic checks before PMR1",
                "leaf never writes a receipt; sealed controller writer only",
            ],
            "digest_contract": {"result_file_sha256": "raw bytes", "result_canonical_sha256": "canonical object", "output_tree_sha256": "deterministic tree"},
        }
        path = NS / f"packets/{aid}.json"
        write_frozen(path, packet)
        packets[aid] = packet

    result_schema_path = NS / "schema/external_research_result_v7.schema.json"
    prompt_path = NS / "leaf_prompt.json"
    receipt_contract_path = NS / "receipt_contract_v7.json"
    capture_contract_path = NS / "native_capture_contract_v7.json"
    assignments = []
    for index, aid in enumerate(IDS, 1):
        outdir = OUTPUT_ROOT / aid / "attempts/attempt-0007"
        outdir.mkdir(parents=True, exist_ok=True)
        if any(outdir.iterdir()):
            raise SystemExit("attempt-0007 output not empty:" + aid)
        packet_path = NS / f"packets/{aid}.json"
        intent_path = NS / f"dispatch/{aid}/attempt-0007/dispatch_intent.json"
        agent_path = packets[aid]["canonical_agent_path"]
        intent = {
            "schema_version": "external-research-recovery-dispatch-intent-v7", "status": STATUS,
            "audit_id": packets[aid]["audit_id"], "sprint_id": "sprint-wave-0001", "retry_namespace": "retry-attempt-0007",
            "assignment_id": aid, "attempt_id": "attempt-0007", "controller_thread_id": CONTROLLER,
            "prospective_agent_path": agent_path, "model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none",
            "fresh_child_required": True, "descendants_forbidden": True, "followups_forbidden": True, "retries_forbidden": True,
            "activation_granted": False, "prelaunch_intent_is_immutable_lineage_only_after_later_authorization": True,
            "future_activation_core_ref": str(NS / "activation-transaction/activation-core.json"),
            "future_leaf_dispatch_authorization_ref": str(NS / f"activation-transaction/leaf-dispatch-authorizations/{aid}.json"),
            "leaf_prompt_ref": str(prompt_path), "leaf_prompt_sha256": sha(prompt_path),
            "packet_id": packets[aid]["packet_id"], "packet_ref": str(packet_path), "packet_sha256": sha(packet_path),
            "result_schema_ref": str(result_schema_path), "result_schema_sha256": sha(result_schema_path),
            "receipt_contract_ref": str(receipt_contract_path), "receipt_contract_sha256": sha(receipt_contract_path),
            "native_capture_contract_ref": str(capture_contract_path), "native_capture_contract_sha256": sha(capture_contract_path),
            "sealed_receipt_writer_ref": str(NS / "tools/write_positive_receipt.py"), "sealed_receipt_writer_sha256": sha(NS / "tools/write_positive_receipt.py"),
            "sealed_capture_writer_ref": str(NS / "tools/write_native_capture.py"), "sealed_capture_writer_sha256": sha(NS / "tools/write_native_capture.py"),
            "required_positive_receipt_schema_version": "external-research-dispatch-receipt-v7",
            "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
            "output_directory": str(outdir), "output_path": str(outdir / "result.json"),
            "result_required_before_pmr1": True, "terminal_response_exact": "PMR1",
            "prevalidation_credit": 0, "research_credit": 0, "coverage_credit": 0,
        }
        write_frozen(intent_path, intent)
        assignments.append({
            "assignment_id": aid, "attempt_id": "attempt-0007", "recovery_sequence": index,
            "canonical_agent_path": agent_path, "model": MODEL, "reasoning_effort": EFFORT,
            "packet_id": packets[aid]["packet_id"], "packet_ref": str(packet_path), "packet_sha256": sha(packet_path),
            "dispatch_intent_ref": str(intent_path), "dispatch_intent_sha256": sha(intent_path),
            "output_directory": str(outdir), "output_path": str(outdir / "result.json"),
            "receipt_path": str(intent_path.with_name("dispatch_receipt.json")),
            "future_activation_core_ref": str(NS / "activation-transaction/activation-core.json"),
            "future_leaf_dispatch_authorization_ref": str(NS / f"activation-transaction/leaf-dispatch-authorizations/{aid}.json"),
            "topic": packets[aid]["topic"], "research_questions": packets[aid]["research_questions"],
            "owner_domains": packets[aid]["owner_domains"], "feature_refs": packets[aid]["feature_refs"],
            "task_thread_id": None, "native_child_thread_id": None, "native_child_turn_id": None,
            "prevalidation_credit": 0, "research_credit": 0,
        })

    manifest = {
        "schema_version": "external-research-recovery-manifest-v7", "status": STATUS,
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "sprint_id": "sprint-wave-0001", "retry_namespace": "retry-attempt-0007", "attempt_id": "attempt-0007",
        "assignment_ids": IDS, "assignment_count": 2, "assignments": assignments,
        "controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none",
        "fresh_direct_leaves": 2, "semantic_transaction_cap": 2,
        "concurrency_policy_v10_lineage_sha256": V10, "active_prospective_concurrency_policy_v11_sha256": V11, "model_lane_routing_policy_v2_sha256": ROUTING,
        "preserved_cumulative_floor_ids": FLOOR, "preserved_cumulative_floor_digest": FLOOR_DIGEST, "preserved_cumulative_floor_count": 6,
        "attempt_0006_native_capture_sha256": CAPTURE6, "attempt_0006_primary_cumulative_report_sha256": PRIMARY6,
        "required_positive_receipt_schema_version": "external-research-dispatch-receipt-v7",
        "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
        "activation_granted": False, "counts": {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "activation_transaction_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0},
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    write_frozen(NS / "manifest.json", manifest)

    architecture = {
        "schema_version": "external-research-recovery-architecture-v7", "status": STATUS,
        "attempt_id": "attempt-0007", "assignment_ids": IDS, "fresh_direct_leaves": 2,
        "identity_separation": {"result": "canonical agent_path only", "receipt": "task/native child thread plus turn", "capture": "independent native thread/turn join"},
        "digest_separation": {"result_file_sha256": "raw result bytes", "result_canonical_sha256": "canonical JSON object", "output_tree_sha256": "deterministic output tree", "receipt_file_sha256": "raw receipt bytes", "receipt_canonical_sha256": "canonical receipt object"},
        "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
        "activation_transaction": ["immutable core", "per-leaf authorization", "final envelope"],
        "terminal_order": ["result", "PMR1", "sealed receipt", "sealed native capture", "primary postrun", "fresh independent cumulative postrun"],
        "manual_receipts_forbidden": True, "attempt_level_veto": True, "parent_lane_spawn_capture_required": True,
        "model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none", "semantic_transaction_cap": 2,
        "concurrency_policy_v10_lineage_sha256": V10, "active_prospective_concurrency_policy_v11_sha256": V11, "model_lane_routing_policy_v2_sha256": ROUTING,
        "credits": {"coverage": 0, "research": 0, "promotion": 0, "spec": 0, "merge": 0},
    }
    write_frozen(NS / "architecture.json", architecture)
    lineage = {
        "schema_version": "external-research-recovery-lineage-v7", "status": STATUS,
        "attempt_id": "attempt-0007", "prior_attempts_0001_through_0006_immutable_zero_credit": True,
        "attempt_0006_native_capture_path": str(PRIOR / "runtime/native_capture.json"), "attempt_0006_native_capture_sha256": CAPTURE6,
        "attempt_0006_primary_report_path": str(PRIOR / "validation/primary-cumulative-postrun.json"), "attempt_0006_primary_report_sha256": PRIMARY6,
        "attempt_0006_failure_class": "positive receipts placed raw result-file SHA in fields interpreted as canonical JSON-object digest",
        "attempt_0006_results_semantic_schema_source_evidence_checks_passed": True,
        "attempt_0006_failed_receipts_veto_and_no_identity_result_or_receipt_reuse": True,
        "attempt_0006_control_inventory_path": str(inventory_path), "attempt_0006_control_inventory_sha256": sha(inventory_path), "attempt_0006_control_inventory_file_count": len(prior_rows),
        "preserved_cumulative_floor_ids": FLOOR, "preserved_cumulative_floor_digest": FLOOR_DIGEST, "preserved_cumulative_floor_count": 6,
        "attempt_0007_agent_paths": [row["canonical_agent_path"] for row in assignments],
        "credits": {"coverage": 0, "research": 0, "promotion": 0, "spec": 0, "merge": 0},
    }
    write_frozen(NS / "lineage.json", lineage)

    template = {
        "schema_version": "external-research-activation-transaction-template-v7", "status": STATUS,
        "attempt_id": "attempt-0007", "assignment_ids": IDS, "generator_invoked": False,
        "emission_order": ["activation-transaction/activation-core.json", "activation-transaction/leaf-dispatch-authorizations/ER-0003.json", "activation-transaction/leaf-dispatch-authorizations/ER-0008.json", "activation-transaction/activation-envelope.json"],
        "no_circular_hash_dependency": True, "requires_fresh_independent_luna_prelaunch": True,
        "required_positive_receipt_schema_version": "external-research-dispatch-receipt-v7",
        "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
    }
    write_frozen(NS / "activation_transaction.template.json", template)

    tool_hashes = {name: sha(NS / "tools" / name) for name in script_names}
    payload_paths = [
        NS / "architecture.json", NS / "lineage.json", NS / "manifest.json", NS / "leaf_prompt.json",
        NS / "leaf_initial_task_contract.json", NS / "receipt_contract_v7.json", NS / "native_capture_contract_v7.json",
        NS / "activation_transaction.template.json", result_schema_path,
        NS / "schema/external_research_dispatch_receipt_v7.schema.json", NS / "schema/external_research_native_capture_v7.schema.json",
    ] + [NS / f"packets/{aid}.json" for aid in IDS] + [NS / f"dispatch/{aid}/attempt-0007/dispatch_intent.json" for aid in IDS]
    authority = {
        "schema_version": "external-research-recovery-authority-v7", "status": STATUS,
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "sprint_id": "sprint-wave-0001", "retry_namespace": "retry-attempt-0007", "attempt_id": "attempt-0007",
        "assignment_ids": IDS, "assignment_count": 2, "agent_paths": [row["canonical_agent_path"] for row in assignments],
        "model": MODEL, "reasoning_effort": EFFORT, "fork_turns": "none", "fresh_direct_leaves": 2,
        "controller_thread_id": CONTROLLER, "semantic_transaction_cap": 2,
        "concurrency_policy_v10_lineage_sha256": V10, "active_prospective_concurrency_policy_v11_sha256": V11, "model_lane_routing_policy_v2_sha256": ROUTING,
        "attempt_0006_native_capture_sha256": CAPTURE6, "attempt_0006_primary_cumulative_report_sha256": PRIMARY6,
        "preserved_cumulative_floor_ids": FLOOR, "preserved_cumulative_floor_digest": FLOOR_DIGEST, "preserved_cumulative_floor_count": 6,
        "required_positive_receipt_schema_version": "external-research-dispatch-receipt-v7",
        "canonicalization_algorithm_id": "a005-canonical-json-decimal-v1",
        "manual_receipt_construction_forbidden": True, "sealed_receipt_writer_required": True, "sealed_capture_writer_required": True,
        "parent_spawn_capture_required": True, "result_required_before_pmr1": True,
        "tool_hashes": tool_hashes, "payload_hashes": {str(path.relative_to(NS)): sha(path) for path in payload_paths},
        "counts": {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "activation_transaction_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0},
        "activation_granted": False, "launch_authorized": False,
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    write_frozen(NS / "authority.json", authority)
    launch_seal = {
        "schema_version": "external-research-recovery-launch-seal-v7", "status": STATUS,
        "attempt_id": "attempt-0007", "assignment_ids": IDS, "assignment_count": 2,
        "authority_sha256": sha(NS / "authority.json"), "manifest_sha256": sha(NS / "manifest.json"),
        "blocking_condition": "fresh independent Luna prelaunch v7 not present", "activation_granted": False,
        "launch_authorized": False, "activation_transaction_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0,
        "concurrency_policy_v10_lineage_sha256": V10, "active_prospective_concurrency_policy_v11_sha256": V11, "model_lane_routing_policy_v2_sha256": ROUTING,
        "semantic_transaction_cap": 2, "credits": {"coverage": 0, "research": 0, "promotion": 0, "spec": 0, "merge": 0},
    }
    write_frozen(NS / "launch_seal.json", launch_seal)
    print(json.dumps({"status": "prepared", "authority_sha256": sha(NS / "authority.json"), "manifest_sha256": sha(NS / "manifest.json"), "lineage_inventory_files": len(prior_rows)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
