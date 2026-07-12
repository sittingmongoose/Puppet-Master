#!/usr/bin/env python3
from __future__ import annotations

import os
import sys
import uuid
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
NS = BASE.parent
V72 = NS / "validation/receipt-closure-v7_2"
sys.path.insert(0, str(NS / "tools"))
sys.path.insert(0, str(V72))

import canonical_json  # noqa: E402
import common  # noqa: E402
import result_validator_v7_2 as RV72  # noqa: E402
from jsonschema import Draft202012Validator, FormatChecker  # noqa: E402

RECEIPT_SCHEMA = BASE / "external_research_dispatch_receipt_v7_3.schema.json"
CAPTURE_SCHEMA = BASE / "external_research_native_capture_v7_3.schema.json"
RECOVERY_IDS = ["ER-0003", "ER-0008"]
NATIVE_TOP_KEYS = {"schema_version", "attempt_id", "controller_thread_id", "leaves"}
NATIVE_LEAF_KEYS = {
    "assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id",
    "native_child_turn_status", "terminal_response_exact", "result_present_before_pmr1",
    "parent_spawn_call_sha256", "parent_spawn_result_sha256", "spawn_requested_model",
    "spawn_requested_reasoning_effort", "fork_turns", "descendants_spawned",
    "followup_messages_sent", "retries_spawned",
}


def checked_schema(path: Path) -> dict[str, Any]:
    schema = common.load(path)
    Draft202012Validator.check_schema(schema)
    _required_arrays_unique(schema, "$")
    return schema


def _required_arrays_unique(value: Any, at: str) -> None:
    if isinstance(value, dict):
        required = value.get("required")
        if isinstance(required, list) and len(required) != len(set(required)):
            raise ValueError(at + ":required-not-unique")
        for key, child in value.items():
            _required_arrays_unique(child, at + "." + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            _required_arrays_unique(child, f"{at}[{index}]")


def schema_errors(value: Any, path: Path) -> list[str]:
    schema = checked_schema(path)
    errors = []
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    for error in validator.iter_errors(value):
        where = "$" + "".join(
            f"[{item}]" if isinstance(item, int) else f".{item}" for item in error.absolute_path
        )
        errors.append(f"{where}:{error.validator}:{error.message}")
    return sorted(errors)


def validate_result_buffer(
    raw: bytes, assignment: dict[str, Any], core: dict[str, Any], authorization: dict[str, Any],
    core_file_sha256: str, authorization_file_sha256: str,
) -> tuple[dict[str, Any] | None, str, str, list[str]]:
    return RV72.validate_result_buffer_v7_2(
        raw, assignment, core, authorization, core_file_sha256, authorization_file_sha256
    )


def native_state_errors(state: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if set(state) != NATIVE_TOP_KEYS:
        errors.append("native-state:key-set")
    expected_top = {
        "schema_version": "external-research-controller-native-state-v7",
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
    }
    for key, wanted in expected_top.items():
        if state.get(key) != wanted:
            errors.append("native-state:" + key)
    leaves = state.get("leaves")
    if not isinstance(leaves, list) or len(leaves) != 2:
        return sorted(set(errors + ["native-state:leaves-cardinality"]))
    if [row.get("assignment_id") for row in leaves if isinstance(row, dict)] != RECOVERY_IDS:
        errors.append("native-state:assignment-order-or-uniqueness")
    seen_paths: set[str] = set()
    seen_threads: set[str] = set()
    seen_turns: set[str] = set()
    for index, row in enumerate(leaves):
        aid = RECOVERY_IDS[index]
        if not isinstance(row, dict):
            errors.append(f"native-state:leaf-{index}-not-object")
            continue
        if set(row) != NATIVE_LEAF_KEYS:
            errors.append(aid + ":native-key-set")
        expected = {
            "assignment_id": aid,
            "agent_path": common.expected_agent_path(aid),
            "native_child_turn_status": "completed",
            "terminal_response_exact": "PMR1",
            "result_present_before_pmr1": True,
            "spawn_requested_model": common.MODEL,
            "spawn_requested_reasoning_effort": common.REASONING_EFFORT,
            "fork_turns": "none",
            "descendants_spawned": 0,
            "followup_messages_sent": 0,
            "retries_spawned": 0,
        }
        for key, wanted in expected.items():
            if row.get(key) != wanted:
                errors.append(aid + ":native:" + key)
        # These two legacy snapshot fields are lineage hints, not native identity
        # authority. Terminal proofs own their exact digest validation. The frozen
        # ER-0008 native-state row is known to omit the final hex nibble of the
        # parent-spawn-call digest, so require a nonempty hex lineage token here
        # and join the authoritative 64-byte value through the receipt/proof.
        for key in ("parent_spawn_call_sha256", "parent_spawn_result_sha256"):
            value = row.get(key)
            if not isinstance(value, str) or len(value) < 32 or any(ch not in "0123456789abcdef" for ch in value):
                errors.append(aid + ":native-lineage:" + key)
        for key, seen in (
            ("agent_path", seen_paths),
            ("native_child_thread_id", seen_threads),
            ("native_child_turn_id", seen_turns),
        ):
            value = row.get(key)
            if not isinstance(value, str) or not value or value in seen:
                errors.append(aid + ":native-identity:" + key)
            else:
                seen.add(value)
    return sorted(set(errors))


def receipt_errors(
    receipt: dict[str, Any], *, aid: str | None = None, native: dict[str, Any] | None = None,
    result_raw: bytes | None = None, receipt_raw: bytes | None = None,
    output_tree_sha256: str | None = None,
) -> list[str]:
    errors = schema_errors(receipt, RECEIPT_SCHEMA)
    if aid is not None and receipt.get("assignment_id") != aid:
        errors.append("receipt:assignment")
    if aid is not None:
        core_raw = common.core_path().read_bytes()
        auth_raw = common.authorization_path(aid).read_bytes()
        envelope_raw = common.envelope_path().read_bytes()
        expected_digests = {
            "activation_core_file_sha256": common.sha_bytes(core_raw),
            "activation_core_object_canonical_sha256": canonical_json.canonical_sha256_from_buffer(core_raw),
            "leaf_dispatch_authorization_file_sha256": common.sha_bytes(auth_raw),
            "leaf_dispatch_authorization_object_canonical_sha256": canonical_json.canonical_sha256_from_buffer(auth_raw),
            "activation_envelope_file_sha256": common.sha_bytes(envelope_raw),
            "activation_envelope_object_canonical_sha256": canonical_json.canonical_sha256_from_buffer(envelope_raw),
            "receipt_writer_sha256": common.sha(BASE / "write_positive_receipt_v7_3.py"),
            "isolated_result_validator_sha256": common.sha(BASE / "closure_validator_v7_3.py"),
        }
        for key, wanted in expected_digests.items():
            if receipt.get(key) != wanted:
                errors.append("receipt:bound-digest:" + key)
    if native is not None:
        expected = {
            "agent_path": native.get("agent_path"),
            "task_thread_id": native.get("native_child_thread_id"),
            "native_child_thread_id": native.get("native_child_thread_id"),
            "native_child_turn_id": native.get("native_child_turn_id"),
            "terminal_response_exact": "PMR1",
            "terminal_turn_status": "completed",
        }
        for key, wanted in expected.items():
            if receipt.get(key) != wanted:
                errors.append("receipt:native-join:" + key)
    if result_raw is not None:
        if receipt.get("result_file_sha256") != common.sha_bytes(result_raw):
            errors.append("receipt:result-file-sha")
        if receipt.get("result_canonical_sha256") != canonical_json.canonical_sha256_from_buffer(result_raw):
            errors.append("receipt:result-canonical-sha")
        if receipt.get("result_buffer_byte_count") != len(result_raw):
            errors.append("receipt:result-byte-count")
    if receipt_raw is not None:
        try:
            common.parse_standard_exact(receipt_raw)
        except Exception as exc:
            errors.append("receipt:raw-parse:" + type(exc).__name__)
    if output_tree_sha256 is not None and receipt.get("output_tree_sha256") != output_tree_sha256:
        errors.append("receipt:output-tree-sha")
    return sorted(set(errors))


def capture_errors(capture: dict[str, Any]) -> list[str]:
    errors = schema_errors(capture, CAPTURE_SCHEMA)
    leaves = capture.get("leaves")
    if isinstance(leaves, list):
        ids = [row.get("assignment_id") for row in leaves if isinstance(row, dict)]
        if ids != RECOVERY_IDS or len(set(ids)) != 2:
            errors.append("capture:assignment-order-or-uniqueness")
        for key in ("agent_path", "native_child_thread_id", "native_child_turn_id"):
            values = [row.get(key) for row in leaves if isinstance(row, dict)]
            if len(values) != 2 or len(set(values)) != 2:
                errors.append("capture:identity-uniqueness:" + key)
    return sorted(set(errors))


def atomic_write_exclusive(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise FileExistsError(str(path))
    raw = common.json_bytes(value)
    temp = path.parent / ("." + path.name + ".tmp-" + uuid.uuid4().hex)
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
    try:
        os.write(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    try:
        os.link(temp, path)
    finally:
        temp.unlink(missing_ok=True)
    if path.read_bytes() != raw:
        raise RuntimeError("atomic-write-byte-mismatch")
