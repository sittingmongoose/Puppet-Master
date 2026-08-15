#!/usr/bin/env python3
"""Candidate-v9 closure-gated facade over immutable candidate-v8.

No provider integration and no writes.  Every frozen runtime dependency is
validated as a regular non-link with exact bytes before candidate-v8 is
dynamically imported. Candidate-local files and caller execution evidence are
not runtime dependencies.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys
from pathlib import Path
from types import ModuleType
from typing import Any

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-9"
ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parent
V8_ROOT = SUCCESSOR / "model_retest_r8_candidate_v8"
V8_HARNESS = V8_ROOT / "r8_harness.py"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")

_OPEN_TRACE: set[Path] = set()


def _audit_open(event: str, args: tuple[Any, ...]) -> None:
    if event != "open" or not args or not isinstance(args[0], (str, bytes, os.PathLike)):
        return
    try:
        path = Path(args[0]).resolve()
    except (OSError, TypeError, ValueError):
        return
    if path.is_relative_to(SUCCESSOR.resolve()):
        _OPEN_TRACE.add(path)


sys.addaudithook(_audit_open)

# Exact mechanically deduplicated union of the complete candidate-v8 external
# closure and the four candidate-v8 facade files actually read/imported by v9.
# Format: repo-relative path|sha256|bytes.  Lexicographic path order is binding.
_CLOSURE_TEXT = """frozen_plans_snapshot_20260814_v1/fixture/Plans/00-plans-index.md|19fcbd110827a949df25cfb2f9f61bdbbc28ffc4f46f01bbe9f3981f94efb311|367909
frozen_plans_snapshot_20260814_v1/fixture/Plans/Automated_Testing_System.md|975472ff73c949fea277805b1317b1f67f56972bbfe401c73c3f38267edac4b3|267313
frozen_plans_snapshot_20260814_v1/fixture/Plans/Plan_To_Node_Compilation.md|196e062d4fb5dd38b28bbed93d6370e3c9205a29169533116b28d46d2c3cc8e2|103867
frozen_plans_snapshot_20260814_v1/fixture/Plans/Planning_Ledger_System.md|8df9c0e932c9ad97f837db1d87d8546baa5a1cb68ef9007756c082ae9003df07|70805
frozen_plans_snapshot_20260814_v1/fixture/Plans/Planning_Wizard.md|2b9591954871986cc5af23764d026ce102ca67be66634c7d1e49dc6988833d00|93549
frozen_plans_snapshot_20260814_v1/fixture/Plans/Prompt_Pipeline.md|5455de88e0eb4b9f7cc02f3828ce5aa836058f03e12715532ad2c761908fb5d8|303738
frozen_plans_snapshot_20260814_v1/fixture/Plans/assistant-chat-design.md|8d6dfb862784206b0c4db9ebe7d0e7b149723161aecbbb7282c750a86eddf7b9|1150138
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/ledger_registry.json|23d36152dd8d14de849d1d22ba0df5ca0a6864f8f0331efb3446e1d4c498e988|61169
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/current.json|813b219dac1bef99d85971ab2411e0b3bb3f5df2a0bb1df224467f2855df3914|8940
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/handoff.json|82e9800b6905f3d7cb77b78a4b58ea6f4f0a5b056cf4636c46f3bd57e1270f4f|9160
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/open_items.json|36c73492e33546c22d2e0ad1aff2aa7548b8d543f445a9ffc984fe4c5bcf2e47|20100
frozen_plans_snapshot_20260814_v1/provenance_manifest.json|56ddf926b4106bee4e774b91b17ed4fab5ca03a7e25154bc467955bb25274c0c|9327
model_retest_r5_snapshot_v1/integration_contract.json|d0cace7ea9d62925084245d1160d574f8f4b49c420abe60c8892de2f2a762e1a|4094
model_retest_r5_snapshot_v1/r4_harness.py|29d330d4dbef05a9f4e26a3bd1958cd50734d46af0d830acda5071ce4347ec82|279029
model_retest_r5_snapshot_v1/scorer_key.json|5b4614bea59b3f3740864324d33e346be254bff012da4ab6476077d5e80c2912|9429
model_retest_r5_snapshot_v1/templates/S10A.txt|627b03177ed4aa23f15217ccca326cfc995f5720bcec4cf71489dd32c9860958|1649
model_retest_r5_snapshot_v1/topic_a_capsule.json|6a37b1ab477e98b87d85b5e9569617b456d4dcc0e8a19762effaeb6218d18b52|51204
model_retest_r5_snapshot_v1/topic_b_capsule.json|75ca7224c90d44d32a29f2e766402d9e9eccf8fda584073ee82ca4bad5a41c96|72807
model_retest_r6_decomposed_v1/contract.json|9bee0c39beb4982c4daac1656f9f7a1327d4d31b9244c0ceebb22f630765f4b1|7482
model_retest_r6_decomposed_v1/r6_harness.py|a9a2ad6d11979da96571603a2297f890cf4c2b5bfb84f1a3aaa2b7c27c4e07a0|45927
model_retest_r6_decomposed_v2/contract.json|fdafa86048249a3b4325a84ce6e8f14e8cbafa0cc4e40360be3490d17e46bde6|6618
model_retest_r6_decomposed_v2/r6v2_harness.py|0cfd8e25d06a12c7294a15c182af0da095da33848ae96ca62b93349579a90e34|28103
model_retest_r6_decomposed_v3/contract.json|4ea1bbe15c2828582ff670a281030be6d549542c491ab4ae726aff37e5a1c41d|3074
model_retest_r6_decomposed_v3/r6v3_harness.py|472e8aa0b50e0bdf1ff33d5d880b6f6355282590b7dcd7a6168093257e0917be|15118
model_retest_r6_decomposed_v4/contract.json|8e3ab005f1f7e2f52cd8abd9486ff594a60557f69f829bdefa510ac5d0b0733e|3182
model_retest_r6_decomposed_v4/r6v4_harness.py|33c30afcab4b6c2602481c3e1fb0c8c3b54f5e4c3a4588c283df1d19d2b2ba22|34628
model_retest_r6_decomposed_v5/contract.json|6cc660b51bc0dd390e71cd2bab48c3ef5ca8943bf254c9ca0e349d5cd53b7144|1972
model_retest_r6_decomposed_v5/r6v5_harness.py|82f9dbb66f810d526e9260304a0cbcca671df2840cb11ac403289eb97ce83acc|23722
model_retest_r6_decomposed_v6/contract.json|6452f78be024d61f4a3fe13f7c95ca9efee7943e82eefc25cba9efe9dc497a41|3377
model_retest_r6_decomposed_v6/r6v6_harness.py|b950d61ace51798c914db358eb4580aa79a0cbf475ccfc7560ef38cdf6cab4d0|15014
model_retest_r6_decomposed_v7/contract.json|79b84db9cf3081893d1f63d4fa1240dcc028f365ba47be00ce72ea27ce390137|3902
model_retest_r6_decomposed_v7/r6v7_harness.py|8638110bd1b0e40f4e9ed334f77b85bdeeb21648369929ea03125e0aa11c0a0f|16975
model_retest_r8_candidate_v3/deterministic_preflight_report.json|bf8dfca3a0a6d9c282b3a29cfa2c6ee9b88955accf965828bd3a7c1fb173458f|74229
model_retest_r8_candidate_v4/deterministic_preflight_report.json|a88e262c5b0f0d18ad899a3e0cce8265d4061285c642410cb357ef73b3df90c0|74630
model_retest_r8_candidate_v4/r8_harness.py|c9dc4e4ccc8f526db147822915c3597ec7f26f4980c96a68477f867bdfba8769|78223
model_retest_r8_candidate_v5/counterfactual_holdouts.json|d77a62c62e76de2d895aa1141d1ce75735e41945a5b3eef5ecf818e781c5faba|37155
model_retest_r8_candidate_v5/deterministic_preflight_report.json|dce5e30deede76d91bc8d3a43fd6391d8688a8262277e437958c7591f96f20b3|82907
model_retest_r8_candidate_v5/r8_harness.py|df620714978572aba79f3d0836d6fc61e433c4ca11d9bfd0b3d2ad242c7fd736|105519
model_retest_r8_candidate_v5/tension_decomposition.json|b6e2443313b477f660daadccc48800c68162ada8f3ad84ad658dfd7b5ed48c26|42515
model_retest_r8_candidate_v6/architecture_contract.json|60ae0c98fa305da395bd07e9ac809fa7d7d86b8191ad5cd34b89130c3c7367db|14243
model_retest_r8_candidate_v6/counterfactual_holdouts.json|6c6480920bc7e9e69cc20ee02c7b7a2fde936a81eadc0cc3a3f5d4801a00e7f1|37376
model_retest_r8_candidate_v6/r8_harness.py|ef5a239e995c96209bc67c2a6ec16cbf721f1cf6ea4368d8204c70b2e74119e5|111710
model_retest_r8_candidate_v7/architecture_contract.json|b309b0f372c34e183786869e97aa8082abc67baa51deb9be9f75442fec52c23d|24518
model_retest_r8_candidate_v7/counterfactual_holdouts.json|ef28d15b388c2a28fdf842cfa5662f38a6d4e2ba5bb9ada5dbe6e264f7ae7821|44108
model_retest_r8_candidate_v7/deterministic_preflight_report.json|c899f09642eb98d61a3518dba21789f53586be36f7157887c0e6c8ac3644499e|91385
model_retest_r8_candidate_v7/r8_harness.py|08f4753658e2fea3c8e31d316b2aeb9691cea52b5b735058b06a6939ada57762|20317
model_retest_r8_candidate_v8/architecture_contract.json|1c1ffdf8bdbc2bc0ee341fb0cb8903c442dc01df16a6e8cc34e44f0989362bb2|27710
model_retest_r8_candidate_v8/counterfactual_holdouts.json|489e58ec16ab6063d08187d813b8458049da85cf00fe03bdc6a6cfe820fb8c24|44468
model_retest_r8_candidate_v8/deterministic_preflight_report.json|cd1d832de9d26eb215ebccdf20fc02bbe7fea33b6e362cb26d2f889b5c70b868|95055
model_retest_r8_candidate_v8/r8_harness.py|a59e958aa8f32ea49e48216493f772ccfd24413f37a452887048f9a8a9c85b02|21637"""

BOOTSTRAP_CLOSURE = tuple(
    {"path": path, "sha256": digest, "bytes": int(size)}
    for path, digest, size in (line.split("|") for line in _CLOSURE_TEXT.splitlines())
)
_EXPECTED_PATHS = tuple(row["path"] for row in BOOTSTRAP_CLOSURE)
if _EXPECTED_PATHS != tuple(sorted(_EXPECTED_PATHS)) or len(set(_EXPECTED_PATHS)) != len(_EXPECTED_PATHS):
    raise RuntimeError("embedded runtime dependency closure is not exact sorted unique")


class Invalid(Exception):
    pass


class SubjectFail(Exception):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def reject_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate key: {key}")
        out[key] = value
    return out


def regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(info.st_mode):
        raise Invalid(f"{label}: not a regular nonlink")
    return path.read_bytes()


def strict_object(data: bytes, label: str) -> dict[str, Any]:
    try:
        obj = json.loads(data.decode("utf-8"), object_pairs_hook=reject_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid UTF-8 JSON: {exc}") from exc
    if not isinstance(obj, dict):
        raise Invalid(f"{label}: top level must be object")
    return obj


def validate_declared_closure(rows: Any, *, validate_storage: bool) -> tuple[dict[str, Any], ...]:
    if not isinstance(rows, list):
        raise Invalid("runtime dependency closure must be an array")
    projected: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict) or set(row) - {"path", "sha256", "bytes", "roles"}:
            raise Invalid("runtime dependency row shape invalid")
        projected.append({key: row.get(key) for key in ("path", "sha256", "bytes")})
    paths = [row["path"] for row in projected]
    if paths != sorted(paths):
        raise Invalid("runtime dependency closure is not sorted")
    if len(paths) != len(set(paths)):
        raise Invalid("runtime dependency closure contains duplicate path")
    if tuple(projected) != BOOTSTRAP_CLOSURE:
        raise Invalid("runtime dependency closure missing, extra, or tampered row")
    if any(path.startswith("Plans/") or "/../" in f"/{path}/" or Path(path).is_absolute() for path in paths):
        raise Invalid("live Plans or non-relative runtime dependency forbidden")
    if validate_storage:
        for row in projected:
            storage = regular(SUCCESSOR / row["path"], row["path"])
            if (sha(storage), len(storage)) != (row["sha256"], row["bytes"]):
                raise Invalid(f"{row['path']}: frozen binding drift")
    return tuple(projected)


def architecture() -> dict[str, Any]:
    obj = strict_object(regular(ROOT / "architecture_contract.json", "architecture contract"), "architecture contract")
    if (obj.get("schema_id"), obj.get("candidate_id")) != (
        "pw-r8-candidate-architecture-contract-v9", CANDIDATE_ID
    ):
        raise Invalid("architecture identity mismatch")
    validate_declared_closure(obj.get("runtime_dependency_closure"), validate_storage=True)
    return obj


_facade_cache: ModuleType | None = None


def facade_module() -> ModuleType:
    global _facade_cache
    architecture()  # complete closure validation occurs before dynamic import/read
    if _facade_cache is None:
        spec = importlib.util.spec_from_file_location("r8_candidate_v9_bound_v8", V8_HARNESS)
        if spec is None or spec.loader is None:
            raise Invalid("candidate-v8 facade import unavailable")
        item = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(item)
        _facade_cache = item
    return _facade_cache


def semantic_module(*, candidate_identity: bool = True) -> ModuleType:
    module = facade_module().semantic_module(candidate_identity=False)
    if candidate_identity:
        module.CANDIDATE_ID = CANDIDATE_ID
    module.validated_capture_envelope = validated_capture_envelope_v4
    return module


RECEIPT_V4_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "execution_root",
    "requested_model", "requested_thinking", "provider_effective_model", "provider_effective_thinking",
    "host_id", "thread_id", "turn_id", "fresh_task_identity_basis", "status", "subject_call_started",
    "fresh_context", "first_attempt_subject_call", "retry_count", "best_of", "replacement_result", "admission",
    "render_storage_sha256", "render_storage_bytes", "provider_visible_payload_sha256", "provider_visible_payload_bytes",
    "semantic_packet_sha256", "semantic_packet_bytes", "dispatch_schedule", "dispatch_nonce", "dispatch_binding",
    "dispatch_wrapper_sha256", "dispatch_wrapper_bytes", "rollout_path", "rollout_storage_sha256", "rollout_storage_bytes",
    "model_provider", "turn_context_model", "turn_context_effort", "started_at_epoch_seconds", "completed_at_epoch_seconds",
    "duration_ms", "assistant_final_messages", "assistant_final_messages_sha256", "assistant_final_messages_bytes",
    "single_text_output_utf8", "single_text_output_sha256", "single_text_output_bytes", "text_normalization_receipt",
    "prohibited_activity_items", "prohibited_activity_items_sha256", "prohibited_activity_items_bytes",
    "prohibited_activity_item_types", "conformance_observations", "identity_limitation",
)
DISPATCH_SCHEDULE_KEYS = ("path", "storage_sha256", "storage_bytes")
DISPATCH_BINDING_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "dispatch_nonce",
    "semantic_packet_sha256", "semantic_packet_bytes", "dispatch_schedule_sha256", "dispatch_schedule_bytes",
)


def _lower_hash(value: Any) -> bool:
    return isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value) is not None


def validate_v4_receipt_binding(
    module: ModuleType,
    receipt: dict[str, Any],
    envelope: dict[str, Any],
    receipt_storage: bytes,
    render_storage: bytes,
    semantic_packet: bytes,
    exec_root: Path,
    slot: str,
    cell: str,
) -> bytes | None:
    if tuple(receipt) != RECEIPT_V4_KEYS:
        raise Invalid(f"{slot} {cell}: driver receipt keys/order outside v4 closed world")
    if receipt.get("schema_id") != "pw-r8-direct-appserver-subject-receipt-v4":
        raise Invalid(f"{slot} {cell}: unsupported driver receipt schema")
    if module.dump(receipt) + b"\n" != receipt_storage:
        raise Invalid(f"{slot} {cell}: driver receipt storage is not canonical exact bytes")
    required = {
        "candidate_id": CANDIDATE_ID, "run_id": envelope["run_id"], "slot": slot, "cell": cell,
        "execution_root": str(exec_root), "status": "completed", "subject_call_started": True,
        "fresh_context": True, "first_attempt_subject_call": True, "retry_count": 0,
        "best_of": False, "replacement_result": False, "thread_id": envelope["thread_id"],
        "turn_id": envelope["turn_id"], "fresh_task_identity_basis": "thread_id",
        "assistant_final_messages": envelope["assistant_final_messages"],
        "assistant_final_messages_sha256": envelope["assistant_final_messages_sha256"],
        "assistant_final_messages_bytes": envelope["assistant_final_messages_bytes"],
        "single_text_output_utf8": envelope["single_text_output_utf8"],
        "single_text_output_sha256": envelope["single_text_output_sha256"],
        "single_text_output_bytes": envelope["single_text_output_bytes"],
        "text_normalization_receipt": envelope["text_normalization_receipt"],
        "prohibited_activity_item_types": envelope["prohibited_activity_item_types"],
        "conformance_observations": envelope["conformance_observations"],
    }
    for field, wanted in required.items():
        if field not in receipt or type(receipt[field]) is not type(wanted) or receipt[field] != wanted:
            raise Invalid(f"{slot} {cell}: driver receipt field mismatch: {field}")
    if (envelope["driver_receipt_storage_sha256"], envelope["driver_receipt_storage_bytes"]) != (sha(receipt_storage), len(receipt_storage)):
        raise Invalid(f"{slot} {cell}: actual driver receipt storage binding mismatch")
    if (receipt["render_storage_sha256"], receipt["render_storage_bytes"]) != (sha(render_storage), len(render_storage)):
        raise Invalid(f"{slot} {cell}: render storage binding mismatch")
    semantic_identity = (sha(semantic_packet), len(semantic_packet))
    if (receipt["provider_visible_payload_sha256"], receipt["provider_visible_payload_bytes"]) != semantic_identity:
        raise Invalid(f"{slot} {cell}: provider-visible semantic packet binding mismatch")
    if (receipt["semantic_packet_sha256"], receipt["semantic_packet_bytes"]) != semantic_identity:
        raise Invalid(f"{slot} {cell}: semantic packet binding mismatch")
    schedule = receipt["dispatch_schedule"]
    if not isinstance(schedule, dict) or tuple(schedule) != DISPATCH_SCHEDULE_KEYS or schedule.get("path") != "dispatch_schedule.json" or not _lower_hash(schedule.get("storage_sha256")) or type(schedule.get("storage_bytes")) is not int or schedule["storage_bytes"] <= 0:
        raise Invalid(f"{slot} {cell}: dispatch schedule binding invalid")
    nonce = receipt["dispatch_nonce"]
    if not _lower_hash(nonce):
        raise Invalid(f"{slot} {cell}: dispatch nonce invalid")
    binding = receipt["dispatch_binding"]
    expected_binding = {
        "schema_id": "pw-r8-dispatch-binding-v1", "candidate_id": CANDIDATE_ID,
        "run_id": envelope["run_id"], "slot": slot, "cell": cell, "dispatch_nonce": nonce,
        "semantic_packet_sha256": semantic_identity[0], "semantic_packet_bytes": semantic_identity[1],
        "dispatch_schedule_sha256": schedule["storage_sha256"], "dispatch_schedule_bytes": schedule["storage_bytes"],
    }
    if not isinstance(binding, dict) or tuple(binding) != DISPATCH_BINDING_KEYS or binding != expected_binding:
        raise Invalid(f"{slot} {cell}: dispatch binding mismatch")
    admission = receipt["admission"]
    if not isinstance(admission, dict) or admission.get("candidate_id") != CANDIDATE_ID or admission.get("run_id") != envelope["run_id"] or admission.get("slot") != slot or admission.get("cell") != cell or admission.get("dispatch_schedule") != schedule or admission.get("dispatch_nonce") != nonce:
        raise Invalid(f"{slot} {cell}: admission dispatch identity mismatch")
    if not _lower_hash(receipt["dispatch_wrapper_sha256"]) or type(receipt["dispatch_wrapper_bytes"]) is not int or receipt["dispatch_wrapper_bytes"] <= 0:
        raise Invalid(f"{slot} {cell}: dispatch wrapper storage binding shape invalid")
    prohibited = receipt["prohibited_activity_items"]
    if not isinstance(prohibited, list) or any(not isinstance(item, dict) for item in prohibited):
        raise Invalid(f"{slot} {cell}: prohibited activity items invalid")
    prohibited_bytes = module.dump(prohibited)
    if (receipt["prohibited_activity_items_sha256"], receipt["prohibited_activity_items_bytes"]) != (sha(prohibited_bytes), len(prohibited_bytes)):
        raise Invalid(f"{slot} {cell}: prohibited activity storage binding mismatch")
    messages = envelope["assistant_final_messages"]
    message_bytes = module.dump(messages)
    if (receipt["assistant_final_messages_sha256"], receipt["assistant_final_messages_bytes"]) != (sha(message_bytes), len(message_bytes)):
        raise Invalid(f"{slot} {cell}: final-message receipt binding mismatch")
    normalization = module.text_normalization_receipt(messages, envelope["single_text_output_utf8"], envelope["prohibited_activity_item_types"], envelope["conformance_observations"])
    if receipt["text_normalization_receipt"] != normalization:
        raise Invalid(f"{slot} {cell}: normalization binding mismatch")
    scoring_text = normalization["scoring_text_output_utf8"]
    return None if scoring_text is None else scoring_text.encode("utf-8")


def validated_capture_envelope_v4(exec_root: Path, slot: str, cell: str) -> tuple[bytes | None, dict[str, Any]]:
    module = facade_module().semantic_module(candidate_identity=False)
    capture_path, receipt_path = module.capture_paths(exec_root, slot, cell)
    _, envelope = module.payload(capture_path, f"{slot} {cell} capture envelope")
    receipt_storage = module.regular(receipt_path, f"{slot} {cell} driver receipt")
    if not receipt_storage.endswith(b"\n") or receipt_storage.endswith(b"\n\n"):
        raise Invalid(f"{slot} {cell}: driver receipt storage must have exactly one terminal LF")
    receipt = module.strict(receipt_storage[:-1], f"{slot} {cell} driver receipt", canonical=True)
    if list(envelope) != list(module.CAPTURE_ENVELOPE_KEYS):
        raise Invalid(f"{slot} {cell}: capture envelope key order/schema mismatch")
    if (envelope.get("schema_id"), envelope.get("candidate_id"), envelope.get("slot"), envelope.get("cell")) != ("pw-r8-subject-capture-envelope-v3", CANDIDATE_ID, slot, cell):
        raise Invalid(f"{slot} {cell}: capture envelope identity mismatch")
    if envelope.get("subject_call_started") is not True or envelope.get("subject_call_completed") is not True or not isinstance(envelope.get("run_id"), str) or not envelope["run_id"]:
        raise Invalid(f"{slot} {cell}: capture completion/run identity invalid")
    if not isinstance(envelope.get("thread_id"), str) or not envelope["thread_id"] or not isinstance(envelope.get("turn_id"), str) or not envelope["turn_id"]:
        raise Invalid(f"{slot} {cell}: capture thread/turn identity invalid")
    messages = envelope.get("assistant_final_messages")
    if not isinstance(messages, list) or (envelope.get("assistant_final_messages_sha256"), envelope.get("assistant_final_messages_bytes")) != (sha(module.dump(messages)), len(module.dump(messages))):
        raise Invalid(f"{slot} {cell}: capture final-message binding mismatch")
    text_value = envelope.get("single_text_output_utf8")
    if text_value is None:
        if envelope.get("single_text_output_sha256") is not None or envelope.get("single_text_output_bytes") is not None:
            raise Invalid(f"{slot} {cell}: capture null text binding mismatch")
    elif isinstance(text_value, str):
        text_bytes = text_value.encode("utf-8")
        if (envelope.get("single_text_output_sha256"), envelope.get("single_text_output_bytes")) != (sha(text_bytes), len(text_bytes)):
            raise Invalid(f"{slot} {cell}: capture text binding mismatch")
    else:
        raise Invalid(f"{slot} {cell}: capture text type invalid")
    for field in ("prohibited_activity_item_types", "conformance_observations"):
        if not isinstance(envelope.get(field), list) or any(not isinstance(value, str) or not value for value in envelope[field]):
            raise Invalid(f"{slot} {cell}: capture {field} invalid")
    normalization = module.text_normalization_receipt(messages, text_value, envelope["prohibited_activity_item_types"], envelope["conformance_observations"])
    if envelope.get("text_normalization_receipt") != normalization:
        raise Invalid(f"{slot} {cell}: capture normalization binding mismatch")
    render_storage, _ = module.render(cell, slot, exec_root)
    semantic_packet = module.provider_payload(render_storage, cell)
    raw = validate_v4_receipt_binding(module, receipt, envelope, receipt_storage, render_storage, semantic_packet, exec_root, slot, cell)
    return raw, envelope


def synthetic_v4_interface(module: ModuleType) -> tuple[dict[str, Any], dict[str, Any], bytes, bytes, Path, str, str]:
    exec_root = SUCCESSOR / "synthetic-v9-interface-root"
    slot, cell, run_id = "slot-alpha", "SYNTHETIC_CELL", "synthetic-v9-run"
    semantic_packet = b"synthetic semantic packet"
    render_storage = semantic_packet + b"\n"
    text = '{"selected_choice":"synthetic"}'
    messages = [{"content": [{"type": "output_text", "text": text}]}]
    message_bytes = module.dump(messages)
    text_bytes = text.encode("utf-8")
    prohibited: list[dict[str, Any]] = []
    prohibited_bytes = module.dump(prohibited)
    prohibited_types: list[str] = []
    observations: list[str] = []
    normalization = module.text_normalization_receipt(messages, text, prohibited_types, observations)
    schedule = {"path": "dispatch_schedule.json", "storage_sha256": "1" * 64, "storage_bytes": 4096}
    nonce = "2" * 64
    binding = {
        "schema_id": "pw-r8-dispatch-binding-v1", "candidate_id": CANDIDATE_ID, "run_id": run_id,
        "slot": slot, "cell": cell, "dispatch_nonce": nonce,
        "semantic_packet_sha256": sha(semantic_packet), "semantic_packet_bytes": len(semantic_packet),
        "dispatch_schedule_sha256": schedule["storage_sha256"], "dispatch_schedule_bytes": schedule["storage_bytes"],
    }
    admission = {"candidate_id": CANDIDATE_ID, "run_id": run_id, "slot": slot, "cell": cell, "dispatch_schedule": schedule, "dispatch_nonce": nonce}
    values: dict[str, Any] = {
        "schema_id": "pw-r8-direct-appserver-subject-receipt-v4", "candidate_id": CANDIDATE_ID, "run_id": run_id,
        "slot": slot, "cell": cell, "execution_root": str(exec_root), "requested_model": "synthetic-model",
        "requested_thinking": "synthetic-effort", "provider_effective_model": None, "provider_effective_thinking": None,
        "host_id": "synthetic-host", "thread_id": "synthetic-thread", "turn_id": "synthetic-turn",
        "fresh_task_identity_basis": "thread_id", "status": "completed", "subject_call_started": True,
        "fresh_context": True, "first_attempt_subject_call": True, "retry_count": 0, "best_of": False,
        "replacement_result": False, "admission": admission, "render_storage_sha256": sha(render_storage),
        "render_storage_bytes": len(render_storage), "provider_visible_payload_sha256": sha(semantic_packet),
        "provider_visible_payload_bytes": len(semantic_packet), "semantic_packet_sha256": sha(semantic_packet),
        "semantic_packet_bytes": len(semantic_packet), "dispatch_schedule": schedule, "dispatch_nonce": nonce,
        "dispatch_binding": binding, "dispatch_wrapper_sha256": "3" * 64, "dispatch_wrapper_bytes": 8192,
        "rollout_path": "/synthetic/rollout.jsonl", "rollout_storage_sha256": "4" * 64, "rollout_storage_bytes": 16384,
        "model_provider": "openai", "turn_context_model": "synthetic-model", "turn_context_effort": "synthetic-effort",
        "started_at_epoch_seconds": 1.0, "completed_at_epoch_seconds": 2.0, "duration_ms": 1000.0,
        "assistant_final_messages": messages, "assistant_final_messages_sha256": sha(message_bytes),
        "assistant_final_messages_bytes": len(message_bytes), "single_text_output_utf8": text,
        "single_text_output_sha256": sha(text_bytes), "single_text_output_bytes": len(text_bytes),
        "text_normalization_receipt": normalization, "prohibited_activity_items": prohibited,
        "prohibited_activity_items_sha256": sha(prohibited_bytes), "prohibited_activity_items_bytes": len(prohibited_bytes),
        "prohibited_activity_item_types": prohibited_types, "conformance_observations": observations,
        "identity_limitation": "synthetic interface fixture; no empirical claim",
    }
    receipt = {key: values[key] for key in RECEIPT_V4_KEYS}
    receipt_storage = module.dump(receipt) + b"\n"
    envelope_values = {
        "schema_id": "pw-r8-subject-capture-envelope-v3", "candidate_id": CANDIDATE_ID, "run_id": run_id,
        "slot": slot, "cell": cell, "subject_call_started": True, "subject_call_completed": True,
        "thread_id": "synthetic-thread", "turn_id": "synthetic-turn", "assistant_final_messages": messages,
        "assistant_final_messages_sha256": sha(message_bytes), "assistant_final_messages_bytes": len(message_bytes),
        "single_text_output_utf8": text, "single_text_output_sha256": sha(text_bytes),
        "single_text_output_bytes": len(text_bytes), "text_normalization_receipt": normalization,
        "prohibited_activity_item_types": prohibited_types, "conformance_observations": observations,
        "driver_receipt_storage_sha256": sha(receipt_storage), "driver_receipt_storage_bytes": len(receipt_storage),
    }
    envelope = {key: envelope_values[key] for key in module.CAPTURE_ENVELOPE_KEYS}
    return receipt, envelope, receipt_storage, render_storage, exec_root, slot, cell


def receipt_interface_holdouts(module: ModuleType) -> dict[str, Any]:
    receipt, envelope, storage, render_storage, exec_root, slot, cell = synthetic_v4_interface(module)
    semantic_packet = render_storage[:-1]
    raw = validate_v4_receipt_binding(module, receipt, envelope, storage, render_storage, semantic_packet, exec_root, slot, cell)
    if raw != receipt["single_text_output_utf8"].encode("utf-8"):
        raise Invalid("valid v4 receipt adapter did not preserve scoring text")
    results = [{"case_id": "CF-R8-66-valid-v4-receipt-capture-interface", "result": "PASS"}]

    def rejection(case_id: str, changed_receipt: dict[str, Any], changed_envelope: dict[str, Any] | None = None) -> None:
        changed_storage = module.dump(changed_receipt) + b"\n"
        bound_envelope = copy.deepcopy(envelope if changed_envelope is None else changed_envelope)
        if changed_envelope is None:
            bound_envelope["driver_receipt_storage_sha256"] = sha(changed_storage)
            bound_envelope["driver_receipt_storage_bytes"] = len(changed_storage)
        try:
            validate_v4_receipt_binding(module, changed_receipt, bound_envelope, changed_storage, render_storage, semantic_packet, exec_root, slot, cell)
        except Invalid:
            results.append({"case_id": case_id, "result": "REJECT"})
        else:
            raise Invalid(f"{case_id}: invalid receipt interface accepted")

    stale = copy.deepcopy(receipt); stale["schema_id"] = "pw-r8-direct-appserver-subject-receipt-v3"
    rejection("CF-R8-67-stale-v3-receipt-schema-rejected", stale)
    unknown = copy.deepcopy(receipt); unknown["schema_id"] = "pw-r8-direct-appserver-subject-receipt-v999"
    rejection("CF-R8-68-unknown-receipt-schema-rejected", unknown)
    altered_dispatch = copy.deepcopy(receipt); altered_dispatch["dispatch_binding"]["dispatch_nonce"] = "9" * 64
    rejection("CF-R8-69-altered-dispatch-binding-rejected", altered_dispatch)
    altered_envelope = copy.deepcopy(envelope); altered_envelope["driver_receipt_storage_sha256"] = "0" * 64
    rejection("CF-R8-70-altered-actual-receipt-storage-binding-rejected", copy.deepcopy(receipt), altered_envelope)
    verdict, _, violations = module.assess_response(b'{"selected_choice":"beta"}', {"selected_choice": "alpha"}, "decision", ["alpha", "beta"], [], [])
    if verdict != "FAIL" or violations != ["semantic_mismatch"]:
        raise Invalid("semantic mismatch acceptance changed by receipt adapter")
    results.append({"case_id": "CF-R8-71-semantic-mismatch-remains-subject-fail", "result": "FAIL_AS_REQUIRED", "violations": violations})
    return {"cases": len(results), "results": results, "semantic_acceptance_weakened": False}


def validate_bound_storage(storage: bytes, row: dict[str, Any], label: str) -> None:
    if (sha(storage), len(storage)) != (row["sha256"], row["bytes"]):
        raise Invalid(f"{label}: frozen binding drift")


def derive_external_open_paths(facade: ModuleType) -> dict[str, Any]:
    inherited = {row["path"] for row in facade.BOOTSTRAP_CLOSURE}
    facade = {
        "model_retest_r8_candidate_v8/r8_harness.py",
        "model_retest_r8_candidate_v8/architecture_contract.json",
        "model_retest_r8_candidate_v8/counterfactual_holdouts.json",
        "model_retest_r8_candidate_v8/deterministic_preflight_report.json",
    }
    derived = tuple(sorted(inherited | facade))
    if derived != _EXPECTED_PATHS:
        raise Invalid("static external read/import path derivation differs from declared closure")
    live = [path for path in derived if path.startswith("Plans/")]
    if live:
        raise Invalid("static external read/import path derivation reaches live Plans")
    traced = tuple(sorted(
        path.relative_to(SUCCESSOR.resolve()).as_posix()
        for path in _OPEN_TRACE
        if not path.is_relative_to(ROOT.resolve()) and path.is_file()
    ))
    unbound_traced = sorted(set(traced) - set(derived))
    if unbound_traced:
        raise Invalid(f"observed external open outside declared closure: {unbound_traced}")
    return {
        "status": "PASS",
        "candidate_v8_inherited_closure_paths": len(inherited),
        "facade_import_preflight_paths": len(facade),
        "deduplicated_paths": len(derived),
        "derived_paths_exactly_equal_declared_closure": True,
        "actual_external_read_or_import_candidates_subset_of_declared_closure": True,
        "observed_external_open_paths": len(set(traced)),
        "observed_external_open_paths_subset_of_declared_closure": True,
        "observed_unbound_external_open_paths": unbound_traced,
        "live_plans_paths": live,
        "frozen_fixture_plans_paths": sum(path.startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/") for path in derived),
    }


def preflight() -> dict[str, Any]:
    facade = facade_module()
    baseline = facade.preflight()
    baseline_storage = regular(V8_ROOT / "deterministic_preflight_report.json", "candidate-v8 preflight baseline")
    if dump(baseline) + b"\n" != baseline_storage:
        raise Invalid("candidate-v8 deterministic preflight baseline identity drift")
    v8_holdouts = strict_object(regular(V8_ROOT / "counterfactual_holdouts.json", "candidate-v8 holdouts"), "candidate-v8 holdouts")
    v9_holdouts = strict_object(regular(ROOT / "counterfactual_holdouts.json", "candidate-v9 holdouts"), "candidate-v9 holdouts")
    v8_cases, v9_cases = v8_holdouts.get("cases"), v9_holdouts.get("cases")
    if not isinstance(v8_cases, list) or not isinstance(v9_cases, list) or len(v8_cases) != 65 or len(v9_cases) != 71 or v9_cases[:65] != v8_cases:
        raise Invalid("candidate-v9 inherited holdouts differ from candidate-v8")
    module = semantic_module(candidate_identity=True)
    interface_holdouts = receipt_interface_holdouts(module)
    read_path_proof = derive_external_open_paths(facade)
    closure = [dict(row) for row in BOOTSTRAP_CLOSURE]
    inventory_bytes = dump(closure)
    source_count = sum(row["path"].startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/") for row in closure)
    baseline.update({
        "schema_id": "pw-r8-deterministic-preflight-report-v9",
        "candidate_id": CANDIDATE_ID,
        "runtime_dependency_closure": {
            "status": "PASS",
            "exact_sorted_unique_external_files": len(closure),
            "candidate_v8_inherited_external_files": 46,
            "unique_frozen_fixture_source_files": source_count,
            "candidate_v8_facade_files": 4,
            "inventory_sha256": sha(inventory_bytes),
            "inventory_canonical_bytes": len(inventory_bytes),
            "validated_before_dynamic_import": True,
            "all_actual_external_open_candidates_subset_of_declared_closure": True,
            "derivation": "candidate-v8 exact runtime dependency closure union candidate-v8 harness, architecture, holdouts, and deterministic preflight baseline; deduplicated by successor-relative path",
            "live_plans_paths": [],
            "candidate_local_files_excluded": True,
        },
        "static_external_read_path_proof": read_path_proof,
        "receipt_v4_interface_holdouts": interface_holdouts,
        "counterfactual_holdouts": {
            "cases": 71,
            "passed_case_ids": baseline["counterfactual_holdouts"]["passed_case_ids"] + [row["case_id"] for row in interface_holdouts["results"]],
            "inherited_object_identity_to_candidate_v8": "65/65",
        },
        "candidate_v8_semantic_baseline": {
            "provider_visible_prompt_identity": baseline["candidate_v5_provider_visible_prompt_and_measurement_identity"],
            "semantic_oracle_identity": baseline["candidate_v5_semantic_oracle_identity"],
            "schedule_identity": baseline["candidate_v5_schedule_identity"],
            "deterministic_output_identity": baseline["candidate_v5_deterministic_output_identity"],
            "complete_preflight_storage_identity": True,
            "preflight_storage_sha256": sha(baseline_storage),
            "preflight_storage_bytes": len(baseline_storage),
        },
        "scoring_capture_interface": {
            "accepted_direct_receipt_schema": "pw-r8-direct-appserver-subject-receipt-v4",
            "rejected_receipt_schemas": ["pw-r8-direct-appserver-subject-receipt-v3", "unknown"],
            "capture_envelope_schema": "pw-r8-subject-capture-envelope-v3",
            "receipt_exact_key_count": len(RECEIPT_V4_KEYS),
            "dispatch_schedule_exact_keys": list(DISPATCH_SCHEDULE_KEYS),
            "dispatch_binding_exact_keys": list(DISPATCH_BINDING_KEYS),
            "actual_receipt_storage_hash_and_bytes_required": True,
            "semantic_acceptance_weakened": False,
        },
        "audited_candidate_bundle_custody_interface": {
            "owner": "external controller",
            "schema_id": "pw-r8-audited-candidate-bundle-v1",
            "exact_ordered_keys": ["schema_id", "candidate_id", "excluded_path", "file_count", "aggregate_file_bytes", "files", "canonical_rows_sha256", "canonical_rows_bytes"],
            "excluded_path": "independent_preseal_audit.json",
            "file_count": 10,
            "canonical_rows_rule": "sha256 and bytes over canonical minified UTF-8 JSON of the exact sorted files array only",
            "semantic_render_bytes_changed": False,
        },
        "dispatch_binding_wrapper": {
            "owner": "external controller",
            "semantic_render_bytes_changed": False,
            "placement": "constant typed opaque wrapper outside semantic input",
            "binding_fields": ["schema_id", "candidate_id", "run_id", "slot", "cell", "dispatch_nonce", "semantic_packet_sha256", "semantic_packet_bytes", "dispatch_schedule_sha256", "dispatch_schedule_bytes"],
            "semantic_packet_and_full_wrapper_measured_separately": True,
            "predeclared_schedule_required": True,
        },
        "live_plans_reads": 0,
    })
    return baseline


def execution_root(value: str) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()):
        raise Invalid("execution root must remain beneath successor_20260813")
    return path


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    sub.add_parser("list-cells")
    for name in ("render", "expected", "score", "measure"):
        q = sub.add_parser(name)
        q.add_argument("--cell", required=True)
        q.add_argument("--slot", required=True, choices=SLOTS)
        q.add_argument("--execution-root", required=True)
    q = sub.add_parser("reduce")
    q.add_argument("--stage", required=True, choices=("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90"))
    q.add_argument("--slot", required=True, choices=SLOTS)
    q.add_argument("--execution-root", required=True)
    return p


def main() -> int:
    try:
        args = parser().parse_args()
        if args.command == "preflight":
            sys.stdout.buffer.write(dump(preflight()) + b"\n"); return 0
        module = semantic_module()
        if args.command == "list-cells":
            sys.stdout.buffer.write(dump({"candidate_id": CANDIDATE_ID, "count": len(module.SUBJECT_CELLS), "cells": list(module.SUBJECT_CELLS)}) + b"\n"); return 0
        root = execution_root(args.execution_root)
        if args.command == "render":
            sys.stdout.buffer.write(module.render(args.cell, args.slot, root)[0]); return 0
        if args.command == "expected":
            sys.stdout.buffer.write(dump(module.expected(args.cell, args.slot, root)) + b"\n"); return 0
        if args.command == "measure":
            storage, source_bytes = module.render(args.cell, args.slot, root)
            packet = module.provider_payload(storage, args.cell)
            sys.stdout.buffer.write(dump(module.packet_diagnostics(args.cell, packet, source_bytes)) + b"\n"); return 0
        if args.command == "score":
            result, rc = module.score(args.cell, args.slot, root)
            sys.stdout.buffer.write(dump(result) + b"\n"); return rc
        if args.command == "reduce":
            sys.stdout.buffer.write(dump(module.reduce(root, args.slot, args.stage)) + b"\n"); return 0
        raise Invalid("unsupported command")
    except Exception as exc:
        subject_fail = exc.__class__.__name__ == "SubjectFail"
        status, rc = ("FAIL", 1) if subject_fail else ("INVALID", 2)
        sys.stdout.buffer.write(dump({"schema_id": "pw-r8-harness-error-v1", "candidate_id": CANDIDATE_ID, "status": status, "error": str(exc)}) + b"\n")
        return rc


if __name__ == "__main__":
    raise SystemExit(main())
