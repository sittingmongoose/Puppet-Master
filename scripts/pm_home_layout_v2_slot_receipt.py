#!/usr/bin/env python3
"""Static checks for the Home4 slot and receipt contract (SP-400, Plans/storage-plan.md).

Validates Plans/home_layout_v2_slot_receipt_fixtures.json against
Plans/home_layout_v2_slot_receipt.schema.json and the semantic invariants I1-I9 that its
$comment lists. Every valid case must pass the schema and every invariant; every invalid case
must fail the schema (rejected_by "schema") or pass the schema and fail exactly the named
invariant among others. Fixtures are synthetic: native codecs, redb transactions,
authentication, durability and installation remain NOT_RUN.

usage: python3 scripts/pm_home_layout_v2_slot_receipt.py [--root <repo>]
exit 0 when every case behaves as declared, 1 otherwise.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
import struct
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

SCHEMA = "Plans/home_layout_v2_slot_receipt.schema.json"
FIXTURES = "Plans/home_layout_v2_slot_receipt_fixtures.json"
REFERENCED = (
    "Plans/home_layout_pending_receipt.schema.json",
    "Plans/home_workspace_layout_v2.schema.json",
    "Plans/event_payloads/workspace_layout_changed_v2.schema.json",
    "Plans/event_payloads/workspace_layout_changed.schema.json",
    "Plans/application_workflow_contracts.schema.json",
)
INLINE_LIMIT = 16384
OWNER_RESULT_REF = {
    "path": SCHEMA,
    "json_pointer": "#/$defs/owner_result",
    "schema_id": "pm.home_layout_owner_result.v1",
}
APPLIED = {"prepared", "committed"}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_json(value: Any) -> bytes:
    """RFC 8785 form for the fixture domain (no floats in hashed owner values)."""
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def canonical_msgpack(value: Any) -> bytes:
    """Canonical shortest MessagePack, keys ordered by UTF-8 bytes.

    Same rules as canonical_messagepack_bytes in scripts/pm-implementation-readiness.py.
    """
    def prefix(length: int, fix_base: int, fix_limit: int, code16: int, code32: int) -> bytes:
        if length <= fix_limit:
            return bytes([fix_base | length])
        if length <= 0xFFFF:
            return bytes([code16]) + struct.pack(">H", length)
        return bytes([code32]) + struct.pack(">I", length)

    if value is None:
        return b"\xc0"
    if value is False:
        return b"\xc2"
    if value is True:
        return b"\xc3"
    if isinstance(value, int):
        if 0 <= value <= 0x7F:
            return bytes([value])
        if -32 <= value < 0:
            return bytes([value & 0xFF])
        for low, high, code, fmt in ((0, 0xFF, 0xCC, ">B"), (0, 0xFFFF, 0xCD, ">H"),
                                     (0, 0xFFFFFFFF, 0xCE, ">I"), (0, 0xFFFFFFFFFFFFFFFF, 0xCF, ">Q"),
                                     (-0x80, -33, 0xD0, ">b"), (-0x8000, -0x81, 0xD1, ">h"),
                                     (-0x80000000, -0x8001, 0xD2, ">i"),
                                     (-0x8000000000000000, -0x80000001, 0xD3, ">q")):
            if low <= value <= high:
                return bytes([code]) + struct.pack(fmt, value)
        raise ValueError("integer outside MessagePack range")
    if isinstance(value, float):
        raise ValueError("floats are not part of the canonical capture domain")
    if isinstance(value, str):
        data = value.encode("utf-8")
        n = len(data)
        if n <= 31:
            return bytes([0xA0 | n]) + data
        if n <= 0xFF:
            return b"\xd9" + struct.pack(">B", n) + data
        if n <= 0xFFFF:
            return b"\xda" + struct.pack(">H", n) + data
        return b"\xdb" + struct.pack(">I", n) + data
    if isinstance(value, list):
        return prefix(len(value), 0x90, 15, 0xDC, 0xDD) + b"".join(canonical_msgpack(v) for v in value)
    if isinstance(value, dict):
        items = sorted(value.items(), key=lambda kv: kv[0].encode("utf-8"))
        return prefix(len(items), 0x80, 15, 0xDE, 0xDF) + b"".join(
            canonical_msgpack(k) + canonical_msgpack(v) for k, v in items)
    raise ValueError(f"unsupported value type {type(value).__name__}")


def apply_ops(base: Any, ops: list[dict[str, Any]]) -> Any:
    value = copy.deepcopy(base)
    for op in ops:
        parts = [p.replace("~1", "/").replace("~0", "~") for p in op["path"].lstrip("/").split("/")]
        target = value
        for part in parts[:-1]:
            target = target[int(part)] if isinstance(target, list) else target[part]
        last = parts[-1]
        if op["op"] == "remove":
            del target[int(last) if isinstance(target, list) else last]
        elif op["op"] in ("replace", "add"):
            if isinstance(target, list):
                target[int(last)] = op["value"]
            else:
                target[last] = op["value"]
        else:
            raise ValueError(f"unknown op {op['op']}")
    return value


def digest(binding: dict[str, Any]) -> str:
    return sha(canonical_json([binding["storage_instance_id"], binding["project_id"],
                               binding["workspace_tab_id"], binding["command_instance_id"]]))


def layout_key(binding: dict[str, Any]) -> str:
    return f"home_workspace_layout.v2:{binding['project_id']}:{binding['workspace_tab_id']}"


def event_checks(err: list[str], ev: dict[str, Any], binding: dict[str, Any], d: str) -> dict[str, Any]:
    payload = ev["payload"]
    if payload["command_id"] != binding["command_id"]:
        err.append("I1 event payload command_id differs from the binding")
    if ev["project_id"] != binding["project_id"] or payload["project_id"] != binding["project_id"] \
            or payload["workspace_tab_id"] != binding["workspace_tab_id"]:
        err.append("I3 event names another Project or workspace tab")
    if payload["prior_layout_revision"] != binding["expected_layout_revision"] \
            or payload["new_layout_revision"] != binding["expected_layout_revision"] + 1 \
            or ev["producer_sequence_id"] != payload["new_layout_revision"]:
        err.append("I2 event revision edge is not expected -> expected + 1")
    if payload["correlation_id"] != binding["correlation_id"] or ev["correlation_id"] != binding["correlation_id"] \
            or payload["interaction_transaction_id"] != binding["interaction_transaction_id"]:
        err.append("I4 event correlation or interaction differs from the binding")
    if ev["event_id"] != "evt_workspace_layout_" + d or ev["idempotency_key"] != "workspace.layout_changed:" + d:
        err.append("I5 event id or idempotency key is not formed from the operation digest")
    if ev["actor_ref"] != binding["actor_ref"]:
        err.append("I4 event actor differs from the binding")
    return payload


def binding_checks(err: list[str], binding: dict[str, Any]) -> str:
    d = digest(binding)
    if binding["operation_digest"] != d or binding["operation_ref"] != "home_layout_operation:" + d:
        err.append("I5 operation digest or ref is not the SP-273 recipe")
    return d


def source_bytes_check(err: list[str], name: str, holder: dict[str, Any], layout: Any, layout_sha: Any) -> None:
    src = holder[name]
    if src is None:
        return
    if src["form"] == "inline":
        data = base64.b64decode(src["bytes"], validate=True)
        if len(data) > INLINE_LIMIT:
            err.append(f"I6 {name} inline bytes exceed 16 KiB; a payload_ref is required")
        if sha(data) != layout_sha:
            err.append(f"I6 {name} SHA-256 differs from the layout hash")
        try:
            decoded = json.loads(data.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            decoded = None
        if decoded != layout:
            err.append(f"I6 {name} does not decode to the decoded layout (synthetic adapter)")


def slot_invariants(slot: dict[str, Any]) -> list[str]:
    err: list[str] = []
    prior = slot.get("prior_migration_generation")
    if prior is not None:
        mg = slot["migration_generation"]
        core = prior["core"]
        data = base64.b64decode(prior["core_bytes"], validate=True)
        if data != canonical_msgpack(core) or prior["core_sha256"] != sha(data):
            err.append("I7 core_bytes is not the canonical MessagePack of core, or core_sha256 differs")
        key = f"home_layout_transaction_slot.v1:{slot['project_id']}:{slot['workspace_tab_id']}"
        joins = (prior["logical_key"] == key and prior["storage_instance_id"] == slot["storage_instance_id"]
                 and core["storage_instance_id"] == slot["storage_instance_id"]
                 and core["project_id"] == slot["project_id"] and core["workspace_tab_id"] == slot["workspace_tab_id"]
                 and prior["successor_generation_id"] == mg["generation_id"]
                 and prior["successor_migration_id"] == mg["migration_id"]
                 and prior["successor_migration_completed_at_utc"] == mg["migration_completed_at_utc"]
                 and prior["successor_migration_receipt_key"] == mg["migration_receipt_key"]
                 and prior["successor_migration_receipt_sha256"] == mg["migration_receipt_sha256"])
        if not joins:
            err.append("I9 prior migration wrapper does not join the slot's scope and current migration")
    binding = slot["binding"]
    if binding is None:
        return err
    d = binding_checks(err, binding)
    if binding["storage_instance_id"] != slot["storage_instance_id"] or binding["project_id"] != slot["project_id"] \
            or binding["workspace_tab_id"] != slot["workspace_tab_id"]:
        err.append("I3 binding names another Storage instance, Project or workspace tab")
    for name in ("prior_layout", "candidate_layout"):
        layout = slot[name]
        if layout["project_id"] != slot["project_id"] or layout["workspace_tab_id"] != slot["workspace_tab_id"]:
            err.append(f"I3 {name} belongs to another Project or workspace tab")
    if slot["prior_layout"]["revision"] != binding["expected_layout_revision"] \
            or slot["candidate_layout"]["revision"] != binding["expected_layout_revision"] + 1:
        err.append("I2 slot layouts are not the expected revision and the next one")
    source_bytes_check(err, "prior_layout_source_bytes", slot, slot["prior_layout"], slot["prior_layout_sha256"])
    source_bytes_check(err, "candidate_layout_source_bytes", slot, slot["candidate_layout"], slot["candidate_layout_sha256"])
    custody = slot.get("pending_sir_custody")
    if custody is not None and custody["original_source"]["normalized_request"]["command_id"] != binding["command_id"]:
        err.append("I1 pending SIR custody names another command")
    rb = slot["readback"]
    if rb is not None:
        if rb["canonical_key"] != layout_key(binding):
            err.append("I3 readback key is not this Project's v2 layout key")
        if rb["layout_revision"] != slot["candidate_layout"]["revision"] or rb["layout_sha256"] != slot["candidate_layout_sha256"]:
            err.append("I2 readback does not certify the candidate")
    ev = slot["event_semantics"]
    if ev is not None:
        event_checks(err, ev, binding, d)
    return err


def receipt_invariants(r: dict[str, Any]) -> list[str]:
    err: list[str] = []
    b = r["binding"]
    d = binding_checks(err, b)
    o, dr = r["owner_result"], r["dispatch_receipt"]
    commands = {b["command_id"], o["command_id"], r["original_normalized_request"]["command_id"]}
    for key in ("original_command_outcome", "original_ui_response"):
        if r[key] is not None:
            commands.add(r[key]["command_id"])
    if len(commands) != 1:
        err.append("I1 binding, owner result and original SIR values name different commands")
    if not (r["prior_layout_revision"] == b["expected_layout_revision"] == o["prior_layout_revision"]):
        err.append("I2 prior revision differs from the expected revision")
    if r["state"] in APPLIED:
        edge = b["expected_layout_revision"] + 1
        if not (r["new_layout_revision"] == o["new_layout_revision"] == edge and r["readback"]["layout_revision"] == edge):
            err.append("I2 applied revision edge is not expected -> expected + 1")
        if r["readback"]["canonical_key"] != layout_key(b):
            err.append("I3 readback key is not this Project's v2 layout key")
        if r["readback"]["layout_sha256"] != r["settled_layout_sha256"] or r["settled_layout_ref"] != "home_layout_settlement:" + d:
            err.append("I4 settlement does not join the readback or the operation digest")
    if o["operation_ref"] != b["operation_ref"] or o["result_ref"] != "home_layout_result:" + d \
            or dr["receipt_ref"] != "home_layout_dispatch_receipt:" + d or dr["operation_ref"] != b["operation_ref"]:
        err.append("I5 result or receipt ref is not formed from the operation digest")
    if dr["command_result_ref"] != o["result_ref"] or dr["correlation_id"] != b["correlation_id"] \
            or dr["dispatch_ref"] != b["dispatch_ref"]:
        err.append("I4 dispatch receipt does not join the result, correlation or dispatch")
    ev = r["event_semantics"]
    if ev is not None:
        payload = event_checks(err, ev, b, d)
        if payload["command_result_ref"] != o["result_ref"] or payload["receipt_refs"] != [dr["receipt_ref"]] \
                or payload["settled_layout_ref"] != r["settled_layout_ref"]:
            err.append("I4 event payload does not join the result, receipt or settlement")
        if r["state"] == "committed" and (o["event_ref"] != ev["event_id"] or dr["event_ref"] != ev["event_id"]):
            err.append("I4 committed result and receipt do not name the event")
    for key, original in (("normalized_request", r["original_normalized_request"]),
                          ("command_outcome", r["original_command_outcome"]),
                          ("ui_response", r["original_ui_response"])):
        captured = r["identity_capture_bytes"][key]
        if original is None or captured is None:
            if original is not None or captured is not None or r["identity_capture_bytes_sha256"][key] is not None:
                err.append(f"I7 identity capture {key} presence differs from its original")
            continue
        data = base64.b64decode(captured, validate=True)
        if data != canonical_msgpack(original) or r["identity_capture_bytes_sha256"][key] != sha(data):
            err.append(f"I7 identity capture {key} is not the canonical MessagePack of its original")
    outcome = r["original_command_outcome"]
    if outcome is not None:
        if outcome["owner_result_schema_ref"] != OWNER_RESULT_REF:
            err.append("I8 SIR outcome does not point at the Home4 owner result")
        if not (outcome["owner_result_sha256"] == r["original_owner_result_sha256"] == sha(canonical_json(o))):
            err.append("I8 owner result hash is not the CV-333 hash of the Home-owned owner result")
    response = r["original_ui_response"]
    if response is not None and response.get("owner_result_schema_ref") not in (None, OWNER_RESULT_REF):
        err.append("I8 UI response does not point at the Home4 owner result")
    return err


def load(root: Path, rel: str) -> Any:
    return json.loads((root / rel).read_text(encoding="utf-8"))


def run(root: Path) -> dict[str, Any]:
    schema = load(root, SCHEMA)
    Draft202012Validator.check_schema(schema)
    registry = Registry()
    for rel in (SCHEMA,) + REFERENCED:
        doc = load(root, rel)
        registry = registry.with_resource(doc["$id"], Resource.from_contents(doc))
    validators = {name: Draft202012Validator({"$ref": schema["$id"] + "#/$defs/" + name},
                                             registry=registry, format_checker=FormatChecker())
                  for name in ("transaction_slot", "operation_receipt", "prior_slot_migration_generation")}
    fixtures = load(root, FIXTURES)
    valid = {c["id"]: c for c in fixtures["valid"]}
    failures: list[dict[str, Any]] = []
    counts = {"positive": 0, "schema_negative": 0, "invariant_negative": 0}

    def semantic(defn: str, value: Any) -> list[str]:
        if defn == "transaction_slot":
            return slot_invariants(value)
        if defn == "operation_receipt":
            return receipt_invariants(value)
        return []

    for case in fixtures["valid"]:
        errors = [e.message[:200] for e in validators[case["definition"]].iter_errors(case["value"])]
        if not errors:
            errors = semantic(case["definition"], case["value"])
        if errors:
            failures.append({"id": case["id"], "expected": "accept", "errors": errors[:5]})
        counts["positive"] += 1
    for case in fixtures["invalid"]:
        base = valid[case["base"]]
        value = apply_ops(base["value"], case["ops"])
        schema_errors = [e.message[:200] for e in validators[base["definition"]].iter_errors(value)]
        if case["rejected_by"] == "schema":
            counts["schema_negative"] += 1
            if not schema_errors:
                failures.append({"id": case["id"], "expected": "schema rejection", "errors": []})
            continue
        counts["invariant_negative"] += 1
        if schema_errors:
            failures.append({"id": case["id"], "expected": f"schema-valid, {case['rejected_by']} rejection",
                             "errors": schema_errors[:3]})
            continue
        found = semantic(base["definition"], value)
        if not any(e.startswith(case["rejected_by"] + " ") for e in found):
            failures.append({"id": case["id"], "expected": f"{case['rejected_by']} rejection", "errors": found[:5]})
    return {
        "schema_id": "pm.home_layout_v2_slot_receipt.static_report.v1",
        "status": "pass" if not failures else "fail",
        "counts": counts,
        "failures": failures,
        "native_execution": "NOT_RUN",
        "claim_boundary": "Synthetic schema and joined-value checks of the Home4 contract only; no native codec, redb transaction, authentication, durability, installation or admission proof.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    report = run(args.root.resolve())
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
